import type { DiagnosticResult } from "@orion/core";

import {
  ConsoleStructuredLogger,
  type LogSink,
} from "./console-structured-logger.js";
import {
  loadBootstrapConfiguration,
  type BootstrapEnvironment,
} from "./configuration.js";
import { composeDiagnosticRuntime } from "./diagnostic.js";
import {
  emitDiagnosticResult,
  type DiagnosticResultSink,
} from "./diagnostic-result-output.js";

export interface DiagnosticRuntimeOptions {
  readonly environment: BootstrapEnvironment;
  readonly logSink?: LogSink;
  readonly diagnosticResultSink?: DiagnosticResultSink;
}

export function runDiagnosticRuntime(
  options: DiagnosticRuntimeOptions,
): DiagnosticResult {
  const configuration = loadBootstrapConfiguration(options.environment);
  const logger = new ConsoleStructuredLogger(
    configuration.logLevel,
    options.logSink,
  );

  logger.log({
    level: "debug",
    event: "orion.runtime.diagnostic.started",
    message: `${configuration.runtimeName} architectural diagnostic started`,
    correlationId: configuration.correlationId,
  });

  const result = composeDiagnosticRuntime();
  emitDiagnosticResult(
    result,
    configuration.correlationId,
    options.diagnosticResultSink,
  );

  return result;
}
