import { describe, expect, it, vi } from "vitest";
import { InvalidSkillStateError, SkillNotFoundError } from "@orion/core";
import type * as SkillState from "../src/skill-state.js";
import { skillManifest } from "./skill-test-values.js";

const controls = vi.hoisted(() => ({
  failResultingCatalog: true,
  resultingChecks: 0,
}));

vi.mock("../src/skill-state.js", async (importOriginal) => {
  const actual = await importOriginal<typeof SkillState>();
  return {
    ...actual,
    validateResultingCatalog: (catalog: SkillState.SkillCatalog) => {
      controls.resultingChecks += 1;
      if (controls.failResultingCatalog) throw new InvalidSkillStateError();
      return actual.validateResultingCatalog(catalog);
    },
  };
});

const { SkillEngine } = await import("../src/skill-engine.js");

describe("M7 resulting-catalog atomic failure", () => {
  it("does not expose or reserve a Skill after post-construction failure", () => {
    const engine = new SkillEngine();
    engine.initialize();
    engine.start();
    const input = skillManifest();
    const before = structuredClone(input);

    expect(() =>
      engine.registerSkillManifest({
        intent: "register-skill-manifest",
        manifest: input,
      }),
    ).toThrow(InvalidSkillStateError);
    expect(controls.resultingChecks).toBe(1);
    expect(input).toEqual(before);
    expect(Object.isFrozen(input)).toBe(false);
    expect(Object.isFrozen(input.capabilities)).toBe(false);
    expect(() =>
      engine.getRegisteredSkill({
        intent: "get-registered-skill",
        skillId: input.id,
      }),
    ).toThrow(SkillNotFoundError);
    expect(
      engine.discoverSkills({
        intent: "discover-skills",
        capability: input.capabilities[0],
      }).matches,
    ).toEqual([]);

    controls.failResultingCatalog = false;
    const admitted = engine.registerSkillManifest({
      intent: "register-skill-manifest",
      manifest: input,
    });
    expect(admitted.id).toBe(input.id);
  });
});
