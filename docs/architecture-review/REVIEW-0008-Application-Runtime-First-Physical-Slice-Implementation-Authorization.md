# REVIEW-0008 — Application Runtime First Physical Slice Implementation Authorization

| Field           | Value                                                                                      |
| --------------- | ------------------------------------------------------------------------------------------ |
| **Status**      | Active                                                                                     |
| **Version**     | 1.0.1                                                                                      |
| **Owner**       | Project Maintainers                                                                        |
| **Created**     | 2026-09-20                                                                                 |
| **Updated**     | 2026-09-20                                                                                 |
| **Review Type** | Architecture Review                                                                        |
| **Applies To**  | Proposed nonproduction implementation of initial Application Runtime preparation admission |

---

# Executive Summary

This review authorizes the first bounded physical implementation slice of the caller-driven Application Runtime following Rodrigo Lozano's explicit human PASS on Draft 1.0.0. Its name is **Application Runtime: initial preparation admission and single-attempt bookkeeping**. Its purpose is to establish process-local, runtime-owned initial lifecycle state and first preparation admission without claiming usable preparation, turn readiness, or a complete runtime.

[ADR-0030](../adr/ADR-0030-Caller-Driven-Multi-Turn-Application-Runtime.md) establishes application ownership but expressly withholds implementation authority. The [Application Runtime Specification](../../specifications/Application-Runtime-Specification.md) and [Application Runtime Implementation Specification](../../specifications/Application-Runtime-Implementation-Specification.md) are Active 1.0.1 after human lifecycle approval; neither activation grants implementation, production, or deployment authority. Draft creation granted no implementation authority. **The recorded human PASS below grants only this review's five-file, first-slice implementation scope. Executable conformance is not established. Production and deployment remain NOT AUTHORIZED.**

# Findings

## Governing authority and ownership

The runtime owns application admission and lifecycle bookkeeping. Context retains preparation and revision authority; Brain retains single-request orchestration; Bootstrap retains approved C1 composition; other Engines and existing Contracts retain their respective authority. This slice introduces none of their behavior or wiring. [DOCUMENT-AUTHORITY](../DOCUMENT-AUTHORITY.md) governs document precedence and human review; [OES-0001](../engineering/OES-0001-Repository-Structure.md) governs placement; [OES-0008](../engineering/OES-0008-Documentation-Standards.md) governs review documents and lifecycle; [OES-0010](../engineering/OES-0010-Versioning-Standards.md) governs versioning.

## Proposed file boundary

Only these five files are authorized by the recorded implementation PASS:

| File                                    | Proposed use                                                                                   |
| --------------------------------------- | ---------------------------------------------------------------------------------------------- |
| `services/runtime/package.json`         | Minimal private package metadata.                                                              |
| `services/runtime/tsconfig.json`        | Minimal local compilation configuration with only dependencies actually needed for this slice. |
| `services/runtime/tsconfig.test.json`   | Focused local test configuration.                                                              |
| `services/runtime/src/runtime.ts`       | Internal initial state, first admission, and single-attempt bookkeeping.                       |
| `services/runtime/test/runtime.test.ts` | Focused behavioral evidence for this slice.                                                    |

`services/runtime/src/index.ts`, root `package.json`, root `pnpm-lock.yaml`, root `tsconfig.json`, architecture metadata, CI configuration, and **every other repository file** are outside this authorized file boundary. A need to change one of them is a stop condition requiring a separately reviewed scope; it is not implied by package creation or testing convenience.

## Proposed behavioral boundary and authority trace

| Proposed behavior                                                                                                | Governing basis                                                                                                                                          |
| ---------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Internally represent the approved lifecycle vocabulary only as needed, without claiming unused transitions work. | Runtime Specification, _Runtime Lifecycle and State Model_; Implementation Specification, _Runtime State Representation_.                                |
| Start an instance in **Not Prepared**.                                                                           | Both runtime specifications, initial state descriptions.                                                                                                 |
| Admit exactly the first explicit preparation attempt while eligible.                                             | ADR-0030 D1-A and D2-A; Runtime Specification, _Preparation_; Implementation Specification, _Preparation Bookkeeping_ and _Admission Control_.           |
| On admission, move **Not Prepared → Preparing** and consume the instance's single attempt.                       | Runtime Specification, state transition and preparation correspondence; Implementation Specification, state representation and preparation bookkeeping.  |
| Reject a later attempt on the same instance without changing the admitted state.                                 | ADR-0030 D1-A; Runtime Specification, preparation rejection; Implementation Specification, subsequent-attempt rejection and consistent state management. |
| Test only those facts and keep admission plus bookkeeping consistent as one bounded state change.                | Runtime Specification, conformance obligations; Implementation Specification, state consistency and atomicity obligations within this slice.             |

