import {
  InvalidKnowledgeInputError,
  InvalidKnowledgeProjectionRequestError,
  KnowledgeProjectionPreparationMismatchError,
  createKnowledgeLifecycleSnapshot,
  createMemoryKnowledgeSourceBinding,
  createMemoryReference,
  createMemorySourceAttribution,
  createMemorySourcePropositionTuple,
  createMemorySourceRelationship,
  createPositiveMemorySourceCurrentnessCorrespondence,
  knowledgeAcceptanceOrder,
  memorySourceIssuerVerificationCorrespondence,
  memorySourceRelationshipIdentity,
  type KnowledgeConstructionValues,
  type KnowledgeIdentity,
  type KnowledgeLifecycleSnapshotResult,
  type KnowledgeRecord,
  type KnowledgeStore,
  type KnowledgeStoreGetResult,
  type KnowledgeStorePutResult,
  type MemorySourceRelationship,
  type PropositionIdentity,
  type PutIndependentAcceptedKnowledgeRequest,
  type PutIndependentAcceptedKnowledgeResult,
  type SupersedeCurrentKnowledgeRequest,
  type SupersedeCurrentKnowledgeResult,
} from "@orion/core";
import { describe, expect, it } from "vitest";

import { KnowledgeEngine } from "../src/index.js";
import { knowledgeEngineTestState } from "../src/knowledge-engine.js";

class TestConstruction implements KnowledgeConstructionValues {
  #knowledge = 0;
  #proposition = 0;

  public nextKnowledgeIdentity(): unknown {
    this.#knowledge += 1;
    return `knowledge-memory-${this.#knowledge}`;
  }

  public nextAcceptedAt(): unknown {
    return "2026-09-01T00:00:00.000Z";
  }

  public nextPropositionIdentity(): PropositionIdentity {
    this.#proposition += 1;
    return `knowledge-proposition-${this.#proposition}` as PropositionIdentity;
  }
}

class TestStore implements KnowledgeStore {
  public readonly records = new Map<KnowledgeIdentity, KnowledgeRecord>();
  public operationCount = 0;

  public async put(record: KnowledgeRecord): Promise<KnowledgeStorePutResult> {
    this.operationCount += 1;
    this.records.set(record.knowledgeIdentity, record);
    return { status: "stored", knowledgeIdentity: record.knowledgeIdentity };
  }

  public async get(
    identity: KnowledgeIdentity,
  ): Promise<KnowledgeStoreGetResult> {
    this.operationCount += 1;
    const record = this.records.get(identity);
    return record === undefined
      ? { status: "not-found" }
      : { status: "found", record };
  }

  public async putIndependentAcceptedKnowledge(
    request: PutIndependentAcceptedKnowledgeRequest,
  ): Promise<PutIndependentAcceptedKnowledgeResult> {
    const result = await this.put(request.record);
    return result.status === "stored"
      ? {
          status: "stored",
          knowledgeIdentity: request.record.knowledgeIdentity,
          acceptanceOrder: knowledgeAcceptanceOrder("memory-order-1"),
        }
      : result;
  }

  public async supersedeCurrentKnowledge(
    request: SupersedeCurrentKnowledgeRequest,
  ): Promise<SupersedeCurrentKnowledgeResult> {
    const result = await this.put(request.successor);
    return result.status === "stored"
      ? {
          status: "superseded",
          predecessorKnowledgeIdentity:
            request.expectedPredecessorKnowledgeIdentity,
          successorKnowledgeIdentity: request.successor.knowledgeIdentity,
          acceptanceOrder: knowledgeAcceptanceOrder("memory-order-2"),
        }
      : result;
  }

  public async loadKnowledgeLifecycleSnapshot(): Promise<KnowledgeLifecycleSnapshotResult> {
    return {
      status: "loaded",
      snapshot: createKnowledgeLifecycleSnapshot({ entries: [] }),
    };
  }
}

async function running(store = new TestStore()) {
  const engine = new KnowledgeEngine(store, new TestConstruction());
  await engine.initialize();
  engine.start();
  return { engine, store };
}

