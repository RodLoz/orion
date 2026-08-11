import {
  authorizationActionIdentifier,
  authorizationOperationIdentifier,
  authorizationResourceIdentifier,
  BrainAuthorizationResolutionError,
  BrainContextResolutionError,
  BrainPlanningResolutionError,
  BrainProtectedInvocationError,
  BrainReasoningResolutionError,
  BrainSkillCoordinationError,
  brainDiagnosticCorrelationIdentifier,
  createAuthorizationEvaluationOutcome,
  createBrainOrchestrationLifecycleEvent,
  createCandidatePlan,
  createFinalCognitiveResult,
  createNormalizedCognitiveRequest,
  createReasoningOutcome,
  createRegisteredSkill,
  contextCreatedAt,
  contextLineageIdentity,
  contextRevisionIdentity,
  contextRevisionNumber,
  identityIdentifier,
  InvalidBrainAuthorityError,
  InvalidBrainExecutionStateError,
  InvalidBrainPlanError,
  InvalidFinalCognitiveResultError,
  skillCapabilityIdentifier,
  skillFailureModeIdentifier,
  skillIdentifier,
  skillInterfaceFieldIdentifier,
  skillPermissionIdentifier,
  skillVersion,
  type AuthorizationEvaluationOutcome,
  type AuthorizationOperationIdentifier,
  type ActiveContextRevision,
  type BoundSkillInvocationTarget,
  type BrainConfiguration,
  type BrainDiagnosticCorrelationIdentifier,
  type BrainOrchestrationLifecycleState,
  type BrainOrchestrationTransitionCategory,
  type CandidatePlan,
  type FinalCognitiveResult,
  type NormalizedCognitiveRequest,
  type NormalizedSkillExecutionResult,
  type ObserveBrainOrchestrationLifecycle,
  type ReasoningOutcome,
  type SkillBinding,
  type SkillExecutionContextProjection,
  type SkillInvocationRequirementsProjection,
  type SkillSelectionResult,
  type VerifyFinalCognitiveResultRequest,
} from "@orion/core";
import { FinalResultAuthority } from "./final-result-authority.js";

type EngineState = "created" | "initialized" | "running" | "stopped";

interface CapturedConfiguration {
  readonly getContext: BrainConfiguration["context"]["getActiveContextRevision"];
  readonly verifyContext: BrainConfiguration["context"]["verifyActiveContextRevisionAuthority"];
  readonly evaluateReasoning: BrainConfiguration["reasoning"]["evaluateReasoning"];
  readonly verifyReasoning: BrainConfiguration["reasoning"]["verifyReasoningOutcomeAuthority"];
  readonly createPlan: BrainConfiguration["planning"]["createCandidatePlan"];
  readonly verifyPlan: BrainConfiguration["planning"]["verifyCandidatePlanAuthority"];
  readonly selectSkill: BrainConfiguration["selectSkill"]["selectSkill"];
  readonly allocateOperation: BrainConfiguration["operationAllocator"]["allocateAuthorizationOperationIdentifier"];
  readonly bindSkill: BrainConfiguration["bindSkillToOperation"]["bindSkillToOperation"];
  readonly resolveContext: BrainConfiguration["resolveSkillExecutionContext"]["resolveSkillExecutionContext"];
  readonly resolveRequirements: BrainConfiguration["resolveSkillInvocationRequirements"]["resolveSkillInvocationRequirements"];
  readonly resolveAuthorization: BrainConfiguration["resolveGovernedAuthorizationEvaluation"]["resolveGovernedAuthorizationEvaluation"];
  readonly invokeSkill: BrainConfiguration["protectedInvokeSkill"]["invokeBoundSkill"];
  readonly verifySkillResult: BrainConfiguration["verifyNormalizedSkillExecutionResult"]["verify"];
  readonly observer?: ObserveBrainOrchestrationLifecycle;
}

interface OperationLifecycle {
  state: "none" | BrainOrchestrationLifecycleState;
  sequence: number;
  diagnosticId: BrainDiagnosticCorrelationIdentifier;
}

const CONFIGURATION_FIELDS = [
  "context",
  "reasoning",
  "planning",
  "selectSkill",
  "operationAllocator",
  "bindSkillToOperation",
  "resolveSkillExecutionContext",
  "resolveSkillInvocationRequirements",
  "resolveGovernedAuthorizationEvaluation",
  "protectedInvokeSkill",
  "verifyNormalizedSkillExecutionResult",
] as const;

