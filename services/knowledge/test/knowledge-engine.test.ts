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
  type KnowledgeConstructionValues,
  type KnowledgeIdentity,
  type KnowledgeRecord,
  type KnowledgeStore,
  type KnowledgeStoreGetResult,
  type KnowledgeStorePutResult,
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

  public put(record: KnowledgeRecord): KnowledgeStorePutResult {
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

  public get(identity: KnowledgeIdentity): KnowledgeStoreGetResult {
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

  private maybeThrow(): void {
    if (this.thrown !== undefined) throw this.thrown;
  }
}

function createEngine(
  store = new TestStore(),
  construction = new TestConstruction(),
) {
  const engine = new KnowledgeEngine(store, construction);
  engine.initialize();
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

function accept(engine: KnowledgeEngine) {
  const decision = engine.evaluateKnowledgeClaim(request());
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

describe("Knowledge Engine acceptance and rejection", () => {
  it("accepts an explicit valid claim only after Store confirmation", () => {
    const { engine, store } = createEngine();
    const decision = accept(engine);
    expect(decision.record.version).toBe(1);
    expect(decision.record.validationState).toBe("accepted");
    expect(store.records.size).toBe(1);
    expect(engine.listKnowledgeReferences({})).toHaveLength(1);
  });

  it("rejects explicit authority rejection without identity or Store mutation", () => {
    const { engine, store, construction } = createEngine();
    expect(engine.evaluateKnowledgeClaim(request("reject"))).toEqual({
      outcome: "rejected",
      category: "authority-rejected",
    });
    expect(construction.identityCalls).toBe(0);
    expect(store.putCalls).toBe(0);
    expect(engine.listKnowledgeReferences({})).toHaveLength(0);
  });

  it("distinguishes invalid Claim, Evidence, and request input", () => {
    const { engine } = createEngine();
    expect(() => engine.evaluateKnowledgeClaim(null)).toThrow(
      InvalidKnowledgeInputError,
    );
    expect(() =>
      engine.evaluateKnowledgeClaim({ ...request(), claim: 4 }),
    ).toThrow(InvalidClaimError);
    expect(() =>
      engine.evaluateKnowledgeClaim({
        ...request(),
        acceptanceEvidence: { decision: "accept" },
      }),
    ).toThrow(InvalidAcceptanceEvidenceError);
    expect(() =>
      engine.evaluateKnowledgeClaim({ ...request(), unexpected: true }),
    ).toThrow(InvalidKnowledgeInputError);
  });

  it("normalizes Store unavailability and duplicate identity", () => {
    const unavailable = createEngine();
    unavailable.store.available = false;
    expect(() => accept(unavailable.engine)).toThrow(
      KnowledgeStoreUnavailableError,
    );

    const duplicate = createEngine(
      new TestStore(),
      new TestConstruction(["knowledge-1", "knowledge-1"]),
    );
    accept(duplicate.engine);
    expect(() => accept(duplicate.engine)).toThrow(
      DuplicateKnowledgeIdentityError,
    );
  });

  it.each([
    { status: "stored" },
    { status: "stored", knowledgeIdentity: "other" },
  ])(
    "keeps write-then-malformed confirmation invisible: %j",
    (confirmation) => {
      const setup = createEngine();
      setup.store.writeThenPutResult = confirmation;
      expect(() => accept(setup.engine)).toThrow(InvalidKnowledgeStateError);
      expect(setup.store.records.size).toBe(1);
      expect(() =>
        setup.engine.getKnowledge({ knowledgeIdentity: "knowledge-1" }),
      ).toThrow(KnowledgeNotFoundError);
      expect(setup.engine.listKnowledgeReferences({})).toHaveLength(0);
    },
  );
});

describe("Knowledge Engine Get, List, contradiction, and supersession", () => {
  it("retrieves accepted Knowledge and lists current privacy-minimal references", () => {
    const { engine } = createEngine();
    const accepted = accept(engine);
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

  it("distinguishes unconfirmed Knowledge from confirmed Store not-found", () => {
    const setup = createEngine();
    expect(() =>
      setup.engine.getKnowledge({ knowledgeIdentity: "unknown" }),
    ).toThrow(KnowledgeNotFoundError);

    const accepted = accept(setup.engine);
    setup.store.overrideGet = { status: "not-found" };
    expect(() =>
      setup.engine.getKnowledge({
        knowledgeIdentity: accepted.record.knowledgeIdentity,
      }),
    ).toThrow(InvalidKnowledgeStateError);
  });

  it.each([0, 101, -1, 1.5, "1", Number.NaN, { valueOf: () => 1 }])(
    "rejects invalid List limit %j",
    (limit) => {
      const { engine } = createEngine();
      expect(() => engine.listKnowledgeReferences({ limit })).toThrow(
        InvalidKnowledgeInputError,
      );
    },
  );

  it("defaults List to 50, accepts 1 and 100, and preserves order", () => {
    const { engine } = createEngine();
    const first = accept(engine);
    const second = accept(engine);
    expect(
      engine.listKnowledgeReferences({}).map((r) => r.knowledgeIdentity),
    ).toEqual([
      first.record.knowledgeIdentity,
      second.record.knowledgeIdentity,
    ]);
    expect(engine.listKnowledgeReferences({ limit: 1 })).toHaveLength(1);
    expect(engine.listKnowledgeReferences({ limit: 100 })).toHaveLength(2);
  });

  it("requires complete contradiction resolution", () => {
    const { engine } = createEngine();
    const existing = accept(engine);
    expect(() =>
      engine.evaluateKnowledgeClaim({
        ...request(),
        contradictsKnowledgeIdentity: existing.record.knowledgeIdentity,
      }),
    ).toThrow(ContradictionRequiresResolutionError);
    expect(engine.listKnowledgeReferences({})).toHaveLength(1);
  });

  it("reject-candidate keeps existing Knowledge current without Store mutation", () => {
    const { engine, store } = createEngine();
    const existing = accept(engine);
    const putsBefore = store.putCalls;
    const result = engine.evaluateKnowledgeClaim({
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

  it("supersedes explicitly while preserving immutable historical Knowledge", () => {
    const { engine } = createEngine();
    const predecessor = accept(engine);
    const snapshot = predecessor.record;
    const successor = engine.evaluateKnowledgeClaim({
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

  it("failed successor confirmation leaves predecessor current", () => {
    const setup = createEngine();
    const predecessor = accept(setup.engine);
    setup.store.writeThenPutResult = { status: "stored" };
    expect(() =>
      setup.engine.evaluateKnowledgeClaim({
        ...request(),
        contradictsKnowledgeIdentity: predecessor.record.knowledgeIdentity,
        contradictionDecision: "supersede-existing",
        contradictionReason: "Attempt a failed successor.",
      }),
    ).toThrow(InvalidKnowledgeStateError);
    expect(
      setup.engine.getKnowledge({
        knowledgeIdentity: predecessor.record.knowledgeIdentity,
      }).reference.currency,
    ).toBe("current");
    expect(setup.engine.listKnowledgeReferences({})).toHaveLength(1);
  });

  it("preserves a confirmed predecessor when Store reports not-found", () => {
    const setup = createEngine();
    const predecessor = accept(setup.engine);
    const identityCallsBefore = setup.construction.identityCalls;
    const putCallsBefore = setup.store.putCalls;
    setup.store.overrideGet = { status: "not-found" };
    expect(() =>
      setup.engine.evaluateKnowledgeClaim({
        ...request(),
        contradictsKnowledgeIdentity: predecessor.record.knowledgeIdentity,
        contradictionDecision: "supersede-existing",
        contradictionReason: "Attempt replacement while Store is inconsistent.",
      }),
    ).toThrow(InvalidKnowledgeStateError);
    expect(setup.construction.identityCalls).toBe(identityCallsBefore);
    expect(setup.store.putCalls).toBe(putCallsBefore);

    setup.store.overrideGet = NO_STORE_OVERRIDE;
    expect(
      setup.engine.getKnowledge({
        knowledgeIdentity: predecessor.record.knowledgeIdentity,
      }).reference.currency,
    ).toBe("current");
  });

  it("rejects unknown and historical supersession targets", () => {
    const { engine } = createEngine();
    expect(() =>
      engine.evaluateKnowledgeClaim({
        ...request(),
        contradictsKnowledgeIdentity: "unknown",
        contradictionDecision: "supersede-existing",
        contradictionReason: "Unknown target.",
      }),
    ).toThrow(KnowledgeNotFoundError);
    const predecessor = accept(engine);
    const successor = engine.evaluateKnowledgeClaim({
      ...request(),
      contradictsKnowledgeIdentity: predecessor.record.knowledgeIdentity,
      contradictionDecision: "supersede-existing",
      contradictionReason: "Valid replacement.",
    });
    expect(successor.outcome).toBe("accepted");
    expect(() =>
      engine.evaluateKnowledgeClaim({
        ...request(),
        contradictsKnowledgeIdentity: predecessor.record.knowledgeIdentity,
        contradictionDecision: "supersede-existing",
        contradictionReason: "Historical target.",
      }),
    ).toThrow(InvalidSupersessionError);
  });
});

describe("Knowledge Engine Version and hostile Store boundaries", () => {
  it("increments one below maximum exactly and rejects maximum", () => {
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

  it("supersedes one below maximum through the public Engine contract", () => {
    const setup = createEngine();
    const predecessor = establishConfirmedPredecessor(
      setup.engine,
      setup.store,
      KNOWLEDGE_VERSION_MAX - 1,
    );
    const predecessorSnapshot = structuredClone(predecessor);
    const successor = setup.engine.evaluateKnowledgeClaim({
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

  it("rejects maximum-version supersession before allocation or Store mutation", () => {
    const setup = createEngine();
    const predecessor = establishConfirmedPredecessor(
      setup.engine,
      setup.store,
      KNOWLEDGE_VERSION_MAX,
    );
    const predecessorSnapshot = structuredClone(predecessor);
    const identityCallsBefore = setup.construction.identityCalls;
    const putCallsBefore = setup.store.putCalls;
    expect(() =>
      setup.engine.evaluateKnowledgeClaim({
        ...request(),
        contradictsKnowledgeIdentity: predecessor.knowledgeIdentity,
        contradictionDecision: "supersede-existing",
        contradictionReason: "Attempt to exceed the maximum safe version.",
      }),
    ).toThrow(InvalidSupersessionError);
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

  it.each([
    new Proxy(
      {},
      {
        getPrototypeOf() {
          throw new Error("hostile prototype");
        },
      },
    ),
    new Proxy(
      {},
      {
        get(target, property, receiver) {
          if (property === "status") throw new Error("hostile property");
          return Reflect.get(target, property, receiver);
        },
      },
    ),
  ])("classifies hostile Store result as Invalid Knowledge State", (result) => {
    const setup = createEngine();
    const accepted = accept(setup.engine);
    setup.store.overrideGet = result;
    expect(() =>
      setup.engine.getKnowledge({
        knowledgeIdentity: accepted.record.knowledgeIdentity,
      }),
    ).toThrow(InvalidKnowledgeStateError);
  });

  it.each([
    null,
    undefined,
    7,
    "found",
    [],
    {},
    { status: "unexpected" },
    { status: "found", record: {} },
  ])(
    "rejects malformed Store result as Invalid Knowledge State: %j",
    (result) => {
      const setup = createEngine();
      const accepted = accept(setup.engine);
      setup.store.overrideGet = result;
      expect(() =>
        setup.engine.getKnowledge({
          knowledgeIdentity: accepted.record.knowledgeIdentity,
        }),
      ).toThrow(InvalidKnowledgeStateError);
    },
  );

  it("rejects malformed Store-returned Records including invalid Version", () => {
    const setup = createEngine();
    const accepted = accept(setup.engine);
    setup.store.overrideGet = {
      status: "found",
      record: { ...accepted.record, version: KNOWLEDGE_VERSION_MAX + 1 },
    };
    expect(() =>
      setup.engine.getKnowledge({
        knowledgeIdentity: accepted.record.knowledgeIdentity,
      }),
    ).toThrow(InvalidKnowledgeStateError);
  });

  it.each([
    "2026-02-30T00:00:00.000Z",
    "2026-02-29T00:00:00.000Z",
    "2026-04-31T00:00:00.000Z",
  ])("rejects impossible Store-returned timestamp %s", (acceptedAt) => {
    const setup = createEngine();
    const accepted = accept(setup.engine);
    setup.store.overrideGet = {
      status: "found",
      record: { ...accepted.record, acceptedAt },
    };
    expect(() =>
      setup.engine.getKnowledge({
        knowledgeIdentity: accepted.record.knowledgeIdentity,
      }),
    ).toThrow(InvalidKnowledgeStateError);
  });

  it.each([new Error("native detail"), "non-error detail"])(
    "normalizes Store invocation throw without leakage",
    (thrown) => {
      const setup = createEngine();
      const accepted = accept(setup.engine);
      setup.store.thrown = thrown;
      expect(() =>
        setup.engine.getKnowledge({
          knowledgeIdentity: accepted.record.knowledgeIdentity,
        }),
      ).toThrow(KnowledgeStoreUnavailableError);
    },
  );

  it("rejects coercible caller identities without Store access", () => {
    const { engine } = createEngine();
    expect(() =>
      engine.getKnowledge({
        knowledgeIdentity: { toString: () => "knowledge-1" },
      }),
    ).toThrow(InvalidKnowledgeIdentityError);
  });
});
