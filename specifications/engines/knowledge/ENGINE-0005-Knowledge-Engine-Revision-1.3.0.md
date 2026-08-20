# ENGINE-0005 — Knowledge Engine Revision

| Field             | Value                                                                                                   |
| ----------------- | ------------------------------------------------------------------------------------------------------- |
| **Status**        | Superseded                                                                                              |
| **Supersedes**    | 1.2.0                                                                                                   |
| **Superseded By** | [ENGINE-0005 2.0.0](ENGINE-0005-Knowledge-Engine-Revision-2.0.0.md)                                     |
| **Version**       | 1.3.0                                                                                                   |
| **Owner**         | Project Maintainers                                                                                     |
| **Created**       | 2026-08-17                                                                                              |
| **Updated**       | 2026-08-20                                                                                              |
| **Applies To**    | Knowledge-owned acceptance, issuance, and verification of one structured textual proposition projection |

---

## Status and Authority

This specification is Superseded by Knowledge Engine 2.0.0. It remains the
historical authority for Knowledge Engine 1.3.0 semantics and supersedes
Knowledge Engine 1.2.0; that revision and earlier revisions remain historical
and non-authoritative.

This revision preserves all Knowledge Engine 1.2.0 semantics and adds the
structured textual proposition semantics specified below. Applicable Active
ADRs, Concepts, Engineering Standards, and CONTRACT-0001 govern in a conflict.

## Purpose

This revision makes the first bounded Knowledge proposition projection
executable without parsing opaque CandidateClaim prose. It adds an explicitly
supplied, Knowledge-owned structured textual proposition candidate whose
accepted semantic tuple is:

```text
{
  subjectKey,
  predicateKey,
  textualScalar
}
```

The tuple is accepted Knowledge proposition semantics. It is not a replacement
for CandidateClaim, a generic ontology, a global entity or predicate model, a
source registry, a Context-owned structure, or a Reasoning-owned structure.

The first slice is deliberately textual-only. It does not define numeric,
Boolean, calendar-date, identifier-valued, unit-bearing, localized, converted,
formatted, translated, or response-template values.

## Compatibility and Existing Behavior Preservation

All Knowledge Engine 1.2.0 behavior remains valid and unchanged, including:

- CandidateClaim validation and opacity;
- claim-only Knowledge acceptance;
- existing Knowledge identities, versions, records, references, and lifecycle;
- existing Get Knowledge behavior;
- contradiction, supersession, provenance, Store, privacy, diagnostics, and
  failure semantics;
- bounded proposition projection ownership and authority boundaries; and
- applicable source authority and Source Currentness ownership.

The structured textual proposition is optional and additive. Existing callers
may continue to submit CandidateClaim exactly as before. Existing accepted
claim-only Knowledge remains valid and requires no migration, reconstruction,
or retroactive structured semantics. Such Knowledge is simply ineligible for
the new structured textual projection.

The accepted-source ownership proposal is required only when the caller uses
the new structured acceptance surface. It is not added to claim-only requests,
historical records, Get Knowledge, or any existing Knowledge 1.2.0 operation.

No existing source is required to supply structured semantics merely because
this capability exists.

## CandidateClaim Preservation

CandidateClaim remains the existing opaque textual Knowledge candidate.
Knowledge MUST NOT parse, infer, extract, normalize, or reconstruct a subject,
predicate, entity, relationship, or scalar from CandidateClaim prose.

A caller may explicitly include one structured textual proposition candidate
with the required CandidateClaim in the same governed acceptance request. The
two are distinct candidate surfaces:

- CandidateClaim supplies the existing opaque claim semantics; and
- the structured candidate supplies the new explicit tuple semantics.

When both are supplied, the caller MUST also explicitly declare that the
structured candidate is submitted as structured semantics for the same
proposed Knowledge proposition represented by that acceptance request. This is
a caller-declared acceptance assertion, not a semantic inference by Knowledge.
The declaration has one closed affirmative semantic value,
`same-proposition`; no alias, free-form assertion, inferred default, or omitted
value is accepted.

Knowledge MUST NOT require CandidateClaim text to equal `textualScalar` and
MUST NOT infer semantic consistency by parsing either text. Knowledge validates
only that the required same-proposition declaration is present, has the exact
governed affirmative value, and corresponds structurally to the CandidateClaim
and structured candidate in the same request. The acceptance decision applies
to that complete submitted candidate state and, when successful, binds:

- the exact CandidateClaim accepted under existing semantics;
- the exact explicitly supplied structured candidate;
- the caller's affirmative same-proposition declaration; and
- the existing acceptance evidence, provenance, and attribution.

The accepted relationship is governed by the caller declaration and existing
authority/provenance evidence. Knowledge does not independently prove semantic
equivalence. A caller assertion that is semantically false is not discovered
through CandidateClaim parsing; responsibility for the submitted assertion and
governed acceptance evidence remains at their existing boundaries.

The acceptance cases are closed:

- **CandidateClaim only:** the existing acceptance path remains valid, and the
  accepted item is not eligible for structured textual projection.
- **Structured proposition without CandidateClaim:** invalid because the
  existing Knowledge acceptance path continues to require CandidateClaim.
- **CandidateClaim, structured proposition, and affirmative same-proposition
  declaration:** eligible for structured acceptance when every other
  validation succeeds.
- **CandidateClaim and structured proposition without the declaration:** a
  Knowledge-owned malformed structured acceptance failure.
- **A declaration that they represent different propositions:** a
  Knowledge-owned structured acceptance failure.

