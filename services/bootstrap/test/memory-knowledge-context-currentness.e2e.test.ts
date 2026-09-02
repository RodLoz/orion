import {
  MemorySourceAuthorityVerificationFailureError,
  MemorySourceCurrentnessUnableToDetermineError,
  anonymousCurrentIdentity,
  createMemoryKnowledgeSourceBinding,
  type BindMemorySourceRelationshipToPreparation,
  type KnowledgeConstructionValues,
  type MemoryExternalSourceProjectionPrerequisites,
  type MemorySourceRelationship,
  type ProjectStructuredKnowledge,
  type PropositionIdentity,
  type VerifyMemorySourceAuthority,
  type VerifyStructuredKnowledgeProjectionAuthority,
} from "@orion/core";
import { ContextEngine } from "@orion/context";
import { KnowledgeEngine } from "@orion/knowledge";
import { MemoryEngine } from "@orion/memory";
import { describe, expect, it, vi } from "vitest";

import {
  DeterministicContextConstructionValues,
  DeterministicMemoryConstructionValues,
  InMemoryKnowledgeStore,
  InMemoryMemoryStore,
} from "../src/index.js";

class NonproductionKnowledgeConstruction implements KnowledgeConstructionValues {
  #knowledge = 0;
  #proposition = 0;

  public nextKnowledgeIdentity(): unknown {
    this.#knowledge += 1;
    return `orion.knowledge.f13.${this.#knowledge}`;
  }

  public nextAcceptedAt(): unknown {
    return "2026-09-01T00:00:00.000Z";
  }

  public nextPropositionIdentity(): PropositionIdentity {
    this.#proposition += 1;
    return `orion.proposition.f13.${this.#proposition}` as PropositionIdentity;
  }
}

function composeNonproductionF13(
  memory = new MemoryEngine(
    new InMemoryMemoryStore(),
    new DeterministicMemoryConstructionValues(),
  ),
) {
  memory.initialize();
  memory.start();
  const knowledge = new KnowledgeEngine(
    new InMemoryKnowledgeStore(),
    new NonproductionKnowledgeConstruction(),
  );

  const bind = vi.fn(
    (
      request: Parameters<
        BindMemorySourceRelationshipToPreparation["bindMemorySourceRelationshipToPreparation"]
      >[0],
    ) => memory.bindMemorySourceRelationshipToPreparation(request),
  );
  const verifyMemory = vi.fn(
    (
      request: Parameters<
        VerifyMemorySourceAuthority["verifyMemorySourceAuthority"]
      >[0],
    ) => memory.verifyMemorySourceAuthority(request),
  );
  const project = vi.fn(
    (
      request: Parameters<
        ProjectStructuredKnowledge["projectStructuredKnowledge"]
      >[0],
    ) => knowledge.projectStructuredKnowledge(request),
  );
  const verifyProjection = vi.fn(
    (
      request: Parameters<
        VerifyStructuredKnowledgeProjectionAuthority["verifyStructuredKnowledgeProjectionAuthority"]
      >[0],
    ) => knowledge.verifyStructuredKnowledgeProjectionAuthority(request),
  );

  const start = async () => {
    await knowledge.initialize();
    knowledge.start();
    const context = new ContextEngine(
      new DeterministicContextConstructionValues(),
      { resolveCurrentIdentity: () => anonymousCurrentIdentity() },
      knowledge,
      undefined,
      {
        projectStructuredKnowledge: project,
        verifyStructuredKnowledgeProjectionAuthority: verifyProjection,
      },
      {
        bindMemorySourceRelationshipToPreparation: bind,
        verifyMemorySourceAuthority: verifyMemory,
      },
    );
    context.initialize();
    context.start();
    return { context };
  };

  return {
    memory,
    knowledge,
    bind,
    verifyMemory,
    project,
    verifyProjection,
    start,
  };
}

function retainAndIssue(memory: MemoryEngine, textualScalar = "Dark Theme") {
  const retained = memory.retainMemory({
    intent: "retain",
    kind: "episodic",
    content: textualScalar,
    retentionReason: "Provide bounded nonproduction F13 evidence.",
    provenance: {
      sourceType: "interaction",
      originatingCapability: "bootstrap-nonproduction-f13",
      observedAt: "2026-09-01T00:00:00.000Z",
      occurrenceEvidence: "reported",
    },
  });
  const retrieved = memory.getMemory({
    memoryIdentity: retained.memoryIdentity,
    purpose: "continuity",
  });
  const relationship = memory.issueMemorySourceRelationship({
    sourceAttribution: { authoritativeCapability: "memory" },
    memoryReference: retrieved.receipt.memoryReference,
    semanticValue: {
      subjectKey: "user.preference",
      predicateKey: "theme",
      textualScalar,
    },
  });
  return { retained, relationship };
}

