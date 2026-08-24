import {
  ContextAuthorityVerificationError,
  InvalidContextAuthorityRequestError,
  InvalidContextAuthorityStateError,
  contextCreatedAt,
  contextLifecycleState,
  contextLineageIdentity,
  contextRevisionIdentity,
  contextRevisionNumber,
  identityIdentifier,
  knowledgeIdentity,
  knowledgeVersion,
  memoryIdentity,
  createStructuredKnowledgeContextFragment,
  type ActiveContextRevision,
  type VerifyActiveContextRevisionAuthority,
  type StructuredKnowledgeContextFragment,
} from "@orion/core";
import {
  captureSnapshot,
  matchesSnapshot,
  replaceSnapshotEntry,
  type AuthoritySnapshot,
} from "./context-authority-snapshot.js";
import { bindRegisteredContextAuthorityFaultControl } from "./context-authority-test-seam.js";

type ContextAuthorityRecord = {
  readonly lineageIdentity: string;
  readonly revisionIdentity: string;
  readonly revisionNumber: number;
  snapshot: AuthoritySnapshot;
  isActive: () => boolean;
};

export class ContextAuthority implements VerifyActiveContextRevisionAuthority {
  readonly #records = new WeakMap<object, ContextAuthorityRecord>();

  public register(
    candidate: ActiveContextRevision,
    isActive: () => boolean,
  ): void {
    try {
      const existing = this.#records.get(candidate);
      if (existing !== undefined) {
        if (!matchesSnapshot(existing.snapshot) || !existing.isActive())
          throw new Error();
        return;
      }
      const originalSnapshot = captureSnapshot(candidate);
      const originalIsActive = isActive;
      const record: ContextAuthorityRecord = {
        lineageIdentity: candidate.lineageIdentity,
        revisionIdentity: candidate.revisionIdentity,
        revisionNumber: candidate.revisionNumber,
        snapshot: originalSnapshot,
        isActive,
      };
      if (candidate.lifecycleState !== "active") throw new Error();
      this.#records.set(candidate, record);
      bindRegisteredContextAuthorityFaultControl(candidate, {
        corruptPrimitive: (replacement) => {
          record.snapshot = replaceSnapshotEntry(
            originalSnapshot,
            candidate,
            "revisionNumber",
            replacement,
          );
        },
        corruptNestedIdentity: (replacement) => {
          record.snapshot = replaceSnapshotEntry(
            originalSnapshot,
            candidate.fragments[0],
            "projection",
            replacement,
          );
        },
        invalidateVerifierState: () => {
          record.isActive = () => {
            throw new Error();
          };
        },
        restore: () => {
          record.isActive = originalIsActive;
          record.snapshot = originalSnapshot;
        },
      });
    } catch {
      throw new InvalidContextAuthorityStateError();
    }
  }

  public verifyActiveContextRevisionAuthority(
    request: unknown,
  ): ActiveContextRevision {
    let captured: {
      candidate: ActiveContextRevision;
      expectedLineageIdentity: string;
      expectedRevisionIdentity: string;
      expectedRevisionNumber: number;
    };
    try {
      const value = exactRecord(request, [
        "intent",
        "candidate",
        "expectedLineageIdentity",
        "expectedRevisionIdentity",
        "expectedRevisionNumber",
      ]);
      if (value.intent !== "verify-active-context-revision-authority")
        throw new Error();
      assertContextStructure(value.candidate);
      captured = {
        candidate: value.candidate as ActiveContextRevision,
        expectedLineageIdentity: contextLineageIdentity(
          value.expectedLineageIdentity,
        ),
        expectedRevisionIdentity: contextRevisionIdentity(
          value.expectedRevisionIdentity,
        ),
        expectedRevisionNumber: contextRevisionNumber(
          value.expectedRevisionNumber,
        ),
      };
    } catch {
      throw new InvalidContextAuthorityRequestError();
    }

    try {
      const record = this.#records.get(captured.candidate);
      if (
        record === undefined ||
        record.lineageIdentity !== captured.expectedLineageIdentity ||
        record.revisionIdentity !== captured.expectedRevisionIdentity ||
        record.revisionNumber !== captured.expectedRevisionNumber ||
        captured.candidate.lifecycleState !== "active" ||
        !record.isActive() ||
        !matchesSnapshot(record.snapshot)
      )
        throw new ContextAuthorityVerificationError();
      return captured.candidate;
    } catch (error) {
      if (error instanceof ContextAuthorityVerificationError) throw error;
      throw new InvalidContextAuthorityStateError();
    }
  }
}

