# ENGINE-0003 — Context Engine Revision

| Field          | Value                                                      |
| -------------- | ---------------------------------------------------------- |
| **Status**     | Active                                                     |
| **Supersedes** | 5.0.1                                                      |
| **Version**    | 5.1.0                                                      |
| **Owner**      | Context Engine                                             |
| **Created**    | 2026-08-18                                                 |
| **Updated**    | 2026-08-18                                                 |
| **Applies To** | Context preparation and Profile B contextual applicability |

---

## Status and authority

This specification is Active and is the sole current canonical ENGINE-0003
revision. It supersedes Context 5.0.1; that revision and earlier revisions
remain historical and non-authoritative. All 5.0.1 semantics are incorporated
by reference except for the closed Contextual Applicability and
preparation/reuse clarifications stated here.

Applicable Active ADRs, Concepts, Engineering Standards, CONTRACT-0001, and
the applicable Active Knowledge specification govern in a conflict. **ADR-0022
— Context Preparation Semantic Scope and Applicability Policy, Active 1.0.0**
is the governing architectural decision for the preparation scope, its
caller-to-Context input boundary, Context ownership, and the S2 Contextual
Applicability predicate defined below. ADR-0022 complements ADR-0020 and
ADR-0021; it does not supersede them.

## Purpose and scope

This revision closes the Context-owned decision needed for a later Core to
represent Profile B candidate incorporation without inventing result states or
failure behavior. It defines no runtime, Core, Bootstrap, provider, store,
Reasoning, Planning, Brain, transport, or production Profile B wiring.

Profiles remain exactly:

- **Profile A:** `[Identity]`;
- **Profile B:** `[Identity, Knowledge]`; and
- **Profile C:** `[Identity, Memory]`.

Profile A, Profile C, identity-only Context, legacy KnowledgeReference Profile B,
all existing Context revisions, and Context authority remain unchanged.

## ContextPreparationSemanticScope

For the structured Profile B preparation path, Context adopts one
`ContextPreparationSemanticScope` containing exactly one requested `subjectKey`
coordinate and one requested `predicateKey` coordinate. The caller supplies
those coordinates through the Context preparation input boundary. This is value
origin only: Context owns the coordinates' semantic meaning as a preparation
scope, validates them, adopts them, freezes them for the preparation, compares
verified candidates against them, and owns the resulting applicability and
incorporation consequences. Supplying the coordinates does not transfer
Contextual Applicability ownership to the caller.

The scope is a Context preparation operand, not a Knowledge request, Knowledge
target, Reasoning query, authorization policy, provenance, source selector,
ranking criterion, generic metadata, or arbitrary free-text purpose. Brain and
Bootstrap may later transport the preparation input as opaque composition data,
but MUST NOT derive or interpret the coordinates, select Knowledge, evaluate
applicability, or turn the scope into a source request.

Context validates both coordinates before source or candidate work begins.
Each MUST be a primitive textual coordinate satisfying the existing bounded
structured-key constraints and exact stored Unicode code-point semantics. No
Unicode normalization, trimming, case folding, locale transformation, alias
resolution, ontology lookup, semantic equivalence, fuzzy comparison, or model
judgment is permitted. Missing, malformed, or unsupported scope input is a
Context preparation/prerequisite failure and MUST NOT become
`NOT_APPLICABLE`.

The scope is immutable within its one preparation, cannot be inferred from
candidate content, and cannot be replaced after candidate/source work begins.
Every later preparation establishes and validates its own scope. Scope exists
before source work but is not transmitted to Knowledge or sources; Knowledge
does not receive it as a target, filter, ranking criterion, or verifier input.
`SCOPE_VISIBLE_TO_KNOWLEDGE: NO`.

`SCOPE_VISIBLE_TO_REASONING: NO`: Reasoning receives only the incorporated
structured tuple as governed semantic Knowledge material. The scope is not a
Reasoning query, evidence, applicability input, or sufficiency input.

## Contextual Applicability subject and boundary

