# Knowledge Engine Executable Projection Operation

| Field                         | Value                                                                                                         |
| ----------------------------- | ------------------------------------------------------------------------------------------------------------- |
| **Status**                    | Draft                                                                                                         |
| **Document Version**          | 1.1.3                                                                                                         |
| **Engine**                    | ENGINE-0005 — Knowledge Engine                                                                                |
| **Governing Engine Revision** | Active Knowledge Engine 3.0.0                                                                                 |
| **Owner**                     | Project Maintainers                                                                                           |
| **Created**                   | 2026-08-17                                                                                                    |
| **Updated**                   | 2026-08-31                                                                                                    |
| **Applies To**                | Knowledge Engine 3.0.0 structured textual projection operation and preparation-cycle Source Currentness input |

---

## Document Authority and Lifecycle

This document is a subordinate executable semantic refinement of the Active
Knowledge Engine 3.0.0 revision. `1.1.3` is this document's version; it is not
an ENGINE-0005 Engine revision.

This document:

- has no independent Engine lifecycle or runtime authority;
- does not supersede Knowledge Engine 3.0.0;
- does not alter the Active status of Knowledge Engine 3.0.0 or make this projection specification implementation-complete; and
- becomes authoritative only through the applicable repository governance and acceptance
  lifecycle and applicable repository governance.

If this document conflicts with the governing Knowledge Engine 3.0.0 specification,
the governing Engine specification prevails.

## Purpose

This specification closes two executable boundaries deliberately deferred by
Knowledge Engine 3.0.0:

1. the operation that issues one privacy-minimal structured textual
   projection; and
2. the input boundary by which completed preparation-cycle Source Currentness
   correspondence participates in projection eligibility.

It does not define Core syntax, runtime classes, persistence, Context
implementation, diagnostic implementation, tests, serialization, or
production Profile B reachability.

## Scope

This specification defines only:

- one distinct Knowledge-owned projection operation;
- its exact target and preparation-prerequisite semantics;
- its successful result and governed failure boundary;
- Knowledge projection-authority issuance;
- the Knowledge-owned verifier request and proof boundary; and
- one Knowledge-owned, privacy-minimal projection diagnostic observer
  boundary.

All Knowledge Engine 3.0.0 structured-acceptance, tuple-validity, proposition-identity,
projection-eligibility, privacy, ownership, and failure semantics remain
unchanged.

## Operation Decision

Knowledge Engine 3.0.0 preserves the Knowledge-owned structured textual projection
operation alongside the existing Get Knowledge operation.

The projection operation is not:

- an extension or mode of Get Knowledge;
- a general retrieval operation;
- a list operation;
- a Context operation;
- a query or search operation; or
- a source-currentness verifier.

This separation is required because Get Knowledge returns the existing complete
Knowledge record/reference result, while the new operation returns only bounded
candidate material and opaque correspondence for Context preparation.

## Get Knowledge Preservation

Get Knowledge remains unchanged. It continues to:

- accept its existing Knowledge-identity request;
- return the existing complete Knowledge record and Knowledge reference;
- preserve current Knowledge 1.2.0 retrieval, reference, lifecycle, and failure
  behavior; and
- require no expected-version, structured-projection, currentness, or verifier
  input.

Existing Evaluate Knowledge Claim, Get Knowledge, List Knowledge References,
Knowledge Store, and claim-only callers require no migration merely because the
projection operation exists.

## Projection Operation Responsibility

The projection operation owns exactly these responsibilities:

1. validate one exact projection request;
2. target one exact accepted Knowledge item;
3. evaluate the Knowledge Engine 3.0.0 projection-eligibility predicate;
4. consume or establish the applicable preparation-cycle Source Currentness
   prerequisite under the closed ownership cases below;
5. construct exactly one structured textual projection when eligible;
6. preserve required opaque governed correspondence;
7. capture Knowledge-owned projection authority; and
8. return the exact issued projection.

It MUST NOT perform Contextual Applicability, Context incorporation, query
applicability, Reasoning sufficiency, latest selection, ranking, search,
fallback, alternative retrieval, synthesis, or multi-proposition selection.

## Projection Request

One projection request consists of two semantically distinct parts:

```text
projection request
= exact target
+ preparation prerequisites
```

The target identifies what accepted Knowledge item is requested. Preparation
prerequisites establish whether that exact item may issue a projection for the
current preparation invocation. A prerequisite is never a target coordinate.

Preparation prerequisites contain:

- one candidate-preparation association;
- one currentness-ownership case; and
- exactly one completed external Source Currentness correspondence when the
  applicable owner is external to Knowledge.

The request defines no query, profile, Context revision, Reasoning request,
proposition-identity target, latest flag, fallback instruction, provenance
input, authority token, or generic selection instruction.

## Candidate-Preparation Association

Every projection request contains one opaque candidate-preparation association
owned and established by Context preparation under CONTRACT-0001.

The association exists only to correlate all source-specific work participating
in one Context-owned candidate-preparation cycle. It is not Knowledge identity,
proposition identity, source identity, currentness authority, Context Revision
identity, authorization, provenance, or a projection target coordinate.

Context preparation MUST establish the association before any participating
source is asked to issue preparation-specific candidate material, authority
correspondence, or Source Currentness correspondence. The valid semantic
sequence is:

```text
Context begins one candidate-preparation cycle
→ Context establishes one opaque candidate-preparation association
→ every participating source request for that cycle carries that association
→ source-owned candidate/currentness material binds the same association
→ the Knowledge projection request carries the same association
→ Knowledge binds the issued projection to that association
→ Context preserves the association through incorporation and authority where required
```

An external source MUST NOT issue preparation-specific currentness first and
rely on a later Knowledge-local operation to create the association. Knowledge
MUST NOT invent, replace, normalize, or reinterpret the association.