Knowledge MUST NOT discard an invalid structured portion and silently accept
the request as claim-only. Existing claim-only requests, which supply neither a
structured candidate nor a same-proposition declaration, remain unchanged. A
same-proposition declaration without a structured candidate is invalid
structured acceptance input.

The same-proposition declaration governs only the CandidateClaim/tuple
correspondence. It does not establish a source owner, Source Currentness
ownership, source authority, present currentness, or authorization.

Subsequent contradiction or supersession handling applies to the accepted
Knowledge item under existing Knowledge semantics; this revision adds no
semantic parser for detecting contradictions between prose and the tuple.

## Structured Textual Proposition Candidate

A structured textual proposition candidate is an explicitly supplied candidate
containing exactly:

- one `subjectKey`;
- one `predicateKey`; and
- one `textualScalar`.

It contains no second proposition, alternative scalar, ranking, confidence,
query, response, or selection instruction. The existing Knowledge acceptance
caller supplies the tuple explicitly and, when it accompanies CandidateClaim,
supplies the required same-proposition declaration. Knowledge owns validation,
acceptance, accepted state, immutable preservation, projection issuance, and
projection verification.

Knowledge never derives the tuple from CandidateClaim or source prose. The
concrete serialization and API representation remain deferred to implementation
within the existing Knowledge acceptance boundary; no new caller, parser,
normalizer, or capability is introduced.

## Structured Acceptance Source Correspondence

Every structured acceptance request MUST include one proposed accepted-source
correspondence in addition to the CandidateClaim, structured proposition,
affirmative same-proposition declaration, and existing acceptance evidence and
provenance. The existing Knowledge acceptance caller supplies this proposal at
the same governed acceptance boundary. No new caller, source registry,
capability, or collaboration is created.

The proposal has exactly one of two closed cases:

1. **Knowledge-owned Source Currentness:** the proposal declares Knowledge as
   the applicable Source Currentness owner for the accepted proposition
   relationship and contains no external proposition/source relationship; or
2. **external-source-owned Source Currentness:** the proposal declares that a
   governed qualified or original source owns Source Currentness and supplies
   exactly one opaque stable proposition/source relationship correspondence.

No omitted, third, combined, open-string, default, or inferred case is valid.
The caller's proposal is candidate correspondence only. Possession or assertion
of either case does not establish authority, ownership, Source Currentness, or
acceptance.

Knowledge validates the proposal as part of the complete structured acceptance
candidate under the existing acceptance evidence, source-attribution, and
source-authority rules. Knowledge owns the acceptance consequence and the
resulting accepted correspondence. It does not acquire an external source's
authority or Source Currentness semantics. A proposal unsupported by the
governing evidence cannot become accepted correspondence.

Knowledge MUST NOT derive the ownership case or stable relationship from
CandidateClaim, the structured tuple, generic provenance, source type,
originating-capability text, an optional source reference, omission of a field,
or caller preference. Existing provenance and acceptance evidence govern
validation but are not reinterpreted as the accepted correspondence itself.

### Knowledge-Owned Accepted Correspondence

The Knowledge-owned case binds the exact accepted structured proposition to the
closed fact that Knowledge is the applicable Source Currentness owner for that
proposition relationship. It contains no fabricated external source identity,
external relationship correspondence, external verifier correspondence, or
external currentness result.

Knowledge accepts this case only when existing governed acceptance evidence and
source-authority correspondence support Knowledge ownership. Unsupported
Knowledge ownership is a failed structured acceptance, not a caller-selected
policy.

### External-Source-Owned Accepted Correspondence

The external-source-owned case binds the exact accepted structured proposition
to one governed external owner and one exact stable proposition/source
relationship correspondence. The relationship is an opaque, immutable
correspondence value issued or supplied through the existing governed
source/acceptance material. It identifies the relationship between the accepted
proposition and the qualified or original source that owns later Source
Currentness; it is not a provider address, transport endpoint, registry key,
Store identity, provenance record, or arbitrary metadata.

Knowledge accepts this case only when the existing source-attribution,
source-authority, and acceptance evidence govern both the external owner and
the proposed relationship. The external source retains authority over its
source relationship and its future Source Currentness determinations. Knowledge
only validates acceptance correspondence and preserves the exact accepted
value.

Equality of stable proposition/source relationship correspondence is exact
equality of the accepted opaque stored value. Knowledge performs no semantic
interpretation, alias resolution, normalization, provider lookup, registry
lookup, or provenance inference.

### Stable Relationship and Preparation Correspondence

Accepted Knowledge persists only the stable currentness-owner and, for the
external case, stable proposition/source relationship correspondence. It MUST
NOT persist a CandidatePreparationAssociation, preparation invocation identity,
preparation-cycle currentness determination, freshness result, later issuer-
verification result, TTL, latest timestamp, refresh state, or other preparation
state as accepted proposition correspondence.

A later external Source Currentness correspondence is distinct preparation-
cycle material. In addition to the stable relationship, it carries the exact
CandidatePreparationAssociation, completed positive determination, and
completed issuer-verification correspondence required by the executable
projection operation. The stable accepted relationship does not establish
present or future currentness.

## Subject Key

`subjectKey` is an opaque textual semantic identifier for exact comparison. Its
closed validity predicate is:

1. it is a primitive textual value;
2. its length is from 1 through 128 Unicode code points, inclusive;
3. it contains at least one non-whitespace code point;
4. its first and last code points are not whitespace; and
5. it is preserved exactly as supplied, with no normalization.

