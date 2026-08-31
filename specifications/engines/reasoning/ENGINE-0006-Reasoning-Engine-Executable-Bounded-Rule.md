# ENGINE-0006 — Reasoning Engine Executable Bounded Rule

| Field          | Value                                                                       |
| -------------- | --------------------------------------------------------------------------- |
| **Status**     | Draft                                                                       |
| **Version**    | 1.1.1                                                                       |
| **Owner**      | Reasoning Engine                                                            |
| **Created**    | 2026-08-17                                                                  |
| **Updated**    | 2026-08-31                                                                  |
| **Applies To** | Reasoning Engine 3.0.0 bounded Profile B executable semantic correspondence |

---

## Status and Relationship

This subordinate Engine specification is a non-authoritative Draft. It refines
the bounded executable semantic rule governed by the Active
[Reasoning Engine 3.0.0](ENGINE-0006-Reasoning-Engine-Revision-3.0.0.md).
It does not replace, amend, activate, or supersede that Active Engine
specification.

Version `1.1.0` identifies only this supplemental document's evolution under
the documentation-versioning requirement. It is not an ENGINE-0006 Engine
revision, does not compete with Reasoning 2.0.0 or 3.0.0, and establishes no
independent Engine lifecycle, runtime authority, or implementation authority.
Reasoning Engine 3.0.0 is already Active and governing; the unresolved
lifecycle is this supplement's own governed review and the separately gated
readiness of any executable realization.

Review or approval of this supplement does not by itself authorize runtime
implementation, establish implementation completeness, make Profile B
production-reachable, confer deployment authority, or change the Active status
of Reasoning Engine 3.0.0.

## Purpose

This specification defines the first executable, deterministic bounded rule
for evaluating exactly one governed Knowledge proposition already incorporated
in an authoritative Profile B Context against exactly one governed bounded
Reasoning Query.

It is a strict executable subset of the broader Reasoning 3.0.0 semantic model.
It does not by itself make every parent-model category runtime-reachable or
satisfy any executable, integration, deployment, or production-readiness gate.

It resolves only:

- the bounded query and proposition semantic representations;
- exact-query applicability;
- evidence sufficiency;
- evaluation precedence;
- closed outcome and rule correspondence;
- candidate conclusion and candidate response semantics;
- privacy-safe explainability; and
- the outcome-versus-failure boundary.

## Governing Ownership

The following ownership is unchanged:

- Reasoning owns exact-query applicability, evidence sufficiency, Reasoning
  Outcomes, candidate conclusions, candidate responses, and Reasoning
  explainability.
- Context owns Contextual Applicability, exact-one incorporation, projection
  minimization, Context lifecycle, and Context authority.
- Knowledge owns Knowledge truth, acceptance, bounded proposition issuance,
  proposition semantics, and Knowledge-owned issuer verification.
- The applicable source owns Source Currentness and its authority domain.
- Security owns authorization.
- Planning owns Candidate Plans and Reasoning-to-Planning correspondence.
- Brain owns orchestration and final cognitive-result assembly.
- Core may custody executable shared language without acquiring semantic or
  runtime ownership.

Reasoning consumes only the exact authoritative Active Context supplied through
the governed Brain boundary. It does not retrieve or reverify Knowledge,
reconstruct Context, inspect source internals, or select a Context profile.

## Scope

The first executable slice is a single governed attribute-value lookup. It is
not general natural-language question answering.

The slice supports exactly:

- one bounded query asking for the governed textual value of one governed
  predicate for one governed subject;
- one governed proposition asserting one non-empty textual scalar for one
  governed predicate and subject;
- exact governed identifier correspondence;
- one proposition in Profile B; and
- one deterministic Outcome.

The slice excludes non-text value forms, ranges, comparisons, negation,
aggregation, lists of answers, multiple propositions, inference, synthesis,
contradiction resolution, ranking, confidence, partial answers, units,
conversion, localization, temporal calculation, fuzzy matching, aliases,
ontology traversal, and unstated world knowledge.

## Bounded Query Representation

### Raw Query Boundary

A raw user query is not the bounded query and is outside this rule's scope.
This rule accepts only an already-governed bounded query supplied through the
existing normalized Brain request and Reasoning request boundary authorized by
ADR-0007 and ADR-0020.