export class BrainEngine {
  readonly #configuration: CapturedConfiguration;
  readonly #authority = new FinalResultAuthority();
  readonly #allocatedOperations = new Set<AuthorizationOperationIdentifier>();
  #state: EngineState = "created";
  #diagnosticSequence = 0;
  #orchestrating = false;

  public constructor(configuration: BrainConfiguration) {
    this.#configuration = captureConfiguration(configuration);
  }

  public initialize(): void {
    if (this.#state !== "created") throw new InvalidBrainExecutionStateError();
    this.#state = "initialized";
  }

  public start(): void {
    if (this.#state !== "initialized")
      throw new InvalidBrainExecutionStateError();
    this.#state = "running";
  }

  public stop(): void {
    if (this.#state !== "running" || this.#orchestrating)
      throw new InvalidBrainExecutionStateError();
    this.#state = "stopped";
  }

  public orchestrateCognitiveRequest(
    request: NormalizedCognitiveRequest,
  ): FinalCognitiveResult {
    if (this.#state !== "running" || this.#orchestrating)
      throw new InvalidBrainExecutionStateError();
    const normalized = createNormalizedCognitiveRequest(request);
    const diagnosticId = this.#nextDiagnosticIdentifier();
    const lifecycle: OperationLifecycle = {
      state: "none",
      sequence: 0,
      diagnosticId,
    };
    this.#orchestrating = true;
    try {
      this.#transition(lifecycle, "proposed", "orchestration-proposed");
      const context = this.#context(normalized, lifecycle);
      const reasoning = this.#reasoning(normalized, context, lifecycle);
      const plan = this.#planning(reasoning, lifecycle);
      if (plan.category === "request-more-context")
        return this.#completeNoSkill(
          createFinalCognitiveResult({
            status: "completed",
            kind: "request-more-context",
            requestId: normalized.requestId,
            reason: "planning-requested-more-context",
          }),
          lifecycle,
        );
      if (
        plan.category === "respond" &&
        normalized.executionIntent.kind === "none"
      ) {
        const step = plan.steps[0];
        if (step.kind !== "respond") throw new InvalidBrainPlanError();
        return this.#completeNoSkill(
          createFinalCognitiveResult({
            status: "completed",
            kind: "response",
            requestId: normalized.requestId,
            response: step.candidateResponse,
          }),
          lifecycle,
        );
      }
      if (
        plan.category !== "respond" ||
        normalized.executionIntent.kind !== "skill-capability"
      )
        throw new InvalidBrainPlanError();
      return this.#skill(normalized, context, lifecycle);
    } catch (error) {
      this.#reject(lifecycle);
      throw error;
    } finally {
      this.#orchestrating = false;
    }
  }

  public verifyFinalCognitiveResult(
    request: VerifyFinalCognitiveResultRequest,
  ): boolean {
    return this.#authority.verify(request);
  }

  #nextDiagnosticIdentifier(): BrainDiagnosticCorrelationIdentifier {
    try {
      this.#diagnosticSequence += 1;
      return brainDiagnosticCorrelationIdentifier(
        `brain-diagnostic:${this.#diagnosticSequence}`,
      );
    } catch {
      throw new InvalidBrainExecutionStateError();
    }
  }

  #context(request: NormalizedCognitiveRequest, lifecycle: OperationLifecycle) {
    try {
      const candidate = this.#configuration.getContext({
        lineageIdentity: request.contextLineageId,
      });
      validateContext(candidate);
      const verified = this.#configuration.verifyContext({
        intent: "verify-active-context-revision-authority",
        candidate,
        expectedLineageIdentity: candidate.lineageIdentity,
        expectedRevisionIdentity: candidate.revisionIdentity,
        expectedRevisionNumber: candidate.revisionNumber,
      });
      if (
        verified !== candidate ||
        candidate.lineageIdentity !== request.contextLineageId ||
        candidate.lifecycleState !== "active"
      )
        throw new Error();
      this.#transition(lifecycle, "contextualized", "context-resolved");
      return candidate;
    } catch {
      throw new BrainContextResolutionError();
    }
  }

  #reasoning(
    request: NormalizedCognitiveRequest,
    context: ActiveContextRevision,
    lifecycle: OperationLifecycle,
  ): ReasoningOutcome {
    try {
      const candidate = this.#configuration.evaluateReasoning({
        intent: "evaluate",
        activeContextRevision: context,
        query: request.query,
      });
      strictGraph(candidate);
      requireDeepFrozen(candidate);
      createReasoningOutcome(candidate);
      const verified = this.#configuration.verifyReasoning({
        intent: "verify-reasoning-outcome-authority",
        candidate,
        consumedContextRevision: context,
        expectedLineageIdentity: context.lineageIdentity,
        expectedRevisionIdentity: context.revisionIdentity,
        expectedRevisionNumber: context.revisionNumber,
      });
      if (verified !== candidate) throw new Error();
      this.#transition(lifecycle, "reasoned", "reasoning-completed");
      return candidate;
    } catch {
      throw new BrainReasoningResolutionError();
    }
  }

  #planning(
    reasoning: ReasoningOutcome,
    lifecycle: OperationLifecycle,
  ): CandidatePlan {
    try {
      const candidate = this.#configuration.createPlan({
        intent: "create-candidate-plan",
        reasoningOutcome: reasoning,
      });
      strictGraph(candidate);
      requireDeepFrozen(candidate);
      createCandidatePlan(candidate);
      const explainability = reasoning.explainability;
      const verified = this.#configuration.verifyPlan({
        intent: "verify-candidate-plan-authority",
        candidate,
        consumedReasoningOutcome: reasoning,
        expectedReasoningStatus: reasoning.status,
        expectedReasoningCategory: reasoning.category,
        expectedCandidateNextAction: reasoning.nextAction,
        expectedIdentityState: explainability.identityState,
        expectedReasoningRuleCategory: explainability.ruleCategory,
      });
      if (verified !== candidate) throw new Error();
      this.#transition(lifecycle, "planned", "planning-completed");
      return candidate;
    } catch {
      throw new BrainPlanningResolutionError();
    }
  }

  #skill(
    request:
      | Extract<
          NormalizedCognitiveRequest,
          { executionIntent: { kind: "skill-capability" } }
        >
      | NormalizedCognitiveRequest,
    context: ActiveContextRevision,
    lifecycle: OperationLifecycle,
  ): FinalCognitiveResult {
    if (request.executionIntent.kind !== "skill-capability")
      throw new InvalidBrainPlanError();
    const executionIntent = request.executionIntent;
    this.#transition(lifecycle, "skill-required", "skill-required");
    const binding = this.#coordinate(() => {
      const selection = this.#configuration.selectSkill({
        intent: "select-skill",
        capability: executionIntent.capability,
      });
      return validateSelection(selection, executionIntent.capability);
    });
    const operationId = this.#coordinate(() => {
      const allocated = authorizationOperationIdentifier(
        this.#configuration.allocateOperation({
          intent: "allocate-authorization-operation",
          requestId: request.requestId,
          skillId: binding.registeredSkill.id,
          skillVersion: binding.registeredSkill.version,
          capability: binding.capability,
        }),
      );
      if (this.#allocatedOperations.has(allocated)) throw new Error();
      this.#allocatedOperations.add(allocated);
      return allocated;
    });
    const target = this.#coordinate(() => {
      const value = this.#configuration.bindSkill({
        intent: "bind-skill-to-operation",
        operationId,
        binding,
      });
      validateBoundTarget(value, operationId, binding);
      return value;
    });
    this.#transition(lifecycle, "bound", "skill-bound");
    const projection = this.#coordinate(() => {
      const value = this.#configuration.resolveContext({
        intent: "resolve-skill-execution-context",
        operationId,
        contextRevision: context,
      });
      validateExecutionContext(value, operationId, context);
      return value;
    });
    const requirements = this.#coordinate(() => {
      const value = this.#configuration.resolveRequirements({
        intent: "resolve-skill-invocation-requirements",
        target,
      });
      validateRequirements(value, target);
      if (value.status !== "available") throw new Error();
      return value;
    });
    const authorization = this.#authorize(() => {
      const value = this.#configuration.resolveAuthorization({
        intent: "resolve-governed-authorization-evaluation",
        request: {
          intent: "evaluate-authorization-outcome",
          operationId,
          action: target.action,
          resource: target.resource,
        },
      });
      validateAuthorization(value, operationId, target);
      return value;
    });
    this.#transition(
      lifecycle,
      "authorization-resolved",
      "authorization-outcome-obtained",
    );
    this.#transition(lifecycle, "invoking", "protected-invocation-started");
    const normalizedResult = this.#invoke(() => {
      const value = this.#configuration.invokeSkill({
        intent: "invoke-bound-skill",
        operationId,
        target,
        requirements,
        inputs: executionIntent.inputs,
        context: projection,
        authorizationEvaluation: authorization,
      });
      validateNormalizedResult(value, operationId, binding);
      const verified = this.#configuration.verifySkillResult(value, {
        operationId,
        skillId: binding.registeredSkill.id,
        skillVersion: binding.registeredSkill.version,
        capability: binding.capability,
      });
      if (verified !== true) throw new Error();
      return value;
    });
    return this.#completeSkill(
      request,
      operationId,
      binding,
      normalizedResult,
      lifecycle,
    );
  }

  #completeNoSkill(
    result: FinalCognitiveResult,
    lifecycle: OperationLifecycle,
  ): FinalCognitiveResult {
    try {
      this.#authority.register(result);
      const verified =
        result.kind === "response"
          ? this.verifyFinalCognitiveResult({
              intent: "verify-final-cognitive-response",
              candidate: result,
              expected: {
                kind: result.kind,
                requestId: result.requestId,
                response: result.response,
              },
            })
          : result.kind === "request-more-context"
            ? this.verifyFinalCognitiveResult({
                intent: "verify-final-request-more-context",
                candidate: result,
                expected: {
                  kind: result.kind,
                  requestId: result.requestId,
                  reason: result.reason,
                },
              })
            : false;
      if (!verified) throw new Error();
      this.#transition(lifecycle, "completed", "no-skill-completed");
      return result;
    } catch {
      throw new InvalidFinalCognitiveResultError();
    }
  }

  #completeSkill(
    request: NormalizedCognitiveRequest,
    operationId: AuthorizationOperationIdentifier,
    binding: SkillBinding,
    normalizedResult: NormalizedSkillExecutionResult,
    lifecycle: OperationLifecycle,
  ): FinalCognitiveResult {
    try {
      const result = createFinalCognitiveResult({
        status: "completed",
        kind: "skill-result",
        requestId: request.requestId,
        operationId,
        result: normalizedResult,
      });
      this.#authority.register(result, {
        skillId: binding.registeredSkill.id,
        skillVersion: binding.registeredSkill.version,
        capability: binding.capability,
      });
      if (
        !this.verifyFinalCognitiveResult({
          intent: "verify-final-skill-result",
          candidate: result,
          expected: {
            kind: "skill-result",
            requestId: request.requestId,
            operationId,
            skillId: binding.registeredSkill.id,
            skillVersion: binding.registeredSkill.version,
            capability: binding.capability,
            normalizedResult,
          },
        })
      )
        throw new Error();
      this.#transition(lifecycle, "completed", "skill-result-completed");
      return result;
    } catch {
      throw new InvalidFinalCognitiveResultError();
    }
  }

  #coordinate<T>(operation: () => T): T {
    try {
      return operation();
    } catch {
      throw new BrainSkillCoordinationError();
    }
  }

  #authorize<T>(operation: () => T): T {
    try {
      return operation();
    } catch {
      throw new BrainAuthorizationResolutionError();
    }
  }

  #invoke<T>(operation: () => T): T {
    try {
      return operation();
    } catch {
      throw new BrainProtectedInvocationError();
    }
  }

  #transition(
    lifecycle: OperationLifecycle,
    to: BrainOrchestrationLifecycleState,
    category: BrainOrchestrationTransitionCategory,
  ): void {
    const event = createBrainOrchestrationLifecycleEvent({
      sequence: lifecycle.sequence + 1,
      from: lifecycle.state,
      to,
      category,
      diagnosticCorrelationId: lifecycle.diagnosticId,
    });
    lifecycle.state = to;
    lifecycle.sequence += 1;
    this.#observe(event);
  }

  #reject(lifecycle: OperationLifecycle): void {
    if (
      lifecycle.state === "none" ||
      lifecycle.state === "completed" ||
      lifecycle.state === "rejected"
    )
      return;
    try {
      this.#transition(lifecycle, "rejected", "orchestration-rejected");
    } catch {
      // A private lifecycle failure never replaces the authoritative failure.
    }
  }

  #observe(event: Parameters<ObserveBrainOrchestrationLifecycle>[0]): void {
    if (this.#configuration.observer === undefined) return;
    try {
      this.#configuration.observer(event);
    } catch {
      // Observation has no authority over orchestration.
    }
  }
}

