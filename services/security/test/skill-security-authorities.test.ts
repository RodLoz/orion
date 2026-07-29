import { describe, expect, it, vi } from "vitest";
import {
  InvalidSkillAuthorityError,
  InvalidSkillExecutionStateError,
} from "@orion/core";
import {
  ProcessLocalSkillInvocationRequirementsAuthority,
  ProcessLocalSkillInvocationSensitivityAuthority,
} from "../src/index.js";

const request = {
  intent: "resolve-skill-invocation-sensitivity" as const,
  action: "skill.invoke" as never,
  resource: {
    kind: "identified" as const,
    resourceId: "skill:weather" as never,
  },
};

const governedResource = Object.freeze({
  kind: "identified" as const,
  resourceId: "skill:weather-reader" as never,
});
const governedTarget = Object.freeze({
  operationId: "operation-1",
  skillId: "weather-reader",
  skillVersion: "1.0.0",
  capability: "weather.read",
  action: "skill.invoke",
  resource: governedResource,
  requiredPermissions: Object.freeze(["weather.read"]),
  inputNames: Object.freeze(["location.value"]),
  outputNames: Object.freeze(["weather.value"]),
  failureModes: Object.freeze(["weather.unavailable"]),
}) as never;

describe("M9 Security-owned Skill sensitivity authority", () => {
  it("proves sensitivity request/action precedence suppresses lookup and authority registration", () => {
    const authority = new ProcessLocalSkillInvocationSensitivityAuthority([]);
    const originalGet = Map.prototype.get;
    const lookup = vi.spyOn(Map.prototype, "get").mockImplementation(function (
      this: Map<unknown, unknown>,
      key: unknown,
    ) {
      return Reflect.apply(originalGet, this, [key]);
    });
    try {
      expect(() =>
        authority.resolve({
          ...request,
          action: " invalid" as never,
        }),
      ).toThrow(InvalidSkillAuthorityError);
      expect(lookup).toHaveBeenCalledTimes(0);
    } finally {
      lookup.mockRestore();
    }
  });

  it("proves lookup, candidate construction, registration, and correspondence order", () => {
    const authority = new ProcessLocalSkillInvocationSensitivityAuthority([
      {
        action: "skill.invoke",
        resourceId: "skill:weather",
        sensitivity: "standard",
      },
    ]);
    const originalFreeze = Object.freeze;
    const originalSet = WeakMap.prototype.set;

    let candidateConstructions = 0;
    const freezeCounter = vi
      .spyOn(Object, "freeze")
      .mockImplementation(<T>(value: T): Readonly<T> => {
        if (
          typeof value === "object" &&
          value !== null &&
          Reflect.getOwnPropertyDescriptor(value, "status") !== undefined
        )
          candidateConstructions += 1;
        return originalFreeze(value);
      });
    const lookupFailure = vi
      .spyOn(Map.prototype, "get")
      .mockImplementation(() => {
        throw new Error("isolated-table-lookup");
      });
    try {
      expect(() => authority.resolve(request)).toThrow(
        InvalidSkillExecutionStateError,
      );
    } finally {
      lookupFailure.mockRestore();
      freezeCounter.mockRestore();
    }
    expect(candidateConstructions).toBe(0);

    let registrations = 0;
    const registrationCounter = vi
      .spyOn(WeakMap.prototype, "set")
      .mockImplementation(function <K extends WeakKey, V>(
        this: WeakMap<K, V>,
        key: K,
        value: V,
      ): WeakMap<K, V> {
        if (
          typeof key === "object" &&
          key !== null &&
          Reflect.getOwnPropertyDescriptor(key, "status") !== undefined
        )
          registrations += 1;
        return Reflect.apply(originalSet, this, [key, value]) as WeakMap<K, V>;
      });
    const constructionFailure = vi
      .spyOn(Object, "freeze")
      .mockImplementation(<T>(value: T): Readonly<T> => {
        if (
          typeof value === "object" &&
          value !== null &&
          Reflect.getOwnPropertyDescriptor(value, "status") !== undefined
        )
          throw new Error("isolated-candidate-construction");
        return originalFreeze(value);
      });
    try {
      expect(() => authority.resolve(request)).toThrow(
        InvalidSkillExecutionStateError,
      );
    } finally {
      constructionFailure.mockRestore();
      registrationCounter.mockRestore();
    }
    expect(registrations).toBe(0);

    let registrationAttempts = 0;
    let correspondenceCalls = 0;
    const registrationFailure = vi
      .spyOn(WeakMap.prototype, "set")
      .mockImplementation(function <K extends WeakKey, V>(
        this: WeakMap<K, V>,
        key: K,
        value: V,
      ): WeakMap<K, V> {
        if (
          typeof key === "object" &&
          key !== null &&
          Reflect.getOwnPropertyDescriptor(key, "status") !== undefined
        ) {
          registrationAttempts += 1;
          throw new Error("isolated-authority-registration");
        }
        return Reflect.apply(originalSet, this, [key, value]) as WeakMap<K, V>;
      });
    const verifyAfterResolve = (candidate: unknown) => {
      correspondenceCalls += 1;
      return authority.verify(candidate, {
        action: request.action,
        resource: request.resource,
      });
    };
    try {
      expect(() => {
        const candidate = authority.resolve(request);
        verifyAfterResolve(candidate);
      }).toThrow(InvalidSkillExecutionStateError);
    } finally {
      registrationFailure.mockRestore();
    }
    expect(registrationAttempts).toBe(1);
    expect(correspondenceCalls).toBe(0);

    const candidate = authority.resolve(request);
    expect(verifyAfterResolve(candidate)).toBe(true);
    expect(correspondenceCalls).toBe(1);
    expect(
      authority.verify(
        { ...candidate },
        {
          action: request.action,
          resource: request.resource,
        },
      ),
    ).toBe(false);
  });

  it("proves every requirements boundary suppresses its immediately later stage", () => {
    const targetVerifier = vi.fn(() => false);
    const sensitivityResolve = vi.fn();
    const sensitivityVerify = vi.fn();
    const authority = new ProcessLocalSkillInvocationRequirementsAuthority(
      {
        resolve: sensitivityResolve,
        verify: sensitivityVerify,
      },
      targetVerifier,
    );
    expect(() =>
      authority.resolve({
        intent: "resolve-skill-invocation-requirements",
        target: governedTarget,
        extra: true,
      } as never),
    ).toThrow(InvalidSkillAuthorityError);
    expect(targetVerifier).toHaveBeenCalledTimes(0);
    expect(sensitivityResolve).toHaveBeenCalledTimes(0);

    expect(() =>
      authority.resolve({
        intent: "resolve-skill-invocation-requirements",
        target: governedTarget,
      }),
    ).toThrow(InvalidSkillAuthorityError);
    expect(targetVerifier).toHaveBeenCalledTimes(1);
    expect(sensitivityResolve).toHaveBeenCalledTimes(0);

    let classificationReads = 0;
    const hostileClassification = new Proxy(
      {},
      {
        ownKeys() {
          classificationReads += 1;
          throw new Error("later-classification-secret");
        },
      },
    );
    const hostileResolve = vi.fn(() => hostileClassification as never);
    const rejectingVerify = vi.fn(() => false);
    const rejecting = new ProcessLocalSkillInvocationRequirementsAuthority(
      {
        resolve: hostileResolve,
        verify: rejectingVerify,
      },
      vi.fn(() => true),
    );
    expect(() =>
      rejecting.resolve({
        intent: "resolve-skill-invocation-requirements",
        target: governedTarget,
      }),
    ).toThrow(InvalidSkillAuthorityError);
    expect(hostileResolve).toHaveBeenCalledTimes(1);
    expect(rejectingVerify).toHaveBeenCalledTimes(1);
    expect(classificationReads).toBe(0);
  });

  it.each(["standard", "sensitive"] as const)(
    "returns and verifies exact %s classification",
    (sensitivity) => {
      const authority = new ProcessLocalSkillInvocationSensitivityAuthority([
        {
          action: "skill.invoke",
          resourceId: "skill:weather",
          sensitivity,
        },
      ]);
      const result = authority.resolve(request);
      expect(result).toEqual({ status: "available", sensitivity });
      expect(authority.verify(result, request)).toBe(true);
      expect(authority.verify({ ...result }, request)).toBe(false);
    },
  );

  it("returns governed unavailable without a fallback", () => {
    const authority = new ProcessLocalSkillInvocationSensitivityAuthority([]);
    const result = authority.resolve(request);
    expect(result).toEqual({ status: "unavailable" });
    expect(authority.verify(result, request)).toBe(true);
  });

  it("rejects identical and contradictory duplicate configuration", () => {
    for (const entries of [
      [
        {
          action: "skill.invoke",
          resourceId: "skill:weather",
          sensitivity: "standard",
        },
        {
          action: "skill.invoke",
          resourceId: "skill:weather",
          sensitivity: "standard",
        },
      ],
      [
        {
          action: "skill.invoke",
          resourceId: "skill:weather",
          sensitivity: "standard",
        },
        {
          action: "skill.invoke",
          resourceId: "skill:weather",
          sensitivity: "sensitive",
        },
      ],
    ] as const) {
      const authority = new ProcessLocalSkillInvocationSensitivityAuthority(
        entries,
      );
      expect(() => authority.resolve(request)).toThrow(
        InvalidSkillExecutionStateError,
      );
    }
  });

  it("rejects malformed direct requests without leaking values", () => {
    const authority = new ProcessLocalSkillInvocationSensitivityAuthority([]);
    expect(() =>
      authority.resolve({ ...request, action: "wrong" as never }),
    ).toThrow(InvalidSkillAuthorityError);
    expect(
      authority.resolve({
        ...request,
        resource: {
          kind: "identified",
          resourceId: "skill:wrong",
        } as never,
      }),
    ).toEqual({ status: "unavailable" });
  });

  it.each([
    null,
    undefined,
    "sensitivity",
    1,
    true,
    1n,
    Symbol("sensitivity"),
    () => undefined,
    [],
    {},
    { ...request, action: undefined },
    { ...request, extra: true },
    Object.create(request),
    { ...request, [Symbol("secret")]: true },
    new Proxy(
      {},
      {
        ownKeys() {
          throw new Error("secret");
        },
      },
    ),
  ])("contains exact-request hostility %#", (candidate) => {
    const authority = new ProcessLocalSkillInvocationSensitivityAuthority([]);
    expect(() => authority.resolve(candidate as never)).toThrow(
      InvalidSkillAuthorityError,
    );
  });

  it("treats a verifier returning true as necessary but insufficient", () => {
    const authority = new ProcessLocalSkillInvocationRequirementsAuthority(
      {
        resolve: () =>
          new Proxy(
            {},
            {
              ownKeys() {
                throw new Error("classification-secret");
              },
            },
          ) as never,
        verify: () => true,
      },
      () => true,
    );
    expect(() =>
      authority.resolve({
        intent: "resolve-skill-invocation-requirements",
        target: governedTarget,
      }),
    ).toThrow(InvalidSkillAuthorityError);
  });

  it("captures sensitivity configuration without reading accessors", () => {
    let reads = 0;
    const entry = {};
    Object.defineProperty(entry, "action", {
      enumerable: true,
      get() {
        reads += 1;
        return "skill.invoke";
      },
    });
    Object.defineProperties(entry, {
      resourceId: { enumerable: true, value: "skill:weather" },
      sensitivity: { enumerable: true, value: "standard" },
    });
    const authority = new ProcessLocalSkillInvocationSensitivityAuthority([
      entry as never,
    ]);
    expect(() => authority.resolve(request)).toThrow(
      InvalidSkillExecutionStateError,
    );
    expect(reads).toBe(0);
    expect(Object.isFrozen(entry)).toBe(false);
  });

  it("contains descriptor and revoked request hostility", () => {
    const authority = new ProcessLocalSkillInvocationSensitivityAuthority([]);
    const descriptor = new Proxy(request, {
      getOwnPropertyDescriptor() {
        throw new Error("sensitivity-secret");
      },
    });
    const revoked = Proxy.revocable(request, {});
    revoked.revoke();
    for (const candidate of [descriptor, revoked.proxy, () => request])
      expect(() => authority.resolve(candidate as never)).toThrow(
        InvalidSkillAuthorityError,
      );
  });

  it("rejects cloned, reconstructed, and cross-instance classifications", () => {
    const first = new ProcessLocalSkillInvocationSensitivityAuthority([
      {
        action: "skill.invoke",
        resourceId: "skill:weather",
        sensitivity: "standard",
      },
    ]);
    const second = new ProcessLocalSkillInvocationSensitivityAuthority([
      {
        action: "skill.invoke",
        resourceId: "skill:weather",
        sensitivity: "standard",
      },
    ]);
    const classification = first.resolve(request);
    for (const candidate of [
      { ...classification },
      structuredClone(classification),
      JSON.parse(JSON.stringify(classification)),
    ])
      expect(first.verify(candidate as never, request)).toBe(false);
    expect(second.verify(classification, request)).toBe(false);
  });

  it.each(["available", "unavailable"] as const)(
    "resolves exact governed requirements status %s once",
    (status) => {
      let sensitivityCalls = 0;
      const sensitivity = {
        resolve: () => {
          sensitivityCalls += 1;
          return status === "available"
            ? ({ status: "available", sensitivity: "standard" } as const)
            : ({ status: "unavailable" } as const);
        },
        verify: () => true,
      };
      const authority = new ProcessLocalSkillInvocationRequirementsAuthority(
        sensitivity,
        (candidate) => candidate === governedTarget,
      );
      const result = authority.resolve({
        intent: "resolve-skill-invocation-requirements",
        target: governedTarget,
      });
      expect(result.status).toBe(status);
      expect(sensitivityCalls).toBe(1);
      expect(
        authority.verify(result, {
          operationId: "operation-1",
          action: "skill.invoke",
          resource: governedResource,
        }),
      ).toBe(true);
      expect(
        authority.verify(
          { ...result },
          {
            operationId: "operation-1",
            action: "skill.invoke",
            resource: governedResource,
          },
        ),
      ).toBe(false);
    },
  );

  it("proves every remaining Requirements precedence adjacency", () => {
    let targetReads = 0;
    let sensitivityCalls = 0;
    const hostileTarget = new Proxy(
      {},
      {
        ownKeys() {
          targetReads += 1;
          throw new Error("later-target-derivation");
        },
      },
    );
    const rejectedTarget = new ProcessLocalSkillInvocationRequirementsAuthority(
      {
        resolve() {
          sensitivityCalls += 1;
          return { status: "unavailable" };
        },
        verify: () => true,
      },
      () => false,
    );
    expect(() =>
      rejectedTarget.resolve({
        intent: "resolve-skill-invocation-requirements",
        target: hostileTarget as never,
      }),
    ).toThrow(InvalidSkillAuthorityError);
    expect(targetReads).toBe(0);
    expect(sensitivityCalls).toBe(0);

    const malformedTarget = Object.freeze({
      ...(governedTarget as object),
      action: " invalid",
    }) as never;
    const derivationFailure =
      new ProcessLocalSkillInvocationRequirementsAuthority(
        {
          resolve() {
            sensitivityCalls += 1;
            return { status: "unavailable" };
          },
          verify: () => true,
        },
        () => true,
      );
    expect(() =>
      derivationFailure.resolve({
        intent: "resolve-skill-invocation-requirements",
        target: malformedTarget,
      }),
    ).toThrow(InvalidSkillAuthorityError);
    expect(sensitivityCalls).toBe(0);

    let governedReads = 0;
    let resultConstructions = 0;
    const hostileClassification = new Proxy(
      {},
      {
        ownKeys() {
          governedReads += 1;
          throw new Error("later-governed-availability");
        },
      },
    );
    const correspondenceFailure =
      new ProcessLocalSkillInvocationRequirementsAuthority(
        {
          resolve: () => hostileClassification as never,
          verify: () => false,
        },
        (candidate) => candidate === governedTarget,
      );
    expect(() =>
      correspondenceFailure.resolve({
        intent: "resolve-skill-invocation-requirements",
        target: governedTarget,
      }),
    ).toThrow(InvalidSkillAuthorityError);
    expect(governedReads).toBe(0);

    const originalFreeze = Object.freeze;
    const constructionCounter = vi
      .spyOn(Object, "freeze")
      .mockImplementation(<T>(value: T): Readonly<T> => {
        if (
          typeof value === "object" &&
          value !== null &&
          (Reflect.getOwnPropertyDescriptor(value, "requirements") !==
            undefined ||
            (Reflect.getOwnPropertyDescriptor(value, "status")?.value ===
              "unavailable" &&
              Reflect.getOwnPropertyDescriptor(value, "operationId") !==
                undefined))
        )
          resultConstructions += 1;
        return originalFreeze(value);
      });
    const invalidGovernedAvailability =
      new ProcessLocalSkillInvocationRequirementsAuthority(
        {
          resolve: () => ({ status: "invalid" }) as never,
          verify: () => true,
        },
        (candidate) => candidate === governedTarget,
      );
    try {
      expect(() =>
        invalidGovernedAvailability.resolve({
          intent: "resolve-skill-invocation-requirements",
          target: governedTarget,
        }),
      ).toThrow(InvalidSkillAuthorityError);
    } finally {
      constructionCounter.mockRestore();
    }
    expect(resultConstructions).toBe(0);
  });

  it.each([
    null,
    undefined,
    1,
    [],
    {},
    {
      intent: "resolve-skill-invocation-requirements",
      target: undefined,
    },
    {
      intent: "resolve-skill-invocation-requirements",
      target: governedTarget,
      extra: true,
    },
    Object.create({
      intent: "resolve-skill-invocation-requirements",
      target: governedTarget,
    }),
  ])("rejects malformed requirements request %#", (candidate) => {
    const authority = new ProcessLocalSkillInvocationRequirementsAuthority(
      new ProcessLocalSkillInvocationSensitivityAuthority([]),
      () => true,
    );
    expect(() => authority.resolve(candidate as never)).toThrow(
      InvalidSkillAuthorityError,
    );
  });

  it.each([
    new Error("sensitivity-native-secret"),
    "sensitivity-primitive-secret",
    1,
  ])("normalizes sensitivity resolver throw %#", (thrown) => {
    const authority = new ProcessLocalSkillInvocationRequirementsAuthority(
      {
        resolve() {
          throw thrown;
        },
        verify: () => true,
      },
      () => true,
    );
    expect(() =>
      authority.resolve({
        intent: "resolve-skill-invocation-requirements",
        target: governedTarget,
      }),
    ).toThrow(InvalidSkillExecutionStateError);
  });

  it.each([
    () => {
      throw new Error("sensitivity-verifier-secret");
    },
    () => 1 as never,
  ])("normalizes sensitivity verifier failure", (verify) => {
    const authority = new ProcessLocalSkillInvocationRequirementsAuthority(
      {
        resolve: () => ({ status: "unavailable" }),
        verify,
      },
      () => true,
    );
    expect(() =>
      authority.resolve({
        intent: "resolve-skill-invocation-requirements",
        target: governedTarget,
      }),
    ).toThrow(InvalidSkillExecutionStateError);
  });

  it("preserves the requirements source graph and canonical permission order", () => {
    const requiredPermissions = ["z.permission", "a.permission"];
    const target = {
      ...(governedTarget as object),
      requiredPermissions,
    } as never;
    const before = structuredClone(target);
    const authority = new ProcessLocalSkillInvocationRequirementsAuthority(
      {
        resolve: () => ({ status: "available", sensitivity: "sensitive" }),
        verify: () => true,
      },
      (candidate) => candidate === target,
    );
    const result = authority.resolve({
      intent: "resolve-skill-invocation-requirements",
      target,
    });
    expect(result.status).toBe("available");
    if (result.status === "available") {
      expect(result.requirements.requiredPermissions).toEqual([
        "a.permission",
        "z.permission",
      ]);
      expect(result.requirements.sensitivity).toBe("sensitive");
    }
    expect(target).toEqual(before);
    expect(Object.isFrozen(target)).toBe(false);
    expect(Object.isFrozen(requiredPermissions)).toBe(false);
  });

  it.each([0, 1, 64] as const)(
    "copies exactly %i governed permissions without weakening",
    (count) => {
      const requiredPermissions = Array.from(
        { length: count },
        (_, index) => `permission.${String(index).padStart(2, "0")}`,
      ).reverse();
      const before = [...requiredPermissions];
      const target = {
        ...(governedTarget as object),
        requiredPermissions,
      } as never;
      const authority = new ProcessLocalSkillInvocationRequirementsAuthority(
        {
          resolve: () => ({
            status: "available",
            sensitivity: "standard",
          }),
          verify: () => true,
        },
        (candidate) => candidate === target,
      );
      const result = authority.resolve({
        intent: "resolve-skill-invocation-requirements",
        target,
      });
      expect(result.status).toBe("available");
      if (result.status === "available")
        expect(result.requirements.requiredPermissions).toEqual(
          [...requiredPermissions].sort(),
        );
      expect(requiredPermissions).toEqual(before);
      expect(Object.isFrozen(requiredPermissions)).toBe(false);
    },
  );

  it("rejects fake, cloned, and cross-instance governed targets", () => {
    const genuine = (candidate: unknown) => candidate === governedTarget;
    const authority = new ProcessLocalSkillInvocationRequirementsAuthority(
      new ProcessLocalSkillInvocationSensitivityAuthority([]),
      genuine,
    );
    for (const target of [
      { ...(governedTarget as object) },
      structuredClone(governedTarget),
      JSON.parse(JSON.stringify(governedTarget)),
    ])
      expect(() =>
        authority.resolve({
          intent: "resolve-skill-invocation-requirements",
          target: target as never,
        }),
      ).toThrow(InvalidSkillAuthorityError);
  });

  it("isolates sensitivity and requirements authority instances", () => {
    const sensitivityA = new ProcessLocalSkillInvocationSensitivityAuthority(
      [],
    );
    const sensitivityB = new ProcessLocalSkillInvocationSensitivityAuthority(
      [],
    );
    const classification = sensitivityA.resolve(request);
    expect(sensitivityA.verify(classification, request)).toBe(true);
    expect(sensitivityB.verify(classification, request)).toBe(false);

    const requirementsA = new ProcessLocalSkillInvocationRequirementsAuthority(
      sensitivityA,
      (candidate) => candidate === governedTarget,
    );
    const requirementsB = new ProcessLocalSkillInvocationRequirementsAuthority(
      sensitivityB,
      (candidate) => candidate === governedTarget,
    );
    const result = requirementsA.resolve({
      intent: "resolve-skill-invocation-requirements",
      target: governedTarget,
    });
    const expected = {
      operationId: "operation-1",
      action: "skill.invoke",
      resource: governedResource,
    };
    expect(requirementsA.verify(result, expected)).toBe(true);
    expect(requirementsB.verify(result, expected)).toBe(false);
  });

  it("treats unscoped sensitivity as exact governed unavailable", () => {
    const authority = new ProcessLocalSkillInvocationSensitivityAuthority([
      {
        action: "skill.invoke",
        resourceId: "skill:weather",
        sensitivity: "sensitive",
      },
    ]);
    const unscoped = {
      intent: "resolve-skill-invocation-sensitivity" as const,
      action: "skill.invoke" as never,
      resource: { kind: "unscoped" as const },
    };
    const result = authority.resolve(unscoped);
    expect(result).toEqual({ status: "unavailable" });
    expect(authority.verify(result, unscoped)).toBe(true);
  });
});
