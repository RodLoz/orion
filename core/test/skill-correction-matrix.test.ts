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
    id: "catalog-skill",
    name: "Catalog Skill",
    version: "1.0.0",
    description: "Catalog metadata.",
    author: "ORION",
    license: "MIT",
    permissions: ["z.read", "a.read"],
    capabilities: ["z.read", "a.read"],
    events: { publishes: ["ZuluEvent", "AlphaEvent"], consumes: [] },
    inputs: ["z.input", "a.input"],
    outputs: ["z.output", "a.output"],
    failureModes: ["z.failure", "a.failure"],
    ...overrides,
  };
}

const hostileScalars: readonly unknown[] = [
  null,
  undefined,
  1,
  true,
  0n,
  Symbol("value"),
  () => "a",
  [],
  ["a"],
  {},
  { toString: () => "a" },
];

describe("M7 exported scalar factory matrix", () => {
  it.each([
    ["skillIdentifier", skillIdentifier, "a", `a${"0".repeat(63)}`],
    [
      "skillCapabilityIdentifier",
      skillCapabilityIdentifier,
      "a",
      `a${"0".repeat(127)}`,
    ],
    [
      "skillPermissionIdentifier",
      skillPermissionIdentifier,
      "a.b",
      `a.${"b".repeat(126)}`,
    ],
    [
      "eventDeclarationIdentifier",
      eventDeclarationIdentifier,
      "A",
      `A${"b".repeat(127)}`,
    ],
    [
      "skillInterfaceFieldIdentifier",
      skillInterfaceFieldIdentifier,
      "a",
      `a${"0".repeat(63)}`,
    ],
    [
      "skillFailureModeIdentifier",
      skillFailureModeIdentifier,
      "a",
      `a${"0".repeat(63)}`,
    ],
  ] as const)(
    "%s directly rejects every hostile scalar category",
    (_name, factory, lower, upper) => {
      expect(factory(lower)).toBe(lower);
      expect(factory(upper)).toBe(upper);
      expect(() => factory(`${upper}0`)).toThrow(InvalidSkillManifestError);
      for (const hostile of hostileScalars)
        expect(() => factory(hostile)).toThrow(InvalidSkillManifestError);
    },
  );

  it("covers complete bounded Semantic Version syntax and preservation", () => {
    const maximum = `1.0.0+${"a".repeat(122)}`;
    for (const valid of [
      "0.0.0",
      "12.34.56",
      "1.0.0-alpha",
      "1.0.0+build.001",
      "1.0.0-alpha.1+build-7",
      maximum,
    ])
      expect(skillVersion(valid)).toBe(valid);
    for (const invalid of [
      "1.0",
      "01.0.0",
      "1.0.0-",
      "1.0.0-a..b",
      "1.0.0-01",
      "1.0.0!",
      " 1.0.0",
      "1.0.0-é",
      "１.0.0",
      `${maximum}a`,
      { toString: () => "1.0.0" },
      null,
      Symbol("version"),
    ])
      expect(() => skillVersion(invalid)).toThrow(InvalidSkillManifestError);
  });
});

type CollectionCase = Readonly<{
  name: string;
  minimum: number;
  entry: (index: number) => string;
  apply: (values: unknown) => Record<string, unknown>;
  select: (value: ReturnType<typeof createSkillManifest>) => readonly string[];
}>;

