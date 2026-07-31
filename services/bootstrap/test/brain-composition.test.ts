import {
  BrainContextResolutionError,
  anonymousCurrentIdentity,
  createFinalCognitiveResult,
  createNormalizedCognitiveRequest,
  type BrainOrchestrationLifecycleEvent,
} from "@orion/core";
import { describe, expect, it, vi } from "vitest";

import * as bootstrapPackage from "../src/index.js";
import {
  composeBrainCapability,
  type BrainCapabilityComposition,
} from "../src/brain/brain-composition.js";

const CONTEXT_LINEAGE_ID = "orion.context.lineage.1";

function compose(
  lifecycleObserver?: (event: BrainOrchestrationLifecycleEvent) => void,
): BrainCapabilityComposition {
  return composeBrainCapability({
    contextLineageId: CONTEXT_LINEAGE_ID,
    currentIdentity: anonymousCurrentIdentity(),
    ...(lifecycleObserver === undefined ? {} : { lifecycleObserver }),
  });
}

function request(requestId = "bootstrap-brain:1") {
  return createNormalizedCognitiveRequest({
    intent: "orchestrate-cognitive-request",
    requestId,
    contextLineageId: CONTEXT_LINEAGE_ID,
    query: "Resolve the currently reachable Bootstrap Brain path.",
    executionIntent: { kind: "none" },
  });
}

describe("Bootstrap Brain composition", () => {
  it("constructs, initializes, and starts the real graph before exposure", () => {
    const brain = compose();

    expect(() => brain.orchestrateCognitiveRequest(request())).not.toThrow();
  });

  it("completes the authentic request-more-context path", () => {
    const brain = compose();
    const result = brain.orchestrateCognitiveRequest(request());

    expect(result).toEqual({
      status: "completed",
      kind: "request-more-context",
      requestId: "bootstrap-brain:1",
      reason: "planning-requested-more-context",
    });
    expect(Object.isFrozen(result)).toBe(true);
    expect(createFinalCognitiveResult(result)).toEqual(result);
  });

  it("exposes exactly one frozen receiver-free orchestration callable", () => {
    const brain = compose();
    const orchestrate = brain.orchestrateCognitiveRequest;
    const descriptor = Reflect.getOwnPropertyDescriptor(
      brain,
      "orchestrateCognitiveRequest",
    );

    expect(Object.isFrozen(brain)).toBe(true);
    expect(Reflect.ownKeys(brain)).toEqual(["orchestrateCognitiveRequest"]);
    expect(descriptor).toMatchObject({
      enumerable: true,
      writable: false,
      configurable: false,
      value: expect.any(Function),
    });
    expect(orchestrate.call(undefined, request())).toMatchObject({
      kind: "request-more-context",
    });
    expect(brain).not.toHaveProperty("verifyFinalCognitiveResult");
    expect(brain).not.toHaveProperty("engine");
    expect(brain).not.toHaveProperty("allocator");
    expect(brain).not.toHaveProperty("authority");
    expect(brain).not.toHaveProperty("registry");
    expect(brain).not.toHaveProperty("configuration");
    expect(brain).not.toHaveProperty("lifecycle");
    expect(brain).not.toHaveProperty("prepare");
  });

  it("emits exact frozen lifecycle transitions without reaching Skill allocation", () => {
    const events: BrainOrchestrationLifecycleEvent[] = [];
    const brain = compose((event) => events.push(event));

    brain.orchestrateCognitiveRequest(request());

    expect(events.map(({ category }) => category)).toEqual([
      "orchestration-proposed",
      "context-resolved",
      "reasoning-completed",
      "planning-completed",
      "no-skill-completed",
    ]);
    expect(events.map(({ sequence }) => sequence)).toEqual([1, 2, 3, 4, 5]);
    expect(
      events.map(({ diagnosticCorrelationId }) => diagnosticCorrelationId),
    ).toEqual(Array(5).fill("brain-diagnostic:1"));
    expect(events.every((event) => Object.isFrozen(event))).toBe(true);
    expect(events.map(({ category }) => category)).not.toContain(
      "skill-required",
    );
  });

  it("contains observer throws and ignored thenable returns", () => {
    const throwing = compose(() => {
      throw new Error("observer failure");
    });
    const then = vi.fn();
    const returningThenable = compose(() => ({ then }));

    expect(() =>
      throwing.orchestrateCognitiveRequest(request("observer:throw")),
    ).not.toThrow();
    expect(() =>
      returningThenable.orchestrateCognitiveRequest(
        request("observer:thenable"),
      ),
    ).not.toThrow();
    expect(then).not.toHaveBeenCalled();
  });

  it("captures preparation and observer values once", () => {
    const observed: BrainOrchestrationLifecycleEvent[] = [];
    const originalObserver = (event: BrainOrchestrationLifecycleEvent) =>
      observed.push(event);
    const replacementObserver = vi.fn();
    const currentIdentity = { state: "anonymous" as const };
    const preparation: {
      contextLineageId: string;
      currentIdentity: { state: string };
      lifecycleObserver: (event: BrainOrchestrationLifecycleEvent) => void;
    } = {
      contextLineageId: CONTEXT_LINEAGE_ID,
      currentIdentity,
      lifecycleObserver: originalObserver,
    };
    const brain = composeBrainCapability(preparation as never);

    preparation.contextLineageId = "orion.context.lineage.replaced";
    preparation.currentIdentity.state = "replaced";
    preparation.lifecycleObserver = replacementObserver;
    const result = brain.orchestrateCognitiveRequest(
      request("captured-preparation"),
    );

    expect(result.kind).toBe("request-more-context");
    expect(observed).toHaveLength(5);
    expect(replacementObserver).not.toHaveBeenCalled();
  });

  it("isolates Context and diagnostic state between compositions", () => {
    const firstEvents: BrainOrchestrationLifecycleEvent[] = [];
    const secondEvents: BrainOrchestrationLifecycleEvent[] = [];
    const first = compose((event) => firstEvents.push(event));
    const second = compose((event) => secondEvents.push(event));

    first.orchestrateCognitiveRequest(request("isolated:first"));
    second.orchestrateCognitiveRequest(request("isolated:second"));
    expect(firstEvents[0]?.diagnosticCorrelationId).toBe("brain-diagnostic:1");
    expect(secondEvents[0]?.diagnosticCorrelationId).toBe("brain-diagnostic:1");

    const wrongLineage = createNormalizedCognitiveRequest({
      ...request("isolated:wrong"),
      contextLineageId: "orion.context.lineage.2",
    });
    expect(() => first.orchestrateCognitiveRequest(wrongLineage)).toThrow(
      BrainContextResolutionError,
    );
    expect(() =>
      second.orchestrateCognitiveRequest(request("isolated:still-running")),
    ).not.toThrow();
    expect(firstEvents.at(-1)?.diagnosticCorrelationId).toBe(
      "brain-diagnostic:2",
    );
    expect(secondEvents.at(-1)?.diagnosticCorrelationId).toBe(
      "brain-diagnostic:2",
    );
  });

  it("exports only the intended Brain composition entry points", () => {
    expect(bootstrapPackage.composeBrainCapability).toBe(
      composeBrainCapability,
    );
    expect(bootstrapPackage).not.toHaveProperty(
      "createProcessLocalBrainOperationAllocator",
    );
    expect(bootstrapPackage).not.toHaveProperty("BrainEngine");
  });
});
