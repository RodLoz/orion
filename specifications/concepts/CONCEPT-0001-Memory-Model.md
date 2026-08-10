# CONCEPT-0001 — Memory Model

| Field | Value |
|--------|--------|
| **Status** | Active |
| **Version** | 2.4.0 |
| **Owner** | Project Maintainers |
| **Created** | 2026-07-11 |
| **Updated** | 2026-08-10 |
| **Applies To** | Entire Platform |

---

# Purpose

This specification defines the conceptual memory model of O.R.I.O.N.

Memory is treated as a first-class cognitive capability rather than a persistence mechanism.

Its purpose is to provide continuity, personalization, explainability, and long-term intelligence while preserving user control, privacy, and architectural consistency.

---

# Definition

Memory is the structured representation of experience and user continuity that O.R.I.O.N. intentionally retains in order to improve future reasoning, planning, personalization, and execution.

Memory answers:

> **"What have I experienced?"**

Memory is not:

- a database;
- a cache;
- conversation history;
- an AI provider context window.

Memory is a managed cognitive resource.

Memory is not a generic synonym for persistent information or Knowledge. Its boundary is determined by semantic role and authority, not persistence.

Memory is governed exclusively by the Memory Engine.

---

# Design Principles

The Memory Model follows these principles.

- Intentionality
- Explainability
- User Ownership
- Selective Retention
- Context Awareness
- Privacy by Design
- Evolution over Accumulation

The objective is not to remember everything.

The objective is to remember what matters.

---

# Memory Taxonomy

O.R.I.O.N. classifies Memory into three canonical categories.

```
Memory
│
├── Episodic Memory
├── Preference Memory
└── Assertion Memory
```

Each category has different responsibilities, retention policies, and retrieval strategies.

---

# Episodic Memory

## Purpose

Stores experiences.

Represents things that happened.

Examples:

- user interactions
- completed tasks
- important conversations
- project milestones
- intentionally retained historical system events

## Lifetime

Long-term.

May be summarized over time.

## Owner

Memory Engine.

---

# Preference Memory

## Purpose

Stores user preferences.

Examples:

- preferred language
- preferred voice
- preferred coding style
- preferred documentation language
- preferred notification schedule

Preferences may evolve.

Preference history may be retained.

---

# Assertion Memory

## Purpose

Stores provenance that an assertion or interaction occurred without treating the asserted claim as accepted Knowledge.

Examples:

- a user stated their profession
- a user identified a preferred location
- an authorized source asserted a relationship

A validated claim may exist separately as Knowledge. A Memory item and Knowledge item may reference the same real-world subject, but they must not represent the same semantic claim.

Memory may own the retained Memory representation as cognitive material while preserving attribution to the qualified issuing source or applicable domain capability for the underlying source-derived assertion. Retention and later retrieval do not make Memory the issuing source or transfer source semantics, authority origin, authority-verification ownership, or domain ownership to Memory. Storage location does not determine semantic ownership, and a Provider does not become authoritative or acquire issuing-source identity merely because it supplied, conveyed, hosted, transported, or exposed an observation. Original attribution remains identifiable through retention and later retrieval.

Memory may retain evidence that, at a historical point, a source was authoritative, authority verification occurred, authorization applied, a source or reference was current, incorporation occurred, a failure occurred, or a Brain or other capability result existed. Retention or retrievability does not recreate or renew present authority, authority verification, present authorization, Source Currentness, Contextual Currentness, incorporation, a new failure, a new Brain result, or any other new architectural act. Historical authority and authorization remain distinct from present authority and authorization; historical fact remains distinct from present applicability and action.

Retained historical evidence remains distinct from Logical Reconstruction, Exact Replay, present source retrieval, Context recollection, and Context incorporation.

---

# Boundary with Knowledge and Context

The following classification rules apply.

- Working Memory, when referring to temporary reasoning or session state, belongs to Context.
- Semantic Memory, when referring to accepted facts or truths, belongs to Knowledge.
- Procedural Memory, when referring to general or validated procedures, belongs to Knowledge.
- Current operational or system state belongs to Context.
- Stable platform definitions and capability definitions belong to Knowledge.
- Current capability availability belongs to Context.
- An intentionally retained historical system event belongs to Memory.
- Platform Knowledge belongs to Knowledge.
- Personal information representing a retained assertion or experience belongs to Memory; an accepted or validated claim belongs to Knowledge.
- The experience of executing a procedure may be intentionally retained as Memory; the validated procedure itself belongs to Knowledge.

Context may select or project relevant Memory and Knowledge but does not reclassify them or assume durable ownership.

Memory may provide evidence or provenance for a claim, but the Memory capability cannot promote information into Knowledge by itself. Only the Knowledge capability governs whether a claim becomes accepted Knowledge.

A retained Context Snapshot or other retained Context operational evidence remains Context-owned historical operational evidence. A Snapshot is one possible retained representation, not an architecturally mandatory or inherently sufficient one. Storage, persistence, retention, or availability through Memory-related storage does not reclassify that evidence as cognitive Memory or transfer Context Revision identity, lifecycle, reconstruction, or Exact Replay ownership to Memory.

