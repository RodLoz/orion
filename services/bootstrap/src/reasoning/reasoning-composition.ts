import type { EvaluateReasoning } from "@orion/core";
import {
  ReasoningEngine,
  type ReasoningEngineLifecycleState,
} from "@orion/reasoning";

export interface ReasoningCapabilityComposition {
  readonly evaluateReasoning: EvaluateReasoning;
  readonly engineState: () => ReasoningEngineLifecycleState;
}

export function composeReasoningCapability(): ReasoningCapabilityComposition {
  const engine = new ReasoningEngine();
  engine.initialize();
  engine.start();
  return Object.freeze({
    evaluateReasoning: engine,
    engineState: () => engine.engineState,
  });
}
