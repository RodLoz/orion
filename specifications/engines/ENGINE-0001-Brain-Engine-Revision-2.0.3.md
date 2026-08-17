# ENGINE-0001 — Brain Engine Correspondence Revision

| Field          | Value                                                               |
| -------------- | ------------------------------------------------------------------- |
| **Status**     | Active                                                              |
| **Supersedes** | 2.0.2                                                               |
| **Version**    | 2.0.3                                                               |
| **Owner**      | Project Maintainers                                                 |
| **Created**    | 2026-08-17                                                          |
| **Updated**    | 2026-08-17                                                          |
| **Applies To** | Brain prerequisite, lifecycle, and capability-output correspondence |

---

## Status and Authority

This specification is Active and is the sole current canonical ENGINE-0001
revision. It supersedes versions 1.0.0, 2.0.0, 2.0.1, and 2.0.2. Those
revisions remain historical and non-authoritative.

Planning Engine 2.0.0 and Reasoning Engine 2.0.0 remain Active. Planning Engine
2.1.0 and Reasoning Engine 3.0.0 are architecturally approved Drafts and remain
non-authoritative. This revision defines controlled future correspondence
with those Drafts without presenting them as Active or authorizing their use
before their applicable lifecycle and implementation prerequisites are met.

Applicable Active ADRs, Concepts, Engineering Standards, Contract
Specifications, and Engine Specifications govern in a conflict.

## Purpose

Brain Engine 2.0.3 is a specification-correspondence bridge. It permits the
Brain specification to remain semantically stable while the governed
Reasoning and Planning revisions transition from the current pair to their
approved successors.

This revision:

- corrects the current Context prerequisite from Context 4.0.0 to Active
  Context 5.0.0;
- preserves complete correspondence with Active Reasoning 2.0.0 and Planning
  2.0.0;
- recognizes the approved backward-compatible transition from Reasoning 2.0.0
  to Planning 2.1.0;
- defines future correspondence with Reasoning 3.0.0 and Planning 2.1.0;
- excludes Reasoning 3.0.0 with Planning 2.0.0; and
- preserves every Brain 2.0.2 orchestration, authority, branch, final-result,
  Skill, authorization, failure, privacy, and dependency semantic.

It introduces no runtime behavior, API, request field, result field,
orchestration stage, decision branch, source-evidence path, or implementation
mechanism.

## Version Classification

Version 2.0.3 is a PATCH revision under OES-0010. The change corrects and
extends specification correspondence without changing Brain behavior.

PATCH is valid because:

- Brain still obtains one authoritative Active Context Revision;
- Brain still invokes Reasoning and the Reasoning-owned authority verifier;
- Brain still supplies the exact verified Reasoning Outcome to Planning;
- Brain still invokes Planning and the Planning-owned authority verifier;
- Brain still branches only on the exact verified Candidate Plan;
- Candidate Plan categories remain `respond` and `request-more-context`;
- execution intent and Skill behavior remain independent and unchanged;
- Brain does not interpret any new Reasoning category; and
- Brain lifecycle, sequencing, precedence, failures, and final-result semantics
  remain those of Brain 2.0.2.

A need for Brain to inspect new Reasoning semantics, add a branch, or alter the
orchestration sequence would invalidate this PATCH classification. This revision
authorizes none of those changes.

## Brain 2.0.2 Semantic Preservation

Brain 2.0.3 incorporates Brain 2.0.2 semantics unchanged except for the
prerequisite and revision-correspondence corrections expressly stated here.

The existing governed cycle remains:

1. Brain receives one governed request.
2. Brain obtains one authoritative Active Context Revision.
3. Brain invokes Reasoning once.
4. Brain invokes the Reasoning-owned authority verifier.
5. Brain obtains the exact verified Reasoning Outcome.
6. Brain supplies that exact verified Outcome to Planning.
7. Brain invokes Planning once and obtains a Candidate Plan.
8. Brain invokes the Planning-owned authority verifier.
9. Brain obtains the exact verified Candidate Plan.
10. Brain selects only the existing Candidate Plan and execution-intent branch.
11. Brain coordinates the existing no-Skill or Skill path.
12. Brain constructs the existing governed final cognitive result.

