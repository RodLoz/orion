# Bounded Application Transport-Independent API Specification

| Field          | Value                                                                 |
| -------------- | --------------------------------------------------------------------- |
| **Status**     | Active                                                                |
| **Version**    | 1.1.1                                                                 |
| **Owner**      | Project Maintainers                                                   |
| **Created**    | 2026-09-15                                                            |
| **Updated**    | 2026-09-15                                                            |
| **Applies To** | Controlled nonproduction bounded application execution under ADR-0029 |

---

## Purpose, status, and authority

This Active specification defines the public application boundary required by Active
[ADR-0029 1.1.0](../docs/adr/ADR-0029-Bounded-Application-Transport-API-Boundary.md).
It governs API representations within the approved architecture. MUST and MUST
NOT express conformance requirements subordinate to governing authority under
[DOCUMENT-AUTHORITY](../docs/DOCUMENT-AUTHORITY.md). Human lifecycle approval is
recorded below; it does not authorize implementation, production, or deployment.

The boundary exposes bounded execution against explicitly prepared server-bound
state. It preserves D1/D2 OPTION B, D3/D4 OPTION A, D5 OPTION A, and Rodrigo
Lozano's S09-S11 PASS OPTION A. It does not supersede any Engine specification,
canonical Contract, Core contract, or [C1 record](../IMPLEMENTATION-C1.md).

This is an API Specification under [OES-0008](../docs/engineering/OES-0008-Documentation-Standards.md),
placed in the existing specifications directory under
[OES-0001](../docs/engineering/OES-0001-Repository-Structure.md).
No numbered API identifier or CONTRACT-0002 is allocated.

## Public operation and request contract

The sole public operation is **Execute bounded query**. This descriptive name
identifies an abstract operation, not a route, procedure binding, or wire name.
Admission requires the access and binding preconditions below. The operation
returns one of the final-result representations or the sanitized failure
indication defined here. It exposes no intermediate cognitive artifacts.

The abstract request has exactly these application data fields:

| Field       | Domain and correspondence                                                                                                                                           |
| ----------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `requestId` | Existing Brain request identifier: 1-128 ASCII characters, first character alphanumeric, remaining characters alphanumeric or `.`, `_`, `:`, `-`. Correlation only. |
| `query`     | Existing bounded query with exactly `kind`, `subjectKey`, and `predicateKey`.                                                                                       |

`query.kind` MUST equal `exact-text-attribute-value`. Each key MUST meet the
existing Reasoning 3 semantic identifier domain: nonblank text, at most 128
Unicode code points, no leading or trailing whitespace, and no Unicode Control
(`Cc`) character. Values MUST NOT be trimmed, normalized, coerced, or inferred
from arbitrary text. Unknown application fields and invalid values are rejected,
not repaired. The existing constructors in [Core Reasoning](../core/src/reasoning.ts)
and [Core Brain](../core/src/brain.ts) remain the source of domain validity.
Their in-process exact-record checks remain applicable when constructing Core
values; this document does not prescribe an object encoding.

The application mapping supplies the existing internal intent
`orchestrate-cognitive-request`, the configured private `contextLineageId`, and
`executionIntent.kind` equal to `none`. The caller supplies neither preparation
selection nor Skill execution intent. No general Skill execution API is added.
The request identifier is forwarded unchanged and grants no authority,
preparation selection, uniqueness guarantee, replay protection, or idempotency.
It is not an observer diagnostic correlation identifier.

Verified caller identity is an admission prerequisite separate from these
application fields. A request field claiming an identity is not evidence.
The evidence carrier and verification technology remain unselected.

## Server-bound preparation and execution

Before admission, the internal application owner MUST explicitly prepare state
through existing C1 capabilities and establish its corresponding Brain binding.
[Bounded application composition](../services/bootstrap/src/brain/bounded-application-composition.ts)
composes capabilities; its exported functions are not public operations.

For an admitted execution, configuration MUST unambiguously associate the
permitted principal with the prepared Context lineage and corresponding Brain.
The mapping MUST preserve existing Context lookup and authority verification.
It MUST NOT manufacture Context, substitute another preparation, infer sources
or profile, automatically prepare or refresh state, or treat query data as
authority. Invalid or unavailable bound state cannot produce a fabricated
completed result.

