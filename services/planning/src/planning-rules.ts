import {
  PlanningRuleFailureError,
  type CandidateNextAction,
  type CandidatePlanCategory,
  type PlanningRuleCategory,
} from "@orion/core";

export interface PlanningRuleSelection {
  readonly category: CandidatePlanCategory;
  readonly planningRuleCategory: PlanningRuleCategory;
}

export function selectPlanningRule(
  action: CandidateNextAction,
): PlanningRuleSelection {
  if (action === "request-more-context")
    return Object.freeze({
      category: "request-more-context",
      planningRuleCategory: "reasoning-requested-more-context",
    });
  if (action === "none")
    return Object.freeze({
      category: "respond",
      planningRuleCategory: "reasoning-produced-response",
    });
  throw new PlanningRuleFailureError();
}
