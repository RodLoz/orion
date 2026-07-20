import { describe, expect, it } from "vitest";

import { runDiagnosticRuntime } from "../src/run.js";

describe("M0 diagnostic runtime", () => {
  it.each(["debug", "info", "warn", "error"] as const)(
    "emits exactly one mandatory result at %s log level",
    (logLevel) => {
      const diagnosticOutput: string[] = [];
      const logOutput: string[] = [];

      const result = runDiagnosticRuntime({
        environment: { ORION_LOG_LEVEL: logLevel },
        logSink: (record) => logOutput.push(record),
        diagnosticResultSink: (record) => diagnosticOutput.push(record),
      });

      expect(result).toMatchObject({
        runtimeStarted: true,
        configurationLoaded: true,
        capabilityRegistryInitialized: true,
        registeredCapabilityCount: 4,
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
          activeLifecycleState: "active",
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
        architecturalDiagnosticStatus: "ok",
      });
      expect(result.registeredCapabilities.map(({ id }) => id)).toEqual([
        "orion.context",
        "orion.identity",
        "orion.memory",
        "orion.runtime.diagnostics",
      ]);
      expect(diagnosticOutput).toHaveLength(1);
      expect(JSON.parse(diagnosticOutput[0] ?? "{}")).toMatchObject({
        event: "orion.runtime.diagnostic.result",
        correlationId: "orion-m0-diagnostic",
        result: {
          runtimeStarted: true,
          configurationLoaded: true,
          capabilityRegistryInitialized: true,
          registeredCapabilityCount: 4,
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
            activeLifecycleState: "active",
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
      expect(serializedDiagnostic).not.toMatch(
        /credential|password|secret|token/i,
      );
      expect(logOutput).toHaveLength(logLevel === "debug" ? 1 : 0);
    },
  );
});
