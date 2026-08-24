import {
  InactiveContextError,
  InvalidActiveContextError,
  InvalidReasoningInputError,
  InvalidReasoningQueryError,
  InvalidReasoningStateError,
  ReasoningRuleFailureError,
  contextCreatedAt,
  contextLifecycleState,
  contextLineageIdentity,
  contextRevisionIdentity,
  contextRevisionNumber,
  createContextConsumptionReference,
  createReasoningExplainabilitySummary,
  createReasoningOutcome,
  createBoundedReasoningQuery,
  createReasoning3StructuredKnowledgeTuple,
  evaluateReasoningApplicability,
  evaluateReasoningSufficiency,
  identityIdentifier,
  reasoningQuery,
  type ActiveContextRevision,
  type EvaluateReasoning,
  type IdentityContextProjection,
  type KnowledgeContextFragment,
  type MemoryContextFragment,
  type StructuredKnowledgeContextFragment,
  type ReasoningOutcome,
  type VerifyReasoningOutcomeAuthority,
  type VerifyReasoningOutcomeAuthorityRequest,
  type VerifyActiveContextRevisionAuthority,
} from "@orion/core";
import { ReasoningAuthority } from "./reasoning-authority.js";

interface NormalizedRequest {
  readonly context: ActiveContextRevision;
  readonly query: ReturnType<typeof reasoningQuery>;
}

interface ValidatedRequestShape {
  readonly source: Record<string, unknown>;
}

