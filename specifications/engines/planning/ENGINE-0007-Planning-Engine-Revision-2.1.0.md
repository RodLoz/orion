# ENGINE-0007 — Planning Engine Revision

| Field          | Value                                                             |
| -------------- | ----------------------------------------------------------------- |
| **Status**     | Active                                                            |
| **Supersedes** | 2.0.0                                                             |
| **Version**    | 2.1.0                                                             |
| **Owner**      | Planning Engine                                                   |
| **Created**    | 2026-08-17                                                        |
| **Updated**    | 2026-08-17                                                        |
| **Applies To** | Candidate Plan construction, issuance, and authority verification |

---

## Status and Authority

This specification is Active and is the sole current canonical ENGINE-0007
revision. It supersedes versions 1.0.0, 1.1.0, and 2.0.0. Those revisions
remain historical and non-authoritative.

Reasoning Engine 2.0.0 remains Active. Reasoning Engine 3.0.0 is an
architecturally approved Draft and remains non-authoritative. This revision
defines future correspondence with the approved Reasoning 3.0.0 semantic
categories without presenting that revision as Active and without depending
on its activation for compatibility with Reasoning 2.0.0.

Planning remains the semantic owner of Candidate Plan construction and
Planning Outcome semantics. Core remains the schema custodian. The Planning
Engine runtime remains the issuer, private provenance owner, and authority
verifier. Applicable Active ADRs govern in a conflict.

## Purpose

Planning Engine 2.1.0 defines a source-opaque successor correspondence that:

- accepts every authoritative Reasoning 2.0.0 Outcome accepted by Planning
  2.0.0 with unchanged Planning consequences;
- adds explicit future correspondence for the three new semantic Outcome
  categories approved in the Reasoning 3.0.0 Draft;
- retains a closed, governed category and next-action model;
- constructs one deterministic immutable advisory Candidate Plan; and
- preserves Planning ownership, exact Reasoning correspondence, authority,
  failure, Brain, Skill, and authorization boundaries.

Planning plans from one exact authoritative Reasoning Outcome. It does not
reason, retrieve, interpret evidence, decide source semantics, authorize,
orchestrate, execute, render a response, or assemble a final cognitive result.

## Version Classification

Version 2.1.0 is a MINOR revision under OES-0010. The change is additive and
backward-compatible:

- every Reasoning 2.0.0 category, rule category, next-action combination, and
  Planning mapping accepted by Planning 2.0.0 remains accepted unchanged;
- the Planning request and result ownership model remains unchanged;
- the existing `respond` and `request-more-context` Candidate Plan semantics
  remain unchanged;
- the existing exact Reasoning correspondence and Planning authority model
  remain unchanged; and
- three future Reasoning semantic categories receive explicit deterministic
  correspondence without making acceptance open-ended.

No existing valid caller is required to provide new evidence or migrate the
currently Active Reasoning Engine merely to activate Planning 2.1.0. Concrete
executable-language changes required to represent the additive accepted set
remain deferred.

## Capability Ownership

Planning continues to own:

- admissibility of the Planning request at its boundary;
- exact consumption of one supplied authoritative Reasoning Outcome;
- validation of the closed Reasoning-to-Planning correspondence accepted by
  this revision;
- deterministic Planning rule selection;
- Candidate Plan, Candidate Plan Step, and Planning explainability semantics;
- Planning-domain failures; and
- Candidate Plan issuance and authority verification.

Reasoning retains Outcome, category, rule, candidate conclusion, candidate
response, candidate next-action, exact-query applicability, and evidence
sufficiency semantics. Context, Knowledge, Memory, Security, Brain, Skill,
Bootstrap, Providers, Adapters, transport, and infrastructure retain their
established responsibilities.

Planning does not acquire a second or shared ownership role for any
Reasoning-owned semantic distinction merely because it validates and maps that
distinction.

## Scope

Version 2.1.0 specifies only:

- backward-compatible acceptance of the complete Planning 2.0.0 Reasoning
  correspondence;
- additive acceptance of the three approved future Reasoning 3.0.0 semantic
  categories;
- one closed semantic category and next-action compatibility matrix;
- unchanged deterministic `respond` and `request-more-context` Candidate Plan
  consequences;
