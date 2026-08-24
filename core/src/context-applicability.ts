import {
  knowledgeIdentity,
  knowledgeVersion,
  type KnowledgeIdentity,
  type KnowledgeVersion,
} from "./knowledge.js";
import type {
  KnowledgeCapabilityAttribution,
  KnowledgeProjectionIssuanceCorrespondence,
  UnderlyingSourceAuthorityCorrespondence,
} from "./knowledge-projection.js";
import { createKnowledgeCapabilityAttribution } from "./knowledge-projection.js";
import {
  createAcceptedStructuredKnowledgeSourceOwnershipCorrespondence,
  createStructuredTextualKnowledgeProposition,
  propositionIdentity,
  type AcceptedStructuredKnowledgeSourceOwnershipCorrespondence,
  type PropositionIdentity,
  type StructuredTextualKnowledgeProposition,
} from "./knowledge-structured-proposition.js";

export const CONTEXT_PREPARATION_SCOPE_KEY_MAX_CODE_POINTS = 128;

export type ContextPreparationSubjectKey = string & {
  readonly __contextPreparationSubjectKey: unique symbol;
};
export type ContextPreparationPredicateKey = string & {
  readonly __contextPreparationPredicateKey: unique symbol;
};

export interface ContextPreparationSemanticScope {
  readonly subjectKey: ContextPreparationSubjectKey;
  readonly predicateKey: ContextPreparationPredicateKey;
}

export type ContextualApplicabilityResult = "APPLICABLE" | "NOT_APPLICABLE";

export type ContextualApplicabilityCardinality =
  | Readonly<{ cardinality: "zero"; canIncorporate: false }>
  | Readonly<{ cardinality: "exactly-one"; canIncorporate: true }>
  | Readonly<{ cardinality: "more-than-one"; canIncorporate: false }>;

export interface StructuredKnowledgeContextProjection {
  readonly semanticValue: StructuredTextualKnowledgeProposition;
  readonly propositionIdentity: PropositionIdentity;
  readonly knowledgeIdentity: KnowledgeIdentity;
  readonly knowledgeVersion: KnowledgeVersion;
  readonly sourceOwnershipCorrespondence: AcceptedStructuredKnowledgeSourceOwnershipCorrespondence;
  readonly sourceCurrentnessCorrespondence: ContextSourceCurrentnessCorrespondence;
  readonly attribution: KnowledgeCapabilityAttribution;
  readonly issuance: KnowledgeProjectionIssuanceCorrespondence;
  readonly underlyingSourceAuthority?: UnderlyingSourceAuthorityCorrespondence;
}

export interface StructuredKnowledgeContextFragment {
  readonly kind: "structured-knowledge";
  readonly authoritativeOwner: "knowledge";
  readonly projection: StructuredKnowledgeContextProjection;
}

export type ContextExternalSourceCurrentnessCorrespondence = string & {
  readonly __contextExternalSourceCurrentnessCorrespondence: unique symbol;
};

export type ContextSourceCurrentnessCorrespondence =
  | Readonly<{ currentnessOwner: "knowledge-owned-currentness" }>
  | Readonly<{
      currentnessOwner: "external-source-currentness";
      correspondence: ContextExternalSourceCurrentnessCorrespondence;
    }>;

export function contextPreparationSubjectKey(
  value: unknown,
): ContextPreparationSubjectKey {
  return boundedScopeKey(
    value,
    new InvalidContextPreparationScopeError(),
  ) as ContextPreparationSubjectKey;
}

export function contextPreparationPredicateKey(
  value: unknown,
): ContextPreparationPredicateKey {
  return boundedScopeKey(
    value,
    new InvalidContextPreparationScopeError(),
  ) as ContextPreparationPredicateKey;
}

export function createContextPreparationSemanticScope(
  input: unknown,
): ContextPreparationSemanticScope {
  try {
    if (
      !isPlainRecord(input) ||
      !hasExactFields(input, ["subjectKey", "predicateKey"])
    ) {
      throw new Error();
    }
    return Object.freeze({
      subjectKey: contextPreparationSubjectKey(input.subjectKey),
      predicateKey: contextPreparationPredicateKey(input.predicateKey),
    });
  } catch {
    throw new InvalidContextPreparationScopeError();
  }
}

export function evaluateContextualApplicability(
  candidate: Pick<
    StructuredTextualKnowledgeProposition,
    "subjectKey" | "predicateKey"
  >,
  scope: ContextPreparationSemanticScope,
): ContextualApplicabilityResult {
  return (candidate.subjectKey as string) === (scope.subjectKey as string) &&
    (candidate.predicateKey as string) === (scope.predicateKey as string)
    ? "APPLICABLE"
    : "NOT_APPLICABLE";
}

