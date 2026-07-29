# ENGINE-0009 — Security Engine

| Field          | Value                                                        |
| -------------- | ------------------------------------------------------------ |
| **Status**     | Active                                                       |
| **Version**    | 1.1.0                                                        |
| **Owner**      | O.R.I.O.N. Architecture                                      |
| **Milestone**  | M8 — Security Engine: Authorization Decision Foundation      |
| **Created**    | 2026-07-27                                                   |
| **Updated**    | 2026-07-28                                                   |
| **Applies To** | Security Engine, Core authorization values, and M8 Contracts |

---

## Status

This specification is the formally approved Active Security Engine
implementation authority.

## Version

Version `1.1.0` is the additive Governed Security Evaluation Summary revision
required by active CONCEPT-0004 `1.1.0`. It preserves the complete active
`1.0.0` decision vertical slice.

## Purpose

M8 establishes the minimum deterministic Security capability that evaluates one
protected authorization operation and returns one immutable Authorization
Decision Artifact. Revision `1.1.0` additionally permits the same evaluation to
co-issue an immutable, authority-bearing snapshot of the exact governed
Security statuses used for that decision.

The Security Engine answers:

> Is this exact operation allowed, denied, or indeterminate under the fixed
> minimum authorization policy and its governed evidence?

M8 establishes authorization evaluation only. It does not perform, invoke,
schedule, select, or enforce a protected action.

## Authoritative Scope

This specification specializes the active
[CONCEPT-0004 — Authorization Model](../../concepts/CONCEPT-0004-Authorization-Model.md)
without changing it.

M8 includes:

- exact Core-custodied authorization values and synchronous Contracts;
- governed Protected Action Requirements resolution;
- governed Security Evaluation Context resolution;
- governed Grant Evidence resolution;
- governed Confirmation Evidence resolution;
- deterministic `allow`, `deny`, and `indeterminate` evaluation;
- one fixed Security policy;
- immutable Authorization Decision Artifacts;
- Governed Security Evaluation Summaries and authoritative co-issued Outcomes;
- process-local same-evaluation provenance and read-only verification;
- Security Engine lifecycle and pre-existing-state validation;
- hostile-runtime boundary safety;
- privacy-safe diagnostics; and
- architecture and normative testing rules.

M8 excludes:

- protected execution or enforcement;
- Skill invocation, loading, installation, or selection;
- permission administration;
- grant, policy, or audit persistence;
- external IAM, Providers, Adapters, databases, files, or networks;
- confirmation acquisition or user interaction;
- Device, Session, Trust Level, location, or risk value models;
- Brain orchestration or Planning binding;
- Security Events or audit Events; and
- configurable policy, policy DSLs, roles, hierarchies, wildcards, signing,
  distributed replay prevention, or long-term revocation.

## Authority Hierarchy

The following authority applies in descending precedence:

1. approved ADRs, especially ADR-0001, ADR-0002, and ADR-0003;
2. active Architecture Specifications;
3. active CONCEPT-0004;
4. active OES-0009, OES-0004, and OES-0002;
5. this specification when its revision is approved; and
6. lower-authority Flow and general architecture documents.

CONCEPT-0004 owns authorization-model semantics. This specification defines the
runtime Contracts, exact shapes, lifecycle, failures, validation order, and
tests for M8.

## Ownership

### Security Engine Owns

The Security Engine owns:

- authorization policy evaluation;
- validation of governed authorization evidence;
- sensitivity and confirmation policy interpretation;
- exact permission-grant matching;
- decision and reason selection;
- Authorization Decision Artifact construction;
- Governed Security Evaluation Summary construction, co-issuance provenance,
  and verification;
- Security lifecycle and internal-policy invariants; and
- Security diagnostics categories.

### Core Custodies

Core is the canonical custodian of:

- Authorization Operation Identifier;
- Authorization Subject;
- Authorization Action Identifier;
- Authorization Resource Identifier and Authorization Resource;
- Security Dimension Status;
- Permission Grant;
- Protected Action Requirements and its resolution;
- Permission Grant Evidence;
- Security Evaluation Context;
- Confirmation Evidence;
- Authorization Decision Artifact;
- Governed Security Evaluation Summary;
- Authorization Evaluation Outcome;
- authority-source and evaluation Contracts; and
- public Security failure classes.

Core factories validate and reconstruct schemas. They do not evaluate policy,
establish authority provenance, classify sensitivity, issue grants, or enforce
decisions.

### Security Engine Does Not Own

Security does not own:

- Current Identity or authentication;
- Context facts;
- Skill manifests or business workflows;
- Planning, Reasoning, Memory, or Knowledge;
- Brain sequencing;
- confirmation acquisition;
- protected execution or enforcement;
- source technology, persistence, Providers, or Adapters; or
- Events runtime.

## Runtime Authority Model

Authority-bearing status is not a public object property and cannot be created
by matching a shape, calling a general-purpose value factory, asserting a
TypeScript type, or adding a brand-like field.

M8 establishes authority through call provenance:

1. Bootstrap injects implementations of the four Core-custodied authority
   Contracts into one Security Engine instance.
2. During one evaluation, the Security Engine invokes those configured
   Contracts in the normative order.
3. A returned candidate is authority-bearing only within that invocation after
   the Security Engine validates and defensively reconstructs it.
4. The governed reconstruction is bound to the current operation and is never
   accepted through the public Evaluate Authorization request.
5. An arbitrary plain object cannot enter the governed path.

No public constructor, exported token, public flag, symbol property, caller
claim, or test switch may confer authority. Core candidate factories establish
structural validity only. The Security Engine establishes trusted provenance
only from a configured authority Contract invocation.

The governed requirements, grant, and confirmation reconstructions remain
evaluation-local and are not returned separately or reusable across operations.
The exact governed Security Evaluation Context used by an evaluation is
privacy-minimized into a Governed Security Evaluation Summary. The Summary is
co-issued with the unchanged Authorization Decision Artifact through the
Authorization Evaluation Outcome Contract defined by this revision.

Outcome authority uses exactly one private, per-Security-instance
`WeakMap<AuthorizationEvaluationOutcome, IssuedEvaluationPair>`. The private
record contains the exact issued Artifact identity, exact issued Summary
identity, and operation identifier. Authority attaches to the aggregate Outcome
identity and requires both nested identities to equal that record. The map is
not exported, shared, serialized, or caller-accessible. No separate public
factory, brand, field value, or structural equality establishes authority.

## Core Domain Values

All public values use exact own-property schemas. Unless a union member states
otherwise, every listed property is required and no additional enumerable
string or symbol property is allowed.

### Authorization Operation Identifier

An Authorization Operation Identifier:

- contains 1–128 ASCII characters;
- matches `^[A-Za-z0-9][A-Za-z0-9._:-]{0,127}$`;
- uses exact case-sensitive equality;
- is preserved without trimming, coercion, normalization, or parsing;
- identifies exactly one protected operation; and
- must not be reused within the allocating orchestration runtime.

Security validates syntax and correspondence only. It does not allocate
operation identifiers, maintain a global uniqueness registry, or detect reuse.
The protected orchestration boundary owns collision-free allocation and
non-reuse.

### Authorization Subject

Authorization Subject is exactly one of:

```text
{ kind: "anonymous" }
```

```text
{
  kind: "authenticated",
  identityId: IdentityIdentifier
}
```

The authenticated form reuses the accepted M1 Identity Identifier. Subject
equality is exact structural equality. Authentication grants no permission.
Security does not authenticate, resolve Identity evidence, or call the Identity
Engine.

### Authorization Action Identifier

An Authorization Action Identifier:

- contains 3–128 ASCII characters;
- matches
  `^[a-z0-9](?:[a-z0-9-]*[a-z0-9])?(?:\.[a-z0-9](?:[a-z0-9-]*[a-z0-9])?)+$`;
- uses exact case-sensitive equality; and
- is preserved without trimming, coercion, normalization, hierarchy, prefix,
  alias, or wildcard semantics.

It identifies a semantic protected action, not a Skill, method, endpoint,
Provider operation, or invocation payload.

### Authorization Resource Identifier

An Authorization Resource Identifier:

- contains 1–128 ASCII characters;
- matches `^[A-Za-z0-9][A-Za-z0-9._:/-]{0,127}$`;
- uses exact case-sensitive equality; and
- is preserved without trimming, coercion, normalization, parsing, hierarchy,
  or wildcard semantics.

### Authorization Resource

Authorization Resource is exactly one of:

```text
{ kind: "unscoped" }
```

```text
{
  kind: "identified",
  resourceId: AuthorizationResourceIdentifier
}
```

`unscoped` is a neutral exact scope, not a wildcard. It matches only another
unscoped resource. Identified resources match only exact resource identifiers.

### Required Permissions

Required permissions:

- use the accepted M7 Skill Permission Identifier;
- contain 0–64 entries;
- are dense exact arrays;
- contain unique exact values;
- are semantically unordered;
- use AND semantics; and
- are reconstructed in ascending locale-independent code-point order.

Duplicates are rejected before canonical reconstruction. Caller arrays are
never sorted, deduplicated, frozen, or mutated.

### Permission Grant

Permission Grant has exactly:

```text
{
  subject: AuthorizationSubject,
  permission: SkillPermissionIdentifier,
  resource: AuthorizationResource
}
```

Grant matching requires exact subject, permission, and resource equality. M8
defines no roles, claims, hierarchy, implication, delegation, wildcard,
authentication-derived grant, expiry, timestamp, or Provider data.

### Protected Action Requirements

Protected Action Requirements has exactly:

```text
{
  operationId: AuthorizationOperationIdentifier,
  action: AuthorizationActionIdentifier,
  resource: AuthorizationResource,
  requiredPermissions: SkillPermissionIdentifier[],
  sensitivity: "standard" | "sensitive"
}
```

It is complete and authoritative only after reconstruction from the configured
requirements authority Contract during the current evaluation.

Protected Action Requirements Resolution is exactly one of:

```text
{
  status: "available",
  requirements: ProtectedActionRequirements
}
```

```text
{
  status: "unavailable",
  operationId: AuthorizationOperationIdentifier,
  action: AuthorizationActionIdentifier,
  resource: AuthorizationResource
}
```

Unavailable resolution means complete permissions or sensitivity could not be
established and produces `indeterminate`.

### Permission Grant Evidence

Available Permission Grant Evidence has exactly:

```text
{
  status: "available",
  operationId: AuthorizationOperationIdentifier,
  subject: AuthorizationSubject,
  action: AuthorizationActionIdentifier,
  resource: AuthorizationResource,
  evaluatedPermissions: SkillPermissionIdentifier[],
  grants: PermissionGrant[]
}
```

Unavailable Permission Grant Evidence has exactly:

```text
{
  status: "unavailable",
  operationId: AuthorizationOperationIdentifier,
  subject: AuthorizationSubject,
  action: AuthorizationActionIdentifier,
  resource: AuthorizationResource,
  evaluatedPermissions: SkillPermissionIdentifier[]
}
```

Available evidence contains 0–64 unique relevant grants and means complete,
authoritative, and current for this exact operation. Every grant must match the
evidence subject and resource and use a permission in `evaluatedPermissions`.
Unrelated, extra, or duplicate grants are invalid evidence.

Unavailable means completeness or operation-scoped currentness could not be
established. Partial, stale, unverifiable, or unobtainable evidence must be
unavailable. It produces `indeterminate`, never denial.

`evaluatedPermissions` must exactly equal the canonical governed required
permission set. Grants are semantically unordered and are reconstructed in
ascending permission-identifier code-point order. Because each permission is
unique in this exact subject/resource scope, permission ordering is a complete
deterministic ordering.

### Security Dimension Status

Security Dimension Status is exactly one closed literal:

- `available`;
- `unavailable`; or
- `not-applicable`.

The public M8 representation exposes governed status only, not underlying
Device, Session, Context, or Trust values. `available` asserts that the
configured authority supplied sufficient current facts for the operation.
`not-applicable` asserts that the configured authority determined the dimension
does not apply. Callers cannot establish either status.

### Security Evaluation Context

Security Evaluation Context has exactly:

```text
{
  operationId: AuthorizationOperationIdentifier,
  subject: AuthorizationSubject,
  context: SecurityDimensionStatus,
  device: SecurityDimensionStatus,
  session: SecurityDimensionStatus,
  trustLevel: SecurityDimensionStatus
}
```

