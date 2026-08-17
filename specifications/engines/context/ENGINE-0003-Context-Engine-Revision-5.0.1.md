# ENGINE-0003 — Context Engine Revision

| Field          | Value                                                                                                           |
| -------------- | --------------------------------------------------------------------------------------------------------------- |
| **Status**     | Active                                                                                                          |
| **Supersedes** | 5.0.0                                                                                                           |
| **Version**    | 5.0.1                                                                                                           |
| **Owner**      | Context Engine                                                                                                  |
| **Created**    | 2026-08-17                                                                                                      |
| **Updated**    | 2026-08-17                                                                                                      |
| **Applies To** | Context 5.0.0 semantic preservation and closed Knowledge 1.2.0/1.3.0 specification correspondence for Profile B |

---

## Status and Authority

This specification is Active and is the sole current canonical ENGINE-0003
revision. It supersedes versions 1.0.0, 1.1.0, 2.0.0, 3.0.0, 4.0.0, and 5.0.0.
Those revisions remain historical and non-authoritative.

This revision incorporates every normative Context 5.0.0 semantic unchanged.
Its only normative delta is a closed specification correspondence that permits
Context to remain valid while the Knowledge source revision transitions from
Active Knowledge 1.2.0 to a future Active Knowledge 1.3.0.

Applicable Active ADRs, Concepts, Engineering Standards, CONTRACT-0001, and
the Active member of the closed Knowledge compatibility set govern in a
conflict.

## Purpose

Context 5.0.0 names Knowledge 1.2.0 exactly as the producer of its Profile B
bounded proposition candidate. Knowledge 1.3.0 is an architecturally approved
Draft that preserves the Knowledge 1.2.0 projection boundary and specializes
the bounded semantic value as one structured textual tuple:

```text
{
  subjectKey,
  predicateKey,
  textualScalar
}
```

This PATCH recognizes that compatible source revision without changing
Context behavior, ownership, profiles, candidate treatment, incorporation,
stable reuse, lifecycle, authority, failure semantics, privacy, or downstream
boundaries.

## Context 5.0.0 Semantic Preservation

Every Context 5.0.0 normative semantic remains unchanged, including:

- preparation and outer request/profile validation;
- retrieval initiation and candidate-set handling;
- candidate availability distinct from incorporation;
- pre-incorporation structural validation of completed issuer correspondence;
- Contextual Applicability;
- Source Currentness and Contextual Currentness separation;
- exact-one qualifying incorporation;
- minimized Context-owned fragment construction;
- canonical profile ordering;
- revision identity, lineage, stable reuse, successor creation, and historical
  immutability;
- Context lifecycle, activation, authority issuance, and authority verification;
- originating failure ownership and Context-owned candidate consequences;
- authorization independence;
- Memory and Identity behavior;
- source opacity in Reasoning where governed and in Planning and Brain; and
- execution-model, persistence, reconstruction, and dependency boundaries.

This PATCH adds no Context request, result, fragment, lifecycle, authority,
failure, profile, or decision semantic. It adds no orchestration phase or
Context decision branch.

## Closed Knowledge Compatibility Set

Context 5.0.1 recognizes exactly the following Knowledge source revisions for
Profile B specification correspondence:

| Knowledge revision | Lifecycle role | Context 5.0.1 correspondence | Condition                                                                          |
| ------------------ | -------------- | ---------------------------- | ---------------------------------------------------------------------------------- |
| 1.2.0              | current        | supported                    | while Knowledge 1.2.0 is Active                                                    |
| 1.3.0              | future         | supported                    | only once Knowledge 1.3.0 is Active after its independent acceptance prerequisites |

No other Knowledge revision is implied or accepted by this correspondence.
There is no semantic-version range, latest-version selection, dynamic
negotiation, open registry, automatic successor recognition, or arbitrary
mix-and-match compatibility.

Exactly one Knowledge revision is Active in the composed lifecycle at a time.
Dual compatibility means Context 5.0.1 is semantically valid with either
closed member; it does not mean that two Knowledge authorities or two
projections participate simultaneously.

## Knowledge 1.2.0 Compatibility

Knowledge 1.2.0 remains fully supported. Context continues to receive a
Knowledge-owned bounded proposition projection whose governed correspondence
includes:

- proposition identity;
- bounded proposition semantic value;
- Knowledge identity and exact version;
- Accepted-state correspondence;
- Source Currentness correspondence for the preparation boundary;
- Knowledge attribution; and
- completed issuer-authority verification correspondence.

