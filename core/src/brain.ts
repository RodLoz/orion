import {
  InvalidBrainExecutionStateError,
  InvalidBrainRequestError,
  InvalidFinalCognitiveResultError,
} from "./brain-errors.js";
import {
  contextLineageIdentity,
  type ContextLineageIdentity,
} from "./context.js";
import {
  candidateResponse,
  reasoningQuery,
  type CandidateResponse,
  type ReasoningQuery,
} from "./reasoning.js";
import {
  authorizationOperationIdentifier,
  type AuthorizationOperationIdentifier,
} from "./security.js";
import {
  skillCapabilityIdentifier,
  skillFailureModeIdentifier,
  skillIdentifier,
  skillInterfaceFieldIdentifier,
  skillVersion,
  type SkillCapabilityIdentifier,
} from "./skill.js";
import type {
  NormalizedSkillExecutionResult,
  SkillInvocationData,
  SkillInvocationScalar,
} from "./skill-execution.js";

export type BrainRequestIdentifier = string & {
  readonly __brainRequestIdentifier: unique symbol;
};

export type BrainDiagnosticCorrelationIdentifier = string & {
  readonly __brainDiagnosticCorrelationIdentifier: unique symbol;
};

export type BrainExecutionIntent =
  | Readonly<{ kind: "none" }>
  | Readonly<{
      kind: "skill-capability";
      capability: SkillCapabilityIdentifier;
      inputs: SkillInvocationData;
    }>;

export interface NormalizedCognitiveRequest {
  readonly intent: "orchestrate-cognitive-request";
  readonly requestId: BrainRequestIdentifier;
  readonly contextLineageId: ContextLineageIdentity;
  readonly query: ReasoningQuery;
  readonly executionIntent: BrainExecutionIntent;
}

export interface FinalCognitiveResponse {
  readonly status: "completed";
  readonly kind: "response";
  readonly requestId: BrainRequestIdentifier;
  readonly response: CandidateResponse;
}

export interface FinalCognitiveRequestMoreContext {
  readonly status: "completed";
  readonly kind: "request-more-context";
  readonly requestId: BrainRequestIdentifier;
  readonly reason: "planning-requested-more-context";
}

export interface FinalCognitiveSkillResult {
  readonly status: "completed";
  readonly kind: "skill-result";
  readonly requestId: BrainRequestIdentifier;
  readonly operationId: AuthorizationOperationIdentifier;
  readonly result: NormalizedSkillExecutionResult;
}

export type FinalCognitiveResult =
  | FinalCognitiveResponse
  | FinalCognitiveRequestMoreContext
  | FinalCognitiveSkillResult;

export type BrainOrchestrationLifecycleState =
  | "proposed"
  | "contextualized"
  | "reasoned"
  | "planned"
  | "skill-required"
  | "bound"
  | "authorization-resolved"
  | "invoking"
  | "completed"
  | "rejected";

export type BrainOrchestrationTransitionCategory =
  | "orchestration-proposed"
  | "context-resolved"
  | "reasoning-completed"
  | "planning-completed"
  | "skill-required"
  | "skill-bound"
  | "authorization-outcome-obtained"
  | "protected-invocation-started"
  | "no-skill-completed"
  | "skill-result-completed"
  | "orchestration-rejected";

export interface BrainOrchestrationLifecycleEvent {
  readonly sequence: number;
  readonly from: "none" | BrainOrchestrationLifecycleState;
  readonly to: BrainOrchestrationLifecycleState;
  readonly category: BrainOrchestrationTransitionCategory;
  readonly diagnosticCorrelationId: BrainDiagnosticCorrelationIdentifier;
}

const REQUEST_IDENTIFIER_PATTERN = /^[A-Za-z0-9][A-Za-z0-9._:-]{0,127}$/;
const DIAGNOSTIC_IDENTIFIER_PATTERN = /^brain-diagnostic:([1-9][0-9]*)$/;
const INPUT_FIELD_MAX_COUNT = 64;
const INPUT_STRING_MAX_CODE_POINTS = 4096;

