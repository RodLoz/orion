# REVIEW-0009 — Application Runtime Real Preparation and Brain Binding Implementation Authorization

| Field           | Value                                                                                          |
| --------------- | ---------------------------------------------------------------------------------------------- |
| **Status**      | Active                                                                                         |
| **Version**     | 1.0.1                                                                                          |
| **Owner**       | Project Maintainers                                                                            |
| **Created**     | 2026-09-20                                                                                     |
| **Updated**     | 2026-09-20                                                                                     |
| **Review Type** | Architecture Review                                                                            |
| **Applies To**  | Proposed nonproduction Application Runtime preparation settlement through the existing C1 path |

---

# Executive Summary

This review records Rodrigo Lozano's human PASS on Draft 1.0.0 for the next bounded physical Application Runtime slice: **real Context preparation and corresponding Brain binding, with success or failure settlement**. It begins after the already-authorized first attempt has entered **Preparing**. The runtime may retain one approved C1 composition, forward explicit caller-supplied preparation input to Context through that composition, bind Brain to the exact resulting Context lineage, and enter **Ready** only after both steps succeed. A failure in either step enters **Preparation Failed** without permitting another preparation attempt. This authorization does not admit or execute turns.

Draft creation granted no implementation authority. **The recorded human PASS below grants implementation authority only for this review's bounded behavior and exact five-file boundary.** Executable evidence and complete runtime conformance are later determinations. Production and deployment remain **NOT AUTHORIZED**.

# Findings

## Governing authority and exhausted prior slice

[ADR-0030](../adr/ADR-0030-Caller-Driven-Multi-Turn-Application-Runtime.md) assigns application admission, retained composition lifetime, and shutdown coordination to the runtime while Context retains preparation and lineage authority, Brain retains orchestration, and Bootstrap retains assembly of approved participants. Its D1-A permits one preparation/binding per runtime; D2-A rejects overlap without a queue. It explicitly withholds implementation authority. The Active [Application Runtime Specification](../../specifications/Application-Runtime-Specification.md) defines preparation as establishing Context and Brain binding, with **Preparing → Ready** on success and **Preparing → Preparation Failed** on failure. The Active [Implementation Specification](../../specifications/Application-Runtime-Implementation-Specification.md) requires single-attempt bookkeeping, preserved preparation result and binding, originating failure ownership, and consistent state management. Those specifications are semantic and implementation obligations, not a physical implementation PASS.

[REVIEW-0008](REVIEW-0008-Application-Runtime-First-Physical-Slice-Implementation-Authorization.md) authorized only the five-file initial admission slice. Its committed implementation at `d07d8e93250826f5b94f36b33f2674aeb240c609` is the internal **Not Prepared → Preparing** transition and one-attempt rejection in [`services/runtime/src/runtime.ts`](../../services/runtime/src/runtime.ts), with focused tests. REVIEW-0008 expressly excluded real Context preparation, Brain binding, both completion transitions, C1 wiring, and shutdown. Its PASS is exhausted by that scope and cannot authorize this follow-up.

## Existing physical C1 path and Contracts

The human-reviewed [C1 record](../../IMPLEMENTATION-C1.md) describes one in-process Bootstrap composition, explicit caller preparation, then Brain binding and separate request execution. The existing physical path is:

