import { describe, expect, it } from "vitest";
import {
  InvalidAuthorizationInputError,
  createAuthorizationDecisionArtifact,
  createAuthorizationEvaluationOutcome,
  createGovernedSecurityEvaluationSummary,
} from "../src/index.js";

const artifact = () =>
  createAuthorizationDecisionArtifact({
    operationId: "outcome-op",
    decision: "allow",
    subject: { kind: "anonymous" },
    action: "skill.invoke",
    resource: { kind: "identified", resourceId: "skill:weather-reader" },
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
  });

describe("Security 1.1 Core Outcome values", () => {
  it.each(["available", "unavailable", "not-applicable"] as const)(
    "constructs every governed status vocabulary value: %s",
    (status) => {
      const source = {
        operationId: "outcome-op",
        subject: { kind: "anonymous" as const },
        securityContext: {
          context: status,
          device: status,
          session: status,
          trustLevel: status,
        },
      };
      const result = createGovernedSecurityEvaluationSummary(source);
      expect(result).toEqual(source);
      expect(Object.isFrozen(result)).toBe(true);
      expect(Object.isFrozen(result.securityContext)).toBe(true);
      expect(Object.isFrozen(source)).toBe(false);
      expect(Object.isFrozen(source.securityContext)).toBe(false);
    },
  );

  it("constructs authenticated Summary and a canonical immutable Outcome", () => {
    const authorization = artifact();
    const summary = createGovernedSecurityEvaluationSummary({
      operationId: authorization.operationId,
      subject: { kind: "authenticated", identityId: "identity.test" },
      securityContext: authorization.securityContext,
    });
    expect(summary.subject).toEqual({
      kind: "authenticated",
      identityId: "identity.test",
    });
    const matchingSummary = createGovernedSecurityEvaluationSummary({
      operationId: authorization.operationId,
      subject: authorization.subject,
      securityContext: authorization.securityContext,
    });
    const source = {
      authorization,
      securityEvaluationSummary: matchingSummary,
    };
    const outcome = createAuthorizationEvaluationOutcome(source);
    expect(outcome).toEqual(source);
    expect(Object.isFrozen(outcome)).toBe(true);
    expect(Object.isFrozen(outcome.authorization)).toBe(true);
    expect(Object.isFrozen(outcome.securityEvaluationSummary)).toBe(true);
    expect(Object.isFrozen(outcome.securityEvaluationSummary.subject)).toBe(
      true,
    );
    expect(Object.isFrozen(source)).toBe(false);
  });

  it.each([
    null,
    undefined,
    1,
    [],
    {},
    { operationId: "outcome-op", subject: { kind: "anonymous" } },
    {
      operationId: "outcome-op",
      subject: { kind: "anonymous" },
      securityContext: {
        context: "available",
        device: "available",
        session: "available",
        trustLevel: "available",
      },
      extra: true,
    },
    Object.create({
      operationId: "outcome-op",
      subject: { kind: "anonymous" },
      securityContext: {},
    }),
    new Proxy(
      {},
      {
        ownKeys() {
          throw new Error("summary-secret");
        },
      },
    ),
  ])("rejects malformed or hostile Summary %#", (candidate) => {
    expect(() => createGovernedSecurityEvaluationSummary(candidate)).toThrow(
      InvalidAuthorizationInputError,
    );
  });

  it("rejects visible Outcome correspondence mismatches", () => {
    const authorization = artifact();
    const summary = createGovernedSecurityEvaluationSummary({
      operationId: authorization.operationId,
      subject: authorization.subject,
      securityContext: {
        ...authorization.securityContext,
        device: "available",
      },
    });
    expect(() =>
      createAuthorizationEvaluationOutcome({
        authorization,
        securityEvaluationSummary: summary,
      }),
    ).toThrow(InvalidAuthorizationInputError);
  });

  it.each([
    ["context", "available"],
    ["context", "unavailable"],
    ["context", "not-applicable"],
    ["device", "available"],
    ["device", "unavailable"],
    ["device", "not-applicable"],
    ["session", "available"],
    ["session", "unavailable"],
    ["session", "not-applicable"],
    ["trustLevel", "available"],
    ["trustLevel", "unavailable"],
    ["trustLevel", "not-applicable"],
  ] as const)("accepts exact %s status %s independently", (field, status) => {
    const securityContext = {
      context: "available" as const,
      device: "available" as const,
      session: "available" as const,
      trustLevel: "available" as const,
      [field]: status,
    };
    const result = createGovernedSecurityEvaluationSummary({
      operationId: "outcome-op",
      subject: { kind: "anonymous" },
      securityContext,
    });
    expect(result.securityContext[field]).toBe(status);
    expect(result.securityContext).not.toHaveProperty("permissionsStatus");
  });

  it("rejects hostile nested subjects without invoking accessors", () => {
    let getterCalls = 0;
    const accessor = {};
    Object.defineProperty(accessor, "kind", {
      enumerable: true,
      get() {
        getterCalls += 1;
        throw new Error("subject-secret");
      },
    });
    const stateful = {};
    Object.defineProperty(stateful, "kind", {
      enumerable: true,
      get() {
        getterCalls += 1;
        return "anonymous";
      },
    });
    const ownKeys = new Proxy(
      {},
      {
        ownKeys() {
          throw new Error("subject-secret");
        },
      },
    );
    const descriptors = new Proxy(
      { kind: "anonymous" },
      {
        getOwnPropertyDescriptor() {
          throw new Error("subject-secret");
        },
      },
    );
    const revocable = Proxy.revocable({ kind: "anonymous" }, {});
    revocable.revoke();
    const customPrototype = Object.assign(Object.create({ inherited: true }), {
      kind: "anonymous",
    });
    const inherited = Object.create({ kind: "anonymous" });
    const symbolic = { kind: "anonymous", [Symbol("subject")]: true };
    for (const subject of [
      {},
      { kind: undefined },
      { kind: "anonymous", extra: true },
      symbolic,
      inherited,
      customPrototype,
      accessor,
      stateful,
      ownKeys,
      descriptors,
      revocable.proxy,
    ]) {
      expect(() =>
        createGovernedSecurityEvaluationSummary({
          operationId: "outcome-op",
          subject,
          securityContext: {
            context: "available",
            device: "available",
            session: "available",
            trustLevel: "available",
          },
        }),
      ).toThrow(InvalidAuthorizationInputError);
    }
    expect(getterCalls).toBe(0);
  });

  it("directly validates the complete Outcome envelope boundary", () => {
    const authorization = artifact();
    const securityEvaluationSummary = createGovernedSecurityEvaluationSummary({
      operationId: authorization.operationId,
      subject: authorization.subject,
      securityContext: authorization.securityContext,
    });
    const valid = { authorization, securityEvaluationSummary };
    let getterCalls = 0;
    const accessor = { ...valid } as Record<string, unknown>;
    Object.defineProperty(accessor, "authorization", {
      enumerable: true,
      get() {
        getterCalls += 1;
        return authorization;
      },
    });
    const ownKeys = new Proxy(valid, {
      ownKeys() {
        throw new Error("outcome-secret");
      },
    });
    const descriptors = new Proxy(valid, {
      getOwnPropertyDescriptor() {
        throw new Error("outcome-secret");
      },
    });
    const revoked = Proxy.revocable(valid, {});
    revoked.revoke();
    for (const candidate of [
      null,
      undefined,
      "outcome",
      1,
      true,
      1n,
      Symbol("outcome"),
      () => valid,
      [],
      {},
      { authorization },
      { securityEvaluationSummary },
      { authorization: undefined, securityEvaluationSummary },
      { authorization, securityEvaluationSummary: undefined },
      { ...valid, extra: true },
      { ...valid, [Symbol("extra")]: true },
      Object.create(valid),
      Object.assign(Object.create({ custom: true }), valid),
      accessor,
      ownKeys,
      descriptors,
      revoked.proxy,
    ])
      expect(() => createAuthorizationEvaluationOutcome(candidate)).toThrow(
        InvalidAuthorizationInputError,
      );
    expect(getterCalls).toBe(0);
  });

  it.each([
    ["operation", { operationId: "different-operation" }],
    ["subject", { subject: { kind: "authenticated", identityId: "other" } }],
    ["context", { securityContext: { context: "unavailable" } }],
    ["device", { securityContext: { device: "unavailable" } }],
    ["session", { securityContext: { session: "unavailable" } }],
    ["trustLevel", { securityContext: { trustLevel: "unavailable" } }],
  ] as const)(
    "rejects independent %s correspondence mismatch",
    (_name, patch) => {
      const authorization = artifact();
      const securityContext = {
        ...authorization.securityContext,
        ...("securityContext" in patch ? patch.securityContext : {}),
      };
      const summary = createGovernedSecurityEvaluationSummary({
        operationId:
          "operationId" in patch
            ? patch.operationId
            : authorization.operationId,
        subject: "subject" in patch ? patch.subject : authorization.subject,
        securityContext,
      });
      expect(() =>
        createAuthorizationEvaluationOutcome({
          authorization,
          securityEvaluationSummary: summary,
        }),
      ).toThrow(InvalidAuthorizationInputError);
    },
  );

  it.each([
    null,
    undefined,
    "summary",
    1,
    true,
    1n,
    Symbol("summary"),
    () => ({}),
    [],
    {},
    { subject: { kind: "anonymous" }, securityContext: {} },
    { operationId: "outcome-op", securityContext: {} },
    { operationId: "outcome-op", subject: { kind: "anonymous" } },
    {
      operationId: undefined,
      subject: { kind: "anonymous" },
      securityContext: {},
    },
  ])("rejects every primitive/incomplete Summary envelope %#", (candidate) => {
    expect(() => createGovernedSecurityEvaluationSummary(candidate)).toThrow(
      InvalidAuthorizationInputError,
    );
  });

  it("enforces operation and authenticated identity grammar", () => {
    const make = (operationId: string, identityId = "identity.test") =>
      createGovernedSecurityEvaluationSummary({
        operationId,
        subject: { kind: "authenticated", identityId },
        securityContext: {
          context: "available",
          device: "unavailable",
          session: "not-applicable",
          trustLevel: "available",
        },
      });
    expect(make("a").operationId).toBe("a");
    expect(make("a".repeat(128)).operationId).toHaveLength(128);
    for (const operationId of ["", "a".repeat(129), " operation", "a b"])
      expect(() => make(operationId)).toThrow(InvalidAuthorizationInputError);
    for (const identityId of ["", "Identity", ".identity", "identity..test"])
      expect(() => make("outcome-op", identityId)).toThrow(
        InvalidAuthorizationInputError,
      );
  });

  it("rejects hostile nested securityContext and invalid statuses", () => {
    const base = {
      context: "available",
      device: "unavailable",
      session: "not-applicable",
      trustLevel: "available",
    };
    let getters = 0;
    const accessor = { ...base };
    Object.defineProperty(accessor, "context", {
      enumerable: true,
      get() {
        getters += 1;
        return "available";
      },
    });
    const ownKeys = new Proxy(base, {
      ownKeys() {
        throw new Error("security-context-secret");
      },
    });
    const descriptor = new Proxy(base, {
      getOwnPropertyDescriptor() {
        throw new Error("security-context-secret");
      },
    });
    const revoked = Proxy.revocable(base, {});
    revoked.revoke();
    for (const securityContext of [
      { ...base, context: "unknown" },
      { ...base, device: undefined },
      { ...base, extra: true },
      { ...base, [Symbol("status")]: true },
      Object.create(base),
      Object.assign(Object.create({ custom: true }), base),
      accessor,
      ownKeys,
      descriptor,
      revoked.proxy,
    ])
      expect(() =>
        createGovernedSecurityEvaluationSummary({
          operationId: "outcome-op",
          subject: { kind: "anonymous" },
          securityContext,
        }),
      ).toThrow(InvalidAuthorizationInputError);
    expect(getters).toBe(0);
  });

  it("reconstructs a mixed-status Summary without retaining its source graph", () => {
    const source = {
      operationId: "outcome-op",
      subject: { kind: "authenticated", identityId: "identity.test" },
      securityContext: {
        context: "available",
        device: "unavailable",
        session: "not-applicable",
        trustLevel: "available",
      },
    } as const;
    const before = structuredClone(source);
    const result = createGovernedSecurityEvaluationSummary(source);
    expect(result).toEqual(before);
    expect(result).not.toBe(source);
    expect(result.subject).not.toBe(source.subject);
    expect(result.securityContext).not.toBe(source.securityContext);
    expect(Object.isFrozen(result)).toBe(true);
    expect(Object.isFrozen(result.subject)).toBe(true);
    expect(Object.isFrozen(result.securityContext)).toBe(true);
    expect(source).toEqual(before);
    expect(Object.isFrozen(source)).toBe(false);
    expect(Object.isFrozen(source.subject)).toBe(false);
    expect(Object.isFrozen(source.securityContext)).toBe(false);
  });

  it("contains hostile nested Artifact and Summary graphs in Outcome construction", () => {
    const authorization = artifact();
    const summary = createGovernedSecurityEvaluationSummary({
      operationId: authorization.operationId,
      subject: authorization.subject,
      securityContext: authorization.securityContext,
    });
    const revokedArtifact = Proxy.revocable(authorization, {});
    revokedArtifact.revoke();
    const revokedSummary = Proxy.revocable(summary, {});
    revokedSummary.revoke();
    for (const [candidateAuthorization, candidateSummary] of [
      [{}, summary],
      [
        new Proxy(
          {},
          {
            ownKeys() {
              throw new Error("artifact-secret");
            },
          },
        ),
        summary,
      ],
      [revokedArtifact.proxy, summary],
      [authorization, {}],
      [
        authorization,
        new Proxy(
          {},
          {
            ownKeys() {
              throw new Error("summary-secret");
            },
          },
        ),
      ],
      [authorization, revokedSummary.proxy],
    ])
      expect(() =>
        createAuthorizationEvaluationOutcome({
          authorization: candidateAuthorization,
          securityEvaluationSummary: candidateSummary,
        }),
      ).toThrow(InvalidAuthorizationInputError);
  });

  it("protects nested Artifact getter and stateful getter extraction", () => {
    const canonical = artifact();
    const summary = createGovernedSecurityEvaluationSummary({
      operationId: canonical.operationId,
      subject: canonical.subject,
      securityContext: canonical.securityContext,
    });
    let reads = 0;
    const stateful = structuredClone(canonical) as unknown as Record<
      string,
      unknown
    >;
    Object.defineProperty(stateful, "decision", {
      enumerable: true,
      get() {
        reads += 1;
        return reads === 1 ? "allow" : "deny";
      },
    });
    const reconstructed = createAuthorizationEvaluationOutcome({
      authorization: stateful,
      securityEvaluationSummary: summary,
    });
    expect(reconstructed.authorization.decision).toBe("allow");
    expect(reads).toBe(1);

    const throwing = structuredClone(canonical) as unknown as Record<
      string,
      unknown
    >;
    Object.defineProperty(throwing, "decision", {
      enumerable: true,
      get() {
        throw new Error("artifact-secret");
      },
    });
    expect(() =>
      createAuthorizationEvaluationOutcome({
        authorization: throwing,
        securityEvaluationSummary: summary,
      }),
    ).toThrow(InvalidAuthorizationInputError);
  });
});
