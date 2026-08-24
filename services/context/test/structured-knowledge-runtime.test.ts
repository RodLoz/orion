import {
  anonymousCurrentIdentity,
  createKnowledgeReference,
  ContextValidationFailureError,
  InvalidContextInputError,
  KnowledgeProjectionIneligibleError,
  type ContextConstructionValues,
  type GetKnowledge,
  type ProjectStructuredKnowledge,
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
    return `structured.lineage.${this.#lineage}`;
  }

  public nextRevisionIdentity(): unknown {
    this.#revision += 1;
    return `structured.revision.${this.#revision}`;
  }

  public nextCreatedAt(): unknown {
    this.#time += 1;
    return new Date(Date.UTC(2026, 7, 18, 0, 0, this.#time)).toISOString();
  }
}

function running(
  candidate: {
    subjectKey: string;
    predicateKey: string;
    textualScalar: string;
  },
  hooks: {
    project?: ProjectStructuredKnowledge["projectStructuredKnowledge"];
    verify?: VerifyStructuredKnowledgeProjectionAuthority["verifyStructuredKnowledgeProjectionAuthority"];
  } = {},
  getKnowledgeOverride?: GetKnowledge,
) {
  const getKnowledge: GetKnowledge = {
    getKnowledge: () => ({
      knowledge: Object.freeze({}) as never,
      reference: createKnowledgeReference({
        knowledgeIdentity: "knowledge-1",
        version: 1,
        currency: "current",
      }),
    }),
  };
  let association: unknown;
  const projectStructuredKnowledge: ProjectStructuredKnowledge = {
    projectStructuredKnowledge:
      hooks.project ??
      ((request) => {
        association =
          request.preparationPrerequisites.candidatePreparationAssociation;
        return {
          semanticValue: candidate as never,
          correspondence: {
            candidatePreparationAssociation: association as never,
            propositionIdentity: "proposition-1" as never,
            knowledgeIdentity: "knowledge-1" as never,
            knowledgeVersion: 1 as never,
            validationState: "accepted",
            attribution: { authoritativeCapability: "knowledge" },
            sourceOwnershipCorrespondence: {
              currentnessOwner: "knowledge-owned-currentness",
            },
            knowledgeOwnedCurrentnessDetermination: {
              currentnessOwner: "knowledge-owned-currentness",
              outcome: "positive",
              knowledgeIdentity: "knowledge-1" as never,
              knowledgeVersion: 1 as never,
              propositionIdentity: "proposition-1" as never,
              semanticValue: candidate as never,
              candidatePreparationAssociation: association as never,
            },
            issuance: Object.freeze({}) as never,
          },
        } as never;
      }),
  };
  const verifier: VerifyStructuredKnowledgeProjectionAuthority = {
    verifyStructuredKnowledgeProjectionAuthority:
      hooks.verify ?? ((request) => request.candidate),
  };
  const structuredResolver = { ...projectStructuredKnowledge, ...verifier };
  const engine = new ContextEngine(
    new Values(),
    { resolveCurrentIdentity: () => anonymousCurrentIdentity() },
    getKnowledgeOverride ?? getKnowledge,
    undefined,
    structuredResolver,
  );
  engine.initialize();
  engine.start();
  return {
    engine,
    getKnowledge,
    projectStructuredKnowledge: structuredResolver,
    verifier,
  };
}

const request = (subjectKey = "subject", predicateKey = "predicate") => ({
  target: { kind: "new-lineage" },
  identityResolutionRequest: {},
  contextPreparationSemanticScope: { subjectKey, predicateKey },
  knowledgeRetrievalRequest: { knowledgeIdentity: "knowledge-1" },
});

describe("Context structured Profile B runtime", () => {
  it("projects, verifies, evaluates S2, and incorporates one matching candidate", () => {
    const { engine } = running({
      subjectKey: "subject",
      predicateKey: "predicate",
      textualScalar: "value",
    });

    const revision =
      engine.prepareContextRevisionWithStructuredKnowledge(request());

    expect(revision.fragments.map(({ kind }) => kind)).toEqual([
      "identity",
      "structured-knowledge",
    ]);
    expect(revision.fragments[1]).toMatchObject({
      kind: "structured-knowledge",
      projection: { semanticValue: { textualScalar: "value" } },
    });
    const active = engine.getActiveContextRevision({
      lineageIdentity: revision.lineageIdentity,
    });
    expect(
      engine.verifyActiveContextRevisionAuthority({
        intent: "verify-active-context-revision-authority",
        candidate: active,
        expectedLineageIdentity: active.lineageIdentity,
        expectedRevisionIdentity: active.revisionIdentity,
        expectedRevisionNumber: active.revisionNumber,
      }),
    ).toBe(active);
  });

  it.each([
    ["subject", "other"],
    ["other", "predicate"],
  ])(
    "returns a distinct no-applicable consequence without creating a lineage",
    (subject, predicate) => {
      const { engine } = running({
        subjectKey: "subject",
        predicateKey: "predicate",
        textualScalar: "value",
      });

      let thrown: unknown;
      try {
        engine.prepareContextRevisionWithStructuredKnowledge(
          request(subject, predicate),
        );
      } catch (error: unknown) {
        thrown = error;
      }
      expect(thrown).toBeInstanceOf(
        NoApplicableStructuredKnowledgeCandidateError,
      );
      expect(thrown).not.toBeInstanceOf(ContextValidationFailureError);
      expect(() =>
        engine.getActiveContextRevision({
          lineageIdentity: "structured.lineage.1",
        }),
      ).toThrow();
    },
  );

  it("keeps scope out of the Knowledge projection request and propagates one association", () => {
    let received: Record<string, unknown> | undefined;
    const candidate = {
      subjectKey: "subject",
      predicateKey: "predicate",
      textualScalar: "value",
    };
    const base = running(candidate);
    const projector = vi.spyOn(
      base.projectStructuredKnowledge,
      "projectStructuredKnowledge",
    );
    projector.mockImplementation((projectionRequest) => {
      received = projectionRequest as never;
      return {
        semanticValue: candidate as never,
        correspondence: {
          candidatePreparationAssociation:
            projectionRequest.preparationPrerequisites
              .candidatePreparationAssociation,
          propositionIdentity: "proposition-1" as never,
          knowledgeIdentity: "knowledge-1" as never,
          knowledgeVersion: 1 as never,
          validationState: "accepted",
          attribution: { authoritativeCapability: "knowledge" },
          sourceOwnershipCorrespondence: {
            currentnessOwner: "knowledge-owned-currentness",
          },
          knowledgeOwnedCurrentnessDetermination: {
            currentnessOwner: "knowledge-owned-currentness",
            outcome: "positive",
            knowledgeIdentity: "knowledge-1" as never,
            knowledgeVersion: 1 as never,
            propositionIdentity: "proposition-1" as never,
            semanticValue: candidate as never,
            candidatePreparationAssociation:
              projectionRequest.preparationPrerequisites
                .candidatePreparationAssociation,
          },
          issuance: Object.freeze({}) as never,
        },
      } as never;
    });

    base.engine.prepareContextRevisionWithStructuredKnowledge(request());
    expect(received).toBeDefined();
    expect(received).not.toHaveProperty("contextPreparationSemanticScope");
    expect(received?.preparationPrerequisites).not.toHaveProperty("subjectKey");
  });

  it("creates a fresh association for each preparation while preserving stable reuse", () => {
    const base = running({
      subjectKey: "subject",
      predicateKey: "predicate",
      textualScalar: "value",
    });
    const associations: unknown[] = [];
    vi.spyOn(
      base.projectStructuredKnowledge,
      "projectStructuredKnowledge",
    ).mockImplementation((projectionRequest) => {
      associations.push(
        projectionRequest.preparationPrerequisites
          .candidatePreparationAssociation,
      );
      return {
        semanticValue: {
          subjectKey: "subject",
          predicateKey: "predicate",
          textualScalar: "value",
        } as never,
        correspondence: {
          candidatePreparationAssociation:
            projectionRequest.preparationPrerequisites
              .candidatePreparationAssociation,
          propositionIdentity: "proposition-1" as never,
          knowledgeIdentity: "knowledge-1" as never,
          knowledgeVersion: 1 as never,
          validationState: "accepted",
          attribution: { authoritativeCapability: "knowledge" },
          sourceOwnershipCorrespondence: {
            currentnessOwner: "knowledge-owned-currentness",
          },
          issuance: Object.freeze({}) as never,
        },
      } as never;
    });
    const first =
      base.engine.prepareContextRevisionWithStructuredKnowledge(request());
    const repeated = base.engine.prepareContextRevisionWithStructuredKnowledge({
      ...request(),
      target: {
        kind: "existing-lineage",
        lineageIdentity: first.lineageIdentity,
        expectedActiveRevisionIdentity: first.revisionIdentity,
      },
    });

    expect(associations).toHaveLength(2);
    expect(associations[0]).not.toBe(associations[1]);
    expect(repeated).toBe(first);
  });

  it("blocks applicability when Knowledge projection authority verification fails", () => {
    const failure = new Error("verification failed");
    const { engine } = running(
      {
        subjectKey: "subject",
        predicateKey: "predicate",
        textualScalar: "value",
      },
      {
        verify: () => {
          throw failure;
        },
      },
    );
    expect(() =>
      engine.prepareContextRevisionWithStructuredKnowledge(request()),
    ).toThrow(failure);
  });

  it("preserves Knowledge-owned negative currentness", () => {
    const failure = new KnowledgeProjectionIneligibleError();
    const { engine } = running(
      {
        subjectKey: "subject",
        predicateKey: "predicate",
        textualScalar: "value",
      },
      {
        project: () => {
          throw failure;
        },
      },
    );
    expect(() =>
      engine.prepareContextRevisionWithStructuredKnowledge(request()),
    ).toThrow(failure);
    expect(failure).not.toBeInstanceOf(ContextValidationFailureError);
    expect(failure).not.toBeInstanceOf(
      NoApplicableStructuredKnowledgeCandidateError,
    );
  });

  it("preserves Knowledge-owned unable-to-determine currentness", () => {
    const failure = new Error(
      "Knowledge could not determine Source Currentness for the preparation.",
    );
    failure.name = "KnowledgeSourceCurrentnessUnableToDetermineError";
    const { engine } = running(
      {
        subjectKey: "subject",
        predicateKey: "predicate",
        textualScalar: "value",
      },
      {
        project: () => {
          throw failure;
        },
      },
    );
    expect(() =>
      engine.prepareContextRevisionWithStructuredKnowledge(request()),
    ).toThrow(failure);
    expect(failure.name).toBe(
      "KnowledgeSourceCurrentnessUnableToDetermineError",
    );
    expect(failure).not.toBeInstanceOf(ContextValidationFailureError);
    expect(failure).not.toBeInstanceOf(
      NoApplicableStructuredKnowledgeCandidateError,
    );
  });

  it("rejects missing or malformed scope before candidate work", () => {
    const getKnowledge = vi.fn(() => {
      throw new Error("candidate work must not begin");
    });
    const { engine } = running(
      {
        subjectKey: "subject",
        predicateKey: "predicate",
        textualScalar: "value",
      },
      {},
      { getKnowledge },
    );
    expect(() =>
      engine.prepareContextRevisionWithStructuredKnowledge({
        ...request(),
        contextPreparationSemanticScope: { subjectKey: " " },
      }),
    ).toThrow(InvalidContextInputError);
    expect(getKnowledge).not.toHaveBeenCalled();
  });
});
