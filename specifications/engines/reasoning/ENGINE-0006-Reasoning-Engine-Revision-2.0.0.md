# ENGINE-0006 — Reasoning Engine Revision

| Field             | Value                                                               |
| ----------------- | ------------------------------------------------------------------- |
| **Status**        | Superseded                                                          |
| **Supersedes**    | 1.1.0                                                               |
| **Superseded By** | [ENGINE-0006 3.0.0](ENGINE-0006-Reasoning-Engine-Revision-3.0.0.md) |
| **Version**       | 2.0.0                                                               |
| **Owner**         | Reasoning Engine                                                    |
| **Created**       | 2026-07-29                                                          |
| **Updated**       | 2026-08-20                                                          |
| **Applies To**    | Reasoning evaluation, outcome issuance, and authority verification  |

---

## Status and Authority

This specification is Superseded by ENGINE-0006 3.0.0. It remains the
historical authority for the Reasoning 2.0.0 semantics and supersedes versions
1.0.0 and 1.1.0. Those versions remain historical and non-authoritative; this specification does not incorporate
their incompatible request, reference, rule, outcome, explainability, or
failure semantics.

Reasoning is the semantic owner of reasoning evaluation and Reasoning Outcome
semantics. Core is the schema custodian. The Reasoning Engine runtime is the
issuer, private provenance owner, and authority verifier. Applicable Active
ADRs govern in a conflict.

## Purpose

The Reasoning Engine evaluates one bounded Reasoning Query against one exact
authoritative Active Context Revision and returns one deterministic immutable
Reasoning Outcome.

Reasoning is a cognitive activity. Brain owns outer cognitive orchestration
and final cognitive result assembly, meaning, and ownership. Context owns the
Context Revision, its lifecycle, its incorporated-reference-set closure, and
the authoritative Context output consumed by Reasoning.

## Capability Ownership

Reasoning owns:

- admissibility of the Reasoning request at its boundary;
- consumption semantics for one supplied Active Context Revision;
- Reasoning Query validation;
- the bounded deterministic Reasoning rules;
- Reasoning Outcome, candidate conclusion, candidate response, and candidate
  next-action semantics;
- safe structured Reasoning explainability;
- Reasoning-domain failures; and
- issuance and verification of Reasoning Outcome authority.

Reasoning MUST NOT retrieve, compose, incorporate, revalidate, activate,
replace, or mutate Context. It MUST NOT reconstruct the Context-owned evidence
boundary or infer source categories from Context internals. It MUST NOT own
Memory, Knowledge, source authority, Security authorization, Planning, Brain
orchestration, or final-result semantics.

## Scope

Version 2.0.0 defines:

- one exact Evaluate Reasoning request;
- one Active Context Revision per evaluation;
- one bounded query;
- two deterministic Reasoning outcome categories;
- two deterministic Reasoning rule categories;
- one immutable Reasoning Outcome;
- one Context Consumption Reference;
- Reasoning-owned issuance and authority verification; and
- strict runtime-boundary and failure behavior.

It defines no Context-source retrieval, Memory or Knowledge retrieval,
persistence, reconstruction, replay, configurable ranking, model inference,
Skill execution, Planning behavior, transport, or presentation mechanism.

## Core Concepts

### Reasoning Request

A Reasoning Request is an exact-shape proposal for one reasoning cycle. It
contains exactly:

```text
{
  intent: "evaluate",
  activeContextRevision: ActiveContextRevision,
  query: ReasoningQuery
}
```

All three fields are required. No additional field is accepted. An unexpected
field, including any independently supplied capability or source evidence,
produces `InvalidReasoningInputError`.

### Active Context Input

The request supplies exactly one complete Context-issued Active Context
Revision. Reasoning validates the supported input shape and Active lifecycle
state once at its boundary and evaluates a cycle-local immutable view.

Reasoning MUST preserve and report:

- Context Lineage Identity;
- Context Revision Identity;
- Context Revision Number;
- Active lifecycle state; and
- Context as the authoritative capability.

This boundary validation protects Reasoning input integrity. It does not
perform Context-owned candidate validation, incorporation, activation, source
verification, currentness determination, or authority issuance.

### Reasoning Query

The query is non-empty text of at most 2048 Unicode code points. It is opaque
input to the bounded rules. Reasoning does not parse it to recover or infer a
parallel source-evidence model.

## Deterministic Rule Set

Exactly one rule applies after complete input validation.

### Anonymous Identity

When the authoritative Context projects an anonymous identity:

- Outcome Category: `anonymous-context`;
- Candidate Conclusion: `The active context identifies an anonymous actor.`;
- Candidate Response: `Additional identity context may be required before further orchestration.`;
- Candidate Next Action: `request-more-context`;
- Identity State: `anonymous`; and
- Rule Category: `anonymous-identity`.

### Authenticated Context

When the authoritative Context projects an authenticated identity:

