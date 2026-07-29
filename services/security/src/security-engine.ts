import {
  InvalidAuthorizationEvidenceError,
  InvalidAuthorizationInputError,
  InvalidSecurityStateError,
  authorizationOperationIdentifier,
  createAuthorizationDecisionArtifact,
  createAuthorizationEvaluationOutcome,
  createConfirmationEvidence,
  createGovernedSecurityEvaluationSummary,
  createPermissionGrantEvidence,
  createProtectedActionRequirementsResolution,
  createSecurityEvaluationContext,
  extractAuthorizationEvaluationRequest,
  extractAuthorizationOutcomeEvaluationRequest,
  type AuthorizationDecision,
  type AuthorizationDecisionArtifact,
  type AuthorizationEvaluationOutcome,
  type AuthorizationDecisionReason,
  type AuthorizationResource,
  type AuthorizationSubject,
  type EvaluateAuthorization,
  type EvaluateAuthorizationOutcome,
  type VerifyAuthorizationEvaluationOutcome,
  type ResolveConfirmationEvidence,
  type ResolveGrantEvidence,
  type ResolveProtectedActionRequirements,
  type ResolveSecurityEvaluationContext,
} from "@orion/core";
import {
  evaluateMinimumAuthorizationPolicy,
  type MinimumAuthorizationPolicyResult,
} from "./security-policy.js";

export interface SecurityAuthorities {
  readonly requirements: ResolveProtectedActionRequirements;
  readonly context: ResolveSecurityEvaluationContext;
  readonly grants: ResolveGrantEvidence;
  readonly confirmation: ResolveConfirmationEvidence;
}
export type SecurityEngineLifecycleState =
  "initialize" | "ready" | "running" | "stopping" | "stopped";

const sameSubject = (a: AuthorizationSubject, b: AuthorizationSubject) =>
  a.kind === b.kind &&
  (a.kind === "anonymous" ||
    (b.kind === "authenticated" && a.identityId === b.identityId));
const sameResource = (a: AuthorizationResource, b: AuthorizationResource) =>
  a.kind === b.kind &&
  (a.kind === "unscoped" ||
    (b.kind === "identified" && a.resourceId === b.resourceId));
