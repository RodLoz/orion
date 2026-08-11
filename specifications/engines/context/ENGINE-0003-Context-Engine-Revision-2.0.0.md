# ENGINE-0003 — Context Engine Revision

| Field             | Value                                                                            |
| ----------------- | -------------------------------------------------------------------------------- |
| **Status**        | Superseded                                                                       |
| **Supersedes**    | 1.1.0                                                                            |
| **Superseded By** | [ENGINE-0003 3.0.0](ENGINE-0003-Context-Engine-Revision-3.0.0.md)                |
| **Version**       | 2.0.0                                                                            |
| **Owner**         | Context Engine                                                                   |
| **Created**       | 2026-07-29                                                                       |
| **Updated**       | 2026-08-11                                                                       |
| **Applies To**    | Context preparation, revision composition, lifecycle, and authority verification |

---

## Status and Authority

This revision is Superseded by
[ENGINE-0003 3.0.0](ENGINE-0003-Context-Engine-Revision-3.0.0.md) and is
retained only as historical version 2.0.0. It is non-authoritative. Its
Identity-only semantics remain historical and are not rewritten by its
successor.

Context is the semantic owner of Context preparation, retrieval initiation,
retrieval-request purpose, incorporation, Context validation, activation,
revision lifecycle, and Active Context Revision authority. Core is the
custodian of shared executable Contract language. Applicable Active ADRs,
Concept Specifications, Engineering Standards, and CONTRACT-0001 govern in a
conflict.

## Purpose

The Context Engine prepares and issues one immutable Active Context Revision
representing the information relevant to an applicable reasoning situation.

For the current Identity-only milestone, Context initiates retrieval through
the qualified Resolve Current Identity Contract, receives Current Identity as
candidate material, and separately incorporates that material through the
existing Compose Context Revision operation.

## Capability Ownership

Context owns:

- Context preparation and the decision that Identity retrieval is required;
- validation of the outer Context preparation request and target;
- invocation of the qualified source Contract;
- receipt of source-owned candidate material;
- Context incorporation and Identity Context projection construction;
- Context Lineage and Revision identity, numbering, and parentage;
- Context validation, activation, expiration, and revision reuse;
- immutable Active Context Revision issuance; and
- registration and verification of Active Context Revision authority.

Identity retains:

- interpretation of Identity Resolution Request;
- Identity-specific request and reference validation;
- invocation of Identity Source;
- Identity source-result validation;
- Current Identity semantics;
- Identity lifecycle behavior;
- Identity and source failure semantics; and
- Identity as the authoritative owner of the projected Identity facts.

Context MUST NOT reinterpret Identity request semantics, authenticate an
actor, call Identity Source, assign an Identity Identifier, infer
authorization, or acquire Identity lifecycle or source behavior.

Bootstrap owns selection and composition of concrete participants. Bootstrap
MUST NOT initiate retrieval for Context, interpret Identity requests or
results, incorporate candidate material, validate or activate Context, or
acquire failure ownership.

## Scope

Version 2.0.0 defines:

- Context-owned preparation through Prepare Context Revision;
- Identity participation through injected Resolve Current Identity;
- Current Identity as candidate material for the current milestone;
- incorporation through Compose Context Revision;
- one Identity Context Fragment per revision;
- new-lineage and existing-lineage targets;
- deterministic Lineage and Revision identity construction;
- first-revision activation, revision reuse, and successor evolution;
- retrieval of the current Active Context Revision; and
- issuer-owned Active Context Revision authority verification.

It defines no generic source or candidate abstraction, source registry,
Memory or Knowledge specialization, cross-source aggregation, ranking,
selection, configurable retrieval policy, authorization mechanism,
currentness algorithm, persistence, reconstruction, replay, transport,
Provider, Adapter, or distributed execution mechanism.

## Core Context Model

### Context Lineage and Revision Identity

