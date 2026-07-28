class SecurityContractError extends Error {
  protected constructor(message: string, name: string) {
    super(message);
    this.name = name;
  }
}

export class InvalidAuthorizationInputError extends SecurityContractError {
  public constructor() {
    super(
      "Authorization request is invalid.",
      "InvalidAuthorizationInputError",
    );
  }
}

export class InvalidAuthorizationEvidenceError extends SecurityContractError {
  public constructor() {
    super(
      "Authorization evidence is invalid.",
      "InvalidAuthorizationEvidenceError",
    );
  }
}

export class InvalidSecurityStateError extends SecurityContractError {
  public constructor() {
    super("Security Engine state is invalid.", "InvalidSecurityStateError");
  }
}
