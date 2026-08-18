# ADR-0022 — Context Preparation Semantic Scope and Applicability Policy

| Field             | Value                 |
| ----------------- | --------------------- |
| **Status**        | Active                |
| **Version**       | 1.0.0                 |
| **Owner**         | Project Maintainers   |
| **Created**       | 2026-08-18            |
| **Updated**       | 2026-08-18            |
| **Decision Type** | Architecture Decision |

---

## Problem

Context already owns Contextual Applicability, but prior Context specifications
did not define the preparation-local semantic criterion that distinguishes an
otherwise-valid verified Knowledge candidate as `APPLICABLE` or
`NOT_APPLICABLE`. Candidate availability and structural validity alone cannot
make that distinction.

The first structured Knowledge Profile B slice requires one deterministic,
source-agnostic semantic slot without turning Context into a Knowledge query
engine or making Context depend on future Reasoning semantics.

## Existing authority

Context owns preparation, candidate treatment, incorporation, revision
lifecycle, and Contextual Applicability. Knowledge owns accepted proposition
semantics, projection issuance, and verification. The applicable source owns
Source Currentness. Reasoning owns exact-query applicability and evidence
sufficiency. Security owns authorization. Brain and Planning remain
source-opaque.

ADR-0019 permits future Context-owned criteria but defers concrete relevance,
ranking, scoring, thresholds, and selection rules. ADR-0020 separates
Contextual Applicability from Reasoning applicability. ADR-0021 preserves
Knowledge/source currentness and attribution boundaries. CONTRACT-0001 ends at
candidate availability and remains unchanged by this decision.

## Decision

Adopt `ContextPreparationSemanticScope` for the first structured Knowledge
Profile B slice.

The scope consists of exactly one exact `subjectKey` coordinate and one exact
`predicateKey` coordinate. Together they define the semantic proposition slot
that belongs in one Context preparation.

The scope is not a Knowledge request, Reasoning query, ontology, registry,
arbitrary metadata container, free-text purpose, source selector, ranking
policy, confidence model, or authorization policy.

## ContextPreparationSemanticScope

The scope is a Context-owned semantic operand established for one preparation.
It is evaluated only after candidate availability and successful Knowledge-owned
projection verification. The source candidate work remains independent of the
scope comparison.

The scope is supplied as a requested Context-preparation input at the
caller-to-Context preparation boundary. Context validates and adopts it before
candidate applicability evaluation and before source candidate work begins.
Its existence before source work does not require transmitting it to Knowledge
or any source.

## Ownership

Context exclusively owns:

- scope meaning and validation;
- scope lifecycle;
- candidate comparison;
- `APPLICABLE` and `NOT_APPLICABLE` determination; and
- applicability mismatch consequences.

The supplying caller is authoritative only for expressing the requested
subject/predicate coordinates. Context is authoritative for validating and
adopting those coordinates as preparation scope, interpreting their semantic
meaning, comparing candidates, issuing applicability results, and determining
incorporation consequences. Supplying coordinates does not establish Knowledge
truth, source truth, authorization, Knowledge target selection, or Reasoning
applicability.

Transporting Context preparation input does not transfer ownership. A direct
caller MAY supply the input to Context. Brain is not the semantic caller for
Context preparation: Brain 2.0.3 consumes an authoritative Context result and
does not participate in Context preparation, profile selection, source
retrieval, or scope interpretation. If an orchestration boundary transports
the input in a future composition, it MUST do so opaquely and MUST NOT inspect,
derive, select Knowledge, evaluate applicability, choose candidates, interpret
currentness, or convert the scope into a source request.

## Scope establishment

The caller-to-Context preparation request makes one requested scope available
to Context. Context validates the bounded coordinates and establishes one
immutable `ContextPreparationSemanticScope` during preparation. The scope is
immutable once candidate evaluation begins. Every later preparation supplies
or establishes its own new scope and performs its own applicability evaluation.

The scope MUST be available before source candidate work. It MUST NOT be
inferred from a candidate after source work begins; doing so would make the
applicability predicate circular.

The scope is not sent upstream for retrieval filtering, ranking, selection, or
source interpretation.

## Scope representation

The semantic representation is exactly:

```text
ContextPreparationSemanticScope
= exact subjectKey coordinate
+ exact predicateKey coordinate
```

This ADR defines semantics only. It prescribes no TypeScript type, UUID, hash,
counter, registry, database key, or transport serialization.

## Exact comparison semantics

Scope coordinates MUST be mechanically compatible with the bounded structured
Knowledge tuple coordinates. Comparison is exact stored Unicode code-point
equality.

The comparison MUST NOT perform:

- Unicode normalization;
- case folding;
- trimming;
- locale transformation;
- alias resolution;
- ontology lookup;
- semantic equivalence;
- fuzzy matching; or
- model judgment.

Mechanical compatibility does not transfer semantic ownership to Knowledge.

## APPLICABLE predicate

For one otherwise-valid verified structured candidate and one valid Profile B
preparation:

```text
APPLICABLE iff
candidate.subjectKey exactly equals scope.subjectKey
AND
candidate.predicateKey exactly equals scope.predicateKey
```

No other operand participates.

`APPLICABLE` means only that the candidate may enter the current preparation's
qualifying candidate set. It does not establish incorporation completion,
activation, Knowledge truth, Source Currentness, authorization, Reasoning
applicability, or evidence sufficiency.

## NOT_APPLICABLE predicate

For one otherwise-valid verified structured candidate and one valid scope:

```text
NOT_APPLICABLE iff
candidate.subjectKey does not exactly equal scope.subjectKey
OR
candidate.predicateKey does not exactly equal scope.predicateKey
```

`NOT_APPLICABLE` is a completed Context-owned semantic mismatch. It is not an
operational failure, Knowledge failure, source failure, Source Currentness
failure, or authorization failure.

## Prerequisite and failure boundary

The following conditions prevent applicability evaluation and MUST NOT be
represented as `NOT_APPLICABLE`:

- missing, malformed, or unsupported scope;
- malformed candidate;
- missing required candidate correspondence;
- failed Knowledge verification;
- invalid Context preparation state;
- unsupported profile;
- Source Currentness failure;
- authorization failure; and
- infrastructure failure.

Malformed or missing scope input is a Context preparation/prerequisite failure.
Originating Knowledge, source, Security, and infrastructure failures retain
their established owners. The applicability result remains closed to exactly
`APPLICABLE` and `NOT_APPLICABLE`; no third inability result is introduced.

The scope input is bounded to the two coordinates defined by this ADR. It does
not include free-text purpose, Identity private data, provenance, credentials,
currentness evidence, KnowledgeRecord data, or a Reasoning query.

## textualScalar treatment

`textualScalar` MUST NOT participate in Contextual Applicability. It is the
proposition value carried after the subject/predicate slot qualifies.

Two otherwise-valid candidates with equal subject and predicate but different
textual values are independently `APPLICABLE`. Their multiplicity is handled
by Context exact-one semantics, never by applicability ranking or selection.

## Identity boundary

`IDENTITY_PARTICIPATES_IN_SCOPE_MATCHING: NO`.

Identity remains a separate Profile B fragment. Context MUST NOT derive subject
aliases, semantic domains, authorization, or scope coordinates from Identity.
No Identity-derived private data enters the scope.

## CandidatePreparationAssociation separation

CandidatePreparationAssociation and ContextPreparationSemanticScope are
distinct:

- CandidatePreparationAssociation correlates one candidate-preparation cycle
  and binds correspondence to that preparation;
- ContextPreparationSemanticScope expresses the semantic proposition slot for
  that preparation.

CandidatePreparationAssociation MUST NOT participate in applicability matching,
become stable Context identity, become stable reuse identity, or be persisted
as durable fragment state.

## Preparation lifecycle

The scope is preparation-local, immutable within one preparation, established
before candidate evaluation, and recreated for every later preparation. It is
not global, cross-process stable identity, or reusable by object identity.

A prior `APPLICABLE` result MUST NOT satisfy a later preparation.

## Persistence

`SCOPE_PERSISTENCE: PREPARATION_ONLY`.

The scope object, scope identity, and applicability result are not persisted as
separate durable Context revision fields merely for diagnostics. The
incorporated structured fragment already retains the stable subject/predicate
semantics and governed correspondence required by existing stable-reuse rules.

## Stable reuse

