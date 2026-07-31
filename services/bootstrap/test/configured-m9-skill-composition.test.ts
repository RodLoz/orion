import type {
  ActiveContextRevision,
  AuthorizationEvaluationOutcome,
  BoundSkillInvocationTarget,
  SkillExecutionContextProjection,
  SkillInvocationRequirementsProjection,
} from "@orion/core";
import { describe, expect, it } from "vitest";
import { SkillEngine } from "@orion/skill";
import { SecurityEngine } from "@orion/security";
import * as bootstrapPackage from "../src/index.js";
import { composeSecurityCapability } from "../src/security/security-composition.js";
import {
  composeConfiguredM9SkillCapability,
  type ConfiguredM9SkillCapabilityComposition,
} from "../src/skill/skill-composition.js";

function activeContext(identity = "m9-bootstrap") {
  return Object.freeze({
    lineageIdentity: `context.lineage.${identity}`,
    revisionIdentity: `context.revision.${identity}`,
    revisionNumber: 1,
    creationMetadata: Object.freeze({
      createdAt: "2026-07-30T00:00:00.000Z",
      sourceCount: 1,
      fragmentCount: 1,
    }),
    lifecycleState: "active",
    fragments: Object.freeze([
      Object.freeze({
        kind: "identity",
        authoritativeOwner: "identity",
        projection: Object.freeze({
          state: "anonymous",
          authoritativeOwner: "identity",
        }),
      }),
    ]),
  }) as unknown as ActiveContextRevision;
}

function compose(identity = "m9-bootstrap") {
  const context = activeContext(identity);
  const security = composeSecurityCapability();
  const skill = composeConfiguredM9SkillCapability(
    (candidate) => candidate === context,
    security.authorizationEvaluation,
  );
  return { context, security, skill };
}

function select(skill: ConfiguredM9SkillCapabilityComposition) {
  const selection = skill.selectSkill.selectSkill({
    intent: "select-skill",
    capability: "diagnostic.invoke",
  });
  if (selection.status !== "selected") throw new Error("Selection failed.");
  return selection;
}

function prepare(
  skill: ConfiguredM9SkillCapabilityComposition,
  context: ActiveContextRevision,
  operationId = "bootstrap-m9-operation",
) {
  const selection = select(skill);
  const target = skill.bindSkillToOperation.bindSkillToOperation({
    intent: "bind-skill-to-operation",
    operationId,
    binding: selection.binding,
  });
  const projection =
    skill.resolveSkillExecutionContext.resolveSkillExecutionContext({
      intent: "resolve-skill-execution-context",
      operationId,
      contextRevision: context,
    });
  const requirements =
    skill.resolveSkillInvocationRequirements.resolveSkillInvocationRequirements(
      {
        intent: "resolve-skill-invocation-requirements",
        target,
      },
    );
  const authorizationEvaluation =
    skill.resolveGovernedAuthorizationEvaluation.resolveGovernedAuthorizationEvaluation(
      {
        intent: "resolve-governed-authorization-evaluation",
        request: {
          intent: "evaluate-authorization-outcome",
          operationId,
          action: target.action,
          resource: target.resource,
        },
      },
    );
  return {
    selection,
    target,
    projection,
    requirements,
    authorizationEvaluation,
  };
}

function invoke(
  skill: ConfiguredM9SkillCapabilityComposition,
  prepared: {
    target: BoundSkillInvocationTarget;
    projection: SkillExecutionContextProjection;
    requirements: SkillInvocationRequirementsProjection;
    authorizationEvaluation: AuthorizationEvaluationOutcome;
  },
) {
  return skill.protectedInvokeSkill.invokeBoundSkill({
    intent: "invoke-bound-skill",
    operationId: prepared.target.operationId,
    target: prepared.target,
    requirements: prepared.requirements,
    inputs: { "diagnostic.input": "complete" },
    context: prepared.projection,
    authorizationEvaluation: prepared.authorizationEvaluation,
  });
}