Context treats that material exactly as Context 5.0.0 specifies. Activation of
Context 5.0.1 before Knowledge 1.3.0 therefore does not require an atomic
Knowledge transition and does not invalidate Active Knowledge 1.2.0.

## Knowledge 1.3.0 Compatibility

Knowledge 1.3.0 preserves the complete Knowledge 1.2.0 projection ownership and
correspondence boundary. It specializes the bounded proposition semantic value
for its first executable slice as the exact accepted tuple:

- `subjectKey`;
- `predicateKey`; and
- `textualScalar`.

Context 5.0.1 recognizes that tuple as the existing bounded proposition
semantic value. It does not redefine, parse, normalize, infer, compare,
translate, enrich, repair, or issue any tuple component.

Knowledge remains owner of:

- structured proposition acceptance and accepted semantics;
- CandidateClaim opacity and same-proposition acceptance assertion;
- tuple validation and immutable preservation;
- proposition identity;
- Knowledge identity, version, Accepted state, and attribution;
- bounded projection issuance and Knowledge-owned verification;
- preservation of applicable underlying-source correspondence; and
- Source Currentness responsibility when Knowledge is the applicable owner.

Recognition of Knowledge 1.3.0 does not make its Draft Active and does not
claim its runtime implementation or conformance work is complete.

## Fixed Profile Preservation

The profile set and canonical order remain exactly:

- **Profile A:** `[Identity]`;
- **Profile B:** `[Identity, Knowledge]`; and
- **Profile C:** `[Identity, Memory]`.

No profile is added, removed, merged, generalized, or made dynamic. There is no
Profile D, combined Knowledge-and-Memory profile, generic N-source profile, or
automatic profile selection.

Profile A and Profile C behavior is unchanged. Profile B remains the exact
Context 5.0.0 profile; only its closed compatible Knowledge source revision set
is updated.

## Candidate Material Boundary

The candidate boundary remains:

```text
source-owned returned semantics
→ candidate availability
→ Context structural prerequisite validation
→ Contextual Applicability
→ incorporation
→ Context lifecycle, activation, and authority
```

Candidate availability establishes none of incorporation, Contextual
Currentness, validation, activation, Context authority, authorization,
exact-query applicability, evidence sufficiency, or downstream response
correctness.

A Knowledge 1.2.0 or 1.3.0 projection remains Knowledge-owned source material
through candidate consideration. Context constructs its own non-aliased,
minimized fragment only after every Context-owned prerequisite succeeds.

## Verification-Domain Preservation

The verification sequence and authority domains remain exactly those of
Context 5.0.0:

```text
Knowledge-issued bounded projection
→ Knowledge-owned verifier
→ completed Knowledge verification correspondence

underlying-source-issued authority, where applicable
→ underlying-source-owned verifier
→ completed underlying-source correspondence

Context
→ validates required presence and structural admissibility
→ preserves completed correspondence where governed
→ does not semantically reverify either issuer
```

Context verification or incorporation does not prove Knowledge truth,
acceptance correctness, underlying-source authority, Source Currentness,
authorization, exact-query applicability, or evidence sufficiency.

No revision transition transfers verifier ownership to Context or merges the
Knowledge and underlying-source verification domains.

## Source Currentness

ADR-0011 and Context 5.0.0 Source Currentness semantics remain unchanged.

- The applicable source owns Source Currentness.
- Knowledge owns it only when Knowledge is the applicable source.
- Another qualified/original source retains its own determination where it is
  the applicable owner.
- Source-owned currentness correspondence for the current preparation cycle
  may travel in the existing CONTRACT-0001 candidate/preparation flow.
- Context may validate required presence and structural admissibility but does
  not determine or renew Source Currentness.
- Context alone determines Contextual Currentness.

Acceptance, version, retrieval, possession, delivery, issuer verification, and
incorporation do not themselves establish Source Currentness. This PATCH
defines no TTL, refresh, synchronization, recollection, polling, implicit
latest lookup, or perpetual-currentness rule.

Later source-currentness change does not mutate a stable, Active, or historical
Context revision. It affects only a later preparation cycle according to
existing lifecycle rules.

## Contextual Applicability

Context retains sole ownership of Contextual Applicability exactly as specified
by Context 5.0.0: whether an otherwise governed candidate is suitable for the
particular Context revision under preparation.

This PATCH defines no executable Contextual Applicability predicate, algorithm,
decision representation, heuristic, model, or implementation. That existing
specification/runtime gap remains open and is not hidden or closed by source
revision correspondence.

