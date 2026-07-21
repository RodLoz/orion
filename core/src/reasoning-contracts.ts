import type { ReasoningOutcome } from "./reasoning.js";

export interface EvaluateReasoningRequest {
  readonly intent: "evaluate";
  readonly activeContextRevision: unknown;
  readonly query: unknown;
  readonly memoryReferences?: unknown;
  readonly knowledgeReferences?: unknown;
}
export interface EvaluateReasoning {
  evaluateReasoning(request: EvaluateReasoningRequest): ReasoningOutcome;
}

class ReasoningContractError extends Error {
  protected constructor(message: string, name: string) {
    super(message);
    this.name = name;
  }
}
export class InvalidReasoningInputError extends ReasoningContractError {
  public constructor() {
    super("Reasoning Request is invalid.", "InvalidReasoningInputError");
  }
}
export class InvalidActiveContextError extends ReasoningContractError {
  public constructor() {
    super("Active Context input is invalid.", "InvalidActiveContextError");
  }
}
export class InactiveContextError extends ReasoningContractError {
  public constructor() {
    super("Context Revision is not Active.", "InactiveContextError");
  }
}
export class InvalidReasoningQueryError extends ReasoningContractError {
  public constructor() {
    super("Reasoning Query is invalid.", "InvalidReasoningQueryError");
  }
}
export class InvalidMemoryReferenceError extends ReasoningContractError {
  public constructor() {
    super("Memory Reference input is invalid.", "InvalidMemoryReferenceError");
  }
}
export class InvalidKnowledgeReferenceError extends ReasoningContractError {
  public constructor() {
    super(
      "Knowledge Reference input is invalid.",
      "InvalidKnowledgeReferenceError",
    );
  }
}
export class ReasoningRuleFailureError extends ReasoningContractError {
  public constructor() {
    super("Reasoning rule evaluation failed.", "ReasoningRuleFailureError");
  }
}
export class InvalidReasoningStateError extends ReasoningContractError {
  public constructor() {
    super("Reasoning Engine state is invalid.", "InvalidReasoningStateError");
  }
}