The proposed slice does not claim to satisfy the complete implementation specification's cross-operation exclusion, concurrency, or atomicity obligations. A later complete runtime must satisfy those obligations. No unused state transition becomes implemented merely because its vocabulary is represented.

## Prototype assessment: review input only

An **untracked** local `services/runtime/` prototype exists. It is proposed material, not authoritative repository state or governed conformance evidence. Passing tests do not grant implementation authority. Any correction below may occur only after implementation authorization is granted.

| Prototype file                          | Preliminary classification     | Review finding                                                                                                            |
| --------------------------------------- | ------------------------------ | ------------------------------------------------------------------------------------------------------------------------- |
| `services/runtime/package.json`         | WITHIN proposed authorization  | Private minimal metadata fits the file boundary.                                                                          |
| `services/runtime/tsconfig.json`        | REQUIRES CORRECTION            | References nine Engines unused by this slice, implying premature integration.                                             |
| `services/runtime/tsconfig.test.json`   | WITHIN proposed authorization  | Focused local test configuration fits the boundary.                                                                       |
| `services/runtime/src/index.ts`         | OUTSIDE proposed authorization | A package entry and public API are unnecessary here.                                                                      |
| `services/runtime/src/runtime.ts`       | REQUIRES CORRECTION            | The bounded transition is relevant; exported class/type and public methods expose prototype API choices without approval. |
| `services/runtime/test/runtime.test.ts` | REQUIRES CORRECTION            | Assertions address relevant behavior but encode prototype-specific API names.                                             |

`ApplicationRuntime`, `RuntimeState`, `admitPreparation()`, and `canAdmitPreparation()` are **not approved API names**. Exported types or classes, public visibility, error text, and query or helper methods are implementation choices requiring justification within the approved boundary. This review does not authorize a public runtime package API.

# Accepted Observations

ADR-0030 permits one preparation attempt per runtime and rejects overlap without a queue. The two Active runtime specifications define the initial state, first admission, and single-attempt bookkeeping. Their lifecycle approval makes those obligations authoritative within scope, but supplies no physical implementation PASS.

The Runtime Specification includes **Terminal Closed** in a transition diagram but omits it from its seven-item state list. This known ambiguity has no bearing on **Not Prepared → Preparing**. This review neither resolves it nor invents an eighth state.

# Rejected Observations

- An untracked prototype, compilation, or a passing test is not implementation authorization.
- A lifecycle PASS on ADR-0030 or either runtime specification is not a bounded implementation PASS.
- Prototype class, type, and method names do not establish an authoritative runtime API.
- Representing lifecycle vocabulary does not implement completion, turns, shutdown, or the complete concurrency mechanism.
- A future implementation PASS under this review would not establish production conformance or deployment authority.

# Risks

Premature Engine references or a public package export could turn a small internal admission slice into unreviewed integration or API design. Treating the intermediate **Preparing** state as a functioning preparation could imply readiness that has not been established. Fragmenting the admission transition from attempt bookkeeping could permit a second attempt or inconsistent state. These risks require focused post-authorization evidence and stop conditions, not an assumption that the prototype resolves them.

# Recommendations

Review only the specified files and behavioral trace. Correct prototype-specific public surface and unused Engine references during authorized implementation. Keep executable conformance, broader runtime functionality, production, and deployment as separate later decisions.

# Action Plan

1. Preserve the pre-decision evidence packet below, the exact reviewed Draft version, repository baseline, and recorded human PASS.
2. Make corrections and implement only within the authorized files and behavior. Stop for new governance if any file, API, semantic responsibility, or operation outside the boundary becomes necessary.
3. Produce focused executable and architecture evidence after authorization; reconcile it separately before claiming this slice complete. Later runtime slices and production or deployment require separate authority.

