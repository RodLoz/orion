import {
  createContextConsumptionReference,
  createReasoningExplainabilitySummary,
  createReasoningOutcome,
} from "@orion/core";

export function planningTestOutcome() {
  return createReasoningOutcome({
    status: "completed",
    category: "context-only",
    conclusion: "The authenticated actor is represented by the active context.",
    response:
      "Additional authoritative context may be required before further orchestration.",
    nextAction: "request-more-context",
    explainability: createReasoningExplainabilitySummary({
      contextConsumptionReference: createContextConsumptionReference({
        lineageIdentity: "context.lineage.m6.controlled-failure",
        revisionIdentity: "context.revision.m6.controlled-failure",
        revisionNumber: 1,
        lifecycleState: "active",
        authoritativeCapability: "context",
      }),
      identityState: "authenticated",
      ruleCategory: "authenticated-context-only",
    }),
  });
}

export function planningTestRequest(
  reasoningOutcome: unknown = structuredClone(planningTestOutcome()),
) {
  return { intent: "create-candidate-plan", reasoningOutcome };
}
