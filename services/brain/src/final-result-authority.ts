import type {
  FinalCognitiveResult,
  VerifyFinalCognitiveResultRequest,
} from "@orion/core";

interface FinalResultSnapshot {
  readonly kind: FinalCognitiveResult["kind"];
  readonly requestId: FinalCognitiveResult["requestId"];
  readonly response?: unknown;
  readonly reason?: unknown;
  readonly operationId?: unknown;
  readonly result?: unknown;
  readonly skillId?: unknown;
  readonly skillVersion?: unknown;
  readonly capability?: unknown;
}

export class FinalResultAuthority {
  readonly #registry = new WeakMap<FinalCognitiveResult, FinalResultSnapshot>();

  public register(
    result: FinalCognitiveResult,
    skillExpected?: Readonly<{
      skillId: unknown;
      skillVersion: unknown;
      capability: unknown;
    }>,
  ): void {
    if (this.#registry.has(result)) throw new Error();
    const snapshot: FinalResultSnapshot =
      result.kind === "response"
        ? {
            kind: result.kind,
            requestId: result.requestId,
            response: result.response,
          }
        : result.kind === "request-more-context"
          ? {
              kind: result.kind,
              requestId: result.requestId,
              reason: result.reason,
            }
          : {
              kind: result.kind,
              requestId: result.requestId,
              operationId: result.operationId,
              result: result.result,
              skillId: skillExpected?.skillId,
              skillVersion: skillExpected?.skillVersion,
              capability: skillExpected?.capability,
            };
    this.#registry.set(result, snapshot);
  }

  public verify(request: VerifyFinalCognitiveResultRequest): boolean {
    try {
      if (!exactRecord(request, ["intent", "candidate", "expected"]))
        return false;
      const candidate = request.candidate;
      if (
        typeof candidate !== "object" ||
        candidate === null ||
        !this.#registry.has(candidate as FinalCognitiveResult)
      )
        return false;
      const snapshot = this.#registry.get(candidate as FinalCognitiveResult);
      if (snapshot === undefined) return false;
      const issued = candidate as FinalCognitiveResult;
      if (request.intent === "verify-final-cognitive-response") {
        return (
          exactRecord(request.expected, ["kind", "requestId", "response"]) &&
          snapshot.kind === "response" &&
          request.expected.kind === "response" &&
          request.expected.requestId === snapshot.requestId &&
          request.expected.response === snapshot.response &&
          exactResult(issued, ["status", "kind", "requestId", "response"]) &&
          issued.kind === "response" &&
          issued.status === "completed" &&
          issued.requestId === snapshot.requestId &&
          issued.response === snapshot.response
        );
      }
      if (request.intent === "verify-final-request-more-context") {
        return (
          exactRecord(request.expected, ["kind", "requestId", "reason"]) &&
          snapshot.kind === "request-more-context" &&
          request.expected.kind === "request-more-context" &&
          request.expected.requestId === snapshot.requestId &&
          request.expected.reason === snapshot.reason &&
          exactResult(issued, ["status", "kind", "requestId", "reason"]) &&
          issued.kind === "request-more-context" &&
          issued.status === "completed" &&
          issued.requestId === snapshot.requestId &&
          issued.reason === snapshot.reason
        );
      }
      if (request.intent !== "verify-final-skill-result") return false;
      return (
        exactRecord(request.expected, [
          "kind",
          "requestId",
          "operationId",
          "skillId",
          "skillVersion",
          "capability",
          "normalizedResult",
        ]) &&
        snapshot.kind === "skill-result" &&
        request.expected.kind === "skill-result" &&
        request.expected.requestId === snapshot.requestId &&
        request.expected.operationId === snapshot.operationId &&
        request.expected.skillId === snapshot.skillId &&
        request.expected.skillVersion === snapshot.skillVersion &&
        request.expected.capability === snapshot.capability &&
        request.expected.normalizedResult === snapshot.result &&
        exactResult(issued, [
          "status",
          "kind",
          "requestId",
          "operationId",
          "result",
        ]) &&
        issued.kind === "skill-result" &&
        issued.status === "completed" &&
        issued.requestId === snapshot.requestId &&
        issued.operationId === snapshot.operationId &&
        issued.result === snapshot.result
      );
    } catch {
      return false;
    }
  }
}

function exactRecord(value: unknown, fields: readonly string[]): boolean {
  if (typeof value !== "object" || value === null || Array.isArray(value))
    return false;
  const prototype = Reflect.getPrototypeOf(value);
  if (prototype !== Object.prototype && prototype !== null) return false;
  const keys = Reflect.ownKeys(value);
  if (
    keys.length !== fields.length ||
    keys.some((key) => typeof key !== "string" || !fields.includes(key))
  )
    return false;
  return fields.every((field) => {
    const descriptor = Reflect.getOwnPropertyDescriptor(value, field);
    return (
      descriptor !== undefined &&
      descriptor.enumerable === true &&
      "value" in descriptor &&
      descriptor.value !== undefined
    );
  });
}

function exactResult(value: object, fields: readonly string[]): boolean {
  return exactRecord(value, fields) && Object.isFrozen(value);
}
