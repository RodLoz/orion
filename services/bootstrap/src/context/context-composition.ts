import {
  ContextEngine,
  type ContextEngineLifecycleState,
} from "@orion/context";
import type {
  ComposeContextRevision,
  GetActiveContextRevision,
  PrepareContextRevision,
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