This artifact defines no raw-to-bounded conversion, parser, normalizer, or
producer. It assigns no new capability or ownership. Brain passes the exact
already-bounded query to Reasoning and does not derive bounded semantics from
raw text under this rule.

Failure to supply the complete governed bounded representation is an invalid
Reasoning Query, not a request for Reasoning to infer missing semantics.

### Governed Query Semantics

The bounded query contains exactly:

1. **Query kind** — the closed semantic operation
   `exact-text-attribute-value`.
2. **Subject key** — one non-empty governed semantic identifier identifying
   the subject whose value is requested.
3. **Predicate key** — one non-empty governed semantic identifier identifying
   the attribute or relation whose value is requested.
   The query requests exactly the governed textual scalar corresponding to the
   ordered pair `(subject key, predicate key)`. It contains no requested value
   kind, expected value, source selector, Knowledge identifier, proposition
   identifier, confidence threshold, ranking criterion, response template,
   formatting directive, locale, unit, authorization assertion, or retrieval
   directive.

Semantic identifiers are compared as governed identifiers, not as display
text. Their lexical validity is the bounded-key predicate preserved by Active
Knowledge Engine 3.0.0:
1–128 Unicode code points, at least one non-whitespace code point, no leading
or trailing whitespace, and no control code point. Transport encoding and
construction mechanism remain implementation concerns. They MUST have one
exact equality relation and MUST NOT acquire alias, case-folding, stemming,
locale, normalization, similarity, or hierarchy semantics unless a later
approved revision governs them.

Textual scalar is the only supported value form. No value-kind selection or
conversion semantics exist in this first slice.

## Bounded Proposition Representation

The bounded proposition semantic value is one immutable attribute assertion
containing exactly:

1. **Subject key** — the governed semantic subject identifier.
2. **Predicate key** — the governed semantic attribute or relation identifier.
3. **Textual scalar** — one present, non-empty governed textual semantic value.

The textual scalar is Knowledge-owned proposition semantic content. It is not
a pre-rendered user response, response template, `KnowledgeRecord`, source
excerpt, private evidence, provenance object, or instruction to generate text.
Knowledge does not generate, format, paraphrase, or choose user-facing response
prose.

Reasoning owns construction of its candidate response. For this deliberately
narrow exact-text lookup, that construction is identity preservation of the
exact governed textual scalar: Reasoning copies no source material other than
that authorized semantic scalar and performs no paraphrase, formatting,
translation, templating, conversion, or decoration.

The Context fragment also preserves the proposition and opaque authority
correspondence governed by Active Knowledge Engine 3.0.0, the reviewed
Knowledge executable projection operation, and Active Context Engine 5.1.0.
Those fields do not become components of the bounded assertion merely because
they travel with it.

## Exact Applicability Predicate

For an eligible authenticated Profile B evaluation, the incorporated
proposition is applicable to the bounded query if and only if all of the
following are true:

1. the query kind is `exact-text-attribute-value`;
2. the proposition subject key is exactly equal to the query subject key; and
3. the proposition predicate key is exactly equal to the query predicate key.

If either governed identifier differs, the proposition is non-applicable.

Exact equality is identity of the governed semantic identifier value. Display
text similarity, substring matching, natural-language equivalence, aliases,
synonyms, case conversion, stemming, coercion, ontology expansion, embeddings,
model judgment, or another inferred correspondence MUST NOT establish
applicability.

Knowledge identity, proposition identity, attribution, accepted state,
currentness correspondence, issuer verification, Context authority, and
fragment presence do not establish exact-query applicability.

## Exact Sufficiency Predicate

Sufficiency is evaluated only after applicability succeeds.

For this textual-only slice, an applicable proposition is sufficient if and
only if:

1. the incorporated governed proposition contains its required textual scalar;
2. the scalar is structurally present and non-empty under the upstream governed
   proposition contract; and
3. the supported query kind requests that exact scalar for the already-matched
   subject and predicate.

These conditions are mechanical. No additional sufficiency judgment,
value-kind validation, conversion, calculation, aggregation, synthesis,
qualification, comparison, inference, or additional evidence is permitted.

