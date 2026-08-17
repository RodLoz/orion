# ENGINE-0003 — Context Engine Revision

| Field          | Value                                                                                                |
| -------------- | ---------------------------------------------------------------------------------------------------- |
| **Status**     | Active                                                                                               |
| **Supersedes** | 4.0.0                                                                                                |
| **Version**    | 5.0.0                                                                                                |
| **Owner**      | Context Engine                                                                                       |
| **Created**    | 2026-08-16                                                                                           |
| **Updated**    | 2026-08-16                                                                                           |
| **Applies To** | Context preparation profiles, Knowledge proposition incorporation, revision lifecycle, and authority |

---

## Status and Authority

This specification is Active and is the sole current canonical ENGINE-0003
revision. It supersedes versions 1.0.0, 1.1.0, 2.0.0, 3.0.0, and 4.0.0. Those
revisions remain historical and non-authoritative.

Version 5.0.0 preserves the Context Engine 4.0.0 profile, lifecycle, authority,
Memory, and Identity semantics except for the approved major revision of
Profile B's Knowledge incorporation boundary. Applicable Active ADRs,
Concepts, Engineering Standards, CONTRACT-0001, and source Engine
specifications govern in a conflict.

## Purpose and Ownership

This revision specifies Context's side of the Knowledge Evidence Boundary
established by ADR-0020. Context may consider one Knowledge-owned bounded
proposition projection, require completed issuer-verification correspondence,
determine contextual applicability, and incorporate a minimal Context-owned
representation into an immutable Active Profile B Context Revision.

Context remains the semantic owner of:

- preparation and outer request/profile validation;
- retrieval initiation and candidate-set handling;
- contextual applicability;
- incorporation and Context fragment construction;
- Contextual Currentness;
- Context validation, lineage, revision, reuse, successor, and activation
  lifecycle; and
- Active Context Revision issuance and authority verification.

Context does not own Knowledge truth, acceptance, projection issuance,
Knowledge or original-source authority, issuer verification, Source
Currentness, exact-query applicability, evidence sufficiency, Reasoning
outcomes, Planning, Brain orchestration, or Security authorization.

## Compatibility with Context 4.0.0

All Context 4.0.0 semantics are incorporated unchanged except where this
revision expressly replaces the Profile B identifier-only Knowledge projection
with the bounded proposition incorporation boundary authorized by ADR-0020.

The following remain semantically preserved:

- Profile A Identity-only preparation and composition;
- Profile C Identity + Memory preparation, retrieval, projection,
  incorporation, currentness, failure, forgetting, reuse, and lifecycle
  behavior;
- fixed profile selection and canonical fragment ordering;
- candidate availability distinct from incorporation;
- source-owned request, result, lifecycle, authority, and failure semantics;
- Context lineage, revision numbering, activation, historical immutability,
  stable reuse, successor behavior, and authority;
- Get Active Context Revision and Verify Active Context Revision Authority
  semantics;
- dependency, persistence, reconstruction, replay, authorization, and
  execution-model boundaries; and
- source opacity in Planning and Brain.

This specification defines no compatibility adapter that preserves the former Profile
B projection as a parallel evidence path.

## Fixed Preparation Profiles

Exactly three legal Context profiles remain:

### Profile A — Identity-only

- exactly one Identity fragment;
- canonical profile form `[Identity]`;
- `sourceCount = 1`; and
- `fragmentCount = 1`.

Knowledge evidence is not required or permitted merely because a later
Reasoning revision may support Knowledge-grounded evaluation. Existing Profile
A behavior remains valid.

### Profile B — Identity + Knowledge

- exactly one Identity fragment followed by one Knowledge fragment;
- canonical profile form `[Identity, Knowledge]`;
- `sourceCount = 2`; and
- `fragmentCount = 2`.

The Knowledge fragment carries the incorporated bounded proposition semantics
and governed correspondence specified here. Knowledge is required for this
profile. There is no default proposition, optional continuation, or
Identity-only fallback.

### Profile C — Identity + Memory

- exactly one Identity fragment followed by one Memory fragment;
- canonical profile form `[Identity, Memory]`;
- `sourceCount = 2`; and
- `fragmentCount = 2`.

