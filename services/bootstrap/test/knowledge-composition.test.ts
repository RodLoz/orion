import { describe, expect, it } from "vitest";
import { candidatePreparationAssociation } from "@orion/core";
import type { Pool } from "pg";
import type { KnowledgeEngine } from "@orion/knowledge";

import {
  composeKnowledgeCapability,
  loadBootstrapConfiguration,
  type KnowledgeCapabilityComposition,
} from "../src/index.js";

function fakePool(options: {
  readonly queryFailure?: Error;
  readonly endCalls: { count: number };
  readonly onEnd?: () => void;
}): Pool {
  return {
    async connect() {
      if (options.queryFailure !== undefined) throw options.queryFailure;
      return {
        async query() {
          return { rows: [], rowCount: 0 };
        },
        release() {},
      };
    },
    async end() {
      options.endCalls.count += 1;
      options.onEnd?.();
    },
  } as unknown as Pool;
}

function controlledEngine(options: {
  readonly stopFailure?: Error;
  readonly events: string[];
}): KnowledgeEngine {
  let state: "ready" | "stopped" = "ready";
  return {
    get engineState() {
      return state;
    },
    async initialize() {
      options.events.push("initialize");
    },
    async stop() {
      options.events.push("knowledge-stop");
      if (options.stopFailure !== undefined) throw options.stopFailure;
      state = "stopped";
    },
    evaluateKnowledgeClaim() {
      throw new Error("not used");
    },
    getKnowledge() {
      throw new Error("not used");
    },
    listKnowledgeReferences() {
      return [];
    },
  } as unknown as KnowledgeEngine;
}

