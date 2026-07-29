import {
  InvalidSkillContextAuthorityError,
  InvalidSkillExecutionStateError,
  authorizationOperationIdentifier,
  identityIdentifier,
  type AuthorizationSubject,
  type SkillExecutionContextAuthorityPort,
  type SkillExecutionContextProjection,
} from "@orion/core";

export class ProcessLocalSkillExecutionContextAuthority implements SkillExecutionContextAuthorityPort {
  readonly #issued = new WeakMap<object, string>();

  public constructor(
    private readonly verifyRevision: (candidate: unknown) => boolean,
  ) {}

  public resolve(
    request: Parameters<SkillExecutionContextAuthorityPort["resolve"]>[0],
  ): SkillExecutionContextProjection {
    let source: Record<string, unknown>;
    let revision: unknown;
    try {
      source = exactRecord(request, [
        "intent",
        "operationId",
        "contextRevision",
      ]);
      if (
        source.intent !== "resolve-skill-execution-context" ||
        authorizationOperationIdentifier(source.operationId) !==
          source.operationId
      )
        throw new Error();
      revision = source.contextRevision;
    } catch {
      throw new InvalidSkillContextAuthorityError();
    }
    try {
      if (this.verifyRevision(revision) !== true)
        throw new InvalidSkillContextAuthorityError();
    } catch (error) {
      if (error instanceof InvalidSkillContextAuthorityError) throw error;
      throw new InvalidSkillExecutionStateError();
    }
    try {
      const revisionSource = extractRevision(revision);
      const fragments = exactArray(revisionSource.fragments, 1);
      const fragment = exactRecord(fragments[0], [
        "kind",
        "authoritativeOwner",
        "projection",
      ]);
      if (
        revisionSource.lifecycleState !== "active" ||
        fragment.kind !== "identity" ||
        fragment.authoritativeOwner !== "identity"
      )
        throw new Error();
      const identityState = ownDataValue(fragment.projection, "state");
      const identity = exactRecord(
        fragment.projection,
        identityState === "anonymous"
          ? ["state", "authoritativeOwner"]
          : ["state", "identityIdentifier", "authoritativeOwner"],
      );
      if (
        identity.authoritativeOwner !== "identity" ||
        typeof revisionSource.lineageIdentity !== "string" ||
        typeof revisionSource.revisionIdentity !== "string"
      )
        throw new Error();
      const subject: AuthorizationSubject =
        identity.state === "anonymous"
          ? Object.freeze({ kind: "anonymous" })
          : identity.state === "authenticated" &&
              typeof identity.identityIdentifier === "string"
            ? Object.freeze({
                kind: "authenticated",
                identityId: identityIdentifier(identity.identityIdentifier),
              })
            : (() => {
                throw new Error();
              })();
      const projection = Object.freeze({
        operationId: source.operationId as never,
        lineageId: revisionSource.lineageIdentity as never,
        revisionId: revisionSource.revisionIdentity as never,
        subject,
      });
      this.#issued.set(projection, source.operationId as string);
      return projection;
    } catch {
      throw new InvalidSkillContextAuthorityError();
    }
  }

  public verify(
    candidate: unknown,
    expected: { readonly operationId: string },
  ): boolean {
    try {
      return (
        typeof candidate === "object" &&
        candidate !== null &&
        this.#issued.get(candidate) === expected.operationId
      );
    } catch {
      return false;
    }
  }
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

function exactArray(value: unknown, length: number): readonly unknown[] {
  if (
    !Array.isArray(value) ||
    Reflect.getPrototypeOf(value) !== Array.prototype
  )
    throw new Error();
  const keys = Reflect.ownKeys(value);
  if (
    Reflect.getOwnPropertyDescriptor(value, "length")?.value !== length ||
    keys.length !== length + 1
  )
    throw new Error();
  const result: unknown[] = [];
  for (let index = 0; index < length; index += 1) {
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

function extractRevision(value: unknown): Record<string, unknown> {
  if (typeof value !== "object" || value === null || Array.isArray(value))
    throw new Error();
  const prototype = Reflect.getPrototypeOf(value);
  if (prototype !== Object.prototype && prototype !== null) throw new Error();
  const required = [
    "lineageIdentity",
    "revisionIdentity",
    "revisionNumber",
    "creationMetadata",
    "lifecycleState",
    "fragments",
  ];
  const keys = Reflect.ownKeys(value);
  if (
    !required.every((field) => keys.includes(field)) ||
    keys.some(
      (key) =>
        typeof key !== "string" ||
        (!required.includes(key) && key !== "parentRevisionIdentity"),
    ) ||
    (keys.length !== 6 && keys.length !== 7)
  )
    throw new Error();
  const result: Record<string, unknown> = Object.create(null);
  for (const field of required) {
    const descriptor = Reflect.getOwnPropertyDescriptor(value, field);
    if (descriptor === undefined || descriptor.enumerable !== true)
      throw new Error();
    if (field === "lifecycleState" && !("value" in descriptor)) {
      if (typeof descriptor.get !== "function" || descriptor.set !== undefined)
        throw new Error();
      result[field] = Reflect.apply(descriptor.get, value, []);
    } else if ("value" in descriptor && descriptor.value !== undefined) {
      result[field] = descriptor.value;
    } else {
      throw new Error();
    }
  }
  return result;
}

function ownDataValue(value: unknown, field: string): unknown {
  if (typeof value !== "object" || value === null) throw new Error();
  const descriptor = Reflect.getOwnPropertyDescriptor(value, field);
  if (
    descriptor === undefined ||
    descriptor.enumerable !== true ||
    !("value" in descriptor) ||
    descriptor.value === undefined
  )
    throw new Error();
  return descriptor.value;
}
