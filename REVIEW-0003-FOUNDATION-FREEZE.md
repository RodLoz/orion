# REVIEW-0003 — Foundation Freeze Review

## 1. Executive Summary

The current O.R.I.O.N. Foundation has a coherent architectural direction, but it is not yet stable enough to freeze as the implementation baseline.

The independent review verified that the canonical Memory/Knowledge/Context partition, Knowledge Engine authority, Context lineage and revision model, Contract-custody distinction, inward dependency rule, and Brain/Reasoning separation are clearly expressed in several current documents. These are substantive improvements and do not require redesign.

However, current correctness cannot be established from summaries or REVIEW-0002 resolution notes alone. The operative repository still contains six HIGH findings:

- detailed Context lineage, lifecycle, reconstruction, replay, and retention semantics exist only in a Draft Concept Model and therefore are non-authoritative under `DOCUMENT-AUTHORITY.md`;
- ADR-0004 still labels runtime interaction chains as dependency direction and visually makes Contracts depend outward on Adapters and Providers;
- the Active Voice Interaction Flow activates Context before Memory retrieval, leaving no defined immutable Context Revision that contains the retrieved Memory consumed by Reasoning;
- Core-owned Models and capability-specific Policies are said to contain business rules and decisions while Engines are separately declared the exclusive owners of capability behavior and domain semantics;
- ADR-0003 assigns Security enforcement to the Security Engine while the Active Security standard assigns enforcement to invocation boundaries and consuming components;
- ADR-0001 assigns Event publication to Engines while Active Event and Adapter standards authorize Adapter-owned integration Events.

No BLOCKER finding was identified. The required corrections clarify authority, ownership, and flow semantics already present in the Foundation; they do not require a new architecture. They are nevertheless material enough that freezing now would preserve competing implementation instructions.

## 2. Review Scope

The review examined the current repository state across:

- `README.md`, `MANIFESTO.md`, `docs/vision.md`, and `ORION-HANDOFF.md`;
- `docs/DOCUMENT-AUTHORITY.md`, `docs/architecture.md`, `docs/principles.md`, and `docs/glossary.md`;
- all documents under `docs/adr/` and `docs/engineering/`;
- `specifications/architecture/ARCH-0001-Core-Architecture.md`;
- all three Concept Models under `specifications/concepts/`;
- the Active `FLOW-0001-Voice-Interaction.md` and the status/content of the remaining Flow placeholders;
- relevant documentation and specification templates;
- `docs/architecture-review/REVIEW-0001-Foundation.md` and `REVIEW-0002-FINAL-FOUNDATION.md` as historical evidence only.

The requested root `VISION.md` does not exist. The repository and authority policy identify `docs/vision.md` as the current vision document, so that document was reviewed. Empty Flow, Engine, and index placeholders were treated as non-authoritative in accordance with `DOCUMENT-AUTHORITY.md` and were not treated as freeze blockers.

## 3. Independent Verification Method

The review did not accept any REVIEW-0002 resolution note as proof. Each claimed correction was checked against the current files using the following order:

1. Establish the authority and status of each source using `DOCUMENT-AUTHORITY.md`.
2. Read the approved/Active ADRs as the highest-authority architectural decisions.
3. Compare the Active Core Architecture Specification and OES standards against those ADRs.
4. Compare Draft Concept Models and Active Flow specifications against higher-authority sources.
5. Search repository-wide for legacy cognitive categories, ambiguous Context identity/version terminology, lifecycle conflicts, Contract-ownership language, outward dependency diagrams, Brain/Reasoning overlap, Event authority, Provider ownership, and Security enforcement statements.
6. Distinguish source-code dependency direction from runtime interaction, data, initialization, and event flow.
7. Classify only contradictions that affect ownership, lifecycle, semantic authority, or dependency direction as HIGH; cosmetic and implementation-level matters were deferred.

## 4. Architectural Consistency

