import {
  type KnowledgeConstructionValues,
  type ProjectStructuredKnowledge,
  type VerifyStructuredKnowledgeProjectionAuthority,
} from "@orion/core";
import { KnowledgeEngine } from "@orion/knowledge";
import { describe, expect, it } from "vitest";

import {
  composeIdentityCapability,
  composeKnowledgeAwareContextCapability,
  composeKnowledgeCapability,
  composeStructuredKnowledgeAwareContextCapability,
  InMemoryKnowledgeStore,
  composeReasoningCapability,
} from "../src/index.js";

class StructuredKnowledgeConstruction implements KnowledgeConstructionValues {
  #knowledge = 0;
  #proposition = 0;

  public nextKnowledgeIdentity(): unknown {
    this.#knowledge += 1;
    return `orion.knowledge.integration.${this.#knowledge}`;
  }

  public nextAcceptedAt(): unknown {
    return "2026-08-18T00:00:00.000Z";
  }

  public nextPropositionIdentity() {
    this.#proposition += 1;
    return `orion.proposition.integration.${this.#proposition}` as never;
  }
}

async function structuredRuntime() {
  const identity = composeIdentityCapability();
  const knowledgeEngine = new KnowledgeEngine(
    new InMemoryKnowledgeStore(),
    new StructuredKnowledgeConstruction(),
  );
  await knowledgeEngine.initialize();
  knowledgeEngine.start();
  const accepted = await knowledgeEngine.evaluateKnowledgeClaim({
    intent: "evaluate",
    claim: "A structured integration claim.",
    structuredProposition: {
      subjectKey: "subject",
      predicateKey: "predicate",
      textualScalar: "value",
    },
    samePropositionDeclaration: "same-proposition",
    sourceOwnershipProposal: {
      currentnessOwner: "knowledge-owned-currentness",
    },
    acceptanceEvidence: {
      method: "explicit-authority-review",
      authorityIdentifier: "orion.knowledge.integration",
      decision: "accept",
      reason: "The structured candidate was explicitly reviewed.",
    },
    provenance: {
      sourceType: "approved-internal-source",
      originatingCapability: "bootstrap-integration-test",
      observedAt: "2026-08-18T00:00:00.000Z",
    },
  });
  if (accepted.outcome !== "accepted") throw new Error();

  let projectionRequest: unknown;
  let verifiedProjection: unknown;
  const projectionCapability: ProjectStructuredKnowledge &
    VerifyStructuredKnowledgeProjectionAuthority = {
    projectStructuredKnowledge(request) {
      projectionRequest = request;
      return knowledgeEngine.projectStructuredKnowledge(request);
    },
    verifyStructuredKnowledgeProjectionAuthority(request) {
      verifiedProjection = request.candidate;
      return knowledgeEngine.verifyStructuredKnowledgeProjectionAuthority(
        request,
      );
    },
  };
  const context = composeStructuredKnowledgeAwareContextCapability(
    identity.resolveCurrentIdentity,
    knowledgeEngine,
    projectionCapability,
  );

  return {
    accepted,
    context,
    knowledgeEngine,
    projectionCapability,
    get projectionRequest() {
      return projectionRequest;
    },
    get verifiedProjection() {
      return verifiedProjection;
    },
  };
}

function structuredPreparation(
  runtime: Awaited<ReturnType<typeof structuredRuntime>>,
  subjectKey = "subject",
  predicateKey = "predicate",
) {
  return runtime.context.prepareContextRevisionWithStructuredKnowledge.prepareContextRevisionWithStructuredKnowledge(
    {
      target: { kind: "new-lineage" },
      identityResolutionRequest: {},
      contextPreparationSemanticScope: { subjectKey, predicateKey } as never,
      knowledgeRetrievalRequest: {
        knowledgeIdentity: runtime.accepted.record.knowledgeIdentity,
      },
    },
  );
}

