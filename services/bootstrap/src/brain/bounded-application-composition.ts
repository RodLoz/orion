import {
  composeBoundedReasoning3BrainCapability,
  type BrainCapabilityComposition,
} from "./brain-composition.js";
import { composeFixedProfileBCapability } from "../context/context-composition.js";

type FixedProfileBComposition = Awaited<
  ReturnType<typeof composeFixedProfileBCapability>
>;

export type BoundedBrainPreparation = Omit<
  Parameters<typeof composeBoundedReasoning3BrainCapability>[0],
  "context"
>;

export type BoundedApplicationCapabilityComposition =
  FixedProfileBComposition & {
    readonly composeBrain: (
      preparation: BoundedBrainPreparation,
    ) => BrainCapabilityComposition;
  };

/** Caller-owned preparation and execution; Bootstrap only assembles capabilities. */
export async function composeBoundedApplicationCapability(): Promise<BoundedApplicationCapabilityComposition> {
  const profileB = await composeFixedProfileBCapability();
  return Object.freeze({
    ...profileB,
    composeBrain: (preparation: BoundedBrainPreparation) =>
      composeBoundedReasoning3BrainCapability({
        contextLineageId: preparation.contextLineageId,
        context: profileB,
        ...(preparation.lifecycleObserver === undefined
          ? {}
          : { lifecycleObserver: preparation.lifecycleObserver }),
      }),
  });
}
