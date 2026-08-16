# ENGINE-0010 — Skill Engine: Protected Invocation and Execution Vertical Slice

| Field          | Value                                                                |
| -------------- | -------------------------------------------------------------------- |
| **Status**     | Active                                                               |
| **Version**    | 1.1.1                                                                |
| **Owner**      | Project Maintainers                                                  |
| **Milestone**  | M9 — Skill Engine: Protected Invocation and Execution Vertical Slice |
| **Created**    | 2026-07-27                                                           |
| **Updated**    | 2026-08-12                                                           |
| **Applies To** | Skill Engine, Core Skill invocation values, and M9 Contracts         |

---

## Status

This specification is the Active `1.1.1` M9 Engine authority. Version `1.1.1`
is a correspondence-only patch to the approved `1.1.0` semantics.

The M9 implementation is conforming, review-accepted, and released as
`m9-v1.0`.

The key words **MUST**, **MUST NOT**, **SHOULD**, **SHOULD NOT**, and **MAY**
describe normative requirements.

## Version

Version `1.1.1` preserves the complete `1.1.0` semantics and corrects only
current implementation correspondence. Version `1.1.0` revised protected
authorization enforcement to consume CONCEPT-0005 `1.1.0` and ENGINE-0009
`1.1.0` Authorization Evaluation Outcome authority. It preserves the complete
`1.0.0` Skill behavior outside that handoff.

## Authority

This specification specializes:

- [ADR-0006 — Skill Selection, Binding, and Protected Invocation Ownership](../../../docs/adr/ADR-0006-Skill-Selection-Binding-and-Protected-Invocation-Ownership.md);
- [CONCEPT-0005 — Skill Invocation and Execution Model](../../concepts/CONCEPT-0005-Skill-Invocation-and-Execution-Model.md);
- [CONCEPT-0004 — Authorization Model](../../concepts/CONCEPT-0004-Authorization-Model.md);
- [ENGINE-0008 — Skill Engine](ENGINE-0008-Skill-Engine.md);
- [ENGINE-0009 — Security Engine](../security/ENGINE-0009-Security-Engine.md);
- accepted M0–M8 semantics; and
- the authority hierarchy in
  [Documentation Authority](../../../docs/DOCUMENT-AUTHORITY.md).

Higher authority governs any conflict. This specification is additive. It does
not modify M7 registration, lookup, discovery, manifest, identifier, version,
permission, input, output, failure-mode, catalog, or lifecycle semantics. It
does not modify M8 requests, authority Contracts, policy, decisions, artifacts,
failures, or lifecycle.

## Milestone

**M9 — Skill Engine: Protected Invocation and Execution Vertical Slice**

M9 proves that one deterministically selected, operation-bound Skill workflow
can execute synchronously only after exact governed authorization enforcement
and can return one governed normalized result.

## Purpose

M9 answers:

> Which admitted Skill is selected for this capability, and can its bound
> workflow execute safely under this exact governed authorization operation?

The slice closes the accepted path from M7 discovery through M8 authorization
to protected Skill execution without adding infrastructure, asynchronous
execution, a separate Execution Engine, or Brain implementation.

## Authoritative Scope

M9 includes:

- Running-only workflow admission after accepted M7 registration;
- deterministic selection using one fixed policy;
- authoritative pre-operation Skill Binding;
- operation-specific Bound Skill Invocation Target;
- governed Skill Execution Context Projection;
- governed Skill Invocation Requirements;
- Security-issued Authorization Evaluation Outcome and same-evaluation
  Artifact/Summary provenance;
- exact protected authorization enforcement;
- generic invocation input validation;
- admitted Skill-specific validation;
- synchronous process-local workflow execution;
- raw-result validation and normalization;
- authority-bearing Normalized Skill Execution Result;
- closed invocation lifecycle and failure mapping;
- hostile-runtime containment, deep immutability, and non-mutation;
- privacy-safe diagnostics;
- explicit Bootstrap composition; and
- architecture and normative testing enforcement.