async function acceptMemoryRelationship(
  knowledge: KnowledgeEngine,
  relationship: MemorySourceRelationship,
) {
  const memorySourceBinding = createMemoryKnowledgeSourceBinding({
    kind: "memory-source-relationship",
    relationship,
  });
  const accepted = await knowledge.evaluateKnowledgeClaim({
    intent: "evaluate",
    claim: "The user prefers the exact retained theme.",
    structuredProposition: relationship.semanticValue,
    samePropositionDeclaration: "same-proposition",
    sourceOwnershipProposal: {
      currentnessOwner: "external-source-currentness",
      applicableOwner: "memory",
      propositionSourceRelationship: relationship.relationshipIdentity,
    },
    memorySourceBinding,
    acceptanceEvidence: {
      method: "explicit-authority-review",
      authorityIdentifier: "orion.bootstrap.f13.nonproduction",
      decision: "accept",
      reason: "Accept the exact Memory-backed proposition for F13 evidence.",
    },
    provenance: {
      sourceType: "approved-internal-source",
      originatingCapability: "memory",
      observedAt: "2026-09-01T00:00:00.000Z",
    },
  });
  if (accepted.outcome !== "accepted") throw new Error("F13 setup failed.");
  return { accepted, memorySourceBinding };
}

function contextRequest(
  knowledgeIdentity: unknown,
  memorySourceBinding: ReturnType<typeof createMemoryKnowledgeSourceBinding>,
) {
  return {
    target: { kind: "new-lineage" },
    identityResolutionRequest: {},
    contextPreparationSemanticScope: {
      subjectKey: "user.preference",
      predicateKey: "theme",
    },
    knowledgeRetrievalRequest: { knowledgeIdentity },
    memorySourceBinding,
  } as const;
}

