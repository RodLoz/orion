# CONCEPT-0005 — Skill Invocation and Execution Model

| Field          | Value                                                                             |
| -------------- | --------------------------------------------------------------------------------- |
| **Status**     | Active                                                                            |
| **Version**    | 1.1.0                                                                             |
| **Owner**      | O.R.I.O.N. Architecture                                                           |
| **Created**    | 2026-07-27                                                                        |
| **Updated**    | 2026-07-28                                                                        |
| **Applies To** | Skill selection, binding, protected invocation, execution, and normalized results |

---

# Purpose

This specification defines the minimum technology-independent domain model
required for O.R.I.O.N. to:

1. select one invocation-eligible Registered Skill for an exact declared
   capability and return an authoritative pre-operation Skill Binding;
2. allocate an operation and create one Bound Skill Invocation Target;
3. admit one protected invocation only with governed requirements and one exact
   Security-issued Authorization Evaluation Outcome;
4. hand execution to the selected Skill workflow; and
5. return one governed normalized Skill execution result.

It closes the domain-semantic gap between the accepted M7 Skill catalog, the M8
Authorization Decision Artifact and co-issued Governed Security Evaluation
Summary, and a future Skill Engine execution vertical slice.

This Concept does not define ENGINE-0010 or an implementation. It supplies the
semantic authority that a future Engine Specification must specialize without
inventing selection, binding, invocation, enforcement, result, failure, or
lifecycle behavior.

Active `1.1.0` closes M9-IR-002 by aligning protected enforcement with the
successful Security authorization evaluation defined by CONCEPT-0004 `1.1.0`
and specialized by ENGINE-0009 `1.1.0`. It changes no unrelated Skill
invocation semantic.

# Authority and Status

This document is the formally approved Active Concept authority.

It is governed by:

- [ADR-0006 — Skill Selection, Binding, and Protected Invocation Ownership](../../docs/adr/ADR-0006-Skill-Selection-Binding-and-Protected-Invocation-Ownership.md);
- [CONCEPT-0004 — Authorization Model](CONCEPT-0004-Authorization-Model.md);
- accepted Planning, Skill, Context, Identity, and Security semantics; and
- the authority hierarchy in
  [Documentation Authority](../../docs/DOCUMENT-AUTHORITY.md).

ADR-0006 owns the architectural responsibility split. This Concept defines
domain semantics within that split and must not transfer ownership among Brain,
Planning, Skill, Security, Context, or Core.

# Scope

This model defines:

- governed process-local Skill workflow admission and invocation eligibility;
- exact capability-based Skill selection;
- authoritative pre-operation Skill Binding semantics;
- an operation-specific Bound Skill Invocation Target;
- capability-independent invocation data;
- an operation-bound Skill Execution Context Projection;
- a governed Skill Invocation Requirements Projection;
- a Protected Skill Invocation Request;
- a governed Security authorization evaluation/outcome authority containing the
  Authorization Decision Artifact and Governed Security Evaluation Summary;
- exact same-evaluation and four-status enforcement correspondence;
- authorization-enforcement correspondence;
- Skill-specific input validation and workflow boundaries;
- synchronous execution and failure containment;
- normalized success and business-failure results;
- invocation lifecycle and failure semantics;
- authority-bearing provenance;
- deterministic runtime bounds;
- hostile-runtime safety, immutability, non-mutation, and privacy; and
- the Contract categories required by a future Engine specification.

# Non-Goals

This model does not define:

- executable Planning steps or a Planning-to-Skill handoff;
- Brain Engine request, response, or final-result schemas;
- Skill installation, loading from files, hot reload, update, or removal;
- configurable selection, ranking, scoring, preference, health, cost, region,
  tenant, device, locale, or version policy;
- user-interface confirmation acquisition;
- timeout, cancellation, automatic retry, compensation, rollback, or progress;
- process, container, virtual-machine, or cryptographic sandbox technology;
- asynchronous invocation, Promise, callback, stream, queue, or Event runtime;
- Provider or Adapter integration;
- filesystem, network, database, persistence, audit store, or replay store;
- distributed execution or cross-runtime authority transport;
- a generic Execution Engine;
- arbitrary executable handles, endpoints, threads, processes, or transport
  routes; or
- typed schema languages for Skill inputs and outputs.

# Ownership

## Brain and Protected Orchestration

Brain or equivalent protected orchestration:

- decides when the cognitive flow needs a Skill capability;
- requests Skill-owned selection;
- allocates the Authorization Operation Identifier after selection;
- requests Skill-owned operation-target creation;
- prepares generic invocation data;
- obtains the Skill Execution Context Projection;
- obtains the governed Skill Invocation Requirements Projection;
- coordinates Security evaluation;
- submits the protected invocation; and
- consumes the normalized Skill result.

It does not select by its own ranking policy, manufacture authority-bearing
values, validate Skill-specific meaning, execute the workflow, normalize the
result, or recompute authorization.

## Skill Engine

The Skill Engine owns:

- invocation-eligibility admission;
- deterministic selection policy;
- Skill Binding and Bound Skill Invocation Target authority;
- generic invocation-data structural validation;
- protected invocation admission and enforcement mechanics;
- invocation lifecycle;
- workflow handoff;
- failure containment and normalization; and
- normalized Skill result semantics.

## Selected Skill Package

The selected Skill package owns:

- declared operation-specific input meaning;
- Skill-specific input validation;
- its business workflow;
- raw operation-specific success output; and
- declared business-failure meaning.

It does not own selection policy, authorization policy, protected-boundary
enforcement, cognitive orchestration, or normalized cross-boundary result
semantics.

## Security

Security owns authorization policy, evidence evaluation, decision categories,
the Authorization Decision Artifact, the Governed Security Evaluation Summary,
their same-evaluation Authorization Evaluation Outcome authority, and
verification of that Security-issued authority. It does not select, bind,
enforce, invoke, execute, or normalize Skill results.

## Planning

Planning remains advisory. This model neither consumes nor changes an M6
Candidate Plan and requires no ENGINE-0007 revision.

## Core

Core may custody the shared immutable values, Contract schemas, identifiers,
and domain failures needed to express this model. Core custody does not transfer
Skill behavior to Core.

# Terminology

## Discovery Candidate

A Discovery Candidate is one Registered Skill contained in an accepted M7 Skill
Discovery Result for an exact Skill Capability Identifier.

Discovery:

- may produce zero, one, or multiple candidates;
- does not choose a candidate;
- does not imply invocation eligibility;
- does not create selection or binding authority; and
- does not authorize execution.

## Admitted Skill Workflow

An Admitted Skill Workflow is one authority-bearing immutable process-local
relation established by the Skill-owned Workflow Admission Boundary:

```text
{
  skillId: SkillIdentifier,
  skillVersion: SkillVersion,
  supportedCapabilities: SkillCapabilityIdentifier[]
}
```

The public semantic projection contains no function, callback, module, class,
endpoint, or executable handle. The issuing Skill runtime privately associates
that projection with exactly one synchronous Skill Validator boundary and
exactly one synchronous Skill Workflow boundary.

Workflow admission is a Running-only Skill Engine operation that occurs only
after the accepted M7 Register Skill Manifest operation has created the
canonical Registered Skill in the authoritative catalog of the same Skill
capability. Admission requires:

- one Skill Identifier that resolves to one complete canonical Registered Skill
  in that catalog;
- a dense canonical set of 1–64 supported capabilities;
- every supported capability to occur exactly in the Registered Skill
  capability declarations;
- one synchronously callable validator boundary;
- one synchronously callable workflow boundary; and
- provenance established by the configured Skill-owned admission call.

The admission request has exactly:

```text
{
  intent: "admit-skill-workflow",
  skillId: SkillIdentifier,
  supportedCapabilities: SkillCapabilityIdentifier[],
  validator: SkillValidatorContractImplementation,
  workflow: SkillWorkflowContractImplementation
}
```

`validator` and `workflow` are admission candidates implementing Core-custodied
Contracts, not public executable fields in any returned domain value. Bootstrap
may supply them but cannot establish their semantics or admission authority.

The caller does not supply a Registered Skill graph or Skill Version. The
Skill-owned boundary resolves `skillId` against its authoritative M7 catalog,
uses only that canonical entry, and copies its exact registered Version into the
Admitted Skill Workflow relation. A same-shaped Registered Skill object,
factory-created value, or caller assertion is never evidence of registration.
Version remains recorded metadata and never becomes ranking, preference,
compatibility, or a second identity policy.

One Skill runtime admits at most one workflow relation for a Skill Identifier
and the exact Version in its canonical catalog entry. A second admission
produces Duplicate Skill Workflow Admission, including an identical second
admission. A malformed admission request, missing registered Skill, unsupported
or duplicate capability, or missing/invalid Contract implementation produces
Invalid Skill Workflow Admission. Catalog/admission corruption that existed
before the operation is Invalid Skill Execution State before request
inspection.

Admission does not mutate the Registered Skill or M7 catalog. It creates a
separate immutable governed relation at any time while the Engine is Running
and the relevant immutable catalog entry exists. There is no update,
replacement, removal, disablement, invalidation, health, readiness,
installation, or refresh operation in the first slice. Because M7 has no
catalog removal or update, successful admission remains stable for the
process-local Engine lifetime. Same-shaped workflow objects and
caller-supplied functions outside the configured admission call cannot
establish admission.

Invocation eligibility is derived, not a public readiness state. A Registered
Skill is eligible for capability `C` exactly when:

1. its canonical manifest declares `C`;
2. the same Skill runtime holds one valid Admitted Skill Workflow with the same
   Skill Identifier and exact Skill Version; and
3. that admitted workflow explicitly lists `C` in
   `supportedCapabilities`.

No installation, loading, health, timestamp, environment, endpoint, timeout,
or inferred capability support participates.

A Registered Skill with no admitted workflow is valid catalog state and simply
is not invocation-eligible. A workflow cannot be admitted before its Skill is
registered, and an admission cannot exist without its canonical catalog entry.

## Skill Binding

A Skill Binding is the ADR-0006-owned, pre-operation, authority-bearing
immutable result of Skill selection:

```text
{
  capability: SkillCapabilityIdentifier,
  registeredSkill: RegisteredSkill
}
```

It records the complete canonical Registered Skill projection and the exact
selected capability. The capability must occur exactly once in both the
Registered Skill declarations and the corresponding Admitted Skill Workflow
supported-capability set.

Skill Version is preserved exactly inside `registeredSkill`. It is metadata
only and is never identity, ranking, preference, compatibility, or ordering.

