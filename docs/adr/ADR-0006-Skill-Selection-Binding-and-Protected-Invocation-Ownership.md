# ADR-0006 — Skill Selection, Binding, and Protected Invocation Ownership

| Field             | Value                 |
| ----------------- | --------------------- |
| **Status**        | Active                |
| **Version**       | 1.0.0                 |
| **Owner**         | Project Maintainers   |
| **Created**       | 2026-07-27            |
| **Updated**       | 2026-07-27            |
| **Decision Type** | Architecture Decision |

---

# Context

O.R.I.O.N. has accepted deterministic vertical slices for Reasoning, advisory
Planning, the Skill catalog, and Security authorization decisions.

The accepted runtime path can now produce:

- a completed Reasoning Outcome;
- an advisory Candidate Plan;
- a deterministic set of Registered Skills declaring an exact capability; and
- an immutable, operation-bound Authorization Decision Artifact.

It cannot yet select one Registered Skill, bind an intended action to that
Skill, enforce an `allow` decision at an invocation boundary, execute the
selected Skill workflow, or return a normalized Skill result.

The existing authorities establish parts of the eventual ownership model:

- Brain owns high-level cognitive orchestration;
- Planning owns advisory planning and does not execute;
- the Skill Engine owns the Skills capability, including Skill execution and
  result normalization;
- Skill packages own their declared business workflows;
- Security owns authorization policy and decision semantics;
- a protected boundary enforces a Security-owned decision without acquiring
  Security semantic ownership; and
- Core custodies shared cross-boundary Contracts without owning capability
  behavior.

The authorities do not yet assign the complete responsibility split for Skill
selection, binding, protected invocation, and execution handoff.

# Problem Statement

The platform must decide:

- who selects among multiple Registered Skills;
- who owns the selection policy;
- who creates an authoritative binding to one selected Skill;
- who allocates the Authorization Operation Identifier;
- when authorization occurs;
- which component is the protected invocation boundary;
- who enforces exact correspondence with an `allow` artifact;
- who owns invocation, execution, lifecycle, failures, and normalized results;
  and
- how Brain, Planning, Context, Skill, and Security collaborate without direct
  Engine implementation dependencies.

Without an explicit decision, a future implementation could incorrectly make
Planning executable, let Brain acquire Skill-domain policy, let a caller
manufacture a binding, make Security execute actions, or introduce an
unjustified Execution Engine.

# Decision

O.R.I.O.N. adopts a split Brain-orchestration and Skill-ownership model.

1. Brain or an equivalent protected orchestration boundary decides when an
   intended action requires a Skill capability.
2. Brain requests selection through a future Core-custodied Skill Selection
   Contract.
3. The Skill Engine owns deterministic selection policy among eligible
   Registered Skills and returns an authoritative Skill Binding.
4. Planning remains advisory and does not select, bind, authorize, invoke, or
   execute a Skill.
5. Protected orchestration allocates one Authorization Operation Identifier
   after obtaining the binding and before authorization evaluation.
6. Protected orchestration coordinates Security evaluation for the exact bound
   target.
7. A future Skill-owned Protected Invocation Contract is the protected
   invocation boundary.
8. That boundary fails closed unless it receives an exactly corresponding
   `allow` Authorization Decision Artifact.
9. The Skill Engine owns invocation-envelope validation, enforcement mechanics,
   invocation lifecycle semantics, execution handoff, failure normalization,
   and normalized Skill result semantics.
10. The selected Skill package owns its declared operation, Skill-specific input
    validation, and business workflow.
11. Brain consumes the normalized result through the Core-custodied Contract
    without acquiring Skill-domain semantics.
12. No separate Execution Engine is introduced.

This decision establishes ownership and responsibility only. Exact request,
binding, invocation, lifecycle, failure, and result schemas require a subsequent
Concept Specification.

# Ownership Table

