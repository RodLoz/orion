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
    expect(calls).toEqual([
      "requirements",
      "context",
      "grants",
      "confirmation",
    ]);
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
});
