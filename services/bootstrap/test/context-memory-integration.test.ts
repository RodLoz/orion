import { MemoryNotFoundError } from "@orion/core";
import { describe, expect, it } from "vitest";

import {
  composeIdentityCapability,
  composeMemoryAwareContextCapability,
  composeMemoryCapability,
} from "../src/index.js";

describe("Context and Memory composition", () => {
  it("prepares a fixed Memory-aware profile through lifecycle-ready capabilities", () => {
    const identity = composeIdentityCapability();
    const memory = composeMemoryCapability();
    const retained = memory.retainMemory.retainMemory({
      intent: "retain",
      kind: "episodic",
      content: "A controlled Memory for Context integration.",
      retentionReason: "Prove Memory-owned retention before preparation.",
      provenance: {
        sourceType: "capability-outcome",
        originatingCapability: "bootstrap-integration-test",
        observedAt: "2026-08-11T02:00:00.000Z",
        occurrenceEvidence: "observed",
      },
    });
    const context = composeMemoryAwareContextCapability(
      identity.resolveCurrentIdentity,
      memory.getMemory,
    );

    const revision =
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

    expect(revision.fragments.map(({ kind }) => kind)).toEqual([
      "identity",
      "memory",
    ]);
    expect(revision.creationMetadata).toMatchObject({
      sourceCount: 2,
      fragmentCount: 2,
    });
    const memoryFragment = revision.fragments[1];
    if (memoryFragment?.kind !== "memory") throw new Error();
    expect(memoryFragment.projection).toEqual({
      memoryIdentity: retained.memoryIdentity,
      kind: "episodic",
      lifecycleState: "stored",
      authoritativeOwner: "memory",
    });
    const authoritative =
      context.getActiveContextRevision.getActiveContextRevision({
        lineageIdentity: revision.lineageIdentity,
      });
    expect(authoritative).toBe(revision);
    expect(
      context.verifyActiveContextRevisionAuthority.verifyActiveContextRevisionAuthority(
        {
          intent: "verify-active-context-revision-authority",
          candidate: authoritative,
          expectedLineageIdentity: authoritative.lineageIdentity,
          expectedRevisionIdentity: authoritative.revisionIdentity,
          expectedRevisionNumber: authoritative.revisionNumber,
        },
      ),
    ).toBe(authoritative);
  });

  it("preserves incorporated Context after Memory-owned forgetting and later retrieval failure", () => {
    const identity = composeIdentityCapability();
    const memory = composeMemoryCapability();
    const retained = memory.retainMemory.retainMemory({
      intent: "retain",
      kind: "episodic",
      content: "A forgettable controlled Memory.",
      retentionReason: "Prove historical Context stability.",
      provenance: {
        sourceType: "interaction",
        originatingCapability: "bootstrap-integration-test",
        observedAt: "2026-08-11T02:01:00.000Z",
        occurrenceEvidence: "reported",
      },
    });
    const context = composeMemoryAwareContextCapability(
      identity.resolveCurrentIdentity,
      memory.getMemory,
    );
    const first =
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
    const snapshot = structuredClone(first);

    memory.forgetMemory.forgetMemory({
      intent: "forget",
      memoryIdentity: retained.memoryIdentity,
    });

    expect(first).toEqual(snapshot);
    expect(Object.isFrozen(first)).toBe(true);
    expect(Object.isFrozen(first.fragments[1])).toBe(true);
    expect(() =>
      context.prepareContextRevisionWithMemory.prepareContextRevisionWithMemory(
        {
          target: {
            kind: "existing-lineage",
            lineageIdentity: first.lineageIdentity,
            expectedActiveRevisionIdentity: first.revisionIdentity,
          },
          identityResolutionRequest: {},
          memoryRetrievalRequest: {
            memoryIdentity: retained.memoryIdentity,
            purpose: "continuity",
          },
        },
      ),
    ).toThrow(MemoryNotFoundError);
    expect(
      context.getActiveContextRevision.getActiveContextRevision({
        lineageIdentity: first.lineageIdentity,
      }),
    ).toBe(first);
    expect(first.lifecycleState).toBe("active");
  });
});
