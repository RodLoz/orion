import {
  InvalidContextLifecycleTransitionError,
  contextLifecycleState,
  type ContextLifecycleState,
} from "@orion/core";

const NEXT_STATE: Readonly<
  Partial<Record<ContextLifecycleState, ContextLifecycleState>>
> = Object.freeze({
  collecting: "composing",
  composing: "validating",
  validating: "active",
  active: "expired",
});

export class ContextRevisionLifecycle {
  #state: ContextLifecycleState = "collecting";

  public get state(): ContextLifecycleState {
    return this.#state;
  }

  public transition(target: unknown): void {
    let validatedTarget: ContextLifecycleState;
    try {
      validatedTarget = contextLifecycleState(target);
    } catch {
      throw new InvalidContextLifecycleTransitionError();
    }

    if (NEXT_STATE[this.#state] !== validatedTarget) {
      throw new InvalidContextLifecycleTransitionError();
    }

    this.#state = validatedTarget;
  }
}
