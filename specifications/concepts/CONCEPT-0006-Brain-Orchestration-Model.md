# CONCEPT-0006 — Brain Orchestration Model

| Field          | Value                                                                 |
| -------------- | --------------------------------------------------------------------- |
| **Status**     | Active                                                                |
| **Version**    | 1.0.0                                                                 |
| **Owner**      | O.R.I.O.N. Architecture                                               |
| **Created**    | 2026-07-29                                                            |
| **Updated**    | 2026-07-29                                                            |
| **Applies To** | Brain requests, orchestration, lifecycle, and final cognitive results |

---

# Status

This document is Active and authoritative for shared M10 semantics.

The key words **MUST**, **MUST NOT**, **SHOULD**, **SHOULD NOT**, and **MAY**
describe requirements that become normative only if this document becomes
Active.

# Purpose

This specification defines the minimum technology-independent Brain
orchestration model needed to coordinate accepted M0–M9 capability Contracts
and produce one final cognitive result.

# Ownership

Brain owns:

- normalized Brain request semantics;
- high-level synchronous sequencing;
- deterministic branch selection;
- orchestration lifecycle and stage precedence;
- orchestration-level failure normalization; and
- final cognitive-result construction.

Brain delegates and MUST NOT redefine:

- Identity truth to Identity;
- Context structure, lifecycle, and projection semantics to Context;
- Memory and Knowledge semantics to their Engines;
- reasoning semantics to Reasoning;
- Candidate Plan semantics to Planning;
- Skill admission, selection, binding, invocation, workflow, and result
  semantics to Skill;
- authorization policy and decision semantics to Security; and
- transport, presentation, persistence, and external integration to their
  future owners.

Core is the schema custodian of shared Contracts. Bootstrap composes runtime
implementations. Neither role transfers Brain semantics.

# Terminology

## Brain Request Identifier

A Brain Request Identifier is an opaque primitive string of 1–128 restricted
ASCII characters matching:

```text
[A-Za-z0-9][A-Za-z0-9._:-]{0,127}
```

It correlates one process-local orchestration attempt. It is not an
Authorization Operation Identifier, identity, credential, timestamp, storage
key, or authority token.

## Normalized Cognitive Request

A Normalized Cognitive Request is one exact immutable request with:

```text
{
  intent: "orchestrate-cognitive-request",
  requestId: BrainRequestIdentifier,
  contextLineageId: ContextLineageIdentity,
  query: ReasoningQuery,
  executionIntent:
    | { kind: "none" }
    | {
        kind: "skill-capability",
        capability: SkillCapabilityIdentifier,
        inputs: SkillInvocationData
      }
}
```

The request contains no operation identifier. Brain allocates an operation only
after successful Skill selection.

`query` is the normalized user intent/input for M10. M10 does not introduce a
second natural-language or intent-classification model.

`executionIntent` is orchestration input, not Planning output and not
authorization:

- `none` permits only a no-Skill final result;
- `skill-capability` requests an exact M7 capability and supplies the complete
  M9 invocation input record if Planning permits response.

The request MUST NOT contain a concrete Skill Identifier, Skill version,
action, resource, permissions, authorization evidence, Provider data,
transport metadata, timestamp, device/session data, Context object, Memory or
Knowledge content, callback, or executable handle.

## Final Cognitive Result

A Final Cognitive Result is one immutable Brain-owned union:

```text
{
  status: "completed",
  kind: "response",
  requestId: BrainRequestIdentifier,
  response: CandidateResponse
}
```

```text
{
  status: "completed",
  kind: "request-more-context",
  requestId: BrainRequestIdentifier,
  reason: "planning-requested-more-context"
}
```

```text
{
  status: "completed",
  kind: "skill-result",
  requestId: BrainRequestIdentifier,
  operationId: AuthorizationOperationIdentifier,
  result: NormalizedSkillExecutionResult
}
```

The `response` value is copied exactly from the single M6 Respond Step. The
`request-more-context` variant performs no Context mutation or follow-up call.
The `skill-result` variant preserves the exact M9 normalized result and its
success or declared business-failure status. The Brain-owned immutable outer
envelope embeds that exact verified Skill-issued object identity; Brain MUST
NOT clone, reconstruct, spread, deserialize, rebuild, or replace it or its
nested values. Skill retains semantic and authority ownership. Brain authority
registration associates the outer envelope with that exact nested identity,
and final verification rejects any structurally identical nested clone.

