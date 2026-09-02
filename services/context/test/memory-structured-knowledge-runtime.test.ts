import {
  KnowledgeProjectionPreparationMismatchError,
  MemorySourceAuthorityVerificationFailureError,
  MemorySourceCurrentnessUnableToDetermineError,
  anonymousCurrentIdentity,
  createKnowledgeReference,
  createMemoryKnowledgeSourceBinding,
  createMemoryReference,
  createMemorySourceAttribution,
  createMemorySourcePropositionTuple,
  createMemorySourceRelationship,
  createPositiveMemorySourceCurrentnessCorrespondence,
  memorySourceIssuerVerificationCorrespondence,
  memorySourceRelationshipIdentity,
  type BindMemorySourceRelationshipToPreparation,
  type ContextConstructionValues,
  type GetKnowledge,
  type MemoryKnowledgeSourceBinding,
  type MemoryExternalSourceProjectionPrerequisites,
  type MemorySourceCurrentnessRequest,
  type ProjectStructuredKnowledge,
  type StructuredKnowledgeProjection,
  type VerifyMemorySourceAuthority,
  type VerifyStructuredKnowledgeProjectionAuthority,
} from "@orion/core";
import { describe, expect, it, vi } from "vitest";

import {
  ContextEngine,
  NoApplicableStructuredKnowledgeCandidateError,
} from "../src/index.js";

class Values implements ContextConstructionValues {
  #lineage = 0;
  #revision = 0;
  #time = 0;

  public nextLineageIdentity(): unknown {
    this.#lineage += 1;
    return `memory-context-lineage-${this.#lineage}`;
  }

  public nextRevisionIdentity(): unknown {
    this.#revision += 1;
    return `memory-context-preparation-${this.#revision}`;
  }

  public nextCreatedAt(): unknown {
    this.#time += 1;
    return `2026-09-01T00:00:0${this.#time}.000Z`;
  }
}

function relationship() {
  return createMemorySourceRelationship({
    sourceAttribution: createMemorySourceAttribution({
      authoritativeCapability: "memory",
    }),
    memoryReference: createMemoryReference("memory-context-source"),
    semanticValue: createMemorySourcePropositionTuple({
      subjectKey: "subject",
      predicateKey: "predicate",
      textualScalar: "value",
    }),
    relationshipIdentity: memorySourceRelationshipIdentity(
      "memory-context-relationship",
    ),
  });
}

function binding(sourceRelationship = relationship()) {
  return createMemoryKnowledgeSourceBinding({
    kind: "memory-source-relationship",
    relationship: sourceRelationship,
  });
}

function request(memorySourceBinding?: MemoryKnowledgeSourceBinding) {
  return {
    target: { kind: "new-lineage" },
    identityResolutionRequest: {},
    contextPreparationSemanticScope: {
      subjectKey: "subject",
      predicateKey: "predicate",
    },
    knowledgeRetrievalRequest: { knowledgeIdentity: "knowledge-memory-1" },
    ...(memorySourceBinding === undefined ? {} : { memorySourceBinding }),
  } as const;
}

function projection(
  association: string,
  sourceRelationship = relationship(),
): StructuredKnowledgeProjection {
  return {
    semanticValue: sourceRelationship.semanticValue,
    correspondence: {
      candidatePreparationAssociation: association as never,
      propositionIdentity: "knowledge-proposition-1" as never,
      knowledgeIdentity: "knowledge-memory-1" as never,
      knowledgeVersion: 1 as never,
      validationState: "accepted",
      attribution: { authoritativeCapability: "knowledge" },
      sourceOwnershipCorrespondence: {
        currentnessOwner: "external-source-currentness",
        applicableOwner: "memory" as never,
        propositionSourceRelationship:
          sourceRelationship.relationshipIdentity as never,
      },
      externalCurrentnessCorrespondence: {
        applicableOwner: "memory" as never,
        candidatePreparationAssociation: association as never,
        propositionSourceRelationship:
          sourceRelationship.relationshipIdentity as never,
        determination: "current",
        issuerVerification: "memory-verification" as never,
      },
      underlyingSourceAuthority: "memory-verification" as never,
      issuance: Object.freeze({}) as never,
    },
  } as unknown as StructuredKnowledgeProjection;
}

