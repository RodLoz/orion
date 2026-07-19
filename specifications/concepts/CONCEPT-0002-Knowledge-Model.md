# CONCEPT-0002 — Knowledge Model

| Field | Value |
|--------|--------|
| **Status** | Draft |
| **Version** | 1.0.0 |
| **Owner** | Project Maintainers |
| **Created** | 2026-07-11 |
| **Updated** | 2026-07-11 |
| **Applies To** | Entire Platform |

---

# Purpose

This specification defines the conceptual knowledge model of O.R.I.O.N.

Knowledge represents structured information that the platform considers reliable enough to support reasoning, planning, and decision-making.

Unlike Memory, which records experiences, Knowledge represents validated understanding.

---

# Definition

Knowledge is structured information that O.R.I.O.N. accepts as true, reliable, or sufficiently verified for decision-making.

Knowledge may originate from multiple sources but must always carry metadata describing its origin, confidence, and validity.

Knowledge is not:

- user memory;
- conversation history;
- temporary context;
- provider output by default.

---

# Knowledge Principles

Knowledge must be:

- Verifiable
- Traceable
- Explainable
- Versioned
- Reviewable
- Updatable

Knowledge should evolve as better information becomes available.

---

# Knowledge Taxonomy

Knowledge is classified into five categories.

```
Knowledge
│
├── Built-in Knowledge
├── Learned Knowledge
├── Verified Knowledge
├── Imported Knowledge
└── Generated Knowledge
```

---

# Built-in Knowledge

Knowledge distributed with the platform.

Examples:

- Architecture definitions
- Engineering Standards
- Contracts
- Platform capabilities

---

# Learned Knowledge

Knowledge acquired through repeated interaction or observation.

Learned Knowledge requires validation before becoming authoritative.

---

# Verified Knowledge

Knowledge confirmed through trusted sources.

Examples:

- Official documentation
- Standards
- Approved repositories
- Verified APIs

Verified Knowledge has the highest confidence level.

---

# Imported Knowledge

Knowledge synchronized from external systems.

Examples:

- GitHub Wiki
- Confluence
- Jira
- IBM Sterling documentation

Imported Knowledge retains its source metadata.

---

# Generated Knowledge

Knowledge inferred through reasoning or analysis.

Generated Knowledge must record:

- inference method;
- supporting evidence;
- confidence score.

Generated Knowledge should remain distinguishable from Verified Knowledge.

---

# Knowledge Lifecycle

```
Observed

↓

Candidate

↓

Validated

↓

Stored

↓

Referenced

↓

Updated

↓

Deprecated

↓

Archived
```

---

# Confidence

Every knowledge item should expose a confidence level.

Suggested levels:

- Verified
- High
- Medium
- Low
- Unknown

Confidence influences reasoning but does not replace human judgment.

---

# Traceability

Every knowledge item should record:

- origin;
- author (if applicable);
- creation date;
- last validation;
- confidence;
- related concepts.

---

# Relationships

Knowledge interacts with:

- Memory
- Context
- Reasoning
- Planning

Knowledge provides stable facts.

Reasoning combines facts with memories and current context.

---

# User Knowledge

User-specific information should normally be stored as Memory rather than Knowledge unless it becomes a validated platform fact.

---

# Constraints

Knowledge must never silently overwrite Memory.

Knowledge should remain independent from any specific AI provider.

---

# Anti-Patterns

Avoid:

- treating every LLM response as knowledge;
- mixing memory with facts;
- removing provenance;
- storing unverifiable claims as verified knowledge.

---

# Future Evolution

Future versions may support:

- knowledge graphs;
- semantic linking;
- ontology support;
- confidence propagation;
- contradiction detection.

---

# Related Documents

- CONCEPT-0001 — Memory Model
- CONCEPT-0003 — Context Model
- ADR-0005 — Memory Architecture Principles

---

# Engineering Motto

> Knowledge is not what O.R.I.O.N. hears. Knowledge is what O.R.I.O.N. can justify.