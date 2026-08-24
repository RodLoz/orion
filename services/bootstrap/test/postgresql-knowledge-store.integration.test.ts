import { randomBytes } from "node:crypto";

import {
  createKnowledgeRecord,
  knowledgeIdentity,
  knowledgeVersion,
  type KnowledgeConstructionValues,
} from "@orion/core";
import { KnowledgeEngine } from "@orion/knowledge";
import pg, { type Pool as PgPool, type PoolClient } from "pg";
import { afterEach, describe, expect, it } from "vitest";

import { PostgreSQLKnowledgeStore } from "../src/knowledge/postgresql-knowledge-store.js";
import {
  PostgreSQLKnowledgeStoreRuntime,
  type PostgreSqlKnowledgeClient,
  type PostgreSqlKnowledgePool,
  type PostgreSqlQueryResult,
} from "../src/knowledge/postgresql-knowledge-store-internal.js";
import { registerKnowledgeStoreConformance } from "./knowledge-store-conformance.js";
import {
  composeKnowledgeCapability,
  loadBootstrapConfiguration,
} from "../src/index.js";

const adminUrl = process.env.ORION_TEST_POSTGRES_ADMIN_URL;
const integrationDescribe = adminUrl === undefined ? describe.skip : describe;
const { Pool } = pg;
const cleanup: Array<() => Promise<void>> = [];

class Construction implements KnowledgeConstructionValues {
  #identity = 0;
  #acceptedAt = 0;

  public nextKnowledgeIdentity(): unknown {
    this.#identity += 1;
    return `postgresql-engine-${this.#identity}`;
  }

  public nextAcceptedAt(): unknown {
    this.#acceptedAt += 1;
    return `2026-08-24T00:00:0${this.#acceptedAt}.000Z`;
  }
}

class Deferred {
  public readonly promise: Promise<void>;
  public resolve!: () => void;

  public constructor() {
    this.promise = new Promise((resolve) => {
      this.resolve = resolve;
    });
  }
}

class GatedPool implements PostgreSqlKnowledgePool {
  public readonly inserted = new Deferred();
  public readonly continueAfterRecordInsert = new Deferred();

  public constructor(private readonly pool: PgPool) {}

  public async connect(): Promise<PostgreSqlKnowledgeClient> {
    return new GatedClient(
      await this.pool.connect(),
      this.inserted,
      this.continueAfterRecordInsert,
    );
  }
}

class GatedClient implements PostgreSqlKnowledgeClient {
  public constructor(
    private readonly client: PoolClient,
    private readonly inserted: Deferred,
    private readonly continuation: Deferred,
  ) {}

  public async query(
    text: string,
    values?: readonly unknown[],
  ): Promise<PostgreSqlQueryResult> {
    const result = await this.client.query(
      text,
      values === undefined ? undefined : [...values],
    );
    if (text.startsWith("INSERT INTO knowledge.knowledge_record")) {
      this.inserted.resolve();
      await this.continuation.promise;
    }
    return { rows: result.rows, rowCount: result.rowCount };
  }

  public release(destroy?: boolean | Error): void {
    this.client.release(destroy);
  }
}

class FailingLifecyclePool implements PostgreSqlKnowledgePool {
  public constructor(private readonly pool: PgPool) {}

  public async connect(): Promise<PostgreSqlKnowledgeClient> {
    return new FailingLifecycleClient(await this.pool.connect());
  }
}

class FailingLifecycleClient implements PostgreSqlKnowledgeClient {
  public constructor(private readonly client: PoolClient) {}

  public async query(
    text: string,
    values?: readonly unknown[],
  ): Promise<PostgreSqlQueryResult> {
    if (text.startsWith("INSERT INTO knowledge.knowledge_lifecycle")) {
      throw Object.assign(new Error("injected private lifecycle failure"), {
        code: "23514",
      });
    }
    const result = await this.client.query(
      text,
      values === undefined ? undefined : [...values],
    );
    return { rows: result.rows, rowCount: result.rowCount };
  }

  public release(destroy?: boolean | Error): void {
    this.client.release(destroy);
  }
}

afterEach(async () => {
  while (cleanup.length > 0) await cleanup.pop()!();
});

