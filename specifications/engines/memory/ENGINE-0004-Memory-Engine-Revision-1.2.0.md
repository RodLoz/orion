# ENGINE-0004 — Memory Engine Revision

| Field                | Value                                                                                                 |
| -------------------- | ----------------------------------------------------------------------------------------------------- |
| **Status**           | Active                                                                                                |
| **Supersedes**       | [Memory Engine 1.1.0](ENGINE-0004-Memory-Engine-Revision-1.1.0.md)                                    |
| **Engine Revision**  | Memory Engine 1.2.0                                                                                   |
| **Document Version** | 1.2.11                                                                                                |
| **Owner**            | Project Maintainers                                                                                   |
| **Created**          | 2026-08-31                                                                                            |
| **Updated**          | 2026-09-06                                                                                            |
| **Applies To**       | Memory-issued structured-proposition relationships and preparation-specific Memory Source Currentness |

---

## Status and Authority

This specification is Active and is the sole current canonical ENGINE-0004
revision. It supersedes
[Memory Engine 1.1.0](ENGINE-0004-Memory-Engine-Revision-1.1.0.md), which
remains historical and non-authoritative.

Activation establishes specification authority only. It does not deploy a
runtime, make production Profile B reachable, confer deployment authority,
authorize production Bootstrap composition, close `K13-IMPL-F08`, or authorize
Reasoning or Brain production integration. Applicable higher authority
continues to govern in a conflict.

Engine revision 1.2.0 is a MINOR revision under OES-0010 because it adds
backward-compatible Memory source-relationship, Source Currentness, and
authority-verification capabilities. Existing Memory 1.1.0 operations and
semantics remain unchanged except for the additive boundaries explicitly
defined by this revision.

Document version 1.2.10 records lifecycle activation only. It does not create
Memory Engine revision 1.2.10, alter Memory Engine 1.2.0 semantics, authorize
production deployment, or close `K13-IMPL-F08`.

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
this revision.

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

No production Bootstrap implementation or composition is authorized by this
specification.

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

All gates began `OPEN`. Initial drafting or review does not constitute executable
evidence. A gate changes disposition only after its required executable
evidence is separately validated and synchronized here.

| Gate         | Requirement                                                                                                                        | Status |
| ------------ | ---------------------------------------------------------------------------------------------------------------------------------- | ------ |
| M12-IMPL-F01 | Closed Memory source-relationship representation and exact Memory attribution                                                      | PASS   |
| M12-IMPL-F02 | Exact Memory Reference and exact structured-tuple relationship binding                                                             | PASS   |
| M12-IMPL-F03 | Opaque CandidatePreparationAssociation binding without semantic interpretation                                                     | PASS   |
| M12-IMPL-F04 | Preparation-specific positive, negative, and unable-to-determine behavior                                                          | PASS   |
| M12-IMPL-F05 | Memory-owned issuance and authority verification with fail-closed mismatch handling                                                | PASS   |
| M12-IMPL-F06 | Rejection of fabricated, substituted, cloned, or reconstructed authority where semantically applicable                             | PASS   |
| M12-IMPL-F07 | Prospective lifecycle invalidation through successful Forget Memory                                                                | PASS   |
| M12-IMPL-F08 | Historical Context preservation after later Memory invalidation                                                                    | PASS   |
| M12-IMPL-F09 | Privacy minimization and prohibited-field absence                                                                                  | PASS   |
| M12-IMPL-F10 | Non-bearer authority and absence of reusable authority persistence                                                                 | PASS   |
| M12-IMPL-F11 | Exact public failure identity and originating failure preservation                                                                 | PASS   |
| M12-IMPL-F12 | Core custody-only, Knowledge consumer-only, Context consumer-only, Bootstrap composition-only, and Store non-authority conformance | PASS   |
| M12-IMPL-F13 | Nonproduction end-to-end Memory-to-Knowledge-to-Context evidence                                                                   | PASS   |

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
scope of M12-IMPL-F01. Subsequent separately validated Memory evidence for
M12-IMPL-F02 through M12-IMPL-F05 and M12-IMPL-F07 is recorded below.
Subsequent separately validated Memory evidence for M12-IMPL-F06 is recorded
below. Subsequent separately validated evidence for M12-IMPL-F08 through
M12-IMPL-F12 is also recorded below where applicable. M12-IMPL-F13 and
K13-IMPL-F08 remain `OPEN`.

### M12-IMPL-F02 Executable Evidence

Subsequent to REVIEW-0006 architectural approval, validated Memory executable
evidence now satisfies M12-IMPL-F02. The Memory-owned producer establishes one
exact relationship between closed Memory attribution, an exact
Memory-issued Memory Reference, one explicit exact
`subjectKey`/`predicateKey`/`textualScalar` tuple, and a Memory-generated opaque
relationship identity. It preserves all tuple values exactly and performs no
content derivation, normalization, inference, ranking, similarity, latest
selection, replacement, or fallback.

