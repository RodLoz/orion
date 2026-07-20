import {
  IdentitySourceUnavailableError,
  type IdentityResolutionReference,
  type IdentitySource,
  type IdentitySourceResolution,
} from "@orion/core";

export interface InMemoryIdentityRecord {
  readonly resolutionReference: string;
  readonly candidateIdentityIdentifier: string;
}

export class InMemoryIdentitySource implements IdentitySource {
  readonly #records: ReadonlyMap<string, string>;

  public constructor(
    records: readonly InMemoryIdentityRecord[],
    private readonly available = true,
  ) {
    this.#records = new Map(
      records.map(({ resolutionReference, candidateIdentityIdentifier }) => [
        resolutionReference,
        candidateIdentityIdentifier,
      ]),
    );
  }

  public resolveIdentity(
    reference: IdentityResolutionReference,
  ): IdentitySourceResolution {
    if (!this.available) {
      throw new IdentitySourceUnavailableError();
    }

    const candidateIdentityIdentifier = this.#records.get(reference);
    if (candidateIdentityIdentifier === undefined) {
      return Object.freeze({ status: "not-found" });
    }

    return Object.freeze({
      status: "found",
      candidateIdentityIdentifier,
    });
  }
}
