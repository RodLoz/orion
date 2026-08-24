import {
  ContradictionRequiresResolutionError,
  DuplicateKnowledgeIdentityError,
  InvalidAcceptanceEvidenceError,
  InvalidClaimError,
  InvalidKnowledgeIdentityError,
  InvalidKnowledgeInputError,
  InvalidKnowledgeStateError,
  InvalidKnowledgeProjectionRequestError,
  InvalidKnowledgeProjectionVerificationRequestError,
  InvalidSupersessionError,
  KNOWLEDGE_VERSION_MAX,
  KnowledgeNotFoundError,
  KnowledgeProjectionAuthorityVerificationError,
  KnowledgeProjectionConstructionError,
  KnowledgeProjectionIneligibleError,
  KnowledgeProjectionIssuanceError,
  KnowledgeProjectionPreparationMismatchError,
  KnowledgeProjectionVersionMismatchError,
  KnowledgeStoreUnavailableError,
  candidateClaim,
  createAcceptedKnowledgeDecision,
  createKnowledgeAcceptanceEvidence,
  createAcceptedStructuredKnowledgeProposition,
  createAcceptedStructuredKnowledgeSourceOwnershipCorrespondence,
  createKnowledgeAcceptanceSemanticInput,
  createKnowledgeLifecycleSnapshotResult,
  createPutIndependentAcceptedKnowledgeRequest,
  createPutIndependentAcceptedKnowledgeResult,
  createKnowledgeCapabilityAttribution,
  createKnowledgeOwnedSourceCurrentnessDetermination,
  createKnowledgeProjectionRequest,
  createKnowledgeProvenance,
  createKnowledgeRecord,
  createKnowledgeReference,
  createSupersedeCurrentKnowledgeRequest,
  createSupersedeCurrentKnowledgeResult,
  createRejectedKnowledgeDecision,
  createStructuredKnowledgeProjectionCandidate,
  knowledgeContradictionReason,
  knowledgeIdentity,
  knowledgeTimestamp,
  knowledgeVersion,
  propositionIdentity,
  underlyingSourceAuthorityCorrespondence,
  type EvaluateKnowledgeClaim,
  type GetKnowledge,
  type KnowledgeAcceptanceDecision,
  type KnowledgeAcceptanceEvidence,
  type KnowledgeConstructionValues,
  type KnowledgeIdentity,
  type KnowledgeAcceptanceSemanticInput,
  type KnowledgeOwnedSourceCurrentnessDetermination,
  type KnowledgeProvenance,
  type KnowledgeProjectionRequest,
  type KnowledgeRecord,
  type KnowledgeReference,
  type KnowledgeStore,
  type KnowledgeVersion,
  type ListKnowledgeReferences,
  type ProjectStructuredKnowledge,
  type RetrievedKnowledge,
  type StructuredKnowledgeProjection,
  type VerifyStructuredKnowledgeProjectionAuthority,
  type VerifyStructuredKnowledgeProjectionAuthorityRequest,
} from "@orion/core";

import { KnowledgeProjectionAuthority } from "./knowledge-projection-authority.js";
import {
  createKnowledgeSettlementCoordinator,
  type KnowledgeSettlementCompletion,
  type KnowledgeSettlementCoordinator,
} from "./knowledge-settlement-coordinator.js";

interface ValidatedEvaluation {
  readonly claim: ReturnType<typeof candidateClaim>;
  readonly evidence: KnowledgeAcceptanceEvidence;
  readonly provenance: KnowledgeProvenance;
  readonly semanticInput: KnowledgeAcceptanceSemanticInput;
  readonly contradiction?: Readonly<{
    target: KnowledgeIdentity;
    decision: "reject-candidate" | "supersede-existing";
    reason: ReturnType<typeof knowledgeContradictionReason>;
  }>;
}

interface ConfirmedMetadata {
  readonly version: KnowledgeVersion;
}

interface ReconstructedRuntimeState {
  readonly confirmed: Map<KnowledgeIdentity, ConfirmedMetadata>;
  readonly current: Set<KnowledgeIdentity>;
  readonly acceptanceOrder: KnowledgeIdentity[];
  readonly records: Map<KnowledgeIdentity, KnowledgeRecord>;
}

