import { describe, expect, it } from "vitest";
import {
  InvalidPlanningInputError,
  InvalidPlanningStateError,
  InvalidReasoningOutcomeError,
  createContextConsumptionReference,
  createReasoningExplainabilitySummary,
  createReasoningOutcome,
} from "@orion/core";
import * as planningPackage from "../src/index.js";
import { PlanningEngine } from "../src/planning-engine.js";

const outcomeCases = [
  [
    "anonymous-context",
    "The active context identifies an anonymous actor.",
    "Additional identity context may be required before further orchestration.",
    "request-more-context",
    "anonymous",
    0,
    0,
    "anonymous-identity",
  ],
  [
    "knowledge-grounded-context",
    "The authenticated context includes accepted Knowledge references.",
    "Accepted Knowledge context is available for further orchestration.",
    "none",
    "authenticated",
    1,
    1,
    "authenticated-with-knowledge",
  ],
  [
    "experience-informed-context",
    "The authenticated context includes Memory references but no Knowledge references.",
    "Only retained experience references are available for further orchestration.",
    "none",
    "authenticated",
    1,
    0,
    "authenticated-with-memory-only",
  ],
  [
    "context-only",
    "The authenticated context contains no supplied Memory or Knowledge references.",
    "No Memory or Knowledge references were supplied for further orchestration.",
    "request-more-context",
    "authenticated",
    0,
    0,
    "authenticated-context-only",
  ],
] as const;

function outcome(index = 3) {
  const item = outcomeCases[index]!;
  return createReasoningOutcome({
    status: "completed",
    category: item[0],
    conclusion: item[1],
    response: item[2],
    nextAction: item[3],
    explainability: createReasoningExplainabilitySummary({
      contextConsumptionReference: createContextConsumptionReference({
        lineageIdentity: "context.lineage.m6",
        revisionIdentity: "context.revision.m6",
        revisionNumber: 1,
        lifecycleState: "active",
        authoritativeCapability: "context",
      }),
      identityState: item[4],
      memoryReferenceCount: item[5],
      knowledgeReferenceCount: item[6],
      ruleCategory: item[7],
    }),
  });
}
function request(reasoningOutcome: unknown = outcome()) {
  return { intent: "create-candidate-plan", reasoningOutcome };
}
function running() {
  const engine = new PlanningEngine();
  engine.initialize();
  engine.start();
  return engine;
}

