import {
  InvalidKnowledgeStateError,
  KnowledgeStoreUnavailableError,
  createKnowledgeLifecycleSnapshot,
  knowledgeAcceptanceOrder,
  knowledgeIdentity,
  type KnowledgeConstructionValues,
  type KnowledgeIdentity,
  type KnowledgeLifecycleSnapshotResult,
  type KnowledgeRecord,
  type KnowledgeStore,
  type KnowledgeStoreGetResult,
  type KnowledgeStorePutResult,
  type PutIndependentAcceptedKnowledgeRequest,
  type PutIndependentAcceptedKnowledgeResult,
  type SupersedeCurrentKnowledgeRequest,
  type SupersedeCurrentKnowledgeResult,
} from "@orion/core";
import { describe, expect, it } from "vitest";

import * as publicKnowledge from "../src/index.js";
import {
  KnowledgeEngineInitializationError,
  KnowledgeEngineRecoveryError,
  KnowledgeEngineShutdownError,
  type KnowledgeEngine as PublicKnowledgeEngine,
} from "../src/index.js";
import { KnowledgeEngineRuntime as KnowledgeEngine } from "../src/knowledge-engine.js";
import {
  KnowledgeSettlementCoordinationError,
  createKnowledgeSettlementCoordinator,
  type KnowledgeSettlementCoordinator,
} from "../src/knowledge-settlement-coordinator.js";

class Deferred<T> {
  public readonly promise: Promise<T>;
  public resolve!: (value: T) => void;
  public reject!: (reason?: unknown) => void;

  public constructor() {
    this.promise = new Promise<T>((resolve, reject) => {
      this.resolve = resolve;
      this.reject = reject;
    });
  }
}

class Construction implements KnowledgeConstructionValues {
  #identity = 0;
  #time = 0;

  public nextKnowledgeIdentity(): unknown {
    this.#identity += 1;
    return `async-knowledge-${this.#identity}`;
  }

  public nextAcceptedAt(): unknown {
    this.#time += 1;
    return `2026-08-23T00:00:0${this.#time}.000Z`;
  }
}

class DuplicateIdentityConstruction implements KnowledgeConstructionValues {
  #time = 0;

  public nextKnowledgeIdentity(): unknown {
    return "duplicate-after-publication";
  }

  public nextAcceptedAt(): unknown {
    this.#time += 1;
    return `2026-08-23T00:01:0${this.#time}.000Z`;
  }
}

class ControlledFailingSettlementCoordinator implements KnowledgeSettlementCoordinator {
  readonly #delegate = createKnowledgeSettlementCoordinator();
  public waitCalls = 0;

  public admit() {
    return this.#delegate.admit();
  }

  public async waitUntilSettled(): Promise<void> {
    this.waitCalls += 1;
    await this.#delegate.waitUntilSettled();
    throw new KnowledgeSettlementCoordinationError();
  }
}

class ControlledStore implements KnowledgeStore {
  public readonly records = new Map<KnowledgeIdentity, KnowledgeRecord>();
  public loadCalls = 0;
  public getCalls = 0;
  public mutationCalls = 0;
  public maxConcurrentMutations = 0;
  public activeMutations = 0;
  public snapshotGate: Deferred<KnowledgeLifecycleSnapshotResult> | undefined;
  public mutationGates: Deferred<PutIndependentAcceptedKnowledgeResult>[] = [];
  public nextMutationResult: PutIndependentAcceptedKnowledgeResult | undefined;
  public loadFailure: unknown;

  public async put(record: KnowledgeRecord): Promise<KnowledgeStorePutResult> {
    this.records.set(record.knowledgeIdentity, record);
    return { status: "stored", knowledgeIdentity: record.knowledgeIdentity };
  }

  public async get(
    knowledgeIdentity: KnowledgeIdentity,
  ): Promise<KnowledgeStoreGetResult> {
    this.getCalls += 1;
    const record = this.records.get(knowledgeIdentity);
    return record === undefined
      ? { status: "not-found" }
      : { status: "found", record };
  }

