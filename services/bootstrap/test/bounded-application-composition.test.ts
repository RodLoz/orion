import {
  createMemorySourcePropositionTuple,
  createContextPreparationSemanticScope,
  createMemoryKnowledgeSourceBinding,
  createNormalizedCognitiveRequest,
  ContextLineageNotFoundError,
} from "@orion/core";
import { ReasoningEngine } from "@orion/reasoning";
import { PlanningEngine } from "@orion/planning";
import { ContextEngine } from "@orion/context";
import { KnowledgeEngine } from "@orion/knowledge";
import { afterEach, describe, expect, it, vi } from "vitest";
import { composeBoundedApplicationCapability } from "../src/index.js";
type Composition = Awaited<
  ReturnType<typeof composeBoundedApplicationCapability>
>;
async function establishPrerequisites(
  runtime: Composition,
  scalar: string,
  anonymous = false,
  options: { sourceRuntime?: Composition; forgetBeforeIssue?: boolean } = {},
) {
  const source = options.sourceRuntime ?? runtime;
  const retained = source.retainMemory({
    intent: "retain",
    kind: "episodic",
    content: "Source material for the bounded composition test.",
    retentionReason: "Provide bounded Fixed Profile B evidence.",
    provenance: {
      sourceType: "interaction",
      originatingCapability: "bootstrap-fixed-profile-b-test",
      observedAt: "2026-09-01T00:00:00.000Z",
      occurrenceEvidence: "reported",
    },
  });
  const retrieved = source.getMemory({
    memoryIdentity: retained.memoryIdentity,
    purpose: "continuity",
  });
  const memoryReference = options.forgetBeforeIssue
    ? source.forgetMemory({
        intent: "forget",
        memoryIdentity: retained.memoryIdentity,
      }).memoryReference
    : retrieved.receipt.memoryReference;
  const relationship = source.issueMemorySourceRelationship({
    sourceAttribution: { authoritativeCapability: "memory" },
    memoryReference,
    semanticValue: createMemorySourcePropositionTuple({
      subjectKey: "user.preference",
      predicateKey: "theme",
      textualScalar: scalar,
    }),
  });
  const memorySourceBinding = createMemoryKnowledgeSourceBinding({
    kind: "memory-source-relationship",
    relationship,
  });
  const acceptanceRequest = {
    intent: "evaluate",
    claim: "The user prefers the exact retained theme.",
    structuredProposition: relationship.semanticValue,
    samePropositionDeclaration: "same-proposition",
    sourceOwnershipProposal: {
      currentnessOwner: "external-source-currentness",
      applicableOwner: "memory",
      propositionSourceRelationship: relationship.relationshipIdentity,
    },
    memorySourceBinding,
    acceptanceEvidence: {
      method: "explicit-authority-review",
      authorityIdentifier: "orion.bootstrap.fixed-profile-b.test",
      decision: "accept",
      reason:
        "Accept the exact Memory-backed proposition for bounded evidence.",
    },
    provenance: {
      sourceType: "approved-internal-source",
      originatingCapability: "memory",
      observedAt: "2026-09-01T00:00:00.000Z",
    },
  } as const;
  const accepted = await runtime.evaluateKnowledgeClaim(acceptanceRequest);
  if (accepted.outcome !== "accepted")
    throw new Error("Profile B setup failed.");
  const request = {
    target: { kind: "new-lineage" },
    identityResolutionRequest: anonymous
      ? {}
      : { resolutionReference: "m1-demonstration-reference" },
    contextPreparationSemanticScope: createContextPreparationSemanticScope({
      subjectKey: "user.preference",
      predicateKey: "theme",
    }),
    knowledgeRetrievalRequest: {
      knowledgeIdentity: accepted.record.knowledgeIdentity,
    },
    memorySourceBinding,
  } as const;
  return { retained, relationship, accepted, request, acceptanceRequest };
}