function assertContextStructure(value: unknown): void {
  const revision = exactRecord(
    value,
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
  const hasParent = Object.hasOwn(revision, "parentRevisionIdentity");
  if ((number === 1) === hasParent) throw new Error();
  if (hasParent) contextRevisionIdentity(revision.parentRevisionIdentity);
  contextLifecycleState(revision.lifecycleState);
  if (revision.lifecycleState !== "active") throw new Error();
  const metadata = exactRecord(revision.creationMetadata, [
    "createdAt",
    "sourceCount",
    "fragmentCount",
  ]);
  if (contextCreatedAt(metadata.createdAt) !== metadata.createdAt)
    throw new Error();
  const isIdentityOnly =
    metadata.sourceCount === 1 && metadata.fragmentCount === 1;
  const isKnowledgeAware =
    metadata.sourceCount === 2 && metadata.fragmentCount === 2;
  if (!isIdentityOnly && !isKnowledgeAware) throw new Error();
  const fragments = exactArray(revision.fragments, isIdentityOnly ? 1 : 2);
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
  const projection = exactRecord(
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
  if (isKnowledgeAware) {
    const sourceFragment = exactRecord(fragments[1], [
      "kind",
      "authoritativeOwner",
      "projection",
    ]);
    if (
      sourceFragment.kind === "memory" &&
      sourceFragment.authoritativeOwner === "memory"
    ) {
      const memoryProjection = exactRecord(sourceFragment.projection, [
        "memoryIdentity",
        "kind",
        "lifecycleState",
        "authoritativeOwner",
      ]);
      if (
        memoryIdentity(memoryProjection.memoryIdentity) !==
          memoryProjection.memoryIdentity ||
        memoryProjection.kind !== "episodic" ||
        memoryProjection.lifecycleState !== "stored" ||
        memoryProjection.authoritativeOwner !== "memory"
      )
        throw new Error();
      return;
    }
    if (
      sourceFragment.kind !== "knowledge" ||
      sourceFragment.authoritativeOwner !== "knowledge"
    ) {
      if (
        sourceFragment.kind !== "structured-knowledge" ||
        sourceFragment.authoritativeOwner !== "knowledge"
      )
        throw new Error();
      createStructuredKnowledgeContextFragment({
        kind: sourceFragment.kind,
        authoritativeOwner: sourceFragment.authoritativeOwner,
        ...(sourceFragment.projection as Record<string, unknown>),
      } as unknown as StructuredKnowledgeContextFragment);
      return;
    }
    const knowledgeProjection = exactRecord(sourceFragment.projection, [
      "knowledgeIdentity",
      "validationState",
      "version",
      "currency",
      "authoritativeOwner",
    ]);
    if (
      knowledgeIdentity(knowledgeProjection.knowledgeIdentity) !==
        knowledgeProjection.knowledgeIdentity ||
      knowledgeProjection.validationState !== "accepted" ||
      knowledgeVersion(knowledgeProjection.version) !==
        knowledgeProjection.version ||
      (knowledgeProjection.currency !== "current" &&
        knowledgeProjection.currency !== "superseded") ||
      knowledgeProjection.authoritativeOwner !== "knowledge"
    )
      throw new Error();
  }
}

function exactRecord(
  value: unknown,
  required: readonly string[],
  optional: readonly string[] = [],
): Record<string, unknown> {
  const record = exactOrdinaryObject(value);
  const keys = Reflect.ownKeys(record);
  if (
    !required.every((key) => keys.includes(key)) ||
    keys.some(
      (key) =>
        typeof key !== "string" ||
        (!required.includes(key) && !optional.includes(key)),
    )
  )
    throw new Error();
  for (const key of keys) {
    const descriptor = Reflect.getOwnPropertyDescriptor(record, key);
    if (
      descriptor === undefined ||
      descriptor.enumerable !== true ||
      !("value" in descriptor) ||
      descriptor.value === undefined
    )
      throw new Error();
  }
  return record as Record<string, unknown>;
}

function exactOrdinaryObject(value: unknown): object {
  if (typeof value !== "object" || value === null) throw new Error();
  const prototype = Reflect.getPrototypeOf(value);
  if (
    Array.isArray(value)
      ? prototype !== Array.prototype
      : prototype !== Object.prototype && prototype !== null
  )
    throw new Error();
  return value;
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
