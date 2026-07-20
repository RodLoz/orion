import {
  IdentitySourceUnavailableError,
  InvalidIdentityInputError,
  InvalidIdentityResolutionReferenceError,
  InvalidIdentityStateError,
  UnresolvedIdentityError,
  type IdentitySource,
  type IdentitySourceResolution,
  type ResolveCurrentIdentity,
} from "@orion/core";
import { describe, expect, it } from "vitest";

import {
  IdentityEngine,
  IdentityEngineInitializationError,
  IdentityEngineLifecycleError,
} from "../src/index.js";

class StubIdentitySource implements IdentitySource {
  public constructor(
    private readonly resolution: unknown,
    private readonly failure?: unknown,
  ) {}

  public resolveIdentity(): IdentitySourceResolution {
    if (this.failure !== undefined) {
      throw this.failure;
    }
    return this.resolution as IdentitySourceResolution;
  }
}

function engineWith(resolution: unknown, failure?: unknown): IdentityEngine {
  const engine = new IdentityEngine(
    new StubIdentitySource(resolution, failure),
  );
  engine.initialize();
  engine.start();
  return engine;
}

function verifyResolveCurrentIdentityContract(
  resolver: ResolveCurrentIdentity,
): void {
  expect(resolver.resolveCurrentIdentity({})).toEqual({ state: "anonymous" });
  expect(
    resolver.resolveCurrentIdentity({ resolutionReference: "known" }),
  ).toEqual({
    state: "authenticated",
    identityIdentifier: "orion.identity.known",
  });
}

