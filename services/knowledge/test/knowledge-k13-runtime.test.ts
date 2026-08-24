import {
  InvalidKnowledgeInputError,
  InvalidKnowledgeProjectionRequestError,
  InvalidKnowledgeProjectionVerificationRequestError,
  InvalidKnowledgeStateError,
  KnowledgeNotFoundError,
  KnowledgeProjectionAuthorityVerificationError,
  KnowledgeProjectionIneligibleError,
  KnowledgeProjectionPreparationMismatchError,
  KnowledgeProjectionVersionMismatchError,
  createKnowledgeLifecycleSnapshot,
  knowledgeAcceptanceOrder,
  type KnowledgeConstructionValues,
  type KnowledgeIdentity,
  type KnowledgeRecord,
  type KnowledgeStore,
  type KnowledgeStoreGetResult,
  type KnowledgeStorePutResult,
  type PutIndependentAcceptedKnowledgeRequest,
  type PutIndependentAcceptedKnowledgeResult,
  type SupersedeCurrentKnowledgeRequest,
  type SupersedeCurrentKnowledgeResult,
  type KnowledgeLifecycleSnapshotResult,
} from "@orion/core";
import { describe, expect, it } from "vitest";

import { KnowledgeEngine } from "../src/index.js";

class TestConstruction implements KnowledgeConstructionValues {
  public knowledgeCalls = 0;
  public propositionCalls = 0;
  public acceptedAtCalls = 0;

  public nextKnowledgeIdentity(): unknown {
    this.knowledgeCalls += 1;
    return `knowledge-${this.knowledgeCalls}`;
  }

  public nextAcceptedAt(): unknown {
    this.acceptedAtCalls += 1;
    return `2026-08-17T0${this.acceptedAtCalls}:00:00.000Z`;
  }

  public nextPropositionIdentity() {
    this.propositionCalls += 1;
    return `proposition-${this.propositionCalls}` as never;
  }
}

class LegacyConstruction implements KnowledgeConstructionValues {
  #identity = 0;

  public nextKnowledgeIdentity(): unknown {
    this.#identity += 1;
    return `legacy-knowledge-${this.#identity}`;
  }

  public nextAcceptedAt(): unknown {
    return "2026-08-17T01:00:00.000Z";
  }
}

class TestStore implements KnowledgeStore {
  readonly records = new Map<KnowledgeIdentity, KnowledgeRecord>();
  public getOverride: unknown;

  public async put(record: KnowledgeRecord): Promise<KnowledgeStorePutResult> {
    if (this.records.has(record.knowledgeIdentity))
      return { status: "duplicate" };
    this.records.set(record.knowledgeIdentity, record);
    return { status: "stored", knowledgeIdentity: record.knowledgeIdentity };
  }

  public async get(
    identity: KnowledgeIdentity,
  ): Promise<KnowledgeStoreGetResult> {
    if (this.getOverride !== undefined) {
      return this.getOverride as KnowledgeStoreGetResult;
    }
    const record = this.records.get(identity);
    return record === undefined
      ? { status: "not-found" }
      : { status: "found", record };
  }

  public async putIndependentAcceptedKnowledge(
    request: PutIndependentAcceptedKnowledgeRequest,
  ): Promise<PutIndependentAcceptedKnowledgeResult> {
    const result = await this.put(request.record);
    if (
      result.status === "stored" &&
      result.knowledgeIdentity === request.record.knowledgeIdentity
    ) {
      return {
        status: "stored",
        knowledgeIdentity: request.record.knowledgeIdentity,
        acceptanceOrder: knowledgeAcceptanceOrder(
          `test-order-${this.records.size}`,
        ),
      };
    }
    return result as PutIndependentAcceptedKnowledgeResult;
  }

