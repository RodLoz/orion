import { InvalidPlanningStateError } from "./planning-errors.js";
import {
  candidateResponse,
  type CandidateResponse,
  type CandidateNextAction,
  type ReasoningOutcomeCategory,
  type ReasoningRuleCategory,
} from "./reasoning.js";

export type CandidatePlanCategory = "respond" | "request-more-context";
export type PlanningRuleCategory =
  "reasoning-requested-more-context" | "reasoning-produced-response";

export interface RespondCandidatePlanStep {
  readonly ordinal: 1;
  readonly kind: "respond";
  readonly candidateResponse: CandidateResponse;
}
export interface RequestMoreContextCandidatePlanStep {
  readonly ordinal: 1;
  readonly kind: "request-more-context";
}
export type CandidatePlanStep =
  RespondCandidatePlanStep | RequestMoreContextCandidatePlanStep;

export interface ReasoningConsumptionReference {
  readonly reasoningStatus: "completed";
  readonly reasoningCategory: ReasoningOutcomeCategory;
  readonly candidateNextAction: CandidateNextAction;
  readonly identityState: "anonymous" | "authenticated";
  readonly memoryReferenceCount: number;
  readonly knowledgeReferenceCount: number;
  readonly reasoningRuleCategory: ReasoningRuleCategory;
  readonly authoritativeCapability: "reasoning";
}

export interface PlanningExplainabilitySummary {
  readonly consumedReasoningCategory: ReasoningOutcomeCategory;
  readonly consumedCandidateNextAction: CandidateNextAction;
  readonly resultingPlanCategory: CandidatePlanCategory;
  readonly candidateStepCount: 1;
  readonly planningRuleCategory: PlanningRuleCategory;
}

export interface CandidatePlan {
  readonly status: "completed";
  readonly category: CandidatePlanCategory;
  readonly steps: readonly [CandidatePlanStep];
  readonly source: ReasoningConsumptionReference;
  readonly explainability: PlanningExplainabilitySummary;
}

export function createCandidatePlanStep(input: unknown): CandidatePlanStep {
  try {
    if (!plainRecord(input)) throw new Error();
    const kind = Reflect.get(input, "kind");
    if (kind === "respond") {
      exactKeys(input, ["ordinal", "kind", "candidateResponse"]);
      if (Reflect.get(input, "ordinal") !== 1) throw new Error();
      return Object.freeze({
        ordinal: 1,
        kind: "respond",
        candidateResponse: candidateResponse(
          Reflect.get(input, "candidateResponse"),
        ),
      });
    }
    exactKeys(input, ["ordinal", "kind"]);
    if (kind !== "request-more-context" || Reflect.get(input, "ordinal") !== 1)
      throw new Error();
    return Object.freeze({ ordinal: 1, kind: "request-more-context" });
  } catch {
    throw new InvalidPlanningStateError();
  }
}

export function createReasoningConsumptionReference(
  input: unknown,
): ReasoningConsumptionReference {
  try {
    const value = planningRecord(input, [
      "reasoningStatus",
      "reasoningCategory",
      "candidateNextAction",
      "identityState",
      "memoryReferenceCount",
      "knowledgeReferenceCount",
      "reasoningRuleCategory",
      "authoritativeCapability",
    ]);
    if (
      value.reasoningStatus !== "completed" ||
      !outcomeCategory(value.reasoningCategory) ||
      !nextAction(value.candidateNextAction) ||
      !identityState(value.identityState) ||
      !count(value.memoryReferenceCount) ||
      !count(value.knowledgeReferenceCount) ||
      !reasoningRule(value.reasoningRuleCategory) ||
      value.authoritativeCapability !== "reasoning" ||
      !validReasoningCorrespondence({
        reasoningCategory: value.reasoningCategory,
        candidateNextAction: value.candidateNextAction,
        identityState: value.identityState,
        memoryReferenceCount: value.memoryReferenceCount,
        knowledgeReferenceCount: value.knowledgeReferenceCount,
        reasoningRuleCategory: value.reasoningRuleCategory,
      })
    )
      throw new Error();
    return Object.freeze({
      reasoningStatus: "completed",
      reasoningCategory: value.reasoningCategory,
      candidateNextAction: value.candidateNextAction,
      identityState: value.identityState,
      memoryReferenceCount: value.memoryReferenceCount,
      knowledgeReferenceCount: value.knowledgeReferenceCount,
      reasoningRuleCategory: value.reasoningRuleCategory,
      authoritativeCapability: "reasoning",
    });
  } catch {
    throw new InvalidPlanningStateError();
  }
}

