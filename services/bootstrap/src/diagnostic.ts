import {
  capabilityIdentifier,
  type CapabilityDescriptor,
  type DiagnosticResult,
} from "@orion/core";

import { RuntimeCapabilityRegistry } from "./capability-registry.js";
import { composeContextCapability } from "./context/context-composition.js";
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

const CONTEXT_CAPABILITY: CapabilityDescriptor = Object.freeze({
  id: capabilityIdentifier("orion.context"),
  name: "Context",
  version: "1.0.0",
  availability: "available",
});

export function composeDiagnosticRuntime(): DiagnosticResult {
  const registry = new RuntimeCapabilityRegistry();
  registry.register(DIAGNOSTIC_CAPABILITY);
  registry.register(IDENTITY_CAPABILITY);
  registry.register(CONTEXT_CAPABILITY);

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

  const context = composeContextCapability();
  const initialRevision = context.composeContextRevision.composeContextRevision(
    {
      target: { kind: "new-lineage" },
      currentIdentity: anonymousIdentity,
    },
  );
  const retrievedInitial =
    context.getActiveContextRevision.getActiveContextRevision({
      lineageIdentity: initialRevision.lineageIdentity,
    });
  const successorRevision =
    context.composeContextRevision.composeContextRevision({
      target: {
        kind: "existing-lineage",
        lineageIdentity: initialRevision.lineageIdentity,
        expectedActiveRevisionIdentity: initialRevision.revisionIdentity,
      },
      currentIdentity: authenticatedIdentity,
    });
  const retrievedSuccessor =
    context.getActiveContextRevision.getActiveContextRevision({
      lineageIdentity: successorRevision.lineageIdentity,
    });

  if (
    retrievedInitial.revisionIdentity !== initialRevision.revisionIdentity ||
    initialRevision.lineageIdentity !== successorRevision.lineageIdentity ||
    initialRevision.revisionNumber !== 1 ||
    successorRevision.revisionNumber !== 2 ||
    initialRevision.lifecycleState !== "expired" ||
    successorRevision.lifecycleState !== "active" ||
    retrievedSuccessor.revisionIdentity !== successorRevision.revisionIdentity
  ) {
    throw new Error("Context capability diagnostic failed.");
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
    contextCapability: Object.freeze({
      operational: true,
      lineageContinuity: true,
      revisionOrderingEvolution: true,
      previousRevisionExpired: true,
      activeLifecycleState: "active",
      initialIdentityState: "anonymous",
      activeIdentityState: "authenticated",
    }),
    architecturalDiagnosticStatus: "ok",
  });

  return result;
}
