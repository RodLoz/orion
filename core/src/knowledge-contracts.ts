import type {
  KnowledgeAcceptanceDecision,
  KnowledgeIdentity,
  KnowledgeRecord,
  KnowledgeReference,
  RetrievedKnowledge,
} from "./knowledge.js";

export interface EvaluateKnowledgeClaimRequest {
  readonly intent: "evaluate";
  readonly claim: unknown;
  readonly acceptanceEvidence: unknown;
  readonly provenance: unknown;
  readonly contradictsKnowledgeIdentity?: unknown;
  readonly contradictionDecision?: unknown;
  readonly contradictionReason?: unknown;
}
export interface EvaluateKnowledgeClaim {
  evaluateKnowledgeClaim(
    request: EvaluateKnowledgeClaimRequest,
  ): KnowledgeAcceptanceDecision;
}

export interface GetKnowledgeRequest {
  readonly knowledgeIdentity: unknown;
}
export interface GetKnowledge {
  getKnowledge(request: GetKnowledgeRequest): RetrievedKnowledge;
}

export interface ListKnowledgeReferencesRequest {
  readonly limit?: unknown;
}
export interface ListKnowledgeReferences {
  listKnowledgeReferences(
    request: ListKnowledgeReferencesRequest,
  ): readonly KnowledgeReference[];
}

export interface KnowledgeConstructionValues {
  nextKnowledgeIdentity(): unknown;
  nextAcceptedAt(): unknown;
}

export type KnowledgeStorePutResult =
  | Readonly<{ status: "stored"; knowledgeIdentity: unknown }>
  | Readonly<{ status: "duplicate" }>
  | Readonly<{ status: "unavailable" }>;
export type KnowledgeStoreGetResult =
  | Readonly<{ status: "found"; record: unknown }>
  | Readonly<{ status: "not-found" }>
  | Readonly<{ status: "unavailable" }>;

export interface KnowledgeStore {
  put(record: KnowledgeRecord): KnowledgeStorePutResult;
  get(knowledgeIdentity: KnowledgeIdentity): KnowledgeStoreGetResult;
}

export class InvalidKnowledgeInputError extends Error {
  public constructor() {
    super("Knowledge request is invalid.");
    this.name = "InvalidKnowledgeInputError";
  }
}
export class InvalidKnowledgeIdentityError extends Error {
  public constructor() {
    super("Knowledge Identity is invalid.");
    this.name = "InvalidKnowledgeIdentityError";
  }
}
export class InvalidClaimError extends Error {
  public constructor() {
    super("Candidate Claim is invalid.");
    this.name = "InvalidClaimError";
  }
}
export class InvalidAcceptanceEvidenceError extends Error {
  public constructor() {
    super("Knowledge Acceptance Evidence is invalid.");
    this.name = "InvalidAcceptanceEvidenceError";
  }
}
export class KnowledgeNotFoundError extends Error {
  public constructor() {
    super("Knowledge was not found.");
    this.name = "KnowledgeNotFoundError";
  }
}
export class DuplicateKnowledgeIdentityError extends Error {
  public constructor() {
    super("Knowledge Identity is already accepted.");
    this.name = "DuplicateKnowledgeIdentityError";
  }
}
export class ContradictionRequiresResolutionError extends Error {
  public constructor() {
    super("Knowledge contradiction requires resolution.");
    this.name = "ContradictionRequiresResolutionError";
  }
}
export class InvalidSupersessionError extends Error {
  public constructor() {
    super("Knowledge supersession is invalid.");
    this.name = "InvalidSupersessionError";
  }
}
export class KnowledgeStoreUnavailableError extends Error {
  public constructor() {
    super("Knowledge Store is unavailable.");
    this.name = "KnowledgeStoreUnavailableError";
  }
}
export class InvalidKnowledgeStateError extends Error {
  public constructor() {
    super("Knowledge state is invalid.");
    this.name = "InvalidKnowledgeStateError";
  }
}