No stage is added, removed, reordered, retried, or assigned to another owner.
The exact Brain 2.0.2 request, result, lifecycle, precedence, callback-count,
diagnostic, immutability, privacy, dependency, and failure semantics remain
unchanged.

## Context Correspondence

Context Engine 5.0.0 is the current Active Context prerequisite for Brain
2.0.3. It preserves the Get Active Context Revision and Verify Active Context
Revision Authority semantics consumed by Brain while revising Context-owned
Profile B preparation behind the authoritative Context boundary.

Brain continues to:

- request one authoritative Active Context Revision through the existing
  Context-owned Contract boundary;
- invoke the Context-owned authority verifier;
- preserve exact Context correspondence for the Reasoning request; and
- treat the verified Active Context Revision as the sole Context result for the
  cycle.

Brain does not select or inspect Context profiles, participate in Context
preparation, initiate source retrieval, inspect fragments, or acquire Context
authority. Context 5.0.0 correspondence changes no Brain behavior.

## Reasoning Compatibility

### Reasoning 2.0.0

Reasoning 2.0.0 remains fully supported with no semantic change. Brain invokes
the existing Reasoning operation, invokes the Reasoning-owned verifier, accepts
only the exact successful verifier return, and supplies that exact verified
Outcome to a compatible Planning revision.

Brain does not independently determine Reasoning validity, category meaning,
rule meaning, candidate-response meaning, or Context evidence correctness.

### Future Reasoning 3.0.0

Reasoning 3.0.0 is an approved Draft and remains non-authoritative. If it later
becomes Active after its implementation and conformance prerequisites are met,
Brain 2.0.3 may invoke it through the same governed Reasoning operation and
authority-verification sequence and may supply its exact verified Outcome only
to compatible Planning 2.1.0.

Brain must not inspect or branch on whether the Reasoning Outcome denotes:

- bounded Knowledge-grounded success;
- exact-query non-applicability; or
- applicable but insufficient evidence.

Brain also must not evaluate Identity eligibility, exact-query applicability,
evidence sufficiency, proposition semantics, currentness, or any source
correspondence. Those semantics remain owned by Reasoning and are mapped by
Planning before Brain selects a branch.

## Planning Compatibility

### Planning 2.0.0

Planning 2.0.0 remains fully supported with Reasoning 2.0.0. Brain supplies the
exact verified Reasoning Outcome, invokes Planning, invokes the Planning-owned
authority verifier, accepts only the exact verified Candidate Plan, and
branches under the existing Brain 2.0.2 rules.

### Future Planning 2.1.0

Planning 2.1.0 is an architecturally approved Draft and remains
non-authoritative. It preserves every Planning 2.0.0 mapping accepted for
Reasoning 2.0.0 and preserves the same Brain-facing Candidate Plan categories,
steps, advisory semantics, and exact candidate-response handling.

If Planning 2.1.0 later becomes Active, Brain may use it with Reasoning 2.0.0
without changing Brain behavior. If Reasoning 3.0.0 later becomes Active,
Brain may use Planning 2.1.0 as the governed source-opaque mapping boundary for
the new Reasoning Outcomes.

Brain does not know which Reasoning category produced the Candidate Plan and
does not validate Planning's internal category mapping.

## Closed Compatibility Combinations

Brain 2.0.3 defines exactly three supported specification combinations:

| Combination    | Reasoning revision | Planning revision | Status and condition                                                                                                        |
| -------------- | ------------------ | ----------------- | --------------------------------------------------------------------------------------------------------------------------- |
| A — current    | 2.0.0              | 2.0.0             | Supported while both revisions remain Active                                                                                |
| B — transition | 2.0.0              | 2.1.0             | Supported after Planning 2.1.0 becomes Active                                                                               |
| C — future     | 3.0.0              | 2.1.0             | Supported only after both revisions become Active and applicable implementation and conformance prerequisites are satisfied |

