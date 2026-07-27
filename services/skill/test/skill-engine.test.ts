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

describe("M7 Skill Engine catalog", () => {
  it("starts each instance with an isolated empty catalog", () => {
    const first = runningEngine();
    const second = runningEngine();
    first.registerSkillManifest({
      intent: "register-skill-manifest",
      manifest: skillManifest(),
    });
    expect(
      first.discoverSkills({
        intent: "discover-skills",
        capability: "weather.read",
      }).matches,
    ).toHaveLength(1);
    expect(
      second.discoverSkills({
        intent: "discover-skills",
        capability: "weather.read",
      }).matches,
    ).toHaveLength(0);
  });

  it("registers atomically and returns an immutable defensive value", () => {
    const engine = runningEngine();
    const input = skillManifest();
    const before = structuredClone(input);
    const registered = engine.registerSkillManifest({
      intent: "register-skill-manifest",
      manifest: input,
    });
    expect(registered.id).toBe("weather-reader");
    expect(Object.isFrozen(registered)).toBe(true);
    expect(input).toEqual(before);
    expect(Object.isFrozen(input)).toBe(false);
    expect(Object.isFrozen(input.capabilities)).toBe(false);
  });

  it.each([
    {},
    { version: "2.0.0" },
    { capabilities: ["different.read"] },
    { permissions: ["different.read"] },
    { name: "Different" },
    { events: { publishes: [], consumes: [] } },
    { inputs: [] },
    { outputs: [] },
    { failureModes: [] },
  ])("rejects every second registration by Skill ID", (changes) => {
    const engine = runningEngine();
    engine.registerSkillManifest({
      intent: "register-skill-manifest",
      manifest: skillManifest(),
    });
    expect(() =>
      engine.registerSkillManifest({
        intent: "register-skill-manifest",
        manifest: { ...skillManifest(), ...changes },
      }),
    ).toThrow(DuplicateSkillIdentifierError);
  });

  it("maps envelope and manifest failures separately and leaves catalog empty", () => {
    const engine = runningEngine();
    expect(() => engine.registerSkillManifest(null)).toThrow(
      InvalidSkillInputError,
    );
    expect(() =>
      engine.registerSkillManifest({
        intent: "register-skill-manifest",
        manifest: { ...skillManifest(), capabilities: [] },
      }),
    ).toThrow(InvalidSkillManifestError);
    expect(
      engine.discoverSkills({
        intent: "discover-skills",
        capability: "weather.read",
      }).matches,
    ).toHaveLength(0);
  });

  it("validates a duplicate manifest completely before duplicate detection", () => {
    const engine = runningEngine();
    engine.registerSkillManifest({
      intent: "register-skill-manifest",
      manifest: skillManifest(),
    });
    expect(() =>
      engine.registerSkillManifest({
        intent: "register-skill-manifest",
        manifest: { ...skillManifest(), capabilities: [] },
      }),
    ).toThrow(InvalidSkillManifestError);
  });

  it("stops before touching a manifest after invalid envelope semantics", () => {
    let touched = 0;
    expect(() =>
      runningEngine().registerSkillManifest({
        intent: "wrong",
        get manifest() {
          touched += 1;
          throw new Error("must not be observed");
        },
      }),
    ).toThrow(InvalidSkillInputError);
    expect(touched).toBe(0);
  });

  it("maps one protected manifest getter read to manifest failure", () => {
    let throwingReads = 0;
    expect(() =>
      runningEngine().registerSkillManifest({
        intent: "register-skill-manifest",
        get manifest() {
          throwingReads += 1;
          throw new Error("private");
        },
      }),
    ).toThrow(InvalidSkillManifestError);
    expect(throwingReads).toBe(1);

    let statefulReads = 0;
    const engine = runningEngine();
    const registered = engine.registerSkillManifest({
      intent: "register-skill-manifest",
      get manifest() {
        statefulReads += 1;
        return statefulReads === 1
          ? skillManifest()
          : { ...skillManifest(), id: "changed-skill" };
      },
    });
    expect(registered.id).toBe("weather-reader");
    expect(statefulReads).toBe(1);
  });

  it("gets an exact reconstructed Registered Skill and reports exact misses", () => {
    const engine = runningEngine();
    const registered = engine.registerSkillManifest({
      intent: "register-skill-manifest",
      manifest: skillManifest(),
    });
    const found = engine.getRegisteredSkill({
      intent: "get-registered-skill",
      skillId: "weather-reader",
    });
    expect(found).toEqual(registered);
    expect(found).not.toBe(registered);
    expect(() =>
      engine.getRegisteredSkill({
        intent: "get-registered-skill",
        skillId: "missing-skill",
      }),
    ).toThrow(SkillNotFoundError);
    expect(() =>
      engine.getRegisteredSkill({
        intent: "get-registered-skill",
        skillId: "Invalid",
      }),
    ).toThrow(InvalidSkillInputError);
  });

  it("discovers zero, one, and many exact matches in Skill-ID order", () => {
    const engine = runningEngine();
    for (const id of ["zulu-skill", "alpha-skill", "middle-skill"])
      engine.registerSkillManifest({
        intent: "register-skill-manifest",
        manifest: skillManifest(id),
      });
    const result = engine.discoverSkills({
      intent: "discover-skills",
      capability: "weather.read",
    });
    expect(result.matches.map(({ id }) => id)).toEqual([
      "alpha-skill",
      "middle-skill",
      "zulu-skill",
    ]);
    expect(Object.isFrozen(result)).toBe(true);
    expect(Object.isFrozen(result.matches)).toBe(true);
    expect(
      engine.discoverSkills({
        intent: "discover-skills",
        capability: "weather.write",
      }).matches,
    ).toEqual([]);
  });

  it("produces equal discovery results for different insertion orders", () => {
    const first = runningEngine();
    const second = runningEngine();
    const ids = ["zulu-skill", "alpha-skill", "middle-skill"];
    for (const id of ids)
      first.registerSkillManifest({
        intent: "register-skill-manifest",
        manifest: skillManifest(id),
      });
    for (const id of [...ids].reverse())
      second.registerSkillManifest({
        intent: "register-skill-manifest",
        manifest: skillManifest(id),
      });
    const request = {
      intent: "discover-skills",
      capability: "weather.read",
    };
    expect(first.discoverSkills(request)).toEqual(
      second.discoverSkills(request),
    );
  });

  it("maps hostile and stateful Get/Discover properties exactly once", () => {
    const engine = runningEngine();
    for (const [operation, field] of [
      ["getRegisteredSkill", "skillId"],
      ["discoverSkills", "capability"],
    ] as const) {
      let reads = 0;
      const request = {
        intent:
          operation === "getRegisteredSkill"
            ? "get-registered-skill"
            : "discover-skills",
        get [field]() {
          reads += 1;
          if (reads > 1) throw new Error("second read");
          return operation === "getRegisteredSkill"
            ? "missing-skill"
            : "weather.read";
        },
      };
      if (operation === "getRegisteredSkill")
        expect(() => engine[operation](request)).toThrow(SkillNotFoundError);
      else expect(engine[operation](request).matches).toEqual([]);
      expect(reads).toBe(1);
    }
  });

  it("never filters discovery by declared permissions", () => {
    const engine = runningEngine();
    engine.registerSkillManifest({
      intent: "register-skill-manifest",
      manifest: skillManifest(),
    });
    expect(
      engine.discoverSkills({
        intent: "discover-skills",
        capability: "weather.read",
      }).matches,
    ).toHaveLength(1);
  });

  it("normalizes hostile requests and never leaks native errors", () => {
    const hostile = new Proxy(
      {},
      {
        ownKeys() {
          throw new TypeError("private");
        },
      },
    );
    const engine = runningEngine();
    expect(() => engine.getRegisteredSkill(hostile)).toThrow(
      InvalidSkillInputError,
    );
    expect(() => engine.discoverSkills(hostile)).toThrow(
      InvalidSkillInputError,
    );
  });

  it("enforces lifecycle and leaves requests untouched outside Running", () => {
    for (const engine of [
      new SkillEngine(),
      (() => {
        const value = new SkillEngine();
        value.initialize();
        return value;
      })(),
      (() => {
        const value = runningEngine();
        value.stop();
        return value;
      })(),
    ]) {
      let inspected = 0;
      const hostile = new Proxy(
        {},
        {
          ownKeys() {
            inspected += 1;
            throw new Error("must not execute");
          },
        },
      );
      expect(() => engine.discoverSkills(hostile)).toThrow(
        InvalidSkillStateError,
      );
      expect(inspected).toBe(0);
    }
  });

  it("is synchronous and deterministic for equivalent input", () => {
    const first = runningEngine();
    const second = runningEngine();
    for (const engine of [first, second]) {
      const result = engine.registerSkillManifest({
        intent: "register-skill-manifest",
        manifest: skillManifest(),
      });
      expect(result).not.toBeInstanceOf(Promise);
    }
    expect(
      first.discoverSkills({
        intent: "discover-skills",
        capability: "weather.read",
      }),
    ).toEqual(
      second.discoverSkills({
        intent: "discover-skills",
        capability: "weather.read",
      }),
    );
  });

  it("uses only stable privacy-safe public failures", () => {
    const engine = runningEngine();
    for (const operation of [
      () => engine.registerSkillManifest(null),
      () =>
        engine.registerSkillManifest({
          intent: "register-skill-manifest",
          manifest: { ...skillManifest(), description: "private\u0000" },
        }),
      () =>
        engine.getRegisteredSkill({
          intent: "get-registered-skill",
          skillId: "missing-skill",
        }),
    ]) {
      try {
        operation();
        throw new Error("expected failure");
      } catch (error) {
        expect(error).toBeInstanceOf(Error);
        expect((error as Error).message).not.toMatch(
          /weather|private|missing-skill|credential|token/i,
        );
      }
    }
  });
});
