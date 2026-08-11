import {
  InvalidPlanningAuthorityRequestError,
  PlanningAuthorityVerificationError,
} from "@orion/core";
import { describe, expect, it } from "vitest";
import * as planningPackage from "../src/index.js";
import { PlanningEngine } from "../src/planning-engine.js";
import { planningTestOutcome } from "./planning-test-values.js";

function running() {
  const engine = new PlanningEngine();
  engine.initialize();
  engine.start();
  return engine;
}
function issued(engine = running(), consumed = planningTestOutcome()) {
  const candidate = engine.createCandidatePlan({
    intent: "create-candidate-plan",
    reasoningOutcome: consumed,
  });
  return { engine, consumed, candidate };
}
function request(value: ReturnType<typeof issued>) {
  const source = value.candidate.source;
  return {
    intent: "verify-candidate-plan-authority" as const,
    candidate: value.candidate,
    consumedReasoningOutcome: value.consumed,
    expectedReasoningStatus: source.reasoningStatus,
    expectedReasoningCategory: source.reasoningCategory,
    expectedCandidateNextAction: source.candidateNextAction,
    expectedIdentityState: source.identityState,
    expectedReasoningRuleCategory: source.reasoningRuleCategory,
  };
}

describe("Planning authority", () => {
  it("registers after correspondence validation and verifies exact identity", () => {
    const value = issued();
    expect(value.engine.verifyCandidatePlanAuthority(request(value))).toBe(
      value.candidate,
    );
  });

  it("rejects malformed authority requests", () => {
    expect(() =>
      issued().engine.verifyCandidatePlanAuthority({} as never),
    ).toThrow(InvalidPlanningAuthorityRequestError);
  });

  it("classifies decorated Candidate Plan arrays before provenance", () => {
    const value = issued();
    const candidate = structuredClone(value.candidate);
    Object.defineProperty(candidate.steps, "hidden", { value: true });
    expect(() =>
      value.engine.verifyCandidatePlanAuthority({
        ...request(value),
        candidate,
      }),
    ).toThrow(InvalidPlanningAuthorityRequestError);
  });

  it("rejects forged, cloned, spread, reconstructed, and cross-runtime plans", () => {
    const value = issued();
    for (const candidate of [
      structuredClone(value.candidate),
      { ...value.candidate },
      {
        ...value.candidate,
        source: structuredClone(value.candidate.source),
        explainability: structuredClone(value.candidate.explainability),
        steps: structuredClone(value.candidate.steps),
      },
    ]) {
      expect(() =>
        value.engine.verifyCandidatePlanAuthority({
          ...request(value),
          candidate,
        }),
      ).toThrow(PlanningAuthorityVerificationError);
    }
    expect(() =>
      running().verifyCandidatePlanAuthority(request(value)),
    ).toThrow(PlanningAuthorityVerificationError);
  });

  it("requires exact consumed Reasoning identity, source, and explainability correspondence", () => {
    const value = issued();
    expect(() =>
      value.engine.verifyCandidatePlanAuthority({
        ...request(value),
        consumedReasoningOutcome: structuredClone(value.consumed),
      }),
    ).toThrow(PlanningAuthorityVerificationError);
    expect(() =>
      value.engine.verifyCandidatePlanAuthority({
        ...request(value),
        expectedReasoningCategory: "anonymous-context",
      }),
    ).toThrow(PlanningAuthorityVerificationError);
    expect(() =>
      value.engine.verifyCandidatePlanAuthority({
        ...request(value),
        expectedReasoningRuleCategory: "anonymous-identity",
      }),
    ).toThrow(PlanningAuthorityVerificationError);
  });

  it("keeps provenance private and exposes only the issuer verifier port", () => {
    const { engine } = issued();
    expect(typeof engine.verifyCandidatePlanAuthority).toBe("function");
    expect(planningPackage).not.toHaveProperty("PlanningAuthority");
    expect(engine).not.toHaveProperty("registry");
  });
});
