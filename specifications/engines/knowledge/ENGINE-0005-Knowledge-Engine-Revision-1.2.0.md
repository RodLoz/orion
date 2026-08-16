# ENGINE-0005 — Knowledge Engine Revision

| Field          | Value                                                                                           |
| -------------- | ----------------------------------------------------------------------------------------------- |
| **Status**     | Active                                                                                          |
| **Supersedes** | 1.1.0                                                                                           |
| **Version**    | 1.2.0                                                                                           |
| **Owner**      | Project Maintainers                                                                             |
| **Created**    | 2026-08-16                                                                                      |
| **Updated**    | 2026-08-16                                                                                      |
| **Applies To** | Knowledge-owned bounded proposition projection issuance and verification for Context candidates |

---

## Status and Authority

This specification is Active and is the sole current canonical ENGINE-0005
revision. It supersedes versions 1.0.0 and 1.1.0. Those revisions remain
historical and non-authoritative.

Version 1.2.0 preserves the complete Knowledge Engine 1.1.0 semantics and adds
the bounded proposition projection capability authorized by ADR-0020.
Applicable Active ADRs, Concepts, Engineering Standards, and CONTRACT-0001
govern in a conflict.

## Purpose

This revision specifies the Knowledge-owned semantic material that may become
a Context candidate for the first Source-Aware Reasoning slice. Knowledge may
issue and verify one bounded proposition projection derived from accepted
Knowledge without exposing a Knowledge Record or transferring Knowledge
authority to Context.

The projection is a Knowledge-specific representation. It is not a generic
evidence abstraction and does not define Context incorporation or Reasoning
behavior.

## Compatibility and Existing Behavior Preservation

The following Knowledge Engine 1.1.0 executable surfaces and their exact
semantics remain unchanged:

- Get Knowledge;
- Get Knowledge Request;
- Retrieved Knowledge;
- Knowledge Record;
- Knowledge Reference;
- the accepted-Knowledge lifecycle and candidate-acceptance behavior;
- source operations and Source Currentness behavior; and
- existing Knowledge and Store failures.

Knowledge identity, versioning, acceptance, rejection, Provenance,
contradiction, supersession, historical retrieval, Store interaction,
immutability, privacy, and diagnostics remain unchanged from 1.1.0. Existing
callers require no migration.

The bounded proposition projection is an additive capability. It does not
change Get Knowledge, overload Retrieved Knowledge, reclassify Knowledge
Reference, or replace any existing representation. Concrete executable
language and operation names are deferred.

## Knowledge Ownership

Knowledge remains the single semantic owner of:

- accepted proposition semantics;
- Knowledge acceptance, lifecycle, identity, and version;
- Knowledge-issued bounded proposition projection semantics;
- projection issuance and issuer verification;
- Knowledge-domain contradiction and supersession behavior;
- Source Currentness participation; and
- Knowledge-originating failure semantics.

Core may eventually custody shared executable language without acquiring
Knowledge behavior or semantic authority. A Store remains mechanical and does
not issue accepted proposition semantics.

Knowledge does not own Contextual applicability, incorporation, Contextual
Currentness, Context lifecycle or authority, exact-query applicability,
Reasoning evidence sufficiency, or a Reasoning outcome.

## Bounded Knowledge Proposition Projection

A bounded Knowledge proposition projection is a source-issued, minimal,
immutable semantic representation of one accepted proposition. It is suitable
for candidate participation in Context preparation and later bounded
Reasoning only after Context incorporates it into an authoritative revision.

The projection is distinct from:

- a **Knowledge Record**, which contains Knowledge-owned domain and storage
  internals and does not cross this boundary;
- a **Candidate Claim**, which is pre-acceptance input and cannot represent
  accepted Knowledge evidence;
- a **Knowledge Reference**, which identifies Knowledge but does not carry
  sufficient substantive proposition semantics; and
- any generic cross-source or Reasoning-evidence abstraction.

Knowledge Reference remains valid for its existing uses, but identifier-only
reference semantics are insufficient for substantive Knowledge-grounded
Reasoning.

