import {
  contextLineageIdentity,
  type BrainConfiguration,
  type IdentityResolutionRequest,
  type ObserveBrainOrchestrationLifecycle,
  type OrchestrateCognitiveRequest,
} from "@orion/core";
import { BrainEngine } from "@orion/brain";

import { BootstrapConfigurationError } from "../configuration.js";
import { composeContextCapability } from "../context/context-composition.js";
import { composeIdentityCapability } from "../identity/identity-composition.js";
import { composePlanningCapability } from "../planning/planning-composition.js";
import { composeReasoningCapability } from "../reasoning/reasoning-composition.js";
import { composeSecurityCapability } from "../security/security-composition.js";
import { composeConfiguredM9SkillCapability } from "../skill/skill-composition.js";
import { createProcessLocalBrainOperationAllocator } from "./process-local-brain-operation-allocator.js";

export interface BrainCapabilityComposition {
  readonly orchestrateCognitiveRequest: OrchestrateCognitiveRequest["orchestrateCognitiveRequest"];
}

export function composeBrainCapability(preparation: {
  readonly contextLineageId: string;
  readonly identityResolutionRequest: IdentityResolutionRequest;
  readonly lifecycleObserver?: ObserveBrainOrchestrationLifecycle;
}): BrainCapabilityComposition {
  const captured = capturePreparation(preparation);
  const expectedLineageIdentity = contextLineageIdentity(
    captured.contextLineageId,
  );
  const identity = composeIdentityCapability();
  const context = composeContextCapability(identity.resolveCurrentIdentity);
  const activeContextRevision =
    context.prepareContextRevision.prepareContextRevision({
      target: { kind: "new-lineage" },
      identityResolutionRequest: captured.identityResolutionRequest,
    });
  if (activeContextRevision.lineageIdentity !== expectedLineageIdentity)
    throw new BootstrapConfigurationError(
      "Initial Context lineage does not match Bootstrap preparation.",
    );

  const getActiveContextRevision =
    context.getActiveContextRevision.getActiveContextRevision.bind(
      context.getActiveContextRevision,
    );
  const verifyActiveContextRevisionAuthority =
    context.verifyActiveContextRevisionAuthority.verifyActiveContextRevisionAuthority.bind(
      context.verifyActiveContextRevisionAuthority,
    );
  const contextAuthority = Object.freeze({
    getActiveContextRevision,
    verifyActiveContextRevisionAuthority,
  });
  const reasoning = composeReasoningCapability();
  const planning = composePlanningCapability();
  const security = composeSecurityCapability(
    activeContextRevision.fragments[0].projection.state === "authenticated"
      ? Object.freeze({
          kind: "authenticated" as const,
          identityId:
            activeContextRevision.fragments[0].projection.identityIdentifier,
        })
      : Object.freeze({ kind: "anonymous" as const }),
  );
  const skill = composeConfiguredM9SkillCapability(
    (candidate) =>
      verifyContextAuthority(candidate, verifyActiveContextRevisionAuthority),
    security.authorizationEvaluation,
  );
  const operationAllocator = createProcessLocalBrainOperationAllocator();
  const configuration = Object.freeze({
    context: contextAuthority,
    reasoning: Object.freeze({
      evaluateReasoning: reasoning.evaluateReasoning.evaluateReasoning,
      verifyReasoningOutcomeAuthority:
        reasoning.verifyReasoningOutcomeAuthority
          .verifyReasoningOutcomeAuthority,
    }),
    planning: Object.freeze({
      createCandidatePlan: planning.createCandidatePlan.createCandidatePlan,
      verifyCandidatePlanAuthority:
        planning.verifyCandidatePlanAuthority.verifyCandidatePlanAuthority,
    }),
    selectSkill: skill.selectSkill,
    operationAllocator,
    bindSkillToOperation: skill.bindSkillToOperation,
    resolveSkillExecutionContext: skill.resolveSkillExecutionContext,
    resolveSkillInvocationRequirements:
      skill.resolveSkillInvocationRequirements,
    resolveGovernedAuthorizationEvaluation:
      skill.resolveGovernedAuthorizationEvaluation,
    protectedInvokeSkill: skill.protectedInvokeSkill,
    verifyNormalizedSkillExecutionResult:
      skill.verifyNormalizedSkillExecutionResult,
    ...(captured.lifecycleObserver === undefined
      ? {}
      : { lifecycleObserver: captured.lifecycleObserver }),
  }) satisfies BrainConfiguration;
  const engine = new BrainEngine(configuration);
  engine.initialize();
  engine.start();

  return Object.freeze({
    orchestrateCognitiveRequest:
      engine.orchestrateCognitiveRequest.bind(engine),
  });
}

