import {
  InvalidPlanningInputError,
  InvalidPlanningStateError,
  InvalidReasoningOutcomeError,
  PlanningRuleFailureError,
  createCandidatePlan,
  createCandidatePlanStep,
  createPlanningExplainabilitySummary,
  createReasoningConsumptionReference,
  createReasoningOutcome,
  type CandidatePlan,
  type CreateCandidatePlan,
  type ReasoningOutcome,
} from "@orion/core";
import { selectPlanningRule } from "./planning-rules.js";

export type PlanningEngineLifecycleState =
  "initialize" | "ready" | "running" | "stopped";

export class PlanningEngine implements CreateCandidatePlan {
  #state: PlanningEngineLifecycleState = "initialize";
  public get engineState(): PlanningEngineLifecycleState {
    return this.#state;
  }
  public initialize(): void {
    if (this.#state !== "initialize") throw new InvalidPlanningStateError();
    this.#state = "ready";
  }
  public start(): void {
    if (this.#state !== "ready") throw new InvalidPlanningStateError();
    this.#state = "running";
  }
  public stop(): void {
    if (this.#state !== "running") throw new InvalidPlanningStateError();
    this.#state = "stopped";
  }

  public createCandidatePlan(request: unknown): CandidatePlan {
    if (this.#state !== "running") throw new InvalidPlanningStateError();
    const source = this.validateRequest(request);
    const outcome = this.validateOutcomeField(source);
    this.validateOutcomeSemantics(outcome);
    return this.evaluateRule(outcome);
  }

  private validateRequest(value: unknown): Record<string, unknown> {
    try {
      if (!plainRecord(value)) throw new Error();
      const keys = Reflect.ownKeys(value);
      if (
        keys.length !== 2 ||
        !keys.includes("intent") ||
        !keys.includes("reasoningOutcome") ||
        keys.some((key) =>
          typeof key !== "string"
            ? true
            : key !== "intent" && key !== "reasoningOutcome",
        )
      )
        throw new Error();
      for (const key of keys) {
        if (Reflect.getOwnPropertyDescriptor(value, key)?.enumerable !== true)
          throw new Error();
      }
      if (Reflect.get(value, "intent") !== "create-candidate-plan")
        throw new Error();
      return value;
    } catch {
      throw new InvalidPlanningInputError();
    }
  }

  private validateOutcomeField(
    source: Record<string, unknown>,
  ): ReasoningOutcome {
    try {
      const captured = Reflect.get(source, "reasoningOutcome");
      return createReasoningOutcome(normalizeOutcomeInput(captured));
    } catch {
      throw new InvalidReasoningOutcomeError();
    }
  }

  private validateOutcomeSemantics(outcome: ReasoningOutcome): void {
    try {
      const expected = correspondence[outcome.category];
      if (
        outcome.conclusion !== expected.conclusion ||
        outcome.response !== expected.response ||
        outcome.nextAction !== expected.nextAction ||
        outcome.explainability.identityState !== expected.identityState ||
        outcome.explainability.ruleCategory !== expected.ruleCategory ||
        !expected.counts(
          outcome.explainability.memoryReferenceCount,
          outcome.explainability.knowledgeReferenceCount,
        )
      )
        throw new Error();
    } catch {
      throw new InvalidReasoningOutcomeError();
    }
  }

  private evaluateRule(outcome: ReasoningOutcome): CandidatePlan {
    try {
      const { category, planningRuleCategory } = selectPlanningRule(
        outcome.nextAction,
      );
      const requestMoreContext = category === "request-more-context";
      const step = createCandidatePlanStep(
        requestMoreContext
          ? { ordinal: 1, kind: "request-more-context" }
          : {
              ordinal: 1,
              kind: "respond",
              candidateResponse: outcome.response,
            },
      );
      const source = createReasoningConsumptionReference({
        reasoningStatus: outcome.status,
        reasoningCategory: outcome.category,
        candidateNextAction: outcome.nextAction,
        identityState: outcome.explainability.identityState,
        memoryReferenceCount: outcome.explainability.memoryReferenceCount,
        knowledgeReferenceCount: outcome.explainability.knowledgeReferenceCount,
        reasoningRuleCategory: outcome.explainability.ruleCategory,
        authoritativeCapability: "reasoning",
      });
      const explainability = createPlanningExplainabilitySummary({
        consumedReasoningCategory: outcome.category,
        consumedCandidateNextAction: outcome.nextAction,
        resultingPlanCategory: category,
        candidateStepCount: 1,
        planningRuleCategory,
      });
      return createCandidatePlan({
        status: "completed",
        category,
        steps: [step],
        source,
        explainability,
      });
    } catch (error: unknown) {
      if (
        error instanceof InvalidPlanningStateError ||
        error instanceof PlanningRuleFailureError
      )
        throw error;
      throw new InvalidPlanningStateError();
    }
  }
}

function plainRecord(value: unknown): value is Record<string, unknown> {
  if (typeof value !== "object" || value === null || Array.isArray(value))
    return false;
  const prototype = Reflect.getPrototypeOf(value);
  return prototype === Object.prototype || prototype === null;
}

function normalizeOutcomeInput(value: unknown): Record<string, unknown> {
  const outcome = exactInputRecord(value, [
    "status",
    "category",
    "conclusion",
    "response",
    "nextAction",
    "explainability",
  ]);
  const explainability = exactInputRecord(outcome.explainability, [
    "contextConsumptionReference",
    "identityState",
    "memoryReferenceCount",
    "knowledgeReferenceCount",
    "ruleCategory",
  ]);
  const contextReference = exactInputRecord(
    explainability.contextConsumptionReference,
    [
      "lineageIdentity",
      "revisionIdentity",
      "revisionNumber",
      "lifecycleState",
      "authoritativeCapability",
    ],
  );
  return {
    status: outcome.status,
    category: outcome.category,
    conclusion: outcome.conclusion,
    response: outcome.response,
    nextAction: outcome.nextAction,
    explainability: {
      contextConsumptionReference: { ...contextReference },
      identityState: explainability.identityState,
      memoryReferenceCount: explainability.memoryReferenceCount,
      knowledgeReferenceCount: explainability.knowledgeReferenceCount,
      ruleCategory: explainability.ruleCategory,
    },
  };
}

function exactInputRecord(
  value: unknown,
  fields: readonly string[],
): Record<string, unknown> {
  if (!plainRecord(value)) throw new Error();
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
  const copy: Record<string, unknown> = {};
  for (const field of fields) copy[field] = Reflect.get(value, field);
  return copy;
}

const correspondence = {
  "anonymous-context": {
    conclusion: "The active context identifies an anonymous actor.",
    response:
      "Additional identity context may be required before further orchestration.",
    nextAction: "request-more-context",
    identityState: "anonymous",
    ruleCategory: "anonymous-identity",
    counts: (memory: number, knowledge: number) =>
      memory >= 0 && knowledge >= 0,
  },
  "knowledge-grounded-context": {
    conclusion:
      "The authenticated context includes accepted Knowledge references.",
    response:
      "Accepted Knowledge context is available for further orchestration.",
    nextAction: "none",
    identityState: "authenticated",
    ruleCategory: "authenticated-with-knowledge",
    counts: (_memory: number, knowledge: number) => knowledge > 0,
  },
  "experience-informed-context": {
    conclusion:
      "The authenticated context includes Memory references but no Knowledge references.",
    response:
      "Only retained experience references are available for further orchestration.",
    nextAction: "none",
    identityState: "authenticated",
    ruleCategory: "authenticated-with-memory-only",
    counts: (memory: number, knowledge: number) =>
      memory > 0 && knowledge === 0,
  },
  "context-only": {
    conclusion:
      "The authenticated context contains no supplied Memory or Knowledge references.",
    response:
      "No Memory or Knowledge references were supplied for further orchestration.",
    nextAction: "request-more-context",
    identityState: "authenticated",
    ruleCategory: "authenticated-context-only",
    counts: (memory: number, knowledge: number) =>
      memory === 0 && knowledge === 0,
  },
} as const;
