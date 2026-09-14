import {
  ContextAuthorityVerificationError,
  InvalidActiveContextError,
  InvalidContextAuthorityRequestError,
  InvalidReasoningInputError,
  ReasoningAuthorityVerificationError,
  createStructuredKnowledgeContextFragment,
  type ActiveContextRevision,
  type VerifyActiveContextRevisionAuthority,
} from "@orion/core";
import * as core from "@orion/core";
import { describe, expect, it, vi } from "vitest";
import { ReasoningEngine } from "../src/index.js";
import { ContextAuthority } from "../../context/dist/context-authority.js";

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

function running(
  contextAuthority: VerifyActiveContextRevisionAuthority = {
    verifyActiveContextRevisionAuthority(request) {
      return request.candidate;
    },
  },
): ReasoningEngine {
  const engine = new ReasoningEngine(contextAuthority);
  engine.initialize();
  engine.start();
  return engine;
}

function anonymousContext() {
  const base = structuredContext(
    "subject.person",
    "attribute.name",
    "private",
    "anonymous",
  );
  const fragment = createStructuredKnowledgeContextFragment({
    kind: "structured-knowledge",
    authoritativeOwner: "knowledge",
    semanticValue: {
      subjectKey: "subject.person",
      predicateKey: "attribute.name",
      textualScalar: "private-scalar-must-not-escape",
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
    issuance: Object.freeze({}),
  });
  const context = Object.freeze({
    ...base,
    fragments: Object.freeze([base.fragments[0], fragment]),
  }) as ActiveContextRevision;
  const authority = new ContextAuthority();
  authority.register(context, () => true);
  return { context, authority, engine: running(authority) };
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
      response: "Ada Lovelace",
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
      response:
        "Additional context may be required before another bounded evaluation.",
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

  it("preserves anonymous Profile B privately without evaluating either proposition rule", () => {
    const applicability = vi.spyOn(core, "evaluateReasoningApplicability");
    const sufficiency = vi.spyOn(core, "evaluateReasoningSufficiency");
    try {
      const { context, authority, engine } = anonymousContext();
      const verification = vi.spyOn(
        authority,
        "verifyActiveContextRevisionAuthority",
      );
      const outcome = engine.evaluateReasoning3(request(context));
      expect(verification).toHaveBeenCalledExactlyOnceWith({
        intent: "verify-active-context-revision-authority",
        candidate: context,
        expectedLineageIdentity: context.lineageIdentity,
        expectedRevisionIdentity: context.revisionIdentity,
        expectedRevisionNumber: context.revisionNumber,
      });
      expect(outcome).toEqual({
        status: "completed",
        category: "anonymous-context",
        conclusion: "The active context identifies an anonymous actor.",
        response:
          "Additional identity context may be required before further orchestration.",
        nextAction: "request-more-context",
        explainability: {
          identityState: "anonymous",
          ruleCategory: "anonymous-identity",
          contextConsumptionReference: {
            lineageIdentity: context.lineageIdentity,
            revisionIdentity: context.revisionIdentity,
            revisionNumber: context.revisionNumber,
            lifecycleState: "active",
            authoritativeCapability: "context",
          },
        },
      });
      expect(JSON.stringify(outcome)).not.toContain(
        "private-scalar-must-not-escape",
      );
      expect(Object.isFrozen(outcome)).toBe(true);
      expect(Object.isFrozen(outcome.explainability)).toBe(true);
      expect(applicability).not.toHaveBeenCalled();
      expect(sufficiency).not.toHaveBeenCalled();
      // Positive control: spies observe real authenticated rule execution.
      running().evaluateReasoning3(request(structuredContext()));
      expect(applicability).toHaveBeenCalledTimes(1);
      expect(sufficiency).toHaveBeenCalledTimes(1);
      const verify = {
        intent: "verify-reasoning-outcome-authority" as const,
        candidate: outcome,
        consumedContextRevision: context,
        expectedLineageIdentity: context.lineageIdentity,
        expectedRevisionIdentity: context.revisionIdentity,
        expectedRevisionNumber: context.revisionNumber,
      };
      expect(engine.verifyReasoningOutcomeAuthority(verify)).toBe(outcome);
      expect(() =>
        engine.verifyReasoningOutcomeAuthority({
          ...verify,
          consumedContextRevision: Object.freeze({ ...context }),
        }),
      ).toThrow(ReasoningAuthorityVerificationError);
    } finally {
      vi.restoreAllMocks();
    }
  });

  it.each(["reconstructed", "outer-clone", "foreign"] as const)(
    "rejects %s Context authority before anonymous completion or query access",
    (kind) => {
      const { context, engine } = anonymousContext();
      const candidate =
        kind === "reconstructed"
          ? structuredClone(context)
          : kind === "outer-clone"
            ? Object.freeze({ ...context })
            : anonymousContext().context;
      let queryReads = 0;
      expect(() =>
        engine.evaluateReasoning3({
          ...request(candidate),
          get query() {
            queryReads += 1;
            throw new Error("must not read");
          },
        }),
      ).toThrow(
        kind === "reconstructed"
          ? InvalidContextAuthorityRequestError
          : ContextAuthorityVerificationError,
      );
      expect(queryReads).toBe(0);
    },
  );

  it.each([
    {},
    { kind: "fuzzy", subjectKey: "s", predicateKey: "p" },
    { kind: "exact-text-attribute-value", subjectKey: "", predicateKey: "p" },
  ])("validates bounded queries before anonymous completion", (query) => {
    const { context, engine } = anonymousContext();
    expect(() =>
      engine.evaluateReasoning3({ ...request(context), query }),
    ).toThrow(InvalidReasoningInputError);
  });

  it("retains profile validation before anonymous completion and query access", () => {
    const context = structuredContext("s", "p", "private", "anonymous");
    const invalid = {
      ...context,
      creationMetadata: {
        ...context.creationMetadata,
        sourceCount: 1,
        fragmentCount: 1,
      },
      fragments: [context.fragments[0]],
    } as unknown as ActiveContextRevision;
    let queryReads = 0;
    // Isolate Reasoning's own shape gate with the existing authority test fixture.
    expect(() =>
      running().evaluateReasoning3({
        ...request(invalid),
        get query() {
          queryReads += 1;
          return {};
        },
      }),
    ).toThrow(InvalidReasoningInputError);
    expect(queryReads).toBe(0);
    expect(() =>
      running().evaluateReasoning3(
        request({
          ...context,
          fragments: [],
        } as unknown as ActiveContextRevision),
      ),
    ).toThrow(InvalidActiveContextError);
  });
});