export function brainRequestIdentifier(value: unknown): BrainRequestIdentifier {
  if (typeof value !== "string" || !REQUEST_IDENTIFIER_PATTERN.test(value))
    throw new InvalidBrainRequestError();
  return value as BrainRequestIdentifier;
}

export function brainDiagnosticCorrelationIdentifier(
  value: unknown,
): BrainDiagnosticCorrelationIdentifier {
  if (typeof value !== "string") throw new InvalidBrainExecutionStateError();
  const match = DIAGNOSTIC_IDENTIFIER_PATTERN.exec(value);
  if (match === null) throw new InvalidBrainExecutionStateError();
  const sequence = Number(match[1]);
  if (!Number.isSafeInteger(sequence) || sequence < 1)
    throw new InvalidBrainExecutionStateError();
  return value as BrainDiagnosticCorrelationIdentifier;
}

export function createNormalizedCognitiveRequest(
  input: unknown,
): NormalizedCognitiveRequest {
  try {
    const source = exactDataRecord(input, [
      "intent",
      "requestId",
      "contextLineageId",
      "query",
      "executionIntent",
    ]);
    if (source.intent !== "orchestrate-cognitive-request") throw new Error();
    return Object.freeze({
      intent: "orchestrate-cognitive-request",
      requestId: brainRequestIdentifier(source.requestId),
      contextLineageId: contextLineageIdentity(source.contextLineageId),
      query: reasoningQuery(source.query),
      executionIntent: createBrainExecutionIntent(source.executionIntent),
    });
  } catch {
    throw new InvalidBrainRequestError();
  }
}

export function createBrainExecutionIntent(
  input: unknown,
): BrainExecutionIntent {
  try {
    const kind = ownDataValue(input, "kind");
    const source = exactDataRecord(
      input,
      kind === "none" ? ["kind"] : ["kind", "capability", "inputs"],
    );
    if (source.kind === "none") return Object.freeze({ kind: "none" });
    if (source.kind !== "skill-capability") throw new Error();
    return Object.freeze({
      kind: "skill-capability",
      capability: skillCapabilityIdentifier(source.capability),
      inputs: createSkillInvocationData(source.inputs),
    });
  } catch {
    throw new InvalidBrainRequestError();
  }
}

export function createFinalCognitiveResult(
  input: unknown,
): FinalCognitiveResult {
  try {
    const kind = ownDataValue(input, "kind");
    if (kind === "response") {
      const source = exactDataRecord(input, [
        "status",
        "kind",
        "requestId",
        "response",
      ]);
      if (source.status !== "completed") throw new Error();
      return Object.freeze({
        status: "completed",
        kind,
        requestId: brainRequestIdentifier(source.requestId),
        response: candidateResponse(source.response),
      });
    }
    if (kind === "request-more-context") {
      const source = exactDataRecord(input, [
        "status",
        "kind",
        "requestId",
        "reason",
      ]);
      if (
        source.status !== "completed" ||
        source.reason !== "planning-requested-more-context"
      )
        throw new Error();
      return Object.freeze({
        status: "completed",
        kind,
        requestId: brainRequestIdentifier(source.requestId),
        reason: "planning-requested-more-context",
      });
    }
    const source = exactDataRecord(input, [
      "status",
      "kind",
      "requestId",
      "operationId",
      "result",
    ]);
    if (source.status !== "completed" || source.kind !== "skill-result")
      throw new Error();
    const operationId = authorizationOperationIdentifier(source.operationId);
    const validatedResult = validateNormalizedSkillResult(source.result);
    if (validatedResult.operationId !== operationId) throw new Error();
    return Object.freeze({
      status: "completed",
      kind: "skill-result",
      requestId: brainRequestIdentifier(source.requestId),
      operationId,
      result: validatedResult.result,
    });
  } catch {
    throw new InvalidFinalCognitiveResultError();
  }
}