afterEach(() => vi.restoreAllMocks());
describe("C1 public bounded application composition", () => {
  it.each([
    " x ",
    "x".repeat(2048),
    "x".repeat(2049),
    "x".repeat(4096),
    "\u{1f600}".repeat(4096),
  ])("preserves exact source scalar (%#. case)", async (scalar) => {
    const evaluate = vi.spyOn(ReasoningEngine.prototype, "evaluateReasoning3");
    const outcomeVerifier = vi.spyOn(
      ReasoningEngine.prototype,
      "verifyReasoningOutcomeAuthority",
    );
    const planning = vi.spyOn(PlanningEngine.prototype, "createCandidatePlan");
    const planVerifier = vi.spyOn(
      PlanningEngine.prototype,
      "verifyCandidatePlanAuthority",
    );
    const runtime = await composeBoundedApplicationCapability();
    try {
      expect(() =>
        runtime.composeBrain({ contextLineageId: "orion.context.lineage.1" }),
      ).toThrow(ContextLineageNotFoundError);
      const setup = await establishPrerequisites(runtime, scalar);
      expect(evaluate).not.toHaveBeenCalled();
      const revision = runtime.prepareContextRevisionWithStructuredKnowledge(
        setup.request,
      );
      const events: unknown[] = [];
      const brain = runtime.composeBrain({
        contextLineageId: revision.lineageIdentity,
        lifecycleObserver: (event) => events.push(event),
      });
      expect(evaluate).not.toHaveBeenCalled();
      const request = createNormalizedCognitiveRequest({
        intent: "orchestrate-cognitive-request",
        requestId: "c1",
        contextLineageId: revision.lineageIdentity,
        query: {
          kind: "exact-text-attribute-value",
          subjectKey: "user.preference",
          predicateKey: "theme",
        },
        executionIntent: { kind: "none" },
      });
      const result = brain.orchestrateCognitiveRequest(request);
      expect(result).toEqual({
        status: "completed",
        kind: "response",
        requestId: request.requestId,
        response: scalar,
      });
      expect(evaluate).toHaveBeenCalledWith({
        intent: "evaluate",
        activeContextRevision: revision,
        query: request.query,
      });
      expect(
        Reflect.get(
          evaluate.mock.calls[0]![0] as object,
          "activeContextRevision",
        ),
      ).toBe(revision);
      const outcome = evaluate.mock.results[0]!.value;
      expect(outcome.conclusion).toBe(
        "The bounded Knowledge tuple satisfies the Reasoning query.",
      );
      expect(outcomeVerifier).toHaveBeenCalledWith(
        expect.objectContaining({
          candidate: outcome,
          consumedContextRevision: revision,
        }),
      );
      expect(planning).toHaveBeenCalledWith({
        intent: "create-candidate-plan",
        reasoningOutcome: outcome,
      });
      expect(outcomeVerifier.mock.invocationCallOrder[0]).toBeLessThan(
        planning.mock.invocationCallOrder[0]!,
      );
      expect(planVerifier).toHaveBeenCalledWith(
        expect.objectContaining({
          candidate: planning.mock.results[0]!.value,
          consumedReasoningOutcome: outcome,
        }),
      );
      expect(planVerifier).toHaveReturned();
      expect(events).toHaveLength(5);
      expect(JSON.stringify(events)).not.toContain("user.preference");
      expect(
        runtime.getActiveContextRevision({
          lineageIdentity: revision.lineageIdentity,
        }),
      ).toBe(revision);
    } finally {
      await runtime.shutdown();
    }
  });
  it.each([true, false])(
    "preserves anonymous/mismatch behavior (anonymous=%s)",
    async (anonymous) => {
      const evaluate = vi.spyOn(
        ReasoningEngine.prototype,
        "evaluateReasoning3",
      );
      const runtime = await composeBoundedApplicationCapability();
      try {
        const setup = await establishPrerequisites(
          runtime,
          "private scalar",
          anonymous,
        );
        const revision = runtime.prepareContextRevisionWithStructuredKnowledge(
          setup.request,
        );
        const brain = runtime.composeBrain({
          contextLineageId: revision.lineageIdentity,
        });
        const result = brain.orchestrateCognitiveRequest(
          createNormalizedCognitiveRequest({
            intent: "orchestrate-cognitive-request",
            requestId: "c1",
            contextLineageId: revision.lineageIdentity,
            query: {
              kind: "exact-text-attribute-value",
              subjectKey: "mismatch",
              predicateKey: "theme",
            },
            executionIntent: { kind: "none" },
          }),
        );
        expect(result.kind).toBe("request-more-context");
        expect(JSON.stringify(result)).not.toContain("private scalar");
        const outcome = evaluate.mock.results[0]!.value;
        expect(outcome.conclusion).toBe(
          anonymous
            ? "The active context identifies an anonymous actor."
            : "The bounded Knowledge tuple does not satisfy the Reasoning query.",
        );
        expect(outcome.response).toBe(
          anonymous
            ? "Additional identity context may be required before further orchestration."
            : "Additional context may be required before another bounded evaluation.",
        );
      } finally {
        await runtime.shutdown();
      }
    },
  );
  it.each(["clone", "foreign"])(
    "rejects %s Context through the public path",
    async (kind) => {
      const get = vi.spyOn(ContextEngine.prototype, "getActiveContextRevision");
      const runtime = await composeBoundedApplicationCapability();
      const foreign = await composeBoundedApplicationCapability();
      try {
        const setup = await establishPrerequisites(runtime, "private");
        const revision = runtime.prepareContextRevisionWithStructuredKnowledge(
          setup.request,
        );
        const other = await establishPrerequisites(foreign, "private");
        const foreignRevision =
          foreign.prepareContextRevisionWithStructuredKnowledge(other.request);
        const evaluate = vi.spyOn(
          ReasoningEngine.prototype,
          "evaluateReasoning3",
        );
        get.mockReturnValue(
          kind === "clone" ? Object.freeze({ ...revision }) : foreignRevision,
        );
        const brain = runtime.composeBrain({
          contextLineageId: revision.lineageIdentity,
        });
        expect(() =>
          brain.orchestrateCognitiveRequest(
            createNormalizedCognitiveRequest({
              intent: "orchestrate-cognitive-request",
              requestId: "c1",
              contextLineageId: revision.lineageIdentity,
              query: {
                kind: "exact-text-attribute-value",
                subjectKey: "user.preference",
                predicateKey: "theme",
              },
              executionIntent: { kind: "none" },
            }),
          ),
        ).toThrow();
        expect(evaluate).not.toHaveBeenCalled();
      } finally {
        await runtime.shutdown();
        await foreign.shutdown();
      }
    },
  );
  it("rejects an oversized structured scalar without preparing Context", async () => {
    const runtime = await composeBoundedApplicationCapability();
    try {
      await expect(
        establishPrerequisites(runtime, "x".repeat(4097)),
      ).rejects.toThrow();
      expect(() =>
        runtime.composeBrain({ contextLineageId: "orion.context.lineage.1" }),
      ).toThrow(ContextLineageNotFoundError);
    } finally {
      await runtime.shutdown();
    }
  });
  it("reuses idempotent Knowledge-owned shutdown", async () => {
    const stop = vi.spyOn(KnowledgeEngine.prototype, "stop");
    const runtime = await composeBoundedApplicationCapability();
    const first = runtime.shutdown();
    expect(runtime.shutdown()).toBe(first);
    await first;
    expect(stop).toHaveBeenCalledTimes(1);
  });
});