Internal whitespace is permitted. Knowledge validates and accepts the exact
stored value. Knowledge, Context, and Reasoning MUST NOT trim, case-fold,
Unicode-normalize, resolve aliases, consult an ontology or registry, or infer
equivalence.

Equality is exact equality of the preserved Unicode code-point sequence. It is
not locale-sensitive, case-insensitive, canonically equivalent, or
serialization-dependent. Canonically equivalent but differently encoded
sequences are unequal.

The key is immutable within the accepted proposition. It need not be globally
unique and is distinct from Knowledge Identity, source identity, and
proposition identity. The key's domain semantics are supplied explicitly with
the candidate and accepted by Knowledge; this revision creates no entity
registry.

## Predicate Key

`predicateKey` is an opaque textual semantic identifier for exact comparison.
Its closed validity predicate is identical in form to `subjectKey`:

1. it is a primitive textual value;
2. its length is from 1 through 128 Unicode code points, inclusive;
3. it contains at least one non-whitespace code point;
4. its first and last code points are not whitespace; and
5. it is preserved exactly as supplied, with no normalization.

Internal whitespace is permitted. Equality is exact equality of the preserved
Unicode code-point sequence. No trimming, case folding, Unicode normalization,
alias resolution, taxonomy, ontology, registry lookup, or inferred equivalence
is permitted.

The predicate key is immutable, need not be globally unique, and is not a
generic predicate vocabulary. It is distinct from Knowledge Identity,
proposition identity, and implementation field names.

## Governed Textual Scalar

`textualScalar` is Knowledge-owned accepted structured proposition content. Its
closed validity predicate is:

1. it is a primitive textual value;
2. its length is from 1 through 4096 Unicode code points, inclusive;
3. it contains at least one non-whitespace code point; and
4. it is preserved exactly as supplied, with no normalization.

Leading, trailing, and internal whitespace are permitted when the value
contains at least one non-whitespace code point. They are semantic content and
MUST NOT be trimmed or rewritten. Unicode normalization, case conversion,
localization, translation, formatting, templating, parsing, and value
conversion are prohibited. Equality and preservation use the exact accepted
Unicode code-point sequence.

The following roles remain distinct:

1. source wording is owned by its applicable source;
2. CandidateClaim remains an opaque Knowledge candidate;
3. the accepted structured textual scalar is Knowledge-owned semantic content;
4. the projected scalar is the exact immutable accepted scalar; and
5. a Reasoning CandidateResponse is Reasoning-owned, even when a separately
   governed rule identity-preserves the projected scalar.

Knowledge does not generate, format, paraphrase, template, or select a user
response. CandidateClaim and `textualScalar` are not required to be textually
identical.

## Accepted Structured Proposition

An accepted structured proposition exists only after Knowledge successfully
validates and accepts an explicitly supplied structured candidate. Successful
acceptance atomically establishes:

- the exact accepted Knowledge identity and version;
- the accepted state;
- exactly one immutable structured tuple;
- exactly one governed proposition identity for that tuple;
- the exact required CandidateClaim correspondence;
- the affirmative same-proposition declaration corresponding to the exact
  CandidateClaim and structured candidate;
- the closed Knowledge capability attribution
  `authoritativeCapability = knowledge` established by the enclosing
  authoritative Knowledge record;
- exactly one accepted currentness-owner correspondence;
- for the external-source-owned case, exactly one stable proposition/source
  relationship correspondence;
- applicable accepted source-authority correspondence; and
- no preparation-cycle Source Currentness result.

Conceptually, the accepted structured proposition therefore contains the exact
proposition identity, exact semantic tuple, and one closed accepted-source
ownership correspondence. The enclosing Knowledge item alone supplies the
Knowledge identity and version; they are not duplicated inside this binding.

Successful acceptance already establishes the closed Knowledge capability
attribution `authoritativeCapability = knowledge` because the exact proposition
is accepted as part of an authoritative Knowledge record. The nested binding
requires no additional persisted attribution operand. This attribution does
not identify an original source and is not derived from KnowledgeProvenance.

The accepted-source correspondence is the authoritative accepted-state operand
for later projection validation. It is not raw provenance, present currentness,
preparation state, issuer-verification evidence, authorization, or a public
source handle.

The tuple becomes part of accepted Knowledge state. Projection never creates,
parses, enriches, repairs, or substitutes semantic content.

For this first slice, one accepted Knowledge item contains either:

- no accepted structured proposition, preserving claim-only behavior; or
- exactly one accepted structured textual proposition.

Supplying more than one structured proposition in the acceptance candidate is
invalid. Knowledge MUST NOT rank, merge, choose, or synthesize among them.

## Proposition Identity

Knowledge assigns exactly one governed proposition identity to each accepted
structured proposition. It is an opaque, immutable Knowledge correspondence
identifier and is distinct from `subjectKey`, `predicateKey`, Knowledge
Identity, source identity, and public provenance.

Knowledge owns issuance. After all structured candidate, same-proposition,
accepted-source correspondence, acceptance-evidence, and authority validations
succeed, Knowledge issues exactly one fresh proposition identity and atomically
binds it with the tuple and accepted-source correspondence into the exact
Accepted Knowledge state. An acceptance that fails issues no accepted
proposition identity. Bootstrap or another composition boundary may later
provide allocation mechanics without acquiring issuance semantics.

