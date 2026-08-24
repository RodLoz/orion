import type {
  ContextLineageIdentity,
  ContextRevisionIdentity,
  ContextRevisionNumber,
} from "./context.js";

export const REASONING_QUERY_MAX_CODE_POINTS = 2048;
export const CANDIDATE_CONCLUSION_MAX_CODE_POINTS = 1024;
export const CANDIDATE_RESPONSE_MAX_CODE_POINTS = 2048;
export const REASONING3_SEMANTIC_IDENTIFIER_MAX_CODE_POINTS = 128;
export const REASONING3_TEXTUAL_SCALAR_MAX_CODE_POINTS = 4096;

export type ReasoningQuery = string & {
  readonly __reasoningQuery: unique symbol;
};
export type Reasoning3SemanticIdentifier = string & {
  readonly __reasoning3SemanticIdentifier: unique symbol;
};
export type Reasoning3SubjectKey = Reasoning3SemanticIdentifier & {
  readonly __reasoning3SubjectKey: unique symbol;
};
export type Reasoning3PredicateKey = Reasoning3SemanticIdentifier & {
  readonly __reasoning3PredicateKey: unique symbol;
};
export type Reasoning3TextualScalar = string & {
  readonly __reasoning3TextualScalar: unique symbol;
};
export interface BoundedReasoningQuery {
  readonly kind: "exact-text-attribute-value";
  readonly subjectKey: Reasoning3SubjectKey;
  readonly predicateKey: Reasoning3PredicateKey;
}
export interface Reasoning3StructuredKnowledgeTuple {
  readonly subjectKey: Reasoning3SubjectKey;
  readonly predicateKey: Reasoning3PredicateKey;
  readonly textualScalar: Reasoning3TextualScalar;
}
export type ReasoningApplicability = "APPLICABLE" | "NOT_APPLICABLE";
export type ReasoningSufficiency = "SUFFICIENT" | "INSUFFICIENT";
export type CandidateConclusion = string & {
  readonly __candidateConclusion: unique symbol;
};
export type CandidateResponse = string & {
  readonly __candidateResponse: unique symbol;
};
export type Reasoning3CandidateResponse = string & {
  readonly __reasoning3CandidateResponse: unique symbol;
};
export type CandidateNextAction = "none" | "request-more-context";
export type ReasoningOutcomeCategory =
  | "anonymous-context"
  | "context-only"
  | "knowledge-grounded-success"
  | "knowledge-not-applicable"
  | "knowledge-insufficient";
export type ReasoningRuleCategory =
  | "anonymous-identity"
  | "authenticated-context-only"
  | "authenticated-knowledge-applicable-sufficient"
  | "authenticated-knowledge-not-applicable"
  | "authenticated-knowledge-applicable-insufficient";

export interface ContextConsumptionReference {
  readonly lineageIdentity: ContextLineageIdentity;
  readonly revisionIdentity: ContextRevisionIdentity;
  readonly revisionNumber: ContextRevisionNumber;
  readonly lifecycleState: "active";
  readonly authoritativeCapability: "context";
}

export interface ReasoningExplainabilitySummary {
  readonly contextConsumptionReference: ContextConsumptionReference;
  readonly identityState: "anonymous" | "authenticated";
  readonly ruleCategory: ReasoningRuleCategory;
}

export interface ReasoningOutcome {
  readonly status: "completed";
  readonly category: ReasoningOutcomeCategory;
  readonly conclusion: CandidateConclusion;
  readonly response: CandidateResponse | Reasoning3CandidateResponse;
  readonly nextAction: CandidateNextAction;
  readonly explainability: ReasoningExplainabilitySummary;
}

export function reasoningQuery(value: unknown): ReasoningQuery {
  return boundedText(
    value,
    REASONING_QUERY_MAX_CODE_POINTS,
    new InvalidReasoningQueryValueError(),
  ) as ReasoningQuery;
}

export function reasoning3SemanticIdentifier(
  value: unknown,
): Reasoning3SemanticIdentifier {
  return boundedReasoning3Text(
    value,
    REASONING3_SEMANTIC_IDENTIFIER_MAX_CODE_POINTS,
    new InvalidReasoning3SemanticIdentifierValueError(),
  ) as Reasoning3SemanticIdentifier;
}

export function reasoning3SubjectKey(value: unknown): Reasoning3SubjectKey {
  return reasoning3SemanticIdentifier(value) as Reasoning3SubjectKey;
}

