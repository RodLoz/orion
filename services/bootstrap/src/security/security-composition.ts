import type {
  AuthorizationSubject,
  EvaluateAuthorization,
  EvaluateAuthorizationOutcome,
  VerifyAuthorizationEvaluationOutcome,
} from "@orion/core";
import {
  ProcessLocalConfirmationAuthority,
  ProcessLocalGrantEvidenceAuthority,
  ProcessLocalRequirementsAuthority,
  ProcessLocalSecurityContextAuthority,
  SecurityEngine,
  type SecurityEngineLifecycleState,
} from "@orion/security";

const anonymousSubject = { kind: "anonymous" as const };
const unscoped = { kind: "unscoped" as const };

export interface SecurityCapabilityComposition {
  readonly evaluateAuthorization: EvaluateAuthorization;
  readonly evaluateAuthorizationOutcome: EvaluateAuthorizationOutcome;
  readonly verifyAuthorizationEvaluationOutcome: VerifyAuthorizationEvaluationOutcome;
  readonly authorizationEvaluation: EvaluateAuthorization &
    EvaluateAuthorizationOutcome &
    VerifyAuthorizationEvaluationOutcome;
  readonly engineState: () => SecurityEngineLifecycleState;
}

export function composeSecurityCapability(
  subject: AuthorizationSubject = anonymousSubject,
): SecurityCapabilityComposition {
  const engine = new SecurityEngine({
    requirements: new ProcessLocalRequirementsAuthority((request) =>
      request.operationId === "diagnostic-indeterminate"
        ? {
            status: "unavailable",
            operationId: request.operationId,
            action: request.action,
            resource: request.resource,
          }
        : {
            status: "available",
            requirements: {
              operationId: request.operationId,
              action: request.action,
              resource: request.resource,
              requiredPermissions:
                request.operationId === "diagnostic-deny"
                  ? ["diagnostic.authorize"]
                  : [],
              sensitivity: "standard",
            },
          },
    ),
    context: new ProcessLocalSecurityContextAuthority((request) => ({
      operationId: request.operationId,
      subject,
      context: "available",
      device: "not-applicable",
      session: "not-applicable",
      trustLevel: "not-applicable",
    })),
    grants: new ProcessLocalGrantEvidenceAuthority((request) => ({
      status: "available",
      operationId: request.operationId,
      subject: request.subject,
      action: request.action,
      resource: request.resource,
      evaluatedPermissions: request.requiredPermissions,
      grants: [],
    })),
    confirmation: new ProcessLocalConfirmationAuthority(() => ({
      status: "absent",
    })),
  });
  engine.initialize();
  engine.start();
  return Object.freeze({
    evaluateAuthorization: engine,
    evaluateAuthorizationOutcome: engine,
    verifyAuthorizationEvaluationOutcome: engine,
    authorizationEvaluation: engine,
    engineState: () => engine.engineState,
  });
}

export const securityDiagnosticTarget = Object.freeze({
  action: "security.evaluate",
  resource: unscoped,
});
