import { describe, expect, it, vi } from "vitest";
import { InvalidSkillStateError, SkillNotFoundError } from "@orion/core";
import type * as OrionCore from "@orion/core";
import type * as SkillState from "../src/skill-state.js";
import { skillManifest } from "./skill-test-values.js";

const controls = vi.hoisted(() => ({ resultingChecks: 0 }));

vi.mock("@orion/core", async (importOriginal) => {
  const actual = await importOriginal<typeof OrionCore>();
  return {
    ...actual,
    createRegisteredSkill: () => {
      throw new actual.InvalidSkillStateError();
    },
  };
});

vi.mock("../src/skill-state.js", async (importOriginal) => {
  const actual = await importOriginal<typeof SkillState>();
  return {
    ...actual,
    validateResultingCatalog: (catalog: SkillState.SkillCatalog) => {
      controls.resultingChecks += 1;
      return actual.validateResultingCatalog(catalog);
    },
  };
});

const { SkillEngine } = await import("../src/skill-engine.js");

describe("M7 constructed-state failure", () => {
  it("fails after valid registration input without catalog mutation", () => {
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
    expect(controls.resultingChecks).toBe(0);
    expect(input).toEqual(before);
    expect(Object.isFrozen(input)).toBe(false);
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
    expect(() =>
      engine.registerSkillManifest({
        intent: "register-skill-manifest",
        manifest: input,
      }),
    ).toThrow(InvalidSkillStateError);
  });
});