Private process-local issuance and relationship-binding evidence distinguishes
Memory-issued references from caller-created, cloned, or Store-reconstructed
structural equivalents. Structural equality, relationship-identity possession,
Store presence, persistence, timestamps, tuple contents, and caller input do
not establish authority. No authority evidence is persisted or reconstructed
across restart, and no private producer state, public authority token, bearer
proof, or authority-capture identifier leaves Memory.

The returned frozen relationship remains minimized and excludes Memory content,
private provenance, CandidatePreparationAssociation, Knowledge
PropositionIdentity, Store metadata, and authority/verifier internals. The
producer preserves the F02-relevant failure distinction: malformed or open
relationship issuance input fails as `InvalidMemorySourceRelationshipError`,
while a structurally valid but non-issued Memory Reference fails as
`MemorySourceAuthorityVerificationFailureError`. Existing Store failures retain
their originating identities.

Executable traceability includes the focused F02 and existing Memory tests (2
files, 48 tests), the Core and Memory suites (25 files, 613 tests), and the full
repository evidence from unchanged implementation hashes (105 files passed, 2
skipped; 1,903 tests passed, 51 skipped). Memory production and test
typechecks, repository build, Memory ESLint, Prettier, Dependency Cruiser (63
modules, 124 dependencies, no violations), the forbidden Core and Memory
dependency checks, and `git diff --check` also passed.

This evidence closes only exact Memory-issued reference/tuple relationship
binding, Memory-owned relationship issuance, and the producer-side authority
evidence necessary for that binding. Subsequent separately validated
preparation-binding evidence for M12-IMPL-F03 is recorded below. It does not
close Source Currentness outcomes or determination, the public verifier, the
full fabrication/substitution/reconstruction verification matrix,
forgetting-driven currentness invalidation, or any later privacy, lifecycle,
ownership, integration, or end-to-end gate. Subsequent separately validated
evidence for M12-IMPL-F03 through M12-IMPL-F05 and M12-IMPL-F07 is recorded
below. Subsequent separately validated evidence for M12-IMPL-F06 is also
recorded below, as is subsequent separately validated evidence for
M12-IMPL-F08 through M12-IMPL-F12 where applicable. M12-IMPL-F13 and
K13-IMPL-F08 remain `OPEN`.

### M12-IMPL-F03 Executable Evidence

Subsequent to REVIEW-0006 architectural approval, validated Memory executable
evidence now satisfies M12-IMPL-F03. Memory constructs one closed
preparation-bound `MemorySourceCurrentnessRequest` from one exact F02-issued
`MemorySourceRelationship` and one exact opaque
`CandidatePreparationAssociation`. The request contains only `relationship`
and `candidatePreparationAssociation`, preserves the exact relationship and
association values, and freezes the request and governed nested records.

The binding requires the exact relationship issued by the applicable Memory
runtime. Caller-created equivalents, clones, reconstructions, and valid-looking
relationships with substituted attribution, Memory Reference, structured
tuple, or relationship identity fail to establish binding authority. The
association is preserved exactly, including whitespace, and is not parsed,
trimmed, normalized, ranked, interpreted, transformed, or used to derive
proposition meaning or Source Currentness.

Private process-local preparation-binding evidence preserves correspondence
between the produced request, exact issued relationship, and opaque
association. Executable evidence demonstrates no Store read or write for the
binding, no Store-backed or persisted preparation authority, no restart
reconstruction, and no public bearer authority. The private evidence may be
lost on process restart without structural data silently recreating authority.

Malformed or open binding requests, malformed CandidatePreparationAssociation
values, and malformed nested relationships fail as
`InvalidMemorySourceCurrentnessRequestError`. Structurally valid but non-issued
relationships and valid-looking substituted relationship operands fail as
`MemorySourceAuthorityVerificationFailureError`.
`InvalidMemorySourceRelationshipError` remains the separate F02
relationship-issuance failure.

The minimized public request excludes Memory content, private provenance,
Knowledge PropositionIdentity, private binding state, authority tokens,
authority-capture identifiers, diagnostic correlation, verifier internals,
Store metadata, credentials, confidence, ranking, private traces, and any
currentness outcome. CandidatePreparationAssociation remains absent from the
underlying F02 relationship.

Executable traceability includes the focused F03, F02, and existing Memory
tests (3 files, 54 tests), the Core and Memory suites (26 files, 619 tests), and
the full repository suites (106 files passed, 2 skipped; 1,909 tests passed, 51
skipped). Memory production and test typechecks, repository build, Memory
ESLint, Prettier, Dependency Cruiser (63 modules, 124 dependencies, no
violations), the forbidden Core and Memory dependency checks, and
`git diff --check` also passed.

