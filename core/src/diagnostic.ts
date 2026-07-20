import type { CapabilityDescriptor } from "./capability.js";

export type ArchitecturalDiagnosticStatus = "ok";

export interface IdentityCapabilityDiagnostic {
  readonly initialized: true;
  readonly anonymousResolutionSucceeded: true;
  readonly authenticatedResolutionSucceeded: true;
}

export interface DiagnosticResult {
  readonly runtimeStarted: true;
  readonly configurationLoaded: true;
  readonly capabilityRegistryInitialized: true;
  readonly registeredCapabilityCount: number;
  readonly registeredCapabilities: readonly CapabilityDescriptor[];
  readonly identityCapability: IdentityCapabilityDiagnostic;
  readonly architecturalDiagnosticStatus: ArchitecturalDiagnosticStatus;
}
