import { describe, expect, it } from "vitest";

import {
  InvalidContextCreatedAtError,
  InvalidContextLifecycleStateError,
  InvalidContextLineageIdentityError,
  InvalidContextRevisionIdentityError,
  InvalidContextRevisionNumberError,
  contextCreatedAt,
  contextLifecycleState,
  contextLineageIdentity,
  contextRevisionIdentity,
  contextRevisionNumber,
  type ContextLifecycleState,
} from "../src/index.js";

describe("Context domain Contracts", () => {
  it("validates opaque Context identities without coercion", () => {
    expect(contextLineageIdentity("orion.context.lineage.1")).toBe(
      "orion.context.lineage.1",
    );
    expect(contextRevisionIdentity("orion.context.revision.1")).toBe(
      "orion.context.revision.1",
    );
  });

  it.each(["", "Context Lineage", "context:lineage"])(
    "rejects invalid Context Lineage Identity %j",
    (value) => {
      expect(() => contextLineageIdentity(value)).toThrow(
        InvalidContextLineageIdentityError,
      );
    },
  );

  it.each(["", "Context Revision", "context:revision"])(
    "rejects invalid Context Revision Identity %j",
    (value) => {
      expect(() => contextRevisionIdentity(value)).toThrow(
        InvalidContextRevisionIdentityError,
      );
    },
  );

  it.each([null, undefined, 42, true, {}, { toString: () => "valid.id" }])(
    "rejects non-string Context identities without coercion",
    (value) => {
      expect(() => contextLineageIdentity(value)).toThrow(
        InvalidContextLineageIdentityError,
      );
      expect(() => contextRevisionIdentity(value)).toThrow(
        InvalidContextRevisionIdentityError,
      );
    },
  );

  it("accepts only positive safe integer Revision Numbers", () => {
    expect(contextRevisionNumber(1)).toBe(1);
    expect(contextRevisionNumber(Number.MAX_SAFE_INTEGER)).toBe(
      Number.MAX_SAFE_INTEGER,
    );
  });

  it.each([0, -1, 1.5, Number.NaN, Number.POSITIVE_INFINITY, "1", null])(
    "rejects invalid Revision Number %j",
    (value) => {
      expect(() => contextRevisionNumber(value)).toThrow(
        InvalidContextRevisionNumberError,
      );
    },
  );

  it("defines the canonical lifecycle without Updating", () => {
    const states: readonly ContextLifecycleState[] = [
      "collecting",
      "composing",
      "validating",
      "active",
      "expired",
      "archived",
    ];
    expect(states.map(contextLifecycleState)).toEqual(states);
    expect(() => contextLifecycleState("updating")).toThrow(
      InvalidContextLifecycleStateError,
    );
  });

  it("validates deterministic UTC creation metadata", () => {
    expect(contextCreatedAt("2026-07-20T00:00:00.000Z")).toBe(
      "2026-07-20T00:00:00.000Z",
    );
    expect(() => contextCreatedAt("2026-07-20")).toThrow(
      InvalidContextCreatedAtError,
    );
    expect(() => contextCreatedAt("2026-99-20T00:00:00.000Z")).toThrow(
      InvalidContextCreatedAtError,
    );
    expect(() =>
      contextCreatedAt({ toString: () => "2026-07-20T00:00:00Z" }),
    ).toThrow(InvalidContextCreatedAtError);
  });

  it("keeps validation failures privacy-safe", () => {
    const secret = "context-secret-value";
    try {
      contextLineageIdentity(secret);
    } catch (error: unknown) {
      expect(error).toBeInstanceOf(InvalidContextLineageIdentityError);
      expect((error as Error).message).not.toContain(secret);
    }
  });
});
