import {
  ContextAuthorityVerificationError,
  InvalidContextAuthorityRequestError,
  anonymousCurrentIdentity,
  type ContextConstructionValues,
} from "@orion/core";
import { describe, expect, it } from "vitest";
import * as contextPackage from "../src/index.js";
import { ContextEngine } from "../src/context-engine.js";

class Values implements ContextConstructionValues {
  #revision = 0;
  public nextLineageIdentity() {
    return "orion.context.authority.lineage";
  }
  public nextRevisionIdentity() {
    this.#revision += 1;
    return `orion.context.authority.revision.${this.#revision}`;
  }
  public nextCreatedAt() {
    return `2026-07-30T00:00:0${this.#revision}.000Z`;
  }
}

function running() {
  const engine = new ContextEngine(new Values(), {
    resolveCurrentIdentity: () => anonymousCurrentIdentity(),
  });
  engine.initialize();
  engine.start();
  return engine;
}

function issued(engine = running()) {
  const composed = engine.composeContextRevision({
    target: { kind: "new-lineage" },
    currentIdentity: anonymousCurrentIdentity(),
  });
  const candidate = engine.getActiveContextRevision({
    lineageIdentity: composed.lineageIdentity,
  });
  return { engine, candidate };
}

function request(candidate: ReturnType<typeof issued>["candidate"]) {
  return {
    intent: "verify-active-context-revision-authority" as const,
    candidate,
    expectedLineageIdentity: candidate.lineageIdentity,
    expectedRevisionIdentity: candidate.revisionIdentity,
    expectedRevisionNumber: candidate.revisionNumber,
  };
}

describe("Context authority", () => {
  it("registers only after complete Get Active validation and returns exact identity", () => {
    const engine = running();
    const candidate = engine.composeContextRevision({
      target: { kind: "new-lineage" },
      currentIdentity: anonymousCurrentIdentity(),
    });
    expect(() =>
      engine.verifyActiveContextRevisionAuthority(request(candidate)),
    ).toThrow(ContextAuthorityVerificationError);
    const authoritative = engine.getActiveContextRevision({
      lineageIdentity: candidate.lineageIdentity,
    });
    expect(
      engine.getActiveContextRevision({
        lineageIdentity: candidate.lineageIdentity,
      }),
    ).toBe(authoritative);
    expect(authoritative).toBe(candidate);
    expect(
      engine.verifyActiveContextRevisionAuthority(request(authoritative)),
    ).toBe(authoritative);
  });

  it.each([
    null,
    {},
    {
      intent: "verify-active-context-revision-authority",
      candidate: undefined,
      expectedLineageIdentity: "x",
      expectedRevisionIdentity: "y",
      expectedRevisionNumber: 1,
    },
  ])("rejects malformed requests", (value) => {
    expect(() =>
      issued().engine.verifyActiveContextRevisionAuthority(value as never),
    ).toThrow(InvalidContextAuthorityRequestError);
  });

  it("rejects forged, cloned, spread, reconstructed, and cross-runtime values", () => {
    const { engine, candidate } = issued();
    const other = issued().engine;
    for (const forged of [
      structuredClone(candidate),
      { ...candidate },
      {
        ...candidate,
        creationMetadata: { ...candidate.creationMetadata },
        fragments: structuredClone(candidate.fragments),
      },
    ]) {
      expect(() =>
        engine.verifyActiveContextRevisionAuthority(
          request(forged as typeof candidate),
        ),
      ).toThrow(ContextAuthorityVerificationError);
    }
    expect(() =>
      other.verifyActiveContextRevisionAuthority(request(candidate)),
    ).toThrow(ContextAuthorityVerificationError);
  });

  it("rejects wrong lineage, revision, number, and stale replaced revisions", () => {
    const { engine, candidate } = issued();
    expect(() =>
      engine.verifyActiveContextRevisionAuthority({
        ...request(candidate),
        expectedLineageIdentity: "orion.context.wrong",
      }),
    ).toThrow(ContextAuthorityVerificationError);
    const successor = engine.composeContextRevision({
      target: {
        kind: "existing-lineage",
        lineageIdentity: candidate.lineageIdentity,
        expectedActiveRevisionIdentity: candidate.revisionIdentity,
      },
      currentIdentity: {
        state: "authenticated",
        identityIdentifier: "orion.identity.authority",
      },
    });
    engine.getActiveContextRevision({
      lineageIdentity: successor.lineageIdentity,
    });
    expect(() =>
      engine.verifyActiveContextRevisionAuthority(request(candidate)),
    ).toThrow(ContextAuthorityVerificationError);
  });

  it("exports only the issuer-owned verifier through the Engine", () => {
    const { engine } = issued();
    expect(typeof engine.verifyActiveContextRevisionAuthority).toBe("function");
    expect(contextPackage).not.toHaveProperty("ContextAuthority");
    expect(engine).not.toHaveProperty("registry");
    expect(engine).not.toHaveProperty("verifyContextRevisionAuthority");
  });

  it("classifies malformed canonical values, accessors, symbols, prototypes, arrays, and proxies as invalid requests", () => {
    const { engine, candidate } = issued();
    const cases: unknown[] = [];
    const badTime = structuredClone(candidate);
    Reflect.set(badTime.creationMetadata, "createdAt", "not-a-time");
    cases.push(badTime);
    const badIdentity = structuredClone(candidate);
    Object.assign(badIdentity.fragments[0], {
      projection: {
        state: "authenticated",
        authoritativeOwner: "identity",
        identityIdentifier: "BAD!",
      },
    });
    cases.push(badIdentity);
    const accessor = structuredClone(candidate);
    Object.defineProperty(accessor, "lifecycleState", {
      enumerable: true,
      get: () => "active",
    });
    cases.push(accessor);
    const symbol = structuredClone(candidate);
    Object.defineProperty(symbol, Symbol("extra"), {
      enumerable: true,
      value: true,
    });
    cases.push(symbol);
    const decorated = structuredClone(candidate);
    Object.defineProperty(decorated.fragments, "hidden", { value: true });
    cases.push(decorated);
    cases.push(Object.setPrototypeOf(structuredClone(candidate), {}));
    const { proxy, revoke } = Proxy.revocable(structuredClone(candidate), {});
    revoke();
    cases.push(proxy);
    for (const malformed of cases) {
      expect(() =>
        engine.verifyActiveContextRevisionAuthority({
          ...request(candidate),
          candidate: malformed as typeof candidate,
        }),
      ).toThrow(InvalidContextAuthorityRequestError);
    }
  });
});
