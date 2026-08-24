import type { IdentityIdentifier } from "./identity.js";
import type {
  KnowledgeCurrency,
  KnowledgeIdentity,
  KnowledgeVersion,
} from "./knowledge.js";
import type { MemoryIdentity } from "./memory.js";
import type { StructuredKnowledgeContextFragment } from "./context-applicability.js";

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

export interface KnowledgeContextProjection {
  readonly knowledgeIdentity: KnowledgeIdentity;
  readonly validationState: "accepted";
  readonly version: KnowledgeVersion;
  readonly currency: KnowledgeCurrency;
  readonly authoritativeOwner: "knowledge";
}

export interface KnowledgeContextFragment {
  readonly kind: "knowledge";
  readonly authoritativeOwner: "knowledge";
  readonly projection: KnowledgeContextProjection;
}

export interface MemoryContextProjection {
  readonly memoryIdentity: MemoryIdentity;
  readonly kind: "episodic";
  readonly lifecycleState: "stored";
  readonly authoritativeOwner: "memory";
}

export interface MemoryContextFragment {
  readonly kind: "memory";
  readonly authoritativeOwner: "memory";
  readonly projection: MemoryContextProjection;
}

export type ContextFragment =
  | IdentityContextFragment
  | KnowledgeContextFragment
  | StructuredKnowledgeContextFragment
  | MemoryContextFragment;

export interface IdentityContextRevisionCreationMetadata {
  readonly createdAt: ContextCreatedAt;
  readonly sourceCount: 1;
  readonly fragmentCount: 1;
}

export interface KnowledgeAwareContextRevisionCreationMetadata {
  readonly createdAt: ContextCreatedAt;
  readonly sourceCount: 2;
  readonly fragmentCount: 2;
}

export interface MemoryAwareContextRevisionCreationMetadata {
  readonly createdAt: ContextCreatedAt;
  readonly sourceCount: 2;
  readonly fragmentCount: 2;
}

export type ContextRevisionCreationMetadata =
  | IdentityContextRevisionCreationMetadata
  | KnowledgeAwareContextRevisionCreationMetadata
  | MemoryAwareContextRevisionCreationMetadata;

interface ContextRevisionBase {
  readonly lineageIdentity: ContextLineageIdentity;
  readonly revisionIdentity: ContextRevisionIdentity;
  readonly revisionNumber: ContextRevisionNumber;
  readonly parentRevisionIdentity?: ContextRevisionIdentity;
  readonly lifecycleState: ContextLifecycleState;
}

export interface IdentityContextRevision extends ContextRevisionBase {
  readonly creationMetadata: IdentityContextRevisionCreationMetadata;
  readonly fragments: readonly [IdentityContextFragment];
}

export interface KnowledgeAwareContextRevision extends ContextRevisionBase {
  readonly creationMetadata: KnowledgeAwareContextRevisionCreationMetadata;
  readonly fragments: readonly [
    IdentityContextFragment,
    KnowledgeContextFragment,
  ];
}

export interface StructuredKnowledgeAwareContextRevision extends ContextRevisionBase {
  readonly creationMetadata: KnowledgeAwareContextRevisionCreationMetadata;
  readonly fragments: readonly [
    IdentityContextFragment,
    StructuredKnowledgeContextFragment,
  ];
}

export interface MemoryAwareContextRevision extends ContextRevisionBase {
  readonly creationMetadata: MemoryAwareContextRevisionCreationMetadata;
  readonly fragments: readonly [IdentityContextFragment, MemoryContextFragment];
}

export type ContextRevision =
  | IdentityContextRevision
  | KnowledgeAwareContextRevision
  | StructuredKnowledgeAwareContextRevision
  | MemoryAwareContextRevision;

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
