# O.R.I.O.N. Milestone Roadmap

| Field          | Value                           |
| -------------- | ------------------------------- |
| **Status**     | Draft                           |
| **Version**    | 1.0.0                           |
| **Owner**      | Project Maintainers             |
| **Created**    | 2026-07-29                      |
| **Updated**    | 2026-07-31                      |
| **Applies To** | Repository milestone sequencing |

---

# Purpose

This roadmap records milestone status and the next architectural slice. It is
a planning summary and does not itself activate specifications or mark
implementation complete.

# Accepted Milestones

Repository history, implementation records, and release tags establish:

| Milestone  | Accepted scope                                        | Evidence                                                                |
| ---------- | ----------------------------------------------------- | ----------------------------------------------------------------------- |
| Foundation | Architectural foundation                              | `foundation-v1.0`                                                       |
| M0         | Executable architectural skeleton                     | `IMPLEMENTATION-M0.md`                                                  |
| M1         | Identity Engine vertical slice                        | `IMPLEMENTATION-M1.md`                                                  |
| M2         | Context Engine vertical slice                         | `IMPLEMENTATION-M2.md`                                                  |
| M3         | Memory Engine vertical slice                          | `IMPLEMENTATION-M3.md`                                                  |
| M4         | Knowledge Engine vertical slice                       | `IMPLEMENTATION-M4.md`                                                  |
| M5         | Reasoning Engine vertical slice                       | `m5-reasoning-v1.0`                                                     |
| M6         | Planning Engine vertical slice                        | `m6-planning-v1.0`                                                      |
| M7         | Skill catalog vertical slice                          | `m7-skill-v1.0`                                                         |
| M8         | Security authorization decision foundation            | `m8-security-v1.0`                                                      |
| M9         | Protected Skill invocation and governed authorization | `m9-v1.0`                                                               |
| M10        | Brain orchestration foundation                        | `m10-v1.0` (pre-Phase-F baseline at `c52da61`); Phase F release pending |

# M10 Active Specification

## M10 — Brain Orchestration Foundation

**Status:** Specification Active. Phase F-A/F-B implemented and
review-accepted; release pending.

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
closed Bootstrap composition are implemented. Review acceptance does not mean
that the uncommitted Phase F scope has been released or tagged.

The current real Bootstrap graph reaches `request-more-context`. The accepted
Brain `response` and `skill-result` branches remain runtime-complete and may
become reachable when later integration supplies authentic Memory or Knowledge
references. Bootstrap does not fabricate those references or alter Brain
semantics. This is a Bootstrap composition reachability limitation, not a Brain
defect.

The required issuer-owned authority revisions are Active:

- [ENGINE-0003 Context Authority Revision 1.1.0](../specifications/engines/context/ENGINE-0003-Context-Engine-Authority-Revision-1.1.0.md),
  defining `Verify Active Context Revision Authority 1.0.0`;
- [ENGINE-0006 Reasoning Authority Revision 1.1.0](../specifications/engines/reasoning/ENGINE-0006-Reasoning-Engine-Authority-Revision-1.1.0.md),
  defining `Verify Reasoning Outcome Authority 1.0.0`; and
- [ENGINE-0007 Planning Authority Revision 1.1.0](../specifications/engines/planning/ENGINE-0007-Planning-Engine-Authority-Revision-1.1.0.md),
  defining `Verify Candidate Plan Authority 1.0.0`.

Bootstrap composes those Contracts but does not issue or simulate their
authority.

## M10 Release Evidence

The immutable `m10-v1.0` tag points to commit `c52da61` and represents the
accepted pre-Phase-F M10 baseline. It excludes all Phase F-A and Phase F-B work
and must remain unchanged.

Phase F-A and Phase F-B are implemented and review-accepted. Their release is
pending the combined Phase F commit and final acceptance. Planned release tag:
`m10-v1.1`, to be created as a new immutable tag only after acceptance of that
commit. This roadmap does not state that `m10-v1.1` already exists.

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
