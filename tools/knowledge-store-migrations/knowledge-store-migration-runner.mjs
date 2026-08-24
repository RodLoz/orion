import { createHash } from "node:crypto";
import { readdir, readFile } from "node:fs/promises";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";

export const MIGRATION_CHECKSUM_ALGORITHM = "sha256";
export const MIGRATION_LEDGER_OBJECT = "knowledge.schema_migration";
export const MIGRATION_TRANSACTION_MODE = "transactional";

const defaultMigrationsDirectory = fileURLToPath(
  new URL("./migrations/", import.meta.url),
);
const migrationFilePattern = /^(\d{4})_[a-z0-9]+(?:_[a-z0-9]+)*\.sql$/;
const migrationIdentifierPattern = /^[0-9]{4}$/;
const governedRelationNames = Object.freeze([
  "knowledge_acceptance_order_seq:S:p",
  "knowledge_lifecycle:r:p",
  "knowledge_lifecycle_acceptance_order_uq:i:p",
  "knowledge_lifecycle_canonical_order_seq:S:p",
  "knowledge_lifecycle_canonical_order_uq:i:p",
  "knowledge_lifecycle_identity_pk:i:p",
  "knowledge_record:r:p",
  "knowledge_record_identity_pk:i:p",
  "knowledge_record_one_successor_uq:i:p",
  "schema_migration:r:p",
  "schema_migration_id_pk:i:p",
]);
const expectedColumns = Object.freeze({
  knowledge_lifecycle: Object.freeze([
    ["knowledge_identity", "bytea", true, null, null, ""],
    ["standing", "text", true, "C", null, ""],
    ["acceptance_order", "text", true, "C", null, ""],
    ["canonical_order", "bigint", true, null, null, "a"],
  ]),
  knowledge_record: Object.freeze([
    ["knowledge_identity", "bytea", true, null, null, ""],
    ["claim", "bytea", true, null, null, ""],
    ["provenance_source_type", "text", true, "C", null, ""],
    ["provenance_originating_capability", "bytea", true, null, null, ""],
    ["provenance_observed_at", "text", true, "C", null, ""],
    ["provenance_source_reference", "bytea", false, null, null, ""],
    ["acceptance_method", "text", true, "C", null, ""],
    ["acceptance_authority_identifier", "bytea", true, null, null, ""],
    ["acceptance_reason", "bytea", true, null, null, ""],
    ["accepted_at", "text", true, "C", null, ""],
    ["version", "bigint", true, null, null, ""],
    ["supersedes_knowledge_identity", "bytea", false, null, null, ""],
    ["proposition_identity", "bytea", false, null, null, ""],
    ["proposition_subject_key", "bytea", false, null, null, ""],
    ["proposition_predicate_key", "bytea", false, null, null, ""],
    ["proposition_textual_scalar", "bytea", false, null, null, ""],
    ["proposition_currentness_owner", "text", false, "C", null, ""],
    ["proposition_applicable_owner", "bytea", false, null, null, ""],
    ["proposition_source_relationship", "bytea", false, null, null, ""],
  ]),
  schema_migration: Object.freeze([
    ["migration_id", "text", true, "C", null, ""],
    ["checksum", "bytea", true, null, null, ""],
    [
      "applied_at",
      "timestamp with time zone",
      true,
      null,
      "CURRENT_TIMESTAMP",
      "",
    ],
  ]),
});
const expectedConstraints = Object.freeze([
  [
    "knowledge_lifecycle",
    "knowledge_lifecycle_acceptance_order_format_ck",
    "c",
    ["acceptance_order"],
    null,
    [],
    null,
    null,
    "c65f71b518ccdd007f45c91f0110a2514f22c1442a8baccfaf0fc946f0320e60",
    null,
  ],
  [
    "knowledge_lifecycle",
    "knowledge_lifecycle_acceptance_order_uq",
    "u",
    ["acceptance_order"],
    null,
    [],
    null,
    null,
    null,
    "knowledge_lifecycle_acceptance_order_uq",
  ],
  [
    "knowledge_lifecycle",
    "knowledge_lifecycle_canonical_order_uq",
    "u",
    ["canonical_order"],
    null,
    [],
    null,
    null,
    null,
    "knowledge_lifecycle_canonical_order_uq",
  ],
  [
    "knowledge_lifecycle",
    "knowledge_lifecycle_identity_pk",
    "p",
    ["knowledge_identity"],
    null,
    [],
    null,
    null,
    null,
    "knowledge_lifecycle_identity_pk",
  ],
  [
    "knowledge_lifecycle",
    "knowledge_lifecycle_record_fk",
    "f",
    ["knowledge_identity"],
    "knowledge_record",
    ["knowledge_identity"],
    "r",
    "r",
    null,
    "knowledge_record_identity_pk",
  ],
  [
    "knowledge_lifecycle",
    "knowledge_lifecycle_standing_ck",
    "c",
    ["standing"],
    null,
    [],
    null,
    null,
    "6a79ac9a9a21d5ea92eb71d144ab7687044be531c9b09a519b10067747fe9447",
    null,
  ],
  [
    "knowledge_record",
    "knowledge_record_acceptance_method_ck",
    "c",
    ["acceptance_method"],
    null,
    [],
    null,
    null,
    "e71fe24aa2eb50d32eb2835f6ad3b166c003cac41feda847367436871573c14c",
    null,
  ],
  [
    "knowledge_record",
    "knowledge_record_binary_encoding_ck",
    "c",
    [
      "knowledge_identity",
      "claim",
      "provenance_originating_capability",
      "acceptance_authority_identifier",
      "acceptance_reason",
      "provenance_source_reference",
      "supersedes_knowledge_identity",
      "proposition_identity",
      "proposition_subject_key",
      "proposition_predicate_key",
      "proposition_textual_scalar",
      "proposition_applicable_owner",
      "proposition_source_relationship",
    ],
    null,
    [],
    null,
    null,
    "7c721d3672be69485f95c8c3b712ba886b01d1e235b61009729e367146af3782",
    null,
  ],
  [
    "knowledge_record",
    "knowledge_record_identity_pk",
    "p",
    ["knowledge_identity"],
    null,
    [],
    null,
    null,
    null,
    "knowledge_record_identity_pk",
  ],
  [
    "knowledge_record",
    "knowledge_record_not_self_predecessor_ck",
    "c",
    ["supersedes_knowledge_identity", "knowledge_identity"],
    null,
    [],
    null,
    null,
    "0366f2a90080621505342cb774591c71c3250582aa0a458cc55987b2eb91382d",
    null,
  ],
  [
    "knowledge_record",
    "knowledge_record_predecessor_fk",
    "f",
    ["supersedes_knowledge_identity"],
    "knowledge_record",
    ["knowledge_identity"],
    "r",
    "r",
    null,
    "knowledge_record_identity_pk",
  ],
  [
    "knowledge_record",
    "knowledge_record_proposition_shape_ck",
    "c",
    [
      "proposition_identity",
      "proposition_subject_key",
      "proposition_predicate_key",
      "proposition_textual_scalar",
      "proposition_currentness_owner",
      "proposition_applicable_owner",
      "proposition_source_relationship",
    ],
    null,
    [],
    null,
    null,
    "de46eb5f0c72e76e699286df9767632fb02a8e33373fa9e625cb2d6bd299739e",
    null,
  ],
  [
    "knowledge_record",
    "knowledge_record_source_type_ck",
    "c",
    ["provenance_source_type"],
    null,
    [],
    null,
    null,
    "dca57761d909c7a513d8752827e4d9e1686d8cc604ad1d512dda101b98ba5cb2",
    null,
  ],
  [
    "knowledge_record",
    "knowledge_record_timestamp_shape_ck",
    "c",
    ["provenance_observed_at", "accepted_at"],
    null,
    [],
    null,
    null,
    "c2428508cecbf5d30bcf9fbd7f69cc34dab737ede18df9c3cf8e61da8884a386",
    null,
  ],
  [
    "knowledge_record",
    "knowledge_record_version_range_ck",
    "c",
    ["version"],
    null,
    [],
    null,
    null,
    "4457cecdfa120e1b27c04d1b5fb6e5ebc5a64f187eab570e76100963820afd83",
    null,
  ],
  [
    "schema_migration",
    "schema_migration_checksum_nonempty_ck",
    "c",
    ["checksum"],
    null,
    [],
    null,
    null,
    "26e175d3c39293d4e6c17735d2ad77df27a8d7536b599b03b8190f0fd06717d4",
    null,
  ],
  [
    "schema_migration",
    "schema_migration_id_format_ck",
    "c",
    ["migration_id"],
    null,
    [],
    null,
    null,
    "9b4a9247e6161353e8d470a35d139c80c9eab4174a57aac8d6d3d715a7969b01",
    null,
  ],
  [
    "schema_migration",
    "schema_migration_id_pk",
    "p",
    ["migration_id"],
    null,
    [],
    null,
    null,
    null,
    "schema_migration_id_pk",
  ],
]);
const expectedIndexes = Object.freeze([
  [
    "knowledge_lifecycle",
    "knowledge_lifecycle_acceptance_order_uq",
    true,
    false,
    ["acceptance_order"],
    null,
    "knowledge_lifecycle_acceptance_order_uq",
    "btree",
    true,
    ["C"],
    ["pg_catalog.text_ops"],
  ],
  [
    "knowledge_lifecycle",
    "knowledge_lifecycle_canonical_order_uq",
    true,
    false,
    ["canonical_order"],
    null,
    "knowledge_lifecycle_canonical_order_uq",
    "btree",
    true,
    [null],
    ["pg_catalog.int8_ops"],
  ],
  [
    "knowledge_lifecycle",
    "knowledge_lifecycle_identity_pk",
    true,
    true,
    ["knowledge_identity"],
    null,
    "knowledge_lifecycle_identity_pk",
    "btree",
    true,
    [null],
    ["pg_catalog.bytea_ops"],
  ],
  [
    "knowledge_record",
    "knowledge_record_identity_pk",
    true,
    true,
    ["knowledge_identity"],
    null,
    "knowledge_record_identity_pk",
    "btree",
    true,
    [null],
    ["pg_catalog.bytea_ops"],
  ],
  [
    "knowledge_record",
    "knowledge_record_one_successor_uq",
    true,
    false,
    ["supersedes_knowledge_identity"],
    "(supersedes_knowledge_identity IS NOT NULL)",
    null,
    "btree",
    true,
    [null],
    ["pg_catalog.bytea_ops"],
  ],
  [
    "schema_migration",
    "schema_migration_id_pk",
    true,
    true,
    ["migration_id"],
    null,
    "schema_migration_id_pk",
    "btree",
    true,
    ["C"],
    ["pg_catalog.text_ops"],
  ],
]);

