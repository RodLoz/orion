import { describe, expect, it, vi } from "vitest";
import {
  InvalidAuthorizationInputError,
  InvalidGovernedAuthorizationEvaluationError,
  InvalidSkillExecutionStateError,
  createAuthorizationDecisionArtifact,
  createAuthorizationEvaluationOutcome,
  createGovernedSecurityEvaluationSummary,
} from "@orion/core";
import { ProcessLocalGovernedAuthorizationEvaluationAuthority } from "../src/skill/governed-authorization-authority.js";

const request = {
  intent: "resolve-governed-authorization-evaluation" as const,
  request: {
    intent: "evaluate-authorization-outcome" as const,
    operationId: "operation-1" as never,
    action: "skill.invoke" as never,
    resource: {
      kind: "identified" as const,
      resourceId: "skill:weather-reader" as never,
    },
  },
};

function artifact(decision: "allow" | "deny" | "indeterminate" = "allow") {
  return createAuthorizationDecisionArtifact({
    operationId: "operation-1",
    decision,
    subject: { kind: "anonymous" },
    action: "skill.invoke",
    resource: { kind: "identified", resourceId: "skill:weather-reader" },
    requirementsStatus:
      decision === "indeterminate" ? "unavailable" : "available",
    evaluatedPermissions: decision === "deny" ? ["weather.read"] : [],
    sensitivity: decision === "indeterminate" ? "unavailable" : "standard",
    securityContext: {
      context: "available",
      device: "not-applicable",
      session: "not-applicable",
      trustLevel: "not-applicable",
    },
    policy: { id: "orion.minimum-authorization", version: "1.0.0" },
    reason:
      decision === "allow"
        ? "no-permission-required"
        : decision === "deny"
          ? "missing-required-permission"
          : "requirements-unavailable",
    evidence: {
      grantEvidenceStatus:
        decision === "indeterminate" ? "not-evaluated" : "available",
      confirmationStatus:
        decision === "indeterminate" ? "not-evaluated" : "not-required",
    },
  });
}
function outcome(decision: "allow" | "deny" | "indeterminate" = "allow") {
  const authorization = artifact(decision);
  return createAuthorizationEvaluationOutcome({
    authorization,
    securityEvaluationSummary: createGovernedSecurityEvaluationSummary({
      operationId: authorization.operationId,
      subject: authorization.subject,
      securityContext: authorization.securityContext,
    }),
  });
}
function authorityFor(evaluateAuthorizationOutcome: () => unknown) {
  const issued = new WeakSet<object>();
  const evaluator = {
    evaluateAuthorization: vi.fn(),
    evaluateAuthorizationOutcome: vi.fn(() => {
      const value = evaluateAuthorizationOutcome();
      if (typeof value === "object" && value !== null) issued.add(value);
      return value as never;
    }),
  };
  const verifier = {
    verifyAuthorizationEvaluationOutcome: vi.fn(
      (candidate: { outcome?: unknown }) =>
        typeof candidate.outcome === "object" &&
        candidate.outcome !== null &&
        issued.has(candidate.outcome),
    ),
  };
  return {
    evaluator,
    verifier,
    authority: new ProcessLocalGovernedAuthorizationEvaluationAuthority(
      evaluator,
      verifier,
    ),
  };
}

