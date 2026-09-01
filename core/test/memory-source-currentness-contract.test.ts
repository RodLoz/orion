import { describe, expect, expectTypeOf, it } from "vitest";

import {
  InvalidMemorySourceCurrentnessRequestError,
  InvalidMemorySourceRelationshipError,
  MemorySourceAuthorityVerificationFailureError,
  MemorySourceCurrentnessUnableToDetermineError,
  candidatePreparationAssociation,
  createMemoryReference,
  createMemorySourceCurrentnessRequest,
  createMemorySourceCurrentnessResult,
  createMemorySourceRelationship,
  createPositiveMemorySourceCurrentnessCorrespondence,
  memorySourceRelationshipIdentity,
  type CandidatePreparationAssociation,
  type MemoryIdentity,
  type MemoryReference,
  type MemorySourceCurrentnessResult,
  type MemorySourceRelationshipIdentity,
  type PropositionIdentity,
  type VerifyMemorySourceAuthorityRequest,
} from "../src/index.js";

const tupleInput = () => ({
  subjectKey: "user.preference",
  predicateKey: "theme",
  textualScalar: "dark",
});

const relationshipInput = () => ({
  sourceAttribution: { authoritativeCapability: "memory" },
  memoryReference: createMemoryReference("memory-1"),
  semanticValue: tupleInput(),
  relationshipIdentity: "memory-relationship-1",
});

const positiveCorrespondenceInput = () => ({
  sourceAttribution: { authoritativeCapability: "memory" },
  relationshipIdentity: "memory-relationship-1",
  candidatePreparationAssociation: "preparation-1",
  determination: "POSITIVE",
  issuerVerification: "memory-verification-1",
});