The proposition identity uses the repository's opaque identity validity
principles: it is a primitive textual value of 1 through 128 Unicode code
points, contains a non-whitespace code point, has no leading or trailing
whitespace, and is preserved without normalization. Allocation mechanics are
deferred.

Knowledge MUST NOT reuse the same proposition identity for two different
accepted structured propositions within the issuing Knowledge authority. No
global registry or public lookup meaning is created.

The identity is non-content-derived. Knowledge MUST NOT derive it from
Knowledge Identity, CandidateClaim, the tuple, a source reference, a hash, or a
timestamp. UUIDs, counters, randomness, persistence mechanisms, and concrete
generator APIs remain implementation details rather than normative identity
semantics.

The identity proves correspondence to one exact accepted proposition when
used with Knowledge-owned verification. By itself it proves no proposition
truth, source authority, currentness, Context incorporation, Reasoning result,
or authorization.

## Projection Eligibility

An accepted Knowledge item is eligible for one structured textual projection
if and only if all of the following hold:

1. the exact requested Knowledge identity exists;
2. the exact expected Knowledge version matches;
3. the Knowledge item is in the Accepted state;
4. it contains exactly one accepted structured textual proposition;
5. its `subjectKey` satisfies the closed validity predicate;
6. its `predicateKey` satisfies the closed validity predicate;
7. its `textualScalar` satisfies the closed validity predicate;
8. its proposition identity is valid and corresponds to that exact tuple;
9. its requested currentness-owner case exactly matches the accepted
   currentness-owner correspondence;
10. for the external-source-owned case, the preparation correspondence's
    proposition/source relationship exactly equals the stable accepted
    proposition/source relationship;
11. the closed Knowledge capability attribution and required Knowledge
    correspondence are complete;
12. required Knowledge-owned projection issuance prerequisites hold;
13. applicable completed underlying-source authority correspondence is present
    and valid under its originating owner; and
14. the applicable Source Currentness prerequisite is satisfied under its
    established owner.

The predicate is closed. Missing, stale, malformed, ambiguous, substituted, or
inconsistent state is not repaired or guessed.

A claim-only accepted Knowledge item remains valid Accepted Knowledge but is
not eligible for this projection. Projection ineligibility does not reject,
supersede, or otherwise change the underlying item.

## Projection Targeting and Cardinality

The projection operation is targeted only by:

```text
exact accepted Knowledge identity
+ exact expected Knowledge version
→ zero or one structured textual projection
```

Knowledge identity and exact expected version completely identify the accepted
item targeted by this operation. The caller supplies no generic correspondence
field, proposition identity, Accepted-state token, authority token, currentness
token, verifier evidence, provenance, or retrieval selector. Knowledge
internally validates proposition identity, Accepted state, projection
eligibility, and all required authority correspondence against the exact
targeted accepted item and the preparation-cycle prerequisites specified below.

For an eligible exact target, Knowledge issues exactly one projection. For an
absent, stale, mismatched, malformed, ambiguous, or ineligible target,
Knowledge issues no projection and returns the governed failure appropriate to
the originating condition.

The operation MUST NOT:

- search for a latest version;
- rank or choose among Knowledge items;
- match a query;
- select based on expected Reasoning success;
- infer caller intent;
- retrieve alternative Knowledge;
- merge or synthesize propositions; or
- issue multiple propositions.

The proposition identity is not an alternative search key. It is preserved as
correspondence for the exact targeted accepted item. The identity of the
caller and concrete operation signature remain deferred; no new caller or
cross-engine request path is authorized here.

## Structured Textual Projection

The issued projection contains rule-visible semantic material:

- the exact accepted `subjectKey`;
- the exact accepted `predicateKey`; and
- the exact accepted `textualScalar`.

It also preserves, as authority/correspondence material only, the minimum
existing governed correspondence required by Knowledge 1.2.0 and ADR-0021,
including the exact proposition identity, Knowledge identity and version,
Accepted-state correspondence, the closed Knowledge capability attribution,
Knowledge issuance correspondence, and applicable completed source-authority
and Source Currentness correspondence.

For this slice, projection attribution is exactly
`authoritativeCapability = knowledge`: the exact accepted structured
proposition is authoritative Knowledge material issued and owned within the
Knowledge capability. It does not claim that Knowledge is the original
information source and does not establish source authority, Source Currentness,
Context authority, Reasoning correctness, authorization, or provenance. No
separate accepted-attribution identity, allocator, token, registry, or
persisted attribution operand exists.

The projection is immutable, deterministic, and bound to the exact accepted
structured proposition. Authority-only material is not rule input and MUST
NOT be exposed to Reasoning merely because Context preserves it.

## Knowledge Projection Verification

Knowledge owns the structured textual projection verifier. Successful
verification proves exactly:

- Knowledge issued the projection;
- the projection has issuance integrity;
- exact Knowledge identity and version correspondence;
- exact Accepted-state correspondence;
- exact proposition identity correspondence;
- exact `subjectKey` correspondence;
- exact `predicateKey` correspondence;
- exact `textualScalar` correspondence;
- the closed Knowledge capability attribution; and
- preservation of applicable completed underlying-source correspondence.

Verification compares the exact issued projection with the exact accepted
Knowledge state to which it is bound. A reconstructed, substituted, or merely
structurally equivalent projection does not acquire Knowledge authority.

Knowledge projection verification does not prove:

- underlying-source authority issued by another source;
- Source Currentness or perpetual currentness;
- Context structural prerequisites or Contextual Applicability;
- Context incorporation, lifecycle, or authority;
- exact-query applicability or evidence sufficiency;
- CandidateResponse, CandidateConclusion, or final-response correctness;
- Skill intent or execution; or
- Security authorization.

