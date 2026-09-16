# ADR-0030 — Caller-Driven Multi-Turn Application Runtime

| Field             | Value                                                                              |
| ----------------- | ---------------------------------------------------------------------------------- |
| **Status**        | Active                                                                             |
| **Version**       | 1.0.1                                                                              |
| **Owner**         | Project Maintainers                                                                |
| **Created**       | 2026-09-15                                                                         |
| **Updated**       | 2026-09-15                                                                         |
| **Applies To**    | Interface-independent, process-local, caller-driven multi-turn application runtime |
| **Decision Type** | Architecture Decision                                                              |

## Status and human policy selection

ADR-0030 is Active following Rodrigo Lozano's explicit human lifecycle PASS
on 2026-09-15 after review of Draft 1.0.0. This approval is distinct from the
earlier product/scope and policy selections recorded below. The transition
follows [OES-0008](../engineering/OES-0008-Documentation-Standards.md) and
[DOCUMENT-AUTHORITY](../DOCUMENT-AUTHORITY.md); activation does not authorize
runtime implementation, production, or deployment.

| Decision field                                              | Recorded value                                                                            |
| ----------------------------------------------------------- | ----------------------------------------------------------------------------------------- |
| Decision maker                                              | Rodrigo Lozano                                                                            |
| Decision date                                               | 2026-09-15                                                                                |
| Product/scope selection                                     | PASS — interface-independent, process-local, caller-driven multi-turn application runtime |
| D1 preparation policy                                       | OPTION A — one preparation/binding per runtime                                            |
| D2 overlapping operations                                   | OPTION A — strictly sequential admission, reject overlap                                  |
| D3 failed-turn continuation                                 | OPTION A — subsequent explicit turns subject to existing checks                           |
| D4 shutdown                                                 | OPTION A — close admission, settle admitted work, preserve existing cleanup               |
| Authorization granted                                       | Governance authoring only                                                                 |
| ADR text lifecycle approval                                 | Complete; separate lifecycle PASS recorded below                                          |
| Runtime implementation / production / deployment authorized | NO / NO / NO                                                                              |

### Human lifecycle activation

| Field                          | Value                                         |
| ------------------------------ | --------------------------------------------- |
| Decision maker                 | Rodrigo Lozano                                |
| Decision                       | PASS — ADR-0030 lifecycle activation          |
| Decision date                  | 2026-09-15                                    |
| Review route                   | SINGLE_MAINTAINER                             |
| INDEPENDENT_REVIEW             | NOT_APPLICABLE_SINGLE_MAINTAINER              |
| MAINTAINER_REVIEW              | PASS                                          |
| Reviewed version               | Draft 1.0.0                                   |
| Transition                     | Draft -> Active following review and approval |
| Recorded version               | Active 1.0.1                                  |
| Blocking findings              | 0                                             |
| Accepted non-blocking findings | 2                                             |

The established single-maintainer review route continues; independent review is
unavailable under that route and no independent reviewer is fabricated. The human
PASS follows the complete ADR review against D1-A through D4-A, C1, Bootstrap,
Brain, Context, Knowledge cleanup, existing transport/API authority, documentation
rules, and document/preservation validation. The reviewed scope preserves existing
semantic ownership and leaves implementation gated.

The accepted non-blocking findings remain subordinate specification obligations:

- F1: Define preparation-attempt/readiness transitions and distinguish preparation
  failure from ordinary turn failure without introducing retry or re-preparation.
- F2: Specify and verify application admission closure, in-flight settlement,
  repeated shutdown, and observable cleanup failure without claiming global
  revocation of underlying Context/Brain handles.

This lifecycle approval neither changes D1-A/D2-A/D3-A/D4-A nor authorizes runtime
implementation, transport implementation, production, or deployment.

## Context

[C1](../../IMPLEMENTATION-C1.md) provides an approved bounded application
composition. Its caller explicitly prepares Context, establishes the corresponding
Brain binding, submits requests, and owns the composition lifetime. Brain
orchestrates one request; C1 does not supply application-level multi-turn policy.

The selected product direction is a persistent governed cognitive assistant
runtime. This initial capability retains one composition across explicit turns
within one process. It does not promise restart continuity or autonomous agency.

## Problem statement

The application needs an owner for admission and lifetime across multiple calls
without moving preparation, cognition, verification, authorization, or cleanup
semantics out of their existing owners. Repeated method calls alone do not define
overlap, failure-continuation, or shutdown behavior.

## Decision

### Definitions and responsibility

A **runtime** is one process-local application instance retaining one approved
C1 composition and the application admission/lifecycle state needed to coordinate
its use. A separate session abstraction, session identifier, or conversation
history is not introduced.

A **turn** is one explicitly caller-initiated and admitted cognitive request,
ending in one existing final result or a surfaced failure. Preparation is a
separate explicit operation, not an inferred part of a turn. A returned result
does not authorize or initiate another turn.

