# ENGINE-0006 — Reasoning Engine Revision

| Field          | Value                                                              |
| -------------- | ------------------------------------------------------------------ |
| **Status**     | Active                                                             |
| **Supersedes** | 2.0.0                                                              |
| **Version**    | 3.0.0                                                              |
| **Owner**      | Reasoning Engine                                                   |
| **Created**    | 2026-08-16                                                         |
| **Updated**    | 2026-08-20                                                         |
| **Applies To** | Reasoning evaluation, outcome issuance, and authority verification |

---

## Status and Authority

This specification is Active and is the sole current canonical ENGINE-0006
revision. It supersedes Reasoning Engine 2.0.0, which remains historical and
non-authoritative.

Reasoning is the semantic owner of reasoning evaluation and Reasoning Outcome
semantics. Core remains the schema custodian. The Reasoning Engine runtime
remains the outcome issuer, private provenance owner, and authority verifier.
Applicable Active ADRs govern in a conflict.

## Purpose

Reasoning Engine 3.0.0 specifies the first bounded Knowledge-aware Reasoning
slice. Reasoning evaluates one bounded Reasoning Query against one exact
authoritative Active Context Revision and produces one deterministic immutable
Reasoning Outcome.

The authoritative Active Context Revision is the sole path through which
substantive Knowledge-derived semantics may reach Reasoning. Reasoning does not
retrieve, reconstruct, refresh, or independently verify Knowledge or any
underlying source.

## Version Classification

Version 3.0.0 is a MAJOR revision. Reasoning 2.0.0 defines a closed,
Identity-based two-category outcome and rule model. This revision authorizes
Profile B to produce a bounded Knowledge-grounded outcome and adds semantic
results for exact-query applicability and evidence sufficiency. Existing
consumers of the closed 2.0.0 category correspondence may therefore require a
successor correspondence specification.

Profiles A and C retain their existing semantic behavior. The source,
authority, currentness, authorization, Planning, and Brain ownership boundaries
remain unchanged.

## Capability Ownership

Reasoning owns:

- admissibility of the Reasoning request at its boundary;
- interpretation of one bounded query against one supplied authoritative
  Active Context Revision;
- exact-query applicability over governed Knowledge semantics already
  incorporated in Profile B;
- evidence sufficiency for the bounded deterministic outcome;
- deterministic rule selection and Reasoning Outcome semantics;
- safe Reasoning explainability;
- Reasoning-domain failures; and
- Reasoning Outcome issuance and authority verification.

Reasoning does not own:

- Context preparation, profile selection, contextual applicability,
  incorporation, lifecycle, activation, Contextual Currentness, or Context
  authority;
- Knowledge acceptance, proposition issuance, Knowledge truth, contradiction
  resolution, issuer verification, or Source Currentness;
- underlying-source authority or verification;
- Security authorization;
- Planning, Brain orchestration, Skill selection or execution; or
- final cognitive result semantics.

These responsibilities are not shared or duplicated.

## Evaluation Boundary

The conceptual input remains:

- the evaluation intent;
- one exact authoritative Active Context Revision; and
- one bounded Reasoning Query.

The first executable structured Profile B slice is normatively closed by the
bounded-rule representation in the companion [Reasoning Engine Executable
Bounded Rule](ENGINE-0006-Reasoning-Engine-Executable-Bounded-Rule.md). No
parallel Knowledge, Memory, source, caller-supplied evidence, or authority
input is permitted. Reasoning evaluates a cycle-local immutable view of the
supplied Context and does not call Context to reconstruct evidence.

Reasoning validates that the supplied Context is a supported Active revision
and preserves the complete Context correspondence required by the existing
authority model. This validation does not redo Context incorporation or mint
Context authority.

For the structured Profile B slice, the exact evaluation sequence is:

```text
Reasoning request envelope
→ Context authority verification at the governed Context/Brain boundary
→ supported profile and fragment validation
→ bounded query validation
→ exact-query applicability
→ sufficiency
→ one deterministic Reasoning Outcome
```

Reasoning does not create a second Context authority mechanism. A Context
authority failure prevents semantic evaluation and remains a Context-owned
failure.