export function reasoning3PredicateKey(value: unknown): Reasoning3PredicateKey {
  return reasoning3SemanticIdentifier(value) as Reasoning3PredicateKey;
}

export function reasoning3TextualScalar(
  value: unknown,
): Reasoning3TextualScalar {
  return boundedReasoning3Text(
    value,
    REASONING3_TEXTUAL_SCALAR_MAX_CODE_POINTS,
    new InvalidReasoning3TextualScalarValueError(),
    false,
  ) as Reasoning3TextualScalar;
}

export function createBoundedReasoningQuery(
  input: unknown,
): BoundedReasoningQuery {
  try {
    const record = exactRecord(input, ["kind", "subjectKey", "predicateKey"]);
    if (record.kind !== "exact-text-attribute-value")
      throw new UnsupportedReasoningQueryKindError();
    return Object.freeze({
      kind: "exact-text-attribute-value" as const,
      subjectKey: reasoning3SubjectKey(record.subjectKey),
      predicateKey: reasoning3PredicateKey(record.predicateKey),
    });
  } catch (error: unknown) {
    if (error instanceof UnsupportedReasoningQueryKindError) throw error;
    throw new InvalidBoundedReasoningQueryValueError();
  }
}

export function createReasoning3StructuredKnowledgeTuple(
  input: unknown,
): Reasoning3StructuredKnowledgeTuple {
  try {
    const record = exactRecord(input, [
      "subjectKey",
      "predicateKey",
      "textualScalar",
    ]);
    return Object.freeze({
      subjectKey: reasoning3SubjectKey(record.subjectKey),
      predicateKey: reasoning3PredicateKey(record.predicateKey),
      textualScalar: reasoning3TextualScalar(record.textualScalar),
    });
  } catch {
    throw new InvalidReasoning3StructuredKnowledgeTupleValueError();
  }
}

export function evaluateReasoningApplicability(
  query: unknown,
  tuple: unknown,
): ReasoningApplicability {
  const boundedQuery = createBoundedReasoningQuery(query);
  const proposition = createReasoning3StructuredKnowledgeTuple(tuple);
  return boundedQuery.subjectKey === proposition.subjectKey &&
    boundedQuery.predicateKey === proposition.predicateKey
    ? "APPLICABLE"
    : "NOT_APPLICABLE";
}

export function reasoningSufficiency(value: unknown): ReasoningSufficiency {
  if (value === "SUFFICIENT" || value === "INSUFFICIENT") return value;
  throw new InvalidReasoningSufficiencyValueError();
}

export function evaluateReasoningSufficiency(
  query: unknown,
  tuple: unknown,
  applicability: ReasoningApplicability,
): ReasoningSufficiency {
  const boundedQuery = createBoundedReasoningQuery(query);
  createReasoning3StructuredKnowledgeTuple(tuple);
  if (applicability !== "APPLICABLE")
    throw new InvalidReasoningSufficiencyInputError();
  if (boundedQuery.kind !== "exact-text-attribute-value")
    throw new UnsupportedReasoningQueryKindError();
  return "SUFFICIENT";
}

export function candidateConclusion(value: unknown): CandidateConclusion {
  return boundedText(
    value,
    CANDIDATE_CONCLUSION_MAX_CODE_POINTS,
    new InvalidCandidateConclusionValueError(),
  ) as CandidateConclusion;
}

export function candidateResponse(value: unknown): CandidateResponse {
  return boundedText(
    value,
    CANDIDATE_RESPONSE_MAX_CODE_POINTS,
    new InvalidCandidateResponseValueError(),
  ) as CandidateResponse;
}

export function reasoning3CandidateResponse(
  value: unknown,
): Reasoning3CandidateResponse {
  return boundedReasoning3Text(
    value,
    REASONING3_TEXTUAL_SCALAR_MAX_CODE_POINTS,
    new InvalidReasoning3CandidateResponseValueError(),
    false,
  ) as Reasoning3CandidateResponse;
}