| Concern                                    | Semantic owner          | Runtime responsibility                                |
| ------------------------------------------ | ----------------------- | ----------------------------------------------------- |
| Whether the cognitive flow needs a Skill   | Brain orchestration     | Brain or equivalent protected orchestration           |
| Candidate discovery                        | Skill Engine            | Skill Engine through the accepted discovery Contract  |
| Selection among Registered Skills          | Skill Engine            | Skill Engine through a future selection Contract      |
| Skill-selection policy                     | Skill Engine            | Skill Engine                                          |
| Skill Binding                              | Skill Engine            | Skill Engine creates and returns the governed binding |
| Advisory planning                          | Planning Engine         | Planning Engine                                       |
| Operation-identifier allocation            | Protected orchestration | Brain or equivalent allocating orchestration runtime  |
| Authorization policy and decision          | Security Engine         | Security Engine                                       |
| Authorization coordination                 | Brain orchestration     | Brain or equivalent protected orchestration           |
| Protected invocation enforcement mechanics | Skill Engine            | Skill-owned protected invocation boundary             |
| Skill operation and business workflow      | Selected Skill package  | Selected Skill package                                |
| Invocation-envelope validation             | Skill Engine            | Skill-owned protected invocation boundary             |
| Skill-specific input validation            | Selected Skill package  | Selected Skill package under the protected boundary   |
| Invocation lifecycle                       | Skill Engine            | Skill Engine                                          |
| Execution handoff                          | Skill Engine            | Skill Engine or a subordinate runtime mechanism       |
| Normalized Skill result                    | Skill Engine            | Skill Engine                                          |
| Skill execution failure normalization      | Skill Engine            | Skill Engine                                          |
| Final cognitive result assembly            | Brain orchestration     | Brain                                                 |
| Shared cross-boundary schema custody       | Core                    | Core custody only; no capability behavior             |

# Skill Selection

Brain owns the orchestration decision that a Skill capability is needed. It may
supply the intended capability and future approved selection inputs, but it
does not rank Registered Skills or define Skill-selection policy.

The Skill Engine owns selection among Registered Skills because selection
depends on Skill catalog eligibility, Registered Skill semantics, and
Skill-domain policy. A future selection operation is separate from the accepted
M7 discovery operation:

- discovery continues to return every exact capability match without ranking;
- selection consumes only inputs authorized by a later specification;
- the selection policy must be deterministic and explicit;
- an ordinary caller cannot designate a same-shaped object as a selected,
  governed Skill; and
- selection does not authorize or execute the Skill.

Selection-policy details such as preferences, version policy, health, cost,
location, or ranking criteria are not established by this ADR. The subsequent
Concept Specification must either define the minimal closed selection policy or
explicitly exclude those dimensions from the first slice.

# Skill Binding

The Skill Engine owns creation and validation of the authoritative Skill
Binding. Brain coordinates with the binding but cannot manufacture it.

At the ownership level, the binding identifies:

- the exact Registered Skill Identifier;
- the exact registered Skill Version; and
- the exact declared Skill Capability selected for invocation.

These are existing Skill-domain concepts required to distinguish the selected
catalog entry and operation declaration. This ADR does not define the public
binding shape, additional correspondence fields, or runtime bounds.

The binding must derive from current admitted Registered Skill state through the
Skill-owned boundary. A caller-provided Skill Identifier, version, capability,
manifest-shaped object, or TypeScript type assertion is not by itself an
authoritative binding.

# Planning Boundary

Accepted M6 Planning remains advisory.

Planning may describe an advisory response or need for more Context under its
current specification. It does not:

- select a Skill;
- rank discovery results;
- create a Skill Binding;
- allocate an authorization operation;
- construct invocation inputs;
- authorize;
- invoke; or
- execute.

Any future executable or Skill-bound Planning model requires a separately
reviewed revision to ENGINE-0007. This ADR neither requires nor authorizes that
revision for the minimal next path.

# Brain and Orchestration Boundary

Brain owns high-level cognitive sequencing and coordination. For the future
Skill path, Brain or equivalent protected orchestration:

1. determines that an intended action requires an exact Skill capability;
2. calls the future Skill Selection Contract;
3. receives an authoritative Skill Binding;
4. allocates the Authorization Operation Identifier;
5. prepares the capability-independent invocation proposal from already
   accepted orchestration inputs;
6. coordinates authorization evaluation for the bound action;
7. submits the binding, invocation proposal, and decision artifact to the
   protected Skill invocation boundary; and
