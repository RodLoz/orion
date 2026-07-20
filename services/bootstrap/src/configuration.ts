import type { LogLevel } from "@orion/core";

export interface BootstrapConfiguration {
  readonly runtimeName: string;
  readonly logLevel: LogLevel;
  readonly correlationId: string;
}

export type BootstrapEnvironment = Readonly<Record<string, string | undefined>>;

const LOG_LEVELS: readonly LogLevel[] = ["debug", "info", "warn", "error"];

function nonEmpty(value: string | undefined, fallback: string): string {
  const normalized = value?.trim();
  return normalized === undefined || normalized.length === 0
    ? fallback
    : normalized;
}

function parseLogLevel(value: string | undefined): LogLevel {
  const normalized = nonEmpty(value, "info").toLowerCase();

  if (LOG_LEVELS.includes(normalized as LogLevel)) {
    return normalized as LogLevel;
  }

  throw new BootstrapConfigurationError(
    `ORION_LOG_LEVEL must be one of: ${LOG_LEVELS.join(", ")}`,
  );
}

export function loadBootstrapConfiguration(
  environment: BootstrapEnvironment,
): BootstrapConfiguration {
  return Object.freeze({
    runtimeName: nonEmpty(environment.ORION_RUNTIME_NAME, "orion-m0"),
    logLevel: parseLogLevel(environment.ORION_LOG_LEVEL),
    correlationId: nonEmpty(
      environment.ORION_CORRELATION_ID,
      "orion-m0-diagnostic",
    ),
  });
}

export class BootstrapConfigurationError extends Error {
  public constructor(message: string) {
    super(message);
    this.name = "BootstrapConfigurationError";
  }
}