One Context Lineage has one stable Lineage Identity. Each distinct Context
Revision has one unique Revision Identity and a positive consecutive Revision
Number within its lineage.

Revision 1 has no parent. A successor preserves the Lineage Identity, receives
a new Revision Identity, increments the Revision Number by one, and identifies
the previously Active revision as its parent.

### Lifecycle

The canonical lifecycle remains:

```text
Collecting → Composing → Validating → Active → Expired
```

Archived remains optional and unimplemented. A revision may be consumed only
while Active. An Active or historical revision MUST NOT re-enter preparation
or be mutated by later retrieval, candidate availability, source change,
currentness change, or configuration change.

### Current Identity Candidate

Current Identity is the source-owned candidate material returned by Identity
for this Identity-only milestone. It remains either Anonymous or
Authenticated according to the Identity Contract.

Candidate availability is not incorporation. Retrieval success does not by
itself perform Contextual Currentness assessment, construct a Context Fragment,
validate Context, activate a revision, establish authorization, or transfer
Identity semantics to Context.

No generic candidate representation is introduced.

### Identity Context Fragment

Each current revision contains exactly one Identity Context Fragment. Context
constructs a defensive, privacy-minimal projection:

- Anonymous projection: state and `authoritativeOwner: "identity"`;
- Authenticated projection: state, one valid Identity Identifier, and
  `authoritativeOwner: "identity"`.

The fragment kind is `identity` and preserves Identity as the authoritative
owner. The projection contains no Identity Resolution Reference,
authorization, permission, credential, token, source payload, Provider, or
Adapter information.

The current creation metadata remains `sourceCount: 1` and
`fragmentCount: 1`.

## Prepare Context Revision 2.0.0

### Request

The executable request contains exactly:

```text
{
  target: ComposeContextTarget,
  identityResolutionRequest: IdentityResolutionRequest
}
```

Both fields are required and every unnamed field is prohibited. The target is
either:

```text
{ kind: "new-lineage" }
```

or:

```text
{
  kind: "existing-lineage",
  lineageIdentity: ContextLineageIdentity,
  expectedActiveRevisionIdentity: ContextRevisionIdentity
}
```

Context validates the outer request and target. The nested Identity request is
opaque to Context and is passed to the injected Resolve Current Identity
Contract for Identity-owned interpretation and validation.

### Required Collaboration

Prepare Context Revision performs the following executable stages:

1. validate Context Engine lifecycle eligibility;
2. validate the outer Context preparation request and target;
3. invoke the injected Resolve Current Identity Contract;
4. receive Current Identity as candidate material;
5. delegate candidate incorporation to Compose Context Revision;
6. perform existing Context validation; and
7. return the resulting authoritative Active Context Revision.

The resolver invocation establishes candidate availability only. It MUST NOT
create, incorporate, validate, activate, register, replace, or expire a
Context Revision.

## Resolve Current Identity Participation

Context Engine requires one Resolve Current Identity Contract implementation
at construction. The dependency is Core-custodied Contract language, not an
Identity Engine implementation reference.

The injected implementation must be available before Context Engine becomes
Ready. Context invokes it only while Context Engine is Running.

Identity owns the operation's request interpretation, source invocation,
result construction, result validation, and failure behavior. Context owns the
reason the operation is invoked during preparation and the later consequence
for the candidate Context Revision.

The resolver implementation and its private state MUST NOT enter a Context
Revision or public Context result.

## Compose Context Revision 1.0.0

Compose Context Revision remains the incorporation-only operation. Its request
contains exactly:

```text
{
  target: ComposeContextTarget,
  currentIdentity: CurrentIdentity
}
```

It does not retrieve Identity and does not accept an Identity Resolution
Request.

Compose Context Revision owns:

- defensive validation of candidate material at the Context incorporation
  boundary;
- construction of the Identity Context projection and fragment;
- incorporation into the candidate Context Revision;
- Lineage and Revision identity, numbering, and parentage;
- Context lifecycle progression;
- complete Context candidate validation;
- activation and Active revision replacement; and
- reuse of the existing Active revision when the relevant Identity projection
  is unchanged.

