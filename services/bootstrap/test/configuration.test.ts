import { describe, expect, it } from "vitest";

import {
  BootstrapConfigurationError,
  loadBootstrapConfiguration,
} from "../src/configuration.js";

describe("loadBootstrapConfiguration", () => {
  it("uses safe deterministic local defaults", () => {
    expect(loadBootstrapConfiguration({})).toEqual({
      runtimeName: "orion-m0",
      logLevel: "info",
      correlationId: "orion-m0-diagnostic",
      knowledgeStoreMode: "in-memory",
    });
  });

  it("parses external environment values", () => {
    expect(
      loadBootstrapConfiguration({
        ORION_RUNTIME_NAME: "local-orion",
        ORION_LOG_LEVEL: "DEBUG",
        ORION_CORRELATION_ID: "test-correlation",
      }),
    ).toEqual({
      runtimeName: "local-orion",
      logLevel: "debug",
      correlationId: "test-correlation",
      knowledgeStoreMode: "in-memory",
    });
  });

  it("normalizes empty values to safe defaults", () => {
    expect(
      loadBootstrapConfiguration({ ORION_RUNTIME_NAME: "   " }).runtimeName,
    ).toBe("orion-m0");
  });

  it("rejects unsupported log levels", () => {
    expect(() =>
      loadBootstrapConfiguration({ ORION_LOG_LEVEL: "verbose" }),
    ).toThrow(BootstrapConfigurationError);
  });

  it("requires a valid external PostgreSQL connection string only in PostgreSQL mode", () => {
    expect(() =>
      loadBootstrapConfiguration({ ORION_KNOWLEDGE_STORE_MODE: "postgresql" }),
    ).toThrow("ORION_POSTGRES_CONNECTION_STRING is required");
    expect(
      loadBootstrapConfiguration({
        ORION_KNOWLEDGE_STORE_MODE: "postgresql",
        ORION_POSTGRES_CONNECTION_STRING:
          "postgresql://runtime:secret@example.test/orion",
      }),
    ).toMatchObject({
      knowledgeStoreMode: "postgresql",
      postgresqlConnectionString:
        "postgresql://runtime:secret@example.test/orion",
    });
    expect(() =>
      loadBootstrapConfiguration({
        ORION_KNOWLEDGE_STORE_MODE: "postgresql",
        ORION_POSTGRES_CONNECTION_STRING: "mysql://runtime:secret/example",
      }),
    ).toThrow("valid PostgreSQL connection string");
  });

  it("fails closed on unknown Store modes without echoing secrets", () => {
    let failure: unknown;
    try {
      loadBootstrapConfiguration({
        ORION_KNOWLEDGE_STORE_MODE: "postgresql-secret",
        ORION_POSTGRES_CONNECTION_STRING:
          "postgresql://user:sentinel@example.test/orion",
      });
    } catch (error: unknown) {
      failure = error;
    }
    expect(failure).toBeInstanceOf(BootstrapConfigurationError);
    expect((failure as Error).message).not.toContain("sentinel");
    expect((failure as Error).message).toContain("ORION_KNOWLEDGE_STORE_MODE");
  });
});
