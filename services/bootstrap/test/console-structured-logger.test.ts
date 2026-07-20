import type { LogLevel, StructuredLogRecord } from "@orion/core";
import { describe, expect, it } from "vitest";

import { ConsoleStructuredLogger } from "../src/console-structured-logger.js";

const RECORDS: Readonly<Record<LogLevel, StructuredLogRecord>> = {
  debug: {
    level: "debug",
    event: "test.debug",
    message: "debug",
    correlationId: "test",
  },
  info: {
    level: "info",
    event: "test.info",
    message: "info",
    correlationId: "test",
  },
  warn: {
    level: "warn",
    event: "test.warn",
    message: "warn",
    correlationId: "test",
  },
  error: {
    level: "error",
    event: "test.error",
    message: "error",
    correlationId: "test",
  },
};

describe("ConsoleStructuredLogger", () => {
  it("filters ordinary records below the configured level", () => {
    const output: string[] = [];
    const logger = new ConsoleStructuredLogger("warn", (record) =>
      output.push(record),
    );

    logger.log(RECORDS.debug);
    logger.log(RECORDS.info);
    logger.log(RECORDS.warn);
    logger.log(RECORDS.error);

    expect(output.map((record) => JSON.parse(record).level)).toEqual([
      "warn",
      "error",
    ]);
  });
});