The following combination is explicitly unsupported:

| Combination | Reasoning revision | Planning revision | Reason                                                                                  |
| ----------- | ------------------ | ----------------- | --------------------------------------------------------------------------------------- |
| D — invalid | 3.0.0              | 2.0.0             | Planning 2.0.0 does not accept Reasoning 3.0.0's expanded closed Outcome correspondence |

No other Reasoning and Planning revision combination is authorized. A future
revision requires an explicit compatibility assessment and, where applicable,
a later Brain specification revision.

This closed set does not establish Semantic Version range matching, arbitrary
mix-and-match compatibility, latest-version lookup, dynamic negotiation, a
version registry, or a plugin compatibility mechanism.

## Compatibility Validation Ownership

Brain owns the orchestration requirement that the capability specifications
composed for its cycle belong to one supported combination. This is a closed
specification-correspondence invariant, not a new cognitive decision or a
runtime negotiation protocol.

Bootstrap remains responsible for composing implementations that conform to
an allowed combination. Core remains the custodian of shared Contract
language. Neither Bootstrap nor Core acquires Brain orchestration semantics.

Brain does not receive revision identifiers in its cognitive request, select a
revision, discover a latest revision, negotiate versions, or maintain a
runtime compatibility registry. Concrete composition and conformance
mechanisms remain deferred.

An unsupported composition cannot become valid because its individual outputs
are structurally familiar. Brain may own the orchestration consequence of an
unusable configured capability relationship without acquiring the originating
Engine's semantic or failure ownership.

## Reasoning Authority Boundary

Reasoning remains the issuer and authority verifier of each Reasoning Outcome.
Brain invokes the Reasoning-owned verifier with its exact issuer-owned
expectations and accepts only the exact successful return as verified.

Brain supplies that exact verified Outcome to Planning. Planning never
receives an unverified Reasoning Outcome as valid input. Brain does not issue,
register, reconstruct, substitute, or independently verify a Reasoning Outcome
and does not become the Reasoning authority owner.

A Reasoning authority-verification failure remains Reasoning-owned. Brain owns
only the existing orchestration consequence at the Reasoning stage.

## Planning Authority Boundary

Planning remains the issuer and authority verifier of each Candidate Plan.
Brain invokes the Planning-owned verifier with the exact consumed verified
Reasoning Outcome and the existing Planning-owned correspondence expectations.
Brain accepts only the exact successful Candidate Plan return for branching.

Brain does not issue, register, reconstruct, substitute, independently verify,
or acquire semantic ownership of a Candidate Plan. A Planning
authority-verification failure remains Planning-owned. Brain owns only the
existing orchestration consequence at the Planning stage.

## Exact Correspondence

Every cycle preserves the existing exact chain:

```text
exact authoritative Active Context Revision
  → exact Reasoning request
  → exact verified Reasoning Outcome
  → exact Planning request using that same Outcome
  → exact verified Candidate Plan issued for that request
  → Brain branch using that same Plan
```

A clone, reconstruction, substituted Outcome, substituted Plan, replaced
nested value, or merely structurally equivalent graph does not acquire
authority or exact correspondence. This specification defines no object
identity, registry, persistence, or cross-runtime implementation mechanism.

## Candidate Plan Branching

Brain branches only on the Planning-owned Candidate Plan and the existing
independent execution intent.

| Candidate Plan                            | Existing Brain consequence                                                                |
| ----------------------------------------- | ----------------------------------------------------------------------------------------- |
| `request-more-context`                    | Existing no-Skill `request-more-context` final-result path regardless of execution intent |
| `respond` with no Skill capability intent | Existing no-Skill `response` final-result path containing the exact Candidate Response    |
| `respond` with Skill capability intent    | Existing Skill coordination path                                                          |

Brain does not branch on a Reasoning category. No Knowledge-grounded,
non-applicable, insufficient-evidence, Profile B, Knowledge, or Memory branch
is introduced.

## Response Semantics

