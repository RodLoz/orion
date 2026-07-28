import { describe, expect, it } from "vitest";
import {
  InvalidAuthorizationEvidenceError,
  createPermissionGrantEvidence,
  createProtectedActionRequirementsResolution,
} from "../src/index.js";

const subject = { kind: "anonymous" as const };
const resource = { kind: "unscoped" as const };
const requirement = (requiredPermissions: unknown) => ({
  status: "available",
  requirements: {
    operationId: "collection-op",
    action: "security.evaluate",
    resource,
    requiredPermissions,
    sensitivity: "standard",
  },
});
const evidence = (grants: unknown) => ({
  status: "available",
  operationId: "collection-op",
  subject,
  action: "security.evaluate",
  resource,
  evaluatedPermissions: ["security.execute"],
  grants,
});
const validGrant = {
  subject,
  permission: "security.execute",
  resource,
};

describe("M8 protected collection extraction", () => {
  it("captures permission length descriptor and each index once", () => {
    let lengthDescriptors = 0;
    let lengthGets = 0;
    let indexReads = 0;
    const source = ["security.execute"];
    Object.defineProperty(source, "0", {
      configurable: true,
      enumerable: true,
      get() {
        indexReads += 1;
        return "security.execute";
      },
    });
    const hostile = new Proxy(source, {
      get(target, key, receiver) {
        if (key === "length") lengthGets += 1;
        return Reflect.get(target, key, receiver);
      },
      getOwnPropertyDescriptor(target, key) {
        if (key === "length") lengthDescriptors += 1;
        return Reflect.getOwnPropertyDescriptor(target, key);
      },
    });
    createProtectedActionRequirementsResolution(requirement(hostile));
    expect(lengthGets).toBe(0);
    expect(lengthDescriptors).toBe(1);
    expect(indexReads).toBe(1);
    expect(Object.isFrozen(source)).toBe(false);
  });

  it("captures grant length descriptor and each index once", () => {
    let lengthDescriptors = 0;
    let lengthGets = 0;
    let indexReads = 0;
    const grant = {
      subject,
      permission: "security.execute",
      resource,
    };
    const source = [grant];
    Object.defineProperty(source, "0", {
      configurable: true,
      enumerable: true,
      get() {
        indexReads += 1;
        return grant;
      },
    });
    const hostile = new Proxy(source, {
      get(target, key, receiver) {
        if (key === "length") lengthGets += 1;
        return Reflect.get(target, key, receiver);
      },
      getOwnPropertyDescriptor(target, key) {
        if (key === "length") lengthDescriptors += 1;
        return Reflect.getOwnPropertyDescriptor(target, key);
      },
    });
    createPermissionGrantEvidence(evidence(hostile));
    expect(lengthGets).toBe(0);
    expect(lengthDescriptors).toBe(1);
    expect(indexReads).toBe(1);
    expect(Object.isFrozen(source)).toBe(false);
    expect(Object.isFrozen(grant)).toBe(false);
  });

  it("accepts a valid dense grant array without mutating or freezing it", () => {
    const grant = { ...validGrant };
    const source = [grant];
    const result = createPermissionGrantEvidence(evidence(source));
    expect(result.status).toBe("available");
    expect(source).toEqual([validGrant]);
    expect(Object.isFrozen(source)).toBe(false);
    expect(Object.isFrozen(grant)).toBe(false);
  });

  it.each([
    ["sparse", () => new Array(1)],
    [
      "decorated",
      () => Object.assign(["security.execute"], { decorated: true }),
    ],
    [
      "symbol",
      () => Object.assign(["security.execute"], { [Symbol("x")]: true }),
    ],
    ["array-like", () => ({ 0: "security.execute", length: 1 })],
  ])("rejects %s permission collections", (_name, create) => {
    expect(() =>
      createProtectedActionRequirementsResolution(requirement(create())),
    ).toThrow(InvalidAuthorizationEvidenceError);
  });

  it("normalizes hostile collection descriptor and index failures", () => {
    const descriptorHostile = new Proxy(["security.execute"], {
      getOwnPropertyDescriptor() {
        throw new Error("private");
      },
    });
    expect(() =>
      createProtectedActionRequirementsResolution(
        requirement(descriptorHostile),
      ),
    ).toThrow(InvalidAuthorizationEvidenceError);
    const throwingIndex = ["security.execute"];
    Object.defineProperty(throwingIndex, "0", {
      enumerable: true,
      get() {
        throw new Error("private");
      },
    });
    expect(() =>
      createProtectedActionRequirementsResolution(requirement(throwingIndex)),
    ).toThrow(InvalidAuthorizationEvidenceError);
  });

  it.each([
    ["sparse", () => new Array(1)],
    [
      "decorated",
      () => Object.assign([{ ...validGrant }], { decorated: true }),
    ],
    [
      "symbol",
      () => Object.assign([{ ...validGrant }], { [Symbol("x")]: true }),
    ],
    ["array-like", () => ({ 0: { ...validGrant }, length: 1 })],
  ])("rejects %s governed grant collections", (_name, create) => {
    expect(() => createPermissionGrantEvidence(evidence(create()))).toThrow(
      InvalidAuthorizationEvidenceError,
    );
  });

  it.each(["ownKeys", "getOwnPropertyDescriptor"] as const)(
    "normalizes hostile grant collection %s traps",
    (trap) => {
      const source = [{ ...validGrant }];
      const hostile = new Proxy(source, {
        [trap]() {
          throw new Error("private");
        },
      });
      expect(() => createPermissionGrantEvidence(evidence(hostile))).toThrow(
        InvalidAuthorizationEvidenceError,
      );
      expect(Object.isFrozen(source)).toBe(false);
    },
  );

  it("normalizes throwing and stateful governed grant indices with one read", () => {
    const throwing = [{ ...validGrant }];
    Object.defineProperty(throwing, "0", {
      enumerable: true,
      get() {
        throw new Error("private");
      },
    });
    expect(() => createPermissionGrantEvidence(evidence(throwing))).toThrow(
      InvalidAuthorizationEvidenceError,
    );

    let reads = 0;
    const stateful = [{ ...validGrant }];
    Object.defineProperty(stateful, "0", {
      enumerable: true,
      get() {
        reads += 1;
        return reads === 1 ? { ...validGrant } : null;
      },
    });
    expect(createPermissionGrantEvidence(evidence(stateful)).status).toBe(
      "available",
    );
    expect(reads).toBe(1);
    expect(Object.isFrozen(stateful)).toBe(false);
  });
});
