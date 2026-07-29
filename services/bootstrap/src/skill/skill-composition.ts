import type {
  ActiveContextRevision,
  DiscoverSkills,
  EvaluateAuthorizationOutcome,
  GetRegisteredSkill,
  NormalizedSkillExecutionResult,
  RegisterSkillManifest,
  SkillInvocationLifecycleEvent,
  SkillWorkflowInput,
  VerifyAuthorizationEvaluationOutcome,
} from "@orion/core";
import { SkillEngine, type SkillEngineLifecycleState } from "@orion/skill";
import { ProcessLocalSkillExecutionContextAuthority } from "@orion/context";
import {
  ProcessLocalSkillInvocationRequirementsAuthority,
  ProcessLocalSkillInvocationSensitivityAuthority,
} from "@orion/security";
import { ProcessLocalGovernedAuthorizationEvaluationAuthority } from "./governed-authorization-authority.js";

export interface SkillCapabilityComposition {
  readonly registerSkillManifest: RegisterSkillManifest;
  readonly getRegisteredSkill: GetRegisteredSkill;
  readonly discoverSkills: DiscoverSkills;
  readonly engineState: () => SkillEngineLifecycleState;
}

export interface M9SkillDemonstration {
  readonly result: NormalizedSkillExecutionResult;
  readonly lifecycleTransitionCount: number;
  readonly resultAuthorityVerified: boolean;
}

export function demonstrateM9SkillInvocation(
  contextRevision: ActiveContextRevision,
  verifyContextRevision: (candidate: unknown) => boolean,
  evaluator: EvaluateAuthorizationOutcome &
    VerifyAuthorizationEvaluationOutcome,
): M9SkillDemonstration {
  const context = new ProcessLocalSkillExecutionContextAuthority(
    verifyContextRevision,
  );
  const sensitivity = new ProcessLocalSkillInvocationSensitivityAuthority([
    {
      action: "skill.invoke",
      resourceId: "skill:diagnostic-invocation-skill",
      sensitivity: "standard",
    },
  ]);
  const runtime: { engine?: SkillEngine } = {};
  const requirements = new ProcessLocalSkillInvocationRequirementsAuthority(
    sensitivity,
    (candidate) =>
      runtime.engine?.verifyBoundSkillInvocationTarget(candidate) === true,
  );
  const authorization =
    new ProcessLocalGovernedAuthorizationEvaluationAuthority(
      evaluator,
      evaluator,
    );
  const contextPort = Object.freeze({
    resolve: (request: Parameters<typeof context.resolve>[0]) =>
      context.resolve(request),
    verify: (
      candidate: Parameters<typeof context.verify>[0],
      expected: Parameters<typeof context.verify>[1],
    ) => context.verify(candidate, expected),
  });
  const sensitivityPort = Object.freeze({
    resolve: (request: Parameters<typeof sensitivity.resolve>[0]) =>
      sensitivity.resolve(request),
    verify: (
      candidate: Parameters<typeof sensitivity.verify>[0],
      expected: Parameters<typeof sensitivity.verify>[1],
    ) => sensitivity.verify(candidate, expected),
  });
  const requirementsPort = Object.freeze({
    resolve: (request: Parameters<typeof requirements.resolve>[0]) =>
      requirements.resolve(request),
    verify: (
      candidate: Parameters<typeof requirements.verify>[0],
      expected: Parameters<typeof requirements.verify>[1],
    ) => requirements.verify(candidate, expected),
  });
  const authorizationPort = Object.freeze({
    resolve: (request: Parameters<typeof authorization.resolve>[0]) =>
      authorization.resolve(request),
    verifyAuthorizationEvaluationOutcome: (
      request: Parameters<
        typeof authorization.verifyAuthorizationEvaluationOutcome
      >[0],
    ) => authorization.verifyAuthorizationEvaluationOutcome(request),
  });
  const events: SkillInvocationLifecycleEvent[] = [];
  const engine = new SkillEngine({
    context: contextPort,
    sensitivity: sensitivityPort,
    requirements: requirementsPort,
    authorization: authorizationPort,
    lifecycleObserver: (event) => events.push(event),
  });
  runtime.engine = engine;
  engine.initialize();
  engine.start();
  engine.registerSkillManifest({
    intent: "register-skill-manifest",
    manifest: {
      id: "diagnostic-invocation-skill",
      name: "Diagnostic invocation",
      version: "1.0.0",
      description: "Executes the deterministic M9 diagnostic slice.",
      author: "ORION diagnostic",
      license: "MIT",
      permissions: [],
      capabilities: ["diagnostic.invoke"],
      events: { publishes: [], consumes: [] },
      inputs: ["diagnostic.input"],
      outputs: ["diagnostic.output"],
      failureModes: ["diagnostic.failure"],
    },
  });
  engine.admitSkillWorkflow({
    intent: "admit-skill-workflow",
    skillId: "diagnostic-invocation-skill",
    supportedCapabilities: ["diagnostic.invoke"],
    validator: () => ({ status: "accepted" }),
    workflow: (input: SkillWorkflowInput) => ({
      status: "succeeded",
      outputs: { "diagnostic.output": input.inputs["diagnostic.input"]! },
    }),
  });
  const selection = engine.selectSkill({
    intent: "select-skill",
    capability: "diagnostic.invoke",
  });
  if (selection.status !== "selected")
    throw new Error("M9 Skill diagnostic selection failed.");
  const operationId = "diagnostic-m9-invocation";
  const target = engine.bindSkillToOperation({
    intent: "bind-skill-to-operation",
    operationId,
    binding: selection.binding,
  });
  const projection = engine.resolveSkillExecutionContext({
    intent: "resolve-skill-execution-context",
    operationId,
    contextRevision,
  });
  const governedRequirements = engine.resolveSkillInvocationRequirements({
    intent: "resolve-skill-invocation-requirements",
    target,
  });
  const evaluation = engine.resolveGovernedAuthorizationEvaluation({
    intent: "resolve-governed-authorization-evaluation",
    request: {
      intent: "evaluate-authorization-outcome",
      operationId,
      action: target.action,
      resource: target.resource,
    },
  });
  const result = engine.invokeBoundSkill({
    intent: "invoke-bound-skill",
    operationId,
    target,
    requirements: governedRequirements,
    inputs: { "diagnostic.input": "complete" },
    context: projection,
    authorizationEvaluation: evaluation,
  });
  return Object.freeze({
    result,
    lifecycleTransitionCount: events.length,
    resultAuthorityVerified: engine.normalizedResultVerifier.verify(result, {
      operationId: target.operationId,
      skillId: target.skillId,
      skillVersion: target.skillVersion,
      capability: target.capability,
    }),
  });
}

export function composeSkillCapability(): SkillCapabilityComposition {
  const engine = new SkillEngine();
  engine.initialize();
  engine.start();
  return Object.freeze({
    registerSkillManifest: engine,
    getRegisteredSkill: engine,
    discoverSkills: engine,
    engineState: () => engine.engineState,
  });
}
