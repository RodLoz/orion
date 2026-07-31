import {
  InvalidReasoningAuthorityRequestError,
  ReasoningAuthorityVerificationError,
  type ActiveContextRevision,
} from "@orion/core";
import { describe, expect, it } from "vitest";
import * as reasoningPackage from "../src/index.js";
import { ReasoningEngine } from "../src/reasoning-engine.js";

function context(identity = "one") {
  return {
    lineageIdentity: `context.lineage.${identity}`,
    revisionIdentity: `context.revision.${identity}`,
    revisionNumber: 1,
    creationMetadata: {
      createdAt: "2026-07-30T00:00:00.000Z",
      sourceCount: 1,
      fragmentCount: 1,
    },
    lifecycleState: "active",
    fragments: [
      {
        kind: "identity",
        authoritativeOwner: "identity",
        projection: {
          state: "authenticated",
          authoritativeOwner: "identity",
          identityIdentifier: `orion.identity.${identity}`,
        },
      },
    ],
  } as unknown as ActiveContextRevision;
}
function running() {
  const engine = new ReasoningEngine();
  engine.initialize();
  engine.start();
  return engine;
}
function issued(engine = running(), consumed = context()) {
  const candidate = engine.evaluateReasoning({
    intent: "evaluate",
    activeContextRevision: consumed,
    query: "Verify authority.",
  });
  return { engine, consumed, candidate };
}
function request(value: ReturnType<typeof issued>) {
  return {
    intent: "verify-reasoning-outcome-authority" as const,
    candidate: value.candidate,
    consumedContextRevision: value.consumed,
    expectedLineageIdentity: value.consumed.lineageIdentity,
    expectedRevisionIdentity: value.consumed.revisionIdentity,
    expectedRevisionNumber: value.consumed.revisionNumber,
  };
}

describe("Reasoning authority", () => {
  it("registers after evaluation and verifies the exact issued outcome", () => {
    const value = issued();
    expect(value.engine.verifyReasoningOutcomeAuthority(request(value))).toBe(
      value.candidate,
    );
  });

  it("rejects malformed requests before provenance", () => {
    expect(() =>
      issued().engine.verifyReasoningOutcomeAuthority({} as never),
    ).toThrow(InvalidReasoningAuthorityRequestError);
  });

  it("classifies malformed consumed Context graphs before provenance", () => {
    const value = issued();
    const malformed = structuredClone(value.consumed);
    Reflect.set(malformed.creationMetadata, "createdAt", "not-a-time");
    expect(() =>
      value.engine.verifyReasoningOutcomeAuthority({
        ...request(value),
        consumedContextRevision: malformed,
      }),
    ).toThrow(InvalidReasoningAuthorityRequestError);
    const decorated = structuredClone(value.consumed);
    Object.defineProperty(decorated.fragments, "hidden", { value: true });
    expect(() =>
      value.engine.verifyReasoningOutcomeAuthority({
        ...request(value),
        consumedContextRevision: decorated,
      }),
    ).toThrow(InvalidReasoningAuthorityRequestError);
  });

  it("rejects forged, cloned, spread, reconstructed, and cross-runtime outcomes", () => {
    const value = issued();
    for (const candidate of [
      structuredClone(value.candidate),
      { ...value.candidate },
      {
        ...value.candidate,
        explainability: structuredClone(value.candidate.explainability),
      },
    ]) {
      expect(() =>
        value.engine.verifyReasoningOutcomeAuthority({
          ...request(value),
          candidate,
        }),
      ).toThrow(ReasoningAuthorityVerificationError);
    }
    expect(() =>
      running().verifyReasoningOutcomeAuthority(request(value)),
    ).toThrow(ReasoningAuthorityVerificationError);
  });

  it("requires the exact consumed Context identity and correspondence", () => {
    const value = issued();
    expect(() =>
      value.engine.verifyReasoningOutcomeAuthority({
        ...request(value),
        consumedContextRevision: structuredClone(value.consumed),
      }),
    ).toThrow(ReasoningAuthorityVerificationError);
    expect(() =>
      value.engine.verifyReasoningOutcomeAuthority({
        ...request(value),
        expectedRevisionIdentity: "context.revision.replaced",
      }),
    ).toThrow(ReasoningAuthorityVerificationError);
    expect(() =>
      value.engine.verifyReasoningOutcomeAuthority({
        ...request(value),
        expectedLineageIdentity: "context.lineage.replaced",
      }),
    ).toThrow(ReasoningAuthorityVerificationError);
    expect(() =>
      value.engine.verifyReasoningOutcomeAuthority({
        ...request(value),
        expectedRevisionNumber: 2,
      }),
    ).toThrow(ReasoningAuthorityVerificationError);
  });

  it("keeps provenance private and exposes only the issuer verifier port", () => {
    const { engine } = issued();
    expect(typeof engine.verifyReasoningOutcomeAuthority).toBe("function");
    expect(reasoningPackage).not.toHaveProperty("ReasoningAuthority");
    expect(engine).not.toHaveProperty("registry");
  });
});
