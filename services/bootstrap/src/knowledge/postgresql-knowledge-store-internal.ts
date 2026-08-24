import {
  createKnowledgeLifecycleSnapshot,
  createKnowledgeLifecycleSnapshotEntry,
  createKnowledgeRecord,
  createPutIndependentAcceptedKnowledgeRequest,
  createPutIndependentAcceptedKnowledgeResult,
  createSupersedeCurrentKnowledgeRequest,
  createSupersedeCurrentKnowledgeResult,
  knowledgeAcceptanceOrder,
  type KnowledgeIdentity,
  type KnowledgeLifecycleSnapshotResult,
  type KnowledgeRecord,
  type KnowledgeStore,
  type KnowledgeStoreGetResult,
  type KnowledgeStorePutResult,
  type PutIndependentAcceptedKnowledgeRequest,
  type PutIndependentAcceptedKnowledgeResult,
  type SupersedeCurrentKnowledgeRequest,
  type SupersedeCurrentKnowledgeResult,
} from "@orion/core";

export interface PostgreSqlQueryResult {
  readonly rows: Record<string, unknown>[];
  readonly rowCount: number | null;
}

export interface PostgreSqlKnowledgeClient {
  query(
    text: string,
    values?: readonly unknown[],
  ): Promise<PostgreSqlQueryResult>;
  release(destroy?: boolean | Error): void;
}

export interface PostgreSqlKnowledgePool {
  connect(): Promise<PostgreSqlKnowledgeClient>;
}

type MutationFailureResult =
  | Readonly<{ status: "duplicate" }>
  | Readonly<{ status: "predecessor-not-found" }>
  | Readonly<{ status: "stale-predecessor" }>
  | Readonly<{ status: "invalid-state" }>
  | Readonly<{ status: "unavailable" }>;

type MutationResult<Result> =
  Result | MutationFailureResult | Readonly<{ status: "ambiguous" }>;

const INSERT_RECORD_SQL = `INSERT INTO knowledge.knowledge_record (
  knowledge_identity, claim, provenance_source_type,
  provenance_originating_capability, provenance_observed_at,
  provenance_source_reference, acceptance_method,
  acceptance_authority_identifier, acceptance_reason, accepted_at, version,
  supersedes_knowledge_identity, proposition_identity,
  proposition_subject_key, proposition_predicate_key,
  proposition_textual_scalar, proposition_currentness_owner,
  proposition_applicable_owner, proposition_source_relationship
) VALUES (
  $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15,
  $16, $17, $18, $19
)`;

const SELECT_RECORD_COLUMNS = `r.knowledge_identity, r.claim,
  r.provenance_source_type, r.provenance_originating_capability,
  r.provenance_observed_at, r.provenance_source_reference,
  r.acceptance_method, r.acceptance_authority_identifier,
  r.acceptance_reason, r.accepted_at, r.version,
  r.supersedes_knowledge_identity, r.proposition_identity,
  r.proposition_subject_key, r.proposition_predicate_key,
  r.proposition_textual_scalar, r.proposition_currentness_owner,
  r.proposition_applicable_owner, r.proposition_source_relationship`;

const RECORD_IDENTITY_CONSTRAINT = "knowledge_record_identity_pk";
const ONE_SUCCESSOR_CONSTRAINT = "knowledge_record_one_successor_uq";

export class PostgreSQLKnowledgeStoreRuntime implements KnowledgeStore {
  public constructor(private readonly pool: PostgreSqlKnowledgePool) {}

  public async put(record: KnowledgeRecord): Promise<KnowledgeStorePutResult> {
    let immutable: KnowledgeRecord;
    try {
      immutable = createKnowledgeRecord(record);
    } catch {
      throw new PostgreSQLKnowledgeStoreError();
    }
    let client: PostgreSqlKnowledgeClient;
    try {
      client = await this.pool.connect();
    } catch {
      return Object.freeze({ status: "unavailable" });
    }
    let destroy = false;
    try {
      await client.query(INSERT_RECORD_SQL, recordParameters(immutable));
      return Object.freeze({
        status: "stored",
        knowledgeIdentity: immutable.knowledgeIdentity,
      });
    } catch (error: unknown) {
      if (constraintName(error) === RECORD_IDENTITY_CONSTRAINT) {
        return Object.freeze({ status: "duplicate" });
      }
      if (isOperationalPostgreSqlError(error)) {
        destroy = true;
        return Object.freeze({ status: "unavailable" });
      }
      throw new PostgreSQLKnowledgeStoreError();
    } finally {
      client.release(destroy);
    }
  }