The association has these closed semantic invariants:

- it is opaque to Knowledge and every participating source;
- it is immutable for the candidate-preparation cycle;
- exact equality is the only permitted comparison;
- it is scoped to one Context-owned candidate-preparation cycle;
- one cycle may use it across one or more source-specialization requests in
  that same preparation;
- two distinct preparation cycles within the applicable process/composition
  authority scope MUST NOT share the same association value; and
- it MUST NOT be reused as evidence or correlation for another preparation
  cycle.

The association creates no global registry, searchable identifier space,
cross-process lifetime, source-selection mechanism, or semantic owner. UUIDs,
integers, timestamps, random bytes, hashes, database keys, cryptographic tokens,
and synchronization primitives remain implementation mechanics and are not
prescribed.

## Exact Projection Target

The exact target contains only:

- one exact Knowledge identity; and
- one exact expected Knowledge version.

Together they identify one accepted Knowledge item version. The operation MUST
NOT substitute another version, resolve latest, follow supersession, select by
proposition identity, or infer caller intent.

Proposition identity, Accepted-state correspondence, attribution, issuance
state, and preserved source correspondence are internal eligibility and
authority checks. They are not caller-supplied target coordinates.

## Preparation Prerequisites

Preparation prerequisites carry only invocation-scoped material needed to
evaluate projection eligibility for the exact target. They do not alter the
target and do not become accepted Knowledge state.

The prerequisite shape always contains the candidate-preparation association
and one closed ownership choice:

- `knowledge-owned-currentness`; or
- `external-source-currentness` with one completed governed Source Currentness
  correspondence.

No omitted, unknown, combined, inferred, or open-ended ownership case is
supported. The selected case MUST correspond to the applicable Source
Currentness owner already bound to the exact accepted proposition/source
relationship.

## Knowledge-Owned Currentness Case

When Knowledge is the applicable Source Currentness owner, the request selects
the `knowledge-owned-currentness` prerequisite case and supplies no external
currentness correspondence.

Knowledge establishes its own preparation-cycle prerequisite internally under
Active ADR-0021 for the exact candidate-preparation association carried by the
request. It MUST NOT require a caller to issue a redundant Knowledge-to-
Knowledge currentness proof.

The determination evaluates these exact facts anew for each preparation:

- Knowledge identity and expected version;
- accepted structured proposition and PropositionIdentity;
- accepted `knowledge-owned-currentness` correspondence;
- lifecycle standing recorded by the applicable Knowledge authority; and
- candidate-preparation association.

Its closed outcomes are:

- **POSITIVE** — the exact record is known, the expected version matches, the
  record remains Accepted and structurally valid, its exact proposition remains
  bound, Knowledge is the accepted currentness owner, and the exact
  identity/version remains current in Knowledge's governed lifecycle without
  supersession or another existing non-current lifecycle transition;
- **NEGATIVE** — the exact confirmed and structurally valid accepted
  proposition is no longer current under existing Knowledge lifecycle
  semantics; or
- **UNABLE_TO_DETERMINE** — Knowledge cannot establish the required
  authoritative lifecycle facts because source state, lifecycle standing, or
  required identity/version/proposition correspondence is unavailable,
  malformed, or inconsistent.

Every determination result binds its outcome to the exact Knowledge
identity/version, exact PropositionIdentity and accepted proposition, and exact
candidate-preparation association. Only POSITIVE supplies the satisfied
currentness prerequisite carried into an issued projection.

POSITIVE is a completed Knowledge-owned Source Currentness correspondence bound
to the exact Knowledge identity/version, PropositionIdentity and proposition,
and candidate-preparation association. Projection eligibility may continue only
for that preparation. NEGATIVE is also a completed determination, not an
operational failure; it makes projection ineligible and no projection is
issued. UNABLE_TO_DETERMINE is a Knowledge-owned inability or failure to
establish the prerequisite and no projection is issued.

Accepted state, version, PropositionIdentity, retrieval, possession, previous
projection or preparation, previous Context incorporation, projection issuance,
and verifier success do not independently establish this prerequisite. No TTL,
timestamp freshness, latest lookup, replacement selection, cache freshness,
refresh, or durable currentness token is authorized.

## External-Source Currentness Case

When another qualified or original source is the applicable Source Currentness
owner, the request selects the `external-source-currentness` prerequisite case
and MUST carry exactly one completed governed correspondence issued under that
owner's authority and bound to the request's exact candidate-preparation
association.

The correspondence must already establish, under its source-owned authority:

- the applicable source owner;
- the exact candidate-preparation association received by the source before
  issuance;
- completion of the positive Source Currentness determination for the
  preparation cycle identified by that association;
- binding to the exact source relationship on which the targeted accepted
  proposition depends; and
- completed issuer-verification correspondence under the source-owned
  verification boundary.

Knowledge may validate only that the correspondence:

- is present in the external-source case;
- is structurally admissible governed correspondence;
- names or binds the applicable owner already associated with the exact
  accepted proposition/source relationship;
- carries a candidate-preparation association exactly equal to the association
  in the projection request; and
- is preserved unchanged in the issued projection correspondence.

Knowledge MUST NOT semantically re-evaluate, renew, replace, translate, infer,
or reconstruct the external determination. It MUST NOT invoke an unstated
source verifier, generic Currentness service, latest lookup, refresh, or
recollection.

## Source Currentness Correspondence

Knowledge-owned positive correspondence and external-source positive
correspondence are distinct closed preparation results under their respective
owners. Both bind the exact candidate-preparation association and exact
accepted proposition relationship for which the determination completed.

