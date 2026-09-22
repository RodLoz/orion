import {
  composeBoundedApplicationCapability,
  type BoundedApplicationCapabilityComposition,
} from "@orion/bootstrap/dist/index.js";

type RuntimeState =
  | "not-prepared"
  | "preparing"
  | "ready"
  | "preparation-failed"
  | "turn-in-progress"
  | "admission-closed"
  | "cleanup-in-progress"
  | "terminal-closed";
type PreparationInput = Parameters<
  BoundedApplicationCapabilityComposition["prepareContextRevisionWithStructuredKnowledge"]
>[0];
type BrainBinding = ReturnType<
  BoundedApplicationCapabilityComposition["composeBrain"]
>;
type RuntimeRecord =
  | Readonly<{ state: "not-prepared" }>
  | Readonly<{ state: "preparing" }>
  | Readonly<{ state: "ready"; binding: BrainBinding }>
  | Readonly<{ state: "preparation-failed" }>
  | Readonly<{ state: "cleanup-in-progress" | "terminal-closed" }>
  | Readonly<{
      state: "turn-in-progress";
      binding: BrainBinding;
      executionStarted: boolean;
    }>;

// Internal application coordination; no package or transport entry point is added.
export async function createPreparationAdmission() {
  const composition = await composeBoundedApplicationCapability();
  let runtime: RuntimeRecord = { state: "not-prepared" };
  let shutdownCompletion:
    | {
        promise: Promise<void>;
        resolve: () => void;
        reject: (failure: unknown) => void;
      }
    | undefined;

  // Called only with no outstanding work, or after its synchronous settlement.
  function beginCleanup(): void {
    const completion = shutdownCompletion;
    if (
      completion === undefined ||
      runtime.state === "cleanup-in-progress" ||
      runtime.state === "terminal-closed"
    ) {
      return;
    }
    runtime = { state: "cleanup-in-progress" };
    const fail = (failure: unknown): void => {
      runtime = { state: "terminal-closed" };
      completion.reject(failure);
    };
    try {
      void composition.shutdown().then(() => {
        runtime = { state: "terminal-closed" };
        completion.resolve();
      }, fail);
    } catch (failure: unknown) {
      // Cleanup failure belongs to shutdown, never to begin/executeTurn.
      fail(failure);
    }
  }

  return {
    get state(): RuntimeState {
      if (
        shutdownCompletion !== undefined &&
        runtime.state !== "cleanup-in-progress" &&
        runtime.state !== "terminal-closed"
      ) {
        return "admission-closed";
      }
      return runtime.state;
    },

    shutdown(): Promise<void> {
      if (shutdownCompletion === undefined) {
        let resolve!: () => void;
        let reject!: (failure: unknown) => void;
        const promise = new Promise<void>((onSuccess, onFailure) => {
          resolve = onSuccess;
          reject = onFailure;
        });
        // Retain completion before delegation, including reentrant shutdown.
        shutdownCompletion = { promise, resolve, reject };
        if (
          runtime.state !== "preparing" &&
          runtime.state !== "turn-in-progress"
        ) {
          beginCleanup();
        }
      }
      return shutdownCompletion.promise;
    },

    begin(input: PreparationInput): void {
      if (
        shutdownCompletion !== undefined ||
        runtime.state !== "not-prepared"
      ) {
        throw new Error("Preparation attempt already admitted");
      }

      runtime = { state: "preparing" };
      try {
        const revision =
          composition.prepareContextRevisionWithStructuredKnowledge(input);
        const binding = composition.composeBrain({
          contextLineageId: revision.lineageIdentity,
        });
        if (shutdownCompletion === undefined)
          runtime = { state: "ready", binding };
      } catch (error: unknown) {
        if (shutdownCompletion === undefined)
          runtime = { state: "preparation-failed" };
        throw error;
      } finally {
        beginCleanup();
      }
    },

    admitTurn(): void {
      if (shutdownCompletion !== undefined || runtime.state !== "ready") {
        throw new Error("Runtime is not ready to admit a turn");
      }

      runtime = {
        state: "turn-in-progress",
        binding: runtime.binding,
        executionStarted: false,
      };
    },

    executeTurn(
      request: Parameters<BrainBinding["orchestrateCognitiveRequest"]>[0],
    ): ReturnType<BrainBinding["orchestrateCognitiveRequest"]> {
      if (runtime.state !== "turn-in-progress" || runtime.executionStarted) {
        throw new Error("Runtime has no admitted turn awaiting execution");
      }

      const binding = runtime.binding;
      // Consume this admission before calling Brain, including reentrant calls.
      runtime = { state: "turn-in-progress", binding, executionStarted: true };
      try {
        return binding.orchestrateCognitiveRequest(request);
      } finally {
        // Synchronous settlement precedes observation of either return or throw.
        if (shutdownCompletion === undefined)
          runtime = { state: "ready", binding };
        beginCleanup();
      }
    },
  };
}
