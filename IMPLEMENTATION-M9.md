# IMPLEMENTATION-M9 — Skill Engine: Protected Invocation and Execution

## Authority

- `ADR-0006 — Skill Selection, Binding, and Protected Invocation Ownership`:
  Active 1.0.0.
- `CONCEPT-0005 — Skill Invocation and Execution Model`: Active 1.1.0.
- `CONCEPT-0004 — Authorization Model`: Active 1.1.0.
- `ENGINE-0008 — Skill Engine`: Active 1.0.0.
- `ENGINE-0009 — Security Engine`: Active 1.1.0.
- `ENGINE-0010 — Skill Engine: Protected Invocation and Execution`: Active
  1.1.0.

Foundation and accepted M0–M8 semantics remain unchanged.

## Implemented Slice

M9 extends the existing `@orion/skill` package with the smallest synchronous,
deterministic, process-local protected invocation slice. A Running Skill Engine
admits one validator/workflow pair only after canonical M7 registration,
selects an invocation-eligible Skill under
`orion.minimum-skill-selection` 1.0.0, creates a pre-operation Skill Binding,
binds that authority to an externally allocated operation, verifies governed
Context, requirements, and M8 evaluation evidence, validates invocation input,
executes the admitted validator and workflow at most once, and returns a
normalized authority-bearing result.

No Execution Engine, async execution, timeout, cancellation, retry,
persistence, Provider, Adapter, Event runtime, or Brain implementation was
introduced.

## Core Additions

Core now custodies the M9 shared language:

- Admitted Skill Workflow, Skill Binding, and Bound Skill Invocation Target;
- Skill execution Context, sensitivity, requirements, and governed
  authorization projections;
- scalar invocation records, validator/workflow inputs and closed results;
- normalized Skill execution results;
- lifecycle states, transition categories, events, and observer;
- explicit resolver/verifier ports and the normalized-result verifier;
- M9 public Contracts; and
- the exact closed M9 public failure taxonomy with privacy-safe messages.

Core owns no executable Skill behavior.

## Skill Engine Additions

### Workflow Admission and Callables

Admission is Running-only, follows M7 registration, resolves the canonical
catalog entry internally, copies its exact version, validates a canonical
capability subset, and rejects every duplicate Skill ID/version admission.
Public admission metadata excludes executable references. The exact validator
and workflow function references are retained privately without freezing,
binding, cloning, mutation, or metadata inspection.

Ordinary and arrow functions are accepted. Async, generator, async-generator,
class-constructor, method-holder, handle, and non-function candidates are
rejected without trial execution or caller-controlled source inspection.

Validator and workflow calls use `Reflect.apply(callable, undefined,
[argument])`. This guarantees primitive `undefined` only at the call-site
boundary; it makes no claim about the value observed inside a non-strict or
arrow function.

### Selection, Binding, and Target

Eligibility is the exact intersection of a canonical Registered Skill
capability and its admitted workflow capability. Multiple candidates are
ordered by locale-independent code-point comparison of Skill ID; version and
registration/admission order never rank candidates.

Selection mints the pre-operation Skill Binding. Binding to an externally
allocated operation derives `skill.invoke`, `skill:<skillId>`, complete
permissions, declarations, and failure modes from the canonical selected Skill.

### Authority Provenance

Skill-minted authorities use private per-Engine-instance `WeakSet` membership
and private `WeakMap` correspondence:

- Admitted Skill Workflow;
- Skill Binding;
- Bound Skill Invocation Target; and
- Normalized Skill Execution Result.

Exact returned identity is required. Spread, clone, reconstruction,
serialization, or another Engine instance loses authority. There is no global
registry and no public mint/add API.

Context projections, sensitivity classifications, requirements, and
Security-issued Authorization Evaluation Outcomes use composition-provided
resolver/verifier pairs. The Skill Engine verifies identity before protected
structural extraction and semantic enforcement.

### Context, Sensitivity, and Requirements

The Context package provides an operation-bound process-local projection
authority. It derives lineage, revision, and anonymous/authenticated subject
from an Active Context Revision. Issued authority remains operation-scoped and
does not trigger an invocation-time currentness query.

The Security package provides an immutable exact action/resource sensitivity
table. It has no wildcard, hierarchy, update, or default. Missing
classification returns governed unavailable; identical and contradictory
duplicate keys invalidate authority state.

The requirements authority preserves the complete Bound Target permission set
and uses only the governed sensitivity result. It never accepts caller
sensitivity or permission replacement.

### Governed Authorization and Enforcement

