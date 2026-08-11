import type {
  ActiveContextRevision,
  ContextLineageIdentity,
  ContextRevisionIdentity,
  ContextRevisionNumber,
} from "./context.js";
import type { IdentityResolutionRequest } from "./identity-contracts.js";
import type { CurrentIdentity } from "./identity.js";
import type { GetKnowledgeRequest } from "./knowledge-contracts.js";
import type { KnowledgeReference } from "./knowledge.js";

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

export interface PrepareContextRevisionRequest {
  readonly target: ComposeContextTarget;
  readonly identityResolutionRequest: IdentityResolutionRequest;
}

export interface PrepareContextRevision {
  prepareContextRevision(
    request: PrepareContextRevisionRequest,
  ): ActiveContextRevision;
}

export interface ComposeContextRevisionWithKnowledgeRequest {
  readonly target: ComposeContextTarget;
  readonly currentIdentity: CurrentIdentity;
  readonly knowledgeReference: KnowledgeReference;
}

export interface ComposeContextRevisionWithKnowledge {
  composeContextRevisionWithKnowledge(
    request: ComposeContextRevisionWithKnowledgeRequest,
  ): ActiveContextRevision;
}

export interface PrepareContextRevisionWithKnowledgeRequest {
  readonly target: ComposeContextTarget;
  readonly identityResolutionRequest: IdentityResolutionRequest;
  readonly knowledgeRetrievalRequest: GetKnowledgeRequest;
}

export interface PrepareContextRevisionWithKnowledge {
  prepareContextRevisionWithKnowledge(
    request: PrepareContextRevisionWithKnowledgeRequest,
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

export interface VerifyActiveContextRevisionAuthorityRequest {
  readonly intent: "verify-active-context-revision-authority";
  readonly candidate: ActiveContextRevision;
  readonly expectedLineageIdentity: ContextLineageIdentity;
  readonly expectedRevisionIdentity: ContextRevisionIdentity;
  readonly expectedRevisionNumber: ContextRevisionNumber;
}

export interface VerifyActiveContextRevisionAuthority {
  verifyActiveContextRevisionAuthority(
    request: VerifyActiveContextRevisionAuthorityRequest,
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

export class InvalidKnowledgeContextProjectionError extends Error {
  public constructor() {
    super("Knowledge Context projection is missing or invalid.");
    this.name = "InvalidKnowledgeContextProjectionError";
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

export class InvalidContextAuthorityRequestError extends Error {
  public constructor() {
    super("Context authority request is invalid.");
    this.name = "InvalidContextAuthorityRequestError";
  }
}

export class ContextAuthorityVerificationError extends Error {
  public constructor() {
    super("Context authority verification failed.");
    this.name = "ContextAuthorityVerificationError";
  }
}

export class InvalidContextAuthorityStateError extends Error {
  public constructor() {
    super("Context authority state is invalid.");
    this.name = "InvalidContextAuthorityStateError";
  }
}
