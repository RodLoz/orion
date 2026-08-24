import {
  createKnowledgeLifecycleSnapshot,
  createKnowledgeLifecycleSnapshotEntry,
  createPutIndependentAcceptedKnowledgeRequest,
  createKnowledgeRecord,
  createSupersedeCurrentKnowledgeRequest,
  knowledgeAcceptanceOrder,
  type KnowledgeIdentity,
  type KnowledgeLifecycleSnapshotResult,
  type KnowledgeLifecycleSnapshotEntry,
  type KnowledgeRecord,
  type KnowledgeStore,
  type PutIndependentAcceptedKnowledgeRequest,
  type PutIndependentAcceptedKnowledgeResult,
  type SupersedeCurrentKnowledgeRequest,
  type SupersedeCurrentKnowledgeResult,
  type KnowledgeStoreGetResult,
  type KnowledgeStorePutResult,
} from "@orion/core";

type KnowledgeStoreOperation = "put" | "get";

export class InMemoryKnowledgeStore implements KnowledgeStore {
  readonly #records = new Map<KnowledgeIdentity, KnowledgeRecord>();
  readonly #lifecycle = new Map<
    KnowledgeIdentity,
    KnowledgeLifecycleSnapshotEntry
  >();
  readonly #lifecycleOrder: KnowledgeIdentity[] = [];
  #nextAcceptanceOrder = 1;
  readonly #nextResults = new Map<KnowledgeStoreOperation, unknown>();
  #available = true;
  #writeThenPutResult: unknown = undefined;

  public async put(record: KnowledgeRecord): Promise<KnowledgeStorePutResult> {
    if (!this.#available) return Object.freeze({ status: "unavailable" });
    if (this.#writeThenPutResult !== undefined) {
      const result = this.#writeThenPutResult;
      this.#writeThenPutResult = undefined;
      this.#records.set(
        record.knowledgeIdentity,
        createKnowledgeRecord(record),
      );
      return result as KnowledgeStorePutResult;
    }
    const override = this.takeNextResult("put");
    if (override.present) return override.value as KnowledgeStorePutResult;
    if (this.#records.has(record.knowledgeIdentity)) {
      return Object.freeze({ status: "duplicate" });
    }
    const stored = createKnowledgeRecord(record);
    this.#records.set(stored.knowledgeIdentity, stored);
    return Object.freeze({
      status: "stored",
      knowledgeIdentity: stored.knowledgeIdentity,
    });
  }

