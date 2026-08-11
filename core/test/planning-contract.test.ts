import { describe, expect, expectTypeOf, it } from "vitest";
import {
  InvalidPlanningStateError,
  InvalidPlanningAuthorityRequestError,
  InvalidPlanningAuthorityStateError,
  PlanningAuthorityVerificationError,
  createCandidatePlan,
  createCandidatePlanStep,
  createPlanningExplainabilitySummary,
  createReasoningConsumptionReference,
  type VerifyCandidatePlanAuthorityRequest,
} from "../src/index.js";

const source = () => ({
  reasoningStatus: "completed",
  reasoningCategory: "context-only",
  candidateNextAction: "request-more-context",
  identityState: "authenticated",
  reasoningRuleCategory: "authenticated-context-only",
  authoritativeCapability: "reasoning",
});
const explainability = () => ({
  consumedReasoningCategory: "context-only",
  consumedCandidateNextAction: "request-more-context",
  resultingPlanCategory: "request-more-context",
  candidateStepCount: 1,
  planningRuleCategory: "reasoning-requested-more-context",
});
const validPlan = (
  steps: unknown = [{ ordinal: 1, kind: "request-more-context" }],
) => ({
  status: "completed",
  category: "request-more-context",
  steps,
  source: source(),
  explainability: explainability(),
});

const validSources = [
  {
    reasoningStatus: "completed",
    reasoningCategory: "anonymous-context",
    candidateNextAction: "request-more-context",
    identityState: "anonymous",
    reasoningRuleCategory: "anonymous-identity",
    authoritativeCapability: "reasoning",
  },
  source(),
] as const;