M9 excludes every capability listed under
[Explicitly Deferred](#explicitly-deferred).

## Ownership

### Skill Engine Owns

The Skill Engine owns:

- workflow admission semantics;
- invocation eligibility;
- fixed selection policy;
- Skill Binding authority;
- Bound Skill Invocation Target authority and derivation;
- protected invocation admission and enforcement mechanics;
- invocation lifecycle;
- generic invocation-data validation;
- validator and workflow handoff;
- Skill execution semantics;
- failure containment and normalization;
- normalized-result semantics and authority; and
- Skill-domain diagnostics.

### Selected Skill Package Owns

The selected admitted Skill package owns:

- Skill-specific input validation;
- its business workflow; and
- its raw declared success or business-failure candidate.

It does not own selection, binding, Security policy, enforcement, orchestration,
cross-boundary result normalization, or platform lifecycle.

### Protected Orchestration Owns

Brain or equivalent protected orchestration:

- decides that an exact Skill capability is required;
- requests selection;
- allocates the Authorization Operation Identifier;
- coordinates target binding, Context projection, governed requirements, one
  Evaluate Authorization Outcome call, read-only Outcome verification, and
  protected invocation; and
- consumes only the governed normalized result.

It does not select a candidate itself, mint Skill authority by shape, validate
Skill-specific meaning, execute the workflow, normalize the raw result, or
reinterpret Security.

### Security Owns

Security owns authorization decision semantics, policy evaluation, the
Authorization Decision Artifact, the Governed Security Evaluation Summary,
same-evaluation Outcome provenance, and read-only Outcome verification.
Protected orchestration coordinates the evaluation boundary. Security does not
coordinate Skill invocation, enforce, invoke, execute, or normalize Skill
results.

### Planning Remains Advisory

M9 consumes no Candidate Plan field and does not make Planning executable.

### No Execution Engine

M9 creates no Execution Engine or `@orion/execution` package. Skill owns
execution semantics. A future runtime helper or isolation mechanism does not
become an Engine merely by providing mechanics.

## Dependency Direction

Production source dependencies for the M9 Skill implementation are exactly:

```text
@orion/skill → @orion/core
```

The Skill implementation MUST NOT import:

- Security, Context, Identity, Planning, Reasoning, Brain, Bootstrap, or another
  Engine implementation;
- Infrastructure;
- a Provider or Adapter;
- a database, filesystem, network, queue, timer, or Event runtime; or
- an external runtime npm package.

Every collaboration occurs through Core-custodied Contracts. Bootstrap may wire
Contract implementations but owns no semantics. Core owns no Skill behavior.

## Lifecycle

The Skill Engine retains the accepted lifecycle:

```text
Initialize → Ready → Running → Stopping → Stopped
```

M7 Register, Get, and Discover remain Running-only. M9 Admit Skill Workflow,
Select Skill, Bind Skill to Operation, and Protected Invoke Skill are also
Running-only.

Resolve Skill Execution Context, Resolve Skill Invocation Requirements, and
Resolve Governed Authorization Evaluation are synchronous authority boundaries
with their own valid pre-existing configuration and lifecycle checks. Their
process-local implementations MUST reject unusable state before request
inspection.

No M9 operation is valid in Ready, Stopping, or Stopped. Invalid lifecycle or
corrupt pre-existing state produces `InvalidSkillExecutionStateError` before
any hostile request property, collaborator, validator, or workflow is touched.

M9 adds no restart restoration, persisted invocation, or lifecycle transition.
One atomic synchronous invocation cannot interleave with Stopping.

## Core-Custodied Domain Values

Core MUST custody the shared structural definitions and immutable factories for:

- Admitted Skill Workflow projection;
- Skill selection request and result;
- Skill Binding;
- Bound Skill Invocation Target;
- Skill Execution Context Projection;
- Skill Invocation Sensitivity request and result;
- Skill Invocation Requirements result and projection;
- Authorization Evaluation Outcome;
- Governed Security Evaluation Summary;
- Authorization Decision Artifact and Security dimension status values reused
  from ENGINE-0009;
- explicit typed resolver/verifier authority ports;
- Skill Invocation Scalar and input/output maps;
- Protected Skill Invocation request;
- Skill Validation Outcome;
- raw Skill Workflow result;
- Normalized Skill Execution Result;
- Normalized Skill Execution Result read-only verifier;
- fixed policy references;
- closed lifecycle vocabulary;
- privacy-safe lifecycle observer event/port; and
- public M9 failure classes.

Core factories establish structural validity only. They do not admit workflows,
select, bind, mint provenance, authorize, enforce, invoke, execute, or
normalize behaviorally.

## Runtime Authority Model

Authority-bearing status is operation-local or Engine-instance-local and cannot
be established by matching shape, public factory construction, TypeScript
branding, object cloning, serialization, caller assertion, exported symbol,
environment switch, constructor flag, or test seam.

M9 uses exactly one provenance model: per-Skill-Engine-instance private object
identity registries.

For every authority-bearing object minted by Skill:

1. Skill defensively reconstructs and deeply freezes the semantic value;
2. the issuing Skill Engine records that exact object identity in the
   value-specific private `WeakSet`;
3. any required expected correspondence is recorded against the same identity
   in a private `WeakMap`;
4. verification requires membership in the issuing instance's registry and
   exact equality with the private expected correspondence; and
5. a spread copy, clone, serialized reconstruction, Core-factory value, or
   object from another Engine instance fails verification.

The registries are created with one Skill Engine instance, are never
module-global or shared, expose no public add/mint operation, are not serialized
or persisted, and are discarded with that Engine instance. Weak membership
does not extend value lifetime. Stopping does not transfer authority, and a
fresh Engine instance rejects every value minted by an earlier instance.

Externally issued authorities use exactly one Core-custodied pattern: an
explicit typed resolver plus its paired opaque verifier port. Except for
Security Outcome authority, the same composition-provided authority boundary
implements both operations:

```text
resolve(exactRequest) -> authorityCandidate
verify(candidate, exactExpectedCorrespondence) -> boolean
```

The applicable issuer privately records minted object identities and expected
correspondence in its own process-local `WeakMap`. `verify` returns primitive
`true` only for the exact object minted by that paired resolver with the exact
expected correspondence; otherwise it returns primitive `false`. It throws no
authority to the caller and performs no semantic policy decision. Skill receives
each resolver/verifier pair only through immutable Engine construction
configuration. Construction MUST capture the exact resolver and verifier
capabilities into Engine-owned immutable locals and MUST NOT retain or re-read a
caller-owned mutable configuration object. The verifier is not part of a
Protected Invoke request, public factory, public export, serialized value, or
caller option.

The explicit external ports are:

- Skill Execution Context Authority Port:
  `resolve(request)` and `verify(candidate, { operationId })`;
- Skill Invocation Requirements Authority Port:
  `resolve(request)` and
  `verify(candidate, { operationId, action, resource })`;
- Security Authorization Outcome Authority Port:
  source-neutral `resolve(request)` plus the exact ENGINE-0009 read-only
  `verifyAuthorizationEvaluationOutcome({ intent, outcome,
operationId })`; and
- Skill Invocation Sensitivity Authority Port:
  `resolve(request)` and
  `verify(candidate, { action, resource })`.

Core custodies these typed port interfaces. Context owns Context projection
semantics; Security owns sensitivity, authorization-decision, Summary, and
Outcome-verification semantics; protected orchestration implements evaluation
coordination; Skill owns only protected enforcement. Compile-time privacy alone
is insufficient.

Every candidate remains subject to complete protected structural and semantic
validation. Provenance is necessary but never sufficient.

The authority-bearing inventory is exact:

| Value                                  | Authority source                                                                                           |
| -------------------------------------- | ---------------------------------------------------------------------------------------------------------- |
| Admitted Skill Workflow                | Skill instance's private admission `WeakSet` and correspondence `WeakMap`                                  |
| Skill Binding                          | Skill instance's private selection `WeakSet` and correspondence `WeakMap`                                  |
| Bound Skill Invocation Target          | Skill instance's private bound-target `WeakSet` and correspondence `WeakMap`                               |
| Skill Execution Context Projection     | paired Context resolver/verifier port                                                                      |
| governed Skill Invocation Requirements | paired requirements resolver/verifier port                                                                 |
| Authorization Decision Artifact        | exact Artifact nested in a genuine Security-issued Authorization Evaluation Outcome                        |
| Governed Security Evaluation Summary   | exact Summary nested in the same genuine Security-issued Authorization Evaluation Outcome                  |
| Authorization Evaluation Outcome       | source-neutral resolver return accepted by the issuing Security instance's read-only Outcome verifier      |
| Skill Validation Outcome               | exact direct return identity recorded in an invocation-local private `WeakSet`; never caller-supplied      |
| Normalized Skill Execution Result      | Skill instance's private result `WeakSet` and correspondence `WeakMap` plus read-only result verifier port |

The raw Skill Workflow result is not authority-bearing. Its origin in the
admitted workflow call is necessary for processing, but the protected boundary
must still validate and normalize it.

The validator's exact direct object return is recorded in an invocation-local
private `WeakSet` before any field extraction. Only that identity may become the
current Skill Validation Outcome candidate. The set and reconstructed outcome
are discarded after the validation stage and are never externally exposed.

## Private State Invariants

Before request inspection, every M9 Skill operation MUST verify:

- the accepted M7 catalog satisfies its existing invariants;
- admission keys are unique by exact Skill Identifier and catalog Version and
  every admission still corresponds to its immutable catalog entry;
- all Skill-minted authority registries and correspondence maps are private to
  this Engine instance and mutually consistent;
- each configured external authority resolver has its exact compatible verifier;
  for Security authorization this is the source-neutral Outcome resolver plus
  the exact read-only verifier of the Security instance that issued its Outcome;
- the exact Security Outcome resolver and exact issuing-Security read-only
  verifier were captured immutably at construction and no caller-owned
  configuration graph is retained or re-read;
- the immutable sensitivity-classification authority configuration is valid;
- the optional lifecycle observer is either absent or the exact configured
  synchronous observer capability; and
- no registry, port, callable, or observer derives from module-global mutable
  state.

Any violation is `InvalidSkillExecutionStateError` before a public request,
external resolver, validator, workflow, or observer is inspected or invoked.

## External Authority Verifier Contracts

These verifier ports are private Engine configuration dependencies, not public
Protected Invoke fields. Each takes `candidate: unknown`, performs identity
membership before semantic field access, and returns only primitive boolean.

### Skill Execution Context Authority Verifier

| Property                         | Value                                                                |
| -------------------------------- | -------------------------------------------------------------------- |
| Contract name                    | Verify Skill Execution Context Authority                             |
| Contract version                 | 1.0.0                                                                |
| Schema custodian                 | Core                                                                 |
| Domain semantic owner            | Context Engine                                                       |
| Implementation responsibility    | same composition-provided Context authority as the paired resolver   |
| Synchrony                        | strict synchronous                                                   |
| Exact request                    | `candidate` plus `{ operationId }`                                   |
| Exact success                    | primitive boolean                                                    |
| Legitimate unavailable           | `false`                                                              |
| Guarantee                        | exact issued identity and operation correspondence                   |
| Prohibited behavior              | mint/add, structural trust, Context query, semantic mutation         |
| Direct request failure           | returns `false`                                                      |
| Collaborator/source throw        | contained and returns `false`                                        |
| Malformed returned-value failure | impossible non-boolean is invalid Engine configuration/state         |
| Correspondence failure           | returns `false`                                                      |
| Provenance guarantee             | only its paired resolver's exact registered object can return `true` |

### Skill Invocation Sensitivity Authority Verifier

| Property                         | Value                                                                |
| -------------------------------- | -------------------------------------------------------------------- |
| Contract name                    | Verify Skill Invocation Sensitivity Authority                        |
| Contract version                 | 1.0.0                                                                |
| Schema custodian                 | Core                                                                 |
| Domain semantic owner            | Security Engine                                                      |
| Implementation responsibility    | same classification authority as the paired sensitivity resolver     |
| Synchrony                        | strict synchronous                                                   |
| Exact request                    | `candidate` plus `{ action, resource }`                              |
| Exact success                    | primitive boolean                                                    |
| Legitimate unavailable           | `false`                                                              |
| Guarantee                        | exact issued identity and action/resource correspondence             |
| Prohibited behavior              | mint/add, caller sensitivity, wildcard/default, policy evaluation    |
| Direct request failure           | returns `false`                                                      |
| Collaborator/source throw        | contained and returns `false`                                        |
| Malformed returned-value failure | impossible non-boolean is invalid Engine configuration/state         |
| Correspondence failure           | returns `false`                                                      |
| Provenance guarantee             | only its paired resolver's exact registered object can return `true` |

### Skill Invocation Requirements Authority Verifier

| Property                         | Value                                                                   |
| -------------------------------- | ----------------------------------------------------------------------- |
| Contract name                    | Verify Skill Invocation Requirements Authority                          |
| Contract version                 | 1.0.0                                                                   |
| Schema custodian                 | Core                                                                    |
| Domain semantic owner            | Security Engine                                                         |
| Implementation responsibility    | same composition-provided requirements authority as the paired resolver |
| Synchrony                        | strict synchronous                                                      |
| Exact request                    | `candidate` plus `{ operationId, action, resource }`                    |
| Exact success                    | primitive boolean                                                       |
| Legitimate unavailable           | `false`                                                                 |
| Guarantee                        | exact issued identity and target correspondence                         |
| Prohibited behavior              | mint/add, structural trust, permission/sensitivity replacement          |
| Direct request failure           | returns `false`                                                         |
| Collaborator/source throw        | contained and returns `false`                                           |
| Malformed returned-value failure | impossible non-boolean is invalid Engine configuration/state            |
| Correspondence failure           | returns `false`                                                         |
| Provenance guarantee             | only its paired resolver's exact registered object can return `true`    |

### Authorization Evaluation Outcome Verifier

This is the exact read-only ENGINE-0009 Contract, not a Skill-owned substitute.

| Property                         | Value                                                                                                                                          |
| -------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------- |
| Contract name                    | Verify Authorization Evaluation Outcome                                                                                                        |
| Contract version                 | 1.0.0                                                                                                                                          |
| Schema custodian                 | Core                                                                                                                                           |
| Domain semantic owner            | Security                                                                                                                                       |
| Skill responsibility             | consume the result as necessary authority evidence, then independently validate structure and enforcement correspondence                       |
| Implementation responsibility    | exact Security instance that issued the Outcome, supplied through composition                                                                  |
| Synchrony                        | strict synchronous read-only request/response                                                                                                  |
| Exact request                    | `{ intent: "verify-authorization-evaluation-outcome", outcome: unknown, operationId: AuthorizationOperationIdentifier }`                       |
| Exact success                    | primitive boolean                                                                                                                              |
| Legitimate unavailable           | `false`                                                                                                                                        |
| Guarantee                        | `true` only for the exact Outcome and nested identities issued by this Security instance for the expected operation                            |
| Prohibited behavior              | mint/add, mutation, policy evaluation, authority calls, currentness query, registry disclosure, structural trust, or decision reinterpretation |
| Direct request failure           | invalid verifier envelope maps through the configured boundary to `InvalidSkillExecutionStateError`; candidate invalidity returns `false`      |
| Collaborator/source throw        | contained and mapped to `InvalidSkillExecutionStateError`                                                                                      |
| Malformed returned-value failure | non-boolean return is invalid immutable configuration/pre-existing state and maps to `InvalidSkillExecutionStateError`                         |
| Correspondence failure           | `false`, then `InvalidGovernedAuthorizationEvaluationError` at the consuming authorization boundary                                            |
| Cross-runtime result             | `false`, then `InvalidGovernedAuthorizationEvaluationError`                                                                                    |
| Provenance guarantee             | exact issuing-instance Outcome, Artifact, Summary, operation, and same-evaluation identity only                                                |
| Privacy                          | exposes no operation, subject, statuses, Artifact, Summary, provenance state, or native detail                                                 |

## Admit Skill Workflow Contract

Metadata:

| Property                         | Value                                                                                           |
| -------------------------------- | ----------------------------------------------------------------------------------------------- |
| Contract name                    | Admit Skill Workflow                                                                            |
| Contract version                 | 1.0.0                                                                                           |
| Schema custodian                 | Core                                                                                            |
| Domain semantic owner            | Skill Engine                                                                                    |
| Implementation responsibility    | Skill Engine                                                                                    |
| Synchrony                        | strict synchronous request/response                                                             |
| Exact request                    | exact five-field `admit-skill-workflow` request shown below                                     |
| Exact success                    | immutable authority-bearing Admitted Skill Workflow                                             |
| Legitimate unavailable           | none                                                                                            |
| Guarantee                        | canonical M7 lookup, exact Version/capability correspondence, one immutable admission           |
| Prohibited behavior              | caller-supplied registration authority, async/generator candidate, update, replacement, removal |
| Direct request failure           | `InvalidSkillWorkflowAdmissionError`                                                            |
| Collaborator/source throw        | not applicable before admitted callable invocation                                              |
| Malformed returned-value failure | constructed admission failure is `InvalidSkillExecutionStateError`                              |
| Correspondence failure           | `InvalidSkillWorkflowAdmissionError`                                                            |
| Provenance guarantee             | exact returned identity is registered in this Skill instance's private admission registry       |

Exact request:

```text
{
  intent: "admit-skill-workflow",
  skillId: SkillIdentifier,
  supportedCapabilities: SkillCapabilityIdentifier[],
  validator: SkillValidatorContractImplementation,
  workflow: SkillWorkflowContractImplementation
}
```

It has exactly those five own enumerable string properties and no enumerable
symbol property. The request does not contain Registered Skill or Skill Version.

### Executable Candidate Representation

`SkillValidatorContractImplementation` and
`SkillWorkflowContractImplementation` each have exactly one runtime
representation: an ordinary synchronous JavaScript function value for which
`typeof candidate === "function"`.

Core custodies the function signatures but owns no executable behavior. No
method-bearing object, `call`/`invoke`/`execute` object, opaque handle, class
constructor, callback-registration object, Promise, thenable, generator
iterator, or alternate representation is accepted.

A composition root may extract a property method and submit that function value
as the candidate only when the extracted function independently conforms to
the receiver-free Contract. The method-holder object itself is never a valid
candidate. Skill does not call `.bind(...)` and does not supply method receiver
state.

Admission accepts ordinary functions and arrow functions. It rejects
`AsyncFunction`, `GeneratorFunction`, and `AsyncGeneratorFunction` candidates
without invoking them. Classification uses captured intrinsic function
prototypes from the runtime. A direct ECMAScript class constructor is rejected
using the captured intrinsic `Function.prototype.toString` result and the
standard class-source prefix, without invocation. Classification never reads
caller-controlled `constructor`, `name`, `toString`, `Symbol.toStringTag`, or
custom metadata properties.

JavaScript does not expose a sound general test that distinguishes every
callable Proxy from its target. Admission therefore does not claim general
Proxy detection. All reflective classification is protected and contained;
failure produces `InvalidSkillWorkflowAdmissionError`. A callable Proxy that
passes intrinsic classification remains only an externally owned callable
capability: invocation uses the exact protected call semantics below, and every
apply-trap throw or invalid direct return is contained by the validator or
workflow failure mapping.

Admission intentionally retains the exact callable references as executable
capabilities. It never freezes, rewrites, clones, serializes, binds, or invokes
them during admission. Arbitrary own/inherited properties on a function are not
inspected for domain meaning, copied into metadata, or retained separately.

For identical approved invocation arguments and equivalent governed state, a
conforming validator or workflow MUST produce the same synchronous observable
Contract outcome. The Engine does not infer absence of arbitrary closure,
lexical, receiver, or global state from function syntax. Dependence on such
state is Skill implementation non-conformance, not governed input and not an
admission-time fact.

Receiver, closure, and global state have no recognized authority semantics.
Skill authority remains only in the explicit immutable invocation argument,
the private per-instance authority registries, and the configured external
resolver/verifier ports. No value observed through `this` can substitute for
those checks or bypass protected enforcement.

### Admission Behavior

For a valid request while Running, Skill MUST:

1. validate pre-existing lifecycle, catalog, admission, and provenance state;
2. extract the exact request once;
3. resolve `skillId` from the same Engine instance's authoritative M7 catalog;
4. reject a missing catalog entry;
5. validate the validator and workflow Contract candidates;
6. validate a dense unique 1–64 capability collection;
7. require every capability to occur in the canonical Registered Skill;
8. reject every second admission for the Skill Identifier and exact catalog
   Version;
9. copy the Skill Identifier and exact catalog Version;
10. reconstruct capabilities in canonical code-point order;
11. privately associate exactly one validator and workflow boundary; and
12. atomically retain the immutable governed relation and register its identity
    in this Skill instance's private admission authority registry.

Admission never mutates the Registered Skill or M7 catalog.

### Admitted Skill Workflow

The public immutable projection is exactly:

```text
{
  skillId: SkillIdentifier,
  skillVersion: SkillVersion,
  supportedCapabilities: SkillCapabilityIdentifier[]
}
```

It contains no function, callback, executable handle, health, readiness,
installation status, timestamp, endpoint, generated persistent identifier, or
mutable catalog reference. The Engine privately associates the projection with
the admitted validator and workflow Contract implementations.

Only the configured admission return has admission authority. Caller-provided
Registered Skill shapes, functions outside the admission call, or matching
projections establish no authority.

### Duplicate and Stability Semantics

There is exactly one admitted workflow per Skill Identifier and exact registered
Version. Every second admission fails with
`DuplicateSkillWorkflowAdmissionError`, including an identical second request.

M9 defines no update, replacement, removal, disablement, invalidation, or
refresh. The relation remains stable for the process-local Engine lifetime.

## Select Skill Contract

Metadata:

| Property                         | Value                                                                                       |
| -------------------------------- | ------------------------------------------------------------------------------------------- |
| Contract name                    | Select Skill                                                                                |
| Contract version                 | 1.0.0                                                                                       |
| Schema custodian                 | Core                                                                                        |
| Domain semantic owner            | Skill Engine                                                                                |
| Implementation responsibility    | Skill Engine                                                                                |
| Synchrony                        | strict synchronous request/response                                                         |
| Exact request                    | exact two-field `select-skill` request shown below                                          |
| Exact success                    | selected authority-bearing Skill Binding or governed unavailable selection result           |
| Legitimate unavailable           | zero eligible Registered Skill plus Admitted Skill Workflow pairs                           |
| Guarantee                        | fixed policy and registration-order-independent code-point selection                        |
| Prohibited behavior              | caller preference, scoring, Version ranking, randomness, authorization, executable Plan     |
| Direct request failure           | `InvalidSkillSelectionInputError`                                                           |
| Collaborator/source throw        | none; corrupt catalog/admission state is `InvalidSkillExecutionStateError`                  |
| Malformed returned-value failure | constructed result failure is `InvalidSkillExecutionStateError`                             |
| Correspondence failure           | `InvalidSkillSelectionAuthorityError`                                                       |
| Provenance guarantee             | selected Binding identity is registered in this Skill instance's private selection registry |

Exact request:

```text
{
  intent: "select-skill",
  capability: SkillCapabilityIdentifier
}
```

No operation, Plan, version preference, Skill preference, score, Context,
permission, grant, authorization, invocation data, or executable reference is
accepted.

### Eligible Candidates

A candidate is eligible exactly when:

1. it is the canonical Registered Skill in the current M7 catalog;
2. its manifest declares the requested capability;
3. the current Skill Engine holds one governed Admitted Skill Workflow with the
   same Skill Identifier and exact catalog Version; and
4. that workflow explicitly supports the same exact capability.

Registration without admission is valid non-eligible state. Admission without
registration is impossible. No health, readiness, loading, installation,
environment, or inferred support participates.

### Fixed Selection Policy

The only policy is:

```text
orion.minimum-skill-selection
version 1.0.0
```

The Engine validates all canonical candidates, orders eligible candidates by
ascending Skill Identifier using locale-independent code-point comparison, and
selects the first.

| Eligible candidates | Result                        |
| ------------------- | ----------------------------- |
| zero                | governed `unavailable`        |
| one                 | that exact candidate          |
| more than one       | exact lowest Skill Identifier |

Version, registration order, caller preference, score, cost, health, locale,
randomness, and environment never affect selection.

Exact result union:

```text
{
  status: "selected",
  policy: {
    id: "orion.minimum-skill-selection",
    version: "1.0.0"
  },
  binding: SkillBinding
}
```

```text
{
  status: "unavailable",
  policy: {
    id: "orion.minimum-skill-selection",
    version: "1.0.0"
  },
  capability: SkillCapabilityIdentifier,
  reason: "no-invocation-eligible-skill"
}
```

Malformed catalog/admission state is a state failure, not unavailability.

## Skill Binding

Skill Binding is the authoritative pre-operation selection value:

```text
{
  capability: SkillCapabilityIdentifier,
  registeredSkill: RegisteredSkill
}
```

It contains the complete canonical Registered Skill projection and exact
selected capability. It contains no operation identifier. Version is copied
exactly as metadata and is not identity, compatibility, preference, or ranking.

Only a selected result returned through the configured Select Skill Contract is
authoritative. A Core factory or matching external object is structural only.

## Bind Skill to Operation Contract

Metadata:

| Property                         | Value                                                                                |
| -------------------------------- | ------------------------------------------------------------------------------------ |
| Contract name                    | Bind Skill to Operation                                                              |
| Contract version                 | 1.0.0                                                                                |
| Schema custodian                 | Core                                                                                 |
| Domain semantic owner            | Skill Engine                                                                         |
| Implementation responsibility    | Skill Engine                                                                         |
| Synchrony                        | strict synchronous request/response                                                  |
| Exact request                    | exact three-field `bind-skill-to-operation` request shown below                      |
| Exact success                    | immutable authority-bearing Bound Skill Invocation Target                            |
| Legitimate unavailable           | none                                                                                 |
| Guarantee                        | exact operation binding and complete canonical Registered Skill snapshot             |
| Prohibited behavior              | operation allocation, caller action/resource/snapshot fields, rebinding              |
| Direct request failure           | `InvalidBoundSkillTargetInputError`                                                  |
| Collaborator/source throw        | none                                                                                 |
| Malformed returned-value failure | constructed target failure is `InvalidSkillExecutionStateError`                      |
| Correspondence failure           | fabricated/stale/wrong-instance Binding is `InvalidSkillAuthorityError`              |
| Provenance guarantee             | target identity is registered in this Skill instance's private bound-target registry |

Exact request:

```text
{
  intent: "bind-skill-to-operation",
  operationId: AuthorizationOperationIdentifier,
  binding: SkillBinding
}
```

Skill validates but does not allocate, generate, persist, globally deduplicate,
or globally replay-protect the operation identifier.

### Bound Skill Invocation Target

The exact immutable target is:

```text
{
  operationId: AuthorizationOperationIdentifier,
  skillId: SkillIdentifier,
  skillVersion: SkillVersion,
  capability: SkillCapabilityIdentifier,
  action: "skill.invoke",
  resource: {
    kind: "identified",
    resourceId: AuthorizationResourceIdentifier
  },
  requiredPermissions: SkillPermissionIdentifier[],
  inputNames: SkillInterfaceFieldIdentifier[],
  outputNames: SkillInterfaceFieldIdentifier[],
  failureModes: SkillFailureModeIdentifier[]
}
```

Derivation is closed:

- Skill identity, version, capability, permissions, inputs, outputs, and failure
  modes come from the authoritative Skill Binding;
- `action` is always `skill.invoke`;
- `resource.resourceId` is always `skill:` plus the exact Skill Identifier;
- permissions and declarations are complete canonical snapshots;
- no caller field may replace, weaken, extend, or reorder a snapshot; and
- no capability or operation suffix is added to the resource.

The action satisfies Authorization Action Identifier semantics. The derived
identified resource is 7–70 restricted ASCII characters and satisfies
Authorization Resource Identifier semantics.

The target applies to one operation in the issuing Engine lifetime and cannot
be rebound. Only the configured Bind Skill to Operation return is authoritative.

## Resolve Skill Execution Context Contract

Metadata:

| Property                         | Value                                                                                      |
| -------------------------------- | ------------------------------------------------------------------------------------------ |
| Contract name                    | Resolve Skill Execution Context                                                            |
| Contract version                 | 1.0.0                                                                                      |
| Schema custodian                 | Core                                                                                       |
| Domain semantic owner            | Context Engine                                                                             |
| Implementation responsibility    | composition-provided Context authority                                                     |
| Synchrony                        | strict synchronous request/response                                                        |
| Exact request                    | exact `resolve-skill-execution-context` request shown below                                |
| Exact success                    | authority-bearing Skill Execution Context Projection                                       |
| Legitimate unavailable           | none in M9                                                                                 |
| Guarantee                        | Active-at-issuance revision, derived lineage/revision/subject, exact operation binding     |
| Prohibited behavior              | caller-derived subject, raw mutable Context, currentness re-query, Skill-to-Context import |
| Direct request failure           | `InvalidSkillContextAuthorityError`                                                        |
| Collaborator/source throw        | `InvalidSkillExecutionStateError`                                                          |
| Malformed returned-value failure | `InvalidSkillContextAuthorityError`                                                        |
| Correspondence failure           | `InvalidSkillContextAuthorityError`                                                        |
| Provenance guarantee             | paired Context resolver/verifier identity and exact operation correspondence               |

Exact request:

```text
{
  intent: "resolve-skill-execution-context",
  operationId: AuthorizationOperationIdentifier,
  contextRevision: ActiveContextRevision
}
```

Exact immutable projection:

```text
{
  operationId: AuthorizationOperationIdentifier,
  lineageId: ContextLineageIdentity,
  revisionId: ContextRevisionIdentity,
  subject: AuthorizationSubject
}
```

The configured boundary validates that the supplied revision is authoritative
and Active at issuance, derives lineage, revision, and subject without caller
replacement, and mints projection authority.

An invalid envelope, malformed operation, unavailable/non-Active revision,
malformed or hostile returned projection, or operation/lineage/revision/subject
correspondence failure produces `InvalidSkillContextAuthorityError`. Any value
thrown by the configured source is contained and produces
`InvalidSkillExecutionStateError`. M9 defines no legitimate unavailable Context
result. The paired verifier must return `true` for the exact issued object and
operation before Skill inspects its semantic fields.

Once issued, the projection is the operation-scoped snapshot:

- a successor activation does not invalidate it;
- later source expiry does not invalidate it;
- no invocation-time Context query occurs;
- it cannot be reused for another operation; and
- it contains no raw mutable Context graph.

Skill consumes and verifies the projection through Core-custodied semantics and
does not import or call Context implementation.

## Resolve Skill Invocation Sensitivity Contract

Metadata:

| Property                         | Value                                                                                  |
| -------------------------------- | -------------------------------------------------------------------------------------- |
| Contract name                    | Resolve Skill Invocation Sensitivity                                                   |
| Contract version                 | 1.0.0                                                                                  |
| Schema custodian                 | Core                                                                                   |
| Domain semantic owner            | Security Engine                                                                        |
| Implementation responsibility    | composition-provided process-local Security classification authority                   |
| Synchrony                        | strict synchronous request/response                                                    |
| Exact request                    | exact action/resource classification request shown below                               |
| Exact success                    | authority-bearing `available` or `unavailable` classification result                   |
| Legitimate unavailable           | no exact action/resource classification                                                |
| Guarantee                        | deterministic exact action/resource lookup with no fallback                            |
| Prohibited behavior              | caller sensitivity, wildcard, hierarchy, default, mutation, policy evaluation          |
| Direct request failure           | `InvalidSkillAuthorityError`                                                           |
| Collaborator/source throw        | `InvalidSkillExecutionStateError`                                                      |
| Malformed returned-value failure | `InvalidSkillAuthorityError`                                                           |
| Correspondence failure           | `InvalidSkillAuthorityError`                                                           |
| Provenance guarantee             | paired sensitivity resolver/verifier identity and exact action/resource correspondence |

Sensitivity is a protected-action classification, not an operation-specific
fact. The exact request therefore omits operation:

```text
{
  intent: "resolve-skill-invocation-sensitivity",
  action: AuthorizationActionIdentifier,
  resource: AuthorizationResource
}
```

The exact result union is:

```text
{
  status: "available",
  sensitivity: "standard" | "sensitive"
}
```

```text
{
  status: "unavailable"
}
```

The configured authority is built once from an immutable process-local table
keyed by the exact pair of action and resource. Values are only `standard` or
`sensitive`. Construction defensively reconstructs and canonically orders the
table. Zero exact matches returns `unavailable`; exactly one returns
`available`. An identical or contradictory duplicate key is invalid
pre-existing authority state. M9 has no wildcard, hierarchy, default, update,
replacement, or removal.

The resolver privately registers each returned result identity with its exact
action/resource correspondence. Its paired verifier is the only provenance
check. Caller-created classifications, even matching ones, are invalid.
Malformed/hostile requests, results, or wrong correspondence produce
`InvalidSkillAuthorityError`; any source throw is contained as
`InvalidSkillExecutionStateError`; unavailable is successful and never an
exception. No source message escapes.

## Resolve Skill Invocation Requirements Contract

Metadata:

| Property                         | Value                                                                                       |
| -------------------------------- | ------------------------------------------------------------------------------------------- |
| Contract name                    | Resolve Skill Invocation Requirements                                                       |
| Contract version                 | 1.0.0                                                                                       |
| Schema custodian                 | Core                                                                                        |
| Domain semantic owner            | Security Engine                                                                             |
| Implementation responsibility    | composition-provided requirements authority using the configured sensitivity authority port |
| Synchrony                        | strict synchronous request/response                                                         |
| Exact request                    | exact `resolve-skill-invocation-requirements` request shown below                           |
| Exact success                    | authority-bearing available requirements projection or governed unavailable result          |
| Legitimate unavailable           | sensitivity classification is unavailable                                                   |
| Guarantee                        | exact target operation/action/resource/permissions and Security-owned sensitivity           |
| Prohibited behavior              | caller sensitivity/permissions, default `standard`, weakening, policy decision              |
| Direct request failure           | `InvalidSkillAuthorityError`                                                                |
| Collaborator/source throw        | `InvalidSkillExecutionStateError`                                                           |
| Malformed returned-value failure | `InvalidSkillAuthorityError`                                                                |
| Correspondence failure           | `InvalidSkillAuthorityError`                                                                |
| Provenance guarantee             | paired requirements resolver/verifier identity and exact target correspondence              |

Exact request:

```text
{
  intent: "resolve-skill-invocation-requirements",
  target: BoundSkillInvocationTarget
}
```

Exact result union:

```text
{
  status: "available",
  requirements: {
    operationId: AuthorizationOperationIdentifier,
    action: "skill.invoke",
    resource: {
      kind: "identified",
      resourceId: AuthorizationResourceIdentifier
    },
    requiredPermissions: SkillPermissionIdentifier[],
    sensitivity: "standard" | "sensitive"
  }
}
```

```text
{
  status: "unavailable",
  operationId: AuthorizationOperationIdentifier,
  action: "skill.invoke",
  resource: {
    kind: "identified",
    resourceId: AuthorizationResourceIdentifier
  }
}
```

Operation, action, resource, and permissions derive exactly from the
authoritative target. Sensitivity derives only from the configured
Security-owned classification authority. Absence produces governed unavailable.
There is no implicit `standard` fallback.

The requirements resolver invokes the configured sensitivity resolver exactly
once with target action/resource and requires its paired verifier to accept the
exact returned classification for those values. A malformed/fabricated target,
classification, or requirements value and any correspondence failure produces
`InvalidSkillAuthorityError`. A sensitivity source throw produces
`InvalidSkillExecutionStateError`. A verified `unavailable` classification
produces the governed unavailable result. Impossible constructed requirements
produce `InvalidSkillExecutionStateError`.

The available projection is authority-bearing. It MUST be the exact governed
requirements used for Security evaluation or the CONCEPT-0005-approved
authority-preserving operation-bound equivalent with deep equality across
operation, action, resource, permissions, and sensitivity.

Same-shaped caller values establish no requirements or sensitivity authority.

## Resolve Governed Authorization Evaluation Contract

Metadata:

| Property                         | Value                                                                                                                                                                       |
| -------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Contract name                    | Resolve Governed Authorization Evaluation                                                                                                                                   |
| Contract version                 | 1.1.0                                                                                                                                                                       |
| Schema custodian                 | Core                                                                                                                                                                        |
| Domain semantic owner            | Security owns evaluation, Summary, and Outcome authority; protected orchestration owns coordination; Skill owns enforcement                                                 |
| Implementation responsibility    | composition-provided source-neutral boundary using the configured Evaluate Authorization Outcome Contract and exact issuing-Security verifier                               |
| Synchrony                        | strict synchronous request/response                                                                                                                                         |
| Exact request                    | exact outer coordination request and nested Evaluate Authorization Outcome request shown below                                                                              |
| Exact success                    | the exact genuine Security-issued Authorization Evaluation Outcome for valid allow, deny, or indeterminate                                                                  |
| Legitimate unavailable           | none                                                                                                                                                                        |
| Guarantee                        | exactly one Outcome evaluation, read-only authority verification, exact operation/action/resource correspondence, and return of the exact Outcome without replacement       |
| Prohibited behavior              | legacy Artifact evaluation, second evaluation, Summary construction, Outcome reconstruction, provenance minting, policy recomputation, decision reinterpretation, or I/O    |
| Direct request failure           | `InvalidGovernedAuthorizationEvaluationError`                                                                                                                               |
| Collaborator/source throw        | `InvalidSkillExecutionStateError`; contains Error, Security domain error, primitive, and hostile thrown values                                                              |
| Malformed returned-value failure | `InvalidGovernedAuthorizationEvaluationError` for malformed/hostile Outcome, Artifact, or Summary                                                                           |
| Verifier failure                 | `false` maps to `InvalidGovernedAuthorizationEvaluationError`; throw/non-boolean maps to `InvalidSkillExecutionStateError`                                                  |
| Correspondence failure           | `InvalidGovernedAuthorizationEvaluationError`                                                                                                                               |
| Cross-runtime result             | `InvalidGovernedAuthorizationEvaluationError`                                                                                                                               |
| Provenance guarantee             | exact Outcome, Artifact, and Summary identities issued together by the configured Security instance for the exact operation                                                 |
| Privacy                          | failure and diagnostics expose no operation, subject, status snapshot, Artifact, Summary, provenance state, Security/native message, token, credential, or private registry |

Exact request:

```text
{
  intent: "resolve-governed-authorization-evaluation",
  request: {
    intent: "evaluate-authorization-outcome",
    operationId: AuthorizationOperationIdentifier,
    action: AuthorizationActionIdentifier,
    resource: AuthorizationResource
  }
}
```

The source-neutral implementation MUST:

1. validate lifecycle, configuration, request, and operation;
2. invoke the configured Evaluate Authorization Outcome Contract exactly once
   and never invoke legacy Evaluate Authorization for that operation;
3. contain every thrown value;
4. map any collaborator throw to `InvalidSkillExecutionStateError`;
5. perform hostile-safe protected validation of the returned Outcome, Artifact,
   and Summary without trusting raw property access;
6. invoke the exact issuing-Security read-only Outcome verifier for the expected
   operation and require primitive `true`;
7. map verifier `false`, malformed/hostile nested values, or
   request-correspondence-invalid return to
   `InvalidGovernedAuthorizationEvaluationError`;
8. require exact same-evaluation Artifact/Summary provenance;
9. require Artifact and Summary operation correspondence plus Artifact
   action/resource correspondence;
10. preserve the exact Outcome and nested identities; and
11. return that exact Outcome without wrapping, cloning, reconstructing,
    replacing, or minting authority.

Exact result type:

```text
AuthorizationEvaluationOutcome
```

The Outcome uses the Core-custodied ENGINE-0009 type and remains opaque in
authority, process-local, operation-bound, and non-serializable as authority.
Skill defines no replacement Summary or Outcome schema. A Core factory may
reconstruct structure but cannot mint provenance. A naked Artifact, naked
Summary, caller-created pair, clone, spread, serialized/reconstructed value,
cross-runtime Outcome, cross-evaluation pair, or replaced nested value is not
governed even when every visible field is equal.

Valid M8 `allow`, `deny`, and `indeterminate` Outcomes all resolve successfully.
Decision enforcement occurs only at Protected Invoke.

An invalid direct envelope or nested Outcome request, malformed/hostile Outcome
or contained value, failed same-evaluation verification, or
operation/action/resource mismatch produces
`InvalidGovernedAuthorizationEvaluationError`. Any value thrown by the
configured evaluator or verifier is contained as
`InvalidSkillExecutionStateError`. No separate carrier construction exists.

## Protected Invoke Skill Contract

Metadata:

| Property                         | Value                                                                                                                                                                                                                                                                                 |
| -------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Contract name                    | Protected Invoke Skill                                                                                                                                                                                                                                                                |
| Contract version                 | 1.1.0                                                                                                                                                                                                                                                                                 |
| Schema custodian                 | Core                                                                                                                                                                                                                                                                                  |
| Domain semantic owner            | Skill Engine                                                                                                                                                                                                                                                                          |
| Implementation responsibility    | Skill Engine                                                                                                                                                                                                                                                                          |
| Synchrony                        | strict synchronous request/response                                                                                                                                                                                                                                                   |
| Exact request                    | exact seven-field `invoke-bound-skill` request shown below                                                                                                                                                                                                                            |
| Exact success                    | authority-bearing normalized success or declared business-failure result                                                                                                                                                                                                              |
| Legitimate unavailable           | none                                                                                                                                                                                                                                                                                  |
| Guarantee                        | genuine same-evaluation Outcome authority, exact enforcement correspondence, at-most-once validator/workflow, normalized result                                                                                                                                                       |
| Prohibited behavior              | naked Artifact/Summary, alternate wrapper, caller sensitivity/status, policy recomputation, duplicate evaluation, retry, async execution                                                                                                                                              |
| Direct request failure           | `InvalidProtectedSkillInvocationInputError`                                                                                                                                                                                                                                           |
| Collaborator/source throw        | exact validator/workflow/observer mappings below                                                                                                                                                                                                                                      |
| Malformed returned-value failure | exact validator/workflow result failure; constructed result is `InvalidSkillExecutionStateError`                                                                                                                                                                                      |
| Correspondence failure           | `InvalidSkillAuthorityError`, `InvalidSkillContextAuthorityError`, `InvalidGovernedAuthorizationEvaluationError`, or `SkillAuthorizationEnforcementError` by stage                                                                                                                    |
| Cross-runtime behavior           | incompatible Security Outcome, Context, requirements, or other same-runtime governed authority is rejected under the existing authority/evidence mapping; visible equality establishes no authority and no conversion occurs                                                          |
| Provenance guarantee             | exact target, Context, requirements, and issuing-Security Outcome authority verified; exact result registered privately                                                                                                                                                               |
| Privacy                          | exposes no prohibited operation, subject, Skill identity, resource, permissions, inputs, outputs, Context lineage/revision, Outcome, Artifact, Summary, provenance, or native message/stack; only approved safe categories, counts, booleans, lifecycle, or result status may surface |

Exact request:

```text
{
  intent: "invoke-bound-skill",
  operationId: AuthorizationOperationIdentifier,
  target: BoundSkillInvocationTarget,
  requirements: SkillInvocationRequirementsProjection,
  inputs: SkillInvocationInputData,
  context: SkillExecutionContextProjection,
  authorizationEvaluation: AuthorizationEvaluationOutcome
}
```

The exact own fields above are mandatory. No optional authorization
representation, naked Authorization Decision Artifact, naked Governed Security
Evaluation Summary, alternate legacy wrapper, sensitivity, duplicate Skill
identity, workflow handle, Provider, Adapter, credential, timeout, retry,
cancellation, Event publisher, mutable Context, or raw Security Context value is
accepted.

Missing or explicit `undefined` `authorizationEvaluation` is malformed request
input and produces `InvalidProtectedSkillInvocationInputError` before an
invocation lifecycle begins.

## Exact-Object Boundary Semantics

Every request, result, nested record, array, and map at a public or governed
unknown boundary MUST:

- be a non-null ordinary object of the required kind;
- have exactly the required own enumerable string keys;
- have no extra enumerable string key or enumerable symbol;
- reject inherited substitutes;
- reject explicit `undefined`;
- reject accessors where a canonical data property is required;
- use protected `ownKeys` and descriptor capture;
- read each accepted property exactly once;
- read array length and every accepted index exactly once;
- reject sparse or decorated arrays;
- reject coercible substitutes; and
- contain every native or hostile Proxy, getter, descriptor, or reflection
  failure in the exact owning domain failure.

Validation reconstructs only from captured safe locals. No validation-then-read
again pattern is permitted.

For Skill Invocation Input Data and raw Skill Invocation Output Data
specifically, the source prototype MUST be exactly `Object.prototype` or
`null`. Custom prototypes, class instances, arrays, functions, Date, Map, Set,
and inherited semantic properties are rejected. A Proxy is not rejected merely
by label—the runtime has no reliable general Proxy predicate—but every
reflection trap is contained, and the value is accepted only if all exact
prototype, key, descriptor, and one-read checks succeed.

## Skill Invocation Scalar and Maps

### Scalar

The exact scalar union is:

- primitive `null`;
- primitive boolean;
- primitive integer in `[-9007199254740991, 9007199254740991]`, excluding
  negative zero; or
- primitive string containing 0–4096 Unicode code points and no General
  Category `Cc` code point.

Strings are preserved exactly. Empty and whitespace-only strings are valid.
There is no trim, normalization, folding, truncation, coercion, or parsing.
Non-BMP text is counted by Unicode code point.

Floating point, `NaN`, infinities, bigint, symbol, function, array, object,
Date, Buffer/binary, and coercible substitutes are invalid.

### Input Map

Skill Invocation Input Data is an exact immutable record with 0–64 entries:

- accepted source prototype is exactly `Object.prototype` or `null`;
- keys are exact M7 Skill Interface Field Identifiers;
- its key set exactly equals target `inputNames`;
- every declared input is required;
- no undeclared input is accepted;
- zero declarations require the exact empty record; and
- reconstructed keys use ascending locale-independent code-point order;
- canonical reconstruction uses `Object.create(null)`; and
- every canonical key is an own enumerable immutable data property.

Only own enumerable string keys carry data. Enumerable symbols, unexpected own
non-enumerable properties, accessors, and inherited substitutes are rejected.
`ownKeys` and descriptors are captured once, and each accepted value is read
exactly once.

`__proto__`, `constructor`, and `prototype` have no prototype-changing behavior
in the null-prototype reconstruction. They are admitted only when they satisfy
the existing M7 identifier grammar and occur in the exact declaration set; no
additional special case exists.

### Output Map

Skill Invocation Output Data uses the same scalar and record rules. Its exact
key set equals target `outputNames`. Every declared output is required; no
undeclared output is accepted; zero declarations require the exact
null-prototype empty record. Normalized output records always satisfy
`Object.getPrototypeOf(outputs) === null`.

## Skill Validator Contract

Metadata:

| Property                         | Value                                                                                          |
| -------------------------------- | ---------------------------------------------------------------------------------------------- |
| Contract name                    | Skill Validator                                                                                |
| Contract version                 | 1.0.0                                                                                          |
| Schema custodian                 | Core callable interface and argument/result schemas                                            |
| Domain semantic owner            | selected Skill package under Skill Engine validation governance                                |
| Implementation responsibility    | admitted Skill validator function                                                              |
| Synchrony                        | strict direct function return; call site supplies primitive `undefined` as `thisArgument`      |
| Exact request                    | one exact deeply frozen `SkillValidatorInput` positional argument                              |
| Exact success                    | exact `{ status: "accepted" }` or `{ status: "rejected" }`                                     |
| Legitimate unavailable           | none                                                                                           |
| Guarantee                        | one invocation after authorization; exact immutable argument; no Skill-owned receiver supplied |
| Prohibited behavior              | interpreting receiver/closure/global state as Contract input; async completion; mutation       |
| Direct request failure           | argument construction failure is `InvalidSkillExecutionStateError`                             |
| Collaborator/source throw        | `SkillValidatorBoundaryError`                                                                  |
| Malformed returned-value failure | `InvalidSkillValidationResultError`                                                            |
| Correspondence failure           | `InvalidSkillValidationResultError`                                                            |
| Provenance guarantee             | callable is the exact function privately associated with the governed Admitted Skill Workflow  |

The exact Core-custodied signature is:

```text
type SkillValidatorContractImplementation =
  (input: SkillValidatorInput) => SkillValidationOutcome
```

The admitted subordinate validator receives one positional argument and no
other argument. `SkillValidatorInput` is exactly:

```text
{
  operationId: AuthorizationOperationIdentifier,
  capability: SkillCapabilityIdentifier,
  inputs: SkillInvocationInputData,
  context: SkillExecutionContextProjection
}
```

It returns exactly:

```text
{ status: "accepted" }
```

or:

```text
{ status: "rejected" }
```

The validator MUST be deterministic, synchronous, non-mutating, non-retaining,
and side-effect-free for protected business effects. It may inspect only the
supplied inputs and projection.

Skill invokes it exactly as if by:

```text
Reflect.apply(validator, undefined, [deeplyFrozenArgument])
```

The enforceable guarantee is only that the call site supplies primitive
`undefined` as `thisArgument`. Skill supplies no receiver object owned by the
Skill Engine, Bootstrap, Context, Security, or orchestration. JavaScript may
coerce that value for a non-strict ordinary function, and an arrow function
ignores it in favor of lexical `this`; M9 makes no claim about the value a
particular function body ultimately observes.

Dynamic receiver state, global receiver coercion, lexical `this`, and
closure-captured mutable external state are implementation-local and outside
the Contract. They are not governed invocation input, Skill Engine state,
authority-bearing input, or deterministic Contract semantics. Skill neither
supplies nor inspects them. A conforming validator derives governed semantics
only from the explicit immutable argument.

Completion is solely the direct return. Scheduling a callback, timer, Promise,
or other async work grants no asynchronous semantics. A direct `undefined`,
Promise, thenable, iterator, or other non-closed return is invalid.

| Validator outcome                     | Failure/result                      | Workflow   |
| ------------------------------------- | ----------------------------------- | ---------- |
| exact `accepted`                      | continue                            | eligible   |
| exact controlled `rejected`           | `SkillInputValidationError`         | not called |
| native/domain/primitive/hostile throw | `SkillValidatorBoundaryError`       | not called |
| malformed or hostile return           | `InvalidSkillValidationResultError` | not called |
| Promise or thenable return            | `InvalidSkillValidationResultError` | not called |

An Error, domain Error, string, number, boolean, object, function, symbol,
bigint, `null`, `undefined`, or hostile value thrown by the call is contained
as `SkillValidatorBoundaryError`. No original value, message, or stack escapes.
No free text or thrown controlled rejection exists.

## Skill Workflow Contract

Metadata:

| Property                         | Value                                                                                         |
| -------------------------------- | --------------------------------------------------------------------------------------------- |
| Contract name                    | Skill Workflow                                                                                |
| Contract version                 | 1.0.0                                                                                         |
| Schema custodian                 | Core callable interface and argument/result schemas                                           |
| Domain semantic owner            | selected Skill package for its business workflow under Skill execution governance             |
| Implementation responsibility    | admitted Skill workflow function                                                              |
| Synchrony                        | strict direct function return; call site supplies primitive `undefined` as `thisArgument`     |
| Exact request                    | one exact deeply frozen `SkillWorkflowInput` positional argument                              |
| Exact success                    | exact raw succeeded output or exact declared business-failure candidate                       |
| Legitimate unavailable           | none                                                                                          |
| Guarantee                        | one invocation after validation; exact immutable argument; no Skill-owned receiver supplied   |
| Prohibited behavior              | interpreting receiver/closure/global state as Contract input; async completion; retry         |
| Direct request failure           | argument construction failure is `InvalidSkillExecutionStateError`                            |
| Collaborator/source throw        | `SkillWorkflowExecutionError`                                                                 |
| Malformed returned-value failure | `InvalidSkillWorkflowResultError`                                                             |
| Correspondence failure           | `InvalidSkillWorkflowResultError`                                                             |
| Provenance guarantee             | callable is the exact function privately associated with the governed Admitted Skill Workflow |

The exact Core-custodied signature is:

```text
type SkillWorkflowContractImplementation =
  (input: SkillWorkflowInput) => RawSkillWorkflowResult
```

The admitted subordinate workflow receives one positional argument and no other
argument. `SkillWorkflowInput` is exactly:

```text
{
  operationId: AuthorizationOperationIdentifier,
  capability: SkillCapabilityIdentifier,
  inputs: SkillInvocationInputData,
  context: SkillExecutionContextProjection
}
```

It is invoked at most once and only after authorization enforcement and
validator acceptance.

Skill invokes it exactly as if by:

```text
Reflect.apply(workflow, undefined, [deeplyFrozenArgument])
```

The enforceable guarantee is only that the call site supplies primitive
`undefined` as `thisArgument`. Skill supplies no receiver object owned by the
Skill Engine, Bootstrap, Context, Security, or orchestration. JavaScript may
coerce that value for a non-strict ordinary function, and an arrow function
ignores it in favor of lexical `this`; M9 makes no claim about the value a
particular function body ultimately observes.

Dynamic receiver state, global receiver coercion, lexical `this`, and
closure-captured mutable external state are implementation-local and outside
the Contract. They are not governed invocation input, Skill Engine state,
authority-bearing input, or deterministic Contract semantics. Skill neither
supplies nor inspects them. A conforming workflow derives governed semantics
only from the explicit immutable argument.

Completion is solely the direct return.
Scheduled callback/timer/async work is ignored by M9; a direct `undefined`,
Promise, thenable, iterator, or other non-closed result is invalid.

Exact raw result:

```text
{
  status: "succeeded",
  outputs: SkillInvocationOutputData
}
```

or:

```text
{
  status: "failed",
  failureMode: SkillFailureModeIdentifier
}
```

Raw objects are hostile candidates, not governed results. They have exact keys
and no extra field.

| Workflow outcome                      | Failure/result                    |
| ------------------------------------- | --------------------------------- |
| valid declared success                | normalize success                 |
| valid declared business failure       | normalize business failure        |
| native/domain/primitive/hostile throw | `SkillWorkflowExecutionError`     |
| malformed or hostile result           | `InvalidSkillWorkflowResultError` |
| Promise or thenable                   | `InvalidSkillWorkflowResultError` |
| undeclared failure mode               | `InvalidSkillWorkflowResultError` |
| missing/extra/wrong output            | `InvalidSkillWorkflowResultError` |

An Error, domain Error, string, number, boolean, object, function, symbol,
bigint, `null`, `undefined`, or hostile value thrown by the call is contained
as `SkillWorkflowExecutionError`. No original value, message, or stack escapes.
No automatic retry occurs.

## Normalized Skill Execution Result

The exact immutable result union is:

```text
{
  operationId: AuthorizationOperationIdentifier,
  skillId: SkillIdentifier,
  skillVersion: SkillVersion,
  capability: SkillCapabilityIdentifier,
  status: "succeeded",
  outputs: SkillInvocationOutputData
}
```

```text
{
  operationId: AuthorizationOperationIdentifier,
  skillId: SkillIdentifier,
  skillVersion: SkillVersion,
  capability: SkillCapabilityIdentifier,
  status: "failed",
  failureMode: SkillFailureModeIdentifier
}
```

Success contains every and only declared output. Business failure contains one
exact declared failure mode and no output or message.

The result is authority-bearing only as the return of the configured Protected
Invoke Skill Contract for the current operation and target. Public construction
or matching shape is structural only. Brain may trust only the governed return.

Before return, Skill deeply freezes the exact normalized result, registers its
identity in the current Engine instance's private result `WeakSet`, and records
operation, Skill Identifier, Version, and capability correspondence in its
private result `WeakMap`.

## Normalized Result Authority Verifier Contract

Metadata:

| Property                         | Value                                                                                        |
| -------------------------------- | -------------------------------------------------------------------------------------------- |
| Contract name                    | Verify Normalized Skill Execution Result                                                     |
| Contract version                 | 1.0.0                                                                                        |
| Schema custodian                 | Core                                                                                         |
| Domain semantic owner            | Skill Engine                                                                                 |
| Implementation responsibility    | issuing Skill Engine read-only verifier                                                      |
| Synchrony                        | strict synchronous request/response                                                          |
| Exact request                    | unknown candidate plus exact expected operation/Skill/Version/capability record              |
| Exact success                    | primitive boolean                                                                            |
| Legitimate unavailable           | `false` for every non-member or correspondence mismatch                                      |
| Guarantee                        | identity and expected operation/target/capability verification only                          |
| Prohibited behavior              | mint/add, structural trust, mutation, policy, execution, result reinterpretation             |
| Direct request failure           | malformed verifier request returns `false` without inspecting hostile nested semantic fields |
| Collaborator/source throw        | contained and returns `false`                                                                |
| Malformed returned-value failure | impossible internal verifier result is `InvalidSkillExecutionStateError`                     |
| Correspondence failure           | returns `false`                                                                              |
| Provenance guarantee             | only the issuing Skill instance's exact registered result identity can return `true`         |

The verifier is exposed only as a read-only Core-custodied port:

```text
verify(
  candidate: unknown,
  expected: {
    operationId: AuthorizationOperationIdentifier,
    skillId: SkillIdentifier,
    skillVersion: SkillVersion,
    capability: SkillCapabilityIdentifier
  }
) -> boolean
```

It exposes no registry, token, membership enumeration, or mint/add operation.
Brain may use this configured port to verify the exact Contract-returned result.
A clone, factory value, serialized reconstruction, or result from another
Engine instance returns `false`.

## Protected Authorization Enforcement

Protected Invoke MUST validate in this order:

1. pass the raw `authorizationEvaluation` candidate and expected operation to
   the exact configured read-only Security Outcome verifier without first
   performing unsafe nested property access;
2. require primitive `true`, establishing genuine issuing-instance Outcome
   authority and exact same-evaluation Artifact/Summary provenance;
3. independently perform protected single-read reconstruction and complete
   structural validation in the exact order Outcome envelope, contained
   Artifact, then contained Summary;
4. completely validate both contained values under their Core-custodied
   ENGINE-0009 schemas; and
5. perform exact enforcement correspondence.

Verifier authority is necessary but not sufficient. Primitive `true` never
authorizes unsafe raw access and never replaces protected structural or semantic
validation. Outcome, Artifact, and Summary extraction MUST apply the exact
hostile-runtime rules in this specification: own keys, canonical prototypes,
descriptors, getters, stateful getters, `ownKeys`, Proxy and revoked-Proxy traps,
enumerable symbols, extras, inherited substitutes, native-exception containment,
and exactly one protected read per accepted property.

The consumed Governed Security Evaluation Summary is exactly the
Core-custodied ENGINE-0009 value:

```text
{
  operationId: AuthorizationOperationIdentifier,
  subject: AuthorizationSubject,
  securityContext: {
    context: "available" | "unavailable" | "not-applicable",
    device: "available" | "unavailable" | "not-applicable",
    session: "available" | "unavailable" | "not-applicable",
    trustLevel: "available" | "unavailable" | "not-applicable"
  }
}
```

There is no `permissionsStatus`, raw Security Context value, or Skill-owned
Summary substitute.

For exact enforcement, let `artifact` be the exact reconstructed
`authorizationEvaluation.authorization` and `summary` the exact reconstructed
`authorizationEvaluation.securityEvaluationSummary`. The Artifact MUST:

- have decision `allow`;
- match request, target, requirements, Context projection, Outcome verifier
  expectation, and Summary operation exactly;
- match both Context projection and Summary subject exactly, preserving
  anonymous/authenticated subject semantics;
- match action `skill.invoke`;
- match the exact identified target resource;
- match canonical required permissions exactly;
- match governed sensitivity exactly;
- have requirements status `available`;
- satisfy every M8 Security context/status invariant for its exact valid allow
  row and independently match the Summary:

  ```text
  artifact.securityContext.context
    === summary.securityContext.context

  artifact.securityContext.device
    === summary.securityContext.device

  artifact.securityContext.session
    === summary.securityContext.session

  artifact.securityContext.trustLevel
    === summary.securityContext.trustLevel
  ```

- have compatible grant-evidence and confirmation statuses;
- use policy `orion.minimum-authorization` version `1.0.0`; and
- match the Bound Skill Invocation Target and governed requirements completely.

The Summary is the immutable authorization-evaluation snapshot and the exclusive
expected source for these four statuses. The Artifact never supplies its own
expected values. Skill does not recompute Security policy, repeat evaluation,
or re-query Security Context, Device, Session, Trust, or other currentness
sources during enforcement. Later source changes do not rewrite the Summary.
This revision adds no time, expiration, revocation, persistence, or distributed
authority semantics. Skill Execution Context Projection remains the separate
operation Context authority defined by Active `1.0.0`.

Exact failure split:

| Condition                                                                                                                       | Failure                                       |
| ------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------- |
| missing/explicitly undefined request field or malformed envelope                                                                | `InvalidProtectedSkillInvocationInputError`   |
| naked Artifact, naked Summary, caller-created/public-factory Outcome, clone, spread, reconstruction, or serialization roundtrip | `InvalidGovernedAuthorizationEvaluationError` |
| fabricated, cross-runtime, cross-evaluation, or replaced-nested-value Outcome                                                   | `InvalidGovernedAuthorizationEvaluationError` |
| malformed/hostile Outcome or malformed/hostile contained Artifact or Summary                                                    | `InvalidGovernedAuthorizationEvaluationError` |
| verifier `false` or invalid same-evaluation provenance                                                                          | `InvalidGovernedAuthorizationEvaluationError` |
| resolver/evaluator/verifier native, domain, primitive, or hostile throw                                                         | `InvalidSkillExecutionStateError`             |
| valid governed `deny` or `indeterminate`                                                                                        | `SkillAuthorizationEnforcementError`          |
| valid governed `allow` with any operation, subject, status, or other semantic correspondence mismatch                           | `SkillAuthorizationEnforcementError`          |
| valid matching governed `allow`                                                                                                 | advance to `authorized`                       |

Every non-matching-allow path calls neither validator nor workflow.

## Skill Invocation Lifecycle Observer Contract

Metadata:

| Property                         | Value                                                                                                  |
| -------------------------------- | ------------------------------------------------------------------------------------------------------ |
| Contract name                    | Observe Skill Invocation Lifecycle                                                                     |
| Contract version                 | 1.0.0                                                                                                  |
| Schema custodian                 | Core event and synchronous observer function signature                                                 |
| Domain semantic owner            | Skill Engine                                                                                           |
| Implementation responsibility    | optional composition-provided diagnostic observer                                                      |
| Synchrony                        | immediate synchronous notification after a completed transition                                        |
| Exact request                    | one exact deeply frozen privacy-safe lifecycle event                                                   |
| Exact success                    | direct `undefined` return; return value has no semantics                                               |
| Legitimate unavailable           | observer may be absent                                                                                 |
| Guarantee                        | privacy-safe ordered observation only                                                                  |
| Prohibited behavior              | authority, lifecycle mutation/query, rejection/approval, protected identifiers, retention by Engine    |
| Direct request failure           | not public; invalid configured observer is `InvalidSkillExecutionStateError` before request inspection |
| Collaborator/source throw        | contained and ignored without changing Skill semantics                                                 |
| Malformed returned-value failure | ignored; observer return has no semantic meaning                                                       |
| Correspondence failure           | not applicable                                                                                         |
| Provenance guarantee             | none; observer events are diagnostic and non-authoritative                                             |

Core custodies exactly:

```text
type SkillInvocationLifecycleObserver =
  (event: SkillInvocationLifecycleEvent) => void

{
  sequence: integer,
  from: "none" | SkillInvocationLifecycleState,
  to: SkillInvocationLifecycleState,
  category:
    | "invocation-proposed"
    | "authority-admitted"
    | "authorization-accepted"
    | "input-accepted"
    | "workflow-started"
    | "execution-succeeded"
    | "business-failed"
    | "pre-execution-rejected"
    | "execution-failed"
}
```

Sequence starts at `1` independently for each invocation and increments by
exactly one. The Engine invokes the observer exactly once with a call site that
supplies primitive `undefined` as `thisArgument`, synchronously and immediately
after each completed internal transition. No claim is made about receiver
coercion inside the observer. The event is defensively reconstructed, deeply
frozen, and contains no
operation, Skill, Version, capability, subject, action, resource, permission,
input, output, Context, Security, failure mode, or native-error value.

The observer has no authority and cannot mutate, approve, reject, delay, or
replace an invocation. Any value it throws is contained and ignored; it is not
retried and does not change the current transition, result, failure, or later
semantic processing. Its direct return is ignored.

The Engine retains no lifecycle event or history and exposes no lifecycle query
or mutation API. Tests observe transitions using a test-owned observer sink.
Production composition may translate events into existing privacy-safe
diagnostics.

## Invocation Lifecycle

The closed states are:

```text
proposed
  → admitted
  → authorized
  → input-validated
  → executing
  → succeeded | failed
```

`rejected` is the only pre-execution terminal alternative:

```text
proposed → rejected
admitted → rejected
authorized → rejected
```

Lifecycle begins only after valid Engine state, exact protected-invocation
envelope, and operation syntax. Malformed request or operation creates no
lifecycle.

| Stage/outcome                                         | Transition                     | Public result                                 | Validator | Workflow |
| ----------------------------------------------------- | ------------------------------ | --------------------------------------------- | --------- | -------- |
| invalid Engine/pre-existing state                     | no lifecycle                   | `InvalidSkillExecutionStateError`             | no        | no       |
| malformed envelope/operation                          | no lifecycle                   | `InvalidProtectedSkillInvocationInputError`   | no        | no       |
| valid envelope/operation                              | enter `proposed`               | continue                                      | no        | no       |
| invalid target/requirements/workflow authority        | `proposed → rejected`          | `InvalidSkillAuthorityError`                  | no        | no       |
| invalid Context authority                             | `proposed → rejected`          | `InvalidSkillContextAuthorityError`           | no        | no       |
| naked/fabricated/cloned/cross-runtime/invalid Outcome | `proposed → rejected`          | `InvalidGovernedAuthorizationEvaluationError` | no        | no       |
| mixed-evaluation or replaced-nested-value Outcome     | `proposed → rejected`          | `InvalidGovernedAuthorizationEvaluationError` | no        | no       |
| valid Outcome authority with invalid Artifact/Summary | `proposed → rejected`          | `InvalidGovernedAuthorizationEvaluationError` | no        | no       |
| all authority and internal correspondence admitted    | `proposed → admitted`          | continue                                      | no        | no       |
| governed `deny` or `indeterminate`                    | `admitted → rejected`          | `SkillAuthorizationEnforcementError`          | no        | no       |
| governed `allow` correspondence mismatch              | `admitted → rejected`          | `SkillAuthorizationEnforcementError`          | no        | no       |
| exact matching governed `allow`                       | `admitted → authorized`        | continue                                      | no        | no       |
| malformed/mismatched inputs                           | `authorized → rejected`        | `InvalidProtectedSkillInvocationInputError`   | no        | no       |
| controlled validator rejection                        | `authorized → rejected`        | `SkillInputValidationError`                   | yes       | no       |
| validator throw                                       | `authorized → rejected`        | `SkillValidatorBoundaryError`                 | yes       | no       |
| invalid validator result                              | `authorized → rejected`        | `InvalidSkillValidationResultError`           | yes       | no       |
| validator accepted                                    | `authorized → input-validated` | continue                                      | yes       | no       |
| workflow begins                                       | `input-validated → executing`  | continue                                      | yes       | yes      |
| valid success                                         | `executing → succeeded`        | normalized success                            | yes       | yes      |
| declared business failure                             | `executing → failed`           | normalized business failure                   | yes       | yes      |
| workflow throw                                        | `executing → failed`           | `SkillWorkflowExecutionError`                 | yes       | yes      |
| invalid workflow result                               | `executing → failed`           | `InvalidSkillWorkflowResultError`             | yes       | yes      |
| impossible normalized-result construction             | `executing → failed`           | `InvalidSkillExecutionStateError`             | yes       | yes      |

Allowed transitions are exactly those shown. No transition is skipped,
reentered, resumed, retried, reversed, timestamped, externally mutated, or
persisted. Lifecycle is internal and has no public query Contract.

Every transition shown emits exactly one observer event after completion. The
event category is determined by the destination/outcome: `proposed` uses
`invocation-proposed`; `admitted` uses `authority-admitted`; `authorized` uses
`authorization-accepted`; `input-validated` uses `input-accepted`; `executing`
uses `workflow-started`; `succeeded` uses `execution-succeeded`; normalized
business `failed` uses `business-failed`; any transition to `rejected` uses
`pre-execution-rejected`; and execution-stage exceptional `failed` uses
`execution-failed`.

## Protected Invoke Behavior and Precedence

First-failure precedence is:

1. Engine lifecycle and pre-existing catalog, admission, policy, provenance, and
   internal state;
2. request envelope exactness;
3. operation identifier syntax;
4. Skill Binding, Bound Skill Invocation Target, and Admitted Skill Workflow
   provenance and correspondence;
5. Skill Execution Context Projection provenance and correspondence;
6. Skill Invocation Requirements provenance and correspondence;
7. raw Authorization Evaluation Outcome authority verification for the issuing
   Security instance/runtime and expected operation;
8. exact same-evaluation Artifact/Summary provenance established by that
   verifier;
9. protected Outcome, Artifact, and Summary reconstruction and complete
   structural validity;
10. exact authorization enforcement correspondence;
11. invocation input structure and declaration matching;
12. admitted validator invocation and result;
13. admitted workflow invocation;
14. raw workflow result validation; and
15. normalized-result construction and validation.

An earlier failure prevents every later hostile boundary and callback from being
inspected or invoked.

Failure mapping is exact:

- step 2 malformed request extraction produces
  `InvalidProtectedSkillInvocationInputError`;
- step 7 Outcome authority failure, step 8 same-evaluation failure, or step 9
  Outcome/Artifact/Summary structural failure produces
  `InvalidGovernedAuthorizationEvaluationError`;
- step 10 decision or correspondence failure produces
  `SkillAuthorizationEnforcementError`.

## Other Contract Precedence

### Admit Skill Workflow

1. lifecycle and pre-existing catalog/admission state;
2. request envelope;
3. canonical M7 catalog lookup and registration provenance;
4. validator/workflow structural admission;
5. capability and exact catalog-Version correspondence;
6. duplicate admission; and
7. constructed relation and resulting state.

### Select Skill

1. lifecycle and pre-existing catalog/admission/policy state;
2. request envelope;
3. capability;
4. discovery candidates and admissions;
5. fixed deterministic selection; and
6. constructed result.

### Bind Skill to Operation

1. lifecycle and pre-existing catalog/admission/provenance state;
2. request envelope;
3. operation identifier;
4. Skill Binding authority/correspondence;
5. snapshot derivation; and
6. constructed target.

### Resolve Skill Execution Context

1. authority lifecycle and pre-existing Context/provenance state;
2. request envelope;
3. operation;
4. Active Context Revision authority and structure;
5. lineage, revision, and subject derivation; and
6. constructed projection.

### Resolve Skill Invocation Requirements

1. authority lifecycle, classification configuration, and pre-existing state;
2. request envelope;
3. target authority and operation;
4. action/resource/permission derivation;
5. exact sensitivity resolver request;
6. sensitivity candidate provenance, structure, and correspondence;
7. governed sensitivity or unavailability; and
8. constructed result.

### Resolve Skill Invocation Sensitivity

1. authority lifecycle, immutable classification table, paired verifier, and
   pre-existing state;
2. request envelope;
3. action and resource;
4. exact table lookup;
5. constructed available or unavailable candidate; and
6. candidate authority registration and correspondence.

### Resolve Governed Authorization Evaluation

1. authority lifecycle, immutable configured Outcome evaluator/verifier
   capabilities, and pre-existing state;
2. request envelope;
3. nested exact Evaluate Authorization Outcome request;
4. exactly one Outcome collaborator invocation;
5. returned Outcome/Artifact/Summary hostile-safe validation;
6. exact issuing-Security Outcome verification;
7. same-evaluation provenance;
8. request operation/action/resource correspondence; and
9. exact Outcome return without replacement.

## Public Failure Model

The public M9 failure taxonomy is closed:

| Failure                                       | Exact privacy-safe message                   | Trigger                                                                                       |
| --------------------------------------------- | -------------------------------------------- | --------------------------------------------------------------------------------------------- |
| `InvalidSkillSelectionInputError`             | `Invalid Skill selection input.`             | malformed/hostile selection request or capability                                             |
| `InvalidSkillSelectionAuthorityError`         | `Invalid Skill selection authority.`         | corrupt candidate/admission or impossible selection                                           |
| `InvalidSkillWorkflowAdmissionError`          | `Invalid Skill workflow admission.`          | malformed admission, missing registration, unsupported capability, invalid validator/workflow |
| `DuplicateSkillWorkflowAdmissionError`        | `Duplicate Skill workflow admission.`        | every second admission for exact Skill Identifier and Version                                 |
| `InvalidBoundSkillTargetInputError`           | `Invalid bound Skill target input.`          | malformed target request or operation                                                         |
| `InvalidProtectedSkillInvocationInputError`   | `Invalid protected Skill invocation input.`  | malformed invocation envelope/input map or declaration mismatch                               |
| `InvalidSkillAuthorityError`                  | `Invalid Skill authority.`                   | fabricated/stale/wrong-runtime/mismatched Skill authority                                     |
| `InvalidSkillContextAuthorityError`           | `Invalid Skill Context authority.`           | fabricated/malformed/cross-operation Context projection                                       |
| `InvalidGovernedAuthorizationEvaluationError` | `Invalid governed authorization evaluation.` | invalid Outcome authority/provenance/structure or invalid contained Artifact/Summary          |
| `SkillAuthorizationEnforcementError`          | `Skill authorization enforcement failed.`    | valid governed deny/indeterminate or valid allow mismatch                                     |
| `SkillInputValidationError`                   | `Skill input validation failed.`             | controlled validator rejection                                                                |
| `SkillValidatorBoundaryError`                 | `Skill validator boundary failed.`           | validator throws any value                                                                    |
| `InvalidSkillValidationResultError`           | `Invalid Skill validation result.`           | malformed/hostile/Promise/thenable validator return                                           |
| `SkillWorkflowExecutionError`                 | `Skill workflow execution failed.`           | workflow throws any value                                                                     |
| `InvalidSkillWorkflowResultError`             | `Invalid Skill workflow result.`             | malformed/hostile/Promise/thenable/wrong-output/undeclared-failure result                     |
| `InvalidSkillExecutionStateError`             | `Invalid Skill execution state.`             | invalid lifecycle/pre-existing state, collaborator throw, or impossible constructed state     |

No additional public failure is permitted for a native exception, timeout,
cancellation, retry, Provider, Adapter, Event, persistence, or transport.
Declared business failure remains a normalized result, never an exception.

Messages contain no operation, Skill, capability, subject, action, resource,
permission, Context, Security status snapshot, input, output, failure-mode,
Artifact, Summary, Outcome, Security provenance, or native-error detail.

## Failure Normalization

For every configured collaborator:

- request validation failure belongs to that Contract's input failure;
- any value thrown by the collaborator maps to the owning boundary failure or
  `InvalidSkillExecutionStateError` where specified;
- a successfully returned malformed candidate maps to its exact evidence/result
  failure;
- the original thrown value, message, stack, object, or primitive never escapes;
- later stages remain untouched; and
- caller/source inputs remain unchanged and unfrozen.

## Determinism and Atomicity

Equivalent valid Engine state, inputs, and governed collaborators MUST produce
deeply equal public results and identical failures.

Semantic behavior MUST NOT depend on:

- Date or time;
- randomness or cryptographic randomness;
- locale or `localeCompare`;
- registration or object-property insertion order;
- environment variables;
- mutable global state;
- filesystem, network, queue, timer, or external service; or
- retry.

Admission and M7 catalog mutation are atomic. Protected invocation never
mutates catalog or admission state. A failed invocation leaves later invocation
behavior usable and equivalent.

## Immutability and Non-Mutation

Every successful public or governed value is defensively reconstructed and
deeply frozen, including every nested record and array.

Every validator/workflow invocation argument is independently defensively
reconstructed and deeply frozen before `Reflect.apply`.

The implementation MUST NOT:

- freeze, retain mutably, sort in place, rewrite, add, remove, normalize, or
  mutate caller/source objects;
- mutate validator or workflow request graphs;
- retain raw Context, authorization, input, output, or result graphs;
- mutate, freeze, replace, or register provenance for a Security-issued Outcome,
  Artifact, or Summary;
- expose mutable catalog/admission collections; or
- use shared mutable invocation or fault state.

Explicit tests MUST prove source graphs and nested arrays/maps remain deeply
equal and unfrozen on every success and failure path. Skill may reconstruct
safe local/domain copies only after the applicable authority stage permits
protected validation; it never mutates Security-private provenance.

The Engine may retain only:

- its accepted immutable M7 catalog representation;
- reconstructed immutable workflow-admission metadata;
- validated callable Contract capabilities required for admitted workflows; and
- private non-forgeable provenance state.

Admitted validator/workflow functions are the sole exception to domain-graph
reconstruction: they are intentionally retained by exact reference as
executable capabilities. The Engine does not freeze, mutate, bind, clone,
serialize, or treat their arbitrary properties as domain metadata. Admission
and invocation leave each external function object's own properties, prototype,
and extensibility unchanged.

Raw validator/workflow return source graphs are never frozen or mutated. Skill
reconstructs accepted semantic content into new canonical deeply frozen values.
It does not freeze or mutate any composition-provided Contract implementation.

## Synchronicity

Every M9 Contract returns or throws before its call completes.

M9 prohibits:

- Promise or thenable completion;
- callback completion (the lifecycle observer is notification only and cannot
  complete or influence an operation);
- stream;
- Event completion;
- queue;
- timer-driven completion;
- external wait; and
- asynchronous or distributed execution.

A Promise or thenable returned by validator/workflow is an invalid result, not
asynchronous support.

## Timeout, Cancellation, and Retry

M9 has:

- no timeout mechanism, duration, deadline, timer, or timeout failure;
- no cancellation request, state, token, callback, or partial result; and
- no automatic retry.

A new attempt requires a new operation, Bound Skill Invocation Target, Context
projection, requirements, governed Security evaluation, and protected
invocation. No artifact or authority from the failed operation authorizes it.

## Diagnostics and Privacy

Diagnostics may expose only:

- booleans;
- collection counts;
- lifecycle categories;
- selection/result categories;
- stable failure categories; and
- aggregate invocation counts.

Diagnostics and errors MUST NOT emit:

- operation or Skill identifiers;
- Skill Version or capability;
- subject;
- action or resource;
- permissions, grants, confirmation, or Security artifact details;
- Context lineage or revision;
- input/output names or values;
- failure-mode identifier or business payload;
- raw workflow result;
- native/hostile message, value, or stack; or
- credential, secret, token, or personal information.

Mandatory M9 diagnostics MUST remain visible at the repository-required debug,
info, warn, and error thresholds without leaking protected values.

## Bootstrap Demonstration Slice

Bootstrap MUST explicitly compose, without a service locator or DI framework:

- the existing Skill Engine;
- one deterministic registered Skill;
- one admitted ordinary synchronous validator/workflow function pair;
- one deterministic Context projection resolver plus paired verifier;
- one immutable Security-owned sensitivity classification table plus paired
  resolver/verifier;
- one deterministic requirements resolver plus paired verifier;
- one source-neutral authorization Outcome resolver backed by the configured
  Evaluate Authorization Outcome Contract plus the exact issuing-Security
  read-only Outcome verifier;
- one optional privacy-safe lifecycle observer;
- the Skill result authority verifier; and
- protected invocation.

The demonstration classification table contains an explicit exact entry:

```text
action: "skill.invoke"
resource: identified "skill:" + demo Skill Identifier
sensitivity: explicitly "standard" or explicitly "sensitive"
```

The fixture chooses and records one category; no fallback exists.

The deterministic demonstration MUST show:

- successful selection;
- successful protected invocation;
- declared business failure; and
- authorization rejection with zero workflow calls.

Bootstrap owns no selection, authorization, enforcement, workflow, or result
semantics and logs no protected values.

Bootstrap MUST NOT build a Summary or Outcome, mint provenance, compare statuses
as Security policy, invoke legacy Artifact evaluation for the protected
operation, or invoke Security twice.

Every normative Bootstrap and test validator/workflow fixture is
receiver-independent: it consumes only the explicit immutable argument for
governed semantics, requires no `.bind(...)` or method receiver, and receives
no Engine internal through `this`. This is fixture and Skill-implementation
conformance, not a claim that admission introspects closure or receiver use.

## Architecture Enforcement

Production architecture verification MUST prove:

- `@orion/skill` runtime dependency is exactly `@orion/core`;
- Core does not depend on Skill;
- Skill does not depend on Bootstrap, Infrastructure, Security, Context,
  Planning, Brain, another Engine implementation, Provider, or Adapter;
- Skill has no external runtime npm dependency;
- direct Engine implementation imports are rejected;
- all cross-boundary types and Contracts are Core-custodied; and
- cycles are absent.

Negative fixtures MUST independently fail for each forbidden direction. Existing
M0–M8 rules and fixtures remain unchanged and passing.

## Runtime Bounds

| Value                          | Bound                                                                                                   |
| ------------------------------ | ------------------------------------------------------------------------------------------------------- |
| Skill Identifier               | accepted M7 1–64 ASCII grammar                                                                          |
| Skill Version                  | accepted M7 5–128 ASCII Semantic Version                                                                |
| Capability                     | accepted M7 1–128 ASCII grammar                                                                         |
| Permission                     | accepted M7 3–128 ASCII grammar                                                                         |
| Input/output/failure name      | accepted M7 1–64 ASCII grammar                                                                          |
| Operation                      | CONCEPT-0004 1–128 ASCII grammar                                                                        |
| Action                         | fixed `skill.invoke`                                                                                    |
| Resource                       | derived identified `skill:` + Skill Identifier, 7–70 ASCII                                              |
| Manifest declaration snapshots | accepted M7 0–64                                                                                        |
| Admitted workflow capabilities | 1–64, exact manifest subset                                                                             |
| Input/output map               | 0–64, exact declared key set                                                                            |
| String scalar                  | 0–4096 Unicode code points, no `Cc`                                                                     |
| Integer scalar                 | `-(2^53 - 1)` through `2^53 - 1`, excluding negative zero                                               |
| Selection status               | `selected`, `unavailable`                                                                               |
| Sensitivity result status      | `available`, `unavailable`                                                                              |
| Validator status               | `accepted`, `rejected`                                                                                  |
| Result status                  | `succeeded`, `failed`                                                                                   |
| Invocation lifecycle           | `proposed`, `admitted`, `authorized`, `input-validated`, `executing`, `succeeded`, `failed`, `rejected` |
| Lifecycle observer sequence    | positive integer 1–6 within one synchronous invocation                                                  |
| Canonical scalar record        | null prototype, 0–64 own enumerable immutable data properties                                           |

No global invocation, candidate, catalog, concurrency, storage, or throughput
quota is introduced.

## Normative Testing Requirements

### Workflow Admission Tests

Tests MUST cover:

- non-Running precedence over hostile request;
- malformed and hostile exact request;
- missing catalog registration;
- accepted M7 registration followed by admission;
- caller-created Registered Skill unable to grant provenance;
- exact catalog Version copying;
- unsupported and valid capability subsets;
- 1 and 64 capabilities, 65 rejection, duplicates, canonical ordering;
- malformed validator and workflow candidates;
- ordinary and arrow validator/workflow functions accepted independently;
- async, generator, async-generator, and class constructor candidates rejected
  independently without invocation;
- object-with-method, handle, Promise, thenable, and generator iterator
  candidates rejected;
- extracted property method accepted only when the function independently
  conforms without `.bind(...)` or receiver state;
- reflective callable classification failure contained;
- callable custom properties ignored as metadata;
- callable object/prototype/extensibility unchanged and unfrozen;
- duplicate and identical duplicate admission;
- immutable projection;
- caller/source non-mutation and non-freezing; and
- no invocation lifecycle for admission failure.

### Selection Tests

Tests MUST cover:

- malformed/hostile request;
- zero, one, and multiple eligible candidates;
- exact lowest Skill Identifier;
- registration-order and property-order independence;
- registered-without-workflow exclusion;
- unsupported admitted capability exclusion;
- version not affecting ranking;
- malformed/corrupt catalog and admission state;
- complete selected result and unavailable result;
- fabricated Skill Binding rejection;
- synchrony, determinism, immutability, and non-mutation.

### Binding and Target Tests

Tests MUST cover:

- valid and fabricated Skill Binding;
- malformed binding;
- operation grammar, wrong operation, and exact case;
- no operation allocation by Skill;
- fixed action and exact resource derivation;
- complete permission/input/output/failure snapshots;
- permission weakening/addition attempts;
- Version preservation;
- authority provenance;
- deep immutability; and
- caller/source non-mutation.

### Context Projection Tests

Tests MUST cover:

- valid Active revision;
- anonymous and authenticated subject;
- operation binding and wrong operation;
- fabricated/malformed projection;
- successor activation and source expiry after issuance;
- continued validity for the original operation;
- cross-operation reuse rejection;
- no invocation-time Context query;
- no Skill-to-Context implementation call/dependency; and
- exact paired verifier acceptance/rejection;
- source throw and malformed/hostile return normalization; and
- immutability/non-mutation.

### Sensitivity Classification Tests

Tests MUST directly cover:

- exact `standard`, exact `sensitive`, and governed unavailable;
- immutable construction-time table and deterministic lookup;
- identical and contradictory duplicate configuration rejection;
- wrong action and wrong resource;
- caller-proposed sensitivity impossible;
- fabricated, cloned, serialized, cross-runtime, and malformed candidate;
- paired verifier provenance;
- invalid/hostile request and returned result;
- source Error, domain Error, primitive, and hostile throw containment;
- no wildcard, hierarchy, fallback, update, or removal;
- privacy, synchrony, protected single reads, and source non-mutation.

### Requirements Tests

Tests MUST cover:

- governed available and unavailable;
- no implicit sensitivity fallback;
- caller sensitivity injection/downgrade rejection;
- complete permissions and weakening rejection;
- exact action/resource/operation;
- fabricated and malformed requirements;
- canonical permissions;
- equivalence with M8 requirements used for evaluation; and
- sensitivity resolver called once with exact action/resource;
- classification provenance, malformed result, correspondence failure, and
  source-throw mapping;
- exact paired requirements verifier acceptance/rejection;
- source non-mutation.

### Governed Authorization Evaluation Tests

Tests MUST cover:

- exact valid resolver request and exact genuine `allow`, `deny`, and
  `indeterminate` Outcome returns;
- missing, explicit `undefined`, extra, primitive, array, function, enumerable
  symbol, and inherited request cases;
- hostile request `ownKeys`, descriptors, getters, stateful getters, Proxy, and
  revoked Proxy;
- exactly one configured Evaluate Authorization Outcome call and zero legacy
  Evaluate Authorization calls for the same operation;
- evaluator throwing Error, Security domain error, primitive, and hostile value,
  each mapping to `InvalidSkillExecutionStateError`;
- malformed and hostile Outcome return;
- Outcome, Artifact, and Summary operation correspondence plus Artifact
  action/resource correspondence;
- genuine Outcome accepted by the exact issuing-Security verifier;
- naked Artifact, naked Summary, caller-created pair, public Core-factory
  Outcome, clone, spread, serialized/reconstructed Outcome, and cross-runtime
  Outcome rejected;
- cross-evaluation Artifact A/Summary B and Artifact B/Summary A rejected,
  including identical-visible-value pairs;
- replaced nested Artifact and replaced nested Summary rejected;
- verifier false mapping to `InvalidGovernedAuthorizationEvaluationError`;
- verifier throw or non-boolean mapping to `InvalidSkillExecutionStateError`;
- provenance necessary but insufficient;
- valid Outcome authority with malformed/hostile contained Artifact or Summary;
- request, Outcome, Artifact, Summary, and source graphs unchanged and unfrozen;
  and
- privacy-safe failures with no Security/native secret or protected detail.

### Protected Invocation Tests

Tests MUST cover:

- complete exact request equality;
- missing/undefined `authorizationEvaluation`;
- null, primitives, arrays, functions, missing/extra fields, symbols, inherited
  substitutes, coercible objects, hostile getters/descriptors/Proxies, and
  stateful getters;
- fabricated target, Context, requirements, and governed evaluation;
- naked Artifact, naked Summary, fake Outcome, cloned Outcome, spread Outcome,
  reconstructed Outcome, cross-runtime Outcome, and cross-evaluation mix;
- malformed/hostile Outcome, malformed/hostile Artifact, and malformed/hostile
  Summary;
- valid governed deny and indeterminate;
- mismatched allow independently for operation, subject, action, resource,
  permissions, sensitivity, confirmation semantics, Context status, Device
  status, Session status, Trust Level status, policy/version, requirements, and
  target;
- matching allow;
- exact lifecycle and failure for every row;
- validator/workflow call counts;
- earlier failure suppressing every later boundary; and
- immutability/non-mutation.

Each authorization failure before exact matching `allow` MUST assert validator
count `0` and workflow count `0`.

### Same-Evaluation Authorization Tests

Tests MUST obtain:

```text
Outcome A -> Artifact A + Summary A
Outcome B -> Artifact B + Summary B
```

They MUST reject caller-created A/B aggregates, Artifact A plus Summary B, and
Artifact B plus Summary A, including when all visible operation, subject, and
four-status values are identical. Production fault controls, registry access,
or provenance minting seams are prohibited.

### Four-Status Authorization Mismatch Tests

Four independent tests MUST hold a genuine authoritative Summary unchanged and
prove:

- Context mismatch -> `SkillAuthorizationEnforcementError`;
- Device mismatch -> `SkillAuthorizationEnforcementError`;
- Session mismatch -> `SkillAuthorizationEnforcementError`; and
- Trust Level mismatch -> `SkillAuthorizationEnforcementError`.

Each test holds the other three statuses constant and asserts validator `0` and
workflow `0`. Because genuine nested values are frozen, tests MAY use isolated
test-only construction/verifier seams consistent with ENGINE-0009 authority
testing, but MUST NOT add a production export, fault option, environment switch,
or module-global mutable control.

### Single Evaluation and No-Requery Tests

Objective counters MUST prove one protected authorization resolution invokes
Evaluate Authorization Outcome exactly once, never invokes legacy Evaluate
Authorization for the same operation, and never performs a second evaluation to
obtain the Summary.

After Outcome issuance, Protected Invoke MUST make no evaluation, Security
Context, Device, Session, or Trust provider/currentness call merely to derive
expected statuses. The authoritative Summary remains the expected snapshot.

### Immutable Composition Capture Tests

This matrix is mandatory regression coverage for M9-IR-001. An implementation
that retains or re-reads caller-owned Skill execution configuration after
construction is non-conforming.

Tests MUST mutate the original caller-owned configuration graph after successful
Skill Engine construction and objectively prove that behavior remains based
only on the exact construction-time collaborators captured independently into
private immutable Engine-owned state.

For the authorization Outcome resolver, tests MUST:

1. construct the Engine with valid resolver `R1`;
2. replace the caller configuration's resolver with `R2` after construction;
3. execute a protected authorization flow;
4. assert `R1` call count is exactly `1`; and
5. assert `R2` call count `0`.

For the issuing-Security Outcome verifier, tests MUST:

1. construct the Engine with genuine verifier `V1`;
2. replace the caller configuration's verifier after construction with
   malicious verifier `V2` that always returns `true`;
3. submit fabricated, cloned, and cross-runtime Authorization Evaluation
   Outcomes independently;
4. assert each value remains rejected with captured `V1` call count exactly
   `1` for that case; and
5. assert `V2` call count `0`.

Where configuration uses a nested resolver/verifier pair or container, tests
MUST independently mutate `pair.resolver`, mutate `pair.verifier`, and replace
the entire pair object after construction. None may alter Engine behavior. The
same post-construction replacement matrix MUST cover every caller-owned external
M9 authority pair present in this specification: Skill Context
resolver/verifier, requirements resolver/verifier, authorization Outcome
resolver/verifier, and the applicable sensitivity authority configuration.

Lifecycle observer capture MUST be tested by constructing with observer `O1`,
replacing, removing, or mutating the original caller configuration's observer
property after construction, and performing an invocation with lifecycle
transitions. `O1` MUST receive the exact approved events and replacement
observer `O2` MUST receive exactly `0` events.

The configuration source and every nested pair/container MUST remain caller
owned and mutable. Construction MUST NOT freeze them, rewrite their properties,
replace caller references, or retain the mutable graph for later lookup. Tests
MUST prove the caller can mutate the original configuration and nested objects
without a freeze-related throw while captured Engine behavior remains stable.

Cross-runtime isolation MUST additionally be tested by:

1. constructing Engine A with the verifier for Security runtime A;
2. replacing the caller configuration verifier with a runtime B verifier or
   permissive verifier;
3. submitting a runtime B Outcome and asserting rejection;
4. submitting a genuine runtime A Outcome and asserting acceptance; and
5. asserting every replacement verifier call count is `0`.

After successful construction, tests MAY make the original configuration graph
malformed or hostile by installing throwing getters, a revoked Proxy-backed
nested pair, or non-callable replacement values. A later otherwise valid Engine
operation MUST remain unaffected, and every later configuration getter or trap
count MUST be `0`; the Engine does not validate post-construction mutations
because it MUST NOT consult that graph again.

Every applicable immutable-capture test MUST use exact counters/probes and
assert the captured collaborator's expected count, replacement collaborator
count `0`, malicious verifier count `0`, and later configuration getter/trap
count `0`. Returned behavior alone is insufficient evidence.

### Input Scalar and Map Tests

Tests MUST cover:

- zero, one, and 64 declared inputs and 65 rejection where constructible;
- exact, missing, and extra keys;
- canonical key ordering and exact case;
- `null`, booleans, integer min/max, overflow, negative zero, floats, `NaN`,
  infinities, bigint, symbol, object, array, function, Date, Buffer/binary, and
  coercible values;
- strings at 0, 4096, and 4097 code points;
- whitespace-only and non-BMP strings;
- every `Cc` rejection;
- hostile record/map boundary;
- protected one-read behavior; and
- non-mutation/non-freezing.

### Validator Tests

Tests MUST cover:

- the Workflow Admission Tests independently proving admission-time rejection
  of async-function, generator-function, async-generator-function,
  class-constructor, and method-holder validator candidates;
- valid exact result through an ordinary function;
- valid exact result through an arrow function whose fixture result depends
  only on the explicit argument;
- exact one-argument signature;
- a callable Proxy `apply` trap independently observes call-site
  `thisArg === undefined`;
- an ordinary non-strict function proves the call site supplies `undefined`
  without asserting that its body observes `undefined`;
- no `.bind(...)`, method receiver, Engine object, or authority is supplied;
- explicit immutable argument is the only governed semantic input;
- accepted and controlled rejected;
- native, domain, primitive, and hostile throws;
- thrown Error, string, number, object, symbol, and bigint containment;
- malformed and hostile return;
- Promise, thenable, and callback-like substitute;
- direct `undefined`, iterator, and scheduled-callback-with-invalid-direct-return;
- validator called exactly once;
- workflow never called after non-accepted validation;
- validation has no protected business effect;
- failure privacy; and
- argument deep freeze;
- source and callable-object non-mutation/non-freezing.

### Workflow Tests

Tests MUST cover:

- the Workflow Admission Tests independently proving admission-time rejection
  of async-function, generator-function, async-generator-function,
  class-constructor, and method-holder workflow candidates;
- valid exact result through an ordinary function;
- valid exact result through an arrow function whose fixture result depends
  only on the explicit argument;
- exact one-argument signature;
- a callable Proxy `apply` trap independently observes call-site
  `thisArg === undefined`;
- an ordinary non-strict function proves the call site supplies `undefined`
  without asserting that its body observes `undefined`;
- no `.bind(...)`, method receiver, Engine object, or authority is supplied;
- explicit immutable argument is the only governed semantic input;
- success and declared business failure;
- native, domain, primitive, and hostile throws;
- thrown Error, string, number, object, symbol, and bigint containment;
- malformed and hostile result;
- Promise and thenable;
- direct `undefined`, iterator, and scheduled-callback-with-invalid-direct-return;
- undeclared failure mode;
- missing, extra, malformed, zero, and maximum outputs;
- exact output map and canonical ordering;
- workflow called at most once;
- no automatic retry;
- later invocation usable after failure;
- failure containment/privacy; and
- argument deep freeze;
- source and callable-object non-mutation/non-freezing.

### Lifecycle Tests

Every lifecycle table row MUST be tested for:

- exact sequence;
- terminal state;
- exact error or complete result;
- validator call count;
- workflow call count; and
- no retry or retained mutable state.

No combined placeholder category is acceptable.

The configured observer MUST additionally prove:

- exact event for every transition and every Concept lifecycle row;
- sequences start at 1 and increment by one;
- independent invocations restart at 1;
- event objects are deeply frozen and privacy-safe;
- observer invocation occurs after, never before, the completed transition;
- observer throw is contained, not retried, and cannot change result/failure;
- no public history/query/mutation API or Engine-retained event history exists.

### Normalized Result Tests

Tests MUST cover:

- complete success equality;
- complete declared-failure equality;
- operation, Skill ID, Version, target, and capability correspondence;
- exact outputs and failure mode;
- output canonicalization;
- contradictory result union rejection;
- fabricated result unable to establish authority;
- configured Protected Invoke return authority;
- exact issuing-instance result verifier returns `true`;
- spread clone, structured clone, factory value, serialized reconstruction, and
  another-instance result return `false`;
- no verifier mint/add/enumeration API;
- deep freeze; and
- source non-mutation/non-freezing.

### Precedence Tests

Counter/probe tests MUST prove every step in:

- Admit Skill Workflow;
- Select Skill;
- Bind Skill to Operation;
- Resolve Skill Execution Context;
- Resolve Skill Invocation Sensitivity;
- Resolve Skill Invocation Requirements;
- Resolve Governed Authorization Evaluation; and
- Protected Invoke Skill.

Every earlier terminal result/failure MUST prevent later hostile boundaries and
callbacks from being inspected or called.

Authorization probes MUST additionally prove:

- invalid Outcome authority leaves contained Artifact/Summary hostile getters
  untouched wherever the verifier's closed negative result ends the stage;
- malformed contained authority prevents semantic enforcement;
- semantic mismatch prevents input validation, validator, and workflow; and
- these properties are observed by counters/traps rather than inferred from
  source-code ordering.

### Direct Resolver Contract Tests

Context, sensitivity, requirements, and governed-authorization resolver/verifier
pairs MUST each be invoked directly; transitive Protected Invoke tests are
insufficient. Each applicable port independently covers:

- exact valid request and result;
- missing field, explicit `undefined`, extra field, and enumerable symbol;
- null, primitive, array, function, and inherited substitute;
- hostile `ownKeys`, descriptor, getter, stateful getter, Proxy, and revoked
  Proxy;
- one protected read per accepted property/index;
- synchronous deterministic output;
- source Error, domain Error, primitive, and hostile throw normalization;
- malformed/hostile returned value;
- every exact correspondence mismatch;
- genuine identity accepted and shape/factory/clone/serialized/cross-runtime
  identity rejected;
- caller/source graph unchanged and unfrozen; and
- exact privacy-safe failure with no source message.

### Authority and Instance-Isolation Tests

For Admitted Skill Workflow, Skill Binding, Bound Skill Invocation Target,
Context projection, requirements, Authorization Decision Artifact, Governed
Security Evaluation Summary, Authorization Evaluation Outcome, and Normalized
Skill Execution Result as applicable, tests MUST prove:

- exact returned object accepted;
- spread clone rejected;
- structured clone or reconstruction rejected;
- same-shaped Core-factory value rejected;
- serialized/deserialized reconstruction rejected where serializable;
- value from another Skill Engine/composed authority instance rejected;
- Engine A admission and private authority are invisible to Engine B;
- a fresh instance rejects authority from a stopped/discarded earlier instance;
- no module-global registry and no public add/mint API exist; and
- weak registry membership does not require artificial value retention.

### Scalar Record Prototype Tests

Input and raw-output paths MUST each directly cover:

- source `{}` accepted;
- source `Object.create(null)` accepted;
- custom prototype, class instance, array, Map, Set, Date, and function rejected;
- inherited-only semantic property and enumerable symbol rejected;
- hostile `ownKeys`, descriptor, throwing getter, and stateful getter contained;
- accepted values read once;
- `__proto__`, `constructor`, and `prototype` accepted only when exactly
  declared and valid under M7;
- canonical reconstruction has `Object.getPrototypeOf(record) === null`;
- canonical keys are own enumerable data properties in code-point order; and
- source remains unchanged with its original prototype and unfrozen state.

### Hostile Runtime and Factory Tests

Every exported M9 Core factory and every Contract request/result MUST receive
direct applicable tests for:

- exact valid value and all lower/upper/overflow bounds;
- null, undefined, string, number, boolean, bigint, symbol, function, empty and
  populated arrays;
- malformed object, missing/extra fields, and enumerable symbol;
- hostile `ownKeys`, descriptors, getters, Proxy, and stateful getter;
- sparse/decorated arrays and hostile length/index behavior;
- coercible substitute;
- exact domain failure and no native exception leak;
- protected single-read behavior;
- deep freeze; and
- caller/source non-mutation and non-freezing.

Shared helper use does not replace direct invocation of each public factory.

### Privacy Tests

Diagnostics and public failures MUST be tested against operation IDs, Skill IDs,
Version, capability, subject, action/resource, permissions, input/output names
and values, Context references, Security details, failure modes, and native
messages/stacks.

The deterministic Bootstrap diagnostic MUST pass at debug, info, warn, and error
thresholds.

### Architecture Tests

Tests MUST cover the production dependency graph and independent negative
fixtures for every forbidden import direction, external runtime dependency,
cycle, and Core outward dependency.

## Acceptance Criteria

Active revision `1.1.0` remains conforming only when:

1. M7 registration remains unchanged and workflow admission is Running-only
   after registration.
2. Only canonical catalog plus governed workflow pairs are selectable.
3. The fixed selection policy is exact and deterministic.
4. Skill Binding precedes operation allocation.
5. Bound Skill Invocation Target derivation is exact.
6. Context, requirements, and authorization authorities are non-forgeable.
7. Caller-controlled sensitivity or permission weakening is impossible.
8. A naked or fabricated allow never permits execution.
9. Only exact valid governed allow correspondence reaches validation.
10. Validator rejection/error never calls the workflow.
11. Workflow is synchronous and called at most once.
12. Business failure is a normalized result; Engine failures are exceptions.
13. Every lifecycle and failure row is objective and exact.
14. Every successful value is deeply immutable.
15. Caller/source graphs remain unchanged and unfrozen.
16. No native/hostile exception or private value leaks.
17. Equivalent inputs are deterministic.
18. One failed invocation does not poison later use.
19. Diagnostics remain privacy-safe at every required level.
20. Skill production dependency is exactly Core.
21. All accepted M0–M8 gates remain passing.
22. No deferred capability is introduced.
23. Validator/workflow representation, signature, direct-return completion, and
    call-site `thisArgument` are exact; function-body receiver observation is
    outside the Contract.
24. Skill-minted authority uses only per-instance private identity registries,
    and external authority uses only paired typed resolver/verifier ports.
25. Sensitivity comes only from the immutable exact Security classification
    table and never defaults.
26. Every Contract has direct failure/provenance tests.
27. Lifecycle transitions are objectively observable only through the
    non-authoritative privacy-safe observer.
28. Every accepted scalar record is canonically reconstructed with null
    prototype.
29. Protected authorization consumes only one exact Security-issued
    Authorization Evaluation Outcome containing its Artifact and Summary.
30. Exactly one Evaluate Authorization Outcome call occurs for one protected
    authorization resolution, with no legacy or duplicate evaluation.
31. The exact issuing-Security verifier establishes same-evaluation authority,
    and Skill independently performs protected structural and semantic
    validation.
32. Expected Context, Device, Session, and Trust Level statuses come only from
    the genuine Summary and are compared independently.
33. Naked, fabricated, factory-created, cloned, reconstructed, cross-runtime,
    cross-evaluation, and replaced-nested-value authority never permits
    execution.
34. The exact resolver and verifier capabilities are captured immutably at
    construction without retaining caller configuration.
35. M9-IR-003 lifecycle/state failures remain
    `InvalidSkillExecutionStateError`, never the M7
    `InvalidSkillStateError`.
36. Every external authority port preserves hostile-safe request/result
    extraction, native containment, exact normalization, and the rule that
    verifier success is necessary but insufficient.

## Implementation-Review Alignment

- **M9-IR-001:** every composition-provided resolver, verifier, observer, and
  callable is captured into immutable Engine-owned construction locals; caller
  configuration is never retained or re-read.
- **M9-IR-003:** every M9 public operation maps invalid lifecycle, corrupt
  pre-existing M9 state, and impossible configured authority state to
  `InvalidSkillExecutionStateError`; the M7 `InvalidSkillStateError` is not used
  for an M9 operation.
- **M9-IR-004:** every external authority port requires exact hostile-safe
  request and result extraction, native exception containment, exact failure
  normalization, and complete validation after any verifier success.
- **M9-IR-005:** all Active `1.0.0` direct Core factory, admission, selection,
  binding, Context, sensitivity, requirements, inputs, validator, workflow,
  lifecycle, result, precedence, non-mutation, privacy, and architecture
  matrices remain mandatory; the `1.1.0` authorization matrices are additive.

## Explicitly Deferred

M9 explicitly defers:

- timeout implementation;
- cancellation;
- automatic retry, compensation, rollback, and idempotency policy;
- asynchronous, Promise-based, callback, streamed, queued, timer-driven, and
  distributed execution;
- external Skill discovery/loading;
- installation and package management;
- health/readiness state;
- sandbox, process, container, worker, or VM isolation;
- persistence, database, catalog store, invocation history, result store, audit
  store, replay store, cache, and filesystem;
- Events runtime and `SkillExecuted` Event;
- Providers, Adapters, external services, and network execution;
- configurable selection policy;
- configurable Security policy;
- plan-bound execution;
- Brain implementation;
- confirmation acquisition;
- external IAM; and
- a separate Execution Engine.

## Open Questions

No implementation-critical semantic question remains for the M9 slice. The M9
implementation is conforming, review-accepted, and released.

Future timeout, cancellation, async execution, external Skill packaging,
isolation infrastructure, Events, persistence, Providers/Adapters, richer
selection, plan binding, and distributed execution require separately reviewed
authority.

## Change History

| Version | Status     | Date       | Change                                                                                                                                                                            |
| ------- | ---------- | ---------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `1.1.1` | Active     | 2026-08-12 | Corrected current M9 implementation correspondence without changing Skill, authorization, protected-invocation, failure, or deferred-feature semantics.                           |
| `1.1.0` | Superseded | 2026-07-28 | Approved M9 Engine Specification revision aligning protected Skill invocation with the Security-issued Authorization Evaluation Outcome and Governed Security Evaluation Summary. |
| `1.0.0` | Superseded | 2026-07-28 | Approved initial M9 Engine Specification.                                                                                                                                         |

## Related Documents

- [ADR-0006 — Skill Selection, Binding, and Protected Invocation Ownership](../../../docs/adr/ADR-0006-Skill-Selection-Binding-and-Protected-Invocation-Ownership.md)
- [CONCEPT-0005 — Skill Invocation and Execution Model](../../concepts/CONCEPT-0005-Skill-Invocation-and-Execution-Model.md)
- [CONCEPT-0004 — Authorization Model](../../concepts/CONCEPT-0004-Authorization-Model.md)
- [ENGINE-0008 — Skill Engine](ENGINE-0008-Skill-Engine.md)
- [ENGINE-0009 — Security Engine](../security/ENGINE-0009-Security-Engine.md)
- [OES-0002 — Engine Design](../../../docs/engineering/OES-0002-Engine-Design.md)
- [OES-0003 — Skill Design](../../../docs/engineering/OES-0003-Skill-Design.md)
- [OES-0004 — Contracts](../../../docs/engineering/OES-0004-Contracts.md)
- [OES-0008 — Documentation Standards](../../../docs/engineering/OES-0008-Documentation-Standards.md)
- [OES-0009 — Security Standards](../../../docs/engineering/OES-0009-Security-Standards.md)

## Engineering Motto

> Select deterministically. Authorize exactly. Execute once.
