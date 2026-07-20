import {
  DuplicateMemoryIdentityError,
  InvalidMemoryIdentityError,
  InvalidMemoryInputError,
  InvalidMemoryStateError,
  InvalidRetentionIntentError,
  MemoryNotFoundError,
  MemoryStoreUnavailableError,
  createMemoryProvenance,
  createMemoryRecord,
  createMemoryReference,
  createMemoryRetentionIntent,
  createMemoryRetrievalReceipt,
  memoryContent,
  memoryIdentity,
  memoryOriginatingCapability,
  memoryRetentionReason,
  memoryRetrievalPurpose,
  memorySourceReference,
  memoryTimestamp,
  type ForgetMemory,
  type ForgetMemoryResult,
  type GetMemory,
  type ListRetainedMemoryReferences,
  type MemoryConstructionValues,
  type MemoryIdentity,
  type MemoryOccurrenceEvidence,
  type MemoryProvenance,
  type MemoryRecord,
  type MemoryReference,
  type MemoryRetrievalReceipt,
  type MemorySourceType,
  type MemoryStore,
  type RetainMemory,
  type RetrievedMemory,
} from "@orion/core";

const PUBLIC_FAILURES = [
  InvalidMemoryInputError,
  InvalidMemoryIdentityError,
  InvalidRetentionIntentError,
  DuplicateMemoryIdentityError,
  MemoryNotFoundError,
  MemoryStoreUnavailableError,
  InvalidMemoryStateError,
] as const;

function isPublicFailure(value: unknown): value is Error {
  return PUBLIC_FAILURES.some((Failure) => value instanceof Failure);
}

function isPlainRecord(value: unknown): value is Record<string, unknown> {
  if (typeof value !== "object" || value === null || Array.isArray(value)) {
    return false;
  }
  const prototype = Object.getPrototypeOf(value) as unknown;
  return prototype === Object.prototype || prototype === null;
}

function hasExactFields(
  value: Record<string, unknown>,
  required: readonly string[],
  optional: readonly string[] = [],
): boolean {
  const keys = Object.keys(value);
  return (
    required.every((field) => keys.includes(field)) &&
    keys.every(
      (field) => required.includes(field) || optional.includes(field),
    ) &&
    keys.length >= required.length &&
    keys.length <= required.length + optional.length
  );
}

