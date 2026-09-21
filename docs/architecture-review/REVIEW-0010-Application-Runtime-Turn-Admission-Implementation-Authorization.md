# REVIEW-0010 — Application Runtime Turn Admission Implementation Authorization

| Field           | Value                                                          |
| --------------- | -------------------------------------------------------------- |
| **Status**      | Active                                                         |
| **Version**     | 1.0.1                                                          |
| **Owner**       | Project Maintainers                                            |
| **Created**     | 2026-09-20                                                     |
| **Updated**     | 2026-09-21                                                     |
| **Review Type** | Architecture Review                                            |
| **Applies To**  | Proposed nonproduction Application Runtime turn admission only |

---

# Executive Summary

This review records Rodrigo Lozano's human PASS on Draft 1.0.0 for the next bounded physical Application Runtime slice: **explicit turn admission from Ready**. The authorized implementation may accept one explicitly caller-initiated turn only while the runtime is eligible, change its internal state consistently from **Ready** to **Turn In Progress**, and reject premature or overlapping turn admission without queueing or changing the existing state.

This slice ends at admission. It does not invoke Brain orchestration, execute a turn, produce a result, settle success or failure, continue after failure, or implement shutdown. The existing future execution path through the retained C1 Brain binding remains outside this boundary.

[ADR-0030](../adr/ADR-0030-Caller-Driven-Multi-Turn-Application-Runtime.md) and the Active [Application Runtime Specification](../../specifications/Application-Runtime-Specification.md) and [Application Runtime Implementation Specification](../../specifications/Application-Runtime-Implementation-Specification.md) supply the semantic obligations. They do not grant physical implementation authority. [REVIEW-0008](REVIEW-0008-Application-Runtime-First-Physical-Slice-Implementation-Authorization.md) and [REVIEW-0009](REVIEW-0009-Application-Runtime-Real-Preparation-and-Brain-Binding-Implementation-Authorization.md) are exhausted within their recorded scopes and do not authorize this follow-up.

Draft creation granted no implementation authority. **The recorded human PASS below grants implementation authority only for this review's admission-only behavior and exact two-file boundary.** Executable evidence and complete Runtime conformance remain later determinations. Production and deployment remain **NOT AUTHORIZED**.

# Findings

## Governing authority and completed prerequisites

ADR-0030 assigns application operation admission and lifecycle bookkeeping to the Runtime. D2-A requires strictly sequential preparation and turn admission, explicit caller initiation, overlap rejection, and no queue, scheduler, deferred acceptance, or parallel execution. Brain retains single-request orchestration authority; Bootstrap retains C1 composition authority; Context and all other Engines retain their existing semantic authority.

The Active Runtime Specification defines **Ready → Turn In Progress** as the admission and execution path for an explicit turn. Its _Turn Execution_, _Invalid Operations_, and _Turn Admissions and Correspondence_ sections require readiness, open admission, and no overlap. The Active Implementation Specification requires mutually exclusive admission and a state change consistent with the admission decision. Neither specification fixes a physical method name, class name, exported type, error string, or public API shape.

The implementation at repository baseline `efb7f324332aa5876481535372e2b5a866ccfa04` physically implements the prior preparation slices in [`services/runtime/src/runtime.ts`](../../services/runtime/src/runtime.ts). A runtime instance may reach **Ready** only after explicit Context preparation and exact-lineage Brain binding. [`services/runtime/test/runtime.test.ts`](../../services/runtime/test/runtime.test.ts) contains focused evidence for those implemented facts. That implementation and its tests are executable evidence within the earlier scopes; neither creates authority for turn admission.

## Exhausted prior implementation authorization

REVIEW-0008 authorized only initial preparation admission and single-attempt bookkeeping. REVIEW-0009 authorized only real Context preparation, exact Brain binding, and preparation success or failure settlement. REVIEW-0009 expressly excluded turn admission, turn execution, turn result handling, and full preparation-versus-turn concurrency. Neither recorded human PASS is reusable or broadened by the Runtime reaching Ready.

