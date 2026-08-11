# ENGINE-0007 — Planning Engine Revision

| Field          | Value                                                             |
| -------------- | ----------------------------------------------------------------- |
| **Status**     | Active                                                            |
| **Supersedes** | 1.1.0                                                             |
| **Version**    | 2.0.0                                                             |
| **Owner**      | Planning Engine                                                   |
| **Created**    | 2026-07-29                                                        |
| **Updated**    | 2026-08-10                                                        |
| **Applies To** | Candidate Plan construction, issuance, and authority verification |

---

## Status and Authority

This specification is Active and is the sole current canonical ENGINE-0007
revision. It supersedes versions 1.0.0 and 1.1.0. Those versions remain
historical and non-authoritative; this specification does not incorporate
their incompatible correspondence, category, explainability, or verification
semantics.

Planning is the semantic owner of Candidate Plan construction and Planning
Outcome semantics. Core is the schema custodian. The Planning Engine runtime
is the issuer, private provenance owner, and authority verifier. Applicable
Active ADRs govern in a conflict.

## Purpose

The Planning Engine consumes one exact authoritative Reasoning Outcome and
constructs one deterministic immutable advisory Candidate Plan.

Planning plans from Reasoning-owned output. It does not reason, retrieve,
compose, validate, or reconstruct Context evidence; retrieve or validate
Memory or Knowledge evidence; authorize; orchestrate; execute; persist; or
assemble a final cognitive result.

## Capability Ownership

Planning owns:

- admissibility of the Planning request at its boundary;
- exact consumption of one supplied Reasoning Outcome;
- deterministic Planning rule selection;
- Candidate Plan, Candidate Plan Step, and Planning explainability semantics;
- Planning-domain failures; and
- Candidate Plan issuance and authority verification.

Reasoning retains its Outcome semantics and authority. Context retains Context
Revision identity, lifecycle, evidence, validation, and authority. Brain
retains outer orchestration and final-result ownership.

## Scope

Version 2.0.0 defines:

- one exact Create Candidate Plan request;
- exact Reasoning Outcome validation and correspondence;
- one-step advisory `respond` and `request-more-context` Candidate Plans;
- one Reasoning Consumption Reference;
- one Planning Explainability Summary;
- Planning-owned issuance and authority verification; and
- strict runtime-boundary and failure behavior.

It defines no Context-source retrieval, evidence inspection, Memory or
Knowledge interaction, reasoning, authorization, execution, persistence,
reconstruction, replay, transport, or presentation mechanism.

## Planning Request

The exact request is:

```text
{
  intent: "create-candidate-plan",
  reasoningOutcome: ReasoningOutcome
}
```

Both fields are required and every unnamed field is prohibited. Planning
validates the supplied Reasoning Outcome as hostile runtime data but does not
re-evaluate its reasoning or inspect the Context evidence from which it was
produced.

## Accepted Reasoning Outcome

Planning accepts the current Reasoning 2.0.0 shape:

- status: `completed`;
- category: `anonymous-context` or `context-only`;
- candidate next action: `none` or `request-more-context`;
- identity state: `anonymous` or `authenticated`;
- rule category: `anonymous-identity` or
  `authenticated-context-only`; and
- the remaining exact Reasoning Outcome and explainability structure.

Valid correspondence is:

| Reasoning category  | Identity        | Rule category                | Permitted next action            |
| ------------------- | --------------- | ---------------------------- | -------------------------------- |
| `anonymous-context` | `anonymous`     | `anonymous-identity`         | `request-more-context`           |
| `context-only`      | `authenticated` | `authenticated-context-only` | `request-more-context` or `none` |

Planning treats this as Reasoning-owned output correspondence. It does not
establish Context authority, currentness, incorporation, source verification,
or evidence sufficiency.

## Candidate Plan Rules

Exactly one rule applies after complete input validation.

### Request More Context

When the Reasoning Outcome requests more context:

- Candidate Plan Category: `request-more-context`;
- Step Kind: `request-more-context`; and
- Planning Rule Category: `reasoning-requested-more-context`.

This is an advisory Planning consequence. It does not initiate Context
retrieval, reopen a Context Revision, or perform Context validation.

### Respond

When the Reasoning Outcome has Candidate Next Action `none`:

- Candidate Plan Category: `respond`;
- Step Kind: `respond`;
- the step contains the exact validated Candidate Response value; and
- Planning Rule Category: `reasoning-produced-response`.

The plan remains advisory and does not deliver or own the final response.

## Candidate Plan

The exact public shape is:

```text
{
  status: "completed",
  category: "respond" | "request-more-context",
  steps: readonly [CandidatePlanStep],
  source: ReasoningConsumptionReference,
  explainability: PlanningExplainabilitySummary
}
```

Exactly one step exists. The step kind, plan category, Reasoning next action,
and Planning rule category must correspond.

## Reasoning Consumption Reference

The exact source correspondence is:

```text
{
  reasoningStatus: "completed",
  reasoningCategory: "anonymous-context" | "context-only",
  candidateNextAction: "none" | "request-more-context",
  identityState: "anonymous" | "authenticated",
  reasoningRuleCategory:
    "anonymous-identity" | "authenticated-context-only",
  authoritativeCapability: "reasoning"
}
```

The reference records Planning's consumption of Reasoning-owned output. It
contains no Context, Memory, Knowledge, or source-evidence correspondence.

## Explainability

The exact Planning explainability shape is:

```text
{
  consumedReasoningCategory: "anonymous-context" | "context-only",
  consumedCandidateNextAction: "none" | "request-more-context",
  resultingPlanCategory: "respond" | "request-more-context",
  candidateStepCount: 1,
  planningRuleCategory:
    "reasoning-requested-more-context" | "reasoning-produced-response"
}
```

Explainability exposes Planning's public correspondence and rule basis. It
does not expose private reasoning, Context internals, or source evidence.

## Create Candidate Plan 2.0.0

| Property         | Rule                                     |
| ---------------- | ---------------------------------------- |
| Semantic owner   | Planning                                 |
| Runtime owner    | Planning Engine                          |
| Schema custodian | Core                                     |
| Caller           | Brain or another authorized orchestrator |
| Invocation       | once per applicable cognitive cycle      |
| Retry            | none                                     |

The Engine validates the exact request and complete Reasoning Outcome,
selects one Planning rule, constructs and validates one Candidate Plan,
establishes exact Reasoning-output correspondence, registers authority, and
returns the exact registered plan.

## Verify Candidate Plan Authority 2.0.0

### Exact Request

```text
{
  intent: "verify-candidate-plan-authority",
  candidate: CandidatePlan,
  consumedReasoningOutcome: ReasoningOutcome,
  expectedReasoningStatus: "completed",
  expectedReasoningCategory: ReasoningOutcomeCategory,
  expectedCandidateNextAction: CandidateNextAction,
  expectedIdentityState: "anonymous" | "authenticated",
  expectedReasoningRuleCategory: ReasoningRuleCategory
}
```

All fields are required and every unnamed field is prohibited. Verification
proves:

1. the candidate is the exact Candidate Plan registered by the issuing
   Planning runtime;
2. `consumedReasoningOutcome` is the exact Reasoning Outcome associated with
   issuance;
3. the Candidate Plan source and explainability correspond to the expected
   Reasoning status, category, next action, identity state, and rule category;
   and
4. the registered Candidate Plan graph remains exact and unmodified.

Success returns the exact candidate. Verification does not reconstruct or
re-evaluate Reasoning, inspect Context evidence, verify Context authority, or
mint Reasoning authority.

Private provenance MUST NOT strongly retain the caller-owned Reasoning graph
solely for verification and MUST NOT be publicly exposed.

## Failure Semantics

| Failure                                | Meaning                                                                  |
| -------------------------------------- | ------------------------------------------------------------------------ |
| `InvalidPlanningInputError`            | invalid request envelope, intent, exact shape, or unexpected field       |
| `InvalidReasoningOutcomeError`         | malformed or non-corresponding Reasoning Outcome input                   |
| `PlanningRuleFailureError`             | validated input cannot produce one approved Planning rule result         |
| `InvalidPlanningStateError`            | invalid Engine lifecycle or invalid constructed Planning state           |
| `InvalidPlanningAuthorityRequestError` | invalid authority-verification request or candidate structure            |
| `PlanningAuthorityVerificationError`   | candidate provenance, exact identity, correspondence, or integrity fails |
| `InvalidPlanningAuthorityStateError`   | issuing/verifier authority state is invalid                              |

