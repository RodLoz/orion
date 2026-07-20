import {
  IdentitySourceUnavailableError,
  InvalidIdentityIdentifierError,
  InvalidIdentityInputError,
  InvalidIdentityResolutionReferenceError,
  InvalidIdentityStateError,
  UnresolvedIdentityError,
  anonymousCurrentIdentity,
  authenticatedCurrentIdentity,
  identityIdentifier,
  identityResolutionReference,
  type CurrentIdentity,
  type IdentityResolutionRequest,
  type IdentitySource,
  type ResolveCurrentIdentity,
} from "@orion/core";

export class IdentityEngine implements ResolveCurrentIdentity {
  #lifecycleState: IdentityEngineLifecycleState = "initialize";

  public constructor(private readonly source: IdentitySource) {
    if (source === undefined || source === null) {
      throw new IdentityEngineInitializationError();
    }
  }

  public get lifecycleState(): IdentityEngineLifecycleState {
    return this.#lifecycleState;
  }

  public initialize(): void {
    this.requireLifecycleState("initialize");
    this.#lifecycleState = "ready";
  }

  public start(): void {
    this.requireLifecycleState("ready");
    this.#lifecycleState = "running";
  }

  public stop(): void {
    this.requireLifecycleState("running");
    this.#lifecycleState = "stopping";
    this.#lifecycleState = "stopped";
  }

  public resolveCurrentIdentity(
    request: IdentityResolutionRequest,
  ): CurrentIdentity;
  public resolveCurrentIdentity(request: unknown): CurrentIdentity;
  public resolveCurrentIdentity(request: unknown): CurrentIdentity {
    this.requireLifecycleState("running");

    const validatedRequest = this.validateRequest(request);

    if (validatedRequest.resolutionReference === undefined) {
      return anonymousCurrentIdentity();
    }

    const reference = validatedRequest.resolutionReference;

    let sourceResolution: unknown;
    try {
      sourceResolution = this.source.resolveIdentity(reference);
    } catch (error: unknown) {
      if (
        error instanceof IdentitySourceUnavailableError ||
        error instanceof InvalidIdentityStateError ||
        error instanceof UnresolvedIdentityError
      ) {
        throw error;
      }

      if (
        error instanceof InvalidIdentityIdentifierError ||
        error instanceof InvalidIdentityResolutionReferenceError ||
        error instanceof InvalidIdentityInputError
      ) {
        throw new InvalidIdentityStateError();
      }

      throw new IdentitySourceUnavailableError();
    }

    const validatedResolution = this.validateSourceResolution(sourceResolution);

    if (validatedResolution.status === "not-found") {
      throw new UnresolvedIdentityError();
    }

    try {
      return authenticatedCurrentIdentity(
        identityIdentifier(validatedResolution.candidateIdentityIdentifier),
      );
    } catch (error: unknown) {
      if (error instanceof InvalidIdentityIdentifierError) {
        throw new InvalidIdentityStateError();
      }

      throw error;
    }
  }

  private validateRequest(request: unknown): {
    readonly resolutionReference?: ReturnType<
      typeof identityResolutionReference
    >;
  } {
    try {
      if (
        typeof request !== "object" ||
        request === null ||
        Array.isArray(request)
      ) {
        throw new InvalidIdentityInputError();
      }

      const prototype = Object.getPrototypeOf(request) as unknown;
      if (prototype !== Object.prototype && prototype !== null) {
        throw new InvalidIdentityInputError();
      }

      const fields = Object.keys(request);
      if (fields.some((field) => field !== "resolutionReference")) {
        throw new InvalidIdentityInputError();
      }

      const resolutionReference = Reflect.get(
        request,
        "resolutionReference",
      ) as unknown;
      if (resolutionReference === undefined) {
        return Object.freeze({});
      }

      return Object.freeze({
        resolutionReference: identityResolutionReference(resolutionReference),
      });
    } catch (error: unknown) {
      if (
        error instanceof InvalidIdentityInputError ||
        error instanceof InvalidIdentityResolutionReferenceError
      ) {
        throw error;
      }

      throw new InvalidIdentityInputError();
    }
  }

  private validateSourceResolution(sourceResolution: unknown):
    | Readonly<{ status: "not-found" }>
    | Readonly<{
        status: "found";
        candidateIdentityIdentifier: string;
      }> {
    try {
      if (
        typeof sourceResolution !== "object" ||
        sourceResolution === null ||
        Array.isArray(sourceResolution)
      ) {
        throw new InvalidIdentityStateError();
      }

      const fields = Object.keys(sourceResolution);
      const status = Reflect.get(sourceResolution, "status") as unknown;

      if (status === "not-found") {
        if (fields.length !== 1 || fields[0] !== "status") {
          throw new InvalidIdentityStateError();
        }

        return Object.freeze({ status });
      }

      if (status !== "found") {
        throw new InvalidIdentityStateError();
      }

      if (
        fields.length !== 2 ||
        !fields.includes("status") ||
        !fields.includes("candidateIdentityIdentifier")
      ) {
        throw new InvalidIdentityStateError();
      }

      const candidateIdentityIdentifier = Reflect.get(
        sourceResolution,
        "candidateIdentityIdentifier",
      ) as unknown;
      if (typeof candidateIdentityIdentifier !== "string") {
        throw new InvalidIdentityStateError();
      }

      return Object.freeze({ status, candidateIdentityIdentifier });
    } catch (error: unknown) {
      if (error instanceof InvalidIdentityStateError) {
        throw error;
      }

      throw new InvalidIdentityStateError();
    }
  }

  private requireLifecycleState(expected: IdentityEngineLifecycleState): void {
    if (this.#lifecycleState !== expected) {
      throw new IdentityEngineLifecycleError();
    }
  }
}

export type IdentityEngineLifecycleState =
  "initialize" | "ready" | "running" | "stopping" | "stopped";

export class IdentityEngineInitializationError extends Error {
  public constructor() {
    super("Identity Engine requires an Identity Source Contract.");
    this.name = "IdentityEngineInitializationError";
  }
}

export class IdentityEngineLifecycleError extends Error {
  public constructor() {
    super("Identity Engine lifecycle does not permit this operation.");
    this.name = "IdentityEngineLifecycleError";
  }
}