A Skill business failure is a completed protected invocation result and
therefore produces a completed Brain result. Brain MUST NOT convert it to a
response, hide it, retry it, or reinterpret its failure mode.

# Request Boundary Safety

Every request and nested record MUST:

- be a non-null ordinary object with `Object.prototype` or null prototype;
- contain exactly the required own enumerable string data properties;
- contain no symbol or unexpected own key;
- reject inherited substitutes and accessors;
- reject explicit `undefined`;
- be inspected through protected own-key and descriptor operations;
- reject revoked or hostile Proxies without leaking a native exception;
- be read at most once per accepted field and reconstructed defensively; and
- remain unchanged and unfrozen in caller ownership.

Strings MUST be primitive, preserve exact code points, and MUST NOT be coerced,
trimmed, normalized, parsed, or truncated. `SkillInvocationData` inherits the
exact M9 scalar, key, bound, canonical-order, and prototype rules.

# Deterministic Branch Semantics

Brain MUST first obtain and validate a corresponding Candidate Plan.

| Candidate Plan         | Execution intent   | Branch                          |
| ---------------------- | ------------------ | ------------------------------- |
| `request-more-context` | either value       | no-Skill `request-more-context` |
| `respond`              | `none`             | no-Skill `response`             |
| `respond`              | `skill-capability` | Skill branch                    |

Planning does not determine the execution intent. A Skill capability request
does not override `request-more-context`.

Brain MUST NOT transform the Candidate Plan, parse Candidate Response text,
infer a capability, choose a concrete Skill, or treat either branch as
authorization.

# Orchestration Flow

The M10 flow is:

```text
validate normalized request
  → resolve and verify one Active Context Revision
  → evaluate and verify one Reasoning Outcome
  → create and verify one Candidate Plan
  → accept exact issuer-verifier correspondence results
  → choose the deterministic branch
  → either construct a no-Skill final result
  → or select a Skill
      → allocate one operation
      → bind the selected Skill to the operation
      → resolve M9 Skill execution Context
      → resolve M9 invocation requirements
      → obtain a genuine governed Authorization Evaluation Outcome
      → protected invocation
      → construct a Skill final result
  → verify and return the exact final result
```

Memory and Knowledge reference collections passed to M5 Reasoning are exactly
empty in M10. Brain performs no Memory or Knowledge retrieval.

# Correspondence

Brain MUST enforce:

- the resolved Context lineage equals `contextLineageId`;
- the Context Revision is Active;
- the Reasoning-owned verifier receives the exact consumed Context expectations
  and its exact successful return is accepted as authoritative;
- the Planning-owned verifier receives the exact Reasoning, source,
  explainability, category, and step expectations and its exact successful
  return is accepted as authoritative;
- the exact verified Reasoning Outcome and Candidate Plan are the values used
  for this orchestration, and the selected Brain branch corresponds to the
  already-verified Planning fields;
- the selected Skill Binding capability equals the requested capability;
- the Bound Skill Invocation Target operation equals the allocated operation
  and its capability equals the selected Binding;
- every M9 Context, requirements, Authorization Outcome, and normalized result
  satisfies its issuing Contract's exact provenance and correspondence; and
- the final result request identifier equals the request and, on the Skill
  branch, its operation equals the allocated operation and nested result.

Visible structural equality is necessary but insufficient where authority is
required.

# Authority and Provenance

The first Brain slice requires genuine issuing-runtime authority for:

| Value                             | Required authority                      |
| --------------------------------- | --------------------------------------- |
| Active Context Revision           | issuing Context Engine runtime          |
| Reasoning Outcome                 | issuing Reasoning Engine runtime        |
| Candidate Plan                    | issuing Planning Engine runtime         |
| Skill Binding and Bound Target    | issuing Skill runtime under M9          |
| Authorization Evaluation Outcome  | issuing Security evaluation under M8/M9 |
| Normalized Skill Execution Result | issuing Skill runtime under M9          |
| Final Cognitive Result            | issuing Brain runtime                   |

During initial M10 drafting, issuer-owned authority verifier Contracts for
Context, Reasoning, and Planning results were absent. They were subsequently
introduced and activated through ENGINE-0003 1.1.0, ENGINE-0006 1.1.0, and
ENGINE-0007 1.1.0.

The Active prerequisites are satisfied:

