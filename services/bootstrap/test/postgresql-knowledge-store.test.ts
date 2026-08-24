import {
  createKnowledgeRecord,
  knowledgeIdentity,
  knowledgeVersion,
  type KnowledgeConstructionValues,
  type KnowledgeRecord,
  type KnowledgeStore,
} from "@orion/core";
import { describe, expect, it } from "vitest";
import type { Pool } from "pg";

import type { PostgreSQLKnowledgeStore } from "../src/knowledge/postgresql-knowledge-store.js";
import {
  PostgreSQLKnowledgeStoreError,
  PostgreSQLKnowledgeStoreRuntime,
  decodeOrionJsUtf16Be,
  encodeOrionJsUtf16Be,
  type PostgreSqlKnowledgeClient,
  type PostgreSqlKnowledgePool,
  type PostgreSqlQueryResult,
} from "../src/knowledge/postgresql-knowledge-store-internal.js";

type Step = Readonly<{
  verify(text: string, values: readonly unknown[] | undefined): void;
  result: PostgreSqlQueryResult | Error;
}>;

class ScriptedClient implements PostgreSqlKnowledgeClient {
  public readonly calls: string[] = [];
  public releasedWith: boolean | Error | undefined;

  public constructor(private readonly steps: Step[]) {}

  public async query(
    text: string,
    values?: readonly unknown[],
  ): Promise<PostgreSqlQueryResult> {
    this.calls.push(text);
    const step = this.steps.shift();
    if (step === undefined) throw new Error("Unexpected PostgreSQL query.");
    step.verify(text, values);
    if (step.result instanceof Error) throw step.result;
    return step.result;
  }

  public release(destroy?: boolean | Error): void {
    this.releasedWith = destroy;
  }

  public expectComplete(): void {
    expect(this.steps).toHaveLength(0);
  }
}

class ScriptedPool implements PostgreSqlKnowledgePool {
  public constructor(private readonly client: PostgreSqlKnowledgeClient) {}

  public async connect(): Promise<PostgreSqlKnowledgeClient> {
    return this.client;
  }
}

const empty = Object.freeze({ rows: [], rowCount: 0 });

function step(
  pattern: RegExp,
  result: PostgreSqlQueryResult | Error = empty,
): Step {
  return {
    verify(text) {
      expect(text).toMatch(pattern);
    },
    result,
  };
}

function pgError(code: string, constraint?: string): Error {
  return Object.assign(new Error("private PostgreSQL failure"), {
    code,
    ...(constraint === undefined ? {} : { constraint }),
  });
}

function record(
  identity = "knowledge-\u0000-É-e\u0301-😀",
  predecessor?: string,
): KnowledgeRecord {
  return createKnowledgeRecord({
    knowledgeIdentity: identity,
    claim: "Case-A case-a combining-e\u0301 precomposed-é 😀 \u0000",
    provenance: {
      sourceType: "approved-internal-source",
      originatingCapability: "orion.test.postgresql",
      observedAt: "2026-08-24T00:00:00.000Z",
      sourceReference: "source-\u0000-reference",
    },
    acceptanceEvidence: {
      method: "explicit-authority-review",
      authorityIdentifier: "orion.test.authority",
      decision: "accept",
      reason: "PostgreSQL adapter conformance.",
    },
    acceptedAt: "2026-08-24T00:00:01.000Z",
    version: predecessor === undefined ? 1 : 2,
    ...(predecessor === undefined
      ? {}
      : { supersedesKnowledgeIdentity: predecessor }),
  });
}