The concrete verifier API, storage mechanism, signature, hash, and object
identity technique remain deferred.

One process-local Knowledge projection-authority capture governs both issuance
correspondence and verifier behavior. Knowledge issuance correspondence is an
opaque view/reference to that same capture, not an independently mintable
token. Capture occurs only after every target, eligibility, currentness,
attribution, and correspondence check succeeds and binds the exact projection
object, exact Knowledge identity/version, PropositionIdentity and tuple,
CandidatePreparationAssociation, accepted source-ownership correspondence,
applicable preparation currentness correspondence, closed Knowledge capability
attribution, and applicable underlying-source authority correspondence.
Structural equality does not transfer this authority to a clone.

## Underlying-Source Authority

An underlying source remains the issuer and verifier of authority that it
owns. Knowledge may preserve completed source correspondence required by the
accepted Knowledge item and projection, but it does not invoke a semantic
reverification as part of Knowledge projection verification and does not
translate source authority into Knowledge authority.

Context may validate required completed correspondence at its structural
boundary according to existing architecture. Reasoning does not receive or
interpret that correspondence as rule input.

The two verification domains remain distinct:

- the source-owned verifier proves source-owned issuance and correspondence;
  and
- the Knowledge-owned verifier proves Knowledge projection issuance and exact
  accepted-proposition correspondence.

## Source Currentness

Source Currentness remains governed by ADR-0011 and Active ADR-0021. The
applicable source owns the determination. Knowledge owns Source Currentness only when the
accepted structured proposition carries the governed
`knowledge-owned-currentness` correspondence.

Projection-time Source Currentness is evaluated only for the new Context
preparation cycle in which the projection is requested. Acceptance-time or
historical currentness correspondence does not establish present currentness.
Accepted state, Knowledge version, PropositionIdentity, retrieval, possession,
previous projection, previous preparation, previous Context incorporation,
projection issuance, and Knowledge verification likewise do not establish it.

The preparation-time boundary has exactly two cases.

The accepted structured proposition's closed owner correspondence determines
which case applies. A projection caller supplies the matching prerequisite case
but cannot select or override the accepted owner. A mismatch is a Knowledge-
owned projection-prerequisite failure and no projection is issued.

### Knowledge is the applicable Source Currentness owner

When Knowledge is the applicable owner, Knowledge evaluates Source Currentness
anew for each candidate-preparation cycle against the exact accepted
proposition's governed Knowledge lifecycle standing. The governed inputs are:

- the exact Knowledge identity and expected version;
- the exact accepted structured proposition and PropositionIdentity;
- the accepted `knowledge-owned-currentness` correspondence;
- the exact Knowledge lifecycle standing recorded by the applicable Knowledge
  authority; and
- the exact CandidatePreparationAssociation supplied for that preparation.

The determination is **POSITIVE** only when the exact identity is known to the
applicable Knowledge authority, the expected version matches its confirmed
record, the record remains Accepted and structurally valid, the exact
PropositionIdentity and tuple remain bound to that record, the accepted owner
is Knowledge, and that exact identity/version remains current in Knowledge's
governed lifecycle without supersession or another existing lifecycle
transition making it non-current. Positive correspondence binds the exact
identity/version, proposition, and CandidatePreparationAssociation and permits
projection eligibility to continue for that preparation only.

The determination is **NEGATIVE** when the exact confirmed, structurally valid
accepted proposition is no longer current in Knowledge's governed lifecycle,
including supersession or another existing non-current lifecycle standing. A
negative determination is completed Source Currentness, not an operational
failure. It makes the projection ineligible for that preparation, and Knowledge
issues no projection.

The outcome is **UNABLE_TO_DETERMINE** when Knowledge cannot establish the
required authoritative lifecycle facts, including unavailable or malformed
source state, inconsistent identity/version metadata, malformed accepted
proposition correspondence, or unavailable lifecycle standing. This is a
Knowledge-owned inability or failure to establish the prerequisite; it is not
negative currentness.

Knowledge recomputes the determination for every distinct
CandidatePreparationAssociation. A result for preparation A MUST NOT satisfy
preparation B. No acceptance-time, prior-preparation, prior-projection, cached,
or historical Context correspondence satisfies a later preparation, and no
preparation result becomes durable accepted Knowledge state.

### Another qualified or original source is the applicable owner

Knowledge does not determine or re-evaluate that source's currentness. The
projection is eligible only when the governed candidate-preparation boundary
for that preparation cycle already carries the completed Source Currentness
correspondence issued by the applicable source owner and bound to the accepted
proposition/source relationship.

The preparation correspondence's stable proposition/source relationship MUST
equal the exact relationship preserved in accepted structured state. This is
an exact opaque-value comparison, not provenance interpretation or source
discovery.

Knowledge may validate only that the completed correspondence is present,
structurally admissible for the exact accepted relationship, and preserved
unchanged in the projection. It MUST NOT semantically re-evaluate, renew,
replace, infer, or reconstruct the determination, and MUST NOT treat an
acceptance-time correspondence as automatically current.

This completed correspondence is part of the existing source-owned
preparation/candidate-material flow governed by CONTRACT-0001 and the existing
source specializations. It is not a new Knowledge retrieval collaboration,
authority-verification exchange, generic cross-engine request, currentness
token supplied as projection targeting input, or expansion of CONTRACT-0001.