This representation accounts for OES-0009 as follows:

- Identity is represented by `subject`;
- Device by `device`;
- Session by `session`;
- Context by `context`;
- Permissions by governed requirements and Grant Evidence; and
- Trust Level by `trustLevel`.

Current M8 sources must return `unavailable` for Device, Session, or Trust Level
unless the configured authority can establish `available` or
`not-applicable`. No missing fact becomes safe implicitly. Any unavailable
dimension produces `indeterminate`.

### Governed Security Evaluation Summary

Governed Security Evaluation Summary is the exact Core-custodied value:

```text
{
  operationId: AuthorizationOperationIdentifier,
  subject: AuthorizationSubject,
  securityContext: {
    context: SecurityDimensionStatus,
    device: SecurityDimensionStatus,
    session: SecurityDimensionStatus,
    trustLevel: SecurityDimensionStatus
  }
}
```

Every property is required. No additional enumerable string or symbol property,
optional field, implicit default, nullable status, or fourth status literal is
permitted. Each status is exactly `available`, `unavailable`, or
`not-applicable`.

Security owns the Summary semantics. Core custodies its schema and structural
factory only. Brain, Skill, Bootstrap, Context, composition, and callers cannot
manufacture Summary authority. The structural factory defensively reconstructs
and deeply freezes the exact visible value but confers no authority.

The Summary is constructed only from protected local captures of the exact
governed Security Evaluation Context accepted for the current evaluation:

- `operationId` is copied from that evaluation's operation;
- `subject` is copied from that governed Context;
- the four statuses are copied independently from that governed Context; and
- no field is derived from the Decision Artifact or re-resolved after policy
  evaluation.

There is no `permissionsStatus`. Permission authorization remains represented
by governed requirements, evaluated permissions, and Grant Evidence. The
Summary contains no raw Context, Context lineage or revision, Device or Session
identifier, Trust detail or score, location, token, credential, provider claim,
policy internal, Grant Evidence detail, or confirmation content.

### Authorization Evaluation Outcome

Authorization Evaluation Outcome is the exact Core-custodied value:

```text
{
  authorization: AuthorizationDecisionArtifact,
  securityEvaluationSummary: GovernedSecurityEvaluationSummary
}
```

The Outcome is the single representation that co-issues the two separately
structured values. It is not a new decision category and does not change or
extend the Authorization Decision Artifact.

One successful Evaluate Authorization Outcome invocation creates exactly one
Artifact, exactly one Summary, and exactly one Outcome. The Artifact and Summary
are independently constructed from the same protected evaluation locals,
independently validated, and then related by one private issuance record. The
Outcome is authoritative only when its identity is present in the issuing
Security instance's private issuance map and both nested identities exactly
match that record.

Operation, subject, and visible status equality are necessary but insufficient.
A clone, spread, serialization/deserialization, reconstruction, same-shaped
object, Core factory result, or TypeScript brand has no Outcome authority. An
Artifact from evaluation A paired with a Summary from evaluation B is invalid
even when every visible value is identical. Authority from Security instance A
is invalid to the verifier of incompatible Security instance B.

Every successful decision row—`allow`, `deny`, and `indeterminate`—co-issues a
Summary. Existing precedence already obtains and validates governed Security
Evaluation Context for every successful row, including
`requirements-unavailable`; no later Grant or Confirmation authority may be
invoked merely to populate the Summary.

This rule applies identically to both public evaluation Contracts and all ten
Decision Artifact Output-Invariant rows. No successful compatibility Artifact
may be returned from an evaluation that skipped Summary construction, Outcome
construction, visible correspondence validation, or provenance registration.

### Confirmation Evidence

Confirmation Evidence is exactly one of:

```text
{ status: "absent" }
```

```text
{
  status: "confirmed",
  operationId: AuthorizationOperationIdentifier,
  subject: AuthorizationSubject,
  action: AuthorizationActionIdentifier,
  resource: AuthorizationResource
}
```

Confirmed evidence is authority-bearing only when returned by the configured
Confirmation Evidence Authority Contract during the current evaluation.
Security does not acquire confirmation.

For a standard action, evidence must be absent. Confirmed evidence is invalid
authorization evidence. For a sensitive action:

- absent evidence produces `deny` with `confirmation-required`;
- exact matching confirmed evidence permits grant evaluation to continue; and
- malformed or mismatched evidence is invalid authorization evidence.

Confirmation from another operation is invalid even when every other field
matches.

### Fixed Policy Reference

The policy reference has exactly:

```text
{
  id: "orion.minimum-authorization",
  version: "1.0.0"
}
```

Both values are fixed literals. M8 has no policy configuration or DSL.

### Authorization Decision Artifact

Authorization Decision Artifact has exactly:

```text
{
  operationId: AuthorizationOperationIdentifier,
  decision: "allow" | "deny" | "indeterminate",
  subject: AuthorizationSubject,
  action: AuthorizationActionIdentifier,
  resource: AuthorizationResource,
  requirementsStatus: "available" | "unavailable",
  evaluatedPermissions: SkillPermissionIdentifier[],
  sensitivity: "standard" | "sensitive" | "unavailable",
  securityContext: {
    context: SecurityDimensionStatus,
    device: SecurityDimensionStatus,
    session: SecurityDimensionStatus,
    trustLevel: SecurityDimensionStatus
  },
  policy: {
    id: "orion.minimum-authorization",
    version: "1.0.0"
  },
  reason: AuthorizationDecisionReason,
  evidence: {
    grantEvidenceStatus: "available" | "unavailable" | "not-evaluated",
    confirmationStatus:
      "not-evaluated" | "not-required" | "absent" | "confirmed"
  }
}
```

Authorization Decision Reason is exactly one of:

- `no-permission-required`;
- `all-required-permissions-granted`;
- `confirmation-and-permissions-satisfied`;
- `missing-required-permission`;
- `confirmation-required`;
- `requirements-unavailable`;
- `security-context-unavailable`; or
- `grant-evidence-unavailable`.

Artifact invariants and the correspondence between decision, reason,
requirements, sensitivity, context, and evidence statuses are exactly those in
the Decision Table and the Output-Invariant Table below.

`grantEvidenceStatus` is closed:

- `not-evaluated` when evaluation terminates before the Grant Evidence stage;
- `unavailable` only when the governed Grant Evidence authority returns a valid
  unavailable result; and
- `available` only when complete governed available Grant Evidence reaches
  policy evaluation.

`confirmationStatus` is closed:

- `not-evaluated` when evaluation terminates before Confirmation Evidence;
- `not-required` for every standard action after the confirmation authority
  returns the required absent evidence;
- `absent` for a sensitive action whose confirmation authority returns absent;
  and
- `confirmed` for a sensitive action with exact matching governed confirmation.

Malformed or mismatched Grant Evidence or Confirmation Evidence is a domain
failure and produces no Authorization Decision Artifact.

The artifact has no additional aggregate Security-context status field. Its
Security-context summary is exactly the four governed dimension statuses:
`context`, `device`, `session`, and `trustLevel`. When the context stage is
reached, those values exactly reproduce the governed Security Evaluation
Context. M8 always reaches and validates that stage after a valid requirements
result, including unavailable requirements, because the artifact requires the
authoritative subject and dimension summary. Therefore:

- requirements unavailable carries the exact four valid governed statuses;
- context-unavailable indeterminate carries the exact four governed statuses
  with at least one `unavailable`; and
- every later decision carries four statuses that are each `available` or
  governed `not-applicable`.

No raw dimension value is exposed. No context-summary value is implementation
selected.

No raw grant, confirmation content, Context value,
credential, token, policy internals, Provider data, chain-of-thought, timestamp,
expiry, execution status, or readiness state is present.

### Decision Artifact Output-Invariant Table

Every successful decision must match exactly one row. “Governed statuses” means
the exact four Security Evaluation Context dimension statuses. “Canonical
requirements” means the exact complete, unique, code-point-sorted governed
required-permission collection. Subject category does not change any mapping;
anonymous and authenticated decisions use the same rows.

| Policy condition                                         | Decision        | Reason                                   | Requirements status | Evaluated permissions            | Sensitivity       | Governed Security-context statuses         | Grant evidence status | Confirmation status |
| -------------------------------------------------------- | --------------- | ---------------------------------------- | ------------------- | -------------------------------- | ----------------- | ------------------------------------------ | --------------------- | ------------------- |
| Requirements unavailable                                 | `indeterminate` | `requirements-unavailable`               | `unavailable`       | empty                            | `unavailable`     | exact governed statuses                    | `not-evaluated`       | `not-evaluated`     |
| One or more Security dimensions unavailable              | `indeterminate` | `security-context-unavailable`           | `available`         | canonical requirements           | governed category | exact statuses, at least one `unavailable` | `not-evaluated`       | `not-evaluated`     |
| Grant Evidence unavailable                               | `indeterminate` | `grant-evidence-unavailable`             | `available`         | canonical requirements           | governed category | each `available` or `not-applicable`       | `unavailable`         | `not-evaluated`     |
| Sensitive confirmation absent                            | `deny`          | `confirmation-required`                  | `available`         | canonical requirements           | `sensitive`       | each `available` or `not-applicable`       | `available`           | `absent`            |
| Standard, one or more grants missing                     | `deny`          | `missing-required-permission`            | `available`         | canonical non-empty requirements | `standard`        | each `available` or `not-applicable`       | `available`           | `not-required`      |
| Sensitive confirmed, one or more grants missing          | `deny`          | `missing-required-permission`            | `available`         | canonical non-empty requirements | `sensitive`       | each `available` or `not-applicable`       | `available`           | `confirmed`         |
| Standard, zero permissions satisfied                     | `allow`         | `no-permission-required`                 | `available`         | empty                            | `standard`        | each `available` or `not-applicable`       | `available`           | `not-required`      |
| Standard, all non-empty permissions satisfied            | `allow`         | `all-required-permissions-granted`       | `available`         | canonical non-empty requirements | `standard`        | each `available` or `not-applicable`       | `available`           | `not-required`      |
| Sensitive confirmed, zero permissions satisfied          | `allow`         | `confirmation-and-permissions-satisfied` | `available`         | empty                            | `sensitive`       | each `available` or `not-applicable`       | `available`           | `confirmed`         |
| Sensitive confirmed, all non-empty permissions satisfied | `allow`         | `confirmation-and-permissions-satisfied` | `available`         | canonical non-empty requirements | `sensitive`       | each `available` or `not-applicable`       | `available`           | `confirmed`         |

Decision/reason compatibility is closed:

- `allow` uses only `no-permission-required`,
  `all-required-permissions-granted`, or
  `confirmation-and-permissions-satisfied`, exactly as selected by the table;
- `deny` uses only `missing-required-permission` or
  `confirmation-required`; and
- `indeterminate` uses only `requirements-unavailable`,
  `security-context-unavailable`, or `grant-evidence-unavailable`.

No artifact may combine a decision, reason, requirements status, permission
representation, sensitivity, governed dimension status, grant status, or
confirmation status from different rows. Any incompatible or impossible
combination is constructed-state corruption and produces
InvalidSecurityStateError rather than a public artifact.

## Core-Custodied Contracts

All M8 Contracts are synchronous request/response Contracts. They return or
throw before the call returns. No Contract returns a Promise, accepts a
callback, opens a stream, emits an Event, performs an external wait, or implies
I/O.

### Evaluate Authorization Contract

Metadata:

| Property                      | Value                                                                                                                                                                      |
| ----------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Version                       | `1.0.0`                                                                                                                                                                    |
| Schema custodian              | Core                                                                                                                                                                       |
| Domain semantic owner         | Security Engine                                                                                                                                                            |
| Implementation responsibility | Security Engine                                                                                                                                                            |
| Operation                     | synchronous request/response                                                                                                                                               |
| Success                       | Authorization Decision Artifact                                                                                                                                            |
| Compatibility semantics       | Artifact projection from the single atomic Authorization Evaluation Outcome pipeline                                                                                       |
| Co-issuance guarantee         | every successful call has already constructed, validated, paired, and registered its Summary and Outcome before returning the Artifact                                     |
| Prohibited behavior           | separate policy evaluation, duplicate authority invocation, second Summary construction, Artifact-to-Outcome lookup, or use as a protected-enforcement provenance boundary |
| Failure/lifecycle             | unchanged three-class Security taxonomy; Running-only evaluation; every internal Outcome construction/provenance failure returns no Artifact                               |
| Privacy                       | the internal Summary/Outcome is not returned, logged, diagnosed, or made retrievable through this compatibility projection                                                 |