function physicalRow(value: KnowledgeRecord): Record<string, unknown> {
  const proposition = value.acceptedStructuredProposition;
  const ownership = proposition?.sourceOwnershipCorrespondence;
  return {
    knowledge_identity: encodeOrionJsUtf16Be(value.knowledgeIdentity),
    claim: encodeOrionJsUtf16Be(value.claim),
    provenance_source_type: value.provenance.sourceType,
    provenance_originating_capability: encodeOrionJsUtf16Be(
      value.provenance.originatingCapability,
    ),
    provenance_observed_at: value.provenance.observedAt,
    provenance_source_reference:
      value.provenance.sourceReference === undefined
        ? null
        : encodeOrionJsUtf16Be(value.provenance.sourceReference),
    acceptance_method: value.acceptanceEvidence.method,
    acceptance_authority_identifier: encodeOrionJsUtf16Be(
      value.acceptanceEvidence.authorityIdentifier,
    ),
    acceptance_reason: encodeOrionJsUtf16Be(value.acceptanceEvidence.reason),
    accepted_at: value.acceptedAt,
    version: String(value.version),
    supersedes_knowledge_identity:
      value.supersedesKnowledgeIdentity === undefined
        ? null
        : encodeOrionJsUtf16Be(value.supersedesKnowledgeIdentity),
    proposition_identity:
      proposition === undefined
        ? null
        : encodeOrionJsUtf16Be(proposition.propositionIdentity),
    proposition_subject_key:
      proposition === undefined
        ? null
        : encodeOrionJsUtf16Be(proposition.semanticValue.subjectKey),
    proposition_predicate_key:
      proposition === undefined
        ? null
        : encodeOrionJsUtf16Be(proposition.semanticValue.predicateKey),
    proposition_textual_scalar:
      proposition === undefined
        ? null
        : encodeOrionJsUtf16Be(proposition.semanticValue.textualScalar),
    proposition_currentness_owner: ownership?.currentnessOwner ?? null,
    proposition_applicable_owner:
      ownership?.currentnessOwner === "external-source-currentness"
        ? encodeOrionJsUtf16Be(ownership.applicableOwner)
        : null,
    proposition_source_relationship:
      ownership?.currentnessOwner === "external-source-currentness"
        ? encodeOrionJsUtf16Be(ownership.propositionSourceRelationship)
        : null,
  };
}

function structuredRecord(): KnowledgeRecord {
  return createKnowledgeRecord({
    ...record("structured"),
    acceptedStructuredProposition: {
      propositionIdentity: "proposition-😀",
      semanticValue: {
        subjectKey: "subject",
        predicateKey: "predicate",
        textualScalar: "exact-\u0000-e\u0301-é-😀",
      },
      sourceOwnershipCorrespondence: {
        currentnessOwner: "external-source-currentness",
        applicableOwner: "source-owner",
        propositionSourceRelationship: "source-relationship",
      },
    },
  });
}

function runtime(client: ScriptedClient): PostgreSQLKnowledgeStoreRuntime {
  return new PostgreSQLKnowledgeStoreRuntime(new ScriptedPool(client));
}