Planning supplies the verified advisory `respond` Candidate Plan and preserves
the exact Reasoning candidate response in its `respond` step. Brain preserves
its existing final cognitive-result assembly responsibility and copies the
exact Candidate Response only as already governed by Brain 2.0.2.

Brain does not generate Knowledge semantics, inspect a proposition, determine
applicability or sufficiency, establish Knowledge truth, reinterpret the
Reasoning result, or acquire evidence ownership. Final transport,
presentation, and delivery remain outside Brain.

## Source Opacity

Brain remains fully source-opaque. Brain must not receive, inspect, select,
transform, reason over, or independently preserve as evidence:

- Context source fragments or profile structure;
- Knowledge proposition content or identity;
- Knowledge identity or version;
- Knowledge or underlying-source issuer correspondence;
- underlying-source authority;
- Source Currentness or Contextual Currentness;
- exact-query applicability or evidence sufficiency;
- Memory semantics or Memory fragments; or
- provenance or source metadata.

Brain consumes authoritative capability outputs. It does not consume an
independent source-evidence boundary. A Candidate Plan category does not reveal
or transfer the source semantics behind Reasoning.

## Skill Separation

The existing execution-intent boundary remains unchanged. A `respond`
Candidate Plan does not create Skill intent, select a Skill, invoke a Skill,
authorize a protected action, or require execution.

The Skill path remains gated only by the existing conjunction of a verified
`respond` Candidate Plan and independently supplied governed Skill capability
intent. Planning does not create that intent, and a future Knowledge-grounded
Reasoning Outcome does not imply it.

## Authorization

Security retains authorization semantics and decisions. The applicable
protected Skill boundary retains enforcement responsibility.

None of the following establishes authorization:

- a verified Reasoning Outcome;
- a verified Candidate Plan;
- a `respond` Candidate Plan;
- authenticated Identity;
- Knowledge-grounded upstream Reasoning;
- Context authority;
- Brain authority; or
- membership in a supported revision combination.

Authority verification, specification compatibility, orchestration success,
and advisory Planning remain distinct from Security authorization.

## Failure Ownership

Failure ownership continues to follow the responsibility that failed.

Reasoning retains Reasoning failures. Planning retains Planning failures.
Context retains Context failures. Knowledge and underlying sources retain
their failures. Security and Skill retain their respective failures. Bootstrap,
Provider, Adapter, transport, and infrastructure failures retain their
originating ownership.

Brain owns only existing Brain and orchestration consequences, including:

- inability to obtain a required governed capability output;
- inability to continue after an issuer-owned verifier failure;
- inability to use an unsupported composed Reasoning and Planning
  specification combination; and
- invalid correspondence between an exact verified Candidate Plan and Brain's
  existing closed branch rules.

Brain normalization or propagation does not translate, replace, or acquire an
originating failure. This PATCH introduces no new concrete failure class or
failure branch.

## Dual-Compatible Lifecycle

Brain 2.0.3 supports the following controlled specification lifecycle:

### Phase 1 — Current Pair

- Brain 2.0.3 Active;
- Context 5.0.0 Active;
- Reasoning 2.0.0 Active; and
- Planning 2.0.0 Active.

### Phase 2 — Planning Transition

- Brain 2.0.3 Active;
- Context 5.0.0 Active;
- Reasoning 2.0.0 Active; and
- Planning 2.1.0 Active.

### Phase 3 — Future Pair

- Brain 2.0.3 Active;
- Context 5.0.0 Active;
- Reasoning 3.0.0 Active; and
- Planning 2.1.0 Active.

Phase 3 is only specification correspondence. It does not claim that Reasoning
3.0.0 implementation, Core language, conformance, Bootstrap composition, or
production reachability is ready.

Reasoning 3.0.0 with Planning 2.0.0 is not a permitted phase. No phase changes
Brain orchestration semantics.

## Planning Activation Dependency

If Brain 2.0.3 becomes Active before or atomically with Planning 2.1.0, its
closed support for Reasoning 2.0.0 with Planning 2.1.0 resolves the Brain
specification-correspondence blocker to Planning 2.1.0 activation.

