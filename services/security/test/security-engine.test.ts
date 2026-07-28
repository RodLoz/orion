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
  SecurityEngine,
} from "../src/index.js";

const subject = { kind: "anonymous" as const };
const target = {
  operationId: "op-1",
  action: "skill.execute",
  resource: { kind: "unscoped" as const },
};
function engine(
  options: {
    requirements?: unknown;
    context?: unknown;
    grants?: unknown;
    confirmation?: unknown;
  } = {},
) {
  const instance = new SecurityEngine({
    requirements: new ProcessLocalRequirementsAuthority(
      () =>
        options.requirements ?? {
          status: "available",
          requirements: {
            ...target,
            requiredPermissions: [],
            sensitivity: "standard",
          },
        },
    ),
    context: new ProcessLocalSecurityContextAuthority(
      () =>
        options.context ?? {
          operationId: target.operationId,
          subject,
          context: "available",
          device: "not-applicable",
          session: "not-applicable",
          trustLevel: "not-applicable",
        },
    ),
    grants: new ProcessLocalGrantEvidenceAuthority(
      () =>
        options.grants ?? {
          status: "available",
          ...target,
          subject,
          evaluatedPermissions: [],
          grants: [],
        },
    ),
    confirmation: new ProcessLocalConfirmationAuthority(
      () => options.confirmation ?? { status: "absent" },
    ),
  });
  instance.initialize();
  instance.start();
  return instance;
}
const request = { intent: "evaluate-authorization", ...target };

describe("M8 Security Engine", () => {
  it("produces the complete standard zero-permission allow artifact", () => {
    expect(engine().evaluateAuthorization(request)).toEqual({
      operationId: "op-1",
      decision: "allow",
      subject,
      action: "skill.execute",
      resource: { kind: "unscoped" },
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
  });

  it.each([
    [
      "requirements",
      { requirements: { status: "unavailable", ...target } },
      "requirements-unavailable",
    ],
    [
      "context",
      {
        context: {
          operationId: "op-1",
          subject,
          context: "unavailable",
          device: "not-applicable",
          session: "not-applicable",
          trustLevel: "not-applicable",
        },
      },
      "security-context-unavailable",
    ],
    [
      "grants",
      {
        grants: {
          status: "unavailable",
          ...target,
          subject,
          evaluatedPermissions: [],
        },
      },
      "grant-evidence-unavailable",
    ],
  ])("returns indeterminate for unavailable %s", (_name, options, reason) => {
    const result = engine(options).evaluateAuthorization(request);
    expect(result.decision).toBe("indeterminate");
    expect(result.reason).toBe(reason);
  });

  it("denies missing grants and missing sensitive confirmation", () => {
    const protectedRequirements = {
      status: "available",
      requirements: {
        ...target,
        requiredPermissions: ["skill.execute"],
        sensitivity: "standard",
      },
    };
    const grantEvidence = {
      status: "available",
      ...target,
      subject,
      evaluatedPermissions: ["skill.execute"],
      grants: [],
    };
    expect(
      engine({
        requirements: protectedRequirements,
        grants: grantEvidence,
      }).evaluateAuthorization(request).reason,
    ).toBe("missing-required-permission");
    expect(
      engine({
        requirements: {
          ...protectedRequirements,
          requirements: {
            ...protectedRequirements.requirements,
            requiredPermissions: [],
            sensitivity: "sensitive",
          },
        },
      }).evaluateAuthorization(request).reason,
    ).toBe("confirmation-required");
  });

  it("allows exact sensitive confirmation and exact permission grants", () => {
    const permission = "skill.execute";
    const result = engine({
      requirements: {
        status: "available",
        requirements: {
          ...target,
          requiredPermissions: [permission],
          sensitivity: "sensitive",
        },
      },
      grants: {
        status: "available",
        ...target,
        subject,
        evaluatedPermissions: [permission],
        grants: [{ subject, permission, resource: target.resource }],
      },
      confirmation: { status: "confirmed", ...target, subject },
    }).evaluateAuthorization(request);
    expect(result.decision).toBe("allow");
    expect(result.reason).toBe("confirmation-and-permissions-satisfied");
  });

  it("rejects confirmed evidence for a standard action", () => {
    expect(() =>
      engine({
        confirmation: { status: "confirmed", ...target, subject },
      }).evaluateAuthorization(request),
    ).toThrow(InvalidAuthorizationEvidenceError);
  });

  it("enforces lifecycle, exact input, and evidence correspondence", () => {
    const stopped = engine();
    stopped.stop();
    expect(() => stopped.evaluateAuthorization(request)).toThrow(
      InvalidSecurityStateError,
    );
    expect(() =>
      engine().evaluateAuthorization({ ...request, extra: true }),
    ).toThrow(InvalidAuthorizationInputError);
    expect(() =>
      engine({
        requirements: {
          status: "unavailable",
          ...target,
          operationId: "wrong",
        },
      }).evaluateAuthorization(request),
    ).toThrow(InvalidSecurityStateError);
  });

  it("does not inspect hostile requests before lifecycle state", () => {
    let reads = 0;
    const hostile = new Proxy(
      {},
      {
        ownKeys() {
          reads += 1;
          throw new Error();
        },
      },
    );
    const instance = engine();
    instance.stop();
    expect(() => instance.evaluateAuthorization(hostile)).toThrow(
      InvalidSecurityStateError,
    );
    expect(reads).toBe(0);
  });
});