  public async putIndependentAcceptedKnowledge(
    request: PutIndependentAcceptedKnowledgeRequest,
  ): Promise<PutIndependentAcceptedKnowledgeResult> {
    this.mutationCalls += 1;
    this.activeMutations += 1;
    this.maxConcurrentMutations = Math.max(
      this.maxConcurrentMutations,
      this.activeMutations,
    );
    try {
      const gate = this.mutationGates.shift();
      const result =
        gate === undefined
          ? (this.nextMutationResult ?? {
              status: "stored" as const,
              knowledgeIdentity: request.record.knowledgeIdentity,
              acceptanceOrder: knowledgeAcceptanceOrder(
                `async-order-${this.mutationCalls}`,
              ),
            })
          : await gate.promise;
      this.nextMutationResult = undefined;
      if (result.status === "stored") {
        this.records.set(request.record.knowledgeIdentity, request.record);
      }
      return result;
    } finally {
      this.activeMutations -= 1;
    }
  }

  public async supersedeCurrentKnowledge(
    request: SupersedeCurrentKnowledgeRequest,
  ): Promise<SupersedeCurrentKnowledgeResult> {
    this.records.set(request.successor.knowledgeIdentity, request.successor);
    return {
      status: "superseded",
      predecessorKnowledgeIdentity:
        request.expectedPredecessorKnowledgeIdentity,
      successorKnowledgeIdentity: request.successor.knowledgeIdentity,
      acceptanceOrder: knowledgeAcceptanceOrder(
        `async-order-${this.mutationCalls + 1}`,
      ),
    };
  }

  public async loadKnowledgeLifecycleSnapshot(): Promise<KnowledgeLifecycleSnapshotResult> {
    this.loadCalls += 1;
    if (this.loadFailure !== undefined) throw this.loadFailure;
    if (this.snapshotGate !== undefined) return this.snapshotGate.promise;
    return {
      status: "loaded",
      snapshot: createKnowledgeLifecycleSnapshot({ entries: [] }),
    };
  }
}

function request(claim: string) {
  return {
    intent: "evaluate" as const,
    claim,
    acceptanceEvidence: {
      method: "explicit-authority-review",
      authorityIdentifier: "orion.test.authority",
      decision: "accept",
      reason: "Controlled lifecycle acceptance.",
    },
    provenance: {
      sourceType: "approved-internal-source",
      originatingCapability: "orion.test.async",
      observedAt: "2026-08-23T00:00:00.000Z",
    },
  };
}

async function ready(
  store = new ControlledStore(),
  settlementCoordinator?: KnowledgeSettlementCoordinator,
) {
  const engine = new KnowledgeEngine(
    store,
    new Construction(),
    settlementCoordinator,
  );
  await engine.initialize();
  return { engine, store };
}

