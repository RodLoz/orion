import { authorizationOperationIdentifier } from "@orion/core";
import { afterEach, describe, expect, it, vi } from "vitest";
import { createProcessLocalBrainOperationAllocator } from "../src/brain/process-local-brain-operation-allocator.js";

afterEach(() => vi.restoreAllMocks());

describe("process-local Brain operation allocator", () => {
  it("returns valid monotonic identifiers without deriving from requests", () => {
    const allocator = createProcessLocalBrainOperationAllocator();
    const allocate = allocator.allocateAuthorizationOperationIdentifier;
    const first = allocate({
      intent: "allocate-authorization-operation",
      requestId: "secret-request",
      skillId: "secret-skill",
      skillVersion: "1.0.0",
      capability: "secret.capability",
    } as never);
    const second = allocate({ different: "request" } as never);

    expect(first).toBe(authorizationOperationIdentifier("brain-operation:1"));
    expect(second).toBe(authorizationOperationIdentifier("brain-operation:2"));
    expect(first).not.toBe(second);
    expect(`${first}${second}`).not.toMatch(/secret|request|skill|capability/);
  });

  it("never reuses identifiers across repeated calls", () => {
    const allocator = createProcessLocalBrainOperationAllocator();
    const allocated = Array.from({ length: 100 }, () =>
      allocator.allocateAuthorizationOperationIdentifier({} as never),
    );

    expect(new Set(allocated).size).toBe(allocated.length);
  });

  it("isolates scalar sequence state between allocator instances", () => {
    const first = createProcessLocalBrainOperationAllocator();
    const second = createProcessLocalBrainOperationAllocator();

    expect(first.allocateAuthorizationOperationIdentifier({} as never)).toBe(
      "brain-operation:1",
    );
    expect(first.allocateAuthorizationOperationIdentifier({} as never)).toBe(
      "brain-operation:2",
    );
    expect(second.allocateAuthorizationOperationIdentifier({} as never)).toBe(
      "brain-operation:1",
    );
  });

  it("fails closed when the next sequence is not a safe integer", () => {
    vi.spyOn(Number, "isSafeInteger").mockReturnValueOnce(false);
    const allocator = createProcessLocalBrainOperationAllocator();

    expect(() =>
      allocator.allocateAuthorizationOperationIdentifier({} as never),
    ).toThrow(RangeError);
  });

  it("exposes only a frozen receiver-free callable", () => {
    const allocator = createProcessLocalBrainOperationAllocator();
    const allocate = allocator.allocateAuthorizationOperationIdentifier;

    expect(Object.isFrozen(allocator)).toBe(true);
    expect(Reflect.ownKeys(allocator)).toEqual([
      "allocateAuthorizationOperationIdentifier",
    ]);
    expect(
      Object.getOwnPropertyDescriptor(
        allocator,
        "allocateAuthorizationOperationIdentifier",
      ),
    ).toMatchObject({ enumerable: true, writable: false });
    expect(allocate.call(undefined, {} as never)).toBe("brain-operation:1");
    expect(Object.values(allocator)).not.toContainEqual(
      expect.objectContaining({ engineState: expect.anything() }),
    );
  });
});
