import {
  InvalidReasoningInputError,
  type ActiveContextRevision,
  type VerifyActiveContextRevisionAuthority,
} from "@orion/core";
import { describe, expect, it } from "vitest";
import { ReasoningEngine } from "../src/index.js";

function structuredContext(
  subjectKey = "subject.person",
  predicateKey = "attribute.name",
  textualScalar = "Ada Lovelace",
  identityState: "authenticated" | "anonymous" = "authenticated",
): ActiveContextRevision {
  return Object.freeze({
    lineageIdentity: "context.lineage.reasoning3",
    revisionIdentity: "context.revision.reasoning3",
    revisionNumber: 1,
    creationMetadata: Object.freeze({
      createdAt: "2026-08-19T14:00:00.000Z",
      sourceCount: 2,
      fragmentCount: 2,
    }),
    lifecycleState: "active",
    fragments: Object.freeze([
      Object.freeze({
        kind: "identity",
        authoritativeOwner: "identity",
        projection: Object.freeze({
          state: identityState,
          authoritativeOwner: "identity",
          ...(identityState === "authenticated"
            ? { identityIdentifier: "orion.identity.reasoning3" }
            : {}),
        }),
      }),
      Object.freeze({
        kind: "structured-knowledge",
        authoritativeOwner: "knowledge",
        projection: Object.freeze({
          semanticValue: Object.freeze({
            subjectKey,
            predicateKey,
            textualScalar,
          }),
        }),
      }),
    ]),
  }) as unknown as ActiveContextRevision;
}

function running(): ReasoningEngine {
  const contextAuthority: VerifyActiveContextRevisionAuthority = {
    verifyActiveContextRevisionAuthority(request) {
      return request.candidate;
    },
  };
  const engine = new ReasoningEngine(contextAuthority);
  engine.initialize();
  engine.start();
  return engine;
}

function request(
  activeContextRevision: ActiveContextRevision,
  subjectKey = "subject.person",
  predicateKey = "attribute.name",
) {
  return {
    intent: "evaluate",
    activeContextRevision,
    query: {
      kind: "exact-text-attribute-value" as const,
      subjectKey,
      predicateKey,
    },
  };
}

describe("ReasoningEngine Reasoning 3 bounded Profile B", () => {
  it("evaluates an applicable tuple as grounded success", () => {
    const engine = running();
    const context = structuredContext();
    const outcome = engine.evaluateReasoning3(request(context));

    expect(outcome).toMatchObject({
      category: "knowledge-grounded-success",
      nextAction: "none",
      explainability: {
        identityState: "authenticated",
        ruleCategory: "authenticated-knowledge-applicable-sufficient",
      },
    });
    expect(
      engine.verifyReasoningOutcomeAuthority({
        intent: "verify-reasoning-outcome-authority",
        candidate: outcome,
        consumedContextRevision: context,
        expectedLineageIdentity: context.lineageIdentity,
        expectedRevisionIdentity: context.revisionIdentity,
        expectedRevisionNumber: context.revisionNumber,
      }),
    ).toBe(outcome);
  });

  it.each([
    ["subject mismatch", "other.subject", "attribute.name"],
    ["predicate mismatch", "subject.person", "other.attribute"],
  ])("returns not-applicable for a %s", (_label, subject, predicate) => {
    const outcome = running().evaluateReasoning3(
      request(structuredContext(), subject, predicate),
    );
    expect(outcome).toMatchObject({
      category: "knowledge-not-applicable",
      nextAction: "request-more-context",
      explainability: {
        identityState: "authenticated",
        ruleCategory: "authenticated-knowledge-not-applicable",
      },
    });
  });

  it("does not use textualScalar for applicability and preserves it internally", () => {
    const outcome = running().evaluateReasoning3(
      request(structuredContext("subject.person", "attribute.name", " exact ")),
    );
    expect(outcome.category).toBe("knowledge-grounded-success");
    expect(outcome).not.toHaveProperty("textualScalar");
  });

  it.each([
    { subjectKey: "" },
    { predicateKey: "" },
    { subjectKey: " leading" },
    { predicateKey: "trailing " },
    { subjectKey: "a".repeat(129) },
    { predicateKey: "bad\u0000key" },
    { kind: "fuzzy" },
  ])("rejects malformed bounded queries as invocation failures", (query) => {
    expect(() =>
      running().evaluateReasoning3({
        intent: "evaluate",
        activeContextRevision: structuredContext(),
        query: {
          kind: "exact-text-attribute-value",
          subjectKey: "subject.person",
          predicateKey: "attribute.name",
          ...query,
        },
      }),
    ).toThrow(InvalidReasoningInputError);
  });

  it("rejects missing structured profiles", () => {
    const valid = structuredContext();
    const context = {
      ...valid,
      creationMetadata: {
        ...valid.creationMetadata,
        sourceCount: 1,
        fragmentCount: 1,
      },
      fragments: [valid.fragments[0]],
    } as unknown as ActiveContextRevision;
    expect(() => running().evaluateReasoning3(request(context))).toThrow(
      InvalidReasoningInputError,
    );
  });

  it("rejects an unauthenticated structured profile", () => {
    const context = structuredContext(
      "subject.person",
      "attribute.name",
      "Ada Lovelace",
      "anonymous",
    );
    expect(() => running().evaluateReasoning3(request(context))).toThrow(
      InvalidReasoningInputError,
    );
  });
});
