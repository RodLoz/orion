import { describe, expect, it } from "vitest";

import {
  InvalidCandidateClaimValueError,
  InvalidKnowledgeAcceptanceEvidenceValueError,
  InvalidKnowledgeDecisionValueError,
  InvalidKnowledgeIdentityValueError,
  InvalidKnowledgeProvenanceValueError,
  InvalidKnowledgeRecordValueError,
  InvalidKnowledgeReferenceValueError,
  InvalidKnowledgeTimestampValueError,
  InvalidKnowledgeVersionValueError,
  KNOWLEDGE_VERSION_MAX,
  candidateClaim,
  createAcceptedKnowledgeDecision,
  createKnowledgeAcceptanceEvidence,
  createKnowledgeProvenance,
  createKnowledgeRecord,
  createKnowledgeReference,
  createRejectedKnowledgeDecision,
  knowledgeAcceptanceReason,
  knowledgeAuthorityIdentifier,
  knowledgeIdentity,
  knowledgeOriginatingCapability,
  knowledgeSourceReference,
  knowledgeTimestamp,
  knowledgeVersion,
} from "../src/index.js";

const evidence = () => ({
  method: "explicit-authority-review",
  authorityIdentifier: "orion.test.authority",
  decision: "accept",
  reason: "Reviewed for deterministic testing.",
});

const provenance = () => ({
  sourceType: "approved-internal-source",
  originatingCapability: "orion.test",
  observedAt: "2026-07-20T00:00:00.000Z",
});

const recordInput = () => ({
  knowledgeIdentity: "knowledge-1",
  claim: "A bounded candidate claim.",
  provenance: provenance(),
  acceptanceEvidence: evidence(),
  acceptedAt: "2026-07-20T00:01:00.000Z",
  version: 1,
});

