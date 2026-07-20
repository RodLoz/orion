import { describe, expect, it } from "vitest";

import {
  capabilityIdentifier,
  InvalidCapabilityIdentifierError,
} from "../src/index.js";

describe("capability identifier contract", () => {
  it("accepts stable dot-separated identifiers", () => {
    expect(capabilityIdentifier("orion.runtime.diagnostics")).toBe(
      "orion.runtime.diagnostics",
    );
  });

  it("rejects identifiers outside the public contract", () => {
    expect(() => capabilityIdentifier("ORION Runtime")).toThrow(
      InvalidCapabilityIdentifierError,
    );
  });
});
