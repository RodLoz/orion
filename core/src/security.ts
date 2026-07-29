import type { IdentityIdentifier } from "./identity.js";
import {
  InvalidAuthorizationEvidenceError,
  InvalidAuthorizationInputError,
  InvalidSecurityStateError,
} from "./security-errors.js";
import {
  codePointOrder,
  skillPermissionIdentifier,
  type SkillPermissionIdentifier,
} from "./skill.js";

export type AuthorizationOperationIdentifier = string & {
  readonly __authorizationOperationIdentifier: unique symbol;
};
export type AuthorizationActionIdentifier = string & {
  readonly __authorizationActionIdentifier: unique symbol;
};
export type AuthorizationResourceIdentifier = string & {
  readonly __authorizationResourceIdentifier: unique symbol;
};
export type AuthorizationSubject =
  | { readonly kind: "anonymous" }
  | { readonly kind: "authenticated"; readonly identityId: IdentityIdentifier };
export type AuthorizationResource =
  | { readonly kind: "unscoped" }
  | {
      readonly kind: "identified";
      readonly resourceId: AuthorizationResourceIdentifier;
    };
export type SecurityDimensionStatus =
  "available" | "unavailable" | "not-applicable";
export type AuthorizationSensitivity = "standard" | "sensitive";
export type AuthorizationDecision = "allow" | "deny" | "indeterminate";
export type AuthorizationDecisionReason =
  | "no-permission-required"
  | "all-required-permissions-granted"
  | "confirmation-and-permissions-satisfied"
  | "missing-required-permission"
  | "confirmation-required"
  | "requirements-unavailable"
  | "security-context-unavailable"
  | "grant-evidence-unavailable";

export interface PermissionGrant {
  readonly subject: AuthorizationSubject;
  readonly permission: SkillPermissionIdentifier;
  readonly resource: AuthorizationResource;
}
export interface ProtectedActionRequirements {
  readonly operationId: AuthorizationOperationIdentifier;
  readonly action: AuthorizationActionIdentifier;
  readonly resource: AuthorizationResource;
  readonly requiredPermissions: readonly SkillPermissionIdentifier[];
  readonly sensitivity: AuthorizationSensitivity;
}
export type ProtectedActionRequirementsResolution =
  | {
      readonly status: "available";
      readonly requirements: ProtectedActionRequirements;
    }
  | {
      readonly status: "unavailable";
      readonly operationId: AuthorizationOperationIdentifier;
      readonly action: AuthorizationActionIdentifier;
      readonly resource: AuthorizationResource;
    };
export type PermissionGrantEvidence =
  | {
      readonly status: "available";
      readonly operationId: AuthorizationOperationIdentifier;
      readonly subject: AuthorizationSubject;
      readonly action: AuthorizationActionIdentifier;
      readonly resource: AuthorizationResource;
      readonly evaluatedPermissions: readonly SkillPermissionIdentifier[];
      readonly grants: readonly PermissionGrant[];
    }
  | {
      readonly status: "unavailable";
      readonly operationId: AuthorizationOperationIdentifier;
      readonly subject: AuthorizationSubject;
      readonly action: AuthorizationActionIdentifier;
      readonly resource: AuthorizationResource;
      readonly evaluatedPermissions: readonly SkillPermissionIdentifier[];
    };
export interface SecurityEvaluationContext {
  readonly operationId: AuthorizationOperationIdentifier;
  readonly subject: AuthorizationSubject;
  readonly context: SecurityDimensionStatus;
  readonly device: SecurityDimensionStatus;
  readonly session: SecurityDimensionStatus;
  readonly trustLevel: SecurityDimensionStatus;
}
export type ConfirmationEvidence =
  | { readonly status: "absent" }
  | {
      readonly status: "confirmed";
      readonly operationId: AuthorizationOperationIdentifier;
      readonly subject: AuthorizationSubject;
      readonly action: AuthorizationActionIdentifier;
      readonly resource: AuthorizationResource;
    };