## Proposed physical file boundary

Only these two existing files are authorized for implementation:

| File                                    | Demonstrated necessity                                                                                                                         |
| --------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------- |
| `services/runtime/src/runtime.ts`       | Extend the existing internal lifecycle bookkeeping with explicit admission from **Ready** to **Turn In Progress** and rejection outside Ready. |
| `services/runtime/test/runtime.test.ts` | Add focused evidence for the proposed admission behavior and regression evidence for the existing preparation behavior.                        |

No dependency, package metadata, TypeScript configuration, workspace, lockfile, Bootstrap, Core, Engine, CI, architecture metadata, ADR, specification, roadmap, or other repository change is demonstrated as necessary. Every file other than the two listed above is outside the proposed boundary. A need for any additional file is a stop condition requiring further human-reviewed governance before that file is changed.

## Proposed behavioral boundary and authority trace

| Proposed behavior                                                                                            | Governing basis                                                                                                                                                           |
| ------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Preserve the already-implemented preparation path and its settled **Ready** or **Preparation Failed** state. | ADR-0030 D1-A; Runtime Specification, _Preparation Correspondence_; Implementation Specification, _Preparation Bookkeeping_.                                              |
| Require explicit caller initiation for every proposed turn.                                                  | ADR-0030 definition of a turn and D2-A; Runtime Specification, _Turn Admissions and Correspondence_.                                                                      |
| Admit a turn only from **Ready** within the currently implemented lifecycle.                                 | Runtime Specification, _Runtime Lifecycle and State Model_, _Turn Execution_, and _Invalid Operations_; Implementation Specification, _Admission Control_.                |
| Change **Ready → Turn In Progress** consistently when the turn is admitted.                                  | Runtime Specification, lifecycle transition; Implementation Specification, _Runtime State Representation_, _Admission Control_, and atomicity requirements in scope.      |
| Reject turn admission before **Ready** without changing the existing state.                                  | Runtime Specification, _Invalid Operations_ and turn readiness condition; Implementation Specification, _Admission Control_.                                              |
| Reject a second or overlapping turn admission in **Turn In Progress** without changing state.                | ADR-0030 D2-A; both Active Runtime specifications' sequential-admission and overlap-rejection requirements.                                                               |
| Introduce no queue, deferred admission, scheduler, or parallel execution.                                    | ADR-0030 D2-A and both Active Runtime specifications' invariants and prohibitions.                                                                                        |
| Cause no Brain orchestration or other execution as a consequence of admission.                               | ADR-0030 separates admitted turns from Brain's existing single-request orchestration; this review intentionally stops before execution.                                   |
| Keep separate runtime instances' admission state independent.                                                | ADR-0030 defines a process-local runtime instance retaining its own composition and admission/lifecycle state; both Runtime specifications apply bookkeeping per runtime. |

This authorized slice implements only the admission decision and its bounded state change. It does not claim complete cross-operation concurrency, turn execution, turn settlement, shutdown coordination, or complete Runtime conformance.

## Admission is distinct from execution

The retained Brain binding produced by the REVIEW-0009 implementation exposes the existing future C1 path `composeBrain(...) → orchestrateCognitiveRequest(request)`. [C1](../../IMPLEMENTATION-C1.md) and the existing Bootstrap composition demonstrate that path. This review cites it only to identify the preserved authority boundary.

The proposed admission operation MUST NOT call `orchestrateCognitiveRequest(...)`, construct or normalize a cognitive request, return a `FinalCognitiveResult`, interpret a Brain outcome, or transfer Brain orchestration authority to Runtime. The Active specifications establish the required admission behavior but leave its internal physical API name and representation to implementation. Tests do not justify a new public Runtime API.

# Accepted Observations

