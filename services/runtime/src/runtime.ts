import {
  composeBoundedApplicationCapability,
  type BoundedApplicationCapabilityComposition,
} from "@orion/bootstrap/dist/index.js";

type PreparationState =
  "not-prepared" | "preparing" | "ready" | "preparation-failed";
type PreparationInput = Parameters<
  BoundedApplicationCapabilityComposition["prepareContextRevisionWithStructuredKnowledge"]
>[0];
type BrainBinding = ReturnType<
  BoundedApplicationCapabilityComposition["composeBrain"]
>;
type PreparationRecord =
  | Readonly<{ state: "not-prepared" }>
  | Readonly<{ state: "preparing" }>
  | Readonly<{ state: "ready"; binding: BrainBinding }>
  | Readonly<{ state: "preparation-failed" }>;

// Internal application coordination; no package or transport entry point is added.
export async function createPreparationAdmission() {
  const composition = await composeBoundedApplicationCapability();
  let preparation: PreparationRecord = { state: "not-prepared" };

  return {
    get state(): PreparationState {
      return preparation.state;
    },

    begin(input: PreparationInput): void {
      if (preparation.state !== "not-prepared") {
        throw new Error("Preparation attempt already admitted");
      }

      preparation = { state: "preparing" };
      try {
        const revision =
          composition.prepareContextRevisionWithStructuredKnowledge(input);
        const binding = composition.composeBrain({
          contextLineageId: revision.lineageIdentity,
        });
        preparation = { state: "ready", binding };
      } catch (error: unknown) {
        preparation = { state: "preparation-failed" };
        throw error;
      }
    },
  };
}
