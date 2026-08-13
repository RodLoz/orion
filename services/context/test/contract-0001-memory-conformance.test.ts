import {
  ContextLineageNotFoundError,
  InvalidMemoryContextProjectionError,
  InvalidMemoryIdentityError,
  InvalidMemoryInputError,
  InvalidMemoryStateError,
  MemoryNotFoundError,
  MemoryStoreUnavailableError,
  anonymousCurrentIdentity,
  createMemoryReference,
  type ActiveContextRevision,
  type ComposeContextRevisionWithMemoryRequest,
  type ContextConstructionValues,
  type GetActiveContextRevision,
  type GetMemory,
  type GetMemoryRequest,
  type IdentityResolutionRequest,
  type MemoryReference,
  type PrepareContextRevisionWithMemory,
  type ResolveCurrentIdentity,
  type RetrievedMemory,
} from "@orion/core";
import { describe, expect, it } from "vitest";

import { ContextEngine } from "../src/context-engine.js";

const FIRST_LINEAGE_IDENTITY = "orion.context.contract-0001.memory.lineage.1";

interface Contract0001MemorySubject {
  readonly prepare: PrepareContextRevisionWithMemory["prepareContextRevisionWithMemory"];
  readonly getActive: GetActiveContextRevision["getActiveContextRevision"];
  readonly incorporationRequests: readonly ComposeContextRevisionWithMemoryRequest[];
}

type Contract0001MemorySubjectFactory = (
  identityResolver: ResolveCurrentIdentity,
  memoryResolver: GetMemory,
  events?: string[],
) => Contract0001MemorySubject;

class ConformanceConstructionValues implements ContextConstructionValues {
  #lineage = 0;
  #revision = 0;

  public nextLineageIdentity(): unknown {
    this.#lineage += 1;
    return `orion.context.contract-0001.memory.lineage.${this.#lineage}`;
  }

  public nextRevisionIdentity(): unknown {
    this.#revision += 1;
    return `orion.context.contract-0001.memory.revision.${this.#revision}`;
  }

  public nextCreatedAt(): unknown {
    return "2026-08-11T00:00:00.000Z";
  }
}

class TestMemorySourceFailure extends Error {
  public constructor() {
    super("Memory source failed independently.");
    this.name = "TestMemorySourceFailure";
  }
}

class ObservableMemoryContextEngine extends ContextEngine {
  public readonly incorporationRequests: ComposeContextRevisionWithMemoryRequest[] =
    [];

  public constructor(
    construction: ContextConstructionValues,
    identityResolver: ResolveCurrentIdentity,
    memoryResolver: GetMemory,
    private readonly events: string[],
  ) {
    super(construction, identityResolver, undefined, memoryResolver);
  }

  public override composeContextRevisionWithMemory(
    request: ComposeContextRevisionWithMemoryRequest,
  ): ActiveContextRevision;
  public override composeContextRevisionWithMemory(
    request: unknown,
  ): ActiveContextRevision;
  public override composeContextRevisionWithMemory(
    request: unknown,
  ): ActiveContextRevision {
    this.events.push("incorporation");
    this.incorporationRequests.push(
      request as ComposeContextRevisionWithMemoryRequest,
    );
    return super.composeContextRevisionWithMemory(request);
  }
}

function createMemorySubject(
  identityResolver: ResolveCurrentIdentity,
  memoryResolver: GetMemory,
  events: string[] = [],
): Contract0001MemorySubject {
  const engine = new ObservableMemoryContextEngine(
    new ConformanceConstructionValues(),
    identityResolver,
    memoryResolver,
    events,
  );
  engine.initialize();
  engine.start();
  return Object.freeze({
    prepare: engine.prepareContextRevisionWithMemory.bind(engine),
    getActive: engine.getActiveContextRevision.bind(engine),
    incorporationRequests: engine.incorporationRequests,
  });
}

function memoryReference(
  identity = "orion.memory.contract-0001",
): MemoryReference {
  return createMemoryReference(identity);
}