A Skill Binding:

- is distinct from a discovery result;
- is issued before operation allocation;
- contains no Authorization Operation Identifier;
- is not an authorization decision or invocation request;
- does not prove successful execution; and
- cannot be fabricated by constructing the same public fields.

## Bound Skill Invocation Target

A Bound Skill Invocation Target is one authority-bearing immutable
operation-specific value created after orchestration allocates the Authorization
Operation Identifier. It binds one authoritative Skill Binding to one protected
Skill invocation target and does not redefine the ADR-owned Skill Binding.

## Protected Skill Invocation

A Protected Skill Invocation is one admitted attempt to execute the exact
workflow identified by one authoritative Bound Skill Invocation Target under
the governed requirements and one exact matching Governed Authorization
Evaluation containing a Security-issued `allow` Authorization Decision
Artifact.

## Normalized Skill Execution Result

A Normalized Skill Execution Result is the Skill Engine-owned immutable
cross-boundary representation of either:

- a successfully completed Skill workflow; or
- a valid declared Skill business failure.

It exists only after workflow execution begins. Authorization rejection,
invocation rejection, input-validation failure, native workflow failure, and
Engine failure do not produce a Normalized Skill Execution Result.

# Skill Selection Request

The minimal selection input is exactly:

```text
{
  intent: "select-skill",
  capability: SkillCapabilityIdentifier
}
```

The request contains no:

- Candidate Plan or Reasoning Outcome;
- preferred Skill Identifier;
- version or version range;
- ranking, score, priority, or caller preference;
- Identity, Context, permission, grant, or authorization evidence;
- Authorization Operation Identifier;
- invocation data; or
- executable reference.

The operation identifier is absent because ADR-0006 assigns allocation after
selection. Brain determines that an exact capability is required but cannot
choose the selected candidate.

# Deterministic Selection Policy

The first selection policy has fixed identity:

```text
orion.minimum-skill-selection
version 1.0.0
```

Selection operates over the canonical M7 discovery candidates for the exact
requested capability:

1. Obtain every exact discovery match without changing M7 discovery semantics.
2. Retain only invocation-eligible candidates admitted by the same Skill-owned
   runtime.
3. Validate the complete candidate and admission relation.
4. Order eligible candidates by ascending Skill Identifier using
   locale-independent Unicode code-point order. M7 Skill Identifiers are ASCII,
   so this is equivalent to ascending ASCII code-point order.
5. Select the first candidate.

The policy defines no scoring, ranking weights, caller preference, version
preference, health, cost, location, registration-order preference, random
choice, or fallback alias.

Skill Version is never compared for precedence, compatibility, or preference.
It is recorded exactly after a candidate is selected.

## Selection Result

Selection returns exactly one of:

```text
Selected
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
Unavailable
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

Exact semantics:

| Eligible matches | Result                                            |
| ---------------- | ------------------------------------------------- |
| Zero             | `unavailable` with `no-invocation-eligible-skill` |
| One              | Select that candidate                             |
| More than one    | Select the lowest Skill Identifier exactly        |

Zero matches is a successful unavailable result, not an Engine failure.
Multiple matches are never ambiguous under the fixed policy.

A malformed discovery candidate, corrupted catalog entry, contradictory
workflow admission, duplicate eligible identity, or inability to choose exactly
one first candidate is invalid Skill Engine state, not selection unavailability.

# Bound Skill Invocation Target Request

Successful selection has already returned the authoritative pre-operation Skill
Binding. Protected orchestration then allocates the operation identifier and
requests construction of the operation-specific target:

```text
{
  intent: "bind-skill-to-operation",
  operationId: AuthorizationOperationIdentifier,
  binding: SkillBinding
}
```

The Skill-owned operation-target boundary must verify that the Skill Binding was
issued by the configured selection capability of the same valid Skill runtime
and still corresponds to the same complete Registered Skill and Admitted Skill
Workflow relation.

# Bound Skill Invocation Target Model

The immutable Bound Skill Invocation Target contains exactly:

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

The target is derived entirely from the authoritative Skill Binding:

- `skillId` is the exact Registered Skill Identifier;
- `skillVersion` records the admitted version exactly and is not identity,
  ranking, compatibility, or preference;
- `capability` is the exact selected declared capability;
- `action` is the fixed Authorization Action Identifier `skill.invoke`;
- `resource.resourceId` is exactly `skill:` followed by the Skill Identifier;
- `requiredPermissions` is the complete canonical manifest permission snapshot;
- `inputNames` is the complete canonical manifest input-name snapshot;
- `outputNames` is the complete canonical manifest output-name snapshot; and
- `failureModes` is the complete canonical manifest failure-mode snapshot.

The derived resource is valid under CONCEPT-0004 because `skill:` plus a
1–64-character M7 Skill Identifier is 7–70 restricted ASCII characters. Security
treats the identifier as opaque and must not parse it. The Skill-owned
operation-target boundary alone owns this derivation rule.

The manifest permission, input, output, and failure collections retain their
accepted M7 0–64 bounds, uniqueness, exact equality, and canonical code-point
ordering.

A target contains no executable reference, function, class, module path,
endpoint, Provider, Adapter, credential, timestamp, readiness flag, mutable
catalog reference, or workflow result.

The target does not imply that:

- authorization will allow;
- the Skill remains invocable outside the issuing runtime;
- input validation will succeed;
- execution started;
- the workflow succeeded; or
- the result is reusable.

# Governed Skill Invocation Requirements

The operation-specific target is the capability-owned source for the Skill
invocation's Protected Action Requirements, but it does not own or contain
Security sensitivity.

The Skill-backed Requirements Correspondence Boundary consumes exactly one
request:

```text
{
  intent: "resolve-skill-invocation-requirements",
  target: BoundSkillInvocationTarget
}
```

It requires an authoritative target and returns exactly one of:

```text
Available
{
  status: "available",
  requirements: SkillInvocationRequirementsProjection
}
```

```text
Unavailable
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

The authority-bearing Skill Invocation Requirements Projection is exactly:

```text
{
  operationId: AuthorizationOperationIdentifier,
  action: "skill.invoke",
  resource: {
    kind: "identified",
    resourceId: AuthorizationResourceIdentifier
  },
  requiredPermissions: SkillPermissionIdentifier[],
  sensitivity: "standard" | "sensitive"
}
```

The operation, action, resource, and complete canonical permissions are derived
without caller replacement from the Bound Skill Invocation Target. Sensitivity
is obtained from the configured Security-owned Protected Action Requirements
classification semantics for that exact target. Neither Skill, Brain,
orchestration, nor the invocation caller may propose, default, replace, or
downgrade it.

At requirements resolution, the configured Security requirements authority
must resolve zero or exactly one governed sensitivity classification for the
exact admitted Skill target identity (action and resource). The classification
source is immutable process-local Security authority input:

- exactly one `standard` or `sensitive` value is valid;
- absence of a classification produces governed requirements `unavailable`;
- duplicate or contradictory classification is invalid pre-existing Security
  or requirements-authority state; and
- there is no implicit `standard` fallback.

Governed `unavailable` is a successful requirements-resolution result, not an
exception. Orchestration may still obtain M8's corresponding
`requirements-unavailable` indeterminate decision for the operation, but it
cannot construct a protected invocation because no authoritative available
requirements projection exists.

For Security evaluation, the configured M8 Protected Action Requirements
Authority Contract independently invokes the same governed classification and
declaration semantics and returns the exact CONCEPT-0004 available or
unavailable result. Security co-issues the resulting Artifact and Summary only
through the Authorization Evaluation Outcome and retains only the private
process-local provenance association specialized by ENGINE-0009.

For protected enforcement, the Skill Invocation Requirements Projection is the
equally authoritative operation-bound correspondence projection permitted by
CONCEPT-0004. It must be issued through the configured requirements
correspondence boundary for the same operation and must be deeply equivalent in
operation, action, resource, permissions, and sensitivity to the available
Protected Action Requirements used by Security. If requirements are
unavailable, no enforceable projection and no protected invocation can be
created.

A public factory or same-shaped caller object establishes structural validity
only. It cannot establish requirements or sensitivity authority. A mismatch
between this projection and the Security-issued artifact is an authorization
enforcement failure.

# Binding and Target Authority and Provenance

Skill Binding and Bound Skill Invocation Target are authority-bearing values.

Matching object shape, a public value factory, a TypeScript brand, possession of
the same Registered Skill metadata, or caller knowledge of the deterministic
selection policy cannot establish authority.

Authority requires:

1. selection through the configured Skill-owned Select Skill Contract;
2. an unforgeable runtime provenance capability associated with that returned
   Skill Binding;
3. operation allocation by protected orchestration;
4. target creation through the configured Skill-owned Bind Skill to Operation
   Contract;
5. revalidation against the current canonical Registered Skill and admitted
   workflow relation; and
6. an operation-bound provenance capability associated with the returned Bound
   Skill Invocation Target.

The future Engine Specification must define an implementation-testable
mechanism such as Engine-private opaque capabilities or an equivalent
non-forgeable runtime admission mechanism. Compile-time privacy alone is
insufficient.

Every public field is still safely reconstructed and validated. Provenance is
necessary but not sufficient for structural and semantic validity.

A Bound Skill Invocation Target:

- is authoritative only in the issuing Skill runtime;
- applies to exactly one operation;
- cannot be rebound to another operation;
- cannot be refreshed or modified by orchestration;
- cannot outlive the usable process-local lifetime of its issuing Engine
  instance; and
- cannot be accepted solely because a plain object matches it.

The Skill Binding remains authoritative only in the issuing Skill runtime and
only while its Registered Skill and Admitted Skill Workflow relation remain
valid. It is not operation-specific and cannot substitute for the Bound Skill
Invocation Target.

# Invocation Data Model

## Skill Invocation Scalar

The first slice permits only these capability-independent immutable scalar
values:

- primitive `null`;
- primitive boolean;
- integer from `-9007199254740991` through `9007199254740991` inclusive; or
- primitive Unicode string containing 0–4096 Unicode code points and no Unicode
  control code point in General Category `Cc`.

The integer bound is the interoperable exact-integer range
`-(2^53 - 1)` through `2^53 - 1`, avoiding precision-dependent semantics across
common runtimes.

The 4096-code-point text bound is a proposed first-slice hostile-boundary limit.
It permits bounded command data while requiring future large, binary, streamed,
or document content to use separately governed references instead of embedding
unbounded payloads.