**Prepared state** means the existing Context-owned active state accessible
through its lineage and the corresponding internal Brain binding. It is not a
copy of authority, a new public handle, or a revision-pinning guarantee.

The application runtime owns admission, sequencing, retained composition lifetime,
and coordination of shutdown. It acts as the C1 caller. Bootstrap continues to
assemble approved participants; the placement of application wiring must not
transfer application policy or Engine semantics to Bootstrap composition.

| Responsibility                                                                     | Preserved owner                                               |
| ---------------------------------------------------------------------------------- | ------------------------------------------------------------- |
| Composition                                                                        | Bootstrap and the existing C1 composition                     |
| Preparation, active revision lookup, revision lifecycle and Context authority      | Context; application initiates explicitly                     |
| Single-request sequencing, verification boundaries, normalization and final result | Brain                                                         |
| Bounded evaluation and Outcome authority                                           | Reasoning                                                     |
| Advisory Candidate Plan and its authority                                          | Planning                                                      |
| Authorization semantics and protected invocation                                   | Existing Security and Skill owners and enforcement boundaries |
| Knowledge resource settlement and cleanup                                          | Existing Knowledge/composition cleanup path                   |
| Application admission and lifetime across calls                                    | New application runtime responsibility only                   |

### D1-A: One preparation/binding per runtime

The runtime retains one C1 composition and permits one preparation/binding for
that runtime. Re-preparation within the same runtime is deferred. Different
preparation requires a new runtime. No request may infer preparation, refresh,
source material, profile selection, or replacement of an invalid binding.

This restriction does not alter Context's reuse/successor behavior, freeze a
revision, renew currentness, or replace active lookup and authority checks.
The runtime must not claim that preparation permanently guarantees readiness.
No second preparation is authorized merely because an earlier attempt failed;
the subordinate specification must make attempt/readiness correspondence explicit
without adding an unapproved retry or re-preparation path.

### D2-A: Sequential admission without a queue

Preparation and turns are admitted strictly sequentially. Overlapping preparation
or turn operations are rejected. The runtime does not queue, schedule, defer
acceptance through a hidden queue, or execute operations in parallel.

Every turn requires explicit caller initiation/authorization. This is not a
credential, new Security grant, or bypass of protected Skill authorization or
confirmation. Existing readiness, lifecycle, authority, and Engine checks apply.

### D3-A: Ordinary failed-turn continuation

After an ordinary turn failure, application admission returns to idle and a later
explicitly caller-initiated turn may proceed subject to all existing checks.
If shutdown has begun, admission remains closed instead. There is no automatic
retry, fallback execution, or automatic continuation.

The runtime must not repair or reclassify invalid Engine state as recoverable,
fabricate readiness, or bypass failed authority verification. Idle means that no
application turn is in progress, not that every underlying capability is healthy.

Failure Option A remains unchanged: semantic failure ownership stays with the
originating responsibility and Brain normalization stays intact. Internal exception
identity need not propagate unchanged across boundaries; private causes do not
automatically become public. Preparation failures remain with their originating
Identity/source/Context responsibilities; execution and cleanup failures likewise
retain their existing owners. No public diagnostic taxonomy is introduced.

### D4-A: Close admission, settle, then clean up

A shutdown request immediately closes admission to new runtime operations.
If one operation is already admitted, it is allowed to settle without cancellation;
the runtime then invokes the existing cleanup path. Shutdown does not admit new
turns or a queued continuation. Repeated shutdown observes the existing terminal
and shared cleanup semantics.

Cleanup failure remains observable and cannot reopen admission. Neither successful
nor failed shutdown permits subsequent preparation or turns through this runtime.
No automatic cleanup retry is introduced. Existing Knowledge settlement semantics
remain intact.

C1 shutdown delegates existing Knowledge-resource cleanup and does not globally
revoke retained Context/Brain handles. Application admission closure must not be
represented as a new Engine stop operation or global authority revocation.

### Retained state and lifecycle correspondence

The runtime may retain its composition, internal preparation/binding references,
and admission/lifecycle bookkeeping across turns. Existing Engine-owned in-memory
state remains owned by those Engines. It does not retain results as new Memory,
Knowledge, observation evidence, or conversation history automatically.

Creation assembles the composition; explicit preparation establishes the usable
binding; admitted turns settle back to idle unless shutdown has closed admission.
Shutdown coordinates settlement and cleanup. Exact operation signatures and state
representation belong to the subordinate specification, not a new Engine lifecycle.
No durable state, restart reconstruction, or session persistence is introduced.

### Authority preservation and deferred scope

Engine semantics, Core Contracts, C1, Context revision and preparation authority,
Brain single-request orchestration, Reasoning Outcome authority, Candidate Plan
authority, Security and protected Skills, and observer privacy remain unchanged.
Observer delivery does not initiate a turn or transfer private authority.

