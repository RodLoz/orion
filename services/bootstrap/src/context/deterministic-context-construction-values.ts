import type { ContextConstructionValues } from "@orion/core";

export class DeterministicContextConstructionValues implements ContextConstructionValues {
  #lineageSequence = 0;
  #revisionSequence = 0;
  #creationSequence = 0;

  public nextLineageIdentity(): string {
    this.#lineageSequence += 1;
    return `orion.context.lineage.${this.#lineageSequence}`;
  }

  public nextRevisionIdentity(): string {
    this.#revisionSequence += 1;
    return `orion.context.revision.${this.#revisionSequence}`;
  }

  public nextCreatedAt(): string {
    this.#creationSequence += 1;
    return new Date(
      Date.UTC(2026, 6, 20, 0, 0, this.#creationSequence),
    ).toISOString();
  }
}