Strings are preserved exactly. No trimming, Unicode normalization, case
folding, coercion, parsing, or truncation occurs. Floating-point numbers,
`NaN`, infinities, negative zero, bigint, symbol, function, array, object,
binary value, date, and coercible substitute are invalid.

## Skill Invocation Data

Skill Scalar Data Map is one exact immutable record:

- it has 0–64 own enumerable string properties;
- every property name is a valid Skill Interface Field Identifier;
- it has no own symbol property;
- it has an ordinary null or object prototype accepted by the exact-object
  boundary;
- every value is one Skill Invocation Scalar;
- property order is semantically irrelevant; and
- the reconstructed immutable representation uses ascending
  locale-independent code-point key order.

Skill Invocation Input Data is a Skill Scalar Data Map whose exact key set
equals the target's `inputNames` set:

- every declared input name is required;
- no undeclared input name is permitted;
- explicit `undefined` is invalid; and
- duplicate keys cannot be represented or normalized.

M7 input declarations therefore define the complete required and admissible
name set for this first slice. They do not define value types, optionality,
default values, aliases, or business validation.

Skill Invocation Output Data is the same scalar-map structure whose exact key
set equals the target's `outputNames` set. Every declared output is required,
no undeclared output is allowed, and zero output declarations require the exact
empty record.

The selected Skill validates the meaning of each otherwise structurally valid
scalar after authorization enforcement and before workflow execution.

# Skill Execution Context Projection

The Skill Execution Context Projection is one authority-bearing,
privacy-minimized immutable value:

```text
{
  operationId: AuthorizationOperationIdentifier,
  lineageId: ContextLineageIdentity,
  revisionId: ContextRevisionIdentity,
  subject: AuthorizationSubject
}
```

It identifies exactly one immutable Active Context Revision prepared for the
invocation and carries the minimum accepted Authorization Subject projection
derived from that revision's Identity Context Projection.

It contains no raw Context fragment, Memory, Knowledge, location, device,
session, trust value, conversation content, credential, token, or mutable
Context access.

The projection boundary request is exactly:

```text
{
  intent: "resolve-skill-execution-context",
  operationId: AuthorizationOperationIdentifier,
  contextRevision: ActiveContextRevision
}
```

The projection authority boundary:

- receives the allocated operation and one complete current Active Context
  Revision selected by protected orchestration;
- verifies that the revision is Active at projection time;
- derives lineage, revision, and subject without caller replacement;
- binds the projection to the operation;
- defensively reconstructs the value; and
- returns authority-bearing provenance that same-shaped caller data cannot
  establish.

Issuance establishes operation-scoped snapshot validity. Once issued from a
revision that was Active at projection time:

- the projection remains the authoritative Context snapshot for that operation;
- a later successor activation or expiry of the source revision does not
  invalidate the already-issued projection;
- the projection cannot be reused for another operation; and
- protected invocation validates provenance and correspondence without querying
  current Context Engine state.

A malformed or fabricated projection produces Invalid Skill Authority. A wrong
operation produces Invalid Skill Authority correspondence failure. A subject
mismatch against Security-issued authorization produces Skill Authorization
Enforcement Failure. The first slice performs no post-issuance expiration or
currentness check.

Protected orchestration owns choosing the Active Context Revision for the
invocation. Context remains owner of revision and Identity-projection semantics.
The Skill Engine does not retrieve, refresh, or mutate Context and has no direct
Context Engine implementation dependency.

The first slice uses this reference projection rather than the full Active
Context Revision because generic Skill execution needs exact operation,
provenance, and subject correspondence but does not require raw Context facts.
Any additional Context value must be transformed into declared generic
invocation data by an authorized future orchestration rule or introduced by a
separately approved Context execution projection revision.

# Protected Skill Invocation Request

The public protected invocation request is exactly:

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

The request contains no raw Registered Skill, workflow implementation,
executable handle, Provider, Adapter, transport, credential, timeout, retry,
cancellation, Event publisher, mutable Context object, raw Security Evaluation
Context, Device, Session, Trust value, or Security-private provenance state.

The envelope operation identifier must equal the target, requirements, Context
projection, contained Authorization Decision Artifact, and contained Governed
Security Evaluation Summary operation identifiers exactly.

`target`, `requirements`, `context`, and `authorizationEvaluation` are
authority-bearing candidates. Their public presence does not confer authority.
Each must carry the invocation-local provenance of its configured governed
boundary.

## Governed Security Authorization Evaluation

For M9, the governed Security authorization evaluation authority is exactly one
Security-issued Authorization Evaluation Outcome with the public semantic
projection:

```text
{
  authorization: AuthorizationDecisionArtifact,
  securityEvaluationSummary: GovernedSecurityEvaluationSummary
}
```

The Outcome binds the exact Artifact and exact Summary co-issued by one
successful Security evaluation. It preserves their exact contents and
same-evaluation authority; it does not change, reinterpret, or recompute the M8
decision. The naked Artifact, naked Summary, or a caller-created matching pair
is insufficient M9 invocation authority.

The governed source-neutral authorization coordination boundary accepts exactly:

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

The boundary:

1. validates its own lifecycle, configuration, request, and operation;
2. invokes the configured Core-custodied Evaluate Authorization Outcome Contract
   exactly once with `request` and never invokes the legacy Artifact projection
   for the same operation;
3. contains and normalizes every value thrown by that collaborator;
4. safely validates the returned Outcome, its Artifact, and its Summary;
5. verifies through the configured Security authority verifier that the exact
   Outcome is genuine for this operation and that its exact Artifact and Summary
   originate from the same Security evaluation;
6. requires the Artifact and Summary operations, Artifact action, and Artifact
   resource to correspond exactly to `request`; and
7. returns that exact authoritative Outcome without wrapping, cloning,
   reconstructing, replacing, or minting Security provenance.

A configured Security collaborator throw produces Invalid Skill Execution
State. A malformed, hostile, fabricated, cloned, reconstructed, cross-runtime,
wrong-operation, or unverifiable returned Outcome produces Invalid Governed
Authorization Evaluation. A valid `deny` or `indeterminate` Outcome is a valid
governed evaluation but remains non-executable. A valid matching `allow`
Outcome becomes eligible for protected correspondence validation.

The exact Engine-private issuance registry and verification mechanism remain an
ENGINE-0009 specialization and are not duplicated here. Structural equality,
operation equality, subject equality, four-status equality, TypeScript
branding, public factory construction, cloning, spreading,
serialization/reconstruction, caller possession, cross-evaluation pairing, or
incompatible-runtime authority cannot establish same-evaluation provenance.

Core custodies the shared Outcome, Artifact, Summary, and Contract schemas only.
Core owns no minting behavior. Security owns evaluation and Outcome authority;
protected orchestration coordinates the source-neutral Contract calls; and the
Skill boundary owns enforcement. This creates no direct Skill-to-Security
implementation dependency and no new capability owner.

### Governed Security Evaluation Summary

The Security-owned Summary has exactly:

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

The Summary is immutable, evaluation-bound, operation-bound, subject-bound,
process-local Security authority and an evaluation snapshot. It is not current
Context, a Skill Execution Context Projection, raw Security Evaluation Context,
a freshness or revocation token, permission evidence, or caller-mintable
authority. It contains no `permissionsStatus`.

The Summary records what Security evaluated. Protected invocation performs no
new Security, Context, Device, Session, or Trust currentness query. Later
Context, Device, Session, or Trust changes do not rewrite the issued snapshot.
This model adds no timestamp, expiration, revocation, persistence, distributed
transport, or replay semantics.

# Protected Invocation Admission

The Skill-owned protected invocation boundary validates in this order:

1. Skill Engine lifecycle and pre-existing catalog, workflow-admission, policy,
   and provenance state.
2. Protected invocation envelope exact shape.
3. Envelope operation identifier syntax.
4. Bound Skill Invocation Target and underlying Skill Binding structure,
   authority provenance, issuing runtime, operation correspondence, and current
   Admitted Skill Workflow correspondence.
5. Skill Execution Context Projection structure, authority provenance,
   operation-scoped snapshot validity, operation correspondence, and subject
   validity.
6. Skill Invocation Requirements Projection structure, authority provenance,
   and exact target correspondence.
7. Authorization Evaluation Outcome authority for the issuing Security
   instance/runtime and expected operation.
8. Exact same-evaluation provenance of the contained Artifact and Summary.
9. Contained Artifact and Summary structure and complete CONCEPT-0004 semantic
   validity.
10. Exact authorization correspondence among the request, target, requirements,
    Context projection, Artifact, and Summary.
11. Skill Invocation Data structure and exact declared input-name set.
12. Admitted Skill Validator invocation and Skill Validation Outcome.
13. Admitted Skill Workflow execution.
14. Raw workflow result reconstruction and validation.
15. Constructed Normalized Skill Execution Result validation.

An earlier failure prevents every later hostile boundary, Skill callback, and
workflow from being touched.

# Authorization Enforcement Correspondence

Before any selected Skill package code is called, the protected boundary must
let `artifact` be the exact `authorizationEvaluation.authorization` value, let
`summary` be the exact
`authorizationEvaluation.securityEvaluationSummary` value, and verify:

- the configured Security verifier accepts the exact Authorization Evaluation
  Outcome for this exact operation and issuing Security instance/runtime;
- the exact Artifact and Summary have same-evaluation provenance;
- no structural equality, visible correspondence, TypeScript brand, public
  factory, clone, spread, serialization/reconstruction, cross-evaluation pair,
  or incompatible-runtime value established authority;
- `artifact.decision` is exactly `allow`;
- envelope, target, requirements, Context projection, Artifact, and Summary
  operation identifiers are exactly equal;
- Artifact subject exactly equals both the Context projection subject and
  Summary subject, preserving the same exact anonymous or authenticated subject
  semantics;
- artifact action is exactly target and requirements action `skill.invoke`;
- artifact resource exactly equals target and requirements resource;
- artifact evaluated permissions exactly equal target and requirements
  `requiredPermissions` as canonical sets;
- artifact sensitivity exactly equals the governed requirements sensitivity;
- artifact requirements status is `available`;
- artifact sensitivity is `standard` or `sensitive`, never `unavailable`;
- every required Security dimension status satisfies CONCEPT-0004's `allow`
  invariants;
- artifact grant-evidence and confirmation statuses are compatible with its
  exact valid `allow` row;
- artifact policy is exactly `orion.minimum-authorization` version `1.0.0`;
- Artifact and Summary are structurally and semantically valid under
  CONCEPT-0004;
- the four Security-status correspondences are independently exact:

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

- the Artifact never serves as its own source of expected Security statuses; and
- provenance is necessary but not sufficient: every structural and semantic
  correspondence check still succeeds.