  public async get(
    identity: KnowledgeIdentity,
  ): Promise<KnowledgeStoreGetResult> {
    let encodedIdentity: Buffer;
    try {
      encodedIdentity = encodeOrionJsUtf16Be(identity);
    } catch {
      throw new PostgreSQLKnowledgeStoreError();
    }
    let client: PostgreSqlKnowledgeClient;
    try {
      client = await this.pool.connect();
    } catch {
      return Object.freeze({ status: "unavailable" });
    }
    let destroy = false;
    try {
      const result = await client.query(
        `SELECT ${SELECT_RECORD_COLUMNS}
           FROM knowledge.knowledge_record AS r
          WHERE r.knowledge_identity = $1`,
        [encodedIdentity],
      );
      if (result.rows.length === 0) {
        return Object.freeze({ status: "not-found" });
      }
      if (result.rows.length !== 1) throw new PostgreSQLKnowledgeStoreError();
      return Object.freeze({
        status: "found",
        record: recordFromRow(result.rows[0]!),
      });
    } catch (error: unknown) {
      if (error instanceof PostgreSQLKnowledgeStoreError) throw error;
      if (isOperationalPostgreSqlError(error)) {
        destroy = true;
        return Object.freeze({ status: "unavailable" });
      }
      throw new PostgreSQLKnowledgeStoreError();
    } finally {
      client.release(destroy);
    }
  }

  public async putIndependentAcceptedKnowledge(
    request: PutIndependentAcceptedKnowledgeRequest,
  ): Promise<PutIndependentAcceptedKnowledgeResult> {
    let accepted: PutIndependentAcceptedKnowledgeRequest;
    try {
      accepted = createPutIndependentAcceptedKnowledgeRequest(request);
    } catch {
      return Object.freeze({ status: "invalid-state" });
    }
    if (accepted.record.supersedesKnowledgeIdentity !== undefined) {
      return Object.freeze({ status: "invalid-state" });
    }
    let parameters: readonly unknown[];
    try {
      parameters = recordParameters(accepted.record);
    } catch {
      return Object.freeze({ status: "invalid-state" });
    }
    const result = await this.runTransaction(
      async (client) => {
        const acceptanceOrder = await allocateAcceptanceOrder(client);
        await client.query(INSERT_RECORD_SQL, parameters);
        await client.query(
          `INSERT INTO knowledge.knowledge_lifecycle
             (knowledge_identity, standing, acceptance_order)
           VALUES ($1, 'current', $2)`,
          [
            encodeOrionJsUtf16Be(accepted.record.knowledgeIdentity),
            acceptanceOrder,
          ],
        );
        return Object.freeze({
          status: "stored" as const,
          knowledgeIdentity: accepted.record.knowledgeIdentity,
          acceptanceOrder: knowledgeAcceptanceOrder(acceptanceOrder),
        });
      },
      (error) =>
        constraintName(error) === RECORD_IDENTITY_CONSTRAINT
          ? Object.freeze({ status: "duplicate" })
          : classifyMutationFailure(error),
    );
    return createPutIndependentAcceptedKnowledgeResult(result);
  }

