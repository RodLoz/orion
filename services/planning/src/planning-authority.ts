import {
  InvalidPlanningAuthorityRequestError,
  InvalidPlanningAuthorityStateError,
  PlanningAuthorityVerificationError,
  createCandidatePlan,
  createReasoningOutcome,
  type CandidatePlan,
  type ReasoningOutcome,
  type VerifyCandidatePlanAuthority,
} from "@orion/core";
import {
  captureSnapshot,
  matchesSnapshot,
  replaceSnapshotEntry,
  type AuthoritySnapshot,
} from "./planning-authority-snapshot.js";
import { bindRegisteredPlanningAuthorityFaultControl } from "./planning-authority-test-seam.js";

type Record = {
  reasoning: { deref(): ReasoningOutcome | undefined };
  snapshot: AuthoritySnapshot;
};

export class PlanningAuthority implements VerifyCandidatePlanAuthority {
  readonly #records = new WeakMap<object, Record>();

  public register(candidate: CandidatePlan, reasoning: ReasoningOutcome): void {
    try {
      if (this.#records.has(candidate)) throw new Error();
      const originalReasoning = new WeakRef(reasoning);
      const originalSnapshot = captureSnapshot(candidate);
      const record: Record = {
        reasoning: originalReasoning,
        snapshot: originalSnapshot,
      };
      this.#records.set(candidate, record);
      bindRegisteredPlanningAuthorityFaultControl(candidate, {
        corruptPrimitive: (replacement) => {
          record.snapshot = replaceSnapshotEntry(
            originalSnapshot,
            candidate,
            "category",
            replacement,
          );
        },
        corruptNestedIdentity: (replacement) => {
          record.snapshot = replaceSnapshotEntry(
            originalSnapshot,
            candidate,
            "source",
            replacement,
          );
        },
        replaceReasoning: (replacement) => {
          record.reasoning = new WeakRef(replacement);
        },
        invalidateVerifierState: () => {
          record.reasoning = {
            deref: () => {
              throw new Error();
            },
          };
        },
        restore: () => {
          record.reasoning = originalReasoning;
          record.snapshot = originalSnapshot;
        },
      });
    } catch {
      throw new InvalidPlanningAuthorityStateError();
    }
  }

  public verifyCandidatePlanAuthority(request: unknown): CandidatePlan {
    let value: globalThis.Record<string, unknown>;
    try {
      value = exactRecord(request, [
        "intent",
        "candidate",
        "consumedReasoningOutcome",
        "expectedReasoningStatus",
        "expectedReasoningCategory",
        "expectedCandidateNextAction",
        "expectedIdentityState",
        "expectedReasoningRuleCategory",
      ]);
      if (value.intent !== "verify-candidate-plan-authority") throw new Error();
      createCandidatePlan(captureValidatedGraph(value.candidate));
      createReasoningOutcome(
        captureValidatedGraph(value.consumedReasoningOutcome),
      );
      if (
        value.expectedReasoningStatus !== "completed" ||
        !["anonymous-context", "context-only"].includes(
          value.expectedReasoningCategory as string,
        ) ||
        !["none", "request-more-context"].includes(
          value.expectedCandidateNextAction as string,
        ) ||
        !["anonymous", "authenticated"].includes(
          value.expectedIdentityState as string,
        ) ||
        !["anonymous-identity", "authenticated-context-only"].includes(
          value.expectedReasoningRuleCategory as string,
        )
      )
        throw new Error();
    } catch {
      throw new InvalidPlanningAuthorityRequestError();
    }
    try {
      const candidate = value.candidate as CandidatePlan;
      const record = this.#records.get(candidate);
      const source = candidate.source;
      const explainability = candidate.explainability;
      if (
        record === undefined ||
        record.reasoning.deref() !== value.consumedReasoningOutcome ||
        source.reasoningStatus !== value.expectedReasoningStatus ||
        source.reasoningCategory !== value.expectedReasoningCategory ||
        source.candidateNextAction !== value.expectedCandidateNextAction ||
        source.identityState !== value.expectedIdentityState ||
        source.reasoningRuleCategory !== value.expectedReasoningRuleCategory ||
        explainability.consumedReasoningCategory !==
          value.expectedReasoningCategory ||
        explainability.consumedCandidateNextAction !==
          value.expectedCandidateNextAction ||
        !matchesSnapshot(record.snapshot)
      )
        throw new PlanningAuthorityVerificationError();
      return candidate;
    } catch (error) {
      if (error instanceof PlanningAuthorityVerificationError) throw error;
      throw new InvalidPlanningAuthorityStateError();
    }
  }
}

function exactRecord(
  value: unknown,
  fields: readonly string[],
): globalThis.Record<string, unknown> {
  if (typeof value !== "object" || value === null || Array.isArray(value))
    throw new Error();
  const prototype = Reflect.getPrototypeOf(value);
  if (prototype !== Object.prototype && prototype !== null) throw new Error();
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

function captureValidatedGraph(value: unknown): unknown {
  if (typeof value !== "object" || value === null) return value;
  if (Array.isArray(value)) {
    const length = validateExactArray(value);
    return Array.from({ length }, (_, index) =>
      captureValidatedGraph(
        (
          Reflect.getOwnPropertyDescriptor(value, String(index)) as {
            value: unknown;
          }
        ).value,
      ),
    );
  }
  const keys = Reflect.ownKeys(value);
  const fields = keys.map((key) => {
    if (typeof key !== "string") throw new Error();
    return key;
  });
  const record = exactRecord(value, fields);
  return Object.fromEntries(
    fields.map((key) => [key, captureValidatedGraph(record[key])]),
  );
}

function validateExactArray(value: unknown[]): number {
  if (Reflect.getPrototypeOf(value) !== Array.prototype) throw new Error();
  const lengthDescriptor = Reflect.getOwnPropertyDescriptor(value, "length");
  if (
    lengthDescriptor === undefined ||
    !("value" in lengthDescriptor) ||
    !Number.isSafeInteger(lengthDescriptor.value) ||
    lengthDescriptor.value < 0 ||
    lengthDescriptor.enumerable ||
    lengthDescriptor.configurable
  )
    throw new Error();
  const length = lengthDescriptor.value as number;
  const keys = Reflect.ownKeys(value);
  if (
    keys.length !== length + 1 ||
    !keys.includes("length") ||
    Array.from({ length }, (_, index) => String(index)).some(
      (key) => !keys.includes(key),
    )
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
  return length;
}
