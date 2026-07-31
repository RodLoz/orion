import {
  InvalidReasoningAuthorityStateError,
  ReasoningAuthorityVerificationError,
  type ActiveContextRevision,
} from "@orion/core";
import { describe, expect, it } from "vitest";
import { ContextEngine } from "../../context/dist/context-engine.js";
import {
  corruptRegisteredReasoningNestedIdentity,
  corruptRegisteredReasoningPrimitive,
  invalidateRegisteredReasoningVerifierState,
  replaceRegisteredReasoningContext,
  restoreRegisteredReasoningCorrespondence,
} from "../src/reasoning-authority-test-seam.js";
import { ReasoningEngine } from "../src/reasoning-engine.js";

function issueContext(suffix: string): ActiveContextRevision {
  const engine = new ContextEngine({
    nextLineageIdentity: () => `context.lineage.reasoning-state.${suffix}`,
    nextRevisionIdentity: () => `context.revision.reasoning-state.${suffix}`,
    nextCreatedAt: () => "2026-07-30T00:00:00.000Z",
  });
  engine.initialize();
  engine.start();
  const composed = engine.composeContextRevision({
    target: { kind: "new-lineage" },
    currentIdentity: {
      state: "authenticated",
      identityIdentifier: `orion.identity.reasoning-state.${suffix}`,
    },
  });
  return engine.getActiveContextRevision({
    lineageIdentity: composed.lineageIdentity,
  });
}

function issue(suffix: string) {
  const context = issueContext(suffix);
  const engine = new ReasoningEngine();
  engine.initialize();
  engine.start();
  const candidate = engine.evaluateReasoning({
    intent: "evaluate",
    activeContextRevision: context,
    query: `state ${suffix}`,
  });
  return {
    engine,
    context,
    candidate,
    request: {
      intent: "verify-reasoning-outcome-authority" as const,
      candidate,
      consumedContextRevision: context,
      expectedLineageIdentity:
        candidate.explainability.contextConsumptionReference.lineageIdentity,
      expectedRevisionIdentity:
        candidate.explainability.contextConsumptionReference.revisionIdentity,
      expectedRevisionNumber:
        candidate.explainability.contextConsumptionReference.revisionNumber,
    },
  };
}

describe("Reasoning issuer-integrated authority correspondence", () => {
  it("detects real stored primitive replacement and restores correspondence", () => {
    const value = issue("primitive");
    expect(value.engine.verifyReasoningOutcomeAuthority(value.request)).toBe(
      value.candidate,
    );

    corruptRegisteredReasoningPrimitive(value.candidate, "replaced response");
    expect(() =>
      value.engine.verifyReasoningOutcomeAuthority(value.request),
    ).toThrow(ReasoningAuthorityVerificationError);

    restoreRegisteredReasoningCorrespondence(value.candidate);
    expect(value.engine.verifyReasoningOutcomeAuthority(value.request)).toBe(
      value.candidate,
    );
  });

  it("detects nested identity replacement from another issued outcome", () => {
    const value = issue("nested-a");
    const other = issue("nested-b");
    expect(other.candidate.explainability).not.toBe(
      value.candidate.explainability,
    );

    corruptRegisteredReasoningNestedIdentity(
      value.candidate,
      other.candidate.explainability,
    );
    expect(() =>
      value.engine.verifyReasoningOutcomeAuthority(value.request),
    ).toThrow(ReasoningAuthorityVerificationError);

    restoreRegisteredReasoningCorrespondence(value.candidate);
    expect(value.engine.verifyReasoningOutcomeAuthority(value.request)).toBe(
      value.candidate,
    );
  });

  it("rejects an associated Context replaced with another runtime's issuance", () => {
    const value = issue("mixed-a");
    const otherContext = issueContext("mixed-b");
    expect(otherContext).not.toBe(value.context);

    replaceRegisteredReasoningContext(value.candidate, otherContext);
    expect(() =>
      value.engine.verifyReasoningOutcomeAuthority(value.request),
    ).toThrow(ReasoningAuthorityVerificationError);

    restoreRegisteredReasoningCorrespondence(value.candidate);
    expect(value.engine.verifyReasoningOutcomeAuthority(value.request)).toBe(
      value.candidate,
    );
  });

  it("normalizes invalid private verifier state after genuine issuance", () => {
    const value = issue("invalid-state");
    invalidateRegisteredReasoningVerifierState(value.candidate);
    expect(() =>
      value.engine.verifyReasoningOutcomeAuthority(value.request),
    ).toThrow(InvalidReasoningAuthorityStateError);
  });
});