Contextual Applicability does not determine Reasoning's exact-query
applicability or evidence sufficiency.

## Exact-One Incorporation

Context 5.0.0 exact-one semantics remain unchanged:

- zero qualifying propositions cannot produce a successful Profile B
  activation;
- exactly one qualifying proposition may be incorporated when every other
  prerequisite succeeds; and
- more than one qualifying proposition cannot produce a successful Profile B
  activation.

Knowledge 1.3.0's zero-or-one structured proposition per accepted item and
zero-or-one projection per exact target are Knowledge-domain and
operation-level constraints. They do not replace Context's candidate-set
cardinality, cause automatic incorporation, or authorize Context to rank or
select among multiple candidates.

## Stable Reuse and Exact Correspondence

Stable reuse remains governed by Context 5.0.0 semantic equivalence. For
Profile B, equivalence continues to include:

- canonical profile structure and Identity fragment semantics;
- proposition identity and complete bounded proposition semantic value;
- Knowledge identity and exact version;
- Accepted-state and Source Currentness correspondence;
- Knowledge attribution;
- applicable issuer-authority correspondence; and
- all other Context-owned revision semantics required by Context 5.0.0.

For Knowledge 1.3.0, the complete bounded semantic value is the exact
`subjectKey`, `predicateKey`, and `textualScalar` tuple. Existing comparison of
the complete semantic value therefore already covers the tuple; no stable-reuse
rule changes.

A changed tuple component, proposition identity, Knowledge identity/version,
state, currentness correspondence, attribution, or authoritative issuer
correspondence is changed Context content. Structural wrapper equivalence does
not establish semantic equivalence, and no object-aliasing or implementation
identity mechanism is prescribed.

## Failure Ownership

Originating failure ownership remains unchanged:

- Knowledge projection construction, issuance, accepted-proposition
  correspondence, or Knowledge verification failures remain Knowledge-owned;
- underlying-source authority failures remain owned by that source;
- Source Currentness failures remain owned by the applicable owner;
- Context request/profile, candidate-set, structural, Contextual
  Applicability, Contextual Currentness, exact-one, incorporation, validation,
  lifecycle, activation, and authority failures remain Context-owned;
- Reasoning outcomes and Reasoning failures remain Reasoning-owned; and
- Security and Skill failures retain their established owners.

Context may own the consequence for its candidate revision without translating,
wrapping, replacing, or absorbing the originating failure. Knowledge revision
compatibility introduces no new failure category.

## Privacy and Minimization

Context preserves the Context 5.0.0 minimal Profile B fragment boundary.
Knowledge 1.3.0's rule-visible semantic material is limited to:

- `subjectKey`;
- `predicateKey`; and
- `textualScalar`.

Proposition identity, Knowledge identity/version, Accepted-state
correspondence, attribution, Source Currentness correspondence, Knowledge
verification correspondence, and applicable underlying-source authority
correspondence remain authority/correspondence material and are not Reasoning
rule inputs.

CandidateClaim, the same-proposition acceptance declaration, KnowledgeRecord,
acceptance evidence, raw provenance, source internals, Store metadata,
confidence/ranking data, credentials, retrieval handles, and private reasoning
material remain excluded from the Reasoning-visible fragment.

This PATCH adds no exposure, diagnostic exception, public provenance handle,
or generic evidence representation.

## Reasoning and Downstream Correspondence

Reasoning 2.0.0 remains Active and is not redefined by this PATCH. Reasoning
3.0.0 and its executable bounded-rule specification remain future Drafts.
Context 5.0.1 introduces no Reasoning category, query rule, sufficiency rule,
Outcome, API, or authority behavior.

When later lifecycle prerequisites are satisfied, the Knowledge 1.3.0 tuple
may be the bounded semantic material carried through authoritative Context for
the approved future Reasoning rule. That conditional compatibility does not
activate Reasoning 3.0.0 or make its runtime complete.

Planning 2.1.0 and Brain 2.0.3 remain unchanged and source-opaque. Neither
receives the Knowledge tuple, proposition correspondence, currentness,
provenance, Context fragments, or Reasoning evidence as independent input.
This PATCH defines no downstream API, decision branch, or execution semantic.

## CONTRACT-0001 Assessment

`CONTRACT_0001_SUFFICIENT`.

Both supported Knowledge revisions specialize the existing source side of the
same Contract. Context still initiates preparation retrieval; Knowledge still
owns request interpretation and returned projection semantics; returned
material remains candidate material; and existing source-owned attribution,
revision, authority-origin, and currentness correspondence remain preserved.

