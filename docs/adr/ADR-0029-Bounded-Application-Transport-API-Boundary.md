# ADR-0029 — Bounded Application Transport/API Boundary

| Field             | Value                                                                                   |
| ----------------- | --------------------------------------------------------------------------------------- |
| **Status**        | Active                                                                                  |
| **Version**       | 1.1.0                                                                                   |
| **Owner**         | Project Maintainers                                                                     |
| **Created**       | 2026-09-15                                                                              |
| **Updated**       | 2026-09-15                                                                              |
| **Applies To**    | First bounded application transport/API boundary for controlled nonproduction execution |
| **Decision Type** | Architecture Decision                                                                   |

## Status and human decision

ADR-0029 is Active following Rodrigo Lozano's explicit human lifecycle PASS
on 2026-09-15. The completed review and approval permit recording the transition
from Draft 1.0.0 to Active 1.0.1. This lifecycle decision is separate from the
earlier architectural option selection preserved below. Activation establishes
architectural authority within this ADR's bounded scope; it does not authorize
transport implementation, production exposure, or deployment.

### Human lifecycle activation — 2026-09-15

| Decision field                         | Recorded value                       |
| -------------------------------------- | ------------------------------------ |
| Decision maker                         | Rodrigo Lozano                       |
| Decision                               | PASS — ADR-0029 lifecycle activation |
| Decision date                          | 2026-09-15                           |
| Review route                           | SINGLE_MAINTAINER                    |
| Transition                             | Draft -> Active                      |
| Document transition                    | Draft 1.0.0 -> Active 1.0.1          |
| INDEPENDENT_REVIEW                     | NOT_APPLICABLE_SINGLE_MAINTAINER     |
| MAINTAINER_REVIEW                      | PASS                                 |
| Blocking findings at review            | 0                                    |
| Non-blocking findings accepted         | 2                                    |
| ADR text review and lifecycle approval | Complete — human PASS                |
| Transport implementation authorized    | NO                                   |
| Production authorized                  | NO                                   |
| Deployment authorized                  | NO                                   |

Rodrigo Lozano approved activation after the completed lifecycle review found
the ADR faithful to D1/D2 OPTION B, D3/D4 OPTION A, and D5 OPTION A, with zero
blocking findings. The reviewed evidence included this ADR, DOCUMENT-AUTHORITY,
applicable OES lifecycle/versioning rules, ADR-0027, ADR-0028, REVIEW-0007,
IMPLEMENTATION-C1, bounded application composition, the Active 2.0.0 bounded
Reasoning supplement, and Brain authority verification and observer behavior.
The review reported passing Markdown formatting/structure, 17 local links,
four anchors, identifier uniqueness, diff checks, and preservation checks.
These are the completed review's evidence, not a new runtime test run.

The existing single-maintainer route remains applicable; no qualified
independent human reviewer is available under that recorded route. No
independent reviewer, time of day, or waived technical gate is invented.
AI records the human decision and validates documentation only.

The human reviewer accepted both non-blocking findings:

- **F1:** The concrete caller set, identity mapping, and enforceable access
  mechanism remain obligations of the subsequent transport-independent API
  specification. They must be defined and reviewed before implementation
  authorization; activation does not satisfy or waive them.
- **F2:** Lifecycle activation requires a distinct human decision from the
  earlier architectural option selection. The explicit lifecycle PASS above
  satisfies that requirement. This record preserves the separation of the two
  decisions; later specification and implementation approvals remain separate.

The next checkpoint is transport-independent API specification
discovery/definition. This activation neither creates that specification nor
assigns its identifier, and it does not allocate CONTRACT-0002. All existing
semantic, privacy, access, implementation, and deployment boundaries below
remain unchanged.

### Human access-model decision — 2026-09-15

| Decision field     | Recorded value                   |
| ------------------ | -------------------------------- |
| Decision maker     | Rodrigo Lozano                   |
| Decision           | PASS — OPTION A for S09–S11      |
| Decision date      | 2026-09-15                       |
| Review route       | SINGLE_MAINTAINER                |
| INDEPENDENT_REVIEW | NOT_APPLICABLE_SINGLE_MAINTAINER |
| MAINTAINER_REVIEW  | PASS — access-model selection    |
| Document version   | Active 1.1.0                     |

