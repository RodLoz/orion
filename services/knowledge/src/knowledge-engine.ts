import {
  ContradictionRequiresResolutionError,
  DuplicateKnowledgeIdentityError,
  InvalidAcceptanceEvidenceError,
  InvalidClaimError,
  InvalidKnowledgeIdentityError,
  InvalidKnowledgeInputError,
  InvalidKnowledgeStateError,
  InvalidSupersessionError,
  KNOWLEDGE_VERSION_MAX,
  KnowledgeNotFoundError,
  KnowledgeStoreUnavailableError,
  candidateClaim,
  createAcceptedKnowledgeDecision,
  createKnowledgeAcceptanceEvidence,
  createKnowledgeProvenance,
  createKnowledgeRecord,
  createKnowledgeReference,
  createRejectedKnowledgeDecision,
  knowledgeContradictionReason,
  knowledgeIdentity,
  knowledgeTimestamp,
  knowledgeVersion,
  type EvaluateKnowledgeClaim,
  type GetKnowledge,
  type KnowledgeAcceptanceDecision,
  type KnowledgeAcceptanceEvidence,
  type KnowledgeConstructionValues,
  type KnowledgeIdentity,
  type KnowledgeProvenance,
  type KnowledgeRecord,
  type KnowledgeReference,
  type KnowledgeStore,
  type KnowledgeVersion,
  type ListKnowledgeReferences,
  type RetrievedKnowledge,
} from "@orion/core";

interface ValidatedEvaluation {
  readonly claim: ReturnType<typeof candidateClaim>;
  readonly evidence: KnowledgeAcceptanceEvidence;
  readonly provenance: KnowledgeProvenance;
  readonly contradiction?: Readonly<{
    target: KnowledgeIdentity;
    decision: "reject-candidate" | "supersede-existing";
    reason: ReturnType<typeof knowledgeContradictionReason>;
  }>;
}

interface ConfirmedMetadata {
  readonly version: KnowledgeVersion;
}

/** @internal Test-only state fixture; not exported from the package entry point. */
export const knowledgeEngineTestState = Symbol("knowledgeEngineTestState");

