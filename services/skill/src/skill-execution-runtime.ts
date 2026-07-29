import {
  DuplicateSkillWorkflowAdmissionError,
  InvalidBoundSkillTargetInputError,
  InvalidGovernedAuthorizationEvaluationError,
  InvalidProtectedSkillInvocationInputError,
  InvalidSkillAuthorityError,
  InvalidSkillContextAuthorityError,
  InvalidSkillExecutionStateError,
  InvalidSkillSelectionInputError,
  InvalidSkillSelectionAuthorityError,
  InvalidSkillValidationResultError,
  InvalidSkillWorkflowAdmissionError,
  InvalidSkillWorkflowResultError,
  SkillAuthorizationEnforcementError,
  SkillInputValidationError,
  SkillValidatorBoundaryError,
  SkillWorkflowExecutionError,
  authorizationActionIdentifier,
  authorizationOperationIdentifier,
  authorizationResourceIdentifier,
  codePointOrder,
  createAuthorizationDecisionArtifact,
  createGovernedSecurityEvaluationSummary,
  createRegisteredSkill,
  skillCapabilityIdentifier,
  skillFailureModeIdentifier,
  skillIdentifier,
  type AdmittedSkillWorkflow,
  type AuthorizationResource,
  type BoundSkillInvocationTarget,
  type AuthorizationEvaluationOutcome,
  type AuthorizationEvaluationOutcomeAuthorityPort,
  type NormalizedSkillExecutionResult,
  type RegisteredSkill,
  type SkillBinding,
  type SkillCapabilityIdentifier,
  type SkillExecutionContextAuthorityPort,
  type SkillExecutionContextProjection,
  type SkillIdentifier,
  type SkillInvocationData,
  type SkillInvocationLifecycleEvent,
  type SkillInvocationLifecycleObserver,
  type SkillInvocationLifecycleState,
  type SkillInvocationLifecycleTransitionCategory,
  type SkillInvocationRequirementsAuthorityPort,
  type SkillInvocationRequirementsProjection,
  type SkillInvocationSensitivityAuthorityPort,
  type SkillSelectionResult,
  type SkillValidatorContractImplementation,
  type SkillWorkflowContractImplementation,
  type VerifyNormalizedSkillExecutionResult,
} from "@orion/core";

export interface SkillExecutionConfiguration {
  readonly context: SkillExecutionContextAuthorityPort;
  readonly sensitivity: SkillInvocationSensitivityAuthorityPort;
  readonly requirements: SkillInvocationRequirementsAuthorityPort;
  readonly authorization: AuthorizationEvaluationOutcomeAuthorityPort;
  readonly lifecycleObserver?: SkillInvocationLifecycleObserver;
}

interface AdmissionPrivate {
  readonly validator: SkillValidatorContractImplementation;
  readonly workflow: SkillWorkflowContractImplementation;
}
interface AuthorityExpected {
  readonly operationId: string;
  readonly skillId: string;
  readonly skillVersion: string;
  readonly capability: string;
}

const POLICY = Object.freeze({
  id: "orion.minimum-skill-selection" as const,
  version: "1.0.0" as const,
});
class ConstructedStateFailure extends Error {}
function freezeConstructed<T extends object>(value: T): Readonly<T> {
  try {
    return Object.freeze(value);
  } catch {
    throw new ConstructedStateFailure();
  }
}
const functionToString = Function.prototype.toString;
const asyncPrototype = Object.getPrototypeOf(async function () {});
const generatorPrototype = Object.getPrototypeOf(function* () {});
const asyncGeneratorPrototype = Object.getPrototypeOf(async function* () {});

export class SkillExecutionRuntime {
  readonly #admissions = new Map<string, AdmittedSkillWorkflow>();
  readonly #admissionAuthority = new WeakSet<object>();
  readonly #admissionPrivate = new WeakMap<object, AdmissionPrivate>();
  readonly #bindingAuthority = new WeakSet<object>();
  readonly #bindingAdmission = new WeakMap<object, AdmittedSkillWorkflow>();
  readonly #targetAuthority = new WeakSet<object>();
  readonly #targetBinding = new WeakMap<object, SkillBinding>();
  readonly #resultAuthority = new WeakSet<object>();
  readonly #resultExpected = new WeakMap<object, AuthorityExpected>();
  readonly #configuration: SkillExecutionConfiguration | undefined;

  public constructor(
    private readonly catalog: () => ReadonlyMap<
      SkillIdentifier,
      RegisteredSkill
    >,
    configuration?: SkillExecutionConfiguration,
  ) {
    this.#configuration = captureConfiguration(configuration);
  }

  public validateState(): void {
    try {
      for (const [key, admission] of this.#admissions) {
        if (
          !this.#admissionAuthority.has(admission) ||
          this.#admissionPrivate.get(admission) === undefined ||
          key !== admissionKey(admission.skillId, admission.skillVersion)
        )
          throw new Error();
        const registered = this.catalog().get(admission.skillId);
        if (
          registered === undefined ||
          registered.version !== admission.skillVersion ||
          admission.supportedCapabilities.some(
            (capability) => !registered.capabilities.includes(capability),
          )
        )
          throw new Error();
      }
    } catch {
      throw new InvalidSkillExecutionStateError();
    }
  }