describe("Planning Core factories", () => {
  it("defines the exact Planning authority request and closed failures", () => {
    const request = {
      intent: "verify-candidate-plan-authority",
      candidate: {} as never,
      consumedReasoningOutcome: {} as never,
      expectedReasoningStatus: "completed",
      expectedReasoningCategory: "context-only",
      expectedCandidateNextAction: "request-more-context",
      expectedIdentityState: "authenticated",
      expectedReasoningRuleCategory: "authenticated-context-only",
    } satisfies VerifyCandidatePlanAuthorityRequest;
    expect(Object.keys(request)).toHaveLength(8);
    expectTypeOf<keyof VerifyCandidatePlanAuthorityRequest>().toEqualTypeOf<
      | "intent"
      | "candidate"
      | "consumedReasoningOutcome"
      | "expectedReasoningStatus"
      | "expectedReasoningCategory"
      | "expectedCandidateNextAction"
      | "expectedIdentityState"
      | "expectedReasoningRuleCategory"
    >();
    expect(new InvalidPlanningAuthorityRequestError().name).toBe(
      "InvalidPlanningAuthorityRequestError",
    );
    expect(new PlanningAuthorityVerificationError().name).toBe(
      "PlanningAuthorityVerificationError",
    );
    expect(new InvalidPlanningAuthorityStateError().name).toBe(
      "InvalidPlanningAuthorityStateError",
    );

    const { candidate: omittedCandidate, ...missingCandidate } = request;
    expect(omittedCandidate).toBeDefined();
    // @ts-expect-error Candidate Plan is required.
    const invalidMissingCandidate: VerifyCandidatePlanAuthorityRequest =
      missingCandidate;
    expect(invalidMissingCandidate).toBeDefined();

    const {
      consumedReasoningOutcome: omittedReasoning,
      ...missingConsumedReasoning
    } = request;
    expect(omittedReasoning).toBeDefined();
    // @ts-expect-error Exact consumed Reasoning Outcome is required.
    const invalidMissingReasoning: VerifyCandidatePlanAuthorityRequest =
      missingConsumedReasoning;
    expect(invalidMissingReasoning).toBeDefined();

    const {
      expectedReasoningRuleCategory: omittedRule,
      ...missingCorrespondence
    } = request;
    expect(omittedRule).toBe("authenticated-context-only");
    // @ts-expect-error Complete Planning correspondence is required.
    const invalidMissingCorrespondence: VerifyCandidatePlanAuthorityRequest =
      missingCorrespondence;
    expect(invalidMissingCorrespondence).toBeDefined();

    const invalidExtra: VerifyCandidatePlanAuthorityRequest = {
      ...request,
      // @ts-expect-error Extra authority-request fields are prohibited.
      extra: true,
    };
    expect(invalidExtra).toBeDefined();

    const invalidCandidate: VerifyCandidatePlanAuthorityRequest = {
      ...request,
      // @ts-expect-error Candidate must be a Candidate Plan.
      candidate: "not-a-candidate-plan",
    };
    expect(invalidCandidate).toBeDefined();

    const invalidUpstream: VerifyCandidatePlanAuthorityRequest = {
      ...request,
      // @ts-expect-error Consumed input must be a Reasoning Outcome.
      consumedReasoningOutcome: "not-a-reasoning-outcome",
    };
    expect(invalidUpstream).toBeDefined();
  });

  it("constructs both exact immutable step variants", () => {
    const request = createCandidatePlanStep({
      ordinal: 1,
      kind: "request-more-context",
    });
    const respond = createCandidatePlanStep({
      ordinal: 1,
      kind: "respond",
      candidateResponse: "Prepared response.",
    });
    expect(request).toEqual({ ordinal: 1, kind: "request-more-context" });
    expect(respond).toEqual({
      ordinal: 1,
      kind: "respond",
      candidateResponse: "Prepared response.",
    });
    expect(Object.isFrozen(request)).toBe(true);
    expect(Object.isFrozen(respond)).toBe(true);
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
    { ordinal: 1, kind: "respond" },
    { ordinal: 1, kind: "request-more-context", extra: true },
  ])("rejects malformed step values without coercion", (value) =>
    expect(() => createCandidatePlanStep(value)).toThrow(
      InvalidPlanningStateError,
    ),
  );

  it("constructs immutable source and explainability summaries", () => {
    const createdSource = createReasoningConsumptionReference(source());
    const createdExplainability =
      createPlanningExplainabilitySummary(explainability());
    expect(createdSource).toEqual(source());
    expect(createdExplainability).toEqual(explainability());
    expect(Object.isFrozen(createdSource)).toBe(true);
    expect(Object.isFrozen(createdExplainability)).toBe(true);
  });

  it("accepts every valid closed M5 source correspondence", () => {
    for (const value of validSources)
      expect(createReasoningConsumptionReference(value)).toEqual(value);
  });

  it.each([
    { ...validSources[0], identityState: "authenticated" },
    { ...validSources[1], identityState: "anonymous" },
  ])("rejects contradictory M5 source correspondence", (value) => {
    expect(() => createReasoningConsumptionReference(value)).toThrow(
      InvalidPlanningStateError,
    );
  });

  it.each([
    {
      consumedReasoningCategory: "anonymous-context",
      consumedCandidateNextAction: "request-more-context",
      resultingPlanCategory: "request-more-context",
      candidateStepCount: 1,
      planningRuleCategory: "reasoning-requested-more-context",
    },
    explainability(),
  ])("accepts every valid Planning mapping tuple", (value) => {
    expect(createPlanningExplainabilitySummary(value)).toEqual(value);
  });

  it.each([
    { ...explainability(), resultingPlanCategory: "respond" },
    {
      ...explainability(),
      planningRuleCategory: "reasoning-produced-response",
    },
    {
      ...explainability(),
      consumedReasoningCategory: "unknown-context",
    },
    {
      ...explainability(),
      consumedCandidateNextAction: "none",
    },
    {
      ...explainability(),
      consumedCandidateNextAction: "none",
      resultingPlanCategory: "respond",
    },
    { ...explainability(), candidateStepCount: 0 },
    { ...explainability(), candidateStepCount: 2 },
  ])("rejects contradictory Planning explainability", (value) => {
    expect(() => createPlanningExplainabilitySummary(value)).toThrow(
      InvalidPlanningStateError,
    );
  });

  it("rejects every explainability action, plan, and rule cross-combination", () => {
    const categories = ["anonymous-context", "context-only"] as const;
    const actions = ["none", "request-more-context"] as const;
    const plans = ["respond", "request-more-context"] as const;
    const rules = [
      "reasoning-produced-response",
      "reasoning-requested-more-context",
    ] as const;
    for (const consumedReasoningCategory of categories)
      for (const consumedCandidateNextAction of actions)
        for (const resultingPlanCategory of plans)
          for (const planningRuleCategory of rules) {
            const value = {
              consumedReasoningCategory,
              consumedCandidateNextAction,
              resultingPlanCategory,
              candidateStepCount: 1,
              planningRuleCategory,
            };
            const valid =
              (consumedReasoningCategory === "context-only" &&
                consumedCandidateNextAction === "none" &&
                resultingPlanCategory === "respond" &&
                planningRuleCategory === "reasoning-produced-response") ||
              (consumedCandidateNextAction === "request-more-context" &&
                resultingPlanCategory === "request-more-context" &&
                planningRuleCategory === "reasoning-requested-more-context");
            if (valid)
              expect(createPlanningExplainabilitySummary(value)).toEqual(value);
            else
              expect(() => createPlanningExplainabilitySummary(value)).toThrow(
                InvalidPlanningStateError,
              );
          }
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
    [source()],
    {},
    { ...source(), extra: true },
  ])("rejects malformed source inputs", (value) =>
    expect(() => createReasoningConsumptionReference(value)).toThrow(
      InvalidPlanningStateError,
    ),
  );
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
    [explainability()],
    {},
    { ...explainability(), extra: true },
  ])("rejects malformed explainability inputs", (value) =>
    expect(() => createPlanningExplainabilitySummary(value)).toThrow(
      InvalidPlanningStateError,
    ),
  );

  it("creates a deeply immutable Candidate Plan without retaining inputs", () => {
    const steps = [{ ordinal: 1, kind: "request-more-context" }];
    const input = validPlan(steps);
    const plan = createCandidatePlan(input);
    steps[0]!.kind = "changed";
    expect(plan).toEqual(validPlan());
    expect(Object.isFrozen(plan)).toBe(true);
    expect(Object.isFrozen(plan.steps)).toBe(true);
    expect(Object.isFrozen(plan.steps[0])).toBe(true);
    expect(Object.isFrozen(plan.source)).toBe(true);
    expect(Object.isFrozen(plan.explainability)).toBe(true);
    expect(Object.isFrozen(input)).toBe(false);
    expect(Object.isFrozen(steps)).toBe(false);
  });

  it("accepts only a dense exact one-element steps array", () => {
    const valid = [{ ordinal: 1, kind: "request-more-context" }];
    expect(Object.keys(valid)).toEqual(["0"]);
    expect(Object.getOwnPropertyDescriptor(valid, "length")?.enumerable).toBe(
      false,
    );
    expect(createCandidatePlan(validPlan(valid)).steps).toHaveLength(1);
  });

  it("rejects a non-enumerable index zero", () => {
    const steps: unknown[] = [];
    Object.defineProperty(steps, "0", {
      configurable: true,
      enumerable: false,
      value: { ordinal: 1, kind: "request-more-context" },
      writable: true,
    });
    Object.defineProperty(steps, "length", { value: 1 });
    expect(() => createCandidatePlan(validPlan(steps))).toThrow(
      InvalidPlanningStateError,
    );
  });

  it("rejects every invalid steps array shape exactly", () => {
    const sparse = new Array(1);
    const extraString = [{ ordinal: 1, kind: "request-more-context" }];
    Object.assign(extraString, { extra: true });
    const extraSymbol = [{ ordinal: 1, kind: "request-more-context" }];
    Object.defineProperty(extraSymbol, Symbol("extra"), {
      enumerable: true,
      value: true,
    });
    const throwingIndex: unknown[] = [];
    Object.defineProperty(throwingIndex, "0", {
      enumerable: true,
      get: () => {
        throw new TypeError("private");
      },
    });
    Object.defineProperty(throwingIndex, "length", { value: 1 });
    const hostile = new Proxy([{ ordinal: 1, kind: "request-more-context" }], {
      ownKeys: () => {
        throw new Error("private");
      },
    });
    const hostileDescriptor = new Proxy(
      [{ ordinal: 1, kind: "request-more-context" }],
      {
        getOwnPropertyDescriptor: () => {
          throw new RangeError("private descriptor");
        },
      },
    );
    const cases: unknown[] = [
      [],
      [
        { ordinal: 1, kind: "request-more-context" },
        { ordinal: 1, kind: "request-more-context" },
      ],
      sparse,
      extraString,
      extraSymbol,
      [{ ordinal: 2, kind: "request-more-context" }],
      { 0: { ordinal: 1, kind: "request-more-context" }, length: 1 },
      { toString: () => "step" },
      throwingIndex,
      hostile,
      hostileDescriptor,
    ];
    for (const steps of cases)
      expect(() => createCandidatePlan(validPlan(steps))).toThrow(
        InvalidPlanningStateError,
      );
  });

  it("normalizes hostile factory inspection without exposing native failures", () => {
    const hostile = new Proxy(
      {},
      {
        ownKeys: () => {
          throw new RangeError("private value");
        },
      },
    );
    let caught: unknown;
    try {
      createCandidatePlan(hostile);
    } catch (error) {
      caught = error;
    }
    expect(caught).toBeInstanceOf(InvalidPlanningStateError);
    expect((caught as Error).message).not.toContain("private value");
  });

  it("normalizes hostile inspection for every public Planning factory", () => {
    const factories: ReadonlyArray<
      readonly [(value: unknown) => unknown, object]
    > = [
      [createCandidatePlanStep, { ordinal: 1, kind: "request-more-context" }],
      [createReasoningConsumptionReference, source()],
      [createPlanningExplainabilitySummary, explainability()],
      [createCandidatePlan, validPlan()],
    ];
    for (const [factory, valid] of factories) {
      const getter = { ...valid };
      const firstKey = Object.keys(getter)[0]!;
      Object.defineProperty(getter, firstKey, {
        enumerable: true,
        get: () => {
          throw new TypeError("private factory value");
        },
      });
      const descriptor = new Proxy(valid, {
        getOwnPropertyDescriptor: () => {
          throw new RangeError("private descriptor");
        },
      });
      for (const hostile of [getter, descriptor]) {
        let caught: unknown;
        try {
          factory(hostile);
        } catch (error) {
          caught = error;
        }
        expect(caught).toBeInstanceOf(InvalidPlanningStateError);
        expect((caught as Error).message).not.toContain("private");
      }
    }
  });

  it("applies inherited Unicode code-point bounds to respond steps", () => {
    const maximum = "😀".repeat(2048);
    expect(
      createCandidatePlanStep({
        ordinal: 1,
        kind: "respond",
        candidateResponse: maximum,
      }),
    ).toMatchObject({ candidateResponse: maximum });
    expect(() =>
      createCandidatePlanStep({
        ordinal: 1,
        kind: "respond",
        candidateResponse: `${maximum}😀`,
      }),
    ).toThrow(InvalidPlanningStateError);
    expect(() =>
      createCandidatePlanStep({
        ordinal: 1,
        kind: "respond",
        candidateResponse: ["coercible"],
      }),
    ).toThrow(InvalidPlanningStateError);
  });

  it("reads a stateful steps index exactly once", () => {
    let reads = 0;
    const steps: unknown[] = [];
    Object.defineProperty(steps, "0", {
      enumerable: true,
      get: () => {
        reads += 1;
        if (reads > 1) throw new Error("second read");
        return { ordinal: 1, kind: "request-more-context" };
      },
    });
    Object.defineProperty(steps, "length", { value: 1 });
    expect(createCandidatePlan(validPlan(steps)).status).toBe("completed");
    expect(reads).toBe(1);
  });

  it("rejects empty, populated, and symbol-decorated arrays for every exact-object factory", () => {
    const factories = [
      [createCandidatePlanStep, { ordinal: 1, kind: "request-more-context" }],
      [createReasoningConsumptionReference, source()],
      [createPlanningExplainabilitySummary, explainability()],
      [createCandidatePlan, validPlan()],
    ] as const;
    for (const [factory, populatedValue] of factories) {
      const populated = [populatedValue];
      const symbolDecorated: unknown[] = [];
      Object.defineProperty(symbolDecorated, Symbol("extra"), {
        enumerable: true,
        value: true,
      });
      for (const value of [[], populated, symbolDecorated])
        expect(() => factory(value)).toThrow(InvalidPlanningStateError);
    }
  });
});