A Profile B proposition valid for this first slice necessarily contains the
non-empty textual scalar. A missing, empty, malformed, or non-text value is
therefore malformed or unsupported upstream material, not an insufficient
Outcome. Reasoning does not repair, coerce, transform, or guess it.

The broader Reasoning 3.0.0 semantic model retains applicable-but-insufficient
evidence as a distinct closed Outcome. No valid state in this strict
textual-only executable subset reaches it. A later approved executable rule may
make that category reachable without changing its already-governed Planning
correspondence. This Draft MUST NOT fabricate an insufficiency condition merely
to exercise the category.

## Evaluation Precedence

Reasoning applies this exact semantic precedence:

1. Validate the governed Reasoning request and bounded query.
2. Consume the exact already-authoritative Active Context and validate the
   supported Context structure at the Reasoning boundary.
3. Apply preserved Identity eligibility.
4. For anonymous Identity, apply the preserved anonymous rule without
   evaluating any proposition.
5. For authenticated Profile A or Profile C, apply the preserved Reasoning
   2.0.0 authenticated Context-only rule without Knowledge interpretation.
6. For authenticated Profile B, validate the supported Profile B shape and
   exactly-one incorporated governed proposition.
7. Evaluate exact-query applicability.
8. If non-applicable, produce the non-applicable Outcome and do not evaluate
   sufficiency.
9. If applicable, evaluate sufficiency.
10. For a valid proposition in this textual-only subset, produce the
    Knowledge-grounded success Outcome.

No later rule may override an earlier selected row. No fallback profile,
Knowledge retrieval, Context reconstruction, or second evaluation is
authorized.

## Profile A Preservation

Profile A preserves Reasoning 2.0.0 exactly:

- anonymous Identity produces the preserved `anonymous-context` Outcome under
  the preserved `anonymous-identity` rule with `request-more-context`;
- authenticated Identity produces the preserved `context-only` Outcome under
  the preserved `authenticated-context-only` rule with
  `request-more-context`.

Profile A never enters the Knowledge-aware rule.

## Profile B Rules

### Anonymous Identity

Anonymous Profile B uses the preserved `anonymous-context` Outcome and
`anonymous-identity` rule with `request-more-context`. Proposition
applicability and sufficiency are not evaluated.

### Authenticated Identity

Authenticated Profile B is eligible for Knowledge-aware evaluation only after
the request, Context, profile, and exact-one proposition prerequisites pass.
Within this textual-only subset, it produces exactly one non-applicable or
Knowledge-grounded success Outcome. The broader closed Reasoning 3.0.0 model
also retains the insufficient-evidence Outcome described below, but this subset
does not fabricate a reachable state for it.

## Profile C Preservation

Profile C remains Memory-opaque and preserves existing Identity-based
Reasoning correspondence. Anonymous Identity uses the preserved anonymous
rule. Authenticated Identity uses the preserved authenticated Context-only
rule. Memory content, identity, presence, or authority does not enter the
applicability or sufficiency predicates.

## Knowledge-Grounded Success

Authenticated Profile B with an applicable and sufficient proposition produces
one completed bounded Knowledge-grounded success Outcome.

Its exact semantic correspondence is:

- **Outcome category:** `knowledge-grounded-success`;
- **Rule category:** `authenticated-knowledge-applicable-sufficient`;
- **Candidate next action:** `none`;
- **Candidate conclusion:** the exact fixed controlled text `Bounded Knowledge
proposition exactly applicable and sufficient.`;
- **Candidate response:** the exact governed textual scalar, preserved
  without prose generation, paraphrase, decoration, qualification, or other
  source material; and
- **Explainability:** the privacy-safe correspondence defined below.

The candidate response is response-ready content, not a rendered final
cognitive result. Reasoning does not add natural-language framing. Planning
preserves the candidate response; Brain retains final-result assembly.

## Exact-Query Non-Applicable Outcome

Authenticated Profile B with a proposition whose subject or predicate key does
not exactly correspond to the query produces one completed non-applicable
Outcome.

Its exact semantic correspondence is:

- **Outcome category:** `knowledge-not-applicable`;
- **Rule category:** `authenticated-knowledge-not-applicable`;
- **Candidate next action:** `request-more-context`;
- **Candidate conclusion:** the controlled semantic conclusion `The governed
proposition does not apply to the exact bounded query.`;
- **Candidate response:** the controlled response `Additional applicable
authoritative context is required before a bounded response can be
produced.`; and
- **Explainability:** applicability `not-established`; sufficiency
  `not-evaluated`.

