import { describe, expect, it } from "vitest";
import {
  BrainAuthorizationResolutionError,
  BrainProtectedInvocationError,
  authorizationActionIdentifier,
  authorizationOperationIdentifier,
  skillCapabilityIdentifier,
  skillIdentifier,
  skillVersion,
} from "@orion/core";
import { fixture, running, skillRequest } from "./brain-engine.test.js";

describe("Brain authorization correspondence", () => {
  it.each([
    [
      "authorization operation",
      (outcome: ReturnType<typeof fixture>["authorizationOutcome"]) =>
        Object.freeze({
          ...outcome,
          authorization: Object.freeze({
            ...outcome.authorization,
            operationId: authorizationOperationIdentifier("operation:other"),
          }),
        }),
    ],
    [
      "security-summary operation",
      (outcome: ReturnType<typeof fixture>["authorizationOutcome"]) =>
        Object.freeze({
          ...outcome,
          securityEvaluationSummary: Object.freeze({
            ...outcome.securityEvaluationSummary,
            operationId: authorizationOperationIdentifier("operation:other"),
          }),
        }),
    ],
    [
      "action",
      (outcome: ReturnType<typeof fixture>["authorizationOutcome"]) =>
        Object.freeze({
          ...outcome,
          authorization: Object.freeze({
            ...outcome.authorization,
            action: authorizationActionIdentifier("skill.other"),
          }),
        }),
    ],
  ])("rejects %s mismatch before protected invocation", (_name, replace) => {
    const value = fixture();
    value.ports.resolveGovernedAuthorizationEvaluation.resolveGovernedAuthorizationEvaluation.mockReturnValue(
      replace(value.authorizationOutcome),
    );
    expect(() =>
      running(value.ports).orchestrateCognitiveRequest(skillRequest()),
    ).toThrow(BrainAuthorizationResolutionError);
    expect(
      value.ports.protectedInvokeSkill.invokeBoundSkill,
    ).not.toHaveBeenCalled();
    expect(value.events.at(-1)).toMatchObject({
      from: "bound",
      to: "rejected",
    });
  });
});

describe("Brain normalized Skill-result correspondence", () => {
  it.each([
    [
      "operation",
      (result: ReturnType<typeof fixture>["normalizedResult"]) =>
        Object.freeze({
          ...result,
          operationId: authorizationOperationIdentifier("operation:other"),
        }),
    ],
    [
      "Skill identifier",
      (result: ReturnType<typeof fixture>["normalizedResult"]) =>
        Object.freeze({ ...result, skillId: skillIdentifier("other-skill") }),
    ],
    [
      "Skill version",
      (result: ReturnType<typeof fixture>["normalizedResult"]) =>
        Object.freeze({ ...result, skillVersion: skillVersion("2.0.0") }),
    ],
    [
      "capability",
      (result: ReturnType<typeof fixture>["normalizedResult"]) =>
        Object.freeze({
          ...result,
          capability: skillCapabilityIdentifier("weather.other"),
        }),
    ],
  ])("rejects %s mismatch before result verification", (_name, replace) => {
    const value = fixture();
    value.ports.protectedInvokeSkill.invokeBoundSkill.mockReturnValue(
      replace(value.normalizedResult),
    );
    expect(() =>
      running(value.ports).orchestrateCognitiveRequest(skillRequest()),
    ).toThrow(BrainProtectedInvocationError);
    expect(
      value.ports.verifyNormalizedSkillExecutionResult.verify,
    ).not.toHaveBeenCalled();
    expect(value.events.at(-1)).toMatchObject({
      from: "invoking",
      to: "rejected",
    });
  });

  it("rejects mutable outputs before verifier invocation", () => {
    const value = fixture();
    value.ports.protectedInvokeSkill.invokeBoundSkill.mockReturnValue(
      Object.freeze({
        ...value.normalizedResult,
        outputs: { forecast: "sunny" },
      }),
    );
    expect(() =>
      running(value.ports).orchestrateCognitiveRequest(skillRequest()),
    ).toThrow(BrainProtectedInvocationError);
    expect(
      value.ports.verifyNormalizedSkillExecutionResult.verify,
    ).not.toHaveBeenCalled();
  });
});