describe("nonproduction Memory to Knowledge to Context F13 composition", () => {
  it("uses the exact issued relationship and Context association for POSITIVE exact-one incorporation", async () => {
    const runtime = composeNonproductionF13();
    const { context } = await runtime.start();
    const { relationship } = retainAndIssue(runtime.memory);
    const { accepted, memorySourceBinding } = await acceptMemoryRelationship(
      runtime.knowledge,
      relationship,
    );

    const revision = context.prepareContextRevisionWithStructuredKnowledge(
      contextRequest(accepted.record.knowledgeIdentity, memorySourceBinding),
    );

    const bindRequest = runtime.bind.mock.calls[0]?.[0];
    expect(bindRequest?.relationship).toBe(relationship);
    const association = bindRequest?.candidatePreparationAssociation;
    expect(association).toBe("orion.context.revision.1");
    const currentnessRequest = runtime.bind.mock.results[0]?.value;
    expect(runtime.verifyMemory.mock.calls[0]?.[0].currentnessRequest).toBe(
      currentnessRequest,
    );
    const currentness = runtime.verifyMemory.mock.results[0]?.value;
    expect(currentness.determination).toBe("POSITIVE");
    if (currentness.determination !== "POSITIVE") throw new Error();
    expect(currentness.correspondence.candidatePreparationAssociation).toBe(
      association,
    );

    const projectionRequest = runtime.project.mock.calls[0]?.[0];
    const prerequisites = projectionRequest?.preparationPrerequisites as
      MemoryExternalSourceProjectionPrerequisites | undefined;
    if (prerequisites?.externalSourceKind !== "memory") throw new Error();
    expect(prerequisites.memorySourceBinding).toBe(memorySourceBinding);
    expect(prerequisites.memorySourceBinding.relationship).toBe(relationship);
    expect(prerequisites.candidatePreparationAssociation).toBe(association);
    expect(prerequisites.externalCurrentnessCorrespondence).toBe(
      currentness.correspondence,
    );
    const projected = runtime.project.mock.results[0]?.value;
    expect(projected.correspondence.candidatePreparationAssociation).toBe(
      association,
    );
    expect(projected.correspondence.propositionIdentity).toBe(
      accepted.record.acceptedStructuredProposition?.propositionIdentity,
    );
    expect(runtime.verifyProjection).toHaveBeenCalledTimes(1);

    const fragment = revision.fragments[1];
    if (fragment?.kind !== "structured-knowledge") throw new Error();
    expect(fragment.projection.propositionIdentity).not.toBe(
      relationship.relationshipIdentity,
    );
    expect(fragment.projection.attribution).toEqual({
      authoritativeCapability: "knowledge",
    });
    expect(revision.fragments).toHaveLength(2);
    expect(Object.isFrozen(revision)).toBe(true);
    expect(Object.isFrozen(revision.fragments)).toBe(true);
    expect(Object.isFrozen(fragment)).toBe(true);

    const serialized = JSON.stringify(revision);
    for (const prohibited of [
      "memorySourceBinding",
      "acceptedMemorySourceRelationships",
      "authorityToken",
      "captureIdentifier",
      "invalidationRegistry",
      "storeMetadata",
      "credentials",
      "lifecycleInternals",
      "confidence",
      "ranking",
      "traces",
      "acceptanceEvidence",
    ]) {
      expect(serialized).not.toContain(prohibited);
    }
    await runtime.knowledge.stop();
  });

  it("preserves Memory NEGATIVE as the existing Context no-candidate consequence", async () => {
    const runtime = composeNonproductionF13();
    const { context } = await runtime.start();
    const { retained, relationship } = retainAndIssue(runtime.memory);
    const { accepted, memorySourceBinding } = await acceptMemoryRelationship(
      runtime.knowledge,
      relationship,
    );
    runtime.memory.forgetMemory({
      intent: "forget",
      memoryIdentity: retained.memoryIdentity,
    });

    expect(() =>
      context.prepareContextRevisionWithStructuredKnowledge(
        contextRequest(accepted.record.knowledgeIdentity, memorySourceBinding),
      ),
    ).toThrow("No applicable structured Knowledge candidate is available.");
    expect(runtime.verifyMemory.mock.results[0]?.value).toEqual({
      determination: "NEGATIVE",
    });
    expect(runtime.project).not.toHaveBeenCalled();
    expect(runtime.verifyProjection).not.toHaveBeenCalled();
    expect(() =>
      context.getActiveContextRevision({
        lineageIdentity: "orion.context.lineage.1",
      }),
    ).toThrow();
    await runtime.knowledge.stop();
  });

  it("propagates the real post-Forget unable failure without replacement", async () => {
    const runtime = composeNonproductionF13();
    const { context } = await runtime.start();
    const { retained } = retainAndIssue(runtime.memory);
    const forgotten = runtime.memory.forgetMemory({
      intent: "forget",
      memoryIdentity: retained.memoryIdentity,
    });
    const relationship = runtime.memory.issueMemorySourceRelationship({
      sourceAttribution: { authoritativeCapability: "memory" },
      memoryReference: forgotten.memoryReference,
      semanticValue: {
        subjectKey: "user.preference",
        predicateKey: "theme",
        textualScalar: "Dark Theme",
      },
    });
    const { accepted, memorySourceBinding } = await acceptMemoryRelationship(
      runtime.knowledge,
      relationship,
    );

    let observed: unknown;
    try {
      context.prepareContextRevisionWithStructuredKnowledge(
        contextRequest(accepted.record.knowledgeIdentity, memorySourceBinding),
      );
    } catch (error: unknown) {
      observed = error;
    }
    const originating = runtime.verifyMemory.mock.results[0]?.value;
    expect(originating).toBeInstanceOf(
      MemorySourceCurrentnessUnableToDetermineError,
    );
    expect(observed).toBe(originating);
    expect(runtime.project).not.toHaveBeenCalled();
    expect(runtime.verifyProjection).not.toHaveBeenCalled();
    await runtime.knowledge.stop();
  });

  it("propagates a real foreign-relationship authority failure unchanged", async () => {
    const runtime = composeNonproductionF13();
    const { context } = await runtime.start();
    const foreignMemory = new MemoryEngine(
      new InMemoryMemoryStore(),
      new DeterministicMemoryConstructionValues(["orion.memory.f13.foreign"]),
    );
    foreignMemory.initialize();
    foreignMemory.start();
    const { relationship } = retainAndIssue(foreignMemory);
    const { accepted, memorySourceBinding } = await acceptMemoryRelationship(
      runtime.knowledge,
      relationship,
    );

    let observed: unknown;
    try {
      context.prepareContextRevisionWithStructuredKnowledge(
        contextRequest(accepted.record.knowledgeIdentity, memorySourceBinding),
      );
    } catch (error: unknown) {
      observed = error;
    }
    const originating = runtime.bind.mock.results[0]?.value;
    expect(originating).toBeInstanceOf(
      MemorySourceAuthorityVerificationFailureError,
    );
    expect(observed).toBe(originating);
    expect(runtime.verifyMemory).not.toHaveBeenCalled();
    expect(runtime.project).not.toHaveBeenCalled();
    expect(runtime.verifyProjection).not.toHaveBeenCalled();
    await runtime.knowledge.stop();
  });
});
