import { describe, expect, it } from "vitest";
import {
  InvalidAuthorizationEvidenceError,
  InvalidAuthorizationInputError,
  InvalidSecurityStateError,
} from "@orion/core";
import { SecurityEngine } from "../src/index.js";

const target = {
  operationId: "provenance-op",
  action: "security.evaluate",
  resource: { kind: "unscoped" as const },
};
const subject = { kind: "anonymous" as const };
const request = { intent: "evaluate-authorization", ...target };

function composed(mode: "allow" | "deny" | "indeterminate" | "invalid") {
  const sources = {
    requirements:
      mode === "indeterminate"
        ? { status: "unavailable", ...target }
        : {
            status: "available",
            requirements: {
              ...target,
              requiredPermissions: mode === "deny" ? ["security.execute"] : [],
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
    grants:
      mode === "invalid"
        ? {
            status: "available",
            ...target,
            subject,
            evaluatedPermissions: [],
            grants: [null],
          }
        : {
            status: "available",
            ...target,
            subject,
            evaluatedPermissions: mode === "deny" ? ["security.execute"] : [],
            grants: [],
          },
    confirmation: { status: "absent" },
  };
  const before = structuredClone(sources);
  const engine = new SecurityEngine({
    requirements: {
      resolveProtectedActionRequirements: () => sources.requirements as never,
    },
    context: {
      resolveSecurityEvaluationContext: () => sources.context as never,
    },
    grants: {
      resolveGrantEvidence: () => sources.grants as never,
    },
    confirmation: {
      resolveConfirmationEvidence: () => sources.confirmation as never,
    },
  });
  engine.initialize();
  engine.start();
  return { engine, sources, before };
}

function expectMutableSourceGraph(source: unknown) {
  const graph = source as {
    requirements?: {
      requirements?: { requiredPermissions?: unknown };
    };
    grants?: {
      evaluatedPermissions?: unknown;
      grants?: unknown;
    };
    confirmation?: unknown;
    context?: unknown;
  };
  if (typeof source === "object" && source !== null)
    expect(Object.isFrozen(source)).toBe(false);
  for (const value of [
    graph.requirements,
    graph.context,
    graph.grants,
    graph.confirmation,
  ]) {
    if (typeof value === "object" && value !== null)
      expect(Object.isFrozen(value)).toBe(false);
  }
  const requiredPermissions =
    graph.requirements?.requirements?.requiredPermissions;
  if (Array.isArray(requiredPermissions))
    expect(Object.isFrozen(requiredPermissions)).toBe(false);
  const evaluatedPermissions = graph.grants?.evaluatedPermissions;
  if (Array.isArray(evaluatedPermissions))
    expect(Object.isFrozen(evaluatedPermissions)).toBe(false);
  const grants = graph.grants?.grants;
  if (Array.isArray(grants)) expect(Object.isFrozen(grants)).toBe(false);
}

describe("M8 authority provenance and source non-mutation", () => {
  it.each([
    "requirements",
    "grants",
    "securityContext",
    "confirmation",
    "subject",
    "policy",
  ])("public Evaluate cannot inject governed %s", (field) => {
    expect(() =>
      composed("allow").engine.evaluateAuthorization({
        ...request,
        [field]: {},
      }),
    ).toThrow(InvalidAuthorizationInputError);
  });

  it.each(["allow", "deny", "indeterminate"] as const)(
    "does not mutate or freeze any source graph for %s",
    (mode) => {
      const fixture = composed(mode);
      fixture.engine.evaluateAuthorization(request);
      expect(fixture.sources).toEqual(fixture.before);
      expectMutableSourceGraph(fixture.sources);
    },
  );

  it.each([
    [
      "missing confirmation DENY",
      (fixture: ReturnType<typeof composed>) => {
        fixture.sources.requirements = {
          status: "available",
          requirements: {
            ...target,
            requiredPermissions: [],
            sensitivity: "sensitive",
          },
        };
      },
      "deny",
    ],
    [
      "Context unavailable INDETERMINATE",
      (fixture: ReturnType<typeof composed>) => {
        fixture.sources.context.device = "unavailable";
      },
      "indeterminate",
    ],
    [
      "Grant Evidence unavailable INDETERMINATE",
      (fixture: ReturnType<typeof composed>) => {
        fixture.sources.grants = {
          status: "unavailable",
          ...target,
          subject,
          evaluatedPermissions: [],
        } as never;
      },
      "indeterminate",
    ],
  ] as const)(
    "does not mutate or freeze sources for %s",
    (_name, arrange, decision) => {
      const fixture = composed("allow");
      arrange(fixture);
      const before = structuredClone(fixture.sources);
      const caller = structuredClone(request);
      expect(fixture.engine.evaluateAuthorization(caller).decision).toBe(
        decision,
      );
      expect(fixture.sources).toEqual(before);
      expect(caller).toEqual(request);
      expect(Object.isFrozen(caller)).toBe(false);
      expectMutableSourceGraph(fixture.sources);
    },
  );

  it("does not let configured provenance bypass malformed response validation", () => {
    const fixture = composed("invalid");
    expect(() => fixture.engine.evaluateAuthorization(request)).toThrow(
      InvalidAuthorizationEvidenceError,
    );
    expect(fixture.sources).toEqual(fixture.before);
    expectMutableSourceGraph(fixture.sources);
  });

  it("normalizes configured authority throws without mutating public input", () => {
    const caller = { ...request };
    const engine = new SecurityEngine({
      requirements: {
        resolveProtectedActionRequirements() {
          throw { private: "source" };
        },
      },
      context: {
        resolveSecurityEvaluationContext() {
          throw new Error();
        },
      },
      grants: {
        resolveGrantEvidence() {
          throw new Error();
        },
      },
      confirmation: {
        resolveConfirmationEvidence() {
          throw new Error();
        },
      },
    });
    engine.initialize();
    engine.start();
    expect(() => engine.evaluateAuthorization(caller)).toThrow(
      InvalidSecurityStateError,
    );
    expect(caller).toEqual(request);
    expect(Object.isFrozen(caller)).toBe(false);
  });

  it.each(["requirements", "context", "grants", "confirmation"] as const)(
    "maps %s authority throw and leaves later authorities untouched",
    (throwingStage) => {
      const calls = { requirements: 0, context: 0, grants: 0, confirmation: 0 };
      const stage = <T>(name: keyof typeof calls, value: T): T => {
        calls[name] += 1;
        if (name === throwingStage) throw new Error("private-source");
        return value;
      };
      const engine = new SecurityEngine({
        requirements: {
          resolveProtectedActionRequirements: () =>
            stage("requirements", {
              status: "available",
              requirements: {
                ...target,
                requiredPermissions: [],
                sensitivity: "standard",
              },
            }) as never,
        },
        context: {
          resolveSecurityEvaluationContext: () =>
            stage("context", {
              operationId: target.operationId,
              subject,
              context: "available",
              device: "not-applicable",
              session: "not-applicable",
              trustLevel: "not-applicable",
            }) as never,
        },
        grants: {
          resolveGrantEvidence: () =>
            stage("grants", {
              status: "available",
              ...target,
              subject,
              evaluatedPermissions: [],
              grants: [],
            }) as never,
        },
        confirmation: {
          resolveConfirmationEvidence: () =>
            stage("confirmation", { status: "absent" }) as never,
        },
      });
      engine.initialize();
      engine.start();
      expect(() => engine.evaluateAuthorization(request)).toThrow(
        InvalidSecurityStateError,
      );
      const order = ["requirements", "context", "grants", "confirmation"];
      const failedIndex = order.indexOf(throwingStage);
      for (const later of order.slice(failedIndex + 1)) {
        expect(calls[later as keyof typeof calls]).toBe(0);
      }
    },
  );

  it.each([
    [
      "Requirements",
      {
        requirements: {
          status: "available",
          requirements: {
            ...target,
            requiredPermissions: ["security.write", "security.read"],
            sensitivity: "fabricated",
          },
        },
      },
      { context: 0, grants: 0, confirmation: 0 },
    ],
    [
      "Context",
      {
        context: {
          operationId: target.operationId,
          subject,
          context: "fabricated",
          device: "not-applicable",
          session: "not-applicable",
          trustLevel: "not-applicable",
        },
      },
      { context: 1, grants: 0, confirmation: 0 },
    ],
    [
      "Grant Evidence",
      {
        grants: {
          status: "available",
          ...target,
          subject,
          evaluatedPermissions: [],
          grants: [null],
        },
      },
      { context: 1, grants: 1, confirmation: 0 },
    ],
  ] as const)(
    "preserves malformed %s source and request while stopping later stages",
    (_name, override, expectedLater) => {
      const base = composed("allow");
      const candidates = {
        requirements:
          "requirements" in override
            ? override.requirements
            : base.sources.requirements,
        context:
          "context" in override ? override.context : base.sources.context,
        grants: "grants" in override ? override.grants : base.sources.grants,
        confirmation: base.sources.confirmation,
      };
      const before = structuredClone(candidates);
      const caller = structuredClone(request);
      const calls = { context: 0, grants: 0, confirmation: 0 };
      const engine = new SecurityEngine({
        requirements: {
          resolveProtectedActionRequirements: () =>
            candidates.requirements as never,
        },
        context: {
          resolveSecurityEvaluationContext() {
            calls.context += 1;
            return candidates.context as never;
          },
        },
        grants: {
          resolveGrantEvidence() {
            calls.grants += 1;
            return candidates.grants as never;
          },
        },
        confirmation: {
          resolveConfirmationEvidence() {
            calls.confirmation += 1;
            return candidates.confirmation as never;
          },
        },
      });
      engine.initialize();
      engine.start();
      expect(() => engine.evaluateAuthorization(caller)).toThrow(
        InvalidAuthorizationEvidenceError,
      );
      expect(candidates).toEqual(before);
      expect(caller).toEqual(request);
      expect(calls).toEqual(expectedLater);
      expectMutableSourceGraph(candidates);
      expect(Object.isFrozen(caller)).toBe(false);
    },
  );

  it("preserves malformed Confirmation and every previously obtained source", () => {
    const fixture = composed("allow");
    fixture.sources.requirements = {
      status: "available",
      requirements: {
        ...target,
        requiredPermissions: [],
        sensitivity: "sensitive",
      },
    };
    fixture.sources.confirmation = {
      status: "confirmed",
      operationId: "other-operation",
    } as never;
    const before = structuredClone(fixture.sources);
    const caller = structuredClone(request);
    expect(() => fixture.engine.evaluateAuthorization(caller)).toThrow(
      InvalidAuthorizationEvidenceError,
    );
    expect(fixture.sources).toEqual(before);
    expect(caller).toEqual(request);
    expectMutableSourceGraph(fixture.sources);
    expect(Object.isFrozen(caller)).toBe(false);
  });

  it("preserves an ordinary request on lifecycle failure without inspecting it", () => {
    const fixture = composed("allow");
    fixture.engine.stop();
    const caller = structuredClone(request);
    const before = structuredClone(caller);
    let reads = 0;
    const guarded = new Proxy(caller, {
      ownKeys() {
        reads += 1;
        return Reflect.ownKeys(caller);
      },
    });
    expect(() => fixture.engine.evaluateAuthorization(guarded)).toThrow(
      InvalidSecurityStateError,
    );
    expect(reads).toBe(0);
    expect(caller).toEqual(before);
    expect(Object.isFrozen(caller)).toBe(false);
    expectMutableSourceGraph(fixture.sources);
  });

  it("preserves reached source arrays when Confirmation authority throws", () => {
    const fixture = composed("allow");
    const before = structuredClone(fixture.sources);
    const caller = structuredClone(request);
    const engine = new SecurityEngine({
      requirements: {
        resolveProtectedActionRequirements: () =>
          fixture.sources.requirements as never,
      },
      context: {
        resolveSecurityEvaluationContext: () =>
          fixture.sources.context as never,
      },
      grants: {
        resolveGrantEvidence: () => fixture.sources.grants as never,
      },
      confirmation: {
        resolveConfirmationEvidence() {
          throw new InvalidAuthorizationEvidenceError();
        },
      },
    });
    engine.initialize();
    engine.start();
    expect(() => engine.evaluateAuthorization(caller)).toThrow(
      InvalidSecurityStateError,
    );
    expect(fixture.sources).toEqual(before);
    expect(caller).toEqual(request);
    expectMutableSourceGraph(fixture.sources);
    expect(Object.isFrozen(caller)).toBe(false);
  });
});
