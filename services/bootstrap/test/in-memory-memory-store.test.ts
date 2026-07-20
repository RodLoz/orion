import {
  createMemoryProvenance,
  createMemoryRecord,
  createMemoryRetentionIntent,
  memoryContent,
  memoryIdentity,
  memoryOriginatingCapability,
  memoryRetentionReason,
  memoryTimestamp,
} from "@orion/core";
import { describe, expect, it } from "vitest";

import { InMemoryMemoryStore } from "../src/memory/in-memory-memory-store.js";

function record(identity: string) {
  return createMemoryRecord({
    memoryIdentity: memoryIdentity(identity),
    content: memoryContent("Mechanical store fixture."),
    retentionIntent: createMemoryRetentionIntent(
      memoryRetentionReason("Store test."),
    ),
    provenance: createMemoryProvenance({
      sourceType: "capability-outcome",
      originatingCapability: memoryOriginatingCapability("orion.test"),
      observedAt: memoryTimestamp("2026-07-20T00:00:00.000Z"),
      occurrenceEvidence: "observed",
    }),
    retainedAt: memoryTimestamp("2026-07-20T00:01:00.000Z"),
  });
}

describe("In-memory Memory Store", () => {
  it("mechanically stores, retrieves, lists in insertion order, and deletes", () => {
    const store = new InMemoryMemoryStore();
    const first = record("first");
    const second = record("second");
    expect(store.put(first)).toEqual({
      status: "stored",
      memoryIdentity: "first",
    });
    expect(store.put(second)).toEqual({
      status: "stored",
      memoryIdentity: "second",
    });
    expect(store.put(first)).toEqual({ status: "duplicate" });
    expect(store.get(first.memoryIdentity)).toEqual({
      status: "found",
      record: first,
    });
    expect(store.list(1)).toMatchObject({
      status: "listed",
      references: [{ memoryIdentity: "first" }],
    });
    expect(store.delete(first.memoryIdentity)).toEqual({
      status: "deleted",
      memoryIdentity: "first",
    });
    expect(store.get(first.memoryIdentity)).toEqual({ status: "not-found" });
    expect(store.delete(first.memoryIdentity)).toEqual({ status: "not-found" });
  });

  it("reports deterministic unavailability for every operation", () => {
    const store = new InMemoryMemoryStore();
    store.setAvailable(false);
    const value = record("memory");
    expect(store.put(value)).toEqual({ status: "unavailable" });
    expect(store.get(value.memoryIdentity)).toEqual({ status: "unavailable" });
    expect(store.list(50)).toEqual({ status: "unavailable" });
    expect(store.delete(value.memoryIdentity)).toEqual({
      status: "unavailable",
    });
  });

  it("supports one-shot malformed-result simulation without semantic decisions", () => {
    const store = new InMemoryMemoryStore();
    store.simulateNextResult("get", {
      status: "unexpected",
      payload: "fixture",
    });
    expect(store.get(memoryIdentity("memory"))).toEqual({
      status: "unexpected",
      payload: "fixture",
    });
    expect(store.get(memoryIdentity("memory"))).toEqual({
      status: "not-found",
    });
  });
});
