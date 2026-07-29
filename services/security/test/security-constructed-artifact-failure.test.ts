import { afterEach, describe, expect, it, vi } from "vitest";
import type * as Core from "@orion/core";
import type { SecurityEngine as SecurityEngineType } from "../src/security-engine.js";

afterEach(() => {
  vi.doUnmock("@orion/core");
  vi.resetModules();
});

const target = {
  operationId: "constructed-op",
  action: "security.evaluate",
  resource: { kind: "unscoped" as const },
};
const request = { intent: "evaluate-authorization", ...target };

function sources() {
  const subject = { kind: "anonymous" as const };
  return {
    requirements: {
      status: "available",
      requirements: {
        ...target,
        requiredPermissions: [] as string[],
        sensitivity: "standard",
      },
    },
    context: {
      operationId: target.operationId,
      subject,
      context: "available",
      device: "not-applicable",
      session: "not-applicable",
      trustLevel: "not-applicable",
    },
    grants: {
      status: "available",
      ...target,
      subject,
      evaluatedPermissions: [] as string[],
      grants: [] as unknown[],
    },
    confirmation: { status: "absent" },
  };
}

function configuration(
  SecurityEngine: typeof SecurityEngineType,
  source: ReturnType<typeof sources>,
  calls?: string[],
) {
  const engine = new SecurityEngine({
    requirements: {
      resolveProtectedActionRequirements() {
        calls?.push("requirements");
        return source.requirements as never;
      },
    },
    context: {
      resolveSecurityEvaluationContext() {
        calls?.push("context");
        return source.context as never;
      },
    },
    grants: {
      resolveGrantEvidence() {
        calls?.push("grants");
        return source.grants as never;
      },
    },
    confirmation: {
      resolveConfirmationEvidence() {
        calls?.push("confirmation");
        return source.confirmation as never;
      },
    },
  });
  engine.initialize();
  engine.start();
  return engine;
}