export interface AuthorizationDecisionArtifact {
  readonly operationId: AuthorizationOperationIdentifier;
  readonly decision: AuthorizationDecision;
  readonly subject: AuthorizationSubject;
  readonly action: AuthorizationActionIdentifier;
  readonly resource: AuthorizationResource;
  readonly requirementsStatus: "available" | "unavailable";
  readonly evaluatedPermissions: readonly SkillPermissionIdentifier[];
  readonly sensitivity: AuthorizationSensitivity | "unavailable";
  readonly securityContext: Readonly<{
    context: SecurityDimensionStatus;
    device: SecurityDimensionStatus;
    session: SecurityDimensionStatus;
    trustLevel: SecurityDimensionStatus;
  }>;
  readonly policy: Readonly<{
    id: "orion.minimum-authorization";
    version: "1.0.0";
  }>;
  readonly reason: AuthorizationDecisionReason;
  readonly evidence: Readonly<{
    grantEvidenceStatus: "available" | "unavailable" | "not-evaluated";
    confirmationStatus:
      "not-evaluated" | "not-required" | "absent" | "confirmed";
  }>;
}
export interface GovernedSecurityEvaluationSummary {
  readonly operationId: AuthorizationOperationIdentifier;
  readonly subject: AuthorizationSubject;
  readonly securityContext: Readonly<{
    readonly context: SecurityDimensionStatus;
    readonly device: SecurityDimensionStatus;
    readonly session: SecurityDimensionStatus;
    readonly trustLevel: SecurityDimensionStatus;
  }>;
}
export interface AuthorizationEvaluationOutcome {
  readonly authorization: AuthorizationDecisionArtifact;
  readonly securityEvaluationSummary: GovernedSecurityEvaluationSummary;
}

const OPERATION = /^[A-Za-z0-9][A-Za-z0-9._:-]{0,127}$/;
const ACTION =
  /^[a-z0-9](?:[a-z0-9-]*[a-z0-9])?(?:\.[a-z0-9](?:[a-z0-9-]*[a-z0-9])?)+$/;
const RESOURCE = /^[A-Za-z0-9][A-Za-z0-9._:/-]{0,127}$/;
const DIMENSIONS = new Set(["available", "unavailable", "not-applicable"]);

export function authorizationOperationIdentifier(
  value: unknown,
): AuthorizationOperationIdentifier {
  if (typeof value !== "string" || !OPERATION.test(value))
    throw new InvalidAuthorizationInputError();
  return value as AuthorizationOperationIdentifier;
}
export function authorizationActionIdentifier(
  value: unknown,
): AuthorizationActionIdentifier {
  if (
    typeof value !== "string" ||
    value.length < 3 ||
    value.length > 128 ||
    !ACTION.test(value)
  )
    throw new InvalidAuthorizationInputError();
  return value as AuthorizationActionIdentifier;
}
export function authorizationResourceIdentifier(
  value: unknown,
): AuthorizationResourceIdentifier {
  if (typeof value !== "string" || !RESOURCE.test(value))
    throw new InvalidAuthorizationInputError();
  return value as AuthorizationResourceIdentifier;
}

