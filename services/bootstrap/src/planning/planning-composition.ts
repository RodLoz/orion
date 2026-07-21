import type { CreateCandidatePlan } from "@orion/core";
import {
  PlanningEngine,
  type PlanningEngineLifecycleState,
} from "@orion/planning";

export interface PlanningCapabilityComposition {
  readonly createCandidatePlan: CreateCandidatePlan;
  readonly engineState: () => PlanningEngineLifecycleState;
}

export function composePlanningCapability(): PlanningCapabilityComposition {
  const engine = new PlanningEngine();
  engine.initialize();
  engine.start();
  return Object.freeze({
    createCandidatePlan: engine,
    engineState: () => engine.engineState,
  });
}