The exact public request is:

```text
{
  intent: "evaluate-authorization",
  operationId: AuthorizationOperationIdentifier,
  action: AuthorizationActionIdentifier,
  resource: AuthorizationResource
}
```

The request deliberately contains no subject, permissions, sensitivity, grants,
Security statuses, or confirmation evidence. Those facts come only from the
configured authority Contracts. This prevents callers from manufacturing
governed inputs.

The `1.0.0` request and Artifact success result remain unchanged. This Contract
is a compatibility projection over the single atomic evaluation primitive:

```text
EvaluateAuthorization(request)
  → performAtomicAuthorizationEvaluation(request)
  → AuthorizationEvaluationOutcome
  → outcome.authorization
```

The internal Outcome, Summary, and provenance association MUST be completely
constructed, validated, paired, and registered before the Artifact projection
is returned. The compatibility path does not run policy separately, invoke an
authority twice, reconstruct a second Summary, create a second provenance pair,
or re-resolve Context, grants, or confirmation.

There is no public lookup from the returned Artifact to its internally
co-issued Outcome. The private registry is not enumerable, and the compatibility
call establishes no Artifact-to-Outcome retrieval API or history. Consumers
that require protected-enforcement provenance MUST invoke Evaluate
Authorization Outcome directly for that operation, rather than first invoking
this compatibility Contract and then evaluating the same protected operation
again. This Contract remains for consumers that require the unchanged Artifact
but do not perform the new protected-enforcement flow.

### Evaluate Authorization Outcome Contract

| Property                      | Value                                                                                                                                                                                           |
| ----------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Contract name                 | Evaluate Authorization Outcome Contract                                                                                                                                                         |
| Version                       | `1.0.0`                                                                                                                                                                                         |
| Schema custodian              | Core                                                                                                                                                                                            |
| Domain semantic owner         | Security Engine                                                                                                                                                                                 |
| Implementation responsibility | Security Engine                                                                                                                                                                                 |
| Operation                     | synchronous request/response                                                                                                                                                                    |
| Exact request                 | the exact Evaluate Authorization request, with intent `evaluate-authorization-outcome`                                                                                                          |
| Success                       | one authoritative Authorization Evaluation Outcome                                                                                                                                              |
| Legitimate unavailable        | none; `deny` and `indeterminate` remain successful Outcome decisions                                                                                                                            |
| Contract guarantee            | invokes the single atomic evaluation primitive once; one unchanged Artifact and one exact Summary are co-issued from that evaluation and related by private process-local provenance            |
| Prohibited behavior           | separate/duplicate policy algorithm or authority calls, caller-supplied Summary or Artifact, separate status resolution, Artifact-derived Summary, partial return, authority serialization, I/O |
| Provenance                    | exact aggregate Outcome identity and both nested identities recorded in the issuing Security instance's private issuance map                                                                    |
| Malformed request             | InvalidAuthorizationInputError                                                                                                                                                                  |
| Malformed constructed result  | InvalidSecurityStateError; no partial value or authority is exposed                                                                                                                             |
| Implementation/native throw   | InvalidSecurityStateError; no native value escapes                                                                                                                                              |
| Privacy                       | request, Artifact, Summary, identifiers, underlying facts, and native error details are excluded from public messages and diagnostics except the already approved aggregate categories          |

Exact request:

```text
{
  intent: "evaluate-authorization-outcome",
  operationId: AuthorizationOperationIdentifier,
  action: AuthorizationActionIdentifier,
  resource: AuthorizationResource
}
```

The evaluation inputs, authorities, decision table, lifecycle, and failure
taxonomy are identical to the compatibility Contract. Both Contracts invoke the
same `performAtomicAuthorizationEvaluation` primitive exactly once. The
distinct intent selects whether the caller receives the full Outcome or only
its Artifact projection; it never selects another decision algorithm.

This is the required Contract for M9 and every downstream protected-execution
boundary that needs same-evaluation provenance. One call returns the Artifact,
Summary, and their Outcome authority without a second Security evaluation.

### Verify Authorization Evaluation Outcome Contract

| Property                      | Value                                                                                                                                                                                                                     |
| ----------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Contract name                 | Verify Authorization Evaluation Outcome Contract                                                                                                                                                                          |
| Version                       | `1.0.0`                                                                                                                                                                                                                   |
| Schema custodian              | Core                                                                                                                                                                                                                      |
| Domain semantic owner         | Security Engine                                                                                                                                                                                                           |
| Implementation responsibility | Security Engine instance that issued the Outcome                                                                                                                                                                          |
| Operation                     | synchronous read-only request/response                                                                                                                                                                                    |
| Exact request                 | intent, candidate Outcome, and expected operation identifier                                                                                                                                                              |
| Success                       | primitive boolean                                                                                                                                                                                                         |
| Legitimate unavailable        | `false`; no separate unavailable state                                                                                                                                                                                    |
| Contract guarantee            | `true` only for the exact aggregate Outcome issued by this instance whose exact nested Artifact/Summary identities and recorded operation still match and whose visible values remain structurally and semantically valid |
| Prohibited behavior           | minting, mutation, policy evaluation, Context or other authority calls, currentness query, registry disclosure, exception-as-negative-result, I/O                                                                         |
| Provenance                    | read-only lookup in the issuing instance's private Outcome issuance map                                                                                                                                                   |
| Malformed request             | InvalidAuthorizationInputError                                                                                                                                                                                            |
| Malformed candidate/result    | exact well-formed request returns `false` for fabricated, cloned, reconstructed, hostile, cross-paired, cross-evaluation, or cross-instance candidate authority; no candidate detail is exposed                           |
| Implementation/native throw   | impossible verifier or private-state failure maps to InvalidSecurityStateError; no native value escapes                                                                                                                   |
| Privacy                       | boolean only; messages and diagnostics contain no candidate contents, operation, subject, statuses, identifiers, registry state, or native detail                                                                         |

Exact request:

```text
{
  intent: "verify-authorization-evaluation-outcome",
  outcome: unknown,
  operationId: AuthorizationOperationIdentifier
}
```

The request envelope and expected operation are hostile-safe exact inputs.
`outcome` is deliberately `unknown`: malformed or hostile candidate authority
is a negative verification result after the envelope and operation are valid.
The verifier captures the candidate's exact visible structure once, without
mutation, before checking the private issuance record. It returns `true` only
when:

1. the aggregate identity is registered by this exact Security instance;
2. its `authorization` and `securityEvaluationSummary` identities exactly equal
   the private record;
3. the recorded, requested, Artifact, and Summary operation identifiers are
   equal;
4. Artifact and Summary subjects are exactly equal;
5. each of the four Artifact and Summary statuses is exactly equal; and
6. both values and their aggregate satisfy their complete independent
   constructed-state invariants.

The verifier does not confer authority on the candidate. It never substitutes a
same-shaped value for an issued identity and never exposes the private record.

### Resolve Protected Action Requirements Authority Contract

| Property                      | Value                                                                                                                                                                                        |
| ----------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Contract name                 | Resolve Protected Action Requirements Authority Contract                                                                                                                                     |
| Version                       | `1.0.0`                                                                                                                                                                                      |
| Schema custodian              | Core                                                                                                                                                                                         |
| Domain semantic owner         | Security Engine                                                                                                                                                                              |
| Implementation responsibility | Composition-provided authority satisfying the Core Contract                                                                                                                                  |
| Operation                     | synchronous request/response                                                                                                                                                                 |
| Success                       | one available or unavailable requirements candidate                                                                                                                                          |
| Legitimate unavailable        | complete requirements or sensitivity cannot be established                                                                                                                                   |
| Prohibited behavior           | caller-selected permissions/sensitivity, partial available response, I/O, policy decision                                                                                                    |
| Contract guarantee            | exact operation/action/resource binding and complete requirements when available                                                                                                             |
| Contract throw                | no native throw may escape; direct invalid request maps to InvalidAuthorizationInputError                                                                                                    |
| Security normalization        | valid unavailable continues toward indeterminate; malformed response/correspondence maps to InvalidAuthorizationEvidenceError; implementation/native throw maps to InvalidSecurityStateError |
| Provenance guarantee          | candidate authority derives only from this configured Contract invocation                                                                                                                    |

Exact request:

```text
{
  intent: "resolve-protected-action-requirements",
  operationId: AuthorizationOperationIdentifier,
  action: AuthorizationActionIdentifier,
  resource: AuthorizationResource
}
```

Exact response is one Protected Action Requirements Resolution candidate.

The implementation must derive complete permission requirements and
Security-owned sensitivity for the target. For Skill-backed actions, it must be
configured only from an admitted, defensively reconstructed Registered Skill
manifest and must copy every declared permission. It may not accept a
caller-selected subset.

The Contract implementation is a source-neutral authority boundary. It does not
make the authorization decision. M8 does not require or permit the Security
Engine to import or call the Skill Engine implementation. Bootstrap may prepare
a deterministic process-local requirements authority from immutable admitted
Skill metadata obtained through existing Core Contracts.

### Resolve Security Evaluation Context Authority Contract

| Property                      | Value                                                                                                                                                                                                  |
| ----------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Contract name                 | Resolve Security Evaluation Context Authority Contract                                                                                                                                                 |
| Version                       | `1.0.0`                                                                                                                                                                                                |
| Schema custodian              | Core                                                                                                                                                                                                   |
| Domain semantic owner         | Security Engine                                                                                                                                                                                        |
| Implementation responsibility | Composition-provided authority satisfying the Core Contract                                                                                                                                            |
| Operation                     | synchronous request/response                                                                                                                                                                           |
| Success                       | one governed Security Evaluation Context candidate                                                                                                                                                     |
| Legitimate unavailable        | one or more dimension statuses are `unavailable`                                                                                                                                                       |
| Prohibited behavior           | caller-selected status authority, fabricated facts, raw context payload, I/O, policy decision                                                                                                          |
| Contract guarantee            | accepted Identity-derived subject and governed status for every OES-0009 dimension                                                                                                                     |
| Contract throw                | no native throw may escape; direct invalid request maps to InvalidAuthorizationInputError                                                                                                              |
| Security normalization        | valid unavailable dimension continues toward indeterminate; malformed response/correspondence maps to InvalidAuthorizationEvidenceError; implementation/native throw maps to InvalidSecurityStateError |
| Provenance guarantee          | `available` and `not-applicable` authority derive only from this configured Contract invocation                                                                                                        |

Exact request:

```text
{
  intent: "resolve-security-evaluation-context",
  operationId: AuthorizationOperationIdentifier,
  action: AuthorizationActionIdentifier,
  resource: AuthorizationResource
}
```

Exact response is one Security Evaluation Context candidate.

The configured implementation derives the subject from accepted Current
Identity semantics and governs each dimension status. Only this authority may
establish `available` or `not-applicable`. It exposes no underlying context,
device, session, or trust payload.

### Resolve Grant Evidence Authority Contract

| Property                      | Value                                                                                                                                                                                        |
| ----------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Contract name                 | Resolve Grant Evidence Authority Contract                                                                                                                                                    |
| Version                       | `1.0.0`                                                                                                                                                                                      |
| Schema custodian              | Core                                                                                                                                                                                         |
| Domain semantic owner         | Security Engine                                                                                                                                                                              |
| Implementation responsibility | Composition-provided authority satisfying the Core Contract                                                                                                                                  |
| Operation                     | synchronous request/response                                                                                                                                                                 |
| Success                       | one available or unavailable Permission Grant Evidence candidate                                                                                                                             |
| Legitimate unavailable        | completeness or operation-currentness cannot be established                                                                                                                                  |
| Prohibited behavior           | partial available evidence, unrelated grants, implicit grants, I/O, policy decision                                                                                                          |
| Contract guarantee            | complete, relevant, authoritative, operation-current evidence when available                                                                                                                 |
| Contract throw                | no native throw may escape; direct invalid request maps to InvalidAuthorizationInputError                                                                                                    |
| Security normalization        | valid unavailable continues toward indeterminate; malformed response/correspondence maps to InvalidAuthorizationEvidenceError; implementation/native throw maps to InvalidSecurityStateError |
| Provenance guarantee          | grant authority derives only from this configured Contract invocation                                                                                                                        |