export class MemoryEngine
  implements RetainMemory, GetMemory, ListRetainedMemoryReferences, ForgetMemory
{
  readonly #retainedIdentities = new Set<MemoryIdentity>();
  readonly #latestReceipts = new Map<MemoryIdentity, MemoryRetrievalReceipt>();
  #engineState: MemoryEngineLifecycleState = "initialize";

  public constructor(
    private readonly store: MemoryStore,
    private readonly construction: MemoryConstructionValues,
  ) {
    if (store === null || store === undefined || construction == null) {
      throw new MemoryEngineInitializationError();
    }
  }

  public get engineState(): MemoryEngineLifecycleState {
    return this.#engineState;
  }

  public initialize(): void {
    if (this.#engineState !== "initialize") {
      throw new MemoryEngineInitializationError();
    }
    try {
      if (
        typeof this.store.put !== "function" ||
        typeof this.store.get !== "function" ||
        typeof this.store.list !== "function" ||
        typeof this.store.delete !== "function" ||
        typeof this.construction.nextMemoryIdentity !== "function" ||
        typeof this.construction.nextRetainedAt !== "function" ||
        typeof this.construction.nextRetrievedAt !== "function"
      ) {
        throw new Error();
      }
    } catch {
      throw new MemoryEngineInitializationError();
    }
    this.#engineState = "ready";
  }

  public start(): void {
    if (this.#engineState !== "ready") {
      throw new MemoryEngineInitializationError();
    }
    this.#engineState = "running";
  }

  public stop(): void {
    if (this.#engineState !== "running") {
      throw new MemoryEngineInitializationError();
    }
    this.#engineState = "stopped";
  }

  public retainMemory(request: unknown): MemoryRecord {
    this.requireRunning();
    try {
      const candidate = this.validateRetainRequest(request);
      const allocatedIdentity = this.nextIdentity();
      if (this.#retainedIdentities.has(allocatedIdentity)) {
        throw new DuplicateMemoryIdentityError();
      }
      const record = createMemoryRecord({
        memoryIdentity: allocatedIdentity,
        content: candidate.content,
        retentionIntent: candidate.retentionIntent,
        provenance: candidate.provenance,
        retainedAt: this.nextRetainedAt(),
      });
      const result = this.callStore(() => this.store.put(record));
      this.validatePutResult(result, allocatedIdentity);
      this.#retainedIdentities.add(allocatedIdentity);
      return record;
    } catch (error: unknown) {
      if (isPublicFailure(error)) throw error;
      throw new InvalidMemoryInputError();
    }
  }

  public getMemory(request: unknown): RetrievedMemory {
    this.requireRunning();
    try {
      if (
        !isPlainRecord(request) ||
        !hasExactFields(request, ["memoryIdentity", "purpose"])
      ) {
        throw new InvalidMemoryInputError();
      }
      const identity = this.callerIdentity(request.memoryIdentity);
      if (!this.#retainedIdentities.has(identity)) {
        throw new MemoryNotFoundError();
      }
      let purpose;
      try {
        purpose = memoryRetrievalPurpose(request.purpose);
      } catch {
        throw new InvalidMemoryInputError();
      }
      const result = this.callStore(() => this.store.get(identity));
      const record = this.validateGetResult(result, identity);
      const receipt = createMemoryRetrievalReceipt({
        memoryReference: createMemoryReference(record.memoryIdentity),
        retrievedAt: this.nextRetrievedAt(),
        purpose,
      });
      this.validateReceipt(receipt, record.memoryIdentity);
      this.#latestReceipts.set(identity, receipt);
      return Object.freeze({ memory: record, receipt });
    } catch (error: unknown) {
      if (isPublicFailure(error)) throw error;
      throw new InvalidMemoryInputError();
    }
  }

  public listRetainedMemoryReferences(
    request: unknown,
  ): readonly MemoryReference[] {
    this.requireRunning();
    try {
      if (!isPlainRecord(request) || !hasExactFields(request, [], ["limit"])) {
        throw new InvalidMemoryInputError();
      }
      const limitValue = Object.hasOwn(request, "limit") ? request.limit : 50;
      if (
        typeof limitValue !== "number" ||
        !Number.isInteger(limitValue) ||
        limitValue < 1 ||
        limitValue > 100
      ) {
        throw new InvalidMemoryInputError();
      }
      const result = this.callStore(() => this.store.list(limitValue));
      const references = this.validateListResult(result, limitValue).filter(
        (reference) => this.#retainedIdentities.has(reference.memoryIdentity),
      );
      return Object.freeze(references);
    } catch (error: unknown) {
      if (isPublicFailure(error)) throw error;
      throw new InvalidMemoryInputError();
    }
  }

  public forgetMemory(request: unknown): ForgetMemoryResult {
    this.requireRunning();
    try {
      if (
        !isPlainRecord(request) ||
        !hasExactFields(request, ["intent", "memoryIdentity"]) ||
        request.intent !== "forget"
      ) {
        throw new InvalidMemoryInputError();
      }
      const identity = this.callerIdentity(request.memoryIdentity);
      if (!this.#retainedIdentities.has(identity)) {
        throw new MemoryNotFoundError();
      }
      const result = this.callStore(() => this.store.delete(identity));
      this.validateDeleteResult(result, identity);
      this.#retainedIdentities.delete(identity);
      this.#latestReceipts.delete(identity);
      return Object.freeze({
        outcome: "deleted",
        memoryReference: createMemoryReference(identity),
      });
    } catch (error: unknown) {
      if (isPublicFailure(error)) throw error;
      throw new InvalidMemoryInputError();
    }
  }

  public lastUsedAt(value: unknown) {
    this.requireRunning();
    const identity = this.callerIdentity(value);
    return this.#latestReceipts.get(identity)?.retrievedAt;
  }

  private validateRetainRequest(request: unknown) {
    if (!isPlainRecord(request)) throw new InvalidMemoryInputError();
    if (
      !hasExactFields(request, [
        "intent",
        "kind",
        "content",
        "retentionReason",
        "provenance",
      ]) ||
      request.intent !== "retain" ||
      request.kind !== "episodic"
    ) {
      throw new InvalidRetentionIntentError();
    }
    let reason;
    try {
      reason = memoryRetentionReason(request.retentionReason);
    } catch {
      throw new InvalidRetentionIntentError();
    }
    let content;
    try {
      content = memoryContent(request.content);
    } catch {
      throw new InvalidMemoryInputError();
    }
    return Object.freeze({
      content,
      retentionIntent: createMemoryRetentionIntent(reason),
      provenance: this.validateProvenance(request.provenance),
    });
  }

  private validateProvenance(value: unknown): MemoryProvenance {
    try {
      if (!isPlainRecord(value)) throw new Error();
      if (
        !hasExactFields(
          value,
          [
            "sourceType",
            "originatingCapability",
            "observedAt",
            "occurrenceEvidence",
          ],
          ["sourceReference"],
        )
      )
        throw new Error();
      const sourceType = value.sourceType;
      const occurrenceEvidence = value.occurrenceEvidence;
      if (
        (sourceType !== "interaction" && sourceType !== "capability-outcome") ||
        (occurrenceEvidence !== "reported" && occurrenceEvidence !== "observed")
      )
        throw new Error();
      return createMemoryProvenance({
        sourceType: sourceType as MemorySourceType,
        originatingCapability: memoryOriginatingCapability(
          value.originatingCapability,
        ),
        observedAt: memoryTimestamp(value.observedAt),
        occurrenceEvidence: occurrenceEvidence as MemoryOccurrenceEvidence,
        ...(Object.hasOwn(value, "sourceReference")
          ? { sourceReference: memorySourceReference(value.sourceReference) }
          : {}),
      });
    } catch {
      throw new InvalidMemoryInputError();
    }
  }

  private validateStoredRecord(value: unknown): MemoryRecord {
    try {
      if (
        !isPlainRecord(value) ||
        !hasExactFields(value, [
          "memoryIdentity",
          "kind",
          "content",
          "retentionIntent",
          "provenance",
          "retainedAt",
          "lifecycleState",
        ]) ||
        value.kind !== "episodic" ||
        value.lifecycleState !== "stored" ||
        !isPlainRecord(value.retentionIntent) ||
        !hasExactFields(value.retentionIntent, ["operation", "reason"]) ||
        value.retentionIntent.operation !== "retain"
      )
        throw new Error();
      const record = createMemoryRecord({
        memoryIdentity: memoryIdentity(value.memoryIdentity),
        content: memoryContent(value.content),
        retentionIntent: createMemoryRetentionIntent(
          memoryRetentionReason(value.retentionIntent.reason),
        ),
        provenance: this.validateProvenance(value.provenance),
        retainedAt: memoryTimestamp(value.retainedAt),
      });
      if (!Object.isFrozen(record) || !Object.isFrozen(record.provenance))
        throw new Error();
      return record;
    } catch (error: unknown) {
      if (error instanceof InvalidMemoryInputError)
        throw new InvalidMemoryStateError();
      throw new InvalidMemoryStateError();
    }
  }

  private validatePutResult(result: unknown, identity: MemoryIdentity): void {
    this.inspectStoreResult(() => {
      if (!isPlainRecord(result) || typeof result.status !== "string") {
        throw new InvalidMemoryStateError();
      }
      if (
        result.status === "unavailable" &&
        hasExactFields(result, ["status"])
      ) {
        throw new MemoryStoreUnavailableError();
      }
      if (result.status === "duplicate" && hasExactFields(result, ["status"])) {
        throw new DuplicateMemoryIdentityError();
      }
      if (
        result.status !== "stored" ||
        !hasExactFields(result, ["status", "memoryIdentity"])
      ) {
        throw new InvalidMemoryStateError();
      }
      if (memoryIdentity(result.memoryIdentity) !== identity) {
        throw new InvalidMemoryStateError();
      }
    });
  }

  private validateGetResult(
    result: unknown,
    identity: MemoryIdentity,
  ): MemoryRecord {
    return this.inspectStoreResult(() => {
      if (!isPlainRecord(result) || typeof result.status !== "string") {
        throw new InvalidMemoryStateError();
      }
      if (
        result.status === "unavailable" &&
        hasExactFields(result, ["status"])
      ) {
        throw new MemoryStoreUnavailableError();
      }
      if (result.status === "not-found" && hasExactFields(result, ["status"])) {
        throw new MemoryNotFoundError();
      }
      if (
        result.status !== "found" ||
        !hasExactFields(result, ["status", "record"])
      ) {
        throw new InvalidMemoryStateError();
      }
      const record = this.validateStoredRecord(result.record);
      if (record.memoryIdentity !== identity) {
        throw new InvalidMemoryStateError();
      }
      return record;
    });
  }

  private validateListResult(
    result: unknown,
    limit: number,
  ): readonly MemoryReference[] {
    return this.inspectStoreResult(() => {
      if (!isPlainRecord(result) || typeof result.status !== "string") {
        throw new InvalidMemoryStateError();
      }
      if (
        result.status === "unavailable" &&
        hasExactFields(result, ["status"])
      ) {
        throw new MemoryStoreUnavailableError();
      }
      if (
        result.status !== "listed" ||
        !hasExactFields(result, ["status", "references"]) ||
        !Array.isArray(result.references) ||
        result.references.length > limit
      ) {
        throw new InvalidMemoryStateError();
      }
      return result.references.map((value) => this.validateReference(value));
    });
  }

  private validateDeleteResult(
    result: unknown,
    identity: MemoryIdentity,
  ): void {
    this.inspectStoreResult(() => {
      if (!isPlainRecord(result) || typeof result.status !== "string") {
        throw new InvalidMemoryStateError();
      }
      if (
        result.status === "unavailable" &&
        hasExactFields(result, ["status"])
      ) {
        throw new MemoryStoreUnavailableError();
      }
      if (result.status === "not-found" && hasExactFields(result, ["status"])) {
        throw new MemoryNotFoundError();
      }
      if (
        result.status !== "deleted" ||
        !hasExactFields(result, ["status", "memoryIdentity"]) ||
        memoryIdentity(result.memoryIdentity) !== identity
      ) {
        throw new InvalidMemoryStateError();
      }
    });
  }

  private validateReference(value: unknown): MemoryReference {
    try {
      if (
        !isPlainRecord(value) ||
        !hasExactFields(value, [
          "memoryIdentity",
          "kind",
          "authoritativeCapability",
          "lifecycleState",
        ]) ||
        value.kind !== "episodic" ||
        value.authoritativeCapability !== "memory" ||
        value.lifecycleState !== "stored"
      )
        throw new Error();
      return createMemoryReference(memoryIdentity(value.memoryIdentity));
    } catch {
      throw new InvalidMemoryStateError();
    }
  }

  private validateReceipt(
    receipt: MemoryRetrievalReceipt,
    identity: MemoryIdentity,
  ): void {
    if (
      !Object.isFrozen(receipt) ||
      !Object.isFrozen(receipt.memoryReference) ||
      receipt.memoryReference.memoryIdentity !== identity
    )
      throw new InvalidMemoryStateError();
  }

  private callerIdentity(value: unknown): MemoryIdentity {
    try {
      return memoryIdentity(value);
    } catch {
      throw new InvalidMemoryIdentityError();
    }
  }

  private nextIdentity(): MemoryIdentity {
    try {
      return memoryIdentity(this.construction.nextMemoryIdentity());
    } catch {
      throw new InvalidMemoryIdentityError();
    }
  }
  private nextRetainedAt() {
    try {
      return memoryTimestamp(this.construction.nextRetainedAt());
    } catch {
      throw new InvalidMemoryStateError();
    }
  }
  private nextRetrievedAt() {
    try {
      return memoryTimestamp(this.construction.nextRetrievedAt());
    } catch {
      throw new InvalidMemoryStateError();
    }
  }
  private callStore(operation: () => unknown): unknown {
    try {
      return operation();
    } catch {
      throw new MemoryStoreUnavailableError();
    }
  }
  private inspectStoreResult<T>(inspection: () => T): T {
    try {
      return inspection();
    } catch (error: unknown) {
      if (
        error instanceof MemoryStoreUnavailableError ||
        error instanceof DuplicateMemoryIdentityError ||
        error instanceof MemoryNotFoundError ||
        error instanceof InvalidMemoryStateError
      ) {
        throw error;
      }
      throw new InvalidMemoryStateError();
    }
  }
  private requireRunning(): void {
    if (this.#engineState !== "running") throw new InvalidMemoryStateError();
  }
}

export type MemoryEngineLifecycleState =
  "initialize" | "ready" | "running" | "stopped";

export class MemoryEngineInitializationError extends Error {
  public constructor() {
    super("Memory Engine dependencies or lifecycle are invalid.");
    this.name = "MemoryEngineInitializationError";
  }
}
