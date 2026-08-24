export const KNOWLEDGE_PROPOSITION_KEY_MAX_CODE_POINTS = 128;
export const KNOWLEDGE_TEXTUAL_SCALAR_MAX_CODE_POINTS = 4096;

export type PropositionIdentity = string & {
  readonly __propositionIdentity: unique symbol;
};
export type KnowledgeSubjectKey = string & {
  readonly __knowledgeSubjectKey: unique symbol;
};
export type KnowledgePredicateKey = string & {
  readonly __knowledgePredicateKey: unique symbol;
};
export type KnowledgeTextualScalar = string & {
  readonly __knowledgeTextualScalar: unique symbol;
};
export type KnowledgeExternalSourceOwnerCorrespondence = string & {
  readonly __knowledgeExternalSourceOwnerCorrespondence: unique symbol;
};
export type KnowledgeSourceRelationshipCorrespondence = string & {
  readonly __knowledgeSourceRelationshipCorrespondence: unique symbol;
};
export type KnowledgeCurrentnessOwnerCase =
  "knowledge-owned-currentness" | "external-source-currentness";

export interface StructuredTextualKnowledgeProposition {
  readonly subjectKey: KnowledgeSubjectKey;
  readonly predicateKey: KnowledgePredicateKey;
  readonly textualScalar: KnowledgeTextualScalar;
}

export type StructuredKnowledgeSourceOwnershipProposal =
  | Readonly<{
      currentnessOwner: "knowledge-owned-currentness";
      applicableOwner?: never;
      propositionSourceRelationship?: never;
    }>
  | Readonly<{
      currentnessOwner: "external-source-currentness";
      applicableOwner: KnowledgeExternalSourceOwnerCorrespondence;
      propositionSourceRelationship: KnowledgeSourceRelationshipCorrespondence;
    }>;

export type AcceptedStructuredKnowledgeSourceOwnershipCorrespondence =
  | Readonly<{
      currentnessOwner: "knowledge-owned-currentness";
      applicableOwner?: never;
      propositionSourceRelationship?: never;
    }>
  | Readonly<{
      currentnessOwner: "external-source-currentness";
      applicableOwner: KnowledgeExternalSourceOwnerCorrespondence;
      propositionSourceRelationship: KnowledgeSourceRelationshipCorrespondence;
    }>;

export interface AcceptedStructuredKnowledgeProposition {
  readonly propositionIdentity: PropositionIdentity;
  readonly semanticValue: StructuredTextualKnowledgeProposition;
  readonly sourceOwnershipCorrespondence: AcceptedStructuredKnowledgeSourceOwnershipCorrespondence;
}

export function propositionIdentity(value: unknown): PropositionIdentity {
  if (typeof value !== "string" || value.length === 0) {
    throw new InvalidPropositionIdentityValueError();
  }
  return value as PropositionIdentity;
}

export function knowledgeSubjectKey(value: unknown): KnowledgeSubjectKey {
  return boundedKey(
    value,
    new InvalidKnowledgeSubjectKeyValueError(),
  ) as KnowledgeSubjectKey;
}

export function knowledgePredicateKey(value: unknown): KnowledgePredicateKey {
  return boundedKey(
    value,
    new InvalidKnowledgePredicateKeyValueError(),
  ) as KnowledgePredicateKey;
}

export function knowledgeTextualScalar(value: unknown): KnowledgeTextualScalar {
  if (
    typeof value !== "string" ||
    value.length === 0 ||
    value.trim().length === 0 ||
    [...value].length > KNOWLEDGE_TEXTUAL_SCALAR_MAX_CODE_POINTS
  ) {
    throw new InvalidKnowledgeTextualScalarValueError();
  }
  return value as KnowledgeTextualScalar;
}

export function knowledgeExternalSourceOwnerCorrespondence(
  value: unknown,
): KnowledgeExternalSourceOwnerCorrespondence {
  return opaqueCorrespondence(
    value,
    new InvalidKnowledgeExternalSourceOwnerCorrespondenceValueError(),
  ) as KnowledgeExternalSourceOwnerCorrespondence;
}

export function knowledgeSourceRelationshipCorrespondence(
  value: unknown,
): KnowledgeSourceRelationshipCorrespondence {
  return opaqueCorrespondence(
    value,
    new InvalidKnowledgeSourceRelationshipCorrespondenceValueError(),
  ) as KnowledgeSourceRelationshipCorrespondence;
}

export function createStructuredKnowledgeSourceOwnershipProposal(
  input: unknown,
): StructuredKnowledgeSourceOwnershipProposal {
  try {
    return reconstructSourceOwnershipCorrespondence(input);
  } catch {
    throw new InvalidStructuredKnowledgeSourceOwnershipProposalValueError();
  }
}

export function createAcceptedStructuredKnowledgeSourceOwnershipCorrespondence(
  input: unknown,
): AcceptedStructuredKnowledgeSourceOwnershipCorrespondence {
  try {
    return reconstructSourceOwnershipCorrespondence(input);
  } catch {
    throw new InvalidAcceptedStructuredKnowledgeSourceOwnershipCorrespondenceValueError();
  }
}

