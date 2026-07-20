import {
  IdentitySourceUnavailableError,
  identityResolutionReference,
} from "@orion/core";
import { describe, expect, it } from "vitest";

import { InMemoryIdentitySource } from "../src/identity/in-memory-identity-source.js";

const KNOWN_REFERENCE = identityResolutionReference("known-reference");
const UNKNOWN_REFERENCE = identityResolutionReference("unknown-reference");

describe("InMemoryIdentitySource", () => {
  it("resolves deterministic candidate Identity evidence", () => {
    const source = new InMemoryIdentitySource([
      {
        resolutionReference: KNOWN_REFERENCE,
        candidateIdentityIdentifier: "orion.identity.known",
      },
    ]);

    expect(source.resolveIdentity(KNOWN_REFERENCE)).toEqual({
      status: "found",
      candidateIdentityIdentifier: "orion.identity.known",
    });
    expect(source.resolveIdentity(KNOWN_REFERENCE)).toEqual(
      source.resolveIdentity(KNOWN_REFERENCE),
    );
  });

  it("distinguishes an unknown reference", () => {
    const source = new InMemoryIdentitySource([]);

    expect(source.resolveIdentity(UNKNOWN_REFERENCE)).toEqual({
      status: "not-found",
    });
  });

  it("provides deterministic unavailable behavior", () => {
    const source = new InMemoryIdentitySource([], false);

    expect(() => source.resolveIdentity(KNOWN_REFERENCE)).toThrow(
      IdentitySourceUnavailableError,
    );
  });
});
