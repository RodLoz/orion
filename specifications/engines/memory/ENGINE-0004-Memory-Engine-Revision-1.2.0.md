# ENGINE-0004 — Memory Engine Revision

| Field                | Value                                                                                                 |
| -------------------- | ----------------------------------------------------------------------------------------------------- |
| **Status**           | Draft                                                                                                 |
| **Engine Revision**  | Memory Engine 1.2.0                                                                                   |
| **Document Version** | 1.2.2                                                                                                 |
| **Owner**            | Project Maintainers                                                                                   |
| **Created**          | 2026-08-31                                                                                            |
| **Updated**          | 2026-08-31                                                                                            |
| **Applies To**       | Memory-issued structured-proposition relationships and preparation-specific Memory Source Currentness |

---

## Status and Authority

This specification is a Draft additive successor to the Active
[Memory Engine 1.1.0](ENGINE-0004-Memory-Engine-Revision-1.1.0.md). Memory
Engine 1.1.0 remains the sole current canonical ENGINE-0004 authority until
this Draft is separately reviewed, approved, and activated through repository
governance.

This Draft does not supersede Memory Engine 1.1.0, authorize implementation,
make a runtime path complete, make production Profile B reachable, confer
deployment authority, or authorize production activation. If this Draft
conflicts with applicable higher authority or the Active Memory Engine while
it remains a Draft, the applicable higher or Active authority governs.

Engine revision 1.2.0 is a MINOR revision under OES-0010 because it proposes additive,
backward-compatible Memory source-relationship, Source Currentness, and
authority-verification capabilities. Existing Memory 1.1.0 operations and
semantics remain unchanged unless this Draft explicitly adds a new boundary.

Document version 1.2.2 records governed executable-evidence synchronization
only. It does not create Memory Engine revision 1.2.2 or alter the proposed
Memory Engine 1.2.0 semantics.

## Purpose and Compatibility

This revision defines the Memory-owned source boundary required for Memory to
act as the first selected external-to-Knowledge issuing source for structured
Profile B preparation. It governs:

- one Memory-issued relationship between an exact Memory Reference and one
  exact structured semantic tuple;
- preparation-specific Memory Source Currentness;
- Memory-owned issuance and verification authority for that relationship;
- prospective lifecycle invalidation through successful Forget Memory; and
- minimized correspondence consumed by Knowledge and Context without transfer
  of Memory authority.

Retain Memory, Get Memory, List Retained Memory References, Forget Memory,
Memory Record, Memory Reference, Retrieval Receipt, Store, provenance,
retention, retrieval-purpose, last-use, and existing failure semantics remain
compatible with Memory 1.1.0. This revision adds no replacement lookup,
ranking, similarity selection, generic currentness service, or production
composition.

## Governing Authority and Architectural Decision

This revision specializes the source side permitted by
[CONTRACT-0001](../../../docs/contracts/CONTRACT-0001-Context-Source-Retrieval.md).
It preserves the following governing allocation:

- the issuing source owns reference meaning, authority origin, and authority
  verification;
- the applicable issuing source owns Source Currentness;
- Context owns Contextual Applicability, Contextual Currentness, exact-one
  incorporation, and Context Revision lifecycle;
- Knowledge owns acceptance, Knowledge PropositionIdentity, and projection;
- Core may custody shared executable language without acquiring Memory
  semantics; and
- Bootstrap owns composition only.

The human architectural decision selecting Memory as the first
external-to-Knowledge Source Currentness owner is incorporated here only within
those accepted boundaries. It does not establish shared ownership, a generic
source abstraction, implementation authority, or production activation.

## Memory-Owned Responsibilities

For the boundary defined by this revision, Memory owns:

- Memory Reference issuance and verification;
- Memory source capability attribution;
- Memory-issued source-proposition relationship issuance and meaning;
- exact Memory Reference-to-structured-tuple binding;
- preparation-specific Source Currentness determination;
- Memory issuer-authority verification;
- Memory lifecycle invalidation of its issued relationships;
- minimization of outgoing Memory correspondence; and
- Memory-owned request, relationship, verification, and currentness failures.

