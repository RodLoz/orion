import {
  ContextLineageNotFoundError,
  IdentitySourceUnavailableError,
  InvalidIdentityInputError,
  InvalidIdentityResolutionReferenceError,
  InvalidIdentityStateError,
  UnresolvedIdentityError,
  type ResolveCurrentIdentity,
} from "@orion/core";
import { IdentityEngine } from "@orion/identity";
import { describe, expect, it, vi } from "vitest";

import { composeContextCapability } from "../src/context/context-composition.js";
import { composeIdentityCapability } from "../src/identity/identity-composition.js";
import { InMemoryIdentitySource } from "../src/identity/in-memory-identity-source.js";

describe("Context and Identity composition", () => {
  it("wires Identity behind Context-owned preparation", () => {
    const identity = composeIdentityCapability();
    const resolveCurrentIdentity = vi.fn(
      identity.resolveCurrentIdentity.resolveCurrentIdentity.bind(
        identity.resolveCurrentIdentity,
      ),
    );
    const context = composeContextCapability({ resolveCurrentIdentity });

    const first = context.prepareContextRevision.prepareContextRevision({
      target: { kind: "new-lineage" },
      identityResolutionRequest: {},
    });
    const successor = context.prepareContextRevision.prepareContextRevision({
      target: {
        kind: "existing-lineage",
        lineageIdentity: first.lineageIdentity,
        expectedActiveRevisionIdentity: first.revisionIdentity,
      },
      identityResolutionRequest: {
        resolutionReference: identity.demonstrationResolutionReference,
      },
    });

    expect(resolveCurrentIdentity).toHaveBeenNthCalledWith(1, {});
    expect(resolveCurrentIdentity).toHaveBeenNthCalledWith(2, {
      resolutionReference: identity.demonstrationResolutionReference,
    });
    expect(first.fragments[0].projection.state).toBe("anonymous");
    expect(successor.fragments[0].projection.state).toBe("authenticated");
    expect(successor.lineageIdentity).toBe(first.lineageIdentity);
    expect(successor.parentRevisionIdentity).toBe(first.revisionIdentity);
    expect(successor.lifecycleState).toBe("active");
  });

  it("exposes only the Active Context authority verifier", () => {
    const identity = composeIdentityCapability();
    const context = composeContextCapability(identity.resolveCurrentIdentity);
    expect(context).not.toHaveProperty("verifyContextRevisionAuthority");
    expect(context.verifyActiveContextRevisionAuthority).toHaveProperty(
      "verifyActiveContextRevisionAuthority",
    );
  });

  it.each([
    ["invalid request", new InvalidIdentityInputError()],
    ["invalid reference", new InvalidIdentityResolutionReferenceError()],
    ["source unavailable", new IdentitySourceUnavailableError()],
    ["unresolved Identity", new UnresolvedIdentityError()],
    ["malformed Identity state", new InvalidIdentityStateError()],
  ])("propagates %s without creating Context", (_name, failure) => {
    const resolver: ResolveCurrentIdentity = {
      resolveCurrentIdentity: () => {
        throw failure;
      },
    };
    const context = composeContextCapability(resolver);

    let observed: unknown;
    try {
      context.prepareContextRevision.prepareContextRevision({
        target: { kind: "new-lineage" },
        identityResolutionRequest: {},
      });
    } catch (error: unknown) {
      observed = error;
    }

    expect(observed).toBe(failure);
    expect(() =>
      context.getActiveContextRevision.getActiveContextRevision({
        lineageIdentity: "orion.context.lineage.1",
      }),
    ).toThrow(ContextLineageNotFoundError);
  });

  it("preserves real Identity request, resolution, and source failures", () => {
    const identity = composeIdentityCapability();
    const context = composeContextCapability(identity.resolveCurrentIdentity);

    expect(() =>
      context.prepareContextRevision.prepareContextRevision({
        target: { kind: "new-lineage" },
        identityResolutionRequest: { resolutionReference: " " },
      }),
    ).toThrow(InvalidIdentityResolutionReferenceError);
    expect(() =>
      context.prepareContextRevision.prepareContextRevision({
        target: { kind: "new-lineage" },
        identityResolutionRequest: { resolutionReference: "unknown-reference" },
      }),
    ).toThrow(UnresolvedIdentityError);

    const unavailable = new IdentityEngine(
      new InMemoryIdentitySource([], false),
    );
    unavailable.initialize();
    unavailable.start();
    const unavailableContext = composeContextCapability(unavailable);
    expect(() =>
      unavailableContext.prepareContextRevision.prepareContextRevision({
        target: { kind: "new-lineage" },
        identityResolutionRequest: { resolutionReference: "known" },
      }),
    ).toThrow(IdentitySourceUnavailableError);
  });
});