const collections: readonly CollectionCase[] = [
  {
    name: "permissions",
    minimum: 0,
    entry: (index) => `permission${index}.read`,
    apply: (values) => ({ permissions: values }),
    select: (value) => value.permissions,
  },
  {
    name: "capabilities",
    minimum: 1,
    entry: (index) => `capability.${index}`,
    apply: (values) => ({ capabilities: values }),
    select: (value) => value.capabilities,
  },
  {
    name: "events.publishes",
    minimum: 0,
    entry: (index) => `PublishedEvent${index}`,
    apply: (values) => ({
      events: { publishes: values, consumes: [] },
    }),
    select: (value) => value.events.publishes,
  },
  {
    name: "events.consumes",
    minimum: 0,
    entry: (index) => `ConsumedEvent${index}`,
    apply: (values) => ({
      events: { publishes: [], consumes: values },
    }),
    select: (value) => value.events.consumes,
  },
  {
    name: "inputs",
    minimum: 0,
    entry: (index) => `input.${index}`,
    apply: (values) => ({ inputs: values }),
    select: (value) => value.inputs,
  },
  {
    name: "outputs",
    minimum: 0,
    entry: (index) => `output.${index}`,
    apply: (values) => ({ outputs: values }),
    select: (value) => value.outputs,
  },
  {
    name: "failureModes",
    minimum: 0,
    entry: (index) => `failure.${index}`,
    apply: (values) => ({ failureModes: values }),
    select: (value) => value.failureModes,
  },
];

describe.each(collections)("M7 $name declaration collection", (entry) => {
  const create = (values: unknown) =>
    createSkillManifest(manifest(entry.apply(values)));

  it("covers minimum, maximum, overflow, duplicate and canonical order", () => {
    const minimumValues = entry.minimum === 0 ? [] : [entry.entry(0)];
    expect(entry.select(create(minimumValues))).toHaveLength(entry.minimum);
    const maximum = Array.from({ length: 64 }, (_, index) =>
      entry.entry(index),
    );
    expect(entry.select(create(maximum))).toHaveLength(64);
    expect(() => create([...maximum, entry.entry(64)])).toThrow(
      InvalidSkillManifestError,
    );
    const duplicate = [entry.entry(1), entry.entry(1)];
    expect(() => create(duplicate)).toThrow(InvalidSkillManifestError);
    const unsorted = [entry.entry(2), entry.entry(1)];
    const before = [...unsorted];
    const admitted = entry.select(create(unsorted));
    expect(admitted).toEqual([...before].sort());
    expect(unsorted).toEqual(before);
    expect(Object.isFrozen(unsorted)).toBe(false);
    expect(Object.isFrozen(admitted)).toBe(true);
  });

  it("rejects sparse, decorated, symbolic and array-like values", () => {
    const sparse = new Array(Math.max(1, entry.minimum));
    expect(() => create(sparse)).toThrow(InvalidSkillManifestError);
    const decorated = [entry.entry(0)];
    Object.assign(decorated, { extra: true });
    expect(() => create(decorated)).toThrow(InvalidSkillManifestError);
    const symbolic = [entry.entry(0)];
    Object.defineProperty(symbolic, Symbol("extra"), {
      enumerable: true,
      value: true,
    });
    expect(() => create(symbolic)).toThrow(InvalidSkillManifestError);
    expect(() => create({ 0: entry.entry(0), length: 1 })).toThrow(
      InvalidSkillManifestError,
    );
  });

  it("rejects hostile descriptors, indices and Proxies without leakage", () => {
    const nonCanonical = [entry.entry(0)];
    Object.defineProperty(nonCanonical, "0", {
      configurable: true,
      enumerable: false,
      value: entry.entry(0),
      writable: true,
    });
    expect(() => create(nonCanonical)).toThrow(InvalidSkillManifestError);

    let throwingReads = 0;
    const throwing = [entry.entry(0)];
    Object.defineProperty(throwing, "0", {
      configurable: true,
      enumerable: true,
      get() {
        throwingReads += 1;
        throw new Error("private");
      },
    });
    expect(() => create(throwing)).toThrow(InvalidSkillManifestError);
    expect(throwingReads).toBe(1);

    let statefulReads = 0;
    const stateful = [entry.entry(0)];
    Object.defineProperty(stateful, "0", {
      configurable: true,
      enumerable: true,
      get() {
        statefulReads += 1;
        return statefulReads === 1 ? entry.entry(0) : "invalid value";
      },
    });
    expect(entry.select(create(stateful))).toEqual([entry.entry(0)]);
    expect(statefulReads).toBe(1);

    for (const proxy of [
      new Proxy([entry.entry(0)], {
        ownKeys() {
          throw new Error("private");
        },
      }),
      new Proxy([entry.entry(0)], {
        getOwnPropertyDescriptor() {
          throw new Error("private");
        },
      }),
    ])
      expect(() => create(proxy)).toThrow(InvalidSkillManifestError);
  });
});