The Knowledge-owned positive correspondence minimally records Knowledge as
owner, the exact Knowledge identity/version and PropositionIdentity/proposition
correspondence, the exact candidate-preparation association, and completion of
the positive determination. It is opaque outside Knowledge, is not rule-visible,
and is not persisted as accepted state or a durable/global token.

The external correspondence is an opaque governed completed fact, not a raw
currentness value or evidence container. Its minimum semantics are:

| Semantic fact                       | Requirement                                                                                                             |
| ----------------------------------- | ----------------------------------------------------------------------------------------------------------------------- |
| Applicable owner correspondence     | Identifies the already-governed source owner of the determination                                                       |
| Candidate-preparation association   | Carries the exact opaque association established by Context before the source issued the determination                  |
| Accepted proposition/source binding | Binds the determination to the exact source relationship on which the targeted proposition depends                      |
| Completed positive determination    | Establishes source-owned eligibility for this preparation invocation                                                    |
| Issuer-verification correspondence  | Establishes that the applicable source-owned verification boundary completed before Knowledge receives the prerequisite |

The correspondence MUST NOT expose raw authority evidence, currentness
internals, source credentials, provenance records, timestamps as implicit TTLs,
or a reusable bearer token. This specification defines no serialization,
signature, hash, global identifier, or cryptographic representation.

The candidate-preparation association supplies preparation scope. No global
preparation registry or independently searchable preparation-cycle identifier
is created. It remains opaque correlation material and MUST NOT become a target,
lookup coordinate, source identity, authority proof, or currentness value.

## Same-Preparation and Replay Rule

A completed Knowledge-owned or external Source Currentness correspondence
satisfies its preparation prerequisite only when its candidate-preparation
association exactly equals the projection request association. For the
external case:

```text
correspondence candidate-preparation association
= projection-request candidate-preparation association
```

and every existing applicable-owner, proposition/source-relationship,
completion, and issuer-verification correspondence requirement also matches.

A correspondence or result established for preparation association A MUST NOT
satisfy a projection request carrying preparation association B. Historical,
acceptance-time, previous-cycle, concurrent-cycle, substituted-association, and
otherwise replayed correspondence MUST NOT establish the prerequisite.

Knowledge may check only exact association equality, applicable-owner
correspondence, proposition/source binding, structural completeness, and exact
unchanged preservation. These checks do not semantically re-evaluate Source
Currentness.

Participating sources receive the association as opaque preparation-request
correlation, bind their returned candidate/currentness correspondence to it,
and preserve it exactly. They do not interpret it, allocate it, register it, or
acquire Context preparation ownership.

Use of a correctly issued correspondence from preparation A in a request for
preparation B is a Knowledge-owned projection-prerequisite mismatch and no
projection is issued. The external source's original currentness determination
remains valid, if otherwise valid, only for preparation A; the mismatch does
not reclassify that source determination as failed.

The association is preparation-scoped correspondence only. It does not alter or
become part of accepted Knowledge state, persist as present currentness, mutate
an Active or historical Context Revision, invalidate historical evidence, or
establish latest/currentness status for a later preparation.

## CONTRACT-0001 Boundary

`CONTRACT_0001_SUFFICIENT`

Context remains the semantic owner of source-directed preparation and the
consumer of candidate material. Knowledge remains the participating source that
interprets the exact projection request and returns Knowledge-owned candidate
material. Completed external Source Currentness correspondence travels as
source-owned preparation prerequisite material within the already-governed
candidate-preparation flow.

The candidate-preparation association in this specification is the executable
specialization of CONTRACT-0001's already-authorized Context-owned
candidate-preparation association. Context establishes it; sources receive and
preserve it without interpreting it; Knowledge consumes and preserves it for
same-preparation binding. This correlation does not transfer currentness,
source-authority, Knowledge, verification, or incorporation ownership.

This operation introduces no new retrieval collaboration, source selection,
query transport, generic currentness service, authority-verification exchange,
or Contract identity. It does not expand CONTRACT-0001 and requires no
CONTRACT-0002.

## Projection Result

The only successful operation result is the exact Knowledge-issued structured
textual projection.

Its rule-visible semantic material is exactly:

- `subjectKey`;
- `predicateKey`; and
- `textualScalar`.

Its opaque authority/correspondence material is limited to:

- exact Knowledge identity and version correspondence;
- exact candidate-preparation association;
- exact proposition identity correspondence;
- exact Accepted-state correspondence;
- the closed Knowledge capability attribution
  `authoritativeCapability = knowledge`;
- Knowledge issuance correspondence as a view/reference to the same
  projection-authority capture;
- preserved applicable underlying-source authority correspondence; and
- preserved applicable Source Currentness correspondence for this preparation
  invocation.

The Knowledge capability attribution means only that the exact accepted
proposition is authoritative Knowledge material issued and owned within the
Knowledge capability. It is not original-source attribution, present
currentness, source authority, Context authority, Reasoning correctness, or
authorization. The operation creates no attribution identity, allocator,
token, registry, or caller-supplied attribution.

The result MUST NOT expose CandidateClaim, KnowledgeRecord, acceptance
evidence, raw provenance, Store metadata, source internals, raw verifier
evidence, currentness internals, authority-capture internals, credentials,
ranking, confidence, or retrieval handles.

## Closed Cardinality

The operation has closed cardinality:

```text
eligible exact target
→ exactly one authoritative projection

invalid, absent, mismatched, malformed, or ineligible target/prerequisite
→ governed failure and no projection
```

Zero is represented by a governed failure, never by `undefined`, `null`, an
empty list, a partial projection, or a non-authoritative candidate. The
operation never returns multiple projections.

## Projection Authority Issuance

Knowledge captures projection authority only after:

1. exact target validation;
2. candidate-preparation association validation;
3. exact Accepted-state and proposition correspondence validation;
4. complete structured-projection eligibility validation;
5. satisfaction of the applicable preparation-currentness case;
6. same-preparation validation and replay rejection;
7. preservation of required opaque correspondence for the applicable
   currentness branch; and
