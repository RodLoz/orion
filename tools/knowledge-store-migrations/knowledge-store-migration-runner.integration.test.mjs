import { mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { randomBytes } from "node:crypto";
import pg from "pg";
import { afterEach, describe, expect, it } from "vitest";

import {
  InvalidMigrationStateError,
  MigrationChecksumMismatchError,
  MigrationExecutionError,
  runKnowledgeStoreMigrations,
} from "./knowledge-store-migration-runner.mjs";

const adminUrl = process.env.ORION_TEST_POSTGRES_ADMIN_URL;
const { Pool } = pg;
const integrationDescribe = adminUrl === undefined ? describe.skip : describe;
const resources = [];
const migrationPath = new URL(
  "./migrations/0001_initial_knowledge_store.sql",
  import.meta.url,
);

afterEach(async () => {
  while (resources.length > 0) {
    await resources.pop()();
  }
});

integrationDescribe.sequential(
  "Knowledge Store PostgreSQL 16 migration integration",
  () => {
    it("self-bootstraps 0001, verifies its schema, and is idempotent", async () => {
      const fixture = await databaseFixture();

      await expect(
        runKnowledgeStoreMigrations(fixture.runnerOptions),
      ).resolves.toEqual({ status: "applied", appliedMigration: "0001" });
      await expect(
        runKnowledgeStoreMigrations(fixture.runnerOptions),
      ).resolves.toEqual({ status: "current", appliedMigration: null });

      const ledger = await fixture.pool.query(
        "SELECT migration_id, octet_length(checksum) AS checksum_bytes FROM knowledge.schema_migration",
      );
      expect(ledger.rows).toEqual([
        { migration_id: "0001", checksum_bytes: 32 },
      ]);

      const constraints = await fixture.pool.query(
        `SELECT conname FROM pg_catalog.pg_constraint AS c
          JOIN pg_catalog.pg_namespace AS n ON n.oid = c.connamespace
         WHERE n.nspname = 'knowledge'`,
      );
      const constraintNames = new Set(
        constraints.rows.map((row) => row.conname),
      );
      for (const name of [
        "schema_migration_id_pk",
        "schema_migration_id_format_ck",
        "schema_migration_checksum_nonempty_ck",
        "knowledge_record_identity_pk",
        "knowledge_record_predecessor_fk",
        "knowledge_record_binary_encoding_ck",
        "knowledge_record_source_type_ck",
        "knowledge_record_acceptance_method_ck",
        "knowledge_record_timestamp_shape_ck",
        "knowledge_record_version_range_ck",
        "knowledge_record_not_self_predecessor_ck",
        "knowledge_record_proposition_shape_ck",
        "knowledge_lifecycle_identity_pk",
        "knowledge_lifecycle_record_fk",
        "knowledge_lifecycle_standing_ck",
        "knowledge_lifecycle_acceptance_order_format_ck",
        "knowledge_lifecycle_acceptance_order_uq",
        "knowledge_lifecycle_canonical_order_uq",
      ]) {
        expect(constraintNames).toContain(name);
      }

      const relations = await fixture.pool.query(
        `SELECT c.relname, c.relkind FROM pg_catalog.pg_class AS c
          JOIN pg_catalog.pg_namespace AS n ON n.oid = c.relnamespace
         WHERE n.nspname = 'knowledge'`,
      );
      const relationKeys = new Set(
        relations.rows.map((row) => `${row.relname}:${row.relkind}`),
      );
      expect(relationKeys).toContain("knowledge_acceptance_order_seq:S");
      expect(relationKeys).toContain(
        "knowledge_lifecycle_canonical_order_seq:S",
      );
      expect(relationKeys).toContain("knowledge_record_one_successor_uq:i");

      await assertSchemaColumns(fixture.pool);
      await assertRuntimePermissions(fixture);
      await assertStringDomainAndConstraints(fixture.pool);
    });

    it("fails closed for an empty pre-existing knowledge namespace", async () => {
      const fixture = await databaseFixture();
      await fixture.pool.query("CREATE SCHEMA knowledge");

      await expect(
        runKnowledgeStoreMigrations(fixture.runnerOptions),
      ).rejects.toBeInstanceOf(InvalidMigrationStateError);
    });

    it("fails closed for an incompatible pre-existing ledger", async () => {
      const fixture = await databaseFixture();
      await fixture.pool.query("CREATE SCHEMA knowledge");
      await fixture.pool.query(
        "CREATE TABLE knowledge.schema_migration (migration_id integer PRIMARY KEY)",
      );

      await expect(
        runKnowledgeStoreMigrations(fixture.runnerOptions),
      ).rejects.toBeInstanceOf(InvalidMigrationStateError);
    });

    it("rolls back ledger and schema when migration SQL fails", async () => {
      const fixture = await databaseFixture();
      const directory = await temporaryMigrationDirectory(
        `${await readFile(migrationPath, "utf8")}\nSELECT 1 / 0;\n`,
      );

      await expect(
        runKnowledgeStoreMigrations({
          ...fixture.runnerOptions,
          migrationsDirectory: directory,
        }),
      ).rejects.toBeInstanceOf(MigrationExecutionError);
      await expect(schemaExists(fixture.pool)).resolves.toBe(false);
    });

    it("rolls back all DDL when ledger insertion fails", async () => {
      const fixture = await databaseFixture();
      const artifact = await readFile(migrationPath, "utf8");
      const trigger = `
CREATE FUNCTION knowledge.reject_ledger_insert() RETURNS trigger
LANGUAGE plpgsql AS $$ BEGIN RAISE EXCEPTION 'test ledger failure'; END $$;
CREATE TRIGGER reject_ledger_insert
BEFORE INSERT ON knowledge.schema_migration
FOR EACH ROW EXECUTE FUNCTION knowledge.reject_ledger_insert();
`;
      const directory = await temporaryMigrationDirectory(
        `${artifact}${trigger}`,
      );

      await expect(
        runKnowledgeStoreMigrations({
          ...fixture.runnerOptions,
          migrationsDirectory: directory,
        }),
      ).rejects.toBeInstanceOf(MigrationExecutionError);
      await expect(schemaExists(fixture.pool)).resolves.toBe(false);
    });

    it("fails closed for checksum mismatch and unknown ledger history", async () => {
      const fixture = await databaseFixture();
      await runKnowledgeStoreMigrations(fixture.runnerOptions);

      const modifiedDirectory = await temporaryMigrationDirectory(
        `${await readFile(migrationPath, "utf8")}\n-- checksum mismatch\n`,
      );
      await expect(
        runKnowledgeStoreMigrations({
          ...fixture.runnerOptions,
          migrationsDirectory: modifiedDirectory,
        }),
      ).rejects.toBeInstanceOf(MigrationChecksumMismatchError);

      await fixture.pool.query(
        "INSERT INTO knowledge.schema_migration (migration_id, checksum) VALUES ('0003', decode('01', 'hex'))",
      );
      await expect(
        runKnowledgeStoreMigrations(fixture.runnerOptions),
      ).rejects.toBeInstanceOf(InvalidMigrationStateError);
    });

    it.each([
      ["superuser", "ALTER ROLE %ROLE% SUPERUSER"],
      ["database creation", "ALTER ROLE %ROLE% CREATEDB"],
      ["role management", "ALTER ROLE %ROLE% CREATEROLE"],
      ["replication", "ALTER ROLE %ROLE% REPLICATION"],
      ["row-security bypass", "ALTER ROLE %ROLE% BYPASSRLS"],
    ])(
      "rejects a runtime role with prohibited %s authority",
      async (_, sql) => {
        const fixture = await databaseFixture();
        await fixture.admin.query(
          sql.replace("%ROLE%", `"${fixture.runtimeRole}"`),
        );

        await expect(
          runKnowledgeStoreMigrations(fixture.runnerOptions),
        ).rejects.toBeInstanceOf(InvalidMigrationStateError);
        await expect(schemaExists(fixture.pool)).resolves.toBe(false);
      },
    );

    it("rejects direct record SELECT grant option and proves it can delegate", async () => {
      const fixture = await migratedFixture();
      const recipientRole = `${fixture.runtimeRole}_recipient`;
      fixture.additionalRoles.push(recipientRole);
      await fixture.admin.query(`CREATE ROLE "${recipientRole}" NOLOGIN`);
      await fixture.pool.query(
        `GRANT SELECT ON knowledge.knowledge_record TO "${fixture.runtimeRole}" WITH GRANT OPTION`,
      );

      const delegationClient = await fixture.pool.connect();
      try {
        await delegationClient.query(`SET ROLE "${fixture.runtimeRole}"`);
        await delegationClient.query(
          `GRANT SELECT ON knowledge.knowledge_record TO "${recipientRole}"`,
        );
      } finally {
        await delegationClient.query("RESET ROLE");
        delegationClient.release();
      }
      const delegated = await fixture.pool.query(
        `SELECT has_table_privilege($1, 'knowledge.knowledge_record', 'SELECT') AS present`,
        [recipientRole],
      );
      expect(delegated.rows[0].present).toBe(true);
      await expect(
        runKnowledgeStoreMigrations(fixture.runnerOptions),
      ).rejects.toBeInstanceOf(InvalidMigrationStateError);
    });

    it.each([
      [
        "lifecycle standing UPDATE grant option",
        (fixture) =>
          fixture.pool.query(
            `GRANT UPDATE (standing) ON knowledge.knowledge_lifecycle TO "${fixture.runtimeRole}" WITH GRANT OPTION`,
          ),
      ],
      [
        "acceptance sequence USAGE grant option",
        (fixture) =>
          fixture.pool.query(
            `GRANT USAGE ON SEQUENCE knowledge.knowledge_acceptance_order_seq TO "${fixture.runtimeRole}" WITH GRANT OPTION`,
          ),
      ],
    ])("rejects %s", async (_, grantOption) => {
      const fixture = await migratedFixture();
      await grantOption(fixture);

      await expect(
        runKnowledgeStoreMigrations(fixture.runnerOptions),
      ).rejects.toBeInstanceOf(InvalidMigrationStateError);
    });

    it.each([
      ["inherited", "WITH INHERIT TRUE, SET FALSE"],
      ["SET ROLE reachable", "WITH INHERIT FALSE, SET TRUE"],
    ])("rejects %s grant-option authority", async (_, membershipOptions) => {
      const fixture = await migratedFixture();
      const parentRole = `${fixture.runtimeRole}_grantor`;
      fixture.additionalRoles.push(parentRole);
      await fixture.admin.query(`CREATE ROLE "${parentRole}" NOLOGIN`);
      await fixture.pool.query(
        `GRANT SELECT ON knowledge.knowledge_record TO "${parentRole}" WITH GRANT OPTION`,
      );
      await fixture.admin.query(
        `GRANT "${parentRole}" TO "${fixture.runtimeRole}" ${membershipOptions}`,
      );

      await expect(
        runKnowledgeStoreMigrations(fixture.runnerOptions),
      ).rejects.toBeInstanceOf(InvalidMigrationStateError);
    });

    it("rejects a runtime role that owns the target database", async () => {
      const fixture = await databaseFixture();
      await fixture.admin.query(
        `ALTER DATABASE "${fixture.database}" OWNER TO "${fixture.runtimeRole}"`,
      );

      await expect(
        runKnowledgeStoreMigrations(fixture.runnerOptions),
      ).rejects.toBeInstanceOf(InvalidMigrationStateError);
      await expect(schemaExists(fixture.pool)).resolves.toBe(false);
    });

    it("rejects runtime role-membership administration authority", async () => {
      const fixture = await databaseFixture();
      const managedRole = `${fixture.runtimeRole}_managed`;
      fixture.additionalRoles.push(managedRole);
      await fixture.admin.query(`CREATE ROLE "${managedRole}" NOLOGIN`);
      await fixture.admin.query(
        `GRANT "${managedRole}" TO "${fixture.runtimeRole}" WITH ADMIN OPTION`,
      );

      await expect(
        runKnowledgeStoreMigrations(fixture.runnerOptions),
      ).rejects.toBeInstanceOf(InvalidMigrationStateError);
      await expect(schemaExists(fixture.pool)).resolves.toBe(false);
    });

    it.each([
      [
        "schema ownership",
        (fixture) =>
          fixture.pool.query(
            `ALTER SCHEMA knowledge OWNER TO "${fixture.runtimeRole}"`,
          ),
      ],
      [
        "a prohibited direct grant",
        (fixture) =>
          fixture.pool.query(
            `GRANT DELETE ON knowledge.knowledge_record TO "${fixture.runtimeRole}"`,
          ),
      ],
      [
        "a prohibited PUBLIC grant",
        (fixture) =>
          fixture.pool.query(
            "GRANT DELETE ON knowledge.knowledge_record TO PUBLIC",
          ),
      ],
      [
        "a missing required grant",
        (fixture) =>
          fixture.pool.query(
            `REVOKE INSERT ON knowledge.knowledge_record FROM "${fixture.runtimeRole}"`,
          ),
      ],
      [
        "a prohibited inherited grant",
        async (fixture) => {
          const parentRole = `${fixture.runtimeRole}_parent`;
          fixture.additionalRoles.push(parentRole);
          await fixture.admin.query(`CREATE ROLE "${parentRole}" NOLOGIN`);
          await fixture.pool.query(
            `GRANT DELETE ON knowledge.knowledge_record TO "${parentRole}"`,
          );
          await fixture.admin.query(
            `GRANT "${parentRole}" TO "${fixture.runtimeRole}"`,
          );
        },
      ],
    ])(
      "rejects an existing schema when the runtime role has %s",
      async (_, mutate) => {
        const fixture = await migratedFixture();
        await mutate(fixture);

        await expect(
          runKnowledgeStoreMigrations(fixture.runnerOptions),
        ).rejects.toBeInstanceOf(InvalidMigrationStateError);
      },
    );

    it.each([
      [
        "a same-name primary key on the wrong ledger column",
        `ALTER TABLE knowledge.schema_migration
           DROP CONSTRAINT schema_migration_id_pk;
         ALTER TABLE knowledge.schema_migration
           ADD CONSTRAINT schema_migration_id_pk PRIMARY KEY (checksum)`,
      ],
      [
        "a same-name weakened migration identifier check",
        `ALTER TABLE knowledge.schema_migration
           DROP CONSTRAINT schema_migration_id_format_ck;
         ALTER TABLE knowledge.schema_migration
           ADD CONSTRAINT schema_migration_id_format_ck
           CHECK (migration_id <> '0000')`,
      ],
      [
        "a same-name weakened checksum check",
        `ALTER TABLE knowledge.schema_migration
           DROP CONSTRAINT schema_migration_checksum_nonempty_ck;
         ALTER TABLE knowledge.schema_migration
           ADD CONSTRAINT schema_migration_checksum_nonempty_ck
           CHECK (octet_length(checksum) >= 0)`,
      ],
    ])("rejects %s", async (_, corruption) => {
      const fixture = await migratedFixture();
      await fixture.pool.query(corruption);

      await expect(
        runKnowledgeStoreMigrations(fixture.runnerOptions),
      ).rejects.toBeInstanceOf(InvalidMigrationStateError);
    });

    it.each([
      [
        "a wrong column type",
        `ALTER TABLE knowledge.knowledge_record
           ALTER COLUMN provenance_source_type TYPE varchar(64) COLLATE "C"`,
      ],
      [
        "a wrong nullability",
        `ALTER TABLE knowledge.knowledge_record
           ALTER COLUMN claim DROP NOT NULL`,
      ],
      [
        "a wrong governed default",
        `ALTER TABLE knowledge.schema_migration
           ALTER COLUMN applied_at SET DEFAULT statement_timestamp()`,
      ],
      [
        "a wrong collation",
        `ALTER TABLE knowledge.knowledge_lifecycle
           ALTER COLUMN standing TYPE text COLLATE "default"`,
      ],
      [
        "a wrong identity relationship",
        `ALTER TABLE knowledge.knowledge_lifecycle
           ALTER COLUMN canonical_order DROP IDENTITY`,
      ],
      [
        "a same-name FK with the wrong delete action",
        `ALTER TABLE knowledge.knowledge_lifecycle
           DROP CONSTRAINT knowledge_lifecycle_record_fk;
         ALTER TABLE knowledge.knowledge_lifecycle
           ADD CONSTRAINT knowledge_lifecycle_record_fk
           FOREIGN KEY (knowledge_identity)
           REFERENCES knowledge.knowledge_record (knowledge_identity)
           ON UPDATE RESTRICT ON DELETE CASCADE`,
      ],
      [
        "a same-name FK targeting the wrong column",
        `ALTER TABLE knowledge.knowledge_record
           DROP CONSTRAINT knowledge_record_predecessor_fk;
         ALTER TABLE knowledge.knowledge_record
           ADD CONSTRAINT knowledge_record_claim_uq UNIQUE (claim);
         ALTER TABLE knowledge.knowledge_record
           ADD CONSTRAINT knowledge_record_predecessor_fk
           FOREIGN KEY (supersedes_knowledge_identity)
           REFERENCES knowledge.knowledge_record (claim)
           ON UPDATE RESTRICT ON DELETE RESTRICT`,
      ],
      [
        "a same-name weakened standing check",
        `ALTER TABLE knowledge.knowledge_lifecycle
           DROP CONSTRAINT knowledge_lifecycle_standing_ck;
         ALTER TABLE knowledge.knowledge_lifecycle
           ADD CONSTRAINT knowledge_lifecycle_standing_ck CHECK (true)`,
      ],
      [
        "a same-name unique constraint with the wrong key",
        `ALTER TABLE knowledge.knowledge_lifecycle
           DROP CONSTRAINT knowledge_lifecycle_acceptance_order_uq;
         ALTER TABLE knowledge.knowledge_lifecycle
           ADD CONSTRAINT knowledge_lifecycle_acceptance_order_uq
           UNIQUE (standing)`,
      ],
      [
        "a same-name branch index with the wrong predicate",
        `DROP INDEX knowledge.knowledge_record_one_successor_uq;
         CREATE UNIQUE INDEX knowledge_record_one_successor_uq
           ON knowledge.knowledge_record (supersedes_knowledge_identity)
           WHERE false`,
      ],
      [
        "an incompatible acceptance allocator",
        `ALTER SEQUENCE knowledge.knowledge_acceptance_order_seq INCREMENT BY 2`,
      ],
    ])("rejects an existing schema with %s", async (_, corruption) => {
      const fixture = await migratedFixture();
      await fixture.pool.query(corruption);

      await expect(
        runKnowledgeStoreMigrations(fixture.runnerOptions),
      ).rejects.toBeInstanceOf(InvalidMigrationStateError);
    });

    it("rejects a governed index with a different compatible B-tree operator class", async () => {
      const fixture = await migratedFixture();
      await fixture.pool.query(`
        CREATE OPERATOR CLASS public.orion_test_bytea_ops
          FOR TYPE bytea USING btree AS
          OPERATOR 1 < (bytea, bytea),
          OPERATOR 2 <= (bytea, bytea),
          OPERATOR 3 = (bytea, bytea),
          OPERATOR 4 >= (bytea, bytea),
          OPERATOR 5 > (bytea, bytea),
          FUNCTION 1 pg_catalog.byteacmp(bytea, bytea);
        DROP INDEX knowledge.knowledge_record_one_successor_uq;
        CREATE UNIQUE INDEX knowledge_record_one_successor_uq
          ON knowledge.knowledge_record
          USING btree (supersedes_knowledge_identity public.orion_test_bytea_ops)
          WHERE supersedes_knowledge_identity IS NOT NULL;
      `);

      await expect(
        runKnowledgeStoreMigrations(fixture.runnerOptions),
      ).rejects.toBeInstanceOf(InvalidMigrationStateError);
    });
  },
);

async function assertStringDomainAndConstraints(pool) {
  const identities = [
    "\u0000",
    "e\u0301",
    "\u00e9",
    "Case",
    "case",
    "\ud800",
    "\udc00",
    "\ud83d\ude00",
    "x".repeat(128),
  ].map(encodeJsUtf16Be);

  for (let index = 0; index < identities.length; index += 1) {
    await insertRecord(pool, identities[index], index + 1);
  }
  const stored = await pool.query(
    "SELECT knowledge_identity FROM knowledge.knowledge_record ORDER BY version",
  );
  expect(stored.rows.map((row) => Buffer.from(row.knowledge_identity))).toEqual(
    identities,
  );

  await expect(insertRecord(pool, identities[0], 99)).rejects.toMatchObject({
    constraint: "knowledge_record_identity_pk",
  });
  await expect(
    pool.query(
      "UPDATE knowledge.knowledge_lifecycle SET standing = 'invalid' WHERE knowledge_identity = $1",
      [identities[0]],
    ),
  ).rejects.toMatchObject({ constraint: "knowledge_lifecycle_standing_ck" });
  await expect(
    pool.query(
      "INSERT INTO knowledge.knowledge_lifecycle (knowledge_identity, standing, acceptance_order) VALUES ($1, 'current', 'bad-token')",
      [identities[1]],
    ),
  ).rejects.toMatchObject({
    constraint: "knowledge_lifecycle_acceptance_order_format_ck",
  });
  const duplicateTokenIdentity = encodeJsUtf16Be("duplicate-token-record");
  await pool.query(
    `${recordInsertSql} RETURNING knowledge_identity`,
    recordValues(duplicateTokenIdentity, 100, null),
  );
  await expect(
    insertLifecycle(pool, duplicateTokenIdentity, "knowledge-acceptance-v1:1"),
  ).rejects.toMatchObject({
    constraint: "knowledge_lifecycle_acceptance_order_uq",
  });

  const self = encodeJsUtf16Be("self");
  await expect(insertRecord(pool, self, 200, self)).rejects.toMatchObject({
    constraint: "knowledge_record_not_self_predecessor_ck",
  });

  const predecessor = identities[0];
  const successorA = encodeJsUtf16Be("successor-a");
  const successorB = encodeJsUtf16Be("successor-b");
  await insertRecord(pool, successorA, 201, predecessor);
  await expect(
    insertRecord(pool, successorB, 202, predecessor),
  ).rejects.toMatchObject({ constraint: "knowledge_record_one_successor_uq" });

  await expect(
    pool.query(
      `${recordInsertSql}
       RETURNING knowledge_identity`,
      recordValues(encodeJsUtf16Be("partial-proposition"), 203, null, {
        propositionIdentity: encodeJsUtf16Be("prop"),
      }),
    ),
  ).rejects.toMatchObject({
    constraint: "knowledge_record_proposition_shape_ck",
  });

  await expect(
    insertLifecycle(
      pool,
      encodeJsUtf16Be("missing-record"),
      "knowledge-acceptance-v1:999",
    ),
  ).rejects.toMatchObject({ constraint: "knowledge_lifecycle_record_fk" });
}

async function assertRuntimePermissions({ pool, runtimeRole }) {
  const result = await pool.query(
    `SELECT
       has_schema_privilege($1, 'knowledge', 'USAGE') AS schema_usage,
       has_schema_privilege($1, 'knowledge', 'CREATE') AS schema_create,
       has_table_privilege($1, 'knowledge.knowledge_record', 'SELECT,INSERT') AS record_write,
       has_table_privilege($1, 'knowledge.knowledge_record', 'UPDATE') AS record_update,
       has_table_privilege($1, 'knowledge.knowledge_record', 'DELETE') AS record_delete,
       has_table_privilege($1, 'knowledge.knowledge_lifecycle', 'DELETE') AS lifecycle_delete,
       has_column_privilege($1, 'knowledge.knowledge_lifecycle', 'standing', 'UPDATE') AS standing_update,
       has_column_privilege($1, 'knowledge.knowledge_lifecycle', 'acceptance_order', 'UPDATE') AS order_update,
       has_table_privilege($1, 'knowledge.schema_migration', 'INSERT,UPDATE,DELETE') AS ledger_mutation,
       has_sequence_privilege($1, 'knowledge.knowledge_acceptance_order_seq', 'USAGE') AS acceptance_allocator,
       has_sequence_privilege($1, 'knowledge.knowledge_lifecycle_canonical_order_seq', 'USAGE') AS canonical_allocator`,
    [runtimeRole],
  );
  expect(result.rows[0]).toEqual({
    schema_usage: true,
    schema_create: false,
    record_write: true,
    record_update: false,
    record_delete: false,
    lifecycle_delete: false,
    standing_update: true,
    order_update: false,
    ledger_mutation: false,
    acceptance_allocator: true,
    canonical_allocator: true,
  });
}

async function assertSchemaColumns(pool) {
  const result = await pool.query(
    `SELECT table_name, column_name, data_type, is_nullable, collation_name, identity_generation
       FROM information_schema.columns
      WHERE table_schema = 'knowledge'
      ORDER BY table_name, ordinal_position`,
  );
  const byTable = Map.groupBy(result.rows, (row) => row.table_name);
  expect(byTable.get("schema_migration")).toHaveLength(3);
  expect(byTable.get("knowledge_record")).toHaveLength(19);
  expect(byTable.get("knowledge_lifecycle")).toHaveLength(4);

  for (const row of result.rows) {
    if (row.data_type === "text") expect(row.collation_name).toBe("C");
  }
  expect(
    byTable
      .get("knowledge_record")
      .find((row) => row.column_name === "knowledge_identity"),
  ).toMatchObject({ data_type: "bytea", is_nullable: "NO" });
  expect(
    byTable
      .get("knowledge_lifecycle")
      .find((row) => row.column_name === "canonical_order"),
  ).toMatchObject({
    data_type: "bigint",
    is_nullable: "NO",
    identity_generation: "ALWAYS",
  });

  const branchIndex = await pool.query(
    `SELECT indexdef FROM pg_catalog.pg_indexes
      WHERE schemaname = 'knowledge'
        AND indexname = 'knowledge_record_one_successor_uq'`,
  );
  expect(branchIndex.rows[0].indexdef).toContain("CREATE UNIQUE INDEX");
  expect(branchIndex.rows[0].indexdef).toContain(
    "WHERE (supersedes_knowledge_identity IS NOT NULL)",
  );
}

const recordInsertSql = `INSERT INTO knowledge.knowledge_record (
  knowledge_identity, claim, provenance_source_type,
  provenance_originating_capability, provenance_observed_at,
  acceptance_method, acceptance_authority_identifier, acceptance_reason,
  accepted_at, version, supersedes_knowledge_identity,
  proposition_identity, proposition_subject_key, proposition_predicate_key,
  proposition_textual_scalar, proposition_currentness_owner,
  proposition_applicable_owner, proposition_source_relationship
) VALUES (
  $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11,
  $12, $13, $14, $15, $16, $17, $18
)`;

async function insertRecord(pool, identity, version, predecessor = null) {
  const result = await pool.query(
    `${recordInsertSql} RETURNING knowledge_identity`,
    recordValues(identity, version, predecessor),
  );
  if (predecessor === null) {
    await insertLifecycle(pool, identity, `knowledge-acceptance-v1:${version}`);
  }
  return result;
}

function recordValues(identity, version, predecessor, proposition = {}) {
  const text = encodeJsUtf16Be("value");
  return [
    identity,
    text,
    "manual-assertion",
    text,
    "2026-08-23T00:00:00Z",
    "explicit-authority-review",
    text,
    text,
    "2026-08-23T00:00:00.000Z",
    version,
    predecessor,
    proposition.propositionIdentity ?? null,
    null,
    null,
    null,
    null,
    null,
    null,
  ];
}

function insertLifecycle(pool, identity, acceptanceOrder) {
  return pool.query(
    "INSERT INTO knowledge.knowledge_lifecycle (knowledge_identity, standing, acceptance_order) VALUES ($1, 'current', $2)",
    [identity, acceptanceOrder],
  );
}

function encodeJsUtf16Be(value) {
  const bytes = Buffer.alloc(value.length * 2);
  for (let index = 0; index < value.length; index += 1) {
    bytes.writeUInt16BE(value.charCodeAt(index), index * 2);
  }
  return bytes;
}

async function databaseFixture() {
  const suffix = randomBytes(8).toString("hex");
  const database = `orion_kstore_${suffix}`;
  const runtimeRole = `orion_kstore_runtime_${suffix}`;
  const admin = new Pool({ connectionString: adminUrl, max: 1 });
  await admin.query(`CREATE ROLE "${runtimeRole}" NOLOGIN`);
  await admin.query(`CREATE DATABASE "${database}"`);
  const databaseUrl = new URL(adminUrl);
  databaseUrl.pathname = `/${database}`;
  const pool = new Pool({ connectionString: databaseUrl.toString(), max: 2 });
  const additionalRoles = [];

  resources.push(async () => {
    await pool.end();
    await admin.query(
      "SELECT pg_terminate_backend(pid) FROM pg_stat_activity WHERE datname = $1",
      [database],
    );
    await admin.query(`DROP DATABASE IF EXISTS "${database}"`);
    await admin.query(`DROP ROLE IF EXISTS "${runtimeRole}"`);
    for (const role of additionalRoles) {
      await admin.query(`DROP ROLE IF EXISTS "${role}"`);
    }
    await admin.end();
  });

  return {
    pool,
    admin,
    database,
    runtimeRole,
    additionalRoles,
    runnerOptions: { pool, runtimeRole },
  };
}

async function migratedFixture() {
  const fixture = await databaseFixture();
  await runKnowledgeStoreMigrations(fixture.runnerOptions);
  return fixture;
}

async function temporaryMigrationDirectory(sql) {
  const directory = await mkdtemp(join(tmpdir(), "orion-kstore-integration-"));
  await writeFile(join(directory, "0001_initial_knowledge_store.sql"), sql);
  resources.push(() => rm(directory, { recursive: true, force: true }));
  return directory;
}

async function schemaExists(pool) {
  const result = await pool.query(
    "SELECT pg_catalog.to_regnamespace('knowledge') IS NOT NULL AS present",
  );
  return result.rows[0].present;
}
