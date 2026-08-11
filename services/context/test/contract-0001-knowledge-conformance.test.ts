import {
  ContextLineageNotFoundError,
  InvalidKnowledgeContextProjectionError,
  InvalidKnowledgeIdentityError,
  InvalidKnowledgeInputError,
  InvalidKnowledgeStateError,
  KnowledgeNotFoundError,
  KnowledgeStoreUnavailableError,
  anonymousCurrentIdentity,
  createKnowledgeReference,
  type ActiveContextRevision,
  type ComposeContextRevisionWithKnowledgeRequest,
  type ContextConstructionValues,
  type GetActiveContextRevision,
  type GetKnowledge,
  type GetKnowledgeRequest,
  type IdentityResolutionRequest,
  type KnowledgeReference,
  type PrepareContextRevision,
  type PrepareContextRevisionWithKnowledge,
  type ResolveCurrentIdentity,
  type RetrievedKnowledge,
} from "@orion/core";
import { describe, expect, it } from "vitest";

import { ContextEngine } from "../src/context-engine.js";

const FIRST_LINEAGE_IDENTITY =
  "orion.context.contract-0001.knowledge.lineage.1";

interface Contract0001KnowledgeSubject {
  readonly prepareIdentity: PrepareContextRevision["prepareContextRevision"];
  readonly prepareKnowledge: PrepareContextRevisionWithKnowledge["prepareContextRevisionWithKnowledge"];
  readonly getActive: GetActiveContextRevision["getActiveContextRevision"];
  readonly incorporationRequests: readonly ComposeContextRevisionWithKnowledgeRequest[];
}

type Contract0001KnowledgeSubjectFactory = (
  identityResolver: ResolveCurrentIdentity,
  knowledgeResolver: GetKnowledge,
  events?: string[],
) => Contract0001KnowledgeSubject;

class ConformanceConstructionValues implements ContextConstructionValues {
  #lineage = 0;
  #revision = 0;

  public nextLineageIdentity(): unknown {
    this.#lineage += 1;
    return `orion.context.contract-0001.knowledge.lineage.${this.#lineage}`;
  }

  public nextRevisionIdentity(): unknown {
    this.#revision += 1;
    return `orion.context.contract-0001.knowledge.revision.${this.#revision}`;
  }

  public nextCreatedAt(): unknown {
    return "2026-08-11T00:00:00.000Z";
  }
}

class TestKnowledgeSourceFailure extends Error {
  public constructor() {
    super("Knowledge retrieval failed.");
    this.name = "TestKnowledgeSourceFailure";
  }
}

class ObservableKnowledgeContextEngine extends ContextEngine {
  public readonly incorporationRequests: ComposeContextRevisionWithKnowledgeRequest[] =
    [];

  public constructor(
    construction: ContextConstructionValues,
    identityResolver: ResolveCurrentIdentity,
    knowledgeResolver: GetKnowledge,
    private readonly events: string[],
  ) {
    super(construction, identityResolver, knowledgeResolver);
  }

  public override composeContextRevisionWithKnowledge(
    request: ComposeContextRevisionWithKnowledgeRequest,
  ): ActiveContextRevision;
  public override composeContextRevisionWithKnowledge(
    request: unknown,
  ): ActiveContextRevision;
  public override composeContextRevisionWithKnowledge(
    request: unknown,
  ): ActiveContextRevision {
    this.events.push("incorporation");
    this.incorporationRequests.push(
      request as ComposeContextRevisionWithKnowledgeRequest,
    );
    return super.composeContextRevisionWithKnowledge(request);
  }
}

function createKnowledgeSubject(
  identityResolver: ResolveCurrentIdentity,
  knowledgeResolver: GetKnowledge,
  events: string[] = [],
): Contract0001KnowledgeSubject {
  const engine = new ObservableKnowledgeContextEngine(
    new ConformanceConstructionValues(),
    identityResolver,
    knowledgeResolver,
    events,
  );
  engine.initialize();
  engine.start();
  return Object.freeze({
    prepareIdentity: engine.prepareContextRevision.bind(engine),
    prepareKnowledge: engine.prepareContextRevisionWithKnowledge.bind(engine),
    getActive: engine.getActiveContextRevision.bind(engine),
    incorporationRequests: engine.incorporationRequests,
  });
}