Failures are Planning-owned only when a Planning-owned responsibility fails.
Reasoning, Context, source, Security, Memory, Knowledge, Brain, Bootstrap,
Provider, Adapter, transport, and infrastructure failures retain originating
ownership. A Planning consequence does not acquire the originating failure.

## Normative Precedence

The creation stages are:

1. Engine lifecycle eligibility;
2. exact Planning request validation;
3. complete Reasoning Outcome validation and correspondence;
4. deterministic Planning rule selection;
5. Candidate Plan construction and complete validation;
6. exact consumed-Reasoning correspondence;
7. authority registration; and
8. exact issuing return.

Authority verification validates its request, Candidate Plan, and consumed
Reasoning Outcome before issuer provenance, exact consumed-Reasoning identity,
source/explainability correspondence, nested-value integrity, and exact
return. A failed stage suppresses later stages and is not retried.

## Lifecycle and State

Planning Engine lifecycle remains `initialize`, `ready`, `running`, and
`stopped`. Create Candidate Plan is accepted only while running. Planning
retains no public request or result history and defines no persistence or
replay mechanism.

Successful issuance transitions through proposed, constructed, validated,
corresponding, registered, and completed authority states. Verification does
not register, clone, reconstruct, or mint a Candidate Plan.

## Brain Boundary

Brain supplies the exact verified Reasoning Outcome to Planning, may call the
Planning-owned verifier, and owns the downstream orchestration and final
result. Brain does not determine Planning validity or acquire Planning
semantics. Planning does not coordinate Reasoning or Context.

## Runtime Safety and Immutability

Public boundaries fail closed on hostile runtime values, accessors, symbols,
unexpected keys, coercion, hostile prototypes, and trapped inspection. Native
exceptions are normalized. Accepted caller graphs are not mutated. Returned
graphs are deeply immutable and contain no caller-controlled mutable alias.

## Mandatory Tests

Tests MUST cover:

- exact request and Reasoning Outcome shapes;
- both narrowed Reasoning outcome and rule categories;
- both valid Candidate Plan branches;
- exact one-step and explainability correspondence;
- exact Reasoning Consumption Reference shape;
- rejection of unexpected evidence correspondence;
- exact issuing-runtime authority and cross-runtime rejection;
- exact consumed-Reasoning object identity;
- clone, reconstruction, mutation, and mixed-graph rejection;
- deterministic precedence, no retry, and failure normalization;
- non-mutation and authority non-retention; and
- Brain correspondence without Context evidence revalidation.

## Acceptance Criteria

ENGINE-0007 2.0.0 is satisfied when:

1. Planning consumes one exact Reasoning Outcome;
2. only current Reasoning categories and rule categories are accepted;
3. source correspondence contains only Reasoning-owned public semantics;
4. both valid Candidate Plan branches remain available;
5. Planning authority proves exact issuance and Reasoning correspondence;
6. Planning does not inspect or validate Context, Memory, or Knowledge
   evidence; and
7. ownership, failure, privacy, immutability, and dependency boundaries remain
   intact.

## Compatibility

Version 2.0.0 is intentionally incompatible with the historical Planning
correspondence and authority-verification surface. Callers must use the 2.0.0
exact shapes. No compatibility adapter may reconstruct removed evidence
correspondence.

## Change History

| Version | Date       | Description                                                                                                                                |
| ------- | ---------- | ------------------------------------------------------------------------------------------------------------------------------------------ |
| 1.0.0   | 2026-07-20 | Established the original Planning Engine vertical slice.                                                                                   |
| 1.1.0   | 2026-07-29 | Added issuer-owned Candidate Plan authority verification.                                                                                  |
| 2.0.0   | 2026-08-10 | Aligned Planning with the narrowed Reasoning output and removed parallel evidence correspondence from Planning and authority verification. |

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
- [ENGINE-0006 — Reasoning Engine 2.0.0](../reasoning/ENGINE-0006-Reasoning-Engine-Revision-2.0.0.md)
- [ENGINE-0007 1.1.0](ENGINE-0007-Planning-Engine-Authority-Revision-1.1.0.md)
