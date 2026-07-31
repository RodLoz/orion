# ENGINE-0001 — Brain Engine

| Field          | Value                                                     |
| -------------- | --------------------------------------------------------- |
| **Status**     | Active                                                    |
| **Version**    | 1.0.0                                                     |
| **Owner**      | Project Maintainers                                       |
| **Milestone**  | M10 — Brain Orchestration Foundation                      |
| **Created**    | 2026-07-29                                                |
| **Updated**    | 2026-07-29                                                |
| **Applies To** | Brain Engine, Core Brain Contracts, and M10 orchestration |

---

## Status

This specification is Active and authoritative. ADR-0007 and CONCEPT-0006 are
also Active. M10 is ready for implementation planning but remains not
implemented.

The key words **MUST**, **MUST NOT**, **SHOULD**, **SHOULD NOT**, and **MAY**
describe normative requirements.

## Purpose

M10 defines the smallest complete Brain Engine vertical slice. It accepts one
normalized cognitive request, coordinates existing public Contracts in a
strict synchronous sequence, and returns one immutable final cognitive result.

## Capability Ownership

Brain Engine owns only:

- orchestration request and final-result semantics;
- high-level sequencing and deterministic branching;
- orchestration lifecycle and precedence;
- operation allocation coordination;
- invocation coordination; and
- Brain-level failure normalization.

Brain Engine MUST NOT own or reproduce Identity, Context, Memory, Knowledge,
Reasoning, Planning, Skill, Security, workflow, transport, persistence, or
presentation semantics.

## Scope

M10 includes:

- one process-local Brain Engine instance;
- one request at a time per synchronous call;
- exact request reconstruction;
- retrieval and authority verification of one Active Context Revision;
- one Reasoning call and authority verification;
- one Planning call and authority verification;
- exact cross-stage correspondence;
- deterministic no-Skill or Skill branching;
- one M9 Skill selection/binding/authorization/invocation path where required;
- one final-result construction and authority registration;
- closed failures and lifecycle observation; and
- Bootstrap composition through Core-custodied Contracts.

M10 supplies empty Memory and Knowledge Reference collections to Reasoning. It
does not call Memory or Knowledge.

## Engine Lifecycle

Brain Engine follows:

```text
created → initialized → running → stopped
```

- initialization is deterministic and performs no orchestration;
- only `running` accepts `Orchestrate Cognitive Request`;
- stopping is synchronous;
- stopped is terminal for M10; and
- an orchestration request outside `running` produces
  `InvalidBrainExecutionStateError` before request inspection or lifecycle
  observation.

## Required Configuration

Construction requires exact Contract ports for:

1. Get Active Context Revision plus the issuer-owned Context verifier;
2. Evaluate Reasoning plus the issuer-owned Reasoning verifier;
3. Create Candidate Plan plus the issuer-owned Planning verifier;
4. Skill selection;
5. Authorization Operation Identifier allocation;
6. Skill binding;
7. M9 Skill execution Context resolution;
8. M9 Skill requirements resolution;
9. governed Authorization Outcome resolution;
10. protected Skill invocation;
11. normalized Skill-result verification; and
12. optional Brain lifecycle observation.

Every port except the function-only optional observer MUST be an exact plain or
null-prototype record containing own enumerable data-descriptor functions. A
class instance, prototype method, accessor, symbol, inherited callable,
Proxy-trapped record, missing function, or extra property is invalid.

Brain MUST capture every callable receiver-free into private immutable state at
construction. It MUST never re-read, bind, mutate, or freeze caller-owned
configuration. Invalid configuration produces `InvalidBrainAuthorityError`
before the Engine becomes initialized.

## Public Contract Navigation Summary (Non-Normative)

This section is only a navigation summary. The Complete M10 Contract Catalog
below is normative and controls every field, owner, failure, count, authority,
and privacy rule.

### Orchestrate Cognitive Request

| Property         | Value                                           |
| ---------------- | ----------------------------------------------- |
| Contract         | `Orchestrate Cognitive Request`                 |
| Version          | `1.0.0`                                         |
| Schema custodian | Core                                            |
| Semantic owner   | Brain Engine                                    |
| Implementation   | Brain Engine                                    |
| Synchrony        | strict synchronous request/response             |
| Input            | exact CONCEPT-0006 Normalized Cognitive Request |
| Success          | exact authority-bearing Final Cognitive Result  |
| Failures         | closed M10 taxonomy only                        |
| Retry            | none                                            |

### Verify Final Cognitive Result

| Property         | Value                                                                |
| ---------------- | -------------------------------------------------------------------- |
| Contract         | `Verify Final Cognitive Result`                                      |
| Version          | `1.0.0`                                                              |
| Schema custodian | Core                                                                 |
| Semantic owner   | Brain Engine                                                         |
| Implementation   | issuing Brain Engine                                                 |
| Input            | one of the three exact discriminated verifier requests defined below |
| Output           | primitive boolean                                                    |
| Guarantee        | read-only identity and exact correspondence verification             |

The verifier returns `false` for malformed, cloned, cross-runtime,
wrong-request, wrong-operation, replaced-nested-value, or non-issued values. It
MUST NOT mint, register, convert, freeze, or throw for ordinary invalid input.

### Brain Context Authority

```text
resolve({
  intent: "resolve-brain-context",
  lineageId: ContextLineageIdentity
}) → unknown

verify(candidate, {
  lineageId: ContextLineageIdentity
}) → exact ActiveContextRevision or Context authority failure
```

The resolver delegates to Context capability semantics. Its configured verifier
must establish genuine issuing-runtime authority and expected lineage. Brain
then validates complete M2 structure, Active state, and correspondence.
Context remains the semantic and runtime owner; Core is schema custodian.
Bootstrap may compose only the issuer-owned pair and MUST NOT mint authority.

### Brain Reasoning Authority

```text
evaluate({
  intent: "evaluate",
  activeContextRevision,
  query,
  memoryReferences: [],
  knowledgeReferences: []
}) → unknown

verify(candidate, {
  contextLineageId,
  contextRevisionId,
  contextRevisionNumber
}) → exact ReasoningOutcome or Reasoning authority failure
```

The authority delegates to M5 `Evaluate Reasoning`. Brain validates the public
returned structure, invokes the Reasoning-owned verifier with its exact
consumed-Context expectations, and accepts the exact successful return as
authoritative. Brain does not independently decide Reasoning semantic validity,
Context-semantic representation, or explanatory/rule correctness.
Reasoning remains the semantic and runtime owner; Core is schema custodian.
Bootstrap may compose only the issuer-owned pair and MUST NOT mint authority.

### Brain Planning Authority

```text
create({
  intent: "create-candidate-plan",
  reasoningOutcome
}) → unknown

verify(candidate, { reasoningOutcome }) → exact CandidatePlan or Planning authority failure
```

The authority delegates to M6 `Create Candidate Plan`. Brain validates the
public returned structure, invokes the Planning-owned verifier with its exact
issuer-owned expectations, and accepts the exact successful return as
authoritative. Brain does not independently validate Planning source,
explainability, Reasoning-derived, category, or step semantics.
Planning remains the semantic and runtime owner; Core is schema custodian.
Bootstrap may compose only the issuer-owned pair and MUST NOT mint authority.

### Allocate Authorization Operation Identifier

```text
allocate({
  intent: "allocate-authorization-operation",
  requestId,
  binding
}) → AuthorizationOperationIdentifier
```

The allocator is technology-neutral and owns only mechanical unique allocation
within the process-local runtime. It is called exactly once on the Skill branch
after selection and before binding. Its output is validated with the existing
Core Authorization Operation Identifier rules. It receives no query, Context,
Skill inputs, permissions, authorization evidence, or mutable handle.
Brain owns the allocation requirement and timing; Core is schema custodian; a
Bootstrap-supplied process-local allocator may implement the mechanism without
acquiring Brain, Skill, or Security semantics.

### Reused M9 Contracts

Brain invokes, without redefining:

- `Select Skill`;
- `Bind Skill to Operation`;
- `Resolve Skill Execution Context`;
- `Resolve Skill Invocation Requirements`;
- `Resolve Governed Authorization Evaluation`;
- `Protected Invoke Skill`; and
- `Verify Normalized Skill Execution Result`.

Each reused M9 operation is one atomic public Contract boundary. ENGINE-0010
owns its internal validation order. Brain owns only the stage before invocation
and exact returned-value handling after return.

## Complete M10 Contract Catalog

This section is the complete metadata for the shorthand Contract descriptions
above.

### Common Boundary Policy

Every request is an exact ordinary record with `Object.prototype` or null
prototype, exactly the named own enumerable string data properties, no
accessor, symbol, inherited substitute, extra field, or explicit `undefined`.
Protected prototype, own-key, and descriptor inspection contains revoked and
hostile Proxies. No native exception escapes.

Every configured callable is captured receiver-free at Brain construction,
invoked at most once per orchestration, and never retried. No Contract mutates
or freezes caller or issuer graphs. Class/prototype mutable ports are rejected
as `InvalidBrainAuthorityError` during Brain construction. All diagnostic
restrictions follow CONCEPT-0006.

Core is the schema custodian and versioning owner of every Contract in this
catalog. Each subsection states its capability semantic owner, runtime owner,
caller, purpose, exact request and output, guarantees, failure behavior, count,
retry, mutation, authority, correspondence, and privacy rules. The common
boundary policy supplies the prohibited-field and hostile-object rules where a
subsection does not repeat them.

### Orchestrate Cognitive Request 1.0.0

