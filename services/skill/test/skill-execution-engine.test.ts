import { describe, expect, it, vi } from "vitest";
import {
  DuplicateSkillWorkflowAdmissionError,
  InvalidBoundSkillTargetInputError,
  InvalidGovernedAuthorizationEvaluationError,
  InvalidSkillManifestError,
  InvalidSkillSelectionInputError,
  InvalidSkillSelectionAuthorityError,
  InvalidProtectedSkillInvocationInputError,
  InvalidSkillAuthorityError,
  InvalidSkillContextAuthorityError,
  InvalidSkillExecutionStateError,
  InvalidSkillStateError,
  InvalidSkillValidationResultError,
  InvalidSkillWorkflowAdmissionError,
  InvalidSkillWorkflowResultError,
  SkillAuthorizationEnforcementError,
  SkillInputValidationError,
  SkillValidatorBoundaryError,
  SkillWorkflowExecutionError,
  createAuthorizationDecisionArtifact,
  createAuthorizationEvaluationOutcome,
  createGovernedSecurityEvaluationSummary,
  type AuthorizationDecision,
  type AuthorizationEvaluationOutcome,
  type AuthorizationEvaluationOutcomeAuthorityPort,
  type BoundSkillInvocationTarget,
  type SkillExecutionContextAuthorityPort,
  type SkillExecutionContextProjection,
  type SkillInvocationLifecycleEvent,
  type SkillInvocationRequirementsAuthorityPort,
  type SkillInvocationRequirementsProjection,
  type SkillInvocationSensitivityAuthorityPort,
  type SkillValidatorInput,
} from "@orion/core";
import { SkillEngine, type SkillExecutionConfiguration } from "../src/index.js";
import { skillManifest } from "./skill-test-values.js";

function authorities(events: SkillInvocationLifecycleEvent[] = []) {
  const contexts = new WeakMap<object, string>();
  const requirements = new WeakMap<object, string>();
  const evaluations = new WeakMap<object, string>();
  const sensitivity = new WeakMap<object, string>();
  let decision: AuthorizationDecision = "allow";
  let subject = Object.freeze({ kind: "anonymous" as const });
  let lineageId = "context.lineage";
  let revisionId = "context.revision";
  let summaryOverride:
    | Partial<{
        context: "available" | "unavailable" | "not-applicable";
        device: "available" | "unavailable" | "not-applicable";
        session: "available" | "unavailable" | "not-applicable";
        trustLevel: "available" | "unavailable" | "not-applicable";
      }>
    | undefined;
  let artifactOperationId: string | undefined;
  let artifactSubject:
    | Readonly<
        { kind: "anonymous" } | { kind: "authenticated"; identityId: string }
      >
    | undefined;
  let artifactAction: string | undefined;
  let artifactResourceId: string | undefined;
  let artifactPermissions: readonly string[] | undefined;
  let artifactSensitivity: "standard" | "sensitive" | undefined;
  let requirementsOverride:
    | Partial<{
        operationId: string;
        action: string;
        resourceId: string;
        requiredPermissions: readonly string[];
        sensitivity: "standard" | "sensitive";
      }>
    | undefined;
  let authorizationVerifierResult: unknown = true;
  let authorizationVerifierThrow: unknown;
  let forcedAuthorizationVerifier: boolean | undefined;
  const securityCalls = {
    legacyEvaluation: 0,
    outcomeEvaluation: 0,
    context: 0,
    device: 0,
    session: 0,
    trust: 0,
  };

  const context: SkillExecutionContextAuthorityPort = {
    resolve(request) {
      const result = Object.freeze({
        operationId: request.operationId,
        lineageId: lineageId as never,
        revisionId: revisionId as never,
        subject,
      });
      contexts.set(result, request.operationId);
      return result;
    },
    verify(candidate, expected) {
      return (
        typeof candidate === "object" &&
        candidate !== null &&
        contexts.get(candidate) === expected.operationId
      );
    },
  };
  const sensitivityPort: SkillInvocationSensitivityAuthorityPort = {
    resolve(request) {
      const result = Object.freeze({
        status: "available" as const,
        sensitivity: "standard" as const,
      });
      sensitivity.set(
        result,
        `${request.action}:${request.resource.kind === "identified" ? request.resource.resourceId : ""}`,
      );
      return result;
    },
    verify(candidate, expected) {
      return (
        typeof candidate === "object" &&
        candidate !== null &&
        sensitivity.get(candidate) ===
          `${expected.action}:${expected.resource.kind === "identified" ? expected.resource.resourceId : ""}`
      );
    },
  };
  const requirementsPort: SkillInvocationRequirementsAuthorityPort = {
    resolve(request) {
      const target = request.target;
      const result = Object.freeze({
        status: "available" as const,
        requirements: Object.freeze({
          operationId: requirementsOverride?.operationId ?? target.operationId,
          action: requirementsOverride?.action ?? target.action,
          resource:
            requirementsOverride?.resourceId === undefined
              ? target.resource
              : {
                  kind: "identified" as const,
                  resourceId: requirementsOverride.resourceId as never,
                },
          requiredPermissions:
            requirementsOverride?.requiredPermissions ??
            target.requiredPermissions,
          sensitivity: requirementsOverride?.sensitivity ?? "standard",
        }),
      });
      requirements.set(result, target.operationId);
      return result;
    },
    verify(candidate, expected) {
      return (
        typeof candidate === "object" &&
        candidate !== null &&
        requirements.get(candidate) === expected.operationId
      );
    },
  };
  const authorization: AuthorizationEvaluationOutcomeAuthorityPort = {
    resolve(request) {
      securityCalls.outcomeEvaluation += 1;
      securityCalls.context += 1;
      securityCalls.device += 1;
      securityCalls.session += 1;
      securityCalls.trust += 1;
      const governedSubject = artifactSubject ?? subject;
      const permissions = artifactPermissions ?? ["weather.read"];
      const sensitivityValue = artifactSensitivity ?? "standard";
      const artifact = createAuthorizationDecisionArtifact({
        operationId: artifactOperationId ?? request.request.operationId,
        decision,
        subject: governedSubject,
        action: artifactAction ?? request.request.action,
        resource:
          artifactResourceId === undefined
            ? request.request.resource
            : { kind: "identified", resourceId: artifactResourceId },
        requirementsStatus: "available",
        evaluatedPermissions: permissions,
        sensitivity: sensitivityValue,
        securityContext: {
          context: "available",
          device: "not-applicable",
          session: "not-applicable",
          trustLevel: "not-applicable",
        },
        policy: { id: "orion.minimum-authorization", version: "1.0.0" },
        reason:
          decision === "allow"
            ? sensitivityValue === "sensitive"
              ? "confirmation-and-permissions-satisfied"
              : permissions.length === 0
                ? "no-permission-required"
                : "all-required-permissions-granted"
            : decision === "deny"
              ? "missing-required-permission"
              : "grant-evidence-unavailable",
        evidence: {
          grantEvidenceStatus:
            decision === "indeterminate" ? "unavailable" : "available",
          confirmationStatus:
            decision === "indeterminate"
              ? "not-evaluated"
              : sensitivityValue === "sensitive"
                ? "confirmed"
                : "not-required",
        },
      });
      const summary = createGovernedSecurityEvaluationSummary({
        operationId: artifactOperationId ?? request.request.operationId,
        subject: governedSubject,
        securityContext: {
          ...artifact.securityContext,
          ...summaryOverride,
        },
      });
      const result = Object.freeze({
        authorization: artifact,
        securityEvaluationSummary: summary,
      });
      evaluations.set(result, request.request.operationId);
      return result;
    },
    verifyAuthorizationEvaluationOutcome(request) {
      if (authorizationVerifierThrow !== undefined)
        throw authorizationVerifierThrow;
      if (forcedAuthorizationVerifier !== undefined)
        return forcedAuthorizationVerifier;
      if (authorizationVerifierResult !== true)
        return authorizationVerifierResult as boolean;
      return (
        typeof request.outcome === "object" &&
        request.outcome !== null &&
        evaluations.get(request.outcome) === request.operationId
      );
    },
  };
  const configuration: SkillExecutionConfiguration = {
    context,
    sensitivity: sensitivityPort,
    requirements: requirementsPort,
    authorization,
    lifecycleObserver: (event) => events.push(event),
  };
  return {
    configuration,
    setDecision(value: AuthorizationDecision) {
      decision = value;
    },
    setSubject(value: typeof subject) {
      subject = value;
    },
    setContextIdentities(lineage: string, revision: string) {
      lineageId = lineage;
      revisionId = revision;
    },
    setSummaryOverride(value: typeof summaryOverride) {
      summaryOverride = value;
    },
    setArtifactOperationId(value: string | undefined) {
      artifactOperationId = value;
    },
    setArtifactSubject(value: typeof artifactSubject) {
      artifactSubject = value;
    },
    setArtifactAction(value: string | undefined) {
      artifactAction = value;
    },
    setArtifactResourceId(value: string | undefined) {
      artifactResourceId = value;
    },
    setArtifactPermissions(value: readonly string[] | undefined) {
      artifactPermissions = value;
    },
    setArtifactSensitivity(value: "standard" | "sensitive" | undefined) {
      artifactSensitivity = value;
    },
    setRequirementsOverride(value: typeof requirementsOverride) {
      requirementsOverride = value;
    },
    setAuthorizationVerifierResult(value: unknown) {
      authorizationVerifierResult = value;
    },
    setAuthorizationVerifierThrow(value: unknown) {
      authorizationVerifierThrow = value;
    },
    forceAuthorizationVerifier(value: boolean | undefined) {
      forcedAuthorizationVerifier = value;
    },
    securityCalls,
  };
}

function engineWithWorkflow(
  validator: (input: never) => unknown = () => ({ status: "accepted" }),
  workflow: (input: never) => unknown = (input) => ({
    status: "succeeded",
    outputs: {
      "weather.value": (input as unknown as SkillValidatorInput).inputs[
        "location.value"
      ],
    },
  }),
  events: SkillInvocationLifecycleEvent[] = [],
) {
  const ports = authorities(events);
  const engine = startWithPorts(ports, validator, workflow);
  return { engine, ports };
}

function startWithPorts(
  ports: ReturnType<typeof authorities>,
  validator: (input: never) => unknown = () => ({ status: "accepted" }),
  workflow: (input: never) => unknown = (input) => ({
    status: "succeeded",
    outputs: {
      "weather.value": (input as unknown as SkillValidatorInput).inputs[
        "location.value"
      ],
    },
  }),
) {
  const engine = new SkillEngine(ports.configuration);
  engine.initialize();
  engine.start();
  engine.registerSkillManifest({
    intent: "register-skill-manifest",
    manifest: skillManifest(),
  });
  engine.admitSkillWorkflow({
    intent: "admit-skill-workflow",
    skillId: "weather-reader",
    supportedCapabilities: ["weather.read"],
    validator,
    workflow,
  });
  return engine;
}

function engineWithManifest(
  manifest: ReturnType<typeof skillManifest>,
  workflow: (input: never) => unknown,
) {
  const ports = authorities();
  const engine = new SkillEngine(ports.configuration);
  engine.initialize();
  engine.start();
  engine.registerSkillManifest({
    intent: "register-skill-manifest",
    manifest,
  });
  engine.admitSkillWorkflow({
    intent: "admit-skill-workflow",
    skillId: manifest.id,
    supportedCapabilities: [manifest.capabilities[0]!],
    validator: () => ({ status: "accepted" }),
    workflow,
  });
  return engine;
}

function prepared(
  engine: SkillEngine,
  operationId = "operation-1",
): {
  target: BoundSkillInvocationTarget;
  context: SkillExecutionContextProjection;
  requirements: SkillInvocationRequirementsProjection;
  authorizationEvaluation: AuthorizationEvaluationOutcome;
} {
  const selection = engine.selectSkill({
    intent: "select-skill",
    capability: "weather.read",
  });
  if (selection.status !== "selected") throw new Error("fixture");
  const target = engine.bindSkillToOperation({
    intent: "bind-skill-to-operation",
    operationId,
    binding: selection.binding,
  });
  const context = engine.resolveSkillExecutionContext({
    intent: "resolve-skill-execution-context",
    operationId,
    contextRevision: {},
  }) as SkillExecutionContextProjection;
  const requirements = engine.resolveSkillInvocationRequirements({
    intent: "resolve-skill-invocation-requirements",
    target,
  }) as SkillInvocationRequirementsProjection;
  const authorizationEvaluation = engine.resolveGovernedAuthorizationEvaluation(
    {
      intent: "resolve-governed-authorization-evaluation",
      request: {
        intent: "evaluate-authorization-outcome",
        operationId,
        action: target.action,
        resource: target.resource,
      },
    },
  ) as AuthorizationEvaluationOutcome;
  return { target, context, requirements, authorizationEvaluation };
}

function invoke(
  engine: SkillEngine,
  values: ReturnType<typeof prepared>,
  inputs: unknown = { "location.value": "Lima" },
) {
  return engine.invokeBoundSkill({
    intent: "invoke-bound-skill",
    operationId: values.target.operationId,
    ...values,
    inputs,
  });
}