The binding does not pin a new revision lifetime, renew currentness, transfer
Context authority, or authenticate the caller. Preparation and execution remain
explicitly separate. There is no public preparation operation, preparation
selector, opaque preparation handle, or session-creation operation.

## Response contract

These are abstract data records, not a serialization selection. Only the listed
fields are public. Both completed forms preserve the corresponding existing
Brain final-result fields and exact literals:

| Form                 | Fields and values                                                                                                                                       |
| -------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Successful response  | `status`: `completed`; `kind`: `response`; `requestId`: unchanged admitted request identifier; `response`: exact accepted bounded textual scalar.       |
| Request more context | `status`: `completed`; `kind`: `request-more-context`; `requestId`: unchanged admitted request identifier; `reason`: `planning-requested-more-context`. |
| Sanitized failure    | `status`: `failed`. No additional application fields.                                                                                                   |

The failure form indicates only that execution did not yield a completed
cognitive result. It is not a new cognitive Outcome category or diagnostic
taxonomy. No internal error code, exception name, cause, stack, message, stage,
retry classification, or authority evidence is returned. Malformed requests,
denied admission, invalid bindings, and execution failures receive this same
application indication when an application response can be conveyed. This does
not prescribe protocol behavior when communication itself fails.

An unauthorized or unverified caller MUST NOT reach cognitive execution or
receive any prepared-state content. A failure does not trigger preparation,
fallback execution, or a successful empty response.

## Exact outcome and scalar correspondence

The [Active bounded Reasoning supplement 2.0.0](engines/reasoning/ENGINE-0006-Reasoning-Engine-Executable-Bounded-Rule.md)
governs evaluation and exact internal literals:

- R1: `The bounded Knowledge tuple satisfies the Reasoning query.`
- R2: `The bounded Knowledge tuple does not satisfy the Reasoning query.`
- R3: `Additional context may be required before another bounded evaluation.`

These literals remain internal at the places governed by that supplement. They
are not additional API fields. Planning and Brain MUST retain their existing
transformation; the API MUST NOT publish internal conclusions, categories, or
candidate responses absent from the final-result boundary.

| Existing condition                                                            | Required public correspondence                                                                                                                                                            |
| ----------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Applicable, sufficient bounded textual evidence                               | Completed response containing the exact accepted scalar.                                                                                                                                  |
| Exact subject or predicate mismatch                                           | Existing completed non-applicable Outcome flows through Planning to completed request-more-context, not failure.                                                                          |
| Anonymous prepared Context, with an independently authorized transport caller | Existing anonymous Outcome and downstream completed request-more-context; no new applicability or sufficiency evaluation.                                                                 |
| Applicable but insufficient evidence in the broader parent model              | Parent meaning remains preserved, but this condition is unreachable in the valid textual-only executable subset. It MUST NOT be fabricated to disguise invalid input or upstream failure. |

Under [ADR-0028](../docs/adr/ADR-0028-Bounded-Downstream-Response-Domain-Correspondence.md),
successful `response` preserves the exact accepted scalar through 4096 Unicode
code points inclusive, including non-BMP characters and leading, trailing, and
internal whitespace. Existing nonblank and Control-character validity rules
remain unchanged. Count code points, not bytes or UTF-16 code units.
No truncation, paraphrase, decoration, whitespace or Unicode normalization,
or semantic conversion is permitted. A 4097-code-point value is rejected, not
repaired. Eventual encoding and decoding must preserve exact value identity.

[ADR-0027](../docs/adr/ADR-0027-Brain-Structured-Query-Request-Domain.md)
continues to govern structured-query forwarding. Existing legacy text requests,
response limits, and behavior remain unchanged in their existing interfaces;
this bounded API does not add legacy free-text execution or widen legacy limits.

## Failure ownership and private authority

Failure Option A is preserved. Semantic failure ownership stays with the
originating responsibility. Existing Brain boundary normalization stays intact.
Internal exception identity need not cross Brain or the API boundary; private
causes do not become public by default. Sanitization does not transfer ownership
or transform failure into a completed cognitive Outcome.

