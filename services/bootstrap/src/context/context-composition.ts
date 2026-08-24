import {
  ContextEngine,
  type ContextEngineLifecycleState,
} from "@orion/context";
import type {
  ComposeContextRevision,
  ComposeContextRevisionWithKnowledge,
  ComposeContextRevisionWithMemory,
  ComposeContextRevisionWithStructuredKnowledge,
  GetActiveContextRevision,
  GetKnowledge,
  GetMemory,
  ProjectStructuredKnowledge,
  PrepareContextRevision,
  PrepareContextRevisionWithKnowledge,
  PrepareContextRevisionWithMemory,
  PrepareContextRevisionWithStructuredKnowledge,
  ResolveCurrentIdentity,
  VerifyActiveContextRevisionAuthority,
  VerifyStructuredKnowledgeProjectionAuthority,
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

export interface StructuredKnowledgeAwareContextCapabilityComposition extends KnowledgeAwareContextCapabilityComposition {
  readonly composeContextRevisionWithStructuredKnowledge: ComposeContextRevisionWithStructuredKnowledge;
  readonly prepareContextRevisionWithStructuredKnowledge: PrepareContextRevisionWithStructuredKnowledge;
}

export interface MemoryAwareContextCapabilityComposition extends ContextCapabilityComposition {
  readonly composeContextRevisionWithMemory: ComposeContextRevisionWithMemory;
  readonly prepareContextRevisionWithMemory: PrepareContextRevisionWithMemory;
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

export function composeStructuredKnowledgeAwareContextCapability(
  currentIdentityResolver: ResolveCurrentIdentity,
  knowledgeResolver: GetKnowledge,
  structuredKnowledgeResolver: ProjectStructuredKnowledge &
    VerifyStructuredKnowledgeProjectionAuthority,
): StructuredKnowledgeAwareContextCapabilityComposition {
  const engine = new ContextEngine(
    new DeterministicContextConstructionValues(),
    currentIdentityResolver,
    knowledgeResolver,
    undefined,
    structuredKnowledgeResolver,
  );
  engine.initialize();
  engine.start();
  return Object.freeze({
    composeContextRevision: engine,
    composeContextRevisionWithKnowledge: engine,
    composeContextRevisionWithStructuredKnowledge: engine,
    getActiveContextRevision: engine,
    prepareContextRevision: engine,
    prepareContextRevisionWithKnowledge: engine,
    prepareContextRevisionWithStructuredKnowledge: engine,
    engineState: engine.engineState,
    verifyActiveContextRevisionAuthority: engine,
  });
}

export function composeMemoryAwareContextCapability(
  currentIdentityResolver: ResolveCurrentIdentity,
  memoryResolver: GetMemory,
): MemoryAwareContextCapabilityComposition {
  const engine = new ContextEngine(
    new DeterministicContextConstructionValues(),
    currentIdentityResolver,
    undefined,
    memoryResolver,
  );
  engine.initialize();
  engine.start();
  return Object.freeze({
    composeContextRevision: engine,
    composeContextRevisionWithMemory: engine,
    getActiveContextRevision: engine,
    prepareContextRevision: engine,
    prepareContextRevisionWithMemory: engine,
    engineState: engine.engineState,
    verifyActiveContextRevisionAuthority: engine,
  });
}