- `Verify Active Context Revision Authority` 1.0.0;
- `Verify Reasoning Outcome Authority` 1.0.0; and
- `Verify Candidate Plan Authority` 1.0.0.

M10 consumes these Active issuer-owned Contracts.

For Context, Reasoning, and Planning, authority registration occurs only after
all existing operation-specific construction, validation, and correspondence
checks have succeeded, but immediately before the exact successful value is
returned. Registration is part of successful issuance. If registration fails,
the public operation does not succeed, the value is not returned, and no retry
occurs:

- Context registers the exact Active Context Revision returned by Get Active
  Context Revision;
- Reasoning registers the exact Reasoning Outcome returned by Evaluate
  Reasoning; and
- Planning registers the exact Candidate Plan returned by Create Candidate
  Plan.

Registration and verification are private to the same Engine runtime. A
verifier is read-only, mints no authority, and never converts, reconstructs,
wraps, freezes, or registers a candidate. Public structural factories MUST NOT
mint authority. Successful verification returns the exact registered candidate;
failure throws the issuing Engine's closed authority-verification error, which
Brain normalizes to its corresponding stage failure.

Verifiers MUST reject:

- clones and same-shaped public-factory values;
- cross-runtime values;
- replaced nested values;
- wrong request, Context, Reasoning, operation, or capability correspondence;
  and
- malformed or hostile candidates.

The Security Outcome additionally requires same-evaluation Artifact/Summary
authority under M8/M9.

Bootstrap may compose the exact issuer-owned operation and verifier Contract
implementations. Bootstrap MUST NOT create an authoritative wrapper, maintain
an authority registry, register a returned candidate, or substitute adapter
identity for Engine identity.

The required additive Engine revisions are now Active:

- Active ENGINE-0003 revision 1.1.0:
  `Verify Active Context Revision Authority`;
- Active ENGINE-0006 revision 1.1.0:
  `Verify Reasoning Outcome Authority`; and
- Active ENGINE-0007 revision 1.1.0:
  `Verify Candidate Plan Authority`.

The M10 specification set is Active. M10 remains not implemented.

The Active prerequisite documents are the
[Context authority revision](../engines/context/ENGINE-0003-Context-Engine-Authority-Revision-1.1.0.md),
[Reasoning authority revision](../engines/reasoning/ENGINE-0006-Reasoning-Engine-Authority-Revision-1.1.0.md),
and
[Planning authority revision](../engines/planning/ENGINE-0007-Planning-Engine-Authority-Revision-1.1.0.md).

Brain MUST capture every configured port and callable immutably at construction.
Ports MUST be exact plain or null-prototype records with own enumerable data
properties. Class/prototype receiver-dependent ports are invalid. Calls MUST be
receiver-free. Mutation or replacement of caller-owned configuration after
construction MUST have no effect.

# Lifecycle

## States

```text
proposed
contextualized
reasoned
planned
skill-required
bound
authorization-resolved
invoking
completed
rejected
```

`completed` and `rejected` are terminal. No state is persisted after the
synchronous operation returns or throws.

## Transition Categories

```text
orchestration-proposed
context-resolved
reasoning-completed
planning-completed
skill-required
skill-bound
authorization-outcome-obtained
protected-invocation-started
no-skill-completed
skill-result-completed
orchestration-rejected
```

## Transition Rules

| From                     | To                       | Category                         |
| ------------------------ | ------------------------ | -------------------------------- |
| `none`                   | `proposed`               | `orchestration-proposed`         |
| `proposed`               | `contextualized`         | `context-resolved`               |
| `contextualized`         | `reasoned`               | `reasoning-completed`            |
| `reasoned`               | `planned`                | `planning-completed`             |
| `planned`                | `completed`              | `no-skill-completed`             |
| `planned`                | `skill-required`         | `skill-required`                 |
| `skill-required`         | `bound`                  | `skill-bound`                    |
| `bound`                  | `authorization-resolved` | `authorization-outcome-obtained` |
| `authorization-resolved` | `invoking`               | `protected-invocation-started`   |
| `invoking`               | `completed`              | `skill-result-completed`         |
| any non-terminal state   | `rejected`               | `orchestration-rejected`         |

Request-envelope or invalid Engine-state failures occur before `proposed` and
emit no lifecycle transition.

An optional synchronous observer receives one immutable event after each
completed transition:

```text
{
  sequence: positive safe integer starting at 1,
  from: "none" | BrainOrchestrationLifecycleState,
  to: BrainOrchestrationLifecycleState,
  category: BrainOrchestrationTransitionCategory,
  diagnosticCorrelationId: BrainDiagnosticCorrelationIdentifier
}
```