export class SecurityEngine
  implements
    EvaluateAuthorization,
    EvaluateAuthorizationOutcome,
    VerifyAuthorizationEvaluationOutcome
{
  #state: SecurityEngineLifecycleState = "initialize";
  #operating = false;
  readonly #issuedOutcomes = new WeakMap<
    AuthorizationEvaluationOutcome,
    {
      readonly authorization: AuthorizationDecisionArtifact;
      readonly summary: AuthorizationEvaluationOutcome["securityEvaluationSummary"];
    }
  >();
  public constructor(private readonly authorities: SecurityAuthorities) {}
  public get engineState(): SecurityEngineLifecycleState {
    return this.#state;
  }
  public initialize(): void {
    if (this.#state !== "initialize") throw new InvalidSecurityStateError();
    this.#state = "ready";
  }
  public start(): void {
    if (this.#state !== "ready") throw new InvalidSecurityStateError();
    this.#state = "running";
  }
  public stop(): void {
    if (this.#state !== "running" || this.#operating)
      throw new InvalidSecurityStateError();
    this.#state = "stopping";
    this.#state = "stopped";
  }
  public evaluateAuthorization(
    request: unknown,
  ): AuthorizationDecisionArtifact {
    return this.evaluate(request, "artifact").authorization;
  }
  public evaluateAuthorizationOutcome(
    request: unknown,
  ): AuthorizationEvaluationOutcome {
    return this.evaluate(request, "outcome");
  }
  public verifyAuthorizationEvaluationOutcome(request: unknown): boolean {
    let candidate: unknown;
    let operationId: unknown;
    try {
      if (
        typeof request !== "object" ||
        request === null ||
        Array.isArray(request)
      )
        throw new Error();
      const prototype = Reflect.getPrototypeOf(request);
      if (prototype !== Object.prototype && prototype !== null)
        throw new Error();
      const keys = Reflect.ownKeys(request);
      if (
        keys.length !== 3 ||
        keys.some(
          (key) =>
            typeof key !== "string" ||
            !["intent", "outcome", "operationId"].includes(key),
        )
      )
        throw new Error();
      const read = (key: string) => {
        const descriptor = Reflect.getOwnPropertyDescriptor(request, key);
        if (
          descriptor === undefined ||
          descriptor.enumerable !== true ||
          !("value" in descriptor) ||
          descriptor.value === undefined
        )
          throw new Error();
        return descriptor.value;
      };
      if (read("intent") !== "verify-authorization-evaluation-outcome")
        throw new Error();
      candidate = read("outcome");
      operationId = authorizationOperationIdentifier(read("operationId"));
    } catch {
      throw new InvalidAuthorizationInputError();
    }
    if (typeof candidate !== "object" || candidate === null) return false;
    const issued = this.#issuedOutcomes.get(
      candidate as AuthorizationEvaluationOutcome,
    );
    if (issued === undefined) return false;
    try {
      const authorization = Reflect.getOwnPropertyDescriptor(
        candidate,
        "authorization",
      );
      const summary = Reflect.getOwnPropertyDescriptor(
        candidate,
        "securityEvaluationSummary",
      );
      if (
        authorization === undefined ||
        !("value" in authorization) ||
        summary === undefined ||
        !("value" in summary)
      )
        throw new InvalidSecurityStateError();
      return (
        authorization.value === issued.authorization &&
        summary.value === issued.summary &&
        issued.authorization.operationId === operationId &&
        issued.summary.operationId === operationId
      );
    } catch (error) {
      if (error instanceof InvalidSecurityStateError) throw error;
      throw new InvalidSecurityStateError();
    }
  }
  private evaluate(
    request: unknown,
    contract: "artifact" | "outcome",
  ): AuthorizationEvaluationOutcome {
    this.begin();
    try {
      let target: ReturnType<typeof extractAuthorizationEvaluationRequest>;
      try {
        target =
          contract === "artifact"
            ? extractAuthorizationEvaluationRequest(request)
            : extractAuthorizationOutcomeEvaluationRequest(request);
      } catch {
        throw new InvalidAuthorizationInputError();
      }
      const requirements = createProtectedActionRequirementsResolution(
        this.call(() =>
          this.authorities.requirements.resolveProtectedActionRequirements({
            intent: "resolve-protected-action-requirements",
            operationId: target.operationId,
            action: target.action,
            resource: target.resource,
          }),
        ),
      );
      if (
        (requirements.status === "available" &&
          (requirements.requirements.operationId !== target.operationId ||
            requirements.requirements.action !== target.action ||
            !sameResource(
              requirements.requirements.resource,
              target.resource,
            ))) ||
        (requirements.status === "unavailable" &&
          (requirements.operationId !== target.operationId ||
            requirements.action !== target.action ||
            !sameResource(requirements.resource, target.resource)))
      )
        throw new InvalidAuthorizationEvidenceError();

      const context = createSecurityEvaluationContext(
        this.call(() =>
          this.authorities.context.resolveSecurityEvaluationContext({
            intent: "resolve-security-evaluation-context",
            operationId: target.operationId,
            action: target.action,
            resource: target.resource,
          }),
        ),
      );
      if (context.operationId !== target.operationId)
        throw new InvalidAuthorizationEvidenceError();
      if (requirements.status === "unavailable")
        return this.outcome(target, context, {
          decision: "indeterminate",
          reason: "requirements-unavailable",
          requirementsStatus: "unavailable",
          permissions: [],
          sensitivity: "unavailable",
          grant: "not-evaluated",
          confirmation: "not-evaluated",
        });
      const governed = requirements.requirements;
      if (Object.values(context).some((v) => v === "unavailable"))
        return this.outcome(target, context, {
          decision: "indeterminate",
          reason: "security-context-unavailable",
          requirementsStatus: "available",
          permissions: governed.requiredPermissions,
          sensitivity: governed.sensitivity,
          grant: "not-evaluated",
          confirmation: "not-evaluated",
        });
      const evidence = createPermissionGrantEvidence(
        this.call(() =>
          this.authorities.grants.resolveGrantEvidence({
            intent: "resolve-grant-evidence",
            operationId: target.operationId,
            subject: context.subject,
            action: target.action,
            resource: target.resource,
            requiredPermissions: governed.requiredPermissions,
          }),
        ),
      );
      if (
        evidence.operationId !== target.operationId ||
        evidence.action !== target.action ||
        !sameSubject(evidence.subject, context.subject) ||
        !sameResource(evidence.resource, target.resource) ||
        evidence.evaluatedPermissions.length !==
          governed.requiredPermissions.length ||
        evidence.evaluatedPermissions.some(
          (p, i) => p !== governed.requiredPermissions[i],
        )
      )
        throw new InvalidAuthorizationEvidenceError();
      if (
        evidence.status === "available" &&
        evidence.grants.some(
          (g) =>
            !sameSubject(g.subject, context.subject) ||
            !sameResource(g.resource, target.resource) ||
            !governed.requiredPermissions.includes(g.permission),
        )
      )
        throw new InvalidAuthorizationEvidenceError();
      if (evidence.status === "unavailable")
        return this.outcome(target, context, {
          decision: "indeterminate",
          reason: "grant-evidence-unavailable",
          requirementsStatus: "available",
          permissions: governed.requiredPermissions,
          sensitivity: governed.sensitivity,
          grant: "unavailable",
          confirmation: "not-evaluated",
        });
      const confirmation =
        governed.sensitivity === "sensitive"
          ? createConfirmationEvidence(
              this.call(() =>
                this.authorities.confirmation.resolveConfirmationEvidence({
                  intent: "resolve-confirmation-evidence",
                  operationId: target.operationId,
                  subject: context.subject,
                  action: target.action,
                  resource: target.resource,
                }),
              ),
            )
          : ({ status: "absent" } as const);
      if (
        confirmation.status === "confirmed" &&
        (governed.sensitivity === "standard" ||
          confirmation.operationId !== target.operationId ||
          confirmation.action !== target.action ||
          !sameSubject(confirmation.subject, context.subject) ||
          !sameResource(confirmation.resource, target.resource))
      )
        throw new InvalidAuthorizationEvidenceError();
      if (
        governed.sensitivity === "sensitive" &&
        confirmation.status === "absent"
      )
        return this.outcome(target, context, {
          decision: "deny",
          reason: "confirmation-required",
          requirementsStatus: "available",
          permissions: governed.requiredPermissions,
          sensitivity: "sensitive",
          grant: "available",
          confirmation: "absent",
        });
      const granted = new Set(evidence.grants.map((g) => g.permission));
      const missing = governed.requiredPermissions.some((p) => !granted.has(p));
      const decision: AuthorizationDecision = missing ? "deny" : "allow";
      const reason: AuthorizationDecisionReason = missing
        ? "missing-required-permission"
        : governed.sensitivity === "sensitive"
          ? "confirmation-and-permissions-satisfied"
          : governed.requiredPermissions.length === 0
            ? "no-permission-required"
            : "all-required-permissions-granted";
      return this.outcome(target, context, {
        decision,
        reason,
        requirementsStatus: "available",
        permissions: governed.requiredPermissions,
        sensitivity: governed.sensitivity,
        grant: "available",
        confirmation:
          governed.sensitivity === "standard" ? "not-required" : "confirmed",
      });
    } finally {
      this.#operating = false;
    }
  }
  private begin() {
    if (this.#state !== "running" || this.#operating)
      throw new InvalidSecurityStateError();
    const a = this.authorities;
    try {
      if (
        typeof a !== "object" ||
        a === null ||
        typeof a.requirements?.resolveProtectedActionRequirements !==
          "function" ||
        typeof a.context?.resolveSecurityEvaluationContext !== "function" ||
        typeof a.grants?.resolveGrantEvidence !== "function" ||
        typeof a.confirmation?.resolveConfirmationEvidence !== "function"
      )
        throw new Error();
    } catch {
      throw new InvalidSecurityStateError();
    }
    this.#operating = true;
  }
  private call<T>(operation: () => T): T {
    try {
      return operation();
    } catch {
      throw new InvalidSecurityStateError();
    }
  }
  private outcome(
    target: ReturnType<typeof extractAuthorizationEvaluationRequest>,
    context: ReturnType<typeof createSecurityEvaluationContext>,
    row: MinimumAuthorizationPolicyResult,
  ) {
    try {
      const evaluated = evaluateMinimumAuthorizationPolicy(row);
      const authorization = createAuthorizationDecisionArtifact({
        operationId: target.operationId,
        decision: evaluated.decision,
        subject: context.subject,
        action: target.action,
        resource: target.resource,
        requirementsStatus: evaluated.requirementsStatus,
        evaluatedPermissions: evaluated.permissions,
        sensitivity: evaluated.sensitivity,
        securityContext: {
          context: context.context,
          device: context.device,
          session: context.session,
          trustLevel: context.trustLevel,
        },
        policy: { id: "orion.minimum-authorization", version: "1.0.0" },
        reason: evaluated.reason,
        evidence: {
          grantEvidenceStatus: evaluated.grant,
          confirmationStatus: evaluated.confirmation,
        },
      });
      const securityEvaluationSummary = createGovernedSecurityEvaluationSummary(
        {
          operationId: target.operationId,
          subject: context.subject,
          securityContext: {
            context: context.context,
            device: context.device,
            session: context.session,
            trustLevel: context.trustLevel,
          },
        },
      );
      const outcome = createAuthorizationEvaluationOutcome({
        authorization,
        securityEvaluationSummary,
      });
      this.#issuedOutcomes.set(outcome, {
        authorization: outcome.authorization,
        summary: outcome.securityEvaluationSummary,
      });
      return outcome;
    } catch {
      throw new InvalidSecurityStateError();
    }
  }
}