function setup(
  sourceBinding: MemoryKnowledgeSourceBinding,
  options: {
    verifyMemory?: VerifyMemorySourceAuthority["verifyMemorySourceAuthority"];
    project?: ProjectStructuredKnowledge["projectStructuredKnowledge"];
  } = {},
) {
  const bind = vi.fn(
    (
      input: Parameters<
        BindMemorySourceRelationshipToPreparation["bindMemorySourceRelationshipToPreparation"]
      >[0],
    ) =>
      Object.freeze({
        relationship: input.relationship,
        candidatePreparationAssociation: input.candidatePreparationAssociation,
      }),
  );
  const defaultVerify: VerifyMemorySourceAuthority["verifyMemorySourceAuthority"] =
    (input) =>
      Object.freeze({
        determination: "POSITIVE",
        correspondence: createPositiveMemorySourceCurrentnessCorrespondence({
          sourceAttribution:
            input.currentnessRequest.relationship.sourceAttribution,
          relationshipIdentity:
            input.currentnessRequest.relationship.relationshipIdentity,
          candidatePreparationAssociation:
            input.currentnessRequest.candidatePreparationAssociation,
          determination: "POSITIVE",
          issuerVerification: memorySourceIssuerVerificationCorrespondence(
            "memory-verification",
          ),
        }),
      });
  const verify = vi.fn(options.verifyMemory ?? defaultVerify);
  const project = vi.fn(
    options.project ??
      ((input) =>
        projection(
          input.preparationPrerequisites.candidatePreparationAssociation,
          sourceBinding.relationship,
        )),
  );
  const verifyProjection = vi.fn(
    (
      input: Parameters<
        VerifyStructuredKnowledgeProjectionAuthority["verifyStructuredKnowledgeProjectionAuthority"]
      >[0],
    ) => input.candidate,
  );
  const getKnowledge: GetKnowledge = {
    getKnowledge: () => ({
      knowledge: Object.freeze({}) as never,
      reference: createKnowledgeReference({
        knowledgeIdentity: "knowledge-memory-1",
        version: 1,
        currency: "current",
      }),
    }),
  };
  const memoryAuthority: BindMemorySourceRelationshipToPreparation &
    VerifyMemorySourceAuthority = {
    bindMemorySourceRelationshipToPreparation: bind,
    verifyMemorySourceAuthority: verify,
  };
  const knowledgeAuthority: ProjectStructuredKnowledge &
    VerifyStructuredKnowledgeProjectionAuthority = {
    projectStructuredKnowledge: project,
    verifyStructuredKnowledgeProjectionAuthority: verifyProjection,
  };
  const engine = new ContextEngine(
    new Values(),
    { resolveCurrentIdentity: () => anonymousCurrentIdentity() },
    getKnowledge,
    undefined,
    knowledgeAuthority,
    memoryAuthority,
  );
  engine.initialize();
  engine.start();
  return { engine, bind, verify, project, verifyProjection };
}

