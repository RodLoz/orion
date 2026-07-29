import {
  InvalidSkillAuthorityError,
  InvalidSkillExecutionStateError,
  authorizationActionIdentifier,
  authorizationResourceIdentifier,
  codePointOrder,
  type AuthorizationResource,
  type AuthorizationSensitivity,
  type BoundSkillInvocationTarget,
  type SkillInvocationRequirementsAuthorityPort,
  type SkillInvocationRequirementsProjection,
  type SkillInvocationSensitivityAuthorityPort,
  type SkillInvocationSensitivityResolution,
} from "@orion/core";

export interface SkillInvocationClassification {
  readonly action: string;
  readonly resourceId: string;
  readonly sensitivity: AuthorizationSensitivity;
}

export class ProcessLocalSkillInvocationSensitivityAuthority implements SkillInvocationSensitivityAuthorityPort {
  readonly #table = new Map<string, AuthorizationSensitivity>();
  readonly #issued = new WeakMap<object, string>();
  readonly #valid: boolean;

  public constructor(entries: readonly SkillInvocationClassification[]) {
    let valid = true;
    try {
      for (const candidate of exactArray(entries, 64)) {
        const source = exactRecord(candidate, [
          "action",
          "resourceId",
          "sensitivity",
        ]);
        const action = authorizationActionIdentifier(source.action);
        const resourceId = authorizationResourceIdentifier(source.resourceId);
        if (
          source.sensitivity !== "standard" &&
          source.sensitivity !== "sensitive"
        )
          throw new Error();
        const key = `${action}\u0000${resourceId}`;
        if (this.#table.has(key)) valid = false;
        this.#table.set(key, source.sensitivity);
      }
    } catch {
      valid = false;
    }
    this.#valid = valid;
  }

  public resolve(
    request: Parameters<SkillInvocationSensitivityAuthorityPort["resolve"]>[0],
  ): SkillInvocationSensitivityResolution {
    if (!this.#valid) throw new InvalidSkillExecutionStateError();
    let key: string;
    try {
      const source = exactRecord(request, ["intent", "action", "resource"]);
      const resource = exactResource(source.resource);
      if (source.intent !== "resolve-skill-invocation-sensitivity")
        throw new Error();
      key = `${authorizationActionIdentifier(source.action)}\u0000${resourceKey(resource)}`;
    } catch {
      throw new InvalidSkillAuthorityError();
    }
    try {
      const sensitivity = this.#table.get(key);
      const result: SkillInvocationSensitivityResolution =
        sensitivity === undefined
          ? Object.freeze({ status: "unavailable" })
          : Object.freeze({ status: "available", sensitivity });
      this.#issued.set(result, key);
      return result;
    } catch {
      throw new InvalidSkillExecutionStateError();
    }
  }

  public verify(
    candidate: unknown,
    expected: {
      readonly action: string;
      readonly resource: AuthorizationResource;
    },
  ): boolean {
    try {
      if (typeof candidate !== "object" || candidate === null) return false;
      return (
        this.#issued.get(candidate) ===
        `${expected.action}\u0000${resourceKey(expected.resource)}`
      );
    } catch {
      return false;
    }
  }
}

function exactArray(value: unknown, maximum: number): readonly unknown[] {
  if (
    !Array.isArray(value) ||
    Reflect.getPrototypeOf(value) !== Array.prototype
  )
    throw new Error();
  const length = Reflect.getOwnPropertyDescriptor(value, "length")?.value;
  const keys = Reflect.ownKeys(value);
  if (
    !Number.isSafeInteger(length) ||
    (length as number) < 0 ||
    (length as number) > maximum ||
    keys.length !== (length as number) + 1
  )
    throw new Error();
  const result: unknown[] = [];
  for (let index = 0; index < (length as number); index += 1) {
    const descriptor = Reflect.getOwnPropertyDescriptor(value, String(index));
    if (
      descriptor === undefined ||
      descriptor.enumerable !== true ||
      !("value" in descriptor)
    )
      throw new Error();
    result.push(descriptor.value);
  }
  return result;
}

export class ProcessLocalSkillInvocationRequirementsAuthority implements SkillInvocationRequirementsAuthorityPort {
  readonly #issued = new WeakMap<object, string>();
  public constructor(
    private readonly sensitivity: SkillInvocationSensitivityAuthorityPort,
    private readonly verifyTarget: (candidate: unknown) => boolean,
  ) {}

  public resolve(
    request: Parameters<SkillInvocationRequirementsAuthorityPort["resolve"]>[0],
  ): SkillInvocationRequirementsProjection {
    let target: BoundSkillInvocationTarget;
    try {
      const source = exactRecord(request, ["intent", "target"]);
      if (
        source.intent !== "resolve-skill-invocation-requirements" ||
        !this.verifyTarget(source.target)
      )
        throw new Error();
      target = reconstructTarget(source.target);
    } catch {
      throw new InvalidSkillAuthorityError();
    }
    let classification: unknown;
    try {
      classification = this.sensitivity.resolve({
        intent: "resolve-skill-invocation-sensitivity",
        action: target.action,
        resource: target.resource,
      });
    } catch (error) {
      if (error instanceof InvalidSkillAuthorityError) throw error;
      throw new InvalidSkillExecutionStateError();
    }
    if (
      !verifyExternal(() =>
        this.sensitivity.verify(classification, {
          action: target.action,
          resource: target.resource,
        }),
      )
    )
      throw new InvalidSkillAuthorityError();
    let governedClassification: SkillInvocationSensitivityResolution;
    try {
      governedClassification = reconstructClassification(classification);
    } catch {
      throw new InvalidSkillAuthorityError();
    }
    const result: SkillInvocationRequirementsProjection =
      governedClassification.status === "unavailable"
        ? Object.freeze({
            status: "unavailable",
            operationId: target.operationId,
            action: target.action,
            resource: target.resource,
          })
        : governedClassification.status === "available"
          ? Object.freeze({
              status: "available",
              requirements: Object.freeze({
                operationId: target.operationId,
                action: target.action,
                resource: target.resource,
                requiredPermissions: Object.freeze(
                  [...target.requiredPermissions].sort(codePointOrder),
                ),
                sensitivity: governedClassification.sensitivity,
              }),
            })
          : (() => {
              throw new InvalidSkillAuthorityError();
            })();
    this.#issued.set(result, key(target));
    return result;
  }

  public verify(
    candidate: unknown,
    expected: {
      readonly operationId: string;
      readonly action: string;
      readonly resource: AuthorizationResource;
    },
  ): boolean {
    try {
      return (
        typeof candidate === "object" &&
        candidate !== null &&
        this.#issued.get(candidate) ===
          `${expected.operationId}\u0000${expected.action}\u0000${resourceKey(expected.resource)}`
      );
    } catch {
      return false;
    }
  }
}

const resourceKey = (resource: AuthorizationResource) =>
  resource.kind === "identified" ? resource.resourceId : "unscoped";
const key = (target: BoundSkillInvocationTarget) =>
  `${target.operationId}\u0000${target.action}\u0000${resourceKey(target.resource)}`;

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
    keys.some((item) => typeof item !== "string" || !fields.includes(item))
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

function exactResource(value: unknown): AuthorizationResource {
  const kind =
    typeof value === "object" && value !== null
      ? Reflect.getOwnPropertyDescriptor(value, "kind")?.value
      : undefined;
  const source = exactRecord(
    value,
    kind === "unscoped" ? ["kind"] : ["kind", "resourceId"],
  );
  if (source.kind === "unscoped") return Object.freeze({ kind: "unscoped" });
  if (source.kind !== "identified") throw new Error();
  return Object.freeze({
    kind: "identified",
    resourceId: authorizationResourceIdentifier(source.resourceId),
  });
}

function reconstructClassification(
  value: unknown,
): SkillInvocationSensitivityResolution {
  const status =
    typeof value === "object" && value !== null
      ? Reflect.getOwnPropertyDescriptor(value, "status")?.value
      : undefined;
  const source = exactRecord(
    value,
    status === "unavailable" ? ["status"] : ["status", "sensitivity"],
  );
  if (source.status === "unavailable")
    return Object.freeze({ status: "unavailable" });
  if (
    source.status !== "available" ||
    (source.sensitivity !== "standard" && source.sensitivity !== "sensitive")
  )
    throw new InvalidSkillAuthorityError();
  return Object.freeze({
    status: "available",
    sensitivity: source.sensitivity,
  });
}

function reconstructTarget(value: unknown): BoundSkillInvocationTarget {
  const source = exactRecord(value, [
    "operationId",
    "skillId",
    "skillVersion",
    "capability",
    "action",
    "resource",
    "requiredPermissions",
    "inputNames",
    "outputNames",
    "failureModes",
  ]);
  for (const field of [
    "operationId",
    "skillId",
    "skillVersion",
    "capability",
    "action",
  ])
    if (typeof source[field] !== "string") throw new Error();
  return Object.freeze({
    operationId: source.operationId,
    skillId: source.skillId,
    skillVersion: source.skillVersion,
    capability: source.capability,
    action: authorizationActionIdentifier(source.action),
    resource: exactResource(source.resource),
    requiredPermissions: exactStringArray(source.requiredPermissions, 64),
    inputNames: exactStringArray(source.inputNames, 64),
    outputNames: exactStringArray(source.outputNames, 64),
    failureModes: exactStringArray(source.failureModes, 64),
  }) as unknown as BoundSkillInvocationTarget;
}

function exactStringArray(value: unknown, maximum: number): readonly string[] {
  if (
    !Array.isArray(value) ||
    Reflect.getPrototypeOf(value) !== Array.prototype
  )
    throw new Error();
  const length = Reflect.getOwnPropertyDescriptor(value, "length")?.value;
  const keys = Reflect.ownKeys(value);
  if (
    !Number.isSafeInteger(length) ||
    (length as number) < 0 ||
    (length as number) > maximum ||
    keys.length !== (length as number) + 1
  )
    throw new Error();
  const result: string[] = [];
  for (let index = 0; index < (length as number); index += 1) {
    const descriptor = Reflect.getOwnPropertyDescriptor(value, String(index));
    if (
      descriptor === undefined ||
      descriptor.enumerable !== true ||
      !("value" in descriptor) ||
      typeof descriptor.value !== "string"
    )
      throw new Error();
    result.push(descriptor.value);
  }
  return Object.freeze(result);
}

function verifyExternal(operation: () => unknown): boolean {
  let result: unknown;
  try {
    result = operation();
  } catch {
    throw new InvalidSkillExecutionStateError();
  }
  if (typeof result !== "boolean") throw new InvalidSkillExecutionStateError();
  return result;
}
