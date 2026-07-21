import {
  InactiveContextError,
  InvalidActiveContextError,
  InvalidKnowledgeReferenceError,
  InvalidMemoryReferenceError,
  InvalidReasoningInputError,
  InvalidReasoningQueryError,
  InvalidReasoningStateError,
  REASONING_REFERENCE_MAX_COUNT,
  ReasoningRuleFailureError,
  contextCreatedAt,
  contextLifecycleState,
  contextLineageIdentity,
  contextRevisionIdentity,
  contextRevisionNumber,
  createContextConsumptionReference,
  createKnowledgeReference,
  createMemoryReference,
  createReasoningExplainabilitySummary,
  createReasoningOutcome,
  identityIdentifier,
  reasoningQuery,
  type ActiveContextRevision,
  type EvaluateReasoning,
  type IdentityContextProjection,
  type KnowledgeReference,
  type MemoryReference,
  type ReasoningOutcome,
} from "@orion/core";

interface NormalizedRequest {
  readonly context: ActiveContextRevision;
  readonly query: ReturnType<typeof reasoningQuery>;
  readonly memoryReferences: readonly MemoryReference[];
  readonly knowledgeReferences: readonly KnowledgeReference[];
}

interface ValidatedRequestShape {
  readonly source: Record<string, unknown>;
  readonly hasMemoryReferences: boolean;
  readonly hasKnowledgeReferences: boolean;
}

