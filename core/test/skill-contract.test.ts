import { describe, expect, it } from "vitest";
import {
  InvalidSkillInputError,
  InvalidSkillManifestError,
  InvalidSkillStateError,
  createRegisteredSkill,
  createSkillDiscoveryResult,
  createSkillManifest,
  eventDeclarationIdentifier,
  extractDiscoverSkillsRequest,
  extractGetRegisteredSkillRequest,
  extractRegisterSkillRequest,
  skillCapabilityIdentifier,
  skillFailureModeIdentifier,
  skillIdentifier,
  skillInterfaceFieldIdentifier,
  skillPermissionIdentifier,
  skillVersion,
} from "../src/index.js";

function manifest(overrides: Record<string, unknown> = {}) {
  return {
    id: "weather-reader",
    name: "Weather reader",
    version: "1.2.3-alpha.1+build.07",
    description: "Reads prepared weather metadata.",
    author: "ORION",
    license: "MIT",
    permissions: ["weather.read", "location.read"],
    capabilities: ["weather.read", "forecast.read"],
    events: {
      publishes: ["WeatherRead"],
      consumes: ["LocationSelected"],
    },
    inputs: ["location.value"],
    outputs: ["weather.value"],
    failureModes: ["weather.unavailable"],
    ...overrides,
  };
}

