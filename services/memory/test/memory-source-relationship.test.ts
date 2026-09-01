import {
  InvalidMemorySourceRelationshipError,
  MemorySourceAuthorityVerificationFailureError,
  createMemoryReference,
  type MemoryConstructionValues,
  type MemoryIdentity,
  type MemoryRecord,
  type MemoryStore,
  type MemoryStoreDeleteResult,
  type MemoryStoreGetResult,
  type MemoryStoreListResult,
  type MemoryStorePutResult,
} from "@orion/core";
import { describe, expect, it } from "vitest";

import { MemoryEngine } from "../src/index.js";

class RelationshipTestConstruction implements MemoryConstructionValues {
  public nextMemoryIdentity(): unknown {
    return "memory-relationship-source";
  }
  public nextRetainedAt(): unknown {
    return "2026-08-31T00:00:00.000Z";
  }
  public nextRetrievedAt(): unknown {
    return "2026-08-31T00:01:00.000Z";
  }
}

class RelationshipTestStore implements MemoryStore {
  readonly records = new Map<MemoryIdentity, MemoryRecord>();

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
    return this.records.delete(memoryIdentity)
      ? { status: "deleted", memoryIdentity }
      : { status: "not-found" };
  }
}

function createRunningMemory() {
  const store = new RelationshipTestStore();
  const engine = new MemoryEngine(store, new RelationshipTestConstruction());
  engine.initialize();
  engine.start();
  const record = engine.retainMemory({
    intent: "retain",
    kind: "episodic",
    content: "The user selected a dark theme.",
    retentionReason: "Preserve user continuity.",
    provenance: {
      sourceType: "interaction",
      originatingCapability: "orion.test",
      observedAt: "2026-08-31T00:00:00.000Z",
      occurrenceEvidence: "reported",
    },
  });
  const retrieved = engine.getMemory({
    memoryIdentity: record.memoryIdentity,
    purpose: "continuity",
  });
  return {
    engine,
    store,
    record,
    reference: retrieved.receipt.memoryReference,
  };
}

function tuple() {
  return {
    subjectKey: "user.preference",
    predicateKey: "theme",
    textualScalar: "Dark Theme",
  };
}

function issuanceRequest(memoryReference: unknown) {
  return {
    sourceAttribution: { authoritativeCapability: "memory" },
    memoryReference,
    semanticValue: tuple(),
  };
}

describe("Memory source relationship issuance", () => {
  it("binds one exact issued reference to one exact explicit tuple", () => {
    const { engine, reference } = createRunningMemory();
    const relationship = engine.issueMemorySourceRelationship(
      issuanceRequest(reference),
    );

    expect(Object.keys(relationship)).toEqual([
      "sourceAttribution",
      "memoryReference",
      "semanticValue",
      "relationshipIdentity",
    ]);
    expect(relationship.sourceAttribution).toEqual({
      authoritativeCapability: "memory",
    });
    expect(relationship.memoryReference).toEqual(reference);
    expect(relationship.semanticValue).toEqual(tuple());
    expect(typeof relationship.relationshipIdentity).toBe("string");
    expect(relationship.relationshipIdentity.length).toBeGreaterThan(0);
    expect(Object.isFrozen(relationship)).toBe(true);
    expect(Object.isFrozen(relationship.sourceAttribution)).toBe(true);
    expect(Object.isFrozen(relationship.memoryReference)).toBe(true);
    expect(Object.isFrozen(relationship.semanticValue)).toBe(true);
  });

  it("allocates a fresh relationship identity without accepting one from the caller", () => {
    const { engine, reference } = createRunningMemory();
    const first = engine.issueMemorySourceRelationship(
      issuanceRequest(reference),
    );
    const second = engine.issueMemorySourceRelationship(
      issuanceRequest(reference),
    );
    expect(first.relationshipIdentity).not.toBe(second.relationshipIdentity);
    expect(() =>
      engine.issueMemorySourceRelationship({
        ...issuanceRequest(reference),
        relationshipIdentity: first.relationshipIdentity,
      }),
    ).toThrow(InvalidMemorySourceRelationshipError);
  });

  it("rejects fabricated and reconstructed Memory References as authority failures", () => {
    const { engine, reference } = createRunningMemory();
    const fabricated = createMemoryReference(reference.memoryIdentity);
    const clone = Object.freeze({ ...reference });

    expect(fabricated).toEqual(reference);
    expect(clone).toEqual(reference);
    expect(() =>
      engine.issueMemorySourceRelationship(issuanceRequest(fabricated)),
    ).toThrow(MemorySourceAuthorityVerificationFailureError);
    expect(() =>
      engine.issueMemorySourceRelationship(issuanceRequest(clone)),
    ).toThrow(MemorySourceAuthorityVerificationFailureError);
  });

  it("recognizes exact references issued through retrieval, listing, and forgetting", () => {
    const retrieval = createRunningMemory();
    expect(() =>
      retrieval.engine.issueMemorySourceRelationship(
        issuanceRequest(retrieval.reference),
      ),
    ).not.toThrow();

    const listing = createRunningMemory();
    const listed = listing.engine.listRetainedMemoryReferences({})[0];
    expect(listed).toBeDefined();
    expect(() =>
      listing.engine.issueMemorySourceRelationship(issuanceRequest(listed)),
    ).not.toThrow();

    const forgetting = createRunningMemory();
    const forgotten = forgetting.engine.forgetMemory({
      intent: "forget",
      memoryIdentity: forgetting.record.memoryIdentity,
    }).memoryReference;
    expect(() =>
      forgetting.engine.issueMemorySourceRelationship(
        issuanceRequest(forgotten),
      ),
    ).not.toThrow();
  });

  it("distinguishes malformed relationship input from authority mismatch", () => {
    const { engine, reference } = createRunningMemory();
    for (const invalid of [
      null,
      {},
      { ...issuanceRequest(reference), extra: true },
      { ...issuanceRequest(reference), semanticValue: {} },
      {
        ...issuanceRequest(reference),
        sourceAttribution: { authoritativeCapability: "knowledge" },
      },
      {
        ...issuanceRequest(reference),
        memoryReference: { memoryIdentity: reference.memoryIdentity },
      },
    ]) {
      expect(() => engine.issueMemorySourceRelationship(invalid)).toThrow(
        InvalidMemorySourceRelationshipError,
      );
    }

    expect(() =>
      engine.issueMemorySourceRelationship(
        issuanceRequest(createMemoryReference(reference.memoryIdentity)),
      ),
    ).toThrow(MemorySourceAuthorityVerificationFailureError);
  });

  it("does not treat Store existence as reference authority", () => {
    const { engine, store, record } = createRunningMemory();
    expect(store.records.has(record.memoryIdentity)).toBe(true);
    const storeReconstruction = createMemoryReference(record.memoryIdentity);
    expect(() =>
      engine.issueMemorySourceRelationship(
        issuanceRequest(storeReconstruction),
      ),
    ).toThrow(MemorySourceAuthorityVerificationFailureError);
  });

  it("returns only minimized non-bearer relationship correspondence", () => {
    const { engine, reference } = createRunningMemory();
    const relationship = engine.issueMemorySourceRelationship(
      issuanceRequest(reference),
    );
    for (const prohibited of [
      "propositionIdentity",
      "candidatePreparationAssociation",
      "content",
      "provenance",
      "storeMetadata",
      "authorityToken",
      "authorityCaptureIdentifier",
      "verifierInternals",
      "issuanceCapture",
    ]) {
      expect(relationship).not.toHaveProperty(prohibited);
      expect(relationship.semanticValue).not.toHaveProperty(prohibited);
    }
  });
});