  public async supersedeCurrentKnowledge(
    request: SupersedeCurrentKnowledgeRequest,
  ): Promise<SupersedeCurrentKnowledgeResult> {
    const result = await this.put(request.successor);
    if (
      result.status === "stored" &&
      result.knowledgeIdentity === request.successor.knowledgeIdentity
    ) {
      return {
        status: "superseded",
        predecessorKnowledgeIdentity:
          request.expectedPredecessorKnowledgeIdentity,
        successorKnowledgeIdentity: request.successor.knowledgeIdentity,
        acceptanceOrder: knowledgeAcceptanceOrder(
          `test-order-${this.records.size}`,
        ),
      };
    }
    return result as SupersedeCurrentKnowledgeResult;
  }

  public async loadKnowledgeLifecycleSnapshot(): Promise<KnowledgeLifecycleSnapshotResult> {
    return {
      status: "loaded",
      snapshot: createKnowledgeLifecycleSnapshot({ entries: [] }),
    };
  }
}

async function running(
  store = new TestStore(),
  construction: KnowledgeConstructionValues = new TestConstruction(),
) {
  const engine = new KnowledgeEngine(store, construction);
  await engine.initialize();
  engine.start();
  return { engine, store, construction };
}

function evidence(decision: "accept" | "reject" = "accept") {
  return {
    method: "explicit-authority-review",
    authorityIdentifier: "orion.test.authority",
    decision,
    reason: "The complete candidate was explicitly reviewed.",
  };
}

function provenance() {
  return {
    sourceType: "approved-internal-source",
    originatingCapability: "orion.test",
    observedAt: "2026-08-17T00:00:00.000Z",
  };
}

function tuple(value = "exact value") {
  return {
    subjectKey: "subject",
    predicateKey: "predicate",
    textualScalar: value,
  };
}

function structuredRequest(
  owner: "knowledge" | "external" = "knowledge",
  decision: "accept" | "reject" = "accept",
) {
  return {
    intent: "evaluate",
    claim: "Opaque candidate claim.",
    structuredProposition: tuple(),
    samePropositionDeclaration: "same-proposition",
    sourceOwnershipProposal:
      owner === "knowledge"
        ? { currentnessOwner: "knowledge-owned-currentness" }
        : {
            currentnessOwner: "external-source-currentness",
            applicableOwner: "external-owner-1",
            propositionSourceRelationship: "relationship-1",
          },
    acceptanceEvidence: evidence(decision),
    provenance: provenance(),
  };
}

async function accepted(
  engine: KnowledgeEngine,
  owner: "knowledge" | "external",
) {
  const result = await engine.evaluateKnowledgeClaim(structuredRequest(owner));
  if (result.outcome !== "accepted") throw new Error("setup failed");
  return result;
}

function knowledgeProjectionRequest(
  identity: string,
  version = 1,
  association = "prep-a",
) {
  return {
    intent: "project-structured-knowledge",
    target: { knowledgeIdentity: identity, expectedKnowledgeVersion: version },
    preparationPrerequisites: {
      candidatePreparationAssociation: association,
      currentnessOwner: "knowledge-owned-currentness",
    },
  };
}

function externalProjectionRequest(
  identity: string,
  overrides: Record<string, unknown> = {},
) {
  return {
    intent: "project-structured-knowledge",
    target: { knowledgeIdentity: identity, expectedKnowledgeVersion: 1 },
    preparationPrerequisites: {
      candidatePreparationAssociation: "prep-a",
      currentnessOwner: "external-source-currentness",
      externalCurrentnessCorrespondence: {
        applicableOwner: "external-owner-1",
        candidatePreparationAssociation: "prep-a",
        propositionSourceRelationship: "relationship-1",
        determination: "current",
        issuerVerification: "issuer-verification-1",
        ...overrides,
      },
    },
  };
}