describe("M8 constructed Authorization Decision Artifact failure", () => {
  it("proves normal -> isolated failure -> deeply equal normal behavior", async () => {
    vi.doUnmock("@orion/core");
    vi.resetModules();
    const ordinaryBefore = await import("../src/index.js");
    const beforeSource = sources();
    const normalBefore = configuration(
      ordinaryBefore.SecurityEngine,
      beforeSource,
    ).evaluateAuthorization(structuredClone(request));
    expect(normalBefore).toMatchObject({
      decision: "allow",
      reason: "no-permission-required",
    });

    vi.resetModules();
    vi.doMock("@orion/core", async () => {
      const actual = await vi.importActual<typeof Core>("@orion/core");
      return {
        ...actual,
        createAuthorizationDecisionArtifact() {
          throw new actual.InvalidSecurityStateError();
        },
      };
    });
    const { InvalidSecurityStateError } = await import("@orion/core");
    const isolated = await import("../src/security-engine.js");
    const calls: string[] = [];
    const failureSource = sources();
    const failureBefore = structuredClone(failureSource);
    const failureRequest = structuredClone(request);
    const failureEngine = configuration(
      isolated.SecurityEngine,
      failureSource,
      calls,
    );

    expect(() => failureEngine.evaluateAuthorization(failureRequest)).toThrow(
      InvalidSecurityStateError,
    );
    expect(calls).toEqual(["requirements", "context", "grants"]);
    expect(failureSource).toEqual(failureBefore);
    expect(failureRequest).toEqual(request);
    expect(Object.isFrozen(failureSource)).toBe(false);
    expect(Object.isFrozen(failureSource.requirements)).toBe(false);
    expect(
      Object.isFrozen(
        failureSource.requirements.requirements.requiredPermissions,
      ),
    ).toBe(false);
    expect(Object.isFrozen(failureSource.grants.evaluatedPermissions)).toBe(
      false,
    );
    expect(Object.isFrozen(failureSource.grants.grants)).toBe(false);
    expect(Object.isFrozen(failureRequest)).toBe(false);
    expect(failureEngine.engineState).toBe("running");

    vi.doUnmock("@orion/core");
    vi.resetModules();
    const ordinaryAfter = await import("../src/index.js");
    const afterSource = sources();
    const normalAfter = configuration(
      ordinaryAfter.SecurityEngine,
      afterSource,
    ).evaluateAuthorization(structuredClone(request));
    expect(normalAfter).toEqual(normalBefore);
  });

  it("exposes no public or configurable constructed-failure mechanism", async () => {
    vi.doUnmock("@orion/core");
    vi.resetModules();
    const security = await import("../src/index.js");
    const forbidden = new Set([
      "TestSeam",
      "testSeam",
      "failArtifact",
      "failConstructedArtifact",
      "fault",
      "injectFailure",
      "setFailure",
      "configureFailure",
      "testing",
      "__test",
    ]);
    expect(Object.keys(security).filter((name) => forbidden.has(name))).toEqual(
      [],
    );
    expect(security.SecurityEngine.length).toBe(1);
    expect(
      Object.getOwnPropertyNames(security.SecurityEngine).filter((name) =>
        forbidden.has(name),
      ),
    ).toEqual([]);
    expect(
      Object.getOwnPropertyNames(security.SecurityEngine.prototype).filter(
        (name) => forbidden.has(name),
      ),
    ).toEqual([]);

    const previous = process.env.ORION_SECURITY_FAULT;
    process.env.ORION_SECURITY_FAULT = "fail-constructed-artifact";
    try {
      const engine = configuration(security.SecurityEngine, sources());
      expect(engine.evaluateAuthorization(request).decision).toBe("allow");
      expect("failArtifact" in engine).toBe(false);
    } finally {
      if (previous === undefined) delete process.env.ORION_SECURITY_FAULT;
      else process.env.ORION_SECURITY_FAULT = previous;
    }
  });

  it.each([
    "createGovernedSecurityEvaluationSummary",
    "createAuthorizationEvaluationOutcome",
  ] as const)(
    "contains isolated %s failure in the atomic Outcome pipeline",
    async (factoryName) => {
      vi.doUnmock("@orion/core");
      vi.resetModules();
      const ordinaryBefore = await import("../src/index.js");
      const before = configuration(
        ordinaryBefore.SecurityEngine,
        sources(),
      ).evaluateAuthorizationOutcome({
        intent: "evaluate-authorization-outcome",
        ...target,
      });

      vi.resetModules();
      let capturedArtifact: unknown;
      let capturedOutcome: unknown;
      vi.doMock("@orion/core", async () => {
        const actual = await vi.importActual<typeof Core>("@orion/core");
        return {
          ...actual,
          createAuthorizationDecisionArtifact(value: unknown) {
            capturedArtifact =
              actual.createAuthorizationDecisionArtifact(value);
            return capturedArtifact;
          },
          createGovernedSecurityEvaluationSummary(value: unknown) {
            if (factoryName === "createGovernedSecurityEvaluationSummary")
              throw new actual.InvalidSecurityStateError();
            return actual.createGovernedSecurityEvaluationSummary(value);
          },
          createAuthorizationEvaluationOutcome(value: unknown) {
            capturedOutcome =
              actual.createAuthorizationEvaluationOutcome(value);
            if (factoryName === "createAuthorizationEvaluationOutcome")
              throw new actual.InvalidSecurityStateError();
            return capturedOutcome;
          },
        };
      });
      const isolated = await import("../src/security-engine.js");
      const { InvalidSecurityStateError } = await import("@orion/core");
      const failureEngine = configuration(isolated.SecurityEngine, sources());
      expect(() =>
        failureEngine.evaluateAuthorizationOutcome({
          intent: "evaluate-authorization-outcome",
          ...target,
        }),
      ).toThrow(InvalidSecurityStateError);
      expect(capturedArtifact).toBeDefined();
      if (capturedOutcome !== undefined)
        expect(
          failureEngine.verifyAuthorizationEvaluationOutcome({
            intent: "verify-authorization-evaluation-outcome",
            outcome: capturedOutcome,
            operationId: target.operationId,
          }),
        ).toBe(false);
      else {
        const actual = await vi.importActual<typeof Core>("@orion/core");
        const partial = actual.createAuthorizationEvaluationOutcome({
          authorization: capturedArtifact,
          securityEvaluationSummary:
            actual.createGovernedSecurityEvaluationSummary({
              operationId: target.operationId,
              subject: { kind: "anonymous" },
              securityContext: {
                context: "available",
                device: "not-applicable",
                session: "not-applicable",
                trustLevel: "not-applicable",
              },
            }),
        });
        expect(
          failureEngine.verifyAuthorizationEvaluationOutcome({
            intent: "verify-authorization-evaluation-outcome",
            outcome: partial,
            operationId: target.operationId,
          }),
        ).toBe(false);
      }
      expect(
        failureEngine.verifyAuthorizationEvaluationOutcome({
          intent: "verify-authorization-evaluation-outcome",
          outcome: before,
          operationId: target.operationId,
        }),
      ).toBe(false);

      vi.doUnmock("@orion/core");
      vi.resetModules();
      const ordinaryAfter = await import("../src/index.js");
      const after = configuration(
        ordinaryAfter.SecurityEngine,
        sources(),
      ).evaluateAuthorizationOutcome({
        intent: "evaluate-authorization-outcome",
        ...target,
      });
      expect(after).toEqual(before);
    },
  );

  it("recovers on the same instance after isolated provenance registration failure", async () => {
    vi.doUnmock("@orion/core");
    vi.resetModules();
    const security = await import("../src/index.js");
    const engine = configuration(security.SecurityEngine, sources());
    const ordinary = engine.evaluateAuthorizationOutcome({
      intent: "evaluate-authorization-outcome",
      ...target,
    });
    const original = WeakMap.prototype.set;
    let failed = false;
    let failedOutcome: object | undefined;
    const spy = vi.spyOn(WeakMap.prototype, "set").mockImplementation(function (
      this: WeakMap<WeakKey, unknown>,
      key: WeakKey,
      value: unknown,
    ) {
      if (
        !failed &&
        typeof key === "object" &&
        key !== null &&
        Reflect.ownKeys(key).includes("securityEvaluationSummary")
      ) {
        failed = true;
        failedOutcome = key as object;
        throw new Error("isolated-provenance-failure");
      }
      return Reflect.apply(original, this, [key, value]);
    });
    try {
      expect(() =>
        engine.evaluateAuthorizationOutcome({
          intent: "evaluate-authorization-outcome",
          ...target,
        }),
      ).toThrow((await import("@orion/core")).InvalidSecurityStateError);
    } finally {
      spy.mockRestore();
    }
    expect(failedOutcome).toBeDefined();
    expect(
      engine.verifyAuthorizationEvaluationOutcome({
        intent: "verify-authorization-evaluation-outcome",
        outcome: failedOutcome,
        operationId: target.operationId,
      }),
    ).toBe(false);
    const recovered = engine.evaluateAuthorizationOutcome({
      intent: "evaluate-authorization-outcome",
      ...target,
    });
    expect(recovered).toEqual(ordinary);
    expect(
      engine.verifyAuthorizationEvaluationOutcome({
        intent: "verify-authorization-evaluation-outcome",
        outcome: recovered,
        operationId: target.operationId,
      }),
    ).toBe(true);
  });

  it.each(["artifact", "outcome"] as const)(
    "observes one complete construction/registration pipeline for %s Contract",
    async (contract) => {
      vi.resetModules();
      const counts = { artifact: 0, summary: 0, outcome: 0, provenance: 0 };
      vi.doMock("@orion/core", async () => {
        const actual = await vi.importActual<typeof Core>("@orion/core");
        return {
          ...actual,
          createAuthorizationDecisionArtifact(value: unknown) {
            counts.artifact += 1;
            return actual.createAuthorizationDecisionArtifact(value);
          },
          createGovernedSecurityEvaluationSummary(value: unknown) {
            counts.summary += 1;
            return actual.createGovernedSecurityEvaluationSummary(value);
          },
          createAuthorizationEvaluationOutcome(value: unknown) {
            counts.outcome += 1;
            return actual.createAuthorizationEvaluationOutcome(value);
          },
        };
      });
      const isolated = await import("../src/security-engine.js");
      const original = WeakMap.prototype.set;
      const spy = vi
        .spyOn(WeakMap.prototype, "set")
        .mockImplementation(function (
          this: WeakMap<WeakKey, unknown>,
          key: WeakKey,
          value: unknown,
        ) {
          if (
            typeof key === "object" &&
            key !== null &&
            Reflect.ownKeys(key).includes("securityEvaluationSummary")
          )
            counts.provenance += 1;
          return Reflect.apply(original, this, [key, value]);
        });
      try {
        const engine = configuration(isolated.SecurityEngine, sources());
        if (contract === "artifact")
          engine.evaluateAuthorization({
            intent: "evaluate-authorization",
            ...target,
          });
        else
          engine.evaluateAuthorizationOutcome({
            intent: "evaluate-authorization-outcome",
            ...target,
          });
      } finally {
        spy.mockRestore();
      }
      expect(counts).toEqual({
        artifact: 1,
        summary: 1,
        outcome: 1,
        provenance: 1,
      });
    },
  );
});
