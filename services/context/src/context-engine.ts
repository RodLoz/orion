import {
  ContextLineageNotFoundError,
  ContextValidationFailureError,
  InvalidContextInputError,
  InvalidContextLifecycleTransitionError,
  InvalidIdentityContextProjectionError,
  NoActiveContextRevisionError,
  contextCreatedAt,
  contextLineageIdentity,
  contextRevisionIdentity,
  contextRevisionNumber,
  identityIdentifier,
  type ActiveContextRevision,
  type ComposeContextRevision,
  type ComposeContextRevisionRequest,
  type ContextConstructionValues,
  type ContextLineageIdentity,
  type ContextRevision,
  type GetActiveContextRevision,
  type GetActiveContextRevisionRequest,
  type IdentityContextFragment,
  type IdentityContextProjection,
} from "@orion/core";

import {
  createActiveRuntimeContextRevision,
  expireRuntimeContextRevision,
} from "./runtime-context-revision.js";

interface ContextLineageState {
  readonly lineageIdentity: ContextLineageIdentity;
  readonly revisions: ContextRevision[];
  activeRevision: ContextRevision | undefined;
}

interface NewLineageTarget {
  readonly kind: "new-lineage";
}

interface ExistingLineageTarget {
  readonly kind: "existing-lineage";
  readonly lineageIdentity: ContextLineageIdentity;
  readonly expectedActiveRevisionIdentity: ReturnType<
    typeof contextRevisionIdentity
  >;
}

type ValidatedComposeTarget = NewLineageTarget | ExistingLineageTarget;

interface ValidatedComposeRequest {
  readonly target: ValidatedComposeTarget;
  readonly identityProjection: IdentityContextProjection;
}

const CONTEXT_FAILURES = [
  InvalidContextInputError,
  InvalidContextLifecycleTransitionError,
  InvalidIdentityContextProjectionError,
  ContextLineageNotFoundError,
  ContextValidationFailureError,
  NoActiveContextRevisionError,
] as const;

function isContextFailure(error: unknown): error is Error {
  return CONTEXT_FAILURES.some((Failure) => error instanceof Failure);
}

function isPlainRecord(value: unknown): value is Record<string, unknown> {
  if (typeof value !== "object" || value === null || Array.isArray(value)) {
    return false;
  }
  const prototype = Object.getPrototypeOf(value) as unknown;
  return prototype === Object.prototype || prototype === null;
}

function hasExactFields(
  value: Record<string, unknown>,
  fields: readonly string[],
): boolean {
  const actual = Object.keys(value);
  return (
    actual.length === fields.length &&
    fields.every((field) => actual.includes(field))
  );
}

function sameProjection(
  left: IdentityContextProjection,
  right: IdentityContextProjection,
): boolean {
  if (left.state !== right.state) {
    return false;
  }
  return (
    left.state === "anonymous" ||
    (right.state === "authenticated" &&
      left.identityIdentifier === right.identityIdentifier)
  );
}

