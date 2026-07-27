import type {
  RegisteredSkill,
  SkillCapabilityIdentifier,
  SkillDiscoveryResult,
  SkillIdentifier,
  SkillManifest,
} from "./skill.js";

export {
  DuplicateSkillIdentifierError,
  InvalidSkillInputError,
  InvalidSkillManifestError,
  InvalidSkillStateError,
  SkillNotFoundError,
} from "./skill-errors.js";

export interface RegisterSkillManifestRequest {
  readonly intent: "register-skill-manifest";
  readonly manifest: SkillManifest;
}

export interface GetRegisteredSkillRequest {
  readonly intent: "get-registered-skill";
  readonly skillId: SkillIdentifier;
}

export interface DiscoverSkillsRequest {
  readonly intent: "discover-skills";
  readonly capability: SkillCapabilityIdentifier;
}

export interface RegisterSkillManifest {
  registerSkillManifest(request: unknown): RegisteredSkill;
}

export interface GetRegisteredSkill {
  getRegisteredSkill(request: unknown): RegisteredSkill;
}

export interface DiscoverSkills {
  discoverSkills(request: unknown): SkillDiscoveryResult;
}