| Existing file and symbol                                                                                                                                                                                                      | Permitted role in the proposed slice                                                                                                                                                                           |
| ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| [`services/bootstrap/src/brain/bounded-application-composition.ts`](../../services/bootstrap/src/brain/bounded-application-composition.ts) — `composeBoundedApplicationCapability`, `BoundedApplicationCapabilityComposition` | Bootstrap asynchronously assembles the already-approved fixed Profile B C1 participants; the runtime may acquire and retain one returned composition.                                                          |
| Same file — composition `composeBrain` and `BoundedBrainPreparation`                                                                                                                                                          | Bind Brain after Context succeeds, passing the exact returned lineage identity as `contextLineageId`; do not submit a turn.                                                                                    |
| [`services/bootstrap/src/context/context-composition.ts`](../../services/bootstrap/src/context/context-composition.ts) — returned `prepareContextRevisionWithStructuredKnowledge`                                             | Forward the explicit caller-supplied request to the Context-owned preparation operation.                                                                                                                       |
| [`services/bootstrap/src/brain/brain-composition.ts`](../../services/bootstrap/src/brain/brain-composition.ts) — `composeBoundedReasoning3BrainCapability`                                                                    | Existing Bootstrap binding implementation; it performs active Context lookup using the supplied lineage. Runtime does not construct or replace it.                                                             |
| [`services/bootstrap/src/index.ts`](../../services/bootstrap/src/index.ts) — `composeBoundedApplicationCapability` export                                                                                                     | Existing package entry for the C1 composition. It is an internal in-process composition API, not a new public Runtime or transport API.                                                                        |
| [`core/src/context-contracts.ts`](../../core/src/context-contracts.ts) — `PrepareContextRevisionWithStructuredKnowledgeRequest`, `PrepareContextRevisionWithStructuredKnowledge`                                              | Existing request and operation contract, including explicit target, identity resolution request, semantic scope, and Knowledge retrieval request; optional Memory source binding retains its existing meaning. |
| [`core/src/context.ts`](../../core/src/context.ts) — `ActiveContextRevision`                                                                                                                                                  | Context-owned result whose lineage identity must be used for Brain binding.                                                                                                                                    |

The C1 composition also exposes existing `getActiveContextRevision` and `verifyActiveContextRevisionAuthority` operations through [`services/bootstrap/src/context/context-composition.ts`](../../services/bootstrap/src/context/context-composition.ts); Bootstrap's Brain binding uses them. The proposed runtime does not become their verifier. The existing [`services/bootstrap/test/bounded-application-composition.test.ts`](../../services/bootstrap/test/bounded-application-composition.test.ts) demonstrates the physical order of explicit preparation, exact-lineage `composeBrain`, separate request execution, failure checks, and test-owned cleanup. That existing evidence establishes C1 behavior, not Application Runtime conformance.

## C1 acquisition, retention, and resource lifetime

The smallest ownership-preserving arrangement is for the runtime's internal creation path to ask Bootstrap's existing `composeBoundedApplicationCapability()` to assemble **one** C1 composition and retain that returned composition for its own lifetime. Bootstrap continues to own assembly; runtime owns when to call the already-composed operations and retains the corresponding Brain binding after successful preparation. No individual Engine is constructed or selected by runtime. No new composition factory, Core Contract, or public runtime package entry is proposed.

The C1 object has an existing `shutdown` hook, delegated to Knowledge cleanup. **This PASS does not authorize Application Runtime shutdown, cleanup, automatic disposal on preparation failure, or a new global revocation claim.** The composition remains retained after success or failure, pending a separately governed runtime shutdown slice. Nonproduction tests that acquire real C1 resources must use a test-owned reference to invoke the existing C1 `shutdown` in `finally` for test/resource hygiene. That fixture action is evidence hygiene, not an Application Runtime operation or conformance claim. Rodrigo Lozano explicitly approved this limited, nonproduction lifetime arrangement; production use remains excluded.

## Fixed Profile B decision

The **existing** `composeBoundedApplicationCapability()` calls `composeFixedProfileBCapability()` in Bootstrap. [C1](../../IMPLEMENTATION-C1.md) and [ADR-0030](../adr/ADR-0030-Caller-Driven-Multi-Turn-Application-Runtime.md) identify that C1 as the approved bounded composition. This PASS approves using that fixed C1 path as a **static internal composition choice**, not selecting a profile from an incoming preparation or turn request. It introduces no dynamic profile-selection policy and does not infer source material, semantic scope, Knowledge identity, or Memory binding from request contents. Those preparation inputs must be explicitly supplied within the existing Core request contract.

The human review explicitly approved this static fixed C1 choice with caller-supplied preparation inputs. No separate configuration selector is authorized or needed within this boundary. A need for another profile, inferred defaults, or a new configuration selector is a stop condition requiring separate governance, not discretion granted by this PASS.