Profile C remains behaviorally compatible with Context 4.0.0. Memory does not
adopt the Knowledge proposition representation or evidence semantics.

No Profile D, Identity + Knowledge + Memory profile, arbitrary N-source
profile, generic source or candidate registry, generic evidence registry,
dynamic source selection, or autonomous Context profile selection is
authorized.

## Context-owned Retrieval and Candidate Availability

Context owns the preparation purpose and initiates retrieval required by the
selected fixed profile through Core-custodied Contracts. Source-directed
request semantics remain opaque to Context except for Context-owned outer
profile and preparation meaning.

For Profile B, Knowledge may return a Knowledge-owned bounded proposition
projection as source-owned candidate material under CONTRACT-0001. Candidate
availability means only that the material is available for Context
consideration. It does not establish contextual applicability, incorporation,
Contextual Currentness, Context validation, activation, Context authority,
exact-query applicability, evidence sufficiency, or authorization.

Retrieval or candidate availability creates no Lineage or Revision, closes no
incorporated set, mutates no Active revision, and activates no Context.

## Knowledge Candidate Representation Boundary

The Profile B candidate is the Knowledge-owned bounded proposition projection
specified by Knowledge Engine 1.2.0. It remains source-owned semantic material
while Context owns its candidate treatment.

The candidate semantically corresponds to:

- proposition identity;
- bounded proposition semantic value;
- Knowledge identity;
- exact Knowledge version;
- accepted state;
- Source Currentness determination for the preparation boundary;
- Knowledge attribution; and
- issuer-authority verification correspondence.

An opaque provenance pointer may be present only when permitted by the
Knowledge specification. It remains opaque, privacy-bounded,
non-authoritative by possession, and unavailable as a retrieval capability.

The bounded proposition projection is distinct from:

- KnowledgeRecord, whose private internals do not cross the boundary;
- CandidateClaim, which remains pre-acceptance material;
- KnowledgeReference, whose identifier-style semantics alone are insufficient
  as substantive evidence;
- Context candidate treatment; and
- the Context-owned fragment constructed after incorporation.

Context must not reconstruct substantive proposition semantics from an
identifier or use KnowledgeReference alone as the Knowledge evidence content
of a successful Profile B revision.

## Pre-incorporation Issuer Verification

Knowledge-owned verification of the Knowledge-issued bounded proposition
projection must be completed successfully before Context incorporation.
Knowledge verifies that the projection corresponds to its accepted Knowledge,
Knowledge identity and version, bounded proposition, attribution, and
Knowledge-owned issuance.

Where the projection preserves authority correspondence from an underlying
qualified or original source, the applicable verification owned by that
underlying issuer or source must also already be completed according to its
governing authority. Knowledge may preserve that governed correspondence but
does not become the verification owner for authority issued by the underlying
source.

Context may validate that both required completed correspondence domains are
present, structurally admissible, and suitable for the candidate and
incorporation prerequisites. Context may preserve both correspondence domains
in incorporated material where authorized. That Context validation is an
incorporation responsibility; it does not semantically reverify, renew, merge,
reinterpret, or replace either source authority domain.

Context must not:

- mint, reconstruct, recreate, renew, substitute, or extend Knowledge or
  original-source authority;
- independently reverify Knowledge projection authority or underlying-source
  authority;
- merge the two authority domains or reinterpret one as the other;
- infer authority from possession, attribution, identifiers, accepted state,
  version correspondence, retrieval, or candidate availability; or
- treat structural validation as issuer verification.

Completed issuer-verification correspondence does not establish Knowledge
truth, correctness of acceptance, original-source authority beyond its
preserved correspondence, Source Currentness, Contextual Currentness,
authorization, exact-query applicability, or evidence sufficiency.

## Contextual Applicability

Context owns contextual applicability: whether an otherwise valid, governed
Knowledge proposition candidate should participate in the particular Context
Revision under preparation.

Contextual applicability is bounded to preparation and revision suitability.
It is not:

- Knowledge truth evaluation or contradiction resolution;
- interpretation of a Reasoning query;
- exact-query applicability;
- answer or response selection;
- evidence sufficiency;
- ranking, scoring, confidence, or generic relevance search; or
- prediction of a future Reasoning rule or outcome.

Knowledge does not receive or determine the future Reasoning query through
retrieval or projection semantics. Reasoning does not retroactively control
candidate treatment, Contextual Currentness, incorporation, or activation.

The exact contextual-applicability rule and executable decision representation
are deferred, but any later rule must be deterministic, preparation-bound, and
incapable of precomputing a Reasoning answer.

## Exact-one First-slice Constraint

For the first bounded Knowledge-evidence slice, a successfully activated
Profile B revision contains exactly one qualifying, contextually applicable,
issuer-verified bounded Knowledge proposition.

- **Zero qualifying propositions:** the candidate preparation cannot produce a
  new successful Profile B activation.
- **Exactly one qualifying proposition:** Context may incorporate it when all
  other preparation, currentness, validation, lifecycle, and authority
  requirements succeed.
- **More than one qualifying proposition:** the candidate preparation cannot
  produce a new successful Profile B activation.

Context owns the consequence of failing its contextual-applicability,
incorporation, or exact-one cardinality requirement. It must not choose among
multiple candidates according to an anticipated query or answer. Multiple
compatible candidates and contradictory candidates are both unsupported in
this first slice.

Knowledge retains Knowledge-domain contradiction and supersession ownership.
Context does not resolve Knowledge truth, rank candidates, synthesize
propositions, apply confidence heuristics, or select a best candidate.

Failure of a candidate preparation does not mutate an existing Active or
stable historical Context Revision and does not create a fallback Profile A
revision.

## Context-owned Incorporation

Incorporation is an explicit Context-owned transition distinct from candidate
availability. Before incorporation, Context validates its preparation target,
fixed profile, candidate structure, completed verification correspondence,
Source Currentness correspondence, contextual applicability, exact-one
eligibility, and privacy/minimization boundary.

For a qualifying Profile B candidate, Context:

- constructs a Context-owned Knowledge fragment without aliasing the
  Knowledge-owned projection object;
- preserves the bounded proposition semantics and required source-owned
  correspondence without becoming their semantic issuer;
- places the fragment after Identity in canonical `[Identity, Knowledge]`
  order;
- closes the exact incorporated-fragment set;
- validates the candidate revision;
- applies stable reuse or governed successor behavior; and
- activates only after every Context-owned prerequisite succeeds.

Incorporation does not transfer Knowledge truth, acceptance, lifecycle,
Source Currentness, attribution, issuer verification, provenance, or
contradiction ownership to Context. Fragment presence does not establish
exact-query applicability, evidence sufficiency, a Reasoning answer, or
authorization.

## Context Knowledge Fragment and Minimization

The immutable Context-owned Knowledge fragment preserves only the bounded
proposition semantics and governed correspondence required for incorporation
and later authorized bounded Reasoning:

- proposition identity and bounded semantic value;
- Knowledge identity and exact version;
- accepted-state correspondence;
- Source Currentness correspondence for the preparation boundary;
- Knowledge attribution; and
- issuer-authority verification correspondence.

An optional opaque provenance pointer may be preserved only when governed by
the source projection and required for approved correspondence. Context must
not dereference it or expose it as an independent retrieval handle.

The fragment excludes:

- KnowledgeRecord and Store internals;
- CandidateClaim as a cross-capability accepted representation;
- raw provenance;
- acceptance rationale or evidence;
- source-internal metadata;
- personal data in the first slice;
- confidence heuristics;
- independent retrieval handles;
- raw retrieval results and receipt/wrapper identity; and
- Context retrieval-purpose details not authorized downstream.

Context defensively constructs its fragment and does not retain or alias
Knowledge-owned mutable or runtime objects. Representation custody does not
transfer semantic authority.

## Source Currentness and Contextual Currentness

Source Currentness and Contextual Currentness remain separate.

The applicable source owns each Source Currentness determination. Knowledge
owns it when Knowledge is the applicable source owner. An underlying qualified
or original source retains ownership when it owns the applicable
determination. Preservation or propagation through Knowledge and Context does
not transfer that ownership.

