export const MEMORY_CONTENT_MAX_CODE_POINTS = 4096;
export const RETENTION_REASON_MAX_CODE_POINTS = 512;
export const MEMORY_IDENTITY_MAX_CODE_POINTS = 128;
export const ORIGINATING_CAPABILITY_MAX_CODE_POINTS = 128;
export const SOURCE_REFERENCE_MAX_CODE_POINTS = 256;

export type MemoryIdentity = string & {
  readonly __memoryIdentity: unique symbol;
};
export type MemoryContent = string & {
  readonly __memoryContent: unique symbol;
};
export type MemoryRetentionReason = string & {
  readonly __memoryRetentionReason: unique symbol;
};
export type MemoryOriginatingCapability = string & {
  readonly __memoryOriginatingCapability: unique symbol;
};
export type MemorySourceReference = string & {
  readonly __memorySourceReference: unique symbol;
};
export type MemoryTimestamp = string & {
  readonly __memoryTimestamp: unique symbol;
};

export type MemoryKind = "episodic";
export type MemoryLifecycleState = "stored";
export type MemorySourceType = "interaction" | "capability-outcome";
export type MemoryOccurrenceEvidence = "reported" | "observed";
export type MemoryRetrievalPurpose =
  "continuity" | "user-requested-recall" | "diagnostic";

export interface MemoryRetentionIntent {
  readonly operation: "retain";
  readonly reason: MemoryRetentionReason;
}

export interface MemoryProvenance {
  readonly sourceType: MemorySourceType;
  readonly originatingCapability: MemoryOriginatingCapability;
  readonly observedAt: MemoryTimestamp;
  readonly occurrenceEvidence: MemoryOccurrenceEvidence;
  readonly sourceReference?: MemorySourceReference;
}

export interface MemoryRecord {
  readonly memoryIdentity: MemoryIdentity;
  readonly kind: "episodic";
  readonly content: MemoryContent;
  readonly retentionIntent: MemoryRetentionIntent;
  readonly provenance: MemoryProvenance;
  readonly retainedAt: MemoryTimestamp;
  readonly lifecycleState: "stored";
}

export interface MemoryReference {
  readonly memoryIdentity: MemoryIdentity;
  readonly kind: "episodic";
  readonly authoritativeCapability: "memory";
  readonly lifecycleState: "stored";
}

export interface MemoryRetrievalReceipt {
  readonly memoryReference: MemoryReference;
  readonly retrievedAt: MemoryTimestamp;
  readonly purpose: MemoryRetrievalPurpose;
}

export interface RetrievedMemory {
  readonly memory: MemoryRecord;
  readonly receipt: MemoryRetrievalReceipt;
}

export function memoryIdentity(value: unknown): MemoryIdentity {
  return boundedOpaqueString(
    value,
    MEMORY_IDENTITY_MAX_CODE_POINTS,
    new InvalidMemoryIdentityValueError(),
  ) as MemoryIdentity;
}

export function memoryContent(value: unknown): MemoryContent {
  if (!isNonEmptyBoundedString(value, MEMORY_CONTENT_MAX_CODE_POINTS)) {
    throw new InvalidMemoryContentValueError();
  }
  return value as MemoryContent;
}

export function memoryRetentionReason(value: unknown): MemoryRetentionReason {
  if (!isNonEmptyBoundedString(value, RETENTION_REASON_MAX_CODE_POINTS)) {
    throw new InvalidMemoryRetentionReasonValueError();
  }
  return value as MemoryRetentionReason;
}

export function memoryOriginatingCapability(
  value: unknown,
): MemoryOriginatingCapability {
  return boundedOpaqueString(
    value,
    ORIGINATING_CAPABILITY_MAX_CODE_POINTS,
    new InvalidMemoryProvenanceValueError(),
  ) as MemoryOriginatingCapability;
}

export function memorySourceReference(value: unknown): MemorySourceReference {
  return boundedOpaqueString(
    value,
    SOURCE_REFERENCE_MAX_CODE_POINTS,
    new InvalidMemoryProvenanceValueError(),
  ) as MemorySourceReference;
}

export function memoryTimestamp(value: unknown): MemoryTimestamp {
  if (
    typeof value !== "string" ||
    !/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d{3})?Z$/.test(value) ||
    !isExactUtcTimestamp(value)
  ) {
    throw new InvalidMemoryTimestampValueError();
  }
  return value as MemoryTimestamp;
}

export function memoryRetrievalPurpose(value: unknown): MemoryRetrievalPurpose {
  if (
    value !== "continuity" &&
    value !== "user-requested-recall" &&
    value !== "diagnostic"
  ) {
    throw new InvalidMemoryRetrievalPurposeValueError();
  }
  return value;
}

export function createMemoryRetentionIntent(
  reason: unknown,
): MemoryRetentionIntent {
  return Object.freeze({
    operation: "retain",
    reason: memoryRetentionReason(reason),
  });
}

export function createMemoryProvenance(input: unknown): MemoryProvenance {
  try {
    if (
      !isPlainRecord(input) ||
      !hasExactFields(
        input,
        [
          "sourceType",
          "originatingCapability",
          "observedAt",
          "occurrenceEvidence",
        ],
        ["sourceReference"],
      )
    ) {
      throw new InvalidMemoryProvenanceValueError();
    }
    const sourceType = input.sourceType;
    const occurrenceEvidence = input.occurrenceEvidence;
    if (
      (sourceType !== "interaction" && sourceType !== "capability-outcome") ||
      (occurrenceEvidence !== "reported" && occurrenceEvidence !== "observed")
    ) {
      throw new InvalidMemoryProvenanceValueError();
    }
    return Object.freeze({
      sourceType,
      originatingCapability: memoryOriginatingCapability(
        input.originatingCapability,
      ),
      observedAt: memoryTimestamp(input.observedAt),
      occurrenceEvidence,
      ...(Object.hasOwn(input, "sourceReference")
        ? { sourceReference: memorySourceReference(input.sourceReference) }
        : {}),
    });
  } catch {
    throw new InvalidMemoryProvenanceValueError();
  }
}

