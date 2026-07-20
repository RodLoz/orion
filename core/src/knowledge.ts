export const KNOWLEDGE_CLAIM_MAX_CODE_POINTS = 4096;
export const KNOWLEDGE_REASON_MAX_CODE_POINTS = 512;
export const KNOWLEDGE_IDENTITY_MAX_CODE_POINTS = 128;
export const KNOWLEDGE_AUTHORITY_MAX_CODE_POINTS = 128;
export const KNOWLEDGE_ORIGINATING_CAPABILITY_MAX_CODE_POINTS = 128;
export const KNOWLEDGE_SOURCE_REFERENCE_MAX_CODE_POINTS = 256;
export const KNOWLEDGE_VERSION_MAX = 9_007_199_254_740_991;

export type KnowledgeIdentity = string & {
  readonly __knowledgeIdentity: unique symbol;
};
export type CandidateClaim = string & {
  readonly __candidateClaim: unique symbol;
};
export type KnowledgeAcceptanceReason = string & {
  readonly __knowledgeAcceptanceReason: unique symbol;
};
export type KnowledgeContradictionReason = string & {
  readonly __knowledgeContradictionReason: unique symbol;
};
export type KnowledgeAuthorityIdentifier = string & {
  readonly __knowledgeAuthorityIdentifier: unique symbol;
};
export type KnowledgeOriginatingCapability = string & {
  readonly __knowledgeOriginatingCapability: unique symbol;
};
export type KnowledgeSourceReference = string & {
  readonly __knowledgeSourceReference: unique symbol;
};
export type KnowledgeTimestamp = string & {
  readonly __knowledgeTimestamp: unique symbol;
};
export type KnowledgeVersion = number & {
  readonly __knowledgeVersion: unique symbol;
};

export type KnowledgeEvidenceDecision = "accept" | "reject";
export type KnowledgeSourceType =
  "manual-assertion" | "approved-internal-source";
export type KnowledgeCurrency = "current" | "superseded";
export type KnowledgeRejectionCategory =
  "authority-rejected" | "contradiction-preserved";

export interface KnowledgeAcceptanceEvidence {
  readonly method: "explicit-authority-review";
  readonly authorityIdentifier: KnowledgeAuthorityIdentifier;
  readonly decision: KnowledgeEvidenceDecision;
  readonly reason: KnowledgeAcceptanceReason;
}

export interface AcceptedKnowledgeEvidence extends KnowledgeAcceptanceEvidence {
  readonly decision: "accept";
}

export interface KnowledgeProvenance {
  readonly sourceType: KnowledgeSourceType;
  readonly originatingCapability: KnowledgeOriginatingCapability;
  readonly observedAt: KnowledgeTimestamp;
  readonly sourceReference?: KnowledgeSourceReference;
}

export interface KnowledgeRecord {
  readonly knowledgeIdentity: KnowledgeIdentity;
  readonly claim: CandidateClaim;
  readonly provenance: KnowledgeProvenance;
  readonly acceptanceEvidence: AcceptedKnowledgeEvidence;
  readonly validationState: "accepted";
  readonly acceptedAt: KnowledgeTimestamp;
  readonly version: KnowledgeVersion;
  readonly supersedesKnowledgeIdentity?: KnowledgeIdentity;
}

export interface KnowledgeReference {
  readonly knowledgeIdentity: KnowledgeIdentity;
  readonly validationState: "accepted";
  readonly version: KnowledgeVersion;
  readonly currency: KnowledgeCurrency;
  readonly authoritativeCapability: "knowledge";
}

export interface AcceptedKnowledgeDecision {
  readonly outcome: "accepted";
  readonly record: KnowledgeRecord;
  readonly reference: KnowledgeReference;
}

export interface RejectedKnowledgeDecision {
  readonly outcome: "rejected";
  readonly category: KnowledgeRejectionCategory;
}

export type KnowledgeAcceptanceDecision =
  AcceptedKnowledgeDecision | RejectedKnowledgeDecision;

