import { describe, expect, it, vi } from "vitest";
import { InvalidSkillStateError } from "@orion/core";
import type * as OrionCore from "@orion/core";
import { skillManifest } from "./skill-test-values.js";

vi.mock("@orion/core", async (importOriginal) => {
  const actual = await importOriginal<typeof OrionCore>();
  return {
    ...actual,
    createSkillDiscoveryResult: () => {
      throw new actual.InvalidSkillStateError();
    },
  };
});

const { SkillEngine } = await import("../src/skill-engine.js");

describe("M7 Discover constructed-state failure", () => {
  it("fails only while constructing a result after successful discovery", () => {
    const engine = new SkillEngine();
    engine.initialize();
    engine.start();
    engine.registerSkillManifest({
      intent: "register-skill-manifest",
      manifest: skillManifest(),
    });
    const request = {
      intent: "discover-skills",
      capability: "weather.read",
    };
    const before = structuredClone(request);
    expect(() => engine.discoverSkills(request)).toThrow(
      InvalidSkillStateError,
    );
    expect(request).toEqual(before);
    expect(Object.isFrozen(request)).toBe(false);
    expect(
      engine.getRegisteredSkill({
        intent: "get-registered-skill",
        skillId: "weather-reader",
      }).id,
    ).toBe("weather-reader");
  });
});
