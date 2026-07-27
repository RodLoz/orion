import {
  InvalidSkillInputError,
  InvalidSkillManifestError,
  InvalidSkillStateError,
} from "./skill-errors.js";

declare const skillIdentifierBrand: unique symbol;
declare const skillCapabilityIdentifierBrand: unique symbol;
declare const skillPermissionIdentifierBrand: unique symbol;
declare const eventDeclarationIdentifierBrand: unique symbol;
declare const skillInterfaceFieldIdentifierBrand: unique symbol;
declare const skillFailureModeIdentifierBrand: unique symbol;
declare const skillVersionBrand: unique symbol;

export type SkillIdentifier = string & {
  readonly [skillIdentifierBrand]: true;
};
export type SkillCapabilityIdentifier = string & {
  readonly [skillCapabilityIdentifierBrand]: true;
};
export type SkillPermissionIdentifier = string & {
  readonly [skillPermissionIdentifierBrand]: true;
};
export type EventDeclarationIdentifier = string & {
  readonly [eventDeclarationIdentifierBrand]: true;
};
export type SkillInterfaceFieldIdentifier = string & {
  readonly [skillInterfaceFieldIdentifierBrand]: true;
};
export type SkillFailureModeIdentifier = string & {
  readonly [skillFailureModeIdentifierBrand]: true;
};
export type SkillVersion = string & { readonly [skillVersionBrand]: true };

export interface SkillEventDeclarations {
  readonly publishes: readonly EventDeclarationIdentifier[];
  readonly consumes: readonly EventDeclarationIdentifier[];
}

export interface SkillManifest {
  readonly id: SkillIdentifier;
  readonly name: string;
  readonly version: SkillVersion;
  readonly description: string;
  readonly author: string;
  readonly license: string;
  readonly permissions: readonly SkillPermissionIdentifier[];
  readonly capabilities: readonly SkillCapabilityIdentifier[];
  readonly events: SkillEventDeclarations;
  readonly inputs: readonly SkillInterfaceFieldIdentifier[];
  readonly outputs: readonly SkillInterfaceFieldIdentifier[];
  readonly failureModes: readonly SkillFailureModeIdentifier[];
}

export type RegisteredSkill = SkillManifest;

export interface SkillDiscoveryResult {
  readonly capability: SkillCapabilityIdentifier;
  readonly matches: readonly RegisteredSkill[];
}

export const SKILL_IDENTIFIER_MAX_LENGTH = 64;
export const SKILL_DECLARATION_MAX_LENGTH = 128;
export const SKILL_INTERFACE_IDENTIFIER_MAX_LENGTH = 64;
export const SKILL_COLLECTION_MAX_COUNT = 64;
export const SKILL_NAME_MAX_CODE_POINTS = 100;
export const SKILL_DESCRIPTION_MAX_CODE_POINTS = 500;
export const SKILL_AUTHOR_MAX_CODE_POINTS = 100;
export const SKILL_LICENSE_MAX_LENGTH = 64;
export const SKILL_VERSION_MAX_LENGTH = 128;

const capabilityGrammar = /^[a-z][a-z0-9]*(?:[.-][a-z0-9]+)*$/;

export function skillIdentifier(value: unknown): SkillIdentifier {
  return scalar(
    value,
    (text) =>
      text.length <= SKILL_IDENTIFIER_MAX_LENGTH &&
      /^[a-z][a-z0-9]*(?:-[a-z0-9]+)*$/.test(text),
  ) as SkillIdentifier;
}

export function skillCapabilityIdentifier(
  value: unknown,
): SkillCapabilityIdentifier {
  return scalar(
    value,
    (text) =>
      text.length <= SKILL_DECLARATION_MAX_LENGTH &&
      capabilityGrammar.test(text),
  ) as SkillCapabilityIdentifier;
}

export function skillPermissionIdentifier(
  value: unknown,
): SkillPermissionIdentifier {
  return scalar(
    value,
    (text) =>
      text.length >= 3 &&
      text.length <= SKILL_DECLARATION_MAX_LENGTH &&
      /^[a-z][a-z0-9]*(?:\.[a-z][a-z0-9]*)+$/.test(text),
  ) as SkillPermissionIdentifier;
}