The observer is invoked immediately after each committed transition. Its return
is ignored. A throw or thenable is contained and may emit one privacy-safe
`brain-lifecycle-observer-failed` diagnostic without recursive observation.
Observer failure never changes the authoritative result/error, state, branch,
collaborator counts, causes a retry, or creates a transition. Brain retains no
public lifecycle history.

# Callback and No-Retry Semantics

For one orchestration call:

- Context resolve and verify: at most once each;
- Reasoning evaluate and verify: at most once each;
- Planning create and verify: at most once each;
- Skill selection: zero or once;
- operation allocation: zero or once;
- Skill binding: zero or once;
- M9 Context, requirements, authorization, and protected invocation: zero or
  once each;
- final-result construction: at most once;
- Brain authority registration: at most once;
- exact final-result verification: at most once; and
- every observer transition: at most once.

There is no automatic retry, backoff, replay, refresh, alternate Skill
selection, Context re-query, second Reasoning/Planning call, second Security
evaluation, or second protected invocation.

ENGINE-0001 defines 57 atomic precedence rows and 61 self-contained normative
lifecycle rows. Those counts are part of the Active M10 set and MUST change
together if either matrix changes.

# Closed Failure Taxonomy

M10 defines exactly these public Brain failures:

| Failure                             | Meaning                                                                                                        |
| ----------------------------------- | -------------------------------------------------------------------------------------------------------------- |
| `InvalidBrainRequestError`          | malformed request envelope, field, nested value, or conditional shape                                          |
| `InvalidBrainAuthorityError`        | invalid configured port or callable detected during construction                                               |
| `BrainContextResolutionError`       | Context resolver failure, invalid candidate, non-Active or non-corresponding Context                           |
| `BrainReasoningResolutionError`     | Reasoning call failure, invalid candidate, or Reasoning-verifier authority/correspondence failure              |
| `BrainPlanningResolutionError`      | Planning call failure, invalid candidate, or Planning-verifier authority/correspondence failure                |
| `InvalidBrainPlanError`             | Brain's branch decision does not correspond to the exact verified Plan fields and closed branch rules          |
| `BrainSkillCoordinationError`       | selection unavailable/failure, invalid Binding, allocation failure, binding failure, or M9 preparation failure |
| `BrainAuthorizationResolutionError` | governed authorization resolution fails or returns invalid/non-corresponding authority                         |
| `BrainProtectedInvocationError`     | protected invocation throws or returns invalid/non-authoritative/non-corresponding result                      |
| `InvalidFinalCognitiveResultError`  | final result candidate violates shape, branch, correspondence, or authority registration                       |
| `InvalidBrainExecutionStateError`   | Engine lifecycle or impossible private orchestration state is invalid                                          |

No lower-level or native exception propagates unchanged. Brain catches and
normalizes capability failures at the owning orchestration stage while keeping
the private cause unavailable through the public Contract. Public messages are
fixed, technology-neutral, and privacy-safe.

Normalization does not reinterpret a legitimate M9 normalized business-failure
result: that value remains a completed `skill-result`.

# Immutability and Non-Mutation

Brain MUST:

- defensively reconstruct every accepted request/configuration value, while
  preserving exact verified issuer-owned identities that must be embedded or
  correlated;
- freeze or otherwise deeply guarantee every Brain-owned returned graph;
- preserve exact primitive values;
- capture collaborators before use;
- retain no request, Context, Outcome, Plan, authorization, input, or result
  after completion; and
- avoid freezing, mutating, annotating, normalizing, or retaining caller-owned
  or other-Engine-owned graphs.

# Diagnostics and Privacy

M10 defines synchronous diagnostic categories, not domain Events:

- `brain-orchestration-attempted`;
- `brain-context-resolved`;
- `brain-reasoning-completed`;
- `brain-planning-completed`;
- `brain-no-skill-completed`;
- `brain-skill-coordination-completed`;
- `brain-orchestration-rejected`; and
- `brain-orchestration-completed`.

Diagnostics MAY contain only:

- a Brain-owned Diagnostic Correlation Identifier;
- stage/category;
- result kind;
- boolean Skill-path indicator;
- safe callback/transition counts; and
- public failure category.

