# CONCEPT-0002 — Knowledge Model

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

This specification defines the conceptual knowledge model of O.R.I.O.N.

Knowledge represents justified claims that the platform accepts as sufficiently true to support reasoning, planning, and decision-making.

Unlike Memory, which records experiences, Knowledge represents Knowledge-domain validated understanding.

---

# Definition

Knowledge is structured information that O.R.I.O.N. accepts as sufficiently true for use.

Knowledge answers:

> **"What is accepted as true?"**

Source-derived material considered for Knowledge may be associated with multiple sources, but the applicable qualified issuing source or domain capability remains its architectural origin and retains its source and reference semantics, authority origin, and applicable authority-verification ownership. Knowledge must preserve that attribution, provenance, and Knowledge-domain validation state.

Knowledge is not:

- user memory;
- conversation history;
- temporary context;
- provider output by default.

Knowledge includes:

- Knowledge-domain validated facts;
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
- Knowledge-domain validation state;
- provenance requirements;
- Knowledge lifecycle semantics;
- Knowledge version semantics;
- contradiction resolution within the Knowledge domain;
- Knowledge Contracts;
- Knowledge references or projections provided to Context.

The Knowledge Engine does not own storage technology.

The Knowledge Engine does not own Memory or Context and does not perform Reasoning or Planning.

The Core may define or custody shared Knowledge Contracts, schemas, identifiers, and domain types according to existing Core ownership rules. Core custody does not transfer Knowledge behavior or acceptance authority to the Core.

Providers may support Knowledge persistence, retrieval, indexing, Knowledge-domain validation, or enrichment through architectural Contracts. Such support does not give a Provider Knowledge acceptance or source-authority-verification ownership; Providers do not determine what is accepted as Knowledge.

Adapters may supply information from external ecosystems. Imported information does not become Knowledge automatically.

Reasoning may propose claims. Memory may provide evidence or provenance. Adapters and Providers may provide external observations. Only the Knowledge capability governs whether a claim becomes accepted Knowledge.

Semantic ownership remains with the Knowledge Engine independently of physical persistence.

A Provider or Adapter may supply, convey, expose, host, index, transform, transport, present, or support Knowledge-domain processing without thereby becoming the semantic or domain owner, issuing source, authority origin, authority verifier, or Knowledge acceptance owner. Provider or Adapter support for Knowledge-domain validation neither performs nor replaces source-authority verification or Knowledge acceptance. Infrastructure placement and storage location do not determine source identity, domain ownership, or authority origin.

Knowledge may own an accepted Knowledge representation while preserving the underlying qualified-source or domain attribution and semantics. Storage, acceptance, versioning, and retrieval do not make Knowledge the issuing source or transfer source authority or authority-verification ownership to Knowledge.

The Knowledge capability owns acceptance of a claim into Knowledge and the Knowledge-domain validation used to determine whether candidate material is eligible to become or remain accepted Knowledge. Successful acceptance means only that the claim is accepted within the Knowledge semantic boundary; it does not transfer ownership of the underlying source or domain semantics to Knowledge.

Knowledge acceptance and Knowledge-domain validation MUST remain distinct from source authority, source- or issuer-owned authority verification, Security authorization, Source Currentness, Contextual Currentness, Context validation, and Context incorporation. Neither act creates source authority, mints authority origin, performs or replaces authority verification or Security authorization, establishes either form of currentness, performs Context validation or incorporation, or creates or activates a Context Revision. Source-authority verification, Security authorization, Context validation, and Context incorporation do not by themselves constitute Knowledge acceptance.

When Knowledge participates as a source during Context preparation, Context owns retrieval initiation, retrieval-request semantics, aggregate returned-set semantics across participating sources, Contextual Currentness, incorporation decisions, and candidate Context Revision preparation where applicable. Knowledge owns interpretation of a valid Knowledge-directed retrieval request within its semantic boundary, Knowledge retrieval execution, the semantics of Knowledge-owned returned material, Knowledge source-result semantics, and its accepted source lifecycle responsibilities. Neither participation nor retrieval transfers those responsibilities.

Knowledge-owned returned material made available to Context is candidate material for consideration, not a new Knowledge classification or an incorporated reference. Candidate availability MUST NOT itself constitute Context incorporation; establish Source Currentness, Contextual Currentness, or Security authorization; perform authority verification or Context validation; create or activate a Context Revision; or transfer Knowledge semantic ownership to Context. Successful retrieval and candidate availability do not prove authorization. Source Currentness remains with the applicable issuing-source or source-lifecycle boundary, while Context determines Contextual Currentness.