- unchanged preservation of the authoritative candidate response on the
  `respond` branch;
- exact Reasoning Outcome consumption correspondence; and
- Planning-owned issuance and authority boundaries for the expanded accepted
  set.

This revision defines no runtime implementation, Core executable language,
source retrieval, evidence inspection, Context-fragment interpretation,
Knowledge interaction, Memory interpretation, reasoning, authorization,
execution, persistence, transport, response rendering, or Brain composition.

## Planning Input Boundary

Planning continues to consume one request whose meaning is to create one
Candidate Plan from one exact verified Reasoning Outcome. The request
must identify that supplied Outcome as the sole semantic input to Planning.

Planning must validate the supported Reasoning Outcome structure and the
closed Reasoning-to-Planning semantic correspondence at the Planning boundary.
This validation must be closed and fail-safe. Planning must not invoke or
reproduce Reasoning authority verification, independently prove Reasoning
issuance, reinterpret Reasoning verification evidence, or treat structural
validation as Reasoning authority validation. It must not become a
re-evaluation of Reasoning or an inspection of the Context or source evidence
from which Reasoning produced the Outcome.

No additional Knowledge, Context, Memory, source, authorization, provenance,
currentness, applicability, or sufficiency input is permitted.

## Closed Accepted Reasoning Model

Planning 2.1.0 accepts exactly the following semantic categories:

1. the preserved Reasoning 2.0.0 `anonymous-context` category;
2. the preserved Reasoning 2.0.0 `context-only` category;
3. bounded Knowledge-grounded success, as approved for future Reasoning
   3.0.0;
4. exact-query non-applicability, as approved for future Reasoning 3.0.0; and
5. applicable but insufficient evidence, as approved for future Reasoning
   3.0.0.

This list is closed. A category not explicitly included by this specification
must be rejected as an unsupported Reasoning category even when it carries a
familiar candidate next action, candidate response, identity state, or rule
category.

The future Reasoning semantic categories remain distinct. The fact that two
of them share `request-more-context` does not merge their Reasoning meaning or
authorize Planning to accept an arbitrary category with that next action.

Concrete literals for the future Reasoning categories and rule categories
remain deferred by the Reasoning 3.0.0 Draft. This specification governs the
closed semantic set and correspondence; it does not invent executable names.

## Compatibility Matrix

Exactly one governed row must match a valid authoritative Reasoning Outcome.
The semantic matrix is closed.

| Reasoning revision | Reasoning Outcome category           | Identity and Reasoning rule correspondence                          | Required candidate next action   | Candidate Plan category                                    | Candidate Plan step                                          | Planning rule consequence                                                         |
| ------------------ | ------------------------------------ | ------------------------------------------------------------------- | -------------------------------- | ---------------------------------------------------------- | ------------------------------------------------------------ | --------------------------------------------------------------------------------- |
| 2.0.0              | `anonymous-context`                  | `anonymous` and `anonymous-identity`                                | `request-more-context`           | `request-more-context`                                     | `request-more-context`                                       | `reasoning-requested-more-context`                                                |
| 2.0.0              | `context-only`                       | `authenticated` and `authenticated-context-only`                    | `request-more-context` or `none` | `request-more-context` when requested; otherwise `respond` | same as Candidate Plan category                              | `reasoning-requested-more-context` or `reasoning-produced-response`, respectively |
| Future 3.0.0 Draft | bounded Knowledge-grounded success   | approved applicable-and-sufficient bounded Knowledge Reasoning rule | `none`                           | `respond`                                                  | `respond`, preserving the exact validated candidate response | `reasoning-produced-response`                                                     |
| Future 3.0.0 Draft | exact-query non-applicability        | approved non-applicable Reasoning rule                              | `request-more-context`           | `request-more-context`                                     | `request-more-context`                                       | `reasoning-requested-more-context`                                                |
| Future 3.0.0 Draft | applicable but insufficient evidence | approved insufficient-evidence Reasoning rule                       | `request-more-context`           | `request-more-context`                                     | `request-more-context`                                       | `reasoning-requested-more-context`                                                |