The boundary additionally verifies target capability and workflow admission,
which are Skill-domain correspondence and are not Security policy.

Failure classification follows the validation stages exactly:

1. A missing `authorizationEvaluation` property, explicit `undefined`, or any
   other malformed protected-invocation envelope produces Invalid Protected
   Invocation Input before an invocation lifecycle begins.
2. A naked Artifact, naked Summary, caller-created pair, or fabricated, cloned,
   spread, serialized/reconstructed, cross-runtime, malformed, hostile, or
   otherwise invalid Authorization Evaluation Outcome produces Invalid Governed
   Authorization Evaluation.
3. A structurally valid authoritative Outcome whose exact Artifact/Summary
   same-evaluation relation cannot be verified, including cross-evaluation
   mixing, produces Invalid Governed Authorization Evaluation before semantic
   enforcement. Structurally valid visible correspondence never substitutes for
   provenance.
4. A provenance-valid Outcome with a malformed, hostile, structurally invalid,
   or semantically impossible contained Artifact or Summary also produces
   Invalid Governed Authorization Evaluation. Outcome provenance does not
   replace contained-value validation.
5. Only after Outcome authority, same-evaluation provenance, and contained-value
   validity succeed, a valid governed `deny`, valid governed `indeterminate`, or
   valid governed `allow` with any operation, subject, action, resource,
   permission, sensitivity, policy/version, confirmation,
   governed-requirements, Bound Skill Invocation Target, or independent Context,
   Device, Session, or Trust Level status mismatch produces Skill Authorization
   Enforcement Failure.
6. A valid governed `allow` with every exact correspondence check satisfied
   completes authorization enforcement and permits input validation to begin.

Every failure in stages 1–5 prevents Skill-specific validation and workflow
execution. Invalid Governed Authorization Evaluation is an authority/evidence
validity failure; Skill Authorization Enforcement Failure is reserved for
authorization semantics or correspondence after authority/evidence validity is
established.

The boundary does not:

- perform a second Security evaluation or currentness query;
- reinterpret decision reasons;
- change sensitivity;
- acquire grants or confirmation;
- convert denial into a business failure; or
- treat `allow` as execution success.

Security has no evaluation role after issuing the Outcome. Read-only
verification of that Outcome is authority validation, not policy recomputation
or a new evaluation.

## Security Evaluation Provenance

Protected orchestration invokes Resolve Governed Authorization Evaluation for
the exact target operation, action, and resource and conveys the exact returned
Authorization Evaluation Outcome to Protected Invoke Skill without replacement
or authority reconstruction.

A naked Authorization Decision Artifact—including a structurally perfect
factory-created `allow` with complete field correspondence—is never sufficient
M9 invocation authority. A naked Summary or fake same-shaped Outcome is also
insufficient. Each produces Invalid Governed Authorization Evaluation before
any Skill callback.

Provenance is necessary but not sufficient. The protected boundary still safely
validates the Outcome projection, Artifact, Summary, and every semantic
correspondence. No public token, public symbol, signature, JWT, database,
persistence record, token service, network verification, or cryptographic
transport is introduced.

# Skill-Specific Input Validation

The admitted Skill Validator is part of the governed Admitted Skill Workflow
relation. It receives exactly:

```text
{
  operationId: AuthorizationOperationIdentifier,
  capability: SkillCapabilityIdentifier,
  inputs: SkillInvocationInputData,
  context: SkillExecutionContextProjection
}
```

It returns exactly one closed Skill Validation Outcome:

```text
Accepted
{
  status: "accepted"
}
```

```text
Rejected
{
  status: "rejected"
}
```

The outcome is authority-bearing only because it was returned by the admitted
validator invocation for the current operation. A same-shaped caller object is
not a validation result.

Skill-specific input validation occurs only after:

- generic request admission;
- authoritative target and Context validation; and
- exact `allow` enforcement.

It occurs before workflow execution.

The selected Skill receives the exact reconstructed scalar map and validates
operation-specific meaning, such as permitted ranges or relationships. This
validation:

- must be synchronous, deterministic, and side-effect-free;
- must not call the business workflow;
- must not mutate or retain the supplied map;
- must not access undeclared inputs;
- must not reinterpret authorization; and
- returns exactly one complete Skill Validation Outcome.

Exact mapping:

- returned `accepted` advances to workflow execution;
- returned `rejected` produces controlled Skill Input Validation Failure and
  prevents workflow execution;
- a native or domain throw produces Skill Validator Boundary Failure;
- a malformed, hostile, extra-field, Promise, or thenable return produces
  Invalid Skill Validation Result; and
- no original throw, message, stack, hostile value, or result content escapes.

There is no thrown controlled rejection. The validator may inspect only the
reconstructed invocation inputs and approved Context projection supplied in its
request. It must be synchronous, deterministic, non-mutating, non-retaining,
and side-effect-free with respect to protected business effects.

Input validation after enforcement prevents untrusted Skill package code from
running for unauthorized operations. Requiring validation to be side-effect-free
ensures no protected business effect occurs before the execution start point.

# Execution Start Condition

Workflow execution begins at the single semantic transition from
`input-validated` to `executing`.

That transition is permitted only after:

- the Engine is Running with valid pre-existing state;
- Skill Binding and Bound Skill Invocation Target provenance are valid;
- request and generic inputs are valid;
- the Context projection is valid and operation-bound;
- exact `allow` correspondence has been enforced;
- Skill-specific input validation succeeded; and
- the admitted workflow still corresponds to the target.

No Skill workflow callback, protected side effect, output, or business failure
may occur before this transition.

# Skill Workflow Boundary

The admitted process-local workflow boundary receives exactly:

```text
{
  operationId: AuthorizationOperationIdentifier,
  capability: SkillCapabilityIdentifier,
  inputs: SkillInvocationInputData,
  context: SkillExecutionContextProjection
}
```

The workflow does not receive the Authorization Decision Artifact, grants,
permissions, selection policy, full Registered Skill, or mutable Context.
Enforcement is already complete.

The workflow boundary guarantees:

- it corresponds to target Skill Identifier and exact Skill Version through
  admission provenance;
- it supports the bound declared capability;
- it is synchronous for the first slice;
- it invokes the business workflow at most once;
- it returns one raw result before the call completes or throws;
- it mutates no caller or Engine-owned value; and
- it retains no mutable input or Context graph.

The workflow implementation may return only:

```text
Raw Success
{
  status: "succeeded",
  outputs: SkillInvocationOutputData
}
```

or:

```text
Raw Business Failure
{
  status: "failed",
  failureMode: SkillFailureModeIdentifier
}
```

For success, output keys must equal the target's `outputNames` set exactly and
values use the same Skill Invocation Scalar model. For business failure, the
failure mode must appear exactly in target `failureModes`.

Both raw result variants are exact objects with no additional fields. A
Promise, thenable, callback registration, stream, iterator continuation, Event
completion, malformed object, hostile object, or any other returned value is
Invalid Skill Workflow Result. A native or domain value thrown after workflow
entry is Skill Workflow Execution Failure.

# Normalized Skill Execution Result

The normalized result is exactly one of:

```text
Succeeded
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
Failed
{
  operationId: AuthorizationOperationIdentifier,
  skillId: SkillIdentifier,
  skillVersion: SkillVersion,
  capability: SkillCapabilityIdentifier,
  status: "failed",
  failureMode: SkillFailureModeIdentifier
}
```

Every target field is copied from the authoritative Bound Skill Invocation
Target. The Skill cannot replace it.

Exact invariants:

- `succeeded` has `outputs` and no `failureMode`;
- `failed` has one declared `failureMode` and no `outputs`;
- operation, Skill, version, and capability match the target exactly;
- output keys match target `outputNames` exactly;
- result data is defensively reconstructed and deeply immutable;
- no raw exception, free-text message, authorization evidence, Context value,
  permission, credential, or implementation detail appears; and
- result construction does not imply persistence, Event publication, delivery,
  or final cognitive success.

Normalized Skill Execution Result is authority-bearing. It gains authority only
as the validated return of the configured Skill-owned Protected Invoke Skill
Contract for the current operation and target. Public factory construction,
TypeScript branding, or matching public fields establishes structure only.
Brain may trust only the governed Contract return, never a same-shaped external
object.

The exact `operationId`, `skillId`, `skillVersion`, and `capability` fields are
the minimum immutable target correspondence Brain needs. Together with
`status`, and either `outputs` or `failureMode`, they identify the operation,
authoritative target snapshot, selected capability, and result category without
embedding the complete target.

An empty output record is required when the manifest declares zero outputs.
There is no separate absent payload. This avoids `undefined`, optional payload
semantics, and arbitrary unbounded `any`.

# Business Failure and Engine Failure

A valid raw `failed` result with one exactly declared failure mode is a Skill
business failure. It:

- means the workflow executed and completed with a declared unsuccessful
  business outcome;
- produces a normalized `failed` result;
- is not an exception;
- does not mean the Skill Engine is corrupt; and
- is not authorization denial.

These conditions do not produce a normalized result:

- malformed invocation;
- fabricated or mismatched authority-bearing value;
- authorization rejection;
- Skill-specific input rejection;
- native validation or workflow throw;
- malformed or hostile raw result;
- undeclared failure mode;
- invalid Engine lifecycle or internal state; or
- impossible constructed normalized result.

# Public Failure Taxonomy

The future Engine Specification must use the following closed semantic
categories, with repository-conventional concrete class names:

| Category                                  | Semantic condition                                                                                                                   | Result                |
| ----------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------ | --------------------- |
| Invalid Skill Selection Input             | Malformed or hostile Select Skill request or capability                                                                              | Thrown domain failure |
| Invalid Skill Selection Authority         | Malformed/corrupt discovery candidate, workflow admission, duplicate eligible identity, or impossible selection                      | Thrown domain failure |
| Invalid Skill Workflow Admission          | Malformed admission request, absent registered Skill, unsupported capability, or invalid validator/workflow boundary                 | Thrown domain failure |
| Duplicate Skill Workflow Admission        | Any second admission for the same Skill Identifier and exact Version                                                                 | Thrown domain failure |
| Invalid Bound Skill Target Input          | Malformed target-creation request or operation identifier                                                                            | Thrown domain failure |
| Invalid Protected Invocation Input        | Missing/undefined `authorizationEvaluation`, malformed envelope, generic inputs, or exact input-name mismatch                        | Thrown domain failure |
| Invalid Skill Authority                   | Fabricated, stale, wrong-runtime, or mismatched Skill Binding, target, requirements projection, or workflow admission                | Thrown domain failure |
| Invalid Skill Context Authority           | Fabricated, malformed, or cross-operation Context projection                                                                         | Thrown domain failure |
| Invalid Governed Authorization Evaluation | Naked Artifact/Summary or pair; invalid Outcome authority/provenance; invalid contained value; or invalid configured Security return | Thrown domain failure |
| Skill Authorization Enforcement Failure   | Valid governed `deny`/`indeterminate`, or authoritative valid Outcome with any exact enforcement-correspondence mismatch             | Thrown domain failure |
| Skill Input Validation Failure            | Admitted validator returned the exact controlled `rejected` outcome                                                                  | Thrown domain failure |
| Skill Validator Boundary Failure          | Admitted validator threw a native, domain, primitive, or hostile value                                                               | Thrown domain failure |
| Invalid Skill Validation Result           | Validator returned malformed, hostile, Promise, thenable, or otherwise non-closed outcome                                            | Thrown domain failure |
| Skill Workflow Execution Failure          | Admitted workflow threw after workflow execution began                                                                               | Thrown domain failure |
| Invalid Skill Workflow Result             | Workflow returned malformed, hostile, Promise/thenable, wrong-output, or undeclared-failure result                                   | Thrown domain failure |
| Invalid Skill Execution State             | Invalid lifecycle/pre-existing state or impossible newly constructed target, selection result, or normalized result                  | Thrown domain failure |

The concrete names proposed for ENGINE-0010 review are:

- `InvalidSkillSelectionInputError`;
- `InvalidSkillSelectionAuthorityError`;
- `InvalidSkillWorkflowAdmissionError`;
- `DuplicateSkillWorkflowAdmissionError`;
- `InvalidBoundSkillTargetInputError`;
- `InvalidProtectedSkillInvocationInputError`;
- `InvalidSkillAuthorityError`;
- `InvalidSkillContextAuthorityError`;
- `InvalidGovernedAuthorizationEvaluationError`;
- `SkillAuthorizationEnforcementError`;
- `SkillInputValidationError`;
- `SkillValidatorBoundaryError`;
- `InvalidSkillValidationResultError`;
- `SkillWorkflowExecutionError`;
- `InvalidSkillWorkflowResultError`; and
- `InvalidSkillExecutionStateError`.

No additional public category may be introduced merely for a native exception,
timeout, cancellation, retry, Provider, Adapter, Event, persistence, or
transport concern absent from the first slice.

All native or hostile thrown values are contained and mapped to the category
owned by the active boundary. Original messages and values never escape.

# Invocation Lifecycle

The minimal per-invocation lifecycle is closed:

```text
proposed
  -> admitted
  -> authorized
  -> input-validated
  -> executing
  -> succeeded | failed
```

`rejected` is a terminal alternative before execution:

```text
proposed -> rejected
admitted -> rejected
authorized -> rejected
```

Exact state meanings:

| State             | Meaning                                                                                              |
| ----------------- | ---------------------------------------------------------------------------------------------------- |
| `proposed`        | The exact envelope and operation syntax passed; authority and correspondence are not yet admitted    |
| `admitted`        | Target, Context, requirements, Outcome, and same-evaluation provenance passed authority admission    |
| `authorized`      | Exact matching `allow` evidence was enforced                                                         |
| `input-validated` | Generic input matching and admitted Skill Validator acceptance succeeded                             |
| `executing`       | The admitted workflow callback has begun                                                             |
| `succeeded`       | A valid raw success and constructed normalized success were validated                                |
| `failed`          | A declared business failure was normalized or a post-execution domain failure terminated the attempt |
| `rejected`        | A post-proposal, pre-execution domain failure prevented workflow execution                           |

Allowed transitions are exactly those shown. No state may be skipped, reversed,
reentered, resumed, retried, or persisted.

Lifecycle is an internal Skill-owned semantic for the first slice. No public
progress query, lifecycle mutation Contract, timestamp, duration, or stored
invocation record exists.

Normalized `succeeded` corresponds only to terminal `succeeded`. Normalized
business `failed` corresponds to terminal `failed`. A thrown execution-stage
failure may also terminate internal lifecycle as `failed` but produces no
normalized result.

Lifecycle begins only after lifecycle/pre-existing-state validation, the exact
protected-invocation envelope, and operation syntax succeed. A malformed
envelope or operation never constitutes an invocation and creates no lifecycle.

The complete failure-stage mapping is normative:

| Stage or outcome                                                            | Lifecycle effect                  | Exact public result/category              | Validator called | Workflow called |
| --------------------------------------------------------------------------- | --------------------------------- | ----------------------------------------- | ---------------- | --------------- |
| Engine not Running or corrupt pre-existing state                            | no lifecycle                      | Invalid Skill Execution State             | no               | no              |
| Missing/undefined `authorizationEvaluation` or malformed envelope/operation | no lifecycle                      | Invalid Protected Invocation Input        | no               | no              |
| Valid envelope and operation                                                | enter `proposed`                  | continue                                  | no               | no              |
| Fabricated/malformed binding, target, requirements, or workflow authority   | `proposed -> rejected`            | Invalid Skill Authority                   | no               | no              |
| Cross-operation target or requirements                                      | `proposed -> rejected`            | Invalid Skill Authority                   | no               | no              |
| Fabricated, malformed, or cross-operation Context projection                | `proposed -> rejected`            | Invalid Skill Context Authority           | no               | no              |
| Naked Artifact, naked Summary, or caller-created pair                       | `proposed -> rejected`            | Invalid Governed Authorization Evaluation | no               | no              |
| Fabricated, cloned, reconstructed, or cross-runtime Outcome                 | `proposed -> rejected`            | Invalid Governed Authorization Evaluation | no               | no              |
| Malformed or hostile Authorization Evaluation Outcome                       | `proposed -> rejected`            | Invalid Governed Authorization Evaluation | no               | no              |
| Cross-evaluation Artifact/Summary pair                                      | `proposed -> rejected`            | Invalid Governed Authorization Evaluation | no               | no              |
| Valid-provenance Outcome contains malformed/hostile/invalid nested value    | `proposed -> rejected`            | Invalid Governed Authorization Evaluation | no               | no              |
| Configured Security collaborator throws while resolving governed evaluation | no protected-invocation lifecycle | Invalid Skill Execution State             | no               | no              |
| Configured Security returns invalid or unverifiable Outcome while resolving | no protected-invocation lifecycle | Invalid Governed Authorization Evaluation | no               | no              |
| All authority and operation correspondence admitted                         | `proposed -> admitted`            | continue                                  | no               | no              |
| Governed Security decision is `deny`                                        | `admitted -> rejected`            | Skill Authorization Enforcement Failure   | no               | no              |
| Governed Security decision is `indeterminate`                               | `admitted -> rejected`            | Skill Authorization Enforcement Failure   | no               | no              |
| Governed `allow` has authorization correspondence mismatch                  | `admitted -> rejected`            | Skill Authorization Enforcement Failure   | no               | no              |
| Exact governed Security `allow` correspondence                              | `admitted -> authorized`          | continue                                  | no               | no              |
| Malformed/mismatched generic invocation inputs                              | `authorized -> rejected`          | Invalid Protected Invocation Input        | no               | no              |
| Validator returns controlled `rejected`                                     | `authorized -> rejected`          | Skill Input Validation Failure            | yes              | no              |
| Validator throws native/domain/primitive/hostile value                      | `authorized -> rejected`          | Skill Validator Boundary Failure          | yes              | no              |
| Validator returns malformed outcome                                         | `authorized -> rejected`          | Invalid Skill Validation Result           | yes              | no              |
| Validator returns hostile outcome                                           | `authorized -> rejected`          | Invalid Skill Validation Result           | yes              | no              |
| Validator returns Promise                                                   | `authorized -> rejected`          | Invalid Skill Validation Result           | yes              | no              |
| Validator returns thenable                                                  | `authorized -> rejected`          | Invalid Skill Validation Result           | yes              | no              |
| Validator returns exact `accepted`                                          | `authorized -> input-validated`   | continue                                  | yes              | no              |
| Workflow callback begins                                                    | `input-validated -> executing`    | continue                                  | yes              | yes             |
| Valid raw success and valid normalized success                              | `executing -> succeeded`          | normalized `succeeded` result             | yes              | yes             |
| Valid declared raw business failure and valid normalized failure            | `executing -> failed`             | normalized business `failed` result       | yes              | yes             |
| Workflow throws native/domain/primitive/hostile value                       | `executing -> failed`             | Skill Workflow Execution Failure          | yes              | yes             |
| Workflow returns malformed raw result                                       | `executing -> failed`             | Invalid Skill Workflow Result             | yes              | yes             |
| Workflow returns hostile raw result                                         | `executing -> failed`             | Invalid Skill Workflow Result             | yes              | yes             |
| Workflow returns Promise                                                    | `executing -> failed`             | Invalid Skill Workflow Result             | yes              | yes             |
| Workflow returns thenable                                                   | `executing -> failed`             | Invalid Skill Workflow Result             | yes              | yes             |
| Workflow returns undeclared failure mode                                    | `executing -> failed`             | Invalid Skill Workflow Result             | yes              | yes             |
| Workflow outputs mismatch declarations                                      | `executing -> failed`             | Invalid Skill Workflow Result             | yes              | yes             |
| Normalized-result construction fails after a valid raw result               | `executing -> failed`             | Invalid Skill Execution State             | yes              | yes             |

No rejected or failed lifecycle is returned as a separate public lifecycle
artifact. The mapping is an internal, objectively testable Skill-owned
invariant.

# Skill Engine Lifecycle Relationship

M7 registration, workflow admission, Selection/Skill Binding,
operation-target creation, and protected invocation are valid only while the
Skill Engine is Running. Workflow admission occurs only after M7 registration
has created the canonical catalog entry and does not require an Engine restart.

The Engine must validate lifecycle and pre-existing catalog, workflow-admission,
selection-policy, and provenance state before inspecting a hostile public
request.

If the Engine is Ready, Stopping, or Stopped:

- the operation produces Invalid Skill Execution State;
- no request field, authority value, workflow, or Skill callback is inspected;
- no invocation lifecycle begins; and
- no state is mutated.

Workflow admission failures occur outside an individual protected invocation
lifecycle. An invalid admission request, missing registered Skill,
catalog/version mismatch, duplicate admission, or malformed validator/workflow
candidate creates no invocation lifecycle.

