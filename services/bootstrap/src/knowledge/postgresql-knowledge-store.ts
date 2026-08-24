import type {
  KnowledgeIdentity,
  KnowledgeLifecycleSnapshotResult,
  KnowledgeRecord,
  KnowledgeStore,
  KnowledgeStoreGetResult,
  KnowledgeStorePutResult,
  PutIndependentAcceptedKnowledgeRequest,
  PutIndependentAcceptedKnowledgeResult,
  SupersedeCurrentKnowledgeRequest,
  SupersedeCurrentKnowledgeResult,
} from "@orion/core";
import type { Pool } from "pg";

import { PostgreSQLKnowledgeStoreRuntime } from "./postgresql-knowledge-store-internal.js";

export class PostgreSQLKnowledgeStore implements KnowledgeStore {
  readonly #runtime: PostgreSQLKnowledgeStoreRuntime;

  public constructor(pool: Pool) {
    this.#runtime = new PostgreSQLKnowledgeStoreRuntime(pool);
  }

  public put(record: KnowledgeRecord): Promise<KnowledgeStorePutResult> {
    return this.#runtime.put(record);
  }

  public get(identity: KnowledgeIdentity): Promise<KnowledgeStoreGetResult> {
    return this.#runtime.get(identity);
  }

  public putIndependentAcceptedKnowledge(
    request: PutIndependentAcceptedKnowledgeRequest,
  ): Promise<PutIndependentAcceptedKnowledgeResult> {
    return this.#runtime.putIndependentAcceptedKnowledge(request);
  }

  public supersedeCurrentKnowledge(
    request: SupersedeCurrentKnowledgeRequest,
  ): Promise<SupersedeCurrentKnowledgeResult> {
    return this.#runtime.supersedeCurrentKnowledge(request);
  }

  public loadKnowledgeLifecycleSnapshot(): Promise<KnowledgeLifecycleSnapshotResult> {
    return this.#runtime.loadKnowledgeLifecycleSnapshot();
  }
}
