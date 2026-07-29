import { describe, expect, it } from "vitest";
import {
  DuplicateSkillWorkflowAdmissionError,
  InvalidBoundSkillTargetInputError,
  InvalidGovernedAuthorizationEvaluationError,
  InvalidProtectedSkillInvocationInputError,
  InvalidSkillAuthorityError,
  InvalidSkillContextAuthorityError,
  InvalidSkillExecutionStateError,
  InvalidSkillSelectionAuthorityError,
  InvalidSkillSelectionInputError,
  InvalidSkillValidationResultError,
  InvalidSkillWorkflowAdmissionError,
  InvalidSkillWorkflowResultError,
  SkillAuthorizationEnforcementError,
  SkillInputValidationError,
  SkillValidatorBoundaryError,
  SkillWorkflowExecutionError,
} from "../src/index.js";

describe("M9 closed public failure taxonomy", () => {
  it.each([
    [InvalidSkillSelectionInputError, "Invalid Skill selection input."],
    [InvalidSkillSelectionAuthorityError, "Invalid Skill selection authority."],
    [InvalidSkillWorkflowAdmissionError, "Invalid Skill workflow admission."],
    [
      DuplicateSkillWorkflowAdmissionError,
      "Duplicate Skill workflow admission.",
    ],
    [InvalidBoundSkillTargetInputError, "Invalid bound Skill target input."],
    [
      InvalidProtectedSkillInvocationInputError,
      "Invalid protected Skill invocation input.",
    ],
    [InvalidSkillAuthorityError, "Invalid Skill authority."],
    [InvalidSkillContextAuthorityError, "Invalid Skill Context authority."],
    [
      InvalidGovernedAuthorizationEvaluationError,
      "Invalid governed authorization evaluation.",
    ],
    [
      SkillAuthorizationEnforcementError,
      "Skill authorization enforcement failed.",
    ],
    [SkillInputValidationError, "Skill input validation failed."],
    [SkillValidatorBoundaryError, "Skill validator boundary failed."],
    [InvalidSkillValidationResultError, "Invalid Skill validation result."],
    [SkillWorkflowExecutionError, "Skill workflow execution failed."],
    [InvalidSkillWorkflowResultError, "Invalid Skill workflow result."],
    [InvalidSkillExecutionStateError, "Invalid Skill execution state."],
  ])("exports %s with its exact privacy-safe message", (Failure, message) => {
    const error = new Failure();
    expect(error.name).toBe(Failure.name);
    expect(error.message).toBe(message);
  });
});
