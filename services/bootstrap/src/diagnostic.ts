import {
  DuplicateSkillIdentifierError,
  capabilityIdentifier,
  type CapabilityDescriptor,
  type DiagnosticResult,
} from "@orion/core";

import { RuntimeCapabilityRegistry } from "./capability-registry.js";
import { composeContextCapability } from "./context/context-composition.js";
import { composeIdentityCapability } from "./identity/identity-composition.js";
import { composeKnowledgeCapability } from "./knowledge/knowledge-composition.js";
import { composeMemoryCapability } from "./memory/memory-composition.js";
import { composePlanningCapability } from "./planning/planning-composition.js";
import { composeReasoningCapability } from "./reasoning/reasoning-composition.js";
import {
  composeSkillCapability,
  demonstrateM9SkillInvocation,
} from "./skill/skill-composition.js";
import {
  composeSecurityCapability,
  securityDiagnosticTarget,
} from "./security/security-composition.js";

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

const KNOWLEDGE_CAPABILITY: CapabilityDescriptor = Object.freeze({
  id: capabilityIdentifier("orion.knowledge"),
  name: "Knowledge",
  version: "1.0.0",
  availability: "available",
});

const REASONING_CAPABILITY: CapabilityDescriptor = Object.freeze({
  id: capabilityIdentifier("orion.reasoning"),
  name: "Reasoning",
  version: "1.0.0",
  availability: "available",
});

const PLANNING_CAPABILITY: CapabilityDescriptor = Object.freeze({
  id: capabilityIdentifier("orion.planning"),
  name: "Planning",
  version: "1.0.0",
  availability: "available",
});

const SKILL_CAPABILITY: CapabilityDescriptor = Object.freeze({
  id: capabilityIdentifier("orion.skill"),
  name: "Skill",
  version: "1.0.0",
  availability: "available",
});
const SECURITY_CAPABILITY: CapabilityDescriptor = Object.freeze({
  id: capabilityIdentifier("orion.security"),
  name: "Security",
  version: "1.0.0",
  availability: "available",
});

