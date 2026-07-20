import type { DiagnosticResult } from "@orion/core";

export type DiagnosticResultSink = (serializedResult: string) => void;

export interface DiagnosticResultRecord {
  readonly event: "orion.runtime.diagnostic.result";
  readonly correlationId: string;
  readonly result: DiagnosticResult;
}

export function emitDiagnosticResult(
  result: DiagnosticResult,
  correlationId: string,
  sink: DiagnosticResultSink = console.log,
): void {
  const record: DiagnosticResultRecord = {
    event: "orion.runtime.diagnostic.result",
    correlationId,
    result,
  };

  sink(JSON.stringify(record));
}
