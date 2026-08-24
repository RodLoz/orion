import { describe, expect, expectTypeOf, it } from "vitest";

import {
  InvalidContextCreatedAtError,
  InvalidContextLifecycleStateError,
  InvalidContextLineageIdentityError,
  InvalidContextRevisionIdentityError,
  InvalidContextRevisionNumberError,
  InvalidContextAuthorityRequestError,
  ContextAuthorityVerificationError,
  InvalidContextAuthorityStateError,
  contextCreatedAt,
  contextLifecycleState,
  contextLineageIdentity,
  contextRevisionIdentity,
  contextRevisionNumber,
  type ComposeContextRevisionWithKnowledgeRequest,
  type ComposeContextRevisionWithMemoryRequest,
  type ContextLifecycleState,
  type PrepareContextRevisionRequest,
  type PrepareContextRevisionWithKnowledgeRequest,
  type PrepareContextRevisionWithStructuredKnowledgeRequest,
  type PrepareContextRevisionWithMemoryRequest,
  type VerifyActiveContextRevisionAuthorityRequest,
} from "../src/index.js";

describe("Context domain Contracts", () => {
  it("defines Context-owned preparation without changing incorporation input", () => {
    const request = {
      target: { kind: "new-lineage" },
      identityResolutionRequest: {},
    } satisfies PrepareContextRevisionRequest;

    expect(Object.keys(request)).toEqual([
      "target",
      "identityResolutionRequest",
    ]);
    expectTypeOf<keyof PrepareContextRevisionRequest>().toEqualTypeOf<
      "target" | "identityResolutionRequest"
    >();
  });

  it("defines the fixed Knowledge-aware preparation and incorporation inputs", () => {
    const preparation = {
      target: { kind: "new-lineage" },
      identityResolutionRequest: {},
      knowledgeRetrievalRequest: { knowledgeIdentity: "knowledge-1" },
    } satisfies PrepareContextRevisionWithKnowledgeRequest;
    const incorporation = {
      target: { kind: "new-lineage" },
      currentIdentity: {} as never,
      knowledgeReference: {} as never,
    } satisfies ComposeContextRevisionWithKnowledgeRequest;

    expect(Object.keys(preparation)).toEqual([
      "target",
      "identityResolutionRequest",
      "knowledgeRetrievalRequest",
    ]);
    expect(Object.keys(incorporation)).toEqual([
      "target",
      "currentIdentity",
      "knowledgeReference",
    ]);
    expectTypeOf<
      keyof PrepareContextRevisionWithKnowledgeRequest
    >().toEqualTypeOf<
      "target" | "identityResolutionRequest" | "knowledgeRetrievalRequest"
    >();
    expectTypeOf<
      keyof ComposeContextRevisionWithKnowledgeRequest
    >().toEqualTypeOf<"target" | "currentIdentity" | "knowledgeReference">();
  });

  it("defines the fixed Memory-aware preparation and incorporation inputs", () => {
    const preparation = {
      target: { kind: "new-lineage" },
      identityResolutionRequest: {},
      memoryRetrievalRequest: {
        memoryIdentity: "memory-1",
        purpose: "continuity",
      },
    } satisfies PrepareContextRevisionWithMemoryRequest;
    const incorporation = {
      target: { kind: "new-lineage" },
      currentIdentity: {} as never,
      memoryReference: {} as never,
    } satisfies ComposeContextRevisionWithMemoryRequest;

    expect(Object.keys(preparation)).toEqual([
      "target",
      "identityResolutionRequest",
      "memoryRetrievalRequest",
    ]);
    expect(Object.keys(incorporation)).toEqual([
      "target",
      "currentIdentity",
      "memoryReference",
    ]);
    expectTypeOf<keyof PrepareContextRevisionWithMemoryRequest>().toEqualTypeOf<
      "target" | "identityResolutionRequest" | "memoryRetrievalRequest"
    >();
    expectTypeOf<keyof ComposeContextRevisionWithMemoryRequest>().toEqualTypeOf<
      "target" | "currentIdentity" | "memoryReference"
    >();
  });

  it("adds structured Profile B preparation without changing legacy requests", () => {
    const request = {
      target: { kind: "new-lineage" },
      identityResolutionRequest: {},
      contextPreparationSemanticScope: {
        subjectKey: "person" as never,
        predicateKey: "occupation" as never,
      },
      knowledgeRetrievalRequest: { knowledgeIdentity: "knowledge-1" },
    } satisfies PrepareContextRevisionWithStructuredKnowledgeRequest;

    expect(Object.keys(request)).toEqual([
      "target",
      "identityResolutionRequest",
      "contextPreparationSemanticScope",
      "knowledgeRetrievalRequest",
    ]);
    expectTypeOf<
      keyof PrepareContextRevisionWithStructuredKnowledgeRequest
    >().toEqualTypeOf<
      | "target"
      | "identityResolutionRequest"
      | "contextPreparationSemanticScope"
      | "knowledgeRetrievalRequest"
    >();
  });

  it("validates opaque Context identities without coercion", () => {
    expect(contextLineageIdentity("orion.context.lineage.1")).toBe(
      "orion.context.lineage.1",
    );
    expect(contextRevisionIdentity("orion.context.revision.1")).toBe(
      "orion.context.revision.1",
    );
  });

  it.each(["", "Context Lineage", "context:lineage"])(
    "rejects invalid Context Lineage Identity %j",
    (value) => {
      expect(() => contextLineageIdentity(value)).toThrow(
        InvalidContextLineageIdentityError,
      );
    },
  );

  it.each(["", "Context Revision", "context:revision"])(
    "rejects invalid Context Revision Identity %j",
    (value) => {
      expect(() => contextRevisionIdentity(value)).toThrow(
        InvalidContextRevisionIdentityError,
      );
    },
  );

  it.each([null, undefined, 42, true, {}, { toString: () => "valid.id" }])(
    "rejects non-string Context identities without coercion",
    (value) => {
      expect(() => contextLineageIdentity(value)).toThrow(
        InvalidContextLineageIdentityError,
      );
      expect(() => contextRevisionIdentity(value)).toThrow(
        InvalidContextRevisionIdentityError,
      );
    },
  );

  it("accepts only positive safe integer Revision Numbers", () => {
    expect(contextRevisionNumber(1)).toBe(1);
    expect(contextRevisionNumber(Number.MAX_SAFE_INTEGER)).toBe(
      Number.MAX_SAFE_INTEGER,
    );
  });

  it.each([0, -1, 1.5, Number.NaN, Number.POSITIVE_INFINITY, "1", null])(
    "rejects invalid Revision Number %j",
    (value) => {
      expect(() => contextRevisionNumber(value)).toThrow(
        InvalidContextRevisionNumberError,
      );
    },
  );

  it("defines the canonical lifecycle without Updating", () => {
    const states: readonly ContextLifecycleState[] = [
      "collecting",
      "composing",
      "validating",
      "active",
      "expired",
      "archived",
    ];
    expect(states.map(contextLifecycleState)).toEqual(states);
    expect(() => contextLifecycleState("updating")).toThrow(
      InvalidContextLifecycleStateError,
    );
  });

  it("validates deterministic UTC creation metadata", () => {
    expect(contextCreatedAt("2026-07-20T00:00:00.000Z")).toBe(
      "2026-07-20T00:00:00.000Z",
    );
    expect(() => contextCreatedAt("2026-07-20")).toThrow(
      InvalidContextCreatedAtError,
    );
    expect(() => contextCreatedAt("2026-99-20T00:00:00.000Z")).toThrow(
      InvalidContextCreatedAtError,
    );
    expect(() =>
      contextCreatedAt({ toString: () => "2026-07-20T00:00:00Z" }),
    ).toThrow(InvalidContextCreatedAtError);
  });

  it("keeps validation failures privacy-safe", () => {
    const secret = "context-secret-value";
    try {
      contextLineageIdentity(secret);
    } catch (error: unknown) {
      expect(error).toBeInstanceOf(InvalidContextLineageIdentityError);
      expect((error as Error).message).not.toContain(secret);
    }
  });

  it("defines the Active Context authority request and closed failures", () => {
    const request = {
      intent: "verify-active-context-revision-authority",
      candidate: {} as never,
      expectedLineageIdentity: "context.lineage.1" as never,
      expectedRevisionIdentity: "context.revision.1" as never,
      expectedRevisionNumber: 1 as never,
    } satisfies VerifyActiveContextRevisionAuthorityRequest;
    expect(Object.keys(request)).toEqual([
      "intent",
      "candidate",
      "expectedLineageIdentity",
      "expectedRevisionIdentity",
      "expectedRevisionNumber",
    ]);
    expectTypeOf<
      keyof VerifyActiveContextRevisionAuthorityRequest
    >().toEqualTypeOf<
      | "intent"
      | "candidate"
      | "expectedLineageIdentity"
      | "expectedRevisionIdentity"
      | "expectedRevisionNumber"
    >();
    expect(new InvalidContextAuthorityRequestError().name).toBe(
      "InvalidContextAuthorityRequestError",
    );
    expect(new ContextAuthorityVerificationError().name).toBe(
      "ContextAuthorityVerificationError",
    );
    expect(new InvalidContextAuthorityStateError().name).toBe(
      "InvalidContextAuthorityStateError",
    );

    const { candidate: omittedCandidate, ...missingCandidate } = request;
    expect(omittedCandidate).toBeDefined();
    // @ts-expect-error Candidate is required.
    const invalidMissingCandidate: VerifyActiveContextRevisionAuthorityRequest =
      missingCandidate;
    expect(invalidMissingCandidate).toBeDefined();

    const {
      expectedRevisionNumber: omittedRevisionNumber,
      ...missingRevisionNumber
    } = request;
    expect(omittedRevisionNumber).toBe(1);
    // @ts-expect-error Every lineage/revision expectation is required.
    const invalidMissingRevision: VerifyActiveContextRevisionAuthorityRequest =
      missingRevisionNumber;
    expect(invalidMissingRevision).toBeDefined();

    const invalidExtra: VerifyActiveContextRevisionAuthorityRequest = {
      ...request,
      // @ts-expect-error Extra authority-request fields are prohibited.
      extra: true,
    };
    expect(invalidExtra).toBeDefined();

    const invalidCandidate: VerifyActiveContextRevisionAuthorityRequest = {
      ...request,
      // @ts-expect-error Candidate must be an Active Context Revision.
      candidate: "not-a-context-revision",
    };
    expect(invalidCandidate).toBeDefined();

    const invalidExpectedType: VerifyActiveContextRevisionAuthorityRequest = {
      ...request,
      // @ts-expect-error Revision number must retain its exact branded type.
      expectedRevisionNumber: "1",
    };
    expect(invalidExpectedType).toBeDefined();
  });
});