  public async supersedeCurrentKnowledge(
    request: SupersedeCurrentKnowledgeRequest,
  ): Promise<SupersedeCurrentKnowledgeResult> {
    let supersession: SupersedeCurrentKnowledgeRequest;
    try {
      supersession = createSupersedeCurrentKnowledgeRequest(request);
    } catch {
      return Object.freeze({ status: "invalid-state" });
    }
    let successorParameters: readonly unknown[];
    try {
      successorParameters = recordParameters(supersession.successor);
    } catch {
      return Object.freeze({ status: "invalid-state" });
    }
    const result = await this.runTransaction(
      async (client) => {
        const predecessorIdentity = encodeOrionJsUtf16Be(
          supersession.expectedPredecessorKnowledgeIdentity,
        );
        const transition = await client.query(
          `UPDATE knowledge.knowledge_lifecycle AS lifecycle
              SET standing = 'superseded'
            WHERE lifecycle.knowledge_identity = $1
              AND lifecycle.standing = 'current'
              AND EXISTS (
                SELECT 1
                  FROM knowledge.knowledge_record AS record
                 WHERE record.knowledge_identity = lifecycle.knowledge_identity
                   AND record.version = $2
              )
          RETURNING lifecycle.knowledge_identity`,
          [predecessorIdentity, supersession.expectedPredecessorVersion],
        );
        if (transition.rowCount !== 1) {
          const classification = await client.query(
            `SELECT record.version, lifecycle.standing
               FROM knowledge.knowledge_record AS record
               LEFT JOIN knowledge.knowledge_lifecycle AS lifecycle
                 ON lifecycle.knowledge_identity = record.knowledge_identity
              WHERE record.knowledge_identity = $1`,
            [predecessorIdentity],
          );
          if (classification.rows.length === 0) {
            throw new KnownMutationResult({
              status: "predecessor-not-found",
            });
          }
          throw new KnownMutationResult({ status: "stale-predecessor" });
        }

        const acceptanceOrder = await allocateAcceptanceOrder(client);
        await client.query(INSERT_RECORD_SQL, successorParameters);
        await client.query(
          `INSERT INTO knowledge.knowledge_lifecycle
             (knowledge_identity, standing, acceptance_order)
           VALUES ($1, 'current', $2)`,
          [
            encodeOrionJsUtf16Be(supersession.successor.knowledgeIdentity),
            acceptanceOrder,
          ],
        );
        return Object.freeze({
          status: "superseded" as const,
          predecessorKnowledgeIdentity:
            supersession.expectedPredecessorKnowledgeIdentity,
          successorKnowledgeIdentity: supersession.successor.knowledgeIdentity,
          acceptanceOrder: knowledgeAcceptanceOrder(acceptanceOrder),
        });
      },
      (error) => {
        if (constraintName(error) === RECORD_IDENTITY_CONSTRAINT) {
          return Object.freeze({ status: "duplicate" });
        }
        if (constraintName(error) === ONE_SUCCESSOR_CONSTRAINT) {
          return Object.freeze({ status: "stale-predecessor" });
        }
        return classifyMutationFailure(error);
      },
    );
    return createSupersedeCurrentKnowledgeResult(result);
  }

  public async loadKnowledgeLifecycleSnapshot(): Promise<KnowledgeLifecycleSnapshotResult> {
    let client: PostgreSqlKnowledgeClient;
    try {
      client = await this.pool.connect();
    } catch {
      return Object.freeze({ status: "unavailable" });
    }
    let destroy = false;
    try {
      const result = await client.query(
        `SELECT ${SELECT_RECORD_COLUMNS}, lifecycle.standing,
                lifecycle.acceptance_order
           FROM knowledge.knowledge_lifecycle AS lifecycle
           LEFT JOIN knowledge.knowledge_record AS r
             ON r.knowledge_identity = lifecycle.knowledge_identity
          ORDER BY lifecycle.canonical_order ASC`,
      );
      const entries = result.rows.map((row) => {
        const record = recordFromRow(row);
        return createKnowledgeLifecycleSnapshotEntry({
          knowledgeIdentity: record.knowledgeIdentity,
          version: record.version,
          ...(record.supersedesKnowledgeIdentity === undefined
            ? {}
            : {
                predecessorKnowledgeIdentity:
                  record.supersedesKnowledgeIdentity,
              }),
          standing: row.standing,
          acceptanceOrder: row.acceptance_order,
        });
      });
      return Object.freeze({
        status: "loaded",
        snapshot: createKnowledgeLifecycleSnapshot({ entries }),
      });
    } catch (error: unknown) {
      if (isOperationalPostgreSqlError(error)) {
        destroy = true;
        return Object.freeze({ status: "unavailable" });
      }
      return Object.freeze({ status: "invalid-state" });
    } finally {
      client.release(destroy);
    }
  }

  private async runTransaction<Result>(
    operation: (client: PostgreSqlKnowledgeClient) => Promise<Result>,
    classify: (error: unknown) => MutationFailureResult | undefined,
  ): Promise<MutationResult<Result>> {
    let client: PostgreSqlKnowledgeClient;
    try {
      client = await this.pool.connect();
    } catch {
      return Object.freeze({ status: "unavailable" });
    }
    let began = false;
    let commitAttempted = false;
    let destroy = false;
    try {
      await client.query("BEGIN");
      began = true;
      const result = await operation(client);
      commitAttempted = true;
      await client.query("COMMIT");
      return result;
    } catch (error: unknown) {
      if (commitAttempted) {
        destroy = true;
        return Object.freeze({ status: "ambiguous" });
      }
      if (began) {
        try {
          await client.query("ROLLBACK");
        } catch {
          destroy = true;
        }
      }
      if (error instanceof KnownMutationResult) return error.result;
      const classified = classify(error);
      if (classified !== undefined) return classified;
      throw new PostgreSQLKnowledgeStoreError();
    } finally {
      client.release(destroy);
    }
  }
}

