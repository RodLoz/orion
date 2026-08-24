import { describe, expect, it } from "vitest";

import { runDiagnosticRuntime } from "../src/run.js";

describe("M0 diagnostic runtime", () => {
  it.each(["debug", "info", "warn", "error"] as const)(
    "emits exactly one mandatory result at %s log level",
    async (logLevel) => {
      const diagnosticOutput: string[] = [];
      const logOutput: string[] = [];

      const result = await runDiagnosticRuntime({
        environment: { ORION_LOG_LEVEL: logLevel },
        logSink: (record) => logOutput.push(record),
        diagnosticResultSink: (record) => diagnosticOutput.push(record),
      });

      expect(result).toMatchObject({
        runtimeStarted: true,
        configurationLoaded: true,
        capabilityRegistryInitialized: true,
        registeredCapabilityCount: 9,
        identityCapability: {
          initialized: true,
          anonymousResolutionSucceeded: true,
          authenticatedResolutionSucceeded: true,
        },
        contextCapability: {
          operational: true,
          lineageContinuity: true,
          revisionOrderingEvolution: true,
          previousRevisionExpired: true,
          knowledgeAwarePreparationSucceeded: true,
          activeSourceCount: 2,
          activeFragmentCount: 2,
          canonicalFragmentOrderingPreserved: true,
          activeLifecycleState: "active",
          knowledgeAwareSourceCount: 2,
          knowledgeAwareFragmentCount: 2,
          knowledgeAwareCanonicalFragmentOrderingPreserved: true,
          knowledgeAwareActiveLifecycleState: "active",
          knowledgeAwareAuthorityVerified: true,
          memoryAwarePreparationSucceeded: true,
          memoryAwareSourceCount: 2,
          memoryAwareFragmentCount: 2,
          memoryAwareCanonicalFragmentOrderingPreserved: true,
          memoryAwareActiveLifecycleState: "active",
          memoryAwareAuthorityVerified: true,
          initialIdentityState: "anonymous",
          activeIdentityState: "authenticated",
        },
        memoryCapability: {
          operational: true,
          retentionSucceeded: true,
          retrievalSucceeded: true,
          retrievalReceiptCreated: true,
          lastUsedAvailable: true,
          retainedCountBeforeForget: 1,
          forgettingSucceeded: true,
          retainedCountAfterForget: 0,
        },
        knowledgeCapability: {
          operational: true,
          acceptanceSucceeded: true,
          retrievalSucceeded: true,
          referenceCount: 1,
          contradictionRejected: true,
          supersessionSucceeded: true,
          versionAdvanced: true,
          predecessorRetrievable: true,
          successorCurrent: true,
        },
        reasoningCapability: {
          operational: true,
          evaluationSucceeded: true,
          anonymousRuleSucceeded: true,
          authenticatedContextOnlyRuleSucceeded: true,
          candidateResponseProduced: true,
        },
        planningCapability: {
          planningCapabilityOperational: true,
          planningSucceeded: true,
          planCategory: "request-more-context",
          stepCount: 1,
          planningRuleCategory: "reasoning-requested-more-context",
        },
        skillCapability: {
          operational: true,
          registrationSucceeded: true,
          lookupSucceeded: true,
          discoverySucceeded: true,
          duplicateRejected: true,
          emptyDiscoverySucceeded: true,
          registeredCount: 1,
          discoveredCount: 1,
          emptyDiscoveryCount: 0,
          protectedInvocationSucceeded: true,
          lifecycleObserved: true,
          normalizedResultAuthorityVerified: true,
        },
        securityCapability: {
          operational: true,
          allowSucceeded: true,
          denySucceeded: true,
          indeterminateSucceeded: true,
        },
        architecturalDiagnosticStatus: "ok",
      });
      expect(result.registeredCapabilities.map(({ id }) => id)).toEqual([
        "orion.context",
        "orion.identity",
        "orion.knowledge",
        "orion.memory",
        "orion.planning",
        "orion.reasoning",
        "orion.runtime.diagnostics",
        "orion.security",
        "orion.skill",
      ]);
      expect(diagnosticOutput).toHaveLength(1);
      expect(JSON.parse(diagnosticOutput[0] ?? "{}")).toMatchObject({
        event: "orion.runtime.diagnostic.result",
        correlationId: "orion-m0-diagnostic",
        result: {
          runtimeStarted: true,
          configurationLoaded: true,
          capabilityRegistryInitialized: true,
          registeredCapabilityCount: 9,
          identityCapability: {
            initialized: true,
            anonymousResolutionSucceeded: true,
            authenticatedResolutionSucceeded: true,
          },
          contextCapability: {
            operational: true,
            lineageContinuity: true,
            revisionOrderingEvolution: true,
            previousRevisionExpired: true,
            knowledgeAwarePreparationSucceeded: true,
            activeSourceCount: 2,
            activeFragmentCount: 2,
            canonicalFragmentOrderingPreserved: true,
            activeLifecycleState: "active",
            knowledgeAwareSourceCount: 2,
            knowledgeAwareFragmentCount: 2,
            knowledgeAwareCanonicalFragmentOrderingPreserved: true,
            knowledgeAwareActiveLifecycleState: "active",
            knowledgeAwareAuthorityVerified: true,
            memoryAwarePreparationSucceeded: true,
            memoryAwareSourceCount: 2,
            memoryAwareFragmentCount: 2,
            memoryAwareCanonicalFragmentOrderingPreserved: true,
            memoryAwareActiveLifecycleState: "active",
            memoryAwareAuthorityVerified: true,
            initialIdentityState: "anonymous",
            activeIdentityState: "authenticated",
          },
          memoryCapability: {
            operational: true,
            retentionSucceeded: true,
            retrievalSucceeded: true,
            retrievalReceiptCreated: true,
            lastUsedAvailable: true,
            retainedCountBeforeForget: 1,
            forgettingSucceeded: true,
            retainedCountAfterForget: 0,
          },
          knowledgeCapability: {
            operational: true,
            acceptanceSucceeded: true,
            retrievalSucceeded: true,
            referenceCount: 1,
            contradictionRejected: true,
            supersessionSucceeded: true,
            versionAdvanced: true,
            predecessorRetrievable: true,
            successorCurrent: true,
          },
          reasoningCapability: {
            operational: true,
            evaluationSucceeded: true,
            anonymousRuleSucceeded: true,
            authenticatedContextOnlyRuleSucceeded: true,
            candidateResponseProduced: true,
          },
          planningCapability: {
            planningCapabilityOperational: true,
            planningSucceeded: true,
            planCategory: "request-more-context",
            stepCount: 1,
            planningRuleCategory: "reasoning-requested-more-context",
          },
          skillCapability: {
            operational: true,
            registrationSucceeded: true,
            lookupSucceeded: true,
            discoverySucceeded: true,
            duplicateRejected: true,
            emptyDiscoverySucceeded: true,
            registeredCount: 1,
            discoveredCount: 1,
            emptyDiscoveryCount: 0,
            protectedInvocationSucceeded: true,
            lifecycleObserved: true,
            normalizedResultAuthorityVerified: true,
          },
          securityCapability: {
            operational: true,
            allowSucceeded: true,
            denySucceeded: true,
            indeterminateSucceeded: true,
          },
          architecturalDiagnosticStatus: "ok",
        },
      });
      const serializedDiagnostic = diagnosticOutput[0] ?? "";
      expect(serializedDiagnostic).not.toContain("m1-demonstration-reference");
      expect(serializedDiagnostic).not.toContain(
        "orion.identity.demonstration",
      );
      expect(serializedDiagnostic).not.toContain("orion.context.lineage");
      expect(serializedDiagnostic).not.toContain("orion.context.revision");
      expect(serializedDiagnostic).not.toContain("orion.memory.m3.1");
      expect(serializedDiagnostic).not.toContain(
        "A controlled M3 diagnostic milestone occurred.",
      );
      expect(serializedDiagnostic).not.toContain("2026-07-20T11:59:00.000Z");
      expect(serializedDiagnostic).not.toContain("orion.knowledge.m4.1");
      expect(serializedDiagnostic).not.toContain("orion.knowledge.m4.2");
      expect(serializedDiagnostic).not.toContain(
        "A controlled M4 diagnostic claim is accepted.",
      );
      expect(serializedDiagnostic).not.toContain("orion.diagnostic.authority");
      expect(serializedDiagnostic).not.toContain(
        "Verify explicit M4 acceptance.",
      );
      expect(serializedDiagnostic).not.toContain("2026-07-20T12:59:00.000Z");
      expect(serializedDiagnostic).not.toContain(
        "Evaluate anonymous diagnostic grounding.",
      );
      expect(serializedDiagnostic).not.toContain(
        "The active context identifies an anonymous actor.",
      );
      expect(serializedDiagnostic).not.toContain(
        "Accepted Knowledge context is available for further orchestration.",
      );
      expect(serializedDiagnostic).not.toContain("diagnostic-skill");
      expect(serializedDiagnostic).not.toContain("Controlled diagnostic");
      expect(serializedDiagnostic).not.toContain("diagnostic.read");
      expect(serializedDiagnostic).not.toContain("diagnostic.catalog");
      expect(serializedDiagnostic).not.toContain("DiagnosticCompleted");
      expect(serializedDiagnostic).not.toContain("diagnostic.input");
      expect(serializedDiagnostic).not.toContain("diagnostic.output");
      expect(serializedDiagnostic).not.toContain("diagnostic.failure");
      expect(serializedDiagnostic).not.toMatch(
        /credential|password|secret|token/i,
      );
      expect(logOutput).toHaveLength(logLevel === "debug" ? 1 : 0);
    },
  );
});
