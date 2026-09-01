import {
  InvalidMemoryInputError,
  InvalidMemoryStateError,
  MemoryNotFoundError,
  MemorySourceAuthorityVerificationFailureError,
  MemorySourceCurrentnessUnableToDetermineError,
  MemoryStoreUnavailableError,
  candidatePreparationAssociation,
  createMemoryReference,
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

class ForgettingConstruction implements MemoryConstructionValues {
  #identity = 0;
  #retainedAt = 0;
  #retrievedAt = 0;

  public constructor(
    private readonly identities: readonly string[] = ["memory-forgetting-1"],
  ) {}

  public nextMemoryIdentity(): unknown {
    return this.identities[this.#identity++];
  }

  public nextRetainedAt(): unknown {
    return `2026-09-01T00:0${this.#retainedAt++}:00.000Z`;
  }

  public nextRetrievedAt(): unknown {
    return `2026-09-01T01:0${this.#retrievedAt++}:00.000Z`;
  }
}

class ForgettingStore implements MemoryStore {
  readonly records = new Map<MemoryIdentity, MemoryRecord>();
  deleteResult: unknown = undefined;
  deleteThrows: unknown = undefined;

  public put(record: MemoryRecord): MemoryStorePutResult {
    this.records.set(record.memoryIdentity, record);
    return { status: "stored", memoryIdentity: record.memoryIdentity };
  }

  public get(memoryIdentity: MemoryIdentity): MemoryStoreGetResult {
    const record = this.records.get(memoryIdentity);
    return record === undefined
      ? { status: "not-found" }
      : { status: "found", record };
  }

  public list(limit: number): MemoryStoreListResult {
    return {
      status: "listed",
      references: [...this.records.values()]
        .slice(0, limit)
        .map((record) => createMemoryReference(record.memoryIdentity)),
    };
  }

  public delete(memoryIdentity: MemoryIdentity): MemoryStoreDeleteResult {
    if (this.deleteThrows !== undefined) throw this.deleteThrows;
    if (this.deleteResult !== undefined) {
      return this.deleteResult as MemoryStoreDeleteResult;
    }
    return this.records.delete(memoryIdentity)
      ? { status: "deleted", memoryIdentity }
      : { status: "not-found" };
  }
}

function createRunningMemory(
  store = new ForgettingStore(),
  identities?: readonly string[],
) {
  const engine = new MemoryEngine(
    store,
    new ForgettingConstruction(identities),
  );
  engine.initialize();
  engine.start();
  return { engine, store };
}

function retainAndRetrieve(engine: MemoryEngine): {
  record: MemoryRecord;
  reference: MemoryReference;
} {
  const record = engine.retainMemory({
    intent: "retain",
    kind: "episodic",
    content: "The user selected a dark theme.",
    retentionReason: "Preserve user continuity.",
    provenance: {
      sourceType: "interaction",
      originatingCapability: "orion.test",
      observedAt: "2026-09-01T00:00:00.000Z",
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
): MemorySourceRelationship {
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
): MemorySourceCurrentnessRequest {
  return engine.bindMemorySourceRelationshipToPreparation({
    relationship,
    candidatePreparationAssociation: candidatePreparationAssociation(
      `preparation-forgetting-${suffix}`,
    ),
  });
}

function verify(engine: MemoryEngine, currentnessRequest: unknown) {
  return engine.verifyMemorySourceAuthority({
    intent: "verify-memory-source-authority",
    currentnessRequest,
  });
}

function createIssuedSetup() {
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

describe("Memory Source Currentness forgetting evidence producer", () => {
  it("preserves the exact public deletion result and lifecycle behavior", () => {
    const { engine, record, relationship } = createIssuedSetup();
    const result = engine.forgetMemory({
      intent: "forget",
      memoryIdentity: record.memoryIdentity,
    });

    expect(result).toEqual({
      outcome: "deleted",
      memoryReference: createMemoryReference(record.memoryIdentity),
    });
    expect(Object.keys(result)).toEqual(["outcome", "memoryReference"]);
    expect(Object.isFrozen(result)).toBe(true);
    expect(Object.isFrozen(result.memoryReference)).toBe(true);
    expect(Object.isFrozen(relationship)).toBe(true);
    expect(() =>
      engine.getMemory({
        memoryIdentity: record.memoryIdentity,
        purpose: "continuity",
      }),
    ).toThrow(MemoryNotFoundError);
  });

  it("keeps every exact pre-Forget relationship immutable while current verification becomes negative", () => {
    const { engine, record, reference } = createIssuedSetup();
    const first = issueRelationship(engine, reference, "first");
    const second = issueRelationship(engine, reference, "second");
    const firstSnapshot = structuredClone(first);
    const secondSnapshot = structuredClone(second);
    const firstRequest = bind(engine, first, "first");
    const secondRequest = bind(engine, second, "second");

    engine.forgetMemory({
      intent: "forget",
      memoryIdentity: record.memoryIdentity,
    });

    expect(first).toEqual(firstSnapshot);
    expect(second).toEqual(secondSnapshot);
    expect(Object.isFrozen(first)).toBe(true);
    expect(Object.isFrozen(second)).toBe(true);
    expect(verify(engine, firstRequest)).toEqual({
      determination: "NEGATIVE",
    });
    expect(verify(engine, secondRequest)).toEqual({
      determination: "NEGATIVE",
    });
  });

  it("does not affect a relationship for an unrelated retained reference", () => {
    const { engine } = createRunningMemory(undefined, [
      "memory-forgetting-related",
      "memory-forgetting-unrelated",
    ]);
    const related = retainAndRetrieve(engine);
    const unrelated = retainAndRetrieve(engine);
    issueRelationship(engine, related.reference, "related");
    const unrelatedRelationship = issueRelationship(
      engine,
      unrelated.reference,
      "unrelated",
    );
    const unrelatedRequest = bind(engine, unrelatedRelationship, "unrelated");

    engine.forgetMemory({
      intent: "forget",
      memoryIdentity: related.record.memoryIdentity,
    });

    expect(verify(engine, unrelatedRequest).determination).toBe("POSITIVE");
  });

  it("does not retroactively apply Forget to a relationship issued afterward", () => {
    const { engine, record } = createIssuedSetup();
    const forgottenReference = engine.forgetMemory({
      intent: "forget",
      memoryIdentity: record.memoryIdentity,
    }).memoryReference;
    const laterRelationship = issueRelationship(
      engine,
      forgottenReference,
      "after-forget",
    );
    const laterRequest = bind(engine, laterRelationship, "after-forget");

    expect(Object.isFrozen(laterRelationship)).toBe(true);
    expect(() => verify(engine, laterRequest)).toThrow(
      MemorySourceCurrentnessUnableToDetermineError,
    );
  });

  it("malformed and invalid-identity Forget requests leave current behavior positive", () => {
    const { engine, currentnessRequest } = createIssuedSetup();

    expect(() => engine.forgetMemory({ intent: "forget" })).toThrow(
      InvalidMemoryInputError,
    );
    expect(() =>
      engine.forgetMemory({ intent: "forget", memoryIdentity: {} }),
    ).toThrow();
    expect(verify(engine, currentnessRequest).determination).toBe("POSITIVE");
  });

  it("not-retained and Store not-found Forget attempts create no lifecycle side effect", () => {
    const setup = createIssuedSetup();
    expect(() =>
      setup.engine.forgetMemory({
        intent: "forget",
        memoryIdentity: "memory-not-retained",
      }),
    ).toThrow(MemoryNotFoundError);

    setup.store.deleteResult = { status: "not-found" };
    expect(() =>
      setup.engine.forgetMemory({
        intent: "forget",
        memoryIdentity: setup.record.memoryIdentity,
      }),
    ).toThrow(MemoryNotFoundError);
    expect(verify(setup.engine, setup.currentnessRequest).determination).toBe(
      "POSITIVE",
    );
  });

  it.each([
    { name: "unavailable", result: { status: "unavailable" } },
    { name: "malformed", result: { status: "unknown" } },
    {
      name: "contradictory",
      result: { status: "deleted", memoryIdentity: "different-memory" },
    },
  ])(
    "does not record evidence for a $name Store deletion response",
    ({ result }) => {
      const setup = createIssuedSetup();
      setup.store.deleteResult = result;

      const expectedFailure =
        result.status === "unavailable"
          ? MemoryStoreUnavailableError
          : InvalidMemoryStateError;
      expect(() =>
        setup.engine.forgetMemory({
          intent: "forget",
          memoryIdentity: setup.record.memoryIdentity,
        }),
      ).toThrow(expectedFailure);
      expect(verify(setup.engine, setup.currentnessRequest).determination).toBe(
        "POSITIVE",
      );
    },
  );

  it("does not record evidence when Store deletion throws", () => {
    const setup = createIssuedSetup();
    setup.store.deleteThrows = new Error("private Store detail");

    expect(() =>
      setup.engine.forgetMemory({
        intent: "forget",
        memoryIdentity: setup.record.memoryIdentity,
      }),
    ).toThrow(MemoryStoreUnavailableError);
    expect(verify(setup.engine, setup.currentnessRequest).determination).toBe(
      "POSITIVE",
    );
  });

  it("does not accept the public deletion result as reusable authority", () => {
    const { engine, record } = createIssuedSetup();
    const deletion = engine.forgetMemory({
      intent: "forget",
      memoryIdentity: record.memoryIdentity,
    });

    expect(() => verify(engine, deletion)).toThrow();
    expect(deletion).not.toHaveProperty("authorityToken");
    expect(deletion).not.toHaveProperty("invalidationToken");
  });

  it("does not transfer process-local evidence to another Memory instance", () => {
    const store = new ForgettingStore();
    const original = createRunningMemory(store);
    const retained = retainAndRetrieve(original.engine);
    const relationship = issueRelationship(
      original.engine,
      retained.reference,
      "instance",
    );
    const request = bind(original.engine, relationship, "instance");
    original.engine.forgetMemory({
      intent: "forget",
      memoryIdentity: retained.record.memoryIdentity,
    });
    const restarted = createRunningMemory(store).engine;

    expect(() => verify(restarted, request)).toThrow(
      MemorySourceAuthorityVerificationFailureError,
    );
  });

  it("does not reconstruct relationship or invalidation authority from Store-shaped data", () => {
    const { engine, record, reference } = createIssuedSetup();
    const reconstructedReference = createMemoryReference(record.memoryIdentity);
    expect(reconstructedReference).toEqual(reference);

    expect(() =>
      issueRelationship(engine, reconstructedReference, "reconstructed"),
    ).toThrow(MemorySourceAuthorityVerificationFailureError);
  });

  it("keeps public results free of private invalidation and Knowledge fields", () => {
    const { engine, record, relationship } = createIssuedSetup();
    const deletion = engine.forgetMemory({
      intent: "forget",
      memoryIdentity: record.memoryIdentity,
    });

    for (const value of [deletion, deletion.memoryReference, relationship]) {
      for (const prohibited of [
        "invalidatedRelationshipIds",
        "lifecycleTransitionId",
        "captureId",
        "authorityToken",
        "invalidationToken",
        "relationshipRegistry",
        "storeDeletionReceipt",
        "propositionIdentity",
      ]) {
        expect(value).not.toHaveProperty(prohibited);
      }
    }
  });
});
