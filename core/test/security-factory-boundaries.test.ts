import { describe, expect, it } from "vitest";
import {
  InvalidAuthorizationEvidenceError,
  InvalidAuthorizationInputError,
  InvalidSecurityStateError,
  authorizationActionIdentifier,
  authorizationOperationIdentifier,
  authorizationResourceIdentifier,
  createAuthorizationDecisionArtifact,
  createConfirmationEvidence,
  createPermissionGrantEvidence,
  createProtectedActionRequirementsResolution,
  createSecurityEvaluationContext,
  extractAuthorizationEvaluationRequest,
  extractConfirmationAuthorityRequest,
  extractContextAuthorityRequest,
  extractGrantAuthorityRequest,
  extractRequirementsAuthorityRequest,
} from "../src/index.js";

const target = {
  operationId: "factory-op",
  action: "security.evaluate",
  resource: { kind: "unscoped" as const },
};
const subject = { kind: "anonymous" as const };
const extractors = [
  [
    "Evaluate",
    extractAuthorizationEvaluationRequest,
    { intent: "evaluate-authorization", ...target },
  ],
  [
    "Requirements",
    extractRequirementsAuthorityRequest,
    { intent: "resolve-protected-action-requirements", ...target },
  ],
  [
    "Context",
    extractContextAuthorityRequest,
    { intent: "resolve-security-evaluation-context", ...target },
  ],
  [
    "Grants",
    extractGrantAuthorityRequest,
    {
      intent: "resolve-grant-evidence",
      ...target,
      subject,
      requiredPermissions: [],
    },
  ],
  [
    "Confirmation",
    extractConfirmationAuthorityRequest,
    { intent: "resolve-confirmation-evidence", ...target, subject },
  ],
] as const;

