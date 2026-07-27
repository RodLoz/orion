import { describe, expect, it, vi } from "vitest";
import { DuplicateSkillIdentifierError } from "@orion/core";
import type * as OrionCore from "@orion/core";
import { skillManifest } from "./skill-test-values.js";

const controls = vi.hoisted(() => ({
  throwAfter: Number.POSITIVE_INFINITY,
  constructionCalls: 0,
}));

vi.mock("@orion/core", async (importOriginal) => {
  const actual = await importOriginal<typeof OrionCore>();
  return {
    ...actual,
    createRegisteredSkill: (value: unknown) => {
      controls.constructionCalls += 1;
      if (controls.constructionCalls > controls.throwAfter)
        throw new actual.InvalidSkillStateError();
      return actual.createRegisteredSkill(value);
    },
  };
});

const { SkillEngine } = await import("../src/skill-engine.js");

describe("M7 duplicate precedence", () => {
  it("rejects a duplicate before touching constructed-state validation", () => {
    const engine = new SkillEngine();
    engine.initialize();
    engine.start();
    engine.registerSkillManifest({
      intent: "register-skill-manifest",
      manifest: skillManifest(),
    });
    const callsBeforeDuplicate = controls.constructionCalls;
    controls.throwAfter = callsBeforeDuplicate + 1;
    expect(() =>
      engine.registerSkillManifest({
        intent: "register-skill-manifest",
        manifest: skillManifest(),
      }),
    ).toThrow(DuplicateSkillIdentifierError);
    expect(controls.constructionCalls).toBe(callsBeforeDuplicate + 1);
  });
});
