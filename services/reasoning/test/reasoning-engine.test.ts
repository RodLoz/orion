import {
  REASONING_QUERY_MAX_CODE_POINTS,
  InactiveContextError,
  InvalidActiveContextError,
  InvalidReasoningInputError,
  InvalidReasoningQueryError,
  InvalidReasoningStateError,
  type ActiveContextRevision,
} from "@orion/core";
import { describe, expect, it } from "vitest";
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
    query: "Evaluate authoritative Context.",
    ...overrides,
  };
}

function knowledgeAwareContext(): ActiveContextRevision {
  return Object.freeze({
    lineageIdentity: "context.lineage.knowledge",
    revisionIdentity: "context.revision.knowledge",
    revisionNumber: 1,
    creationMetadata: Object.freeze({
      createdAt: "2026-08-11T14:00:00.000Z",
      sourceCount: 2,
      fragmentCount: 2,
    }),
    lifecycleState: "active",
    fragments: Object.freeze([
      Object.freeze({
        kind: "identity",
        authoritativeOwner: "identity",
        projection: Object.freeze({
          state: "authenticated",
          authoritativeOwner: "identity",
          identityIdentifier: "orion.identity.m5",
        }),
      }),
      Object.freeze({
        kind: "knowledge",
        authoritativeOwner: "knowledge",
        projection: Object.freeze({
          knowledgeIdentity: "orion.knowledge.m5",
          validationState: "accepted",
          version: 1,
          currency: "current",
          authoritativeOwner: "knowledge",
        }),
      }),
    ]),
  }) as unknown as ActiveContextRevision;
}

function requestWithGetter(
  field: "intent" | "activeContextRevision" | "query",
  getter: () => unknown,
): Record<string, unknown> {
  const value = request();
  Object.defineProperty(value, field, { enumerable: true, get: getter });
  return value;
}