function relationship(
  overrides: Partial<{
    memoryIdentity: string;
    subjectKey: string;
    predicateKey: string;
    textualScalar: string;
    relationshipIdentity: string;
  }> = {},
) {
  return createMemorySourceRelationship({
    sourceAttribution: createMemorySourceAttribution({
      authoritativeCapability: "memory",
    }),
    memoryReference: createMemoryReference(
      overrides.memoryIdentity ?? "memory-accepted",
    ),
    semanticValue: createMemorySourcePropositionTuple({
      subjectKey: overrides.subjectKey ?? "subject",
      predicateKey: overrides.predicateKey ?? "predicate",
      textualScalar: overrides.textualScalar ?? "exact value",
    }),
    relationshipIdentity: memorySourceRelationshipIdentity(
      overrides.relationshipIdentity ?? "memory-relationship-1",
    ),
  });
}

function acceptanceRequest(sourceRelationship: MemorySourceRelationship) {
  return {
    intent: "evaluate",
    claim: "Memory-backed structured proposition.",
    structuredProposition: sourceRelationship.semanticValue,
    samePropositionDeclaration: "same-proposition",
    sourceOwnershipProposal: {
      currentnessOwner: "external-source-currentness",
      applicableOwner: "memory",
      propositionSourceRelationship: sourceRelationship.relationshipIdentity,
    },
    memorySourceBinding: createMemoryKnowledgeSourceBinding({
      kind: "memory-source-relationship",
      relationship: sourceRelationship,
    }),
    acceptanceEvidence: {
      method: "explicit-authority-review",
      authorityIdentifier: "orion.test.memory-authority",
      decision: "accept",
      reason: "Accept the exact Memory-backed candidate.",
    },
    provenance: {
      sourceType: "approved-internal-source",
      originatingCapability: "memory",
      observedAt: "2026-09-01T00:00:00.000Z",
    },
  } as const;
}

function positive(association = "preparation-memory-1") {
  return createPositiveMemorySourceCurrentnessCorrespondence({
    sourceAttribution: createMemorySourceAttribution({
      authoritativeCapability: "memory",
    }),
    relationshipIdentity: memorySourceRelationshipIdentity(
      "memory-relationship-1",
    ),
    candidatePreparationAssociation: association,
    determination: "POSITIVE",
    issuerVerification: memorySourceIssuerVerificationCorrespondence(
      "memory-verification-1",
    ),
  });
}

function projectionRequest(
  knowledgeIdentity: KnowledgeIdentity,
  sourceRelationship: MemorySourceRelationship,
  overrides: Record<string, unknown> = {},
) {
  const association = "preparation-memory-1";
  return {
    intent: "project-structured-knowledge",
    target: { knowledgeIdentity, expectedKnowledgeVersion: 1 },
    preparationPrerequisites: {
      currentnessOwner: "external-source-currentness",
      externalSourceKind: "memory",
      candidatePreparationAssociation: association,
      memorySourceBinding: createMemoryKnowledgeSourceBinding({
        kind: "memory-source-relationship",
        relationship: sourceRelationship,
      }),
      externalCurrentnessCorrespondence: positive(association),
      ...overrides,
    },
  } as const;
}

async function acceptMemory(
  engine: KnowledgeEngine,
  sourceRelationship = relationship(),
) {
  const decision = await engine.evaluateKnowledgeClaim(
    acceptanceRequest(sourceRelationship),
  );
  if (decision.outcome !== "accepted") throw new Error("setup failed");
  return { decision, sourceRelationship };
}