Memory does not own Knowledge acceptance, Knowledge PropositionIdentity,
Knowledge projection, Contextual Applicability, Contextual Currentness,
Context incorporation, Security authorization, Bootstrap composition, Store
mechanics, transport, or production reachability.

## Source Identity and Capability Attribution

The issuing source for this revision is the Memory capability. The existing
closed Memory attribution `authoritativeCapability = memory` identifies that
capability without creating a new generic source identity.

The applicable Memory authority instance remains private to Memory. Public
capability attribution does not expose an authority instance, verifier state,
authority capture, bearer token, or reusable proof. Provider, Adapter, Store,
database, process location, transport, or Bootstrap identity MUST NOT be
treated as Memory source identity.

## Exact Memory Reference Semantics

The exact Memory Reference retains its Memory 1.1.0 meaning and closed shape.
For this revision, a source relationship MUST bind the exact Memory Reference
issued by the applicable Memory authority. A structurally equal copy,
reconstruction, substituted reference, reference issued by another authority,
or reference with mismatched Memory Identity MUST NOT independently establish
issuance authority.

Reference possession, retrieval success, Store reconstruction, or structural
validity MAY establish that a value is a well-formed candidate operand. None
of them establishes authority verification or Source Currentness.

## Memory-Issued Structured-Proposition Relationship

Memory defines one source-specific opaque relationship between:

- the closed Memory source attribution;
- one exact Memory Reference;
- one exact structured semantic tuple containing exactly `subjectKey`,
  `predicateKey`, and `textualScalar`; and
- one Memory-issued source-proposition relationship identity.

The Memory-issued relationship identity is not Knowledge PropositionIdentity.
It is an opaque Memory correspondence identity whose meaning exists only within
the Memory source relationship. It MUST NOT create a new Knowledge identity,
Context identity, generic source identity, public authority identifier, or
correlation identifier.

Memory owns the relationship to its reference. Knowledge remains free to
accept or reject the tuple and relationship under Knowledge-owned rules.
Successful Knowledge acceptance independently issues the Knowledge-owned
PropositionIdentity. Memory MUST NOT allocate, infer, replace, validate as
Knowledge, or claim ownership of that PropositionIdentity.

## Relationship Issuance

Relationship issuance follows this semantic sequence:

```text
Memory Reference issuance or verification
    -> Memory establishes one exact reference-to-tuple relationship
    -> Memory issues opaque relationship correspondence
    -> Knowledge may evaluate the tuple and correspondence
    -> Knowledge may independently accept and issue PropositionIdentity
    -> a later preparation returns the opaque Memory relationship to Memory
       with CandidatePreparationAssociation for currentness verification
```

Memory MUST issue no relationship unless it can authoritatively bind the exact
Memory Reference, exact tuple, and closed Memory attribution. Issuance MUST be
fail-closed for malformed, mismatched, ambiguous, zero-reference, or
multiple-reference input. Memory MUST NOT rank, merge, synthesize, substitute,
or search for an alternative relationship.

Relationship correspondence MAY be retained as governed semantic evidence.
Retention of relationship evidence MUST NOT persist a reusable authority
capability or transfer verification authority to Store custody.

## Source Currentness Request Boundary

A Memory Source Currentness request concerns exactly one:

- closed Memory source attribution;
- exact Memory Reference;
- exact Memory-issued source-proposition relationship;
- exact structured tuple bound by that relationship; and
- exact CandidatePreparationAssociation for the current preparation.

Memory MUST validate the complete request before determining currentness. The
request MUST NOT contain a generic freshness value, timestamp threshold,
ranking, similarity input, latest selector, replacement selector, caller-
supplied authority token, Contextual Currentness result, or incorporation
decision.

Source Currentness MUST be determined anew for the applicable preparation.
Historical currentness, a prior successful verification, a Retrieval Receipt,
prior Context incorporation, or possession of correspondence MUST NOT satisfy
the request.

## Source Currentness Outcomes

