import {
  InvalidPlanningAuthorityStateError,
  PlanningAuthorityVerificationError,
  type ActiveContextRevision,
  type ReasoningOutcome,
} from "@orion/core";
import { describe, expect, it } from "vitest";
import { ContextEngine } from "../../context/dist/context-engine.js";
import { ReasoningEngine } from "../../reasoning/dist/reasoning-engine.js";
import {
  corruptRegisteredPlanningNestedIdentity,
  corruptRegisteredPlanningPrimitive,
  invalidateRegisteredPlanningVerifierState,
  replaceRegisteredPlanningReasoning,
  restoreRegisteredPlanningCorrespondence,
} from "../src/planning-authority-test-seam.js";
import { PlanningEngine } from "../src/planning-engine.js";

function issueContext(suffix: string): ActiveContextRevision {
  const engine = new ContextEngine(
    {
      nextLineageIdentity: () => `context.lineage.planning-state.${suffix}`,
      nextRevisionIdentity: () => `context.revision.planning-state.${suffix}`,
      nextCreatedAt: () => "2026-07-30T00:00:00.000Z",
    },
    { resolveCurrentIdentity: () => ({ state: "anonymous" }) },
  );
  engine.initialize();
  engine.start();
  const composed = engine.composeContextRevision({
    target: { kind: "new-lineage" },
    currentIdentity: {
      state: "authenticated",
      identityIdentifier: `orion.identity.planning-state.${suffix}`,
    },
  });
  return engine.getActiveContextRevision({
    lineageIdentity: composed.lineageIdentity,
  });
}

function issueReasoning(suffix: string): ReasoningOutcome {
  const engine = new ReasoningEngine();
  engine.initialize();
  engine.start();
  return engine.evaluateReasoning({
    intent: "evaluate",
    activeContextRevision: issueContext(suffix),
    query: `planning state ${suffix}`,
  });
}

function issue(suffix: string) {
  const reasoning = issueReasoning(suffix);
  const engine = new PlanningEngine();
  engine.initialize();
  engine.start();
  const candidate = engine.createCandidatePlan({
    intent: "create-candidate-plan",
    reasoningOutcome: reasoning,
  });
  const source = candidate.source;
  return {
    engine,
    reasoning,
    candidate,
    request: {
      intent: "verify-candidate-plan-authority" as const,
      candidate,
      consumedReasoningOutcome: reasoning,
      expectedReasoningStatus: source.reasoningStatus,
      expectedReasoningCategory: source.reasoningCategory,
      expectedCandidateNextAction: source.candidateNextAction,
      expectedIdentityState: source.identityState,
      expectedReasoningRuleCategory: source.reasoningRuleCategory,
    },
  };
}

describe("Planning issuer-integrated authority correspondence", () => {
  it("detects real stored primitive replacement and restores correspondence", () => {
    const value = issue("primitive");
    expect(value.engine.verifyCandidatePlanAuthority(value.request)).toBe(
      value.candidate,
    );

    corruptRegisteredPlanningPrimitive(value.candidate, "replaced-category");
    expect(() =>
      value.engine.verifyCandidatePlanAuthority(value.request),
    ).toThrow(PlanningAuthorityVerificationError);

    restoreRegisteredPlanningCorrespondence(value.candidate);
    expect(value.engine.verifyCandidatePlanAuthority(value.request)).toBe(
      value.candidate,
    );
  });

  it("detects nested identity replacement from another issued plan", () => {
    const value = issue("nested-a");
    const other = issue("nested-b");
    expect(other.candidate.source).not.toBe(value.candidate.source);

    corruptRegisteredPlanningNestedIdentity(
      value.candidate,
      other.candidate.source,
    );
    expect(() =>
      value.engine.verifyCandidatePlanAuthority(value.request),
    ).toThrow(PlanningAuthorityVerificationError);

    restoreRegisteredPlanningCorrespondence(value.candidate);
    expect(value.engine.verifyCandidatePlanAuthority(value.request)).toBe(
      value.candidate,
    );
  });

  it("rejects associated Reasoning replaced with another runtime's issuance", () => {
    const value = issue("mixed-a");
    const otherReasoning = issueReasoning("mixed-b");
    expect(otherReasoning).not.toBe(value.reasoning);

    replaceRegisteredPlanningReasoning(value.candidate, otherReasoning);
    expect(() =>
      value.engine.verifyCandidatePlanAuthority(value.request),
    ).toThrow(PlanningAuthorityVerificationError);

    restoreRegisteredPlanningCorrespondence(value.candidate);
    expect(value.engine.verifyCandidatePlanAuthority(value.request)).toBe(
      value.candidate,
    );
  });

  it("normalizes invalid private verifier state after genuine issuance", () => {
    const value = issue("invalid-state");
    invalidateRegisteredPlanningVerifierState(value.candidate);
    expect(() =>
      value.engine.verifyCandidatePlanAuthority(value.request),
    ).toThrow(InvalidPlanningAuthorityStateError);
  });
});