The Foundation consistently adopts Capability-Oriented Architecture, Clean Architecture, Hexagonal principles, domain-oriented ownership, Contract-mediated collaboration, and event-driven decoupling. ADR-0001 and ARCH-0001 explicitly require source-code dependencies to point inward toward Core abstractions and prohibit Core dependencies on Engines, Skills, Providers, Adapters, Infrastructure, and Clients.

Most current diagrams now distinguish runtime interaction from source-code dependency direction. OES-0006 correctly shows Provider implementations depending on Core abstractions and separately labels runtime interaction. OES-0004 similarly explains that both Engine implementations depend on a Core-custodied Contract.

The exception is ADR-0004, where a section explicitly titled `Dependency Direction` shows `Skill → Contracts → Adapter → External Platform` and `Skill → Contracts → Provider → Technology`. That is runtime interaction, not source-code dependency direction, and it conflicts with ADR-0001 at the same authority level. OES-0007 repeats the same problem. This is recorded as FND3-002.

The general architectural direction remains sound. The identified defects are inconsistencies in its authoritative expression rather than evidence that Capability-Oriented, Clean, or Hexagonal Architecture should be replaced.

## 5. Ownership and Responsibility Boundaries

The following ownership boundaries are sufficiently clear:

- Brain Engine orchestrates cognitive execution but does not own the semantics of the capabilities it coordinates.
- Identity Engine owns identity-related information and trust semantics.
- Context Engine owns Context construction, lifecycle, lineage, revision, and Snapshot semantics in the detailed Concept Model.
- Memory Engine governs intentionally retained experience and user continuity.
- Knowledge Engine is the sole semantic owner of accepted Knowledge.
- Reasoning Engine owns inference and reasoning over an Active Context Revision.
- Planning Engine owns plans and planning state, without modifying the Active Context Revision it consumed.
- Skill Engine owns Skill discovery, validation, permission checking, execution, and result normalization.
- Voice Engine owns speech input/output behavior and voice rendering.
- Security Engine owns authorization policy and decision semantics in OES-0009.
- Providers implement replaceable technical Contracts and do not own business behavior.
- Adapters translate external ecosystems and do not own platform capability semantics.
- Infrastructure owns operational mechanisms, not domain behavior.
- Clients own interaction and presentation, not business logic.

Contract governance correctly distinguishes Core custody, Engine semantic ownership, and implementation responsibility.

One material boundary remains unresolved. ARCH-0001 says Core Models contain business rules and Core Policies contain decisions, with examples including Memory, Security, and Skill Policies. ADR-0001 and ADR-0002 say Engines own capability behavior and domain semantics. The documents do not distinguish shared platform invariants or policy definitions from capability-specific behavioral decisions. This could place the same Memory, Security, or Skill rule in either Core or its Engine and is recorded as FND3-004.

Security enforcement and Event publication also retain contradictory runtime-authority assignments, recorded as FND3-005 and FND3-006.

## 6. Cognitive Foundation

### 6.1 Memory

The current Memory definition is semantically coherent:

> What have I experienced?

ADR-0005 and CONCEPT-0001 consistently define Memory as intentionally retained experience and user continuity. Episodic experiences, preferences, retained interaction information, and provenance that an assertion occurred belong to Memory. Memory is explicitly not a database, raw conversation history, an unrestricted log, or a generic synonym for persistent information.

Working Memory used for temporary reasoning/session state is assigned to Context. Semantic Memory representing accepted truth and Procedural Memory representing validated procedures are assigned to Knowledge. System information is decomposed by semantic role. Memory and Knowledge may concern the same real-world subject but must not represent the same semantic claim.

One lower-severity ambiguity remains: ADR-0005 and CONCEPT-0001 require Memory “validation” without explicitly stating that Memory validation concerns retention eligibility, provenance, authorization, and quality—not acceptance of the asserted proposition as true. Assertion Memory otherwise correctly records that an assertion occurred without accepting its content as Knowledge. This is FND3-007.

### 6.2 Knowledge

The Knowledge boundary is independently verified:

> What is accepted as sufficiently true?

