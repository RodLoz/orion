import { describe, expect, it, vi } from "vitest";
import { InvalidSkillStateError } from "@orion/core";
import type * as SkillState from "../src/skill-state.js";

vi.mock("../src/skill-state.js", async (importOriginal) => {
  const actual = await importOriginal<typeof SkillState>();
  return {
    ...actual,
    validateExistingCatalog: () => {
      throw new InvalidSkillStateError();
    },
  };
});

const { SkillEngine } = await import("../src/skill-engine.js");

describe("M7 pre-existing catalog-state precedence", () => {
  it.each([
    ["Register", "registerSkillManifest"],
    ["Get", "getRegisteredSkill"],
    ["Discover", "discoverSkills"],
  ] as const)(
    "%s rejects corrupt state without inspecting the request",
    (_name, operation) => {
      const engine = new SkillEngine();
      engine.initialize();
      engine.start();
      let inspections = 0;
      const hostile = new Proxy(
        {},
        {
          ownKeys() {
            inspections += 1;
            throw new Error("request inspected");
          },
          getOwnPropertyDescriptor() {
            inspections += 1;
            throw new Error("request inspected");
          },
          get() {
            inspections += 1;
            throw new Error("request inspected");
          },
        },
      );
      expect(() => engine[operation](hostile)).toThrow(InvalidSkillStateError);
      expect(inspections).toBe(0);
    },
  );

  it.each([
    [
      "registerSkillManifest",
      {
        intent: "register-skill-manifest",
        manifest: {
          id: "test-skill",
          name: "Test",
          version: "1.0.0",
          description: "Test metadata.",
          author: "ORION",
          license: "MIT",
          permissions: [],
          capabilities: ["test.read"],
          events: { publishes: [], consumes: [] },
          inputs: [],
          outputs: [],
          failureModes: [],
        },
      },
    ],
    [
      "getRegisteredSkill",
      { intent: "get-registered-skill", skillId: "test-skill" },
    ],
    ["discoverSkills", { intent: "discover-skills", capability: "test.read" }],
  ] as const)(
    "%s preserves an ordinary request when pre-existing state fails",
    (operation, request) => {
      const engine = new SkillEngine();
      engine.initialize();
      engine.start();
      const before = structuredClone(request);
      expect(() => engine[operation](request)).toThrow(InvalidSkillStateError);
      expect(request).toEqual(before);
      expect(Object.isFrozen(request)).toBe(false);
    },
  );
});
