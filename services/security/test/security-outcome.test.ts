import { describe, expect, it, vi } from "vitest";
import {
  InvalidAuthorizationInputError,
  createAuthorizationEvaluationOutcome,
} from "@orion/core";
import {
  ProcessLocalConfirmationAuthority,
  ProcessLocalGrantEvidenceAuthority,
  ProcessLocalRequirementsAuthority,
  ProcessLocalSecurityContextAuthority,
  SecurityEngine,
} from "../src/index.js";

function fixture() {
  const calls = {
    requirements: vi.fn(),
    context: vi.fn(),
    grants: vi.fn(),
    confirmation: vi.fn(),
  };
  const engine = new SecurityEngine({
    requirements: new ProcessLocalRequirementsAuthority((request) => {
      calls.requirements();
      return {
        status: "available",
        requirements: {
          operationId: request.operationId,
          action: request.action,
          resource: request.resource,
          requiredPermissions: [],
          sensitivity: "standard",
        },
      };
    }),
    context: new ProcessLocalSecurityContextAuthority((request) => {
      calls.context();
      return {
        operationId: request.operationId,
        subject: { kind: "anonymous" },
        context: "available",
        device: "not-applicable",
        session: "not-applicable",
        trustLevel: "not-applicable",
      };
    }),
    grants: new ProcessLocalGrantEvidenceAuthority((request) => {
      calls.grants();
      return {
        status: "available",
        operationId: request.operationId,
        subject: request.subject,
        action: request.action,
        resource: request.resource,
        evaluatedPermissions: request.requiredPermissions,
        grants: [],
      };
    }),
    confirmation: new ProcessLocalConfirmationAuthority(() => {
      calls.confirmation();
      return { status: "absent" };
    }),
  });
  engine.initialize();
  engine.start();
  return { engine, calls };
}

const target = {
  operationId: "outcome-op",
  action: "skill.invoke",
  resource: { kind: "identified" as const, resourceId: "skill:weather-reader" },
};

