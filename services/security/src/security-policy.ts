import type {
  AuthorizationDecision,
  AuthorizationDecisionReason,
  SkillPermissionIdentifier,
} from "@orion/core";

export interface MinimumAuthorizationPolicyResult {
  readonly decision: AuthorizationDecision;
  readonly reason: AuthorizationDecisionReason;
  readonly requirementsStatus: "available" | "unavailable";
  readonly permissions: readonly SkillPermissionIdentifier[];
  readonly sensitivity: "standard" | "sensitive" | "unavailable";
  readonly grant: "available" | "unavailable" | "not-evaluated";
  readonly confirmation:
    "not-evaluated" | "not-required" | "absent" | "confirmed";
}

/**
 * The single internal boundary at which the minimum authorization policy's
 * decision row becomes final. This module is intentionally absent from the
 * package's public exports.
 */
export function evaluateMinimumAuthorizationPolicy(
  result: MinimumAuthorizationPolicyResult,
): MinimumAuthorizationPolicyResult {
  return result;
}