Diagnostics MUST NOT contain raw query or response text, Context values or
identifiers, Identity, Memory or Knowledge data, Skill input/output values,
permissions, resource identifiers, operation identifiers, Security Outcome,
Artifact, Summary, provenance, credentials, secrets, native messages, or
stacks.

Raw `requestId` is prohibited from diagnostics. Syntactic validation does not
make caller input privacy-safe.

## Diagnostic Correlation Identifier

Brain constructs one diagnostic-only identifier after complete request
validation and before the first lifecycle transition:

```text
brain-diagnostic:<positive-safe-integer>
```

The integer is a Brain-instance-local monotonic attempt sequence beginning at
one. It is deterministic within one controlled runtime, contains no caller
value, and has no reversible relationship to `requestId`, Context, Identity,
operation, Skill, or result data.

The identifier:

- is owned by Brain diagnostic semantics;
- is allocated exactly once per structurally valid orchestration attempt;
- is process-local and never persisted;
- is never returned to the caller;
- is used only in diagnostics emitted for that attempt;
- is immutable primitive text;
- is not authority, identity, or an operation identifier; and
- is never retried or reused.

Counter exhaustion or corrupt private counter state produces
`InvalidBrainExecutionStateError` before `proposed` and before any collaborator
call. It emits only a correlation-allocation failure category without a
correlation value. There is no configured correlation port.

# Field Privacy Classification

## Request Fields

| Field                              | Classification                               | Diagnostic rule                                        |
| ---------------------------------- | -------------------------------------------- | ------------------------------------------------------ |
| `intent`                           | public-safe fixed vocabulary                 | category may be inferred; raw field need not be logged |
| `requestId`                        | internal correlation only, caller-controlled | raw value prohibited                                   |
| `contextLineageId`                 | sensitive Context identifier                 | prohibited                                             |
| `query`                            | sensitive user content                       | prohibited                                             |
| `executionIntent.kind`             | public-safe closed category                  | only `skillPath: boolean` may be emitted               |
| `executionIntent.capability`       | sensitive capability request                 | prohibited                                             |
| `executionIntent.inputs`           | sensitive Skill input                        | prohibited                                             |
| Authorization Operation Identifier | prohibited request field                     | rejected structurally; prohibited                      |
| subject or Identity reference      | prohibited request field in M10              | rejected structurally; prohibited                      |
| transport/timestamp/vendor fields  | prohibited request fields                    | rejected structurally; prohibited                      |

## Result Fields

| Field                                            | Classification                               | Diagnostic rule                            |
| ------------------------------------------------ | -------------------------------------------- | ------------------------------------------ |
| `status`                                         | public-safe fixed vocabulary                 | may emit completion category               |
| `kind`                                           | public-safe closed category                  | may emit exact kind                        |
| `requestId`                                      | internal correlation only, caller-controlled | raw value prohibited                       |
| `response`                                       | sensitive cognitive output                   | prohibited                                 |
| `reason`                                         | public-safe fixed vocabulary                 | may emit result kind, not raw nested value |
| `operationId`                                    | restricted authority correspondence evidence | prohibited                                 |
| `skillId` verifier expectation                   | sensitive Skill identity; not a result field | prohibited                                 |
| `skillVersion` verifier expectation              | sensitive Skill identity; not a result field | prohibited                                 |
| `capability` verifier expectation                | sensitive capability; not a result field     | prohibited                                 |
| normalized Skill result and outputs/failure mode | sensitive Skill result                       | prohibited                                 |
| Candidate Plan or Planning values                | prohibited except the exact copied response  | prohibited                                 |
| Security Outcome/Artifact/Summary                | prohibited from Final Cognitive Result       | prohibited                                 |
| Context/Memory/Knowledge values                  | prohibited from Final Cognitive Result       | prohibited                                 |
| authority/provenance registry data               | restricted private authority evidence        | prohibited                                 |

M10 defines no storage or persistence for any request, result, correlation, or
diagnostic value.

# Public Contract Categories

Core is expected to custody:

1. `Orchestrate Cognitive Request` 1.0.0;
2. `Verify Final Cognitive Result` 1.0.0;
3. `Brain Context Authority` resolver/verifier 1.0.0;
4. `Brain Reasoning Authority` evaluator/verifier 1.0.0;
5. `Brain Planning Authority` creator/verifier 1.0.0;
6. `Allocate Authorization Operation Identifier` 1.0.0;
7. Brain request/result values and identifiers;
8. Brain lifecycle event vocabulary; and
9. the closed Brain failure taxonomy.

