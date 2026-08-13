import { ReasoningAuthorityVerificationError } from "@orion/core";
import { ReasoningEngine } from "@orion/reasoning";
import { describe, expect, it } from "vitest";

import {
  composeIdentityCapability,
  composeMemoryAwareContextCapability,
  composeMemoryCapability,
} from "../src/index.js";

describe("Context Memory downstream composition", () => {
  it("preserves a real Context-issued Memory profile through Reasoning authority", () => {
    const identity = composeIdentityCapability();
    const memory = composeMemoryCapability();
    const retained = memory.retainMemory.retainMemory({
      intent: "retain",
      kind: "episodic",
      content: "A controlled downstream Memory.",
      retentionReason: "Prove opaque downstream Context compatibility.",
      provenance: {
        sourceType: "interaction",
        originatingCapability: "bootstrap-downstream-integration-test",
        observedAt: "2026-08-11T15:00:00.000Z",
        occurrenceEvidence: "observed",
      },
    });
    const context = composeMemoryAwareContextCapability(
      identity.resolveCurrentIdentity,
      memory.getMemory,
    );
    const activeContextRevision =
      context.prepareContextRevisionWithMemory.prepareContextRevisionWithMemory(
        {
          target: { kind: "new-lineage" },
          identityResolutionRequest: {},
          memoryRetrievalRequest: {
            memoryIdentity: retained.memoryIdentity,
            purpose: "continuity",
          },
        },
      );
    const reasoning = new ReasoningEngine();
    reasoning.initialize();
    reasoning.start();

    const outcome = reasoning.evaluateReasoning({
      intent: "evaluate",
      activeContextRevision,
      query: "Evaluate the authoritative Context without raw Memory.",
    });

    expect(activeContextRevision.fragments.map(({ kind }) => kind)).toEqual([
      "identity",
      "memory",
    ]);
    expect(outcome.category).toBe("anonymous-context");
    expect(
      reasoning.verifyReasoningOutcomeAuthority({
        intent: "verify-reasoning-outcome-authority",
        candidate: outcome,
        consumedContextRevision: activeContextRevision,
        expectedLineageIdentity: activeContextRevision.lineageIdentity,
        expectedRevisionIdentity: activeContextRevision.revisionIdentity,
        expectedRevisionNumber: activeContextRevision.revisionNumber,
      }),
    ).toBe(outcome);
    expect(() =>
      reasoning.verifyReasoningOutcomeAuthority({
        intent: "verify-reasoning-outcome-authority",
        candidate: outcome,
        consumedContextRevision: structuredClone(activeContextRevision),
        expectedLineageIdentity: activeContextRevision.lineageIdentity,
        expectedRevisionIdentity: activeContextRevision.revisionIdentity,
        expectedRevisionNumber: activeContextRevision.revisionNumber,
      }),
    ).toThrow(ReasoningAuthorityVerificationError);
  });
});