describe("configured M9 Skill Bootstrap composition", () => {
  it("executes the deterministic standard/no-permission slice and preserves result authority", () => {
    const { context, skill } = compose();
    const prepared = prepare(skill, context);
    const result = invoke(skill, prepared);

    expect(result.status).toBe("succeeded");
    if (result.status !== "succeeded") throw new Error("Invocation failed.");
    expect(result.outputs).toEqual({ "diagnostic.output": "complete" });
    expect(
      skill.verifyNormalizedSkillExecutionResult.verify(result, {
        operationId: prepared.target.operationId,
        skillId: prepared.target.skillId,
        skillVersion: prepared.target.skillVersion,
        capability: prepared.target.capability,
      }),
    ).toBe(true);
  });

  it("uses one Skill runtime for selection, binding, requirements, invocation, and result verification", () => {
    const first = compose("first");
    const second = compose("second");
    const selected = select(first.skill);

    expect(() =>
      second.skill.bindSkillToOperation.bindSkillToOperation({
        intent: "bind-skill-to-operation",
        operationId: "cross-runtime-binding",
        binding: selected.binding,
      }),
    ).toThrow();
    for (const binding of [
      structuredClone(selected.binding),
      { ...selected.binding },
    ]) {
      expect(() =>
        first.skill.bindSkillToOperation.bindSkillToOperation({
          intent: "bind-skill-to-operation",
          operationId: "fabricated-binding",
          binding,
        }),
      ).toThrow();
    }

    const prepared = prepare(first.skill, first.context);
    expect(
      first.skill.resolveSkillInvocationRequirements.resolveSkillInvocationRequirements(
        {
          intent: "resolve-skill-invocation-requirements",
          target: prepared.target,
        },
      ).status,
    ).toBe("available");
    const result = invoke(first.skill, prepared);
    expect(
      first.skill.verifyNormalizedSkillExecutionResult.verify(result, {
        operationId: prepared.target.operationId,
        skillId: prepared.target.skillId,
        skillVersion: prepared.target.skillVersion,
        capability: prepared.target.capability,
      }),
    ).toBe(true);
    expect(
      second.skill.verifyNormalizedSkillExecutionResult.verify(result, {
        operationId: prepared.target.operationId,
        skillId: prepared.target.skillId,
        skillVersion: prepared.target.skillVersion,
        capability: prepared.target.capability,
      }),
    ).toBe(false);
  });

  it("rejects fabricated, cloned, and cross-runtime BoundTargets at M9 consuming boundaries", () => {
    const first = compose("target-first");
    const second = compose("target-second");
    const prepared = prepare(first.skill, first.context);

    for (const target of [
      structuredClone(prepared.target),
      { ...prepared.target },
      prepare(second.skill, second.context, "other-target").target,
    ]) {
      expect(() =>
        first.skill.resolveSkillInvocationRequirements.resolveSkillInvocationRequirements(
          {
            intent: "resolve-skill-invocation-requirements",
            target,
          },
        ),
      ).toThrow();
      expect(() =>
        invoke(first.skill, {
          ...prepared,
          target,
        }),
      ).toThrow();
    }
  });

  it("preserves exact Security Outcome identity and rejects another Security runtime", () => {
    const context = activeContext("security");
    const security = composeSecurityCapability();
    let issued: AuthorizationEvaluationOutcome | undefined;
    const evaluator = {
      evaluateAuthorizationOutcome: (
        request: Parameters<
          typeof security.authorizationEvaluation.evaluateAuthorizationOutcome
        >[0],
      ) => {
        issued =
          security.authorizationEvaluation.evaluateAuthorizationOutcome(
            request,
          );
        return issued;
      },
      verifyAuthorizationEvaluationOutcome:
        security.authorizationEvaluation.verifyAuthorizationEvaluationOutcome.bind(
          security.authorizationEvaluation,
        ),
    };
    const skill = composeConfiguredM9SkillCapability(
      (candidate) => candidate === context,
      evaluator,
    );
    const prepared = prepare(skill, context);
    expect(prepared.authorizationEvaluation).toBe(issued);

    const otherSecurity = composeSecurityCapability();
    const foreign =
      otherSecurity.authorizationEvaluation.evaluateAuthorizationOutcome({
        intent: "evaluate-authorization-outcome",
        operationId: prepared.target.operationId,
        action: prepared.target.action,
        resource: prepared.target.resource,
      });
    expect(() =>
      invoke(skill, {
        ...prepared,
        authorizationEvaluation: foreign,
      }),
    ).toThrow();
  });

  it("captures configured callables once and exposes only frozen Core ports", () => {
    const context = activeContext("capture");
    const security = composeSecurityCapability();
    const evaluator = {
      evaluateAuthorizationOutcome:
        security.authorizationEvaluation.evaluateAuthorizationOutcome.bind(
          security.authorizationEvaluation,
        ),
      verifyAuthorizationEvaluationOutcome:
        security.authorizationEvaluation.verifyAuthorizationEvaluationOutcome.bind(
          security.authorizationEvaluation,
        ),
    };
    const skill = composeConfiguredM9SkillCapability(
      (candidate) => candidate === context,
      evaluator,
    );
    evaluator.evaluateAuthorizationOutcome = () => {
      throw new Error("mutated evaluator");
    };
    evaluator.verifyAuthorizationEvaluationOutcome = () => false;

    expect(() => invoke(skill, prepare(skill, context))).not.toThrow();
    expect(Object.isFrozen(skill)).toBe(true);
    expect(bootstrapPackage.composeConfiguredM9SkillCapability).toBe(
      composeConfiguredM9SkillCapability,
    );
    expect(Reflect.ownKeys(skill)).toEqual([
      "selectSkill",
      "bindSkillToOperation",
      "resolveSkillExecutionContext",
      "resolveSkillInvocationRequirements",
      "resolveGovernedAuthorizationEvaluation",
      "protectedInvokeSkill",
      "verifyNormalizedSkillExecutionResult",
    ]);
    for (const port of Object.values(skill)) {
      expect(Object.isFrozen(port)).toBe(true);
      expect(Object.getPrototypeOf(port)).toBe(Object.prototype);
      expect(port).not.toBeInstanceOf(SkillEngine);
      expect(port).not.toBeInstanceOf(SecurityEngine);
      expect(port).not.toHaveProperty("registry");
      expect(port).not.toHaveProperty("engine");
    }
  });
});