### Closed First-Slice Input and Query

The exact first-slice request remains the existing request envelope:

```text
{
  intent: "evaluate",
  activeContextRevision: ActiveContextRevision,
  query: BoundedReasoningQuery
}
```

`BoundedReasoningQuery` contains exactly these fields and no optional operands:

```text
{
  kind: "exact-text-attribute-value",
  subjectKey: GovernedSemanticIdentifier,
  predicateKey: GovernedSemanticIdentifier
}
```

The query kind is the sole supported operation. `subjectKey` and
`predicateKey` are required, non-empty governed semantic identifiers using
the exact Knowledge 1.3.0 bounded-key validity predicate: 1–128 Unicode code
points, at least one non-whitespace code point, no leading or trailing
whitespace, and no control code point. Equality is exact stored Unicode
code-point equality. No trimming, normalization, case folding, aliases,
stemming, fuzzy matching, ontology lookup, similarity, ranking, confidence,
source selector, value-kind selector, response template, or retrieval
operand exists.

The only rule-visible Knowledge material is one already-incorporated,
validated structured tuple containing exactly:

```text
{
  subjectKey,
  predicateKey,
  textualScalar
}
```

The tuple uses the Knowledge 1.3.0 validity predicates. `textualScalar` is
required, non-empty textual semantic content of 1–4096 Unicode code points,
with no control code point. Context must have completed its exact-one
incorporation consequence before Reasoning consumes the tuple. Zero or
multiple propositions, a missing structured fragment, or an invalid tuple is
unsupported or malformed input; Reasoning does not select, repair, rank,
merge, or infer a proposition.

## Supported Context Profiles

Reasoning recognizes exactly the fixed Context profiles:

- Profile A: `[Identity]`;
- Profile B: `[Identity, Knowledge]`; and
- Profile C: `[Identity, Memory]`.

No Profile D, combined `[Identity, Knowledge, Memory]` profile, arbitrary
source collection, generic source loop, or autonomous profile selection is
authorized.

### Profile A — Identity

Profile A preserves Reasoning 2.0.0 Identity-only semantics. Anonymous and
authenticated Identity states remain governed by their existing deterministic
rules. Authentication alone is not substantive factual Knowledge evidence and
cannot produce a Knowledge-grounded successful outcome.

### Profile B — Identity and Knowledge

Profile B is the only Knowledge-aware profile in this revision. Reasoning may
interpret the bounded proposition semantics already incorporated by Context
when all of the following hold:

- the supplied Context revision is authoritative and Active;
- the Profile B shape is governed and supported;
- the incorporated Identity state is authenticated;
- exactly one bounded Knowledge proposition is incorporated;
- the proposition applies to the exact bounded query;
- the proposition is sufficient for the bounded factual outcome; and
- no unsupported ambiguity is present.

Fragment presence alone does not establish exact-query applicability or
sufficiency. Proposition identity, Knowledge identity, accepted state,
Knowledge version, issuer correspondence, Source Currentness correspondence,
or Context authority alone is likewise insufficient.

Identity eligibility precedes Knowledge-aware rule evaluation. When a valid
Profile B Context projects anonymous Identity, the preserved
`anonymous-identity` rule is the only eligible rule; Reasoning does not evaluate
the proposition for exact-query applicability or sufficiency. Only a valid
Profile B Context projecting authenticated Identity is eligible to proceed to
the Knowledge-aware applicability and sufficiency rules. Authenticated Identity
is a prerequisite, not evidence of Knowledge-grounded success.

### Profile C — Identity and Memory

Profile C preserves the current source-opaque Memory behavior. Reasoning does
not interpret Memory as Knowledge, apply the Knowledge-aware rule to Memory,
or introduce Memory-aware decision semantics. Profile C's second source does
not create a generic evidence abstraction.

## Knowledge-Aware Reasoning Semantics

### Exact-Query Applicability

Reasoning determines whether the one already-incorporated governed proposition
semantically applies to the exact bounded query under evaluation. This is a
Reasoning decision about the bounded task.

It is distinct from Contextual Applicability, which determines whether source
material should participate in a Context revision. Reasoning does not revisit
that incorporation decision, and Context does not decide exact-query
applicability. Knowledge does not interpret or anticipate the Reasoning query.

