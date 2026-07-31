import {
  authorizationOperationIdentifier,
  type AllocateAuthorizationOperationIdentifier,
} from "@orion/core";

const EXHAUSTED_MESSAGE =
  "Process-local Brain operation identifier allocation is exhausted.";

export function createProcessLocalBrainOperationAllocator(): AllocateAuthorizationOperationIdentifier {
  let sequence = 0;

  return Object.freeze({
    allocateAuthorizationOperationIdentifier: () => {
      const next = sequence + 1;
      if (!Number.isSafeInteger(next) || next <= sequence)
        throw new RangeError(EXHAUSTED_MESSAGE);
      const identifier = authorizationOperationIdentifier(
        `brain-operation:${next}`,
      );
      sequence = next;
      return identifier;
    },
  });
}