- The current Runtime physically reaches **Ready** after the REVIEW-0009 preparation path succeeds.
- Explicit admission from **Ready** is the earliest remaining lifecycle transition and can be reviewed independently from Brain execution.
- Admission-only implementation can use the retained internal binding without invoking or exposing it.
- The existing package and build configuration already cover both proposed files; no metadata or dependency change is demonstrated.
- The Runtime Specification's known **Terminal Closed** state-list ambiguity concerns shutdown and does not affect **Ready → Turn In Progress**. This review does not resolve it.

# Rejected Observations

- Active semantic obligations are not physical implementation authorization.
- Reaching **Ready** does not itself authorize a turn.
- REVIEW-0008 or REVIEW-0009 approval cannot be reused for this slice.
- A test helper, internal function name, exported symbol, or passing test does not establish a public API or architectural semantics.
- Turn admission does not authorize Brain orchestration, result production, or settlement.
- This bounded PASS does not establish executable conformance, complete Runtime conformance, production authority, or deployment authority.

# Risks

An admission helper could accidentally become a public Runtime API if exported or packaged without separate justification. Combining admission with Brain invocation would exceed the proposed boundary and make failure and settlement behavior implicit. Leaving rejection state changes observable, queueing a rejected request, or deferring its execution would violate the selected sequential policy. Treating **Turn In Progress** as evidence that a turn executed would overstate this deliberately intermediate slice.

# Recommendations

Implement the approved two-file, admission-only boundary as one indivisible scope: explicit eligibility checking, the consistent **Ready → Turn In Progress** change, rejection without state corruption, and focused evidence. Keep execution, settlement, shutdown, complete concurrency, conformance, production, and deployment under later gates.

# Action Plan

1. Preserve the exact reviewed Draft 1.0.0, baseline `efb7f324332aa5876481535372e2b5a866ccfa04`, authority trace, two-file boundary, evidence plan, exclusions, stop conditions, and recorded human PASS.
2. Modify only the authorized files and behavior. Stop for new governance if implementation requires an additional file, public API, execution behavior, semantic decision, or authority change.
3. Generate and reconcile the focused executable and architecture evidence after implementation. Treat passing evidence as bounded conformance evidence only.

# Required Pre-PASS Decision Packet

Before the human decision, the packet must identify this exact Draft version and repository baseline, the exact two-file proposal, permitted behavior, explicit exclusions, evidence plan, and stop conditions. It must trace each proposed behavior to ADR-0030 and both Active Runtime specifications and confirm that Brain, Bootstrap/C1, Context, Core, and every Engine retain their current authority.

Every mandatory technical gate applicable before authorization must have zero failed gates, zero unknown gates, no waiver, and no unsupported reclassification to PASS. Checks that require authorized implementation belong to future executable evidence and must not be represented as already passing implementation conformance. The decision record must identify the human reviewer, review route, evidence examined, rationale, PASS or FAIL, reviewed version and baseline, and timestamp. AI analysis may support the packet but cannot make or impersonate the human decision.

[DOCUMENT-AUTHORITY](../DOCUMENT-AUTHORITY.md) prefers independent review and permits the documented single-maintainer route when all stated conditions apply. The established Application Runtime route remains `SINGLE_MAINTAINER`; Rodrigo Lozano supplied the human decision, and no independent reviewer is fabricated. The decision record therefore states `INDEPENDENT_REVIEW: NOT_APPLICABLE_SINGLE_MAINTAINER` and `MAINTAINER_REVIEW: PASS`.

# Required Future Executable Evidence

After a human PASS and implementation, focused tests and inspection must establish:

1. The Runtime reaches **Ready** through the already-authorized preparation path.
2. The first explicit turn admission from **Ready** succeeds.
3. Successful admission changes state to **Turn In Progress**.
4. Turn admission before **Ready** is rejected.
5. A second or overlapping turn admission while **Turn In Progress** is rejected.
6. Rejection does not corrupt or silently change the existing state.
7. No queue, deferred admission, scheduler, or parallel execution is introduced.
8. Separate Runtime instances preserve independent admission state.
9. Admission causes no call to `orchestrateCognitiveRequest(...)` and no other Brain execution.
10. Existing preparation admission, preparation settlement, exact-lineage binding, failure, and single-attempt behavior remains intact.