For the closed first slice, Reasoning applicability is exhaustive:

```text
APPLICABLE iff
query.kind == "exact-text-attribute-value"
AND tuple.subjectKey == query.subjectKey
AND tuple.predicateKey == query.predicateKey
```

```text
NOT_APPLICABLE iff
query.kind == "exact-text-attribute-value"
AND (tuple.subjectKey != query.subjectKey
     OR tuple.predicateKey != query.predicateKey)
```

No third applicability result exists. Malformed or unsupported query/tuple
input is a Reasoning-owned invalid-input failure, not `NOT_APPLICABLE`.
Context S2 does not establish either result.

Exact-query applicability does not establish Knowledge truth, Source
Currentness, authorization, or evidence sufficiency.

### Evidence Sufficiency

After exact-query applicability succeeds, Reasoning determines whether the
governed proposition semantics are sufficient to produce the bounded factual
outcome. Sufficiency requires that the proposition provide the semantic value
needed to determine the bounded query without unsupported inference,
additional source evidence, ranking, confidence, aggregation, or synthesis.

For the closed first slice, sufficiency is exhaustive after `APPLICABLE`:

```text
SUFFICIENT iff
tuple.textualScalar is structurally present and non-empty
AND query.kind == "exact-text-attribute-value"
```

```text
INSUFFICIENT iff
APPLICABLE
AND NOT SUFFICIENT
```

The `INSUFFICIENT` predicate is intentionally unreachable in this first
textual-only subset: the only query kind requests the exact textual scalar,
and a valid structured proposition necessarily supplies that scalar. Missing,
empty, malformed, or non-text scalar material is invalid or unsupported input,
not an insufficient outcome. A later approved rule may admit a reachable
insufficient state only by an explicit specification correction; no such rule
is part of this Draft.

Sufficiency is not implied by Profile B, fragment presence, identifiers,
accepted state, version correspondence, issuer verification, Source
Currentness correspondence, or Context authority.

### Successful Bounded Factual Outcome

When the request and authoritative Profile B Context are valid, the incorporated
Identity is authenticated, exactly one governed proposition applies to the
bounded query, and that proposition is sufficient, Reasoning produces a
deterministic Knowledge-grounded successful Outcome. Its semantic
correspondence is:

- the outcome is completed;
- the outcome category denotes bounded Knowledge-grounded response readiness;
- the candidate conclusion records the bounded factual conclusion;
- the candidate response is the privacy-safe governed response candidate;
- the candidate next action is `none`; and
- the rule category identifies applicable-and-sufficient bounded Knowledge
  reasoning.

This Outcome does not render a final response, execute an action, select a
Skill, or transfer proposition or source authority to Reasoning.

### Non-Applicable Outcome

After authenticated Profile B Identity establishes Knowledge-aware rule
eligibility, when the governed proposition does not apply to the exact query,
Reasoning produces a completed deterministic non-applicable result and does not
produce the Knowledge-grounded success Outcome. The candidate next action is
`request-more-context`.

Non-applicability is a Reasoning-owned semantic result. It is not a Knowledge,
Context, Source Currentness, authorization, or source failure.

### Insufficient-Evidence Outcome

After authenticated Profile B Identity establishes Knowledge-aware rule
eligibility, when the proposition applies but is not sufficient for the bounded
query, Reasoning produces a completed deterministic insufficient-evidence
result and does not produce the Knowledge-grounded success Outcome. The
candidate next action is `request-more-context`.

Insufficiency is a Reasoning-owned semantic result. It is not translated into
a Knowledge, Context, Source Currentness, authorization, or source failure.

## Outcome and Rule Categories

The successor executable language must preserve the existing Profile A and
Profile C outcome correspondence and must add distinguishable Profile B
semantics for:

- bounded Knowledge-grounded success;
- exact-query non-applicability; and
- applicable but insufficient evidence.

Each result has one corresponding deterministic rule category. Successful
Knowledge-grounded response readiness uses `none`; both non-applicable and
insufficient results use `request-more-context`. The semantic categories must
remain distinguishable even when they share a next action so that
explainability and downstream validation do not collapse their meanings.