This PATCH adds no source selection, query transport, retrieval operation,
generic currentness service, authority-verification exchange, independent
downstream Knowledge retrieval, or new cross-capability collaboration.
CONTRACT-0002 is neither required nor created.

## Backward Compatibility

`PATCH_VALID`.

Context 5.0.1 accepts every valid Context 5.0.0 request, source candidate,
profile, revision state, authority correspondence, and lifecycle state without
semantic change. In particular:

- Profile A and Profile C are unchanged;
- Knowledge 1.2.0 Profile B candidates remain supported without migration;
- Knowledge 1.3.0 candidates use the same bounded semantic-value and
  correspondence boundary;
- exact-one, minimization, stable reuse, and authority semantics are unchanged;
- current downstream consumers remain source-opaque; and
- no existing failure is reclassified.

The delta is a backward-compatible correction to exact source-specification
correspondence, not a new feature or breaking change.

## Lifecycle Transition

The closed compatibility set supports this sequence:

### Phase 1

- Context 5.0.1 Active;
- Knowledge 1.2.0 Active; and
- Knowledge 1.3.0 remains Draft.

### Phase 2

- Context 5.0.1 Active; and
- Knowledge 1.3.0 Active only after its independent acceptance, implementation,
  conformance, and lifecycle prerequisites are satisfied.

Context 5.0.1 may therefore activate before Knowledge 1.3.0. No atomic Context
and Knowledge activation is required, although atomic activation remains
semantically safe if all independent prerequisites are satisfied.

Once Context 5.0.1 is Active, the specification-correspondence blocker to a
later Knowledge 1.3.0 activation is resolved. That statement proves no runtime
or production readiness.

## Active-Specification and Runtime Correspondence

This PATCH is specification correspondence only. It neither implements nor
claims completion of:

- Knowledge 1.3.0 structured acceptance or projection runtime;
- Context 5.0.0/5.0.1 Profile B runtime;
- executable Contextual Applicability;
- Core language for the projection or Context fragment;
- Bootstrap composition;
- production Profile B reachability;
- Reasoning 3.0.0 runtime;
- conformance, diagnostics, or integration tests.

`KNOWLEDGE_1_3_RUNTIME_IMPLEMENTATION_REMAINS_OPEN`.

`CONTEXT_5_RUNTIME_IMPLEMENTATION_REMAINS_OPEN`.

The existing REAS3 implementation gaps, including the Context runtime gap, are
not closed by this revision.

## Authorization and Skill Separation

Source compatibility, candidate availability, completed verification
correspondence, Context incorporation, Context authority, and an authoritative
Context revision do not establish Security authorization.

This PATCH creates no Skill intent, selection, invocation, protected action,
or execution permission.

## Deferred Scope

The following remain deferred:

- runtime and Core implementation;
- Contextual Applicability executable rules;
- concrete requests, results, fields, and APIs;
- dynamic dependency/version negotiation;
- Bootstrap composition and production profile selection;
- production Profile B reachability;
- Reasoning, Planning, and Brain implementation work;
- diagnostics, conformance, integration tests, and test fixtures;
- transport, serialization, persistence, providers, and deployment;
- activation sequencing execution; and
- support for any Knowledge revision outside the closed set.

## Conformance Expectations

Before implementation closure, evidence must show:

- complete Context 5.0.0 semantic non-regression;
- support for Active Knowledge 1.2.0 before the Knowledge transition;
- support for Knowledge 1.3.0 only after its activation;
- rejection of arbitrary or unknown Knowledge revision correspondence;
- exactly Profiles A/B/C and canonical order;
- Knowledge ownership of tuple semantics and verification;
- underlying-source verification-domain separation;
- Source Currentness and Contextual Currentness separation;
- unchanged Contextual Applicability and exact-one ownership;
- unchanged stable-reuse equivalence;
- originating failure preservation;
- privacy-minimized Reasoning visibility;
- source opacity in Planning and Brain;
- CONTRACT-0001 sufficiency and CONTRACT-0002 absence; and
- no production Profile B reachability from specification compatibility alone.

This section defines evidence requirements only and no runtime design.

## Version Classification

Version 5.0.1 is a backward-compatible PATCH. It corrects exact specification
correspondence so Context can remain semantically unchanged across the closed
Knowledge 1.2.0-to-1.3.0 lifecycle transition.