This model introduces no restart, restoration, persisted invocation, or
cross-instance authority. Stopping does not cancel an already executing
synchronous invocation because cancellation is absent; the future Engine
Specification must prevent a lifecycle transition from interleaving with one
atomic synchronous call.

# Timeout, Cancellation, Retry, and Isolation

## Timeout

The first slice has no timeout Contract, duration, deadline, timer, or timeout
failure.

Admitted workflows must use the synchronous process-local boundary. The model
does not claim that Skill Engine can prove termination or time-boundedness.
First-slice test fixtures are expected to return or throw synchronously for
their tested inputs; that is a test/fixture assumption, not invocation
eligibility or authority metadata.

Production asynchronous or long-running workflow support is outside the first
slice. Future timeout policy remains Skill Engine-owned and requires a reviewed
Concept revision.

## Cancellation

The first slice has no cancellation request, token, callback, state, or
partial-cancellation result. Future cancellation remains Skill Engine-owned.

## Retry

The protected boundary invokes the workflow at most once. No validation
failure, business failure, native throw, malformed result, or Engine failure is
automatically retried.

A new attempt requires a new Authorization Operation Identifier, new Bound
Skill Invocation Target, new requirements projection, new Security evaluation,
and new protected invocation. An artifact from the failed operation cannot
authorize the new attempt.

Future retry policy remains Skill Engine-owned.

## Failure Containment and Isolation

Process, container, virtual-machine, worker, and cryptographic sandboxing are
deferred.

The first slice nevertheless requires:

- no native or hostile thrown value crosses the protected boundary;
- Skill validation and workflow calls are protected independently;
- hostile raw outputs are reconstructed or rejected before normalization;
- one invocation cannot corrupt catalog, workflow admission, policy, provenance,
  or Engine lifecycle state;
- no partial normalized result escapes;
- caller, Context, authorization, binding, input, and raw-result source graphs
  remain unchanged and unfrozen;
- no mutable caller or Skill graph is retained;
- no global mutable invocation or fault state exists; and
- a later equivalent invocation is unaffected by an earlier failure.

# Synchronicity and Atomicity

The first slice is synchronous and process-local.

Selection, binding, Context projection, Security evaluation coordination,
protected invocation, Skill validation, workflow execution, and result
normalization each return or throw before their Contract call completes.

The model defines no:

- Promise;
- callback;
- stream;
- iterator-driven continuation;
- Event dependency;
- queue;
- external wait; or
- background execution.

One protected invocation is atomic with respect to Skill Engine semantic state.
It either returns one complete normalized result or throws one domain failure.
It exposes no partial result and does not mutate catalog or admission state.

A Promise or thenable returned by the validator is Invalid Skill Validation
Result. A Promise or thenable returned by the workflow is Invalid Skill Workflow
Result. Neither activates asynchronous support.

# Determinism

Given equivalent valid catalog state, workflow admission, request, Context
projection, authorization artifact, and deterministic workflow behavior:

- selection chooses the same Skill;
- binding is deeply equivalent;
- validation follows the same precedence;
- authorization correspondence yields the same outcome;
- the workflow is called once with deeply equivalent data;
- normalization returns a deeply equivalent result or the same failure
  category; and
- no registration, insertion, property, or input order changes semantics.

Semantic behavior must not depend on:

- wall clock or monotonic clock;
- randomness or cryptography;
- locale-sensitive comparison;
- filesystem or network;
- environment variable;
- process identifier;
- external service;
- mutable global state;
- Provider or Adapter state; or
- Event timing.

# Exact Runtime Boundary Safety

Every public, authority, workflow, and raw-result boundary treats runtime values
as hostile.

Exact record semantics reject, as applicable:

- `null` or `undefined` where a record is required;
- primitive, function, or array where a record is required;
- array-like substitutes;
- missing or explicit-`undefined` properties;
- unexpected own string properties;
- inherited substitutes;
- enumerable symbol properties;
- coercible objects;
- invalid prototypes where the boundary requires an exact record;
- sparse or decorated collections;
- accessors where data properties are required; and
- malformed closed discriminants.

Protected extraction requires:

- one protected own-key and descriptor capture per hostile record boundary;
- one protected read per accepted property;
- one protected read per accepted collection length;
- one protected read per accepted array index;
- reconstruction only from captured local values;
- no validation-then-second-read;
- no coercion or user-defined conversion; and
- containment of hostile `ownKeys`, descriptor, getter, Proxy, iterator, and
  thrown-value behavior.

These rules apply independently to:

- selection requests and results;
- Registered Skill projections;
- Admitted Skill Workflow, Skill Binding, and Bound Skill Invocation Target
  values;
- Context projections;
- authorization artifacts;
- protected invocation requests;
- invocation-data keys and values;
- workflow requests;
- validation results;
- raw workflow results; and
- normalized results.

# Immutability and Non-Mutation

Every successful public or governed value is defensively reconstructed and
deeply immutable, including:

- selection results;
- Admitted Skill Workflow projections;
- Skill Binding and nested Registered Skill;
- Bound Skill Invocation Target and every declaration snapshot;
- Skill Invocation Requirements Projection;
- Skill Invocation Data;
- Skill Execution Context Projection;
- protected invocation normalized representation;
- workflow request values;
- raw result reconstruction; and
- Normalized Skill Execution Result.

Implementations must not freeze, sort, rewrite, retain, or mutate caller,
orchestration, Context, Security, requirements-source, catalog-source,
admission-source, validator-source, workflow-source, or Skill-returned graphs.

Source objects and nested arrays remain unchanged and unfrozen on:

- selection success or unavailability;
- selection/binding and operation-target success;
- normalized success or business failure;
- every pre-execution rejection;
- native validation or workflow throw;
- malformed raw result;
- lifecycle failure; and
- constructed-result failure.

# Privacy and Diagnostics

Ordinary diagnostics must not emit:

- Authorization Operation Identifier;
- Skill Identifier, version, or capability;
- input or output names or values;
- Context lineage, revision, subject, or underlying values;
- action or resource identifiers;
- permissions, grants, confirmation, or authorization evidence;
- Governed Security Evaluation Summary or Authorization Evaluation Outcome
  contents, verification detail, or Security-private provenance state;
- failure-mode identifier;
- raw workflow result;
- native or hostile thrown value, message, or stack;
- manifest content;
- credentials, secrets, tokens, or personal information; or
- business-sensitive failure content.

Privacy-safe diagnostics may contain only:

- Skill Engine lifecycle category;
- selection status;
- eligible-candidate count;
- declared input, output, permission, and failure-mode counts;
- invocation lifecycle category;
- authorization-enforcement pass/fail category;
- normalized result status;
- stable domain-failure category; and
- aggregate invocation counts.

Diagnostics must not imply that selection is authorization, `allow` is
execution, or a normalized Skill result is final cognitive delivery.

# Authority-Bearing Value Inventory

| Value                                     | Governing provenance source                                                                     |
| ----------------------------------------- | ----------------------------------------------------------------------------------------------- |
| Admitted Skill Workflow                   | successful Running-only Skill-owned admission after authoritative M7 catalog lookup             |
| Skill Binding                             | configured Skill-owned Select Skill Contract return                                             |
| Bound Skill Invocation Target             | configured Skill-owned Bind Skill to Operation Contract return                                  |
| Skill Execution Context Projection        | configured Context projection authority invocation for the operation                            |
| Skill Invocation Requirements Projection  | configured Skill-backed Requirements Correspondence Boundary invocation                         |
| Protected Action Requirements             | configured M8 Protected Action Requirements Authority Contract invocation during evaluation     |
| Authorization Decision Artifact           | exact Artifact nested in one genuine Security-issued Authorization Evaluation Outcome           |
| Governed Security Evaluation Summary      | exact Summary nested in the same genuine Security-issued Authorization Evaluation Outcome       |
| Governed authorization evaluation/outcome | exact Security-issued Outcome accepted by the configured verifier for its operation and runtime |
| Skill Validation Outcome                  | current invocation of the validator in the Admitted Skill Workflow                              |
| Normalized Skill Execution Result         | configured Skill-owned Protected Invoke Skill Contract return for the operation and target      |

Every public factory establishes structural validity only. No TypeScript brand,
public symbol, matching shape, caller assertion, or orchestration possession
establishes authority.

The naked Authorization Decision Artifact and naked Governed Security Evaluation
Summary are independently insufficient M9 invocation authority. A
caller-created matching pair is also insufficient. Both exact nested values and
their same-evaluation relation must be established through the genuine governed
authorization evaluation/outcome. The raw Skill Workflow result is likewise not
independently authority-bearing. Its origin through the admitted workflow call
makes it a candidate for protected reconstruction and normalization only; it
remains hostile until fully validated.

# Contract Categories

A future ENGINE-0010 requires these Core-custodied Contract categories:

## Select Skill

Public Skill-owned request/result Contract implementing the fixed selection
policy and returning an authoritative pre-operation Skill Binding or governed
unavailable.

## Bind Skill to Operation

Skill-owned authority Contract accepting one allocated operation and one
governed Skill Binding and returning one authoritative Bound Skill Invocation
Target.

## Admit Skill Workflow

Running-only Skill-owned authority Contract accepting a Skill Identifier,
resolving its canonical Registered Skill from the same Skill capability's M7
catalog, and admitting exactly one synchronous validator/workflow relation for
that exact registered Version and an explicit supported-capability set. It is
not a readiness or installation operation.

## Resolve Skill Execution Context

Context-owned or source-neutral authority Contract accepting one operation and
one prepared Active Context Revision and returning one authoritative Skill
Execution Context Projection. Context retains semantic ownership.

## Resolve Skill Invocation Requirements Correspondence

Source-neutral, Security-governed classification boundary accepting one
authoritative Bound Skill Invocation Target and returning governed available
requirements projection or unavailable. The available projection is used for
enforcement correspondence. This boundary does not replace the M8 authority
Contract used internally by Security evaluation.

## Resolve Governed Authorization Evaluation

Source-neutral Core-custodied coordination Contract accepting the exact Outcome
evaluation request, invoking the configured Evaluate Authorization Outcome
Contract exactly once, validating its actual return, invoking the configured
read-only Security Outcome verifier, and returning the exact genuine
operation-bound Authorization Evaluation Outcome without replacement. It owns
no Security policy, provenance registry, or authority minting. Protected
orchestration implements this coordination Contract; Security retains
evaluation and Summary authority, and Skill retains enforcement ownership.

## Protected Invoke Skill

Public Skill-owned Contract accepting the exact protected invocation request,
enforcing authorization correspondence, invoking at most one admitted workflow,
and returning one normalized result or domain failure.

