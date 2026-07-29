import { afterEach, describe, expect, it, vi } from "vitest";
import type { MinimumAuthorizationPolicyResult } from "../src/security-policy.js";

type DecisionCase = {
  readonly name: string;
  readonly requirements:
    | { readonly status: "unavailable" }
    | {
        readonly status: "available";
        readonly permissions: readonly string[];
        readonly sensitivity: "standard" | "sensitive";
      };
  readonly contextUnavailable?: boolean;
  readonly grantsUnavailable?: boolean;
  readonly granted?: readonly string[];
  readonly confirmation?: "absent" | "confirmed";
};

const permission = "security.execute";
const rows: readonly DecisionCase[] = [
  { name: "requirements unavailable", requirements: { status: "unavailable" } },
  {
    name: "context unavailable",
    requirements: {
      status: "available",
      permissions: [permission],
      sensitivity: "standard",
    },
    contextUnavailable: true,
  },
  {
    name: "grants unavailable",
    requirements: {
      status: "available",
      permissions: [permission],
      sensitivity: "standard",
    },
    grantsUnavailable: true,
  },
  {
    name: "sensitive confirmation absent",
    requirements: {
      status: "available",
      permissions: [],
      sensitivity: "sensitive",
    },
    granted: [],
    confirmation: "absent",
  },
  {
    name: "standard grant missing",
    requirements: {
      status: "available",
      permissions: [permission],
      sensitivity: "standard",
    },
    granted: [],
  },
  {
    name: "sensitive grant missing",
    requirements: {
      status: "available",
      permissions: [permission],
      sensitivity: "sensitive",
    },
    granted: [],
    confirmation: "confirmed",
  },
  {
    name: "standard zero permission allow",
    requirements: {
      status: "available",
      permissions: [],
      sensitivity: "standard",
    },
    granted: [],
  },
  {
    name: "standard permission allow",
    requirements: {
      status: "available",
      permissions: [permission],
      sensitivity: "standard",
    },
    granted: [permission],
  },
  {
    name: "sensitive zero permission allow",
    requirements: {
      status: "available",
      permissions: [],
      sensitivity: "sensitive",
    },
    granted: [],
    confirmation: "confirmed",
  },
  {
    name: "sensitive permission allow",
    requirements: {
      status: "available",
      permissions: [permission],
      sensitivity: "sensitive",
    },
    granted: [permission],
    confirmation: "confirmed",
  },
];

const originalWeakMap = globalThis.WeakMap;

afterEach(() => {
  vi.doUnmock("@orion/core");
  vi.doUnmock("../src/security-policy.js");
  vi.resetModules();
  globalThis.WeakMap = originalWeakMap;
});

