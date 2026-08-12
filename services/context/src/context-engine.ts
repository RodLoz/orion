import {
  ContextLineageNotFoundError,
  ContextValidationFailureError,
  InvalidContextAuthorityStateError,
  InvalidContextInputError,
  InvalidContextLifecycleTransitionError,
  InvalidIdentityContextProjectionError,
  InvalidKnowledgeContextProjectionError,
  NoActiveContextRevisionError,
  contextCreatedAt,
  contextLineageIdentity,
  contextRevisionIdentity,
  contextRevisionNumber,
  identityIdentifier,
  knowledgeIdentity,
  knowledgeVersion,
  type ActiveContextRevision,
  type ComposeContextRevision,
  type ComposeContextRevisionRequest,
  type ComposeContextRevisionWithKnowledge,
  type ComposeContextRevisionWithKnowledgeRequest,
  type ContextConstructionValues,
  type ContextLineageIdentity,
  type ContextRevision,
  type GetActiveContextRevision,
  type GetActiveContextRevisionRequest,
  type GetKnowledge,
  type IdentityContextFragment,
  type IdentityContextProjection,
  type KnowledgeContextFragment,
  type KnowledgeContextProjection,
  type KnowledgeReference,
  type PrepareContextRevision,
  type PrepareContextRevisionRequest,
  type PrepareContextRevisionWithKnowledge,
  type PrepareContextRevisionWithKnowledgeRequest,
  type ResolveCurrentIdentity,
  type VerifyActiveContextRevisionAuthority,
  type VerifyActiveContextRevisionAuthorityRequest,
} from "@orion/core";

import { ContextAuthority } from "./context-authority.js";
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

interface ValidatedKnowledgeComposeRequest extends ValidatedComposeRequest {
  readonly knowledgeProjection: KnowledgeContextProjection;
}

interface ValidatedPrepareRequest {
  readonly target: ValidatedComposeTarget;
  readonly identityResolutionRequest: unknown;
}

interface ValidatedKnowledgePrepareRequest extends ValidatedPrepareRequest {
  readonly knowledgeRetrievalRequest: unknown;
}

