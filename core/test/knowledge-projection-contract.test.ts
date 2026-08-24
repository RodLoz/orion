import { describe, expect, expectTypeOf, it } from "vitest";

import {
  InvalidCandidatePreparationAssociationValueError,
  InvalidKnowledgeAcceptanceSemanticInputValueError,
  InvalidKnowledgeCapabilityAttributionValueError,
  InvalidKnowledgeOwnedSourceCurrentnessDeterminationValueError,
  InvalidKnowledgeRecordValueError,
  InvalidKnowledgePredicateKeyValueError,
  InvalidKnowledgeProjectionPreparationPrerequisitesValueError,
  InvalidKnowledgeProjectionRequestValueError,
  InvalidKnowledgeSubjectKeyValueError,
  InvalidKnowledgeTextualScalarValueError,
  KnowledgeProjectionPreparationMismatchValueError,
  candidatePreparationAssociation,
  createExternalSourceCurrentnessCorrespondence,
  createAcceptedStructuredKnowledgeSourceOwnershipCorrespondence,
  createKnowledgeAcceptanceSemanticInput,
  createKnowledgeCapabilityAttribution,
  createKnowledgeOwnedSourceCurrentnessDetermination,
  createKnowledgeProjectionPreparationPrerequisites,
  createKnowledgeProjectionRequest,
  createKnowledgeProjectionTarget,
  createKnowledgeRecord,
  createStructuredKnowledgeProjectionCandidate,
  createStructuredKnowledgeSourceOwnershipProposal,
  createStructuredTextualKnowledgeProposition,
  knowledgePredicateKey,
  knowledgeSubjectKey,
  knowledgeTextualScalar,
  propositionIdentity,
  type EvaluateKnowledgeClaimRequest,
  type GetKnowledgeRequest,
  type KnowledgeConstructionValues,
  type KnowledgeIdentity,
  type KnowledgeProjectionRequest,
  type KnowledgeProjectionIssuanceCorrespondence,
  type KnowledgeProjectionAuthority,
  type StructuredKnowledgeProjection,
  type StructuredKnowledgeProjectionCandidate,
  type VerifyStructuredKnowledgeProjectionAuthorityRequest,
} from "../src/index.js";

const tuple = () => ({
  subjectKey: "orion.subject",
  predicateKey: "orion.predicate",
  textualScalar: " governed textual value ",
});

const externalCurrentness = (association = "preparation-a") => ({
  applicableOwner: "orion.source",
  candidatePreparationAssociation: association,
  propositionSourceRelationship: "source-relationship-1",
  determination: "current",
  issuerVerification: "source-verification-1",
});

const knowledgeOwnedSource = () => ({
  currentnessOwner: "knowledge-owned-currentness",
});

const externalOwnedSource = () => ({
  currentnessOwner: "external-source-currentness",
  applicableOwner: "orion.source",
  propositionSourceRelationship: "source-relationship-1",
});

const externalPrerequisites = (association = "preparation-a") => ({
  candidatePreparationAssociation: association,
  currentnessOwner: "external-source-currentness",
  externalCurrentnessCorrespondence: externalCurrentness(association),
});

const externalProjectionCandidateInput = (): Record<string, unknown> => ({
  semanticValue: tuple(),
  correspondence: {
    candidatePreparationAssociation: "preparation-a",
    propositionIdentity: "proposition-1",
    knowledgeIdentity: "knowledge-1",
    knowledgeVersion: 1,
    validationState: "accepted",
    attribution: { authoritativeCapability: "knowledge" },
    underlyingSourceAuthority: "source-authority-1",
    sourceOwnershipCorrespondence: externalOwnedSource(),
    externalCurrentnessCorrespondence: externalCurrentness(),
  },
});

const knowledgeOwnedDetermination = (
  outcome: "positive" | "negative" | "unable-to-determine" = "positive",
) => ({
  currentnessOwner: "knowledge-owned-currentness",
  outcome,
  knowledgeIdentity: "knowledge-1",
  knowledgeVersion: 1,
  propositionIdentity: "proposition-1",
  semanticValue: tuple(),
  candidatePreparationAssociation: "preparation-a",
});

