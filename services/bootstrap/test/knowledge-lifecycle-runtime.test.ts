import {
  createKnowledgeLifecycleSnapshot,
  createKnowledgeRecord,
  createPutIndependentAcceptedKnowledgeRequest,
  createSupersedeCurrentKnowledgeRequest,
  knowledgeIdentity,
  type KnowledgeConstructionValues,
  type KnowledgeIdentity,
  type KnowledgeLifecycleStore,
} from "@orion/core";
import { KnowledgeEngine } from "@orion/knowledge";
import { describe, expect, it } from "vitest";

import { InMemoryKnowledgeStore } from "../src/knowledge/in-memory-knowledge-store.js";

function record(identity: string, version = 1, predecessor?: string) {
  return createKnowledgeRecord({
    knowledgeIdentity: identity,
    claim: `A durable Knowledge fixture: ${identity}.`,
    provenance: {
      sourceType: "approved-internal-source",
      originatingCapability: "orion.test",
      observedAt: "2026-07-20T00:00:00.000Z",
    },
    acceptanceEvidence: {
      method: "explicit-authority-review",
      authorityIdentifier: "orion.test.authority",
      decision: "accept",
      reason: "Durable lifecycle fixture.",
    },
    acceptedAt: `2026-07-20T00:0${version}:00.000Z`,
    version,
    ...(predecessor === undefined
      ? {}
      : { supersedesKnowledgeIdentity: predecessor }),
  });
}

class Construction implements KnowledgeConstructionValues {
  #identity = 0;
  #acceptedAt = 0;

  public constructor(private readonly identities: readonly string[]) {}

