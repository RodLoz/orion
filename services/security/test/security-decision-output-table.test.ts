import { describe, expect, it } from "vitest";
import { SecurityEngine } from "../src/index.js";

const target = {
  operationId: "decision-op",
  action: "security.evaluate",
  resource: { kind: "unscoped" as const },
};
const subject = { kind: "anonymous" as const };
const evaluable = {
  context: "available",
  device: "not-applicable",
  session: "not-applicable",
  trustLevel: "not-applicable",
} as const;
const permission = "security.execute";
type Case = {
  readonly name: string;
  readonly requirements:
    | { readonly status: "unavailable" }
    | {
        readonly status: "available";
        readonly permissions: readonly string[];
        readonly sensitivity: "standard" | "sensitive";
      };
  readonly context?:
    | typeof evaluable
    | Readonly<{
        context: "unavailable";
        device: "not-applicable";
        session: "not-applicable";
        trustLevel: "not-applicable";
      }>;
  readonly grants?: "unavailable" | readonly string[];
  readonly confirmation?: "absent" | "confirmed";
  readonly decision: "allow" | "deny" | "indeterminate";
  readonly reason:
    | "requirements-unavailable"
    | "security-context-unavailable"
    | "grant-evidence-unavailable"
    | "confirmation-required"
    | "missing-required-permission"
    | "no-permission-required"
    | "all-required-permissions-granted"
    | "confirmation-and-permissions-satisfied";
  readonly grantStatus: "available" | "unavailable" | "not-evaluated";
  readonly confirmationStatus:
    "not-evaluated" | "not-required" | "absent" | "confirmed";
};
const cases: readonly Case[] = [
  {
    name: "requirements unavailable",
    requirements: { status: "unavailable" },
    decision: "indeterminate",
    reason: "requirements-unavailable",
    grantStatus: "not-evaluated",
    confirmationStatus: "not-evaluated",
  },
  {
    name: "context unavailable",
    requirements: {
      status: "available",
      permissions: [permission],
      sensitivity: "standard",
    },
    context: {
      context: "unavailable",
      device: "not-applicable",
      session: "not-applicable",
      trustLevel: "not-applicable",
    },
    decision: "indeterminate",
    reason: "security-context-unavailable",
    grantStatus: "not-evaluated",
    confirmationStatus: "not-evaluated",
  },
  {
    name: "grants unavailable",
    requirements: {
      status: "available",
      permissions: [permission],
      sensitivity: "standard",
    },
    grants: "unavailable",
    decision: "indeterminate",
    reason: "grant-evidence-unavailable",
    grantStatus: "unavailable",
    confirmationStatus: "not-evaluated",
  },
  {
    name: "sensitive confirmation absent",
    requirements: {
      status: "available",
      permissions: [],
      sensitivity: "sensitive",
    },
    confirmation: "absent",
    decision: "deny",
    reason: "confirmation-required",
    grantStatus: "available",
    confirmationStatus: "absent",
  },
  {
    name: "standard grant missing",
    requirements: {
      status: "available",
      permissions: [permission],
      sensitivity: "standard",
    },
    grants: [],
    decision: "deny",
    reason: "missing-required-permission",
    grantStatus: "available",
    confirmationStatus: "not-required",
  },
  {
    name: "sensitive grant missing",
    requirements: {
      status: "available",
      permissions: [permission],
      sensitivity: "sensitive",
    },
    grants: [],
    confirmation: "confirmed",
    decision: "deny",
    reason: "missing-required-permission",
    grantStatus: "available",
    confirmationStatus: "confirmed",
  },
  {
    name: "standard zero permission allow",
    requirements: {
      status: "available",
      permissions: [],
      sensitivity: "standard",
    },
    grants: [],
    decision: "allow",
    reason: "no-permission-required",
    grantStatus: "available",
    confirmationStatus: "not-required",
  },
  {
    name: "standard permission allow",
    requirements: {
      status: "available",
      permissions: [permission],
      sensitivity: "standard",
    },
    grants: [permission],
    decision: "allow",
    reason: "all-required-permissions-granted",
    grantStatus: "available",
    confirmationStatus: "not-required",
  },
  {
    name: "sensitive zero permission allow",
    requirements: {
      status: "available",
      permissions: [],
      sensitivity: "sensitive",
    },
    grants: [],
    confirmation: "confirmed",
    decision: "allow",
    reason: "confirmation-and-permissions-satisfied",
    grantStatus: "available",
    confirmationStatus: "confirmed",
  },
  {
    name: "sensitive permission allow",
    requirements: {
      status: "available",
      permissions: [permission],
      sensitivity: "sensitive",
    },
    grants: [permission],
    confirmation: "confirmed",
    decision: "allow",
    reason: "confirmation-and-permissions-satisfied",
    grantStatus: "available",
    confirmationStatus: "confirmed",
  },
];

