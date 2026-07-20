import {
  InvalidContextLifecycleTransitionError,
  contextLifecycleState,
} from "@orion/core";
import { describe, expect, it } from "vitest";

import { ContextRevisionLifecycle } from "../src/context-revision-lifecycle.js";

describe("Context Revision lifecycle", () => {
  it("follows the M2 canonical transition sequence", () => {
    const lifecycle = new ContextRevisionLifecycle();
    expect(lifecycle.state).toBe("collecting");
    lifecycle.transition("composing");
    lifecycle.transition("validating");
    lifecycle.transition("active");
    lifecycle.transition("expired");
    expect(lifecycle.state).toBe("expired");
  });

  it.each(["composing", "collecting", "archived"] as const)(
    "rejects transition from Active to %s",
    (target) => {
      const lifecycle = new ContextRevisionLifecycle();
      lifecycle.transition("composing");
      lifecycle.transition("validating");
      lifecycle.transition("active");
      expect(() => lifecycle.transition(target)).toThrow(
        InvalidContextLifecycleTransitionError,
      );
    },
  );

  it("rejects Updating as a lifecycle state", () => {
    expect(() => contextLifecycleState("updating")).toThrow();
  });

  it("does not permit an Expired revision to reactivate", () => {
    const lifecycle = new ContextRevisionLifecycle();
    lifecycle.transition("composing");
    lifecycle.transition("validating");
    lifecycle.transition("active");
    lifecycle.transition("expired");
    expect(() => lifecycle.transition("active")).toThrow(
      InvalidContextLifecycleTransitionError,
    );
  });
});
