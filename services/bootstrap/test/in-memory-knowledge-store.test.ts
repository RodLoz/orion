import { createKnowledgeRecord, knowledgeIdentity } from "@orion/core";
import { describe, expect, it } from "vitest";

import { InMemoryKnowledgeStore } from "../src/knowledge/in-memory-knowledge-store.js";
import { registerKnowledgeStoreConformance } from "./knowledge-store-conformance.js";

registerKnowledgeStoreConformance("InMemoryKnowledgeStore", {
  async createStore() {
    return new InMemoryKnowledgeStore();
  },
});

function record(identity: string) {
  return createKnowledgeRecord({
    knowledgeIdentity: identity,
    claim: "A mechanical Knowledge Store fixture.",
    provenance: {
      sourceType: "approved-internal-source",
      originatingCapability: "orion.test",
      observedAt: "2026-07-20T00:00:00.000Z",
    },
    acceptanceEvidence: {
      method: "explicit-authority-review",
      authorityIdentifier: "orion.test.authority",
      decision: "accept",
      reason: "Mechanical Store fixture.",
    },
    acceptedAt: "2026-07-20T00:01:00.000Z",
    version: 1,
  });
}

describe("In-memory Knowledge Store", () => {
  it("mechanically stores and retrieves immutable Records", async () => {
    const store = new InMemoryKnowledgeStore();
    const value = record("knowledge-1");
    await expect(store.put(value)).resolves.toEqual({
      status: "stored",
      knowledgeIdentity: "knowledge-1",
    });
    await expect(store.put(value)).resolves.toEqual({ status: "duplicate" });
    await expect(store.get(value.knowledgeIdentity)).resolves.toEqual({
      status: "found",
      record: value,
    });
    expect(Object.isFrozen(await store.get(value.knowledgeIdentity))).toBe(
      true,
    );
  });

  it("reports deterministic unavailable behavior", async () => {
    const store = new InMemoryKnowledgeStore();
    store.setAvailable(false);
    const value = record("knowledge-1");
    await expect(store.put(value)).resolves.toEqual({ status: "unavailable" });
    await expect(store.get(value.knowledgeIdentity)).resolves.toEqual({
      status: "unavailable",
    });
  });

  it("supports malformed and write-then-malformed test simulation", async () => {
    const store = new InMemoryKnowledgeStore();
    store.setNextResult("get", { status: "unexpected" });
    await expect(store.get(knowledgeIdentity("knowledge-1"))).resolves.toEqual({
      status: "unexpected",
    });
    store.setWriteThenPutResult({ status: "stored" });
    const value = record("knowledge-1");
    await expect(store.put(value)).resolves.toEqual({ status: "stored" });
    expect(store.inspectRecordCount()).toBe(1);
  });
});
