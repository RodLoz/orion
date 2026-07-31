class BrainContractError extends Error {
  protected constructor(message: string, name: string) {
    super(message);
    this.name = name;
  }
}

export class InvalidBrainRequestError extends BrainContractError {
  public constructor() {
    super("Brain request is invalid.", "InvalidBrainRequestError");
  }
}

export class InvalidBrainAuthorityError extends BrainContractError {
  public constructor() {
    super(
      "Brain authority configuration is invalid.",
      "InvalidBrainAuthorityError",
    );
  }
}

export class BrainContextResolutionError extends BrainContractError {
  public constructor() {
    super("Brain Context resolution failed.", "BrainContextResolutionError");
  }
}

export class BrainReasoningResolutionError extends BrainContractError {
  public constructor() {
    super(
      "Brain Reasoning resolution failed.",
      "BrainReasoningResolutionError",
    );
  }
}

export class BrainPlanningResolutionError extends BrainContractError {
  public constructor() {
    super("Brain Planning resolution failed.", "BrainPlanningResolutionError");
  }
}

export class InvalidBrainPlanError extends BrainContractError {
  public constructor() {
    super("Brain Plan is invalid.", "InvalidBrainPlanError");
  }
}

export class BrainSkillCoordinationError extends BrainContractError {
  public constructor() {
    super("Brain Skill coordination failed.", "BrainSkillCoordinationError");
  }
}

export class BrainAuthorizationResolutionError extends BrainContractError {
  public constructor() {
    super(
      "Brain authorization resolution failed.",
      "BrainAuthorizationResolutionError",
    );
  }
}

export class BrainProtectedInvocationError extends BrainContractError {
  public constructor() {
    super(
      "Brain protected invocation failed.",
      "BrainProtectedInvocationError",
    );
  }
}

export class InvalidFinalCognitiveResultError extends BrainContractError {
  public constructor() {
    super(
      "Final Cognitive Result is invalid.",
      "InvalidFinalCognitiveResultError",
    );
  }
}

export class InvalidBrainExecutionStateError extends BrainContractError {
  public constructor() {
    super(
      "Brain execution state is invalid.",
      "InvalidBrainExecutionStateError",
    );
  }
}
