# ENGINE-0003 — Context Engine Authority Revision

| Field             | Value                                                                    |
| ----------------- | ------------------------------------------------------------------------ |
| **Status**        | Superseded                                                               |
| **Supersedes**    | 1.0.0                                                                    |
| **Superseded By** | [ENGINE-0003 2.0.0](ENGINE-0003-Context-Engine-Revision-2.0.0.md)        |
| **Version**       | 1.1.0                                                                    |
| **Owner**         | Context Engine                                                           |
| **Created**       | 2026-07-29                                                               |
| **Updated**       | 2026-08-11                                                               |
| **Applies To**    | Active Context Revision issuance and issuer-owned authority verification |

---

## Status and Authority

This revision is Superseded by
[ENGINE-0003 2.0.0](ENGINE-0003-Context-Engine-Revision-2.0.0.md) and is
retained only as historical version 1.1.0. It is non-authoritative. Version
1.1.0 historically incorporated version 1.0.0 and added the authority
requirements recorded here.

This revision adds issuer provenance without changing any 1.0.0 Context
request, result, lifecycle, identity, projection, failure, or ownership
semantics. Document activation does not itself implement the Contract.

## Purpose

Context must be able to prove that an exact Active Context Revision was
returned by one exact Context Engine runtime. Structural validity alone is not
issuer authority.

## Ownership and Architecture

- Context is the semantic owner.
- Core is the Contract and public-failure schema custodian.
- Context Engine is the runtime issuer, private provenance owner, and verifier.
- Bootstrap may capture and compose public ports only.
- Brain, Bootstrap, adapters, callers, and public factories MUST NOT register,
  mint, wrap, reconstruct, or simulate Context authority.
- Context introduces no dependency on Brain or another Engine implementation.
- The capability remains synchronous, deterministic, process-local,
  non-persistent, and retry-free.

Configured ports MUST be captured immutably and invoked receiver-free.
Class/prototype mutable ports are invalid configuration.

## Existing Issuing Contract

`Get Active Context Revision 1.0.0` remains unchanged. Its request, output, and
existing failures retain their Active 1.0.0 meanings.

After locating the exact current Active revision, Context MUST:

1. complete existing constructed-output validation;
2. confirm the existing Active, lineage, revision identity, revision number,
   and parent invariants;
3. register the exact returned object identity with those already-owned
   correspondence values exactly once;
4. return that same object exactly.

Registration failure produces `InvalidContextAuthorityStateError`, suppresses
return, and is never retried. Registration does not add a public identifier,
field, wrapper, factory, or mutation.

## Verify Active Context Revision Authority 1.0.0

### Contract Metadata

| Property         | Exact rule                                                          |
| ---------------- | ------------------------------------------------------------------- |
| Canonical name   | Verify Active Context Revision Authority                            |
| Version          | 1.0.0                                                               |
| Semantic owner   | Context                                                             |
| Runtime owner    | issuing Context Engine runtime                                      |
| Schema custodian | Core                                                                |
| Caller           | protected process-local Contract consumer, including Brain          |
| Purpose          | verify exact same-runtime issuance and Context-owned correspondence |
| Invocation       | zero or one per consumer operation                                  |
| Retry            | prohibited                                                          |

### Exact Request

```text
{
  intent: "verify-active-context-revision-authority",
  candidate: ActiveContextRevision,
  expectedLineageIdentity: ContextLineageIdentity,
  expectedRevisionIdentity: ContextRevisionIdentity,
  expectedRevisionNumber: ContextRevisionNumber
}
```

All five fields are required. No field is optional or conditional. Every
unnamed field, explicit `undefined`, operation identifier, Brain request
identifier, subject, callback, transport field, timestamp, authority token, or
provenance detail is prohibited.

### Boundary Validation

The request and every nested record MUST be a non-null ordinary object with
`Object.prototype` or null prototype and exact own enumerable string data
properties. Inherited substitutes, accessors/getters/setters, symbols,
unexpected keys, coercible primitives, decorated arrays, and caller-controlled
prototypes are invalid.