export function createPlanningExplainabilitySummary(
  input: unknown,
): PlanningExplainabilitySummary {
  try {
    const value = planningRecord(input, [
      "consumedReasoningCategory",
      "consumedCandidateNextAction",
      "resultingPlanCategory",
      "candidateStepCount",
      "planningRuleCategory",
    ]);
    if (
      !outcomeCategory(value.consumedReasoningCategory) ||
      !nextAction(value.consumedCandidateNextAction) ||
      !planCategory(value.resultingPlanCategory) ||
      value.candidateStepCount !== 1 ||
      !planningRule(value.planningRuleCategory) ||
      !validPlanningCorrespondence(
        value.consumedReasoningCategory,
        value.consumedCandidateNextAction,
        value.resultingPlanCategory,
        value.planningRuleCategory,
      )
    )
      throw new Error();
    return Object.freeze({
      consumedReasoningCategory: value.consumedReasoningCategory,
      consumedCandidateNextAction: value.consumedCandidateNextAction,
      resultingPlanCategory: value.resultingPlanCategory,
      candidateStepCount: 1,
      planningRuleCategory: value.planningRuleCategory,
    });
  } catch {
    throw new InvalidPlanningStateError();
  }
}

export function createCandidatePlan(input: unknown): CandidatePlan {
  try {
    const value = planningRecord(input, [
      "status",
      "category",
      "steps",
      "source",
      "explainability",
    ]);
    if (value.status !== "completed" || !planCategory(value.category))
      throw new Error();
    const steps = exactSteps(value.steps);
    const source = createReasoningConsumptionReference(value.source);
    const explainability = createPlanningExplainabilitySummary(
      value.explainability,
    );
    const step = steps[0];
    if (
      step.kind !== value.category ||
      explainability.resultingPlanCategory !== value.category ||
      explainability.candidateStepCount !== 1 ||
      source.reasoningCategory !== explainability.consumedReasoningCategory ||
      source.candidateNextAction !==
        explainability.consumedCandidateNextAction ||
      source.candidateNextAction !==
        (value.category === "respond" ? "none" : "request-more-context") ||
      explainability.planningRuleCategory !==
        (value.category === "respond"
          ? "reasoning-produced-response"
          : "reasoning-requested-more-context") ||
      !validReasoningCorrespondence(source) ||
      !validPlanningCorrespondence(
        source.reasoningCategory,
        source.candidateNextAction,
        value.category,
        explainability.planningRuleCategory,
      )
    )
      throw new Error();
    return Object.freeze({
      status: "completed",
      category: value.category,
      steps: Object.freeze([step]) as readonly [CandidatePlanStep],
      source,
      explainability,
    });
  } catch {
    throw new InvalidPlanningStateError();
  }
}

function exactSteps(value: unknown): readonly [CandidatePlanStep] {
  if (!Array.isArray(value)) throw new Error();
  const keys = Reflect.ownKeys(value);
  const indexDescriptor = Reflect.getOwnPropertyDescriptor(value, "0");
  if (
    Reflect.get(value, "length") !== 1 ||
    !Object.hasOwn(value, 0) ||
    indexDescriptor?.enumerable !== true
  )
    throw new Error();
  for (const key of keys) {
    if (key === "length") continue;
    if (key === "0") continue;
    const descriptor = Reflect.getOwnPropertyDescriptor(value, key);
    if (
      (typeof key === "string" && /^(0|[1-9]\d*)$/.test(key)) ||
      descriptor?.enumerable === true
    )
      throw new Error();
  }
  return Object.freeze([
    createCandidatePlanStep(Reflect.get(value, "0")),
  ]) as readonly [CandidatePlanStep];
}