export function createStructuredTextualKnowledgeProposition(
  input: unknown,
): StructuredTextualKnowledgeProposition {
  try {
    if (
      !isPlainRecord(input) ||
      !hasExactFields(input, ["subjectKey", "predicateKey", "textualScalar"])
    ) {
      throw new Error();
    }
    return Object.freeze({
      subjectKey: knowledgeSubjectKey(input.subjectKey),
      predicateKey: knowledgePredicateKey(input.predicateKey),
      textualScalar: knowledgeTextualScalar(input.textualScalar),
    });
  } catch {
    throw new InvalidStructuredTextualKnowledgePropositionValueError();
  }
}

export function createAcceptedStructuredKnowledgeProposition(
  input: unknown,
): AcceptedStructuredKnowledgeProposition {
  try {
    if (
      !isPlainRecord(input) ||
      !hasExactFields(input, [
        "propositionIdentity",
        "semanticValue",
        "sourceOwnershipCorrespondence",
      ])
    ) {
      throw new Error();
    }
    return Object.freeze({
      propositionIdentity: propositionIdentity(input.propositionIdentity),
      semanticValue: createStructuredTextualKnowledgeProposition(
        input.semanticValue,
      ),
      sourceOwnershipCorrespondence:
        createAcceptedStructuredKnowledgeSourceOwnershipCorrespondence(
          input.sourceOwnershipCorrespondence,
        ),
    });
  } catch {
    throw new InvalidAcceptedStructuredKnowledgePropositionValueError();
  }
}

function reconstructSourceOwnershipCorrespondence(
  input: unknown,
): AcceptedStructuredKnowledgeSourceOwnershipCorrespondence {
  if (!isPlainRecord(input)) throw new Error();
  if (
    input.currentnessOwner === "knowledge-owned-currentness" &&
    hasExactFields(input, ["currentnessOwner"])
  ) {
    return Object.freeze({
      currentnessOwner: "knowledge-owned-currentness",
    });
  }
  if (
    input.currentnessOwner === "external-source-currentness" &&
    hasExactFields(input, [
      "currentnessOwner",
      "applicableOwner",
      "propositionSourceRelationship",
    ])
  ) {
    return Object.freeze({
      currentnessOwner: "external-source-currentness",
      applicableOwner: knowledgeExternalSourceOwnerCorrespondence(
        input.applicableOwner,
      ),
      propositionSourceRelationship: knowledgeSourceRelationshipCorrespondence(
        input.propositionSourceRelationship,
      ),
    });
  }
  throw new Error();
}

function opaqueCorrespondence(value: unknown, failure: Error): string {
  if (typeof value !== "string" || value.length === 0) throw failure;
  return value;
}

function boundedKey(value: unknown, failure: Error): string {
  if (
    typeof value !== "string" ||
    value.length === 0 ||
    value.trim().length === 0 ||
    value.trim() !== value ||
    [...value].length > KNOWLEDGE_PROPOSITION_KEY_MAX_CODE_POINTS
  ) {
    throw failure;
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
    required.every((field) => keys.includes(field)) &&
    keys.every((field) => required.includes(field)) &&
    keys.length === required.length
  );
}

export class InvalidPropositionIdentityValueError extends Error {
  public constructor() {
    super("Proposition Identity value is invalid.");
    this.name = "InvalidPropositionIdentityValueError";
  }
}
export class InvalidKnowledgeSubjectKeyValueError extends Error {
  public constructor() {
    super("Knowledge subject key value is invalid.");
    this.name = "InvalidKnowledgeSubjectKeyValueError";
  }
}
export class InvalidKnowledgePredicateKeyValueError extends Error {
  public constructor() {
    super("Knowledge predicate key value is invalid.");
    this.name = "InvalidKnowledgePredicateKeyValueError";
  }
}
export class InvalidKnowledgeTextualScalarValueError extends Error {
  public constructor() {
    super("Knowledge textual scalar value is invalid.");
    this.name = "InvalidKnowledgeTextualScalarValueError";
  }
}
export class InvalidStructuredTextualKnowledgePropositionValueError extends Error {
  public constructor() {
    super("Structured textual Knowledge proposition value is invalid.");
    this.name = "InvalidStructuredTextualKnowledgePropositionValueError";
  }
}
export class InvalidAcceptedStructuredKnowledgePropositionValueError extends Error {
  public constructor() {
    super("Accepted structured Knowledge proposition value is invalid.");
    this.name = "InvalidAcceptedStructuredKnowledgePropositionValueError";
  }
}
export class InvalidKnowledgeExternalSourceOwnerCorrespondenceValueError extends Error {
  public constructor() {
    super("Knowledge external source owner correspondence value is invalid.");
    this.name = "InvalidKnowledgeExternalSourceOwnerCorrespondenceValueError";
  }
}
export class InvalidKnowledgeSourceRelationshipCorrespondenceValueError extends Error {
  public constructor() {
    super("Knowledge source relationship correspondence value is invalid.");
    this.name = "InvalidKnowledgeSourceRelationshipCorrespondenceValueError";
  }
}
export class InvalidStructuredKnowledgeSourceOwnershipProposalValueError extends Error {
  public constructor() {
    super("Structured Knowledge source ownership proposal value is invalid.");
    this.name = "InvalidStructuredKnowledgeSourceOwnershipProposalValueError";
  }
}
export class InvalidAcceptedStructuredKnowledgeSourceOwnershipCorrespondenceValueError extends Error {
  public constructor() {
    super(
      "Accepted structured Knowledge source ownership correspondence value is invalid.",
    );
    this.name =
      "InvalidAcceptedStructuredKnowledgeSourceOwnershipCorrespondenceValueError";
  }
}
