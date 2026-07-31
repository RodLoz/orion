# ENGINE-0006 — Reasoning Engine Authority Revision

| Field          | Value                                                              |
| -------------- | ------------------------------------------------------------------ |
| **Status**     | Active                                                             |
| **Supersedes** | 1.0.0                                                              |
| **Version**    | 1.1.0                                                              |
| **Owner**      | Reasoning Engine                                                   |
| **Created**    | 2026-07-29                                                         |
| **Updated**    | 2026-07-29                                                         |
| **Applies To** | Reasoning Outcome issuance and issuer-owned authority verification |

---

## Status, Purpose, and Compatibility Boundary

This additive revision is Active and authoritative. It supersedes ENGINE-0006
version 1.0.0 as the sole current Active Reasoning Engine authority. It
incorporates the 1.0.0 specification in full and adds only the authority
requirements defined here. The superseded 1.0.0 document remains historical
and non-authoritative.

This revision adds proof that an exact Reasoning Outcome came from an exact
Reasoning runtime and was evaluated from one exact supplied Context Revision.
It does not add a Reasoning Outcome identifier or change evaluation, request,
output, rule, reference, failure, or advisory semantics. Document activation
does not itself implement the Contract.

## Ownership and Architecture

Reasoning is semantic owner; Core is schema custodian; Reasoning Engine is
runtime issuer, private provenance owner, and verifier. Bootstrap may capture
and compose public ports only; it MUST NOT register, issue, mint, wrap,
reconstruct, or simulate Reasoning authority. Brain may call the verifier but
cannot decide, register, mint, wrap, reconstruct, or simulate Reasoning
validity or authority. No adapter or public factory confers authority.

The capability remains synchronous, process-local, deterministic,
non-persistent, and retry-free. Configured ports are immutably captured and
receiver-free; class/prototype mutable ports are invalid configuration.

## Existing Issuing Contract

`Evaluate Reasoning 1.0.0` remains unchanged. After existing deterministic
evaluation, complete Outcome construction, constructed-output validation, and
exact Context-consumption correspondence, Reasoning MUST register exactly once:

- the exact returned Reasoning Outcome object identity;
- the exact supplied Active Context Revision object identity;
- its already-owned Context Consumption Reference values; and
- exact nested Outcome identities and primitive values.

Registration occurs before exact return. Failure produces
`InvalidReasoningAuthorityStateError`, suppresses return, and is not retried.
The exact same Outcome is returned without a wrapper, new field, identity,
clone, or mutation.

Registration records that this evaluation consumed the exact supplied Context
object. It does not independently certify Context-issued authority; that
remains Context-owned.

Reasoning MAY preserve a private identity association sufficient to prove that
an issued Outcome corresponded to the exact supplied Active Context Revision.
It MUST NOT strongly retain that caller-owned Context graph solely for
provenance verification, expose the association, mutate the supplied Context,
or weaken any Active defensive-reconstruction requirement. The association is
process-local, changes no public request or result shape, and MUST disappear
naturally when the relevant objects are no longer reachable or satisfy an
equivalent non-retention guarantee. Exact consumed-Context identity can
therefore be proven without retaining the caller-owned Context graph as Engine
state. No concrete implementation technology is normative.

## Verify Reasoning Outcome Authority 1.0.0

### Contract Metadata

| Property         | Exact rule                                                      |
| ---------------- | --------------------------------------------------------------- |
| Canonical name   | Verify Reasoning Outcome Authority                              |
| Version          | 1.0.0                                                           |
| Semantic owner   | Reasoning                                                       |
| Runtime owner    | issuing Reasoning Engine runtime                                |
| Schema custodian | Core                                                            |
| Caller           | protected process-local Contract consumer, including Brain      |
| Purpose          | verify exact issuance and exact consumed-Context correspondence |
| Invocation/retry | zero or one per consumer operation / no retry                   |

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

All six fields are required. None is optional or conditional. Every unnamed
field, explicit `undefined`, Brain/operation identifier, query, Memory or
Knowledge payload, callback, transport field, authority token, or provenance
detail is prohibited.

### Boundary Rules

The request and nested records must be non-null ordinary objects with
`Object.prototype` or null prototype and exact own enumerable string data
properties. Accessors, inherited substitutes, symbols, unexpected keys,
coercion, caller-controlled prototypes, hostile/revoked Proxies, and trapped
descriptor/own-key/prototype inspection fail closed. No native exception
escapes. Accepted fields are captured once without mutating or freezing caller
graphs.

