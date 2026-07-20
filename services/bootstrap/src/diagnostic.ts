import {
  capabilityIdentifier,
  type CapabilityDescriptor,
  type DiagnosticResult,
} from "@orion/core";

import { RuntimeCapabilityRegistry } from "./capability-registry.js";
import { composeContextCapability } from "./context/context-composition.js";
import { composeIdentityCapability } from "./identity/identity-composition.js";
import { composeMemoryCapability } from "./memory/memory-composition.js";

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

const MEMORY_CAPABILITY: CapabilityDescriptor = Object.freeze({
  id: capabilityIdentifier("orion.memory"),
  name: "Memory",
  version: "1.0.0",
  availability: "available",
});

export function composeDiagnosticRuntime(): DiagnosticResult {
  const registry = new RuntimeCapabilityRegistry();
  registry.register(DIAGNOSTIC_CAPABILITY);
  registry.register(IDENTITY_CAPABILITY);
  registry.register(CONTEXT_CAPABILITY);
  registry.register(MEMORY_CAPABILITY);

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

  const memory = composeMemoryCapability();
  const retained = memory.retainMemory.retainMemory({
    intent: "retain",
    kind: "episodic",
    content: "A controlled M3 diagnostic milestone occurred.",
    retentionReason: "Verify explicit M3 retention.",
    provenance: {
      sourceType: "capability-outcome",
      originatingCapability: "orion.runtime.diagnostics",
      observedAt: "2026-07-20T11:59:00.000Z",
      occurrenceEvidence: "observed",
    },
  });
  const retrieved = memory.getMemory.getMemory({
    memoryIdentity: retained.memoryIdentity,
    purpose: "diagnostic",
  });
  const lastUsed = memory.lastUsedInspection.lastUsedAt(
    retained.memoryIdentity,
  );
  const retainedBefore =
    memory.listRetainedMemoryReferences.listRetainedMemoryReferences({});
  const forgotten = memory.forgetMemory.forgetMemory({
    intent: "forget",
    memoryIdentity: retained.memoryIdentity,
  });
  const retainedAfter =
    memory.listRetainedMemoryReferences.listRetainedMemoryReferences({});

  if (
    retrieved.memory.memoryIdentity !== retained.memoryIdentity ||
    retrieved.receipt.memoryReference.memoryIdentity !==
      retained.memoryIdentity ||
    lastUsed !== retrieved.receipt.retrievedAt ||
    retainedBefore.length !== 1 ||
    forgotten.outcome !== "deleted" ||
    retainedAfter.length !== 0
  ) {
    throw new Error("Memory capability diagnostic failed.");
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
    memoryCapability: Object.freeze({
      operational: true,
      retentionSucceeded: true,
      retrievalSucceeded: true,
      retrievalReceiptCreated: true,
      lastUsedAvailable: true,
      retainedCountBeforeForget: retainedBefore.length,
      forgettingSucceeded: true,
      retainedCountAfterForget: retainedAfter.length,
    }),
    architecturalDiagnosticStatus: "ok",
  });

  return result;
}