Context may validate the presence and suitability of governed Source
Currentness correspondence for incorporation, but does not establish Source
Currentness merely because:

- Knowledge accepted the proposition;
- a Knowledge version exists;
- issuer verification succeeded;
- Context received or incorporated the candidate; or
- the Context Revision became Active.

Context separately determines Contextual Currentness for the particular
candidate revision under preparation. Source-current material is not thereby
contextually current, and contextually suitable material does not make Context
the Source Currentness owner.

Activation fixes an immutable revision and the currentness correspondence used
during its preparation. Later Knowledge supersession, withdrawal, lifecycle
change, or Source Currentness change does not mutate, reopen, silently
invalidate, or rewrite that Active or historical revision. Later use requiring
changed evidence requires later preparation and, where applicable, a governed
successor revision.

This revision introduces no TTL, refresh interval, freshness threshold,
implicit latest lookup, automatic recollection, synchronization, perpetual
currentness inference, or automatic successor creation.

## Revision Reuse and Semantic Equivalence

Existing lineage identity, positive consecutive revision numbering,
parentage, stable reuse, successor creation, activation, historical
immutability, and Context authority semantics remain unchanged.

Equivalent incorporated Profile B content may reuse an existing Active
revision. Profile B semantic equivalence includes:

- canonical `[Identity, Knowledge]` profile structure and order;
- the preserved Identity fragment semantics;
- proposition identity and bounded proposition semantic value;
- Knowledge identity and exact version;
- accepted-state and Source Currentness correspondence;
- Knowledge attribution; and
- issuer-authority verification correspondence relevant to the incorporated
  proposition.

Equivalence excludes allocation, wrapper, candidate, retrieval-result,
receipt, delivery, verification-result object, Store, Bootstrap, transport,
and execution-timing identity. An opaque provenance pointer does not affect
equivalence merely through wrapper or allocation identity; a later
specification must explicitly govern it before it can become Context semantic
content.

A changed proposition identity or semantic value, Knowledge identity or
version, accepted-state correspondence, Source Currentness correspondence,
attribution, or authoritative issuer correspondence is changed Context content
and must not be silently reused as equivalent. It may produce a successor only
through existing governed lifecycle behavior after successful preparation.

Profile C stable reuse and semantic equivalence remain exactly as specified by
Context 4.0.0.

## Prospective Knowledge Change and Historical Stability

Later Knowledge supersession, withdrawal, contradiction resolution, or changed
availability operates prospectively for later preparation. Context does not
rewrite, remove, or globally invalidate a proposition in an existing Active or
historical revision.

Context defines no global invalidation, historical mutation, implicit refresh,
source-history selection, or automatic replacement mechanism. Historical
preservation does not imply that earlier correspondence asserts present Source
Currentness or suitability for a later cycle.

## Failure Ownership and Consequences

Failure ownership follows the architectural responsibility that failed.
Propagation, observation, preservation, and downstream consequences do not
transfer or recreate ownership.

Knowledge retains failures arising from Knowledge-owned responsibilities,
including bounded proposition issuance, Knowledge-owned proposition
correspondence, malformed Knowledge-issued projection material,
Knowledge-owned issuer verification, invalid Knowledge state, and Source
Currentness when Knowledge owns the applicable determination.

An underlying qualified or original source retains failures arising from its
own source semantics, authority verification, lifecycle, or Source Currentness
determination. Knowledge and Context may preserve and propagate such failures
without translating, wrapping, replacing, or reclassifying their semantic
identity.

Context owns failures or consequences arising from Context-owned
responsibilities, including:

- invalid Context preparation or fixed-profile request meaning;
- contextual-applicability failure or absence when no source-owned failure
  caused it;
- structurally malformed, mismatched, or inadmissible material detected at
  incorporation;
- missing or structurally unsuitable completed issuer-verification
  correspondence at the incorporation boundary;
- inability to satisfy exact-one cardinality;
- Contextual Currentness failure;
- incorporation, validation, lifecycle, or activation failure; and
- Active Context Revision authority failure.

