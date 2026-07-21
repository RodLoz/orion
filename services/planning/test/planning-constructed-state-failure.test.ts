import { describe, expect, it, vi } from "vitest";
import { InvalidPlanningStateError } from "@orion/core";
import type { InvalidPlanningStateError as InvalidPlanningStateErrorType } from "@orion/core";
import { planningTestRequest } from "./planning-test-values.js";

vi.mock("@orion/core", async (importOriginal) => {
  const actual = await importOriginal<{
    readonly InvalidPlanningStateError: new () => InvalidPlanningStateErrorType;
    readonly [key: string]: unknown;
  }>();
  return {
    ...actual,
    createCandidatePlan: () => {
      throw new actual.InvalidPlanningStateError();
    },
  };
});

const { PlanningEngine } = await import("../src/planning-engine.js");

describe("Planning constructed-state controlled failure fixture", () => {
  it("maps constructed-output failure without mutating valid input", () => {
    const engine = new PlanningEngine();
    engine.initialize();
    engine.start();
    const input = planningTestRequest();
    const before = structuredClone(input);
    expect(() => engine.createCandidatePlan(input)).toThrow(
      InvalidPlanningStateError,
    );
    expect(input).toEqual(before);
    expect(Object.isFrozen(input)).toBe(false);
    expect(Object.isFrozen(input.reasoningOutcome)).toBe(false);
  });
});
