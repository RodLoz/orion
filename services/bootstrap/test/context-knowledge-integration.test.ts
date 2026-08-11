import { describe, expect, it } from "vitest";

import {
  composeIdentityCapability,
  composeKnowledgeAwareContextCapability,
  composeKnowledgeCapability,
} from "../src/index.js";

describe("Context and Knowledge composition", () => {
  it("wires lifecycle-ready Knowledge behind Context-owned preparation", () => {
    const identity = composeIdentityCapability();
    const knowledge = composeKnowledgeCapability();
    const accepted = knowledge.evaluateKnowledgeClaim.evaluateKnowledgeClaim({
      intent: "evaluate",
      claim: "A deterministic accepted claim for Context preparation.",
      acceptanceEvidence: {
        method: "explicit-authority-review",
        authorityIdentifier: "orion.knowledge.authority",
        decision: "accept",
        reason: "Establish same-runtime accepted Knowledge.",
      },
      provenance: {
        sourceType: "approved-internal-source",
        originatingCapability: "bootstrap-test",
        observedAt: "2026-08-11T00:00:00.000Z",
      },
    });
    if (accepted.outcome !== "accepted") throw new Error();
    const context = composeKnowledgeAwareContextCapability(
      identity.resolveCurrentIdentity,
      knowledge.getKnowledge,
    );

    const revision =
      context.prepareContextRevisionWithKnowledge.prepareContextRevisionWithKnowledge(
        {
          target: { kind: "new-lineage" },
          identityResolutionRequest: {},
          knowledgeRetrievalRequest: {
            knowledgeIdentity: accepted.record.knowledgeIdentity,
          },
        },
      );

    expect(revision.fragments.map(({ kind }) => kind)).toEqual([
      "identity",
      "knowledge",
    ]);
    const knowledgeFragment = revision.fragments[1];
    if (knowledgeFragment === undefined) throw new Error();
    expect(knowledgeFragment.projection).toMatchObject({
      knowledgeIdentity: accepted.record.knowledgeIdentity,
      version: accepted.record.version,
      currency: "current",
      authoritativeOwner: "knowledge",
    });
    expect(
      context.getActiveContextRevision.getActiveContextRevision({
        lineageIdentity: revision.lineageIdentity,
      }),
    ).toBe(revision);
    expect(
      context.verifyActiveContextRevisionAuthority.verifyActiveContextRevisionAuthority(
        {
          intent: "verify-active-context-revision-authority",
          candidate: revision,
          expectedLineageIdentity: revision.lineageIdentity,
          expectedRevisionIdentity: revision.revisionIdentity,
          expectedRevisionNumber: revision.revisionNumber,
        },
      ),
    ).toBe(revision);
  });
});
