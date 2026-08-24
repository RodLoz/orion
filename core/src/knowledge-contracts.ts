import type {
  KnowledgeAcceptanceDecision,
  KnowledgeIdentity,
  KnowledgeAcceptanceOrder,
  KnowledgeLifecycleStanding,
  KnowledgeRecord,
  KnowledgeVersion,
  KnowledgeReference,
  RetrievedKnowledge,
} from "./knowledge.js";
import type {
  CaptureStructuredKnowledgeProjectionAuthorityRequest,
  KnowledgeProjectionRequest,
  StructuredKnowledgeProjection,
  VerifyStructuredKnowledgeProjectionAuthorityRequest,
} from "./knowledge-projection.js";
import type { PropositionIdentity } from "./knowledge-structured-proposition.js";
import {
  createKnowledgeRecord,
  knowledgeAcceptanceOrder,
  knowledgeIdentity,
  knowledgeLifecycleStanding,
  knowledgeVersion,
} from "./knowledge.js";

interface EvaluateKnowledgeClaimRequestBase {
  readonly intent: "evaluate";
  readonly claim: unknown;
  readonly acceptanceEvidence: unknown;
  readonly provenance: unknown;
  readonly contradictsKnowledgeIdentity?: unknown;
  readonly contradictionDecision?: unknown;
  readonly contradictionReason?: unknown;
}

export type EvaluateKnowledgeClaimRequest =
  | Readonly<
      EvaluateKnowledgeClaimRequestBase & {
        structuredProposition?: never;
        samePropositionDeclaration?: never;
        sourceOwnershipProposal?: never;
      }
    >
  | Readonly<
      EvaluateKnowledgeClaimRequestBase & {
        structuredProposition: unknown;
        samePropositionDeclaration: "same-proposition";
        sourceOwnershipProposal: unknown;
      }
    >;
export interface EvaluateKnowledgeClaim {
  evaluateKnowledgeClaim(
    request: EvaluateKnowledgeClaimRequest,
  ): Promise<KnowledgeAcceptanceDecision>;
}

export interface GetKnowledgeRequest {
  readonly knowledgeIdentity: unknown;
}
export interface GetKnowledge {
  getKnowledge(request: GetKnowledgeRequest): RetrievedKnowledge;
}

export interface ProjectStructuredKnowledge {
  projectStructuredKnowledge(
    request: KnowledgeProjectionRequest,
  ): StructuredKnowledgeProjection;
}

export interface CaptureStructuredKnowledgeProjectionAuthority {
  captureStructuredKnowledgeProjectionAuthority(
    request: CaptureStructuredKnowledgeProjectionAuthorityRequest,
  ): StructuredKnowledgeProjection;
}

export interface VerifyStructuredKnowledgeProjectionAuthority {
  verifyStructuredKnowledgeProjectionAuthority(
    request: VerifyStructuredKnowledgeProjectionAuthorityRequest,
  ): StructuredKnowledgeProjection;
}

export interface KnowledgeProjectionAuthority
  extends
    CaptureStructuredKnowledgeProjectionAuthority,
    VerifyStructuredKnowledgeProjectionAuthority {}

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
  nextPropositionIdentity?(): PropositionIdentity;
}

export type KnowledgeStorePutResult =
  | Readonly<{ status: "stored"; knowledgeIdentity: unknown }>
  | Readonly<{ status: "duplicate" }>
  | Readonly<{ status: "unavailable" }>;
export type KnowledgeStoreGetResult =
  | Readonly<{ status: "found"; record: unknown }>
  | Readonly<{ status: "not-found" }>
  | Readonly<{ status: "unavailable" }>;

export type KnowledgeStoreAmbiguousResult = Readonly<{
  status: "ambiguous";
}>;

export interface KnowledgeLifecycleSnapshotEntry {
  readonly knowledgeIdentity: KnowledgeIdentity;
  readonly version: KnowledgeVersion;
  readonly predecessorKnowledgeIdentity?: KnowledgeIdentity;
  readonly standing: KnowledgeLifecycleStanding;
  readonly acceptanceOrder: KnowledgeAcceptanceOrder;
}