Retention, persistence, Memory retrieval, and historical reproduction are not by themselves Logical Reconstruction or Exact Replay and do not establish evidence sufficiency for either. Logical Reconstruction retains its governing meaning as construction of a distinct, logically equivalent Context Revision from the required authoritative, version-identifiable source revisions and other required authoritative evidence. Exact Replay retains its governing meaning as exact reproduction of the Context Revision consumed by an identified reasoning cycle from sufficient retained immutable evidence; logical equivalence alone is insufficient, and Exact Replay does not reenact the surrounding execution.

Current source state and present policy or configuration MUST NOT substitute for required historical evidence. Consistent with the historical-applicability boundary above, retaining or retrieving historical evidence does not renew authority, authority verification, authorization, Source Currentness, Contextual Currentness, incorporation, failure production, or Brain execution.

---

# Memory Lifecycle

Every memory progresses through the following lifecycle.

```
Observation

↓

Candidate

↓

Validation

↓

Stored

↓

Retrieved

↓

Updated

↓

Archived

↓

Deleted
```

Only candidate Memory material that satisfies Memory-owned admission and retention criteria becomes retained Memory. This Memory admission and retention validation operates only within Memory's semantic boundary and MUST NOT establish or replace source authority or authority verification, perform or replace Security authorization, establish Knowledge acceptance, perform Context validation or incorporation, or establish Source Currentness or Contextual Currentness. Passing this validation means only that the material is eligible to become retained Memory; it does not mean that its source is presently authoritative, its authority was newly verified, it is presently authorized, it is accepted Knowledge, it is incorporated into Context, or it is contextually current. Memory ownership of the retained representation remains distinct from source or domain ownership of the underlying assertion or observation, and retained historical provenance remains historical evidence rather than a recreated present act.

---

# Memory Quality

Every stored memory should maximize:

- relevance
- confidence
- usefulness
- explainability

Low-quality memories should expire naturally.

---

# Retrieval Model

Memory retrieval may consider the purpose for which retained experience is requested. This context-sensitive retrieval does not assign Contextual Currentness or incorporation ownership to Memory.

When Memory participates as a source during Context preparation, Context owns retrieval initiation, retrieval-request semantics, aggregate returned-set semantics, Contextual Currentness, and incorporation decisions. Memory owns interpretation of a valid Memory-directed retrieval request, execution of Memory retrieval, the semantics of Memory-owned returned material, and Memory source-result semantics. Neither participation nor retrieval transfers those responsibilities.

The Memory Engine should retrieve only relevant memories whose participation is permitted by the applicable Security-owned authorization decision and protected-boundary enforcement, and only memories useful for the current objective. Security retains authorization semantics and authorization decisions; Memory does not acquire authorization ownership by returning permitted material.

A Memory-owned result made available to Context is a candidate for consideration, not an incorporated reference. Availability does not establish Contextual Currentness, create or activate a Context Revision, transfer Memory semantic ownership to Context, or give Memory ownership of Context retrieval-request semantics or incorporation. Security authorization does not create Memory semantic ownership.

Memory-specific retention age, recency, last use, retrieval relevance, and usefulness remain distinct from Source Currentness and Contextual Currentness.

The platform must never load the complete memory indiscriminately.

---

# Relationships

Memory interacts with several concepts.

```
Memory-owned output ───────────┐
Knowledge-owned output ────────┼──► Brain-owned outer orchestration and final-result assembly
One authoritative Context output ─┘
                                      │
                              Reasoning activity
```

Memory, Knowledge, and Context remain separately owned cognitive capabilities. Memory may contribute authoritative Memory-owned experience where accepted by the architecture, Knowledge may contribute authoritative Knowledge-owned information where accepted by the architecture, and Context retains ownership of Context preparation, Context Revision identity and lifecycle, and one authoritative Context output.

Brain owns outer cognitive orchestration, final cognitive result assembly, the architectural meaning of that result, and final-result ownership. Reasoning remains a cognitive activity and is not the architectural owner of outer orchestration or final-result assembly.

Contribution to Brain does not transfer ownership of an authoritative output. Brain does not become Memory, Knowledge, or Context; acquire their semantic ownership; acquire Context Revision ownership; or maintain a parallel Context candidate or evidence boundary. Where Context is the accepted owner, Brain MUST NOT substitute raw Memory, Knowledge, or source material for the authoritative Context output, and Memory output is not equivalent to that Context output.

Failure ownership follows the architectural responsibility whose semantic boundary failed. A failure is Memory-owned only when a Memory-owned responsibility fails, including Memory admission or retention, Memory-owned retrieval interpretation or execution, retained-record semantics, or an existing Memory lifecycle responsibility. Source, Security, enforcement, Context, Brain, Bootstrap, transport, Provider, Adapter, and other capability failures retain their originating ownership.

Observation, storage, retention, persistence, retrieval, delivery, logging, representation, aggregation, consumption, communication, or propagation MUST NOT transfer originating failure ownership or semantic identity. Memory may own a distinct Memory-specific consequence when one of its responsibilities is affected, and Context may own a distinct candidate Context Revision consequence, without either acquiring the originating failure.

