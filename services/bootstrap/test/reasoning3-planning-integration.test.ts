import * as observerCore from "@orion/core";
import {
  type BrainOrchestrationLifecycleEvent,
  type ObserveBrainOrchestrationLifecycle,
  brainDiagnosticCorrelationIdentifier,
} from "@orion/core";
import {
  composeBoundedReasoning3BrainCapability as composeReasoning3BrainCapability,
  composeBrainCapability,
} from "../src/brain/brain-composition.js";
import {
  type KnowledgeConstructionValues,
  type ProjectStructuredKnowledge,
  type VerifyStructuredKnowledgeProjectionAuthority,
  type ReasoningOutcome,
} from "@orion/core";
import { KnowledgeEngine } from "@orion/knowledge";
import { afterEach, describe, expect, it, vi } from "vitest";
import { ReasoningEngine } from "@orion/reasoning";
import { PlanningEngine } from "@orion/planning";
import {
  BrainContextResolutionError,
  BrainReasoningResolutionError,
  BrainPlanningResolutionError,
  createNormalizedCognitiveRequest,
  type ActiveContextRevision,
} from "@orion/core";
import { composeBoundedReasoning3BrainCapability } from "../src/brain/brain-composition.js";

afterEach(() => vi.restoreAllMocks());
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

async function createRuntime(textualScalar = "value", anonymous = false) {
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
      textualScalar,
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
          ...(anonymous
            ? {}
            : {
                resolutionReference: identity.demonstrationResolutionReference,
              }),
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

function boundedRequest(
  runtime: Awaited<ReturnType<typeof createRuntime>>,
  subjectKey = "subject",
) {
  return createNormalizedCognitiveRequest({
    intent: "orchestrate-cognitive-request",
    requestId: "recovery05",
    contextLineageId: runtime.revision.lineageIdentity,
    query: {
      kind: "exact-text-attribute-value",
      subjectKey,
      predicateKey: "predicate",
    },
    executionIntent: { kind: "none" },
  });
}
function boundedBrain(
  runtime: Awaited<ReturnType<typeof createRuntime>>,
  candidate?: ActiveContextRevision,
  trace: string[] = [],
) {
  return composeBoundedReasoning3BrainCapability({
    contextLineageId: runtime.revision.lineageIdentity,
    context: {
      getActiveContextRevision: (request) =>
        candidate ??
        runtime.context.getActiveContextRevision.getActiveContextRevision(
          request,
        ),
      verifyActiveContextRevisionAuthority: (request) => {
        trace.push("context-verification-started");
        const verified =
          runtime.context.verifyActiveContextRevisionAuthority.verifyActiveContextRevisionAuthority(
            request,
          );
        expect(verified).toBe(runtime.revision);
        trace.push("context-verified");
        return verified;
      },
    },
  });
}
describe("RECOVERY-05 real bounded Brain composition", () => {
  it.each([
    "  exact  scalar  ",
    "x".repeat(2049),
    "x".repeat(4096),
    "\u{1f600}".repeat(4096),
  ])("preserves scalar through the production entry (%#)", async (scalar) => {
    const runtime = await createRuntime(scalar);
    try {
      const trace: string[] = [];
      const legacy = vi.spyOn(ReasoningEngine.prototype, "evaluateReasoning");
      const evaluateOriginal = ReasoningEngine.prototype.evaluateReasoning3;
      const evaluate = vi
        .spyOn(ReasoningEngine.prototype, "evaluateReasoning3")
        .mockImplementation(function (this: ReasoningEngine, request) {
          expect(trace).toEqual([
            "context-verification-started",
            "context-verified",
          ]);
          trace.push("reasoning-started");
          const outcome = evaluateOriginal.call(this, request);
          expect(trace.at(-1)).toBe("context-verified");
          trace.push("reasoning-completed");
          return outcome;
        });
      const verifyOriginal =
        ReasoningEngine.prototype.verifyReasoningOutcomeAuthority;
      const verify = vi
        .spyOn(ReasoningEngine.prototype, "verifyReasoningOutcomeAuthority")
        .mockImplementation(function (this: ReasoningEngine, request) {
          const result = verifyOriginal.call(this, request);
          trace.push("reasoning-verified");
          return result;
        });
      const planningOriginal = PlanningEngine.prototype.createCandidatePlan;
      const planning = vi
        .spyOn(PlanningEngine.prototype, "createCandidatePlan")
        .mockImplementation(function (this: PlanningEngine, request) {
          expect(trace.at(-1)).toBe("reasoning-verified");
          trace.push("planning");
          return planningOriginal.call(this, request);
        });
      const verifyPlanOriginal =
        PlanningEngine.prototype.verifyCandidatePlanAuthority;
      const verifyPlan = vi
        .spyOn(PlanningEngine.prototype, "verifyCandidatePlanAuthority")
        .mockImplementation(function (this: PlanningEngine, request) {
          const result = verifyPlanOriginal.call(this, request);
          trace.push("plan-verified");
          return result;
        });
      const brain = boundedBrain(runtime, undefined, trace);
      const request = boundedRequest(runtime);
      const final = brain.orchestrateCognitiveRequest(request);
      expect(trace.at(-1)).toBe("plan-verified");
      expect(final).toEqual({
        status: "completed",
        kind: "response",
        requestId: request.requestId,
        response: scalar,
      });
      expect(legacy).not.toHaveBeenCalled();
      expect(
        Reflect.get(
          evaluate.mock.calls[0]![0] as object,
          "activeContextRevision",
        ),
      ).toBe(runtime.revision);
      expect(evaluate).toHaveBeenCalledExactlyOnceWith({
        intent: "evaluate",
        activeContextRevision: runtime.revision,
        query: request.query,
      });
      const outcome = evaluate.mock.results[0]!.value as ReasoningOutcome;
      expect(verify).toHaveBeenCalledWith(
        expect.objectContaining({
          candidate: outcome,
          consumedContextRevision: runtime.revision,
        }),
      );
      expect(
        Reflect.get(planning.mock.calls[0]![0] as object, "reasoningOutcome"),
      ).toBe(outcome);
      expect(
        Object.keys(verifyPlan.mock.results[0]!.value.explainability).sort(),
      ).toEqual(
        [
          "consumedReasoningCategory",
          "consumedCandidateNextAction",
          "resultingPlanCategory",
          "candidateStepCount",
          "planningRuleCategory",
        ].sort(),
      );
      expect(planning).toHaveBeenCalledExactlyOnceWith({
        intent: "create-candidate-plan",
        reasoningOutcome: outcome,
      });
      expect(verifyPlan).toHaveBeenCalledWith(
        expect.objectContaining({
          consumedReasoningOutcome: outcome,
          candidate: planning.mock.results[0]!.value,
        }),
      );
      expect(Object.keys(outcome.explainability).sort()).toEqual(
        ["contextConsumptionReference", "identityState", "ruleCategory"].sort(),
      );
      expect(outcome.explainability.contextConsumptionReference).toMatchObject({
        lineageIdentity: runtime.revision.lineageIdentity,
        revisionIdentity: runtime.revision.revisionIdentity,
        revisionNumber: runtime.revision.revisionNumber,
      });
    } finally {
      await runtime.knowledge.stop();
    }
  });
  it.each([true, false])(
    "preserves anonymous or mismatch result (anonymous=%s)",
    async (anonymous) => {
      const runtime = await createRuntime("private scalar", anonymous);
      try {
        const evaluate = vi.spyOn(
          ReasoningEngine.prototype,
          "evaluateReasoning3",
        );
        const result = boundedBrain(runtime).orchestrateCognitiveRequest(
          boundedRequest(runtime, anonymous ? "subject" : "other"),
        );
        expect(result).toEqual({
          status: "completed",
          kind: "request-more-context",
          requestId: "recovery05",
          reason: "planning-requested-more-context",
        });
        expect(evaluate.mock.results[0]!.value).toMatchObject({
          category: anonymous
            ? "anonymous-context"
            : "knowledge-not-applicable",
        });
      } finally {
        await runtime.knowledge.stop();
      }
    },
  );
  it.each(["reconstructed", "foreign", "outer-clone"] as const)(
    "rejects %s Context at the existing boundary",
    async (kind) => {
      const runtime = await createRuntime();
      const foreign = await createRuntime();
      try {
        const candidate =
          kind === "foreign"
            ? foreign.revision
            : kind === "outer-clone"
              ? Object.freeze({ ...runtime.revision })
              : freezeReconstruction(structuredClone(runtime.revision));
        const evaluate = vi.spyOn(
          ReasoningEngine.prototype,
          "evaluateReasoning3",
        );
        const trace: string[] = [];
        const brain = boundedBrain(runtime, candidate, trace);
        expect(() =>
          brain.orchestrateCognitiveRequest(boundedRequest(runtime)),
        ).toThrow(BrainContextResolutionError);
        expect(evaluate).not.toHaveBeenCalled();
        expect(trace).toEqual(["context-verification-started"]);
      } finally {
        await runtime.knowledge.stop();
        await foreign.knowledge.stop();
      }
    },
  );
});

function freezeReconstruction<T>(value: T): T {
  if (typeof value === "object" && value !== null) {
    for (const child of Object.values(value)) freezeReconstruction(child);
    Object.freeze(value);
  }
  return value;
}

describe("RECOVERY-06 bounded conformance failures", () => {
  it.each([
    "outcome-verification",
    "plan-verification",
    "outcome-correspondence",
    "plan-correspondence",
  ] as const)("rejects %s at its existing Brain boundary", async (fault) => {
    const runtime = await createRuntime();
    try {
      const planningOriginal = PlanningEngine.prototype.createCandidatePlan;
      const planning = vi.spyOn(
        PlanningEngine.prototype,
        "createCandidatePlan",
      );
      const verifyOutcome = vi.spyOn(
        ReasoningEngine.prototype,
        "verifyReasoningOutcomeAuthority",
      );
      const verifyPlan = vi.spyOn(
        PlanningEngine.prototype,
        "verifyCandidatePlanAuthority",
      );
      if (fault === "outcome-verification")
        verifyOutcome.mockImplementation(() => {
          throw new Error("outcome authority unavailable");
        });
      if (fault === "plan-verification")
        verifyPlan.mockImplementation(() => {
          throw new Error("plan authority unavailable");
        });
      if (fault === "outcome-correspondence") {
        const original = ReasoningEngine.prototype.evaluateReasoning3;
        vi.spyOn(
          ReasoningEngine.prototype,
          "evaluateReasoning3",
        ).mockImplementation(function (this: ReasoningEngine, request) {
          return Object.freeze({
            ...original.call(this, request),
            nextAction: "request-more-context",
          });
        });
      }
      if (fault === "plan-correspondence")
        planning.mockImplementation(function (this: PlanningEngine, request) {
          const plan = planningOriginal.call(this, request);
          return Object.freeze({
            ...plan,
            source: Object.freeze({
              ...plan.source,
              identityState: "anonymous",
            }),
          });
        });
      const brain = boundedBrain(runtime);
      expect(() =>
        brain.orchestrateCognitiveRequest(boundedRequest(runtime)),
      ).toThrow(
        fault.startsWith("outcome")
          ? BrainReasoningResolutionError
          : BrainPlanningResolutionError,
      );
      if (fault.startsWith("outcome")) {
        expect(planning).not.toHaveBeenCalled();
        expect(verifyPlan).not.toHaveBeenCalled();
      } else expect(planning).toHaveBeenCalledTimes(1);
      if (fault === "outcome-correspondence")
        expect(verifyOutcome).not.toHaveBeenCalled();
      if (fault === "plan-correspondence")
        expect(verifyPlan).not.toHaveBeenCalled();
      if (fault === "plan-verification")
        expect(verifyPlan).toHaveBeenCalledTimes(1);
    } finally {
      await runtime.knowledge.stop();
    }
  });
  it("does not disclose the anonymous private scalar through composed outputs", async () => {
    const secret = "recovery06-private-proposition";
    const runtime = await createRuntime(secret, true);
    try {
      const evaluate = vi.spyOn(
        ReasoningEngine.prototype,
        "evaluateReasoning3",
      );
      const planning = vi.spyOn(
        PlanningEngine.prototype,
        "createCandidatePlan",
      );
      const result = boundedBrain(runtime).orchestrateCognitiveRequest(
        boundedRequest(runtime),
      );
      expect(result.kind).toBe("request-more-context");
      expect(evaluate.mock.results[0]!.value).toMatchObject({
        category: "anonymous-context",
        nextAction: "request-more-context",
      });
      for (const output of [
        evaluate.mock.results[0]!.value,
        planning.mock.results[0]!.value,
        result,
      ])
        expect(JSON.stringify(output)).not.toContain(secret);
    } finally {
      await runtime.knowledge.stop();
    }
  });
});

function observerBrain(
  runtime: Awaited<ReturnType<typeof createRuntime>>,
  lifecycleObserver?: ObserveBrainOrchestrationLifecycle,
) {
  return composeReasoning3BrainCapability({
    contextLineageId: runtime.revision.lineageIdentity,
    context: {
      getActiveContextRevision:
        runtime.context.getActiveContextRevision.getActiveContextRevision.bind(
          runtime.context.getActiveContextRevision,
        ),
      verifyActiveContextRevisionAuthority:
        runtime.context.verifyActiveContextRevisionAuthority.verifyActiveContextRevisionAuthority.bind(
          runtime.context.verifyActiveContextRevisionAuthority,
        ),
    },
    ...(lifecycleObserver === undefined ? {} : { lifecycleObserver }),
  });
}
function expectedObserverEvents(
  correlation: number,
): BrainOrchestrationLifecycleEvent[] {
  return (
    [
      { from: "none", to: "proposed", category: "orchestration-proposed" },
      { from: "proposed", to: "contextualized", category: "context-resolved" },
      {
        from: "contextualized",
        to: "reasoned",
        category: "reasoning-completed",
      },
      { from: "reasoned", to: "planned", category: "planning-completed" },
      { from: "planned", to: "completed", category: "no-skill-completed" },
    ] satisfies Omit<
      BrainOrchestrationLifecycleEvent,
      "sequence" | "diagnosticCorrelationId"
    >[]
  ).map((transition, index) => ({
    ...transition,
    sequence: index + 1,
    diagnosticCorrelationId: brainDiagnosticCorrelationIdentifier(
      "brain-diagnostic:" + correlation,
    ),
  }));
}
describe("RECOVERY-07 direct bounded lifecycle observer evidence", () => {
  it.each(["grounded", "mismatch", "anonymous"] as const)(
    "observes %s with the existing private event vocabulary",
    async (mode) => {
      const scalar = "private-observer-scalar-" + "x".repeat(2049);
      const runtime = await createRuntime(scalar, mode === "anonymous");
      try {
        const events: BrainOrchestrationLifecycleEvent[] = [];
        const observer: ObserveBrainOrchestrationLifecycle = (event) => {
          events.push(event);
        };
        const bounded = vi.spyOn(
          ReasoningEngine.prototype,
          "evaluateReasoning3",
        );
        const legacy = vi.spyOn(ReasoningEngine.prototype, "evaluateReasoning");
        const applicability = vi.spyOn(
          observerCore,
          "evaluateReasoningApplicability",
        );
        const sufficiency = vi.spyOn(
          observerCore,
          "evaluateReasoningSufficiency",
        );
        const brain = observerBrain(runtime, observer);
        const request = boundedRequest(
          runtime,
          mode === "mismatch" ? "other" : "subject",
        );
        const result = brain.orchestrateCognitiveRequest(request);
        expect(bounded).toHaveBeenCalledTimes(1);
        expect(legacy).not.toHaveBeenCalled();
        expect(bounded.mock.results[0]!.value).toMatchObject({
          category:
            mode === "grounded"
              ? "knowledge-grounded-success"
              : mode === "mismatch"
                ? "knowledge-not-applicable"
                : "anonymous-context",
        });
        if (mode === "anonymous") {
          expect(applicability).not.toHaveBeenCalled();
          expect(sufficiency).not.toHaveBeenCalled();
        } else {
          expect(applicability).toHaveBeenCalledTimes(1);
          expect(sufficiency).toHaveBeenCalledTimes(
            mode === "grounded" ? 1 : 0,
          );
        }
        expect(result).toEqual(
          mode === "grounded"
            ? {
                status: "completed",
                kind: "response",
                requestId: request.requestId,
                response: scalar,
              }
            : {
                status: "completed",
                kind: "request-more-context",
                requestId: request.requestId,
                reason: "planning-requested-more-context",
              },
        );
        expect(events).toEqual(expectedObserverEvents(1));
        for (const event of events) {
          expect(Reflect.ownKeys(event).sort()).toEqual(
            [
              "sequence",
              "from",
              "to",
              "category",
              "diagnosticCorrelationId",
            ].sort(),
          );
          expect(Object.isFrozen(event)).toBe(true);
        }
        const serialized = JSON.stringify(events);
        for (const prohibited of [
          scalar,
          "textualScalar",
          "subjectKey",
          "predicateKey",
          '"subject"',
          '"predicate"',
          "structured-knowledge",
          "semanticValue",
          "knowledgeIdentity",
          "propositionIdentity",
          runtime.revision.lineageIdentity,
          runtime.revision.revisionIdentity,
          request.requestId,
        ])
          expect(serialized).not.toContain(prohibited);
        expect(
          Object.keys(bounded.mock.results[0]!.value.explainability).sort(),
        ).toEqual(
          [
            "contextConsumptionReference",
            "identityState",
            "ruleCategory",
          ].sort(),
        );
        brain.orchestrateCognitiveRequest(request);
        expect(events).toEqual([
          ...expectedObserverEvents(1),
          ...expectedObserverEvents(2),
        ]);
      } finally {
        await runtime.knowledge.stop();
      }
    },
  );
  it.each(["grounded", "mismatch", "anonymous"] as const)(
    "contains observer failure without changing %s result",
    async (mode) => {
      const runtime = await createRuntime(
        " exact " + "x".repeat(2049) + " ",
        mode === "anonymous",
      );
      try {
        const request = boundedRequest(
          runtime,
          mode === "mismatch" ? "other" : "subject",
        );
        const normalEvents: BrainOrchestrationLifecycleEvent[] = [];
        const throwingEvents: BrainOrchestrationLifecycleEvent[] = [];
        const baseline =
          observerBrain(runtime).orchestrateCognitiveRequest(request);
        const normal = observerBrain(runtime, (event) => {
          normalEvents.push(event);
        }).orchestrateCognitiveRequest(request);
        const throwing = observerBrain(runtime, (event) => {
          throwingEvents.push(event);
          throw new Error("private observer failure");
        }).orchestrateCognitiveRequest(request);
        expect(normal).toEqual(baseline);
        expect(throwing).toEqual(baseline);
        expect(normalEvents).toEqual(expectedObserverEvents(1));
        expect(throwingEvents).toEqual(normalEvents);
        expect(Object.isFrozen(throwing)).toBe(true);
      } finally {
        await runtime.knowledge.stop();
      }
    },
  );
  it("retains the legacy evaluator and lifecycle vocabulary", () => {
    const bounded = vi.spyOn(ReasoningEngine.prototype, "evaluateReasoning3");
    const legacy = vi.spyOn(ReasoningEngine.prototype, "evaluateReasoning");
    const events: BrainOrchestrationLifecycleEvent[] = [];
    const brain = composeBrainCapability({
      contextLineageId: "orion.context.lineage.1",
      identityResolutionRequest: {},
      lifecycleObserver: (event) => {
        events.push(event);
      },
    });
    const result = brain.orchestrateCognitiveRequest(
      createNormalizedCognitiveRequest({
        intent: "orchestrate-cognitive-request",
        requestId: "legacy-r07",
        contextLineageId: "orion.context.lineage.1",
        query: "legacy query",
        executionIntent: { kind: "none" },
      }),
    );
    expect(legacy).toHaveBeenCalledTimes(1);
    expect(bounded).not.toHaveBeenCalled();
    expect(result).toEqual({
      status: "completed",
      kind: "request-more-context",
      requestId: "legacy-r07",
      reason: "planning-requested-more-context",
    });
    expect(events).toEqual(expectedObserverEvents(1));
  });
});
