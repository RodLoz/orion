import type {
  EvaluateKnowledgeClaim,
  GetKnowledge,
  ListKnowledgeReferences,
} from "@orion/core";
import {
  KnowledgeEngine,
  type KnowledgeEngineLifecycleState,
} from "@orion/knowledge";

import { DeterministicKnowledgeConstructionValues } from "./deterministic-knowledge-construction-values.js";
import { InMemoryKnowledgeStore } from "./in-memory-knowledge-store.js";

export interface KnowledgeCapabilityComposition {
  readonly evaluateKnowledgeClaim: EvaluateKnowledgeClaim;
  readonly getKnowledge: GetKnowledge;
  readonly listKnowledgeReferences: ListKnowledgeReferences;
  readonly engineState: KnowledgeEngineLifecycleState;
}

export function composeKnowledgeCapability(): KnowledgeCapabilityComposition {
  const store = new InMemoryKnowledgeStore();
  const engine = new KnowledgeEngine(
    store,
    new DeterministicKnowledgeConstructionValues(),
  );
  engine.initialize();
  engine.start();
  return Object.freeze({
    evaluateKnowledgeClaim: engine,
    getKnowledge: engine,
    listKnowledgeReferences: engine,
    engineState: engine.engineState,
  });
}
