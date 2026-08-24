import {
  createKnowledgeRecord,
  knowledgeIdentity,
  knowledgeVersion,
  type KnowledgeRecord,
  type KnowledgeStore,
} from "@orion/core";
import { describe, expect, it } from "vitest";

export interface KnowledgeStoreConformanceHarness {
  createStore(): Promise<KnowledgeStore>;
}

export function registerKnowledgeStoreConformance(
  name: string,
  harness: KnowledgeStoreConformanceHarness,
  suite: (name: string, factory: () => void) => unknown = describe,
): void {
  suite(`${name} unified Promise KnowledgeStore conformance`, () => {
    it("keeps legacy put/get Promise-compatible and historically exact", async () => {
      const store = await harness.createStore();
      const original = conformanceRecord("legacy", 1);
      const put = store.put(original);
      expect(put).toBeInstanceOf(Promise);
      await expect(put).resolves.toMatchObject({ status: "stored" });
      await expect(store.put(original)).resolves.toEqual({
        status: "duplicate",
      });
      await expect(store.get(original.knowledgeIdentity)).resolves.toEqual({
        status: "found",
        record: original,
      });
      await expect(
        store.get(knowledgeIdentity("conformance-missing-record")),
      ).resolves.toEqual({ status: "not-found" });
    });

    it("accepts independent Knowledge exactly once and freezes the result", async () => {
      const store = await harness.createStore();
      const original = conformanceRecord("independent", 1);
      const first = await store.putIndependentAcceptedKnowledge({
        record: original,
      });
      expect(first).toMatchObject({
        status: "stored",
        knowledgeIdentity: original.knowledgeIdentity,
      });
      expect(Object.isFrozen(first)).toBe(true);
      await expect(
        store.putIndependentAcceptedKnowledge({ record: original }),
      ).resolves.toEqual({ status: "duplicate" });
      const snapshot = await store.loadKnowledgeLifecycleSnapshot();
      expect(snapshot).toMatchObject({
        status: "loaded",
        snapshot: {
          entries: [
            {
              knowledgeIdentity: original.knowledgeIdentity,
              standing: "current",
            },
          ],
        },
      });
    });

    it("rejects predecessor-bearing independent acceptance", async () => {
      const store = await harness.createStore();
      const successor = conformanceRecord("invalid-independent", 2, "prior");
      await expect(
        store.putIndependentAcceptedKnowledge({ record: successor }),
      ).resolves.toEqual({ status: "invalid-state" });
      await expect(store.get(successor.knowledgeIdentity)).resolves.toEqual({
        status: "not-found",
      });
    });

    it("supersedes atomically while retaining exact history and order", async () => {
      const store = await harness.createStore();
      const predecessor = conformanceRecord("predecessor", 1);
      const successor = conformanceRecord("successor", 2, "predecessor");
      await expect(
        store.putIndependentAcceptedKnowledge({ record: predecessor }),
      ).resolves.toMatchObject({ status: "stored" });
      const result = await store.supersedeCurrentKnowledge({
        expectedPredecessorKnowledgeIdentity: predecessor.knowledgeIdentity,
        expectedPredecessorVersion: knowledgeVersion(1),
        successor,
      });
      expect(result).toMatchObject({
        status: "superseded",
        predecessorKnowledgeIdentity: predecessor.knowledgeIdentity,
        successorKnowledgeIdentity: successor.knowledgeIdentity,
      });
      expect(Object.isFrozen(result)).toBe(true);
      await expect(store.get(predecessor.knowledgeIdentity)).resolves.toEqual({
        status: "found",
        record: predecessor,
      });
      await expect(store.get(successor.knowledgeIdentity)).resolves.toEqual({
        status: "found",
        record: successor,
      });
      const snapshot = await store.loadKnowledgeLifecycleSnapshot();
      expect(snapshot).toMatchObject({
        status: "loaded",
        snapshot: {
          entries: [
            {
              knowledgeIdentity: predecessor.knowledgeIdentity,
              standing: "superseded",
            },
            {
              knowledgeIdentity: successor.knowledgeIdentity,
              predecessorKnowledgeIdentity: predecessor.knowledgeIdentity,
              standing: "current",
            },
          ],
        },
      });
    });

    it("classifies missing, stale, and version-mismatched predecessors", async () => {
      const store = await harness.createStore();
      await expect(
        store.supersedeCurrentKnowledge({
          expectedPredecessorKnowledgeIdentity: knowledgeIdentity(
            "store-conformance-missing",
          ),
          expectedPredecessorVersion: knowledgeVersion(1),
          successor: conformanceRecord("missing-successor", 2, "missing"),
        }),
      ).resolves.toEqual({ status: "predecessor-not-found" });

      const predecessor = conformanceRecord("stale-a", 1);
      await store.putIndependentAcceptedKnowledge({ record: predecessor });
      await expect(
        store.supersedeCurrentKnowledge({
          expectedPredecessorKnowledgeIdentity: predecessor.knowledgeIdentity,
          expectedPredecessorVersion: knowledgeVersion(2),
          successor: conformanceRecord("wrong-version", 2, "stale-a"),
        }),
      ).resolves.toEqual({ status: "stale-predecessor" });

      await store.supersedeCurrentKnowledge({
        expectedPredecessorKnowledgeIdentity: predecessor.knowledgeIdentity,
        expectedPredecessorVersion: knowledgeVersion(1),
        successor: conformanceRecord("stale-b", 2, "stale-a"),
      });
      await expect(
        store.supersedeCurrentKnowledge({
          expectedPredecessorKnowledgeIdentity: predecessor.knowledgeIdentity,
          expectedPredecessorVersion: knowledgeVersion(1),
          successor: conformanceRecord("stale-c", 2, "stale-a"),
        }),
      ).resolves.toEqual({ status: "stale-predecessor" });
      await expect(store.get(knowledgeIdentity("stale-c"))).resolves.toEqual({
        status: "not-found",
      });
    });
  });
}

function conformanceRecord(
  suffix: string,
  version: number,
  predecessor?: string,
): KnowledgeRecord {
  return createKnowledgeRecord({
    knowledgeIdentity: `store-conformance-${suffix}`,
    claim: `Exact conformance claim ${suffix}.`,
    provenance: {
      sourceType: "approved-internal-source",
      originatingCapability: "orion.test.store-conformance",
      observedAt: "2026-08-24T00:00:00.000Z",
      sourceReference: `source-${suffix}`,
    },
    acceptanceEvidence: {
      method: "explicit-authority-review",
      authorityIdentifier: "orion.test.store-conformance",
      decision: "accept",
      reason: "Shared Promise-aware Store conformance.",
    },
    acceptedAt: "2026-08-24T00:00:01.000Z",
    version,
    ...(predecessor === undefined
      ? {}
      : {
          supersedesKnowledgeIdentity: knowledgeIdentity(
            `store-conformance-${predecessor}`,
          ),
        }),
  });
}
