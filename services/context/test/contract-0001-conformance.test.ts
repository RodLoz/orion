import {
  ContextLineageNotFoundError,
  IdentitySourceUnavailableError,
  InvalidIdentityContextProjectionError,
  InvalidIdentityInputError,
  InvalidIdentityResolutionReferenceError,
  InvalidIdentityStateError,
  UnresolvedIdentityError,
  anonymousCurrentIdentity,
  authenticatedCurrentIdentity,
  identityIdentifier,
  type ActiveContextRevision,
  type ComposeContextRevisionRequest,
  type ContextConstructionValues,
  type GetActiveContextRevision,
  type IdentityResolutionRequest,
  type PrepareContextRevision,
  type ResolveCurrentIdentity,
} from "@orion/core";
import { describe, expect, it } from "vitest";

import { ContextEngine } from "../src/context-engine.js";

const FIRST_LINEAGE_IDENTITY = "orion.context.contract-0001.lineage.1";

interface Contract0001IdentitySubject {
  readonly prepare: PrepareContextRevision["prepareContextRevision"];
  readonly getActive: GetActiveContextRevision["getActiveContextRevision"];
  readonly incorporationRequests: readonly ComposeContextRevisionRequest[];
}

type Contract0001IdentitySubjectFactory = (
  resolver: ResolveCurrentIdentity,
  events?: string[],
) => Contract0001IdentitySubject;

class ConformanceConstructionValues implements ContextConstructionValues {
  #lineage = 0;
  #revision = 0;

  public nextLineageIdentity(): unknown {
    this.#lineage += 1;
    return `orion.context.contract-0001.lineage.${this.#lineage}`;
  }

  public nextRevisionIdentity(): unknown {
    this.#revision += 1;
    return `orion.context.contract-0001.revision.${this.#revision}`;
  }

  public nextCreatedAt(): unknown {
    return "2026-08-11T00:00:00.000Z";
  }
}

class TestSourceFailure extends Error {
  public constructor(message: string) {
    super(message);
    this.name = "TestSourceFailure";
  }
}

class ObservableContextEngine extends ContextEngine {
  public readonly incorporationRequests: ComposeContextRevisionRequest[] = [];

  public constructor(
    construction: ContextConstructionValues,
    resolver: ResolveCurrentIdentity,
    private readonly events: string[],
  ) {
    super(construction, resolver);
  }

  public override composeContextRevision(
    request: ComposeContextRevisionRequest,
  ): ActiveContextRevision;
  public override composeContextRevision(
    request: unknown,
  ): ActiveContextRevision;
  public override composeContextRevision(
    request: unknown,
  ): ActiveContextRevision {
    this.events.push("incorporation");
    this.incorporationRequests.push(request as ComposeContextRevisionRequest);
    return super.composeContextRevision(request);
  }
}

function createIdentitySubject(
  resolver: ResolveCurrentIdentity,
  events: string[] = [],
): Contract0001IdentitySubject {
  const engine = new ObservableContextEngine(
    new ConformanceConstructionValues(),
    resolver,
    events,
  );
  engine.initialize();
  engine.start();

  return Object.freeze({
    prepare: engine.prepareContextRevision.bind(engine),
    getActive: engine.getActiveContextRevision.bind(engine),
    incorporationRequests: engine.incorporationRequests,
  });
}

