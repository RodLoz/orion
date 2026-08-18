# ADR-0021 — Knowledge Source Currentness and Projection Attribution

| Field             | Value                                                                                 |
| ----------------- | ------------------------------------------------------------------------------------- |
| **Status**        | Active                                                                                |
| **Version**       | 1.0.0                                                                                 |
| **Owner**         | Orion Architecture                                                                    |
| **Created**       | 2026-08-17                                                                            |
| **Updated**       | 2026-08-17                                                                            |
| **Decision Type** | Architecture Decision                                                                 |
| **Applies To**    | Knowledge-owned Source Currentness and structured Knowledge projection correspondence |

---

# Context

ADR-0011 assigns Source Currentness to the applicable issuing source and
separates it from Contextual Currentness, authority, authorization, retrieval,
and incorporation. ADR-0020 authorizes a bounded Knowledge proposition
projection whose source-owned currentness and issuer authority must be
established before Context incorporation.

Knowledge 1.3.0 further distinguishes two accepted ownership cases. An
external source supplies its completed preparation-cycle currentness
correspondence when it owns the determination. Knowledge must establish the
determination itself when the accepted structured proposition identifies
Knowledge as the applicable Source Currentness owner.

The current architecture identifies that owner but does not yet state which
Knowledge-owned lifecycle facts produce a positive or negative determination.
It also requires privacy-safe attribution and Knowledge issuance
correspondence without identifying their accepted operand or their relationship
to exact-object projection authority.

# Problem Statement

Treating acceptance, possession, version, retrieval, or projection issuance as
currentness would contradict ADR-0011. Adding a time-based freshness policy,
network refresh, or implicit latest lookup would introduce unsupported policy.
The smallest deterministic rule must instead use Knowledge's existing
source-domain lifecycle standing while preserving preparation-specific
evaluation and historical Context stability.

Projection attribution presents a separate risk. Passing raw provenance or
acceptance evidence would violate minimization. Allowing a caller to mint an
opaque attribution or issuance string would make representation appear
authoritative. Independent issuance tokens and verifier state would duplicate
Knowledge authority.

# Decision

## D-041 — Knowledge-Owned Source Currentness Responsibility

1. Knowledge owns Source Currentness only when the accepted structured
   proposition carries the governed `knowledge-owned-currentness`
   correspondence.
2. That accepted correspondence identifies the owner. It does not establish
   Source Currentness for acceptance time or a later preparation.
3. Knowledge MUST determine its Source Currentness anew for every candidate-
   preparation cycle in which its projection is requested.
4. Context supplies the opaque CandidatePreparationAssociation. It does not
   determine Knowledge Source Currentness.
5. The determination MUST remain internal to the Knowledge source boundary and
   MUST NOT introduce a generic Currentness service or a new capability.

## D-042 — Determination Inputs and Lifecycle Criterion

The Knowledge-owned determination has exactly these governed input facts:

- the exact Knowledge identity;
- the exact expected Knowledge version;
- the exact accepted structured proposition and PropositionIdentity;
- the accepted `knowledge-owned-currentness` correspondence;
- the exact Knowledge lifecycle standing recorded by the applicable Knowledge
  authority; and
- the CandidatePreparationAssociation for the preparation being evaluated.

A positive determination requires all of the following at determination time:

1. the exact Knowledge identity is known to the applicable Knowledge authority;
2. the exact expected version matches that identity's confirmed record;
3. the record remains Accepted and structurally valid;
4. the exact PropositionIdentity and structured proposition remain bound to
   that record;
5. the accepted currentness-owner correspondence is
   `knowledge-owned-currentness`; and
6. that exact Knowledge identity/version remains current in Knowledge's
   governed lifecycle and has not been superseded or otherwise made non-current.

This is a source-lifecycle-standing determination. Accepted state is necessary
but not sufficient. Version correspondence is necessary but not sufficient.
The current lifecycle standing is evaluated explicitly for the exact target at
each preparation.