Contextual Applicability evaluates the exact verified Knowledge candidate
material presented for potential incorporation into the current Profile B
preparation. The candidate is the completed Knowledge projection after
Knowledge-owned issuance and verification correspondence has succeeded and
Context has completed its structural prerequisite validation.

The decision asks only whether that candidate satisfies the exact S2
subject-and-predicate predicate for incorporation in this Context preparation
under the fixed Profile B structure and the governed Context preparation state.
It does not evaluate Knowledge truth, source truth, Source Currentness,
authorization, a Reasoning query, Reasoning sufficiency, or response
correctness.

The lifecycle boundary is:

```text
caller supplies requested scope
→ Context validates and adopts immutable scope
→ CandidatePreparationAssociation established separately
→ preparation established and source/candidate work proceeds
→ candidate returned
→ originating Knowledge/source prerequisites complete
→ Context structural prerequisite validation
→ Contextual Applicability
→ qualifying candidate set
→ exact-one incorporation consequence
→ revision construction, reuse/successor, activation, and authority
```

Context owns the decision. Knowledge retains projection and verification
ownership; the applicable source retains Source Currentness ownership; Security
retains authorization ownership; and Reasoning does not determine Contextual
Applicability.

## Closed Contextual Applicability result

After the candidate and its prerequisites are structurally valid, Context MUST
produce exactly one of these two and only these two results:

| Result           | Meaning                                                                                                                                                                    |
| ---------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `APPLICABLE`     | The exact verified candidate's `subjectKey` and `predicateKey` exactly equal the corresponding coordinates of the current preparation's `ContextPreparationSemanticScope`. |
| `NOT_APPLICABLE` | For an otherwise-valid candidate and valid scope, at least one of those two exact coordinate comparisons mismatches.                                                       |

`APPLICABLE` permits the candidate to enter the qualifying candidate set. It
does not activate a revision or establish Knowledge truth, Source Currentness,
authorization, Reasoning applicability, Reasoning sufficiency, or response
correctness.

`NOT_APPLICABLE` excludes the candidate from the qualifying set. It is a
completed Context-owned negative decision, not an upstream Knowledge/source
failure, not a Knowledge-authority transfer, and not a Reasoning result.

There is no `UNABLE_TO_DETERMINE` applicability result. A missing, malformed,
contradictory, unsupported, or otherwise invalid prerequisite prevents the
applicability decision and is a Context-owned prerequisite/validation failure;
it MUST NOT be represented as `NOT_APPLICABLE`. An originating Knowledge,
underlying-source, Source Currentness, Security, or infrastructure failure
retains its originating owner and is not reclassified as an applicability
result.

The decision is bounded to the current preparation and has no meaning for a
different preparation.

The exhaustive predicate is:

```text
APPLICABLE iff
candidate.subjectKey == scope.subjectKey
AND
candidate.predicateKey == scope.predicateKey
```

where `==` is exact stored Unicode code-point equality under the validated
bounded-key rules above. Conversely:

```text
NOT_APPLICABLE iff
candidate.subjectKey != scope.subjectKey
OR
candidate.predicateKey != scope.predicateKey
```

No other semantic operand participates. `textualScalar` is never an
applicability operand; it is the proposition value after the subject/predicate
slot qualifies. Two otherwise-valid candidates with equal subject and
predicate but different scalar values are therefore each `APPLICABLE`, and
their multiplicity is handled only by the exact-one rule. Identity does not
participate in scope matching and supplies no alias, subject, predicate,
domain, or authorization inference.

## Permitted evaluation operands

For semantic evaluation, Context may inspect only:

- the structured tuple `subjectKey`, `predicateKey`, `textualScalar`;
- the fixed Profile B structure; and
- the validated immutable `ContextPreparationSemanticScope` and other already-
  governed state of the current Context preparation.

Only `subjectKey` and `predicateKey` are used by the Contextual Applicability
predicate. Identity remains a separate Profile B fragment and is not a scope
matching operand.