The closed first-slice category and rule correspondence is exhaustive:

- Any supported profile with anonymous Identity produces `anonymous-context`
  under `anonymous-identity`, with `request-more-context`.
- Profile A or C with authenticated Identity produces `context-only` under
  `authenticated-context-only`, with `request-more-context`.
- Authenticated Profile B with `NOT_APPLICABLE` produces
  `knowledge-not-applicable` under `authenticated-knowledge-not-applicable`,
  with `request-more-context`.
- Authenticated Profile B with `APPLICABLE` and `SUFFICIENT` produces
  `knowledge-grounded-success` under
  `authenticated-knowledge-applicable-sufficient`, with `none`.

The broader `knowledge-insufficient` category remains explicitly defined for
future approved executable expansion, but is unreachable by the closed first
slice and is not emitted by it. Every emitted category has one deterministic
meaning and no fallback category exists. Active Planning 2.1.0 already defines
the source-opaque correspondence for the three Reasoning 3 categories;
Reasoning exposes only the approved category, next-action, response, and
explainability language. Planning must not inspect tuple content,
applicability, sufficiency, or provenance.

## Determinism

Equivalent bounded queries evaluated against equivalent governed semantics in
the exact authoritative Context correspondence must produce equivalent
Reasoning results. The selected rule, applicability result, sufficiency result,
candidate conclusion, candidate response semantics, and next action must be
deterministic.

This revision authorizes no probabilistic inference, confidence scoring,
ranking, provider dependence, model choice, semantic synthesis, or best-candidate
selection.

## Cardinality and Unsupported Inputs

Context owns the exact-one qualifying incorporation consequence for successful
Profile B activation. Reasoning consumes that governed result and does not
repair or redo it.

A purported Profile B input with zero or multiple bounded propositions is an
unsupported or malformed Reasoning input and cannot produce a successful
Knowledge-grounded Outcome. Reasoning may reject such input at its own boundary
without selecting, ranking, synthesizing, or resolving contradiction. The
originating Context responsibility is not transferred by this rejection.

General multi-proposition reasoning and Knowledge-domain contradiction
resolution are outside this revision.

## Explainability

Reasoning owns privacy-safe explainability for its decision. Explainability may
identify only the governed correspondence necessary to state:

- the exact authoritative Context revision consumed;
- that one governed Knowledge proposition participated, using a safe identity
  or correspondence rather than source internals;
- the Reasoning rule/category applied; and
- whether exact-query applicability and sufficiency were established.

Explainability must not expose private chain of thought, private reasoning
traces, KnowledgeRecord internals, raw provenance, acceptance evidence, hidden
source metadata, confidence traces, or independent retrieval handles. This
specification defines no trace schema.

## Authority Correspondence

Reasoning relies on the exact authoritative Active Context Revision and its
incorporated governed proposition material. Reasoning must not independently:

- call Knowledge, Memory, an underlying source, or another evidence provider;
- call Context to reconstruct or supplement evidence;
- verify or reverify Knowledge projection authority;
- verify or reverify underlying-source authority; or
- establish Source Currentness.

Context authority proves governed issuance and correspondence of the exact
Context revision. It does not prove Knowledge truth, source authority,
authorization, exact-query applicability, or evidence sufficiency.

Reasoning Outcome authority must correspond to the exact supplied
authoritative Context revision used for evaluation. A reconstructed, cloned,
or merely structurally equivalent Context cannot substitute for that exact
authority correspondence. Reasoning authority proves Reasoning issuance,
integrity, and exact Context consumption; it does not replace Context,
Knowledge, source, or Security authority.

## Currentness

Source Currentness remains owned by the applicable source responsible for its
determination. Context separately owns Contextual Currentness. Reasoning
consumes the immutable authoritative Context snapshot and does not establish or
reinterpret present Source Currentness.

Accepted state, issuer verification, Context authority, proposition presence,
or a stored currentness correspondence does not authorize Reasoning to claim
perpetual present Source Currentness. A later cycle requiring later evidence
requires a later governed Context preparation or revision where applicable.
Later source supersession does not mutate an existing Context revision or a
Reasoning Outcome already produced from it.

