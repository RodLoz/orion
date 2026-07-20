import {
  ContextLineageNotFoundError,
  ContextValidationFailureError,
  InvalidContextInputError,
  InvalidContextLifecycleTransitionError,
  InvalidIdentityContextProjectionError,
  anonymousCurrentIdentity,
  authenticatedCurrentIdentity,
  identityIdentifier,
  type ComposeContextRevision,
  type ContextConstructionValues,
  type GetActiveContextRevision,
} from "@orion/core";
import { describe, expect, it } from "vitest";

import {
  ContextEngine,
  ContextEngineInitializationError,
  ContextEngineLifecycleError,
} from "../src/index.js";

class TestConstructionValues implements ContextConstructionValues {
  #lineage = 0;
  #revision = 0;
  #time = 0;

  public nextLineageIdentity(): unknown {
    this.#lineage += 1;
    return `orion.context.lineage.${this.#lineage}`;
  }

  public nextRevisionIdentity(): unknown {
    this.#revision += 1;
    return `orion.context.revision.${this.#revision}`;
  }

  public nextCreatedAt(): unknown {
    this.#time += 1;
    return new Date(Date.UTC(2026, 6, 20, 0, 0, this.#time)).toISOString();
  }
}

function runningEngine(
  construction: ContextConstructionValues = new TestConstructionValues(),
): ContextEngine {
  const engine = new ContextEngine(construction);
  engine.initialize();
  engine.start();
  return engine;
}

function verifyContracts(
  composer: ComposeContextRevision,
  reader: GetActiveContextRevision,
): void {
  const revision = composer.composeContextRevision({
    target: { kind: "new-lineage" },
    currentIdentity: anonymousCurrentIdentity(),
  });
  expect(
    reader.getActiveContextRevision({
      lineageIdentity: revision.lineageIdentity,
    }),
  ).toBe(revision);
}

describe("ContextEngine", () => {
  it("implements the Core-custodied M2 Contracts", () => {
    const engine = runningEngine();
    verifyContracts(engine, engine);
  });

  it("creates and activates the first immutable Anonymous revision", () => {
    const revision = runningEngine().composeContextRevision({
      target: { kind: "new-lineage" },
      currentIdentity: anonymousCurrentIdentity(),
    });

    expect(revision).toMatchObject({
      lineageIdentity: "orion.context.lineage.1",
      revisionIdentity: "orion.context.revision.1",
      revisionNumber: 1,
      lifecycleState: "active",
      creationMetadata: { sourceCount: 1, fragmentCount: 1 },
      fragments: [
        {
          kind: "identity",
          authoritativeOwner: "identity",
          projection: {
            state: "anonymous",
            authoritativeOwner: "identity",
          },
        },
      ],
    });
    expect(revision).not.toHaveProperty("parentRevisionIdentity");
    expect(Object.isFrozen(revision)).toBe(true);
    expect(Object.isFrozen(revision.creationMetadata)).toBe(true);
    expect(Object.isFrozen(revision.fragments)).toBe(true);
    expect(Object.isFrozen(revision.fragments[0])).toBe(true);
    expect(Object.isFrozen(revision.fragments[0].projection)).toBe(true);
  });

  it("creates a privacy-minimal Authenticated projection", () => {
    const revision = runningEngine().composeContextRevision({
      target: { kind: "new-lineage" },
      currentIdentity: authenticatedCurrentIdentity(
        identityIdentifier("orion.identity.known"),
      ),
    });
    expect(revision.fragments[0].projection).toEqual({
      state: "authenticated",
      authoritativeOwner: "identity",
      identityIdentifier: "orion.identity.known",
    });
    expect(revision.fragments[0].projection).not.toHaveProperty(
      "resolutionReference",
    );
  });

  it("evolves a lineage without mutating prior cognitive content", () => {
    const engine = runningEngine();
    const first = engine.composeContextRevision({
      target: { kind: "new-lineage" },
      currentIdentity: anonymousCurrentIdentity(),
    });
    const firstContent = JSON.stringify({
      fragments: first.fragments,
      creationMetadata: first.creationMetadata,
    });

    const successor = engine.composeContextRevision({
      target: {
        kind: "existing-lineage",
        lineageIdentity: first.lineageIdentity,
        expectedActiveRevisionIdentity: first.revisionIdentity,
      },
      currentIdentity: authenticatedCurrentIdentity(
        identityIdentifier("orion.identity.known"),
      ),
    });

    expect(successor.lineageIdentity).toBe(first.lineageIdentity);
    expect(successor.revisionIdentity).not.toBe(first.revisionIdentity);
    expect(successor.revisionNumber).toBe(2);
    expect(successor.parentRevisionIdentity).toBe(first.revisionIdentity);
    expect(successor.lifecycleState).toBe("active");
    expect(first.lifecycleState).toBe("expired");
    expect(
      JSON.stringify({
        fragments: first.fragments,
        creationMetadata: first.creationMetadata,
      }),
    ).toBe(firstContent);
    expect(
      engine.getActiveContextRevision({
        lineageIdentity: first.lineageIdentity,
      }),
    ).toBe(successor);
  });

  it("returns the current revision when relevant Identity has not changed", () => {
    const engine = runningEngine();
    const first = engine.composeContextRevision({
      target: { kind: "new-lineage" },
      currentIdentity: anonymousCurrentIdentity(),
    });
    const unchanged = engine.composeContextRevision({
      target: {
        kind: "existing-lineage",
        lineageIdentity: first.lineageIdentity,
        expectedActiveRevisionIdentity: first.revisionIdentity,
      },
      currentIdentity: anonymousCurrentIdentity(),
    });
    expect(unchanged).toBe(first);
    expect(first.lifecycleState).toBe("active");
  });

  it("rejects stale successor creation without replacing Active Context", () => {
    const engine = runningEngine();
    const first = engine.composeContextRevision({
      target: { kind: "new-lineage" },
      currentIdentity: anonymousCurrentIdentity(),
    });
    expect(() =>
      engine.composeContextRevision({
        target: {
          kind: "existing-lineage",
          lineageIdentity: first.lineageIdentity,
          expectedActiveRevisionIdentity: "orion.context.revision.stale",
        },
        currentIdentity: authenticatedCurrentIdentity(
          identityIdentifier("orion.identity.known"),
        ),
      }),
    ).toThrow(InvalidContextLifecycleTransitionError);
    expect(first.lifecycleState).toBe("active");
  });

  it("distinguishes an unknown lineage", () => {
    expect(() =>
      runningEngine().getActiveContextRevision({
        lineageIdentity: "orion.context.lineage.unknown",
      }),
    ).toThrow(ContextLineageNotFoundError);
  });

  it.each([null, undefined, 1, "request", [], new Date(), {}, { target: {} }])(
    "rejects malformed Compose input without native exceptions",
    (request) => {
      expect(() => runningEngine().composeContextRevision(request)).toThrow(
        InvalidContextInputError,
      );
    },
  );

  it.each([
    null,
    undefined,
    1,
    "request",
    [],
    new Date(),
    {},
    { lineageIdentity: "valid.id", extra: true },
  ])(
    "rejects malformed Get Active input without native exceptions",
    (request) => {
      expect(() => runningEngine().getActiveContextRevision(request)).toThrow(
        InvalidContextInputError,
      );
    },
  );

  it.each([
    null,
    undefined,
    {},
    { kind: "unknown" },
    { kind: "new-lineage", extra: true },
    { kind: "existing-lineage" },
  ])("rejects malformed compose targets", (target) => {
    expect(() =>
      runningEngine().composeContextRevision({
        target,
        currentIdentity: anonymousCurrentIdentity(),
      }),
    ).toThrow(InvalidContextInputError);
  });

  it("rejects coercible lineage identities without converting them", () => {
    expect(() =>
      runningEngine().composeContextRevision({
        target: {
          kind: "existing-lineage",
          lineageIdentity: { toString: () => "orion.context.lineage.1" },
          expectedActiveRevisionIdentity: "orion.context.revision.1",
        },
        currentIdentity: anonymousCurrentIdentity(),
      }),
    ).toThrow(InvalidContextInputError);
  });

  it.each([
    null,
    undefined,
    {},
    [],
    { state: "unknown" },
    { state: "anonymous", identityIdentifier: "orion.identity.invalid" },
    { state: "authenticated" },
    { state: "authenticated", identityIdentifier: 42 },
    {
      state: "authenticated",
      identityIdentifier: { toString: () => "orion.identity.coerced" },
    },
  ])("rejects malformed Identity projections", (currentIdentity) => {
    expect(() =>
      runningEngine().composeContextRevision({
        target: { kind: "new-lineage" },
        currentIdentity,
      }),
    ).toThrow(InvalidIdentityContextProjectionError);
  });

  it("normalizes invalid construction values", () => {
    const engine = runningEngine({
      nextLineageIdentity: () => ({ toString: () => "valid.lineage" }),
      nextRevisionIdentity: () => "valid.revision",
      nextCreatedAt: () => "2026-07-20T00:00:00.000Z",
    });
    expect(() =>
      engine.composeContextRevision({
        target: { kind: "new-lineage" },
        currentIdentity: anonymousCurrentIdentity(),
      }),
    ).toThrow(ContextValidationFailureError);
  });

  it("normalizes unexpected construction failures at the Engine boundary", () => {
    const engine = runningEngine({
      nextLineageIdentity: () => {
        throw new TypeError("implementation detail");
      },
      nextRevisionIdentity: () => "valid.revision",
      nextCreatedAt: () => "2026-07-20T00:00:00.000Z",
    });
    expect(() =>
      engine.composeContextRevision({
        target: { kind: "new-lineage" },
        currentIdentity: anonymousCurrentIdentity(),
      }),
    ).toThrow(ContextValidationFailureError);
  });

  it("rejects duplicate Revision Identities before expiring the current revision", () => {
    const construction: ContextConstructionValues = {
      nextLineageIdentity: () => "orion.context.lineage.duplicate-test",
      nextRevisionIdentity: () => "orion.context.revision.duplicate",
      nextCreatedAt: () => "2026-07-20T00:00:00.000Z",
    };
    const engine = runningEngine(construction);
    const first = engine.composeContextRevision({
      target: { kind: "new-lineage" },
      currentIdentity: anonymousCurrentIdentity(),
    });

    expect(() =>
      engine.composeContextRevision({
        target: {
          kind: "existing-lineage",
          lineageIdentity: first.lineageIdentity,
          expectedActiveRevisionIdentity: first.revisionIdentity,
        },
        currentIdentity: authenticatedCurrentIdentity(
          identityIdentifier("orion.identity.known"),
        ),
      }),
    ).toThrow(ContextValidationFailureError);
    expect(first.lifecycleState).toBe("active");
  });

  it("enforces the minimal Engine lifecycle", () => {
    const engine = new ContextEngine(new TestConstructionValues());
    expect(engine.engineState).toBe("initialize");
    expect(() => engine.start()).toThrow(ContextEngineLifecycleError);
    engine.initialize();
    expect(engine.engineState).toBe("ready");
    engine.start();
    expect(engine.engineState).toBe("running");
    engine.stop();
    expect(engine.engineState).toBe("stopped");
    expect(() => engine.composeContextRevision({})).toThrow(
      ContextEngineLifecycleError,
    );
  });

  it("rejects an invalid construction abstraction", () => {
    expect(() => new ContextEngine(null as never)).toThrow(
      ContextEngineInitializationError,
    );
  });
});