function running() {
  const engine = new ReasoningEngine();
  engine.initialize();
  engine.start();
  return engine;
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
      "anonymous",
    ],
    [context(), "context-only", "authenticated-context-only", "authenticated"],
  ] as const)(
    "reasons only from the authoritative Active Context",
    (activeContextRevision, category, ruleCategory, identityState) => {
      const outcome = running().evaluateReasoning(
        request({ activeContextRevision }),
      );
      expect(outcome).toMatchObject({
        status: "completed",
        category,
        nextAction: "request-more-context",
        explainability: {
          identityState,
          ruleCategory,
          contextConsumptionReference: {
            lineageIdentity: activeContextRevision.lineageIdentity,
            revisionIdentity: activeContextRevision.revisionIdentity,
            revisionNumber: activeContextRevision.revisionNumber,
            lifecycleState: "active",
            authoritativeCapability: "context",
          },
        },
      });
      expect(Object.keys(outcome.explainability)).toEqual([
        "contextConsumptionReference",
        "identityState",
        "ruleCategory",
      ]);
      expect(Object.isFrozen(outcome)).toBe(true);
      expect(Object.isFrozen(outcome.explainability)).toBe(true);
    },
  );

  it.each(["memoryReferences", "knowledgeReferences"])(
    "rejects legacy %s as an invalid request",
    (field) => {
      expect(() =>
        running().evaluateReasoning(request({ [field]: [] })),
      ).toThrow(InvalidReasoningInputError);
    },
  );

  it("consumes the current fixed Identity + Knowledge Context profile without parallel evidence", () => {
    const activeContextRevision = knowledgeAwareContext();
    const engine = running();
    const outcome = engine.evaluateReasoning(
      request({ activeContextRevision }),
    );

    expect(outcome.category).toBe("context-only");
    expect(outcome.explainability.contextConsumptionReference).toMatchObject({
      lineageIdentity: activeContextRevision.lineageIdentity,
      revisionIdentity: activeContextRevision.revisionIdentity,
      revisionNumber: activeContextRevision.revisionNumber,
      authoritativeCapability: "context",
    });
    expect(
      engine.verifyReasoningOutcomeAuthority({
        intent: "verify-reasoning-outcome-authority",
        candidate: outcome,
        consumedContextRevision: activeContextRevision,
        expectedLineageIdentity: activeContextRevision.lineageIdentity,
        expectedRevisionIdentity: activeContextRevision.revisionIdentity,
        expectedRevisionNumber: activeContextRevision.revisionNumber,
      }),
    ).toBe(outcome);
  });

  it.each([
    null,
    undefined,
    1,
    "request",
    [],
    {},
    { ...request(), extra: true },
  ])("maps malformed top-level input to the request boundary", (value) => {
    expect(() => running().evaluateReasoning(value)).toThrow(
      InvalidReasoningInputError,
    );
  });

  it("validates Context before query and requires Active lifecycle", () => {
    expect(() =>
      running().evaluateReasoning(
        request({ activeContextRevision: null, query: "" }),
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
        running().evaluateReasoning(
          request({
            activeContextRevision: context("authenticated", lifecycleState),
          }),
        ),
      ).toThrow(InactiveContextError);
    expect(() => running().evaluateReasoning(request({ query: "" }))).toThrow(
      InvalidReasoningQueryError,
    );
  });

  it("does not mutate or retain a caller-owned Context graph", () => {
    const activeContextRevision = context();
    const before = structuredClone(activeContextRevision);
    const outcome = running().evaluateReasoning(
      request({ activeContextRevision }),
    );
    expect(activeContextRevision).toEqual(before);
    activeContextRevision.fragments[0]!.projection.state = "anonymous";
    expect(outcome.explainability.identityState).toBe("authenticated");
    expect(
      Object.isFrozen(outcome.explainability.contextConsumptionReference),
    ).toBe(true);
  });

  it("normalizes hostile request and Context Proxies to their owning boundaries", () => {
    const hostileRequest = new Proxy(request(), {
      ownKeys: () => {
        throw new RangeError("private request trap");
      },
    });
    expect(() => running().evaluateReasoning(hostileRequest)).toThrow(
      InvalidReasoningInputError,
    );

    const hostileContext = new Proxy(context(), {
      getPrototypeOf: () => {
        throw new TypeError("private Context trap");
      },
    });
    expect(() =>
      running().evaluateReasoning(
        request({ activeContextRevision: hostileContext }),
      ),
    ).toThrow(InvalidActiveContextError);
  });

  it("normalizes hostile getters without exposing private failures", () => {
    const privateMessage = "private hostile getter must not escape";
    for (const [field, failure] of [
      ["intent", InvalidReasoningInputError],
      ["activeContextRevision", InvalidActiveContextError],
      ["query", InvalidReasoningQueryError],
    ] as const) {
      let caught: unknown;
      try {
        running().evaluateReasoning(
          requestWithGetter(field, () => {
            throw new TypeError(privateMessage);
          }),
        );
      } catch (error) {
        caught = error;
      }
      expect(caught).toBeInstanceOf(failure);
      expect((caught as Error).message).not.toContain(privateMessage);
    }
  });

  it("reads each caller field exactly once", () => {
    const reads = { intent: 0, context: 0, query: 0 };
    const value = {} as Record<string, unknown>;
    Object.defineProperties(value, {
      intent: {
        enumerable: true,
        get: () => {
          reads.intent += 1;
          return reads.intent === 1 ? "evaluate" : "invalid";
        },
      },
      activeContextRevision: {
        enumerable: true,
        get: () => {
          reads.context += 1;
          return reads.context === 1 ? context() : null;
        },
      },
      query: {
        enumerable: true,
        get: () => {
          reads.query += 1;
          return reads.query === 1 ? "Stable query." : null;
        },
      },
    });

    expect(running().evaluateReasoning(value).category).toBe("context-only");
    expect(reads).toEqual({ intent: 1, context: 1, query: 1 });
  });

  it("preserves exact request, Context, lifecycle, and query validation precedence", () => {
    expect(() =>
      running().evaluateReasoning({
        ...request({ activeContextRevision: null, query: "" }),
        extra: true,
      }),
    ).toThrow(InvalidReasoningInputError);
    expect(() =>
      running().evaluateReasoning(
        request({ activeContextRevision: null, query: "" }),
      ),
    ).toThrow(InvalidActiveContextError);
    expect(() =>
      running().evaluateReasoning(
        request({
          activeContextRevision: context("authenticated", "expired"),
          query: "",
        }),
      ),
    ).toThrow(InactiveContextError);
    expect(() => running().evaluateReasoning(request({ query: "" }))).toThrow(
      InvalidReasoningQueryError,
    );
  });

  it("inherits accepted Context timestamp semantics without narrowing them", () => {
    const activeContextRevision = context();
    activeContextRevision.creationMetadata.createdAt =
      "2026-02-30T00:00:00.000Z";
    expect(
      running().evaluateReasoning(request({ activeContextRevision })).status,
    ).toBe("completed");

    activeContextRevision.creationMetadata.createdAt =
      "2026-07-20T14:00:00+00:00";
    expect(() =>
      running().evaluateReasoning(request({ activeContextRevision })),
    ).toThrow(InvalidActiveContextError);
  });

  it("normalizes hostile nested Context inspection privately", () => {
    const privateMessage = "private nested Context value";
    const activeContextRevision = context();
    Object.defineProperty(activeContextRevision.creationMetadata, "createdAt", {
      enumerable: true,
      get: () => {
        throw new TypeError(privateMessage);
      },
    });

    let caught: unknown;
    try {
      running().evaluateReasoning(request({ activeContextRevision }));
    } catch (error) {
      caught = error;
    }
    expect(caught).toBeInstanceOf(InvalidActiveContextError);
    expect((caught as Error).message).not.toContain(privateMessage);
  });

  it("does not mutate or freeze caller input on later or Context failure paths", () => {
    const invalidQueryContext = context();
    const invalidQuerySnapshot = structuredClone(invalidQueryContext);
    expect(() =>
      running().evaluateReasoning(
        request({ activeContextRevision: invalidQueryContext, query: "" }),
      ),
    ).toThrow(InvalidReasoningQueryError);
    expect(invalidQueryContext).toEqual(invalidQuerySnapshot);
    expect(Object.isFrozen(invalidQueryContext)).toBe(false);
    expect(Object.isFrozen(invalidQueryContext.creationMetadata)).toBe(false);
    expect(Object.isFrozen(invalidQueryContext.fragments)).toBe(false);

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

  it("enforces exact Unicode code-point query bounds", () => {
    const exact = "😀".repeat(REASONING_QUERY_MAX_CODE_POINTS);
    const over = `${exact}😀`;
    expect(running().evaluateReasoning(request({ query: exact })).status).toBe(
      "completed",
    );
    expect(() => running().evaluateReasoning(request({ query: over }))).toThrow(
      InvalidReasoningQueryError,
    );
  });

  it("is deterministic for equivalent Context and query inputs", () => {
    const evaluate = () => running().evaluateReasoning(request());
    expect(evaluate()).toEqual(evaluate());
    expect(evaluate()).toEqual(evaluate());
  });

  it("uses only Core inputs and requires no Engine collaborator", () => {
    expect(ReasoningEngine.length).toBe(0);
    expect(running().evaluateReasoning(request()).status).toBe("completed");
  });
});