This is a completed Reasoning Outcome, not a Knowledge, Context, source,
currentness, authorization, or Reasoning failure.

## Applicable but Insufficient Outcome

The broader Reasoning 3.0.0 closed semantic model retains an authenticated
Profile B applicable-but-insufficient Outcome. It is not reachable from a valid
proposition in this textual-only executable subset because exact applicability
plus the required valid non-empty textual scalar mechanically establishes
sufficiency.

If a later approved executable rule admits an otherwise valid applicable
proposition that lacks semantics required by its bounded query, it produces one
completed insufficient-evidence Outcome with the following preserved
correspondence:

Its exact semantic correspondence is:

- **Outcome category:** `knowledge-insufficient`;
- **Rule category:** `authenticated-knowledge-applicable-insufficient`;
- **Candidate next action:** `request-more-context`;
- **Candidate conclusion:** the controlled semantic conclusion `The governed
proposition applies to the bounded query but does not provide its complete
answer value.`;
- **Candidate response:** the controlled response `Additional sufficient
authoritative context is required before a bounded response can be
produced.`; and
- **Explainability:** applicability `established`; sufficiency
  `not-established`.

This is a completed Reasoning Outcome, not a Knowledge, Context, source,
currentness, authorization, or Reasoning failure.

## Closed Category and Rule Correspondence

The complete accepted semantic set for Reasoning 3.0.0 remains closed. The
first two Profile B rows below are reachable in this textual-only subset; the
insufficient row is retained for parent-model and Planning correspondence but
is unreachable here.

| Profile and eligibility                   | Applicability   | Sufficiency     | Reachable here | Outcome category              | Rule category                                     | Next action                      | Candidate response                       | Candidate conclusion                       |
| ----------------------------------------- | --------------- | --------------- | -------------- | ----------------------------- | ------------------------------------------------- | -------------------------------- | ---------------------------------------- | ------------------------------------------ |
| Any supported profile; anonymous Identity | not evaluated   | not evaluated   | yes            | preserved `anonymous-context` | preserved `anonymous-identity`                    | preserved `request-more-context` | exact preserved Reasoning 2.0.0 response | exact preserved Reasoning 2.0.0 conclusion |
| Profile A or C; authenticated Identity    | not evaluated   | not evaluated   | yes            | preserved `context-only`      | preserved `authenticated-context-only`            | preserved `request-more-context` | exact preserved Reasoning 2.0.0 response | exact preserved Reasoning 2.0.0 conclusion |
| Profile B; authenticated Identity         | not established | not evaluated   | yes            | `knowledge-not-applicable`    | `authenticated-knowledge-not-applicable`          | `request-more-context`           | exact controlled non-applicable response | exact controlled non-applicable conclusion |
| Profile B; authenticated Identity         | established     | established     | yes            | `knowledge-grounded-success`  | `authenticated-knowledge-applicable-sufficient`   | `none`                           | exact governed textual scalar            | exact fixed controlled success conclusion  |
| Broader Profile B semantic model          | established     | not established | no             | `knowledge-insufficient`      | `authenticated-knowledge-applicable-insufficient` | `request-more-context`           | exact controlled insufficient response   | exact controlled insufficient conclusion   |

No arbitrary category, rule category, future version, profile, alias, or
category inferred from a familiar next action is accepted. Category, rule,
Identity, profile, applicability, sufficiency, candidate conclusion, candidate
response, and next action MUST correspond to exactly one row.

## Candidate Response Semantics

Candidate response remains Reasoning-owned and mandatory for every completed
Outcome, preserving the current Reasoning and Planning boundary.

For Knowledge-grounded success, Reasoning constructs its candidate response by
preserving the exact governed textual scalar. Knowledge owns that scalar as
proposition semantics, not as a response. Reasoning owns the candidate-response
act and performs no paraphrase, formatting, translation, templating,
conversion, qualification, or prose generation.

For negative semantic Outcomes, Reasoning uses the exact controlled responses
specified above. They reveal neither proposition content nor source details.

