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

export interface MemoryCapabilityDiagnostic {
  readonly operational: true;
  readonly retentionSucceeded: true;
  readonly retrievalSucceeded: true;
  readonly retrievalReceiptCreated: true;
  readonly lastUsedAvailable: true;
  readonly retainedCountBeforeForget: number;
  readonly forgettingSucceeded: true;
  readonly retainedCountAfterForget: number;
}

export interface KnowledgeCapabilityDiagnostic {
  readonly operational: true;
  readonly acceptanceSucceeded: true;
  readonly retrievalSucceeded: true;
  readonly referenceCount: number;
  readonly contradictionRejected: true;
  readonly supersessionSucceeded: true;
  readonly versionAdvanced: true;
  readonly predecessorRetrievable: true;
  readonly successorCurrent: true;
}

export interface ReasoningCapabilityDiagnostic {
  readonly operational: true;
  readonly evaluationSucceeded: true;
  readonly anonymousRuleSucceeded: true;
  readonly authenticatedKnowledgeRuleSucceeded: true;
  readonly authenticatedMemoryRuleSucceeded: true;
  readonly authenticatedContextOnlyRuleSucceeded: true;
  readonly precedenceRuleSucceeded: true;
  readonly candidateResponseProduced: true;
}

export interface DiagnosticResult {
  readonly runtimeStarted: true;
  readonly configurationLoaded: true;
  readonly capabilityRegistryInitialized: true;
  readonly registeredCapabilityCount: number;
  readonly registeredCapabilities: readonly CapabilityDescriptor[];
  readonly identityCapability: IdentityCapabilityDiagnostic;
  readonly contextCapability: ContextCapabilityDiagnostic;
  readonly memoryCapability: MemoryCapabilityDiagnostic;
  readonly knowledgeCapability: KnowledgeCapabilityDiagnostic;
  readonly reasoningCapability: ReasoningCapabilityDiagnostic;
  readonly architecturalDiagnosticStatus: ArchitecturalDiagnosticStatus;
}