# Pre-PASS Evidence and Decision Packet

The human decision packet must identify the **exact reviewed Draft version**, repository baseline, exact five-file allowance, permitted behavior, explicit exclusions, and stop conditions. It must include the behavior-to-authority trace above; an assessment that Context, Brain, Bootstrap/C1, Core Contracts, and every affected Engine retain their authority; and the file-by-file untracked prototype assessment. It must provide a focused _future_ test plan for initial state, first admission, the state/bookkeeping change, duplicate rejection, and unchanged state after rejection, plus an architecture-validation plan for dependencies and public surface. Future executable results are not required as if implementation had already been authorized.

Before PASS, every mandatory technical gate applicable **at the authorization stage** must have zero failed gates, zero unknown gates, no waiver, and no unsupported reclassification to PASS. The packet must identify each such gate and its evidence, or explain why a proposed check belongs to post-authorization implementation conformance. The human review record must then identify the reviewer, route, evidence examined, rationale, PASS/FAIL decision, and timestamp. AI analysis may support the packet but cannot make or impersonate the human decision.

# Explicit Non-Goals and Stop Conditions

This review grants **no** authority for real Context preparation; Context/Brain binding; **Preparing → Ready** or **Preparing → Preparation Failed** completion; turn admission or execution; full preparation-versus-turn mutual exclusion; a complete concurrency or atomicity mechanism; shutdown; cleanup; or C1 composition wiring.

It grants **no** new Core Contracts; Engine, Brain, Context, Knowledge, Reasoning, Planning, Security, Memory, Identity, or Skill authority; transport API; public runtime package API; session abstraction; durable runtime, session, or conversation persistence; queueing; scheduling; parallel execution; retries; or autonomous continuation. Root workspace/build-graph integration beyond the exact listed files, architecture metadata, and CI integration are excluded. Production conformance, production authorization, and deployment authorization remain **NOT AUTHORIZED** after this bounded implementation PASS.

Implementation must stop and seek a new governed decision if completing this slice requires any excluded file, behavior, public interface, Contract change, authority transfer, or unresolved architectural interpretation.

# Implementation Authorization Boundary

**Current disposition: BOUNDED IMPLEMENTATION AUTHORIZED.** Rodrigo Lozano's recorded human PASS on Draft 1.0.0 grants implementation authority strictly limited to the five files and behavior in this review. It permits focused evidence generation, but does not certify executable conformance or approve production or deployment. The prior Draft granted no authority; this recorded decision does not expand its reviewed scope.

# Review Decision

