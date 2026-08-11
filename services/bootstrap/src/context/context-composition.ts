import {
  ContextEngine,
  type ContextEngineLifecycleState,
} from "@orion/context";
import type {
  ComposeContextRevision,
  ComposeContextRevisionWithKnowledge,
  GetActiveContextRevision,
  GetKnowledge,
  PrepareContextRevision,
  PrepareContextRevisionWithKnowledge,
  ResolveCurrentIdentity,
  VerifyActiveContextRevisionAuthority,
} from "@orion/core";

import { DeterministicContextConstructionValues } from "./deterministic-context-construction-values.js";

export interface ContextCapabilityComposition {
  readonly composeContextRevision: ComposeContextRevision;
  readonly getActiveContextRevision: GetActiveContextRevision;
  readonly prepareContextRevision: PrepareContextRevision;
  readonly engineState: ContextEngineLifecycleState;
  readonly verifyActiveContextRevisionAuthority: VerifyActiveContextRevisionAuthority;
}

export interface KnowledgeAwareContextCapabilityComposition extends ContextCapabilityComposition {
  readonly composeContextRevisionWithKnowledge: ComposeContextRevisionWithKnowledge;
  readonly prepareContextRevisionWithKnowledge: PrepareContextRevisionWithKnowledge;
}

export function composeContextCapability(
  currentIdentityResolver: ResolveCurrentIdentity,
): ContextCapabilityComposition {
  const engine = new ContextEngine(
    new DeterministicContextConstructionValues(),
    currentIdentityResolver,
  );
  engine.initialize();
  engine.start();
  return Object.freeze({
    composeContextRevision: engine,
    getActiveContextRevision: engine,
    prepareContextRevision: engine,
    engineState: engine.engineState,
    verifyActiveContextRevisionAuthority: engine,
  });
}

export function composeKnowledgeAwareContextCapability(
  currentIdentityResolver: ResolveCurrentIdentity,
  knowledgeResolver: GetKnowledge,
): KnowledgeAwareContextCapabilityComposition {
  const engine = new ContextEngine(
    new DeterministicContextConstructionValues(),
    currentIdentityResolver,
    knowledgeResolver,
  );
  engine.initialize();
  engine.start();
  return Object.freeze({
    composeContextRevision: engine,
    composeContextRevisionWithKnowledge: engine,
    getActiveContextRevision: engine,
    prepareContextRevision: engine,
    prepareContextRevisionWithKnowledge: engine,
    engineState: engine.engineState,
    verifyActiveContextRevisionAuthority: engine,
  });
}