describe("PlanningEngine", () => {
  it("does not expose controlled fault mechanisms from the package entrypoint", () => {
    expect(planningPackage).not.toHaveProperty(
      "createInternalPlanningEngineTestFixture",
    );
    expect(planningPackage).not.toHaveProperty("PlanningEngineTestSeams");
    expect(PlanningEngine.length).toBe(0);
    const attemptedRuntimeFlags = Reflect.construct(PlanningEngine, [
      { failRuleResolution: true, failConstructedState: true },
    ]) as PlanningEngine;
    attemptedRuntimeFlags.initialize();
    attemptedRuntimeFlags.start();
    expect(attemptedRuntimeFlags.createCandidatePlan(request()).status).toBe(
      "completed",
    );
  });
  it("enforces lifecycle before hostile request inspection", () => {
    const engine = new PlanningEngine();
    const hostile = new Proxy(
      {},
      {
        ownKeys: () => {
          throw new Error("private");
        },
      },
    );
    expect(() => engine.createCandidatePlan(hostile)).toThrow(
      InvalidPlanningStateError,
    );
    engine.initialize();
    engine.start();
    engine.stop();
  });

  it.each([
    null,
    undefined,
    "x",
    1,
    true,
    1n,
    Symbol("x"),
    () => 1,
    [],
    {},
    { ...request(), intent: "invalid" },
    { ...request(), extra: true },
  ])("maps malformed request input exactly", (value) =>
    expect(() => running().createCandidatePlan(value)).toThrow(
      InvalidPlanningInputError,
    ),
  );

  it.each([
    { reasoningOutcome: outcome() },
    { intent: "create-candidate-plan" },
    { intent: undefined, reasoningOutcome: outcome() },
    {
      intent: "create-candidate-plan",
      reasoningOutcome: outcome(),
      extra: undefined,
    },
  ])(
    "rejects missing, explicit undefined, and unexpected request fields",
    (value) => {
      expect(() => running().createCandidatePlan(value)).toThrow(
        InvalidPlanningInputError,
      );
    },
  );

  it("protects top-level and field access with exact precedence", () => {
    const shape = new Proxy(request(), {
      ownKeys: () => {
        throw new TypeError("private");
      },
    });
    expect(() => running().createCandidatePlan(shape)).toThrow(
      InvalidPlanningInputError,
    );
    const descriptor = new Proxy(request(), {
      getOwnPropertyDescriptor: () => {
        throw new TypeError("private descriptor");
      },
    });
    expect(() => running().createCandidatePlan(descriptor)).toThrow(
      InvalidPlanningInputError,
    );
    const badIntent = { intent: "bad" } as Record<string, unknown>;
    Object.defineProperty(badIntent, "reasoningOutcome", {
      enumerable: true,
      get: () => {
        throw new Error("private");
      },
    });
    expect(() => running().createCandidatePlan(badIntent)).toThrow(
      InvalidPlanningInputError,
    );
    const badOutcome = request();
    Object.defineProperty(badOutcome, "reasoningOutcome", {
      enumerable: true,
      get: () => {
        throw new RangeError("private");
      },
    });
    expect(() => running().createCandidatePlan(badOutcome)).toThrow(
      InvalidReasoningOutcomeError,
    );
  });

  it("maps a throwing intent getter to InvalidPlanningInputError privately", () => {
    const hostile = { reasoningOutcome: outcome() } as Record<string, unknown>;
    Object.defineProperty(hostile, "intent", {
      enumerable: true,
      get: () => {
        throw new TypeError("private intent value");
      },
    });
    const beforeKeys = Reflect.ownKeys(hostile);
    let caught: unknown;
    try {
      running().createCandidatePlan(hostile);
    } catch (error) {
      caught = error;
    }
    expect(caught).toBeInstanceOf(InvalidPlanningInputError);
    expect((caught as Error).message).not.toContain("private intent value");
    expect(Reflect.ownKeys(hostile)).toEqual(beforeKeys);
    expect(Object.isFrozen(hostile)).toBe(false);
  });

  it("reads a stateful Reasoning Outcome field exactly once", () => {
    let reads = 0;
    const value = { intent: "create-candidate-plan" } as Record<
      string,
      unknown
    >;
    Object.defineProperty(value, "reasoningOutcome", {
      enumerable: true,
      get: () => {
        reads += 1;
        if (reads > 1) throw new Error("second read");
        return outcome();
      },
    });
    expect(running().createCandidatePlan(value).status).toBe("completed");
    expect(reads).toBe(1);
  });

  it.each([
    null,
    undefined,
    1,
    "outcome",
    [],
    {},
    { ...outcome(), status: "bad" },
    { ...outcome(), category: "bad" },
    { ...outcome(), conclusion: "bad" },
    { ...outcome(), response: "bad" },
    { ...outcome(), nextAction: "none" },
    { ...outcome(), explainability: null },
    { ...outcome(), extra: true },
  ])("maps malformed or contradictory Reasoning Outcomes exactly", (value) =>
    expect(() =>
      running().createCandidatePlan({
        intent: "create-candidate-plan",
        reasoningOutcome: value,
      }),
    ).toThrow(InvalidReasoningOutcomeError),
  );

  it("normalizes hostile nested Reasoning Outcome access privately", () => {
    const hostile = { ...outcome() } as Record<string, unknown>;
    Object.defineProperty(hostile, "response", {
      enumerable: true,
      get: () => {
        throw new TypeError("private response");
      },
    });
    let caught: unknown;
    try {
      running().createCandidatePlan(request(hostile));
    } catch (error) {
      caught = error;
    }
    expect(caught).toBeInstanceOf(InvalidReasoningOutcomeError);
    expect((caught as Error).message).not.toContain("private response");
  });

  it("normalizes a hostile nested Reasoning Outcome Proxy before rule evaluation", () => {
    const input = { ...outcome(), explainability: outcome().explainability };
    const nestedTarget = { ...input.explainability };
    const nested = new Proxy(nestedTarget, {
      ownKeys: () => {
        throw new RangeError("private nested proxy value");
      },
    });
    const hostile = { ...input, explainability: nested };
    const beforeKeys = Reflect.ownKeys(hostile);
    let caught: unknown;
    try {
      running().createCandidatePlan(request(hostile));
    } catch (error) {
      caught = error;
    }
    expect(caught).toBeInstanceOf(InvalidReasoningOutcomeError);
    expect((caught as Error).message).not.toContain(
      "private nested proxy value",
    );
    expect(Reflect.ownKeys(hostile)).toEqual(beforeKeys);
    expect(Object.isFrozen(hostile)).toBe(false);
    expect(Object.isFrozen(nestedTarget)).toBe(false);
  });

  it("rejects enumerable symbol properties throughout the Outcome graph", () => {
    const top = { ...outcome() };
    Object.defineProperty(top, Symbol("extra"), {
      enumerable: true,
      value: true,
    });
    expect(() => running().createCandidatePlan(request(top))).toThrow(
      InvalidReasoningOutcomeError,
    );

    const nested = {
      ...outcome(),
      explainability: { ...outcome().explainability },
    };
    Object.defineProperty(nested.explainability, Symbol("extra"), {
      enumerable: true,
      value: true,
    });
    expect(() => running().createCandidatePlan(request(nested))).toThrow(
      InvalidReasoningOutcomeError,
    );
  });

  it.each(outcomeCases.map((_, index) => index))(
    "maps every M5 category to an exact plan",
    (index) => {
      const sourceOutcome = outcome(index);
      const plan = running().createCandidatePlan(request(sourceOutcome));
      const responds = sourceOutcome.nextAction === "none";
      expect(plan).toEqual({
        status: "completed",
        category: responds ? "respond" : "request-more-context",
        steps: [
          responds
            ? {
                ordinal: 1,
                kind: "respond",
                candidateResponse: sourceOutcome.response,
              }
            : { ordinal: 1, kind: "request-more-context" },
        ],
        source: {
          reasoningStatus: "completed",
          reasoningCategory: sourceOutcome.category,
          candidateNextAction: sourceOutcome.nextAction,
          identityState: sourceOutcome.explainability.identityState,
          memoryReferenceCount:
            sourceOutcome.explainability.memoryReferenceCount,
          knowledgeReferenceCount:
            sourceOutcome.explainability.knowledgeReferenceCount,
          reasoningRuleCategory: sourceOutcome.explainability.ruleCategory,
          authoritativeCapability: "reasoning",
        },
        explainability: {
          consumedReasoningCategory: sourceOutcome.category,
          consumedCandidateNextAction: sourceOutcome.nextAction,
          resultingPlanCategory: responds ? "respond" : "request-more-context",
          candidateStepCount: 1,
          planningRuleCategory: responds
            ? "reasoning-produced-response"
            : "reasoning-requested-more-context",
        },
      });
    },
  );

  it("is deterministic, deeply immutable, and does not mutate input", () => {
    const input = request();
    const before = structuredClone(input);
    const left = running().createCandidatePlan(input);
    const right = running().createCandidatePlan(request(outcome()));
    expect(left).toEqual(right);
    expect(running().createCandidatePlan(request())).toEqual(left);
    expect(input).toEqual(before);
    expect(Object.isFrozen(input)).toBe(false);
    expect(Object.isFrozen(left)).toBe(true);
    expect(Object.isFrozen(left.steps)).toBe(true);
    expect(Object.isFrozen(left.steps[0])).toBe(true);
  });

  it("never mutates or freezes caller input on any failure path", () => {
    const mutableOutcome = () => structuredClone(outcome());
    const cases: ReadonlyArray<
      readonly [PlanningEngine, Record<string, unknown>, new () => Error]
    > = [
      [
        running(),
        { ...request(mutableOutcome()), intent: "invalid" },
        InvalidPlanningInputError,
      ],
      [
        running(),
        request({ ...mutableOutcome(), response: "contradiction" }),
        InvalidReasoningOutcomeError,
      ],
      [
        new PlanningEngine(),
        request(mutableOutcome()),
        InvalidPlanningStateError,
      ],
    ];
    for (const [engine, input, failure] of cases) {
      const before = structuredClone(input);
      expect(() => engine.createCandidatePlan(input)).toThrow(failure);
      expect(input).toEqual(before);
      expect(Object.isFrozen(input)).toBe(false);
      if (
        typeof input.reasoningOutcome === "object" &&
        input.reasoningOutcome !== null
      )
        expect(Object.isFrozen(input.reasoningOutcome)).toBe(false);
    }
  });

  it("requires no other Engine collaborator", () => {
    expect(new PlanningEngine().engineState).toBe("initialize");
    expect(running().createCandidatePlan(request()).status).toBe("completed");
  });
});