| Responsibility     | Preserved authority and correspondence                                                                                                                                        |
| ------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Context            | Preparation, active-revision lookup, lifecycle, incorporation, and Context authority remain with Context and its [contracts](../core/src/context-contracts.ts).               |
| Reasoning          | Evaluation and exact Outcome authority remain with Reasoning and its [contracts](../core/src/reasoning-contracts.ts).                                                         |
| Planning           | Candidate Plan creation and verification remain with Planning and its [contracts](../core/src/planning-contracts.ts).                                                         |
| Brain              | Orchestration, verification boundaries, normalization, and final-result assembly remain with Brain and its [contracts](../core/src/brain-contracts.ts).                       |
| Security           | Policy and authorization ownership remain governed by [OES-0009](../docs/engineering/OES-0009-Security-Standards.md); transport cannot mint permission from Context Identity. |
| Bootstrap and Core | Composition stays in Bootstrap; shared language stays in Core. No capability semantics or contracts change.                                                                   |

The API MUST NOT expose ContextLineageId, revision authority, Reasoning Outcome
authority, Candidate Plan authority, verifier evidence, provenance, source or
Knowledge/proposition identifiers, engine implementation identities, private
reasoning traces, or observer evidence. Successful scalar disclosure does not
authorize disclosure of the surrounding internal object graph.

Only the request fields, completed-result fields, and minimal failure indication
specified above belong to the public application data surface. Authentication
evidence is not echoed. Diagnostics MUST NOT provide an alternate disclosure
channel. Existing observer isolation and privacy remain unchanged; observer
events and diagnostic correlation identifiers are not response fields.

## Controlled nonproduction admission

Exactly one explicitly designated nonproduction service/test principal may be
permitted. Identity evidence MUST be verified through the governed access
mechanism. Authorization MUST be limited to that principal's configured
server-bound preparation. Self-asserted identity, anonymous transport access,
client-selected preparation, and authorization inferred from Context Identity
are prohibited. An internal/nonproduction label alone is not enforcement.

### Human access decision

| Field          | Value                                                                                                                |
| -------------- | -------------------------------------------------------------------------------------------------------------------- |
| Decision maker | Rodrigo Lozano                                                                                                       |
| Decision       | PASS — OPTION A with the concrete transport-independent access model below                                           |
| Decision date  | 2026-09-15                                                                                                           |
| Scope          | Document-level admission rule; specification remained Draft at this access decision; no implementation authorization |

This access decision is distinct from approval or activation of the complete
specification. It resolves the transport-independent principal, ownership,
verification responsibility, mapping, and preparation association. It does not
claim that authentication or admission enforcement has been implemented.

### Principal and ownership

The sole designated principal is `orion.bounded-api.nonproduction`, for the
controlled nonproduction service/test caller of bounded application execution.
The bounded application admission boundary / Bootstrap application composition
responsibility owns this designation and its configuration. This ownership does
not transfer Security policy semantics or Identity Engine semantics.

The designation is not a human user identity, Context Identity, ContextLineageId,
requestId, Identity demonstration identity, credential, or production principal.
It creates no new Identity Engine state or service-identity Contract. It is not
an additional request field or a claim that a caller may assert to gain access.

### Verification and mapping

The future transport/admission adapter MUST verify caller identity evidence
independently before bounded execution can be admitted. Evidence MUST originate
from the eventual selected transport authentication mechanism, never from
request payload claims. The adapter MUST provide the independently verified
caller identity evidence to the application admission boundary. This document
governs the transport-independent verification result and admission conditions;
it defines neither an evidence carrier nor a new runtime evidence schema.

Following successful verification, the verified caller identity MUST map exactly
to `orion.bounded-api.nonproduction`. No other principal mapping is admitted.
Absent, invalid, unverified, or self-asserted evidence MUST NOT admit execution.
A verified identity mapped to another principal MUST NOT admit execution.
Context-derived identity MUST NOT establish transport admission. These are
admission conditions, not new Reasoning or Security Engine diagnostic categories;
the existing sanitized public failure representation remains unchanged.

