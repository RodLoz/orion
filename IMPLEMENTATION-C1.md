# C1 — Caller-driven bounded application composition

| Field            | Value                                              |
| ---------------- | -------------------------------------------------- |
| Status           | Implementation record; human review complete; PASS |
| Document Version | 1.0.1                                              |
| Scope            | In-process Bootstrap composition only              |

## Composition

`composeBoundedApplicationCapability` is exported from
[Bootstrap](services/bootstrap/src/index.ts). It reuses
`composeFixedProfileBCapability` and adds `composeBrain`, which binds the
existing bounded Brain composition to the same Context issuer.

The caller establishes source material using the existing operations, calls
`prepareContextRevisionWithStructuredKnowledge` explicitly, then calls
`composeBrain({ contextLineageId, lifecycleObserver? })` for that lineage.
Requests are submitted separately through the returned
`orchestrateCognitiveRequest` operation. Composing before an Active Context
exists preserves the existing Context lookup failure.

No request infers preparation, refresh, source material, or profile selection.
The caller owns the lifetime of the returned composition and invokes its
existing `shutdown` operation, delegated unchanged to fixed Profile B and
Knowledge. Repeated shutdown shares the existing shutdown Promise. A failed
Brain binding does not dispose the caller's source composition. This wrapper
adds no resources, Engine behavior, authority registry, or lifecycle policy.

## Authority and boundaries

The composition preserves [REVIEW-0007](docs/architecture-review/REVIEW-0007-K13-F08-Production-Authorization-for-Fixed-Profile-B.md),
[ADR-0022](docs/adr/ADR-0022-Context-Preparation-Semantic-Scope-and-Applicability-Policy.md),
[ADR-0027](docs/adr/ADR-0027-Brain-Structured-Query-Request-Domain.md), and
[ADR-0028](docs/adr/ADR-0028-Bounded-Downstream-Response-Domain-Correspondence.md).
The [Active bounded supplement](specifications/engines/reasoning/ENGINE-0006-Reasoning-Engine-Executable-Bounded-Rule.md)
continues to govern exact Outcomes. No Core Contract or Engine specification
changes. R4 closure, Failure Option A, Option 2, legacy compatibility,
protected Skills, and privacy remain unchanged.

## Evidence

[C1 integration tests](services/bootstrap/test/bounded-application-composition.test.ts)
exercise explicit preparation and execution, exact Context/Outcome/Plan
correspondence, scalar boundaries, anonymous and mismatch Outcomes, foreign
and cloned Context rejection, observer delivery, and idempotent cleanup.
Existing fixed Profile B and recovered bounded integration tests remain
regression authority for source failures, authority rejection, and privacy.

At the 1.0.0 checkpoint, this record did not claim human acceptance of the
completed implementation. The subsequent human decision is recorded below.
No transport, new Skill, deployment, release, or production activation is
authorized by C1.

## Human checkpoint decision — 2026-09-14

| Field                             | Value                       |
| --------------------------------- | --------------------------- |
| Decision maker                    | Rodrigo Lozano              |
| Decision                          | PASS — C1                   |
| Decision date                     | 2026-09-14                  |
| Review route                      | SINGLE_MAINTAINER           |
| Blocking / major / minor findings | 0 / 0 / 0                   |
| Informational findings            | 2; accepted as non-blocking |

Rodrigo Lozano approved the implemented C1 semantics and checkpoint after
human review. This records his decision; it does not claim independent review
or attribute the human decision to AI.

The accepted informational findings are:

- C1-INFO-01: direct C1 tests and existing regression tests provide distinct,
  complementary evidence; the C1 observer and oversized-source checks do not
  independently prove every privacy or downstream rejection condition.
- C1-INFO-02: shutdown preserves existing Knowledge-resource cleanup ownership;
  it does not introduce application-wide revocation of retained Context/Brain
  handles. The caller retains lifetime responsibility after failed Brain binding.

The established executable result remains 2093 passed, 51 skipped, and zero
failed. This decision recording does not represent a new validation run.
Document version 1.0.1 records review completion without changing implementation
semantics; it is a PATCH under OES-0010 Documentation Versioning.

C1 remains an in-process Bootstrap composition with separate explicit caller
preparation and request operations. This PASS does not authorize staging,
commit, push, tagging, deployment, transport/API, Gateway, authentication,
dynamic profile selection, automatic preparation or refresh, new Skills,
Memory-aware Reasoning, or new Reasoning or Planning semantics.

## History

| Version | Description                                                                                                                                 |
| ------- | ------------------------------------------------------------------------------------------------------------------------------------------- |
| 1.0.0   | Record the caller-driven composition and its implementation evidence.                                                                       |
| 1.0.1   | Record Rodrigo Lozano's 2026-09-14 SINGLE_MAINTAINER PASS; accept both informational findings as non-blocking; preserve scope and evidence. |