A negative determination results when the exact confirmed and structurally
valid accepted proposition is no longer current in Knowledge's governed
lifecycle, including when it has been superseded or otherwise made non-current
under existing Knowledge lifecycle semantics.

Knowledge is unable to determine currentness when it cannot establish the
required authoritative facts, including unavailable or malformed source state,
inconsistent identity/version metadata, malformed accepted proposition
correspondence, or unavailable lifecycle standing. Inability to determine is
not a negative determination and MUST NOT be converted into one.

No rule in this decision performs latest lookup or substitutes another
Knowledge identity or version. The exact requested target alone is evaluated.

## D-043 — Preparation Binding, Replay, and Persistence

1. A completed positive Knowledge-owned currentness result MUST bind the exact
   CandidatePreparationAssociation and exact accepted proposition evaluated.
2. A result bound to preparation A MUST NOT satisfy preparation B.
3. Knowledge MUST recompute the determination for every distinct preparation
   association.
4. Acceptance-time, previous-projection, previous-preparation, cached, or
   historical Context currentness MUST NOT satisfy a new preparation.
5. The preparation result MUST NOT be persisted as accepted Knowledge state or
   as a durable/global currentness token.
6. Implementations MAY retain process-local authority state only for the
   lifetime needed to issue and verify the exact projection for that
   preparation.
7. No TTL, wall-clock freshness, refresh interval, network refresh, timestamp
   comparison, implicit cache freshness, or implicit latest lookup is created.
8. Retrieval, possession, projection eligibility, projection issuance, and
   verifier success MUST NOT independently establish Source Currentness.
9. A later Knowledge lifecycle change affects later preparations only. It MUST
   NOT mutate, reopen, or invalidate a stable or Active historical Context
   Revision.

The minimum successful Knowledge-owned currentness correspondence records only:

- Knowledge as determination owner;
- the exact CandidatePreparationAssociation;
- correspondence to the exact accepted Knowledge proposition; and
- completion of the positive determination.

It is opaque outside Knowledge and is never rule-visible semantic material.

## D-044 — Knowledge Capability Attribution

1. The authoritative attribution operand for this slice is the existing closed
   Knowledge capability attribution: `authoritativeCapability = knowledge`.
2. This operand means only that the accepted structured proposition is an
   authoritative Knowledge proposition issued and owned within the Knowledge
   capability.
3. It does not identify or claim that Knowledge is the proposition's original
   information source. Original-source identity, KnowledgeProvenance, source
   authority, Source Currentness, acceptance evidence, projection issuance,
   projection authority, and authorization remain distinct.
4. Successful structured Knowledge acceptance establishes this attribution by
   creating the exact accepted Knowledge record and proposition under Knowledge
   ownership after all existing CandidateClaim, structured-proposition,
   source-ownership, provenance, acceptance-evidence, and applicable source-
   authority validations succeed.
5. The accepted structured proposition requires no separately allocated,
   persisted, or caller-supplied attribution identity. Its enclosing accepted
   Knowledge record already binds Knowledge identity/version, while its nested
   accepted state binds PropositionIdentity, structured semantic value, and
   accepted source-ownership correspondence.
6. No attribution token, allocator, registry, UUID, counter, hash, or opaque
   accepted-attribution identity is created by this decision.

Raw KnowledgeProvenance, acceptance evidence and rationale, credentials, source
payloads, source internals, and Store metadata remain private and MUST NOT be
projected to Context or Reasoning.

## D-045 — Projection Attribution

Projection attribution is the privacy-safe closed Knowledge capability
attribution of the exact accepted proposition. Where executable shared language
represents it, its only valid semantic value is the existing Knowledge
authoritative-capability attribution.

Knowledge MUST bind that closed attribution fact to the exact projection through
Knowledge projection-authority capture. It MUST NOT create an attribution
identity, reconstruct original-source attribution from provenance, expose
provenance internals, or accept caller-supplied attribution.