Exactly three semantic possibilities exist: `POSITIVE`, `NEGATIVE`, and
`UNABLE_TO_DETERMINE`.

### Positive

Memory determines `POSITIVE` only when the applicable Memory authority can
authoritatively establish every required fact:

1. the exact Memory Reference was issued by that authority;
2. the exact Memory-issued relationship is valid;
3. the relationship binds that exact reference to that exact structured tuple;
4. the exact CandidatePreparationAssociation identifies the current
   preparation correspondence supplied for this determination;
5. no governed Memory lifecycle transition has invalidated the relationship;
   and
6. sufficient authoritative Memory evidence exists for every preceding fact.

Positive currentness is a Memory-owned statement of current source-domain
standing for this preparation only. It does not establish Knowledge
acceptance, projection eligibility by itself, Contextual Applicability,
Contextual Currentness, incorporation, authorization, or production readiness.

### Negative

Memory determines `NEGATIVE` only when it can authoritatively establish that a
governed Memory lifecycle or currentness rule invalidated the exact relationship
for the preparation. Negative is a completed semantic determination. It MUST
NOT automatically be modeled as an exception merely because downstream
Knowledge projection cannot proceed.

A missing record, Store response, caller assertion, malformed value, or lack
of evidence MUST NOT by itself authorize another participant to declare
negative currentness.

### Unable to Determine

When the request is otherwise valid but Memory lacks sufficient authoritative
evidence to establish either positive or negative currentness, Memory MUST
fail with the distinct Memory-owned semantic identity **Memory Source
Currentness Unable To Determine**.

Unable to determine MUST NOT be converted to negative. It remains distinct
from malformed request, invalid relationship, failed authority verification,
Memory Store unavailability, Adapter failure, and transport failure.

## Prohibited Currentness Inference

Memory Source Currentness MUST NOT be inferred solely from:

- row existence;
- successful retrieval;
- storage presence;
- timestamp freshness;
- stored state;
- not-forgotten status alone;
- latest or replacement lookup;
- similarity;
- ranking;
- prior positive currentness;
- historical Context incorporation;
- authority possession;
- authorization; or
- a prior Retrieval Receipt.

No currentness outcome may trigger latest lookup, substitution, fallback,
similarity selection, replacement lookup, retry, reconstruction, retrieval of
an alternative reference, or mutation of historical Context.

## CandidatePreparationAssociation Binding and Opacity

Context supplies CandidatePreparationAssociation for exactly one preparation.
Memory may preserve, compare, and authority-bind it only as opaque
preparation-scoped correspondence required by the current determination.

Memory MUST NOT:

- interpret it as proposition content;
- treat it as Memory semantic data;
- derive currentness meaning from its textual representation;
- expose its internals;
- turn it into a stable public identifier;
- use it as bearer authority;
- persist it as reusable authority material; or
- repurpose it as unrelated diagnostic or operational correlation.

Structural equality of CandidatePreparationAssociation does not independently
establish preparation authority or valid relationship correspondence.

## Positive Currentness Correspondence

Only a positive determination may produce preparation-bound currentness
correspondence for downstream consumption. That correspondence semantically
preserves only:

- closed Memory source attribution;
- the exact opaque Memory-issued source-proposition relationship;
- the exact CandidatePreparationAssociation;
- the completed positive determination; and
- opaque Memory issuer-verification correspondence.

The correspondence MUST be constructed and minimized inside Memory before it
leaves the Memory boundary. Negative produces no positive correspondence.
Unable to determine produces no positive correspondence.

The correspondence is not Memory content, a projection, an Event, an audit
record, a Context fragment, a bearer token, or reusable authority. Knowledge
and Context may preserve or compare it only within their governed consumer
boundaries.

## Memory Authority Verification

The applicable Memory authority owns verification of Memory Reference issuance,
relationship issuance, exact binding, preparation correspondence, lifecycle
standing, and currentness issuance.

Verification MUST:

- be performed by the applicable Memory authority;
- require the exact governed reference, relationship, tuple, and preparation
  correspondence;
