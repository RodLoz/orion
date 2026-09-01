import {
  InvalidMemorySourceCurrentnessRequestError,
  MemorySourceAuthorityVerificationFailureError,
  MemorySourceCurrentnessUnableToDetermineError,
  candidatePreparationAssociation,
  createMemoryReference,
  createMemorySourceCurrentnessRequest,
  createMemorySourceRelationship,
  memorySourceRelationshipIdentity,
  type MemoryConstructionValues,
  type MemoryIdentity,
  type MemoryRecord,
  type MemoryReference,
  type MemorySourceCurrentnessRequest,
  type MemorySourceRelationship,
  type MemoryStore,
  type MemoryStoreDeleteResult,
  type MemoryStoreGetResult,
  type MemoryStoreListResult,
  type MemoryStorePutResult,
} from "@orion/core";
import { describe, expect, it } from "vitest";

import { MemoryEngine } from "../src/index.js";

class NegativeConstruction implements MemoryConstructionValues {
  #identity = 0;
  #retainedAt = 0;
  #retrievedAt = 0;

  public constructor(
    private readonly identities: readonly string[] = ["memory-negative-1"],
  ) {}

  public nextMemoryIdentity(): unknown {
    return this.identities[this.#identity++];
  }

  public nextRetainedAt(): unknown {
    return `2026-09-01T02:0${this.#retainedAt++}:00.000Z`;
  }

  public nextRetrievedAt(): unknown {
    return `2026-09-01T03:0${this.#retrievedAt++}:00.000Z`;
  }
}

class NegativeStore implements MemoryStore {
  readonly records = new Map<MemoryIdentity, MemoryRecord>();
  reads = 0;
  writes = 0;
  available = true;

  public put(record: MemoryRecord): MemoryStorePutResult {
    this.writes += 1;
    if (!this.available) return { status: "unavailable" };
    this.records.set(record.memoryIdentity, record);
    return { status: "stored", memoryIdentity: record.memoryIdentity };
  }

  public get(memoryIdentity: MemoryIdentity): MemoryStoreGetResult {
    this.reads += 1;
    if (!this.available) return { status: "unavailable" };
    const record = this.records.get(memoryIdentity);
    return record === undefined
      ? { status: "not-found" }
      : { status: "found", record };
  }

  public list(limit: number): MemoryStoreListResult {
    this.reads += 1;
    if (!this.available) return { status: "unavailable" };
    return {
      status: "listed",
      references: [...this.records.values()]
        .slice(0, limit)
        .map((record) => createMemoryReference(record.memoryIdentity)),
    };
  }

