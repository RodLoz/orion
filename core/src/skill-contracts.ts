import type {
  RegisteredSkill,
  SkillCapabilityIdentifier,
  SkillDiscoveryResult,
  SkillIdentifier,
  SkillManifest,
} from "./skill.js";
import type {
  AdmittedSkillWorkflow,
  BoundSkillInvocationTarget,
  NormalizedSkillExecutionResult,
  SkillExecutionContextProjection,
  SkillInvocationRequirementsProjection,
  SkillInvocationSensitivityResolution,
  SkillSelectionResult,
} from "./skill-execution.js";
import type { AuthorizationEvaluationOutcome } from "./security.js";

export {
  DuplicateSkillWorkflowAdmissionError,
  DuplicateSkillIdentifierError,
  InvalidBoundSkillTargetInputError,
  InvalidGovernedAuthorizationEvaluationError,
  InvalidProtectedSkillInvocationInputError,
  InvalidSkillAuthorityError,
  InvalidSkillContextAuthorityError,
  InvalidSkillExecutionStateError,
  InvalidSkillInputError,
  InvalidSkillManifestError,
  InvalidSkillSelectionAuthorityError,
  InvalidSkillSelectionInputError,
  InvalidSkillStateError,
  InvalidSkillValidationResultError,
  InvalidSkillWorkflowAdmissionError,
  InvalidSkillWorkflowResultError,
  SkillAuthorizationEnforcementError,
  SkillInputValidationError,
  SkillNotFoundError,
  SkillValidatorBoundaryError,
  SkillWorkflowExecutionError,
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

export interface AdmitSkillWorkflow {
  admitSkillWorkflow(request: unknown): AdmittedSkillWorkflow;
}
export interface SelectSkill {
  selectSkill(request: unknown): SkillSelectionResult;
}
export interface BindSkillToOperation {
  bindSkillToOperation(request: unknown): BoundSkillInvocationTarget;
}
export interface ResolveSkillExecutionContext {
  resolveSkillExecutionContext(
    request: unknown,
  ): SkillExecutionContextProjection;
}
export interface ResolveSkillInvocationSensitivity {
  resolveSkillInvocationSensitivity(
    request: unknown,
  ): SkillInvocationSensitivityResolution;
}
export interface ResolveSkillInvocationRequirements {
  resolveSkillInvocationRequirements(
    request: unknown,
  ): SkillInvocationRequirementsProjection;
}
export interface ResolveGovernedAuthorizationEvaluation {
  resolveGovernedAuthorizationEvaluation(
    request: unknown,
  ): AuthorizationEvaluationOutcome;
}
export interface ProtectedInvokeSkill {
  invokeBoundSkill(request: unknown): NormalizedSkillExecutionResult;
}
