import {
  InvalidMemorySourceCurrentnessRequestError,
  MemorySourceAuthorityVerificationFailureError,
  candidatePreparationAssociation,
  createMemoryReference,
  createMemorySourceRelationship,
  memorySourceRelationshipIdentity,
  type MemoryConstructionValues,
  type MemoryIdentity,
  type MemoryRecord,
  type MemorySourceRelationship,
  type MemoryStore,
  type MemoryStoreDeleteResult,
  type MemoryStoreGetResult,
  type MemoryStoreListResult,
  type MemoryStorePutResult,
} from "@orion/core";
import { describe, expect, it } from "vitest";

import { MemoryEngine } from "../src/index.js";

class PreparationConstruction implements MemoryConstructionValues {
  public nextMemoryIdentity(): unknown {
    return "memory-preparation-source";
  }

  public nextRetainedAt(): unknown {
    return "2026-08-31T00:00:00.000Z";
  }

  public nextRetrievedAt(): unknown {
    return "2026-08-31T00:01:00.000Z";
  }
}

class CountingPreparationStore implements MemoryStore {
  readonly records = new Map<MemoryIdentity, MemoryRecord>();
  reads = 0;
  writes = 0;

  public put(record: MemoryRecord): MemoryStorePutResult {
    this.writes += 1;
    this.records.set(record.memoryIdentity, record);
    return { status: "stored", memoryIdentity: record.memoryIdentity };
  }

  public get(memoryIdentity: MemoryIdentity): MemoryStoreGetResult {
    this.reads += 1;
    const record = this.records.get(memoryIdentity);
    return record === undefined
      ? { status: "not-found" }
      : { status: "found", record };
  }

  public list(limit: number): MemoryStoreListResult {
    this.reads += 1;
    return {
      status: "listed",
      references: [...this.records.values()]
        .slice(0, limit)
        .map((record) => createMemoryReference(record.memoryIdentity)),
    };
  }

  public delete(memoryIdentity: MemoryIdentity): MemoryStoreDeleteResult {
    this.writes += 1;
    return this.records.delete(memoryIdentity)
      ? { status: "deleted", memoryIdentity }
      : { status: "not-found" };
  }
}

function createRunningMemory() {
  const store = new CountingPreparationStore();
  const engine = new MemoryEngine(store, new PreparationConstruction());
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
  const relationship = engine.issueMemorySourceRelationship({
    sourceAttribution: { authoritativeCapability: "memory" },
    memoryReference: retrieved.receipt.memoryReference,
    semanticValue: {
      subjectKey: "user.preference",
      predicateKey: "theme",
      textualScalar: "Dark Theme",
    },
  });
  return { engine, store, relationship };
}

function bindingRequest(
  relationship: unknown,
  association: unknown = candidatePreparationAssociation("preparation-1"),
) {
  return {
    relationship,
    candidatePreparationAssociation: association,
  };
}