function captureConfiguration(
  configuration: BrainConfiguration,
): CapturedConfiguration {
  try {
    const fields: string[] = [...CONFIGURATION_FIELDS];
    const hasObserver = ownDescriptor(configuration, "lifecycleObserver");
    if (hasObserver !== undefined) fields.push("lifecycleObserver");
    exactRecord(configuration, fields);
    const context = capturePort(configuration.context, [
      "getActiveContextRevision",
      "verifyActiveContextRevisionAuthority",
    ]);
    const reasoning = capturePort(configuration.reasoning, [
      "evaluateReasoning",
      "verifyReasoningOutcomeAuthority",
    ]);
    const planning = capturePort(configuration.planning, [
      "createCandidatePlan",
      "verifyCandidatePlanAuthority",
    ]);
    const select = capturePort(configuration.selectSkill, ["selectSkill"]);
    const allocator = capturePort(configuration.operationAllocator, [
      "allocateAuthorizationOperationIdentifier",
    ]);
    const bind = capturePort(configuration.bindSkillToOperation, [
      "bindSkillToOperation",
    ]);
    const executionContext = capturePort(
      configuration.resolveSkillExecutionContext,
      ["resolveSkillExecutionContext"],
    );
    const requirements = capturePort(
      configuration.resolveSkillInvocationRequirements,
      ["resolveSkillInvocationRequirements"],
    );
    const authorization = capturePort(
      configuration.resolveGovernedAuthorizationEvaluation,
      ["resolveGovernedAuthorizationEvaluation"],
    );
    const invoke = capturePort(configuration.protectedInvokeSkill, [
      "invokeBoundSkill",
    ]);
    const resultVerifier = capturePort(
      configuration.verifyNormalizedSkillExecutionResult,
      ["verify"],
    );
    const observer = hasObserver?.value;
    if (observer !== undefined && typeof observer !== "function")
      throw new Error();
    return Object.freeze({
      getContext: context.getActiveContextRevision,
      verifyContext: context.verifyActiveContextRevisionAuthority,
      evaluateReasoning: reasoning.evaluateReasoning,
      verifyReasoning: reasoning.verifyReasoningOutcomeAuthority,
      createPlan: planning.createCandidatePlan,
      verifyPlan: planning.verifyCandidatePlanAuthority,
      selectSkill: select.selectSkill,
      allocateOperation: allocator.allocateAuthorizationOperationIdentifier,
      bindSkill: bind.bindSkillToOperation,
      resolveContext: executionContext.resolveSkillExecutionContext,
      resolveRequirements: requirements.resolveSkillInvocationRequirements,
      resolveAuthorization:
        authorization.resolveGovernedAuthorizationEvaluation,
      invokeSkill: invoke.invokeBoundSkill,
      verifySkillResult: resultVerifier.verify,
      ...(observer === undefined ? {} : { observer }),
    }) as CapturedConfiguration;
  } catch {
    throw new InvalidBrainAuthorityError();
  }
}

