import {
  createMemoryReference,
  type MemoryIdentity,
  type MemoryRecord,
  type MemoryStore,
  type MemoryStoreDeleteResult,
  type MemoryStoreGetResult,
  type MemoryStoreListResult,
  type MemoryStorePutResult,
} from "@orion/core";

type StoreOperation = "put" | "get" | "list" | "delete";

export class InMemoryMemoryStore implements MemoryStore {
  readonly #records = new Map<MemoryIdentity, MemoryRecord>();
  readonly #nextResults = new Map<StoreOperation, unknown>();
  #available = true;

  public setAvailable(available: boolean): void {
    this.#available = available;
  }

  public simulateNextResult(operation: StoreOperation, result: unknown): void {
    this.#nextResults.set(operation, result);
  }

  public put(record: MemoryRecord): MemoryStorePutResult {
    const simulated = this.takeSimulated("put");
    if (simulated.present) return simulated.value as MemoryStorePutResult;
    if (!this.#available) return Object.freeze({ status: "unavailable" });
    if (this.#records.has(record.memoryIdentity)) {
      return Object.freeze({ status: "duplicate" });
    }
    this.#records.set(record.memoryIdentity, record);
    return Object.freeze({
      status: "stored",
      memoryIdentity: record.memoryIdentity,
    });
  }

  public get(memoryIdentity: MemoryIdentity): MemoryStoreGetResult {
    const simulated = this.takeSimulated("get");
    if (simulated.present) return simulated.value as MemoryStoreGetResult;
    if (!this.#available) return Object.freeze({ status: "unavailable" });
    const record = this.#records.get(memoryIdentity);
    return record === undefined
      ? Object.freeze({ status: "not-found" })
      : Object.freeze({ status: "found", record });
  }

  public list(limit: number): MemoryStoreListResult {
    const simulated = this.takeSimulated("list");
    if (simulated.present) return simulated.value as MemoryStoreListResult;
    if (!this.#available) return Object.freeze({ status: "unavailable" });
    const references = [...this.#records.values()]
      .slice(0, limit)
      .map((record) => createMemoryReference(record.memoryIdentity));
    return Object.freeze({
      status: "listed",
      references: Object.freeze(references),
    });
  }

  public delete(memoryIdentity: MemoryIdentity): MemoryStoreDeleteResult {
    const simulated = this.takeSimulated("delete");
    if (simulated.present) return simulated.value as MemoryStoreDeleteResult;
    if (!this.#available) return Object.freeze({ status: "unavailable" });
    if (!this.#records.delete(memoryIdentity)) {
      return Object.freeze({ status: "not-found" });
    }
    return Object.freeze({ status: "deleted", memoryIdentity });
  }

  public retainedCount(): number {
    return this.#records.size;
  }

  private takeSimulated(
    operation: StoreOperation,
  ):
    | { readonly present: false }
    | { readonly present: true; readonly value: unknown } {
    if (!this.#nextResults.has(operation)) return { present: false };
    const value = this.#nextResults.get(operation);
    this.#nextResults.delete(operation);
    return { present: true, value };
  }
}