const CONTEXT_FAILURES = [
  InvalidContextInputError,
  InvalidContextLifecycleTransitionError,
  InvalidIdentityContextProjectionError,
  InvalidKnowledgeContextProjectionError,
  ContextLineageNotFoundError,
  ContextValidationFailureError,
  NoActiveContextRevisionError,
  InvalidContextAuthorityStateError,
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
  implements
    ComposeContextRevision,
    ComposeContextRevisionWithKnowledge,
    GetActiveContextRevision,
    PrepareContextRevision,
    PrepareContextRevisionWithKnowledge,
    VerifyActiveContextRevisionAuthority
{
  readonly #lineages = new Map<ContextLineageIdentity, ContextLineageState>();
  readonly #authority = new ContextAuthority();
  #engineState: ContextEngineLifecycleState = "initialize";

  public constructor(
    private readonly construction: ContextConstructionValues,
    private readonly currentIdentityResolver: ResolveCurrentIdentity,
    private readonly knowledgeResolver?: GetKnowledge,
  ) {
    if (
      construction === undefined ||
      construction === null ||
      currentIdentityResolver === undefined ||
      currentIdentityResolver === null
    ) {
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
        typeof this.construction.nextCreatedAt !== "function" ||
        typeof this.currentIdentityResolver.resolveCurrentIdentity !==
          "function" ||
        (this.knowledgeResolver !== undefined &&
          typeof this.knowledgeResolver.getKnowledge !== "function")
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

  public prepareContextRevision(
    request: PrepareContextRevisionRequest,
  ): ActiveContextRevision;
  public prepareContextRevision(request: unknown): ActiveContextRevision;
  public prepareContextRevision(request: unknown): ActiveContextRevision {
    this.requireEngineState("running");
    const validatedRequest = this.validatePrepareRequest(request);
    const currentIdentity = this.currentIdentityResolver.resolveCurrentIdentity(
      validatedRequest.identityResolutionRequest as never,
    );
    return this.composeContextRevision({
      target: validatedRequest.target,
      currentIdentity,
    });
  }

  public composeContextRevisionWithKnowledge(
    request: ComposeContextRevisionWithKnowledgeRequest,
  ): ActiveContextRevision;
  public composeContextRevisionWithKnowledge(
    request: unknown,
  ): ActiveContextRevision;
  public composeContextRevisionWithKnowledge(
    request: unknown,
  ): ActiveContextRevision {
    this.requireEngineState("running");
    try {
      return this.composeKnowledgeValidated(
        this.validateKnowledgeComposeRequest(request),
      );
    } catch (error: unknown) {
      if (isContextFailure(error)) throw error;
      throw new ContextValidationFailureError();
    }
  }

  public prepareContextRevisionWithKnowledge(
    request: PrepareContextRevisionWithKnowledgeRequest,
  ): ActiveContextRevision;
  public prepareContextRevisionWithKnowledge(
    request: unknown,
  ): ActiveContextRevision;
  public prepareContextRevisionWithKnowledge(
    request: unknown,
  ): ActiveContextRevision {
    this.requireEngineState("running");
    if (this.knowledgeResolver === undefined) {
      throw new ContextEngineInitializationError();
    }
    const validatedRequest = this.validateKnowledgePrepareRequest(request);
    const currentIdentity = this.currentIdentityResolver.resolveCurrentIdentity(
      validatedRequest.identityResolutionRequest as never,
    );
    const retrievedKnowledge = this.knowledgeResolver.getKnowledge(
      validatedRequest.knowledgeRetrievalRequest as never,
    );
    const knowledgeReference =
      this.extractKnowledgeReference(retrievedKnowledge);
    return this.composeContextRevisionWithKnowledge({
      target: validatedRequest.target,
      currentIdentity,
      knowledgeReference,
    });
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
      const candidate = lineage.activeRevision;
      this.#authority.register(
        candidate,
        () => lineage.activeRevision === candidate,
      );
      return candidate;
    } catch (error: unknown) {
      if (isContextFailure(error)) {
        throw error;
      }
      throw new InvalidContextInputError();
    }
  }

  public verifyActiveContextRevisionAuthority(
    request: VerifyActiveContextRevisionAuthorityRequest,
  ): ActiveContextRevision;
  public verifyActiveContextRevisionAuthority(
    request: unknown,
  ): ActiveContextRevision;
  public verifyActiveContextRevisionAuthority(
    request: unknown,
  ): ActiveContextRevision {
    return this.#authority.verifyActiveContextRevisionAuthority(request);
  }

  private composeValidated(
    request: ValidatedComposeRequest,
  ): ActiveContextRevision {
    if (request.target.kind === "new-lineage") {
      return this.createFirstRevision(request.identityProjection, undefined);
    }
    return this.createSuccessorRevision(
      request.target,
      request.identityProjection,
      undefined,
    );
  }

  private composeKnowledgeValidated(
    request: ValidatedKnowledgeComposeRequest,
  ): ActiveContextRevision {
    if (request.target.kind === "new-lineage") {
      return this.createFirstRevision(
        request.identityProjection,
        request.knowledgeProjection,
      );
    }
    return this.createSuccessorRevision(
      request.target,
      request.identityProjection,
      request.knowledgeProjection,
    );
  }

  private createFirstRevision(
    identityProjection: IdentityContextProjection,
    knowledgeProjection: KnowledgeContextProjection | undefined,
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
      knowledgeProjection,
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
    knowledgeProjection: KnowledgeContextProjection | undefined,
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
    if (
      sameProjection(currentProjection, identityProjection) &&
      this.sameKnowledgeProjection(current, knowledgeProjection)
    ) {
      return current;
    }

    const successor = this.createRevision(
      lineage.lineageIdentity,
      contextRevisionNumber(current.revisionNumber + 1),
      current.revisionIdentity,
      identityProjection,
      knowledgeProjection,
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
    knowledgeProjection: KnowledgeContextProjection | undefined,
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
    const base = {
      lineageIdentity,
      revisionIdentity,
      revisionNumber,
      ...(parentRevisionIdentity === undefined
        ? {}
        : { parentRevisionIdentity }),
      createdAt,
    };
    if (knowledgeProjection === undefined) {
      return createActiveRuntimeContextRevision({
        ...base,
        fragments: [fragment],
      });
    }
    const knowledgeFragment = Object.freeze({
      kind: "knowledge",
      authoritativeOwner: "knowledge",
      projection: knowledgeProjection,
    }) satisfies KnowledgeContextFragment;
    return createActiveRuntimeContextRevision({
      ...base,
      fragments: [fragment, knowledgeFragment],
    });
  }

  private sameKnowledgeProjection(
    current: ContextRevision,
    candidate: KnowledgeContextProjection | undefined,
  ): boolean {
    if (current.fragments.length === 1) return candidate === undefined;
    if (candidate === undefined) return false;
    const existing = current.fragments[1].projection;
    return (
      existing.knowledgeIdentity === candidate.knowledgeIdentity &&
      existing.validationState === candidate.validationState &&
      existing.version === candidate.version &&
      existing.currency === candidate.currency &&
      existing.authoritativeOwner === candidate.authoritativeOwner
    );
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

  private validateKnowledgeComposeRequest(
    request: unknown,
  ): ValidatedKnowledgeComposeRequest {
    try {
      if (
        !isPlainRecord(request) ||
        !hasExactFields(request, [
          "target",
          "currentIdentity",
          "knowledgeReference",
        ])
      ) {
        throw new InvalidContextInputError();
      }
      return Object.freeze({
        target: this.validateTarget(Reflect.get(request, "target")),
        identityProjection: this.validateIdentityProjection(
          Reflect.get(request, "currentIdentity"),
        ),
        knowledgeProjection: this.validateKnowledgeProjection(
          Reflect.get(request, "knowledgeReference"),
        ),
      });
    } catch (error: unknown) {
      if (isContextFailure(error)) throw error;
      throw new InvalidContextInputError();
    }
  }

  private validatePrepareRequest(request: unknown): ValidatedPrepareRequest {
    try {
      if (
        !isPlainRecord(request) ||
        !hasExactFields(request, ["target", "identityResolutionRequest"])
      ) {
        throw new InvalidContextInputError();
      }
      return Object.freeze({
        target: this.validateTarget(Reflect.get(request, "target")),
        identityResolutionRequest: Reflect.get(
          request,
          "identityResolutionRequest",
        ),
      });
    } catch (error: unknown) {
      if (isContextFailure(error)) {
        throw error;
      }
      throw new InvalidContextInputError();
    }
  }

  private validateKnowledgePrepareRequest(
    request: unknown,
  ): ValidatedKnowledgePrepareRequest {
    try {
      if (
        !isPlainRecord(request) ||
        !hasExactFields(request, [
          "target",
          "identityResolutionRequest",
          "knowledgeRetrievalRequest",
        ])
      ) {
        throw new InvalidContextInputError();
      }
      return Object.freeze({
        target: this.validateTarget(Reflect.get(request, "target")),
        identityResolutionRequest: Reflect.get(
          request,
          "identityResolutionRequest",
        ),
        knowledgeRetrievalRequest: Reflect.get(
          request,
          "knowledgeRetrievalRequest",
        ),
      });
    } catch (error: unknown) {
      if (isContextFailure(error)) throw error;
      throw new InvalidContextInputError();
    }
  }

  private extractKnowledgeReference(value: unknown): KnowledgeReference {
    try {
      if (
        !isPlainRecord(value) ||
        !hasExactFields(value, ["knowledge", "reference"])
      ) {
        throw new InvalidKnowledgeContextProjectionError();
      }
      const descriptor = Reflect.getOwnPropertyDescriptor(value, "reference");
      if (
        descriptor === undefined ||
        descriptor.enumerable !== true ||
        !("value" in descriptor)
      ) {
        throw new InvalidKnowledgeContextProjectionError();
      }
      return descriptor.value as KnowledgeReference;
    } catch (error: unknown) {
      if (error instanceof InvalidKnowledgeContextProjectionError) throw error;
      throw new InvalidKnowledgeContextProjectionError();
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

  private validateKnowledgeProjection(
    reference: unknown,
  ): KnowledgeContextProjection {
    try {
      if (
        !isPlainRecord(reference) ||
        !hasExactFields(reference, [
          "knowledgeIdentity",
          "validationState",
          "version",
          "currency",
          "authoritativeCapability",
        ]) ||
        Reflect.get(reference, "validationState") !== "accepted" ||
        (Reflect.get(reference, "currency") !== "current" &&
          Reflect.get(reference, "currency") !== "superseded") ||
        Reflect.get(reference, "authoritativeCapability") !== "knowledge"
      ) {
        throw new InvalidKnowledgeContextProjectionError();
      }
      return Object.freeze({
        knowledgeIdentity: knowledgeIdentity(
          Reflect.get(reference, "knowledgeIdentity"),
        ),
        validationState: "accepted",
        version: knowledgeVersion(Reflect.get(reference, "version")),
        currency: Reflect.get(reference, "currency") as
          "current" | "superseded",
        authoritativeOwner: "knowledge",
      });
    } catch (error: unknown) {
      if (error instanceof InvalidKnowledgeContextProjectionError) throw error;
      throw new InvalidKnowledgeContextProjectionError();
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
    super(
      "Context Engine requires valid Context construction values, a Current Identity resolver, and any source collaborator required by the requested preparation profile.",
    );
    this.name = "ContextEngineInitializationError";
  }
}

export class ContextEngineLifecycleError extends Error {
  public constructor() {
    super("Context Engine lifecycle does not permit this operation.");
    this.name = "ContextEngineLifecycleError";
  }
}