ADR-0002 establishes Knowledge as an independent platform capability and the Knowledge Engine as its single architectural owner. The Knowledge Engine governs claim acceptance, validation state, provenance requirements, lifecycle/version semantics, and contradiction resolution.

The current documents consistently state that:

- Memory may provide evidence or provenance but cannot promote a claim into Knowledge;
- Reasoning may propose claims but cannot approve them as Knowledge;
- Providers and Adapters may supply observations but cannot determine acceptance;
- imported or generated information does not become Knowledge automatically;
- Context consumes read-only Knowledge references or projections and cannot govern, mutate, validate, or reclassify Knowledge;
- physical persistence does not transfer Knowledge semantic ownership.

No semantic ownership conflict was found in the operative Knowledge rules.

### 6.3 Context

CONCEPT-0003 consistently defines:

- one stable Context Lineage Identity for every related lineage;
- one unique Context Revision Identity and ordering semantic per revision;
- Active Context as a Context Revision in the Active lifecycle state;
- immutability once a revision becomes Active;
- exactly one immutable Active Context Revision consumed by each reasoning cycle;
- the lifecycle `Collecting → Composing → Validating → Active → Expired → Archived (optional)`;
- no `Updating` lifecycle state;
- new revisions for meaningful operational changes;
- conditional Logical Reconstruction based on available version-identifiable source revisions;
- Exact Replay only when sufficient immutable historical evidence is retained;
- expiration, archival retention, deletion, and operational validity as distinct concerns;
- retained Context Snapshots as Context operational evidence rather than cognitive Memory.

Context Sources are now qualified through domain-owned Contracts, must preserve underlying authority, and should identify source revisions when reproducibility requires them. Providers, Adapters, Events, Skills, and Infrastructure do not acquire semantic authority merely by supplying observations.

The detailed model is internally consistent, but it is marked Draft. Under `DOCUMENT-AUTHORITY.md`, Draft documents are non-authoritative and cannot establish the implementation baseline. No approved ADR or Active Architecture Specification contains the complete lineage, revision, lifecycle, reconstruction, replay, and retention rules. This authority gap is FND3-001.

The Active voice flow also assembles Context before retrieving Memory, with no subsequent Context Revision composition before Reasoning consumes exactly one Active Context Revision. This is FND3-003.

### 6.4 Cognitive Boundaries

The semantic partition is consistently stated as:

- Memory: retained experience and continuity.
- Knowledge: accepted justified claims.
- Context: temporary selection or projection of what is relevant now.

Persistence is not used as the semantic boundary. Context does not silently acquire Memory or Knowledge ownership. A retained historical operational event may become Memory only through intentional retention; a retained Context Snapshot remains operational evidence. Knowledge acceptance remains an explicit Knowledge-domain decision.

The partition itself does not require redesign. The remaining Context issue is normative authority and the Active flow’s ordering, not conceptual overlap between Memory, Knowledge, and Context.

## 7. Contract Model

ADR-0001, ARCH-0001, DOCUMENT-AUTHORITY, and OES-0004 consistently establish:

- Core as canonical custodian of shared architectural Contract definitions;
- capability Engines as owners of capability behavior and domain semantics;
- implementation layers as implementers or translators that cannot change Contract semantics or acquire capability ownership;
- centralized compatibility and versioning governance for shared Contracts;
- Contract-mediated cross-boundary interaction.

No remaining operative statement that an Engine “owns its Contracts” was found. References to an Engine exposing Contracts do not assign schema custody and are compatible with the model.

The Contract model is freeze-ready in isolation. The separate Core policy/model ambiguity in FND3-004 concerns business-rule ownership rather than Contract custody.

## 8. Dependency Direction

ADR-0001 and ARCH-0001 explicitly prohibit outward Core dependencies and direct Engine dependencies on concrete Providers, Adapters, or Infrastructure. Skills are prohibited from direct external-system and Provider access. Provider and Adapter implementations depend inward on Core-custodied abstractions.

OES-0006 provides the clearest correct distinction:

- source-code dependency: `Provider Implementation → Core Contract / Abstraction`;
- runtime interaction: `Engine or Skill → Contract → Provider → External Technology`.

