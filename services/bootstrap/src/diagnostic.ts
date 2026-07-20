import {
  capabilityIdentifier,
  type CapabilityDescriptor,
  type DiagnosticResult,
} from "@orion/core";

import { RuntimeCapabilityRegistry } from "./capability-registry.js";
import { composeIdentityCapability } from "./identity/identity-composition.js";

const DIAGNOSTIC_CAPABILITY: CapabilityDescriptor = Object.freeze({
  id: capabilityIdentifier("orion.runtime.diagnostics"),
  name: "M0 Runtime Diagnostics",
  version: "0.0.0",
  availability: "available",
});

const IDENTITY_CAPABILITY: CapabilityDescriptor = Object.freeze({
  id: capabilityIdentifier("orion.identity"),
  name: "Identity",
  version: "1.0.0",
  availability: "available",
});

export function composeDiagnosticRuntime(): DiagnosticResult {
  const registry = new RuntimeCapabilityRegistry();
  registry.register(DIAGNOSTIC_CAPABILITY);
  registry.register(IDENTITY_CAPABILITY);

  const identity = composeIdentityCapability();
  const anonymousIdentity =
    identity.resolveCurrentIdentity.resolveCurrentIdentity({});
  const authenticatedIdentity =
    identity.resolveCurrentIdentity.resolveCurrentIdentity({
      resolutionReference: identity.demonstrationResolutionReference,
    });

  if (
    anonymousIdentity.state !== "anonymous" ||
    authenticatedIdentity.state !== "authenticated"
  ) {
    throw new Error("Identity capability diagnostic failed.");
  }

  const registeredCapabilities = registry.inspect();
  const result: DiagnosticResult = Object.freeze({
    runtimeStarted: true,
    configurationLoaded: true,
    capabilityRegistryInitialized: true,
    registeredCapabilityCount: registeredCapabilities.length,
    registeredCapabilities,
    identityCapability: Object.freeze({
      initialized: true,
      anonymousResolutionSucceeded: true,
      authenticatedResolutionSucceeded: true,
    }),
    architecturalDiagnosticStatus: "ok",
  });

  return result;
}
