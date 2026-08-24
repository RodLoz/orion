import type {
  ContextCreatedAt,
  ContextLineageIdentity,
  ContextRevision,
  ContextRevisionIdentity,
  ContextRevisionNumber,
  IdentityContextFragment,
  IdentityContextRevision,
  KnowledgeAwareContextRevision,
  KnowledgeContextFragment,
  MemoryAwareContextRevision,
  MemoryContextFragment,
  StructuredKnowledgeAwareContextRevision,
  StructuredKnowledgeContextFragment,
} from "@orion/core";

import { ContextRevisionLifecycle } from "./context-revision-lifecycle.js";

const LIFECYCLES = new WeakMap<ContextRevision, ContextRevisionLifecycle>();

interface RuntimeContextRevisionInputBase {
  readonly lineageIdentity: ContextLineageIdentity;
  readonly revisionIdentity: ContextRevisionIdentity;
  readonly revisionNumber: ContextRevisionNumber;
  readonly parentRevisionIdentity?: ContextRevisionIdentity;
  readonly createdAt: ContextCreatedAt;
}

export type RuntimeContextRevisionInput = RuntimeContextRevisionInputBase &
  (
    | Readonly<{ fragments: readonly [IdentityContextFragment] }>
    | Readonly<{
        fragments: readonly [IdentityContextFragment, KnowledgeContextFragment];
      }>
    | Readonly<{
        fragments: readonly [IdentityContextFragment, MemoryContextFragment];
      }>
    | Readonly<{
        fragments: readonly [
          IdentityContextFragment,
          StructuredKnowledgeContextFragment,
        ];
      }>
  );

export function createActiveRuntimeContextRevision(
  input: RuntimeContextRevisionInput,
): ContextRevision {
  const lifecycle = new ContextRevisionLifecycle();
  lifecycle.transition("composing");
  lifecycle.transition("validating");
  lifecycle.transition("active");

  const base = {
    lineageIdentity: input.lineageIdentity,
    revisionIdentity: input.revisionIdentity,
    revisionNumber: input.revisionNumber,
    ...(input.parentRevisionIdentity === undefined
      ? {}
      : { parentRevisionIdentity: input.parentRevisionIdentity }),
    lifecycleState: "active" as const,
  };
  let revision: ContextRevision;
  if (input.fragments.length === 1) {
    const fragments = Object.freeze([input.fragments[0]]) as readonly [
      IdentityContextFragment,
    ];
    revision = Object.freeze({
      ...base,
      creationMetadata: Object.freeze({
        createdAt: input.createdAt,
        sourceCount: 1 as const,
        fragmentCount: 1 as const,
      }),
      fragments,
    }) as IdentityContextRevision;
  } else if (input.fragments[1].kind === "knowledge") {
    const fragments = Object.freeze([
      input.fragments[0],
      input.fragments[1],
    ]) as readonly [IdentityContextFragment, KnowledgeContextFragment];
    revision = Object.freeze({
      ...base,
      creationMetadata: Object.freeze({
        createdAt: input.createdAt,
        sourceCount: 2 as const,
        fragmentCount: 2 as const,
      }),
      fragments,
    }) as KnowledgeAwareContextRevision;
  } else if (input.fragments[1].kind === "structured-knowledge") {
    const fragments = Object.freeze([
      input.fragments[0],
      input.fragments[1],
    ]) as readonly [
      IdentityContextFragment,
      StructuredKnowledgeContextFragment,
    ];
    revision = Object.freeze({
      ...base,
      creationMetadata: Object.freeze({
        createdAt: input.createdAt,
        sourceCount: 2 as const,
        fragmentCount: 2 as const,
      }),
      fragments,
    }) as StructuredKnowledgeAwareContextRevision;
  } else {
    const fragments = Object.freeze([
      input.fragments[0],
      input.fragments[1],
    ]) as readonly [IdentityContextFragment, MemoryContextFragment];
    revision = Object.freeze({
      ...base,
      creationMetadata: Object.freeze({
        createdAt: input.createdAt,
        sourceCount: 2 as const,
        fragmentCount: 2 as const,
      }),
      fragments,
    }) as MemoryAwareContextRevision;
  }

  LIFECYCLES.set(revision, lifecycle);
  return revision;
}

export function expireRuntimeContextRevision(revision: ContextRevision): void {
  const lifecycle = LIFECYCLES.get(revision);
  if (lifecycle === undefined) {
    throw new Error("Context Revision lifecycle is unavailable.");
  }
  lifecycle.transition("expired");
}