Bootstrap provides the source-neutral resolver boundary around
`EvaluateAuthorizationOutcome` and the exact issuing-Security read-only Outcome
verifier. It calls Outcome evaluation exactly once, never calls legacy Artifact
evaluation for the same resolution, contains collaborator throws, and returns
the exact Security-issued Outcome without minting, wrapping, or reconstructing
authority.

Security now performs both public evaluation paths through one atomic semantic
primitive. It co-issues the unchanged Authorization Decision Artifact with a
Governed Security Evaluation Summary constructed from the exact evaluation
Context locals, builds the Authorization Evaluation Outcome, and registers the
exact Outcome/Artifact/Summary identities in a private per-Security-instance
`WeakMap`. Legacy `EvaluateAuthorization` returns only the Artifact projection;
`EvaluateAuthorizationOutcome` returns the complete Outcome.

Protected invocation distinguishes malformed request input, invalid governed
evidence, and valid authorization refusal. It requires exact same-evaluation
Outcome provenance, safely reconstructs the Outcome, Artifact, and Summary,
and independently compares Context, Device, Session, and Trust Level statuses
against the Summary. A valid matching M8 `allow` is required before input
validation or any Skill callback. Skill performs no Artifact self-comparison,
Security policy recomputation, second evaluation, or currentness query.

### Input, Validator, Workflow, and Results

Input and output sources accept only `Object.prototype` or null prototypes and
exact declared own enumerable data keys. Scalar values are null, boolean, safe
integer excluding negative zero, or 0–4096-code-point strings without `Cc`.
Canonical records use frozen `Object.create(null)` objects in code-point key
order. Caller/source records are not mutated or frozen.

The validator returns only accepted or rejected. Throws, hostile/malformed
returns, Promise, and thenable returns map to their exact public failures. The
workflow returns only succeeded outputs or one declared business failure.
Throws and invalid raw results are normalized without retry or native leakage.

Normalized results bind operation, Skill ID, Skill version, capability, and
either canonical outputs or a declared failure mode. A read-only verifier
exposes identity/correspondence verification without mint authority.

### Lifecycle and Observer

Invocation lifecycle implements the approved proposed, admitted, authorized,
input-validated, executing, succeeded/failed, and rejected transitions. The
optional synchronous observer receives only a frozen sequence/from/to/category
event after each completed transition. Observer throws are contained and
ignored. The Engine retains no public history.

## Runtime Hardening

M9 boundaries use exact-object validation, protected key/descriptor capture,
single accepted reads, no coercion, defensive reconstruction, canonical
ordering, and native/hostile failure containment. Later callbacks are not
reached after earlier failures. Governed data graphs are frozen; admitted
callable references and caller/source graphs are not frozen or mutated.

Public failures and lifecycle events contain only approved categories and
booleans/counts. They expose no operation, Skill, subject, action/resource,
permission, input/output, Context, authorization, callable source, native
message, or stack.

## Bootstrap and Diagnostics

Bootstrap wires the existing Skill, Context, and Security capabilities through
Core-custodied Contracts. The deterministic M9 demonstration registers and
admits one process-local Skill, selects and binds it, resolves Context and
classification/requirements authority, obtains a governed result from the
actual M8 evaluator, invokes successfully, observes six transitions, and
verifies normalized-result authority.

Diagnostic output adds only privacy-safe success booleans. Existing debug,
info, warn, and error behavior remains intact.

## Architecture and Dependencies

`@orion/skill` retains exactly one runtime dependency: `@orion/core`.
Production Skill code imports no Security, Context, Planning, Brain, Bootstrap,
Infrastructure, Provider, Adapter, external runtime package, or other Engine
implementation. Context and Security implementations depend inward on Core
ports; Bootstrap alone composes them. Negative fixtures directly prove Context
and Security implementation prohibitions in addition to the existing generic
other-Engine rules.

## Files Created

- `core/src/skill-execution.ts`
- `core/test/skill-execution-contract.test.ts`
- `core/test/security-outcome-contract.test.ts`
- `services/context/src/skill-context-authority.ts`
- `services/context/test/skill-context-authority.test.ts`
- `services/security/src/skill-security-authorities.ts`
- `services/security/test/skill-security-authorities.test.ts`
- `services/security/test/security-outcome.test.ts`
- `services/skill/src/skill-execution-runtime.ts`
- `services/skill/test/skill-execution-engine.test.ts`
- `services/skill/architecture-fixtures/context-engine-dependency.ts`
- `services/skill/architecture-fixtures/security-engine-dependency.ts`
- `services/bootstrap/src/skill/governed-authorization-authority.ts`
- `services/bootstrap/test/governed-authorization-authority.test.ts`
- `IMPLEMENTATION-M9.md`