- reject source, reference, tuple, relationship, preparation, or authority-
  instance mismatch;
- reject fabricated, substituted, cloned, or reconstructed authority material
  where structural equality is insufficient to preserve issuance authority;
- be fail-closed for malformed request or invalid internal authority state; and
- expose no authority-capture or verifier internals.

Possession, serialization, structural equality, Store reconstruction, or
transport does not establish authority. No caller-constructible proof, bearer
token, global authority registry, durable reusable authority record, or public
authority-capture identifier is authorized.

This specification does not mandate exact-object capture, Map, WeakMap,
registry, cryptographic proof, signature, process placement, or another
implementation mechanism. Knowledge projection authority is precedent for
boundary separation only and does not govern Memory's implementation mechanics.

## Lifecycle Invalidation

For Memory 1.2.0, successful Forget Memory deletion is the only currently
governed invalidating Memory lifecycle transition for issued relationships.
After successful forgetting, Memory MUST classify an exactly known affected
relationship as negative for a future valid preparation when it retains
sufficient authoritative evidence to establish that invalidation.

Forgetting does not make Store deletion, not-found status, or absence itself
the semantic authority. Memory owns the classification. If Memory cannot
authoritatively establish either the relationship's continued validity or its
governed invalidation, the result is unable to determine rather than negative.

Stored or not-forgotten state may be necessary evidence where applicable but
is never sufficient by itself for positive currentness.

Replacement, archival, separate removal, explicit invalidation, and other
lifecycle transitions not currently defined by Memory remain deferred. This
revision MUST NOT simulate those transitions through lookup or inference.

## Forgetting and Historical Context Preservation

Forget Memory affects future preparation-specific Source Currentness only.
It MUST NOT retroactively mutate, remove, replace, reorder, or rewrite material
already incorporated into a stable, Active, or historical Context Revision.

A previous Context Revision remains immutable historical evidence of what was
incorporated for its reasoning cycle. Historical preservation does not establish
present Source Currentness, Contextual Currentness, or eligibility for later
preparation.

## Failure Identities and Ownership

Existing Memory failures retain their established meanings where applicable,
including Invalid Memory Input, Invalid Memory Identity, Memory Not Found,
Memory Store Unavailable, Invalid Memory State, and Invalid Memory Lifecycle
Transition.

This revision adds these distinct public Memory-owned semantic failure
identities:

- **Invalid Memory Source Currentness Request**;
- **Invalid Memory Source Relationship**;
- **Memory Source Authority Verification Failure**; and
- **Memory Source Currentness Unable To Determine**.

Concrete programming-language class names remain deferred.

| Condition                                                                  | Governed disposition                                                        |
| -------------------------------------------------------------------------- | --------------------------------------------------------------------------- |
| Governed relationship invalidation established                             | `NEGATIVE` semantic result                                                  |
| Otherwise valid request lacks sufficient authoritative evidence            | Memory Source Currentness Unable To Determine                               |
| Malformed currentness request                                              | Invalid Memory Source Currentness Request                                   |
| Malformed relationship state                                               | Invalid Memory Source Relationship                                          |
| Source, reference, relationship, tuple, preparation, or authority mismatch | Memory Source Authority Verification Failure                                |
| Store unavailable                                                          | Existing Memory Store Unavailable failure                                   |
| Malformed Store reconstruction                                             | Existing Invalid Memory State failure where its established meaning applies |
| Adapter, transport, Security, Knowledge, or Context failure                | Preserve originating owner and exact public identity                        |

Memory MUST NOT normalize these distinctions into a duplicate generic failure
taxonomy. A downstream consequence does not transfer originating failure
ownership. No retry, fallback, substitution, recovery, or compensation policy
is created.

## Privacy and Minimization

Memory MUST minimize all outgoing relationship, currentness, and verification
correspondence before it crosses the Memory boundary. It MUST NOT expose:

