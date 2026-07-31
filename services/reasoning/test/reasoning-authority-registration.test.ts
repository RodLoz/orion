import { InvalidReasoningAuthorityStateError } from "@orion/core";
import { beforeEach, describe, expect, it, vi } from "vitest";

const control = vi.hoisted(() => ({
  attempts: 0,
  fail: false,
  observedValidated: false,
  candidate: undefined as object | undefined,
}));

vi.mock("../src/reasoning-authority.js", () => ({
  ReasoningAuthority: class {
    public register(candidate: { status: unknown; explainability: unknown }) {
      control.attempts += 1;
      control.candidate = candidate;
      control.observedValidated =
        candidate.status === "completed" &&
        Object.isFrozen(candidate) &&
        Object.isFrozen(candidate.explainability);
      if (control.fail) throw new InvalidReasoningAuthorityStateError();
    }
    public verifyReasoningOutcomeAuthority(): never {
      throw new Error("not used");
    }
  },
}));

const { ReasoningEngine } = await import("../src/reasoning-engine.js");

const context = {
  lineageIdentity: "context.lineage.registration",
  revisionIdentity: "context.revision.registration",
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
        identityIdentifier: "orion.identity.registration",
      },
    },
  ],
};

function running() {
  const engine = new ReasoningEngine();
  engine.initialize();
  engine.start();
  return engine;
}

describe("Reasoning authority registration adjacency", () => {
  beforeEach(() => {
    control.attempts = 0;
    control.fail = false;
    control.observedValidated = false;
    control.candidate = undefined;
  });
  it("registers once after complete validation and before exact return", () => {
    const result = running().evaluateReasoning({
      intent: "evaluate",
      activeContextRevision: context,
      query: "registration",
    });
    expect(control.attempts).toBe(1);
    expect(control.observedValidated).toBe(true);
    expect(control.candidate).toBe(result);
    expect(result.status).toBe("completed");
  });

  it("suppresses return without retry when registration fails", () => {
    control.fail = true;
    expect(() =>
      running().evaluateReasoning({
        intent: "evaluate",
        activeContextRevision: context,
        query: "registration",
      }),
    ).toThrow(InvalidReasoningAuthorityStateError);
    expect(control.attempts).toBe(1);
  });

  it("does not register invalid issue requests", () => {
    expect(() => running().evaluateReasoning({})).toThrow();
    expect(control.attempts).toBe(0);
  });
});
