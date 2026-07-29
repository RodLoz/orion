import type {
  AuthorizationActionIdentifier,
  AuthorizationOperationIdentifier,
  AuthorizationResource,
  AuthorizationSensitivity,
  AuthorizationSubject,
} from "./security.js";
import type {
  RegisteredSkill,
  SkillCapabilityIdentifier,
  SkillFailureModeIdentifier,
  SkillIdentifier,
  SkillInterfaceFieldIdentifier,
  SkillPermissionIdentifier,
  SkillVersion,
} from "./skill.js";
import type {
  ActiveContextRevision,
  ContextLineageIdentity,
  ContextRevisionIdentity,
} from "./context.js";

export type SkillInvocationScalar = null | boolean | number | string;
export type SkillInvocationData = Readonly<
  Record<string, SkillInvocationScalar>
>;

export interface AdmittedSkillWorkflow {
  readonly skillId: SkillIdentifier;
  readonly skillVersion: SkillVersion;
  readonly supportedCapabilities: readonly SkillCapabilityIdentifier[];
}
export interface SkillBinding {
  readonly capability: SkillCapabilityIdentifier;
  readonly registeredSkill: RegisteredSkill;
}
export interface BoundSkillInvocationTarget {
  readonly operationId: AuthorizationOperationIdentifier;
  readonly skillId: SkillIdentifier;
  readonly skillVersion: SkillVersion;
  readonly capability: SkillCapabilityIdentifier;
  readonly action: AuthorizationActionIdentifier;
  readonly resource: AuthorizationResource;
  readonly requiredPermissions: readonly SkillPermissionIdentifier[];
  readonly inputNames: readonly SkillInterfaceFieldIdentifier[];
  readonly outputNames: readonly SkillInterfaceFieldIdentifier[];
  readonly failureModes: readonly SkillFailureModeIdentifier[];
}
export interface SkillExecutionContextProjection {
  readonly operationId: AuthorizationOperationIdentifier;
  readonly lineageId: ContextLineageIdentity;
  readonly revisionId: ContextRevisionIdentity;
  readonly subject: AuthorizationSubject;
}
export type SkillInvocationSensitivityResolution =
  | {
      readonly status: "available";
      readonly sensitivity: AuthorizationSensitivity;
    }
  | { readonly status: "unavailable" };
export type SkillInvocationRequirementsProjection =
  | {
      readonly status: "available";
      readonly requirements: Readonly<{
        readonly operationId: AuthorizationOperationIdentifier;
        readonly action: AuthorizationActionIdentifier;
        readonly resource: AuthorizationResource;
        readonly requiredPermissions: readonly SkillPermissionIdentifier[];
        readonly sensitivity: AuthorizationSensitivity;
      }>;
    }
  | {
      readonly status: "unavailable";
      readonly operationId: AuthorizationOperationIdentifier;
      readonly action: AuthorizationActionIdentifier;
      readonly resource: AuthorizationResource;
    };
export interface SkillValidatorInput {
  readonly operationId: AuthorizationOperationIdentifier;
  readonly capability: SkillCapabilityIdentifier;
  readonly inputs: SkillInvocationData;
  readonly context: SkillExecutionContextProjection;
}
export type SkillValidationOutcome =
  { readonly status: "accepted" } | { readonly status: "rejected" };
export type SkillValidatorContractImplementation = (
  input: SkillValidatorInput,
) => SkillValidationOutcome;
export type SkillWorkflowInput = SkillValidatorInput;
export type RawSkillWorkflowResult =
  | { readonly status: "succeeded"; readonly outputs: SkillInvocationData }
  | {
      readonly status: "failed";
      readonly failureMode: SkillFailureModeIdentifier;
    };
export type SkillWorkflowContractImplementation = (
  input: SkillWorkflowInput,
) => RawSkillWorkflowResult;
export type SkillSelectionResult =
  | {
      readonly status: "selected";
      readonly policy: Readonly<{
        readonly id: "orion.minimum-skill-selection";
        readonly version: "1.0.0";
      }>;
      readonly binding: SkillBinding;
    }
  | {
      readonly status: "unavailable";
      readonly policy: Readonly<{
        readonly id: "orion.minimum-skill-selection";
        readonly version: "1.0.0";
      }>;
      readonly capability: SkillCapabilityIdentifier;
      readonly reason: "no-invocation-eligible-skill";
    };