Following transport-independent API specification discovery, Rodrigo Lozano
explicitly selected one designated nonproduction service/test principal with
verified identity evidence and permission limited to the configured server-bound
preparation. This decision resolves the caller-model choice within D5 OPTION A;
it preserves D1/D2 OPTION B and D3/D4 OPTION A. It does not repeat or replace
the earlier ADR lifecycle decision, approve an unwritten API specification, or
claim independent review. The established single-maintainer route continues;
no time of day or additional reviewer is invented.

For the first controlled nonproduction bounded-application API specification:

- Exactly one nonproduction service/test principal MUST be explicitly designated.
- Admission MUST require verified identity evidence for that principal.
- That principal MUST be authorized only for the configured server-bound
  preparation, through applicable Security-owned policy or governed artifacts.
- Self-asserted identity and anonymous transport access MUST NOT be permitted.
- Client-selected preparation MUST NOT be permitted.
- Caller authorization MUST NOT be inferred from Context Identity.

F1 remains a specification obligation: the concrete principal designation,
identity-evidence verification and mapping, and enforceable access mechanism
must be defined and reviewed before implementation authorization. Selecting
the model does not claim that those concrete details have been supplied or
implemented. No principal identifier, credential, or authentication mechanism
is invented by this record.

Authentication technology, protocol, serialization, and deployment topology
remain unselected. Production access and deployment remain unauthorized.
Transport implementation, Core/Engine semantic changes, and C1 semantic changes
remain unauthorized. No API specification, API identifier, API filename, or
CONTRACT-0002 allocation is established by this decision recording.

### Historical architectural option selection — Draft 1.0.0

The following initial recording is preserved as Draft 1.0.0 history. Its
pending-review and non-authoritative statements describe that earlier
checkpoint; the lifecycle activation record above governs current status.

This initial ADR records Rodrigo Lozano's human selection of architectural
options and authorization to record that selection. It remains Draft pending
human review of this newly written ADR and its lifecycle approval. The option
selection PASS is not a claim that the resulting document text has already
been reviewed or activated.