Context owns the effect of an originating failure on its candidate revision
without acquiring that failure. Zero or multiple qualifying propositions are
Context preparation/cardinality consequences unless a distinct originating
source failure caused the condition. A failed candidate does not mutate an
existing Active or historical revision.

Exact-query non-applicability, evidence insufficiency, and future bounded
Reasoning outcome failures remain Reasoning-owned when later specified.
Concrete error types, propagation containers, precedence algorithms, recovery,
retry, timeout, rollback, and diagnostic strings are deferred.

## Context Authority

Context retains its single existing Active Context Revision authority
mechanism. Context authority proves that the exact immutable revision was
issued and activated by the applicable Context runtime with its exact
incorporated fragment boundary and lineage/revision correspondence.

Context authority does not prove:

- Knowledge truth or correctness of acceptance;
- Knowledge or original-source issuance authority;
- Security authorization;
- present Source Currentness after preparation;
- exact-query applicability;
- evidence sufficiency; or
- a Reasoning outcome.

Revision identifiers, fragment presence, proposition possession, and authority
receipts do not independently establish Context authority. This revision
introduces no second Context authority mechanism.

## Authorization Independence

Security remains the independent owner of authorization semantics and
decisions. Context applies applicable protected-boundary requirements without
acquiring Security ownership.

None of the following proves, recreates, renews, or broadens authorization:

- Identity, Knowledge identity, or proposition identity;
- Knowledge version or accepted state;
- Source Currentness or issuer verification;
- candidate availability or fragment presence;
- Context incorporation, revision identity, Active status, or Context
  authority; or
- possession of an opaque provenance pointer.

Evidence validity and contextual applicability are not authorization.

## Reasoning Boundary

The authoritative Active Context Revision is the single permitted path by
which substantive Knowledge-derived semantics may become available to a
future source-aware Reasoning revision.

Context prepares and fixes the governed evidence boundary but does not:

- interpret the exact bounded Reasoning query;
- decide exact-query applicability or evidence sufficiency;
- answer the query or select a response;
- determine a Reasoning outcome or explainability;
- select a Skill;
- synthesize multiple propositions;
- resolve Knowledge truth contradictions; or
- predict a future Reasoning rule.

Reasoning must not retrieve or independently reverify Knowledge, establish
Source Currentness, redo incorporation, or receive parallel raw source
evidence. Reasoning Engine 2.0.0 remains Active and unchanged; Reasoning 3.0.0
and its exact rules, outcomes, and executable correspondence remain future
work.

## Planning and Brain Boundaries

Planning remains source-opaque and consumes only governed Reasoning output. It
does not inspect Knowledge, proposition, Context-fragment, currentness,
provenance, or issuer-authority correspondence.

Brain remains source-opaque and orchestrates authoritative capability outputs.
It does not retrieve Knowledge, inspect or transform raw propositions, branch
on source semantics, synthesize evidence, or own Context profile-selection
policy.

Direct Knowledge records, results, references, projections, provenance,
currentness correspondence, or authority correspondence must not enter
Planning or Brain as independent evidence. This revision does not revise Planning
2.0.0 or Brain 2.0.2.

## Profile A and Profile C Preservation

Profile A remains a complete valid Identity-only preparation profile. It does
not require Knowledge retrieval, candidate material, proposition semantics, or
the exact-one Knowledge constraint.

Profile C remains the Context 4.0.0 Identity + Memory specialization. This
revision does not change Memory request, retrieval, reference, projection,
incorporation, forgetting, currentness, authority, failure, reuse, or
downstream-opacity semantics. Knowledge proposition semantics must not be
generalized onto Memory.

## CONTRACT-0001 Correspondence

CONTRACT-0001 remains sufficient. The bounded Knowledge proposition projection
is a Knowledge-specific specialization of the existing boundary:

```text
source-owned returned semantics
→ candidate availability
→ Context-owned incorporation
```

CONTRACT-0001 ends at candidate availability. It does not perform or absorb
issuer verification, Contextual Currentness, contextual applicability,
incorporation, validation, activation, Context authority, exact-query
applicability, or Reasoning sufficiency.

