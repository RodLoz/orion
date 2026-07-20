import type { MemoryConstructionValues } from "@orion/core";

export class DeterministicMemoryConstructionValues implements MemoryConstructionValues {
  #identityIndex = 0;
  #retainedAtIndex = 0;
  #retrievedAtIndex = 0;

  public constructor(
    private readonly identities: readonly unknown[] = ["orion.memory.m3.1"],
    private readonly retainedAtValues: readonly unknown[] = [
      "2026-07-20T12:00:00.000Z",
    ],
    private readonly retrievedAtValues: readonly unknown[] = [
      "2026-07-20T12:01:00.000Z",
      "2026-07-20T12:02:00.000Z",
    ],
  ) {}

  public nextMemoryIdentity(): unknown {
    return this.identities[this.#identityIndex++];
  }
  public nextRetainedAt(): unknown {
    return this.retainedAtValues[this.#retainedAtIndex++];
  }
  public nextRetrievedAt(): unknown {
    return this.retrievedAtValues[this.#retrievedAtIndex++];
  }
}