describe("M7 Skill Core values", () => {
  it.each([
    [skillIdentifier, "a", "a-b2", "", "A"],
    [skillCapabilityIdentifier, "a", "a.b-c", "", "A"],
    [skillPermissionIdentifier, "a.b", "read.value", "ab", "a.*"],
    [eventDeclarationIdentifier, "A", "Weather2Read", "", "weather"],
    [skillInterfaceFieldIdentifier, "a", "input.value", "", "A"],
    [skillFailureModeIdentifier, "a", "failure.mode", "", "A"],
    [skillVersion, "0.0.0", "1.2.3-a.1+07", "1.2", "01.2.3"],
  ] as const)(
    "validates scalar factories without coercion",
    (factory, minimum, complex, tooShort, malformed) => {
      expect(factory(minimum)).toBe(minimum);
      expect(factory(complex)).toBe(complex);
      expect(() => factory(tooShort)).toThrow(InvalidSkillManifestError);
      expect(() => factory(malformed)).toThrow(InvalidSkillManifestError);
      expect(() => factory({ toString: () => minimum })).toThrow(
        InvalidSkillManifestError,
      );
    },
  );

  it("enforces all identifier and version upper bounds", () => {
    expect(skillIdentifier(`a${"0".repeat(63)}`)).toHaveLength(64);
    expect(() => skillIdentifier(`a${"0".repeat(64)}`)).toThrow(
      InvalidSkillManifestError,
    );
    expect(skillCapabilityIdentifier(`a${"0".repeat(127)}`)).toHaveLength(128);
    expect(() => skillCapabilityIdentifier(`a${"0".repeat(128)}`)).toThrow(
      InvalidSkillManifestError,
    );
    expect(skillPermissionIdentifier(`a.${"b".repeat(126)}`)).toHaveLength(128);
    expect(() => skillPermissionIdentifier(`a.${"b".repeat(127)}`)).toThrow(
      InvalidSkillManifestError,
    );
    expect(eventDeclarationIdentifier(`A${"b".repeat(127)}`)).toHaveLength(128);
    expect(() => eventDeclarationIdentifier(`A${"b".repeat(128)}`)).toThrow(
      InvalidSkillManifestError,
    );
    expect(skillVersion(`1.0.0+${"a".repeat(122)}`)).toHaveLength(128);
    expect(() => skillVersion(`1.0.0+${"a".repeat(123)}`)).toThrow(
      InvalidSkillManifestError,
    );
  });

  it.each([
    "1.0.0",
    "1.0.0-alpha",
    "1.0.0-alpha.1",
    "1.0.0-0A",
    "1.0.0+001",
    "1.0.0-alpha+build.1",
  ])("accepts complete Semantic Version %s", (version) => {
    expect(skillVersion(version)).toBe(version);
  });

  it.each([
    "v1.0.0",
    "1.0.0 ",
    "1.0.0-01",
    "1.0.0-",
    "1.0.0+",
    "1.0.0-a..b",
    "1.0.0_1",
  ])("rejects incomplete Semantic Version %s", (version) => {
    expect(() => skillVersion(version)).toThrow(InvalidSkillManifestError);
  });

  it("constructs, canonicalizes and deeply freezes all twelve fields", () => {
    const input = manifest();
    const before = structuredClone(input);
    const result = createSkillManifest(input);
    expect(Object.keys(result)).toEqual([
      "id",
      "name",
      "version",
      "description",
      "author",
      "license",
      "permissions",
      "capabilities",
      "events",
      "inputs",
      "outputs",
      "failureModes",
    ]);
    expect(result.permissions).toEqual(["location.read", "weather.read"]);
    expect(result.capabilities).toEqual(["forecast.read", "weather.read"]);
    expect(Object.isFrozen(result)).toBe(true);
    expect(Object.isFrozen(result.events)).toBe(true);
    for (const collection of [
      result.permissions,
      result.capabilities,
      result.events.publishes,
      result.events.consumes,
      result.inputs,
      result.outputs,
      result.failureModes,
    ])
      expect(Object.isFrozen(collection)).toBe(true);
    expect(input).toEqual(before);
    expect(Object.isFrozen(input)).toBe(false);
    expect(Object.isFrozen(input.permissions)).toBe(false);
  });

  it("counts Unicode code points, preserves text, and rejects controls", () => {
    const nonBmp = "😀".repeat(100);
    expect(createSkillManifest(manifest({ name: nonBmp })).name).toBe(nonBmp);
    expect(() =>
      createSkillManifest(manifest({ name: "😀".repeat(101) })),
    ).toThrow(InvalidSkillManifestError);
    expect(() => createSkillManifest(manifest({ author: " \t " }))).toThrow(
      InvalidSkillManifestError,
    );
    expect(() =>
      createSkillManifest(manifest({ description: "bad\u0000" })),
    ).toThrow(InvalidSkillManifestError);
    expect(createSkillManifest(manifest({ name: " exact " })).name).toBe(
      " exact ",
    );
    expect(() => createSkillManifest(manifest({ license: "\t" }))).toThrow(
      InvalidSkillManifestError,
    );
    expect(() => createSkillManifest(manifest({ license: "é" }))).toThrow(
      InvalidSkillManifestError,
    );
  });

  it.each([
    ["name", 100],
    ["description", 500],
    ["author", 100],
  ] as const)("enforces the exact %s code-point bound", (field, maximum) => {
    const admitted = createSkillManifest(
      manifest({ [field]: "😀".repeat(maximum) }),
    );
    expect([...admitted[field]].length).toBe(maximum);
    expect(() =>
      createSkillManifest(manifest({ [field]: "😀".repeat(maximum + 1) })),
    ).toThrow(InvalidSkillManifestError);
    expect(() => createSkillManifest(manifest({ [field]: "" }))).toThrow(
      InvalidSkillManifestError,
    );
    expect(() =>
      createSkillManifest(manifest({ [field]: "\u0001value" })),
    ).toThrow(InvalidSkillManifestError);
  });

  it("enforces exact printable-ASCII License bounds", () => {
    expect(
      createSkillManifest(manifest({ license: "A".repeat(64) })).license,
    ).toHaveLength(64);
    expect(() =>
      createSkillManifest(manifest({ license: "A".repeat(65) })),
    ).toThrow(InvalidSkillManifestError);
    expect(() => createSkillManifest(manifest({ license: "" }))).toThrow(
      InvalidSkillManifestError,
    );
    expect(() =>
      createSkillManifest(manifest({ license: " ".repeat(64) })),
    ).toThrow(InvalidSkillManifestError);
    expect(() => createSkillManifest(manifest({ license: "\u007f" }))).toThrow(
      InvalidSkillManifestError,
    );
  });

  it.each([
    ["permissions", ["a.read", "a.read"]],
    ["capabilities", ["a.read", "a.read"]],
    ["inputs", ["a", "a"]],
    ["outputs", ["a", "a"]],
    ["failureModes", ["a", "a"]],
  ])("rejects duplicate %s", (field, value) => {
    expect(() => createSkillManifest(manifest({ [field]: value }))).toThrow(
      InvalidSkillManifestError,
    );
  });

  it("rejects duplicate nested event declarations", () => {
    expect(() =>
      createSkillManifest(
        manifest({ events: { publishes: ["Same", "Same"], consumes: [] } }),
      ),
    ).toThrow(InvalidSkillManifestError);
  });

  it("enforces collection lower and upper bounds", () => {
    expect(() => createSkillManifest(manifest({ capabilities: [] }))).toThrow(
      InvalidSkillManifestError,
    );
    expect(
      createSkillManifest(
        manifest({
          capabilities: Array.from({ length: 64 }, (_, index) => `a.${index}`),
        }),
      ).capabilities,
    ).toHaveLength(64);
    expect(() =>
      createSkillManifest(
        manifest({
          capabilities: Array.from({ length: 65 }, (_, index) => `a.${index}`),
        }),
      ),
    ).toThrow(InvalidSkillManifestError);
  });

  it.each([
    ["permissions", (index: number) => `permission${index}.read`],
    ["inputs", (index: number) => `input.${index}`],
    ["outputs", (index: number) => `output.${index}`],
    ["failureModes", (index: number) => `failure.${index}`],
  ] as const)("enforces the 0–64 %s bound", (field, entry) => {
    expect(
      createSkillManifest(
        manifest({
          [field]: Array.from({ length: 64 }, (_, index) => entry(index)),
        }),
      )[field],
    ).toHaveLength(64);
    expect(() =>
      createSkillManifest(
        manifest({
          [field]: Array.from({ length: 65 }, (_, index) => entry(index)),
        }),
      ),
    ).toThrow(InvalidSkillManifestError);
  });

  it.each(["publishes", "consumes"] as const)(
    "enforces the 0–64 events.%s bound",
    (field) => {
      const values = Array.from({ length: 64 }, (_, index) => `Event${index}`);
      expect(
        createSkillManifest(
          manifest({
            events: {
              publishes: field === "publishes" ? values : [],
              consumes: field === "consumes" ? values : [],
            },
          }),
        ).events[field],
      ).toHaveLength(64);
      const overflow = [...values, "Event64"];
      expect(() =>
        createSkillManifest(
          manifest({
            events: {
              publishes: field === "publishes" ? overflow : [],
              consumes: field === "consumes" ? overflow : [],
            },
          }),
        ),
      ).toThrow(InvalidSkillManifestError);
    },
  );

  it.each(Object.keys(manifest()))(
    "rejects missing and explicit undefined manifest field %s",
    (field) => {
      const missing = manifest();
      delete (missing as Record<string, unknown>)[field];
      expect(() => createSkillManifest(missing)).toThrow(
        InvalidSkillManifestError,
      );
      expect(() =>
        createSkillManifest(manifest({ [field]: undefined })),
      ).toThrow(InvalidSkillManifestError);
    },
  );

  it("requires exact nested Event object semantics", () => {
    expect(() =>
      createSkillManifest(manifest({ events: { publishes: [] } })),
    ).toThrow(InvalidSkillManifestError);
    expect(() =>
      createSkillManifest(
        manifest({
          events: { publishes: [], consumes: [], extra: [] },
        }),
      ),
    ).toThrow(InvalidSkillManifestError);
    const events = { publishes: [], consumes: [] };
    Object.defineProperty(events, Symbol("extra"), {
      enumerable: true,
      value: true,
    });
    expect(() => createSkillManifest(manifest({ events }))).toThrow(
      InvalidSkillManifestError,
    );
  });

  it.each([
    null,
    undefined,
    true,
    1,
    "manifest",
    [],
    () => undefined,
    { ...manifest(), extra: true },
    Object.assign(Object.create({ id: "weather-reader" }), {
      ...manifest(),
      id: undefined,
    }),
  ])("rejects malformed exact manifest shapes", (value) => {
    expect(() => createSkillManifest(value)).toThrow(InvalidSkillManifestError);
  });

  it("rejects enumerable symbols and sparse/additional arrays", () => {
    const symbolManifest = manifest();
    Object.defineProperty(symbolManifest, Symbol("extra"), {
      enumerable: true,
      value: true,
    });
    expect(() => createSkillManifest(symbolManifest)).toThrow(
      InvalidSkillManifestError,
    );
    const capabilities = ["weather.read"];
    Object.assign(capabilities, { extra: true });
    expect(() => createSkillManifest(manifest({ capabilities }))).toThrow(
      InvalidSkillManifestError,
    );
    const sparse = new Array(1);
    expect(() =>
      createSkillManifest(manifest({ capabilities: sparse })),
    ).toThrow(InvalidSkillManifestError);
  });

  it("normalizes hostile records and arrays without native leakage", () => {
    const hostile = new Proxy(manifest(), {
      ownKeys() {
        throw "hostile";
      },
    });
    expect(() => createSkillManifest(hostile)).toThrow(
      InvalidSkillManifestError,
    );
    const descriptorHostile = new Proxy(manifest(), {
      getOwnPropertyDescriptor() {
        throw new TypeError("private");
      },
    });
    expect(() => createSkillManifest(descriptorHostile)).toThrow(
      InvalidSkillManifestError,
    );
    const capabilities = new Proxy(["weather.read"], {
      getOwnPropertyDescriptor() {
        throw new Error("private");
      },
    });
    expect(() => createSkillManifest(manifest({ capabilities }))).toThrow(
      InvalidSkillManifestError,
    );
  });

  it("completes structural extraction before semantic validation", () => {
    const capabilities = new Proxy(["weather.read"], {
      ownKeys() {
        throw new Error("structural failure");
      },
    });
    expect(() =>
      createSkillManifest(
        manifest({
          name: "",
          capabilities,
        }),
      ),
    ).toThrow(InvalidSkillManifestError);
  });

  it("reads stateful properties and indices once", () => {
    let nameReads = 0;
    let capabilityReads = 0;
    const input = manifest();
    Object.defineProperty(input, "name", {
      enumerable: true,
      get: () => (++nameReads === 1 ? "Weather" : "Changed"),
    });
    const capabilities = ["unused"];
    Object.defineProperty(capabilities, "0", {
      enumerable: true,
      configurable: true,
      get: () => (++capabilityReads === 1 ? "weather.read" : "changed"),
    });
    input.capabilities = capabilities;
    const result = createSkillManifest(input);
    expect(result.name).toBe("Weather");
    expect(result.capabilities).toEqual(["weather.read"]);
    expect(nameReads).toBe(1);
    expect(capabilityReads).toBe(1);
  });

  it("normalizes throwing nested getters and preserves caller ownership", () => {
    const events = {
      get publishes(): never {
        throw new TypeError("private nested value");
      },
      consumes: [],
    };
    const input = manifest({ events });
    expect(() => createSkillManifest(input)).toThrow(InvalidSkillManifestError);
    expect(Object.isFrozen(input)).toBe(false);
    expect(Object.isFrozen(events)).toBe(false);
  });

  it("reconstructs Registered Skill and validates discovery state", () => {
    const admitted = createRegisteredSkill(manifest());
    const result = createSkillDiscoveryResult({
      capability: "weather.read",
      matches: [admitted],
    });
    expect(result.matches).toHaveLength(1);
    expect(result.matches[0]).not.toBe(admitted);
    expect(Object.isFrozen(result)).toBe(true);
    expect(() =>
      createSkillDiscoveryResult({
        capability: "absent.read",
        matches: [admitted],
      }),
    ).toThrow(InvalidSkillStateError);
  });
});

