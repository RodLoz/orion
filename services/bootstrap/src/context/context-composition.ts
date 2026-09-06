import {
  ContextEngine,
  type ContextEngineLifecycleState,
} from "@orion/context";
import type {
  BindMemorySourceRelationshipToPreparation,
  VerifyMemorySourceAuthority,
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
import { composeIdentityCapability } from "../identity/identity-composition.js";
import { composeKnowledgeCapability } from "../knowledge/knowledge-composition.js";
import { composeMemoryCapability } from "../memory/memory-composition.js";

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
  memorySourceAuthority?: BindMemorySourceRelationshipToPreparation &
    VerifyMemorySourceAuthority,
): StructuredKnowledgeAwareContextCapabilityComposition {
  const engine = new ContextEngine(
    new DeterministicContextConstructionValues(),
    currentIdentityResolver,
    knowledgeResolver,
    undefined,
    structuredKnowledgeResolver,
    memorySourceAuthority,
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

/** REVIEW-0007 bounded in-process composition; preparation requires a caller request. */
export async function composeFixedProfileBCapability() {
  const knowledge = await composeKnowledgeCapability();
  try {
    const identity = composeIdentityCapability();
    const memory = composeMemoryCapability();
    const context = composeStructuredKnowledgeAwareContextCapability(
      identity.resolveCurrentIdentity,
      knowledge.getKnowledge,
      {
        projectStructuredKnowledge:
          knowledge.projectStructuredKnowledge.projectStructuredKnowledge.bind(
            knowledge.projectStructuredKnowledge,
          ),
        verifyStructuredKnowledgeProjectionAuthority:
          knowledge.verifyStructuredKnowledgeProjectionAuthority.verifyStructuredKnowledgeProjectionAuthority.bind(
            knowledge.verifyStructuredKnowledgeProjectionAuthority,
          ),
      },
      {
        bindMemorySourceRelationshipToPreparation:
          memory.bindMemorySourceRelationshipToPreparation.bindMemorySourceRelationshipToPreparation.bind(
            memory.bindMemorySourceRelationshipToPreparation,
          ),
        verifyMemorySourceAuthority:
          memory.verifyMemorySourceAuthority.verifyMemorySourceAuthority.bind(
            memory.verifyMemorySourceAuthority,
          ),
      },
    );
    return Object.freeze({
      retainMemory: memory.retainMemory.retainMemory.bind(memory.retainMemory),
      getMemory: memory.getMemory.getMemory.bind(memory.getMemory),
      forgetMemory: memory.forgetMemory.forgetMemory.bind(memory.forgetMemory),
      issueMemorySourceRelationship:
        memory.issueMemorySourceRelationship.issueMemorySourceRelationship.bind(
          memory.issueMemorySourceRelationship,
        ),
      evaluateKnowledgeClaim:
        knowledge.evaluateKnowledgeClaim.evaluateKnowledgeClaim.bind(
          knowledge.evaluateKnowledgeClaim,
        ),
      prepareContextRevisionWithStructuredKnowledge:
        context.prepareContextRevisionWithStructuredKnowledge.prepareContextRevisionWithStructuredKnowledge.bind(
          context.prepareContextRevisionWithStructuredKnowledge,
        ),
      getActiveContextRevision:
        context.getActiveContextRevision.getActiveContextRevision.bind(
          context.getActiveContextRevision,
        ),
      verifyActiveContextRevisionAuthority:
        context.verifyActiveContextRevisionAuthority.verifyActiveContextRevisionAuthority.bind(
          context.verifyActiveContextRevisionAuthority,
        ),
      shutdown: knowledge.shutdown,
    });
  } catch (error: unknown) {
    try {
      await knowledge.shutdown();
    } catch {
      // Preserve the originating assembly failure after attempting cleanup.
    }
    throw error;
  }
}