export interface RetrievedKnowledge {
  readonly knowledge: KnowledgeRecord;
  readonly reference: KnowledgeReference;
}

export function knowledgeIdentity(value: unknown): KnowledgeIdentity {
  return boundedOpaqueString(
    value,
    KNOWLEDGE_IDENTITY_MAX_CODE_POINTS,
    new InvalidKnowledgeIdentityValueError(),
  ) as KnowledgeIdentity;
}

export function candidateClaim(value: unknown): CandidateClaim {
  if (!isNonEmptyBoundedString(value, KNOWLEDGE_CLAIM_MAX_CODE_POINTS)) {
    throw new InvalidCandidateClaimValueError();
  }
  return value as CandidateClaim;
}

export function knowledgeAcceptanceReason(
  value: unknown,
): KnowledgeAcceptanceReason {
  if (!isNonEmptyBoundedString(value, KNOWLEDGE_REASON_MAX_CODE_POINTS)) {
    throw new InvalidKnowledgeAcceptanceEvidenceValueError();
  }
  return value as KnowledgeAcceptanceReason;
}

export function knowledgeContradictionReason(
  value: unknown,
): KnowledgeContradictionReason {
  if (!isNonEmptyBoundedString(value, KNOWLEDGE_REASON_MAX_CODE_POINTS)) {
    throw new InvalidKnowledgeContradictionValueError();
  }
  return value as KnowledgeContradictionReason;
}

export function knowledgeAuthorityIdentifier(
  value: unknown,
): KnowledgeAuthorityIdentifier {
  return boundedOpaqueString(
    value,
    KNOWLEDGE_AUTHORITY_MAX_CODE_POINTS,
    new InvalidKnowledgeAcceptanceEvidenceValueError(),
  ) as KnowledgeAuthorityIdentifier;
}

export function knowledgeOriginatingCapability(
  value: unknown,
): KnowledgeOriginatingCapability {
  return boundedOpaqueString(
    value,
    KNOWLEDGE_ORIGINATING_CAPABILITY_MAX_CODE_POINTS,
    new InvalidKnowledgeProvenanceValueError(),
  ) as KnowledgeOriginatingCapability;
}

export function knowledgeSourceReference(
  value: unknown,
): KnowledgeSourceReference {
  return boundedOpaqueString(
    value,
    KNOWLEDGE_SOURCE_REFERENCE_MAX_CODE_POINTS,
    new InvalidKnowledgeProvenanceValueError(),
  ) as KnowledgeSourceReference;
}

export function knowledgeTimestamp(value: unknown): KnowledgeTimestamp {
  if (
    typeof value !== "string" ||
    !/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d{3})?Z$/.test(value) ||
    !isExactUtcTimestamp(value)
  ) {
    throw new InvalidKnowledgeTimestampValueError();
  }
  return value as KnowledgeTimestamp;
}

export function knowledgeVersion(value: unknown): KnowledgeVersion {
  if (
    typeof value !== "number" ||
    !Number.isFinite(value) ||
    !Number.isSafeInteger(value) ||
    value < 1 ||
    value > KNOWLEDGE_VERSION_MAX
  ) {
    throw new InvalidKnowledgeVersionValueError();
  }
  return value as KnowledgeVersion;
}

export function createKnowledgeAcceptanceEvidence(
  input: unknown,
): KnowledgeAcceptanceEvidence {
  try {
    if (
      !isPlainRecord(input) ||
      !hasExactFields(input, [
        "method",
        "authorityIdentifier",
        "decision",
        "reason",
      ]) ||
      input.method !== "explicit-authority-review" ||
      (input.decision !== "accept" && input.decision !== "reject")
    ) {
      throw new Error();
    }
    return Object.freeze({
      method: "explicit-authority-review",
      authorityIdentifier: knowledgeAuthorityIdentifier(
        input.authorityIdentifier,
      ),
      decision: input.decision,
      reason: knowledgeAcceptanceReason(input.reason),
    });
  } catch {
    throw new InvalidKnowledgeAcceptanceEvidenceValueError();
  }
}