describe("Security atomic ten-row construction observability", () => {
  it.each(["legacy", "outcome"] as const)(
    "observes every reached and suppressed stage exactly for %s evaluation",
    async (contract) => {
      for (const row of rows) {
        vi.resetModules();
        const counts = {
          requirements: 0,
          context: 0,
          grants: 0,
          confirmation: 0,
          policy: 0,
          artifact: 0,
          summary: 0,
          outcome: 0,
          provenance: 0,
        };
        vi.doMock("@orion/core", async () => {
          const actual = (await vi.importActual("@orion/core")) as Record<
            string,
            unknown
          > & {
            createAuthorizationDecisionArtifact(value: unknown): unknown;
            createGovernedSecurityEvaluationSummary(value: unknown): unknown;
            createAuthorizationEvaluationOutcome(value: unknown): unknown;
          };
          return {
            ...actual,
            createAuthorizationDecisionArtifact(value: unknown) {
              counts.artifact += 1;
              return actual.createAuthorizationDecisionArtifact(value);
            },
            createGovernedSecurityEvaluationSummary(value: unknown) {
              counts.summary += 1;
              return actual.createGovernedSecurityEvaluationSummary(value);
            },
            createAuthorizationEvaluationOutcome(value: unknown) {
              counts.outcome += 1;
              return actual.createAuthorizationEvaluationOutcome(value);
            },
          };
        });
        vi.doMock("../src/security-policy.js", async () => {
          const actual = await vi.importActual<{
            evaluateMinimumAuthorizationPolicy(
              value: MinimumAuthorizationPolicyResult,
            ): MinimumAuthorizationPolicyResult;
          }>("../src/security-policy.js");
          return {
            ...actual,
            evaluateMinimumAuthorizationPolicy(
              value: MinimumAuthorizationPolicyResult,
            ) {
              counts.policy += 1;
              return actual.evaluateMinimumAuthorizationPolicy(value);
            },
          };
        });
        class CountingWeakMap<K extends WeakKey, V> extends originalWeakMap<
          K,
          V
        > {
          public override set(key: K, value: V): this {
            if (
              typeof value === "object" &&
              value !== null &&
              Object.hasOwn(value, "authorization") &&
              Object.hasOwn(value, "summary")
            )
              counts.provenance += 1;
            return super.set(key, value);
          }
        }
        globalThis.WeakMap = CountingWeakMap;
        const { SecurityEngine } = await import("../src/security-engine.js");
        const target = {
          operationId: `atomic-${contract}-${row.name.replaceAll(" ", "-")}`,
          action: "security.evaluate",
          resource: { kind: "unscoped" as const },
        };
        const subject = { kind: "anonymous" as const };
        const required =
          row.requirements.status === "available"
            ? row.requirements.permissions
            : [];
        const engine = new SecurityEngine({
          requirements: {
            resolveProtectedActionRequirements: () => {
              counts.requirements += 1;
              return row.requirements.status === "unavailable"
                ? ({ status: "unavailable", ...target } as never)
                : ({
                    status: "available",
                    requirements: {
                      ...target,
                      requiredPermissions: required,
                      sensitivity: row.requirements.sensitivity,
                    },
                  } as never);
            },
          },
          context: {
            resolveSecurityEvaluationContext: () => {
              counts.context += 1;
              return {
                operationId: target.operationId,
                subject,
                context: row.contextUnavailable ? "unavailable" : "available",
                device: "not-applicable",
                session: "not-applicable",
                trustLevel: "not-applicable",
              } as never;
            },
          },
          grants: {
            resolveGrantEvidence: () => {
              counts.grants += 1;
              return row.grantsUnavailable
                ? ({
                    status: "unavailable",
                    ...target,
                    subject,
                    evaluatedPermissions: required,
                  } as never)
                : ({
                    status: "available",
                    ...target,
                    subject,
                    evaluatedPermissions: required,
                    grants: (row.granted ?? []).map((granted) => ({
                      subject,
                      permission: granted,
                      resource: target.resource,
                    })),
                  } as never);
            },
          },
          confirmation: {
            resolveConfirmationEvidence: () => {
              counts.confirmation += 1;
              return row.confirmation === "confirmed"
                ? ({ status: "confirmed", ...target, subject } as never)
                : ({ status: "absent" } as never);
            },
          },
        });
        engine.initialize();
        engine.start();
        const result =
          contract === "legacy"
            ? engine.evaluateAuthorization({
                intent: "evaluate-authorization",
                ...target,
              })
            : engine.evaluateAuthorizationOutcome({
                intent: "evaluate-authorization-outcome",
                ...target,
              });
        expect(result).toBeDefined();
        const grantsReached =
          row.requirements.status === "available" && !row.contextUnavailable;
        const confirmationReached =
          grantsReached &&
          !row.grantsUnavailable &&
          row.requirements.status === "available" &&
          row.requirements.sensitivity === "sensitive";
        expect(counts, `${contract}: ${row.name}`).toEqual({
          requirements: 1,
          context: 1,
          grants: grantsReached ? 1 : 0,
          confirmation: confirmationReached ? 1 : 0,
          policy: 1,
          artifact: 1,
          summary: 1,
          outcome: 1,
          provenance: 1,
        });
      }
    },
  );
});