- Memory content;
- private Memory provenance;
- retention reason;
- retained-at or retrieved-at timestamps;
- retrieval purpose;
- Retrieval Receipt;
- last-use state;
- embeddings;
- confidence;
- ranking;
- retrieval traces;
- Store identifiers or metadata;
- database state;
- credentials;
- internal lifecycle evidence;
- authority-capture internals;
- verifier internals; or
- reusable authority material.

The Memory-issued relationship remains opaque outside Memory. Transport-layer
filtering, Bootstrap redaction, Store filtering, or consumer-side omission is
not the authoritative minimization boundary.

## Core Custody Boundary

Core may later custody closed executable records, value objects, public failure
identities, and operation signatures required to express this specification.
Core custody does not confer Memory source semantics, relationship meaning,
currentness ownership, lifecycle policy, verification authority, failure
determination, or privacy ownership.

No Core type or generic cross-source abstraction is created or authorized by
this drafting pass.

## Knowledge Consumption Boundary

Knowledge may consume verified positive Memory correspondence for an accepted
external-source-owned proposition. Knowledge retains exclusive ownership of:

- Knowledge acceptance;
- Knowledge Identity and version;
- Knowledge PropositionIdentity;
- Accepted state;
- projection eligibility;
- Knowledge projection issuance and verification; and
- Knowledge-owned failures.

Knowledge MUST NOT determine, reconstruct, renew, or reinterpret Memory Source
Currentness or Memory authority. The Memory relationship remains opaque and
distinct from Knowledge PropositionIdentity. Negative or unable-to-determine
Memory outcomes issue no positive prerequisite correspondence.

## Context Consumption Boundary

Context establishes the CandidatePreparationAssociation and may consume and
preserve positive Memory Source Currentness correspondence. Context retains
exclusive ownership of Contextual Applicability, Contextual Currentness,
exact-one incorporation, Context validation, Context Revision lifecycle, and
Context authority.

Context MUST NOT determine, renew, infer, or reinterpret Memory Source
Currentness. Source-current correspondence does not itself establish
Contextual Currentness or incorporation.

## Store and Persistence Boundary

Store and Adapter implementations own technical persistence and reconstruction
mechanics only. Store presence, row state, deletion response, version metadata,
timestamps, or reconstruction success MUST NOT establish Memory authority or
Source Currentness.

Memory may persist semantic relationship evidence where required by a later
approved executable design, but MUST NOT persist reusable authority capability,
authority capture, bearer proof, or verifier internals. A process restart MUST
NOT silently recreate authority from structural data. Exact restart and
re-establishment mechanics remain deferred.

## Bootstrap Composition Boundary

Bootstrap may later select, construct, and inject Core-custodied collaborators
for a nonproduction composition. Bootstrap MUST NOT:

- issue Memory references or relationships;
- determine or reinterpret Memory Source Currentness;
- perform Memory authority verification;
- classify negative or unable-to-determine outcomes;
- inspect protected Memory state;
- synthesize correspondence; or
- acquire Memory, Knowledge, or Context semantic authority.

No Bootstrap implementation or production composition is authorized by this
Draft.

## Security and Authority Constraints

Memory authority verification and Security authorization remain distinct.
Successful Memory verification does not authorize use. Security authorization
does not establish Memory issuance, relationship validity, Source Currentness,
Contextual Currentness, or incorporation.

Authority material MUST be non-transferable, non-bearer, exact-reference-bound,
exact-relationship-bound, exact-tuple-bound, and exact-preparation-bound. It
MUST NOT be logged, transported as a reusable credential, persisted as reusable
authority, or exposed to unrelated callers.

Malformed or hostile input MUST fail closed without exposing Memory content,
credentials, native exception details, Store internals, authority internals, or
private traces.

## Non-Goals

This revision does not define or authorize:

- a generic Currentness service;
- a generic source abstraction;
- a new public source identity;
- a new Knowledge PropositionIdentity or Context identity;
- a correlation-ID architecture;
- timestamp freshness, TTL, scoring, ranking, or similarity currentness;
- latest, fallback, replacement, or substitution selection;
- archival, replacement, or new lifecycle operations;
- authorization policy;
- persistence schema or migration;
- exact authority-capture mechanics;
- serialization or transport protocol;
- diagnostics, metrics, tracing, or audit logging;
- asynchronous queues or distributed authority;
- production Bootstrap composition;
- deployment authority;
- production Profile B activation;
- Reasoning, Planning, Brain, or Skill changes; or
- K13-IMPL-F08 closure.

