export type IdentityIdentifier = string & {
  readonly __identityIdentifier: unique symbol;
};

export type IdentityResolutionReference = string & {
  readonly __identityResolutionReference: unique symbol;
};

export type IdentityState = "anonymous" | "authenticated";

export interface AnonymousCurrentIdentity {
  readonly state: "anonymous";
}

export interface AuthenticatedCurrentIdentity {
  readonly state: "authenticated";
  readonly identityIdentifier: IdentityIdentifier;
}

export type CurrentIdentity =
  AnonymousCurrentIdentity | AuthenticatedCurrentIdentity;

const IDENTITY_IDENTIFIER_PATTERN = /^[a-z][a-z0-9]*(?:[.-][a-z0-9]+)*$/;
const MAX_RESOLUTION_REFERENCE_LENGTH = 256;

export function identityIdentifier(value: unknown): IdentityIdentifier {
  if (typeof value !== "string" || !IDENTITY_IDENTIFIER_PATTERN.test(value)) {
    throw new InvalidIdentityIdentifierError();
  }

  return value as IdentityIdentifier;
}

export function identityResolutionReference(
  value: unknown,
): IdentityResolutionReference {
  if (
    typeof value !== "string" ||
    value.length === 0 ||
    value.length > MAX_RESOLUTION_REFERENCE_LENGTH ||
    value.trim() !== value
  ) {
    throw new InvalidIdentityResolutionReferenceError();
  }

  return value as IdentityResolutionReference;
}

export function anonymousCurrentIdentity(): AnonymousCurrentIdentity {
  return Object.freeze({ state: "anonymous" });
}

export function authenticatedCurrentIdentity(
  identifier: IdentityIdentifier,
): AuthenticatedCurrentIdentity {
  return Object.freeze({
    state: "authenticated",
    identityIdentifier: identifier,
  });
}

export class InvalidIdentityIdentifierError extends Error {
  public constructor() {
    super("Identity identifier is invalid.");
    this.name = "InvalidIdentityIdentifierError";
  }
}

export class InvalidIdentityResolutionReferenceError extends Error {
  public constructor() {
    super("Identity resolution reference is invalid.");
    this.name = "InvalidIdentityResolutionReferenceError";
  }
}
