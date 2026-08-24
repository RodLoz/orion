import { describe, expect, it } from "vitest";

import {
  contextualApplicabilityCardinality,
  contextPreparationPredicateKey,
  contextPreparationSubjectKey,
  createContextPreparationSemanticScope,
  createStructuredKnowledgeContextFragment,
  evaluateContextualApplicability,
  InvalidContextPreparationScopeError,
  InvalidStructuredKnowledgeContextFragmentError,
  type StructuredTextualKnowledgeProposition,
} from "../src/index.js";

const scope = createContextPreparationSemanticScope({
  subjectKey: "person",
  predicateKey: "occupation",
});

const candidate = (
  subjectKey: string,
  predicateKey: string,
  textualScalar = "researcher",
): StructuredTextualKnowledgeProposition => ({
  subjectKey: subjectKey as never,
  predicateKey: predicateKey as never,
  textualScalar: textualScalar as never,
});

describe("Contextual Applicability Core language", () => {
  it("creates an immutable exact subject/predicate scope", () => {
    expect(scope).toEqual({ subjectKey: "person", predicateKey: "occupation" });
    expect(Object.isFrozen(scope)).toBe(true);
    expect(contextPreparationSubjectKey("🙂")).toBe("🙂");
    expect(contextPreparationPredicateKey("predicate")).toBe("predicate");
  });

  it.each([
    undefined,
    null,
    {},
    { subjectKey: "person" },
    { predicateKey: "occupation" },
    { subjectKey: "person", predicateKey: "occupation", extra: true },
    { subjectKey: " person", predicateKey: "occupation" },
    { subjectKey: "person", predicateKey: "" },
    { subjectKey: "x".repeat(129), predicateKey: "occupation" },
  ])("rejects invalid scope %j", (input) => {
    expect(() => createContextPreparationSemanticScope(input)).toThrow(
      InvalidContextPreparationScopeError,
    );
  });

  it("accepts exactly 128 Unicode code points and preserves them exactly", () => {
    const subject = "🙂".repeat(128);
    const predicate = "p".repeat(128);
    const bounded = createContextPreparationSemanticScope({
      subjectKey: subject,
      predicateKey: predicate,
    });

    expect([...bounded.subjectKey]).toHaveLength(128);
    expect([...bounded.predicateKey]).toHaveLength(128);
    expect(bounded.subjectKey).toBe(subject);
    expect(bounded.predicateKey).toBe(predicate);
  });

  it("rejects 129 Unicode code points", () => {
    const tooLong = "🙂".repeat(129);

    expect(() =>
      createContextPreparationSemanticScope({
        subjectKey: tooLong,
        predicateKey: "predicate",
      }),
    ).toThrow(InvalidContextPreparationScopeError);
  });

  it("preserves decomposed combining characters without normalization", () => {
    const decomposed = "e\u0301";
    const bounded = createContextPreparationSemanticScope({
      subjectKey: decomposed,
      predicateKey: "predicate",
    });

    expect([...bounded.subjectKey]).toEqual([...decomposed]);
    expect(bounded.subjectKey).toBe(decomposed);
    expect(bounded.subjectKey).not.toBe("é");
  });

  it.each([" ", "\t", "\n", "\u00A0"])(
    "rejects whitespace-only scope coordinates %j",
    (whitespace) => {
      expect(() =>
        createContextPreparationSemanticScope({
          subjectKey: whitespace,
          predicateKey: "predicate",
        }),
      ).toThrow(InvalidContextPreparationScopeError);
    },
  );

  it("compares only exact subject and predicate coordinates", () => {
    expect(
      evaluateContextualApplicability(candidate("person", "occupation"), scope),
    ).toBe("APPLICABLE");
    expect(
      evaluateContextualApplicability(
        candidate("company", "occupation"),
        scope,
      ),
    ).toBe("NOT_APPLICABLE");
    expect(
      evaluateContextualApplicability(candidate("person", "address"), scope),
    ).toBe("NOT_APPLICABLE");
    expect(
      evaluateContextualApplicability(candidate("company", "address"), scope),
    ).toBe("NOT_APPLICABLE");
  });

  it("ignores textualScalar and Identity semantics", () => {
    expect(
      evaluateContextualApplicability(
        candidate("person", "occupation", "engineer"),
        scope,
      ),
    ).toBe("APPLICABLE");
    expect(
      evaluateContextualApplicability(
        candidate("person", "occupation", "teacher"),
        scope,
      ),
    ).toBe("APPLICABLE");
  });

  it("preserves exact-one consequences without selection", () => {
    expect(contextualApplicabilityCardinality([])).toEqual({
      cardinality: "zero",
      canIncorporate: false,
    });
    expect(contextualApplicabilityCardinality(["APPLICABLE"])).toEqual({
      cardinality: "exactly-one",
      canIncorporate: true,
    });
    expect(
      contextualApplicabilityCardinality(["APPLICABLE", "APPLICABLE"]),
    ).toEqual({ cardinality: "more-than-one", canIncorporate: false });
  });

  it("accepts only the approved stable structured fragment fields", () => {
    const fragment = createStructuredKnowledgeContextFragment({
      kind: "structured-knowledge",
      authoritativeOwner: "knowledge",
      semanticValue: {
        subjectKey: "person",
        predicateKey: "occupation",
        textualScalar: "researcher",
      },
      propositionIdentity: "proposition-1",
      knowledgeIdentity: "knowledge-1",
      knowledgeVersion: 1,
      sourceOwnershipCorrespondence: {
        currentnessOwner: "knowledge-owned-currentness",
      },
      sourceCurrentnessCorrespondence: {
        currentnessOwner: "knowledge-owned-currentness",
      },
      attribution: { authoritativeCapability: "knowledge" },
      issuance: Object.freeze({}) as never,
    });
    expect(Object.isFrozen(fragment)).toBe(true);
    expect(Object.isFrozen(fragment.projection)).toBe(true);
    expect(fragment.projection).not.toHaveProperty(
      "contextPreparationSemanticScope",
    );
    expect(fragment.projection).not.toHaveProperty(
      "candidatePreparationAssociation",
    );
    expect(fragment.projection).not.toHaveProperty("provenance");
    expect(fragment.projection).not.toHaveProperty("acceptanceEvidence");
    expect(() =>
      createStructuredKnowledgeContextFragment({
        kind: "structured-knowledge",
        authoritativeOwner: "knowledge",
        semanticValue: {
          subjectKey: "person",
          predicateKey: "occupation",
          textualScalar: "researcher",
        },
        propositionIdentity: "proposition-1",
        knowledgeIdentity: "knowledge-1",
        knowledgeVersion: 1,
        sourceOwnershipCorrespondence: {
          currentnessOwner: "knowledge-owned-currentness",
        },
        sourceCurrentnessCorrespondence: {
          currentnessOwner: "knowledge-owned-currentness",
        },
        attribution: { authoritativeCapability: "knowledge" },
        issuance: Object.freeze({}) as never,
        candidatePreparationAssociation: "prep-1",
      }),
    ).toThrow(InvalidStructuredKnowledgeContextFragmentError);
  });
});
