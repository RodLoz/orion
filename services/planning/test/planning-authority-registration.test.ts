import { InvalidPlanningAuthorityStateError } from "@orion/core";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { planningTestOutcome } from "./planning-test-values.js";

const control = vi.hoisted(() => ({
  attempts: 0,
  fail: false,
  observedValidated: false,
  candidate: undefined as object | undefined,
}));

vi.mock("../src/planning-authority.js", () => ({
  PlanningAuthority: class {
    public register(candidate: {
      status: unknown;
      source: unknown;
      explainability: unknown;
    }) {
      control.attempts += 1;
      control.candidate = candidate;
      control.observedValidated =
        candidate.status === "completed" &&
        Object.isFrozen(candidate) &&
        Object.isFrozen(candidate.source) &&
        Object.isFrozen(candidate.explainability);
      if (control.fail) throw new InvalidPlanningAuthorityStateError();
    }
    public verifyCandidatePlanAuthority(): never {
      throw new Error("not used");
    }
  },
}));

const { PlanningEngine } = await import("../src/planning-engine.js");

function running() {
  const engine = new PlanningEngine();
  engine.initialize();
  engine.start();
  return engine;
}

describe("Planning authority registration adjacency", () => {
  beforeEach(() => {
    control.attempts = 0;
    control.fail = false;
    control.observedValidated = false;
    control.candidate = undefined;
  });
  it("registers once after correspondence and immediately before return", () => {
    const result = running().createCandidatePlan({
      intent: "create-candidate-plan",
      reasoningOutcome: planningTestOutcome(),
    });
    expect(control.attempts).toBe(1);
    expect(control.observedValidated).toBe(true);
    expect(control.candidate).toBe(result);
    expect(result.status).toBe("completed");
  });

  it("suppresses return without retry on registration failure", () => {
    control.fail = true;
    expect(() =>
      running().createCandidatePlan({
        intent: "create-candidate-plan",
        reasoningOutcome: planningTestOutcome(),
      }),
    ).toThrow(InvalidPlanningAuthorityStateError);
    expect(control.attempts).toBe(1);
  });

  it("does not register unsuccessful issue paths", () => {
    expect(() => running().createCandidatePlan({})).toThrow();
    expect(control.attempts).toBe(0);
  });
});
