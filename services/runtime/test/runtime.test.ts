import {
  composeBoundedApplicationCapability,
  type BoundedApplicationCapabilityComposition,
} from "@orion/bootstrap/dist/index.js";
import {
  createContextPreparationSemanticScope,
  createMemoryKnowledgeSourceBinding,
  createMemorySourcePropositionTuple,
  createNormalizedCognitiveRequest,
  createFinalCognitiveResult,
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
type BrainBinding = ReturnType<Composition["composeBrain"]>;
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
  const orchestrate = vi.fn<BrainBinding["orchestrateCognitiveRequest"]>();
  const binding = {
    orchestrateCognitiveRequest: orchestrate,
  } as ReturnType<Composition["composeBrain"]>;
  const bind = vi.fn(() => binding);
  const composition = {
    prepareContextRevisionWithStructuredKnowledge: prepare,
    composeBrain: bind,
  } as unknown as Composition;
  vi.mocked(composeBoundedApplicationCapability).mockResolvedValue(composition);
  return { prepare, bind, orchestrate };
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

  it("rejects turn admission before Ready without changing state", async () => {
    useMockComposition();
    const admission = await createPreparationAdmission();

    expect(() => admission.admitTurn()).toThrow();
    expect(admission.state).toBe("not-prepared");
  });

  it("admits one explicit turn from Ready without executing Brain", async () => {
    const { orchestrate } = useMockComposition();
    const admission = await createPreparationAdmission();
    admission.begin(input);
    expect(admission.state).toBe("ready");

    admission.admitTurn();

    expect(admission.state).toBe("turn-in-progress");
    expect(orchestrate).not.toHaveBeenCalled();
    expect(() => admission.admitTurn()).toThrow();
    expect(admission.state).toBe("turn-in-progress");
    expect(orchestrate).not.toHaveBeenCalled();
  });

  it("keeps turn admission independent between runtime instances", async () => {
    useMockComposition();
    const first = await createPreparationAdmission();
    const second = await createPreparationAdmission();
    first.begin(input);
    second.begin(input);

    first.admitTurn();

    expect(first.state).toBe("turn-in-progress");
    expect(second.state).toBe("ready");
    second.admitTurn();
    expect(second.state).toBe("turn-in-progress");
  });

  it("prepares, binds, and executes through the real fixed Profile B C1 path", async () => {
    const actual = await vi.importActual<BootstrapCompositionExport>(
      "@orion/bootstrap/dist/index.js",
    );
    let composition: Composition | undefined;
    const execute = vi.fn<BrainBinding["orchestrateCognitiveRequest"]>();
    const bind = vi.fn(
      (preparation: Parameters<Composition["composeBrain"]>[0]) => {
        const binding = composition!.composeBrain(preparation);
        execute.mockImplementation(binding.orchestrateCognitiveRequest);
        return { ...binding, orchestrateCognitiveRequest: execute };
      },
    );
    vi.mocked(composeBoundedApplicationCapability).mockImplementation(
      async () => {
        composition = await actual.composeBoundedApplicationCapability();
        return { ...composition, composeBrain: bind };
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

      const cognitiveRequest = createNormalizedCognitiveRequest({
        intent: "orchestrate-cognitive-request",
        requestId: "runtime-c1-turn",
        contextLineageId: "orion.context.lineage.1",
        query: {
          kind: "exact-text-attribute-value",
          subjectKey: "user.preference",
          predicateKey: "theme",
        },
        executionIntent: { kind: "none" },
      });
      for (let turn = 1; turn <= 2; turn++) {
        expect(() => admission.executeTurn(cognitiveRequest)).toThrow();
        expect(execute).toHaveBeenCalledTimes(turn - 1);
        admission.admitTurn();
        const result = admission.executeTurn(cognitiveRequest);
        expect(admission.state).toBe("ready");
        expect(execute).toHaveBeenCalledTimes(turn);
        expect(execute.mock.calls[turn - 1]![0]).toBe(cognitiveRequest);
        expect(execute.mock.calls[turn - 1]).toHaveLength(1);
        expect(result).toBe(execute.mock.results[turn - 1]!.value);
        expect(result).toEqual({
          status: "completed",
          kind: "request-more-context",
          requestId: cognitiveRequest.requestId,
          reason: "planning-requested-more-context",
        });
      }
      expect(bind).toHaveBeenCalledExactlyOnceWith({
        contextLineageId: cognitiveRequest.contextLineageId,
      });
      expect(composeBoundedApplicationCapability).toHaveBeenCalledTimes(1);
    } finally {
      if (composition !== undefined) await composition.shutdown();
    }
  });
});

