import type { ActiveContextRevision, ReasoningOutcome } from "@orion/core";

interface ReasoningAuthorityFaultControl {
  corruptPrimitive(replacement: string): void;
  corruptNestedIdentity(replacement: object): void;
  replaceContext(replacement: ActiveContextRevision): void;
  invalidateVerifierState(): void;
  restore(): void;
}

const CONTROLS = new WeakMap<object, ReasoningAuthorityFaultControl>();

export function bindRegisteredReasoningAuthorityFaultControl(
  candidate: ReasoningOutcome,
  control: ReasoningAuthorityFaultControl,
): void {
  CONTROLS.set(candidate, control);
}

export function corruptRegisteredReasoningPrimitive(
  candidate: ReasoningOutcome,
  replacement: string,
): void {
  requireControl(candidate).corruptPrimitive(replacement);
}

export function corruptRegisteredReasoningNestedIdentity(
  candidate: ReasoningOutcome,
  replacement: object,
): void {
  requireControl(candidate).corruptNestedIdentity(replacement);
}

export function replaceRegisteredReasoningContext(
  candidate: ReasoningOutcome,
  replacement: ActiveContextRevision,
): void {
  requireControl(candidate).replaceContext(replacement);
}

export function restoreRegisteredReasoningCorrespondence(
  candidate: ReasoningOutcome,
): void {
  requireControl(candidate).restore();
}

export function invalidateRegisteredReasoningVerifierState(
  candidate: ReasoningOutcome,
): void {
  requireControl(candidate).invalidateVerifierState();
}

function requireControl(
  candidate: ReasoningOutcome,
): ReasoningAuthorityFaultControl {
  const control = CONTROLS.get(candidate);
  if (control === undefined) {
    throw new Error("Reasoning candidate was not registered by its issuer.");
  }
  return control;
}