integrationDescribe.sequential("PostgreSQL Knowledge Store integration", () => {
  it("round-trips the governed semantic string domain through PostgreSQL bytea", async () => {
    const fixture = await migratedFixture();
    const store = new PostgreSQLKnowledgeStore(fixture.runtimePool);
    const identities = [
      "nul-\u0000-value",
      "e\u0301",
      "\u00e9",
      "Case",
      "case",
      "supplementary-\ud83d\ude00",
      "lone-high-\ud800",
      "lone-high-upper-\udbff",
      "lone-low-\udc00",
      "lone-low-upper-\udfff",
      "mixed-\ud800A\udc00\ud800\ud800\udc00\udc00",
      "x".repeat(128),
    ];

    for (const identity of identities) {
      await expect(
        store.putIndependentAcceptedKnowledge({
          record: integrationRecord(identity, 1),
        }),
      ).resolves.toMatchObject({ status: "stored" });
      const retrieved = await store
        .get(knowledgeIdentity(identity))
        .catch(() => {
          throw new Error(`Failed to retrieve ${JSON.stringify(identity)}.`);
        });
      expect(retrieved).toMatchObject({
        status: "found",
        record: { knowledgeIdentity: identity, claim: identity },
      });
      if (retrieved.status === "found") {
        const reconstructed = createKnowledgeRecord(retrieved.record);
        expect(codeUnits(reconstructed.knowledgeIdentity)).toEqual(
          codeUnits(identity),
        );
        expect(codeUnits(reconstructed.claim)).toEqual(codeUnits(identity));
      }
    }

    const snapshot = await store.loadKnowledgeLifecycleSnapshot();
    expect(snapshot).toMatchObject({
      status: "loaded",
      snapshot: {
        entries: identities.map((knowledgeIdentityValue) => ({
          knowledgeIdentity: knowledgeIdentityValue,
        })),
      },
    });
  });

  it("reconstructs across Engine restart with exact historical state", async () => {
    const fixture = await migratedFixture();
    const poolA = fixture.runtimePool;
    const backendA = await poolA.query(
      "SELECT pg_backend_pid()::integer AS backend_pid",
    );
    const storeA = new PostgreSQLKnowledgeStore(poolA);
    const engineA = new KnowledgeEngine(storeA, new Construction());
    await engineA.initialize();
    const first = await engineA.evaluateKnowledgeClaim(request("first"));
    expect(first.outcome).toBe("accepted");
    if (first.outcome !== "accepted") throw new Error();
    const second = await engineA.evaluateKnowledgeClaim({
      ...request("second"),
      contradictsKnowledgeIdentity: first.record.knowledgeIdentity,
      contradictionDecision: "supersede-existing",
      contradictionReason: "Authoritative replacement.",
    });
    expect(second.outcome).toBe("accepted");
    await engineA.stop();
    const snapshotA = await storeA.loadKnowledgeLifecycleSnapshot();
    expect(snapshotA.status).toBe("loaded");
    await fixture.endRuntimePool(poolA);

    const poolB = fixture.createRuntimePool();
    expect(poolB).not.toBe(poolA);
    const backendB = await poolB.query(
      "SELECT pg_backend_pid()::integer AS backend_pid",
    );
    expect(backendB.rows[0]?.backend_pid).not.toBe(
      backendA.rows[0]?.backend_pid,
    );
    const storeB = new PostgreSQLKnowledgeStore(poolB);
    const engineB = new KnowledgeEngine(storeB, new Construction());
    await engineB.initialize();
    expect(engineB.listKnowledgeReferences({})).toMatchObject([
      { knowledgeIdentity: "postgresql-engine-2", currency: "current" },
    ]);
    expect(
      engineB.getKnowledge({
        knowledgeIdentity: "postgresql-engine-1",
      }).knowledge.claim,
    ).toBe("first");
    const snapshotB = await storeB.loadKnowledgeLifecycleSnapshot();
    expect(snapshotB).toEqual(snapshotA);
    if (snapshotB.status === "loaded") {
      expect(snapshotB.snapshot.entries).toMatchObject([
        {
          knowledgeIdentity: "postgresql-engine-1",
          standing: "superseded",
        },
        {
          knowledgeIdentity: "postgresql-engine-2",
          predecessorKnowledgeIdentity: "postgresql-engine-1",
          standing: "current",
        },
      ]);
    }
    await engineB.stop();
    await fixture.endRuntimePool(poolB);
  });

  it("enforces one winner for concurrent duplicate and supersession attempts", async () => {
    const fixture = await migratedFixture();
    const firstStore = new PostgreSQLKnowledgeStore(fixture.runtimePool);
    const secondStore = new PostgreSQLKnowledgeStore(fixture.runtimePool);
    const predecessor = integrationRecord("concurrent-a", 1);
    const independent = await firstStore.putIndependentAcceptedKnowledge({
      record: predecessor,
    });
    expect(independent.status).toBe("stored");

    const duplicateResults = await Promise.all([
      firstStore.putIndependentAcceptedKnowledge({
        record: integrationRecord("concurrent-duplicate", 1),
      }),
      secondStore.putIndependentAcceptedKnowledge({
        record: integrationRecord("concurrent-duplicate", 1),
      }),
    ]);
    expect(duplicateResults.map((result) => result.status).sort()).toEqual([
      "duplicate",
      "stored",
    ]);
    const duplicatePhysical = await fixture.migrationPool.query(
      `SELECT
         (SELECT count(*)::integer FROM knowledge.knowledge_record WHERE knowledge_identity = $1) AS records,
         (SELECT count(*)::integer FROM knowledge.knowledge_lifecycle WHERE knowledge_identity = $1) AS lifecycles`,
      [utf16be("concurrent-duplicate")],
    );
    expect(duplicatePhysical.rows).toEqual([{ records: 1, lifecycles: 1 }]);

    const successors = await Promise.all([
      firstStore.supersedeCurrentKnowledge({
        expectedPredecessorKnowledgeIdentity: knowledgeIdentity("concurrent-a"),
        expectedPredecessorVersion: knowledgeVersion(1),
        successor: integrationRecord("concurrent-b", 2, "concurrent-a"),
      }),
      secondStore.supersedeCurrentKnowledge({
        expectedPredecessorKnowledgeIdentity: knowledgeIdentity("concurrent-a"),
        expectedPredecessorVersion: knowledgeVersion(1),
        successor: integrationRecord("concurrent-c", 2, "concurrent-a"),
      }),
    ]);
    expect(successors.map((result) => result.status).sort()).toEqual([
      "stale-predecessor",
      "superseded",
    ]);
    const winnerIdentity =
      successors[0]?.status === "superseded" ? "concurrent-b" : "concurrent-c";
    const loserIdentity =
      winnerIdentity === "concurrent-b" ? "concurrent-c" : "concurrent-b";
    const physical = await fixture.migrationPool.query(
      `SELECT
         (SELECT count(*)::integer FROM knowledge.knowledge_record WHERE knowledge_identity = $1) AS winner_records,
         (SELECT count(*)::integer FROM knowledge.knowledge_lifecycle WHERE knowledge_identity = $1) AS winner_lifecycles,
         (SELECT count(*)::integer FROM knowledge.knowledge_record WHERE knowledge_identity = $2) AS loser_records,
         (SELECT count(*)::integer FROM knowledge.knowledge_lifecycle WHERE knowledge_identity = $2) AS loser_lifecycles,
         (SELECT standing FROM knowledge.knowledge_lifecycle WHERE knowledge_identity = $3) AS predecessor_standing`,
      [
        utf16be(winnerIdentity),
        utf16be(loserIdentity),
        utf16be("concurrent-a"),
      ],
    );
    expect(physical.rows).toEqual([
      {
        winner_records: 1,
        winner_lifecycles: 1,
        loser_records: 0,
        loser_lifecycles: 0,
        predecessor_standing: "superseded",
      },
    ]);
    const snapshot = await firstStore.loadKnowledgeLifecycleSnapshot();
    expect(snapshot.status).toBe("loaded");
    if (snapshot.status === "loaded") {
      expect(
        snapshot.snapshot.entries.filter(
          (entry) => entry.predecessorKnowledgeIdentity === "concurrent-a",
        ),
      ).toHaveLength(1);
    }
  });

  it("does not expose a record before its lifecycle transaction commits", async () => {
    const fixture = await migratedFixture();
    const gatedPool = new GatedPool(fixture.runtimePool);
    const store = new PostgreSQLKnowledgeStoreRuntime(gatedPool);
    const accepted = integrationRecord("visibility", 1);
    const mutation = store.putIndependentAcceptedKnowledge({
      record: accepted,
    });
    await gatedPool.inserted.promise;

    const invisible = await fixture.runtimePool.query(
      "SELECT count(*)::integer AS count FROM knowledge.knowledge_record WHERE knowledge_identity = $1",
      [utf16be("visibility")],
    );
    expect(invisible.rows).toEqual([{ count: 0 }]);
    gatedPool.continueAfterRecordInsert.resolve();
    await expect(mutation).resolves.toMatchObject({ status: "stored" });
    const visible = await fixture.runtimePool.query(
      "SELECT count(*)::integer AS count FROM knowledge.knowledge_record WHERE knowledge_identity = $1",
      [utf16be("visibility")],
    );
    expect(visible.rows).toEqual([{ count: 1 }]);
  });

  it("rolls back a real record insert when a later pre-commit step fails", async () => {
    const fixture = await migratedFixture();
    const store = new PostgreSQLKnowledgeStoreRuntime(
      new FailingLifecyclePool(fixture.runtimePool),
    );
    await expect(
      store.putIndependentAcceptedKnowledge({
        record: integrationRecord("rollback-after-record", 1),
      }),
    ).resolves.toEqual({ status: "invalid-state" });
    const state = await fixture.migrationPool.query(
      `SELECT
         (SELECT count(*)::integer FROM knowledge.knowledge_record WHERE knowledge_identity = $1) AS records,
         (SELECT count(*)::integer FROM knowledge.knowledge_lifecycle WHERE knowledge_identity = $1) AS lifecycles`,
      [utf16be("rollback-after-record")],
    );
    expect(state.rows).toEqual([{ records: 0, lifecycles: 0 }]);
  });

  it("round-trips the complete durable record mapping through PostgreSQL", async () => {
    const fixture = await migratedFixture();
    const store = new PostgreSQLKnowledgeStore(fixture.runtimePool);
    const predecessor = integrationRecord("mapping-predecessor", 1);
    const successor = structuredIntegrationRecord();
    await expect(
      store.putIndependentAcceptedKnowledge({ record: predecessor }),
    ).resolves.toMatchObject({ status: "stored" });
    await expect(
      store.supersedeCurrentKnowledge({
        expectedPredecessorKnowledgeIdentity: predecessor.knowledgeIdentity,
        expectedPredecessorVersion: knowledgeVersion(1),
        successor,
      }),
    ).resolves.toMatchObject({ status: "superseded" });
    await expect(store.get(successor.knowledgeIdentity)).resolves.toEqual({
      status: "found",
      record: successor,
    });
  });

  it("executes through the governed runtime role on PostgreSQL 16 or newer", async () => {
    const fixture = await migratedFixture();
    const result = await fixture.runtimePool.query(
      "SELECT current_user, current_setting('server_version_num')::integer AS server_version_num",
    );
    expect(result.rows[0]?.current_user).toBe(fixture.runtimeRole);
    expect(result.rows[0]?.server_version_num).toBeGreaterThanOrEqual(160000);
  });

  it("composes PostgreSQL Knowledge through explicit configuration and closes its Pool", async () => {
    const fixture = await migratedFixture();
    let composedPool: PgPool | undefined;
    const configuration = loadBootstrapConfiguration({
      ORION_KNOWLEDGE_STORE_MODE: "postgresql",
      ORION_POSTGRES_CONNECTION_STRING: fixture.databaseConnectionString,
    });
    const knowledge = await composeKnowledgeCapability(configuration, {
      poolFactory(config) {
        composedPool = new Pool({
          ...config,
          options: `-c role=${fixture.runtimeRole}`,
        });
        return composedPool;
      },
    });
    expect(knowledge.engineState).toBe("ready");
    const result =
      await knowledge.evaluateKnowledgeClaim.evaluateKnowledgeClaim({
        intent: "evaluate",
        claim: "Production composition integration claim.",
        acceptanceEvidence: {
          method: "explicit-authority-review",
          authorityIdentifier: "orion.test.production-composition",
          decision: "accept",
          reason: "Verify explicit PostgreSQL composition.",
        },
        provenance: {
          sourceType: "approved-internal-source",
          originatingCapability: "orion.test.production-composition",
          observedAt: "2026-08-24T00:00:00.000Z",
        },
      });
    expect(result.outcome).toBe("accepted");
    await knowledge.shutdown();
    expect(composedPool?.ended).toBe(true);
  });
});

