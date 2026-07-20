import {
  capabilityIdentifier,
  type CapabilityDescriptor,
  type CapabilityRegistry,
} from "@orion/core";
import { describe, expect, it } from "vitest";

import { RuntimeCapabilityRegistry } from "../src/capability-registry.js";

function verifyRegistryContract(
  createRegistry: () => CapabilityRegistry,
): void {
  it("preserves registered public metadata without exposing mutable state", () => {
    const registry = createRegistry();
    const input: CapabilityDescriptor = {
      id: capabilityIdentifier("orion.contract.sample"),
      name: "Contract Sample",
      version: "1.0.0",
      availability: "available",
    };

    registry.register(input);
    const [registered] = registry.inspect();

    expect(registered).toEqual(input);
    expect(registered).not.toBe(input);
    expect(Object.isFrozen(registered)).toBe(true);
  });
}

describe("RuntimeCapabilityRegistry contract", () => {
  verifyRegistryContract(() => new RuntimeCapabilityRegistry());
});