export function createKnowledgeProvenance(input: unknown): KnowledgeProvenance {
  try {
    if (
      !isPlainRecord(input) ||
      !hasExactFields(
        input,
        ["sourceType", "originatingCapability", "observedAt"],
        ["sourceReference"],
      ) ||
      (input.sourceType !== "manual-assertion" &&
        input.sourceType !== "approved-internal-source")
    ) {
      throw new Error();
    }
    return Object.freeze({
      sourceType: input.sourceType,
      originatingCapability: knowledgeOriginatingCapability(
        input.originatingCapability,
      ),
      observedAt: knowledgeTimestamp(input.observedAt),
      ...(Object.hasOwn(input, "sourceReference")
        ? { sourceReference: knowledgeSourceReference(input.sourceReference) }
        : {}),
    });
  } catch {
    throw new InvalidKnowledgeProvenanceValueError();
  }
}

export function createKnowledgeRecord(input: unknown): KnowledgeRecord {
  try {
    if (
      !isPlainRecord(input) ||
      !hasExactFields(
        input,
        [
          "knowledgeIdentity",
          "claim",
          "provenance",
          "acceptanceEvidence",
          "acceptedAt",
          "version",
        ],
        ["supersedesKnowledgeIdentity", "validationState"],
      ) ||
      (Object.hasOwn(input, "validationState") &&
        input.validationState !== "accepted")
    ) {
      throw new Error();
    }
    const acceptanceEvidence = createKnowledgeAcceptanceEvidence(
      input.acceptanceEvidence,
    );
    if (acceptanceEvidence.decision !== "accept") throw new Error();
    const acceptedEvidence: AcceptedKnowledgeEvidence = Object.freeze({
      method: acceptanceEvidence.method,
      authorityIdentifier: acceptanceEvidence.authorityIdentifier,
      decision: "accept",
      reason: acceptanceEvidence.reason,
    });
    return Object.freeze({
      knowledgeIdentity: knowledgeIdentity(input.knowledgeIdentity),
      claim: candidateClaim(input.claim),
      provenance: createKnowledgeProvenance(input.provenance),
      acceptanceEvidence: acceptedEvidence,
      validationState: "accepted",
      acceptedAt: knowledgeTimestamp(input.acceptedAt),
      version: knowledgeVersion(input.version),
      ...(Object.hasOwn(input, "supersedesKnowledgeIdentity")
        ? {
            supersedesKnowledgeIdentity: knowledgeIdentity(
              input.supersedesKnowledgeIdentity,
            ),
          }
        : {}),
    });
  } catch {
    throw new InvalidKnowledgeRecordValueError();
  }
}

export function createKnowledgeReference(input: unknown): KnowledgeReference {
  try {
    if (
      !isPlainRecord(input) ||
      !hasExactFields(input, ["knowledgeIdentity", "version", "currency"]) ||
      (input.currency !== "current" && input.currency !== "superseded")
    ) {
      throw new Error();
    }
    return Object.freeze({
      knowledgeIdentity: knowledgeIdentity(input.knowledgeIdentity),
      validationState: "accepted",
      version: knowledgeVersion(input.version),
      currency: input.currency,
      authoritativeCapability: "knowledge",
    });
  } catch {
    throw new InvalidKnowledgeReferenceValueError();
  }
}

export function createAcceptedKnowledgeDecision(
  input: unknown,
): AcceptedKnowledgeDecision {
  try {
    if (
      !isPlainRecord(input) ||
      !hasExactFields(input, ["record", "reference"])
    ) {
      throw new Error();
    }
    const record = createKnowledgeRecord(input.record);
    const reference = reconstructKnowledgeReference(input.reference);
    if (
      reference.knowledgeIdentity !== record.knowledgeIdentity ||
      reference.version !== record.version ||
      reference.currency !== "current"
    ) {
      throw new Error();
    }
    return Object.freeze({ outcome: "accepted", record, reference });
  } catch {
    throw new InvalidKnowledgeDecisionValueError();
  }
}