This conclusion concerns specification lifecycle only. It does not claim that
Planning implementation, Core, Bootstrap, tests, conformance, or release work
is complete.

## Reasoning Activation Dependency

If Brain 2.0.3 and Planning 2.1.0 are Active, the downstream Brain and Planning
specification-correspondence prerequisite for later Reasoning 3.0.0 activation
is satisfied.

Reasoning 3.0.0 must nevertheless remain deferred until its own implementation,
Core, conformance, testing, composition, review, and lifecycle prerequisites
are completed. This specification does not activate or establish runtime readiness for
Reasoning 3.0.0.

## Production Reachability

Brain 2.0.3 defines semantic correspondence, not production Profile B
reachability. It introduces no:

- production Profile B preparation;
- Context profile-selection API;
- caller or profile-selection policy;
- Bootstrap selection policy;
- Knowledge retrieval;
- source-aware orchestration; or
- claim that a Knowledge-aware production response path is reachable.

## CONTRACT-0001 Correspondence

`CONTRACT_0001_SUFFICIENT`.

Brain remains outside CONTRACT-0001. That Contract ends at candidate material
being available for Context consideration and does not govern Brain
orchestration, Reasoning-to-Planning correspondence, Candidate Plan branching,
or final cognitive-result assembly.

Brain introduces no source retrieval collaboration, changes no Contract
boundary, and requires no CONTRACT-0002.

## Execution-Model Neutrality

This specification defines lifecycle and specification correspondence only. It
does not prescribe TypeScript, concrete version unions, runtime registries,
maps, switch statements, request fields, APIs, dependency injection, Bootstrap
wiring, dynamic dependency resolution, serialization, transport, persistence,
deployment, provider selection, or concrete error classes.

## Deferred Implementation Scope

The following remain deferred:

- runtime implementation changes, if later conformance review finds any
  correspondence representation is required;
- Core executable language;
- Bootstrap composition changes;
- Planning 2.1.0 implementation and conformance;
- Reasoning 3.0.0 implementation and conformance;
- production Profile B reachability;
- caller and profile-selection policy;
- diagnostics and observability changes;
- tests and conformance matrices;
- activation and release execution;
- persistence, transport, deployment, and distributed authority; and
- any future revision beyond the three closed supported combinations.

No deferred item is implied to be implemented, approved, released, or Active
by this specification.

## Acceptance Criteria

ENGINE-0001 2.0.3 may be activated only when review establishes that:

1. every Brain 2.0.2 orchestration and branch semantic remains unchanged;
2. Context 5.0.0 is the current authoritative Context prerequisite;
3. the three supported Reasoning and Planning combinations are closed and
   lifecycle-correct;
4. Reasoning 3.0.0 with Planning 2.0.0 remains unsupported;
5. Brain never inspects or branches on a Reasoning category;
6. Brain branches only on the exact verified Candidate Plan and existing
   execution intent;
7. Reasoning and Planning retain issuance and authority-verification ownership;
8. source opacity, authorization independence, Skill separation, failure-origin
   preservation, and exact correspondence remain intact;
9. no runtime negotiation, registry, API, orchestration phase, or new failure
   class is introduced; and
10. CONTRACT-0001 remains unchanged and no CONTRACT-0002 is introduced.

## Compatibility

Brain 2.0.3 is semantically compatible with Brain 2.0.2. It corrects current
Context correspondence and adds controlled successor correspondence without
changing the Brain request, orchestration, Candidate Plan branches, execution
intent, Skill path, final results, authority boundaries, or failure semantics.

Future Planning 2.1.0 and Reasoning 3.0.0 compatibility remains conditional on
their Active lifecycle status and applicable implementation and conformance
readiness. Draft status alone never authorizes runtime composition.

## Change History