export interface KnowledgeLifecycleSnapshot {
  readonly entries: readonly KnowledgeLifecycleSnapshotEntry[];
}

export type PutIndependentAcceptedKnowledgeRequest = Readonly<{
  record: KnowledgeRecord;
}>;

export type PutIndependentAcceptedKnowledgeResult =
  | Readonly<{
      status: "stored";
      knowledgeIdentity: KnowledgeIdentity;
      acceptanceOrder: KnowledgeAcceptanceOrder;
    }>
  | Readonly<{ status: "duplicate" }>
  | Readonly<{ status: "unavailable" }>
  | Readonly<{ status: "invalid-state" }>
  | KnowledgeStoreAmbiguousResult;

export type SupersedeCurrentKnowledgeRequest = Readonly<{
  expectedPredecessorKnowledgeIdentity: KnowledgeIdentity;
  expectedPredecessorVersion: KnowledgeVersion;
  successor: KnowledgeRecord;
}>;

export type SupersedeCurrentKnowledgeResult =
  | Readonly<{
      status: "superseded";
      predecessorKnowledgeIdentity: KnowledgeIdentity;
      successorKnowledgeIdentity: KnowledgeIdentity;
      acceptanceOrder: KnowledgeAcceptanceOrder;
    }>
  | Readonly<{ status: "predecessor-not-found" }>
  | Readonly<{ status: "stale-predecessor" }>
  | Readonly<{ status: "duplicate" }>
  | Readonly<{ status: "invalid-state" }>
  | Readonly<{ status: "unavailable" }>
  | KnowledgeStoreAmbiguousResult;

export type KnowledgeLifecycleSnapshotResult =
  | Readonly<{
      status: "loaded";
      snapshot: KnowledgeLifecycleSnapshot;
    }>
  | Readonly<{ status: "unavailable" }>
  | Readonly<{ status: "invalid-state" }>;

export function createKnowledgeLifecycleSnapshotEntry(
  input: unknown,
): KnowledgeLifecycleSnapshotEntry {
  try {
    if (
      !isPlainRecord(input) ||
      !hasExactFields(
        input,
        ["knowledgeIdentity", "version", "standing", "acceptanceOrder"],
        ["predecessorKnowledgeIdentity"],
      )
    ) {
      throw new Error();
    }
    return Object.freeze({
      knowledgeIdentity: knowledgeIdentity(input.knowledgeIdentity),
      version: knowledgeVersion(input.version),
      ...(Object.hasOwn(input, "predecessorKnowledgeIdentity")
        ? {
            predecessorKnowledgeIdentity: knowledgeIdentity(
              input.predecessorKnowledgeIdentity,
            ),
          }
        : {}),
      standing: knowledgeLifecycleStanding(input.standing),
      acceptanceOrder: knowledgeAcceptanceOrder(input.acceptanceOrder),
    });
  } catch {
    throw new InvalidKnowledgeLifecycleSnapshotEntryValueError();
  }
}

export function createKnowledgeLifecycleSnapshot(
  input: unknown,
): KnowledgeLifecycleSnapshot {
  try {
    if (
      !isPlainRecord(input) ||
      !hasExactFields(input, ["entries"]) ||
      !Array.isArray(input.entries)
    ) {
      throw new Error();
    }
    return Object.freeze({
      entries: Object.freeze(
        input.entries.map((entry) =>
          createKnowledgeLifecycleSnapshotEntry(entry),
        ),
      ),
    });
  } catch {
    throw new InvalidKnowledgeLifecycleSnapshotValueError();
  }
}

export function createPutIndependentAcceptedKnowledgeRequest(
  input: unknown,
): PutIndependentAcceptedKnowledgeRequest {
  try {
    if (!isPlainRecord(input) || !hasExactFields(input, ["record"])) {
      throw new Error();
    }
    return Object.freeze({ record: createKnowledgeRecord(input.record) });
  } catch {
    throw new InvalidKnowledgeStoreRequestValueError();
  }
}