Own-key, prototype, descriptor, and nested inspection MUST contain hostile or
revoked Proxy behavior. Inspection failure is normalized; no native exception
escapes. Accepted fields are read once and defensively captured without
mutating or freezing caller graphs.

### Verification and Exact Success

After complete request and candidate structural validation, the issuing
Context runtime MUST prove:

1. `candidate` is the exact object identity registered by this runtime;
2. its private issuance record has the exact expected lineage identity,
   revision identity, and revision number;
3. the candidate still has the exact registered nested object identities and
   primitive values;
4. the candidate is still Active under the immutable issued snapshot; and
5. no registered nested value has been replaced or mixed.

Success returns the exact same `candidate` object. The verifier MUST NOT clone,
reconstruct, normalize, refresh, re-query current Context, register, or mint
authority.

Clones, structurally equal reconstructions, public-factory values,
cross-runtime values, unregistered values, replaced nested values,
mixed-authority graphs, wrong lineage, wrong revision identity/number, and
malformed candidates fail closed.

### Public Failures

| Failure                               | Exact condition                                                                                                                    |
| ------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------- |
| `InvalidContextAuthorityRequestError` | invalid envelope, exact shape, field, prototype, accessor, symbol, Proxy, identifier, or candidate structure                       |
| `ContextAuthorityVerificationError`   | unregistered, cloned, reconstructed, cross-runtime, mixed, replaced, inactive-issued snapshot, or non-corresponding candidate      |
| `InvalidContextAuthorityStateError`   | malformed configured verifier, contradictory private provenance state, registration failure, or contained verifier runtime failure |

No native exception, private cause, stack, object identity, registration state,
Context content, Identity projection, or provenance detail may enter a public
failure.

### Guarantees

- same configured Context runtime only;
- exact object identity and exact registered nested integrity;
- exact lineage/revision correspondence;
- zero mutation, cloning, currentness re-query, persistence, or retry;
- exactly one verifier invocation when requested; and
- no public factory confers authority.

## Privacy and Diagnostics

Diagnostics may contain only the Contract name, a generic stage identifier, a
closed failure category, and an Engine-local diagnostic correlation. They MUST
NOT contain the candidate, lineage/revision identifiers, Context or Identity
content, raw object identity, provenance details, caller request identifiers,
private causes, or stack traces.

## Normative Atomic Precedence

Each row is one adjacency. Future tests MUST fail the earlier stage, instrument
the immediately later stage, assert its count is zero, assert the exact public
failure, and prove no retry or return.

| ID      | Stage N                                 | Stage N+1                               | Failure if N fails                       |
| ------- | --------------------------------------- | --------------------------------------- | ---------------------------------------- |
| CAR-P01 | Engine lifecycle gate                   | Get Active request validation           | `InvalidContextLifecycleTransitionError` |
| CAR-P02 | Get Active request validation           | lineage resolution                      | `InvalidContextInputError`               |
| CAR-P03 | lineage resolution                      | current-Active availability/selection   | `ContextLineageNotFoundError`            |
| CAR-P04 | current-Active availability/selection   | returned-result construction acceptance | `NoActiveContextRevisionError`           |
| CAR-P05 | returned-result construction acceptance | complete result validation              | `ContextValidationFailureError`          |
| CAR-P06 | complete result validation              | authority registration                  | `ContextValidationFailureError`          |
| CAR-P07 | authority registration                  | exact issuing return                    | `InvalidContextAuthorityStateError`      |
| CAR-P08 | verifier request envelope               | verifier request structure              | `InvalidContextAuthorityRequestError`    |
| CAR-P09 | verifier request structure              | candidate structure                     | `InvalidContextAuthorityRequestError`    |
| CAR-P10 | candidate structure                     | issuing-runtime provenance              | `InvalidContextAuthorityRequestError`    |
| CAR-P11 | issuing-runtime provenance              | lineage correspondence                  | `ContextAuthorityVerificationError`      |
| CAR-P12 | lineage correspondence                  | revision identity correspondence        | `ContextAuthorityVerificationError`      |
| CAR-P13 | revision identity correspondence        | revision number correspondence          | `ContextAuthorityVerificationError`      |
| CAR-P14 | revision number correspondence          | nested-value integrity                  | `ContextAuthorityVerificationError`      |
| CAR-P15 | nested-value integrity                  | exact verified return                   | `ContextAuthorityVerificationError`      |