describe("Bootstrap Knowledge composition", () => {
  it("accepts structured propositions with deterministic identities and exposes authoritative projection", async () => {
    const knowledge = await composeKnowledgeCapability();
    try {
      expect(knowledge.engineState).toBe("ready");
      for (const [index, textualScalar] of [
        "Dark Theme",
        "Light Theme",
      ].entries()) {
        const semanticValue = {
          subjectKey: `preference.${index}`,
          predicateKey: "theme",
          textualScalar,
        };
        const accepted =
          await knowledge.evaluateKnowledgeClaim.evaluateKnowledgeClaim({
            intent: "evaluate",
            claim: `The reviewed theme is ${textualScalar}.`,
            structuredProposition: semanticValue,
            samePropositionDeclaration: "same-proposition",
            sourceOwnershipProposal: {
              currentnessOwner: "knowledge-owned-currentness",
            },
            acceptanceEvidence: {
              method: "explicit-authority-review",
              authorityIdentifier: "orion.bootstrap.knowledge.test",
              decision: "accept",
              reason: "The complete structured proposition was reviewed.",
            },
            provenance: {
              sourceType: "approved-internal-source",
              originatingCapability: "bootstrap-knowledge-test",
              observedAt: "2026-09-01T00:00:00.000Z",
            },
          });
        expect(accepted.outcome).toBe("accepted");
        if (accepted.outcome !== "accepted")
          throw new Error("Structured acceptance failed.");
        expect(
          accepted.record.acceptedStructuredProposition?.propositionIdentity,
        ).toBe(`orion.proposition.${index + 1}`);
        const projection =
          knowledge.projectStructuredKnowledge.projectStructuredKnowledge({
            intent: "project-structured-knowledge",
            target: {
              knowledgeIdentity: accepted.record.knowledgeIdentity,
              expectedKnowledgeVersion: accepted.record.version,
            },
            preparationPrerequisites: {
              candidatePreparationAssociation: candidatePreparationAssociation(
                `bootstrap.preparation.${index + 1}`,
              ),
              currentnessOwner: "knowledge-owned-currentness",
            },
          });
        expect(projection.semanticValue).toEqual(semanticValue);
        expect(projection.correspondence.propositionIdentity).toBe(
          accepted.record.acceptedStructuredProposition?.propositionIdentity,
        );
        expect(
          knowledge.verifyStructuredKnowledgeProjectionAuthority.verifyStructuredKnowledgeProjectionAuthority(
            {
              intent: "verify-knowledge-projection-authority",
              candidate: projection,
            },
          ),
        ).toBe(projection);
      }
    } finally {
      await knowledge.shutdown();
    }
    expect(knowledge.engineState).toBe("stopped");
  });

  it("awaits READY before exposing synchronous capabilities", async () => {
    const composition = composeKnowledgeCapability();
    expect(composition).toBeInstanceOf(Promise);

    const knowledge = await composition;
    expect(knowledge.engineState).toBe("ready");
    expect(
      knowledge.listKnowledgeReferences.listKnowledgeReferences({}),
    ).toEqual([]);
    await knowledge.shutdown();
  });

  it("delegates repeated teardown to Engine single-flight and idempotence", async () => {
    const knowledge = await composeKnowledgeCapability();
    const first = knowledge.shutdown();
    const second = knowledge.shutdown();
    expect(second).toBe(first);
    await first;
    expect(knowledge.engineState).toBe("stopped");
    await expect(knowledge.shutdown()).resolves.toBeUndefined();
  });

  it("constructs PostgreSQL composition only for explicit PostgreSQL mode and owns Pool shutdown", async () => {
    const endCalls = { count: 0 };
    const compositionHolder: {
      composition?: KnowledgeCapabilityComposition;
    } = {};
    let receivedConnectionString = "";
    const knowledge = await composeKnowledgeCapability(
      loadBootstrapConfiguration({
        ORION_KNOWLEDGE_STORE_MODE: "postgresql",
        ORION_POSTGRES_CONNECTION_STRING:
          "postgresql://runtime:secret@example.test/orion",
      }),
      {
        poolFactory(config) {
          receivedConnectionString = config.connectionString as string;
          return fakePool({
            endCalls,
            onEnd() {
              expect(compositionHolder.composition?.engineState).toBe(
                "stopped",
              );
            },
          });
        },
      },
    );
    compositionHolder.composition = knowledge;
    expect(receivedConnectionString).toBe(
      "postgresql://runtime:secret@example.test/orion",
    );
    expect(knowledge.engineState).toBe("ready");
    await knowledge.shutdown();
    await knowledge.shutdown();
    expect(endCalls.count).toBe(1);
  });

  it("closes a constructed Pool when Knowledge initialization fails", async () => {
    const endCalls = { count: 0 };
    await expect(
      composeKnowledgeCapability(
        loadBootstrapConfiguration({
          ORION_KNOWLEDGE_STORE_MODE: "postgresql",
          ORION_POSTGRES_CONNECTION_STRING:
            "postgresql://runtime:secret@example.test/orion",
        }),
        {
          poolFactory() {
            return fakePool({
              endCalls,
              queryFailure: new Error("controlled unavailable database"),
            });
          },
        },
      ),
    ).rejects.toBeInstanceOf(Error);
    expect(endCalls.count).toBe(1);
  });

  it("preserves Knowledge shutdown failure while cleaning the Pool", async () => {
    const knowledgeError = new Error("controlled Knowledge shutdown failure");
    const events: string[] = [];
    const endCalls = { count: 0 };
    const composition = await composeKnowledgeCapability(
      loadBootstrapConfiguration({
        ORION_KNOWLEDGE_STORE_MODE: "postgresql",
        ORION_POSTGRES_CONNECTION_STRING:
          "postgresql://runtime:secret@example.test/orion",
      }),
      {
        poolFactory() {
          return fakePool({
            endCalls,
            onEnd() {
              events.push("pool-end");
            },
          });
        },
        engineFactory: (...args) => {
          void args;
          return controlledEngine({ stopFailure: knowledgeError, events });
        },
      },
    );
    const first = composition.shutdown();
    const second = composition.shutdown();
    expect(second).toBe(first);
    await expect(first).rejects.toBe(knowledgeError);
    await expect(composition.shutdown()).rejects.toBe(knowledgeError);
    expect(events).toEqual(["initialize", "knowledge-stop", "pool-end"]);
    expect(endCalls.count).toBe(1);
  });

  it("propagates Pool cleanup failure after successful Knowledge shutdown", async () => {
    const poolError = new Error("controlled Pool cleanup failure");
    const events: string[] = [];
    let stopCalls = 0;
    let endCalls = 0;
    const composition = await composeKnowledgeCapability(
      loadBootstrapConfiguration({
        ORION_KNOWLEDGE_STORE_MODE: "postgresql",
        ORION_POSTGRES_CONNECTION_STRING:
          "postgresql://runtime:secret@example.test/orion",
      }),
      {
        poolFactory() {
          return {
            ...fakePool({ endCalls: { count: 0 } }),
            async end() {
              endCalls += 1;
              events.push("pool-end");
              throw poolError;
            },
          } as unknown as Pool;
        },
        engineFactory: (...args) => {
          void args;
          const engine = controlledEngine({ events });
          const originalStop = engine.stop.bind(engine);
          engine.stop = async () => {
            stopCalls += 1;
            return originalStop();
          };
          return engine;
        },
      },
    );
    const first = composition.shutdown();
    const second = composition.shutdown();
    expect(second).toBe(first);
    await expect(first).rejects.toBe(poolError);
    await expect(composition.shutdown()).rejects.toBe(poolError);
    expect(stopCalls).toBe(1);
    expect(endCalls).toBe(1);
    expect(events).toEqual(["initialize", "knowledge-stop", "pool-end"]);
  });

  it("gives Knowledge shutdown failure precedence over Pool cleanup failure", async () => {
    const knowledgeError = new Error("controlled Knowledge failure");
    const poolError = new Error("controlled Pool failure");
    const events: string[] = [];
    let endCalls = 0;
    const composition = await composeKnowledgeCapability(
      loadBootstrapConfiguration({
        ORION_KNOWLEDGE_STORE_MODE: "postgresql",
        ORION_POSTGRES_CONNECTION_STRING:
          "postgresql://runtime:secret@example.test/orion",
      }),
      {
        poolFactory() {
          return {
            ...fakePool({ endCalls: { count: 0 } }),
            async end() {
              endCalls += 1;
              events.push("pool-end");
              throw poolError;
            },
          } as unknown as Pool;
        },
        engineFactory: (...args) => {
          void args;
          return controlledEngine({ stopFailure: knowledgeError, events });
        },
      },
    );
    await expect(composition.shutdown()).rejects.toBe(knowledgeError);
    await expect(composition.shutdown()).rejects.toBe(knowledgeError);
    expect(endCalls).toBe(1);
    expect(events).toEqual(["initialize", "knowledge-stop", "pool-end"]);
  });
});