export function createBrainOrchestrationLifecycleEvent(
  input: unknown,
): BrainOrchestrationLifecycleEvent {
  try {
    const source = exactDataRecord(input, [
      "sequence",
      "from",
      "to",
      "category",
      "diagnosticCorrelationId",
    ]);
    if (
      typeof source.sequence !== "number" ||
      !Number.isSafeInteger(source.sequence) ||
      source.sequence < 1 ||
      !isLifecycleFrom(source.from) ||
      !isLifecycleState(source.to) ||
      !isTransitionCategory(source.category) ||
      !validTransition(source.from, source.to, source.category)
    )
      throw new Error();
    return Object.freeze({
      sequence: source.sequence,
      from: source.from,
      to: source.to,
      category: source.category,
      diagnosticCorrelationId: brainDiagnosticCorrelationIdentifier(
        source.diagnosticCorrelationId,
      ),
    });
  } catch {
    throw new InvalidBrainExecutionStateError();
  }
}

function createSkillInvocationData(input: unknown): SkillInvocationData {
  const source = exactDataRecordAnyFields(input, INPUT_FIELD_MAX_COUNT);
  const result: Record<string, SkillInvocationScalar> = Object.create(null);
  for (const key of Object.keys(source).sort()) {
    skillInterfaceFieldIdentifier(key);
    const value = source[key];
    if (!isSkillInvocationScalar(value)) throw new Error();
    Object.defineProperty(result, key, {
      value,
      enumerable: true,
      writable: false,
      configurable: false,
    });
  }
  return Object.freeze(result);
}

function validateNormalizedSkillResult(input: unknown): Readonly<{
  result: NormalizedSkillExecutionResult;
  operationId: AuthorizationOperationIdentifier;
}> {
  if (!Object.isFrozen(input)) throw new Error();
  const status = ownDataValue(input, "status");
  const source = exactDataRecord(
    input,
    status === "succeeded"
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
        ],
  );
  if (source.status !== "succeeded" && source.status !== "failed")
    throw new Error();
  const operationId = authorizationOperationIdentifier(source.operationId);
  skillIdentifier(source.skillId);
  skillVersion(source.skillVersion);
  skillCapabilityIdentifier(source.capability);
  if (source.status === "succeeded") {
    validateImmutableSkillInvocationData(source.outputs);
  } else {
    skillFailureModeIdentifier(source.failureMode);
  }
  return {
    result: input as NormalizedSkillExecutionResult,
    operationId,
  };
}

function validateImmutableSkillInvocationData(input: unknown): void {
  if (!Object.isFrozen(input)) throw new Error();
  const source = exactDataRecordAnyFields(input, INPUT_FIELD_MAX_COUNT);
  const keys = Object.keys(source);
  const canonicalKeys = [...keys].sort();
  if (keys.some((key, index) => key !== canonicalKeys[index]))
    throw new Error();
  for (const key of keys) {
    skillInterfaceFieldIdentifier(key);
    if (!isSkillInvocationScalar(source[key])) throw new Error();
  }
}

function isSkillInvocationScalar(
  value: unknown,
): value is SkillInvocationScalar {
  return (
    value === null ||
    typeof value === "boolean" ||
    (typeof value === "number" &&
      Number.isSafeInteger(value) &&
      !Object.is(value, -0)) ||
    (typeof value === "string" &&
      [...value].length <= INPUT_STRING_MAX_CODE_POINTS &&
      !/\p{Cc}/u.test(value))
  );
}

function exactDataRecord(
  value: unknown,
  fields: readonly string[],
): Record<string, unknown> {
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
  const result: Record<string, unknown> = Object.create(null);
  for (const field of fields) {
    const descriptor = Reflect.getOwnPropertyDescriptor(value, field);
    if (
      descriptor === undefined ||
      descriptor.enumerable !== true ||
      !("value" in descriptor) ||
      descriptor.value === undefined
    )
      throw new Error();
    result[field] = descriptor.value;
  }
  return result;
}

