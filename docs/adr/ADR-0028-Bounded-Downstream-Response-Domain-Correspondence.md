# ADR-0028 — Bounded Downstream Response-Domain Correspondence

| Field             | Value                                            |
| ----------------- | ------------------------------------------------ |
| **Status**        | Active                                           |
| **Version** | 1.0.2 |
| **Owner**         | Project Maintainers                              |
| **Created**       | Historical date unavailable in recovery evidence |
| **Updated** | 2026-09-14 |
| **Recovery Date** | 2026-09-11                                       |
| **Decision Type** | Architecture Decision                            |

## Recovery provenance

This document reconstructs a previously recorded, approved decision whose
artifact was lost. The maintainer's RECOVERY-03 record establishes ADR-0028 as
Active version 1.0.1 with prior human PASS by Rodrigo Lozano through the
SINGLE_MAINTAINER route. The recovered baseline is
`7a30a41c83c305cb848e812d6556fc63ef600f26`.

This wording is a reconstruction, not a byte-identical historical artifact or
a quotation of unavailable text. Original creation, update, and review
timestamps and earlier version details are unavailable. The recovery date is
not a substitute historical approval timestamp. No new human decision,
independent reviewer, or unavailable validation evidence is asserted.

## Problem and governing authority

Active Reasoning Engine 3.0.0 permits a valid bounded Profile B textual scalar
through 4096 Unicode code points. Planning and Brain historically retained
2048-limited downstream response acceptance. A valid bounded Reasoning response
can therefore exceed those downstream domains even though its semantic result
is valid.

The selected correspondence must preserve that result without transferring
Reasoning semantics to downstream consumers. Active Reasoning 3.0.0 and the
recovered approved decision govern. The bounded-rule supplement remains a
non-authoritative Draft; its contents do not independently authorize this change.

## Decision

For successful bounded Profile B Reasoning3 evaluation, the candidate response
is the exact accepted `textualScalar`. Planning's response step and Brain's
final response must preserve the full valid bounded Reasoning3 response domain
through 4096 Unicode code points, inclusive.

Acceptance preserves all other governed validity constraints. The limit is
counted by Unicode code points, not UTF-16 code units or bytes; a non-BMP
character counts as one code point. Valid values of 2048, 2049, and 4096 code
points are within the bounded domain; 4097 code points exceeds it.

## Exact-value rule

Accepted bounded responses must be preserved exactly through Reasoning,
Planning, and Brain. No truncation, paraphrase, whitespace normalization,
Unicode normalization, summary, reinterpretation, or semantic conversion is
permitted. Accepted leading, trailing, and internal whitespace remains exact.

An oversized response must not be shortened into the domain or converted to
insufficiency, non-applicability, success, or another semantic result. It is
outside the bounded acceptance domain. This rule does not select a new error
mapping or resolve cross-capability failure propagation.

## Compatibility and legacy isolation

This is scoped bounded-response correspondence, not global widening. Unrelated
legacy 2048 response domains retain their existing limits and behavior.
ADR-0027's structured and legacy textual request paths remain unchanged; query
limits are not response limits. No new response or explainability field is
selected by this ADR.

Consumers of bounded Reasoning3 results must support the complete valid domain
before that downstream path can be claimed conformant. A consumer still limited
to 2048 cannot satisfy this correspondence by silently modifying larger values.

## Ownership and public boundaries

- Reasoning owns reasoning semantics, bounded evaluation, and candidate response
  construction.
- Planning owns Plan transformation and preserves the accepted response in its
  response step without re-evaluating the proposition.
- Brain owns orchestration and final-result assembly, preserving the accepted
  Plan response without acquiring Reasoning or Planning semantics.
- Core retains custody of shared language and executable Contract surfaces.
- Bootstrap performs composition only and acquires no semantic ownership.
- Context and Knowledge retain their existing authority and evidence boundaries;
  existing authority verification remains required.

Public explainability shape and diagnostic mechanisms remain unchanged. This
decision does not expose private proposition metadata or add diagnostic fields.

## Migration and version treatment

Later implementation recovery must align bounded downstream types and validators
with the existing governed response domain while isolating legacy acceptance.
It must establish exact-value, boundary, Unicode, and legacy-regression evidence
before claiming runtime correspondence. This checkpoint changes no validators,
production implementation, or tests and does not close R4-RESIDUAL-02.

ADR version 1.0.1 is the supplied historical document version, not a runtime
package version. Brain Engine Revision 2.0.3 is retained; the accompanying
Concept and Brain notes are editorial correspondence to this ADR. They do not
assert unknown historical specification versions. Any later executable Contract
or package version treatment must follow OES-0010 according to its actual
compatibility impact; this recovery record does not invent release numbers or
claim deployment/migration completion.

## Explicit exclusions

Failure propagation remains separate and unresolved. The bounded-rule supplement
remains Draft and is not activated. Deployment remains unauthorized. REVIEW-0004
historical consolidation remains deferred to RECOVERY-08. This ADR does not
resolve R4-06 or R4-07, establish full R4 reconciliation, or claim current
bounded runtime completion.

## Recovered governance record

- Decision maker: Rodrigo Lozano.
- Review route: SINGLE_MAINTAINER.
- Historical maintainer review: PASS, as supplied in the recovery record.
- Independent review: NOT_APPLICABLE_SINGLE_MAINTAINER.
- Independent reviewer: none represented.
- Historical review timestamp: unavailable.

The prior human decision is distinct from this document reconstruction and
from fresh recovery validation. No AI agent or second human is represented as
the historical reviewer.

## History

| Version | Date                        | Description                                                                                                                                                    |
| ------- | --------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1.0.2 | 2026-09-14 | Synchronized current lifecycle references with established Active authority; document-only PATCH, preserving semantic revision identities, historical checkpoints, implementation gates, and deployment separation. |
| 1.0.1   | Historical date unavailable | Active version and prior human PASS established by the supplied recovery record; wording reconstructed on 2026-09-11. Earlier version details are unavailable. |

## Related documents

- [Documentation Authority](../DOCUMENT-AUTHORITY.md)
- [OES-0008 — Documentation Standards](../engineering/OES-0008-Documentation-Standards.md)
- [OES-0010 — Versioning Standards](../engineering/OES-0010-Versioning-Standards.md)
- [Active Reasoning Engine 3.0.0](../../specifications/engines/reasoning/ENGINE-0006-Reasoning-Engine-Revision-3.0.0.md)
- [Active bounded Reasoning supplement 2.0.0](../../specifications/engines/reasoning/ENGINE-0006-Reasoning-Engine-Executable-Bounded-Rule.md)
- [ADR-0027 — Brain Structured Query Request Domain](ADR-0027-Brain-Structured-Query-Request-Domain.md)
- [Brain Orchestration Model](../../specifications/concepts/CONCEPT-0006-Brain-Orchestration-Model.md)
- [Brain Engine 2.0.3](../../specifications/engines/ENGINE-0001-Brain-Engine-Revision-2.0.3.md)
