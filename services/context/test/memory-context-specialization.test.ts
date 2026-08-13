import {
  InvalidContextAuthorityRequestError,
  InvalidMemoryContextProjectionError,
  InvalidMemoryIdentityError,
  InvalidMemoryInputError,
  InvalidMemoryStateError,
  MemoryNotFoundError,
  MemoryStoreUnavailableError,
  anonymousCurrentIdentity,
  createMemoryReference,
  type ContextConstructionValues,
  type GetMemory,
  type MemoryReference,
  type ResolveCurrentIdentity,
  type RetrievedMemory,
} from "@orion/core";
import { describe, expect, it, vi } from "vitest";

import {
  ContextEngine,
  ContextEngineInitializationError,
} from "../src/index.js";

class Values implements ContextConstructionValues {
  #lineage = 0;
  #revision = 0;
  #time = 0;

  public nextLineageIdentity(): unknown {
    this.#lineage += 1;
    return `orion.context.memory.lineage.${this.#lineage}`;
  }

  public nextRevisionIdentity(): unknown {
    this.#revision += 1;
    return `orion.context.memory.revision.${this.#revision}`;
  }

  public nextCreatedAt(): unknown {
    this.#time += 1;
    return new Date(Date.UTC(2026, 7, 11, 1, 0, this.#time)).toISOString();
  }
}

function reference(identity = "orion.memory.1"): MemoryReference {
  return createMemoryReference(identity);
}

function result(
  memoryReference: MemoryReference = reference(),
  transientMemory: object = Object.freeze({ privateContent: "source-owned" }),
  retrievedAt = "2026-08-11T01:00:00.000Z",
): RetrievedMemory {
  return Object.freeze({
    memory: transientMemory as never,
    receipt: Object.freeze({
      memoryReference,
      retrievedAt: retrievedAt as never,
      purpose: "continuity" as const,
    }),
  });
}

function running(
  getMemory?: GetMemory,
  identityResolver: ResolveCurrentIdentity = {
    resolveCurrentIdentity: () => anonymousCurrentIdentity(),
  },
): ContextEngine {
  const engine = new ContextEngine(
    new Values(),
    identityResolver,
    undefined,
    getMemory,
  );
  engine.initialize();
  engine.start();
  return engine;
}

function prepare(
  engine: ContextEngine,
  memoryRetrievalRequest: unknown = {
    memoryIdentity: "orion.memory.1",
    purpose: "continuity",
  },
) {
  return engine.prepareContextRevisionWithMemory({
    target: { kind: "new-lineage" },
    identityResolutionRequest: {},
    memoryRetrievalRequest: memoryRetrievalRequest as never,
  });
}

describe("Context Memory specialization", () => {
  it("preserves existing profiles and requires Memory only for Memory-aware preparation", () => {
    const engine = running();
    const identityOnly = engine.prepareContextRevision({
      target: { kind: "new-lineage" },
      identityResolutionRequest: {},
    });

    expect(identityOnly.fragments.map(({ kind }) => kind)).toEqual([
      "identity",
    ]);
    expect(identityOnly.creationMetadata).toMatchObject({
      sourceCount: 1,
      fragmentCount: 1,
    });
    expect(() => prepare(engine)).toThrowError(
      new ContextEngineInitializationError(),
    );
  });

  it("forwards exact opaque Identity and Memory requests", () => {
    const identityRequest = Object.freeze({ identityOpaque: true });
    const memoryRequest = new Proxy(
      { memoryIdentity: "must-not-be-read", purpose: "must-not-be-read" },
      {
        get() {
          throw new Error("Context inspected Memory request semantics.");
        },
      },
    );
    const resolveCurrentIdentity = vi.fn((request: unknown) => {
      expect(request).toBe(identityRequest);
      return anonymousCurrentIdentity();
    });
    const getMemory = vi.fn((request: unknown) => {
      expect(request).toBe(memoryRequest);
      return result();
    });
    const engine = running({ getMemory }, { resolveCurrentIdentity });

    const revision = engine.prepareContextRevisionWithMemory({
      target: { kind: "new-lineage" },
      identityResolutionRequest: identityRequest as never,
      memoryRetrievalRequest: memoryRequest as never,
    });

    expect(resolveCurrentIdentity).toHaveBeenCalledOnce();
    expect(getMemory).toHaveBeenCalledOnce();
    expect(revision.lifecycleState).toBe("active");
  });

  it("keeps candidate availability before incorporation and hands off the exact MemoryReference", () => {
    const events: string[] = [];
    const holder: { engine?: ContextEngine } = {};
    const sourceReference = reference();
    const getMemory = vi.fn(() => {
      events.push("memory-candidate-available");
      expect(() =>
        holder.engine?.getActiveContextRevision({
          lineageIdentity: "orion.context.memory.lineage.1",
        }),
      ).toThrow();
      return result(sourceReference);
    });
    const engine = running({ getMemory });
    holder.engine = engine;
    const original = engine.composeContextRevisionWithMemory.bind(engine);
    engine.composeContextRevisionWithMemory = ((request: unknown) => {
      events.push("incorporation");
      expect((request as { memoryReference: unknown }).memoryReference).toBe(
        sourceReference,
      );
      return original(request);
    }) as typeof engine.composeContextRevisionWithMemory;

    prepare(engine);

    expect(events).toEqual(["memory-candidate-available", "incorporation"]);
  });

  it("creates only a distinct immutable Memory projection in canonical order", () => {
    const sourceReference = reference();
    const sourceRecord = Object.freeze({
      content: "not Context",
      provenance: "not Context",
      retainedAt: "not Context",
    });
    const revision = prepare(
      running({ getMemory: () => result(sourceReference, sourceRecord) }),
    );

    expect(revision.creationMetadata).toMatchObject({
      sourceCount: 2,
      fragmentCount: 2,
    });
    expect(revision.fragments.map(({ kind }) => kind)).toEqual([
      "identity",
      "memory",
    ]);
    const memoryFragment = revision.fragments[1];
    if (memoryFragment?.kind !== "memory") throw new Error();
    expect(memoryFragment).toEqual({
      kind: "memory",
      authoritativeOwner: "memory",
      projection: {
        memoryIdentity: "orion.memory.1",
        kind: "episodic",
        lifecycleState: "stored",
        authoritativeOwner: "memory",
      },
    });
    expect(memoryFragment.projection).not.toBe(sourceReference);
    expect(Object.isFrozen(revision)).toBe(true);
    expect(Object.isFrozen(revision.fragments)).toBe(true);
    expect(Object.isFrozen(memoryFragment)).toBe(true);
    expect(Object.isFrozen(memoryFragment.projection)).toBe(true);
    expect(JSON.stringify(revision)).not.toContain("not Context");
    expect(JSON.stringify(revision)).not.toContain("retrievedAt");
    expect(JSON.stringify(revision)).not.toContain("purpose");
  });

  it.each([
    new InvalidMemoryInputError(),
    new InvalidMemoryIdentityError(),
    new MemoryNotFoundError(),
    new MemoryStoreUnavailableError(),
    new InvalidMemoryStateError(),
  ])(
    "propagates exact Memory failure $name without Context state",
    (failure) => {
      const engine = running({
        getMemory: () => {
          throw failure;
        },
      });

      let caught: unknown;
      try {
        prepare(engine);
      } catch (error: unknown) {
        caught = error;
      }
      expect(caught).toBe(failure);
      expect(() =>
        engine.getActiveContextRevision({
          lineageIdentity: "orion.context.memory.lineage.1",
        }),
      ).toThrow();
    },
  );

  it("rejects malformed candidate material as a Context-owned projection failure", () => {
    const malformed = Object.freeze({
      memory: Object.freeze({ content: "source-owned" }),
      receipt: Object.freeze({
        memoryReference: Object.freeze({
          memoryIdentity: "orion.memory.1",
          kind: "episodic",
          authoritativeCapability: "not-memory",
          lifecycleState: "stored",
        }),
        retrievedAt: "transient",
        purpose: "continuity",
      }),
    });
    const engine = running({ getMemory: () => malformed as never });

    expect(() => prepare(engine)).toThrow(InvalidMemoryContextProjectionError);
    expect(() =>
      engine.getActiveContextRevision({
        lineageIdentity: "orion.context.memory.lineage.1",
      }),
    ).toThrow();
  });

  it("preserves an existing Active revision after Memory failure or malformed material", () => {
    const failure = new MemoryStoreUnavailableError();
    const getMemory = vi
      .fn()
      .mockReturnValueOnce(result())
      .mockImplementationOnce(() => {
        throw failure;
      })
      .mockReturnValueOnce({ memory: {}, receipt: {} });
    const engine = running({ getMemory });
    const first = prepare(engine);
    const target = {
      kind: "existing-lineage" as const,
      lineageIdentity: first.lineageIdentity,
      expectedActiveRevisionIdentity: first.revisionIdentity,
    };

    expect(() =>
      engine.prepareContextRevisionWithMemory({
        target,
        identityResolutionRequest: {},
        memoryRetrievalRequest: {},
      }),
    ).toThrow(failure);
    expect(() =>
      engine.prepareContextRevisionWithMemory({
        target,
        identityResolutionRequest: {},
        memoryRetrievalRequest: {},
      }),
    ).toThrow(InvalidMemoryContextProjectionError);
    expect(
      engine.getActiveContextRevision({
        lineageIdentity: first.lineageIdentity,
      }),
    ).toBe(first);
    expect(first.lifecycleState).toBe("active");
    expect(Object.isFrozen(first)).toBe(true);
  });

  it("reuses semantic Memory content despite transient candidate differences", () => {
    const getMemory = vi
      .fn()
      .mockReturnValueOnce(
        result(reference(), { allocation: 1 }, "2026-08-11T01:00:01Z"),
      )
      .mockReturnValueOnce(
        result(reference(), { allocation: 2 }, "2026-08-11T01:00:02Z"),
      );
    const engine = running({ getMemory });
    const first = prepare(engine);
    const unchanged = engine.prepareContextRevisionWithMemory({
      target: {
        kind: "existing-lineage",
        lineageIdentity: first.lineageIdentity,
        expectedActiveRevisionIdentity: first.revisionIdentity,
      },
      identityResolutionRequest: {},
      memoryRetrievalRequest: {
        memoryIdentity: "orion.memory.1",
        purpose: "user-requested-recall",
      },
    });

    expect(unchanged).toBe(first);
  });

  it("creates a successor when the incorporated Memory identity changes", () => {
    const getMemory = vi
      .fn()
      .mockReturnValueOnce(result())
      .mockReturnValueOnce(result(reference("orion.memory.2")));
    const engine = running({ getMemory });
    const first = prepare(engine);
    const successor = engine.prepareContextRevisionWithMemory({
      target: {
        kind: "existing-lineage",
        lineageIdentity: first.lineageIdentity,
        expectedActiveRevisionIdentity: first.revisionIdentity,
      },
      identityResolutionRequest: {},
      memoryRetrievalRequest: {
        memoryIdentity: "orion.memory.2",
        purpose: "continuity",
      },
    });

    expect(successor).not.toBe(first);
    expect(successor.parentRevisionIdentity).toBe(first.revisionIdentity);
    expect(successor.revisionNumber).toBe(2);
    expect(successor.fragments[1]).toMatchObject({
      kind: "memory",
      projection: { memoryIdentity: "orion.memory.2" },
    });
  });

  it("rejects unsupported Memory profile structures at the authority boundary", () => {
    const engine = running({ getMemory: () => result() });
    const valid = prepare(engine);
    const baseRequest = {
      intent: "verify-active-context-revision-authority" as const,
      expectedLineageIdentity: valid.lineageIdentity,
      expectedRevisionIdentity: valid.revisionIdentity,
      expectedRevisionNumber: valid.revisionNumber,
    };
    const identity = structuredClone(valid.fragments[0]);
    const memory = structuredClone(valid.fragments[1]);
    const malformed = [
      {
        ...structuredClone(valid),
        creationMetadata: { ...valid.creationMetadata, sourceCount: 1 },
      },
      { ...structuredClone(valid), fragments: [memory] },
      { ...structuredClone(valid), fragments: [memory, identity] },
      {
        ...structuredClone(valid),
        creationMetadata: {
          ...valid.creationMetadata,
          sourceCount: 3,
          fragmentCount: 3,
        },
        fragments: [identity, memory, memory],
      },
      {
        ...structuredClone(valid),
        creationMetadata: {
          ...valid.creationMetadata,
          sourceCount: 3,
          fragmentCount: 3,
        },
        fragments: [identity, { ...memory, kind: "knowledge" }, memory],
      },
    ];

    for (const candidate of malformed) {
      expect(() =>
        engine.verifyActiveContextRevisionAuthority({
          ...baseRequest,
          candidate: candidate as never,
        }),
      ).toThrow(InvalidContextAuthorityRequestError);
    }
  });
});
