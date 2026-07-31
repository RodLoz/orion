import {
  ContextAuthorityVerificationError,
  InvalidContextAuthorityStateError,
  type ActiveContextRevision,
} from "@orion/core";
import { describe, expect, it } from "vitest";
import {
  corruptRegisteredContextNestedIdentity,
  corruptRegisteredContextPrimitive,
  invalidateRegisteredContextVerifierState,
  restoreRegisteredContextSnapshot,
} from "../src/context-authority-test-seam.js";
import { ContextEngine } from "../src/context-engine.js";

function issued(suffix: string) {
  const engine = new ContextEngine({
    nextLineageIdentity: () => `orion.context.state.lineage.${suffix}`,
    nextRevisionIdentity: () => `orion.context.state.revision.${suffix}`,
    nextCreatedAt: () => "2026-07-30T00:00:00.000Z",
  });
  engine.initialize();
  engine.start();
  const composed = engine.composeContextRevision({
    target: { kind: "new-lineage" },
    currentIdentity: {
      state: "authenticated",
      identityIdentifier: `orion.identity.${suffix}`,
    },
  });
  const candidate = engine.getActiveContextRevision({
    lineageIdentity: composed.lineageIdentity,
  });
  return { engine, candidate };
}

function request(candidate: ActiveContextRevision) {
  return {
    intent: "verify-active-context-revision-authority" as const,
    candidate,
    expectedLineageIdentity: candidate.lineageIdentity,
    expectedRevisionIdentity: candidate.revisionIdentity,
    expectedRevisionNumber: candidate.revisionNumber,
  };
}

describe("Context issuer-integrated authority correspondence", () => {
  it("detects real stored primitive replacement and restores correspondence", () => {
    const value = issued("primitive");
    expect(
      value.engine.verifyActiveContextRevisionAuthority(
        request(value.candidate),
      ),
    ).toBe(value.candidate);

    corruptRegisteredContextPrimitive(value.candidate, 2);
    expect(() =>
      value.engine.verifyActiveContextRevisionAuthority(
        request(value.candidate),
      ),
    ).toThrow(ContextAuthorityVerificationError);

    restoreRegisteredContextSnapshot(value.candidate);
    expect(
      value.engine.verifyActiveContextRevisionAuthority(
        request(value.candidate),
      ),
    ).toBe(value.candidate);
  });

  it("detects a nested identity replaced by another runtime's issued identity", () => {
    const value = issued("nested-a");
    const other = issued("nested-b");
    const replacement = other.candidate.fragments[0].projection;
    expect(replacement).not.toBe(value.candidate.fragments[0].projection);

    corruptRegisteredContextNestedIdentity(value.candidate, replacement);
    expect(() =>
      value.engine.verifyActiveContextRevisionAuthority(
        request(value.candidate),
      ),
    ).toThrow(ContextAuthorityVerificationError);

    restoreRegisteredContextSnapshot(value.candidate);
    expect(
      value.engine.verifyActiveContextRevisionAuthority(
        request(value.candidate),
      ),
    ).toBe(value.candidate);
  });

  it("normalizes invalid private verifier state after genuine issuance", () => {
    const value = issued("invalid-state");
    invalidateRegisteredContextVerifierState(value.candidate);
    expect(() =>
      value.engine.verifyActiveContextRevisionAuthority(
        request(value.candidate),
      ),
    ).toThrow(InvalidContextAuthorityStateError);
  });
});
