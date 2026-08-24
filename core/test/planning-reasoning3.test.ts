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
