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