function capturePort(
  value: unknown,
  fields: readonly string[],
): Record<string, (...args: never[]) => unknown> {
  exactRecord(value, fields);
  const captured: Record<string, (...args: never[]) => unknown> =
    Object.create(null);
  for (const field of fields) {
    const descriptor = ownDescriptor(value, field);
    if (descriptor === undefined || typeof descriptor.value !== "function")
      throw new Error();
    captured[field] = descriptor.value as (...args: never[]) => unknown;
  }
  return Object.freeze(captured);
}

function exactRecord(value: unknown, fields: readonly string[]): void {
  if (typeof value !== "object" || value === null || Array.isArray(value))
    throw new Error();
  const prototype = Reflect.getPrototypeOf(value);
  if (prototype !== Object.prototype && prototype !== null) throw new Error();
  const keys = Reflect.ownKeys(value);
  if (
    keys.length !== fields.length ||
    keys.some((key) => typeof key !== "string" || !fields.includes(key))
  )
    throw new Error();
  for (const field of fields) {
    const descriptor = ownDescriptor(value, field);
    if (
      descriptor === undefined ||
      descriptor.enumerable !== true ||
      !("value" in descriptor) ||
      descriptor.value === undefined
    )
      throw new Error();
  }
}

function ownDescriptor(
  value: unknown,
  field: string,
): PropertyDescriptor | undefined {
  if (typeof value !== "object" || value === null) return undefined;
  return Reflect.getOwnPropertyDescriptor(value, field);
}