export class KnowledgeEngine
  implements EvaluateKnowledgeClaim, GetKnowledge, ListKnowledgeReferences
{
  #engineState: KnowledgeEngineLifecycleState = "initialize";
  readonly #confirmed = new Map<KnowledgeIdentity, ConfirmedMetadata>();
  readonly #current = new Set<KnowledgeIdentity>();
  readonly #acceptanceOrder: KnowledgeIdentity[] = [];

  public constructor(
    private readonly store: KnowledgeStore,
    private readonly construction: KnowledgeConstructionValues,
  ) {}

  public get engineState(): KnowledgeEngineLifecycleState {
    return this.#engineState;
  }

  public initialize(): void {
    if (this.#engineState !== "initialize") {
      throw new KnowledgeEngineInitializationError();
    }
    try {
      if (
        typeof this.store?.put !== "function" ||
        typeof this.store?.get !== "function" ||
        typeof this.construction?.nextKnowledgeIdentity !== "function" ||
        typeof this.construction?.nextAcceptedAt !== "function"
      ) {
        throw new Error();
      }
    } catch {
      throw new KnowledgeEngineInitializationError();
    }
    this.#engineState = "ready";
  }

  public start(): void {
    if (this.#engineState !== "ready") {
      throw new KnowledgeEngineInitializationError();
    }
    this.#engineState = "running";
  }

  public stop(): void {
    if (this.#engineState !== "running") {
      throw new KnowledgeEngineInitializationError();
    }
    this.#engineState = "stopped";
  }

  /** @internal Establishes an already confirmed Record for boundary tests. */
  public [knowledgeEngineTestState](value: unknown): KnowledgeRecord {
    this.requireRunning();
    const record = createKnowledgeRecord(value);
    if (this.#confirmed.has(record.knowledgeIdentity)) {
      throw new DuplicateKnowledgeIdentityError();
    }
    this.#confirmed.set(
      record.knowledgeIdentity,
      Object.freeze({ version: record.version }),
    );
    this.#current.add(record.knowledgeIdentity);
    this.#acceptanceOrder.push(record.knowledgeIdentity);
    return record;
  }

  public evaluateKnowledgeClaim(request: unknown): KnowledgeAcceptanceDecision {
    this.requireRunning();
    try {
      const evaluation = this.validateEvaluation(request);
      const contradiction = evaluation.contradiction;
      let predecessor: KnowledgeRecord | undefined;

      if (contradiction !== undefined) {
        if (!this.#current.has(contradiction.target)) {
          if (this.#confirmed.has(contradiction.target)) {
            throw new InvalidSupersessionError();
          }
          throw new KnowledgeNotFoundError();
        }
        predecessor = this.loadConfirmedRecord(contradiction.target);

        if (contradiction.decision === "reject-candidate") {
          return createRejectedKnowledgeDecision("contradiction-preserved");
        }
      }

      if (evaluation.evidence.decision === "reject") {
        return createRejectedKnowledgeDecision("authority-rejected");
      }

      let version = knowledgeVersion(1);
      if (predecessor !== undefined) {
        version = calculateNextKnowledgeVersion(predecessor.version);
      }

      const identity = this.nextIdentity();
      if (this.#confirmed.has(identity)) {
        throw new DuplicateKnowledgeIdentityError();
      }
      const record = createKnowledgeRecord({
        knowledgeIdentity: identity,
        claim: evaluation.claim,
        provenance: evaluation.provenance,
        acceptanceEvidence: evaluation.evidence,
        acceptedAt: this.nextAcceptedAt(),
        version,
        ...(predecessor === undefined
          ? {}
          : { supersedesKnowledgeIdentity: predecessor.knowledgeIdentity }),
      });
      const result = this.callStore(() => this.store.put(record));
      this.validatePutResult(result, identity);

      this.#confirmed.set(identity, Object.freeze({ version }));
      this.#current.add(identity);
      this.#acceptanceOrder.push(identity);
      if (predecessor !== undefined) {
        this.#current.delete(predecessor.knowledgeIdentity);
      }

      const reference = createKnowledgeReference({
        knowledgeIdentity: identity,
        version,
        currency: "current",
      });
      return createAcceptedKnowledgeDecision({ record, reference });
    } catch (error: unknown) {
      if (isPublicFailure(error)) throw error;
      throw new InvalidKnowledgeInputError();
    }
  }

  public getKnowledge(request: unknown): RetrievedKnowledge {
    this.requireRunning();
    try {
      if (
        !isPlainRecord(request) ||
        !hasExactFields(request, ["knowledgeIdentity"])
      ) {
        throw new InvalidKnowledgeInputError();
      }
      const identity = this.callerIdentity(request.knowledgeIdentity);
      if (!this.#confirmed.has(identity)) throw new KnowledgeNotFoundError();
      const record = this.loadConfirmedRecord(identity);
      const reference = createKnowledgeReference({
        knowledgeIdentity: identity,
        version: record.version,
        currency: this.#current.has(identity) ? "current" : "superseded",
      });
      return Object.freeze({ knowledge: record, reference });
    } catch (error: unknown) {
      if (isPublicFailure(error)) throw error;
      throw new InvalidKnowledgeInputError();
    }
  }

  public listKnowledgeReferences(
    request: unknown,
  ): readonly KnowledgeReference[] {
    this.requireRunning();
    try {
      if (!isPlainRecord(request) || !hasExactFields(request, [], ["limit"])) {
        throw new InvalidKnowledgeInputError();
      }
      const limit = Object.hasOwn(request, "limit") ? request.limit : 50;
      if (
        typeof limit !== "number" ||
        !Number.isInteger(limit) ||
        !Number.isFinite(limit) ||
        limit < 1 ||
        limit > 100
      ) {
        throw new InvalidKnowledgeInputError();
      }
      const references: KnowledgeReference[] = [];
      for (const identity of this.#acceptanceOrder) {
        if (!this.#current.has(identity)) continue;
        const metadata = this.#confirmed.get(identity);
        if (metadata === undefined) throw new InvalidKnowledgeStateError();
        references.push(
          createKnowledgeReference({
            knowledgeIdentity: identity,
            version: metadata.version,
            currency: "current",
          }),
        );
        if (references.length === limit) break;
      }
      return Object.freeze(references);
    } catch (error: unknown) {
      if (isPublicFailure(error)) throw error;
      throw new InvalidKnowledgeInputError();
    }
  }

  private validateEvaluation(request: unknown): ValidatedEvaluation {
    if (
      !isPlainRecord(request) ||
      !hasExactFields(
        request,
        ["intent", "claim", "acceptanceEvidence", "provenance"],
        [
          "contradictsKnowledgeIdentity",
          "contradictionDecision",
          "contradictionReason",
        ],
      ) ||
      request.intent !== "evaluate"
    ) {
      throw new InvalidKnowledgeInputError();
    }

    let claim;
    try {
      claim = candidateClaim(request.claim);
    } catch {
      throw new InvalidClaimError();
    }

    let evidence;
    try {
      evidence = createKnowledgeAcceptanceEvidence(request.acceptanceEvidence);
    } catch {
      throw new InvalidAcceptanceEvidenceError();
    }

    let provenance;
    try {
      provenance = createKnowledgeProvenance(request.provenance);
    } catch {
      throw new InvalidKnowledgeInputError();
    }

    const hasTarget = Object.hasOwn(request, "contradictsKnowledgeIdentity");
    const hasDecision = Object.hasOwn(request, "contradictionDecision");
    const hasReason = Object.hasOwn(request, "contradictionReason");
    if (hasTarget && (!hasDecision || !hasReason)) {
      throw new ContradictionRequiresResolutionError();
    }
    if (!hasTarget && (hasDecision || hasReason)) {
      throw new InvalidKnowledgeInputError();
    }
    if (!hasTarget) return Object.freeze({ claim, evidence, provenance });

    if (
      request.contradictionDecision !== "reject-candidate" &&
      request.contradictionDecision !== "supersede-existing"
    ) {
      throw new InvalidKnowledgeInputError();
    }
    let reason;
    try {
      reason = knowledgeContradictionReason(request.contradictionReason);
    } catch {
      throw new InvalidKnowledgeInputError();
    }
    return Object.freeze({
      claim,
      evidence,
      provenance,
      contradiction: Object.freeze({
        target: this.callerIdentity(request.contradictsKnowledgeIdentity),
        decision: request.contradictionDecision,
        reason,
      }),
    });
  }

  private loadConfirmedRecord(identity: KnowledgeIdentity): KnowledgeRecord {
    const result = this.callStore(() => this.store.get(identity));
    return this.validateGetResult(result, identity);
  }

  private validateStoredRecord(value: unknown): KnowledgeRecord {
    return this.inspectStoreResult(() => {
      if (
        !isPlainRecord(value) ||
        !hasExactFields(
          value,
          [
            "knowledgeIdentity",
            "claim",
            "provenance",
            "acceptanceEvidence",
            "validationState",
            "acceptedAt",
            "version",
          ],
          ["supersedesKnowledgeIdentity"],
        ) ||
        value.validationState !== "accepted"
      ) {
        throw new InvalidKnowledgeStateError();
      }
      return createKnowledgeRecord({
        knowledgeIdentity: value.knowledgeIdentity,
        claim: value.claim,
        provenance: value.provenance,
        acceptanceEvidence: value.acceptanceEvidence,
        acceptedAt: value.acceptedAt,
        version: value.version,
        ...(Object.hasOwn(value, "supersedesKnowledgeIdentity")
          ? { supersedesKnowledgeIdentity: value.supersedesKnowledgeIdentity }
          : {}),
      });
    });
  }

  private validatePutResult(
    result: unknown,
    identity: KnowledgeIdentity,
  ): void {
    this.inspectStoreResult(() => {
      if (!isPlainRecord(result) || typeof result.status !== "string") {
        throw new InvalidKnowledgeStateError();
      }
      if (
        result.status === "unavailable" &&
        hasExactFields(result, ["status"])
      ) {
        throw new KnowledgeStoreUnavailableError();
      }
      if (result.status === "duplicate" && hasExactFields(result, ["status"])) {
        throw new DuplicateKnowledgeIdentityError();
      }
      if (
        result.status !== "stored" ||
        !hasExactFields(result, ["status", "knowledgeIdentity"]) ||
        knowledgeIdentity(result.knowledgeIdentity) !== identity
      ) {
        throw new InvalidKnowledgeStateError();
      }
    });
  }

  private validateGetResult(
    result: unknown,
    identity: KnowledgeIdentity,
  ): KnowledgeRecord {
    return this.inspectStoreResult(() => {
      if (!isPlainRecord(result) || typeof result.status !== "string") {
        throw new InvalidKnowledgeStateError();
      }
      if (
        result.status === "unavailable" &&
        hasExactFields(result, ["status"])
      ) {
        throw new KnowledgeStoreUnavailableError();
      }
      if (result.status === "not-found" && hasExactFields(result, ["status"])) {
        throw new InvalidKnowledgeStateError();
      }
      if (
        result.status !== "found" ||
        !hasExactFields(result, ["status", "record"])
      ) {
        throw new InvalidKnowledgeStateError();
      }
      const record = this.validateStoredRecord(result.record);
      const metadata = this.#confirmed.get(identity);
      if (
        record.knowledgeIdentity !== identity ||
        metadata === undefined ||
        record.version !== metadata.version
      ) {
        throw new InvalidKnowledgeStateError();
      }
      return record;
    });
  }

  private callerIdentity(value: unknown): KnowledgeIdentity {
    try {
      return knowledgeIdentity(value);
    } catch {
      throw new InvalidKnowledgeIdentityError();
    }
  }

  private nextIdentity(): KnowledgeIdentity {
    try {
      return knowledgeIdentity(this.construction.nextKnowledgeIdentity());
    } catch {
      throw new InvalidKnowledgeIdentityError();
    }
  }

  private nextAcceptedAt() {
    try {
      return knowledgeTimestamp(this.construction.nextAcceptedAt());
    } catch {
      throw new InvalidKnowledgeStateError();
    }
  }

  private callStore(operation: () => unknown): unknown {
    try {
      return operation();
    } catch {
      throw new KnowledgeStoreUnavailableError();
    }
  }

  private inspectStoreResult<T>(inspection: () => T): T {
    try {
      return inspection();
    } catch (error: unknown) {
      if (
        error instanceof KnowledgeStoreUnavailableError ||
        error instanceof DuplicateKnowledgeIdentityError ||
        error instanceof KnowledgeNotFoundError ||
        error instanceof InvalidKnowledgeStateError
      ) {
        throw error;
      }
      throw new InvalidKnowledgeStateError();
    }
  }

  private requireRunning(): void {
    if (this.#engineState !== "running") throw new InvalidKnowledgeStateError();
  }
}

function isPlainRecord(value: unknown): value is Record<string, unknown> {
  if (typeof value !== "object" || value === null || Array.isArray(value)) {
    return false;
  }
  const prototype = Object.getPrototypeOf(value) as unknown;
  return prototype === Object.prototype || prototype === null;
}

function hasExactFields(
  value: Record<string, unknown>,
  required: readonly string[],
  optional: readonly string[] = [],
): boolean {
  const keys = Object.keys(value);
  return (
    required.every((field) => keys.includes(field)) &&
    keys.every(
      (field) => required.includes(field) || optional.includes(field),
    ) &&
    keys.length >= required.length &&
    keys.length <= required.length + optional.length
  );
}

function isPublicFailure(error: unknown): boolean {
  return (
    error instanceof InvalidKnowledgeInputError ||
    error instanceof InvalidKnowledgeIdentityError ||
    error instanceof InvalidClaimError ||
    error instanceof InvalidAcceptanceEvidenceError ||
    error instanceof KnowledgeNotFoundError ||
    error instanceof DuplicateKnowledgeIdentityError ||
    error instanceof ContradictionRequiresResolutionError ||
    error instanceof InvalidSupersessionError ||
    error instanceof KnowledgeStoreUnavailableError ||
    error instanceof InvalidKnowledgeStateError
  );
}

export type KnowledgeEngineLifecycleState =
  "initialize" | "ready" | "running" | "stopped";

export class KnowledgeEngineInitializationError extends Error {
  public constructor() {
    super("Knowledge Engine dependencies or lifecycle are invalid.");
    this.name = "KnowledgeEngineInitializationError";
  }
}

/** @internal M4 semantic helper kept outside the public package export. */
export function calculateNextKnowledgeVersion(
  predecessorVersion: unknown,
): KnowledgeVersion {
  let predecessor;
  try {
    predecessor = knowledgeVersion(predecessorVersion);
  } catch {
    throw new InvalidSupersessionError();
  }
  if (predecessor === KNOWLEDGE_VERSION_MAX) {
    throw new InvalidSupersessionError();
  }
  try {
    return knowledgeVersion(predecessor + 1);
  } catch {
    throw new InvalidSupersessionError();
  }
}
