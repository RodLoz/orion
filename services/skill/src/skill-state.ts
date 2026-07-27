import {
  InvalidSkillStateError,
  createRegisteredSkill,
  type RegisteredSkill,
  type SkillIdentifier,
} from "@orion/core";

export type SkillCatalog = ReadonlyMap<SkillIdentifier, RegisteredSkill>;

export function validateExistingCatalog(catalog: SkillCatalog): void {
  try {
    for (const [key, value] of catalog) {
      if (!canonicalRegisteredSkillGraph(value)) throw new Error();
      const reconstructed = createRegisteredSkill(value);
      if (
        key !== reconstructed.id ||
        !canonicalDataGraphEquals(value, reconstructed)
      )
        throw new Error();
    }
  } catch {
    throw new InvalidSkillStateError();
  }
}

const manifestFields = [
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
] as const;
const eventFields = ["publishes", "consumes"] as const;
const collectionFields = [
  "permissions",
  "capabilities",
  "inputs",
  "outputs",
  "failureModes",
] as const;

function canonicalRegisteredSkillGraph(value: unknown): boolean {
  if (!canonicalObject(value, manifestFields)) return false;
  const manifest = value as Record<string, unknown>;
  if (!canonicalObject(manifest.events, eventFields)) return false;
  const events = manifest.events as Record<string, unknown>;
  for (const field of collectionFields) {
    if (!canonicalArray(manifest[field])) return false;
  }
  if (!canonicalArray(events.publishes) || !canonicalArray(events.consumes))
    return false;
  return true;
}

function canonicalObject(
  value: unknown,
  fields: readonly string[],
): value is object {
  if (
    typeof value !== "object" ||
    value === null ||
    Array.isArray(value) ||
    Reflect.getPrototypeOf(value) !== Object.prototype ||
    !Object.isFrozen(value)
  )
    return false;
  const keys = Reflect.ownKeys(value);
  if (
    keys.length !== fields.length ||
    keys.some((key) => typeof key !== "string" || !fields.includes(key))
  )
    return false;
  return fields.every((field) => {
    const descriptor = Reflect.getOwnPropertyDescriptor(value, field);
    return (
      descriptor !== undefined &&
      "value" in descriptor &&
      descriptor.enumerable === true &&
      descriptor.writable === false &&
      descriptor.configurable === false
    );
  });
}

function canonicalArray(value: unknown): value is readonly unknown[] {
  if (
    !Array.isArray(value) ||
    Reflect.getPrototypeOf(value) !== Array.prototype ||
    !Object.isFrozen(value)
  )
    return false;
  const keys = Reflect.ownKeys(value);
  const lengthDescriptor = Reflect.getOwnPropertyDescriptor(value, "length");
  if (
    lengthDescriptor === undefined ||
    !("value" in lengthDescriptor) ||
    lengthDescriptor.enumerable !== false ||
    lengthDescriptor.writable !== false ||
    lengthDescriptor.configurable !== false
  )
    return false;
  const length = lengthDescriptor.value;
  if (!Number.isSafeInteger(length) || keys.length !== length + 1) return false;
  for (let index = 0; index < length; index += 1) {
    const descriptor = Reflect.getOwnPropertyDescriptor(value, String(index));
    if (
      descriptor === undefined ||
      !("value" in descriptor) ||
      descriptor.enumerable !== true ||
      descriptor.writable !== false ||
      descriptor.configurable !== false
    )
      return false;
  }
  return keys.every(
    (key) =>
      key === "length" ||
      (typeof key === "string" &&
        Number.isSafeInteger(Number(key)) &&
        String(Number(key)) === key &&
        Number(key) >= 0 &&
        Number(key) < length),
  );
}

function canonicalDataGraphEquals(left: unknown, right: unknown): boolean {
  if (
    typeof left !== "object" ||
    left === null ||
    typeof right !== "object" ||
    right === null
  )
    return Object.is(left, right);
  const leftKeys = Reflect.ownKeys(left);
  const rightKeys = Reflect.ownKeys(right);
  if (
    leftKeys.length !== rightKeys.length ||
    leftKeys.some((key, index) => key !== rightKeys[index])
  )
    return false;
  return leftKeys.every((key) => {
    const leftDescriptor = Reflect.getOwnPropertyDescriptor(left, key);
    const rightDescriptor = Reflect.getOwnPropertyDescriptor(right, key);
    return (
      leftDescriptor !== undefined &&
      rightDescriptor !== undefined &&
      "value" in leftDescriptor &&
      "value" in rightDescriptor &&
      leftDescriptor.enumerable === rightDescriptor.enumerable &&
      leftDescriptor.writable === rightDescriptor.writable &&
      leftDescriptor.configurable === rightDescriptor.configurable &&
      canonicalDataGraphEquals(leftDescriptor.value, rightDescriptor.value)
    );
  });
}

export function validateResultingCatalog(catalog: SkillCatalog): void {
  validateExistingCatalog(catalog);
}