### Exact Verification

Reasoning MUST validate request structure, Candidate Outcome structure, and
then prove:

1. the candidate is the exact object registered by this Reasoning runtime;
2. `consumedContextRevision` is the exact input object captured for that
   issuance;
3. the issuance record and Outcome Context Consumption Reference correspond to
   the expected lineage, revision identity, and revision number;
4. every registered nested Outcome identity/value remains exact; and
5. no clone, reconstruction, cross-runtime, mixed, or replaced graph exists.

Success returns the exact same candidate. Verification never reconstructs,
normalizes, re-evaluates, queries Context, registers, mints authority, or lets
Brain reinterpret Reasoning semantics.

### Public Failures

| Failure                                 | Exact condition                                                                                                                    |
| --------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------- |
| `InvalidReasoningAuthorityRequestError` | invalid envelope, shape, prototype, accessor, symbol, Proxy, field, identifier, Context, or candidate structure                    |
| `ReasoningAuthorityVerificationError`   | unregistered, cloned, reconstructed, cross-runtime, mixed, replaced, wrong consumed-Context identity, or non-corresponding Outcome |
| `InvalidReasoningAuthorityStateError`   | malformed configured verifier, contradictory provenance state, registration failure, or contained verifier runtime failure         |

All native exceptions are normalized. Failures expose no Query, Outcome
content, Context identity/content, Memory/Knowledge reference, object identity,
registry detail, private cause, or stack.

### Guarantees

Same-Reasoning-runtime exact identity, exact captured Context-input identity,
exact Context Consumption Reference correspondence, and exact nested integrity
are required. Invocation is exactly once when requested, with no retry,
mutation, clone, persistence, currentness query, or public authority factory.

## Privacy and Diagnostics

Diagnostics may contain only Contract name, generic stage, closed failure
category, and Engine-local diagnostic correlation. Candidate/Context content,
identifiers, Query, references, raw identity, provenance, caller request IDs,
private causes, and stacks are prohibited.

## Normative Atomic Precedence

Future tests must fail N, hostile-instrument N+1, assert N+1 count zero, exact
failure, no return, and no retry.

Optional Memory and Knowledge stages always resolve one deterministic path:
when a field is present its complete collection is validated; when omitted the
Active empty-collection rule resolves that stage without inspecting a
caller-supplied value. Thus the branch-specific adjacencies below do not invent
validation of an absent value.

| ID      | Stage N                                       | Stage N+1                                     | Failure if N fails                      |
| ------- | --------------------------------------------- | --------------------------------------------- | --------------------------------------- |
| RAR-P01 | Engine lifecycle gate                         | top-level Evaluate request validation         | `InvalidReasoningStateError`            |
| RAR-P02 | top-level Evaluate request validation         | Active Context structure validation           | `InvalidReasoningInputError`            |
| RAR-P03 | Active Context structure validation           | Context Active-state validation               | `InvalidActiveContextError`             |
| RAR-P04 | Context Active-state validation               | Reasoning Query validation                    | `InactiveContextError`                  |
| RAR-P05 | Reasoning Query validation                    | optional Memory path resolution/validation    | `InvalidReasoningQueryError`            |
| RAR-P06 | optional Memory path resolution/validation    | optional Knowledge path resolution/validation | `InvalidMemoryReferenceError`           |
| RAR-P07 | optional Knowledge path resolution/validation | deterministic Reasoning rule evaluation       | `InvalidKnowledgeReferenceError`        |
| RAR-P08 | deterministic Reasoning rule evaluation       | Outcome construction                          | `ReasoningRuleFailureError`             |
| RAR-P09 | Outcome construction                          | complete Outcome validation                   | `InvalidReasoningStateError`            |
| RAR-P10 | complete Outcome validation                   | exact Context-consumption correspondence      | `InvalidReasoningStateError`            |
| RAR-P11 | Context-consumption correspondence            | authority registration                        | `InvalidReasoningStateError`            |
| RAR-P12 | authority registration                        | exact issuing return                          | `InvalidReasoningAuthorityStateError`   |
| RAR-P13 | verifier request envelope                     | verifier request structure                    | `InvalidReasoningAuthorityRequestError` |
| RAR-P14 | verifier request structure                    | candidate structure                           | `InvalidReasoningAuthorityRequestError` |
| RAR-P15 | candidate structure                           | issuing-runtime provenance                    | `InvalidReasoningAuthorityRequestError` |
| RAR-P16 | issuing-runtime provenance                    | exact consumed-Context identity               | `ReasoningAuthorityVerificationError`   |
| RAR-P17 | consumed-Context identity                     | lineage correspondence                        | `ReasoningAuthorityVerificationError`   |
| RAR-P18 | lineage correspondence                        | revision identity correspondence              | `ReasoningAuthorityVerificationError`   |
| RAR-P19 | revision identity correspondence              | revision number correspondence                | `ReasoningAuthorityVerificationError`   |
| RAR-P20 | revision number correspondence                | nested-value integrity                        | `ReasoningAuthorityVerificationError`   |
| RAR-P21 | nested-value integrity                        | exact verified return                         | `ReasoningAuthorityVerificationError`   |

