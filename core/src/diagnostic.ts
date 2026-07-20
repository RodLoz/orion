import type { CapabilityDescriptor } from "./capability.js";

export type ArchitecturalDiagnosticStatus = "ok";

export interface IdentityCapabilityDiagnostic {
  readonly initialized: true;
  readonly anonymousResolutionSucceeded: true;
  readonly authenticatedResolutionSucceeded: true;
}

export interface ContextCapabilityDiagnostic {
  readonly operational: true;
  readonly lineageContinuity: true;
  readonly revisionOrderingEvolution: true;
  readonly previousRevisionExpired: true;
  readonly activeLifecycleState: "active";
  readonly initialIdentityState: "anonymous";
  readonly activeIdentityState: "authenticated";
}

export interface DiagnosticResult {
  readonly runtimeStarted: true;
  readonly configurationLoaded: true;
  readonly capabilityRegistryInitialized: true;
  readonly registeredCapabilityCount: number;
  readonly registeredCapabilities: readonly CapabilityDescriptor[];
  readonly identityCapability: IdentityCapabilityDiagnostic;
  readonly contextCapability: ContextCapabilityDiagnostic;
  readonly architecturalDiagnosticStatus: ArchitecturalDiagnosticStatus;
}