  public admit(request: unknown): AdmittedSkillWorkflow {
    let source: Record<string, unknown>;
    try {
      source = exactDataRecord(request, [
        "intent",
        "skillId",
        "supportedCapabilities",
        "validator",
        "workflow",
      ]);
      if (source.intent !== "admit-skill-workflow") throw new Error();
    } catch {
      throw new InvalidSkillWorkflowAdmissionError();
    }
    let id: SkillIdentifier;
    try {
      id = skillIdentifier(source.skillId);
    } catch {
      throw new InvalidSkillWorkflowAdmissionError();
    }
    const registered = this.catalog().get(id);
    if (registered === undefined)
      throw new InvalidSkillWorkflowAdmissionError();
    try {
      validateCallable(source.validator);
      validateCallable(source.workflow);
    } catch {
      throw new InvalidSkillWorkflowAdmissionError();
    }
    let capabilities: readonly SkillCapabilityIdentifier[];
    try {
      capabilities = canonicalIdentifiers(
        source.supportedCapabilities,
        skillCapabilityIdentifier,
        1,
        64,
      );
      if (
        capabilities.some(
          (capability) => !registered.capabilities.includes(capability),
        )
      )
        throw new Error();
    } catch {
      throw new InvalidSkillWorkflowAdmissionError();
    }
    const key = admissionKey(id, registered.version);
    if (this.#admissions.has(key))
      throw new DuplicateSkillWorkflowAdmissionError();
    try {
      const admitted = Object.freeze({
        skillId: id,
        skillVersion: registered.version,
        supportedCapabilities: capabilities,
      });
      this.#admissionAuthority.add(admitted);
      this.#admissionPrivate.set(admitted, {
        validator: source.validator as SkillValidatorContractImplementation,
        workflow: source.workflow as SkillWorkflowContractImplementation,
      });
      this.#admissions.set(key, admitted);
      return admitted;
    } catch {
      throw new InvalidSkillExecutionStateError();
    }
  }

  public select(request: unknown): SkillSelectionResult {
    let capability: SkillCapabilityIdentifier;
    try {
      const source = exactDataRecord(request, ["intent", "capability"]);
      if (source.intent !== "select-skill") throw new Error();
      capability = skillCapabilityIdentifier(source.capability);
    } catch {
      throw new InvalidSkillSelectionInputError();
    }
    let candidates: RegisteredSkill[];
    try {
      candidates = [...this.catalog().values()]
        .filter((registered) => {
          const admitted = this.#admissions.get(
            admissionKey(registered.id, registered.version),
          );
          return (
            registered.capabilities.includes(capability) &&
            admitted !== undefined &&
            this.#admissionAuthority.has(admitted) &&
            admitted.supportedCapabilities.includes(capability)
          );
        })
        .sort((left, right) => codePointOrder(left.id, right.id));
    } catch {
      throw new InvalidSkillSelectionAuthorityError();
    }
    if (candidates.length === 0)
      return Object.freeze({
        status: "unavailable",
        policy: POLICY,
        capability,
        reason: "no-invocation-eligible-skill",
      });
    const registered = candidates[0]!;
    try {
      const binding = Object.freeze({
        capability,
        registeredSkill: createRegisteredSkill(registered),
      });
      const admitted = this.#admissions.get(
        admissionKey(registered.id, registered.version),
      );
      if (admitted === undefined) throw new Error();
      this.#bindingAuthority.add(binding);
      this.#bindingAdmission.set(binding, admitted);
      return Object.freeze({ status: "selected", policy: POLICY, binding });
    } catch {
      throw new InvalidSkillExecutionStateError();
    }
  }

  public bind(request: unknown): BoundSkillInvocationTarget {
    let operationId;
    let binding: unknown;
    try {
      const source = exactDataRecord(request, [
        "intent",
        "operationId",
        "binding",
      ]);
      if (source.intent !== "bind-skill-to-operation") throw new Error();
      operationId = authorizationOperationIdentifier(source.operationId);
      binding = source.binding;
    } catch {
      throw new InvalidBoundSkillTargetInputError();
    }
    let bindingAuthorized = false;
    try {
      bindingAuthorized =
        isObject(binding) &&
        this.#bindingAuthority.has(binding) &&
        this.#bindingAdmission.get(binding) !== undefined;
    } catch {
      throw new InvalidSkillExecutionStateError();
    }
    if (!bindingAuthorized) throw new InvalidSkillAuthorityError();
    const governed = binding as SkillBinding;
    try {
      const registered = createRegisteredSkill(governed.registeredSkill);
      const current = this.catalog().get(registered.id);
      const admitted = this.#bindingAdmission.get(governed)!;
      if (
        current === undefined ||
        current.version !== registered.version ||
        governed.capability !==
          admitted.supportedCapabilities.find(
            (value) => value === governed.capability,
          )
      )
        throw new InvalidSkillAuthorityError();
      const target = Object.freeze({
        operationId,
        skillId: registered.id,
        skillVersion: registered.version,
        capability: governed.capability,
        action: authorizationActionIdentifier("skill.invoke"),
        resource: Object.freeze({
          kind: "identified" as const,
          resourceId: authorizationResourceIdentifier(`skill:${registered.id}`),
        }),
        requiredPermissions: registered.permissions,
        inputNames: registered.inputs,
        outputNames: registered.outputs,
        failureModes: registered.failureModes,
      });
      this.#targetAuthority.add(target);
      this.#targetBinding.set(target, governed);
      return target;
    } catch (error) {
      if (error instanceof InvalidSkillAuthorityError) throw error;
      throw new InvalidSkillExecutionStateError();
    }
  }

  public resolveContext(request: unknown): unknown {
    const config = this.requireConfiguration();
    let operationId;
    let contextRevision;
    try {
      const source = exactDataRecord(request, [
        "intent",
        "operationId",
        "contextRevision",
      ]);
      if (source.intent !== "resolve-skill-execution-context")
        throw new Error();
      operationId = authorizationOperationIdentifier(source.operationId);
      contextRevision = source.contextRevision;
    } catch {
      throw new InvalidSkillContextAuthorityError();
    }
    let candidate: unknown;
    try {
      candidate = config.context.resolve({
        intent: "resolve-skill-execution-context",
        operationId,
        contextRevision: contextRevision as never,
      });
    } catch {
      throw new InvalidSkillExecutionStateError();
    }
    if (
      !verifyExternal(() => config.context.verify(candidate, { operationId }))
    )
      throw new InvalidSkillContextAuthorityError();
    validateContextProjection(candidate, operationId);
    return candidate;
  }

  public resolveSensitivity(request: unknown): unknown {
    const config = this.requireConfiguration();
    let action;
    let resource;
    try {
      const source = exactDataRecord(request, ["intent", "action", "resource"]);
      if (source.intent !== "resolve-skill-invocation-sensitivity")
        throw new Error();
      action = authorizationActionIdentifier(source.action);
      resource = canonicalResource(source.resource);
    } catch {
      throw new InvalidSkillAuthorityError();
    }
    let candidate: unknown;
    try {
      candidate = config.sensitivity.resolve({
        intent: "resolve-skill-invocation-sensitivity",
        action,
        resource,
      });
    } catch {
      throw new InvalidSkillExecutionStateError();
    }
    if (
      !verifyExternal(() =>
        config.sensitivity.verify(candidate, { action, resource }),
      )
    )
      throw new InvalidSkillAuthorityError();
    validateSensitivity(candidate);
    return candidate;
  }

  public resolveRequirements(request: unknown): unknown {
    const config = this.requireConfiguration();
    let target: unknown;
    try {
      const source = exactDataRecord(request, ["intent", "target"]);
      if (source.intent !== "resolve-skill-invocation-requirements")
        throw new Error();
      target = source.target;
    } catch {
      throw new InvalidSkillAuthorityError();
    }
    if (!this.isTarget(target)) throw new InvalidSkillAuthorityError();
    const governed = target as BoundSkillInvocationTarget;
    let candidate: unknown;
    try {
      candidate = config.requirements.resolve({
        intent: "resolve-skill-invocation-requirements",
        target: governed,
      });
    } catch {
      throw new InvalidSkillExecutionStateError();
    }
    if (
      !verifyExternal(() =>
        config.requirements.verify(candidate, {
          operationId: governed.operationId,
          action: governed.action,
          resource: governed.resource,
        }),
      )
    )
      throw new InvalidSkillAuthorityError();
    validateRequirements(candidate, governed);
    return candidate;
  }

  public resolveAuthorization(request: unknown): unknown {
    const config = this.requireConfiguration();
    let nested: {
      intent: "evaluate-authorization-outcome";
      operationId: ReturnType<typeof authorizationOperationIdentifier>;
      action: ReturnType<typeof authorizationActionIdentifier>;
      resource: AuthorizationResource;
    };
    try {
      const outer = exactDataRecord(request, ["intent", "request"]);
      if (outer.intent !== "resolve-governed-authorization-evaluation")
        throw new Error();
      const source = exactDataRecord(outer.request, [
        "intent",
        "operationId",
        "action",
        "resource",
      ]);
      if (source.intent !== "evaluate-authorization-outcome") throw new Error();
      nested = {
        intent: "evaluate-authorization-outcome",
        operationId: authorizationOperationIdentifier(source.operationId),
        action: authorizationActionIdentifier(source.action),
        resource: canonicalResource(source.resource),
      };
    } catch {
      throw new InvalidGovernedAuthorizationEvaluationError();
    }
    let candidate: unknown;
    try {
      candidate = config.authorization.resolve({
        intent: "resolve-governed-authorization-evaluation",
        request: nested,
      });
    } catch {
      throw new InvalidSkillExecutionStateError();
    }
    if (
      !verifyOutcome(() =>
        config.authorization.verifyAuthorizationEvaluationOutcome({
          intent: "verify-authorization-evaluation-outcome",
          outcome: candidate,
          operationId: nested.operationId,
        }),
      )
    )
      throw new InvalidGovernedAuthorizationEvaluationError();
    validateGovernedEvaluation(candidate, nested.operationId);
    return candidate;
  }

  public invoke(request: unknown): NormalizedSkillExecutionResult {
    const config = this.requireConfiguration();
    let source: Record<string, unknown>;
    let operationId;
    try {
      source = exactDataRecord(request, [
        "intent",
        "operationId",
        "target",
        "requirements",
        "inputs",
        "context",
        "authorizationEvaluation",
      ]);
      if (source.intent !== "invoke-bound-skill") throw new Error();
      operationId = authorizationOperationIdentifier(source.operationId);
    } catch {
      throw new InvalidProtectedSkillInvocationInputError();
    }
    const lifecycle = new Lifecycle(config.lifecycleObserver);
    lifecycle.move("proposed", "invocation-proposed");
    const reject = (error: Error): never => {
      lifecycle.move("rejected", "pre-execution-rejected");
      throw error;
    };
    if (!this.isTarget(source.target)) reject(new InvalidSkillAuthorityError());
    const target = source.target as BoundSkillInvocationTarget;
    const binding = this.#targetBinding.get(target)!;
    const admitted = this.#bindingAdmission.get(binding);
    if (admitted === undefined) reject(new InvalidSkillAuthorityError());
    if (
      !this.#admissionAuthority.has(admitted!) ||
      target.operationId !== operationId
    )
      reject(new InvalidSkillAuthorityError());
    let contextVerified = false;
    try {
      contextVerified = verifyExternal(() =>
        config.context.verify(source.context, { operationId }),
      );
    } catch {
      reject(new InvalidSkillExecutionStateError());
    }
    if (!contextVerified) reject(new InvalidSkillContextAuthorityError());
    let context!: SkillExecutionContextProjection;
    try {
      context = validateContextProjection(source.context, operationId);
    } catch {
      reject(new InvalidSkillContextAuthorityError());
    }
    let requirementsVerified = false;
    try {
      requirementsVerified = verifyExternal(() =>
        config.requirements.verify(source.requirements, {
          operationId,
          action: target.action,
          resource: target.resource,
        }),
      );
    } catch {
      reject(new InvalidSkillExecutionStateError());
    }
    if (!requirementsVerified) reject(new InvalidSkillAuthorityError());
    let requirements!: SkillInvocationRequirementsProjection;
    try {
      requirements = validateRequirements(source.requirements);
    } catch {
      reject(new InvalidSkillAuthorityError());
    }
    let authorizedOutcome = false;
    try {
      authorizedOutcome = verifyOutcome(() =>
        config.authorization.verifyAuthorizationEvaluationOutcome({
          intent: "verify-authorization-evaluation-outcome",
          outcome: source.authorizationEvaluation,
          operationId,
        }),
      );
    } catch {
      reject(new InvalidSkillExecutionStateError());
    }
    if (!authorizedOutcome)
      reject(new InvalidGovernedAuthorizationEvaluationError());
    let evaluation!: AuthorizationEvaluationOutcome;
    try {
      evaluation = validateGovernedEvaluation(source.authorizationEvaluation);
    } catch {
      reject(new InvalidGovernedAuthorizationEvaluationError());
    }
    lifecycle.move("admitted", "authority-admitted");
    if (!authorizationMatches(evaluation, target, requirements, context))
      reject(new SkillAuthorizationEnforcementError());
    lifecycle.move("authorized", "authorization-accepted");
    let inputs!: SkillInvocationData;
    try {
      inputs = canonicalScalarRecord(source.inputs, target.inputNames);
    } catch {
      reject(new InvalidProtectedSkillInvocationInputError());
    }
    let argument;
    try {
      argument = freezeConstructed({
        operationId,
        capability: target.capability,
        inputs,
        context,
      });
    } catch {
      reject(new InvalidSkillExecutionStateError());
    }
    const callables = this.#admissionPrivate.get(admitted!);
    if (callables === undefined) reject(new InvalidSkillExecutionStateError());
    let validation: unknown;
    try {
      validation = Reflect.apply(callables!.validator, undefined, [argument]);
    } catch {
      reject(new SkillValidatorBoundaryError());
    }
    let validationStatus!: string;
    try {
      validationStatus = exactStatus(validation, ["accepted", "rejected"]);
    } catch {
      reject(new InvalidSkillValidationResultError());
    }
    if (validationStatus === "rejected")
      reject(new SkillInputValidationError());
    lifecycle.move("input-validated", "input-accepted");
    lifecycle.move("executing", "workflow-started");
    let raw: unknown;
    try {
      raw = Reflect.apply(callables!.workflow, undefined, [argument]);
    } catch {
      lifecycle.move("failed", "execution-failed");
      throw new SkillWorkflowExecutionError();
    }
    try {
      const result = normalizeWorkflowResult(raw, target);
      this.#resultAuthority.add(result);
      this.#resultExpected.set(result, {
        operationId,
        skillId: target.skillId,
        skillVersion: target.skillVersion,
        capability: target.capability,
      });
      lifecycle.move(
        result.status === "succeeded" ? "succeeded" : "failed",
        result.status === "succeeded"
          ? "execution-succeeded"
          : "business-failed",
      );
      return result;
    } catch (error) {
      lifecycle.move("failed", "execution-failed");
      if (error instanceof InvalidSkillWorkflowResultError) throw error;
      throw new InvalidSkillExecutionStateError();
    }
  }

  public readonly resultVerifier: VerifyNormalizedSkillExecutionResult =
    Object.freeze({
      verify: (candidate: unknown, expected: AuthorityExpected): boolean => {
        try {
          if (!isObject(candidate) || !this.#resultAuthority.has(candidate))
            return false;
          const actual = this.#resultExpected.get(candidate);
          return (
            actual !== undefined &&
            actual.operationId === expected.operationId &&
            actual.skillId === expected.skillId &&
            actual.skillVersion === expected.skillVersion &&
            actual.capability === expected.capability
          );
        } catch {
          return false;
        }
      },
    });

  public verifyTarget(candidate: unknown): boolean {
    return this.isTarget(candidate);
  }

  private requireConfiguration(): SkillExecutionConfiguration {
    if (this.#configuration === undefined)
      throw new InvalidSkillExecutionStateError();
    return this.#configuration;
  }

  private isTarget(value: unknown): value is BoundSkillInvocationTarget {
    return (
      isObject(value) &&
      this.#targetAuthority.has(value) &&
      this.#targetBinding.has(value)
    );
  }
}

function captureConfiguration(
  configuration: SkillExecutionConfiguration | undefined,
): SkillExecutionConfiguration | undefined {
  if (configuration === undefined) return undefined;
  try {
    const keys = Reflect.ownKeys(configuration);
    const required = [
      "context",
      "sensitivity",
      "requirements",
      "authorization",
    ];
    if (
      keys.some((key) => typeof key !== "string") ||
      !required.every((key) => keys.includes(key)) ||
      keys.some(
        (key) =>
          !required.includes(key as string) && key !== "lifecycleObserver",
      ) ||
      (keys.length !== 4 && keys.length !== 5)
    )
      throw new Error();
    const read = (key: string): unknown => {
      const descriptor = Reflect.getOwnPropertyDescriptor(configuration, key);
      if (
        descriptor === undefined ||
        descriptor.enumerable !== true ||
        !("value" in descriptor) ||
        descriptor.value === undefined
      )
        throw new Error();
      return descriptor.value;
    };
    const capturePort = (
      candidate: unknown,
    ): { resolve: never; verify: never } => {
      if (!isObject(candidate) || Array.isArray(candidate)) throw new Error();
      const candidatePrototype = Reflect.getPrototypeOf(candidate);
      if (
        candidatePrototype !== Object.prototype &&
        candidatePrototype !== null
      )
        throw new Error();
      const source = exactDataRecord(candidate, ["resolve", "verify"]);
      const resolve = source.resolve;
      const verify = source.verify;
      if (typeof resolve !== "function" || typeof verify !== "function")
        throw new Error();
      return Object.freeze({
        resolve: ((request: unknown) =>
          Reflect.apply(resolve, undefined, [request])) as never,
        verify: ((candidate: unknown, expected: unknown) =>
          Reflect.apply(verify, undefined, [candidate, expected])) as never,
      });
    };
    const context = capturePort(read("context"));
    const sensitivity = capturePort(read("sensitivity"));
    const requirements = capturePort(read("requirements"));
    const authorizationCandidate = read("authorization");
    if (
      !isObject(authorizationCandidate) ||
      Array.isArray(authorizationCandidate)
    )
      throw new Error();
    const authorizationPrototype = Reflect.getPrototypeOf(
      authorizationCandidate,
    );
    if (
      authorizationPrototype !== Object.prototype &&
      authorizationPrototype !== null
    )
      throw new Error();
    const authorizationSource = exactDataRecord(authorizationCandidate, [
      "resolve",
      "verifyAuthorizationEvaluationOutcome",
    ]);
    if (
      typeof authorizationSource.resolve !== "function" ||
      typeof authorizationSource.verifyAuthorizationEvaluationOutcome !==
        "function"
    )
      throw new Error();
    const resolveAuthorization = authorizationSource.resolve;
    const verifyAuthorization =
      authorizationSource.verifyAuthorizationEvaluationOutcome;
    const authorization = Object.freeze({
      resolve: (request: unknown) =>
        Reflect.apply(resolveAuthorization, undefined, [request]),
      verifyAuthorizationEvaluationOutcome: (request: unknown) =>
        Reflect.apply(verifyAuthorization, undefined, [request]),
    }) as AuthorizationEvaluationOutcomeAuthorityPort;
    let lifecycleObserver: SkillInvocationLifecycleObserver | undefined;
    if (keys.includes("lifecycleObserver")) {
      lifecycleObserver = read(
        "lifecycleObserver",
      ) as SkillInvocationLifecycleObserver;
      if (typeof lifecycleObserver !== "function") throw new Error();
      const observer = lifecycleObserver;
      lifecycleObserver = (event) =>
        Reflect.apply(observer, undefined, [event]);
    }
    return Object.freeze({
      context,
      sensitivity,
      requirements,
      authorization,
      ...(lifecycleObserver === undefined ? {} : { lifecycleObserver }),
    }) as SkillExecutionConfiguration;
  } catch {
    throw new InvalidSkillExecutionStateError();
  }
}

class Lifecycle {
  #sequence = 0;
  #state: "none" | SkillInvocationLifecycleState = "none";
  public constructor(
    private readonly observer?: SkillInvocationLifecycleObserver,
  ) {}
  public move(
    to: SkillInvocationLifecycleState,
    category: SkillInvocationLifecycleTransitionCategory,
  ): void {
    const event: SkillInvocationLifecycleEvent = Object.freeze({
      sequence: ++this.#sequence,
      from: this.#state,
      to,
      category,
    });
    this.#state = to;
    if (this.observer)
      try {
        Reflect.apply(this.observer, undefined, [event]);
      } catch {
        // Diagnostic observers are non-authoritative.
      }
  }
}

function admissionKey(id: string, version: string): string {
  return `${id}\u0000${version}`;
}
function isObject(value: unknown): value is object {
  return typeof value === "object" && value !== null;
}
function exactDataRecord(
  value: unknown,
  fields: readonly string[],
): Record<string, unknown> {
  if (!isObject(value) || Array.isArray(value)) throw new Error();
  const prototype = Reflect.getPrototypeOf(value);
  if (prototype !== Object.prototype && prototype !== null) throw new Error();
  const keys = Reflect.ownKeys(value);
  if (
    keys.length !== fields.length ||
    keys.some((key) => typeof key !== "string" || !fields.includes(key))
  )
    throw new Error();
  const out: Record<string, unknown> = Object.create(null);
  for (const field of fields) {
    const descriptor = Reflect.getOwnPropertyDescriptor(value, field);
    if (
      descriptor === undefined ||
      descriptor.enumerable !== true ||
      !("value" in descriptor) ||
      descriptor.value === undefined
    )
      throw new Error();
    out[field] = descriptor.value;
  }
  return out;
}
function exactArray(
  value: unknown,
  minimum: number,
  maximum: number,
): unknown[] {
  if (
    !Array.isArray(value) ||
    Reflect.getPrototypeOf(value) !== Array.prototype
  )
    throw new Error();
  const keys = Reflect.ownKeys(value);
  const rawLength = Reflect.getOwnPropertyDescriptor(value, "length")?.value;
  if (
    !Number.isSafeInteger(rawLength) ||
    (rawLength as number) < minimum ||
    (rawLength as number) > maximum ||
    keys.length !== (rawLength as number) + 1
  )
    throw new Error();
  const length = rawLength as number;
  const result: unknown[] = [];
  for (let index = 0; index < length; index += 1) {
    const descriptor = Reflect.getOwnPropertyDescriptor(value, String(index));
    if (
      descriptor === undefined ||
      descriptor.enumerable !== true ||
      !("value" in descriptor)
    )
      throw new Error();
    result.push(descriptor.value);
  }
  return result;
}
function canonicalIdentifiers<T extends string>(
  value: unknown,
  factory: (value: unknown) => T,
  minimum: number,
  maximum: number,
): readonly T[] {
  const result = exactArray(value, minimum, maximum).map(factory);
  if (new Set(result).size !== result.length) throw new Error();
  result.sort(codePointOrder);
  return Object.freeze(result);
}
function validateCallable(
  candidate: unknown,
): asserts candidate is (...arguments_: never[]) => unknown {
  if (typeof candidate !== "function") throw new Error();
  const prototype = Reflect.getPrototypeOf(candidate);
  if (
    prototype === asyncPrototype ||
    prototype === generatorPrototype ||
    prototype === asyncGeneratorPrototype ||
    /^class(?:\s|\{)/.test(Reflect.apply(functionToString, candidate, []))
  )
    throw new Error();
}
function canonicalResource(value: unknown): AuthorizationResource {
  const source = exactDataRecord(
    value,
    isObject(value) &&
      Reflect.getOwnPropertyDescriptor(value, "kind")?.value === "unscoped"
      ? ["kind"]
      : ["kind", "resourceId"],
  );
  if (source.kind === "unscoped") return Object.freeze({ kind: "unscoped" });
  if (source.kind !== "identified") throw new Error();
  return Object.freeze({
    kind: "identified",
    resourceId: authorizationResourceIdentifier(source.resourceId),
  });
}
function sameResource(
  left: AuthorizationResource,
  right: AuthorizationResource,
) {
  return (
    left.kind === right.kind &&
    (left.kind === "unscoped" ||
      (right.kind === "identified" && left.resourceId === right.resourceId))
  );
}
function verifyExternal(operation: () => unknown): boolean {
  let result: unknown;
  try {
    result = operation();
  } catch {
    throw new InvalidSkillExecutionStateError();
  }
  if (typeof result !== "boolean") throw new InvalidSkillExecutionStateError();
  return result;
}

const verifyOutcome = verifyExternal;
function validateContextProjection(
  value: unknown,
  operationId: string,
): SkillExecutionContextProjection {
  const source = exactDataRecord(value, [
    "operationId",
    "lineageId",
    "revisionId",
    "subject",
  ]);
  if (
    source.operationId !== operationId ||
    typeof source.lineageId !== "string" ||
    typeof source.revisionId !== "string"
  )
    throw new Error();
  const subject = exactDataRecord(
    source.subject,
    isObject(source.subject) &&
      Reflect.getOwnPropertyDescriptor(source.subject, "kind")?.value ===
        "anonymous"
      ? ["kind"]
      : ["kind", "identityId"],
  );
  if (
    subject.kind !== "anonymous" &&
    (subject.kind !== "authenticated" || typeof subject.identityId !== "string")
  )
    throw new Error();
  return value as SkillExecutionContextProjection;
}
function validateSensitivity(value: unknown): void {
  const status = exactDataRecord(
    value,
    isObject(value) &&
      Reflect.getOwnPropertyDescriptor(value, "status")?.value === "unavailable"
      ? ["status"]
      : ["status", "sensitivity"],
  );
  if (
    status.status !== "unavailable" &&
    (status.status !== "available" ||
      (status.sensitivity !== "standard" && status.sensitivity !== "sensitive"))
  )
    throw new InvalidSkillAuthorityError();
}
function validateRequirements(
  value: unknown,
  target?: BoundSkillInvocationTarget,
): SkillInvocationRequirementsProjection {
  const outer = exactDataRecord(
    value,
    isObject(value) &&
      Reflect.getOwnPropertyDescriptor(value, "status")?.value === "available"
      ? ["status", "requirements"]
      : ["status", "operationId", "action", "resource"],
  );
  if (outer.status === "unavailable") {
    if (
      authorizationOperationIdentifier(outer.operationId) !==
        outer.operationId ||
      authorizationActionIdentifier(outer.action) !== outer.action
    )
      throw new Error();
    const unavailableResource = canonicalResource(outer.resource);
    if (
      target !== undefined &&
      (outer.operationId !== target.operationId ||
        outer.action !== target.action ||
        !sameResource(unavailableResource, target.resource))
    )
      throw new Error();
    return value as SkillInvocationRequirementsProjection;
  }
  if (outer.status !== "available") throw new Error();
  const requirements = exactDataRecord(outer.requirements, [
    "operationId",
    "action",
    "resource",
    "requiredPermissions",
    "sensitivity",
  ]);
  const permissions = canonicalIdentifiers(
    requirements.requiredPermissions,
    (item) => {
      if (typeof item !== "string") throw new Error();
      return item;
    },
    0,
    64,
  );
  if (
    authorizationOperationIdentifier(requirements.operationId) !==
      requirements.operationId ||
    authorizationActionIdentifier(requirements.action) !==
      requirements.action ||
    (requirements.sensitivity !== "standard" &&
      requirements.sensitivity !== "sensitive")
  )
    throw new Error();
  const governedResource = canonicalResource(requirements.resource);
  if (
    target !== undefined &&
    (requirements.operationId !== target.operationId ||
      requirements.action !== target.action ||
      !sameResource(governedResource, target.resource) ||
      permissions.length !== target.requiredPermissions.length ||
      permissions.some(
        (permission, index) => permission !== target.requiredPermissions[index],
      ))
  )
    throw new Error();
  return value as SkillInvocationRequirementsProjection;
}
function validateGovernedEvaluation(
  value: unknown,
  operationId?: string,
): AuthorizationEvaluationOutcome {
  const source = exactDataRecord(value, [
    "authorization",
    "securityEvaluationSummary",
  ]);
  const authorization = createAuthorizationDecisionArtifact(
    source.authorization,
  );
  const securityEvaluationSummary = createGovernedSecurityEvaluationSummary(
    source.securityEvaluationSummary,
  );
  if (
    (operationId !== undefined && authorization.operationId !== operationId) ||
    (operationId !== undefined &&
      securityEvaluationSummary.operationId !== operationId)
  )
    throw new Error();
  return Object.freeze({ authorization, securityEvaluationSummary });
}
function authorizationMatches(
  evaluation: AuthorizationEvaluationOutcome,
  target: BoundSkillInvocationTarget,
  projection: SkillInvocationRequirementsProjection,
  context: SkillExecutionContextProjection,
): boolean {
  try {
    if (projection.status !== "available") return false;
    const artifact = evaluation.authorization;
    const summary = evaluation.securityEvaluationSummary;
    const requirements = projection.requirements;
    const sameSubject =
      artifact.subject.kind === context.subject.kind &&
      (artifact.subject.kind === "anonymous" ||
        (context.subject.kind === "authenticated" &&
          artifact.subject.identityId === context.subject.identityId));
    return (
      artifact.decision === "allow" &&
      artifact.operationId === target.operationId &&
      summary.operationId === target.operationId &&
      sameSubject &&
      sameAuthorizationSubject(artifact.subject, summary.subject) &&
      artifact.action === target.action &&
      sameResource(artifact.resource, target.resource) &&
      requirements.operationId === target.operationId &&
      requirements.action === target.action &&
      sameResource(requirements.resource, target.resource) &&
      requirements.requiredPermissions.length ===
        target.requiredPermissions.length &&
      requirements.requiredPermissions.every(
        (permission, index) => permission === target.requiredPermissions[index],
      ) &&
      artifact.requirementsStatus === "available" &&
      artifact.evaluatedPermissions.length ===
        target.requiredPermissions.length &&
      artifact.evaluatedPermissions.every(
        (permission, index) => permission === target.requiredPermissions[index],
      ) &&
      artifact.sensitivity === requirements.sensitivity &&
      artifact.policy.id === "orion.minimum-authorization" &&
      artifact.policy.version === "1.0.0" &&
      artifact.evidence.grantEvidenceStatus === "available" &&
      ((artifact.sensitivity === "standard" &&
        artifact.evidence.confirmationStatus === "not-required") ||
        (artifact.sensitivity === "sensitive" &&
          artifact.evidence.confirmationStatus === "confirmed")) &&
      artifact.securityContext.context === summary.securityContext.context &&
      artifact.securityContext.device === summary.securityContext.device &&
      artifact.securityContext.session === summary.securityContext.session &&
      artifact.securityContext.trustLevel === summary.securityContext.trustLevel
    );
  } catch {
    return false;
  }
}
function sameAuthorizationSubject(
  left: { readonly kind: string; readonly identityId?: string },
  right: { readonly kind: string; readonly identityId?: string },
): boolean {
  return (
    left.kind === right.kind &&
    (left.kind === "anonymous" || left.identityId === right.identityId)
  );
}
function canonicalScalarRecord(
  value: unknown,
  declarations: readonly string[],
): SkillInvocationData {
  if (!isObject(value) || Array.isArray(value)) throw new Error();
  const prototype = Reflect.getPrototypeOf(value);
  if (prototype !== Object.prototype && prototype !== null) throw new Error();
  const keys = Reflect.ownKeys(value);
  if (
    keys.length !== declarations.length ||
    keys.some((key) => typeof key !== "string") ||
    declarations.some((name) => !keys.includes(name))
  )
    throw new Error();
  const result = Object.create(null) as Record<string, unknown>;
  for (const key of [...declarations].sort(codePointOrder)) {
    const descriptor = Reflect.getOwnPropertyDescriptor(value, key);
    if (
      descriptor === undefined ||
      descriptor.enumerable !== true ||
      !("value" in descriptor) ||
      !validScalar(descriptor.value)
    )
      throw new Error();
    Object.defineProperty(result, key, {
      value: descriptor.value,
      enumerable: true,
      writable: false,
      configurable: false,
    });
  }
  return freezeConstructed(result) as SkillInvocationData;
}
function validScalar(value: unknown): boolean {
  return (
    value === null ||
    typeof value === "boolean" ||
    (typeof value === "number" &&
      Number.isSafeInteger(value) &&
      !Object.is(value, -0)) ||
    (typeof value === "string" &&
      [...value].length <= 4096 &&
      !/\p{Cc}/u.test(value))
  );
}
function exactStatus(value: unknown, accepted: readonly string[]): string {
  const result = exactDataRecord(value, ["status"]);
  if (typeof result.status !== "string" || !accepted.includes(result.status))
    throw new Error();
  return result.status;
}
function normalizeWorkflowResult(
  value: unknown,
  target: BoundSkillInvocationTarget,
): NormalizedSkillExecutionResult {
  let source: Record<string, unknown>;
  try {
    const status =
      isObject(value) &&
      Reflect.getOwnPropertyDescriptor(value, "status")?.value;
    source = exactDataRecord(
      value,
      status === "succeeded"
        ? ["status", "outputs"]
        : ["status", "failureMode"],
    );
    if (source.status === "succeeded")
      return freezeConstructed({
        operationId: target.operationId,
        skillId: target.skillId,
        skillVersion: target.skillVersion,
        capability: target.capability,
        status: "succeeded",
        outputs: canonicalScalarRecord(source.outputs, target.outputNames),
      });
    if (source.status !== "failed") throw new Error();
    const failureMode = skillFailureModeIdentifier(source.failureMode);
    if (!target.failureModes.includes(failureMode)) throw new Error();
    return freezeConstructed({
      operationId: target.operationId,
      skillId: target.skillId,
      skillVersion: target.skillVersion,
      capability: target.capability,
      status: "failed",
      failureMode,
    });
  } catch (error) {
    if (error instanceof ConstructedStateFailure) throw error;
    throw new InvalidSkillWorkflowResultError();
  }
}
