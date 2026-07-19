# Documentation Authority

| Field | Value |
|--------|--------|
| **Status** | Active |
| **Version** | 2.0.0 |
| **Owner** | Project Maintainers |
| **Created** | 2026-07-10 |
| **Updated** | 2026-07-19 |
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
5. Active Protocol, API, and Schema Specifications
6. Active Engine Specifications
7. Active Flow Specifications
8. AGENTS.md
9. General architecture and project documentation
10. README.md and MANIFESTO.md
11. Examples, comments, drafts, and placeholders

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

# 5. Protocol, API, and Schema Specifications

These specifications define machine-consumable or integration-facing behavior.

They govern:

- Message formats
- Transport behavior
- API operations
- Schema validation
- Compatibility rules

They must comply with ADRs, Architecture Specifications, Concept Specifications, and Engineering Standards.

---

# 6. Engine Specifications

Engine Specifications define one Engine’s responsibilities, contracts, lifecycle, state, events, failures, security boundaries, and observability requirements.

An Engine Specification may specialize a general Engineering Standard but must not contradict higher-authority ADRs, Architecture Specifications, Concept Specifications, or Engineering Standards.

---

# 7. Flow Specifications

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

# 8. AGENTS.md

AGENTS.md provides operational guidance for contributors and AI agents.

It defines how work should be performed inside the repository.

AGENTS.md must reference authoritative documents rather than duplicate their normative content.

It must not override ADRs, Specifications, or Engineering Standards.

---

# 9. General Documentation

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

# 10. README and MANIFESTO

README.md introduces the project.

MANIFESTO.md expresses the project’s purpose and long-term beliefs.

These documents are important but non-normative.

They must not be used to resolve technical conflicts.

---

# 11. Drafts, Examples, and Placeholders

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

These responsibilities must be documented explicitly.

Storing a Contract or Event schema in the Core does not make the Core its domain owner.

For Knowledge, the Knowledge Engine owns domain behavior and governance. The Core may define or custody shared Knowledge Contracts, schemas, identifiers, and domain types, but this custody does not transfer Knowledge behavior or acceptance authority to the Core.

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

# Cross-Reference Requirement

Normative documents should use relative Markdown links to related authoritative documents.

Example:

```markdown
- [OES-0004 — Contracts](engineering/OES-0004-Contracts.md)
```
