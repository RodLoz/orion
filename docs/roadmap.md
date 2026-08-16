# O.R.I.O.N. Milestone Roadmap

| Field          | Value                           |
| -------------- | ------------------------------- |
| **Status**     | Draft                           |
| **Version**    | 1.0.2                           |
| **Owner**      | Project Maintainers             |
| **Created**    | 2026-07-29                      |
| **Updated**    | 2026-08-15                      |
| **Applies To** | Repository milestone sequencing |

---

# Purpose

This roadmap records milestone status and the next architectural slice. It is
a planning summary and does not itself activate specifications or mark
implementation complete.

# Accepted Milestones

Repository history, implementation records, and release tags establish:

| Milestone  | Accepted scope                                        | Evidence               |
| ---------- | ----------------------------------------------------- | ---------------------- |
| Foundation | Architectural foundation                              | `foundation-v1.0`      |
| M0         | Executable architectural skeleton                     | `IMPLEMENTATION-M0.md` |
| M1         | Identity Engine vertical slice                        | `IMPLEMENTATION-M1.md` |
| M2         | Context Engine vertical slice                         | `IMPLEMENTATION-M2.md` |
| M3         | Memory Engine vertical slice                          | `IMPLEMENTATION-M3.md` |
| M4         | Knowledge Engine vertical slice                       | `IMPLEMENTATION-M4.md` |
| M5         | Reasoning Engine vertical slice                       | `m5-reasoning-v1.0`    |
| M6         | Planning Engine vertical slice                        | `m6-planning-v1.0`     |
| M7         | Skill catalog vertical slice                          | `m7-skill-v1.0`        |
| M8         | Security authorization decision foundation            | `m8-security-v1.0`     |
| M9         | Protected Skill invocation and governed authorization | `m9-v1.0`              |
| M10        | Brain orchestration foundation                        | `m10-v1.1`             |

# M10 Active Specification

## M10 — Brain Orchestration Foundation

**Status:** Specification Active. Phase F-A/F-B implemented, review-accepted,
and released as `m10-v1.1`.

M10 defines the first synchronous, deterministic, process-local Brain Engine
vertical slice. It coordinates existing Core-custodied Context, Reasoning,
Planning, Skill, and Security Contracts and constructs one immutable final
cognitive result.

The Active specification set:

- consumes one normalized cognitive request;
- resolves exactly one Active Context Revision;
- requests one Reasoning Outcome and one Candidate Plan;
- treats Planning as advisory;
- permits a valid no-Skill final result;
- coordinates M9 Skill selection, binding, governed authorization, and
  protected invocation only when the request independently carries an exact
  Skill capability intent and the Candidate Plan permits response;
- owns orchestration sequencing, lifecycle, failure normalization, and final
  result construction; and
- preserves every accepted M0–M9 semantic boundary.

ADR-0007, CONCEPT-0006, and ENGINE-0001 are Active. The Brain runtime and its
closed Bootstrap composition are implemented, review-accepted, and released.

The current real Bootstrap graph prepares the fixed Identity-only Context
profile and reaches `request-more-context`. The authoritative, implemented
Identity + Knowledge and Identity + Memory profiles are exercised through
diagnostic and test composition paths but are not wired through the production
Brain composition path.

Current Reasoning preserves a Knowledge or Memory Context fragment opaquely and
selects its bounded rule only from the Identity projection. Profile B or C is
therefore neither necessary nor sufficient to make the runtime-complete Brain
`response` or `skill-result` branch reachable. Production B/C reachability is
deferred because no accepted current runtime consumer requires it. Any future
source-aware Reasoning semantics require a separate architectural decision;
Bootstrap does not fabricate source references, alter Brain semantics, or
introduce a caller/profile-selection API merely for mechanical reachability.

The required issuer-owned authority operations remain available through the
current Active Engine revisions:

- [ENGINE-0003 Context Engine 4.0.0](../specifications/engines/context/ENGINE-0003-Context-Engine-Revision-4.0.0.md),
  defining `Verify Active Context Revision Authority 1.0.0`;
- [ENGINE-0006 Reasoning Engine 2.0.0](../specifications/engines/reasoning/ENGINE-0006-Reasoning-Engine-Revision-2.0.0.md),
  defining `Verify Reasoning Outcome Authority 1.0.0`; and
- [ENGINE-0007 Planning Engine 2.0.0](../specifications/engines/planning/ENGINE-0007-Planning-Engine-Revision-2.0.0.md),
  defining `Verify Candidate Plan Authority 1.0.0`.

Bootstrap composes those Contracts but does not issue or simulate their
authority.

## M10 Release Evidence

The immutable `m10-v1.0` tag points to commit `c52da61` and represents the
accepted pre-Phase-F M10 baseline. It excludes all Phase F-A and Phase F-B work
and must remain unchanged.

Phase F-A and Phase F-B are implemented, review-accepted, and released together
at commit `7b811b9611af1ee3d22856ae979817a5dca9ca2b`. The immutable
`m10-v1.1` tag represents that combined Phase F scope. The historical
`m10-v1.0` tag remains the accepted pre-Phase-F baseline.

# Explicitly Deferred Beyond M10

M10 does not include:

- persistence, databases, workflow history, result persistence, or audit
  persistence;
- Providers, Adapters, external integrations, or external authentication;
- HTTP, REST, GraphQL, WebSocket, CLI, voice, client, or UI behavior;
- Events, queues, streams, brokers, or background execution;
- asynchronous orchestration, cancellation, timeout, retry, compensation, or
  replay;
- distributed operation, locks, authority transport, or replay protection;
- sandboxing or dynamic plugin loading;
- configurable Skill-selection or Security policy;
- a separate Execution Engine;
- executable or multi-step Planning;
- automatic Context refresh or multi-request conversation memory; or
- Memory or Knowledge retrieval in the first Brain slice.

# Active Authority Package

- [ADR-0007 — Brain Orchestration Ownership and Planning Binding](adr/ADR-0007-Brain-Orchestration-Ownership-and-Planning-Binding.md)
- [CONCEPT-0006 — Brain Orchestration Model](../specifications/concepts/CONCEPT-0006-Brain-Orchestration-Model.md)
- [ENGINE-0001 — Brain Engine](../specifications/engines/ENGINE-0001-Brain-Engine.md)

All three documents remain Active and authoritative. Implementation status is
recorded in `IMPLEMENTATION-M10.md`.