Context MUST NOT semantically inspect or interpret provenance, CandidateClaim,
KnowledgeRecord, source payloads, acceptance evidence, credentials, Store
metadata, verifier internals, Knowledge truth, source authority semantics,
Source Currentness internals, or a Reasoning query.

The structured K13 Profile B fragment is additive. The legacy
`KnowledgeContextProjection`/KnowledgeReference boundary remains supported
unchanged for existing revisions and consumers; the structured fragment is
used only by a later governed structured Profile B path. No legacy fragment is
migrated, rewritten, or made production-reachable by this Draft.

Correspondence supplied with the candidate is opaque Context material. Context
may check only its required presence, structural admissibility, and exact
binding where an existing Context rule authorizes that check. This includes
PropositionIdentity, Knowledge identity/version, Accepted-state and source
ownership correspondence, applicable underlying-source authority
correspondence, Knowledge attribution, and Knowledge issuance/verification
correspondence. Context MUST preserve such bounded correspondence without
reverifying, reconstructing, or merging authority domains.

Preparation Source Currentness correspondence may be structurally validated
and preserved for the incorporated revision. Context MUST NOT determine or
renew Source Currentness.

## CandidatePreparationAssociation

Context preparation establishes CandidatePreparationAssociation before source
work. The association belongs to exactly one preparation and may bind returned
projection and currentness correspondence to that preparation. It is not a
stable Context identity, a semantic comparison operand, a reusable
applicability identity, or a source of `subjectKey`/`predicateKey`.

`ContextPreparationSemanticScope` and CandidatePreparationAssociation are
distinct: the scope expresses the semantic slot expected by the preparation;
the association is opaque preparation-cycle correlation and replay protection.
Neither substitutes for the other, and the association MUST NOT participate in
scope matching.

The applicability result belongs to the preparation state that owns the
decision; it need not carry or persist the association as a fragment field. A
result from preparation A MUST NOT satisfy preparation B. A later preparation
performs its own structural prerequisite, applicability, and applicable
currentness work. No UUID, counter, hash, timestamp, registry, or synchronization
mechanism is prescribed.

## Exact-one incorporation

The qualifying set contains exactly the candidates whose Contextual
Applicability result is `APPLICABLE` and whose other Context prerequisites pass.
The sequence is therefore:

```text
validated verified candidate
→ Contextual Applicability result
→ qualifying candidate set
→ cardinality consequence
```

- zero qualifying candidates: no successful Profile B activation;
- exactly one qualifying candidate: incorporation is permitted when every
  remaining prerequisite succeeds; and
- more than one qualifying candidate: no successful Profile B activation.

Context MUST NOT rank, fall back, select latest, arbitrarily select, merge, or
synthesize candidates. Knowledge's zero-or-one projection cardinality is not a
substitute for Context candidate-set cardinality.

## Persistence, authority, and stable reuse

The `APPLICABLE`/`NOT_APPLICABLE` decision is preparation-only decision material.
It is not persisted in the stable Context fragment merely for diagnostics. A
successful revision persists only the existing minimized structured fragment
and the bounded correspondence required by Context 5.0.1 authority and reuse
semantics. The fragment remains limited to the structured tuple plus opaque
correspondence; it MUST NOT contain CandidatePreparationAssociation or
preparation-local decision identity.

The existing Context authority remains the single authority model for the
complete immutable revision, nested fragments, and exact lineage/revision
identity. No Knowledge authority is created inside Context.

Stable reuse compares only governed stable semantic/correspondence operands,
including canonical profile and Identity semantics, PropositionIdentity,
complete tuple, Knowledge identity/version, accepted-state/source-ownership
correspondence, required Source Currentness correspondence, Knowledge
attribution, and applicable issuer/underlying-source correspondence. It MUST
NOT compare wrapper, transport, allocation, Bootstrap timing, or
CandidatePreparationAssociation identity.

A prior preparation's currentness or applicability decision cannot silently
satisfy a later preparation. An equivalent stable incorporated revision may be
reused only after the later preparation completes its required new
preparation-cycle determinations and the governed stable operands compare
equivalently. Later source-currentness or applicability changes never mutate an
Active or historical revision; they affect only a later preparation and, where
required, a governed successor.

