import { describe, expect, it } from "vitest";
import {
  InvalidAuthorizationEvidenceError,
  InvalidAuthorizationInputError,
} from "@orion/core";
import {
  ProcessLocalConfirmationAuthority,
  ProcessLocalGrantEvidenceAuthority,
  ProcessLocalRequirementsAuthority,
  ProcessLocalSecurityContextAuthority,
} from "../src/index.js";

const target = {
  operationId: "op-1",
  action: "skill.execute",
  resource: { kind: "unscoped" as const },
};
const subject = { kind: "anonymous" as const };

describe("M8 direct authority Contracts", () => {
  it("validates every direct request boundary", () => {
    const authorities: readonly [
      (value: unknown) => unknown,
      Readonly<Record<string, unknown>>,
    ][] = [
      [
        new ProcessLocalRequirementsAuthority(() => ({
          status: "unavailable",
          ...target,
        })).resolveProtectedActionRequirements.bind(
          new ProcessLocalRequirementsAuthority(() => ({
            status: "unavailable",
            ...target,
          })),
        ),
        { intent: "resolve-protected-action-requirements", ...target },
      ],
      [
        new ProcessLocalSecurityContextAuthority(() => ({
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
        { intent: "resolve-security-evaluation-context", ...target },
      ],
      [
        new ProcessLocalGrantEvidenceAuthority(() => ({
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
        {
          intent: "resolve-grant-evidence",
          ...target,
          subject,
          requiredPermissions: [],
        },
      ],
      [
        new ProcessLocalConfirmationAuthority(() => ({
          status: "absent",
        })).resolveConfirmationEvidence.bind(
          new ProcessLocalConfirmationAuthority(() => ({ status: "absent" })),
        ),
        { intent: "resolve-confirmation-evidence", ...target, subject },
      ],
    ] as const;
    for (const [invoke, valid] of authorities) {
      expect(() => invoke(null)).toThrow(InvalidAuthorizationInputError);
      expect(invoke(valid)).toBeDefined();
      expect(Object.isFrozen(valid)).toBe(false);
    }
  });

  it("rejects 65 governed requirements and grants", () => {
    const permission = (i: number) => `permission.item-${i}`;
    const requirements = new ProcessLocalRequirementsAuthority(() => ({
      status: "available",
      requirements: {
        ...target,
        requiredPermissions: Array.from({ length: 65 }, (_, i) =>
          permission(i),
        ),
        sensitivity: "standard",
      },
    }));
    expect(() =>
      requirements.resolveProtectedActionRequirements({
        intent: "resolve-protected-action-requirements",
        ...target,
      }),
    ).toThrow(InvalidAuthorizationEvidenceError);
    const grants = new ProcessLocalGrantEvidenceAuthority(() => ({
      status: "available",
      ...target,
      subject,
      evaluatedPermissions: [],
      grants: Array.from({ length: 65 }, (_, i) => ({
        subject,
        permission: permission(i),
        resource: target.resource,
      })),
    }));
    expect(() =>
      grants.resolveGrantEvidence({
        intent: "resolve-grant-evidence",
        ...target,
        subject,
        requiredPermissions: [],
      }),
    ).toThrow(InvalidAuthorizationEvidenceError);
  });
});