function planningRecord(
  value: unknown,
  fields: readonly string[],
): Record<string, unknown> {
  if (!plainRecord(value)) throw new Error();
  exactKeys(value, fields);
  const copy: Record<string, unknown> = {};
  for (const field of fields) copy[field] = Reflect.get(value, field);
  return copy;
}
function plainRecord(value: unknown): value is Record<string, unknown> {
  if (typeof value !== "object" || value === null || Array.isArray(value))
    return false;
  const prototype = Reflect.getPrototypeOf(value);
  return prototype === Object.prototype || prototype === null;
}
function exactKeys(value: object, fields: readonly string[]): void {
  const keys = Reflect.ownKeys(value);
  if (
    keys.length !== fields.length ||
    keys.some((key) => typeof key !== "string" || !fields.includes(key))
  )
    throw new Error();
  for (const field of fields) {
    if (Reflect.getOwnPropertyDescriptor(value, field)?.enumerable !== true)
      throw new Error();
  }
}
function outcomeCategory(value: unknown): value is ReasoningOutcomeCategory {
  return [
    "anonymous-context",
    "knowledge-grounded-context",
    "experience-informed-context",
    "context-only",
  ].includes(value as ReasoningOutcomeCategory);
}
function nextAction(value: unknown): value is CandidateNextAction {
  return value === "none" || value === "request-more-context";
}
function identityState(value: unknown): value is "anonymous" | "authenticated" {
  return value === "anonymous" || value === "authenticated";
}
function count(value: unknown): value is number {
  return (
    Number.isSafeInteger(value) &&
    (value as number) >= 0 &&
    (value as number) <= 20
  );
}
function reasoningRule(value: unknown): value is ReasoningRuleCategory {
  return [
    "anonymous-identity",
    "authenticated-with-knowledge",
    "authenticated-with-memory-only",
    "authenticated-context-only",
  ].includes(value as ReasoningRuleCategory);
}
function planCategory(value: unknown): value is CandidatePlanCategory {
  return value === "respond" || value === "request-more-context";
}
function planningRule(value: unknown): value is PlanningRuleCategory {
  return (
    value === "reasoning-requested-more-context" ||
    value === "reasoning-produced-response"
  );
}

type ReasoningCorrespondence = Readonly<{
  reasoningCategory: unknown;
  candidateNextAction: unknown;
  identityState: unknown;
  memoryReferenceCount: unknown;
  knowledgeReferenceCount: unknown;
  reasoningRuleCategory: unknown;
}>;

function validReasoningCorrespondence(value: ReasoningCorrespondence): boolean {
  switch (value.reasoningCategory) {
    case "anonymous-context":
      return (
        value.candidateNextAction === "request-more-context" &&
        value.identityState === "anonymous" &&
        count(value.memoryReferenceCount) &&
        count(value.knowledgeReferenceCount) &&
        value.reasoningRuleCategory === "anonymous-identity"
      );
    case "knowledge-grounded-context":
      return (
        value.candidateNextAction === "none" &&
        value.identityState === "authenticated" &&
        count(value.memoryReferenceCount) &&
        count(value.knowledgeReferenceCount) &&
        value.knowledgeReferenceCount > 0 &&
        value.reasoningRuleCategory === "authenticated-with-knowledge"
      );
    case "experience-informed-context":
      return (
        value.candidateNextAction === "none" &&
        value.identityState === "authenticated" &&
        count(value.memoryReferenceCount) &&
        value.memoryReferenceCount > 0 &&
        value.knowledgeReferenceCount === 0 &&
        value.reasoningRuleCategory === "authenticated-with-memory-only"
      );
    case "context-only":
      return (
        value.candidateNextAction === "request-more-context" &&
        value.identityState === "authenticated" &&
        value.memoryReferenceCount === 0 &&
        value.knowledgeReferenceCount === 0 &&
        value.reasoningRuleCategory === "authenticated-context-only"
      );
    default:
      return false;
  }
}

function validPlanningCorrespondence(
  reasoningCategory: unknown,
  action: unknown,
  category: unknown,
  rule: unknown,
): boolean {
  if (!outcomeCategory(reasoningCategory)) return false;
  const expectsResponse = action === "none";
  const validReasoningAction = expectsResponse
    ? reasoningCategory === "knowledge-grounded-context" ||
      reasoningCategory === "experience-informed-context"
    : action === "request-more-context" &&
      (reasoningCategory === "anonymous-context" ||
        reasoningCategory === "context-only");
  return (
    validReasoningAction &&
    category === (expectsResponse ? "respond" : "request-more-context") &&
    rule ===
      (expectsResponse
        ? "reasoning-produced-response"
        : "reasoning-requested-more-context")
  );
}
