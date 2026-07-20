import {
  DuplicateMemoryIdentityError,
  InvalidMemoryIdentityError,
  InvalidMemoryInputError,
  InvalidMemoryStateError,
  InvalidRetentionIntentError,
  MemoryNotFoundError,
  MemoryStoreUnavailableError,
  createMemoryReference,
  type MemoryConstructionValues,
  type MemoryIdentity,
  type MemoryRecord,
  type MemoryStore,
  type MemoryStoreDeleteResult,
  type MemoryStoreGetResult,
  type MemoryStoreListResult,
  type MemoryStorePutResult,
} from "@orion/core";
import { describe, expect, it } from "vitest";

import { MemoryEngine } from "../src/index.js";

class TestConstruction implements MemoryConstructionValues {
  #identity = 0;
  #retained = 0;
  #retrieved = 0;
  public constructor(
    private readonly identities: readonly unknown[] = ["memory-1", "memory-2"],
  ) {}
  public nextMemoryIdentity(): unknown {
    return this.identities[this.#identity++];
  }
  public nextRetainedAt(): unknown {
    return ["2026-07-20T00:01:00.000Z", "2026-07-20T00:02:00.000Z"][
      this.#retained++
    ];
  }
  public nextRetrievedAt(): unknown {
    return ["2026-07-20T00:03:00.000Z", "2026-07-20T00:04:00.000Z"][
      this.#retrieved++
    ];
  }
}

class TestStore implements MemoryStore {
  readonly records = new Map<MemoryIdentity, MemoryRecord>();
  available = true;
  overrides = new Map<string, unknown>();
  writeThenPutResult: unknown = undefined;
  throws: unknown = undefined;
  put(record: MemoryRecord): MemoryStorePutResult {
    this.maybeThrow();
    if (this.writeThenPutResult !== undefined) {
      this.records.set(record.memoryIdentity, record);
      return this.writeThenPutResult as MemoryStorePutResult;
    }
    if (this.overrides.has("put"))
      return this.overrides.get("put") as MemoryStorePutResult;
    if (!this.available) return { status: "unavailable" };
    if (this.records.has(record.memoryIdentity)) return { status: "duplicate" };
    this.records.set(record.memoryIdentity, record);
    return { status: "stored", memoryIdentity: record.memoryIdentity };
  }
  get(identity: MemoryIdentity): MemoryStoreGetResult {
    this.maybeThrow();
    if (this.overrides.has("get"))
      return this.overrides.get("get") as MemoryStoreGetResult;
    if (!this.available) return { status: "unavailable" };
    const record = this.records.get(identity);
    return record === undefined
      ? { status: "not-found" }
      : { status: "found", record };
  }
  list(limit: number): MemoryStoreListResult {
    this.maybeThrow();
    if (this.overrides.has("list"))
      return this.overrides.get("list") as MemoryStoreListResult;
    if (!this.available) return { status: "unavailable" };
    return {
      status: "listed",
      references: [...this.records.values()]
        .slice(0, limit)
        .map((record) => createMemoryReference(record.memoryIdentity)),
    };
  }
  delete(identity: MemoryIdentity): MemoryStoreDeleteResult {
    this.maybeThrow();
    if (this.overrides.has("delete"))
      return this.overrides.get("delete") as MemoryStoreDeleteResult;
    if (!this.available) return { status: "unavailable" };
    return this.records.delete(identity)
      ? { status: "deleted", memoryIdentity: identity }
      : { status: "not-found" };
  }
  private maybeThrow(): void {
    if (this.throws !== undefined) throw this.throws;
  }
}

function createEngine(
  store = new TestStore(),
  construction: MemoryConstructionValues = new TestConstruction(),
) {
  const engine = new MemoryEngine(store, construction);
  engine.initialize();
  engine.start();
  return { engine, store };
}

function request(sourceReference?: unknown) {
  return {
    intent: "retain",
    kind: "episodic",
    content: "A project milestone occurred.",
    retentionReason: "Preserve project continuity.",
    provenance: {
      sourceType: "capability-outcome",
      originatingCapability: "orion.test",
      observedAt: "2026-07-20T00:00:00.000Z",
      occurrenceEvidence: "observed",
      ...(sourceReference === undefined ? {} : { sourceReference }),
    },
  };
}

describe("Memory Engine retention", () => {
  it("retains one explicit immutable Episodic Memory with provenance", () => {
    const { engine } = createEngine();
    const record = engine.retainMemory(request("opaque-ref"));
    expect(record.kind).toBe("episodic");
    expect(record.provenance.sourceReference).toBe("opaque-ref");
    expect(record.provenance.observedAt).not.toBe(record.retainedAt);
    expect(Object.isFrozen(record)).toBe(true);
    expect(Object.isFrozen(record.provenance)).toBe(true);
  });

  it.each([null, undefined, 4, "retain", [], {}])(
    "rejects hostile retention request %j without Store mutation",
    (value) => {
      const { engine, store } = createEngine();
      expect(() => engine.retainMemory(value)).toThrow();
      expect(store.records.size).toBe(0);
    },
  );

  it("distinguishes invalid intent, content, and provenance", () => {
    const { engine } = createEngine();
    expect(() =>
      engine.retainMemory({ ...request(), intent: "observe" }),
    ).toThrow(InvalidRetentionIntentError);
    expect(() =>
      engine.retainMemory({ ...request(), retentionReason: "" }),
    ).toThrow(InvalidRetentionIntentError);
    expect(() => engine.retainMemory({ ...request(), content: "" })).toThrow(
      InvalidMemoryInputError,
    );
    expect(() =>
      engine.retainMemory({ ...request(), provenance: null }),
    ).toThrow(InvalidMemoryInputError);
  });

  it("accepts structurally valid opaque Source Reference without inspection", () => {
    const { engine } = createEngine();
    expect(
      engine.retainMemory(request("opaque-value-token-word")).provenance
        .sourceReference,
    ).toBe("opaque-value-token-word");
  });

  it("rejects duplicate allocation and unavailable Store", () => {
    const duplicate = createEngine(
      new TestStore(),
      new TestConstruction(["same", "same"]),
    );
    duplicate.engine.retainMemory(request());
    expect(() => duplicate.engine.retainMemory(request())).toThrow(
      DuplicateMemoryIdentityError,
    );

    const unavailable = createEngine();
    unavailable.store.available = false;
    expect(() => unavailable.engine.retainMemory(request())).toThrow(
      MemoryStoreUnavailableError,
    );
    expect(unavailable.store.records.size).toBe(0);
  });
});

describe("Memory Engine retrieval, listing, and forgetting", () => {
  it("creates exactly one immutable receipt and derives latest last-used", () => {
    const { engine } = createEngine();
    const record = engine.retainMemory(request());
    const first = engine.getMemory({
      memoryIdentity: record.memoryIdentity,
      purpose: "continuity",
    });
    expect(engine.lastUsedAt(record.memoryIdentity)).toBe(
      first.receipt.retrievedAt,
    );
    const second = engine.getMemory({
      memoryIdentity: record.memoryIdentity,
      purpose: "user-requested-recall",
    });
    expect(engine.lastUsedAt(record.memoryIdentity)).toBe(
      second.receipt.retrievedAt,
    );
    expect(second.receipt).not.toBe(first.receipt);
    expect(Object.isFrozen(first.receipt)).toBe(true);
    expect(first.memory).toEqual(record);
    expect(first.memory).not.toHaveProperty("lastUsedAt");
  });

  it("requires valid identity and explicit closed purpose without failed-use updates", () => {
    const { engine } = createEngine();
    const record = engine.retainMemory(request());
    expect(() =>
      engine.getMemory({ memoryIdentity: record.memoryIdentity }),
    ).toThrow(InvalidMemoryInputError);
    expect(() =>
      engine.getMemory({
        memoryIdentity: record.memoryIdentity,
        purpose: "free",
      }),
    ).toThrow(InvalidMemoryInputError);
    expect(() =>
      engine.getMemory({
        memoryIdentity: { toString: () => record.memoryIdentity },
        purpose: "continuity",
      }),
    ).toThrow(InvalidMemoryIdentityError);
    expect(engine.lastUsedAt(record.memoryIdentity)).toBeUndefined();
    expect(() =>
      engine.getMemory({ memoryIdentity: "unknown", purpose: "continuity" }),
    ).toThrow(MemoryNotFoundError);
  });

  it("preserves the latest successful receipt after a failed Get", () => {
    const { engine } = createEngine();
    const record = engine.retainMemory(request());
    const successful = engine.getMemory({
      memoryIdentity: record.memoryIdentity,
      purpose: "continuity",
    });
    expect(() =>
      engine.getMemory({
        memoryIdentity: record.memoryIdentity,
        purpose: "invalid-purpose",
      }),
    ).toThrow(InvalidMemoryInputError);
    expect(engine.lastUsedAt(record.memoryIdentity)).toBe(
      successful.receipt.retrievedAt,
    );
  });

  it.each([0, 101, -1, 1.5, "1", Number.NaN, { valueOf: () => 1 }])(
    "rejects invalid list limit %j",
    (limit) => {
      const { engine } = createEngine();
      expect(() => engine.listRetainedMemoryReferences({ limit })).toThrow(
        InvalidMemoryInputError,
      );
    },
  );

  it("defaults listing to 50, accepts boundaries, and does not mark use", () => {
    const { engine } = createEngine();
    const record = engine.retainMemory(request());
    expect(engine.listRetainedMemoryReferences({})).toHaveLength(1);
    expect(engine.listRetainedMemoryReferences({ limit: 1 })).toHaveLength(1);
    expect(engine.listRetainedMemoryReferences({ limit: 100 })).toHaveLength(1);
    expect(engine.lastUsedAt(record.memoryIdentity)).toBeUndefined();
    expect(engine.listRetainedMemoryReferences({})[0]).not.toHaveProperty(
      "content",
    );
  });

  it("does not replace latest retrieval metadata during listing", () => {
    const { engine } = createEngine();
    const record = engine.retainMemory(request());
    const retrieved = engine.getMemory({
      memoryIdentity: record.memoryIdentity,
      purpose: "continuity",
    });
    engine.listRetainedMemoryReferences({});
    expect(engine.lastUsedAt(record.memoryIdentity)).toBe(
      retrieved.receipt.retrievedAt,
    );
  });

  it("forgets explicitly without mutating the prior record", () => {
    const { engine } = createEngine();
    const record = engine.retainMemory(request());
    engine.getMemory({
      memoryIdentity: record.memoryIdentity,
      purpose: "continuity",
    });
    const snapshot = { ...record };
    expect(
      engine.forgetMemory({
        intent: "forget",
        memoryIdentity: record.memoryIdentity,
      }).outcome,
    ).toBe("deleted");
    expect(record).toEqual(snapshot);
    expect(() =>
      engine.getMemory({
        memoryIdentity: record.memoryIdentity,
        purpose: "continuity",
      }),
    ).toThrow(MemoryNotFoundError);
    expect(engine.lastUsedAt(record.memoryIdentity)).toBeUndefined();
    expect(engine.listRetainedMemoryReferences({})).toHaveLength(0);
    expect(engine.lastUsedAt(record.memoryIdentity)).toBeUndefined();
    expect(() =>
      engine.forgetMemory({
        intent: "forget",
        memoryIdentity: record.memoryIdentity,
      }),
    ).toThrow(MemoryNotFoundError);
  });
});

describe("Memory Engine untrusted Store boundary", () => {
  it.each(["get", "list", "delete"] as const)(
    "preserves Store unavailability for %s",
    (operation) => {
      const setup = createEngine();
      const record = setup.engine.retainMemory(request());
      setup.store.available = false;
      const invoke = {
        get: () =>
          setup.engine.getMemory({
            memoryIdentity: record.memoryIdentity,
            purpose: "continuity",
          }),
        list: () => setup.engine.listRetainedMemoryReferences({}),
        delete: () =>
          setup.engine.forgetMemory({
            intent: "forget",
            memoryIdentity: record.memoryIdentity,
          }),
      }[operation];
      expect(invoke).toThrow(MemoryStoreUnavailableError);
    },
  );

  it.each([
    null,
    undefined,
    4,
    [],
    {},
    { status: "unknown" },
    { status: "found" },
  ])("rejects malformed Get result %j as Invalid Memory State", (result) => {
    const setup = createEngine();
    const record = setup.engine.retainMemory(request());
    setup.store.overrides.set("get", result);
    expect(() =>
      setup.engine.getMemory({
        memoryIdentity: record.memoryIdentity,
        purpose: "continuity",
      }),
    ).toThrow(InvalidMemoryStateError);
    expect(setup.engine.lastUsedAt(record.memoryIdentity)).toBeUndefined();
  });

  it("rejects malformed records and contradictory confirmations", () => {
    const setup = createEngine();
    const record = setup.engine.retainMemory(request());
    setup.store.overrides.set("get", {
      status: "found",
      record: { ...record, content: 4 },
    });
    expect(() =>
      setup.engine.getMemory({
        memoryIdentity: record.memoryIdentity,
        purpose: "continuity",
      }),
    ).toThrow(InvalidMemoryStateError);
    const other = createEngine();
    other.store.overrides.set("put", {
      status: "stored",
      memoryIdentity: "different",
    });
    expect(() => other.engine.retainMemory(request())).toThrow(
      InvalidMemoryStateError,
    );
  });

  it.each([
    { status: "stored", memoryIdentity: "different" },
    { status: "stored" },
  ])(
    "keeps a mechanically written candidate unretained after confirmation %j",
    (confirmation) => {
      const setup = createEngine();
      setup.store.writeThenPutResult = confirmation;
      expect(() => setup.engine.retainMemory(request())).toThrow(
        InvalidMemoryStateError,
      );
      expect(setup.store.records.size).toBe(1);
      expect(() =>
        setup.engine.getMemory({
          memoryIdentity: "memory-1",
          purpose: "continuity",
        }),
      ).toThrow(MemoryNotFoundError);
      expect(setup.engine.listRetainedMemoryReferences({})).toHaveLength(0);
    },
  );

  it.each([
    new Proxy(
      {},
      {
        getPrototypeOf() {
          throw new Error("hostile prototype");
        },
      },
    ),
    new Proxy(
      {},
      {
        get(target, property, receiver) {
          if (property === "status") throw new Error("hostile property");
          return Reflect.get(target, property, receiver);
        },
      },
    ),
  ])(
    "classifies hostile Store result inspection as Invalid Memory State",
    (result) => {
      const setup = createEngine();
      const record = setup.engine.retainMemory(request());
      setup.store.overrides.set("get", result);
      expect(() =>
        setup.engine.getMemory({
          memoryIdentity: record.memoryIdentity,
          purpose: "continuity",
        }),
      ).toThrow(InvalidMemoryStateError);
    },
  );

  it("rejects malformed list and delete results", () => {
    const setup = createEngine();
    const record = setup.engine.retainMemory(request());
    setup.store.overrides.set("list", {
      status: "listed",
      references: [{ kind: "episodic" }],
    });
    expect(() => setup.engine.listRetainedMemoryReferences({})).toThrow(
      InvalidMemoryStateError,
    );
    setup.store.overrides.set("delete", {
      status: "deleted",
      memoryIdentity: "different",
    });
    expect(() =>
      setup.engine.forgetMemory({
        intent: "forget",
        memoryIdentity: record.memoryIdentity,
      }),
    ).toThrow(InvalidMemoryStateError);
  });

  it.each([new Error("native store detail"), "non-error store detail"])(
    "normalizes thrown Store value without leaking it",
    (thrown) => {
      const setup = createEngine();
      setup.store.throws = thrown;
      try {
        setup.engine.retainMemory(request());
        throw new Error("expected failure");
      } catch (error: unknown) {
        expect(error).toBeInstanceOf(MemoryStoreUnavailableError);
        expect((error as Error).message).not.toContain("store detail");
      }
    },
  );
});