Evidence must also confirm that no public Runtime package API, new dependency, direct Engine coupling, result handling, shutdown behavior, or out-of-bound file change was introduced. Targeted Prettier, Runtime TypeScript checking, focused Runtime tests, applicable architecture inspection, and `git diff --check` should be recorded. Passing tests supply executable evidence only after authorized implementation; they do not broaden authority or establish complete Runtime conformance.

# Explicit Non-Goals and Stop Conditions

This review does not propose or authorize:

- calling `orchestrateCognitiveRequest(...)` or any other turn execution;
- construction or normalization of a cognitive request;
- producing, returning, storing, or interpreting `FinalCognitiveResult`;
- successful turn settlement or **Turn In Progress → Ready**;
- ordinary turn failure settlement or continuation after failure;
- automatic retry, fallback, or autonomous continuation;
- complete preparation-versus-turn or turn-versus-shutdown concurrency semantics;
- Runtime shutdown, admission closure, in-flight shutdown settlement, cleanup, cancellation, or terminal-state semantics;
- queueing, deferred admission, scheduling, or parallel execution;
- transport or public Runtime API;
- persistence or durable session/conversation state;
- new or changed Core Contracts, C1 behavior, Bootstrap behavior, Engine semantics, profile selection, or authority ownership;
- package, lockfile, build, workspace, CI, architecture metadata, roadmap, ADR, or specification changes;
- production conformance, production authorization, deployment authorization, staging, release, or deployment.

Implementation must stop for additional human-reviewed governance if any excluded behavior, third file, new dependency, public interface, unresolved semantic choice, execution call, settlement behavior, shutdown interaction, or authority change is required.

# Implementation Authorization Boundary

**Current disposition: BOUNDED IMPLEMENTATION AUTHORIZED.** Rodrigo Lozano's recorded human PASS on Draft 1.0.0 grants implementation authority only for the two files and admission-only behavior defined above. It grants no third implementation file and does not authorize Brain execution, settlement, shutdown, a public Runtime API, or any other excluded behavior. This PASS permits bounded implementation and focused evidence generation; it does not establish executable conformance, complete Runtime conformance, production authorization, or deployment authorization.

# Review Decision

