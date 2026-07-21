import type {
  ContextLineageIdentity,
  ContextRevisionIdentity,
  ContextRevisionNumber,
} from "./context.js";

export const REASONING_QUERY_MAX_CODE_POINTS = 2048;
export const CANDIDATE_CONCLUSION_MAX_CODE_POINTS = 1024;
export const CANDIDATE_RESPONSE_MAX_CODE_POINTS = 2048;
export const REASONING_REFERENCE_MAX_COUNT = 20;

export type ReasoningQuery = string & {
  readonly __reasoningQuery: unique symbol;
};
export type CandidateConclusion = string & {
  readonly __candidateConclusion: unique symbol;
};
export type CandidateResponse = string & {
  readonly __candidateResponse: unique symbol;
};
export type CandidateNextAction = "none" | "request-more-context";
export type ReasoningOutcomeCategory =
  | "anonymous-context"
  | "knowledge-grounded-context"
  | "experience-informed-context"
  | "context-only";
export type ReasoningRuleCategory =
  | "anonymous-identity"
  | "authenticated-with-knowledge"
  | "authenticated-with-memory-only"
  | "authenticated-context-only";

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
  readonly memoryReferenceCount: number;
  readonly knowledgeReferenceCount: number;
  readonly ruleCategory: ReasoningRuleCategory;
}

export interface ReasoningOutcome {
  readonly status: "completed";
  readonly category: ReasoningOutcomeCategory;
  readonly conclusion: CandidateConclusion;
  readonly response: CandidateResponse;
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
      "memoryReferenceCount",
      "knowledgeReferenceCount",
      "ruleCategory",
    ]);
    if (
      (record.identityState !== "anonymous" &&
        record.identityState !== "authenticated") ||
      !validCount(record.memoryReferenceCount) ||
      !validCount(record.knowledgeReferenceCount) ||
      !isRuleCategory(record.ruleCategory)
    )
      throw new Error();
    return Object.freeze({
      contextConsumptionReference: createContextConsumptionReference(
        record.contextConsumptionReference,
      ),
      identityState: record.identityState,
      memoryReferenceCount: record.memoryReferenceCount,
      knowledgeReferenceCount: record.knowledgeReferenceCount,
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
    return Object.freeze({
      status: "completed",
      category: record.category,
      conclusion: candidateConclusion(record.conclusion),
      response: candidateResponse(record.response),
      nextAction: record.nextAction,
      explainability: createReasoningExplainabilitySummary(
        record.explainability,
      ),
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
function validCount(value: unknown): value is number {
  return (
    typeof value === "number" &&
    Number.isInteger(value) &&
    value >= 0 &&
    value <= REASONING_REFERENCE_MAX_COUNT
  );
}
function isRuleCategory(value: unknown): value is ReasoningRuleCategory {
  return (
    value === "anonymous-identity" ||
    value === "authenticated-with-knowledge" ||
    value === "authenticated-with-memory-only" ||
    value === "authenticated-context-only"
  );
}
function isOutcomeCategory(value: unknown): value is ReasoningOutcomeCategory {
  return (
    value === "anonymous-context" ||
    value === "knowledge-grounded-context" ||
    value === "experience-informed-context" ||
    value === "context-only"
  );
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