Exact request:

```text
{
  intent: "resolve-grant-evidence",
  operationId: AuthorizationOperationIdentifier,
  subject: AuthorizationSubject,
  action: AuthorizationActionIdentifier,
  resource: AuthorizationResource,
  requiredPermissions: SkillPermissionIdentifier[]
}
```

Exact response is one available or unavailable Permission Grant Evidence
candidate.

The configured implementation guarantees completeness and currentness for the
exact operation when it returns available. It returns unavailable for partial,
stale, unverifiable, or unobtainable evidence. It does not make the final
decision.

When requirements are unavailable, Security does not invoke this Contract. It
constructs the concept-required unavailable, empty evaluated-permission summary
for the final artifact without treating it as grant authority.

### Resolve Confirmation Evidence Authority Contract

| Property                      | Value                                                                                                                                                                                                                      |
| ----------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Contract name                 | Resolve Confirmation Evidence Authority Contract                                                                                                                                                                           |
| Version                       | `1.0.0`                                                                                                                                                                                                                    |
| Schema custodian              | Core                                                                                                                                                                                                                       |
| Domain semantic owner         | Security Engine                                                                                                                                                                                                            |
| Implementation responsibility | Composition-provided authority satisfying the Core Contract                                                                                                                                                                |
| Operation                     | synchronous request/response                                                                                                                                                                                               |
| Success                       | one absent or confirmed Confirmation Evidence candidate                                                                                                                                                                    |
| Legitimate absent             | no confirmation was acquired for the exact operation                                                                                                                                                                       |
| Prohibited behavior           | acquiring confirmation, treating absence as a source failure, I/O, policy decision                                                                                                                                         |
| Contract guarantee            | confirmed evidence originated at the authorized confirmation boundary and is operation-bound                                                                                                                               |
| Contract throw                | no native throw may escape; direct invalid request maps to InvalidAuthorizationInputError                                                                                                                                  |
| Security normalization        | valid sensitive absence continues toward deny; standard absence continues normally; malformed/mismatched response maps to InvalidAuthorizationEvidenceError; implementation/native throw maps to InvalidSecurityStateError |
| Provenance guarantee          | confirmed authority derives only from this configured Contract invocation                                                                                                                                                  |

Exact request:

```text
{
  intent: "resolve-confirmation-evidence",
  operationId: AuthorizationOperationIdentifier,
  subject: AuthorizationSubject,
  action: AuthorizationActionIdentifier,
  resource: AuthorizationResource
}
```

Exact response is one Confirmation Evidence candidate.

The implementation represents confirmation already acquired by an authorized
interaction boundary. It does not prompt, authenticate, call a UI, or make an
authorization decision. For standard actions Security requires an absent
response. Security invokes this Contract for both standard and sensitive actions
only after requirements, context, and Grant Evidence are available. It is not
invoked after an earlier requirements, context, or Grant Evidence
indeterminate result.

### Authority Contract Provenance Guarantee

For all four authority Contracts:

- authority-bearing status derives from obtaining the candidate through the
  exact configured authority Contract invocation during the current operation;
- a same-shaped object in the Evaluate Authorization request cannot substitute
  for an authority response because that request has no governed-artifact
  fields;
- Contract provenance is necessary but not sufficient—the Security Engine must
  still safely extract, structurally validate, semantically validate,
  defensively reconstruct, and correspondence-check every response;
- a Core structural factory, TypeScript type, ordinary object, exported symbol,
  or caller assertion never establishes provenance; and
- a response is authoritative only for the current operation and the specific
  authority role that produced it.

### Authority Contract Failure-Normalization Table

| Authority boundary            | Legitimate unavailable or absent                                                                                  | Malformed response                | Correspondence violation          | Implementation or native throw |
| ----------------------------- | ----------------------------------------------------------------------------------------------------------------- | --------------------------------- | --------------------------------- | ------------------------------ |
| Protected Action Requirements | governed unavailable result; continue to `requirements-unavailable` indeterminate                                 | InvalidAuthorizationEvidenceError | InvalidAuthorizationEvidenceError | InvalidSecurityStateError      |
| Security Evaluation Context   | governed result with one or more `unavailable` statuses; continue to `security-context-unavailable` indeterminate | InvalidAuthorizationEvidenceError | InvalidAuthorizationEvidenceError | InvalidSecurityStateError      |
| Grant Evidence                | governed unavailable result; continue to `grant-evidence-unavailable` indeterminate                               | InvalidAuthorizationEvidenceError | InvalidAuthorizationEvidenceError | InvalidSecurityStateError      |
| Confirmation Evidence         | governed absent result; standard continues and sensitive produces `confirmation-required` deny                    | InvalidAuthorizationEvidenceError | InvalidAuthorizationEvidenceError | InvalidSecurityStateError      |

An authority implementation must normalize hostile direct request extraction to
InvalidAuthorizationInputError and must not leak a native exception. When the
Security Engine invokes a configured implementation, any thrown value—including
a public error unexpectedly thrown by that collaborator—is an implementation
throw at the Security boundary and normalizes to InvalidSecurityStateError.
Legitimate unavailability or absence exists only as the exact successful
response member shown above.

### Outcome Provenance and Failure-Normalization Table

| Stage or condition                                                   | Exact public result            |
| -------------------------------------------------------------------- | ------------------------------ |
| malformed request for either evaluation Contract                     | InvalidAuthorizationInputError |
| malformed verifier envelope/expected operation                       | InvalidAuthorizationInputError |
| exact verifier request with fabricated, cloned, or hostile candidate | `false`                        |
| exact verifier request with cross-paired/cross-evaluation candidate  | `false`                        |
| exact verifier request with authority from another instance/runtime  | `false`                        |
| malformed internal Summary or Outcome construction                   | InvalidSecurityStateError      |
| internal Artifact/Summary operation, subject, or status mismatch     | InvalidSecurityStateError      |
| private issuance-map corruption or impossible verifier state         | InvalidSecurityStateError      |
| native failure during internal construction, registration, or verify | InvalidSecurityStateError      |

This table adds no public failure class. InvalidAuthorizationEvidenceError
continues to govern malformed or mismatched configured authority responses
before decision construction. A caller cannot present a Summary through either
evaluation request, so fabricated Summary authority appears only as a verifier
candidate and yields `false` for an otherwise exact verifier request.

### Atomic Outcome Issuance

Both public evaluation Contracts invoke exactly one internal semantic primitive,
`performAtomicAuthorizationEvaluation`, once per request. The name is
specification notation, not a required public export. There is no second
decision pipeline.

After the unchanged authorization authorities and fixed policy produce safe
evaluation locals, the primitive must:

1. construct the unchanged Decision Artifact from the safe evaluation locals;
2. independently construct the Summary from the captured governed Security
   Evaluation Context locals, never from the Artifact;
3. completely validate the Artifact;
4. independently validate the Summary's exact shape, operation, subject, four
   statuses, canonical prototypes, and deep immutability;
5. compare Artifact and Summary operation, subject, and all four statuses;
6. construct the exact deeply frozen Outcome;
7. completely validate the Outcome and its nested visible correspondence;
8. prepare one immutable private issuance record containing the exact Artifact
   identity, Summary identity, and operation identifier; and
9. perform the single `WeakMap.set` that makes the Outcome authoritative;
10. perform the final internal constructed-state invariant validation; and
11. return the Outcome internally.

The Outcome Contract returns that exact Outcome. The compatibility Contract
returns that exact Outcome's `authorization` property only after Step 11
succeeds.

The map insertion is the only provenance state mutation. Artifact, Summary, and
Outcome remain local and externally unobservable until the primitive returns.
A failure before insertion creates no authority. If insertion or final
invariant validation fails, the implementation must synchronously delete the
exact Outcome entry before normalizing the failure; neither public Contract may
return. Thus no failed call exposes an Artifact, Outcome, or partial authority.
The Engine remains usable after a construction/registration failure unless
pre-existing private state is itself corrupted.

Production exposes no registration hook, fault option, environment switch, or
mutable global test control. Tests simulate construction, insertion, deletion,
and final-invariant failures only through isolated test-module seams that are
absent from public package exports and production configuration.

The implementation must not use multiple registries, partially register nested
values, retry evaluation, or expose a registry enumeration or
Artifact-to-Outcome lookup.

## Process-Local Authority Slice

M8 may provide deterministic process-local implementations of the four
authority Contracts for Bootstrap demonstration and tests.

Such implementations:

- receive immutable setup facts explicitly at construction;
- defensively reconstruct and deeply freeze setup facts;
- expose no mutation, update, removal, or list-all API;
- perform exact deterministic lookup only;
- perform no persistence, restoration, filesystem, network, or external call;
- use no time, random value, environment choice, or Provider;
- are not Security Engine internal policy state; and
- do not transfer semantic ownership from the applicable capability.

The requirements fixture may accept complete prepared action records and, for a
Skill-backed record, only a complete admitted Registered Skill projection.
The grant fixture may accept exact operation-scoped grant facts. The context
fixture may accept exact governed statuses and accepted Current Identity
projections. The confirmation fixture may accept exact operation-bound
confirmation facts.

These implementations demonstrate replaceable authority Contracts. They are
not databases, repositories, production IAM, or persistence semantics.

## Deterministic Policy

M8 implements only `orion.minimum-authorization` version `1.0.0`.

The policy:

- evaluates one operation;
- requires exact correspondence;
- requires all required permissions;
- uses no role, hierarchy, wildcard, implication, priority, override,
  inheritance, provider claim, or configurable rule; and
- has no fallback allow.

### Decision Table

Validation and correspondence failures occur before this table.

| Requirements | Security context                         | Grant evidence | Required permissions | Matching grants | Sensitivity | Confirmation       | Decision      | Reason                                 |
| ------------ | ---------------------------------------- | -------------- | -------------------- | --------------- | ----------- | ------------------ | ------------- | -------------------------------------- |
| unavailable  | any valid status                         | not evaluated  | unknown              | not evaluated   | unavailable | not evaluated      | indeterminate | requirements-unavailable               |
| available    | one or more dimensions unavailable       | not evaluated  | any                  | not evaluated   | either      | not evaluated      | indeterminate | security-context-unavailable           |
| available    | all available or governed not applicable | unavailable    | any                  | not evaluated   | either      | not evaluated      | indeterminate | grant-evidence-unavailable             |
| available    | all available or governed not applicable | available      | zero                 | not applicable  | standard    | absent             | allow         | no-permission-required                 |
| available    | all available or governed not applicable | available      | one or more          | all             | standard    | absent             | allow         | all-required-permissions-granted       |
| available    | all available or governed not applicable | available      | one or more          | missing         | standard    | absent             | deny          | missing-required-permission            |
| available    | all available or governed not applicable | available      | any                  | not evaluated   | sensitive   | absent             | deny          | confirmation-required                  |
| available    | all available or governed not applicable | available      | zero                 | not applicable  | sensitive   | matching confirmed | allow         | confirmation-and-permissions-satisfied |
| available    | all available or governed not applicable | available      | one or more          | all             | sensitive   | matching confirmed | allow         | confirmation-and-permissions-satisfied |
| available    | all available or governed not applicable | available      | one or more          | missing         | sensitive   | matching confirmed | deny          | missing-required-permission            |

Normative rules:

1. Unavailable requirements produce `indeterminate`.
2. Any unavailable Security dimension then produces `indeterminate`.
3. Unavailable Grant Evidence then produces `indeterminate`.
4. Sensitive absent confirmation is checked before grant sufficiency and
   produces `deny`.
5. All permissions use AND semantics.
6. Authentication and confirmation never supply a missing grant.
7. Zero permissions do not bypass sensitive confirmation.
8. Zero matches in complete available grant evidence is valid and may deny.
9. Malformed, unrelated, extra, duplicate, or mismatched governed evidence is a
   failure, not a decision.
10. No unlisted condition produces `allow`.

## Evaluation Behavior

For each call to either public evaluation Contract, the single atomic evaluation
primitive:

1. validates lifecycle, fixed policy, configured Contract identities, and
   pre-existing internal invariants without touching the request;
