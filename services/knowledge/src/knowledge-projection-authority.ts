import {
  InvalidKnowledgeProjectionVerificationRequestError,
  KnowledgeProjectionAuthorityVerificationError,
  KnowledgeProjectionIssuanceError,
  createStructuredKnowledgeProjectionCandidate,
  type KnowledgeProjectionIssuanceCorrespondence,
  type StructuredKnowledgeProjection,
  type StructuredKnowledgeProjectionCandidate,
} from "@orion/core";

interface CapturedProjection {
  readonly issuance: KnowledgeProjectionIssuanceCorrespondence;
}

export class KnowledgeProjectionAuthority {
  readonly #captured = new WeakMap<
    StructuredKnowledgeProjection,
    CapturedProjection
  >();

  public capture(
    candidate: StructuredKnowledgeProjectionCandidate,
  ): StructuredKnowledgeProjection {
    try {
      const validated = createStructuredKnowledgeProjectionCandidate(candidate);
      const issuance = Object.freeze(
        {},
      ) as KnowledgeProjectionIssuanceCorrespondence;
      const projection = Object.freeze({
        semanticValue: validated.semanticValue,
        correspondence: Object.freeze({
          ...validated.correspondence,
          issuance,
        }),
      });
      this.#captured.set(projection, Object.freeze({ issuance }));
      return projection;
    } catch {
      throw new KnowledgeProjectionIssuanceError();
    }
  }

  public verify(request: unknown): StructuredKnowledgeProjection {
    let candidate: StructuredKnowledgeProjection;
    try {
      const value = exactRecord(request, ["intent", "candidate"]);
      if (value.intent !== "verify-knowledge-projection-authority") {
        throw new Error();
      }
      candidate = value.candidate as StructuredKnowledgeProjection;
      validateProjectionShape(candidate);
    } catch {
      throw new InvalidKnowledgeProjectionVerificationRequestError();
    }

    const captured = this.#captured.get(candidate);
    if (
      captured === undefined ||
      candidate.correspondence.issuance !== captured.issuance
    ) {
      throw new KnowledgeProjectionAuthorityVerificationError();
    }
    return candidate;
  }
}

function validateProjectionShape(value: unknown): void {
  const projection = exactRecord(value, ["semanticValue", "correspondence"]);
  const correspondence = exactRecordWithOptional(
    projection.correspondence,
    [
      "candidatePreparationAssociation",
      "propositionIdentity",
      "knowledgeIdentity",
      "knowledgeVersion",
      "validationState",
      "attribution",
      "sourceOwnershipCorrespondence",
      "issuance",
    ],
    [
      "underlyingSourceAuthority",
      "knowledgeOwnedCurrentnessDetermination",
      "externalCurrentnessCorrespondence",
    ],
  );
  const candidateCorrespondence = Object.fromEntries(
    Object.entries(correspondence).filter(([field]) => field !== "issuance"),
  );
  createStructuredKnowledgeProjectionCandidate({
    semanticValue: projection.semanticValue,
    correspondence: candidateCorrespondence,
  });
}

function exactRecord(
  value: unknown,
  fields: readonly string[],
): Record<string, unknown> {
  if (
    typeof value !== "object" ||
    value === null ||
    Array.isArray(value) ||
    (Reflect.getPrototypeOf(value) !== Object.prototype &&
      Reflect.getPrototypeOf(value) !== null)
  ) {
    throw new Error();
  }
  const keys = Reflect.ownKeys(value);
  if (
    keys.length !== fields.length ||
    keys.some((key) => typeof key !== "string" || !fields.includes(key))
  ) {
    throw new Error();
  }
  for (const field of fields) {
    const descriptor = Reflect.getOwnPropertyDescriptor(value, field);
    if (
      descriptor === undefined ||
      descriptor.enumerable !== true ||
      !("value" in descriptor) ||
      descriptor.value === undefined
    ) {
      throw new Error();
    }
  }
  return value as Record<string, unknown>;
}

function exactRecordWithOptional(
  value: unknown,
  required: readonly string[],
  optional: readonly string[],
): Record<string, unknown> {
  if (
    typeof value !== "object" ||
    value === null ||
    Array.isArray(value) ||
    (Reflect.getPrototypeOf(value) !== Object.prototype &&
      Reflect.getPrototypeOf(value) !== null)
  ) {
    throw new Error();
  }
  const keys = Reflect.ownKeys(value);
  if (
    !required.every((key) => keys.includes(key)) ||
    keys.some(
      (key) =>
        typeof key !== "string" ||
        (!required.includes(key) && !optional.includes(key)),
    )
  ) {
    throw new Error();
  }
  return value as Record<string, unknown>;
}
