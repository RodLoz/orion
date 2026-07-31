import type {
  BrainOrchestrationLifecycleEvent,
  FinalCognitiveResult,
  NormalizedCognitiveRequest,
} from "./brain.js";
import type {
  GetActiveContextRevision,
  VerifyActiveContextRevisionAuthority,
} from "./context-contracts.js";
import type {
  CreateCandidatePlan,
  VerifyCandidatePlanAuthority,
} from "./planning-contracts.js";
import type {
  EvaluateReasoning,
  VerifyReasoningOutcomeAuthority,
} from "./reasoning-contracts.js";
import type { AuthorizationOperationIdentifier } from "./security.js";
import type {
  SkillCapabilityIdentifier,
  SkillIdentifier,
  SkillVersion,
} from "./skill.js";
import type {
  NormalizedSkillExecutionResult,
  VerifyNormalizedSkillExecutionResult,
} from "./skill-execution.js";
import type {
  BindSkillToOperation,
  ProtectedInvokeSkill,
  ResolveGovernedAuthorizationEvaluation,
  ResolveSkillExecutionContext,
  ResolveSkillInvocationRequirements,
  SelectSkill,
} from "./skill-contracts.js";

export interface OrchestrateCognitiveRequest {
  orchestrateCognitiveRequest(
    request: NormalizedCognitiveRequest,
  ): FinalCognitiveResult;
}

export interface VerifyFinalCognitiveResponseRequest {
  readonly intent: "verify-final-cognitive-response";
  readonly candidate: unknown;
  readonly expected: Readonly<{
    kind: "response";
    requestId: NormalizedCognitiveRequest["requestId"];
    response: Extract<FinalCognitiveResult, { kind: "response" }>["response"];
  }>;
}

export interface VerifyFinalRequestMoreContextRequest {
  readonly intent: "verify-final-request-more-context";
  readonly candidate: unknown;
  readonly expected: Readonly<{
    kind: "request-more-context";
    requestId: NormalizedCognitiveRequest["requestId"];
    reason: "planning-requested-more-context";
  }>;
}

export interface VerifyFinalSkillResultRequest {
  readonly intent: "verify-final-skill-result";
  readonly candidate: unknown;
  readonly expected: Readonly<{
    kind: "skill-result";
    requestId: NormalizedCognitiveRequest["requestId"];
    operationId: AuthorizationOperationIdentifier;
    skillId: SkillIdentifier;
    skillVersion: SkillVersion;
    capability: SkillCapabilityIdentifier;
    normalizedResult: NormalizedSkillExecutionResult;
  }>;
}

export type VerifyFinalCognitiveResultRequest =
  | VerifyFinalCognitiveResponseRequest
  | VerifyFinalRequestMoreContextRequest
  | VerifyFinalSkillResultRequest;

export interface VerifyFinalCognitiveResult {
  verifyFinalCognitiveResult(
    request: VerifyFinalCognitiveResultRequest,
  ): boolean;
}

export interface BrainContextAuthorityPort
  extends GetActiveContextRevision, VerifyActiveContextRevisionAuthority {}

export interface BrainReasoningAuthorityPort
  extends EvaluateReasoning, VerifyReasoningOutcomeAuthority {}

export interface BrainPlanningAuthorityPort
  extends CreateCandidatePlan, VerifyCandidatePlanAuthority {}

export interface AllocateAuthorizationOperationIdentifierRequest {
  readonly intent: "allocate-authorization-operation";
  readonly requestId: NormalizedCognitiveRequest["requestId"];
  readonly skillId: SkillIdentifier;
  readonly skillVersion: SkillVersion;
  readonly capability: SkillCapabilityIdentifier;
}

export interface AllocateAuthorizationOperationIdentifier {
  allocateAuthorizationOperationIdentifier(
    request: AllocateAuthorizationOperationIdentifierRequest,
  ): AuthorizationOperationIdentifier;
}

export type ObserveBrainOrchestrationLifecycle = (
  event: BrainOrchestrationLifecycleEvent,
) => void;

export interface BrainConfiguration {
  readonly context: BrainContextAuthorityPort;
  readonly reasoning: BrainReasoningAuthorityPort;
  readonly planning: BrainPlanningAuthorityPort;
  readonly selectSkill: SelectSkill;
  readonly operationAllocator: AllocateAuthorizationOperationIdentifier;
  readonly bindSkillToOperation: BindSkillToOperation;
  readonly resolveSkillExecutionContext: ResolveSkillExecutionContext;
  readonly resolveSkillInvocationRequirements: ResolveSkillInvocationRequirements;
  readonly resolveGovernedAuthorizationEvaluation: ResolveGovernedAuthorizationEvaluation;
  readonly protectedInvokeSkill: ProtectedInvokeSkill;
  readonly verifyNormalizedSkillExecutionResult: VerifyNormalizedSkillExecutionResult;
  readonly lifecycleObserver?: ObserveBrainOrchestrationLifecycle;
}
