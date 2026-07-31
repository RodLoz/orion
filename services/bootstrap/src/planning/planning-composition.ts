import type {
  CreateCandidatePlan,
  VerifyCandidatePlanAuthority,
} from "@orion/core";
import {
  PlanningEngine,
  type PlanningEngineLifecycleState,
} from "@orion/planning";

export interface PlanningCapabilityComposition {
  readonly createCandidatePlan: CreateCandidatePlan;
  readonly verifyCandidatePlanAuthority: VerifyCandidatePlanAuthority;
  readonly engineState: () => PlanningEngineLifecycleState;
}

export function composePlanningCapability(): PlanningCapabilityComposition {
  const engine = new PlanningEngine();
  engine.initialize();
  engine.start();
  const createCandidatePlan = engine.createCandidatePlan.bind(engine);
  const verifyCandidatePlanAuthority =
    engine.verifyCandidatePlanAuthority.bind(engine);
  return Object.freeze({
    createCandidatePlan: Object.freeze({
      createCandidatePlan,
    }),
    verifyCandidatePlanAuthority: Object.freeze({
      verifyCandidatePlanAuthority,
    }),
    engineState: () => engine.engineState,
  });
}
