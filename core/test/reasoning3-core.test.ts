import { describe, expect, it } from "vitest";
import {
  InvalidBoundedReasoningQueryValueError,
  InvalidReasoning3StructuredKnowledgeTupleValueError,
  InvalidReasoning3TextualScalarValueError,
  InvalidReasoningSufficiencyInputError,
  UnsupportedReasoningQueryKindError,
  createBoundedReasoningQuery,
  createReasoning3StructuredKnowledgeTuple,
  createReasoningOutcome,
  evaluateReasoningApplicability,
  evaluateReasoningSufficiency,
  reasoning3SubjectKey,
  reasoning3TextualScalar,
  type ReasoningOutcomeCategory,
} from "../src/index.js";

const key = "subject.person";
const predicate = "attribute.name";
const tuple = {
  subjectKey: key,
  predicateKey: predicate,
  textualScalar: "Ada Lovelace",
};
const query = {
  kind: "exact-text-attribute-value" as const,
  subjectKey: key,
  predicateKey: predicate,
};

describe("Reasoning 3 Core bounded language", () => {
  it("accepts the exact bounded query and preserves its values", () => {
    expect(createBoundedReasoningQuery(query)).toEqual(query);
    expect(Object.isFrozen(createBoundedReasoningQuery(query))).toBe(true);
    expect(reasoning3TextualScalar(" value ")).toBe(" value ");
  });

  it("enforces governed identifier boundaries without normalization", () => {
    expect(reasoning3SubjectKey("x")).toBe("x");
    expect(reasoning3SubjectKey("a".repeat(128))).toHaveLength(128);
    expect(reasoning3SubjectKey("😀".repeat(128))).toHaveLength(256);
    expect(reasoning3SubjectKey("e\u0301")).toBe("e\u0301");
    expect(reasoning3SubjectKey("CaseSensitive")).toBe("CaseSensitive");
    for (const value of [
      "",
      "   ",
      " leading",
      "trailing ",
      "a".repeat(129),
      "bad\u0000key",
    ]) {
      expect(() => reasoning3SubjectKey(value)).toThrow();
    }
  });

  it("rejects malformed queries and unsupported kinds distinctly", () => {
    expect(() =>
      createBoundedReasoningQuery({ ...query, subjectKey: "" }),
    ).toThrow(InvalidBoundedReasoningQueryValueError);
    expect(() =>
      createBoundedReasoningQuery({ ...query, kind: "fuzzy" }),
    ).toThrow(UnsupportedReasoningQueryKindError);
    expect(() =>
      createBoundedReasoningQuery({ ...query, optional: "not permitted" }),
    ).toThrow(InvalidBoundedReasoningQueryValueError);
  });

  it("evaluates exact applicability using only subject and predicate", () => {
    expect(evaluateReasoningApplicability(query, tuple)).toBe("APPLICABLE");
    expect(
      evaluateReasoningApplicability(query, {
        ...tuple,
        subjectKey: "other.subject",
      }),
    ).toBe("NOT_APPLICABLE");
    expect(
      evaluateReasoningApplicability(query, {
        ...tuple,
        predicateKey: "other.attribute",
      }),
    ).toBe("NOT_APPLICABLE");
    expect(
      evaluateReasoningApplicability(query, {
        ...tuple,
        subjectKey: "other.subject",
        predicateKey: "other",
      }),
    ).toBe("NOT_APPLICABLE");
    expect(
      evaluateReasoningApplicability(query, {
        ...tuple,
        textualScalar: "different value",
      }),
    ).toBe("APPLICABLE");
    expect(() =>
      evaluateReasoningApplicability({ ...query, subjectKey: "" }, tuple),
    ).toThrow();
  });

  it("validates the structured tuple and closes first-slice sufficiency", () => {
    expect(createReasoning3StructuredKnowledgeTuple(tuple)).toEqual(tuple);
    expect(evaluateReasoningSufficiency(query, tuple, "APPLICABLE")).toBe(
      "SUFFICIENT",
    );
    expect(() =>
      evaluateReasoningSufficiency(query, tuple, "NOT_APPLICABLE"),
    ).toThrow(InvalidReasoningSufficiencyInputError);
    expect(() =>
      createReasoning3StructuredKnowledgeTuple({
        ...tuple,
        textualScalar: "bad\u0000scalar",
      }),
    ).toThrow(InvalidReasoning3StructuredKnowledgeTupleValueError);
    expect(() => reasoning3TextualScalar("bad\u0000scalar")).toThrow(
      InvalidReasoning3TextualScalarValueError,
    );
  });

  it("rejects prohibited metadata from the semantic tuple view", () => {
    expect(() =>
      createReasoning3StructuredKnowledgeTuple({
        ...tuple,
        provenance: "private",
        currentness: "opaque",
        attribution: "opaque",
        ContextPreparationSemanticScope: "opaque",
        CandidatePreparationAssociation: "opaque",
      }),
    ).toThrow(InvalidReasoning3StructuredKnowledgeTupleValueError);
  });

  it("represents every governed Reasoning 3 outcome category without fallback", () => {
    const categories: readonly ReasoningOutcomeCategory[] = [
      "anonymous-context",
      "context-only",
      "knowledge-grounded-success",
      "knowledge-not-applicable",
      "knowledge-insufficient",
    ];
    for (const category of categories) {
      const knowledge = category.startsWith("knowledge-");
      const response = knowledge ? "A" : "A response";
      const ruleCategory =
        category === "knowledge-grounded-success"
          ? "authenticated-knowledge-applicable-sufficient"
          : category === "knowledge-not-applicable"
            ? "authenticated-knowledge-not-applicable"
            : category === "knowledge-insufficient"
              ? "authenticated-knowledge-applicable-insufficient"
              : category === "anonymous-context"
                ? "anonymous-identity"
                : "authenticated-context-only";
      expect(
        createReasoningOutcome({
          status: "completed",
          category,
          conclusion: "bounded conclusion",
          response,
          nextAction:
            category === "knowledge-grounded-success"
              ? "none"
              : "request-more-context",
          explainability: {
            contextConsumptionReference: {
              lineageIdentity: "context.lineage.reasoning3",
              revisionIdentity: "context.revision.reasoning3",
              revisionNumber: 1,
              lifecycleState: "active",
              authoritativeCapability: "context",
            },
            identityState:
              category === "anonymous-context" ? "anonymous" : "authenticated",
            ruleCategory,
          },
        }).category,
      ).toBe(category);
    }
    expect(() =>
      createReasoningOutcome({
        status: "completed",
        category: "fallback",
      }),
    ).toThrow();
  });
});