## Files Modified

- Core Skill failures, Contracts, exports, and diagnostic schema.
- Core Security Outcome/Summary values, factories, Contracts, and exports.
- Skill Engine and package exports.
- Security Engine atomic evaluation, Outcome provenance, and verifier.
- Context and Security package exports.
- Bootstrap Skill/Security composition and diagnostic.
- Skill architecture negative-fixture verifier.
- Root formatting scripts.

## M9 Implementation Correction

The implementation review correction defensively captures the complete
composition configuration at `SkillEngine` construction. Exact resolver and
verifier callables and the optional observer are protected-read once into new
private immutable state. The caller configuration object, nested pair objects,
and their replaceable properties are never read again and are not frozen or
mutated. Mutation-after-construction and forged Context, requirements, and
governed-authorization candidates prove that a caller cannot replace the
captured provenance verifiers.

M9 operations now use an M9-specific lifecycle/pre-existing-state entry path
that produces `InvalidSkillExecutionStateError` before request inspection. M7
catalog operations continue to use `InvalidSkillStateError`.

The Context, sensitivity, requirements, and governed-authorization boundaries
now independently protect exact request envelopes and returned candidates,
reconstruct from safe local values, require provenance plus structure, and
normalize hostile/native collaborator failures to their Contract-specific
public failures. A permissive verifier is explicitly tested as necessary but
insufficient.

### Active 1.1 Security Outcome Correction

`M9-IR-002` is implemented through the Active 1.1
`AuthorizationEvaluationOutcome`. Its governed Summary is the independent,
same-evaluation expected source for Context, Device, Session, and Trust Level.
Operation and subject correspondence are enforced across the protected request,
target, Context projection, requirements, Artifact, and Summary. Four isolated
test-owned mismatch cases prove semantic rejection and callback suppression
without any production fault control.

`M9-IR-001` remains closed by immutable construction-time capture of every
resolver, verifier, and observer. Mutation tests replace resolver/verifier
properties and whole configuration entries, install a hostile getter after
construction, and prove exact captured/replacement/access counters.

`M9-IR-003` retains M9-specific `InvalidSkillExecutionStateError` entry behavior
without changing M7 `InvalidSkillStateError`. `M9-IR-004` applies hostile-safe
request/result extraction and normalization to the Outcome boundary.

### Focused Re-review Corrections

The M9 focused re-review corrections made the following additional changes:

- `M9-RR-001`: the Governed Security Evaluation Summary now reconstructs its
  nested subject through exact own enumerable data descriptors, rejects custom
  prototypes, accessors, symbols, inherited substitutes, hostile descriptor
  traps, and revoked Proxies, and never freezes or mutates caller graphs;
- `M9-RR-002`: the Security Outcome verifier now rejects custom-prototype
  request envelopes, while Skill and Bootstrap distinguish a verifier's
  authoritative `false` from verifier throws and malformed non-boolean results;
- `M9-RR-003`: mutation-after-construction tests independently replace the
  resolver and verifier of Context, sensitivity, requirements, and Outcome
  authority containers, replace whole containers with hostile values, remove
  the observer, and prove cross-runtime verifier replacement cannot bypass the
  captured issuing-runtime verifier; and
- `M9-RR-004`: direct Core, Context, sensitivity, requirements, Outcome
  resolver/verifier, protected invocation, scalar-input, validator, workflow,
  no-requery, hostile-runtime, non-mutation, and isolation coverage was
  expanded.

### Final M9-IR-005 Completion

The final matrix pass added the isolated ten-row Security construction and
provenance counter suite plus the remaining admission, selection, Binding,
Bound Target, Context, sensitivity, requirements, Protected Invoke, input,
workflow-output, normalized-result, lifecycle, precedence, non-mutation,
instance-isolation, recovery, and privacy rows.

Two additional production defects were objectively exposed:

- a private Binding-registry failure could escape as a native exception instead
  of `InvalidSkillExecutionStateError`; and
- impossible normalized-result construction was incorrectly collapsed into
  `InvalidSkillWorkflowResultError`.

The smallest corrections protect Binding authority-registry access and
distinguish internal constructed-state failure from malformed workflow output.
Both have direct normal-failure-normal regression coverage.

