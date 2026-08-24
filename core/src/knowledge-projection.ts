import {
  candidateClaim,
  knowledgeIdentity,
  knowledgeVersion,
  type CandidateClaim,
  type KnowledgeIdentity,
  type KnowledgeVersion,
} from "./knowledge.js";
import {
  createStructuredKnowledgeSourceOwnershipProposal,
  createAcceptedStructuredKnowledgeSourceOwnershipCorrespondence,
  createStructuredTextualKnowledgeProposition,
  knowledgeExternalSourceOwnerCorrespondence,
  knowledgeSourceRelationshipCorrespondence,
  propositionIdentity,
  type KnowledgeExternalSourceOwnerCorrespondence,
  type AcceptedStructuredKnowledgeSourceOwnershipCorrespondence,
  type KnowledgeSourceRelationshipCorrespondence,
  type PropositionIdentity,
  type StructuredKnowledgeSourceOwnershipProposal,
  type StructuredTextualKnowledgeProposition,
} from "./knowledge-structured-proposition.js";

export type CandidatePreparationAssociation = string & {
  readonly __candidatePreparationAssociation: unique symbol;
};
export type SourceIssuerVerificationCorrespondence = string & {
  readonly __sourceIssuerVerificationCorrespondence: unique symbol;
};
export interface KnowledgeCapabilityAttribution {
  readonly authoritativeCapability: "knowledge";
}
declare const knowledgeProjectionAuthorityCapture: unique symbol;
export interface KnowledgeProjectionIssuanceCorrespondence {
  readonly [knowledgeProjectionAuthorityCapture]: true;
}
export type UnderlyingSourceAuthorityCorrespondence = string & {
  readonly __underlyingSourceAuthorityCorrespondence: unique symbol;
};

export type SamePropositionDeclaration = "same-proposition";
export type KnowledgeAcceptanceSemanticInput =
  | Readonly<{
      claim: CandidateClaim;
      structuredProposition?: never;
      samePropositionDeclaration?: never;
      sourceOwnershipProposal?: never;
    }>
  | Readonly<{
      claim: CandidateClaim;
      structuredProposition: StructuredTextualKnowledgeProposition;
      samePropositionDeclaration: SamePropositionDeclaration;
      sourceOwnershipProposal: StructuredKnowledgeSourceOwnershipProposal;
    }>;

export interface KnowledgeProjectionTarget {
  readonly knowledgeIdentity: KnowledgeIdentity;
  readonly expectedKnowledgeVersion: KnowledgeVersion;
}

export interface ExternalSourceCurrentnessCorrespondence {
  readonly applicableOwner: KnowledgeExternalSourceOwnerCorrespondence;
  readonly candidatePreparationAssociation: CandidatePreparationAssociation;
  readonly propositionSourceRelationship: KnowledgeSourceRelationshipCorrespondence;
  readonly determination: "current";
  readonly issuerVerification: SourceIssuerVerificationCorrespondence;
}

interface KnowledgeOwnedSourceCurrentnessDeterminationBase {
  readonly currentnessOwner: "knowledge-owned-currentness";
  readonly knowledgeIdentity: KnowledgeIdentity;
  readonly knowledgeVersion: KnowledgeVersion;
  readonly propositionIdentity: PropositionIdentity;
  readonly semanticValue: StructuredTextualKnowledgeProposition;
  readonly candidatePreparationAssociation: CandidatePreparationAssociation;
}

export type KnowledgeOwnedSourceCurrentnessDetermination =
  | Readonly<
      KnowledgeOwnedSourceCurrentnessDeterminationBase & {
        outcome: "positive";
      }
    >
  | Readonly<
      KnowledgeOwnedSourceCurrentnessDeterminationBase & {
        outcome: "negative";
      }
    >
  | Readonly<
      KnowledgeOwnedSourceCurrentnessDeterminationBase & {
        outcome: "unable-to-determine";
      }
    >;

