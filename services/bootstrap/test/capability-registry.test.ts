import {
  capabilityIdentifier,
  DuplicateCapabilityIdentifierError,
  type CapabilityDescriptor,
} from "@orion/core";
import { describe, expect, it } from "vitest";

import { RuntimeCapabilityRegistry } from "../src/capability-registry.js";

function descriptor(id: string, name = id): CapabilityDescriptor {
  return {
    id: capabilityIdentifier(id),
    name,
    version: "0.0.0",
    availability: "available",
  };
}

describe("RuntimeCapabilityRegistry", () => {
  it("registers and retrieves capability metadata", () => {
    const registry = new RuntimeCapabilityRegistry();
    const capability = descriptor("orion.runtime.diagnostics");

    registry.register(capability);

    expect(registry.get(capability.id)).toEqual(capability);
  });

  it("rejects duplicate capability identifiers", () => {
    const registry = new RuntimeCapabilityRegistry();
    const capability = descriptor("orion.runtime.diagnostics");
    registry.register(capability);

    expect(() => registry.register(capability)).toThrow(
      DuplicateCapabilityIdentifierError,
    );
  });

  it("returns deterministic immutable inspection metadata", () => {
    const registry = new RuntimeCapabilityRegistry();
    registry.register(descriptor("orion.runtime.zeta"));
    registry.register(descriptor("orion.runtime.alpha"));

    const inspection = registry.inspect();

    expect(inspection.map(({ id }) => id)).toEqual([
      "orion.runtime.alpha",
      "orion.runtime.zeta",
    ]);
    expect(Object.isFrozen(inspection)).toBe(true);
    expect(inspection.every(Object.isFrozen)).toBe(true);
  });
});