8. receives the normalized Skill result for final cognitive-result assembly.

Brain does not own Skill selection policy, Skill-specific validation, Skill
workflow semantics, authorization semantics, enforcement semantics, or
normalized Skill result semantics.

The empty ENGINE-0001 placeholder remains non-authoritative. A future Brain
Engine specification must consume the Contracts authorized by this decision and
the subsequent Concept Specification; it must not redefine them.

# Authorization Operation Allocation and Timing

Protected orchestration owns Authorization Operation Identifier allocation,
consistent with CONCEPT-0004 and ENGINE-0009. Security validates syntax and
correspondence and does not allocate identifiers or maintain a reuse registry.

The minimal order is:

```text
determine required capability
  → select Registered Skill
  → establish authoritative Skill Binding
  → allocate Authorization Operation Identifier
  → construct the bound invocation proposal
  → obtain Security authorization decision
  → submit to protected invocation boundary
  → enforce exact allow correspondence
  → execute Skill workflow
  → normalize Skill result
  → return result to Brain
```

Authorization occurs after selection and binding because governed requirements
for a Skill-backed action derive from the admitted Registered Skill. It occurs
before any Skill-specific workflow execution or protected side effect.

Invocation construction before authorization is proposal construction only. It
must not load, initialize, call, or execute the Skill or produce a protected
side effect.

# Security and Enforcement Boundary

Security remains the sole owner of:

- authorization policy;
- governed evidence evaluation;
- decision categories and reasons; and
- Authorization Decision Artifact semantics.

Security returns the decision artifact and performs no invocation or
enforcement.

The Skill-owned Protected Invocation Contract boundary owns enforcement
mechanics for Skill invocation. Before execution it must:

- require `decision = "allow"`;
- reject absent, malformed, `deny`, or `indeterminate` artifacts;
- verify exact operation, subject, action, resource, requirements,
  sensitivity, Security-context summary, and policy correspondence required by
  CONCEPT-0004 and ENGINE-0009;
- reject cross-operation or reused evidence;
- avoid recomputing or reinterpreting Security policy; and
- preserve that authorization is not proof of execution or success.

After issuing the artifact, Security has no required role in the minimal
invocation call. A later separately authorized flow may request a new decision
for a new operation, but neither Brain nor Skill may refresh, reinterpret, or
extend an existing artifact.

# Invocation Inputs and Skill Validation

Protected orchestration constructs the capability-independent invocation
proposal from already accepted inputs and the authoritative Skill Binding. It
does not interpret or validate Skill-specific business meaning.

The Skill-owned protected boundary validates the cross-boundary invocation
envelope, binding provenance, operation correspondence, and authorization
evidence.

The selected Skill package owns validation of its declared operation-specific
inputs and the business meaning of those inputs. The Skill Engine governs how
that validation result crosses the invocation boundary and normalizes failures.

The later Concept Specification must define how manifest input declarations
relate to runtime values. Existing M7 input declarations are metadata only and
must not be treated as runtime schemas.

# Skill Execution and Runtime Mechanics

The Skill Engine owns Skill invocation and execution capability semantics. The
selected Skill package owns its business workflow.

The Skill Engine may invoke an admitted process-local Skill implementation
directly for the minimal slice or delegate non-semantic runtime mechanics
through a future Core-custodied Contract. A delegated runtime helper,
Infrastructure component, Provider, or Adapter:

- does not become a capability Engine;
- does not select the Skill;
- does not own invocation or workflow semantics;
- does not authorize the operation; and
- must not change the normalized result or failure meaning.

No separate Execution Engine is justified. Execution is not an independent
capability in the current architecture; it is runtime behavior of the Skills
capability. Introducing an Execution Engine later would require a new ADR that
demonstrates a distinct capability and lifecycle without taking ownership from
Skill.

# Result and Failure Ownership

The selected Skill package owns the semantic output of its declared operation.
The Skill Engine owns the stable normalized Skill result returned across the
platform boundary.

The Skill Engine also owns the public Skill invocation failure taxonomy and the
normalization of:

- invalid invocation input;
- invalid or unavailable binding;
- authorization enforcement failure;
- Skill-specific validation failure;
- Skill workflow failure;
- subordinate runtime failure; and
- invalid invocation lifecycle or constructed result.

Brain receives only the normalized result or normalized failure. It may use that
outcome in final cognitive-result assembly but must not reinterpret a Skill
failure as success or manufacture Skill output.

Exact result and failure vocabularies remain for the subsequent Concept
Specification.

# Invocation Lifecycle

The Skill Engine owns invocation lifecycle semantics and correspondence with its
Engine lifecycle. The selected Skill package participates only within an
admitted invocation.

The exact per-invocation states, valid transitions, atomicity rules, and
constructed-state validation are not defined here. They must be defined by the
subsequent Concept Specification before ENGINE-0010.

For the minimal deterministic process-local path:

- **timeout:** deferred; no timeout guarantee or timeout-triggered behavior;
- **cancellation:** deferred; no cancellation request or partial-cancellation
  state;
- **retry:** deferred; no automatic retry, backoff, or replay;
- **isolation:** infrastructure sandboxing is deferred, but failure containment
  and normalization at the Skill-owned boundary are mandatory.

Future invocation-level timeout, cancellation, retry, and isolation policy is
owned by the Skill Engine. Providers and Adapters may own subordinate technical
retry or timeout mechanics only behind their Contracts and without changing
Skill invocation semantics. Infrastructure may implement isolation mechanics
without acquiring Skill ownership.

# Context Boundary

Future Skill execution may consume only an immutable Context reference or
projection supplied through an approved Core-custodied Contract.

Protected orchestration obtains and supplies that prepared Context input. The
Skill Engine and Skill package must not source-depend on or directly call the
Context Engine implementation.

Context remains owner of Context facts and lifecycle. Skill invocation cannot
mutate an Active Context Revision or fabricate missing Context. The exact
Context reference/projection and freshness requirements belong to the
subsequent Concept Specification.

# Contract Custody

Core is expected to custody the future shared Contract categories:

- Skill Selection request and result;
- authoritative Skill Binding;
- Protected Skill Invocation request;
- normalized Skill execution result;
- Skill invocation failure vocabulary; and
- invocation lifecycle vocabulary where it crosses a boundary.

Core custody includes schema, compatibility, and version governance. The Skill
Engine remains the domain semantic owner. Brain is the caller and orchestration
owner. A runtime helper may implement subordinate mechanics without becoming
the semantic owner.

The subsequent Concept Specification must define exact Contract purposes,
inputs, outputs, guarantees, provenance, correspondence, failures, versions,
and implementation responsibilities according to OES-0004.

# Events, Providers, Adapters, and Persistence

The first process-local invocation and execution slice requires no Event
runtime. A successful synchronous normalized result is sufficient. A future
`SkillExecuted` Event may describe a completed fact only after its schema,
publication conditions, privacy, and failure behavior receive separate
approval.

The first slice requires no Provider, Adapter, database, filesystem, external
service, external IAM system, or persistence mechanism. A deterministic
process-local Skill fixture is architecturally valid.

Future Skills may call Core-custodied Contracts implemented by Providers or
Adapters. Those components retain their technical or integration ownership and
must not select Skills, authorize operations, or own Skill workflow semantics.

# Runtime Responsibility Flow

```text
Brain / protected orchestration
  → requests Skill selection through a Core-custodied Contract

Skill Engine
  → applies Skill-owned selection policy
  → returns an authoritative Skill Binding

Brain / protected orchestration
  → allocates the Authorization Operation Identifier
  → prepares the bound invocation proposal
  → coordinates Security evaluation

Security Engine
  → returns an Authorization Decision Artifact

Brain / protected orchestration
  → submits binding, proposal, and decision artifact

Skill-owned protected invocation boundary
  → validates binding and invocation correspondence
  → enforces exact matching allow evidence
  → invokes the selected Skill package

Selected Skill package
  → validates Skill-specific inputs
  → executes its business workflow

Skill Engine
  → normalizes result or failure
  → returns it through the Core-custodied Contract

Brain
  → consumes the normalized outcome for cognitive-result assembly
```

