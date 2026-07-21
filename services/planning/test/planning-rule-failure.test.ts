import { describe, expect, it, vi } from "vitest";
import {
  InvalidReasoningOutcomeError,
  PlanningRuleFailureError,
} from "@orion/core";
import {
  planningTestOutcome,
  planningTestRequest,
} from "./planning-test-values.js";

vi.mock("../src/planning-rules.js", async () => {
  const { PlanningRuleFailureError } = await import("@orion/core");
  return {
    selectPlanningRule: () => {
      throw new PlanningRuleFailureError();
    },
  };
});

const { PlanningEngine } = await import("../src/planning-engine.js");

function running() {
  const engine = new PlanningEngine();
  engine.initialize();
  engine.start();
  return engine;
}

describe("Planning rule controlled failure fixture", () => {
  it("maps an internal rule-resolution failure without mutating valid input", () => {
    const input = planningTestRequest();
    const before = structuredClone(input);
    expect(() => running().createCandidatePlan(input)).toThrow(
      PlanningRuleFailureError,
    );
    expect(input).toEqual(before);
    expect(Object.isFrozen(input)).toBe(false);
    expect(Object.isFrozen(input.reasoningOutcome)).toBe(false);
  });

  it("preserves semantic-correspondence precedence over rule failure", () => {
    const contradictory = {
      ...planningTestOutcome(),
      response: "Contradictory response.",
    };
    expect(() =>
      running().createCandidatePlan(planningTestRequest(contradictory)),
    ).toThrow(InvalidReasoningOutcomeError);
  });
});