There are **15 normative precedence rows**.

## Normative Row-Local Lifecycle

Authority-attempt transitions use:

- `none>proposed[authority-proposed]`;
- `proposed>constructed[issuer-result-constructed]`;
- `constructed>validated[issuer-result-validated]`;
- `validated>registered[authority-registered]`;
- `registered>completed[exact-result-returned]`;
- `proposed>structured[verifier-request-validated]`;
- `structured>provenanced[issuer-provenance-verified]`;
- `provenanced>corresponding[authority-correspondence-verified]`;
- `corresponding>completed[exact-result-returned]`; and
- any non-terminal state to `rejected[authority-rejected]`.

Counts are `I/V/R/D`: issuing Contract, verifier Contract, registration, and
downstream exact return. Every row has retry count zero. A zero in any later
position normatively suppresses that callback/stage.

`verifier internal state/runtime failure` is one atomic verifier-execution
stage: it covers only a failure arising while the configured verifier executes,
after request structure is accepted and before provenance succeeds. It does not
combine request, provenance, or correspondence failures.

| ID      | Trigger                                 | Exact result/error                               | Complete transitions                                                                                                                                                                                                                                   | I/V/R/D   | Retry | Terminal    |
| ------- | --------------------------------------- | ------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | --------- | ----: | ----------- |
| CAR-L01 | issuing result construction fails       | `ContextValidationFailureError`                  | `none>proposed[authority-proposed], proposed>rejected[authority-rejected]`                                                                                                                                                                             | `1/0/0/0` |     0 | `rejected`  |
| CAR-L02 | current-Active selection fails          | `NoActiveContextRevisionError`                   | `none>proposed[authority-proposed], proposed>rejected[authority-rejected]`                                                                                                                                                                             | `1/0/0/0` |     0 | `rejected`  |
| CAR-L03 | issuing validation fails                | `ContextValidationFailureError`                  | `none>proposed[authority-proposed], proposed>constructed[issuer-result-constructed], constructed>rejected[authority-rejected]`                                                                                                                         | `1/0/0/0` |     0 | `rejected`  |
| CAR-L04 | registration fails                      | `InvalidContextAuthorityStateError`              | `none>proposed[authority-proposed], proposed>constructed[issuer-result-constructed], constructed>validated[issuer-result-validated], validated>rejected[authority-rejected]`                                                                           | `1/0/1/0` |     0 | `rejected`  |
| CAR-L05 | successful issuance                     | exact registered Active Context Revision         | `none>proposed[authority-proposed], proposed>constructed[issuer-result-constructed], constructed>validated[issuer-result-validated], validated>registered[authority-registered], registered>completed[exact-result-returned]`                          | `1/0/1/1` |     0 | `completed` |
| CAR-L06 | invalid verifier request                | `InvalidContextAuthorityRequestError`            | `none>proposed[authority-proposed], proposed>rejected[authority-rejected]`                                                                                                                                                                             | `0/1/0/0` |     0 | `rejected`  |
| CAR-L07 | malformed candidate                     | `InvalidContextAuthorityRequestError`            | `none>proposed[authority-proposed], proposed>rejected[authority-rejected]`                                                                                                                                                                             | `0/1/0/0` |     0 | `rejected`  |
| CAR-L08 | unregistered candidate                  | `ContextAuthorityVerificationError`              | `none>proposed[authority-proposed], proposed>structured[verifier-request-validated], structured>rejected[authority-rejected]`                                                                                                                          | `0/1/0/0` |     0 | `rejected`  |
| CAR-L09 | cloned candidate                        | `ContextAuthorityVerificationError`              | `none>proposed[authority-proposed], proposed>structured[verifier-request-validated], structured>rejected[authority-rejected]`                                                                                                                          | `0/1/0/0` |     0 | `rejected`  |
| CAR-L10 | reconstructed candidate                 | `ContextAuthorityVerificationError`              | `none>proposed[authority-proposed], proposed>structured[verifier-request-validated], structured>rejected[authority-rejected]`                                                                                                                          | `0/1/0/0` |     0 | `rejected`  |
| CAR-L11 | cross-runtime candidate                 | `ContextAuthorityVerificationError`              | `none>proposed[authority-proposed], proposed>structured[verifier-request-validated], structured>rejected[authority-rejected]`                                                                                                                          | `0/1/0/0` |     0 | `rejected`  |
| CAR-L12 | replaced nested value                   | `ContextAuthorityVerificationError`              | `none>proposed[authority-proposed], proposed>structured[verifier-request-validated], structured>provenanced[issuer-provenance-verified], provenanced>rejected[authority-rejected]`                                                                     | `0/1/0/0` |     0 | `rejected`  |
| CAR-L13 | mixed-authority value                   | `ContextAuthorityVerificationError`              | `none>proposed[authority-proposed], proposed>structured[verifier-request-validated], structured>provenanced[issuer-provenance-verified], provenanced>rejected[authority-rejected]`                                                                     | `0/1/0/0` |     0 | `rejected`  |
| CAR-L14 | lineage mismatch                        | `ContextAuthorityVerificationError`              | `none>proposed[authority-proposed], proposed>structured[verifier-request-validated], structured>provenanced[issuer-provenance-verified], provenanced>rejected[authority-rejected]`                                                                     | `0/1/0/0` |     0 | `rejected`  |
| CAR-L15 | revision identity mismatch              | `ContextAuthorityVerificationError`              | `none>proposed[authority-proposed], proposed>structured[verifier-request-validated], structured>provenanced[issuer-provenance-verified], provenanced>rejected[authority-rejected]`                                                                     | `0/1/0/0` |     0 | `rejected`  |
| CAR-L16 | revision-number mismatch                | `ContextAuthorityVerificationError`              | `none>proposed[authority-proposed], proposed>structured[verifier-request-validated], structured>provenanced[issuer-provenance-verified], provenanced>rejected[authority-rejected]`                                                                     | `0/1/0/0` |     0 | `rejected`  |
| CAR-L17 | verifier internal state/runtime failure | `InvalidContextAuthorityStateError`              | `none>proposed[authority-proposed], proposed>structured[verifier-request-validated], structured>rejected[authority-rejected]`                                                                                                                          | `0/1/0/0` |     0 | `rejected`  |
| CAR-L18 | successful exact verification           | exact same authoritative Active Context Revision | `none>proposed[authority-proposed], proposed>structured[verifier-request-validated], structured>provenanced[issuer-provenance-verified], provenanced>corresponding[authority-correspondence-verified], corresponding>completed[exact-result-returned]` | `0/1/0/1` |     0 | `completed` |