export type NormalizedSkillExecutionResult =
  | {
      readonly operationId: AuthorizationOperationIdentifier;
      readonly skillId: SkillIdentifier;
      readonly skillVersion: SkillVersion;
      readonly capability: SkillCapabilityIdentifier;
      readonly status: "succeeded";
      readonly outputs: SkillInvocationData;
    }
  | {
      readonly operationId: AuthorizationOperationIdentifier;
      readonly skillId: SkillIdentifier;
      readonly skillVersion: SkillVersion;
      readonly capability: SkillCapabilityIdentifier;
      readonly status: "failed";
      readonly failureMode: SkillFailureModeIdentifier;
    };
export type SkillInvocationLifecycleState =
  | "proposed"
  | "admitted"
  | "authorized"
  | "input-validated"
  | "executing"
  | "succeeded"
  | "failed"
  | "rejected";
export type SkillInvocationLifecycleTransitionCategory =
  | "invocation-proposed"
  | "authority-admitted"
  | "authorization-accepted"
  | "input-accepted"
  | "workflow-started"
  | "execution-succeeded"
  | "business-failed"
  | "pre-execution-rejected"
  | "execution-failed";
export interface SkillInvocationLifecycleEvent {
  readonly sequence: number;
  readonly from: "none" | SkillInvocationLifecycleState;
  readonly to: SkillInvocationLifecycleState;
  readonly category: SkillInvocationLifecycleTransitionCategory;
}
export type SkillInvocationLifecycleObserver = (
  event: SkillInvocationLifecycleEvent,
) => void;

export interface SkillExecutionContextAuthorityPort {
  resolve(request: {
    readonly intent: "resolve-skill-execution-context";
    readonly operationId: AuthorizationOperationIdentifier;
    readonly contextRevision: ActiveContextRevision;
  }): unknown;
  verify(
    candidate: unknown,
    expected: { readonly operationId: AuthorizationOperationIdentifier },
  ): boolean;
}
export interface SkillInvocationSensitivityAuthorityPort {
  resolve(request: {
    readonly intent: "resolve-skill-invocation-sensitivity";
    readonly action: AuthorizationActionIdentifier;
    readonly resource: AuthorizationResource;
  }): unknown;
  verify(
    candidate: unknown,
    expected: {
      readonly action: AuthorizationActionIdentifier;
      readonly resource: AuthorizationResource;
    },
  ): boolean;
}
export interface SkillInvocationRequirementsAuthorityPort {
  resolve(request: {
    readonly intent: "resolve-skill-invocation-requirements";
    readonly target: BoundSkillInvocationTarget;
  }): unknown;
  verify(
    candidate: unknown,
    expected: {
      readonly operationId: AuthorizationOperationIdentifier;
      readonly action: AuthorizationActionIdentifier;
      readonly resource: AuthorizationResource;
    },
  ): boolean;
}
export interface AuthorizationEvaluationOutcomeAuthorityPort {
  resolve(request: {
    readonly intent: "resolve-governed-authorization-evaluation";
    readonly request: {
      readonly intent: "evaluate-authorization-outcome";
      readonly operationId: AuthorizationOperationIdentifier;
      readonly action: AuthorizationActionIdentifier;
      readonly resource: AuthorizationResource;
    };
  }): unknown;
  verifyAuthorizationEvaluationOutcome(request: {
    readonly intent: "verify-authorization-evaluation-outcome";
    readonly outcome: unknown;
    readonly operationId: AuthorizationOperationIdentifier;
  }): boolean;
}
export interface VerifyNormalizedSkillExecutionResult {
  verify(
    candidate: unknown,
    expected: {
      readonly operationId: AuthorizationOperationIdentifier;
      readonly skillId: SkillIdentifier;
      readonly skillVersion: SkillVersion;
      readonly capability: SkillCapabilityIdentifier;
    },
  ): boolean;
}