- Outcome Category: `context-only`;
- Candidate Conclusion: `The authenticated actor is represented by the active context.`;
- Candidate Response: `Additional authoritative context may be required before further orchestration.`;
- Candidate Next Action: `request-more-context`;
- Identity State: `authenticated`; and
- Rule Category: `authenticated-context-only`.

The rule describes Reasoning over the authoritative Context output. It does
not classify the Context's internal sources, create a source-precedence rule,
or transfer Memory, Knowledge, or Context ownership.

## Reasoning Outcome

The exact public shape is:

```text
{
  status: "completed",
  category: "anonymous-context" | "context-only",
  conclusion: CandidateConclusion,
  response: CandidateResponse,
  nextAction: "none" | "request-more-context",
  explainability: ReasoningExplainabilitySummary
}
```

The outcome is an immutable Reasoning-owned result. It is not Context,
Knowledge, Memory, a Candidate Plan, authorization, execution, or a final
cognitive result.

## Explainability

The exact explainability shape is:

```text
{
  contextConsumptionReference: {
    lineageIdentity: ContextLineageIdentity,
    revisionIdentity: ContextRevisionIdentity,
    revisionNumber: ContextRevisionNumber,
    lifecycleState: "active",
    authoritativeCapability: "context"
  },
  identityState: "anonymous" | "authenticated",
  ruleCategory: "anonymous-identity" | "authenticated-context-only"
}
```

Explainability identifies the exact Context revision consumed and the public
Reasoning rule basis. It contains no private reasoning trace and no parallel
capability-evidence detail.

## Evaluate Reasoning 2.0.0

### Contract Metadata

| Property         | Rule                                     |
| ---------------- | ---------------------------------------- |
| Semantic owner   | Reasoning                                |
| Runtime owner    | Reasoning Engine                         |
| Schema custodian | Core                                     |
| Caller           | Brain or another authorized orchestrator |
| Invocation       | once per applicable cognitive cycle      |
| Retry            | none                                     |

The Engine validates the exact request, Context shape, Active state, and query
in that order. It then evaluates one rule, constructs and validates one
Outcome, establishes exact Context-consumption correspondence, registers
authority, and returns the exact registered Outcome.

## Verify Reasoning Outcome Authority 2.0.0

### Exact Request

```text
{
  intent: "verify-reasoning-outcome-authority",
  candidate: ReasoningOutcome,
  consumedContextRevision: ActiveContextRevision,
  expectedLineageIdentity: ContextLineageIdentity,
  expectedRevisionIdentity: ContextRevisionIdentity,
  expectedRevisionNumber: ContextRevisionNumber
}
```

All fields are required and every unnamed field is prohibited. Verification
proves:

1. the candidate is the exact Outcome registered by the issuing Reasoning
   runtime;
2. the consumed Context object is the exact supplied object associated with
   that issuance;
3. lineage identity, revision identity, and revision number correspond to the
   Outcome's Context Consumption Reference; and
4. the registered Outcome graph remains exact and unmodified.

Success returns the exact candidate. Verification does not re-evaluate the
query, reconstruct Context, validate Context-owned evidence, query Context,
mint Context authority, or transfer semantic ownership.

Private provenance MUST NOT strongly retain the caller-owned Context graph
solely for verification and MUST NOT be publicly exposed.

## Failure Semantics

| Failure                                 | Meaning                                                                  |
| --------------------------------------- | ------------------------------------------------------------------------ |
| `InvalidReasoningInputError`            | invalid request envelope, intent, exact shape, or unexpected field       |
| `InvalidActiveContextError`             | malformed supported Context input                                        |
| `InactiveContextError`                  | structurally valid Context Revision is not Active                        |
| `InvalidReasoningQueryError`            | query is missing, invalid, empty, or exceeds its bound                   |
| `ReasoningRuleFailureError`             | validated inputs cannot produce one approved Reasoning rule result       |
| `InvalidReasoningStateError`            | invalid Engine lifecycle or invalid constructed Reasoning state          |
| `InvalidReasoningAuthorityRequestError` | invalid authority-verification request or candidate structure            |
| `ReasoningAuthorityVerificationError`   | candidate provenance, exact identity, correspondence, or integrity fails |
| `InvalidReasoningAuthorityStateError`   | issuing/verifier authority state is invalid                              |

Failures are Reasoning-owned only when a Reasoning-owned responsibility fails.
Context, source, Security, Memory, Knowledge, Brain, Planning, Bootstrap,
Provider, Adapter, transport, and infrastructure failures retain their
originating ownership. Propagation does not transfer failure identity.

## Normative Precedence

The evaluation stages are:

1. Engine lifecycle eligibility;
2. exact request-envelope and field validation;
3. Active Context structure validation;
4. Context Active-state validation;
5. Reasoning Query validation;
6. deterministic rule evaluation;
7. Outcome construction and complete validation;
8. exact Context-consumption correspondence;
9. authority registration; and
10. exact issuing return.