function knowledgeReference(
  version = 1,
  currency: "current" | "superseded" = "current",
): KnowledgeReference {
  return createKnowledgeReference({
    knowledgeIdentity: "orion.knowledge.contract-0001",
    version,
    currency,
  });
}

function retrievedKnowledge(
  reference: KnowledgeReference = knowledgeReference(),
  sourceRecord: object = Object.freeze({ sourceOwned: true }),
): RetrievedKnowledge {
  return Object.freeze({
    knowledge: sourceRecord as never,
    reference,
  });
}

function newKnowledgePreparation(
  identityResolutionRequest: IdentityResolutionRequest = {},
  knowledgeRetrievalRequest: GetKnowledgeRequest = {
    knowledgeIdentity: "orion.knowledge.contract-0001",
  },
) {
  return {
    target: { kind: "new-lineage" as const },
    identityResolutionRequest,
    knowledgeRetrievalRequest,
  };
}

function defineContract0001KnowledgeConformance(
  createSubject: Contract0001KnowledgeSubjectFactory,
): void {
  describe("CONTRACT-0001 Knowledge specialization retrieval semantics", () => {
    it("preserves Context initiation, request opacity, and both candidate boundaries", () => {
      const events: string[] = [];
      const identityCandidate = anonymousCurrentIdentity();
      const reference = knowledgeReference();
      const identityRequest = new Proxy(
        { resolutionReference: "identity-owned-reference" },
        {
          get(target, property, receiver) {
            if (property !== "resolutionReference") {
              throw new Error("Context inspected Identity request fields.");
            }
            return Reflect.get(target, property, receiver) as unknown;
          },
        },
      ) as IdentityResolutionRequest;
      const knowledgeRequest = new Proxy(
        { knowledgeIdentity: "orion.knowledge.contract-0001" },
        {
          get(target, property, receiver) {
            if (property !== "knowledgeIdentity") {
              throw new Error("Context inspected Knowledge request fields.");
            }
            return Reflect.get(target, property, receiver) as unknown;
          },
        },
      ) as GetKnowledgeRequest;
      const identityResolver: ResolveCurrentIdentity = {
        resolveCurrentIdentity(request) {
          events.push("identity-retrieval");
          expect(request).toBe(identityRequest);
          expect(request.resolutionReference).toBe("identity-owned-reference");
          expect(() =>
            subject.getActive({ lineageIdentity: FIRST_LINEAGE_IDENTITY }),
          ).toThrow(ContextLineageNotFoundError);
          expect(subject.incorporationRequests).toHaveLength(0);
          events.push("identity-candidate-available");
          return identityCandidate;
        },
      };
      const knowledgeResolver: GetKnowledge = {
        getKnowledge(request) {
          events.push("knowledge-retrieval");
          expect(request).toBe(knowledgeRequest);
          expect(request.knowledgeIdentity).toBe(
            "orion.knowledge.contract-0001",
          );
          expect(() =>
            subject.getActive({ lineageIdentity: FIRST_LINEAGE_IDENTITY }),
          ).toThrow(ContextLineageNotFoundError);
          expect(subject.incorporationRequests).toHaveLength(0);
          events.push("knowledge-candidate-available");
          return retrievedKnowledge(reference);
        },
      };
      const subject = createSubject(
        identityResolver,
        knowledgeResolver,
        events,
      );

      const revision = subject.prepareKnowledge(
        newKnowledgePreparation(identityRequest, knowledgeRequest),
      );

      expect(events.indexOf("identity-candidate-available")).toBeLessThan(
        events.indexOf("incorporation"),
      );
      expect(events.indexOf("knowledge-candidate-available")).toBeLessThan(
        events.indexOf("incorporation"),
      );
      expect(subject.incorporationRequests).toHaveLength(1);
      expect(subject.incorporationRequests[0]?.currentIdentity).toBe(
        identityCandidate,
      );
      expect(subject.incorporationRequests[0]?.knowledgeReference).toBe(
        reference,
      );
      expect(revision.lifecycleState).toBe("active");
    });

    it("incorporates only reconstructed projections in the two fixed profiles", () => {
      const reference = knowledgeReference();
      const sourceRecord = Object.freeze({
        claim: "source-only",
        provenance: Object.freeze({ origin: "source-only" }),
        acceptanceEvidence: "source-only",
        acceptedAt: "2026-08-11T00:00:00.000Z",
      });
      const subject = createSubject(
        { resolveCurrentIdentity: () => anonymousCurrentIdentity() },
        { getKnowledge: () => retrievedKnowledge(reference, sourceRecord) },
      );

      const identityOnly = subject.prepareIdentity({
        target: { kind: "new-lineage" },
        identityResolutionRequest: {},
      });
      const knowledgeAware = subject.prepareKnowledge(
        newKnowledgePreparation(),
      );

      expect(identityOnly.fragments.map(({ kind }) => kind)).toEqual([
        "identity",
      ]);
      expect(identityOnly.creationMetadata).toMatchObject({
        sourceCount: 1,
        fragmentCount: 1,
      });
      expect(knowledgeAware.fragments.map(({ kind }) => kind)).toEqual([
        "identity",
        "knowledge",
      ]);
      expect(knowledgeAware.creationMetadata).toMatchObject({
        sourceCount: 2,
        fragmentCount: 2,
      });
      const knowledgeFragment = knowledgeAware.fragments[1];
      if (knowledgeFragment === undefined) throw new Error();
      const projection = knowledgeFragment.projection;
      expect(Object.keys(projection)).toEqual([
        "knowledgeIdentity",
        "validationState",
        "version",
        "currency",
        "authoritativeOwner",
      ]);
      expect(projection).toEqual({
        knowledgeIdentity: "orion.knowledge.contract-0001",
        validationState: "accepted",
        version: 1,
        currency: "current",
        authoritativeOwner: "knowledge",
      });
      expect(projection).not.toBe(reference);
      expect(JSON.stringify(knowledgeAware)).not.toContain("source-only");
      expect(Object.isFrozen(projection)).toBe(true);
    });

    it("leaves no Context state or incorporation after a source-owned Knowledge failure", () => {
      const failure = new TestKnowledgeSourceFailure();
      const subject = createSubject(
        { resolveCurrentIdentity: () => anonymousCurrentIdentity() },
        {
          getKnowledge: () => {
            throw failure;
          },
        },
      );

      let observed: unknown;
      try {
        subject.prepareKnowledge(newKnowledgePreparation());
      } catch (error: unknown) {
        observed = error;
      }

      expect(observed).toBe(failure);
      expect(subject.incorporationRequests).toHaveLength(0);
      expect(() =>
        subject.getActive({ lineageIdentity: FIRST_LINEAGE_IDENTITY }),
      ).toThrow(ContextLineageNotFoundError);
    });

    it("preserves an existing Active revision after partial retrieval failure", () => {
      const failure = new TestKnowledgeSourceFailure();
      let retrieval = 0;
      const subject = createSubject(
        { resolveCurrentIdentity: () => anonymousCurrentIdentity() },
        {
          getKnowledge: () => {
            retrieval += 1;
            if (retrieval === 1) return retrievedKnowledge();
            throw failure;
          },
        },
      );
      const active = subject.prepareKnowledge(newKnowledgePreparation());

      let observed: unknown;
      try {
        subject.prepareKnowledge({
          target: {
            kind: "existing-lineage",
            lineageIdentity: active.lineageIdentity,
            expectedActiveRevisionIdentity: active.revisionIdentity,
          },
          identityResolutionRequest: {},
          knowledgeRetrievalRequest: {
            knowledgeIdentity: "orion.knowledge.contract-0001",
          },
        });
      } catch (error: unknown) {
        observed = error;
      }

      expect(observed).toBe(failure);
      expect(subject.incorporationRequests).toHaveLength(1);
      expect(
        subject.getActive({ lineageIdentity: active.lineageIdentity }),
      ).toBe(active);
      expect(active.lifecycleState).toBe("active");
      expect(Object.isFrozen(active)).toBe(true);
    });

    it("separates malformed candidate rejection from source failure", () => {
      let retrieval = 0;
      const malformedReference = Object.freeze({
        knowledgeIdentity: "orion.knowledge.contract-0001",
        validationState: "accepted",
        version: 1,
        currency: "current",
        authoritativeCapability: "not-knowledge",
      });
      const subject = createSubject(
        { resolveCurrentIdentity: () => anonymousCurrentIdentity() },
        {
          getKnowledge: () => {
            retrieval += 1;
            return retrieval === 1
              ? retrievedKnowledge()
              : retrievedKnowledge(malformedReference as never);
          },
        },
      );
      const active = subject.prepareKnowledge(newKnowledgePreparation());

      expect(() =>
        subject.prepareKnowledge({
          target: {
            kind: "existing-lineage",
            lineageIdentity: active.lineageIdentity,
            expectedActiveRevisionIdentity: active.revisionIdentity,
          },
          identityResolutionRequest: {},
          knowledgeRetrievalRequest: {
            knowledgeIdentity: "orion.knowledge.contract-0001",
          },
        }),
      ).toThrow(InvalidKnowledgeContextProjectionError);
      expect(subject.incorporationRequests).toHaveLength(2);
      expect(subject.incorporationRequests[1]?.knowledgeReference).toBe(
        malformedReference,
      );
      expect(
        subject.getActive({ lineageIdentity: active.lineageIdentity }),
      ).toBe(active);
    });

    it("reuses equivalent semantics and treats currency as content, not validity", () => {
      let retrieval = 0;
      const subject = createSubject(
        { resolveCurrentIdentity: () => anonymousCurrentIdentity() },
        {
          getKnowledge: () => {
            retrieval += 1;
            if (retrieval < 3) {
              return retrievedKnowledge(
                knowledgeReference(),
                Object.freeze({ transientAllocation: retrieval }),
              );
            }
            return retrievedKnowledge(knowledgeReference(2, "superseded"));
          },
        },
      );
      const first = subject.prepareKnowledge(newKnowledgePreparation());
      const repeated = subject.prepareKnowledge({
        target: {
          kind: "existing-lineage",
          lineageIdentity: first.lineageIdentity,
          expectedActiveRevisionIdentity: first.revisionIdentity,
        },
        identityResolutionRequest: {},
        knowledgeRetrievalRequest: {
          knowledgeIdentity: "orion.knowledge.contract-0001",
        },
      });
      const successor = subject.prepareKnowledge({
        target: {
          kind: "existing-lineage",
          lineageIdentity: first.lineageIdentity,
          expectedActiveRevisionIdentity: first.revisionIdentity,
        },
        identityResolutionRequest: {},
        knowledgeRetrievalRequest: {
          knowledgeIdentity: "orion.knowledge.contract-0001",
        },
      });

      expect(repeated).toBe(first);
      expect(successor).not.toBe(first);
      expect(successor.revisionNumber).toBe(2);
      expect(successor.lifecycleState).toBe("active");
      const knowledgeFragment = successor.fragments[1];
      if (knowledgeFragment === undefined) throw new Error();
      expect(knowledgeFragment.projection).toMatchObject({
        version: 2,
        currency: "superseded",
      });
    });
  });
}

defineContract0001KnowledgeConformance(createKnowledgeSubject);

describe("CONTRACT-0001 Knowledge specialization failure ownership", () => {
  it.each([
    new InvalidKnowledgeInputError(),
    new InvalidKnowledgeIdentityError(),
    new KnowledgeNotFoundError(),
    new KnowledgeStoreUnavailableError(),
    new InvalidKnowledgeStateError(),
  ])("propagates the exact %s instance", (failure) => {
    const subject = createKnowledgeSubject(
      { resolveCurrentIdentity: () => anonymousCurrentIdentity() },
      {
        getKnowledge: () => {
          throw failure;
        },
      },
    );

    let observed: unknown;
    try {
      subject.prepareKnowledge(newKnowledgePreparation());
    } catch (error: unknown) {
      observed = error;
    }

    expect(observed).toBe(failure);
    expect(subject.incorporationRequests).toHaveLength(0);
  });
});