export type PositiveKnowledgeOwnedSourceCurrentnessDetermination = Extract<
  KnowledgeOwnedSourceCurrentnessDetermination,
  Readonly<{ outcome: "positive" }>
>;

export type KnowledgeProjectionPreparationPrerequisites =
  | Readonly<{
      candidatePreparationAssociation: CandidatePreparationAssociation;
      currentnessOwner: "knowledge-owned-currentness";
      externalCurrentnessCorrespondence?: never;
    }>
  | Readonly<{
      candidatePreparationAssociation: CandidatePreparationAssociation;
      currentnessOwner: "external-source-currentness";
      externalCurrentnessCorrespondence: ExternalSourceCurrentnessCorrespondence;
    }>;

export interface KnowledgeProjectionRequest {
  readonly intent: "project-structured-knowledge";
  readonly target: KnowledgeProjectionTarget;
  readonly preparationPrerequisites: KnowledgeProjectionPreparationPrerequisites;
}

interface KnowledgeProjectionCorrespondenceCandidateBase {
  readonly candidatePreparationAssociation: CandidatePreparationAssociation;
  readonly propositionIdentity: PropositionIdentity;
  readonly knowledgeIdentity: KnowledgeIdentity;
  readonly knowledgeVersion: KnowledgeVersion;
  readonly validationState: "accepted";
  readonly attribution: KnowledgeCapabilityAttribution;
  readonly sourceOwnershipCorrespondence: AcceptedStructuredKnowledgeSourceOwnershipCorrespondence;
  readonly underlyingSourceAuthority?: UnderlyingSourceAuthorityCorrespondence;
}

export type KnowledgeProjectionCorrespondenceCandidate =
  | Readonly<
      KnowledgeProjectionCorrespondenceCandidateBase & {
        sourceOwnershipCorrespondence: Extract<
          AcceptedStructuredKnowledgeSourceOwnershipCorrespondence,
          Readonly<{ currentnessOwner: "knowledge-owned-currentness" }>
        >;
        knowledgeOwnedCurrentnessDetermination: PositiveKnowledgeOwnedSourceCurrentnessDetermination;
        externalCurrentnessCorrespondence?: never;
      }
    >
  | Readonly<
      KnowledgeProjectionCorrespondenceCandidateBase & {
        sourceOwnershipCorrespondence: Extract<
          AcceptedStructuredKnowledgeSourceOwnershipCorrespondence,
          Readonly<{ currentnessOwner: "external-source-currentness" }>
        >;
        knowledgeOwnedCurrentnessDetermination?: never;
        externalCurrentnessCorrespondence: ExternalSourceCurrentnessCorrespondence;
      }
    >;

export type KnowledgeProjectionCorrespondence = Readonly<
  KnowledgeProjectionCorrespondenceCandidate & {
    issuance: KnowledgeProjectionIssuanceCorrespondence;
  }
>;

export interface StructuredKnowledgeProjectionCandidate {
  readonly semanticValue: StructuredTextualKnowledgeProposition;
  readonly correspondence: KnowledgeProjectionCorrespondenceCandidate;
}

export interface StructuredKnowledgeProjection {
  readonly semanticValue: StructuredTextualKnowledgeProposition;
  readonly correspondence: KnowledgeProjectionCorrespondence;
}

export interface VerifyStructuredKnowledgeProjectionAuthorityRequest {
  readonly intent: "verify-knowledge-projection-authority";
  readonly candidate: StructuredKnowledgeProjection;
}

export interface CaptureStructuredKnowledgeProjectionAuthorityRequest {
  readonly intent: "capture-knowledge-projection-authority";
  readonly candidate: StructuredKnowledgeProjectionCandidate;
}

export function candidatePreparationAssociation(
  value: unknown,
): CandidatePreparationAssociation {
  return opaqueCorrelationValue(
    value,
    new InvalidCandidatePreparationAssociationValueError(),
  ) as CandidatePreparationAssociation;
}