## Proposed physical file boundary

Only the following five existing files are authorized for the bounded implementation:

| File                                    | Necessity                                                                                                                                               |
| --------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `services/runtime/package.json`         | Declare the existing `@orion/bootstrap` workspace dependency for the C1 composition import. No individual Engine dependency is proposed.                |
| `services/runtime/tsconfig.json`        | Add the TypeScript project reference to `services/bootstrap` for the package dependency.                                                                |
| `services/runtime/src/runtime.ts`       | Extend the existing internal first-attempt state with one retained C1 composition, explicit Context preparation, Brain binding, and bounded settlement. |
| `services/runtime/test/runtime.test.ts` | Focused unit and C1 integration evidence, including test-owned C1 resource cleanup.                                                                     |
| `pnpm-lock.yaml`                        | Add/update the `services/runtime` importer corresponding to its new workspace dependency, preserving lockfile consistency.                              |

`pnpm-workspace.yaml` already includes `services/*`; the Bootstrap package already exports the composition; and `vitest.config.ts` already includes `services/*/test/**/*.test.ts`. The existing `services/runtime/tsconfig.test.json` extends the runtime TypeScript configuration and needs no demonstrated edit. Root `package.json`, root `tsconfig.json`, architecture metadata, CI configuration, other service files, Core files, and specifications likewise have no demonstrated required change for this bounded implementation. The root build and typecheck scripts currently omit runtime, so this slice's evidence must include **targeted** runtime checks; repository-wide build/CI integration is a separate authorization decision. If implementation proves any omitted file necessary, stop and amend the governed scope before changing it.

## Dependency direction

Runtime may depend on the approved Bootstrap/C1 composition boundary and, where needed for type correspondence, existing Core Contracts. Bootstrap continues to depend inward on Core and to assemble the approved Engines. Runtime must not directly construct or depend on concrete Context, Brain, Knowledge, Memory, Reasoning, Planning, Security, Skill, or Identity Engine implementations. A source dependency from an Engine back to Runtime, or Bootstrap to Runtime, is excluded. No dependency-cruiser configuration change is proposed; targeted architecture evidence must inspect/runtime-check the new edge.

# Accepted Observations

One real Context preparation followed by corresponding Brain binding is the smallest semantically coherent way to settle **Preparing**: a state-only move to Ready would falsely imply a usable binding, while Context success alone would leave Brain unbound. The existing C1 path physically supports the ordered operations. Retaining the prepared lineage and Brain binding does not pin Context revision validity or transfer Context authority; existing Context lookup and verification remain applicable when turns are later authorized.

The Runtime Specification includes **Terminal Closed** in its transition diagram but omits it from its seven-item state list. This known ambiguity has no bearing on the proposed **Preparing → Ready / Preparation Failed** settlement. This review neither resolves it nor invents an eighth state.

# Rejected Observations

- REVIEW-0008 approval, Active specifications, C1 PASS, a passing test, or this Draft alone grants no implementation authority for this second slice.
- A synthetic success callback or state-only Ready transition is not real Context preparation and Brain binding.
- The fixed Profile B C1 path is not authority to infer a profile, source, semantic scope, Knowledge identity, or preparation request from a turn.
- Calling C1 `shutdown` in a test fixture is not implemented Application Runtime shutdown.
- Binding Brain does not authorize `orchestrateCognitiveRequest` or any turn result handling.

# Risks

Creating C1 before a governed runtime shutdown operation means the runtime cannot yet claim complete lifetime management. The proposed review confines this to nonproduction implementation and test resource hygiene. A binding failure after successful Context preparation may leave an Active Context revision within the retained composition; it must not trigger automatic re-preparation, retry, hidden cleanup, or a false Ready state. Adding a Bootstrap dependency requires synchronized package, project-reference, and lockfile evidence. Unreviewed root build or architecture metadata edits would exceed the proposed boundary.

# Recommendations

