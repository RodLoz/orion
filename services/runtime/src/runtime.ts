import {
  composeBoundedApplicationCapability,
  type BoundedApplicationCapabilityComposition,
} from "@orion/bootstrap/dist/index.js";

type RuntimeState =
  | "not-prepared"
  | "preparing"
  | "ready"
  | "preparation-failed"
  | "turn-in-progress";
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
  | Readonly<{ state: "turn-in-progress"; binding: BrainBinding }>;

// Internal application coordination; no package or transport entry point is added.
export async function createPreparationAdmission() {
  const composition = await composeBoundedApplicationCapability();
  let runtime: RuntimeRecord = { state: "not-prepared" };

  return {
    get state(): RuntimeState {
      return runtime.state;
    },

    begin(input: PreparationInput): void {
      if (runtime.state !== "not-prepared") {
        throw new Error("Preparation attempt already admitted");
      }

      runtime = { state: "preparing" };
      try {
        const revision =
          composition.prepareContextRevisionWithStructuredKnowledge(input);
        const binding = composition.composeBrain({
          contextLineageId: revision.lineageIdentity,
        });
        runtime = { state: "ready", binding };
      } catch (error: unknown) {
        runtime = { state: "preparation-failed" };
        throw error;
      }
    },

    admitTurn(): void {
      if (runtime.state !== "ready") {
        throw new Error("Runtime is not ready to admit a turn");
      }

      runtime = { state: "turn-in-progress", binding: runtime.binding };
    },
  };
}