export function sourceIssuerVerificationCorrespondence(
  value: unknown,
): SourceIssuerVerificationCorrespondence {
  return opaqueCorrelationValue(
    value,
    new InvalidExternalSourceCurrentnessCorrespondenceValueError(),
  ) as SourceIssuerVerificationCorrespondence;
}

export function createKnowledgeCapabilityAttribution(
  input: unknown,
): KnowledgeCapabilityAttribution {
  if (
    !isPlainRecord(input) ||
    !hasExactFields(input, ["authoritativeCapability"]) ||
    input.authoritativeCapability !== "knowledge"
  ) {
    throw new InvalidKnowledgeCapabilityAttributionValueError();
  }
  return Object.freeze({ authoritativeCapability: "knowledge" });
}

export function underlyingSourceAuthorityCorrespondence(
  value: unknown,
): UnderlyingSourceAuthorityCorrespondence {
  return opaqueCorrelationValue(
    value,
    new InvalidKnowledgeProjectionValueError(),
  ) as UnderlyingSourceAuthorityCorrespondence;
}

export function createKnowledgeAcceptanceSemanticInput(
  input: unknown,
): KnowledgeAcceptanceSemanticInput {
  try {
    if (!isPlainRecord(input) || !Object.hasOwn(input, "claim")) {
      throw new Error();
    }
    const claim = candidateClaim(input.claim);
    const hasProposition = Object.hasOwn(input, "structuredProposition");
    const hasDeclaration = Object.hasOwn(input, "samePropositionDeclaration");
    const hasSourceOwnershipProposal = Object.hasOwn(
      input,
      "sourceOwnershipProposal",
    );
    if (
      !hasProposition &&
      !hasDeclaration &&
      !hasSourceOwnershipProposal &&
      hasExactFields(input, ["claim"])
    ) {
      return Object.freeze({ claim });
    }
    if (
      !hasProposition ||
      !hasDeclaration ||
      !hasSourceOwnershipProposal ||
      !hasExactFields(input, [
        "claim",
        "structuredProposition",
        "samePropositionDeclaration",
        "sourceOwnershipProposal",
      ]) ||
      input.samePropositionDeclaration !== "same-proposition"
    ) {
      throw new Error();
    }
    return Object.freeze({
      claim,
      structuredProposition: createStructuredTextualKnowledgeProposition(
        input.structuredProposition,
      ),
      samePropositionDeclaration: "same-proposition" as const,
      sourceOwnershipProposal: createStructuredKnowledgeSourceOwnershipProposal(
        input.sourceOwnershipProposal,
      ),
    });
  } catch {
    throw new InvalidKnowledgeAcceptanceSemanticInputValueError();
  }
}

export function createKnowledgeProjectionTarget(
  input: unknown,
): KnowledgeProjectionTarget {
  try {
    if (
      !isPlainRecord(input) ||
      !hasExactFields(input, ["knowledgeIdentity", "expectedKnowledgeVersion"])
    ) {
      throw new Error();
    }
    return Object.freeze({
      knowledgeIdentity: knowledgeIdentity(input.knowledgeIdentity),
      expectedKnowledgeVersion: knowledgeVersion(
        input.expectedKnowledgeVersion,
      ),
    });
  } catch {
    throw new InvalidKnowledgeProjectionTargetValueError();
  }
}