export function composeDiagnosticRuntime(): DiagnosticResult {
  const registry = new RuntimeCapabilityRegistry();
  registry.register(DIAGNOSTIC_CAPABILITY);
  registry.register(IDENTITY_CAPABILITY);
  registry.register(CONTEXT_CAPABILITY);
  registry.register(MEMORY_CAPABILITY);
  registry.register(KNOWLEDGE_CAPABILITY);
  registry.register(REASONING_CAPABILITY);
  registry.register(PLANNING_CAPABILITY);
  registry.register(SKILL_CAPABILITY);
  registry.register(SECURITY_CAPABILITY);

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

  const knowledge = composeKnowledgeCapability();
  const initialDecision =
    knowledge.evaluateKnowledgeClaim.evaluateKnowledgeClaim({
      intent: "evaluate",
      claim: "A controlled M4 diagnostic claim is accepted.",
      acceptanceEvidence: {
        method: "explicit-authority-review",
        authorityIdentifier: "orion.diagnostic.authority",
        decision: "accept",
        reason: "Verify explicit M4 acceptance.",
      },
      provenance: {
        sourceType: "approved-internal-source",
        originatingCapability: "orion.runtime.diagnostics",
        observedAt: "2026-07-20T12:59:00.000Z",
      },
    });
  if (initialDecision.outcome !== "accepted") {
    throw new Error("Knowledge capability diagnostic failed.");
  }
  const retrievedKnowledge = knowledge.getKnowledge.getKnowledge({
    knowledgeIdentity: initialDecision.record.knowledgeIdentity,
  });
  const initialReferences =
    knowledge.listKnowledgeReferences.listKnowledgeReferences({});
  const rejectedContradiction =
    knowledge.evaluateKnowledgeClaim.evaluateKnowledgeClaim({
      intent: "evaluate",
      claim: "A controlled conflicting candidate is rejected.",
      acceptanceEvidence: {
        method: "explicit-authority-review",
        authorityIdentifier: "orion.diagnostic.authority",
        decision: "accept",
        reason: "Exercise explicit contradiction rejection.",
      },
      provenance: {
        sourceType: "approved-internal-source",
        originatingCapability: "orion.runtime.diagnostics",
        observedAt: "2026-07-20T12:59:30.000Z",
      },
      contradictsKnowledgeIdentity: initialDecision.record.knowledgeIdentity,
      contradictionDecision: "reject-candidate",
      contradictionReason: "Preserve the accepted diagnostic fixture.",
    });
  const successorDecision =
    knowledge.evaluateKnowledgeClaim.evaluateKnowledgeClaim({
      intent: "evaluate",
      claim: "A controlled M4 diagnostic claim is explicitly superseded.",
      acceptanceEvidence: {
        method: "explicit-authority-review",
        authorityIdentifier: "orion.diagnostic.authority",
        decision: "accept",
        reason: "Verify deterministic M4 supersession.",
      },
      provenance: {
        sourceType: "approved-internal-source",
        originatingCapability: "orion.runtime.diagnostics",
        observedAt: "2026-07-20T13:00:30.000Z",
      },
      contradictsKnowledgeIdentity: initialDecision.record.knowledgeIdentity,
      contradictionDecision: "supersede-existing",
      contradictionReason: "Replace the controlled diagnostic fixture.",
    });
  if (successorDecision.outcome !== "accepted") {
    throw new Error("Knowledge capability diagnostic failed.");
  }
  const historicalKnowledge = knowledge.getKnowledge.getKnowledge({
    knowledgeIdentity: initialDecision.record.knowledgeIdentity,
  });
  const currentReferences =
    knowledge.listKnowledgeReferences.listKnowledgeReferences({});

  if (
    retrievedKnowledge.knowledge.knowledgeIdentity !==
      initialDecision.record.knowledgeIdentity ||
    initialReferences.length !== 1 ||
    rejectedContradiction.outcome !== "rejected" ||
    rejectedContradiction.category !== "contradiction-preserved" ||
    successorDecision.record.version !== initialDecision.record.version + 1 ||
    historicalKnowledge.reference.currency !== "superseded" ||
    currentReferences.length !== 1 ||
    currentReferences[0]?.knowledgeIdentity !==
      successorDecision.record.knowledgeIdentity
  ) {
    throw new Error("Knowledge capability diagnostic failed.");
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
  const reasoning = composeReasoningCapability();
  const anonymousOutcome = reasoning.evaluateReasoning.evaluateReasoning({
    intent: "evaluate",
    activeContextRevision: initialRevision,
    query: "Evaluate anonymous diagnostic grounding.",
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
  const contextOnlyOutcome = reasoning.evaluateReasoning.evaluateReasoning({
    intent: "evaluate",
    activeContextRevision: successorRevision,
    query: "Evaluate Context-only diagnostic grounding.",
  });

  if (
    retrievedInitial.revisionIdentity !== initialRevision.revisionIdentity ||
    initialRevision.lineageIdentity !== successorRevision.lineageIdentity ||
    initialRevision.revisionNumber !== 1 ||
    successorRevision.revisionNumber !== 2 ||
    initialRevision.lifecycleState !== "active" ||
    successorRevision.lifecycleState !== "active" ||
    retrievedSuccessor === initialRevision ||
    retrievedSuccessor.revisionIdentity !== successorRevision.revisionIdentity
  ) {
    throw new Error("Context capability diagnostic failed.");
  }
  if (
    reasoning.engineState() !== "running" ||
    anonymousOutcome.category !== "anonymous-context" ||
    contextOnlyOutcome.category !== "context-only" ||
    contextOnlyOutcome.response.length === 0
  ) {
    throw new Error("Reasoning capability diagnostic failed.");
  }

  const planning = composePlanningCapability();
  const candidatePlan = planning.createCandidatePlan.createCandidatePlan({
    intent: "create-candidate-plan",
    reasoningOutcome: contextOnlyOutcome,
  });
  if (
    planning.engineState() !== "running" ||
    candidatePlan.category !== "request-more-context" ||
    candidatePlan.steps.length !== 1 ||
    candidatePlan.explainability.planningRuleCategory !==
      "reasoning-requested-more-context"
  ) {
    throw new Error("Planning capability diagnostic failed.");
  }

  const skill = composeSkillCapability();
  const diagnosticManifest = {
    id: "diagnostic-skill",
    name: "Controlled diagnostic",
    version: "1.0.0",
    description: "Privacy-sensitive Skill catalog fixture.",
    author: "ORION diagnostic",
    license: "MIT",
    permissions: ["diagnostic.read"],
    capabilities: ["diagnostic.catalog"],
    events: { publishes: ["DiagnosticCompleted"], consumes: [] },
    inputs: ["diagnostic.input"],
    outputs: ["diagnostic.output"],
    failureModes: ["diagnostic.failure"],
  };
  const registered = skill.registerSkillManifest.registerSkillManifest({
    intent: "register-skill-manifest",
    manifest: diagnosticManifest,
  });
  const found = skill.getRegisteredSkill.getRegisteredSkill({
    intent: "get-registered-skill",
    skillId: "diagnostic-skill",
  });
  const discovered = skill.discoverSkills.discoverSkills({
    intent: "discover-skills",
    capability: "diagnostic.catalog",
  });
  const emptyDiscovery = skill.discoverSkills.discoverSkills({
    intent: "discover-skills",
    capability: "diagnostic.absent",
  });
  let duplicateRejected = false;
  try {
    skill.registerSkillManifest.registerSkillManifest({
      intent: "register-skill-manifest",
      manifest: diagnosticManifest,
    });
  } catch (error) {
    duplicateRejected = error instanceof DuplicateSkillIdentifierError;
  }
  if (
    skill.engineState() !== "running" ||
    registered.id !== found.id ||
    discovered.matches.length !== 1 ||
    emptyDiscovery.matches.length !== 0 ||
    !duplicateRejected
  ) {
    throw new Error("Skill capability diagnostic failed.");
  }

  const securitySubject =
    successorRevision.fragments[0].projection.state === "authenticated"
      ? {
          kind: "authenticated" as const,
          identityId:
            successorRevision.fragments[0].projection.identityIdentifier,
        }
      : { kind: "anonymous" as const };
  const security = composeSecurityCapability(securitySubject);
  const evaluateSecurity = (operationId: string) =>
    security.evaluateAuthorization.evaluateAuthorization({
      intent: "evaluate-authorization",
      operationId,
      ...securityDiagnosticTarget,
    });
  const authorizationAllow = evaluateSecurity("diagnostic-allow");
  const authorizationDeny = evaluateSecurity("diagnostic-deny");
  const authorizationIndeterminate = evaluateSecurity(
    "diagnostic-indeterminate",
  );
  if (
    security.engineState() !== "running" ||
    authorizationAllow.decision !== "allow" ||
    authorizationDeny.decision !== "deny" ||
    authorizationIndeterminate.decision !== "indeterminate"
  ) {
    throw new Error("Security capability diagnostic failed.");
  }
  const authoritativeSuccessor =
    context.getActiveContextRevision.getActiveContextRevision({
      lineageIdentity: successorRevision.lineageIdentity,
    });
  const m9 = demonstrateM9SkillInvocation(
    authoritativeSuccessor,
    (candidate) => {
      if (candidate !== authoritativeSuccessor) return false;
      try {
        return (
          context.verifyActiveContextRevisionAuthority.verifyActiveContextRevisionAuthority(
            {
              intent: "verify-active-context-revision-authority",
              candidate: authoritativeSuccessor,
              expectedLineageIdentity: authoritativeSuccessor.lineageIdentity,
              expectedRevisionIdentity: authoritativeSuccessor.revisionIdentity,
              expectedRevisionNumber: authoritativeSuccessor.revisionNumber,
            },
          ) === authoritativeSuccessor
        );
      } catch {
        return false;
      }
    },
    security.authorizationEvaluation,
  );
  if (
    m9.result.status !== "succeeded" ||
    m9.lifecycleTransitionCount !== 6 ||
    !m9.resultAuthorityVerified
  )
    throw new Error("M9 Skill capability diagnostic failed.");

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
    knowledgeCapability: Object.freeze({
      operational: true,
      acceptanceSucceeded: true,
      retrievalSucceeded: true,
      referenceCount: initialReferences.length,
      contradictionRejected: true,
      supersessionSucceeded: true,
      versionAdvanced: true,
      predecessorRetrievable: true,
      successorCurrent: true,
    }),
    reasoningCapability: Object.freeze({
      operational: true,
      evaluationSucceeded: true,
      anonymousRuleSucceeded: true,
      authenticatedContextOnlyRuleSucceeded: true,
      candidateResponseProduced: true,
    }),
    planningCapability: Object.freeze({
      planningCapabilityOperational: true,
      planningSucceeded: true,
      planCategory: "request-more-context",
      stepCount: 1,
      planningRuleCategory: "reasoning-requested-more-context",
    }),
    skillCapability: Object.freeze({
      operational: true,
      registrationSucceeded: true,
      lookupSucceeded: true,
      discoverySucceeded: true,
      duplicateRejected: true,
      emptyDiscoverySucceeded: true,
      registeredCount: 1,
      discoveredCount: discovered.matches.length,
      emptyDiscoveryCount: emptyDiscovery.matches.length,
      protectedInvocationSucceeded: true,
      lifecycleObserved: true,
      normalizedResultAuthorityVerified: true,
    }),
    securityCapability: Object.freeze({
      operational: true,
      allowSucceeded: true,
      denySucceeded: true,
      indeterminateSucceeded: true,
    }),
    architecturalDiagnosticStatus: "ok",
  });

  return result;
}
