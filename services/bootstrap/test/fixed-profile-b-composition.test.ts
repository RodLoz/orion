import {
  ContextLineageNotFoundError,
  InvalidKnowledgeStateError,
  MemorySourceAuthorityVerificationFailureError,
  MemorySourceCurrentnessUnableToDetermineError,
  createMemorySourcePropositionTuple,
  createContextPreparationSemanticScope,
  type BindMemorySourceRelationshipToPreparation,
  type VerifyMemorySourceAuthority,
  type ProjectStructuredKnowledge,
  type VerifyStructuredKnowledgeProjectionAuthority,
  createMemoryKnowledgeSourceBinding,
  type MemoryExternalSourceProjectionPrerequisites,
} from "@orion/core";
import { NoApplicableStructuredKnowledgeCandidateError } from "@orion/context";
import { KnowledgeEngine } from "@orion/knowledge";
import { MemoryEngine } from "@orion/memory";
import { afterEach, describe, expect, it, vi } from "vitest";

import { composeFixedProfileBCapability } from "../src/index.js";

type Composition = Awaited<ReturnType<typeof composeFixedProfileBCapability>>;

async function establishPrerequisites(
  runtime: Composition,
  options: { sourceRuntime?: Composition; forgetBeforeIssue?: boolean } = {},
) {
  const source = options.sourceRuntime ?? runtime;
  const retained = source.retainMemory({
    intent: "retain",
    kind: "episodic",
    content: "Dark Theme",
    retentionReason: "Provide bounded Fixed Profile B evidence.",
    provenance: {
      sourceType: "interaction",
      originatingCapability: "bootstrap-fixed-profile-b-test",
      observedAt: "2026-09-01T00:00:00.000Z",
      occurrenceEvidence: "reported",
    },
  });
  const retrieved = source.getMemory({
    memoryIdentity: retained.memoryIdentity,
    purpose: "continuity",
  });
  const memoryReference = options.forgetBeforeIssue
    ? source.forgetMemory({
        intent: "forget",
        memoryIdentity: retained.memoryIdentity,
      }).memoryReference
    : retrieved.receipt.memoryReference;
  const relationship = source.issueMemorySourceRelationship({
    sourceAttribution: { authoritativeCapability: "memory" },
    memoryReference,
    semanticValue: createMemorySourcePropositionTuple({
      subjectKey: "user.preference",
      predicateKey: "theme",
      textualScalar: "Dark Theme",
    }),
  });
  const memorySourceBinding = createMemoryKnowledgeSourceBinding({
    kind: "memory-source-relationship",
    relationship,
  });
  const acceptanceRequest = {
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
      authorityIdentifier: "orion.bootstrap.fixed-profile-b.test",
      decision: "accept",
      reason:
        "Accept the exact Memory-backed proposition for bounded evidence.",
    },
    provenance: {
      sourceType: "approved-internal-source",
      originatingCapability: "memory",
      observedAt: "2026-09-01T00:00:00.000Z",
    },
  } as const;
  const accepted = await runtime.evaluateKnowledgeClaim(acceptanceRequest);
  if (accepted.outcome !== "accepted")
    throw new Error("Profile B setup failed.");
  const request = {
    target: { kind: "new-lineage" },
    identityResolutionRequest: {},
    contextPreparationSemanticScope: createContextPreparationSemanticScope({
      subjectKey: "user.preference",
      predicateKey: "theme",
    }),
    knowledgeRetrievalRequest: {
      knowledgeIdentity: accepted.record.knowledgeIdentity,
    },
    memorySourceBinding,
  } as const;
  return { retained, relationship, accepted, request, acceptanceRequest };
}

function expectNoActiveRevision(runtime: Composition) {
  expect(() =>
    runtime.getActiveContextRevision({
      lineageIdentity: "orion.context.lineage.1",
    }),
  ).toThrow(ContextLineageNotFoundError);
}

function expectExactFields(value: object, fields: readonly string[]) {
  expect(Reflect.ownKeys(value).sort()).toEqual([...fields].sort());
}

afterEach(() => vi.restoreAllMocks());

