import type { CandidatePlan } from "./planning.js";
import type {
  CandidateNextAction,
  ReasoningOutcome,
  ReasoningOutcomeCategory,
  ReasoningRuleCategory,
} from "./reasoning.js";

export {
  InvalidPlanningAuthorityRequestError,
  InvalidPlanningAuthorityStateError,
  InvalidPlanningInputError,
  InvalidPlanningStateError,
  InvalidReasoningOutcomeError,
  PlanningAuthorityVerificationError,
  PlanningRuleFailureError,
} from "./planning-errors.js";

export interface CreateCandidatePlanRequest {
  readonly intent: "create-candidate-plan";
  readonly reasoningOutcome: unknown;
}

export interface CreateCandidatePlan {
  createCandidatePlan(request: CreateCandidatePlanRequest): CandidatePlan;
}

export interface VerifyCandidatePlanAuthorityRequest {
  readonly intent: "verify-candidate-plan-authority";
  readonly candidate: CandidatePlan;
  readonly consumedReasoningOutcome: ReasoningOutcome;
  readonly expectedReasoningStatus: "completed";
  readonly expectedReasoningCategory: ReasoningOutcomeCategory;
  readonly expectedCandidateNextAction: CandidateNextAction;
  readonly expectedIdentityState: "anonymous" | "authenticated";
  readonly expectedReasoningRuleCategory: ReasoningRuleCategory;
}

export interface VerifyCandidatePlanAuthority {
  verifyCandidatePlanAuthority(
    request: VerifyCandidatePlanAuthorityRequest,
  ): CandidatePlan;
}
