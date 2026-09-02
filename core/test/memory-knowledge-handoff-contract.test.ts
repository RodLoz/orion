import {
  InvalidCandidatePreparationAssociationValueError,
  InvalidKnowledgeProjectionPreparationPrerequisitesValueError,
  InvalidMemoryKnowledgeSourceBindingValueError,
  candidatePreparationAssociation,
  createKnowledgeProjectionPreparationPrerequisites,
  createMemoryKnowledgeSourceBinding,
  createMemoryReference,
  createMemorySourceAttribution,
  createMemorySourcePropositionTuple,
  createMemorySourceRelationship,
  createPositiveMemorySourceCurrentnessCorrespondence,
  memorySourceIssuerVerificationCorrespondence,
  memorySourceRelationshipIdentity,
  type BindMemorySourceRelationshipToPreparation,
  type CandidatePreparationAssociation,
  type IssueMemorySourceRelationship,
  type MemoryExternalSourceProjectionPrerequisites,
  type MemoryKnowledgeSourceBinding,
  type MemorySourceRelationshipIdentity,
  type PropositionIdentity,
  type VerifyMemorySourceAuthority,
} from "../src/index.js";
import { describe, expect, expectTypeOf, it } from "vitest";

function relationship() {
  return createMemorySourceRelationship({
    sourceAttribution: createMemorySourceAttribution({
      authoritativeCapability: "memory",
    }),
    memoryReference: createMemoryReference("memory-1"),
    semanticValue: createMemorySourcePropositionTuple({
      subjectKey: "subject",
      predicateKey: "predicate",
      textualScalar: "value",
    }),
    relationshipIdentity: memorySourceRelationshipIdentity("relationship-1"),
  });
}

function positive(
  association: CandidatePreparationAssociation = candidatePreparationAssociation(
    "preparation-1",
  ),
) {
  return createPositiveMemorySourceCurrentnessCorrespondence({
    sourceAttribution: createMemorySourceAttribution({
      authoritativeCapability: "memory",
    }),
    relationshipIdentity: memorySourceRelationshipIdentity("relationship-1"),
    candidatePreparationAssociation: association,
    determination: "POSITIVE",
    issuerVerification: memorySourceIssuerVerificationCorrespondence(
      "issuer-verification-1",
    ),
  });
}

function binding(sourceRelationship = relationship()) {
  return createMemoryKnowledgeSourceBinding({
    kind: "memory-source-relationship",
    relationship: sourceRelationship,
  });
}

function memoryPrerequisites() {
  const association = candidatePreparationAssociation("preparation-1");
  const sourceBinding = binding();
  const correspondence = positive(association);
  return {
    association,
    sourceBinding,
    correspondence,
    input: {
      currentnessOwner: "external-source-currentness",
      externalSourceKind: "memory",
      candidatePreparationAssociation: association,
      memorySourceBinding: sourceBinding,
      externalCurrentnessCorrespondence: correspondence,
    },
  } as const;
}

