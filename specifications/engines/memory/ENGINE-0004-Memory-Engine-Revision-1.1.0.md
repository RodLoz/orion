# ENGINE-0004 — Memory Engine Revision

| Field          | Value                                                                |
| -------------- | -------------------------------------------------------------------- |
| **Status**     | Active                                                               |
| **Supersedes** | 1.0.0                                                                |
| **Version**    | 1.1.0                                                                |
| **Owner**      | Project Maintainers                                                  |
| **Created**    | 2026-08-11                                                           |
| **Updated**    | 2026-08-11                                                           |
| **Applies To** | Memory lifecycle, retrieval, and CONTRACT-0001 Context participation |

---

## Status and Authority

This specification is Active and is the sole current canonical ENGINE-0004
revision. It supersedes 1.0.0, which remains historical and
non-authoritative. This revision preserves Memory semantics and adds only the
current qualified-source collaboration with Context.

## Purpose and Semantic Preservation

Memory remains the single semantic owner of intentionally retained episodic
experience. Existing Retain Memory, Get Memory, List Retained Memory
References, and Forget Memory operations remain unchanged.

Get Memory Request, Retrieved Memory, Memory Record, Memory Reference,
Retrieval Receipt, retrieval purpose, Store behavior, retention, provenance,
lifecycle, forgetting, persistence behavior, and Memory failures retain their
1.0.0 semantics.

Memory may participate as a qualified source in CONTRACT-0001 Context
preparation. Participation is additive and transfers no semantic ownership.

## Memory-owned Responsibilities

Memory owns:

- request interpretation and validation;
- Store invocation and result validation;
- Memory Record reconstruction;
- Memory Identity, classification, Provenance, retention, and lifecycle;
- Memory Reference and Retrieval Receipt semantics;
- retrieval-purpose and last-use semantics;
- listing and forgetting; and
- Memory-domain failures.

Core remains schema custodian. Store implementations own technical mechanics
only.

## Context Collaboration

For the fixed Identity + Memory profile, Context initiates Get Memory through
the Core-custodied Contract and forwards the exact opaque Get Memory Request.
Memory validates and executes that request, interacts with its Store, and
returns Retrieved Memory under Memory-owned semantics.

Retrieved Memory is candidate material. Its Memory Reference is the
source-owned handoff available to Context incorporation. Candidate availability
does not itself incorporate, validate, activate, establish currentness, verify
authority, authorize, or enforce anything.

Context alone decides candidate use, reconstructs its Memory Context
Projection, incorporates the fixed fragment set, validates Context, applies
Context reuse/successor lifecycle, activates the revision, and issues Context
authority.

## Context Projection Boundary

Context preserves only Memory Identity, episodic kind, stored lifecycle
information, and Memory attribution. Memory Record content, Provenance,
retention reason, retained-at time, Retrieval Receipt, retrieved-at time,
purpose, last-use state, Store state, and source-object identity remain outside
Context.

The Context projection is Context-owned representation. It does not replace or
redefine Memory Record or Memory Reference semantics.

## Historical and Forgetting Boundaries

Memory continues to own persistence, Store reconstruction, listing, retention,
and forgetting. Context participation does not transfer Memory Store history,
rehydration, replay, evidence-sufficiency, or historical-selection ownership.

Later Forget Memory makes later Get Memory retrieval fail according to Memory
semantics. It does not retroactively mutate an already incorporated Context
revision. Get Memory reconstructing Memory-owned return material from Store
output is not Context Logical Reconstruction.

## Currentness and Authority

Memory lifecycle or retention state, Source Currentness, and Contextual
Currentness are distinct. Memory 1.1.0 defines no Source Currentness value.
`stored` does not mean source current, and forgetting does not invalidate prior
Context.

Retention, retrieval, attribution, or Context incorporation does not establish
authority verification. Memory confidence is not introduced. Security retains
authorization ownership and protected boundaries retain enforcement ownership.

## Failures

Get Memory preserves these existing Memory-owned failures:

- Invalid Memory Input;
- Invalid Memory Identity;
- Memory Not Found;
- Memory Store Unavailable; and
- Invalid Memory State.

