import { describe, expect, expectTypeOf, it } from "vitest";

import {
  InvalidKnowledgeLifecycleSnapshotEntryValueError,
  InvalidKnowledgeLifecycleSnapshotValueError,
  InvalidKnowledgeStoreRequestValueError,
  InvalidKnowledgeStoreResultValueError,
  InvalidKnowledgeAcceptanceOrderValueError,
  InvalidKnowledgeLifecycleStandingValueError,
  createKnowledgeLifecycleSnapshot,
  createKnowledgeLifecycleSnapshotEntry,
  createKnowledgeLifecycleSnapshotResult,
  createKnowledgeRecord,
  createKnowledgeReference,
  createKnowledgeOwnedSourceCurrentnessDetermination,
  createPutIndependentAcceptedKnowledgeRequest,
  createPutIndependentAcceptedKnowledgeResult,
  createSupersedeCurrentKnowledgeRequest,
  createSupersedeCurrentKnowledgeResult,
  knowledgeAcceptanceOrder,
  knowledgeIdentity,
  knowledgeLifecycleStanding,
  type KnowledgeLifecycleStore,
  type KnowledgeStore,
  type KnowledgeAcceptanceDecision,
  type EvaluateKnowledgeClaim,
  type GetKnowledge,
  type KnowledgeStoreGetResult,
  type KnowledgeStorePutResult,
  type ListKnowledgeReferences,
  type ProjectStructuredKnowledge,
  type PutIndependentAcceptedKnowledgeResult,
  type SupersedeCurrentKnowledgeResult,
} from "../src/index.js";

const record = (
  identity = "knowledge-1",
  version = 1,
  supersedesKnowledgeIdentity?: string,
) =>
  createKnowledgeRecord({
    knowledgeIdentity: identity,
    claim: "A durable Knowledge claim.",
    provenance: {
      sourceType: "approved-internal-source",
      originatingCapability: "orion.test",
      observedAt: "2026-07-20T00:00:00.000Z",
    },
    acceptanceEvidence: {
      method: "explicit-authority-review",
      authorityIdentifier: "orion.test.authority",
      decision: "accept",
      reason: "Reviewed for deterministic testing.",
    },
    acceptedAt: "2026-07-20T00:01:00.000Z",
    version,
    ...(supersedesKnowledgeIdentity ? { supersedesKnowledgeIdentity } : {}),
  });

type OptionalKeys<T> = {
  [Key in keyof T]-?: object extends Pick<T, Key> ? Key : never;
}[keyof T];

