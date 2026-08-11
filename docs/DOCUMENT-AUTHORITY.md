# Documentation Authority

| Field | Value |
|--------|--------|
| **Status** | Active |
| **Version** | 2.1.0 |
| **Owner** | Project Maintainers |
| **Created** | 2026-07-10 |
| **Updated** | 2026-08-10 |
| **Applies To** | All Project Documentation |

---

# Purpose

This document defines the authority, precedence, and conflict-resolution rules for O.R.I.O.N. documentation.

Its purpose is to ensure that contributors, maintainers, and AI agents can determine which document is authoritative when two or more documents contain conflicting information.

---

# Scope

This policy applies to:

- Architecture Decision Records
- Architecture Specifications
- Contract Specifications
- Engineering Standards
- Engine Specifications
- Flow Specifications
- Protocol Specifications
- API Specifications
- Schema Specifications
- Architecture Reviews
- General project documentation
- Repository guidance
- AI-agent instructions

---

# Authority Principle

Every architectural concept must have one authoritative source.

Documents may summarize or reference an authoritative source, but they must not redefine it independently.

When two documents conflict, the document with the higher authority level takes precedence.

---

# Authority Hierarchy

The official precedence order is:

1. Approved Architecture Decision Records
2. Active Architecture Specifications
3. Active Concept Specifications
4. Active O.R.I.O.N. Engineering Standards
5. Active Contract Specifications
6. Active Protocol, API, and Schema Specifications
7. Active Engine Specifications
8. Active Flow Specifications
9. AGENTS.md
10. General architecture and project documentation
11. README.md and MANIFESTO.md
12. Examples, comments, drafts, and placeholders

---

# 1. Architecture Decision Records

Architecture Decision Records define why significant architectural decisions were made.

An approved ADR has the highest authority for the decision it governs.

Examples:

- Core ownership
- Engine communication
- Capability registration
- Security ownership
- Deployment topology

An ADR may override an older specification or standard only when the superseded document is explicitly identified and updated.

---

# 2. Architecture Specifications

Architecture Specifications define the approved structural design of the platform.

Examples:

- Core boundaries
- Dependency direction
- Runtime topology
- Component ownership
- Deployment structure

Architecture Specifications must comply with approved ADRs.

For shared architectural Contracts, the Core is the canonical schema custodian. This custody is distinct from the capability Engine's domain semantic ownership and from an implementation layer's responsibility to implement or translate the Contract.

---

# 3. Concept Specifications

Concept Specifications define approved, technology-independent semantics for foundational platform concepts.

They govern:

- conceptual boundaries and ownership;
- identity and lifecycle semantics;
- relationships between foundational concepts;
- constraints that implementation must preserve.

An Active Concept Specification is authoritative within its conceptual scope. It must comply with approved ADRs and Active Architecture Specifications. A Draft Concept Specification remains non-authoritative.

---

# 4. Engineering Standards

O.R.I.O.N. Engineering Standards define mandatory design and implementation rules.

Examples:

- Engine design
- Contract design
- Event design
- Provider design
- Security
- Versioning
- Documentation

Engineering Standards must not contradict approved ADRs, Active Architecture Specifications, or Active Concept Specifications.

---

# 5. Contract Specifications

A canonical architectural Contract Specification is a normative specification of an already accepted shared semantic boundary.

Contract Specifications:

- formalize shared semantics, guarantees, invariants, obligations, failures, and compatibility within their accepted scope;
- are governed in authorship and evolution by [OES-0004 — Contracts](engineering/OES-0004-Contracts.md);
- retain the applicable capability or domain as Semantic Owner;
- retain Core custody of shared Contract language where that custody applies;
- remain distinct from executable TypeScript or runtime Contract surfaces.

An Active Contract Specification governs implementations, executable Contract surfaces, and lower-authority documentation within the boundary it formalizes. It MUST comply with applicable approved ADRs, Active Architecture Specifications, authoritative Concept Specifications where their scopes overlap, and Active Engineering Standards.

A Contract Specification does not originate architectural ownership or authority independently. It MUST NOT invent capability ownership, source authority, authority-verification ownership, Security authorization ownership, protected-boundary enforcement ownership, Context incorporation or currentness ownership, Brain orchestration or final-result ownership, Bootstrap composition ownership, or persistence ownership.