[DOCUMENT-AUTHORITY](../DOCUMENT-AUTHORITY.md) permits the established single-maintainer route when its conditions are met. [ADR-0030](../adr/ADR-0030-Caller-Driven-Multi-Turn-Application-Runtime.md#human-lifecycle-activation), [REVIEW-0008](REVIEW-0008-Application-Runtime-First-Physical-Slice-Implementation-Authorization.md#review-decision), and [REVIEW-0009](REVIEW-0009-Application-Runtime-Real-Preparation-and-Brain-Binding-Implementation-Authorization.md#review-decision) record the continuing route and independent-review unavailability. Rodrigo Lozano explicitly supplied PASS for the exact Draft 1.0.0 at the baseline below. This is single-maintainer human review; AI recorded the decision but did not make it.

| Field                             | Value                                                                                                                                                                                                                                                                                                                                          |
| --------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Review Route**                  | `SINGLE_MAINTAINER`                                                                                                                                                                                                                                                                                                                            |
| **Independent Review**            | `NOT_APPLICABLE_SINGLE_MAINTAINER`                                                                                                                                                                                                                                                                                                             |
| **Independent Reviewer**          | `NONE_AVAILABLE`                                                                                                                                                                                                                                                                                                                               |
| **Maintainer Review**             | `PASS`                                                                                                                                                                                                                                                                                                                                         |
| **Reviewer**                      | Rodrigo Lozano                                                                                                                                                                                                                                                                                                                                 |
| **Review Timestamp**              | 2026-09-21 (date precision; no human time of day supplied)                                                                                                                                                                                                                                                                                     |
| **Decision**                      | `PASS — BOUNDED IMPLEMENTATION AUTHORIZATION`                                                                                                                                                                                                                                                                                                  |
| **Evidence Examined**             | Exact REVIEW-0010 Draft 1.0.0; ADR-0030 and both Active Runtime specifications; the exhausted REVIEW-0008 and REVIEW-0009 boundaries; current Runtime source and tests; the two-file proposal, behavioral trace, exclusions, stop conditions, and future-evidence plan; unchanged Runtime files and HEAD at the reviewed baseline.             |
| **Decision Rationale**            | Existing authority fully specifies explicit sequential turn admission from Ready. The two-file slice advances only admission state and overlap rejection while preserving Brain, Bootstrap/C1, Core, and Engine authority and leaving execution, settlement, shutdown, complete conformance, production, and deployment outside authorization. |
| **Reviewed Version and Baseline** | Draft 1.0.0 at `efb7f324332aa5876481535372e2b5a866ccfa04`                                                                                                                                                                                                                                                                                      |
| **Change/Ticket Reference**       | `REVIEW-0010`                                                                                                                                                                                                                                                                                                                                  |

`INDEPENDENT_REVIEW: NOT_APPLICABLE_SINGLE_MAINTAINER`

`MAINTAINER_REVIEW: PASS`

Rodrigo Lozano's explicit human PASS approves the unchanged Draft 1.0.0 scope: explicit caller-initiated admission only from **Ready**, the consistent **Ready → Turn In Progress** state change, rejection before Ready and during Turn In Progress without state corruption, no queue or deferred admission, independent per-instance state, and no Brain execution caused by admission. The exact future implementation boundary remains `services/runtime/src/runtime.ts` and `services/runtime/test/runtime.test.ts`.

At decision time, HEAD and `origin/main` remained at the reviewed baseline, no Runtime implementation had occurred, and no failed or unknown mandatory pre-implementation gate was waived or reclassified. Future executable checks remain required after implementation. This PASS does not establish executable evidence or complete Runtime conformance and grants no production or deployment authority.

# Review History

| Version | Date       | Description                                                                                                                                                                              |
| ------- | ---------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1.0.1   | 2026-09-21 | Recorded Rodrigo Lozano's human SINGLE_MAINTAINER PASS on Draft 1.0.0 and activated its unchanged two-file turn-admission-only boundary; later evidence and authorities remain separate. |
| 1.0.0   | 2026-09-20 | Initial Draft requesting bounded Application Runtime turn-admission-only implementation authorization; human decision pending and implementation unauthorized.                           |

# Related Documents

- [Documentation Authority](../DOCUMENT-AUTHORITY.md)
- [OES-0001 — Repository Structure](../engineering/OES-0001-Repository-Structure.md)
- [OES-0004 — Contracts](../engineering/OES-0004-Contracts.md)
- [OES-0008 — Documentation Standards](../engineering/OES-0008-Documentation-Standards.md)
- [OES-0010 — Versioning Standards](../engineering/OES-0010-Versioning-Standards.md)
- [ADR-0030 — Caller-Driven Multi-Turn Application Runtime](../adr/ADR-0030-Caller-Driven-Multi-Turn-Application-Runtime.md)
- [Application Runtime Specification](../../specifications/Application-Runtime-Specification.md)
- [Application Runtime Implementation Specification](../../specifications/Application-Runtime-Implementation-Specification.md)
- [REVIEW-0008 — Application Runtime First Physical Slice](REVIEW-0008-Application-Runtime-First-Physical-Slice-Implementation-Authorization.md)
- [REVIEW-0009 — Application Runtime Real Preparation and Brain Binding](REVIEW-0009-Application-Runtime-Real-Preparation-and-Brain-Binding-Implementation-Authorization.md)
- [C1 Implementation Record](../../IMPLEMENTATION-C1.md)

# Engineering Motto

Admission is explicit, bounded, and separate from execution.