## Implementation Gates

All gates began `OPEN`. Drafting or review does not constitute executable
evidence. A gate changes disposition only after its required executable
evidence is separately validated and synchronized here.

| Gate         | Requirement                                                                                                                        | Status |
| ------------ | ---------------------------------------------------------------------------------------------------------------------------------- | ------ |
| M12-IMPL-F01 | Closed Memory source-relationship representation and exact Memory attribution                                                      | PASS   |
| M12-IMPL-F02 | Exact Memory Reference and exact structured-tuple relationship binding                                                             | OPEN   |
| M12-IMPL-F03 | Opaque CandidatePreparationAssociation binding without semantic interpretation                                                     | OPEN   |
| M12-IMPL-F04 | Preparation-specific positive, negative, and unable-to-determine behavior                                                          | OPEN   |
| M12-IMPL-F05 | Memory-owned issuance and authority verification with fail-closed mismatch handling                                                | OPEN   |
| M12-IMPL-F06 | Rejection of fabricated, substituted, cloned, or reconstructed authority where semantically applicable                             | OPEN   |
| M12-IMPL-F07 | Prospective lifecycle invalidation through successful Forget Memory                                                                | OPEN   |
| M12-IMPL-F08 | Historical Context preservation after later Memory invalidation                                                                    | OPEN   |
| M12-IMPL-F09 | Privacy minimization and prohibited-field absence                                                                                  | OPEN   |
| M12-IMPL-F10 | Non-bearer authority and absence of reusable authority persistence                                                                 | OPEN   |
| M12-IMPL-F11 | Exact public failure identity and originating failure preservation                                                                 | OPEN   |
| M12-IMPL-F12 | Core custody-only, Knowledge consumer-only, Context consumer-only, Bootstrap composition-only, and Store non-authority conformance | OPEN   |
| M12-IMPL-F13 | Nonproduction end-to-end Memory-to-Knowledge-to-Context evidence                                                                   | OPEN   |

### M12-IMPL-F01 Executable Evidence

Subsequent to the semantic architecture and executable-boundary approval in
REVIEW-0006, validated Core evidence now satisfies M12-IMPL-F01. The
Core-custodied representation provides:

- one closed, exact four-field Memory source relationship containing only
  `sourceAttribution`, `memoryReference`, `semanticValue`, and
  `relationshipIdentity`;
- exact closed `authoritativeCapability: "memory"` attribution;
- representational binding of the existing closed Memory Reference, the exact
  `subjectKey`/`predicateKey`/`textualScalar` tuple, and the distinct opaque
  `MemorySourceRelationshipIdentity`;
- exact-shape factories, frozen records, and rejection of arbitrary fields;
- absence of Knowledge PropositionIdentity,
  CandidatePreparationAssociation, protected Memory fields, authority state,
  verifier internals, and reusable authority material from the relationship;
  and
- Core custody only, with no runtime Memory authority or Source Currentness
  determination and with Core dependency boundaries preserved.

Executable traceability includes the focused Memory Source Currentness and
Memory Contract tests (2 files, 45 tests), the full Core suite (23 files, 565
tests), and the full repository regression (1,896 passed, 51 skipped). Core
production and test typechecks, Core ESLint, Prettier, Dependency Cruiser (32
modules, 94 dependencies, no violations), the forbidden Core dependency check,
and `git diff --check` also passed.

This evidence closes only the representation and exact Memory-attribution
scope of M12-IMPL-F01. Exact authority-issued Memory Reference and tuple
relationship proof remains M12-IMPL-F02 work. Preparation-specific request
binding remains M12-IMPL-F03 work; currentness result semantics remain
M12-IMPL-F04 work; runtime authority and currentness behavior remain
M12-IMPL-F05 and later work; and runtime/public failure behavior beyond Core
identity custody remains M12-IMPL-F11 work. Those gates remain `OPEN`.

