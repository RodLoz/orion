import type {
  CurrentIdentity,
  IdentityResolutionReference,
} from "./identity.js";

export interface IdentityResolutionRequest {
  readonly resolutionReference?: string;
}

export interface ResolveCurrentIdentity {
  resolveCurrentIdentity(request: IdentityResolutionRequest): CurrentIdentity;
}

export type IdentitySourceResolution =
  | Readonly<{
      status: "found";
      candidateIdentityIdentifier: string;
    }>
  | Readonly<{
      status: "not-found";
    }>;

export interface IdentitySource {
  resolveIdentity(
    reference: IdentityResolutionReference,
  ): IdentitySourceResolution;
}

export class UnresolvedIdentityError extends Error {
  public constructor() {
    super("Supplied identity evidence could not be resolved.");
    this.name = "UnresolvedIdentityError";
  }
}

export class InvalidIdentityStateError extends Error {
  public constructor() {
    super("Resolved identity state violates the Identity Contract.");
    this.name = "InvalidIdentityStateError";
  }
}

export class IdentitySourceUnavailableError extends Error {
  public constructor() {
    super("Identity source is unavailable.");
    this.name = "IdentitySourceUnavailableError";
  }
}

export class InvalidIdentityInputError extends Error {
  public constructor() {
    super("Identity resolution request is invalid.");
    this.name = "InvalidIdentityInputError";
  }
}