8. construction of the exact immutable projection snapshot.

One process-local Knowledge projection-authority capture is the sole authority
mechanism for projection issuance and verification. The opaque Knowledge
issuance correspondence is a view/reference to that same capture; it is not an
independently mintable bearer token and has no authority apart from the exact
captured projection.

Authority binds the same Knowledge authority instance to:

- the exact issued projection object/value;
- the exact candidate-preparation association;
- the exact Knowledge identity and version;
- the exact proposition identity;
- the exact tuple snapshot;
- the exact accepted source-ownership correspondence;
- the applicable preparation-cycle currentness correspondence;
- the closed Knowledge capability attribution; and
- the applicable preserved underlying-source authority correspondence.

Structural equality does not establish authority. No independent authority
token, signature, hash, cryptographic format, global registry, or persistence
mechanism is defined here.

## Projection Verifier Request

The Knowledge-owned projection verifier consumes exactly:

- the closed verification intent; and
- the exact candidate projection purportedly issued by that Knowledge
  authority instance.

The verifier requires no caller-supplied Knowledge record, target, proposition
identity, source evidence, currentness token, expected-field list, or separate
authority token. Those facts are captured internally at issuance and checked
against the candidate and its immutable snapshot.

Successful verification returns the exact candidate projection. A clone,
reconstruction, substitution, mutation, projection from another operation, or
projection from another Knowledge authority instance fails verification even
when structurally equal.

## Verifier Proof Boundary

Successful Knowledge projection verification proves only:

- Knowledge issued the exact projection;
- issuance integrity and immutable snapshot correspondence;
- exact candidate-preparation-association correspondence;
- exact Knowledge identity/version and Accepted-state correspondence;
- exact proposition identity and tuple correspondence;
- the closed Knowledge capability attribution; and
- exact preservation and binding of the applicable preparation-currentness and
  underlying-source correspondence.

It does not prove:

- underlying-source authority validity owned by another source;
- Source Currentness semantics owned by another source;
- perpetual or later currentness;
- Context structural validity, Contextual Applicability, incorporation,
  lifecycle, or authority;
- Reasoning applicability or sufficiency;
- Planning or Brain correctness;
- response correctness;
- Skill intent or execution; or
- Security authorization.

Proving exact preservation of external correspondence does not transfer its
semantic authority to Knowledge.

## Failure Semantics

The operation-level failure model is closed by originating responsibility.

| Condition                                                                                          | Originating owner                                                                                                      | Projection consequence                                                           |
| -------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------- |
| Malformed request or target                                                                        | Knowledge                                                                                                              | Reject request; issue no projection                                              |
| Knowledge identity absent                                                                          | Knowledge                                                                                                              | Exact target not found; issue no projection                                      |
| Expected Knowledge version mismatch                                                                | Knowledge                                                                                                              | Reject stale/mismatched target; issue no projection                              |
| Claim-only or otherwise projection-ineligible accepted item                                        | Knowledge                                                                                                              | Projection-ineligible failure; underlying Accepted item remains valid            |
| Invalid stored structured proposition or correspondence                                            | Knowledge                                                                                                              | Invalid Knowledge state; issue no projection                                     |
| Completed negative Knowledge-owned currentness determination                                       | Knowledge                                                                                                              | Projection is ineligible for that preparation; issue no projection               |
| Unable to determine Knowledge-owned currentness                                                    | Knowledge                                                                                                              | Prerequisite failure/inability; issue no projection                              |
| Missing or contradictory Knowledge capability attribution                                          | Knowledge                                                                                                              | Projection construction or correspondence failure; issue no projection           |
| Candidate-preparation association missing or malformed in the projection request                   | Context-owned preparation/request defect; Knowledge owns only boundary rejection                                       | Reject the projection prerequisite; issue no projection                          |
| External correspondence association substituted, reused, or different from the request association | Knowledge-owned projection-prerequisite mismatch; original source determination retains its original ownership         | Preserve the original determination for its own preparation; issue no projection |
| Missing external completed currentness correspondence                                              | Applicable external source for originating prerequisite; Knowledge owns only request rejection/no-issuance consequence | Preserve originating failure identity; issue no projection                       |
| Failed or ineligible external Source Currentness                                                   | Applicable external source                                                                                             | Preserve originating failure identity; issue no projection                       |
| Underlying-source authority failure                                                                | Applicable underlying source                                                                                           | Preserve originating failure identity; issue no projection                       |
| Projection construction or issuance failure                                                        | Knowledge                                                                                                              | Issue no projection                                                              |
| Malformed verifier request                                                                         | Knowledge                                                                                                              | Reject verification request                                                      |
| Candidate not issued by this authority instance or correspondence mismatch                         | Knowledge                                                                                                              | Projection verification failure                                                  |
| Corrupt verifier state                                                                             | Knowledge                                                                                                              | Invalid Knowledge authority state                                                |

Knowledge MUST NOT wrap, translate, or reclassify an external source failure as
a Knowledge semantic failure. Its separate operational consequence is only
that no projection is issued for this preparation invocation.

## Context Boundary

Future Context preparation uses the operation semantically as follows:

```text
Context-owned source preparation
→ exact Knowledge projection request
→ Knowledge-owned projection operation
→ exact Knowledge-issued projection
→ Knowledge-owned projection verifier
→ verified candidate material
→ Context-owned structural prerequisites and Contextual Applicability
→ Context-owned exact-one incorporation and authority
```

Context supplies or carries preparation prerequisites without becoming their
semantic issuer. It MUST invoke the Knowledge-owned verifier before successful
incorporation. Context does not receive CandidateClaim, KnowledgeRecord,
acceptance evidence, raw currentness evidence, or verifier internals.

