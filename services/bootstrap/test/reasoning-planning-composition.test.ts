import type { ActiveContextRevision } from "@orion/core";
import {
  PlanningAuthorityVerificationError,
  ReasoningAuthorityVerificationError,
} from "@orion/core";
import { describe, expect, it } from "vitest";
import { PlanningEngine } from "@orion/planning";
import { ReasoningEngine } from "@orion/reasoning";
import { composePlanningCapability } from "../src/planning/planning-composition.js";
import { composeReasoningCapability } from "../src/reasoning/reasoning-composition.js";

function context(identity = "bootstrap") {
  return {
    lineageIdentity: `context.lineage.${identity}`,
    revisionIdentity: `context.revision.${identity}`,
    revisionNumber: 1,
    creationMetadata: {
      createdAt: "2026-07-30T00:00:00.000Z",
      sourceCount: 1,
      fragmentCount: 1,
    },
    lifecycleState: "active",
    fragments: [
      {
        kind: "identity",
        authoritativeOwner: "identity",
        projection: {
          state: "authenticated",
          authoritativeOwner: "identity",
          identityIdentifier: `orion.identity.${identity}`,
        },
      },
    ],
  } as unknown as ActiveContextRevision;
}

describe("Reasoning Bootstrap composition", () => {
  it("exposes a frozen same-runtime operation and verifier pair", () => {
    const composition = composeReasoningCapability();
    const consumed = context();
    const candidate = composition.evaluateReasoning.evaluateReasoning({
      intent: "evaluate",
      activeContextRevision: consumed,
      query: "Verify Bootstrap Reasoning composition.",
    });
    const verified =
      composition.verifyReasoningOutcomeAuthority.verifyReasoningOutcomeAuthority(
        {
          intent: "verify-reasoning-outcome-authority",
          candidate,
          consumedContextRevision: consumed,
          expectedLineageIdentity: consumed.lineageIdentity,
          expectedRevisionIdentity: consumed.revisionIdentity,
          expectedRevisionNumber: consumed.revisionNumber,
        },
      );

    expect(verified).toBe(candidate);
    expect(Object.isFrozen(composition)).toBe(true);
    expect(Object.isFrozen(composition.evaluateReasoning)).toBe(true);
    expect(Object.isFrozen(composition.verifyReasoningOutcomeAuthority)).toBe(
      true,
    );
    expect(Reflect.ownKeys(composition)).toEqual([
      "evaluateReasoning",
      "verifyReasoningOutcomeAuthority",
      "engineState",
    ]);
    expect(Object.values(composition)).not.toContainEqual(
      expect.any(ReasoningEngine),
    );
  });

  it("rejects an Outcome issued by another composed runtime", () => {
    const issuer = composeReasoningCapability();
    const verifier = composeReasoningCapability();
    const consumed = context("cross-runtime");
    const candidate = issuer.evaluateReasoning.evaluateReasoning({
      intent: "evaluate",
      activeContextRevision: consumed,
      query: "Reject cross-runtime Reasoning authority.",
    });

    expect(() =>
      verifier.verifyReasoningOutcomeAuthority.verifyReasoningOutcomeAuthority({
        intent: "verify-reasoning-outcome-authority",
        candidate,
        consumedContextRevision: consumed,
        expectedLineageIdentity: consumed.lineageIdentity,
        expectedRevisionIdentity: consumed.revisionIdentity,
        expectedRevisionNumber: consumed.revisionNumber,
      }),
    ).toThrow(ReasoningAuthorityVerificationError);
  });
});

describe("Planning Bootstrap composition", () => {
  function reasoningOutcome() {
    const reasoning = composeReasoningCapability();
    const consumed = context("planning");
    return reasoning.evaluateReasoning.evaluateReasoning({
      intent: "evaluate",
      activeContextRevision: consumed,
      query: "Produce a Candidate Plan.",
    });
  }

  function verificationRequest(
    candidate: ReturnType<
      ReturnType<
        typeof composePlanningCapability
      >["createCandidatePlan"]["createCandidatePlan"]
    >,
    consumed: ReturnType<typeof reasoningOutcome>,
  ) {
    return {
      intent: "verify-candidate-plan-authority" as const,
      candidate,
      consumedReasoningOutcome: consumed,
      expectedReasoningStatus: candidate.source.reasoningStatus,
      expectedReasoningCategory: candidate.source.reasoningCategory,
      expectedCandidateNextAction: candidate.source.candidateNextAction,
      expectedIdentityState: candidate.source.identityState,
      expectedMemoryReferenceCount: candidate.source.memoryReferenceCount,
      expectedKnowledgeReferenceCount: candidate.source.knowledgeReferenceCount,
      expectedReasoningRuleCategory: candidate.source.reasoningRuleCategory,
    };
  }

  it("exposes a frozen same-runtime operation and verifier pair", () => {
    const composition = composePlanningCapability();
    const consumed = reasoningOutcome();
    const candidate = composition.createCandidatePlan.createCandidatePlan({
      intent: "create-candidate-plan",
      reasoningOutcome: consumed,
    });

    expect(
      composition.verifyCandidatePlanAuthority.verifyCandidatePlanAuthority(
        verificationRequest(candidate, consumed),
      ),
    ).toBe(candidate);
    expect(Object.isFrozen(composition)).toBe(true);
    expect(Object.isFrozen(composition.createCandidatePlan)).toBe(true);
    expect(Object.isFrozen(composition.verifyCandidatePlanAuthority)).toBe(
      true,
    );
    expect(Reflect.ownKeys(composition)).toEqual([
      "createCandidatePlan",
      "verifyCandidatePlanAuthority",
      "engineState",
    ]);
    expect(Object.values(composition)).not.toContainEqual(
      expect.any(PlanningEngine),
    );
  });

  it("rejects a Candidate Plan issued by another composed runtime", () => {
    const issuer = composePlanningCapability();
    const verifier = composePlanningCapability();
    const consumed = reasoningOutcome();
    const candidate = issuer.createCandidatePlan.createCandidatePlan({
      intent: "create-candidate-plan",
      reasoningOutcome: consumed,
    });

    expect(() =>
      verifier.verifyCandidatePlanAuthority.verifyCandidatePlanAuthority(
        verificationRequest(candidate, consumed),
      ),
    ).toThrow(PlanningAuthorityVerificationError);
  });
});
