import type {
  EvaluateReasoning,
  VerifyReasoningOutcomeAuthority,
} from "@orion/core";
import {
  ReasoningEngine,
  type ReasoningEngineLifecycleState,
} from "@orion/reasoning";

export interface ReasoningCapabilityComposition {
  readonly evaluateReasoning: EvaluateReasoning;
  readonly verifyReasoningOutcomeAuthority: VerifyReasoningOutcomeAuthority;
  readonly engineState: () => ReasoningEngineLifecycleState;
}

export function composeReasoningCapability(): ReasoningCapabilityComposition {
  const engine = new ReasoningEngine();
  engine.initialize();
  engine.start();
  const evaluateReasoning = engine.evaluateReasoning.bind(engine);
  const verifyReasoningOutcomeAuthority =
    engine.verifyReasoningOutcomeAuthority.bind(engine);
  return Object.freeze({
    evaluateReasoning: Object.freeze({
      evaluateReasoning,
    }),
    verifyReasoningOutcomeAuthority: Object.freeze({
      verifyReasoningOutcomeAuthority,
    }),
    engineState: () => engine.engineState,
  });
}