export function createExternalSourceCurrentnessCorrespondence(
  input: unknown,
): ExternalSourceCurrentnessCorrespondence {
  try {
    if (
      !isPlainRecord(input) ||
      !hasExactFields(input, [
        "applicableOwner",
        "candidatePreparationAssociation",
        "propositionSourceRelationship",
        "determination",
        "issuerVerification",
      ]) ||
      input.determination !== "current"
    ) {
      throw new Error();
    }
    return Object.freeze({
      applicableOwner: knowledgeExternalSourceOwnerCorrespondence(
        input.applicableOwner,
      ),
      candidatePreparationAssociation: candidatePreparationAssociation(
        input.candidatePreparationAssociation,
      ),
      propositionSourceRelationship: knowledgeSourceRelationshipCorrespondence(
        input.propositionSourceRelationship,
      ),
      determination: "current",
      issuerVerification: sourceIssuerVerificationCorrespondence(
        input.issuerVerification,
      ),
    });
  } catch {
    throw new InvalidExternalSourceCurrentnessCorrespondenceValueError();
  }
}

export function createKnowledgeOwnedSourceCurrentnessDetermination(
  input: unknown,
): KnowledgeOwnedSourceCurrentnessDetermination {
  try {
    if (
      !isPlainRecord(input) ||
      !hasExactFields(input, [
        "currentnessOwner",
        "outcome",
        "knowledgeIdentity",
        "knowledgeVersion",
        "propositionIdentity",
        "semanticValue",
        "candidatePreparationAssociation",
      ]) ||
      input.currentnessOwner !== "knowledge-owned-currentness" ||
      (input.outcome !== "positive" &&
        input.outcome !== "negative" &&
        input.outcome !== "unable-to-determine")
    ) {
      throw new Error();
    }
    return Object.freeze({
      currentnessOwner: "knowledge-owned-currentness",
      outcome: input.outcome,
      knowledgeIdentity: knowledgeIdentity(input.knowledgeIdentity),
      knowledgeVersion: knowledgeVersion(input.knowledgeVersion),
      propositionIdentity: propositionIdentity(input.propositionIdentity),
      semanticValue: createStructuredTextualKnowledgeProposition(
        input.semanticValue,
      ),
      candidatePreparationAssociation: candidatePreparationAssociation(
        input.candidatePreparationAssociation,
      ),
    });
  } catch {
    throw new InvalidKnowledgeOwnedSourceCurrentnessDeterminationValueError();
  }
}

export function createKnowledgeProjectionPreparationPrerequisites(
  input: unknown,
): KnowledgeProjectionPreparationPrerequisites {
  try {
    if (!isPlainRecord(input)) throw new Error();
    const association = candidatePreparationAssociation(
      input.candidatePreparationAssociation,
    );
    if (
      input.currentnessOwner === "knowledge-owned-currentness" &&
      hasExactFields(input, [
        "candidatePreparationAssociation",
        "currentnessOwner",
      ])
    ) {
      return Object.freeze({
        candidatePreparationAssociation: association,
        currentnessOwner: "knowledge-owned-currentness",
      });
    }
    if (
      input.currentnessOwner === "external-source-currentness" &&
      hasExactFields(input, [
        "candidatePreparationAssociation",
        "currentnessOwner",
        "externalCurrentnessCorrespondence",
      ])
    ) {
      const correspondence = createExternalSourceCurrentnessCorrespondence(
        input.externalCurrentnessCorrespondence,
      );
      if (correspondence.candidatePreparationAssociation !== association) {
        throw new KnowledgeProjectionPreparationMismatchValueError();
      }
      return Object.freeze({
        candidatePreparationAssociation: association,
        currentnessOwner: "external-source-currentness",
        externalCurrentnessCorrespondence: correspondence,
      });
    }
    throw new Error();
  } catch (error) {
    if (error instanceof KnowledgeProjectionPreparationMismatchValueError) {
      throw error;
    }
    throw new InvalidKnowledgeProjectionPreparationPrerequisitesValueError();
  }
}