These arrows describe runtime interaction. Production source dependencies point
inward toward Core-custodied Contracts and never toward another Engine
implementation.

# FLOW-0001 Disposition

FLOW-0001 is lower authority than accepted Engine specifications and this ADR.
It is not modified by this decision.

A future separately reviewed alignment must change the flow so that:

- Planning produces advisory output and does not select required Skills;
- Brain determines when a Skill capability is needed and requests selection;
- Skill Engine discovery remains non-selecting;
- a separate Skill-owned selection operation chooses among eligible Registered
  Skills;
- Skill Engine does not “verify permissions” as authorization policy;
- protected orchestration allocates the operation and coordinates Security
  evaluation after binding;
- the Skill-owned protected invocation boundary enforces exact `allow`
  correspondence before execution;
- Skill Engine owns execution handoff and result normalization; and
- Brain assembles the final cognitive result from the normalized outcome.

The alignment must not imply direct Engine implementation dependencies.

# Alternatives Considered

## Planning-Owned Selection

Rejected for the current architecture.

Accepted M6 Planning is advisory and explicitly excludes Skill discovery,
selection, binding, invocation, and execution. Selection also depends on
Skill-domain catalog and eligibility semantics rather than advisory
decomposition.

## Brain-Owned Selection Policy

Rejected.

Brain decides when a capability is needed and coordinates the flow, but owning
candidate ranking would transfer Skill-domain behavior into orchestration.

## Skill-Owned Selection Without Brain Coordination

Rejected.

The Skill Engine must not decide independently whether the cognitive flow needs
a Skill or interpret Reasoning and Planning outcomes. Brain retains
orchestration responsibility.

## Split Brain/Skill Model

Accepted.

Brain requests and coordinates. Skill Engine owns selection policy, binding,
protected invocation, execution handoff, and normalized results.

## Separate Execution Engine

Rejected.

Current authority assigns Skill execution and result normalization to the Skill
Engine. Runtime mechanics do not constitute a separate domain capability by
themselves.

## Security-Owned Enforcement or Execution

Rejected.

Security owns policy and decisions. Making Security invoke or execute Skills
would contradict CONCEPT-0004 and ENGINE-0009 and would conflate decision
authority with enforcement mechanics.

## Direct Engine-to-Engine Invocation

Rejected.

It violates ADR-0001, ADR-0003, OES-0002, and OES-0004. Runtime collaboration
must occur through Core-custodied Contracts.

## Core-Owned Selection or Execution Behavior

Rejected.

Core custodies shared language and Contracts but does not own Skill capability
behavior.

## Core-Custodied Boundary Contracts

Accepted.

They preserve replaceability and inward dependency direction while leaving
Skill semantics with the Skill Engine and orchestration with Brain.

# Consequences

Positive:

- Planning remains advisory.
- Brain remains the cognitive coordinator without acquiring Skill semantics.
- Skill catalog discovery remains non-selecting.
- Skill Engine gains one coherent future path from selection through normalized
  result.
- Security remains the sole authorization decision owner.
- Enforcement occurs at the boundary closest to the protected Skill action.
- No unnecessary Execution Engine or infrastructure is introduced.
- Cross-boundary interactions remain technology-independent and testable.

Negative:

- A Skill selection and invocation domain model must be specified before
  implementation.
- Brain cannot be fully specified until it can consume the resulting Contracts.
- Selection and binding add explicit stages and validation boundaries.
- Future distributed execution may require another ADR.

# Compatibility with Accepted M0–M8

This decision is compatible with accepted milestones:

- **M0:** preserves Core Contract custody, explicit composition, and inward
  dependency direction.
- **M1:** does not change Identity or treat authentication as authorization.
- **M2:** preserves immutable Context ownership and avoids a Skill-to-Context
  implementation dependency.
- **M3:** adds no Memory ownership, access, or persistence behavior.
- **M4:** adds no Knowledge acceptance or mutation behavior.
- **M5:** leaves Reasoning Outcomes advisory and non-executing.
- **M6:** leaves Candidate Plans advisory and adds no Skill binding to
  ENGINE-0007.
- **M7:** leaves registration and discovery non-selecting; future selection and
  invocation require new Contracts and a new Engine specification.
