export type AuthoritySnapshot = Readonly<{
  readonly object: object;
  readonly prototype: object | null;
  readonly entries: readonly Readonly<{
    readonly key: string;
    readonly value: unknown;
  }>[];
  readonly nested: readonly AuthoritySnapshot[];
}>;

export function captureSnapshot(value: object): AuthoritySnapshot {
  const prototype = Reflect.getPrototypeOf(value);
  if (
    Array.isArray(value)
      ? prototype !== Array.prototype
      : prototype !== Object.prototype && prototype !== null
  )
    throw new Error();
  const entries: { key: string; value: unknown }[] = [];
  const nested: AuthoritySnapshot[] = [];
  for (const key of Reflect.ownKeys(value)) {
    if (typeof key !== "string") throw new Error();
    const descriptor = Reflect.getOwnPropertyDescriptor(value, key);
    if (descriptor === undefined) throw new Error();
    if (Array.isArray(value) && key === "length") continue;
    if (descriptor.enumerable !== true) throw new Error();
    const nestedValue = Reflect.get(value, key) as unknown;
    entries.push({ key, value: nestedValue });
    if (typeof nestedValue === "object" && nestedValue !== null)
      nested.push(captureSnapshot(nestedValue));
  }
  return Object.freeze({
    object: value,
    prototype,
    entries: Object.freeze(entries.map((entry) => Object.freeze(entry))),
    nested: Object.freeze(nested),
  });
}

export function matchesSnapshot(snapshot: AuthoritySnapshot): boolean {
  try {
    if (
      Reflect.getPrototypeOf(snapshot.object) !== snapshot.prototype ||
      Reflect.ownKeys(snapshot.object).length !==
        snapshot.entries.length + (Array.isArray(snapshot.object) ? 1 : 0)
    )
      return false;
    for (const entry of snapshot.entries) {
      const descriptor = Reflect.getOwnPropertyDescriptor(
        snapshot.object,
        entry.key,
      );
      if (
        descriptor === undefined ||
        descriptor.enumerable !== true ||
        Reflect.get(snapshot.object, entry.key) !== entry.value
      )
        return false;
    }
    return snapshot.nested.every(matchesSnapshot);
  } catch {
    return false;
  }
}

export function replaceSnapshotEntry(
  snapshot: AuthoritySnapshot,
  target: object,
  key: string,
  replacement: unknown,
): AuthoritySnapshot {
  let replaced = false;
  const replace = (current: AuthoritySnapshot): AuthoritySnapshot => {
    const entries = current.entries.map((entry) => {
      if (current.object !== target || entry.key !== key) return entry;
      replaced = true;
      return Object.freeze({ key: entry.key, value: replacement });
    });
    const nested = current.nested.map(replace);
    return Object.freeze({
      object: current.object,
      prototype: current.prototype,
      entries: Object.freeze(entries),
      nested: Object.freeze(nested),
    });
  };
  const result = replace(snapshot);
  if (!replaced) throw new Error();
  return result;
}
