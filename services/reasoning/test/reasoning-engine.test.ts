import { describe, expect, it } from "vitest";
import {
  InactiveContextError,
  InvalidActiveContextError,
  InvalidKnowledgeReferenceError,
  InvalidMemoryReferenceError,
  InvalidReasoningInputError,
  InvalidReasoningQueryError,
  InvalidReasoningStateError,
  createKnowledgeReference,
  createMemoryReference,
} from "@orion/core";
import { ReasoningEngine } from "../src/index.js";

function context(
  state: "anonymous" | "authenticated" = "authenticated",
  lifecycleState = "active",
) {
  const projection =
    state === "anonymous"
      ? { state, authoritativeOwner: "identity" }
      : {
          state,
          authoritativeOwner: "identity",
          identityIdentifier: "orion.identity.m5",
        };
  return {
    lineageIdentity: "context.lineage.m5",
    revisionIdentity: "context.revision.m5",
    revisionNumber: 1,
    creationMetadata: {
      createdAt: "2026-07-20T14:00:00.000Z",
      sourceCount: 1,
      fragmentCount: 1,
    },
    lifecycleState,
    fragments: [
      { kind: "identity", authoritativeOwner: "identity", projection },
    ],
  };
}
function request(overrides: Record<string, unknown> = {}) {
  return {
    intent: "evaluate",
    activeContextRevision: context(),
    query: "Evaluate available grounding.",
    ...overrides,
  };
}
function running() {
  const engine = new ReasoningEngine();
  engine.initialize();
  engine.start();
  return engine;
}
const memory = () => createMemoryReference("orion.memory.m5.1");
const memoryAt = (index: number) =>
  createMemoryReference(`orion.memory.m5.${index}`);
const knowledge = () =>
  createKnowledgeReference({
    knowledgeIdentity: "orion.knowledge.m5.1",
    version: 1,
    currency: "current",
  });
const knowledgeAt = (index: number) =>
  createKnowledgeReference({
    knowledgeIdentity: `orion.knowledge.m5.${index}`,
    version: index,
    currency: "current",
  });

function requestWithGetter(
  field:
    | "activeContextRevision"
    | "query"
    | "memoryReferences"
    | "knowledgeReferences",
  getter: () => unknown,
  overrides: Record<string, unknown> = {},
): Record<string, unknown> {
  const value = request(overrides);
  Object.defineProperty(value, field, { enumerable: true, get: getter });
  return value;
}