A malformed candidate from a nonconforming collaborator produces Invalid
Identity Context Projection. This defensive Context boundary does not replace
Identity-owned request, source-result, or Current Identity validation.

## Get Active Context Revision 1.0.0

The request contains exactly one Lineage Identity. Success returns the exact
current Active Context Revision for that lineage.

An unknown lineage produces Context Lineage Not Found. A lineage without a
current Active revision produces No Active Context Revision. An Expired or
historical revision MUST NOT be returned as fallback.

## Verify Active Context Revision Authority 1.0.0

The exact request contains:

```text
{
  intent: "verify-active-context-revision-authority",
  candidate: ActiveContextRevision,
  expectedLineageIdentity: ContextLineageIdentity,
  expectedRevisionIdentity: ContextRevisionIdentity,
  expectedRevisionNumber: ContextRevisionNumber
}
```

Context Engine is the issuer, private provenance owner, and authority verifier.
Success returns the exact candidate registered by that issuing runtime and
proves its expected lineage and revision correspondence.

Bootstrap may capture and compose the public verifier port only. Brain,
Bootstrap, callers, Providers, Adapters, and other Engines MUST NOT register,
mint, reconstruct, or simulate Context authority.

Authority registration and verification do not transfer Context semantic
ownership and do not perform source-authority verification.

## Construction Values

Context Engine receives a narrow Context Construction Values Contract for
candidate Lineage Identity, Revision Identity, and creation timestamp values.
Context validates those values and owns their Context meaning.

The construction mechanism does not own Context semantics, lifecycle,
authority, persistence, currentness, or source behavior.

## Failure Semantics

### Identity-Owned Failures

The following Identity failures propagate through Prepare Context Revision
unchanged:

- `InvalidIdentityInputError`;
- `InvalidIdentityResolutionReferenceError`;
- `IdentitySourceUnavailableError`;
- `UnresolvedIdentityError`; and
- `InvalidIdentityStateError`.

Context MUST NOT catch, wrap, translate, recreate, or normalize these failures
as `ContextValidationFailureError` or another Context-owned failure. Their
consequence may prevent candidate incorporation and activation without
transferring failure ownership to Context.

### Context-Owned Failures

Context retains failures arising from Context-owned responsibilities:

- invalid outer Context preparation or composition input;
- invalid target, lineage, or lifecycle transition;
- missing or invalid candidate projection at incorporation;
- invalid Context construction values or candidate revision state;
- absence of an Active revision;
- invalid authority-verification request or provenance; and
- invalid Context authority state.

A Context-owned failure MUST NOT reinterpret an Identity, Security, Bootstrap,
transport, Provider, Adapter, or infrastructure failure.

## Deterministic Precedence

Prepare Context Revision validates Context lifecycle and the outer Context
request before invoking Identity. Identity then validates and executes its own
request. Only a successful Current Identity candidate reaches Compose Context
Revision.

Compose Context Revision retains its existing target, candidate projection,
construction, revision, lifecycle, validation, activation, replacement, and
authority-registration precedence. A failed stage suppresses later stages and
does not mutate an existing Active or historical revision.

No retry, timeout, fallback, recovery, rollback, compensation, cancellation,
dead-letter, or failure aggregation behavior is defined.

## Immutability and Revision Reuse

Active Context Revision objects, creation metadata, fragment collections,
fragments, and Identity projections are immutable.

When an existing-lineage preparation produces the same relevant Identity
projection, Context returns the existing Active revision. A meaningful
projection change creates and activates a successor, then expires the prior
revision through controlled private lifecycle state without mutating its
public immutable content.

Retrieval failure, candidate rejection, or failed successor construction MUST
NOT expire or mutate the current Active revision.

## Dependency Direction