function capturePreparation(preparation: {
  readonly contextLineageId: string;
  readonly identityResolutionRequest: IdentityResolutionRequest;
  readonly lifecycleObserver?: ObserveBrainOrchestrationLifecycle;
}): {
  readonly contextLineageId: string;
  readonly identityResolutionRequest: IdentityResolutionRequest;
  readonly lifecycleObserver?: ObserveBrainOrchestrationLifecycle;
} {
  const contextLineageId = ownDataValue(preparation, "contextLineageId");
  const identityResolutionRequest = ownDataValue(
    preparation,
    "identityResolutionRequest",
  );
  const observerDescriptor = Reflect.getOwnPropertyDescriptor(
    preparation,
    "lifecycleObserver",
  );
  if (
    observerDescriptor !== undefined &&
    (!("value" in observerDescriptor) ||
      observerDescriptor.enumerable !== true ||
      (observerDescriptor.value !== undefined &&
        typeof observerDescriptor.value !== "function"))
  )
    throw new BootstrapConfigurationError(
      "Brain lifecycle observer preparation is invalid.",
    );
  return Object.freeze({
    contextLineageId: contextLineageId as string,
    identityResolutionRequest:
      identityResolutionRequest as IdentityResolutionRequest,
    ...(observerDescriptor?.value === undefined
      ? {}
      : {
          lifecycleObserver:
            observerDescriptor.value as ObserveBrainOrchestrationLifecycle,
        }),
  });
}

function ownDataValue(value: unknown, field: string): unknown {
  if (typeof value !== "object" || value === null)
    throw new BootstrapConfigurationError(
      "Brain composition preparation is invalid.",
    );
  const descriptor = Reflect.getOwnPropertyDescriptor(value, field);
  if (
    descriptor === undefined ||
    descriptor.enumerable !== true ||
    !("value" in descriptor) ||
    descriptor.value === undefined
  )
    throw new BootstrapConfigurationError(
      "Brain composition preparation is invalid.",
    );
  return descriptor.value;
}

function verifyContextAuthority(
  candidate: unknown,
  verify: BrainConfiguration["context"]["verifyActiveContextRevisionAuthority"],
): boolean {
  try {
    if (typeof candidate !== "object" || candidate === null) return false;
    const lineageIdentity = ownCandidateValue(candidate, "lineageIdentity");
    const revisionIdentity = ownCandidateValue(candidate, "revisionIdentity");
    const revisionNumber = ownCandidateValue(candidate, "revisionNumber");
    return (
      verify({
        intent: "verify-active-context-revision-authority",
        candidate: candidate as never,
        expectedLineageIdentity: lineageIdentity as never,
        expectedRevisionIdentity: revisionIdentity as never,
        expectedRevisionNumber: revisionNumber as never,
      }) === candidate
    );
  } catch {
    return false;
  }
}

function ownCandidateValue(value: object, field: string): unknown {
  const descriptor = Reflect.getOwnPropertyDescriptor(value, field);
  if (descriptor === undefined || !("value" in descriptor)) throw new Error();
  return descriptor.value;
}
