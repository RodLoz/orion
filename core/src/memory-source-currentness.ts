import { createMemoryReference, type MemoryReference } from "./memory.js";
import {
  candidatePreparationAssociation,
  type CandidatePreparationAssociation,
} from "./candidate-preparation-association.js";

export const MEMORY_SOURCE_RELATIONSHIP_IDENTITY_MAX_CODE_POINTS = 256;
export const MEMORY_SOURCE_PROPOSITION_KEY_MAX_CODE_POINTS = 128;
export const MEMORY_SOURCE_TEXTUAL_SCALAR_MAX_CODE_POINTS = 4096;
export const MEMORY_SOURCE_VERIFICATION_CORRESPONDENCE_MAX_CODE_POINTS = 256;

export type MemorySourceRelationshipIdentity = string & {
  readonly __memorySourceRelationshipIdentity: unique symbol;
};
export type MemorySourceSubjectKey = string & {
  readonly __memorySourceSubjectKey: unique symbol;
};
export type MemorySourcePredicateKey = string & {
  readonly __memorySourcePredicateKey: unique symbol;
};
export type MemorySourceTextualScalar = string & {
  readonly __memorySourceTextualScalar: unique symbol;
};
export type MemorySourceIssuerVerificationCorrespondence = string & {
  readonly __memorySourceIssuerVerificationCorrespondence: unique symbol;
};

export interface MemorySourceAttribution {
  readonly authoritativeCapability: "memory";
}

export interface MemorySourcePropositionTuple {
  readonly subjectKey: MemorySourceSubjectKey;
  readonly predicateKey: MemorySourcePredicateKey;
  readonly textualScalar: MemorySourceTextualScalar;
}

export interface MemorySourceRelationship {
  readonly sourceAttribution: MemorySourceAttribution;
  readonly memoryReference: MemoryReference;
  readonly semanticValue: MemorySourcePropositionTuple;
  readonly relationshipIdentity: MemorySourceRelationshipIdentity;
}

export interface MemorySourceCurrentnessRequest {
  readonly relationship: MemorySourceRelationship;
  readonly candidatePreparationAssociation: CandidatePreparationAssociation;
}

export interface IssueMemorySourceRelationshipRequest {
  readonly sourceAttribution: MemorySourceAttribution;
  readonly memoryReference: MemoryReference;
  readonly semanticValue: MemorySourcePropositionTuple;
}

export interface IssueMemorySourceRelationship {
  issueMemorySourceRelationship(
    request: IssueMemorySourceRelationshipRequest,
  ): MemorySourceRelationship;
}

export interface BindMemorySourceRelationshipToPreparationRequest {
  readonly relationship: MemorySourceRelationship;
  readonly candidatePreparationAssociation: CandidatePreparationAssociation;
}

export interface BindMemorySourceRelationshipToPreparation {
  bindMemorySourceRelationshipToPreparation(
    request: BindMemorySourceRelationshipToPreparationRequest,
  ): MemorySourceCurrentnessRequest;
}

export interface PositiveMemorySourceCurrentnessCorrespondence {
  readonly sourceAttribution: MemorySourceAttribution;
  readonly relationshipIdentity: MemorySourceRelationshipIdentity;
  readonly candidatePreparationAssociation: CandidatePreparationAssociation;
  readonly determination: "POSITIVE";
  readonly issuerVerification: MemorySourceIssuerVerificationCorrespondence;
}

export type MemorySourceCurrentnessResult =
  | Readonly<{
      determination: "POSITIVE";
      correspondence: PositiveMemorySourceCurrentnessCorrespondence;
    }>
  | Readonly<{
      determination: "NEGATIVE";
    }>;

export interface VerifyMemorySourceAuthorityRequest {
  readonly intent: "verify-memory-source-authority";
  readonly currentnessRequest: MemorySourceCurrentnessRequest;
}

export interface VerifyMemorySourceAuthority {
  verifyMemorySourceAuthority(
    request: VerifyMemorySourceAuthorityRequest,
  ): MemorySourceCurrentnessResult;
}

export function memorySourceRelationshipIdentity(
  value: unknown,
): MemorySourceRelationshipIdentity {
  return boundedOpaqueString(
    value,
    MEMORY_SOURCE_RELATIONSHIP_IDENTITY_MAX_CODE_POINTS,
    new InvalidMemorySourceRelationshipError(),
  ) as MemorySourceRelationshipIdentity;
}

export function memorySourceIssuerVerificationCorrespondence(
  value: unknown,
): MemorySourceIssuerVerificationCorrespondence {
  return boundedOpaqueString(
    value,
    MEMORY_SOURCE_VERIFICATION_CORRESPONDENCE_MAX_CODE_POINTS,
    new MemorySourceAuthorityVerificationFailureError(),
  ) as MemorySourceIssuerVerificationCorrespondence;
}

export function createMemorySourceAttribution(
  input: unknown,
): MemorySourceAttribution {
  if (
    !isPlainRecord(input) ||
    !hasExactFields(input, ["authoritativeCapability"]) ||
    input.authoritativeCapability !== "memory"
  ) {
    throw new InvalidMemorySourceRelationshipError();
  }
  return Object.freeze({ authoritativeCapability: "memory" });
}