The future rule descriptions in this table identify Reasoning-owned semantic
correspondence only. They do not permit Planning to inspect a Context profile,
Context fragment, Knowledge proposition, or evidence state. Planning validates
only the authoritative Reasoning Outcome fields that represent the applicable
row.

## Preserved Reasoning 2.0.0 Correspondence

Planning 2.1.0 must accept every valid authoritative Reasoning 2.0.0 Outcome
that Planning 2.0.0 accepted.

The following remain unchanged:

- `anonymous-context` corresponds only to `anonymous`,
  `anonymous-identity`, and `request-more-context`;
- `context-only` corresponds only to `authenticated`,
  `authenticated-context-only`, and either `request-more-context` or `none`;
- `request-more-context` produces the existing advisory
  `request-more-context` Candidate Plan; and
- `none` produces the existing advisory `respond` Candidate Plan containing
  the exact validated Reasoning candidate response.

No Reasoning 2.0.0 category, rule, identity, next-action, Planning rule, step,
or Candidate Plan meaning is renamed, narrowed, broadened, or reinterpreted.
Activation of Planning 2.1.0 therefore does not require activation or migration
of Reasoning 3.0.0.

## Future Reasoning 3.0.0 Correspondence

The Reasoning 3.0.0 Draft is a future dependency and remains
non-authoritative. If its approved semantic categories become Active,
Planning 2.1.0 provides the following source-opaque correspondence.

### Bounded Knowledge-Grounded Success

A completed authoritative Reasoning Outcome denoting bounded
Knowledge-grounded response readiness is accepted only with the approved
applicable-and-sufficient Reasoning rule correspondence and candidate next
action `none`.

Planning maps that Outcome to the existing advisory `respond` Candidate Plan,
with one `respond` step containing the exact validated Reasoning candidate
response and with the existing `reasoning-produced-response` Planning rule
consequence.

Planning does not verify sufficiency, inspect the proposition, regenerate the
conclusion, create response content, render the final response, infer a Skill,
or infer authorization.

### Exact-Query Non-Applicability

A completed authoritative Reasoning Outcome denoting exact-query
non-applicability is accepted only with its approved distinguishable Reasoning
rule correspondence and candidate next action `request-more-context`.

Planning maps that Outcome through the existing advisory
`request-more-context` Candidate Plan rule. Planning does not reinterpret,
inspect, or recompute why the proposition was non-applicable.

### Applicable but Insufficient Evidence

A completed authoritative Reasoning Outcome denoting applicability with
insufficient evidence is accepted only with its approved distinguishable
Reasoning rule correspondence and candidate next action
`request-more-context`.

Planning maps that Outcome through the same existing advisory
`request-more-context` Candidate Plan rule while preserving the distinguishable
Reasoning category in Planning's consumption correspondence and explainability
where that category is represented. Planning does not inspect or recompute
applicability or sufficiency.

## Category and Next-Action Validation

Planning validates the complete allowed correspondence, not the next action in
isolation. The following are invalid Planning inputs:

- bounded Knowledge-grounded success with `request-more-context`;
- exact-query non-applicability with `none`;
- applicable but insufficient evidence with `none`;
- either preserved Reasoning 2.0.0 category with an identity or rule category
  outside its existing allowed correspondence;
- a future semantic category with the wrong approved Reasoning rule
  correspondence; and
- any unknown category paired with `none` or `request-more-context`.

Planning must reject an invalid pair through its existing Planning-owned input
or correspondence-validation responsibility. It must not repair, normalize,
reinterpret, coerce, downgrade, or substitute a category, rule, identity, next
action, candidate response, or Outcome.

No generic category registry, open string acceptance rule, source-specific
extension hook, or rule that accepts any category based only on next action is
authorized.

## Candidate Plan Semantics

Planning continues to construct exactly one immutable advisory Candidate Plan
with exactly one governed step.

### Request More Context

For every accepted Outcome whose governed next action is
`request-more-context`:

- Candidate Plan category remains `request-more-context`;
- step kind remains `request-more-context`; and
- Planning rule consequence remains `reasoning-requested-more-context`.

This consequence does not initiate retrieval, prepare or reopen Context,
select a profile, inspect a source, or require another cognitive cycle.

### Respond

For every accepted Outcome whose governed next action is `none`:

- Candidate Plan category remains `respond`;
- step kind remains `respond`;
- the step preserves the exact validated Reasoning candidate response; and
- Planning rule consequence remains `reasoning-produced-response`.

Planning does not create or mutate Knowledge-grounded response content. It
does not become the owner of the candidate response or final response.
Planning owns the Candidate Plan and its advisory correspondence; Reasoning
retains candidate-response semantics, and Brain retains final cognitive-result
assembly.

## Advisory Nature and Authorization

Every Candidate Plan remains advisory orchestration material. Neither a
`respond` plan nor any Reasoning Outcome establishes authorization.

Planning must not infer authorization from:

- Reasoning success or authority;
- a `respond` Candidate Plan;
- authenticated Identity;
- bounded Knowledge-grounded success;
- candidate next action `none`;
- Context authority; or
- any source or evidence correspondence hidden behind Reasoning.

Security retains authorization semantics and decisions. An applicable
protected boundary retains enforcement responsibility. Planning does not
authorize a response, operation, Skill, retrieval, or protected action.

## Planning Authority

Planning authority continues to prove only:

1. that the candidate is the exact Candidate Plan issued and registered by the
   Planning runtime;
2. that the consumed Reasoning Outcome is the exact verified Outcome associated
   with that issuance;
3. that the Candidate Plan's Planning-owned source correspondence and
   explainability correspond to the accepted Reasoning status, category,
   candidate next action, identity state, and Reasoning rule category; and
4. that the exact registered Candidate Plan graph remains unmodified.

A cloned, reconstructed, substituted, or merely structurally equivalent
Reasoning Outcome cannot acquire Planning authority by matching visible
fields. Authority verification must continue to require the exact consumed
Reasoning Outcome associated with issuance.

Planning authority does not prove Knowledge truth, proposition identity,
Knowledge identity or version, accepted state, provenance, issuer authority,
underlying-source authority, Source Currentness, Contextual Currentness,
Context authority, exact-query applicability, evidence sufficiency,
Reasoning correctness, or Security authorization.

No second authority mechanism is introduced for Knowledge-grounded Outcomes.
Concrete registries, object-identity mechanics, persistence, and cross-runtime
authority remain outside this specification.

## Explainability and Consumption Correspondence

Planning continues to expose only the Planning-relevant public correspondence
needed to identify:

- the consumed Reasoning status and accepted category;
- the consumed candidate next action;
- the applicable Reasoning-owned identity and rule correspondence;
- the resulting Candidate Plan category and one-step count; and
- the selected Planning rule consequence.

The semantic category must remain distinguishable in the Planning consumption
reference and explainability when two categories share the same next action.
This preserves closed validation without exposing why Reasoning selected the
category.

Planning explainability and correspondence must not expose Context internals,
Context fragments, Memory fragments, Knowledge proposition content or
identity, Knowledge identity or version, accepted state, provenance,
currentness, issuer-verification details, applicability evidence, sufficiency
evidence, or private Reasoning traces.

## Source Opacity

Planning is completely source-opaque. Planning must not inspect, require,
retrieve, preserve as independent evidence, validate, or infer:

- Knowledge proposition content or identity;
- Knowledge identity, version, accepted state, records, or projections;
- Knowledge or underlying-source issuer-verification correspondence;
- underlying-source authority;
- Source Currentness or Contextual Currentness;
- exact-query applicability evidence;
- evidence-sufficiency evidence;
- provenance or source metadata;
- Context profile structure or Context fragments; or
- Memory fragments or Memory semantics.

Planning may know only the authoritative Reasoning-owned public Outcome
category and Planning-relevant candidate fields required by the closed matrix.
A semantic category name may summarize a Reasoning result without granting
Planning access to or ownership of the evidence behind that result.

Profiles A, B, and C remain Context-owned structures. Planning defines no
profile-specific logic and does not distinguish a Reasoning Outcome by
inspecting its source profile.

## Failure Ownership

Planning owns only failures arising from Planning-owned responsibilities,
including:

- malformed or inadmissible Planning requests;
- malformed or unsupported Reasoning Outcome input at the Planning boundary;
- an unsupported Reasoning category;
- an invalid category, identity, rule-category, next-action, candidate-field,
  or Planning-rule correspondence;