const malformedRequests: readonly unknown[] = [
  null,
  undefined,
  false,
  1,
  0n,
  Symbol("request"),
  "request",
  () => undefined,
  [],
  { 0: "value", length: 1 },
];

describe("M7 exact request matrices", () => {
  it("covers Register envelope shape and staged getter failures", () => {
    for (const malformed of malformedRequests)
      expect(() => extractRegisterSkillRequest(malformed)).toThrow(
        InvalidSkillInputError,
      );
    for (const malformed of [
      { manifest: manifest() },
      { intent: "register-skill-manifest" },
      { intent: undefined, manifest: manifest() },
      { intent: "wrong", manifest: manifest() },
      {
        intent: "register-skill-manifest",
        manifest: manifest(),
        extra: true,
      },
      {
        intent: { toString: () => "register-skill-manifest" },
        manifest: manifest(),
      },
    ])
      expect(() => extractRegisterSkillRequest(malformed)).toThrow(
        InvalidSkillInputError,
      );
    const undefinedManifest = extractRegisterSkillRequest({
      intent: "register-skill-manifest",
      manifest: undefined,
    });
    expect(() => undefinedManifest.readManifest()).toThrow(
      InvalidSkillManifestError,
    );
    const symbolic = {
      intent: "register-skill-manifest",
      manifest: manifest(),
      [Symbol("extra")]: true,
    };
    expect(() => extractRegisterSkillRequest(symbolic)).toThrow(
      InvalidSkillInputError,
    );
    expect(() =>
      extractRegisterSkillRequest(
        Object.create({
          intent: "register-skill-manifest",
          manifest: manifest(),
        }),
      ),
    ).toThrow(InvalidSkillInputError);

    let manifestReadsAfterIntentFailure = 0;
    expect(() =>
      extractRegisterSkillRequest({
        get intent(): never {
          throw new Error("private");
        },
        get manifest() {
          manifestReadsAfterIntentFailure += 1;
          throw new Error("must remain untouched");
        },
      }),
    ).toThrow(InvalidSkillInputError);
    expect(manifestReadsAfterIntentFailure).toBe(0);

    let throwingManifestReads = 0;
    const throwingManifest = extractRegisterSkillRequest({
      intent: "register-skill-manifest",
      get manifest() {
        throwingManifestReads += 1;
        throw new Error("private");
      },
    });
    expect(() => throwingManifest.readManifest()).toThrow(
      InvalidSkillManifestError,
    );
    expect(throwingManifestReads).toBe(1);

    for (const trap of ["ownKeys", "getOwnPropertyDescriptor"] as const) {
      const hostile = new Proxy(
        {},
        {
          [trap]() {
            throw new Error("private");
          },
        },
      );
      expect(() => extractRegisterSkillRequest(hostile)).toThrow(
        InvalidSkillInputError,
      );
    }

    let intentReads = 0;
    const request = {
      get intent() {
        intentReads += 1;
        return "register-skill-manifest";
      },
      manifest: manifest(),
    };
    const before = structuredClone(request.manifest);
    const captured = extractRegisterSkillRequest(request);
    expect(captured.readManifest()).toEqual(before);
    expect(intentReads).toBe(1);
    expect(request.manifest).toEqual(before);
    expect(Object.isFrozen(request.manifest)).toBe(false);
  });

  it.each([
    [
      "Get",
      extractGetRegisteredSkillRequest,
      "get-registered-skill",
      "skillId",
      "catalog-skill",
    ],
    [
      "Discover",
      extractDiscoverSkillsRequest,
      "discover-skills",
      "capability",
      "catalog.read",
    ],
  ] as const)(
    "covers the exact %s request envelope",
    (_name, factory, intent, field, value) => {
      for (const malformed of malformedRequests)
        expect(() => factory(malformed)).toThrow(InvalidSkillInputError);
      for (const malformed of [
        { [field]: value },
        { intent },
        { intent: undefined, [field]: value },
        { intent: "wrong", [field]: value },
        { intent, [field]: value, extra: true },
      ])
        expect(() => factory(malformed)).toThrow(InvalidSkillInputError);
      const coercible = factory({
        intent,
        [field]: { toString: () => value },
      });
      expect(coercible).toBeDefined();
      const explicitUndefined = factory({
        intent,
        [field]: undefined,
      }) as unknown as {
        readSkillId?: () => unknown;
        readCapability?: () => unknown;
      };
      expect(() =>
        (explicitUndefined.readSkillId ?? explicitUndefined.readCapability)?.(),
      ).toThrow(InvalidSkillInputError);
      const symbolic = {
        intent,
        [field]: value,
        [Symbol("extra")]: true,
      };
      expect(() => factory(symbolic)).toThrow(InvalidSkillInputError);
      expect(() => factory(Object.create({ intent, [field]: value }))).toThrow(
        InvalidSkillInputError,
      );
      let laterReads = 0;
      expect(() =>
        factory({
          intent: "wrong",
          get [field]() {
            laterReads += 1;
            throw new Error("must remain untouched");
          },
        }),
      ).toThrow(InvalidSkillInputError);
      expect(laterReads).toBe(0);
      for (const trap of ["ownKeys", "getOwnPropertyDescriptor"] as const)
        expect(() =>
          factory(
            new Proxy(
              {},
              {
                [trap]() {
                  throw new Error("private");
                },
              },
            ),
          ),
        ).toThrow(InvalidSkillInputError);
      let intentReads = 0;
      let fieldReads = 0;
      const request = {
        get intent() {
          intentReads += 1;
          return intent;
        },
        get [field]() {
          fieldReads += 1;
          return value;
        },
      };
      const captured = factory(request) as unknown as {
        readSkillId?: () => unknown;
        readCapability?: () => unknown;
      };
      expect(captured.readSkillId?.() ?? captured.readCapability?.()).toBe(
        value,
      );
      expect(intentReads).toBe(1);
      expect(fieldReads).toBe(1);
      const throwing = factory({
        intent,
        get [field]() {
          throw new Error("private");
        },
      }) as unknown as {
        readSkillId?: () => unknown;
        readCapability?: () => unknown;
      };
      expect(() =>
        (throwing.readSkillId ?? throwing.readCapability)?.(),
      ).toThrow(InvalidSkillInputError);
    },
  );
});