## Conformance Requirements

Future executable evidence MUST demonstrate at minimum:

- exactly one closed Memory relationship for one exact reference and tuple;
- no substitution, latest lookup, ranking, similarity selection, or fallback;
- exact preparation binding and fresh determination per preparation;
- positive only after complete authoritative verification;
- negative only after a governed invalidation is authoritatively established;
- unable to determine remains distinct and fails with its exact Memory identity;
- invalid requests, invalid relationships, verification failures, Store
  failures, and external failures remain distinct;
- successful forgetting affects future determinations without mutating prior
  Context;
- structural equality, reconstruction, or possession does not create
  authority;
- no protected Memory material or reusable authority leaves Memory;
- Core, Knowledge, Context, Bootstrap, Store, and transport preserve their
  assigned boundaries;
- implementation typecheck, build, lint, dependency, formatting, and relevant
  test suites pass; and
- nonproduction integration evidence does not imply production activation.

Tests and diagnostics are evidence, not authority. No implementation gate may
be marked PASS solely because code or a test fixture exists.

## Compatibility and Migration

Memory 1.2.0 is additive. Existing Memory 1.1.0 requests, results, Store
contracts, operations, and failure behavior remain supported. No existing
MemoryReference becomes source-current merely because this revision is drafted
or later activated.

Existing retained Memory has no fabricated source relationship or currentness
authority. Where required relationship evidence does not exist, an otherwise
valid determination is unable to determine; implementations MUST NOT infer or
backfill positive currentness from Store state.

No persistence migration, production data migration, automatic relationship
issuance, or authority reconstruction is authorized here.

## Review and Activation Gates

[REVIEW-0006](../../../docs/architecture-review/REVIEW-0006-Memory-Engine-Source-Currentness-and-Reference-Authority.md)
approved the Memory Engine 1.2.0 semantic architecture and executable
boundaries through the governed repository review path. Memory 1.2.0 remains
Draft and Active Memory 1.1.0 remains authoritative. REVIEW-0006 did not close
an implementation gate; subsequent validated executable Core evidence now
satisfies M12-IMPL-F01. M12-IMPL-F02 through M12-IMPL-F13 and K13-IMPL-F08
remain OPEN.

REVIEW-0006 does not by itself activate Memory 1.2.0, authorize implementation
or production composition, establish runtime or implementation completeness,
confer deployment or production authority, make production Profile B
reachable, or close K13-IMPL-F08.

Activation requires all applicable repository lifecycle steps. Until then,
Memory Engine 1.1.0 remains Active and authoritative.

## K13-IMPL-F08 Relationship

The human decision and this Draft resolve the proposed source selection,
Memory Source Currentness ownership, three-way outcome distinction,
preparation binding, forgetting-based invalidation principle, and authority and
opacity allocation at the specification level.

`K13-IMPL-F08` remains `OPEN`. Closure still requires, after governance:

- approved Memory executable contracts where required;
- Memory relationship, currentness, and verifier implementation;
- Knowledge external-source integration;
- Context Profile B integration;
- Bootstrap nonproduction composition; and
- nonproduction end-to-end conformance evidence.

Production Profile B reachability, deployment, and activation remain separately
governed and are not advanced by this Draft.

## Related Documents