Context production code may depend on Core-custodied Contracts and Context
implementation-private modules.

Context MUST NOT depend directly on:

- Identity Engine implementation;
- Identity Source;
- Bootstrap;
- Infrastructure;
- Memory Engine;
- Knowledge Engine;
- Brain, Reasoning, or Planning Engine implementations;
- Providers or Adapters; or
- external framework packages.

Identity and Context remain independent Engine implementations. Bootstrap
selects the concrete Identity implementation and injects its Resolve Current
Identity Contract into Context without becoming the retrieval initiator.

## Brain, Reasoning, and Planning Boundaries

Brain consumes only the authoritative Active Context Revision through the
Context-owned Get and Verify Contracts. Brain does not receive the Identity
Resolution Request, Current Identity candidate, Memory, Knowledge, or other
raw source evidence.

Reasoning consumes one authoritative Active Context Revision and its approved
Reasoning inputs. It does not retrieve Identity, Memory, or Knowledge and does
not reconstruct Context preparation.

Planning consumes Reasoning-owned output and does not inspect Context or source
evidence. These consumption relationships do not transfer Context, Identity,
Reasoning, or Planning semantic ownership.

## Security, Currentness, and Authority Boundaries

Identity resolution and authenticated state do not constitute authorization.
Security retains authorization semantics and decisions, and applicable
protected boundaries retain enforcement responsibility.

Identity or its applicable source lifecycle retains Source Currentness.
Context retains Contextual Currentness. Neither currentness form is established
merely by retrieval, candidate availability, incorporation, or timestamps.
This version defines no currentness algorithm.

Identity remains the authority origin for projected Identity facts. Context
preserves that attribution but does not replace Identity authority or perform
Identity authority verification. Context remains the issuer and authority
verifier only for its own Active Context Revisions.

## Persistence, Reconstruction, and Replay

Context remains process-local and non-persistent in the current implementation.
This specification introduces no persistence mechanism.

Persistence, Logical Reconstruction, Exact Replay, and historical reproduction
remain distinct from retrieval, candidate availability, incorporation,
validation, activation, authority verification, and Brain cognitive execution.
None may recreate authority, authorization, currentness, failure production,
or Context preparation merely from retained information.

## Execution-Model Neutrality

The current executable implementation uses synchronous process-local Contract
calls. That representation is not architectural ownership. The semantic
allocations in this specification remain unchanged across synchronous,
asynchronous, event-driven, local, distributed, Provider-mediated,
Adapter-mediated, or transport-mediated execution.

This version introduces no Promise, Event, transport, serialization,
deployment, correlation, ordering, delivery, or late-arrival mechanism.

## Mandatory Tests

Tests MUST cover:

- required Resolve Current Identity dependency and Engine lifecycle;
- Context invocation of the qualified resolver;
- Anonymous and Authenticated preparation;
- target association and revision reuse;
- retrieval before incorporation and activation;
- exact propagation of Identity-owned failures;
- no Active revision creation following retrieval failure;
- malformed candidate rejection at the incorporation boundary;
- exclusion of resolver state from Active revisions;
- first and successor revision identity, ordering, parentage, and replacement;
- immutable Active and historical revision content;
- Active revision retrieval and issuer-owned authority verification;
- Bootstrap wiring without caller-first Identity resolution; and
- Brain and Reasoning consumption without raw source evidence.

These implementation tests do not replace implementation-neutral conformance
testing for CONTRACT-0001.

## Acceptance Criteria

ENGINE-0003 2.0.0 is satisfied when:

1. Context owns and executably initiates Identity retrieval during preparation;
2. Identity retains request interpretation, source execution, result semantics,
   lifecycle behavior, and failures;
3. Current Identity candidate availability remains distinct from incorporation;
4. Compose Context Revision remains incorporation-only;
5. existing lineage, lifecycle, validation, immutability, reuse, and authority
   behavior remains intact;
