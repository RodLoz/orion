class SkillContractError extends Error {
  protected constructor(message: string, name: string) {
    super(message);
    this.name = name;
  }
}

export class InvalidSkillInputError extends SkillContractError {
  public constructor() {
    super("Skill request is invalid.", "InvalidSkillInputError");
  }
}

export class InvalidSkillManifestError extends SkillContractError {
  public constructor() {
    super("Skill Manifest is invalid.", "InvalidSkillManifestError");
  }
}

export class DuplicateSkillIdentifierError extends SkillContractError {
  public constructor() {
    super(
      "Skill Identifier is already registered.",
      "DuplicateSkillIdentifierError",
    );
  }
}

export class SkillNotFoundError extends SkillContractError {
  public constructor() {
    super("Registered Skill was not found.", "SkillNotFoundError");
  }
}

export class InvalidSkillStateError extends SkillContractError {
  public constructor() {
    super("Skill Engine state is invalid.", "InvalidSkillStateError");
  }
}

export class InvalidSkillSelectionInputError extends SkillContractError {
  public constructor() {
    super("Invalid Skill selection input.", "InvalidSkillSelectionInputError");
  }
}

export class InvalidSkillSelectionAuthorityError extends SkillContractError {
  public constructor() {
    super(
      "Invalid Skill selection authority.",
      "InvalidSkillSelectionAuthorityError",
    );
  }
}

export class InvalidSkillWorkflowAdmissionError extends SkillContractError {
  public constructor() {
    super(
      "Invalid Skill workflow admission.",
      "InvalidSkillWorkflowAdmissionError",
    );
  }
}

export class DuplicateSkillWorkflowAdmissionError extends SkillContractError {
  public constructor() {
    super(
      "Duplicate Skill workflow admission.",
      "DuplicateSkillWorkflowAdmissionError",
    );
  }
}

export class InvalidBoundSkillTargetInputError extends SkillContractError {
  public constructor() {
    super(
      "Invalid bound Skill target input.",
      "InvalidBoundSkillTargetInputError",
    );
  }
}

export class InvalidProtectedSkillInvocationInputError extends SkillContractError {
  public constructor() {
    super(
      "Invalid protected Skill invocation input.",
      "InvalidProtectedSkillInvocationInputError",
    );
  }
}

export class InvalidSkillAuthorityError extends SkillContractError {
  public constructor() {
    super("Invalid Skill authority.", "InvalidSkillAuthorityError");
  }
}

export class InvalidSkillContextAuthorityError extends SkillContractError {
  public constructor() {
    super(
      "Invalid Skill Context authority.",
      "InvalidSkillContextAuthorityError",
    );
  }
}

export class InvalidGovernedAuthorizationEvaluationError extends SkillContractError {
  public constructor() {
    super(
      "Invalid governed authorization evaluation.",
      "InvalidGovernedAuthorizationEvaluationError",
    );
  }
}

export class SkillAuthorizationEnforcementError extends SkillContractError {
  public constructor() {
    super(
      "Skill authorization enforcement failed.",
      "SkillAuthorizationEnforcementError",
    );
  }
}

export class SkillInputValidationError extends SkillContractError {
  public constructor() {
    super("Skill input validation failed.", "SkillInputValidationError");
  }
}

export class SkillValidatorBoundaryError extends SkillContractError {
  public constructor() {
    super("Skill validator boundary failed.", "SkillValidatorBoundaryError");
  }
}

export class InvalidSkillValidationResultError extends SkillContractError {
  public constructor() {
    super(
      "Invalid Skill validation result.",
      "InvalidSkillValidationResultError",
    );
  }
}

export class SkillWorkflowExecutionError extends SkillContractError {
  public constructor() {
    super("Skill workflow execution failed.", "SkillWorkflowExecutionError");
  }
}

export class InvalidSkillWorkflowResultError extends SkillContractError {
  public constructor() {
    super("Invalid Skill workflow result.", "InvalidSkillWorkflowResultError");
  }
}

export class InvalidSkillExecutionStateError extends SkillContractError {
  public constructor() {
    super("Invalid Skill execution state.", "InvalidSkillExecutionStateError");
  }
}