| Property               | Exact rule                                                                                  |
| ---------------------- | ------------------------------------------------------------------------------------------- |
| Semantic/runtime owner | Brain Engine / Brain Engine                                                                 |
| Caller                 | protected process-local caller                                                              |
| Request                | exact five-field Normalized Cognitive Request                                               |
| Required/optional      | all five fields required; none optional                                                     |
| Prohibited             | operation, subject, transport, timestamp, callback, authority evidence, every unnamed field |
| Output                 | exact authority-bearing Final Cognitive Result union                                        |
| Authority              | issuing Brain registers only the exact final result                                         |
| Correspondence         | exact request and branch; exact operation/Skill/result on Skill branch                      |
| Failures               | closed Brain taxonomy by failed stage                                                       |
| Native handling        | normalized; no lower-level/native error or public cause                                     |
| Count/retry            | one public call; subordinate counts are lifecycle-row-specific / none                       |
| Mutation/privacy       | defensive reconstruction; source unchanged; field privacy table governs                     |

### Verify Final Cognitive Result 1.0.0

Semantic and runtime owner is the issuing Brain Engine. The exact allowed
callers are:

- the Brain Engine internal issuance path, which MAY invoke the verifier at
  most once for the Final Cognitive Result it is about to return; and
- a protected downstream Core-Contract consumer explicitly configured with the
  captured Brain verifier Contract, which MAY invoke it zero or one time per
  protected consumer operation.

Arbitrary consumers acquire no verifier access merely because the result is
public. Bootstrap MAY distribute the captured verifier port only to explicitly
configured protected consumers; it MUST NOT implement, wrap, replace, register,
or mint authority through that port. No allowed caller retries, invokes the
verifier repeatedly as a provenance oracle, registers authority, mutates the
result, or derives new authority. A failed verification returns `false`, ends
that verification attempt, and permits no retry.

The verifier is a total-boolean, read-only Contract. It never throws,
registers, mints, converts, freezes, mutates, or diagnoses a candidate. Every
malformed/trapped request, state defect, clone, cross-runtime value, replaced
nested result, or wrong correspondence returns `false`.

Exact response request:

```text
{
  intent: "verify-final-cognitive-response",
  candidate: unknown,
  expected: {
    kind: "response",
    requestId: BrainRequestIdentifier,
    response: CandidateResponse
  }
}
```

Exact request-more-context request:

```text
{
  intent: "verify-final-request-more-context",
  candidate: unknown,
  expected: {
    kind: "request-more-context",
    requestId: BrainRequestIdentifier,
    reason: "planning-requested-more-context"
  }
}
```

Both no-Skill variants prohibit operation, Skill identity, capability,
normalized Skill result, and execution evidence.

Exact Skill-result request:

```text
{
  intent: "verify-final-skill-result",
  candidate: unknown,
  expected: {
    kind: "skill-result",
    requestId: BrainRequestIdentifier,
    operationId: AuthorizationOperationIdentifier,
    skillId: SkillIdentifier,
    skillVersion: SkillVersion,
    capability: SkillCapabilityIdentifier,
    normalizedResult: NormalizedSkillExecutionResult
  }
}
```

The Skill variant requires a genuine Brain-issued outer envelope, exact
registered nested Skill-result identity, no nested replacement, and exact
correspondence with the expected operation, selected Skill, capability,
protected invocation result, and Skill branch. A structurally identical clone
of the nested Skill result returns `false`. None of the three requests has
optional fields. Brain maps internal `false` to
`InvalidFinalCognitiveResultError`.

### Get Active Context Revision 1.0.0

M10 reuses the existing Contract without changing it.

| Property                     | Exact M10 use                                                                           |
| ---------------------------- | --------------------------------------------------------------------------------------- |
| Semantic/runtime owner       | Context Engine / Context Engine                                                         |
| Caller                       | Brain Engine                                                                            |
| Request                      | `{ lineageIdentity: ContextLineageIdentity }`                                           |
| Required/optional/prohibited | one required field / none / every unnamed field                                         |
| Output                       | exact Context-issued Active Context Revision                                            |
| Authority                    | issuing Context registers exact successful return under prerequisite revision           |
| Correspondence               | requested lineage; Brain performs later Active/lineage checks                           |
| Failure mapping              | every Context failure, throw, malformed return, or trap → `BrainContextResolutionError` |
| Count/retry                  | exactly one / none                                                                      |
| Mutation/privacy             | no mutation; Context and identifiers prohibited from diagnostics                        |

### Verify Active Context Revision Authority 1.0.0

```text
{
  intent: "verify-active-context-revision-authority",
  candidate: unknown,
  expectedLineageIdentity: ContextLineageIdentity,
  expectedRevisionIdentity: ContextRevisionIdentity,
  expectedRevisionNumber: ContextRevisionNumber
}
```

Context Engine is semantic and runtime owner; Brain is caller. All shown fields
are required; none is optional; every unnamed field is prohibited. Success
returns the exact same registered Active Context Revision. Issuer-owned closed
Context authority failures are normalized by Brain to
`BrainContextResolutionError`. Invocation is exactly once after structural
validation, with no retry, minting, mutation, or diagnostic value exposure.

This Contract is authoritative under Active ENGINE-0003 revision 1.1.0.
Bootstrap may compose only the Context-owned callable.

### Evaluate Reasoning 1.0.0

M10 reuses the existing Contract with the exact five-field request:

```text
{
  intent: "evaluate",
  activeContextRevision,
  query,
  memoryReferences: [],
  knowledgeReferences: []
}
```

Reasoning Engine is semantic/runtime owner and Brain is caller. No field is
optional in M10; every unnamed field is prohibited. Output is the exact
Reasoning-issued Reasoning Outcome, registered by that runtime under the
prerequisite revision. Every Reasoning failure, throw, malformed return, or trap
maps to `BrainReasoningResolutionError`. Invocation is exactly once, no retry,
no mutation, and no query/Context/Outcome diagnostics.

### Verify Reasoning Outcome Authority 1.0.0

```text
{
  intent: "verify-reasoning-outcome-authority",
  candidate: unknown,
  consumedContextRevision: ActiveContextRevision,
  expectedLineageIdentity: ContextLineageIdentity,
  expectedRevisionIdentity: ContextRevisionIdentity,
  expectedRevisionNumber: ContextRevisionNumber
}
```

Reasoning Engine is semantic/runtime owner and Brain is caller. Fields are exact
and required; none is optional. Success returns the exact same registered
Reasoning Outcome. Issuer-owned closed Reasoning authority failures are
normalized by Brain to `BrainReasoningResolutionError`. It is invoked once,
never retried, read-only, non-minting, non-mutating, and diagnostically private.

This Contract is authoritative under Active ENGINE-0006 revision 1.1.0.

### Create Candidate Plan 1.0.0

M10 reuses the exact existing request:

```text
{
  intent: "create-candidate-plan",
  reasoningOutcome: ReasoningOutcome
}
```

Planning Engine is semantic/runtime owner and Brain is caller. Both fields are
required; none is optional; every unnamed field is prohibited. Output is the
exact Planning-issued Candidate Plan, registered under the prerequisite
revision. Every Planning failure, throw, malformed return, or trap maps to
`BrainPlanningResolutionError`. Invocation is exactly once, no retry, no
mutation, and no Reasoning/Planning diagnostic exposure.

### Verify Candidate Plan Authority 1.0.0

```text
{
  intent: "verify-candidate-plan-authority",
  candidate: unknown,
  consumedReasoningOutcome: ReasoningOutcome,
  expectedReasoningStatus: "completed",
  expectedReasoningCategory: ReasoningOutcomeCategory,
  expectedCandidateNextAction: CandidateNextAction,
  expectedIdentityState: "anonymous" | "authenticated",
  expectedMemoryReferenceCount: integer 0..20,
  expectedKnowledgeReferenceCount: integer 0..20,
  expectedReasoningRuleCategory: ReasoningRuleCategory
}
```

Planning Engine is semantic/runtime owner and Brain is caller. Fields are exact
and required; none is optional. Success returns the exact same registered
Candidate Plan. Issuer-owned closed Planning authority failures are normalized
by Brain to `BrainPlanningResolutionError`. It is invoked once, never retried,
read-only, non-minting, non-mutating, and diagnostically private.

This Contract is authoritative under Active ENGINE-0007 revision 1.1.0.

### Allocate Authorization Operation Identifier 1.0.0

```text
{
  intent: "allocate-authorization-operation",
  requestId: BrainRequestIdentifier,
  skillId: SkillIdentifier,
  skillVersion: SkillVersion,
  capability: SkillCapabilityIdentifier
}
```

Brain owns allocation timing; the configured process-local allocator owns only
the collision-free mechanism. Brain is the only M10 caller. All five fields are
required; none is optional. Operation, action, resource, permissions, inputs,
authorization evidence, and every unnamed field are prohibited.

The output is a primitive Authorization Operation Identifier satisfying the
existing syntax, collision-free and non-reused within the allocating Brain
runtime. The private allocation record binds request/Skill/version/capability
for later correspondence. It grants no Skill, action, resource, permission, or
Security authority.

Throw, rejection-like/thenable value, non-string, malformed identifier,
duplicate, or correspondence defect maps to `BrainSkillCoordinationError`.
Invocation is exactly once after selected-Binding acceptance on the Skill
branch, zero on no-Skill branches, and never retried. State is process-local
only and non-persistent. Inputs remain unchanged and all fields are prohibited
from diagnostics. A malformed configured allocator is
`InvalidBrainAuthorityError`. A caller-supplied operation is
`InvalidBrainRequestError`, never ignored.

### Observe Brain Orchestration Lifecycle 1.0.0