They propagate unchanged through Context preparation. Invalid Memory Lifecycle
Transition is not added to Get Memory retrieval semantics. Malformed material
returned by a nonconforming collaborator is rejected by Context at its own
projection/incorporation boundary rather than fabricated as a Memory failure.

No retry, fallback, recovery, timeout, compensation, rollback, cancellation,
or dead-letter mechanism is added.

## Persistence and Execution Model

Memory Store semantics remain unchanged and technology-neutral. This revision
adds no production database, cache, file, vector store, transport, Provider,
Adapter, event system, process-placement rule, or synchronous architectural
requirement.

## Bootstrap and Downstream Boundaries

Bootstrap may construct lifecycle-ready Memory, obtain Get Memory, and inject
that Core-custodied collaborator into Context. Bootstrap does not interpret
Memory, select latest Memory, construct references or fragments, incorporate,
or expose raw Memory downstream.

Brain and Reasoning consume only the authoritative Active Context Revision.
Get Memory Request, Retrieved Memory, Memory Reference, and Memory Record do
not enter them as parallel evidence. Planning consumes Reasoning output only.

## Compatibility and Conformance

Version 1.1.0 is minor because all existing public Memory operations, request
and result contracts, Store semantics, lifecycle, retention, provenance,
forgetting, receipt, purpose, and failure behavior remain unchanged. Qualified
Context participation is additive.

Conformance evidence covers exact request forwarding, source-owned
interpretation, candidate/incorporation separation, reference handoff,
projection minimization, exact failure identity, partial-success safety,
malformed candidate distinction, semantic reuse, and prospective forgetting
stability.

## Change History

| Version | Date       | Description                                                                                   |
| ------- | ---------- | --------------------------------------------------------------------------------------------- |
| 1.0.0   | 2026-07-20 | Established intentional episodic retention, retrieval, listing, and forgetting.               |
| 1.1.0   | 2026-08-11 | Added qualified CONTRACT-0001 Context participation without changing Memory source semantics. |

## References

- [CONTRACT-0001 — Context Source Retrieval](../../../docs/contracts/CONTRACT-0001-Context-Source-Retrieval.md)
- [CONCEPT-0001 — Memory Model](../../concepts/CONCEPT-0001-Memory-Model.md)
- [CONCEPT-0003 — Context Model](../../concepts/CONCEPT-0003-Context-Model.md)
- [Context Engine 4.0.0](../context/ENGINE-0003-Context-Engine-Revision-4.0.0.md)
- [ADR-0005 — Memory Architecture Principles](../../../docs/adr/ADR-0005%20%E2%80%94%20Memory%20Architecture%20Principles)
- [ADR-0008 — Context Collaboration and Source Ownership](../../../docs/adr/ADR-0008-Context-Collaboration-Source-Ownership-and-Reference-Authority.md)
- [ADR-0009 — Context Revision Preparation and Lifecycle](../../../docs/adr/ADR-0009-Context-Revision-Preparation-Reference-Stability-and-Source-Change.md)
- [ADR-0010 — Context Retrieval Initiation](../../../docs/adr/ADR-0010-Context-Retrieval-Initiation-Request-and-Result-Semantics.md)
- [ADR-0011 — Contextual Currentness](../../../docs/adr/ADR-0011-Source-Currentness-Contextual-Currentness-and-Currentness-Change.md)
- [ADR-0013 — Failure Ownership](../../../docs/adr/ADR-0013-Failure-Ownership-Propagation-and-Candidate-Context-Revision-Consequences.md)
- [ADR-0016 — Persistence and Reconstruction](../../../docs/adr/ADR-0016-Persistence-Logical-Reconstruction-Exact-Replay-and-Historical-Reproduction-Boundaries.md)
- [Documentation Authority](../../../docs/DOCUMENT-AUTHORITY.md)
- [OES-0004 — Contracts](../../../docs/engineering/OES-0004-Contracts.md)
- [OES-0008 — Documentation Standards](../../../docs/engineering/OES-0008-Documentation-Standards.md)
- [OES-0010 — Versioning Standards](../../../docs/engineering/OES-0010-Versioning-Standards.md)

## Engineering Motto

> Memory supplies source-owned candidate material without transferring Memory ownership.
