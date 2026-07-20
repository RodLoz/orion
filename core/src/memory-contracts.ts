import type {
  MemoryIdentity,
  MemoryRecord,
  MemoryReference,
  MemoryRetrievalPurpose,
  RetrievedMemory,
} from "./memory.js";

export interface RetainMemoryRequest {
  readonly intent: "retain";
  readonly kind: "episodic";
  readonly content: unknown;
  readonly retentionReason: unknown;
  readonly provenance: unknown;
}
export interface RetainMemory {
  retainMemory(request: RetainMemoryRequest): MemoryRecord;
}

export interface GetMemoryRequest {
  readonly memoryIdentity: unknown;
  readonly purpose: unknown;
}
export interface GetMemory {
  getMemory(request: GetMemoryRequest): RetrievedMemory;
}

export interface ListRetainedMemoryReferencesRequest {
  readonly limit?: unknown;
}
export interface ListRetainedMemoryReferences {
  listRetainedMemoryReferences(
    request: ListRetainedMemoryReferencesRequest,
  ): readonly MemoryReference[];
}

export interface ForgetMemoryRequest {
  readonly intent: "forget";
  readonly memoryIdentity: unknown;
}
export interface ForgetMemoryResult {
  readonly outcome: "deleted";
  readonly memoryReference: MemoryReference;
}
export interface ForgetMemory {
  forgetMemory(request: ForgetMemoryRequest): ForgetMemoryResult;
}

export interface MemoryConstructionValues {
  nextMemoryIdentity(): unknown;
  nextRetainedAt(): unknown;
  nextRetrievedAt(): unknown;
}

export type MemoryStorePutResult =
  | Readonly<{ status: "stored"; memoryIdentity: unknown }>
  | Readonly<{ status: "duplicate" }>
  | Readonly<{ status: "unavailable" }>;
export type MemoryStoreGetResult =
  | Readonly<{ status: "found"; record: unknown }>
  | Readonly<{ status: "not-found" }>
  | Readonly<{ status: "unavailable" }>;
export type MemoryStoreListResult =
  | Readonly<{ status: "listed"; references: unknown }>
  | Readonly<{ status: "unavailable" }>;
export type MemoryStoreDeleteResult =
  | Readonly<{ status: "deleted"; memoryIdentity: unknown }>
  | Readonly<{ status: "not-found" }>
  | Readonly<{ status: "unavailable" }>;

export interface MemoryStore {
  put(record: MemoryRecord): MemoryStorePutResult;
  get(memoryIdentity: MemoryIdentity): MemoryStoreGetResult;
  list(limit: number): MemoryStoreListResult;
  delete(memoryIdentity: MemoryIdentity): MemoryStoreDeleteResult;
}

export class InvalidMemoryInputError extends Error {
  public constructor() {
    super("Memory request is invalid.");
    this.name = "InvalidMemoryInputError";
  }
}
export class InvalidMemoryIdentityError extends Error {
  public constructor() {
    super("Memory Identity is invalid.");
    this.name = "InvalidMemoryIdentityError";
  }
}
export class InvalidRetentionIntentError extends Error {
  public constructor() {
    super("Memory Retention Intent is invalid.");
    this.name = "InvalidRetentionIntentError";
  }
}
export class DuplicateMemoryIdentityError extends Error {
  public constructor() {
    super("Memory Identity is already retained.");
    this.name = "DuplicateMemoryIdentityError";
  }
}
export class MemoryNotFoundError extends Error {
  public constructor() {
    super("Memory was not found.");
    this.name = "MemoryNotFoundError";
  }
}
export class MemoryStoreUnavailableError extends Error {
  public constructor() {
    super("Memory Store is unavailable.");
    this.name = "MemoryStoreUnavailableError";
  }
}
export class InvalidMemoryStateError extends Error {
  public constructor() {
    super("Memory state is invalid.");
    this.name = "InvalidMemoryStateError";
  }
}
export class InvalidMemoryLifecycleTransitionError extends Error {
  public constructor() {
    super("Memory lifecycle transition is invalid.");
    this.name = "InvalidMemoryLifecycleTransitionError";
  }
}

export type ValidatedGetMemoryRequest = Readonly<{
  memoryIdentity: MemoryIdentity;
  purpose: MemoryRetrievalPurpose;
}>;
