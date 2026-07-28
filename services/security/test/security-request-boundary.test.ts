import { describe, expect, it } from "vitest";
import {
  InvalidAuthorizationInputError,
  type ResolveConfirmationEvidence,
  type ResolveGrantEvidence,
  type ResolveProtectedActionRequirements,
  type ResolveSecurityEvaluationContext,
} from "@orion/core";
import { SecurityEngine } from "../src/index.js";

const target = {
  operationId: "request-op",
  action: "security.evaluate",
  resource: { kind: "unscoped" as const },
};
const subject = { kind: "anonymous" as const };
function running() {
  const requirements: ResolveProtectedActionRequirements = {
    resolveProtectedActionRequirements: () =>
      ({
        status: "available",
        requirements: {
          ...target,
          requiredPermissions: [],
          sensitivity: "standard",
        },
      }) as never,
  };
  const context: ResolveSecurityEvaluationContext = {
    resolveSecurityEvaluationContext: () => ({
      operationId: target.operationId as never,
      subject,
      context: "available",
      device: "not-applicable",
      session: "not-applicable",
      trustLevel: "not-applicable",
    }),
  };
  const grants: ResolveGrantEvidence = {
    resolveGrantEvidence: () =>
      ({
        status: "available",
        ...target,
        subject,
        evaluatedPermissions: [],
        grants: [],
      }) as never,
  };
  const confirmation: ResolveConfirmationEvidence = {
    resolveConfirmationEvidence: () => ({ status: "absent" }),
  };
  const engine = new SecurityEngine({
    requirements,
    context,
    grants,
    confirmation,
  });
  engine.initialize();
  engine.start();
  return engine;
}
const malformed: readonly unknown[] = [
  null,
  undefined,
  "request",
  1,
  true,
  1n,
  Symbol("request"),
  () => undefined,
  [],
  { 0: "value", length: 1 },
];

describe("M8 public Evaluate Authorization request matrix", () => {
  it.each(malformed)("rejects malformed runtime category %#", (value) => {
    expect(() => running().evaluateAuthorization(value)).toThrow(
      InvalidAuthorizationInputError,
    );
  });

  it.each(["intent", "operationId", "action", "resource"])(
    "rejects missing and explicit undefined %s",
    (field) => {
      const valid: Record<string, unknown> = {
        intent: "evaluate-authorization",
        ...target,
      };
      delete valid[field];
      expect(() => running().evaluateAuthorization(valid)).toThrow(
        InvalidAuthorizationInputError,
      );
      valid[field] = undefined;
      expect(() => running().evaluateAuthorization(valid)).toThrow(
        InvalidAuthorizationInputError,
      );
    },
  );

  it("rejects extra, symbol, inherited, and coercible fields", () => {
    const valid = { intent: "evaluate-authorization", ...target };
    expect(() =>
      running().evaluateAuthorization({ ...valid, extra: true }),
    ).toThrow(InvalidAuthorizationInputError);
    expect(() =>
      running().evaluateAuthorization({ ...valid, [Symbol("x")]: true }),
    ).toThrow(InvalidAuthorizationInputError);
    expect(() => running().evaluateAuthorization(Object.create(valid))).toThrow(
      InvalidAuthorizationInputError,
    );
    expect(() =>
      running().evaluateAuthorization({
        ...valid,
        operationId: { toString: () => "request-op" },
      }),
    ).toThrow(InvalidAuthorizationInputError);
  });

  it("reads stateful getters once and does not freeze or mutate the request", () => {
    const source = { intent: "evaluate-authorization", ...target };
    const request: Record<string, unknown> = {};
    const reads = new Map<string, number>();
    for (const [key, value] of Object.entries(source)) {
      Object.defineProperty(request, key, {
        configurable: true,
        enumerable: true,
        get() {
          reads.set(key, (reads.get(key) ?? 0) + 1);
          return value;
        },
      });
    }
    expect(running().evaluateAuthorization(request).decision).toBe("allow");
    expect([...reads.values()].every((count) => count === 1)).toBe(true);
    expect(Object.isFrozen(request)).toBe(false);
  });

  it("normalizes hostile Proxy and descriptor traps", () => {
    for (const trap of ["ownKeys", "getOwnPropertyDescriptor"] as const) {
      const handler: ProxyHandler<object> = {
        [trap]() {
          throw new Error("private-native-detail");
        },
      };
      expect(() =>
        running().evaluateAuthorization(new Proxy({}, handler)),
      ).toThrow(InvalidAuthorizationInputError);
    }
  });
});
