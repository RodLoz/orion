import type {
  EvaluateReasoning,
  ReasoningOutcome,
  VerifyActiveContextRevisionAuthority,
  VerifyReasoningOutcomeAuthority,
} from "@orion/core";
import {
  ReasoningEngine,
  type ReasoningEngineLifecycleState,
} from "@orion/reasoning";

export interface ReasoningCapabilityComposition {
  readonly evaluateReasoning: EvaluateReasoning;
  readonly evaluateReasoning3: {
    evaluateReasoning3(request: unknown): ReasoningOutcome;
  };
  readonly verifyReasoningOutcomeAuthority: VerifyReasoningOutcomeAuthority;
  readonly engineState: () => ReasoningEngineLifecycleState;
}

export function composeReasoningCapability(
  contextAuthority?: VerifyActiveContextRevisionAuthority,
): ReasoningCapabilityComposition {
  const engine = new ReasoningEngine(contextAuthority);
  engine.initialize();
  engine.start();
  const evaluateReasoning = engine.evaluateReasoning.bind(engine);
  const evaluateReasoning3 = engine.evaluateReasoning3.bind(engine);
  const verifyReasoningOutcomeAuthority =
    engine.verifyReasoningOutcomeAuthority.bind(engine);
  return Object.freeze({
    evaluateReasoning: Object.freeze({
      evaluateReasoning,
    }),
    evaluateReasoning3: Object.freeze({ evaluateReasoning3 }),
    verifyReasoningOutcomeAuthority: Object.freeze({
      verifyReasoningOutcomeAuthority,
    }),
    engineState: () => engine.engineState,
  });
}