| Version | Date       | Description                                                                                                                                                                       |
| ------- | ---------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1.0.0   | 2026-07-29 | Established the Brain orchestration foundation and final cognitive result boundary.                                                                                               |
| 2.0.0   | 2026-08-10 | Aligned Brain orchestration with the authoritative Context-to-Reasoning and exact Reasoning-to-Planning boundaries.                                                               |
| 2.0.1   | 2026-08-11 | Aligned prerequisite and reference correspondence with Active Context 3.0.0, Reasoning 2.0.0, and Planning 2.0.0 revisions and removed the stale implementation-status statement. |
| 2.0.2   | 2026-08-11 | Aligned prerequisite and reference correspondence with Active Context Engine 4.0.0; no Brain runtime semantics changed.                                                           |
| 2.0.3   | 2026-08-17 | Drafted Context 5.0.0 correspondence and the closed Reasoning and Planning lifecycle bridge without changing Brain semantics.                                                     |

## References

- [Documentation Authority](../../docs/DOCUMENT-AUTHORITY.md)
- [OES-0002 — Engine Design](../../docs/engineering/OES-0002-Engine-Design.md)
- [OES-0004 — Contracts](../../docs/engineering/OES-0004-Contracts.md)
- [OES-0008 — Documentation Standards](../../docs/engineering/OES-0008-Documentation-Standards.md)
- [OES-0009 — Security Standards](../../docs/engineering/OES-0009-Security-Standards.md)
- [OES-0010 — Versioning Standards](../../docs/engineering/OES-0010-Versioning-Standards.md)
- [ADR-0007 — Brain Orchestration Ownership and Planning Binding](../../docs/adr/ADR-0007-Brain-Orchestration-Ownership-and-Planning-Binding.md)
- [ADR-0012 — Authorization Independence](../../docs/adr/ADR-0012-Authorization-Semantics-Enforcement-and-Authorized-Reference-Applicability.md)
- [ADR-0013 — Failure Ownership](../../docs/adr/ADR-0013-Failure-Ownership-Propagation-and-Candidate-Context-Revision-Consequences.md)
- [ADR-0014 — Bootstrap Composition](../../docs/adr/ADR-0014-Bootstrap-Composition-Responsibility-and-Ownership-and-Authority-Preservation.md)
- [ADR-0015 — Brain Orchestration and Final Result](../../docs/adr/ADR-0015-Brain-Cognitive-Reference-Orchestration-and-Final-Cognitive-Result-Boundaries.md)
- [ADR-0017 — Execution-Model Independence](../../docs/adr/ADR-0017-Execution-Model-Independence-for-Asynchronous-Event-Driven-and-Distributed-Collaboration.md)
- [ADR-0020 — Knowledge Evidence Boundary for Source-Aware Reasoning](../../docs/adr/ADR-0020-Knowledge-Evidence-Boundary-for-Source-Aware-Reasoning.md)
- [CONTRACT-0001 — Context Source Retrieval](../../docs/contracts/CONTRACT-0001-Context-Source-Retrieval.md)
- [CONCEPT-0004 — Authorization Model](../concepts/CONCEPT-0004-Authorization-Model.md)
- [CONCEPT-0005 — Skill Invocation and Execution Model](../concepts/CONCEPT-0005-Skill-Invocation-and-Execution-Model.md)
- [CONCEPT-0006 — Brain Orchestration Model](../concepts/CONCEPT-0006-Brain-Orchestration-Model.md)
- [Brain Engine 2.0.2](ENGINE-0001-Brain-Engine.md)
- [Context Engine 5.0.0](context/ENGINE-0003-Context-Engine-Revision-5.0.0.md)
- [Reasoning Engine 2.0.0](reasoning/ENGINE-0006-Reasoning-Engine-Revision-2.0.0.md)
- [Reasoning Engine 3.0.0 Draft](reasoning/ENGINE-0006-Reasoning-Engine-Revision-3.0.0.md)
- [Planning Engine 2.0.0](planning/ENGINE-0007-Planning-Engine-Revision-2.0.0.md)
- [Planning Engine 2.1.0 Draft](planning/ENGINE-0007-Planning-Engine-Revision-2.1.0.md)
- [Knowledge Engine 1.2.0](knowledge/ENGINE-0005-Knowledge-Engine-Revision-1.2.0.md)
