# ADR-0027 — Brain Structured Query Request Domain

| Field             | Value                                            |
| ----------------- | ------------------------------------------------ |
| **Status**        | Active                                           |
| **Version**       | 1.0.1                                            |
| **Owner**         | Project Maintainers                              |
| **Created**       | Historical date unavailable in recovery evidence |
| **Updated**       | Historical date unavailable in recovery evidence |
| **Recovery Date** | 2026-09-11                                       |
| **Decision Type** | Architecture Decision                            |

## Recovery provenance

This artifact reconstructs a lost, previously approved ADR from the maintainer's
RECOVERY-01 instructions and the recovered baseline
`7a30a41c83c305cb848e812d6556fc63ef600f26`. The supplied recovery record establishes
Active version 1.0.1 and a previously recorded human PASS by Rodrigo Lozano,
the single human maintainer and decision maker. The wording below is recovered
correspondence, not a byte-identical copy or a new historical quotation.
Original creation, update, and review timestamps are unavailable.

## Problem

The Brain request boundary previously accepted only the legacy textual
`ReasoningQuery`. Reasoning3 already defines a governed caller-supplied
`BoundedReasoningQuery`. Brain needs to carry that existing representation
without deriving structured rules from arbitrary text or acquiring Reasoning
semantic ownership.

## Decision

The existing `query` field of `NormalizedCognitiveRequest` accepts either
`ReasoningQuery` or the existing `BoundedReasoningQuery`.

The bounded representation contains exactly `kind`, `subjectKey`, and
`predicateKey`. Its supported kind is `exact-text-attribute-value`. The existing
Core `createBoundedReasoningQuery` factory and governed identifier validators
remain the source of executable bounded-query validation; this decision creates
no competing representation.

Brain captures exact own enumerable data properties before bounded validation,
rejecting accessors, extra fields, symbols, invalid prototypes, and malformed
values under its existing request-construction conventions. It constructs an
immutable captured query without freezing or retaining the caller's mutable
query object. Invalid requests retain `InvalidBrainRequestError` at this boundary.

Primitive strings continue through `reasoningQuery` unchanged, with the existing
2048 Unicode-code-point limit and non-empty requirement. Brain does not parse
JSON text, infer a rule, normalize identifiers, or convert free text into a
bounded query.

## Authority and consequences

The caller supplies the requested query. Supplying it establishes no Knowledge
truth, Context authority, applicability, sufficiency, or authorization.
Reasoning retains rule evaluation and outcome semantics. Context retains
revision issuance and authority. Brain retains orchestration; Core retains
shared language custody. Existing authority verification remains required.

This correspondence changes only the request query domain. It does not widen
Reasoning, Planning, or Brain response domains, resolve failure propagation,
introduce diagnostics, activate the bounded-rule supplement, or authorize
deployment. Request construction alone does not establish a working bounded
Brain runtime integration; that recovery belongs to later checkpoints.

## Validation correspondence

Focused Core coverage must establish exact structured shape preservation,
immutable capture, malformed and hostile input rejection, unchanged legacy
strings and limits, and absence of free-text rule inference. Historical PASS
is distinct from fresh recovery validation; no unavailable test output is
asserted here.

## Recovered governance record

- Maintainer: Rodrigo Lozano.
- Historical maintainer review: PASS, supplied by the recovery record.
- Independent review: NOT_APPLICABLE_SINGLE_MAINTAINER.
- Independent reviewer: none represented.
- Historical review timestamp: unavailable.

No AI agent or second human is represented as the historical reviewer.
REVIEW-0004 historical consolidation is deferred to RECOVERY-08. This checkpoint
does not record later residuals as PASS; R4-06 remains OPEN and R4-07 remains
UNRESOLVED / BLOCKED_GOVERNANCE.

## History

| Version | Date                        | Description                                                                                                                                                    |
| ------- | --------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1.0.1   | Historical date unavailable | Active version and prior human PASS established by the supplied recovery record; wording reconstructed on 2026-09-11. Earlier version details are unavailable. |

## Related documents

- [Brain Orchestration Model](../../specifications/concepts/CONCEPT-0006-Brain-Orchestration-Model.md)
- [Brain Engine 2.0.3](../../specifications/engines/ENGINE-0001-Brain-Engine-Revision-2.0.3.md)
- [Reasoning bounded-rule supplement](../../specifications/engines/reasoning/ENGINE-0006-Reasoning-Engine-Executable-Bounded-Rule.md)
- [Documentation Authority](../DOCUMENT-AUTHORITY.md)
- [OES-0004 — Contracts](../engineering/OES-0004-Contracts.md)
- [OES-0008 — Documentation Standards](../engineering/OES-0008-Documentation-Standards.md)