export function createPutIndependentAcceptedKnowledgeResult(
  input: unknown,
): PutIndependentAcceptedKnowledgeResult {
  try {
    if (!isPlainRecord(input) || typeof input.status !== "string") {
      throw new Error();
    }
    switch (input.status) {
      case "stored":
        if (
          !hasExactFields(input, [
            "status",
            "knowledgeIdentity",
            "acceptanceOrder",
          ])
        ) {
          throw new Error();
        }
        return Object.freeze({
          status: "stored",
          knowledgeIdentity: knowledgeIdentity(input.knowledgeIdentity),
          acceptanceOrder: knowledgeAcceptanceOrder(input.acceptanceOrder),
        });
      case "duplicate":
      case "unavailable":
      case "invalid-state":
      case "ambiguous":
        if (!hasExactFields(input, ["status"])) throw new Error();
        return Object.freeze({ status: input.status });
      default:
        throw new Error();
    }
  } catch {
    throw new InvalidKnowledgeStoreResultValueError();
  }
}

export function createSupersedeCurrentKnowledgeRequest(
  input: unknown,
): SupersedeCurrentKnowledgeRequest {
  try {
    if (
      !isPlainRecord(input) ||
      !hasExactFields(input, [
        "expectedPredecessorKnowledgeIdentity",
        "expectedPredecessorVersion",
        "successor",
      ])
    ) {
      throw new Error();
    }
    const successor = createKnowledgeRecord(input.successor);
    if (
      successor.supersedesKnowledgeIdentity !==
      knowledgeIdentity(input.expectedPredecessorKnowledgeIdentity)
    ) {
      throw new Error();
    }
    return Object.freeze({
      expectedPredecessorKnowledgeIdentity: knowledgeIdentity(
        input.expectedPredecessorKnowledgeIdentity,
      ),
      expectedPredecessorVersion: knowledgeVersion(
        input.expectedPredecessorVersion,
      ),
      successor,
    });
  } catch {
    throw new InvalidKnowledgeStoreRequestValueError();
  }
}

export function createSupersedeCurrentKnowledgeResult(
  input: unknown,
): SupersedeCurrentKnowledgeResult {
  try {
    if (!isPlainRecord(input) || typeof input.status !== "string") {
      throw new Error();
    }
    switch (input.status) {
      case "superseded":
        if (
          !hasExactFields(input, [
            "status",
            "predecessorKnowledgeIdentity",
            "successorKnowledgeIdentity",
            "acceptanceOrder",
          ])
        ) {
          throw new Error();
        }
        return Object.freeze({
          status: "superseded",
          predecessorKnowledgeIdentity: knowledgeIdentity(
            input.predecessorKnowledgeIdentity,
          ),
          successorKnowledgeIdentity: knowledgeIdentity(
            input.successorKnowledgeIdentity,
          ),
          acceptanceOrder: knowledgeAcceptanceOrder(input.acceptanceOrder),
        });
      case "predecessor-not-found":
      case "stale-predecessor":
      case "duplicate":
      case "invalid-state":
      case "unavailable":
      case "ambiguous":
        if (!hasExactFields(input, ["status"])) throw new Error();
        return Object.freeze({ status: input.status });
      default:
        throw new Error();
    }
  } catch {
    throw new InvalidKnowledgeStoreResultValueError();
  }
}

export function createKnowledgeLifecycleSnapshotResult(
  input: unknown,
): KnowledgeLifecycleSnapshotResult {
  try {
    if (!isPlainRecord(input) || typeof input.status !== "string") {
      throw new Error();
    }
    if (input.status === "loaded") {
      if (!hasExactFields(input, ["status", "snapshot"])) throw new Error();
      return Object.freeze({
        status: "loaded",
        snapshot: createKnowledgeLifecycleSnapshot(input.snapshot),
      });
    }
    if (
      (input.status === "unavailable" || input.status === "invalid-state") &&
      hasExactFields(input, ["status"])
    ) {
      return Object.freeze({ status: input.status });
    }
    throw new Error();
  } catch {
    throw new InvalidKnowledgeStoreResultValueError();
  }
}

