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
});