General architecture and request-flow diagrams are explicitly labeled as runtime interaction flows. Initialization order is not presented as source dependency direction.

ADR-0004 and OES-0007 remain exceptions. Their `Dependency Direction` diagrams are runtime chains and visually imply that Contracts depend on concrete Adapter/Provider implementations. Because ADR-0004 has equal decision authority with ADR-0001 and does not label the arrows as runtime flow, this is a material contradiction rather than cosmetic diagram polish. See FND3-002.

## 9. Brain and Reasoning Boundary

The substantive Brain/Reasoning boundary is independently verified across OES-0002, general architecture, CONCEPT-0003, and FLOW-0001:

- Reasoning Engine evaluates exactly one immutable Active Context Revision, performs inference/reasoning, and may produce candidate responses, conclusions, decisions, or next actions.
- Reasoning does not orchestrate the full cognitive pipeline, execute Skills, own Planning or Context, or deliver results to Clients.
- Brain Engine coordinates Context, Reasoning, Planning, Memory, Knowledge, and Skills through Contracts.
- Brain may assemble a final cognitive result from capability outputs but cannot independently generate reasoning content or bypass Reasoning.
- final transport, presentation, client delivery, and voice rendering belong outside both Engines.

The Active flow’s Step 11 correctly assigns final cognitive-result assembly to Brain rather than response reasoning.

The glossary contains one obsolete sentence—“It orchestrates capabilities.”—immediately after the Reasoning Engine definition. It contradicts the preceding sentence but is lower-authority general documentation and is clearly resolved by OES-0002 and the Active Flow. This is recorded as a LOW terminology defect rather than a material ownership ambiguity.

## 10. Events, Providers, and Adapters

Events are consistently defined as immutable completed facts rather than commands. Engines are required to publish an Event only when a meaningful completed domain fact exists, so the Foundation no longer forces artificial Event creation.

Provider selection is correctly described as execution of policy supplied by the consuming capability or applicable platform-policy authority. Provider Registries do not own business or policy semantics. Providers remain replaceable Contract implementations and cannot own business behavior or domain state.

Adapters remain external-ecosystem translators. Context-source qualification prevents Provider or Adapter observations from becoming domain authority merely because they enter Context.

Event runtime authority is not fully consistent. ADR-0001 says publishing responsibility belongs to the corresponding Engine. OES-0005 and OES-0007 authorize Adapter-owned integration Events. OES-0005 also requires a `Source Engine` field even though its scope includes Skills, Providers, Adapters, Automation, and Infrastructure. The intended distinction between Engine-owned domain Events and component-owned integration/technical Events is reasonable, but the highest-authority wording does not express it. See FND3-006.

## 11. Security Boundary

OES-0009 and `docs/architecture.md` establish a sound conceptual distinction:

- Security Engine owns authorization policy and decision semantics.
- invocation boundaries and consuming components enforce the applicable decisions through Contracts or governed policy artifacts.
- enforcement does not require direct Engine coupling.
- capability owners enforce Security-owned policy without acquiring Security policy ownership.

ADR-0003, however, states without qualification that “Security enforcement belongs to the Security Engine.” As an ADR, it outranks the corrected OES and general architecture. The two statements assign enforcement responsibility differently. This is a Foundation-level authority conflict and is recorded as FND3-005.

No concrete security mechanism, protocol, or deployment detail is required to resolve the ownership distinction.

## 12. Terminology and Document Authority

Capability, Engine, Skill, Provider, Adapter, Infrastructure, Contract, Event, Memory, Knowledge, Context, Context Lineage, Context Revision, Active Context, Context Snapshot, Brain, and Reasoning are generally defined consistently.

The glossary correctly defers to `DOCUMENT-AUTHORITY.md` rather than claiming independent precedence. Cosmetic terms such as `LlmProvider` versus `LLMProvider`, malformed typography, and filename conventions do not create architectural ambiguity.

Three terminology/status issues remain relevant:

- all three Concept Models are Draft and therefore non-authoritative; this is material for the detailed Context semantics and is addressed by FND3-001;
- the glossary’s stray “It orchestrates capabilities” sentence appears to describe Reasoning and conflicts with the canonical Brain boundary; this is FND3-008;
- FLOW-0001’s high-level diagram still says `Response Generation`, and its related-document list references obsolete `CORE-SPEC-0001`, although Step 11 and the actual Core specification use the corrected terms; this is FND3-009.

The absence of a root `VISION.md`, the extensionless ADR-0005 filename, empty non-authoritative placeholders, and broad Markdown/mojibake issues do not affect architectural meaning and are deferred.

## 13. Findings

No BLOCKER findings identified.

### FND3-001 — Detailed Context semantics have no authoritative source

Severity:
- HIGH

Affected documents:

- `docs/DOCUMENT-AUTHORITY.md`
- `specifications/concepts/CONCEPT-0003-Context-Model.md`
- `docs/architecture.md`
- `ORION-HANDOFF.md`

Description:

CONCEPT-0003 contains the complete Context Lineage Identity, Revision Identity, lifecycle, reconstruction, replay, Snapshot, and retention model, but its status is Draft. DOCUMENT-AUTHORITY explicitly makes Draft documents non-authoritative and does not place Concept Specifications in the authority hierarchy. General architecture and the handoff summarize the model but cannot make it authoritative.

Why it matters:

Context identity and lifecycle are foundational implementation constraints. Under the repository’s own undecided-topic rule, implementation must pause when no authoritative source exists. Freezing while the definitive model is non-authoritative would allow an implementation to disregard it without formally violating the hierarchy.

Recommended action:

Approve the Context semantics through the existing documentation-authority process and give them an explicit authoritative home or status. Clarify where Active Concept Specifications sit in the hierarchy, or incorporate the canonical Context rules into an already recognized authoritative document. Preserve the current semantics; no redesign is indicated.

#### Resolution Note — 2026-07-19

**Status: RESOLVED**

Concept Specifications are now explicitly placed in the documentation authority hierarchy below approved ADRs and Active Architecture Specifications and above OES documents. OES-0008 recognizes the Concept Specification type and the existing `Active` status as approved and authoritative. CONCEPT-0001, CONCEPT-0002, and CONCEPT-0003 are now Active, giving the unified cognitive foundation consistent authority. CONCEPT-0003 therefore governs implementation within its approved Context scope without marking the Foundation frozen or starting implementation. FND3-001 is fully resolved.

### FND3-002 — ADR-0004 still presents runtime interaction as source-code dependency direction

Severity:
- HIGH

Affected documents:

- `docs/adr/ADR-0004-Separation-of-Skills-Providers-and-Adapters.md`
- `docs/adr/ADR-0001-Core-Ownership-and-Dependency-Direction.md`
- `docs/engineering/OES-0007-Adapter-Design.md`

Description:

ADR-0004 labels `Skill → Contracts → Adapter → External Platform` and `Skill → Contracts → Provider → Technology` as `Dependency Direction`. These are runtime interaction chains. As source-code dependency diagrams, they imply that Core-custodied Contracts depend outward on concrete Adapters or Providers. OES-0007 repeats the same labeling.

Why it matters:

ADR-0004 and ADR-0001 have the same decision authority but teach incompatible dependency graphs. Implementers could reasonably follow ADR-0004 and introduce outward Contract or business-layer dependencies, violating Clean and Hexagonal Architecture.

Recommended action:

Relabel the ADR-0004 and OES-0007 chains as Runtime Interaction Flow and add or reference the canonical inward source-code dependency view from ADR-0001. State explicitly that Adapter and Provider implementations depend on Core Contracts, not the reverse.

#### Resolution Note — 2026-07-19

**Status: RESOLVED**