The final M9-IR-005 completion pass reconciled every normative ENGINE-0010
testing bullet and the ENGINE-0009 Summary/Outcome testing requirements to a
direct test or an independently parameterized row. `M9-RR-004` and
`M9-IR-005` are resolved. This is implementation-readiness evidence only; it
does not itself constitute M9 acceptance.

### Final Focused Review Corrections

The final focused review corrections resolve `M9-FAR-001`, `M9-FAR-002`, and
`M9-FAR-003`.

For `M9-FAR-001`, Skill execution configuration accepts only exact plain or
null-prototype authority-port records with own enumerable data-descriptor
callables. It captures those callables into private Engine-owned records and
invokes them receiver-free. Class/prototype ports whose behavior can depend on
mutable caller-owned receiver fields are rejected without invoking their
delegates. Bootstrap adapts its private class authorities into exact plain
wrapper records whose arrow callables close over Bootstrap-owned instances.
Direct regressions cover Context, sensitivity, Requirements, and Authorization
Outcome class delegates, the public-factory forged-ALLOW attack shape,
cross-runtime mutation, and the function-only lifecycle observer boundary.

For `M9-FAR-002`, the Security ten-row matrix observes policy finalization
through a distinct internal, non-public policy boundary rather than inferring
it from Artifact construction. Atomic failure tests retain failed construction
identities and prove that Summary, Outcome, and provenance registration
failures leave no verifiable partial authority and do not poison subsequent
evaluation. The remaining admission, validator-candidate, lifecycle,
public-Contract precedence, selection order-independence, Binding
permission-tampering, direct authority-port single-read/failure, and
distinctive-secret privacy rows have direct counter/probe coverage.

`M9-FAR-003` is resolved by this reconciliation. These findings and totals
describe demonstrated repository state and do not constitute formal
acceptance; M9 is ready for another focused implementation review.

### Final M9 Evidence Completion

`M9-FFR-001` is resolved. Every adjacent first-failure stage in every public
M9 Contract now has direct counter or hostile-trap evidence that the immediately
later stage remains untouched. This covers Admit Skill Workflow, Select Skill,
Bind Skill to Operation and Bound Target construction, Context projection,
sensitivity, requirements, governed Authorization Outcome resolution, and
Protected Invoke. The reconciliation also exposed and corrected one production
ordering defect: Admit inspected callable/capability candidates before canonical
catalog provenance. Admit now follows the exact ENGINE-0010 order of catalog
provenance, callable structure, capability correspondence, duplicate state, and
constructed admission.

`M9-FFR-002` is resolved. The impossible normalized-result construction
lifecycle row now uses exact validator and workflow spies. It proves
`InvalidSkillExecutionStateError`, one validator call, one workflow call, no
retry, the exact
`proposed → admitted → authorized → input-validated → executing → failed`
sequence, terminal `executing → failed` with `execution-failed`, and successful
normal → failure → normal recovery.

The final evidence patch closes the remaining precedence and lifecycle narrow
regression gaps. Independent counters cover capability correspondence before
duplicate state, duplicate state before admission construction, eligibility
before ranking, ranking before selected-result construction, Binding authority
before snapshot derivation, snapshot derivation before Bound Target
construction, Context revision structure before identity derivation, Context
derivation before projection construction, every sensitivity
lookup/construction/registration/correspondence edge, every Requirements
target/derivation/sensitivity/governed-result edge, every governed
authorization structure/verification/provenance/correspondence/return edge, and
the remaining Protected Invoke envelope, authorization, input, validator,
workflow, and normalized-result edges.

Every normative lifecycle terminal row other than the already-complete
impossible normalized-result row now independently asserts its exact result or
public error class, ordered `from`/`to` transitions, categories, terminal state,
validator count, workflow count, and single invocation/no retry. The invalid
Engine and malformed-envelope rows assert no lifecycle and zero callbacks.

Those exact tests exposed four production defects: selection ranking failure
was not normalized to `InvalidSkillSelectionAuthorityError`; Context lineage
and revision derivation validation occurred after projection construction;
sensitivity lookup, candidate construction, or authority registration failure
could escape as a native exception; and governed authorization operation
correspondence occurred before issuing-Security verification. The corrections
only contain and order already-authorized stages and change no Contract,
authority specification, policy, or successful result.

The final micro-correction replaces the previously vacuous sensitivity
registration/correspondence probe with the real cross-Contract sequence:
successful registration returns the exact candidate to the public verifier,
while an isolated registration failure prevents that verifier call entirely.
The authorization provenance probe now uses a wrong-operation Outcome whose
issuing-Security verifier returns `false` and observes zero real correspondence
comparisons; the same genuine issued mismatch reaches correspondence exactly
once after verifier success. That probe exposed one additional production
defect: the Bootstrap boundary compared operation but omitted action and
resource correspondence. It now checks operation, action, and resource only
after structural validity and issuing-Security provenance succeed.