Planning MUST preserve the exact validated success candidate response in its
advisory `respond` Plan. Brain may assemble the existing final cognitive result
without learning the proposition, applicability decision, or sufficiency
decision.

## Explainability Correspondence

Every new Profile B Outcome contains deterministic, privacy-safe
explainability sufficient to identify:

- the exact consumed Context revision under the existing Context-consumption
  correspondence;
- the selected Outcome and rule categories;
- applicability as `established` or `not-established`;
- sufficiency as `established`, `not-established`, or `not-evaluated`; and
- that the one proposition already identified by the governed Context
  projection participated, using only its existing proposition correspondence.

No Context-local proposition identifier, participation token, new authority
proof, or provenance handle is introduced. The existing proposition
correspondence is used only to bind the decision to the already-incorporated
proposition. Public explainability MUST NOT expose proposition content,
proposition identity, Knowledge identity/version, provenance, source
identifiers, acceptance evidence, verification evidence, currentness evidence,
confidence, or private reasoning traces.

For anonymous Profile B, applicability and sufficiency are both
`not-evaluated`, and proposition participation is not asserted.

## Outcome and Failure Boundary

The following are completed semantic Outcomes:

- exact-query non-applicability; and
- applicable but insufficient evidence.

Failure ownership is closed by the responsibility that failed:

| Condition                                                                         | Originating owner                              | Reasoning boundary consequence                                                 |
| --------------------------------------------------------------------------------- | ---------------------------------------------- | ------------------------------------------------------------------------------ |
| Malformed Knowledge-issued proposition or projection at issuance                  | Knowledge                                      | none; the invalid candidate must not become valid incorporated input           |
| Knowledge projection issuer-verification failure                                  | Knowledge                                      | preserve the upstream failure; no semantic Outcome                             |
| Underlying-source authority-verification failure                                  | applicable underlying source                   | preserve the upstream failure; no semantic Outcome                             |
| Source Currentness failure                                                        | capability owning the applicable determination | preserve the upstream failure; no semantic Outcome                             |
| Malformed incorporated Context fragment                                           | Context                                        | reject structurally invalid supplied input without replacing Context ownership |
| Invalid Profile B cardinality at incorporation                                    | Context                                        | reject the invalid supplied profile without selecting or repairing material    |
| Context structural, Contextual Applicability, incorporation, or inclusion failure | Context                                        | preserve the Context failure or reject the invalid supplied input              |
| Context authority failure                                                         | Context                                        | no valid Reasoning evaluation                                                  |
| Malformed or incomplete bounded Reasoning query                                   | Reasoning                                      | Reasoning-owned invalid-query failure                                          |
| Unsupported bounded query kind                                                    | Reasoning                                      | Reasoning-owned invalid-query failure                                          |
| Internal Reasoning rule or state defect                                           | Reasoning                                      | Reasoning-owned rule/state failure                                             |
| Exact-query non-applicability                                                     | not a failure                                  | completed Reasoning Outcome                                                    |
| Applicable but insufficient evidence in a later admitted rule                     | not a failure                                  | completed Reasoning Outcome                                                    |

Reasoning owns its boundary rejection consequence when supplied input is
structurally inadmissible. That consequence does not reclassify or replace an
originating Knowledge, source, or Context defect. No failure has two semantic
owners, and propagation does not transfer ownership.

## Knowledge Projection Correspondence

The reviewed and committed Knowledge executable projection operation defines
the semantic projection correspondence consumed upstream by Context. Its
successful result provides:

- one immutable proposition identity;
- the bounded assertion: subject key, predicate key, and one governed non-empty
  textual scalar;
- exact Knowledge identity and version correspondence;
- the exact Context-owned `CandidatePreparationAssociation`;
- accepted-state correspondence;
- applicable Source Currentness correspondence;
- Knowledge attribution;
- completed Knowledge-owned issuer-verification correspondence; and
- applicable underlying-source authority correspondence when governed.

Only the subject key, predicate key, and governed textual scalar are semantic
rule inputs to Reasoning. Proposition identity and all Knowledge, acceptance,
currentness, attribution, issuer, underlying-source, and preparation-association
correspondence remain upstream authority material opaque to Reasoning.
`CandidatePreparationAssociation` is owned and established by Context
preparation. Reasoning does not receive it as semantic input and does not
dereference, interpret, reconstruct, or independently validate it. A
`CandidateClaim`, optional provenance pointer, candidate or source internal
material, and raw authority evidence are not received, dereferenced, or exposed
by Reasoning.

