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
        registeredCapabilityCount: 2,
        identityCapability: {
          initialized: true,
          anonymousResolutionSucceeded: true,
          authenticatedResolutionSucceeded: true,
        },
        architecturalDiagnosticStatus: "ok",
      });
      expect(result.registeredCapabilities.map(({ id }) => id)).toEqual([
        "orion.identity",
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
          registeredCapabilityCount: 2,
          identityCapability: {
            initialized: true,
            anonymousResolutionSucceeded: true,
            authenticatedResolutionSucceeded: true,
          },
          architecturalDiagnosticStatus: "ok",
        },
      });
      const serializedDiagnostic = diagnosticOutput[0] ?? "";
      expect(serializedDiagnostic).not.toContain("m1-demonstration-reference");
      expect(serializedDiagnostic).not.toContain(
        "orion.identity.demonstration",
      );
      expect(serializedDiagnostic).not.toMatch(
        /credential|password|secret|token/i,
      );
      expect(logOutput).toHaveLength(logLevel === "debug" ? 1 : 0);
    },
  );
});
