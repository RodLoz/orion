# CONCEPT-0002 — Knowledge Model

| Field | Value |
|--------|--------|
| **Status** | Active |
| **Version** | 2.3.0 |
| **Owner** | Project Maintainers |
| **Created** | 2026-07-11 |
| **Updated** | 2026-07-19 |
| **Applies To** | Entire Platform |

---

# Purpose

This specification defines the conceptual knowledge model of O.R.I.O.N.

Knowledge represents justified claims that the platform accepts as sufficiently true to support reasoning, planning, and decision-making.

Unlike Memory, which records experiences, Knowledge represents validated understanding.

---

# Definition

Knowledge is structured information that O.R.I.O.N. accepts as sufficiently true for use.

Knowledge answers:

> **"What is accepted as true?"**

Knowledge may originate from multiple sources but must always preserve provenance and validation state.

Knowledge is not:

- user memory;
- conversation history;
- temporary context;
- provider output by default.

Knowledge includes:

- validated facts;
- domain knowledge;
- validated procedures;
- stable platform definitions.

Its boundary from Memory and Context is determined by semantic role and authority, not persistence.

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

# Ownership and Authority

Knowledge is an independent platform capability.

The Knowledge Engine is the single architectural owner of the Knowledge capability.

The Knowledge Engine owns Knowledge domain behavior and governs:

- acceptance of claims as Knowledge;
- validation state;
- provenance requirements;
- Knowledge lifecycle semantics;
- Knowledge version semantics;
- contradiction resolution within the Knowledge domain;
- Knowledge Contracts;
- Knowledge references or projections provided to Context.

The Knowledge Engine does not own storage technology.

The Knowledge Engine does not own Memory or Context and does not perform Reasoning or Planning.

The Core may define or custody shared Knowledge Contracts, schemas, identifiers, and domain types according to existing Core ownership rules. Core custody does not transfer Knowledge behavior or acceptance authority to the Core.

Providers may support Knowledge persistence, retrieval, indexing, validation, or enrichment through architectural Contracts. Providers do not determine what is accepted as Knowledge.

Adapters may supply information from external ecosystems. Imported information does not become Knowledge automatically.

Reasoning may propose claims. Memory may provide evidence or provenance. Adapters and Providers may provide external observations. Only the Knowledge capability governs whether a claim becomes accepted Knowledge.

Semantic ownership remains with the Knowledge Engine independently of physical persistence.

---

# Knowledge Classification

Knowledge may be described using the following provenance and validation classifications.

These classifications are not mutually exclusive semantic categories. An imported or generated claim becomes Knowledge only after the platform accepts it as sufficiently true.

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

Claims acquired through repeated interaction or observation.

Learned claims require validation before becoming Knowledge.

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

Claims synchronized from external systems and accepted as sufficiently true for use.

Examples:

- GitHub Wiki
- Confluence
- Jira
- IBM Sterling documentation

Imported Knowledge retains its source metadata.

---

# Generated Knowledge

Claims inferred through reasoning or analysis and accepted as sufficiently true for use.

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

A user assertion is initially represented as Memory provenance that the assertion occurred.

If the asserted claim is validated and accepted as sufficiently true, the claim may exist separately as Knowledge.

The Memory item and Knowledge item may reference the same real-world subject, but they must not represent the same semantic claim.

User preferences remain Memory because they preserve user continuity rather than asserting general truth.

---

# Constraints

Knowledge must never silently overwrite Memory.

Knowledge must not silently reclassify Memory.

Context may consume Knowledge references or projections but must not govern, mutate, validate, or reclassify Knowledge.

When reproducibility is required, a Context reference may identify a Knowledge source revision. That reference does not transfer ownership of the underlying Knowledge to Context.

General or validated procedures belong to Knowledge. The experience of executing a procedure may be intentionally retained separately as Memory.

Stable platform definitions, including capability definitions, may be Knowledge. Current capability availability and current operational or system state belong to Context.

Verified external facts belong to Knowledge and retain their external provenance and validation state.

External information must pass through Knowledge governance before it is accepted as Knowledge, regardless of whether it originated from a Provider or Adapter.

Knowledge should remain independent from any specific AI provider.

---

# Anti-Patterns

Avoid:

- treating every LLM response as knowledge;
- conflating Memory provenance with accepted claims;
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