This evidence closes only the exact F02-issued relationship plus exact opaque
CandidatePreparationAssociation binding into a closed preparation-bound
MemorySourceCurrentnessRequest. It does not establish positive, negative, or
unable-to-determine runtime behavior, positive currentness correspondence,
Source Currentness determination, lifecycle or forgetting currentness
evaluation, the public verifier, the complete authority-verification matrix,
Knowledge or Context integration, Bootstrap composition, end-to-end
conformance, or production Profile B reachability. Subsequent separately
validated evidence for M12-IMPL-F04, M12-IMPL-F05, and M12-IMPL-F07 is
recorded below. Subsequent separately validated evidence for M12-IMPL-F06 is
also recorded below, as is subsequent separately validated evidence for
M12-IMPL-F08 through M12-IMPL-F12 where applicable. M12-IMPL-F13 and
K13-IMPL-F08 remain `OPEN`.

### M12-IMPL-F04 Executable Evidence

Subsequent to REVIEW-0006 architectural approval, validated Memory executable
evidence now satisfies M12-IMPL-F04. The public verifier determines Source
Currentness anew for one exact preparation-bound request and implements all
three governed semantic dispositions:

- `POSITIVE` is a completed frozen result for an exact recognized F03 request
  with an intact F02/F03 authority chain, the applicable Memory instance,
  authoritative retained standing, and no exact governed invalidation;
- `NEGATIVE` is a completed frozen result only when that exact recognized
  request and intact authority chain correspond to an exact relationship in
  private successful-Forget invalidation evidence; and
- insufficient positive standing without exact invalidation fails as
  `MemorySourceCurrentnessUnableToDetermineError`. Unable to determine remains
  a Memory-owned failure rather than a result-union variant.

The closed result union remains exactly `POSITIVE` and `NEGATIVE`. The caller
cannot select a determination or supply authority proof. Store absence,
not-found state, unavailability, and missing retained standing alone do not
establish `NEGATIVE`. Positive and negative results are exact-shape, minimized,
and frozen; only positive carries minimized preparation-bound correspondence.

### M12-IMPL-F05 Executable Evidence

Subsequent to REVIEW-0006 architectural approval, validated Memory executable
evidence now satisfies M12-IMPL-F05. Memory validates the exact verifier
wrapper, recognizes the exact F03-issued request, follows its private binding
to the exact F02-issued relationship, and verifies closed source attribution,
exact Memory Reference, exact structured tuple, relationship identity, exact
opaque CandidatePreparationAssociation, and the applicable Memory instance
before evaluating lifecycle standing or currentness.

Fabricated or cloned requests; reconstructed or substituted relationships,
references, tuples, relationship identities, or preparation associations; and
cross-instance or restarted authority fail closed as
`MemorySourceAuthorityVerificationFailureError`. Malformed wrapper or
association input fails as `InvalidMemorySourceCurrentnessRequestError`, and a
malformed nested relationship retains
`InvalidMemorySourceRelationshipError`. An exact recognized request lacking
both sufficient retained standing and exact invalidation evidence fails as
`MemorySourceCurrentnessUnableToDetermineError`; exact governed invalidation
produces `NEGATIVE`. Existing Store failures retain originating Memory/Store
ownership.

After complete authority verification, Memory checks exact private F07
relationship invalidation before retained-standing sufficiency, preserving the
authoritative `POSITIVE`, `NEGATIVE`, and unable-to-determine distinction. The
positive result carries only `sourceAttribution`, `relationshipIdentity`,
`candidatePreparationAssociation`, `determination`, and fresh opaque
`issuerVerification`. The correspondence is frozen, minimized, non-bearer,
and exposes no private capture. Possession or copying does not establish
authority. Verification performs no Store lookup and exposes no Memory
content, private provenance, Store metadata, credentials, lifecycle evidence,
Knowledge PropositionIdentity, ranking, confidence, trace, or reusable
authority material. Governed reconciliation found no applicable M12-IMPL-F05
criterion blocked.

### M12-IMPL-F06 Executable Evidence

Subsequent to REVIEW-0006 architectural approval, validated Memory executable
evidence now satisfies M12-IMPL-F06. Memory recognizes exact privately captured
F03 requests and follows their exact F03/F02 capture chain rather than treating
structural equivalence as authority. Fabricated, cloned, reconstructed, and
same-field requests fail closed. Relationship, source-attribution, Memory
Reference, structured-tuple, relationship-identity, and exact opaque
CandidatePreparationAssociation substitutions also fail closed where
semantically applicable.

The applicable Memory instance owns the private process-local authority state.
Cross-instance and restarted or reconstructed-instance verification fails, and
no Store presence, absence, reconstruction, deletion state, metadata, or public
record recreates that authority. Verification performs public wrapper and shape
validation, exact F03 request recognition, complete F03/F02 captured-chain
verification, and mismatch rejection before consulting exact F07 invalidation
or retained standing. Consequently, material resembling an invalidated
relationship cannot acquire `NEGATIVE` after an authority mismatch.

Possession or copying of `MemorySourceRelationshipIdentity`,
`issuerVerification`, positive correspondence, or another public result is not
bearer authority and cannot independently establish `POSITIVE`, `NEGATIVE`,
relationship issuance, preparation binding, or verification. Authority remains
private, process-local, non-persistent, minimized, and unavailable through a
public capture identifier, reusable token, serialization, logging, or
diagnostic output. Public results expose no Memory content, provenance, Store
metadata, credentials, lifecycle or capture internals, Knowledge
PropositionIdentity, ranking, confidence, or private trace.