describe("Memory-specific Knowledge handoff Core custody", () => {
  it("creates one closed frozen binding while preserving the exact relationship", () => {
    const sourceRelationship = relationship();
    const sourceBinding = binding(sourceRelationship);

    expect(Reflect.ownKeys(sourceBinding)).toEqual(["kind", "relationship"]);
    expect(sourceBinding.kind).toBe("memory-source-relationship");
    expect(sourceBinding.relationship).toBe(sourceRelationship);
    expect(Object.isFrozen(sourceBinding)).toBe(true);
    expect(sourceBinding).not.toHaveProperty("candidatePreparationAssociation");
    expect(sourceBinding).not.toHaveProperty("propositionIdentity");
    for (const prohibited of [
      "authority",
      "authorityToken",
      "bearerToken",
      "captureIdentifier",
      "issuerVerification",
      "storeMetadata",
    ]) {
      expect(sourceBinding).not.toHaveProperty(prohibited);
    }
  });

  it("rejects malformed, open, or incorrectly discriminated bindings", () => {
    const sourceRelationship = relationship();
    for (const candidate of [
      {},
      { kind: "other", relationship: sourceRelationship },
      {
        kind: "memory-source-relationship",
        relationship: sourceRelationship,
        extra: true,
      },
      { kind: "memory-source-relationship", relationship: {} },
    ]) {
      expect(() => createMemoryKnowledgeSourceBinding(candidate)).toThrow(
        InvalidMemoryKnowledgeSourceBindingValueError,
      );
    }
  });

  it("creates the exact closed frozen Memory prerequisite arm", () => {
    const setup = memoryPrerequisites();
    const prerequisites = createKnowledgeProjectionPreparationPrerequisites(
      setup.input,
    );

    expect(Reflect.ownKeys(prerequisites)).toEqual([
      "candidatePreparationAssociation",
      "currentnessOwner",
      "externalSourceKind",
      "memorySourceBinding",
      "externalCurrentnessCorrespondence",
    ]);
    expect(prerequisites.currentnessOwner).toBe("external-source-currentness");
    expect("externalSourceKind" in prerequisites).toBe(true);
    if (!("externalSourceKind" in prerequisites)) throw new Error();
    expect(prerequisites.externalSourceKind).toBe("memory");
    expect(prerequisites.candidatePreparationAssociation).toBe(
      setup.association,
    );
    expect(prerequisites.memorySourceBinding).toBe(setup.sourceBinding);
    expect(prerequisites.externalCurrentnessCorrespondence).toBe(
      setup.correspondence,
    );
    expect(Object.isFrozen(prerequisites)).toBe(true);
    expectTypeOf(
      setup.input,
    ).toMatchTypeOf<MemoryExternalSourceProjectionPrerequisites>();
  });

  it("rejects arbitrary fields and malformed nested Memory prerequisites", () => {
    const setup = memoryPrerequisites();
    for (const candidate of [
      { ...setup.input, extra: true },
      { ...setup.input, externalSourceKind: "other" },
      { ...setup.input, memorySourceBinding: {} },
      {
        ...setup.input,
        externalCurrentnessCorrespondence: {
          ...setup.correspondence,
          determination: "NEGATIVE",
        },
      },
    ]) {
      expect(() =>
        createKnowledgeProjectionPreparationPrerequisites(candidate),
      ).toThrow(InvalidKnowledgeProjectionPreparationPrerequisitesValueError);
    }
  });

  it("preserves the existing Knowledge-owned and generic external arms", () => {
    const knowledgeOwned = createKnowledgeProjectionPreparationPrerequisites({
      candidatePreparationAssociation: "preparation-1",
      currentnessOwner: "knowledge-owned-currentness",
    });
    expect(knowledgeOwned).toEqual({
      candidatePreparationAssociation: "preparation-1",
      currentnessOwner: "knowledge-owned-currentness",
    });

    const genericExternal = createKnowledgeProjectionPreparationPrerequisites({
      candidatePreparationAssociation: "preparation-1",
      currentnessOwner: "external-source-currentness",
      externalCurrentnessCorrespondence: {
        applicableOwner: "external-owner",
        candidatePreparationAssociation: "preparation-1",
        propositionSourceRelationship: "external-relationship",
        determination: "current",
        issuerVerification: "external-verification",
      },
    });
    expect(genericExternal).toMatchObject({
      candidatePreparationAssociation: "preparation-1",
      currentnessOwner: "external-source-currentness",
      externalCurrentnessCorrespondence: {
        determination: "current",
      },
    });
  });

  it("retains opaque association semantics and branded identity separation", () => {
    expect(candidatePreparationAssociation(" opaque ")).toBe(" opaque ");
    expect(() => candidatePreparationAssociation("")).toThrow(
      InvalidCandidatePreparationAssociationValueError,
    );
    expectTypeOf<MemorySourceRelationshipIdentity>().not.toEqualTypeOf<PropositionIdentity>();
    expectTypeOf<MemoryKnowledgeSourceBinding>().not.toEqualTypeOf<CandidatePreparationAssociation>();
  });

  it("defines capability custody compatible with the existing verifier", () => {
    type MemorySourceCapabilities = IssueMemorySourceRelationship &
      BindMemorySourceRelationshipToPreparation &
      VerifyMemorySourceAuthority;
    expectTypeOf<MemorySourceCapabilities>().toHaveProperty(
      "issueMemorySourceRelationship",
    );
    expectTypeOf<MemorySourceCapabilities>().toHaveProperty(
      "bindMemorySourceRelationshipToPreparation",
    );
    expectTypeOf<MemorySourceCapabilities>().toHaveProperty(
      "verifyMemorySourceAuthority",
    );
  });
});
