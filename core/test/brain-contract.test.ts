import { describe, expect, expectTypeOf, it } from "vitest";

import {
  BrainAuthorizationResolutionError,
  BrainContextResolutionError,
  BrainPlanningResolutionError,
  BrainProtectedInvocationError,
  BrainReasoningResolutionError,
  BrainSkillCoordinationError,
  InvalidBrainAuthorityError,
  InvalidBrainExecutionStateError,
  InvalidBrainPlanError,
  InvalidBrainRequestError,
  InvalidFinalCognitiveResultError,
  type AllocateAuthorizationOperationIdentifierRequest,
  type BrainConfiguration,
  type BrainContextAuthorityPort,
  type BrainPlanningAuthorityPort,
  type BrainReasoningAuthorityPort,
  type OrchestrateCognitiveRequest,
  type VerifyFinalCognitiveResult,
  type VerifyFinalCognitiveResultRequest,
} from "../src/index.js";

describe("Brain Core Contracts", () => {
  it("defines exactly the closed public Brain failure taxonomy", () => {
    const failures = [
      new InvalidBrainRequestError(),
      new InvalidBrainAuthorityError(),
      new BrainContextResolutionError(),
      new BrainReasoningResolutionError(),
      new BrainPlanningResolutionError(),
      new InvalidBrainPlanError(),
      new BrainSkillCoordinationError(),
      new BrainAuthorizationResolutionError(),
      new BrainProtectedInvocationError(),
      new InvalidFinalCognitiveResultError(),
      new InvalidBrainExecutionStateError(),
    ];
    expect(failures.map((failure) => failure.name)).toEqual([
      "InvalidBrainRequestError",
      "InvalidBrainAuthorityError",
      "BrainContextResolutionError",
      "BrainReasoningResolutionError",
      "BrainPlanningResolutionError",
      "InvalidBrainPlanError",
      "BrainSkillCoordinationError",
      "BrainAuthorizationResolutionError",
      "BrainProtectedInvocationError",
      "InvalidFinalCognitiveResultError",
      "InvalidBrainExecutionStateError",
    ]);
    expect(failures.every((failure) => failure.message.length > 0)).toBe(true);
  });

  it("types the synchronous orchestration Contract without implementation authority", () => {
    const contract: OrchestrateCognitiveRequest = {
      orchestrateCognitiveRequest: (request) => ({
        status: "completed",
        kind: "request-more-context",
        requestId: request.requestId,
        reason: "planning-requested-more-context",
      }),
    };
    expect(typeof contract.orchestrateCognitiveRequest).toBe("function");
  });

  it("defines the three exact Final Cognitive Result verifier requests", () => {
    const requests: VerifyFinalCognitiveResultRequest[] = [
      {
        intent: "verify-final-cognitive-response",
        candidate: {},
        expected: {
          kind: "response",
          requestId: "request-1" as never,
          response: "response" as never,
        },
      },
      {
        intent: "verify-final-request-more-context",
        candidate: {},
        expected: {
          kind: "request-more-context",
          requestId: "request-1" as never,
          reason: "planning-requested-more-context",
        },
      },
      {
        intent: "verify-final-skill-result",
        candidate: {},
        expected: {
          kind: "skill-result",
          requestId: "request-1" as never,
          operationId: "operation-1" as never,
          skillId: "skill-1" as never,
          skillVersion: "1.0.0" as never,
          capability: "diagnostic.invoke" as never,
          normalizedResult: {} as never,
        },
      },
    ];
    const verifier: VerifyFinalCognitiveResult = {
      verifyFinalCognitiveResult: (request) =>
        requests.includes(request as VerifyFinalCognitiveResultRequest),
    };
    expect(requests.map((request) => request.intent)).toEqual([
      "verify-final-cognitive-response",
      "verify-final-request-more-context",
      "verify-final-skill-result",
    ]);
    expect(verifier.verifyFinalCognitiveResult(requests[0]!)).toBe(true);
  });

  it("defines the exact allocation request without lower-level authority fields", () => {
    const request: AllocateAuthorizationOperationIdentifierRequest = {
      intent: "allocate-authorization-operation",
      requestId: "request-1" as never,
      skillId: "skill-1" as never,
      skillVersion: "1.0.0" as never,
      capability: "diagnostic.invoke" as never,
    };
    expect(Object.keys(request)).toEqual([
      "intent",
      "requestId",
      "skillId",
      "skillVersion",
      "capability",
    ]);
  });

  it("represents the exact twelve configured ports without issuer wrappers", () => {
    const configuration: BrainConfiguration = {
      context: {
        getActiveContextRevision: () => null as never,
        verifyActiveContextRevisionAuthority: () => null as never,
      },
      reasoning: {
        evaluateReasoning: () => null as never,
        verifyReasoningOutcomeAuthority: () => null as never,
      },
      planning: {
        createCandidatePlan: () => null as never,
        verifyCandidatePlanAuthority: () => null as never,
      },
      selectSkill: { selectSkill: () => null as never },
      operationAllocator: {
        allocateAuthorizationOperationIdentifier: () => "operation-1" as never,
      },
      bindSkillToOperation: { bindSkillToOperation: () => null as never },
      resolveSkillExecutionContext: {
        resolveSkillExecutionContext: () => null as never,
      },
      resolveSkillInvocationRequirements: {
        resolveSkillInvocationRequirements: () => null as never,
      },
      resolveGovernedAuthorizationEvaluation: {
        resolveGovernedAuthorizationEvaluation: () => null as never,
      },
      protectedInvokeSkill: {
        invokeBoundSkill: () => null as never,
      },
      verifyNormalizedSkillExecutionResult: {
        verify: () => false,
      },
      lifecycleObserver: () => undefined,
    };
    expect(Object.keys(configuration)).toEqual([
      "context",
      "reasoning",
      "planning",
      "selectSkill",
      "operationAllocator",
      "bindSkillToOperation",
      "resolveSkillExecutionContext",
      "resolveSkillInvocationRequirements",
      "resolveGovernedAuthorizationEvaluation",
      "protectedInvokeSkill",
      "verifyNormalizedSkillExecutionResult",
      "lifecycleObserver",
    ]);
    expect(
      Object.values(configuration.context).every(
        (value) => typeof value === "function",
      ),
    ).toBe(true);
    expect(
      Object.values(configuration.reasoning).every(
        (value) => typeof value === "function",
      ),
    ).toBe(true);
    expect(
      Object.values(configuration.planning).every(
        (value) => typeof value === "function",
      ),
    ).toBe(true);
    expect(
      Object.keys(configuration).some((key) =>
        /register|mint|bootstrap/i.test(key),
      ),
    ).toBe(false);

    expectTypeOf<keyof BrainConfiguration>().toEqualTypeOf<
      | "context"
      | "reasoning"
      | "planning"
      | "selectSkill"
      | "operationAllocator"
      | "bindSkillToOperation"
      | "resolveSkillExecutionContext"
      | "resolveSkillInvocationRequirements"
      | "resolveGovernedAuthorizationEvaluation"
      | "protectedInvokeSkill"
      | "verifyNormalizedSkillExecutionResult"
      | "lifecycleObserver"
    >();
    expectTypeOf<
      BrainContextAuthorityPort["getActiveContextRevision"]
    >().toBeFunction();
    expectTypeOf<
      BrainContextAuthorityPort["verifyActiveContextRevisionAuthority"]
    >().toBeFunction();
    expectTypeOf<
      BrainReasoningAuthorityPort["evaluateReasoning"]
    >().toBeFunction();
    expectTypeOf<
      BrainReasoningAuthorityPort["verifyReasoningOutcomeAuthority"]
    >().toBeFunction();
    expectTypeOf<
      BrainPlanningAuthorityPort["createCandidatePlan"]
    >().toBeFunction();
    expectTypeOf<
      BrainPlanningAuthorityPort["verifyCandidatePlanAuthority"]
    >().toBeFunction();

    const { planning: omittedPlanning, ...missingPlanning } = configuration;
    expect(omittedPlanning).toBe(configuration.planning);
    // @ts-expect-error Planning is a required configured port.
    const invalidMissing: BrainConfiguration = missingPlanning;
    expect(invalidMissing).toBeDefined();

    const invalidExtra: BrainConfiguration = {
      ...configuration,
      // @ts-expect-error Extra configuration ports are not authorized.
      mint: () => {},
    };
    expect(invalidExtra).toBeDefined();

    // @ts-expect-error Configured operation fields must retain callable signatures.
    const invalidCallable: BrainContextAuthorityPort["getActiveContextRevision"] =
      "not-callable";
    expect(invalidCallable).toBeDefined();
  });
});