describe("Knowledge 1.3 structured acceptance", async () => {
  it.each(["knowledge", "external"] as const)(
    "accepts and round-trips the %s-owned correspondence",
    async (owner) => {
      const setup = await running();
      const result = await accepted(setup.engine, owner);
      expect((setup.construction as TestConstruction).propositionCalls).toBe(1);
      expect(result.record.acceptedStructuredProposition).toBeDefined();
      const stored = structuredClone(result.record);
      setup.store.getOverride = { status: "found", record: stored };
      const retrieved = setup.engine.getKnowledge({
        knowledgeIdentity: result.record.knowledgeIdentity,
      }).knowledge;
      expect(retrieved).toEqual(result.record);
      expect(Object.isFrozen(retrieved)).toBe(true);
      expect(Object.isFrozen(retrieved.acceptedStructuredProposition)).toBe(
        true,
      );
      expect(retrieved).not.toHaveProperty("sourceOwnershipProposal");
      expect(retrieved).not.toHaveProperty("candidatePreparationAssociation");
    },
  );

  it("allocates PropositionIdentity only after successful complete validation", async () => {
    const setup = await running();
    const missingDeclaration = Object.fromEntries(
      Object.entries(structuredRequest()).filter(
        ([field]) => field !== "samePropositionDeclaration",
      ),
    );
    await expect(
      setup.engine.evaluateKnowledgeClaim(missingDeclaration),
    ).rejects.toThrow(InvalidKnowledgeInputError);
    await expect(
      setup.engine.evaluateKnowledgeClaim({
        ...structuredRequest(),
        samePropositionDeclaration: "different-proposition",
      }),
    ).rejects.toThrow(InvalidKnowledgeInputError);
    expect((setup.construction as TestConstruction).propositionCalls).toBe(0);
    expect(
      await setup.engine.evaluateKnowledgeClaim(
        structuredRequest("knowledge", "reject"),
      ),
    ).toEqual({
      outcome: "rejected",
      category: "authority-rejected",
    });
    expect((setup.construction as TestConstruction).propositionCalls).toBe(0);
    await accepted(setup.engine, "knowledge");
    expect((setup.construction as TestConstruction).propositionCalls).toBe(1);
  });

  it("rejects unsupported or incomplete ownership proposals", async () => {
    const setup = await running();
    for (const sourceOwnershipProposal of [
      { currentnessOwner: "caller-choice" },
      { currentnessOwner: "external-source-currentness" },
      {
        currentnessOwner: "knowledge-owned-currentness",
        propositionSourceRelationship: "not-applicable",
      },
    ]) {
      await expect(
        setup.engine.evaluateKnowledgeClaim({
          ...structuredRequest(),
          sourceOwnershipProposal,
        }),
      ).rejects.toThrow(InvalidKnowledgeInputError);
    }
    expect((setup.construction as TestConstruction).propositionCalls).toBe(0);
  });

  it("requires the structured-only allocator while preserving legacy acceptance", async () => {
    const setup = await running(new TestStore(), new LegacyConstruction());
    const legacy = await setup.engine.evaluateKnowledgeClaim({
      intent: "evaluate",
      claim: "Legacy claim.",
      acceptanceEvidence: evidence(),
      provenance: provenance(),
    });
    expect(legacy.outcome).toBe("accepted");
    if (legacy.outcome !== "accepted") throw new Error("setup failed");
    expect(legacy.record).not.toHaveProperty("acceptedStructuredProposition");
    await expect(
      setup.engine.evaluateKnowledgeClaim(structuredRequest()),
    ).rejects.toThrow(InvalidKnowledgeStateError);
  });
});

