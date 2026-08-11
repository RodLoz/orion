# OES-0008 — Documentation Standards

| Field | Value |
|--------|--------|
| **Status** | Active |
| **Version** | 1.2.0 |
| **Owner** | Project Maintainers |
| **Created** | 2026-07-10 |
| **Updated** | 2026-08-10 |
| **Applies To** | All Documentation |

---

# Purpose

This standard defines how documentation is written, organized, reviewed, versioned, and maintained throughout the O.R.I.O.N. project.

Documentation is considered a first-class engineering artifact.

Every architectural decision, implementation, specification, and engineering standard depends on accurate and consistent documentation.

---

# Scope

This standard applies to:

- README
- MANIFESTO
- AGENTS
- Engineering Standards (OES)
- Architecture Decision Records (ADR)
- Architecture Specifications (ARCH)
- Concept Specifications (CONCEPT)
- Contract Specifications (CONTRACT)
- Engine Specifications (ENGINE)
- Flow Specifications (FLOW)
- API Specifications
- Protocol Specifications
- Schema Specifications
- Review Documents
- Contributor Documentation

---

# Documentation Philosophy

Documentation is part of the software.

Incomplete documentation is considered incomplete implementation.

Every document should answer one clear question.

Every document should have a single responsibility.

---

# Documentation Principles

Documentation should be:

- Accurate
- Explicit
- Consistent
- Versioned
- Maintainable
- Reviewable
- Traceable
- Technology-neutral whenever possible

---

# Canonical Language

The official documentation language is **English**.

Discussions may occur in any language.

Normative documentation must always be written in English.

---

# Document Header

Every technical document must begin with the following header.

```markdown
# Document Title

| Field | Value |
|--------|--------|
| **Status** | Draft / Review / Active / Deprecated / Superseded |
| **Version** | x.y.z |
| **Owner** | Project Maintainers |
| **Created** | YYYY-MM-DD |
| **Updated** | YYYY-MM-DD |
| **Applies To** | Scope |

---
```

README.md and MANIFESTO.md are exempt from this requirement.

Contract Specifications specialize the generic technical-document header according to [OES-0004 — Contracts](OES-0004-Contracts.md). They use `Semantic Owner` and `Core Custodian` instead of an ambiguous generic `Owner` field, while retaining Status, Version, Created, Updated, and Applies To. This specialization preserves the distinction between document maintenance, capability semantics, shared-language custody, implementation responsibility, and runtime authority.

---

# Document Status

Every document must declare its current status.

Allowed values are:

| Status | Meaning |
|----------|---------|
| Draft | Initial work in progress |
| Review | Under formal review |
| Active | Approved and authoritative |
| Deprecated | Still valid but scheduled for replacement |
| Superseded | Replaced by another document |
| Archived | Historical reference only |

---

# Document Ownership

Every document must identify an owner.

Ownership indicates maintenance responsibility.

Ownership does not imply exclusive authorship.

For Contract Specifications, Contract-specific metadata is a document-family specialization of these generic documentation requirements. OES-0004 requires:

- Status;
- Version;
- Semantic Owner;
- Core Custodian;
- Created;
- Updated;
- Applies To.

`Semantic Owner` identifies the capability or domain that owns the Contract's meaning. `Core Custodian` identifies custody of shared Contract language where applicable. These fields remain distinct and MUST NOT be collapsed into the generic `Owner` field.

---

# Versioning

All technical documents follow Semantic Versioning.

```
MAJOR.MINOR.PATCH
```

Examples:

```
1.0.0

1.1.0

2.0.0
```

Major versions indicate incompatible changes.

For Contract Specifications, the Contract identifier and Semantic Version describe different properties:

- the Contract identifier identifies the semantic Contract boundary;
- the Version identifies an evolution state of that Contract.

For example, `CONTRACT-0001` version `1.0.0` and `CONTRACT-0001` version `1.1.0` retain the same Contract identity unless higher architectural authority establishes a different semantic boundary. Contract versioning follows OES-0010 and OES-0004. Versions are recorded in metadata rather than canonical filenames.

---

# Contract Specification Lifecycle

Contract Specifications use existing repository lifecycle statuses; no Contract-specific status is introduced:

- Draft;
- Review;
- Active;
- Superseded;
- Archived.

Only an Active Contract Specification governs within its accepted scope. Draft and Review Contract Specifications are non-authoritative. Superseded and Archived Contract Specifications are historical and non-current.

Lifecycle transitions do not change the Semantic Owner or transfer Core Custody. Superseded and Archived history retains the Contract identifier and version lineage, and lifecycle status never makes an identifier available for reuse.

This standard does not define historical file-storage or revision-file layout.

---

# Naming Conventions

Document names should use the following patterns.

Engineering Standards

```
OES-0001-Repository-Structure.md
```

Architecture Decisions

```
ADR-0001-Core-Boundaries.md
```

Architecture Specifications

```
ARCH-0001-Core-Architecture.md
```

Concept Specifications

```
CONCEPT-0001-Memory-Model.md
```

Engine Specifications

```
ENGINE-0001-Identity-Engine.md
```

Flow Specifications

```
FLOW-0001-Voice-Interaction.md
```

Reviews

```
REVIEW-0001-Foundation.md
```

Contract Specifications

```
CONTRACT-####-Descriptive-Contract-Name.md
```

