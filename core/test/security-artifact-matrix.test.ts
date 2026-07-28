import { describe, expect, it } from "vitest";
import {
  InvalidSecurityStateError,
  createAuthorizationDecisionArtifact,
} from "../src/index.js";

const target = {
  operationId: "artifact-op",
  subject: { kind: "anonymous" as const },
  action: "security.evaluate",
  resource: { kind: "unscoped" as const },
};
const evaluable = {
  context: "available",
  device: "not-applicable",
  session: "not-applicable",
  trustLevel: "not-applicable",
} as const;
const unavailable = { ...evaluable, context: "unavailable" } as const;
const policy = {
  id: "orion.minimum-authorization",
  version: "1.0.0",
} as const;
const permission = ["security.execute"];
const rows = [
  {
    decision: "indeterminate",
    reason: "requirements-unavailable",
    requirementsStatus: "unavailable",
    evaluatedPermissions: [],
    sensitivity: "unavailable",
    securityContext: evaluable,
    evidence: {
      grantEvidenceStatus: "not-evaluated",
      confirmationStatus: "not-evaluated",
    },
  },
  {
    decision: "indeterminate",
    reason: "security-context-unavailable",
    requirementsStatus: "available",
    evaluatedPermissions: permission,
    sensitivity: "standard",
    securityContext: unavailable,
    evidence: {
      grantEvidenceStatus: "not-evaluated",
      confirmationStatus: "not-evaluated",
    },
  },
  {
    decision: "indeterminate",
    reason: "grant-evidence-unavailable",
    requirementsStatus: "available",
    evaluatedPermissions: permission,
    sensitivity: "standard",
    securityContext: evaluable,
    evidence: {
      grantEvidenceStatus: "unavailable",
      confirmationStatus: "not-evaluated",
    },
  },
  {
    decision: "deny",
    reason: "confirmation-required",
    requirementsStatus: "available",
    evaluatedPermissions: [],
    sensitivity: "sensitive",
    securityContext: evaluable,
    evidence: {
      grantEvidenceStatus: "available",
      confirmationStatus: "absent",
    },
  },
  {
    decision: "deny",
    reason: "missing-required-permission",
    requirementsStatus: "available",
    evaluatedPermissions: permission,
    sensitivity: "standard",
    securityContext: evaluable,
    evidence: {
      grantEvidenceStatus: "available",
      confirmationStatus: "not-required",
    },
  },
  {
    decision: "deny",
    reason: "missing-required-permission",
    requirementsStatus: "available",
    evaluatedPermissions: permission,
    sensitivity: "sensitive",
    securityContext: evaluable,
    evidence: {
      grantEvidenceStatus: "available",
      confirmationStatus: "confirmed",
    },
  },
  {
    decision: "allow",
    reason: "no-permission-required",
    requirementsStatus: "available",
    evaluatedPermissions: [],
    sensitivity: "standard",
    securityContext: evaluable,
    evidence: {
      grantEvidenceStatus: "available",
      confirmationStatus: "not-required",
    },
  },
  {
    decision: "allow",
    reason: "all-required-permissions-granted",
    requirementsStatus: "available",
    evaluatedPermissions: permission,
    sensitivity: "standard",
    securityContext: evaluable,
    evidence: {
      grantEvidenceStatus: "available",
      confirmationStatus: "not-required",
    },
  },
  {
    decision: "allow",
    reason: "confirmation-and-permissions-satisfied",
    requirementsStatus: "available",
    evaluatedPermissions: [],
    sensitivity: "sensitive",
    securityContext: evaluable,
    evidence: {
      grantEvidenceStatus: "available",
      confirmationStatus: "confirmed",
    },
  },
  {
    decision: "allow",
    reason: "confirmation-and-permissions-satisfied",
    requirementsStatus: "available",
    evaluatedPermissions: permission,
    sensitivity: "sensitive",
    securityContext: evaluable,
    evidence: {
      grantEvidenceStatus: "available",
      confirmationStatus: "confirmed",
    },
  },
] as const;

const complete = (row: (typeof rows)[number]) => ({
  ...target,
  ...row,
  policy,
});

describe("M8 Authorization Decision Artifact output table", () => {
  it.each(rows.map((row, index) => [index + 1, row] as const))(
    "accepts complete normative row %i",
    (_index, row) => {
      const expected = complete(row);
      expect(createAuthorizationDecisionArtifact(expected)).toEqual(expected);
    },
  );

  it.each(["context", "device", "session", "trustLevel"] as const)(
    "rejects ALLOW with unavailable %s",
    (dimension) => {
      const candidate = complete(rows[6]);
      expect(() =>
        createAuthorizationDecisionArtifact({
          ...candidate,
          securityContext: {
            ...candidate.securityContext,
            [dimension]: "unavailable",
          },
        }),
      ).toThrow(InvalidSecurityStateError);
    },
  );

  it.each([
    ["decision/reason", { decision: "allow", reason: "confirmation-required" }],
    ["requirements", { requirementsStatus: "unavailable" }],
    [
      "grant status",
      {
        evidence: {
          grantEvidenceStatus: "unavailable",
          confirmationStatus: "not-required",
        },
      },
    ],
    [
      "confirmation",
      {
        evidence: {
          grantEvidenceStatus: "available",
          confirmationStatus: "confirmed",
        },
      },
    ],
    ["sensitivity", { sensitivity: "sensitive" }],
    ["permissions", { evaluatedPermissions: permission }],
  ])("rejects contradictory %s cross-product", (_name, change) => {
    expect(() =>
      createAuthorizationDecisionArtifact({ ...complete(rows[6]), ...change }),
    ).toThrow(InvalidSecurityStateError);
  });

  it("deeply freezes valid artifacts without freezing caller graphs", () => {
    const candidate = complete(rows[9]);
    const artifact = createAuthorizationDecisionArtifact(candidate);
    expect(Object.isFrozen(artifact)).toBe(true);
    expect(Object.isFrozen(artifact.securityContext)).toBe(true);
    expect(Object.isFrozen(artifact.evidence)).toBe(true);
    expect(Object.isFrozen(artifact.evaluatedPermissions)).toBe(true);
    expect(Object.isFrozen(candidate)).toBe(false);
    expect(Object.isFrozen(candidate.evaluatedPermissions)).toBe(false);
  });
});
