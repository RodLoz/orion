import {
  DuplicateCapabilityIdentifierError,
  type CapabilityDescriptor,
  type CapabilityIdentifier,
  type CapabilityRegistry,
} from "@orion/core";

function immutableDescriptor(
  descriptor: CapabilityDescriptor,
): CapabilityDescriptor {
  return Object.freeze({ ...descriptor });
}

export class RuntimeCapabilityRegistry implements CapabilityRegistry {
  readonly #capabilities = new Map<
    CapabilityIdentifier,
    CapabilityDescriptor
  >();

  public register(descriptor: CapabilityDescriptor): void {
    if (this.#capabilities.has(descriptor.id)) {
      throw new DuplicateCapabilityIdentifierError(descriptor.id);
    }

    this.#capabilities.set(descriptor.id, immutableDescriptor(descriptor));
  }

  public inspect(): readonly CapabilityDescriptor[] {
    return Object.freeze(
      [...this.#capabilities.values()]
        .sort((left, right) => left.id.localeCompare(right.id))
        .map(immutableDescriptor),
    );
  }

  public get(
    identifier: CapabilityIdentifier,
  ): CapabilityDescriptor | undefined {
    return this.#capabilities.get(identifier);
  }
}