Authentication technology and evidence carrier remain deliberately unselected.
Verification by an adapter does not mint authoritative Core Identity values,
change Identity resolution semantics, or turn a resolution reference into a
credential. Any later integration with Core Identity must preserve its existing
capability and source boundaries.

### Governed admission rule and preparation association

| Established concept    | Admission rule                                                                                                                                      |
| ---------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------- |
| Subject                | `orion.bounded-api.nonproduction`, established through independently verified transport evidence.                                                   |
| Protected action       | Bounded application execution.                                                                                                                      |
| Resource/applicability | The internally configured server-bound preparation associated with this bounded application composition.                                            |
| Decision               | Admit only when verified identity, designated principal, protected action, and configured binding all correspond; otherwise do not admit execution. |

This is a document-level Security-governed admission rule under ADR-0029 and
OES-0009. It is not a runtime policy DSL, policy file format, new Security
Contract, or Security-issued decision artifact. Security retains semantic policy
ownership. The protected application admission boundary enforces the rule before
calling bounded execution; C1 itself remains unchanged.

Bootstrap/application configuration controls the internal preparation association.
The caller MUST NOT select preparation, provide ContextLineageId or a preparation
identifier, change the binding, or infer authority from requestId or Context
Identity. The binding retains all existing Context lookup, authority, and
lifecycle requirements described above.

### Remaining implementation prerequisites

No transport-independent access-model choice remains open in this specification.
Before implementation authorization, the eventual adapter's actual authentication
mechanism, evidence verification and mapping, trusted delivery to admission,
and enforcement of the configured binding MUST be concretely specified and
reviewed. Verification must establish the caller, not merely compare a claimed
principal string. Demonstrable denial and binding-isolation behavior remain
required. These deferred implementation prerequisites are not supplied or waived
by this human decision or by later specification activation. Production access,
production authentication integration, and deployment remain unauthorized.

## Lifecycle, concurrency, and delivery boundaries

Resource lifetime remains with the internal C1 caller. There is no public
shutdown operation. Existing Knowledge cleanup behavior remains unchanged, with
no new global revocation guarantee for retained Context or Brain handles.

This specification creates no client session, lease, automatic renewal, or
revision-pinning guarantee. Each admitted invocation must use its unambiguous
authorized binding and existing authority checks. It adds no ordering,
exactly-once delivery, replay acceptance, deduplication, or idempotency guarantee.
Repeated `requestId` values do not confer any such guarantee. Future execution
and protocol design must establish safe concurrency and delivery handling before
implementation authorization; it cannot bypass admission or silently introduce
new state/lifecycle semantics. Requests must not be retried as a newly promised
API behavior without governed review.

## Non-goals and implementation gates

No protocol, serialization technology, network or deployment topology, endpoint,
port, production exposure, or production authentication integration is selected.
No new Engine semantics, Core contracts, C1 behavior, canonical Contract,
diagnostic taxonomy, Skill surface, preparation operation, or shutdown surface
is introduced. Protected Skill boundaries remain unchanged.

Before transport implementation can be authorized:

1. Preserve the approved representations, correspondence, and recorded human
   access decision while resolving the remaining implementation prerequisites.
2. Preserve the human specification approval recorded below; any subsequent
   changes must follow applicable versioning and review requirements.
3. Establish the implementation's protocol mapping and admission enforcement,
   including safe delivery/concurrency handling, without changing the approved
   boundary or leaking private authority. New semantic changes require their
   applicable governance before implementation.
4. Obtain explicit human implementation authorization for the reviewed scope.

Specification creation or activation does not authorize implementation,
production, or deployment. All three remain unauthorized.

## Future verification obligations

A future authorized implementation must demonstrate:

- Exact request-domain validation, unchanged structured query values, correct
  internal intent/binding, and rejection of selectors or extra application data.
- Admission only for verified evidence of the designated principal and only for
  its configured preparation; denial for absent, self-asserted, unrelated, or
  invalid identity evidence independently of Context Identity.
- Explicit preparation before execution, no automatic preparation, and no
  substitution when the configured binding is invalid or unavailable.
- Both completed-result forms, anonymous Context and mismatch correspondence,
  unchanged R1/R2/R3, and no fabricated insufficient-evidence state.