export function createKnowledgeProjectionRequest(
  input: unknown,
): KnowledgeProjectionRequest {
  try {
    if (
      !isPlainRecord(input) ||
      !hasExactFields(input, [
        "intent",
        "target",
        "preparationPrerequisites",
      ]) ||
      input.intent !== "project-structured-knowledge"
    ) {
      throw new Error();
    }
    return Object.freeze({
      intent: "project-structured-knowledge",
      target: createKnowledgeProjectionTarget(input.target),
      preparationPrerequisites:
        createKnowledgeProjectionPreparationPrerequisites(
          input.preparationPrerequisites,
        ),
    });
  } catch {
    throw new InvalidKnowledgeProjectionRequestValueError();
  }
}

export function createStructuredKnowledgeProjectionCandidate(
  input: unknown,
): StructuredKnowledgeProjectionCandidate {
  try {
    if (
      !isPlainRecord(input) ||
      !hasExactFields(input, ["semanticValue", "correspondence"]) ||
      !isPlainRecord(input.correspondence)
    ) {
      throw new Error();
    }
    const semanticValue = createStructuredTextualKnowledgeProposition(
      input.semanticValue,
    );
    const correspondence = reconstructProjectionCorrespondenceCandidate(
      input.correspondence,
    );
    if (
      "knowledgeOwnedCurrentnessDetermination" in correspondence &&
      !sameStructuredProposition(
        semanticValue,
        correspondence.knowledgeOwnedCurrentnessDetermination.semanticValue,
      )
    ) {
      throw new Error();
    }
    return Object.freeze({
      semanticValue,
      correspondence,
    });
  } catch {
    throw new InvalidKnowledgeProjectionValueError();
  }
}

function reconstructProjectionCorrespondenceCandidate(
  input: Record<string, unknown>,
): KnowledgeProjectionCorrespondenceCandidate {
  const required = [
    "candidatePreparationAssociation",
    "propositionIdentity",
    "knowledgeIdentity",
    "knowledgeVersion",
    "validationState",
    "attribution",
    "sourceOwnershipCorrespondence",
  ];
  const optional = [
    "underlyingSourceAuthority",
    "knowledgeOwnedCurrentnessDetermination",
    "externalCurrentnessCorrespondence",
  ];
  if (
    !hasExactFields(input, required, optional) ||
    input.validationState !== "accepted"
  ) {
    throw new Error();
  }
  const base = {
    candidatePreparationAssociation: candidatePreparationAssociation(
      input.candidatePreparationAssociation,
    ),
    propositionIdentity: propositionIdentity(input.propositionIdentity),
    knowledgeIdentity: knowledgeIdentity(input.knowledgeIdentity),
    knowledgeVersion: knowledgeVersion(input.knowledgeVersion),
    validationState: "accepted" as const,
    attribution: createKnowledgeCapabilityAttribution(input.attribution),
    ...(Object.hasOwn(input, "underlyingSourceAuthority")
      ? {
          underlyingSourceAuthority: underlyingSourceAuthorityCorrespondence(
            input.underlyingSourceAuthority,
          ),
        }
      : {}),
  };
  const sourceOwnership =
    createAcceptedStructuredKnowledgeSourceOwnershipCorrespondence(
      input.sourceOwnershipCorrespondence,
    );
  if (sourceOwnership.currentnessOwner === "knowledge-owned-currentness") {
    if (
      !Object.hasOwn(input, "knowledgeOwnedCurrentnessDetermination") ||
      Object.hasOwn(input, "externalCurrentnessCorrespondence")
    ) {
      throw new Error();
    }
    const determination = createKnowledgeOwnedSourceCurrentnessDetermination(
      input.knowledgeOwnedCurrentnessDetermination,
    );
    if (
      determination.outcome !== "positive" ||
      determination.candidatePreparationAssociation !==
        base.candidatePreparationAssociation ||
      determination.knowledgeIdentity !== base.knowledgeIdentity ||
      determination.knowledgeVersion !== base.knowledgeVersion ||
      determination.propositionIdentity !== base.propositionIdentity
    ) {
      throw new Error();
    }
    return Object.freeze({
      ...base,
      sourceOwnershipCorrespondence: sourceOwnership,
      knowledgeOwnedCurrentnessDetermination: determination,
    });
  }
  if (
    sourceOwnership.currentnessOwner === "external-source-currentness" &&
    Object.hasOwn(input, "externalCurrentnessCorrespondence") &&
    !Object.hasOwn(input, "knowledgeOwnedCurrentnessDetermination")
  ) {
    const external = createExternalSourceCurrentnessCorrespondence(
      input.externalCurrentnessCorrespondence,
    );
    if (
      external.candidatePreparationAssociation !==
        base.candidatePreparationAssociation ||
      external.applicableOwner !== sourceOwnership.applicableOwner ||
      external.propositionSourceRelationship !==
        sourceOwnership.propositionSourceRelationship
    ) {
      throw new Error();
    }
    return Object.freeze({
      ...base,
      sourceOwnershipCorrespondence: sourceOwnership,
      externalCurrentnessCorrespondence: external,
    });
  }
  throw new Error();
}