This correspondence establishes semantic shape and ownership only. Concrete
Core types, executable Knowledge APIs, projection/verifier implementation,
transport, persistence, diagnostics, integration, tests, and failure classes
remain deferred.

## Context Executable-Language Requirements

Active Context Engine 5.1.0 governs the Profile B semantic boundary. A future
executable realization must preserve:

- exactly one Identity fragment followed by one Knowledge fragment;
- the minimized subject key, predicate key, and governed textual scalar needed
  by Reasoning;
- the existing proposition correspondence already authorized by the governed
  projection; and
- the exact Context-owned `CandidatePreparationAssociation` as opaque
  correlation/correspondence material that is not rule-visible to Reasoning;
- upstream accepted-state, currentness, attribution, and completed issuer
  correspondence preserved opaquely where required for Context authority; and
- exact immutable Context revision correspondence.

Context introduces no new proposition identifier or participation field.
Context remains responsible for candidate structure, completed-verification
prerequisites, Contextual Applicability, exact-one incorporation, minimization,
Contextual Currentness, stable reuse, activation, and Context authority.
Reasoning consumes the resulting authoritative Context boundary and does not
repeat, reconstruct, or independently validate those responsibilities.

## Planning Correspondence

This specification matches the closed future correspondence already governed
by Active Planning 2.1.0:

| Reasoning Outcome            | Next action            | Planning consequence                                        |
| ---------------------------- | ---------------------- | ----------------------------------------------------------- |
| `knowledge-grounded-success` | `none`                 | advisory `respond`, preserving the exact candidate response |
| `knowledge-not-applicable`   | `request-more-context` | advisory `request-more-context`                             |
| `knowledge-insufficient`     | `request-more-context` | advisory `request-more-context`                             |

Planning receives only the verified Reasoning Outcome and does not inspect any
query or proposition field, applicability evidence, sufficiency evidence,
currentness, or source correspondence.

## Brain and Skill Opacity

Brain continues to branch only on the exact verified Candidate Plan. It does
not inspect the Reasoning category, query, proposition, applicability,
sufficiency, Knowledge identity, currentness, or provenance.

Knowledge-grounded success and an advisory `respond` Plan do not establish
execution intent, Skill selection, Skill invocation, protected execution, or
authorization. Existing independently governed execution-intent and Security
boundaries remain unchanged.

## Determinism Proof Table

The table below is exhaustive for valid states in this textual-only Profile B
subset after request, Context, profile, and exact-one structural validation.

| Identity      | Subject/predicate correspondence | Textual scalar | Applicability   | Sufficiency   | Unique result                |
| ------------- | -------------------------------- | -------------- | --------------- | ------------- | ---------------------------- |
| anonymous     | not evaluated                    | not evaluated  | not evaluated   | not evaluated | preserved anonymous Outcome  |
| authenticated | mismatch                         | valid          | not established | not evaluated | `knowledge-not-applicable`   |
| authenticated | exact match                      | valid          | established     | established   | `knowledge-grounded-success` |

A missing, empty, malformed, or non-text value is invalid upstream material
and is outside the valid-state table. No valid textual-only row produces
`knowledge-insufficient`. Sufficiency cannot be evaluated when applicability
is not established. Equivalent governed query identifiers, bounded textual
assertion semantics, Identity state, and exact authoritative Context
correspondence produce equivalent Outcomes.

## Privacy and Minimization Table