- Exact scalar round trips, including whitespace and non-BMP values, the 4096
  boundary, rejection at 4097, and unchanged legacy limits and behavior.
- Existing Context, Outcome, and Plan authority checks; retained Brain
  normalization and originating failure ownership; the same sanitized failure
  surface without private causes, authority objects, or observer evidence.
- No public preparation/shutdown operations; preserved C1 cleanup and observer
  behavior; no unsupported retry, replay, ordering, or idempotency guarantees.

These are future conformance obligations, not a claim of transport test evidence.
Existing C1 PASS, R4 closure, and runtime/test evidence remain unchanged.

## Human lifecycle approval

| Field                          | Value                                              |
| ------------------------------ | -------------------------------------------------- |
| Decision maker                 | Rodrigo Lozano                                     |
| Decision                       | PASS — complete specification lifecycle activation |
| Decision date                  | 2026-09-15                                         |
| Review route                   | SINGLE_MAINTAINER                                  |
| INDEPENDENT_REVIEW             | NOT_APPLICABLE_SINGLE_MAINTAINER                   |
| MAINTAINER_REVIEW              | PASS                                               |
| Reviewed version               | Draft 1.1.0                                        |
| Transition                     | Draft -> Active following review and approval      |
| Recorded version               | Active 1.1.1                                       |
| Blocking findings              | 0                                                  |
| Accepted non-blocking findings | 2                                                  |

Rodrigo Lozano supplied lifecycle PASS following the complete specification
review. This records human approval separately from the earlier access-model
selection. The established single-maintainer route continues; independent review
is unavailable under that route and no independent reviewer is fabricated.

Review evidence covered the complete Draft, ADR-0029, C1, documentation lifecycle
and versioning authority, Security ownership, bounded Outcome/scalar authority,
and Markdown, local-link, metadata/history, scope, and preservation checks.
The rationale for approval is complete transport-independent semantics with
implementation prerequisites explicitly retained.

The accepted non-blocking findings remain follow-up obligations:

- F1: Before implementation authorization, specify and review actual authentication,
  evidence mapping and trusted delivery, binding enforcement, and delivery/concurrency
  handling. Lifecycle approval does not establish implemented enforcement.
- F2: Future conformance verification must cover valid 2048-, 2049-, and 4096-code-point
  bounded scalars and rejection at 4097, preserving the distinct legacy 2048 limits.

Implementation, production, and deployment remain unauthorized. The next governed
checkpoint is concrete transport/authentication/admission design definition and
review; explicit bounded implementation authorization remains subsequent.

## Compatibility and document history

[OES-0010](../docs/engineering/OES-0010-Versioning-Standards.md) governs versioning
and change management. This 1.1.1 version identifies the Active specification, not a
deployed API or wire-version negotiation mechanism. Breaking public contract
changes require the applicable major-version treatment and review; additive
compatible changes and corrections follow minor/patch rules. Versioning cannot
authorize a conflict with higher authority.

| Version | Date       | Change                                                                                                                                                                                                                                                                                                |
| ------- | ---------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1.1.1   | 2026-09-15 | Recorded Rodrigo Lozano lifecycle PASS; activated the reviewed specification, retained both non-blocking follow-up obligations and all implementation/production/deployment exclusions; no semantic change.                                                                                           |
| 1.1.0   | 2026-09-15 | Recorded Rodrigo Lozano PASS OPTION A: designated nonproduction principal, application ownership, independent verification responsibility, exact mapping, internal binding and document-level admission rule; authentication technology deferred; remains Draft without implementation authorization. |
| 1.0.0   | 2026-09-15 | Initial Draft under Active ADR-0029 1.1.0; defines transport-independent execution and minimal results, preserves C1 and private authority, records unresolved concrete access obligations; no lifecycle approval or implementation/deployment authorization.                                         |

Version 1.1.0 records the human-selected normative access addition as a MINOR
increment, consistent with ADR-0029's access-decision versioning precedent.
Versions 1.0.0 and 1.1.0 history are preserved. Neither earlier version recorded
specification lifecycle approval. Version 1.1.1 is a PATCH recording approval and
synchronizing lifecycle wording without changing the reviewed semantics.