There are **21 normative precedence rows**.

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

| ID      | Trigger                                          | Exact result/error                         | Complete transitions                                                                                                                                                                                                                                                                         | I/V/R/D   | Retry | Terminal    |
| ------- | ------------------------------------------------ | ------------------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------- | ----: | ----------- |
| RAR-L01 | Outcome construction fails                       | `InvalidReasoningStateError`               | `none>proposed[authority-proposed], proposed>rejected[authority-rejected]`                                                                                                                                                                                                                   | `1/0/0/0` |     0 | `rejected`  |
| RAR-L02 | Outcome validation fails                         | `InvalidReasoningStateError`               | `none>proposed[authority-proposed], proposed>constructed[issuer-result-constructed], constructed>rejected[authority-rejected]`                                                                                                                                                               | `1/0/0/0` |     0 | `rejected`  |
| RAR-L03 | constructed Outcome/Context correspondence fails | `InvalidReasoningStateError`               | `none>proposed[authority-proposed], proposed>constructed[issuer-result-constructed], constructed>validated[issuer-result-validated], validated>rejected[authority-rejected]`                                                                                                                 | `1/0/0/0` |     0 | `rejected`  |
| RAR-L04 | registration fails                               | `InvalidReasoningAuthorityStateError`      | `none>proposed[authority-proposed], proposed>constructed[issuer-result-constructed], constructed>validated[issuer-result-validated], validated>corresponding[input-correspondence-established], corresponding>rejected[authority-rejected]`                                                  | `1/0/1/0` |     0 | `rejected`  |
| RAR-L05 | successful issuance                              | exact registered Reasoning Outcome         | `none>proposed[authority-proposed], proposed>constructed[issuer-result-constructed], constructed>validated[issuer-result-validated], validated>corresponding[input-correspondence-established], corresponding>registered[authority-registered], registered>completed[exact-result-returned]` | `1/0/1/1` |     0 | `completed` |
| RAR-L06 | invalid verifier request                         | `InvalidReasoningAuthorityRequestError`    | `none>proposed[authority-proposed], proposed>rejected[authority-rejected]`                                                                                                                                                                                                                   | `0/1/0/0` |     0 | `rejected`  |
| RAR-L07 | malformed candidate                              | `InvalidReasoningAuthorityRequestError`    | `none>proposed[authority-proposed], proposed>rejected[authority-rejected]`                                                                                                                                                                                                                   | `0/1/0/0` |     0 | `rejected`  |
| RAR-L08 | unregistered candidate                           | `ReasoningAuthorityVerificationError`      | `none>proposed[authority-proposed], proposed>structured[verifier-request-validated], structured>rejected[authority-rejected]`                                                                                                                                                                | `0/1/0/0` |     0 | `rejected`  |
| RAR-L09 | cloned candidate                                 | `ReasoningAuthorityVerificationError`      | `none>proposed[authority-proposed], proposed>structured[verifier-request-validated], structured>rejected[authority-rejected]`                                                                                                                                                                | `0/1/0/0` |     0 | `rejected`  |
| RAR-L10 | reconstructed candidate                          | `ReasoningAuthorityVerificationError`      | `none>proposed[authority-proposed], proposed>structured[verifier-request-validated], structured>rejected[authority-rejected]`                                                                                                                                                                | `0/1/0/0` |     0 | `rejected`  |
| RAR-L11 | cross-runtime candidate                          | `ReasoningAuthorityVerificationError`      | `none>proposed[authority-proposed], proposed>structured[verifier-request-validated], structured>rejected[authority-rejected]`                                                                                                                                                                | `0/1/0/0` |     0 | `rejected`  |
| RAR-L12 | replaced nested value                            | `ReasoningAuthorityVerificationError`      | `none>proposed[authority-proposed], proposed>structured[verifier-request-validated], structured>provenanced[issuer-provenance-verified], provenanced>rejected[authority-rejected]`                                                                                                           | `0/1/0/0` |     0 | `rejected`  |
| RAR-L13 | mixed-authority value                            | `ReasoningAuthorityVerificationError`      | `none>proposed[authority-proposed], proposed>structured[verifier-request-validated], structured>provenanced[issuer-provenance-verified], provenanced>rejected[authority-rejected]`                                                                                                           | `0/1/0/0` |     0 | `rejected`  |
| RAR-L14 | consumed Context object mismatch                 | `ReasoningAuthorityVerificationError`      | `none>proposed[authority-proposed], proposed>structured[verifier-request-validated], structured>provenanced[issuer-provenance-verified], provenanced>rejected[authority-rejected]`                                                                                                           | `0/1/0/0` |     0 | `rejected`  |
| RAR-L15 | lineage mismatch                                 | `ReasoningAuthorityVerificationError`      | `none>proposed[authority-proposed], proposed>structured[verifier-request-validated], structured>provenanced[issuer-provenance-verified], provenanced>rejected[authority-rejected]`                                                                                                           | `0/1/0/0` |     0 | `rejected`  |
| RAR-L16 | revision identity mismatch                       | `ReasoningAuthorityVerificationError`      | `none>proposed[authority-proposed], proposed>structured[verifier-request-validated], structured>provenanced[issuer-provenance-verified], provenanced>rejected[authority-rejected]`                                                                                                           | `0/1/0/0` |     0 | `rejected`  |
| RAR-L17 | revision-number mismatch                         | `ReasoningAuthorityVerificationError`      | `none>proposed[authority-proposed], proposed>structured[verifier-request-validated], structured>provenanced[issuer-provenance-verified], provenanced>rejected[authority-rejected]`                                                                                                           | `0/1/0/0` |     0 | `rejected`  |
| RAR-L18 | verifier internal failure                        | `InvalidReasoningAuthorityStateError`      | `none>proposed[authority-proposed], proposed>structured[verifier-request-validated], structured>rejected[authority-rejected]`                                                                                                                                                                | `0/1/0/0` |     0 | `rejected`  |
| RAR-L19 | successful exact verification                    | exact same authoritative Reasoning Outcome | `none>proposed[authority-proposed], proposed>structured[verifier-request-validated], structured>provenanced[issuer-provenance-verified], provenanced>corresponding[authority-correspondence-verified], corresponding>completed[exact-result-returned]`                                       | `0/1/0/1` |     0 | `completed` |

