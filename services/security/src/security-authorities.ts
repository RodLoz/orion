import {
  InvalidAuthorizationEvidenceError,
  InvalidSecurityStateError,
  createConfirmationEvidence,
  createPermissionGrantEvidence,
  createProtectedActionRequirementsResolution,
  createRegisteredSkill,
  createSecurityEvaluationContext,
  extractConfirmationAuthorityRequest,
  extractContextAuthorityRequest,
  extractGrantAuthorityRequest,
  extractRequirementsAuthorityRequest,
  type ConfirmationEvidence,
  type PermissionGrantEvidence,
  type ProtectedActionRequirementsResolution,
  type ResolveConfirmationEvidence,
  type ResolveGrantEvidence,
  type ResolveProtectedActionRequirements,
  type ResolveSecurityEvaluationContext,
  type AuthorizationActionIdentifier,
  type AuthorizationResource,
  type AuthorizationSensitivity,
  type RegisteredSkill,
  type AuthorizationSubject,
  type SecurityEvaluationContext,
} from "@orion/core";

function invokeSource<T>(operation: () => T): T {
  try {
    return operation();
  } catch {
    throw new InvalidSecurityStateError();
  }
}
const sameResource = (
  left: AuthorizationResource,
  right: AuthorizationResource,
) =>
  left.kind === right.kind &&
  (left.kind === "unscoped" ||
    (right.kind === "identified" && left.resourceId === right.resourceId));
const sameSubject = (left: AuthorizationSubject, right: AuthorizationSubject) =>
  left.kind === right.kind &&
  (left.kind === "anonymous" ||
    (right.kind === "authenticated" && left.identityId === right.identityId));

export class ProcessLocalRequirementsAuthority implements ResolveProtectedActionRequirements {
  public constructor(
    private readonly resolve: (
      request: ReturnType<typeof extractRequirementsAuthorityRequest>,
    ) => unknown,
  ) {}
  public resolveProtectedActionRequirements(
    request: unknown,
  ): ProtectedActionRequirementsResolution {
    const target = extractRequirementsAuthorityRequest(request);
    const candidate = invokeSource(() => this.resolve(target));
    const result = createProtectedActionRequirementsResolution(candidate);
    const governed =
      result.status === "available" ? result.requirements : result;
    if (
      governed.operationId !== target.operationId ||
      governed.action !== target.action ||
      !sameResource(governed.resource, target.resource)
    )
      throw new InvalidAuthorizationEvidenceError();
    return result;
  }
}
export class ProcessLocalSkillRequirementsAuthority implements ResolveProtectedActionRequirements {
  readonly #delegate: ProcessLocalRequirementsAuthority;
  public constructor(
    skill: RegisteredSkill,
    action: AuthorizationActionIdentifier,
    resource: AuthorizationResource,
    sensitivity: AuthorizationSensitivity,
  ) {
    let admittedSkill: RegisteredSkill;
    let governedTarget: ProtectedActionRequirementsResolution;
    try {
      admittedSkill = createRegisteredSkill(skill);
      governedTarget = createProtectedActionRequirementsResolution({
        status: "available",
        requirements: {
          operationId: "skill-requirements-admission",
          action,
          resource,
          requiredPermissions: admittedSkill.permissions,
          sensitivity,
        },
      });
    } catch {
      throw new InvalidAuthorizationEvidenceError();
    }
    if (governedTarget.status !== "available")
      throw new InvalidAuthorizationEvidenceError();
    const admitted = governedTarget.requirements;
    const permissions = admitted.requiredPermissions;
    this.#delegate = new ProcessLocalRequirementsAuthority((request) => {
      if (
        request.action !== admitted.action ||
        !sameResource(request.resource, admitted.resource)
      )
        return {
          status: "unavailable",
          operationId: request.operationId,
          action: request.action,
          resource: request.resource,
        };
      return {
        status: "available",
        requirements: {
          operationId: request.operationId,
          action: request.action,
          resource: request.resource,
          requiredPermissions: permissions,
          sensitivity: admitted.sensitivity,
        },
      };
    });
  }
  public resolveProtectedActionRequirements(
    request: unknown,
  ): ProtectedActionRequirementsResolution {
    return this.#delegate.resolveProtectedActionRequirements(request);
  }
}
export class ProcessLocalSecurityContextAuthority implements ResolveSecurityEvaluationContext {
  public constructor(
    private readonly resolve: (
      request: ReturnType<typeof extractContextAuthorityRequest>,
    ) => unknown,
  ) {}
  public resolveSecurityEvaluationContext(
    request: unknown,
  ): SecurityEvaluationContext {
    const target = extractContextAuthorityRequest(request);
    const candidate = invokeSource(() => this.resolve(target));
    const result = createSecurityEvaluationContext(candidate);
    if (result.operationId !== target.operationId)
      throw new InvalidAuthorizationEvidenceError();
    return result;
  }
}
export class ProcessLocalGrantEvidenceAuthority implements ResolveGrantEvidence {
  public constructor(
    private readonly resolve: (
      request: ReturnType<typeof extractGrantAuthorityRequest>,
    ) => unknown,
  ) {}
  public resolveGrantEvidence(request: unknown): PermissionGrantEvidence {
    const target = extractGrantAuthorityRequest(request);
    const candidate = invokeSource(() => this.resolve(target));
    const result = createPermissionGrantEvidence(candidate);
    if (
      result.operationId !== target.operationId ||
      result.action !== target.action ||
      !sameSubject(result.subject, target.subject) ||
      !sameResource(result.resource, target.resource) ||
      result.evaluatedPermissions.length !==
        target.requiredPermissions.length ||
      result.evaluatedPermissions.some(
        (permission, index) => permission !== target.requiredPermissions[index],
      )
    )
      throw new InvalidAuthorizationEvidenceError();
    return result;
  }
}
export class ProcessLocalConfirmationAuthority implements ResolveConfirmationEvidence {
  public constructor(
    private readonly resolve: (
      request: ReturnType<typeof extractConfirmationAuthorityRequest>,
    ) => unknown,
  ) {}
  public resolveConfirmationEvidence(request: unknown): ConfirmationEvidence {
    const target = extractConfirmationAuthorityRequest(request);
    const candidate = invokeSource(() => this.resolve(target));
    const result = createConfirmationEvidence(candidate);
    if (
      result.status === "confirmed" &&
      (result.operationId !== target.operationId ||
        result.action !== target.action ||
        !sameSubject(result.subject, target.subject) ||
        !sameResource(result.resource, target.resource))
    )
      throw new InvalidAuthorizationEvidenceError();
    return result;
  }
}
