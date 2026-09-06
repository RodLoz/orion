import {
  propositionIdentity,
  type KnowledgeConstructionValues,
  type PropositionIdentity,
} from "@orion/core";

export class DeterministicKnowledgeConstructionValues implements KnowledgeConstructionValues {
  #identityIndex = 0;
  #acceptedAtIndex = 0;
  #propositionIndex = 0;

  public constructor(
    private readonly identities: readonly unknown[] = [
      "orion.knowledge.m4.1",
      "orion.knowledge.m4.2",
    ],
    private readonly acceptedAtValues: readonly unknown[] = [
      "2026-07-20T13:00:00.000Z",
      "2026-07-20T13:01:00.000Z",
    ],
  ) {}

  public nextKnowledgeIdentity(): unknown {
    return this.identities[this.#identityIndex++];
  }

  public nextAcceptedAt(): unknown {
    return this.acceptedAtValues[this.#acceptedAtIndex++];
  }

  public nextPropositionIdentity(): PropositionIdentity {
    this.#propositionIndex += 1;
    return propositionIdentity(`orion.proposition.${this.#propositionIndex}`);
  }
}