Stable reuse remains based on the incorporated semantic fragment and existing
governed stable correspondence. Scope object identity never participates.

Independently established semantically equal scopes do not require equal object
identity. If two preparations produce equivalent incorporated fragments, scope
object identity alone does not prevent reuse. Each later preparation MUST still
rerun candidate prerequisites and Contextual Applicability.

Historical Context revisions remain immutable.

## Exact-one interaction

The Context pipeline remains:

```text
candidate prerequisites
→ Contextual Applicability
→ qualifying candidate set
→ exact-one consequence
```

Examples:

1. A candidate matching subject and predicate is `APPLICABLE`.
2. A candidate mismatching subject is `NOT_APPLICABLE`.
3. A candidate matching subject but mismatching predicate is `NOT_APPLICABLE`.
4. Two valid candidates matching the same scope are both `APPLICABLE`; the
   qualifying cardinality is greater than one and no successful new Profile B
   activation occurs.
5. One matching candidate and any number of mismatching candidates produce one
   qualifying candidate; incorporation may proceed if all other prerequisites
   pass.

The policy never ranks or chooses the best candidate.

## Knowledge boundary

`SCOPE_VISIBLE_TO_KNOWLEDGE: NO`.

Knowledge receives no expected subject, expected predicate, Context scope, or
applicability policy. Knowledge continues issuing its governed targeted
candidate independently. Context evaluates suitability only after the
verified candidate is available.

## Reasoning boundary

`SCOPE_VISIBLE_TO_REASONING: NO`.

Contextual Applicability asks whether a candidate belongs in this preparation.
Reasoning applicability asks whether an incorporated proposition applies to a
bounded Reasoning query. The responsibilities are distinct. Reasoning receives
only the structured tuple incorporated into authoritative Context and evaluates
its own query independently.

## Brain and Planning boundary

Brain and Planning remain source-opaque. Neither may inspect scope coordinates,
tuple matching internals, Knowledge provenance, Source Currentness, or
applicability evidence. Brain may transport opaque preparation input without
acquiring scope semantics.

## Source Currentness boundary

Source Currentness remains a candidate prerequisite and correspondence concern
owned by the applicable source owner. A current candidate may still be
`NOT_APPLICABLE`. A candidate whose currentness prerequisite failed MUST NOT be
reclassified as `NOT_APPLICABLE`.

## Privacy

Subject and predicate coordinates are bounded semantic preparation data and MAY
be sensitive in particular domains. Scope handling MUST be minimized and MUST
NOT add:

- Identity-derived personal data;
- raw provenance;
- acceptance evidence;
- credentials;
- source internals;
- verifier internals; or
- Store metadata.

Scope is confined to Context preparation and is not exposed to Knowledge or
Reasoning as scope material.

## Profiles

The fixed profiles remain:

- Profile A: `[Identity]`;
- Profile B: `[Identity, Knowledge]`; and
- Profile C: `[Identity, Memory]`.

The scope belongs to one structured Profile B preparation instance. This ADR
does not create a Profile B subtype, dynamic profile, Profile D, or source-aware
profile selection.

## Context authority

The existing Context authority remains authoritative for immutable Context
revisions, nested fragments, lineage, revision identity, incorporation, and
activation. The scope creates no second Context authority. Knowledge authority
remains Knowledge-owned.

## CONTRACT-0001 assessment

`CONTRACT_CHANGE_REQUIRED: NO`.

`CONTRACT_0001_SUFFICIENT` remains true because the scope is Context-local and
post-candidate:

```text
source-owned returned semantics
→ candidate availability
→ Context-owned scope comparison
→ Contextual Applicability
→ incorporation
```

No upstream semantic request, scope transport to a source, verifier exchange,
or generic applicability service is introduced. `CONTRACT-0002` remains absent.

This ADR authorizes a future additive Context-preparation input extension at
the existing caller-to-Context capability boundary. That extension is an
owned Context input, not a new Context/source collaboration and not a change to
CONTRACT-0001. No implementation or Contract file change is made by this ADR.

## Alternatives rejected

### Exact subject only

Rejected for the first slice because it admits unrelated predicates for the
same subject and is too broad to represent one meaningful proposition slot.

### Generic Context semantic slot abstraction