Independent lifecycle rows now cover both the mixed-evaluation Outcome and a
configured-authority-issued Outcome with an invalid nested Artifact. Each row
asserts the exact public error, verifier count, validator/workflow counts,
single invocation/no retry, ordered transition objects, transition categories,
and terminal `rejected` state. Unmatched precedence adjacencies and unmatched
lifecycle rows are both `NONE`.

`M9-FFR-001`, the lifecycle narrow regression, `M9-FFR-003`, `M9-FAR-002`,
`M9-FAR-003`, `M9-RR-004`, and `M9-IR-005` are resolved by the final objective
evidence and validation below. `M9-FAR-001` and `M9-IR-001` through
`M9-IR-004` remain resolved. `M9-FFR-002` remains resolved. This record does
not claim M9 acceptance.

## Tests and Validation

The M9 tests directly demonstrate the closed failure names, Context projection
identity, Security sensitivity authority, selected workflow-admission callable
forms, deterministic selection, forged/cross-instance binding, governed
authorization refusal, callback suppression, call-site receiver behavior,
validator/workflow normalization, normalized-result authority, lifecycle
observation, canonical null-prototype records, hostile Summary subjects,
verifier failure normalization, immutable collaborator capture, scalar
boundaries, and no invocation-time status re-query.

Before this Active 1.1 correction, the dirty-worktree implementation record
reported 55 test files and 1002 tests; its focused M9 command reported 6 files
and 82 tests.

After the final M9 micro-correction, the repository suite contains 58 test files
and 1421 passing tests. The focused M9/Outcome command contains 9 files and 499
passing tests. The combined Core/Security/M8 regression command contains 28
files and 711 passing tests.
The additive coverage includes Core Summary/Outcome construction, Security
co-issuance and verifier isolation, all ten decision rows through both public
evaluation Contracts for their existing Artifact/Outcome and authority-stage
assertions, cross-evaluation mixing, immutable configuration
replacement/hostility counters, four independent Summary-status mismatches,
single Outcome evaluation, zero legacy evaluation for M9 resolution, and
objective no-status-currentness-requery counters.

The completion pass adds exact nine-counter observation for every Security
decision row through both public evaluation Contracts, isolated
constructed-state failure/recovery, complete callable and record-prototype
categories, reserved-key and raw-output scalar matrices, independently
asserted authorization/lifecycle rows, adjacent hostile precedence probes,
instance isolation, source-graph preservation, privacy probes, and
normal-failure-normal recovery. No public test hook, registry mutation API,
environment fault switch, or production fault option was introduced.

Pinned validation used Corepack pnpm 11.15.0 and direct repository binaries
where the Windows environment could not resolve nested bare `pnpm` commands:

- `corepack pnpm install --frozen-lockfile`: PASS;
- focused and repository Prettier checks: PASS;
- direct ESLint: PASS;
- direct TypeScript build plus all test-project typechecks: PASS;
- direct Vitest full suite: 58 files / 1421 tests PASS;
- focused M9/Outcome Vitest suite: 9 files / 499 tests PASS;
- combined Core/Security/M8 regression suite: 28 files / 711 tests PASS;
- `corepack pnpm architecture`: 115 modules / 190 dependencies PASS, with all
  negative fixtures PASS;
- diagnostic at debug, info, warn, and error: PASS;
- `git diff --check`: PASS.

READY FOR FINAL ACCEPTANCE MICRO-REVIEW

The root `corepack pnpm validate` wrapper itself cannot resolve its nested bare
`pnpm` invocation in this Windows shell (`pnpm` is not recognized). Every
constituent gate was therefore executed directly with the pinned repository
binaries or Corepack, without weakening or bypassing a gate.

## Deviations and Conflicts

No authority deviation or architectural conflict was required. The root
`corepack pnpm run validate` wrapper still encounters the documented Windows
nested-bare-`pnpm` shim failure; every exact constituent gate passes through
Corepack or the pinned repository binary.

## Explicitly Deferred

Separate Execution Engine, Brain orchestration, Planning binding, external
Providers and Adapters, persistence, databases, IAM, OAuth, JWT, LDAP, Events,
queues, streams, async execution, timeout, cancellation, automatic retry,
distributed replay protection, sandbox infrastructure, workflow history,
result/audit persistence, configurable selection policy, and configurable
Security policy remain deferred.