Context MAY preserve the opaque correspondence as required for incorporation
and authority. Reasoning MUST NOT interpret it as rule-visible semantics or use
it as a retrieval handle.

This uses the existing Knowledge capability attribution because it is the
narrowest governed operand. Projection and verification preserve its binding to
the exact accepted proposition without creating another identity or attribution
domain.

## D-046 — Knowledge Issuance and Projection Authority

1. Knowledge owns structured-projection issuance and verification.
2. One process-local Knowledge projection-authority capture MUST serve as the
   single authority mechanism for both issuance correspondence and verifier
   behavior.
3. Knowledge MUST NOT create an independent bearer-token authority mechanism,
   global registry, durable authority record, or cryptographic proof merely to
   represent issuance correspondence.
4. The opaque issuance correspondence is a view/reference to that same
   authority capture. It is not independently caller-constructible and has no
   authority when separated from the captured exact projection.
5. Knowledge may allocate the opaque correspondence while constructing the
   candidate, but issuance succeeds only when the completed exact projection is
   captured by the applicable Knowledge authority instance.
6. Capture occurs only after target, accepted-state, structured-proposition,
   currentness, attribution, and all other projection-eligibility checks
   succeed.

The authority capture MUST bind:

- the exact projection object;
- the exact Knowledge identity and version;
- the exact PropositionIdentity and structured semantic tuple;
- the exact CandidatePreparationAssociation;
- the accepted source-ownership correspondence;
- the applicable preparation-cycle currentness correspondence;
- the closed Knowledge capability attribution of the accepted proposition; and
- any required preserved underlying-source authority correspondence.

Structural equality does not establish authority. A clone, reconstruction,
substitution, or projection issued by another Knowledge authority instance
MUST fail verification.

## D-047 — Projection Verifier

1. The Knowledge verifier consumes the exact candidate projection under the
   closed verification intent established by the Knowledge projection
   operation.
2. It verifies that the same Knowledge authority instance captured that exact
   projection object and that its captured correspondence remains intact.
3. On success it returns the exact candidate, not a reconstruction or
   transformed value.
4. It MUST NOT reconstruct issuance from public fields or treat possession of
   opaque correspondence as authority.
5. It MUST NOT verify external-source authority or Source Currentness
   semantics, Contextual Applicability, Context authority, Reasoning
   applicability or sufficiency, authorization, or response correctness.

## D-048 — Failure Ownership

| Condition                                                             | Originating owner          | Consequence                                                           |
| --------------------------------------------------------------------- | -------------------------- | --------------------------------------------------------------------- |
| Malformed Knowledge-owned currentness request                         | Knowledge                  | Reject determination; issue no projection                             |
| Accepted/requested currentness-owner mismatch                         | Knowledge                  | Projection-prerequisite failure                                       |
| Knowledge identity, version, proposition, or source-binding mismatch  | Knowledge                  | Correspondence or prerequisite failure                                |
| Exact valid proposition is non-current in Knowledge lifecycle         | Knowledge                  | Negative Source Currentness determination; issue no projection        |
| Authoritative Knowledge lifecycle/source state cannot be established  | Knowledge                  | Unable-to-determine failure; issue no projection                      |
| Missing or invalid Knowledge capability attribution on the projection | Knowledge                  | Projection construction or correspondence failure                     |
| Projection authority capture or issuance failure                      | Knowledge                  | Issue no authoritative projection                                     |
| Invalid verifier request or exact-object/authority mismatch           | Knowledge                  | Projection verification failure                                       |
| External-source currentness or authority failure                      | Applicable external source | Preserve originating failure identity; Knowledge issues no projection |

Knowledge MAY own the no-projection consequence without translating an
external-origin failure into a Knowledge-owned semantic failure.

## D-049 — Preserved Boundaries

This decision preserves:

- Context ownership of candidate preparation, Contextual Applicability,
  Contextual Currentness, incorporation, revision lifecycle, and Context
  authority;
- Reasoning ownership of exact-query applicability, evidence sufficiency, and
  Reasoning outcomes;
- source ownership of Source Currentness and authority when Knowledge is not
  the applicable owner;
- Security ownership of authorization;
- Planning and Brain source opacity;
- CandidateClaim opacity and the prohibition on parsing it for structured
  semantics, attribution, or currentness;
- exactly Context Profiles A, B, and C;
- stable historical Context after later Knowledge lifecycle changes; and
- inward dependency direction and Core custody without Core ownership of
  Knowledge behavior.

# CONTRACT-0001 Assessment

`CONTRACT_0001_SUFFICIENT`.

Knowledge-owned currentness is an internal source-specialization responsibility.
The CandidatePreparationAssociation already travels within the authorized
candidate-preparation collaboration. Knowledge capability attribution,
projection issuance, and issuer verification are Knowledge-owned projection
semantics.
No new retrieval, verification, registry, currentness-service, or cross-engine
collaboration is introduced. CONTRACT-0002 is neither required nor created.

# Rationale

Knowledge's governed current/superseded lifecycle is the narrowest existing
source-domain standing that can determine whether its exact accepted record
remains eligible as current. Requiring the complete exact target and explicit
per-preparation evaluation prevents Accepted state or version possession from
becoming implicit currentness. It also avoids inventing time-based or external
freshness policy.

Using the existing closed Knowledge capability attribution keeps private
provenance inside Knowledge while giving projection and verification a stable,
privacy-safe attribution fact. Binding that fact through projection authority
avoids repeated interpretation and competing attribution identities.

Using one process-local exact-object capture for issuance and verification
matches existing Engine authority precedent. It prevents a public opaque value
from becoming a bearer proof and avoids duplicate authority mechanisms.

# Alternatives Considered

## Accepted State or Exact Version Establishes Currentness

Rejected because ADR-0011 explicitly separates acceptance, version, and source
currentness.

## Latest Lookup or Time-Based Freshness

Rejected because the operation targets one exact version and no TTL, timestamp,
refresh, or latest-selection policy is authorized.

## Persist Preparation Currentness

Rejected because preparation currentness is invocation-scoped and historical
state cannot establish currentness for a later preparation.

## Project Raw Provenance or Acceptance Evidence

Rejected because it violates minimization and exposes private Knowledge state.

## Caller Supplies Attribution or Issuance Tokens

Rejected because possession or representation cannot create Knowledge
acceptance or issuance authority.

## Separate Issuance Token and Verifier Authority Systems

Rejected because it duplicates authority, permits divergence, and provides no
governed semantic benefit in the process-local architecture.

# Consequences

- Knowledge can determine its own Source Currentness without TTL, latest lookup,
  network refresh, or a generic service.
- Superseded or otherwise non-current Knowledge fails later preparation without
  mutating historical Context.
- Structured accepted state requires no new attribution identity or persisted
  attribution token.
- Projection carries the closed Knowledge capability attribution without
  exposing raw provenance or reconstructing original-source attribution.
- One Knowledge authority capture governs issuance correspondence and exact-
  object verification.
- Knowledge 1.3.0 and its executable projection-operation Draft require
  synchronized correction under this Active decision.
- Core requires additive language for Knowledge-owned preparation currentness
  correspondence and projection construction/capture mechanics. It requires no
  accepted-attribution identity or attribution allocator; shared projection
  language need represent Knowledge capability attribution only if that fact is
  not already mechanically established by existing Knowledge ownership types.
- Knowledge runtime requires per-preparation lifecycle evaluation, preservation
  of Knowledge capability attribution through projection capture, and exact-
  object verification. It MUST NOT mint or persist an accepted-attribution
  identifier.
- Context 5.0.1 requires no semantic modification.