export function eventDeclarationIdentifier(
  value: unknown,
): EventDeclarationIdentifier {
  return scalar(
    value,
    (text) =>
      text.length <= SKILL_DECLARATION_MAX_LENGTH &&
      /^[A-Z][A-Za-z0-9]*$/.test(text),
  ) as EventDeclarationIdentifier;
}

export function skillInterfaceFieldIdentifier(
  value: unknown,
): SkillInterfaceFieldIdentifier {
  return scalar(
    value,
    (text) =>
      text.length <= SKILL_INTERFACE_IDENTIFIER_MAX_LENGTH &&
      capabilityGrammar.test(text),
  ) as SkillInterfaceFieldIdentifier;
}

export function skillFailureModeIdentifier(
  value: unknown,
): SkillFailureModeIdentifier {
  return scalar(
    value,
    (text) =>
      text.length <= SKILL_INTERFACE_IDENTIFIER_MAX_LENGTH &&
      capabilityGrammar.test(text),
  ) as SkillFailureModeIdentifier;
}

export function skillVersion(value: unknown): SkillVersion {
  return scalar(
    value,
    (text) =>
      text.length >= 5 &&
      text.length <= SKILL_VERSION_MAX_LENGTH &&
      validSemanticVersion(text),
  ) as SkillVersion;
}