Implement only the approved static fixed Profile B path, five-file boundary, limited lifetime arrangement, and success/failure correspondence. Keep runtime shutdown, turn execution, full concurrency, executable conformance, production, and deployment as later separate gates.

# Action Plan

1. Preserve the reviewed Draft 1.0.0, repository baseline `d07d8e93250826f5b94f36b33f2674aeb240c609`, exact five-file boundary, authority trace, and recorded human PASS.
2. Implement only within the approved file and behavior boundary. Stop for new governance if a missing API, another profile, new semantic input rule, new file, or expanded lifetime behavior is needed.
3. Generate and reconcile the focused executable and architecture evidence below. Do not infer complete runtime conformance or production/deployment authorization from that evidence.

# Required Future Executable Evidence

After authorization, focused tests must show: explicit caller initiation and exact forwarding of caller-supplied Context preparation input; Context preparation exactly once; Brain binding only after Context success and to the exact returned lineage; Ready only after both operations succeed; Preparation Failed when either operation fails; the already-consumed attempt remains consumed after either outcome; duplicate attempts are rejected without changing the settled state; no automatic retry, fallback, or turn execution; and failure ownership/propagation consistent with the Active implementation specification's Failure Option A. Tests must not assume unchanged internal exception identity or introduce a public diagnostic taxonomy.

C1 integration evidence must exercise the existing Bootstrap composition, Context preparation, and Brain binding path with explicit test prerequisites and test-owned `shutdown` in `finally`. Dependency/architecture evidence must show Runtime → Bootstrap/C1 (and any justified Core type import), with no direct Runtime → individual Engine coupling. Targeted Prettier, TypeScript project/test checks, focused Vitest, lockfile consistency, and `git diff --check` should be recorded. Passing tests establish bounded executable evidence only; a separate conformance reconciliation is needed before claiming this slice complete. Full Application Runtime conformance remains open.

# Explicit Non-Goals and Stop Conditions

No turn admission or execution, turn result handling, full preparation-versus-turn concurrency, Application Runtime shutdown or cleanup, public runtime or transport API, dynamic profile selection, inferred preparation or source selection, new Engine or Contract semantics, persistence, queueing, scheduling, retries, autonomous continuation, production authorization, or deployment authorization is proposed. No root build reference, root package script, architecture metadata, or CI change is proposed. No operation may make Context or Brain authority a runtime-owned semantic decision.

If a public API, extra file, direct Engine dependency, new configuration selection, novel request semantics, automatic cleanup, or unapproved lifecycle transition is required, implementation must stop for further human-reviewed governance.

# Implementation Authorization Boundary

**Current disposition: BOUNDED IMPLEMENTATION AUTHORIZED.** Rodrigo Lozano's recorded human PASS on Draft 1.0.0 grants implementation authority only for the five identified files and real preparation-and-binding behavior above. It grants no sixth implementation file, including `services/runtime/tsconfig.test.json`, and no Bootstrap, Core, Context, Brain, or other Engine modification. No root build, CI, or architecture-metadata change is authorized. The PASS does not establish executable evidence, complete Runtime conformance, production authorization, or deployment authorization.

# Review Decision