### Required Semantic Correspondence

Every bounded proposition projection semantically includes:

- proposition identity;
- the bounded proposition semantic value;
- Knowledge identity;
- the exact Knowledge version;
- correspondence to accepted state;
- Source Currentness correspondence for the preparation boundary;
- Knowledge attribution; and
- issuer-authority verification correspondence.

These are architectural semantic requirements, not executable field names or
a serialization schema. Their representation may be opaque where the
consumer needs only governed correspondence rather than source internals.

An opaque provenance pointer is optional. If present, it is privacy-bounded,
does not expose provenance, cannot act as an independent retrieval handle for
Reasoning, and proves neither authority nor authorization by possession.

### Explicit Exclusions

The projection does not expose:

- Knowledge Record internals;
- raw provenance;
- acceptance rationale or acceptance evidence;
- confidence in the first slice;
- source-internal metadata;
- personal data;
- Context retrieval purpose;
- independent retrieval handles; or
- private Knowledge processing information.

## Issuance Semantics

Knowledge alone issues a bounded proposition projection. Issuance is permitted
only from accepted Knowledge and corresponds to one exact Knowledge identity
and version. For an issued projection, correspondence between proposition
identity and bounded semantic value is deterministic and immutable.

Issuance preserves Knowledge as the semantic issuer. Delivery to Context as
candidate material does not transfer ownership of Knowledge truth, acceptance
correctness, lifecycle, provenance, or original source authority.

Issuance itself does not establish Source Currentness, Context incorporation,
Context authority, exact-query applicability, evidence sufficiency, or
authorization.

## Issuer Verification

Knowledge owns verification of its projection before Context incorporation.
Completed issuer verification establishes that:

- the applicable Knowledge runtime issued the projection;
- the projection corresponds to the identified accepted Knowledge identity
  and exact version;
- the proposition identity and semantic value correspond to that issuance;
  and
- applicable qualified-source authority correspondence required beneath the
  accepted Knowledge is preserved.

Verification preserves the distinction between Knowledge issuance authority
and any underlying qualified-source authority. It does not allow Knowledge to
manufacture an original source's authority, and it does not prove that the
projection is authorized for a caller.

Context may preserve the completed issuer-verification correspondence but may
not mint, reconstruct, substitute, or independently extend Knowledge
authority. The exact verifier API, executable proof representation, and
runtime sequencing mechanics are deferred.

## Source Currentness

The applicable Knowledge/source owner determines Source Currentness.
Source-current eligibility is established for the applicable Context
preparation boundary, and the projection may carry governed correspondence to
that determination.

Accepted state, Knowledge version, retrieval, possession, projection issuance,
or issuer verification alone does not prove Source Currentness. Knowledge does
not define Contextual Currentness.

Later Knowledge supersession does not mutate an already issued projection or
an immutable Active Context revision that incorporated it. A later cycle uses
a later Context preparation and revision where applicable. This revision
introduces no TTL, refresh interval, implicit latest lookup, automatic
recollection, or synchronization policy.

## Context Participation and CONTRACT-0001

CONTRACT-0001 remains sufficient. A bounded Knowledge proposition projection
is a Knowledge-specific form of source-owned returned semantics made available
as Context candidate material under the existing boundary:

```text
source-owned returned semantics
→ candidate availability
→ Context-owned incorporation
```

No new collaboration stage or generic source abstraction is introduced.
Issuer verification completes on the Knowledge/source side before
incorporation and its correspondence travels with the candidate semantics.

Context owns candidate preparation, contextual applicability, incorporation,
Contextual Currentness, projection placement, activation, lifecycle, and
Context revision authority. Knowledge neither incorporates its projection nor
determines the consequences of Context activation.

CONTRACT-0001 does not govern Contextual Currentness, incorporation,
activation, Context authority, exact-query applicability, Reasoning
sufficiency, or Reasoning outcomes. This revision neither changes
CONTRACT-0001 nor requires another Contract.

## Cardinality and Contradiction Boundaries