Knowledge-owned verification of the Knowledge-issued projection remains
outside CONTRACT-0001. Verification of authority issued by an underlying
qualified or original source likewise remains owned by that underlying source
and outside CONTRACT-0001. Both applicable verification correspondences must
be completed before Context incorporation.

Context's structural validation of completed correspondence and its later
incorporation remain outside the Contract's retrieval/candidate boundary and
do not add a collaboration stage to CONTRACT-0001.

This revision neither changes CONTRACT-0001 nor requires CONTRACT-0002 or a
generic source/evidence Contract.

## Persistence, Reconstruction, and Execution Model

Existing Context persistence, Logical Reconstruction, Exact Replay, and
historical-reproduction boundaries remain unchanged. Source retrieval or
Knowledge reconstruction does not become Context reconstruction authority.

The architecture is neutral to synchronous, asynchronous, event-driven,
local, distributed, Provider-mediated, Adapter-mediated, and
transport-mediated execution. Topology does not change ownership, authority,
currentness, failure, incorporation, privacy, or authorization semantics.

This specification defines no TypeScript type, concrete operation or class, promise or
callback sequence, dependency-injection mechanism, serialization, transport,
persistence schema, Store, hashing algorithm, registry, Provider, Adapter, or
remote invocation policy.

## Deferred Scope

This revision explicitly defers:

- runtime implementation and Core executable language;
- Context request, result, fragment, and operation signatures;
- Knowledge verifier API and proof mechanics;
- concrete bounded proposition representation and validation algorithms;
- concrete contextual-applicability rule and decision representation;
- Reasoning 3.0.0 and source-aware Reasoning rules;
- exact-query applicability and evidence-sufficiency algorithms;
- Reasoning outcomes and explainability representation;
- Planning or Brain specification correspondence, if later required;
- Bootstrap wiring and production Profile B reachability;
- caller-owned profile-selection policy;
- diagnostics, observability representation, conformance tests, and
  implementation tests;
- multi-proposition synthesis, aggregation, reconciliation, and ranking;
- confidence heuristics;
- TTL, refresh, recollection, and synchronization policy; and
- Provider, Adapter, transport, serialization, persistence, and deployment
  policy.

## Version Classification and Migration

Version 5.0.0 is a MAJOR revision. The legal profile set is unchanged, but the
public authoritative semantics of Profile B change incompatibly from an
identifier-only Knowledge projection to a substantive bounded proposition
fragment with required issuer-verification correspondence, contextual
applicability, exact-one eligibility, minimization, and revised semantic
equivalence.

Existing Profile B consumers and future implementations cannot treat the 4.0.0
Knowledge fragment as a conforming 5.0.0 fragment or reconstruct substantive
evidence from its identifier fields. Profiles A and C remain behaviorally
compatible. Knowledge 1.2.0 ownership is preserved rather than transferred,
Reasoning 2.0.0 is not redefined, and CONTRACT-0001 remains unchanged.

Concrete migration and executable compatibility mechanics are deferred until
implementation specifications and Core language are approved.

## Future Conformance Expectations

Before implementation closure, conformance evidence must show:

- exactly the three fixed profiles and canonical ordering;
- Profile A and Profile C non-regression;
- Knowledge-owned projection candidate semantics distinct from incorporation;
- completed issuer verification before Profile B incorporation without
  Context verification ownership;
- deterministic Contextual applicability without Reasoning-answer semantics;
- zero, exactly-one, and multiple-candidate consequences;
- minimal non-aliased Profile B fragment construction;
- Source Currentness and Contextual Currentness separation;
- originating failure preservation and Context-owned candidate consequences;
- stable reuse based on semantic content rather than wrapper identity;
- historical immutability and prospective source change;
- authorization independence and privacy-safe downstream boundary;
- source opacity in Planning and Brain; and
- absence of generic source/evidence architecture or parallel evidence paths.

This section establishes semantic evidence expectations only. It defines no
test matrix or executable design.

## Change History

