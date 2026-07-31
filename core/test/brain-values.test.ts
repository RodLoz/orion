import { describe, expect, it } from "vitest";

import {
  InvalidBrainExecutionStateError,
  InvalidBrainRequestError,
  InvalidFinalCognitiveResultError,
  brainDiagnosticCorrelationIdentifier,
  brainRequestIdentifier,
  createBrainExecutionIntent,
  createBrainOrchestrationLifecycleEvent,
  createFinalCognitiveResult,
  createNormalizedCognitiveRequest,
} from "../src/index.js";

const validRequest = () => ({
  intent: "orchestrate-cognitive-request",
  requestId: "request-1",
  contextLineageId: "context.lineage.1",
  query: "Provide a response.",
  executionIntent: { kind: "none" },
});

const frozenSkillSuccess = () => {
  const outputs = Object.freeze({ output: "complete" });
  return {
    outputs,
    result: Object.freeze({
      operationId: "operation-1",
      skillId: "diagnostic-skill",
      skillVersion: "1.0.0",
      capability: "diagnostic.invoke",
      status: "succeeded" as const,
      outputs,
    }),
  };
};

describe("Brain Core values", () => {
  it("validates exact Brain and diagnostic identifiers without coercion", () => {
    expect(brainRequestIdentifier("request-1")).toBe("request-1");
    expect(brainRequestIdentifier("A:b_c.d-1")).toBe("A:b_c.d-1");
    expect(brainDiagnosticCorrelationIdentifier("brain-diagnostic:1")).toBe(
      "brain-diagnostic:1",
    );
    expect(() => brainRequestIdentifier("")).toThrow(InvalidBrainRequestError);
    expect(() => brainRequestIdentifier("x".repeat(129))).toThrow(
      InvalidBrainRequestError,
    );
    expect(() =>
      brainRequestIdentifier({ toString: () => "request-1" }),
    ).toThrow(InvalidBrainRequestError);
    expect(() =>
      brainDiagnosticCorrelationIdentifier("brain-diagnostic:0"),
    ).toThrow(InvalidBrainExecutionStateError);
  });

  it("constructs an exact immutable no-Skill request", () => {
    const source = validRequest();
    const request = createNormalizedCognitiveRequest(source);
    expect(request).toEqual(source);
    expect(request).not.toBe(source);
    expect(request.executionIntent).not.toBe(source.executionIntent);
    expect(Object.isFrozen(request)).toBe(true);
    expect(Object.isFrozen(request.executionIntent)).toBe(true);
  });

  it("constructs and canonicalizes an exact Skill execution intent", () => {
    const inputs = Object.assign(Object.create(null), {
      zeta: 1,
      alpha: "value",
    }) as Record<string, unknown>;
    const intent = createBrainExecutionIntent({
      kind: "skill-capability",
      capability: "diagnostic.invoke",
      inputs,
    });
    expect(intent.kind).toBe("skill-capability");
    if (intent.kind !== "skill-capability") throw new Error("unexpected");
    expect(intent.inputs).not.toBe(inputs);
    expect(Object.keys(intent.inputs)).toEqual(["alpha", "zeta"]);
    expect(Object.isFrozen(intent.inputs)).toBe(true);
    inputs.alpha = "mutated";
    expect(intent.inputs.alpha).toBe("value");
  });

  it.each([
    null,
    [],
    {},
    { ...validRequest(), extra: true },
    { ...validRequest(), operationId: "caller-operation" },
    { ...validRequest(), executionIntent: { kind: "none", extra: true } },
    {
      ...validRequest(),
      executionIntent: {
        kind: "skill-capability",
        capability: "diagnostic.invoke",
      },
    },
  ])("rejects malformed request shapes", (value) => {
    expect(() => createNormalizedCognitiveRequest(value)).toThrow(
      InvalidBrainRequestError,
    );
  });

  it("contains hostile request inspection and never invokes getters", () => {
    let getterCalls = 0;
    const getter = {
      ...validRequest(),
      get query() {
        getterCalls += 1;
        return "secret";
      },
    };
    expect(() => createNormalizedCognitiveRequest(getter)).toThrow(
      InvalidBrainRequestError,
    );
    expect(getterCalls).toBe(0);
    expect(() =>
      createNormalizedCognitiveRequest(
        new Proxy(
          {},
          {
            ownKeys: () => {
              throw new Error("secret-native-error");
            },
          },
        ),
      ),
    ).toThrow(InvalidBrainRequestError);
    const revoked = Proxy.revocable({}, {});
    revoked.revoke();
    expect(() => createNormalizedCognitiveRequest(revoked.proxy)).toThrow(
      InvalidBrainRequestError,
    );
    expect(() =>
      createNormalizedCognitiveRequest(
        Object.assign(Object.create({ inherited: true }), validRequest()),
      ),
    ).toThrow(InvalidBrainRequestError);
    expect(() =>
      createNormalizedCognitiveRequest({
        ...validRequest(),
        [Symbol("forbidden")]: true,
      }),
    ).toThrow(InvalidBrainRequestError);
  });

  it("constructs all exact Final Cognitive Result variants", () => {
    const response = createFinalCognitiveResult({
      status: "completed",
      kind: "response",
      requestId: "request-1",
      response: "Prepared response.",
    });
    const more = createFinalCognitiveResult({
      status: "completed",
      kind: "request-more-context",
      requestId: "request-1",
      reason: "planning-requested-more-context",
    });
    expect(response).toEqual({
      status: "completed",
      kind: "response",
      requestId: "request-1",
      response: "Prepared response.",
    });
    expect(more).toEqual({
      status: "completed",
      kind: "request-more-context",
      requestId: "request-1",
      reason: "planning-requested-more-context",
    });
    expect(Object.isFrozen(response)).toBe(true);
    expect(Object.isFrozen(more)).toBe(true);
  });

  it("preserves the exact immutable Skill-issued result identity", () => {
    const { outputs, result } = frozenSkillSuccess();
    const final = createFinalCognitiveResult({
      status: "completed",
      kind: "skill-result",
      requestId: "request-1",
      operationId: "operation-1",
      result,
    });
    expect(final.kind).toBe("skill-result");
    if (final.kind !== "skill-result") throw new Error("unexpected");
    expect(final.result).toBe(result);
    expect(final.result.status).toBe("succeeded");
    if (final.result.status !== "succeeded") throw new Error("unexpected");
    expect(final.result.outputs).toBe(outputs);
    expect(Object.isFrozen(final)).toBe(true);
  });

  it("accepts an exact frozen declared-failure Skill result", () => {
    const result = Object.freeze({
      operationId: "operation-1",
      skillId: "diagnostic-skill",
      skillVersion: "1.0.0",
      capability: "diagnostic.invoke",
      status: "failed" as const,
      failureMode: "diagnostic.failure",
    });
    const final = createFinalCognitiveResult({
      status: "completed",
      kind: "skill-result",
      requestId: "request-1",
      operationId: "operation-1",
      result,
    });
    expect(final.kind).toBe("skill-result");
    if (final.kind !== "skill-result") throw new Error("unexpected");
    expect(final.result).toBe(result);
  });

  it("rejects mutable Skill result graphs without freezing or mutation", () => {
    const mutableOuter = {
      operationId: "operation-1",
      skillId: "diagnostic-skill",
      skillVersion: "1.0.0",
      capability: "diagnostic.invoke",
      status: "failed" as const,
      failureMode: "diagnostic.failure",
    };
    expect(() =>
      createFinalCognitiveResult({
        status: "completed",
        kind: "skill-result",
        requestId: "request-1",
        operationId: "operation-1",
        result: mutableOuter,
      }),
    ).toThrow(InvalidFinalCognitiveResultError);
    expect(Object.isFrozen(mutableOuter)).toBe(false);

    const mutableOutputs = { output: "complete" };
    const mutableNested = Object.freeze({
      operationId: "operation-1",
      skillId: "diagnostic-skill",
      skillVersion: "1.0.0",
      capability: "diagnostic.invoke",
      status: "succeeded" as const,
      outputs: mutableOutputs,
    });
    expect(() =>
      createFinalCognitiveResult({
        status: "completed",
        kind: "skill-result",
        requestId: "request-1",
        operationId: "operation-1",
        result: mutableNested,
      }),
    ).toThrow(InvalidFinalCognitiveResultError);
    expect(Object.isFrozen(mutableOutputs)).toBe(false);
  });

  it("captures Skill result data without invoking getters or Proxy get traps", () => {
    let getterCalls = 0;
    const accessorResult = {
      get operationId() {
        getterCalls += 1;
        return "operation-1";
      },
      skillId: "diagnostic-skill",
      skillVersion: "1.0.0",
      capability: "diagnostic.invoke",
      status: "failed" as const,
      failureMode: "diagnostic.failure",
    };
    Object.freeze(accessorResult);
    expect(() =>
      createFinalCognitiveResult({
        status: "completed",
        kind: "skill-result",
        requestId: "request-1",
        operationId: "operation-1",
        result: accessorResult,
      }),
    ).toThrow(InvalidFinalCognitiveResultError);
    expect(getterCalls).toBe(0);

    let getTrapCalls = 0;
    const target = frozenSkillSuccess().result;
    const proxiedResult = new Proxy(target, {
      get: () => {
        getTrapCalls += 1;
        throw new Error("get trap must not run");
      },
    });
    const final = createFinalCognitiveResult({
      status: "completed",
      kind: "skill-result",
      requestId: "request-1",
      operationId: "operation-1",
      result: proxiedResult,
    });
    expect(final.kind).toBe("skill-result");
    if (final.kind !== "skill-result") throw new Error("unexpected");
    expect(final.result).toBe(proxiedResult);
    expect(getTrapCalls).toBe(0);
  });

  it("rejects hostile, revoked, custom-prototype, and symbol Skill results", () => {
    const hostile = new Proxy(frozenSkillSuccess().result, {
      ownKeys: () => {
        throw new Error("hostile ownKeys trap");
      },
    });
    expect(() =>
      createFinalCognitiveResult({
        status: "completed",
        kind: "skill-result",
        requestId: "request-1",
        operationId: "operation-1",
        result: hostile,
      }),
    ).toThrow(InvalidFinalCognitiveResultError);

    const revoked = Proxy.revocable(frozenSkillSuccess().result, {});
    revoked.revoke();
    expect(() =>
      createFinalCognitiveResult({
        status: "completed",
        kind: "skill-result",
        requestId: "request-1",
        operationId: "operation-1",
        result: revoked.proxy,
      }),
    ).toThrow(InvalidFinalCognitiveResultError);

    const customPrototype = Object.freeze(
      Object.assign(Object.create({ inherited: true }), {
        operationId: "operation-1",
        skillId: "diagnostic-skill",
        skillVersion: "1.0.0",
        capability: "diagnostic.invoke",
        status: "failed" as const,
        failureMode: "diagnostic.failure",
      }),
    );
    expect(() =>
      createFinalCognitiveResult({
        status: "completed",
        kind: "skill-result",
        requestId: "request-1",
        operationId: "operation-1",
        result: customPrototype,
      }),
    ).toThrow(InvalidFinalCognitiveResultError);

    const symbolResult = Object.freeze({
      ...frozenSkillSuccess().result,
      [Symbol("forbidden")]: true,
    });
    expect(() =>
      createFinalCognitiveResult({
        status: "completed",
        kind: "skill-result",
        requestId: "request-1",
        operationId: "operation-1",
        result: symbolResult,
      }),
    ).toThrow(InvalidFinalCognitiveResultError);
  });

  it("accepts a frozen structural Skill-result clone without conferring authority", () => {
    const issued = frozenSkillSuccess().result;
    const clone = Object.freeze({
      ...issued,
      outputs: Object.freeze({ ...issued.outputs }),
    });
    const final = createFinalCognitiveResult({
      status: "completed",
      kind: "skill-result",
      requestId: "request-1",
      operationId: "operation-1",
      result: clone,
    });
    expect(final.kind).toBe("skill-result");
    if (final.kind !== "skill-result") throw new Error("unexpected");
    expect(final.result).toBe(clone);
    expect(final.result).not.toBe(issued);
  });

  it.each([
    {},
    {
      status: "completed",
      kind: "response",
      requestId: "request-1",
      response: "Prepared response.",
      operationId: "forbidden",
    },
    {
      status: "completed",
      kind: "request-more-context",
      requestId: "request-1",
      reason: "other",
    },
    {
      status: "completed",
      kind: "skill-result",
      requestId: "request-1",
      operationId: "operation-1",
      result: {
        operationId: "operation-2",
        skillId: "diagnostic-skill",
        skillVersion: "1.0.0",
        capability: "diagnostic.invoke",
        status: "failed",
        failureMode: "diagnostic.failure",
      },
    },
  ])("rejects malformed or contradictory Final Cognitive Results", (value) => {
    expect(() => createFinalCognitiveResult(value)).toThrow(
      InvalidFinalCognitiveResultError,
    );
  });

  it("constructs only exact valid lifecycle transitions", () => {
    const event = createBrainOrchestrationLifecycleEvent({
      sequence: 1,
      from: "none",
      to: "proposed",
      category: "orchestration-proposed",
      diagnosticCorrelationId: "brain-diagnostic:1",
    });
    expect(event).toEqual({
      sequence: 1,
      from: "none",
      to: "proposed",
      category: "orchestration-proposed",
      diagnosticCorrelationId: "brain-diagnostic:1",
    });
    expect(Object.isFrozen(event)).toBe(true);
    expect(() =>
      createBrainOrchestrationLifecycleEvent({
        ...event,
        to: "completed",
      }),
    ).toThrow(InvalidBrainExecutionStateError);
    expect(() =>
      createBrainOrchestrationLifecycleEvent({
        ...event,
        sequence: 0,
      }),
    ).toThrow(InvalidBrainExecutionStateError);
  });
});