export class ReasoningEngine
  implements EvaluateReasoning, VerifyReasoningOutcomeAuthority
{
  #state: ReasoningEngineLifecycleState = "initialize";
  readonly #authority = new ReasoningAuthority();
  private readonly contextAuthority:
    VerifyActiveContextRevisionAuthority | undefined;
  public constructor(
    ...args: [contextAuthority?: VerifyActiveContextRevisionAuthority]
  ) {
    this.contextAuthority = args[0];
  }
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
    const suppliedContext = this.captureContextField(top.source);
    const context = this.validateContextField(suppliedContext);
    if (context.lifecycleState !== "active") throw new InactiveContextError();
    const query = this.validateQueryField(top.source);
    const outcome = this.evaluateRules(Object.freeze({ context, query }));
    this.#authority.register(outcome, suppliedContext);
    return outcome;
  }

  public evaluateReasoning3(request: unknown): ReasoningOutcome {
    if (this.#state !== "running") throw new InvalidReasoningStateError();
    const top = this.validateTopLevel(request);
    const suppliedContext = this.captureContextField(top.source);
    this.verifyReasoning3ContextAuthority(suppliedContext);
    const context = this.validateContextField(suppliedContext, true);
    if (context.lifecycleState !== "active") throw new InactiveContextError();
    const structured = this.validateStructuredProfile(context);
    const query = this.validateBoundedQueryField(top.source);
    let tuple: ReturnType<typeof createReasoning3StructuredKnowledgeTuple>;
    try {
      tuple = createReasoning3StructuredKnowledgeTuple({
        subjectKey: structured.projection.semanticValue.subjectKey,
        predicateKey: structured.projection.semanticValue.predicateKey,
        textualScalar: structured.projection.semanticValue.textualScalar,
      });
    } catch {
      throw new InvalidReasoningInputError();
    }
    const applicability = evaluateReasoningApplicability(query, tuple);
    const outcome =
      applicability === "NOT_APPLICABLE"
        ? this.createReasoning3Outcome(
            context,
            "knowledge-not-applicable",
            "authenticated-knowledge-not-applicable",
            "request-more-context",
            "The bounded Knowledge tuple does not satisfy the Reasoning query.",
            "Additional context may be required before another bounded evaluation.",
          )
        : (() => {
            evaluateReasoningSufficiency(query, tuple, applicability);
            return this.createReasoning3Outcome(
              context,
              "knowledge-grounded-success",
              "authenticated-knowledge-applicable-sufficient",
              "none",
              "The bounded Knowledge tuple satisfies the Reasoning query.",
              "The grounded result is available for advisory planning.",
            );
          })();
    this.#authority.register(outcome, suppliedContext);
    return outcome;
  }

  private verifyReasoning3ContextAuthority(
    context: ActiveContextRevision,
  ): void {
    if (this.contextAuthority === undefined)
      throw new InvalidActiveContextError();
    this.contextAuthority.verifyActiveContextRevisionAuthority({
      intent: "verify-active-context-revision-authority",
      candidate: context,
      expectedLineageIdentity: context.lineageIdentity,
      expectedRevisionIdentity: context.revisionIdentity,
      expectedRevisionNumber: context.revisionNumber,
    });
  }

  public verifyReasoningOutcomeAuthority(
    request: VerifyReasoningOutcomeAuthorityRequest,
  ): ReasoningOutcome;
  public verifyReasoningOutcomeAuthority(request: unknown): ReasoningOutcome;
  public verifyReasoningOutcomeAuthority(request: unknown): ReasoningOutcome {
    return this.#authority.verifyReasoningOutcomeAuthority(request);
  }

  private validateTopLevel(value: unknown): ValidatedRequestShape {
    try {
      if (!isPlainRecord(value)) throw new Error();
      const keys = Object.keys(value);
      if (!hasExactKeySet(keys, ["intent", "activeContextRevision", "query"]))
        throw new Error();
      if (Reflect.get(value, "intent") !== "evaluate") throw new Error();
      return Object.freeze({
        source: value,
      });
    } catch {
      throw new InvalidReasoningInputError();
    }
  }

  private captureContextField(
    source: Record<string, unknown>,
  ): ActiveContextRevision {
    try {
      return Reflect.get(
        source,
        "activeContextRevision",
      ) as ActiveContextRevision;
    } catch {
      throw new InvalidActiveContextError();
    }
  }

  private validateContextField(
    value: unknown,
    allowStructured = false,
  ): ActiveContextRevision {
    try {
      return this.validateContext(value, allowStructured);
    } catch (error: unknown) {
      if (error instanceof InvalidActiveContextError) throw error;
      throw new InvalidActiveContextError();
    }
  }

  private validateContext(
    value: unknown,
    allowStructured = false,
  ): ActiveContextRevision {
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
      const isIdentityOnly =
        metadata.sourceCount === 1 && metadata.fragmentCount === 1;
      const isSourceAware =
        metadata.sourceCount === 2 && metadata.fragmentCount === 2;
      if (!isIdentityOnly && !isSourceAware) throw new Error();
      const fragmentCount = isSourceAware ? 2 : 1;
      const fragments = revision.fragments;
      if (
        !Array.isArray(fragments) ||
        fragments.length !== fragmentCount ||
        Array.from({ length: fragmentCount }, (_, index) => index).some(
          (index) => !Object.hasOwn(fragments, index),
        ) ||
        Object.keys(fragments).some(
          (key) => !/^\d+$/.test(key) || Number(key) >= fragmentCount,
        )
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
      const sourceFragment = isSourceAware
        ? this.captureOpaqueSourceFragment(fragments[1], allowStructured)
        : undefined;
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
        creationMetadata: Object.freeze(
          isSourceAware
            ? {
                createdAt: contextCreatedAt(metadata.createdAt),
                sourceCount: 2 as const,
                fragmentCount: 2 as const,
              }
            : {
                createdAt: contextCreatedAt(metadata.createdAt),
                sourceCount: 1 as const,
                fragmentCount: 1 as const,
              },
        ),
        lifecycleState: lifecycle,
        fragments: Object.freeze([
          Object.freeze({
            kind: "identity" as const,
            authoritativeOwner: "identity" as const,
            projection,
          }),
          ...(sourceFragment === undefined ? [] : [sourceFragment]),
        ]),
      };
      return Object.freeze(reconstructed) as ActiveContextRevision;
    } catch {
      throw new InvalidActiveContextError();
    }
  }

  private captureOpaqueSourceFragment(
    value: unknown,
    allowStructured = false,
  ):
    | KnowledgeContextFragment
    | MemoryContextFragment
    | StructuredKnowledgeContextFragment {
    const fragment = exactRecord(value, [
      "kind",
      "authoritativeOwner",
      "projection",
    ]);
    if (
      allowStructured &&
      fragment.kind === "structured-knowledge" &&
      fragment.authoritativeOwner === "knowledge"
    )
      return freezeClone(
        fragment,
      ) as unknown as StructuredKnowledgeContextFragment;
    if (!(
      (fragment.kind === "knowledge" &&
        fragment.authoritativeOwner === "knowledge") ||
      (fragment.kind === "memory" && fragment.authoritativeOwner === "memory")
    ))
      throw new Error();
    return freezeClone(fragment) as unknown as
      KnowledgeContextFragment | MemoryContextFragment;
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

  private validateBoundedQueryField(
    source: Record<string, unknown>,
  ): ReturnType<typeof createBoundedReasoningQuery> {
    try {
      return createBoundedReasoningQuery(Reflect.get(source, "query"));
    } catch {
      throw new InvalidReasoningInputError();
    }
  }

  private validateStructuredProfile(
    context: ActiveContextRevision,
  ): StructuredKnowledgeContextFragment {
    const identity = context.fragments[0].projection;
    const fragment = context.fragments[1];
    if (
      identity.state !== "authenticated" ||
      fragment === undefined ||
      fragment.kind !== "structured-knowledge" ||
      context.fragments.length !== 2
    )
      throw new InvalidReasoningInputError();
    return fragment;
  }

  private createReasoning3Outcome(
    context: ActiveContextRevision,
    category: "knowledge-grounded-success" | "knowledge-not-applicable",
    ruleCategory:
      | "authenticated-knowledge-applicable-sufficient"
      | "authenticated-knowledge-not-applicable",
    nextAction: "none" | "request-more-context",
    conclusion: string,
    response: string,
  ): ReasoningOutcome {
    const contextConsumptionReference = createContextConsumptionReference({
      lineageIdentity: context.lineageIdentity,
      revisionIdentity: context.revisionIdentity,
      revisionNumber: context.revisionNumber,
      lifecycleState: context.lifecycleState,
      authoritativeCapability: "context",
    });
    return createReasoningOutcome({
      status: "completed",
      category,
      conclusion,
      response,
      nextAction,
      explainability: createReasoningExplainabilitySummary({
        contextConsumptionReference,
        identityState: "authenticated",
        ruleCategory,
      }),
    });
  }

  private evaluateRules(request: NormalizedRequest): ReasoningOutcome {
    try {
      const identityState = request.context.fragments[0].projection.state;
      const basis =
        identityState === "anonymous"
          ? ([
              "anonymous-context",
              "The active context identifies an anonymous actor.",
              "Additional identity context may be required before further orchestration.",
              "request-more-context",
              "anonymous-identity",
            ] as const)
          : ([
              "context-only",
              "The authenticated actor is represented by the active context.",
              "Additional authoritative context may be required before further orchestration.",
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
): boolean {
  return (
    required.every((key) => keys.includes(key)) &&
    keys.every((key) => required.includes(key))
  );
}
function freezeClone<T>(value: T): T {
  if (typeof value !== "object" || value === null) return value;
  if (Array.isArray(value))
    return Object.freeze(value.map((item) => freezeClone(item))) as T;
  return Object.freeze(
    Object.fromEntries(
      Object.entries(value).map(([key, nested]) => [key, freezeClone(nested)]),
    ),
  ) as T;
}

export type ReasoningEngineLifecycleState =
  "initialize" | "ready" | "running" | "stopped";