  public nextKnowledgeIdentity(): KnowledgeIdentity {
    return knowledgeIdentity(this.identities[this.#identity++]);
  }

  public nextAcceptedAt(): unknown {
    return `2026-07-20T01:0${this.#acceptedAt++}:00.000Z`;
  }
}

function acceptanceRequest(claim: string) {
  return {
    intent: "evaluate" as const,
    claim,
    acceptanceEvidence: {
      method: "explicit-authority-review" as const,
      authorityIdentifier: "orion.test.authority",
      decision: "accept" as const,
      reason: "Accepted by the lifecycle fixture.",
    },
    provenance: {
      sourceType: "approved-internal-source" as const,
      originatingCapability: "orion.test",
      observedAt: "2026-07-20T00:00:00.000Z",
    },
  };
}

describe("Knowledge 3 durable lifecycle runtime", () => {
  it("atomically accepts independent records and preserves canonical snapshot order", async () => {
    const store = new InMemoryKnowledgeStore();
    const first = record("knowledge-1");
    const second = record("knowledge-2");

    expect(
      await store.putIndependentAcceptedKnowledge(
        createPutIndependentAcceptedKnowledgeRequest({ record: first }),
      ),
    ).toMatchObject({ status: "stored", knowledgeIdentity: "knowledge-1" });
    expect(
      await store.putIndependentAcceptedKnowledge(
        createPutIndependentAcceptedKnowledgeRequest({ record: second }),
      ),
    ).toMatchObject({ status: "stored", knowledgeIdentity: "knowledge-2" });
    expect(
      await store.putIndependentAcceptedKnowledge(
        createPutIndependentAcceptedKnowledgeRequest({ record: first }),
      ),
    ).toEqual({ status: "duplicate" });
    const bypass = record("knowledge-bypass", 2, "knowledge-1");
    expect(
      await store.putIndependentAcceptedKnowledge(
        createPutIndependentAcceptedKnowledgeRequest({ record: bypass }),
      ),
    ).toEqual({ status: "invalid-state" });

    const snapshot = await store.loadKnowledgeLifecycleSnapshot();
    expect(snapshot.status).toBe("loaded");
    if (snapshot.status === "loaded") {
      expect(
        snapshot.snapshot.entries.map((entry) => entry.knowledgeIdentity),
      ).toEqual(["knowledge-1", "knowledge-2"]);
      expect(
        snapshot.snapshot.entries.every(
          (entry) => entry.standing === "current",
        ),
      ).toBe(true);
      expect(snapshot.snapshot.entries[0]?.acceptanceOrder).not.toBe(
        snapshot.snapshot.entries[1]?.acceptanceOrder,
      );
    }
  });

  it("atomically supersedes, retains history, and allows only one successor", async () => {
    const store = new InMemoryKnowledgeStore();
    const predecessor = record("knowledge-1");
    const successor = record("knowledge-2", 2, "knowledge-1");
    const competing = record("knowledge-3", 2, "knowledge-1");
    await store.putIndependentAcceptedKnowledge(
      createPutIndependentAcceptedKnowledgeRequest({ record: predecessor }),
    );
    expect(
      await store.supersedeCurrentKnowledge(
        createSupersedeCurrentKnowledgeRequest({
          expectedPredecessorKnowledgeIdentity: predecessor.knowledgeIdentity,
          expectedPredecessorVersion: 9,
          successor,
        }),
      ),
    ).toEqual({ status: "stale-predecessor" });
    expect(store.inspectRecordCount()).toBe(1);

    expect(
      await store.supersedeCurrentKnowledge(
        createSupersedeCurrentKnowledgeRequest({
          expectedPredecessorKnowledgeIdentity: predecessor.knowledgeIdentity,
          expectedPredecessorVersion: predecessor.version,
          successor,
        }),
      ),
    ).toMatchObject({
      status: "superseded",
      successorKnowledgeIdentity: "knowledge-2",
    });
    expect(
      await store.supersedeCurrentKnowledge(
        createSupersedeCurrentKnowledgeRequest({
          expectedPredecessorKnowledgeIdentity: predecessor.knowledgeIdentity,
          expectedPredecessorVersion: predecessor.version,
          successor: competing,
        }),
      ),
    ).toEqual({ status: "stale-predecessor" });
    await expect(
      store.get(predecessor.knowledgeIdentity),
    ).resolves.toMatchObject({
      status: "found",
      record: predecessor,
    });

    const snapshot = await store.loadKnowledgeLifecycleSnapshot();
    expect(snapshot.status).toBe("loaded");
    if (snapshot.status === "loaded") {
      expect(snapshot.snapshot.entries.map((entry) => entry.standing)).toEqual([
        "superseded",
        "current",
      ]);
    }
  });

  it("reconstructs current, historical, and ordering state for a new Engine instance", async () => {
    const store = new InMemoryKnowledgeStore();
    const engineA = new KnowledgeEngine(
      store,
      new Construction(["knowledge-1", "knowledge-2"]),
    );
    await engineA.initialize();
    engineA.start();
    const accepted = await engineA.evaluateKnowledgeClaim(
      acceptanceRequest("first accepted claim"),
    );
    expect(accepted.outcome).toBe("accepted");
    await engineA.stop();

    const engineB = new KnowledgeEngine(store, new Construction(["unused-1"]));
    await engineB.initialize();
    engineB.start();
    expect(engineB.listKnowledgeReferences({})).toEqual([
      expect.objectContaining({
        knowledgeIdentity: "knowledge-1",
        currency: "current",
      }),
    ]);
    expect(
      engineB.getKnowledge({ knowledgeIdentity: "knowledge-1" }),
    ).toMatchObject({
      reference: { currency: "current" },
    });
    await engineB.stop();
  });

  it("routes Engine supersession through the lifecycle Store boundary", async () => {
    const store = new InMemoryKnowledgeStore();
    const engine = new KnowledgeEngine(
      store,
      new Construction(["knowledge-1", "knowledge-2"]),
    );
    await engine.initialize();
    engine.start();
    const predecessor = await engine.evaluateKnowledgeClaim(
      acceptanceRequest("the original claim"),
    );
    if (predecessor.outcome !== "accepted") throw new Error("fixture failed");

    const successor = await engine.evaluateKnowledgeClaim({
      ...acceptanceRequest("the superseding claim"),
      contradictsKnowledgeIdentity: predecessor.record.knowledgeIdentity,
      contradictionDecision: "supersede-existing",
      contradictionReason: "The later accepted claim supersedes the original.",
    });
    expect(successor.outcome).toBe("accepted");
    expect(
      engine.getKnowledge({
        knowledgeIdentity: predecessor.record.knowledgeIdentity,
      }),
    ).toMatchObject({ reference: { currency: "superseded" } });
    expect(engine.listKnowledgeReferences({})).toEqual([
      expect.objectContaining({ knowledgeIdentity: "knowledge-2" }),
    ]);
    await engine.stop();
  });

  it("fails initialization on semantically incoherent lifecycle snapshots", async () => {
    const stored = record("knowledge-1");
    const malformed: KnowledgeLifecycleStore = {
      put: async () => ({
        status: "stored",
        knowledgeIdentity: stored.knowledgeIdentity,
      }),
      get: async () => ({ status: "found", record: stored }),
      putIndependentAcceptedKnowledge: async () => ({
        status: "invalid-state",
      }),
      supersedeCurrentKnowledge: async () => ({ status: "invalid-state" }),
      loadKnowledgeLifecycleSnapshot: async () => ({
        status: "loaded",
        snapshot: createKnowledgeLifecycleSnapshot({
          entries: [
            {
              knowledgeIdentity: stored.knowledgeIdentity,
              version: stored.version,
              standing: "superseded",
              acceptanceOrder: "opaque-order",
            },
          ],
        }),
      }),
    };
    const engine = new KnowledgeEngine(
      malformed,
      new Construction(["unused-1"]),
    );
    await expect(engine.initialize()).rejects.toBeInstanceOf(Error);
    expect(engine.engineState).toBe("failed-initialization");
    await engine.stop();
  });
});
