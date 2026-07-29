import {
  InvalidGovernedAuthorizationEvaluationError,
  InvalidSkillExecutionStateError,
  createAuthorizationEvaluationOutcome,
  type AuthorizationEvaluationOutcome,
  type AuthorizationEvaluationOutcomeAuthorityPort,
  type AuthorizationResource,
  type EvaluateAuthorizationOutcome,
  type VerifyAuthorizationEvaluationOutcome,
} from "@orion/core";

export class ProcessLocalGovernedAuthorizationEvaluationAuthority implements AuthorizationEvaluationOutcomeAuthorityPort {
  public constructor(
    private readonly evaluator: EvaluateAuthorizationOutcome,
    private readonly verifier: VerifyAuthorizationEvaluationOutcome,
  ) {}

  public resolve(
    request: Parameters<
      AuthorizationEvaluationOutcomeAuthorityPort["resolve"]
    >[0],
  ): AuthorizationEvaluationOutcome {
    let nested: Record<string, unknown>;
    try {
      const outer = exactRecord(request, ["intent", "request"]);
      if (outer.intent !== "resolve-governed-authorization-evaluation")
        throw new Error();
      nested = exactRecord(outer.request, [
        "intent",
        "operationId",
        "action",
        "resource",
      ]);
      if (nested.intent !== "evaluate-authorization-outcome") throw new Error();
    } catch {
      throw new InvalidGovernedAuthorizationEvaluationError();
    }
    let outcome: AuthorizationEvaluationOutcome;
    try {
      outcome = this.evaluator.evaluateAuthorizationOutcome({
        intent: "evaluate-authorization-outcome",
        operationId: nested.operationId,
        action: nested.action,
        resource: nested.resource,
      });
    } catch {
      throw new InvalidSkillExecutionStateError();
    }
    let reconstructed: AuthorizationEvaluationOutcome;
    try {
      reconstructed = createAuthorizationEvaluationOutcome(outcome);
    } catch {
      throw new InvalidGovernedAuthorizationEvaluationError();
    }
    let verified: unknown;
    try {
      verified = this.verifier.verifyAuthorizationEvaluationOutcome({
        intent: "verify-authorization-evaluation-outcome",
        outcome,
        operationId: nested.operationId as never,
      });
    } catch {
      throw new InvalidSkillExecutionStateError();
    }
    if (typeof verified !== "boolean")
      throw new InvalidSkillExecutionStateError();
    if (!verified) throw new InvalidGovernedAuthorizationEvaluationError();
    try {
      if (
        !Object.is(
          reconstructed.authorization.operationId,
          nested.operationId,
        ) ||
        !Object.is(reconstructed.authorization.action, nested.action) ||
        !sameResource(reconstructed.authorization.resource, nested.resource)
      )
        throw new Error();
    } catch {
      throw new InvalidGovernedAuthorizationEvaluationError();
    }
    return outcome;
  }

  public verifyAuthorizationEvaluationOutcome(request: unknown): boolean {
    return this.verifier.verifyAuthorizationEvaluationOutcome(request);
  }
}

function sameResource(
  expected: AuthorizationResource,
  candidate: unknown,
): boolean {
  const kind =
    typeof candidate === "object" && candidate !== null
      ? Reflect.getOwnPropertyDescriptor(candidate, "kind")?.value
      : undefined;
  const source = exactRecord(
    candidate,
    kind === "unscoped" ? ["kind"] : ["kind", "resourceId"],
  );
  return expected.kind === "unscoped"
    ? source.kind === "unscoped"
    : source.kind === "identified" &&
        Object.is(expected.resourceId, source.resourceId);
}

function exactRecord(
  value: unknown,
  fields: readonly string[],
): Record<string, unknown> {
  if (typeof value !== "object" || value === null || Array.isArray(value))
    throw new Error();
  const prototype = Reflect.getPrototypeOf(value);
  if (prototype !== Object.prototype && prototype !== null) throw new Error();
  const keys = Reflect.ownKeys(value);
  if (
    keys.length !== fields.length ||
    keys.some((key) => typeof key !== "string" || !fields.includes(key))
  )
    throw new Error();
  const result: Record<string, unknown> = Object.create(null);
  for (const field of fields) {
    const descriptor = Reflect.getOwnPropertyDescriptor(value, field);
    if (
      descriptor === undefined ||
      descriptor.enumerable !== true ||
      !("value" in descriptor) ||
      descriptor.value === undefined
    )
      throw new Error();
    result[field] = descriptor.value;
  }
  return result;
}