function exactDataRecordAnyFields(
  value: unknown,
  maximum: number,
): Record<string, unknown> {
  if (typeof value !== "object" || value === null || Array.isArray(value))
    throw new Error();
  const prototype = Reflect.getPrototypeOf(value);
  if (prototype !== Object.prototype && prototype !== null) throw new Error();
  const keys = Reflect.ownKeys(value);
  if (
    keys.length > maximum ||
    keys.some((key) => typeof key !== "string" || key.length === 0)
  )
    throw new Error();
  const result: Record<string, unknown> = Object.create(null);
  for (const key of keys as string[]) {
    const descriptor = Reflect.getOwnPropertyDescriptor(value, key);
    if (
      descriptor === undefined ||
      descriptor.enumerable !== true ||
      !("value" in descriptor) ||
      descriptor.value === undefined
    )
      throw new Error();
    result[key] = descriptor.value;
  }
  return result;
}

function ownDataValue(value: unknown, field: string): unknown {
  if (typeof value !== "object" || value === null) throw new Error();
  const descriptor = Reflect.getOwnPropertyDescriptor(value, field);
  if (
    descriptor === undefined ||
    descriptor.enumerable !== true ||
    !("value" in descriptor) ||
    descriptor.value === undefined
  )
    throw new Error();
  return descriptor.value;
}

function isLifecycleFrom(
  value: unknown,
): value is "none" | BrainOrchestrationLifecycleState {
  return value === "none" || isLifecycleState(value);
}

function isLifecycleState(
  value: unknown,
): value is BrainOrchestrationLifecycleState {
  return [
    "proposed",
    "contextualized",
    "reasoned",
    "planned",
    "skill-required",
    "bound",
    "authorization-resolved",
    "invoking",
    "completed",
    "rejected",
  ].includes(value as BrainOrchestrationLifecycleState);
}

function isTransitionCategory(
  value: unknown,
): value is BrainOrchestrationTransitionCategory {
  return [
    "orchestration-proposed",
    "context-resolved",
    "reasoning-completed",
    "planning-completed",
    "skill-required",
    "skill-bound",
    "authorization-outcome-obtained",
    "protected-invocation-started",
    "no-skill-completed",
    "skill-result-completed",
    "orchestration-rejected",
  ].includes(value as BrainOrchestrationTransitionCategory);
}

function validTransition(
  from: "none" | BrainOrchestrationLifecycleState,
  to: BrainOrchestrationLifecycleState,
  category: BrainOrchestrationTransitionCategory,
): boolean {
  if (category === "orchestration-rejected")
    return (
      from !== "none" &&
      from !== "completed" &&
      from !== "rejected" &&
      to === "rejected"
    );
  return (
    (from === "none" &&
      to === "proposed" &&
      category === "orchestration-proposed") ||
    (from === "proposed" &&
      to === "contextualized" &&
      category === "context-resolved") ||
    (from === "contextualized" &&
      to === "reasoned" &&
      category === "reasoning-completed") ||
    (from === "reasoned" &&
      to === "planned" &&
      category === "planning-completed") ||
    (from === "planned" &&
      to === "skill-required" &&
      category === "skill-required") ||
    (from === "skill-required" &&
      to === "bound" &&
      category === "skill-bound") ||
    (from === "bound" &&
      to === "authorization-resolved" &&
      category === "authorization-outcome-obtained") ||
    (from === "authorization-resolved" &&
      to === "invoking" &&
      category === "protected-invocation-started") ||
    (from === "planned" &&
      to === "completed" &&
      category === "no-skill-completed") ||
    (from === "invoking" &&
      to === "completed" &&
      category === "skill-result-completed")
  );
}