Context owns only the aggregate returned-set semantics and does not acquire Knowledge source semantics by aggregating a Knowledge result. Knowledge owns only its returned-material and source-result semantics and does not acquire aggregate-set ownership through participation. Retrieval, aggregation, and later Context incorporation do not mint or transfer authority or transfer Knowledge semantic ownership. Knowledge retrieval execution does not confer Context ownership on Knowledge, and Knowledge does not own Context Revision identity or lifecycle.

Security owns authorization semantics and decisions, and applicable protected boundaries retain enforcement responsibility. Knowledge retrieval does not independently establish authorization.

---

# Knowledge Classification

Knowledge may be described using the following provenance and Knowledge-domain validation classifications.

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

Learned claims require Knowledge-domain validation before becoming Knowledge.

---

# Verified Knowledge

Knowledge accepted within the Knowledge semantic boundary using confirmation attributed to qualified trusted sources.

Verified Knowledge is a Knowledge classification within the Knowledge capability. Its classification and acceptance state do not make Knowledge the owner of source-authority verification or transfer issuer or source authority or verification ownership to Knowledge. Source-authority verification remains governed by the applicable source or issuer boundary, and source-authority verification alone does not constitute Knowledge acceptance.

Remaining in the Verified Knowledge classification does not by itself establish present Source Currentness or Contextual Currentness.

Examples:

- Official documentation
- Standards
- Approved repositories
- Verified APIs

Verified Knowledge has the highest confidence level. This is an internal Knowledge classification and metadata relationship only; it does not establish highest source authority, authority precedence, present currentness, authorization, Context incorporation, or mandatory selection by Brain or Context.

---

# Imported Knowledge

Claims synchronized from external systems and accepted as sufficiently true for use.

Examples:

- GitHub Wiki
- Confluence
- Jira
- IBM Sterling documentation

Imported Knowledge retains its source metadata.

Imported Knowledge preserves both the provenance of how material entered the platform, including applicable Provider or Adapter involvement, and the independently attributable qualified issuing source or domain capability. Import or provisioning provenance does not replace source identity, source semantics, authority origin, authority verification, or Knowledge acceptance.

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

Each Knowledge version has its own stable historical identity. A later version, replacement, or supersession relationship does not mutate an earlier version or erase its provenance, qualified-source attribution, Knowledge-domain validation and acceptance history, confidence history, or historical existence. It also does not retroactively rewrite earlier accepted Knowledge history, Memory provenance, or Context Revision evidence boundaries.

Version identity is distinct from Source Currentness, Contextual Currentness, authority, authority verification, authorization, confidence, and Context incorporation. A newer, superseding, deprecated, or archived status does not by itself establish present applicability or currentness. Supersession is a relationship between Knowledge versions, not an additional lifecycle state. Deprecated, superseded, or archived Knowledge may remain historically attributable evidence where appropriate without becoming presently applicable merely because it is retained.

A later Knowledge version, replacement, lifecycle change, or currentness change MUST NOT mutate a stable candidate, Active, or historical Context Revision or reopen a closed incorporated-reference set. It does not automatically create a Context Revision or successor, perform Context incorporation or validation, activate a revision, or trigger Brain execution. Changed Knowledge may become candidate material only for later Context-owned preparation, where any incorporation is a new Context-owned decision for the applicable candidate Context Revision. Earlier Context Revisions retain the Knowledge evidence and version boundary that applied when they were prepared.

Persistence preserves the applicable Knowledge artifact or version and its historical identity. It does not create a Context Revision, successor, or reconstructed revision; perform Context incorporation or validation; or initiate Brain execution. Persistence does not recreate or renew source authority, authority verification, Security authorization, Source Currentness, Contextual Currentness, Context incorporation, failure production, or Brain execution. Storage location does not determine semantic ownership or authority, and Knowledge ownership of an accepted representation remains distinct from preserved qualified-source or domain attribution.

Retained historical Knowledge may serve as historical evidence where relevant, but retention does not make it present authority, newly verified authority, present authorization, present Source Currentness or Contextual Currentness, new Context incorporation, a new failure, a new Brain result, or another new architectural act. Historical fact remains distinct from present applicability.