function defineContract0001Conformance(
  createSubject: Contract0001IdentitySubjectFactory,
): void {
  describe("CONTRACT-0001 implementation-neutral retrieval semantics", () => {
    it("preserves Context initiation, opaque source interpretation, and the candidate boundary", () => {
      const events: string[] = [];
      const candidate = authenticatedCurrentIdentity(
        identityIdentifier("orion.identity.contract-0001"),
      );
      let sourceFieldReads = 0;
      const sourceRequest = new Proxy(
        { resolutionReference: "source-owned-reference" },
        {
          get(target, property, receiver) {
            if (property === "resolutionReference") sourceFieldReads += 1;
            return Reflect.get(target, property, receiver) as unknown;
          },
        },
      ) as IdentityResolutionRequest;
      const resolver: ResolveCurrentIdentity = {
        resolveCurrentIdentity(request) {
          events.push("retrieval");
          expect(request).toBe(sourceRequest);
          expect(request.resolutionReference).toBe("source-owned-reference");
          expect(() =>
            subject.getActive({ lineageIdentity: FIRST_LINEAGE_IDENTITY }),
          ).toThrow(ContextLineageNotFoundError);
          events.push("candidate-available");
          return candidate;
        },
      };
      const subject = createSubject(resolver, events);

      const revision = subject.prepare({
        target: { kind: "new-lineage" },
        identityResolutionRequest: sourceRequest,
      });

      expect(events).toEqual([
        "retrieval",
        "candidate-available",
        "incorporation",
      ]);
      expect(sourceFieldReads).toBe(1);
      expect(subject.incorporationRequests).toHaveLength(1);
      expect(subject.incorporationRequests[0]?.currentIdentity).toBe(candidate);
      expect(revision.lifecycleState).toBe("active");
      expect(revision.fragments[0].projection).toEqual({
        state: "authenticated",
        identityIdentifier: "orion.identity.contract-0001",
        authoritativeOwner: "identity",
      });
      expect(revision.fragments[0].projection).not.toBe(candidate);
    });

    it("leaves no Context state or incorporation after a source-owned failure", () => {
      const failure = new TestSourceFailure("source retrieval failed");
      const subject = createSubject({
        resolveCurrentIdentity: () => {
          throw failure;
        },
      });

      let observed: unknown;
      try {
        subject.prepare({
          target: { kind: "new-lineage" },
          identityResolutionRequest: { resolutionReference: "unavailable" },
        });
      } catch (error: unknown) {
        observed = error;
      }

      expect(observed).toBe(failure);
      expect(subject.incorporationRequests).toHaveLength(0);
      expect(() =>
        subject.getActive({ lineageIdentity: FIRST_LINEAGE_IDENTITY }),
      ).toThrow(ContextLineageNotFoundError);
    });

    it("does not mutate an existing Active revision after retrieval failure", () => {
      const failure = new TestSourceFailure("later retrieval failed");
      let resolution = 0;
      const subject = createSubject({
        resolveCurrentIdentity: () => {
          resolution += 1;
          if (resolution === 1) return anonymousCurrentIdentity();
          throw failure;
        },
      });
      const active = subject.prepare({
        target: { kind: "new-lineage" },
        identityResolutionRequest: {},
      });

      expect(() =>
        subject.prepare({
          target: {
            kind: "existing-lineage",
            lineageIdentity: active.lineageIdentity,
            expectedActiveRevisionIdentity: active.revisionIdentity,
          },
          identityResolutionRequest: { resolutionReference: "missing" },
        }),
      ).toThrow(failure);
      expect(subject.incorporationRequests).toHaveLength(1);
      expect(
        subject.getActive({ lineageIdentity: active.lineageIdentity }),
      ).toBe(active);
      expect(active.lifecycleState).toBe("active");
      expect(Object.isFrozen(active)).toBe(true);
    });

    it("distinguishes malformed returned material from retrieval failure", () => {
      const malformed = Object.freeze({ state: "malformed" });
      const subject = createSubject({
        resolveCurrentIdentity: () => malformed as never,
      });

      expect(() =>
        subject.prepare({
          target: { kind: "new-lineage" },
          identityResolutionRequest: {},
        }),
      ).toThrow(InvalidIdentityContextProjectionError);
      expect(subject.incorporationRequests).toHaveLength(1);
      expect(subject.incorporationRequests[0]?.currentIdentity).toBe(malformed);
      expect(() =>
        subject.getActive({ lineageIdentity: FIRST_LINEAGE_IDENTITY }),
      ).toThrow(ContextLineageNotFoundError);
    });

    it("preserves deterministic reuse for unchanged incorporated semantics", () => {
      const subject = createSubject({
        resolveCurrentIdentity: () => anonymousCurrentIdentity(),
      });
      const first = subject.prepare({
        target: { kind: "new-lineage" },
        identityResolutionRequest: {},
      });
      const repeated = subject.prepare({
        target: {
          kind: "existing-lineage",
          lineageIdentity: first.lineageIdentity,
          expectedActiveRevisionIdentity: first.revisionIdentity,
        },
        identityResolutionRequest: {},
      });

      expect(subject.incorporationRequests).toHaveLength(2);
      expect(repeated).toBe(first);
      expect(repeated.revisionNumber).toBe(1);
    });
  });
}

defineContract0001Conformance(createIdentitySubject);

describe("CONTRACT-0001 Identity specialization failure ownership", () => {
  it.each([
    new InvalidIdentityInputError(),
    new InvalidIdentityResolutionReferenceError(),
    new IdentitySourceUnavailableError(),
    new UnresolvedIdentityError(),
    new InvalidIdentityStateError(),
  ])("propagates the exact %s instance", (failure) => {
    const subject = createIdentitySubject({
      resolveCurrentIdentity: () => {
        throw failure;
      },
    });

    let observed: unknown;
    try {
      subject.prepare({
        target: { kind: "new-lineage" },
        identityResolutionRequest: {},
      });
    } catch (error: unknown) {
      observed = error;
    }

    expect(observed).toBe(failure);
    expect(subject.incorporationRequests).toHaveLength(0);
  });
});