Executable implementation does not give a Contract Specification additional authority, and implementation reality cannot override higher architectural authority.

This policy defines Contract-Specification authority and precedence only. It does not define Contract filenames, numbering, directory placement, identifier uniqueness, or lifecycle mechanics beyond the general status rules in this document.

---

# 6. Protocol, API, and Schema Specifications

These specifications define machine-consumable or integration-facing behavior.

They govern:

- Message formats
- Transport behavior
- API operations
- Schema validation
- Compatibility rules

They must comply with applicable ADRs, Architecture Specifications, authoritative Concept Specifications within overlapping scope, Engineering Standards, and Active Contract Specifications whose formalized boundaries they represent or expose.

---

# 7. Engine Specifications

Engine Specifications define one Engine’s responsibilities, contracts, lifecycle, state, events, failures, security boundaries, and observability requirements.

An Engine Specification may describe how its capability participates in or implements applicable Contract semantics and may specialize implementation-facing behavior within already accepted architecture. It must not contradict higher-authority ADRs, Architecture Specifications, authoritative Concept Specifications within overlapping scope, Engineering Standards, or an applicable Active Contract Specification within the Contract boundary.

An Active Contract Specification governs when an Engine Specification conflicts with the formalized Contract boundary, unless a higher architectural authority governs the conflict. A Contract Specification does not absorb unrelated Engine-internal behavior, lifecycle, state, or implementation detail.

---

# 8. Flow Specifications

Flow Specifications describe runtime collaboration between components.

They define:

- Participants
- Preconditions
- Execution sequence
- Alternate paths
- Failures
- Authorization
- Observability

Flows do not redefine Engine ownership.

When a Flow conflicts with an Engine Specification, the Engine Specification takes precedence and the Flow must be corrected.

---

# 9. AGENTS.md

AGENTS.md provides operational guidance for contributors and AI agents.

It defines how work should be performed inside the repository.

AGENTS.md must reference authoritative documents rather than duplicate their normative content.

It must not override ADRs, Specifications, or Engineering Standards.

---

# 10. General Documentation

General documentation includes:

- docs/architecture.md
- docs/vision.md
- docs/principles.md
- docs/glossary.md
- docs/roadmap.md
- docs/README.md

These documents explain the project and provide context.

They must remain consistent with authoritative ADRs, Specifications, and Engineering Standards.

---

# 11. README and MANIFESTO

README.md introduces the project.

MANIFESTO.md expresses the project’s purpose and long-term beliefs.

These documents are important but non-normative.

They must not be used to resolve technical conflicts.

---

# 12. Drafts, Examples, and Placeholders

Draft documents, code examples, comments, diagrams, and empty placeholders are non-authoritative.

They must never override an Active or approved document.

A file name alone does not establish authority.

---

# Document Status and Authority

Document authority depends on both document type and status.

Only the following statuses may be treated as authoritative:

- Active
- Approved ADR

The following statuses are non-authoritative:

- Draft
- Review
- Deprecated
- Superseded
- Archived

A Deprecated document remains historically useful but should not govern new implementations.

A Superseded document has no normative authority.

For Contract Specifications:

- an Active Contract Specification governs within its accepted and formalized scope;
- a Draft or Review Contract Specification does not establish architectural authority;
- a Superseded Contract Specification is historical and non-current;
- an Archived Contract Specification is historical and non-current unless repository governance explicitly establishes another meaning.

Lifecycle status does not permit a Contract Specification to exceed the architectural scope accepted by higher authority.

---

# Contract Specifications and Executable Surfaces

An architectural Contract Specification is distinct from an executable Contract surface.

Executable Contract surfaces include, where applicable:

- TypeScript interfaces and types;
- exported request, result, reference, and failure definitions;
- runtime validators;
- conformance tests.

Executable surfaces implement, represent, enforce, or test shared Contract language. They do not become architectural authority merely because they execute, are exported, or are used by implementations.

Executable surfaces MUST conform to applicable Active Contract Specifications and all higher architectural authority. Tests and diagnostics provide conformance evidence; they do not override the Contract Specification or create architectural semantics.

---

# Conflict Resolution Process

When conflicting documentation is discovered:

1. Identify every conflicting document.
2. Determine each document’s type and status.
3. Apply the authority hierarchy.
4. Identify the authoritative source.
5. Correct the lower-authority document.
6. Record a new ADR if the conflict reveals an undecided architectural issue.
7. Update related links and review records.
8. Increment document versions where required.

Contributors must not silently choose one interpretation.

The following Contract-specific applications make this process deterministic:

1. When an applicable approved ADR or higher architectural boundary conflicts with an Active Contract Specification, the higher architectural authority governs and the Contract Specification must be corrected.
2. When an Active Contract Specification conflicts with an Engine Specification within the same formalized Contract boundary, the Contract Specification governs unless an applicable higher authority says otherwise.
3. When an Active Contract Specification conflicts with an executable Contract surface, implementation, test, diagnostic, or lower-authority implementation documentation, the Contract Specification governs.
4. When two Contract Specifications appear to conflict, contributors must evaluate lifecycle status, formalized scope, Semantic Ownership, and governing architectural authority. They MUST NOT resolve the conflict through implementation preference. Any unresolved architectural ambiguity must be escalated through the existing higher-authority process rather than decided inside the Contract layer.

Concept precedence is scope-sensitive. An Active Concept Specification governs a Contract only where the Concept remains authoritative and its conceptual scope overlaps the Contract boundary; a Concept does not override an unrelated Contract merely because it has a higher document-family position.

---

# Undecided Topics

If no authoritative document exists:

1. Implementation must pause.
2. The ambiguity must be documented.
3. An ADR or authoritative specification must be created.
4. Work may continue only after approval.

Assumptions must not become architecture accidentally.

---

# Semantic Ownership

Authority must not be confused with file location.

For Contracts and Events, the following concepts are distinct:

- **Domain owner:** the Engine or domain responsible for meaning and behavior.
- **Schema custodian:** the package or repository location containing the definition.
- **Runtime authority:** the component allowed to publish, execute, or enforce it.
- **Implementation owner:** the component or layer responsible for a conforming executable realization.

These responsibilities must be documented explicitly.

Storing a Contract or Event schema in the Core does not make the Core its domain owner.

Core custody of a Contract Specification or shared Contract language MUST NOT confer semantic ownership, runtime ownership, implementation ownership, Bootstrap composition ownership, source authority, authority-verification ownership, Security authorization ownership, or protected-boundary enforcement ownership.

A Consumer, Implementer, Provider, Adapter, transport, store, test, or diagnostic does not acquire Contract semantic ownership or architectural authority through participation, representation, execution, conformance, or observation.

For Knowledge, the Knowledge Engine owns domain behavior and governance. The Core may define or custody shared Knowledge Contracts, schemas, identifiers, and domain types, but this custody does not transfer Knowledge behavior or acceptance authority to the Core.

OES-0004 governs how Contract Specifications are authored and evolved. This document governs their authority and precedence. Engineering Standards do not become Semantic Owners of the capability Contracts whose governance they define.

---

# Source-of-Truth Rule

Every normative topic must identify exactly one source of truth.

Examples:

| Topic | Authoritative Source |
|---|---|
| Engineering philosophy | OES-0000 |
| Repository structure | OES-0001 |
| Engine design | OES-0002 |
| Skill design | OES-0003 |
| Contracts | OES-0004 |
| Events | OES-0005 |
| Providers | OES-0006 |
| Adapters | OES-0007 |
| Documentation | OES-0008 |
| Security | OES-0009 |
| Versioning | OES-0010 |
| Core architecture | ARCH-0001 |
| Memory concept semantics | CONCEPT-0001 |
| Knowledge concept semantics | CONCEPT-0002 |
| Context concept semantics | CONCEPT-0003 |
| Knowledge capability ownership | ADR-0002 |
| Memory / Knowledge / Context semantic partition | ADR-0005 |
| Architectural decisions | Relevant approved ADR |

---

# Change History

| Version | Date       | Description |
| ------- | ---------- | ----------- |
| 2.1.0   | 2026-08-10 | Added canonical architectural Contract Specifications to the document taxonomy, authority hierarchy, status rules, ownership distinctions, and deterministic conflict-resolution process. |

---

# Cross-Reference Requirement

Normative documents should use relative Markdown links to related authoritative documents.

Example:

```markdown
- [OES-0004 — Contracts](engineering/OES-0004-Contracts.md)
```