The canonical top-level title form is:

```markdown
# CONTRACT-#### — Descriptive Contract Name
```

`CONTRACT-####` is the canonical identifier family for architectural Contract Specifications. The numeric component uses four zero-padded digits, consistent with other canonical document families. Illustrative identifiers such as `CONTRACT-0001` and `CONTRACT-0002` demonstrate the format only; they do not allocate a Contract identifier.

Each `CONTRACT-####` identifier MUST be unique within the Contract document family and MUST map to one canonical semantic Contract boundary. Duplicate Active identifiers are prohibited. An identifier MUST NOT be reused for an unrelated boundary after supersession, archival, or any other lifecycle transition.

A Contract identifier persists across compatible evolution. A version change does not create a new Contract identifier unless higher architectural authority establishes a distinct semantic Contract boundary requiring separate document identity. Numbering does not encode runtime order, dependency order, authority level, priority, or capability ownership.

The descriptive filename component names the semantic Contract boundary. The filename begins with its stable identifier and uses the Markdown extension. A descriptive name MAY evolve when repository naming rules permit, provided link updates preserve canonical identity. Semantic versions remain in document metadata and MUST NOT be encoded in the canonical filename.

This standard establishes Contract-document identity and naming only. Canonical directory placement is governed by repository-structure standards and is not established in this version of OES-0008. It does not define revision filenames, allocation automation, an alias system, or a Contract index.

The abbreviation `RC` remains reserved for Release Candidate terminology under OES-0010 and applicable release governance. Review-local labels such as `RC-001` or `RC-002` are not canonical Contract identifiers and do not establish an `RC-*` Contract document family. Canonical architectural Contract Specifications use `CONTRACT-####`.

---

# Writing Style

Documentation should:

- Prefer active voice.
- Use short paragraphs.
- Avoid marketing language.
- Avoid unnecessary adjectives.
- Avoid ambiguous wording.
- Prefer lists over long paragraphs.
- Use examples when appropriate.

Normative language should follow RFC terminology.

Examples:

- MUST
- MUST NOT
- SHOULD
- SHOULD NOT
- MAY

---

# Markdown Standards

Use:

- ATX headings (`#`)
- Fenced code blocks
- Tables for metadata
- Ordered lists only when order matters
- Unordered lists otherwise

Avoid:

- HTML
- Inline styling
- Excessive emojis
- Mixed heading styles

---

# Code Examples

Code examples should be:

- Minimal
- Complete
- Language-specific
- Clearly labeled

Examples should illustrate concepts rather than production implementations.

---

# Diagrams

Preferred diagram types:

- Sequence diagrams
- Flow diagrams
- Layer diagrams
- Component diagrams
- State diagrams

ASCII diagrams are acceptable during early design.

---

# Cross References

Whenever possible, documents should reference related documents.

Example:

```
Related Standards

- OES-0002
- OES-0004
- ARCH-0001
```

Avoid duplicating information across documents.

References to a canonical Contract Specification SHOULD use its `CONTRACT-####` identifier. The first relevant mention SHOULD also include its descriptive name. When referring to the canonical document, normative and related documents SHOULD use a relative Markdown link.

The link path follows the canonical directory established by repository-structure governance. This standard does not establish that directory or define Contract aliases.

---

# Source of Truth

Every topic should have exactly one authoritative document.

Examples:

Contracts

→ OES-0004

Providers

→ OES-0006

Flows

→ FLOW Specifications

If conflicts exist, the authoritative document prevails.

---

# Review Process

Every major document should follow this lifecycle.

```
Draft

↓

Review

↓

Approved

↓

Active
```

Major changes require another review cycle.

---

# Documentation Reviews

Documentation reviews should verify:

- Technical accuracy
- Consistency
- Completeness
- Broken references
- Formatting
- Naming
- Version metadata

Reviews should be recorded as REVIEW documents.

---

# AI Collaboration

AI-generated documentation must be reviewed before becoming Active.

AI may assist in:

- Draft creation
- Formatting
- Grammar
- Consistency checks
- Cross-reference validation

Humans remain responsible for approval.

---

# Anti-Patterns

Avoid:

- Duplicate documents
- Multiple sources of truth
- Outdated examples
- Broken links
- Inconsistent terminology
- Unversioned specifications
- Empty Active documents

---

# Definition of Done

Documentation is complete when:

- ✔ Header present
- ✔ Version assigned
- ✔ Status defined
- ✔ Purpose documented
- ✔ Scope documented
- ✔ Related documents listed
- ✔ Reviewed
- ✔ Approved
- ✔ Markdown validated

---

# Related Standards

- OES-0000 — Engineering Philosophy
- OES-0001 — Repository Structure
- [OES-0004 — Contracts](OES-0004-Contracts.md)
- [OES-0010 — Versioning Standards](OES-0010-Versioning-Standards.md)
- [DOCUMENT-AUTHORITY — Documentation Authority](../DOCUMENT-AUTHORITY.md)

---

# Change History

| Version | Date       | Description |
| ------- | ---------- | ----------- |
| 1.2.0   | 2026-08-10 | Added canonical Contract Specification identifiers, filenames, titles, uniqueness, metadata specialization, lifecycle integration, and cross-reference conventions. |

---

# Engineering Motto

> Great software is built twice: first in documentation, then in code.