ENGINE-0001 specializes each Contract completely. Resolver, evaluator, creator,
and verifier responsibilities remain separate. No verifier may call its issuing
operation, and no issuing operation may use verification as a substitute for
successful construction.

M10 reuses without redefining:

- Get Active Context Revision semantics;
- Evaluate Reasoning;
- Create Candidate Plan;
- Select Skill;
- Bind Skill to Operation;
- Resolve Skill Execution Context;
- Resolve Skill Invocation Requirements;
- Resolve Governed Authorization Evaluation;
- Protected Invoke Skill; and
- Verify Normalized Skill Execution Result.

# Architecture

The production dependency set for `@orion/brain` is exactly:

```text
@orion/core
```

Brain MUST NOT import Identity, Context, Memory, Knowledge, Reasoning, Planning,
Skill, Security, Bootstrap, Infrastructure, Provider, Adapter, Client, or
external package implementations. Bootstrap alone composes compatible ports.
Core MUST NOT depend on Brain.

Architecture verification must include negative fixtures for imports from:

- Bootstrap;
- Infrastructure;
- every other Engine package;
- Skills;
- Providers and Adapters;
- clients/apps;
- deep/internal Core paths; and
- any external runtime package.

# Explicitly Out of Scope

- persistence, database, history, and audit storage;
- Providers, Adapters, external integrations, and external authentication;
- all transport, voice, client, and UI concerns;
- Events, queues, streams, and brokers;
- async orchestration, cancellation, timeout, retry, compensation, and replay;
- distributed authority, locks, transport, and replay protection;
- sandboxing and dynamic plugins;
- configurable Skill-selection and Security policy;
- separate Execution Engine;
- executable or multi-step Planning;
- automatic Context refresh;
- multi-request conversation memory;
- Memory and Knowledge retrieval;
- currentness re-query after authority issuance; and
- changes to M0–M9 semantics.

# Mandatory Future Test Matrix

An M10 implementation specification MUST require:

- exact request/result factory matrices, scalar bounds, prototypes, descriptors,
  symbols, arrays/maps, getters, Proxies, and non-mutation;
- normal-failure-normal recovery for every configured port;
- clone, cross-runtime, replaced-nested-value, and wrong-correspondence
  rejection for every governed authority;
- exact no-Skill and Skill branch results;
- zero Skill/Security calls on both no-Skill branches;
- every configured callback count and exact no-retry count;
- every adjacent precedence boundary with hostile/counter evidence;
- every lifecycle row with exact result/error, ordered from/to transitions,
  category, callback counts, terminal state, and no retry;
- immutable configuration capture and class/prototype mutable-port rejection;
- final-result authority isolation;
- privacy-safe diagnostics at every supported log level;
- dependency negative fixtures;
- deterministic behavior and source-graph preservation; and
- full M0–M9 regression.

# Open Questions

No implementation-critical semantic question remains. The three additive
Engine verifier revisions, ADR-0007, this CONCEPT-0006, and ENGINE-0001 are
Active. M10 is ready for implementation planning.

# Compatibility

This model specializes ADR-0007 and preserves every M0–M9 ownership,
Contract, lifecycle, security, and dependency boundary. It does not revise an
Active authority.

# References

- [ADR-0007 — Brain Orchestration Ownership and Planning Binding](../../docs/adr/ADR-0007-Brain-Orchestration-Ownership-and-Planning-Binding.md)
- [CONCEPT-0003 — Context Model](CONCEPT-0003-Context-Model.md)
- [CONCEPT-0004 — Authorization Model](CONCEPT-0004-Authorization-Model.md)
- [CONCEPT-0005 — Skill Invocation and Execution Model](CONCEPT-0005-Skill-Invocation-and-Execution-Model.md)
- [ENGINE-0006 — Reasoning Engine 1.1.0](../engines/reasoning/ENGINE-0006-Reasoning-Engine-Authority-Revision-1.1.0.md)
- [ENGINE-0007 — Planning Engine 1.1.0](../engines/planning/ENGINE-0007-Planning-Engine-Authority-Revision-1.1.0.md)
- [ENGINE-0009 — Security Engine](../engines/security/ENGINE-0009-Security-Engine.md)
- [ENGINE-0010 — Protected Skill Invocation](../engines/skill/ENGINE-0010-Skill-Engine-Protected-Invocation-and-Execution.md)
