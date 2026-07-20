import {
  IdentitySourceUnavailableError,
  InvalidIdentityResolutionReferenceError,
  UnresolvedIdentityError,
} from "@orion/core";
import { IdentityEngine } from "@orion/identity";
import { describe, expect, it } from "vitest";

import { composeContextCapability } from "../src/context/context-composition.js";
import { composeIdentityCapability } from "../src/identity/identity-composition.js";
import { InMemoryIdentitySource } from "../src/identity/in-memory-identity-source.js";

describe("Context and Identity composition", () => {
  it("resolves Identity before composing Context through Contracts", () => {
    const identity = composeIdentityCapability();
    const context = composeContextCapability();
    const anonymous = identity.resolveCurrentIdentity.resolveCurrentIdentity(
      {},
    );
    const authenticated =
      identity.resolveCurrentIdentity.resolveCurrentIdentity({
        resolutionReference: identity.demonstrationResolutionReference,
      });

    const first = context.composeContextRevision.composeContextRevision({
      target: { kind: "new-lineage" },
      currentIdentity: anonymous,
    });
    const successor = context.composeContextRevision.composeContextRevision({
      target: {
        kind: "existing-lineage",
        lineageIdentity: first.lineageIdentity,
        expectedActiveRevisionIdentity: first.revisionIdentity,
      },
      currentIdentity: authenticated,
    });

    expect(first.lifecycleState).toBe("expired");
    expect(successor.lifecycleState).toBe("active");
    expect(successor.fragments[0].projection.state).toBe("authenticated");
  });

  it("preserves unresolved Identity failure before Context activation", () => {
    const identity = composeIdentityCapability();
    const context = composeContextCapability();
    expect(() =>
      identity.resolveCurrentIdentity.resolveCurrentIdentity({
        resolutionReference: "unknown-reference",
      }),
    ).toThrow(UnresolvedIdentityError);

    const first = context.composeContextRevision.composeContextRevision({
      target: { kind: "new-lineage" },
      currentIdentity: identity.resolveCurrentIdentity.resolveCurrentIdentity(
        {},
      ),
    });
    expect(first.revisionNumber).toBe(1);
  });

  it("preserves invalid Identity evidence before Context activation", () => {
    const identity = composeIdentityCapability();
    const context = composeContextCapability();
    expect(() =>
      identity.resolveCurrentIdentity.resolveCurrentIdentity({
        resolutionReference: " ",
      }),
    ).toThrow(InvalidIdentityResolutionReferenceError);

    const first = context.composeContextRevision.composeContextRevision({
      target: { kind: "new-lineage" },
      currentIdentity: identity.resolveCurrentIdentity.resolveCurrentIdentity(
        {},
      ),
    });
    expect(first.revisionNumber).toBe(1);
  });

  it("preserves source unavailability instead of creating Anonymous Context", () => {
    const identity = new IdentityEngine(new InMemoryIdentitySource([], false));
    identity.initialize();
    identity.start();
    const context = composeContextCapability();

    expect(() =>
      identity.resolveCurrentIdentity({ resolutionReference: "known" }),
    ).toThrow(IdentitySourceUnavailableError);

    const first = context.composeContextRevision.composeContextRevision({
      target: { kind: "new-lineage" },
      currentIdentity: identity.resolveCurrentIdentity({}),
    });
    expect(first.fragments[0].projection.state).toBe("anonymous");
    expect(first.revisionNumber).toBe(1);
  });
});