Retaining historical evidence of a failure does not create a new failure, and retrieving that evidence does not recreate the failure as a present act. Historical failure evidence remains historical evidence.

A Brain-owned downstream final-result consequence does not transfer originating failure ownership. Transport or presentation does not acquire final-result semantic ownership.

---

# Explainability

Every memory should answer:

- Why do I exist?
- When was I created?
- Who created me?
- How confident is the platform?
- When was I last used?
- Why was I retrieved?

Explainability is a mandatory property.

---

# User Ownership

Users own their personal memories.

Users must be able to:

- inspect;
- search;
- edit;
- export;
- delete.

The platform should never permanently retain user memories against explicit user intent unless required by applicable law.

---

# Constraints

Memory must not become:

- an unrestricted log;
- hidden state;
- implicit behavior;
- vendor-specific storage.

Memory is governed exclusively by the Memory Engine.

---

# Anti-Patterns

Avoid:

- treating conversation history as memory;
- storing duplicate memories;
- remembering every interaction;
- storing information without confidence;
- bypassing the Memory Engine;
- exposing internal memory structures to Skills.

---

# Future Evolution

Future versions may introduce:

- confidence scores;
- memory aging;
- automatic summarization;
- memory graphs;
- semantic clustering;
- long-term compression;
- federated memory;
- encrypted personal vaults.

These capabilities extend the model without changing its fundamental principles.

---

# Related Documents

## Governing Architecture Decisions

- [ADR-0005 — Memory Architecture Principles](<../../docs/adr/ADR-0005 — Memory Architecture Principles>)
- [ADR-0008 — Context Collaboration, Source Ownership, and Reference Authority](../../docs/adr/ADR-0008-Context-Collaboration-Source-Ownership-and-Reference-Authority.md)
- [ADR-0010 — Context Retrieval Initiation, Request, and Result Semantics](../../docs/adr/ADR-0010-Context-Retrieval-Initiation-Request-and-Result-Semantics.md)
- [ADR-0011 — Source Currentness, Contextual Currentness, and Currentness Change](../../docs/adr/ADR-0011-Source-Currentness-Contextual-Currentness-and-Currentness-Change.md)
- [ADR-0012 — Authorization Semantics, Enforcement, and Authorized-Reference Applicability](../../docs/adr/ADR-0012-Authorization-Semantics-Enforcement-and-Authorized-Reference-Applicability.md)
- [ADR-0013 — Failure Ownership, Propagation, and Candidate Context Revision Consequences](../../docs/adr/ADR-0013-Failure-Ownership-Propagation-and-Candidate-Context-Revision-Consequences.md)
- [ADR-0015 — Brain Cognitive-Reference Orchestration and Final Cognitive Result Boundaries](../../docs/adr/ADR-0015-Brain-Cognitive-Reference-Orchestration-and-Final-Cognitive-Result-Boundaries.md)
- [ADR-0016 — Persistence, Logical Reconstruction, Exact Replay, and Historical Reproduction Boundaries](../../docs/adr/ADR-0016-Persistence-Logical-Reconstruction-Exact-Replay-and-Historical-Reproduction-Boundaries.md)
- [ADR-0018 — Refresh, Recollection, and Repeated Context Preparation Boundaries](../../docs/adr/ADR-0018-Refresh-Recollection-and-Repeated-Context-Preparation-Boundaries.md)

## Concept Specifications

- [CONCEPT-0002 — Knowledge Model](CONCEPT-0002-Knowledge-Model.md)
- [CONCEPT-0003 — Context Model](CONCEPT-0003-Context-Model.md)

## Governance and Engineering Standards

- [Documentation Authority](../../docs/DOCUMENT-AUTHORITY.md)
- [OES-0008 — Documentation Standards](../../docs/engineering/OES-0008-Documentation-Standards.md)
- [OES-0009 — Security Standards](../../docs/engineering/OES-0009-Security-Standards.md)
- [OES-0010 — Versioning Standards](../../docs/engineering/OES-0010-Versioning-Standards.md)

CONCEPT-0001 remains Active and authoritative within its Memory conceptual scope. Applicable Active ADRs specialize and constrain this Concept where Memory participates in their governed architectural boundaries, and the applicable Active ADR governs any conflict. CONCEPT-0003 remains a peer Concept specification within the Context conceptual scope; neither Concept supersedes the other. Archived DECISION-0001 is not governing authority.

# Change History

| Version | Date       | Status | Change |
| ------- | ---------- | ------ | ------ |
| 2.3.0   | 2026-07-19 | Active | Existing Active Memory Model baseline before alignment with the Active Context ADR chain. |
| 2.4.0   | 2026-08-10 | Active | Aligned Memory Model with Active ADR boundaries for retrieval, authorization, currentness, historical evidence, source attribution, Memory admission validation, reconstruction/replay, Brain orchestration, failure ownership, and authority precedence. |

---

# Engineering Motto

> Memory preserves meaningful experience so intelligence can evolve over time.
