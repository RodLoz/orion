import { describe, expect, it } from "vitest";
import {
  DuplicateSkillIdentifierError,
  InvalidSkillInputError,
  InvalidSkillManifestError,
  InvalidSkillStateError,
  SkillNotFoundError,
} from "@orion/core";
import { SkillEngine } from "../src/index.js";
import { skillManifest } from "./skill-test-values.js";

function runningEngine(): SkillEngine {
  const engine = new SkillEngine();
  engine.initialize();
  engine.start();
  return engine;
}

function expectMutableUnchanged<T extends object>(value: T, before: T): void {
  expect(value).toEqual(before);
  expect(Object.isFrozen(value)).toBe(false);
  for (const nested of Object.values(value)) {
    if (typeof nested === "object" && nested !== null)
      expect(Object.isFrozen(nested)).toBe(false);
  }
}

describe("M7 caller non-mutation matrix", () => {
  it("covers Register success, invalid manifest and duplicate", () => {
    const engine = runningEngine();
    const input = skillManifest();
    const request = {
      intent: "register-skill-manifest",
      manifest: input,
    };
    const before = structuredClone(request);
    engine.registerSkillManifest(request);
    expectMutableUnchanged(request, before);
    expectMutableUnchanged(input, before.manifest);

    const duplicate = {
      intent: "register-skill-manifest",
      manifest: skillManifest(),
    };
    const duplicateBefore = structuredClone(duplicate);
    expect(() => engine.registerSkillManifest(duplicate)).toThrow(
      DuplicateSkillIdentifierError,
    );
    expectMutableUnchanged(duplicate, duplicateBefore);

    const invalid = {
      intent: "register-skill-manifest",
      manifest: { ...skillManifest("invalid-skill"), capabilities: [] },
    };
    const invalidBefore = structuredClone(invalid);
    expect(() => engine.registerSkillManifest(invalid)).toThrow(
      InvalidSkillManifestError,
    );
    expectMutableUnchanged(invalid, invalidBefore);
  });

  it("covers Get hit, miss and invalid request", () => {
    const engine = runningEngine();
    engine.registerSkillManifest({
      intent: "register-skill-manifest",
      manifest: skillManifest(),
    });
    for (const [request, error] of [
      [
        { intent: "get-registered-skill", skillId: "weather-reader" },
        undefined,
      ],
      [
        { intent: "get-registered-skill", skillId: "missing-skill" },
        SkillNotFoundError,
      ],
      [
        { intent: "get-registered-skill", skillId: "Invalid" },
        InvalidSkillInputError,
      ],
    ] as const) {
      const before = structuredClone(request);
      if (error === undefined) engine.getRegisteredSkill(request);
      else expect(() => engine.getRegisteredSkill(request)).toThrow(error);
      expectMutableUnchanged(request, before);
    }
  });

  it("covers Discover matches, empty and invalid request", () => {
    const engine = runningEngine();
    engine.registerSkillManifest({
      intent: "register-skill-manifest",
      manifest: skillManifest(),
    });
    for (const [request, error] of [
      [{ intent: "discover-skills", capability: "weather.read" }, undefined],
      [{ intent: "discover-skills", capability: "weather.write" }, undefined],
      [
        { intent: "discover-skills", capability: "Invalid" },
        InvalidSkillInputError,
      ],
    ] as const) {
      const before = structuredClone(request);
      if (error === undefined) engine.discoverSkills(request);
      else expect(() => engine.discoverSkills(request)).toThrow(error);
      expectMutableUnchanged(request, before);
    }
  });

  it("covers lifecycle rejection before touching ordinary requests", () => {
    const engine = new SkillEngine();
    const requests = [
      {
        operation: "registerSkillManifest",
        value: {
          intent: "register-skill-manifest",
          manifest: skillManifest(),
        },
      },
      {
        operation: "getRegisteredSkill",
        value: { intent: "get-registered-skill", skillId: "weather-reader" },
      },
      {
        operation: "discoverSkills",
        value: { intent: "discover-skills", capability: "weather.read" },
      },
    ] as const;
    for (const { operation, value } of requests) {
      const before = structuredClone(value);
      expect(() => engine[operation](value)).toThrow(InvalidSkillStateError);
      expectMutableUnchanged(value, before);
    }
  });
});