const knowledgeProjectionCandidateInput = (): Record<string, unknown> => ({
  semanticValue: tuple(),
  correspondence: {
    candidatePreparationAssociation: "preparation-a",
    propositionIdentity: "proposition-1",
    knowledgeIdentity: "knowledge-1",
    knowledgeVersion: 1,
    validationState: "accepted",
    attribution: { authoritativeCapability: "knowledge" },
    sourceOwnershipCorrespondence: knowledgeOwnedSource(),
    knowledgeOwnedCurrentnessDetermination: knowledgeOwnedDetermination(),
  },
});

const authorityFixture = () => {
  const captured = new WeakSet<StructuredKnowledgeProjection>();
  const authority: KnowledgeProjectionAuthority = {
    captureStructuredKnowledgeProjectionAuthority: ({ candidate }) => {
      const issuance = Object.freeze(
        {},
      ) as KnowledgeProjectionIssuanceCorrespondence;
      const projection = Object.freeze({
        semanticValue: candidate.semanticValue,
        correspondence: Object.freeze({
          ...candidate.correspondence,
          issuance,
        }),
      });
      captured.add(projection);
      return projection;
    },
    verifyStructuredKnowledgeProjectionAuthority: ({ candidate }) => {
      if (!captured.has(candidate)) throw new Error("authority mismatch");
      return candidate;
    },
  };
  return authority;
};

const recordInput = (): Record<string, unknown> => ({
  knowledgeIdentity: "knowledge-1",
  claim: "Opaque CandidateClaim; no tuple is derived from this prose.",
  provenance: {
    sourceType: "approved-internal-source",
    originatingCapability: "orion.test",
    observedAt: "2026-08-17T00:00:00.000Z",
  },
  acceptanceEvidence: {
    method: "explicit-authority-review",
    authorityIdentifier: "orion.test.authority",
    decision: "accept",
    reason: "Reviewed for structured-record testing.",
  },
  acceptedAt: "2026-08-17T00:01:00.000Z",
  version: 1,
});