describe("Context Memory-backed structured Knowledge orchestration", () => {
  it("preserves exact objects through POSITIVE verification and incorporates one candidate", () => {
    const sourceRelationship = relationship();
    const sourceBinding = binding(sourceRelationship);
    const subject = setup(sourceBinding);

    const revision =
      subject.engine.prepareContextRevisionWithStructuredKnowledge(
        request(sourceBinding),
      );

    expect(subject.bind).toHaveBeenCalledTimes(1);
    const bindRequest = subject.bind.mock.calls[0]?.[0];
    expect(bindRequest?.relationship).toBe(sourceRelationship);
    const association = bindRequest?.candidatePreparationAssociation;
    expect(association).toBe("memory-context-preparation-1");
    const currentnessRequest = subject.bind.mock.results[0]?.value as
      MemorySourceCurrentnessRequest | undefined;
    expect(subject.verify.mock.calls[0]?.[0].currentnessRequest).toBe(
      currentnessRequest,
    );

    const projectionRequest = subject.project.mock.calls[0]?.[0];
    const prerequisites = projectionRequest?.preparationPrerequisites as
      MemoryExternalSourceProjectionPrerequisites | undefined;
    expect(prerequisites?.currentnessOwner).toBe("external-source-currentness");
    if (prerequisites?.externalSourceKind !== "memory") throw new Error();
    expect(prerequisites.memorySourceBinding).toBe(sourceBinding);
    expect(prerequisites.memorySourceBinding.relationship).toBe(
      sourceRelationship,
    );
    expect(prerequisites.candidatePreparationAssociation).toBe(association);
    expect(
      prerequisites.externalCurrentnessCorrespondence
        .candidatePreparationAssociation,
    ).toBe(association);
    expect(subject.verifyProjection).toHaveBeenCalledTimes(1);

    expect(revision.fragments.map(({ kind }) => kind)).toEqual([
      "identity",
      "structured-knowledge",
    ]);
    expect(Object.isFrozen(revision)).toBe(true);
    expect(Object.isFrozen(revision.fragments)).toBe(true);
    expect(revision.fragments).toHaveLength(2);
    for (const prohibited of [
      "memorySourceBinding",
      "authorityToken",
      "captureIdentifier",
      "storeMetadata",
      "credentials",
      "confidence",
      "ranking",
      "traces",
    ]) {
      expect(revision).not.toHaveProperty(prohibited);
      expect(revision.fragments[1]).not.toHaveProperty(prohibited);
    }
  });

  it("maps Memory NEGATIVE to the existing no-candidate consequence", () => {
    const sourceBinding = binding();
    const subject = setup(sourceBinding, {
      verifyMemory: () => Object.freeze({ determination: "NEGATIVE" }),
    });

    expect(() =>
      subject.engine.prepareContextRevisionWithStructuredKnowledge(
        request(sourceBinding),
      ),
    ).toThrow(NoApplicableStructuredKnowledgeCandidateError);
    expect(subject.project).not.toHaveBeenCalled();
    expect(subject.verifyProjection).not.toHaveBeenCalled();
    expect(() =>
      subject.engine.getActiveContextRevision({
        lineageIdentity: "memory-context-lineage-1",
      }),
    ).toThrow();
  });

  it.each([
    new MemorySourceCurrentnessUnableToDetermineError(),
    new MemorySourceAuthorityVerificationFailureError(),
  ])("propagates originating Memory failure %s unchanged", (failure) => {
    const sourceBinding = binding();
    const subject = setup(sourceBinding, {
      verifyMemory: () => {
        throw failure;
      },
    });

    let observed: unknown;
    try {
      subject.engine.prepareContextRevisionWithStructuredKnowledge(
        request(sourceBinding),
      );
    } catch (error: unknown) {
      observed = error;
    }
    expect(observed).toBe(failure);
    expect(subject.project).not.toHaveBeenCalled();
    expect(subject.verifyProjection).not.toHaveBeenCalled();
  });

  it("preserves substitution and replay failures from the Knowledge boundary", () => {
    const acceptedRelationship = relationship();
    const acceptedBinding = binding(acceptedRelationship);
    const replacementBinding = binding(relationship());
    const failure = new KnowledgeProjectionPreparationMismatchError();
    const subject = setup(acceptedBinding, {
      project: (input) => {
        const prerequisites =
          input.preparationPrerequisites as MemoryExternalSourceProjectionPrerequisites;
        if (
          prerequisites.externalSourceKind !== "memory" ||
          prerequisites.memorySourceBinding.relationship !==
            acceptedRelationship ||
          prerequisites.externalCurrentnessCorrespondence
            .candidatePreparationAssociation !==
            prerequisites.candidatePreparationAssociation
        ) {
          throw failure;
        }
        return projection(
          prerequisites.candidatePreparationAssociation,
          acceptedRelationship,
        );
      },
    });

    let observed: unknown;
    try {
      subject.engine.prepareContextRevisionWithStructuredKnowledge(
        request(replacementBinding),
      );
    } catch (error: unknown) {
      observed = error;
    }
    expect(observed).toBe(failure);
    expect(subject.verifyProjection).not.toHaveBeenCalled();
  });
});