describe("bounded synchronous turn execution and settlement", () => {
  const request = createNormalizedCognitiveRequest({
    intent: "orchestrate-cognitive-request",
    requestId: "runtime-turn",
    contextLineageId: "test-lineage",
    query: {
      kind: "exact-text-attribute-value",
      subjectKey: "user.preference",
      predicateKey: "theme",
    },
    executionIntent: { kind: "none" },
  });
  // Test double output only; Runtime must never construct a Brain result.
  const result = createFinalCognitiveResult({
    status: "completed",
    kind: "request-more-context",
    requestId: request.requestId,
    reason: "planning-requested-more-context",
  });

  it("rejects execution before preparation, during preparation, and before admission", async () => {
    const { prepare, bind, orchestrate } = useMockComposition();
    const runtime = await createPreparationAdmission();
    expect(() => runtime.executeTurn(request)).toThrow();
    expect(runtime.state).toBe("not-prepared");
    prepare.mockImplementationOnce(() => {
      expect(() => runtime.executeTurn(request)).toThrow();
      expect(() => runtime.admitTurn()).toThrow();
      expect(runtime.state).toBe("preparing");
      return { lineageIdentity: "test-lineage" } as PreparationResult;
    });
    runtime.begin(input);
    expect(() => runtime.executeTurn(request)).toThrow();
    expect(runtime.state).toBe("ready");
    expect(orchestrate).not.toHaveBeenCalled();
    expect(prepare).toHaveBeenCalledTimes(1);
    expect(bind).toHaveBeenCalledTimes(1);
  });

  it.each(["context", "binding"] as const)(
    "rejects execution and re-preparation after %s preparation failure",
    async (stage) => {
      const { prepare, bind, orchestrate } = useMockComposition();
      const runtime = await createPreparationAdmission();
      const fail = () => {
        throw new Error("Preparation failed");
      };
      if (stage === "context") prepare.mockImplementationOnce(fail);
      else bind.mockImplementationOnce(fail);
      expect(() => runtime.begin(input)).toThrow();
      expect(() => runtime.executeTurn(request)).toThrow();
      expect(() => runtime.admitTurn()).toThrow();
      expect(() => runtime.begin(input)).toThrow();
      expect(runtime.state).toBe("preparation-failed");
      expect(orchestrate).not.toHaveBeenCalled();
      expect(prepare).toHaveBeenCalledTimes(1);
      expect(bind).toHaveBeenCalledTimes(stage === "context" ? 0 : 1);
    },
  );

  it("forwards exact objects once, rejects reentrancy, and settles before synchronous return", async () => {
    const { prepare, bind, orchestrate } = useMockComposition();
    const runtime = await createPreparationAdmission();
    runtime.begin(input);
    const query = request.query;
    const executionIntent = request.executionIntent;
    orchestrate.mockImplementation((received) => {
      expect(received).toBe(request);
      expect(received.query).toBe(query);
      expect(received.executionIntent).toBe(executionIntent);
      expect(runtime.state).toBe("turn-in-progress");
      expect(() => runtime.admitTurn()).toThrow();
      expect(runtime.state).toBe("turn-in-progress");
      expect(() => runtime.executeTurn(request)).toThrow();
      expect(runtime.state).toBe("turn-in-progress");
      expect(() => runtime.begin(input)).toThrow();
      expect(runtime.state).toBe("turn-in-progress");
      return result;
    });

    for (let turn = 1; turn <= 2; turn++) {
      expect(() => runtime.executeTurn(request)).toThrow();
      runtime.admitTurn();
      expect(orchestrate).toHaveBeenCalledTimes(turn - 1);
      const observed = runtime.executeTurn(request);
      expect(runtime.state).toBe("ready");
      expect(observed).toBe(result);
      expect(orchestrate).toHaveBeenCalledTimes(turn);
      expect(orchestrate.mock.calls[turn - 1]).toHaveLength(1);
      expect(orchestrate.mock.calls[turn - 1]![0]).toBe(request);
      expect(() => runtime.executeTurn(request)).toThrow();
      expect(() => runtime.begin(input)).toThrow();
      expect(runtime.state).toBe("ready");
      expect(orchestrate).toHaveBeenCalledTimes(turn);
    }
    expect(prepare).toHaveBeenCalledTimes(1);
    expect(bind).toHaveBeenCalledTimes(1);
    expect(composeBoundedApplicationCapability).toHaveBeenCalledTimes(1);
  });

  it.each([
    new Error("Originating Brain failure"),
    Object.freeze({ originatingFailure: "opaque value" }),
    "originating thrown string",
    null,
    undefined,
  ])(
    "settles before surfacing the exact thrown value (%#)",
    async (failure) => {
      const { prepare, bind, orchestrate } = useMockComposition();
      const runtime = await createPreparationAdmission();
      runtime.begin(input);
      runtime.admitTurn();
      orchestrate.mockImplementationOnce((received) => {
        expect(received).toBe(request);
        expect(runtime.state).toBe("turn-in-progress");
        expect(() => runtime.admitTurn()).toThrow();
        expect(() => runtime.executeTurn(request)).toThrow();
        expect(runtime.state).toBe("turn-in-progress");
        throw failure;
      });
      let caught = false;
      try {
        runtime.executeTurn(request);
      } catch (observed: unknown) {
        caught = true;
        expect(runtime.state).toBe("ready");
        expect(observed).toBe(failure);
      }
      expect(caught).toBe(true);
      expect(orchestrate).toHaveBeenCalledTimes(1);
      expect(orchestrate.mock.calls[0]).toHaveLength(1);
      expect(() => runtime.executeTurn(request)).toThrow();
      expect(() => runtime.begin(input)).toThrow();
      expect(runtime.state).toBe("ready");
      expect(orchestrate).toHaveBeenCalledTimes(1);

      orchestrate.mockReturnValueOnce(result);
      runtime.admitTurn();
      const observed = runtime.executeTurn(request);
      expect(runtime.state).toBe("ready");
      expect(observed).toBe(result);
      expect(orchestrate).toHaveBeenCalledTimes(2);
      expect(orchestrate.mock.calls[1]![0]).toBe(request);
      expect(() => runtime.executeTurn(request)).toThrow();
      expect(orchestrate).toHaveBeenCalledTimes(2);
      expect(prepare).toHaveBeenCalledTimes(1);
      expect(bind).toHaveBeenCalledTimes(1);
    },
  );

  it("keeps execution, settlement, and retained bindings independent per instance", async () => {
    const firstComposition = useMockComposition();
    const first = await createPreparationAdmission();
    const secondComposition = useMockComposition();
    const second = await createPreparationAdmission();
    first.begin(input);
    second.begin(input);
    first.admitTurn();
    second.admitTurn();
    const failure = new Error("First instance failure");
    firstComposition.orchestrate.mockImplementationOnce(() => {
      expect(first.state).toBe("turn-in-progress");
      expect(second.state).toBe("turn-in-progress");
      throw failure;
    });
    expect(() => first.executeTurn(request)).toThrow(failure);
    expect(first.state).toBe("ready");
    expect(second.state).toBe("turn-in-progress");
    expect(secondComposition.orchestrate).not.toHaveBeenCalled();
    secondComposition.orchestrate.mockImplementationOnce(() => {
      expect(second.state).toBe("turn-in-progress");
      expect(first.state).toBe("ready");
      return result;
    });
    expect(second.executeTurn(request)).toBe(result);
    expect(second.state).toBe("ready");
    expect(first.state).toBe("ready");
    expect(firstComposition.orchestrate).toHaveBeenCalledTimes(1);
    expect(secondComposition.orchestrate).toHaveBeenCalledTimes(1);
    expect(firstComposition.bind).toHaveBeenCalledTimes(1);
    expect(secondComposition.bind).toHaveBeenCalledTimes(1);
  });
});