export class InvalidMigrationStateError extends Error {
  constructor(message, options) {
    super(message, options);
    this.name = "InvalidMigrationStateError";
  }
}

export class MigrationChecksumMismatchError extends Error {
  constructor(migrationIdentifier) {
    super(`Migration ${migrationIdentifier} checksum does not match.`);
    this.name = "MigrationChecksumMismatchError";
    this.migrationIdentifier = migrationIdentifier;
  }
}

export class MigrationUnavailableError extends Error {
  constructor(message, options = {}) {
    super(message, options);
    this.name = "MigrationUnavailableError";
    this.ambiguousCompletion = options.ambiguousCompletion === true;
  }
}

export class MigrationExecutionError extends Error {
  constructor(migrationIdentifier, options) {
    super(
      `Migration ${migrationIdentifier} failed and was rolled back.`,
      options,
    );
    this.name = "MigrationExecutionError";
    this.migrationIdentifier = migrationIdentifier;
  }
}

export async function loadKnowledgeStoreMigrations(
  migrationsDirectory = defaultMigrationsDirectory,
) {
  return loadMigrationsFromDirectory(migrationsDirectory);
}

export async function runKnowledgeStoreMigrations({
  pool,
  runtimeRole,
  migrationsDirectory = defaultMigrationsDirectory,
} = {}) {
  if (pool === undefined || typeof pool.connect !== "function") {
    throw new TypeError("A PostgreSQL pool with connect() is required.");
  }
  const quotedRuntimeRole = quoteRoleIdentifier(runtimeRole);
  const migrations = await loadMigrationsFromDirectory(migrationsDirectory);

  let client;
  let destroyClient = false;
  try {
    client = await pool.connect();
  } catch (cause) {
    throw new MigrationUnavailableError(
      "The Knowledge Store migration database is unavailable.",
      { cause },
    );
  }

  try {
    await assertPostgreSqlVersion(client);
    await assertRuntimeRoleEligibility(client, runtimeRole);
    const schemaExists = await knowledgeSchemaExists(client);

    if (!schemaExists) {
      if (migrations[0]?.identifier !== "0001") {
        throw new InvalidMigrationStateError(
          "A pristine database requires migration 0001.",
        );
      }
      return await applyMigration(
        client,
        migrations[0],
        runtimeRole,
        quotedRuntimeRole,
        true,
      );
    }

    if (!(await migrationLedgerExists(client))) {
      throw new InvalidMigrationStateError(
        "The knowledge namespace exists without the governed migration ledger.",
      );
    }

    await verifyMigrationLedgerShape(client);
    const applied = await readAndVerifyLedger(client, migrations);
    if (applied.length > 0) {
      await verifyAppliedSchema(client, applied);
      await assertRuntimeRolePermissions(client, runtimeRole);
    }

    if (applied.length === migrations.length) {
      return Object.freeze({ status: "current", appliedMigration: null });
    }

    const next = migrations[applied.length];
    if (next.transactionMode !== MIGRATION_TRANSACTION_MODE) {
      throw new InvalidMigrationStateError(
        `Migration ${next.identifier} is not authorized for transactional execution.`,
      );
    }
    return await applyMigration(
      client,
      next,
      runtimeRole,
      quotedRuntimeRole,
      false,
    );
  } catch (error) {
    if (error instanceof MigrationUnavailableError) destroyClient = true;
    throw error;
  } finally {
    client?.release(destroyClient);
  }
}

