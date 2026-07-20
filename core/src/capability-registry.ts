import type {
  CapabilityDescriptor,
  CapabilityIdentifier,
} from "./capability.js";

export interface CapabilityRegistry {
  register(descriptor: CapabilityDescriptor): void;
  inspect(): readonly CapabilityDescriptor[];
  get(identifier: CapabilityIdentifier): CapabilityDescriptor | undefined;
}

export class DuplicateCapabilityIdentifierError extends Error {
  public constructor(identifier: CapabilityIdentifier) {
    super(`Capability already registered: ${identifier}`);
    this.name = "DuplicateCapabilityIdentifierError";
  }
}