function strictGraph(value: unknown, seen = new Set<object>()): void {
  if (typeof value !== "object" || value === null) return;
  if (seen.has(value)) throw new Error();
  seen.add(value);
  const prototype = Reflect.getPrototypeOf(value);
  if (
    prototype !== Object.prototype &&
    prototype !== null &&
    prototype !== Array.prototype
  )
    throw new Error();
  for (const key of Reflect.ownKeys(value)) {
    if (typeof key !== "string") throw new Error();
    const descriptor = Reflect.getOwnPropertyDescriptor(value, key);
    if (descriptor === undefined || !("value" in descriptor)) throw new Error();
    if (key !== "length" && descriptor.enumerable !== true) throw new Error();
    strictGraph(descriptor.value, seen);
  }
}

function requireDeepFrozen(value: unknown, seen = new Set<object>()): void {
  if (typeof value !== "object" || value === null) return;
  if (seen.has(value)) return;
  seen.add(value);
  if (!Object.isFrozen(value)) throw new Error();
  for (const key of Reflect.ownKeys(value)) {
    const descriptor = Reflect.getOwnPropertyDescriptor(value, key);
    if (descriptor !== undefined && "value" in descriptor)
      requireDeepFrozen(descriptor.value, seen);
  }
}

function validateContext(
  value: unknown,
): asserts value is ReturnType<
  BrainConfiguration["context"]["getActiveContextRevision"]