registerKnowledgeStoreConformance(
  "PostgreSQLKnowledgeStore",
  {
    async createStore() {
      const fixture = await migratedFixture();
      return new PostgreSQLKnowledgeStore(fixture.runtimePool);
    },
  },
  integrationDescribe,
);

function request(claim: string) {
  return {
    intent: "evaluate" as const,
    claim,
    acceptanceEvidence: {
      method: "explicit-authority-review",
      authorityIdentifier: "orion.test.postgresql",
      decision: "accept",
      reason: "PostgreSQL integration acceptance.",
    },
    provenance: {
      sourceType: "approved-internal-source",
      originatingCapability: "orion.test.postgresql",
      observedAt: "2026-08-24T00:00:00.000Z",
    },
  };
}

function integrationRecord(
  identity: string,
  version: number,
  predecessor?: string,
) {
  return createKnowledgeRecord({
    knowledgeIdentity: identity,
    claim: identity,
    provenance: {
      sourceType: "approved-internal-source",
      originatingCapability: "orion.test.postgresql",
      observedAt: "2026-08-24T00:00:00.000Z",
    },
    acceptanceEvidence: {
      method: "explicit-authority-review",
      authorityIdentifier: "orion.test.postgresql",
      decision: "accept",
      reason: "PostgreSQL integration acceptance.",
    },
    acceptedAt: "2026-08-24T00:00:01.000Z",
    version,
    ...(predecessor === undefined
      ? {}
      : { supersedesKnowledgeIdentity: knowledgeIdentity(predecessor) }),
  });
}

