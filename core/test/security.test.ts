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
} from "../src/index.js";

const anonymous = { kind: "anonymous" } as const;
const unscoped = { kind: "unscoped" } as const;

describe("M8 Core Security values", () => {
  it.each([
    ["operation", authorizationOperationIdentifier, "A", "x".repeat(129)],
    ["action", authorizationActionIdentifier, "skill.execute", "Skill.Execute"],
    ["resource", authorizationResourceIdentifier, "resource:/one", " space"],
  ])("validates %s identifiers exactly", (_name, factory, valid, invalid) => {
    expect(factory(valid)).toBe(valid);
    expect(() => factory(invalid)).toThrow(InvalidAuthorizationInputError);
    expect(() => factory({ toString: () => valid })).toThrow(
      InvalidAuthorizationInputError,
    );
  });

  it("enforces the exact Authorization Action Identifier bounds", () => {
    const minimum = "a.b";
    const maximum = `a.${"b".repeat(126)}`;
    expect(minimum).toHaveLength(3);
    expect(maximum).toHaveLength(128);
    expect(authorizationActionIdentifier(minimum)).toBe(minimum);
    expect(authorizationActionIdentifier(maximum)).toBe(maximum);
    for (const invalid of [
      "ab",
      `a.${"b".repeat(127)}`,
      "A.b",
      "a. b",
      "a.ｂ",
      { toString: () => "a.b" },
    ]) {
      expect(() => authorizationActionIdentifier(invalid)).toThrow(
        InvalidAuthorizationInputError,
      );
    }
  });

  it("reconstructs and freezes governed values", () => {
    const permissions = ["diagnostic.write", "diagnostic.read"];
    const requirements = createProtectedActionRequirementsResolution({
      status: "available",
      requirements: {
        operationId: "op-1",
        action: "skill.execute",
        resource: unscoped,
        requiredPermissions: permissions,
        sensitivity: "standard",
      },
    });
    expect(requirements.status).toBe("available");
    if (requirements.status === "available") {
      expect(requirements.requirements.requiredPermissions).toEqual([
        "diagnostic.read",
        "diagnostic.write",
      ]);
      expect(Object.isFrozen(requirements.requirements)).toBe(true);
      expect(
        Object.isFrozen(requirements.requirements.requiredPermissions),
      ).toBe(true);
    }
    expect(permissions).toEqual(["diagnostic.write", "diagnostic.read"]);
    expect(Object.isFrozen(permissions)).toBe(false);
  });

  it("enforces permission and grant bounds and duplicates", () => {
    const permission = (index: number) => `permission.item-${index}`;
    expect(() =>
      createProtectedActionRequirementsResolution({
        status: "available",
        requirements: {
          operationId: "op",
          action: "skill.execute",
          resource: unscoped,
          requiredPermissions: Array.from({ length: 65 }, (_, i) =>
            permission(i),
          ),
          sensitivity: "standard",
        },
      }),
    ).toThrow(InvalidAuthorizationEvidenceError);
    expect(() =>
      createProtectedActionRequirementsResolution({
        status: "available",
        requirements: {
          operationId: "op",
          action: "skill.execute",
          resource: unscoped,
          requiredPermissions: ["permission.read", "permission.read"],
          sensitivity: "standard",
        },
      }),
    ).toThrow(InvalidAuthorizationEvidenceError);
    expect(() =>
      createPermissionGrantEvidence({
        status: "available",
        operationId: "op",
        subject: anonymous,
        action: "skill.execute",
        resource: unscoped,
        evaluatedPermissions: [],
        grants: Array.from({ length: 65 }, (_, i) => ({
          subject: anonymous,
          permission: permission(i),
          resource: unscoped,
        })),
      }),
    ).toThrow(InvalidAuthorizationEvidenceError);
  });

  it("rejects hostile and decorated boundary objects without native leakage", () => {
    expect(() =>
      createSecurityEvaluationContext(
        new Proxy(
          {},
          {
            ownKeys() {
              throw new Error("secret");
            },
          },
        ),
      ),
    ).toThrow(InvalidAuthorizationEvidenceError);
    expect(() =>
      createConfirmationEvidence({ status: "absent", extra: true }),
    ).toThrow(InvalidAuthorizationEvidenceError);
  });

  it("rejects contradictory constructed artifacts", () => {
    expect(() =>
      createAuthorizationDecisionArtifact({
        operationId: "op",
        decision: "allow",
        subject: anonymous,
        action: "skill.execute",
        resource: unscoped,
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
        reason: "missing-required-permission",
        evidence: {
          grantEvidenceStatus: "available",
          confirmationStatus: "not-required",
        },
      }),
    ).toThrow(InvalidSecurityStateError);
  });
});
