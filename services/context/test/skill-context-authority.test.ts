import { describe, expect, it, vi } from "vitest";
import {
  InvalidSkillContextAuthorityError,
  InvalidSkillExecutionStateError,
} from "@orion/core";
import { ProcessLocalSkillExecutionContextAuthority } from "../src/index.js";

function revision(state: "active" | "expired" = "active") {
  return {
    lineageIdentity: "context.lineage",
    revisionIdentity: "context.revision",
    revisionNumber: 1,
    creationMetadata: {
      createdAt: "2026-07-28T00:00:00.000Z",
      sourceCount: 1,
      fragmentCount: 1,
    },
    lifecycleState: state,
    fragments: [
      {
        kind: "identity",
        authoritativeOwner: "identity",
        projection: { state: "anonymous", authoritativeOwner: "identity" },
      },
    ],
  } as never;
}

function authenticatedRevision() {
  const source = revision() as unknown as {
    fragments: Array<{ projection: unknown }>;
  };
  source.fragments[0]!.projection = {
    state: "authenticated",
    identityIdentifier: "identity.test",
    authoritativeOwner: "identity",
  };
  return source as never;
}

describe("M9 Context projection authority", () => {
  it("proves each Context precedence edge suppresses the immediately later stage", () => {
    let revisionReads = 0;
    const hostileRevision = new Proxy(revision() as object, {
      ownKeys() {
        revisionReads += 1;
        throw new Error("later-revision-secret");
      },
    });
    const verifyRevision = vi.fn(() => false);
    const authority = new ProcessLocalSkillExecutionContextAuthority(
      verifyRevision,
    );

    expect(() =>
      authority.resolve({
        intent: "resolve-skill-execution-context",
        operationId: " invalid" as never,
        contextRevision: hostileRevision as never,
      }),
    ).toThrow(InvalidSkillContextAuthorityError);
    expect(verifyRevision).toHaveBeenCalledTimes(0);
    expect(revisionReads).toBe(0);

    expect(() =>
      authority.resolve({
        intent: "resolve-skill-execution-context",
        operationId: "operation-1" as never,
        contextRevision: hostileRevision as never,
      }),
    ).toThrow(InvalidSkillContextAuthorityError);
    expect(verifyRevision).toHaveBeenCalledTimes(1);
    expect(revisionReads).toBe(0);

    const inactive = revision("expired");
    const accepting = new ProcessLocalSkillExecutionContextAuthority(
      vi.fn(() => true),
    );
    expect(() =>
      accepting.resolve({
        intent: "resolve-skill-execution-context",
        operationId: "operation-2" as never,
        contextRevision: inactive,
      }),
    ).toThrow(InvalidSkillContextAuthorityError);
  });

  it("proves revision structure and derivation each precede projection construction", () => {
    const originalFreeze = Object.freeze;
    let constructionCalls = 0;
    const spy = vi
      .spyOn(Object, "freeze")
      .mockImplementation(<T>(value: T): Readonly<T> => {
        if (
          typeof value === "object" &&
          value !== null &&
          (Reflect.getOwnPropertyDescriptor(value, "kind")?.value ===
            "anonymous" ||
            Reflect.getOwnPropertyDescriptor(value, "operationId")?.value ===
              "operation-precedence")
        )
          constructionCalls += 1;
        return originalFreeze(value);
      });
    try {
      const structurallyInvalid = revision("expired");
      const structureAuthority = new ProcessLocalSkillExecutionContextAuthority(
        (candidate) => candidate === structurallyInvalid,
      );
      expect(() =>
        structureAuthority.resolve({
          intent: "resolve-skill-execution-context",
          operationId: "operation-precedence" as never,
          contextRevision: structurallyInvalid,
        }),
      ).toThrow(InvalidSkillContextAuthorityError);
      expect(constructionCalls).toBe(0);

      const derivationInvalid = revision() as unknown as Record<
        string,
        unknown
      >;
      derivationInvalid.lineageIdentity = 1;
      const derivationAuthority =
        new ProcessLocalSkillExecutionContextAuthority(
          (candidate) => candidate === derivationInvalid,
        );
      expect(() =>
        derivationAuthority.resolve({
          intent: "resolve-skill-execution-context",
          operationId: "operation-precedence" as never,
          contextRevision: derivationInvalid as never,
        }),
      ).toThrow(InvalidSkillContextAuthorityError);
      expect(constructionCalls).toBe(0);
    } finally {
      spy.mockRestore();
    }
  });

  it("mints operation-bound authority and rejects clones", () => {
    const source = revision();
    const authority = new ProcessLocalSkillExecutionContextAuthority(
      (candidate) => candidate === source,
    );
    const result = authority.resolve({
      intent: "resolve-skill-execution-context",
      operationId: "operation-1" as never,
      contextRevision: source,
    });
    expect(result).toMatchObject({
      operationId: "operation-1",
      lineageId: "context.lineage",
      revisionId: "context.revision",
      subject: { kind: "anonymous" },
    });
    expect(
      authority.verify(result, { operationId: "operation-1" as never }),
    ).toBe(true);
    expect(
      authority.verify({ ...result }, { operationId: "operation-1" as never }),
    ).toBe(false);
  });

  it("rejects non-Active source revisions", () => {
    const source = revision("expired");
    const authority = new ProcessLocalSkillExecutionContextAuthority(
      (candidate) => candidate === source,
    );
    expect(() =>
      authority.resolve({
        intent: "resolve-skill-execution-context",
        operationId: "operation-1" as never,
        contextRevision: source,
      }),
    ).toThrow(InvalidSkillContextAuthorityError);
  });

  it("rejects a same-shaped revision without Context authority", () => {
    const authority = new ProcessLocalSkillExecutionContextAuthority(
      () => false,
    );
    expect(() =>
      authority.resolve({
        intent: "resolve-skill-execution-context",
        operationId: "operation-1" as never,
        contextRevision: revision(),
      }),
    ).toThrow(InvalidSkillContextAuthorityError);
  });

  it.each([
    null,
    undefined,
    "context",
    1,
    true,
    1n,
    Symbol("context"),
    () => undefined,
    [],
    {},
    {
      intent: "resolve-skill-execution-context",
      operationId: undefined,
      contextRevision: revision(),
    },
    {
      intent: "resolve-skill-execution-context",
      operationId: "operation-1",
      contextRevision: revision(),
      extra: true,
    },
    Object.create({
      intent: "resolve-skill-execution-context",
      operationId: "operation-1",
      contextRevision: revision(),
    }),
    Object.assign(Object.create({ custom: true }), {
      intent: "resolve-skill-execution-context",
      operationId: "operation-1",
      contextRevision: revision(),
    }),
    { [Symbol("secret")]: true },
    new Proxy(
      {},
      {
        ownKeys() {
          throw new Error("secret");
        },
      },
    ),
  ])("normalizes malformed or hostile direct request %#", (candidate) => {
    const authority = new ProcessLocalSkillExecutionContextAuthority(
      () => true,
    );
    expect(() => authority.resolve(candidate as never)).toThrow(
      InvalidSkillContextAuthorityError,
    );
  });

  it("contains source throws and rejects verifier-true hostile projections", () => {
    const source = revision();
    const throwing = new ProcessLocalSkillExecutionContextAuthority(() => {
      throw new Error("context-secret");
    });
    expect(() =>
      throwing.resolve({
        intent: "resolve-skill-execution-context",
        operationId: "operation-1" as never,
        contextRevision: source,
      }),
    ).toThrow(InvalidSkillExecutionStateError);

    const hostile = new Proxy(source as object, {
      ownKeys() {
        throw new Error("context-secret");
      },
    });
    const permissive = new ProcessLocalSkillExecutionContextAuthority(
      () => true,
    );
    expect(() =>
      permissive.resolve({
        intent: "resolve-skill-execution-context",
        operationId: "operation-1" as never,
        contextRevision: hostile as never,
      }),
    ).toThrow(InvalidSkillContextAuthorityError);
  });

  it("projects authenticated identity and isolates authority instances", () => {
    const source = authenticatedRevision();
    const first = new ProcessLocalSkillExecutionContextAuthority(
      (candidate) => candidate === source,
    );
    const second = new ProcessLocalSkillExecutionContextAuthority(() => true);
    const result = first.resolve({
      intent: "resolve-skill-execution-context",
      operationId: "operation-1" as never,
      contextRevision: source,
    });
    expect(result.subject).toEqual({
      kind: "authenticated",
      identityId: "identity.test",
    });
    expect(second.verify(result, { operationId: "operation-1" as never })).toBe(
      false,
    );
    expect(first.verify(result, { operationId: "operation-2" as never })).toBe(
      false,
    );
  });

  it("rejects descriptor/getter/revoked request hostility without getter execution", () => {
    const authority = new ProcessLocalSkillExecutionContextAuthority(
      () => true,
    );
    const valid = {
      intent: "resolve-skill-execution-context",
      operationId: "operation-1",
      contextRevision: revision(),
    };
    let getters = 0;
    const accessor = { ...valid };
    Object.defineProperty(accessor, "operationId", {
      enumerable: true,
      get() {
        getters += 1;
        return "operation-1";
      },
    });
    const descriptor = new Proxy(valid, {
      getOwnPropertyDescriptor() {
        throw new Error("context-secret");
      },
    });
    const revoked = Proxy.revocable(valid, {});
    revoked.revoke();
    for (const candidate of [accessor, descriptor, revoked.proxy])
      expect(() => authority.resolve(candidate as never)).toThrow(
        InvalidSkillContextAuthorityError,
      );
    expect(getters).toBe(0);
  });

  it("contains the canonical lifecycle accessor when its single read throws", () => {
    const source = revision() as unknown as Record<string, unknown>;
    let reads = 0;
    Object.defineProperty(source, "lifecycleState", {
      enumerable: true,
      get() {
        reads += 1;
        throw new Error("context-secret");
      },
    });
    const authority = new ProcessLocalSkillExecutionContextAuthority(
      (candidate) => candidate === source,
    );
    expect(() =>
      authority.resolve({
        intent: "resolve-skill-execution-context",
        operationId: "operation-1" as never,
        contextRevision: source as never,
      }),
    ).toThrow(InvalidSkillContextAuthorityError);
    expect(reads).toBe(1);
  });

  it("reads each accepted canonical revision property once", () => {
    const source = revision() as unknown as Record<string, unknown>;
    let lifecycleReads = 0;
    Object.defineProperty(source, "lifecycleState", {
      enumerable: true,
      get() {
        lifecycleReads += 1;
        return "active";
      },
    });
    const authority = new ProcessLocalSkillExecutionContextAuthority(
      (candidate) => candidate === source,
    );
    const result = authority.resolve({
      intent: "resolve-skill-execution-context",
      operationId: "operation-1" as never,
      contextRevision: source as never,
    });
    expect(result.operationId).toBe("operation-1");
    expect(lifecycleReads).toBe(1);
    expect(Object.isFrozen(source)).toBe(false);
  });

  it("uses privacy-safe failures for operation, revision, and native secrets", () => {
    const operationSecret = "operation-secret-context";
    const revisionSecret = "revision-secret-context";
    const authority = new ProcessLocalSkillExecutionContextAuthority(() => {
      throw new Error("native-secret-context");
    });
    let failure: unknown;
    try {
      authority.resolve({
        intent: "resolve-skill-execution-context",
        operationId: operationSecret as never,
        contextRevision: {
          ...(revision() as object),
          revisionIdentity: revisionSecret,
        } as never,
      });
    } catch (error) {
      failure = error;
    }
    const message =
      failure instanceof Error ? failure.message : String(failure);
    for (const secret of [
      operationSecret,
      revisionSecret,
      "native-secret-context",
    ])
      expect(message).not.toContain(secret);
  });

  it("keeps the issued operation snapshot valid after source expiry", () => {
    const source = revision() as unknown as {
      lifecycleState: "active" | "expired";
    };
    const before = structuredClone(source);
    const authority = new ProcessLocalSkillExecutionContextAuthority(
      (candidate) => candidate === source,
    );
    const result = authority.resolve({
      intent: "resolve-skill-execution-context",
      operationId: "operation-1" as never,
      contextRevision: source as never,
    });
    expect(source).toEqual(before);
    expect(Object.isFrozen(source)).toBe(false);
    source.lifecycleState = "expired";
    expect(
      authority.verify(result, { operationId: "operation-1" as never }),
    ).toBe(true);
    expect(
      authority.verify(result, { operationId: "operation-2" as never }),
    ).toBe(false);
  });

  it.each([
    [new Error("context-native-secret"), InvalidSkillExecutionStateError],
    [
      new InvalidSkillContextAuthorityError(),
      InvalidSkillContextAuthorityError,
    ],
    ["context-primitive-secret", InvalidSkillExecutionStateError],
  ])("normalizes revision verifier throw %#", (thrown, Failure) => {
    const authority = new ProcessLocalSkillExecutionContextAuthority(() => {
      throw thrown;
    });
    expect(() =>
      authority.resolve({
        intent: "resolve-skill-execution-context",
        operationId: "operation-1" as never,
        contextRevision: revision(),
      }),
    ).toThrow(Failure);
  });
});
