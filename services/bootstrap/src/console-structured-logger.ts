import type {
  LogLevel,
  StructuredLogger,
  StructuredLogRecord,
} from "@orion/core";

export type LogSink = (serializedRecord: string) => void;

const LOG_LEVEL_PRIORITY: Readonly<Record<LogLevel, number>> = {
  debug: 10,
  info: 20,
  warn: 30,
  error: 40,
};

export class ConsoleStructuredLogger implements StructuredLogger {
  public constructor(
    private readonly minimumLevel: LogLevel,
    private readonly sink: LogSink = console.log,
  ) {}

  public log(record: StructuredLogRecord): void {
    if (
      LOG_LEVEL_PRIORITY[record.level] < LOG_LEVEL_PRIORITY[this.minimumLevel]
    ) {
      return;
    }

    this.sink(JSON.stringify(record));
  }
}
