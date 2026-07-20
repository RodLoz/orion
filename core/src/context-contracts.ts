import type { ActiveContextRevision } from "./context.js";
import type { CurrentIdentity } from "./identity.js";

export type ComposeContextTarget =
  | Readonly<{ kind: "new-lineage" }>
  | Readonly<{
      kind: "existing-lineage";
      lineageIdentity: string;
      expectedActiveRevisionIdentity: string;
    }>;

export interface ComposeContextRevisionRequest {
  readonly target: ComposeContextTarget;
  readonly currentIdentity: CurrentIdentity;
}

export interface ComposeContextRevision {
  composeContextRevision(
    request: ComposeContextRevisionRequest,
  ): ActiveContextRevision;
}

export interface GetActiveContextRevisionRequest {
  readonly lineageIdentity: string;
}

export interface GetActiveContextRevision {
  getActiveContextRevision(
    request: GetActiveContextRevisionRequest,
  ): ActiveContextRevision;
}

export interface ContextConstructionValues {
  nextLineageIdentity(): unknown;
  nextRevisionIdentity(): unknown;
  nextCreatedAt(): unknown;
}

export class InvalidContextInputError extends Error {
  public constructor() {
    super("Context request is invalid.");
    this.name = "InvalidContextInputError";
  }
}

export class ContextLineageNotFoundError extends Error {
  public constructor() {
    super("Context Lineage was not found.");
    this.name = "ContextLineageNotFoundError";
  }
}

export class InvalidContextLifecycleTransitionError extends Error {
  public constructor() {
    super("Context lifecycle transition is invalid.");
    this.name = "InvalidContextLifecycleTransitionError";
  }
}

export class InvalidIdentityContextProjectionError extends Error {
  public constructor() {
    super("Identity Context projection is missing or invalid.");
    this.name = "InvalidIdentityContextProjectionError";
  }
}

export class ContextValidationFailureError extends Error {
  public constructor() {
    super("Context candidate failed validation.");
    this.name = "ContextValidationFailureError";
  }
}

export class NoActiveContextRevisionError extends Error {
  public constructor() {
    super("No Active Context Revision is available.");
    this.name = "NoActiveContextRevisionError";
  }
}