describe("M7 Skill request extraction", () => {
  it("accepts the three exact synchronous request shapes", () => {
    expect(
      extractRegisterSkillRequest({
        intent: "register-skill-manifest",
        manifest: manifest(),
      }).readManifest(),
    ).toBeDefined();
    expect(
      extractGetRegisteredSkillRequest({
        intent: "get-registered-skill",
        skillId: "weather-reader",
      }).readSkillId(),
    ).toBe("weather-reader");
    expect(
      extractDiscoverSkillsRequest({
        intent: "discover-skills",
        capability: "weather.read",
      }).readCapability(),
    ).toBe("weather.read");
  });

  it.each([
    null,
    undefined,
    false,
    0,
    0n,
    Symbol("request"),
    "request",
    () => undefined,
    [],
    { intent: "discover-skills" },
    { intent: "discover-skills", capability: "a", extra: true },
    { intent: "wrong", capability: "a" },
  ])("rejects malformed request envelopes", (value) => {
    expect(() => extractDiscoverSkillsRequest(value)).toThrow(
      InvalidSkillInputError,
    );
  });

  it("rejects explicit undefined when the staged field is read", () => {
    const request = extractDiscoverSkillsRequest({
      intent: "discover-skills",
      capability: undefined,
    });
    expect(() => request.readCapability()).toThrow(InvalidSkillInputError);
  });

  it("rejects enumerable symbols and inherited request substitutes", () => {
    const symbolic = {
      intent: "discover-skills",
      capability: "weather.read",
      [Symbol("extra")]: true,
    };
    expect(() => extractDiscoverSkillsRequest(symbolic)).toThrow(
      InvalidSkillInputError,
    );
    const inherited = Object.create({
      intent: "discover-skills",
      capability: "weather.read",
    });
    expect(() => extractDiscoverSkillsRequest(inherited)).toThrow(
      InvalidSkillInputError,
    );
  });

  it("reads request getters once and normalizes hostile Proxies", () => {
    let reads = 0;
    const request = {
      intent: "discover-skills",
      get capability() {
        reads += 1;
        return "weather.read";
      },
    };
    expect(extractDiscoverSkillsRequest(request).readCapability()).toBe(
      "weather.read",
    );
    expect(reads).toBe(1);
    expect(() =>
      extractDiscoverSkillsRequest(
        new Proxy(request, {
          ownKeys() {
            throw new Error("private");
          },
        }),
      ),
    ).toThrow(InvalidSkillInputError);
  });

  it("stages Register intent before one protected manifest read", () => {
    let invalidReads = 0;
    expect(() =>
      extractRegisterSkillRequest({
        intent: "wrong",
        get manifest() {
          invalidReads += 1;
          throw new Error("must remain untouched");
        },
      }),
    ).toThrow(InvalidSkillInputError);
    expect(invalidReads).toBe(0);

    let validReads = 0;
    const captured = extractRegisterSkillRequest({
      intent: "register-skill-manifest",
      get manifest() {
        validReads += 1;
        if (validReads > 1) throw new Error("second read");
        return manifest();
      },
    });
    expect(captured.readManifest()).toEqual(manifest());
    expect(captured.readManifest()).toEqual(manifest());
    expect(validReads).toBe(1);
  });
});
