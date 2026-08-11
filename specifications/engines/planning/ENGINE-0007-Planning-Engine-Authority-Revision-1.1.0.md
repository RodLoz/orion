# ENGINE-0007 — Planning Engine Authority Revision

| Field             | Value                                                            |
| ----------------- | ---------------------------------------------------------------- |
| **Status**        | Superseded                                                       |
| **Supersedes**    | 1.0.0                                                            |
| **Superseded By** | [ENGINE-0007 2.0.0](ENGINE-0007-Planning-Engine-Revision-2.0.0.md) |
| **Version**       | 1.1.0                                                            |
| **Owner**         | Planning Engine                                                  |
| **Created**       | 2026-07-29                                                       |
| **Updated**       | 2026-08-10                                                       |
| **Applies To**    | Candidate Plan issuance and issuer-owned authority verification  |

---

## Status, Purpose, and Compatibility Boundary

This revision is Superseded by
[ENGINE-0007 2.0.0](ENGINE-0007-Planning-Engine-Revision-2.0.0.md) and is
retained only as historical version 1.1.0. It is non-authoritative. Version
1.1.0 historically incorporated version 1.0.0 and added the authority
requirements recorded here.

This revision adds proof that one exact Candidate Plan was issued by one exact
Planning runtime from one exact supplied Reasoning Outcome. It changes no
Planning input, output, rule, step, category, explainability, source-reference,
failure, or advisory semantics. Document activation does not itself implement
the Contract.

## Ownership and Architecture

Planning is semantic owner; Core is schema custodian; Planning Engine is
runtime issuer, private provenance owner, and verifier. Bootstrap only captures
and composes public ports. Brain, Bootstrap, adapters, callers, and public
factories cannot register, mint, wrap, reconstruct, or simulate Planning
authority. Planning imports no Brain or other Engine implementation.

The boundary is synchronous, deterministic, process-local, non-persistent, and
retry-free. Ports are captured immutably and invoked receiver-free.
Class/prototype mutable ports are invalid configuration.

## Existing Issuing Contract

`Create Candidate Plan 1.0.0` remains unchanged. After deterministic rule
selection, complete Candidate Plan construction, constructed-output validation,
and exact source/explainability correspondence, Planning MUST register exactly
once:

- the exact returned Candidate Plan object;
- the exact supplied Reasoning Outcome object;
- the exact Reasoning Consumption Reference values; and
- all nested Candidate Plan identities and primitive values.

Registration precedes exact return. Failure produces
`InvalidPlanningAuthorityStateError`, suppresses return, and is not retried.
The exact Candidate Plan is returned without wrapper, identity, field, clone,
or mutation.

Registration binds the Plan to the exact supplied Reasoning object but does not
certify Reasoning-issued authority; Reasoning retains that ownership.

Planning MAY preserve a private identity association sufficient to prove that
an issued Candidate Plan corresponded to the exact supplied Reasoning Outcome.
It MUST NOT strongly retain that caller-owned Reasoning graph solely for
provenance verification, expose the association, mutate the supplied Outcome,
or weaken any Active defensive-reconstruction requirement. The association is
process-local, changes no public request or result shape, and MUST disappear
naturally when the relevant objects are no longer reachable or satisfy an
equivalent non-retention guarantee. Exact consumed-Reasoning identity can
therefore be proven without retaining the caller-owned Reasoning graph as Engine
state. No concrete implementation technology is normative.

## Verify Candidate Plan Authority 1.0.0

### Contract Metadata

