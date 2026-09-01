import {
  InvalidMemorySourceCurrentnessRequestError,
  InvalidMemorySourceRelationshipError,
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

class AuthorityConstruction implements MemoryConstructionValues {
  public nextMemoryIdentity(): unknown {
    return "memory-currentness-authority-source";
  }

  public nextRetainedAt(): unknown {
    return "2026-08-31T00:00:00.000Z";
  }

  public nextRetrievedAt(): unknown {
    return "2026-08-31T00:01:00.000Z";
  }
}

class AuthorityStore implements MemoryStore {
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

function createRunningMemory(store = new AuthorityStore()) {
  const engine = new MemoryEngine(store, new AuthorityConstruction());
  engine.initialize();
  engine.start();
  return { engine, store };
}

function createCurrentnessSetup(store = new AuthorityStore()) {
  const running = createRunningMemory(store);
  const record = running.engine.retainMemory({
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
  const retrieved = running.engine.getMemory({
    memoryIdentity: record.memoryIdentity,
    purpose: "continuity",
  });
  const relationship = running.engine.issueMemorySourceRelationship({
    sourceAttribution: { authoritativeCapability: "memory" },
    memoryReference: retrieved.receipt.memoryReference,
    semanticValue: {
      subjectKey: "user.preference",
      predicateKey: "theme",
      textualScalar: "Dark Theme",
    },
  });
  const currentnessRequest =
    running.engine.bindMemorySourceRelationshipToPreparation({
      relationship,
      candidatePreparationAssociation: candidatePreparationAssociation(
        "preparation-authority-1",
      ),
    });
  return { ...running, record, relationship, currentnessRequest };
}

function verifierRequest(currentnessRequest: unknown) {
  return {
    intent: "verify-memory-source-authority",
    currentnessRequest,
  };
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
  request: MemorySourceCurrentnessRequest,
  relationship: MemorySourceRelationship = request.relationship,
  association: unknown = request.candidatePreparationAssociation,
) {
  return createMemorySourceCurrentnessRequest({
    relationship,
    candidatePreparationAssociation: association,
  });
}

describe("Memory Source Currentness authority verification", () => {
  it("returns one exact minimized frozen POSITIVE result for an exact F03 request", () => {
    const { engine, currentnessRequest } = createCurrentnessSetup();
    const first = engine.verifyMemorySourceAuthority(
      verifierRequest(currentnessRequest),
    );
    const second = engine.verifyMemorySourceAuthority(
      verifierRequest(currentnessRequest),
    );

    expect(Object.keys(first)).toEqual(["determination", "correspondence"]);
    expect(first.determination).toBe("POSITIVE");
    if (first.determination !== "POSITIVE") throw new Error("unreachable");
    if (second.determination !== "POSITIVE") throw new Error("unreachable");
    expect(Object.keys(first.correspondence)).toEqual([
      "sourceAttribution",
      "relationshipIdentity",
      "candidatePreparationAssociation",
      "determination",
      "issuerVerification",
    ]);
    expect(first.correspondence.sourceAttribution).toEqual({
      authoritativeCapability: "memory",
    });
    expect(first.correspondence.relationshipIdentity).toBe(
      currentnessRequest.relationship.relationshipIdentity,
    );
    expect(first.correspondence.candidatePreparationAssociation).toBe(
      currentnessRequest.candidatePreparationAssociation,
    );
    expect(first.correspondence.determination).toBe("POSITIVE");
    expect(first.correspondence.issuerVerification).not.toBe(
      second.correspondence.issuerVerification,
    );
    expect(Object.isFrozen(first)).toBe(true);
    expect(Object.isFrozen(first.correspondence)).toBe(true);
    expect(Object.isFrozen(first.correspondence.sourceAttribution)).toBe(true);
  });

  it("rejects malformed wrappers, caller outcomes, and caller authority proofs", () => {
    const { engine, currentnessRequest } = createCurrentnessSetup();
    for (const invalid of [
      null,
      {},
      { currentnessRequest },
      { intent: "verify-memory-source-authority" },
      { intent: "verify-something-else", currentnessRequest },
      { ...verifierRequest(currentnessRequest), extra: true },
      { ...verifierRequest(currentnessRequest), determination: "POSITIVE" },
      { ...verifierRequest(currentnessRequest), authorityProof: "caller" },
    ]) {
      expect(() => engine.verifyMemorySourceAuthority(invalid)).toThrow(
        InvalidMemorySourceCurrentnessRequestError,
      );
    }
  });

  it("preserves malformed currentness and relationship failure distinctions", () => {
    const { engine, currentnessRequest } = createCurrentnessSetup();
    for (const invalid of [
      null,
      {},
      { ...currentnessRequest, extra: true },
      {
        relationship: currentnessRequest.relationship,
        candidatePreparationAssociation: "",
      },
    ]) {
      expect(() =>
        engine.verifyMemorySourceAuthority(verifierRequest(invalid)),
      ).toThrow(InvalidMemorySourceCurrentnessRequestError);
    }
    expect(() =>
      engine.verifyMemorySourceAuthority(
        verifierRequest({
          relationship: {},
          candidatePreparationAssociation: "preparation-authority-1",
        }),
      ),
    ).toThrow(InvalidMemorySourceRelationshipError);
  });

  it("rejects fabricated and cloned F03 requests despite structural equality", () => {
    const { engine, currentnessRequest } = createCurrentnessSetup();
    const fabricated = reconstructRequest(currentnessRequest);
    const clone = Object.freeze({ ...currentnessRequest });
    expect(fabricated).toEqual(currentnessRequest);
    expect(clone).toEqual(currentnessRequest);

    for (const invalid of [fabricated, clone]) {
      expect(() =>
        engine.verifyMemorySourceAuthority(verifierRequest(invalid)),
      ).toThrow(MemorySourceAuthorityVerificationFailureError);
    }
  });

  it("rejects relationship, reference, tuple, identity, and preparation substitutions", () => {
    const { engine, currentnessRequest } = createCurrentnessSetup();
    const relationship = currentnessRequest.relationship;
    const substitutions = [
      reconstructRequest(
        currentnessRequest,
        reconstructRelationship(relationship),
      ),
      reconstructRequest(
        currentnessRequest,
        reconstructRelationship(relationship, {
          memoryReference: createMemoryReference(
            relationship.memoryReference.memoryIdentity,
          ),
        }),
      ),
      reconstructRequest(
        currentnessRequest,
        reconstructRelationship(relationship, {
          semanticValue: Object.freeze({ ...relationship.semanticValue }),
        }),
      ),
      reconstructRequest(
        currentnessRequest,
        reconstructRelationship(relationship, {
          relationshipIdentity: memorySourceRelationshipIdentity(
            "substituted-currentness-relationship",
          ),
        }),
      ),
      reconstructRequest(
        currentnessRequest,
        relationship,
        candidatePreparationAssociation("preparation-substituted"),
      ),
    ];

    for (const invalid of substitutions) {
      expect(() =>
        engine.verifyMemorySourceAuthority(verifierRequest(invalid)),
      ).toThrow(MemorySourceAuthorityVerificationFailureError);
    }
  });

  it("rejects exact requests at a different or reconstructed Memory instance", () => {
    const store = new AuthorityStore();
    const { currentnessRequest } = createCurrentnessSetup(store);
    const other = createRunningMemory().engine;
    const reconstructed = createRunningMemory(store).engine;

    for (const engine of [other, reconstructed]) {
      expect(() =>
        engine.verifyMemorySourceAuthority(verifierRequest(currentnessRequest)),
      ).toThrow(MemorySourceAuthorityVerificationFailureError);
    }
  });

  it("uses unable-to-determine only for an exact request lacking conclusive lifecycle evidence", () => {
    const { engine, record, currentnessRequest } = createCurrentnessSetup();
    engine.forgetMemory({
      intent: "forget",
      memoryIdentity: record.memoryIdentity,
    });

    expect(() =>
      engine.verifyMemorySourceAuthority(verifierRequest(currentnessRequest)),
    ).toThrow(MemorySourceCurrentnessUnableToDetermineError);
    expect(() =>
      engine.verifyMemorySourceAuthority(verifierRequest(currentnessRequest)),
    ).not.toThrow(MemorySourceAuthorityVerificationFailureError);
  });

  it("does not consult Store presence, absence, or availability for authority", () => {
    const { engine, store, currentnessRequest } = createCurrentnessSetup();
    const before = { reads: store.reads, writes: store.writes };
    store.records.clear();
    store.available = false;

    const result = engine.verifyMemorySourceAuthority(
      verifierRequest(currentnessRequest),
    );
    expect(result.determination).toBe("POSITIVE");
    expect(result.determination).not.toBe("NEGATIVE");
    expect({ reads: store.reads, writes: store.writes }).toEqual(before);
  });

  it("keeps issuer correspondence non-bearer and all protected state private", () => {
    const { engine, currentnessRequest } = createCurrentnessSetup();
    const result = engine.verifyMemorySourceAuthority(
      verifierRequest(currentnessRequest),
    );
    if (result.determination !== "POSITIVE") throw new Error("unreachable");
    const copiedIssuerVerification = `${result.correspondence.issuerVerification}`;

    expect(() =>
      engine.verifyMemorySourceAuthority({
        ...verifierRequest(currentnessRequest),
        issuerVerification: copiedIssuerVerification,
      }),
    ).toThrow(InvalidMemorySourceCurrentnessRequestError);
    expect(() =>
      engine.verifyMemorySourceAuthority({
        intent: "verify-memory-source-authority",
        currentnessRequest: result.correspondence,
      }),
    ).toThrow(InvalidMemorySourceCurrentnessRequestError);

    for (const prohibited of [
      "content",
      "provenance",
      "storeMetadata",
      "databaseMetadata",
      "credentials",
      "lifecycleInternals",
      "authorityCapture",
      "captureIdentifier",
      "verifierInternals",
      "authorityToken",
      "propositionIdentity",
      "privateTrace",
      "confidence",
      "ranking",
      "diagnosticCorrelation",
    ]) {
      expect(result).not.toHaveProperty(prohibited);
      expect(result.correspondence).not.toHaveProperty(prohibited);
    }
  });
});