> {
  strictGraph(value);
  const fields = [
    "lineageIdentity",
    "revisionIdentity",
    "revisionNumber",
    "creationMetadata",
    "lifecycleState",
    "fragments",
  ];
  if (ownDescriptor(value, "parentRevisionIdentity") !== undefined)
    fields.push("parentRevisionIdentity");
  exactRecord(value, fields);
  const record = value as Record<string, unknown>;
  contextLineageIdentity(record.lineageIdentity);
  contextRevisionIdentity(record.revisionIdentity);
  contextRevisionNumber(record.revisionNumber);
  if (record.parentRevisionIdentity !== undefined)
    contextRevisionIdentity(record.parentRevisionIdentity);
  exactRecord(record.creationMetadata, [
    "createdAt",
    "sourceCount",
    "fragmentCount",
  ]);
  const metadata = record.creationMetadata as Record<string, unknown>;
  contextCreatedAt(metadata.createdAt);
  if (metadata.sourceCount !== 1 || metadata.fragmentCount !== 1)
    throw new Error();
  if (!Array.isArray(record.fragments) || record.fragments.length !== 1)
    throw new Error();
  const fragment = record.fragments[0];
  exactRecord(fragment, ["kind", "authoritativeOwner", "projection"]);
  const fragmentRecord = fragment as Record<string, unknown>;
  if (
    fragmentRecord.kind !== "identity" ||
    fragmentRecord.authoritativeOwner !== "identity"
  )
    throw new Error();
  const projection = fragmentRecord.projection;
  const projectionState = ownDescriptor(projection, "state")?.value;
  exactRecord(
    projection,
    projectionState === "anonymous"
      ? ["state", "authoritativeOwner"]
      : ["state", "authoritativeOwner", "identityIdentifier"],
  );
  const projectionRecord = projection as Record<string, unknown>;
  if (
    projectionRecord.authoritativeOwner !== "identity" ||
    (projectionRecord.state !== "anonymous" &&
      projectionRecord.state !== "authenticated")
  )
    throw new Error();
  if (projectionRecord.state === "authenticated")
    identityIdentifier(projectionRecord.identityIdentifier);
  if (
    record.lifecycleState !== "active" ||
    !Object.isFrozen(value) ||
    !Object.isFrozen(record.creationMetadata) ||
    !Object.isFrozen(record.fragments) ||
    !Object.isFrozen(fragment) ||
    !Object.isFrozen(projection)
  )
    throw new Error();
}

function validateSelection(
  value: SkillSelectionResult,
  capability: unknown,
): SkillBinding {
  strictGraph(value);
  if (value.status !== "selected") throw new Error();
  exactRecord(value, ["status", "policy", "binding"]);
  exactRecord(value.policy, ["id", "version"]);
  if (
    value.policy.id !== "orion.minimum-skill-selection" ||
    value.policy.version !== "1.0.0"
  )
    throw new Error();
  exactRecord(value.binding, ["capability", "registeredSkill"]);
  skillCapabilityIdentifier(value.binding.capability);
  if (value.binding.capability !== capability) throw new Error();
  const validatedRegisteredSkill = createRegisteredSkill(
    value.binding.registeredSkill,
  );
  requireRegisteredSkillCorrespondence(
    value.binding.registeredSkill,
    validatedRegisteredSkill,
  );
  requireDeepFrozen(value);
  return value.binding;
}