| Property         | Exact rule                                                             |
| ---------------- | ---------------------------------------------------------------------- |
| Canonical name   | Verify Candidate Plan Authority                                        |
| Version          | 1.0.0                                                                  |
| Semantic owner   | Planning                                                               |
| Runtime owner    | issuing Planning Engine runtime                                        |
| Schema custodian | Core                                                                   |
| Caller           | protected process-local Contract consumer, including Brain             |
| Purpose          | verify exact Plan issuance and exact consumed-Reasoning correspondence |
| Invocation/retry | zero or one per consumer operation / no retry                          |

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
  expectedMemoryReferenceCount: integer 0..20,
  expectedKnowledgeReferenceCount: integer 0..20,
  expectedReasoningRuleCategory: ReasoningRuleCategory
}
```

All ten fields are required. None is optional or conditional. These expectations
are exactly the fields already owned by the Active Reasoning Consumption
Reference. Every unnamed field, explicit `undefined`, Skill/capability,
operation, action, resource, permission, authorization, callback, transport,
Brain request identifier, or provenance field is prohibited.

### Boundary Rules

The request and nested records must be non-null ordinary objects with
`Object.prototype` or null prototype and exact own enumerable string data
properties. Accessors, inherited substitutes, symbols, unexpected keys,
coercion, caller-controlled prototypes, malformed/decorated arrays, and
hostile/revoked Proxy or descriptor/own-key/prototype traps fail closed. No
native exception escapes. Fields are captured once without mutating or freezing
caller graphs.

### Exact Verification

After request and Candidate Plan structural validation, Planning MUST prove:

1. the candidate is the exact object registered by this Planning runtime;
2. `consumedReasoningOutcome` is the exact input captured for this issuance;
3. the candidate source and explainability exactly correspond to every supplied
   expectation under Active Planning rules;
4. all registered nested Plan identities and values remain exact; and
5. no clone, reconstruction, cross-runtime, mixed, or replaced graph exists.

Success returns the exact same candidate. Verification performs no plan
creation, rule re-evaluation, Reasoning call, transformation, registration, or
authority minting.

### Public Failures

| Failure                                | Exact condition                                                                                                                           |
| -------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------- |
| `InvalidPlanningAuthorityRequestError` | invalid envelope, exact shape, prototype, accessor, symbol, Proxy, field, expectation, Reasoning Outcome, or Candidate Plan structure     |
| `PlanningAuthorityVerificationError`   | unregistered, cloned, reconstructed, cross-runtime, mixed, replaced, wrong consumed-Reasoning identity, or source/explainability mismatch |
| `InvalidPlanningAuthorityStateError`   | malformed configured verifier, contradictory provenance state, registration failure, or contained verifier runtime failure                |

Native exceptions are normalized. Failures expose no Candidate Response, Plan,
Reasoning content, Context data, object identity, provenance, caller request
identifier, private cause, or stack.

### Guarantees

The Contract requires same-Planning-runtime exact identity, exact captured
Reasoning-input identity, exact source/explainability correspondence, and
nested integrity. Invocation is exactly once when requested, with no retry,
mutation, clone, persistence, re-query, or public authority factory.

## Planning Remains Advisory

Neither registration nor verification allows Planning to select or nominate a
Skill, authorize or invoke execution, allocate an operation, define Security
action/resource/permission, mutate orchestration state, append/transform steps,
or become a final cognitive result. Candidate Plans remain advisory.

## Privacy and Diagnostics

Diagnostics may include only Contract name, generic stage, closed failure
category, and Engine-local diagnostic correlation. Candidate/Reasoning content,
Candidate Response, Context or Identity data, raw identity, provenance,
caller/M10 request IDs, private causes, and stacks are prohibited.

## Normative Atomic Precedence

Future tests fail N, hostile-instrument N+1, assert N+1 zero, exact failure, no
return, no mutation, and no retry.

| ID      | Stage N                                | Stage N+1                              | Failure if N fails                     |
| ------- | -------------------------------------- | -------------------------------------- | -------------------------------------- |
| PAR-P01 | Engine lifecycle gate                  | top-level Create request validation    | `InvalidPlanningStateError`            |
| PAR-P02 | top-level Create request validation    | Reasoning Outcome structure validation | `InvalidPlanningInputError`            |
| PAR-P03 | Reasoning Outcome structure validation | Reasoning semantic-state validation    | `InvalidReasoningOutcomeError`         |
| PAR-P04 | Reasoning semantic-state validation    | deterministic Planning rule evaluation | `InvalidReasoningOutcomeError`         |
| PAR-P05 | deterministic Planning rule evaluation | Candidate Plan construction            | `PlanningRuleFailureError`             |
| PAR-P06 | Candidate Plan construction            | complete Candidate Plan validation     | `InvalidPlanningStateError`            |
| PAR-P07 | complete Candidate Plan validation     | exact Reasoning/source correspondence  | `InvalidPlanningStateError`            |
| PAR-P08 | exact Reasoning/source correspondence  | authority registration                 | `InvalidPlanningStateError`            |
| PAR-P09 | authority registration                 | exact issuing return                   | `InvalidPlanningAuthorityStateError`   |
| PAR-P10 | verifier request envelope              | verifier request structure             | `InvalidPlanningAuthorityRequestError` |
| PAR-P11 | verifier request structure             | candidate structure                    | `InvalidPlanningAuthorityRequestError` |
| PAR-P12 | candidate structure                    | issuing-runtime provenance             | `InvalidPlanningAuthorityRequestError` |
| PAR-P13 | issuing-runtime provenance             | exact consumed-Reasoning identity      | `PlanningAuthorityVerificationError`   |
| PAR-P14 | consumed-Reasoning identity            | source correspondence                  | `PlanningAuthorityVerificationError`   |
| PAR-P15 | source correspondence                  | explainability correspondence          | `PlanningAuthorityVerificationError`   |
| PAR-P16 | explainability correspondence          | nested-value integrity                 | `PlanningAuthorityVerificationError`   |
| PAR-P17 | nested-value integrity                 | exact verified return                  | `PlanningAuthorityVerificationError`   |

There are **17 normative precedence rows**.

## Normative Row-Local Lifecycle

Transitions are:

`none>proposed[authority-proposed]`,
`proposed>constructed[issuer-result-constructed]`,
`constructed>validated[issuer-result-validated]`,
`validated>corresponding[input-correspondence-established]`,
`corresponding>registered[authority-registered]`,
`registered>completed[exact-result-returned]`,
`proposed>structured[verifier-request-validated]`,
`structured>provenanced[issuer-provenance-verified]`,
`provenanced>corresponding[authority-correspondence-verified]`, and any
non-terminal state to `rejected[authority-rejected]`.

Counts are `I/V/R/D`: issuing Contract, verifier, registration, downstream
exact return. Retry is zero in every row. A zero in any later position
normatively suppresses that callback/stage.

| ID      | Trigger                                      | Exact result/error                      | Complete transitions                                                                                                                                                                                                                                                                         | I/V/R/D   | Retry | Terminal    |
| ------- | -------------------------------------------- | --------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------- | ----: | ----------- |
| PAR-L01 | Candidate Plan construction fails            | `InvalidPlanningStateError`             | `none>proposed[authority-proposed], proposed>rejected[authority-rejected]`                                                                                                                                                                                                                   | `1/0/0/0` |     0 | `rejected`  |
| PAR-L02 | Candidate Plan validation fails              | `InvalidPlanningStateError`             | `none>proposed[authority-proposed], proposed>constructed[issuer-result-constructed], constructed>rejected[authority-rejected]`                                                                                                                                                               | `1/0/0/0` |     0 | `rejected`  |
| PAR-L03 | source issuance correspondence fails         | `InvalidPlanningStateError`             | `none>proposed[authority-proposed], proposed>constructed[issuer-result-constructed], constructed>validated[issuer-result-validated], validated>rejected[authority-rejected]`                                                                                                                 | `1/0/0/0` |     0 | `rejected`  |
| PAR-L04 | explainability issuance correspondence fails | `InvalidPlanningStateError`             | `none>proposed[authority-proposed], proposed>constructed[issuer-result-constructed], constructed>validated[issuer-result-validated], validated>rejected[authority-rejected]`                                                                                                                 | `1/0/0/0` |     0 | `rejected`  |
| PAR-L05 | registration fails                           | `InvalidPlanningAuthorityStateError`    | `none>proposed[authority-proposed], proposed>constructed[issuer-result-constructed], constructed>validated[issuer-result-validated], validated>corresponding[input-correspondence-established], corresponding>rejected[authority-rejected]`                                                  | `1/0/1/0` |     0 | `rejected`  |
| PAR-L06 | successful issuance                          | exact registered Candidate Plan         | `none>proposed[authority-proposed], proposed>constructed[issuer-result-constructed], constructed>validated[issuer-result-validated], validated>corresponding[input-correspondence-established], corresponding>registered[authority-registered], registered>completed[exact-result-returned]` | `1/0/1/1` |     0 | `completed` |
| PAR-L07 | invalid verifier request                     | `InvalidPlanningAuthorityRequestError`  | `none>proposed[authority-proposed], proposed>rejected[authority-rejected]`                                                                                                                                                                                                                   | `0/1/0/0` |     0 | `rejected`  |
| PAR-L08 | malformed candidate                          | `InvalidPlanningAuthorityRequestError`  | `none>proposed[authority-proposed], proposed>rejected[authority-rejected]`                                                                                                                                                                                                                   | `0/1/0/0` |     0 | `rejected`  |
| PAR-L09 | unregistered candidate                       | `PlanningAuthorityVerificationError`    | `none>proposed[authority-proposed], proposed>structured[verifier-request-validated], structured>rejected[authority-rejected]`                                                                                                                                                                | `0/1/0/0` |     0 | `rejected`  |
| PAR-L10 | cloned candidate                             | `PlanningAuthorityVerificationError`    | `none>proposed[authority-proposed], proposed>structured[verifier-request-validated], structured>rejected[authority-rejected]`                                                                                                                                                                | `0/1/0/0` |     0 | `rejected`  |
| PAR-L11 | reconstructed candidate                      | `PlanningAuthorityVerificationError`    | `none>proposed[authority-proposed], proposed>structured[verifier-request-validated], structured>rejected[authority-rejected]`                                                                                                                                                                | `0/1/0/0` |     0 | `rejected`  |
| PAR-L12 | cross-runtime candidate                      | `PlanningAuthorityVerificationError`    | `none>proposed[authority-proposed], proposed>structured[verifier-request-validated], structured>rejected[authority-rejected]`                                                                                                                                                                | `0/1/0/0` |     0 | `rejected`  |
| PAR-L13 | replaced nested value                        | `PlanningAuthorityVerificationError`    | `none>proposed[authority-proposed], proposed>structured[verifier-request-validated], structured>provenanced[issuer-provenance-verified], provenanced>rejected[authority-rejected]`                                                                                                           | `0/1/0/0` |     0 | `rejected`  |
| PAR-L14 | mixed-authority value                        | `PlanningAuthorityVerificationError`    | `none>proposed[authority-proposed], proposed>structured[verifier-request-validated], structured>provenanced[issuer-provenance-verified], provenanced>rejected[authority-rejected]`                                                                                                           | `0/1/0/0` |     0 | `rejected`  |
| PAR-L15 | consumed Reasoning Outcome mismatch          | `PlanningAuthorityVerificationError`    | `none>proposed[authority-proposed], proposed>structured[verifier-request-validated], structured>provenanced[issuer-provenance-verified], provenanced>rejected[authority-rejected]`                                                                                                           | `0/1/0/0` |     0 | `rejected`  |
| PAR-L16 | source-field mismatch                        | `PlanningAuthorityVerificationError`    | `none>proposed[authority-proposed], proposed>structured[verifier-request-validated], structured>provenanced[issuer-provenance-verified], provenanced>rejected[authority-rejected]`                                                                                                           | `0/1/0/0` |     0 | `rejected`  |
| PAR-L17 | explainability-field mismatch                | `PlanningAuthorityVerificationError`    | `none>proposed[authority-proposed], proposed>structured[verifier-request-validated], structured>provenanced[issuer-provenance-verified], provenanced>rejected[authority-rejected]`                                                                                                           | `0/1/0/0` |     0 | `rejected`  |
| PAR-L18 | verifier internal failure                    | `InvalidPlanningAuthorityStateError`    | `none>proposed[authority-proposed], proposed>structured[verifier-request-validated], structured>rejected[authority-rejected]`                                                                                                                                                                | `0/1/0/0` |     0 | `rejected`  |
| PAR-L19 | successful exact verification                | exact same authoritative Candidate Plan | `none>proposed[authority-proposed], proposed>structured[verifier-request-validated], structured>provenanced[issuer-provenance-verified], provenanced>corresponding[authority-correspondence-verified], corresponding>completed[exact-result-returned]`                                       | `0/1/0/1` |     0 | `completed` |

There are **19 normative lifecycle rows**.

## Compatibility

- Existing Create Candidate Plan callers, request/result shapes, rules, and
  failures remain valid.
- Registration is private and the verifier is an additive Contract.
- Private provenance does not strongly retain caller-owned Reasoning graphs and
  does not weaken Active defensive reconstruction or non-retention invariants.
- No Candidate Plan identity, persistence, migration, external dependency,
  Provider, Adapter, execution, Skill, or Security authority is added.
- Forged values never carried an issuer-authority guarantee.
- A future implementation must extend M6 Core Contract, Planning Contract,
  authority, lifecycle, precedence, privacy, architecture, and regression
  tests. No implementation or tests are part of this activation.

## References

- [Superseded ENGINE-0007 1.0.0 history](ENGINE-0007-Planning-Engine.md)
- [ADR-0007 Draft](../../../docs/adr/ADR-0007-Brain-Orchestration-Ownership-and-Planning-Binding.md)
- [CONCEPT-0006 Draft](../../concepts/CONCEPT-0006-Brain-Orchestration-Model.md)
- [ENGINE-0001 Draft](../ENGINE-0001-Brain-Engine.md)
- [OES-0004 — Contracts](../../../docs/engineering/OES-0004-Contracts.md)

## Approval and Activation

Version 1.1.0 is formally approved and Active as of 2026-07-29. It makes
`Verify Candidate Plan Authority 1.0.0` authoritative but does not implement
it.
