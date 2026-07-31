import type { CandidatePlan, ReasoningOutcome } from "@orion/core";

interface PlanningAuthorityFaultControl {
  corruptPrimitive(replacement: string): void;
  corruptNestedIdentity(replacement: object): void;
  replaceReasoning(replacement: ReasoningOutcome): void;
  invalidateVerifierState(): void;
  restore(): void;
}

const CONTROLS = new WeakMap<object, PlanningAuthorityFaultControl>();

export function bindRegisteredPlanningAuthorityFaultControl(
  candidate: CandidatePlan,
  control: PlanningAuthorityFaultControl,
): void {
  CONTROLS.set(candidate, control);
}

export function corruptRegisteredPlanningPrimitive(
  candidate: CandidatePlan,
  replacement: string,
): void {
  requireControl(candidate).corruptPrimitive(replacement);
}

export function corruptRegisteredPlanningNestedIdentity(
  candidate: CandidatePlan,
  replacement: object,
): void {
  requireControl(candidate).corruptNestedIdentity(replacement);
}

export function replaceRegisteredPlanningReasoning(
  candidate: CandidatePlan,
  replacement: ReasoningOutcome,
): void {
  requireControl(candidate).replaceReasoning(replacement);
}

export function restoreRegisteredPlanningCorrespondence(
  candidate: CandidatePlan,
): void {
  requireControl(candidate).restore();
}

export function invalidateRegisteredPlanningVerifierState(
  candidate: CandidatePlan,
): void {
  requireControl(candidate).invalidateVerifierState();
}

function requireControl(
  candidate: CandidatePlan,
): PlanningAuthorityFaultControl {
  const control = CONTROLS.get(candidate);
  if (control === undefined) {
    throw new Error("Planning candidate was not registered by its issuer.");
  }
  return control;
}