type FailureKind = "input" | "evidence" | "state";
const fail = (kind: FailureKind): never => {
  if (kind === "input") throw new InvalidAuthorizationInputError();
  if (kind === "evidence") throw new InvalidAuthorizationEvidenceError();
  throw new InvalidSecurityStateError();
};
function capture(value: unknown, fields: readonly string[], kind: FailureKind) {
  try {
    if (typeof value !== "object" || value === null || Array.isArray(value))
      return fail(kind);
    const keys = Reflect.ownKeys(value);
    if (
      keys.length !== fields.length ||
      keys.some((key) => typeof key !== "string" || !fields.includes(key))
    )
      return fail(kind);
    const out: Record<string, unknown> = {};
    for (const field of fields) {
      const descriptor = Reflect.getOwnPropertyDescriptor(value, field);
      if (descriptor === undefined || descriptor.enumerable !== true)
        return fail(kind);
      out[field] =
        "value" in descriptor ? descriptor.value : descriptor.get?.call(value);
    }
    return out;
  } catch (error) {
    if (
      error instanceof InvalidAuthorizationInputError ||
      error instanceof InvalidAuthorizationEvidenceError ||
      error instanceof InvalidSecurityStateError
    )
      throw error;
    return fail(kind);
  }
}
function captureCanonical(
  value: unknown,
  fields: readonly string[],
  kind: FailureKind,
) {
  try {
    if (typeof value !== "object" || value === null || Array.isArray(value))
      return fail(kind);
    const prototype = Reflect.getPrototypeOf(value);
    if (prototype !== Object.prototype && prototype !== null) return fail(kind);
    const keys = Reflect.ownKeys(value);
    if (
      keys.length !== fields.length ||
      keys.some((key) => typeof key !== "string" || !fields.includes(key))
    )
      return fail(kind);
    const out: Record<string, unknown> = Object.create(null);
    for (const field of fields) {
      const descriptor = Reflect.getOwnPropertyDescriptor(value, field);
      if (
        descriptor === undefined ||
        descriptor.enumerable !== true ||
        !("value" in descriptor) ||
        descriptor.value === undefined
      )
        return fail(kind);
      out[field] = descriptor.value;
    }
    return out;
  } catch (error) {
    if (
      error instanceof InvalidAuthorizationInputError ||
      error instanceof InvalidAuthorizationEvidenceError ||
      error instanceof InvalidSecurityStateError
    )
      throw error;
    return fail(kind);
  }
}
function captureUnion(
  value: unknown,
  variants: readonly (readonly string[])[],
  kind: FailureKind,
): Record<string, unknown> {
  try {
    if (typeof value !== "object" || value === null || Array.isArray(value))
      return fail(kind);
    const keys = Reflect.ownKeys(value);
    if (
      keys.some((key) => typeof key === "symbol") ||
      !variants.some(
        (fields) =>
          fields.length === keys.length &&
          keys.every((key) => fields.includes(key as string)),
      )
    )
      return fail(kind);
    const out: Record<string, unknown> = {};
    for (const key of keys as string[]) {
      const descriptor = Reflect.getOwnPropertyDescriptor(value, key);
      if (!descriptor || descriptor.enumerable !== true) return fail(kind);
      out[key] =
        "value" in descriptor ? descriptor.value : descriptor.get?.call(value);
    }
    return out;
  } catch {
    return fail(kind);
  }
}
function subject(value: unknown, kind: FailureKind): AuthorizationSubject {
  const captured = captureUnion(
    value,
    [["kind"], ["kind", "identityId"]],
    kind,
  );
  if (captured.kind === "anonymous" && !("identityId" in captured)) {
    return Object.freeze({ kind: "anonymous" });
  }
  if (
    captured.kind !== "authenticated" ||
    typeof captured.identityId !== "string" ||
    !/^[a-z][a-z0-9]*(?:[.-][a-z0-9]+)*$/.test(captured.identityId)
  )
    return fail(kind);
  return Object.freeze({
    kind: "authenticated",
    identityId: captured.identityId as IdentityIdentifier,
  });
}