describe("IdentityEngine", () => {
  it("implements the Resolve Current Identity Contract", () => {
    verifyResolveCurrentIdentityContract(
      engineWith({
        status: "found",
        candidateIdentityIdentifier: "orion.identity.known",
      }),
    );
  });

  it("resolves absence of evidence as Anonymous without consulting the source", () => {
    const source: IdentitySource = {
      resolveIdentity: () => {
        throw new Error("source must not be called");
      },
    };

    const engine = new IdentityEngine(source);
    engine.initialize();
    engine.start();

    expect(engine.resolveCurrentIdentity({})).toEqual({
      state: "anonymous",
    });
  });

  it("resolves valid known evidence as an immutable Authenticated Identity", () => {
    const result = engineWith({
      status: "found",
      candidateIdentityIdentifier: "orion.identity.known",
    }).resolveCurrentIdentity({ resolutionReference: "known" });

    expect(result).toEqual({
      state: "authenticated",
      identityIdentifier: "orion.identity.known",
    });
    expect(Object.isFrozen(result)).toBe(true);
    expect(result).not.toHaveProperty("authorized");
    expect(result).not.toHaveProperty("permissions");
  });

  it("rejects invalid supplied evidence before source resolution", () => {
    const engine = engineWith({ status: "not-found" });

    expect(() =>
      engine.resolveCurrentIdentity({ resolutionReference: " " }),
    ).toThrow(InvalidIdentityResolutionReferenceError);
  });

  it.each([
    ["null", null],
    ["undefined", undefined],
    ["number", 42],
    ["string", "request"],
    ["array", []],
    ["non-record object", new Date(0)],
    ["unexpected field", { unexpected: true }],
  ])("rejects a malformed request object (%s)", (_name, request) => {
    const engine = engineWith({ status: "not-found" });

    expect(() => engine.resolveCurrentIdentity(request)).toThrow(
      InvalidIdentityInputError,
    );
  });

  it.each([
    ["number", 42],
    ["object", {}],
    ["coercible object", { toString: () => "known" }],
  ])("rejects a non-string resolution reference (%s)", (_name, reference) => {
    const engine = engineWith({ status: "not-found" });

    expect(() =>
      engine.resolveCurrentIdentity({ resolutionReference: reference }),
    ).toThrow(InvalidIdentityResolutionReferenceError);
  });

  it("reports unknown supplied evidence rather than Anonymous", () => {
    const engine = engineWith({ status: "not-found" });

    expect(() =>
      engine.resolveCurrentIdentity({ resolutionReference: "unknown" }),
    ).toThrow(UnresolvedIdentityError);
  });

  it("reports source unavailability rather than Anonymous", () => {
    const engine = engineWith(
      { status: "not-found" },
      new IdentitySourceUnavailableError(),
    );

    expect(() =>
      engine.resolveCurrentIdentity({ resolutionReference: "known" }),
    ).toThrow(IdentitySourceUnavailableError);
  });

  it("normalizes unexpected source failures without leaking source details", () => {
    const engine = engineWith(
      { status: "not-found" },
      new Error("source-internal-secret"),
    );

    expect(() =>
      engine.resolveCurrentIdentity({ resolutionReference: "known" }),
    ).toThrow("Identity source is unavailable.");
  });

  it("normalizes a non-Error source failure", () => {
    const source: IdentitySource = {
      resolveIdentity: () => {
        throw "source-private-value";
      },
    };
    const engine = new IdentityEngine(source);
    engine.initialize();
    engine.start();

    expect(() =>
      engine.resolveCurrentIdentity({ resolutionReference: "known" }),
    ).toThrow(IdentitySourceUnavailableError);
  });

  it("normalizes a source-side invalid candidate failure as Invalid Identity State", () => {
    const engine = engineWith(
      { status: "not-found" },
      new InvalidIdentityResolutionReferenceError(),
    );

    expect(() =>
      engine.resolveCurrentIdentity({ resolutionReference: "known" }),
    ).toThrow(InvalidIdentityStateError);
  });

  it("rejects an invalid candidate Identity state", () => {
    const engine = engineWith({
      status: "found",
      candidateIdentityIdentifier: "invalid candidate",
    });

    expect(() =>
      engine.resolveCurrentIdentity({ resolutionReference: "known" }),
    ).toThrow(InvalidIdentityStateError);
  });

  it.each([
    ["null", null],
    ["undefined", undefined],
    ["number primitive", 42],
    ["string primitive", "found"],
    ["empty object", {}],
    ["unknown discriminant", { status: "unknown" }],
    ["malformed unavailable discriminant", { status: "unavailable" }],
    ["missing candidate", { status: "found" }],
    ["numeric candidate", { status: "found", candidateIdentityIdentifier: 42 }],
    ["object candidate", { status: "found", candidateIdentityIdentifier: {} }],
    [
      "coercible candidate",
      {
        status: "found",
        candidateIdentityIdentifier: {
          toString: () => "orion.identity.coerced",
        },
      },
    ],
    [
      "contradictory not-found candidate",
      {
        status: "not-found",
        candidateIdentityIdentifier: "orion.identity.unexpected",
      },
    ],
  ])("rejects malformed source output (%s)", (_name, sourceResult) => {
    const engine = engineWith(sourceResult);

    expect(() =>
      engine.resolveCurrentIdentity({ resolutionReference: "known" }),
    ).toThrow(InvalidIdentityStateError);
  });

  it("requires an Identity Source Contract during initialization", () => {
    expect(
      () => new IdentityEngine(undefined as unknown as IdentitySource),
    ).toThrow(IdentityEngineInitializationError);
  });

  it("follows the deterministic Engine lifecycle", () => {
    const engine = new IdentityEngine(
      new StubIdentitySource({ status: "not-found" }),
    );

    expect(engine.lifecycleState).toBe("initialize");
    expect(() => engine.resolveCurrentIdentity({})).toThrow(
      IdentityEngineLifecycleError,
    );

    engine.initialize();
    expect(engine.lifecycleState).toBe("ready");
    engine.start();
    expect(engine.lifecycleState).toBe("running");
    expect(engine.resolveCurrentIdentity({})).toEqual({ state: "anonymous" });
    engine.stop();
    expect(engine.lifecycleState).toBe("stopped");
    expect(() => engine.resolveCurrentIdentity({})).toThrow(
      IdentityEngineLifecycleError,
    );
  });
});
