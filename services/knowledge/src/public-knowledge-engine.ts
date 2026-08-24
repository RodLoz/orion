import {
  type EvaluateKnowledgeClaim,
  type GetKnowledge,
  type KnowledgeAcceptanceDecision,
  type KnowledgeConstructionValues,
  type KnowledgeProjectionRequest,
  type KnowledgeRecord,
  type KnowledgeReference,
  type KnowledgeStore,
  type ListKnowledgeReferences,
  type ProjectStructuredKnowledge,
  type RetrievedKnowledge,
  type StructuredKnowledgeProjection,
  type VerifyStructuredKnowledgeProjectionAuthority,
  type VerifyStructuredKnowledgeProjectionAuthorityRequest,
} from "@orion/core";

import {
  KnowledgeEngineRuntime,
  knowledgeEngineTestState,
  type KnowledgeEngineLifecycleState,
} from "./knowledge-engine.js";

export class KnowledgeEngine
  implements
    EvaluateKnowledgeClaim,
    GetKnowledge,
    ListKnowledgeReferences,
    ProjectStructuredKnowledge,
    VerifyStructuredKnowledgeProjectionAuthority
{
  readonly #runtime: KnowledgeEngineRuntime;

  public constructor(
    store: KnowledgeStore,
    construction: KnowledgeConstructionValues,
  ) {
    this.#runtime = new KnowledgeEngineRuntime(store, construction);
  }

  public get engineState(): KnowledgeEngineLifecycleState {
    return this.#runtime.engineState;
  }

  public initialize(): Promise<void> {
    return this.#runtime.initialize();
  }

  public start(): void {
    this.#runtime.start();
  }

  public stop(): Promise<void> {
    return this.#runtime.stop();
  }

  public recover(): Promise<void> {
    return this.#runtime.recover();
  }

  /** @internal Establishes an already confirmed Record for boundary tests. */
  public [knowledgeEngineTestState](value: unknown): KnowledgeRecord {
    return this.#runtime[knowledgeEngineTestState](value);
  }

  public evaluateKnowledgeClaim(
    request: unknown,
  ): Promise<KnowledgeAcceptanceDecision> {
    return this.#runtime.evaluateKnowledgeClaim(request);
  }

  public getKnowledge(request: unknown): RetrievedKnowledge {
    return this.#runtime.getKnowledge(request);
  }

  public listKnowledgeReferences(
    request: unknown,
  ): readonly KnowledgeReference[] {
    return this.#runtime.listKnowledgeReferences(request);
  }

  public projectStructuredKnowledge(
    request: KnowledgeProjectionRequest,
  ): StructuredKnowledgeProjection;
  public projectStructuredKnowledge(
    request: unknown,
  ): StructuredKnowledgeProjection;
  public projectStructuredKnowledge(
    request: unknown,
  ): StructuredKnowledgeProjection {
    return this.#runtime.projectStructuredKnowledge(request);
  }

  public verifyStructuredKnowledgeProjectionAuthority(
    request: VerifyStructuredKnowledgeProjectionAuthorityRequest,
  ): StructuredKnowledgeProjection;
  public verifyStructuredKnowledgeProjectionAuthority(
    request: unknown,
  ): StructuredKnowledgeProjection;
  public verifyStructuredKnowledgeProjectionAuthority(
    request: unknown,
  ): StructuredKnowledgeProjection {
    return this.#runtime.verifyStructuredKnowledgeProjectionAuthority(request);
  }
}