describe("Knowledge 1.3 projection currentness and targeting", async () => {
  it("projects only an exact current Knowledge-owned proposition", async () => {
    const setup = await running();
    const result = await accepted(setup.engine, "knowledge");
    const projection = setup.engine.projectStructuredKnowledge(
      knowledgeProjectionRequest(result.record.knowledgeIdentity),
    );
    expect(projection.semanticValue).toEqual(tuple());
    expect(projection.correspondence.attribution).toEqual({
      authoritativeCapability: "knowledge",
    });
    expect(
      projection.correspondence.knowledgeOwnedCurrentnessDetermination?.outcome,
    ).toBe("positive");
    expect(projection.correspondence.candidatePreparationAssociation).toBe(
      "prep-a",
    );
    expect(projection).not.toHaveProperty("claim");
    expect(projection).not.toHaveProperty("provenance");
    expect(projection).not.toHaveProperty("record");
  });

  it("treats superseded lifecycle standing as projection ineligibility", async () => {
    const setup = await running();
    const predecessor = await accepted(setup.engine, "knowledge");
    const successor = await setup.engine.evaluateKnowledgeClaim({
      ...structuredRequest(),
      contradictsKnowledgeIdentity: predecessor.record.knowledgeIdentity,
      contradictionDecision: "supersede-existing",
      contradictionReason: "Replace the exact lifecycle proposition.",
    });
    expect(successor.outcome).toBe("accepted");
    expect(() =>
      setup.engine.projectStructuredKnowledge(
        knowledgeProjectionRequest(predecessor.record.knowledgeIdentity),
      ),
    ).toThrow(KnowledgeProjectionIneligibleError);
  });

  it("uses reconstructed currentness despite later Store changes", async () => {
    const setup = await running();
    const result = await accepted(setup.engine, "knowledge");
    const inconsistentRecord = structuredClone(result.record) as Record<
      string,
      unknown
    >;
    inconsistentRecord.version = 2;
    setup.store.getOverride = { status: "found", record: inconsistentRecord };
    const projection = setup.engine.projectStructuredKnowledge(
      knowledgeProjectionRequest(result.record.knowledgeIdentity),
    );
    expect(
      "knowledgeOwnedCurrentnessDetermination" in projection.correspondence
        ? projection.correspondence.knowledgeOwnedCurrentnessDetermination
        : undefined,
    ).toMatchObject({ outcome: "positive" });
  });

  it("rejects absent, mismatched, and legacy targets without fallback", async () => {
    const setup = await running();
    expect(() =>
      setup.engine.projectStructuredKnowledge(
        knowledgeProjectionRequest("missing"),
      ),
    ).toThrow(KnowledgeNotFoundError);
    const structured = await accepted(setup.engine, "knowledge");
    expect(() =>
      setup.engine.projectStructuredKnowledge(
        knowledgeProjectionRequest(structured.record.knowledgeIdentity, 2),
      ),
    ).toThrow(KnowledgeProjectionVersionMismatchError);
    const legacy = await setup.engine.evaluateKnowledgeClaim({
      intent: "evaluate",
      claim: "Legacy claim.",
      acceptanceEvidence: evidence(),
      provenance: provenance(),
    });
    if (legacy.outcome !== "accepted") throw new Error("setup failed");
    expect(() =>
      setup.engine.projectStructuredKnowledge(
        knowledgeProjectionRequest(legacy.record.knowledgeIdentity),
      ),
    ).toThrow(KnowledgeProjectionIneligibleError);
  });

  it("rejects malformed requests and owner mismatch", async () => {
    const setup = await running();
    const result = await accepted(setup.engine, "knowledge");
    expect(() => setup.engine.projectStructuredKnowledge({})).toThrow(
      InvalidKnowledgeProjectionRequestError,
    );
    expect(() =>
      setup.engine.projectStructuredKnowledge(
        externalProjectionRequest(result.record.knowledgeIdentity),
      ),
    ).toThrow(KnowledgeProjectionPreparationMismatchError);
  });

  it("validates exact external owner, relationship, and preparation", async () => {
    const setup = await running();
    const result = await accepted(setup.engine, "external");
    const projection = setup.engine.projectStructuredKnowledge(
      externalProjectionRequest(result.record.knowledgeIdentity),
    );
    expect(
      projection.correspondence.externalCurrentnessCorrespondence,
    ).toMatchObject({
      applicableOwner: "external-owner-1",
      propositionSourceRelationship: "relationship-1",
      candidatePreparationAssociation: "prep-a",
      determination: "current",
      issuerVerification: "issuer-verification-1",
    });
    expect(projection.correspondence.underlyingSourceAuthority).toBe(
      "issuer-verification-1",
    );
    for (const overrides of [
      { applicableOwner: "other-owner" },
      { propositionSourceRelationship: "other-relationship" },
    ]) {
      expect(() =>
        setup.engine.projectStructuredKnowledge(
          externalProjectionRequest(result.record.knowledgeIdentity, overrides),
        ),
      ).toThrow(KnowledgeProjectionPreparationMismatchError);
    }
    expect(() =>
      setup.engine.projectStructuredKnowledge({
        ...externalProjectionRequest(result.record.knowledgeIdentity),
        preparationPrerequisites: {
          ...externalProjectionRequest(result.record.knowledgeIdentity)
            .preparationPrerequisites,
          candidatePreparationAssociation: "prep-b",
        },
      }),
    ).toThrow(InvalidKnowledgeProjectionRequestError);
    for (const overrides of [
      { determination: "not-current" },
      { issuerVerification: "" },
    ]) {
      expect(() =>
        setup.engine.projectStructuredKnowledge(
          externalProjectionRequest(result.record.knowledgeIdentity, overrides),
        ),
      ).toThrow(InvalidKnowledgeProjectionRequestError);
    }
  });
});