describe("PostgreSQL Knowledge Store", () => {
  it("keeps the public adapter on the unified KnowledgeStore and injected Pool boundary", () => {
    type Constructor = ConstructorParameters<typeof PostgreSQLKnowledgeStore>;
    type Expected = [pool: Pool];
    const exactConstructor: Constructor extends Expected
      ? Expected extends Constructor
        ? true
        : false
      : false = true;
    const storeType: KnowledgeStore | undefined = undefined;
    const constructionType: KnowledgeConstructionValues | undefined = undefined;
    expect(exactConstructor).toBe(true);
    expect(storeType).toBeUndefined();
    expect(constructionType).toBeUndefined();
  });

  it("round-trips exact UTF-16BE code units without normalization", () => {
    const values = [
      "\u0000",
      "e\u0301",
      "é",
      "Case case",
      "\ud83d\ude00",
      "\ud800",
      "\udbff",
      "\udc00",
      "\udfff",
      "\ud800A",
      "A\udc00",
      "\ud800\ud800",
      "\udc00\udc00",
      "\ud800A\udc00\ud83d\ude00\u0000",
      "punctuation:—:؟",
      "x".repeat(128),
    ];
    for (const value of values) {
      const decoded = decodeOrionJsUtf16Be(encodeOrionJsUtf16Be(value));
      expect(decoded).toBe(value);
      expect(
        Array.from({ length: decoded.length }, (_, index) =>
          decoded.charCodeAt(index),
        ),
      ).toEqual(
        Array.from({ length: value.length }, (_, index) =>
          value.charCodeAt(index),
        ),
      );
    }
    expect(encodeOrionJsUtf16Be("\u0000")).toEqual(Buffer.from([0, 0]));
    expect(encodeOrionJsUtf16Be("\ud800\udfff")).toEqual(
      Buffer.from([0xd8, 0x00, 0xdf, 0xff]),
    );
    expect(decodeOrionJsUtf16Be(Buffer.from([0xdc, 0x00]))).toBe("\udc00");
    expect(() => decodeOrionJsUtf16Be(Buffer.from([0xd8]))).toThrow(
      PostgreSQLKnowledgeStoreError,
    );
  });

  it("stores independent acceptance in one transaction with opaque order", async () => {
    const accepted = record();
    const client = new ScriptedClient([
      step(/^BEGIN$/),
      step(/nextval\('knowledge\.knowledge_acceptance_order_seq'\)/, {
        rows: [{ sequence_value: "41" }],
        rowCount: 1,
      }),
      step(/^INSERT INTO knowledge\.knowledge_record/),
      step(/^INSERT INTO knowledge\.knowledge_lifecycle/),
      step(/^COMMIT$/),
    ]);

    await expect(
      runtime(client).putIndependentAcceptedKnowledge({ record: accepted }),
    ).resolves.toEqual({
      status: "stored",
      knowledgeIdentity: accepted.knowledgeIdentity,
      acceptanceOrder: "knowledge-acceptance-v1:41",
    });
    expect(client.releasedWith).toBe(false);
    client.expectComplete();
  });

  it("maps only the governed identity constraint to duplicate", async () => {
    const accepted = record();
    const client = new ScriptedClient([
      step(/^BEGIN$/),
      step(/nextval/, { rows: [{ sequence_value: "1" }], rowCount: 1 }),
      step(
        /^INSERT INTO knowledge\.knowledge_record/,
        pgError("23505", "knowledge_record_identity_pk"),
      ),
      step(/^ROLLBACK$/),
    ]);
    await expect(
      runtime(client).putIndependentAcceptedKnowledge({ record: accepted }),
    ).resolves.toEqual({ status: "duplicate" });
    client.expectComplete();
  });

  it("returns ambiguous and discards the client when COMMIT outcome is unknown", async () => {
    const accepted = record();
    const client = new ScriptedClient([
      step(/^BEGIN$/),
      step(/nextval/, { rows: [{ sequence_value: "1" }], rowCount: 1 }),
      step(/^INSERT INTO knowledge\.knowledge_record/),
      step(/^INSERT INTO knowledge\.knowledge_lifecycle/),
      step(/^COMMIT$/, pgError("08006")),
    ]);
    await expect(
      runtime(client).putIndependentAcceptedKnowledge({ record: accepted }),
    ).resolves.toEqual({ status: "ambiguous" });
    expect(client.releasedWith).toBe(true);
    expect(client.calls).not.toContain("ROLLBACK");
  });

  it("preserves a known result and destroys the client when rollback fails", async () => {
    const accepted = record();
    const client = new ScriptedClient([
      step(/^BEGIN$/),
      step(/nextval/, { rows: [{ sequence_value: "1" }], rowCount: 1 }),
      step(
        /^INSERT INTO knowledge\.knowledge_record/,
        pgError("23505", "knowledge_record_identity_pk"),
      ),
      step(/^ROLLBACK$/, pgError("08006")),
    ]);
    await expect(
      runtime(client).putIndependentAcceptedKnowledge({ record: accepted }),
    ).resolves.toEqual({ status: "duplicate" });
    expect(client.releasedWith).toBe(true);
    expect(client.calls).not.toContain("COMMIT");
    client.expectComplete();
  });

  it("maps pool acquisition and read failures without inventing ambiguity", async () => {
    const unavailablePool: PostgreSqlKnowledgePool = {
      async connect() {
        throw pgError("08006");
      },
    };
    const store = new PostgreSQLKnowledgeStoreRuntime(unavailablePool);
    await expect(store.get(knowledgeIdentity("unavailable"))).resolves.toEqual({
      status: "unavailable",
    });
    await expect(store.loadKnowledgeLifecycleSnapshot()).resolves.toEqual({
      status: "unavailable",
    });
    await expect(
      store.putIndependentAcceptedKnowledge({ record: record("unavailable") }),
    ).resolves.toEqual({ status: "unavailable" });
  });

  it("classifies missing and stale predecessors inside the transaction", async () => {
    for (const fixture of [
      { rows: [], expected: "predecessor-not-found" },
      {
        rows: [{ version: "1", standing: "superseded" }],
        expected: "stale-predecessor",
      },
    ]) {
      const predecessor = "predecessor";
      const successor = record(`successor-${fixture.expected}`, predecessor);
      const client = new ScriptedClient([
        step(/^BEGIN$/),
        step(/^UPDATE knowledge\.knowledge_lifecycle/, empty),
        step(/^SELECT record\.version/, {
          rows: fixture.rows,
          rowCount: fixture.rows.length,
        }),
        step(/^ROLLBACK$/),
      ]);
      await expect(
        runtime(client).supersedeCurrentKnowledge({
          expectedPredecessorKnowledgeIdentity: knowledgeIdentity(predecessor),
          expectedPredecessorVersion: knowledgeVersion(1),
          successor,
        }),
      ).resolves.toEqual({ status: fixture.expected });
      client.expectComplete();
    }
  });

  it("retrieves immutable historical records and derives snapshot order", async () => {
    const first = record("first");
    const second = record("second", "first");
    const getClient = new ScriptedClient([
      step(/^SELECT r\.knowledge_identity/, {
        rows: [physicalRow(second)],
        rowCount: 1,
      }),
    ]);
    await expect(
      runtime(getClient).get(second.knowledgeIdentity),
    ).resolves.toEqual({ status: "found", record: second });

    const snapshotClient = new ScriptedClient([
      step(/^SELECT r\.knowledge_identity/, {
        rows: [
          {
            ...physicalRow(first),
            standing: "superseded",
            acceptance_order: "knowledge-acceptance-v1:1",
          },
          {
            ...physicalRow(second),
            standing: "current",
            acceptance_order: "knowledge-acceptance-v1:2",
          },
        ],
        rowCount: 2,
      }),
    ]);
    const snapshot =
      await runtime(snapshotClient).loadKnowledgeLifecycleSnapshot();
    expect(snapshot.status).toBe("loaded");
    if (snapshot.status === "loaded") {
      expect(
        snapshot.snapshot.entries.map((entry) => entry.knowledgeIdentity),
      ).toEqual(["first", "second"]);
      expect(snapshot.snapshot.entries[1]).toMatchObject({
        predecessorKnowledgeIdentity: "first",
        standing: "current",
      });
    }
  });

  it("reconstructs every structured proposition operand through Core", async () => {
    const structured = structuredRecord();
    const client = new ScriptedClient([
      step(/^SELECT r\.knowledge_identity/, {
        rows: [physicalRow(structured)],
        rowCount: 1,
      }),
    ]);
    await expect(
      runtime(client).get(structured.knowledgeIdentity),
    ).resolves.toEqual({
      status: "found",
      record: structured,
    });
  });

  it("fails closed on malformed persisted proposition shape", async () => {
    const malformed = {
      ...physicalRow(record("malformed")),
      proposition_subject_key: encodeOrionJsUtf16Be("unexpected"),
    };
    const client = new ScriptedClient([
      step(/^SELECT r\.knowledge_identity/, {
        rows: [malformed],
        rowCount: 1,
      }),
    ]);
    await expect(
      runtime(client).get(knowledgeIdentity("malformed")),
    ).rejects.toBeInstanceOf(PostgreSQLKnowledgeStoreError);
  });

  it("fails closed without row details on malformed UTF-16BE byte shape", async () => {
    const malformed = {
      ...physicalRow(record("malformed-bytes")),
      claim: Buffer.from([0xd8]),
    };
    const client = new ScriptedClient([
      step(/^SELECT r\.knowledge_identity/, {
        rows: [malformed],
        rowCount: 1,
      }),
    ]);
    const failure = await runtime(client)
      .get(knowledgeIdentity("malformed-bytes"))
      .catch((error: unknown) => error);
    expect(failure).toBeInstanceOf(PostgreSQLKnowledgeStoreError);
    expect((failure as Error).message).toBe(
      "PostgreSQL Knowledge Store operation failed.",
    );
    expect((failure as Error).message).not.toContain("malformed-bytes");
  });

  it("keeps legacy put record-only and rejects predecessor linkage on independent acceptance", async () => {
    const predecessor = record("legacy-predecessor");
    const client = new ScriptedClient([
      step(/^INSERT INTO knowledge\.knowledge_record/),
    ]);
    await expect(runtime(client).put(predecessor)).resolves.toEqual({
      status: "stored",
      knowledgeIdentity: predecessor.knowledgeIdentity,
    });
    expect(
      client.calls.some((query) => query.includes("knowledge_lifecycle")),
    ).toBe(false);

    const successor = record("invalid-independent", "legacy-predecessor");
    const noConnectionPool: PostgreSqlKnowledgePool = {
      async connect() {
        throw new Error("must not connect");
      },
    };
    await expect(
      new PostgreSQLKnowledgeStoreRuntime(
        noConnectionPool,
      ).putIndependentAcceptedKnowledge({ record: successor }),
    ).resolves.toEqual({ status: "invalid-state" });

    const loneSurrogateRecord = createKnowledgeRecord({
      ...record("valid-utf16-code-units"),
      claim: "\ud800\udc00\udfff",
    });
    expect(loneSurrogateRecord.claim).toBe("\ud800\udc00\udfff");
  });
});
