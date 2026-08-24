export type KnowledgeSettlementCompletion = () => void;

export interface KnowledgeSettlementCoordinator {
  admit(): KnowledgeSettlementCompletion;
  waitUntilSettled(): Promise<void>;
}

export class KnowledgeSettlementCoordinationError extends Error {
  public constructor() {
    super("Knowledge runtime settlement coordination failed.");
    this.name = "KnowledgeSettlementCoordinationError";
  }
}

class RuntimeKnowledgeSettlementCoordinator implements KnowledgeSettlementCoordinator {
  readonly #admissions = new Set<object>();
  readonly #waiters = new Set<{
    readonly resolve: () => void;
    readonly reject: (error: KnowledgeSettlementCoordinationError) => void;
  }>();
  #failure: KnowledgeSettlementCoordinationError | undefined;

  public admit(): KnowledgeSettlementCompletion {
    if (this.#failure !== undefined) throw this.#failure;
    const admission = Object.freeze({});
    this.#admissions.add(admission);
    let completed = false;
    return () => {
      if (completed || !this.#admissions.delete(admission)) {
        this.fail();
        return;
      }
      completed = true;
      if (this.#admissions.size === 0) this.resolveWaiters();
    };
  }

  public waitUntilSettled(): Promise<void> {
    if (this.#failure !== undefined) return Promise.reject(this.#failure);
    if (this.#admissions.size === 0) return Promise.resolve();
    return new Promise<void>((resolve, reject) => {
      this.#waiters.add({ resolve, reject });
    });
  }

  private fail(): void {
    if (this.#failure === undefined) {
      this.#failure = new KnowledgeSettlementCoordinationError();
    }
    for (const waiter of this.#waiters) waiter.reject(this.#failure);
    this.#waiters.clear();
  }

  private resolveWaiters(): void {
    for (const waiter of this.#waiters) waiter.resolve();
    this.#waiters.clear();
  }
}

export function createKnowledgeSettlementCoordinator(): KnowledgeSettlementCoordinator {
  return new RuntimeKnowledgeSettlementCoordinator();
}