Persistence, retention, Knowledge retrieval, and retrieval of current, archived, or superseded Knowledge are not by themselves Logical Reconstruction or Exact Replay and do not establish evidence sufficiency for either. Logical Reconstruction retains its governing meaning as construction of a distinct, logically equivalent Context Revision from the required authoritative, version-identifiable source revisions and other required authoritative evidence. Exact Replay retains its governing meaning as exact reproduction of the Context Revision consumed by an identified reasoning cycle from sufficient retained immutable evidence; logical equivalence alone is insufficient, and Exact Replay does not reenact the surrounding execution.

A retained Knowledge version may contribute required historical evidence only when the applicable architectural evidence requirements are satisfied. Present Knowledge, current source state, and present configurable policy MUST NOT substitute for the historically required Knowledge or source revision and other required historical evidence. Knowledge retention or retrieval does not reopen, reactivate, replace, or mutate the original Context Revision.

Historical reproduction remains distinct from Knowledge retrieval, Logical Reconstruction, Exact Replay, and Brain execution. It does not mint authority, authority verification, authorization, currentness, incorporation, or failure ownership.

---

# Confidence

Every knowledge item should expose a confidence level.

Suggested levels:

- Verified
- High
- Medium
- Low
- Unknown

Confidence may be available as contributing Knowledge metadata to Brain-owned cognitive processing where the architecture permits, but it does not own reasoning orchestration, dictate final-result meaning, or transfer Knowledge semantic ownership to Brain.

Confidence is Knowledge-owned metadata describing a Knowledge-domain characteristic of an accepted Knowledge item. It MUST NOT establish or imply source authority, authority origin or precedence, authority verification, Security authorization, Source Currentness, Contextual Currentness, Context incorporation, retrieval ownership, selection ownership, architectural composition ownership, Brain orchestration ownership, or final cognitive result ownership.

Higher confidence does not make one source architecturally more authoritative than another. Confidence is not source priority, authority precedence, authorization, source-authority verification, currentness, incorporation, or by itself a ranking or selection rule.

If confidence later participates in relevance, ranking, selection, preference, or configurable policy, that use remains subordinate to the already accepted capability-owned decision being parameterized. Configuration or policy using confidence does not become an independent capability, semantic owner, authority owner, retrieval owner, currentness owner, incorporation owner, orchestrator, or final-result owner. Context may consider confidence only within Context-owned decisions where architecture permits; confidence does not perform Contextual Currentness or incorporation.

Knowledge acceptance, Knowledge-domain validation state, version, lifecycle status, retrievability, relevance, and confidence remain distinct from Source Currentness and Contextual Currentness. When Knowledge acts as an issuing source, Source Currentness remains within the accepted Knowledge or source lifecycle boundary. Context owns Contextual Currentness for the applicable candidate Context Revision.

A later source or Knowledge currentness change operates prospectively and MUST NOT retroactively alter retained historical provenance, accepted historical Knowledge records, or stable, Active, or historical Context Revisions. Such a change may affect only later Context-owned preparation where applicable.

---

# Traceability

Every knowledge item should record:

- origin;
- author (if applicable);
- creation date;
- last Knowledge-domain validation;
- confidence;
- related concepts.

Historical validation, confidence, acceptance, and source-state metadata record earlier Knowledge-domain conditions. They do not renew source-authority verification, present authority, present authorization, Source Currentness, or Contextual Currentness, and retrievability does not make those historical conditions presently applicable.

Failure ownership follows the architectural responsibility whose semantic boundary failed. Knowledge owns a failure only when a Knowledge-owned responsibility fails, including Knowledge acceptance, Knowledge-domain validation, Knowledge lifecycle or version responsibilities, Knowledge-owned retrieval interpretation or execution, returned-material or source-result semantics, retained-record semantics, or provenance responsibilities. Source, Security authorization, protected-boundary enforcement, Context, Brain, Memory, and Bootstrap failures retain their respective originating ownership; Provider, Adapter, transport, runtime, or infrastructure participation does not transfer it.

A failure originating elsewhere does not become Knowledge-owned because Knowledge records, retains, references, retrieves, returns, represents, communicates, propagates, or uses historical evidence of it. Observation, storage, retention, persistence, retrieval, delivery, logging, representation, aggregation, consumption, communication, and propagation MUST preserve the failure's originating ownership and semantic identity. Retaining historical failure evidence creates no new failure, and retrieving it does not recreate the failure as a present act; later Knowledge versioning, supersession, deprecation, archival, retrieval, or reproduction likewise does not transfer its historical ownership.

Knowledge may own a distinct Knowledge-specific consequence when a Knowledge-owned responsibility is affected. Context may own a distinct candidate Context Revision consequence, and Brain may own a distinct final-result consequence, without either acquiring the originating failure.

---

# Relationships

