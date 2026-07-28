# CONCEPT-0004 — Authorization Model

| Field          | Value                                                   |
| -------------- | ------------------------------------------------------- |
| **Status**     | Active                                                  |
| **Version**    | 1.0.0                                                   |
| **Owner**      | O.R.I.O.N. Architecture                                 |
| **Created**    | 2026-07-27                                              |
| **Updated**    | 2026-07-27                                              |
| **Applies To** | Security, protected actions, and authorization evidence |

---

# Purpose

This specification defines the minimum technology-independent authorization
model required for O.R.I.O.N. to decide whether one subject may perform one
protected action against one authorization resource.

It closes the semantic gap between:

- Identity, which answers who the current actor is;
- capability-owned declarations of required permissions;
- Security, which owns authorization-decision semantics; and
- a future protected execution boundary, which enforces a Security-owned
  decision without becoming the policy owner.

This document does not define a Security Engine implementation. It provides the
conceptual authority required for a later Engine specification to define exact
Core-custodied values, Contracts, failures, lifecycle behavior, runtime bounds,
and tests without inventing authorization semantics.

# Authority and Status

This document is an Active Concept Specification. It governs the authorization
concepts within its scope subject to the higher-authority ADRs and Architecture
Specifications identified in
[Documentation Authority](../../docs/DOCUMENT-AUTHORITY.md).

Existing authority already establishes that:

- Security Engine owns security-policy and authorization-decision semantics;
- Identity does not imply authorization;
- permission declarations do not imply permission grants;
- protected boundaries enforce Security-owned decisions;
- enforcement does not transfer Security ownership; and
- Core custody of shared values and Contracts does not transfer capability
  behavior to Core.

# Scope

This model defines:

- authorization subjects derived from accepted Identity semantics;
- protected actions and authorization resources;
- required-permission semantics;
- source-independent permission grants and grant evidence;
- a minimal fixed authorization policy;
- confirmation evidence for sensitive actions;
- `allow`, `deny`, and `indeterminate` decisions;
- a deterministic decision table;
- an immutable authorization decision artifact;
- denial versus evaluation-failure semantics;
- ownership and enforcement boundaries; and
- requirements that a future Security Engine specification must preserve.

# Non-Goals

This model does not define:

- authentication mechanisms;
- users, accounts, roles, groups, organizations, tenants, or memberships;
- role-based, attribute-based, relationship-based, or claims-based policy
  languages;
- OAuth, OpenID Connect, JWT, LDAP, cloud IAM, or external entitlement systems;
- credential, token, secret, or key management;
- policy authoring, administration, distribution, persistence, or migration;
- grant persistence, long-term revocation propagation, temporal expiry, or
  lease renewal;
- device, session, location, trust-score, or risk-score value models beyond the
  governed availability states defined here;
- user-interface confirmation acquisition;
- Skill selection, Planning binding, invocation, or execution;
- event publication, audit storage, or compliance reporting;
- distributed authorization, cryptographic decision signing, replay protection,
  or cross-runtime decision transport;
- a database, repository implementation, Provider, Adapter, or external
  integration; or
- a complete enterprise identity and access-management system.

# Ownership

## Security Ownership

Security is the sole semantic owner of:

- authorization policy;
- protected-action sensitivity classification;
- permission-grant evaluation;
- authorization decision categories and reasons;
- confirmation-evidence sufficiency for authorization;
- authorization decision artifacts; and
- the rule determining whether an action is authorized.

## Core Custody

Core may custody the shared immutable schemas, identifiers, value factories,
Contracts, and failure definitions needed to express this model.

Core custody does not make Core the owner of Security behavior. Core must not
evaluate authorization policy or perform enforcement.

## Other Capability Ownership

- Identity remains owner of Current Identity and authentication semantics.
- A capability remains owner of the action it requests and of its authoritative
  permission-requirement declaration.
- Skill packages remain owners of their business workflows.
- Brain owns cognitive orchestration.
- Planning owns advisory planning semantics.
- A protected execution boundary owns enforcement mechanics, not authorization
  policy.

# Terminology

## Authorization

Authorization is the Security-owned evaluation answering:

> May this subject perform this protected action against this authorization
> resource under the supplied authoritative permission and confirmation
> evidence?

Authorization does not authenticate the subject, choose the action, select a
Skill, acquire confirmation, or execute the action.

## Protected Action

A Protected Action is one immutable description of behavior that requires a
Security-owned authorization decision before a protected boundary may perform
it.

A caller identifies a proposed Protected Action by one Authorization Operation
Identifier, one Authorization Action Identifier, and one Authorization Resource.
Those caller-supplied identifiers identify the evaluation target but do not
establish authoritative permission requirements or sensitivity.

The action contains no invocation arguments, executable reference, Provider or
Adapter reference, transport metadata, credentials, or execution payload.

## Authority-Bearing Artifacts

The minimal model distinguishes ordinary structurally valid data from governed
authority-bearing artifacts.

An object does not become authoritative merely because it has the same fields as
a governed artifact, passes a public factory, carries a TypeScript brand, or was
supplied by orchestration.

Authority-bearing status is established only by the applicable governed
source-neutral boundary:

- Protected Action Requirements Authority Boundary;
- Grant Evidence Authority Boundary; or
- Security Evaluation Context Authority Boundary.

Confirmed Confirmation Evidence must likewise originate from an authorized
confirmation boundary outside Security.

A future Engine specification may preserve this distinction through
Core-custodied opaque values, Engine-owned creation Contracts, source-neutral
authority Contracts, or an equivalent runtime-safe mechanism. The
implementation mechanism must not weaken the semantic distinction established
here.

All governed artifacts are immutable, defensively reconstructed, and bound to
one Authorization Operation Identifier. They cannot be reclassified as
authority-bearing by an arbitrary caller.

## Authorization Operation Identifier

An Authorization Operation Identifier binds one authorization evaluation and
its artifacts to exactly one proposed protected operation.

It must correspond exactly across:

- the Authorization Evaluation Request;
- Protected Action Requirements resolution;
- Grant Evidence;
- Security Evaluation Context;
- Confirmation Evidence when confirmed;
- the Authorization Decision Artifact; and
- the future protected enforcement request.

It is:

- opaque;
- compared using exact case-sensitive equality;
- preserved without trimming, normalization, coercion, or semantic parsing;
- unique within the allocating orchestration runtime for the lifetime of that
  runtime; and
- never reused for another protected operation, even when subject, action, and
  resource are otherwise identical.

It does not imply a timestamp, cryptographic nonce, database key, Provider
transaction identifier, globally persisted identity, or durable execution
identity.

Protected orchestration owns allocation of the operation identifier. Allocation
must be deterministic under controlled test inputs and collision-free within
the runtime scope. Cryptographic randomness is not required.

The normative bound is 1–128 ASCII characters matching:

```regex
^[A-Za-z0-9][A-Za-z0-9._:-]{0,127}$
```

This model defines the operation-identifier format because no higher-authority
format exists.

## Protected Action Requirements

Protected Action Requirements is one governed immutable artifact binding:

```text
{
  operationId: AuthorizationOperationIdentifier,
  action: AuthorizationActionIdentifier,
  resource: AuthorizationResource,
  requiredPermissions: SkillPermissionIdentifier[],
  sensitivity: "standard" | "sensitive"
}
```

It states the complete authoritative permission requirements and
Security-owned sensitivity classification for the exact operation, action, and
resource.

Protected Action Requirements has exact operation, action, and resource
correspondence. It cannot be reused for another operation or target.

Requirements resolution has exactly two governed outcomes:

```text
Available Protected Action Requirements
{
  status: "available",
  requirements: ProtectedActionRequirements
}
```

```text
Unavailable Protected Action Requirements
{
  status: "unavailable",
  operationId: AuthorizationOperationIdentifier,
  action: AuthorizationActionIdentifier,
  resource: AuthorizationResource
}
```

`unavailable` means complete authoritative requirements or sensitivity could not
be established. It leads to `indeterminate`, never `allow` or `deny`.

### Protected Action Requirements Authority Boundary

The mandatory source-neutral Protected Action Requirements Authority Boundary:

- receives the proposed operation, action, and resource identity;
- derives the complete permission-requirement set from the capability-owned
  authoritative declaration;
- establishes the Security-owned sensitivity category;
- returns available or unavailable governed requirements;
- prevents caller-supplied arbitrary requirements or sensitivity from acquiring
  authority; and
- exposes no persistence, registry, Provider, Adapter, or external-system
  detail.

For a Skill-backed action, it must derive the complete permission set from the
admitted Registered Skill manifest. No caller may omit, replace, or weaken a
permission declared by that manifest.

The authority boundary may be implemented later using existing Core-custodied
catalog Contracts and Security-owned classification behavior. It must not
source-depend on another Engine implementation. Discovery mechanics,
classification registry, persistence, and installation remain deferred.

## Authorization Subject

An Authorization Subject is the minimum immutable Security-consumable
projection of one accepted Current Identity.

It has exactly one of two semantic forms:

```text
Anonymous Authorization Subject
{
  kind: "anonymous"
}
```

```text
Authenticated Authorization Subject
{
  kind: "authenticated",
  identityId: IdentityIdentifier
}
```

An authenticated subject must reuse the exact accepted Identity Identifier. It
must not contain a role, permission, trust level, session, token, credential,
profile, or authorization result.

An anonymous subject represents the accepted anonymous Current Identity. It is
not an authentication failure, fabricated guest account, wildcard identity, or
implicit denial.

Security may defensively reconstruct this projection from a validated Current
Identity supplied through a Core-custodied Contract. It must not redefine
authentication or inspect Identity-provider evidence.

## Authorization Action Identifier

An Authorization Action Identifier identifies the semantic action being
authorized. It is not:

- a Skill Identifier;
- a permission;
- an executable method name;
- a Provider operation;
- an endpoint;
- a transport route; or
- an invocation payload.

Action equality is exact and case-sensitive. No trimming, case folding, Unicode
normalization, coercion, alias expansion, hierarchy, prefix matching, or
wildcard matching is permitted.

The normative bound is:

- 3–128 ASCII characters;
- dotted lowercase segments;
- each segment begins and ends with a lowercase ASCII letter or digit;
- hyphen is permitted only inside a segment; and
- at least one dot is required.

The corresponding proposed grammar is:

```regex
^[a-z0-9](?:[a-z0-9-]*[a-z0-9])?(?:\.[a-z0-9](?:[a-z0-9-]*[a-z0-9])?)+$
```

Examples include `skill.invoke`, `memory.delete`, and `automation.execute`.

## Authorization Resource

An Authorization Resource identifies what the protected action applies to.

Every Protected Action must contain exactly one Authorization Resource. The
resource has exactly one of two forms:

```text
Unscoped Authorization Resource
{
  kind: "unscoped"
}
```

```text
Identified Authorization Resource
{
  kind: "identified",
  resourceId: AuthorizationResourceIdentifier
}
```

`unscoped` is an explicit neutral value meaning that the action does not target
one individually identified resource in this model. It is not a wildcard and
does not match an identified resource.

An Authorization Resource Identifier is opaque Security comparison data. It
must not be parsed to infer ownership, permission, resource type, Provider,
Adapter, endpoint, tenant, or storage location.

Resource equality is exact, case-sensitive structural equality. An unscoped
resource equals only another unscoped resource. Identified resources are equal
only when their preserved identifiers are exactly equal.

The normative bound for an Authorization Resource Identifier is:

- 1–128 ASCII characters;
- first character is an ASCII letter or digit;
- remaining characters are ASCII letters, digits, `.`, `_`, `:`, `/`, or `-`;
- no whitespace, control character, wildcard, trimming, normalization, or
  coercion.

The corresponding proposed grammar is:

```regex
^[A-Za-z0-9][A-Za-z0-9._:/-]{0,127}$
```

# Required Permissions

A required permission states that the protected action requires a corresponding
active Permission Grant for the exact Authorization Subject and Authorization
Resource.