There are **19 normative lifecycle rows**.

## Compatibility

- Every existing Evaluate Reasoning request/result and 1.0.0 caller remains
  valid.
- Registration is private; the verifier is an additive public Contract.
- Private provenance does not strongly retain caller-owned Context graphs and
  does not weaken Active defensive reconstruction or non-retention invariants.
- No Outcome identity, persistence, migration, provider, adapter, or runtime
  dependency is added.
- Forged values were never guaranteed as Reasoning-issued authority.
- A future implementation must extend M5 Core Contract, Reasoning Contract,
  authority, lifecycle, precedence, privacy, architecture, and regression
  tests. No implementation or tests are part of this activation.

## Planning and Brain Boundary

Reasoning remains advisory and non-orchestrating. Brain may consume only the
verified result and MUST NOT decide Reasoning semantic validity.

## References

- [Superseded ENGINE-0006 1.0.0 history](ENGINE-0006-Reasoning-Engine.md)
- [ADR-0007 Draft](../../../docs/adr/ADR-0007-Brain-Orchestration-Ownership-and-Planning-Binding.md)
- [CONCEPT-0006 Draft](../../concepts/CONCEPT-0006-Brain-Orchestration-Model.md)
- [ENGINE-0001 Draft](../ENGINE-0001-Brain-Engine.md)
- [OES-0004 — Contracts](../../../docs/engineering/OES-0004-Contracts.md)

## Approval and Activation

Version 1.1.0 is formally approved and Active as of 2026-07-29. It makes
`Verify Reasoning Outcome Authority 1.0.0` authoritative but does not implement
it.
