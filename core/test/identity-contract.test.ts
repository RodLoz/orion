import { describe, expect, it } from "vitest";

import {
  InvalidIdentityIdentifierError,
  InvalidIdentityResolutionReferenceError,
  anonymousCurrentIdentity,
  authenticatedCurrentIdentity,
  identityIdentifier,
  identityResolutionReference,
  type IdentityState,
} from "../src/index.js";

describe("Identity domain Contracts", () => {
  it("accepts a valid opaque Identity Identifier", () => {
    expect(identityIdentifier("orion.identity.sample")).toBe(
      "orion.identity.sample",
    );
  });

  it.each(["", "Identity Sample", "provider:sample"])(
    "rejects invalid Identity Identifier %j without reflecting it",
    (value) => {
      expect(() => identityIdentifier(value)).toThrow(
        InvalidIdentityIdentifierError,
      );
      expect(() => identityIdentifier(value)).toThrow(
        "Identity identifier is invalid.",
      );
    },
  );

  it.each([
    ["number", 42],
    ["boolean", true],
    ["object", {}],
    ["null", null],
    ["undefined", undefined],
    ["coercible object", { toString: () => "orion.identity.coerced" }],
  ])("rejects a non-string Identity Identifier (%s)", (_name, value) => {
    expect(() => identityIdentifier(value)).toThrow(
      InvalidIdentityIdentifierError,
    );
  });

  it("defines the closed M1 Identity State model", () => {
    const states: readonly IdentityState[] = ["anonymous", "authenticated"];

    expect(states).toEqual(["anonymous", "authenticated"]);
  });

  it("creates immutable, discriminated Current Identity values", () => {
    const anonymous = anonymousCurrentIdentity();
    const authenticated = authenticatedCurrentIdentity(
      identityIdentifier("orion.identity.sample"),
    );

    expect(anonymous).toEqual({ state: "anonymous" });
    expect(authenticated).toEqual({
      state: "authenticated",
      identityIdentifier: "orion.identity.sample",
    });
    expect(Object.isFrozen(anonymous)).toBe(true);
    expect(Object.isFrozen(authenticated)).toBe(true);
    expect("identityIdentifier" in anonymous).toBe(false);
  });

  it("validates opaque resolution references without exposing their meaning", () => {
    expect(identityResolutionReference("opaque-reference")).toBe(
      "opaque-reference",
    );
    expect(() => identityResolutionReference(" ")).toThrow(
      InvalidIdentityResolutionReferenceError,
    );
    expect(() => identityResolutionReference(`x${"y".repeat(256)}`)).toThrow(
      InvalidIdentityResolutionReferenceError,
    );
  });

  it.each([
    ["number", 42],
    ["boolean", false],
    ["object", {}],
    ["null", null],
    ["undefined", undefined],
    ["coercible object", { toString: () => "opaque-reference" }],
  ])("rejects a non-string resolution reference (%s)", (_name, value) => {
    expect(() => identityResolutionReference(value)).toThrow(
      InvalidIdentityResolutionReferenceError,
    );
  });
});
