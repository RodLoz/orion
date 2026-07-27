import type {
  DiscoverSkills,
  GetRegisteredSkill,
  RegisterSkillManifest,
} from "@orion/core";
import { SkillEngine, type SkillEngineLifecycleState } from "@orion/skill";

export interface SkillCapabilityComposition {
  readonly registerSkillManifest: RegisterSkillManifest;
  readonly getRegisteredSkill: GetRegisteredSkill;
  readonly discoverSkills: DiscoverSkills;
  readonly engineState: () => SkillEngineLifecycleState;
}

export function composeSkillCapability(): SkillCapabilityComposition {
  const engine = new SkillEngine();
  engine.initialize();
  engine.start();
  return Object.freeze({
    registerSkillManifest: engine,
    getRegisteredSkill: engine,
    discoverSkills: engine,
    engineState: () => engine.engineState,
  });
}
