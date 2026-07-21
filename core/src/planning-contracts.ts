import type { CandidatePlan } from "./planning.js";

export {
  InvalidPlanningInputError,
  InvalidPlanningStateError,
  InvalidReasoningOutcomeError,
  PlanningRuleFailureError,
} from "./planning-errors.js";

export interface CreateCandidatePlanRequest {
  readonly intent: "create-candidate-plan";
  readonly reasoningOutcome: unknown;
}

export interface CreateCandidatePlan {
  createCandidatePlan(request: CreateCandidatePlanRequest): CandidatePlan;
}