describe("M9 Skill protected invocation", () => {
  it("captures configuration and provenance collaborators at construction", () => {
    const events: SkillInvocationLifecycleEvent[] = [];
    const { engine, ports } = engineWithWorkflow(undefined, undefined, events);
    const values = prepared(engine);
    const mutable = ports.configuration as {
      context: SkillExecutionContextAuthorityPort;
      requirements: SkillInvocationRequirementsAuthorityPort;
      authorization: AuthorizationEvaluationOutcomeAuthorityPort;
      lifecycleObserver?: (event: SkillInvocationLifecycleEvent) => void;
    };
    mutable.context = { resolve: () => ({}) as never, verify: () => true };
    mutable.requirements = {
      resolve: () => ({}) as never,
      verify: () => true,
    };
    mutable.authorization = {
      resolve: () => ({}) as never,
      verifyAuthorizationEvaluationOutcome: () => true,
    };
    mutable.lifecycleObserver = () => {
      throw new Error("mutated observer");
    };

    expect(invoke(engine, values).status).toBe("succeeded");
    expect(events).toHaveLength(6);
    expect(() =>
      invoke(engine, { ...values, context: { ...values.context } }),
    ).toThrow(InvalidSkillContextAuthorityError);
    expect(() =>
      invoke(engine, {
        ...values,
        requirements: { ...values.requirements },
      }),
    ).toThrow(InvalidSkillAuthorityError);
    expect(() =>
      invoke(engine, {
        ...values,
        authorizationEvaluation: { ...values.authorizationEvaluation },
      }),
    ).toThrow(InvalidGovernedAuthorizationEvaluationError);
    expect(Object.isFrozen(ports.configuration)).toBe(false);
  });

  it("never re-reads mutated or hostile caller configuration after construction", () => {
    const events: SkillInvocationLifecycleEvent[] = [];
    const ports = authorities(events);
    const configuration = ports.configuration as unknown as Record<
      string,
      unknown
    >;
    const authorization = configuration.authorization as Record<
      string,
      unknown
    >;
    const originalResolve = authorization.resolve as (
      ...args: unknown[]
    ) => unknown;
    const originalVerify =
      authorization.verifyAuthorizationEvaluationOutcome as (
        ...args: unknown[]
      ) => unknown;
    const r1 = vi.fn((...args: unknown[]) =>
      Reflect.apply(originalResolve, authorization, args),
    );
    const v1 = vi.fn((...args: unknown[]) =>
      Reflect.apply(originalVerify, authorization, args),
    );
    authorization.resolve = r1;
    authorization.verifyAuthorizationEvaluationOutcome = v1;
    const engine = new SkillEngine(ports.configuration);
    engine.initialize();
    engine.start();
    engine.registerSkillManifest({
      intent: "register-skill-manifest",
      manifest: skillManifest(),
    });
    engine.admitSkillWorkflow({
      intent: "admit-skill-workflow",
      skillId: "weather-reader",
      supportedCapabilities: ["weather.read"],
      validator: () => ({ status: "accepted" }),
      workflow: () => ({
        status: "succeeded",
        outputs: { "weather.value": "stable" },
      }),
    });
    const r2 = vi.fn(() => {
      throw new Error("replacement resolver");
    });
    const v2 = vi.fn(() => true);
    authorization.resolve = r2;
    authorization.verifyAuthorizationEvaluationOutcome = v2;
    const replacementObserver = vi.fn();
    configuration.lifecycleObserver = replacementObserver;

    const values = prepared(engine);
    expect(r1).toHaveBeenCalledTimes(1);
    expect(r2).toHaveBeenCalledTimes(0);
    expect(invoke(engine, values).status).toBe("succeeded");
    expect(v1).toHaveBeenCalledTimes(2);
    expect(v2).toHaveBeenCalledTimes(0);
    expect(replacementObserver).toHaveBeenCalledTimes(0);
    expect(events).toHaveLength(6);
    expect(() =>
      invoke(engine, {
        ...values,
        authorizationEvaluation: { ...values.authorizationEvaluation },
      }),
    ).toThrow(InvalidGovernedAuthorizationEvaluationError);
    expect(v2).toHaveBeenCalledTimes(0);

    let laterReads = 0;
    Object.defineProperty(configuration, "authorization", {
      enumerable: true,
      configurable: true,
      get() {
        laterReads += 1;
        throw new Error("hostile post-construction configuration");
      },
    });
    expect(invoke(engine, values).status).toBe("succeeded");
    expect(laterReads).toBe(0);
    expect(Object.isFrozen(configuration)).toBe(false);
    expect(Object.isFrozen(authorization)).toBe(false);
  });

  it.each(["context", "sensitivity", "requirements", "authorization"] as const)(
    "captures nested %s resolver/verifier independently",
    (authorityName) => {
      const ports = authorities();
      const pair = ports.configuration[authorityName] as unknown as Record<
        string,
        unknown
      >;
      const resolverName = "resolve";
      const verifierName =
        authorityName === "authorization"
          ? "verifyAuthorizationEvaluationOutcome"
          : "verify";
      const originalResolver = pair[resolverName] as (
        ...args: unknown[]
      ) => unknown;
      const originalVerifier = pair[verifierName] as (
        ...args: unknown[]
      ) => unknown;
      const r1 = vi.fn((...args: unknown[]) =>
        Reflect.apply(originalResolver, pair, args),
      );
      const v1 = vi.fn((...args: unknown[]) =>
        Reflect.apply(originalVerifier, pair, args),
      );
      pair[resolverName] = r1;
      pair[verifierName] = v1;
      const engine = startWithPorts(ports);
      const r2 = vi.fn(() => {
        throw new Error("replacement resolver");
      });
      const v2 = vi.fn(() => true);
      pair[resolverName] = r2;
      pair[verifierName] = v2;

      if (authorityName === "context")
        engine.resolveSkillExecutionContext({
          intent: "resolve-skill-execution-context",
          operationId: "capture-operation",
          contextRevision: {},
        });
      else if (authorityName === "sensitivity")
        engine.resolveSkillInvocationSensitivity({
          intent: "resolve-skill-invocation-sensitivity",
          action: "skill.invoke",
          resource: {
            kind: "identified",
            resourceId: "skill:weather-reader",
          },
        });
      else {
        const selection = engine.selectSkill({
          intent: "select-skill",
          capability: "weather.read",
        });
        if (selection.status !== "selected") throw new Error("fixture");
        const target = engine.bindSkillToOperation({
          intent: "bind-skill-to-operation",
          operationId: "capture-operation",
          binding: selection.binding,
        });
        if (authorityName === "requirements")
          engine.resolveSkillInvocationRequirements({
            intent: "resolve-skill-invocation-requirements",
            target,
          });
        else
          engine.resolveGovernedAuthorizationEvaluation({
            intent: "resolve-governed-authorization-evaluation",
            request: {
              intent: "evaluate-authorization-outcome",
              operationId: target.operationId,
              action: target.action,
              resource: target.resource,
            },
          });
      }
      expect(r1).toHaveBeenCalledTimes(1);
      expect(v1).toHaveBeenCalledTimes(1);
      expect(r2).toHaveBeenCalledTimes(0);
      expect(v2).toHaveBeenCalledTimes(0);
      expect(Object.isFrozen(pair)).toBe(false);
    },
  );

  it("ignores hostile whole-pair replacements and observer removal", () => {
    const events: SkillInvocationLifecycleEvent[] = [];
    const ports = authorities(events);
    const configuration = ports.configuration as unknown as Record<
      string,
      unknown
    >;
    const engine = startWithPorts(ports);
    const values = prepared(engine);
    const revoked = Proxy.revocable({}, {});
    revoked.revoke();
    configuration.context = revoked.proxy;
    configuration.sensitivity = 1;
    configuration.requirements = Object.freeze({});
    configuration.authorization = revoked.proxy;
    delete configuration.lifecycleObserver;
    expect(invoke(engine, values).status).toBe("succeeded");
    expect(events).toHaveLength(6);
    expect(Object.isFrozen(configuration)).toBe(false);
  });

  it("preserves issuing-runtime verifier capture after cross-runtime mutation", () => {
    const first = authorities();
    const second = authorities();
    const replacement = vi.fn(() => true);
    const firstConfiguration = first.configuration as unknown as Record<
      string,
      unknown
    >;
    const firstAuthorization = firstConfiguration.authorization as Record<
      string,
      unknown
    >;
    const secondAuthorization = (
      second.configuration as unknown as Record<string, unknown>
    ).authorization as Record<string, unknown>;
    const engineA = startWithPorts(first);
    const engineB = startWithPorts(second);
    const valuesA = prepared(engineA, "shared-operation");
    const valuesB = prepared(engineB, "shared-operation");
    firstAuthorization.verifyAuthorizationEvaluationOutcome = replacement;
    firstConfiguration.authorization = secondAuthorization;
    expect(() =>
      invoke(engineA, {
        ...valuesA,
        authorizationEvaluation: valuesB.authorizationEvaluation,
      }),
    ).toThrow(InvalidGovernedAuthorizationEvaluationError);
    expect(invoke(engineA, valuesA).status).toBe("succeeded");
    expect(replacement).toHaveBeenCalledTimes(0);
  });

  it.each(["context", "sensitivity", "requirements"] as const)(
    "rejects receiver-bound %s class ports without invoking mutable delegates",
    (field) => {
      const calls = { initial: 0, mutated: 0 };
      class ReceiverBoundPort {
        public delegate: (...arguments_: unknown[]) => boolean = () => {
          calls.initial += 1;
          return false;
        };
        public resolve(request: unknown): unknown {
          return this.delegate(request);
        }
        public verify(candidate: unknown, expected: unknown): unknown {
          return this.delegate(candidate, expected);
        }
      }
      const candidate = new ReceiverBoundPort();
      const valid = authorities().configuration;
      expect(
        () =>
          new SkillEngine({
            ...valid,
            [field]: candidate,
          } as never),
      ).toThrow(InvalidSkillExecutionStateError);
      candidate.delegate = () => {
        calls.mutated += 1;
        return true;
      };
      const accepted = startWithPorts(authorities());
      expect(invoke(accepted, prepared(accepted)).status).toBe("succeeded");
      expect(calls).toEqual({ initial: 0, mutated: 0 });
      expect(Object.isFrozen(candidate)).toBe(false);
    },
  );

  it("rejects receiver-bound authorization class ports without invoking mutable delegates", () => {
    const calls = { initial: 0, mutated: 0 };
    class ReceiverBoundPort {
      public delegate: (...arguments_: unknown[]) => boolean = () => {
        calls.initial += 1;
        return false;
      };
      public resolve(request: unknown): unknown {
        return this.delegate(request);
      }
      public verifyAuthorizationEvaluationOutcome(request: unknown): unknown {
        return this.delegate(request);
      }
    }
    const candidate = new ReceiverBoundPort();
    const valid = authorities().configuration;
    expect(
      () =>
        new SkillEngine({
          ...valid,
          authorization: candidate,
        } as never),
    ).toThrow(InvalidSkillExecutionStateError);
    candidate.delegate = () => {
      calls.mutated += 1;
      return true;
    };
    const accepted = startWithPorts(authorities());
    expect(invoke(accepted, prepared(accepted)).status).toBe("succeeded");
    expect(calls).toEqual({ initial: 0, mutated: 0 });
    expect(Object.isFrozen(candidate)).toBe(false);
  });

  it("rejects the original forged-ALLOW class-delegate attack shape end to end", () => {
    const ports = authorities();
    const original = ports.configuration.authorization;
    const calls = { initial: 0, malicious: 0 };
    class MutableVerifierPort {
      public delegate: (...arguments_: unknown[]) => boolean = () => {
        calls.initial += 1;
        return false;
      };
      public resolve = original.resolve;
      public verifyAuthorizationEvaluationOutcome(request: unknown): boolean {
        return this.delegate(request);
      }
    }
    const vulnerableCandidate = new MutableVerifierPort();
    expect(
      () =>
        new SkillEngine({
          ...ports.configuration,
          authorization: vulnerableCandidate,
        } as never),
    ).toThrow(InvalidSkillExecutionStateError);
    const validator = vi.fn(() => ({ status: "accepted" }));
    const workflow = vi.fn(() => ({
      status: "succeeded",
      outputs: { "weather.value": "stable" },
    }));
    const engine = startWithPorts(ports, validator, workflow);
    const values = prepared(engine, "delegate-mutation-operation");
    validator.mockClear();
    workflow.mockClear();
    vulnerableCandidate.delegate = () => {
      calls.malicious += 1;
      return true;
    };
    const publicFactoryOutcome = createAuthorizationEvaluationOutcome({
      authorization: values.authorizationEvaluation.authorization,
      securityEvaluationSummary:
        values.authorizationEvaluation.securityEvaluationSummary,
    });
    // The public factory preserves visible values but cannot acquire provenance.
    expect(() =>
      invoke(engine, {
        ...values,
        authorizationEvaluation: publicFactoryOutcome,
      }),
    ).toThrow(InvalidGovernedAuthorizationEvaluationError);
    expect(calls).toEqual({ initial: 0, malicious: 0 });
    expect(validator).toHaveBeenCalledTimes(0);
    expect(workflow).toHaveBeenCalledTimes(0);
    expect(invoke(engine, values).status).toBe("succeeded");
  });

  it("keeps runtime-A authority isolated after rejected runtime-B delegate mutation", () => {
    const runtimeA = authorities();
    const runtimeB = authorities();
    const engineA = startWithPorts(runtimeA);
    const engineB = startWithPorts(runtimeB);
    const valuesA = prepared(engineA, "delegate-runtime-operation");
    const valuesB = prepared(engineB, "delegate-runtime-operation");
    const calls = { initial: 0, mutated: 0 };
    class CrossRuntimeVerifierPort {
      public delegate: (...arguments_: unknown[]) => boolean = () => {
        calls.initial += 1;
        return false;
      };
      public resolve = runtimeA.configuration.authorization.resolve;
      public verifyAuthorizationEvaluationOutcome(request: unknown): boolean {
        return this.delegate(request);
      }
    }
    const candidate = new CrossRuntimeVerifierPort();
    expect(
      () =>
        new SkillEngine({
          ...runtimeA.configuration,
          authorization: candidate,
        } as never),
    ).toThrow(InvalidSkillExecutionStateError);
    candidate.delegate = () => {
      calls.mutated += 1;
      return true;
    };
    expect(() =>
      invoke(engineA, {
        ...valuesA,
        authorizationEvaluation: valuesB.authorizationEvaluation,
      }),
    ).toThrow(InvalidGovernedAuthorizationEvaluationError);
    expect(invoke(engineA, valuesA).status).toBe("succeeded");
    expect(calls).toEqual({ initial: 0, mutated: 0 });
  });

  it("proves the observer boundary is function-only and receiver-free", () => {
    const valid = authorities().configuration;
    class ObserverHolder {
      public calls = 0;
      public observe(): void {
        this.calls += 1;
      }
    }
    const holder = new ObserverHolder();
    expect(
      () =>
        new SkillEngine({
          ...valid,
          lifecycleObserver: holder,
        } as never),
    ).toThrow(InvalidSkillExecutionStateError);
    expect(holder.calls).toBe(0);
    const observed: SkillInvocationLifecycleEvent[] = [];
    const plainObserver = (event: SkillInvocationLifecycleEvent) =>
      observed.push(event);
    const engine = startWithPorts({
      ...authorities(observed),
      configuration: {
        ...valid,
        lifecycleObserver: plainObserver,
      },
    });
    const mutable = valid as unknown as Record<string, unknown>;
    mutable.lifecycleObserver = holder.observe.bind(holder);
    expect(invoke(engine, prepared(engine)).status).toBe("succeeded");
    expect(holder.calls).toBe(0);
    expect(observed).toHaveLength(6);
  });

  it("normalizes hostile configuration validation", () => {
    const valid = authorities().configuration;
    const revoked = Proxy.revocable(valid, {});
    revoked.revoke();
    const candidates = [
      null,
      {},
      { ...valid, extra: true },
      Object.defineProperty({ ...valid }, "context", {
        enumerable: true,
        get() {
          throw new Error("configuration-secret");
        },
      }),
      new Proxy(valid, {
        ownKeys() {
          throw new Error("configuration-secret");
        },
      }),
      revoked.proxy,
    ];
    for (const candidate of candidates)
      expect(() => new SkillEngine(candidate as never)).toThrow(
        InvalidSkillExecutionStateError,
      );
  });

  it.each([
    new Error("verifier-native-secret"),
    new InvalidGovernedAuthorizationEvaluationError(),
    "verifier-primitive-secret",
  ])("maps an Outcome verifier throw to execution state", (thrown) => {
    const ports = authorities();
    ports.setAuthorizationVerifierThrow(thrown);
    const engine = startWithPorts(ports);
    expect(() => prepared(engine)).toThrow(InvalidSkillExecutionStateError);
  });

  it.each([undefined, null, 1, "true", {}, []])(
    "maps a malformed Outcome verifier result to execution state: %#",
    (result) => {
      const ports = authorities();
      ports.setAuthorizationVerifierResult(result);
      const engine = startWithPorts(ports);
      expect(() => prepared(engine)).toThrow(InvalidSkillExecutionStateError);
    },
  );

  it("suppresses hostile input inspection after authorization mismatch", () => {
    const validator = vi.fn();
    const workflow = vi.fn();
    const { engine, ports } = engineWithWorkflow(validator, workflow);
    ports.setArtifactPermissions([]);
    const values = prepared(engine);
    let inputReads = 0;
    const hostileInputs = new Proxy(
      {},
      {
        ownKeys() {
          inputReads += 1;
          throw new Error("input-secret");
        },
      },
    );
    expect(() => invoke(engine, values, hostileInputs)).toThrow(
      SkillAuthorizationEnforcementError,
    );
    expect(inputReads).toBe(0);
    expect(validator).toHaveBeenCalledTimes(0);
    expect(workflow).toHaveBeenCalledTimes(0);
  });

  it("proves adjacent protected authority stages leave later hostile values untouched", () => {
    const { engine } = engineWithWorkflow();

    {
      const values = prepared(engine, "precedence-target");
      let laterTraps = 0;
      const hostileContext = new Proxy(
        {},
        {
          ownKeys() {
            laterTraps += 1;
            throw new Error("later-context-secret");
          },
        },
      );
      expect(() =>
        invoke(engine, {
          ...values,
          target: { ...values.target } as BoundSkillInvocationTarget,
          context: hostileContext as SkillExecutionContextProjection,
        }),
      ).toThrow(InvalidSkillAuthorityError);
      expect(laterTraps).toBe(0);
    }

    {
      const values = prepared(engine, "precedence-context");
      let laterTraps = 0;
      const hostileRequirements = new Proxy(
        {},
        {
          ownKeys() {
            laterTraps += 1;
            throw new Error("later-requirements-secret");
          },
        },
      );
      expect(() =>
        invoke(engine, {
          ...values,
          context: { ...values.context } as SkillExecutionContextProjection,
          requirements:
            hostileRequirements as SkillInvocationRequirementsProjection,
        }),
      ).toThrow(InvalidSkillContextAuthorityError);
      expect(laterTraps).toBe(0);
    }

    {
      const values = prepared(engine, "precedence-requirements");
      let laterTraps = 0;
      const hostileOutcome = new Proxy(
        {},
        {
          ownKeys() {
            laterTraps += 1;
            throw new Error("later-outcome-secret");
          },
        },
      );
      expect(() =>
        invoke(engine, {
          ...values,
          requirements: {
            ...values.requirements,
          } as SkillInvocationRequirementsProjection,
          authorizationEvaluation:
            hostileOutcome as AuthorizationEvaluationOutcome,
        }),
      ).toThrow(InvalidSkillAuthorityError);
      expect(laterTraps).toBe(0);
    }

    {
      const values = prepared(engine, "precedence-provenance");
      let nestedReads = 0;
      const fake = {};
      Object.defineProperty(fake, "authorization", {
        enumerable: true,
        get() {
          nestedReads += 1;
          throw new Error("nested-artifact-secret");
        },
      });
      Object.defineProperty(fake, "securityEvaluationSummary", {
        enumerable: true,
        value: values.authorizationEvaluation.securityEvaluationSummary,
      });
      expect(() =>
        invoke(engine, {
          ...values,
          authorizationEvaluation: fake as AuthorizationEvaluationOutcome,
        }),
      ).toThrow(InvalidGovernedAuthorizationEvaluationError);
      expect(nestedReads).toBe(0);
    }
  });

  it.each([
    ["operation", { operationId: "requirements-other-operation" }],
    ["action", { action: "skill.other" }],
    ["resource", { resourceId: "skill:other" }],
    ["permissions", { requiredPermissions: [] }],
    ["sensitivity", { sensitivity: "sensitive" as const }],
  ] as const)(
    "rejects genuine governed Requirements %s mismatch at enforcement",
    (_name, override) => {
      const events: SkillInvocationLifecycleEvent[] = [];
      const validator = vi.fn();
      const workflow = vi.fn();
      const { engine, ports } = engineWithWorkflow(validator, workflow, events);
      const values = prepared(engine);
      ports.setRequirementsOverride(override);
      const requirements = ports.configuration.requirements.resolve({
        intent: "resolve-skill-invocation-requirements",
        target: values.target,
      }) as SkillInvocationRequirementsProjection;
      expect(() =>
        invoke(engine, {
          ...values,
          requirements,
        }),
      ).toThrow(SkillAuthorizationEnforcementError);
      expect(validator).toHaveBeenCalledTimes(0);
      expect(workflow).toHaveBeenCalledTimes(0);
      expect(events.map((event) => event.category)).toEqual([
        "invocation-proposed",
        "authority-admitted",
        "pre-execution-rejected",
      ]);
    },
  );

  it.each([
    [
      "operation",
      (ports: ReturnType<typeof authorities>) =>
        ports.setArtifactOperationId("different-operation"),
    ],
    [
      "subject",
      (ports: ReturnType<typeof authorities>) =>
        ports.setArtifactSubject({
          kind: "authenticated",
          identityId: "identity.other",
        }),
    ],
    [
      "action",
      (ports: ReturnType<typeof authorities>) =>
        ports.setArtifactAction("skill.other"),
    ],
    [
      "resource",
      (ports: ReturnType<typeof authorities>) =>
        ports.setArtifactResourceId("skill:other"),
    ],
    [
      "permissions",
      (ports: ReturnType<typeof authorities>) =>
        ports.setArtifactPermissions([]),
    ],
    [
      "sensitivity",
      (ports: ReturnType<typeof authorities>) =>
        ports.setArtifactSensitivity("sensitive"),
    ],
  ] as const)(
    "rejects genuine governed %s correspondence mismatch at enforcement",
    (_name, arrange) => {
      const events: SkillInvocationLifecycleEvent[] = [];
      const validator = vi.fn(() => ({ status: "accepted" as const }));
      const workflow = vi.fn();
      const { engine, ports } = engineWithWorkflow(validator, workflow, events);
      let values: ReturnType<typeof prepared>;
      if (_name === "operation") {
        values = prepared(engine);
        arrange(ports);
        values = {
          ...values,
          authorizationEvaluation: ports.configuration.authorization.resolve({
            intent: "resolve-governed-authorization-evaluation",
            request: {
              intent: "evaluate-authorization-outcome",
              operationId: values.target.operationId,
              action: values.target.action,
              resource: values.target.resource,
            },
          }) as AuthorizationEvaluationOutcome,
        };
      } else {
        arrange(ports);
        values = prepared(engine);
      }
      expect(() => invoke(engine, values)).toThrow(
        SkillAuthorizationEnforcementError,
      );
      expect(validator).toHaveBeenCalledTimes(0);
      expect(workflow).toHaveBeenCalledTimes(0);
      expect(events.map((event) => event.category)).toEqual([
        "invocation-proposed",
        "authority-admitted",
        "pre-execution-rejected",
      ]);
    },
  );

  it("does not re-query Security currentness after Outcome issuance", () => {
    const { engine, ports } = engineWithWorkflow();
    const values = prepared(engine);
    expect(ports.securityCalls).toEqual({
      legacyEvaluation: 0,
      outcomeEvaluation: 1,
      context: 1,
      device: 1,
      session: 1,
      trust: 1,
    });
    expect(invoke(engine, values).status).toBe("succeeded");
    expect(ports.securityCalls).toEqual({
      legacyEvaluation: 0,
      outcomeEvaluation: 1,
      context: 1,
      device: 1,
      session: 1,
      trust: 1,
    });
  });

  it("keeps verifier false distinct from verifier failure", () => {
    const ports = authorities();
    ports.setAuthorizationVerifierResult(false);
    const engine = startWithPorts(ports);
    expect(() => prepared(engine)).toThrow(
      InvalidGovernedAuthorizationEvaluationError,
    );
  });

  it("remains usable across normal, authority failure, and normal invocation", () => {
    const { engine } = engineWithWorkflow();
    const first = prepared(engine, "authority-before");
    expect(invoke(engine, first).status).toBe("succeeded");
    const failed = prepared(engine, "authority-failure");
    expect(() =>
      invoke(engine, {
        ...failed,
        authorizationEvaluation: { ...failed.authorizationEvaluation },
      }),
    ).toThrow(InvalidGovernedAuthorizationEvaluationError);
    const after = prepared(engine, "authority-after");
    expect(invoke(engine, after).status).toBe("succeeded");
  });

  it("remains usable after a transient captured verifier failure", () => {
    const { engine, ports } = engineWithWorkflow();
    expect(invoke(engine, prepared(engine, "verifier-before")).status).toBe(
      "succeeded",
    );
    ports.setAuthorizationVerifierThrow(new Error("verifier-secret"));
    expect(() => prepared(engine, "verifier-failure")).toThrow(
      InvalidSkillExecutionStateError,
    );
    ports.setAuthorizationVerifierThrow(undefined);
    expect(invoke(engine, prepared(engine, "verifier-after")).status).toBe(
      "succeeded",
    );
  });

  it.each(["context", "requirements", "authorization"] as const)(
    "remains usable across normal -> %s source failure -> normal",
    (portName) => {
      const ports = authorities();
      let fail = false;
      const configuration = ports.configuration as unknown as Record<
        string,
        { resolve(...argumentsList: unknown[]): unknown }
      >;
      const pair = configuration[portName]!;
      const capturedResolve = pair.resolve;
      pair.resolve = (...argumentsList: unknown[]) => {
        if (fail) throw new Error(`${portName}-transient-secret`);
        return Reflect.apply(capturedResolve, pair, argumentsList);
      };
      const engine = startWithPorts(ports);
      expect(
        invoke(engine, prepared(engine, `${portName}-before`)).status,
      ).toBe("succeeded");
      const failureValues =
        portName === "context"
          ? undefined
          : prepared(engine, `${portName}-failure-target`);
      fail = true;
      if (portName === "context")
        expect(() =>
          engine.resolveSkillExecutionContext({
            intent: "resolve-skill-execution-context",
            operationId: `${portName}-failure`,
            contextRevision: {},
          }),
        ).toThrow(InvalidSkillExecutionStateError);
      else {
        const values = failureValues!;
        if (portName === "requirements")
          expect(() =>
            engine.resolveSkillInvocationRequirements({
              intent: "resolve-skill-invocation-requirements",
              target: values.target,
            }),
          ).toThrow(InvalidSkillExecutionStateError);
        else
          expect(() =>
            engine.resolveGovernedAuthorizationEvaluation({
              intent: "resolve-governed-authorization-evaluation",
              request: {
                intent: "evaluate-authorization-outcome",
                operationId: values.target.operationId,
                action: values.target.action,
                resource: values.target.resource,
              },
            }),
          ).toThrow(InvalidSkillExecutionStateError);
      }
      fail = false;
      expect(invoke(engine, prepared(engine, `${portName}-after`)).status).toBe(
        "succeeded",
      );
      expect(
        engine.selectSkill({
          intent: "select-skill",
          capability: "weather.read",
        }).status,
      ).toBe("selected");
    },
  );

  it.each(["context", "sensitivity", "requirements"] as const)(
    "normalizes the complete direct %s resolver/verifier failure boundary",
    (portName) => {
      const makeTarget = (engine: SkillEngine, operationId: string) => {
        const selection = engine.selectSkill({
          intent: "select-skill",
          capability: "weather.read",
        });
        if (selection.status !== "selected") throw new Error("fixture");
        return engine.bindSkillToOperation({
          intent: "bind-skill-to-operation",
          operationId,
          binding: selection.binding,
        });
      };
      const makeOperation = (
        engine: SkillEngine,
        target?: BoundSkillInvocationTarget,
      ) =>
        portName === "context"
          ? () =>
              engine.resolveSkillExecutionContext({
                intent: "resolve-skill-execution-context",
                operationId: "direct-port-operation",
                contextRevision: {},
              })
          : portName === "sensitivity"
            ? () =>
                engine.resolveSkillInvocationSensitivity({
                  intent: "resolve-skill-invocation-sensitivity",
                  action: "skill.invoke",
                  resource: {
                    kind: "identified",
                    resourceId: "skill:weather-reader",
                  },
                })
            : () =>
                engine.resolveSkillInvocationRequirements({
                  intent: "resolve-skill-invocation-requirements",
                  target: target!,
                });
      const authorityError =
        portName === "context"
          ? InvalidSkillContextAuthorityError
          : InvalidSkillAuthorityError;
      for (const thrown of [
        new Error(`${portName}-native-secret`),
        new InvalidSkillAuthorityError(),
        `${portName}-primitive-secret`,
      ]) {
        const ports = authorities();
        const pair = ports.configuration[portName] as unknown as {
          resolve: (...arguments_: unknown[]) => unknown;
          verify: (...arguments_: unknown[]) => unknown;
        };
        pair.resolve = () => {
          throw thrown;
        };
        const engine = startWithPorts(ports);
        const target =
          portName === "requirements"
            ? makeTarget(engine, `direct-${portName}`)
            : undefined;
        const operation = makeOperation(engine, target);
        expect(operation).toThrow(InvalidSkillExecutionStateError);
        try {
          operation();
        } catch (error) {
          expect(String(error)).not.toContain(`${portName}-`);
        }
      }
      for (const verifierResult of [
        false,
        new Error(`${portName}-verifier-native-secret`),
        new InvalidSkillAuthorityError(),
        `${portName}-verifier-primitive-secret`,
        1,
      ]) {
        const ports = authorities();
        const pair = ports.configuration[portName] as unknown as {
          resolve: (...arguments_: unknown[]) => unknown;
          verify: (...arguments_: unknown[]) => unknown;
        };
        pair.verify = () => {
          if (
            verifierResult instanceof Error ||
            typeof verifierResult === "string"
          )
            throw verifierResult;
          return verifierResult;
        };
        const engine = startWithPorts(ports);
        const target =
          portName === "requirements"
            ? makeTarget(engine, `verify-${portName}`)
            : undefined;
        const operation = makeOperation(engine, target);
        expect(operation).toThrow(
          verifierResult === false
            ? authorityError
            : InvalidSkillExecutionStateError,
        );
      }
    },
  );

  it.each(["context", "sensitivity", "requirements"] as const)(
    "reads and invokes the direct %s authority pair exactly once without mutation",
    (portName) => {
      const ports = authorities();
      const pair = ports.configuration[portName] as unknown as {
        resolve: (...arguments_: unknown[]) => unknown;
        verify: (...arguments_: unknown[]) => unknown;
      };
      const originalResolve = pair.resolve;
      const originalVerify = pair.verify;
      const resolve = vi.fn((...arguments_: unknown[]) =>
        Reflect.apply(originalResolve, undefined, arguments_),
      );
      const verify = vi.fn((...arguments_: unknown[]) =>
        Reflect.apply(originalVerify, undefined, arguments_),
      );
      pair.resolve = resolve;
      pair.verify = verify;
      const engine = startWithPorts(ports);
      let request: Record<string, unknown>;
      if (portName === "context")
        request = {
          intent: "resolve-skill-execution-context",
          operationId: "single-read-context",
          contextRevision: {},
        };
      else if (portName === "sensitivity")
        request = {
          intent: "resolve-skill-invocation-sensitivity",
          action: "skill.invoke",
          resource: {
            kind: "identified",
            resourceId: "skill:weather-reader",
          },
        };
      else {
        const selection = engine.selectSkill({
          intent: "select-skill",
          capability: "weather.read",
        });
        if (selection.status !== "selected") throw new Error("fixture");
        const target = engine.bindSkillToOperation({
          intent: "bind-skill-to-operation",
          operationId: "single-read-requirements",
          binding: selection.binding,
        });
        request = {
          intent: "resolve-skill-invocation-requirements",
          target,
        };
      }
      const before = { ...request };
      if (portName === "context")
        engine.resolveSkillExecutionContext(request as never);
      else if (portName === "sensitivity")
        engine.resolveSkillInvocationSensitivity(request as never);
      else engine.resolveSkillInvocationRequirements(request as never);
      expect(resolve).toHaveBeenCalledTimes(1);
      expect(verify).toHaveBeenCalledTimes(1);
      expect(request).toEqual(before);
      expect(Object.isFrozen(request)).toBe(false);
    },
  );

  it("contains verifier-true hostile Outcome structure before semantic use", () => {
    const { engine, ports } = engineWithWorkflow();
    const values = prepared(engine);
    ports.forceAuthorizationVerifier(true);
    let reads = 0;
    const hostile = new Proxy(
      {},
      {
        ownKeys() {
          reads += 1;
          throw new Error("outcome-structure-secret");
        },
      },
    );
    expect(() =>
      invoke(engine, {
        ...values,
        authorizationEvaluation: hostile as AuthorizationEvaluationOutcome,
      }),
    ).toThrow(InvalidGovernedAuthorizationEvaluationError);
    expect(reads).toBe(1);
  });

  it("contains verifier-true hostile nested Artifact and Summary values", () => {
    const validator = vi.fn(() => ({ status: "accepted" as const }));
    const workflow = vi.fn();
    const { engine, ports } = engineWithWorkflow(validator, workflow);
    const values = prepared(engine);
    ports.forceAuthorizationVerifier(true);
    const hostile = () =>
      new Proxy(
        {},
        {
          ownKeys() {
            throw new Error("nested-authorization-secret");
          },
        },
      );
    for (const authorizationEvaluation of [
      {
        authorization: hostile(),
        securityEvaluationSummary:
          values.authorizationEvaluation.securityEvaluationSummary,
      },
      {
        authorization: values.authorizationEvaluation.authorization,
        securityEvaluationSummary: hostile(),
      },
    ])
      expect(() =>
        invoke(engine, {
          ...values,
          authorizationEvaluation:
            authorizationEvaluation as AuthorizationEvaluationOutcome,
        }),
      ).toThrow(InvalidGovernedAuthorizationEvaluationError);
    expect(validator).toHaveBeenCalledTimes(0);
    expect(workflow).toHaveBeenCalledTimes(0);
  });

  it("uses M9 lifecycle precedence while preserving M7 errors", () => {
    const engine = new SkillEngine(authorities().configuration);
    let touched = 0;
    const hostile = new Proxy(
      {},
      {
        ownKeys() {
          touched += 1;
          throw new Error("request-secret");
        },
      },
    );
    expect(() => engine.selectSkill(hostile)).toThrow(
      InvalidSkillExecutionStateError,
    );
    expect(() => engine.discoverSkills(hostile)).toThrow(
      InvalidSkillStateError,
    );
    expect(touched).toBe(0);
  });

  it("gives lifecycle precedence over every hostile M9 request", () => {
    const engine = new SkillEngine(authorities().configuration);
    let touched = 0;
    const hostile = new Proxy(
      {},
      {
        ownKeys() {
          touched += 1;
          throw new Error("later-request-secret");
        },
      },
    );
    const operations = [
      () => engine.admitSkillWorkflow(hostile as never),
      () => engine.selectSkill(hostile as never),
      () => engine.bindSkillToOperation(hostile as never),
      () => engine.resolveSkillExecutionContext(hostile as never),
      () => engine.resolveSkillInvocationSensitivity(hostile as never),
      () => engine.resolveSkillInvocationRequirements(hostile as never),
      () => engine.resolveGovernedAuthorizationEvaluation(hostile as never),
      () => engine.invokeBoundSkill(hostile as never),
    ];
    for (const operation of operations)
      expect(operation).toThrow(InvalidSkillExecutionStateError);
    expect(touched).toBe(0);
  });

  it("proves Admit validation precedence suppresses hostile callable reflection", () => {
    const engine = new SkillEngine(authorities().configuration);
    engine.initialize();
    engine.start();
    engine.registerSkillManifest({
      intent: "register-skill-manifest",
      manifest: skillManifest(),
    });
    let traps = 0;
    const hostileValidator = new Proxy(() => ({ status: "accepted" }), {
      getPrototypeOf() {
        traps += 1;
        throw new Error("later-validator-secret");
      },
    });
    expect(() =>
      engine.admitSkillWorkflow({
        intent: "admit-skill-workflow",
        skillId: " invalid",
        supportedCapabilities: ["weather.read"],
        validator: hostileValidator,
        workflow: () => ({ status: "succeeded", outputs: {} }),
      }),
    ).toThrow(InvalidSkillWorkflowAdmissionError);
    expect(traps).toBe(0);
  });

  it("proves Admit catalog provenance precedes callable and capability inspection", () => {
    const engine = new SkillEngine(authorities().configuration);
    engine.initialize();
    engine.start();
    let callableTraps = 0;
    let capabilityTraps = 0;
    const hostileValidator = new Proxy(() => ({ status: "accepted" }), {
      getPrototypeOf() {
        callableTraps += 1;
        throw new Error("later-validator-secret");
      },
    });
    const hostileCapabilities = new Proxy(["weather.read"], {
      ownKeys() {
        capabilityTraps += 1;
        throw new Error("later-capability-secret");
      },
    });
    expect(() =>
      engine.admitSkillWorkflow({
        intent: "admit-skill-workflow",
        skillId: "weather-reader",
        supportedCapabilities: hostileCapabilities,
        validator: hostileValidator,
        workflow: () => ({ status: "succeeded", outputs: {} }),
      }),
    ).toThrow(InvalidSkillWorkflowAdmissionError);
    expect(callableTraps).toBe(0);
    expect(capabilityTraps).toBe(0);
  });

  it("proves Admit callable validation precedes capability inspection", () => {
    const engine = new SkillEngine(authorities().configuration);
    engine.initialize();
    engine.start();
    engine.registerSkillManifest({
      intent: "register-skill-manifest",
      manifest: skillManifest(),
    });
    let capabilityTraps = 0;
    const hostileCapabilities = new Proxy(["weather.read"], {
      ownKeys() {
        capabilityTraps += 1;
        throw new Error("later-capability-secret");
      },
    });
    expect(() =>
      engine.admitSkillWorkflow({
        intent: "admit-skill-workflow",
        skillId: "weather-reader",
        supportedCapabilities: hostileCapabilities,
        validator: {},
        workflow: () => ({ status: "succeeded", outputs: {} }),
      }),
    ).toThrow(InvalidSkillWorkflowAdmissionError);
    expect(capabilityTraps).toBe(0);
  });

  it("proves Select envelope precedence suppresses catalog traversal", () => {
    const { engine } = engineWithWorkflow();
    const original = Map.prototype.values;
    let laterCalls = 0;
    const spy = vi.spyOn(Map.prototype, "values").mockImplementation(function (
      this: Map<unknown, unknown>,
    ) {
      laterCalls += 1;
      return Reflect.apply(original, this, []);
    });
    try {
      expect(() =>
        engine.selectSkill({
          intent: "select-skill",
          capability: " invalid",
        }),
      ).toThrow(InvalidSkillSelectionInputError);
    } finally {
      spy.mockRestore();
    }
    expect(laterCalls).toBe(0);
  });

  it("proves Bind envelope precedence suppresses Binding authority access", () => {
    const { engine } = engineWithWorkflow();
    const selection = engine.selectSkill({
      intent: "select-skill",
      capability: "weather.read",
    });
    if (selection.status !== "selected") throw new Error("fixture");
    const original = WeakSet.prototype.has;
    let laterCalls = 0;
    const spy = vi.spyOn(WeakSet.prototype, "has").mockImplementation(function (
      this: WeakSet<WeakKey>,
      value: WeakKey,
    ) {
      if (value === selection.binding) laterCalls += 1;
      return Reflect.apply(original, this, [value]);
    });
    try {
      expect(() =>
        engine.bindSkillToOperation({
          intent: "bind-skill-to-operation",
          operationId: " invalid",
          binding: selection.binding,
        }),
      ).toThrow(InvalidBoundSkillTargetInputError);
    } finally {
      spy.mockRestore();
    }
    expect(laterCalls).toBe(0);
  });

  it.each([
    ["context", InvalidSkillContextAuthorityError],
    ["sensitivity", InvalidSkillAuthorityError],
    ["requirements", InvalidSkillAuthorityError],
    ["authorization", InvalidGovernedAuthorizationEvaluationError],
  ] as const)(
    "proves %s request/authority precedence suppresses its resolver",
    (portName, ExpectedError) => {
      const ports = authorities();
      const pair = ports.configuration[portName] as unknown as {
        resolve: (...arguments_: unknown[]) => unknown;
      };
      const original = pair.resolve;
      const resolver = vi.fn((...arguments_: unknown[]) =>
        Reflect.apply(original, undefined, arguments_),
      );
      pair.resolve = resolver;
      const engine = startWithPorts(ports);
      if (portName === "context")
        expect(() =>
          engine.resolveSkillExecutionContext({
            intent: "resolve-skill-execution-context",
            operationId: " invalid",
            contextRevision: new Proxy(
              {},
              {
                ownKeys() {
                  throw new Error("later-context-secret");
                },
              },
            ),
          }),
        ).toThrow(ExpectedError);
      else if (portName === "sensitivity")
        expect(() =>
          engine.resolveSkillInvocationSensitivity({
            intent: "resolve-skill-invocation-sensitivity",
            action: " invalid",
            resource: { kind: "unscoped" },
          }),
        ).toThrow(ExpectedError);
      else if (portName === "requirements")
        expect(() =>
          engine.resolveSkillInvocationRequirements({
            intent: "resolve-skill-invocation-requirements",
            target: Object.freeze({}),
          }),
        ).toThrow(ExpectedError);
      else
        expect(() =>
          engine.resolveGovernedAuthorizationEvaluation({
            intent: "resolve-governed-authorization-evaluation",
            request: {
              intent: "evaluate-authorization-outcome",
              operationId: " invalid",
              action: "skill.invoke",
              resource: { kind: "unscoped" },
            },
          }),
        ).toThrow(ExpectedError);
      expect(resolver).toHaveBeenCalledTimes(0);
    },
  );

  it.each([
    [
      "context",
      "resolveSkillExecutionContext",
      InvalidSkillContextAuthorityError,
    ],
    [
      "sensitivity",
      "resolveSkillInvocationSensitivity",
      InvalidSkillAuthorityError,
    ],
    [
      "requirements",
      "resolveSkillInvocationRequirements",
      InvalidSkillAuthorityError,
    ],
    [
      "authorization",
      "resolveGovernedAuthorizationEvaluation",
      InvalidGovernedAuthorizationEvaluationError,
    ],
  ] as const)(
    "proves %s resolver failure suppresses verification and result reconstruction",
    (portName, operationName, ExpectedError) => {
      const ports = authorities();
      const pair = ports.configuration[portName] as unknown as {
        resolve: (...arguments_: unknown[]) => unknown;
        verify?: (...arguments_: unknown[]) => unknown;
        verifyAuthorizationEvaluationOutcome?: (
          ...arguments_: unknown[]
        ) => unknown;
      };
      const resolve = vi.fn(() => {
        throw new Error("resolver-secret");
      });
      const verify = vi.fn(() => true);
      pair.resolve = resolve;
      if (portName === "authorization")
        pair.verifyAuthorizationEvaluationOutcome = verify;
      else pair.verify = verify;
      const engine = startWithPorts(ports);
      const selection = engine.selectSkill({
        intent: "select-skill",
        capability: "weather.read",
      });
      if (selection.status !== "selected") throw new Error("fixture");
      const target = engine.bindSkillToOperation({
        intent: "bind-skill-to-operation",
        operationId: `resolver-${portName}`,
        binding: selection.binding,
      });
      const requests = {
        context: {
          intent: "resolve-skill-execution-context",
          operationId: target.operationId,
          contextRevision: {},
        },
        sensitivity: {
          intent: "resolve-skill-invocation-sensitivity",
          action: target.action,
          resource: target.resource,
        },
        requirements: {
          intent: "resolve-skill-invocation-requirements",
          target,
        },
        authorization: {
          intent: "resolve-governed-authorization-evaluation",
          request: {
            intent: "evaluate-authorization-outcome",
            operationId: target.operationId,
            action: target.action,
            resource: target.resource,
          },
        },
      } as const;
      expect(() =>
        Reflect.apply(
          engine[operationName] as (...arguments_: unknown[]) => unknown,
          engine,
          [requests[portName]],
        ),
      ).toThrow(InvalidSkillExecutionStateError);
      expect(resolve).toHaveBeenCalledTimes(1);
      expect(verify).toHaveBeenCalledTimes(0);
      expect(ExpectedError).toBeDefined();
    },
  );

  it.each([
    [
      "context",
      "resolveSkillExecutionContext",
      InvalidSkillContextAuthorityError,
    ],
    [
      "sensitivity",
      "resolveSkillInvocationSensitivity",
      InvalidSkillAuthorityError,
    ],
    [
      "requirements",
      "resolveSkillInvocationRequirements",
      InvalidSkillAuthorityError,
    ],
    [
      "authorization",
      "resolveGovernedAuthorizationEvaluation",
      InvalidGovernedAuthorizationEvaluationError,
    ],
  ] as const)(
    "proves %s verifier rejection suppresses hostile result reconstruction",
    (portName, operationName, ExpectedError) => {
      const ports = authorities();
      const pair = ports.configuration[portName] as unknown as {
        resolve: (...arguments_: unknown[]) => unknown;
        verify?: (...arguments_: unknown[]) => unknown;
        verifyAuthorizationEvaluationOutcome?: (
          ...arguments_: unknown[]
        ) => unknown;
      };
      let hostileReads = 0;
      const candidate = new Proxy(
        {},
        {
          ownKeys() {
            hostileReads += 1;
            throw new Error("later-result-secret");
          },
        },
      );
      const resolve = vi.fn(() => candidate);
      const verify = vi.fn(() => false);
      pair.resolve = resolve;
      if (portName === "authorization")
        pair.verifyAuthorizationEvaluationOutcome = verify;
      else pair.verify = verify;
      const engine = startWithPorts(ports);
      const selection = engine.selectSkill({
        intent: "select-skill",
        capability: "weather.read",
      });
      if (selection.status !== "selected") throw new Error("fixture");
      const target = engine.bindSkillToOperation({
        intent: "bind-skill-to-operation",
        operationId: `verify-${portName}`,
        binding: selection.binding,
      });
      const requests = {
        context: {
          intent: "resolve-skill-execution-context",
          operationId: target.operationId,
          contextRevision: {},
        },
        sensitivity: {
          intent: "resolve-skill-invocation-sensitivity",
          action: target.action,
          resource: target.resource,
        },
        requirements: {
          intent: "resolve-skill-invocation-requirements",
          target,
        },
        authorization: {
          intent: "resolve-governed-authorization-evaluation",
          request: {
            intent: "evaluate-authorization-outcome",
            operationId: target.operationId,
            action: target.action,
            resource: target.resource,
          },
        },
      } as const;
      expect(() =>
        Reflect.apply(
          engine[operationName] as (...arguments_: unknown[]) => unknown,
          engine,
          [requests[portName]],
        ),
      ).toThrow(ExpectedError);
      expect(resolve).toHaveBeenCalledTimes(1);
      expect(verify).toHaveBeenCalledTimes(1);
      expect(hostileReads).toBe(0);
    },
  );

  it("proves the remaining Admit precedence adjacencies", () => {
    const { engine } = engineWithWorkflow();
    const admissionKeyValue = "weather-reader\u00001.0.0";
    const originalHas = Map.prototype.has;
    let duplicateReads = 0;
    const duplicateSpy = vi
      .spyOn(Map.prototype, "has")
      .mockImplementation(function (this: Map<unknown, unknown>, key: unknown) {
        if (key === admissionKeyValue) duplicateReads += 1;
        return Reflect.apply(originalHas, this, [key]);
      });
    try {
      expect(() =>
        engine.admitSkillWorkflow({
          intent: "admit-skill-workflow",
          skillId: "weather-reader",
          supportedCapabilities: ["missing.capability"],
          validator: () => ({ status: "accepted" }),
          workflow: () => ({ status: "succeeded", outputs: {} }),
        }),
      ).toThrow(InvalidSkillWorkflowAdmissionError);
    } finally {
      duplicateSpy.mockRestore();
    }
    expect(duplicateReads).toBe(0);

    const originalFreeze = Object.freeze;
    let constructedRelations = 0;
    const constructionSpy = vi
      .spyOn(Object, "freeze")
      .mockImplementation(<T>(value: T): Readonly<T> => {
        if (
          typeof value === "object" &&
          value !== null &&
          Reflect.getOwnPropertyDescriptor(value, "skillId")?.value ===
            "weather-reader" &&
          Reflect.getOwnPropertyDescriptor(value, "skillVersion")?.value ===
            "1.0.0"
        )
          constructedRelations += 1;
        return originalFreeze(value);
      });
    try {
      expect(() =>
        engine.admitSkillWorkflow({
          intent: "admit-skill-workflow",
          skillId: "weather-reader",
          supportedCapabilities: ["weather.read"],
          validator: () => ({ status: "accepted" }),
          workflow: () => ({ status: "succeeded", outputs: {} }),
        }),
      ).toThrow(DuplicateSkillWorkflowAdmissionError);
    } finally {
      constructionSpy.mockRestore();
    }
    expect(constructedRelations).toBe(0);
  });

  it("proves the remaining Select precedence adjacencies", () => {
    const ports = authorities();
    const unavailable = new SkillEngine(ports.configuration);
    unavailable.initialize();
    unavailable.start();
    unavailable.registerSkillManifest({
      intent: "register-skill-manifest",
      manifest: skillManifest(),
    });
    const originalSort = Array.prototype.sort;
    let rankingComparisons = 0;
    const rankingSpy = vi
      .spyOn(Array.prototype, "sort")
      .mockImplementation(function <T>(
        this: T[],
        compare?: (left: T, right: T) => number,
      ): T[] {
        return Reflect.apply(originalSort, this, [
          compare === undefined
            ? undefined
            : (left: T, right: T) => {
                if (
                  typeof left === "object" &&
                  left !== null &&
                  typeof right === "object" &&
                  right !== null &&
                  Reflect.getOwnPropertyDescriptor(left, "id") !== undefined &&
                  Reflect.getOwnPropertyDescriptor(right, "id") !== undefined
                )
                  rankingComparisons += 1;
                return compare(left, right);
              },
        ]);
      });
    try {
      expect(
        unavailable.selectSkill({
          intent: "select-skill",
          capability: "weather.read",
        }),
      ).toEqual({
        status: "unavailable",
        policy: {
          id: "orion.minimum-skill-selection",
          version: "1.0.0",
        },
        capability: "weather.read",
        reason: "no-invocation-eligible-skill",
      });
    } finally {
      rankingSpy.mockRestore();
    }
    expect(rankingComparisons).toBe(0);

    const engine = startWithPorts(authorities());
    engine.registerSkillManifest({
      intent: "register-skill-manifest",
      manifest: skillManifest("weather-reader-z"),
    });
    engine.admitSkillWorkflow({
      intent: "admit-skill-workflow",
      skillId: "weather-reader-z",
      supportedCapabilities: ["weather.read"],
      validator: () => ({ status: "accepted" }),
      workflow: () => ({ status: "succeeded", outputs: {} }),
    });
    let selectedResultConstructions = 0;
    const originalFreeze = Object.freeze;
    const freezeSpy = vi
      .spyOn(Object, "freeze")
      .mockImplementation(<T>(value: T): Readonly<T> => {
        if (
          typeof value === "object" &&
          value !== null &&
          Reflect.getOwnPropertyDescriptor(value, "status")?.value ===
            "selected"
        )
          selectedResultConstructions += 1;
        return originalFreeze(value);
      });
    const failingSort = vi
      .spyOn(Array.prototype, "sort")
      .mockImplementation(function <T>(
        this: T[],
        compare?: (left: T, right: T) => number,
      ): T[] {
        if (
          this.length >= 2 &&
          this.every(
            (value) =>
              typeof value === "object" &&
              value !== null &&
              Reflect.getOwnPropertyDescriptor(value, "id") !== undefined,
          )
        )
          throw new Error("isolated-selection-stage");
        return Reflect.apply(originalSort, this, [compare]);
      });
    try {
      expect(() =>
        engine.selectSkill({
          intent: "select-skill",
          capability: "weather.read",
        }),
      ).toThrow(InvalidSkillSelectionAuthorityError);
    } finally {
      failingSort.mockRestore();
      freezeSpy.mockRestore();
    }
    expect(selectedResultConstructions).toBe(0);
  });

  it("proves the remaining Bind and Bound Target precedence adjacencies", () => {
    const { engine } = engineWithWorkflow();
    const selection = engine.selectSkill({
      intent: "select-skill",
      capability: "weather.read",
    });
    if (selection.status !== "selected") throw new Error("fixture");

    const originalFreeze = Object.freeze;
    let targetConstructions = 0;
    const targetSpy = vi
      .spyOn(Object, "freeze")
      .mockImplementation(<T>(value: T): Readonly<T> => {
        if (
          typeof value === "object" &&
          value !== null &&
          Reflect.getOwnPropertyDescriptor(value, "operationId")?.value ===
            "bind-invalid-authority"
        )
          targetConstructions += 1;
        return originalFreeze(value);
      });
    try {
      expect(() =>
        engine.bindSkillToOperation({
          intent: "bind-skill-to-operation",
          operationId: "bind-invalid-authority",
          binding: { ...selection.binding },
        }),
      ).toThrow(InvalidSkillAuthorityError);
    } finally {
      targetSpy.mockRestore();
    }
    expect(targetConstructions).toBe(0);

    let authorityRegistrations = 0;
    let snapshotTargetConstructions = 0;
    const originalAdd = WeakSet.prototype.add;
    const registrationSpy = vi
      .spyOn(WeakSet.prototype, "add")
      .mockImplementation(function <T extends WeakKey>(
        this: WeakSet<T>,
        value: T,
      ): WeakSet<T> {
        if (
          typeof value === "object" &&
          Reflect.getOwnPropertyDescriptor(value, "operationId")?.value ===
            "bind-snapshot-failure"
        )
          authorityRegistrations += 1;
        return Reflect.apply(originalAdd, this, [value]) as WeakSet<T>;
      });
    let registeredSnapshots = 0;
    const snapshotFailure = vi
      .spyOn(Object, "freeze")
      .mockImplementation(<T>(value: T): Readonly<T> => {
        if (
          typeof value === "object" &&
          value !== null &&
          Reflect.getOwnPropertyDescriptor(value, "operationId")?.value ===
            "bind-snapshot-failure"
        )
          snapshotTargetConstructions += 1;
        if (
          typeof value === "object" &&
          value !== null &&
          Reflect.getOwnPropertyDescriptor(value, "id")?.value ===
            "weather-reader"
        ) {
          registeredSnapshots += 1;
          if (registeredSnapshots > 1)
            throw new Error("isolated-snapshot-derivation");
        }
        return originalFreeze(value);
      });
    try {
      expect(() =>
        engine.bindSkillToOperation({
          intent: "bind-skill-to-operation",
          operationId: "bind-snapshot-failure",
          binding: selection.binding,
        }),
      ).toThrow(InvalidSkillExecutionStateError);
    } finally {
      snapshotFailure.mockRestore();
      registrationSpy.mockRestore();
    }
    expect(authorityRegistrations).toBe(0);
    expect(snapshotTargetConstructions).toBe(0);
  });

  it("admits only after registration, copies catalog version, and rejects duplicates", () => {
    const engine = new SkillEngine(authorities().configuration);
    engine.initialize();
    engine.start();
    const validator = () => ({ status: "accepted" as const });
    const workflow = () => ({ status: "failed" as const, failureMode: "x" });
    expect(() =>
      engine.admitSkillWorkflow({
        intent: "admit-skill-workflow",
        skillId: "weather-reader",
        supportedCapabilities: ["weather.read"],
        validator,
        workflow,
      }),
    ).toThrow(InvalidSkillWorkflowAdmissionError);
    engine.registerSkillManifest({
      intent: "register-skill-manifest",
      manifest: skillManifest(),
    });
    const admission = engine.admitSkillWorkflow({
      intent: "admit-skill-workflow",
      skillId: "weather-reader",
      supportedCapabilities: ["weather.read"],
      validator,
      workflow,
    });
    expect(admission).toEqual({
      skillId: "weather-reader",
      skillVersion: "1.0.0",
      supportedCapabilities: ["weather.read"],
    });
    expect(Object.isFrozen(admission)).toBe(true);
    expect(() =>
      engine.admitSkillWorkflow({
        intent: "admit-skill-workflow",
        skillId: "weather-reader",
        supportedCapabilities: ["weather.read"],
        validator,
        workflow,
      }),
    ).toThrow(DuplicateSkillWorkflowAdmissionError);
  });

  it.each([
    async () => ({ status: "accepted" }),
    function* () {
      yield 1;
    },
    async function* () {
      yield 1;
    },
    class Candidate {},
    { validate() {} },
    Promise.resolve({ status: "accepted" }),
    { then() {} },
    [][Symbol.iterator](),
    { handle() {} },
  ])("rejects prohibited validator candidates", (validator) => {
    const engine = new SkillEngine(authorities().configuration);
    engine.initialize();
    engine.start();
    engine.registerSkillManifest({
      intent: "register-skill-manifest",
      manifest: skillManifest(),
    });
    expect(() =>
      engine.admitSkillWorkflow({
        intent: "admit-skill-workflow",
        skillId: "weather-reader",
        supportedCapabilities: ["weather.read"],
        validator,
        workflow: () => ({ status: "failed" }),
      }),
    ).toThrow(InvalidSkillWorkflowAdmissionError);
  });

  it.each([
    async () => ({ status: "succeeded", outputs: {} }),
    function* () {
      yield 1;
    },
    async function* () {
      yield 1;
    },
    class Candidate {},
    { execute() {} },
    Promise.resolve({}),
    { then() {} },
    [][Symbol.iterator](),
    { handle() {} },
  ])("rejects prohibited workflow candidates independently", (workflow) => {
    const engine = new SkillEngine(authorities().configuration);
    engine.initialize();
    engine.start();
    engine.registerSkillManifest({
      intent: "register-skill-manifest",
      manifest: skillManifest(),
    });
    expect(() =>
      engine.admitSkillWorkflow({
        intent: "admit-skill-workflow",
        skillId: "weather-reader",
        supportedCapabilities: ["weather.read"],
        validator: () => ({ status: "accepted" }),
        workflow: workflow as never,
      }),
    ).toThrow(InvalidSkillWorkflowAdmissionError);
  });

  it.each([
    [
      "ordinary",
      function () {
        return { status: "accepted" };
      },
    ],
    ["arrow", () => ({ status: "accepted" })],
    [
      "non-strict",
      Function("return { status: 'accepted' };") as (input: never) => unknown,
    ],
  ] as const)("admits an independent %s validator", (_name, validator) => {
    const { engine } = engineWithWorkflow(validator);
    expect(invoke(engine, prepared(engine)).status).toBe("succeeded");
    expect(Object.isFrozen(validator)).toBe(false);
  });

  it.each([
    [
      "ordinary",
      function () {
        return {
          status: "succeeded",
          outputs: { "weather.value": "ordinary" },
        };
      },
    ],
    [
      "arrow",
      () => ({
        status: "succeeded",
        outputs: { "weather.value": "arrow" },
      }),
    ],
    [
      "non-strict",
      Function(
        "return { status: 'succeeded', outputs: { 'weather.value': 'non-strict' } };",
      ) as (input: never) => unknown,
    ],
  ] as const)("admits an independent %s workflow", (_name, workflow) => {
    const { engine } = engineWithWorkflow(undefined, workflow);
    expect(invoke(engine, prepared(engine)).status).toBe("succeeded");
    expect(Object.isFrozen(workflow)).toBe(false);
  });

  it("enforces admitted capability intersection, bounds, and caller non-mutation", () => {
    const engine = new SkillEngine(authorities().configuration);
    engine.initialize();
    engine.start();
    engine.registerSkillManifest({
      intent: "register-skill-manifest",
      manifest: skillManifest(),
    });
    const validator = Object.assign(() => ({ status: "accepted" as const }), {
      callerMetadata: { mutable: true },
    });
    const workflow = Object.assign(
      () => ({
        status: "succeeded" as const,
        outputs: { "weather.value": "ok" },
      }),
      { callerMetadata: { mutable: true } },
    );
    for (const supportedCapabilities of [
      [],
      ["unrelated.capability"],
      ["weather.read", "weather.read"],
      Array.from({ length: 65 }, (_, index) => `capability.${index}`),
    ])
      expect(() =>
        engine.admitSkillWorkflow({
          intent: "admit-skill-workflow",
          skillId: "weather-reader",
          supportedCapabilities,
          validator,
          workflow,
        }),
      ).toThrow(InvalidSkillWorkflowAdmissionError);
    const source = ["forecast.read", "weather.read"];
    const admission = engine.admitSkillWorkflow({
      intent: "admit-skill-workflow",
      skillId: "weather-reader",
      supportedCapabilities: source,
      validator,
      workflow,
    });
    expect(admission.supportedCapabilities).toEqual([
      "forecast.read",
      "weather.read",
    ]);
    expect(source).toEqual(["forecast.read", "weather.read"]);
    expect(Object.isFrozen(source)).toBe(false);
    expect(Object.isFrozen(validator)).toBe(false);
    expect(Object.isFrozen(validator.callerMetadata)).toBe(false);
    expect(Object.isFrozen(workflow)).toBe(false);
    expect(Object.isFrozen(workflow.callerMetadata)).toBe(false);
  });

  it("accepts exactly 64 supported capabilities with canonical non-mutating capture", () => {
    const engine = new SkillEngine(authorities().configuration);
    engine.initialize();
    engine.start();
    const capabilities = Array.from(
      { length: 64 },
      (_, index) => `capability.${String(index).padStart(2, "0")}`,
    ).reverse();
    engine.registerSkillManifest({
      intent: "register-skill-manifest",
      manifest: {
        ...skillManifest("maximum-capabilities"),
        capabilities,
      },
    });
    const before = [...capabilities];
    const admission = engine.admitSkillWorkflow({
      intent: "admit-skill-workflow",
      skillId: "maximum-capabilities",
      supportedCapabilities: capabilities,
      validator: () => ({ status: "accepted" }),
      workflow: () => ({ status: "succeeded", outputs: {} }),
    });
    expect(admission.supportedCapabilities).toHaveLength(64);
    expect(admission.supportedCapabilities).toEqual([...capabilities].sort());
    expect(capabilities).toEqual(before);
    expect(Object.isFrozen(capabilities)).toBe(false);
  });

  it("hostile-safely validates the exact admission envelope", () => {
    const engine = new SkillEngine(authorities().configuration);
    engine.initialize();
    engine.start();
    engine.registerSkillManifest({
      intent: "register-skill-manifest",
      manifest: skillManifest(),
    });
    const valid = {
      intent: "admit-skill-workflow",
      skillId: "weather-reader",
      supportedCapabilities: ["weather.read"],
      validator: () => ({ status: "accepted" }),
      workflow: () => ({ status: "succeeded", outputs: {} }),
    };
    let getters = 0;
    const accessor = { ...valid };
    Object.defineProperty(accessor, "skillId", {
      enumerable: true,
      get() {
        getters += 1;
        return "weather-reader";
      },
    });
    const descriptor = new Proxy(valid, {
      getOwnPropertyDescriptor() {
        throw new Error("admission-secret");
      },
    });
    const revoked = Proxy.revocable(valid, {});
    revoked.revoke();
    for (const candidate of [
      null,
      {},
      { ...valid, extra: true },
      { ...valid, [Symbol("admission")]: true },
      Object.create(valid),
      accessor,
      descriptor,
      revoked.proxy,
    ])
      expect(() => engine.admitSkillWorkflow(candidate as never)).toThrow(
        InvalidSkillWorkflowAdmissionError,
      );
    expect(getters).toBe(0);
  });

  it("classifies callable admission candidates without receiver or metadata authority", () => {
    const engine = new SkillEngine(authorities().configuration);
    engine.initialize();
    engine.start();
    engine.registerSkillManifest({
      intent: "register-skill-manifest",
      manifest: skillManifest(),
    });
    const holder = {
      validator() {
        return { status: "accepted" as const };
      },
      workflow() {
        return {
          status: "succeeded" as const,
          outputs: { "weather.value": "ok" },
        };
      },
    };
    const validator = Object.assign(holder.validator, {
      authority: "ignored",
      mutable: { value: true },
    });
    const workflow = new Proxy(
      Object.assign(holder.workflow, {
        authority: "ignored",
        mutable: { value: true },
      }),
      {
        apply(target, thisArgument, argumentsList) {
          return Reflect.apply(target, thisArgument, argumentsList);
        },
      },
    );
    const admitted = engine.admitSkillWorkflow({
      intent: "admit-skill-workflow",
      skillId: "weather-reader",
      supportedCapabilities: ["weather.read"],
      validator,
      workflow,
    });
    expect(admitted.skillId).toBe("weather-reader");
    expect(Object.isFrozen(validator)).toBe(false);
    expect(Object.isFrozen(validator.mutable)).toBe(false);
    expect(Object.isFrozen(workflow)).toBe(false);
    expect(Object.isFrozen(workflow.mutable)).toBe(false);
  });

  it("contains reflective callable classification failure without invocation", () => {
    const engine = new SkillEngine(authorities().configuration);
    engine.initialize();
    engine.start();
    engine.registerSkillManifest({
      intent: "register-skill-manifest",
      manifest: skillManifest(),
    });
    let calls = 0;
    const hostile = new Proxy(
      () => {
        calls += 1;
        return { status: "accepted" };
      },
      {
        getPrototypeOf() {
          throw new Error("callable-reflection-secret");
        },
      },
    );
    expect(() =>
      engine.admitSkillWorkflow({
        intent: "admit-skill-workflow",
        skillId: "weather-reader",
        supportedCapabilities: ["weather.read"],
        validator: hostile,
        workflow: () => ({ status: "succeeded", outputs: {} }),
      }),
    ).toThrow(InvalidSkillWorkflowAdmissionError);
    expect(calls).toBe(0);
  });

  it("selects the lowest eligible Skill ID independent of registration order", () => {
    const engine = new SkillEngine(authorities().configuration);
    engine.initialize();
    engine.start();
    for (const id of ["zulu-skill", "alpha-skill"]) {
      engine.registerSkillManifest({
        intent: "register-skill-manifest",
        manifest: skillManifest(id),
      });
      engine.admitSkillWorkflow({
        intent: "admit-skill-workflow",
        skillId: id,
        supportedCapabilities: ["weather.read"],
        validator: () => ({ status: "accepted" }),
        workflow: () => ({
          status: "failed",
          failureMode: "weather.unavailable",
        }),
      });
    }
    const selected = engine.selectSkill({
      intent: "select-skill",
      capability: "weather.read",
    });
    expect(selected.status).toBe("selected");
    if (selected.status === "selected")
      expect(selected.binding.registeredSkill.id).toBe("alpha-skill");
  });

  it("covers zero, one, and registered-without-admission selection", () => {
    const engine = new SkillEngine(authorities().configuration);
    engine.initialize();
    engine.start();
    expect(
      engine.selectSkill({
        intent: "select-skill",
        capability: "weather.read",
      }),
    ).toMatchObject({
      status: "unavailable",
      reason: "no-invocation-eligible-skill",
    });
    engine.registerSkillManifest({
      intent: "register-skill-manifest",
      manifest: skillManifest("registered-only"),
    });
    expect(
      engine.selectSkill({
        intent: "select-skill",
        capability: "weather.read",
      }),
    ).toMatchObject({
      status: "unavailable",
      reason: "no-invocation-eligible-skill",
    });
    engine.admitSkillWorkflow({
      intent: "admit-skill-workflow",
      skillId: "registered-only",
      supportedCapabilities: ["weather.read"],
      validator: () => ({ status: "accepted" }),
      workflow: () => ({
        status: "succeeded",
        outputs: { "weather.value": "Lima" },
      }),
    });
    const selected = engine.selectSkill({
      intent: "select-skill",
      capability: "weather.read",
    });
    expect(selected.status).toBe("selected");
    if (selected.status === "selected")
      expect(selected.binding.registeredSkill.id).toBe("registered-only");
  });

  it("isolates catalog and admitted workflows between Skill instances", () => {
    const first = engineWithWorkflow().engine;
    const second = new SkillEngine(authorities().configuration);
    second.initialize();
    second.start();
    expect(
      first.selectSkill({
        intent: "select-skill",
        capability: "weather.read",
      }).status,
    ).toBe("selected");
    expect(
      second.selectSkill({
        intent: "select-skill",
        capability: "weather.read",
      }),
    ).toMatchObject({
      status: "unavailable",
      reason: "no-invocation-eligible-skill",
    });
  });

  it("hostile-safely validates selection without mutating its request", () => {
    const { engine } = engineWithWorkflow();
    const valid = { intent: "select-skill", capability: "weather.read" };
    const before = structuredClone(valid);
    const ownKeys = new Proxy(valid, {
      ownKeys() {
        throw new Error("selection-secret");
      },
    });
    const revoked = Proxy.revocable(valid, {});
    revoked.revoke();
    for (const candidate of [
      null,
      {},
      { ...valid, extra: true },
      { ...valid, [Symbol("selection")]: true },
      Object.create(valid),
      ownKeys,
      revoked.proxy,
    ])
      expect(() => engine.selectSkill(candidate as never)).toThrow();
    expect(valid).toEqual(before);
    expect(Object.isFrozen(valid)).toBe(false);
  });

  it("keeps deterministic selection across opposite admission order and versions", () => {
    const engine = new SkillEngine(authorities().configuration);
    engine.initialize();
    engine.start();
    for (const [id, version] of [
      ["alpha-skill", "9.0.0"],
      ["zeta-skill", "0.0.1"],
    ] as const)
      engine.registerSkillManifest({
        intent: "register-skill-manifest",
        manifest: { ...skillManifest(id), version },
      });
    for (const id of ["zeta-skill", "alpha-skill"])
      engine.admitSkillWorkflow({
        intent: "admit-skill-workflow",
        skillId: id,
        supportedCapabilities: ["weather.read"],
        validator: () => ({ status: "accepted" }),
        workflow: () => ({
          status: "succeeded",
          outputs: { "weather.value": "Lima" },
        }),
      });
    const selected = engine.selectSkill({
      intent: "select-skill",
      capability: "weather.read",
    });
    expect(selected.status).toBe("selected");
    if (selected.status === "selected") {
      expect(selected.binding.registeredSkill.id).toBe("alpha-skill");
      expect(selected.binding.registeredSkill.version).toBe("9.0.0");
    }
    for (let index = 0; index < 5; index += 1) {
      const repeated = engine.selectSkill({
        capability: "weather.read",
        intent: "select-skill",
      });
      expect(repeated.status).toBe("selected");
      if (repeated.status === "selected")
        expect(repeated.binding.registeredSkill.id).toBe("alpha-skill");
    }
  });

  it("keeps selection independent of source property and candidate insertion order", () => {
    const build = (ids: readonly string[], reverseProperties: boolean) => {
      const engine = new SkillEngine(authorities().configuration);
      engine.initialize();
      engine.start();
      for (const id of ids) {
        const source = skillManifest(id);
        const manifest = reverseProperties
          ? Object.fromEntries(Object.entries(source).reverse())
          : source;
        engine.registerSkillManifest({
          manifest: manifest as ReturnType<typeof skillManifest>,
          intent: "register-skill-manifest",
        });
      }
      for (const id of [...ids].reverse())
        engine.admitSkillWorkflow({
          workflow: () => ({
            status: "succeeded",
            outputs: { "weather.value": id },
          }),
          validator: () => ({ status: "accepted" }),
          supportedCapabilities: ["weather.read"],
          skillId: id,
          intent: "admit-skill-workflow",
        });
      return engine;
    };
    const first = build(["zeta-skill", "alpha-skill"], false);
    const second = build(["alpha-skill", "zeta-skill"], true);
    for (const engine of [first, second]) {
      const selection = engine.selectSkill({
        capability: "weather.read",
        intent: "select-skill",
      });
      expect(selection.status).toBe("selected");
      if (selection.status === "selected")
        expect(selection.binding.registeredSkill.id).toBe("alpha-skill");
    }
  });

  it("contains corrupt private selection authority state and remains usable", () => {
    const { engine } = engineWithWorkflow();
    expect(
      engine.selectSkill({
        intent: "select-skill",
        capability: "weather.read",
      }).status,
    ).toBe("selected");
    const original = WeakSet.prototype.has;
    const spy = vi.spyOn(WeakSet.prototype, "has").mockImplementation(function (
      this: WeakSet<WeakKey>,
      value: WeakKey,
    ) {
      if (
        typeof value === "object" &&
        value !== null &&
        Object.hasOwn(value, "supportedCapabilities")
      )
        throw new Error("corrupt-admission-state");
      return Reflect.apply(original, this, [value]);
    });
    try {
      expect(() =>
        engine.selectSkill({
          intent: "select-skill",
          capability: "weather.read",
        }),
      ).toThrow(InvalidSkillExecutionStateError);
    } finally {
      spy.mockRestore();
    }
    expect(
      engine.selectSkill({
        intent: "select-skill",
        capability: "weather.read",
      }).status,
    ).toBe("selected");
  });

  it("excludes admitted workflows outside the exact manifest capability intersection", () => {
    const engine = new SkillEngine(authorities().configuration);
    engine.initialize();
    engine.start();
    engine.registerSkillManifest({
      intent: "register-skill-manifest",
      manifest: skillManifest("intersection-skill"),
    });
    engine.admitSkillWorkflow({
      intent: "admit-skill-workflow",
      skillId: "intersection-skill",
      supportedCapabilities: ["forecast.read"],
      validator: () => ({ status: "accepted" }),
      workflow: () => ({ status: "succeeded", outputs: {} }),
    });
    expect(
      engine.selectSkill({
        intent: "select-skill",
        capability: "weather.read",
      }),
    ).toMatchObject({
      status: "unavailable",
      reason: "no-invocation-eligible-skill",
    });
  });

  it("rejects fabricated and cross-instance bindings", () => {
    const first = engineWithWorkflow().engine;
    const second = engineWithWorkflow().engine;
    const selected = first.selectSkill({
      intent: "select-skill",
      capability: "weather.read",
    });
    if (selected.status !== "selected") throw new Error("fixture");
    expect(() =>
      first.bindSkillToOperation({
        intent: "bind-skill-to-operation",
        operationId: "operation-1",
        binding: { ...selected.binding },
      }),
    ).toThrow(InvalidSkillAuthorityError);
    expect(() =>
      second.bindSkillToOperation({
        intent: "bind-skill-to-operation",
        operationId: "operation-1",
        binding: selected.binding,
      }),
    ).toThrow(InvalidSkillAuthorityError);
  });

  it("contains corrupt private Binding authority state and remains usable", () => {
    const { engine } = engineWithWorkflow();
    const selection = engine.selectSkill({
      intent: "select-skill",
      capability: "weather.read",
    });
    if (selection.status !== "selected") throw new Error("fixture");
    const original = WeakSet.prototype.has;
    const spy = vi.spyOn(WeakSet.prototype, "has").mockImplementation(function (
      this: WeakSet<WeakKey>,
      value: WeakKey,
    ) {
      if (value === selection.binding) throw new Error("corrupt-binding-state");
      return Reflect.apply(original, this, [value]);
    });
    try {
      expect(() =>
        engine.bindSkillToOperation({
          intent: "bind-skill-to-operation",
          operationId: "binding-corrupt",
          binding: selection.binding,
        }),
      ).toThrow(InvalidSkillExecutionStateError);
    } finally {
      spy.mockRestore();
    }
    expect(
      engine.bindSkillToOperation({
        intent: "bind-skill-to-operation",
        operationId: "binding-recovered",
        binding: selection.binding,
      }).operationId,
    ).toBe("binding-recovered");
  });

  it("rejects binding clones, spreads, reconstructions, and wrong operations", () => {
    const { engine } = engineWithWorkflow();
    const selection = engine.selectSkill({
      intent: "select-skill",
      capability: "weather.read",
    });
    if (selection.status !== "selected") throw new Error("fixture");
    for (const binding of [
      { ...selection.binding },
      structuredClone(selection.binding),
      JSON.parse(JSON.stringify(selection.binding)),
    ])
      expect(() =>
        engine.bindSkillToOperation({
          intent: "bind-skill-to-operation",
          operationId: "binding-operation",
          binding,
        }),
      ).toThrow(InvalidSkillAuthorityError);
    for (const operationId of ["", " wrong", "operation value with spaces"])
      expect(() =>
        engine.bindSkillToOperation({
          intent: "bind-skill-to-operation",
          operationId,
          binding: selection.binding,
        }),
      ).toThrow(InvalidBoundSkillTargetInputError);
    for (const operationId of ["a", "a".repeat(128)]) {
      const target = engine.bindSkillToOperation({
        intent: "bind-skill-to-operation",
        operationId,
        binding: selection.binding,
      });
      expect(target.operationId).toBe(operationId);
    }
    expect(() =>
      engine.bindSkillToOperation({
        intent: "bind-skill-to-operation",
        operationId: "a".repeat(129),
        binding: selection.binding,
      }),
    ).toThrow(InvalidBoundSkillTargetInputError);
  });

  it("binds the complete canonical catalog snapshot and resists caller mutation", () => {
    const ports = authorities();
    const engine = new SkillEngine(ports.configuration);
    engine.initialize();
    engine.start();
    const manifest = {
      ...skillManifest(),
      permissions: ["z.permission", "a.permission"],
      inputs: ["z.input", "a.input"],
      outputs: ["z.output", "a.output"],
      failureModes: ["z.failure", "a.failure"],
    };
    const before = structuredClone(manifest);
    engine.registerSkillManifest({
      intent: "register-skill-manifest",
      manifest,
    });
    engine.admitSkillWorkflow({
      intent: "admit-skill-workflow",
      skillId: manifest.id,
      supportedCapabilities: ["weather.read"],
      validator: () => ({ status: "accepted" }),
      workflow: () => ({
        status: "succeeded",
        outputs: { "a.output": "a", "z.output": "z" },
      }),
    });
    manifest.permissions.push("later.permission");
    manifest.inputs.push("later.input");
    manifest.outputs.push("later.output");
    manifest.failureModes.push("later.failure");
    const selection = engine.selectSkill({
      intent: "select-skill",
      capability: "weather.read",
    });
    if (selection.status !== "selected") throw new Error("fixture");
    const target = engine.bindSkillToOperation({
      intent: "bind-skill-to-operation",
      operationId: "a".repeat(128),
      binding: selection.binding,
    });
    expect(target).toMatchObject({
      operationId: "a".repeat(128),
      skillId: before.id,
      skillVersion: before.version,
      capability: "weather.read",
      action: "skill.invoke",
      resource: { kind: "identified", resourceId: `skill:${before.id}` },
      requiredPermissions: ["a.permission", "z.permission"],
      inputNames: ["a.input", "z.input"],
      outputNames: ["a.output", "z.output"],
      failureModes: ["a.failure", "z.failure"],
    });
    expect(Object.isFrozen(target)).toBe(true);
    expect(Object.isFrozen(target.requiredPermissions)).toBe(true);
    expect(Object.isFrozen(target.inputNames)).toBe(true);
    expect(Object.isFrozen(target.outputNames)).toBe(true);
    expect(Object.isFrozen(target.failureModes)).toBe(true);
    expect(Object.isFrozen(manifest)).toBe(false);
    expect(Object.isFrozen(manifest.permissions)).toBe(false);
  });

  it("rejects every permission-tampered Binding and preserves canonical authority", () => {
    const { engine } = engineWithWorkflow();
    const selection = engine.selectSkill({
      intent: "select-skill",
      capability: "weather.read",
    });
    if (selection.status !== "selected") throw new Error("fixture");
    const canonical = selection.binding.registeredSkill.permissions;
    expect(canonical).toEqual(["weather.read"]);
    const alteredPermissions = [
      [],
      [...canonical, "weather.write"],
      ["weather.write"],
      [...canonical].reverse(),
    ];
    for (const permissions of alteredPermissions) {
      const altered = {
        ...selection.binding,
        registeredSkill: {
          ...selection.binding.registeredSkill,
          permissions,
        },
      };
      expect(() =>
        engine.bindSkillToOperation({
          intent: "bind-skill-to-operation",
          operationId: `permission-tamper-${permissions.length}`,
          binding: altered,
        }),
      ).toThrow(InvalidSkillAuthorityError);
    }
    expect(() =>
      (canonical as unknown as string[]).push("weather.write"),
    ).toThrow(TypeError);
    const target = engine.bindSkillToOperation({
      intent: "bind-skill-to-operation",
      operationId: "permission-canonical",
      binding: selection.binding,
    });
    expect(target.requiredPermissions).toEqual(["weather.read"]);
    expect(Object.isFrozen(target.requiredPermissions)).toBe(true);
  });

  it("hostile-safely validates the exact Bind envelope before authority use", () => {
    const { engine } = engineWithWorkflow();
    const selection = engine.selectSkill({
      intent: "select-skill",
      capability: "weather.read",
    });
    if (selection.status !== "selected") throw new Error("fixture");
    const valid = {
      intent: "bind-skill-to-operation",
      operationId: "binding-operation",
      binding: selection.binding,
    };
    let reads = 0;
    const accessor = { ...valid };
    Object.defineProperty(accessor, "binding", {
      enumerable: true,
      get() {
        reads += 1;
        return selection.binding;
      },
    });
    const revoked = Proxy.revocable(valid, {});
    revoked.revoke();
    for (const candidate of [
      null,
      {},
      { ...valid, extra: true },
      { ...valid, [Symbol("binding")]: true },
      Object.create(valid),
      accessor,
      revoked.proxy,
    ])
      expect(() => engine.bindSkillToOperation(candidate as never)).toThrow(
        InvalidBoundSkillTargetInputError,
      );
    expect(reads).toBe(0);
  });

  it("executes matching governed ALLOW and mints result authority", () => {
    const { engine } = engineWithWorkflow();
    const values = prepared(engine);
    const result = invoke(engine, values);
    expect(result.status).toBe("succeeded");
    if (result.status === "succeeded") {
      expect(result.outputs["weather.value"]).toBe("Lima");
      expect(Object.getPrototypeOf(result.outputs)).toBeNull();
      expect(Object.isFrozen(result.outputs)).toBe(true);
    }
    expect(
      engine.normalizedResultVerifier.verify(result, {
        operationId: "operation-1" as never,
        skillId: "weather-reader" as never,
        skillVersion: "1.0.0" as never,
        capability: "weather.read" as never,
      }),
    ).toBe(true);
    expect(
      engine.normalizedResultVerifier.verify(
        { ...result },
        {
          operationId: "operation-1" as never,
          skillId: "weather-reader" as never,
          skillVersion: "1.0.0" as never,
          capability: "weather.read" as never,
        },
      ),
    ).toBe(false);
  });

  it("isolates normalized result authority from clones and other instances", () => {
    const first = engineWithWorkflow().engine;
    const second = engineWithWorkflow().engine;
    const result = invoke(first, prepared(first));
    const expected = {
      operationId: "operation-1" as never,
      skillId: "weather-reader" as never,
      skillVersion: "1.0.0" as never,
      capability: "weather.read" as never,
    };
    for (const candidate of [
      { ...result },
      structuredClone(result),
      JSON.parse(JSON.stringify(result)),
    ])
      expect(first.normalizedResultVerifier.verify(candidate, expected)).toBe(
        false,
      );
    expect(second.normalizedResultVerifier.verify(result, expected)).toBe(
      false,
    );
    for (const mismatch of [
      { ...expected, operationId: "wrong-operation" as never },
      { ...expected, skillId: "wrong-skill" as never },
      { ...expected, skillVersion: "9.9.9" as never },
      { ...expected, capability: "forecast.read" as never },
    ])
      expect(first.normalizedResultVerifier.verify(result, mismatch)).toBe(
        false,
      );
    expect(Object.isFrozen(result)).toBe(true);
  });

  it("binds a declared-failure normalized result to exact authority fields", () => {
    const { engine } = engineWithWorkflow(undefined, () => ({
      status: "failed",
      failureMode: "weather.unavailable",
    }));
    const result = invoke(engine, prepared(engine, "declared-result"));
    expect(result).toEqual({
      operationId: "declared-result",
      skillId: "weather-reader",
      skillVersion: "1.0.0",
      capability: "weather.read",
      status: "failed",
      failureMode: "weather.unavailable",
    });
    expect(Object.isFrozen(result)).toBe(true);
    expect(
      engine.normalizedResultVerifier.verify(result, {
        operationId: "declared-result" as never,
        skillId: "weather-reader" as never,
        skillVersion: "1.0.0" as never,
        capability: "weather.read" as never,
      }),
    ).toBe(true);
  });

  it.each(["deny", "indeterminate"] as const)(
    "rejects governed %s before callbacks",
    (decision) => {
      const events: SkillInvocationLifecycleEvent[] = [];
      const validator = vi.fn(() => ({ status: "accepted" as const }));
      const workflow = vi.fn(() => ({
        status: "failed" as const,
        failureMode: "weather.unavailable",
      }));
      const { engine, ports } = engineWithWorkflow(validator, workflow, events);
      ports.setDecision(decision);
      const values = prepared(engine);
      expect(() => invoke(engine, values)).toThrow(
        SkillAuthorizationEnforcementError,
      );
      expect(validator).not.toHaveBeenCalled();
      expect(workflow).not.toHaveBeenCalled();
      expect(events.map((event) => event.category)).toEqual([
        "invocation-proposed",
        "authority-admitted",
        "pre-execution-rejected",
      ]);
    },
  );

  it.each([
    ["context", "not-applicable"],
    ["device", "available"],
    ["session", "available"],
    ["trustLevel", "available"],
  ] as const)(
    "rejects independent %s Summary mismatch before callbacks",
    (dimension, status) => {
      const events: SkillInvocationLifecycleEvent[] = [];
      const validator = vi.fn(() => ({ status: "accepted" as const }));
      const workflow = vi.fn(() => ({
        status: "succeeded" as const,
        outputs: { "weather.value": "never" },
      }));
      const { engine, ports } = engineWithWorkflow(validator, workflow, events);
      ports.setSummaryOverride({ [dimension]: status });
      const values = prepared(engine);
      expect(() => invoke(engine, values)).toThrow(
        SkillAuthorizationEnforcementError,
      );
      expect(validator).toHaveBeenCalledTimes(0);
      expect(workflow).toHaveBeenCalledTimes(0);
      expect(events.map((event) => event.category)).toEqual([
        "invocation-proposed",
        "authority-admitted",
        "pre-execution-rejected",
      ]);
    },
  );

  it("rejects naked/fabricated governed authorization and malformed envelope", () => {
    const { engine } = engineWithWorkflow();
    const values = prepared(engine);
    expect(() =>
      invoke(engine, {
        ...values,
        authorizationEvaluation: values.authorizationEvaluation
          .authorization as never,
      }),
    ).toThrow(InvalidGovernedAuthorizationEvaluationError);
    expect(() =>
      engine.invokeBoundSkill({
        intent: "invoke-bound-skill",
        operationId: "operation-1",
        target: values.target,
        requirements: values.requirements,
        inputs: { "location.value": "Lima" },
        context: values.context,
        authorizationEvaluation: undefined,
      }),
    ).toThrow(InvalidProtectedSkillInvocationInputError);
  });

  it("hostile-safely rejects every malformed Protected Invoke envelope", () => {
    const events: SkillInvocationLifecycleEvent[] = [];
    const { engine } = engineWithWorkflow(undefined, undefined, events);
    const values = prepared(engine);
    const exact = {
      intent: "invoke-bound-skill",
      operationId: values.target.operationId,
      ...values,
      inputs: { "location.value": "Lima" },
    };
    let getters = 0;
    const accessor = { ...exact };
    Object.defineProperty(accessor, "authorizationEvaluation", {
      enumerable: true,
      get() {
        getters += 1;
        return values.authorizationEvaluation;
      },
    });
    const ownKeys = new Proxy(exact, {
      ownKeys() {
        throw new Error("invoke-envelope-secret");
      },
    });
    const descriptor = new Proxy(exact, {
      getOwnPropertyDescriptor() {
        throw new Error("invoke-envelope-secret");
      },
    });
    const revoked = Proxy.revocable(exact, {});
    revoked.revoke();
    for (const candidate of [
      null,
      undefined,
      1,
      "invoke",
      true,
      1n,
      Symbol("invoke"),
      () => exact,
      [],
      {},
      { ...exact, authorizationEvaluation: undefined },
      { ...exact, extra: true },
      { ...exact, [Symbol("invoke")]: true },
      Object.create(exact),
      Object.assign(Object.create({ custom: true }), exact),
      accessor,
      ownKeys,
      descriptor,
      revoked.proxy,
    ])
      expect(() => engine.invokeBoundSkill(candidate as never)).toThrow(
        InvalidProtectedSkillInvocationInputError,
      );
    expect(getters).toBe(0);
    expect(events).toHaveLength(0);
  });

  it.each([
    "intent",
    "operationId",
    "target",
    "context",
    "requirements",
    "authorizationEvaluation",
    "inputs",
  ] as const)(
    "rejects independently missing and undefined Protected Invoke field %s",
    (field) => {
      const events: SkillInvocationLifecycleEvent[] = [];
      const { engine } = engineWithWorkflow(undefined, undefined, events);
      const values = prepared(engine, `missing-${field}`);
      const exact = {
        intent: "invoke-bound-skill" as const,
        operationId: values.target.operationId,
        ...values,
        inputs: { "location.value": "Lima" },
      };
      const missing = { ...exact } as Record<string, unknown>;
      delete missing[field];
      expect(() => engine.invokeBoundSkill(missing)).toThrow(
        InvalidProtectedSkillInvocationInputError,
      );
      expect(() =>
        engine.invokeBoundSkill({ ...exact, [field]: undefined }),
      ).toThrow(InvalidProtectedSkillInvocationInputError);
      expect(events).toHaveLength(0);
    },
  );

  it("rejects a stateful Protected Invoke field without executing it", () => {
    const { engine } = engineWithWorkflow();
    const values = prepared(engine, "stateful-envelope");
    const candidate = {
      intent: "invoke-bound-skill",
      operationId: values.target.operationId,
      ...values,
      inputs: { "location.value": "Lima" },
    };
    let reads = 0;
    Object.defineProperty(candidate, "target", {
      enumerable: true,
      get() {
        reads += 1;
        return values.target;
      },
    });
    expect(() => engine.invokeBoundSkill(candidate as never)).toThrow(
      InvalidProtectedSkillInvocationInputError,
    );
    expect(reads).toBe(0);
  });

  it("proves every remaining Protected Invoke precedence adjacency", () => {
    const events: SkillInvocationLifecycleEvent[] = [];
    const validator = vi.fn(() => ({ status: "accepted" as const }));
    const workflow = vi.fn(() => ({
      status: "succeeded" as const,
      outputs: { "weather.value": "Lima" },
    }));
    const { engine, ports } = engineWithWorkflow(validator, workflow, events);
    const values = prepared(engine, "protected-precedence");
    validator.mockClear();
    workflow.mockClear();

    let operationSyntaxReads = 0;
    const hostileOperation = new Proxy(
      {},
      {
        getPrototypeOf() {
          operationSyntaxReads += 1;
          throw new Error("later-operation-syntax");
        },
      },
    );
    let invocationCalls = 0;
    const malformedEnvelope = () => {
      invocationCalls += 1;
      return engine.invokeBoundSkill({
        operationId: hostileOperation,
        target: values.target,
        requirements: values.requirements,
        inputs: { "location.value": "Lima" },
        context: values.context,
        authorizationEvaluation: values.authorizationEvaluation,
      });
    };
    expect(malformedEnvelope).toThrow(
      InvalidProtectedSkillInvocationInputError,
    );
    expect(invocationCalls).toBe(1);
    expect(operationSyntaxReads).toBe(0);
    expect(validator).toHaveBeenCalledTimes(0);
    expect(workflow).toHaveBeenCalledTimes(0);

    let semanticInputReads = 0;
    const hostileInputs = new Proxy(
      {},
      {
        ownKeys() {
          semanticInputReads += 1;
          throw new Error("later-semantic-enforcement");
        },
      },
    );
    ports.forceAuthorizationVerifier(true);
    invocationCalls = 0;
    const malformedStructure = () => {
      invocationCalls += 1;
      return invoke(
        engine,
        {
          ...values,
          authorizationEvaluation: {} as AuthorizationEvaluationOutcome,
        },
        hostileInputs,
      );
    };
    expect(malformedStructure).toThrow(
      InvalidGovernedAuthorizationEvaluationError,
    );
    expect(invocationCalls).toBe(1);
    expect(semanticInputReads).toBe(0);
    expect(events.map((event) => event.category)).toEqual([
      "invocation-proposed",
      "pre-execution-rejected",
    ]);
    expect(validator).toHaveBeenCalledTimes(0);
    expect(workflow).toHaveBeenCalledTimes(0);
    ports.forceAuthorizationVerifier(undefined);

    invocationCalls = 0;
    const invalidInputs = () => {
      invocationCalls += 1;
      return invoke(engine, values, {});
    };
    expect(invalidInputs).toThrow(InvalidProtectedSkillInvocationInputError);
    expect(invocationCalls).toBe(1);
    expect(validator).toHaveBeenCalledTimes(0);
    expect(workflow).toHaveBeenCalledTimes(0);

    const invalidValidator = vi.fn(() => ({}));
    const blockedWorkflow = vi.fn();
    const validatorEngine = engineWithWorkflow(
      invalidValidator,
      blockedWorkflow,
    ).engine;
    invocationCalls = 0;
    const invalidValidationResult = () => {
      invocationCalls += 1;
      return invoke(validatorEngine, prepared(validatorEngine));
    };
    expect(invalidValidationResult).toThrow(InvalidSkillValidationResultError);
    expect(invocationCalls).toBe(1);
    expect(invalidValidator).toHaveBeenCalledTimes(1);
    expect(blockedWorkflow).toHaveBeenCalledTimes(0);

    const acceptedValidator = vi.fn(() => ({ status: "accepted" as const }));
    const malformedWorkflow = vi.fn(() => ({}));
    const workflowEngine = engineWithWorkflow(
      acceptedValidator,
      malformedWorkflow,
    ).engine;
    const workflowValues = prepared(workflowEngine);
    acceptedValidator.mockClear();
    malformedWorkflow.mockClear();
    let normalizedConstructions = 0;
    const originalFreeze = Object.freeze;
    const normalizedCounter = vi
      .spyOn(Object, "freeze")
      .mockImplementation(<T>(value: T): Readonly<T> => {
        if (
          typeof value === "object" &&
          value !== null &&
          Reflect.getOwnPropertyDescriptor(value, "skillVersion") !==
            undefined &&
          Reflect.getOwnPropertyDescriptor(value, "status") !== undefined
        )
          normalizedConstructions += 1;
        return originalFreeze(value);
      });
    invocationCalls = 0;
    try {
      const invalidWorkflowResult = () => {
        invocationCalls += 1;
        return invoke(workflowEngine, workflowValues);
      };
      expect(invalidWorkflowResult).toThrow(InvalidSkillWorkflowResultError);
    } finally {
      normalizedCounter.mockRestore();
    }
    expect(invocationCalls).toBe(1);
    expect(acceptedValidator).toHaveBeenCalledTimes(1);
    expect(malformedWorkflow).toHaveBeenCalledTimes(1);
    expect(normalizedConstructions).toBe(0);
  });

  it("rejects every non-issued Outcome representation before callbacks", () => {
    const validator = vi.fn(() => ({ status: "accepted" as const }));
    const workflow = vi.fn();
    const events: SkillInvocationLifecycleEvent[] = [];
    const { engine } = engineWithWorkflow(validator, workflow, events);
    const values = prepared(engine);
    const other = engineWithWorkflow().engine;
    const otherValues = prepared(other, values.target.operationId);
    const factory = createAuthorizationEvaluationOutcome({
      authorization: values.authorizationEvaluation.authorization,
      securityEvaluationSummary:
        values.authorizationEvaluation.securityEvaluationSummary,
    });
    for (const authorizationEvaluation of [
      values.authorizationEvaluation.authorization,
      values.authorizationEvaluation.securityEvaluationSummary,
      factory,
      { ...values.authorizationEvaluation },
      structuredClone(values.authorizationEvaluation),
      JSON.parse(JSON.stringify(values.authorizationEvaluation)),
      {
        authorization: values.authorizationEvaluation.authorization,
        securityEvaluationSummary:
          otherValues.authorizationEvaluation.securityEvaluationSummary,
      },
      {
        authorization: otherValues.authorizationEvaluation.authorization,
        securityEvaluationSummary:
          values.authorizationEvaluation.securityEvaluationSummary,
      },
      {
        authorization: values.authorizationEvaluation.authorization,
        securityEvaluationSummary:
          values.authorizationEvaluation.securityEvaluationSummary,
        legacyAuthorization: values.authorizationEvaluation.authorization,
      },
      otherValues.authorizationEvaluation,
    ]) {
      events.length = 0;
      expect(() =>
        invoke(engine, {
          ...values,
          authorizationEvaluation:
            authorizationEvaluation as AuthorizationEvaluationOutcome,
        }),
      ).toThrow(InvalidGovernedAuthorizationEvaluationError);
      expect(events.map((event) => event.category)).toEqual([
        "invocation-proposed",
        "pre-execution-rejected",
      ]);
    }
    expect(validator).toHaveBeenCalledTimes(0);
    expect(workflow).toHaveBeenCalledTimes(0);
  });

  it("uses undefined thisArg at validator and workflow call sites", () => {
    const seen: unknown[] = [];
    const argumentCounts: number[] = [];
    const argumentKeys: string[][] = [];
    const validator = new Proxy(() => ({ status: "accepted" as const }), {
      apply(target, thisArg, argumentsList) {
        seen.push(thisArg);
        argumentCounts.push(argumentsList.length);
        argumentKeys.push(Object.keys(argumentsList[0] as object));
        return Reflect.apply(target, thisArg, argumentsList);
      },
    });
    const workflow = new Proxy(
      () => ({
        status: "succeeded" as const,
        outputs: { "weather.value": "ok" },
      }),
      {
        apply(target, thisArg, argumentsList) {
          seen.push(thisArg);
          argumentCounts.push(argumentsList.length);
          argumentKeys.push(Object.keys(argumentsList[0] as object));
          return Reflect.apply(target, thisArg, argumentsList);
        },
      },
    );
    const { engine } = engineWithWorkflow(validator, workflow);
    invoke(engine, prepared(engine));
    expect(seen).toEqual([undefined, undefined]);
    expect(argumentCounts).toEqual([1, 1]);
    expect(argumentKeys).toEqual([
      ["operationId", "capability", "inputs", "context"],
      ["operationId", "capability", "inputs", "context"],
    ]);
    expect(Object.isFrozen(validator)).toBe(false);
    expect(Object.isFrozen(workflow)).toBe(false);
  });

  it("supplies one deeply frozen explicit argument to validator and workflow", () => {
    const argumentsSeen: unknown[] = [];
    const validator = vi.fn((argument: unknown) => {
      argumentsSeen.push(argument);
      return { status: "accepted" };
    });
    const workflow = vi.fn((argument: unknown) => {
      argumentsSeen.push(argument);
      return { status: "succeeded", outputs: { "weather.value": "ok" } };
    });
    const { engine } = engineWithWorkflow(validator, workflow);
    invoke(engine, prepared(engine));
    expect(validator).toHaveBeenCalledTimes(1);
    expect(workflow).toHaveBeenCalledTimes(1);
    expect(argumentsSeen[0]).toBe(argumentsSeen[1]);
    const argument = argumentsSeen[0] as {
      inputs: object;
      context: { subject: object };
    };
    expect(Object.isFrozen(argument)).toBe(true);
    expect(Object.isFrozen(argument.inputs)).toBe(true);
    expect(Object.isFrozen(argument.context)).toBe(true);
    expect(Object.isFrozen(argument.context.subject)).toBe(true);
  });

  it("maps validator rejection and invalid async return without workflow", () => {
    const workflow = vi.fn(() => ({
      status: "failed" as const,
      failureMode: "weather.unavailable",
    }));
    const rejected = engineWithWorkflow(
      () => ({ status: "rejected" }),
      workflow,
    ).engine;
    expect(() => invoke(rejected, prepared(rejected))).toThrow(
      SkillInputValidationError,
    );
    expect(workflow).not.toHaveBeenCalled();
    const promised = engineWithWorkflow(
      () => Promise.resolve({ status: "accepted" }),
      workflow,
    ).engine;
    expect(() => invoke(promised, prepared(promised))).toThrow(
      InvalidSkillValidationResultError,
    );
  });

  it("normalizes declared failure and rejects invalid workflow results", () => {
    const failed = engineWithWorkflow(undefined, () => ({
      status: "failed",
      failureMode: "weather.unavailable",
    })).engine;
    expect(invoke(failed, prepared(failed))).toMatchObject({
      status: "failed",
      failureMode: "weather.unavailable",
    });
    const invalid = engineWithWorkflow(undefined, () => ({
      status: "failed",
      failureMode: "undeclared.failure",
    })).engine;
    expect(() => invoke(invalid, prepared(invalid))).toThrow(
      InvalidSkillWorkflowResultError,
    );
  });

  it("emits exact privacy-safe lifecycle transitions", () => {
    const events: SkillInvocationLifecycleEvent[] = [];
    const { engine } = engineWithWorkflow(undefined, undefined, events);
    invoke(engine, prepared(engine));
    expect(
      events.map(({ sequence, from, to, category }) => ({
        sequence,
        from,
        to,
        category,
      })),
    ).toEqual([
      {
        sequence: 1,
        from: "none",
        to: "proposed",
        category: "invocation-proposed",
      },
      {
        sequence: 2,
        from: "proposed",
        to: "admitted",
        category: "authority-admitted",
      },
      {
        sequence: 3,
        from: "admitted",
        to: "authorized",
        category: "authorization-accepted",
      },
      {
        sequence: 4,
        from: "authorized",
        to: "input-validated",
        category: "input-accepted",
      },
      {
        sequence: 5,
        from: "input-validated",
        to: "executing",
        category: "workflow-started",
      },
      {
        sequence: 6,
        from: "executing",
        to: "succeeded",
        category: "execution-succeeded",
      },
    ]);
    expect(events.every((event) => Object.isFrozen(event))).toBe(true);
  });

  it("contains observer throws and restarts event sequence per invocation", () => {
    const events: SkillInvocationLifecycleEvent[] = [];
    let throwOnce = true;
    const ports = authorities(events);
    (
      ports.configuration as {
        lifecycleObserver?: (event: SkillInvocationLifecycleEvent) => void;
      }
    ).lifecycleObserver = (event: SkillInvocationLifecycleEvent) => {
      events.push(event);
      if (throwOnce) {
        throwOnce = false;
        throw new Error("observer-secret");
      }
    };
    const engine = startWithPorts(ports);
    expect(invoke(engine, prepared(engine, "observer-one")).status).toBe(
      "succeeded",
    );
    expect(invoke(engine, prepared(engine, "observer-two")).status).toBe(
      "succeeded",
    );
    expect(events.filter((event) => event.sequence === 1)).toHaveLength(2);
    expect(events.every((event) => Object.isFrozen(event))).toBe(true);
  });

  it("contains normalized-result construction failure and remains usable", () => {
    const events: SkillInvocationLifecycleEvent[] = [];
    const validator = vi.fn(() => ({ status: "accepted" as const }));
    const workflow = vi.fn((input: SkillValidatorInput) => ({
      status: "succeeded" as const,
      outputs: { "weather.value": input.inputs["location.value"] },
    }));
    const { engine } = engineWithWorkflow(validator, workflow, events);
    expect(invoke(engine, prepared(engine, "normalize-before")).status).toBe(
      "succeeded",
    );
    expect(validator).toHaveBeenCalledTimes(1);
    expect(workflow).toHaveBeenCalledTimes(1);
    validator.mockClear();
    workflow.mockClear();
    events.length = 0;
    const original = Object.freeze;
    let failed = false;
    const spy = vi.spyOn(Object, "freeze").mockImplementation((value) => {
      if (
        !failed &&
        typeof value === "object" &&
        value !== null &&
        Object.hasOwn(value, "skillVersion") &&
        Object.hasOwn(value, "status")
      ) {
        failed = true;
        throw new Error("isolated-normalized-construction");
      }
      return original(value);
    });
    try {
      expect(() =>
        invoke(engine, prepared(engine, "normalize-failure")),
      ).toThrow(InvalidSkillExecutionStateError);
    } finally {
      spy.mockRestore();
    }
    expect(validator).toHaveBeenCalledTimes(1);
    expect(workflow).toHaveBeenCalledTimes(1);
    expect(events.map((event) => event.category)).toEqual([
      "invocation-proposed",
      "authority-admitted",
      "authorization-accepted",
      "input-accepted",
      "workflow-started",
      "execution-failed",
    ]);
    expect(events.map(({ from, to }) => ({ from, to }))).toEqual([
      { from: "none", to: "proposed" },
      { from: "proposed", to: "admitted" },
      { from: "admitted", to: "authorized" },
      { from: "authorized", to: "input-validated" },
      { from: "input-validated", to: "executing" },
      { from: "executing", to: "failed" },
    ]);
    expect(events.at(-1)).toMatchObject({
      from: "executing",
      to: "failed",
      category: "execution-failed",
    });
    expect(validator).toHaveBeenCalledTimes(1);
    expect(workflow).toHaveBeenCalledTimes(1);
    events.length = 0;
    expect(invoke(engine, prepared(engine, "normalize-after")).status).toBe(
      "succeeded",
    );
    expect(validator).toHaveBeenCalledTimes(2);
    expect(workflow).toHaveBeenCalledTimes(2);
    expect(events.map((event) => event.sequence)).toEqual([1, 2, 3, 4, 5, 6]);
  });

  it("asserts exact no-lifecycle terminal rows with zero callbacks and no retry", () => {
    const stoppedEvents: SkillInvocationLifecycleEvent[] = [];
    const stoppedValidator = vi.fn();
    const stoppedWorkflow = vi.fn();
    const stopped = startWithPorts(
      authorities(stoppedEvents),
      stoppedValidator,
      stoppedWorkflow,
    );
    stoppedValidator.mockClear();
    stoppedWorkflow.mockClear();
    stopped.stop();
    let stoppedInvocations = 0;
    let stoppedFailure: unknown;
    try {
      stoppedInvocations += 1;
      stopped.invokeBoundSkill(
        new Proxy(
          {},
          {
            ownKeys() {
              throw new Error("must-not-inspect");
            },
          },
        ),
      );
    } catch (error) {
      stoppedFailure = error;
    }
    expect(stoppedFailure?.constructor).toBe(InvalidSkillExecutionStateError);
    expect(stoppedInvocations).toBe(1);
    expect(stoppedEvents).toEqual([]);
    expect(stoppedValidator).toHaveBeenCalledTimes(0);
    expect(stoppedWorkflow).toHaveBeenCalledTimes(0);

    const malformedEvents: SkillInvocationLifecycleEvent[] = [];
    const malformedValidator = vi.fn();
    const malformedWorkflow = vi.fn();
    const { engine } = engineWithWorkflow(
      malformedValidator,
      malformedWorkflow,
      malformedEvents,
    );
    malformedValidator.mockClear();
    malformedWorkflow.mockClear();
    let malformedInvocations = 0;
    let malformedFailure: unknown;
    try {
      malformedInvocations += 1;
      engine.invokeBoundSkill({
        intent: "invoke-bound-skill",
        operationId: " invalid",
      });
    } catch (error) {
      malformedFailure = error;
    }
    expect(malformedFailure?.constructor).toBe(
      InvalidProtectedSkillInvocationInputError,
    );
    expect(malformedInvocations).toBe(1);
    expect(malformedEvents).toEqual([]);
    expect(malformedValidator).toHaveBeenCalledTimes(0);
    expect(malformedWorkflow).toHaveBeenCalledTimes(0);
  });

  it("asserts the exact mixed-evaluation Outcome lifecycle row", () => {
    const events: SkillInvocationLifecycleEvent[] = [];
    const validator = vi.fn(() => ({ status: "accepted" as const }));
    const workflow = vi.fn();
    const ports = authorities(events);
    const authorization = ports.configuration.authorization as unknown as {
      verifyAuthorizationEvaluationOutcome: (request: unknown) => boolean;
    };
    const originalVerify = authorization.verifyAuthorizationEvaluationOutcome;
    const verifier = vi.fn((request: unknown) =>
      Reflect.apply(originalVerify, undefined, [request]),
    );
    authorization.verifyAuthorizationEvaluationOutcome = verifier;
    const engine = startWithPorts(ports, validator, workflow);
    const other = engineWithWorkflow().engine;
    const values = prepared(engine, "mixed-lifecycle");
    const otherValues = prepared(other, "mixed-lifecycle");
    const mixed = {
      authorization: values.authorizationEvaluation.authorization,
      securityEvaluationSummary:
        otherValues.authorizationEvaluation.securityEvaluationSummary,
    } as AuthorizationEvaluationOutcome;
    verifier.mockClear();
    validator.mockClear();
    workflow.mockClear();
    let invocationCalls = 0;
    let failure: unknown;
    try {
      invocationCalls += 1;
      invoke(engine, {
        ...values,
        authorizationEvaluation: mixed,
      });
    } catch (error) {
      failure = error;
    }
    expect(failure?.constructor).toBe(
      InvalidGovernedAuthorizationEvaluationError,
    );
    expect(invocationCalls).toBe(1);
    expect(verifier).toHaveBeenCalledTimes(1);
    expect(validator).toHaveBeenCalledTimes(0);
    expect(workflow).toHaveBeenCalledTimes(0);
    expect(
      events.map(({ from, to, category }) => ({ from, to, category })),
    ).toEqual([
      {
        from: "none",
        to: "proposed",
        category: "invocation-proposed",
      },
      {
        from: "proposed",
        to: "rejected",
        category: "pre-execution-rejected",
      },
    ]);
    expect(events.at(-1)?.to).toBe("rejected");
  });

  it("asserts genuine Outcome authority with an invalid nested Artifact lifecycle row", () => {
    const events: SkillInvocationLifecycleEvent[] = [];
    const validator = vi.fn(() => ({ status: "accepted" as const }));
    const workflow = vi.fn();
    const ports = authorities(events);
    const baseAuthorization = ports.configuration
      .authorization as AuthorizationEvaluationOutcomeAuthorityPort;
    const malformedAuthority = new WeakSet<object>();
    const verifier = vi.fn(
      (request: {
        readonly intent?: unknown;
        readonly outcome?: unknown;
        readonly operationId?: unknown;
      }) =>
        (typeof request.outcome === "object" &&
          request.outcome !== null &&
          malformedAuthority.has(request.outcome)) ||
        baseAuthorization.verifyAuthorizationEvaluationOutcome(
          request as never,
        ),
    );
    (
      ports.configuration as unknown as {
        authorization: AuthorizationEvaluationOutcomeAuthorityPort;
      }
    ).authorization = {
      resolve: baseAuthorization.resolve,
      verifyAuthorizationEvaluationOutcome: verifier,
    };
    const engine = startWithPorts(ports, validator, workflow);
    const values = prepared(engine, "invalid-nested-lifecycle");
    const malformed = Object.freeze({
      authorization: Object.freeze({}),
      securityEvaluationSummary:
        values.authorizationEvaluation.securityEvaluationSummary,
    }) as unknown as AuthorizationEvaluationOutcome;
    malformedAuthority.add(malformed);
    expect(
      verifier({
        intent: "verify-authorization-evaluation-outcome",
        outcome: malformed,
        operationId: values.target.operationId,
      }),
    ).toBe(true);
    verifier.mockClear();
    validator.mockClear();
    workflow.mockClear();
    let invocationCalls = 0;
    let failure: unknown;
    try {
      invocationCalls += 1;
      invoke(engine, {
        ...values,
        authorizationEvaluation: malformed,
      });
    } catch (error) {
      failure = error;
    }
    expect(failure?.constructor).toBe(
      InvalidGovernedAuthorizationEvaluationError,
    );
    expect(invocationCalls).toBe(1);
    expect(verifier).toHaveBeenCalledTimes(1);
    expect(validator).toHaveBeenCalledTimes(0);
    expect(workflow).toHaveBeenCalledTimes(0);
    expect(
      events.map(({ from, to, category }) => ({ from, to, category })),
    ).toEqual([
      {
        from: "none",
        to: "proposed",
        category: "invocation-proposed",
      },
      {
        from: "proposed",
        to: "rejected",
        category: "pre-execution-rejected",
      },
    ]);
    expect(events.at(-1)?.to).toBe("rejected");
  });

  it.each([
    ["target", ["invocation-proposed", "pre-execution-rejected"]],
    ["context", ["invocation-proposed", "pre-execution-rejected"]],
    ["requirements", ["invocation-proposed", "pre-execution-rejected"]],
    ["outcome", ["invocation-proposed", "pre-execution-rejected"]],
    [
      "deny",
      ["invocation-proposed", "authority-admitted", "pre-execution-rejected"],
    ],
    [
      "indeterminate",
      ["invocation-proposed", "authority-admitted", "pre-execution-rejected"],
    ],
    [
      "mismatch",
      ["invocation-proposed", "authority-admitted", "pre-execution-rejected"],
    ],
    [
      "inputs",
      [
        "invocation-proposed",
        "authority-admitted",
        "authorization-accepted",
        "pre-execution-rejected",
      ],
    ],
    [
      "validator-rejected",
      [
        "invocation-proposed",
        "authority-admitted",
        "authorization-accepted",
        "pre-execution-rejected",
      ],
    ],
    [
      "validator-throw",
      [
        "invocation-proposed",
        "authority-admitted",
        "authorization-accepted",
        "pre-execution-rejected",
      ],
    ],
    [
      "validator-malformed",
      [
        "invocation-proposed",
        "authority-admitted",
        "authorization-accepted",
        "pre-execution-rejected",
      ],
    ],
    [
      "validator-promise",
      [
        "invocation-proposed",
        "authority-admitted",
        "authorization-accepted",
        "pre-execution-rejected",
      ],
    ],
    [
      "validator-thenable",
      [
        "invocation-proposed",
        "authority-admitted",
        "authorization-accepted",
        "pre-execution-rejected",
      ],
    ],
    [
      "workflow-throw",
      [
        "invocation-proposed",
        "authority-admitted",
        "authorization-accepted",
        "input-accepted",
        "workflow-started",
        "execution-failed",
      ],
    ],
    [
      "workflow-malformed",
      [
        "invocation-proposed",
        "authority-admitted",
        "authorization-accepted",
        "input-accepted",
        "workflow-started",
        "execution-failed",
      ],
    ],
    [
      "workflow-promise",
      [
        "invocation-proposed",
        "authority-admitted",
        "authorization-accepted",
        "input-accepted",
        "workflow-started",
        "execution-failed",
      ],
    ],
    [
      "workflow-thenable",
      [
        "invocation-proposed",
        "authority-admitted",
        "authorization-accepted",
        "input-accepted",
        "workflow-started",
        "execution-failed",
      ],
    ],
    [
      "undeclared-failure",
      [
        "invocation-proposed",
        "authority-admitted",
        "authorization-accepted",
        "input-accepted",
        "workflow-started",
        "execution-failed",
      ],
    ],
    [
      "output-mismatch",
      [
        "invocation-proposed",
        "authority-admitted",
        "authorization-accepted",
        "input-accepted",
        "workflow-started",
        "execution-failed",
      ],
    ],
    [
      "business-failure",
      [
        "invocation-proposed",
        "authority-admitted",
        "authorization-accepted",
        "input-accepted",
        "workflow-started",
        "business-failed",
      ],
    ],
    [
      "success",
      [
        "invocation-proposed",
        "authority-admitted",
        "authorization-accepted",
        "input-accepted",
        "workflow-started",
        "execution-succeeded",
      ],
    ],
  ] as const)("emits exact lifecycle row for %s", (scenario, expected) => {
    const events: SkillInvocationLifecycleEvent[] = [];
    const validator = vi.fn(() => {
      if (scenario === "validator-throw") throw new Error("validator-secret");
      if (scenario === "validator-malformed") return {};
      if (scenario === "validator-promise")
        return Promise.resolve({ status: "accepted" });
      if (scenario === "validator-thenable") return { then() {} };
      return {
        status: scenario === "validator-rejected" ? "rejected" : "accepted",
      };
    });
    const workflow = vi.fn(() => {
      if (scenario === "workflow-throw") throw new Error("workflow-secret");
      if (scenario === "workflow-malformed") return {};
      if (scenario === "workflow-promise")
        return Promise.resolve({ status: "succeeded", outputs: {} });
      if (scenario === "workflow-thenable") return { then() {} };
      if (scenario === "undeclared-failure")
        return { status: "failed", failureMode: "undeclared.failure" };
      if (scenario === "output-mismatch")
        return { status: "succeeded", outputs: {} };
      return scenario === "business-failure"
        ? { status: "failed", failureMode: "weather.unavailable" }
        : {
            status: "succeeded",
            outputs: { "weather.value": "Lima" },
          };
    });
    const { engine, ports } = engineWithWorkflow(validator, workflow, events);
    if (scenario === "deny" || scenario === "indeterminate")
      ports.setDecision(scenario);
    if (scenario === "mismatch") ports.setArtifactPermissions([]);
    const values = prepared(engine);
    const candidate = {
      ...values,
      ...(scenario === "target" ? { target: { ...values.target } } : {}),
      ...(scenario === "context" ? { context: { ...values.context } } : {}),
      ...(scenario === "requirements"
        ? { requirements: { ...values.requirements } }
        : {}),
      ...(scenario === "outcome"
        ? {
            authorizationEvaluation: {
              ...values.authorizationEvaluation,
            },
          }
        : {}),
    };
    let invocationCalls = 0;
    const operation = () => {
      invocationCalls += 1;
      return invoke(
        engine,
        candidate as ReturnType<typeof prepared>,
        scenario === "inputs" ? {} : { "location.value": "Lima" },
      );
    };
    const expectedErrors: Readonly<Record<string, unknown>> = {
      target: InvalidSkillAuthorityError,
      context: InvalidSkillContextAuthorityError,
      requirements: InvalidSkillAuthorityError,
      outcome: InvalidGovernedAuthorizationEvaluationError,
      deny: SkillAuthorizationEnforcementError,
      indeterminate: SkillAuthorizationEnforcementError,
      mismatch: SkillAuthorizationEnforcementError,
      inputs: InvalidProtectedSkillInvocationInputError,
      "validator-rejected": SkillInputValidationError,
      "validator-throw": SkillValidatorBoundaryError,
      "validator-malformed": InvalidSkillValidationResultError,
      "validator-promise": InvalidSkillValidationResultError,
      "validator-thenable": InvalidSkillValidationResultError,
      "workflow-throw": SkillWorkflowExecutionError,
      "workflow-malformed": InvalidSkillWorkflowResultError,
      "workflow-promise": InvalidSkillWorkflowResultError,
      "workflow-thenable": InvalidSkillWorkflowResultError,
      "undeclared-failure": InvalidSkillWorkflowResultError,
      "output-mismatch": InvalidSkillWorkflowResultError,
    };
    const expectedError = expectedErrors[scenario] as
      (new (...arguments_: never[]) => Error) | undefined;
    if (expectedError !== undefined) {
      let failure: unknown;
      try {
        operation();
      } catch (error) {
        failure = error;
      }
      expect(failure).toBeInstanceOf(expectedError);
      expect((failure as Error).constructor).toBe(expectedError);
    } else if (scenario === "business-failure")
      expect(operation()).toEqual({
        operationId: values.target.operationId,
        skillId: values.target.skillId,
        skillVersion: values.target.skillVersion,
        capability: values.target.capability,
        status: "failed",
        failureMode: "weather.unavailable",
      });
    else
      expect(operation()).toEqual({
        operationId: values.target.operationId,
        skillId: values.target.skillId,
        skillVersion: values.target.skillVersion,
        capability: values.target.capability,
        status: "succeeded",
        outputs: Object.assign(Object.create(null), {
          "weather.value": "Lima",
        }),
      });
    expect(invocationCalls).toBe(1);
    expect(events.map((event) => event.category)).toEqual(expected);
    const transitionsByCategory = {
      "invocation-proposed": { from: "none", to: "proposed" },
      "authority-admitted": { from: "proposed", to: "admitted" },
      "authorization-accepted": { from: "admitted", to: "authorized" },
      "input-accepted": { from: "authorized", to: "input-validated" },
      "workflow-started": { from: "input-validated", to: "executing" },
      "execution-succeeded": { from: "executing", to: "succeeded" },
      "business-failed": { from: "executing", to: "failed" },
      "execution-failed": { from: "executing", to: "failed" },
    } as const;
    const expectedTransitions = expected.map((category, index) =>
      category === "pre-execution-rejected"
        ? {
            from:
              index === 1
                ? "proposed"
                : index === 2
                  ? "admitted"
                  : "authorized",
            to: "rejected",
          }
        : transitionsByCategory[category as keyof typeof transitionsByCategory],
    );
    expect(events.map(({ from, to }) => ({ from, to }))).toEqual(
      expectedTransitions,
    );
    expect(events.at(-1)?.to).toBe(expectedTransitions.at(-1)?.to);
    expect(events.at(-1)?.category).toBe(expected.at(-1));
    const validatorExpected = [
      "validator-rejected",
      "validator-throw",
      "validator-malformed",
      "validator-promise",
      "validator-thenable",
      "workflow-throw",
      "workflow-malformed",
      "workflow-promise",
      "workflow-thenable",
      "undeclared-failure",
      "output-mismatch",
      "business-failure",
      "success",
    ].includes(scenario)
      ? 1
      : 0;
    const workflowExpected = [
      "workflow-throw",
      "workflow-malformed",
      "workflow-promise",
      "workflow-thenable",
      "undeclared-failure",
      "output-mismatch",
      "business-failure",
      "success",
    ].includes(scenario)
      ? 1
      : 0;
    expect(validator).toHaveBeenCalledTimes(validatorExpected);
    expect(workflow).toHaveBeenCalledTimes(workflowExpected);
    expect(validator.mock.calls.length).toBe(validatorExpected);
    expect(workflow.mock.calls.length).toBe(workflowExpected);
  });

  it("accepts ordinary/null prototype records and preserves caller objects", () => {
    const { engine } = engineWithWorkflow();
    const values = prepared(engine);
    const input = Object.create(null);
    Object.defineProperty(input, "location.value", {
      value: "Lima",
      enumerable: true,
      writable: true,
      configurable: true,
    });
    const result = invoke(engine, values, input);
    expect(result.status).toBe("succeeded");
    expect(Object.getPrototypeOf(input)).toBeNull();
    expect(Object.isFrozen(input)).toBe(false);
    const custom = Object.create({ inherited: true });
    custom["location.value"] = "Lima";
    expect(() =>
      invoke(engine, prepared(engine, "operation-2"), custom),
    ).toThrow(InvalidProtectedSkillInvocationInputError);
  });

  it.each([
    null,
    true,
    false,
    Number.MIN_SAFE_INTEGER,
    Number.MAX_SAFE_INTEGER,
    "",
    "😀".repeat(4096),
    "   ",
  ])("accepts each governed scalar without mutating it: %#", (scalar) => {
    const { engine } = engineWithWorkflow();
    const source = { "location.value": scalar };
    const result = invoke(engine, prepared(engine), source);
    expect(result.status).toBe("succeeded");
    if (result.status === "succeeded") {
      expect(Object.getPrototypeOf(result.outputs)).toBeNull();
      expect(result.outputs["weather.value"]).toBe(scalar);
    }
    expect(source).toEqual({ "location.value": scalar });
    expect(Object.isFrozen(source)).toBe(false);
  });

  it.each([
    Number.MIN_SAFE_INTEGER - 1,
    Number.MAX_SAFE_INTEGER + 1,
    -0,
    1.5,
    Number.NaN,
    Number.POSITIVE_INFINITY,
    Number.NEGATIVE_INFINITY,
    1n,
    Symbol("input"),
    {},
    [],
    () => "input",
    new Date(),
    new Map(),
    new Set(),
    new Uint8Array([1, 2, 3]),
    Buffer.from("binary"),
    new Number(1),
    new String("boxed"),
    new Boolean(true),
    {
      toString() {
        return "coercible";
      },
    },
    "x".repeat(4097),
    "line\nbreak",
  ])("rejects each invalid governed scalar: %#", (scalar) => {
    const { engine } = engineWithWorkflow();
    expect(() =>
      invoke(engine, prepared(engine), { "location.value": scalar }),
    ).toThrow(InvalidProtectedSkillInvocationInputError);
  });

  it("rejects hostile input records with protected descriptor reads", () => {
    const { engine } = engineWithWorkflow();
    let getters = 0;
    const accessor = {};
    Object.defineProperty(accessor, "location.value", {
      enumerable: true,
      get() {
        getters += 1;
        return "Lima";
      },
    });
    const ownKeys = new Proxy(
      {},
      {
        ownKeys() {
          throw new Error("input-secret");
        },
      },
    );
    const descriptor = new Proxy(
      { "location.value": "Lima" },
      {
        getOwnPropertyDescriptor() {
          throw new Error("input-secret");
        },
      },
    );
    const revoked = Proxy.revocable({ "location.value": "Lima" }, {});
    revoked.revoke();
    for (const input of [
      accessor,
      ownKeys,
      descriptor,
      revoked.proxy,
      new (class InputRecord {
        public readonly ["location.value"] = "Lima";
      })(),
      Object.assign(() => undefined, { "location.value": "Lima" }),
      [],
      new Map(),
      new Set(),
      new Date(),
      Object.assign(Object.create({ inherited: true }), {
        "location.value": "Lima",
      }),
      { "location.value": "Lima", [Symbol("input")]: true },
      {},
      { "location.value": "Lima", extra: true },
    ])
      expect(() =>
        invoke(engine, prepared(engine, `hostile-${getters}`), input),
      ).toThrow(InvalidProtectedSkillInvocationInputError);
    expect(getters).toBe(0);
  });

  it("rejects every prohibited Cc code point as an input string", () => {
    const prohibited = [
      ...Array.from({ length: 0x20 }, (_, value) =>
        String.fromCodePoint(value),
      ),
      String.fromCodePoint(0x7f),
      ...Array.from({ length: 0x20 }, (_, offset) =>
        String.fromCodePoint(0x80 + offset),
      ),
    ];
    const { engine } = engineWithWorkflow();
    for (const [index, scalar] of prohibited.entries()) {
      expect(() =>
        invoke(engine, prepared(engine, `control-${index}`), {
          "location.value": scalar,
        }),
      ).toThrow(InvalidProtectedSkillInvocationInputError);
    }
  });

  it("does not admit __proto__ because it is invalid under M7", () => {
    const engine = new SkillEngine(authorities().configuration);
    engine.initialize();
    engine.start();
    expect(() =>
      engine.registerSkillManifest({
        intent: "register-skill-manifest",
        manifest: { ...skillManifest(), inputs: ["__proto__"] },
      }),
    ).toThrow(InvalidSkillManifestError);
  });

  it.each(["constructor", "prototype"] as const)(
    "accepts prototype-sensitive input key %s only when exactly declared",
    (key) => {
      let observed: Readonly<Record<string, unknown>> | undefined;
      const engine = engineWithManifest(
        { ...skillManifest(), inputs: [key], outputs: [] },
        (argument) => {
          observed = (argument as unknown as SkillValidatorInput).inputs;
          return { status: "succeeded", outputs: {} };
        },
      );
      const source = Object.create(null) as Record<string, unknown>;
      Object.defineProperty(source, key, {
        value: "safe",
        enumerable: true,
        writable: true,
        configurable: true,
      });
      expect(invoke(engine, prepared(engine), source).status).toBe("succeeded");
      expect(Object.getPrototypeOf(observed)).toBeNull();
      expect(Object.keys(observed!)).toEqual([key]);
      expect(Object.getPrototypeOf(source)).toBeNull();
      expect(Object.isFrozen(source)).toBe(false);
    },
  );

  it.each([0, 1, 64] as const)(
    "accepts exactly %i declared inputs and canonicalizes key order",
    (count) => {
      const names = Array.from(
        { length: count },
        (_, index) => `input.${String(index).padStart(2, "0")}`,
      ).reverse();
      let observed: readonly string[] = [];
      const engine = engineWithManifest(
        { ...skillManifest(), inputs: names, outputs: [] },
        (argument) => {
          observed = Object.keys(
            (argument as unknown as SkillValidatorInput).inputs,
          );
          return { status: "succeeded", outputs: {} };
        },
      );
      const values = prepared(engine, `input-count-${count}`);
      const source = Object.fromEntries(names.map((name) => [name, name]));
      const before = structuredClone(source);
      const result = invoke(engine, values, source);
      expect(result.status).toBe("succeeded");
      expect(observed).toEqual([...names].sort());
      expect(source).toEqual(before);
      expect(Object.isFrozen(source)).toBe(false);
    },
  );

  it.each([
    null,
    true,
    false,
    Number.MIN_SAFE_INTEGER,
    Number.MAX_SAFE_INTEGER,
    -1,
    1,
    "",
    "x",
    "😀".repeat(4096),
  ])("normalizes each approved workflow output scalar: %#", (scalar) => {
    const rawOutputs = { "weather.value": scalar };
    const { engine } = engineWithWorkflow(undefined, () => ({
      status: "succeeded",
      outputs: rawOutputs,
    }));
    const result = invoke(engine, prepared(engine));
    expect(result).toMatchObject({
      status: "succeeded",
      outputs: { "weather.value": scalar },
    });
    if (result.status === "succeeded") {
      expect(Object.getPrototypeOf(result.outputs)).toBeNull();
      expect(Object.isFrozen(result.outputs)).toBe(true);
    }
    expect(Object.isFrozen(rawOutputs)).toBe(false);
  });

  it.each([
    Number.MIN_SAFE_INTEGER - 1,
    Number.MAX_SAFE_INTEGER + 1,
    -0,
    1.5,
    Number.NaN,
    Number.POSITIVE_INFINITY,
    Number.NEGATIVE_INFINITY,
    1n,
    Symbol("output"),
    {},
    [],
    () => "output",
    new Date(),
    new Map(),
    new Set(),
    new Uint8Array([1]),
    Buffer.from("binary"),
    new Number(1),
    new String("boxed"),
    new Boolean(true),
    "x".repeat(4097),
    "line\nbreak",
  ])("rejects each invalid workflow output scalar: %#", (scalar) => {
    const { engine } = engineWithWorkflow(undefined, () => ({
      status: "succeeded",
      outputs: { "weather.value": scalar },
    }));
    expect(() => invoke(engine, prepared(engine))).toThrow(
      InvalidSkillWorkflowResultError,
    );
  });

  it("directly rejects hostile and invalid raw workflow output records", () => {
    let getters = 0;
    const accessor = {};
    Object.defineProperty(accessor, "weather.value", {
      enumerable: true,
      get() {
        getters += 1;
        return "unsafe";
      },
    });
    const ownKeys = new Proxy(
      {},
      {
        ownKeys() {
          throw new Error("output-secret");
        },
      },
    );
    const descriptor = new Proxy(
      { "weather.value": "unsafe" },
      {
        getOwnPropertyDescriptor() {
          throw new Error("output-secret");
        },
      },
    );
    const revoked = Proxy.revocable({ "weather.value": "unsafe" }, {});
    revoked.revoke();
    for (const outputs of [
      accessor,
      ownKeys,
      descriptor,
      revoked.proxy,
      Object.assign(Object.create({ inherited: true }), {
        "weather.value": "unsafe",
      }),
      new (class OutputRecord {
        public readonly ["weather.value"] = "unsafe";
      })(),
      new Map(),
      new Set(),
      new Date(),
      [],
      () => "unsafe",
      { "weather.value": "unsafe", [Symbol("output")]: true },
    ]) {
      const { engine } = engineWithWorkflow(undefined, () => ({
        status: "succeeded",
        outputs,
      }));
      expect(() => invoke(engine, prepared(engine))).toThrow(
        InvalidSkillWorkflowResultError,
      );
    }
    expect(getters).toBe(0);
  });

  it("accepts null-prototype workflow output sources and preserves their prototype", () => {
    const raw = Object.create(null) as Record<string, unknown>;
    Object.defineProperty(raw, "weather.value", {
      value: "Lima",
      enumerable: true,
      writable: true,
      configurable: true,
    });
    const { engine } = engineWithWorkflow(undefined, () => ({
      status: "succeeded",
      outputs: raw,
    }));
    const result = invoke(engine, prepared(engine));
    expect(result).toMatchObject({
      status: "succeeded",
      outputs: { "weather.value": "Lima" },
    });
    expect(Object.getPrototypeOf(raw)).toBeNull();
    expect(Object.isFrozen(raw)).toBe(false);
  });

  it("rejects every prohibited Cc code point in workflow output", () => {
    const prohibited = [
      ...Array.from({ length: 0x20 }, (_, value) =>
        String.fromCodePoint(value),
      ),
      String.fromCodePoint(0x7f),
      ...Array.from({ length: 0x20 }, (_, offset) =>
        String.fromCodePoint(0x80 + offset),
      ),
    ];
    for (const [index, scalar] of prohibited.entries()) {
      const { engine } = engineWithWorkflow(undefined, () => ({
        status: "succeeded",
        outputs: { "weather.value": scalar },
      }));
      expect(() =>
        invoke(engine, prepared(engine, `output-control-${index}`)),
      ).toThrow(InvalidSkillWorkflowResultError);
    }
  });

  it("rejects a 65-field manifest boundary", () => {
    const engine = new SkillEngine(authorities().configuration);
    engine.initialize();
    engine.start();
    expect(() =>
      engine.registerSkillManifest({
        intent: "register-skill-manifest",
        manifest: {
          ...skillManifest(),
          inputs: Array.from({ length: 65 }, (_, index) => `input.${index}`),
        },
      }),
    ).toThrow(InvalidSkillManifestError);
    expect(() =>
      engine.registerSkillManifest({
        intent: "register-skill-manifest",
        manifest: {
          ...skillManifest("output-overflow"),
          outputs: Array.from({ length: 65 }, (_, index) => `output.${index}`),
        },
      }),
    ).toThrow(InvalidSkillManifestError);
  });

  it.each([0, 1, 64] as const)(
    "normalizes exactly %i declared outputs",
    (count) => {
      const outputNames = Array.from(
        { length: count },
        (_, index) => `output.${String(index).padStart(2, "0")}`,
      ).reverse();
      const rawOutputs = Object.fromEntries(
        outputNames.map((name) => [name, name]),
      );
      const engine = engineWithManifest(
        { ...skillManifest(), outputs: outputNames },
        () => ({ status: "succeeded", outputs: rawOutputs }),
      );
      const result = invoke(engine, prepared(engine), {
        "location.value": "Lima",
      });
      expect(result.status).toBe("succeeded");
      if (result.status === "succeeded") {
        expect(Object.keys(result.outputs)).toEqual([...outputNames].sort());
        expect(Object.getPrototypeOf(result.outputs)).toBeNull();
        expect(Object.isFrozen(result.outputs)).toBe(true);
      }
      expect(Object.isFrozen(rawOutputs)).toBe(false);
    },
  );

  it.each([
    new Error("validator-secret"),
    new InvalidSkillAuthorityError(),
    "validator-string",
    1,
    {},
    Symbol("validator"),
    1n,
  ])("contains every validator throw form: %#", (thrown) => {
    const validator = vi.fn(() => {
      throw thrown;
    });
    const workflow = vi.fn();
    const { engine } = engineWithWorkflow(validator, workflow);
    expect(() => invoke(engine, prepared(engine))).toThrow(
      SkillValidatorBoundaryError,
    );
    expect(validator).toHaveBeenCalledTimes(1);
    expect(workflow).toHaveBeenCalledTimes(0);
  });

  it.each([
    undefined,
    null,
    {},
    [],
    Promise.resolve({ status: "accepted" }),
    { then() {} },
    [][Symbol.iterator](),
    {
      callback(callback: (value: unknown) => void) {
        callback({ status: "accepted" });
      },
    },
    {
      status: "accepted",
      schedule(callback: () => void) {
        queueMicrotask(callback);
      },
    },
    { status: "accepted", extra: true },
    new Proxy(
      {},
      {
        ownKeys() {
          throw new Error("validator-result-secret");
        },
      },
    ),
  ])("rejects each malformed validator result: %#", (result) => {
    const workflow = vi.fn();
    const { engine } = engineWithWorkflow(() => result, workflow);
    expect(() => invoke(engine, prepared(engine))).toThrow(
      InvalidSkillValidationResultError,
    );
    expect(workflow).toHaveBeenCalledTimes(0);
  });

  it.each([
    new Error("workflow-secret"),
    new InvalidSkillAuthorityError(),
    "workflow-string",
    1,
    {},
    Symbol("workflow"),
    1n,
  ])("contains every workflow throw form and remains usable: %#", (thrown) => {
    let fail = true;
    const workflow = vi.fn((input: never) => {
      if (fail) throw thrown;
      return {
        status: "succeeded",
        outputs: {
          "weather.value": (input as unknown as SkillValidatorInput).inputs[
            "location.value"
          ],
        },
      };
    });
    const { engine } = engineWithWorkflow(undefined, workflow);
    const first = prepared(engine, "workflow-failure");
    expect(() => invoke(engine, first)).toThrow(SkillWorkflowExecutionError);
    fail = false;
    expect(invoke(engine, prepared(engine, "workflow-recovery")).status).toBe(
      "succeeded",
    );
    expect(workflow).toHaveBeenCalledTimes(2);
  });

  it.each([
    undefined,
    null,
    {},
    [],
    Promise.resolve({ status: "succeeded", outputs: {} }),
    { then() {} },
    [][Symbol.iterator](),
    {
      callback(callback: (value: unknown) => void) {
        callback({ status: "succeeded", outputs: {} });
      },
    },
    {
      status: "succeeded",
      schedule(callback: () => void) {
        queueMicrotask(callback);
      },
    },
    { status: "succeeded" },
    { status: "succeeded", outputs: {}, extra: true },
    { status: "failed", failureMode: "undeclared.failure" },
    new Proxy(
      {},
      {
        ownKeys() {
          throw new Error("workflow-result-secret");
        },
      },
    ),
  ])("rejects each malformed workflow result: %#", (result) => {
    const { engine } = engineWithWorkflow(undefined, () => result);
    expect(() => invoke(engine, prepared(engine))).toThrow(
      InvalidSkillWorkflowResultError,
    );
  });

  it("reconstructs workflow output without mutating or freezing its raw graph", () => {
    const raw = {
      status: "succeeded" as const,
      outputs: { "weather.value": "raw-value" },
    };
    const before = structuredClone(raw);
    const workflow = vi.fn(() => raw);
    const { engine } = engineWithWorkflow(undefined, workflow);
    const result = invoke(engine, prepared(engine));
    expect(result).toMatchObject({
      status: "succeeded",
      outputs: { "weather.value": "raw-value" },
    });
    expect(raw).toEqual(before);
    expect(Object.isFrozen(raw)).toBe(false);
    expect(Object.isFrozen(raw.outputs)).toBe(false);
    expect(Object.isFrozen(workflow)).toBe(false);
  });

  it("keeps failures and lifecycle events free of distinctive protected secrets", () => {
    const events: SkillInvocationLifecycleEvent[] = [];
    const { engine } = engineWithWorkflow(
      () => {
        throw new Error("native-secret");
      },
      undefined,
      events,
    );
    let failure: unknown;
    try {
      invoke(engine, prepared(engine, "operation-secret"), {
        "location.value": "input-secret",
      });
    } catch (error) {
      failure = error;
    }
    const serialized = JSON.stringify({
      message: failure instanceof Error ? failure.message : failure,
      events,
    });
    for (const secret of [
      "operation-secret",
      "identity-secret",
      "skill-secret",
      "capability-secret",
      "permission-secret",
      "resource-secret",
      "input-secret",
      "output-secret",
      "context-secret",
      "summary-secret",
      "native-secret",
    ])
      expect(serialized).not.toContain(secret);
  });

  it("privacy-probes identifiers, authority values, inputs, and native messages", () => {
    const events: SkillInvocationLifecycleEvent[] = [];
    const ports = authorities(events);
    ports.setSubject({
      kind: "authenticated",
      identityId: "identity.secret",
    } as never);
    const engine = new SkillEngine(ports.configuration);
    engine.initialize();
    engine.start();
    engine.registerSkillManifest({
      intent: "register-skill-manifest",
      manifest: {
        ...skillManifest("skill-secret"),
        permissions: ["permission.secret"],
        capabilities: ["capability.secret"],
        inputs: ["input.secret"],
        outputs: ["output.secret"],
      },
    });
    engine.admitSkillWorkflow({
      intent: "admit-skill-workflow",
      skillId: "skill-secret",
      supportedCapabilities: ["capability.secret"],
      validator: () => {
        throw new Error("native-secret");
      },
      workflow: () => ({
        status: "succeeded",
        outputs: { "output.secret": "output-value-secret" },
      }),
    });
    const selection = engine.selectSkill({
      intent: "select-skill",
      capability: "capability.secret",
    });
    if (selection.status !== "selected") throw new Error("fixture");
    const target = engine.bindSkillToOperation({
      intent: "bind-skill-to-operation",
      operationId: "operation-secret",
      binding: selection.binding,
    });
    const context = engine.resolveSkillExecutionContext({
      intent: "resolve-skill-execution-context",
      operationId: target.operationId,
      contextRevision: {},
    }) as SkillExecutionContextProjection;
    const requirements = engine.resolveSkillInvocationRequirements({
      intent: "resolve-skill-invocation-requirements",
      target,
    }) as SkillInvocationRequirementsProjection;
    ports.setArtifactPermissions(["permission.secret"]);
    const authorizationEvaluation =
      engine.resolveGovernedAuthorizationEvaluation({
        intent: "resolve-governed-authorization-evaluation",
        request: {
          intent: "evaluate-authorization-outcome",
          operationId: target.operationId,
          action: target.action,
          resource: target.resource,
        },
      }) as AuthorizationEvaluationOutcome;
    let failure: unknown;
    try {
      engine.invokeBoundSkill({
        intent: "invoke-bound-skill",
        operationId: target.operationId,
        target,
        context,
        requirements,
        authorizationEvaluation,
        inputs: { "input.secret": "input-value-secret" },
      });
    } catch (error) {
      failure = error;
    }
    const publicSurface = JSON.stringify({
      error: failure instanceof Error ? failure.message : failure,
      events,
    });
    for (const secret of [
      "operation-secret",
      "identity.secret",
      "skill-secret",
      "capability.secret",
      "permission.secret",
      "input.secret",
      "input-value-secret",
      "output.secret",
      "output-value-secret",
      "native-secret",
    ])
      expect(publicSurface).not.toContain(secret);
  });

  it("injects real Context lineage and revision secrets without public leakage", () => {
    const events: SkillInvocationLifecycleEvent[] = [];
    const ports = authorities(events);
    ports.setContextIdentities(
      "lineage-distinctive-secret",
      "revision-distinctive-secret",
    );
    const validator = vi.fn(() => {
      throw new Error("context-path-native-secret");
    });
    const engine = startWithPorts(ports, validator);
    const values = prepared(engine, "context-privacy-operation");
    expect(values.context.lineageId).toBe("lineage-distinctive-secret");
    expect(values.context.revisionId).toBe("revision-distinctive-secret");
    let failure: unknown;
    try {
      invoke(engine, values);
    } catch (error) {
      failure = error;
    }
    const observable = JSON.stringify({
      name: failure instanceof Error ? failure.name : undefined,
      message: failure instanceof Error ? failure.message : failure,
      events,
    });
    for (const secret of [
      "lineage-distinctive-secret",
      "revision-distinctive-secret",
      "context-path-native-secret",
    ])
      expect(observable).not.toContain(secret);
  });

  it("injects a real hostile Summary source secret without public leakage", () => {
    const events: SkillInvocationLifecycleEvent[] = [];
    const validator = vi.fn();
    const workflow = vi.fn();
    const { engine, ports } = engineWithWorkflow(validator, workflow, events);
    const values = prepared(engine, "summary-privacy-operation");
    ports.forceAuthorizationVerifier(true);
    const hostileSummary = new Proxy(
      {},
      {
        ownKeys() {
          throw new Error("summary-source-distinctive-secret");
        },
      },
    );
    let failure: unknown;
    try {
      invoke(engine, {
        ...values,
        authorizationEvaluation: {
          authorization: values.authorizationEvaluation.authorization,
          securityEvaluationSummary: hostileSummary,
        } as AuthorizationEvaluationOutcome,
      });
    } catch (error) {
      failure = error;
    }
    expect(failure).toBeInstanceOf(InvalidGovernedAuthorizationEvaluationError);
    const observable = JSON.stringify({
      name: failure instanceof Error ? failure.name : undefined,
      message: failure instanceof Error ? failure.message : failure,
      events,
    });
    expect(observable).not.toContain("summary-source-distinctive-secret");
    expect(validator).toHaveBeenCalledTimes(0);
    expect(workflow).toHaveBeenCalledTimes(0);
  });

  it.each([
    "deny",
    "invalid-input",
    "validator-rejection",
    "validator-throw",
    "workflow-throw",
    "malformed-result",
  ] as const)("preserves caller graphs on %s failure", (scenario) => {
    const validator = vi.fn(() => {
      if (scenario === "validator-throw") throw new Error("validator-secret");
      return {
        status: scenario === "validator-rejection" ? "rejected" : "accepted",
      };
    });
    const raw = {
      status: "succeeded",
      outputs:
        scenario === "malformed-result"
          ? {}
          : { "weather.value": "weather-output" },
    };
    const workflow = vi.fn(() => {
      if (scenario === "workflow-throw") throw new Error("workflow-secret");
      return raw;
    });
    const { engine, ports } = engineWithWorkflow(validator, workflow);
    if (scenario === "deny") ports.setDecision("deny");
    const values = prepared(engine);
    const inputs =
      scenario === "invalid-input"
        ? { extra: "input-value" }
        : { "location.value": "input-value" };
    const request = {
      intent: "invoke-bound-skill" as const,
      operationId: values.target.operationId,
      ...values,
      inputs,
    };
    const references = {
      target: request.target,
      requirements: request.requirements,
      context: request.context,
      authorizationEvaluation: request.authorizationEvaluation,
      inputs: request.inputs,
    };
    expect(() => engine.invokeBoundSkill(request)).toThrow();
    expect(request).toMatchObject(references);
    expect(request.inputs).toEqual(inputs);
    expect(Object.isFrozen(request)).toBe(false);
    expect(Object.isFrozen(inputs)).toBe(false);
    expect(Object.isFrozen(validator)).toBe(false);
    expect(Object.isFrozen(workflow)).toBe(false);
    expect(Object.isFrozen(raw)).toBe(false);
    expect(Object.isFrozen(raw.outputs)).toBe(false);
  });

  it("exposes no production fault or provenance-mint activation surface", async () => {
    const skill = await import("../src/index.js");
    const forbidden = [
      "TestSeam",
      "testSeam",
      "fault",
      "injectFailure",
      "setFailure",
      "mintAuthority",
      "registerAuthority",
      "__test",
    ];
    expect(
      Object.keys(skill).filter((name) => forbidden.includes(name)),
    ).toEqual([]);
    expect(
      Object.getOwnPropertyNames(skill.SkillEngine).filter((name) =>
        forbidden.includes(name),
      ),
    ).toEqual([]);
    expect(
      Object.getOwnPropertyNames(skill.SkillEngine.prototype).filter((name) =>
        forbidden.includes(name),
      ),
    ).toEqual([]);
  });

  it("enforces policy and confirmation correspondence through an isolated structural seam", async () => {
    vi.resetModules();
    vi.doMock("@orion/core", async () => {
      const actual = (await vi.importActual("@orion/core")) as Record<
        string,
        unknown
      > & {
        createAuthorizationDecisionArtifact: typeof createAuthorizationDecisionArtifact;
      };
      return {
        ...actual,
        createAuthorizationDecisionArtifact(value: unknown) {
          const candidate = value as {
            policy?: { id?: unknown };
            sensitivity?: unknown;
            evidence?: { confirmationStatus?: unknown };
          };
          if (
            candidate.policy?.id === "test.policy" ||
            (candidate.sensitivity === "standard" &&
              candidate.evidence?.confirmationStatus === "confirmed") ||
            (candidate.sensitivity === "sensitive" &&
              candidate.evidence?.confirmationStatus === "absent")
          )
            return value;
          return actual.createAuthorizationDecisionArtifact(value);
        },
      };
    });
    try {
      const dynamicSkill = await import("../src/index.js");
      const dynamicCore = await import("@orion/core");
      for (const mismatch of [
        "policy",
        "standard-confirmation",
        "sensitive-confirmation",
      ] as const) {
        const events: SkillInvocationLifecycleEvent[] = [];
        const validator = vi.fn();
        const workflow = vi.fn();
        const issued: { value?: AuthorizationEvaluationOutcome } = {};
        const ports = authorities(events);
        (
          ports.configuration as unknown as {
            authorization: AuthorizationEvaluationOutcomeAuthorityPort;
          }
        ).authorization = {
          resolve: () => issued.value as AuthorizationEvaluationOutcome,
          verifyAuthorizationEvaluationOutcome: () => true,
        };
        const engine = new dynamicSkill.SkillEngine(ports.configuration);
        engine.initialize();
        engine.start();
        engine.registerSkillManifest({
          intent: "register-skill-manifest",
          manifest: skillManifest(),
        });
        engine.admitSkillWorkflow({
          intent: "admit-skill-workflow",
          skillId: "weather-reader",
          supportedCapabilities: ["weather.read"],
          validator,
          workflow,
        });
        const selection = engine.selectSkill({
          intent: "select-skill",
          capability: "weather.read",
        });
        if (selection.status !== "selected") throw new Error("fixture");
        const target = engine.bindSkillToOperation({
          intent: "bind-skill-to-operation",
          operationId: `isolated-${mismatch}`,
          binding: selection.binding,
        });
        const context = engine.resolveSkillExecutionContext({
          intent: "resolve-skill-execution-context",
          operationId: target.operationId,
          contextRevision: {},
        }) as SkillExecutionContextProjection;
        if (mismatch === "sensitive-confirmation")
          ports.setRequirementsOverride({ sensitivity: "sensitive" });
        const requirements = engine.resolveSkillInvocationRequirements({
          intent: "resolve-skill-invocation-requirements",
          target,
        }) as SkillInvocationRequirementsProjection;
        const authorization = createAuthorizationDecisionArtifact({
          operationId: target.operationId,
          decision: "allow",
          subject: context.subject,
          action: target.action,
          resource: target.resource,
          requirementsStatus: "available",
          evaluatedPermissions: target.requiredPermissions,
          sensitivity:
            mismatch === "sensitive-confirmation" ? "sensitive" : "standard",
          securityContext: {
            context: "available",
            device: "not-applicable",
            session: "not-applicable",
            trustLevel: "not-applicable",
          },
          policy: { id: "orion.minimum-authorization", version: "1.0.0" },
          reason:
            mismatch === "sensitive-confirmation"
              ? "confirmation-and-permissions-satisfied"
              : "all-required-permissions-granted",
          evidence: {
            grantEvidenceStatus: "available",
            confirmationStatus:
              mismatch === "sensitive-confirmation"
                ? "confirmed"
                : "not-required",
          },
        });
        const spoofedAuthorization = Object.freeze({
          ...authorization,
          ...(mismatch === "policy"
            ? {
                policy: Object.freeze({
                  id: "test.policy",
                  version: "1.0.0",
                }),
              }
            : {
                evidence: Object.freeze({
                  grantEvidenceStatus: "available",
                  confirmationStatus:
                    mismatch === "sensitive-confirmation"
                      ? "absent"
                      : "confirmed",
                }),
              }),
        }) as AuthorizationEvaluationOutcome["authorization"];
        const summary = createGovernedSecurityEvaluationSummary({
          operationId: target.operationId,
          subject: context.subject,
          securityContext: authorization.securityContext,
        });
        issued.value = Object.freeze({
          authorization: spoofedAuthorization,
          securityEvaluationSummary: summary,
        });
        expect(() =>
          engine.invokeBoundSkill({
            intent: "invoke-bound-skill",
            operationId: target.operationId,
            target,
            context,
            requirements,
            authorizationEvaluation: issued.value!,
            inputs: { "location.value": "Lima" },
          }),
        ).toThrow(dynamicCore.SkillAuthorizationEnforcementError);
        expect(validator).toHaveBeenCalledTimes(0);
        expect(workflow).toHaveBeenCalledTimes(0);
        expect(events.map((event) => event.category)).toEqual([
          "invocation-proposed",
          "authority-admitted",
          "pre-execution-rejected",
        ]);
      }
    } finally {
      vi.doUnmock("@orion/core");
      vi.resetModules();
    }
  });
});
