import { runDiagnosticRuntime } from "./run.js";

try {
  runDiagnosticRuntime({ environment: process.env });
} catch (error: unknown) {
  const message =
    error instanceof Error ? error.message : "Unknown bootstrap failure";
  console.error(
    JSON.stringify({
      level: "error",
      event: "orion.runtime.diagnostic.failed",
      message,
      correlationId: process.env.ORION_CORRELATION_ID ?? "orion-m0-diagnostic",
    }),
  );
  process.exitCode = 1;
}