describe("M9 governed authorization authority", () => {
  it("proves every governed Outcome precedence boundary suppresses the next collaborator or stage", () => {
    const malformedRequest = authorityFor(outcome);
    expect(() =>
      malformedRequest.authority.resolve({
        ...request,
        request: { ...request.request, action: undefined },
      } as never),
    ).toThrow(InvalidGovernedAuthorizationEvaluationError);
    expect(
      malformedRequest.evaluator.evaluateAuthorizationOutcome,
    ).toHaveBeenCalledTimes(0);
    expect(
      malformedRequest.verifier.verifyAuthorizationEvaluationOutcome,
    ).toHaveBeenCalledTimes(0);

    const malformedOutcome = authorityFor(() => ({}));
    expect(() => malformedOutcome.authority.resolve(request)).toThrow(
      InvalidGovernedAuthorizationEvaluationError,
    );
    expect(
      malformedOutcome.evaluator.evaluateAuthorizationOutcome,
    ).toHaveBeenCalledTimes(1);
    expect(
      malformedOutcome.verifier.verifyAuthorizationEvaluationOutcome,
    ).toHaveBeenCalledTimes(0);

    let nestedReads = 0;
    const genuine = outcome();
    const hostile = {};
    Object.defineProperty(hostile, "authorization", {
      enumerable: true,
      get() {
        nestedReads += 1;
        throw new Error("later-artifact-secret");
      },
    });
    Object.defineProperty(hostile, "securityEvaluationSummary", {
      enumerable: true,
      value: genuine.securityEvaluationSummary,
    });
    const rejected = authorityFor(() => hostile);
    rejected.verifier.verifyAuthorizationEvaluationOutcome.mockReturnValue(
      false,
    );
    expect(() => rejected.authority.resolve(request)).toThrow(
      InvalidGovernedAuthorizationEvaluationError,
    );
    expect(
      rejected.evaluator.evaluateAuthorizationOutcome,
    ).toHaveBeenCalledTimes(1);
    expect(
      rejected.verifier.verifyAuthorizationEvaluationOutcome,
    ).toHaveBeenCalledTimes(0);
    expect(nestedReads).toBe(0);
  });

  it("proves verification, provenance, correspondence, and exact-return order", () => {
    const wrongOperationOutcome = () => {
      const authorization = createAuthorizationDecisionArtifact({
        ...artifact(),
        operationId: "operation-other",
      });
      return createAuthorizationEvaluationOutcome({
        authorization,
        securityEvaluationSummary: createGovernedSecurityEvaluationSummary({
          operationId: "operation-other",
          subject: authorization.subject,
          securityContext: authorization.securityContext,
        }),
      });
    };
    const malformed = authorityFor(() => ({}));
    expect(() => malformed.authority.resolve(request)).toThrow(
      InvalidGovernedAuthorizationEvaluationError,
    );
    expect(
      malformed.verifier.verifyAuthorizationEvaluationOutcome,
    ).toHaveBeenCalledTimes(0);

    const verificationFailure = authorityFor(outcome);
    verificationFailure.verifier.verifyAuthorizationEvaluationOutcome.mockImplementation(
      () => 1 as never,
    );
    let returned = 0;
    try {
      verificationFailure.authority.resolve(request);
      returned += 1;
    } catch (error) {
      expect(error).toBeInstanceOf(InvalidSkillExecutionStateError);
    }
    expect(
      verificationFailure.verifier.verifyAuthorizationEvaluationOutcome,
    ).toHaveBeenCalledTimes(1);
    expect(returned).toBe(0);

    let correspondenceCalls = 0;
    const originalIs = Object.is;
    const correspondenceCounter = vi
      .spyOn(Object, "is")
      .mockImplementation((left: unknown, right: unknown) => {
        if (
          (left === "operation-other" && right === "operation-1") ||
          (left === "operation-1" && right === "operation-other")
        )
          correspondenceCalls += 1;
        return originalIs(left, right);
      });
    try {
      const provenanceFailure = authorityFor(wrongOperationOutcome);
      provenanceFailure.verifier.verifyAuthorizationEvaluationOutcome.mockReturnValue(
        false,
      );
      returned = 0;
      try {
        provenanceFailure.authority.resolve(request);
        returned += 1;
      } catch (error) {
        expect(error).toBeInstanceOf(
          InvalidGovernedAuthorizationEvaluationError,
        );
      }
      expect(
        provenanceFailure.verifier.verifyAuthorizationEvaluationOutcome,
      ).toHaveBeenCalledTimes(1);
      expect(returned).toBe(0);
      expect(correspondenceCalls).toBe(0);

      const wrongOperation = authorityFor(wrongOperationOutcome);
      returned = 0;
      try {
        wrongOperation.authority.resolve(request);
        returned += 1;
      } catch (error) {
        expect(error).toBeInstanceOf(
          InvalidGovernedAuthorizationEvaluationError,
        );
      }
      expect(
        wrongOperation.verifier.verifyAuthorizationEvaluationOutcome,
      ).toHaveBeenCalledTimes(1);
      expect(correspondenceCalls).toBe(1);
      expect(returned).toBe(0);
    } finally {
      correspondenceCounter.mockRestore();
    }
  });

  it("calls the configured evaluator once and mints only its matching result", () => {
    const fixture = authorityFor(outcome);
    const { authority } = fixture;
    const result = authority.resolve(request);
    expect(
      fixture.evaluator.evaluateAuthorizationOutcome,
    ).toHaveBeenCalledTimes(1);
    expect(fixture.evaluator.evaluateAuthorization).toHaveBeenCalledTimes(0);
    expect(
      authority.verifyAuthorizationEvaluationOutcome({
        intent: "verify-authorization-evaluation-outcome",
        outcome: result,
        operationId: "operation-1",
      }),
    ).toBe(true);
    expect(
      authority.verifyAuthorizationEvaluationOutcome({
        intent: "verify-authorization-evaluation-outcome",
        outcome: { ...result },
        operationId: "operation-1",
      }),
    ).toBe(false);
    expect(Object.isFrozen(request)).toBe(false);
  });

  it.each([
    null,
    undefined,
    1,
    "request",
    true,
    1n,
    Symbol("request"),
    () => request,
    [],
    {},
    { ...request, extra: true },
    { ...request, request: { ...request.request, operationId: undefined } },
    { ...request, request: { ...request.request, extra: true } },
    Object.create(request),
    Object.assign(Object.create({ custom: true }), request),
    { ...request, [Symbol("secret")]: true },
    new Proxy(
      {},
      {
        ownKeys() {
          throw new Error("request-secret");
        },
      },
    ),
  ])("normalizes malformed and hostile request %#", (candidate) => {
    const { evaluator, authority } = authorityFor(outcome);
    expect(() => authority.resolve(candidate as never)).toThrow(
      InvalidGovernedAuthorizationEvaluationError,
    );
    expect(evaluator.evaluateAuthorizationOutcome).not.toHaveBeenCalled();
  });

  it.each([
    new Error("native-secret"),
    new InvalidAuthorizationInputError(),
    "primitive-secret",
  ])("contains evaluator throw %#", (thrown) => {
    const { authority } = authorityFor(() => {
      throw thrown;
    });
    expect(() => authority.resolve(request)).toThrow(
      InvalidSkillExecutionStateError,
    );
  });

  it("rejects malformed and hostile evaluator results despite source trust", () => {
    for (const candidate of [
      {},
      new Proxy(
        {},
        {
          ownKeys() {
            throw new Error("artifact-secret");
          },
        },
      ),
    ]) {
      const { authority } = authorityFor(() => candidate);
      expect(() => authority.resolve(request)).toThrow(
        InvalidGovernedAuthorizationEvaluationError,
      );
    }
  });

  it.each(["allow", "deny", "indeterminate"] as const)(
    "returns the exact genuine %s Outcome",
    (decision) => {
      const fixture = authorityFor(() => outcome(decision));
      const result = fixture.authority.resolve(request);
      expect(result.authorization.decision).toBe(decision);
      expect(
        fixture.verifier.verifyAuthorizationEvaluationOutcome,
      ).toHaveBeenCalledTimes(1);
      expect(
        fixture.evaluator.evaluateAuthorizationOutcome,
      ).toHaveBeenCalledTimes(1);
      expect(fixture.evaluator.evaluateAuthorization).toHaveBeenCalledTimes(0);
    },
  );

  it("contains descriptor/getter/revoked request hostility without source calls", () => {
    const valid = structuredClone(request);
    let getterCalls = 0;
    const accessor = { ...valid };
    Object.defineProperty(accessor, "intent", {
      enumerable: true,
      get() {
        getterCalls += 1;
        return "resolve-governed-authorization-evaluation";
      },
    });
    const descriptor = new Proxy(valid, {
      getOwnPropertyDescriptor() {
        throw new Error("request-secret");
      },
    });
    const revoked = Proxy.revocable(valid, {});
    revoked.revoke();
    for (const candidate of [
      accessor,
      descriptor,
      revoked.proxy,
      () => request,
    ]) {
      const fixture = authorityFor(outcome);
      expect(() => fixture.authority.resolve(candidate as never)).toThrow(
        InvalidGovernedAuthorizationEvaluationError,
      );
      expect(
        fixture.evaluator.evaluateAuthorizationOutcome,
      ).toHaveBeenCalledTimes(0);
    }
    expect(getterCalls).toBe(0);
  });

  it.each([new Error("verifier-secret"), "verifier-primitive"])(
    "maps verifier throw %# to execution state",
    (thrown) => {
      const fixture = authorityFor(outcome);
      fixture.verifier.verifyAuthorizationEvaluationOutcome.mockImplementation(
        () => {
          throw thrown;
        },
      );
      expect(() => fixture.authority.resolve(request)).toThrow(
        InvalidSkillExecutionStateError,
      );
    },
  );

  it("maps a non-boolean verifier result to execution state", () => {
    const fixture = authorityFor(outcome);
    fixture.verifier.verifyAuthorizationEvaluationOutcome.mockImplementation(
      () => 1 as never,
    );
    expect(() => fixture.authority.resolve(request)).toThrow(
      InvalidSkillExecutionStateError,
    );
  });

  it("rejects verifier false without changing caller graphs", () => {
    const fixture = authorityFor(outcome);
    fixture.verifier.verifyAuthorizationEvaluationOutcome.mockReturnValue(
      false,
    );
    const before = structuredClone(request);
    expect(() => fixture.authority.resolve(request)).toThrow(
      InvalidGovernedAuthorizationEvaluationError,
    );
    expect(request).toEqual(before);
    expect(Object.isFrozen(request)).toBe(false);
    expect(Object.isFrozen(request.request)).toBe(false);
  });
});