export class ReasoningEngine implements EvaluateReasoning {
  #state: ReasoningEngineLifecycleState = "initialize";
  public get engineState(): ReasoningEngineLifecycleState {
    return this.#state;
  }
  public initialize(): void {
    if (this.#state !== "initialize") throw new InvalidReasoningStateError();
    this.#state = "ready";
  }
  public start(): void {
    if (this.#state !== "ready") throw new InvalidReasoningStateError();
    this.#state = "running";
  }
  public stop(): void {
    if (this.#state !== "running") throw new InvalidReasoningStateError();
    this.#state = "stopped";
  }

  public evaluateReasoning(request: unknown): ReasoningOutcome {
    if (this.#state !== "running") throw new InvalidReasoningStateError();
    const top = this.validateTopLevel(request);
    const context = this.validateContextField(top.source);
    if (context.lifecycleState !== "active") throw new InactiveContextError();
    const query = this.validateQueryField(top.source);
    const memoryReferences = this.validateMemoryReferences(
      top.source,
      top.hasMemoryReferences,
    );
    const knowledgeReferences = this.validateKnowledgeReferences(
      top.source,
      top.hasKnowledgeReferences,
    );
    return this.evaluateRules(
      Object.freeze({ context, query, memoryReferences, knowledgeReferences }),
    );
  }

  private validateTopLevel(value: unknown): ValidatedRequestShape {
    try {
      if (!isPlainRecord(value)) throw new Error();
      const keys = Object.keys(value);
      if (
        !hasExactKeySet(
          keys,
          ["intent", "activeContextRevision", "query"],
          ["memoryReferences", "knowledgeReferences"],
        )
      )
        throw new Error();
      if (Reflect.get(value, "intent") !== "evaluate") throw new Error();
      return Object.freeze({
        source: value,
        hasMemoryReferences: keys.includes("memoryReferences"),
        hasKnowledgeReferences: keys.includes("knowledgeReferences"),
      });
    } catch {
      throw new InvalidReasoningInputError();
    }
  }

  private validateContextField(
    source: Record<string, unknown>,
  ): ActiveContextRevision {
    try {
      return this.validateContext(Reflect.get(source, "activeContextRevision"));
    } catch (error: unknown) {
      if (error instanceof InvalidActiveContextError) throw error;
      throw new InvalidActiveContextError();
    }
  }

  private validateContext(value: unknown): ActiveContextRevision {
    try {
      const revision = exactRecord(
        value,
        [
          "lineageIdentity",
          "revisionIdentity",
          "revisionNumber",
          "creationMetadata",
          "lifecycleState",
          "fragments",
        ],
        ["parentRevisionIdentity"],
      );
      const metadata = exactRecord(revision.creationMetadata, [
        "createdAt",
        "sourceCount",
        "fragmentCount",
      ]);
      if (metadata.sourceCount !== 1 || metadata.fragmentCount !== 1)
        throw new Error();
      const fragments = revision.fragments;
      if (
        !Array.isArray(fragments) ||
        fragments.length !== 1 ||
        !Object.hasOwn(fragments, 0) ||
        Object.keys(fragments).some((key) => key !== "0")
      )
        throw new Error();
      const fragment = exactRecord(fragments[0], [
        "kind",
        "authoritativeOwner",
        "projection",
      ]);
      if (
        fragment.kind !== "identity" ||
        fragment.authoritativeOwner !== "identity"
      )
        throw new Error();
      const projection = this.validateProjection(fragment.projection);
      const lifecycle = contextLifecycleState(revision.lifecycleState);
      const revisionNumber = contextRevisionNumber(revision.revisionNumber);
      const hasParent = Object.hasOwn(revision, "parentRevisionIdentity");
      if (
        (revisionNumber === 1 && hasParent) ||
        (revisionNumber > 1 && !hasParent)
      ) {
        throw new Error();
      }
      const reconstructed = {
        lineageIdentity: contextLineageIdentity(revision.lineageIdentity),
        revisionIdentity: contextRevisionIdentity(revision.revisionIdentity),
        revisionNumber,
        ...(hasParent
          ? {
              parentRevisionIdentity: contextRevisionIdentity(
                revision.parentRevisionIdentity,
              ),
            }
          : {}),
        creationMetadata: Object.freeze({
          createdAt: contextCreatedAt(metadata.createdAt),
          sourceCount: 1 as const,
          fragmentCount: 1 as const,
        }),
        lifecycleState: lifecycle,
        fragments: Object.freeze([
          Object.freeze({
            kind: "identity" as const,
            authoritativeOwner: "identity" as const,
            projection,
          }),
        ]) as readonly [
          Readonly<{
            kind: "identity";
            authoritativeOwner: "identity";
            projection: IdentityContextProjection;
          }>,
        ],
      };
      return Object.freeze(reconstructed);
    } catch {
      throw new InvalidActiveContextError();
    }
  }

  private validateProjection(value: unknown): IdentityContextProjection {
    const projection = exactRecord(
      value,
      ["state", "authoritativeOwner"],
      ["identityIdentifier"],
    );
    if (projection.authoritativeOwner !== "identity") throw new Error();
    if (projection.state === "anonymous") {
      if (Object.hasOwn(projection, "identityIdentifier")) throw new Error();
      return Object.freeze({
        state: "anonymous",
        authoritativeOwner: "identity",
      });
    }
    if (
      projection.state === "authenticated" &&
      Object.hasOwn(projection, "identityIdentifier")
    )
      return Object.freeze({
        state: "authenticated",
        authoritativeOwner: "identity",
        identityIdentifier: identityIdentifier(projection.identityIdentifier),
      });
    throw new Error();
  }

  private validateQuery(value: unknown): ReturnType<typeof reasoningQuery> {
    try {
      return reasoningQuery(value);
    } catch {
      throw new InvalidReasoningQueryError();
    }
  }

  private validateQueryField(
    source: Record<string, unknown>,
  ): ReturnType<typeof reasoningQuery> {
    try {
      return this.validateQuery(Reflect.get(source, "query"));
    } catch (error: unknown) {
      if (error instanceof InvalidReasoningQueryError) throw error;
      throw new InvalidReasoningQueryError();
    }
  }

  private validateMemoryReferences(
    top: Record<string, unknown>,
    supplied: boolean,
  ): readonly MemoryReference[] {
    if (!supplied) return Object.freeze([]);
    try {
      const values = validateArray(Reflect.get(top, "memoryReferences"));
      const identities = new Set<string>();
      const result = values.map((value) => {
        const item = exactRecord(value, [
          "memoryIdentity",
          "kind",
          "authoritativeCapability",
          "lifecycleState",
        ]);
        if (
          item.kind !== "episodic" ||
          item.authoritativeCapability !== "memory" ||
          item.lifecycleState !== "stored"
        )
          throw new Error();
        const reference = createMemoryReference(item.memoryIdentity);
        if (identities.has(reference.memoryIdentity)) throw new Error();
        identities.add(reference.memoryIdentity);
        return reference;
      });
      return Object.freeze(result);
    } catch {
      throw new InvalidMemoryReferenceError();
    }
  }

  private validateKnowledgeReferences(
    top: Record<string, unknown>,
    supplied: boolean,
  ): readonly KnowledgeReference[] {
    if (!supplied) return Object.freeze([]);
    try {
      const values = validateArray(Reflect.get(top, "knowledgeReferences"));
      const identities = new Set<string>();
      const result = values.map((value) => {
        const item = exactRecord(value, [
          "knowledgeIdentity",
          "validationState",
          "version",
          "currency",
          "authoritativeCapability",
        ]);
        if (
          item.validationState !== "accepted" ||
          item.currency !== "current" ||
          item.authoritativeCapability !== "knowledge"
        )
          throw new Error();
        const reference = createKnowledgeReference({
          knowledgeIdentity: item.knowledgeIdentity,
          version: item.version,
          currency: item.currency,
        });
        if (identities.has(reference.knowledgeIdentity)) throw new Error();
        identities.add(reference.knowledgeIdentity);
        return reference;
      });
      return Object.freeze(result);
    } catch {
      throw new InvalidKnowledgeReferenceError();
    }
  }

  private evaluateRules(request: NormalizedRequest): ReasoningOutcome {
    try {
      const identityState = request.context.fragments[0].projection.state;
      const memoryReferenceCount = request.memoryReferences.length;
      const knowledgeReferenceCount = request.knowledgeReferences.length;
      const basis =
        identityState === "anonymous"
          ? ([
              "anonymous-context",
              "The active context identifies an anonymous actor.",
              "Additional identity context may be required before further orchestration.",
              "request-more-context",
              "anonymous-identity",
            ] as const)
          : knowledgeReferenceCount > 0
            ? ([
                "knowledge-grounded-context",
                "The authenticated context includes accepted Knowledge references.",
                "Accepted Knowledge context is available for further orchestration.",
                "none",
                "authenticated-with-knowledge",
              ] as const)
            : memoryReferenceCount > 0
              ? ([
                  "experience-informed-context",
                  "The authenticated context includes Memory references but no Knowledge references.",
                  "Only retained experience references are available for further orchestration.",
                  "none",
                  "authenticated-with-memory-only",
                ] as const)
              : ([
                  "context-only",
                  "The authenticated context contains no supplied Memory or Knowledge references.",
                  "No Memory or Knowledge references were supplied for further orchestration.",
                  "request-more-context",
                  "authenticated-context-only",
                ] as const);
      const contextConsumptionReference = createContextConsumptionReference({
        lineageIdentity: request.context.lineageIdentity,
        revisionIdentity: request.context.revisionIdentity,
        revisionNumber: request.context.revisionNumber,
        lifecycleState: request.context.lifecycleState,
        authoritativeCapability: "context",
      });
      const explainability = createReasoningExplainabilitySummary({
        contextConsumptionReference,
        identityState,
        memoryReferenceCount,
        knowledgeReferenceCount,
        ruleCategory: basis[4],
      });
      return createReasoningOutcome({
        status: "completed",
        category: basis[0],
        conclusion: basis[1],
        response: basis[2],
        nextAction: basis[3],
        explainability,
      });
    } catch {
      throw new ReasoningRuleFailureError();
    }
  }
}

function isPlainRecord(value: unknown): value is Record<string, unknown> {
  if (typeof value !== "object" || value === null || Array.isArray(value))
    return false;
  const prototype = Object.getPrototypeOf(value) as unknown;
  return prototype === Object.prototype || prototype === null;
}
function exactRecord(
  value: unknown,
  required: readonly string[],
  optional: readonly string[] = [],
): Record<string, unknown> {
  if (!isPlainRecord(value)) throw new Error();
  if (!hasExactFields(value, required, optional)) throw new Error();
  return value;
}
function hasExactFields(
  value: Record<string, unknown>,
  required: readonly string[],
  optional: readonly string[] = [],
): boolean {
  const keys = Object.keys(value);
  return (
    required.every((key) => keys.includes(key)) &&
    keys.every((key) => required.includes(key) || optional.includes(key))
  );
}
function hasExactKeySet(
  keys: readonly string[],
  required: readonly string[],
  optional: readonly string[],
): boolean {
  return (
    required.every((key) => keys.includes(key)) &&
    keys.every((key) => required.includes(key) || optional.includes(key))
  );
}
function validateArray(value: unknown): unknown[] {
  if (!Array.isArray(value)) throw new Error();
  const length = value.length;
  if (length > REASONING_REFERENCE_MAX_COUNT) throw new Error();
  for (const key of Reflect.ownKeys(value)) {
    if (key === "length") continue;
    const descriptor = Reflect.getOwnPropertyDescriptor(value, key);
    if (descriptor?.enumerable !== true) continue;
    if (typeof key !== "string" || !/^(0|[1-9]\d*)$/.test(key))
      throw new Error();
    const index = Number(key);
    if (!Number.isSafeInteger(index) || index < 0 || index >= length)
      throw new Error();
  }
  if (
    Array.from({ length }, (_, index) => Object.hasOwn(value, index)).some(
      (present) => !present,
    )
  ) {
    throw new Error();
  }
  return value;
}

export type ReasoningEngineLifecycleState =
  "initialize" | "ready" | "running" | "stopped";