If required source-owned currentness correspondence is missing, failed, or
ineligible, the originating currentness condition remains owned by the
applicable source. Knowledge owns only the operational consequence that it
cannot issue the projection for that preparation cycle; it does not translate
the source failure into a Knowledge semantic failure.

Projection issuance and Knowledge verification preserve completed
correspondence but do not establish, refresh, synchronize, recollect, or imply
perpetual currentness.

This revision defines no TTL, timestamp freshness, latest lookup, replacement
selection, automatic refresh, polling, implicit cache freshness,
synchronization, or recollection. A later source-currentness change does not
mutate an already stable or Active Context revision; it affects only later
preparation cycles under existing lifecycle rules. Reasoning receives no
Source Currentness value or evidence as a semantic rule input.

## Context Handoff and Boundary

Knowledge may make available to Context one candidate containing:

### Rule-visible semantic candidate material

- `subjectKey`;
- `predicateKey`; and
- `textualScalar`.

### Authority/correspondence material

- proposition identity;
- Knowledge identity and version;
- Accepted-state correspondence;
- the closed Knowledge capability attribution;
- Knowledge issuance and verification correspondence;
- applicable completed underlying-source authority correspondence; and
- applicable Source Currentness correspondence.

This list does not create new Context fields or a new collaboration. It
specializes the bounded semantic value and correspondence already authorized
by Knowledge 1.2.0, Context 5.0.0, ADR-0020, and CONTRACT-0001.

Context remains the sole owner of:

- candidate acceptance at the Context boundary;
- structural prerequisite validation;
- Contextual Applicability;
- exact-one incorporation;
- Context minimization;
- Context lifecycle and activation;
- Contextual Currentness; and
- Context authority.

Knowledge does not decide whether the candidate is contextually applicable,
does not incorporate it, and does not issue an authoritative Context revision.

## Reasoning Boundary

Through an authoritative Context revision, Reasoning may receive only the
three rule-visible semantic fields required by the approved bounded rule:

- `subjectKey`;
- `predicateKey`; and
- `textualScalar`.

Knowledge does not decide Identity eligibility, exact-query applicability,
evidence sufficiency, Outcome category, rule category, CandidateResponse,
CandidateConclusion, or next action. Knowledge does not call Reasoning.

Reasoning does not receive KnowledgeRecord internals or use authority-only
correspondence as semantic rule input. Identity-preserving use of the scalar by
a governed Reasoning rule does not make Knowledge a response generator.

## Privacy and Minimization

The following classification is exhaustive for this first slice.

| Classification                        | Material                                                                                                                                                                                                                                                                                                                                                                      |
| ------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **RULE_VISIBLE_SEMANTIC_MATERIAL**    | `subjectKey`; `predicateKey`; `textualScalar`                                                                                                                                                                                                                                                                                                                                 |
| **AUTHORITY_CORRESPONDENCE_MATERIAL** | Proposition identity; Knowledge identity/version; Accepted-state correspondence; stable accepted currentness-owner and applicable proposition/source relationship correspondence; closed Knowledge capability attribution; Source Currentness correspondence; Knowledge issuance/verification correspondence; applicable completed underlying-source authority correspondence |
| **PROHIBITED_FROM_RULE_VISIBILITY**   | Raw Knowledge records; raw provenance; acceptance evidence; Store metadata; source internals; source credentials; retrieval handles; confidence/ranking data; arbitrary source metadata; personal data not independently authorized                                                                                                                                           |
| **PROHIBITED_FROM_REASONING**         | CandidateClaim internals; KnowledgeRecord internals; authority-verifier evidence and authority-capture internals; raw provenance; source internals; Store metadata; confidence; ranking; private reasoning traces; Memory material                                                                                                                                            |

Authority/correspondence material may be preserved opaquely only where existing
architecture requires it. Preservation does not authorize Reasoning to inspect
or interpret it. Diagnostics do not broaden these categories.

## Determinism

For the same exact accepted Knowledge identity, expected version,
proposition identity, accepted structured tuple, accepted currentness-owner
correspondence, applicable stable proposition/source relationship, closed
Knowledge capability attribution,
applicable source-authority correspondence, Source Currentness state, and
Knowledge revision/state, issuance produces the same semantic projection:

```text
same subjectKey
+ same predicateKey
+ same textualScalar
```

There is no ranking, probabilistic choice, model/provider decision, parsing,
synthesis, paraphrase, normalization, alias resolution, or fallback selection.

## Failure Ownership

Failure ownership remains origin-based and closed.

### Knowledge-owned failures

- malformed structured proposition candidate;
- structured proposition supplied without the required CandidateClaim;
- missing, negative, malformed, or structurally mismatched same-proposition
  declaration;
- same-proposition declaration supplied without a structured candidate;
- invalid `subjectKey`;
- invalid `predicateKey`;
- invalid `textualScalar`;
- more than one submitted structured proposition;
- missing, unknown, combined, malformed, or unsupported accepted-source
  ownership proposal;
- an external-source-owned proposal without exactly one stable
  proposition/source relationship;
- a Knowledge-owned proposal carrying an external-only relationship;
- a proposed owner or relationship unsupported by the governing acceptance,
  attribution, or source-authority evidence;
- invalid structured proposition or proposition-identity correspondence;
- failure to issue one fresh proposition identity after successful validation;
- requested currentness-owner case inconsistent with accepted correspondence;
- inability to determine Knowledge-owned Source Currentness from the required
  authoritative lifecycle facts;
- external preparation relationship inconsistent with the stable accepted
  proposition/source relationship;
