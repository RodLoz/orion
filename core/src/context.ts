import type { IdentityIdentifier } from "./identity.js";

export type ContextLineageIdentity = string & {
  readonly __contextLineageIdentity: unique symbol;
};

export type ContextRevisionIdentity = string & {
  readonly __contextRevisionIdentity: unique symbol;
};

export type ContextRevisionNumber = number & {
  readonly __contextRevisionNumber: unique symbol;
};

export type ContextCreatedAt = string & {
  readonly __contextCreatedAt: unique symbol;
};

export type ContextLifecycleState =
  "collecting" | "composing" | "validating" | "active" | "expired" | "archived";

export type IdentityContextProjection =
  | Readonly<{
      state: "anonymous";
      authoritativeOwner: "identity";
    }>
  | Readonly<{
      state: "authenticated";
      authoritativeOwner: "identity";
      identityIdentifier: IdentityIdentifier;
    }>;

export interface IdentityContextFragment {
  readonly kind: "identity";
  readonly authoritativeOwner: "identity";
  readonly projection: IdentityContextProjection;
}

export type ContextFragment = IdentityContextFragment;

export interface ContextRevisionCreationMetadata {
  readonly createdAt: ContextCreatedAt;
  readonly sourceCount: 1;
  readonly fragmentCount: 1;
}

export interface ContextRevision {
  readonly lineageIdentity: ContextLineageIdentity;
  readonly revisionIdentity: ContextRevisionIdentity;
  readonly revisionNumber: ContextRevisionNumber;
  readonly parentRevisionIdentity?: ContextRevisionIdentity;
  readonly creationMetadata: ContextRevisionCreationMetadata;
  readonly lifecycleState: ContextLifecycleState;
  readonly fragments: readonly [IdentityContextFragment];
}

export type ActiveContextRevision = ContextRevision;

const CONTEXT_IDENTITY_PATTERN = /^[a-z][a-z0-9]*(?:[.-][a-z0-9]+)*$/;
const UTC_TIMESTAMP_PATTERN =
  /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d{3})?Z$/;

export function contextLineageIdentity(value: unknown): ContextLineageIdentity {
  if (typeof value !== "string" || !CONTEXT_IDENTITY_PATTERN.test(value)) {
    throw new InvalidContextLineageIdentityError();
  }
  return value as ContextLineageIdentity;
}

export function contextRevisionIdentity(
  value: unknown,
): ContextRevisionIdentity {
  if (typeof value !== "string" || !CONTEXT_IDENTITY_PATTERN.test(value)) {
    throw new InvalidContextRevisionIdentityError();
  }
  return value as ContextRevisionIdentity;
}

export function contextRevisionNumber(value: unknown): ContextRevisionNumber {
  if (typeof value !== "number" || !Number.isSafeInteger(value) || value < 1) {
    throw new InvalidContextRevisionNumberError();
  }
  return value as ContextRevisionNumber;
}

export function contextCreatedAt(value: unknown): ContextCreatedAt {
  if (
    typeof value !== "string" ||
    !UTC_TIMESTAMP_PATTERN.test(value) ||
    Number.isNaN(Date.parse(value))
  ) {
    throw new InvalidContextCreatedAtError();
  }
  return value as ContextCreatedAt;
}

export function contextLifecycleState(value: unknown): ContextLifecycleState {
  if (
    value !== "collecting" &&
    value !== "composing" &&
    value !== "validating" &&
    value !== "active" &&
    value !== "expired" &&
    value !== "archived"
  ) {
    throw new InvalidContextLifecycleStateError();
  }
  return value;
}

export class InvalidContextLineageIdentityError extends Error {
  public constructor() {
    super("Context Lineage Identity is invalid.");
    this.name = "InvalidContextLineageIdentityError";
  }
}

export class InvalidContextRevisionIdentityError extends Error {
  public constructor() {
    super("Context Revision Identity is invalid.");
    this.name = "InvalidContextRevisionIdentityError";
  }
}

export class InvalidContextRevisionNumberError extends Error {
  public constructor() {
    super("Context Revision Number is invalid.");
    this.name = "InvalidContextRevisionNumberError";
  }
}

export class InvalidContextCreatedAtError extends Error {
  public constructor() {
    super("Context creation timestamp is invalid.");
    this.name = "InvalidContextCreatedAtError";
  }
}

export class InvalidContextLifecycleStateError extends Error {
  public constructor() {
    super("Context lifecycle state is invalid.");
    this.name = "InvalidContextLifecycleStateError";
  }
}
