import { describe, expect, it } from "vitest";
import {
  InvalidAuthorizationEvidenceError,
  InvalidAuthorizationInputError,
} from "@orion/core";
import { SecurityEngine } from "../src/index.js";

const target = {
  operationId: "precedence-op",
  action: "security.evaluate",
  resource: { kind: "unscoped" as const },
};
const subject = { kind: "anonymous" as const };
const request = { intent: "evaluate-authorization", ...target };
const availableRequirements = {
  status: "available",
  requirements: {
    ...target,
    requiredPermissions: [],
    sensitivity: "standard",
  },
};
const availableContext = {
  operationId: target.operationId,
  subject,
  context: "available",
  device: "not-applicable",
  session: "not-applicable",
  trustLevel: "not-applicable",
};
const availableGrants = {
  status: "available",
  ...target,
  subject,
  evaluatedPermissions: [],
  grants: [],
};

function configured(
  overrides: {
    requirements?: unknown;
    context?: unknown;
    grants?: unknown;
    confirmation?: unknown;
  } = {},
) {
  const calls = { requirements: 0, context: 0, grants: 0, confirmation: 0 };
  const engine = new SecurityEngine({
    requirements: {
      resolveProtectedActionRequirements() {
        calls.requirements += 1;
        return (overrides.requirements ?? availableRequirements) as never;
      },
    },
    context: {
      resolveSecurityEvaluationContext() {
        calls.context += 1;
        return (overrides.context ?? availableContext) as never;
      },
    },
    grants: {
      resolveGrantEvidence() {
        calls.grants += 1;
        return (overrides.grants ?? availableGrants) as never;
      },
    },
    confirmation: {
      resolveConfirmationEvidence() {
        calls.confirmation += 1;
        return (overrides.confirmation ?? { status: "absent" }) as never;
      },
    },
  });
  engine.initialize();
  engine.start();
  return { engine, calls };
}

describe("M8 intermediate validation precedence", () => {
  it("invalid envelope and target prevent every authority invocation", () => {
    for (const invalid of [
      { ...request, extra: true },
      { ...request, operationId: " invalid" },
    ]) {
      const { engine, calls } = configured();
      expect(() => engine.evaluateAuthorization(invalid)).toThrow(
        InvalidAuthorizationInputError,
      );
      expect(calls).toEqual({
        requirements: 0,
        context: 0,
        grants: 0,
        confirmation: 0,
      });
    }
  });

  it("unavailable Requirements still obtains governed Context, then stops", () => {
    const { engine, calls } = configured({
      requirements: { status: "unavailable", ...target },
    });
    expect(engine.evaluateAuthorization(request).reason).toBe(
      "requirements-unavailable",
    );
    expect(calls).toEqual({
      requirements: 1,
      context: 1,
      grants: 0,
      confirmation: 0,
    });
  });

  it("malformed Requirements prevents Context and later boundaries", () => {
    const { engine, calls } = configured({
      requirements: { status: "available", requirements: null },
    });
    expect(() => engine.evaluateAuthorization(request)).toThrow(
      InvalidAuthorizationEvidenceError,
    );
    expect(calls).toEqual({
      requirements: 1,
      context: 0,
      grants: 0,
      confirmation: 0,
    });
  });

  it("unavailable and malformed Context prevent Grant Evidence", () => {
    const unavailable = configured({
      context: { ...availableContext, device: "unavailable" },
    });
    expect(unavailable.engine.evaluateAuthorization(request).reason).toBe(
      "security-context-unavailable",
    );
    expect(unavailable.calls.grants).toBe(0);
    expect(unavailable.calls.confirmation).toBe(0);

    const malformed = configured({
      context: { ...availableContext, device: "fabricated" },
    });
    expect(() => malformed.engine.evaluateAuthorization(request)).toThrow(
      InvalidAuthorizationEvidenceError,
    );
    expect(malformed.calls.grants).toBe(0);
    expect(malformed.calls.confirmation).toBe(0);
  });

  it("unavailable and malformed Grant Evidence prevent Confirmation", () => {
    const unavailable = configured({
      grants: {
        status: "unavailable",
        ...target,
        subject,
        evaluatedPermissions: [],
      },
    });
    expect(unavailable.engine.evaluateAuthorization(request).reason).toBe(
      "grant-evidence-unavailable",
    );
    expect(unavailable.calls.confirmation).toBe(0);

    const malformed = configured({
      grants: { status: "available", grants: null },
    });
    expect(() => malformed.engine.evaluateAuthorization(request)).toThrow(
      InvalidAuthorizationEvidenceError,
    );
    expect(malformed.calls.confirmation).toBe(0);
  });

  it("missing and malformed sensitive Confirmation resolve at its stage", () => {
    const requirements = {
      ...availableRequirements,
      requirements: {
        ...availableRequirements.requirements,
        sensitivity: "sensitive",
      },
    };
    const absent = configured({ requirements });
    expect(absent.engine.evaluateAuthorization(request)).toMatchObject({
      decision: "deny",
      reason: "confirmation-required",
    });
    expect(absent.calls.confirmation).toBe(1);

    const malformed = configured({
      requirements,
      confirmation: {
        status: "confirmed",
        ...target,
        operationId: "another-op",
        subject,
      },
    });
    expect(() => malformed.engine.evaluateAuthorization(request)).toThrow(
      InvalidAuthorizationEvidenceError,
    );
    expect(malformed.calls.confirmation).toBe(1);
  });
});