export function createMemorySourcePropositionTuple(
  input: unknown,
): MemorySourcePropositionTuple {
  try {
    if (
      !isPlainRecord(input) ||
      !hasExactFields(input, ["subjectKey", "predicateKey", "textualScalar"])
    ) {
      throw new Error();
    }
    return Object.freeze({
      subjectKey: boundedNonEmptyString(
        input.subjectKey,
        MEMORY_SOURCE_PROPOSITION_KEY_MAX_CODE_POINTS,
      ) as MemorySourceSubjectKey,
      predicateKey: boundedNonEmptyString(
        input.predicateKey,
        MEMORY_SOURCE_PROPOSITION_KEY_MAX_CODE_POINTS,
      ) as MemorySourcePredicateKey,
      textualScalar: boundedNonEmptyString(
        input.textualScalar,
        MEMORY_SOURCE_TEXTUAL_SCALAR_MAX_CODE_POINTS,
      ) as MemorySourceTextualScalar,
    });
  } catch {
    throw new InvalidMemorySourceRelationshipError();
  }
}

export function createMemorySourceRelationship(
  input: unknown,
): MemorySourceRelationship {
  try {
    if (
      !isPlainRecord(input) ||
      !hasExactFields(input, [
        "sourceAttribution",
        "memoryReference",
        "semanticValue",
        "relationshipIdentity",
      ]) ||
      !isPlainRecord(input.memoryReference) ||
      !hasExactFields(input.memoryReference, [
        "memoryIdentity",
        "kind",
        "authoritativeCapability",
        "lifecycleState",
      ]) ||
      input.memoryReference.kind !== "episodic" ||
      input.memoryReference.authoritativeCapability !== "memory" ||
      input.memoryReference.lifecycleState !== "stored"
    ) {
      throw new Error();
    }
    return Object.freeze({
      sourceAttribution: createMemorySourceAttribution(input.sourceAttribution),
      memoryReference: createMemoryReference(
        input.memoryReference.memoryIdentity,
      ),
      semanticValue: createMemorySourcePropositionTuple(input.semanticValue),
      relationshipIdentity: memorySourceRelationshipIdentity(
        input.relationshipIdentity,
      ),
    });
  } catch {
    throw new InvalidMemorySourceRelationshipError();
  }
}

export function createMemorySourceCurrentnessRequest(
  input: unknown,
): MemorySourceCurrentnessRequest {
  try {
    if (
      !isPlainRecord(input) ||
      !hasExactFields(input, [
        "relationship",
        "candidatePreparationAssociation",
      ])
    ) {
      throw new Error();
    }
    return Object.freeze({
      relationship: createMemorySourceRelationship(input.relationship),
      candidatePreparationAssociation: candidatePreparationAssociation(
        input.candidatePreparationAssociation,
      ),
    });
  } catch {
    throw new InvalidMemorySourceCurrentnessRequestError();
  }
}

export function createPositiveMemorySourceCurrentnessCorrespondence(
  input: unknown,
): PositiveMemorySourceCurrentnessCorrespondence {
  try {
    if (
      !isPlainRecord(input) ||
      !hasExactFields(input, [
        "sourceAttribution",
        "relationshipIdentity",
        "candidatePreparationAssociation",
        "determination",
        "issuerVerification",
      ]) ||
      input.determination !== "POSITIVE"
    ) {
      throw new Error();
    }
    return Object.freeze({
      sourceAttribution: createMemorySourceAttribution(input.sourceAttribution),
      relationshipIdentity: memorySourceRelationshipIdentity(
        input.relationshipIdentity,
      ),
      candidatePreparationAssociation: candidatePreparationAssociation(
        input.candidatePreparationAssociation,
      ),
      determination: "POSITIVE",
      issuerVerification: memorySourceIssuerVerificationCorrespondence(
        input.issuerVerification,
      ),
    });
  } catch {
    throw new MemorySourceAuthorityVerificationFailureError();
  }
}

export function createMemorySourceCurrentnessResult(
  input: unknown,
): MemorySourceCurrentnessResult {
  try {
    if (!isPlainRecord(input)) throw new Error();
    if (
      input.determination === "NEGATIVE" &&
      hasExactFields(input, ["determination"])
    ) {
      return Object.freeze({ determination: "NEGATIVE" });
    }
    if (
      input.determination === "POSITIVE" &&
      hasExactFields(input, ["determination", "correspondence"])
    ) {
      return Object.freeze({
        determination: "POSITIVE",
        correspondence: createPositiveMemorySourceCurrentnessCorrespondence(
          input.correspondence,
        ),
      });
    }
    throw new Error();
  } catch {
    throw new InvalidMemorySourceCurrentnessRequestError();
  }
}

export class InvalidMemorySourceCurrentnessRequestError extends Error {
  public constructor() {
    super("Memory Source Currentness request is invalid.");
    this.name = "InvalidMemorySourceCurrentnessRequestError";
  }
}

export class InvalidMemorySourceRelationshipError extends Error {
  public constructor() {
    super("Memory Source Relationship is invalid.");
    this.name = "InvalidMemorySourceRelationshipError";
  }
}

export class MemorySourceAuthorityVerificationFailureError extends Error {
  public constructor() {
    super("Memory Source authority verification failed.");
    this.name = "MemorySourceAuthorityVerificationFailureError";
  }
}

export class MemorySourceCurrentnessUnableToDetermineError extends Error {
  public constructor() {
    super("Memory Source Currentness is unable to be determined.");
    this.name = "MemorySourceCurrentnessUnableToDetermineError";
  }
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

function boundedNonEmptyString(value: unknown, maximum: number): string {
  if (
    typeof value !== "string" ||
    value.length === 0 ||
    value.trim().length === 0 ||
    [...value].length > maximum
  ) {
    throw new Error();
  }
  return value;
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
): boolean {
  const keys = Object.keys(value);
  return (
    keys.length === required.length &&
    required.every((field) => keys.includes(field))
  );
}