The [bounded Reasoning supplement](../../specifications/engines/reasoning/ENGINE-0006-Reasoning-Engine-Executable-Bounded-Rule.md),
[ADR-0027](ADR-0027-Brain-Structured-Query-Request-Domain.md), and
[ADR-0028](ADR-0028-Bounded-Downstream-Response-Domain-Correspondence.md) retain exact
query/result correspondence, R1/R2/R3, successful scalar identity through 4096
Unicode code points, anonymous/mismatch/insufficient-evidence behavior, and legacy
limits. No turn policy changes those meanings.

Deferred capabilities are automatic result-to-observation ingestion, autonomous
continuation or action loops, automatic retries, queues, schedulers, background
cognition, proactive events, restart persistence, durable sessions, external
transport implementation, and voice/desktop/mobile or other UI adapters.

[ADR-0029](ADR-0029-Bounded-Application-Transport-API-Boundary.md) and the
[Active transport-independent API specification](../../specifications/Bounded-Application-Transport-Independent-API-Specification.md)
remain valid future interface authority, neither reopened nor superseded here.
Internal preparation/shutdown do not become public API operations. This ADR
does not broaden the API's execution-only contract or select a transport,
authentication mechanism, serialization, or deployment topology.

## Rationale and alternatives considered

Retaining one composition supports repeated explicit use without adding a
conversation model. One preparation keeps the first runtime bounded, at the
cost of requiring a new runtime for different preparation. Explicit in-runtime
re-preparation was deferred.

Rejecting overlap avoids queue ordering and background execution semantics.
Ordinary failure continuation preserves caller control without requiring every
failed request to destroy the composition. Automatic retries and treating every
failure as recoverable were not selected.

Closing admission before settlement gives shutdown a clear boundary while
preserving existing cleanup. Rejecting shutdown solely because work is in flight
was not selected. Cancellation and global revocation are outside this decision.

## Consequences and implementation gates

This ADR introduces application ownership, not implementation authorization.
The next required checkpoint after ADR approval is a subordinate runtime
specification defining operation boundaries, lifecycle transitions, readiness,
overlap rejection, ordinary-failure continuation, shutdown settlement, retained
state, privacy, and conformance obligations. No specification identifier or
filename is allocated here, and that specification is not created by this ADR.

Human review/approval and lifecycle activation are recorded above.
The runtime specification must then receive its applicable human review and
approval before explicit bounded implementation authorization is considered.
Neither ADR activation nor specification activation authorizes implementation,
production, or deployment. Existing unrelated implementation approvals remain
within their original scopes.

## Roadmap synchronization

The [Draft roadmap](../roadmap.md) is a planning summary and predates C1, current
bounded Reasoning, and the Active API specification. Later synchronization must
preserve historical M0-M10 evidence, replace stale current-state claims with
current authority references, and record this selected runtime workstream as
governance work with implementation pending. Transport remains an established
deferred interface workstream. No new milestone identifier is allocated.

No inspected authority requires roadmap editing atomically with creation of this
initial Draft ADR. Roadmap synchronization is a separate follow-up, not lifecycle or
implementation approval inferred from a planning document.

## Risks and future review

Idle admission could be mistaken for healthy Engine state; each operation must
retain existing checks. Retained raw handles could be mistaken for globally
revoked handles after shutdown; the specification must describe the application
boundary accurately. Preparation failure and shutdown settlement need explicit
conformance cases, not implicit retries or cancellation.

Any future re-preparation, sessions, concurrency, feedback, autonomy, persistence,
or interface expansion requires its own governed scope and review before use.

## Dependencies and related documents

- [ADR-0007: Brain orchestration](ADR-0007-Brain-Orchestration-Ownership-and-Planning-Binding.md)
- [ADR-0013: Failure ownership](ADR-0013-Failure-Ownership-Propagation-and-Candidate-Context-Revision-Consequences.md)
- [ADR-0014: Bootstrap composition](ADR-0014-Bootstrap-Composition-Responsibility-and-Ownership-and-Authority-Preservation.md)
- [ADR-0018: Repeated preparation boundaries](ADR-0018-Refresh-Recollection-and-Repeated-Context-Preparation-Boundaries.md)
- [OES-0010: Versioning](../engineering/OES-0010-Versioning-Standards.md)

## Change history

| Version | Date       | Description                                                                                                                                                                                   |
| ------- | ---------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1.0.1   | 2026-09-15 | Recorded Rodrigo Lozano lifecycle PASS; activated ADR-0030, preserved both non-blocking follow-up obligations and all implementation/production/deployment exclusions; no semantic change.    |
| 1.0.0   | 2026-09-15 | Initial Draft recording Rodrigo Lozano's product/scope selection and D1-A/D2-A/D3-A/D4-A; ADR lifecycle approval pending; no runtime implementation, production, or deployment authorization. |

Version 1.0.0 follows the initial ADR template and versions this document only.

Version 1.0.1 is a PATCH recording lifecycle approval and synchronizing status
without changing the reviewed policies. Draft 1.0.0 history remains preserved.