function canonicalSubject(
  value: unknown,
  kind: FailureKind,
): AuthorizationSubject {
  try {
    if (typeof value !== "object" || value === null || Array.isArray(value))
      return fail(kind);
    const prototype = Reflect.getPrototypeOf(value);
    if (prototype !== Object.prototype && prototype !== null) return fail(kind);
    const keys = Reflect.ownKeys(value);
    const fields =
      keys.length === 1 && keys[0] === "kind"
        ? ["kind"]
        : keys.length === 2 &&
            keys.every(
              (key) =>
                typeof key === "string" &&
                (key === "kind" || key === "identityId"),
            )
          ? ["kind", "identityId"]
          : undefined;
    if (fields === undefined) return fail(kind);
    const captured = captureCanonical(value, fields, kind);
    if (captured.kind === "anonymous" && fields.length === 1)
      return Object.freeze({ kind: "anonymous" });
    if (
      captured.kind !== "authenticated" ||
      fields.length !== 2 ||
      typeof captured.identityId !== "string" ||
      !/^[a-z][a-z0-9]*(?:[.-][a-z0-9]+)*$/.test(captured.identityId)
    )
      return fail(kind);
    return Object.freeze({
      kind: "authenticated",
      identityId: captured.identityId as IdentityIdentifier,
    });
  } catch {
    return fail(kind);
  }
}
function resource(value: unknown, kind: FailureKind): AuthorizationResource {
  const captured = captureUnion(
    value,
    [["kind"], ["kind", "resourceId"]],
    kind,
  );
  if (captured.kind === "unscoped" && !("resourceId" in captured)) {
    return Object.freeze({ kind: "unscoped" });
  }
  if (captured.kind !== "identified") return fail(kind);
  let id: AuthorizationResourceIdentifier;
  try {
    id = authorizationResourceIdentifier(captured.resourceId);
  } catch {
    return fail(kind);
  }
  return Object.freeze({ kind: "identified", resourceId: id });
}
function captureArray(
  value: unknown,
  maximum: number,
  kind: FailureKind,
): readonly unknown[] {
  try {
    if (!Array.isArray(value)) return fail(kind);
    const keys = Reflect.ownKeys(value);
    const lengthDescriptor = Reflect.getOwnPropertyDescriptor(value, "length");
    if (
      lengthDescriptor === undefined ||
      !("value" in lengthDescriptor) ||
      !Number.isSafeInteger(lengthDescriptor.value) ||
      lengthDescriptor.value < 0 ||
      lengthDescriptor.value > maximum
    )
      return fail(kind);
    const length = lengthDescriptor.value as number;
    if (
      keys.length !== length + 1 ||
      keys.some((key) => {
        if (key === "length") return false;
        if (typeof key !== "string") return true;
        const index = Number(key);
        return (
          !Number.isSafeInteger(index) ||
          String(index) !== key ||
          index < 0 ||
          index >= length
        );
      })
    )
      return fail(kind);
    const result: unknown[] = [];
    for (let index = 0; index < length; index += 1) {
      const descriptor = Reflect.getOwnPropertyDescriptor(value, String(index));
      if (descriptor === undefined || descriptor.enumerable !== true)
        return fail(kind);
      result.push(
        "value" in descriptor ? descriptor.value : descriptor.get?.call(value),
      );
    }
    return result;
  } catch (error) {
    if (
      error instanceof InvalidAuthorizationInputError ||
      error instanceof InvalidAuthorizationEvidenceError ||
      error instanceof InvalidSecurityStateError
    )
      throw error;
    return fail(kind);
  }
}
function permissions(value: unknown, kind: FailureKind) {
  try {
    const captured = captureArray(value, 64, kind);
    const result: SkillPermissionIdentifier[] = [];
    for (const item of captured) {
      result.push(skillPermissionIdentifier(item));
    }
    if (new Set(result).size !== result.length) return fail(kind);
    result.sort(codePointOrder);
    return Object.freeze(result);
  } catch (error) {
    if (
      error instanceof InvalidAuthorizationInputError ||
      error instanceof InvalidAuthorizationEvidenceError ||
      error instanceof InvalidSecurityStateError
    )
      throw error;
    return fail(kind);
  }
}
const target = (
  value: unknown,
  intent: string,
  extra: readonly string[] = [],
) => {
  const fields = ["intent", "operationId", ...extra, "action", "resource"];
  const data = capture(value, fields, "input");
  if (data.intent !== intent) fail("input");
  let operationId, action;
  try {
    operationId = authorizationOperationIdentifier(data.operationId);
    action = authorizationActionIdentifier(data.action);
  } catch {
    return fail("input");
  }
  return {
    data,
    operationId,
    action,
    resource: resource(data.resource, "input"),
  };
};

export const extractAuthorizationEvaluationRequest = (value: unknown) =>
  target(value, "evaluate-authorization");
export const extractAuthorizationOutcomeEvaluationRequest = (value: unknown) =>
  target(value, "evaluate-authorization-outcome");
export const extractRequirementsAuthorityRequest = (value: unknown) =>
  target(value, "resolve-protected-action-requirements");
export const extractContextAuthorityRequest = (value: unknown) =>
  target(value, "resolve-security-evaluation-context");
export function extractGrantAuthorityRequest(value: unknown) {
  const result = target(value, "resolve-grant-evidence", [
    "subject",
    "requiredPermissions",
  ]);
  return {
    ...result,
    subject: subject(result.data.subject, "input"),
    requiredPermissions: permissions(result.data.requiredPermissions, "input"),
  };
}
export function extractConfirmationAuthorityRequest(value: unknown) {
  const result = target(value, "resolve-confirmation-evidence", ["subject"]);
  return { ...result, subject: subject(result.data.subject, "input") };
}