## Skill Validator

Subordinate synchronous process-local Contract implemented by an admitted Skill
package. It returns exactly one Skill Validation Outcome under the protected
boundary.

## Skill Workflow

Subordinate synchronous process-local Contract implemented by the same admitted
Skill package. It executes the business workflow only after validator acceptance
and returns one exact raw success or declared business failure candidate.

A separate public Normalize Skill Result Contract is unnecessary. Normalization
is mandatory behavior inside Protected Invoke Skill. Separating it publicly
would expose raw hostile results and allow callers to bypass invocation
provenance.

Every future Contract must define OES-0004 metadata, version, exact request and
response, semantic owner, Core custody, implementation responsibility,
synchronicity, guarantees, failures, provenance, and prohibited behavior.

# Brain Boundary

Brain or protected orchestration:

- supplies the exact required capability;
- accepts selected or unavailable without substituting a candidate;
- receives the authoritative pre-operation Skill Binding;
- allocates the operation only after receiving that binding;
- calls Bind Skill to Operation to obtain the Bound Skill Invocation Target;
- supplies exact generic input names and scalar values;
- selects the Active Context Revision and obtains the governed projection;
- obtains the governed Skill Invocation Requirements Projection;
- coordinates Resolve Governed Authorization Evaluation for the target action
  and resource using the configured Evaluate Authorization Outcome Contract
  exactly once and its read-only verifier;
- submits the protected invocation; and
- consumes only the governed Protected Invoke Skill return.

Brain must not:

- rank candidates;
- create Skill Binding, target, requirements, Context, Security, or result
  authority by shape;
- alter declaration snapshots;
- validate Skill-specific meaning;
- bypass enforcement;
- execute the workflow;
- normalize raw results;
- reinterpret Security decisions; or
- convert a Skill result into final delivery without separately governed Brain
  semantics.

# Planning Boundary

The minimal path does not derive an executable request from M6 Candidate Plan.

Protected orchestration may request a Skill capability only from a separately
governed orchestration decision outside Planning. That coordination decision is
not a Security authorization decision. A Candidate Plan remains advisory
evidence neither required nor sufficient for selection, binding, authorization,
or invocation.

This model consumes no Candidate Plan field and introduces no Planning
dependency. A future plan-bound invocation requires a separately reviewed
ENGINE-0007 revision and Concept update.

# Security Boundary

Protected orchestration requests Security evaluation only after the Bound Skill
Invocation Target establishes exact:

- operation;
- action `skill.invoke`;
- resource `skill:<skillId>`; and
- required-permission snapshot.

Security returns one Authorization Evaluation Outcome containing the exact
Authorization Decision Artifact, exact Governed Security Evaluation Summary,
and their same-evaluation authority through the source-neutral coordination
boundary. That boundary returns the exact verified Outcome without adding or
reconstructing provenance. The Skill-owned boundary accepts only that genuine
Outcome and enforces its contained Artifact and Summary locally through exact
correspondence. It does not directly import or call the Security Engine
implementation.

Security does not select, bind, enforce, invoke, execute, validate Skill
business inputs, normalize outputs, or receive execution results.

# Skill Catalog Boundary

M7 registration, lookup, and discovery remain unchanged.

- Registered does not mean invocation-eligible.
- Discovery returns all exact capability matches and remains non-selecting.
- Selection may internally consume the accepted discovery behavior but is a new
  separately specified Skill operation.
- Skill Version remains metadata and is not identity or preference.
- M7 permission declarations remain requirements, not grants.
- M7 input/output/failure declarations become exact first-slice name sets only
  under this Concept; they remain untyped metadata in M7.
- No readiness or health property is added to Registered Skill.
- No catalog persistence or executable handle is introduced.

# Architecture and Dependency Rules

Production source dependencies for the future slice point inward to Core:

```text
Brain implementation → Core Contracts
Skill Engine → Core
Skill package → Core Contracts
Context authority implementation → Core
Security Engine → Core
```

Forbidden source dependencies include:

- Brain → Skill Engine implementation;
- Skill Engine or Skill package → Brain implementation;
- Skill Engine or Skill package → Security Engine implementation;
- Skill Engine or Skill package → Context Engine implementation;
- Core → any Engine, Skill, Provider, Adapter, Infrastructure, or Bootstrap;
- Skill Engine → Provider, Adapter, database, filesystem, network, or external
  package runtime; and
- dependency cycles.

Bootstrap may explicitly compose admitted workflows and Contract
implementations without selecting, authorizing, enforcing, executing, or
normalizing on its own.

# Events, Providers, Adapters, and Persistence

## Events

The first slice publishes and consumes no Events. A `SkillExecuted` Event is not
required. Any future Event must describe a completed fact and receive separately
approved schema, ownership, publication, privacy, and failure semantics.

## Providers and Adapters

The first slice requires no Provider or Adapter. Its admitted workflow is a
deterministic process-local fixture with no external wait.

Future Skills may consume separately approved Core Contracts implemented by
Providers or Adapters. Those components do not select, bind, authorize, or own
Skill results.

## Persistence

The first slice requires no catalog persistence, invocation history, result
store, audit database, replay store, filesystem, cache, queue, or restoration.
Authority values are process-local and non-durable.

# Runtime Bounds

| Value                                     | Bound or vocabulary                     | Authority                         |
| ----------------------------------------- | --------------------------------------- | --------------------------------- |
| Skill Identifier                          | 1–64 ASCII, accepted M7 grammar         | Inherited                         |
| Skill Version                             | 5–128 ASCII Semantic Version            | Inherited                         |
| Skill Capability Identifier               | 1–128 ASCII, accepted M7 grammar        | Inherited                         |
| Skill Interface Field Identifier          | 1–64 ASCII, accepted M7 grammar         | Inherited                         |
| Skill Failure Mode Identifier             | 1–64 ASCII, accepted M7 grammar         | Inherited                         |
| Skill Permission Identifier               | 3–128 ASCII, accepted M7 grammar        | Inherited                         |
| Authorization Operation Identifier        | 1–128 ASCII, CONCEPT-0004 grammar       | Inherited                         |
| Authorization action                      | fixed `skill.invoke`                    | Closed literal                    |
| Authorization resource                    | `skill:` + Skill Identifier, 7–70 ASCII | Derived                           |
| Permission/input/output/failure snapshots | 0–64 each                               | Inherited from M7                 |
| Admitted workflow capabilities            | 1–64, manifest-capability subset        | Inherited capability bound        |
| Invocation input/output entries           | 0–64, exact declaration set             | Inherited from M7                 |
| Invocation text scalar                    | 0–4096 Unicode code points, no `Cc`     | Defined by this model             |
| Invocation integer scalar                 | `-(2^53 - 1)` through `2^53 - 1`        | Defined interoperable exact range |
| Selection result                          | `selected`, `unavailable`               | Closed                            |
| Skill Validation Outcome                  | `accepted`, `rejected`                  | Closed                            |
| Normalized result                         | `succeeded`, `failed`                   | Closed                            |
| Invocation lifecycle                      | eight literals defined above            | Closed                            |
| Candidate/catalog/global invocation quota | none                                    | Not introduced                    |

The scalar bounds are the only new numeric bounds. They constrain
cross-boundary values, not catalog size, concurrency, storage, or global
throughput.

# Validation Precedence

The future Engine Specification must preserve these stage boundaries:

## Admit Skill Workflow

1. Skill Engine lifecycle and pre-existing catalog/admission state;
2. admission request envelope;
3. canonical Registered Skill catalog lookup and registration provenance;
4. validator/workflow candidate structural admission;
5. exact supported-capability and registered-Version correspondence;
6. duplicate admission;
7. constructed Admitted Skill Workflow relation and resulting admission state.

Admission is Running-only. A missing catalog entry is Invalid Skill Workflow
Admission, not an invocation lifecycle and not selection unavailability.

## Selection

1. Engine lifecycle and pre-existing catalog/admission/policy state;
2. selection request envelope;
3. capability identifier;
4. discovery candidate and admission validation;
5. deterministic fixed selection;
6. constructed result.

## Bind Skill to Operation

1. Engine lifecycle and pre-existing catalog/admission/provenance state;
2. target-creation request envelope;
3. operation identifier;
4. Skill Binding authority and correspondence;
5. declaration snapshot construction;
6. constructed Bound Skill Invocation Target.

## Resolve Context Projection

1. Context authority lifecycle and pre-existing revision/provenance state;
2. projection request envelope;
3. operation identifier;
4. complete prepared Active Context Revision authority and structure;
5. lineage, revision, and subject derivation;
6. constructed operation-scoped projection.

## Resolve Skill Invocation Requirements

1. requirements-authority lifecycle, configured sensitivity classifications,
   and pre-existing state;
2. requirements-resolution request envelope;
3. Bound Skill Invocation Target authority and operation correspondence;
4. action, resource, and complete permission derivation;
5. exact Security-owned sensitivity classification or governed unavailability;
6. constructed available projection or unavailable result.

## Resolve Governed Authorization Evaluation

1. boundary lifecycle, configured Security Contract, and pre-existing
   provenance state;
2. governed-evaluation request envelope;
3. exact nested Evaluate Authorization Outcome request;
4. configured Security Outcome collaborator invocation exactly once;
5. returned Authorization Evaluation Outcome, Artifact, and Summary structural
   validation;
6. configured read-only Outcome verification for the expected operation and
   issuing Security instance/runtime;
7. exact same-evaluation Artifact/Summary provenance;
8. exact operation, action, resource, and contained-value correspondence;
9. return of the exact Outcome without replacement.

A collaborator throw at step 4 maps to Invalid Skill Execution State. A
successfully returned malformed, hostile, fabricated, cloned, cross-runtime,
wrong-evaluation, or correspondence-invalid Outcome at steps 5–8 maps to Invalid
Governed Authorization Evaluation.

## Protected Invoke Skill

1. Skill Engine lifecycle and pre-existing catalog/admission/policy/provenance
   state;
2. protected invocation request envelope;
3. operation identifier;
4. Skill Binding, Bound Skill Invocation Target, and Admitted Skill Workflow
   provenance/correspondence;
5. Skill Execution Context Projection provenance/correspondence;
6. Skill Invocation Requirements Projection provenance/correspondence;
7. Authorization Evaluation Outcome authority for the issuing Security
   instance/runtime and expected operation;
8. exact same-evaluation Artifact/Summary provenance;
9. contained Artifact and Summary structure and semantic validity;
10. exact authorization correspondence, including operation, subject, and four
    independent Security statuses;