Future Context preparation establishes the candidate-preparation association
before participating-source work, supplies the same association through each
applicable source-specialization request, and preserves it through Context
authority where required. This is semantic correspondence only and does not
define Context runtime control flow or close the existing Context runtime gap.

This specification does not implement Context and does not change Context
5.0.1 semantics.

## Bootstrap Boundary

Bootstrap may later compose the concrete Knowledge implementation, projection
operation, Knowledge verifier, and Context-facing source preparation adapter.
Bootstrap owns wiring only. It does not own projection eligibility,
currentness, source authority, Contextual Applicability, or verification
semantics.

Bootstrap MAY select and inject a projection diagnostic observer, compose no
observer, or compose a no-op observer. It MAY adapt an already-minimized
Knowledge projection observation to an operational transport. Bootstrap MUST
NOT decide when Knowledge emits an observation, define or reinterpret its
closed vocabulary, inspect protected projection state for diagnostic purposes,
or acquire Knowledge diagnostic semantic authority through composition.

## Projection Diagnostic Observer Boundary

Knowledge owns projection diagnostic semantics, the closed observation
vocabulary, emission timing, failure-identity preservation, and construction
of each privacy-minimal observation. Core MAY custody the future executable
observation record and observer function or interface signature without
acquiring Knowledge semantic authority. Bootstrap MAY inject an observer or
transport adapter without acquiring Knowledge diagnostic semantics.

The observer is synchronous, operational, optional, non-authoritative, and
non-persistent by semantic definition. It is not required for projection
correctness and is not a semantic Event, audit record, authority artifact,
projection result, reusable capability, or bearer token. Knowledge projection
MUST remain fully functional when no observer is composed. An absent or no-op
observer is permitted.

### Closed Observation Vocabulary and Record

The closed semantic record is exactly one of:

```text
{
  operation: "knowledge-executable-projection",
  outcome: "succeeded"
}

{
  operation: "knowledge-executable-projection",
  outcome: "failed",
  failureIdentity: ExistingPublicKnowledgeProjectionFailureIdentity
}
```

`ExistingPublicKnowledgeProjectionFailureIdentity` is not an arbitrary string
or a second failure taxonomy. It is the closed set of existing public
Knowledge error identities applicable to the projection and verifier failure
semantics in this specification:

- `InvalidKnowledgeProjectionRequestError`;
- `KnowledgeNotFoundError`;
- `KnowledgeProjectionVersionMismatchError`;
- `KnowledgeProjectionIneligibleError`;
- `KnowledgeProjectionPreparationMismatchError`;
- `KnowledgeSourceCurrentnessUnableToDetermineError`;
- `KnowledgeProjectionConstructionError`;
- `KnowledgeProjectionIssuanceError`;
- `InvalidKnowledgeProjectionVerificationRequestError`;
- `KnowledgeProjectionAuthorityVerificationError`; and
- `InvalidKnowledgeStateError`.

The success observation states only that authoritative projection completion
occurred. A failure observation preserves the exact applicable public
Knowledge failure identity. It MUST NOT carry an exception object, native
message, cause, stack, verifier state, authority state, or normalized duplicate
failure category. External-source-originating failures retain their originating
identity and opacity; Knowledge MUST NOT relabel them as Knowledge-owned
failures or manufacture an unavailable external producer for diagnostic use.

The record has no correlation field, arbitrary attributes, or free-form
semantic message. Knowledge identity, expected Knowledge version, and the
projected tuple are omitted.

### Diagnostic Privacy and Minimization

Knowledge MUST enforce privacy and minimization while constructing the closed
observation, before observer invocation, Bootstrap handling,
`StructuredLogger` adaptation, transport, or aggregation. Transport filtering
is not the authoritative privacy boundary. Bootstrap MUST NOT receive protected
material and then remove it.

The diagnostic record MUST NOT expose:

- CandidateClaim or KnowledgeRecord;
- `subjectKey`, `predicateKey`, or `textualScalar`;
- raw provenance, Store metadata, or acceptance evidence;
- credentials or raw currentness evidence;
- verifier internals or authority-capture internals;
- confidence, ranking, or private traces;
- reusable authority material or projection-authority correspondence;
- underlying-source authority evidence or raw source evidence; or
- CandidatePreparationAssociation.

CandidatePreparationAssociation remains opaque Context-owned preparation
correspondence. It MUST NOT be repurposed as a diagnostic correlation
identifier. This specification defines no replacement correlation identifier.

### Diagnostic Emission and Failure Containment

Knowledge emits the success observation only after authoritative projection
completion. When the projection or its Knowledge-owned verifier boundary
terminates with an applicable governed public Knowledge failure identity,
Knowledge emits the corresponding failure observation only after that
authoritative failure determination.

Observation MUST NOT precede or alter the authoritative semantic
determination, create or alter projection authority, alter result cardinality
or failure ownership, replace the returned projection or governed failure, or
trigger retry, fallback, latest lookup, version substitution, retrieval,
reconstruction, or reverification.

Observer failure is operational and contained. It MUST NOT change successful
projection into failure, replace a governed Knowledge failure, change failure
identity, alter projection authority or currentness, alter Contextual
Applicability, cause retry or fallback, or escape as the authoritative
operation result. No recovery subsystem, queue, or persistent observer history
is defined.

### Operational Transport and Aggregation

`StructuredLogger` is not the Knowledge semantic diagnostic boundary and is
not required as a Knowledge runtime dependency. A Bootstrap-owned adapter MAY
translate an already-minimized closed Knowledge observation into a
`StructuredLogger` record. Translation MUST preserve the closed observation
semantics and MUST NOT add protected Knowledge material, reconstruct omitted
fields, reinterpret failure identity, or acquire semantic authority.