describe("Bootstrap fixed Profile B production composition", () => {
  it.each(["unable", "foreign-authority"] as const)(
    "preserves the originating Memory %s failure without activation or retry",
    async (scenario) => {
      const bind = vi.spyOn(
        MemoryEngine.prototype as BindMemorySourceRelationshipToPreparation,
        "bindMemorySourceRelationshipToPreparation",
      );
      const verifyMemory = vi.spyOn(
        MemoryEngine.prototype as VerifyMemorySourceAuthority,
        "verifyMemorySourceAuthority",
      );
      const project = vi.spyOn(
        KnowledgeEngine.prototype as ProjectStructuredKnowledge,
        "projectStructuredKnowledge",
      );
      const verifyProjection = vi.spyOn(
        KnowledgeEngine.prototype as VerifyStructuredKnowledgeProjectionAuthority,
        "verifyStructuredKnowledgeProjectionAuthority",
      );
      const runtime = await composeFixedProfileBCapability();
      let foreign: Composition | undefined;
      try {
        if (scenario === "foreign-authority")
          foreign = await composeFixedProfileBCapability();
        const setup = await establishPrerequisites(
          runtime,
          foreign === undefined
            ? { forgetBeforeIssue: true }
            : { sourceRuntime: foreign },
        );
        let observed: unknown;
        try {
          runtime.prepareContextRevisionWithStructuredKnowledge(setup.request);
        } catch (error: unknown) {
          observed = error;
        }
        const originating =
          scenario === "unable"
            ? verifyMemory.mock.results[0]
            : bind.mock.results[0];
        expect(originating?.type).toBe("throw");
        expect(observed).toBe(originating?.value);
        expect(observed).toBeInstanceOf(
          scenario === "unable"
            ? MemorySourceCurrentnessUnableToDetermineError
            : MemorySourceAuthorityVerificationFailureError,
        );
        expect(observed).not.toBeInstanceOf(
          NoApplicableStructuredKnowledgeCandidateError,
        );
        expect(bind).toHaveBeenCalledTimes(1);
        expect(verifyMemory).toHaveBeenCalledTimes(
          scenario === "unable" ? 1 : 0,
        );
        expect(project).not.toHaveBeenCalled();
        expect(verifyProjection).not.toHaveBeenCalled();
        expectNoActiveRevision(runtime);
      } finally {
        await runtime.shutdown();
        await foreign?.shutdown();
      }
    },
  );

  it("preserves the exact authoritative Active Profile B after Forget and failed later preparation", async () => {
    const runtime = await composeFixedProfileBCapability();
    try {
      const setup = await establishPrerequisites(runtime);
      const prepared = runtime.prepareContextRevisionWithStructuredKnowledge(
        setup.request,
      );
      const active = runtime.getActiveContextRevision({
        lineageIdentity: prepared.lineageIdentity,
      });
      expect(active).toBe(prepared);
      const authorityRequest = {
        intent: "verify-active-context-revision-authority",
        candidate: active,
        expectedLineageIdentity: active.lineageIdentity,
        expectedRevisionIdentity: active.revisionIdentity,
        expectedRevisionNumber: active.revisionNumber,
      } as const;
      expect(
        runtime.verifyActiveContextRevisionAuthority(authorityRequest),
      ).toBe(active);
      const snapshot = structuredClone(active);
      const fragments = active.fragments;
      const knowledgeFragment = active.fragments[1];
      runtime.forgetMemory({
        intent: "forget",
        memoryIdentity: setup.retained.memoryIdentity,
      });
      expect(active).toEqual(snapshot);
      expect(
        runtime.getActiveContextRevision({
          lineageIdentity: active.lineageIdentity,
        }),
      ).toBe(active);
      expect(
        runtime.verifyActiveContextRevisionAuthority(authorityRequest),
      ).toBe(active);
      expect(() =>
        runtime.prepareContextRevisionWithStructuredKnowledge({
          ...setup.request,
          target: {
            kind: "existing-lineage",
            lineageIdentity: active.lineageIdentity,
            expectedActiveRevisionIdentity: active.revisionIdentity,
          },
        }),
      ).toThrow(NoApplicableStructuredKnowledgeCandidateError);
      expect(active).toEqual(snapshot);
      expect(active.fragments).toBe(fragments);
      expect(active.fragments[1]).toBe(knowledgeFragment);
      expect(active.fragments.map(({ kind }) => kind)).toEqual([
        "identity",
        "structured-knowledge",
      ]);
      expect(Object.isFrozen(active)).toBe(true);
      expect(Object.isFrozen(fragments)).toBe(true);
      expect(Object.isFrozen(knowledgeFragment)).toBe(true);
      expect(active.lifecycleState).toBe("active");
      expect(
        runtime.getActiveContextRevision({
          lineageIdentity: active.lineageIdentity,
        }),
      ).toBe(active);
      expect(
        runtime.verifyActiveContextRevisionAuthority(authorityRequest),
      ).toBe(active);
    } finally {
      await runtime.shutdown();
    }
  });

  it("remains passive until an explicit caller request and activates exactly Identity and Knowledge without Brain or Reasoning", async () => {
    // Observe public Engine calls without replacing their implementations or graph.
    const bind = vi.spyOn(
      MemoryEngine.prototype as BindMemorySourceRelationshipToPreparation,
      "bindMemorySourceRelationshipToPreparation",
    );
    const verifyMemory = vi.spyOn(
      MemoryEngine.prototype as VerifyMemorySourceAuthority,
      "verifyMemorySourceAuthority",
    );
    const project = vi.spyOn(
      KnowledgeEngine.prototype as ProjectStructuredKnowledge,
      "projectStructuredKnowledge",
    );
    const verifyProjection = vi.spyOn(
      KnowledgeEngine.prototype as VerifyStructuredKnowledgeProjectionAuthority,
      "verifyStructuredKnowledgeProjectionAuthority",
    );
    const runtime = await composeFixedProfileBCapability();
    try {
      expectNoActiveRevision(runtime);
      expect(bind).not.toHaveBeenCalled();
      expect(project).not.toHaveBeenCalled();
      expect(Object.keys(runtime).sort()).toEqual([
        "evaluateKnowledgeClaim",
        "forgetMemory",
        "getActiveContextRevision",
        "getMemory",
        "issueMemorySourceRelationship",
        "prepareContextRevisionWithStructuredKnowledge",
        "retainMemory",
        "shutdown",
        "verifyActiveContextRevisionAuthority",
      ]);
      const setup = await establishPrerequisites(runtime);
      expectNoActiveRevision(runtime);
      expect(bind).not.toHaveBeenCalled();
      expect(project).not.toHaveBeenCalled();

      const revision = runtime.prepareContextRevisionWithStructuredKnowledge(
        setup.request,
      );
      expect(bind).toHaveBeenCalledTimes(1);
      expect(bind.mock.calls[0]?.[0].relationship).toBe(setup.relationship);
      const association =
        bind.mock.calls[0]?.[0].candidatePreparationAssociation;
      expect(association).toBe("orion.context.revision.1");
      expect(verifyMemory).toHaveBeenCalledTimes(1);
      expect(verifyMemory.mock.calls[0]?.[0].currentnessRequest).toBe(
        bind.mock.results[0]?.value,
      );
      const currentness = verifyMemory.mock.results[0]?.value;
      expect(currentness.determination).toBe("POSITIVE");
      if (currentness.determination !== "POSITIVE")
        throw new Error("Expected positive currentness.");
      expect(currentness.correspondence.candidatePreparationAssociation).toBe(
        association,
      );
      expect(project).toHaveBeenCalledTimes(1);
      const prerequisites = project.mock.calls[0]?.[0]
        .preparationPrerequisites as MemoryExternalSourceProjectionPrerequisites;
      expect(prerequisites.memorySourceBinding).toBe(
        setup.request.memorySourceBinding,
      );
      expect(prerequisites.candidatePreparationAssociation).toBe(association);
      expect(prerequisites.externalCurrentnessCorrespondence).toBe(
        currentness.correspondence,
      );
      const candidate = project.mock.results[0]?.value;
      expect(candidate.correspondence.candidatePreparationAssociation).toBe(
        association,
      );
      expect(verifyProjection).toHaveBeenCalledTimes(1);
      expect(verifyProjection.mock.calls[0]?.[0].candidate).toBe(candidate);
      expect(verifyProjection.mock.results[0]?.value).toBe(candidate);
      // Closed public representations from Core, with F13 prohibited fields
      // checked on this production composition rather than its local fixture.
      expectExactFields(currentness, ["determination", "correspondence"]);
      expectExactFields(currentness.correspondence, [
        "sourceAttribution",
        "relationshipIdentity",
        "candidatePreparationAssociation",
        "determination",
        "issuerVerification",
      ]);
      expect(currentness.correspondence.sourceAttribution).toEqual({
        authoritativeCapability: "memory",
      });
      expectExactFields(candidate, ["semanticValue", "correspondence"]);
      expectExactFields(candidate.semanticValue, [
        "subjectKey",
        "predicateKey",
        "textualScalar",
      ]);
      expectExactFields(candidate.correspondence, [
        "candidatePreparationAssociation",
        "propositionIdentity",
        "knowledgeIdentity",
        "knowledgeVersion",
        "validationState",
        "attribution",
        "sourceOwnershipCorrespondence",
        "externalCurrentnessCorrespondence",
        "underlyingSourceAuthority",
        "issuance",
      ]);
      expectExactFields(
        candidate.correspondence.sourceOwnershipCorrespondence,
        [
          "currentnessOwner",
          "applicableOwner",
          "propositionSourceRelationship",
        ],
      );
      expectExactFields(
        candidate.correspondence.externalCurrentnessCorrespondence,
        [
          "applicableOwner",
          "candidatePreparationAssociation",
          "propositionSourceRelationship",
          "determination",
          "issuerVerification",
        ],
      );
      expect(candidate.correspondence.attribution).toEqual({
        authoritativeCapability: "knowledge",
      });
      expectExactFields(candidate.correspondence.issuance, []);
      expectExactFields(revision, [
        "lineageIdentity",
        "revisionIdentity",
        "revisionNumber",
        "lifecycleState",
        "creationMetadata",
        "fragments",
      ]);
      expectExactFields(revision.creationMetadata, [
        "createdAt",
        "sourceCount",
        "fragmentCount",
      ]);
      expectExactFields(revision.fragments[0], [
        "kind",
        "authoritativeOwner",
        "projection",
      ]);
      expect(revision.fragments[0].projection).toEqual({
        state: "anonymous",
        authoritativeOwner: "identity",
      });
      const fragment = revision.fragments[1];
      if (fragment?.kind !== "structured-knowledge")
        throw new Error("Expected structured Knowledge fragment.");
      expectExactFields(fragment, ["kind", "authoritativeOwner", "projection"]);
      expectExactFields(fragment.projection, [
        "semanticValue",
        "propositionIdentity",
        "knowledgeIdentity",
        "knowledgeVersion",
        "sourceOwnershipCorrespondence",
        "sourceCurrentnessCorrespondence",
        "attribution",
        "issuance",
        "underlyingSourceAuthority",
      ]);
      expect(fragment.projection.semanticValue).toEqual(
        candidate.semanticValue,
      );
      expect(fragment.projection.sourceOwnershipCorrespondence).toEqual(
        candidate.correspondence.sourceOwnershipCorrespondence,
      );
      expect(fragment.projection.attribution).toEqual({
        authoritativeCapability: "knowledge",
      });
      expect(fragment.projection.issuance).toBe(
        candidate.correspondence.issuance,
      );
      expectExactFields(fragment.projection.sourceCurrentnessCorrespondence, [
        "currentnessOwner",
        "correspondence",
      ]);
      for (const value of [currentness, candidate, revision]) {
        const serialized = JSON.stringify(value);
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
          "candidateClaim",
          "knowledgeRecord",
          "provenance",
          "retentionReason",
          "retainedAt",
          "retrievedAt",
          "retrievalPurpose",
          "retrievalReceipt",
          "lastUse",
          "embeddings",
          "databaseState",
          "verifierInternals",
          "authorityCaptureInternals",
        ]) {
          expect(serialized).not.toContain(`"${prohibited}"`);
        }
        expect(Object.isFrozen(value)).toBe(true);
      }
      expect(JSON.stringify(revision)).not.toContain(
        '"candidatePreparationAssociation"',
      );
      expect(JSON.stringify(revision)).not.toContain(
        '"contextPreparationSemanticScope"',
      );
      expect(revision.fragments.map(({ kind }) => kind)).toEqual([
        "identity",
        "structured-knowledge",
      ]);
      expect(revision.fragments[1]).toMatchObject({
        kind: "structured-knowledge",
        projection: {
          semanticValue: setup.relationship.semanticValue,
          propositionIdentity:
            setup.accepted.record.acceptedStructuredProposition
              ?.propositionIdentity,
          attribution: { authoritativeCapability: "knowledge" },
        },
      });
      expect(revision.lifecycleState).toBe("active");
      expect(revision.revisionIdentity).toBe("orion.context.revision.2");
      const active = runtime.getActiveContextRevision({
        lineageIdentity: revision.lineageIdentity,
      });
      expect(active).toBe(revision);
      expect(
        runtime.verifyActiveContextRevisionAuthority({
          intent: "verify-active-context-revision-authority",
          candidate: active,
          expectedLineageIdentity: active.lineageIdentity,
          expectedRevisionIdentity: active.revisionIdentity,
          expectedRevisionNumber: active.revisionNumber,
        }),
      ).toBe(active);
    } finally {
      await runtime.shutdown();
    }
  });

  it.each([
    { subjectKey: "other.preference", predicateKey: "theme" },
    { subjectKey: "user.preference", predicateKey: "other" },
  ])(
    "preserves no-applicable-candidate for mismatching scope $subjectKey/$predicateKey",
    async (scope) => {
      const project = vi.spyOn(
        KnowledgeEngine.prototype,
        "projectStructuredKnowledge",
      );
      const runtime = await composeFixedProfileBCapability();
      try {
        const setup = await establishPrerequisites(runtime);
        expect(() =>
          runtime.prepareContextRevisionWithStructuredKnowledge({
            ...setup.request,
            contextPreparationSemanticScope:
              createContextPreparationSemanticScope(scope),
          }),
        ).toThrow(NoApplicableStructuredKnowledgeCandidateError);
        expect(project).toHaveBeenCalledTimes(1);
        expect(project.mock.results[0]?.type).toBe("return");
        expect(project.mock.results[0]?.value.semanticValue).toEqual(
          setup.relationship.semanticValue,
        );
        expectNoActiveRevision(runtime);
        const revision = runtime.prepareContextRevisionWithStructuredKnowledge(
          setup.request,
        );
        expect(revision.lifecycleState).toBe("active");
        expect(revision.fragments.map(({ kind }) => kind)).toEqual([
          "identity",
          "structured-knowledge",
        ]);
      } finally {
        await runtime.shutdown();
      }
    },
  );

  it("preserves Memory NEGATIVE after Forget and prevents a new activation", async () => {
    const verifyMemory = vi.spyOn(
      MemoryEngine.prototype as VerifyMemorySourceAuthority,
      "verifyMemorySourceAuthority",
    );
    const project = vi.spyOn(
      KnowledgeEngine.prototype as ProjectStructuredKnowledge,
      "projectStructuredKnowledge",
    );
    const runtime = await composeFixedProfileBCapability();
    try {
      const setup = await establishPrerequisites(runtime);
      runtime.forgetMemory({
        intent: "forget",
        memoryIdentity: setup.retained.memoryIdentity,
      });
      expect(() =>
        runtime.prepareContextRevisionWithStructuredKnowledge(setup.request),
      ).toThrow(NoApplicableStructuredKnowledgeCandidateError);
      expect(verifyMemory).toHaveBeenCalledTimes(1);
      expect(verifyMemory.mock.results[0]?.value).toEqual({
        determination: "NEGATIVE",
      });
      expect(project).not.toHaveBeenCalled();
      expectNoActiveRevision(runtime);
    } finally {
      await runtime.shutdown();
    }
  });

  it("exposes single-flight, idempotent Knowledge shutdown and rejects further acceptance", async () => {
    const runtime = await composeFixedProfileBCapability();
    try {
      const setup = await establishPrerequisites(runtime);
      const first = runtime.shutdown();
      expect(runtime.shutdown()).toBe(first);
      await first;
      await expect(runtime.shutdown()).resolves.toBeUndefined();
      await expect(
        runtime.evaluateKnowledgeClaim(setup.acceptanceRequest),
      ).rejects.toThrow(InvalidKnowledgeStateError);
    } finally {
      await runtime.shutdown();
    }
  });
});
