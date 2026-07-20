export type JsonPrimitive = boolean | number | string | null;
export type JsonValue =
  JsonPrimitive | readonly JsonValue[] | { readonly [key: string]: JsonValue };

export type LogLevel = "debug" | "info" | "warn" | "error";

export interface StructuredLogRecord {
  readonly level: LogLevel;
  readonly event: string;
  readonly message: string;
  readonly correlationId: string;
  readonly attributes?: Readonly<Record<string, JsonValue>>;
}

export interface StructuredLogger {
  log(record: StructuredLogRecord): void;
}
