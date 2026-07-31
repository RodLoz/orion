import { describe, expect, it, vi } from "vitest";
import {
  createNormalizedCognitiveRequest,
  InvalidBrainAuthorityError,
  InvalidBrainRequestError,
  type BrainConfiguration,
} from "@orion/core";
import { BrainEngine } from "../src/index.js";
import {
  fixture,
  noneRequest,
  running,
  skillRequest,
} from "./brain-engine.test.js";

const requiredPorts = [
  "context",
  "reasoning",
  "planning",
  "selectSkill",
  "operationAllocator",
  "bindSkillToOperation",
  "resolveSkillExecutionContext",
  "resolveSkillInvocationRequirements",
  "resolveGovernedAuthorizationEvaluation",
  "protectedInvokeSkill",
  "verifyNormalizedSkillExecutionResult",
] as const;

describe("Brain exact configuration boundary", () => {
  it("accepts configuration with and without the optional observer", () => {
    const { ports } = fixture();
    expect(() => new BrainEngine(ports as never)).not.toThrow();
    const { lifecycleObserver, ...withoutObserver } = ports;
    expect(lifecycleObserver).toBeTypeOf("function");
    expect(() => new BrainEngine(withoutObserver as never)).not.toThrow();
  });

  it.each(requiredPorts)("rejects missing required port %s", (port) => {
    const { ports } = fixture();
    const malformed = { ...ports } as Record<string, unknown>;
    delete malformed[port];
    expect(
      () => new BrainEngine(malformed as unknown as BrainConfiguration),
    ).toThrow(InvalidBrainAuthorityError);
  });

  it.each(requiredPorts)("rejects explicit undefined port %s", (port) => {
    const { ports } = fixture();
    expect(
      () =>
        new BrainEngine({
          ...ports,
          [port]: undefined,
        } as unknown as BrainConfiguration),
    ).toThrow(InvalidBrainAuthorityError);
  });

  it("rejects symbols, inherited substitutes, and hostile proxies", () => {
    const { ports } = fixture();
    expect(
      () =>
        new BrainEngine(
          Object.assign({ ...ports }, { [Symbol("port")]: vi.fn() }) as never,
        ),
    ).toThrow(InvalidBrainAuthorityError);
    const inherited = Object.create({ context: ports.context }) as Record<
      string,
      unknown
    >;
    Object.assign(inherited, ports);
    delete inherited.context;
    expect(() => new BrainEngine(inherited as never)).toThrow(
      InvalidBrainAuthorityError,
    );
    const hostile = new Proxy(ports, {
      getOwnPropertyDescriptor() {
        throw new Error("configuration-secret");
      },
    });
    expect(() => new BrainEngine(hostile as never)).toThrow(
      InvalidBrainAuthorityError,
    );
  });

  it("rejects missing, extra, non-callable, and accessor nested methods", () => {
    const { ports } = fixture();
    for (const malformedContext of [
      { getActiveContextRevision: ports.context.getActiveContextRevision },
      { ...ports.context, extra: vi.fn() },
      {
        ...ports.context,
        getActiveContextRevision: "not-callable",
      },
    ]) {
      expect(
        () =>
          new BrainEngine({
            ...ports,
            context: malformedContext,
          } as unknown as BrainConfiguration),
      ).toThrow(InvalidBrainAuthorityError);
    }
    const accessor = {
      verifyActiveContextRevisionAuthority:
        ports.context.verifyActiveContextRevisionAuthority,
    };
    Object.defineProperty(accessor, "getActiveContextRevision", {
      enumerable: true,
      get: () => ports.context.getActiveContextRevision,
    });
    expect(
      () =>
        new BrainEngine({
          ...ports,
          context: accessor,
        } as unknown as BrainConfiguration),
    ).toThrow(InvalidBrainAuthorityError);
  });

  it("captures methods receiver-free and never rereads configuration", () => {
    const { ports } = fixture();
    const original = ports.context.getActiveContextRevision;
    const engine = new BrainEngine(ports as never);
    ports.context.getActiveContextRevision = vi.fn(() => {
      throw new Error("replacement");
    });
    engine.initialize();
    engine.start();
    expect(engine.orchestrateCognitiveRequest(noneRequest()).kind).toBe(
      "response",
    );
    expect(original).toHaveBeenCalledTimes(1);
    expect(ports.context.getActiveContextRevision).not.toHaveBeenCalled();
  });
});