class KnownMutationResult extends Error {
  public constructor(public readonly result: MutationFailureResult) {
    super("Known PostgreSQL Knowledge mutation result.");
  }
}

export class PostgreSQLKnowledgeStoreError extends Error {
  public constructor() {
    super("PostgreSQL Knowledge Store operation failed.");
    this.name = "PostgreSQLKnowledgeStoreError";
  }
}

function classifyMutationFailure(
  error: unknown,
): MutationFailureResult | undefined {
  if (isOperationalPostgreSqlError(error)) {
    return Object.freeze({ status: "unavailable" });
  }
  const code = errorCode(error);
  if (code?.startsWith("23") === true) {
    return Object.freeze({ status: "invalid-state" });
  }
  return undefined;
}

function errorCode(error: unknown): string | undefined {
  if (typeof error !== "object" || error === null) return undefined;
  const value = Reflect.get(error, "code");
  return typeof value === "string" ? value : undefined;
}

function constraintName(error: unknown): string | undefined {
  if (typeof error !== "object" || error === null) return undefined;
  const value = Reflect.get(error, "constraint");
  return typeof value === "string" ? value : undefined;
}

function isOperationalPostgreSqlError(error: unknown): boolean {
  const code = errorCode(error);
  return (
    code?.startsWith("08") === true ||
    code === "53300" ||
    code === "53400" ||
    code === "57P01" ||
    code === "57P02" ||
    code === "57P03"
  );
}

async function allocateAcceptanceOrder(
  client: PostgreSqlKnowledgeClient,
): Promise<string> {
  const result = await client.query(
    `SELECT nextval('knowledge.knowledge_acceptance_order_seq')::text
            AS sequence_value`,
  );
  const value = result.rows[0]?.sequence_value;
  if (typeof value !== "string" || !/^[1-9][0-9]*$/.test(value)) {
    throw new PostgreSQLKnowledgeStoreError();
  }
  return `knowledge-acceptance-v1:${value}`;
}

function recordParameters(record: KnowledgeRecord): readonly unknown[] {
  const proposition = record.acceptedStructuredProposition;
  const ownership = proposition?.sourceOwnershipCorrespondence;
  return [
    encodeOrionJsUtf16Be(record.knowledgeIdentity),
    encodeOrionJsUtf16Be(record.claim),
    record.provenance.sourceType,
    encodeOrionJsUtf16Be(record.provenance.originatingCapability),
    record.provenance.observedAt,
    encodeOptional(record.provenance.sourceReference),
    record.acceptanceEvidence.method,
    encodeOrionJsUtf16Be(record.acceptanceEvidence.authorityIdentifier),
    encodeOrionJsUtf16Be(record.acceptanceEvidence.reason),
    record.acceptedAt,
    record.version,
    encodeOptional(record.supersedesKnowledgeIdentity),
    encodeOptional(proposition?.propositionIdentity),
    encodeOptional(proposition?.semanticValue.subjectKey),
    encodeOptional(proposition?.semanticValue.predicateKey),
    encodeOptional(proposition?.semanticValue.textualScalar),
    ownership?.currentnessOwner ?? null,
    ownership?.currentnessOwner === "external-source-currentness"
      ? encodeOrionJsUtf16Be(ownership.applicableOwner)
      : null,
    ownership?.currentnessOwner === "external-source-currentness"
      ? encodeOrionJsUtf16Be(ownership.propositionSourceRelationship)
      : null,
  ];
}