```text
{
  sequence: positive safe integer,
  from: "none" | BrainOrchestrationLifecycleState,
  to: BrainOrchestrationLifecycleState,
  category: BrainOrchestrationTransitionCategory,
  diagnosticCorrelationId: BrainDiagnosticCorrelationIdentifier
}
```

Brain owns lifecycle semantics; the configured observer owns no authority.
Brain calls it immediately after each committed transition with the exact
five-field frozen event. All fields are required; none is optional. Request ID,
operation, Context, content, Plan, Skill/Security value, native cause, and every
unnamed field are prohibited.

Sequence starts at one per attempt and increments once per committed
transition. Its exact output is `void`; any returned value is ignored. Throw,
thenable, mutation, or hostile
behavior is contained; authoritative result/error/state/branch and collaborator
counts remain unchanged. There is no retry or recursive observer invocation.
One `brain-lifecycle-observer-failed` diagnostic may be emitted with only the
diagnostic correlation, transition category, and failure category.

Omission is valid. A present non-function or malformed observer is
`InvalidBrainAuthorityError` during construction.

### Issuer-Owned Authority Prerequisites

ENGINE-0003 1.1.0, ENGINE-0006 1.1.0, and ENGINE-0007 1.1.0 are Active and
provide the required issuer-owned verifier Contracts. Bootstrap may compose the
exact issuer-owned callables but MUST NOT issue, register, wrap, or simulate
their authority.

The exact Active prerequisites are the
[ENGINE-0003 Context Authority Revision 1.1.0](context/ENGINE-0003-Context-Engine-Authority-Revision-1.1.0.md),
[ENGINE-0006 Reasoning Authority Revision 1.1.0](reasoning/ENGINE-0006-Reasoning-Engine-Authority-Revision-1.1.0.md),
and
[ENGINE-0007 Planning Authority Revision 1.1.0](planning/ENGINE-0007-Planning-Engine-Authority-Revision-1.1.0.md).

The M10 specification set is Active and ready for implementation planning. M10
remains not implemented.

## Exact Request

The exact request is the CONCEPT-0006 five-field request:

```text
{
  intent,
  requestId,
  contextLineageId,
  query,
  executionIntent
}
```

`executionIntent` is exactly `{ kind: "none" }` or the exact three-field
`skill-capability` record containing capability and canonical M9 inputs.

The operation identifier is deliberately absent. The normative precedence
`request structure → operation correspondence` does not apply because accepting
a request operation would contradict ADR-0006. Operation syntax and
correspondence are validated after allocation and at every M9 bound stage.

## Exact Results

M10 returns exactly one of the three CONCEPT-0006 result variants:

- `response`;
- `request-more-context`; or
- `skill-result`.

Brain MUST defensively construct a fresh immutable outer result. It MUST NOT return a
Candidate Plan, Planning step, Context Revision, Reasoning Outcome, Security
Outcome, Skill Binding, or Bound Target as the final result.

For `skill-result`, after successful protected invocation and Skill-owned
verification, Brain MUST embed the exact verified immutable Skill-issued
normalized result object. Brain MUST NOT clone, reconstruct, spread,
deserialize, rebuild, or replace it or any nested value. Skill retains semantic
and authority ownership of that nested result; Brain owns only the outer
envelope, its discriminant, request correlation, and Brain-owned orchestration
metadata. Brain authority registration records the exact nested Skill-result
identity associated with the issued envelope. The nested operation MUST match
both the allocated operation and top-level result operation.

Final-result authority is private to the issuing Brain instance. Public Core
factories validate shape but do not confer authority.

## Deterministic Orchestration

### Common Stages

1. Verify Engine state.
2. Validate and reconstruct the request.
3. Resolve one Context candidate.
4. Validate Context structure.
5. Verify Context issuing-runtime authority.
6. Verify Active state and request-lineage correspondence.
7. Evaluate Reasoning once.
8. Validate Reasoning structure.
9. Invoke the Reasoning-owned verifier with its exact consumed-Context
   expectations and accept the exact successful return as authoritative.
10. Create a Candidate Plan once from that exact verified Reasoning Outcome.
11. Validate Candidate Plan structure.
12. Invoke the Planning-owned verifier with its exact Reasoning, source,
    explainability, category, and step expectations and accept the exact
    successful return as authoritative.
13. Choose the closed branch and enforce only Brain-owned branch
    correspondence.

### No-Skill Branches

- `request-more-context` produces that final result regardless of
  `executionIntent`.
- `respond` plus `executionIntent.kind = "none"` copies the exact Candidate
  Response into a `response` result.

Both branches make zero Skill selection, operation allocation, binding,
Security, protected invocation, or normalized-result verifier calls.

### Skill Branch

`respond` plus `executionIntent.kind = "skill-capability"`:

1. calls Select Skill once with the exact requested capability;
2. rejects governed `unavailable` as `BrainSkillCoordinationError`;
3. validates the selected result, Binding authority, and capability
   correspondence;
4. allocates one operation;
5. binds the selected Skill to that operation once;
6. validates the Bound Target authority and operation/capability
   correspondence;
7. resolves M9 Skill execution Context using the resolved Active Context;
8. resolves M9 invocation requirements for the target;
9. obtains one genuine governed Authorization Evaluation Outcome;
10. calls Protected Invoke Skill once with exact M9 values and request inputs;
11. verifies the normalized result through the issuing Skill runtime; and
12. constructs and registers one `skill-result`.

Brain does not inspect authorization policy or pre-enforce `allow`. The
Skill-owned protected boundary enforces the genuine M8/M9 Outcome. A denied,
indeterminate, invalid, or non-corresponding Outcome therefore produces the
normalized `BrainProtectedInvocationError` when protected invocation rejects.

## Normative Atomic Stage Precedence

Every row is one mandatory adjacent pair. A future test fails stage N exactly,
instruments stage N+1, and asserts N+1 count zero, the listed public failure, no
retry, unchanged source graphs, and no later lifecycle transition. A valid
control reaches callable N+1 exactly once.

| ID   | Stage N                                       | Stage N+1                                                   | Exact failure if N fails            |
| ---- | --------------------------------------------- | ----------------------------------------------------------- | ----------------------------------- |
| P01  | Engine lifecycle eligibility                  | request-envelope inspection                                 | `InvalidBrainExecutionStateError`   |
| P02  | request envelope                              | request field/nested structure                              | `InvalidBrainRequestError`          |
| P03  | complete request structure                    | diagnostic-correlation construction                         | `InvalidBrainRequestError`          |
| P04  | diagnostic-correlation construction           | Get Active Context Revision invocation                      | `InvalidBrainExecutionStateError`   |
| P05  | Context Contract invocation                   | Context returned-structure validation                       | `BrainContextResolutionError`       |
| P06  | Context returned structure                    | Context issuer-verifier invocation                          | `BrainContextResolutionError`       |
| P07  | Context verifier result                       | request-lineage correspondence                              | `BrainContextResolutionError`       |
| P08  | Context lineage correspondence                | Context Active-state correspondence                         | `BrainContextResolutionError`       |
| P09  | Context Active-state correspondence           | Evaluate Reasoning invocation                               | `BrainContextResolutionError`       |
| P10  | Reasoning Contract invocation                 | Reasoning returned-structure validation                     | `BrainReasoningResolutionError`     |
| P11  | Reasoning returned structure                  | Reasoning issuer-verifier invocation                        | `BrainReasoningResolutionError`     |
| P12  | Reasoning verifier result                     | exact verified Reasoning acceptance                         | `BrainReasoningResolutionError`     |
| P13  | exact verified Reasoning acceptance           | Create Candidate Plan invocation                            | `BrainReasoningResolutionError`     |
| P14  | Planning Contract invocation                  | Candidate Plan returned-structure validation                | `BrainPlanningResolutionError`      |
| P15  | Candidate Plan returned structure             | Planning issuer-verifier invocation                         | `BrainPlanningResolutionError`      |
| P16  | Planning verifier result                      | exact verified Plan acceptance                              | `BrainPlanningResolutionError`      |
| P17  | exact verified Plan acceptance                | deterministic Skill-requirement branch decision             | `BrainPlanningResolutionError`      |
| P18  | deterministic branch decision                 | accepted Brain-owned branch correspondence                  | `InvalidBrainPlanError`             |
| P23  | accepted no-Skill branch correspondence       | no-Skill final-result construction                          | `InvalidBrainPlanError`             |
| P24  | no-Skill final-result construction            | Brain authority registration                                | `InvalidFinalCognitiveResultError`  |
| P25  | no-Skill Brain authority registration         | no-Skill final-result verifier invocation                   | `InvalidFinalCognitiveResultError`  |
| P26  | no-Skill final verifier result                | exact no-Skill return                                       | `InvalidFinalCognitiveResultError`  |
| P27  | accepted Skill-required branch correspondence | Select Skill invocation                                     | `BrainSkillCoordinationError`       |
| P28  | Select Skill Contract invocation              | selected-result structure validation                        | `BrainSkillCoordinationError`       |
| P29  | selected-result structure                     | selected Binding provenance acceptance                      | `BrainSkillCoordinationError`       |
| P29A | selected Binding provenance acceptance        | selected capability correspondence                          | `BrainSkillCoordinationError`       |
| P29B | selected capability correspondence            | exact selected-result acceptance                            | `BrainSkillCoordinationError`       |
| P30  | exact selected-result acceptance              | operation allocator invocation                              | `BrainSkillCoordinationError`       |
| P31  | allocator invocation                          | allocated-operation syntax validation                       | `BrainSkillCoordinationError`       |
| P32  | allocated-operation syntax                    | Bind Skill to Operation atomic invocation                   | `BrainSkillCoordinationError`       |
| P33  | Bind Contract invocation                      | Bound Target structure validation                           | `BrainSkillCoordinationError`       |
| P34  | Bound Target structure                        | configured-return authority acceptance                      | `BrainSkillCoordinationError`       |
| P35  | Bound Target authority acceptance             | Bound Target operation correspondence                       | `BrainSkillCoordinationError`       |
| P36  | Bound Target operation correspondence         | Bound Target capability correspondence                      | `BrainSkillCoordinationError`       |
| P37  | Bound Target capability correspondence        | Resolve Skill Execution Context atomic invocation           | `BrainSkillCoordinationError`       |
| P38  | M9 Context Contract invocation                | M9 Context returned-structure validation                    | `BrainSkillCoordinationError`       |
| P39  | M9 Context returned structure                 | configured-return authority acceptance                      | `BrainSkillCoordinationError`       |
| P40  | M9 Context authority acceptance               | M9 Context operation correspondence                         | `BrainSkillCoordinationError`       |
| P41  | M9 Context operation correspondence           | Resolve Skill Invocation Requirements atomic invocation     | `BrainSkillCoordinationError`       |
| P42  | requirements Contract invocation              | requirements returned-structure validation                  | `BrainSkillCoordinationError`       |
| P43  | requirements returned structure               | configured-return authority acceptance                      | `BrainSkillCoordinationError`       |
| P44  | requirements authority acceptance             | requirements operation correspondence                       | `BrainSkillCoordinationError`       |
| P45  | requirements operation correspondence         | requirements action correspondence                          | `BrainSkillCoordinationError`       |
| P46  | requirements action correspondence            | requirements resource correspondence                        | `BrainSkillCoordinationError`       |
| P47  | requirements resource correspondence          | Resolve Governed Authorization Evaluation atomic invocation | `BrainSkillCoordinationError`       |
| P48  | governed authorization Contract invocation    | Authorization Outcome returned-structure validation         | `BrainAuthorizationResolutionError` |
| P49  | Authorization Outcome returned structure      | configured-return authority acceptance                      | `BrainAuthorizationResolutionError` |
| P50  | Authorization Outcome authority acceptance    | Outcome operation correspondence                            | `BrainAuthorizationResolutionError` |
| P51  | Outcome operation correspondence              | Outcome action correspondence                               | `BrainAuthorizationResolutionError` |
| P52  | Outcome action correspondence                 | Outcome resource correspondence                             | `BrainAuthorizationResolutionError` |
| P53  | complete Outcome correspondence               | Protected Invoke Skill atomic invocation                    | `BrainAuthorizationResolutionError` |
| P54  | Protected Invoke Contract invocation          | normalized Skill-result structure validation                | `BrainProtectedInvocationError`     |
| P55  | normalized Skill-result structure             | Verify Normalized Skill Execution Result atomic invocation  | `BrainProtectedInvocationError`     |
| P56  | normalized-result verifier result             | Skill final-result construction                             | `BrainProtectedInvocationError`     |
| P57  | Skill final-result construction               | Brain authority registration                                | `InvalidFinalCognitiveResultError`  |
| P58  | Skill Brain authority registration            | Skill final-result verifier invocation                      | `InvalidFinalCognitiveResultError`  |
| P59  | Skill final verifier result                   | exact Skill-result return                                   | `InvalidFinalCognitiveResultError`  |

