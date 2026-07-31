import { describe, expect, it, vi } from "vitest";
import {
  BrainContextResolutionError,
  BrainSkillCoordinationError,
  InvalidBrainExecutionStateError,
  InvalidFinalCognitiveResultError,
  type FinalCognitiveResult,
} from "@orion/core";
import {
  fixture,
  noneRequest,
  running,
  skillRequest,
} from "./brain-engine.test.js";

const transitions = (events: readonly unknown[]) =>
  events.map((event) => {
    const value = event as { readonly from: string; readonly to: string };
    return `${value.from}->${value.to}`;
  });

const publicText = (value: unknown): string => {
  const seen = new Set<object>();
  const visit = (current: unknown): unknown => {
    if (typeof current !== "object" || current === null) return current;
    if (seen.has(current)) return "[cycle]";
    seen.add(current);
    const record: Record<string, unknown> = {};
    for (const key of Reflect.ownKeys(current)) {
      if (typeof key !== "string") continue;
      const descriptor = Reflect.getOwnPropertyDescriptor(current, key);
      if (descriptor && "value" in descriptor)
        record[key] = visit(descriptor.value);
    }
    return record;
  };
  return JSON.stringify(visit(value));
};

describe("Brain final-result authority and lifecycle evidence", () => {
  it("returns exact immutable response and rejects clone, reconstruction, and cross-Brain verification", () => {
    const { ports } = fixture();
    const engine = running(ports);
    const result = engine.orchestrateCognitiveRequest(noneRequest());
    if (result.kind !== "response") throw new Error();
    expect(result).toEqual({
      status: "completed",
      kind: "response",
      requestId: "request:1",
      response: "Exact planning response",
    });
    expect(Object.getPrototypeOf(result)).toBe(Object.prototype);
    expect(Object.isFrozen(result)).toBe(true);
    const request = {
      intent: "verify-final-cognitive-response" as const,
      candidate: result,
      expected: {
        kind: "response" as const,
        requestId: result.requestId,
        response: result.response,
      },
    };
    expect(engine.verifyFinalCognitiveResult(request)).toBe(true);
    expect(
      engine.verifyFinalCognitiveResult({
        ...request,
        candidate: { ...result },
      }),
    ).toBe(false);
    expect(
      engine.verifyFinalCognitiveResult({
        ...request,
        candidate: Object.freeze({ ...result }),
      }),
    ).toBe(false);
    const other = running(fixture().ports);
    expect(other.verifyFinalCognitiveResult(request)).toBe(false);
  });

  it("preserves the exact normalized Skill result in the registered Skill envelope", () => {
    const { ports, normalizedResult } = fixture();
    const engine = running(ports);
    const result = engine.orchestrateCognitiveRequest(skillRequest());
    expect(result.kind).toBe("skill-result");
    if (result.kind !== "skill-result") throw new Error();
    expect(result.result).toBe(normalizedResult);
    expect(Object.isFrozen(result)).toBe(true);
    expect(
      engine.verifyFinalCognitiveResult({
        intent: "verify-final-skill-result",
        candidate: result,
        expected: {
          kind: "skill-result",
          requestId: result.requestId,
          operationId: result.operationId,
          skillId: normalizedResult.skillId,
          skillVersion: normalizedResult.skillVersion,
          capability: normalizedResult.capability,
          normalizedResult,
        },
      }),
    ).toBe(true);
  });

  it("normalizes exact final verification failure before completed transition", () => {
    const { ports, events } = fixture();
    const engine = running(ports);
    engine.verifyFinalCognitiveResult = vi.fn(() => false);
    expect(() => engine.orchestrateCognitiveRequest(noneRequest())).toThrow(
      InvalidFinalCognitiveResultError,
    );
    expect(transitions(events)).toEqual([
      "none->proposed",
      "proposed->contextualized",
      "contextualized->reasoned",
      "reasoned->planned",
      "planned->rejected",
    ]);
  });

  it("emits exact no-Skill and Skill transition vectors", () => {
    const noSkill = fixture();
    running(noSkill.ports).orchestrateCognitiveRequest(noneRequest());
    expect(transitions(noSkill.events)).toEqual([
      "none->proposed",
      "proposed->contextualized",
      "contextualized->reasoned",
      "reasoned->planned",
      "planned->completed",
    ]);
    const skill = fixture();
    running(skill.ports).orchestrateCognitiveRequest(skillRequest());
    expect(transitions(skill.events)).toEqual([
      "none->proposed",
      "proposed->contextualized",
      "contextualized->reasoned",
      "reasoned->planned",
      "planned->skill-required",
      "skill-required->bound",
      "bound->authorization-resolved",
      "authorization-resolved->invoking",
      "invoking->completed",
    ]);
  });

  it("contains observer throws, thenables, mutation attempts, and nested orchestration", () => {
    const base = fixture();
    const holder: { engine?: ReturnType<typeof running> } = {};
    const observer = vi.fn((event: object) => {
      expect(() => Object.assign(event, { sequence: 999 })).toThrow();
      if (observer.mock.calls.length === 1)
        expect(() =>
          holder.engine!.orchestrateCognitiveRequest(noneRequest()),
        ).toThrow(InvalidBrainExecutionStateError);
      if (observer.mock.calls.length === 2) throw new Error("observer-secret");
      return { then: () => Promise.reject(new Error("thenable-secret")) };
    });
    const engine = running({ ...base.ports, lifecycleObserver: observer });
    holder.engine = engine;
    expect(engine.orchestrateCognitiveRequest(noneRequest()).kind).toBe(
      "response",
    );
    expect(observer).toHaveBeenCalledTimes(5);
    expect(base.ports.context.getActiveContextRevision).toHaveBeenCalledTimes(
      1,
    );
  });

  it("restarts operation sequencing and rejects reused allocator identities without retry", () => {
    const first = fixture();
    const engine = running(first.ports);
    engine.orchestrateCognitiveRequest(skillRequest());
    expect(() => engine.orchestrateCognitiveRequest(skillRequest())).toThrow(
      BrainSkillCoordinationError,
    );
    expect(
      first.ports.operationAllocator.allocateAuthorizationOperationIdentifier,
    ).toHaveBeenCalledTimes(2);
    expect(
      first.ports.bindSkillToOperation.bindSkillToOperation,
    ).toHaveBeenCalledTimes(1);
    const proposedEvents = first.events.filter(
      (event) =>
        (event as { readonly category: string }).category ===
        "orchestration-proposed",
    );
    expect(proposedEvents).toHaveLength(2);
    expect(
      proposedEvents.map(
        (event) => (event as { readonly sequence: number }).sequence,
      ),
    ).toEqual([1, 1]);
  });
});