# Compatibility and Existing Architecture

This decision refines Knowledge-owned behavior without changing existing
Knowledge 1.2.0 request, record, retrieval, reference, attribution, or lifecycle
semantics. Legacy and structured records require no new accepted-attribution
identity.

ADR-0011 ownership remains unchanged. ADR-0020's bounded Knowledge evidence
boundary remains unchanged. Context, Reasoning, Planning, Brain, Security,
CONTRACT-0001, and Profiles A/B/C retain their existing responsibilities.

# Required Follow-Up

Under this Active decision, separate reviewed work must:

1. correct Knowledge 1.3.0 with the lifecycle-standing criterion and closed
   Knowledge capability attribution;
2. correct the executable projection-operation Draft with the Knowledge-owned
   currentness result and single-capture issuance model;
3. add the minimum Core currentness-result and projection construction/capture
   language, removing any redundant accepted-attribution identity or allocator;
4. resume Knowledge runtime and conformance implementation; and
5. validate the later Context integration boundary without modifying Context
   5.0.1 semantics.

This ADR does not itself authorize Engine activation or claim implementation
completion.

# Dependencies

- [ADR-0001 — Core Ownership and Dependency Direction](ADR-0001-Core-Ownership-and-Dependency-Direction.md)
- [ADR-0008 — Context Collaboration, Source Ownership, and Reference Authority](ADR-0008-Context-Collaboration-Source-Ownership-and-Reference-Authority.md)
- [ADR-0011 — Source Currentness, Contextual Currentness, and Currentness Change](ADR-0011-Source-Currentness-Contextual-Currentness-and-Currentness-Change.md)
- [ADR-0013 — Failure Ownership, Propagation, and Candidate Context Revision Consequences](ADR-0013-Failure-Ownership-Propagation-and-Candidate-Context-Revision-Consequences.md)
- [ADR-0014 — Bootstrap Composition Responsibility and Ownership and Authority Preservation](ADR-0014-Bootstrap-Composition-Responsibility-and-Ownership-and-Authority-Preservation.md)
- [ADR-0020 — Knowledge Evidence Boundary for Source-Aware Reasoning](ADR-0020-Knowledge-Evidence-Boundary-for-Source-Aware-Reasoning.md)
- [CONTRACT-0001 — Context Source Retrieval](../contracts/CONTRACT-0001-Context-Source-Retrieval.md)
- [Knowledge Engine 1.2.0](../../specifications/engines/knowledge/ENGINE-0005-Knowledge-Engine-Revision-1.2.0.md)
- [Knowledge Engine 1.3.0 Draft](../../specifications/engines/knowledge/ENGINE-0005-Knowledge-Engine-Revision-1.3.0.md)
- [Knowledge Executable Projection Operation Draft](../../specifications/engines/knowledge/ENGINE-0005-Knowledge-Engine-Executable-Projection-Operation.md)
- [Context Engine 5.0.1](../../specifications/engines/context/ENGINE-0003-Context-Engine-Revision-5.0.1.md)
- [OES-0008 — Documentation Standards](../engineering/OES-0008-Documentation-Standards.md)
- [OES-0010 — Versioning Standards](../engineering/OES-0010-Versioning-Standards.md)

# Change History

| Version | Date       | Description                                                                                                                                         |
| ------- | ---------- | --------------------------------------------------------------------------------------------------------------------------------------------------- |
| 0.1.0   | 2026-08-17 | Drafted Knowledge-owned preparation-cycle Source Currentness, accepted attribution, projection attribution, and single-capture issuance authority.  |
| 0.1.1   | 2026-08-17 | Corrected attribution to the existing closed Knowledge authoritative-capability semantic and removed the unsupported accepted-attribution identity. |
| 1.0.0   | 2026-08-17 | Approved architectural decision.                                                                                                                    |

# Engineering Motto

> Currentness follows governed source standing. Attribution stays opaque. One issuance has one authority.