describe("Security atomic Authorization Evaluation Outcome", () => {
  it("co-issues exact Artifact and Summary with one call per reached authority", () => {
    const { engine, calls } = fixture();
    const outcome = engine.evaluateAuthorizationOutcome({
      intent: "evaluate-authorization-outcome",
      ...target,
    });
    expect(outcome.authorization.operationId).toBe(target.operationId);
    expect(outcome.securityEvaluationSummary.securityContext).toEqual(
      outcome.authorization.securityContext,
    );
    expect(calls.requirements).toHaveBeenCalledTimes(1);
    expect(calls.context).toHaveBeenCalledTimes(1);
    expect(calls.grants).toHaveBeenCalledTimes(1);
    expect(calls.confirmation).toHaveBeenCalledTimes(0);
    expect(
      engine.verifyAuthorizationEvaluationOutcome({
        intent: "verify-authorization-evaluation-outcome",
        outcome,
        operationId: target.operationId,
      }),
    ).toBe(true);
    expect(calls.requirements).toHaveBeenCalledTimes(1);
    expect(calls.context).toHaveBeenCalledTimes(1);
    expect(calls.grants).toHaveBeenCalledTimes(1);
    expect(calls.confirmation).toHaveBeenCalledTimes(0);
  });

  it("preserves legacy Artifact projection through the same semantics", () => {
    const { engine } = fixture();
    const legacy = engine.evaluateAuthorization({
      intent: "evaluate-authorization",
      ...target,
    });
    const outcome = engine.evaluateAuthorizationOutcome({
      intent: "evaluate-authorization-outcome",
      ...target,
    });
    expect(legacy).toEqual(outcome.authorization);
  });

  it("rejects factory, clone, spread, reconstruction, and another instance", () => {
    const first = fixture().engine;
    const second = fixture().engine;
    const outcome = first.evaluateAuthorizationOutcome({
      intent: "evaluate-authorization-outcome",
      ...target,
    });
    const candidates = [
      createAuthorizationEvaluationOutcome(outcome),
      { ...outcome },
      structuredClone(outcome),
      JSON.parse(JSON.stringify(outcome)),
    ];
    for (const candidate of candidates)
      expect(
        first.verifyAuthorizationEvaluationOutcome({
          intent: "verify-authorization-evaluation-outcome",
          outcome: candidate,
          operationId: target.operationId,
        }),
      ).toBe(false);
    expect(
      second.verifyAuthorizationEvaluationOutcome({
        intent: "verify-authorization-evaluation-outcome",
        outcome,
        operationId: target.operationId,
      }),
    ).toBe(false);
  });

  it("rejects cross-evaluation nested mixing even with identical visible values", () => {
    const engine = fixture().engine;
    const first = engine.evaluateAuthorizationOutcome({
      intent: "evaluate-authorization-outcome",
      ...target,
    });
    const second = engine.evaluateAuthorizationOutcome({
      intent: "evaluate-authorization-outcome",
      ...target,
    });
    for (const mixed of [
      {
        authorization: first.authorization,
        securityEvaluationSummary: second.securityEvaluationSummary,
      },
      {
        authorization: second.authorization,
        securityEvaluationSummary: first.securityEvaluationSummary,
      },
    ])
      expect(
        engine.verifyAuthorizationEvaluationOutcome({
          intent: "verify-authorization-evaluation-outcome",
          outcome: mixed,
          operationId: target.operationId,
        }),
      ).toBe(false);
  });

  it("rejects malformed verifier requests without policy evaluation", () => {
    const { engine, calls } = fixture();
    expect(() => engine.verifyAuthorizationEvaluationOutcome({})).toThrow(
      InvalidAuthorizationInputError,
    );
    expect(calls.requirements).not.toHaveBeenCalled();
    expect(calls.context).not.toHaveBeenCalled();
  });

  it("hostile-safely validates the exact verifier request envelope", () => {
    const { engine } = fixture();
    const outcome = engine.evaluateAuthorizationOutcome({
      intent: "evaluate-authorization-outcome",
      ...target,
    });
    const valid = {
      intent: "verify-authorization-evaluation-outcome",
      outcome,
      operationId: target.operationId,
    };
    const validBefore = { ...valid };
    expect(engine.verifyAuthorizationEvaluationOutcome(valid)).toBe(true);
    expect(valid).toEqual(validBefore);
    expect(Object.isFrozen(valid)).toBe(false);
    expect(Object.isFrozen(outcome)).toBe(true);
    let getterCalls = 0;
    const accessor = { ...valid } as Record<string, unknown>;
    Object.defineProperty(accessor, "intent", {
      enumerable: true,
      get() {
        getterCalls += 1;
        return "verify-authorization-evaluation-outcome";
      },
    });
    const stateful = { ...valid } as Record<string, unknown>;
    Object.defineProperty(stateful, "operationId", {
      enumerable: true,
      get() {
        getterCalls += 1;
        return target.operationId;
      },
    });
    const ownKeys = new Proxy(valid, {
      ownKeys() {
        throw new Error("verifier-secret");
      },
    });
    const descriptor = new Proxy(valid, {
      getOwnPropertyDescriptor() {
        throw new Error("verifier-secret");
      },
    });
    const revoked = Proxy.revocable(valid, {});
    revoked.revoke();
    const cases: unknown[] = [
      null,
      undefined,
      1,
      "request",
      [],
      {},
      { ...valid, operationId: undefined },
      { ...valid, extra: true },
      { ...valid, [Symbol("secret")]: true },
      Object.create(valid),
      Object.assign(Object.create({ custom: true }), valid),
      accessor,
      stateful,
      ownKeys,
      descriptor,
      revoked.proxy,
    ];
    for (const request of cases)
      expect(() =>
        engine.verifyAuthorizationEvaluationOutcome(request),
      ).toThrow(InvalidAuthorizationInputError);
    expect(getterCalls).toBe(0);
  });

  it("rejects independently replaced issued nested identities", () => {
    const { engine } = fixture();
    const first = engine.evaluateAuthorizationOutcome({
      intent: "evaluate-authorization-outcome",
      ...target,
    });
    const second = engine.evaluateAuthorizationOutcome({
      intent: "evaluate-authorization-outcome",
      ...target,
    });
    for (const outcome of [
      {
        authorization: second.authorization,
        securityEvaluationSummary: first.securityEvaluationSummary,
      },
      {
        authorization: first.authorization,
        securityEvaluationSummary: second.securityEvaluationSummary,
      },
    ])
      expect(
        engine.verifyAuthorizationEvaluationOutcome({
          intent: "verify-authorization-evaluation-outcome",
          outcome,
          operationId: target.operationId,
        }),
      ).toBe(false);
  });
});
