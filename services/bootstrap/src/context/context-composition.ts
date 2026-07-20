import {
  ContextEngine,
  type ContextEngineLifecycleState,
} from "@orion/context";
import type {
  ComposeContextRevision,
  GetActiveContextRevision,
} from "@orion/core";

import { DeterministicContextConstructionValues } from "./deterministic-context-construction-values.js";

export interface ContextCapabilityComposition {
  readonly composeContextRevision: ComposeContextRevision;
  readonly getActiveContextRevision: GetActiveContextRevision;
  readonly engineState: ContextEngineLifecycleState;
}

export function composeContextCapability(): ContextCapabilityComposition {
  const engine = new ContextEngine(
    new DeterministicContextConstructionValues(),
  );
  engine.initialize();
  engine.start();
  return Object.freeze({
    composeContextRevision: engine,
    getActiveContextRevision: engine,
    engineState: engine.engineState,
  });
}