The applicable route is **SINGLE_MAINTAINER** under [DOCUMENT-AUTHORITY](../DOCUMENT-AUTHORITY.md). [ADR-0030's human lifecycle record](../adr/ADR-0030-Caller-Driven-Multi-Turn-Application-Runtime.md#human-lifecycle-activation) records the established continuing route and the unavailability of independent review; [REVIEW-0007](REVIEW-0007-K13-F08-Production-Authorization-for-Fixed-Profile-B.md#review-decision) records Rodrigo Lozano's sole-maintainer declaration. No later repository authority establishes an independent reviewer for this decision. The human maintainer, Rodrigo Lozano, explicitly supplied PASS on this review's Draft 1.0.0 at the baseline below. This is single-maintainer human review, not independent human review; AI supplied supporting analysis and recorded the decision, but did not make it.

| Field                             | Value                                                                                                                                                                                                                                       |
| --------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Review Route**                  | `SINGLE_MAINTAINER`                                                                                                                                                                                                                         |
| **Independent Review**            | `NOT_APPLICABLE_SINGLE_MAINTAINER`                                                                                                                                                                                                          |
| **Independent Reviewer**          | `NONE_AVAILABLE`                                                                                                                                                                                                                            |
| **Maintainer Review**             | `PASS`                                                                                                                                                                                                                                      |
| **Reviewer**                      | Rodrigo Lozano                                                                                                                                                                                                                              |
| **Review Timestamp**              | 2026-09-20 (date precision; no human time of day supplied)                                                                                                                                                                                  |
| **Decision**                      | `PASS — BOUNDED IMPLEMENTATION AUTHORIZATION`                                                                                                                                                                                               |
| **Evidence Examined**             | Draft 1.0.0 and repository baseline identified below; authority and boundary reconciliation recorded below.                                                                                                                                 |
| **Decision Rationale**            | The five-file first slice implements only approved initial preparation admission and single-attempt bookkeeping, preserves existing ownership and exclusions, and leaves executable conformance, production, and deployment to later gates. |
| **Reviewed Version and Baseline** | Draft 1.0.0 at `842c674cad3d782d444e01f0dd0f7f8c08067f18`                                                                                                                                                                                   |
| **Change/Ticket Reference**       | `REVIEW-0008`                                                                                                                                                                                                                               |

`INDEPENDENT_REVIEW: NOT_APPLICABLE_SINGLE_MAINTAINER`

`MAINTAINER_REVIEW: PASS`

The human-supplied decision identifies Draft 1.0.0, the baseline above, and PASS. The supporting decision packet in this review identifies the exact five files, behavior-to-authority trace, exclusions, stop conditions, prototype assessment, and future test and architecture-validation plans. Repository authority checked for this record comprises DOCUMENT-AUTHORITY, OES-0001, OES-0008, OES-0010, ADR-0030, both Active runtime specifications, and the REVIEW template; REVIEW-0006 and REVIEW-0007 provide structure only. No independent reviewer is claimed. The applicable pre-implementation document checks are formatting and local links; the preservation checks are unchanged tracked files, unchanged HEAD, and untouched `services/runtime/`. Focused executable tests and architecture validation of implemented code occur after authorization. No failed or unknown mandatory pre-authorization technical gate was waived or reclassified as PASS. No untracked prototype result is treated as governed executable conformance.

| Pre-implementation check                                  | Result                                                                                  |
| --------------------------------------------------------- | --------------------------------------------------------------------------------------- |
| Reviewed scope and authority trace                        | PASS — five files and approved initial admission behavior only                          |
| Documentation formatting                                  | PASS — Prettier check                                                                   |
| Local document links                                      | PASS — 20 local links resolve                                                           |
| Tracked files, HEAD, and `services/runtime/` preservation | PASS — no tracked diff, HEAD remains the reviewed baseline, runtime prototype untouched |
| Mandatory pre-authorization checks failed or unknown      | 0 failed; 0 unknown                                                                     |
| Waivers or unsupported reclassifications to PASS          | None                                                                                    |

The recorded PASS authorizes only implementation within the exact file and behavior boundary above. Focused executable tests, architecture validation of the resulting implementation, and separate conformance reconciliation remain open. Production and deployment remain NOT AUTHORIZED.

# Review History

| Version | Date       | Description                                                                                                                                                                                        |
| ------- | ---------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1.0.1   | 2026-09-20 | Recorded Rodrigo Lozano's human PASS on Draft 1.0.0, activated the review and its unchanged five-file implementation boundary; executable conformance, production, and deployment remain separate. |
| 1.0.0   | 2026-09-20 | Initial Draft of bounded first physical slice implementation authorization; human decision pending and implementation unauthorized.                                                                |

# Related Documents

- [Documentation Authority](../DOCUMENT-AUTHORITY.md)
- [OES-0001 — Repository Structure](../engineering/OES-0001-Repository-Structure.md)
- [OES-0004 — Contracts](../engineering/OES-0004-Contracts.md)
- [OES-0008 — Documentation Standards](../engineering/OES-0008-Documentation-Standards.md)
- [OES-0010 — Versioning Standards](../engineering/OES-0010-Versioning-Standards.md)
- [ADR-0030 — Caller-Driven Multi-Turn Application Runtime](../adr/ADR-0030-Caller-Driven-Multi-Turn-Application-Runtime.md)
- [Application Runtime Specification](../../specifications/Application-Runtime-Specification.md)
- [Application Runtime Implementation Specification](../../specifications/Application-Runtime-Implementation-Specification.md)
- [REVIEW-0006 — Memory Engine Source Currentness and Reference Authority](REVIEW-0006-Memory-Engine-Source-Currentness-and-Reference-Authority.md) — structural precedent only
- [REVIEW-0007 — K13-F08 Production Authorization for Fixed Profile B](REVIEW-0007-K13-F08-Production-Authorization-for-Fixed-Profile-B.md) — implementation-authorization structure only

# Engineering Motto

Explicit human authority before bounded implementation.