async function loadMigrationsFromDirectory(migrationsDirectory) {
  let names;
  try {
    names = await readdir(migrationsDirectory);
  } catch (cause) {
    throw new InvalidMigrationStateError(
      "Knowledge Store migration artifacts are unavailable.",
      { cause },
    );
  }
  const migrations = [];
  const identifiers = new Set();
  for (const name of names.filter((value) => value.endsWith(".sql")).sort()) {
    const match = migrationFilePattern.exec(name);
    if (match === null || match[1] === "0000" || identifiers.has(match[1])) {
      throw new InvalidMigrationStateError(
        `Invalid or duplicate migration artifact name: ${name}.`,
      );
    }
    const artifact = await readFile(resolve(migrationsDirectory, name));
    identifiers.add(match[1]);
    migrations.push(
      Object.freeze({
        identifier: match[1],
        name,
        artifact,
        sql: artifact.toString("utf8"),
        checksum: createHash(MIGRATION_CHECKSUM_ALGORITHM)
          .update(artifact)
          .digest(),
        transactionMode: MIGRATION_TRANSACTION_MODE,
      }),
    );
  }
  if (migrations.length === 0) {
    throw new InvalidMigrationStateError(
      "No Knowledge Store migration artifacts were found.",
    );
  }
  assertContiguousArtifacts(migrations);
  return Object.freeze(migrations);
}

function assertContiguousArtifacts(migrations) {
  for (let index = 0; index < migrations.length; index += 1) {
    const expected = String(index + 1).padStart(4, "0");
    if (migrations[index].identifier !== expected) {
      throw new InvalidMigrationStateError(
        `Migration artifacts are not contiguous at ${expected}.`,
      );
    }
  }
}

function quoteRoleIdentifier(runtimeRole) {
  if (
    typeof runtimeRole !== "string" ||
    !/^[A-Za-z_][A-Za-z0-9_$-]{0,62}$/.test(runtimeRole)
  ) {
    throw new TypeError(
      "A valid existing PostgreSQL runtime role is required.",
    );
  }
  return `"${runtimeRole.replaceAll('"', '""')}"`;
}

async function assertPostgreSqlVersion(client) {
  const result = await queryOperational(client, "SHOW server_version_num");
  const version = Number(result.rows[0]?.server_version_num);
  if (!Number.isInteger(version) || version < 160000) {
    throw new InvalidMigrationStateError("PostgreSQL 16 or newer is required.");
  }
}