export function contextualApplicabilityCardinality(
  results: readonly ContextualApplicabilityResult[],
): ContextualApplicabilityCardinality {
  const applicableCount = results.filter(
    (result) => result === "APPLICABLE",
  ).length;
  if (applicableCount === 0) {
    return Object.freeze({ cardinality: "zero", canIncorporate: false });
  }
  if (applicableCount === 1) {
    return Object.freeze({
      cardinality: "exactly-one",
      canIncorporate: true,
    });
  }
  return Object.freeze({
    cardinality: "more-than-one",
    canIncorporate: false,
  });
}

export function createStructuredKnowledgeContextFragment(
  input: unknown,
): StructuredKnowledgeContextFragment {
  try {
    if (
      !isPlainRecord(input) ||
      !hasExactFields(
        input,
        [
          "kind",
          "authoritativeOwner",
          "semanticValue",
          "propositionIdentity",
          "knowledgeIdentity",
          "knowledgeVersion",
          "sourceOwnershipCorrespondence",
          "sourceCurrentnessCorrespondence",
          "attribution",
          "issuance",
        ],
        ["underlyingSourceAuthority"],
      ) ||
      input.kind !== "structured-knowledge" ||
      input.authoritativeOwner !== "knowledge" ||
      !isPlainRecord(input.attribution) ||
      input.attribution.authoritativeCapability !== "knowledge" ||
      !isPlainRecord(input.issuance) ||
      !Object.isFrozen(input.issuance) ||
      !isPlainRecord(input.sourceCurrentnessCorrespondence)
    ) {
      throw new Error();
    }
    const currentness = createContextSourceCurrentnessCorrespondence(
      input.sourceCurrentnessCorrespondence,
    );
    const projection: StructuredKnowledgeContextProjection = {
      semanticValue: createStructuredTextualKnowledgeProposition(
        input.semanticValue,
      ),
      propositionIdentity: propositionIdentity(input.propositionIdentity),
      knowledgeIdentity: knowledgeIdentity(input.knowledgeIdentity),
      knowledgeVersion: knowledgeVersion(input.knowledgeVersion),
      sourceOwnershipCorrespondence:
        createAcceptedStructuredKnowledgeSourceOwnershipCorrespondence(
          input.sourceOwnershipCorrespondence,
        ),
      sourceCurrentnessCorrespondence: currentness,
      attribution: createKnowledgeCapabilityAttribution(input.attribution),
      issuance:
        input.issuance as unknown as KnowledgeProjectionIssuanceCorrespondence,
      ...(Object.hasOwn(input, "underlyingSourceAuthority")
        ? {
            underlyingSourceAuthority: opaqueCorrespondence(
              input.underlyingSourceAuthority,
            ) as UnderlyingSourceAuthorityCorrespondence,
          }
        : {}),
    };
    return Object.freeze({
      kind: "structured-knowledge",
      authoritativeOwner: "knowledge",
      projection: Object.freeze(projection),
    });
  } catch {
    throw new InvalidStructuredKnowledgeContextFragmentError();
  }
}

function createContextSourceCurrentnessCorrespondence(
  input: Record<string, unknown>,
): ContextSourceCurrentnessCorrespondence {
  if (
    hasExactFields(input, ["currentnessOwner"]) &&
    input.currentnessOwner === "knowledge-owned-currentness"
  ) {
    return Object.freeze({ currentnessOwner: "knowledge-owned-currentness" });
  }
  if (
    hasExactFields(input, ["currentnessOwner", "correspondence"]) &&
    input.currentnessOwner === "external-source-currentness" &&
    typeof input.correspondence === "string" &&
    input.correspondence.length > 0
  ) {
    return Object.freeze({
      currentnessOwner: "external-source-currentness",
      correspondence:
        input.correspondence as ContextExternalSourceCurrentnessCorrespondence,
    });
  }
  throw new Error();
}

function opaqueCorrespondence(value: unknown): string {
  if (typeof value !== "string" || value.length === 0) {
    throw new Error();
  }
  return value;
}

function boundedScopeKey(value: unknown, failure: Error): string {
  if (
    typeof value !== "string" ||
    value.length === 0 ||
    value.trim().length === 0 ||
    value.trim() !== value ||
    [...value].length > CONTEXT_PREPARATION_SCOPE_KEY_MAX_CODE_POINTS
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

export class InvalidContextPreparationScopeError extends Error {
  public constructor() {
    super("Context preparation semantic scope is invalid.");
    this.name = "InvalidContextPreparationScopeError";
  }
}

export class InvalidStructuredKnowledgeContextFragmentError extends Error {
  public constructor() {
    super("Structured Knowledge Context fragment is invalid.");
    this.name = "InvalidStructuredKnowledgeContextFragmentError";
  }
}