  public delete(memoryIdentity: MemoryIdentity): MemoryStoreDeleteResult {
    this.writes += 1;
    if (!this.available) return { status: "unavailable" };
    return this.records.delete(memoryIdentity)
      ? { status: "deleted", memoryIdentity }
      : { status: "not-found" };
  }
}

function createRunningMemory(
  store = new NegativeStore(),
  identities?: readonly string[],
) {
  const engine = new MemoryEngine(store, new NegativeConstruction(identities));
  engine.initialize();
  engine.start();
  return { engine, store };
}

function retainAndRetrieve(engine: MemoryEngine) {
  const record = engine.retainMemory({
    intent: "retain",
    kind: "episodic",
    content: "The user selected a dark theme.",
    retentionReason: "Preserve user continuity.",
    provenance: {
      sourceType: "interaction",
      originatingCapability: "orion.test",
      observedAt: "2026-09-01T02:00:00.000Z",
      occurrenceEvidence: "reported",
    },
  });
  const retrieved = engine.getMemory({
    memoryIdentity: record.memoryIdentity,
    purpose: "continuity",
  });
  return { record, reference: retrieved.receipt.memoryReference };
}

function issueRelationship(
  engine: MemoryEngine,
  memoryReference: MemoryReference,
  suffix: string,
) {
  return engine.issueMemorySourceRelationship({
    sourceAttribution: { authoritativeCapability: "memory" },
    memoryReference,
    semanticValue: {
      subjectKey: `user.preference.${suffix}`,
      predicateKey: "theme",
      textualScalar: "Dark Theme",
    },
  });
}

function bind(
  engine: MemoryEngine,
  relationship: MemorySourceRelationship,
  suffix: string,
) {
  return engine.bindMemorySourceRelationshipToPreparation({
    relationship,
    candidatePreparationAssociation: candidatePreparationAssociation(
      `preparation-negative-${suffix}`,
    ),
  });
}

function verify(engine: MemoryEngine, currentnessRequest: unknown) {
  return engine.verifyMemorySourceAuthority({
    intent: "verify-memory-source-authority",
    currentnessRequest,
  });
}

function createCurrentnessSetup() {
  const running = createRunningMemory();
  const retained = retainAndRetrieve(running.engine);
  const relationship = issueRelationship(
    running.engine,
    retained.reference,
    "primary",
  );
  const currentnessRequest = bind(running.engine, relationship, "primary");
  return { ...running, ...retained, relationship, currentnessRequest };
}

function reconstructRelationship(
  relationship: MemorySourceRelationship,
  replacement: Partial<MemorySourceRelationship> = {},
) {
  return createMemorySourceRelationship({
    sourceAttribution: relationship.sourceAttribution,
    memoryReference: relationship.memoryReference,
    semanticValue: relationship.semanticValue,
    relationshipIdentity: relationship.relationshipIdentity,
    ...replacement,
  });
}

function reconstructRequest(
  currentnessRequest: MemorySourceCurrentnessRequest,
  relationship: MemorySourceRelationship = currentnessRequest.relationship,
  association: unknown = currentnessRequest.candidatePreparationAssociation,
) {
  return createMemorySourceCurrentnessRequest({
    relationship,
    candidatePreparationAssociation: association,
  });
}

describe("Memory Source Currentness authoritative negative integration", () => {
  it("changes the same exact request from POSITIVE to closed frozen NEGATIVE after successful Forget", () => {
    const { engine, record, currentnessRequest } = createCurrentnessSetup();
    const positive = verify(engine, currentnessRequest);
    expect(positive.determination).toBe("POSITIVE");

    engine.forgetMemory({
      intent: "forget",
      memoryIdentity: record.memoryIdentity,
    });
    const negative = verify(engine, currentnessRequest);

    expect(negative).toEqual({ determination: "NEGATIVE" });
    expect(Object.keys(negative)).toEqual(["determination"]);
    expect(Object.isFrozen(negative)).toBe(true);
  });

  it("makes every exact pre-Forget relationship negative", () => {
    const { engine, record, reference } = createCurrentnessSetup();
    const relationships = [
      issueRelationship(engine, reference, "first"),
      issueRelationship(engine, reference, "second"),
      issueRelationship(engine, reference, "third"),
    ];
    const requests = relationships.map((relationship, index) =>
      bind(engine, relationship, `multiple-${index}`),
    );
    for (const request of requests) {
      expect(verify(engine, request).determination).toBe("POSITIVE");
    }

    engine.forgetMemory({
      intent: "forget",
      memoryIdentity: record.memoryIdentity,
    });

    for (const request of requests) {
      expect(verify(engine, request)).toEqual({ determination: "NEGATIVE" });
    }
  });

  it("leaves an unrelated retained relationship positive", () => {
    const { engine } = createRunningMemory(undefined, [
      "memory-negative-related",
      "memory-negative-unrelated",
    ]);
    const related = retainAndRetrieve(engine);
    const unrelated = retainAndRetrieve(engine);
    const relatedRequest = bind(
      engine,
      issueRelationship(engine, related.reference, "related"),
      "related",
    );
    const unrelatedRequest = bind(
      engine,
      issueRelationship(engine, unrelated.reference, "unrelated"),
      "unrelated",
    );

    engine.forgetMemory({
      intent: "forget",
      memoryIdentity: related.record.memoryIdentity,
    });

    expect(verify(engine, relatedRequest).determination).toBe("NEGATIVE");
    expect(verify(engine, unrelatedRequest).determination).toBe("POSITIVE");
  });

  it("keeps a post-Forget relationship unable rather than retroactively negative", () => {
    const { engine, record } = createCurrentnessSetup();
    const forgottenReference = engine.forgetMemory({
      intent: "forget",
      memoryIdentity: record.memoryIdentity,
    }).memoryReference;
    const relationship = issueRelationship(
      engine,
      forgottenReference,
      "post-forget",
    );
    const request = bind(engine, relationship, "post-forget");

    expect(Object.isFrozen(relationship)).toBe(true);
    expect(() => verify(engine, request)).toThrow(
      MemorySourceCurrentnessUnableToDetermineError,
    );
  });

  it("does not derive negative from Store absence or unavailability", () => {
    const absent = createCurrentnessSetup();
    const absentBefore = {
      reads: absent.store.reads,
      writes: absent.store.writes,
    };
    absent.store.records.clear();
    expect(verify(absent.engine, absent.currentnessRequest).determination).toBe(
      "POSITIVE",
    );
    expect({ reads: absent.store.reads, writes: absent.store.writes }).toEqual(
      absentBefore,
    );

    const unavailable = createCurrentnessSetup();
    const unavailableBefore = {
      reads: unavailable.store.reads,
      writes: unavailable.store.writes,
    };
    unavailable.store.available = false;
    expect(
      verify(unavailable.engine, unavailable.currentnessRequest).determination,
    ).toBe("POSITIVE");
    expect({
      reads: unavailable.store.reads,
      writes: unavailable.store.writes,
    }).toEqual(unavailableBefore);
  });

  it("performs no Store operation while producing NEGATIVE", () => {
    const setup = createCurrentnessSetup();
    setup.engine.forgetMemory({
      intent: "forget",
      memoryIdentity: setup.record.memoryIdentity,
    });
    const before = { reads: setup.store.reads, writes: setup.store.writes };
    setup.store.available = false;

    expect(verify(setup.engine, setup.currentnessRequest)).toEqual({
      determination: "NEGATIVE",
    });
    expect({ reads: setup.store.reads, writes: setup.store.writes }).toEqual(
      before,
    );
  });

  it("rejects fabricated and cloned requests before invalidation can determine negative", () => {
    const setup = createCurrentnessSetup();
    const fabricated = reconstructRequest(setup.currentnessRequest);
    const clone = Object.freeze({ ...setup.currentnessRequest });
    setup.engine.forgetMemory({
      intent: "forget",
      memoryIdentity: setup.record.memoryIdentity,
    });

    for (const request of [fabricated, clone]) {
      expect(() => verify(setup.engine, request)).toThrow(
        MemorySourceAuthorityVerificationFailureError,
      );
    }
  });

  it("rejects relationship, reference, tuple, identity, and preparation substitutions before invalidation", () => {
    const setup = createCurrentnessSetup();
    const relationship = setup.relationship;
    const substitutions = [
      reconstructRequest(
        setup.currentnessRequest,
        reconstructRelationship(relationship),
      ),
      reconstructRequest(
        setup.currentnessRequest,
        reconstructRelationship(relationship, {
          memoryReference: createMemoryReference(
            relationship.memoryReference.memoryIdentity,
          ),
        }),
      ),
      reconstructRequest(
        setup.currentnessRequest,
        reconstructRelationship(relationship, {
          semanticValue: Object.freeze({ ...relationship.semanticValue }),
        }),
      ),
      reconstructRequest(
        setup.currentnessRequest,
        reconstructRelationship(relationship, {
          relationshipIdentity: memorySourceRelationshipIdentity(
            "negative-substituted-relationship",
          ),
        }),
      ),
      reconstructRequest(
        setup.currentnessRequest,
        relationship,
        candidatePreparationAssociation("negative-substituted-preparation"),
      ),
    ];
    setup.engine.forgetMemory({
      intent: "forget",
      memoryIdentity: setup.record.memoryIdentity,
    });

    for (const request of substitutions) {
      expect(() => verify(setup.engine, request)).toThrow(
        MemorySourceAuthorityVerificationFailureError,
      );
    }
  });

  it("rejects cross-instance and restarted requests rather than inferring negative", () => {
    const store = new NegativeStore();
    const original = createRunningMemory(store);
    const retained = retainAndRetrieve(original.engine);
    const request = bind(
      original.engine,
      issueRelationship(original.engine, retained.reference, "instance"),
      "instance",
    );
    original.engine.forgetMemory({
      intent: "forget",
      memoryIdentity: retained.record.memoryIdentity,
    });

    const other = createRunningMemory().engine;
    const restarted = createRunningMemory(store).engine;
    for (const engine of [other, restarted]) {
      expect(() => verify(engine, request)).toThrow(
        MemorySourceAuthorityVerificationFailureError,
      );
    }
  });

  it("rejects the public Forget result and caller-selected NEGATIVE", () => {
    const setup = createCurrentnessSetup();
    const deletion = setup.engine.forgetMemory({
      intent: "forget",
      memoryIdentity: setup.record.memoryIdentity,
    });

    expect(() => verify(setup.engine, deletion)).toThrow(
      InvalidMemorySourceCurrentnessRequestError,
    );
    expect(() =>
      setup.engine.verifyMemorySourceAuthority({
        intent: "verify-memory-source-authority",
        currentnessRequest: setup.currentnessRequest,
        determination: "NEGATIVE",
      }),
    ).toThrow(InvalidMemorySourceCurrentnessRequestError);
  });

  it("preserves prior POSITIVE correspondence after later NEGATIVE", () => {
    const setup = createCurrentnessSetup();
    const positive = verify(setup.engine, setup.currentnessRequest);
    if (positive.determination !== "POSITIVE") throw new Error("unreachable");
    const snapshot = structuredClone(positive);

    setup.engine.forgetMemory({
      intent: "forget",
      memoryIdentity: setup.record.memoryIdentity,
    });
    expect(verify(setup.engine, setup.currentnessRequest).determination).toBe(
      "NEGATIVE",
    );
    expect(positive).toEqual(snapshot);
    expect(Object.isFrozen(positive)).toBe(true);
    expect(Object.isFrozen(positive.correspondence)).toBe(true);
  });

  it("returns minimized NEGATIVE without authority, invalidation, or Knowledge internals", () => {
    const setup = createCurrentnessSetup();
    setup.engine.forgetMemory({
      intent: "forget",
      memoryIdentity: setup.record.memoryIdentity,
    });
    const negative = verify(setup.engine, setup.currentnessRequest);

    for (const prohibited of [
      "correspondence",
      "content",
      "provenance",
      "storeMetadata",
      "credentials",
      "lifecycleInternals",
      "invalidatedRelationshipIds",
      "lifecycleTransitionId",
      "captureId",
      "authorityToken",
      "invalidationToken",
      "verifierInternals",
      "propositionIdentity",
      "diagnosticCorrelation",
      "ranking",
      "confidence",
      "traces",
    ]) {
      expect(negative).not.toHaveProperty(prohibited);
    }
  });
});
