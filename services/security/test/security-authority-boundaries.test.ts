import { describe, expect, it } from "vitest";
import {
  InvalidAuthorizationInputError,
  InvalidSecurityStateError,
} from "@orion/core";
import {
  ProcessLocalConfirmationAuthority,
  ProcessLocalGrantEvidenceAuthority,
  ProcessLocalRequirementsAuthority,
  ProcessLocalSecurityContextAuthority,
} from "../src/index.js";

const target = {
  operationId: "boundary-op",
  action: "security.evaluate",
  resource: { kind: "unscoped" as const },
};
const subject = { kind: "anonymous" as const };
type Boundary = {
  readonly name: string;
  readonly valid: Readonly<Record<string, unknown>>;
  readonly invoke: (value: unknown) => unknown;
};
const boundaries: Boundary[] = [
  {
    name: "requirements",
    valid: { intent: "resolve-protected-action-requirements", ...target },
    invoke: new ProcessLocalRequirementsAuthority(() => ({
      status: "unavailable",
      ...target,
    })).resolveProtectedActionRequirements.bind(
      new ProcessLocalRequirementsAuthority(() => ({
        status: "unavailable",
        ...target,
      })),
    ),
  },
  {
    name: "context",
    valid: { intent: "resolve-security-evaluation-context", ...target },
    invoke: new ProcessLocalSecurityContextAuthority(() => ({
      operationId: target.operationId,
      subject,
      context: "available",
      device: "not-applicable",
      session: "not-applicable",
      trustLevel: "not-applicable",
    })).resolveSecurityEvaluationContext.bind(
      new ProcessLocalSecurityContextAuthority(() => ({
        operationId: target.operationId,
        subject,
        context: "available",
        device: "not-applicable",
        session: "not-applicable",
        trustLevel: "not-applicable",
      })),
    ),
  },
  {
    name: "grants",
    valid: {
      intent: "resolve-grant-evidence",
      ...target,
      subject,
      requiredPermissions: [],
    },
    invoke: new ProcessLocalGrantEvidenceAuthority(() => ({
      status: "unavailable",
      ...target,
      subject,
      evaluatedPermissions: [],
    })).resolveGrantEvidence.bind(
      new ProcessLocalGrantEvidenceAuthority(() => ({
        status: "unavailable",
        ...target,
        subject,
        evaluatedPermissions: [],
      })),
    ),
  },
  {
    name: "confirmation",
    valid: { intent: "resolve-confirmation-evidence", ...target, subject },
    invoke: new ProcessLocalConfirmationAuthority(() => ({
      status: "absent",
    })).resolveConfirmationEvidence.bind(
      new ProcessLocalConfirmationAuthority(() => ({ status: "absent" })),
    ),
  },
];
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

describe.each(boundaries)("M8 $name authority request matrix", (boundary) => {
  it.each(malformed)("rejects malformed runtime category %#", (value) => {
    expect(() => boundary.invoke(value)).toThrow(
      InvalidAuthorizationInputError,
    );
  });

  it("rejects extra fields, symbols, and inherited substitutes", () => {
    expect(() => boundary.invoke({ ...boundary.valid, extra: true })).toThrow(
      InvalidAuthorizationInputError,
    );
    const symbol = { ...boundary.valid, [Symbol("extra")]: true };
    expect(() => boundary.invoke(symbol)).toThrow(
      InvalidAuthorizationInputError,
    );
    expect(() => boundary.invoke(Object.create(boundary.valid))).toThrow(
      InvalidAuthorizationInputError,
    );
  });

  it("normalizes hostile ownKeys and throwing getters", () => {
    expect(() =>
      boundary.invoke(
        new Proxy(
          {},
          {
            ownKeys() {
              throw new Error("private-native-detail");
            },
          },
        ),
      ),
    ).toThrow(InvalidAuthorizationInputError);
    const hostile = { ...boundary.valid };
    Object.defineProperty(hostile, "intent", {
      enumerable: true,
      get() {
        throw new Error("private-native-detail");
      },
    });
    expect(() => boundary.invoke(hostile)).toThrow(
      InvalidAuthorizationInputError,
    );
  });

  it("reads accepted getters once and leaves requests mutable and unfrozen", () => {
    const reads = new Map<string, number>();
    const request: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(boundary.valid)) {
      Object.defineProperty(request, key, {
        enumerable: true,
        configurable: true,
        get() {
          reads.set(key, (reads.get(key) ?? 0) + 1);
          return value;
        },
      });
    }
    expect(boundary.invoke(request)).toBeDefined();
    expect([...reads.values()].every((count) => count === 1)).toBe(true);
    expect(Object.isFrozen(request)).toBe(false);
  });

  it("normalizes authority implementation native throws privately", () => {
    let invoke: (value: unknown) => unknown;
    if (boundary.name === "requirements")
      invoke = new ProcessLocalRequirementsAuthority(() => {
        throw new Error("private-native-detail");
      }).resolveProtectedActionRequirements.bind(
        new ProcessLocalRequirementsAuthority(() => {
          throw new Error("private-native-detail");
        }),
      );
    else if (boundary.name === "context")
      invoke = new ProcessLocalSecurityContextAuthority(() => {
        throw new Error("private-native-detail");
      }).resolveSecurityEvaluationContext.bind(
        new ProcessLocalSecurityContextAuthority(() => {
          throw new Error("private-native-detail");
        }),
      );
    else if (boundary.name === "grants")
      invoke = new ProcessLocalGrantEvidenceAuthority(() => {
        throw new Error("private-native-detail");
      }).resolveGrantEvidence.bind(
        new ProcessLocalGrantEvidenceAuthority(() => {
          throw new Error("private-native-detail");
        }),
      );
    else
      invoke = new ProcessLocalConfirmationAuthority(() => {
        throw new Error("private-native-detail");
      }).resolveConfirmationEvidence.bind(
        new ProcessLocalConfirmationAuthority(() => {
          throw new Error("private-native-detail");
        }),
      );
    expect(() => invoke(boundary.valid)).toThrow(InvalidSecurityStateError);
    try {
      invoke(boundary.valid);
    } catch (error) {
      expect((error as Error).message).not.toContain("private-native-detail");
    }
  });
});