- inability to select or construct one governed Candidate Plan;
- invalid Planning lifecycle or internal state; and
- Candidate Plan issuance or authority-verification failure.

Exact-query non-applicability and applicable but insufficient evidence are
completed Reasoning Outcomes, not upstream failures and not Planning failures.
Their accepted Planning consequence is a completed advisory
`request-more-context` Candidate Plan.

Reasoning failures remain Reasoning-owned. Knowledge, Context, source,
Security, Brain, Skill, Bootstrap, Provider, Adapter, transport, and
infrastructure failures retain their originating ownership and semantic
identity. Propagation, observation, normalization at an orchestration boundary,
or a downstream Planning consequence does not transfer ownership.

This specification does not invent concrete runtime error classes.

## Determinism

Equivalent authoritative Reasoning Outcomes under the same governed semantic
correspondence must produce equivalent Candidate Plans.

Each accepted semantic category and candidate next-action pair has exactly one
Planning consequence in the closed matrix. Planning introduces no
probabilistic planning, confidence, ranking, model choice, provider choice,
evidence inspection, source-specific rule, or alternate mapping.

## Brain Boundary

Brain invokes the Reasoning-owned authority verifier under its existing
orchestration responsibility and supplies the exact verified Reasoning Outcome
to Planning. Planning consumes that verified result, validates only its
Planning-owned input structure and closed semantic correspondence, and maps it
into a Candidate Plan. Brain may use the Planning-owned authority verifier for
that resulting Candidate Plan and owns downstream orchestration and final
cognitive-result assembly. An unverified Reasoning Outcome is not a valid
Planning input. Planning does not coordinate Reasoning, Context, Knowledge,
Memory, Security, or Skill.

Planning 2.1.0 preserves the Candidate Plan categories and advisory branch
semantics consumed by Active Brain 2.0.3. Brain 2.0.3 explicitly supports
Reasoning 2.0.0 with Planning 2.1.0 and conditionally supports future Reasoning
3.0.0 with Planning 2.1.0. This satisfies Planning's Brain specification
correspondence without changing Brain behavior or making Brain source-aware.

Brain must not receive or inspect which proposition participated, Knowledge
identity or version, provenance, currentness, exact-query applicability, or
evidence sufficiency. Planning 2.1.0 does not transfer those semantics to
Brain.

## Skill Boundary

Planning does not create execution intent, select a Skill, bind a Skill,
invoke a Skill, execute an action, or interpret a Skill result.

A `respond` Candidate Plan remains distinct from Skill capability intent,
Skill selection, Skill invocation, protected action, and Skill result.
Bounded Knowledge-grounded Reasoning success does not automatically create a
Skill Plan or authorize Skill execution. Existing Skill semantics remain
unchanged.

## CONTRACT-0001 Correspondence

`CONTRACT_0001_SUFFICIENT`.

Planning remains outside CONTRACT-0001. The Contract ends at source-owned
returned semantics becoming candidates available to Context and does not
govern Reasoning-to-Planning correspondence, Candidate Plans, Planning
authority, or Brain orchestration.

Planning introduces no source retrieval collaboration and does not expand,
revise, or depend directly on CONTRACT-0001. No CONTRACT-0002 is required or
authorized.

## Production Reachability

Planning 2.1.0 defines semantic compatibility only. It does not establish that
production Brain currently supplies Profile B, that caller or profile-selection
ownership has been resolved, or that the production Knowledge-aware path is
reachable.

Production Profile B reachability, Bootstrap wiring, and caller/profile
selection remain separate deferred concerns. Lack of current production
reachability does not prevent Planning from defining future closed
correspondence, and this specification makes no claim that the future path executes.

## Lifecycle Compatibility

Planning 2.1.0 is Active while Reasoning 2.0.0 remains Active. Its authority
for existing operation does not depend on the Reasoning
3.0.0 Draft becoming Active.

This supports a dependency-safe future lifecycle sequence in which Planning
correspondence may be approved before Reasoning 3.0.0 activation. A compatible
Brain specification/reference update and all implementation readiness must be
established through later review before the future Reasoning categories cross
the production Brain and Planning boundaries.