describe("ReasoningEngine", () => {
  it("enforces lifecycle", () => {
    const engine = new ReasoningEngine();
    expect(() => engine.evaluateReasoning(request())).toThrow(
      InvalidReasoningStateError,
    );
    engine.initialize();
    engine.start();
    expect(engine.engineState).toBe("running");
    engine.stop();
  });

  it.each([
    [
      context("anonymous"),
      "anonymous-context",
      "anonymous-identity",
      "request-more-context",
    ],
    [
      context(),
      "context-only",
      "authenticated-context-only",
      "request-more-context",
    ],
  ])(
    "evaluates base deterministic branches",
    (activeContextRevision, category, ruleCategory, nextAction) => {
      const outcome = running().evaluateReasoning(
        request({ activeContextRevision }),
      );
      expect(outcome).toMatchObject({
        status: "completed",
        category,
        nextAction,
        explainability: {
          ruleCategory,
          memoryReferenceCount: 0,
          knowledgeReferenceCount: 0,
        },
      });
    },
  );

  it("evaluates Memory, Knowledge, and precedence branches", () => {
    const engine = running();
    expect(
      engine.evaluateReasoning(request({ memoryReferences: [memory()] }))
        .category,
    ).toBe("experience-informed-context");
    expect(
      engine.evaluateReasoning(request({ knowledgeReferences: [knowledge()] }))
        .category,
    ).toBe("knowledge-grounded-context");
    const both = engine.evaluateReasoning(
      request({
        memoryReferences: [memory()],
        knowledgeReferences: [knowledge()],
      }),
    );
    expect(both.category).toBe("knowledge-grounded-context");
    expect(both.explainability).toMatchObject({
      memoryReferenceCount: 1,
      knowledgeReferenceCount: 1,
    });
  });

  it("does not mutate Context or retain caller-owned values", () => {
    const activeContextRevision = context();
    const before = structuredClone(activeContextRevision);
    const references = [memory()];
    const outcome = running().evaluateReasoning(
      request({ activeContextRevision, memoryReferences: references }),
    );
    expect(activeContextRevision).toEqual(before);
    references.length = 0;
    activeContextRevision.fragments[0]!.projection.state = "anonymous";
    expect(outcome.explainability.identityState).toBe("authenticated");
    expect(outcome.explainability.memoryReferenceCount).toBe(1);
    expect(before.fragments[0]!.projection.state).toBe("authenticated");
    expect(
      Object.isFrozen(outcome.explainability.contextConsumptionReference),
    ).toBe(true);
  });

  it.each([
    null,
    undefined,
    1,
    "request",
    [],
    {},
    { ...request(), extra: true },
  ])("maps malformed top-level input exactly", (value) => {
    expect(() => running().evaluateReasoning(value)).toThrow(
      InvalidReasoningInputError,
    );
  });

  it("maps Context shape and lifecycle exactly", () => {
    const engine = running();
    expect(() =>
      engine.evaluateReasoning(request({ activeContextRevision: null })),
    ).toThrow(InvalidActiveContextError);
    expect(() =>
      engine.evaluateReasoning(
        request({
          activeContextRevision: {
            ...context(),
            parentRevisionIdentity: "context.revision.parent",
          },
        }),
      ),
    ).toThrow(InvalidActiveContextError);
    for (const lifecycleState of [
      "collecting",
      "composing",
      "validating",
      "expired",
      "archived",
    ])
      expect(() =>
        engine.evaluateReasoning(
          request({
            activeContextRevision: context("authenticated", lifecycleState),
          }),
        ),
      ).toThrow(InactiveContextError);
  });

  it("maps invalid Query before invalid collections", () => {
    expect(() =>
      running().evaluateReasoning(
        request({
          query: "",
          memoryReferences: null,
          knowledgeReferences: null,
        }),
      ),
    ).toThrow(InvalidReasoningQueryError);
  });

  it("maps every explicit invalid Memory collection or item", () => {
    const sparse = new Array(1);
    const over = Array.from({ length: 21 }, memory);
    const invalid = [
      null,
      1,
      "x",
      {},
      sparse,
      over,
      [null],
      [{ ...memory(), extra: true }],
      [memory(), memory()],
    ];
    for (const memoryReferences of invalid)
      expect(() =>
        running().evaluateReasoning(
          request({ memoryReferences, knowledgeReferences: null }),
        ),
      ).toThrow(InvalidMemoryReferenceError);
    expect(
      running().evaluateReasoning(request()).explainability
        .memoryReferenceCount,
    ).toBe(0);
  });

  it("maps every explicit invalid Knowledge collection or item", () => {
    const sparse = new Array(1);
    const over = Array.from({ length: 21 }, knowledge);
    const invalid = [
      null,
      1,
      "x",
      {},
      sparse,
      over,
      [null],
      [{ ...knowledge(), extra: true }],
      [{ ...knowledge(), version: 0 }],
      [{ ...knowledge(), currency: "superseded" }],
      [knowledge(), knowledge()],
    ];
    for (const knowledgeReferences of invalid)
      expect(() =>
        running().evaluateReasoning(request({ knowledgeReferences })),
      ).toThrow(InvalidKnowledgeReferenceError);
    expect(
      running().evaluateReasoning(request()).explainability
        .knowledgeReferenceCount,
    ).toBe(0);
  });

  it("enforces the complete validation precedence", () => {
    const engine = running();
    expect(() =>
      engine.evaluateReasoning({
        ...request({ query: "", memoryReferences: null }),
        extra: true,
      }),
    ).toThrow(InvalidReasoningInputError);
    expect(() =>
      engine.evaluateReasoning(
        request({ activeContextRevision: null, query: "" }),
      ),
    ).toThrow(InvalidActiveContextError);
    expect(() =>
      engine.evaluateReasoning(request({ query: "", memoryReferences: null })),
    ).toThrow(InvalidReasoningQueryError);
    expect(() =>
      engine.evaluateReasoning(
        request({ memoryReferences: null, knowledgeReferences: null }),
      ),
    ).toThrow(InvalidMemoryReferenceError);
    expect(() =>
      engine.evaluateReasoning(
        request({ memoryReferences: [], knowledgeReferences: null }),
      ),
    ).toThrow(InvalidKnowledgeReferenceError);
  });

  it("normalizes hostile proxies to the owning boundary failure", () => {
    const hostile = new Proxy(
      {},
      {
        getPrototypeOf: () => {
          throw new Error("hostile");
        },
      },
    );
    expect(() => running().evaluateReasoning(hostile)).toThrow(
      InvalidReasoningInputError,
    );
    expect(() =>
      running().evaluateReasoning(request({ activeContextRevision: hostile })),
    ).toThrow(InvalidActiveContextError);
    expect(() =>
      running().evaluateReasoning(request({ memoryReferences: [hostile] })),
    ).toThrow(InvalidMemoryReferenceError);
    expect(() =>
      running().evaluateReasoning(request({ knowledgeReferences: [hostile] })),
    ).toThrow(InvalidKnowledgeReferenceError);
  });

  it("normalizes hostile top-level inspection and each protected field read", () => {
    const throwing = () => {
      throw new TypeError("hostile getter");
    };
    const engine = running();
    expect(() =>
      engine.evaluateReasoning(
        new Proxy(request(), {
          ownKeys: () => {
            throw new RangeError("hostile keys");
          },
        }),
      ),
    ).toThrow(InvalidReasoningInputError);
    expect(() =>
      engine.evaluateReasoning(
        new Proxy(request(), {
          getOwnPropertyDescriptor: () => {
            throw "hostile descriptor";
          },
        }),
      ),
    ).toThrow(InvalidReasoningInputError);
    expect(() =>
      engine.evaluateReasoning(
        requestWithGetter("activeContextRevision", throwing, { query: "" }),
      ),
    ).toThrow(InvalidActiveContextError);
    expect(() =>
      engine.evaluateReasoning(
        requestWithGetter("query", throwing, { memoryReferences: null }),
      ),
    ).toThrow(InvalidReasoningQueryError);
    expect(() =>
      engine.evaluateReasoning(
        requestWithGetter("memoryReferences", throwing, {
          knowledgeReferences: null,
        }),
      ),
    ).toThrow(InvalidMemoryReferenceError);
    expect(() =>
      engine.evaluateReasoning(
        requestWithGetter("knowledgeReferences", throwing, {
          memoryReferences: [],
        }),
      ),
    ).toThrow(InvalidKnowledgeReferenceError);
  });

  it("reads each hostile caller field exactly once", () => {
    let contextReads = 0;
    let queryReads = 0;
    let memoryReads = 0;
    let knowledgeReads = 0;
    const value = requestWithGetter("activeContextRevision", () => {
      contextReads += 1;
      return contextReads === 1 ? context() : null;
    });
    Object.defineProperty(value, "query", {
      enumerable: true,
      get: () => {
        queryReads += 1;
        return queryReads === 1 ? "Stable query." : null;
      },
    });
    Object.defineProperty(value, "memoryReferences", {
      enumerable: true,
      get: () => {
        memoryReads += 1;
        return memoryReads === 1 ? [memory()] : null;
      },
    });
    Object.defineProperty(value, "knowledgeReferences", {
      enumerable: true,
      get: () => {
        knowledgeReads += 1;
        return knowledgeReads === 1 ? [knowledge()] : null;
      },
    });
    expect(running().evaluateReasoning(value).category).toBe(
      "knowledge-grounded-context",
    );
    expect([contextReads, queryReads, memoryReads, knowledgeReads]).toEqual([
      1, 1, 1, 1,
    ]);
  });
});