| Version | Date       | Description                                                                                                |
| ------- | ---------- | ---------------------------------------------------------------------------------------------------------- |
| 1.0.0   | 2026-07-19 | Established the original Identity-only Context Engine vertical slice.                                      |
| 1.1.0   | 2026-07-29 | Added issuer-owned Active Context Revision authority verification.                                         |
| 2.0.0   | 2026-08-11 | Aligned Context-owned Identity retrieval with CONTRACT-0001.                                               |
| 3.0.0   | 2026-08-11 | Added the fixed Identity + Knowledge preparation profile.                                                  |
| 4.0.0   | 2026-08-11 | Added the fixed Identity + Memory profile while preserving the Identity and Knowledge profiles.            |
| 5.0.0   | 2026-08-16 | Drafted the bounded Knowledge proposition incorporation boundary for the existing fixed Knowledge profile. |

## References

- [ADR-0020 — Knowledge Evidence Boundary for Source-Aware Reasoning](../../../docs/adr/ADR-0020-Knowledge-Evidence-Boundary-for-Source-Aware-Reasoning.md)
- [ADR-0008 — Context Collaboration and Source Ownership](../../../docs/adr/ADR-0008-Context-Collaboration-Source-Ownership-and-Reference-Authority.md)
- [ADR-0011 — Source and Contextual Currentness](../../../docs/adr/ADR-0011-Source-Currentness-Contextual-Currentness-and-Currentness-Change.md)
- [ADR-0012 — Authorization and Context Preparation](../../../docs/adr/ADR-0012-Authorization-Semantics-Enforcement-and-Authorized-Reference-Applicability.md)
- [ADR-0013 — Failure Ownership](../../../docs/adr/ADR-0013-Failure-Ownership-Propagation-and-Candidate-Context-Revision-Consequences.md)
- [CONTRACT-0001 — Context Source Retrieval](../../../docs/contracts/CONTRACT-0001-Context-Source-Retrieval.md)
- [Knowledge Engine 1.2.0](../knowledge/ENGINE-0005-Knowledge-Engine-Revision-1.2.0.md)
- [Context Engine 4.0.0](ENGINE-0003-Context-Engine-Revision-4.0.0.md)
- [Brain Engine 2.0.2](../ENGINE-0001-Brain-Engine.md)
- [Reasoning Engine 2.0.0](../reasoning/ENGINE-0006-Reasoning-Engine-Revision-2.0.0.md)
- [Planning Engine 2.0.0](../planning/ENGINE-0007-Planning-Engine-Revision-2.0.0.md)
- [Memory Engine 1.1.0](../memory/ENGINE-0004-Memory-Engine-Revision-1.1.0.md)
- [CONCEPT-0002 — Knowledge Model](../../concepts/CONCEPT-0002-Knowledge-Model.md)
- [CONCEPT-0003 — Context Model](../../concepts/CONCEPT-0003-Context-Model.md)
- [ADR-0009 — Context Revision Preparation and Lifecycle](../../../docs/adr/ADR-0009-Context-Revision-Preparation-Reference-Stability-and-Source-Change.md)
- [ADR-0010 — Context Retrieval Initiation](../../../docs/adr/ADR-0010-Context-Retrieval-Initiation-Request-and-Result-Semantics.md)
- [ADR-0014 — Bootstrap Composition](../../../docs/adr/ADR-0014-Bootstrap-Composition-Responsibility-and-Ownership-and-Authority-Preservation.md)
- [ADR-0016 — Persistence and Reconstruction](../../../docs/adr/ADR-0016-Persistence-Logical-Reconstruction-Exact-Replay-and-Historical-Reproduction-Boundaries.md)
- [ADR-0017 — Execution-model Independence](../../../docs/adr/ADR-0017-Execution-Model-Independence-for-Asynchronous-Event-Driven-and-Distributed-Collaboration.md)
- [Documentation Authority](../../../docs/DOCUMENT-AUTHORITY.md)
- [OES-0004 — Contracts](../../../docs/engineering/OES-0004-Contracts.md)
- [OES-0008 — Documentation Standards](../../../docs/engineering/OES-0008-Documentation-Standards.md)
- [OES-0010 — Versioning Standards](../../../docs/engineering/OES-0010-Versioning-Standards.md)

## Engineering Motto

> Context incorporates bounded Knowledge semantics without acquiring Knowledge authority.