Authority verification validates its request and candidate before provenance,
exact consumed-Context identity, Context Consumption Reference correspondence,
nested-value integrity, and exact return. A failed stage suppresses all later
stages and is not retried.

## Lifecycle and State

Reasoning Engine lifecycle remains `initialize`, `ready`, `running`, and
`stopped`. Evaluate Reasoning is accepted only while running. The Engine does
not retain public request or result history and defines no persistence or
replay mechanism.

Successful issuance transitions through proposed, constructed, validated,
corresponding, registered, and completed authority states. Verification does
not register, clone, reconstruct, or mint an Outcome.

## Brain and Planning Boundaries

Brain supplies one authoritative Active Context Revision and query, invokes
Reasoning, and may call the Reasoning-owned verifier. Brain does not determine
Reasoning validity or acquire Reasoning semantics.

Planning consumes the exact authoritative Reasoning Outcome. Planning does not
re-evaluate Context evidence, and Reasoning does not construct a Candidate
Plan. Contribution to Brain or Planning does not transfer Reasoning ownership.

## Runtime Safety and Immutability

Public boundaries fail closed on hostile runtime values, accessors, symbols,
unexpected keys, coercion, hostile prototypes, and trapped inspection. Native
exceptions are normalized. Accepted caller graphs are not mutated. Returned
graphs are deeply immutable and contain no caller-controlled mutable alias.

## Mandatory Tests

Tests MUST cover:

- exact request shape and rejection of every unexpected field;
- one authoritative Active Context Revision per evaluation;
- malformed and inactive Context inputs;
- query bounds;
- both outcome and rule categories;
- exact Context Consumption Reference correspondence;
- explainability shape and privacy;
- exact issuing-runtime authority and cross-runtime rejection;
- clone, reconstruction, mutation, and mixed-graph rejection;
- deterministic precedence, no retry, and failure normalization;
- non-mutation and authority non-retention; and
- Brain and Planning correspondence without a parallel evidence boundary.

## Acceptance Criteria

ENGINE-0006 2.0.0 is satisfied when:

1. one exact request shape is accepted;
2. Reasoning consumes one authoritative Active Context Revision;
3. only the two specified outcome and rule categories exist;
4. explainability identifies Context consumption without exposing source
   evidence or private reasoning;
5. Reasoning authority proves exact issuance and Context correspondence without
   replacing Context authority;
6. Planning receives the exact verified Reasoning Outcome; and
7. ownership, failure, privacy, immutability, and dependency boundaries remain
   intact.

## Compatibility

Version 2.0.0 is intentionally incompatible with the historical Reasoning
request, category, explainability, and failure surface. Callers must use the
2.0.0 exact shapes. No compatibility adapter may preserve a parallel
same-cycle evidence boundary.

## Change History

| Version | Date       | Description                                                                                                                                    |
| ------- | ---------- | ---------------------------------------------------------------------------------------------------------------------------------------------- |
| 1.0.0   | 2026-07-20 | Established the original Reasoning Engine vertical slice.                                                                                      |
| 1.1.0   | 2026-07-29 | Added issuer-owned Reasoning Outcome authority verification.                                                                                   |
| 2.0.0   | 2026-08-10 | Aligned Reasoning with the authoritative Context boundary and narrowed its request, outcome, explainability, failure, and authority semantics. |

## References

- [Documentation Authority](../../../docs/DOCUMENT-AUTHORITY.md)
- [Core Architecture](../../architecture/ARCH-0001-Core-Architecture.md)
- [OES-0004 — Contracts](../../../docs/engineering/OES-0004-Contracts.md)
- [OES-0008 — Documentation Standards](../../../docs/engineering/OES-0008-Documentation-Standards.md)
- [OES-0010 — Versioning Standards](../../../docs/engineering/OES-0010-Versioning-Standards.md)
- [ADR-0013 — Failure Ownership](../../../docs/adr/ADR-0013-Failure-Ownership-Propagation-and-Candidate-Context-Revision-Consequences.md)
- [ADR-0014 — Bootstrap Composition](../../../docs/adr/ADR-0014-Bootstrap-Composition-Responsibility-and-Ownership-and-Authority-Preservation.md)
- [ADR-0015 — Brain Orchestration Ownership](../../../docs/adr/ADR-0015-Brain-Cognitive-Reference-Orchestration-and-Final-Cognitive-Result-Boundaries.md)
- [CONCEPT-0001 — Memory Model](../../concepts/CONCEPT-0001-Memory-Model.md)
- [CONCEPT-0002 — Knowledge Model](../../concepts/CONCEPT-0002-Knowledge-Model.md)
- [CONCEPT-0003 — Context Model](../../concepts/CONCEPT-0003-Context-Model.md)
- [ENGINE-0006 1.1.0](ENGINE-0006-Reasoning-Engine-Authority-Revision-1.1.0.md)