async function assertRuntimeRoleEligibility(client, runtimeRole) {
  const result = await queryOperational(
    client,
    `WITH runtime_role AS (
       SELECT oid FROM pg_catalog.pg_roles WHERE rolname = $1
     )
     SELECT r.oid, r.rolsuper, r.rolcreatedb, r.rolcreaterole,
            r.rolreplication, r.rolbypassrls,
            pg_catalog.has_database_privilege(r.oid, current_database(), 'CREATE') AS database_create,
            EXISTS (
              SELECT 1
                FROM pg_catalog.pg_auth_members AS membership
               WHERE membership.member = r.oid AND membership.admin_option
            ) AS role_membership_admin
       FROM pg_catalog.pg_roles AS r
       CROSS JOIN runtime_role AS runtime
      WHERE (pg_catalog.pg_has_role(runtime.oid, r.oid, 'USAGE')
          OR pg_catalog.pg_has_role(runtime.oid, r.oid, 'SET'))
      ORDER BY r.oid`,
    [runtimeRole],
  );
  if (result.rows.length === 0) {
    throw new InvalidMigrationStateError(
      "The configured runtime role does not exist.",
    );
  }
  if (
    result.rows.some(
      (role) =>
        role.rolsuper ||
        role.rolcreatedb ||
        role.rolcreaterole ||
        role.rolreplication ||
        role.rolbypassrls ||
        role.database_create ||
        role.role_membership_admin,
    )
  ) {
    throw new InvalidMigrationStateError(
      "The configured runtime role can obtain prohibited administrative authority.",
    );
  }
}

async function knowledgeSchemaExists(client) {
  const result = await queryOperational(
    client,
    "SELECT pg_catalog.to_regnamespace('knowledge') IS NOT NULL AS present",
  );
  return result.rows[0]?.present === true;
}

async function migrationLedgerExists(client) {
  const result = await queryOperational(
    client,
    "SELECT pg_catalog.to_regclass('knowledge.schema_migration') IS NOT NULL AS present",
  );
  return result.rows[0]?.present === true;
}

async function verifyMigrationLedgerShape(client) {
  const columns = await readGovernedColumns(client, ["schema_migration"]);
  const constraints = await readGovernedConstraints(client, [
    "schema_migration",
  ]);
  if (!sameRows(columns, expectedColumnRows(["schema_migration"]))) {
    throw new InvalidMigrationStateError(
      "The Knowledge Store migration ledger has incompatible columns.",
    );
  }
  if (
    !sameRows(
      constraints,
      expectedConstraints.filter(
        ([relation]) => relation === "schema_migration",
      ),
    )
  ) {
    throw new InvalidMigrationStateError(
      "The Knowledge Store migration ledger has incompatible constraints.",
    );
  }
}

async function readAndVerifyLedger(client, migrations) {
  const result = await queryOperational(
    client,
    `SELECT migration_id, checksum
       FROM knowledge.schema_migration
      ORDER BY migration_id COLLATE "C"`,
  );
  if (result.rows.length === 0) {
    throw new InvalidMigrationStateError(
      "A self-bootstrapped migration ledger cannot be empty.",
    );
  }
  for (let index = 0; index < result.rows.length; index += 1) {
    const row = result.rows[index];
    const expectedIdentifier = String(index + 1).padStart(4, "0");
    if (
      !migrationIdentifierPattern.test(row.migration_id) ||
      row.migration_id !== expectedIdentifier
    ) {
      throw new InvalidMigrationStateError(
        `Migration ledger history is not contiguous at ${expectedIdentifier}.`,
      );
    }
    const artifact = migrations[index];
    if (artifact === undefined || artifact.identifier !== row.migration_id) {
      throw new InvalidMigrationStateError(
        `Migration ${row.migration_id} has no governed artifact.`,
      );
    }
    if (!Buffer.from(row.checksum).equals(artifact.checksum)) {
      throw new MigrationChecksumMismatchError(row.migration_id);
    }
  }
  return result.rows;
}

async function verifyAppliedSchema(client, applied) {
  if (!applied.some((row) => row.migration_id === "0001")) return;
  const relationResult = await queryOperational(
    client,
    `SELECT c.relname, c.relkind, c.relpersistence
       FROM pg_catalog.pg_class AS c
       JOIN pg_catalog.pg_namespace AS n ON n.oid = c.relnamespace
      WHERE n.nspname = 'knowledge'
      ORDER BY c.relname, c.relkind`,
  );
  const actualRelations = new Set(
    relationResult.rows.map(
      (row) => `${row.relname}:${row.relkind}:${row.relpersistence}`,
    ),
  );
  const columns = await readGovernedColumns(
    client,
    Object.keys(expectedColumns),
  );
  const constraints = await readGovernedConstraints(
    client,
    Object.keys(expectedColumns),
  );
  const indexes = await readGovernedIndexes(client);
  const sequences = await readGovernedSequences(client);
  const identityDependencies = await readIdentityDependencies(client);
  const ownership = await readGovernedOwnership(client);
  const unsupportedObjects = await readUnsupportedGovernedObjects(client);
  const mismatch =
    actualRelations.size !== governedRelationNames.length ||
    !governedRelationNames.every((name) => actualRelations.has(name))
      ? "relations"
      : !sameRows(columns, expectedColumnRows(Object.keys(expectedColumns)))
        ? "columns"
        : !sameRows(constraints, expectedConstraints)
          ? "constraints"
          : !sameRows(indexes, expectedIndexes)
            ? "indexes"
            : !sameRows(sequences, [
                  [
                    "knowledge_acceptance_order_seq",
                    "bigint",
                    "1",
                    "1",
                    "9223372036854775807",
                    "1",
                    false,
                  ],
                  [
                    "knowledge_lifecycle_canonical_order_seq",
                    "bigint",
                    "1",
                    "1",
                    "9223372036854775807",
                    "1",
                    false,
                  ],
                ])
              ? "sequences"
              : !sameRows(identityDependencies, [
                    [
                      "knowledge_lifecycle_canonical_order_seq",
                      "knowledge_lifecycle",
                      "canonical_order",
                      "i",
                    ],
                  ])
                ? "identity dependencies"
                : ownership.length !== 1
                  ? "ownership"
                  : unsupportedObjects
                    ? "unsupported objects"
                    : null;
  if (mismatch !== null) {
    throw new InvalidMigrationStateError(
      `The applied migration ledger disagrees with the governed Knowledge schema ${mismatch}.`,
    );
  }
}