[DOCUMENT-AUTHORITY](../DOCUMENT-AUTHORITY.md) prefers independent human review and permits a documented single-maintainer route when its conditions are met. Rodrigo Lozano explicitly supplied this decision and selected `SINGLE_MAINTAINER`; the established repository route and independent-review unavailability are recorded in [ADR-0030](../adr/ADR-0030-Caller-Driven-Multi-Turn-Application-Runtime.md#human-lifecycle-activation) and [REVIEW-0008](REVIEW-0008-Application-Runtime-First-Physical-Slice-Implementation-Authorization.md#review-decision). No independent reviewer is claimed. AI analysis and test runners may supply evidence but did not make the human decision.

| Field                             | Value                                                                                                                                                                                                                                                                                                           |
| --------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Review Route**                  | `SINGLE_MAINTAINER`                                                                                                                                                                                                                                                                                             |
| **Independent Review**            | `NOT_APPLICABLE_SINGLE_MAINTAINER`                                                                                                                                                                                                                                                                              |
| **Independent Reviewer**          | `NONE_AVAILABLE`                                                                                                                                                                                                                                                                                                |
| **Maintainer Review**             | `PASS`                                                                                                                                                                                                                                                                                                          |
| **Reviewer**                      | Rodrigo Lozano                                                                                                                                                                                                                                                                                                  |
| **Review Timestamp**              | 2026-09-20 (date precision; no human time of day supplied)                                                                                                                                                                                                                                                      |
| **Decision**                      | `PASS — BOUNDED IMPLEMENTATION AUTHORIZATION`                                                                                                                                                                                                                                                                   |
| **Evidence Examined**             | The exact REVIEW-0009 Draft 1.0.0 and its authority, physical API, five-file, fixed Profile B, C1 lifetime, exclusion, and future-evidence assessments at the baseline below.                                                                                                                                   |
| **Decision Rationale**            | The existing C1 path supports explicit Context preparation and exact-lineage Brain binding while preserving one-attempt bookkeeping and current authority boundaries; the five-file, nonproduction scope leaves turns, Runtime cleanup, complete conformance, production, and deployment outside authorization. |
| **Reviewed Version and Baseline** | Draft 1.0.0 at `d07d8e93250826f5b94f36b33f2674aeb240c609`                                                                                                                                                                                                                                                       |
| **Change/Ticket Reference**       | `REVIEW-0009`                                                                                                                                                                                                                                                                                                   |

`INDEPENDENT_REVIEW: NOT_APPLICABLE_SINGLE_MAINTAINER`

`MAINTAINER_REVIEW: PASS`

Rodrigo Lozano's explicit human PASS approves the exact Draft 1.0.0 scope, including the static fixed Profile B C1 path, one retained composition per runtime, explicit caller input, test-owned C1 cleanup solely for resource hygiene, and Runtime → Bootstrap/C1 dependency direction. No failed or unknown mandatory pre-implementation gate is waived or reclassified by this decision. Implementation has not yet occurred; focused executable and architecture evidence remains required after implementation. This human review is not independent review. The decision records authorization only and makes no production or deployment claim.

# Review History

| Version | Date       | Description                                                                                                                                                                                              |
| ------- | ---------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1.0.1   | 2026-09-20 | Recorded Rodrigo Lozano's human SINGLE_MAINTAINER PASS on Draft 1.0.0 and activated its unchanged five-file implementation boundary; executable conformance, production, and deployment remain separate. |
| 1.0.0   | 2026-09-20 | Initial Draft of bounded real Context preparation and Brain binding implementation authorization; human decision pending and implementation unauthorized.                                                |

# Related Documents

- [Documentation Authority](../DOCUMENT-AUTHORITY.md)
- [OES-0001 — Repository Structure](../engineering/OES-0001-Repository-Structure.md)
- [OES-0004 — Contracts](../engineering/OES-0004-Contracts.md)
- [OES-0008 — Documentation Standards](../engineering/OES-0008-Documentation-Standards.md)
- [OES-0010 — Versioning Standards](../engineering/OES-0010-Versioning-Standards.md)
- [ADR-0014 — Bootstrap Composition Responsibility](../adr/ADR-0014-Bootstrap-Composition-Responsibility-and-Ownership-and-Authority-Preservation.md)
- [ADR-0030 — Caller-Driven Multi-Turn Application Runtime](../adr/ADR-0030-Caller-Driven-Multi-Turn-Application-Runtime.md)
- [Application Runtime Specification](../../specifications/Application-Runtime-Specification.md)
- [Application Runtime Implementation Specification](../../specifications/Application-Runtime-Implementation-Specification.md)
- [REVIEW-0008 — First Physical Slice](REVIEW-0008-Application-Runtime-First-Physical-Slice-Implementation-Authorization.md)
- [C1 Implementation Record](../../IMPLEMENTATION-C1.md)

# Engineering Motto

Explicit preparation, exact binding, bounded authority.