- projection-ineligible accepted item;
- Knowledge identity or expected-version mismatch at projection request;
- projection construction failure;
- Knowledge issuance failure; and
- Knowledge projection verification failure.

A completed negative Knowledge-owned Source Currentness determination is not an
operational failure. It makes the projection ineligible for that preparation
and results in no projection. It MUST NOT be collapsed into the
unable-to-determine failure.

### Underlying-source-owned failures

- failure of authority verification for authority issued by the underlying
  source.

Knowledge rejection of a proposed correspondence unsupported by completed
governing evidence is a Knowledge acceptance consequence. A failure originating
in an underlying source's authority or Source Currentness determination retains
that source's failure identity and is not translated into a Knowledge-owned
semantic failure.

### Applicable-source-owned failures

- failure of Source Currentness under the existing applicable-source ownership
  rule; Knowledge may own only the projection-cannot-be-issued operational
  consequence for the preparation cycle.

### Context-owned failures

- Context candidate prerequisite validation failure;
- Contextual Applicability failure;
- incorporation or exact-one cardinality failure;
- Context lifecycle failure; and
- Context authority failure.

### Reasoning-owned failures and Outcomes

Reasoning owns malformed Reasoning requests, unsupported bounded queries,
rule-state failures, and Reasoning Outcome construction, issuance, and
verification failures. Exact-query non-applicability and evidence
insufficiency remain completed Reasoning Outcomes, not Knowledge failures.

Propagation does not transfer ownership. A downstream boundary may reject an
invalid supplied result without acquiring ownership of the originating defect.

## Authorization and Skill Separation

None of structured acceptance, projection eligibility, projection issuance,
projection verification, authenticated Identity, Context incorporation,
Reasoning success, or a Candidate Plan establishes Security authorization.

The projection creates no Skill intent, selection, invocation, protected
execution, or permission. Security and Skill boundaries remain unchanged.

## Profiles and Production Reachability

The Context profile set remains exactly:

- Profile A: Identity;
- Profile B: Identity and Knowledge; and
- Profile C: Identity and Memory.

This projection supports only the already-approved Profile B semantic path.
Profiles A and C are unchanged. No Profile D or combined profile is created.

Specification compatibility does not make Profile B production-reachable.
Caller profile selection, Bootstrap composition, production Knowledge
retrieval, and source-aware Brain behavior remain deferred.

## Context Lifecycle Correspondence Dependency

Knowledge 1.3.0 is semantically compatible with Context 5.0.0's bounded
proposition value and does not require a new Context responsibility or change
to Profile B semantics. Context remains owner of Contextual Applicability,
exact-one incorporation, minimization, Context lifecycle, and Context
authority.

Active Context 5.1.0 provides the compatible Context correspondence required
for Knowledge 1.3.0. It preserves Context ownership of Contextual
Applicability, S2, exact-one incorporation, minimization, lifecycle, and
authority while recognizing the Active Knowledge 1.3.0 source specification.

This satisfied specification prerequisite does not make structured Profile B
production-reachable. Runtime implementation, conformance, and production
Profile B reachability remain distinct lifecycle concerns.

## CONTRACT-0001 Assessment

`CONTRACT_0001_SUFFICIENT`.

The structured projection remains within the existing governed flow:

```text
source-owned returned semantics
→ candidate availability
→ Knowledge acceptance
→ Knowledge-owned bounded projection
→ Context candidate incorporation
```

Preparation-cycle Source Currentness correspondence remains source-owned
candidate/preparation material already permitted by this flow. This revision
adds no query transport, source selection, retrieval collaboration,
cross-engine verifier exchange, generic evidence collaboration, or downstream
independent Knowledge retrieval. CONTRACT-0002 is neither required nor
created.

## Version Classification

`MINOR_VALID`.

Version 1.3.0 is a backward-compatible MINOR successor because it adds optional
structured acceptance and a concrete specialization of the existing bounded
projection capability while preserving every valid Knowledge 1.2.0 request,
record, lifecycle, authority, result, and failure semantic.

It is not PATCH because it adds a new optional accepted semantic surface and
projection eligibility. It is not MAJOR because existing CandidateClaim
callers and claim-only accepted Knowledge remain valid, existing records need
no migration to remain valid, no existing semantic surface is removed or
reinterpreted, and use of the new surface is explicit.

## Deferred Implementation Scope

This specification defines semantic executable requirements but does not
prescribe:

- TypeScript types;
- database schemas or persistence migrations;
- operation, method, or API names;
- serialization or wire formats;
- hashes, signatures, or cryptographic tokens;
- runtime classes or provider implementations;
- allocation mechanics for proposition identity;
- Bootstrap wiring or dependency injection;
- production profile selection or reachability;
- UI or response rendering;
- diagnostics;
- tests and conformance fixtures; or
- activation and release sequencing.

Implementation must preserve the exact semantic predicates and boundaries in
this specification without introducing new architecture.

## Conformance Expectations

Before implementation closure, conformance evidence must show:

- existing CandidateClaim and claim-only acceptance behavior is unchanged;
- no tuple is parsed or inferred from CandidateClaim;
- the required affirmative same-proposition declaration and every closed
  missing/inconsistent declaration consequence;
- the existing acceptance caller supplies exactly one closed accepted-source
  ownership proposal for structured acceptance;
- Knowledge accepts an owner and external relationship only when governing
  acceptance, attribution, and source-authority evidence supports them;
