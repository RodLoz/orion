import { describe, expect, it, vi } from "vitest";
import {
  InvalidSkillStateError,
  createRegisteredSkill,
  type RegisteredSkill,
  type SkillIdentifier,
} from "@orion/core";
import type * as SkillState from "../src/skill-state.js";
import { skillManifest } from "./skill-test-values.js";

const controls = vi.hoisted(() => ({
  catalog: undefined as ReadonlyMap<unknown, unknown> | undefined,
}));

vi.mock("../src/skill-state.js", async (importOriginal) => {
  const actual = await importOriginal<typeof SkillState>();
  return {
    ...actual,
    validateExistingCatalog: (catalog: SkillState.SkillCatalog) =>
      actual.validateExistingCatalog(
        (controls.catalog ?? catalog) as SkillState.SkillCatalog,
      ),
  };
});

const { SkillEngine } = await import("../src/skill-engine.js");
const { validateExistingCatalog } = await import("../src/skill-state.js");
let corruptionGetterReads = 0;

function accessorManifest(
  field: keyof RegisteredSkill,
  value: unknown,
): RegisteredSkill {
  const valid = createRegisteredSkill(skillManifest());
  const descriptors = Object.getOwnPropertyDescriptors(valid) as Record<
    PropertyKey,
    PropertyDescriptor
  >;
  descriptors[field] = {
    configurable: false,
    enumerable: true,
    get: () => {
      corruptionGetterReads += 1;
      return value;
    },
  };
  return Object.freeze(
    Object.defineProperties({}, descriptors),
  ) as RegisteredSkill;
}

function manifestWith(
  field: keyof RegisteredSkill,
  value: unknown,
): RegisteredSkill {
  return Object.freeze({
    ...createRegisteredSkill(skillManifest()),
    [field]: value,
  }) as RegisteredSkill;
}

function corruptions(): readonly RegisteredSkill[] {
  const valid = createRegisteredSkill(skillManifest());
  const eventDescriptors = Object.getOwnPropertyDescriptors(
    valid.events,
  ) as Record<PropertyKey, PropertyDescriptor>;
  eventDescriptors.publishes = {
    configurable: false,
    enumerable: true,
    get: () => {
      corruptionGetterReads += 1;
      return valid.events.publishes;
    },
  };
  const accessorEvents = Object.freeze(
    Object.defineProperties({}, eventDescriptors),
  );

  const accessorArray = ["placeholder"];
  Object.defineProperty(accessorArray, "0", {
    configurable: false,
    enumerable: true,
    get: () => {
      corruptionGetterReads += 1;
      return valid.capabilities[0];
    },
  });
  Object.freeze(accessorArray);

  const invalidDescriptors = Object.getOwnPropertyDescriptors(valid) as Record<
    PropertyKey,
    PropertyDescriptor
  >;
  invalidDescriptors.name = {
    configurable: false,
    enumerable: false,
    value: valid.name,
    writable: false,
  };
  const invalidDescriptor = Object.defineProperties({}, invalidDescriptors);
  Object.preventExtensions(invalidDescriptor);

  return [
    accessorManifest("name", valid.name),
    manifestWith("events", accessorEvents),
    manifestWith("capabilities", accessorArray),
    invalidDescriptor as RegisteredSkill,
    accessorManifest("version", valid.version),
  ];
}

describe("M7 canonical pre-existing catalog graph", () => {
  it("accepts a real Core-produced Registered Skill", () => {
    const valid = createRegisteredSkill(skillManifest());
    expect(() =>
      validateExistingCatalog(
        new Map([[valid.id, valid]]) as ReadonlyMap<
          SkillIdentifier,
          RegisteredSkill
        >,
      ),
    ).not.toThrow();
  });

  it.each(corruptions().map((value, index) => [index, value] as const))(
    "rejects descriptor corruption %s before inspecting request",
    (_index, corrupt) => {
      corruptionGetterReads = 0;
      controls.catalog = new Map([[corrupt.id, corrupt]]);
      const engine = new SkillEngine();
      engine.initialize();
      engine.start();
      let requestInspections = 0;
      let getterReads = 0;
      const hostile = new Proxy(
        {
          get manifest() {
            getterReads += 1;
            throw new Error("private");
          },
        },
        {
          ownKeys() {
            requestInspections += 1;
            throw new Error("request inspected");
          },
          getOwnPropertyDescriptor() {
            requestInspections += 1;
            throw new Error("request inspected");
          },
        },
      );
      expect(() => engine.registerSkillManifest(hostile)).toThrow(
        InvalidSkillStateError,
      );
      expect(requestInspections).toBe(0);
      expect(getterReads).toBe(0);
      expect(corruptionGetterReads).toBe(0);
      controls.catalog = undefined;
    },
  );
});
