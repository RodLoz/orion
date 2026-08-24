import type { LogLevel } from "@orion/core";

export interface BootstrapConfiguration {
  readonly runtimeName: string;
  readonly logLevel: LogLevel;
  readonly correlationId: string;
  readonly knowledgeStoreMode: KnowledgeStoreMode;
  readonly postgresqlConnectionString?: string;
}

export type BootstrapEnvironment = Readonly<Record<string, string | undefined>>;
export type KnowledgeStoreMode = "in-memory" | "postgresql";

const LOG_LEVELS: readonly LogLevel[] = ["debug", "info", "warn", "error"];
const KNOWLEDGE_STORE_MODES: readonly KnowledgeStoreMode[] = [
  "in-memory",
  "postgresql",
];

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

function parseKnowledgeStoreMode(
  value: string | undefined,
): KnowledgeStoreMode {
  const normalized = nonEmpty(value, "in-memory").toLowerCase();
  if (KNOWLEDGE_STORE_MODES.includes(normalized as KnowledgeStoreMode)) {
    return normalized as KnowledgeStoreMode;
  }
  throw new BootstrapConfigurationError(
    "ORION_KNOWLEDGE_STORE_MODE must be one of: in-memory, postgresql",
  );
}

function parsePostgresqlConnectionString(
  mode: KnowledgeStoreMode,
  value: string | undefined,
): string | undefined {
  if (mode === "in-memory") return undefined;
  const connectionString = value?.trim();
  if (connectionString === undefined || connectionString.length === 0) {
    throw new BootstrapConfigurationError(
      "ORION_POSTGRES_CONNECTION_STRING is required when ORION_KNOWLEDGE_STORE_MODE is postgresql",
    );
  }
  try {
    const parsed = new URL(connectionString);
    if (parsed.protocol !== "postgres:" && parsed.protocol !== "postgresql:") {
      throw new Error();
    }
    if (parsed.hostname.length === 0 || parsed.pathname.length <= 1) {
      throw new Error();
    }
  } catch {
    throw new BootstrapConfigurationError(
      "ORION_POSTGRES_CONNECTION_STRING must be a valid PostgreSQL connection string",
    );
  }
  return connectionString;
}

export function loadBootstrapConfiguration(
  environment: BootstrapEnvironment,
): BootstrapConfiguration {
  const knowledgeStoreMode = parseKnowledgeStoreMode(
    environment.ORION_KNOWLEDGE_STORE_MODE,
  );
  const postgresqlConnectionString = parsePostgresqlConnectionString(
    knowledgeStoreMode,
    environment.ORION_POSTGRES_CONNECTION_STRING,
  );
  return Object.freeze({
    runtimeName: nonEmpty(environment.ORION_RUNTIME_NAME, "orion-m0"),
    logLevel: parseLogLevel(environment.ORION_LOG_LEVEL),
    correlationId: nonEmpty(
      environment.ORION_CORRELATION_ID,
      "orion-m0-diagnostic",
    ),
    knowledgeStoreMode,
    ...(postgresqlConnectionString === undefined
      ? {}
      : { postgresqlConnectionString }),
  });
}

export class BootstrapConfigurationError extends Error {
  public constructor(message: string) {
    super(message);
    this.name = "BootstrapConfigurationError";
  }
}