describe("M8 exported Core factory boundaries", () => {
  it("enforces operation and resource identifier boundaries exactly", () => {
    for (const [factory, minimum, maximum, overflow] of [
      [authorizationOperationIdentifier, "a", "a".repeat(128), "a".repeat(129)],
      [
        authorizationActionIdentifier,
        "a.b",
        `a.${"b".repeat(126)}`,
        `a.${"b".repeat(127)}`,
      ],
      [authorizationResourceIdentifier, "a", "a".repeat(128), "a".repeat(129)],
    ] as const) {
      expect(factory(minimum)).toBe(minimum);
      expect(factory(maximum)).toBe(maximum);
      for (const invalid of [
        overflow,
        "",
        " value",
        "válue",
        null,
        undefined,
        1,
        true,
        1n,
        Symbol("x"),
        () => minimum,
        [],
        [minimum],
        { toString: () => minimum },
      ]) {
        expect(() => factory(invalid)).toThrow(InvalidAuthorizationInputError);
      }
    }
  });

  it.each(extractors)(
    "directly validates the exported %s request extractor",
    (_name, extract, valid) => {
      expect(extract(valid)).toMatchObject({
        operationId: target.operationId,
        action: target.action,
        resource: target.resource,
      });
      for (const invalid of [
        null,
        undefined,
        "request",
        1,
        true,
        1n,
        Symbol("x"),
        () => valid,
        [],
        [valid],
        { 0: valid, length: 1 },
        {},
        { intent: valid.intent },
        { ...valid, extra: true },
        Object.create(valid),
        { ...valid, [Symbol("extra")]: true },
      ]) {
        expect(() => extract(invalid)).toThrow(InvalidAuthorizationInputError);
      }
      let reads = 0;
      const hostile = new Proxy(valid as object, {
        ownKeys() {
          reads += 1;
          throw new Error("private");
        },
      });
      expect(() => extract(hostile)).toThrow(InvalidAuthorizationInputError);
      expect(reads).toBe(1);
      const descriptorHostile = new Proxy(valid as object, {
        getOwnPropertyDescriptor() {
          throw new Error("private");
        },
      });
      expect(() => extract(descriptorHostile)).toThrow(
        InvalidAuthorizationInputError,
      );
      const throwing = { ...valid };
      Object.defineProperty(throwing, "intent", {
        enumerable: true,
        get() {
          throw new Error("private");
        },
      });
      expect(() => extract(throwing)).toThrow(InvalidAuthorizationInputError);
      let getterReads = 0;
      const stateful = { ...valid };
      Object.defineProperty(stateful, "intent", {
        enumerable: true,
        get() {
          getterReads += 1;
          return getterReads === 1 ? valid.intent : "fabricated";
        },
      });
      expect(extract(stateful)).toBeDefined();
      expect(getterReads).toBe(1);
      expect(Object.isFrozen(valid)).toBe(false);
    },
  );

  it.each([
    [
      "Requirements",
      createProtectedActionRequirementsResolution,
      { status: "unavailable", ...target },
    ],
    [
      "Context",
      createSecurityEvaluationContext,
      {
        operationId: target.operationId,
        subject,
        context: "available",
        device: "not-applicable",
        session: "not-applicable",
        trustLevel: "not-applicable",
      },
    ],
    [
      "Grant Evidence",
      createPermissionGrantEvidence,
      {
        status: "unavailable",
        ...target,
        subject,
        evaluatedPermissions: [],
      },
    ],
    ["Confirmation", createConfirmationEvidence, { status: "absent" }],
  ] as const)(
    "directly reconstructs and hostile-validates %s",
    (_name, factory, valid) => {
      const result = factory(valid);
      expect(Object.isFrozen(result)).toBe(true);
      expect(Object.isFrozen(valid)).toBe(false);
      const firstField = Reflect.ownKeys(valid)[0] as string;
      const missing = { ...valid } as Record<string, unknown>;
      delete missing[firstField];
      for (const invalid of [
        null,
        undefined,
        "value",
        1,
        true,
        1n,
        Symbol("x"),
        () => valid,
        [],
        [valid],
        { 0: valid, length: 1 },
        {},
        missing,
        { toString: () => valid },
        { ...valid, extra: true },
        { ...valid, [Symbol("extra")]: true },
        new Proxy(
          {},
          {
            ownKeys() {
              throw new Error("private");
            },
          },
        ),
        new Proxy(valid as object, {
          getOwnPropertyDescriptor() {
            throw new Error("private");
          },
        }),
      ]) {
        expect(() => factory(invalid)).toThrow(
          InvalidAuthorizationEvidenceError,
        );
      }
      const throwing = { ...valid };
      Object.defineProperty(throwing, firstField, {
        enumerable: true,
        get() {
          throw new Error("private");
        },
      });
      expect(() => factory(throwing)).toThrow(
        InvalidAuthorizationEvidenceError,
      );
      let reads = 0;
      const stateful = { ...valid };
      const firstValue = (valid as Record<string, unknown>)[firstField];
      Object.defineProperty(stateful, firstField, {
        enumerable: true,
        get() {
          reads += 1;
          return reads === 1 ? firstValue : "fabricated";
        },
      });
      expect(factory(stateful)).toBeDefined();
      expect(reads).toBe(1);
      expect(Object.isFrozen(valid)).toBe(false);
    },
  );

  it("directly hostile-validates the exported Decision Artifact factory", () => {
    const valid = {
      operationId: target.operationId,
      decision: "allow",
      subject,
      action: target.action,
      resource: target.resource,
      requirementsStatus: "available",
      evaluatedPermissions: [],
      sensitivity: "standard",
      securityContext: {
        context: "available",
        device: "not-applicable",
        session: "not-applicable",
        trustLevel: "not-applicable",
      },
      policy: { id: "orion.minimum-authorization", version: "1.0.0" },
      reason: "no-permission-required",
      evidence: {
        grantEvidenceStatus: "available",
        confirmationStatus: "not-required",
      },
    };
    const result = createAuthorizationDecisionArtifact(valid);
    expect(Object.isFrozen(result)).toBe(true);
    expect(Object.isFrozen(result.securityContext)).toBe(true);
    expect(Object.isFrozen(valid)).toBe(false);
    for (const invalid of [
      null,
      undefined,
      "value",
      1,
      true,
      1n,
      Symbol("x"),
      () => valid,
      [],
      [valid],
      {},
      { ...valid, decision: undefined },
      { ...valid, extra: true },
      { ...valid, [Symbol("extra")]: true },
      { toString: () => valid },
      new Proxy(
        {},
        {
          ownKeys() {
            throw new Error("private");
          },
        },
      ),
      new Proxy(valid, {
        getOwnPropertyDescriptor() {
          throw new Error("private");
        },
      }),
    ]) {
      expect(() => createAuthorizationDecisionArtifact(invalid)).toThrow(
        InvalidSecurityStateError,
      );
    }
    const throwing = { ...valid };
    Object.defineProperty(throwing, "decision", {
      enumerable: true,
      get() {
        throw new Error("private");
      },
    });
    expect(() => createAuthorizationDecisionArtifact(throwing)).toThrow(
      InvalidSecurityStateError,
    );
    let reads = 0;
    const stateful = { ...valid };
    Object.defineProperty(stateful, "decision", {
      enumerable: true,
      get() {
        reads += 1;
        return reads === 1 ? "allow" : "deny";
      },
    });
    expect(createAuthorizationDecisionArtifact(stateful).decision).toBe(
      "allow",
    );
    expect(reads).toBe(1);
  });
});