function structuredIntegrationRecord() {
  return createKnowledgeRecord({
    ...integrationRecord("mapping-successor", 2, "mapping-predecessor"),
    provenance: {
      sourceType: "approved-internal-source",
      originatingCapability: "orion.test.postgresql.\ud800",
      observedAt: "2026-08-24T00:00:00.000Z",
      sourceReference: "mapping-source-\u0000-\udc00",
    },
    acceptanceEvidence: {
      method: "explicit-authority-review",
      authorityIdentifier: "orion.test.authority.\udfff",
      decision: "accept",
      reason: "Exact mapping e\u0301 é \ud800.",
    },
    acceptedStructuredProposition: {
      propositionIdentity: "mapping-proposition-\ud800",
      semanticValue: {
        subjectKey: "subject-\u0000",
        predicateKey: "predicate-\udc00",
        textualScalar: "Case case e\u0301 é \ud800\ud800",
      },
      sourceOwnershipCorrespondence: {
        currentnessOwner: "external-source-currentness",
        applicableOwner: "mapping-owner-\udfff",
        propositionSourceRelationship: "mapping-relationship-\u0000",
      },
    },
  });
}

interface Fixture {
  readonly runtimePool: PgPool;
  readonly migrationPool: PgPool;
  readonly runtimeRole: string;
  readonly databaseConnectionString: string;
  createRuntimePool(): PgPool;
  endRuntimePool(pool: PgPool): Promise<void>;
}