export function createProtectedActionRequirementsResolution(
  value: unknown,
  kind: FailureKind = "evidence",
): ProtectedActionRequirementsResolution {
  const candidate = captureUnion(
    value,
    [
      ["status", "requirements"],
      ["status", "operationId", "action", "resource"],
    ],
    kind,
  );
  const status = candidate.status;
  if (status === "available") {
    const r = capture(
      candidate.requirements,
      [
        "operationId",
        "action",
        "resource",
        "requiredPermissions",
        "sensitivity",
      ],
      kind,
    );
    try {
      return Object.freeze({
        status: "available",
        requirements: Object.freeze({
          operationId: authorizationOperationIdentifier(r.operationId),
          action: authorizationActionIdentifier(r.action),
          resource: resource(r.resource, kind),
          requiredPermissions: permissions(r.requiredPermissions, kind),
          sensitivity:
            r.sensitivity === "standard" || r.sensitivity === "sensitive"
              ? r.sensitivity
              : fail(kind),
        }),
      });
    } catch {
      return fail(kind);
    }
  }
  const unavailable = candidate;
  if (unavailable.status !== "unavailable") return fail(kind);
  try {
    return Object.freeze({
      status: "unavailable",
      operationId: authorizationOperationIdentifier(unavailable.operationId),
      action: authorizationActionIdentifier(unavailable.action),
      resource: resource(unavailable.resource, kind),
    });
  } catch {
    return fail(kind);
  }
}

export function createSecurityEvaluationContext(
  value: unknown,
  kind: FailureKind = "evidence",
): SecurityEvaluationContext {
  const v = capture(
    value,
    ["operationId", "subject", "context", "device", "session", "trustLevel"],
    kind,
  );
  try {
    for (const field of ["context", "device", "session", "trustLevel"])
      if (!DIMENSIONS.has(v[field] as string)) return fail(kind);
    return Object.freeze({
      operationId: authorizationOperationIdentifier(v.operationId),
      subject: subject(v.subject, kind),
      context: v.context as SecurityDimensionStatus,
      device: v.device as SecurityDimensionStatus,
      session: v.session as SecurityDimensionStatus,
      trustLevel: v.trustLevel as SecurityDimensionStatus,
    });
  } catch {
    return fail(kind);
  }
}
function grant(value: unknown, kind: FailureKind): PermissionGrant {
  const v = capture(value, ["subject", "permission", "resource"], kind);
  try {
    return Object.freeze({
      subject: subject(v.subject, kind),
      permission: skillPermissionIdentifier(v.permission),
      resource: resource(v.resource, kind),
    });
  } catch {
    return fail(kind);
  }
}
function grants(value: unknown, kind: FailureKind) {
  const result: PermissionGrant[] = [];
  try {
    for (const item of captureArray(value, 64, kind)) {
      result.push(grant(item, kind));
    }
    result.sort((a, b) => codePointOrder(a.permission, b.permission));
    if (new Set(result.map((g) => g.permission)).size !== result.length)
      return fail(kind);
    return Object.freeze(result);
  } catch {
    return fail(kind);
  }
}
export function createPermissionGrantEvidence(
  value: unknown,
  kind: FailureKind = "evidence",
): PermissionGrantEvidence {
  let v: Record<string, unknown>;
  try {
    v = captureUnion(
      value,
      [
        [
          "status",
          "operationId",
          "subject",
          "action",
          "resource",
          "evaluatedPermissions",
          "grants",
        ],
        [
          "status",
          "operationId",
          "subject",
          "action",
          "resource",
          "evaluatedPermissions",
        ],
      ],
      kind,
    );
    if (v.status !== "available" && v.status !== "unavailable")
      return fail(kind);
    const common = {
      status: v.status,
      operationId: authorizationOperationIdentifier(v.operationId),
      subject: subject(v.subject, kind),
      action: authorizationActionIdentifier(v.action),
      resource: resource(v.resource, kind),
      evaluatedPermissions: permissions(v.evaluatedPermissions, kind),
    };
    if (v.status === "available") {
      const admittedGrants = grants(v.grants, kind);
      if (
        admittedGrants.some(
          (item) =>
            !subjectsEqual(item.subject, common.subject) ||
            !resourcesEqual(item.resource, common.resource) ||
            !common.evaluatedPermissions.includes(item.permission),
        )
      )
        return fail(kind);
      return Object.freeze({
        ...common,
        status: "available",
        grants: admittedGrants,
      });
    }
    return Object.freeze({ ...common, status: "unavailable" });
  } catch {
    return fail(kind);
  }
}
function subjectsEqual(a: AuthorizationSubject, b: AuthorizationSubject) {
  return (
    a.kind === b.kind &&
    (a.kind === "anonymous" ||
      (b.kind === "authenticated" && a.identityId === b.identityId))
  );
}
function resourcesEqual(a: AuthorizationResource, b: AuthorizationResource) {
  return (
    a.kind === b.kind &&
    (a.kind === "unscoped" ||
      (b.kind === "identified" && a.resourceId === b.resourceId))
  );
}
export function createConfirmationEvidence(
  value: unknown,
  kind: FailureKind = "evidence",
): ConfirmationEvidence {
  try {
    const v = captureUnion(
      value,
      [["status"], ["status", "operationId", "subject", "action", "resource"]],
      kind,
    );
    if (v.status === "absent" && Reflect.ownKeys(v).length === 1)
      return Object.freeze({ status: "absent" });
    if (v.status !== "confirmed") return fail(kind);
    return Object.freeze({
      status: "confirmed",
      operationId: authorizationOperationIdentifier(v.operationId),
      subject: subject(v.subject, kind),
      action: authorizationActionIdentifier(v.action),
      resource: resource(v.resource, kind),
    });
  } catch {
    return fail(kind);
  }
}