export function createContextConsumptionReference(
  input: unknown,
): ContextConsumptionReference {
  try {
    const record = exactRecord(input, [
      "lineageIdentity",
      "revisionIdentity",
      "revisionNumber",
      "lifecycleState",
      "authoritativeCapability",
    ]);
    const {
      contextLineageIdentity,
      contextRevisionIdentity,
      contextRevisionNumber,
    } = contextValidators();
    if (
      record.lifecycleState !== "active" ||
      record.authoritativeCapability !== "context"
    )
      throw new Error();
    return Object.freeze({
      lineageIdentity: contextLineageIdentity(record.lineageIdentity),
      revisionIdentity: contextRevisionIdentity(record.revisionIdentity),
      revisionNumber: contextRevisionNumber(record.revisionNumber),
      lifecycleState: "active",
      authoritativeCapability: "context",
    });
  } catch {
    throw new InvalidContextConsumptionReferenceValueError();
  }
}

export function createReasoningExplainabilitySummary(
  input: unknown,
): ReasoningExplainabilitySummary {
  try {
    const record = exactRecord(input, [
      "contextConsumptionReference",
      "identityState",
      "ruleCategory",
    ]);
    if (
      (record.identityState !== "anonymous" &&
        record.identityState !== "authenticated") ||
      !isRuleCategory(record.ruleCategory)
    )
      throw new Error();
    return Object.freeze({
      contextConsumptionReference: createContextConsumptionReference(
        record.contextConsumptionReference,
      ),
      identityState: record.identityState,
      ruleCategory: record.ruleCategory,
    });
  } catch {
    throw new InvalidReasoningExplainabilityValueError();
  }
}

export function createReasoningOutcome(input: unknown): ReasoningOutcome {
  try {
    const record = exactRecord(input, [
      "status",
      "category",
      "conclusion",
      "response",
      "nextAction",
      "explainability",
    ]);
    if (
      record.status !== "completed" ||
      !isOutcomeCategory(record.category) ||
      (record.nextAction !== "none" &&
        record.nextAction !== "request-more-context")
    )
      throw new Error();
    const explainability = createReasoningExplainabilitySummary(
      record.explainability,
    );
    if (
      !isReasoningOutcomeCorrespondence(
        record.category,
        record.nextAction,
        explainability,
      )
    )
      throw new Error();
    return Object.freeze({
      status: "completed",
      category: record.category,
      conclusion: candidateConclusion(record.conclusion),
      response: isReasoning3OutcomeCategory(record.category)
        ? reasoning3CandidateResponse(record.response)
        : candidateResponse(record.response),
      nextAction: record.nextAction,
      explainability,
    });
  } catch {
    throw new InvalidReasoningOutcomeValueError();
  }
}

function boundedText(value: unknown, max: number, error: Error): string {
  if (
    typeof value !== "string" ||
    value.trim().length === 0 ||
    [...value].length > max
  )
    throw error;
  return value;
}
function boundedReasoning3Text(
  value: unknown,
  max: number,
  error: Error,
  requireTrimmed = true,
): string {
  if (
    typeof value !== "string" ||
    value.trim().length === 0 ||
    (requireTrimmed && value.trim() !== value) ||
    [...value].length > max ||
    /\p{Cc}/u.test(value)
  )
    throw error;
  return value;
}
function exactRecord(
  value: unknown,
  fields: readonly string[],
): Record<string, unknown> {
  if (typeof value !== "object" || value === null || Array.isArray(value))
    throw new Error();
  const prototype = Object.getPrototypeOf(value) as unknown;
  if (prototype !== Object.prototype && prototype !== null) throw new Error();
  const record = value as Record<string, unknown>;
  const keys = Object.keys(record);
  if (
    keys.length !== fields.length ||
    !fields.every((field) => keys.includes(field))
  )
    throw new Error();
  return record;
}
function isRuleCategory(value: unknown): value is ReasoningRuleCategory {
  return (
    value === "anonymous-identity" ||
    value === "authenticated-context-only" ||
    value === "authenticated-knowledge-applicable-sufficient" ||
    value === "authenticated-knowledge-not-applicable" ||
    value === "authenticated-knowledge-applicable-insufficient"
  );
}
function isOutcomeCategory(value: unknown): value is ReasoningOutcomeCategory {
  return (
    value === "anonymous-context" ||
    value === "context-only" ||
    value === "knowledge-grounded-success" ||
    value === "knowledge-not-applicable" ||
    value === "knowledge-insufficient"
  );
}
function isReasoning3OutcomeCategory(
  value: unknown,
): value is
  | "knowledge-grounded-success"
  | "knowledge-not-applicable"
  | "knowledge-insufficient" {
  return (
    value === "knowledge-grounded-success" ||
    value === "knowledge-not-applicable" ||
    value === "knowledge-insufficient"
  );
}