- [Active Memory Engine 1.1.0](ENGINE-0004-Memory-Engine-Revision-1.1.0.md)
- [Memory Engine revision history](ENGINE-0004-Memory-Engine.md)
- [REVIEW-0006 — Memory Source Currentness and Reference Authority](../../../docs/architecture-review/REVIEW-0006-Memory-Engine-Source-Currentness-and-Reference-Authority.md)
- [CONCEPT-0001 — Memory Model](../../concepts/CONCEPT-0001-Memory-Model.md)
- [CONCEPT-0002 — Knowledge Model](../../concepts/CONCEPT-0002-Knowledge-Model.md)
- [CONCEPT-0003 — Context Model](../../concepts/CONCEPT-0003-Context-Model.md)
- [ARCH-0001 — Core Architecture](../../architecture/ARCH-0001-Core-Architecture.md)
- [CONTRACT-0001 — Context Source Retrieval](../../../docs/contracts/CONTRACT-0001-Context-Source-Retrieval.md)
- [Active Knowledge Engine 3.0.0](../knowledge/ENGINE-0005-Knowledge-Engine-Revision-3.0.0.md)
- [Knowledge executable projection specification](../knowledge/ENGINE-0005-Knowledge-Engine-Executable-Projection-Operation.md)
- [REVIEW-0003 — Knowledge executable projection](../../../docs/architecture-review/REVIEW-0003-Knowledge-Engine-Executable-Projection-Operation.md)
- [REVIEW-0005 — Knowledge projection diagnostic observer](../../../docs/architecture-review/REVIEW-0005-Knowledge-Engine-Projection-Diagnostic-Observer-Boundary.md)
- [Active Context Engine 5.1.0](../context/ENGINE-0003-Context-Engine-Revision-5.1.0.md)
- [ADR-0008 — Context collaboration and source ownership](../../../docs/adr/ADR-0008-Context-Collaboration-Source-Ownership-and-Reference-Authority.md)
- [ADR-0011 — Source and Contextual Currentness](../../../docs/adr/ADR-0011-Source-Currentness-Contextual-Currentness-and-Currentness-Change.md)
- [ADR-0013 — Failure ownership](../../../docs/adr/ADR-0013-Failure-Ownership-Propagation-and-Candidate-Context-Revision-Consequences.md)
- [ADR-0014 — Bootstrap composition](../../../docs/adr/ADR-0014-Bootstrap-Composition-Responsibility-and-Ownership-and-Authority-Preservation.md)
- [ADR-0020 — Knowledge evidence boundary](../../../docs/adr/ADR-0020-Knowledge-Evidence-Boundary-for-Source-Aware-Reasoning.md)
- [ADR-0021 — Knowledge Source Currentness](../../../docs/adr/ADR-0021-Knowledge-Source-Currentness-and-Projection-Attribution.md)
- [ADR-0022 — Context preparation scope](../../../docs/adr/ADR-0022-Context-Preparation-Semantic-Scope-and-Applicability-Policy.md)
- [Documentation Authority](../../../docs/DOCUMENT-AUTHORITY.md)
- [OES-0002 — Engine Design](../../../docs/engineering/OES-0002-Engine-Design.md)
- [OES-0004 — Contracts](../../../docs/engineering/OES-0004-Contracts.md)
- [OES-0008 — Documentation Standards](../../../docs/engineering/OES-0008-Documentation-Standards.md)
- [OES-0009 — Security Standards](../../../docs/engineering/OES-0009-Security-Standards.md)
- [OES-0010 — Versioning Standards](../../../docs/engineering/OES-0010-Versioning-Standards.md)

## Change History

| Document Version | Date       | Description                                                                                                                                                                                                                                                                    |
| ---------------- | ---------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| 1.2.0            | 2026-08-31 | Drafted additive Memory-issued source-proposition relationship, preparation-specific Source Currentness, Memory authority verification, prospective forgetting invalidation, privacy, failure, ownership, and open conformance gates; Memory 1.1.0 remains Active.             |
| 1.2.1            | 2026-08-31 | Recorded focused governed approval through REVIEW-0006 while preserving Draft status, Active Memory 1.1.0, all M12 gates OPEN, K13-IMPL-F08 OPEN, and no implementation or activation authority.                                                                               |
| 1.2.2            | 2026-08-31 | Synchronized M12-IMPL-F01 to PASS from validated executable Core custody evidence under REVIEW-0006 architectural approval; M12-IMPL-F02 through F13 and K13-IMPL-F08 remain OPEN, Draft status and Active Memory 1.1.0 are preserved, and no later implementation is claimed. |

## Engineering Motto

> Memory verifies its own relationships. Currentness is preparation-specific, authority-bound, and never inferred from storage.
