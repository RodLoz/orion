import {
  ContradictionRequiresResolutionError,
  DuplicateKnowledgeIdentityError,
  InvalidAcceptanceEvidenceError,
  InvalidClaimError,
  InvalidKnowledgeIdentityError,
  InvalidKnowledgeInputError,
  InvalidKnowledgeStateError,
  InvalidSupersessionError,
  KNOWLEDGE_VERSION_MAX,
  KnowledgeNotFoundError,
  KnowledgeStoreUnavailableError,
  createKnowledgeRecord,
  createKnowledgeLifecycleSnapshot,
  knowledgeAcceptanceOrder,
  type KnowledgeConstructionValues,
  type KnowledgeIdentity,
  type KnowledgeRecord,
  type KnowledgeStore,
  type KnowledgeStoreGetResult,
  type KnowledgeStorePutResult,
  type PutIndependentAcceptedKnowledgeRequest,
  type PutIndependentAcceptedKnowledgeResult,
  type SupersedeCurrentKnowledgeRequest,
  type SupersedeCurrentKnowledgeResult,
  type KnowledgeLifecycleSnapshotResult,
} from "@orion/core";
import { describe, expect, it } from "vitest";

import { KnowledgeEngine } from "../src/index.js";
import {
  calculateNextKnowledgeVersion,
  knowledgeEngineTestState,
} from "../src/knowledge-engine.js";

const NO_STORE_OVERRIDE = Symbol("no-store-override");

class TestConstruction implements KnowledgeConstructionValues {
  #identity = 0;
  #acceptedAt = 0;
  public identityCalls = 0;

  public constructor(
    private readonly identities: readonly unknown[] = [
      "knowledge-1",
      "knowledge-2",
      "knowledge-3",
    ],
  ) {}