describe("Reasoning collection boundaries", () => {
  it("distinguishes omitted from explicit undefined and accepts exact maxima", () => {
    const engine = running();
    expect(engine.evaluateReasoning(request()).explainability).toMatchObject({
      memoryReferenceCount: 0,
      knowledgeReferenceCount: 0,
    });
    expect(() =>
      engine.evaluateReasoning(request({ memoryReferences: undefined })),
    ).toThrow(InvalidMemoryReferenceError);
    expect(() =>
      engine.evaluateReasoning(request({ knowledgeReferences: undefined })),
    ).toThrow(InvalidKnowledgeReferenceError);
    expect(
      engine.evaluateReasoning(
        request({
          memoryReferences: Array.from({ length: 20 }, (_, index) =>
            memoryAt(index + 1),
          ),
          knowledgeReferences: Array.from({ length: 20 }, (_, index) =>
            knowledgeAt(index + 1),
          ),
        }),
      ).explainability,
    ).toMatchObject({ memoryReferenceCount: 20, knowledgeReferenceCount: 20 });
  });

  it("rejects exact-array and hostile-array defects with specific failures", () => {
    const memoryExtra = [memory()] as Array<ReturnType<typeof memory>> & {
      extra?: boolean;
    };
    memoryExtra.extra = true;
    const knowledgeExtra = [knowledge()] as Array<
      ReturnType<typeof knowledge>
    > & { extra?: boolean };
    knowledgeExtra.extra = true;
    const symbol = Symbol("unexpected");
    const knowledgeSymbol = [knowledge()] as unknown[] &
      Record<symbol, boolean>;
    knowledgeSymbol[symbol] = true;
    const memorySymbol = [memory()] as unknown[] & Record<symbol, boolean>;
    memorySymbol[symbol] = true;
    const hostileMemory = new Proxy([memory()], {
      getOwnPropertyDescriptor: () => {
        throw new Error("hostile array");
      },
    });
    const hostileKnowledge = new Proxy([knowledge()], {
      ownKeys: () => {
        throw { hostile: true };
      },
    });
    const hostileMemoryLength = new Proxy([memory()], {
      get: (target, property, receiver) => {
        if (property === "length") throw new RangeError("hostile length");
        return Reflect.get(target, property, receiver);
      },
    });
    const hostileKnowledgeLength = new Proxy([knowledge()], {
      get: (target, property, receiver) => {
        if (property === "length") throw "hostile length";
        return Reflect.get(target, property, receiver);
      },
    });
    const throwingMemoryIndex = [memory()];
    Object.defineProperty(throwingMemoryIndex, 0, {
      enumerable: true,
      get: () => {
        throw 7;
      },
    });
    const throwingKnowledgeIndex = [knowledge()];
    Object.defineProperty(throwingKnowledgeIndex, 0, {
      enumerable: true,
      get: () => {
        throw new RangeError("hostile item");
      },
    });
    for (const memoryReferences of [
      new Set([memory()]),
      memoryExtra,
      memorySymbol,
      hostileMemory,
      hostileMemoryLength,
      throwingMemoryIndex,
      [{ ...memory(), memoryIdentity: { toString: () => "orion.memory" } }],
      [{ ...memory(), memoryIdentity: "" }],
      [{ ...memory(), memoryIdentity: "x".repeat(129) }],
    ]) {
      expect(() =>
        running().evaluateReasoning(request({ memoryReferences })),
      ).toThrow(InvalidMemoryReferenceError);
    }
    for (const knowledgeReferences of [
      new Set([knowledge()]),
      knowledgeExtra,
      knowledgeSymbol,
      hostileKnowledge,
      hostileKnowledgeLength,
      throwingKnowledgeIndex,
      [
        {
          ...knowledge(),
          knowledgeIdentity: { valueOf: () => "orion.knowledge" },
        },
      ],
      [{ ...knowledge(), knowledgeIdentity: "" }],
      [{ ...knowledge(), knowledgeIdentity: "x".repeat(129) }],
      [{ ...knowledge(), version: Number.MAX_SAFE_INTEGER + 1 }],
      [{ ...knowledge(), version: -1 }],
      [{ ...knowledge(), currency: { toString: () => "current" } }],
    ]) {
      expect(() =>
        running().evaluateReasoning(request({ knowledgeReferences })),
      ).toThrow(InvalidKnowledgeReferenceError);
    }
  });

  it("does not retain mutable caller collection arrays", () => {
    const memoryReferences = [memory()];
    const knowledgeReferences = [knowledge()];
    const outcome = running().evaluateReasoning(
      request({ memoryReferences, knowledgeReferences }),
    );
    memoryReferences.length = 0;
    knowledgeReferences.push(knowledgeAt(2));
    expect(outcome.explainability).toMatchObject({
      memoryReferenceCount: 1,
      knowledgeReferenceCount: 1,
    });
  });
});