This activation does not activate Reasoning or any implementation, and it does
not finalize the repository-wide activation order.

## Existing Planning Preservation

Except for the additive closed category correspondence defined here, Planning
2.1.0 preserves Planning 2.0.0 architectural invariants:

- one exact authoritative Reasoning Outcome is required;
- Planning mapping is deterministic;
- Planning owns the Candidate Plan and Planning explainability;
- Candidate Plans remain advisory;
- Planning authority requires exact Reasoning correspondence;
- the authoritative candidate response is preserved on `respond`;
- Brain receives only governed Planning output;
- Planning remains source-opaque;
- failure origin is preserved;
- Skill semantics remain separate;
- authorization remains independent;
- no direct Engine coupling is introduced; and
- no source retrieval or evidence boundary is introduced.

## Execution-Model Neutrality

This specification defines semantic mappings and invariants only. It does not
prescribe TypeScript types, functions, classes, switch statements, registries,
maps, callbacks, dependency injection, Bootstrap mechanics, serialization,
transport, persistence, provider or model logic, concrete runtime errors, or
authority-registry mechanics.

## Deferred Scope

The following remain deferred:

- runtime implementation;
- Core executable language;
- concrete literals for future Reasoning outcome and rule categories unless
  established by later governing Reasoning work;
- concrete Planning API, request, result, reference, explainability, and
  verifier-shape changes;
- Reasoning 3.0.0 activation;
- a Brain specification/reference successor;
- Bootstrap wiring;
- production Profile B reachability;
- caller and profile-selection ownership;
- diagnostics;
- tests and conformance work;
- response generation and rendering;
- Skill selection, authorization, invocation, and execution;
- Memory-aware Planning or Reasoning;
- transport, persistence, replay, and provider concerns; and
- distributed or cross-runtime authority mechanics.

No deferred item is implied to be implemented, approved, or Active by this
specification.

## Acceptance Criteria

ENGINE-0007 2.1.0 may be activated only when the accepted specification
establishes that:

1. Planning accepts every valid authoritative Reasoning 2.0.0 Outcome accepted
   by Planning 2.0.0 with unchanged mapping;
2. the three future Reasoning 3.0.0 semantic additions each have one explicit,
   deterministic Planning correspondence;
3. category validation remains closed and cannot be bypassed by a familiar
   next action;
4. `none` maps only through a governed allowed pair to advisory `respond`, and
   `request-more-context` maps only through a governed allowed pair to advisory
   `request-more-context`;
5. the exact Reasoning candidate response is preserved on `respond` without
   Planning acquiring response-generation ownership;
6. Planning authority continues to prove exact Planning issuance and exact
   consumed-Reasoning correspondence only;
7. source opacity, authorization independence, failure-origin preservation,
   Brain and Skill boundaries, and deterministic behavior remain intact;
8. no Knowledge, Context-fragment, currentness, applicability, sufficiency,
   provenance, Memory, profile, or source semantics enter Planning; and
9. CONTRACT-0001 remains unchanged and no CONTRACT-0002 is introduced.

## Compatibility

Planning 2.1.0 is backward-compatible with Planning 2.0.0 callers operating
with authoritative Reasoning 2.0.0 Outcomes. No currently valid Reasoning
2.0.0 Outcome loses acceptance or changes its Candidate Plan consequence.

Planning 2.1.0 adds future semantic compatibility with the approved Reasoning
3.0.0 Draft. That future compatibility does not activate Reasoning 3.0.0,
authorize its runtime use, or make the Draft authoritative.

A future Reasoning revision that introduces any additional category or changes
an accepted category, rule, identity, next action, or candidate-field
correspondence requires an explicit Planning compatibility assessment and,
where applicable, a new Planning revision. Familiar next-action text alone is
never sufficient.

## Change History

| Version | Date       | Description                                                                                                                                    |
| ------- | ---------- | ---------------------------------------------------------------------------------------------------------------------------------------------- |
| 1.0.0   | 2026-07-20 | Established the original Planning Engine vertical slice.                                                                                       |
| 1.1.0   | 2026-07-29 | Added issuer-owned Candidate Plan authority verification.                                                                                      |
| 2.0.0   | 2026-08-10 | Aligned Planning with the narrowed Reasoning output and removed parallel evidence correspondence from Planning and authority verification.     |
| 2.1.0   | 2026-08-17 | Drafted backward-compatible closed correspondence for the approved future Reasoning 3.0.0 semantic categories while preserving source opacity. |