No TTL, refresh interval, freshness lookup, implicit latest lookup, automatic
Context refresh, automatic recollection, or Knowledge requery is introduced.

## Authorization

Security remains the independent owner of authorization. Identity presence,
Knowledge evidence, issuer correspondence, Context authority, proposition
identity, Source Currentness, exact-query applicability, evidence sufficiency,
or Reasoning authority does not establish, renew, or replace authorization.

Reasoning consumes only requests and evidence delivered through the governed
authorized architecture. It defines no Security policy and does not infer
authorization from evidence validity or possession.

## Failure Ownership

Reasoning owns failures that originate in Reasoning-owned responsibilities,
including, as applicable:

- malformed or inadmissible Reasoning requests;
- malformed, inactive, unsupported, or invalid authoritative Context input at
  the Reasoning boundary;
- unsupported Profile B evidence shape or cardinality;
- bounded-query validation or interpretation failure;
- inability to select or construct one governed Reasoning result;
- invalid Reasoning lifecycle or internal state; and
- Reasoning Outcome issuance or authority-verification failure.

Exact-query non-applicability and evidence insufficiency are completed
deterministic Reasoning results, not fabricated failures.

Knowledge failures remain Knowledge-owned. Underlying-source failures remain
owned by their originating source. Context, Security, Brain, Planning,
Bootstrap, Provider, Adapter, transport, and infrastructure failures retain
their originating ownership. Reasoning may preserve or propagate an
originating failure without translating, reclassifying, replacing, or
acquiring its semantic ownership. A Reasoning-owned local consequence does not
transfer ownership of the originating failure.

The first-slice failure boundary is closed as follows:

- Malformed request/query, unsupported kind, invalid tuple, missing structured
  fragment, unsupported profile, or invalid profile cardinality is a failure
  with no semantic outcome. Reasoning owns its boundary failure; an invalid
  incorporated artifact remains owned by Context or Knowledge.
- Context authority verification failure is a Context-owned failure with no
  valid Reasoning evaluation.
- Exact-query non-applicability is a completed Reasoning outcome.
- An applicable valid first-slice tuple proceeds to sufficiency and emits the
  bounded success outcome.
- The first-slice insufficient predicate is unreachable; invalid material is
  rejected as invalid or unsupported input rather than emitted as insufficiency.
- Reasoning lifecycle, construction, issuance, verifier, and infrastructure
  failures remain failures owned by Reasoning or the originating infrastructure
  owner.

Knowledge, underlying-source, Source Currentness, Security, Context, Planning,
Brain, Bootstrap, Provider, Adapter, transport, and Store failures are never
translated into Reasoning semantic negative outcomes.

## Privacy and Minimization

Reasoning may inspect only `subjectKey`, `predicateKey`, and `textualScalar`
for rule semantics, plus the exact Context-consumption correspondence required
by its authority boundary. Provenance, Source Currentness evidence,
attribution internals, ContextPreparationSemanticScope,
CandidatePreparationAssociation, source payload, source ownership
correspondence, acceptance evidence, authority/verifier internals,
credentials, Store metadata, KnowledgeRecord internals, private Context
candidate state, and independent retrieval handles are opaque or prohibited.

The Outcome must not copy unnecessary source material. Successful bounded
reasoning does not automatically expose the complete proposition or private
source correspondence. Response rendering remains outside this Draft.
Possession of any safe identity, correspondence, or opaque pointer confers
neither authority nor authorization and cannot create a retrieval path.

## Context Correspondence

Reasoning preserves the complete supplied Context correspondence required by
the existing Context-consumption and Reasoning-authority model. It interprets
only the Context semantics authorized for its bounded rule.

Reasoning does not interpret raw Knowledge storage, source retrieval mechanics,
Context candidate lifecycle, Bootstrap composition, private provenance, or
Memory semantics for Knowledge-aware rules. Contextual Applicability and
incorporation remain complete before Reasoning begins.

## Persistence and Evaluation Lifetime

