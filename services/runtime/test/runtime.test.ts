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
  const cleanup = vi.fn<Composition["shutdown"]>().mockResolvedValue(undefined);
  const composition = {
    prepareContextRevisionWithStructuredKnowledge: prepare,
    composeBrain: bind,
    shutdown: cleanup,
  } as unknown as Composition;
  vi.mocked(composeBoundedApplicationCapability).mockResolvedValue(composition);
  return { prepare, bind, orchestrate, cleanup };
}

beforeEach(() => vi.mocked(composeBoundedApplicationCapability).mockReset());

type Runtime = Awaited<ReturnType<typeof createPreparationAdmission>>;

function controlledCleanup() {
  let resolve!: () => void;
  let reject!: (failure: unknown) => void;
  const promise = new Promise<void>((onSuccess, onFailure) => {
    resolve = onSuccess;
    reject = onFailure;
  });
  return { promise, resolve, reject };
}

function expectClosed(runtime: Runtime) {
  const state = runtime.state;
  expect(() => runtime.begin(input)).toThrow();
  expect(() => runtime.admitTurn()).toThrow();
  expect(runtime.state).toBe(state);
}

function observeShutdown(runtime: Runtime, completion: Promise<void>) {
  return completion.then(
    (value) => {
      expect(runtime.state).toBe("terminal-closed");
      expect(value).toBeUndefined();
      expectClosed(runtime);
      return { outcome: "success" as const };
    },
    (failure: unknown) => {
      expect(runtime.state).toBe("terminal-closed");
      expectClosed(runtime);
      return { outcome: "failure" as const, failure };
    },
  );
}