ADR-0004 now labels its Skill/Contract/Adapter and Skill/Contract/Provider chains as Runtime Interaction Flow and explicitly preserves ADR-0001's inward source-code dependency direction. OES-0007 is aligned: Adapter implementations depend inward on applicable Core Contracts or abstractions, while Core and its Contracts do not source-depend on Adapters or external APIs and Skills do not source-depend on concrete Adapters. Runtime collaboration examples in ADR-0004, OES-0002, and FLOW-0001 are explicitly identified as runtime interaction rather than source-code dependency. A repository-wide diagram audit found no remaining authoritative diagram that reasonably permits Core to source-depend outward. FND3-002 is fully resolved.

### FND3-003 — Active voice flow retrieves Memory after Context activation without composing a new revision

Severity:
- HIGH

Affected documents:

- `specifications/flows/conversation/FLOW-0001-Voice-Interaction.md`
- `docs/architecture.md`
- `specifications/concepts/CONCEPT-0003-Context-Model.md`

Description:

The Active voice flow performs Context Assembly at Step 5 and Memory Retrieval at Step 6. Reasoning then consumes exactly one immutable Active Context Revision. The flow does not state that Memory retrieval occurs as part of Context collection/composition or that a new revision containing the Memory references becomes Active before Reasoning. General architecture repeats this order.

Why it matters:

The canonical model says Context selects relevant Memory and Reasoning consumes only the Active Context Revision. The current Active flow leaves retrieved Memory either outside Reasoning’s sole input or requires mutation of an already Active revision. Both interpretations contradict the cognitive model.

Recommended action:

Clarify the runtime flow so authorized Memory and Knowledge retrieval/projection participates in Collecting/Composing before activation, or explicitly creates and activates a new immutable revision before Reasoning. Do not permit post-activation mutation or a hidden second Reasoning input.

#### Resolution Note — 2026-07-19

**Status: RESOLVED**

FLOW-0001 now begins a Context Revision in Collecting, retrieves relevant authorized Memory and Knowledge references or projections as required, composes and validates the revision, and activates it before Reasoning. Reasoning consumes exactly that one immutable Active Context Revision. Context receives only references or projections, so Memory and Knowledge retain semantic ownership. Relevant information arriving after activation cannot mutate the current revision; the Context Engine must create, compose, validate, and activate a new revision before subsequent reasoning may use it. The general request lifecycle in `docs/architecture.md` is aligned. FND3-003 is fully resolved.

### FND3-004 — Core business-rule and policy statements overlap Engine semantic ownership

Severity:
- HIGH

Affected documents:

- `docs/adr/ADR-0001-Core-Ownership-and-Dependency-Direction.md`
- `docs/adr/ADR-0002-Capability-Oriented-Architecture.md`
- `specifications/architecture/ARCH-0001-Core-Architecture.md`
- `docs/engineering/OES-0002-Engine-Design.md`

Description:

ADR-0001 places Domain Models and Policies in Core while declaring that Engines own capability behavior. ARCH-0001 goes further: Core Models “contain business rules” and Core Policies “contain decisions,” with examples including Memory Policy, Security Policy, and Skill Policy. ADR-0002 and OES-0002 assign capability behavior and domain semantics to the respective Engines.

Why it matters:

The Foundation does not say whether a capability-specific rule or decision belongs in Core or its Engine. This is a material dependency and ownership decision: placing Memory, Security, or Skill behavior in Core would make Core the behavioral owner and increase its change coupling; placing it in Engines follows the capability model.

Recommended action:

Define the boundary between shared platform types/invariants or policy Contracts under Core custody and capability-specific behavioral rules/decisions owned by Engines. Align the Core examples so custody of a policy definition cannot be read as ownership of Memory, Security, Skill, or other capability behavior.

#### Resolution Note — 2026-07-19

**Status: RESOLVED**

ADR-0001 and ARCH-0001 now limit Core semantic scope to shared domain language, architectural policies, platform-wide constraints, cross-capability invariants, and shared policy definitions or Contracts. Capability-specific business rules, semantic decisions, and behavior belong exclusively to the owning capability Engine. Core custody of a shared model or policy definition explicitly does not create a second semantic owner. Supporting architecture, principle, and glossary language was aligned. FND3-004 is fully resolved.

### FND3-005 — Security enforcement responsibility conflicts across authority levels