describe("Reasoning complete Context boundary", () => {
  it.each([
    { lineageIdentity: "INVALID" },
    { revisionIdentity: "INVALID" },
    { lineageIdentity: { toString: (): string => "context.lineage" } },
    { revisionNumber: 0 },
    { revisionNumber: -1 },
    { revisionNumber: Number.MAX_SAFE_INTEGER + 1 },
    { revisionNumber: 2 },
    { revisionNumber: 2, parentRevisionIdentity: "INVALID" },
    { creationMetadata: null },
    {
      creationMetadata: {
        createdAt: "invalid",
        sourceCount: 1,
        fragmentCount: 1,
      },
    },
    {
      creationMetadata: {
        createdAt: "2026-07-20T14:00:00+00:00",
        sourceCount: 1,
        fragmentCount: 1,
      },
    },
    {
      creationMetadata: {
        createdAt: "2026-07-20T14:00:00.000Z",
        sourceCount: 1,
        fragmentCount: 1,
        extra: true,
      },
    },
    { fragments: [] },
    {
      fragments: [
        {
          kind: "identity",
          authoritativeOwner: "identity",
          projection: { state: "anonymous", authoritativeOwner: "identity" },
          extra: true,
        },
      ],
    },
    {
      fragments: [
        {
          kind: "identity",
          authoritativeOwner: "identity",
          projection: {
            state: "anonymous",
            authoritativeOwner: "identity",
            identityIdentifier: "unexpected",
          },
        },
      ],
    },
    {
      fragments: [
        {
          kind: "identity",
          authoritativeOwner: "identity",
          projection: {
            state: "authenticated",
            authoritativeOwner: "identity",
            identityIdentifier: {
              toString: (): string => "orion.identity",
            },
          },
        },
      ],
    },
  ])("rejects malformed Context structure exactly", (override) => {
    expect(() =>
      running().evaluateReasoning(
        request({ activeContextRevision: { ...context(), ...override } }),
      ),
    ).toThrow(InvalidActiveContextError);
  });

  it("inherits the accepted M2 timestamp semantics without narrowing them", () => {
    const impossibleButM2Accepted = {
      ...context(),
      creationMetadata: {
        createdAt: "2026-02-30T00:00:00.000Z",
        sourceCount: 1,
        fragmentCount: 1,
      },
    };
    expect(
      running().evaluateReasoning(
        request({ activeContextRevision: impossibleButM2Accepted }),
      ).status,
    ).toBe("completed");
  });

  it("normalizes hostile nested inspection and leaves the original unchanged", () => {
    const hostileMetadata = new Proxy(
      {},
      {
        getPrototypeOf: () => {
          throw new Error("nested hostile");
        },
      },
    );
    const original = context("anonymous");
    const before = structuredClone(original);
    expect(() =>
      running().evaluateReasoning(
        request({
          activeContextRevision: {
            ...context(),
            creationMetadata: hostileMetadata,
          },
        }),
      ),
    ).toThrow(InvalidActiveContextError);
    running().evaluateReasoning(request({ activeContextRevision: original }));
    expect(original).toEqual(before);
  });

  it("maps a hostile nested Context getter to a privacy-safe Context failure", () => {
    const activeContextRevision = context();
    Object.defineProperty(activeContextRevision.creationMetadata, "createdAt", {
      enumerable: true,
      get: () => {
        throw new TypeError("private hostile value must not escape");
      },
    });
    let caught: unknown;
    try {
      running().evaluateReasoning(
        request({
          activeContextRevision,
          query: "",
          memoryReferences: null,
        }),
      );
    } catch (error: unknown) {
      caught = error;
    }
    expect(caught).toBeInstanceOf(InvalidActiveContextError);
    expect((caught as Error).message).not.toContain("private hostile value");
  });

  it("does not mutate caller Context on later-boundary or Context failure", () => {
    const laterBoundaryContext = context();
    const laterBoundarySnapshot = structuredClone(laterBoundaryContext);
    expect(() =>
      running().evaluateReasoning(
        request({
          activeContextRevision: laterBoundaryContext,
          knowledgeReferences: null,
        }),
      ),
    ).toThrow(InvalidKnowledgeReferenceError);
    expect(laterBoundaryContext).toEqual(laterBoundarySnapshot);
    expect(Object.isFrozen(laterBoundaryContext)).toBe(false);
    expect(Object.isFrozen(laterBoundaryContext.creationMetadata)).toBe(false);
    expect(Object.isFrozen(laterBoundaryContext.fragments)).toBe(false);

    const malformedContext = { ...context(), revisionNumber: 0 };
    const malformedSnapshot = structuredClone(malformedContext);
    expect(() =>
      running().evaluateReasoning(
        request({ activeContextRevision: malformedContext }),
      ),
    ).toThrow(InvalidActiveContextError);
    expect(malformedContext).toEqual(malformedSnapshot);
    expect(Object.isFrozen(malformedContext)).toBe(false);
  });
});