  public nextKnowledgeIdentity(): unknown {
    this.identityCalls += 1;
    return this.identities[this.#identity++];
  }

  public nextAcceptedAt(): unknown {
    return [
      "2026-07-20T01:00:00.000Z",
      "2026-07-20T02:00:00.000Z",
      "2026-07-20T03:00:00.000Z",
    ][this.#acceptedAt++];
  }
}

class TestStore implements KnowledgeStore {
  readonly records = new Map<KnowledgeIdentity, KnowledgeRecord>();
  available = true;
  overridePut: unknown = NO_STORE_OVERRIDE;
  overrideGet: unknown = NO_STORE_OVERRIDE;
  writeThenPutResult: unknown = undefined;
  thrown: unknown = undefined;
  putCalls = 0;

  public async put(record: KnowledgeRecord): Promise<KnowledgeStorePutResult> {
    this.maybeThrow();
    this.putCalls += 1;
    if (!this.available) return { status: "unavailable" };
    if (this.writeThenPutResult !== undefined) {
      this.records.set(record.knowledgeIdentity, record);
      return this.writeThenPutResult as KnowledgeStorePutResult;
    }
    if (this.overridePut !== NO_STORE_OVERRIDE) {
      return this.overridePut as KnowledgeStorePutResult;
    }
    if (this.records.has(record.knowledgeIdentity)) {
      return { status: "duplicate" };
    }
    this.records.set(record.knowledgeIdentity, record);
    return { status: "stored", knowledgeIdentity: record.knowledgeIdentity };
  }

  public async get(
    identity: KnowledgeIdentity,
  ): Promise<KnowledgeStoreGetResult> {
    this.maybeThrow();
    if (!this.available) return { status: "unavailable" };
    if (this.overrideGet !== NO_STORE_OVERRIDE) {
      return this.overrideGet as KnowledgeStoreGetResult;
    }
    const record = this.records.get(identity);
    return record === undefined
      ? { status: "not-found" }
      : { status: "found", record };
  }

  public async putIndependentAcceptedKnowledge(
    request: PutIndependentAcceptedKnowledgeRequest,
  ): Promise<PutIndependentAcceptedKnowledgeResult> {
    const result = await this.put(request.record);
    if (
      result.status === "stored" &&
      result.knowledgeIdentity === request.record.knowledgeIdentity
    ) {
      return {
        status: "stored",
        knowledgeIdentity: request.record.knowledgeIdentity,
        acceptanceOrder: knowledgeAcceptanceOrder(
          `test-order-${this.records.size}`,
        ),
      };
    }
    return result as PutIndependentAcceptedKnowledgeResult;
  }

  public async supersedeCurrentKnowledge(
    request: SupersedeCurrentKnowledgeRequest,
  ): Promise<SupersedeCurrentKnowledgeResult> {
    const result = await this.put(request.successor);
    if (
      result.status === "stored" &&
      result.knowledgeIdentity === request.successor.knowledgeIdentity
    ) {
      return {
        status: "superseded",
        predecessorKnowledgeIdentity:
          request.expectedPredecessorKnowledgeIdentity,
        successorKnowledgeIdentity: request.successor.knowledgeIdentity,
        acceptanceOrder: knowledgeAcceptanceOrder(
          `test-order-${this.records.size}`,
        ),
      };
    }
    return result as SupersedeCurrentKnowledgeResult;
  }

  public async loadKnowledgeLifecycleSnapshot(): Promise<KnowledgeLifecycleSnapshotResult> {
    return {
      status: "loaded",
      snapshot: createKnowledgeLifecycleSnapshot({ entries: [] }),
    };
  }

  private maybeThrow(): void {
    if (this.thrown !== undefined) throw this.thrown;
  }
}

async function createEngine(
  store = new TestStore(),
  construction = new TestConstruction(),
) {
  const engine = new KnowledgeEngine(store, construction);
  await engine.initialize();
  engine.start();
  return { engine, store, construction };
}

function request(decision: "accept" | "reject" = "accept") {
  return {
    intent: "evaluate",
    claim: "A controlled candidate claim.",
    acceptanceEvidence: {
      method: "explicit-authority-review",
      authorityIdentifier: "orion.test.authority",
      decision,
      reason: "Reviewed explicitly for testing.",
    },
    provenance: {
      sourceType: "approved-internal-source",
      originatingCapability: "orion.test",
      observedAt: "2026-07-20T00:00:00.000Z",
    },
  };
}

async function accept(engine: KnowledgeEngine) {
  const decision = await engine.evaluateKnowledgeClaim(request());
  if (decision.outcome !== "accepted") throw new Error("test setup failed");
  return decision;
}

function establishConfirmedPredecessor(
  engine: KnowledgeEngine,
  store: TestStore,
  version: number,
) {
  const record = createKnowledgeRecord({
    knowledgeIdentity: "knowledge-predecessor",
    claim: "A confirmed version-boundary predecessor.",
    provenance: {
      sourceType: "approved-internal-source",
      originatingCapability: "orion.test",
      observedAt: "2026-07-20T00:00:00.000Z",
    },
    acceptanceEvidence: {
      method: "explicit-authority-review",
      authorityIdentifier: "orion.test.authority",
      decision: "accept",
      reason: "Establish a deterministic version boundary.",
    },
    acceptedAt: "2026-07-20T00:01:00.000Z",
    version,
  });
  store.records.set(record.knowledgeIdentity, record);
  return engine[knowledgeEngineTestState](record);
}

describe("Knowledge Engine acceptance and rejection", async () => {
  it("accepts an explicit valid claim only after Store confirmation", async () => {
    const { engine, store } = await createEngine();
    const decision = await accept(engine);
    expect(decision.record.version).toBe(1);
    expect(decision.record.validationState).toBe("accepted");
    expect(store.records.size).toBe(1);
    expect(engine.listKnowledgeReferences({})).toHaveLength(1);
  });

  it("rejects explicit authority rejection without identity or Store mutation", async () => {
    const { engine, store, construction } = await createEngine();
    expect(await engine.evaluateKnowledgeClaim(request("reject"))).toEqual({
      outcome: "rejected",
      category: "authority-rejected",
    });
    expect(construction.identityCalls).toBe(0);
    expect(store.putCalls).toBe(0);
    expect(engine.listKnowledgeReferences({})).toHaveLength(0);
  });

  it("distinguishes invalid Claim, Evidence, and request input", async () => {
    const { engine } = await createEngine();
    await expect(engine.evaluateKnowledgeClaim(null)).rejects.toThrow(
      InvalidKnowledgeInputError,
    );
    await expect(
      engine.evaluateKnowledgeClaim({ ...request(), claim: 4 }),
    ).rejects.toThrow(InvalidClaimError);
    await expect(
      engine.evaluateKnowledgeClaim({
        ...request(),
        acceptanceEvidence: { decision: "accept" },
      }),
    ).rejects.toThrow(InvalidAcceptanceEvidenceError);
    await expect(
      engine.evaluateKnowledgeClaim({ ...request(), unexpected: true }),
    ).rejects.toThrow(InvalidKnowledgeInputError);
  });

  it("normalizes Store unavailability and duplicate identity", async () => {
    const unavailable = await createEngine();
    unavailable.store.available = false;
    await expect(accept(unavailable.engine)).rejects.toThrow(
      KnowledgeStoreUnavailableError,
    );

    const duplicate = await createEngine(
      new TestStore(),
      new TestConstruction(["knowledge-1", "knowledge-1"]),
    );
    await accept(duplicate.engine);
    await expect(accept(duplicate.engine)).rejects.toThrow(
      DuplicateKnowledgeIdentityError,
    );
  });

  it.each([
    { status: "stored" },
    { status: "stored", knowledgeIdentity: "other" },
  ])(
    "keeps write-then-malformed confirmation invisible: %j",
    async (confirmation) => {
      const setup = await createEngine();
      setup.store.writeThenPutResult = confirmation;
      await expect(accept(setup.engine)).rejects.toThrow(
        InvalidKnowledgeStateError,
      );
      expect(setup.store.records.size).toBe(1);
      expect(() =>
        setup.engine.getKnowledge({ knowledgeIdentity: "knowledge-1" }),
      ).toThrow(KnowledgeNotFoundError);
      expect(setup.engine.listKnowledgeReferences({})).toHaveLength(0);
    },
  );
});

describe("Knowledge Engine Get, List, contradiction, and supersession", async () => {
  it("retrieves accepted Knowledge and lists current privacy-minimal references", async () => {
    const { engine } = await createEngine();
    const accepted = await accept(engine);
    const retrieved = engine.getKnowledge({
      knowledgeIdentity: accepted.record.knowledgeIdentity,
    });
    expect(retrieved.knowledge).toEqual(accepted.record);
    expect(retrieved.reference.currency).toBe("current");
    expect(Object.isFrozen(retrieved.knowledge.provenance)).toBe(true);
    expect(engine.listKnowledgeReferences({})[0]).not.toHaveProperty("claim");
    expect(() => engine.getKnowledge({ knowledgeIdentity: "unknown" })).toThrow(
      KnowledgeNotFoundError,
    );
  });

  it("serves confirmed Knowledge from reconstructed memory without Store I/O", async () => {
    const setup = await createEngine();
    expect(() =>
      setup.engine.getKnowledge({ knowledgeIdentity: "unknown" }),
    ).toThrow(KnowledgeNotFoundError);

    const accepted = await accept(setup.engine);
    setup.store.overrideGet = { status: "not-found" };
    expect(
      setup.engine.getKnowledge({
        knowledgeIdentity: accepted.record.knowledgeIdentity,
      }).knowledge,
    ).toEqual(accepted.record);
  });

  it.each([0, 101, -1, 1.5, "1", Number.NaN, { valueOf: () => 1 }])(
    "rejects invalid List limit %j",
    async (limit) => {
      const { engine } = await createEngine();
      expect(() => engine.listKnowledgeReferences({ limit })).toThrow(
        InvalidKnowledgeInputError,
      );
    },
  );

  it("defaults List to 50, accepts 1 and 100, and preserves order", async () => {
    const { engine } = await createEngine();
    const first = await accept(engine);
    const second = await accept(engine);
    expect(
      engine.listKnowledgeReferences({}).map((r) => r.knowledgeIdentity),
    ).toEqual([
      first.record.knowledgeIdentity,
      second.record.knowledgeIdentity,
    ]);
    expect(engine.listKnowledgeReferences({ limit: 1 })).toHaveLength(1);
    expect(engine.listKnowledgeReferences({ limit: 100 })).toHaveLength(2);
  });

  it("requires complete contradiction resolution", async () => {
    const { engine } = await createEngine();
    const existing = await accept(engine);
    await expect(
      engine.evaluateKnowledgeClaim({
        ...request(),
        contradictsKnowledgeIdentity: existing.record.knowledgeIdentity,
      }),
    ).rejects.toThrow(ContradictionRequiresResolutionError);
    expect(engine.listKnowledgeReferences({})).toHaveLength(1);
  });

  it("reject-candidate keeps existing Knowledge current without Store mutation", async () => {
    const { engine, store } = await createEngine();
    const existing = await accept(engine);
    const putsBefore = store.putCalls;
    const result = await engine.evaluateKnowledgeClaim({
      ...request(),
      contradictsKnowledgeIdentity: existing.record.knowledgeIdentity,
      contradictionDecision: "reject-candidate",
      contradictionReason: "Preserve existing Knowledge.",
    });
    expect(result).toEqual({
      outcome: "rejected",
      category: "contradiction-preserved",
    });
    expect(store.putCalls).toBe(putsBefore);
    expect(
      engine.getKnowledge({
        knowledgeIdentity: existing.record.knowledgeIdentity,
      }).reference.currency,
    ).toBe("current");
  });

  it("supersedes explicitly while preserving immutable historical Knowledge", async () => {
    const { engine } = await createEngine();
    const predecessor = await accept(engine);
    const snapshot = predecessor.record;
    const successor = await engine.evaluateKnowledgeClaim({
      ...request(),
      claim: "An explicitly superseding candidate.",
      contradictsKnowledgeIdentity: predecessor.record.knowledgeIdentity,
      contradictionDecision: "supersede-existing",
      contradictionReason: "New accepted evidence supersedes the predecessor.",
    });
    if (successor.outcome !== "accepted") throw new Error("test setup failed");
    expect(successor.record.version).toBe(2);
    expect(successor.record.supersedesKnowledgeIdentity).toBe(
      predecessor.record.knowledgeIdentity,
    );
    expect(predecessor.record).toBe(snapshot);
    expect(
      engine.getKnowledge({
        knowledgeIdentity: predecessor.record.knowledgeIdentity,
      }).reference.currency,
    ).toBe("superseded");
    expect(engine.listKnowledgeReferences({})).toEqual([successor.reference]);
  });

  it("failed successor confirmation leaves predecessor current", async () => {
    const setup = await createEngine();
    const predecessor = await accept(setup.engine);
    setup.store.writeThenPutResult = { status: "stored" };
    await expect(
      setup.engine.evaluateKnowledgeClaim({
        ...request(),
        contradictsKnowledgeIdentity: predecessor.record.knowledgeIdentity,
        contradictionDecision: "supersede-existing",
        contradictionReason: "Attempt a failed successor.",
      }),
    ).rejects.toThrow(InvalidKnowledgeStateError);
    expect(
      setup.engine.getKnowledge({
        knowledgeIdentity: predecessor.record.knowledgeIdentity,
      }).reference.currency,
    ).toBe("current");
    expect(setup.engine.listKnowledgeReferences({})).toHaveLength(1);
  });

  it("uses reconstructed predecessor state without Store reads", async () => {
    const setup = await createEngine();
    const predecessor = await accept(setup.engine);
    const identityCallsBefore = setup.construction.identityCalls;
    const putCallsBefore = setup.store.putCalls;
    setup.store.overrideGet = { status: "not-found" };
    const successor = await setup.engine.evaluateKnowledgeClaim({
      ...request(),
      contradictsKnowledgeIdentity: predecessor.record.knowledgeIdentity,
      contradictionDecision: "supersede-existing",
      contradictionReason: "Attempt replacement while Store is inconsistent.",
    });
    expect(successor.outcome).toBe("accepted");
    expect(setup.construction.identityCalls).toBe(identityCallsBefore + 1);
    expect(setup.store.putCalls).toBe(putCallsBefore + 1);

    setup.store.overrideGet = NO_STORE_OVERRIDE;
    expect(
      setup.engine.getKnowledge({
        knowledgeIdentity: predecessor.record.knowledgeIdentity,
      }).reference.currency,
    ).toBe("superseded");
  });

  it("rejects unknown and historical supersession targets", async () => {
    const { engine } = await createEngine();
    await expect(
      engine.evaluateKnowledgeClaim({
        ...request(),
        contradictsKnowledgeIdentity: "unknown",
        contradictionDecision: "supersede-existing",
        contradictionReason: "Unknown target.",
      }),
    ).rejects.toThrow(KnowledgeNotFoundError);
    const predecessor = await accept(engine);
    const successor = await engine.evaluateKnowledgeClaim({
      ...request(),
      contradictsKnowledgeIdentity: predecessor.record.knowledgeIdentity,
      contradictionDecision: "supersede-existing",
      contradictionReason: "Valid replacement.",
    });
    expect(successor.outcome).toBe("accepted");
    await expect(
      engine.evaluateKnowledgeClaim({
        ...request(),
        contradictsKnowledgeIdentity: predecessor.record.knowledgeIdentity,
        contradictionDecision: "supersede-existing",
        contradictionReason: "Historical target.",
      }),
    ).rejects.toThrow(InvalidSupersessionError);
  });
});

describe("Knowledge Engine Version and hostile Store boundaries", async () => {
  it("increments one below maximum exactly and rejects maximum", async () => {
    expect(calculateNextKnowledgeVersion(KNOWLEDGE_VERSION_MAX - 1)).toBe(
      KNOWLEDGE_VERSION_MAX,
    );
    expect(() => calculateNextKnowledgeVersion(KNOWLEDGE_VERSION_MAX)).toThrow(
      InvalidSupersessionError,
    );
    for (const invalid of [0, -1, 1.5, Number.NaN, Infinity, "1", {}]) {
      expect(() => calculateNextKnowledgeVersion(invalid)).toThrow(
        InvalidSupersessionError,
      );
    }
  });

  it("supersedes one below maximum through the public Engine contract", async () => {
    const setup = await createEngine();
    const predecessor = establishConfirmedPredecessor(
      setup.engine,
      setup.store,
      KNOWLEDGE_VERSION_MAX - 1,
    );
    const predecessorSnapshot = structuredClone(predecessor);
    const successor = await setup.engine.evaluateKnowledgeClaim({
      ...request(),
      contradictsKnowledgeIdentity: predecessor.knowledgeIdentity,
      contradictionDecision: "supersede-existing",
      contradictionReason: "Advance exactly to the maximum safe version.",
    });
    if (successor.outcome !== "accepted") throw new Error("test setup failed");
    expect(successor.record.version).toBe(KNOWLEDGE_VERSION_MAX);
    expect(successor.record.supersedesKnowledgeIdentity).toBe(
      predecessor.knowledgeIdentity,
    );
    expect(setup.construction.identityCalls).toBe(1);
    expect(setup.store.putCalls).toBe(1);
    expect(
      setup.engine.getKnowledge({
        knowledgeIdentity: predecessor.knowledgeIdentity,
      }).reference.currency,
    ).toBe("superseded");
    expect(setup.engine.listKnowledgeReferences({})).toEqual([
      successor.reference,
    ]);
    expect(predecessor).toEqual(predecessorSnapshot);
  });

  it("rejects maximum-version supersession before allocation or Store mutation", async () => {
    const setup = await createEngine();
    const predecessor = establishConfirmedPredecessor(
      setup.engine,
      setup.store,
      KNOWLEDGE_VERSION_MAX,
    );
    const predecessorSnapshot = structuredClone(predecessor);
    const identityCallsBefore = setup.construction.identityCalls;
    const putCallsBefore = setup.store.putCalls;
    await expect(
      setup.engine.evaluateKnowledgeClaim({
        ...request(),
        contradictsKnowledgeIdentity: predecessor.knowledgeIdentity,
        contradictionDecision: "supersede-existing",
        contradictionReason: "Attempt to exceed the maximum safe version.",
      }),
    ).rejects.toThrow(InvalidSupersessionError);
    expect(setup.construction.identityCalls).toBe(identityCallsBefore);
    expect(setup.store.putCalls).toBe(putCallsBefore);
    expect(
      setup.engine.getKnowledge({
        knowledgeIdentity: predecessor.knowledgeIdentity,
      }),
    ).toMatchObject({
      knowledge: predecessorSnapshot,
      reference: { currency: "current", version: KNOWLEDGE_VERSION_MAX },
    });
    expect(setup.engine.listKnowledgeReferences({})).toHaveLength(1);
    expect(setup.store.records.size).toBe(1);
  });

  it("does not consult a hostile Store during READY reads", async () => {
    const setup = await createEngine();
    const accepted = await accept(setup.engine);
    setup.store.thrown = new Error("must not be observed");
    expect(
      setup.engine.getKnowledge({
        knowledgeIdentity: accepted.record.knowledgeIdentity,
      }).knowledge,
    ).toEqual(accepted.record);
  });

  it("rejects coercible caller identities without Store access", async () => {
    const { engine } = await createEngine();
    expect(() =>
      engine.getKnowledge({
        knowledgeIdentity: { toString: () => "knowledge-1" },
      }),
    ).toThrow(InvalidKnowledgeIdentityError);
  });
});