describe("Knowledge Engine 3 async lifecycle", () => {
  it("keeps public construction limited to Store and construction values", () => {
    type PublicConstructorParameters = ConstructorParameters<
      typeof PublicKnowledgeEngine
    >;
    type ExpectedConstructorParameters = [
      store: KnowledgeStore,
      construction: KnowledgeConstructionValues,
    ];
    const constructorShapeMatches: PublicConstructorParameters extends ExpectedConstructorParameters
      ? ExpectedConstructorParameters extends PublicConstructorParameters
        ? true
        : false
      : false = true;

    expect(constructorShapeMatches).toBe(true);
    expect(publicKnowledge).not.toHaveProperty(
      "createKnowledgeSettlementCoordinator",
    );
    expect(publicKnowledge).not.toHaveProperty("KnowledgeEngineRuntime");
  });

  it("initializes eagerly with single-flight completion and no READY window", async () => {
    const store = new ControlledStore();
    const gate = new Deferred<KnowledgeLifecycleSnapshotResult>();
    store.snapshotGate = gate;
    const engine = new KnowledgeEngine(store, new Construction());

    const first = engine.initialize();
    const second = engine.initialize();
    expect(first).toBe(second);
    expect(engine.engineState).toBe("initializing");
    expect(() => engine.listKnowledgeReferences({})).toThrow(
      InvalidKnowledgeStateError,
    );
    expect(store.loadCalls).toBe(1);

    gate.resolve({
      status: "loaded",
      snapshot: createKnowledgeLifecycleSnapshot({ entries: [] }),
    });
    await first;
    expect(engine.engineState).toBe("ready");
    await expect(engine.initialize()).rejects.toBeInstanceOf(
      KnowledgeEngineInitializationError,
    );
  });

  it("fails initialization atomically, prohibits retry, and permits cleanup", async () => {
    const store = new ControlledStore();
    store.loadFailure = new Error("load failed");
    const engine = new KnowledgeEngine(store, new Construction());
    await expect(engine.initialize()).rejects.toBeInstanceOf(
      KnowledgeEngineInitializationError,
    );
    expect(engine.engineState).toBe("failed-initialization");
    expect(() => engine.listKnowledgeReferences({})).toThrow(
      InvalidKnowledgeStateError,
    );
    await expect(engine.initialize()).rejects.toBeInstanceOf(
      KnowledgeEngineInitializationError,
    );
    await engine.stop();
    expect(engine.engineState).toBe("stopped");
  });

  it("serializes admitted mutations and publishes A before B validates", async () => {
    const { engine, store } = await ready();
    const firstGate = new Deferred<PutIndependentAcceptedKnowledgeResult>();
    store.mutationGates.push(firstGate);
    const first = engine.evaluateKnowledgeClaim(request("first"));
    const second = engine.evaluateKnowledgeClaim(request("second"));
    await Promise.resolve();
    await Promise.resolve();
    expect(store.mutationCalls).toBe(1);

    firstGate.resolve({
      status: "stored",
      knowledgeIdentity: knowledgeIdentity("async-knowledge-1"),
      acceptanceOrder: knowledgeAcceptanceOrder("async-order-1"),
    });
    await first;
    await second;
    expect(store.maxConcurrentMutations).toBe(1);
    expect(engine.listKnowledgeReferences({})).toHaveLength(2);
  });

  it("validates B against A's published identity inside serialization", async () => {
    const store = new ControlledStore();
    const engine = new KnowledgeEngine(
      store,
      new DuplicateIdentityConstruction(),
    );
    await engine.initialize();
    const gate = new Deferred<PutIndependentAcceptedKnowledgeResult>();
    store.mutationGates.push(gate);
    const first = engine.evaluateKnowledgeClaim(request("first"));
    const second = engine.evaluateKnowledgeClaim(request("second"));
    gate.resolve({
      status: "stored",
      knowledgeIdentity: knowledgeIdentity("duplicate-after-publication"),
      acceptanceOrder: knowledgeAcceptanceOrder("async-order-duplicate"),
    });
    await first;
    await expect(second).rejects.toThrow("already accepted");
    expect(store.mutationCalls).toBe(1);
  });

  it("treats ambiguity as reconstruction-required and suppresses queued Store work", async () => {
    const { engine, store } = await ready();
    const gate = new Deferred<PutIndependentAcceptedKnowledgeResult>();
    store.mutationGates.push(gate);
    const ambiguous = engine.evaluateKnowledgeClaim(request("ambiguous"));
    const queued = engine.evaluateKnowledgeClaim(request("queued"));
    await Promise.resolve();
    gate.resolve({ status: "ambiguous" });

    await expect(ambiguous).rejects.toBeInstanceOf(
      KnowledgeStoreUnavailableError,
    );
    await expect(queued).rejects.toBeInstanceOf(KnowledgeStoreUnavailableError);
    expect(store.mutationCalls).toBe(1);
    expect(engine.engineState).toBe("reconstruction-required");
    expect(() => engine.listKnowledgeReferences({})).toThrow(
      InvalidKnowledgeStateError,
    );
  });

  it("recovers with single-flight, supports retry after failure, and never replays", async () => {
    const { engine, store } = await ready();
    store.nextMutationResult = { status: "ambiguous" };
    await expect(
      engine.evaluateKnowledgeClaim(request("ambiguous")),
    ).rejects.toBeInstanceOf(KnowledgeStoreUnavailableError);
    const mutationCalls = store.mutationCalls;

    store.loadFailure = new Error("first recovery failed");
    const failed = engine.recover();
    expect(engine.recover()).toBe(failed);
    await expect(failed).rejects.toBeInstanceOf(KnowledgeEngineRecoveryError);
    expect(engine.engineState).toBe("reconstruction-required");

    store.loadFailure = undefined;
    const gate = new Deferred<KnowledgeLifecycleSnapshotResult>();
    store.snapshotGate = gate;
    const first = engine.recover();
    const second = engine.recover();
    expect(second).toBe(first);
    gate.resolve({
      status: "loaded",
      snapshot: createKnowledgeLifecycleSnapshot({ entries: [] }),
    });
    await first;
    expect(engine.engineState).toBe("ready");
    expect(store.mutationCalls).toBe(mutationCalls);
  });

  it("owns admitted work after caller abandonment and drains it during shutdown", async () => {
    const { engine, store } = await ready();
    const gate = new Deferred<PutIndependentAcceptedKnowledgeResult>();
    store.mutationGates.push(gate);
    void engine.evaluateKnowledgeClaim(request("abandoned"));
    await Promise.resolve();
    const firstStop = engine.stop();
    const secondStop = engine.stop();
    expect(secondStop).toBe(firstStop);
    expect(engine.engineState).toBe("stopping");
    await expect(
      engine.evaluateKnowledgeClaim(request("not admitted")),
    ).rejects.toBeInstanceOf(InvalidKnowledgeStateError);

    gate.resolve({
      status: "stored",
      knowledgeIdentity: knowledgeIdentity("async-knowledge-1"),
      acceptanceOrder: knowledgeAcceptanceOrder("async-order-1"),
    });
    await firstStop;
    expect(engine.engineState).toBe("stopped");
    await expect(engine.stop()).resolves.toBeUndefined();
    expect(store.mutationCalls).toBe(1);
  });

  it("keeps shutdown pending for unresolved admitted work without treating it as settlement failure", async () => {
    const { engine, store } = await ready();
    const gate = new Deferred<PutIndependentAcceptedKnowledgeResult>();
    store.mutationGates.push(gate);
    const mutation = engine.evaluateKnowledgeClaim(request("pending"));
    await Promise.resolve();

    let shutdownSettled = false;
    const shutdown = engine.stop().finally(() => {
      shutdownSettled = true;
    });
    await Promise.resolve();
    await Promise.resolve();
    expect(engine.engineState).toBe("stopping");
    expect(shutdownSettled).toBe(false);

    gate.resolve({
      status: "stored",
      knowledgeIdentity: knowledgeIdentity("async-knowledge-1"),
      acceptanceOrder: knowledgeAcceptanceOrder("async-order-1"),
    });
    await mutation;
    await shutdown;
    expect(engine.engineState).toBe("stopped");
  });

  it("waits for initialization during shutdown without exposing READY", async () => {
    const store = new ControlledStore();
    const gate = new Deferred<KnowledgeLifecycleSnapshotResult>();
    store.snapshotGate = gate;
    const engine = new KnowledgeEngine(store, new Construction());
    const initialization = engine.initialize();
    const shutdown = engine.stop();
    expect(engine.engineState).toBe("initializing");
    gate.resolve({
      status: "loaded",
      snapshot: createKnowledgeLifecycleSnapshot({ entries: [] }),
    });
    await initialization;
    expect(engine.engineState).not.toBe("ready");
    await shutdown;
    expect(engine.engineState).toBe("stopped");
  });

  it("cleans up after initialization fails while shutdown is pending", async () => {
    const store = new ControlledStore();
    const gate = new Deferred<KnowledgeLifecycleSnapshotResult>();
    store.snapshotGate = gate;
    const engine = new KnowledgeEngine(store, new Construction());
    const initialization = engine.initialize();
    const shutdown = engine.stop();
    gate.reject(new Error("initialization failed"));
    await expect(initialization).rejects.toBeInstanceOf(
      KnowledgeEngineInitializationError,
    );
    await shutdown;
    expect(engine.engineState).toBe("stopped");
  });

  it("waits for an admitted recovery and never starts recovery after STOPPING", async () => {
    const { engine, store } = await ready();
    store.nextMutationResult = { status: "ambiguous" };
    await expect(
      engine.evaluateKnowledgeClaim(request("ambiguous")),
    ).rejects.toBeInstanceOf(KnowledgeStoreUnavailableError);
    const gate = new Deferred<KnowledgeLifecycleSnapshotResult>();
    store.snapshotGate = gate;
    const recovery = engine.recover();
    const shutdown = engine.stop();
    expect(engine.engineState).toBe("reconstructing");
    gate.resolve({
      status: "loaded",
      snapshot: createKnowledgeLifecycleSnapshot({ entries: [] }),
    });
    await recovery;
    await shutdown;
    expect(engine.engineState).toBe("stopped");
    await expect(engine.recover()).rejects.toBeInstanceOf(
      KnowledgeEngineRecoveryError,
    );
  });

  it("stops the shutdown drain after an admitted ambiguous mutation", async () => {
    const { engine, store } = await ready();
    const gate = new Deferred<PutIndependentAcceptedKnowledgeResult>();
    store.mutationGates.push(gate);
    const first = engine.evaluateKnowledgeClaim(request("ambiguous"));
    const second = engine.evaluateKnowledgeClaim(request("must not execute"));
    const shutdown = engine.stop();
    gate.resolve({ status: "ambiguous" });
    await expect(first).rejects.toBeInstanceOf(KnowledgeStoreUnavailableError);
    await expect(second).rejects.toBeInstanceOf(KnowledgeStoreUnavailableError);
    await shutdown;
    expect(store.mutationCalls).toBe(1);
    expect(engine.engineState).toBe("stopped");
  });

  it("fails shutdown terminally when internal settlement proof is unavailable", async () => {
    const coordinator = new ControlledFailingSettlementCoordinator();
    const { engine, store } = await ready(new ControlledStore(), coordinator);
    const loadCallsBeforeShutdown = store.loadCalls;

    const abandoned = engine.stop();
    void abandoned.catch(() => undefined);
    const joined = engine.stop();
    expect(joined).toBe(abandoned);
    await expect(joined).rejects.toBeInstanceOf(KnowledgeEngineShutdownError);

    expect(engine.engineState).toBe("failed-shutdown");
    expect(engine.engineState).not.toBe("stopped");
    await expect(engine.stop()).rejects.toBeInstanceOf(
      KnowledgeEngineShutdownError,
    );
    expect(coordinator.waitCalls).toBe(1);
    expect(store.loadCalls).toBe(loadCallsBeforeShutdown);

    expect(() => engine.getKnowledge({ knowledgeIdentity: "missing" })).toThrow(
      InvalidKnowledgeStateError,
    );
    expect(() => engine.listKnowledgeReferences({})).toThrow(
      InvalidKnowledgeStateError,
    );
    expect(() => engine.projectStructuredKnowledge({})).toThrow(
      InvalidKnowledgeStateError,
    );
    await expect(
      engine.evaluateKnowledgeClaim(request("prohibited")),
    ).rejects.toBeInstanceOf(InvalidKnowledgeStateError);
    await expect(engine.recover()).rejects.toBeInstanceOf(
      KnowledgeEngineRecoveryError,
    );
    await expect(engine.initialize()).rejects.toBeInstanceOf(
      KnowledgeEngineInitializationError,
    );

    const replacement = new KnowledgeEngine(store, new Construction());
    await replacement.initialize();
    expect(replacement.engineState).toBe("ready");
    await replacement.stop();
  });

  it("fails the production coordinator closed on invalid settlement accounting", async () => {
    const coordinator = createKnowledgeSettlementCoordinator();
    const settle = coordinator.admit();
    settle();
    settle();
    await expect(coordinator.waitUntilSettled()).rejects.toBeInstanceOf(
      KnowledgeSettlementCoordinationError,
    );
  });
});