describe("Brain public-surface privacy evidence", () => {
  it("does not expose distinctive downstream secrets in errors or lifecycle events", () => {
    const secret = "NATIVE-SECRET-9d83";
    const { ports, events } = fixture();
    ports.context.getActiveContextRevision.mockImplementation(() => {
      const cause = new Error(`cause-${secret}`);
      throw new Error(`message-${secret}`, { cause });
    });
    let failure: unknown;
    try {
      running(ports).orchestrateCognitiveRequest(noneRequest());
    } catch (error) {
      failure = error;
    }
    expect(failure).toBeInstanceOf(BrainContextResolutionError);
    const exposed = [
      publicText(failure),
      String((failure as Error).message),
      String((failure as Error).cause),
      String((failure as Error).stack),
      publicText(events),
    ].join("|");
    expect(exposed).not.toContain(secret);
    expect(exposed).not.toContain("request:1");
    expect(exposed).not.toContain("What is the answer?");
    expect(exposed).not.toContain("context.main");
  });

  it("exposes no operation graph through engine own properties", () => {
    const { ports } = fixture();
    const engine = running(ports);
    const result: FinalCognitiveResult =
      engine.orchestrateCognitiveRequest(noneRequest());
    expect(result.kind).toBe("response");
    expect(Reflect.ownKeys(engine)).toEqual([]);
    expect(publicText(engine)).not.toContain("Exact planning response");
  });
});