export function createAuthorizationDecisionArtifact(
  value: unknown,
): AuthorizationDecisionArtifact {
  try {
    const v = capture(
      value,
      [
        "operationId",
        "decision",
        "subject",
        "action",
        "resource",
        "requirementsStatus",
        "evaluatedPermissions",
        "sensitivity",
        "securityContext",
        "policy",
        "reason",
        "evidence",
      ],
      "state",
    );
    const securityContext = capture(
      v.securityContext,
      ["context", "device", "session", "trustLevel"],
      "state",
    );
    const policy = capture(v.policy, ["id", "version"], "state");
    const evidence = capture(
      v.evidence,
      ["grantEvidenceStatus", "confirmationStatus"],
      "state",
    );
    const artifact = {
      operationId: authorizationOperationIdentifier(v.operationId),
      decision: v.decision as AuthorizationDecision,
      subject: subject(v.subject, "state"),
      action: authorizationActionIdentifier(v.action),
      resource: resource(v.resource, "state"),
      requirementsStatus: v.requirementsStatus as "available" | "unavailable",
      evaluatedPermissions: permissions(v.evaluatedPermissions, "state"),
      sensitivity: v.sensitivity as AuthorizationSensitivity | "unavailable",
      securityContext: Object.freeze(
        securityContext as unknown as AuthorizationDecisionArtifact["securityContext"],
      ),
      policy: Object.freeze(
        policy as unknown as AuthorizationDecisionArtifact["policy"],
      ),
      reason: v.reason as AuthorizationDecisionReason,
      evidence: Object.freeze(
        evidence as unknown as AuthorizationDecisionArtifact["evidence"],
      ),
    };
    if (!validArtifact(artifact)) return fail("state");
    return Object.freeze(artifact);
  } catch {
    return fail("state");
  }
}
export function createGovernedSecurityEvaluationSummary(
  value: unknown,
): GovernedSecurityEvaluationSummary {
  try {
    const v = captureCanonical(
      value,
      ["operationId", "subject", "securityContext"],
      "state",
    );
    const securityContext = captureCanonical(
      v.securityContext,
      ["context", "device", "session", "trustLevel"],
      "state",
    );
    for (const field of ["context", "device", "session", "trustLevel"])
      if (!DIMENSIONS.has(securityContext[field] as string))
        return fail("state");
    return Object.freeze({
      operationId: authorizationOperationIdentifier(v.operationId),
      subject: canonicalSubject(v.subject, "input"),
      securityContext: Object.freeze({
        context: securityContext.context as SecurityDimensionStatus,
        device: securityContext.device as SecurityDimensionStatus,
        session: securityContext.session as SecurityDimensionStatus,
        trustLevel: securityContext.trustLevel as SecurityDimensionStatus,
      }),
    });
  } catch {
    return fail("input");
  }
}
export function createAuthorizationEvaluationOutcome(
  value: unknown,
): AuthorizationEvaluationOutcome {
  try {
    const v = captureCanonical(
      value,
      ["authorization", "securityEvaluationSummary"],
      "input",
    );
    const authorization = createAuthorizationDecisionArtifact(v.authorization);
    const securityEvaluationSummary = createGovernedSecurityEvaluationSummary(
      v.securityEvaluationSummary,
    );
    if (
      authorization.operationId !== securityEvaluationSummary.operationId ||
      !subjectsEqual(
        authorization.subject,
        securityEvaluationSummary.subject,
      ) ||
      authorization.securityContext.context !==
        securityEvaluationSummary.securityContext.context ||
      authorization.securityContext.device !==
        securityEvaluationSummary.securityContext.device ||
      authorization.securityContext.session !==
        securityEvaluationSummary.securityContext.session ||
      authorization.securityContext.trustLevel !==
        securityEvaluationSummary.securityContext.trustLevel
    )
      return fail("input");
    return Object.freeze({ authorization, securityEvaluationSummary });
  } catch {
    return fail("input");
  }
}
function validArtifact(a: AuthorizationDecisionArtifact): boolean {
  if (
    a.policy.id !== "orion.minimum-authorization" ||
    a.policy.version !== "1.0.0" ||
    !["available", "unavailable"].includes(a.requirementsStatus) ||
    !["standard", "sensitive", "unavailable"].includes(a.sensitivity) ||
    !Object.values(a.securityContext).every((s) => DIMENSIONS.has(s))
  )
    return false;
  const unavailableContext = Object.values(a.securityContext).includes(
    "unavailable",
  );
  const availableRequirements = a.requirementsStatus === "available";
  const governedSensitivity =
    a.sensitivity === "standard" || a.sensitivity === "sensitive";
  const contextEvaluable = !unavailableContext;
  const permissionsEmpty = a.evaluatedPermissions.length === 0;
  const permissionsNonEmpty = !permissionsEmpty;
  const rows = [
    a.decision === "indeterminate" &&
      a.reason === "requirements-unavailable" &&
      a.requirementsStatus === "unavailable" &&
      a.evaluatedPermissions.length === 0 &&
      a.sensitivity === "unavailable" &&
      a.evidence.grantEvidenceStatus === "not-evaluated" &&
      a.evidence.confirmationStatus === "not-evaluated",
    a.decision === "indeterminate" &&
      a.reason === "security-context-unavailable" &&
      availableRequirements &&
      governedSensitivity &&
      unavailableContext &&
      a.evidence.grantEvidenceStatus === "not-evaluated" &&
      a.evidence.confirmationStatus === "not-evaluated",
    a.decision === "indeterminate" &&
      a.reason === "grant-evidence-unavailable" &&
      availableRequirements &&
      governedSensitivity &&
      contextEvaluable &&
      a.evidence.grantEvidenceStatus === "unavailable" &&
      a.evidence.confirmationStatus === "not-evaluated",
    a.decision === "deny" &&
      a.reason === "confirmation-required" &&
      availableRequirements &&
      contextEvaluable &&
      a.sensitivity === "sensitive" &&
      a.evidence.grantEvidenceStatus === "available" &&
      a.evidence.confirmationStatus === "absent",
    a.decision === "deny" &&
      a.reason === "missing-required-permission" &&
      availableRequirements &&
      contextEvaluable &&
      permissionsNonEmpty &&
      a.evidence.grantEvidenceStatus === "available" &&
      ((a.sensitivity === "standard" &&
        a.evidence.confirmationStatus === "not-required") ||
        (a.sensitivity === "sensitive" &&
          a.evidence.confirmationStatus === "confirmed")),
    a.decision === "allow" &&
      a.reason === "no-permission-required" &&
      availableRequirements &&
      contextEvaluable &&
      a.sensitivity === "standard" &&
      permissionsEmpty &&
      a.evidence.grantEvidenceStatus === "available" &&
      a.evidence.confirmationStatus === "not-required",
    a.decision === "allow" &&
      a.reason === "all-required-permissions-granted" &&
      availableRequirements &&
      contextEvaluable &&
      a.sensitivity === "standard" &&
      permissionsNonEmpty &&
      a.evidence.grantEvidenceStatus === "available" &&
      a.evidence.confirmationStatus === "not-required",
    a.decision === "allow" &&
      a.reason === "confirmation-and-permissions-satisfied" &&
      availableRequirements &&
      contextEvaluable &&
      a.sensitivity === "sensitive" &&
      a.evidence.grantEvidenceStatus === "available" &&
      a.evidence.confirmationStatus === "confirmed",
  ];
  return rows.filter(Boolean).length === 1;
}