export function createMemoryRecord(input: unknown): MemoryRecord {
  try {
    if (
      !isPlainRecord(input) ||
      !hasExactFields(input, [
        "memoryIdentity",
        "content",
        "retentionIntent",
        "provenance",
        "retainedAt",
      ]) ||
      !isPlainRecord(input.retentionIntent) ||
      !hasExactFields(input.retentionIntent, ["operation", "reason"]) ||
      input.retentionIntent.operation !== "retain"
    ) {
      throw new InvalidMemoryRecordValueError();
    }
    const retentionIntent = createMemoryRetentionIntent(
      input.retentionIntent.reason,
    );
    const provenance = createMemoryProvenance(input.provenance);
    return Object.freeze({
      memoryIdentity: memoryIdentity(input.memoryIdentity),
      kind: "episodic",
      content: memoryContent(input.content),
      retentionIntent,
      provenance,
      retainedAt: memoryTimestamp(input.retainedAt),
      lifecycleState: "stored",
    });
  } catch {
    throw new InvalidMemoryRecordValueError();
  }
}

export function createMemoryReference(
  memoryIdentityValue: unknown,
): MemoryReference {
  return Object.freeze({
    memoryIdentity: memoryIdentity(memoryIdentityValue),
    kind: "episodic",
    authoritativeCapability: "memory",
    lifecycleState: "stored",
  });
}

export function createMemoryRetrievalReceipt(
  input: unknown,
): MemoryRetrievalReceipt {
  try {
    if (
      !isPlainRecord(input) ||
      !hasExactFields(input, ["memoryReference", "retrievedAt", "purpose"])
    ) {
      throw new InvalidMemoryRetrievalReceiptValueError();
    }
    const memoryReference = reconstructMemoryReference(input.memoryReference);
    return Object.freeze({
      memoryReference,
      retrievedAt: memoryTimestamp(input.retrievedAt),
      purpose: memoryRetrievalPurpose(input.purpose),
    });
  } catch {
    throw new InvalidMemoryRetrievalReceiptValueError();
  }
}

function reconstructMemoryReference(value: unknown): MemoryReference {
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
  ) {
    throw new InvalidMemoryReferenceValueError();
  }
  return createMemoryReference(value.memoryIdentity);
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

function isExactUtcTimestamp(value: string): boolean {
  const milliseconds = Date.parse(value);
  if (Number.isNaN(milliseconds)) return false;
  const canonical = new Date(milliseconds).toISOString();
  return (
    value === canonical ||
    (canonical.endsWith(".000Z") && value === canonical.replace(".000Z", "Z"))
  );
}

function isNonEmptyBoundedString(value: unknown, maximum: number): boolean {
  return (
    typeof value === "string" &&
    value.length > 0 &&
    value.trim().length > 0 &&
    [...value].length <= maximum
  );
}

function boundedOpaqueString(
  value: unknown,
  maximum: number,
  failure: Error,
): string {
  if (
    typeof value !== "string" ||
    value.length === 0 ||
    value.trim().length === 0 ||
    value.trim() !== value ||
    [...value].length > maximum
  ) {
    throw failure;
  }
  return value;
}

export class InvalidMemoryIdentityValueError extends Error {
  public constructor() {
    super("Memory Identity value is invalid.");
    this.name = "InvalidMemoryIdentityValueError";
  }
}
export class InvalidMemoryContentValueError extends Error {
  public constructor() {
    super("Memory Content value is invalid.");
    this.name = "InvalidMemoryContentValueError";
  }
}
export class InvalidMemoryRetentionReasonValueError extends Error {
  public constructor() {
    super("Memory Retention Reason value is invalid.");
    this.name = "InvalidMemoryRetentionReasonValueError";
  }
}
export class InvalidMemoryProvenanceValueError extends Error {
  public constructor() {
    super("Memory Provenance value is invalid.");
    this.name = "InvalidMemoryProvenanceValueError";
  }
}
export class InvalidMemoryTimestampValueError extends Error {
  public constructor() {
    super("Memory timestamp value is invalid.");
    this.name = "InvalidMemoryTimestampValueError";
  }
}
export class InvalidMemoryRetrievalPurposeValueError extends Error {
  public constructor() {
    super("Memory Retrieval Purpose value is invalid.");
    this.name = "InvalidMemoryRetrievalPurposeValueError";
  }
}
export class InvalidMemoryRecordValueError extends Error {
  public constructor() {
    super("Memory Record value is invalid.");
    this.name = "InvalidMemoryRecordValueError";
  }
}
export class InvalidMemoryReferenceValueError extends Error {
  public constructor() {
    super("Memory Reference value is invalid.");
    this.name = "InvalidMemoryReferenceValueError";
  }
}
export class InvalidMemoryRetrievalReceiptValueError extends Error {
  public constructor() {
    super("Memory Retrieval Receipt value is invalid.");
    this.name = "InvalidMemoryRetrievalReceiptValueError";
  }
}