describe("Knowledge durable lifecycle Core language", () => {
  it("validates and preserves opaque acceptance order exactly", () => {
    expect(knowledgeAcceptanceOrder("order-007")).toBe("order-007");
    expect(knowledgeAcceptanceOrder(" order-007 ")).toBe(" order-007 ");
    expect(knowledgeAcceptanceOrder("order-007")).not.toBe(
      knowledgeAcceptanceOrder("order-008"),
    );
    for (const value of ["", "   ", 0, 1, null, {}, []]) {
      expect(() => knowledgeAcceptanceOrder(value)).toThrow(
        InvalidKnowledgeAcceptanceOrderValueError,
      );
    }
  });

  it("accepts only the closed lifecycle standing values", () => {
    expect(knowledgeLifecycleStanding("current")).toBe("current");
    expect(knowledgeLifecycleStanding("superseded")).toBe("superseded");
    expect(() => knowledgeLifecycleStanding("archived")).toThrow(
      InvalidKnowledgeLifecycleStandingValueError,
    );
  });

  it("constructs immutable snapshot entries without semantic graph validation", () => {
    const current = createKnowledgeLifecycleSnapshotEntry({
      knowledgeIdentity: "knowledge-1",
      version: 1,
      standing: "current",
      acceptanceOrder: "order-001",
    });
    const successor = createKnowledgeLifecycleSnapshotEntry({
      knowledgeIdentity: "knowledge-2",
      version: 2,
      predecessorKnowledgeIdentity: "knowledge-1",
      standing: "superseded",
      acceptanceOrder: "order-002",
    });
    expect(current.predecessorKnowledgeIdentity).toBeUndefined();
    expect(successor.predecessorKnowledgeIdentity).toBe("knowledge-1");
    expect(Object.isFrozen(current)).toBe(true);
    expect(() =>
      createKnowledgeLifecycleSnapshotEntry({
        ...current,
        standing: "unknown",
      }),
    ).toThrow(InvalidKnowledgeLifecycleSnapshotEntryValueError);
    expect(() =>
      createKnowledgeLifecycleSnapshotEntry({
        ...current,
        acceptanceOrder: "",
      }),
    ).toThrow(InvalidKnowledgeLifecycleSnapshotEntryValueError);
  });

  it("preserves snapshot entry order and permits empty snapshots", () => {
    const supplied = [
      {
        knowledgeIdentity: "knowledge-2",
        version: 2,
        predecessorKnowledgeIdentity: "knowledge-1",
        standing: "current",
        acceptanceOrder: "order-002",
      },
      {
        knowledgeIdentity: "knowledge-1",
        version: 1,
        standing: "superseded",
        acceptanceOrder: "order-001",
      },
    ];
    const snapshot = createKnowledgeLifecycleSnapshot({ entries: supplied });
    expect(snapshot.entries.map((entry) => entry.knowledgeIdentity)).toEqual([
      "knowledge-2",
      "knowledge-1",
    ]);
    expect(Object.isFrozen(snapshot)).toBe(true);
    expect(Object.isFrozen(snapshot.entries)).toBe(true);
    expect(createKnowledgeLifecycleSnapshot({ entries: [] }).entries).toEqual(
      [],
    );
    expect(() => createKnowledgeLifecycleSnapshot({ entries: [{}] })).toThrow(
      InvalidKnowledgeLifecycleSnapshotValueError,
    );
  });

  it("closes independent acceptance around one accepted record", () => {
    const request = createPutIndependentAcceptedKnowledgeRequest({
      record: record(),
    });
    expect(request.record.knowledgeIdentity).toBe("knowledge-1");
    expect(Object.isFrozen(request)).toBe(true);
    expect(() =>
      createPutIndependentAcceptedKnowledgeRequest({
        record: record(),
        standing: "current",
      }),
    ).toThrow(InvalidKnowledgeStoreRequestValueError);
    expect(() =>
      createPutIndependentAcceptedKnowledgeRequest({
        record: record(),
        acceptanceOrder: "order-001",
      }),
    ).toThrow(InvalidKnowledgeStoreRequestValueError);

    expect(
      createPutIndependentAcceptedKnowledgeResult({
        status: "stored",
        knowledgeIdentity: "knowledge-1",
        acceptanceOrder: "order-001",
      }),
    ).toEqual({
      status: "stored",
      knowledgeIdentity: "knowledge-1",
      acceptanceOrder: "order-001",
    });
    expect(() =>
      createPutIndependentAcceptedKnowledgeResult({
        status: "stored",
        knowledgeIdentity: "knowledge-1",
        acceptanceOrder: "order-001",
        standing: "current",
      }),
    ).toThrow(InvalidKnowledgeStoreResultValueError);
  });

  it("requires expected predecessor state for supersession", () => {
    const request = createSupersedeCurrentKnowledgeRequest({
      expectedPredecessorKnowledgeIdentity: "knowledge-1",
      expectedPredecessorVersion: 1,
      successor: record("knowledge-2", 2, "knowledge-1"),
    });
    expect(request.expectedPredecessorVersion).toBe(1);
    expect(request.successor.knowledgeIdentity).toBe("knowledge-2");
    expect(() =>
      createSupersedeCurrentKnowledgeRequest({
        expectedPredecessorKnowledgeIdentity: "knowledge-1",
        expectedPredecessorVersion: 1,
        successor: record("knowledge-2", 2, "knowledge-1"),
        acceptanceOrder: "order-002",
      }),
    ).toThrow(InvalidKnowledgeStoreRequestValueError);
    expect(() =>
      createSupersedeCurrentKnowledgeRequest({
        expectedPredecessorKnowledgeIdentity: "knowledge-1",
        expectedPredecessorVersion: 1,
        successor: record("knowledge-2", 2, "knowledge-1"),
        standing: "current",
      }),
    ).toThrow(InvalidKnowledgeStoreRequestValueError);
    expect(() =>
      createSupersedeCurrentKnowledgeRequest({
        expectedPredecessorKnowledgeIdentity: "knowledge-1",
        expectedPredecessorVersion: 1,
        successor: record("knowledge-2", 2),
      }),
    ).toThrow(InvalidKnowledgeStoreRequestValueError);
    expect(() =>
      createSupersedeCurrentKnowledgeRequest({
        expectedPredecessorKnowledgeIdentity: "knowledge-1",
        expectedPredecessorVersion: 1,
        successor: record("knowledge-2", 2, "knowledge-other"),
      }),
    ).toThrow(InvalidKnowledgeStoreRequestValueError);

    expect(
      createSupersedeCurrentKnowledgeResult({
        status: "superseded",
        predecessorKnowledgeIdentity: "knowledge-1",
        successorKnowledgeIdentity: "knowledge-2",
        acceptanceOrder: "order-002",
      }),
    ).toEqual({
      status: "superseded",
      predecessorKnowledgeIdentity: "knowledge-1",
      successorKnowledgeIdentity: "knowledge-2",
      acceptanceOrder: "order-002",
    });
    expect(
      createSupersedeCurrentKnowledgeResult({ status: "stale-predecessor" }),
    ).toEqual({ status: "stale-predecessor" });
  });

  it("reconstructs the successor and isolates caller-owned nested input", () => {
    const source = record("knowledge-2", 2, "knowledge-1");
    const successorInput = {
      ...source,
      provenance: { ...source.provenance },
      acceptanceEvidence: { ...source.acceptanceEvidence },
    };
    const request = createSupersedeCurrentKnowledgeRequest({
      expectedPredecessorKnowledgeIdentity: "knowledge-1",
      expectedPredecessorVersion: 1,
      successor: successorInput,
    });
    Reflect.set(successorInput.provenance, "originatingCapability", "mutated");
    Reflect.set(successorInput.acceptanceEvidence, "reason", "mutated");
    expect(request.successor.provenance.originatingCapability).toBe(
      source.provenance.originatingCapability,
    );
    expect(request.successor.acceptanceEvidence.reason).toBe(
      source.acceptanceEvidence.reason,
    );
  });

  it("keeps known Store failures distinct from ambiguous completion", () => {
    expect(
      createPutIndependentAcceptedKnowledgeResult({ status: "unavailable" }),
    ).toEqual({ status: "unavailable" });
    expect(
      createSupersedeCurrentKnowledgeResult({
        status: "predecessor-not-found",
      }),
    ).toEqual({ status: "predecessor-not-found" });
    expect(
      createKnowledgeLifecycleSnapshotResult({ status: "invalid-state" }),
    ).toEqual({ status: "invalid-state" });
    const independentAmbiguous = createPutIndependentAcceptedKnowledgeResult({
      status: "ambiguous",
    });
    const supersessionAmbiguous = createSupersedeCurrentKnowledgeResult({
      status: "ambiguous",
    });
    expect(independentAmbiguous).toEqual({ status: "ambiguous" });
    expect(supersessionAmbiguous).toEqual({ status: "ambiguous" });
    expect(Object.isFrozen(independentAmbiguous)).toBe(true);
    expect(Object.isFrozen(supersessionAmbiguous)).toBe(true);
    expect(() =>
      createPutIndependentAcceptedKnowledgeResult({
        status: "ambiguous",
        sqlState: "08006",
      }),
    ).toThrow(InvalidKnowledgeStoreResultValueError);
    expect(() =>
      createSupersedeCurrentKnowledgeResult({
        status: "ambiguous",
        transactionId: "private-transaction",
      }),
    ).toThrow(InvalidKnowledgeStoreResultValueError);
  });

  it("does not add lifecycle metadata to public references", () => {
    const reference = createKnowledgeReference({
      knowledgeIdentity: "knowledge-1",
      version: 1,
      currency: "current",
    });
    expect(reference).not.toHaveProperty("acceptanceOrder");
    expect(reference).not.toHaveProperty("standing");
    expect(reference).not.toHaveProperty("predecessorKnowledgeIdentity");
  });

  it("exports one Promise-based Store execution model", async () => {
    const store = {
      put: async () => ({
        status: "stored",
        knowledgeIdentity: "knowledge-1",
      }),
      get: async () => ({ status: "not-found" }),
      putIndependentAcceptedKnowledge: async () => ({
        status: "stored",
        knowledgeIdentity: knowledgeIdentity("knowledge-1"),
        acceptanceOrder: knowledgeAcceptanceOrder("order-001"),
      }),
      supersedeCurrentKnowledge: async () => ({
        status: "stale-predecessor",
      }),
      loadKnowledgeLifecycleSnapshot: async () => ({
        status: "loaded",
        snapshot: createKnowledgeLifecycleSnapshot({ entries: [] }),
      }),
    } satisfies KnowledgeStore;
    const lifecycleStore: KnowledgeLifecycleStore = store;
    const unifiedStore: KnowledgeStore = lifecycleStore;
    expect((await store.loadKnowledgeLifecycleSnapshot()).status).toBe(
      "loaded",
    );
    expect(unifiedStore).toBe(store);
    expectTypeOf<OptionalKeys<KnowledgeStore>>().toEqualTypeOf<never>();
    expectTypeOf<KnowledgeStore>().toMatchTypeOf<KnowledgeLifecycleStore>();
    expectTypeOf<KnowledgeLifecycleStore>().toMatchTypeOf<KnowledgeStore>();
    expectTypeOf<KnowledgeStore["put"]>().returns.toEqualTypeOf<
      Promise<KnowledgeStorePutResult>
    >();
    expectTypeOf<KnowledgeStore["get"]>().returns.toEqualTypeOf<
      Promise<KnowledgeStoreGetResult>
    >();
    expectTypeOf<
      KnowledgeStore["putIndependentAcceptedKnowledge"]
    >().returns.toEqualTypeOf<Promise<PutIndependentAcceptedKnowledgeResult>>();
    expectTypeOf<
      KnowledgeStore["supersedeCurrentKnowledge"]
    >().returns.toEqualTypeOf<Promise<SupersedeCurrentKnowledgeResult>>();
    expectTypeOf<
      KnowledgeStore["loadKnowledgeLifecycleSnapshot"]
    >().returns.toEqualTypeOf<
      Promise<ReturnType<typeof createKnowledgeLifecycleSnapshotResult>>
    >();
  });

  it("rejects every incomplete unified Store shape at typecheck", () => {
    const complete: KnowledgeStore = {
      put: async () => ({ status: "duplicate" }),
      get: async () => ({ status: "not-found" }),
      putIndependentAcceptedKnowledge: async () => ({ status: "duplicate" }),
      supersedeCurrentKnowledge: async () => ({
        status: "predecessor-not-found",
      }),
      loadKnowledgeLifecycleSnapshot: async () => ({
        status: "unavailable",
      }),
    };

    const { putIndependentAcceptedKnowledge, ...missingIndependentPut } =
      complete;
    const { supersedeCurrentKnowledge, ...missingSupersession } = complete;
    const { loadKnowledgeLifecycleSnapshot, ...missingSnapshotLoad } = complete;
    const putAndGetOnly = { put: complete.put, get: complete.get };

    // @ts-expect-error The durable independent-acceptance operation is required.
    const invalidIndependentPut: KnowledgeStore = missingIndependentPut;
    // @ts-expect-error The durable supersession operation is required.
    const invalidSupersession: KnowledgeStore = missingSupersession;
    // @ts-expect-error Authoritative lifecycle reconstruction is required.
    const invalidSnapshotLoad: KnowledgeStore = missingSnapshotLoad;
    // @ts-expect-error A put/get-only Store is not the unified Knowledge Store port.
    const invalidPutAndGetOnly: KnowledgeStore = putAndGetOnly;

    expect(putIndependentAcceptedKnowledge).toBe(
      complete.putIndependentAcceptedKnowledge,
    );
    expect(supersedeCurrentKnowledge).toBe(complete.supersedeCurrentKnowledge);
    expect(loadKnowledgeLifecycleSnapshot).toBe(
      complete.loadKnowledgeLifecycleSnapshot,
    );
    expect(invalidIndependentPut).toBe(missingIndependentPut);
    expect(invalidSupersession).toBe(missingSupersession);
    expect(invalidSnapshotLoad).toBe(missingSnapshotLoad);
    expect(invalidPutAndGetOnly).toBe(putAndGetOnly);
  });

  it("changes only mutation-capable public Knowledge execution to async", () => {
    expectTypeOf<
      EvaluateKnowledgeClaim["evaluateKnowledgeClaim"]
    >().returns.toEqualTypeOf<Promise<KnowledgeAcceptanceDecision>>();
    expectTypeOf<GetKnowledge["getKnowledge"]>().returns.not.toMatchTypeOf<
      Promise<unknown>
    >();
    expectTypeOf<
      ListKnowledgeReferences["listKnowledgeReferences"]
    >().returns.not.toMatchTypeOf<Promise<unknown>>();
    expectTypeOf<
      ProjectStructuredKnowledge["projectStructuredKnowledge"]
    >().returns.not.toMatchTypeOf<Promise<unknown>>();
    expectTypeOf(
      createKnowledgeOwnedSourceCurrentnessDetermination,
    ).returns.not.toMatchTypeOf<Promise<unknown>>();
  });
});
