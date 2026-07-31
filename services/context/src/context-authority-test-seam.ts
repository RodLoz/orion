import type { ActiveContextRevision } from "@orion/core";

interface ContextAuthorityFaultControl {
  corruptPrimitive(replacement: number): void;
  corruptNestedIdentity(replacement: object): void;
  invalidateVerifierState(): void;
  restore(): void;
}

const CONTROLS = new WeakMap<object, ContextAuthorityFaultControl>();

export function bindRegisteredContextAuthorityFaultControl(
  candidate: ActiveContextRevision,
  control: ContextAuthorityFaultControl,
): void {
  CONTROLS.set(candidate, control);
}

export function corruptRegisteredContextPrimitive(
  candidate: ActiveContextRevision,
  replacement: number,
): void {
  requireControl(candidate).corruptPrimitive(replacement);
}

export function corruptRegisteredContextNestedIdentity(
  candidate: ActiveContextRevision,
  replacement: object,
): void {
  requireControl(candidate).corruptNestedIdentity(replacement);
}

export function restoreRegisteredContextSnapshot(
  candidate: ActiveContextRevision,
): void {
  requireControl(candidate).restore();
}

export function invalidateRegisteredContextVerifierState(
  candidate: ActiveContextRevision,
): void {
  requireControl(candidate).invalidateVerifierState();
}

function requireControl(
  candidate: ActiveContextRevision,
): ContextAuthorityFaultControl {
  const control = CONTROLS.get(candidate);
  if (control === undefined) {
    throw new Error("Context candidate was not registered by its issuer.");
  }
  return control;
}