Rejected because the first executable semantics are exactly subject-plus-
predicate equality. A generic abstraction would introduce unnecessary
generality.

### textualScalar matching

Rejected because the scalar is proposition value, not slot identity. Matching it
would turn Context applicability into value selection.

### Identity-derived matching

Rejected because Identity defines no proposition-domain mapping, aliases, or
semantic equivalence, and such matching would risk privacy leakage.

### Reasoning-query matching

Rejected because it couples Context to downstream Reasoning applicability and
violates ownership separation.

### All valid candidates applicable

Rejected because it collapses Contextual Applicability into structural
validation and makes `NOT_APPLICABLE` meaningless.

### Fuzzy or model-based relevance

Rejected because it is nondeterministic and outside the bounded first-slice
policy.

## Consequences

Positive consequences:

- deterministic Contextual Applicability;
- meaningful `NOT_APPLICABLE` results;
- executable first-slice Core semantics;
- preserved source opacity;
- preserved Knowledge independence;
- preserved Reasoning separation;
- no ranking or selection semantics; and
- no Contract change.

Costs and constraints:

- structured Profile B preparation requires a semantic scope;
- exact subject/predicate equality is intentionally narrow;
- broader relevance policies require future explicit decisions; and
- aliases, ontology, fuzzy matching, and semantic expansion are not implied.

## Context 5.1.0 relationship

`CONTEXT_5_1_0_CAN_BE_CORRECTED: YES`.

This ADR supplies the architectural decision needed to replace the undefined
Context-owned contextual-criteria phrase in Draft Context 5.1.0 with the
executable subject/predicate predicate. Context 5.1.0 remains Draft and is not
modified or activated by this ADR.

## Core and runtime implications

This ADR authorizes no implementation. After independent ADR review and a
synchronized Context specification correction, Core may define mechanical
representations for the scope, exact coordinates, closed result, prerequisite
failures, predicate, and preparation-local lifecycle. Runtime work remains
deferred until those specification steps complete.

## Decision boundaries

This ADR does not decide:

- Knowledge retrieval policy or source request semantics;
- ranking, confidence, ontology, aliases, or semantic similarity;
- Reasoning query semantics;
- authorization;
- Identity-to-proposition mapping;
- Memory applicability;
- a generic Context relevance framework;
- future multi-Knowledge composition; or
- dynamic profile selection.

## Related sources

- [ADR-0019 — Configurable Retrieval Policy Ownership Boundary](ADR-0019-Configurable-Retrieval-Policy-Ownership-Boundary.md)
- [ADR-0020 — Knowledge Evidence Boundary for Source-Aware Reasoning](ADR-0020-Knowledge-Evidence-Boundary-for-Source-Aware-Reasoning.md)
- [ADR-0021 — Knowledge Source Currentness and Projection Attribution](ADR-0021-Knowledge-Source-Currentness-and-Projection-Attribution.md)
- [Context Engine 5.0.1](../../specifications/engines/context/ENGINE-0003-Context-Engine-Revision-5.0.1.md)
- [Context Engine 5.1.0 Draft](../../specifications/engines/context/ENGINE-0003-Context-Engine-Revision-5.1.0.md)
- [Knowledge Engine 1.3.0 Draft](../../specifications/engines/knowledge/ENGINE-0005-Knowledge-Engine-Revision-1.3.0.md)
- [Knowledge executable projection Draft](../../specifications/engines/knowledge/ENGINE-0005-Knowledge-Engine-Executable-Projection-Operation.md)
- [Reasoning Engine 3.0.0 Draft](../../specifications/engines/reasoning/ENGINE-0006-Reasoning-Engine-Revision-3.0.0.md)
- [CONTRACT-0001 — Context Source Retrieval](../contracts/CONTRACT-0001-Context-Source-Retrieval.md)

## Change history

| Version | Date       | Description                                                                                    |
| ------- | ---------- | ---------------------------------------------------------------------------------------------- |
| 1.0.0   | 2026-08-18 | Drafted ContextPreparationSemanticScope and deterministic first-slice applicability policy.    |
| 1.0.1   | 2026-08-18 | Clarified caller-to-Context scope input origin, Context adoption, and Brain non-participation. |
| 1.0.0   | 2026-08-18 | Approved architectural decision.                                                               |