- Knowledge-owned accepted correspondence contains no fabricated external
  relationship, while external-source-owned correspondence contains exactly
  one stable relationship;
- successful structured acceptance issues exactly one fresh non-content-derived
  proposition identity and failed acceptance binds none;
- exact key and scalar validation at the specified code-point bounds;
- exact unnormalized preservation and equality;
- zero-or-one projection from the exact identity/version target;
- claim-only projection ineligibility without invalidating accepted Knowledge;
- exact accepted-proposition and issuance verification correspondence;
- preparation-cycle Source Currentness correspondence without acceptance-time
  inference or ownership transfer;
- Knowledge-owned positive, negative, and unable-to-determine currentness
  outcomes with exact CandidatePreparationAssociation binding;
- closed Knowledge capability attribution without a separate attribution
  identity, allocator, token, or persisted operand;
- issuance correspondence and verification governed by one process-local exact-
  object Knowledge projection-authority capture;
- exact accepted-owner comparison and, for the external case, exact stable
  proposition/source relationship comparison at projection eligibility;
- absence of CandidatePreparationAssociation, preparation results, freshness,
  verifier results, TTL, latest, or refresh state from accepted proposition
  correspondence;
- preserved underlying-source authority and Source Currentness ownership;
- Context and Reasoning opacity boundaries;
- privacy/minimization classifications;
- no ranking, latest lookup, synthesis, aliases, ontology, or registry;
- Profiles A/B/C preservation; and
- CONTRACT-0001 sufficiency with no CONTRACT-0002; and
- deferred activation until compatible Context specification correspondence is
  Active.

This section defines required evidence, not a concrete test or runtime design.

## Change History

| Version | Date       | Description                                                                                                                                                                                                                        |
| ------- | ---------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1.0.0   | 2026-07-20 | Established the Knowledge Engine vertical slice, retrieval, reference, lifecycle, and Store behavior.                                                                                                                              |
| 1.1.0   | 2026-08-11 | Added unchanged Get Knowledge participation as a qualified source for CONTRACT-0001 Context preparation.                                                                                                                           |
| 1.2.0   | 2026-08-16 | Added bounded proposition projection issuance and verification for Source-Aware Reasoning participation.                                                                                                                           |
| 1.3.0   | 2026-08-17 | Drafted additive structured textual proposition acceptance and projection; synchronized accepted source ownership, lifecycle currentness, Knowledge capability attribution, and single-capture projection authority with ADR-0021. |
| 1.3.0   | 2026-08-20 | Superseded by Knowledge Engine 2.0.0.                                                                                                                                                                                              |

## References

- [Knowledge Engine 1.2.0](ENGINE-0005-Knowledge-Engine-Revision-1.2.0.md)
- [Context Engine 5.0.0](../context/ENGINE-0003-Context-Engine-Revision-5.0.0.md)
- [Reasoning Engine 3.0.0 Draft](../reasoning/ENGINE-0006-Reasoning-Engine-Revision-3.0.0.md)
- [Reasoning Executable Bounded-Rule Draft](../reasoning/ENGINE-0006-Reasoning-Engine-Executable-Bounded-Rule.md)
- [Planning Engine 2.1.0](../planning/ENGINE-0007-Planning-Engine-Revision-2.1.0.md)
- [Brain Engine 2.0.3](../ENGINE-0001-Brain-Engine-Revision-2.0.3.md)
- [ADR-0020 — Knowledge Evidence Boundary for Source-Aware Reasoning](../../../docs/adr/ADR-0020-Knowledge-Evidence-Boundary-for-Source-Aware-Reasoning.md)
- [ADR-0021 — Knowledge Source Currentness and Projection Attribution](../../../docs/adr/ADR-0021-Knowledge-Source-Currentness-and-Projection-Attribution.md)
- [ADR-0008 — Context Collaboration and Source Ownership](../../../docs/adr/ADR-0008-Context-Collaboration-Source-Ownership-and-Reference-Authority.md)
- [ADR-0011 — Contextual Currentness](../../../docs/adr/ADR-0011-Source-Currentness-Contextual-Currentness-and-Currentness-Change.md)
- [ADR-0012 — Authorization and Context Preparation](../../../docs/adr/ADR-0012-Authorization-Semantics-Enforcement-and-Authorized-Reference-Applicability.md)
- [ADR-0013 — Failure Ownership](../../../docs/adr/ADR-0013-Failure-Ownership-Propagation-and-Candidate-Context-Revision-Consequences.md)
- [ADR-0017 — Execution-model Independence](../../../docs/adr/ADR-0017-Execution-Model-Independence-for-Asynchronous-Event-Driven-and-Distributed-Collaboration.md)
- [CONTRACT-0001 — Context Source Retrieval](../../../docs/contracts/CONTRACT-0001-Context-Source-Retrieval.md)
- [CONCEPT-0002 — Knowledge Model](../../concepts/CONCEPT-0002-Knowledge-Model.md)
- [CONCEPT-0003 — Context Model](../../concepts/CONCEPT-0003-Context-Model.md)
- [Documentation Authority](../../../docs/DOCUMENT-AUTHORITY.md)
- [OES-0004 — Contracts](../../../docs/engineering/OES-0004-Contracts.md)
- [OES-0008 — Documentation Standards](../../../docs/engineering/OES-0008-Documentation-Standards.md)
- [OES-0010 — Versioning Standards](../../../docs/engineering/OES-0010-Versioning-Standards.md)

## Engineering Motto

> Knowledge accepts explicit bounded semantics; Context decides participation.