describe("Brain exact request boundary", () => {
  it("accepts both exact variants without mutating caller data", () => {
    for (const request of [noneRequest(), skillRequest()]) {
      const { ports } = fixture();
      const snapshot = Reflect.ownKeys(request);
      running(ports).orchestrateCognitiveRequest(request);
      expect(Reflect.ownKeys(request)).toEqual(snapshot);
      expect(Object.isFrozen(request)).toBe(true);
    }
  });

  it.each([
    ["intent", "wrong"],
    ["requestId", "bad request id"],
    ["contextLineageId", "BAD"],
    ["query", ""],
    ["executionIntent", { kind: "wrong" }],
  ] as const)("rejects malformed %s before all calls", (field, value) => {
    const { ports } = fixture();
    const engine = running(ports);
    expect(() =>
      engine.orchestrateCognitiveRequest({
        ...noneRequest(),
        [field]: value,
      } as never),
    ).toThrow(InvalidBrainRequestError);
    expect(ports.lifecycleObserver).not.toHaveBeenCalled();
    expect(ports.context.getActiveContextRevision).not.toHaveBeenCalled();
  });

  it.each([
    { ...noneRequest(), missing: undefined },
    Object.assign(Object.create({ inherited: true }), noneRequest()),
    Object.assign({ ...noneRequest() }, { [Symbol("request")]: true }),
  ])("rejects extra, inherited, symbol, or undefined evidence", (request) => {
    const { ports } = fixture();
    const engine = running(ports);
    expect(() => engine.orchestrateCognitiveRequest(request as never)).toThrow(
      InvalidBrainRequestError,
    );
    expect(ports.context.getActiveContextRevision).not.toHaveBeenCalled();
  });

  it("rejects accessor, hostile, and revoked requests without leakage", () => {
    const { ports } = fixture();
    const engine = running(ports);
    const accessor = { ...noneRequest() };
    Object.defineProperty(accessor, "query", {
      enumerable: true,
      get() {
        throw new Error("query-secret");
      },
    });
    const hostile = new Proxy(noneRequest(), {
      ownKeys() {
        throw new Error("proxy-secret");
      },
    });
    const revoked = Proxy.revocable(noneRequest(), {});
    revoked.revoke();
    for (const request of [accessor, hostile, revoked.proxy]) {
      expect(() =>
        engine.orchestrateCognitiveRequest(request as never),
      ).toThrow(InvalidBrainRequestError);
    }
    expect(ports.context.getActiveContextRevision).not.toHaveBeenCalled();
  });

  it("rejects malformed Skill inputs and canonicalizes accepted key order", () => {
    for (const inputs of [
      { value: Number.MAX_SAFE_INTEGER + 1 },
      { value: -0 },
      { value: "\u0000" },
      { "bad key": true },
    ]) {
      expect(() =>
        createNormalizedCognitiveRequest({
          ...skillRequest(),
          executionIntent: {
            kind: "skill-capability",
            capability: "weather.read",
            inputs,
          },
        }),
      ).toThrow(InvalidBrainRequestError);
    }
    const request = createNormalizedCognitiveRequest({
      ...skillRequest(),
      executionIntent: {
        kind: "skill-capability",
        capability: "weather.read",
        inputs: { zeta: 1, alpha: 2 },
      },
    });
    if (request.executionIntent.kind !== "skill-capability") throw new Error();
    expect(Object.keys(request.executionIntent.inputs)).toEqual([
      "alpha",
      "zeta",
    ]);
  });
});
