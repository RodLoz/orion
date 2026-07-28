import { describe, expect, it } from "vitest";
import {
  InvalidAuthorizationEvidenceError,
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
  operationId: "authority-op",
  action: "security.evaluate",
  resource: { kind: "unscoped" as const },
};
const anonymous = { kind: "anonymous" as const };
const authenticated = {
  kind: "authenticated" as const,
  identityId: "user.one",
};
const requirementsRequest = {
  intent: "resolve-protected-action-requirements",
  ...target,
};
const grantRequest = (requiredPermissions: string[] = []) => ({
  intent: "resolve-grant-evidence",
  ...target,
  subject: anonymous,
  requiredPermissions,
});

describe("M8 direct authority output matrices", () => {
  it.each([0, 1, 64])(
    "accepts Requirements output with %i permissions",
    (count) => {
      const permissions = Array.from(
        { length: count },
        (_, index) => `permission.item${index}`,
      ).reverse();
      const source = {
        status: "available",
        requirements: {
          ...target,
          requiredPermissions: permissions,
          sensitivity: count % 2 === 0 ? "standard" : "sensitive",
        },
      };
      const authority = new ProcessLocalRequirementsAuthority(() => source);
      const result =
        authority.resolveProtectedActionRequirements(requirementsRequest);
      expect(result.status).toBe("available");
      if (result.status === "available") {
        expect(result.requirements.requiredPermissions).toEqual(
          [...permissions].sort(),
        );
      }
      expect(Object.isFrozen(source)).toBe(false);
      expect(Object.isFrozen(permissions)).toBe(false);
    },
  );

  it.each(["operationId", "action", "resource"] as const)(
    "rejects Requirements %s mismatch",
    (field) => {
      const mismatches = {
        operationId: "wrong-op",
        action: "security.other",
        resource: { kind: "identified", resourceId: "wrong" },
      };
      const authority = new ProcessLocalRequirementsAuthority(() => ({
        status: "unavailable",
        ...target,
        [field]: mismatches[field],
      }));
      expect(() =>
        authority.resolveProtectedActionRequirements(requirementsRequest),
      ).toThrow(InvalidAuthorizationEvidenceError);
    },
  );

  it.each([0, 1, 64])("accepts Grant Evidence with %i grants", (count) => {
    const permissions = Array.from(
      { length: count },
      (_, index) => `permission.item${index}`,
    );
    const source = {
      status: "available",
      ...target,
      subject: anonymous,
      evaluatedPermissions: permissions,
      grants: [...permissions].reverse().map((permission) => ({
        subject: anonymous,
        permission,
        resource: target.resource,
      })),
    };
    const authority = new ProcessLocalGrantEvidenceAuthority(() => source);
    const result = authority.resolveGrantEvidence(grantRequest(permissions));
    expect(result.status).toBe("available");
    if (result.status === "available") {
      expect(result.grants.map((grant) => grant.permission)).toEqual(
        [...permissions].sort(),
      );
    }
    expect(Object.isFrozen(source)).toBe(false);
    expect(Object.isFrozen(source.grants)).toBe(false);
  });

  it.each(["partial", "stale", "unverifiable", "unavailable"])(
    "maps %s Grant Evidence to the governed unavailable state",
    () => {
      const source = {
        status: "unavailable",
        ...target,
        subject: anonymous,
        evaluatedPermissions: ["permission.read"],
      };
      const authority = new ProcessLocalGrantEvidenceAuthority(() => source);
      expect(
        authority.resolveGrantEvidence(grantRequest(["permission.read"])),
      ).toEqual(source);
      expect(Object.isFrozen(source)).toBe(false);
    },
  );

  it.each(["operationId", "action", "subject", "resource"] as const)(
    "rejects Grant Evidence wrong %s",
    (field) => {
      const mismatch = {
        operationId: "wrong-op",
        action: "security.other",
        subject: authenticated,
        resource: { kind: "identified", resourceId: "wrong" },
      };
      const authority = new ProcessLocalGrantEvidenceAuthority(() => ({
        status: "available",
        ...target,
        subject: anonymous,
        evaluatedPermissions: [],
        grants: [],
        [field]: mismatch[field],
      }));
      expect(() => authority.resolveGrantEvidence(grantRequest())).toThrow(
        InvalidAuthorizationEvidenceError,
      );
    },
  );

  it.each([anonymous, authenticated])(
    "accepts governed Context subject %#",
    (subject) => {
      const authority = new ProcessLocalSecurityContextAuthority(() => ({
        operationId: target.operationId,
        subject,
        context: "available",
        device: "unavailable",
        session: "not-applicable",
        trustLevel: "available",
      }));
      expect(
        authority.resolveSecurityEvaluationContext({
          intent: "resolve-security-evaluation-context",
          ...target,
        }),
      ).toEqual({
        operationId: target.operationId,
        subject,
        context: "available",
        device: "unavailable",
        session: "not-applicable",
        trustLevel: "available",
      });
    },
  );

  it.each(["available", "unavailable", "not-applicable"] as const)(
    "accepts every governed Context dimension status %s",
    (status) => {
      const authority = new ProcessLocalSecurityContextAuthority(() => ({
        operationId: target.operationId,
        subject: anonymous,
        context: status,
        device: status,
        session: status,
        trustLevel: status,
      }));
      expect(
        authority.resolveSecurityEvaluationContext({
          intent: "resolve-security-evaluation-context",
          ...target,
        }).context,
      ).toBe(status);
    },
  );

  it.each(
    (["context", "device", "session", "trustLevel"] as const).flatMap(
      (dimension) =>
        (["available", "unavailable", "not-applicable"] as const).map(
          (status) => [dimension, status] as const,
        ),
    ),
  )("preserves governed %s status %s exactly", (dimension, status) => {
    const candidate = {
      operationId: target.operationId,
      subject: anonymous,
      context: "available",
      device: "available",
      session: "available",
      trustLevel: "available",
      [dimension]: status,
    };
    const result = new ProcessLocalSecurityContextAuthority(
      () => candidate,
    ).resolveSecurityEvaluationContext({
      intent: "resolve-security-evaluation-context",
      ...target,
    });
    expect(result[dimension]).toBe(status);
    expect(candidate[dimension]).toBe(status);
    expect(Object.isFrozen(candidate)).toBe(false);
  });

  it("rejects malformed Context and admits absent/confirmed Confirmation", () => {
    const context = new ProcessLocalSecurityContextAuthority(() => ({
      operationId: target.operationId,
      subject: anonymous,
      context: "fabricated",
      device: "available",
      session: "available",
      trustLevel: "available",
    }));
    expect(() =>
      context.resolveSecurityEvaluationContext({
        intent: "resolve-security-evaluation-context",
        ...target,
      }),
    ).toThrow(InvalidAuthorizationEvidenceError);
    const absent = new ProcessLocalConfirmationAuthority(() => ({
      status: "absent",
    }));
    expect(
      absent.resolveConfirmationEvidence({
        intent: "resolve-confirmation-evidence",
        ...target,
        subject: anonymous,
      }),
    ).toEqual({ status: "absent" });
    const confirmed = new ProcessLocalConfirmationAuthority(() => ({
      status: "confirmed",
      ...target,
      subject: anonymous,
    }));
    expect(
      confirmed.resolveConfirmationEvidence({
        intent: "resolve-confirmation-evidence",
        ...target,
        subject: anonymous,
      }),
    ).toEqual({ status: "confirmed", ...target, subject: anonymous });
  });

  it("rejects Context operation mismatch", () => {
    const authority = new ProcessLocalSecurityContextAuthority(() => ({
      operationId: "wrong-op",
      subject: anonymous,
      context: "available",
      device: "available",
      session: "available",
      trustLevel: "available",
    }));
    expect(() =>
      authority.resolveSecurityEvaluationContext({
        intent: "resolve-security-evaluation-context",
        ...target,
      }),
    ).toThrow(InvalidAuthorizationEvidenceError);
  });

  it.each(["ownKeys", "getOwnPropertyDescriptor"] as const)(
    "normalizes hostile Context candidate %s traps",
    (trap) => {
      const source = {
        operationId: target.operationId,
        subject: anonymous,
        context: "available",
        device: "not-applicable",
        session: "not-applicable",
        trustLevel: "not-applicable",
      };
      const candidate = new Proxy(source, {
        [trap]() {
          throw new Error("private");
        },
      });
      const authority = new ProcessLocalSecurityContextAuthority(
        () => candidate,
      );
      expect(() =>
        authority.resolveSecurityEvaluationContext({
          intent: "resolve-security-evaluation-context",
          ...target,
        }),
      ).toThrow(InvalidAuthorizationEvidenceError);
      expect(Object.isFrozen(source)).toBe(false);
    },
  );

  it("single-reads Context fields and normalizes hostile Context shapes", () => {
    const source = {
      operationId: target.operationId,
      subject: anonymous,
      context: "available",
      device: "not-applicable",
      session: "not-applicable",
      trustLevel: "not-applicable",
    };
    let reads = 0;
    const stateful = { ...source };
    Object.defineProperty(stateful, "context", {
      enumerable: true,
      get() {
        reads += 1;
        return reads === 1 ? "available" : "fabricated";
      },
    });
    expect(
      new ProcessLocalSecurityContextAuthority(
        () => stateful,
      ).resolveSecurityEvaluationContext({
        intent: "resolve-security-evaluation-context",
        ...target,
      }).context,
    ).toBe("available");
    expect(reads).toBe(1);
    const throwing = { ...source };
    Object.defineProperty(throwing, "device", {
      enumerable: true,
      get() {
        throw new Error("private");
      },
    });
    for (const candidate of [
      throwing,
      { ...source, context: { toString: () => "available" } },
      { ...source, [Symbol("extra")]: true },
    ]) {
      expect(() =>
        new ProcessLocalSecurityContextAuthority(
          () => candidate,
        ).resolveSecurityEvaluationContext({
          intent: "resolve-security-evaluation-context",
          ...target,
        }),
      ).toThrow(InvalidAuthorizationEvidenceError);
    }
    expect(Object.isFrozen(source)).toBe(false);
  });

  it.each(["operationId", "action", "subject", "resource"] as const)(
    "rejects Confirmation wrong %s",
    (field) => {
      const mismatch = {
        operationId: "wrong-op",
        action: "security.other",
        subject: authenticated,
        resource: { kind: "identified", resourceId: "wrong" },
      };
      const authority = new ProcessLocalConfirmationAuthority(() => ({
        status: "confirmed",
        ...target,
        subject: anonymous,
        [field]: mismatch[field],
      }));
      expect(() =>
        authority.resolveConfirmationEvidence({
          intent: "resolve-confirmation-evidence",
          ...target,
          subject: anonymous,
        }),
      ).toThrow(InvalidAuthorizationEvidenceError);
    },
  );

  it.each(["ownKeys", "getOwnPropertyDescriptor"] as const)(
    "normalizes hostile Confirmation candidate %s traps",
    (trap) => {
      const source = { status: "confirmed", ...target, subject: anonymous };
      const candidate = new Proxy(source, {
        [trap]() {
          throw new Error("private");
        },
      });
      expect(() =>
        new ProcessLocalConfirmationAuthority(
          () => candidate,
        ).resolveConfirmationEvidence({
          intent: "resolve-confirmation-evidence",
          ...target,
          subject: anonymous,
        }),
      ).toThrow(InvalidAuthorizationEvidenceError);
      expect(Object.isFrozen(source)).toBe(false);
    },
  );

  it("single-reads Confirmation fields and rejects hostile candidates", () => {
    const source = { status: "confirmed", ...target, subject: anonymous };
    let reads = 0;
    const stateful = { ...source };
    Object.defineProperty(stateful, "status", {
      enumerable: true,
      get() {
        reads += 1;
        return reads === 1 ? "confirmed" : "absent";
      },
    });
    expect(
      new ProcessLocalConfirmationAuthority(
        () => stateful,
      ).resolveConfirmationEvidence({
        intent: "resolve-confirmation-evidence",
        ...target,
        subject: anonymous,
      }).status,
    ).toBe("confirmed");
    expect(reads).toBe(1);
    const throwing = { ...source };
    Object.defineProperty(throwing, "action", {
      enumerable: true,
      get() {
        throw new Error("private");
      },
    });
    for (const candidate of [
      throwing,
      { ...source, action: { toString: () => target.action } },
      { ...source, [Symbol("extra")]: true },
      { status: "confirmed" },
    ]) {
      expect(() =>
        new ProcessLocalConfirmationAuthority(
          () => candidate,
        ).resolveConfirmationEvidence({
          intent: "resolve-confirmation-evidence",
          ...target,
          subject: anonymous,
        }),
      ).toThrow(InvalidAuthorizationEvidenceError);
    }
    expect(Object.isFrozen(source)).toBe(false);
  });

  it.each([
    new Error("private-native"),
    new InvalidAuthorizationInputError(),
    new InvalidAuthorizationEvidenceError(),
    new InvalidSecurityStateError(),
    "private-primitive",
  ])("normalizes every collaborator throw %# to Security state", (thrown) => {
    const authorities = [
      () =>
        new ProcessLocalRequirementsAuthority(() => {
          throw thrown;
        }).resolveProtectedActionRequirements(requirementsRequest),
      () =>
        new ProcessLocalSecurityContextAuthority(() => {
          throw thrown;
        }).resolveSecurityEvaluationContext({
          intent: "resolve-security-evaluation-context",
          ...target,
        }),
      () =>
        new ProcessLocalGrantEvidenceAuthority(() => {
          throw thrown;
        }).resolveGrantEvidence(grantRequest()),
      () =>
        new ProcessLocalConfirmationAuthority(() => {
          throw thrown;
        }).resolveConfirmationEvidence({
          intent: "resolve-confirmation-evidence",
          ...target,
          subject: anonymous,
        }),
    ];
    for (const invoke of authorities) {
      expect(invoke).toThrow(InvalidSecurityStateError);
      try {
        invoke();
      } catch (error) {
        expect((error as Error).message).not.toContain("private");
      }
    }
  });

  it("maps returned malformed candidates to evidence failure", () => {
    expect(() =>
      new ProcessLocalRequirementsAuthority(() => ({
        status: "fabricated",
      })).resolveProtectedActionRequirements(requirementsRequest),
    ).toThrow(InvalidAuthorizationEvidenceError);
  });
});