2. validates and captures the exact public envelope;
3. validates the target operation identifier, action, and resource;
4. invokes and validates the requirements authority;
5. invokes and validates the Security Evaluation Context authority;
6. when requirements are available and context permits continuation, invokes
   and validates the Grant Evidence authority;
7. when requirements, context, and grants permit continuation, invokes and
   validates Confirmation Evidence;
8. applies the fixed decision table;
9. performs the complete Atomic Outcome Issuance sequence; and
10. returns the internal Outcome to the calling public Contract for either full
    return or compatibility projection.

An unavailable governed result is a valid policy input, not an exception.
Authority Contracts not reached under this order must remain untouched.

Evaluation mutates no request, authority source, evidence, grant, context,
confirmation, or policy. Its only successful retained mutation is the exact
private Outcome provenance association.

## Validation Precedence

First-failure precedence is normative.

### Evaluate Authorization

Evaluate Authorization and Evaluate Authorization Outcome share Steps 1–14
below. Their exact intent literal is validated at Step 2.

1. Engine lifecycle and pre-existing internal Security/policy/authority-Contract
   and provenance-registry state.
2. Exact public request envelope and Contract-specific intent.
3. Authorization Operation Identifier, Authorization Action Identifier, and
   Authorization Resource.
4. Protected Action Requirements authority invocation, structural validation,
   semantic validation, and exact operation/action/resource correspondence.
5. Security Evaluation Context authority invocation, structural validation,
   semantic validation, and exact operation/action/resource correspondence.
6. Grant Evidence authority invocation, structural validation, semantic
   validation, and exact operation/subject/action/resource/permission-set
   correspondence, unless an earlier valid unavailable result ends this stage.
7. Confirmation Evidence authority invocation, structural validation, semantic
   validation, provenance, and exact correspondence, unless an earlier valid
   unavailable result ends this stage.
8. Fixed policy evaluation.
9. Decision Artifact construction.
10. Summary construction independently from captured governed Context locals.
11. Independent Artifact validation, Summary validation, and exact
    operation/subject/four-status correspondence.
12. Outcome construction and complete validation.
13. Private record preparation, single provenance-map insertion, final internal
    invariant validation, and required rollback on failure.
14. Internal Outcome return.
15. Public return: the Outcome Contract returns the exact Outcome; the
    compatibility Contract returns the exact `outcome.authorization` projection.

No Summary work changes which existing authority is reached. Summary
construction cannot cause Grant Evidence or Confirmation Evidence to be
invoked. Steps 9–13 map any constructed-state failure to
InvalidSecurityStateError, expose no partial value, and leave the issuance map
without an entry for the failed call. No semantic branch exists between policy
evaluation and successful Outcome issuance.

### Verify Authorization Evaluation Outcome

1. Verify request-envelope hostile-safe extraction.
2. Expected Authorization Operation Identifier validation.
3. Candidate protected structural extraction and independent Artifact, Summary,
   and Outcome validation.
4. Issuing-instance private identity lookup.
5. Exact nested-identity, operation, subject, and four-status correspondence.
6. Primitive boolean result.

A malformed envelope or expected operation fails at Steps 1–2. Candidate
invalidity, missing provenance, or correspondence failure at Steps 3–5 returns
`false`. An impossible private-state/native failure maps to
InvalidSecurityStateError. Earlier failure leaves later candidate traps and
private lookup untouched wherever the earlier stage does not require them.

Before Step 1 succeeds, Security must not inspect request `ownKeys`, descriptors,
properties, getters, or Proxy traps. Earlier failures and valid short-circuiting
results prevent later hostile boundaries and Contracts from being touched.

An authority Contract native throw, thrown primitive, malformed return, hostile
return, or impossible configured state maps to the specified domain failure
without exposing the source detail. Authority unavailability is represented
only by a valid unavailable response.

## Public Failure Model

M8 defines exactly three public failure classes.

### InvalidAuthorizationInputError

Used only for:

- malformed Evaluate Authorization or direct authority Contract request
  envelope;
- malformed Evaluate Authorization Outcome or Verify Authorization Evaluation
  Outcome request envelope;
- malformed operation identifier, action, or resource;
- malformed subject or required-permission input in a direct authority Contract
  request;
- hostile request extraction; or
- invalid caller-controlled target correspondence within the envelope.

### InvalidAuthorizationEvidenceError

Used for:

- malformed or hostile authority-Contract response;
- fabricated or non-authoritative governed artifact;
- malformed requirements, context, Grant Evidence, grant, or confirmation;
- duplicate, irrelevant, contradictory, or incomplete available evidence;
- any operation, subject, action, resource, permission-set, sensitivity, or
  confirmation correspondence mismatch;
- confirmed evidence for a standard action; or
- an authority response that violates its Contract.

### InvalidSecurityStateError

Used for:

- lifecycle failure;
- missing, malformed, or corrupted configured authority Contract;
- invalid fixed policy identity or definition;
- impossible pre-existing Security invariant;
- native failure thrown by a configured authority implementation;
- impossible newly constructed Authorization Decision Artifact; or
- impossible newly constructed Governed Security Evaluation Summary or
  Authorization Evaluation Outcome;
- Artifact/Summary constructed-state correspondence failure;
- failed or corrupted private Outcome provenance registration or lookup; or
- impossible post-evaluation internal state.

`deny` and `indeterminate` are successful Authorization Decision Artifacts, not
exceptions. No other public Security failure class exists in M8.

Failure names and messages are stable, deterministic, and privacy-safe. Messages
contain no identifier, permission, grant, evidence, Context value, confirmation
detail, hostile value, thrown message, implementation path, or source detail.
No native exception crosses a public Contract.

## Exact Runtime Boundary Semantics

Every public factory, Contract request, authority response, nested object, and
collection treats input as hostile.

Where a record is required, reject:

- `null`, `undefined`, primitives, functions, and arrays;
- array-like or coercible substitutes;
- missing or explicitly `undefined` fields;
- unexpected own enumerable string fields;
- enumerable symbol properties;
- inherited substitutes; and
- hostile prototypes, `ownKeys`, descriptors, getters, or Proxies.

Where an array is required, require:

- a real dense array;
- exact own data indices from zero through length minus one;
- no holes, accessor indices, or extra enumerable string properties;
- no enumerable symbol properties;
- the applicable collection bound; and
- exact valid entries.

Non-enumerable implementation properties must not carry semantic or authority
data. Factories must not use coercion, iteration protocols, `toString`,
`valueOf`, JSON serialization, locale APIs, or caller methods for validation.

## Protected Extraction and Single Read

At every object boundary:

- capture own keys and descriptors once in a protected operation;
- establish exact structural presence without invoking an unaccepted property;
- perform at most one protected value read for each accepted property;
- store each accepted value in a local; and
- reconstruct only from captured locals.

At every array boundary:

- capture the array shape and length safely;
- inspect each accepted index descriptor once;
- perform at most one protected read per accepted index; and
- reconstruct into a new array.

No validation-then-second-read pattern is permitted. Stateful getters must
affect at most one captured value. All hostile/native failures map to the
boundary’s domain failure.

## Immutability and Caller Non-Mutation

Every successful public value is defensively reconstructed and deeply frozen,
including:

- subjects and resources;
- requirements and permission arrays;
- grants and Grant Evidence;
- Security Evaluation Context;
- Confirmation Evidence;
- fixed policy reference;
- Authorization Decision Artifact and every nested value;
- Governed Security Evaluation Summary and its nested Security Context; and
- Authorization Evaluation Outcome and every nested value.

No caller or authority-source object or array is retained or frozen. Evaluation
must never trim, normalize, rewrite, sort in place, deduplicate in place, add or
remove fields, invoke setters, or mutate caller values.

These guarantees apply to allow, deny, indeterminate, and every failure path.

## Lifecycle and State

The Security Engine follows:

```text
Initialize → Ready → Running → Stopping → Stopped
```

- construction establishes no authorization result;
- initialization validates the fixed policy and configured Contract presence;
- evaluation is valid only while Running;
- Stopping and Stopped reject with InvalidSecurityStateError;
- lifecycle failure occurs before request inspection;
- a new Engine instance has independent lifecycle and collaborators;
- restart of a stopped instance is not defined; a new instance is required; and
- no request, grant, requirement, governed Context reconstruction, confirmation,
  or policy-evaluation local is retained between evaluations.

In addition to lifecycle, the immutable fixed policy, and immutable references
to configured authority Contracts, revision `1.1.0` retains only the private
per-instance Outcome issuance `WeakMap`. This identity association is
authorization provenance, not a decision cache, catalog, grant store, session,
operation registry, audit history, or persistent state. Its entries are not
enumerable or publicly observable and do not retain an Outcome after the
consumer releases it.

Before every evaluation, Step 1 validates:

- lifecycle is Running;
- policy ID, version, and closed rule table are canonical;
- all four configured collaborators remain callable and exactly the collaborators
  admitted during initialization; and
- no impossible internal field or invariant, including the private issuance
  mechanism, is present.

Pre-existing validation must not invoke authority Contracts or touch the caller
request.

Evaluate Authorization and Evaluate Authorization Outcome are valid only while
Running. Verification is a lifecycle-independent read-only authority check:
before, during, or after Stopping/Stopped, it may validate an Outcome already
issued by that same instance and performs no evaluation or authority call.
Stopping does not revoke or rewrite an evaluation snapshot. A new Engine
instance has a different private map and rejects the prior instance's Outcome.

## Determinism and Atomicity

For identical requests and identical authority Contract results, evaluation
produces deeply equal visible Artifact, Summary, and Outcome content or the same
public failure. Each successful invocation nevertheless creates a distinct
Outcome identity and distinct evaluation-local provenance association.
Determinism never permits identity reuse across evaluations.

Production behavior uses no:

- wall clock;
- random or cryptographic value;
- locale-sensitive comparison;
- environment variable;
- filesystem or network;
- insertion-order-dependent policy;
- mutable process-global state; or
- external provider state.

Evaluation is synchronous. Both public Contracts use the same atomically
observable Outcome-producing operation. Its single issuance-map insertion,
post-insertion validation, and required rollback establish either one complete
pair authority or none. A failure exposes no partial result and changes no
authority-source state; the only successful retained mutation is the private
weak provenance association.

The Summary is an evaluation snapshot. Issuance and verification perform no
post-evaluation Context, Device, Session, or Trust query. Later environmental or
source revision changes cannot mutate or rewrite it. The Summary introduces no
expiry, lease, freshness extension, revalidation, or revocation semantics;
existing M8 currentness requirements apply when the governed Context authority
is invoked.

## Enforcement Correspondence

M8 does not enforce protected actions.

A future protected boundary that needs exact Security-status correspondence may
proceed only with one verified Outcome containing a valid `allow` artifact and
its same-evaluation Summary. The artifact's:

- operation identifier;
- subject;
- action;
- resource;
- evaluated required permissions;
- sensitivity;
- Security dimension statuses; and
- policy ID and version

exactly correspond to the protected operation and its governed requirements.

The protected boundary independently compares:

```text
artifact.operationId === summary.operationId
artifact.subject === summary.subject
artifact.securityContext.context === summary.securityContext.context
artifact.securityContext.device === summary.securityContext.device
artifact.securityContext.session === summary.securityContext.session
artifact.securityContext.trustLevel === summary.securityContext.trustLevel
```

Subject equality is exact structural Authorization Subject equality, not object
identity. The verifier additionally proves exact issued identities and
same-evaluation provenance. The Artifact is never treated as the source of the
Summary's expected statuses, and operation/subject/status equality alone never
proves provenance.

`deny`, `indeterminate`, missing, malformed, or mismatched artifacts fail
closed. An artifact for another operation is invalid even when every other field
matches. Enforcement does not recompute policy, and `allow` is not proof that
execution occurred or succeeded.

## Privacy and Diagnostics

Security diagnostics must not expose:

- operation, Identity, action, or resource identifiers;
- permission identifiers or lists;
- grants or grant-source details;
- confirmation content or acquisition details;
- underlying Security Context values;
- raw requests, authority responses, hostile values, or thrown messages;
- Governed Security Evaluation Summary or Authorization Evaluation Outcome
  contents and private issuance-map state;
- credentials, tokens, secrets, policy internals, Provider data, or personal
  data; or
- chain-of-thought.

Safe diagnostics may contain only:

- Engine lifecycle category;
- decision and reason category;
- anonymous/authenticated category;
- sensitivity category;
- permission count;
- grant-evidence availability;
- aggregate Security-dimension status counts;
- confirmation status;
- stable failure category; and
- aggregate operation counts.

Diagnostics must state authorization outcome only and must never imply
execution. The mandatory M8 diagnostic demonstration must remain visible and
privacy-safe under debug, info, warn, and error log thresholds according to the
accepted Bootstrap diagnostic convention.

## Architecture and Dependency Rules

Production source dependency direction is:

```text
Security Engine → Core
```

Forbidden dependencies include:

- Core → Security Engine;
- Security Engine → Bootstrap or Infrastructure;
- Security Engine → Identity, Context, Memory, Knowledge, Reasoning, Planning,
  Skill, Brain, Execution, Voice, Automation, Vision, or any other Engine
  implementation;
- Security Engine → Provider, Adapter, external IAM, database, filesystem,
  network, framework, or external npm runtime dependency; and
- dependency cycles.

The prohibition on other Engines must be generic and cover current and future
Engine implementation directories. Authority Contract implementations depend on
Core Contracts, not Security implementation internals.

Bootstrap may explicitly construct process-local authority implementations and
inject them into Security. Bootstrap does not evaluate policy, create authority
by shape, or become a service locator.

## Relationship with Accepted Milestones

### M0 — Core and Bootstrap

M8 follows Core Contract custody, explicit Bootstrap composition, deterministic
lifecycle, diagnostics, and architecture enforcement.

### M1 — Identity

M8 reuses Current Identity semantics through the Authorization Subject
projection. Security does not authenticate, call Identity Engine, or infer a
grant from Authenticated state.

### M2 — Context

Accepted Context facts may contribute through the configured Security Evaluation
Context authority. Security does not call or mutate Context Engine. Missing
required Context is unavailable, never fabricated.

### M3 and M4 — Memory and Knowledge

Memory and Knowledge are not grants, policies, or authorization evidence. M8
does not call either Engine.

### M5 — Reasoning

Reasoning may propose a candidate action but cannot authorize it. M8 does not
interpret Reasoning Outcomes.

### M6 — Planning

Planning remains advisory and cannot authorize. M8 does not alter Candidate
Plans, add Skill-bound steps, or call Planning.

### M7 — Skill

Skill permission declarations remain requirement metadata only. For a
Skill-backed action, the requirements authority uses a complete admitted
Registered Skill projection and cannot weaken its permission set.

M8 does not modify M7, call the Skill Engine implementation, discover or select
Skills, or treat catalog admission as executable readiness.

## Brain Boundary

Brain or another future protected orchestration boundary allocates the
Authorization Operation Identifier, chooses when to request evaluation, and
supplies the target operation.

It may compose authority Contract implementations through Bootstrap but cannot
manufacture governed requirements, sensitivity, grants, Context applicability,
or confirmation; reinterpret decisions; or acquire Security policy ownership.
M8 implements no Brain behavior.

## Execution Boundary

M8 returns authorization evidence only. It defines no:

- protected-action or Skill invocation Contract;
- arguments, execution lifecycle, timeout, cancellation, retry, sandbox,
  compensation, or side effect;
- execution result or failure normalization; or
- enforcement implementation.

## Events, Persistence, Providers, and Adapters

M8 publishes and consumes no Events. A decision is not sufficient authority to
invent an Event.

M8 defines no:

- audit Event or audit store;
- database, repository, cache, migration, filesystem, or restoration;
- policy or grant database;
- Provider or Adapter;
- OAuth, JWT, LDAP, cloud IAM, or external entitlement integration;
- external API, SDK, message broker, or network; or
- distributed decision transport.

## Runtime Bounds

| Value                              | Normative bound or vocabulary                                    |
| ---------------------------------- | ---------------------------------------------------------------- |
| Authorization Operation Identifier | 1–128 ASCII; `^[A-Za-z0-9][A-Za-z0-9._:-]{0,127}$`               |
| Authorization Action Identifier    | 3–128 ASCII; dotted lowercase grammar                            |
| Authorization Resource Identifier  | 1–128 restricted ASCII                                           |
| Skill Permission Identifier        | accepted M7 dotted lowercase grammar and 3–128 ASCII             |
| Required permissions               | 0–64 unique entries                                              |
| Permission grants                  | 0–64 unique relevant entries                                     |
| Security Dimension Status          | `available`, `unavailable`, `not-applicable`                     |
| Sensitivity                        | `standard`, `sensitive`                                          |
| Decision                           | `allow`, `deny`, `indeterminate`                                 |
| Policy                             | fixed `orion.minimum-authorization` / `1.0.0`                    |
| Decision reasons                   | eight closed literals defined by Authorization Decision Artifact |

All bounds are inherited from Active CONCEPT-0004 or accepted M1/M7 values. M8
introduces no new identifier, collection bound, global quota, or result quota.

## Normative Testing Requirements

### Core Factory Tests

Every exported M8 Core factory must be exercised directly for:

- exact valid shapes and union members;
- every lower, upper, and one-over bound;
- ASCII grammar and non-ASCII rejection;
- exact equality and preservation;
- `null`, `undefined`, every primitive, function, empty and populated array
  where records are required, malformed object, missing field, explicit
  `undefined`, extra field, inherited substitute, and coercible value;
- enumerable string and symbol decorations;
- hostile `ownKeys`, descriptors, getters, nested getters, Proxies, and
  stateful getters;
- dense, sparse, decorated, hostile-index, and array-like collections;
- duplicate rejection and canonical code-point ordering;
- exact public failure mapping and no native exception leakage;
- deep freezing; and
- caller graph non-mutation and non-retention.

Each public factory requires direct coverage; shared-helper tests alone are not
sufficient proof.

### Direct Authority Contract Request Tests

Every process-local implementation of each of the four authority Contracts must
be tested directly through its Core-custodied Contract surface. Transitive
Evaluate Authorization tests are not sufficient.

For each Contract independently, the request-boundary matrix must include:

- exact valid request and exact intent;
- `null`, `undefined`, string, number, boolean, bigint, symbol, and function;
- empty and populated arrays;
- array-like and coercible substitutes;
- every missing field and every explicitly `undefined` field;
- invalid intent and every invalid domain field;
- unexpected enumerable string property;
- enumerable symbol property;
- inherited substitutes;
- hostile `ownKeys` and `getOwnPropertyDescriptor`;
- throwing and stateful getters for every accepted property;
- hostile Proxy;
- exact one-read behavior;
- synchronous return or throw with no Promise, callback, stream, Event, or
  external wait;
- deterministic deeply equal output for equivalent input and setup facts;
- privacy-safe InvalidAuthorizationInputError with no native exception leakage;
- request deep equality before and after success and failure;
- no request freezing, mutable-graph retention, identifier rewriting, or caller
  array sorting; and
- deeply immutable defensively reconstructed success output.

Every authority implementation must use one protected own-key/descriptor
capture per direct request boundary, one protected read per accepted property,
one protected read per accepted array index, and reconstruction only from local
captures. Validation followed by a second read is forbidden.

Direct Contract failures, diagnostics, and test assertions must prove absence of
operation, subject, action, resource, permission, grant, Context value,
confirmation content, hostile value, credential, token, and native thrown
message.

#### Requirements Authority Direct Matrix

In addition to the common matrix, direct tests must cover:

- exact available and unavailable responses;
- exact operation/action/resource binding;
- zero required permissions where valid, one required permission, and 64
  required permissions;
- 65 required permissions in the governed Requirements response rejected with
  InvalidAuthorizationEvidenceError;
- canonical permission ordering;
- duplicate required-permission rejection;
- Skill-backed derivation from an admitted Registered Skill;
- rejection of a weakened or replaced Skill permission set;
- caller inability to select or downgrade sensitivity;
- no partial unavailable fields;
- malformed setup or impossible response state; and
- provenance and completeness guarantees.

#### Grant Evidence Authority Direct Matrix

In addition to the common matrix, direct tests must cover:

- exact available and unavailable responses;
- zero, one, and 64 grants in the governed Grant Evidence response;
- 65 grants in the governed Grant Evidence response rejected with
  InvalidAuthorizationEvidenceError;
- complete and missing grant sets;
- canonical grant ordering;
- exact operation, subject, action, resource, and required-permission
  correspondence;
- wrong-operation, wrong-action, wrong-subject, and wrong-resource governed
  Grant Evidence each rejected with InvalidAuthorizationEvidenceError;
- unrelated-permission, duplicate, partial, stale, and unverifiable evidence
  behavior;
- dense exact request `requiredPermissions` arrays, including sparse,
  decorated, hostile, duplicate, minimum, maximum, and request-array overflow
  cases, kept distinct from governed response grant-count validation;
- no caller-array mutation or freezing; and
- completeness/currentness and provenance guarantees.

#### Security Evaluation Context Authority Direct Matrix

In addition to the common matrix, direct tests must cover:

- anonymous and authenticated accepted Identity-derived subjects;
- each dimension independently as `available`, `unavailable`, and governed
  `not-applicable`;
- all-evaluable and each-unavailable-dimension combinations;
- malformed or caller-manufactured status;
- exact operation/action/resource response correspondence;
- caller inability to establish subject or status authority by matching shape;
- no raw Device, Session, Context, or Trust value exposure; and
- provenance guarantees for `available` and `not-applicable`.

#### Confirmation Evidence Authority Direct Matrix

In addition to the common matrix, direct tests must cover:

- absent and confirmed responses;
- exact operation, subject, action, and resource binding;
- cross-operation, wrong-subject, wrong-action, and wrong-resource candidates;
- malformed confirmation;
- standard and sensitive targets;
- no confirmation acquisition or UI behavior;
- deterministic output and caller non-mutation; and
- confirmed-evidence provenance.

### Authority Boundary Tests

Tests must prove:

- plain matching objects cannot enter Evaluate Authorization as governed facts;
- Core structural factories alone do not confer authority;
- only outputs received through the configured authority Contract call are
  admitted;
- malformed, hostile, throwing, and mismatched authority responses map to the
  specified failure;
- each authority response is read once and defensively reconstructed;
- operation/action/resource/subject/permission correspondence is exact;
- Skill-backed requirements copy all permissions from an admitted Registered
  Skill and cannot be weakened;
- sensitivity cannot be caller-selected or downgraded;
- arbitrary grant arrays are not accepted;
- available Grant Evidence is complete and relevant;
- partial/stale/unverifiable source results are unavailable;
- only the context authority can establish `available` or `not-applicable`;
- fabricated Context status and confirmation evidence are rejected; and
- authority-bearing artifacts cannot be reused across operations.

### Decision Table Tests

Tests must cover:

- standard zero-permission allow;
- one exact grant allow;
- multiple grants with AND semantics allow;
- each missing-grant position producing deny;
- anonymous zero-permission allow when every other condition is satisfied;
- explicit anonymous exact-grant allow;
- authenticated state supplying no implicit grant;
- unavailable requirements producing indeterminate;
- each unavailable Security dimension producing indeterminate;
- unavailable Grant Evidence producing indeterminate;
- sensitive exact confirmation with zero and multiple permissions allowing when
  all other conditions succeed;
- sensitive absent confirmation producing deny;
- standard confirmed evidence producing evidence failure;
- malformed, mismatched, and cross-operation confirmation producing evidence
  failure;
- zero-match complete available grants producing deny when permissions exist;
- closed reason and summary correspondence; and
- no unlisted fallback allow.

### Complete Authorization Decision Artifact Tests

For every row in the Decision Artifact Output-Invariant Table—including both
anonymous and authenticated examples where the subject differs—tests must
assert deep equality against the complete expected artifact. Partial assertions
of only `decision` or `reason` are insufficient.

Each expected artifact must assert:

- operation identifier;
- decision;
- complete subject;
- action;
- complete resource;
- requirements status;
- exact canonical evaluated-permission collection;
- sensitivity;
- all four exact Security dimension statuses;
- fixed policy ID and version;
- reason;
- grant-evidence status;
- confirmation status; and
- absence of every unapproved field.

Direct Authorization Decision Artifact factory tests must reject every
contradictory cross-product, including:

- each decision with an incompatible reason;
- unavailable requirements with non-empty permissions or available
  sensitivity;
