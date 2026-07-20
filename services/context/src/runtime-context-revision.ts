import type {
  ContextCreatedAt,
  ContextLineageIdentity,
  ContextRevision,
  ContextRevisionIdentity,
  ContextRevisionNumber,
  IdentityContextFragment,
} from "@orion/core";

import { ContextRevisionLifecycle } from "./context-revision-lifecycle.js";

const LIFECYCLES = new WeakMap<ContextRevision, ContextRevisionLifecycle>();

export interface RuntimeContextRevisionInput {
  readonly lineageIdentity: ContextLineageIdentity;
  readonly revisionIdentity: ContextRevisionIdentity;
  readonly revisionNumber: ContextRevisionNumber;
  readonly parentRevisionIdentity?: ContextRevisionIdentity;
  readonly createdAt: ContextCreatedAt;
  readonly fragment: IdentityContextFragment;
}

export function createActiveRuntimeContextRevision(
  input: RuntimeContextRevisionInput,
): ContextRevision {
  const lifecycle = new ContextRevisionLifecycle();
  lifecycle.transition("composing");
  lifecycle.transition("validating");
  lifecycle.transition("active");

  const creationMetadata = Object.freeze({
    createdAt: input.createdAt,
    sourceCount: 1 as const,
    fragmentCount: 1 as const,
  });
  const fragments = Object.freeze([input.fragment]) as readonly [
    IdentityContextFragment,
  ];

  const revision: ContextRevision = Object.freeze({
    lineageIdentity: input.lineageIdentity,
    revisionIdentity: input.revisionIdentity,
    revisionNumber: input.revisionNumber,
    ...(input.parentRevisionIdentity === undefined
      ? {}
      : { parentRevisionIdentity: input.parentRevisionIdentity }),
    creationMetadata,
    get lifecycleState() {
      return lifecycle.state;
    },
    fragments,
  });

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