## Failure ownership

- malformed candidate, missing/invalid correspondence, invalid preparation
  state, unsupported profile shape, structural validation, applicability
  evaluation failure, exact-one consequence, incorporation, lifecycle,
  activation, and Context authority failures are Context-owned;
- `NOT_APPLICABLE` is a completed Context-owned negative result, not a failure;
- Knowledge projection, issuance, acceptance, and verification failures remain
  Knowledge-owned;
- underlying-source authority failures remain owned by that source;
- Source Currentness failures remain owned by the applicable owner;
- Reasoning outcomes and failures remain Reasoning-owned; and
- Security, Skill, provider, adapter, transport, and infrastructure failures
  retain their established owners.

Context owns the candidate-revision consequence without wrapping,
translating, replacing, or absorbing an originating failure.

## Reasoning and privacy boundary

Only the structured tuple is Reasoning-visible semantic Knowledge material:
`subjectKey`, `predicateKey`, and `textualScalar`. The Contextual Applicability
result is not Reasoning rule-visible semantic evidence. PropositionIdentity,
Knowledge identity/version, source-ownership and Source Currentness
correspondence, CandidatePreparationAssociation, Knowledge attribution,
issuance/verifier correspondence, authority correspondence, provenance,
acceptance evidence, KnowledgeRecord internals, credentials, source payloads,
and authority internals remain opaque correspondence or excluded material.

Reasoning 2 remains compatible; Reasoning 3.0.0 remains Draft and is not
activated or changed.

## Contracts and ADRs

ADR-0022 Active 1.0.0 governs the ContextPreparationSemanticScope and exact S2
predicate in this Draft. It complements ADR-0020 and ADR-0021 and does not
supersede either. No Contract change is required: `CONTRACT_0001_SUFFICIENT`
because caller-to-Context scope input is outside the Context-to-source
collaboration and the scope is not sent to Knowledge or sources.
`CONTRACT-0002` remains absent. No new cross-engine operation, source
selection, query transport, or authority exchange is introduced.

## Compatibility and lifecycle

This Draft preserves Profile A, Profile C, identity-only Context, legacy
KnowledgeReference Profile B, existing revisions, Context authority, Reasoning
2, Planning 2.1.0, and Brain 2.0.3. It does not make production Profile B
reachable and requires no migration.

Version `5.1.0` is classified `MINOR_REQUIRED`: the closed two-state executable
Contextual Applicability decision is a new backward-compatible normative
capability, not merely editorial clarification or source correspondence. The
Draft remains non-authoritative until independently reviewed and activated.

## Related sources

- [Context Engine 5.0.1](ENGINE-0003-Context-Engine-Revision-5.0.1.md)
- [Knowledge Engine 1.3.0 Draft](../knowledge/ENGINE-0005-Knowledge-Engine-Revision-1.3.0.md)
- [Knowledge executable projection Draft](../knowledge/ENGINE-0005-Knowledge-Engine-Executable-Projection-Operation.md)
- [Reasoning Engine 3.0.0 Draft](../reasoning/ENGINE-0006-Reasoning-Engine-Revision-3.0.0.md)
- [ADR-0020](../../../docs/adr/ADR-0020-Knowledge-Evidence-Boundary-for-Source-Aware-Reasoning.md)
- [ADR-0021](../../../docs/adr/ADR-0021-Knowledge-Source-Currentness-and-Projection-Attribution.md)
- [CONTRACT-0001](../../../docs/contracts/CONTRACT-0001-Context-Source-Retrieval.md)
- [OES-0010](../../../docs/engineering/OES-0010-Versioning-Standards.md)

## Change history

| Version | Date       | Description                                                                                                                                                                                                        |
| ------- | ---------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| 5.1.0   | 2026-08-18 | Draft successor synchronized with Active ADR-0022: ContextPreparationSemanticScope origin/ownership, exact S2 applicability predicate, prerequisite boundary, preparation binding, and stable-reuse clarification. |