Executable failure evidence preserves the governed distinctions: malformed
wrapper, intent, currentness request, or association fails as
`InvalidMemorySourceCurrentnessRequestError`; malformed nested relationship
state fails as `InvalidMemorySourceRelationshipError`; structurally valid but
fabricated, cloned, reconstructed, substituted, wrong-instance, or
restart-invalid authority fails as
`MemorySourceAuthorityVerificationFailureError`; and an exact recognized
request lacking sufficient retained-standing and invalidation evidence fails as
`MemorySourceCurrentnessUnableToDetermineError`. Exact governed F07
invalidation produces `NEGATIVE`, while originating Store and Memory failures
retain their existing identities. Authority mismatch does not collapse into
unable to determine or negative.

Executable traceability includes the focused F02/F03/F05/F07/negative and
existing Memory suites (6 files, 89 tests), the Core suite (23 files, 565
tests), the Memory suite (6 files, 89 tests), and the combined Core and Memory
suites (29 files, 654 tests). Full repository evidence reused from identical
implementation and test hashes comprised 109 files passed, 2 skipped, 1,944
tests passed, and 51 skipped. Memory production and test typechecks, all
repository test TypeScript projects, repository build, ESLint,
repository-pinned Prettier, Dependency Cruiser (152 modules, 289 dependencies,
no violations), the forbidden Core and Memory dependency checks, and
`git diff --check` passed.

This evidence closes only rejection and fail-closed Memory authority behavior
where semantically applicable. It does not close M12-IMPL-F08 through
M12-IMPL-F13 or K13-IMPL-F08, activate Memory 1.2.0, authorize deployment or
production readiness, or make Profile B reachable.

### M12-IMPL-F07 Executable Evidence

Subsequent to REVIEW-0006 architectural approval, validated Memory executable
evidence now satisfies M12-IMPL-F07. Successful governed Forget first validates
the request, exact retained identity, Store deletion, and exact deletion
response; only after completing the Memory-owned transition does it transfer
all exact process-local F02 relationships issued before Forget for that source
into private relationship-scoped invalidation evidence.

For the same exact preparation-bound request, executable behavior is
`POSITIVE` before successful Forget and `NEGATIVE` afterward. All exact
pre-Forget relationships for the forgotten source become negative on a future
valid determination. Unrelated retained relationships remain positive.
Relationships issued after Forget do not inherit the earlier transition and,
without retained standing or applicable invalidation, remain unable to
determine.

Malformed Forget input, invalid or non-retained identity, Store not-found or
unavailability, Store exception, and malformed or contradictory deletion
responses create no invalidation evidence. Store absence and the public Forget
result do not establish negative currentness. Invalidation evidence remains
private, process-local, non-persistent, non-bearer, and unavailable to another
or restarted Memory instance. Previously returned positive results and
correspondence remain frozen and unchanged. This evidence does not close
M12-IMPL-F08 historical Context preservation.

Executable traceability for M12-IMPL-F04, M12-IMPL-F05, and M12-IMPL-F07
includes the focused F02/F03/F05/F07/negative and existing Memory suites (6
files, 89 tests), the Core suite (23 files, 565 tests), the Memory suite (6
files, 89 tests), and the combined Core and Memory suites (29 files, 654
tests). Full repository evidence reused from identical implementation and test
hashes comprised 109 files passed, 2 skipped, 1,944 tests passed, and 51
skipped. Memory production and test typechecks, all repository test TypeScript
projects, repository build, full ESLint, repository-pinned Prettier, Dependency
Cruiser (152 modules, 289 dependencies, no violations), the forbidden Core and
Memory dependency checks, and `git diff --check` passed.

### M12-IMPL-F08 Executable Evidence

Subsequent to REVIEW-0006 architectural approval, validated nonproduction
executable evidence now satisfies M12-IMPL-F08. Memory-owned material is
incorporated into an immutable Active Context Revision before a successful
governed Forget. After Forget, the existing revision and incorporated material
remain frozen and unchanged, while later attempted source use is reconsidered
separately and preserves its originating Memory failure without retroactively
mutating Context.

Context retains exclusive revision-lifecycle and historical-integrity
authority. Memory retains exclusive Forget and Source Currentness authority.
The preserved revision remains historical evidence of what was incorporated
for its reasoning cycle; its preservation does not establish present Source
Currentness, Contextual Currentness, or eligibility for a later preparation.

Executable traceability includes the existing nonproduction Bootstrap
Memory-aware Context integration test that retains and incorporates Memory,
successfully forgets it, proves the incorporated Active revision and nested
material remain frozen and unchanged, proves later Memory retrieval fails, and
proves that failure does not alter the authoritative revision. The reconciled
Memory producer evidence separately establishes that successful Forget is the
governed prospective invalidating transition.