function expectedColumnRows(relations) {
  return relations.flatMap((relation) =>
    expectedColumns[relation].map((column) => [relation, ...column]),
  );
}

async function readGovernedColumns(client, relations) {
  const result = await queryOperational(
    client,
    `SELECT c.relname AS relation_name, a.attname AS column_name,
            pg_catalog.format_type(a.atttypid, a.atttypmod) AS data_type,
            a.attnotnull, coll.collname AS collation_name,
            pg_catalog.pg_get_expr(ad.adbin, ad.adrelid) AS default_expression,
            a.attidentity
       FROM pg_catalog.pg_class AS c
       JOIN pg_catalog.pg_namespace AS n ON n.oid = c.relnamespace
       JOIN pg_catalog.pg_attribute AS a ON a.attrelid = c.oid
       LEFT JOIN pg_catalog.pg_collation AS coll ON coll.oid = a.attcollation
       LEFT JOIN pg_catalog.pg_attrdef AS ad
         ON ad.adrelid = c.oid AND ad.adnum = a.attnum
      WHERE n.nspname = 'knowledge'
        AND c.relname = ANY($1::text[])
        AND c.relkind = 'r'
        AND a.attnum > 0
        AND NOT a.attisdropped
      ORDER BY c.relname, a.attnum`,
    [relations],
  );
  return result.rows.map((row) => [
    row.relation_name,
    row.column_name,
    row.data_type,
    row.attnotnull,
    row.collation_name,
    row.default_expression,
    row.attidentity,
  ]);
}

async function readGovernedConstraints(client, relations) {
  const result = await queryOperational(
    client,
    `SELECT rel.relname AS relation_name, con.conname, con.contype,
            pg_catalog.to_json(ARRAY(
              SELECT att.attname
                FROM unnest(con.conkey) WITH ORDINALITY AS key(attnum, ordinal)
                JOIN pg_catalog.pg_attribute AS att
                  ON att.attrelid = con.conrelid AND att.attnum = key.attnum
               ORDER BY key.ordinal
            )) AS key_columns,
            ref.relname AS referenced_relation,
            pg_catalog.to_json(ARRAY(
              SELECT att.attname
                FROM unnest(con.confkey) WITH ORDINALITY AS key(attnum, ordinal)
                JOIN pg_catalog.pg_attribute AS att
                  ON att.attrelid = con.confrelid AND att.attnum = key.attnum
               ORDER BY key.ordinal
            )) AS referenced_columns,
            CASE WHEN con.contype = 'f' THEN con.confupdtype::text END AS update_action,
            CASE WHEN con.contype = 'f' THEN con.confdeltype::text END AS delete_action,
            CASE WHEN con.contype = 'c'
              THEN pg_catalog.pg_get_expr(con.conbin, con.conrelid)
            END AS check_expression,
            backing.relname AS backing_index,
            con.condeferrable, con.condeferred, con.convalidated, con.connoinherit
       FROM pg_catalog.pg_constraint AS con
       JOIN pg_catalog.pg_class AS rel ON rel.oid = con.conrelid
       JOIN pg_catalog.pg_namespace AS n ON n.oid = con.connamespace
       LEFT JOIN pg_catalog.pg_class AS ref ON ref.oid = con.confrelid
       LEFT JOIN pg_catalog.pg_class AS backing ON backing.oid = con.conindid
      WHERE n.nspname = 'knowledge'
        AND rel.relname = ANY($1::text[])
      ORDER BY rel.relname, con.conname`,
    [relations],
  );
  return result.rows.map((row) => {
    if (
      row.condeferrable ||
      row.condeferred ||
      !row.convalidated ||
      (row.contype === "c" && row.connoinherit)
    ) {
      return ["invalid-constraint-metadata"];
    }
    return [
      row.relation_name,
      row.conname,
      row.contype,
      row.key_columns,
      row.referenced_relation,
      row.referenced_columns,
      row.update_action,
      row.delete_action,
      row.check_expression === null
        ? null
        : createHash("sha256").update(row.check_expression).digest("hex"),
      row.backing_index,
    ];
  });
}