- context-unavailable reason without an unavailable dimension;
- later-stage decisions with an unavailable dimension;
- grant-evidence-unavailable reason with available or not-evaluated grant
  status;
- standard sensitivity with `absent` or `confirmed` confirmation status;
- sensitive confirmation-required denial without `absent`;
- sensitive evaluated outcomes without `confirmed`;
- a stage-not-reached row without `not-evaluated`;
- incorrect policy literal; and
- any evidence-summary combination not present in the Output-Invariant Table.

Constructed artifact contradiction must produce InvalidSecurityStateError at
the final constructed-state stage and expose no partial artifact.

### Governed Security Evaluation Summary Factory Tests

The exported Core structural factory must be tested directly for:

- the exact valid Summary shape with no extra field;
- anonymous and authenticated subjects;
- each of `available`, `unavailable`, and `not-applicable` independently in
  each of context, device, session, and trust level;
- every missing field, explicitly `undefined` field, extra enumerable string
  field, and enumerable symbol;
- `null`, every primitive, function, array, coercible value, inherited
  substitute, and unaccepted custom prototype at each record position;
- hostile own keys, descriptors, getters, stateful getters, and Proxies,
  including revoked Proxies;
- exact one protected read per accepted property and no coercion;
- canonical prototypes, exact deterministic reconstruction, and deep freezing;
- source deep equality, source graph non-freezing, and no mutable graph
  retention; and
- structural validity conferring no Security authority.

### Authorization Evaluation Outcome Factory Direct Matrix

The exported Core `createAuthorizationEvaluationOutcome` factory, or its exact
repository-canonical equivalent, must be tested directly. Generic Core helper
coverage and transitive Security evaluation tests are insufficient.

The factory accepts exactly:

```text
{
  authorization: AuthorizationDecisionArtifact,
  securityEvaluationSummary: GovernedSecurityEvaluationSummary
}
```

It performs protected extraction, independently validates and defensively
reconstructs both nested values, rejects visible correspondence contradictions,
and returns the canonical deeply frozen Outcome. It establishes structural
validity only. It never registers provenance or mints Security authority.

#### Exact Valid and Envelope Cases

Direct tests must cover:

- one exact valid Outcome with exact own keys and canonical nested
  reconstruction;
- `null`, `undefined`, string, number, boolean, bigint, symbol, function, and
  array inputs;
- empty object;
- missing and explicitly `undefined` `authorization`;
- missing and explicitly `undefined` `securityEvaluationSummary`;
- every extra enumerable string field and enumerable symbol;
- inherited substitutes and prohibited custom prototypes;
- canonical Outcome and nested prototypes;
- complete deep freezing of the returned reconstruction;
- deep equality of caller Artifact/Summary graphs before and after;
- caller graphs, including every nested object/array, remaining unfrozen; and
- no caller graph retention.

Every malformed caller-supplied factory input, hostile extraction, or visible
Artifact/Summary contradiction maps to InvalidAuthorizationInputError. When
Security constructs and validates its own Outcome after all governed inputs
have succeeded, the same impossible condition is internal constructed-state
corruption and maps to InvalidSecurityStateError. No factory call produces
InvalidAuthorizationEvidenceError merely because a caller supplied a
non-authoritative but structurally valid pair.

#### Nested Artifact Cases

Direct tests must cover:

- malformed and hostile Artifact;
- Artifact own-property getter, stateful getter, descriptor trap, `ownKeys`
  trap, ordinary Proxy, and revoked Proxy;
- each complete Artifact invariant and canonical nested reconstruction;
- a structurally valid Artifact whose operation differs from the Summary;
- a structurally valid Artifact whose subject differs from the Summary; and
- independent context, device, session, and trust-level status mismatches.

#### Nested Summary Cases

Direct tests must cover:

- malformed and hostile Summary;
- extra Summary string field and enumerable symbol;
- malformed or hostile nested `securityContext`;
- invalid, missing, undefined, or extra status;
- inherited substitute and prohibited prototype;
- throwing getter, stateful getter, descriptor trap, `ownKeys` trap, ordinary
  Proxy, and revoked Proxy; and
- each accepted nested property being read exactly once.

#### Visible Correspondence and Authority Cases

The factory must reject independently structurally valid nested values when
their operation, subject, context, device, session, or trust-level visible
values differ. Each mismatch requires an independent direct test holding every
other field constant.

Visible equality is not provenance. Direct tests must prove:

```text
createAuthorizationEvaluationOutcome({
  authorization: validArtifact,
  securityEvaluationSummary: validSummary
})
  → canonical structurally valid frozen Outcome

verifyAuthorizationEvaluationOutcome(publiclyConstructedOutcome)
  → false
```

A genuine issued Outcome verifies `true`; a public reconstruction with the same
visible values, Outcome spread/clone, nested clone, and serialized/deserialized
reconstruction each verify `false`.

All success and failure cases must prove protected own-key/descriptor capture,
single reads, no coercion, no native exception leakage, caller deep
non-mutation, caller non-freezing, and privacy-safe failure messages.

### Authorization Evaluation Outcome Co-Issuance Tests

Every row of the existing Decision Artifact Output-Invariant Table must be
tested through Evaluate Authorization Outcome. Each test must assert complete
deep equality of:

- the unchanged Artifact;
- the exact Summary;
- the exact Outcome;
- operation and subject correspondence;
- all four independent status correspondences; and
- a `true` verifier result for the exact issued Outcome and operation.

Coverage includes every `allow`, `deny`, and `indeterminate` row. In particular,
requirements-unavailable must still resolve and validate governed Security
Evaluation Context, issue its exact Summary, and leave Grant Evidence and
Confirmation untouched. No partial assertion of decision, reason, or aggregate
availability is sufficient.

### Single Atomic Evaluation and Compatibility Tests

For each public evaluation Contract independently, direct counters/probes must
prove the following stage-aware rules:

- the Requirements Authority is invoked exactly once whenever evaluation
  proceeds past request validation into requirements resolution;
- the Security Evaluation Context Authority is invoked exactly once whenever
  evaluation reaches that stage;
- the Grant Evidence Authority is invoked exactly once when its stage is
  reached and exactly zero times when an earlier valid decision path terminates
  evaluation before that stage;
- the Confirmation Authority is invoked exactly once when its stage is reached
  and exactly zero times when an earlier valid path or standard-action semantics
  suppress that stage;
- every reached mandatory stage has count exactly one; every stage suppressed
  by an earlier valid short circuit has count exactly zero;
- exactly one fixed-policy evaluation;
- exactly one Artifact construction, Summary construction, Outcome
  construction, and provenance registration;
- no authority, policy evaluation, Artifact construction, Summary
  construction, Outcome construction, or provenance registration occurs twice;
  and
- identical decision/reason and complete visible Outcome semantics for
  equivalent governed inputs.

For every successful decision row, tests must assert the exact integer counts
in this matrix:

| Decision row / reason                                     | Requirements | Security Evaluation Context | Grant Evidence | Confirmation | Policy evaluation | Artifact construction | Summary construction | Outcome construction | Provenance registration |
| --------------------------------------------------------- | ------------ | --------------------------- | -------------- | ------------ | ----------------- | --------------------- | -------------------- | -------------------- | ----------------------- |
| `requirements-unavailable`                                | 1            | 1                           | 0              | 0            | 1                 | 1                     | 1                    | 1                    | 1                       |
| `security-context-unavailable`                            | 1            | 1                           | 0              | 0            | 1                 | 1                     | 1                    | 1                    | 1                       |
| `grant-evidence-unavailable`                              | 1            | 1                           | 1              | 0            | 1                 | 1                     | 1                    | 1                    | 1                       |
| standard zero / `no-permission-required`                  | 1            | 1                           | 1              | 1            | 1                 | 1                     | 1                    | 1                    | 1                       |
| standard all / `all-required-permissions-granted`         | 1            | 1                           | 1              | 1            | 1                 | 1                     | 1                    | 1                    | 1                       |
| standard missing / `missing-required-permission`          | 1            | 1                           | 1              | 1            | 1                 | 1                     | 1                    | 1                    | 1                       |
| sensitive absent / `confirmation-required`                | 1            | 1                           | 1              | 1            | 1                 | 1                     | 1                    | 1                    | 1                       |
| sensitive zero / `confirmation-and-permissions-satisfied` | 1            | 1                           | 1              | 1            | 1                 | 1                     | 1                    | 1                    | 1                       |
| sensitive all / `confirmation-and-permissions-satisfied`  | 1            | 1                           | 1              | 1            | 1                 | 1                     | 1                    | 1                    | 1                       |
| sensitive missing / `missing-required-permission`         | 1            | 1                           | 1              | 1            | 1                 | 1                     | 1                    | 1                    | 1                       |

The complete matrix must be asserted independently for:

1. the legacy Evaluate Authorization compatibility projection; and
2. Evaluate Authorization Outcome.

Generic `<= 1` assertions are insufficient for any reached mandatory stage.
These independent per-row assertions prove that both public Contracts delegate
exactly once to the same atomic semantic evaluation.

The legacy Evaluate Authorization test must use isolated observation seams to
prove this exact sequence before its Artifact becomes observable:

1. one atomic evaluation;
2. valid Artifact construction;
3. valid Summary construction from captured governed Context locals;
4. visible pair and complete Outcome validation;
5. successful private provenance registration and final invariant validation;
6. only then, return of the exact `outcome.authorization` projection.

The observation seam must not expose the hidden Outcome to production callers,
add Artifact-to-Outcome lookup, enumerate the registry, or introduce a
production fault control. Legacy Artifact results for all ten rows must remain
completely deeply equal to the active `1.0.0` expectations: no field, decision,
reason, status, prototype, ordering, or freezing behavior changes.

The Outcome Contract must prove the same sequence and return the exact full
Outcome from that single evaluation. An M9 composition test must use only this
Contract and prove one call obtains the Artifact, Summary, and verifiable
same-evaluation authority.

### Outcome Provenance Tests

Direct tests must prove:

- the genuine aggregate Outcome and its exact pair verify;
- same-shaped fabricated Outcome, Artifact, and Summary values do not verify;
- an Outcome clone, Artifact clone, Summary clone, both nested clones, spread
  copy, and serialized/reconstructed copy do not verify;
- Artifact A plus Summary B and Artifact B plus Summary A do not verify;
- cross-evaluation mixing fails even when every visible value is identical;
- authority from Security instance/runtime A fails at instance/runtime B;
- operation equality, subject equality, four-status equality, Core factories,
  TypeScript brands, and matching frozen shapes never substitute for identity
  provenance;
- genuine authority remains valid after attempted source mutation;
- failed issuance creates no verifiable Outcome and no partial authority; and
- no registry, minting hook, identity token, fault flag, or enumeration
  capability is publicly exported.

### Summary Correspondence and Temporal Tests

Tests must independently corrupt or substitute each visible correspondence and
prove rejection:

- wrong operation;
- wrong subject;
- context-status mismatch;
- device-status mismatch;
- session-status mismatch; and
- trust-level-status mismatch.

Each status test holds the other three statuses constant. Tests must establish
the Summary expected values from captured governed Context facts, not from the
Artifact. Matching all four statuses with exact same-evaluation authority must
verify.

Counters/probes must prove no Context, Device, Session, or Trust source is
queried after evaluation, during verification, or merely for Summary
construction beyond the existing governed Context invocation. Later mutation
or revision of every source fixture must leave the issued Summary unchanged.
No test may depend on time, expiry, revalidation, or freshness extension.

### Verify Authorization Evaluation Outcome Direct Matrix

The verifier Contract requires direct coverage for:

- the exact genuine request, deterministic primitive boolean, synchrony, and
  repeated read-only verification;
- every missing and explicitly `undefined` envelope field, extra enumerable
  string field, enumerable symbol, invalid intent, and invalid operation;
- `null`, every primitive, function, array, inherited substitute, coercible
  value, and unaccepted prototype as the envelope;
- hostile envelope and candidate own keys, descriptors, getters, stateful
  getters, Proxies, and revoked Proxies;
- exact one protected read per accepted envelope and candidate property;
- fabricated, cloned, reconstructed, cross-paired, cross-evaluation, and
  cross-instance candidates;
- malformed envelope mapping to InvalidAuthorizationInputError;
- invalid candidate authority returning `false` without a native exception;
- private-state/native failure mapping to InvalidSecurityStateError through an
  isolated test-only seam;