| Information                                                      | Classification                 | Reasoning treatment                                          |
| ---------------------------------------------------------------- | ------------------------------ | ------------------------------------------------------------ |
| Query kind, query subject key, query predicate key               | `REQUIRED_BY_REASONING`        | Used only for the bounded rule                               |
| Proposition subject key and predicate key                        | `REQUIRED_BY_REASONING`        | Compared by exact governed equality                          |
| Governed non-empty textual scalar                                | `REQUIRED_BY_REASONING`        | Used after applicability succeeds and preserved as response  |
| Exact Context revision correspondence                            | `REQUIRED_BY_REASONING`        | Used by the existing Reasoning authority boundary            |
| Existing proposition identity/correspondence                     | `PRESERVED_FOR_AUTHORITY_ONLY` | Not a rule input and not publicly exposed                    |
| Context-owned `CandidatePreparationAssociation`                  | `PRESERVED_FOR_AUTHORITY_ONLY` | Opaque correlation material; never rule-visible or interpreted |
| Knowledge identity/version and accepted-state correspondence     | `PRESERVED_FOR_AUTHORITY_ONLY` | Opaque to Reasoning; not semantically read                   |
| Source Currentness correspondence                                | `PRESERVED_FOR_AUTHORITY_ONLY` | Opaque upstream correspondence; not received as a rule input |
| Attribution and issuer-verification correspondence               | `PRESERVED_FOR_AUTHORITY_ONLY` | Opaque upstream correspondence; not inspected or reverified  |
| Underlying-source authority correspondence, where applicable     | `PRESERVED_FOR_AUTHORITY_ONLY` | Opaque upstream correspondence; not inspected or reverified  |
| CandidateClaim, optional provenance pointer, KnowledgeRecord, Store metadata | `PROHIBITED_FROM_REASONING` | Never received, dereferenced, or exposed                  |
| Raw provenance, acceptance evidence, verifier evidence internals | `PROHIBITED_FROM_REASONING`    | Never received                                               |
| Source internals, source fragments, hidden identifiers           | `PROHIBITED_FROM_REASONING`    | Never received                                               |
| Memory material                                                  | `PROHIBITED_FROM_REASONING`    | Never interpreted or received as Knowledge evidence          |
| Confidence, provider/model data, private reasoning traces        | `PROHIBITED_FROM_REASONING`    | Never created or received                                    |

## Authorization and Currentness

Nothing in this rule establishes authorization. Authenticated Identity,
authoritative Context, completed issuer verification, Source Currentness,
applicability, sufficiency, success, candidate response, Planning `respond`, or
Brain response assembly does not replace a Security-owned authorization
decision.

Reasoning does not receive or interpret Source Currentness as a rule input. The
authoritative Context boundary carries whatever opaque governed correspondence
is required upstream. Reasoning relies on that authoritative Context and does
not establish, revalidate, recalculate, or reason about Source Currentness or
Contextual Currentness.

## CONTRACT-0001 Assessment

`CONTRACT_0001_SUFFICIENT`

This rule introduces no source retrieval collaboration. Knowledge projection
availability and Context incorporation remain specializations of the existing
source-return/candidate boundary. Query interpretation and Reasoning Outcomes
remain outside CONTRACT-0001. No CONTRACT-0002 is required.

## Execution-Model Neutrality

This specification defines semantic representations and predicates only. It
does not define TypeScript, serialization, parser APIs, functions, classes,
switch statements, registries, maps, callbacks, dependency injection,
Bootstrap wiring, persistence, transport, providers, models, concrete errors,
or deployment mechanics.

## Deferred Scope

The reviewed Knowledge executable projection operation establishes the
semantic projection correspondence, exact target, result cardinality, opaque
authority boundary, verifier proof boundary, and failure ownership consumed
upstream by Context. That reviewed correspondence does not establish an
executable or runtime realization for this rule.

The following remain deferred:

- executable Core types and literal encoding;
- any raw-query conversion, parser, or normalizer;
- concrete Knowledge projection and verifier APIs and implementations;
- Context Profile B runtime implementation;
- Reasoning, Planning, and Brain runtime implementation;
- concrete error classes and diagnostics;
- conformance, integration, and implementation tests;
- Bootstrap composition and end-to-end integration;
- response rendering beyond exact candidate-value preservation;
- production Profile B preparation and selection;
- multiple propositions and compound queries;
- non-scalar values, conversion, calculation, synthesis, and inference;
- Skill execution; and
- transport, persistence, provider, and model concerns.

## Related Documents