`DiagnosticResult` is not the per-operation projection diagnostic boundary.
Bootstrap MAY later aggregate conformance or readiness evidence derived from a
governed diagnostic demonstration, but aggregation does not transfer
projection diagnostic semantics to Bootstrap and does not authorize redesign
of `DiagnosticResult` through this specification.

## Privacy Classification

| Classification                 | Material                                                                                                                                                                                                                              | Treatment                                                                     |
| ------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------- |
| `REQUEST_TARGET`               | Knowledge identity; exact expected Knowledge version                                                                                                                                                                                  | Used only to identify one exact accepted item version                         |
| `PREPARATION_PREREQUISITE`     | Candidate-preparation association; closed currentness-owner case; Knowledge-owned determination result or completed external Source Currentness correspondence under the applicable branch                                            | Preparation-scoped; not accepted state or a target coordinate                 |
| `RULE_VISIBLE_RESULT`          | `subjectKey`; `predicateKey`; `textualScalar`                                                                                                                                                                                         | May pass through authoritative Context to the approved bounded Reasoning rule |
| `OPAQUE_RESULT_CORRESPONDENCE` | Candidate-preparation association; Knowledge identity/version; proposition identity; Accepted state; closed Knowledge capability attribution; same-capture Knowledge issuance; applicable source-authority/currentness correspondence | Preserved and authority-bound; not a Reasoning semantic input                 |
| `PROHIBITED`                   | CandidateClaim; KnowledgeRecord; raw provenance; acceptance evidence; Store metadata; source internals; credentials; raw verifier/currentness evidence; authority-capture internals; confidence; ranking; private traces              | Never exposed by the projection operation                                     |

## Core Language Requirements

Future Core language must provide semantic representations for:

- one distinct Knowledge projection operation request;
- one exact target containing Knowledge identity and expected version;
- one opaque Context-owned candidate-preparation association;
- one closed preparation-prerequisite ownership choice;
- one closed Knowledge-owned preparation-currentness determination with
  positive, negative, and unable-to-determine outcomes and exact preparation
  binding;
- one opaque completed external Source Currentness correspondence carrying the
  five minimum semantic facts defined above;
- one immutable structured textual projection result;
- its rule-visible tuple, closed Knowledge capability attribution, and opaque
  correspondence boundary;
- one Knowledge issuance correspondence tied to the same process-local exact-
  object projection-authority capture;
- one Knowledge projection-verification request containing intent and exact
  candidate;
- the verified exact projection result;
- the closed Knowledge-owned and externally originating failure categories;
- one exact closed projection diagnostic observation record; and
- one optional synchronous projection diagnostic observer signature.

Core custody of this language does not transfer Knowledge, source-currentness,
Context, or verifier ownership to Core. TypeScript syntax, serialization,
method names, classes, tokens, and storage representations remain deferred to
implementation mechanics.

Core custody of diagnostic language does not transfer projection success or
failure meaning, failure identity, emission semantics, or Knowledge privacy
policy to Core. This specification governs a future executable representation;
it does not create Core types.

## Additive Compatibility

`MINOR_COMPATIBLE_OPERATION`

The operation is additive because:

- Evaluate Knowledge Claim remains valid for existing claim-only callers;
- Get Knowledge remains unchanged;
- List Knowledge References remains unchanged;
- existing Knowledge references retain their meaning;
- the existing Store contract remains semantically valid for claim-only
  records;
- existing accepted records remain valid and need no migration merely for
  validity;
- claim-only records are projection-ineligible rather than invalid; and
- no existing caller must adopt the new projection operation.

## Dependency Boundary

`DEPENDENCY_RULE_CHANGE_NOT_REQUIRED`

Knowledge implementation depends inward on Core-custodied language and Store
abstractions. It MUST NOT depend on Context, Reasoning, Planning, Brain,
Bootstrap, or a concrete Store. Context depends only on the Core-custodied
projection and verifier Contracts. Bootstrap later wires concrete
implementations.

## Upstream Currentness Producer Gap

`UPSTREAM_CURRENTNESS_PRODUCER_RUNTIME_GAP_REMAINS_OPEN`

This specification closes what the projection operation can accept and
preserve. It does not establish that every qualified/original source currently
produces the required completed preparation-cycle correspondence. Core and
Knowledge implementation may use governed conformance fixtures for the closed
input, including the exact candidate-preparation association, while
source-specialization and end-to-end production work remain open.

## Implementation Sequencing

The dependency-ordered implementation sequence is:

1. Core projection, prerequisite, result, verifier, and failure language;
2. additive structured acceptance and persistence;
3. exact-target projection runtime and eligibility;
4. Knowledge projection authority and verifier;
5. Knowledge and CONTRACT-0001 conformance plus the closed privacy-safe
   projection diagnostic observer boundary; and
6. later Context runtime incorporation and end-to-end source-currentness
   production.

Knowledge Engine 3.0.0 remains Active and this executable projection specification remains Draft throughout
implementation and review.

## Implementation Finding Dispositions

- `K13-IMPL-F01 SPECIFICATION BLOCKER RESOLVED`
- `K13-IMPL-F02 SPECIFICATION BLOCKER RESOLVED`
- `K13-IMPL-F03 PASS`
- `K13-IMPL-F04 PASS`
- `K13-IMPL-F05 PASS`
- `K13-IMPL-F06 PASS`
- `K13-IMPL-F07 PASS`
- `K13-IMPL-F08 OPEN`

The open findings are implementation, integration, conformance, or diagnostic
work. This specification claims no runtime completion.