Required permissions:

- use the accepted M7 Skill Permission Identifier;
- are requirements, not grants;
- do not imply that the declaring Skill or calling component is authorized;
- use exact case-sensitive equality;
- have no wildcard, prefix, hierarchy, implication, or alias semantics;
- are semantically unordered;
- must be unique; and
- use logical AND when more than one is present.

The trusted required-permission collection exists only inside available
governed Protected Action Requirements. An Authorization Evaluation Request
caller does not supply a second trusted permission collection.

For a Skill-originated action, the Protected Action Requirements Authority
Boundary derives the collection from the admitted Registered Skill manifest. A
caller cannot remove, replace, or weaken declared requirements.

This model permits zero required permissions. Zero requirements means that
permission grants do not prevent authorization. It does not bypass sensitivity
or confirmation rules.

The collection bound is 0–64 entries, inherited from the accepted M7 manifest
permission bound. Successful public representations must canonically order the
identifiers using locale-independent code-point ordering.

# Permission Grants

## Definition

A Permission Grant is one immutable Security-domain fact stating:

> This exact Authorization Subject holds this exact permission for this exact
> Authorization Resource within the supplied grant-evidence snapshot.

A Permission Grant contains exactly:

```text
{
  subject: AuthorizationSubject,
  permission: SkillPermissionIdentifier,
  resource: AuthorizationResource
}
```

A grant is not:

- a credential or authentication claim;
- a token;
- a role;
- a group membership;
- a Provider payload;
- a database record;
- an OAuth scope;
- a JWT claim;
- a Skill declaration;
- a policy decision; or
- proof that an action was executed.

Grant matching requires exact structural subject equality, exact permission
equality, and exact resource equality.

Authentication never manufactures a grant. An anonymous subject can hold a
permission only when authoritative grant evidence explicitly contains a grant
for the anonymous subject.

## Scope

The minimal model supports only exact-resource grants:

- an unscoped grant matches only an unscoped action;
- an identified-resource grant matches only the same identified resource.

Resource hierarchies, global-resource grants, descendant scopes, conditions,
delegation, and wildcard scopes are deferred.

## Expiry, Revocation, and Freshness

Individual grant expiry and revocation fields are not part of the minimal
model. The governed Grant Evidence Authority Boundary is responsible for
returning evidence that is complete and current enough for exactly one bound
authorization operation.

For M8, `current enough` means:

- produced by the governed authority boundary for the same Authorization
  Operation Identifier;
- complete for that operation's exact subject, action, resource, and required
  permission set; and
- not reused for another operation.

The minimum model does not define how the authority boundary establishes
currentness internally. Persistence, cache invalidation, long-term revocation
propagation, timestamps, clocks, and distributed freshness are deferred.

# Grant Evidence

Permission Grant Evidence is the governed source-neutral result of attempting to
obtain the relevant grants for one bound authorization operation.

It has exactly one of two forms:

```text
Available Permission Grant Evidence
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

```text
Unavailable Permission Grant Evidence
{
  status: "unavailable",
  operationId: AuthorizationOperationIdentifier,
  subject: AuthorizationSubject,
  action: AuthorizationActionIdentifier,
  resource: AuthorizationResource,
  evaluatedPermissions: SkillPermissionIdentifier[]
}
```

Available evidence means the governed authority boundary completed the relevant
grant evaluation and the supplied grant collection is authoritative, complete,
and current enough for the exact bound operation, subject, action, resource, and
required-permission set.

Unavailable evidence means authoritative evidence could not be obtained or its
completeness or operation-scoped currentness could not be established. It is not
an empty grant set and must never be converted to denial.

For available evidence:

- the collection contains 0–64 grants;
- grants must be unique by exact subject, permission, and resource;
- grants must concern only the evaluated subject and resource;
- grants with permissions not present in the required-permission collection are
  invalid evidence rather than ignored input;
- declaration order is irrelevant;
- accepted output is canonically ordered by permission identifier; and
- no grant-source implementation details may be present.

Partial evidence is never `available`. Missing a grant from complete available
evidence may produce `deny`; missing a grant from unavailable or incomplete
evidence produces `indeterminate`.

Grant Evidence must exactly correspond to the Authorization Evaluation Request
and available Protected Action Requirements. Any operation, subject, action,
resource, or evaluated-permission mismatch is invalid authorization evidence.

## Grant Evidence Authority Boundary

The mandatory source-neutral Grant Evidence Authority Boundary:

- receives the operation identifier, authoritative subject, action, resource,
  and complete required-permission set;
- obtains or evaluates relevant grant facts without exposing its implementation;
- returns exactly one immutable available or unavailable governed Grant Evidence
  artifact;
- guarantees completeness and operation-scoped currentness when available;
- represents partial, stale, unverifiable, or unobtainable evidence as
  unavailable;
- prevents arbitrary caller-created grant arrays from acquiring authority; and
- never makes the final authorization decision.

Security validates governed evidence and applies policy. The evidence authority
supplies authoritative facts without acquiring Security decision ownership.

The boundary requires no database, file, LDAP, OAuth, JWT, Provider, Adapter, or
external IAM implementation. M8 may use a deterministic process-local
implementation composed through Core-custodied Contracts.

# Security Context

OES-0009 requires authorization evaluation to account for Identity, Device,
Session, Context, Permissions, and Trust Level.

The minimal model represents those inputs through one governed immutable
Security Evaluation Context bound to the operation:

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

Permission requirements and grants are represented separately by governed
Protected Action Requirements and Grant Evidence.

Security Dimension Status has exactly three categories:

- `available` — the applicable authority supplied sufficient current facts for
  this dimension and operation;
- `unavailable` — required authoritative facts could not be established; or
- `not-applicable` — the governed Security Evaluation Context Authority Boundary
  determined that this dimension does not apply to this exact operation under
  the minimal policy.

`not-applicable` is an authoritative Security assessment, not a caller default.
An arbitrary caller cannot mark a dimension not applicable. It is neither
equivalent to unavailable nor a fabricated neutral fact.

The Authorization Subject must derive from accepted Current Identity semantics,
directly or from the matching immutable Identity Context projection. The
Security Evaluation Context Authority Boundary does not redefine Identity.

The current accepted runtime has no authoritative Device, Session, or Trust
Level value model. Those dimensions therefore resolve to `unavailable` unless
the governed authority boundary can establish `not-applicable` for the exact
operation. They must not silently become available or safe.

The accepted Active Context Revision may support `context: available` when the
authority boundary receives a valid current projection for the operation.
Missing required Context produces `unavailable`.

The minimal policy permits `allow` only when every Security dimension is either
`available` or governed `not-applicable`. If any dimension is `unavailable`, the
decision is `indeterminate` with reason `security-context-unavailable`.

Consequently, M8 cannot produce `allow` merely from Identity and permission
facts while Device, Session, or Trust Level remains ungoverned. It can produce
`allow` only when every such dimension is authoritatively available or
authoritatively not applicable.

## Security Evaluation Context Authority Boundary

The mandatory source-neutral Security Evaluation Context Authority Boundary:

- receives the exact operation, subject, action, and resource;
- derives the subject from accepted Identity facts;
- evaluates the applicability and availability of Context, Device, Session, and
  Trust Level for that operation;
- returns one immutable operation-bound governed artifact;
- prevents arbitrary callers from asserting `available` or `not-applicable`;
- fabricates no missing facts; and
- exposes no Provider, Adapter, storage, transport, credential, or raw Context
  payload.

M8 requires the governed status artifact, not Device, Session, or Trust provider
implementations. Future value models and sources may extend the authority
boundary without changing the three status categories.

# Sensitive Actions

Every Protected Action contains exactly one sensitivity category:

- `standard`;
- `sensitive`.

Sensitivity is a Security-owned governed requirement fact supplied only by
available Protected Action Requirements. The Authorization Evaluation Request
does not contain an independently caller-selected sensitivity field.

The capability requesting an action may identify the action but cannot
unilaterally classify it or downgrade `sensitive` to `standard`.

The minimum model defines no classification registry or storage. The Protected
Action Requirements Authority Boundary establishes the category for the bound
operation.

A `sensitive` action requires matching Confirmation Evidence in addition to
every required Permission Grant. Permission grants and confirmation evidence
are independent. Neither substitutes for the other.

# Confirmation Evidence

Confirmation is a human-interaction and orchestration activity. Security does
not own the user interface, voice prompt, biometric prompt, mobile approval
flow, or transport used to acquire confirmation.

Security owns the rule determining whether supplied confirmation evidence is
sufficient for authorization.

Confirmation input has exactly one of two forms:

```text
Absent Confirmation Evidence
{
  status: "absent"
}
```

```text
Confirmed Confirmation Evidence
{
  status: "confirmed",
  operationId: AuthorizationOperationIdentifier,
  subject: AuthorizationSubject,
  action: AuthorizationActionIdentifier,
  resource: AuthorizationResource
}
```

Confirmed evidence is sufficient only when its operation identifier, subject,
action, and resource exactly equal the Authorization Evaluation Request and all
governed artifacts.

Confirmation Evidence authority originates at an authorized confirmation
boundary outside Security. Constructing an ordinary object with these fields
does not establish confirmation.

For a standard action, confirmation evidence must be `absent`. Unexpected
confirmation evidence is invalid authorization evidence rather than an
additional grant.

For a sensitive action:

- absent confirmation produces `deny` with reason `confirmation-required`;
- matching confirmed evidence allows permission evaluation to continue; and
- malformed confirmed evidence or a confirmed artifact with any mismatched
  operation, subject, action, or resource is invalid authorization evidence,
  not denial.

Confirmation from another operation is never valid, even when subject, action,
and resource are otherwise identical.

Confirmation expiry, revocation, acquisition, cryptographic proof, distributed
replay protection, and cross-runtime transport are deferred. Exact operation
binding prevents semantic reuse within the minimal process-local model.

# Authorization Evaluation Request

An Authorization Evaluation Request identifies one evaluation target and
supplies the governed inputs needed by Security.

Conceptually it contains:

```text
{
  operationId: AuthorizationOperationIdentifier,
  action: AuthorizationActionIdentifier,
  resource: AuthorizationResource,
  requirementsResolution: ProtectedActionRequirementsResolution,
  grantEvidence: PermissionGrantEvidence,
  securityContext: SecurityEvaluationContext,
  confirmationEvidence: ConfirmationEvidence
}
```

The caller may propose only the operation, action, and resource identity. It
does not independently supply trusted permissions, sensitivity, grants, or
Security dimension statuses.

Before policy evaluation:

- every governed artifact must carry the same operation identifier;
- available requirements must carry the same action and resource;
- Grant Evidence must carry the same subject, action, resource, and evaluated
  permissions;
- Security Evaluation Context supplies the authoritative subject;
- confirmed Confirmation Evidence must carry that same subject, action, and
  resource; and
- all nested values must satisfy their own invariants.

When Protected Action Requirements are unavailable:

- Grant Evidence must also be unavailable with an empty evaluated-permission
  collection because no complete requirement scope exists;
- Confirmation Evidence must be absent because sensitivity is unknown; and
- those later inputs are not evaluated by policy.

Any operation, subject, action, resource, permission-set, or confirmation
correspondence mismatch is an authorization-input or authorization-evidence
domain failure. It is not `deny` or `indeterminate`.

# Minimal Authorization Policy

Policy means the immutable deterministic rules that map validated authorization
inputs to one authorization decision.

The minimal policy is fixed by this specification. It:

- evaluates one operation-bound governed requirements result, Grant Evidence,
  Security Evaluation Context, and Confirmation Evidence;
- requires exact matching;
- uses AND semantics for required permissions;
- supports no policy DSL;
- supports no priorities, overrides, inheritance, deny lists, role expansion,
  conditional expressions, or provider-specific claims; and
- has the semantic reference `orion.minimum-authorization` version `1.0.0`.

The policy reference identifies the rule set used for a decision. It is not a
configuration file, database key, executable expression, or external-policy
Provider.

Configurable policies and policy-source Contracts are deferred. A future
extension must not silently change decisions attributed to
`orion.minimum-authorization` version `1.0.0`.

# Authorization Decision Vocabulary

The decision vocabulary is closed:

- `allow`;
- `deny`;
- `indeterminate`.

## Allow

`allow` means:

- every input is valid;
- Protected Action Requirements are available and authoritative;
- grant evidence is available;
- every Security context dimension is available or governed not applicable;
- every required permission has one exact matching grant; and
- when the action is sensitive, matching confirmation evidence is present.

Allow is the only decision category that a protected boundary may enforce by
proceeding.

## Deny

`deny` means evaluation completed with valid, available evidence but the
authorization requirements are not satisfied.

The minimal denial reasons are:

- `missing-required-permission`;
- `confirmation-required`.

Denial is a normal Security decision, not an exception or evaluation failure.

## Indeterminate

`indeterminate` means a valid authorization request could not be conclusively
allowed or denied because required authoritative evaluation input was
unavailable.

The minimal indeterminate reasons are:

- `requirements-unavailable`;
- `grant-evidence-unavailable`;
- `security-context-unavailable`.

Indeterminate is not denial, but a protected boundary must fail closed and must
not execute under it.

Malformed evidence, contradictory evidence, unsupported shapes, and invalid
internal state do not produce `indeterminate`; they are domain failures.

# Deterministic Decision Table

Validation failures occur before this table. The table applies only to complete
and semantically valid inputs.

All required permissions use AND semantics.

| Governed requirements | Governed Security context                | Grant evidence   | Required permissions | Matching grants     | Sensitivity | Confirmation       | Decision      | Reason                                 |
| --------------------- | ---------------------------------------- | ---------------- | -------------------- | ------------------- | ----------- | ------------------ | ------------- | -------------------------------------- |
| unavailable           | any valid status                         | unavailable      | unknown              | not evaluated       | unknown     | absent             | indeterminate | requirements-unavailable               |
| available             | one or more dimensions unavailable       | any valid status | any                  | not evaluated       | either      | not evaluated      | indeterminate | security-context-unavailable           |
| available             | all available or governed not applicable | unavailable      | any                  | not evaluated       | either      | not evaluated      | indeterminate | grant-evidence-unavailable             |
| available             | all available or governed not applicable | available        | zero                 | not applicable      | standard    | absent             | allow         | no-permission-required                 |
| available             | all available or governed not applicable | available        | one or more          | all                 | standard    | absent             | allow         | all-required-permissions-granted       |
| available             | all available or governed not applicable | available        | one or more          | one or more missing | standard    | absent             | deny          | missing-required-permission            |
| available             | all available or governed not applicable | available        | any                  | any                 | sensitive   | absent             | deny          | confirmation-required                  |
| available             | all available or governed not applicable | available        | zero                 | not applicable      | sensitive   | matching confirmed | allow         | confirmation-and-permissions-satisfied |
| available             | all available or governed not applicable | available        | one or more          | all                 | sensitive   | matching confirmed | allow         | confirmation-and-permissions-satisfied |
| available             | all available or governed not applicable | available        | one or more          | one or more missing | sensitive   | matching confirmed | deny          | missing-required-permission            |

Additional deterministic rules:

1. Unavailable requirements produce `indeterminate` before Context, grants, or
   confirmation are evaluated.
2. Any unavailable required Security dimension then produces `indeterminate`.
3. Grant-evidence unavailability then produces `indeterminate`.
4. For available evidence on a sensitive action, absent confirmation is checked
   before grant sufficiency and produces `confirmation-required`.
5. Matching confirmation never supplies a missing permission.
6. Authentication never supplies a missing permission.
7. Zero required permissions never supplies missing confirmation for a
   sensitive action.
8. Extra, unrelated, duplicate, contradictory, or non-matching grants are
   invalid evidence and do not influence the decision table.
9. Any governed-artifact correspondence mismatch is a domain failure before
   this table.

# Anonymous Authorization

Anonymous does not mean always allowed or always denied.

Under the minimal policy:

- all governed requirements, Grant Evidence, and Security Evaluation Context
  inputs must be authoritative, operation-bound, and evaluable;
- every required Security dimension must be available or governed not
  applicable;
- an anonymous subject may receive `allow` for a standard action with zero
  governed required permissions;
- an anonymous subject may receive `allow` for a permission-protected action
  only when complete available governed evidence explicitly grants every
  required permission to the anonymous subject for the exact resource and
  operation;
- authentication is never inferred;
- authenticated grants never match an anonymous subject;
- absence of an explicit required grant produces `deny`; and
- requirements, grant, or required Security-context unavailability produces
  `indeterminate`.

This provides explicit anonymous behavior without redefining authentication or
creating an implicit public role.

# Authorization Decision Artifact

Every successful evaluation returns one immutable Authorization Decision
Artifact with exactly:

```text
{
  operationId: AuthorizationOperationIdentifier,
  decision: AuthorizationDecisionCategory,
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

The reason vocabulary is closed:

- `no-permission-required`;
- `all-required-permissions-granted`;
- `confirmation-and-permissions-satisfied`;
- `missing-required-permission`;
- `confirmation-required`;
- `requirements-unavailable`;
- `security-context-unavailable`;
- `grant-evidence-unavailable`.

Artifact invariants:

1. The operation identifier exactly identifies the evaluated operation.
2. The subject, action, resource, permissions, and sensitivity exactly identify
   the evaluated governed inputs when requirements are available.
3. When requirements are unavailable, evaluated permissions are empty and
   sensitivity is `unavailable`.
4. Evaluated permissions are unique and canonically ordered.
5. Security dimension statuses exactly reproduce the governed Security
   Evaluation Context without its underlying values.
6. The policy fields are fixed constants for this model.
7. The reason and evidence statuses correspond exactly to the decision table and
   validation order.
8. Standard actions use confirmation status `not-required`.
9. Sensitive actions use confirmation status `absent` or `confirmed`.
10. A stage not reached due to earlier indeterminate input uses
    `not-evaluated`.
11. No raw grant, confirmation content, credential, token, governed Context
    value, policy internals, provider data, or chain-of-thought appears.
12. The artifact is defensively reconstructed and deeply immutable.
13. The artifact carries no timestamp, expiry, execution status, result,
    readiness state, generated identifier, or persistence semantics.

The artifact is mandatory enforcement evidence for a future protected action
boundary. It is not merely advice:

- only `allow` may proceed;
- `deny` and `indeterminate` must fail closed;
- the boundary must verify exact operation identifier, subject, action,
  resource, required permissions, sensitivity, and applicable Security context
  correspondence;
- the boundary must not reinterpret or replace the Security decision; and
- the artifact does not itself execute anything.

An `allow` artifact from another operation is invalid enforcement evidence even
when all other fields match. The artifact is enforceable only for its bound
operation and is not reusable authorization authority.

This model does not define a public execution Contract. A future invocation
specification must carry the same operation identifier and preserve exact
correspondence without treating the artifact as a durable credential.

# Deterministic Evaluation Algorithm

For valid inputs, the minimal policy evaluates in this exact semantic order:

1. If governed Protected Action Requirements are unavailable, return
   `indeterminate` with `requirements-unavailable`.
2. If any governed Security Evaluation Context dimension is unavailable, return
   `indeterminate` with `security-context-unavailable`.
3. If governed Grant Evidence is unavailable, return `indeterminate` with
   `grant-evidence-unavailable`.
4. If the governed action is sensitive and confirmation is absent, return
   `deny` with `confirmation-required`.
5. Compare every governed required permission with available governed grants
   using exact subject, permission, and resource equality.
6. If any required permission lacks a match, return `deny` with
   `missing-required-permission`.
7. If the action is sensitive, return `allow` with
   `confirmation-and-permissions-satisfied`.
8. If no permission was required, return `allow` with
   `no-permission-required`.
9. Otherwise return `allow` with `all-required-permissions-granted`.

No clock, randomness, locale, environment variable, insertion order, external
service, or mutable process-global state may affect this algorithm.

# Denial and Evaluation Failure

Authorization denial and evaluation failure are distinct:

| Condition                                                                                           | Semantic result                       |
| --------------------------------------------------------------------------------------------------- | ------------------------------------- |
| Valid input and one or more required grants missing                                                 | `deny`                                |
| Valid sensitive action without confirmation                                                         | `deny`                                |
| Valid input and authoritative requirements unavailable                                              | `indeterminate`                       |
| Valid input and required Security context unavailable                                               | `indeterminate`                       |
| Valid input and authoritative grant evidence unavailable                                            | `indeterminate`                       |
| Malformed request or value                                                                          | authorization-input domain failure    |
| Fabricated, malformed, contradictory, unrelated, mismatched-operation, or hostile governed evidence | authorization-evidence domain failure |
| Invalid policy definition or pre-existing Security state                                            | Security-state domain failure         |
| Impossible newly constructed decision artifact                                                      | Security-state domain failure         |

A future Engine specification must define a minimal closed public failure
taxonomy consistent with these categories. This Concept Specification does not
mandate implementation class names.

No native exception, hostile thrown value, raw input, grant content, or source
failure detail may cross the Security boundary.

# Validation Precedence for a Future Engine

A future authorization Contract must preserve this conceptual precedence:

1. Engine lifecycle and pre-existing Security/policy state.
2. Authorization request envelope.
3. Authorization Operation Identifier, Action Identifier, and Resource.
4. governed Protected Action Requirements resolution and exact correspondence.
5. governed Security Evaluation Context and exact correspondence.
6. governed Grant Evidence and exact correspondence.
7. Confirmation Evidence and exact correspondence.
8. deterministic policy evaluation.
9. newly constructed Authorization Decision Artifact.

Earlier failure prevents later hostile boundaries from being inspected.
Pre-existing internal-state failures occur before any request inspection.
Constructed-state failures occur only after all caller and evidence inputs
succeed.

An Engine specification may refine structural and semantic sub-stages but must
not change this semantic order.

# Runtime Boundary Safety

All future public authorization factories and Contracts must treat inputs as
hostile runtime values.

They must:

- require exact own-property shapes;
- reject missing fields, explicit `undefined`, unexpected enumerable string
  properties, and enumerable symbol properties;
- reject inherited substitutes, arrays where records are required, array-like
  substitutes, primitives, functions, and coercible objects;
- safely handle hostile prototypes, `ownKeys`, descriptors, getters, nested
  getters, array indices, and Proxies;
- capture keys and descriptors once per boundary;
- perform at most one protected read per accepted property or array index;
- reconstruct only from captured local values;
- reject sparse or decorated arrays;
- normalize failures to the correct privacy-safe domain category; and
- prevent native exception leakage.

# Immutability and Caller Ownership

Authorization Subject, Protected Action, Authorization Resource, Permission
Grant, Protected Action Requirements, Grant Evidence, Security Evaluation
Context, Confirmation Evidence, policy reference, and Authorization Decision
Artifact are immutable semantic values.

Successful construction requires:

- defensive reconstruction;
- deep freezing;
- no caller-owned object or array retention;
- no freezing, sorting, deduplicating, normalizing, rewriting, or otherwise
  mutating caller values; and
- canonical sorting only on newly created arrays.

Failures must not mutate caller values or partially construct observable
Security state.

Every governed artifact must retain its exact operation binding. Caller-supplied
ordinary values cannot mutate, replace, or impersonate authority-bearing
artifacts.

# Policy and Grant Source Boundaries

The minimal policy is built in and requires no policy source.

Protected Action Requirements, Grant Evidence, and Security Evaluation Context
require their source-neutral authority boundaries. Their future Core-custodied
Contracts must not expose:

- database schemas;
- file formats;
- LDAP, OAuth, JWT, or cloud-IAM models;
- Provider or Adapter SDK types;
- credentials or tokens; or
- source-specific failures; or
- another Engine implementation.

These boundaries supply governed facts. Security validates their
authority-bearing artifacts and makes the decision.

M8 requires the semantic authority boundaries but no external source. Bootstrap
may compose deterministic process-local implementations through Core-custodied
Contracts. Arbitrary prepared objects or grant arrays are never authoritative
inputs.

# Privacy and Diagnostics

Authorization follows data minimization.

Failures, logs, metrics, and diagnostics must not expose:

- raw Identity Identifiers;
- raw resource identifiers unless separately approved;
- Authorization Operation Identifiers;
- raw grants or required-permission lists;
- governed Security Evaluation Context values;
- credentials, tokens, secrets, provider payloads, or policy internals;
- hostile runtime values or thrown messages;
- confirmation content or acquisition details;
- personal data; or
- private reasoning or chain-of-thought.

Safe operational diagnostics may include:

- decision category;
- reason category;
- subject category (`anonymous` or `authenticated`);
- sensitivity category;
- permission count;
- grant-evidence availability;
- aggregate Security-dimension availability categories;
- confirmation status; and
- aggregate success/failure counts.

Diagnostics must not imply that an allowed action executed successfully.

# Capability Boundaries

## Identity Boundary

Identity authenticates or represents anonymous state. Security consumes the
minimum immutable Identity projection and does not authenticate.

Authenticated Identity is neither a grant nor an authorization decision.

## Context Boundary

Context supplies available immutable facts. Security must not fabricate missing
Context dimensions or mutate Context. Security consumes governed dimension
statuses through Security Evaluation Context. Identity, Device, Session,
Context, and Trust Level are all accounted for; unavailable required dimensions
produce `indeterminate`.

## Memory and Knowledge Boundary

Memory and Knowledge do not own grants, policy, or authorization decisions.
Security must not treat remembered experience or accepted Knowledge as an
authorization grant unless a future approved Security policy explicitly
introduces such a governed fact.

## Reasoning Boundary

Reasoning may identify a candidate action or risk but does not grant permission,
classify Security policy, or authorize execution.

## Planning Boundary

Planning does not authorize. A Candidate Plan, including any future
Skill-bound plan, is not permission evidence.

## Skill Boundary

A Skill declares required permissions and owns its business workflow. It does
not issue grants, reduce its declared requirements, evaluate Security policy, or
authorize itself.

Skill catalog registration and discovery do not imply authorization or
executable readiness.

## Brain Boundary

Brain or another protected orchestration boundary determines when authorization
evaluation occurs, allocates the Authorization Operation Identifier, and
supplies governed authority-bearing inputs through Contracts.

Brain does not own policy, manufacture requirements, sensitivity, grants,
Security dimension statuses, or confirmation; reinterpret decisions; or treat a
plan as authorization.

## Execution and Enforcement Boundary

A future protected boundary:

- requires one valid matching `allow` artifact;
- rejects `deny`, `indeterminate`, malformed, mismatched, or absent artifacts;
- verifies exact operation identifier and all other correspondence without
  recomputing policy;
- rejects an artifact produced for any other operation;
- does not acquire Security semantic ownership; and
- does not treat authorization as proof of successful execution.

Invocation arguments, execution lifecycle, output normalization, retries,
cancellation, sandboxing, compensation, and execution failure remain outside
this model.

# Architecture and Dependency Rules

A future Security Engine:

- depends inward on Core-custodied authorization and accepted Identity values;
- does not depend directly on Identity, Context, Skill, Planning, Brain, or any
  other Engine implementation;
- does not depend on Bootstrap, Infrastructure, databases, Providers, Adapters,
  external IAM systems, or external npm runtime packages unless separately
  authorized;
- communicates through Core-custodied Contracts;
- does not use capability registration as a service locator; and
- does not introduce dependency cycles.

Bootstrap may explicitly compose prepared values or Contract implementations
without acquiring Security semantics.

# Events, Persistence, Providers, and Adapters

The minimum model requires no Event publication or consumption.

It explicitly defers:

- Security Events;
- audit Events and audit persistence;
- policy and grant persistence;
- databases, repositories, caches, and files;
- Providers and Adapters;
- external entitlement and IAM systems;
- message brokers and distributed evaluation; and
- integration-specific enforcement.

Event publication is not required merely because an authorization decision
exists. A future Event must have separately approved semantics and publication
authority.

# Runtime Bounds Summary

| Value                              | Bound                                                           | Authority                                    |
| ---------------------------------- | --------------------------------------------------------------- | -------------------------------------------- |
| Skill Permission Identifier        | Accepted M7 bound and grammar                                   | inherited                                    |
| Required permissions               | 0–64 unique entries                                             | inherited from M7                            |
| Permission grants                  | 0–64 unique relevant entries                                    | derived from the required-permission maximum |
| Authorization Action Identifier    | 3–128 ASCII, dotted lowercase grammar                           | defined by this model                        |
| Authorization Resource Identifier  | 1–128 restricted ASCII                                          | defined by this model                        |
| Authorization Operation Identifier | 1–128 restricted ASCII                                          | defined by this model                        |
| Authorization Subject              | exactly one anonymous or authenticated value                    | inherited from M1 Identity states            |
| Authorization Resource             | exactly one unscoped or identified value                        | defined by this model                        |
| Security Dimension Status          | closed `available`, `unavailable`, or `not-applicable` literals | defined by this model                        |
| Confirmation Evidence              | exactly one absent or confirmed value                           | defined by this model                        |
| Authorization Decision Artifact    | exactly one artifact per evaluation                             | defined by this model                        |

No global subject, action, resource, operation, grant, policy, or decision quota
is defined. Operational resource quotas belong to future configuration or
Infrastructure policy.

# Requirements for a Future ENGINE-0009

A future Security Engine specification may be drafted under this Active Concept
Specification.

ENGINE-0009 must define, without changing this model:

- exact Core runtime types and factory shapes;
- one synchronous minimal authorization Contract or an explicitly justified
  alternative;
- exact lifecycle and internal-state semantics;
- exact validation and failure precedence;
- a closed public error taxonomy;
- exact authority-boundary Contracts and operation-bound governed artifacts;
- exact handling of unavailable requirements, Grant Evidence, and Security
  dimensions;
- deterministic decision construction;
- protected extraction and hostile-value behavior;
- deep immutability and caller non-mutation;
- architecture and diagnostics rules;
- normative boundary, decision-table, and precedence tests; and
- explicit deferral of enforcement and execution.

# Approved Model Closure

Formal review approved the Authorization Operation Identifier grammar and bound
defined by this model.

The following are deliberate model decisions, not open implementation choices:

- M8 uses exact-resource-only grants;
- M8 requires governed source-neutral authority boundaries for Protected Action
  Requirements, Grant Evidence, and Security Evaluation Context;
- M8 obtains sensitivity only from governed Protected Action Requirements and
  defines no classification registry;
- M8 represents every OES-0009 Security dimension as available, unavailable, or
  governed not applicable;
- Authorization Decision Artifacts and all authority-bearing inputs are bound to
  one Authorization Operation Identifier; and
- configurable policy, long-term freshness/revocation infrastructure,
  distributed replay protection, and external evidence sources remain deferred.

No implementation-critical semantic question remains for ENGINE-0009.

# Normative Concept Testability

A future ENGINE-0009 specification must be able to require objective tests
proving:

- an arbitrary caller cannot create authority-bearing requirements, Grant
  Evidence, or Security Evaluation Context merely by matching their shapes;
- Skill-backed requirements contain every permission from the admitted
  Registered Skill manifest;
- a caller cannot remove a Skill permission or downgrade governed sensitivity;
- fabricated grant arrays are rejected as non-authoritative;
- unavailable or incomplete Grant Evidence produces `indeterminate`;
- unavailable Protected Action Requirements produces `indeterminate`;
- any unavailable required Security dimension produces `indeterminate`;
- only a governed authority boundary may establish `not-applicable`;
- operation mismatches in requirements, grants, Context, confirmation, or the
  decision artifact are rejected;
- confirmation from another operation is rejected;
- an `allow` artifact cannot authorize a second operation;
- anonymous zero-permission and explicit-anonymous-grant cases follow the
  decision table;
- one missing grant from complete available evidence produces `deny`;
- sensitive action without confirmation produces `deny`;
- exact matching confirmation permits evaluation to continue;
- all multiple required permissions use AND semantics;
- decision artifacts are deeply immutable and privacy-minimized;
- callers and their mutable graphs are never retained or mutated; and
- hostile runtime values produce deterministic domain failures without native
  exception leakage.

# Acceptance Criteria

This Concept Specification is ready for activation when formal review confirms:

1. Security is the sole authorization semantic owner.
2. Subject semantics reuse M1 Identity without redefining authentication.
3. Permission requirements and grants are explicitly distinct.
4. Grant matching uses exact subject, permission, and resource equality.
5. Required permissions use deterministic AND semantics.
6. Anonymous behavior is explicit and does not infer authentication.
7. `allow`, `deny`, and `indeterminate` are closed and non-overlapping.
8. The decision table covers zero, one, and multiple permissions, missing
   grants, unavailable evidence, sensitive actions, and confirmation.
9. Denial is distinct from malformed input and evaluation failure.
10. Sensitive-action confirmation is separate from permission grants.
11. Every authority-bearing artifact originates at its governed source-neutral
    boundary and is bound to one operation.
12. Every OES-0009 Security dimension is explicitly accounted for, and
    unavailable required dimensions prevent `allow`.
13. The decision artifact is immutable, minimal, privacy-safe, operation-bound,
    and mandatory for future enforcement.
14. Brain, Planning, Skill, Security, and enforcement ownership remain distinct.
15. The model introduces no persistence, Event runtime, Provider, Adapter,
    external IAM, or execution semantics.
16. The Authorization Operation Identifier bound is approved or revised.
17. No implementation-critical semantic choice remains for ENGINE-0009.

# Explicitly Deferred

This model explicitly defers:

- configurable policy and policy languages;
- roles, groups, organizations, tenants, and delegation;
- resource hierarchies and wildcard scopes;
- grant expiry, revocation distribution, and temporal evaluation;
- policy/grant persistence and administration;
- Device, Session, Trust Level, location, and risk value models and Providers;
- sensitive-action classification registry;
- confirmation acquisition and user-interface behavior;
- cryptographic evidence, artifact signing, replay prevention, and distributed
  transport;
- Security Events and audit storage;
- Skill selection, Planning binding, invocation, and execution;
- Providers, Adapters, external IAM, and integrations; and
- production enforcement infrastructure.

# Related Documents

- [Documentation Authority](../../docs/DOCUMENT-AUTHORITY.md)
- [Architecture](../../docs/architecture.md)
- [Engineering Principles](../../docs/principles.md)
- [ADR-0001 — Core Ownership and Dependency Direction](../../docs/adr/ADR-0001-Core-Ownership-and-Dependency-Direction.md)
- [ADR-0002 — Capability-Oriented Architecture](../../docs/adr/ADR-0002-Capability-Oriented-Architecture.md)
- [ADR-0003 — Engine Communication Model](../../docs/adr/ADR-0003-Engine-Communication-Model.md)
- [OES-0002 — Engine Design](../../docs/engineering/OES-0002-Engine-Design.md)
- [OES-0004 — Contracts](../../docs/engineering/OES-0004-Contracts.md)
- [OES-0009 — Security Standards](../../docs/engineering/OES-0009-Security-Standards.md)
- [CONCEPT-0003 — Context Model](CONCEPT-0003-Context-Model.md)
- [ENGINE-0002 — Identity Engine](../engines/identity/ENGINE-0002-Identity-Engine.md)
- [ENGINE-0007 — Planning Engine](../engines/planning/ENGINE-0007-Planning-Engine.md)
- [ENGINE-0008 — Skill Engine](../engines/skill/ENGINE-0008-Skill-Engine.md)
- [FLOW-0001 — Voice Interaction](../flows/conversation/FLOW-0001-Voice-Interaction.md)

# Engineering Motto

> Authentication identifies. Security decides. Protected boundaries enforce.
