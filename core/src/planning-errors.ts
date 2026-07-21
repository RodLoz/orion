class PlanningContractError extends Error {
  protected constructor(message: string, name: string) {
    super(message);
    this.name = name;
  }
}

export class InvalidPlanningInputError extends PlanningContractError {
  public constructor() {
    super("Planning Request is invalid.", "InvalidPlanningInputError");
  }
}

export class InvalidReasoningOutcomeError extends PlanningContractError {
  public constructor() {
    super(
      "Reasoning Outcome input is invalid.",
      "InvalidReasoningOutcomeError",
    );
  }
}

export class PlanningRuleFailureError extends PlanningContractError {
  public constructor() {
    super("Planning rule evaluation failed.", "PlanningRuleFailureError");
  }
}

export class InvalidPlanningStateError extends PlanningContractError {
  public constructor() {
    super("Planning Engine state is invalid.", "InvalidPlanningStateError");
  }
}