## References

- [Documentation Authority](../../../docs/DOCUMENT-AUTHORITY.md)
- [Core Architecture](../../architecture/ARCH-0001-Core-Architecture.md)
- [OES-0002 — Engine Design](../../../docs/engineering/OES-0002-Engine-Design.md)
- [OES-0004 — Contracts](../../../docs/engineering/OES-0004-Contracts.md)
- [OES-0008 — Documentation Standards](../../../docs/engineering/OES-0008-Documentation-Standards.md)
- [OES-0009 — Security Standards](../../../docs/engineering/OES-0009-Security-Standards.md)
- [OES-0010 — Versioning Standards](../../../docs/engineering/OES-0010-Versioning-Standards.md)
- [ADR-0003 — Engine Communication Model](../../../docs/adr/ADR-0003-Engine-Communication-Model.md)
- [ADR-0007 — Brain Orchestration Ownership and Planning Binding](../../../docs/adr/ADR-0007-Brain-Orchestration-Ownership-and-Planning-Binding.md)
- [ADR-0008 — Context Collaboration, Source Ownership, and Reference Authority](../../../docs/adr/ADR-0008-Context-Collaboration-Source-Ownership-and-Reference-Authority.md)
- [ADR-0011 — Source Currentness and Contextual Currentness](../../../docs/adr/ADR-0011-Source-Currentness-Contextual-Currentness-and-Currentness-Change.md)
- [ADR-0012 — Authorization Independence](../../../docs/adr/ADR-0012-Authorization-Semantics-Enforcement-and-Authorized-Reference-Applicability.md)
- [ADR-0013 — Failure Ownership](../../../docs/adr/ADR-0013-Failure-Ownership-Propagation-and-Candidate-Context-Revision-Consequences.md)
- [ADR-0014 — Bootstrap Composition](../../../docs/adr/ADR-0014-Bootstrap-Composition-Responsibility-and-Ownership-and-Authority-Preservation.md)
- [ADR-0015 — Brain Orchestration and Final Result](../../../docs/adr/ADR-0015-Brain-Cognitive-Reference-Orchestration-and-Final-Cognitive-Result-Boundaries.md)
- [ADR-0017 — Execution-Model Independence](../../../docs/adr/ADR-0017-Execution-Model-Independence-for-Asynchronous-Event-Driven-and-Distributed-Collaboration.md)
- [ADR-0020 — Knowledge Evidence Boundary for Source-Aware Reasoning](../../../docs/adr/ADR-0020-Knowledge-Evidence-Boundary-for-Source-Aware-Reasoning.md)
- [CONTRACT-0001 — Context Source Retrieval](../../../docs/contracts/CONTRACT-0001-Context-Source-Retrieval.md)
- [CONCEPT-0004 — Authorization Model](../../concepts/CONCEPT-0004-Authorization-Model.md)
- [CONCEPT-0005 — Skill Invocation and Execution Model](../../concepts/CONCEPT-0005-Skill-Invocation-and-Execution-Model.md)
- [CONCEPT-0006 — Brain Orchestration Model](../../concepts/CONCEPT-0006-Brain-Orchestration-Model.md)
- [Context Engine 5.0.0](../context/ENGINE-0003-Context-Engine-Revision-5.0.0.md)
- [Knowledge Engine 1.2.0](../knowledge/ENGINE-0005-Knowledge-Engine-Revision-1.2.0.md)
- [Reasoning Engine 2.0.0](../reasoning/ENGINE-0006-Reasoning-Engine-Revision-2.0.0.md)
- [Reasoning Engine 3.0.0 Draft](../reasoning/ENGINE-0006-Reasoning-Engine-Revision-3.0.0.md)
- [Planning Engine 2.0.0](ENGINE-0007-Planning-Engine-Revision-2.0.0.md)
- [Brain Engine 2.0.2](../ENGINE-0001-Brain-Engine.md)