M12-IMPL-F08 does not require the complete Memory-to-Knowledge-to-Context
currentness composition governed by M12-IMPL-F13 and K13-IMPL-F08. It
contributes historical-preservation evidence toward K13-IMPL-F08 but closes
independently. M12-IMPL-F13 and K13-IMPL-F08 remain `OPEN`.

### M12-IMPL-F09 Executable Evidence

Subsequent to REVIEW-0006 architectural approval, validated Memory executable
evidence now satisfies M12-IMPL-F09. Memory constructs closed, minimized, and
frozen relationship, preparation-request, positive-correspondence, negative,
and Forget-result surfaces before they cross the Memory boundary. The negative
result contains exactly `determination`; positive correspondence contains only
the governed preparation-bound fields; and arbitrary or open public fields are
rejected.

Executable prohibited-field assertions demonstrate absence of Memory content,
private provenance, retention and retrieval internals, Store or database
metadata, credentials, lifecycle, capture, and verifier internals, reusable
authority, Knowledge PropositionIdentity, diagnostic correlation, confidence,
ranking, and traces. Forget results expose no invalidation registry, lifecycle
transition identifier, Store deletion receipt, or authority artifact.
Implementation inspection confirms that private authority and invalidation
captures are neither public outputs nor an external filtering responsibility.

### M12-IMPL-F10 Executable Evidence

Subsequent to REVIEW-0006 architectural approval, validated Memory executable
evidence now satisfies M12-IMPL-F10. Possession or copying of a
`MemorySourceRelationshipIdentity`, `issuerVerification`, positive
correspondence, or another public result does not establish relationship
issuance, preparation binding, verification, `POSITIVE`, or `NEGATIVE`.
Caller-minted proofs and caller-selected outcomes are rejected.

Authority remains privately and exactly bound to the reference, relationship,
structured tuple, opaque CandidatePreparationAssociation, and applicable
Memory instance. Cross-instance and restarted or reconstructed instances reject
prior authority. The authority state is process-local and non-persistent; no
reusable token or public capture identifier exists. Store presence, absence,
deletion state, reconstruction, or copied or serialized public material does
not recreate authority, and authority verification performs no Store operation.

### M12-IMPL-F11 Executable Evidence

Subsequent to REVIEW-0006 architectural approval, validated Core and Memory
executable evidence now satisfies M12-IMPL-F11. Core retains four distinct
public Memory 1.2 failures and Memory applies them as follows:

- malformed wrapper, intent, currentness request, or association fails as
  `InvalidMemorySourceCurrentnessRequestError`;
- malformed relationship state fails as
  `InvalidMemorySourceRelationshipError`;
- valid-looking but unauthorized, fabricated, cloned, reconstructed,
  substituted, wrong-instance, or restart-invalid authority fails as
  `MemorySourceAuthorityVerificationFailureError`; and
- an exact recognized request without sufficient retained standing or governed
  invalidation fails as `MemorySourceCurrentnessUnableToDetermineError`.

Exact governed invalidation produces the completed `NEGATIVE` result rather
than a failure. Unable to determine remains distinct from negative; authority
mismatch remains distinct from unable to determine; and malformed structure
remains distinct from authority mismatch. Originating Store and Memory failures
retain their existing identities and are not normalized into the Memory 1.2
currentness failures. No duplicate generic failure taxonomy is introduced.

Executable traceability for M12-IMPL-F09 through M12-IMPL-F11 includes the
focused Memory currentness and lifecycle suites (6 files, 89 tests), the full
Memory suite (6 files, 89 tests), and the combined Core and Memory suites (29
files, 654 tests). Full repository evidence reused from identical committed
hashes comprised 109 files passed, 2 skipped, 1,944 tests passed, and 51
skipped. Memory production and test typechecks, all repository test TypeScript
projects, repository build, ESLint, repository-pinned Prettier, Dependency
Cruiser (152 modules, 289 dependencies, no violations), the forbidden Core and
Memory dependency checks, and `git diff --check` passed.

### M12-IMPL-F12 Executable Evidence

Subsequent to REVIEW-0006 architectural approval, validated executable and
dependency evidence now satisfies M12-IMPL-F12. Core custodies only the closed
records, values, failures, and operation signatures required to express the
boundary; it does not own Memory semantics or runtime determination. Memory
retains source-relationship issuance, Source Currentness, verification,
lifecycle, failure, and minimization authority.

Knowledge consumes opaque completed external-source correspondence without
determining, renewing, reconstructing, or reinterpreting Memory authority.
Context establishes CandidatePreparationAssociation and consumes and preserves
bounded source-currentness correspondence while retaining Contextual
Applicability, Contextual Currentness, exact-one incorporation, revision
lifecycle, and Context authority. Bootstrap remains construction and dependency
injection only. Store and Adapter behavior remains mechanical persistence and
reconstruction only: presence, absence, deletion, metadata, or reconstruction
does not establish Memory authority or Source Currentness.