The [ADR template](../templates/ADR.template.md) starts at Draft 1.0.0.
[OES-0008](../engineering/OES-0008-Documentation-Standards.md#ai-collaboration)
requires AI-generated documentation to be reviewed before becoming Active.
[DOCUMENT-AUTHORITY](../DOCUMENT-AUTHORITY.md#document-status-and-authority)
distinguishes a non-authoritative Draft from an approved ADR. Accordingly,
normative wording below records the selected boundary for lifecycle review;
this Draft does not independently authorize implementation.

| Decision field                         | Recorded value                                           |
| -------------------------------------- | -------------------------------------------------------- |
| Decision maker                         | Rodrigo Lozano                                           |
| Decision                               | PASS — architectural option selection and recording only |
| D1/D2                                  | OPTION B                                                 |
| D3/D4                                  | OPTION A                                                 |
| D5                                     | OPTION A                                                 |
| Decision date                          | 2026-09-15                                               |
| Review route                           | SINGLE_MAINTAINER                                        |
| INDEPENDENT_REVIEW                     | NOT_APPLICABLE_SINGLE_MAINTAINER                         |
| MAINTAINER_REVIEW                      | PASS — selected architectural options only               |
| ADR text review and lifecycle approval | Pending                                                  |
| Transport implementation authorized    | NO                                                       |
| Deployment authorized                  | NO                                                       |

The decision follows the transport governance artifact and decision
reconciliation against published C1 baseline
`3e9a60368e94eebf48fe14f918d523ee5ea1a49c`. The human selected execution against
server-bound preparation, minimal public results and failures, and controlled
nonproduction access. These choices bound the first transport without changing
capability semantics. No time of day or independent reviewer is supplied or
invented. The existing single-maintainer route follows
[repository review governance](../DOCUMENT-AUTHORITY.md#review-independence-and-single-maintainer-governance).
AI performs recording and validation, not independent human review.

## Context and problem

[C1](../../IMPLEMENTATION-C1.md) is complete and human-approved. Its
[bounded application composition](../../services/bootstrap/src/brain/bounded-application-composition.ts)
assembles existing capabilities. An internal caller explicitly prepares Context,
binds Brain to the prepared lineage, and submits requests separately. C1 does
not establish remote operations or transport authorization merely by exporting
TypeScript functions.

The next selected workstream needs an application-facing execution boundary
without exposing preparation machinery, internal authority, or composition
lifecycle. It must distinguish existing final cognitive results from failures
and define a restricted access scope before any implementation is authorized.

[REVIEW-0007](../architecture-review/REVIEW-0007-K13-F08-Production-Authorization-for-Fixed-Profile-B.md)
retains its existing fixed Profile B authority; its scope is not extended to
transport. R4 remains 7/7 PASS under
[REVIEW-0004](../architecture-review/REVIEW-0004-Reasoning-Engine-Executable-Bounded-Rule.md).
The [bounded Reasoning supplement](../../specifications/engines/reasoning/ENGINE-0006-Reasoning-Engine-Executable-Bounded-Rule.md)
remains Active 2.0.0. Earlier checkpoint statements in historical records do
not reopen closed residuals or reverse subsequent lifecycle decisions.

## Scope

This decision records the first controlled nonproduction boundary's external
operation, server-side preparation association, result and failure disclosure,
access obligations, and subsequent specification requirement.

It excludes transport or protocol implementation, REST, gRPC, public Internet
exposure, production authentication integration, deployment, new diagnostic
taxonomies, Engine behavior changes, Core semantic Contract changes, and C1
semantic changes. It does not expose source administration, new Skills,
dynamic profile selection, or raw-text conversion into bounded queries.

## Decision

### D1/D2 OPTION B — Execution against server-bound preparation

The first public operation is bounded application execution against explicitly
prepared, server-bound state. Here, public means visible to a permitted
transport caller; it does not mean Internet-accessible or anonymously usable.

The internal application caller MUST prepare Context explicitly through the
existing C1 path and establish the corresponding Brain binding before that
binding can serve execution. Internal preparation and execution remain separate.
Receiving an execution request MUST NOT initiate or infer preparation, refresh,
source material, or profile selection.

The server-side association identifies the existing prepared Context lineage
and its corresponding Brain composition for an admitted execution. That
association MUST be unambiguous and remain internal. The transport MUST use
the established binding, preserve Context lookup and authority verification,
and MUST NOT substitute an unrelated preparation or manufacture valid Context
when the bound state is unavailable or invalid. The association does not pin
a new revision lifecycle, renew currentness, confer authorization, or transfer
Context authority. Existing C1 and Context semantics continue to govern.

The first boundary has no public preparation operation or caller-controlled
preparation selector. `ContextLineageId` and internal Context/Brain handles
MUST NOT become public authority or client-supplied selectors. No client-visible
preparation handle is required or introduced for this server-bound model.
Any later claim that such a handle is necessary must first establish its
architectural need and semantics through review. This decision does not design
identifier formats, session mechanisms, or correlation formats.

`composeBoundedApplicationCapability` and `composeBrain` remain internal
composition operations, not remote operations. Shutdown also remains internal:
the caller retains C1 lifetime responsibility and existing Knowledge-resource
cleanup behavior. There is no public shutdown operation and no new global
revocation guarantee for retained Context/Brain handles.

Execution carries the existing governed bounded-query meaning through the
application boundary. [ADR-0027](ADR-0027-Brain-Structured-Query-Request-Domain.md)
continues to govern Brain request semantics. Transport MUST NOT infer bounded
query semantics from arbitrary text or treat a supplied query as authority.

### D3/D4 OPTION A — Existing final results and sanitized failures

The public boundary MUST represent only existing bounded application final-result
meanings plus a minimal sanitized failure indication. It MUST NOT serialize an
internal object graph merely because its types are exported.

The existing bounded path's completed response and completed
`request-more-context` meanings remain distinct from failures. The subsequent
API specification must define their public representation using the existing
final-result boundary. It MUST NOT add Reasoning conclusions, Outcome categories,
proposition metadata, or diagnostics absent from that boundary by reaching into
internal state. Existing public explainability is not expanded.

Under [ADR-0028](ADR-0028-Bounded-Downstream-Response-Domain-Correspondence.md),
successful bounded content MUST preserve the exact accepted textual scalar
through 4096 Unicode code points, inclusive, with all other validity constraints
unchanged. Transport encoding and decoding MUST preserve the value, including
leading, trailing, and internal whitespace and non-BMP characters. Truncation,
paraphrase, decoration, whitespace or Unicode normalization, and semantic
conversion are prohibited. A 4097-code-point value is not repaired into an
accepted result. Unrelated legacy limits remain unchanged.

The Active 2.0.0 supplement remains the source of truth for exact R1/R2/R3
literals and anonymous Outcome strings. This ADR does not require publishing
internal conclusions or candidate responses absent from the final-result
surface. Exact-query mismatch remains a completed non-applicable Outcome;
anonymous Context retains its existing anonymous Outcome and downstream
`request-more-context` behavior. Neither becomes a transport failure merely
because it does not yield a successful scalar. Applicable-but-insufficient
evidence retains its broader governed meaning but remains unreachable in the
current valid textual-only executable subset; transport MUST NOT manufacture
that state or use it to hide invalid input or upstream failures.

Failure Option A is preserved: semantic failure ownership remains with the
originating responsibility, and existing Brain boundary normalization remains
unchanged. Internal exception identity is NOT required to cross Brain or the
transport boundary. Normalization and sanitization do not transfer semantic
ownership or convert a failure into a completed cognitive Outcome.

The minimal public failure representation indicates failure without exposing
private/internal causes, exception objects, stacks, authority evidence, or a
new diagnostic taxonomy. This ADR does not select error codes, wire envelopes,
protocol statuses, retry semantics, or a public classification of internal
failures. The subsequent API specification must make the minimal representation
explicit without broadening these disclosure permissions.

Internal Context lineage and revision authority, Knowledge/proposition identity,
source identifiers, provenance, acceptance and verification evidence,
currentness evidence, and private reasoning traces MUST NOT leak through
results, failures, or transport diagnostics. The governed successful scalar
remains authorized response content; this does not authorize disclosure of its
surrounding internal evidence or authority objects.

### D5 OPTION A — Controlled nonproduction access

The first transport checkpoint is restricted to controlled nonproduction use.
Before implementation authorization, the subsequent specification and review
MUST explicitly define permitted callers, identity treatment, and an enforceable
access policy for the server-bound preparation and execution boundary.

An internal or nonproduction label is not an access control. Admission MUST
enforce applicable Security-owned decisions, Contracts, or governed policy
artifacts under [OES-0009](../engineering/OES-0009-Security-Standards.md).
Transport does not acquire Security policy ownership. A prepared Context's
Identity state does not independently authenticate or authorize the transport
caller. Anonymous Reasoning semantics MUST NOT imply anonymous transport access;
this ADR grants no anonymous transport access.

The approved S09–S11 access model above restricts the caller model to one
explicitly designated nonproduction service/test principal. Its concrete
designation, identity mapping, and enforceable access mechanism remain
requirements for the next specification checkpoint, not waivers permitting an
unrestricted implementation. Production authentication integration, public
Internet exposure, and production deployment remain out of scope.

### Ownership and technology independence

Context retains preparation, lifecycle, incorporation, and authority semantics;
Knowledge and sources retain their meanings and authority; Reasoning retains
bounded evaluation; Planning retains plan transformation; Brain retains
orchestration and final-result assembly; Security retains policy and
authorization ownership. Core retains shared-language custody, and Bootstrap
retains composition responsibility. Transport translates and conveys the
accepted boundary without acquiring those responsibilities.

This follows [ADR-0014](ADR-0014-Bootstrap-Composition-Responsibility-and-Ownership-and-Authority-Preservation.md)
and [ADR-0017](ADR-0017-Execution-Model-Independence-for-Asynchronous-Event-Driven-and-Distributed-Collaboration.md).
Engine, Core, and C1 semantics, protected Skill boundaries, existing runtime/test
evidence, and completed lifecycle synchronization remain unchanged. No existing
ADR, OES, Contract, Engine specification, or implementation record is superseded.

The boundary is transport-independent. Protocol selection, protocol-specific
representation, frameworks, authentication technology, and deployment topology
are deferred. No REST, gRPC, port, endpoint, hosting model, or distributed
authority mechanism is selected.

## Rationale and alternatives

Execution against internally prepared state provides a bounded external
capability while avoiding public preparation and handle-lifecycle obligations.
The tradeoff is that preparation must be arranged internally before use.
Public preparation plus execution was considered and not selected for this
first boundary; it would require additional caller-visible state semantics.

Existing final-result meanings and a sanitized failure indication minimize
disclosure and preserve Brain's boundary. Richer public Outcome/failure
distinctions were not selected because their authorized sources and disclosure
rules would require additional specification and potentially architectural
decisions.

Controlled nonproduction access bounds the first checkpoint. Independently
authenticated production clients were not selected; their integration remains
outside this work. Restricted scope still requires demonstrable access policy.

## Consequences and subsequent governance

After ADR lifecycle approval, a transport-independent API specification is
required to define operations, inputs, outputs, binding preconditions,
minimal failures, permitted callers, identity treatment, access enforcement
obligations, compatibility/versioning, and conformance expectations. It must
preserve [Context preparation scope](ADR-0022-Context-Preparation-Semantic-Scope-and-Applicability-Policy.md)
and the boundaries above. This recording does not create that specification
or allocate its identifier.

Canonical architectural Contracts are distinct from API specifications under
[OES-0004](../engineering/OES-0004-Contracts.md). This ADR does not allocate
CONTRACT-0002 or establish that a new canonical Contract is required. Numeric
vacancy is insufficient; a later allocation would require independently
established architectural need and applicable Contract governance.
ENGINE-0006 remains Reasoning's identity and MUST NOT identify transport
guidance. No separate transport implementation-guideline artifact is required.

A separate new architecture REVIEW document is not mechanically required for
this recording; the completed human document review and lifecycle approval
are recorded above.
Architecture approval does NOT authorize implementation or deployment.
Specification approval must precede explicit bounded implementation
authorization; deployment remains a separate authorization and is not granted.

## Risks and future review

An ambiguous binding could execute against unintended prepared state; the API
specification must make binding preconditions and access obligations explicit.
Generic object serialization could disclose internal authority; public
representations must stay within the final-result and failure scope above.
Calling a transport internal could conceal missing admission enforcement;
nonproduction access restrictions must be reviewable and enforceable.

Public preparation, caller-selectable prepared state, richer public diagnostics,
production client integration, or changed lifecycle semantics require renewed
review before expanding this boundary. No implementation readiness, security
validation, new runtime test result, or deployment readiness is claimed here.

## Change history

| Version | Date       | Description                                                                                                                                                                                                                                                                                               |
| ------- | ---------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1.1.0   | 2026-09-15 | Recorded Rodrigo Lozano's PASS for S09–S11 OPTION A: one designated nonproduction service/test principal, verified identity evidence, and access limited to configured server-bound preparation; concrete F1 specification obligations and all implementation/production/deployment exclusions preserved. |
| 1.0.1   | 2026-09-15 | Recorded Rodrigo Lozano's separate lifecycle PASS and Draft -> Active transition; accepted F1/F2 with follow-up obligations preserved; no semantic change or implementation, production, or deployment authorization.                                                                                     |
| 1.0.0   | 2026-09-15 | Initial Draft recording Rodrigo Lozano's PASS for D1/D2 OPTION B, D3/D4 OPTION A, and D5 OPTION A; ADR lifecycle review pending; implementation and deployment unauthorized.                                                                                                                              |

Version 1.0.0 follows the initial ADR template and
[OES-0010 documentation versioning](../engineering/OES-0010-Versioning-Standards.md#documentation-versioning).
It versions this document only and does not change any runtime or Engine version.

Version 1.0.1 is a PATCH recording human lifecycle approval and synchronizing
status without changing the reviewed architectural semantics. Draft 1.0.0
history and the earlier option-selection decision remain preserved.

Version 1.1.0 records an approved normative addition resolving the previously
open access-model choice within the established controlled nonproduction scope.
It uses a MINOR increment under OES-0010 rather than treating a new policy
selection as an editorial PATCH. Existing approved operations, Engine/Core/C1
semantics, and runtime versions remain unchanged.