class AmbiguousKnowledgeMutationError extends Error {}

/** @internal Test-only state fixture; not exported from the package entry point. */
export const knowledgeEngineTestState = Symbol("knowledgeEngineTestState");

export class KnowledgeEngineRuntime
  implements
    EvaluateKnowledgeClaim,
    GetKnowledge,
    ListKnowledgeReferences,
    ProjectStructuredKnowledge,
    VerifyStructuredKnowledgeProjectionAuthority
{
  #engineState: KnowledgeEngineLifecycleState = "created";
  #confirmed = new Map<KnowledgeIdentity, ConfirmedMetadata>();
  #current = new Set<KnowledgeIdentity>();
  #acceptanceOrder: KnowledgeIdentity[] = [];
  #records = new Map<KnowledgeIdentity, KnowledgeRecord>();
  #projectionAuthority = new KnowledgeProjectionAuthority();
  #initialization: Promise<void> | undefined;
  #recovery: Promise<void> | undefined;
  #shutdown: Promise<void> | undefined;
  #shutdownRequested = false;
  #mutationTail: Promise<void> = Promise.resolve();

  public constructor(
    private readonly store: KnowledgeStore,
    private readonly construction: KnowledgeConstructionValues,
    private readonly settlementCoordinator: KnowledgeSettlementCoordinator = createKnowledgeSettlementCoordinator(),
  ) {}

  public get engineState(): KnowledgeEngineLifecycleState {
    return this.#engineState;
  }

  public initialize(): Promise<void> {
    if (
      this.#engineState === "initializing" &&
      this.#initialization !== undefined
    ) {
      return this.#initialization;
    }
    if (this.#engineState !== "created") {
      return Promise.reject(new KnowledgeEngineInitializationError());
    }
    if (
      typeof this.construction?.nextKnowledgeIdentity !== "function" ||
      typeof this.construction?.nextAcceptedAt !== "function"
    ) {
      this.#engineState = "failed-initialization";
      return Promise.reject(new KnowledgeEngineInitializationError());
    }
    this.#engineState = "initializing";
    let settle: KnowledgeSettlementCompletion;
    try {
      settle = this.settlementCoordinator.admit();
    } catch {
      this.#engineState = "failed-initialization";
      return Promise.reject(new KnowledgeEngineInitializationError());
    }
    const attempt = this.performInitialization(settle);
    this.#initialization = attempt;
    return attempt;
  }

  public start(): void {
    if (this.#engineState !== "ready") {
      throw new KnowledgeEngineInitializationError();
    }
  }

  public stop(): Promise<void> {
    if (this.#engineState === "stopped") return Promise.resolve();
    if (this.#engineState === "failed-shutdown") {
      return Promise.reject(new KnowledgeEngineShutdownError());
    }
    if (this.#shutdown !== undefined) return this.#shutdown;
    this.#shutdownRequested = true;
    if (
      this.#engineState !== "initializing" &&
      this.#engineState !== "reconstructing"
    ) {
      this.#engineState = "stopping";
    }
    const shutdown = this.performShutdown();
    this.#shutdown = shutdown;
    return shutdown;
  }

  public recover(): Promise<void> {
    if (
      this.#engineState === "reconstructing" &&
      this.#recovery !== undefined
    ) {
      return this.#recovery;
    }
    if (this.#engineState !== "reconstruction-required") {
      return Promise.reject(new KnowledgeEngineRecoveryError());
    }
    this.#engineState = "reconstructing";
    let settle: KnowledgeSettlementCompletion;
    try {
      settle = this.settlementCoordinator.admit();
    } catch {
      this.#engineState = "reconstruction-required";
      return Promise.reject(new KnowledgeEngineRecoveryError());
    }
    const recovery = this.performRecovery(settle);
    this.#recovery = recovery;
    return recovery;
  }

  /** @internal Establishes an already confirmed Record for boundary tests. */
  public [knowledgeEngineTestState](value: unknown): KnowledgeRecord {
    this.requireReady();
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
    this.#records.set(record.knowledgeIdentity, record);
    return record;
  }

  public evaluateKnowledgeClaim(
    request: unknown,
  ): Promise<KnowledgeAcceptanceDecision> {
    let evaluation: ValidatedEvaluation;
    try {
      evaluation = this.validateEvaluation(request);
      this.requireReady();
    } catch (error: unknown) {
      return Promise.reject(
        isPublicFailure(error) ? error : new InvalidKnowledgeInputError(),
      );
    }
    let settle: KnowledgeSettlementCompletion;
    try {
      settle = this.settlementCoordinator.admit();
    } catch {
      return Promise.reject(new InvalidKnowledgeStateError());
    }
    const operation = this.#mutationTail
      .then(() => this.executeEvaluation(evaluation))
      .finally(settle);
    this.#mutationTail = operation.then(
      () => undefined,
      () => undefined,
    );
    return operation;
  }

  private async executeEvaluation(
    evaluation: ValidatedEvaluation,
  ): Promise<KnowledgeAcceptanceDecision> {
    if (this.#engineState !== "ready" && this.#engineState !== "stopping") {
      throw new KnowledgeStoreUnavailableError();
    }
    try {
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
      let acceptedStructuredProposition;
      if ("structuredProposition" in evaluation.semanticInput) {
        // The explicit authority review governs the complete submitted
        // candidate. Reconstructing the accepted correspondence here keeps the
        // caller proposal distinct until that review has accepted it.
        const sourceOwnershipCorrespondence =
          createAcceptedStructuredKnowledgeSourceOwnershipCorrespondence(
            evaluation.semanticInput.sourceOwnershipProposal,
          );
        acceptedStructuredProposition =
          createAcceptedStructuredKnowledgeProposition({
            propositionIdentity: this.nextPropositionIdentity(),
            semanticValue: evaluation.semanticInput.structuredProposition,
            sourceOwnershipCorrespondence,
          });
      }
      const record = createKnowledgeRecord({
        knowledgeIdentity: identity,
        claim: evaluation.claim,
        provenance: evaluation.provenance,
        acceptanceEvidence: evaluation.evidence,
        acceptedAt: this.nextAcceptedAt(),
        version,
        ...(acceptedStructuredProposition === undefined
          ? {}
          : { acceptedStructuredProposition }),
        ...(predecessor === undefined
          ? {}
          : { supersedesKnowledgeIdentity: predecessor.knowledgeIdentity }),
      });
      if (predecessor === undefined) {
        const result = await this.callMutationStore(() =>
          this.store.putIndependentAcceptedKnowledge(
            createPutIndependentAcceptedKnowledgeRequest({ record }),
          ),
        );
        this.validateIndependentAcceptanceResult(result, identity);
      } else {
        const result = await this.callMutationStore(() =>
          this.store.supersedeCurrentKnowledge(
            createSupersedeCurrentKnowledgeRequest({
              expectedPredecessorKnowledgeIdentity:
                predecessor.knowledgeIdentity,
              expectedPredecessorVersion: predecessor.version,
              successor: record,
            }),
          ),
        );
        this.validateSupersessionResult(
          result,
          predecessor.knowledgeIdentity,
          identity,
        );
      }

      this.#confirmed.set(identity, Object.freeze({ version }));
      this.#current.add(identity);
      this.#acceptanceOrder.push(identity);
      this.#records.set(identity, record);
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
      if (error instanceof AmbiguousKnowledgeMutationError) {
        this.#engineState = "reconstruction-required";
        throw new KnowledgeStoreUnavailableError();
      }
      if (isPublicFailure(error)) throw error;
      throw new InvalidKnowledgeInputError();
    }
  }

  public getKnowledge(request: unknown): RetrievedKnowledge {
    this.requireReady();
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

  public projectStructuredKnowledge(
    request: KnowledgeProjectionRequest,
  ): StructuredKnowledgeProjection;
  public projectStructuredKnowledge(
    request: unknown,
  ): StructuredKnowledgeProjection;
  public projectStructuredKnowledge(
    request: unknown,
  ): StructuredKnowledgeProjection {
    this.requireReady();
    let projectionRequest: KnowledgeProjectionRequest;
    try {
      projectionRequest = createKnowledgeProjectionRequest(request);
    } catch {
      throw new InvalidKnowledgeProjectionRequestError();
    }

    const identity = projectionRequest.target.knowledgeIdentity;
    const metadata = this.#confirmed.get(identity);
    if (metadata === undefined) throw new KnowledgeNotFoundError();
    if (
      metadata.version !== projectionRequest.target.expectedKnowledgeVersion
    ) {
      throw new KnowledgeProjectionVersionMismatchError();
    }
    const record = this.loadConfirmedRecord(identity, {
      allowCurrentnessInconsistency: true,
    });
    const accepted = record.acceptedStructuredProposition;
    if (accepted === undefined) {
      if (record.version !== metadata.version) {
        throw new InvalidKnowledgeStateError();
      }
      throw new KnowledgeProjectionIneligibleError();
    }

    const prerequisites = projectionRequest.preparationPrerequisites;
    const ownership = accepted.sourceOwnershipCorrespondence;
    if (
      record.version !== metadata.version &&
      ownership.currentnessOwner !== "knowledge-owned-currentness"
    ) {
      throw new InvalidKnowledgeStateError();
    }
    if (prerequisites.currentnessOwner !== ownership.currentnessOwner) {
      throw new KnowledgeProjectionPreparationMismatchError();
    }

    let candidateInput: Record<string, unknown>;
    if (ownership.currentnessOwner === "knowledge-owned-currentness") {
      const determination = this.determineKnowledgeOwnedCurrentness(
        record,
        prerequisites.candidatePreparationAssociation,
      );
      if (determination.outcome === "negative") {
        throw new KnowledgeProjectionIneligibleError();
      }
      if (determination.outcome === "unable-to-determine") {
        throw new KnowledgeSourceCurrentnessUnableToDetermineError();
      }
      candidateInput = {
        semanticValue: accepted.semanticValue,
        correspondence: {
          candidatePreparationAssociation:
            prerequisites.candidatePreparationAssociation,
          propositionIdentity: accepted.propositionIdentity,
          knowledgeIdentity: record.knowledgeIdentity,
          knowledgeVersion: record.version,
          validationState: "accepted",
          attribution: createKnowledgeCapabilityAttribution({
            authoritativeCapability: "knowledge",
          }),
          sourceOwnershipCorrespondence: ownership,
          knowledgeOwnedCurrentnessDetermination: determination,
        },
      };
    } else {
      if (prerequisites.currentnessOwner !== "external-source-currentness") {
        throw new KnowledgeProjectionPreparationMismatchError();
      }
      const external = prerequisites.externalCurrentnessCorrespondence;
      if (
        external.applicableOwner !== ownership.applicableOwner ||
        external.propositionSourceRelationship !==
          ownership.propositionSourceRelationship
      ) {
        throw new KnowledgeProjectionPreparationMismatchError();
      }
      candidateInput = {
        semanticValue: accepted.semanticValue,
        correspondence: {
          candidatePreparationAssociation:
            prerequisites.candidatePreparationAssociation,
          propositionIdentity: accepted.propositionIdentity,
          knowledgeIdentity: record.knowledgeIdentity,
          knowledgeVersion: record.version,
          validationState: "accepted",
          attribution: createKnowledgeCapabilityAttribution({
            authoritativeCapability: "knowledge",
          }),
          sourceOwnershipCorrespondence: ownership,
          externalCurrentnessCorrespondence: external,
          underlyingSourceAuthority: underlyingSourceAuthorityCorrespondence(
            external.issuerVerification,
          ),
        },
      };
    }

    try {
      const candidate =
        createStructuredKnowledgeProjectionCandidate(candidateInput);
      return this.#projectionAuthority.capture(candidate);
    } catch (error) {
      if (error instanceof KnowledgeProjectionIssuanceError) throw error;
      throw new KnowledgeProjectionConstructionError();
    }
  }

  public verifyStructuredKnowledgeProjectionAuthority(
    request: VerifyStructuredKnowledgeProjectionAuthorityRequest,
  ): StructuredKnowledgeProjection;
  public verifyStructuredKnowledgeProjectionAuthority(
    request: unknown,
  ): StructuredKnowledgeProjection;
  public verifyStructuredKnowledgeProjectionAuthority(
    request: unknown,
  ): StructuredKnowledgeProjection {
    this.requireReady();
    try {
      return this.#projectionAuthority.verify(request);
    } catch (error) {
      if (
        error instanceof InvalidKnowledgeProjectionVerificationRequestError ||
        error instanceof KnowledgeProjectionAuthorityVerificationError
      ) {
        throw error;
      }
      throw new KnowledgeProjectionAuthorityVerificationError();
    }
  }

  public listKnowledgeReferences(
    request: unknown,
  ): readonly KnowledgeReference[] {
    this.requireReady();
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
          "structuredProposition",
          "samePropositionDeclaration",
          "sourceOwnershipProposal",
        ],
      ) ||
      request.intent !== "evaluate"
    ) {
      throw new InvalidKnowledgeInputError();
    }

    let claim;
    let semanticInput;
    try {
      semanticInput = createKnowledgeAcceptanceSemanticInput({
        claim: request.claim,
        ...(Object.hasOwn(request, "structuredProposition")
          ? { structuredProposition: request.structuredProposition }
          : {}),
        ...(Object.hasOwn(request, "samePropositionDeclaration")
          ? { samePropositionDeclaration: request.samePropositionDeclaration }
          : {}),
        ...(Object.hasOwn(request, "sourceOwnershipProposal")
          ? { sourceOwnershipProposal: request.sourceOwnershipProposal }
          : {}),
      });
      claim = semanticInput.claim;
    } catch {
      try {
        candidateClaim(request.claim);
      } catch {
        throw new InvalidClaimError();
      }
      throw new InvalidKnowledgeInputError();
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
    if (!hasTarget)
      return Object.freeze({ claim, evidence, provenance, semanticInput });

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
      semanticInput,
      contradiction: Object.freeze({
        target: this.callerIdentity(request.contradictsKnowledgeIdentity),
        decision: request.contradictionDecision,
        reason,
      }),
    });
  }

  private async reconstructLifecycle(): Promise<ReconstructedRuntimeState> {
    const snapshotResult = createKnowledgeLifecycleSnapshotResult(
      await this.store.loadKnowledgeLifecycleSnapshot(),
    );
    if (snapshotResult.status !== "loaded") {
      throw new Error();
    }
    const entries = snapshotResult.snapshot.entries;
    const entryByIdentity = new Map<
      KnowledgeIdentity,
      (typeof entries)[number]
    >();
    const childByIdentity = new Map<KnowledgeIdentity, KnowledgeIdentity>();
    const orders = new Set<string>();
    const records = new Map<KnowledgeIdentity, KnowledgeRecord>();

    for (const entry of entries) {
      if (entryByIdentity.has(entry.knowledgeIdentity)) throw new Error();
      if (orders.has(entry.acceptanceOrder)) throw new Error();
      orders.add(entry.acceptanceOrder);
      const stored = await this.store.get(entry.knowledgeIdentity);
      if (!isPlainRecord(stored) || stored.status !== "found")
        throw new Error();
      const record = this.validateStoredRecord(stored.record);
      if (
        record.knowledgeIdentity !== entry.knowledgeIdentity ||
        record.version !== entry.version ||
        record.supersedesKnowledgeIdentity !==
          entry.predecessorKnowledgeIdentity
      ) {
        throw new Error();
      }
      if (entry.predecessorKnowledgeIdentity === entry.knowledgeIdentity) {
        throw new Error();
      }
      entryByIdentity.set(entry.knowledgeIdentity, entry);
      records.set(entry.knowledgeIdentity, record);
    }

    for (const entry of entries) {
      const predecessor = entry.predecessorKnowledgeIdentity;
      if (predecessor === undefined) continue;
      const predecessorEntry = entryByIdentity.get(predecessor);
      if (predecessorEntry === undefined) throw new Error();
      if (childByIdentity.has(predecessor)) throw new Error();
      if (
        calculateNextKnowledgeVersion(predecessorEntry.version) !==
        entry.version
      ) {
        throw new Error();
      }
      childByIdentity.set(predecessor, entry.knowledgeIdentity);
    }

    const visiting = new Set<KnowledgeIdentity>();
    const visited = new Set<KnowledgeIdentity>();
    const visit = (identity: KnowledgeIdentity): void => {
      if (visiting.has(identity)) throw new Error();
      if (visited.has(identity)) return;
      visiting.add(identity);
      const predecessor =
        entryByIdentity.get(identity)?.predecessorKnowledgeIdentity;
      if (predecessor !== undefined) visit(predecessor);
      visiting.delete(identity);
      visited.add(identity);
    };
    for (const entry of entries) visit(entry.knowledgeIdentity);

    for (const entry of entries) {
      const hasSuccessor = childByIdentity.has(entry.knowledgeIdentity);
      if ((entry.standing === "current") === hasSuccessor) throw new Error();
    }

    const confirmed = new Map<KnowledgeIdentity, ConfirmedMetadata>();
    const current = new Set<KnowledgeIdentity>();
    const acceptanceOrder: KnowledgeIdentity[] = [];
    for (const entry of entries) {
      confirmed.set(
        entry.knowledgeIdentity,
        Object.freeze({ version: entry.version }),
      );
      if (entry.standing === "current") current.add(entry.knowledgeIdentity);
      acceptanceOrder.push(entry.knowledgeIdentity);
    }
    return { confirmed, current, acceptanceOrder, records };
  }

  private validateIndependentAcceptanceResult(
    result: unknown,
    identity: KnowledgeIdentity,
  ): void {
    let parsed: ReturnType<typeof createPutIndependentAcceptedKnowledgeResult>;
    try {
      parsed = createPutIndependentAcceptedKnowledgeResult(result);
    } catch {
      throw new InvalidKnowledgeStateError();
    }
    if (parsed.status === "stored" && parsed.knowledgeIdentity === identity)
      return;
    if (parsed.status === "duplicate")
      throw new DuplicateKnowledgeIdentityError();
    if (parsed.status === "unavailable")
      throw new KnowledgeStoreUnavailableError();
    if (parsed.status === "ambiguous")
      throw new AmbiguousKnowledgeMutationError();
    throw new InvalidKnowledgeStateError();
  }

  private validateSupersessionResult(
    result: unknown,
    predecessor: KnowledgeIdentity,
    successor: KnowledgeIdentity,
  ): void {
    let parsed: ReturnType<typeof createSupersedeCurrentKnowledgeResult>;
    try {
      parsed = createSupersedeCurrentKnowledgeResult(result);
    } catch {
      throw new InvalidKnowledgeStateError();
    }
    if (
      parsed.status === "superseded" &&
      parsed.predecessorKnowledgeIdentity === predecessor &&
      parsed.successorKnowledgeIdentity === successor
    ) {
      return;
    }
    if (
      parsed.status === "predecessor-not-found" ||
      parsed.status === "stale-predecessor"
    ) {
      throw new InvalidSupersessionError();
    }
    if (parsed.status === "duplicate")
      throw new DuplicateKnowledgeIdentityError();
    if (parsed.status === "unavailable")
      throw new KnowledgeStoreUnavailableError();
    if (parsed.status === "ambiguous")
      throw new AmbiguousKnowledgeMutationError();
    throw new InvalidKnowledgeStateError();
  }

  private loadConfirmedRecord(
    identity: KnowledgeIdentity,
    options: Readonly<{ allowCurrentnessInconsistency?: boolean }> = {},
  ): KnowledgeRecord {
    const record = this.#records.get(identity);
    const metadata = this.#confirmed.get(identity);
    if (record === undefined || metadata === undefined) {
      throw new InvalidKnowledgeStateError();
    }
    if (
      record.version !== metadata.version &&
      options.allowCurrentnessInconsistency !== true
    ) {
      throw new InvalidKnowledgeStateError();
    }
    return record;
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
          ["supersedesKnowledgeIdentity", "acceptedStructuredProposition"],
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
        ...(Object.hasOwn(value, "acceptedStructuredProposition")
          ? {
              acceptedStructuredProposition:
                value.acceptedStructuredProposition,
            }
          : {}),
        ...(Object.hasOwn(value, "supersedesKnowledgeIdentity")
          ? { supersedesKnowledgeIdentity: value.supersedesKnowledgeIdentity }
          : {}),
      });
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

  private nextPropositionIdentity() {
    try {
      const allocator = this.construction.nextPropositionIdentity;
      if (typeof allocator !== "function") {
        throw new Error();
      }
      return propositionIdentity(allocator.call(this.construction));
    } catch {
      throw new InvalidKnowledgeStateError();
    }
  }

  private determineKnowledgeOwnedCurrentness(
    record: Extract<
      KnowledgeRecord,
      { readonly acceptedStructuredProposition: unknown }
    >,
    association: KnowledgeProjectionRequest["preparationPrerequisites"]["candidatePreparationAssociation"],
  ): KnowledgeOwnedSourceCurrentnessDetermination {
    const metadata = this.#confirmed.get(record.knowledgeIdentity);
    const outcome =
      metadata === undefined || metadata.version !== record.version
        ? "unable-to-determine"
        : this.#current.has(record.knowledgeIdentity)
          ? "positive"
          : "negative";
    return createKnowledgeOwnedSourceCurrentnessDetermination({
      currentnessOwner: "knowledge-owned-currentness",
      outcome,
      knowledgeIdentity: record.knowledgeIdentity,
      knowledgeVersion: record.version,
      propositionIdentity:
        record.acceptedStructuredProposition.propositionIdentity,
      semanticValue: record.acceptedStructuredProposition.semanticValue,
      candidatePreparationAssociation: association,
    });
  }

  private async callMutationStore(
    operation: () => Promise<unknown>,
  ): Promise<unknown> {
    try {
      return await operation();
    } catch {
      throw new AmbiguousKnowledgeMutationError();
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

  private requireReady(): void {
    if (this.#engineState !== "ready") throw new InvalidKnowledgeStateError();
  }

  private publishReconstructedState(state: ReconstructedRuntimeState): void {
    this.#confirmed = state.confirmed;
    this.#current = state.current;
    this.#acceptanceOrder = state.acceptanceOrder;
    this.#records = state.records;
    this.#projectionAuthority = new KnowledgeProjectionAuthority();
  }

  private async performInitialization(
    settle: KnowledgeSettlementCompletion,
  ): Promise<void> {
    try {
      const replacement = await this.reconstructLifecycle();
      this.publishReconstructedState(replacement);
      this.#engineState = this.#shutdownRequested ? "stopping" : "ready";
    } catch {
      this.#engineState = "failed-initialization";
      throw new KnowledgeEngineInitializationError();
    } finally {
      settle();
    }
  }

  private async performRecovery(
    settle: KnowledgeSettlementCompletion,
  ): Promise<void> {
    try {
      const replacement = await this.reconstructLifecycle();
      this.publishReconstructedState(replacement);
      this.#engineState = this.#shutdownRequested ? "stopping" : "ready";
    } catch {
      this.#engineState = "reconstruction-required";
      throw new KnowledgeEngineRecoveryError();
    } finally {
      settle();
    }
  }

  private async performShutdown(): Promise<void> {
    try {
      if (this.#initialization !== undefined) {
        await this.#initialization.catch(() => undefined);
      }
      if (this.#recovery !== undefined) {
        await this.#recovery.catch(() => undefined);
      }
      this.#engineState = "stopping";
      await this.#mutationTail;
      this.#engineState = "stopping";
      await this.settlementCoordinator.waitUntilSettled();
      this.#engineState = "stopped";
    } catch {
      this.#engineState = "failed-shutdown";
      throw new KnowledgeEngineShutdownError();
    }
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
  | "created"
  | "initializing"
  | "ready"
  | "reconstruction-required"
  | "reconstructing"
  | "stopping"
  | "stopped"
  | "failed-initialization"
  | "failed-shutdown";

export class KnowledgeEngineInitializationError extends Error {
  public constructor() {
    super("Knowledge Engine dependencies or lifecycle are invalid.");
    this.name = "KnowledgeEngineInitializationError";
  }
}

export class KnowledgeEngineRecoveryError extends Error {
  public constructor() {
    super("Knowledge Engine recovery failed or is not permitted.");
    this.name = "KnowledgeEngineRecoveryError";
  }
}

export class KnowledgeEngineShutdownError extends Error {
  public constructor() {
    super("Knowledge Engine shutdown settlement failed.");
    this.name = "KnowledgeEngineShutdownError";
  }
}

export class KnowledgeSourceCurrentnessUnableToDetermineError extends Error {
  public constructor() {
    super(
      "Knowledge could not determine Source Currentness for the preparation.",
    );
    this.name = "KnowledgeSourceCurrentnessUnableToDetermineError";
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