There are **57 normative precedence rows**. P23–P26 and P27–P59 are mutually
exclusive branches.

Bind Skill to Operation, Resolve Skill Execution Context, Resolve Skill
Invocation Requirements, Resolve Governed Authorization Evaluation, Protected
Invoke Skill, and Verify Normalized Skill Execution Result are atomic M9 public
boundaries. ENGINE-0010 owns their internal ordering. Brain does not invent
internal issuer stages, but validates returned structure, exact
configured-return identity, and each listed external correspondence.

Internal construction and registry stages use isolated non-public seams plus
public-verifier observation. Source ordering alone is insufficient evidence.

## Orchestration Lifecycle

States and categories are exactly those in CONCEPT-0006. The event sequence
starts at one for every call and restarts at one for the next call.

Transitions occur only after the named stage has completed and its
correspondence is valid. In particular:

- `planned` occurs only after exact Planning verifier success and acceptance;
- `skill-required` occurs before Skill selection;
- `bound` occurs only after a genuine corresponding Bound Target exists;
- `authorization-resolved` means only that the governed Outcome was obtained;
  it does not make Brain the authorization authority;
- `invoking` occurs immediately before calling Protected Invoke; and
- `completed` occurs only after valid final-result construction and
  registration.

## Normative Row-Local Lifecycle Matrix

The exact count vector for every row is:

```text
C/CV/R/RV/P/PV/S/O/B/TV/X/XV/Q/QV/A/AV/I/NV/FC/AR/FV
```

`C`, `R`, and `P` are the Context resolver, Reasoning evaluator, and Planning
creator. `CV`, `RV`, and `PV` are their issuer-owned verifiers. `S` is Select,
`O` is operation allocation, and `B` is the atomic Bind Contract. `TV` is
Brain's Bound Target structure/authority/correspondence validation attempt.
`X/XV`, `Q/QV`, and `A/AV` are respectively the atomic M9 Context,
requirements, and governed-authorization calls followed by Brain's returned
value validation attempt. `I` is Protected Invoke, `NV` is the atomic
normalized-result verifier, `FC` is final-result construction, `AR` is Brain
authority registration, and `FV` is final-result verification. A validation
attempt is one count even when one of its ordered checks fails.

Transition notation is `from>to[category]`. Every sequence below is complete,
not a prefix reference. `Obs` is the exact observer call count when an observer
is configured; it equals the number of committed transitions. `Retry=0` is
normative for every collaborator and observer.