describe("bounded shutdown and cleanup coordination", () => {
  const request = createNormalizedCognitiveRequest({
    intent: "orchestrate-cognitive-request",
    requestId: "runtime-shutdown-turn",
    contextLineageId: "test-lineage",
    query: {
      kind: "exact-text-attribute-value",
      subjectKey: "user.preference",
      predicateKey: "theme",
    },
    executionIntent: { kind: "none" },
  });
  const result = createFinalCognitiveResult({
    status: "completed",
    kind: "request-more-context",
    requestId: request.requestId,
    reason: "planning-requested-more-context",
  });
  const cleanupForms = ["success", "reject", "throw"] as const;

  it.each(["not-prepared", "ready", "context-failed", "binding-failed"])(
    "closes %s immediately and delegates one cleanup even with reentrant shutdown",
    async (initial) => {
      const { prepare, bind, cleanup, orchestrate } = useMockComposition();
      const runtime = await createPreparationAdmission();
      const control = controlledCleanup();
      if (initial.endsWith("failed")) {
        const fail = () => {
          throw new Error("preparation");
        };
        if (initial === "context-failed") prepare.mockImplementationOnce(fail);
        else bind.mockImplementationOnce(fail);
        expect(() => runtime.begin(input)).toThrow();
        expect(runtime.state).toBe("preparation-failed");
      } else if (initial === "ready") {
        expect(runtime.begin(input)).toBeUndefined();
      }
      const observers: ReturnType<typeof observeShutdown>[] = [];
      cleanup.mockImplementation(() => {
        expect(runtime.state).toBe("cleanup-in-progress");
        expectClosed(runtime);
        observers.push(observeShutdown(runtime, runtime.shutdown()));
        return control.promise;
      });
      observers.push(observeShutdown(runtime, runtime.shutdown()));
      expect(runtime.state).toBe("cleanup-in-progress");
      expectClosed(runtime);
      expect(() => runtime.executeTurn(request)).toThrow();
      observers.push(observeShutdown(runtime, runtime.shutdown()));
      expect(cleanup).toHaveBeenCalledTimes(1);
      control.resolve();
      for (const observer of observers)
        expect(await observer).toEqual({ outcome: "success" });
      expect(await observeShutdown(runtime, runtime.shutdown())).toEqual({
        outcome: "success",
      });
      expect(cleanup).toHaveBeenCalledTimes(1);
      expect(orchestrate).not.toHaveBeenCalled();
      expect(prepare).toHaveBeenCalledTimes(initial === "not-prepared" ? 0 : 1);
      expect(bind).toHaveBeenCalledTimes(
        initial === "not-prepared" || initial === "context-failed" ? 0 : 1,
      );
      expect(() => runtime.executeTurn(request)).toThrow();
    },
  );

  for (const stage of ["context", "binding"] as const) {
    for (const operationFails of [false, true]) {
      it.each(cleanupForms)(
        `${stage} reentrant shutdown: preparation ${operationFails ? "fails" : "succeeds"}, cleanup %s`,
        async (cleanupForm) => {
          const { prepare, bind, cleanup, orchestrate } = useMockComposition();
          const runtime = await createPreparationAdmission();
          const control = controlledCleanup();
          const operationFailure = Object.freeze({ origin: "preparation" });
          const cleanupFailure = Object.freeze({ origin: "cleanup" });
          const events: string[] = [];
          const observers: ReturnType<typeof observeShutdown>[] = [];
          const revision = prepare.getMockImplementation()!();
          const binding = bind.getMockImplementation()!();
          const requestShutdown = () => {
            expect(runtime.state).toBe("preparing");
            observers.push(observeShutdown(runtime, runtime.shutdown()));
            expect(runtime.state).toBe("admission-closed");
            expectClosed(runtime);
            expect(() => runtime.executeTurn(request)).toThrow();
            observers.push(observeShutdown(runtime, runtime.shutdown()));
            expect(cleanup).not.toHaveBeenCalled();
          };
          prepare.mockImplementation(() => {
            events.push("context");
            if (stage === "context") {
              requestShutdown();
              if (operationFails) {
                events.push("operation-throw");
                throw operationFailure;
              }
            }
            return revision;
          });
          bind.mockImplementation(() => {
            events.push("binding");
            if (stage === "binding") requestShutdown();
            expect(runtime.state).toBe("admission-closed");
            expect(cleanup).not.toHaveBeenCalled();
            if (operationFails) {
              events.push("operation-throw");
              throw operationFailure;
            }
            events.push("operation-return");
            return binding;
          });
          cleanup.mockImplementation(() => {
            expect(runtime.state).toBe("cleanup-in-progress");
            expect(events.at(-1)).toBe(
              operationFails ? "operation-throw" : "operation-return",
            );
            events.push("cleanup");
            expectClosed(runtime);
            observers.push(observeShutdown(runtime, runtime.shutdown()));
            if (cleanupForm === "throw") throw cleanupFailure;
            return control.promise;
          });
          if (operationFails) {
            let caught = false;
            try {
              runtime.begin(input);
            } catch (failure: unknown) {
              caught = true;
              expect(failure).toBe(operationFailure);
            }
            expect(caught).toBe(true);
          } else {
            // Direct return assertion proves begin did not become asynchronous.
            expect(runtime.begin(input)).toBeUndefined();
          }
          expect(prepare).toHaveBeenCalledExactlyOnceWith(input);
          expect(bind).toHaveBeenCalledTimes(
            stage === "context" && operationFails ? 0 : 1,
          );
          expect(orchestrate).not.toHaveBeenCalled();
          expect(cleanup).toHaveBeenCalledTimes(1);
          expect(runtime.state).toBe(
            cleanupForm === "throw" ? "terminal-closed" : "cleanup-in-progress",
          );
          expectClosed(runtime);
          observers.push(observeShutdown(runtime, runtime.shutdown()));
          if (cleanupForm === "success") control.resolve();
          else if (cleanupForm === "reject") control.reject(cleanupFailure);
          for (const observer of observers) {
            const observed = await observer;
            if (cleanupForm === "success")
              expect(observed).toEqual({ outcome: "success" });
            else {
              expect(observed.outcome).toBe("failure");
              if (observed.outcome === "failure")
                expect(observed.failure).toBe(cleanupFailure);
            }
          }
          const later = await observeShutdown(runtime, runtime.shutdown());
          expect(later.outcome).toBe(
            cleanupForm === "success" ? "success" : "failure",
          );
          if (later.outcome === "failure")
            expect(later.failure).toBe(cleanupFailure);
          expect(cleanup).toHaveBeenCalledTimes(1);
          expect(prepare).toHaveBeenCalledTimes(1);
          expect(bind).toHaveBeenCalledTimes(
            stage === "context" && operationFails ? 0 : 1,
          );
          expect(() => runtime.executeTurn(request)).toThrow();
        },
      );
    }
  }

  for (const timing of ["before-execution", "during-execution"] as const) {
    for (const operationFails of [false, true]) {
      it.each(cleanupForms)(
        `${timing}: turn ${operationFails ? "fails" : "succeeds"}, cleanup %s`,
        async (cleanupForm) => {
          const { cleanup, orchestrate, prepare, bind } = useMockComposition();
          const runtime = await createPreparationAdmission();
          runtime.begin(input);
          expect(runtime.admitTurn()).toBeUndefined();
          const control = controlledCleanup();
          const failure = Object.freeze({ origin: "turn" });
          const cleanupFailure = Object.freeze({ origin: "cleanup" });
          const observers: ReturnType<typeof observeShutdown>[] = [];
          let operationSettled = false;
          const close = () => {
            observers.push(observeShutdown(runtime, runtime.shutdown()));
            expect(runtime.state).toBe("admission-closed");
            expectClosed(runtime);
            observers.push(observeShutdown(runtime, runtime.shutdown()));
            expect(cleanup).not.toHaveBeenCalled();
          };
          cleanup.mockImplementation(() => {
            expect(operationSettled).toBe(true);
            expect(runtime.state).toBe("cleanup-in-progress");
            expectClosed(runtime);
            observers.push(observeShutdown(runtime, runtime.shutdown()));
            if (cleanupForm === "throw") throw cleanupFailure;
            return control.promise;
          });
          if (timing === "before-execution") {
            close();
            let shutdownObserved = false;
            void observers[0]!.then(() => {
              shutdownObserved = true;
            });
            await Promise.resolve();
            await Promise.resolve();
            expect(shutdownObserved).toBe(false);
            expect(runtime.state).toBe("admission-closed");
            expect(orchestrate).not.toHaveBeenCalled();
            expect(cleanup).not.toHaveBeenCalled();
          }
          orchestrate.mockImplementation((received) => {
            expect(received).toBe(request);
            expect(received.query).toBe(request.query);
            if (timing === "during-execution") {
              expect(runtime.state).toBe("turn-in-progress");
              close();
            }
            expect(runtime.state).toBe("admission-closed");
            expectClosed(runtime);
            expect(() => runtime.executeTurn(request)).toThrow();
            expect(cleanup).not.toHaveBeenCalled();
            operationSettled = true;
            if (operationFails) throw failure;
            return result;
          });
          if (operationFails) {
            let caught = false;
            try {
              runtime.executeTurn(request);
            } catch (observed: unknown) {
              caught = true;
              expect(observed).toBe(failure);
            }
            expect(caught).toBe(true);
          } else expect(runtime.executeTurn(request)).toBe(result);
          expect(orchestrate).toHaveBeenCalledTimes(1);
          expect(orchestrate.mock.calls[0]).toHaveLength(1);
          expect(orchestrate.mock.calls[0]![0]).toBe(request);
          expect(() => runtime.executeTurn(request)).toThrow();
          expectClosed(runtime);
          expect(runtime.state).toBe(
            cleanupForm === "throw" ? "terminal-closed" : "cleanup-in-progress",
          );
          observers.push(observeShutdown(runtime, runtime.shutdown()));
          if (cleanupForm === "success") control.resolve();
          else if (cleanupForm === "reject") control.reject(cleanupFailure);
          for (const observer of observers) {
            const observed = await observer;
            expect(observed.outcome).toBe(
              cleanupForm === "success" ? "success" : "failure",
            );
            if (observed.outcome === "failure")
              expect(observed.failure).toBe(cleanupFailure);
          }
          const later = await observeShutdown(runtime, runtime.shutdown());
          expect(later.outcome).toBe(
            cleanupForm === "success" ? "success" : "failure",
          );
          if (later.outcome === "failure")
            expect(later.failure).toBe(cleanupFailure);
          expect(cleanup).toHaveBeenCalledTimes(1);
          expect(orchestrate).toHaveBeenCalledTimes(1);
          expect(prepare).toHaveBeenCalledTimes(1);
          expect(bind).toHaveBeenCalledTimes(1);
          expect(() => runtime.executeTurn(request)).toThrow();
        },
      );
    }
  }

  it("leaves an unexecuted admission pending without starting work or cleanup", async () => {
    const { cleanup, orchestrate } = useMockComposition();
    const runtime = await createPreparationAdmission();
    runtime.begin(input);
    runtime.admitTurn();
    let observed = false;
    void runtime.shutdown().then(() => {
      observed = true;
    });
    await Promise.resolve();
    await Promise.resolve();
    expect(observed).toBe(false);
    expect(runtime.state).toBe("admission-closed");
    expectClosed(runtime);
    expect(cleanup).not.toHaveBeenCalled();
    expect(orchestrate).not.toHaveBeenCalled();
    // No timers or resources are associated with this deliberately pending turn.
  });

  it("does not cancel preserved work or cleanup when the first Promise is ignored", async () => {
    const { cleanup, orchestrate } = useMockComposition();
    const runtime = await createPreparationAdmission();
    const control = controlledCleanup();
    cleanup.mockReturnValue(control.promise);
    runtime.begin(input);
    runtime.admitTurn();
    void runtime.shutdown();
    expect(runtime.state).toBe("admission-closed");
    orchestrate.mockReturnValue(result);
    expect(runtime.executeTurn(request)).toBe(result);
    expect(runtime.state).toBe("cleanup-in-progress");
    control.resolve();
    expect(await observeShutdown(runtime, runtime.shutdown())).toEqual({
      outcome: "success",
    });
    expect(cleanup).toHaveBeenCalledTimes(1);
    expect(orchestrate).toHaveBeenCalledTimes(1);
  });

  it("keeps shutdown completion, cleanup failure, and preserved admissions instance-local", async () => {
    const firstMocks = useMockComposition();
    const first = await createPreparationAdmission();
    const secondMocks = useMockComposition("second-lineage");
    const second = await createPreparationAdmission();
    const control = controlledCleanup();
    const failure = new Error("first cleanup");
    firstMocks.cleanup.mockReturnValue(control.promise);
    first.begin(input);
    first.admitTurn();
    const firstDone = observeShutdown(first, first.shutdown());
    expect(second.state).toBe("not-prepared");
    second.begin(input);
    second.admitTurn();
    firstMocks.orchestrate.mockReturnValue(result);
    expect(first.executeTurn(request)).toBe(result);
    control.reject(failure);
    const observed = await firstDone;
    expect(observed.outcome).toBe("failure");
    if (observed.outcome === "failure") expect(observed.failure).toBe(failure);
    expect(second.state).toBe("turn-in-progress");
    expect(secondMocks.cleanup).not.toHaveBeenCalled();
    secondMocks.orchestrate.mockReturnValue(result);
    expect(second.executeTurn(request)).toBe(result);
    expect(second.state).toBe("ready");
    await second.shutdown();
    expect(first.state).toBe("terminal-closed");
    expect(second.state).toBe("terminal-closed");
    expect(firstMocks.cleanup).toHaveBeenCalledTimes(1);
    expect(secondMocks.cleanup).toHaveBeenCalledTimes(1);
    expect(firstMocks.orchestrate).toHaveBeenCalledTimes(1);
    expect(secondMocks.orchestrate).toHaveBeenCalledTimes(1);
  });
});

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
      await admission.shutdown();
      expect(admission.state).toBe("terminal-closed");
      expect(() => admission.begin(request)).toThrow();
      expect(() => admission.admitTurn()).toThrow();
      await admission.shutdown();
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