async function readGovernedIndexes(client) {
  const result = await queryOperational(
    client,
    `SELECT tab.relname AS relation_name, idx.relname AS index_name,
            ind.indisunique, ind.indisprimary,
            pg_catalog.to_json(ARRAY(
              SELECT att.attname
                FROM unnest(ind.indkey) WITH ORDINALITY AS key(attnum, ordinal)
                JOIN pg_catalog.pg_attribute AS att
                  ON att.attrelid = tab.oid AND att.attnum = key.attnum
               ORDER BY key.ordinal
            )) AS key_columns,
            pg_catalog.pg_get_expr(ind.indpred, ind.indrelid) AS predicate,
            con.conname AS backing_constraint, am.amname AS access_method,
            ind.indisvalid AND ind.indisready AND ind.indislive
              AND NOT ind.indnullsnotdistinct AS valid_definition,
            pg_catalog.to_json(ARRAY(
              SELECT coll.collname
                FROM unnest(ind.indcollation) WITH ORDINALITY AS key(collation_oid, ordinal)
                LEFT JOIN pg_catalog.pg_collation AS coll ON coll.oid = key.collation_oid
               ORDER BY key.ordinal
            )) AS collations,
            pg_catalog.to_json(ARRAY(
              SELECT opc_namespace.nspname || '.' || opc.opcname
                FROM unnest(ind.indclass) WITH ORDINALITY AS key(opclass_oid, ordinal)
                JOIN pg_catalog.pg_opclass AS opc ON opc.oid = key.opclass_oid
                JOIN pg_catalog.pg_namespace AS opc_namespace
                  ON opc_namespace.oid = opc.opcnamespace
               ORDER BY key.ordinal
            )) AS operator_classes
       FROM pg_catalog.pg_index AS ind
       JOIN pg_catalog.pg_class AS idx ON idx.oid = ind.indexrelid
       JOIN pg_catalog.pg_class AS tab ON tab.oid = ind.indrelid
       JOIN pg_catalog.pg_namespace AS n ON n.oid = tab.relnamespace
       JOIN pg_catalog.pg_am AS am ON am.oid = idx.relam
       LEFT JOIN pg_catalog.pg_constraint AS con
         ON con.conindid = idx.oid AND con.contype IN ('p', 'u')
      WHERE n.nspname = 'knowledge'
      ORDER BY tab.relname, idx.relname`,
  );
  return result.rows.map((row) => [
    row.relation_name,
    row.index_name,
    row.indisunique,
    row.indisprimary,
    row.key_columns,
    row.predicate,
    row.backing_constraint,
    row.access_method,
    row.valid_definition,
    row.collations,
    row.operator_classes,
  ]);
}

async function readGovernedSequences(client) {
  const result = await queryOperational(
    client,
    `SELECT sequencename, data_type, start_value::text, min_value::text,
            max_value::text, increment_by::text, cycle
       FROM pg_catalog.pg_sequences
      WHERE schemaname = 'knowledge'
      ORDER BY sequencename`,
  );
  return result.rows.map((row) => [
    row.sequencename,
    row.data_type,
    row.start_value,
    row.min_value,
    row.max_value,
    row.increment_by,
    row.cycle,
  ]);
}

async function readIdentityDependencies(client) {
  const result = await queryOperational(
    client,
    `SELECT seq.relname AS sequence_name, tab.relname AS relation_name,
            att.attname AS column_name, dep.deptype
       FROM pg_catalog.pg_depend AS dep
       JOIN pg_catalog.pg_class AS seq ON seq.oid = dep.objid
       JOIN pg_catalog.pg_namespace AS n ON n.oid = seq.relnamespace
       JOIN pg_catalog.pg_class AS tab ON tab.oid = dep.refobjid
       JOIN pg_catalog.pg_attribute AS att
         ON att.attrelid = tab.oid AND att.attnum = dep.refobjsubid
      WHERE n.nspname = 'knowledge'
        AND seq.relkind = 'S'
        AND dep.deptype IN ('a', 'i')
      ORDER BY seq.relname`,
  );
  return result.rows.map((row) => [
    row.sequence_name,
    row.relation_name,
    row.column_name,
    row.deptype,
  ]);
}

async function readGovernedOwnership(client) {
  const result = await queryOperational(
    client,
    `SELECT DISTINCT owner_oid
       FROM (
         SELECT n.nspowner AS owner_oid
           FROM pg_catalog.pg_namespace AS n
          WHERE n.nspname = 'knowledge'
         UNION ALL
         SELECT c.relowner
           FROM pg_catalog.pg_class AS c
           JOIN pg_catalog.pg_namespace AS n ON n.oid = c.relnamespace
          WHERE n.nspname = 'knowledge'
       ) AS governed_owners`,
  );
  return result.rows;
}

async function readUnsupportedGovernedObjects(client) {
  const result = await queryOperational(
    client,
    `SELECT
       EXISTS (
         SELECT 1
           FROM pg_catalog.pg_proc AS proc
           JOIN pg_catalog.pg_namespace AS n ON n.oid = proc.pronamespace
          WHERE n.nspname = 'knowledge'
       ) AS routines,
       EXISTS (
         SELECT 1
           FROM pg_catalog.pg_trigger AS trigger
           JOIN pg_catalog.pg_class AS c ON c.oid = trigger.tgrelid
           JOIN pg_catalog.pg_namespace AS n ON n.oid = c.relnamespace
          WHERE n.nspname = 'knowledge' AND NOT trigger.tgisinternal
       ) AS triggers,
       EXISTS (
         SELECT 1
           FROM pg_catalog.pg_policy AS policy
           JOIN pg_catalog.pg_class AS c ON c.oid = policy.polrelid
           JOIN pg_catalog.pg_namespace AS n ON n.oid = c.relnamespace
          WHERE n.nspname = 'knowledge'
       ) AS policies,
       EXISTS (
         SELECT 1
           FROM pg_catalog.pg_class AS c
           JOIN pg_catalog.pg_namespace AS n ON n.oid = c.relnamespace
          WHERE n.nspname = 'knowledge'
            AND c.relkind = 'r'
            AND (c.relrowsecurity OR c.relforcerowsecurity)
       ) AS row_security`,
  );
  return Object.values(result.rows[0]).some(Boolean);
}

