import {
  type KnowledgeConstructionValues,
  type ProjectStructuredKnowledge,
  type VerifyStructuredKnowledgeProjectionAuthority,
  type ReasoningOutcome,
} from "@orion/core";
import { KnowledgeEngine } from "@orion/knowledge";
import { describe, expect, it } from "vitest";
import {
  InMemoryKnowledgeStore,
  composeIdentityCapability,
  composePlanningCapability,
  composeReasoningCapability,
  composeStructuredKnowledgeAwareContextCapability,
} from "../src/index.js";

class Construction implements KnowledgeConstructionValues {
  #knowledge = 0;
  #proposition = 0;
  public nextKnowledgeIdentity(): string {
    return `orion.knowledge.integration.${++this.#knowledge}`;
  }
  public nextAcceptedAt(): string {
    return "2026-08-19T00:00:00.000Z";
  }
  public nextPropositionIdentity() {
    return `orion.proposition.integration.${++this.#proposition}` as never;
  }
}

async function createRuntime() {
  const identity = composeIdentityCapability();
  const knowledge = new KnowledgeEngine(
    new InMemoryKnowledgeStore(),
    new Construction(),
  );
  await knowledge.initialize();
  knowledge.start();
  const accepted = await knowledge.evaluateKnowledgeClaim({
    intent: "evaluate",
    claim: "A real structured integration claim.",
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
      observedAt: "2026-08-19T00:00:00.000Z",
    },
  });
  if (accepted.outcome !== "accepted") throw new Error();
  const projectionCapability: ProjectStructuredKnowledge &
    VerifyStructuredKnowledgeProjectionAuthority = {
    projectStructuredKnowledge: (request) =>
      knowledge.projectStructuredKnowledge(request),
    verifyStructuredKnowledgeProjectionAuthority: (request) =>
      knowledge.verifyStructuredKnowledgeProjectionAuthority(request),
  };
  const context = composeStructuredKnowledgeAwareContextCapability(
    identity.resolveCurrentIdentity,
    knowledge,
    projectionCapability,
  );
  const preparedRevision =
    context.prepareContextRevisionWithStructuredKnowledge.prepareContextRevisionWithStructuredKnowledge(
      {
        target: { kind: "new-lineage" },
        identityResolutionRequest: {
          resolutionReference: identity.demonstrationResolutionReference,
        },
        contextPreparationSemanticScope: {
          subjectKey: "subject",
          predicateKey: "predicate",
        } as never,
        knowledgeRetrievalRequest: {
          knowledgeIdentity: accepted.record.knowledgeIdentity,
        },
      },
    );
  const revision = context.getActiveContextRevision.getActiveContextRevision({
    lineageIdentity: preparedRevision.lineageIdentity,
  });
  const reasoning = composeReasoningCapability({
    verifyActiveContextRevisionAuthority:
      context.verifyActiveContextRevisionAuthority.verifyActiveContextRevisionAuthority.bind(
        context.verifyActiveContextRevisionAuthority,
      ),
  });
  const planning = composePlanningCapability();
  return { context, revision, reasoning, planning, knowledge };
}

function plan(
  runtime: Awaited<ReturnType<typeof createRuntime>>,
  outcome: ReasoningOutcome,
) {
  const candidate = runtime.planning.createCandidatePlan.createCandidatePlan({
    intent: "create-candidate-plan",
    reasoningOutcome: outcome,
  });
  expect(
    runtime.planning.verifyCandidatePlanAuthority.verifyCandidatePlanAuthority({
      intent: "verify-candidate-plan-authority",
      candidate,
      consumedReasoningOutcome: outcome,
      expectedReasoningStatus: candidate.source.reasoningStatus,
      expectedReasoningCategory: candidate.source.reasoningCategory,
      expectedCandidateNextAction: candidate.source.candidateNextAction,
      expectedIdentityState: candidate.source.identityState,
      expectedReasoningRuleCategory: candidate.source.reasoningRuleCategory,
    }),
  ).toBe(candidate);
  return candidate;
}

describe("real Reasoning 3 to Planning conformance", () => {
  it("verifies authoritative Context, Reasoning Outcome, and grounded Plan", async () => {
    const runtime = await createRuntime();
    const outcome = runtime.reasoning.evaluateReasoning3.evaluateReasoning3({
      intent: "evaluate",
      activeContextRevision: runtime.revision,
      query: {
        kind: "exact-text-attribute-value",
        subjectKey: "subject",
        predicateKey: "predicate",
      },
    });
    expect(outcome.category).toBe("knowledge-grounded-success");
    expect(plan(runtime, outcome).category).toBe("respond");
    await runtime.knowledge.stop();
  });

  it("maps a verified semantic mismatch to request-more-context", async () => {
    const runtime = await createRuntime();
    const outcome = runtime.reasoning.evaluateReasoning3.evaluateReasoning3({
      intent: "evaluate",
      activeContextRevision: runtime.revision,
      query: {
        kind: "exact-text-attribute-value",
        subjectKey: "other",
        predicateKey: "predicate",
      },
    });
    expect(outcome.category).toBe("knowledge-not-applicable");
    expect(plan(runtime, outcome).category).toBe("request-more-context");
    await runtime.knowledge.stop();
  });

  it("rejects a reconstructed Context before Reasoning evaluation", async () => {
    const runtime = await createRuntime();
    const clone = structuredClone(runtime.revision);
    expect(() =>
      runtime.reasoning.evaluateReasoning3.evaluateReasoning3({
        intent: "evaluate",
        activeContextRevision: clone,
        query: {
          kind: "exact-text-attribute-value",
          subjectKey: "subject",
          predicateKey: "predicate",
        },
      }),
    ).toThrow();
    await runtime.knowledge.stop();
  });

  it("rejects a revision issued by a foreign Context authority", async () => {
    const runtime = await createRuntime();
    const foreign = await createRuntime();
    expect(() =>
      runtime.reasoning.evaluateReasoning3.evaluateReasoning3({
        intent: "evaluate",
        activeContextRevision: foreign.revision,
        query: {
          kind: "exact-text-attribute-value",
          subjectKey: "subject",
          predicateKey: "predicate",
        },
      }),
    ).toThrow();
    await runtime.knowledge.stop();
    await foreign.knowledge.stop();
  });
});