function retrievedMemory(
  reference: MemoryReference = memoryReference(),
  sourceRecord: object = Object.freeze({ sourceOwned: true }),
  retrievedAt = "2026-08-11T00:01:00.000Z",
  purpose: "continuity" | "diagnostic" = "continuity",
): RetrievedMemory {
  return Object.freeze({
    memory: sourceRecord as never,
    receipt: Object.freeze({
      memoryReference: reference,
      retrievedAt: retrievedAt as never,
      purpose,
    }),
  });
}

function preparation(
  target:
    | { readonly kind: "new-lineage" }
    | {
        readonly kind: "existing-lineage";
        readonly lineageIdentity: ActiveContextRevision["lineageIdentity"];
        readonly expectedActiveRevisionIdentity: ActiveContextRevision["revisionIdentity"];
      } = { kind: "new-lineage" },
  identityResolutionRequest: IdentityResolutionRequest = {},
  memoryRetrievalRequest: GetMemoryRequest = {
    memoryIdentity: "orion.memory.contract-0001" as never,
    purpose: "continuity",
  },
) {
  return { target, identityResolutionRequest, memoryRetrievalRequest };
}

function defineContract0001MemoryConformance(
  createSubject: Contract0001MemorySubjectFactory,
): void {
  describe("CONTRACT-0001 Memory specialization retrieval semantics", () => {
    it("preserves Context initiation, request opacity, and both candidate boundaries", () => {
      const events: string[] = [];
      const identityCandidate = anonymousCurrentIdentity();
      const reference = memoryReference();
      let memorySourceReading = false;
      const memoryFieldReads = { memoryIdentity: 0, purpose: 0 };
      const identityRequest = new Proxy(
        { resolutionReference: "identity-owned-reference" },
        {
          get(target, property, receiver) {
            if (property !== "resolutionReference")
              throw new Error("Context inspected Identity request fields.");
            return Reflect.get(target, property, receiver) as unknown;
          },
        },
      ) as IdentityResolutionRequest;
      const memoryRequest = new Proxy(
        {
          memoryIdentity: "orion.memory.contract-0001",
          purpose: "continuity",
        },
        {
          get(target, property, receiver) {
            if (property === "memoryIdentity" || property === "purpose") {
              if (!memorySourceReading)
                throw new Error(
                  "Context read Memory-owned request semantics before GetMemory.",
                );
              memoryFieldReads[property] += 1;
            } else {
              throw new Error("Context inspected Memory request fields.");
            }
            return Reflect.get(target, property, receiver) as unknown;
          },
        },
      ) as GetMemoryRequest;
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
      const memoryResolver: GetMemory = {
        getMemory(request) {
          events.push("memory-retrieval");
          expect(request).toBe(memoryRequest);
          memorySourceReading = true;
          try {
            expect(request.memoryIdentity).toBe("orion.memory.contract-0001");
            expect(request.purpose).toBe("continuity");
          } finally {
            memorySourceReading = false;
          }
          expect(() =>
            subject.getActive({ lineageIdentity: FIRST_LINEAGE_IDENTITY }),
          ).toThrow(ContextLineageNotFoundError);
          expect(subject.incorporationRequests).toHaveLength(0);
          events.push("memory-candidate-available");
          return retrievedMemory(reference);
        },
      };
      const subject = createSubject(identityResolver, memoryResolver, events);

      const revision = subject.prepare(
        preparation({ kind: "new-lineage" }, identityRequest, memoryRequest),
      );

      expect(events).toEqual([
        "identity-retrieval",
        "identity-candidate-available",
        "memory-retrieval",
        "memory-candidate-available",
        "incorporation",
      ]);
      expect(subject.incorporationRequests).toHaveLength(1);
      expect(subject.incorporationRequests[0]?.currentIdentity).toBe(
        identityCandidate,
      );
      expect(subject.incorporationRequests[0]?.memoryReference).toBe(reference);
      expect(memoryFieldReads).toEqual({ memoryIdentity: 1, purpose: 1 });
      expect(revision.lifecycleState).toBe("active");
    });

    it("retains only a distinct minimal Context-owned Memory projection", () => {
      const reference = memoryReference();
      const sourceRecord = Object.freeze({
        content: "source-only-content",
        provenance: Object.freeze({ source: "source-only" }),
        retentionReason: "source-only",
        retainedAt: "2026-08-11T00:00:00.000Z",
        lastUsedAt: "2026-08-11T00:01:00.000Z",
      });
      const subject = createSubject(
        { resolveCurrentIdentity: () => anonymousCurrentIdentity() },
        {
          getMemory: () =>
            retrievedMemory(
              reference,
              sourceRecord,
              "2026-08-11T00:02:00.000Z",
              "diagnostic",
            ),
        },
      );

      const revision = subject.prepare(preparation());

      expect(revision.fragments.map(({ kind }) => kind)).toEqual([
        "identity",
        "memory",
      ]);
      expect(revision.creationMetadata).toMatchObject({
        sourceCount: 2,
        fragmentCount: 2,
      });
      const fragment = revision.fragments[1];
      if (fragment?.kind !== "memory") throw new Error();
      expect(Object.keys(fragment.projection)).toEqual([
        "memoryIdentity",
        "kind",
        "lifecycleState",
        "authoritativeOwner",
      ]);
      expect(fragment.projection).toEqual({
        memoryIdentity: "orion.memory.contract-0001",
        kind: "episodic",
        lifecycleState: "stored",
        authoritativeOwner: "memory",
      });
      expect(fragment.projection).not.toBe(reference);
      expect(JSON.stringify(revision)).not.toContain("source-only");
      expect(JSON.stringify(revision)).not.toContain("diagnostic");
      expect(Object.isFrozen(fragment.projection)).toBe(true);
    });

    it("preserves generic source-failure ownership without partial Context state", () => {
      const failure = new TestMemorySourceFailure();
      const events: string[] = [];
      let identityInvocations = 0;
      const subject = createSubject(
        {
          resolveCurrentIdentity: () => {
            identityInvocations += 1;
            events.push("identity-candidate-available");
            return anonymousCurrentIdentity();
          },
        },
        {
          getMemory: () => {
            expect(identityInvocations).toBe(1);
            expect(events).toEqual(["identity-candidate-available"]);
            events.push("memory-retrieval-failed");
            throw failure;
          },
        },
      );

      let observed: unknown;
      try {
        subject.prepare(preparation());
      } catch (error: unknown) {
        observed = error;
      }

      expect(observed).toBe(failure);
      expect(identityInvocations).toBe(1);
      expect(events).toEqual([
        "identity-candidate-available",
        "memory-retrieval-failed",
      ]);
      expect(subject.incorporationRequests).toHaveLength(0);
      expect(() =>
        subject.getActive({ lineageIdentity: FIRST_LINEAGE_IDENTITY }),
      ).toThrow(ContextLineageNotFoundError);
    });

    it("preserves an existing Active revision after later Memory failure", () => {
      const failure = new TestMemorySourceFailure();
      let retrieval = 0;
      const subject = createSubject(
        { resolveCurrentIdentity: () => anonymousCurrentIdentity() },
        {
          getMemory: () => {
            retrieval += 1;
            if (retrieval === 1) return retrievedMemory();
            throw failure;
          },
        },
      );
      const active = subject.prepare(preparation());

      expect(() =>
        subject.prepare(
          preparation({
            kind: "existing-lineage",
            lineageIdentity: active.lineageIdentity,
            expectedActiveRevisionIdentity: active.revisionIdentity,
          }),
        ),
      ).toThrow(failure);
      expect(subject.incorporationRequests).toHaveLength(1);
      expect(
        subject.getActive({ lineageIdentity: active.lineageIdentity }),
      ).toBe(active);
      expect(active.lifecycleState).toBe("active");
      expect(Object.isFrozen(active)).toBe(true);
    });

    it("separates malformed candidate rejection from Memory failure", () => {
      const malformedReference = Object.freeze({
        memoryIdentity: "orion.memory.contract-0001",
        kind: "episodic",
        authoritativeCapability: "not-memory",
        lifecycleState: "stored",
      });
      const subject = createSubject(
        { resolveCurrentIdentity: () => anonymousCurrentIdentity() },
        {
          getMemory: () => retrievedMemory(malformedReference as never),
        },
      );

      expect(() => subject.prepare(preparation())).toThrow(
        InvalidMemoryContextProjectionError,
      );
      expect(subject.incorporationRequests).toHaveLength(1);
      expect(subject.incorporationRequests[0]?.memoryReference).toBe(
        malformedReference,
      );
      expect(() =>
        subject.getActive({ lineageIdentity: FIRST_LINEAGE_IDENTITY }),
      ).toThrow(ContextLineageNotFoundError);
    });

    it("reuses equivalent Memory semantics and creates a successor for changed identity", () => {
      let retrieval = 0;
      const subject = createSubject(
        { resolveCurrentIdentity: () => anonymousCurrentIdentity() },
        {
          getMemory: (request) => {
            retrieval += 1;
            return retrievedMemory(
              memoryReference(
                (request as GetMemoryRequest).memoryIdentity as string,
              ),
              Object.freeze({ allocation: retrieval }),
              `2026-08-11T00:0${retrieval}:00.000Z`,
              retrieval === 2 ? "diagnostic" : "continuity",
            );
          },
        },
      );
      const first = subject.prepare(preparation());
      const repeated = subject.prepare(
        preparation(
          {
            kind: "existing-lineage",
            lineageIdentity: first.lineageIdentity,
            expectedActiveRevisionIdentity: first.revisionIdentity,
          },
          {},
          {
            memoryIdentity: "orion.memory.contract-0001" as never,
            purpose: "diagnostic",
          },
        ),
      );
      const successor = subject.prepare(
        preparation(
          {
            kind: "existing-lineage",
            lineageIdentity: first.lineageIdentity,
            expectedActiveRevisionIdentity: first.revisionIdentity,
          },
          {},
          {
            memoryIdentity: "orion.memory.contract-0001.changed" as never,
            purpose: "continuity",
          },
        ),
      );

      expect(repeated).toBe(first);
      expect(successor).not.toBe(first);
      expect(successor.revisionNumber).toBe(2);
      expect(first.lifecycleState).toBe("active");
      expect(successor.lifecycleState).toBe("active");
      expect(
        subject.getActive({ lineageIdentity: first.lineageIdentity }),
      ).toBe(successor);
    });

    it("keeps incorporated Context stable when Memory later becomes unavailable", () => {
      let available = true;
      const notFound = new MemoryNotFoundError();
      const subject = createSubject(
        { resolveCurrentIdentity: () => anonymousCurrentIdentity() },
        {
          getMemory: () => {
            if (!available) throw notFound;
            return retrievedMemory();
          },
        },
      );
      const active = subject.prepare(preparation());
      const snapshot = structuredClone(active);
      available = false;

      let observed: unknown;
      try {
        subject.prepare(
          preparation({
            kind: "existing-lineage",
            lineageIdentity: active.lineageIdentity,
            expectedActiveRevisionIdentity: active.revisionIdentity,
          }),
        );
      } catch (error: unknown) {
        observed = error;
      }

      expect(observed).toBe(notFound);
      expect(active).toEqual(snapshot);
      expect(Object.isFrozen(active)).toBe(true);
      expect(
        subject.getActive({ lineageIdentity: active.lineageIdentity }),
      ).toBe(active);
      expect(subject.incorporationRequests).toHaveLength(1);
    });
  });
}

defineContract0001MemoryConformance(createMemorySubject);

describe("CONTRACT-0001 Memory specialization failure ownership", () => {
  it.each([
    new InvalidMemoryInputError(),
    new InvalidMemoryIdentityError(),
    new MemoryNotFoundError(),
    new MemoryStoreUnavailableError(),
    new InvalidMemoryStateError(),
  ])("propagates the exact %s instance", (failure) => {
    const subject = createMemorySubject(
      { resolveCurrentIdentity: () => anonymousCurrentIdentity() },
      {
        getMemory: () => {
          throw failure;
        },
      },
    );

    let observed: unknown;
    try {
      subject.prepare(preparation());
    } catch (error: unknown) {
      observed = error;
    }

    expect(observed).toBe(failure);
    expect(subject.incorporationRequests).toHaveLength(0);
    expect(() =>
      subject.getActive({ lineageIdentity: FIRST_LINEAGE_IDENTITY }),
    ).toThrow(ContextLineageNotFoundError);
  });
});