describe("Context and Knowledge composition", () => {
  it("wires lifecycle-ready Knowledge behind Context-owned preparation", async () => {
    const identity = composeIdentityCapability();
    const knowledge = await composeKnowledgeCapability();
    const accepted =
      await knowledge.evaluateKnowledgeClaim.evaluateKnowledgeClaim({
        intent: "evaluate",
        claim: "A deterministic accepted claim for Context preparation.",
        acceptanceEvidence: {
          method: "explicit-authority-review",
          authorityIdentifier: "orion.knowledge.authority",
          decision: "accept",
          reason: "Establish same-runtime accepted Knowledge.",
        },
        provenance: {
          sourceType: "approved-internal-source",
          originatingCapability: "bootstrap-test",
          observedAt: "2026-08-11T00:00:00.000Z",
        },
      });
    if (accepted.outcome !== "accepted") throw new Error();
    const context = composeKnowledgeAwareContextCapability(
      identity.resolveCurrentIdentity,
      knowledge.getKnowledge,
    );

    const revision =
      context.prepareContextRevisionWithKnowledge.prepareContextRevisionWithKnowledge(
        {
          target: { kind: "new-lineage" },
          identityResolutionRequest: {},
          knowledgeRetrievalRequest: {
            knowledgeIdentity: accepted.record.knowledgeIdentity,
          },
        },
      );

    expect(revision.fragments.map(({ kind }) => kind)).toEqual([
      "identity",
      "knowledge",
    ]);
    const knowledgeFragment = revision.fragments[1];
    if (knowledgeFragment === undefined) throw new Error();
    expect(knowledgeFragment.projection).toMatchObject({
      knowledgeIdentity: accepted.record.knowledgeIdentity,
      version: accepted.record.version,
      currency: "current",
      authoritativeOwner: "knowledge",
    });
    expect(
      context.getActiveContextRevision.getActiveContextRevision({
        lineageIdentity: revision.lineageIdentity,
      }),
    ).toBe(revision);
    expect(
      context.verifyActiveContextRevisionAuthority.verifyActiveContextRevisionAuthority(
        {
          intent: "verify-active-context-revision-authority",
          candidate: revision,
          expectedLineageIdentity: revision.lineageIdentity,
          expectedRevisionIdentity: revision.revisionIdentity,
          expectedRevisionNumber: revision.revisionNumber,
        },
      ),
    ).toBe(revision);

    const reasoning = composeReasoningCapability();
    const outcome = reasoning.evaluateReasoning.evaluateReasoning({
      intent: "evaluate",
      activeContextRevision: revision,
      query: "Evaluate the authoritative Knowledge-aware Context.",
    });
    expect(outcome.category).toBe("anonymous-context");
    expect(outcome.explainability.contextConsumptionReference).toMatchObject({
      lineageIdentity: revision.lineageIdentity,
      revisionIdentity: revision.revisionIdentity,
      revisionNumber: revision.revisionNumber,
      authoritativeCapability: "context",
    });
    await knowledge.shutdown();
  });

  it("conforms the real structured Knowledge projection through Context", async () => {
    const runtime = await structuredRuntime();
    const revision = structuredPreparation(runtime);
    const request = runtime.projectionRequest as {
      target: {
        knowledgeIdentity: unknown;
        expectedKnowledgeVersion: unknown;
      };
      preparationPrerequisites: {
        candidatePreparationAssociation: unknown;
      };
    };
    const projection = runtime.verifiedProjection as {
      semanticValue: Record<string, unknown>;
      correspondence: Record<string, unknown>;
    };

    expect(request.target).toEqual({
      knowledgeIdentity: runtime.accepted.record.knowledgeIdentity,
      expectedKnowledgeVersion: runtime.accepted.record.version,
    });
    expect(request).not.toHaveProperty("contextPreparationSemanticScope");
    expect(request.preparationPrerequisites).not.toHaveProperty("subjectKey");
    expect(projection.correspondence.candidatePreparationAssociation).toBe(
      request.preparationPrerequisites.candidatePreparationAssociation,
    );
    expect(projection.correspondence.attribution).toEqual({
      authoritativeCapability: "knowledge",
    });

    expect(revision.fragments.map(({ kind }) => kind)).toEqual([
      "identity",
      "structured-knowledge",
    ]);
    const fragment = revision.fragments[1];
    if (fragment === undefined || fragment.kind !== "structured-knowledge") {
      throw new Error("structured fragment missing");
    }
    expect(fragment.projection.semanticValue).toEqual({
      subjectKey: "subject",
      predicateKey: "predicate",
      textualScalar: "value",
    });
    expect(fragment.projection.propositionIdentity).toBe(
      runtime.accepted.record.acceptedStructuredProposition
        ?.propositionIdentity,
    );
    expect(fragment.projection.attribution).toEqual({
      authoritativeCapability: "knowledge",
    });
    expect(revision).not.toHaveProperty("contextPreparationSemanticScope");
    expect(JSON.stringify(revision)).not.toContain(
      "candidatePreparationAssociation",
    );
    expect(JSON.stringify(revision)).not.toContain("acceptanceEvidence");
    expect(
      runtime.context.getActiveContextRevision.getActiveContextRevision({
        lineageIdentity: revision.lineageIdentity,
      }),
    ).toBe(revision);
    expect(
      runtime.context.verifyActiveContextRevisionAuthority.verifyActiveContextRevisionAuthority(
        {
          intent: "verify-active-context-revision-authority",
          candidate: revision,
          expectedLineageIdentity: revision.lineageIdentity,
          expectedRevisionIdentity: revision.revisionIdentity,
          expectedRevisionNumber: revision.revisionNumber,
        },
      ),
    ).toBe(revision);

    const firstAssociation =
      request.preparationPrerequisites.candidatePreparationAssociation;
    const secondRevision = structuredPreparation(runtime);
    const secondRequest = runtime.projectionRequest as {
      preparationPrerequisites: {
        candidatePreparationAssociation: unknown;
      };
    };
    expect(
      secondRequest.preparationPrerequisites.candidatePreparationAssociation,
    ).not.toBe(firstAssociation);
    expect(secondRevision.revisionIdentity).not.toBe(revision.revisionIdentity);
    await runtime.knowledgeEngine.stop();
  });

  it.each([
    ["other", "predicate"],
    ["subject", "other"],
  ])(
    "keeps real Knowledge success independent from Context S2 mismatch (%s, %s)",
    async (subjectKey, predicateKey) => {
      const runtime = await structuredRuntime();

      expect(() =>
        structuredPreparation(runtime, subjectKey, predicateKey),
      ).toThrow("No applicable structured Knowledge candidate is available.");
      expect(() =>
        runtime.context.getActiveContextRevision.getActiveContextRevision({
          lineageIdentity: "orion.context.lineage.1",
        }),
      ).toThrow();
      await runtime.knowledgeEngine.stop();
    },
  );
});