The bounded query, tuple view, applicability result, sufficiency result, and
evaluation evidence are ephemeral to one Reasoning evaluation. No Reasoning
Store, durable query record, durable applicability/sufficiency token,
cross-cycle reuse, or persisted evaluation evidence is defined. Existing
process-local Reasoning Outcome authority remains the only runtime authority
state and does not make private evaluation evidence public.

## Planning Boundary

Planning remains source-opaque and consumes only an authoritative Reasoning
Outcome. Planning must not receive or inspect proposition content, Knowledge
identity or version, provenance, currentness, issuer correspondence, or
Context-fragment details.

Planning 2.1.0 defines the already-approved source-opaque correspondence for
`knowledge-grounded-success`, `knowledge-not-applicable`, and
`knowledge-insufficient`. Reasoning does not construct a Candidate Plan and
does not expose query, tuple, applicability, sufficiency, provenance,
currentness, or authority internals to Planning. Existing Planning 2.0.0
behavior remains unchanged.

## Brain Boundary

Brain remains source-opaque. It may orchestrate authoritative capability
outputs but must not retrieve Knowledge, inspect proposition semantics, select
Context profiles, interpret Source Currentness, or decide evidence sufficiency.
Reasoning 3.0.0 does not require a Brain semantic change merely to define this
bounded capability.

Semantic support in Reasoning does not establish production Profile B
reachability. Bootstrap wiring and caller/profile-selection policy remain
separate future work.

## Skill Boundary

The bounded Knowledge-aware result neither selects nor executes a Skill.
Knowledge-grounded response readiness and Skill execution intent remain
separate. This revision introduces no tool routing, automatic invocation, or
action execution.

## CONTRACT-0001 Correspondence

`CONTRACT_0001_SUFFICIENT`.

Reasoning remains downstream of the existing source-owned returned semantics
to candidate availability to Context-owned incorporation collaboration.
CONTRACT-0001 does not govern Reasoning query semantics, exact-query
applicability, evidence sufficiency, Reasoning Outcomes, or Reasoning
authority. No revision of CONTRACT-0001 and no CONTRACT-0002 is required.

## Existing Reasoning Preservation

This revision preserves from Reasoning 2.0.0:

- the requirement to consume one exact authoritative Active Context Revision;
- deterministic bounded rules and cycle-local immutable Context consumption;
- Reasoning Outcome ownership, issuance, and exact Context correspondence;
- failure-origin preservation;
- the source-retrieval prohibition;
- source-opaque Planning handoff; and
- Brain's orchestration boundary.

This revision changes the previously complete Identity-only rule model by
authorizing Profile B Knowledge-aware reasoning and additional Reasoning-owned
outcome/category semantics. It does not modify the Active 2.0.0 specification
during the Draft lifecycle.

## Execution-Model Neutrality

This specification defines architectural semantics and boundaries. It does not
prescribe TypeScript interfaces, functions, classes, providers, HTTP, storage,
serialization, dependency injection, Bootstrap mechanics, concrete error
class names, or trace formats. The request fields, bounded operands,
predicates, category set, and failure distinctions above are normative and
must not be re-decided by a later implementation.

## Deferred Scope

The following remain deferred:

- runtime implementation and Core executable types;
- concrete TypeScript request, query, proposition, response, result, and error
  class representations;
- NLP, semantic similarity, response generation, and response rendering;
- Bootstrap wiring and production Profile B reachability;
- caller and profile-selection policy;
- diagnostics, conformance tests, and implementation tests;
- multiple propositions, synthesis, aggregation, contradiction handling,
  ranking, and confidence;
- Memory-aware reasoning;
- Skill selection and execution;
- provider and model policy; and
- persistence, transport, and serialization policy.

No deferred item is implied to be implemented or Active by this Draft.

## Acceptance Criteria

ENGINE-0006 3.0.0 may be activated only when the accepted specification
establishes that:

1. one exact authoritative Active Context Revision remains the sole
   substantive Knowledge evidence path;
2. Profiles A, B, and C are the only recognized profiles;
3. Profile A behavior is preserved, Profile B alone supports the bounded
   Knowledge-aware rule, and Profile C remains Memory-opaque;
4. exact-query applicability and evidence sufficiency are distinct
   Reasoning-owned decisions;
5. success, non-applicability, and insufficiency are deterministic and
   distinguishable;
