import {
  composeBoundedApplicationCapability,
  type BoundedApplicationCapabilityComposition,
} from "@orion/bootstrap/dist/index.js";
import {
  createContextPreparationSemanticScope,
  createMemoryKnowledgeSourceBinding,
  createMemorySourcePropositionTuple,
} from "@orion/core";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { createPreparationAdmission } from "../src/runtime.js";

type BootstrapCompositionExport = Readonly<{
  composeBoundedApplicationCapability: typeof composeBoundedApplicationCapability;
}>;

vi.mock("@orion/bootstrap/dist/index.js", async (importOriginal) => {
  const actual = await importOriginal<BootstrapCompositionExport>();
  return {
    ...actual,
    composeBoundedApplicationCapability: vi.fn(
      actual.composeBoundedApplicationCapability,
    ),
  };
});

type Composition = BoundedApplicationCapabilityComposition;
type PreparationInput = Parameters<
  Composition["prepareContextRevisionWithStructuredKnowledge"]
>[0];
type PreparationResult = ReturnType<
  Composition["prepareContextRevisionWithStructuredKnowledge"]
>;
const input = Object.freeze({
  target: { kind: "new-lineage" },
}) as PreparationInput;

function useMockComposition(lineageIdentity = "test-lineage") {
  const revision = { lineageIdentity } as PreparationResult;
  const prepare = vi.fn(() => revision);
  const bind = vi.fn(() => ({}) as ReturnType<Composition["composeBrain"]>);
  const composition = {
    prepareContextRevisionWithStructuredKnowledge: prepare,
    composeBrain: bind,
  } as unknown as Composition;
  vi.mocked(composeBoundedApplicationCapability).mockResolvedValue(composition);
  return { prepare, bind };
}

beforeEach(() => vi.mocked(composeBoundedApplicationCapability).mockReset());

describe("bounded runtime preparation", () => {
  it("acquires one C1 composition and forwards one explicit attempt from Not Prepared", async () => {
    const { prepare, bind } = useMockComposition();
    const admission = await createPreparationAdmission();
    expect(admission.state).toBe("not-prepared");
    expect(composeBoundedApplicationCapability).toHaveBeenCalledTimes(1);

    prepare.mockImplementationOnce(() => {
      expect(admission.state).toBe("preparing");
      expect(bind).not.toHaveBeenCalled();
      return { lineageIdentity: "test-lineage" } as PreparationResult;
    });
    admission.begin(input);

    expect(prepare).toHaveBeenCalledExactlyOnceWith(input);
    expect(bind).toHaveBeenCalledExactlyOnceWith({
      contextLineageId: "test-lineage",
    });
    expect(prepare.mock.invocationCallOrder[0]).toBeLessThan(
      bind.mock.invocationCallOrder[0]!,
    );
    expect(admission.state).toBe("ready");
    expect(() => admission.begin(input)).toThrow();
    expect(prepare).toHaveBeenCalledTimes(1);
    expect(bind).toHaveBeenCalledTimes(1);
    expect(admission.state).toBe("ready");
  });

  it("settles Context failure without binding, retry, or re-preparation", async () => {
    const { prepare, bind } = useMockComposition();
    const admission = await createPreparationAdmission();
    const failure = new Error("Context-origin failure");
    prepare.mockImplementationOnce(() => {
      expect(admission.state).toBe("preparing");
      throw failure;
    });

    let observed: unknown;
    try {
      admission.begin(input);
    } catch (error: unknown) {
      observed = error;
    }
    expect(observed).toBe(failure);
    expect(admission.state).toBe("preparation-failed");
    expect(bind).not.toHaveBeenCalled();
    expect(() => admission.begin(input)).toThrow();
    expect(prepare).toHaveBeenCalledTimes(1);
    expect(admission.state).toBe("preparation-failed");
  });

  it("settles Brain binding failure without retry or a second attempt", async () => {
    const { prepare, bind } = useMockComposition("exact-result-lineage");
    const admission = await createPreparationAdmission();
    const failure = new Error("Brain-origin failure");
    bind.mockImplementationOnce(() => {
      expect(admission.state).toBe("preparing");
      throw failure;
    });

    let observed: unknown;
    try {
      admission.begin(input);
    } catch (error: unknown) {
      observed = error;
    }
    expect(observed).toBe(failure);
    expect(bind).toHaveBeenCalledExactlyOnceWith({
      contextLineageId: "exact-result-lineage",
    });
    expect(admission.state).toBe("preparation-failed");
    expect(() => admission.begin(input)).toThrow();
    expect(prepare).toHaveBeenCalledTimes(1);
    expect(bind).toHaveBeenCalledTimes(1);
  });

  it("keeps preparation attempts independent between runtime instances", async () => {
    const { prepare } = useMockComposition();
    const first = await createPreparationAdmission();
    const second = await createPreparationAdmission();

    first.begin(input);
    expect(() => first.begin(input)).toThrow();
    expect(second.state).toBe("not-prepared");
    second.begin(input);
    expect(second.state).toBe("ready");
    expect(prepare).toHaveBeenCalledTimes(2);
    expect(composeBoundedApplicationCapability).toHaveBeenCalledTimes(2);
  });

  it("prepares and binds through the real fixed Profile B C1 path", async () => {
    const actual = await vi.importActual<BootstrapCompositionExport>(
      "@orion/bootstrap/dist/index.js",
    );
    let composition: Composition | undefined;
    vi.mocked(composeBoundedApplicationCapability).mockImplementation(
      async () => {
        composition = await actual.composeBoundedApplicationCapability();
        return composition;
      },
    );
    try {
      const admission = await createPreparationAdmission();
      const c1 = composition!;
      const retained = c1.retainMemory({
        intent: "retain",
        kind: "episodic",
        content: "Dark Theme",
        retentionReason: "Provide bounded preparation integration evidence.",
        provenance: {
          sourceType: "interaction",
          originatingCapability: "runtime-preparation-test",
          observedAt: "2026-09-01T00:00:00.000Z",
          occurrenceEvidence: "reported",
        },
      });
      const retrieved = c1.getMemory({
        memoryIdentity: retained.memoryIdentity,
        purpose: "continuity",
      });
      const relationship = c1.issueMemorySourceRelationship({
        sourceAttribution: { authoritativeCapability: "memory" },
        memoryReference: retrieved.receipt.memoryReference,
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
      const accepted = await c1.evaluateKnowledgeClaim({
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
          authorityIdentifier: "orion.runtime.preparation.test",
          decision: "accept",
          reason:
            "Accept the exact Memory-backed proposition for bounded evidence.",
        },
        provenance: {
          sourceType: "approved-internal-source",
          originatingCapability: "memory",
          observedAt: "2026-09-01T00:00:00.000Z",
        },
      });
      if (accepted.outcome !== "accepted") throw new Error("Setup failed");
      const request: PreparationInput = {
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
      };
      admission.begin(request);

      expect(admission.state).toBe("ready");
      expect(
        c1.getActiveContextRevision({
          lineageIdentity: "orion.context.lineage.1",
        }).lineageIdentity,
      ).toBe("orion.context.lineage.1");
      expect(() => admission.begin(request)).toThrow();
      expect(admission.state).toBe("ready");
    } finally {
      if (composition !== undefined) await composition.shutdown();
    }
  });
});
