import { describe, expect, it, vi } from "vitest";
import {
  BrainContextResolutionError,
  BrainSkillCoordinationError,
  authorizationActionIdentifier,
  authorizationOperationIdentifier,
  contextCreatedAt,
  contextLineageIdentity,
  contextRevisionIdentity,
  contextRevisionNumber,
  createAuthorizationDecisionArtifact,
  createAuthorizationEvaluationOutcome,
  createCandidatePlan,
  createGovernedSecurityEvaluationSummary,
  createNormalizedCognitiveRequest,
  createReasoningOutcome,
  createRegisteredSkill,
  InvalidBrainAuthorityError,
  InvalidBrainExecutionStateError,
  InvalidBrainRequestError,
  type BrainConfiguration,
  type CandidatePlan,
  type ActiveContextRevision,
} from "@orion/core";
import { BrainEngine } from "../src/index.js";

const frozen = <T>(value: T): Readonly<T> => Object.freeze(value);

export function fixture(category: CandidatePlan["category"] = "respond") {
  const context = frozen({
    lineageIdentity: contextLineageIdentity("context.main"),
    revisionIdentity: contextRevisionIdentity("context.revision"),
    revisionNumber: contextRevisionNumber(1),
    creationMetadata: frozen({
      createdAt: "2026-07-30T12:00:00Z",
      sourceCount: 1,
      fragmentCount: 1,
    }),
    lifecycleState: "active" as const,
    fragments: frozen([
      frozen({
        kind: "identity" as const,
        authoritativeOwner: "identity" as const,
        projection: frozen({
          state: "anonymous" as const,
          authoritativeOwner: "identity" as const,
        }),
      }),
    ]) as readonly [
      {
        readonly kind: "identity";
        readonly authoritativeOwner: "identity";
        readonly projection: {
          readonly state: "anonymous";
          readonly authoritativeOwner: "identity";
        };
      },
    ],
  });
  const reasoning = createReasoningOutcome({
    status: "completed",
    category: category === "respond" ? "context-only" : "anonymous-context",
    conclusion: "A conclusion",
    response: "Exact planning response",
    nextAction: category === "respond" ? "none" : "request-more-context",
    explainability: {
      contextConsumptionReference: {
        lineageIdentity: context.lineageIdentity,
        revisionIdentity: context.revisionIdentity,
        revisionNumber: context.revisionNumber,
        lifecycleState: "active",
        authoritativeCapability: "context",
      },
      identityState: category === "respond" ? "authenticated" : "anonymous",
      ruleCategory:
        category === "respond"
          ? "authenticated-context-only"
          : "anonymous-identity",
    },
  });
  const plan = createCandidatePlan({
    status: "completed",
    category,
    steps: [
      category === "respond"
        ? {
            ordinal: 1,
            kind: "respond",
            candidateResponse: reasoning.response,
          }
        : { ordinal: 1, kind: "request-more-context" },
    ],
    source: {
      reasoningStatus: reasoning.status,
      reasoningCategory: reasoning.category,
      candidateNextAction: reasoning.nextAction,
      identityState: reasoning.explainability.identityState,
      reasoningRuleCategory: reasoning.explainability.ruleCategory,
      authoritativeCapability: "reasoning",
    },
    explainability: {
      consumedReasoningCategory: reasoning.category,
      consumedCandidateNextAction: reasoning.nextAction,
      resultingPlanCategory: category,
      candidateStepCount: 1,
      planningRuleCategory:
        category === "respond"
          ? "reasoning-produced-response"
          : "reasoning-requested-more-context",
    },
  });
  const skill = createRegisteredSkill({
    id: "weather-reader",
    name: "Weather Reader",
    version: "1.0.0",
    description: "Reads weather.",
    author: "Orion",
    license: "MIT",
    permissions: [],
    capabilities: ["weather.read"],
    events: { publishes: [], consumes: [] },
    inputs: ["city"],
    outputs: ["forecast"],
    failureModes: ["unavailable"],
  });
  const binding = frozen({
    capability: skill.capabilities[0]!,
    registeredSkill: skill,
  });
  const resource = frozen({
    kind: "identified" as const,
    resourceId: "skill:weather-reader",
  });
  const target = frozen({
    operationId: authorizationOperationIdentifier("operation:1"),
    skillId: skill.id,
    skillVersion: skill.version,
    capability: binding.capability,
    action: authorizationActionIdentifier("skill.invoke"),
    resource,
    requiredPermissions: frozen([]),
    inputNames: skill.inputs,
    outputNames: skill.outputs,
    failureModes: skill.failureModes,
  });
  const projection = frozen({
    operationId: target.operationId,
    lineageId: context.lineageIdentity,
    revisionId: context.revisionIdentity,
    subject: frozen({ kind: "anonymous" as const }),
  });
  const requirements = frozen({
    status: "available" as const,
    requirements: frozen({
      operationId: target.operationId,
      action: target.action,
      resource,
      requiredPermissions: target.requiredPermissions,
      sensitivity: "standard" as const,
    }),
  });
  const authorization = createAuthorizationDecisionArtifact({
    operationId: target.operationId,
    decision: "allow",
    subject: { kind: "anonymous" },
    action: target.action,
    resource,
    requirementsStatus: "available",
    evaluatedPermissions: [],
    sensitivity: "standard",
    securityContext: {
      context: "available",
      device: "not-applicable",
      session: "not-applicable",
      trustLevel: "not-applicable",
    },
    policy: { id: "orion.minimum-authorization", version: "1.0.0" },
    reason: "no-permission-required",
    evidence: {
      grantEvidenceStatus: "available",
      confirmationStatus: "not-required",
    },
  });
  const authorizationOutcome = createAuthorizationEvaluationOutcome({
    authorization,
    securityEvaluationSummary: createGovernedSecurityEvaluationSummary({
      operationId: target.operationId,
      subject: authorization.subject,
      securityContext: authorization.securityContext,
    }),
  });
  const normalizedResult = frozen({
    operationId: target.operationId,
    skillId: target.skillId,
    skillVersion: target.skillVersion,
    capability: target.capability,
    status: "succeeded" as const,
    outputs: frozen(Object.assign(Object.create(null), { forecast: "sunny" })),
  });
  const events: unknown[] = [];
  const ports = {
    context: {
      getActiveContextRevision: vi.fn(() => context),
      verifyActiveContextRevisionAuthority: vi.fn(({ candidate }) => candidate),
    },
    reasoning: {
      evaluateReasoning: vi.fn(() => reasoning),
      verifyReasoningOutcomeAuthority: vi.fn(({ candidate }) => candidate),
    },
    planning: {
      createCandidatePlan: vi.fn(() => plan),
      verifyCandidatePlanAuthority: vi.fn(({ candidate }) => candidate),
    },
    selectSkill: {
      selectSkill: vi.fn(() =>
        frozen({
          status: "selected" as const,
          policy: frozen({
            id: "orion.minimum-skill-selection" as const,
            version: "1.0.0" as const,
          }),
          binding,
        }),
      ),
    },
    operationAllocator: {
      allocateAuthorizationOperationIdentifier: vi.fn(() => target.operationId),
    },
    bindSkillToOperation: {
      bindSkillToOperation: vi.fn(() => target),
    },
    resolveSkillExecutionContext: {
      resolveSkillExecutionContext: vi.fn(() => projection),
    },
    resolveSkillInvocationRequirements: {
      resolveSkillInvocationRequirements: vi.fn(() => requirements),
    },
    resolveGovernedAuthorizationEvaluation: {
      resolveGovernedAuthorizationEvaluation: vi.fn(() => authorizationOutcome),
    },
    protectedInvokeSkill: {
      invokeBoundSkill: vi.fn(() => normalizedResult),
    },
    verifyNormalizedSkillExecutionResult: {
      verify: vi.fn(() => true),
    },
    lifecycleObserver: vi.fn((event) => events.push(event)),
  };
  return {
    ports,
    context,
    reasoning,
    plan,
    normalizedResult,
    binding,
    target,
    projection,
    requirements,
    authorizationOutcome,
    events,
  };
}