Memory authority remains private, process-local, non-persistent, minimized,
opaque, and non-bearer. Originating failure ownership is preserved, no semantic
authority transfers among Core, Memory, Knowledge, Context, Bootstrap, or
Store, and CONTRACT-0001 source ownership and candidate-only boundaries remain
unchanged. Executable suites, implementation inspection, and the repository
dependency rules verify the custody and consumer boundaries and prohibit direct
cross-Engine implementation coupling.

The complete Memory-to-Knowledge-to-Context runtime composition is not required
to close this ownership-conformance gate. It was completed and reconciled
separately for M12-IMPL-F13 without closing K13-IMPL-F08.

### M12-IMPL-F13 Executable Evidence

Subsequent to the executable-handoff approval in REVIEW-0006 Addendum A,
validated Slice 1 through Slice 4 evidence now satisfies M12-IMPL-F13. Slice 1
provides neutral `CandidatePreparationAssociation` custody, narrow Memory
capability interfaces, closed `MemoryKnowledgeSourceBinding`, the specialized
Memory external-source prerequisite, exact closed factories, identity
separation, privacy and non-bearer behavior, and Core custody without semantic
ownership.

Slice 2 provides Knowledge-private, process-local, non-persistent capture of
the exact accepted Memory relationship; clone, substitution, tuple, and
preparation-association mismatch rejection; direct consumption of the exact
Memory `POSITIVE` correspondence; a distinct Knowledge-owned
`PropositionIdentity`; and the existing Knowledge-owned projection without
Memory authority reconstruction. Slice 3 provides Context-owned creation of
the exact `CandidatePreparationAssociation`, exact relationship and binding
preservation, Memory bind and verify invocation, positive-correspondence
forwarding, Knowledge projection verification, Contextual Applicability,
exact-one incorporation, immutable Context Revision creation, the existing
no-candidate consequence for Memory `NEGATIVE`, and unchanged propagation of
originating Memory failures.

Slice 4 uses real `MemoryEngine`, `KnowledgeEngine`, and `ContextEngine`
instances in test-local nonproduction composition with existing mechanical
in-memory Stores. The successful executable order is Memory retain, exact
Memory source-relationship issuance, Knowledge acceptance, Context preparation
and exact association creation, Memory preparation binding, Memory `POSITIVE`
verification, delivery of the exact minimized Memory correspondence, Knowledge
projection and verification, Contextual Applicability, exact-one incorporation,
and a frozen Context Revision. Bootstrap only instantiates, injects, delegates,
and composes; it creates no semantic outcome, identity, association,
correspondence, applicability decision, failure normalization, or fallback.

The negative path proves that a pre-Forget exact relationship, after successful
governed Forget and under a fresh preparation, produces the exact completed
Memory `NEGATIVE` result with no positive correspondence, Knowledge projection
or verification, or Context incorporation, while preserving Context's existing
no-candidate consequence. The real post-Forget unable path preserves the
originating `MemorySourceCurrentnessUnableToDetermineError` unchanged, with no
projection, verification, incorporation, or conversion to `NEGATIVE`. A real
foreign-instance relationship preserves the originating
`MemorySourceAuthorityVerificationFailureError` unchanged and performs no
downstream projection or incorporation.

Failure ownership remains exact: invalid currentness requests, invalid
relationships, authority-verification failures, unable-to-determine failures,
and originating Memory Store or lifecycle failures remain Memory-owned;
acceptance, projection, and projection-verification failures remain
Knowledge-owned; applicability, cardinality, no-candidate, and incorporation
failures remain Context-owned; and Bootstrap introduces no semantic failure
taxonomy or generic cross-Engine normalization.

`MemorySourceRelationshipIdentity` remains distinct from
`PropositionIdentity`. Memory owns source-relationship authority, Knowledge
privately captures the exact accepted relationship and allocates its own
proposition identity, Context creates the preparation association, and
Bootstrap creates none of them. Cross-instance authority fails closed and all
public correspondence remains non-bearer.

Executable evidence also verifies that Memory minimization occurs before the
boundary and no public artifact exposes Memory or Knowledge private captures,
invalidation registries, Store or database metadata, credentials, lifecycle
internals, reusable authority tokens, capture identifiers, private Knowledge
acceptance evidence, diagnostics, confidence, ranking, or traces. Store remains
mechanical: no Store-derived Source Currentness, durable authority, authority
persistence schema, or restart reconstruction is introduced.

Validated quality evidence comprises the Slice 1 through Slice 4 focused suites
(4 files, 26 tests), Core (24 files, 572 tests), Memory (6 files, 89 tests),
Knowledge (4 files, 71 tests), Context (13 files, 177 tests), Bootstrap (22
files passed, 1 skipped, 131 tests passed, 13 skipped), combined Core, Memory,
Knowledge, and Context (47 files, 909 tests), and the full repository (113 files
passed, 2 skipped, 1,970 tests passed, 51 skipped). Production build and
typecheck, all 11 test TypeScript projects, repository ESLint,
repository-pinned Prettier, Dependency Cruiser (154 modules, 294 dependencies,
0 violations), forbidden Core, Memory, Knowledge, and Context dependency
checks, and `git diff --check` passed.

