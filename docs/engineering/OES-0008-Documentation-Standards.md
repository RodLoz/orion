# OES-0008 — Documentation Standards

| Field | Value |
|--------|--------|
| **Status** | Active |
| **Version** | 1.0.0 |
| **Owner** | Project Maintainers |
| **Created** | 2026-07-10 |
| **Updated** | 2026-07-10 |
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
- OES-0010 — Versioning Standards

---

# Engineering Motto

> Great software is built twice: first in documentation, then in code.