- **M8:** preserves Security decision ownership, operation correspondence, and
  the distinction between `allow` and successful execution.

This ADR does not modify any accepted Engine or Concept Specification. Any
future change to Planning, Skill, Security, Brain, Context, or a Flow requires a
separate reviewed document change.

# Deferred Concerns

This decision does not define:

- exact selection, binding, invocation, result, failure, or lifecycle schemas;
- a configurable selection policy;
- executable Planning steps;
- Brain Engine request or final-result schemas;
- concrete Context execution projections;
- confirmation acquisition;
- Skill loading, installation, hot reload, or package transport;
- timeout, cancellation, retry, compensation, rollback, or progress;
- sandbox technology or distributed failure isolation;
- Events or audit persistence;
- Providers, Adapters, external integrations, or external IAM;
- databases, filesystems, queues, or networks;
- cryptographic artifact transport or distributed replay prevention; or
- distributed execution.

# Required Follow-Up Authority

Approval of this ADR does **not** directly make ENGINE-0010 safe to draft.

The next required authority is:

> **CONCEPT — Skill Invocation and Execution Model**

That Concept Specification must define, without changing this ownership
decision:

- exact selection request and deterministic minimal policy;
- authoritative Skill Binding semantics and provenance;
- protected invocation request and correspondence;
- invocation input model and relationship to M7 declarations;
- Context reference/projection requirements;
- authorization enforcement failures;
- invocation lifecycle and validation precedence;
- Skill-specific versus boundary validation;
- normalized result and failure vocabularies;
- synchronous process-local execution guarantees;
- failure containment;
- immutability, non-mutation, hostile-runtime safety, and privacy;
- exact bounds and deferred timeout, cancellation, retry, and isolation
  behavior; and
- Core Contract custody and implementation-testable authority boundaries.

Only after that Concept becomes Active may ENGINE-0010 define the implementation
vertical slice.

# Dependencies

- [Documentation Authority](../DOCUMENT-AUTHORITY.md)
- [Architecture](../architecture.md)
- [ADR-0001 — Core Ownership and Dependency Direction](ADR-0001-Core-Ownership-and-Dependency-Direction.md)
- [ADR-0002 — Capability-Oriented Architecture](ADR-0002-Capability-Oriented-Architecture.md)
- [ADR-0003 — Engine Communication Model](ADR-0003-Engine-Communication-Model.md)
- [ADR-0004 — Separation of Skills, Providers and Adapters](ADR-0004-Separation-of-Skills-Providers-and-Adapters.md)
- [OES-0002 — Engine Design](../engineering/OES-0002-Engine-Design.md)
- [OES-0003 — Skill Design](../engineering/OES-0003-Skill-Design.md)
- [OES-0004 — Contracts](../engineering/OES-0004-Contracts.md)
- [OES-0005 — Events](../engineering/OES-0005-Events.md)
- [OES-0009 — Security Standards](../engineering/OES-0009-Security-Standards.md)
- [CONCEPT-0004 — Authorization Model](../../specifications/concepts/CONCEPT-0004-Authorization-Model.md)
- [ENGINE-0007 — Planning Engine](../../specifications/engines/planning/ENGINE-0007-Planning-Engine.md)
- [ENGINE-0008 — Skill Engine](../../specifications/engines/skill/ENGINE-0008-Skill-Engine.md)
- [ENGINE-0009 — Security Engine](../../specifications/engines/security/ENGINE-0009-Security-Engine.md)
- [FLOW-0001 — Voice Interaction](../../specifications/flows/conversation/FLOW-0001-Voice-Interaction.md)

# Future Review

Review this decision before introducing distributed Skill execution, a generic
execution runtime shared by multiple capability domains, executable Planning,
or cross-runtime authorization artifact transport.

# Change History

| Version | Date       | Description                             |
| ------- | ---------- | --------------------------------------- |
| 0.1.0   | 2026-07-27 | Initial Draft for architectural review. |
| 1.0.0   | 2026-07-27 | Approved architectural decision.        |

# Engineering Motto

> Brain coordinates. Skill selects and executes. Security decides. The protected Skill boundary enforces.