There are **18 normative lifecycle rows**.

## Compatibility

- Existing 1.0.0 callers and request/result shapes remain valid.
- Authority registration is issuer-private and additive.
- The verifier is an additional Core-custodied Contract.
- No previously valid behavior is reclassified; forged values never carried an
  issuer-authority guarantee.
- No data migration, persistence, provider, adapter, or runtime dependency is
  introduced.
- A future implementation must update M2 Core Contract, Context Contract,
  authority, precedence, lifecycle, privacy, architecture, and regression tests.
  No implementation or tests are part of this activation.

## Explicitly Unchanged

Context lineage, revision, lifecycle, composition, Identity projection,
current-Active selection, failures unrelated to authority, and all Active
ENGINE-0003 1.0.0 semantics remain unchanged.

## References

- [Superseded ENGINE-0003 1.0.0 history](ENGINE-0003-Context-Engine.md)
- [CONCEPT-0003 — Context Model](../../concepts/CONCEPT-0003-Context-Model.md)
- [ADR-0007 Draft](../../../docs/adr/ADR-0007-Brain-Orchestration-Ownership-and-Planning-Binding.md)
- [ENGINE-0001 Draft](../ENGINE-0001-Brain-Engine.md)
- [OES-0004 — Contracts](../../../docs/engineering/OES-0004-Contracts.md)

## Approval and Activation

Version 1.1.0 is formally approved and Active as of 2026-07-29. It makes
`Verify Active Context Revision Authority 1.0.0` authoritative but does not
implement it.