6. the first slice accepts exactly one governed Profile B proposition and
   performs no synthesis, ranking, or contradiction resolution;
7. authority, currentness, authorization, failure, privacy, Planning, Brain,
   and Skill boundaries remain intact; and
8. Reasoning Outcome authority continues to correspond to the exact supplied
   authoritative Context revision.

## Compatibility

Version 3.0.0 is intentionally incompatible with Reasoning 2.0.0's closed
outcome and rule-category correspondence. Profile B can now produce governed
bounded Knowledge-aware results that 2.0.0 and Planning 2.0.0 do not recognize.

Profile A and Profile C remain semantically preserved where applicable.
Knowledge, Context, source, Security, Planning, and Brain ownership does not
transfer. Planning 2.1.0 provides semantic future correspondence; executable
Core/runtime implementation and production reachability remain separate.

## Change History

| Version | Date       | Description                                                                                                                                    |
| ------- | ---------- | ---------------------------------------------------------------------------------------------------------------------------------------------- |
| 1.0.0   | 2026-07-20 | Established the original Reasoning Engine vertical slice.                                                                                      |
| 1.1.0   | 2026-07-29 | Added issuer-owned Reasoning Outcome authority verification.                                                                                   |
| 2.0.0   | 2026-08-10 | Aligned Reasoning with the authoritative Context boundary and narrowed its request, outcome, explainability, failure, and authority semantics. |
| 3.0.0   | 2026-08-16 | Drafted bounded Knowledge-aware Profile B reasoning, applicability, sufficiency, and outcome semantics.                                        |
| 3.0.0   | 2026-08-19 | Closed the first executable structured Profile B slice and its authority, privacy, failure, and Planning correspondence.                       |
| 3.0.0   | 2026-08-20 | Activated as the sole current canonical ENGINE-0006 revision and superseded 2.0.0.                                                             |

## References

- [Documentation Authority](../../../docs/DOCUMENT-AUTHORITY.md)
- [OES-0004 — Contracts](../../../docs/engineering/OES-0004-Contracts.md)
- [OES-0008 — Documentation Standards](../../../docs/engineering/OES-0008-Documentation-Standards.md)
- [OES-0010 — Versioning Standards](../../../docs/engineering/OES-0010-Versioning-Standards.md)
- [ADR-0008 — Context Collaboration, Source Ownership, and Reference Authority](../../../docs/adr/ADR-0008-Context-Collaboration-Source-Ownership-and-Reference-Authority.md)
- [ADR-0011 — Source Currentness and Contextual Currentness](../../../docs/adr/ADR-0011-Source-Currentness-Contextual-Currentness-and-Currentness-Change.md)
- [ADR-0012 — Authorization Independence](../../../docs/adr/ADR-0012-Authorization-Semantics-Enforcement-and-Authorized-Reference-Applicability.md)
- [ADR-0013 — Failure Ownership](../../../docs/adr/ADR-0013-Failure-Ownership-Propagation-and-Candidate-Context-Revision-Consequences.md)
- [ADR-0020 — Knowledge Evidence Boundary for Source-Aware Reasoning](../../../docs/adr/ADR-0020-Knowledge-Evidence-Boundary-for-Source-Aware-Reasoning.md)
- [CONTRACT-0001 — Context Source Retrieval](../../../docs/contracts/CONTRACT-0001-Context-Source-Retrieval.md)
- [Knowledge Engine 1.3.0](../knowledge/ENGINE-0005-Knowledge-Engine-Revision-1.3.0.md)
- [Context Engine 5.1.0](../context/ENGINE-0003-Context-Engine-Revision-5.1.0.md)
- [Reasoning Engine 2.0.0](ENGINE-0006-Reasoning-Engine-Revision-2.0.0.md)
- [Reasoning Engine Executable Bounded Rule](ENGINE-0006-Reasoning-Engine-Executable-Bounded-Rule.md)
- [Planning Engine 2.1.0](../planning/ENGINE-0007-Planning-Engine-Revision-2.1.0.md)
- [Brain Engine 2.0.3](../ENGINE-0001-Brain-Engine-Revision-2.0.3.md)