| ID       | Trigger                                                                     | Exact public result/error                                                                                                                         | Complete ordered transitions                                                                                                                                                                                                                                                                                                                                                                                               | Exact count vector                          | Obs | Retry | Terminal    |
| -------- | --------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------- | --: | ----: | ----------- |
| BLC-001A | invalid configured Brain authority or port                                  | `InvalidBrainAuthorityError`                                                                                                                      | none                                                                                                                                                                                                                                                                                                                                                                                                                       | `0/0/0/0/0/0/0/0/0/0/0/0/0/0/0/0/0/0/0/0/0` |   0 |     0 | none        |
| BLC-001B | impossible initial Brain execution state                                    | `InvalidBrainExecutionStateError`                                                                                                                 | none                                                                                                                                                                                                                                                                                                                                                                                                                       | `0/0/0/0/0/0/0/0/0/0/0/0/0/0/0/0/0/0/0/0/0` |   0 |     0 | none        |
| BLC-002  | invalid request structure                                                   | `InvalidBrainRequestError`                                                                                                                        | none                                                                                                                                                                                                                                                                                                                                                                                                                       | `0/0/0/0/0/0/0/0/0/0/0/0/0/0/0/0/0/0/0/0/0` |   0 |     0 | none        |
| BLC-003  | caller supplies an operation identifier                                     | `InvalidBrainRequestError`                                                                                                                        | none                                                                                                                                                                                                                                                                                                                                                                                                                       | `0/0/0/0/0/0/0/0/0/0/0/0/0/0/0/0/0/0/0/0/0` |   0 |     0 | none        |
| BLC-004  | diagnostic-correlation construction fails                                   | `InvalidBrainExecutionStateError`                                                                                                                 | none                                                                                                                                                                                                                                                                                                                                                                                                                       | `0/0/0/0/0/0/0/0/0/0/0/0/0/0/0/0/0/0/0/0/0` |   0 |     0 | none        |
| BLC-005  | Context resolver throws/fails                                               | `BrainContextResolutionError`                                                                                                                     | `none>proposed[orchestration-proposed], proposed>rejected[orchestration-rejected]`                                                                                                                                                                                                                                                                                                                                         | `1/0/0/0/0/0/0/0/0/0/0/0/0/0/0/0/0/0/0/0/0` |   2 |     0 | `rejected`  |
| BLC-006  | invalid Context structure                                                   | `BrainContextResolutionError`                                                                                                                     | `none>proposed[orchestration-proposed], proposed>rejected[orchestration-rejected]`                                                                                                                                                                                                                                                                                                                                         | `1/0/0/0/0/0/0/0/0/0/0/0/0/0/0/0/0/0/0/0/0` |   2 |     0 | `rejected`  |
| BLC-007  | Context issuer verification fails                                           | `BrainContextResolutionError`                                                                                                                     | `none>proposed[orchestration-proposed], proposed>rejected[orchestration-rejected]`                                                                                                                                                                                                                                                                                                                                         | `1/1/0/0/0/0/0/0/0/0/0/0/0/0/0/0/0/0/0/0/0` |   2 |     0 | `rejected`  |
| BLC-008  | Context lineage correspondence fails                                        | `BrainContextResolutionError`                                                                                                                     | `none>proposed[orchestration-proposed], proposed>rejected[orchestration-rejected]`                                                                                                                                                                                                                                                                                                                                         | `1/1/0/0/0/0/0/0/0/0/0/0/0/0/0/0/0/0/0/0/0` |   2 |     0 | `rejected`  |
| BLC-009  | Context active-revision correspondence fails                                | `BrainContextResolutionError`                                                                                                                     | `none>proposed[orchestration-proposed], proposed>rejected[orchestration-rejected]`                                                                                                                                                                                                                                                                                                                                         | `1/1/0/0/0/0/0/0/0/0/0/0/0/0/0/0/0/0/0/0/0` |   2 |     0 | `rejected`  |
| BLC-010  | Reasoning evaluator throws/fails                                            | `BrainReasoningResolutionError`                                                                                                                   | `none>proposed[orchestration-proposed], proposed>contextualized[context-resolved], contextualized>rejected[orchestration-rejected]`                                                                                                                                                                                                                                                                                        | `1/1/1/0/0/0/0/0/0/0/0/0/0/0/0/0/0/0/0/0/0` |   3 |     0 | `rejected`  |
| BLC-011  | invalid Reasoning structure                                                 | `BrainReasoningResolutionError`                                                                                                                   | `none>proposed[orchestration-proposed], proposed>contextualized[context-resolved], contextualized>rejected[orchestration-rejected]`                                                                                                                                                                                                                                                                                        | `1/1/1/0/0/0/0/0/0/0/0/0/0/0/0/0/0/0/0/0/0` |   3 |     0 | `rejected`  |
| BLC-012  | Reasoning issuer verification fails                                         | `BrainReasoningResolutionError`                                                                                                                   | `none>proposed[orchestration-proposed], proposed>contextualized[context-resolved], contextualized>rejected[orchestration-rejected]`                                                                                                                                                                                                                                                                                        | `1/1/1/1/0/0/0/0/0/0/0/0/0/0/0/0/0/0/0/0/0` |   3 |     0 | `rejected`  |
| BLC-015  | Planning creator throws/fails                                               | `BrainPlanningResolutionError`                                                                                                                    | `none>proposed[orchestration-proposed], proposed>contextualized[context-resolved], contextualized>reasoned[reasoning-completed], reasoned>rejected[orchestration-rejected]`                                                                                                                                                                                                                                                | `1/1/1/1/1/0/0/0/0/0/0/0/0/0/0/0/0/0/0/0/0` |   4 |     0 | `rejected`  |
| BLC-016  | invalid Candidate Plan structure                                            | `BrainPlanningResolutionError`                                                                                                                    | `none>proposed[orchestration-proposed], proposed>contextualized[context-resolved], contextualized>reasoned[reasoning-completed], reasoned>rejected[orchestration-rejected]`                                                                                                                                                                                                                                                | `1/1/1/1/1/0/0/0/0/0/0/0/0/0/0/0/0/0/0/0/0` |   4 |     0 | `rejected`  |
| BLC-017  | Candidate Plan issuer verification fails                                    | `BrainPlanningResolutionError`                                                                                                                    | `none>proposed[orchestration-proposed], proposed>contextualized[context-resolved], contextualized>reasoned[reasoning-completed], reasoned>rejected[orchestration-rejected]`                                                                                                                                                                                                                                                | `1/1/1/1/1/1/0/0/0/0/0/0/0/0/0/0/0/0/0/0/0` |   4 |     0 | `rejected`  |
| BLC-020  | valid request-more-context branch                                           | `{ status: "completed", kind: "request-more-context", requestId: exactRequestId, reason: "planning-requested-more-context" }`                     | `none>proposed[orchestration-proposed], proposed>contextualized[context-resolved], contextualized>reasoned[reasoning-completed], reasoned>planned[planning-completed], planned>completed[no-skill-completed]`                                                                                                                                                                                                              | `1/1/1/1/1/1/0/0/0/0/0/0/0/0/0/0/0/0/1/1/1` |   5 |     0 | `completed` |
| BLC-021  | valid no-Skill response branch                                              | `{ status: "completed", kind: "response", requestId: exactRequestId, response: exactCandidateResponse }`                                          | `none>proposed[orchestration-proposed], proposed>contextualized[context-resolved], contextualized>reasoned[reasoning-completed], reasoned>planned[planning-completed], planned>completed[no-skill-completed]`                                                                                                                                                                                                              | `1/1/1/1/1/1/0/0/0/0/0/0/0/0/0/0/0/0/1/1/1` |   5 |     0 | `completed` |
| BLC-022  | no-Skill final construction fails                                           | `InvalidFinalCognitiveResultError`                                                                                                                | `none>proposed[orchestration-proposed], proposed>contextualized[context-resolved], contextualized>reasoned[reasoning-completed], reasoned>planned[planning-completed], planned>rejected[orchestration-rejected]`                                                                                                                                                                                                           | `1/1/1/1/1/1/0/0/0/0/0/0/0/0/0/0/0/0/1/0/0` |   5 |     0 | `rejected`  |
| BLC-023  | no-Skill Brain authority registration fails                                 | `InvalidFinalCognitiveResultError`                                                                                                                | `none>proposed[orchestration-proposed], proposed>contextualized[context-resolved], contextualized>reasoned[reasoning-completed], reasoned>planned[planning-completed], planned>rejected[orchestration-rejected]`                                                                                                                                                                                                           | `1/1/1/1/1/1/0/0/0/0/0/0/0/0/0/0/0/0/1/1/0` |   5 |     0 | `rejected`  |
| BLC-024  | no-Skill exact final verification fails                                     | `InvalidFinalCognitiveResultError`                                                                                                                | `none>proposed[orchestration-proposed], proposed>contextualized[context-resolved], contextualized>reasoned[reasoning-completed], reasoned>planned[planning-completed], planned>rejected[orchestration-rejected]`                                                                                                                                                                                                           | `1/1/1/1/1/1/0/0/0/0/0/0/0/0/0/0/0/0/1/1/1` |   5 |     0 | `rejected`  |
| BLC-025  | Brain branch decision does not correspond to the exact verified Plan fields | `InvalidBrainPlanError`                                                                                                                           | `none>proposed[orchestration-proposed], proposed>contextualized[context-resolved], contextualized>reasoned[reasoning-completed], reasoned>planned[planning-completed], planned>rejected[orchestration-rejected]`                                                                                                                                                                                                           | `1/1/1/1/1/1/0/0/0/0/0/0/0/0/0/0/0/0/0/0/0` |   5 |     0 | `rejected`  |
| BLC-026A | governed Skill selection returns its normal closed unavailable outcome      | `BrainSkillCoordinationError`                                                                                                                     | `none>proposed[orchestration-proposed], proposed>contextualized[context-resolved], contextualized>reasoned[reasoning-completed], reasoned>planned[planning-completed], planned>skill-required[skill-required], skill-required>rejected[orchestration-rejected]`                                                                                                                                                            | `1/1/1/1/1/1/1/0/0/0/0/0/0/0/0/0/0/0/0/0/0` |   6 |     0 | `rejected`  |
| BLC-026B | Skill selection Contract throws or fails unexpectedly                       | `BrainSkillCoordinationError`                                                                                                                     | `none>proposed[orchestration-proposed], proposed>contextualized[context-resolved], contextualized>reasoned[reasoning-completed], reasoned>planned[planning-completed], planned>skill-required[skill-required], skill-required>rejected[orchestration-rejected]`                                                                                                                                                            | `1/1/1/1/1/1/1/0/0/0/0/0/0/0/0/0/0/0/0/0/0` |   6 |     0 | `rejected`  |
| BLC-027  | invalid selected-result structure                                           | `BrainSkillCoordinationError`                                                                                                                     | `none>proposed[orchestration-proposed], proposed>contextualized[context-resolved], contextualized>reasoned[reasoning-completed], reasoned>planned[planning-completed], planned>skill-required[skill-required], skill-required>rejected[orchestration-rejected]`                                                                                                                                                            | `1/1/1/1/1/1/1/0/0/0/0/0/0/0/0/0/0/0/0/0/0` |   6 |     0 | `rejected`  |
| BLC-028  | selected-result capability correspondence fails                             | `BrainSkillCoordinationError`                                                                                                                     | `none>proposed[orchestration-proposed], proposed>contextualized[context-resolved], contextualized>reasoned[reasoning-completed], reasoned>planned[planning-completed], planned>skill-required[skill-required], skill-required>rejected[orchestration-rejected]`                                                                                                                                                            | `1/1/1/1/1/1/1/0/0/0/0/0/0/0/0/0/0/0/0/0/0` |   6 |     0 | `rejected`  |
| BLC-029A | operation allocator invocation throws or fails                              | `BrainSkillCoordinationError`                                                                                                                     | `none>proposed[orchestration-proposed], proposed>contextualized[context-resolved], contextualized>reasoned[reasoning-completed], reasoned>planned[planning-completed], planned>skill-required[skill-required], skill-required>rejected[orchestration-rejected]`                                                                                                                                                            | `1/1/1/1/1/1/1/1/0/0/0/0/0/0/0/0/0/0/0/0/0` |   6 |     0 | `rejected`  |
| BLC-030  | allocator succeeds but returns a malformed or invalid operation identifier  | `BrainSkillCoordinationError`                                                                                                                     | `none>proposed[orchestration-proposed], proposed>contextualized[context-resolved], contextualized>reasoned[reasoning-completed], reasoned>planned[planning-completed], planned>skill-required[skill-required], skill-required>rejected[orchestration-rejected]`                                                                                                                                                            | `1/1/1/1/1/1/1/1/0/0/0/0/0/0/0/0/0/0/0/0/0` |   6 |     0 | `rejected`  |
| BLC-031  | atomic Bind Contract throws/fails                                           | `BrainSkillCoordinationError`                                                                                                                     | `none>proposed[orchestration-proposed], proposed>contextualized[context-resolved], contextualized>reasoned[reasoning-completed], reasoned>planned[planning-completed], planned>skill-required[skill-required], skill-required>rejected[orchestration-rejected]`                                                                                                                                                            | `1/1/1/1/1/1/1/1/1/0/0/0/0/0/0/0/0/0/0/0/0` |   6 |     0 | `rejected`  |
| BLC-032  | invalid Bound Target structure                                              | `BrainSkillCoordinationError`                                                                                                                     | `none>proposed[orchestration-proposed], proposed>contextualized[context-resolved], contextualized>reasoned[reasoning-completed], reasoned>planned[planning-completed], planned>skill-required[skill-required], skill-required>rejected[orchestration-rejected]`                                                                                                                                                            | `1/1/1/1/1/1/1/1/1/1/0/0/0/0/0/0/0/0/0/0/0` |   6 |     0 | `rejected`  |
| BLC-033  | Bound Target authority fails                                                | `BrainSkillCoordinationError`                                                                                                                     | `none>proposed[orchestration-proposed], proposed>contextualized[context-resolved], contextualized>reasoned[reasoning-completed], reasoned>planned[planning-completed], planned>skill-required[skill-required], skill-required>rejected[orchestration-rejected]`                                                                                                                                                            | `1/1/1/1/1/1/1/1/1/1/0/0/0/0/0/0/0/0/0/0/0` |   6 |     0 | `rejected`  |
| BLC-034  | Bound Target operation correspondence fails                                 | `BrainSkillCoordinationError`                                                                                                                     | `none>proposed[orchestration-proposed], proposed>contextualized[context-resolved], contextualized>reasoned[reasoning-completed], reasoned>planned[planning-completed], planned>skill-required[skill-required], skill-required>rejected[orchestration-rejected]`                                                                                                                                                            | `1/1/1/1/1/1/1/1/1/1/0/0/0/0/0/0/0/0/0/0/0` |   6 |     0 | `rejected`  |
| BLC-035  | M9 Context resolution fails                                                 | `BrainSkillCoordinationError`                                                                                                                     | `none>proposed[orchestration-proposed], proposed>contextualized[context-resolved], contextualized>reasoned[reasoning-completed], reasoned>planned[planning-completed], planned>skill-required[skill-required], skill-required>bound[skill-bound], bound>rejected[orchestration-rejected]`                                                                                                                                  | `1/1/1/1/1/1/1/1/1/1/1/0/0/0/0/0/0/0/0/0/0` |   7 |     0 | `rejected`  |
| BLC-036  | M9 Context structure fails                                                  | `BrainSkillCoordinationError`                                                                                                                     | `none>proposed[orchestration-proposed], proposed>contextualized[context-resolved], contextualized>reasoned[reasoning-completed], reasoned>planned[planning-completed], planned>skill-required[skill-required], skill-required>bound[skill-bound], bound>rejected[orchestration-rejected]`                                                                                                                                  | `1/1/1/1/1/1/1/1/1/1/1/1/0/0/0/0/0/0/0/0/0` |   7 |     0 | `rejected`  |
| BLC-037  | M9 Context authority fails                                                  | `BrainSkillCoordinationError`                                                                                                                     | `none>proposed[orchestration-proposed], proposed>contextualized[context-resolved], contextualized>reasoned[reasoning-completed], reasoned>planned[planning-completed], planned>skill-required[skill-required], skill-required>bound[skill-bound], bound>rejected[orchestration-rejected]`                                                                                                                                  | `1/1/1/1/1/1/1/1/1/1/1/1/0/0/0/0/0/0/0/0/0` |   7 |     0 | `rejected`  |
| BLC-038  | requirements resolution fails                                               | `BrainSkillCoordinationError`                                                                                                                     | `none>proposed[orchestration-proposed], proposed>contextualized[context-resolved], contextualized>reasoned[reasoning-completed], reasoned>planned[planning-completed], planned>skill-required[skill-required], skill-required>bound[skill-bound], bound>rejected[orchestration-rejected]`                                                                                                                                  | `1/1/1/1/1/1/1/1/1/1/1/1/1/0/0/0/0/0/0/0/0` |   7 |     0 | `rejected`  |
| BLC-039  | requirements structure fails                                                | `BrainSkillCoordinationError`                                                                                                                     | `none>proposed[orchestration-proposed], proposed>contextualized[context-resolved], contextualized>reasoned[reasoning-completed], reasoned>planned[planning-completed], planned>skill-required[skill-required], skill-required>bound[skill-bound], bound>rejected[orchestration-rejected]`                                                                                                                                  | `1/1/1/1/1/1/1/1/1/1/1/1/1/1/0/0/0/0/0/0/0` |   7 |     0 | `rejected`  |
| BLC-040  | requirements authority fails                                                | `BrainSkillCoordinationError`                                                                                                                     | `none>proposed[orchestration-proposed], proposed>contextualized[context-resolved], contextualized>reasoned[reasoning-completed], reasoned>planned[planning-completed], planned>skill-required[skill-required], skill-required>bound[skill-bound], bound>rejected[orchestration-rejected]`                                                                                                                                  | `1/1/1/1/1/1/1/1/1/1/1/1/1/1/0/0/0/0/0/0/0` |   7 |     0 | `rejected`  |
| BLC-041  | Security evaluation throws/fails                                            | `BrainAuthorizationResolutionError`                                                                                                               | `none>proposed[orchestration-proposed], proposed>contextualized[context-resolved], contextualized>reasoned[reasoning-completed], reasoned>planned[planning-completed], planned>skill-required[skill-required], skill-required>bound[skill-bound], bound>rejected[orchestration-rejected]`                                                                                                                                  | `1/1/1/1/1/1/1/1/1/1/1/1/1/1/1/0/0/0/0/0/0` |   7 |     0 | `rejected`  |
| BLC-042A | malformed Authorization Outcome structure                                   | `BrainAuthorizationResolutionError`                                                                                                               | `none>proposed[orchestration-proposed], proposed>contextualized[context-resolved], contextualized>reasoned[reasoning-completed], reasoned>planned[planning-completed], planned>skill-required[skill-required], skill-required>bound[skill-bound], bound>rejected[orchestration-rejected]`                                                                                                                                  | `1/1/1/1/1/1/1/1/1/1/1/1/1/1/1/1/0/0/0/0/0` |   7 |     0 | `rejected`  |
| BLC-042B | forged or unregistered Authorization Outcome issuer authority               | `BrainAuthorizationResolutionError`                                                                                                               | `none>proposed[orchestration-proposed], proposed>contextualized[context-resolved], contextualized>reasoned[reasoning-completed], reasoned>planned[planning-completed], planned>skill-required[skill-required], skill-required>bound[skill-bound], bound>rejected[orchestration-rejected]`                                                                                                                                  | `1/1/1/1/1/1/1/1/1/1/1/1/1/1/1/1/0/0/0/0/0` |   7 |     0 | `rejected`  |
| BLC-042C | mixed-authority or replaced-provenance Authorization Outcome                | `BrainAuthorizationResolutionError`                                                                                                               | `none>proposed[orchestration-proposed], proposed>contextualized[context-resolved], contextualized>reasoned[reasoning-completed], reasoned>planned[planning-completed], planned>skill-required[skill-required], skill-required>bound[skill-bound], bound>rejected[orchestration-rejected]`                                                                                                                                  | `1/1/1/1/1/1/1/1/1/1/1/1/1/1/1/1/0/0/0/0/0` |   7 |     0 | `rejected`  |
| BLC-043  | Authorization Outcome operation mismatch                                    | `BrainAuthorizationResolutionError`                                                                                                               | `none>proposed[orchestration-proposed], proposed>contextualized[context-resolved], contextualized>reasoned[reasoning-completed], reasoned>planned[planning-completed], planned>skill-required[skill-required], skill-required>bound[skill-bound], bound>rejected[orchestration-rejected]`                                                                                                                                  | `1/1/1/1/1/1/1/1/1/1/1/1/1/1/1/1/0/0/0/0/0` |   7 |     0 | `rejected`  |
| BLC-044  | Authorization Outcome action mismatch                                       | `BrainAuthorizationResolutionError`                                                                                                               | `none>proposed[orchestration-proposed], proposed>contextualized[context-resolved], contextualized>reasoned[reasoning-completed], reasoned>planned[planning-completed], planned>skill-required[skill-required], skill-required>bound[skill-bound], bound>rejected[orchestration-rejected]`                                                                                                                                  | `1/1/1/1/1/1/1/1/1/1/1/1/1/1/1/1/0/0/0/0/0` |   7 |     0 | `rejected`  |
| BLC-045  | Authorization Outcome resource mismatch                                     | `BrainAuthorizationResolutionError`                                                                                                               | `none>proposed[orchestration-proposed], proposed>contextualized[context-resolved], contextualized>reasoned[reasoning-completed], reasoned>planned[planning-completed], planned>skill-required[skill-required], skill-required>bound[skill-bound], bound>rejected[orchestration-rejected]`                                                                                                                                  | `1/1/1/1/1/1/1/1/1/1/1/1/1/1/1/1/0/0/0/0/0` |   7 |     0 | `rejected`  |
| BLC-046  | Protected Invoke throws/rejects                                             | `BrainProtectedInvocationError`                                                                                                                   | `none>proposed[orchestration-proposed], proposed>contextualized[context-resolved], contextualized>reasoned[reasoning-completed], reasoned>planned[planning-completed], planned>skill-required[skill-required], skill-required>bound[skill-bound], bound>authorization-resolved[authorization-outcome-obtained], authorization-resolved>invoking[protected-invocation-started], invoking>rejected[orchestration-rejected]`  | `1/1/1/1/1/1/1/1/1/1/1/1/1/1/1/1/1/0/0/0/0` |   9 |     0 | `rejected`  |
| BLC-047  | normalized Skill-result structure invalid                                   | `BrainProtectedInvocationError`                                                                                                                   | `none>proposed[orchestration-proposed], proposed>contextualized[context-resolved], contextualized>reasoned[reasoning-completed], reasoned>planned[planning-completed], planned>skill-required[skill-required], skill-required>bound[skill-bound], bound>authorization-resolved[authorization-outcome-obtained], authorization-resolved>invoking[protected-invocation-started], invoking>rejected[orchestration-rejected]`  | `1/1/1/1/1/1/1/1/1/1/1/1/1/1/1/1/1/0/0/0/0` |   9 |     0 | `rejected`  |
| BLC-048  | normalized-result authority/correspondence verifier fails                   | `BrainProtectedInvocationError`                                                                                                                   | `none>proposed[orchestration-proposed], proposed>contextualized[context-resolved], contextualized>reasoned[reasoning-completed], reasoned>planned[planning-completed], planned>skill-required[skill-required], skill-required>bound[skill-bound], bound>authorization-resolved[authorization-outcome-obtained], authorization-resolved>invoking[protected-invocation-started], invoking>rejected[orchestration-rejected]`  | `1/1/1/1/1/1/1/1/1/1/1/1/1/1/1/1/1/1/0/0/0` |   9 |     0 | `rejected`  |
| BLC-049  | Skill-result final construction fails                                       | `InvalidFinalCognitiveResultError`                                                                                                                | `none>proposed[orchestration-proposed], proposed>contextualized[context-resolved], contextualized>reasoned[reasoning-completed], reasoned>planned[planning-completed], planned>skill-required[skill-required], skill-required>bound[skill-bound], bound>authorization-resolved[authorization-outcome-obtained], authorization-resolved>invoking[protected-invocation-started], invoking>rejected[orchestration-rejected]`  | `1/1/1/1/1/1/1/1/1/1/1/1/1/1/1/1/1/1/1/0/0` |   9 |     0 | `rejected`  |
| BLC-050  | Skill-result Brain authority registration fails                             | `InvalidFinalCognitiveResultError`                                                                                                                | `none>proposed[orchestration-proposed], proposed>contextualized[context-resolved], contextualized>reasoned[reasoning-completed], reasoned>planned[planning-completed], planned>skill-required[skill-required], skill-required>bound[skill-bound], bound>authorization-resolved[authorization-outcome-obtained], authorization-resolved>invoking[protected-invocation-started], invoking>rejected[orchestration-rejected]`  | `1/1/1/1/1/1/1/1/1/1/1/1/1/1/1/1/1/1/1/1/0` |   9 |     0 | `rejected`  |
| BLC-051  | Skill-result exact final verification fails                                 | `InvalidFinalCognitiveResultError`                                                                                                                | `none>proposed[orchestration-proposed], proposed>contextualized[context-resolved], contextualized>reasoned[reasoning-completed], reasoned>planned[planning-completed], planned>skill-required[skill-required], skill-required>bound[skill-bound], bound>authorization-resolved[authorization-outcome-obtained], authorization-resolved>invoking[protected-invocation-started], invoking>rejected[orchestration-rejected]`  | `1/1/1/1/1/1/1/1/1/1/1/1/1/1/1/1/1/1/1/1/1` |   9 |     0 | `rejected`  |
| BLC-052  | normalized Skill success                                                    | `{ status: "completed", kind: "skill-result", requestId: exactRequestId, operationId: exactOperationId, result: exactNormalizedSuccess }`         | `none>proposed[orchestration-proposed], proposed>contextualized[context-resolved], contextualized>reasoned[reasoning-completed], reasoned>planned[planning-completed], planned>skill-required[skill-required], skill-required>bound[skill-bound], bound>authorization-resolved[authorization-outcome-obtained], authorization-resolved>invoking[protected-invocation-started], invoking>completed[skill-result-completed]` | `1/1/1/1/1/1/1/1/1/1/1/1/1/1/1/1/1/1/1/1/1` |   9 |     0 | `completed` |
| BLC-053  | normalized declared Skill business failure                                  | `{ status: "completed", kind: "skill-result", requestId: exactRequestId, operationId: exactOperationId, result: exactNormalizedDeclaredFailure }` | `none>proposed[orchestration-proposed], proposed>contextualized[context-resolved], contextualized>reasoned[reasoning-completed], reasoned>planned[planning-completed], planned>skill-required[skill-required], skill-required>bound[skill-bound], bound>authorization-resolved[authorization-outcome-obtained], authorization-resolved>invoking[protected-invocation-started], invoking>completed[skill-result-completed]` | `1/1/1/1/1/1/1/1/1/1/1/1/1/1/1/1/1/1/1/1/1` |   9 |     0 | `completed` |
| BLC-055  | selected Binding structure is invalid                                       | `BrainSkillCoordinationError`                                                                                                                     | `none>proposed[orchestration-proposed], proposed>contextualized[context-resolved], contextualized>reasoned[reasoning-completed], reasoned>planned[planning-completed], planned>skill-required[skill-required], skill-required>rejected[orchestration-rejected]`                                                                                                                                                            | `1/1/1/1/1/1/1/0/0/0/0/0/0/0/0/0/0/0/0/0/0` |   6 |     0 | `rejected`  |
| BLC-056  | selected Binding authority fails                                            | `BrainSkillCoordinationError`                                                                                                                     | `none>proposed[orchestration-proposed], proposed>contextualized[context-resolved], contextualized>reasoned[reasoning-completed], reasoned>planned[planning-completed], planned>skill-required[skill-required], skill-required>rejected[orchestration-rejected]`                                                                                                                                                            | `1/1/1/1/1/1/1/0/0/0/0/0/0/0/0/0/0/0/0/0/0` |   6 |     0 | `rejected`  |
| BLC-057  | selected Binding capability correspondence fails                            | `BrainSkillCoordinationError`                                                                                                                     | `none>proposed[orchestration-proposed], proposed>contextualized[context-resolved], contextualized>reasoned[reasoning-completed], reasoned>planned[planning-completed], planned>skill-required[skill-required], skill-required>rejected[orchestration-rejected]`                                                                                                                                                            | `1/1/1/1/1/1/1/0/0/0/0/0/0/0/0/0/0/0/0/0/0` |   6 |     0 | `rejected`  |
| BLC-058  | Bound Target capability correspondence fails                                | `BrainSkillCoordinationError`                                                                                                                     | `none>proposed[orchestration-proposed], proposed>contextualized[context-resolved], contextualized>reasoned[reasoning-completed], reasoned>planned[planning-completed], planned>skill-required[skill-required], skill-required>rejected[orchestration-rejected]`                                                                                                                                                            | `1/1/1/1/1/1/1/1/1/1/0/0/0/0/0/0/0/0/0/0/0` |   6 |     0 | `rejected`  |
| BLC-059  | M9 Context operation correspondence fails                                   | `BrainSkillCoordinationError`                                                                                                                     | `none>proposed[orchestration-proposed], proposed>contextualized[context-resolved], contextualized>reasoned[reasoning-completed], reasoned>planned[planning-completed], planned>skill-required[skill-required], skill-required>bound[skill-bound], bound>rejected[orchestration-rejected]`                                                                                                                                  | `1/1/1/1/1/1/1/1/1/1/1/1/0/0/0/0/0/0/0/0/0` |   7 |     0 | `rejected`  |
| BLC-060  | requirements operation correspondence fails                                 | `BrainSkillCoordinationError`                                                                                                                     | `none>proposed[orchestration-proposed], proposed>contextualized[context-resolved], contextualized>reasoned[reasoning-completed], reasoned>planned[planning-completed], planned>skill-required[skill-required], skill-required>bound[skill-bound], bound>rejected[orchestration-rejected]`                                                                                                                                  | `1/1/1/1/1/1/1/1/1/1/1/1/1/1/0/0/0/0/0/0/0` |   7 |     0 | `rejected`  |
| BLC-061  | requirements action correspondence fails                                    | `BrainSkillCoordinationError`                                                                                                                     | `none>proposed[orchestration-proposed], proposed>contextualized[context-resolved], contextualized>reasoned[reasoning-completed], reasoned>planned[planning-completed], planned>skill-required[skill-required], skill-required>bound[skill-bound], bound>rejected[orchestration-rejected]`                                                                                                                                  | `1/1/1/1/1/1/1/1/1/1/1/1/1/1/0/0/0/0/0/0/0` |   7 |     0 | `rejected`  |
| BLC-062  | requirements resource correspondence fails                                  | `BrainSkillCoordinationError`                                                                                                                     | `none>proposed[orchestration-proposed], proposed>contextualized[context-resolved], contextualized>reasoned[reasoning-completed], reasoned>planned[planning-completed], planned>skill-required[skill-required], skill-required>bound[skill-bound], bound>rejected[orchestration-rejected]`                                                                                                                                  | `1/1/1/1/1/1/1/1/1/1/1/1/1/1/0/0/0/0/0/0/0` |   7 |     0 | `rejected`  |