- request and candidate non-mutation, non-freezing, and non-retention;
- no policy recomputation or configured authority invocation;
- verification before Running and after Stopping/Stopped for already issued
  authority; and
- privacy-safe failures and diagnostics with no candidate contents, identifier,
  status detail, registry state, or native message.

### Outcome Failure, Precedence, and Recovery Tests

Objective counters and hostile probes must prove:

1. all existing evaluation precedence remains unchanged;
2. lifecycle/pre-existing failure beats a hostile request for either public
   evaluation Contract;
3. either invalid public request envelope beats every authority Contract;
4. Summary construction begins only after a valid Artifact and governed Context
   exist;
5. no later authority is called merely to populate a Summary;
6. Summary construction failure exposes no Summary, Outcome, or authority;
7. Artifact/Summary correspondence failure precedes Outcome construction;
8. Outcome construction failure precedes issuance-record preparation;
9. record-preparation failure precedes the sole provenance-map insertion;
10. provenance insertion failure exposes no partial authority;
11. failure of the post-registration final invariant deletes the exact entry
    before InvalidSecurityStateError is exposed;
12. malformed verifier envelope leaves a hostile candidate untouched;
13. candidate invalidity does not expose or mutate private registry state;
14. no native exception crosses either evaluation Contract or the verifier; and
15. the Engine remains usable for a normal evaluation after representative
    Summary, Outcome, provenance, and verifier failures.

Separate isolated tests must inject Summary construction, Outcome construction,
record preparation, insertion, deletion, and final-invariant failure. Each must
prove no public result or verifiable partial authority, followed by a successful
normal evaluation unless the injected case represents pre-existing corrupted
private state. Internal corruption tests use isolated test-only mechanisms.
Production exports, constructor fault options, environment switches, and
module-global mutable test state are prohibited.

### Precedence Tests

Objective hostile-boundary tests must prove:

1. lifecycle or pre-existing state beats a hostile request without touching it;
2. invalid envelope beats hostile target values;
3. invalid target beats every authority Contract;
4. requirements failure beats context, grants, and confirmation;
5. valid unavailable requirements still permits governed Context validation
   needed to construct the subject-bearing artifact, then produces the required
   indeterminate result without invoking Grant Evidence or Confirmation;
6. context failure beats grants and confirmation;
7. valid unavailable context produces indeterminate without invoking grants or
   confirmation;
8. Grant Evidence failure beats confirmation;
9. valid unavailable Grant Evidence produces indeterminate without invoking
   confirmation;
10. confirmation failure beats policy construction;
11. policy evaluation occurs only after every required stage succeeds; and
12. Artifact construction, Summary construction, visible correspondence,
    Outcome construction, provenance registration, final invariant validation,
    and public projection occur in the exact shared atomic order.

Tests must use isolated test-module mechanisms for pre-existing and
constructed-state corruption. No production export, constructor fault flag,
environment switch, or mutable global test control is permitted.

### Immutability and Non-Mutation Tests

For allow, deny, indeterminate, every invalid-input category, every authority
failure, lifecycle failure, pre-existing corruption, and constructed-state
failure, tests must prove:

- caller and authority inputs are deeply equal before and after;
- no fields are added or removed;
- caller arrays retain their order and remain unfrozen;
- no caller object is frozen;
- successful results and every nested value are actually frozen; and
- evaluation retains no mutable caller graph.

### Lifecycle and Determinism Tests

Tests must prove:

- operations reject before Running;
- Running permits evaluation;
- Stopping and Stopped reject without request inspection;
- new instances have isolated lifecycle and collaborators;
- no enumerable operation registry, decision history, Artifact lookup, or
  retained evaluation-local graph exists beyond the private weak Outcome
  provenance association;
- synchronous return/throw behavior;
- identical inputs and authority results produce deeply equal visible Artifact,
  Summary, and Outcome content while each evaluation identity remains distinct;
- no time, random, locale, environment, filesystem, network, or process-global
  semantic influence; and
- evaluation does not mutate process-local authority fixtures.

### Architecture Tests

The production graph and isolated negative fixtures must prove:

- Core cannot depend outward on Security;
- Security depends only on Core;
- Security cannot depend on Bootstrap or Infrastructure;
- Security cannot depend on any current or future Engine implementation;
- Security cannot depend on external runtime packages;
- authority fixtures expose only Core Contract dependencies;
- no cycle exists; and
- each negative fixture fails for its intended exact rule.

### Diagnostics and Privacy Tests

At debug, info, warn, and error thresholds, tests must prove the mandatory M8
diagnostic remains visible and contains no operation, subject, action, resource,
permission, grant, confirmation, Context value, raw request, hostile value,
token, credential, policy internals, or execution claim.

### Revision 1.0.0 Regression Tests

All existing M8 normative tests remain mandatory. Explicit regression proof must
show unchanged:

- exact Evaluate Authorization request and Artifact success shape;
- all ten decision-table and Artifact output-invariant rows;
- decision/reason compatibility and precedence;
- zero-permission and permission-AND behavior;
- anonymous/authenticated, sensitivity, confirmation, and Grant Evidence
  semantics;
- the three-class public failure taxonomy;
- lifecycle and hostile-input precedence;
- complete Artifact validation;
- caller/source non-mutation and Artifact immutability;
- diagnostics and privacy behavior; and
- the Security-to-Core-only production dependency graph.

## Acceptance Criteria

Active revision `1.1.0` was formally approved after confirming:

1. Active `1.0.0` behavior is preserved and every additive `1.1.0` semantic is
   implementation-ready without invention.
2. Security is the sole authorization semantic owner.
3. The public request cannot inject authority-bearing artifacts.
4. All four configured authority Contracts are synchronous, source-neutral, and
   provenance-bearing by call path.
5. Plain shape-valid objects and TypeScript branding cannot confer authority.
6. Skill-backed requirements cannot omit or replace declared permissions.
7. Sensitivity and `not-applicable` cannot be caller-selected.
8. Available Grant Evidence is complete, relevant, and operation-current.
9. Identity, Device, Session, Context, Permissions, and Trust Level are
   explicitly accounted for.
10. The exact decision table produces only allow, deny, or indeterminate.
11. Deny and indeterminate are successful artifacts, not failures.
12. Public failures are exactly the three specified classes.
13. Validation precedence and hostile-boundary non-inspection are proven.
14. Every result is deeply immutable and every caller input remains unchanged.
15. Operation correspondence and non-reuse semantics are preserved.
16. Evaluation is synchronous, deterministic, atomic, and stateless between
    calls.
17. Diagnostics are privacy-safe at every required log threshold.
18. Security has only a Core runtime dependency and architecture fixtures cover
    every forbidden direction.
19. No execution, enforcement, persistence, Event, Provider, Adapter, IAM, or
    external integration is introduced.
20. All accepted M0–M7 behavior and semantics remain unchanged.
21. The unchanged Artifact and exact Summary are co-issued in one exact Outcome
    for every successful decision row.
22. The private per-instance Outcome `WeakMap` and exact nested identity record
    prove same-evaluation provenance.
23. Clones, reconstruction, serialization, cross-pairs, cross-evaluation pairs,
    and cross-instance authority fail verification.
24. Summary construction uses only the exact governed Context locals and never
    the Artifact or a currentness re-query.
25. Outcome issuance is atomic and exposes no partial authority.
26. The read-only verifier has complete Contract metadata, failure
    normalization, lifecycle semantics, and hostile-runtime coverage.
27. No existing Artifact field, decision row, reason, public error class,
    authority order, or dependency is changed.
28. Both public evaluation Contracts invoke one shared atomic
    Outcome-producing semantic primitive exactly once.
29. The legacy Contract returns its Artifact only after complete Outcome
    issuance and exposes no lookup for the hidden Outcome.
30. M9 and other protected-enforcement consumers use the Outcome Contract
    directly and never evaluate the same operation first through the legacy
    projection.
31. The direct Outcome factory matrix proves visible consistency, hostile-safe
    construction, non-mutation, deep freezing, and the absence of authority
    minting.

## Explicitly Deferred

M8 explicitly defers:

- protected execution and enforcement implementation;
- Skill invocation, loading, installation, selection, and result normalization;
- executable Planning steps and Planning-to-Skill binding;
- Brain cognitive orchestration;
- confirmation acquisition, UI, biometrics, PIN, or transport;
- operation identifier allocation;
- persistent or distributed operation uniqueness;
- cryptographic evidence, signing, nonce generation, and replay protection;
- Device, Session, Trust Level, location, risk, or authentication-level value
  models;
- configurable policy, policy DSL, policy administration, roles, groups,
  hierarchy, wildcard, delegation, or override;
- grant expiry, revocation propagation, temporal evaluation, and external IAM;
- policy, grant, decision, or audit persistence;
- Security Events, audit Events, and Event runtime;
- Providers, Adapters, databases, files, networks, SDKs, and integrations;
- authorization artifact transport across runtimes; and
- production enforcement infrastructure.

## Open Questions

No implementation-critical semantic question remains for the M8 slice or this
Active `1.1.0` Summary specialization.

Future milestones must separately authorize execution enforcement, distributed
artifact protection, concrete Device/Session/Trust models, confirmation
acquisition, persistent grant sources, configurable policy, and audit Events.
Those questions do not change M8 authorization evaluation semantics.

## Revision Impact

With formal review and promotion complete:

- Core requires the exact Summary and Outcome schemas and the two new
  synchronous Contracts;
- Security runtime requires Summary construction, Outcome co-issuance, the
  private per-instance provenance map, and verifier behavior specified here;
- CONCEPT-0005 requires an additive revision making the governed Summary part of
  protected Skill enforcement authority; and
- ENGINE-0010 requires a later specialization of request shape, precedence,
  correspondence, failure mapping, hostile-safe extraction, and direct tests.

Neither downstream revision may treat the Artifact as its own source of
expected Security statuses. This promotion does not authorize M9 implementation
to resume before those authorities are approved.

## Change History

| Version | Status | Date       | Change                                                                                                                                                                                                                                  |
| ------- | ------ | ---------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `1.1.0` | Active | 2026-07-28 | Formally approved the Governed Security Evaluation Summary, one atomic Outcome-producing evaluation behind both public projections, private same-evaluation provenance, read-only verification, and direct Summary/Outcome test models. |
| `1.0.0` | Active | 2026-07-27 | Approved initial M8 Security Engine authorization-decision vertical slice.                                                                                                                                                              |

## Related Documents

- [Documentation Authority](../../../docs/DOCUMENT-AUTHORITY.md)
- [Architecture](../../../docs/architecture.md)
- [Engineering Principles](../../../docs/principles.md)
- [ADR-0001 — Core Ownership and Dependency Direction](../../../docs/adr/ADR-0001-Core-Ownership-and-Dependency-Direction.md)
- [ADR-0002 — Capability-Oriented Architecture](../../../docs/adr/ADR-0002-Capability-Oriented-Architecture.md)
- [ADR-0003 — Engine Communication Model](../../../docs/adr/ADR-0003-Engine-Communication-Model.md)
- [OES-0002 — Engine Design](../../../docs/engineering/OES-0002-Engine-Design.md)
- [OES-0004 — Contracts](../../../docs/engineering/OES-0004-Contracts.md)
- [OES-0009 — Security Standards](../../../docs/engineering/OES-0009-Security-Standards.md)
- [CONCEPT-0004 — Authorization Model](../../concepts/CONCEPT-0004-Authorization-Model.md)
- [ENGINE-0001 — Brain Engine](../ENGINE-0001-Brain-Engine.md)
- [ENGINE-0002 — Identity Engine](../identity/ENGINE-0002-Identity-Engine.md)
- [ENGINE-0003 — Context Engine](../context/ENGINE-0003-Context-Engine.md)
- [ENGINE-0006 — Reasoning Engine](../reasoning/ENGINE-0006-Reasoning-Engine.md)
- [ENGINE-0007 — Planning Engine](../planning/ENGINE-0007-Planning-Engine.md)
- [ENGINE-0008 — Skill Engine](../skill/ENGINE-0008-Skill-Engine.md)
- [FLOW-0001 — Voice Interaction](../../flows/conversation/FLOW-0001-Voice-Interaction.md)

## Engineering Motto

> Identity establishes the subject. Governed evidence informs Security.
> Security decides. Protected boundaries enforce.
