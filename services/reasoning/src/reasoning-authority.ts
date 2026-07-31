import {
  InvalidReasoningAuthorityRequestError,
  InvalidReasoningAuthorityStateError,
  ReasoningAuthorityVerificationError,
  contextCreatedAt,
  contextLineageIdentity,
  contextRevisionIdentity,
  contextRevisionNumber,
  createReasoningOutcome,
  identityIdentifier,
  type ActiveContextRevision,
  type ReasoningOutcome,
  type VerifyReasoningOutcomeAuthority,
} from "@orion/core";
import {
  captureSnapshot,
  matchesSnapshot,
  replaceSnapshotEntry,
  type AuthoritySnapshot,
} from "./reasoning-authority-snapshot.js";
import { bindRegisteredReasoningAuthorityFaultControl } from "./reasoning-authority-test-seam.js";

type Record = {
  context: { deref(): ActiveContextRevision | undefined };
  lineageIdentity: string;
  revisionIdentity: string;
  revisionNumber: number;
  snapshot: AuthoritySnapshot;
};

export class ReasoningAuthority implements VerifyReasoningOutcomeAuthority {
  readonly #records = new WeakMap<object, Record>();

  public register(
    candidate: ReasoningOutcome,
    context: ActiveContextRevision,
  ): void {
    try {
      if (this.#records.has(candidate)) throw new Error();
      const reference = candidate.explainability.contextConsumptionReference;
      const originalContext = new WeakRef(context);
      const originalSnapshot = captureSnapshot(candidate);
      const record: Record = {
        context: originalContext,
        lineageIdentity: reference.lineageIdentity,
        revisionIdentity: reference.revisionIdentity,
        revisionNumber: reference.revisionNumber,
        snapshot: originalSnapshot,
      };
      this.#records.set(candidate, record);
      bindRegisteredReasoningAuthorityFaultControl(candidate, {
        corruptPrimitive: (replacement) => {
          record.snapshot = replaceSnapshotEntry(
            originalSnapshot,
            candidate,
            "response",
            replacement,
          );
        },
        corruptNestedIdentity: (replacement) => {
          record.snapshot = replaceSnapshotEntry(
            originalSnapshot,
            candidate,
            "explainability",
            replacement,
          );
        },
        replaceContext: (replacement) => {
          record.context = new WeakRef(replacement);
        },
        invalidateVerifierState: () => {
          record.context = {
            deref: () => {
              throw new Error();
            },
          };
        },
        restore: () => {
          record.context = originalContext;
          record.snapshot = originalSnapshot;
        },
      });
    } catch {
      throw new InvalidReasoningAuthorityStateError();
    }
  }

  public verifyReasoningOutcomeAuthority(request: unknown): ReasoningOutcome {
    let value: globalThis.Record<string, unknown>;
    try {
      value = exactRecord(request, [
        "intent",
        "candidate",
        "consumedContextRevision",
        "expectedLineageIdentity",
        "expectedRevisionIdentity",
        "expectedRevisionNumber",
      ]);
      if (value.intent !== "verify-reasoning-outcome-authority")
        throw new Error();
      createReasoningOutcome(strictClone(value.candidate));
      validateConsumedContext(value.consumedContextRevision);
      contextLineageIdentity(value.expectedLineageIdentity);
      contextRevisionIdentity(value.expectedRevisionIdentity);
      contextRevisionNumber(value.expectedRevisionNumber);
    } catch {
      throw new InvalidReasoningAuthorityRequestError();
    }
    try {
      const candidate = value.candidate as ReasoningOutcome;
      const record = this.#records.get(candidate);
      if (
        record === undefined ||
        record.context.deref() !== value.consumedContextRevision ||
        record.lineageIdentity !== value.expectedLineageIdentity ||
        record.revisionIdentity !== value.expectedRevisionIdentity ||
        record.revisionNumber !== value.expectedRevisionNumber ||
        !matchesSnapshot(record.snapshot)
      )
        throw new ReasoningAuthorityVerificationError();
      return candidate;
    } catch (error) {
      if (error instanceof ReasoningAuthorityVerificationError) throw error;
      throw new InvalidReasoningAuthorityStateError();
    }
  }
}

function exactRecord(
  value: unknown,
  fields: readonly string[],
): globalThis.Record<string, unknown> {
  if (typeof value !== "object" || value === null || Array.isArray(value))
    throw new Error();
  if (
    Reflect.getPrototypeOf(value) !== Object.prototype &&
    Reflect.getPrototypeOf(value) !== null
  )
    throw new Error();
  const keys = Reflect.ownKeys(value);
  if (
    keys.length !== fields.length ||
    keys.some((key) => typeof key !== "string" || !fields.includes(key))
  )
    throw new Error();
  for (const field of fields) {
    const descriptor = Reflect.getOwnPropertyDescriptor(value, field);
    if (
      descriptor === undefined ||
      descriptor.enumerable !== true ||
      !("value" in descriptor) ||
      descriptor.value === undefined
    )
      throw new Error();
  }
  return value as globalThis.Record<string, unknown>;
}

function validateConsumedContext(value: unknown): void {
  const clone = strictClone(value) as globalThis.Record<string, unknown>;
  const revision = exactRecordWithOptional(
    clone,
    [
      "lineageIdentity",
      "revisionIdentity",
      "revisionNumber",
      "creationMetadata",
      "lifecycleState",
      "fragments",
    ],
    ["parentRevisionIdentity"],
  );
  contextLineageIdentity(revision.lineageIdentity);
  contextRevisionIdentity(revision.revisionIdentity);
  const number = contextRevisionNumber(revision.revisionNumber);
  if (revision.lifecycleState !== "active") throw new Error();
  const hasParent = Object.hasOwn(revision, "parentRevisionIdentity");
  if ((number === 1) === hasParent) throw new Error();
  if (hasParent) contextRevisionIdentity(revision.parentRevisionIdentity);
  const metadata = exactRecord(revision.creationMetadata, [
    "createdAt",
    "sourceCount",
    "fragmentCount",
  ]);
  if (
    contextCreatedAt(metadata.createdAt) !== metadata.createdAt ||
    metadata.sourceCount !== 1 ||
    metadata.fragmentCount !== 1
  )
    throw new Error();
  const fragments = exactArray(revision.fragments, 1);
  const fragment = exactRecord(fragments[0], [
    "kind",
    "authoritativeOwner",
    "projection",
  ]);
  if (
    fragment.kind !== "identity" ||
    fragment.authoritativeOwner !== "identity"
  )
    throw new Error();
  const projection = exactRecordWithOptional(
    fragment.projection,
    ["state", "authoritativeOwner"],
    ["identityIdentifier"],
  );
  if (
    projection.authoritativeOwner !== "identity" ||
    (projection.state !== "anonymous" &&
      projection.state !== "authenticated") ||
    (projection.state === "anonymous" &&
      Object.hasOwn(projection, "identityIdentifier")) ||
    (projection.state === "authenticated" &&
      identityIdentifier(projection.identityIdentifier) !==
        projection.identityIdentifier)
  )
    throw new Error();
}

function exactRecordWithOptional(
  value: unknown,
  required: readonly string[],
  optional: readonly string[],
): globalThis.Record<string, unknown> {
  if (typeof value !== "object" || value === null || Array.isArray(value))
    throw new Error();
  const keys = Reflect.ownKeys(value);
  if (
    !required.every((key) => keys.includes(key)) ||
    keys.some(
      (key) =>
        typeof key !== "string" ||
        (!required.includes(key) && !optional.includes(key)),
    )
  )
    throw new Error();
  return value as globalThis.Record<string, unknown>;
}

function strictClone(value: unknown): unknown {
  if (typeof value !== "object" || value === null) return value;
  if (Array.isArray(value)) {
    if (Reflect.getPrototypeOf(value) !== Array.prototype) throw new Error();
    const values = exactArray(value, value.length);
    return values.map(strictClone);
  }
  const record = exactRecord(
    value,
    Reflect.ownKeys(value).map((key) => {
      if (typeof key !== "string") throw new Error();
      return key;
    }),
  );
  return Object.fromEntries(
    Object.entries(record).map(([key, nested]) => [key, strictClone(nested)]),
  );
}

function exactArray(value: unknown, length: number): readonly unknown[] {
  if (
    !Array.isArray(value) ||
    Reflect.getPrototypeOf(value) !== Array.prototype
  )
    throw new Error();
  const keys = Reflect.ownKeys(value);
  if (
    keys.length !== length + 1 ||
    !keys.includes("length") ||
    Array.from({ length }, (_, index) => String(index)).some(
      (key) => !keys.includes(key),
    )
  )
    throw new Error();
  const lengthDescriptor = Reflect.getOwnPropertyDescriptor(value, "length");
  if (
    lengthDescriptor === undefined ||
    !("value" in lengthDescriptor) ||
    lengthDescriptor.value !== length ||
    lengthDescriptor.enumerable ||
    lengthDescriptor.configurable
  )
    throw new Error();
  for (let index = 0; index < length; index += 1) {
    const descriptor = Reflect.getOwnPropertyDescriptor(value, String(index));
    if (
      descriptor === undefined ||
      descriptor.enumerable !== true ||
      !("value" in descriptor) ||
      descriptor.value === undefined
    )
      throw new Error();
  }
  return value;
}