describe("Knowledge domain Contracts", () => {
  it("validates Identity and Claim Unicode code-point bounds", () => {
    expect(knowledgeIdentity("😀".repeat(128))).toBe("😀".repeat(128));
    expect(() => knowledgeIdentity("😀".repeat(129))).toThrow(
      InvalidKnowledgeIdentityValueError,
    );
    expect(candidateClaim("😀".repeat(4096))).toBe("😀".repeat(4096));
    expect(() => candidateClaim("😀".repeat(4097))).toThrow(
      InvalidCandidateClaimValueError,
    );
  });

  it.each(["", " ", " id", "id ", null, 1, {}, { toString: () => "id" }])(
    "rejects invalid Identity without coercion: %j",
    (value) =>
      expect(() => knowledgeIdentity(value)).toThrow(
        InvalidKnowledgeIdentityValueError,
      ),
  );

  it.each(["", "   ", null, 4, [], { toString: () => "claim" }])(
    "rejects invalid Claim without coercion: %j",
    (value) =>
      expect(() => candidateClaim(value)).toThrow(
        InvalidCandidateClaimValueError,
      ),
  );

  it("validates authority, reasons, capability, and Source Reference bounds", () => {
    expect(knowledgeAuthorityIdentifier("a".repeat(128))).toHaveLength(128);
    expect(knowledgeAcceptanceReason("r".repeat(512))).toHaveLength(512);
    expect(knowledgeOriginatingCapability("c".repeat(128))).toHaveLength(128);
    expect(knowledgeSourceReference("😀".repeat(256))).toBe("😀".repeat(256));
    expect(() => knowledgeAuthorityIdentifier("a".repeat(129))).toThrow();
    expect(() => knowledgeAcceptanceReason("r".repeat(513))).toThrow();
    expect(() => knowledgeOriginatingCapability("c".repeat(129))).toThrow();
    expect(() => knowledgeSourceReference("😀".repeat(257))).toThrow();
  });

  it("uses Unicode code points for every bounded Knowledge string", () => {
    expect(candidateClaim("😀".repeat(4096))).toBe("😀".repeat(4096));
    expect(() => candidateClaim("😀".repeat(4097))).toThrow(
      InvalidCandidateClaimValueError,
    );
    expect(knowledgeAcceptanceReason("😀".repeat(512))).toBe("😀".repeat(512));
    expect(() => knowledgeAcceptanceReason("😀".repeat(513))).toThrow(
      InvalidKnowledgeAcceptanceEvidenceValueError,
    );
    expect(knowledgeIdentity("😀".repeat(128))).toBe("😀".repeat(128));
    expect(() => knowledgeIdentity("😀".repeat(129))).toThrow(
      InvalidKnowledgeIdentityValueError,
    );
    expect(knowledgeAuthorityIdentifier("😀".repeat(128))).toBe(
      "😀".repeat(128),
    );
    expect(() => knowledgeAuthorityIdentifier("😀".repeat(129))).toThrow(
      InvalidKnowledgeAcceptanceEvidenceValueError,
    );
    expect(knowledgeOriginatingCapability("😀".repeat(128))).toBe(
      "😀".repeat(128),
    );
    expect(() => knowledgeOriginatingCapability("😀".repeat(129))).toThrow(
      InvalidKnowledgeProvenanceValueError,
    );
    expect(knowledgeSourceReference("😀".repeat(256))).toBe("😀".repeat(256));
    expect(() => knowledgeSourceReference("😀".repeat(257))).toThrow(
      InvalidKnowledgeProvenanceValueError,
    );
  });

  it("rejects malformed opaque Knowledge values", () => {
    for (const value of [
      "",
      " ",
      " value",
      "value ",
      1,
      {},
      { valueOf: () => "x" },
    ] as readonly unknown[]) {
      expect(() => knowledgeAuthorityIdentifier(value)).toThrow();
      expect(() => knowledgeOriginatingCapability(value)).toThrow();
      expect(() => knowledgeSourceReference(value)).toThrow();
    }
  });

  it("validates the complete exact Acceptance Evidence shape", () => {
    const value = createKnowledgeAcceptanceEvidence(evidence());
    expect(value.decision).toBe("accept");
    expect(Object.isFrozen(value)).toBe(true);
    for (const invalid of [
      null,
      [],
      { ...evidence(), method: "other" },
      { ...evidence(), authorityIdentifier: 1 },
      { ...evidence(), decision: "maybe" },
      { ...evidence(), reason: "" },
      { ...evidence(), extra: true },
    ]) {
      expect(() => createKnowledgeAcceptanceEvidence(invalid)).toThrow(
        InvalidKnowledgeAcceptanceEvidenceValueError,
      );
    }
  });

  it("validates Provenance including optional opaque Source Reference", () => {
    expect(
      createKnowledgeProvenance(provenance()).sourceReference,
    ).toBeUndefined();
    expect(
      createKnowledgeProvenance({
        ...provenance(),
        sourceReference: "source-1",
      }).sourceReference,
    ).toBe("source-1");
    for (const invalid of [
      null,
      [],
      { ...provenance(), sourceType: "memory" },
      { ...provenance(), originatingCapability: 4 },
      { ...provenance(), observedAt: "2026-02-30T00:00:00.000Z" },
      { ...provenance(), sourceReference: { toString: () => "source" } },
      { ...provenance(), extra: true },
    ]) {
      expect(() => createKnowledgeProvenance(invalid)).toThrow(
        InvalidKnowledgeProvenanceValueError,
      );
    }
  });

  it("rejects impossible timestamps and accepts leap-day boundaries", () => {
    expect(knowledgeTimestamp("2024-02-29T23:59:59.999Z")).toBe(
      "2024-02-29T23:59:59.999Z",
    );
    for (const value of [
      "2026-02-29T00:00:00.000Z",
      "2026-02-30T00:00:00.000Z",
      "2026-04-31T00:00:00.000Z",
      "2026-13-01T00:00:00.000Z",
      { toString: () => "2026-01-01T00:00:00Z" },
    ]) {
      expect(() => knowledgeTimestamp(value)).toThrow(
        InvalidKnowledgeTimestampValueError,
      );
    }
  });

  it("enforces exact safe Knowledge Version bounds", () => {
    expect(knowledgeVersion(1)).toBe(1);
    expect(knowledgeVersion(KNOWLEDGE_VERSION_MAX)).toBe(KNOWLEDGE_VERSION_MAX);
    for (const value of [
      0,
      -1,
      1.5,
      Number.NaN,
      Number.POSITIVE_INFINITY,
      "1",
      { valueOf: () => 1 },
      KNOWLEDGE_VERSION_MAX + 1,
    ]) {
      expect(() => knowledgeVersion(value)).toThrow(
        InvalidKnowledgeVersionValueError,
      );
    }
  });

  it("defensively reconstructs deeply immutable Record graphs", () => {
    const callerEvidence: Record<string, unknown> = evidence();
    const callerProvenance: Record<string, unknown> = provenance();
    const record = createKnowledgeRecord({
      ...recordInput(),
      acceptanceEvidence: callerEvidence,
      provenance: callerProvenance,
    });
    callerEvidence.reason = "mutated";
    callerProvenance.originatingCapability = "mutated";
    expect(record.acceptanceEvidence.reason).toBe(
      "Reviewed for deterministic testing.",
    );
    expect(record.provenance.originatingCapability).toBe("orion.test");
    expect(Object.isFrozen(record)).toBe(true);
    expect(Object.isFrozen(record.acceptanceEvidence)).toBe(true);
    expect(Object.isFrozen(record.provenance)).toBe(true);
    expect(Reflect.set(record.provenance, "sourceType", "mutated")).toBe(false);
  });

  it("constructs privacy-minimal immutable References and Decisions", () => {
    const record = createKnowledgeRecord(recordInput());
    const referenceInput: Record<string, unknown> = {
      knowledgeIdentity: record.knowledgeIdentity,
      version: record.version,
      currency: "current",
    };
    const reference = createKnowledgeReference(referenceInput);
    const accepted = createAcceptedKnowledgeDecision({ record, reference });
    referenceInput.currency = "superseded";
    expect(accepted.reference.currency).toBe("current");
    expect(Object.isFrozen(accepted.record.provenance)).toBe(true);
    expect(accepted.reference).not.toHaveProperty("claim");
    expect(createRejectedKnowledgeDecision("authority-rejected")).toEqual({
      outcome: "rejected",
      category: "authority-rejected",
    });
  });

  it("rejects malformed Record, Reference, and Decision graphs", () => {
    expect(() => createKnowledgeRecord({})).toThrow(
      InvalidKnowledgeRecordValueError,
    );
    expect(() =>
      createKnowledgeRecord({
        ...recordInput(),
        acceptanceEvidence: { ...evidence(), decision: "reject" },
      }),
    ).toThrow(InvalidKnowledgeRecordValueError);
    expect(() => createKnowledgeReference({})).toThrow(
      InvalidKnowledgeReferenceValueError,
    );
    expect(() => createAcceptedKnowledgeDecision({})).toThrow(
      InvalidKnowledgeDecisionValueError,
    );
  });

  it("normalizes hostile factory inputs into domain-safe failures", () => {
    const hostile = new Proxy(
      {},
      {
        getPrototypeOf() {
          throw new Error("hostile");
        },
      },
    );
    expect(() => createKnowledgeProvenance(hostile)).toThrow(
      InvalidKnowledgeProvenanceValueError,
    );
    expect(() => createKnowledgeRecord(hostile)).toThrow(
      InvalidKnowledgeRecordValueError,
    );
    expect(() => createKnowledgeAcceptanceEvidence(hostile)).toThrow(
      InvalidKnowledgeAcceptanceEvidenceValueError,
    );
  });
});
