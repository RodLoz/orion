import type {
  EvaluateKnowledgeClaim,
  GetKnowledge,
  ListKnowledgeReferences,
} from "@orion/core";
import {
  KnowledgeEngine,
  type KnowledgeEngineLifecycleState,
} from "@orion/knowledge";
import { Pool, type PoolConfig } from "pg";

import type { BootstrapConfiguration } from "../configuration.js";
import { DeterministicKnowledgeConstructionValues } from "./deterministic-knowledge-construction-values.js";
import { InMemoryKnowledgeStore } from "./in-memory-knowledge-store.js";
import { PostgreSQLKnowledgeStore } from "./postgresql-knowledge-store.js";

export interface KnowledgeCapabilityComposition {
  readonly evaluateKnowledgeClaim: EvaluateKnowledgeClaim;
  readonly getKnowledge: GetKnowledge;
  readonly listKnowledgeReferences: ListKnowledgeReferences;
  readonly engineState: KnowledgeEngineLifecycleState;
  shutdown(): Promise<void>;
}

export type KnowledgePoolFactory = (config: PoolConfig) => Pool;
type KnowledgeEngineFactory = (
  store: InMemoryKnowledgeStore | PostgreSQLKnowledgeStore,
  construction: DeterministicKnowledgeConstructionValues,
) => KnowledgeEngine;

export interface KnowledgeCompositionOptions {
  readonly poolFactory?: KnowledgePoolFactory;
  /** Controlled lifecycle seam for composition-level failure-path tests. */
  readonly engineFactory?: KnowledgeEngineFactory;
}

export async function composeKnowledgeCapability(
  configuration: BootstrapConfiguration = {
    runtimeName: "orion-m0",
    logLevel: "info",
    correlationId: "orion-m0-diagnostic",
    knowledgeStoreMode: "in-memory",
  },
  options: KnowledgeCompositionOptions = {},
): Promise<KnowledgeCapabilityComposition> {
  let pool: Pool | undefined;
  let poolClosed = false;
  const endPool = async (): Promise<void> => {
    if (pool !== undefined && !poolClosed) {
      poolClosed = true;
      await pool.end();
    }
  };
  try {
    const store =
      configuration.knowledgeStoreMode === "postgresql"
        ? (() => {
            const connectionString = configuration.postgresqlConnectionString;
            if (connectionString === undefined) {
              throw new Error("PostgreSQL configuration is incomplete.");
            }
            pool = (options.poolFactory ?? ((config) => new Pool(config)))({
              connectionString,
            });
            return new PostgreSQLKnowledgeStore(pool);
          })()
        : new InMemoryKnowledgeStore();
    const construction = new DeterministicKnowledgeConstructionValues();
    const engine = (
      options.engineFactory ??
      ((selectedStore, values) => new KnowledgeEngine(selectedStore, values))
    )(store, construction);
    let shutdown: Promise<void> | undefined;
    const closeResources = async (): Promise<void> => {
      let failure: unknown;
      try {
        await engine.stop();
      } catch (error: unknown) {
        failure = error;
      }
      if (pool !== undefined) {
        try {
          await endPool();
        } catch (error: unknown) {
          if (failure === undefined) failure = error;
        }
      }
      if (failure !== undefined) throw failure;
    };
    try {
      await engine.initialize();
    } catch (error: unknown) {
      try {
        await engine.stop();
      } catch {
        // Preserve the authoritative initialization failure.
      } finally {
        try {
          await endPool();
        } catch {
          // Startup remains failed; resource cleanup cannot turn it into success.
        }
      }
      throw error;
    }
    return Object.freeze({
      evaluateKnowledgeClaim: engine,
      getKnowledge: engine,
      listKnowledgeReferences: engine,
      get engineState() {
        return engine.engineState;
      },
      shutdown: () => {
        shutdown ??= closeResources();
        return shutdown;
      },
    });
  } catch (error: unknown) {
    await endPool();
    throw error;
  }
}