Severity:
- HIGH

Affected documents:

- `docs/adr/ADR-0003-Engine-Communication-Model.md`
- `docs/engineering/OES-0009-Security-Standards.md`
- `docs/architecture.md`

Description:

ADR-0003 states that Security enforcement belongs to the Security Engine. OES-0009 says the Security Engine owns policy and decision semantics while invocation boundaries and consuming components enforce those decisions. General architecture agrees with OES-0009. The ADR has higher authority and does not distinguish policy authority from distributed enforcement responsibility.

Why it matters:

Implementers cannot tell whether every protected action requires central Security Engine mediation or whether boundary components enforce Security-owned decisions. This affects coupling, availability, and responsibility boundaries.

Recommended action:

Clarify ADR-0003 so Security Engine ownership means policy and authorization-decision authority, while enforcement occurs at protected invocation boundaries through Contracts or governed policy artifacts without transferring policy ownership.

#### Resolution Note — 2026-07-19

**Status: RESOLVED**

ADR-0003 now establishes the Security Engine as owner of security policy semantics, authorization decision semantics, and Security-domain rules. Engines, Gateways, Adapters, Providers, and Infrastructure may enforce applicable decisions at protected boundaries through Security-owned Contracts, decisions, or governed policy artifacts without acquiring Security semantic ownership. Direct Engine implementation coupling, Security-policy bypass, and a universal synchronous Security Engine call are explicitly prohibited. OES-0009 and supporting architecture, principle, and glossary language are aligned. FND3-005 is fully resolved.

### FND3-006 — Event publication authority excludes and permits Adapters simultaneously

Severity:
- HIGH

Affected documents:

- `docs/adr/ADR-0001-Core-Ownership-and-Dependency-Direction.md`
- `docs/engineering/OES-0005-Events.md`
- `docs/engineering/OES-0007-Adapter-Design.md`
- `docs/DOCUMENT-AUTHORITY.md`

Description:

ADR-0001 says Event publishing responsibility belongs to the corresponding Engine. OES-0005 and OES-0007 allow Adapters to publish Adapter-owned integration Events. OES-0005 applies to multiple component types but still requires `Source Engine` in every Event structure.

Why it matters:

The intended domain-Event/integration-Event distinction is not authoritative at the ADR level. An implementation cannot consistently decide whether Adapters are legitimate publishers, who owns integration Event semantics, or how non-Engine publishers identify themselves.

Recommended action:

Clarify ADR-0001 to distinguish Core schema custody, domain/integration Event semantic ownership, and publication authority. Permit a component to publish only Events it semantically owns, and use source-component terminology that covers authorized non-Engine publishers.

#### Resolution Note — 2026-07-19

**Status: RESOLVED**

ADR-0001 and OES-0005 now distinguish Core custody of shared Event Contracts, envelopes, and schemas; semantic ownership by the applicable capability or domain; and runtime publication authority for an Engine, Adapter, or other authorized component appropriate to the Event type. Domain, integration, and platform/Infrastructure Events have explicit semantic-owner categories. Publishers may represent only authorized Event semantics, Adapters cannot impersonate Engine-owned domain Events, and `Source Component` replaces the Engine-only source assumption. No component is universally required to publish an Event when no meaningful completed fact exists. FND3-006 is fully resolved.

### FND3-007 — Memory validation can be confused with Knowledge truth acceptance

Severity:
- MEDIUM

Affected documents:

- `docs/adr/ADR-0005 — Memory Architecture Principles`
- `specifications/concepts/CONCEPT-0001-Memory-Model.md`

Description:

The Memory lifecycle requires `Validation` and says validation is mandatory or that only validated information becomes persistent Memory. Assertion Memory simultaneously records that an assertion occurred without accepting the asserted proposition as Knowledge. The documents do not explicitly distinguish Memory retention validation from Knowledge claim validation.

Why it matters:

Without the distinction, a Memory implementation could wrongly validate an assertion as true or refuse to retain provenance unless its content is accepted as Knowledge. This weakens the otherwise-correct cognitive partition.