`K13-IMPL-F03` is PASS. Executable Core evidence provides the exact Knowledge
identity and expected-version target, structured textual proposition and
projection representations, opaque CandidatePreparationAssociation, closed
preparation and currentness correspondence, projection candidate and result,
verifier request, and governed public failure identities. Exact-field
factories, immutable and deeply frozen results, exact-one cardinality, type
boundaries, and prohibited dependency-direction checks passed.

`K13-IMPL-F04` is PASS. Executable evidence demonstrates additive structured
acceptance with legacy claim-only compatibility, PropositionIdentity allocation
only after successful validation, closed Knowledge-owned and external-source
ownership correspondence, exactly one immutable accepted structured
proposition, invalid-state rejection, and Store round-trip and reconstruction
through governed Core factories without semantic authority transfer. In-memory
and PostgreSQL adapter conformance passed. The latest Store suites passed 21
tests while 13 environment-dependent PostgreSQL integration tests were skipped;
the governed REVIEW-0002 nonproduction evidence separately establishes durable
write and read, restart reconstruction, rollback, supersession, and restore.
Production PostgreSQL activation is not required for this gate.

`K13-IMPL-F05` is PASS. Runtime evidence demonstrates exact Knowledge identity
and expected-version targeting, missing-target and version-mismatch failures,
no latest lookup, substitution, supersession traversal, or fallback, Accepted
structured-proposition eligibility, superseded and claim-only ineligibility,
closed Knowledge-owned and external currentness handling, one exact projection,
exact `subjectKey`, `predicateKey`, and `textualScalar` preservation, exact
CandidatePreparationAssociation preservation, privacy minimization, and
governed request, eligibility, currentness, and preparation failures. No
external Source Currentness production producer is claimed.

`K13-IMPL-F06` is PASS. Executable authority and verifier evidence demonstrates
Knowledge-owned issuance, private process-local state, immutable issuance
correspondence, exact-object authority and verification, rejection of structural
clones, reconstruction, correspondence mismatch, and cross-instance use,
distinct malformed-request and unauthorized-candidate failures, no public
capture capability, no bearer or reusable authority token, no authority
persistence, and fail-closed invalid lifecycle behavior. No corrupt internal
authority state was fabricated for coverage.

The combined reconciliation passed 71 focused tests across four Core,
Knowledge Store, K13, and lifecycle files and 616 full Core and Knowledge tests
across 25 files. Build, Core and Knowledge test typechecks, lint, dependency
analysis across 64 modules and 126 dependencies, dependency-prohibition checks,
formatting, and whitespace validation passed with no dependency violations.

`K13-IMPL-F07` is PASS. Executable evidence demonstrates:

- the exact closed observation record;
- successful projection observation;
- an applicable governed Knowledge failure observation;
- preservation of the exact public Knowledge failure identity;
- absence of every protected field and CandidatePreparationAssociation;
- absence of reusable authority material;
- synchronous observer invocation;
- optional, absent, and no-op observer behavior;
- observer failure containment;
- privacy-preserving `StructuredLogger` adaptation when such adaptation is
  used; and
- Bootstrap wiring without acquisition of Knowledge diagnostic semantics.

The evidence includes exact closed success and failure records, successful and
governed-failure observations, exact existing public failure-identity
preservation, protected-field and CandidatePreparationAssociation absence, no
reusable authority material, synchronous invocation, absent and no-op
compatibility, and observer-failure containment. It also demonstrates Core
custody only, Knowledge-owned semantics and minimization, and the Bootstrap
wiring-only boundary. Eight failure identities reachable through public
executable fixtures have runtime evidence; three additional canonical public
identities remain in the canonical contract and were not artificially forced
through unsafe or non-public fixtures.

Focused projection conformance passed with 44 tests across two files, and the
full Core and Knowledge suites passed with 616 tests across 25 files. Build,
Core and Knowledge test typechecks, lint, dependency analysis and prohibition
checks, formatting, and whitespace validation also passed.

`StructuredLogger` adaptation is `NOT_APPLICABLE` because no adapter is part of
this implementation; the adaptation requirement applies only when such an
adapter is used. Knowledge has no direct `StructuredLogger` dependency.
Production Bootstrap was not modified: the approved absent, no-op, and later
composition paths provide the required wiring-only boundary without claiming
production observer composition.

`K13-IMPL-F08` remains separately open and dependent on an external Source
Currentness producer, Context integration, Bootstrap and end-to-end
composition, and governed production Profile B reachability or activation.
Closing F03 through F07 does not advance or change F08.

## Implementation Readiness

`K13_IMPLEMENTATION_READY`

After this Draft is reviewed and accepted through the governed repository review path and the governing
Knowledge Engine 3.0.0 lifecycle, Core, and Knowledge implementation remain authoritative independently of
inventing the operation choice, target, preparation-currentness input location,
result, verifier boundary, cardinality, or failure ownership.

## Deferred Scope

This specification does not define or implement:

- TypeScript types or names;
- runtime classes or methods;
- persistence or migration mechanics;
- concrete authority-state storage;
- serialization, wire formats, signatures, hashes, or tokens;
- Context runtime or Contextual Applicability;
- source-currentness producer implementations;
- Bootstrap composition;
- diagnostic observer types, implementations, adapters, transports, tests, or
  conformance fixtures;
- production Profile B reachability;
- Reasoning, Planning, Brain, or Skill behavior; or
- activation of this executable projection specification.

The diagnostic refinement fills an executable detail explicitly deferred by
the reviewed semantic specification. It does not alter the semantic
architecture approved by REVIEW-0003, and it does not claim that REVIEW-0003
reviewed this diagnostic detail. REVIEW-0005 reviewed and approved the focused
diagnostic observer boundary through the governed repository review path. That
approval did not itself provide executable evidence. Subsequent governed
implementation-conformance evidence satisfies K13-IMPL-F07. K13-IMPL-F08
remains OPEN.

## Diagnostic Non-Goals

