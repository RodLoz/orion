import { describe, expect, it, vi } from "vitest";
import { InvalidSkillStateError } from "@orion/core";
import type * as OrionCore from "@orion/core";
import { skillManifest } from "./skill-test-values.js";

let reconstructionCount = 0;
vi.mock("@orion/core", async (importOriginal) => {
  const actual = await importOriginal<typeof OrionCore>();
  return {
    ...actual,
    createRegisteredSkill: (value: unknown) => {
      reconstructionCount += 1;
      if (reconstructionCount === 4) throw new actual.InvalidSkillStateError();
      return actual.createRegisteredSkill(value);
    },
  };
});

const { SkillEngine } = await import("../src/skill-engine.js");

describe("M7 Get constructed-state failure", () => {
  it("distinguishes final reconstruction from pre-existing catalog validation", () => {
    const engine = new SkillEngine();
    engine.initialize();
    engine.start();
    expect(() =>
      engine.getRegisteredSkill({
        intent: "get-registered-skill",
        skillId: "missing-skill",
      }),
    ).toThrowError("Registered Skill was not found.");
    expect(reconstructionCount).toBe(0);
    engine.registerSkillManifest({
      intent: "register-skill-manifest",
      manifest: skillManifest(),
    });
    const request = {
      intent: "get-registered-skill",
      skillId: "weather-reader",
    };
    const before = structuredClone(request);
    expect(() => engine.getRegisteredSkill(request)).toThrow(
      InvalidSkillStateError,
    );
    expect(request).toEqual(before);
    expect(Object.isFrozen(request)).toBe(false);
    expect(reconstructionCount).toBe(4);
    expect(
      engine.discoverSkills({
        intent: "discover-skills",
        capability: "weather.read",
      }).matches,
    ).toHaveLength(1);
  });
});