- [Active Reasoning Engine 3.0.0](ENGINE-0006-Reasoning-Engine-Revision-3.0.0.md)
- [REVIEW-0004 — Reasoning Engine Executable Bounded Rule](../../../docs/architecture-review/REVIEW-0004-Reasoning-Engine-Executable-Bounded-Rule.md)
- [Superseded Reasoning Engine 2.0.0 historical predecessor](ENGINE-0006-Reasoning-Engine-Revision-2.0.0.md)
- [Active Knowledge Engine 3.0.0](../knowledge/ENGINE-0005-Knowledge-Engine-Revision-3.0.0.md)
- [Knowledge Engine Executable Projection Operation](../knowledge/ENGINE-0005-Knowledge-Engine-Executable-Projection-Operation.md)
- [REVIEW-0003 — Knowledge Engine Executable Projection Operation](../../../docs/architecture-review/REVIEW-0003-Knowledge-Engine-Executable-Projection-Operation.md)
- [Active Context Engine 5.1.0](../context/ENGINE-0003-Context-Engine-Revision-5.1.0.md)
- [Planning Engine 2.1.0](../planning/ENGINE-0007-Planning-Engine-Revision-2.1.0.md)
- [Brain Engine 2.0.3](../ENGINE-0001-Brain-Engine-Revision-2.0.3.md)
- [Documentation Authority](../../../docs/DOCUMENT-AUTHORITY.md)
- [ADR-0007 — Brain Orchestration Ownership and Planning Binding](../../../docs/adr/ADR-0007-Brain-Orchestration-Ownership-and-Planning-Binding.md)
- [ADR-0008 — Context Collaboration, Source Ownership, and Reference Authority](../../../docs/adr/ADR-0008-Context-Collaboration-Source-Ownership-and-Reference-Authority.md)
- [ADR-0011 — Source Currentness, Contextual Currentness, and Currentness Change](../../../docs/adr/ADR-0011-Source-Currentness-Contextual-Currentness-and-Currentness-Change.md)
- [ADR-0012 — Authorization Semantics, Enforcement, and Authorized-Reference Applicability](../../../docs/adr/ADR-0012-Authorization-Semantics-Enforcement-and-Authorized-Reference-Applicability.md)
- [ADR-0013 — Failure Ownership, Propagation, and Candidate Context Revision Consequences](../../../docs/adr/ADR-0013-Failure-Ownership-Propagation-and-Candidate-Context-Revision-Consequences.md)
- [ADR-0020 — Knowledge Evidence Boundary for Source-Aware Reasoning](../../../docs/adr/ADR-0020-Knowledge-Evidence-Boundary-for-Source-Aware-Reasoning.md)
- [ADR-0021 — Knowledge Source Currentness and Projection Attribution](../../../docs/adr/ADR-0021-Knowledge-Source-Currentness-and-Projection-Attribution.md)
- [ADR-0022 — Context Preparation Semantic Scope and Applicability Policy](../../../docs/adr/ADR-0022-Context-Preparation-Semantic-Scope-and-Applicability-Policy.md)
- [CONTRACT-0001 — Context Source Retrieval](../../../docs/contracts/CONTRACT-0001-Context-Source-Retrieval.md)
- [OES-0002 — Engine Design](../../../docs/engineering/OES-0002-Engine-Design.md)
- [OES-0004 — Contracts](../../../docs/engineering/OES-0004-Contracts.md)
- [OES-0008 — Documentation Standards](../../../docs/engineering/OES-0008-Documentation-Standards.md)
- [OES-0010 — Versioning Standards](../../../docs/engineering/OES-0010-Versioning-Standards.md)

## Change History

| Version | Date       | Description                                                                                                                           |
| ------- | ---------- | ------------------------------------------------------------------------------------------------------------------------------------- |
| 1.1.1   | 2026-08-31 | Recorded governed semantic architecture approval through REVIEW-0004; the bounded-rule specification remains Draft and runtime and implementation gates remain open. |
| 1.1.0   | 2026-08-31 | Synchronized with Active Reasoning 3.0.0, Active Knowledge 3.0.0, the reviewed Knowledge executable projection, and explicit Context-owned CandidatePreparationAssociation opacity. |
| 1.0.0   | 2026-08-17 | Drafted the deterministic exact attribute-value query/proposition rule and its closed Reasoning correspondence.                       |
| 1.0.0   | 2026-08-19 | Synchronized governed identifier validity and active Context/Knowledge correspondence with the closed Reasoning 3.0.0 semantic slice. |