export function createRejectedKnowledgeDecision(
  category: unknown,
): RejectedKnowledgeDecision {
  if (
    category !== "authority-rejected" &&
    category !== "contradiction-preserved"
  ) {
    throw new InvalidKnowledgeDecisionValueError();
  }
  return Object.freeze({ outcome: "rejected", category });
}

function reconstructKnowledgeReference(value: unknown): KnowledgeReference {
  if (
    !isPlainRecord(value) ||
    !hasExactFields(value, [
      "knowledgeIdentity",
      "validationState",
      "version",
      "currency",
      "authoritativeCapability",
    ]) ||
    value.validationState !== "accepted" ||
    value.authoritativeCapability !== "knowledge"
  ) {
    throw new InvalidKnowledgeReferenceValueError();
  }
  return createKnowledgeReference({
    knowledgeIdentity: value.knowledgeIdentity,
    version: value.version,
    currency: value.currency,
  });
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

function isExactUtcTimestamp(value: string): boolean {
  const milliseconds = Date.parse(value);
  if (Number.isNaN(milliseconds)) return false;
  const canonical = new Date(milliseconds).toISOString();
  return (
    value === canonical ||
    (canonical.endsWith(".000Z") && value === canonical.replace(".000Z", "Z"))
  );
}

function isNonEmptyBoundedString(value: unknown, maximum: number): boolean {
  return (
    typeof value === "string" &&
    value.length > 0 &&
    value.trim().length > 0 &&
    [...value].length <= maximum
  );
}

function boundedOpaqueString(
  value: unknown,
  maximum: number,
  failure: Error,
): string {
  if (
    typeof value !== "string" ||
    value.length === 0 ||
    value.trim().length === 0 ||
    value.trim() !== value ||
    [...value].length > maximum
  ) {
    throw failure;
  }
  return value;
}

export class InvalidKnowledgeIdentityValueError extends Error {
  public constructor() {
    super("Knowledge Identity value is invalid.");
    this.name = "InvalidKnowledgeIdentityValueError";
  }
}
export class InvalidCandidateClaimValueError extends Error {
  public constructor() {
    super("Candidate Claim value is invalid.");
    this.name = "InvalidCandidateClaimValueError";
  }
}
export class InvalidKnowledgeAcceptanceEvidenceValueError extends Error {
  public constructor() {
    super("Knowledge Acceptance Evidence value is invalid.");
    this.name = "InvalidKnowledgeAcceptanceEvidenceValueError";
  }
}
export class InvalidKnowledgeContradictionValueError extends Error {
  public constructor() {
    super("Knowledge contradiction value is invalid.");
    this.name = "InvalidKnowledgeContradictionValueError";
  }
}
export class InvalidKnowledgeProvenanceValueError extends Error {
  public constructor() {
    super("Knowledge Provenance value is invalid.");
    this.name = "InvalidKnowledgeProvenanceValueError";
  }
}
export class InvalidKnowledgeTimestampValueError extends Error {
  public constructor() {
    super("Knowledge timestamp value is invalid.");
    this.name = "InvalidKnowledgeTimestampValueError";
  }
}
export class InvalidKnowledgeVersionValueError extends Error {
  public constructor() {
    super("Knowledge Version value is invalid.");
    this.name = "InvalidKnowledgeVersionValueError";
  }
}
export class InvalidKnowledgeRecordValueError extends Error {
  public constructor() {
    super("Knowledge Record value is invalid.");
    this.name = "InvalidKnowledgeRecordValueError";
  }
}
export class InvalidKnowledgeReferenceValueError extends Error {
  public constructor() {
    super("Knowledge Reference value is invalid.");
    this.name = "InvalidKnowledgeReferenceValueError";
  }
}
export class InvalidKnowledgeDecisionValueError extends Error {
  public constructor() {
    super("Knowledge Acceptance Decision value is invalid.");
    this.name = "InvalidKnowledgeDecisionValueError";
  }
}