There are **61 normative lifecycle rows**. BLC-012 is the single atomic public
Reasoning-verifier failure boundary for all issuer-owned consumed-Context
expectations, including lineage, revision identity, and revision number.
BLC-017 is the single atomic public Planning-verifier failure boundary for all
issuer-owned Reasoning, source, explainability, category, and step
expectations. Brain does not repeat those checks.

### Orthogonal Observer-Failure Matrix

This matrix applies independently to every normative lifecycle row. For each
listed authoritative path, observer throw, prohibited returned thenable, or
hostile accessor/Proxy behavior is contained at every observer call.

| Authoritative path                       | Exact authoritative behavior under observer failure                                                                                                                                                                                                                                            |
| ---------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| response success                         | Exact BLC-021 result, complete transitions, count vector, branch, terminal `completed`, and retry zero remain unchanged; `Obs=5`.                                                                                                                                                              |
| request-more-context success             | Exact BLC-020 result, complete transitions, count vector, branch, terminal `completed`, and retry zero remain unchanged; `Obs=5`.                                                                                                                                                              |
| Skill-result success or declared failure | Exact BLC-052 or BLC-053 result, complete transitions, count vector, branch, terminal `completed`, and retry zero remain unchanged; `Obs=9`. The exact nested Skill-issued result identity remains unchanged.                                                                                  |
| any rejection or error terminal path     | The exact public error, complete transitions, count vector, branch, terminal state, and retry zero of the applicable lifecycle row remain unchanged; `Obs` remains exactly the transition count stated by that row. A pre-transition error with no committed transition therefore has `Obs=0`. |