function sameRows(actual, expected) {
  return JSON.stringify(actual) === JSON.stringify(expected);
}

async function assertRuntimeRolePermissions(client, runtimeRole) {
  await assertRuntimeRoleEligibility(client, runtimeRole);
  const result = await queryOperational(
    client,
    `WITH reachable_roles AS (
       SELECT r.oid
         FROM pg_catalog.pg_roles AS r
        WHERE pg_catalog.pg_has_role($1, r.oid, 'USAGE')
           OR pg_catalog.pg_has_role($1, r.oid, 'SET')
     ), owner_access AS (
       SELECT EXISTS (
         SELECT 1
           FROM reachable_roles AS reachable
          WHERE reachable.oid IN (
            SELECT n.nspowner
              FROM pg_catalog.pg_namespace AS n
             WHERE n.nspname = 'knowledge'
            UNION
            SELECT c.relowner
              FROM pg_catalog.pg_class AS c
              JOIN pg_catalog.pg_namespace AS n ON n.oid = c.relnamespace
             WHERE n.nspname = 'knowledge'
          )
       ) AS present
     ), prohibited AS (
       SELECT EXISTS (
         SELECT 1
           FROM reachable_roles AS reachable
          WHERE pg_catalog.has_schema_privilege(reachable.oid, 'knowledge', 'CREATE')
             OR pg_catalog.has_any_column_privilege(
                  reachable.oid, 'knowledge.knowledge_record', 'UPDATE')
             OR pg_catalog.has_table_privilege(
                  reachable.oid, 'knowledge.knowledge_record',
                  'UPDATE,DELETE,TRUNCATE,REFERENCES,TRIGGER')
             OR pg_catalog.has_table_privilege(
                  reachable.oid, 'knowledge.knowledge_lifecycle',
                  'UPDATE,DELETE,TRUNCATE,REFERENCES,TRIGGER')
             OR pg_catalog.has_column_privilege(
                  reachable.oid, 'knowledge.knowledge_lifecycle',
                  'knowledge_identity', 'UPDATE')
             OR pg_catalog.has_column_privilege(
                  reachable.oid, 'knowledge.knowledge_lifecycle',
                  'acceptance_order', 'UPDATE')
             OR pg_catalog.has_column_privilege(
                  reachable.oid, 'knowledge.knowledge_lifecycle',
                  'canonical_order', 'UPDATE')
             OR pg_catalog.has_table_privilege(
                  reachable.oid, 'knowledge.schema_migration',
                  'SELECT,INSERT,UPDATE,DELETE,TRUNCATE,REFERENCES,TRIGGER')
             OR pg_catalog.has_sequence_privilege(
                  reachable.oid, 'knowledge.knowledge_acceptance_order_seq',
                  'SELECT,UPDATE')
             OR pg_catalog.has_sequence_privilege(
                  reachable.oid,
                  'knowledge.knowledge_lifecycle_canonical_order_seq',
                  'SELECT,UPDATE')
       ) AS present
     ), grant_options AS (
       SELECT EXISTS (
         SELECT 1
           FROM reachable_roles AS reachable
          WHERE pg_catalog.has_schema_privilege(
                  reachable.oid, 'knowledge',
                  'USAGE WITH GRANT OPTION,CREATE WITH GRANT OPTION')
             OR pg_catalog.has_table_privilege(
                  reachable.oid, 'knowledge.knowledge_record',
                  'SELECT WITH GRANT OPTION,INSERT WITH GRANT OPTION,UPDATE WITH GRANT OPTION,DELETE WITH GRANT OPTION,TRUNCATE WITH GRANT OPTION,REFERENCES WITH GRANT OPTION,TRIGGER WITH GRANT OPTION')
             OR pg_catalog.has_any_column_privilege(
                  reachable.oid, 'knowledge.knowledge_record',
                  'SELECT WITH GRANT OPTION,INSERT WITH GRANT OPTION,UPDATE WITH GRANT OPTION,REFERENCES WITH GRANT OPTION')
             OR pg_catalog.has_table_privilege(
                  reachable.oid, 'knowledge.knowledge_lifecycle',
                  'SELECT WITH GRANT OPTION,INSERT WITH GRANT OPTION,UPDATE WITH GRANT OPTION,DELETE WITH GRANT OPTION,TRUNCATE WITH GRANT OPTION,REFERENCES WITH GRANT OPTION,TRIGGER WITH GRANT OPTION')
             OR pg_catalog.has_any_column_privilege(
                  reachable.oid, 'knowledge.knowledge_lifecycle',
                  'SELECT WITH GRANT OPTION,INSERT WITH GRANT OPTION,UPDATE WITH GRANT OPTION,REFERENCES WITH GRANT OPTION')
             OR pg_catalog.has_table_privilege(
                  reachable.oid, 'knowledge.schema_migration',
                  'SELECT WITH GRANT OPTION,INSERT WITH GRANT OPTION,UPDATE WITH GRANT OPTION,DELETE WITH GRANT OPTION,TRUNCATE WITH GRANT OPTION,REFERENCES WITH GRANT OPTION,TRIGGER WITH GRANT OPTION')
             OR pg_catalog.has_any_column_privilege(
                  reachable.oid, 'knowledge.schema_migration',
                  'SELECT WITH GRANT OPTION,INSERT WITH GRANT OPTION,UPDATE WITH GRANT OPTION,REFERENCES WITH GRANT OPTION')
             OR pg_catalog.has_sequence_privilege(
                  reachable.oid, 'knowledge.knowledge_acceptance_order_seq',
                  'USAGE WITH GRANT OPTION,SELECT WITH GRANT OPTION,UPDATE WITH GRANT OPTION')
             OR pg_catalog.has_sequence_privilege(
                  reachable.oid,
                  'knowledge.knowledge_lifecycle_canonical_order_seq',
                  'USAGE WITH GRANT OPTION,SELECT WITH GRANT OPTION,UPDATE WITH GRANT OPTION')
       ) AS present
     )
     SELECT
       pg_catalog.has_schema_privilege($1, 'knowledge', 'USAGE') AS schema_usage,
       pg_catalog.has_table_privilege(
         $1, 'knowledge.knowledge_record', 'SELECT') AS record_select,
       pg_catalog.has_table_privilege(
         $1, 'knowledge.knowledge_record', 'INSERT') AS record_insert,
       pg_catalog.has_table_privilege(
         $1, 'knowledge.knowledge_lifecycle', 'SELECT') AS lifecycle_select,
       pg_catalog.has_table_privilege(
         $1, 'knowledge.knowledge_lifecycle', 'INSERT') AS lifecycle_insert,
       pg_catalog.has_column_privilege(
         $1, 'knowledge.knowledge_lifecycle', 'standing', 'UPDATE') AS standing_update,
       pg_catalog.has_sequence_privilege(
         $1, 'knowledge.knowledge_acceptance_order_seq', 'USAGE') AS acceptance_usage,
       pg_catalog.has_sequence_privilege(
         $1, 'knowledge.knowledge_lifecycle_canonical_order_seq', 'USAGE') AS canonical_usage,
       owner_access.present AS owner_access,
       prohibited.present AS prohibited_access,
       grant_options.present AS grant_option_access
     FROM owner_access, prohibited, grant_options`,
    [runtimeRole],
  );
  const permissions = result.rows[0];
  if (
    permissions?.schema_usage !== true ||
    permissions.record_select !== true ||
    permissions.record_insert !== true ||
    permissions.lifecycle_select !== true ||
    permissions.lifecycle_insert !== true ||
    permissions.standing_update !== true ||
    permissions.acceptance_usage !== true ||
    permissions.canonical_usage !== true ||
    permissions.owner_access !== false ||
    permissions.prohibited_access !== false ||
    permissions.grant_option_access !== false
  ) {
    throw new InvalidMigrationStateError(
      "The configured runtime role does not match the governed effective permission boundary.",
    );
  }
}

