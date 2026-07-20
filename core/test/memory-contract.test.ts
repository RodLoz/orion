import { describe, expect, it } from "vitest";

import {
  InvalidMemoryContentValueError,
  InvalidMemoryIdentityValueError,
  InvalidMemoryProvenanceValueError,
  InvalidMemoryRetentionReasonValueError,
  InvalidMemoryRetrievalPurposeValueError,
  InvalidMemoryRecordValueError,
  InvalidMemoryRetrievalReceiptValueError,
  InvalidMemoryTimestampValueError,
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
} from "../src/index.js";

describe("Memory domain Contracts", () => {
  it("validates Memory Identity bounds in Unicode code points", () => {
    expect(memoryIdentity("x".repeat(128))).toBe("x".repeat(128));
    expect(memoryIdentity("😀".repeat(128))).toBe("😀".repeat(128));
    expect(() => memoryIdentity("x".repeat(129))).toThrow(
      InvalidMemoryIdentityValueError,
    );
  });

  it.each([
    "",
    " ",
    " identity",
    "identity ",
    null,
    1,
    {},
    { toString: () => "id" },
  ])("rejects invalid Memory Identity without coercion: %j", (value) =>
    expect(() => memoryIdentity(value)).toThrow(
      InvalidMemoryIdentityValueError,
    ),
  );

  it("validates Memory Content bounds without truncation", () => {
    const maximum = "😀".repeat(4096);
    expect(memoryContent(maximum)).toBe(maximum);
    expect(() => memoryContent("😀".repeat(4097))).toThrow(
      InvalidMemoryContentValueError,
    );
  });

  it.each(["", "   ", null, 4, { toString: () => "content" }])(
    "rejects invalid Memory Content: %j",
    (value) =>
      expect(() => memoryContent(value)).toThrow(
        InvalidMemoryContentValueError,
      ),
  );

  it("validates Retention Reason bounds", () => {
    expect(memoryRetentionReason("r".repeat(512))).toBe("r".repeat(512));
    expect(() => memoryRetentionReason("r".repeat(513))).toThrow(
      InvalidMemoryRetentionReasonValueError,
    );
  });

  it.each(["", " ", null, {}, { toString: () => "reason" }])(
    "rejects invalid Retention Reason: %j",
    (value) =>
      expect(() => memoryRetentionReason(value)).toThrow(
        InvalidMemoryRetentionReasonValueError,
      ),
  );

  it("validates Originating Capability and Optional Source Reference bounds", () => {
    expect(memoryOriginatingCapability("c".repeat(128))).toBe("c".repeat(128));
    expect(() => memoryOriginatingCapability("c".repeat(129))).toThrow(
      InvalidMemoryProvenanceValueError,
    );
    expect(memorySourceReference("😀".repeat(256))).toBe("😀".repeat(256));
    expect(() => memorySourceReference("😀".repeat(257))).toThrow(
      InvalidMemoryProvenanceValueError,
    );
  });

  it.each(["", " ", " ref", "ref ", 1, {}, { toString: () => "ref" }])(
    "rejects structurally invalid opaque provenance strings: %j",
    (value) => {
      expect(() => memoryOriginatingCapability(value)).toThrow(
        InvalidMemoryProvenanceValueError,
      );
      expect(() => memorySourceReference(value)).toThrow(
        InvalidMemoryProvenanceValueError,
      );
    },
  );

  it("uses the closed Retrieval Purpose vocabulary", () => {
    expect(memoryRetrievalPurpose("continuity")).toBe("continuity");
    expect(memoryRetrievalPurpose("user-requested-recall")).toBe(
      "user-requested-recall",
    );
    expect(memoryRetrievalPurpose("diagnostic")).toBe("diagnostic");
    expect(() => memoryRetrievalPurpose("free form")).toThrow(
      InvalidMemoryRetrievalPurposeValueError,
    );
  });

  it("rejects malformed complete Provenance factory input", () => {
    const base = {
      sourceType: "interaction",
      originatingCapability: "orion.test",
      observedAt: "2026-02-28T00:00:00.000Z",
      occurrenceEvidence: "observed",
    };
    for (const value of [
      null,
      [],
      { ...base, sourceType: "invalid" },
      { ...base, originatingCapability: 7 },
      { ...base, observedAt: "not-a-timestamp" },
      { ...base, occurrenceEvidence: "invalid" },
      { ...base, unexpected: true },
      { ...base, sourceReference: { toString: () => "reference" } },
      new Proxy(
        {},
        {
          getPrototypeOf() {
            throw new Error("hostile provenance");
          },
        },
      ),
    ]) {
      expect(() => createMemoryProvenance(value)).toThrow(
        InvalidMemoryProvenanceValueError,
      );
    }
  });

  it("validates exact UTC calendar timestamps without normalization", () => {
    expect(memoryTimestamp("2024-02-29T23:59:59.999Z")).toBe(
      "2024-02-29T23:59:59.999Z",
    );
    expect(memoryTimestamp("2026-01-01T00:00:00Z")).toBe(
      "2026-01-01T00:00:00Z",
    );
    for (const value of [
      "2026-02-29T00:00:00.000Z",
      "2026-02-30T00:00:00.000Z",
      "2026-04-31T00:00:00.000Z",
      "2026-13-01T00:00:00.000Z",
    ]) {
      expect(() => memoryTimestamp(value)).toThrow(
        InvalidMemoryTimestampValueError,
      );
    }
  });

  it("defensively reconstructs deeply immutable Record and Receipt graphs", () => {
    const callerIntent: Record<string, unknown> = {
      operation: "retain",
      reason: "Continuity.",
    };
    const callerProvenance: Record<string, unknown> = {
      sourceType: "interaction",
      originatingCapability: "orion.test",
      observedAt: "2026-07-20T00:00:00.000Z",
      occurrenceEvidence: "reported",
    };
    const record = createMemoryRecord({
      memoryIdentity: "memory-immutable",
      content: "An immutable experience.",
      retentionIntent: callerIntent,
      provenance: callerProvenance,
      retainedAt: "2026-07-20T00:01:00.000Z",
    });
    callerIntent.reason = "mutated";
    callerProvenance.originatingCapability = "mutated";
    expect(record.retentionIntent.reason).toBe("Continuity.");
    expect(record.provenance.originatingCapability).toBe("orion.test");
    expect(Object.isFrozen(record.retentionIntent)).toBe(true);
    expect(Object.isFrozen(record.provenance)).toBe(true);
    expect(
      Reflect.set(record.provenance, "originatingCapability", "mutated"),
    ).toBe(false);

    const callerReference: Record<string, unknown> = {
      memoryIdentity: "memory-immutable",
      kind: "episodic",
      authoritativeCapability: "memory",
      lifecycleState: "stored",
    };
    const receipt = createMemoryRetrievalReceipt({
      memoryReference: callerReference,
      retrievedAt: "2026-07-20T00:02:00.000Z",
      purpose: "continuity",
    });
    callerReference.memoryIdentity = "mutated";
    expect(receipt.memoryReference.memoryIdentity).toBe("memory-immutable");
    expect(Object.isFrozen(receipt.memoryReference)).toBe(true);
  });

  it("rejects malformed Record and Receipt factory graphs", () => {
    expect(() => createMemoryRecord({})).toThrow(InvalidMemoryRecordValueError);
    expect(() =>
      createMemoryRetrievalReceipt({
        memoryReference: { memoryIdentity: "memory" },
        retrievedAt: "2026-07-20T00:00:00.000Z",
        purpose: "continuity",
      }),
    ).toThrow(InvalidMemoryRetrievalReceiptValueError);
    expect(() =>
      createMemoryRetrievalReceipt({
        memoryReference: new Proxy(
          {},
          {
            getPrototypeOf() {
              throw new Error("hostile reference");
            },
          },
        ),
        retrievedAt: "2026-07-20T00:00:00.000Z",
        purpose: "continuity",
      }),
    ).toThrow(InvalidMemoryRetrievalReceiptValueError);
  });

  it("constructs immutable Memory values and privacy-minimal references", () => {
    const intent = createMemoryRetentionIntent(
      memoryRetentionReason("Continuity."),
    );
    const provenance = createMemoryProvenance({
      sourceType: "interaction",
      originatingCapability: memoryOriginatingCapability("orion.test"),
      observedAt: memoryTimestamp("2026-07-20T00:00:00.000Z"),
      occurrenceEvidence: "reported",
    });
    const record = createMemoryRecord({
      memoryIdentity: memoryIdentity("memory-1"),
      content: memoryContent("A test experience occurred."),
      retentionIntent: intent,
      provenance,
      retainedAt: memoryTimestamp("2026-07-20T00:01:00.000Z"),
    });
    const reference = createMemoryReference(record.memoryIdentity);
    const receipt = createMemoryRetrievalReceipt({
      memoryReference: reference,
      retrievedAt: memoryTimestamp("2026-07-20T00:02:00.000Z"),
      purpose: "continuity",
    });

    expect(Object.isFrozen(intent)).toBe(true);
    expect(Object.isFrozen(provenance)).toBe(true);
    expect(Object.isFrozen(record)).toBe(true);
    expect(Object.isFrozen(reference)).toBe(true);
    expect(Object.isFrozen(receipt)).toBe(true);
    expect(Object.keys(reference)).toEqual([
      "memoryIdentity",
      "kind",
      "authoritativeCapability",
      "lifecycleState",
    ]);
    expect(reference).not.toHaveProperty("content");
    expect(receipt).not.toHaveProperty("provenance");
  });
});