describe("Knowledge Memory-specific currentness consumer", () => {
  it("consumes the exact accepted relationship and issues a Knowledge projection", async () => {
    const setup = await running();
    const accepted = await acceptMemory(setup.engine);
    const operationsBeforeProjection = setup.store.operationCount;
    const projection = setup.engine.projectStructuredKnowledge(
      projectionRequest(
        accepted.decision.record.knowledgeIdentity,
        accepted.sourceRelationship,
      ),
    );

    expect(projection.semanticValue).toEqual(
      accepted.sourceRelationship.semanticValue,
    );
    expect(projection.correspondence.propositionIdentity).not.toBe(
      accepted.sourceRelationship.relationshipIdentity,
    );
    expect(projection.correspondence.attribution).toEqual({
      authoritativeCapability: "knowledge",
    });
    expect(projection.correspondence.candidatePreparationAssociation).toBe(
      "preparation-memory-1",
    );
    expect(Object.isFrozen(projection)).toBe(true);
    expect(Reflect.ownKeys(projection)).toEqual([
      "semanticValue",
      "correspondence",
    ]);
    expect(setup.store.operationCount).toBe(operationsBeforeProjection);
  });

  it.each([
    ["structural clone", () => relationship()],
    [
      "relationship identity substitution",
      () => relationship({ relationshipIdentity: "memory-relationship-2" }),
    ],
    [
      "MemoryReference substitution",
      () => relationship({ memoryIdentity: "memory-substituted" }),
    ],
    ["subject substitution", () => relationship({ subjectKey: "other" })],
    ["predicate substitution", () => relationship({ predicateKey: "other" })],
    ["scalar substitution", () => relationship({ textualScalar: "other" })],
  ])("rejects %s", async (_name, substitute) => {
    const setup = await running();
    const accepted = await acceptMemory(setup.engine);
    expect(() =>
      setup.engine.projectStructuredKnowledge(
        projectionRequest(
          accepted.decision.record.knowledgeIdentity,
          substitute(),
        ),
      ),
    ).toThrow(KnowledgeProjectionPreparationMismatchError);
  });

  it("rejects preparation replay and mismatched positive correspondence", async () => {
    const setup = await running();
    const accepted = await acceptMemory(setup.engine);
    for (const externalCurrentnessCorrespondence of [
      positive("other-preparation"),
      createPositiveMemorySourceCurrentnessCorrespondence({
        ...positive(),
        relationshipIdentity: "memory-relationship-2",
      }),
    ]) {
      expect(() =>
        setup.engine.projectStructuredKnowledge(
          projectionRequest(
            accepted.decision.record.knowledgeIdentity,
            accepted.sourceRelationship,
            { externalCurrentnessCorrespondence },
          ),
        ),
      ).toThrow(KnowledgeProjectionPreparationMismatchError);
    }
  });

  it("rejects malformed acceptance binding and a non-POSITIVE prerequisite", async () => {
    const setup = await running();
    const sourceRelationship = relationship();
    await expect(
      setup.engine.evaluateKnowledgeClaim({
        ...acceptanceRequest(sourceRelationship),
        memorySourceBinding: {
          kind: "memory-source-relationship",
          relationship: relationship({ textualScalar: "other" }),
        },
      }),
    ).rejects.toThrow(InvalidKnowledgeInputError);

    const accepted = await acceptMemory(setup.engine, sourceRelationship);
    expect(() =>
      setup.engine.projectStructuredKnowledge({
        ...projectionRequest(
          accepted.decision.record.knowledgeIdentity,
          sourceRelationship,
        ),
        preparationPrerequisites: {
          ...projectionRequest(
            accepted.decision.record.knowledgeIdentity,
            sourceRelationship,
          ).preparationPrerequisites,
          externalCurrentnessCorrespondence: { determination: "NEGATIVE" },
        },
      }),
    ).toThrow(InvalidKnowledgeProjectionRequestError);
  });

  it("does not expose private capture or reconstruct it in another instance", async () => {
    const first = await running();
    const accepted = await acceptMemory(first.engine);
    expect(Reflect.ownKeys(first.engine)).not.toContain(
      "acceptedMemorySourceRelationships",
    );

    const second = await running();
    second.engine[knowledgeEngineTestState](accepted.decision.record);
    expect(() =>
      second.engine.projectStructuredKnowledge(
        projectionRequest(
          accepted.decision.record.knowledgeIdentity,
          accepted.sourceRelationship,
        ),
      ),
    ).toThrow(KnowledgeProjectionPreparationMismatchError);
  });
});