function knowledgeAwareContext(): ActiveContextRevision {
  return frozen({
    lineageIdentity: contextLineageIdentity("context.main"),
    revisionIdentity: contextRevisionIdentity("context.knowledge.revision"),
    revisionNumber: contextRevisionNumber(1),
    creationMetadata: frozen({
      createdAt: contextCreatedAt("2026-08-11T12:00:00Z"),
      sourceCount: 2,
      fragmentCount: 2,
    }),
    lifecycleState: "active" as const,
    fragments: frozen([
      frozen({
        kind: "identity" as const,
        authoritativeOwner: "identity" as const,
        projection: frozen({
          state: "authenticated" as const,
          authoritativeOwner: "identity" as const,
          identityIdentifier: "orion.identity.m10" as never,
        }),
      }),
      frozen({
        kind: "knowledge" as const,
        authoritativeOwner: "knowledge" as const,
        projection: frozen({
          knowledgeIdentity: "orion.knowledge.m10" as never,
          validationState: "accepted" as const,
          version: 1 as never,
          currency: "current" as const,
          authoritativeOwner: "knowledge" as const,
        }),
      }),
    ]),
  });
}

function memoryAwareContext(): ActiveContextRevision {
  return frozen({
    lineageIdentity: contextLineageIdentity("context.main"),
    revisionIdentity: contextRevisionIdentity("context.memory.revision"),
    revisionNumber: contextRevisionNumber(1),
    creationMetadata: frozen({
      createdAt: contextCreatedAt("2026-08-11T12:01:00Z"),
      sourceCount: 2,
      fragmentCount: 2,
    }),
    lifecycleState: "active" as const,
    fragments: frozen([
      frozen({
        kind: "identity" as const,
        authoritativeOwner: "identity" as const,
        projection: frozen({
          state: "authenticated" as const,
          authoritativeOwner: "identity" as const,
          identityIdentifier: "orion.identity.m1" as never,
        }),
      }),
      frozen({
        kind: "memory" as const,
        authoritativeOwner: "memory" as const,
        projection: frozen({
          memoryIdentity: "orion.memory.m1" as never,
          kind: "episodic" as const,
          lifecycleState: "stored" as const,
          authoritativeOwner: "memory" as const,
        }),
      }),
    ]),
  });
}