REVIEW-0006 approved the semantic architecture and executable boundary but did
not itself close these implementation gates. Subsequent executable evidence
and governed reconciliation established closure readiness, and this direct
specification synchronization records that evidence. A subsequent separate
governed reconciliation established M12-IMPL-F06 closure readiness, and direct
specification synchronization records that evidence. A later separate governed
reconciliation established M12-IMPL-F09 through M12-IMPL-F11 closure readiness,
and this direct synchronization records that evidence without a review addendum
or new review. A later governed reconciliation established M12-IMPL-F08 and
M12-IMPL-F12 closure readiness, and this direct synchronization records that
evidence without a review addendum or new review. REVIEW-0006 itself closed
none of these gates. REVIEW-0006 Addendum A later authorized the bounded
executable handoff but likewise did not close M12-IMPL-F13. Subsequent Slice 1
through Slice 4 implementation and full governed reconciliation established
M12-IMPL-F13 closure readiness, and this direct synchronization records that
evidence without an additional review. K13-IMPL-F08 remains `OPEN`; no K13 PASS
may be inferred.

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
MemoryReference becomes source-current merely because this revision was drafted
or activated.

Existing retained Memory has no fabricated source relationship or currentness
authority. Where required relationship evidence does not exist, an otherwise
valid determination is unable to determine; implementations MUST NOT infer or
backfill positive currentness from Store state.

No persistence migration, production data migration, automatic relationship
issuance, or authority reconstruction is authorized here.

## Review and Activation Gates

[REVIEW-0006](../../../docs/architecture-review/REVIEW-0006-Memory-Engine-Source-Currentness-and-Reference-Authority.md)
approved the Memory Engine 1.2.0 semantic architecture and executable
boundaries through the governed repository review path. Memory 1.2.0 is now
Active and supersedes Memory 1.1.0. REVIEW-0006 did not close
an implementation gate; subsequent validated executable evidence now satisfies
M12-IMPL-F01 through M12-IMPL-F13. Addendum A authorized the bounded
M12-IMPL-F13 handoff but did not itself supply executable evidence or close the
gate. The separately reconciled Slice 1 through Slice 4 evidence established
closure readiness. K13-IMPL-F08 remains OPEN, and no additional review was
required for this direct evidence synchronization.

REVIEW-0006 does not by itself activate Memory 1.2.0, authorize implementation
or production composition, establish runtime or implementation completeness,
confer deployment or production authority, make production Profile B
reachable, or close K13-IMPL-F08.

All applicable repository review, conformance, and lifecycle prerequisites for
Memory 1.2.0 activation have been completed. This lifecycle activation does not
authorize deployment, production composition, or production Profile B
reachability.

## K13-IMPL-F08 Relationship

The human decision and this Active revision govern the source selection,
Memory Source Currentness ownership, three-way outcome distinction,
preparation binding, forgetting-based invalidation principle, and authority and
opacity allocation at the specification level.

M12-IMPL-F13 completion contributes Memory producer integration, Knowledge
external-source integration, Context integration, nonproduction Bootstrap
composition, and nonproduction Memory-to-Knowledge-to-Context end-to-end
evidence toward `K13-IMPL-F08`.