describe("Memory Source Currentness Core custody", () => {
  it("keeps the relationship identity nominally distinct and non-authoritative", () => {
    expectTypeOf<MemorySourceRelationshipIdentity>().not.toEqualTypeOf<PropositionIdentity>();
    expectTypeOf<MemorySourceRelationshipIdentity>().not.toEqualTypeOf<MemoryIdentity>();
    expectTypeOf<MemorySourceRelationshipIdentity>().not.toEqualTypeOf<MemoryReference>();
    expectTypeOf<MemorySourceRelationshipIdentity>().not.toEqualTypeOf<CandidatePreparationAssociation>();

    const identity = memorySourceRelationshipIdentity("memory-relationship-1");
    expect(identity).toBe("memory-relationship-1");
    expect(typeof identity).toBe("string");
    expect(identity).not.toHaveProperty("authority");
  });

  it("constructs the exact frozen Memory relationship correspondence", () => {
    const sourceReference = createMemoryReference("memory-1");
    const relationship = createMemorySourceRelationship({
      ...relationshipInput(),
      memoryReference: sourceReference,
    });

    expect(Object.keys(relationship)).toEqual([
      "sourceAttribution",
      "memoryReference",
      "semanticValue",
      "relationshipIdentity",
    ]);
    expect(Object.keys(relationship.sourceAttribution)).toEqual([
      "authoritativeCapability",
    ]);
    expect(Object.keys(relationship.semanticValue)).toEqual([
      "subjectKey",
      "predicateKey",
      "textualScalar",
    ]);
    expect(relationship.sourceAttribution.authoritativeCapability).toBe(
      "memory",
    );
    expect(relationship.memoryReference).toEqual(sourceReference);
    expect(relationship.semanticValue).toEqual(tupleInput());
    expect(relationship).not.toHaveProperty("propositionIdentity");
    expect(relationship).not.toHaveProperty("candidatePreparationAssociation");
    expect(Object.isFrozen(relationship)).toBe(true);
    expect(Object.isFrozen(relationship.sourceAttribution)).toBe(true);
    expect(Object.isFrozen(relationship.memoryReference)).toBe(true);
    expect(Object.isFrozen(relationship.semanticValue)).toBe(true);
  });

  it("constructs an exact request and preserves preparation association opaquely", () => {
    const association = candidatePreparationAssociation("preparation-1");
    const request = createMemorySourceCurrentnessRequest({
      relationship: relationshipInput(),
      candidatePreparationAssociation: association,
    });

    expect(Object.keys(request)).toEqual([
      "relationship",
      "candidatePreparationAssociation",
    ]);
    expect(request.candidatePreparationAssociation).toBe(association);
    expect(typeof request.candidatePreparationAssociation).toBe("string");
    expect(Object.isFrozen(request)).toBe(true);
    expect(Object.isFrozen(request.relationship)).toBe(true);
    expect(() =>
      createMemorySourceCurrentnessRequest({
        ...request,
        latest: true,
      }),
    ).toThrow(InvalidMemorySourceCurrentnessRequestError);
  });

  it("constructs the exact positive preparation-bound correspondence", () => {
    const correspondence = createPositiveMemorySourceCurrentnessCorrespondence(
      positiveCorrespondenceInput(),
    );
    const result = createMemorySourceCurrentnessResult({
      determination: "POSITIVE",
      correspondence,
    });

    expect(Object.keys(result)).toEqual(["determination", "correspondence"]);
    if (result.determination !== "POSITIVE") throw new Error("unreachable");
    expect(Object.keys(result.correspondence)).toEqual([
      "sourceAttribution",
      "relationshipIdentity",
      "candidatePreparationAssociation",
      "determination",
      "issuerVerification",
    ]);
    expect(result.correspondence.determination).toBe("POSITIVE");
    expect(result.correspondence.sourceAttribution).toEqual({
      authoritativeCapability: "memory",
    });
    expect(Object.isFrozen(result)).toBe(true);
    expect(Object.isFrozen(result.correspondence)).toBe(true);
    expect(Object.isFrozen(result.correspondence.sourceAttribution)).toBe(true);
  });

  it("constructs the exact negative semantic result without positive material", () => {
    const result = createMemorySourceCurrentnessResult({
      determination: "NEGATIVE",
    });
    expect(result).toEqual({ determination: "NEGATIVE" });
    expect(Object.keys(result)).toEqual(["determination"]);
    expect(result).not.toHaveProperty("correspondence");
    expect(Object.isFrozen(result)).toBe(true);
  });

  it("excludes unable-to-determine from the result union", () => {
    expectTypeOf<
      MemorySourceCurrentnessResult["determination"]
    >().toEqualTypeOf<"POSITIVE" | "NEGATIVE">();
    expect(() =>
      createMemorySourceCurrentnessResult({
        determination: "UNABLE_TO_DETERMINE",
      }),
    ).toThrow(InvalidMemorySourceCurrentnessRequestError);
  });

  it("custodies only the closed verifier request signature", () => {
    const currentnessRequest = createMemorySourceCurrentnessRequest({
      relationship: relationshipInput(),
      candidatePreparationAssociation: "preparation-1",
    });
    const request = {
      intent: "verify-memory-source-authority",
      currentnessRequest,
    } satisfies VerifyMemorySourceAuthorityRequest;
    expectTypeOf<keyof typeof request>().toEqualTypeOf<
      "intent" | "currentnessRequest"
    >();
    expect(request).not.toHaveProperty("authorityToken");
    expect(request).not.toHaveProperty("captureIdentifier");
  });

  it("exports four distinct stable Memory-owned public failure identities", () => {
    const failures = [
      new InvalidMemorySourceCurrentnessRequestError(),
      new InvalidMemorySourceRelationshipError(),
      new MemorySourceAuthorityVerificationFailureError(),
      new MemorySourceCurrentnessUnableToDetermineError(),
    ];
    expect(new Set(failures.map((failure) => failure.name)).size).toBe(4);
    for (const failure of failures) expect(failure).toBeInstanceOf(Error);
  });

  it("rejects open shapes at every public construction boundary", () => {
    expect(() =>
      createMemorySourceRelationship({
        ...relationshipInput(),
        timestamp: "2026-08-31T00:00:00Z",
      }),
    ).toThrow(InvalidMemorySourceRelationshipError);
    expect(() =>
      createPositiveMemorySourceCurrentnessCorrespondence({
        ...positiveCorrespondenceInput(),
        credentials: "secret",
      }),
    ).toThrow(MemorySourceAuthorityVerificationFailureError);
    expect(() =>
      createMemorySourceCurrentnessResult({
        determination: "NEGATIVE",
        message: "arbitrary",
      }),
    ).toThrow(InvalidMemorySourceCurrentnessRequestError);
  });

  it("keeps protected Memory and authority internals absent", () => {
    const relationship = createMemorySourceRelationship(relationshipInput());
    const request = createMemorySourceCurrentnessRequest({
      relationship,
      candidatePreparationAssociation: "preparation-1",
    });
    const positive = createMemorySourceCurrentnessResult({
      determination: "POSITIVE",
      correspondence: positiveCorrespondenceInput(),
    });
    const surfaces: readonly object[] = [
      relationship,
      relationship.sourceAttribution,
      relationship.memoryReference,
      relationship.semanticValue,
      request,
      positive,
      positive.determination === "POSITIVE"
        ? positive.correspondence
        : positive,
    ];
    const prohibited = [
      "content",
      "memoryContent",
      "provenance",
      "retentionReason",
      "retainedAt",
      "retrievedAt",
      "retrievalReceipt",
      "retrievalPurpose",
      "lastUse",
      "embeddings",
      "confidence",
      "ranking",
      "retrievalTraces",
      "storeMetadata",
      "databaseMetadata",
      "credentials",
      "lifecycleInternals",
      "authorityCaptureInternals",
      "verifierInternals",
      "authorityToken",
      "propositionIdentity",
    ];
    for (const surface of surfaces) {
      for (const field of prohibited) expect(surface).not.toHaveProperty(field);
    }
  });
});
