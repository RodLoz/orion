import {
  InvalidKnowledgeContextProjectionError,
  InvalidKnowledgeIdentityError,
  InvalidKnowledgeInputError,
  InvalidKnowledgeStateError,
  KnowledgeNotFoundError,
  KnowledgeStoreUnavailableError,
  anonymousCurrentIdentity,
  authenticatedCurrentIdentity,
  createKnowledgeReference,
  identityIdentifier,
  type ContextConstructionValues,
  type GetKnowledge,
  type KnowledgeReference,
  type ResolveCurrentIdentity,
  type RetrievedKnowledge,
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
    return `orion.context.knowledge.lineage.${this.#lineage}`;
  }

  public nextRevisionIdentity(): unknown {
    this.#revision += 1;
    return `orion.context.knowledge.revision.${this.#revision}`;
  }

  public nextCreatedAt(): unknown {
    this.#time += 1;
    return new Date(Date.UTC(2026, 7, 11, 0, 0, this.#time)).toISOString();
  }
}

function reference(
  identity = "orion.knowledge.1",
  version = 1,
  currency: "current" | "superseded" = "current",
): KnowledgeReference {
  return createKnowledgeReference({
    knowledgeIdentity: identity,
    version,
    currency,
  });
}

function result(
  knowledgeReference: KnowledgeReference = reference(),
  transientKnowledge: object = Object.freeze({ marker: "source-owned" }),
): RetrievedKnowledge {
  return Object.freeze({
    knowledge: transientKnowledge as never,
    reference: knowledgeReference,
  });
}

function running(
  getKnowledge?: GetKnowledge,
  identityResolver: ResolveCurrentIdentity = {
    resolveCurrentIdentity: () => anonymousCurrentIdentity(),
  },
): ContextEngine {
  const engine = new ContextEngine(
    new Values(),
    identityResolver,
    getKnowledge,
  );
  engine.initialize();
  engine.start();
  return engine;
}

function prepare(
  engine: ContextEngine,
  knowledgeRetrievalRequest: unknown = {
    knowledgeIdentity: "orion.knowledge.1",
  },
) {
  return engine.prepareContextRevisionWithKnowledge({
    target: { kind: "new-lineage" },
    identityResolutionRequest: {},
    knowledgeRetrievalRequest: knowledgeRetrievalRequest as never,
  });
}

describe("Context Knowledge specialization", () => {
  it("preserves Identity-only preparation and requires a resolver only for the Knowledge-aware profile", () => {
    const engine = running();
    const identityOnly = engine.prepareContextRevision({
      target: { kind: "new-lineage" },
      identityResolutionRequest: {},
    });

    expect(identityOnly.creationMetadata).toEqual({
      createdAt: "2026-08-11T00:00:01.000Z",
      sourceCount: 1,
      fragmentCount: 1,
    });
    expect(identityOnly.fragments).toHaveLength(1);
    expect(() => prepare(engine)).toThrowError(
      new ContextEngineInitializationError(),
    );
  });

  it("forwards the exact opaque Knowledge request without reading its fields", () => {
    const opaqueRequest = new Proxy(
      { knowledgeIdentity: "must-not-be-read-by-context" },
      {
        get() {
          throw new Error("Context inspected Knowledge request semantics.");
        },
      },
    );
    const getKnowledge = vi.fn((request: unknown) => {
      expect(request).toBe(opaqueRequest);
      return result();
    });

    const revision = prepare(running({ getKnowledge }), opaqueRequest);

    expect(getKnowledge).toHaveBeenCalledOnce();
    expect(revision.lifecycleState).toBe("active");
  });

  it("keeps candidate availability before incorporation and creates no early lineage", () => {
    const events: string[] = [];
    const holder: { engine?: ContextEngine } = {};
    const sourceReference = reference();
    const getKnowledge = vi.fn(() => {
      events.push("knowledge-candidate-available");
      expect(() =>
        holder.engine?.getActiveContextRevision({
          lineageIdentity: "orion.context.knowledge.lineage.1",
        }),
      ).toThrow();
      return result(sourceReference);
    });
    const engine = running({ getKnowledge });
    holder.engine = engine;
    const original = engine.composeContextRevisionWithKnowledge.bind(engine);
    engine.composeContextRevisionWithKnowledge = ((request: unknown) => {
      events.push("incorporation");
      expect(
        (request as { knowledgeReference: unknown }).knowledgeReference,
      ).toBe(sourceReference);
      return original(request);
    }) as typeof engine.composeContextRevisionWithKnowledge;

    const revision = prepare(engine);

    expect(events).toEqual(["knowledge-candidate-available", "incorporation"]);
    expect(revision.lifecycleState).toBe("active");
  });

  it("creates a distinct immutable projection in canonical Identity then Knowledge order", () => {
    const sourceReference = reference();
    const sourceRecord = Object.freeze({ privateClaim: "do not incorporate" });
    const revision = prepare(
      running({ getKnowledge: () => result(sourceReference, sourceRecord) }),
    );

    expect(revision.creationMetadata).toMatchObject({
      sourceCount: 2,
      fragmentCount: 2,
    });
    expect(revision.fragments.map(({ kind }) => kind)).toEqual([
      "identity",
      "knowledge",
    ]);
    const knowledgeFragment = revision.fragments[1];
    if (knowledgeFragment === undefined) throw new Error();
    expect(knowledgeFragment).toEqual({
      kind: "knowledge",
      authoritativeOwner: "knowledge",
      projection: {
        knowledgeIdentity: "orion.knowledge.1",
        validationState: "accepted",
        version: 1,
        currency: "current",
        authoritativeOwner: "knowledge",
      },
    });
    expect(knowledgeFragment.projection).not.toBe(sourceReference);
    expect(Object.isFrozen(revision)).toBe(true);
    expect(Object.isFrozen(revision.fragments)).toBe(true);
    expect(Object.isFrozen(knowledgeFragment)).toBe(true);
    expect(Object.isFrozen(knowledgeFragment.projection)).toBe(true);
    expect(JSON.stringify(revision)).not.toContain("privateClaim");
  });

  it.each([
    new InvalidKnowledgeInputError(),
    new InvalidKnowledgeIdentityError(),
    new KnowledgeNotFoundError(),
    new KnowledgeStoreUnavailableError(),
    new InvalidKnowledgeStateError(),
  ])(
    "propagates exact Knowledge failure $name without Context state",
    (failure) => {
      const engine = running({
        getKnowledge: () => {
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
          lineageIdentity: "orion.context.knowledge.lineage.1",
        }),
      ).toThrow();
    },
  );

  it("rejects malformed returned material at Context incorporation without fabricating a Knowledge failure", () => {
    const malformed = Object.freeze({
      knowledge: Object.freeze({}),
      reference: Object.freeze({
        knowledgeIdentity: "orion.knowledge.1",
        validationState: "accepted",
        version: 1,
        currency: "current",
        authoritativeCapability: "not-knowledge",
      }),
    });
    const engine = running({ getKnowledge: () => malformed as never });

    expect(() => prepare(engine)).toThrow(
      InvalidKnowledgeContextProjectionError,
    );
    expect(() =>
      engine.getActiveContextRevision({
        lineageIdentity: "orion.context.knowledge.lineage.1",
      }),
    ).toThrow();
  });

  it("preserves an existing Active revision after failed Knowledge retrieval or incorporation", () => {
    const failure = new KnowledgeStoreUnavailableError();
    const getKnowledge = vi
      .fn()
      .mockReturnValueOnce(result())
      .mockImplementationOnce(() => {
        throw failure;
      })
      .mockReturnValueOnce({ knowledge: {}, reference: {} });
    const engine = running({ getKnowledge });
    const first = prepare(engine);
    const target = {
      kind: "existing-lineage" as const,
      lineageIdentity: first.lineageIdentity,
      expectedActiveRevisionIdentity: first.revisionIdentity,
    };

    expect(() =>
      engine.prepareContextRevisionWithKnowledge({
        target,
        identityResolutionRequest: {},
        knowledgeRetrievalRequest: { knowledgeIdentity: "orion.knowledge.1" },
      }),
    ).toThrow(failure);
    expect(() =>
      engine.prepareContextRevisionWithKnowledge({
        target,
        identityResolutionRequest: {},
        knowledgeRetrievalRequest: { knowledgeIdentity: "orion.knowledge.1" },
      }),
    ).toThrow(InvalidKnowledgeContextProjectionError);
    expect(
      engine.getActiveContextRevision({
        lineageIdentity: first.lineageIdentity,
      }),
    ).toBe(first);
    expect(first.lifecycleState).toBe("active");
    expect(Object.isFrozen(first)).toBe(true);
  });

  it("reuses stable semantic content despite transient source-record changes", () => {
    const getKnowledge = vi
      .fn()
      .mockReturnValueOnce(result(reference(), { transient: 1 }))
      .mockReturnValueOnce(result(reference(), { transient: 2 }));
    const engine = running({ getKnowledge });
    const first = prepare(engine);
    const unchanged = engine.prepareContextRevisionWithKnowledge({
      target: {
        kind: "existing-lineage",
        lineageIdentity: first.lineageIdentity,
        expectedActiveRevisionIdentity: first.revisionIdentity,
      },
      identityResolutionRequest: {},
      knowledgeRetrievalRequest: { knowledgeIdentity: "orion.knowledge.1" },
    });

    expect(unchanged).toBe(first);
  });

  it("creates a successor when the incorporated Identity projection changes", () => {
    const identityResolver = {
      resolveCurrentIdentity: vi
        .fn()
        .mockReturnValueOnce(anonymousCurrentIdentity())
        .mockReturnValueOnce(
          authenticatedCurrentIdentity(
            identityIdentifier("orion.identity.knowledge-profile"),
          ),
        ),
    };
    const engine = running({ getKnowledge: () => result() }, identityResolver);
    const first = prepare(engine);
    const successor = engine.prepareContextRevisionWithKnowledge({
      target: {
        kind: "existing-lineage",
        lineageIdentity: first.lineageIdentity,
        expectedActiveRevisionIdentity: first.revisionIdentity,
      },
      identityResolutionRequest: { resolutionReference: "opaque" },
      knowledgeRetrievalRequest: { knowledgeIdentity: "orion.knowledge.1" },
    });

    expect(successor).not.toBe(first);
    expect(successor.fragments[0].projection).toMatchObject({
      state: "authenticated",
      identityIdentifier: "orion.identity.knowledge-profile",
    });
  });

  it.each([
    {
      nextReference: reference("orion.knowledge.2", 1, "current"),
      change: "identity",
    },
    {
      nextReference: reference("orion.knowledge.1", 2, "current"),
      change: "version",
    },
    {
      nextReference: reference("orion.knowledge.1", 1, "superseded"),
      change: "currency",
    },
  ])(
    "creates a successor when Knowledge $change changes",
    ({ nextReference }) => {
      const getKnowledge = vi
        .fn()
        .mockReturnValueOnce(result())
        .mockReturnValueOnce(result(nextReference));
      const engine = running({ getKnowledge });
      const first = prepare(engine);
      const successor = engine.prepareContextRevisionWithKnowledge({
        target: {
          kind: "existing-lineage",
          lineageIdentity: first.lineageIdentity,
          expectedActiveRevisionIdentity: first.revisionIdentity,
        },
        identityResolutionRequest: {},
        knowledgeRetrievalRequest: { knowledgeIdentity: "opaque" },
      });

      expect(successor).not.toBe(first);
      expect(successor.parentRevisionIdentity).toBe(first.revisionIdentity);
      expect(successor.revisionNumber).toBe(2);
      const knowledgeFragment = successor.fragments[1];
      if (knowledgeFragment === undefined) throw new Error();
      expect(knowledgeFragment.projection).toMatchObject({
        knowledgeIdentity: nextReference.knowledgeIdentity,
        version: nextReference.version,
        currency: nextReference.currency,
      });
    },
  );
});