function validateBoundTarget(
  value: BoundSkillInvocationTarget,
  operationId: AuthorizationOperationIdentifier,
  binding: SkillBinding,
): void {
  strictGraph(value);
  exactRecord(value, [
    "operationId",
    "skillId",
    "skillVersion",
    "capability",
    "action",
    "resource",
    "requiredPermissions",
    "inputNames",
    "outputNames",
    "failureModes",
  ]);
  authorizationOperationIdentifier(value.operationId);
  skillIdentifier(value.skillId);
  skillVersion(value.skillVersion);
  skillCapabilityIdentifier(value.capability);
  authorizationActionIdentifier(value.action);
  validateResource(value.resource);
  validateArray(value.requiredPermissions, skillPermissionIdentifier);
  validateArray(value.inputNames, skillInterfaceFieldIdentifier);
  validateArray(value.outputNames, skillInterfaceFieldIdentifier);
  validateArray(value.failureModes, skillFailureModeIdentifier);
  requireExactArrayCorrespondence(
    value.requiredPermissions,
    binding.registeredSkill.permissions,
  );
  requireExactArrayCorrespondence(
    value.inputNames,
    binding.registeredSkill.inputs,
  );
  requireExactArrayCorrespondence(
    value.outputNames,
    binding.registeredSkill.outputs,
  );
  requireExactArrayCorrespondence(
    value.failureModes,
    binding.registeredSkill.failureModes,
  );
  if (
    value.operationId !== operationId ||
    value.skillId !== binding.registeredSkill.id ||
    value.skillVersion !== binding.registeredSkill.version ||
    value.capability !== binding.capability ||
    !Object.isFrozen(value)
  )
    throw new Error();
  requireDeepFrozen(value);
}

function validateExecutionContext(
  value: SkillExecutionContextProjection,
  operationId: AuthorizationOperationIdentifier,
  context: ActiveContextRevision,
): void {
  strictGraph(value);
  exactRecord(value, ["operationId", "lineageId", "revisionId", "subject"]);
  authorizationOperationIdentifier(value.operationId);
  if (
    value.operationId !== operationId ||
    value.lineageId !== context.lineageIdentity ||
    value.revisionId !== context.revisionIdentity ||
    !Object.isFrozen(value)
  )
    throw new Error();
  const subjectKind = ownDescriptor(value.subject, "kind")?.value;
  exactRecord(
    value.subject,
    subjectKind === "anonymous" ? ["kind"] : ["kind", "identityId"],
  );
  if (
    subjectKind !== "anonymous" &&
    (subjectKind !== "authenticated" ||
      identityIdentifier(
        (value.subject as { readonly identityId: unknown }).identityId,
      ) === undefined)
  )
    throw new Error();
  const contextProjection = context.fragments[0].projection;
  if (
    (contextProjection.state === "anonymous" && subjectKind !== "anonymous") ||
    (contextProjection.state === "authenticated" &&
      (value.subject.kind !== "authenticated" ||
        value.subject.identityId !== contextProjection.identityIdentifier))
  )
    throw new Error();
  requireDeepFrozen(value);
}

function validateRequirements(
  value: SkillInvocationRequirementsProjection,
  target: BoundSkillInvocationTarget,
): void {
  strictGraph(value);
  if (value.status === "available") {
    exactRecord(value, ["status", "requirements"]);
    exactRecord(value.requirements, [
      "operationId",
      "action",
      "resource",
      "requiredPermissions",
      "sensitivity",
    ]);
    validateArray(
      value.requirements.requiredPermissions,
      skillPermissionIdentifier,
    );
    requireExactArrayCorrespondence(
      value.requirements.requiredPermissions,
      target.requiredPermissions,
    );
    if (
      value.requirements.operationId !== target.operationId ||
      value.requirements.action !== target.action ||
      !sameResource(value.requirements.resource, target.resource) ||
      (value.requirements.sensitivity !== "standard" &&
        value.requirements.sensitivity !== "sensitive")
    )
      throw new Error();
  } else {
    exactRecord(value, ["status", "operationId", "action", "resource"]);
    if (
      value.operationId !== target.operationId ||
      value.action !== target.action ||
      !sameResource(value.resource, target.resource)
    )
      throw new Error();
  }
  requireDeepFrozen(value);
}

function validateAuthorization(
  value: AuthorizationEvaluationOutcome,
  operationId: AuthorizationOperationIdentifier,
  target: BoundSkillInvocationTarget,
): void {
  strictGraph(value);
  createAuthorizationEvaluationOutcome(value);
  if (
    value.authorization.operationId !== operationId ||
    value.securityEvaluationSummary.operationId !== operationId ||
    value.authorization.action !== target.action ||
    !sameResource(value.authorization.resource, target.resource) ||
    !Object.isFrozen(value)
  )
    throw new Error();
}