`K13-IMPL-F08` is `PASS` under Rodrigo Lozano's separate human
single-maintainer decision dated 2026-09-06, supported by REVIEW-0007 Active
1.0.2 and its [follow-up governance checkpoint](../../../docs/architecture-review/REVIEW-0007-K13-F08-Production-Authorization-for-Fixed-Profile-B.md#follow-up-governance-checkpoint).
The [canonical Knowledge disposition](../knowledge/ENGINE-0005-Knowledge-Engine-Executable-Projection-Operation.md#f08-human-pass-and-governed-reconciliation-2026-09-06)
records 20 mandatory requirements passed, zero failed or unknown, no waiver,
and no unsupported evidence reclassification. The bounded production
composition, reachability, and authoritative Active Profile B endpoint were
exercised in tests. Brain and Reasoning are not required for that endpoint.
Deployment was not required, was not performed, and remains NOT AUTHORIZED.

Memory specification activation did not close F08. All M12 dispositions and
historical F13 NONPRODUCTION evidence remain unchanged. Earlier OPEN statements
in the dated implementation evidence and history retain their checkpoint
meaning. Document 1.2.11 applies OES-0010's editorial PATCH rule solely to this
current cross-reference synchronization; Memory Engine 1.2.0 semantics,
authority, and lifecycle remain unchanged.

Production Profile B reachability and deployment remain separately governed and
are not advanced by this specification lifecycle activation.

## Related Documents

- [Superseded Memory Engine 1.1.0](ENGINE-0004-Memory-Engine-Revision-1.1.0.md)
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

| Document Version | Date       | Description                                                                                                                                                                                                                                                                                                                                                                                                                             |
| ---------------- | ---------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1.2.0            | 2026-08-31 | Drafted additive Memory-issued source-proposition relationship, preparation-specific Source Currentness, Memory authority verification, prospective forgetting invalidation, privacy, failure, ownership, and open conformance gates; Memory 1.1.0 remains Active.                                                                                                                                                                      |
| 1.2.1            | 2026-08-31 | Recorded focused governed approval through REVIEW-0006 while preserving Draft status, Active Memory 1.1.0, all M12 gates OPEN, K13-IMPL-F08 OPEN, and no implementation or activation authority.                                                                                                                                                                                                                                        |
| 1.2.2            | 2026-08-31 | Synchronized M12-IMPL-F01 to PASS from validated executable Core custody evidence under REVIEW-0006 architectural approval; M12-IMPL-F02 through F13 and K13-IMPL-F08 remain OPEN, Draft status and Active Memory 1.1.0 are preserved, and no later implementation is claimed.                                                                                                                                                          |
| 1.2.3            | 2026-08-31 | Synchronized M12-IMPL-F02 to PASS from validated Memory relationship-issuance and exact reference/tuple binding evidence under REVIEW-0006 architectural approval; F01 remains PASS, F03 through F13 and K13-IMPL-F08 remain OPEN, Draft status and Active Memory 1.1.0 are preserved.                                                                                                                                                  |
| 1.2.4            | 2026-08-31 | Synchronized M12-IMPL-F03 to PASS from validated opaque preparation-binding evidence under REVIEW-0006 architectural approval; F01 and F02 remain PASS, F04 through F13 and K13-IMPL-F08 remain OPEN, Draft status and Active Memory 1.1.0 are preserved, and no activation or production authority is granted.                                                                                                                         |
| 1.2.5            | 2026-09-01 | Synchronized M12-IMPL-F04, M12-IMPL-F05, and M12-IMPL-F07 to PASS from validated three-outcome behavior, exact Memory authority verification, and successful-Forget prospective invalidation evidence while preserving REVIEW-0006 approval; F06 and F08-F13 remain OPEN, K13-IMPL-F08 remains OPEN, Memory 1.2.0 remains Draft, and Active Memory 1.1.0 remains authoritative.                                                         |
| 1.2.6            | 2026-09-01 | Synchronized M12-IMPL-F06 from OPEN to PASS from reconciled exact-authority and fail-closed executable evidence; F01-F05 and F07 remain PASS, F08-F13 and K13-IMPL-F08 remain OPEN, Memory 1.2.0 remains Draft, Active Memory 1.1.0 remains authoritative, and no activation, deployment, production-readiness, or Profile B authority is granted.                                                                                      |
| 1.2.7            | 2026-09-01 | Synchronized M12-IMPL-F09, M12-IMPL-F10, and M12-IMPL-F11 from OPEN to PASS from reconciled privacy/minimization, non-bearer non-persistent authority, and exact failure-identity evidence; F01-F07 remain PASS, F08 and F12-F13 remain OPEN, K13-IMPL-F08 remains OPEN, Memory 1.2.0 remains Draft, Active Memory 1.1.0 remains authoritative, and no activation, deployment, production-readiness, or Profile B authority is granted. |
| 1.2.8            | 2026-09-01 | Synchronized M12-IMPL-F08 and M12-IMPL-F12 from OPEN to PASS from reconciled historical Context preservation and cross-Engine ownership-conformance evidence; F01-F12 are PASS, F13 and K13-IMPL-F08 remain OPEN, Memory 1.2.0 remains Draft, Active Memory 1.1.0 remains authoritative, and no activation, deployment, production-readiness, or Profile B authority is granted.                                                        |
| 1.2.9            | 2026-09-01 | Synchronized M12-IMPL-F13 from OPEN to PASS from reconciled nonproduction Memory-to-Knowledge-to-Context end-to-end evidence; F01-F13 are PASS, K13-IMPL-F08 remains OPEN, Memory 1.2.0 remains Draft, Active Memory 1.1.0 remains authoritative, and no activation, deployment, production-readiness, or Profile B authority is granted.                                                                                               |
| 1.2.10           | 2026-09-02 | Activated Memory Engine 1.2.0 as the sole current canonical ENGINE-0004 revision and superseded Memory 1.1.0 after REVIEW-0006 approval and M12-IMPL-F01 through F13 executable conformance; K13-IMPL-F08 remains OPEN, and no production Bootstrap, Profile B reachability, deployment, Reasoning, or Brain production authority is granted.                                                                                           |
| 1.2.11 | 2026-09-06 | Synchronized the current F08 cross-reference to Rodrigo Lozano's separately governed PASS; preserved all M12 dispositions, historical NONPRODUCTION evidence, Memory semantics and lifecycle, and deployment exclusion. |

## Engineering Motto

> Memory verifies its own relationships. Currentness is preparation-specific, authority-bound, and never inferred from storage.