Knowledge interacts with:

- Memory
- Context
- Reasoning
- Planning

Knowledge, Memory, and Context remain independently owned cognitive capabilities. Knowledge may contribute authoritative Knowledge-owned output where accepted by the architecture, Memory may contribute authoritative Memory-owned output where accepted by the architecture, and Context retains ownership of Context preparation, Context Revision identity and lifecycle, and one authoritative Context output. Knowledge and Memory outputs are not equivalent to that Context output.

Brain owns outer cognitive orchestration, final cognitive result assembly, the architectural meaning of the final result, and final-result ownership. Reasoning remains a cognitive activity and is not the architectural owner of integration among Knowledge, Memory, and Context; outer orchestration; contributor ownership; or final-result assembly or meaning.

Contribution to Brain does not transfer semantic ownership of Knowledge, Memory, or Context outputs. Brain does not become Knowledge, Memory, or Context; acquire their semantic ownership; acquire Context Revision ownership; or maintain a parallel Context candidate or evidence boundary. Where Context owns the boundary, Brain MUST NOT substitute raw source, Knowledge, or Memory material for the authoritative Context output.

Confidence may remain contributing Knowledge metadata but does not own Brain orchestration or final-result meaning. A Brain-owned downstream final-result consequence does not transfer originating failure ownership, and transport or presentation does not acquire final-result semantic ownership.

---

# User Knowledge

A user assertion is initially represented as Memory provenance that the assertion occurred.

If the asserted claim satisfies Knowledge-domain validation and is accepted as sufficiently true, the claim may exist separately as Knowledge.

The Memory item and Knowledge item may reference the same real-world subject, but they must not represent the same semantic claim.

User preferences remain Memory because they preserve user continuity rather than asserting general truth.

---

# Constraints

Knowledge must never silently overwrite Memory.

Knowledge must not silently reclassify Memory.

Context may consume Knowledge references or projections but must not govern, mutate, validate, or reclassify Knowledge.

When reproducibility is required, a Context reference may identify the historically applicable Knowledge source revision. That revision alone does not establish evidence sufficiency; the applicable authoritative historical evidence remains required. The reference does not transfer ownership of the underlying Knowledge to Context.

General or validated procedures belong to Knowledge. The experience of executing a procedure may be intentionally retained separately as Memory.

Stable platform definitions, including capability definitions, may be Knowledge. Current capability availability and current operational or system state belong to Context.

Verified external facts belong to Knowledge and retain their external provenance and Knowledge-domain validation state.

External information must pass through Knowledge governance before it is accepted as Knowledge, regardless of whether it was supplied or conveyed through a Provider or Adapter.

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
- [ADR-0019 — Configurable Retrieval Policy Ownership Boundary](../../docs/adr/ADR-0019-Configurable-Retrieval-Policy-Ownership-Boundary.md)

## Related Concepts

- [CONCEPT-0001 — Memory Model](CONCEPT-0001-Memory-Model.md)
- [CONCEPT-0003 — Context Model](CONCEPT-0003-Context-Model.md)

## Engineering and Documentation Governance

- [Documentation Authority](../../docs/DOCUMENT-AUTHORITY.md)
- [OES-0008 — Documentation Standards](../../docs/engineering/OES-0008-Documentation-Standards.md)
- [OES-0009 — Security Standards](../../docs/engineering/OES-0009-Security-Standards.md)
- [OES-0010 — Versioning Standards](../../docs/engineering/OES-0010-Versioning-Standards.md)

CONCEPT-0002 remains Active and authoritative within its Knowledge conceptual scope. Applicable Active ADRs specialize and constrain this Concept where relevant, and the applicable Active ADR governs any conflict. CONCEPT-0001 and CONCEPT-0003 remain peer Concept specifications within their respective Memory and Context scopes; neither peer Concept supersedes CONCEPT-0002, and CONCEPT-0002 does not supersede either peer. DOCUMENT-AUTHORITY governs repository document precedence. Archived DECISION-0001 is not governing authority.

# Change History

| Version | Date       | Description |
| ------- | ---------- | ----------- |
| 2.3.0   | 2026-07-19 | Existing Active Knowledge Model baseline before alignment with the Active ADR chain. |
| 2.4.0   | 2026-08-10 | Aligned the Knowledge Model with the Active ADR ownership, authority, Context, currentness, persistence, orchestration, failure, and policy boundaries. |

---

# Engineering Motto

> Knowledge is not what O.R.I.O.N. hears. Knowledge is what O.R.I.O.N. can justify.