This specification does not define persistent diagnostic Events, audit
logging, production telemetry architecture, distributed tracing,
correlation-identifier architecture, metrics architecture, alerting,
dashboards, log retention, transport selection, vendor-specific observability,
or asynchronous diagnostic queues. It does not change Context, Reasoning,
CONTRACT-0001, Active Knowledge Engine 3.0.0, or production activation.

## Related Documents

- [Knowledge Engine 3.0.0](ENGINE-0005-Knowledge-Engine-Revision-3.0.0.md)
- [REVIEW-0002 - PostgreSQL Knowledge Store Nonproduction Validation](../../../docs/architecture-review/REVIEW-0002-PostgreSQL-Knowledge-Store-Nonproduction-Validation.md)
- [REVIEW-0003 - Knowledge Engine Executable Projection Operation](../../../docs/architecture-review/REVIEW-0003-Knowledge-Engine-Executable-Projection-Operation.md)
- [REVIEW-0005 - Knowledge Engine Projection Diagnostic Observer Boundary](../../../docs/architecture-review/REVIEW-0005-Knowledge-Engine-Projection-Diagnostic-Observer-Boundary.md)
- [Knowledge Engine 1.2.0](ENGINE-0005-Knowledge-Engine-Revision-1.2.0.md)
- [Context Engine 5.0.1](../context/ENGINE-0003-Context-Engine-Revision-5.0.1.md)
- [Reasoning Engine 3.0.0 Draft](../reasoning/ENGINE-0006-Reasoning-Engine-Revision-3.0.0.md)
- [Reasoning Executable Bounded Rule Draft](../reasoning/ENGINE-0006-Reasoning-Engine-Executable-Bounded-Rule.md)
- [ADR-0008 — Context Collaboration, Source Ownership, and Reference Authority](../../../docs/adr/ADR-0008-Context-Collaboration-Source-Ownership-and-Reference-Authority.md)
- [ADR-0011 — Source Currentness, Contextual Currentness, and Currentness Change](../../../docs/adr/ADR-0011-Source-Currentness-Contextual-Currentness-and-Currentness-Change.md)
- [ADR-0013 — Failure Ownership, Propagation, and Candidate Context Revision Consequences](../../../docs/adr/ADR-0013-Failure-Ownership-Propagation-and-Candidate-Context-Revision-Consequences.md)
- [ADR-0014 — Bootstrap Composition Responsibility and Ownership and Authority Preservation](../../../docs/adr/ADR-0014-Bootstrap-Composition-Responsibility-and-Ownership-and-Authority-Preservation.md)
- [ADR-0020 — Knowledge Evidence Boundary for Source-Aware Reasoning](../../../docs/adr/ADR-0020-Knowledge-Evidence-Boundary-for-Source-Aware-Reasoning.md)
- [ADR-0021 — Knowledge Source Currentness and Projection Attribution](../../../docs/adr/ADR-0021-Knowledge-Source-Currentness-and-Projection-Attribution.md)
- [ADR-0022 — Context Preparation Semantic Scope and Applicability Policy](../../../docs/adr/ADR-0022-Context-Preparation-Semantic-Scope-and-Applicability-Policy.md)
- [CONTRACT-0001 — Context Source Retrieval](../../../docs/contracts/CONTRACT-0001-Context-Source-Retrieval.md)
- [ARCH-0001 — Core Architecture](../../architecture/ARCH-0001-Core-Architecture.md)
- [Brain Engine](../ENGINE-0001-Brain-Engine.md)
- [Skill Engine Protected Invocation and Execution](../skill/ENGINE-0010-Skill-Engine-Protected-Invocation-and-Execution.md)
- [OES-0002 — Engine Design](../../../docs/engineering/OES-0002-Engine-Design.md)
- [OES-0004 — Contracts](../../../docs/engineering/OES-0004-Contracts.md)
- [OES-0008 — Documentation Standards](../../../docs/engineering/OES-0008-Documentation-Standards.md)
- [OES-0009 — Security Standards](../../../docs/engineering/OES-0009-Security-Standards.md)
- [OES-0010 — Versioning Standards](../../../docs/engineering/OES-0010-Versioning-Standards.md)

## Change History

| Version | Date       | Description                                                                                                                                                                                                                               |
| ------- | ---------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1.1.3   | 2026-08-31 | Synchronized K13-IMPL-F03 through F06 to PASS after executable evidence satisfied the projection semantics approved by REVIEW-0003; F07 remains PASS, F08 remains OPEN, and Draft and Active Knowledge Engine 3.0.0 status are preserved. |
| 1.1.2   | 2026-08-31 | Synchronized K13-IMPL-F07 to PASS after executable diagnostic observer evidence satisfied the governed criteria approved by REVIEW-0005; the specification remains Draft and F08 remains OPEN.                                            |
| 1.1.1   | 2026-08-31 | Recorded focused governed approval of the projection diagnostic observer boundary through REVIEW-0005; the specification remains Draft, F07 remains OPEN pending executable evidence, and F08 remains OPEN and unchanged.                 |
| 1.1.0   | 2026-08-31 | Added the Knowledge-owned, Core-custodied projection diagnostic observer boundary and F07 conformance requirements without changing reviewed projection semantics or F08.                                                                 |
| 1.0.1   | 2026-08-30 | Aligned governing authority with Active Knowledge Engine 3.0.0 and recorded successful governed semantic architecture review in REVIEW-0003.                                                                                              |
| 1.0.0   | 2026-08-17 | Drafted the distinct Knowledge projection operation and synchronized preparation-bound lifecycle currentness, Knowledge capability attribution, and single-capture issuance authority with ADR-0021.                                      |

---

> Knowledge targets one accepted item, preserves one preparation boundary, and
> issues one authoritative bounded projection.
