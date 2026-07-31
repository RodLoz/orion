# ADR-0007 — Brain Orchestration Ownership and Planning Binding

| Field             | Value                 |
| ----------------- | --------------------- |
| **Status**        | Active                |
| **Version**       | 1.0.0                 |
| **Owner**         | Project Maintainers   |
| **Created**       | 2026-07-29            |
| **Updated**       | 2026-07-29            |
| **Decision Type** | Architecture Decision |

---

# Context

M0–M9 provide process-local capabilities for Identity, Context, Memory,
Knowledge, Reasoning, advisory Planning, Skill catalog and execution, and
Security authorization. No accepted capability yet owns the complete
high-level sequence that consumes these Contracts and assembles one final
cognitive result.

ADR-0006 establishes that Brain owns high-level orchestration, Skill owns
selection, binding, protected invocation, execution, and normalized results,
and Security owns authorization decisions. Accepted M6 Planning remains
advisory and exposes only `respond` and `request-more-context`.

# Problem

M10 must decide:

- what Brain owns and delegates;
- how advisory Planning affects orchestration without becoming execution
  authority;
- whether every successful flow invokes a Skill;
- where Skill capability intent originates;
- who allocates an Authorization Operation Identifier;
- how one final cognitive result is constructed; and
- whether another Execution Engine is necessary.

# Decision

O.R.I.O.N. adopts a bounded Brain-owned orchestration model for M10.

1. Brain owns high-level sequencing, orchestration lifecycle, stage
   precedence, orchestration-level failure normalization, and final cognitive
   result construction.
2. Brain coordinates capabilities only through Core-custodied public
   Contracts. It MUST NOT import another Engine implementation.
3. A normalized Brain request supplies one bounded query, one Context Lineage
   Identity, and either no Skill capability intent or one exact M7 Skill
   Capability Identifier.
4. Skill capability intent is accepted orchestration input. Planning does not
   create, select, transform, authorize, or validate it.
5. Brain resolves one Active Context Revision, requests Reasoning, and requests
   Planning in that order.
6. Brain invokes the Reasoning-owned and Planning-owned authority verifiers
   with their exact issuer-owned expectations and accepts each exact successful
   verifier return as authoritative. Brain then enforces only Brain-owned
   orchestration and branch correspondence.
7. `request-more-context` always terminates successfully with a no-Skill
   `request-more-context` final result. Brain MUST NOT select or invoke a Skill
   on that branch.
8. `respond` with no requested Skill capability terminates successfully with a
   no-Skill `response` final result containing the exact Candidate Response.
9. `respond` with a requested Skill capability enters the Skill branch. Brain
   requests Skill selection; Skill Engine alone ranks and selects.
10. Brain allocates exactly one Authorization Operation Identifier after
    receiving an authoritative Skill Binding and before binding that Skill to
    the operation. It MUST NOT accept a caller-supplied operation identifier.
11. Brain coordinates binding, governed authorization, and protected
    invocation through M9 Contracts. Skill and Security retain their existing
    semantics and authority.
12. Brain constructs one immutable final result. It may include the exact
    normalized Skill result but MUST NOT reinterpret a Skill business failure
    as success or failure of orchestration.
13. No separate Execution Engine is introduced.
14. M10 is synchronous, process-local, deterministic, non-persistent, and
    retry-free.
15. Context Engine, Reasoning Engine, and Planning Engine each remain the sole
    issuer and verifier of their own authoritative returned values. M10
    consumes their Active issuer-owned verifier Contracts; Bootstrap may
    compose those Contracts but MUST NOT mint, wrap, register, or simulate
    capability authority.

# Planning Binding

The Candidate Plan is advisory evidence about the Reasoning Outcome. It is not
an executable plan and is not authorization.

Brain MAY:

- invoke the Planning-owned verifier with the exact issuer-owned expectations
  for the Candidate Plan;
- accept the exact successful verifier return as authoritative;
- decline the Skill branch when the plan is `request-more-context`; and
- choose the deterministic branch defined by this ADR.

Brain MUST NOT:

- independently validate Planning source, explainability, Reasoning-derived,
  category, or step semantics;
- change a Candidate Plan;
- replace or append a step;
- treat `respond` as authorization;
- derive a Skill identifier, capability, action, resource, permission, or input
  from plan text;