async function migratedFixture(): Promise<Fixture> {
  if (adminUrl === undefined)
    throw new Error("PostgreSQL fixture unavailable.");
  const suffix = randomBytes(8).toString("hex");
  const database = `orion_adapter_${suffix}`;
  const runtimeRole = `orion_adapter_runtime_${suffix}`;
  const admin = new Pool({ connectionString: adminUrl, max: 1 });
  await admin.query(`CREATE ROLE "${runtimeRole}" NOLOGIN`);
  await admin.query(`CREATE DATABASE "${database}"`);
  const databaseUrl = new URL(adminUrl);
  databaseUrl.pathname = `/${database}`;
  const migrationPool = new Pool({
    connectionString: databaseUrl.toString(),
    max: 2,
  });
  const runner = await migrationRunner();
  await runner({ pool: migrationPool, runtimeRole });
  const runtimePools = new Set<PgPool>();
  const createRuntimePool = (): PgPool => {
    const pool = new Pool({
      connectionString: databaseUrl.toString(),
      max: 4,
      options: `-c role=${runtimeRole}`,
    });
    runtimePools.add(pool);
    return pool;
  };
  const runtimePool = createRuntimePool();

  cleanup.push(async () => {
    for (const pool of runtimePools) await pool.end();
    runtimePools.clear();
    await migrationPool.end();
    await admin.query(
      "SELECT pg_terminate_backend(pid) FROM pg_stat_activity WHERE datname = $1",
      [database],
    );
    await admin.query(`DROP DATABASE IF EXISTS "${database}"`);
    await admin.query(`DROP ROLE IF EXISTS "${runtimeRole}"`);
    await admin.end();
  });
  return {
    runtimePool,
    migrationPool,
    runtimeRole,
    databaseConnectionString: databaseUrl.toString(),
    createRuntimePool,
    async endRuntimePool(pool) {
      if (runtimePools.delete(pool)) await pool.end();
    },
  };
}

async function migrationRunner(): Promise<
  (options: { pool: PgPool; runtimeRole: string }) => Promise<unknown>
> {
  const url = new URL(
    "../../../tools/knowledge-store-migrations/knowledge-store-migration-runner.mjs",
    import.meta.url,
  ).href;
  const loaded: unknown = await import(url);
  if (typeof loaded !== "object" || loaded === null) throw new Error();
  const runner = Reflect.get(loaded, "runKnowledgeStoreMigrations");
  if (typeof runner !== "function") throw new Error();
  return runner;
}

function utf16be(value: string): Buffer {
  const output = Buffer.alloc(value.length * 2);
  for (let index = 0; index < value.length; index += 1) {
    output.writeUInt16BE(value.charCodeAt(index), index * 2);
  }
  return output;
}

function codeUnits(value: string): number[] {
  return Array.from({ length: value.length }, (_, index) =>
    value.charCodeAt(index),
  );
}