function validateNormalizedResult(
  value: NormalizedSkillExecutionResult,
  operationId: AuthorizationOperationIdentifier,
  binding: SkillBinding,
): void {
  strictGraph(value);
  const fields =
    value.status === "succeeded"
      ? [
          "operationId",
          "skillId",
          "skillVersion",
          "capability",
          "status",
          "outputs",
        ]
      : [
          "operationId",
          "skillId",
          "skillVersion",
          "capability",
          "status",
          "failureMode",
        ];
  exactRecord(value, fields);
  authorizationOperationIdentifier(value.operationId);
  skillIdentifier(value.skillId);
  skillVersion(value.skillVersion);
  skillCapabilityIdentifier(value.capability);
  if (value.status === "succeeded") validateInvocationData(value.outputs);
  else if (value.status === "failed")
    skillFailureModeIdentifier(value.failureMode);
  else throw new Error();
  if (
    value.operationId !== operationId ||
    value.skillId !== binding.registeredSkill.id ||
    value.skillVersion !== binding.registeredSkill.version ||
    value.capability !== binding.capability ||
    !Object.isFrozen(value)
  )
    throw new Error();
}

function validateInvocationData(value: unknown): void {
  strictGraph(value);
  if (typeof value !== "object" || value === null || Array.isArray(value))
    throw new Error();
  const keys = Object.keys(value);
  if (
    keys.length > 64 ||
    keys.some((key, index) => key !== [...keys].sort()[index])
  )
    throw new Error();
  for (const key of keys) {
    skillInterfaceFieldIdentifier(key);
    const item = (value as Record<string, unknown>)[key];
    const valid =
      item === null ||
      typeof item === "boolean" ||
      (typeof item === "number" &&
        Number.isSafeInteger(item) &&
        !Object.is(item, -0)) ||
      (typeof item === "string" &&
        [...item].length <= 4096 &&
        !/\p{Cc}/u.test(item));
    if (!valid) throw new Error();
  }
  if (!Object.isFrozen(value)) throw new Error();
}

function validateArray(
  value: readonly unknown[],
  validator: (value: unknown) => unknown,
): void {
  if (!Array.isArray(value) || !Object.isFrozen(value)) throw new Error();
  const keys = Reflect.ownKeys(value);
  if (
    keys.length !== value.length + 1 ||
    keys.some(
      (key) =>
        key !== "length" &&
        (typeof key !== "string" || !/^(0|[1-9]\d*)$/.test(key)),
    )
  )
    throw new Error();
  for (const item of value) validator(item);
}

function requireExactArrayCorrespondence(
  actual: readonly unknown[],
  expected: readonly unknown[],
): void {
  if (
    actual.length !== expected.length ||
    actual.some((item, index) => item !== expected[index])
  )
    throw new Error();
}

function requireRegisteredSkillCorrespondence(
  actual: SkillBinding["registeredSkill"],
  validated: SkillBinding["registeredSkill"],
): void {
  if (
    actual.id !== validated.id ||
    actual.name !== validated.name ||
    actual.version !== validated.version ||
    actual.description !== validated.description ||
    actual.author !== validated.author ||
    actual.license !== validated.license
  )
    throw new Error();
  requireExactArrayCorrespondence(actual.permissions, validated.permissions);
  requireExactArrayCorrespondence(actual.capabilities, validated.capabilities);
  requireExactArrayCorrespondence(
    actual.events.publishes,
    validated.events.publishes,
  );
  requireExactArrayCorrespondence(
    actual.events.consumes,
    validated.events.consumes,
  );
  requireExactArrayCorrespondence(actual.inputs, validated.inputs);
  requireExactArrayCorrespondence(actual.outputs, validated.outputs);
  requireExactArrayCorrespondence(actual.failureModes, validated.failureModes);
}

function validateResource(value: unknown): void {
  const kind = ownDescriptor(value, "kind")?.value;
  exactRecord(value, kind === "unscoped" ? ["kind"] : ["kind", "resourceId"]);
  if (kind === "unscoped") return;
  if (kind !== "identified") throw new Error();
  authorizationResourceIdentifier(
    (value as { readonly resourceId: unknown }).resourceId,
  );
}

function sameResource(left: unknown, right: unknown): boolean {
  if (left === right) return true;
  try {
    return JSON.stringify(left) === JSON.stringify(right);
  } catch {
    return false;
  }
}