Recommended action:

Define Memory validation as validation of retention eligibility, provenance, authorization, integrity, and quality. State that it does not validate the truth of an asserted claim; Knowledge acceptance remains exclusively with the Knowledge Engine.

### FND3-008 — Glossary assigns orchestration to Reasoning in one stray sentence

Severity:
- LOW

Affected documents:

- `docs/glossary.md`

Description:

Immediately after stating that Reasoning does not orchestrate the full cognitive pipeline, the glossary says, “It orchestrates capabilities.” The placement assigns that sentence to Reasoning, although the canonical Brain definition owns orchestration.

Why it matters:

Higher-authority documents resolve the boundary, so this does not create an unresolved architectural decision. It is nevertheless a direct stale contradiction in the official vocabulary summary.

Recommended action:

Remove the sentence or place an appropriately scoped orchestration statement under Brain.

### FND3-009 — Active flow retains stale response terminology and Core reference

Severity:
- LOW

Affected documents:

- `specifications/flows/conversation/FLOW-0001-Voice-Interaction.md`

Description:

The high-level flow still labels Step 11 as `Response Generation`, while the detailed step correctly uses `Final Cognitive Result Assembly`. Its related-document list also references obsolete `CORE-SPEC-0001` instead of ARCH-0001.

Why it matters:

The detailed responsibilities are clear, so the issue does not reopen the Brain/Reasoning ownership decision. The stale summary and reference reduce traceability and can revive the old terminology during implementation.

Recommended action:

Align the high-level flow label with Step 11 and replace the obsolete Core Architecture reference.

### FND3-010 — Provider definition still uses capability language

Severity:
- LOW

Affected documents:

- `docs/glossary.md`
- `docs/adr/ADR-0004-Separation-of-Skills-Providers-and-Adapters.md`
- `docs/engineering/OES-0006-Providers.md`

Description:

The glossary defines a Provider as implementing a “technology-specific capability,” while ADR-0004 and OES-0006 define a Provider as a replaceable implementation of a Contract that never represents a business capability.

Why it matters:

The higher-authority sources clearly prevent Provider semantic ownership, so this is not a material ownership conflict. The wording can still blur the distinction between a platform capability and technical feature support.

Recommended action:

Define a Provider as a replaceable technical implementation of a Contract and describe supported items as technical features or Contract support rather than platform capabilities.

## 14. Deferred Post-Freeze Improvements

The following items do not affect Foundation correctness and should not delay freeze after the material findings are resolved:

- broad Markdown, heading, escaping, and mojibake normalization;
- creation of a root `VISION.md` alias or relocation of `docs/vision.md`;
- ADR-0005 filename and extension normalization;
- population or removal of empty non-authoritative Flow, Engine, index, and roadmap placeholders;
- comprehensive conversion of plain references into relative Markdown links;
- `LLM` capitalization and exception-name normalization;
- Concept template/front-matter and section-number formatting cleanup;
- concrete databases, transports, SDKs, deployment topology, provider scoring, retention periods, confidence formulas, synchronization protocols, and other implementation choices;
- creation of future Engine Specifications;
- optional expansion of examples, diagrams, and repository navigation material.

## 15. Foundation Freeze Assessment

**Classification: C. REQUIRES ARCHITECTURAL CORRECTIONS**

The Foundation does not require a foundational redesign. Its principal architecture is coherent, and no BLOCKER exists. The six HIGH findings are bounded corrections to authority, ownership, dependency labeling, and Active flow semantics.

They must be corrected before freeze because the current candidate baseline gives materially conflicting instructions about whether the Context lifecycle is normative, how Memory enters the sole Active Context consumed by Reasoning, where capability business rules live, who enforces Security policy, who may publish Events, and which direction Adapter/Provider dependencies point.

The MEDIUM and LOW findings should be corrected as freeze hygiene where practical, but only the HIGH findings prevent approval. After those corrections, the repository should undergo a focused verification rather than another broad architectural redesign.

## 16. Final Verdict

FOUNDATION FREEZE: NOT APPROVED