- ask Planning to rank or select a Skill; or
- execute the plan as a command.

The Skill requirement is derived solely from the conjunction:

```text
Candidate Plan category = respond
AND normalized Brain request contains requestedSkillCapability
```

The request field names an M7 capability, not a Skill. The Skill Engine decides
whether an invocation-eligible Skill exists. An unavailable selection is an
orchestration failure, not permission for Brain to choose a Skill itself.

# Operation Identifier Ownership

Brain is the protected orchestration boundary for M10 and therefore owns
operation allocation under ADR-0006.

The concrete allocation mechanism is supplied through a Core-custodied,
technology-neutral `Allocate Authorization Operation Identifier` port. Brain
captures that port at construction and invokes it once only on the Skill
branch, after authoritative selection and before binding. The allocator does
not acquire orchestration, Skill, or Security semantics.

No operation identifier exists on either no-Skill result. A caller cannot
choose, reuse, or replace the operation identifier.

# Cross-Capability Authority

During initial M10 drafting, issuer-owned authority verifier Contracts for the
Get Active Context Revision, Evaluate Reasoning, and Create Candidate Plan
results were absent. They were subsequently introduced and activated through
ENGINE-0003 1.1.0, ENGINE-0006 1.1.0, and ENGINE-0007 1.1.0.

The following Active prerequisites are satisfied and M10 consumes them:

- Context-owned `Verify Active Context Revision Authority` 1.0.0;
- Reasoning-owned `Verify Reasoning Outcome Authority` 1.0.0; and
- Planning-owned `Verify Candidate Plan Authority` 1.0.0.

Each issuing Engine registers only the exact value it successfully returns.
Each verifier proves same-Engine-runtime object identity and exact expected
correspondence and returns that exact value. A clone, public-factory value,
cross-runtime value, or value with replaced nested data throws the issuing
Engine's closed authority-verification failure. Verifiers mint no authority
and never convert caller values.

Bootstrap may capture and compose the issuer-owned Contract implementations. It
MUST NOT maintain the authority registry, issue an authoritative wrapper, or
substitute adapter identity for Engine identity.

These additions are authorized by the Active ENGINE-0003 1.1.0, ENGINE-0006
1.1.0, and ENGINE-0007 1.1.0 revisions. ADR-0007, CONCEPT-0006, and ENGINE-0001
now form the Active M10 specification set. M10 implementation has not started.

# Final Cognitive Result Ownership

Brain owns only the final cognitive-result envelope and branch meaning:

- `response` — the exact Planning-owned Candidate Response is ready for an
  outer presentation boundary;
- `request-more-context` — the cognitive cycle completed without execution and
  requests a future, separately initiated Context cycle; or
- `skill-result` — M9 protected invocation returned one exact normalized Skill
  result.

Brain does not own or reinterpret the nested Reasoning, Planning, Skill, or
Security semantics. Final transport and presentation remain outside Brain.
For `skill-result`, the outer envelope embeds the exact verified immutable
Skill-issued normalized result object. Brain MUST NOT clone, reconstruct,
spread, deserialize, rebuild, or replace that object or any nested value.
Skill retains semantic and authority ownership of it. Brain registers the outer
envelope together with that exact nested identity so a structurally identical
Skill-result clone cannot satisfy final-result verification.

# Ownership Table

| Concern                                                 | Semantic owner         |
| ------------------------------------------------------- | ---------------------- |
| Normalized Brain request and final result               | Brain                  |
| High-level sequence, branch, lifecycle, precedence      | Brain                  |
| Context Revision semantics and current Active state     | Context                |
| Reasoning Outcome                                       | Reasoning              |
| Candidate Plan and advisory semantics                   | Planning               |
| Skill admission, selection, binding, invocation, result | Skill                  |
| Authorization evaluation and Outcome                    | Security               |
| Skill workflow                                          | Selected Skill package |
| Shared Contract schema custody                          | Core                   |
| Composition                                             | Bootstrap              |
| Transport, presentation, persistence                    | Outside M10            |

# Consequences

## Positive

- M10 closes the first end-to-end cognitive coordination gap.
- Planning remains advisory.
- Skill and Security authority cannot migrate into Brain.
- Both action-free and Skill-backed cognitive cycles are explicit.
- Existing M0–M9 Contracts are reused without direct Engine coupling.