function isReasoningOutcomeCorrespondence(
  category: ReasoningOutcomeCategory,
  nextAction: CandidateNextAction,
  explainability: ReasoningExplainabilitySummary,
): boolean {
  if (category === "knowledge-grounded-success")
    return (
      explainability.identityState === "authenticated" &&
      explainability.ruleCategory ===
        "authenticated-knowledge-applicable-sufficient" &&
      nextAction === "none"
    );
  if (category === "knowledge-not-applicable")
    return (
      explainability.identityState === "authenticated" &&
      explainability.ruleCategory ===
        "authenticated-knowledge-not-applicable" &&
      nextAction === "request-more-context"
    );
  if (category === "knowledge-insufficient")
    return (
      explainability.identityState === "authenticated" &&
      explainability.ruleCategory ===
        "authenticated-knowledge-applicable-insufficient" &&
      nextAction === "request-more-context"
    );
  return true;
}

// Keeps the public factory implementation independent while using the canonical Core validators.
import {
  contextLineageIdentity,
  contextRevisionIdentity,
  contextRevisionNumber,
} from "./context.js";
function contextValidators() {
  return {
    contextLineageIdentity,
    contextRevisionIdentity,
    contextRevisionNumber,
  };
}

export class InvalidReasoningQueryValueError extends Error {
  public constructor() {
    super("Reasoning Query is invalid.");
    this.name = "InvalidReasoningQueryValueError";
  }
}
export class InvalidReasoning3SemanticIdentifierValueError extends Error {
  public constructor() {
    super("Reasoning semantic identifier is invalid.");
    this.name = "InvalidReasoning3SemanticIdentifierValueError";
  }
}
export class InvalidBoundedReasoningQueryValueError extends Error {
  public constructor() {
    super("Bounded Reasoning query is invalid.");
    this.name = "InvalidBoundedReasoningQueryValueError";
  }
}
export class UnsupportedReasoningQueryKindError extends Error {
  public constructor() {
    super("Bounded Reasoning query kind is unsupported.");
    this.name = "UnsupportedReasoningQueryKindError";
  }
}
export class InvalidReasoning3TextualScalarValueError extends Error {
  public constructor() {
    super("Reasoning structured textual scalar is invalid.");
    this.name = "InvalidReasoning3TextualScalarValueError";
  }
}
export class InvalidReasoning3StructuredKnowledgeTupleValueError extends Error {
  public constructor() {
    super("Reasoning structured Knowledge tuple is invalid.");
    this.name = "InvalidReasoning3StructuredKnowledgeTupleValueError";
  }
}
export class InvalidReasoningSufficiencyInputError extends Error {
  public constructor() {
    super("Reasoning sufficiency input is invalid.");
    this.name = "InvalidReasoningSufficiencyInputError";
  }
}
export class InvalidReasoningSufficiencyValueError extends Error {
  public constructor() {
    super("Reasoning sufficiency value is invalid.");
    this.name = "InvalidReasoningSufficiencyValueError";
  }
}
export class InvalidReasoning3CandidateResponseValueError extends Error {
  public constructor() {
    super("Reasoning 3 candidate response is invalid.");
    this.name = "InvalidReasoning3CandidateResponseValueError";
  }
}
export class InvalidCandidateConclusionValueError extends Error {
  public constructor() {
    super("Candidate Conclusion is invalid.");
    this.name = "InvalidCandidateConclusionValueError";
  }
}
export class InvalidCandidateResponseValueError extends Error {
  public constructor() {
    super("Candidate Response is invalid.");
    this.name = "InvalidCandidateResponseValueError";
  }
}
export class InvalidContextConsumptionReferenceValueError extends Error {
  public constructor() {
    super("Context Consumption Reference is invalid.");
    this.name = "InvalidContextConsumptionReferenceValueError";
  }
}
export class InvalidReasoningExplainabilityValueError extends Error {
  public constructor() {
    super("Reasoning Explainability is invalid.");
    this.name = "InvalidReasoningExplainabilityValueError";
  }
}
export class InvalidReasoningOutcomeValueError extends Error {
  public constructor() {
    super("Reasoning Outcome is invalid.");
    this.name = "InvalidReasoningOutcomeValueError";
  }
}