describe("M7 aggregate public factories", () => {
  it("directly hardens Registered Skill construction", () => {
    const input = manifest();
    const before = structuredClone(input);
    const result = createRegisteredSkill(input);
    expect(result).toEqual(createSkillManifest(input));
    expect(result).not.toBe(input);
    expect(Object.isFrozen(result)).toBe(true);
    expect(input).toEqual(before);
    for (const hostile of [...malformedRequests, { ...input, extra: true }])
      expect(() => createRegisteredSkill(hostile)).toThrow(
        InvalidSkillManifestError,
      );
  });

  it("directly hardens Skill Discovery Result construction", () => {
    const registered = createRegisteredSkill(manifest());
    const input = { capability: "a.read", matches: [registered] };
    const result = createSkillDiscoveryResult(input);
    expect(Object.isFrozen(result)).toBe(true);
    expect(Object.isFrozen(result.matches)).toBe(true);
    expect(result.matches[0]).not.toBe(registered);
    for (const hostile of [
      ...malformedRequests,
      { capability: "a.read" },
      { matches: [] },
      { capability: "a.read", matches: [], extra: true },
      { capability: "wrong.read", matches: [registered] },
      {
        capability: "a.read",
        matches: new Proxy([registered], {
          ownKeys() {
            throw new Error("private");
          },
        }),
      },
    ])
      expect(() => createSkillDiscoveryResult(hostile)).toThrow(
        InvalidSkillStateError,
      );
  });
});
