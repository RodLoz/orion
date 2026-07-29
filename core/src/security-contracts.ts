import type {
  AuthorizationActionIdentifier,
  AuthorizationDecisionArtifact,
  AuthorizationEvaluationOutcome,
  AuthorizationOperationIdentifier,
  AuthorizationResource,
  AuthorizationSubject,
  ConfirmationEvidence,
  PermissionGrantEvidence,
  ProtectedActionRequirementsResolution,
  SecurityEvaluationContext,
} from "./security.js";
import type { SkillPermissionIdentifier } from "./skill.js";

export {
  InvalidAuthorizationEvidenceError,
  InvalidAuthorizationInputError,
  InvalidSecurityStateError,
} from "./security-errors.js";

export interface AuthorizationEvaluationRequest {
  readonly intent: "evaluate-authorization";
  readonly operationId: AuthorizationOperationIdentifier;
  readonly action: AuthorizationActionIdentifier;
  readonly resource: AuthorizationResource;
}
export interface AuthorizationOutcomeEvaluationRequest {
  readonly intent: "evaluate-authorization-outcome";
  readonly operationId: AuthorizationOperationIdentifier;
  readonly action: AuthorizationActionIdentifier;
  readonly resource: AuthorizationResource;
}
export interface ResolveProtectedActionRequirementsRequest {
  readonly intent: "resolve-protected-action-requirements";
  readonly operationId: AuthorizationOperationIdentifier;
  readonly action: AuthorizationActionIdentifier;
  readonly resource: AuthorizationResource;
}
export interface ResolveSecurityEvaluationContextRequest {
  readonly intent: "resolve-security-evaluation-context";
  readonly operationId: AuthorizationOperationIdentifier;
  readonly action: AuthorizationActionIdentifier;
  readonly resource: AuthorizationResource;
}
export interface ResolveGrantEvidenceRequest {
  readonly intent: "resolve-grant-evidence";
  readonly operationId: AuthorizationOperationIdentifier;
  readonly subject: AuthorizationSubject;
  readonly action: AuthorizationActionIdentifier;
  readonly resource: AuthorizationResource;
  readonly requiredPermissions: readonly SkillPermissionIdentifier[];
}
export interface ResolveConfirmationEvidenceRequest {
  readonly intent: "resolve-confirmation-evidence";
  readonly operationId: AuthorizationOperationIdentifier;
  readonly subject: AuthorizationSubject;
  readonly action: AuthorizationActionIdentifier;
  readonly resource: AuthorizationResource;
}

export interface EvaluateAuthorization {
  evaluateAuthorization(request: unknown): AuthorizationDecisionArtifact;
}
export interface EvaluateAuthorizationOutcome {
  evaluateAuthorizationOutcome(
    request: unknown,
  ): AuthorizationEvaluationOutcome;
}
export interface VerifyAuthorizationEvaluationOutcome {
  verifyAuthorizationEvaluationOutcome(request: unknown): boolean;
}
export interface ResolveProtectedActionRequirements {
  resolveProtectedActionRequirements(
    request: unknown,
  ): ProtectedActionRequirementsResolution;
}
export interface ResolveSecurityEvaluationContext {
  resolveSecurityEvaluationContext(request: unknown): SecurityEvaluationContext;
}
export interface ResolveGrantEvidence {
  resolveGrantEvidence(request: unknown): PermissionGrantEvidence;
}
export interface ResolveConfirmationEvidence {
  resolveConfirmationEvidence(request: unknown): ConfirmationEvidence;
}