async function applyMigration(
  client,
  migration,
  runtimeRole,
  quotedRuntimeRole,
  pristine,
) {
  if (migration.transactionMode !== MIGRATION_TRANSACTION_MODE) {
    throw new InvalidMigrationStateError(
      `Migration ${migration.identifier} requires an unauthorized non-transactional path.`,
    );
  }

  let began = false;
  let commitAttempted = false;
  try {
    await client.query("BEGIN");
    began = true;
    if (!pristine) await verifyMigrationLedgerShape(client);
    await client.query(migration.sql);
    if (migration.identifier === "0001") {
      await grantRuntimePrivileges(client, quotedRuntimeRole);
      await verifyMigrationLedgerShape(client);
    }
    await client.query(
      `INSERT INTO knowledge.schema_migration (migration_id, checksum)
       VALUES ($1, $2)`,
      [migration.identifier, migration.checksum],
    );
    if (migration.identifier === "0001") {
      await verifyAppliedSchema(client, [{ migration_id: "0001" }]);
      await assertRuntimeRolePermissions(client, runtimeRole);
    }
    commitAttempted = true;
    await client.query("COMMIT");
    return Object.freeze({
      status: "applied",
      appliedMigration: migration.identifier,
    });
  } catch (cause) {
    if (commitAttempted) {
      throw new MigrationUnavailableError(
        `Migration ${migration.identifier} has an ambiguous commit outcome.`,
        { cause, ambiguousCompletion: true },
      );
    }
    if (began) {
      try {
        await client.query("ROLLBACK");
      } catch (rollbackCause) {
        throw new MigrationUnavailableError(
          `Migration ${migration.identifier} failed and rollback could not be confirmed.`,
          { cause: new AggregateError([cause, rollbackCause]) },
        );
      }
    }
    if (cause instanceof InvalidMigrationStateError) throw cause;
    throw new MigrationExecutionError(migration.identifier, { cause });
  }
}

async function grantRuntimePrivileges(client, quotedRuntimeRole) {
  await client.query(`GRANT USAGE ON SCHEMA knowledge TO ${quotedRuntimeRole}`);
  await client.query(
    `GRANT SELECT, INSERT ON knowledge.knowledge_record TO ${quotedRuntimeRole}`,
  );
  await client.query(
    `GRANT SELECT, INSERT ON knowledge.knowledge_lifecycle TO ${quotedRuntimeRole}`,
  );
  await client.query(
    `GRANT UPDATE (standing) ON knowledge.knowledge_lifecycle TO ${quotedRuntimeRole}`,
  );
  await client.query(
    `GRANT USAGE ON SEQUENCE knowledge.knowledge_acceptance_order_seq TO ${quotedRuntimeRole}`,
  );
  await client.query(
    `GRANT USAGE ON SEQUENCE knowledge.knowledge_lifecycle_canonical_order_seq TO ${quotedRuntimeRole}`,
  );
}

async function queryOperational(client, text, values) {
  try {
    return await client.query(text, values);
  } catch (cause) {
    throw new MigrationUnavailableError(
      "The Knowledge Store migration database operation failed.",
      { cause },
    );
  }
}