export function createSkillManifest(value: unknown): SkillManifest {
  try {
    const source = exactRecord(value, [
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
    const events = exactRecord(source.events, ["publishes", "consumes"]);
    const permissions = exactArray(
      source.permissions,
      0,
      SKILL_COLLECTION_MAX_COUNT,
    );
    const capabilities = exactArray(
      source.capabilities,
      1,
      SKILL_COLLECTION_MAX_COUNT,
    );
    const publishes = exactArray(
      events.publishes,
      0,
      SKILL_COLLECTION_MAX_COUNT,
    );
    const consumes = exactArray(events.consumes, 0, SKILL_COLLECTION_MAX_COUNT);
    const inputs = exactArray(source.inputs, 0, SKILL_COLLECTION_MAX_COUNT);
    const outputs = exactArray(source.outputs, 0, SKILL_COLLECTION_MAX_COUNT);
    const failureModes = exactArray(
      source.failureModes,
      0,
      SKILL_COLLECTION_MAX_COUNT,
    );
    return Object.freeze({
      id: skillIdentifier(source.id),
      name: freeText(source.name, 1, SKILL_NAME_MAX_CODE_POINTS),
      version: skillVersion(source.version),
      description: freeText(
        source.description,
        1,
        SKILL_DESCRIPTION_MAX_CODE_POINTS,
      ),
      author: freeText(source.author, 1, SKILL_AUTHOR_MAX_CODE_POINTS),
      license: licenseText(source.license),
      permissions: canonicalArray(permissions, skillPermissionIdentifier),
      capabilities: canonicalArray(capabilities, skillCapabilityIdentifier),
      events: Object.freeze({
        publishes: canonicalArray(publishes, eventDeclarationIdentifier),
        consumes: canonicalArray(consumes, eventDeclarationIdentifier),
      }),
      inputs: canonicalArray(inputs, skillInterfaceFieldIdentifier),
      outputs: canonicalArray(outputs, skillInterfaceFieldIdentifier),
      failureModes: canonicalArray(failureModes, skillFailureModeIdentifier),
    });
  } catch {
    throw new InvalidSkillManifestError();
  }
}

export function createRegisteredSkill(value: unknown): RegisteredSkill {
  return createSkillManifest(value);
}

export function createSkillDiscoveryResult(
  value: unknown,
): SkillDiscoveryResult {
  try {
    const source = exactRecord(value, ["capability", "matches"]);
    const capability = skillCapabilityIdentifier(source.capability);
    const rawMatches = exactArray(source.matches, 0, Number.MAX_SAFE_INTEGER);
    const matches = rawMatches.map(createRegisteredSkill);
    if (
      matches.some((match) => !match.capabilities.includes(capability)) ||
      matches.some(
        (match, index) => index > 0 && matches[index - 1]!.id >= match.id,
      )
    )
      throw new Error();
    return Object.freeze({
      capability,
      matches: Object.freeze(matches),
    });
  } catch {
    throw new InvalidSkillStateError();
  }
}

export function extractRegisterSkillRequest(value: unknown): Readonly<{
  intent: "register-skill-manifest";
  readManifest: () => unknown;
}> {
  try {
    const descriptors = exactRecordDescriptors(value, ["intent", "manifest"]);
    const owner = value as object;
    const intent = readDescriptor(owner, descriptors.get("intent"));
    if (intent !== "register-skill-manifest") throw new Error();
    const manifestDescriptor = descriptors.get("manifest");
    let read = false;
    let captured: unknown;
    let failure: InvalidSkillManifestError | undefined;
    const readManifest = (): unknown => {
      if (!read) {
        read = true;
        try {
          captured = readDescriptor(owner, manifestDescriptor);
          if (captured === undefined) throw new Error();
        } catch {
          failure = new InvalidSkillManifestError();
        }
      }
      if (failure !== undefined) throw failure;
      return captured;
    };
    return Object.freeze({
      intent: "register-skill-manifest" as const,
      readManifest,
    });
  } catch {
    throw new InvalidSkillInputError();
  }
}

export function extractGetRegisteredSkillRequest(value: unknown): Readonly<{
  intent: "get-registered-skill";
  readSkillId: () => unknown;
}> {
  const captured = captureRequestField(
    value,
    "get-registered-skill",
    "skillId",
  );
  return Object.freeze({
    intent: "get-registered-skill" as const,
    readSkillId: captured.read,
  });
}

export function extractDiscoverSkillsRequest(value: unknown): Readonly<{
  intent: "discover-skills";
  readCapability: () => unknown;
}> {
  const captured = captureRequestField(value, "discover-skills", "capability");
  return Object.freeze({
    intent: "discover-skills" as const,
    readCapability: captured.read,
  });
}

function captureRequestField(
  value: unknown,
  intent: string,
  field: string,
): Readonly<{ read: () => unknown }> {
  try {
    const descriptors = exactRecordDescriptors(value, ["intent", field]);
    const owner = value as object;
    if (readDescriptor(owner, descriptors.get("intent")) !== intent)
      throw new Error();
    const descriptor = descriptors.get(field);
    let read = false;
    let captured: unknown;
    let failure: InvalidSkillInputError | undefined;
    return Object.freeze({
      read: () => {
        if (!read) {
          read = true;
          try {
            captured = readDescriptor(owner, descriptor);
            if (captured === undefined) throw new Error();
          } catch {
            failure = new InvalidSkillInputError();
          }
        }
        if (failure !== undefined) throw failure;
        return captured;
      },
    });
  } catch {
    throw new InvalidSkillInputError();
  }
}

function scalar(value: unknown, valid: (value: string) => boolean): string {
  if (typeof value !== "string" || !valid(value)) {
    throw new InvalidSkillManifestError();
  }
  return value;
}

function freeText(value: unknown, minimum: number, maximum: number): string {
  return scalar(value, (text) => {
    const length = [...text].length;
    return (
      length >= minimum &&
      length <= maximum &&
      !/\p{Cc}/u.test(text) &&
      /\P{White_Space}/u.test(text)
    );
  });
}

function licenseText(value: unknown): string {
  return scalar(
    value,
    (text) =>
      text.length >= 1 &&
      text.length <= SKILL_LICENSE_MAX_LENGTH &&
      /^[\x20-\x7e]+$/.test(text) &&
      /[^\x20]/.test(text),
  );
}

function validSemanticVersion(value: string): boolean {
  const match =
    /^(0|[1-9][0-9]*)\.(0|[1-9][0-9]*)\.(0|[1-9][0-9]*)(?:-([0-9A-Za-z-]+(?:\.[0-9A-Za-z-]+)*))?(?:\+([0-9A-Za-z-]+(?:\.[0-9A-Za-z-]+)*))?$/.exec(
      value,
    );
  if (match === null) return false;
  const prerelease = match[4];
  return (
    prerelease === undefined ||
    prerelease
      .split(".")
      .every((part) => !/^[0-9]+$/.test(part) || /^(0|[1-9][0-9]*)$/.test(part))
  );
}

function plainRecord(value: unknown): value is object {
  if (typeof value !== "object" || value === null || Array.isArray(value))
    return false;
  const prototype = Reflect.getPrototypeOf(value);
  return prototype === Object.prototype || prototype === null;
}

function exactRecord(
  value: unknown,
  fields: readonly string[],
): Record<string, unknown> {
  const descriptors = exactRecordDescriptors(value, fields);
  const owner = value as object;
  const result: Record<string, unknown> = {};
  for (const field of fields) {
    const captured = readDescriptor(owner, descriptors.get(field));
    if (captured === undefined) throw new Error();
    result[field] = captured;
  }
  return result;
}

function exactRecordDescriptors(
  value: unknown,
  fields: readonly string[],
): ReadonlyMap<PropertyKey, PropertyDescriptor> {
  if (!plainRecord(value)) throw new Error();
  const keys = Reflect.ownKeys(value);
  const descriptors = new Map<PropertyKey, PropertyDescriptor>();
  for (const key of keys) {
    const descriptor = Reflect.getOwnPropertyDescriptor(value, key);
    if (descriptor === undefined) throw new Error();
    descriptors.set(key, descriptor);
  }
  if (
    keys.filter((key) => typeof key === "string").length !== fields.length ||
    keys.some(
      (key) =>
        (typeof key === "string" && !fields.includes(key)) ||
        (typeof key === "symbol" && descriptors.get(key)?.enumerable === true),
    )
  )
    throw new Error();
  for (const field of fields) {
    const descriptor = descriptors.get(field);
    if (descriptor?.enumerable !== true) throw new Error();
  }
  return descriptors;
}

function readDescriptor(
  owner: object,
  descriptor: PropertyDescriptor | undefined,
): unknown {
  if (descriptor === undefined) throw new Error();
  return "value" in descriptor ? descriptor.value : descriptor.get?.call(owner);
}

function exactArray(
  value: unknown,
  minimum: number,
  maximum: number,
): unknown[] {
  if (!Array.isArray(value)) throw new Error();
  const keys = Reflect.ownKeys(value);
  const descriptors = new Map<PropertyKey, PropertyDescriptor>();
  for (const key of keys) {
    const descriptor = Reflect.getOwnPropertyDescriptor(value, key);
    if (descriptor === undefined) throw new Error();
    descriptors.set(key, descriptor);
  }
  const lengthDescriptor = descriptors.get("length");
  if (
    lengthDescriptor === undefined ||
    !("value" in lengthDescriptor) ||
    typeof lengthDescriptor.value !== "number"
  )
    throw new Error();
  const length = lengthDescriptor.value;
  if (!Number.isSafeInteger(length) || length < minimum || length > maximum)
    throw new Error();
  const accepted = new Set(["length"]);
  for (let index = 0; index < length; index += 1) accepted.add(String(index));
  if (
    keys.some(
      (key) =>
        (typeof key === "string" &&
          !accepted.has(key) &&
          descriptors.get(key)?.enumerable === true) ||
        (typeof key === "symbol" && descriptors.get(key)?.enumerable === true),
    )
  )
    throw new Error();
  const result: unknown[] = [];
  for (let index = 0; index < length; index += 1) {
    const descriptor = descriptors.get(String(index));
    if (descriptor?.enumerable !== true) throw new Error();
    result.push(
      "value" in descriptor ? descriptor.value : descriptor.get?.call(value),
    );
  }
  return result;
}

function canonicalArray<T extends string>(
  captured: readonly unknown[],
  factory: (value: unknown) => T,
): readonly T[] {
  const result = captured.map(factory);
  if (new Set(result).size !== result.length) throw new Error();
  result.sort(codePointOrder);
  return Object.freeze(result);
}

export function codePointOrder(left: string, right: string): number {
  return left < right ? -1 : left > right ? 1 : 0;
}