11. invocation input structure and exact declarations;
12. admitted Skill Validator invocation and result;
13. admitted Skill Workflow invocation;
14. raw result validation;
15. normalized result construction and validation.

Earlier terminal results and failures prevent later boundaries from being
inspected or invoked.

Protected Invoke failure mapping is exact: malformed request extraction at
step 2 produces Invalid Protected Invocation Input; failure of Outcome authority
at step 7, same-evaluation provenance at step 8, or contained Artifact/Summary
validity at step 9 produces Invalid Governed Authorization Evaluation; and
failure of exact enforcement correspondence at step 10 produces Skill
Authorization Enforcement Failure.

# Normative Testability Requirements

A future ENGINE-0010 must be able to require objective tests for:

- exact selection request shape;
- zero matches returning unavailable;
- one match selecting exactly;
- multiple eligible matches selecting lowest Skill Identifier;
- Skill Binding returned before operation allocation;
- Bound Skill Invocation Target created only after operation allocation;
- version never affecting selection;
- registration order never affecting selection;
- non-eligible discovery candidates excluded;
- workflow admission rejected before registration and outside Running;
- workflow admission accepted only after authoritative M7 registration while
  Running;
- caller-created Registered Skill shape unable to establish admission;
- exact registered Version resolved and copied from the canonical catalog entry;
- exact workflow admission Skill Identifier, Version, and capability support;
- fabricated and duplicate workflow admission rejection;
- a Registered Skill whose workflow does not support the requested capability
  excluded from selection;
- malformed candidate and admission corruption producing state failure;
- complete canonical Skill Binding;
- fabricated Skill Binding rejection;
- exact target snapshot and derived authorization target;
- fabricated, cross-runtime, stale, and cross-operation target rejection;
- operation mismatch across every operation-bound value;
- exact governed requirements projection required;
- caller sensitivity selection and downgrade rejection;
- requirements/artifact sensitivity mismatch rejection;
- missing `authorizationEvaluation` property and explicit `undefined` producing
  Invalid Protected Invocation Input with no lifecycle or callbacks;
- genuine same-evaluation Artifact/Summary Outcome admission;
- naked Artifact, naked Summary, and caller-created matching pair rejection;
- fabricated, cloned, spread, serialized/reconstructed, and cross-runtime
  authorization Outcome rejection;
- cross-evaluation Artifact/Summary mixing rejection even when every visible
  operation, subject, and status is equal;
- malformed and hostile Authorization Evaluation Outcome rejection;
- valid-provenance Outcome with malformed or hostile contained Artifact or
  Summary producing Invalid Governed Authorization Evaluation;
- configured Security Outcome return preserved exactly and admitted for complete
  correspondence validation;
- exactly one Security evaluation and no legacy Artifact evaluation for the same
  operation;
- no invocation-time Security, Context, Device, Session, or Trust currentness
  query;
- configured Security collaborator throw mapping to Invalid Skill Execution
  State without later boundary calls;
- malformed configured Security return mapping to Invalid Governed
  Authorization Evaluation;
- governed `deny` and `indeterminate` preventing every Skill callback;
- governed `allow` operation, subject, action, resource, permission,
  sensitivity, policy, confirmation, or correspondence mismatch preventing
  every Skill callback;
- independent Context-status, Device-status, Session-status, and Trust
  Level-status mismatch rejection, holding the other three statuses constant;
- expected Security statuses obtained only from the Summary and never from the
  Artifact;
- exact failure category, lifecycle terminal state, validator count, and
  workflow count for every governed-authorization case above;
- exact generic input key-set matching;
- scalar lower/upper/overflow and hostile-value behavior;
- Context authority, Active revision, subject, and operation mismatch;
- issued Context projection remaining valid for its operation after a successor
  activation or source expiry;
- cross-operation Context projection reuse rejection;
- `deny`, `indeterminate`, missing, malformed, and mismatched authorization
  rejection;
- exact `allow` correspondence;
- proof that no Skill callback occurs before enforcement;
- Skill Validation Outcome `accepted` and controlled `rejected`;
- validator malformed, hostile, Promise/thenable, and native/domain throw
  handling;
- proof that rejected or invalid validation never calls the workflow;
- workflow called exactly once;
- Promise/thenable workflow return rejection;
- workflow success with zero and multiple outputs;
- declared business failure normalization;
- undeclared business failure rejection;
- native workflow throw containment;
- hostile, malformed, wrong-key, and oversized raw outputs;
- complete normalized-result equality;
- fabricated same-shaped normalized result rejection;
- governed Protected Invoke Skill return authority;
- every valid and invalid lifecycle transition;
- every failure-stage-to-lifecycle mapping row;
- every validator and workflow throw, malformed, hostile, Promise, thenable,
  undeclared-failure, and output-mismatch row producing its exact category;
- Engine-not-Running precedence over hostile request;
- no timeout, cancellation, retry, Event, persistence, or external wait;
- deep immutability of every successful value;
- Outcome, Artifact, Summary, request, and authority-source non-mutation and
  non-freezing on every path;
- authority provenance not established by same-shaped values, matching visible
  fields, or caller construction;
- privacy-safe diagnostics;
- deterministic equivalent-input behavior; and
- architecture fixtures rejecting every forbidden implementation dependency.

# Acceptance Criteria for a Future Engine Specification

ENGINE-0010 is implementation-ready only if it specializes this Concept without
choosing new semantics for:

- selection input or policy;
- zero/one/multiple selection behavior;
- workflow admission and derived invocation eligibility;
- Skill Binding and Bound Skill Invocation Target provenance;
- authorization target derivation;
- governed requirements and sensitivity correspondence;
- Security-issued Authorization Evaluation Outcome authority and exact
  same-evaluation Artifact/Summary provenance;
- generic input values and manifest-name correspondence;
- Context execution projection;
- enforcement correspondence and timing;
- Skill-specific validation ordering;
- execution start;
- raw and normalized result models;
- business versus Engine failure;
- lifecycle and precedence;
- no-timeout, no-cancellation, and no-retry behavior;
- failure containment;
- synchronicity;
- runtime bounds;
- privacy; or
- dependency direction.

# Open Questions

No implementation-critical semantic question remains for the deterministic
process-local first slice under Active `1.1.0`.

Genuinely future questions remain:

- configurable or Context-sensitive selection;
- multiple installed versions and version compatibility;
- typed or optional input/output schemas;
- large, binary, document, or streamed values;
- richer Context execution projections;
- timeout and cancellation;
- retry, compensation, and idempotency;
- progress and asynchronous execution;
- process or container sandboxing;
- Skill packaging, loading, installation, and hot reload;
- Providers, Adapters, and external workflows;
- Events and audit persistence;
- durable invocation identity and history;
- distributed execution and cross-runtime authority protection; and
- executable Planning and full Brain orchestration.

Each requires separately reviewed authority and must not be inferred by
ENGINE-0010.

# Explicitly Deferred

This Concept explicitly defers:

- all future questions listed above;
- final cognitive-result assembly and delivery;
- user interaction and confirmation acquisition;
- Memory or Knowledge access during Skill execution;
- mutable Context access;
- external IAM;
- configurable Security policy;
- a generic Execution Engine;
- production Infrastructure; and
- modification of accepted M0–M8 semantics.

# Revision Impact

This Active revision closes M9-IR-002 at the Concept layer by replacing Artifact-only
protected-enforcement authority with one genuine Security-issued Authorization
Evaluation Outcome. It does not authorize implementation.

After formal approval, ENGINE-0010 requires a separate specification revision
specializing the exact request, verifier collaboration, precedence, failure
mapping, hostile-runtime handling, and tests defined here. Until that revision
is reviewed and approved, M9 implementation remains paused.

# Change History

| Version | Status | Date       | Change                                                                                                                                                                                                     |
| ------- | ------ | ---------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `1.1.0` | Active | 2026-07-28 | Formally approved protected Skill authorization enforcement using the Security-issued Authorization Evaluation Outcome, same-evaluation Artifact/Summary provenance, and exact four-status correspondence. |
| `1.0.0` | Active | 2026-07-27 | Approved the initial Skill selection, binding, protected invocation, execution, lifecycle, failure, and normalized-result semantic model.                                                                  |

# Related Documents

- [Documentation Authority](../../docs/DOCUMENT-AUTHORITY.md)
- [Architecture](../../docs/architecture.md)
- [ADR-0001 — Core Ownership and Dependency Direction](../../docs/adr/ADR-0001-Core-Ownership-and-Dependency-Direction.md)
- [ADR-0002 — Capability-Oriented Architecture](../../docs/adr/ADR-0002-Capability-Oriented-Architecture.md)
- [ADR-0003 — Engine Communication Model](../../docs/adr/ADR-0003-Engine-Communication-Model.md)
- [ADR-0004 — Separation of Skills, Providers and Adapters](../../docs/adr/ADR-0004-Separation-of-Skills-Providers-and-Adapters.md)
- [ADR-0006 — Skill Selection, Binding, and Protected Invocation Ownership](../../docs/adr/ADR-0006-Skill-Selection-Binding-and-Protected-Invocation-Ownership.md)
- [OES-0002 — Engine Design](../../docs/engineering/OES-0002-Engine-Design.md)
- [OES-0003 — Skill Design](../../docs/engineering/OES-0003-Skill-Design.md)
- [OES-0004 — Contracts](../../docs/engineering/OES-0004-Contracts.md)
- [OES-0005 — Events](../../docs/engineering/OES-0005-Events.md)
- [OES-0009 — Security Standards](../../docs/engineering/OES-0009-Security-Standards.md)
- [CONCEPT-0003 — Context Model](CONCEPT-0003-Context-Model.md)
- [CONCEPT-0004 — Authorization Model](CONCEPT-0004-Authorization-Model.md)
- [ENGINE-0002 — Identity Engine](../engines/identity/ENGINE-0002-Identity-Engine.md)
- [ENGINE-0003 — Context Engine](../engines/context/ENGINE-0003-Context-Engine.md)
- [ENGINE-0007 — Planning Engine](../engines/planning/ENGINE-0007-Planning-Engine.md)
- [ENGINE-0008 — Skill Engine](../engines/skill/ENGINE-0008-Skill-Engine.md)
- [ENGINE-0009 — Security Engine](../engines/security/ENGINE-0009-Security-Engine.md)
- [FLOW-0001 — Voice Interaction](../flows/conversation/FLOW-0001-Voice-Interaction.md)

# Engineering Motto

> Brain coordinates. Skill selects, binds, validates, and executes. Security decides. The protected Skill boundary enforces.