type Counts = {
  requirements: number;
  context: number;
  grants: number;
  confirmation: number;
};
function configuredEngine(entry: Case, counts?: Counts) {
  const requiredPermissions =
    entry.requirements.status === "available"
      ? entry.requirements.permissions
      : [];
  const engine = new SecurityEngine({
    requirements: {
      resolveProtectedActionRequirements: () => {
        if (counts) counts.requirements += 1;
        return entry.requirements.status === "unavailable"
          ? ({ status: "unavailable", ...target } as never)
          : ({
              status: "available",
              requirements: {
                ...target,
                requiredPermissions,
                sensitivity: entry.requirements.sensitivity,
              },
            } as never);
      },
    },
    context: {
      resolveSecurityEvaluationContext: () => {
        if (counts) counts.context += 1;
        return {
          operationId: target.operationId,
          subject,
          ...(entry.context ?? evaluable),
        } as never;
      },
    },
    grants: {
      resolveGrantEvidence: () => {
        if (counts) counts.grants += 1;
        return entry.grants === "unavailable"
          ? ({
              status: "unavailable",
              ...target,
              subject,
              evaluatedPermissions: requiredPermissions,
            } as never)
          : ({
              status: "available",
              ...target,
              subject,
              evaluatedPermissions: requiredPermissions,
              grants: (entry.grants ?? []).map((granted) => ({
                subject,
                permission: granted,
                resource: target.resource,
              })),
            } as never);
      },
    },
    confirmation: {
      resolveConfirmationEvidence: () => {
        if (counts) counts.confirmation += 1;
        return entry.confirmation === "confirmed"
          ? ({ status: "confirmed", ...target, subject } as never)
          : ({ status: "absent" } as never);
      },
    },
  });
  engine.initialize();
  engine.start();
  return engine;
}
function evaluate(entry: Case) {
  return configuredEngine(entry).evaluateAuthorization({
    intent: "evaluate-authorization",
    ...target,
  });
}
function evaluateOutcome(entry: Case) {
  const engine = configuredEngine(entry);
  const outcome = engine.evaluateAuthorizationOutcome({
    intent: "evaluate-authorization-outcome",
    ...target,
  });
  expect(
    engine.verifyAuthorizationEvaluationOutcome({
      intent: "verify-authorization-evaluation-outcome",
      outcome,
      operationId: target.operationId,
    }),
  ).toBe(true);
  expect(outcome.securityEvaluationSummary).toEqual({
    operationId: target.operationId,
    subject,
    securityContext: entry.context ?? evaluable,
  });
  return outcome.authorization;
}
function exactCounts(entry: Case, outcome: boolean): Counts {
  const counts: Counts = {
    requirements: 0,
    context: 0,
    grants: 0,
    confirmation: 0,
  };
  const engine = configuredEngine(entry, counts);
  if (outcome)
    engine.evaluateAuthorizationOutcome({
      intent: "evaluate-authorization-outcome",
      ...target,
    });
  else
    engine.evaluateAuthorization({
      intent: "evaluate-authorization",
      ...target,
    });
  return counts;
}

describe("M8 complete Engine output-invariant table", () => {
  it.each(cases)("$name", (entry) => {
    const requiredPermissions =
      entry.requirements.status === "available"
        ? entry.requirements.permissions
        : [];
    const sensitivity =
      entry.requirements.status === "available"
        ? entry.requirements.sensitivity
        : "unavailable";
    const expected = {
      ...target,
      decision: entry.decision,
      subject,
      requirementsStatus: entry.requirements.status,
      evaluatedPermissions: requiredPermissions,
      sensitivity,
      securityContext: entry.context ?? evaluable,
      policy: {
        id: "orion.minimum-authorization",
        version: "1.0.0",
      },
      reason: entry.reason,
      evidence: {
        grantEvidenceStatus: entry.grantStatus,
        confirmationStatus: entry.confirmationStatus,
      },
    };
    expect(evaluate(entry)).toEqual(expected);
    expect(evaluateOutcome(entry)).toEqual(expected);
    const grantsReached =
      entry.requirements.status === "available" &&
      entry.context?.context !== "unavailable";
    const confirmationReached =
      grantsReached &&
      entry.grants !== "unavailable" &&
      entry.requirements.status === "available" &&
      entry.requirements.sensitivity === "sensitive";
    const expectedCounts = {
      requirements: 1,
      context: 1,
      grants: grantsReached ? 1 : 0,
      confirmation: confirmationReached ? 1 : 0,
    };
    expect(exactCounts(entry, false)).toEqual(expectedCounts);
    expect(exactCounts(entry, true)).toEqual(expectedCounts);
  });
});
