export type CapabilityIdentifier = string & {
  readonly __capabilityIdentifier: unique symbol;
};

export type CapabilityAvailability = "available";

export interface CapabilityDescriptor {
  readonly id: CapabilityIdentifier;
  readonly name: string;
  readonly version: string;
  readonly availability: CapabilityAvailability;
}

const CAPABILITY_IDENTIFIER_PATTERN = /^[a-z][a-z0-9]*(?:[.-][a-z0-9]+)*$/;

export function capabilityIdentifier(value: string): CapabilityIdentifier {
  if (!CAPABILITY_IDENTIFIER_PATTERN.test(value)) {
    throw new InvalidCapabilityIdentifierError(value);
  }

  return value as CapabilityIdentifier;
}

export class InvalidCapabilityIdentifierError extends Error {
  public constructor(value: string) {
    super(`Invalid capability identifier: ${value}`);
    this.name = "InvalidCapabilityIdentifierError";
  }
}