function reconstructedRelationship(
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

describe("Memory source currentness preparation binding", () => {
  it("binds one exact issued relationship to one exact opaque association", () => {
    const { engine, relationship } = createRunningMemory();
    const association = candidatePreparationAssociation(
      "  opaque:Context/Preparation#A  ",
    );
    const originalRelationship = structuredClone(relationship);

    const request = engine.bindMemorySourceRelationshipToPreparation(
      bindingRequest(relationship, association),
    );

    expect(Object.keys(request)).toEqual([
      "relationship",
      "candidatePreparationAssociation",
    ]);
    expect(request.relationship).toEqual(relationship);
    expect(request.relationship).toEqual(originalRelationship);
    expect(request.candidatePreparationAssociation).toBe(association);
    expect(request.candidatePreparationAssociation).toBe(
      "  opaque:Context/Preparation#A  ",
    );
    expect(Object.isFrozen(request)).toBe(true);
    expect(Object.isFrozen(request.relationship)).toBe(true);
    expect(Object.isFrozen(request.relationship.sourceAttribution)).toBe(true);
    expect(Object.isFrozen(request.relationship.memoryReference)).toBe(true);
    expect(Object.isFrozen(request.relationship.semanticValue)).toBe(true);
    expect(relationship).toEqual(originalRelationship);
    expect(Object.isFrozen(relationship)).toBe(true);
  });

  it("rejects malformed binding inputs as currentness-request failures", () => {
    const { engine, relationship } = createRunningMemory();
    for (const invalid of [
      null,
      {},
      { ...bindingRequest(relationship), extra: true },
      bindingRequest(relationship, ""),
      bindingRequest(relationship, null),
      bindingRequest({}),
      bindingRequest({ ...relationship, unexpected: true }),
    ]) {
      expect(() =>
        engine.bindMemorySourceRelationshipToPreparation(invalid),
      ).toThrow(InvalidMemorySourceCurrentnessRequestError);
    }
  });

  it("rejects fabricated, cloned, and reconstructed relationships as authority failures", () => {
    const { engine, relationship } = createRunningMemory();
    const fabricated = reconstructedRelationship(relationship);
    const clone = Object.freeze({ ...relationship });

    expect(fabricated).toEqual(relationship);
    expect(clone).toEqual(relationship);
    for (const invalid of [fabricated, clone]) {
      expect(() =>
        engine.bindMemorySourceRelationshipToPreparation(
          bindingRequest(invalid),
        ),
      ).toThrow(MemorySourceAuthorityVerificationFailureError);
    }
  });

  it("rejects every valid-looking substituted relationship operand", () => {
    const { engine, relationship } = createRunningMemory();
    const substitutions = [
      reconstructedRelationship(relationship, {
        sourceAttribution: { authoritativeCapability: "memory" },
      }),
      reconstructedRelationship(relationship, {
        memoryReference: createMemoryReference(
          relationship.memoryReference.memoryIdentity,
        ),
      }),
      reconstructedRelationship(relationship, {
        semanticValue: Object.freeze({ ...relationship.semanticValue }),
      }),
      reconstructedRelationship(relationship, {
        relationshipIdentity: memorySourceRelationshipIdentity(
          "substituted-relationship",
        ),
      }),
    ];

    for (const substituted of substitutions) {
      expect(() =>
        engine.bindMemorySourceRelationshipToPreparation(
          bindingRequest(substituted),
        ),
      ).toThrow(MemorySourceAuthorityVerificationFailureError);
    }
  });

  it("does not use Store state or association possession as binding authority", () => {
    const { engine, store, relationship } = createRunningMemory();
    const association = candidatePreparationAssociation("preparation-shared");
    const before = { reads: store.reads, writes: store.writes };
    const request = engine.bindMemorySourceRelationshipToPreparation(
      bindingRequest(relationship, association),
    );

    expect({ reads: store.reads, writes: store.writes }).toEqual(before);
    expect(request.candidatePreparationAssociation).toBe(association);
    expect(() =>
      engine.bindMemorySourceRelationshipToPreparation(
        bindingRequest(reconstructedRelationship(relationship), association),
      ),
    ).toThrow(MemorySourceAuthorityVerificationFailureError);
    expect({ reads: store.reads, writes: store.writes }).toEqual(before);
  });

  it("returns only opaque preparation binding without outcomes or authority internals", () => {
    const { engine, relationship } = createRunningMemory();
    const request = engine.bindMemorySourceRelationshipToPreparation(
      bindingRequest(relationship),
    );

    for (const prohibited of [
      "determination",
      "positive",
      "negative",
      "unableToDetermine",
      "propositionIdentity",
      "authorityToken",
      "authorityCaptureIdentifier",
      "bindingRecord",
      "diagnosticCorrelation",
      "verifierInternals",
      "storeMetadata",
      "content",
      "provenance",
      "confidence",
      "ranking",
      "trace",
    ]) {
      expect(request).not.toHaveProperty(prohibited);
      expect(request.relationship).not.toHaveProperty(prohibited);
    }
    expect(request.relationship).not.toHaveProperty(
      "candidatePreparationAssociation",
    );
    expect(() =>
      engine.issueMemorySourceRelationship({
        sourceAttribution: { authoritativeCapability: "memory" },
        memoryReference: relationship.memoryReference,
        semanticValue: relationship.semanticValue,
      }),
    ).not.toThrow();
  });
});