6. Bootstrap performs composition and wiring without retrieval initiation;
7. Brain and Reasoning receive no raw source evidence; and
8. dependency, Security, currentness, persistence, and execution-model
   boundaries remain intact.

## Compatibility and Migration

Version 2.0.0 intentionally replaces the historical caller-first preparation
allocation. Context construction now requires Resolve Current Identity, and
callers of Context preparation provide Identity resolution input rather than a
completed Current Identity.

Compose Context Revision 1.0.0 remains available and unchanged for explicit
incorporation of completed candidate material. It MUST NOT be used by
Bootstrap to preserve the obsolete caller-first Context preparation path.

No compatibility shim may make Bootstrap, Brain, or another caller the
semantic retrieval initiator. No data migration is required because the
change introduces no persistence.

## Change History

| Version | Date       | Description                                                                                                   |
| ------- | ---------- | ------------------------------------------------------------------------------------------------------------- |
| 1.0.0   | 2026-07-19 | Established the original Identity-only Context Engine vertical slice.                                         |
| 1.1.0   | 2026-07-29 | Added issuer-owned Active Context Revision authority verification.                                            |
| 2.0.0   | 2026-08-11 | Aligned Context-owned preparation and Identity retrieval collaboration with CONTRACT-0001 and governing ADRs. |

## References

- [CONTRACT-0001 — Context Source Retrieval](../../../docs/contracts/CONTRACT-0001-Context-Source-Retrieval.md)
- [ADR-0008 — Context Collaboration and Source Ownership](../../../docs/adr/ADR-0008-Context-Collaboration-Source-Ownership-and-Reference-Authority.md)
- [ADR-0009 — Context Revision Preparation and Lifecycle](../../../docs/adr/ADR-0009-Context-Revision-Preparation-Reference-Stability-and-Source-Change.md)
- [ADR-0010 — Context Retrieval Initiation](../../../docs/adr/ADR-0010-Context-Retrieval-Initiation-Request-and-Result-Semantics.md)
- [ADR-0011 — Contextual Currentness](../../../docs/adr/ADR-0011-Source-Currentness-Contextual-Currentness-and-Currentness-Change.md)
- [ADR-0012 — Authorization and Context Preparation](../../../docs/adr/ADR-0012-Authorization-Semantics-Enforcement-and-Authorized-Reference-Applicability.md)
- [ADR-0013 — Failure Ownership](../../../docs/adr/ADR-0013-Failure-Ownership-Propagation-and-Candidate-Context-Revision-Consequences.md)
- [ADR-0014 — Bootstrap Composition](../../../docs/adr/ADR-0014-Bootstrap-Composition-Responsibility-and-Ownership-and-Authority-Preservation.md)
- [ADR-0016 — Context Persistence and Reconstruction](../../../docs/adr/ADR-0016-Persistence-Logical-Reconstruction-Exact-Replay-and-Historical-Reproduction-Boundaries.md)
- [ADR-0017 — Execution-Model Independence](../../../docs/adr/ADR-0017-Execution-Model-Independence-for-Asynchronous-Event-Driven-and-Distributed-Collaboration.md)
- [CONCEPT-0003 — Context Model](../../concepts/CONCEPT-0003-Context-Model.md)
- [Identity Engine 1.0.0](../identity/ENGINE-0002-Identity-Engine.md)
- [Brain Engine 2.0.0](../ENGINE-0001-Brain-Engine.md)
- [Documentation Authority](../../../docs/DOCUMENT-AUTHORITY.md)
- [OES-0004 — Contracts](../../../docs/engineering/OES-0004-Contracts.md)
- [OES-0008 — Documentation Standards](../../../docs/engineering/OES-0008-Documentation-Standards.md)
- [OES-0010 — Versioning Standards](../../../docs/engineering/OES-0010-Versioning-Standards.md)
- [ENGINE-0003 1.1.0](ENGINE-0003-Context-Engine-Authority-Revision-1.1.0.md)