## Constraints

- M10 does not infer Skill capability from natural-language text.
- The first slice cannot retrieve Memory or Knowledge references.
- `request-more-context` does not automatically compose another Context
  Revision.
- A Skill business failure remains a valid normalized Skill result inside a
  completed orchestration.

# Rejected Alternatives

## Every successful flow invokes a Skill

Rejected because M6 explicitly permits `request-more-context` and `respond`,
neither of which requires execution.

## Planning selects or binds a Skill

Rejected because it would contradict M6 and ADR-0006.

## Brain selects a concrete Skill

Rejected because selection policy belongs to Skill Engine.

## Caller supplies the authorization operation

Rejected because ADR-0006 assigns allocation to protected orchestration after
binding.

## Separate Execution Engine

Rejected because M9 already assigns execution semantics to Skill Engine and no
independent capability is demonstrated.

# Compatibility

This decision preserves:

- M0 Core custody and explicit composition;
- M1 Identity truth ownership;
- M2 Context lifecycle and immutability;
- M3 Memory ownership and intentional retention;
- M4 Knowledge acceptance ownership;
- M5 Reasoning semantics and advisory output;
- M6 advisory Planning;
- M7 Skill catalog semantics;
- M8 Security decision ownership; and
- M9 Skill selection, binding, protected invocation, and result semantics.

# Explicitly Deferred

- persistence and audit history;
- Providers, Adapters, transports, clients, and voice;
- Events and asynchronous execution;
- retries, timeout, cancellation, compensation, and replay;
- distributed authority;
- sandboxing and plugins;
- configurable selection or Security policy;
- executable Planning and multi-step workflows;
- Context refresh loops;
- Memory and Knowledge retrieval; and
- a separate Execution Engine.

# Active Authority Set

The implementation-authorizing specification set is:

1. CONCEPT-0006 defines the shared Brain request, final result, lifecycle,
   provenance, and failure semantics.
2. ENGINE-0001 defines the exact M10 operational vertical slice and
   implementation-testable precedence.
3. ENGINE-0003 1.1.0 is Active and defines
   `Verify Active Context Revision Authority`.
4. ENGINE-0006 1.1.0 is Active and defines
   `Verify Reasoning Outcome Authority`.
5. ENGINE-0007 1.1.0 is Active and defines
   `Verify Candidate Plan Authority`.
6. This ADR, CONCEPT-0006, and ENGINE-0001 are Active.

The accepted M10 operational model contains exactly 57 atomic precedence rows
and 61 row-local lifecycle rows. These are Engine-level
testability details, not new architectural ownership.

# References

- [Documentation Authority](../DOCUMENT-AUTHORITY.md)
- [Architecture](../architecture.md)
- [ADR-0006 — Skill Selection, Binding, and Protected Invocation Ownership](ADR-0006-Skill-Selection-Binding-and-Protected-Invocation-Ownership.md)
- [CONCEPT-0005 — Skill Invocation and Execution Model](../../specifications/concepts/CONCEPT-0005-Skill-Invocation-and-Execution-Model.md)
- [ENGINE-0007 — Planning Engine 1.1.0](../../specifications/engines/planning/ENGINE-0007-Planning-Engine-Authority-Revision-1.1.0.md)
- [ENGINE-0010 — Protected Skill Invocation](../../specifications/engines/skill/ENGINE-0010-Skill-Engine-Protected-Invocation-and-Execution.md)

# Open Questions

No implementation-critical ownership question remains. The M10 specification
set is Active and ready for implementation planning.

The Active prerequisite revisions are:

- [ENGINE-0003 Context Authority Revision 1.1.0](../../specifications/engines/context/ENGINE-0003-Context-Engine-Authority-Revision-1.1.0.md);
- [ENGINE-0006 Reasoning Authority Revision 1.1.0](../../specifications/engines/reasoning/ENGINE-0006-Reasoning-Engine-Authority-Revision-1.1.0.md); and
- [ENGINE-0007 Planning Authority Revision 1.1.0](../../specifications/engines/planning/ENGINE-0007-Planning-Engine-Authority-Revision-1.1.0.md).