Each failed observer call MAY emit at most one privacy-safe diagnostic without
calling the observer. Observer failure cannot change authoritative state,
result, error, branch, collaborator counts, allocation count, Security count,
protected-invocation count, final-construction count, Brain-registration count,
or callback suppression. It causes no recursive observer call and no observer
retry.

## Failure Taxonomy

The public taxonomy is closed:

1. `InvalidBrainRequestError`
2. `InvalidBrainAuthorityError`
3. `BrainContextResolutionError`
4. `BrainReasoningResolutionError`
5. `BrainPlanningResolutionError`
6. `InvalidBrainPlanError`
7. `BrainSkillCoordinationError`
8. `BrainAuthorizationResolutionError`
9. `BrainProtectedInvocationError`
10. `InvalidFinalCognitiveResultError`
11. `InvalidBrainExecutionStateError`

All messages MUST be fixed and privacy-safe.

### Mapping

- direct request defects map to `InvalidBrainRequestError`;
- configuration defects map to `InvalidBrainAuthorityError`;
- Context, Reasoning, and Planning collaborator throws, lower-level failures,
  malformed returns, verifier authority failures, non-exact verifier returns,
  and issuer-owned correspondence failures map to their exact Brain stage
  failure;
- a Brain branch decision that does not correspond to the exact verified Plan
  fields maps to `InvalidBrainPlanError`;