export interface KnowledgeStore {
  put(record: KnowledgeRecord): Promise<KnowledgeStorePutResult>;
  get(knowledgeIdentity: KnowledgeIdentity): Promise<KnowledgeStoreGetResult>;
  putIndependentAcceptedKnowledge(
    request: PutIndependentAcceptedKnowledgeRequest,
  ): Promise<PutIndependentAcceptedKnowledgeResult>;
  supersedeCurrentKnowledge(
    request: SupersedeCurrentKnowledgeRequest,
  ): Promise<SupersedeCurrentKnowledgeResult>;
  loadKnowledgeLifecycleSnapshot(): Promise<KnowledgeLifecycleSnapshotResult>;
}

/** Compatibility name for the complete unified Knowledge Store port. */
export type KnowledgeLifecycleStore = KnowledgeStore;

export class InvalidKnowledgeInputError extends Error {
  public constructor() {
    super("Knowledge request is invalid.");
    this.name = "InvalidKnowledgeInputError";
  }
}
export class InvalidKnowledgeLifecycleSnapshotEntryValueError extends Error {
  public constructor() {
    super("Knowledge lifecycle snapshot entry value is invalid.");
    this.name = "InvalidKnowledgeLifecycleSnapshotEntryValueError";
  }
}
export class InvalidKnowledgeLifecycleSnapshotValueError extends Error {
  public constructor() {
    super("Knowledge lifecycle snapshot value is invalid.");
    this.name = "InvalidKnowledgeLifecycleSnapshotValueError";
  }
}
export class InvalidKnowledgeStoreRequestValueError extends Error {
  public constructor() {
    super("Knowledge Store request value is invalid.");
    this.name = "InvalidKnowledgeStoreRequestValueError";
  }
}
export class InvalidKnowledgeStoreResultValueError extends Error {
  public constructor() {
    super("Knowledge Store result value is invalid.");
    this.name = "InvalidKnowledgeStoreResultValueError";
  }
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
  required: readonly string[],
  optional: readonly string[] = [],
): boolean {
  const keys = Object.keys(value);
  return (
    required.every((field) => keys.includes(field)) &&
    keys.every(
      (field) => required.includes(field) || optional.includes(field),
    ) &&
    keys.length >= required.length &&
    keys.length <= required.length + optional.length
  );
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

export class InvalidKnowledgeProjectionRequestError extends Error {
  public constructor() {
    super("Knowledge projection request is invalid.");
    this.name = "InvalidKnowledgeProjectionRequestError";
  }
}
export class KnowledgeProjectionVersionMismatchError extends Error {
  public constructor() {
    super("Knowledge projection target version does not match.");
    this.name = "KnowledgeProjectionVersionMismatchError";
  }
}
export class KnowledgeProjectionIneligibleError extends Error {
  public constructor() {
    super("Accepted Knowledge is ineligible for structured projection.");
    this.name = "KnowledgeProjectionIneligibleError";
  }
}
export class KnowledgeProjectionPreparationMismatchError extends Error {
  public constructor() {
    super("Knowledge projection preparation prerequisite does not match.");
    this.name = "KnowledgeProjectionPreparationMismatchError";
  }
}
export class KnowledgeProjectionConstructionError extends Error {
  public constructor() {
    super("Knowledge projection construction failed.");
    this.name = "KnowledgeProjectionConstructionError";
  }
}
export class KnowledgeProjectionIssuanceError extends Error {
  public constructor() {
    super("Knowledge projection issuance failed.");
    this.name = "KnowledgeProjectionIssuanceError";
  }
}
export class InvalidKnowledgeProjectionVerificationRequestError extends Error {
  public constructor() {
    super("Knowledge projection verification request is invalid.");
    this.name = "InvalidKnowledgeProjectionVerificationRequestError";
  }
}
export class KnowledgeProjectionAuthorityVerificationError extends Error {
  public constructor() {
    super("Knowledge projection authority verification failed.");
    this.name = "KnowledgeProjectionAuthorityVerificationError";
  }
}
