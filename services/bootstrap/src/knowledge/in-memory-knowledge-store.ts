import {
  createKnowledgeRecord,
  type KnowledgeIdentity,
  type KnowledgeRecord,
  type KnowledgeStore,
  type KnowledgeStoreGetResult,
  type KnowledgeStorePutResult,
} from "@orion/core";

type KnowledgeStoreOperation = "put" | "get";

export class InMemoryKnowledgeStore implements KnowledgeStore {
  readonly #records = new Map<KnowledgeIdentity, KnowledgeRecord>();
  readonly #nextResults = new Map<KnowledgeStoreOperation, unknown>();
  #available = true;
  #writeThenPutResult: unknown = undefined;

  public put(record: KnowledgeRecord): KnowledgeStorePutResult {
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

  public get(identity: KnowledgeIdentity): KnowledgeStoreGetResult {
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