function opaqueCorrelationValue(value: unknown, failure: Error): string {
  if (typeof value !== "string" || value.length === 0) throw failure;
  return value;
}

function sameStructuredProposition(
  left: StructuredTextualKnowledgeProposition,
  right: StructuredTextualKnowledgeProposition,
): boolean {
  return (
    left.subjectKey === right.subjectKey &&
    left.predicateKey === right.predicateKey &&
    left.textualScalar === right.textualScalar
  );
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

export class InvalidCandidatePreparationAssociationValueError extends Error {
  public constructor() {
    super("Candidate-Preparation Association value is invalid.");
    this.name = "InvalidCandidatePreparationAssociationValueError";
  }
}
export class InvalidKnowledgeAcceptanceSemanticInputValueError extends Error {
  public constructor() {
    super("Knowledge acceptance semantic input is invalid.");
    this.name = "InvalidKnowledgeAcceptanceSemanticInputValueError";
  }
}
export class InvalidKnowledgeProjectionTargetValueError extends Error {
  public constructor() {
    super("Knowledge projection target value is invalid.");
    this.name = "InvalidKnowledgeProjectionTargetValueError";
  }
}
export class InvalidExternalSourceCurrentnessCorrespondenceValueError extends Error {
  public constructor() {
    super("External Source Currentness correspondence value is invalid.");
    this.name = "InvalidExternalSourceCurrentnessCorrespondenceValueError";
  }
}
export class InvalidKnowledgeOwnedSourceCurrentnessDeterminationValueError extends Error {
  public constructor() {
    super("Knowledge-owned Source Currentness determination is invalid.");
    this.name = "InvalidKnowledgeOwnedSourceCurrentnessDeterminationValueError";
  }
}
export class InvalidKnowledgeCapabilityAttributionValueError extends Error {
  public constructor() {
    super("Knowledge capability attribution is invalid.");
    this.name = "InvalidKnowledgeCapabilityAttributionValueError";
  }
}
export class InvalidKnowledgeProjectionPreparationPrerequisitesValueError extends Error {
  public constructor() {
    super("Knowledge projection preparation prerequisites are invalid.");
    this.name = "InvalidKnowledgeProjectionPreparationPrerequisitesValueError";
  }
}
export class KnowledgeProjectionPreparationMismatchValueError extends Error {
  public constructor() {
    super("Knowledge projection preparation association does not match.");
    this.name = "KnowledgeProjectionPreparationMismatchValueError";
  }
}
export class InvalidKnowledgeProjectionRequestValueError extends Error {
  public constructor() {
    super("Knowledge projection request value is invalid.");
    this.name = "InvalidKnowledgeProjectionRequestValueError";
  }
}
export class InvalidKnowledgeProjectionValueError extends Error {
  public constructor() {
    super("Structured Knowledge projection value is invalid.");
    this.name = "InvalidKnowledgeProjectionValueError";
  }
}