  public async get(
    identity: KnowledgeIdentity,
  ): Promise<KnowledgeStoreGetResult> {
    if (!this.#available) return Object.freeze({ status: "unavailable" });
    const override = this.takeNextResult("get");
    if (override.present) return override.value as KnowledgeStoreGetResult;
    const record = this.#records.get(identity);
    return record === undefined
      ? Object.freeze({ status: "not-found" })
      : Object.freeze({
          status: "found",
          record: createKnowledgeRecord(record),
        });
  }

  public async putIndependentAcceptedKnowledge(
    request: PutIndependentAcceptedKnowledgeRequest,
  ): Promise<PutIndependentAcceptedKnowledgeResult> {
    return this.putIndependentAcceptedKnowledgeNow(request);
  }

  private putIndependentAcceptedKnowledgeNow(
    request: PutIndependentAcceptedKnowledgeRequest,
  ): PutIndependentAcceptedKnowledgeResult {
    if (!this.#available) return Object.freeze({ status: "unavailable" });
    let accepted: PutIndependentAcceptedKnowledgeRequest;
    try {
      accepted = createPutIndependentAcceptedKnowledgeRequest(request);
    } catch {
      return Object.freeze({ status: "invalid-state" });
    }
    if (accepted.record.supersedesKnowledgeIdentity !== undefined) {
      return Object.freeze({ status: "invalid-state" });
    }
    const identity = accepted.record.knowledgeIdentity;
    if (this.#records.has(identity))
      return Object.freeze({ status: "duplicate" });
    const acceptanceOrder = this.nextAcceptanceOrder();
    const entry = createKnowledgeLifecycleSnapshotEntry({
      knowledgeIdentity: identity,
      version: accepted.record.version,
      standing: "current",
      acceptanceOrder,
    });
    this.#records.set(identity, accepted.record);
    this.#lifecycle.set(identity, entry);
    this.#lifecycleOrder.push(identity);
    return Object.freeze({
      status: "stored",
      knowledgeIdentity: identity,
      acceptanceOrder,
    });
  }

  public async supersedeCurrentKnowledge(
    request: SupersedeCurrentKnowledgeRequest,
  ): Promise<SupersedeCurrentKnowledgeResult> {
    return this.supersedeCurrentKnowledgeNow(request);
  }

  private supersedeCurrentKnowledgeNow(
    request: SupersedeCurrentKnowledgeRequest,
  ): SupersedeCurrentKnowledgeResult {
    if (!this.#available) return Object.freeze({ status: "unavailable" });
    let supersession: SupersedeCurrentKnowledgeRequest;
    try {
      supersession = createSupersedeCurrentKnowledgeRequest(request);
    } catch {
      return Object.freeze({ status: "invalid-state" });
    }
    const predecessor = this.#lifecycle.get(
      supersession.expectedPredecessorKnowledgeIdentity,
    );
    if (predecessor === undefined) {
      return Object.freeze({ status: "predecessor-not-found" });
    }
    if (
      predecessor.standing !== "current" ||
      predecessor.version !== supersession.expectedPredecessorVersion
    ) {
      return Object.freeze({ status: "stale-predecessor" });
    }
    const successorIdentity = supersession.successor.knowledgeIdentity;
    if (this.#records.has(successorIdentity)) {
      return Object.freeze({ status: "duplicate" });
    }
    const acceptanceOrder = this.nextAcceptanceOrder();
    const supersededPredecessor = createKnowledgeLifecycleSnapshotEntry({
      knowledgeIdentity: predecessor.knowledgeIdentity,
      version: predecessor.version,
      ...(predecessor.predecessorKnowledgeIdentity === undefined
        ? {}
        : {
            predecessorKnowledgeIdentity:
              predecessor.predecessorKnowledgeIdentity,
          }),
      standing: "superseded",
      acceptanceOrder: predecessor.acceptanceOrder,
    });
    const currentSuccessor = createKnowledgeLifecycleSnapshotEntry({
      knowledgeIdentity: successorIdentity,
      version: supersession.successor.version,
      predecessorKnowledgeIdentity: predecessor.knowledgeIdentity,
      standing: "current",
      acceptanceOrder,
    });
    this.#records.set(successorIdentity, supersession.successor);
    this.#lifecycle.set(predecessor.knowledgeIdentity, supersededPredecessor);
    this.#lifecycle.set(successorIdentity, currentSuccessor);
    this.#lifecycleOrder.push(successorIdentity);
    return Object.freeze({
      status: "superseded",
      predecessorKnowledgeIdentity: predecessor.knowledgeIdentity,
      successorKnowledgeIdentity: successorIdentity,
      acceptanceOrder,
    });
  }

  public async loadKnowledgeLifecycleSnapshot(): Promise<KnowledgeLifecycleSnapshotResult> {
    if (!this.#available) return Object.freeze({ status: "unavailable" });
    try {
      return Object.freeze({
        status: "loaded",
        snapshot: createKnowledgeLifecycleSnapshot({
          entries: this.#lifecycleOrder.map((identity) =>
            this.#lifecycle.get(identity),
          ),
        }),
      });
    } catch {
      return Object.freeze({ status: "invalid-state" });
    }
  }

  public setAvailable(available: boolean): void {
    this.#available = available;
  }

  public setNextResult(
    operation: KnowledgeStoreOperation,
    result: unknown,
  ): void {
    this.#nextResults.set(operation, result);
  }

  public setWriteThenPutResult(result: unknown): void {
    this.#writeThenPutResult = result;
  }

  public inspectRecordCount(): number {
    return this.#records.size;
  }

  private nextAcceptanceOrder() {
    return knowledgeAcceptanceOrder(
      `in-memory-acceptance-${this.#nextAcceptanceOrder++}`,
    );
  }

  private takeNextResult(
    operation: KnowledgeStoreOperation,
  ):
    Readonly<{ present: false }> | Readonly<{ present: true; value: unknown }> {
    if (!this.#nextResults.has(operation)) return { present: false };
    const value = this.#nextResults.get(operation);
    this.#nextResults.delete(operation);
    return { present: true, value };
  }
}
