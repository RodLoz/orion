import {
  InvalidContextAuthorityStateError,
  anonymousCurrentIdentity,
} from "@orion/core";
import { beforeEach, describe, expect, it, vi } from "vitest";

const control = vi.hoisted(() => ({
  attempts: 0,
  fail: false,
  observedValidated: false,
  candidate: undefined as object | undefined,
}));

vi.mock("../src/context-authority.js", () => ({
  ContextAuthority: class {
    public register(candidate: {
      lifecycleState: unknown;
      fragments: readonly unknown[];
    }): void {
      control.attempts += 1;
      control.candidate = candidate;
      control.observedValidated =
        candidate.lifecycleState === "active" &&
        Object.isFrozen(candidate) &&
        candidate.fragments.length === 1;
      if (control.fail) throw new InvalidContextAuthorityStateError();
    }
    public verifyActiveContextRevisionAuthority(): never {
      throw new Error("not used");
    }
  },
}));

const { ContextEngine } = await import("../src/context-engine.js");

function running() {
  const engine = new ContextEngine({
    nextLineageIdentity: () => "orion.context.registration.lineage",
    nextRevisionIdentity: () => "orion.context.registration.revision",
    nextCreatedAt: () => "2026-07-30T00:00:00.000Z",
  });
  engine.initialize();
  engine.start();
  return engine;
}

describe("Context authority registration adjacency", () => {
  beforeEach(() => {
    control.attempts = 0;
    control.fail = false;
    control.observedValidated = false;
    control.candidate = undefined;
  });
  it("registers exactly once after validation and immediately before return", () => {
    const engine = running();
    const composed = engine.composeContextRevision({
      target: { kind: "new-lineage" },
      currentIdentity: anonymousCurrentIdentity(),
    });
    const returned = engine.getActiveContextRevision({
      lineageIdentity: composed.lineageIdentity,
    });
    expect(control.attempts).toBe(1);
    expect(control.observedValidated).toBe(true);
    expect(control.candidate).toBe(returned);
    expect(returned.lifecycleState).toBe("active");
  });

  it("suppresses return and never retries failed registration", () => {
    const engine = running();
    const composed = engine.composeContextRevision({
      target: { kind: "new-lineage" },
      currentIdentity: anonymousCurrentIdentity(),
    });
    control.fail = true;
    expect(() =>
      engine.getActiveContextRevision({
        lineageIdentity: composed.lineageIdentity,
      }),
    ).toThrow(InvalidContextAuthorityStateError);
    expect(control.attempts).toBe(1);
  });

  it("does not register unsuccessful issue paths", () => {
    const engine = running();
    expect(() =>
      engine.getActiveContextRevision({ lineageIdentity: "missing.lineage" }),
    ).toThrow();
    expect(control.attempts).toBe(0);
  });
});