ADR-0020 limits the first Active Profile B reasoning slice to exactly one
qualifying, contextually applicable, issuer-verified bounded proposition.
Context owns that exact-one incorporation and activation consequence.

Knowledge may define operation-level issuance cardinality when a later
executable operation is specified, but that cardinality does not select a
Context revision or decide Contextual applicability. Knowledge must not select
a proposition according to an expected Reasoning query or answer.

Knowledge retains its existing Knowledge-domain contradiction and
supersession ownership. It may reject or supersede contradictory Knowledge
according to those existing semantics. Context does not resolve Knowledge
truth, and Reasoning does not resolve Knowledge-domain contradiction. General
multi-proposition synthesis, ranking, confidence-based selection, and hidden
best-candidate selection are outside this revision.

## Failure Ownership

### Knowledge-Owned Failures

Knowledge owns failures originating from responsibilities that Knowledge
owns, including:

- invalid projection-issuance input, when such input is later defined;
- inability to correspond a requested projection to accepted Knowledge;
- malformed Knowledge-issued projection semantics;
- Knowledge-owned issuer-verification failure;
- invalid Knowledge state;
- Source Currentness failure or ineligibility when Knowledge owns the
  applicable determination; and
- another failure genuinely originating within Knowledge authority.

### Originating-Source Failures

A failure originating from an underlying qualified or original source remains
owned by that source. A failure of authority verification owned by such a
source likewise remains owned by that source. A Source Currentness failure or
ineligibility remains owned by an underlying qualified or original source when
that source owns the applicable determination.

Knowledge may preserve and propagate an originating-source failure but MUST
NOT reinterpret, translate, wrap, reclassify, or replace it as a
Knowledge-owned failure. Propagation through Knowledge does not transfer
semantic ownership or authority.

Candidate absence, Context preparation consequences, and Context activation
refusal do not translate a Knowledge-owned or originating-source failure into
a Context-originating failure. Context may preserve a propagated failure or
act on its consequence without acquiring ownership of the originating
semantics.

Concrete failure types, result shapes, and diagnostic strings are deferred.

## Authorization Independence

Security independently owns authorization. None of the following proves or
recreates authorization:

- projection issuance or possession;
- Knowledge identity or proposition identity;
- accepted-state or Source Currentness correspondence;
- issuer verification;
- an opaque provenance pointer;
- candidate availability; or
- later Context incorporation or Context authority.

This revision adds no Security semantics and does not make Knowledge,
Context, or Reasoning an authorization owner.

## Privacy and Minimization

Only bounded proposition semantics and governed correspondence required for
Context incorporation and later bounded deterministic Reasoning may leave
Knowledge. Knowledge storage, acceptance, provenance, and source internals
remain hidden.

Consumers may preserve only the minimum correspondence authorized by
ADR-0020. Reasoning cannot use an optional provenance pointer to retrieve
Knowledge, recover hidden internals, or establish authority by possession.
Explainability is outside Knowledge ownership and must not require disclosure
of excluded material.

## Downstream and Dependency Boundaries

Knowledge does not know or depend on:

- a Reasoning query;
- exact-query applicability or evidence sufficiency;
- a Reasoning outcome;
- Planning or Brain;
- Skill selection;
- Context, Reasoning, Planning, or Brain implementations;
- Bootstrap composition; or
- production Context-profile selection.

Only Core-custodied Contracts may eventually carry executable language across
capability boundaries. Core custody does not transfer behavior or authority.
Context 5.0.0 and Reasoning 3.0.0 are future dependent revisions and are not
presented as Active authority.

## Execution-Model Neutrality

The issuance, verification, and candidate-participation semantics are neutral
to process and deployment topology. This specification defines no transport,
persistence, provider, registry, network, synchronization, serialization,
remote-invocation, or locality requirement.

## Deferred Scope

This revision explicitly defers:

- concrete TypeScript representation and field names;
- exact executable operation and result names;
- the exact verifier API and validation algorithm;
- transport and serialization;
- Context 5.0.0 behavior;
- Reasoning 3.0.0 queries, rules, outcomes, and explainability;
- Planning changes and Brain correspondence;
- Bootstrap wiring;
- production Profile B reachability and caller-owned profile selection;
- multi-proposition synthesis;
- ranking and confidence;
- refresh and TTL policy;
- a generic evidence framework;
- provider, persistence, and registry policy;
- diagnostics; and
- test matrices.

## Version Classification

Version 1.2.0 is a backward-compatible MINOR revision. It adds a distinct
Knowledge capability while preserving all exact public and executable 1.1.0
semantics. Activation would require a different version classification if
implementation or specification work demonstrated that an existing request,
result, record, reference, lifecycle, source/currentness behavior, or failure
must change incompatibly.

## Future Conformance Expectations

Before implementation closure, conformance evidence must show:

- deterministic issuance from accepted Knowledge only;
- complete required semantic correspondence and exclusion of prohibited
  internals;
- Knowledge-owned issuer verification before Context incorporation;
- preserved Source Currentness and authorization boundaries;
- preserved existing Knowledge 1.1.0 behavior;
- no transfer of Contextual applicability, Context authority, exact-query
  applicability, or Reasoning sufficiency to Knowledge; and
- no generic evidence abstraction or independent downstream retrieval path.

This section establishes semantic evidence expectations only. It defines no
test matrix or executable design.

## Change History

| Version | Date       | Description                                                                                                         |
| ------- | ---------- | ------------------------------------------------------------------------------------------------------------------- |
| 1.0.0   | 2026-07-20 | Established the Knowledge Engine vertical slice, retrieval, reference, lifecycle, and Store behavior.               |
| 1.1.0   | 2026-08-11 | Added unchanged Get Knowledge participation as a qualified source for CONTRACT-0001 Context preparation.            |
| 1.2.0   | 2026-08-16 | Drafted additive bounded proposition projection issuance and verification for Source-Aware Reasoning participation. |

## References

- [ADR-0020 — Knowledge Evidence Boundary for Source-Aware Reasoning](../../../docs/adr/ADR-0020-Knowledge-Evidence-Boundary-for-Source-Aware-Reasoning.md)
- [CONTRACT-0001 — Context Source Retrieval](../../../docs/contracts/CONTRACT-0001-Context-Source-Retrieval.md)
- [CONCEPT-0002 — Knowledge Model](../../concepts/CONCEPT-0002-Knowledge-Model.md)
- [CONCEPT-0003 — Context Model](../../concepts/CONCEPT-0003-Context-Model.md)
- [ADR-0008 — Context Collaboration and Source Ownership](../../../docs/adr/ADR-0008-Context-Collaboration-Source-Ownership-and-Reference-Authority.md)
- [ADR-0011 — Contextual Currentness](../../../docs/adr/ADR-0011-Source-Currentness-Contextual-Currentness-and-Currentness-Change.md)
- [ADR-0012 — Authorization and Context Preparation](../../../docs/adr/ADR-0012-Authorization-Semantics-Enforcement-and-Authorized-Reference-Applicability.md)
- [ADR-0013 — Failure Ownership](../../../docs/adr/ADR-0013-Failure-Ownership-Propagation-and-Candidate-Context-Revision-Consequences.md)
- [ADR-0017 — Execution-model Independence](../../../docs/adr/ADR-0017-Execution-Model-Independence-for-Asynchronous-Event-Driven-and-Distributed-Collaboration.md)
- [Knowledge Engine 1.1.0](ENGINE-0005-Knowledge-Engine-Revision-1.1.0.md)
- [Documentation Authority](../../../docs/DOCUMENT-AUTHORITY.md)
- [OES-0004 — Contracts](../../../docs/engineering/OES-0004-Contracts.md)
- [OES-0008 — Documentation Standards](../../../docs/engineering/OES-0008-Documentation-Standards.md)
- [OES-0010 — Versioning Standards](../../../docs/engineering/OES-0010-Versioning-Standards.md)

## Engineering Motto

> Knowledge issues bounded semantics; Context decides participation.