- selection, allocation, binding, M9 Context, and requirements failures map to
  `BrainSkillCoordinationError`;
- governed authorization resolver failure or invalid returned authority maps to
  `BrainAuthorizationResolutionError`;
- every protected invocation throw or public M9 enforcement failure maps to
  `BrainProtectedInvocationError`;
- an invalid or non-authoritative normalized return maps to
  `BrainProtectedInvocationError`;
- impossible Brain-owned result construction or registration maps to
  `InvalidFinalCognitiveResultError`; and
- lifecycle or corrupt private state maps to
  `InvalidBrainExecutionStateError`.

No native or lower-level exception escapes. Private causes MUST NOT be exposed
through fields, messages, logs, diagnostics, or stacks controlled by the
Contract.

## Runtime Boundary Safety

All unknown boundaries MUST use:

- exact ordinary-object and exact-key validation;
- protected own-key, prototype, and descriptor inspection;
- data descriptors only;
- single accepted reads;
- no coercion or user-defined conversion;
- defensive reconstruction before semantic use;
- dense exact arrays where inherited Contracts require arrays;
- safe containment of getters and Proxy traps;
- no mutation or freezing of source graphs; and
- validation of constructed results before authority registration.

Defensive reconstruction applies to accepted request/configuration data. It
MUST NOT reconstruct an exact verified issuer-owned identity whose preservation
is required, including the normalized Skill result embedded in a
`skill-result` envelope.

## Authority Isolation

Each Brain instance MUST use private identity-based registries for final
results. For a `skill-result`, registration MUST associate the exact outer
envelope with the exact verified nested Skill-result identity. It MUST NOT
expose registry mutation or minting hooks.

Tests must prove:

- public factory and clone rejection;
- cross-Brain-runtime rejection;
- Context, Reasoning, and Planning cross-runtime rejection;
- replaced nested Plan and normalized Skill result rejection;
- wrong Context, request, capability, and operation correspondence;
- M8 same-evaluation Outcome requirements remain enforced by M9;
- class/prototype mutable-port rejection; and
- mutation-after-construction cannot replace any collaborator.

## Determinism, Retry, and Isolation

Equivalent valid inputs and equivalent configured authority behavior MUST
produce deeply equivalent final results and lifecycle categories.

M10 performs no retry, fallback, alternate selection, Context refresh, second
Reasoning or Planning evaluation, second authorization, or second invocation.
Every collaborator is invoked at most once.

Runtime isolation is process-local per Brain instance. Cross-instance authority
is rejected. Distributed and sandbox isolation are deferred.

## State and Persistence

Brain retains only private Engine lifecycle state and authority registries
needed for the current process. It retains no public history and no completed
request data. M10 defines no repository, persistence port, cache, database,
filesystem, audit store, Event log, or replay registry.

## Diagnostics and Privacy

The categories and allowed fields are exactly those in CONCEPT-0006.
Diagnostics are synchronous operational observations, not Events.

Mandatory tests MUST use distinctive secrets in query, response, Context,
identifiers, Skill input/output, authorization values, native exceptions, and
configuration and prove none appears in diagnostics or public failures.

Diagnostics MUST remain available under supported debug, info, warn, and error
levels without weakening privacy.

## Architecture and Dependencies

The package boundary is:

```text
core/
  Brain Contract schemas, values, lifecycle vocabulary, and failures

services/brain/
  Brain Engine implementation

services/bootstrap/
  explicit composition wiring only; no authority adapters
```

The exact production dependency set for `@orion/brain` is:

```text
@orion/core
```

Brain production source MUST NOT import another Engine implementation,
Bootstrap, Infrastructure, Skills, Provider/Adapter implementations, apps,
clients, or external runtime packages. It MUST NOT deep-import Core internals.

Architecture verification MUST add isolated negative fixtures for every
prohibited category and verify that Core does not depend on Brain. Bootstrap
may depend on public package exports solely for composition.

## Mandatory Test Groups

An eventual implementation MUST include:

- Core value/factory/Contract/failure tests;
- request and result exact-shape matrices;
- all 61 precedence adjacencies;
- all 61 lifecycle rows;
- branch table and zero-call assertions;
- every authority and cross-runtime matrix;
- exact configuration capture and hostile-port tests;
- callback count and no-retry tests;
- failure mapping and native containment;
- final-result authority and correspondence;
- normal-failure-normal recovery;
- privacy and diagnostics at every log level;
- non-mutation and immutability;
- deterministic equivalence;
- architecture graph and negative fixtures;
- Bootstrap smoke coverage; and
- full M0–M9 regression.

No public production fault switch, registry hook, environment failure toggle,
or configurable semantic policy may be introduced for testing.

## Acceptance Criteria

M10 is implementation-ready because:

1. ADR-0007 is approved.
2. CONCEPT-0006 and this specification are Active.
3. Every public Contract has exact metadata, input, output, failure, authority,
   and compatibility definitions.
4. No Active authority conflict remains.
5. Every precedence adjacency is objectively testable.
6. Every lifecycle row has exact transitions and callback counts.
7. Both no-Skill branches and the Skill branch are closed and deterministic.
8. Brain owns no delegated capability semantics.
9. The runtime dependency set remains exactly `@orion/core`.
10. No deferred capability enters implementation.

## Explicitly Deferred

- persistence, database, workflow/result/audit history;
- Providers, Adapters, external integrations, IAM, OAuth, JWT, and LDAP;
- HTTP, REST, GraphQL, WebSocket, CLI, voice, clients, and UI;
- Events, queues, streams, brokers, and background work;
- async orchestration, cancellation, timeout, retry, compensation, rollback,
  and replay;
- distributed authority, locks, replay prevention, and transport;
- sandboxing and dynamic plugin loading;
- configurable selection and Security policy;
- separate Execution Engine;
- executable or multi-step Planning;
- automatic Context refresh and multi-request conversation state;
- Memory/Knowledge retrieval or mutation;
- transport/presentation of final results; and
- modification of M0–M9 semantics.

## Open Questions

No implementation-critical question remains. The specification is Active.

## Compatibility

This Active specification consumes existing M0–M9 public Contracts and preserves their
semantic ownership, failure meaning, authority requirements, immutability, and
dependency direction. It introduces no change to another Active authority.

## References

- [Documentation Authority](../../docs/DOCUMENT-AUTHORITY.md)
- [Architecture](../../docs/architecture.md)
- [ADR-0006 — Skill Selection, Binding, and Protected Invocation Ownership](../../docs/adr/ADR-0006-Skill-Selection-Binding-and-Protected-Invocation-Ownership.md)
- [ADR-0007 — Brain Orchestration Ownership and Planning Binding](../../docs/adr/ADR-0007-Brain-Orchestration-Ownership-and-Planning-Binding.md)
- [CONCEPT-0006 — Brain Orchestration Model](../concepts/CONCEPT-0006-Brain-Orchestration-Model.md)
- [ENGINE-0003 — Context Engine 1.1.0](context/ENGINE-0003-Context-Engine-Authority-Revision-1.1.0.md)
- [ENGINE-0006 — Reasoning Engine 1.1.0](reasoning/ENGINE-0006-Reasoning-Engine-Authority-Revision-1.1.0.md)
- [ENGINE-0007 — Planning Engine 1.1.0](planning/ENGINE-0007-Planning-Engine-Authority-Revision-1.1.0.md)
- [ENGINE-0009 — Security Engine](security/ENGINE-0009-Security-Engine.md)
- [ENGINE-0010 — Protected Skill Invocation](skill/ENGINE-0010-Skill-Engine-Protected-Invocation-and-Execution.md)
- [IMPLEMENTATION-M9](../../IMPLEMENTATION-M9.md)
