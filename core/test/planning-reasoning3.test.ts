import { createCandidatePlan } from "../src/index.js";
import { describe, expect, it } from "vitest";
import {
  createReasoningConsumptionReference,
  type ReasoningOutcomeCategory,
} from "../src/index.js";

const valid = {
  reasoningStatus: "completed" as const,
  candidateNextAction: "request-more-context" as const,
  identityState: "authenticated" as const,
  authoritativeCapability: "reasoning" as const,
};

describe("Planning correspondence for Reasoning 3", () => {
  it.each([
    [
      "knowledge-grounded-success",
      "none",
      "authenticated-knowledge-applicable-sufficient",
    ],
    [
      "knowledge-not-applicable",
      "request-more-context",
      "authenticated-knowledge-not-applicable",
    ],
    [
      "knowledge-insufficient",
      "request-more-context",
      "authenticated-knowledge-applicable-insufficient",
    ],
  ] as const)(
    "accepts %s with its governed correspondence",
    (category, action, rule) => {
      expect(
        createReasoningConsumptionReference({
          ...valid,
          reasoningCategory: category,
          candidateNextAction: action,
          reasoningRuleCategory: rule,
        }),
      ).toMatchObject({
        reasoningCategory: category,
        candidateNextAction: action,
      });
    },
  );

  it.each([
    ["knowledge-grounded-success", "authenticated-knowledge-not-applicable"],
    [
      "knowledge-not-applicable",
      "authenticated-knowledge-applicable-sufficient",
    ],
    ["knowledge-insufficient", "authenticated-knowledge-not-applicable"],
  ] as const)("rejects mismatched %s correspondence", (category, rule) => {
    expect(() =>
      createReasoningConsumptionReference({
        ...valid,
        reasoningCategory: category,
        reasoningRuleCategory: rule,
      }),
    ).toThrow();
  });

  it("rejects unknown outcome categories", () => {
    expect(() =>
      createReasoningConsumptionReference({
        ...valid,
        reasoningCategory: "unknown" as ReasoningOutcomeCategory,
        reasoningRuleCategory: "authenticated-context-only",
      }),
    ).toThrow();
  });
});

function boundedPlan(response: string) {
  return createCandidatePlan({
    status: "completed",
    category: "respond",
    steps: [{ ordinal: 1, kind: "respond", candidateResponse: response }],
    source: {
      reasoningStatus: "completed",
      reasoningCategory: "knowledge-grounded-success",
      candidateNextAction: "none",
      identityState: "authenticated",
      reasoningRuleCategory: "authenticated-knowledge-applicable-sufficient",
      authoritativeCapability: "reasoning",
    },
    explainability: {
      consumedReasoningCategory: "knowledge-grounded-success",
      consumedCandidateNextAction: "none",
      resultingPlanCategory: "respond",
      candidateStepCount: 1,
      planningRuleCategory: "reasoning-produced-response",
    },
  });
}

describe("RECOVERY-04 Planning response domain", () => {
  it.each([
    "x".repeat(2048),
    "x".repeat(2049),
    "x".repeat(4096),
    "\u{1f600}".repeat(4096),
    "  exact  value  ",
  ])("preserves bounded response (%#)", (value) => {
    expect(boundedPlan(value).steps[0]).toEqual({
      ordinal: 1,
      kind: "respond",
      candidateResponse: value,
    });
  });
  it("rejects oversized and malformed bounded correspondence", () => {
    expect(() => boundedPlan("x".repeat(4097))).toThrow();
    const plan = boundedPlan("x".repeat(2049));
    expect(() =>
      createCandidatePlan({
        ...plan,
        source: { ...plan.source, identityState: "anonymous" },
      }),
    ).toThrow();
    expect(() =>
      createCandidatePlan({
        ...plan,
        source: {
          ...plan.source,
          reasoningCategory: "context-only",
          reasoningRuleCategory: "authenticated-context-only",
        },
        explainability: {
          ...plan.explainability,
          consumedReasoningCategory: "context-only",
        },
      }),
    ).toThrow();
  });
});