describe("Knowledge 1.3 structured projection Core language", () => {
  it("preserves opaque Candidate-Preparation Associations exactly", () => {
    const value = " e\u0301-preparation ";
    expect(candidatePreparationAssociation(value)).toBe(value);
    expect(candidatePreparationAssociation("preparation-a")).not.toBe(
      candidatePreparationAssociation("preparation-b"),
    );
    expect(() => candidatePreparationAssociation("")).toThrow(
      InvalidCandidatePreparationAssociationValueError,
    );
    expect(() => candidatePreparationAssociation(1)).toThrow(
      InvalidCandidatePreparationAssociationValueError,
    );
  });

  it.each([
    [knowledgeSubjectKey, InvalidKnowledgeSubjectKeyValueError],
    [knowledgePredicateKey, InvalidKnowledgePredicateKeyValueError],
  ] as const)(
    "validates exact bounded proposition keys",
    (factory, failure) => {
      expect(factory("x")).toBe("x");
      expect(factory("😀".repeat(128))).toBe("😀".repeat(128));
      expect(() => factory("😀".repeat(129))).toThrow(failure);
      for (const invalid of ["", " ", " key", "key ", null, 1]) {
        expect(() => factory(invalid)).toThrow(failure);
      }
      const composed = "é";
      const decomposed = "e\u0301";
      expect(factory(composed)).toBe(composed);
      expect(factory(decomposed)).toBe(decomposed);
      expect(factory(composed)).not.toBe(factory(decomposed));
    },
  );

  it("validates and exactly preserves bounded textual scalars", () => {
    expect(knowledgeTextualScalar("x")).toBe("x");
    expect(knowledgeTextualScalar("😀".repeat(4096))).toBe("😀".repeat(4096));
    expect(() => knowledgeTextualScalar("😀".repeat(4097))).toThrow(
      InvalidKnowledgeTextualScalarValueError,
    );
    for (const invalid of ["", "   ", null, 1]) {
      expect(() => knowledgeTextualScalar(invalid)).toThrow(
        InvalidKnowledgeTextualScalarValueError,
      );
    }
    expect(knowledgeTextualScalar(" value ")).toBe(" value ");
    expect(knowledgeTextualScalar("é")).not.toBe(
      knowledgeTextualScalar("e\u0301"),
    );
  });

  it("constructs one immutable structured textual proposition", () => {
    const proposition = createStructuredTextualKnowledgeProposition(tuple());
    expect(proposition).toEqual(tuple());
    expect(Object.isFrozen(proposition)).toBe(true);
    expect(proposition).not.toHaveProperty("claim");
  });

  it("adds an optional Knowledge-owned PropositionIdentity construction dependency", () => {
    const legacyConstruction: KnowledgeConstructionValues = {
      nextKnowledgeIdentity: () => "knowledge-1",
      nextAcceptedAt: () => "2026-08-17T00:01:00.000Z",
    };
    const structuredConstruction: KnowledgeConstructionValues = {
      ...legacyConstruction,
      nextPropositionIdentity: () => propositionIdentity("proposition-1"),
    };
    expect(legacyConstruction.nextPropositionIdentity).toBeUndefined();
    expect(structuredConstruction.nextPropositionIdentity?.()).toBe(
      "proposition-1",
    );
    expect(structuredConstruction.nextPropositionIdentity).toHaveLength(0);
    expectTypeOf(
      propositionIdentity("proposition-1"),
    ).not.toEqualTypeOf<KnowledgeIdentity>();
  });

  it("closes Knowledge-owned and external accepted source correspondence", () => {
    const knowledgeOwned =
      createAcceptedStructuredKnowledgeSourceOwnershipCorrespondence(
        knowledgeOwnedSource(),
      );
    const externalOwned =
      createAcceptedStructuredKnowledgeSourceOwnershipCorrespondence(
        externalOwnedSource(),
      );
    expect(knowledgeOwned).toEqual(knowledgeOwnedSource());
    expect(knowledgeOwned).not.toHaveProperty("applicableOwner");
    expect(knowledgeOwned).not.toHaveProperty("propositionSourceRelationship");
    expect(externalOwned).toEqual(externalOwnedSource());
    expect(Object.isFrozen(knowledgeOwned)).toBe(true);
    expect(Object.isFrozen(externalOwned)).toBe(true);

    for (const invalid of [
      { currentnessOwner: "external-source-currentness" },
      {
        currentnessOwner: "external-source-currentness",
        applicableOwner: "orion.source",
      },
      {
        currentnessOwner: "external-source-currentness",
        propositionSourceRelationship: "source-relationship-1",
      },
      {
        ...knowledgeOwnedSource(),
        applicableOwner: "orion.source",
        propositionSourceRelationship: "source-relationship-1",
      },
      { currentnessOwner: "other-source-currentness" },
      {
        ...externalOwnedSource(),
        propositionSourceRelationship: "",
      },
      {
        ...externalOwnedSource(),
        propositionSourceRelationships: [
          "source-relationship-1",
          "source-relationship-2",
        ],
      },
    ]) {
      expect(() =>
        createStructuredKnowledgeSourceOwnershipProposal(invalid),
      ).toThrow();
      expect(() =>
        createAcceptedStructuredKnowledgeSourceOwnershipCorrespondence(invalid),
      ).toThrow();
    }
  });

  it("preserves the exact legacy claim-only Knowledge Record shape", () => {
    const record = createKnowledgeRecord(recordInput());
    expect(record.knowledgeIdentity).toBe("knowledge-1");
    expect(record.version).toBe(1);
    expect(record).not.toHaveProperty("acceptedStructuredProposition");
  });

  it("binds exactly one immutable accepted structured proposition to a record", () => {
    const semanticValue = {
      subjectKey: "subject.😀",
      predicateKey: "predicate.value",
      textualScalar: " é / e\u0301 / 😀 ",
    };
    const record = createKnowledgeRecord({
      ...recordInput(),
      acceptedStructuredProposition: {
        propositionIdentity: "proposition-1",
        semanticValue,
        sourceOwnershipCorrespondence: knowledgeOwnedSource(),
      },
    });
    expect(record.acceptedStructuredProposition).toEqual({
      propositionIdentity: "proposition-1",
      semanticValue,
      sourceOwnershipCorrespondence: knowledgeOwnedSource(),
    });
    expect(record.knowledgeIdentity).toBe("knowledge-1");
    expect(record.version).toBe(1);
    const binding = record.acceptedStructuredProposition;
    expect(binding).toBeDefined();
    if (binding === undefined) throw new Error("missing structured binding");
    expect(Object.isFrozen(binding)).toBe(true);
    expect(Object.isFrozen(binding.semanticValue)).toBe(true);
    expect(binding.semanticValue.textualScalar).toBe(
      semanticValue.textualScalar,
    );
    expect(binding.semanticValue.textualScalar).not.toBe(record.claim);
  });

  it("reconstructs exact external accepted source correspondence", () => {
    const record = createKnowledgeRecord({
      ...recordInput(),
      acceptedStructuredProposition: {
        propositionIdentity: "proposition-1",
        semanticValue: tuple(),
        sourceOwnershipCorrespondence: externalOwnedSource(),
      },
    });
    const binding = record.acceptedStructuredProposition;
    expect(binding).toBeDefined();
    if (binding === undefined) throw new Error("missing structured binding");
    expect(binding.sourceOwnershipCorrespondence).toEqual(
      externalOwnedSource(),
    );
    expect(Object.isFrozen(binding.sourceOwnershipCorrespondence)).toBe(true);
    expect(
      binding.sourceOwnershipCorrespondence.currentnessOwner ===
        "external-source-currentness"
        ? binding.sourceOwnershipCorrespondence.propositionSourceRelationship
        : undefined,
    ).toBe(
      createExternalSourceCurrentnessCorrespondence(externalCurrentness())
        .propositionSourceRelationship,
    );
  });

  it("rejects partial, malformed, multiple, and ungoverned structured record state", () => {
    for (const acceptedStructuredProposition of [
      { propositionIdentity: "proposition-1" },
      { semanticValue: tuple() },
      {
        propositionIdentity: "proposition-1",
        semanticValue: {},
        sourceOwnershipCorrespondence: knowledgeOwnedSource(),
      },
      {
        propositionIdentity: "proposition-1",
        semanticValue: tuple(),
        sourceOwnershipCorrespondence: knowledgeOwnedSource(),
        extra: true,
      },
      [
        {
          propositionIdentity: "proposition-1",
          semanticValue: tuple(),
          sourceOwnershipCorrespondence: knowledgeOwnedSource(),
        },
        {
          propositionIdentity: "proposition-2",
          semanticValue: tuple(),
          sourceOwnershipCorrespondence: knowledgeOwnedSource(),
        },
      ],
    ]) {
      expect(() =>
        createKnowledgeRecord({
          ...recordInput(),
          acceptedStructuredProposition,
        }),
      ).toThrow(InvalidKnowledgeRecordValueError);
    }
    expect(() =>
      createKnowledgeRecord({
        ...recordInput(),
        propositionIdentity: "proposition-1",
        semanticValue: tuple(),
      }),
    ).toThrow(InvalidKnowledgeRecordValueError);
  });

  it("closes claim-only and declared structured acceptance shapes", () => {
    const claimOnly = createKnowledgeAcceptanceSemanticInput({
      claim: "opaque CandidateClaim",
    });
    const structured = createKnowledgeAcceptanceSemanticInput({
      claim: "opaque CandidateClaim",
      structuredProposition: tuple(),
      samePropositionDeclaration: "same-proposition",
      sourceOwnershipProposal: knowledgeOwnedSource(),
    });
    const externalStructured = createKnowledgeAcceptanceSemanticInput({
      claim: "opaque CandidateClaim",
      structuredProposition: tuple(),
      samePropositionDeclaration: "same-proposition",
      sourceOwnershipProposal: externalOwnedSource(),
    });
    expect(claimOnly).toEqual({ claim: "opaque CandidateClaim" });
    expect(structured.samePropositionDeclaration).toBe("same-proposition");
    expect(externalStructured.sourceOwnershipProposal).toEqual(
      externalOwnedSource(),
    );

    for (const invalid of [
      {
        structuredProposition: tuple(),
        samePropositionDeclaration: "same-proposition",
      },
      { claim: "opaque", structuredProposition: tuple() },
      { claim: "opaque", samePropositionDeclaration: "same-proposition" },
      {
        claim: "opaque",
        sourceOwnershipProposal: knowledgeOwnedSource(),
      },
      {
        claim: "opaque",
        structuredProposition: tuple(),
        samePropositionDeclaration: "different-proposition",
        sourceOwnershipProposal: knowledgeOwnedSource(),
      },
      {
        claim: "opaque",
        structuredProposition: tuple(),
        samePropositionDeclaration: "same-proposition",
      },
    ]) {
      expect(() => createKnowledgeAcceptanceSemanticInput(invalid)).toThrow(
        InvalidKnowledgeAcceptanceSemanticInputValueError,
      );
    }

    const legacyRequest = {
      intent: "evaluate",
      claim: "opaque",
      acceptanceEvidence: {},
      provenance: {},
    } satisfies EvaluateKnowledgeClaimRequest;
    const structuredRequest = {
      ...legacyRequest,
      structuredProposition: tuple(),
      samePropositionDeclaration: "same-proposition",
      sourceOwnershipProposal: knowledgeOwnedSource(),
    } satisfies EvaluateKnowledgeClaimRequest;
    expect(structuredRequest.samePropositionDeclaration).toBe(
      "same-proposition",
    );
  });

  it("keeps GetKnowledge identity-only and projection targeting exact", () => {
    expectTypeOf<
      keyof GetKnowledgeRequest
    >().toEqualTypeOf<"knowledgeIdentity">();
    expect(
      createKnowledgeProjectionTarget({
        knowledgeIdentity: "knowledge-1",
        expectedKnowledgeVersion: 2,
      }),
    ).toEqual({
      knowledgeIdentity: "knowledge-1",
      expectedKnowledgeVersion: 2,
    });
    expect(() =>
      createKnowledgeProjectionTarget({
        knowledgeIdentity: "knowledge-1",
        expectedKnowledgeVersion: 2,
        latest: true,
      }),
    ).toThrow();
  });

  it("closes currentness ownership prerequisite shapes", () => {
    const knowledgeOwned = createKnowledgeProjectionPreparationPrerequisites({
      candidatePreparationAssociation: "preparation-a",
      currentnessOwner: "knowledge-owned-currentness",
    });
    const externalOwned = createKnowledgeProjectionPreparationPrerequisites(
      externalPrerequisites(),
    );
    expect(knowledgeOwned).not.toHaveProperty(
      "externalCurrentnessCorrespondence",
    );
    expect(externalOwned.currentnessOwner).toBe("external-source-currentness");

    for (const invalid of [
      {
        candidatePreparationAssociation: "preparation-a",
        currentnessOwner: "external-source-currentness",
      },
      {
        candidatePreparationAssociation: "preparation-a",
        currentnessOwner: "knowledge-owned-currentness",
        externalCurrentnessCorrespondence: externalCurrentness(),
      },
    ]) {
      expect(() =>
        createKnowledgeProjectionPreparationPrerequisites(invalid),
      ).toThrow(InvalidKnowledgeProjectionPreparationPrerequisitesValueError);
    }
  });

  it.each(["positive", "negative", "unable-to-determine"] as const)(
    "constructs the closed %s Knowledge-owned currentness outcome",
    (outcome) => {
      const result = createKnowledgeOwnedSourceCurrentnessDetermination(
        knowledgeOwnedDetermination(outcome),
      );
      expect(result.outcome).toBe(outcome);
      expect(result.currentnessOwner).toBe("knowledge-owned-currentness");
      expect(result.knowledgeIdentity).toBe("knowledge-1");
      expect(result.knowledgeVersion).toBe(1);
      expect(result.propositionIdentity).toBe("proposition-1");
      expect(result.candidatePreparationAssociation).toBe("preparation-a");
      expect(result.semanticValue).toEqual(tuple());
      expect(Object.isFrozen(result)).toBe(true);
      expect(Object.isFrozen(result.semanticValue)).toBe(true);
      expect(result).not.toHaveProperty("acceptedAt");
      expect(result).not.toHaveProperty("freshness");
      expect(result).not.toHaveProperty("ttl");
    },
  );

  it("rejects malformed or open Knowledge-owned currentness outcomes", () => {
    for (const invalid of [
      { ...knowledgeOwnedDetermination(), outcome: "unknown" },
      { ...knowledgeOwnedDetermination(), currentnessOwner: "external" },
      { ...knowledgeOwnedDetermination(), knowledgeIdentity: "" },
      { ...knowledgeOwnedDetermination(), semanticValue: {} },
      { ...knowledgeOwnedDetermination(), extra: true },
    ]) {
      expect(() =>
        createKnowledgeOwnedSourceCurrentnessDetermination(invalid),
      ).toThrow(InvalidKnowledgeOwnedSourceCurrentnessDeterminationValueError);
    }
  });

  it("uses only closed Knowledge capability attribution", () => {
    const attribution = createKnowledgeCapabilityAttribution({
      authoritativeCapability: "knowledge",
    });
    expect(attribution).toEqual({ authoritativeCapability: "knowledge" });
    expect(Object.isFrozen(attribution)).toBe(true);
    for (const invalid of [
      "knowledge",
      "attribution-1",
      { authoritativeCapability: "source" },
      { authoritativeCapability: "knowledge", provenance: "private" },
    ]) {
      expect(() => createKnowledgeCapabilityAttribution(invalid)).toThrow(
        InvalidKnowledgeCapabilityAttributionValueError,
      );
    }
  });

  it("mechanically rejects cross-preparation replay", () => {
    expect(() =>
      createKnowledgeProjectionPreparationPrerequisites({
        ...externalPrerequisites("preparation-a"),
        externalCurrentnessCorrespondence: externalCurrentness("preparation-b"),
      }),
    ).toThrow(KnowledgeProjectionPreparationMismatchValueError);
  });

  it("constructs a closed projection request with separate target and prerequisites", () => {
    const request = createKnowledgeProjectionRequest({
      intent: "project-structured-knowledge",
      target: {
        knowledgeIdentity: "knowledge-1",
        expectedKnowledgeVersion: 1,
      },
      preparationPrerequisites: externalPrerequisites(),
    });
    expect(request.target).toEqual({
      knowledgeIdentity: "knowledge-1",
      expectedKnowledgeVersion: 1,
    });
    expect(request.target).not.toHaveProperty(
      "candidatePreparationAssociation",
    );
    expectTypeOf(request).toEqualTypeOf<KnowledgeProjectionRequest>();
    expect(() =>
      createKnowledgeProjectionRequest({
        ...request,
        latest: true,
      }),
    ).toThrow(InvalidKnowledgeProjectionRequestValueError);
  });

  it("constructs privacy-minimized deeply immutable projection candidates", () => {
    const projection = createStructuredKnowledgeProjectionCandidate(
      externalProjectionCandidateInput(),
    );
    expect(Object.isFrozen(projection)).toBe(true);
    expect(Object.isFrozen(projection.semanticValue)).toBe(true);
    expect(Object.isFrozen(projection.correspondence)).toBe(true);
    expect(projection.correspondence.attribution).toEqual({
      authoritativeCapability: "knowledge",
    });
    expect(projection.correspondence).not.toHaveProperty("issuance");
    expect(
      Object.isFrozen(
        projection.correspondence.sourceOwnershipCorrespondence
          .currentnessOwner === "external-source-currentness"
          ? projection.correspondence.externalCurrentnessCorrespondence
          : {},
      ),
    ).toBe(true);
    for (const prohibited of [
      "claim",
      "record",
      "provenance",
      "acceptanceEvidence",
      "storeMetadata",
    ]) {
      expect(projection).not.toHaveProperty(prohibited);
      expect(projection.semanticValue).not.toHaveProperty(prohibited);
      expect(projection.correspondence).not.toHaveProperty(prohibited);
    }
    expectTypeOf(
      projection,
    ).toEqualTypeOf<StructuredKnowledgeProjectionCandidate>();

    expect(() =>
      createStructuredKnowledgeProjectionCandidate({
        ...externalProjectionCandidateInput(),
        correspondence: {
          ...(externalProjectionCandidateInput().correspondence as Record<
            string,
            unknown
          >),
          attribution: "arbitrary-attribution",
        },
      }),
    ).toThrow();
    expect(() =>
      createStructuredKnowledgeProjectionCandidate({
        ...knowledgeProjectionCandidateInput(),
        correspondence: {
          ...(knowledgeProjectionCandidateInput().correspondence as Record<
            string,
            unknown
          >),
          knowledgeOwnedCurrentnessDetermination:
            knowledgeOwnedDetermination("negative"),
        },
      }),
    ).toThrow();
  });

  it("expresses one same-capture issuance and exact-object verification", () => {
    const candidate = createStructuredKnowledgeProjectionCandidate(
      knowledgeProjectionCandidateInput(),
    );
    const authority = authorityFixture();
    const projection = authority.captureStructuredKnowledgeProjectionAuthority({
      intent: "capture-knowledge-projection-authority",
      candidate,
    });
    const request = {
      intent: "verify-knowledge-projection-authority",
      candidate: projection,
    } satisfies VerifyStructuredKnowledgeProjectionAuthorityRequest;
    expectTypeOf<keyof typeof request>().toEqualTypeOf<
      "intent" | "candidate"
    >();
    expect(request).not.toHaveProperty("candidatePreparationAssociation");
    expect(
      authority.verifyStructuredKnowledgeProjectionAuthority(request),
    ).toBe(projection);
    expect(projection.semanticValue).toBe(candidate.semanticValue);
    expect(projection.correspondence.issuance).toBe(
      projection.correspondence.issuance,
    );
    expect(projection.correspondence.attribution).toEqual({
      authoritativeCapability: "knowledge",
    });
    expect(projection.correspondence.candidatePreparationAssociation).toBe(
      "preparation-a",
    );
    expect(projection.correspondence.propositionIdentity).toBe("proposition-1");
    expect(projection.correspondence.sourceOwnershipCorrespondence).toEqual(
      knowledgeOwnedSource(),
    );
    const currentness =
      projection.correspondence.knowledgeOwnedCurrentnessDetermination;
    expect(currentness).toBeDefined();
    if (currentness === undefined) throw new Error("missing currentness");
    expect(currentness.outcome).toBe("positive");
    expect(Object.isFrozen(projection)).toBe(true);
    expect(Object.isFrozen(projection.correspondence)).toBe(true);
    expect(Object.isFrozen(projection.correspondence.issuance)).toBe(true);

    const clone = Object.freeze({
      ...projection,
      correspondence: Object.freeze({ ...projection.correspondence }),
    });
    expect(clone).toEqual(projection);
    expect(clone).not.toBe(projection);
    expect(() =>
      authority.verifyStructuredKnowledgeProjectionAuthority({
        intent: "verify-knowledge-projection-authority",
        candidate: clone,
      }),
    ).toThrow("authority mismatch");
    expect(() =>
      authorityFixture().verifyStructuredKnowledgeProjectionAuthority(request),
    ).toThrow("authority mismatch");
  });

  it("validates all five external currentness correspondence facts", () => {
    const correspondence = createExternalSourceCurrentnessCorrespondence(
      externalCurrentness(),
    );
    expect(correspondence.determination).toBe("current");
    expect(Object.isFrozen(correspondence)).toBe(true);
    expect(() =>
      createExternalSourceCurrentnessCorrespondence({
        ...externalCurrentness(),
        determination: "unknown",
      }),
    ).toThrow();
  });
});
