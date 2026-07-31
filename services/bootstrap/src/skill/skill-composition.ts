import type {
  ActiveContextRevision,
  BindSkillToOperation,
  DiscoverSkills,
  EvaluateAuthorizationOutcome,
  GetRegisteredSkill,
  NormalizedSkillExecutionResult,
  ProtectedInvokeSkill,
  RegisterSkillManifest,
  ResolveGovernedAuthorizationEvaluation,
  ResolveSkillExecutionContext,
  ResolveSkillInvocationRequirements,
  SelectSkill,
  SkillInvocationLifecycleEvent,
  SkillWorkflowInput,
  VerifyAuthorizationEvaluationOutcome,
  VerifyNormalizedSkillExecutionResult,
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

export interface ConfiguredM9SkillCapabilityComposition {
  readonly selectSkill: SelectSkill;
  readonly bindSkillToOperation: BindSkillToOperation;
  readonly resolveSkillExecutionContext: ResolveSkillExecutionContext;
  readonly resolveSkillInvocationRequirements: ResolveSkillInvocationRequirements;
  readonly resolveGovernedAuthorizationEvaluation: ResolveGovernedAuthorizationEvaluation;
  readonly protectedInvokeSkill: ProtectedInvokeSkill;
  readonly verifyNormalizedSkillExecutionResult: VerifyNormalizedSkillExecutionResult;
}

export function composeConfiguredM9SkillCapability(
  verifyContextRevision: (candidate: unknown) => boolean,
  evaluator: EvaluateAuthorizationOutcome &
    VerifyAuthorizationEvaluationOutcome,
  lifecycleObserver?: (event: SkillInvocationLifecycleEvent) => void,
): ConfiguredM9SkillCapabilityComposition {
  const verifyContextRevisionAuthority = verifyContextRevision;
  const evaluateAuthorizationOutcome =
    evaluator.evaluateAuthorizationOutcome.bind(evaluator);
  const verifyAuthorizationEvaluationOutcome =
    evaluator.verifyAuthorizationEvaluationOutcome.bind(evaluator);
  const authorizationEvaluation = Object.freeze({
    evaluateAuthorizationOutcome,
    verifyAuthorizationEvaluationOutcome,
  });
  const context = new ProcessLocalSkillExecutionContextAuthority(
    verifyContextRevisionAuthority,
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
      authorizationEvaluation,
      authorizationEvaluation,
    );
  const contextPort = Object.freeze({
    resolve: context.resolve.bind(context),
    verify: context.verify.bind(context),
  });
  const sensitivityPort = Object.freeze({
    resolve: sensitivity.resolve.bind(sensitivity),
    verify: sensitivity.verify.bind(sensitivity),
  });
  const requirementsPort = Object.freeze({
    resolve: requirements.resolve.bind(requirements),
    verify: requirements.verify.bind(requirements),
  });
  const authorizationPort = Object.freeze({
    resolve: authorization.resolve.bind(authorization),
    verifyAuthorizationEvaluationOutcome:
      authorization.verifyAuthorizationEvaluationOutcome.bind(authorization),
  });
  const engine = new SkillEngine({
    context: contextPort,
    sensitivity: sensitivityPort,
    requirements: requirementsPort,
    authorization: authorizationPort,
    ...(lifecycleObserver === undefined ? {} : { lifecycleObserver }),
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
  const normalizedResultVerifier = engine.normalizedResultVerifier;

  return Object.freeze({
    selectSkill: Object.freeze({
      selectSkill: engine.selectSkill.bind(engine),
    }),
    bindSkillToOperation: Object.freeze({
      bindSkillToOperation: engine.bindSkillToOperation.bind(engine),
    }),
    resolveSkillExecutionContext: Object.freeze({
      resolveSkillExecutionContext:
        engine.resolveSkillExecutionContext.bind(engine),
    }),
    resolveSkillInvocationRequirements: Object.freeze({
      resolveSkillInvocationRequirements:
        engine.resolveSkillInvocationRequirements.bind(engine),
    }),
    resolveGovernedAuthorizationEvaluation: Object.freeze({
      resolveGovernedAuthorizationEvaluation:
        engine.resolveGovernedAuthorizationEvaluation.bind(engine),
    }),
    protectedInvokeSkill: Object.freeze({
      invokeBoundSkill: engine.invokeBoundSkill.bind(engine),
    }),
    verifyNormalizedSkillExecutionResult: Object.freeze({
      verify: normalizedResultVerifier.verify.bind(normalizedResultVerifier),
    }),
  });
}

export function demonstrateM9SkillInvocation(
  contextRevision: ActiveContextRevision,
  verifyContextRevision: (candidate: unknown) => boolean,
  evaluator: EvaluateAuthorizationOutcome &
    VerifyAuthorizationEvaluationOutcome,
): M9SkillDemonstration {
  const events: SkillInvocationLifecycleEvent[] = [];
  const skill = composeConfiguredM9SkillCapability(
    verifyContextRevision,
    evaluator,
    (event) => events.push(event),
  );
  const selection = skill.selectSkill.selectSkill({
    intent: "select-skill",
    capability: "diagnostic.invoke",
  });
  if (selection.status !== "selected")
    throw new Error("M9 Skill diagnostic selection failed.");
  const operationId = "diagnostic-m9-invocation";
  const target = skill.bindSkillToOperation.bindSkillToOperation({
    intent: "bind-skill-to-operation",
    operationId,
    binding: selection.binding,
  });
  const projection =
    skill.resolveSkillExecutionContext.resolveSkillExecutionContext({
      intent: "resolve-skill-execution-context",
      operationId,
      contextRevision,
    });
  const governedRequirements =
    skill.resolveSkillInvocationRequirements.resolveSkillInvocationRequirements(
      {
        intent: "resolve-skill-invocation-requirements",
        target,
      },
    );
  const evaluation =
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
  const result = skill.protectedInvokeSkill.invokeBoundSkill({
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
    resultAuthorityVerified: skill.verifyNormalizedSkillExecutionResult.verify(
      result,
      {
        operationId: target.operationId,
        skillId: target.skillId,
        skillVersion: target.skillVersion,
        capability: target.capability,
      },
    ),
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