export const noneRequest = () =>
  createNormalizedCognitiveRequest({
    intent: "orchestrate-cognitive-request" as const,
    requestId: "request:1",
    contextLineageId: "context.main",
    query: "What is the answer?",
    executionIntent: { kind: "none" as const },
  });

export const skillRequest = () =>
  createNormalizedCognitiveRequest({
    ...noneRequest(),
    executionIntent: {
      kind: "skill-capability" as const,
      capability: "weather.read",
      inputs: { city: "Lima" },
    },
  });

export function running(configuration: unknown): BrainEngine {
  const engine = new BrainEngine(configuration as BrainConfiguration);
  engine.initialize();
  engine.start();
  return engine;
}

describe("Brain Engine complete M10 runtime", () => {
  it("captures exact configuration without invoking any capability", () => {
    const { ports } = fixture();
    new BrainEngine(ports as unknown as BrainConfiguration);
    for (const record of Object.values(ports)) {
      if (typeof record === "function") expect(record).not.toHaveBeenCalled();
      else
        for (const callable of Object.values(record))
          expect(callable).not.toHaveBeenCalled();
    }
  });

  it("rejects missing, extra, accessor, custom-prototype, and revoked configuration", () => {
    const { ports } = fixture();
    const { planning: omitted, ...missing } = ports;
    expect(omitted).toBeDefined();
    expect(
      () => new BrainEngine(missing as unknown as BrainConfiguration),
    ).toThrow(InvalidBrainAuthorityError);
    expect(
      () =>
        new BrainEngine({
          ...ports,
          extra: vi.fn(),
        } as unknown as BrainConfiguration),
    ).toThrow(InvalidBrainAuthorityError);
    const accessor = { ...ports };
    Object.defineProperty(accessor, "context", {
      enumerable: true,
      get: () => ports.context,
    });
    expect(
      () => new BrainEngine(accessor as unknown as BrainConfiguration),
    ).toThrow(InvalidBrainAuthorityError);
    expect(
      () =>
        new BrainEngine(
          Object.assign(Object.create({}), ports) as BrainConfiguration,
        ),
    ).toThrow(InvalidBrainAuthorityError);
    const revoked = Proxy.revocable(ports, {});
    revoked.revoke();
    expect(
      () => new BrainEngine(revoked.proxy as unknown as BrainConfiguration),
    ).toThrow(InvalidBrainAuthorityError);
  });

  it("enforces created, initialized, running, and terminal stopped lifecycle", () => {
    const { ports } = fixture();
    const engine = new BrainEngine(ports as unknown as BrainConfiguration);
    expect(() => engine.orchestrateCognitiveRequest(noneRequest())).toThrow(
      InvalidBrainExecutionStateError,
    );
    engine.initialize();
    expect(() => engine.initialize()).toThrow(InvalidBrainExecutionStateError);
    engine.start();
    engine.stop();
    expect(() => engine.start()).toThrow(InvalidBrainExecutionStateError);
    expect(() => engine.orchestrateCognitiveRequest(noneRequest())).toThrow(
      InvalidBrainExecutionStateError,
    );
  });

  it("applies Engine-state precedence before hostile request inspection", () => {
    const { ports } = fixture();
    const engine = new BrainEngine(ports as unknown as BrainConfiguration);
    const request = new Proxy(
      {},
      {
        ownKeys: () => {
          throw new Error("secret");
        },
      },
    );
    expect(() => engine.orchestrateCognitiveRequest(request as never)).toThrow(
      InvalidBrainExecutionStateError,
    );
    expect(ports.context.getActiveContextRevision).not.toHaveBeenCalled();
  });

  it("rejects malformed requests before collaborators or observer", () => {
    const { ports } = fixture();
    const engine = running(ports);
    expect(() =>
      engine.orchestrateCognitiveRequest({
        ...noneRequest(),
        extra: true,
      } as never),
    ).toThrow(InvalidBrainRequestError);
    expect(ports.context.getActiveContextRevision).not.toHaveBeenCalled();
    expect(ports.lifecycleObserver).not.toHaveBeenCalled();
  });

  it("completes the response branch with exact calls and final authority", () => {
    const { ports, context, reasoning, plan, events } = fixture();
    const engine = running(ports);
    const result = engine.orchestrateCognitiveRequest(noneRequest());
    expect(result).toEqual({
      status: "completed",
      kind: "response",
      requestId: "request:1",
      response: "Exact planning response",
    });
    expect(Object.isFrozen(result)).toBe(true);
    const reasoningCall = (
      ports.reasoning.evaluateReasoning.mock.calls as unknown as Array<
        [{ activeContextRevision: unknown }]
      >
    )[0]![0];
    const planningCall = (
      ports.planning.createCandidatePlan.mock.calls as unknown as Array<
        [{ reasoningOutcome: unknown }]
      >
    )[0]![0];
    expect(reasoningCall).toMatchObject({ activeContextRevision: context });
    expect(Object.keys(reasoningCall)).toEqual([
      "intent",
      "activeContextRevision",
      "query",
    ]);
    expect(reasoningCall.activeContextRevision).toBe(context);
    expect(planningCall.reasoningOutcome).toBe(reasoning);
    expect(ports.planning.verifyCandidatePlanAuthority).toHaveBeenCalledWith(
      expect.objectContaining({ candidate: plan }),
    );
    expect(events).toHaveLength(5);
    if (result.kind !== "response") throw new Error();
    expect(
      engine.verifyFinalCognitiveResult({
        intent: "verify-final-cognitive-response",
        candidate: result,
        expected: {
          kind: "response",
          requestId: result.requestId,
          response: result.response,
        },
      }),
    ).toBe(true);
    expect(
      engine.verifyFinalCognitiveResult({
        intent: "verify-final-cognitive-response",
        candidate: { ...result },
        expected: {
          kind: "response",
          requestId: result.requestId,
          response: result.response,
        },
      }),
    ).toBe(false);
    expect(
      ports.operationAllocator.allocateAuthorizationOperationIdentifier,
    ).not.toHaveBeenCalled();
    expect(ports.selectSkill.selectSkill).not.toHaveBeenCalled();
  });

  it("passes the current fixed Identity + Knowledge Context profile to Reasoning as the sole evidence input", () => {
    const context = knowledgeAwareContext();
    const { ports } = fixture("respond");
    ports.context.getActiveContextRevision.mockReturnValue(context as never);
    ports.context.verifyActiveContextRevisionAuthority.mockImplementation(
      ({ candidate }) => candidate,
    );
    const engine = running(ports);

    expect(engine.orchestrateCognitiveRequest(noneRequest()).kind).toBe(
      "response",
    );
    expect(
      ports.context.verifyActiveContextRevisionAuthority,
    ).toHaveBeenCalledWith(expect.objectContaining({ candidate: context }));
    expect(ports.reasoning.evaluateReasoning).toHaveBeenCalledWith({
      intent: "evaluate",
      activeContextRevision: context,
      query: noneRequest().query,
    });
  });

  it("passes the fixed Identity + Memory Context profile to Reasoning as opaque authoritative Context", () => {
    const context = memoryAwareContext();
    const { ports } = fixture("respond");
    ports.context.getActiveContextRevision.mockReturnValue(context as never);
    ports.context.verifyActiveContextRevisionAuthority.mockImplementation(
      ({ candidate }) => candidate,
    );
    const engine = running(ports);

    expect(engine.orchestrateCognitiveRequest(noneRequest()).kind).toBe(
      "response",
    );
    expect(
      ports.context.verifyActiveContextRevisionAuthority,
    ).toHaveBeenCalledWith(expect.objectContaining({ candidate: context }));
    expect(ports.reasoning.evaluateReasoning).toHaveBeenCalledWith({
      intent: "evaluate",
      activeContextRevision: context,
      query: noneRequest().query,
    });
  });

  it("rejects a Memory fragment with mismatched attribution", () => {
    const valid = memoryAwareContext();
    const malformed = frozen({
      ...valid,
      fragments: frozen([
        valid.fragments[0],
        frozen({
          ...valid.fragments[1],
          authoritativeOwner: "knowledge",
        }),
      ]),
    }) as unknown as ActiveContextRevision;
    const { ports } = fixture("respond");
    ports.context.getActiveContextRevision.mockReturnValue(malformed as never);

    expect(() =>
      running(ports).orchestrateCognitiveRequest(noneRequest()),
    ).toThrow(BrainContextResolutionError);
    expect(ports.reasoning.evaluateReasoning).not.toHaveBeenCalled();
  });

  it.each(["none", "skill-capability"] as const)(
    "completes request-more-context for %s execution intent",
    (kind) => {
      const { ports } = fixture("request-more-context");
      const engine = running(ports);
      const result = engine.orchestrateCognitiveRequest(
        kind === "none" ? noneRequest() : skillRequest(),
      );
      expect(result.kind).toBe("request-more-context");
      expect(ports.selectSkill.selectSkill).not.toHaveBeenCalled();
      expect(
        ports.operationAllocator.allocateAuthorizationOperationIdentifier,
      ).not.toHaveBeenCalled();
    },
  );

  it("executes the total Skill branch in authoritative order and preserves identity", () => {
    const { ports, normalizedResult, events } = fixture();
    const order: string[] = [];
    for (const [recordName, methodName] of [
      ["context", "getActiveContextRevision"],
      ["context", "verifyActiveContextRevisionAuthority"],
      ["reasoning", "evaluateReasoning"],
      ["reasoning", "verifyReasoningOutcomeAuthority"],
      ["planning", "createCandidatePlan"],
      ["planning", "verifyCandidatePlanAuthority"],
      ["selectSkill", "selectSkill"],
      ["operationAllocator", "allocateAuthorizationOperationIdentifier"],
      ["bindSkillToOperation", "bindSkillToOperation"],
      ["resolveSkillExecutionContext", "resolveSkillExecutionContext"],
      [
        "resolveSkillInvocationRequirements",
        "resolveSkillInvocationRequirements",
      ],
      [
        "resolveGovernedAuthorizationEvaluation",
        "resolveGovernedAuthorizationEvaluation",
      ],
      ["protectedInvokeSkill", "invokeBoundSkill"],
      ["verifyNormalizedSkillExecutionResult", "verify"],
    ] as const) {
      const target = (
        ports as unknown as Record<
          string,
          Record<string, ReturnType<typeof vi.fn>>
        >
      )[recordName]![methodName]!;
      const source = target.getMockImplementation();
      target.mockImplementation((...args: unknown[]) => {
        order.push(methodName);
        return (source as ((...values: unknown[]) => unknown) | undefined)?.(
          ...args,
        );
      });
    }
    const engine = running(ports);
    const result = engine.orchestrateCognitiveRequest(skillRequest());
    expect(result.kind).toBe("skill-result");
    if (result.kind !== "skill-result") throw new Error();
    expect(result.result).toBe(normalizedResult);
    expect(result.operationId).toBe("operation:1");
    expect(events).toHaveLength(9);
    expect(
      ports.operationAllocator.allocateAuthorizationOperationIdentifier,
    ).toHaveBeenCalledTimes(1);
    expect(ports.protectedInvokeSkill.invokeBoundSkill).toHaveBeenCalledTimes(
      1,
    );
    expect(order).toEqual([
      "getActiveContextRevision",
      "verifyActiveContextRevisionAuthority",
      "evaluateReasoning",
      "verifyReasoningOutcomeAuthority",
      "createCandidatePlan",
      "verifyCandidatePlanAuthority",
      "selectSkill",
      "allocateAuthorizationOperationIdentifier",
      "bindSkillToOperation",
      "resolveSkillExecutionContext",
      "resolveSkillInvocationRequirements",
      "resolveGovernedAuthorizationEvaluation",
      "invokeBoundSkill",
      "verify",
    ]);
  });

  it("short-circuits Context failure without retry", () => {
    const { ports, events } = fixture();
    ports.context.getActiveContextRevision.mockImplementation(() => {
      throw new Error("private");
    });
    const engine = running(ports);
    expect(() => engine.orchestrateCognitiveRequest(noneRequest())).toThrow(
      BrainContextResolutionError,
    );
    expect(ports.context.getActiveContextRevision).toHaveBeenCalledTimes(1);
    expect(ports.reasoning.evaluateReasoning).not.toHaveBeenCalled();
    expect(events).toHaveLength(2);
  });

  it("normalizes selection unavailability and suppresses allocation", () => {
    const { ports } = fixture();
    ports.selectSkill.selectSkill.mockReturnValue(
      frozen({
        status: "unavailable",
        policy: frozen({
          id: "orion.minimum-skill-selection",
          version: "1.0.0",
        }),
        capability: "weather.read",
        reason: "no-invocation-eligible-skill",
      }) as never,
    );
    const engine = running(ports);
    expect(() => engine.orchestrateCognitiveRequest(skillRequest())).toThrow(
      BrainSkillCoordinationError,
    );
    expect(ports.selectSkill.selectSkill).toHaveBeenCalledTimes(1);
    expect(
      ports.operationAllocator.allocateAuthorizationOperationIdentifier,
    ).not.toHaveBeenCalled();
  });

  it("contains observer throw and restarts lifecycle sequence", () => {
    const { ports } = fixture();
    ports.lifecycleObserver.mockImplementation(() => {
      throw new Error("observer-private");
    });
    const engine = running(ports);
    expect(engine.orchestrateCognitiveRequest(noneRequest()).kind).toBe(
      "response",
    );
    expect(
      engine.orchestrateCognitiveRequest(
        createNormalizedCognitiveRequest({
          ...noneRequest(),
          requestId: "request:2",
        }),
      ).kind,
    ).toBe("response");
    expect(ports.lifecycleObserver).toHaveBeenCalledTimes(10);
    expect(ports.lifecycleObserver.mock.calls[0]![0].sequence).toBe(1);
    expect(ports.lifecycleObserver.mock.calls[5]![0].sequence).toBe(1);
  });
});