function recordFromRow(row: Record<string, unknown>): KnowledgeRecord {
  const propositionIdentity = decodeNullable(row.proposition_identity);
  const currentnessOwner = row.proposition_currentness_owner;
  const propositionOperands = [
    row.proposition_subject_key,
    row.proposition_predicate_key,
    row.proposition_textual_scalar,
    currentnessOwner,
    row.proposition_applicable_owner,
    row.proposition_source_relationship,
  ];
  if (
    propositionIdentity === undefined &&
    propositionOperands.some((value) => value !== null)
  ) {
    throw new PostgreSQLKnowledgeStoreError();
  }
  if (
    propositionIdentity !== undefined &&
    (row.proposition_subject_key === null ||
      row.proposition_predicate_key === null ||
      row.proposition_textual_scalar === null ||
      (currentnessOwner !== "knowledge-owned-currentness" &&
        currentnessOwner !== "external-source-currentness") ||
      (currentnessOwner === "knowledge-owned-currentness" &&
        (row.proposition_applicable_owner !== null ||
          row.proposition_source_relationship !== null)) ||
      (currentnessOwner === "external-source-currentness" &&
        (row.proposition_applicable_owner === null ||
          row.proposition_source_relationship === null)))
  ) {
    throw new PostgreSQLKnowledgeStoreError();
  }
  const proposition =
    propositionIdentity === undefined
      ? undefined
      : {
          propositionIdentity,
          semanticValue: {
            subjectKey: decodeRequired(row.proposition_subject_key),
            predicateKey: decodeRequired(row.proposition_predicate_key),
            textualScalar: decodeRequired(row.proposition_textual_scalar),
          },
          sourceOwnershipCorrespondence:
            currentnessOwner === "knowledge-owned-currentness"
              ? { currentnessOwner }
              : {
                  currentnessOwner,
                  applicableOwner: decodeRequired(
                    row.proposition_applicable_owner,
                  ),
                  propositionSourceRelationship: decodeRequired(
                    row.proposition_source_relationship,
                  ),
                },
        };
  return createKnowledgeRecord({
    knowledgeIdentity: decodeRequired(row.knowledge_identity),
    claim: decodeRequired(row.claim),
    provenance: {
      sourceType: row.provenance_source_type,
      originatingCapability: decodeRequired(
        row.provenance_originating_capability,
      ),
      observedAt: decodeTimestamp(row.provenance_observed_at),
      ...(row.provenance_source_reference === null
        ? {}
        : {
            sourceReference: decodeRequired(row.provenance_source_reference),
          }),
    },
    acceptanceEvidence: {
      method: row.acceptance_method,
      authorityIdentifier: decodeRequired(row.acceptance_authority_identifier),
      decision: "accept",
      reason: decodeRequired(row.acceptance_reason),
    },
    acceptedAt: decodeTimestamp(row.accepted_at),
    version: decodeVersion(row.version),
    ...(row.supersedes_knowledge_identity === null
      ? {}
      : {
          supersedesKnowledgeIdentity: decodeRequired(
            row.supersedes_knowledge_identity,
          ),
        }),
    ...(proposition === undefined
      ? {}
      : { acceptedStructuredProposition: proposition }),
  });
}

function decodeVersion(value: unknown): number {
  if (typeof value === "number") return value;
  if (typeof value === "string" && /^[1-9][0-9]*$/.test(value)) {
    return Number(value);
  }
  throw new PostgreSQLKnowledgeStoreError();
}

function decodeTimestamp(value: unknown): string {
  if (value instanceof Date && !Number.isNaN(value.valueOf())) {
    return value.toISOString();
  }
  if (typeof value === "string") return value;
  throw new PostgreSQLKnowledgeStoreError();
}

function encodeOptional(value: string | undefined): Buffer | null {
  return value === undefined ? null : encodeOrionJsUtf16Be(value);
}

function decodeNullable(value: unknown): string | undefined {
  return value === null ? undefined : decodeRequired(value);
}

function decodeRequired(value: unknown): string {
  if (!Buffer.isBuffer(value)) throw new PostgreSQLKnowledgeStoreError();
  return decodeOrionJsUtf16Be(value);
}

export function encodeOrionJsUtf16Be(value: string): Buffer {
  const encoded = Buffer.allocUnsafe(value.length * 2);
  for (let index = 0; index < value.length; index += 1) {
    encoded.writeUInt16BE(value.charCodeAt(index), index * 2);
  }
  return encoded;
}

export function decodeOrionJsUtf16Be(value: Uint8Array): string {
  if (value.byteLength === 0 || value.byteLength % 2 !== 0) {
    throw new PostgreSQLKnowledgeStoreError();
  }
  let decoded = "";
  for (let index = 0; index < value.byteLength; index += 2) {
    decoded += String.fromCharCode((value[index]! << 8) | value[index + 1]!);
  }
  return decoded;
}
