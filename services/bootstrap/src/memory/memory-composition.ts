import type {
  BindMemorySourceRelationshipToPreparation,
  IssueMemorySourceRelationship,
  VerifyMemorySourceAuthority,
  ForgetMemory,
  GetMemory,
  ListRetainedMemoryReferences,
  MemoryTimestamp,
  RetainMemory,
} from "@orion/core";
import { MemoryEngine, type MemoryEngineLifecycleState } from "@orion/memory";

import { DeterministicMemoryConstructionValues } from "./deterministic-memory-construction-values.js";
import { InMemoryMemoryStore } from "./in-memory-memory-store.js";

export interface MemoryCapabilityComposition {
  readonly issueMemorySourceRelationship: IssueMemorySourceRelationship;
  readonly bindMemorySourceRelationshipToPreparation: BindMemorySourceRelationshipToPreparation;
  readonly verifyMemorySourceAuthority: VerifyMemorySourceAuthority;
  readonly retainMemory: RetainMemory;
  readonly getMemory: GetMemory;
  readonly listRetainedMemoryReferences: ListRetainedMemoryReferences;
  readonly forgetMemory: ForgetMemory;
  readonly lastUsedInspection: {
    lastUsedAt(memoryIdentity: unknown): MemoryTimestamp | undefined;
  };
  readonly engineState: MemoryEngineLifecycleState;
}

export function composeMemoryCapability(): MemoryCapabilityComposition {
  const store = new InMemoryMemoryStore();
  const engine = new MemoryEngine(
    store,
    new DeterministicMemoryConstructionValues(),
  );
  engine.initialize();
  engine.start();
  return Object.freeze({
    issueMemorySourceRelationship: engine,
    bindMemorySourceRelationshipToPreparation: engine,
    verifyMemorySourceAuthority: engine,
    retainMemory: engine,
    getMemory: engine,
    listRetainedMemoryReferences: engine,
    forgetMemory: engine,
    lastUsedInspection: engine,
    engineState: engine.engineState,
  });
}