export class ContextEngine
  implements ComposeContextRevision, GetActiveContextRevision
{
  readonly #lineages = new Map<ContextLineageIdentity, ContextLineageState>();
  #engineState: ContextEngineLifecycleState = "initialize";

  public constructor(private readonly construction: ContextConstructionValues) {
    if (construction === undefined || construction === null) {
      throw new ContextEngineInitializationError();
    }
  }

  public get engineState(): ContextEngineLifecycleState {
    return this.#engineState;
  }

  public initialize(): void {
    this.requireEngineState("initialize");
    try {
      if (
        typeof this.construction.nextLineageIdentity !== "function" ||
        typeof this.construction.nextRevisionIdentity !== "function" ||
        typeof this.construction.nextCreatedAt !== "function"
      ) {
        throw new ContextEngineInitializationError();
      }
    } catch {
      throw new ContextEngineInitializationError();
    }
    this.#engineState = "ready";
  }

  public start(): void {
    this.requireEngineState("ready");
    this.#engineState = "running";
  }

  public stop(): void {
    this.requireEngineState("running");
    this.#engineState = "stopping";
    this.#engineState = "stopped";
  }

  public composeContextRevision(
    request: ComposeContextRevisionRequest,
  ): ActiveContextRevision;
  public composeContextRevision(request: unknown): ActiveContextRevision;
  public composeContextRevision(request: unknown): ActiveContextRevision {
    this.requireEngineState("running");
    try {
      return this.composeValidated(this.validateComposeRequest(request));
    } catch (error: unknown) {
      if (isContextFailure(error)) {
        throw error;
      }
      throw new ContextValidationFailureError();
    }
  }

  public getActiveContextRevision(
    request: GetActiveContextRevisionRequest,
  ): ActiveContextRevision;
  public getActiveContextRevision(request: unknown): ActiveContextRevision;
  public getActiveContextRevision(request: unknown): ActiveContextRevision {
    this.requireEngineState("running");
    try {
      if (
        !isPlainRecord(request) ||
        !hasExactFields(request, ["lineageIdentity"])
      ) {
        throw new InvalidContextInputError();
      }
      const lineageIdentity = contextLineageIdentity(
        Reflect.get(request, "lineageIdentity"),
      );
      const lineage = this.#lineages.get(lineageIdentity);
      if (lineage === undefined) {
        throw new ContextLineageNotFoundError();
      }
      if (lineage.activeRevision === undefined) {
        throw new NoActiveContextRevisionError();
      }
      if (lineage.activeRevision.lifecycleState !== "active") {
        throw new NoActiveContextRevisionError();
      }
      return lineage.activeRevision;
    } catch (error: unknown) {
      if (isContextFailure(error)) {
        throw error;
      }
      throw new InvalidContextInputError();
    }
  }

  private composeValidated(
    request: ValidatedComposeRequest,
  ): ActiveContextRevision {
    if (request.target.kind === "new-lineage") {
      return this.createFirstRevision(request.identityProjection);
    }
    return this.createSuccessorRevision(
      request.target,
      request.identityProjection,
    );
  }

  private createFirstRevision(
    identityProjection: IdentityContextProjection,
  ): ActiveContextRevision {
    const lineageIdentity = this.nextLineageIdentity();
    if (this.#lineages.has(lineageIdentity)) {
      throw new ContextValidationFailureError();
    }
    const revision = this.createRevision(
      lineageIdentity,
      contextRevisionNumber(1),
      undefined,
      identityProjection,
    );
    const lineage: ContextLineageState = {
      lineageIdentity,
      revisions: [revision],
      activeRevision: revision,
    };
    this.#lineages.set(lineageIdentity, lineage);
    return revision;
  }

  private createSuccessorRevision(
    target: ExistingLineageTarget,
    identityProjection: IdentityContextProjection,
  ): ActiveContextRevision {
    const lineage = this.#lineages.get(target.lineageIdentity);
    if (lineage === undefined) {
      throw new ContextLineageNotFoundError();
    }
    const current = lineage.activeRevision;
    if (current === undefined || current.lifecycleState !== "active") {
      throw new NoActiveContextRevisionError();
    }
    if (current.revisionIdentity !== target.expectedActiveRevisionIdentity) {
      throw new InvalidContextLifecycleTransitionError();
    }
    const currentProjection = current.fragments[0].projection;
    if (sameProjection(currentProjection, identityProjection)) {
      return current;
    }

    const successor = this.createRevision(
      lineage.lineageIdentity,
      contextRevisionNumber(current.revisionNumber + 1),
      current.revisionIdentity,
      identityProjection,
    );

    expireRuntimeContextRevision(current);
    lineage.revisions.push(successor);
    lineage.activeRevision = successor;
    return successor;
  }

  private createRevision(
    lineageIdentity: ContextLineageIdentity,
    revisionNumber: ReturnType<typeof contextRevisionNumber>,
    parentRevisionIdentity:
      ReturnType<typeof contextRevisionIdentity> | undefined,
    identityProjection: IdentityContextProjection,
  ): ContextRevision {
    const revisionIdentity = this.nextRevisionIdentity();
    if (
      [...this.#lineages.values()].some((lineage) =>
        lineage.revisions.some(
          (revision) => revision.revisionIdentity === revisionIdentity,
        ),
      )
    ) {
      throw new ContextValidationFailureError();
    }
    const createdAt = this.nextCreatedAt();
    const fragment: IdentityContextFragment = Object.freeze({
      kind: "identity",
      authoritativeOwner: "identity",
      projection: identityProjection,
    });
    return createActiveRuntimeContextRevision({
      lineageIdentity,
      revisionIdentity,
      revisionNumber,
      ...(parentRevisionIdentity === undefined
        ? {}
        : { parentRevisionIdentity }),
      createdAt,
      fragment,
    });
  }

  private nextLineageIdentity(): ContextLineageIdentity {
    try {
      return contextLineageIdentity(this.construction.nextLineageIdentity());
    } catch {
      throw new ContextValidationFailureError();
    }
  }

  private nextRevisionIdentity(): ReturnType<typeof contextRevisionIdentity> {
    try {
      return contextRevisionIdentity(this.construction.nextRevisionIdentity());
    } catch {
      throw new ContextValidationFailureError();
    }
  }

  private nextCreatedAt(): ReturnType<typeof contextCreatedAt> {
    try {
      return contextCreatedAt(this.construction.nextCreatedAt());
    } catch {
      throw new ContextValidationFailureError();
    }
  }

  private validateComposeRequest(request: unknown): ValidatedComposeRequest {
    try {
      if (
        !isPlainRecord(request) ||
        !hasExactFields(request, ["target", "currentIdentity"])
      ) {
        throw new InvalidContextInputError();
      }
      return Object.freeze({
        target: this.validateTarget(Reflect.get(request, "target")),
        identityProjection: this.validateIdentityProjection(
          Reflect.get(request, "currentIdentity"),
        ),
      });
    } catch (error: unknown) {
      if (isContextFailure(error)) {
        throw error;
      }
      throw new InvalidContextInputError();
    }
  }

  private validateTarget(target: unknown): ValidatedComposeTarget {
    if (!isPlainRecord(target)) {
      throw new InvalidContextInputError();
    }
    const kind = Reflect.get(target, "kind") as unknown;
    if (kind === "new-lineage") {
      if (!hasExactFields(target, ["kind"])) {
        throw new InvalidContextInputError();
      }
      return Object.freeze({ kind });
    }
    if (kind === "existing-lineage") {
      if (
        !hasExactFields(target, [
          "kind",
          "lineageIdentity",
          "expectedActiveRevisionIdentity",
        ])
      ) {
        throw new InvalidContextInputError();
      }
      return Object.freeze({
        kind,
        lineageIdentity: contextLineageIdentity(
          Reflect.get(target, "lineageIdentity"),
        ),
        expectedActiveRevisionIdentity: contextRevisionIdentity(
          Reflect.get(target, "expectedActiveRevisionIdentity"),
        ),
      });
    }
    throw new InvalidContextInputError();
  }

  private validateIdentityProjection(
    currentIdentity: unknown,
  ): IdentityContextProjection {
    try {
      if (!isPlainRecord(currentIdentity)) {
        throw new InvalidIdentityContextProjectionError();
      }
      const state = Reflect.get(currentIdentity, "state") as unknown;
      if (state === "anonymous") {
        if (!hasExactFields(currentIdentity, ["state"])) {
          throw new InvalidIdentityContextProjectionError();
        }
        return Object.freeze({ state, authoritativeOwner: "identity" });
      }
      if (state === "authenticated") {
        if (!hasExactFields(currentIdentity, ["state", "identityIdentifier"])) {
          throw new InvalidIdentityContextProjectionError();
        }
        return Object.freeze({
          state,
          authoritativeOwner: "identity",
          identityIdentifier: identityIdentifier(
            Reflect.get(currentIdentity, "identityIdentifier"),
          ),
        });
      }
      throw new InvalidIdentityContextProjectionError();
    } catch (error: unknown) {
      if (error instanceof InvalidIdentityContextProjectionError) {
        throw error;
      }
      throw new InvalidIdentityContextProjectionError();
    }
  }

  private requireEngineState(expected: ContextEngineLifecycleState): void {
    if (this.#engineState !== expected) {
      throw new ContextEngineLifecycleError();
    }
  }
}

export type ContextEngineLifecycleState =
  "initialize" | "ready" | "running" | "stopping" | "stopped";

export class ContextEngineInitializationError extends Error {
  public constructor() {
    super("Context Engine requires Context construction values.");
    this.name = "ContextEngineInitializationError";
  }
}

export class ContextEngineLifecycleError extends Error {
  public constructor() {
    super("Context Engine lifecycle does not permit this operation.");
    this.name = "ContextEngineLifecycleError";
  }
}