describe("RECOVERY-04 exact bounded success", () => {
  it.each([
    "x".repeat(2048),
    "x".repeat(2049),
    "x".repeat(4096),
    "😀".repeat(4096),
    "  exact  value  ",
  ])("preserves accepted scalar (%#)", (scalar) => {
    const result = running().evaluateReasoning3(
      request(structuredContext("subject.person", "attribute.name", scalar)),
    );
    expect(result.response).toBe(scalar);
    expect(Object.keys(result.explainability).sort()).toEqual(
      ["contextConsumptionReference", "identityState", "ruleCategory"].sort(),
    );
  });
  it("rejects 4097 code points", () => {
    expect(() =>
      running().evaluateReasoning3(
        request(
          structuredContext(
            "subject.person",
            "attribute.name",
            "x".repeat(4097),
          ),
        ),
      ),
    ).toThrow();
  });
});

describe("RECOVERY-06 originating authority failure identity", () => {
  it("propagates the exact authority exception before reading the query", () => {
    const failure = new ContextAuthorityVerificationError();
    const verify = vi.fn(() => {
      throw failure;
    });
    const engine = running({ verifyActiveContextRevisionAuthority: verify });
    const context = structuredContext();
    const readQuery = vi.fn(() => {
      throw new Error("query must remain unread");
    });
    let caught: unknown;
    try {
      engine.evaluateReasoning3({
        ...request(context),
        get query() {
          return readQuery();
        },
      });
    } catch (error: unknown) {
      caught = error;
    }
    expect(caught).toBe(failure);
    expect(verify).toHaveBeenCalledExactlyOnceWith({
      intent: "verify-active-context-revision-authority",
      candidate: context,
      expectedLineageIdentity: context.lineageIdentity,
      expectedRevisionIdentity: context.revisionIdentity,
      expectedRevisionNumber: context.revisionNumber,
    });
    expect(readQuery).not.toHaveBeenCalled();
  });
});