If later implementation or review demonstrates that Context must change a
profile, candidate semantic, Contextual Applicability rule, incorporation rule,
stable reuse rule, lifecycle, authority, failure, privacy, request, result, or
downstream boundary, that change requires an independently classified
successor; this revision authorizes no such semantic change.

## Change History

| Version | Date       | Description                                                                                              |
| ------- | ---------- | -------------------------------------------------------------------------------------------------------- |
| 1.0.0   | 2026-07-19 | Established the original Identity-only Context Engine vertical slice.                                    |
| 1.1.0   | 2026-07-29 | Added issuer-owned Active Context Revision authority verification.                                       |
| 2.0.0   | 2026-08-11 | Aligned Context-owned Identity retrieval with CONTRACT-0001.                                             |
| 3.0.0   | 2026-08-11 | Added the fixed Identity + Knowledge preparation profile.                                                |
| 4.0.0   | 2026-08-11 | Added the fixed Identity + Memory profile while preserving the Identity and Knowledge profiles.          |
| 5.0.0   | 2026-08-16 | Added the bounded Knowledge proposition incorporation boundary for the existing fixed Knowledge profile. |
| 5.0.1   | 2026-08-17 | Drafted closed Knowledge 1.2.0/1.3.0 correspondence while preserving Context 5.0.0 semantics unchanged.  |

## References

- [Context Engine 5.0.0](ENGINE-0003-Context-Engine-Revision-5.0.0.md)
- [Knowledge Engine 1.2.0](../knowledge/ENGINE-0005-Knowledge-Engine-Revision-1.2.0.md)
- [Knowledge Engine 1.3.0 Draft](../knowledge/ENGINE-0005-Knowledge-Engine-Revision-1.3.0.md)
- [Reasoning Engine 2.0.0](../reasoning/ENGINE-0006-Reasoning-Engine-Revision-2.0.0.md)
- [Reasoning Engine 3.0.0 Draft](../reasoning/ENGINE-0006-Reasoning-Engine-Revision-3.0.0.md)
- [Reasoning Executable Bounded-Rule Draft](../reasoning/ENGINE-0006-Reasoning-Engine-Executable-Bounded-Rule.md)
- [Planning Engine 2.1.0](../planning/ENGINE-0007-Planning-Engine-Revision-2.1.0.md)
- [Brain Engine 2.0.3](../ENGINE-0001-Brain-Engine-Revision-2.0.3.md)
- [ADR-0020 — Knowledge Evidence Boundary for Source-Aware Reasoning](../../../docs/adr/ADR-0020-Knowledge-Evidence-Boundary-for-Source-Aware-Reasoning.md)
- [ADR-0008 — Context Collaboration and Source Ownership](../../../docs/adr/ADR-0008-Context-Collaboration-Source-Ownership-and-Reference-Authority.md)
- [ADR-0009 — Context Revision Preparation and Lifecycle](../../../docs/adr/ADR-0009-Context-Revision-Preparation-Reference-Stability-and-Source-Change.md)
- [ADR-0010 — Context Retrieval Initiation](../../../docs/adr/ADR-0010-Context-Retrieval-Initiation-Request-and-Result-Semantics.md)
- [ADR-0011 — Source and Contextual Currentness](../../../docs/adr/ADR-0011-Source-Currentness-Contextual-Currentness-and-Currentness-Change.md)
- [ADR-0012 — Authorization and Context Preparation](../../../docs/adr/ADR-0012-Authorization-Semantics-Enforcement-and-Authorized-Reference-Applicability.md)
- [ADR-0013 — Failure Ownership](../../../docs/adr/ADR-0013-Failure-Ownership-Propagation-and-Candidate-Context-Revision-Consequences.md)
- [CONTRACT-0001 — Context Source Retrieval](../../../docs/contracts/CONTRACT-0001-Context-Source-Retrieval.md)
- [CONCEPT-0002 — Knowledge Model](../../concepts/CONCEPT-0002-Knowledge-Model.md)
- [CONCEPT-0003 — Context Model](../../concepts/CONCEPT-0003-Context-Model.md)
- [Documentation Authority](../../../docs/DOCUMENT-AUTHORITY.md)
- [OES-0004 — Contracts](../../../docs/engineering/OES-0004-Contracts.md)
- [OES-0008 — Documentation Standards](../../../docs/engineering/OES-0008-Documentation-Standards.md)
- [OES-0010 — Versioning Standards](../../../docs/engineering/OES-0010-Versioning-Standards.md)

## Engineering Motto

> Context preserves its semantics while compatible Knowledge correspondence evolves.