describe("Reasoning exact rule matrix and determinism", () => {
  const cases = [
    [
      "anonymous",
      [],
      [],
      "anonymous-context",
      "The active context identifies an anonymous actor.",
      "Additional identity context may be required before further orchestration.",
      "request-more-context",
      "anonymous-identity",
    ],
    [
      "anonymous",
      [memory()],
      [],
      "anonymous-context",
      "The active context identifies an anonymous actor.",
      "Additional identity context may be required before further orchestration.",
      "request-more-context",
      "anonymous-identity",
    ],
    [
      "anonymous",
      [],
      [knowledge()],
      "anonymous-context",
      "The active context identifies an anonymous actor.",
      "Additional identity context may be required before further orchestration.",
      "request-more-context",
      "anonymous-identity",
    ],
    [
      "anonymous",
      [memory()],
      [knowledge()],
      "anonymous-context",
      "The active context identifies an anonymous actor.",
      "Additional identity context may be required before further orchestration.",
      "request-more-context",
      "anonymous-identity",
    ],
    [
      "authenticated",
      [],
      [knowledge()],
      "knowledge-grounded-context",
      "The authenticated context includes accepted Knowledge references.",
      "Accepted Knowledge context is available for further orchestration.",
      "none",
      "authenticated-with-knowledge",
    ],
    [
      "authenticated",
      [memory()],
      [],
      "experience-informed-context",
      "The authenticated context includes Memory references but no Knowledge references.",
      "Only retained experience references are available for further orchestration.",
      "none",
      "authenticated-with-memory-only",
    ],
    [
      "authenticated",
      [],
      [],
      "context-only",
      "The authenticated context contains no supplied Memory or Knowledge references.",
      "No Memory or Knowledge references were supplied for further orchestration.",
      "request-more-context",
      "authenticated-context-only",
    ],
    [
      "authenticated",
      [memory()],
      [knowledge()],
      "knowledge-grounded-context",
      "The authenticated context includes accepted Knowledge references.",
      "Accepted Knowledge context is available for further orchestration.",
      "none",
      "authenticated-with-knowledge",
    ],
  ] as const;

  it.each(cases)(
    "produces exact controlled output correspondence",
    (
      identityState,
      memories,
      knowledgeItems,
      category,
      conclusion,
      response,
      nextAction,
      ruleCategory,
    ) => {
      const outcome = running().evaluateReasoning(
        request({
          activeContextRevision: context(identityState),
          memoryReferences: memories,
          knowledgeReferences: knowledgeItems,
        }),
      );
      expect(outcome).toEqual({
        status: "completed",
        category,
        conclusion,
        response,
        nextAction,
        explainability: {
          contextConsumptionReference: {
            lineageIdentity: "context.lineage.m5",
            revisionIdentity: "context.revision.m5",
            revisionNumber: 1,
            lifecycleState: "active",
            authoritativeCapability: "context",
          },
          identityState,
          memoryReferenceCount: memories.length,
          knowledgeReferenceCount: knowledgeItems.length,
          ruleCategory,
        },
      });
    },
  );

  it.each(cases)(
    "is repeatable for independently constructed equivalent inputs",
    (identityState, memories, knowledgeItems) => {
      const evaluate = () =>
        running().evaluateReasoning(
          request({
            activeContextRevision: context(identityState),
            memoryReferences: [...memories],
            knowledgeReferences: [...knowledgeItems],
          }),
        );
      expect(evaluate()).toEqual(evaluate());
      expect(evaluate()).toEqual(evaluate());
    },
  );

  it("uses only Core inputs and has no Engine collaborator", () => {
    expect(ReasoningEngine.length).toBe(0);
    expect(running().evaluateReasoning(request()).status).toBe("completed");
  });

  it("is invariant to prepared Reference order because M5 uses only counts", () => {
    const engine = running();
    const left = engine.evaluateReasoning(
      request({
        memoryReferences: [memoryAt(1), memoryAt(2)],
        knowledgeReferences: [knowledgeAt(1), knowledgeAt(2)],
      }),
    );
    const right = engine.evaluateReasoning(
      request({
        memoryReferences: [memoryAt(2), memoryAt(1)],
        knowledgeReferences: [knowledgeAt(2), knowledgeAt(1)],
      }),
    );
    expect(left).toEqual(right);
  });
});