describe("Knowledge 1.3 projection authority", async () => {
  it("issues only after capture and verifies the exact object", async () => {
    const setup = await running();
    const result = await accepted(setup.engine, "knowledge");
    const projection = setup.engine.projectStructuredKnowledge(
      knowledgeProjectionRequest(result.record.knowledgeIdentity),
    );
    expect(projection.correspondence.issuance).toBeDefined();
    expect(Object.isFrozen(projection)).toBe(true);
    expect(
      setup.engine.verifyStructuredKnowledgeProjectionAuthority({
        intent: "verify-knowledge-projection-authority",
        candidate: projection,
      }),
    ).toBe(projection);

    const clone = Object.freeze({
      ...projection,
      correspondence: Object.freeze({ ...projection.correspondence }),
    });
    expect(clone).toEqual(projection);
    expect(() =>
      setup.engine.verifyStructuredKnowledgeProjectionAuthority({
        intent: "verify-knowledge-projection-authority",
        candidate: clone,
      }),
    ).toThrow(KnowledgeProjectionAuthorityVerificationError);
    const foreignEngine = (await running()).engine;
    expect(() =>
      foreignEngine.verifyStructuredKnowledgeProjectionAuthority({
        intent: "verify-knowledge-projection-authority",
        candidate: projection,
      }),
    ).toThrow(KnowledgeProjectionAuthorityVerificationError);
    expect(setup.engine).not.toHaveProperty(
      "captureStructuredKnowledgeProjectionAuthority",
    );
  });

  it("rejects malformed verifier requests", async () => {
    const setup = await running();
    expect(() =>
      setup.engine.verifyStructuredKnowledgeProjectionAuthority({}),
    ).toThrow(InvalidKnowledgeProjectionVerificationRequestError);
    expect(() =>
      setup.engine.verifyStructuredKnowledgeProjectionAuthority({
        intent: "wrong-intent",
        candidate: {},
      }),
    ).toThrow(InvalidKnowledgeProjectionVerificationRequestError);
  });

  it("preserves GetKnowledge and reference behavior", async () => {
    const setup = await running();
    const result = await accepted(setup.engine, "knowledge");
    expect(
      setup.engine.getKnowledge({
        knowledgeIdentity: result.record.knowledgeIdentity,
      }).knowledge,
    ).toEqual(result.record);
    expect(setup.engine.listKnowledgeReferences({})).toEqual([
      result.reference,
    ]);
  });
});
