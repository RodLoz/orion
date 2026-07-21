import { describe, expect, it } from "vitest";
import {
  CANDIDATE_CONCLUSION_MAX_CODE_POINTS,
  CANDIDATE_RESPONSE_MAX_CODE_POINTS,
  InvalidCandidateConclusionValueError,
  InvalidCandidateResponseValueError,
  InvalidReasoningExplainabilityValueError,
  InvalidReasoningOutcomeValueError,
  InvalidReasoningQueryValueError,
  REASONING_QUERY_MAX_CODE_POINTS,
  candidateConclusion,
  candidateResponse,
  createContextConsumptionReference,
  createReasoningExplainabilitySummary,
  createReasoningOutcome,
  reasoningQuery,
} from "../src/index.js";

const contextReference = () => ({
  lineageIdentity: "context.lineage.m5",
  revisionIdentity: "context.revision.m5",
  revisionNumber: 1,
  lifecycleState: "active",
  authoritativeCapability: "context",
});

describe("Reasoning Core domain", () => {
  it.each([
    [
      reasoningQuery,
      REASONING_QUERY_MAX_CODE_POINTS,
      InvalidReasoningQueryValueError,
    ],
    [
      candidateConclusion,
      CANDIDATE_CONCLUSION_MAX_CODE_POINTS,
      InvalidCandidateConclusionValueError,
    ],
    [
      candidateResponse,
      CANDIDATE_RESPONSE_MAX_CODE_POINTS,
      InvalidCandidateResponseValueError,
    ],
  ] as const)(
    "enforces Unicode code-point text bounds",
    (factory, maximum, Failure) => {
      expect(factory("x")).toBe("x");
      expect(factory("x".repeat(maximum - 1))).toHaveLength(maximum - 1);
      expect(factory("😀".repeat(maximum))).toHaveLength(maximum * 2);
      expect(() => factory("😀".repeat(maximum + 1))).toThrow(Failure);
      for (const invalid of [null, undefined, 1, {}, [], ["text"], "", "   "])
        expect(() => factory(invalid)).toThrow(Failure);
      const mixed = "a".repeat(maximum - 1) + "😀";
      expect(factory(mixed)).toBe(mixed);
    },
  );

  it.each([
    null,
    undefined,
    "summary",
    1,
    true,
    Symbol("summary"),
    1n,
    () => undefined,
    [],
    [contextReference()],
    {},
    { identityState: "anonymous" },
    {
      contextConsumptionReference: contextReference(),
      identityState: "anonymous",
      memoryReferenceCount: 0,
      knowledgeReferenceCount: 0,
      ruleCategory: "anonymous-identity",
      extra: true,
    },
  ])("rejects every malformed Explainability top-level input", (value) => {
    expect(() => createReasoningExplainabilitySummary(value)).toThrow(
      InvalidReasoningExplainabilityValueError,
    );
  });

  it.each([
    null,
    undefined,
    "outcome",
    1,
    false,
    Symbol("outcome"),
    1n,
    () => undefined,
    [],
    ["completed"],
    {},
    { status: "completed" },
    {
      status: "completed",
      category: "context-only",
      conclusion: "Candidate.",
      response: "Response.",
      nextAction: "request-more-context",
      explainability: {
        contextConsumptionReference: contextReference(),
        identityState: "authenticated",
        memoryReferenceCount: 0,
        knowledgeReferenceCount: 0,
        ruleCategory: "authenticated-context-only",
      },
      extra: true,
    },
  ])("rejects every malformed Outcome top-level input", (value) => {
    expect(() => createReasoningOutcome(value)).toThrow(
      InvalidReasoningOutcomeValueError,
    );
  });

  it("defensively reconstructs a deeply immutable outcome", () => {
    const callerReference = contextReference();
    const callerExplainability = {
      contextConsumptionReference: callerReference,
      identityState: "authenticated",
      memoryReferenceCount: 1,
      knowledgeReferenceCount: 2,
      ruleCategory: "authenticated-with-knowledge",
    };
    const outcome = createReasoningOutcome({
      status: "completed",
      category: "knowledge-grounded-context",
      conclusion: "Candidate only.",
      response: "Proposed response.",
      nextAction: "none",
      explainability: callerExplainability,
    });
    callerReference.revisionNumber = 2;
    callerExplainability.memoryReferenceCount = 9;
    expect(
      outcome.explainability.contextConsumptionReference.revisionNumber,
    ).toBe(1);
    expect(outcome.explainability.memoryReferenceCount).toBe(1);
    expect(Object.isFrozen(outcome)).toBe(true);
    expect(Object.isFrozen(outcome.explainability)).toBe(true);
    expect(
      Object.isFrozen(outcome.explainability.contextConsumptionReference),
    ).toBe(true);
    expect(
      Reflect.set(outcome.explainability, "memoryReferenceCount", 10),
    ).toBe(false);
  });

  it("rejects malformed exact-shape factories and hostile values", () => {
    expect(() =>
      createContextConsumptionReference({ ...contextReference(), extra: true }),
    ).toThrow();
    expect(() => createReasoningExplainabilitySummary({})).toThrow();
    expect(() =>
      createReasoningOutcome(
        new Proxy(
          {},
          {
            getPrototypeOf: () => {
              throw new Error("hostile");
            },
          },
        ),
      ),
    ).toThrow();
    expect(() => reasoningQuery({ toString: () => "query" })).toThrow();
  });

  it.each([null, undefined, 1, "reference", [], {}])(
    "normalizes every invalid Context Consumption Reference shape",
    (value) => {
      expect(() => createContextConsumptionReference(value)).toThrow(
        "Context Consumption Reference is invalid.",
      );
    },
  );

  it("normalizes hostile getters and Proxy traps in every object factory", () => {
    const throwingReference = contextReference();
    Object.defineProperty(throwingReference, "revisionIdentity", {
      enumerable: true,
      get: () => {
        throw new TypeError("hostile reference");
      },
    });
    expect(() => createContextConsumptionReference(throwingReference)).toThrow(
      "Context Consumption Reference is invalid.",
    );

    const hostileExplainability = new Proxy(
      {},
      {
        ownKeys: () => {
          throw new RangeError("hostile explainability");
        },
      },
    );
    expect(() =>
      createReasoningExplainabilitySummary(hostileExplainability),
    ).toThrow(InvalidReasoningExplainabilityValueError);
    const throwingExplainability = {
      contextConsumptionReference: contextReference(),
      get identityState(): never {
        throw new TypeError("private explainability value");
      },
      memoryReferenceCount: 0,
      knowledgeReferenceCount: 0,
      ruleCategory: "anonymous-identity",
    };
    expect(() =>
      createReasoningExplainabilitySummary(throwingExplainability),
    ).toThrow(InvalidReasoningExplainabilityValueError);

    const hostileOutcome = new Proxy(
      {},
      {
        getOwnPropertyDescriptor: () => {
          throw { hostile: true };
        },
      },
    );
    expect(() => createReasoningOutcome(hostileOutcome)).toThrow(
      InvalidReasoningOutcomeValueError,
    );
    const throwingOutcome = {
      status: "completed",
      category: "context-only",
      conclusion: "Candidate.",
      get response(): never {
        throw new RangeError("private outcome value");
      },
      nextAction: "request-more-context",
      explainability: {
        contextConsumptionReference: contextReference(),
        identityState: "authenticated",
        memoryReferenceCount: 0,
        knowledgeReferenceCount: 0,
        ruleCategory: "authenticated-context-only",
      },
    };
    expect(() => createReasoningOutcome(throwingOutcome)).toThrow(
      InvalidReasoningOutcomeValueError,
    );
  });

  it("validates every controlled nested Outcome field exactly", () => {
    const valid = {
      status: "completed",
      category: "context-only",
      conclusion: "Candidate.",
      response: "Response.",
      nextAction: "request-more-context",
      explainability: {
        contextConsumptionReference: contextReference(),
        identityState: "authenticated",
        memoryReferenceCount: 0,
        knowledgeReferenceCount: 0,
        ruleCategory: "authenticated-context-only",
      },
    };
    expect(createReasoningOutcome(valid)).toMatchObject(valid);
    for (const invalid of [
      { ...valid, nextAction: "execute" },
      { ...valid, category: "unknown" },
      { ...valid, status: "pending" },
      { ...valid, extra: true },
      { ...valid, conclusion: { toString: () => "Candidate." } },
      { ...valid, response: ["Response."] },
      { ...valid, explainability: null },
    ]) {
      expect(() => createReasoningOutcome(invalid)).toThrow(
        "Reasoning Outcome is invalid.",
      );
    }
  });

  it("defensively reconstructs mutable nested reference input", () => {
    const reference = contextReference();
    const summary = createReasoningExplainabilitySummary({
      contextConsumptionReference: reference,
      identityState: "anonymous",
      memoryReferenceCount: 0,
      knowledgeReferenceCount: 0,
      ruleCategory: "anonymous-identity",
    });
    reference.lineageIdentity = "context.lineage.changed";
    expect(summary.contextConsumptionReference.lineageIdentity).toBe(
      "context.lineage.m5",
    );
    expect(Object.isFrozen(summary)).toBe(true);
    expect(Object.isFrozen(summary.contextConsumptionReference)).toBe(true);
  });
});
