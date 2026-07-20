# ENGINE-0004 — Memory Engine

| Field          | Value                                            |
| -------------- | ------------------------------------------------ |
| **Status**     | Active                                           |
| **Version**    | 1.0.0                                            |
| **Owner**      | Project Maintainers                              |
| **Created**    | 2026-07-20                                       |
| **Updated**    | 2026-07-20                                       |
| **Applies To** | Memory Engine, M3 — Memory Engine Vertical Slice |

---

## Status

This specification is Active and governs M3 implementation according to the documentation authority and status rules.

The key words **MUST**, **MUST NOT**, **SHOULD**, **SHOULD NOT**, and **MAY** describe normative requirements within this specification.

## Purpose

The Memory Engine answers:

> What have I experienced?

It is the single semantic owner of the Memory capability. It determines whether a proposed experience is admissible for intentional retention, preserves its provenance, governs its lifecycle, and exposes deterministic retrieval without becoming a generic storage service.

M3 proves the smallest complete Memory pattern by retaining, retrieving, listing, and explicitly forgetting one class of experience with a deterministic in-memory Store. It does not implement a general-purpose Memory system, cognitive retrieval, or production persistence.

## Capability Ownership

The Memory Engine owns:

- Memory classification and admissibility semantics;
- explicit retention semantics;
- Memory identity and lifecycle semantics;
- provenance requirements and validation;
- retrieval and listing semantics;
- explicit forget semantics;
- the meaning and guarantees of Memory references;
- Memory-domain failure semantics.

The Core is the canonical custodian of shared Memory Contracts, identifiers, domain types, references, Store abstractions, and failure definitions. Core custody governs shared definitions, compatibility, and versioning; it does not transfer Memory behavior to Core.

The Memory Engine implements Memory behavior behind Core-custodied Contracts. A Store implementation supplies technical retention and retrieval mechanics but does not decide what qualifies as Memory or acquire Memory semantic ownership.

The Memory Engine does not own:

- Knowledge acceptance, validation, contradiction resolution, or lifecycle;
- Context composition or relevance selection for a reasoning cycle;
- Identity, Security policy, Reasoning, Planning, or Skills;
- storage, indexing, transport, or deployment technology;
- raw conversation logs or provider context windows.

## Scope

M3 includes:

- one canonical Memory category: Episodic Memory;
- explicit retention intent for one described experience;
- validation of Memory content and provenance;
- stable Memory identity assigned through a technology-neutral boundary;
- immutable Stored Memory records;
- deterministic retrieval by Memory identity;
- explicit privacy-safe Retrieval Purpose and immutable Retrieval Receipt semantics;
- conceptual last-used time derived from the latest successful retrieval separately from the Memory Record;
- bounded deterministic listing of retained Memory references;
- explicit forgetting of a retained Memory;
- a technology-neutral Memory Store Contract;
- a deterministic in-memory Store for tests and runtime demonstration;
- runtime-safe failures, privacy-safe diagnostics, and automated tests.

M3 stands alone. It does not modify Context Engine behavior or automatically create Memory from Identity, Context, interactions, or diagnostic activity.

## Non-Goals

M3 does not define or implement:

- Preference Memory or Assertion Memory behavior;
- Semantic Memory, Procedural Memory, System Memory, or Platform Knowledge as Memory categories;
- Knowledge creation, claim validation, or promotion into Knowledge;
- Context composition, Context retrieval policy, or cognitive relevance selection;
- automatic retention, extraction, summarization, or conversation ingestion;
- Memory updates, merging, consolidation, aging, decay, archival, or migration;
- full-text or semantic search, ranking, relevance scores, or importance models;
- embeddings, vectors, graphs, LLMs, AI providers, or provider message formats;
- production databases, caches, filesystems, object stores, or persistent accounts;
- Events, Event brokers, queues, external integrations, HTTP, API, or Gateway behavior;
- production authorization, encryption, audit storage, or deployment topology.

## Core Concepts

M3 uses only the following Memory concepts.

### Memory Identity

A **Memory Identity** is one opaque, stable platform identity assigned to exactly one retained Memory item. It is not a database key, vector coordinate, content hash, provider identifier, or source reference.

### Memory Kind

M3 supports exactly one Memory Kind: **Episodic**.

Episodic Memory represents an intentionally retained account of an experience or interaction that occurred. The Kind classifies the role of the record; it does not assert that claims contained in the account are accepted as true.

### Memory Content

**Memory Content** is the immutable, bounded textual description of one experience retained by M3. Text is a narrow M3 representation rather than the permanent universal Memory format.

### Retention Intent

**Retention Intent** is an explicit request to retain a proposed experience, together with a privacy-safe reason explaining why retention was requested.

### Memory Provenance

**Memory Provenance** records how the experience proposal originated and when the represented occurrence was observed. It supports explainability without retaining raw source payloads.

### Memory Record

A **Memory Record** is the immutable domain representation of a successfully Stored Episodic Memory. It contains its Memory Identity, Kind, Content, Retention Intent, Provenance, retained-at metadata, and Stored lifecycle state.

### Memory Reference

A **Memory Reference** is an immutable, privacy-minimal pointer to a Stored Memory. It contains only:

- Memory Identity;
- Episodic Kind;
- Memory as the authoritative capability;
- Stored lifecycle state.

It contains no Memory Content, raw provenance, source reference, user data, confidence representation, or Knowledge classification. It is suitable for a future Context projection without transferring Memory ownership.

### Memory Retrieval Purpose

A **Memory Retrieval Purpose** is the explicit, immutable semantic reason for retrieving Memory Content through Get Memory.

M3 uses a small closed vocabulary so purpose cannot become arbitrary metadata or a channel for raw user information:

- **Continuity** — retrieve an experience for continuity in an approved capability flow;
- **User-Requested Recall** — retrieve an experience because recall was explicitly requested;
- **Diagnostic** — retrieve controlled non-personal fixture Memory for M3 tests or diagnostics.

These categories describe why retrieval occurs. They contain no free-form text, Memory Content, provider payload, authorization decision, or personal data. Extending the vocabulary requires an approved Contract evolution.

### Memory Retrieval Receipt

A **Memory Retrieval Receipt** is immutable explainability evidence for one successful Get Memory operation. It contains only:

- the safe Memory Reference identifying which Memory was retrieved;
- one controlled retrieval timestamp;
- one validated Memory Retrieval Purpose.

The receipt contains no Memory Content or raw Provenance by default. It is operational explainability evidence, not cognitive Memory, Knowledge, Context, an Event, or an authorization record.

## Invariants

1. Memory Engine is the single semantic owner of Memory behavior.
2. M3 retains only Episodic Memory.
3. Every retained item originates from one explicit Retention Intent.
4. No interaction, Context Revision, user message, Engine result, or Store input becomes Memory automatically.
5. Every Stored Memory has one stable, unique Memory Identity.
6. Every Stored Memory has valid immutable Content, Retention Intent, Provenance, and retained-at metadata.
7. A Memory account records that an experience or interaction occurred; it does not make claims in that account accepted Knowledge.
8. Every Get Memory request has one explicit validated Memory Retrieval Purpose.
9. Every successful Get Memory operation returns an immutable Memory Retrieval Receipt with a safe Memory Reference, retrieval timestamp, and purpose.
10. The latest successful retrieval timestamp is conceptually the Memory's last-used time and is maintained separately from the immutable Memory Record.
11. Listing is discovery of references, not retrieval of the underlying Memory Records, and MUST NOT count listed items as used.
12. Retrieval and listing MUST return immutable domain values or references and MUST NOT expose mutable Store state.
13. Listing MUST be explicitly bounded and MUST NOT indiscriminately load all Memory Content.
14. Forgetting is explicit and removes the item from the retained Memory view without mutating its Content or Provenance.
15. A forgotten Memory MUST NOT be returned by Get Memory or List Retained Memory References.
16. The Memory Store does not classify, validate, retain, retrieve, explain, or forget Memory without Memory Engine governance.
17. Malformed Store data MUST NOT become a valid Memory Record.
18. Memory operations MUST be deterministic for the same inputs, Store state, and controlled identity/time allocation state.
19. Memory references or projections do not transfer semantic ownership to Context or another consumer.

## Memory Identity

The Memory Engine assigns one Memory Identity only after receiving a valid explicit retention proposal. The Engine validates the assigned value before attempting storage.

Memory Identity allocation:

- MUST remain technology-neutral;
- MUST be deterministic under controlled M3 test inputs;
- MUST be collision-free within the M3 runtime scope;
- MUST NOT be caller-selected through Retain Memory;
- MUST NOT be reused after successful assignment during the lifetime of the M3 runtime;
- MUST NOT reveal Content, provenance, Identity information, or Store technology.

A valid M3 Memory Identity:

- MUST be an opaque primitive string without coercion;
- MUST contain from 1 through 128 Unicode code points;
- MUST NOT contain leading or trailing whitespace;
- MUST NOT be empty or whitespace-only.

M3 does not prescribe UUID, ULID, database sequence, clock-derived identity, or distributed allocation.

Memory Identities are potentially linkable operational metadata. Logs and diagnostics SHOULD omit or redact them unless an approved policy permits their use for protected correlation.

## Memory Classification

M3 admits only a proposal representing an intentionally retained experience or interaction as Episodic Memory.

Examples within M3 scope include:

- an intentionally retained summary that a user interaction occurred;
- an intentionally retained account that a task was completed;
- an intentionally retained project milestone;
- an intentionally retained historical event derived from prior operational state.

M3 MUST reject or leave outside Memory proposals whose declared role is:

- an accepted fact or validated claim;
- a general or validated procedure;
- a stable platform or capability definition;
- current operational or system state;
- temporary reasoning or session state;
- an arbitrary storage payload.

The Engine validates the declared M3 category, explicit intent, content shape, and provenance. M3 does not use an LLM or truth evaluator to infer hidden meaning from text. A caller MUST describe the proposed content as an account of an occurrence, and the Memory Engine MUST preserve that account as experience rather than reclassifying its embedded claims as Knowledge.

Preference and Assertion Memory remain canonical Foundation categories but are outside M3 behavior.

## Retention Intent

Retain Memory requires explicit intent. The request MUST contain:

- the exact operation intent to retain;
- Episodic as the proposed Memory Kind;
- one valid Memory Content value;
- one valid Retention Reason;
- one valid Provenance value.

The Retention Reason explains why the proposal should be remembered. It MUST be a primitive string, be non-empty after the approved M3 validation rules, contain no more than 512 Unicode code points, remain privacy-safe, and remain distinct from raw Memory Content. An implementation MUST reject a longer value as Invalid Retention Intent and MUST NOT silently truncate it or coerce a non-string value.

Successful validation is an explicit Memory Engine decision to retain the proposal under M3 rules. Supplying data to the Store, passing through Context, or participating in an interaction is never equivalent to Retention Intent.

M3 MUST NOT infer Retention Intent from:

- presence of a user message;
- an Active or Expired Context Revision;
- an Identity result;
- a completed Engine operation;
- repeated observations;
- data persistence elsewhere;
- a Provider or Adapter response.

M3 does not implement autonomous or confidence-inferred retention. Those behaviors require later governance and approval.

## Memory Content

M3 Memory Content is one immutable primitive text value describing one experience.

Content MUST:

- be a primitive string without coercion;
- be non-empty after applying the shared Contract's validation rules;
- contain no more than 4096 Unicode code points;
- remain unchanged after successful retention;
- contain no provider-specific message envelope, embedding, vector, or transport structure;
- be copied into the Memory domain value rather than retained as a mutable caller object.

Content exceeding 4096 Unicode code points MUST be rejected as Invalid Memory Input and MUST NOT be silently truncated.

Content validation does not establish truth. For example, retaining “the user stated X” preserves an occurrence; it does not establish X as Knowledge.

M3 text Content is intentionally narrow. Future structured or media representations require an approved Contract evolution and MUST preserve the Memory/Knowledge/Context boundary.

## Provenance

Every M3 Memory Record MUST contain immutable provenance with:

- **Source Type** — M3 uses Interaction or Capability Outcome as closed source categories;
- **Originating Capability** — one validated opaque capability identifier identifying the capability that proposed the occurrence;
- **Observed At** — one stable timestamp describing when the represented occurrence was observed;
- **Occurrence Evidence** — M3 uses Reported or Observed to describe how occurrence was supported;
- **Source Reference** — zero or one opaque source reference when required for traceability.

Originating Capability MUST be a primitive string containing from 1 through 128 Unicode code points. It MUST NOT contain leading or trailing whitespace and MUST NOT be empty or whitespace-only. M3 treats it as an opaque capability identifier, does not coerce non-string values, and does not establish a new global capability naming standard.

Source Reference is an opaque provenance pointer, not source content. When it is absent, it remains absent. When present, it MUST be a primitive string containing from 1 through 256 Unicode code points. It MUST NOT contain leading or trailing whitespace, be empty or whitespace-only, or be produced by coercing a non-string value. M3 mandates no provider-specific Source Reference syntax.

Callers MUST NOT supply credentials, authentication tokens, secrets, raw provider payloads, or other sensitive source data through Source Reference. Producers of provenance are responsible for complying with applicable Security and privacy policy before supplying the value and MUST NOT use Source Reference as a container for sensitive source data.

The Memory Engine validates only the approved structural Source Reference Contract. Structural acceptance does not certify that an opaque value is free of sensitive information. The Memory Engine MUST NOT claim to detect semantically sensitive content inside an otherwise structurally valid Source Reference unless a future approved specification defines deterministic detection rules. M3 implements no content inspection, secret scanning, Provider-specific parsing, heuristic redaction, or other heuristic semantic inspection. Future Security enforcement MAY reject a Source Reference according to approved Security policy without transferring Security semantic ownership to Memory Engine.

Occurrence Evidence qualifies confidence that the occurrence record is supported. It MUST NOT be interpreted as confidence that claims inside the Memory Content are true.

The Memory Engine owns provenance requirements and validation. The originating capability owns its underlying source information. A Store merely retains the validated provenance value and MUST NOT enrich, reinterpret, or remove it.

Provenance MUST NOT contain:

- raw provider, Adapter, Gateway, or Context payloads;
- credentials, secrets, authentication tokens, or authorization decisions;
- a complete conversation transcript;
- an Identity Resolution Reference;
- implementation-specific storage metadata.

The optional Source Reference is opaque and potentially sensitive. It MUST NOT appear in ordinary logs or diagnostics.

The retained-at timestamp is assigned through controlled M3 construction metadata after validation and is distinct from Observed At.

## Lifecycle

The authoritative Memory lifecycle from CONCEPT-0001 and ADR-0005 remains canonical:

```text
Observed
→ Candidate
→ Validated
→ Stored
→ Retrieved
→ Updated
→ Archived
→ Deleted
```

ENGINE-0004 does not redefine that lifecycle, make any stage optional, or introduce an M3-only lifecycle state or transition. The higher-authority documents do not define a concrete transition graph for skipping, entering, or leaving individual stages. M3 therefore specifies only the observable capability behavior needed by the vertical slice and does not claim a new transition path.

M3 exercises only the following authorized lifecycle semantics:

### Observed

An experience exists outside Memory. Observation alone creates no Memory Record and no Store entry.

### Candidate

An explicit Retain Memory request proposes the experience as Episodic Memory. The candidate is not yet retained and MUST NOT be returned by retrieval.

### Validated

The Memory Engine validates intent, classification, Content, Provenance, assigned identity, retained-at metadata, and applicable invariants. Validation failure creates no Stored Memory.

### Stored

After successful validation and successful Store confirmation, the Engine returns one immutable Stored Memory Record. Stored is the only retained item state exposed by M3 retrieval and listing.

### Retrieved

The authoritative lifecycle names Retrieved. For M3, Get Memory is explicitly a retrieval **operation**, not a persisted lifecycle-state transition. A successful operation returns an immutable Retrieval Receipt and updates Engine-owned retrieval-use metadata separately from the immutable Memory Record.

Retrieval MUST NOT mutate Memory Identity, Kind, Content, Provenance, Retention Intent, retained-at metadata, or Stored representation. Failed retrieval creates no receipt and does not change last-used semantics.

List Retained Memory References is a discovery operation. It does not retrieve Memory Content, does not produce per-item Retrieval Receipts, and does not mark listed Memories as used.

### Deleted

Deleted remains the canonical lifecycle term for the outcome in which Memory is no longer retained. Forget Memory is the governed capability operation that requests this outcome.

The higher-authority lifecycle does not define the concrete transition path used by an M3 implementation to reach Deleted. ENGINE-0004 therefore does not declare `Stored → Deleted`, `Retrieved → Deleted`, or any other new transition. It defines only these observable guarantees:

- successful Forget Memory causes the identified item to cease being available as retained Memory;
- subsequent Get Memory returns Memory Not Found;
- subsequent List Retained Memory References excludes the item;
- forgetting does not mutate the Memory Record, Content, Provenance, Retention Intent, or prior Retrieval Receipts;
- forgetting does not delete or modify Knowledge, Context, Identity, or another Memory;
- no deleted record or tombstone is exposed by M3.

Updated and Archived remain part of the authoritative lifecycle. M3 implements no update or archive operation and makes no claim about their transition mechanics.

Forget Memory defines semantic removal from the retained Memory view. It does not prescribe physical deletion, backup erasure, archival mechanics, storage mutation strategy, or production retention policy. Those technical concerns remain outside the conceptual lifecycle and outside M3.

## Contracts

All M3 cross-boundary interactions occur through Core-custodied Contracts. The Contracts are conceptual and technology-independent; they do not prescribe TypeScript interfaces, serialization, protocols, or storage.

The concrete bounds in this specification are normative for M3 Contract validation, technology-neutral, and implementation-independent. They are not database column definitions, Provider constraints, or permanent universal limits for every future Memory representation. Future changes require an approved specification revision, and implementations MUST NOT silently broaden or narrow these bounds.

For every bounded string field in M3, length means the number of Unicode code points, not UTF-16 code units or encoded bytes. An implementation MAY use any correct technology-neutral enforcement mechanism.

### Retain Memory Contract

| Property                          | Definition                                                                                                                                           |
| --------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Version**                       | 1.0.0                                                                                                                                                |
| **Purpose**                       | Validate and intentionally retain one Episodic Memory.                                                                                               |
| **Domain semantic owner**         | Memory Engine                                                                                                                                        |
| **Schema custodian**              | Core                                                                                                                                                 |
| **Implementation responsibility** | Memory Engine                                                                                                                                        |
| **Input**                         | Exact retention intent, Episodic Kind, bounded textual Content, Retention Reason, and provenance proposal.                                           |
| **Output**                        | One immutable Stored Memory Record.                                                                                                                  |
| **Failures**                      | Invalid Memory input, invalid retention intent or classification, invalid construction metadata, duplicate identity, Store unavailable or malformed. |
| **Guarantees**                    | No item is stored before Memory validation; successful output preserves immutable intent and provenance and is not Knowledge.                        |

### Get Memory Contract

| Property                          | Definition                                                                                                                                                   |
| --------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **Version**                       | 1.0.0                                                                                                                                                        |
| **Purpose**                       | Retrieve one retained Memory by Memory Identity.                                                                                                             |
| **Domain semantic owner**         | Memory Engine                                                                                                                                                |
| **Schema custodian**              | Core                                                                                                                                                         |
| **Implementation responsibility** | Memory Engine                                                                                                                                                |
| **Input**                         | One validated Memory Identity and one explicit validated Memory Retrieval Purpose.                                                                           |
| **Output**                        | One immutable result containing the Stored Memory Record and one immutable Memory Retrieval Receipt.                                                         |
| **Failures**                      | Invalid Memory Identity or Retrieval Purpose, Memory not found, Store unavailable, malformed Store result or invalid retrieval metadata.                     |
| **Guarantees**                    | Identifies what was retrieved, when, and why; returns only validated retained Memory; never exposes mutable Store state, forgotten data, or Knowledge state. |

The Engine creates a Retrieval Receipt only after it has validated a successful Store result and the returned Memory Record. The receipt's Memory Reference MUST identify the same Memory as the returned Record. Its retrieval timestamp comes from a controlled technology-neutral construction boundary.

For a successful Get Memory operation, the receipt timestamp is the latest successful retrieval time and therefore the Memory's conceptual last-used time at that point. Retrieval-use metadata remains separate from the immutable Memory Record and Provenance.

### List Retained Memory References Contract

| Property                          | Definition                                                                                                                        |
| --------------------------------- | --------------------------------------------------------------------------------------------------------------------------------- |
| **Version**                       | 1.0.0                                                                                                                             |
| **Purpose**                       | Inspect a bounded deterministic set of references to retained M3 Memories without loading Memory Content.                         |
| **Domain semantic owner**         | Memory Engine                                                                                                                     |
| **Schema custodian**              | Core                                                                                                                              |
| **Implementation responsibility** | Memory Engine                                                                                                                     |
| **Input**                         | One optional positive integer result limit; omission resolves to 50, and an explicit value MUST be from 1 through 100.            |
| **Output**                        | An immutable ordered collection of zero or more immutable Stored Memory References, never exceeding the requested Contract limit. |
| **Failures**                      | Invalid list request, Store unavailable, malformed Store result.                                                                  |
| **Guarantees**                    | Deterministic retention ordering; no Memory Content or raw provenance is returned; forgotten items are excluded.                  |

List Retained Memory References is a discovery operation rather than retrieval of Memory Content. It does not require a Memory Retrieval Purpose, does not create per-item Retrieval Receipts, does not update per-item last-used semantics, and MUST NOT falsely represent each listed Memory as retrieved.

The M3 list limit defaults deterministically to 50 when omitted. An explicit limit MUST be a positive integer from 1 through 100 inclusive. A non-integer or a value outside that range MUST be rejected as Invalid Memory Input.

M3 defines no query language, relevance ranking, pagination protocol, semantic filter, or search syntax. A later inspection/search milestone may evolve this Contract without converting Memory into bulk storage access.

### Forget Memory Contract

| Property                          | Definition                                                                                                                                                                                            |
| --------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Version**                       | 1.0.0                                                                                                                                                                                                 |
| **Purpose**                       | Explicitly stop retaining one Memory item.                                                                                                                                                            |
| **Domain semantic owner**         | Memory Engine                                                                                                                                                                                         |
| **Schema custodian**              | Core                                                                                                                                                                                                  |
| **Implementation responsibility** | Memory Engine                                                                                                                                                                                         |
| **Input**                         | Exact forget intent and one validated Memory Identity.                                                                                                                                                |
| **Output**                        | A privacy-minimal immutable confirmation that forgetting succeeded.                                                                                                                                   |
| **Failures**                      | Invalid request or identity, Memory not found, Store unavailable, malformed Store result.                                                                                                             |
| **Guarantees**                    | Success means the Memory has reached the canonical no-longer-retained outcome and subsequent Get and List operations no longer return it; no Content or provenance appears in the confirmation value. |

Forget Memory specifies observable capability semantics without declaring a new lifecycle state or transition path. It does not mutate Memory Content, Provenance, Retention Intent, Knowledge, or Context and does not prescribe physical deletion.

Repeated forgetting is deterministic: the first successful operation returns the immutable confirmation; a later request for the now-absent Memory returns Memory Not Found rather than reporting a second success or implying deletion of an unknown item.

### Memory Store Contract

| Property                          | Definition                                                                                                                                               |
| --------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Version**                       | 1.0.0                                                                                                                                                    |
| **Purpose**                       | Provide technical put, get, bounded-list, and delete mechanics behind Memory Engine governance.                                                          |
| **Domain semantic owner**         | Memory Engine                                                                                                                                            |
| **Schema custodian**              | Core                                                                                                                                                     |
| **Implementation responsibility** | A bootstrap-selected implementation outside Core and outside Memory domain behavior.                                                                     |
| **Input**                         | Validated immutable Store requests and values supplied by Memory Engine.                                                                                 |
| **Output**                        | Explicit technical results for stored, found/not-found, bounded listing, and deleted/not-found outcomes.                                                 |
| **Failures**                      | Store unavailable or malformed Store response.                                                                                                           |
| **Guarantees**                    | Exposes no database, filesystem, cache, vector, transport, provider, or vendor semantics; does not classify Memory or make semantic retention decisions. |

The Memory Engine MUST treat every Store response as untrusted runtime data and validate it before producing a domain result. Store success does not independently establish that an item is valid Memory.

The Store does not determine Retrieval Purpose, decide whether an operation counts as use, create explainability meaning, or calculate last-used semantics. M3 keeps the latest successful Retrieval Receipt as deterministic process-local retrieval-use metadata owned by Memory Engine. A future Store MAY expose mechanical receipt-retention operations behind a Core-custodied Contract, but those mechanics remain subordinate to Memory Engine governance and do not constitute an Event or audit system.

The M3 deterministic in-memory Store is a technical demonstration implementation. It is not a production Provider, database simulation, generic repository, or future persistence decision.

## Memory Store Boundary

The Memory Engine and Memory Store have separate responsibilities.

Memory Engine:

- decides whether a proposal is admissible as M3 Episodic Memory;
- validates and constructs immutable domain values;
- assigns Memory identity and lifecycle meaning;
- governs retrieval, listing, and forgetting semantics;
- validates Retrieval Purpose, creates immutable Retrieval Receipts, and owns last-used semantics;
- validates every Store response;
- normalizes failures at the public Memory boundary.

Memory Store implementation:

- stores an already validated immutable value;
- locates a value by opaque Memory Identity;
- returns a bounded deterministic technical listing;
- deletes a value when instructed through the Store Contract;
- reports technical outcomes without redefining them.

The Store MUST NOT:

- decide that an experience should be retained;
- infer or alter Retention Intent;
- classify an item as Episodic, Preference, Assertion, or Knowledge;
- validate truth or promote a claim into Knowledge;
- modify Content, Provenance, identity, or lifecycle semantics;
- bypass Memory Engine to expose retained data to another capability.
- decide Retrieval Purpose, explainability meaning, or whether an access counts as Memory use.

Physical persistence remains outside Memory Engine behind Contracts. M3 selects no production persistence technology.

## Relationship with Context

Memory answers:

> What have I experienced?

Context answers:

> What is relevant right now?

Memory Engine owns retained experiences and Memory references. A future Context milestone MAY obtain relevant Memory references or projections through Memory capability Contracts during Context collection or composition.

Context MUST NOT:

- own, mutate, classify, retain, or forget Memory;
- access a concrete Memory Store directly;
- automatically persist a Context Revision as Memory;
- treat a retained Context Snapshot as cognitive Memory;
- infer retention merely because Memory data was relevant to an Active Context Revision.

M3 performs no Context integration and modifies no Context Contract or behavior. The List Contract is an inspection boundary, not a relevance-selection algorithm for Context.

## Relationship with Knowledge

Memory answers:

> What have I experienced?

Knowledge answers:

> What is accepted as sufficiently true?

An M3 Memory may preserve:

> The user stated X during an interaction.

It MUST NOT represent the distinct Knowledge claim:

> X is accepted as sufficiently true.

Memory may later provide evidence or provenance to Knowledge through an approved Contract. Only Knowledge Engine may govern claim acceptance, validation state, contradiction resolution, provenance requirements for Knowledge, and Knowledge lifecycle/version semantics.

Memory Engine MUST NOT:

- promote Memory Content into Knowledge;
- mark an embedded claim as validated or verified;
- resolve Knowledge contradictions;
- represent general procedures or platform definitions as M3 Memory;
- treat Store persistence or repeated retrieval as evidence of truth.

A future Memory item and Knowledge item may concern the same real-world subject, but they MUST NOT represent the same semantic claim.

## User Control

M3 includes Forget Memory because explicit deletion is a foundational user-control requirement and can be proven without selecting production storage.

Forget semantics are:

- the request MUST be explicit and identify exactly one Memory;
- Memory Engine validates the request and governs its meaning;
- technical Store removal occurs only after validation and does not itself define lifecycle meaning;
- success produces the canonical no-longer-retained outcome without declaring an M3-specific lifecycle transition;
- success removes the item from retained Get and List results without mutating the previously returned immutable Memory Record;
- forgetting does not alter Knowledge, Context, Identity, or another Memory;
- no physical deletion, backup erasure, retention-law, or distributed deletion mechanism is implied by M3.

Repeated forgetting is deterministic: once forgetting succeeds, a later request for the same now-absent Memory returns Memory Not Found. M3 invents no Forgotten state and exposes no Deleted record.

Inspect is supported through Get Memory and bounded reference listing. Update, export, advanced search, and production deletion guarantees remain required future evolution before a production personal-Memory service may claim complete Foundation user-control support.

Memory access and deletion are protected operations. Security Engine owns authorization policy semantics. Enforcement occurs at the appropriate invocation boundary through Security-owned Contracts or policy decisions and does not transfer Security ownership to Memory Engine.

M3 does not implement Security Engine. Its runtime demonstration uses only controlled non-personal fixture content. It MUST NOT be represented as a production user-Memory service or bypass applicable Security policy.

## Published Events

M3 publishes no Memory Events.

Retention and forgetting are meaningful domain facts, but M3 has no approved Event consumer or Event infrastructure requirement. Events may be introduced only by a later approved use case with Core schema custody, Memory semantic ownership, explicit runtime publication authority, and privacy-safe payloads.

## Consumed Events

M3 consumes no Events. Retention, retrieval, listing, and forgetting are requested explicitly through Contracts.

## Dependencies

Memory Engine MAY depend on:

- Core-custodied Memory identifiers, domain types, Contracts, references, and failures;
- the Core-custodied Memory Store Contract abstraction;
- technology-neutral identity and creation-time allocation abstractions required for deterministic M3 construction;
- Core-custodied logging and diagnostic abstractions where shared by the platform.

Memory Engine MUST NOT depend directly on:

- Context, Knowledge, Identity, Security, Reasoning, Planning, or another Engine implementation;
- a concrete Memory Store;
- Providers, Adapters, Infrastructure, databases, caches, filesystems, external systems, or Event brokers;
- LLM, embedding, vector, search, persistence, transport, or authorization frameworks;
- external npm packages unless separately approved for a later milestone.

Bootstrap composes the Memory Engine with the deterministic in-memory Store through the Core-custodied Store Contract. Runtime composition does not change inward source-code dependency direction.

## Internal Components

M3 requires only these logical responsibilities:

- **Retention Validator** — validates explicit intent, classification, Content, Provenance, identity, and retained-at metadata;
- **Memory Record Factory** — creates immutable Stored Memory Records and references;
- **Memory Access Coordinator** — governs Store interaction, retrieval validation, bounded listing, and forgetting.

These are logical responsibilities, not mandatory classes, services, packages, or deployment units. Implementations SHOULD combine them when separation provides no demonstrated value.

## Engine Responsibilities

Memory Engine is responsible for:

- validating every public Memory request at runtime;
- admitting only explicitly proposed valid Episodic experiences in M3;
- assigning and validating Memory Identity and retained-at metadata;
- constructing immutable Memory Records and references;
- preserving Retention Intent and Provenance;
- invoking the Store only after semantic validation;
- validating all Store responses as untrusted data;
- retrieving only retained Memory for an explicit Retrieval Purpose;
- creating immutable Retrieval Receipts and maintaining separate latest-successful-use semantics;
- listing retained references as discovery without marking items retrieved;
- enforcing explicit forget semantics;
- preserving the Memory/Knowledge/Context boundary;
- returning deterministic, technology-neutral, privacy-safe failures.

It is not responsible for any Non-Goal listed above.

## Engine Lifecycle

Memory Engine follows the platform Engine lifecycle:

`Initialize → Ready → Running → Stopping → Stopped`

For M3:

- initialization validates required Core Contracts and controlled construction dependencies;
- initialization MUST be deterministic;
- Memory operations MUST NOT execute while the Engine is not Running;
- stopping MUST NOT create, retrieve, modify, or forget Memory;
- Engine lifecycle does not change a Memory Record's lifecycle.

The lifecycle does not imply a process, deployment, or framework boundary.

## State Management

Memory Engine owns Memory semantics but does not own physical persistence technology.

M3 uses a deterministic process-local in-memory Store only to prove the Store boundary. The Engine MUST NOT expose mutable Store collections or depend on Store implementation details. Records and references crossing Contracts MUST be immutable defensive domain values.

M3 also maintains only the latest successful Retrieval Receipt per retained Memory as process-local retrieval-use metadata. This metadata is owned semantically by Memory Engine, remains separate from the immutable Memory Record and Provenance, and has no production durability guarantee. Listing does not create or update it.

M3 defines no durability, restart survival, transaction, backup, replication, synchronization, migration, or production deletion guarantee.

## Configuration

M3 configuration is limited to bootstrap construction of:

- one Memory Store Contract implementation;
- controlled Memory Identity allocation;
- controlled retained-at values;
- controlled retrieval timestamps.

Memory Engine MUST NOT contain:

- database, vector, embedding, search, Provider, Adapter, endpoint, credential, or Event configuration;
- environment-variable access in Memory domain behavior;
- production retention-policy or Security-policy configuration;
- framework-specific configuration.

No configuration framework is required.

## Security

Memory Engine owns no authorization policy semantics. It MUST validate untrusted inputs, minimize retained information, protect Content and Provenance from observability leakage, and enforce applicable Security-owned decisions at protected boundaries through Contracts or governed policy artifacts.

M3 does not introduce direct Security Engine coupling and does not claim production authorization. A future protected runtime boundary MUST enforce Memory read, write, and delete policy before invoking the corresponding Contract.

For Source Reference, M3 enforces only the structural Memory Contract and observability minimization. Provenance producers remain responsible for excluding sensitive source data before invocation. Structural acceptance is not a Security certification, and M3 performs no heuristic sensitive-content detection. Future Security enforcement MAY apply approved Security policy without introducing Security Engine implementation into M3.

The in-memory demonstration MUST contain no credentials, secrets, authentication tokens, sensitive personal data, or real user Memory.

## Failure Semantics

M3 defines the following minimum failures.

### Invalid Memory Input

A public request, Content value, Retention Reason, Provenance field, Retrieval Purpose, result limit, or exact request shape violates its Contract. No Store mutation or retrieval-use update occurs.

### Invalid Memory Identity

A supplied or allocated Memory Identity violates the shared identity Contract. Caller-supplied invalid identities fail before Store access; invalid allocated identities fail before retention.

### Invalid Retention Intent or Classification

The request lacks explicit retain intent, declares a non-Episodic category, or otherwise does not represent an admissible M3 retention proposal. No Memory is Stored.

### Duplicate Memory Identity

An allocated Memory Identity is already present in the M3 runtime scope. The existing Memory remains unchanged and the candidate is not Stored.

### Memory Not Found

Get or Forget identifies no retained Memory. Forgotten Memory is reported as not found and is not reconstructed or returned from hidden state.

### Memory Store Unavailable

The Store cannot perform the requested technical operation. The Engine preserves this distinction and MUST NOT report success, not-found, or automatic retry.

### Invalid Memory State

A Store response, candidate Memory Record, Retrieval Receipt, or retrieval-use value is null, malformed, contradictory, mutable where immutability is required, has an unknown discriminant, or violates M3 invariants.

### Invalid Memory Lifecycle Transition

An operation attempts behavior outside the M3 lifecycle semantics, such as returning a no-longer-retained record as Stored or invoking update/archive behavior that M3 does not expose. This failure does not define a new lifecycle transition.

Failures MUST be deterministic, technology-neutral, distinguishable, and privacy-safe. Unexpected implementation failures MUST be normalized at the public Memory Engine boundary without exposing native errors, Store implementation types, Content, provenance, or raw malformed payloads.

## Runtime Boundary Safety

All public Memory Contract inputs and all Memory Store outputs remain untrusted until validated by Memory Engine.

M3 implementations MUST explicitly validate:

- null and undefined values;
- primitive values of the wrong type;
- arrays and non-record objects;
- exact request discriminants and required fields;
- unexpected fields where M3 Contracts define exact shapes;
- primitive string requirements without coercion;
- Memory Identity length, whitespace, and primitive-string rules;
- the deterministic default list limit of 50 and the inclusive integer range from 1 through 100;
- Content through 4096 Unicode code points, Retention Reason through 512 Unicode code points, and every Provenance field;
- Originating Capability through 128 Unicode code points and optional Source Reference through 256 Unicode code points;
- Memory Retrieval Purpose and controlled retrieval timestamp values;
- optional Source Reference shape;
- Store result objects, discriminants, required fields, item counts, and every returned record;
- Store confirmations for put and delete operations;
- constructed Retrieval Receipt shape, immutability, and correspondence with the retrieved Memory.

Implementations MUST NOT convert arbitrary values with `String`, interpolation, `toString`, or equivalent coercion. They MUST NOT trust TypeScript types, Store implementations, or caller immutability at runtime.

Bounded string length MUST be evaluated in Unicode code points. No bounded value may be silently truncated, and coercible non-string objects MUST be rejected.

Malformed requests create no Memory. Malformed Store results MUST become Invalid Memory State. Store unavailability MUST remain distinct. No native `TypeError`, implementation-specific error class, raw payload, or secret may escape a public Memory Contract boundary.

No validation library is prescribed.

## Observability and Privacy

M3 SHOULD expose:

- Engine lifecycle and health status;
- retention, retrieval, listing, and forgetting outcome counts;
- retained item count;
- failures by M3 category;
- correlation identifier where policy permits.

M3 diagnostics MAY report only:

- Memory capability initialized;
- explicit retention succeeded;
- deterministic retrieval succeeded;
- retrieval explainability receipt created;
- bounded reference listing succeeded;
- explicit forgetting succeeded;
- forgotten Memory is no longer retrievable;
- retained item count before and after forgetting.

Logs, metrics, failures, and diagnostics MUST NOT contain:

- raw Memory Content or Retention Reason;
- raw Memory Identity or Source Reference by default;
- raw or free-form retrieval-purpose text;
- raw Provenance or source payloads;
- Identity identifiers, personal information, credentials, secrets, tokens, or authorization decisions;
- deleted Memory data;
- mutable Store representations.

Memory identifiers MAY be used only as minimized or redacted operational correlation metadata under approved Security and privacy policy. No production observability vendor is required.

Diagnostics MAY expose a fixed privacy-safe Retrieval Purpose category only when required to prove M3 behavior. They MUST NOT emit caller-supplied free-form purpose text; M3 defines no such field.

## Performance

M3 defines no throughput, capacity, or latency target.

Correct classification, intentionality, provenance, privacy, user control, ownership, and deterministic behavior take precedence over optimization. Performance work MUST NOT introduce bulk Content loading, speculative indexes, caching, persistence, or infrastructure.

## Testing

The future M3 implementation MUST include deterministic tests for:

- valid and invalid Memory Identity construction without coercion;
- valid and invalid Content, Retention Reason, and Provenance values;
- absent, structurally valid, empty, whitespace-only, surrounding-whitespace, over-256-code-point, non-string, and coercible Optional Source Reference values;
- structurally valid opaque Source Reference acceptance without heuristic semantic inspection;
- explicit Retention Intent and Episodic-only classification;
- absence of automatic retention;
- immutable Memory Record, Content, Provenance, Intent, and Memory Reference;
- stable unique Memory Identity and duplicate rejection;
- successful Store confirmation before a retained result is returned;
- valid and invalid closed Memory Retrieval Purpose values;
- deterministic Get Memory behavior requiring explicit Retrieval Purpose;
- immutable Retrieval Receipt with matching safe Memory Reference, controlled retrieval timestamp, and purpose;
- latest successful retrieval timestamp providing last-used semantics without Memory Record or Provenance mutation;
- failed retrieval producing no receipt or last-used update;
- Memory Not Found behavior;
- bounded deterministic reference listing that excludes Content and does not mark listed items retrieved;
- explicit successful forgetting;
- forgotten Memory absent from Get and List;
- forgetting an unknown Memory;
- Store unavailability for every operation;
- null, primitive, array, unknown-discriminant, incomplete, and contradictory Store results;
- malformed Store records and confirmations becoming Invalid Memory State;
- unexpected Store failures being normalized;
- exact-shape hostile public requests and non-coercion;
- no malformed input producing a Stored Memory or successful forget result;
- Memory/Knowledge/Context boundary preservation;
- Engine initialization and explicit bootstrap composition;
- privacy-safe mandatory diagnostics at every supported log level;
- omission of raw Source Reference values from diagnostics and logs;
- dependency rules preventing Core and Memory Engine outward coupling.

Tests MUST require no network, external service, database, vector store, embedding model, LLM, Event infrastructure, clock-dependent nondeterminism, or nondeterministic identity generation.

## M3 Implementation Boundary

The future M3 implementation SHOULD include only:

- Core-custodied Memory identifiers, domain types, Contracts, references, Store abstraction, and failures;
- a framework-free Memory Engine;
- deterministic controlled Memory identity and retained-at construction values;
- a deterministic in-memory Memory Store outside Core and Memory domain behavior;
- explicit bootstrap composition;
- Retain Memory, Get Memory, List Retained Memory References, and Forget Memory behavior;
- closed privacy-safe Retrieval Purpose and immutable Retrieval Receipt behavior;
- deterministic process-local latest Retrieval Receipt metadata separate from Memory Records;
- one non-personal Episodic demonstration Memory;
- unit, Contract, Store, lifecycle, immutability, adversarial runtime, architecture, privacy, and smoke tests;
- a privacy-safe diagnostic proving retain, explainable retrieval, bounded discovery listing, and forget behavior.

The future implementation MUST NOT include:

- Preference or Assertion Memory behavior;
- Memory update, export, archive, aging, decay, consolidation, ranking, or semantic search;
- automatic Memory extraction, creation, summarization, or ingestion;
- Context integration or modification;
- Knowledge Engine behavior or Knowledge promotion;
- production persistence, repository, database, ORM, filesystem, cache, vector store, or graph store;
- embeddings, LLMs, AI providers, external Providers, Adapters, or integrations;
- Events, Event Bus, broker, queue, or distributed synchronization;
- HTTP, API, Gateway, client, container, cloud, or deployment technology;
- Security Engine implementation, roles, permissions, or authorization policy;
- external npm packages unless separately approved.

## Acceptance Criteria

M3 is complete only when:

1. Memory Engine is the single semantic owner of Memory behavior.
2. Core custodies shared Memory definitions and Contracts without owning Memory behavior.
3. M3 admits only explicitly proposed Episodic experiences.
4. No Context Revision, interaction, message, Engine output, or Store value becomes Memory automatically.
5. One valid experience can be intentionally retained through Retain Memory.
6. The retained Memory receives one valid stable unique Memory Identity.
7. The Stored Memory Record, Content, Retention Intent, Provenance, and reference are immutable.
8. Provenance preserves Source Type, Originating Capability, Observed At, Occurrence Evidence, and optional opaque Source Reference.
9. The retained Memory records experience and does not represent an accepted Knowledge claim.
10. Store mechanics occur behind the Core-custodied Memory Store Contract and do not acquire semantic ownership.
11. Store success is validated before Memory Engine reports retention success.
12. Get Memory requires one explicit valid Memory Retrieval Purpose and deterministically returns the retained immutable Memory.
13. Every successful Get Memory result contains one immutable Retrieval Receipt whose safe Memory Reference identifies the returned Record and whose controlled timestamp and purpose explain when and why retrieval occurred.
14. The latest successful Retrieval Receipt timestamp supplies conceptual last-used time without mutating Memory Record Content, Provenance, identity, retention metadata, or Stored representation.
15. Failed Get Memory creates no Retrieval Receipt and does not change last-used semantics.
16. Get Memory fails explicitly for an unknown or forgotten Memory Identity.
17. List Retained Memory References returns a bounded deterministic immutable collection without Content or raw Provenance and does not create per-item receipts or mark listed items retrieved.
18. Explicit Forget Memory succeeds for a retained item and removes it from subsequent Get and List results without mutating its immutable Record or prior receipts.
19. Repeated Forget Memory deterministically returns Memory Not Found after the first success.
20. Forget Memory uses the authoritative no-longer-retained/Deleted outcome terminology without defining a direct transition path, physical deletion mechanism, or new lifecycle state.
21. Retrieval remains an operation rather than an M3 lifecycle-state transition, and M3 introduces no unauthorized lifecycle transition.
22. Invalid retention intent, classification, Content, Provenance, Retrieval Purpose, identities, limits, and request shapes fail without Store mutation or retrieval-use update.
23. Store unavailability remains distinct and never becomes not-found or success.
24. Malformed Store results or Retrieval Receipts fail as Invalid Memory State and never become Memory domain values.
25. Unexpected failures are normalized without native or implementation-specific exceptions escaping public Contracts.
26. Memory Engine does not promote Memory to Knowledge, compose Context, or make authorization decisions.
27. M3 modifies no Context or Knowledge behavior and requires no other cognitive Engine implementation.
28. Diagnostics prove retention, explainable retrieval, bounded discovery listing, and forgetting without exposing Content, identifiers, provenance, free-form purpose text, personal information, secrets, tokens, or source payloads.
29. Memory Engine depends only inward on approved Core abstractions and never on the concrete Store or another Engine implementation.
30. Unit, Contract, Store, lifecycle, immutability, adversarial, architecture, privacy, and smoke tests are deterministic and pass.
31. Complete repository validation and architectural dependency checks pass.
32. No external service, production persistence, or deferred technology is required.
33. Memory Content accepts valid values through 4096 Unicode code points, rejects larger values as Invalid Memory Input, and is never silently truncated.
34. Retention Reason accepts valid values through 512 Unicode code points, rejects larger values as Invalid Retention Intent, and is never silently truncated.
35. List Retained Memory References defaults an omitted limit to 50 and accepts only explicit integer limits from 1 through 100 inclusive.
36. Memory Identity accepts only opaque primitive strings from 1 through 128 Unicode code points without leading or trailing whitespace and rejects empty, whitespace-only, or coercible non-string values.
37. Originating Capability accepts only primitive strings from 1 through 128 Unicode code points without leading or trailing whitespace and rejects empty, whitespace-only, or coercible non-string values.
38. Optional Source Reference is accepted when absent; when present, structurally valid opaque primitive strings from 1 through 256 Unicode code points are accepted, while empty, whitespace-only, surrounding-whitespace, over-256-code-point, non-string, and coercible values are rejected.
39. Every bounded string uses deterministic Unicode code-point length semantics rather than UTF-16 code-unit or encoded-byte length.
40. Callers and provenance producers are normatively prohibited from supplying credentials, authentication tokens, secrets, raw provider payloads, or other sensitive source data through Source Reference.
41. M3 performs no heuristic semantic inspection of opaque Source Reference content, and structural acceptance does not certify that the value is free of sensitive information.
42. Raw Source Reference values are not emitted in diagnostics or ordinary logs.

## Future Evolution

Later approved milestones MAY add:

- Preference Memory and Assertion Memory;
- user-scoped ownership and Identity association through approved Contracts;
- Security-enforced production Memory access;
- Memory update with continuity and history;
- export and advanced user inspection;
- archival, retention expiry, and production deletion governance;
- contextual relevance retrieval and qualified Memory projections for Context;
- Memory evidence references for Knowledge candidates;
- meaningful Memory domain Events;
- production persistence behind Contracts;
- confidence models, aging, summarization, consolidation, semantic search, ranking, graphs, or encrypted personal vaults.

Every extension MUST preserve intentional retention, user ownership, provenance, the Memory/Knowledge/Context partition, Memory Engine semantic ownership, Core Contract custody, Security governance, privacy, and inward dependency direction.

## References

- [Documentation Authority](../../../docs/DOCUMENT-AUTHORITY.md)
- [ADR-0001 — Core Ownership and Dependency Direction](../../../docs/adr/ADR-0001-Core-Ownership-and-Dependency-Direction.md)
- [ADR-0002 — Capability-Oriented Architecture](../../../docs/adr/ADR-0002-Capability-Oriented-Architecture.md)
- [ADR-0003 — Engine Communication Model](../../../docs/adr/ADR-0003-Engine-Communication-Model.md)
- [ADR-0005 — Memory Architecture Principles](../../../docs/adr/ADR-0005%20%E2%80%94%20Memory%20Architecture%20Principles)
- [OES-0001 — Repository Structure](../../../docs/engineering/OES-0001-Repository-Structure.md)
- [OES-0002 — Engine Design](../../../docs/engineering/OES-0002-Engine-Design.md)
- [OES-0004 — Contracts](../../../docs/engineering/OES-0004-Contracts.md)
- [OES-0005 — Events](../../../docs/engineering/OES-0005-Events.md)
- [OES-0008 — Documentation Standards](../../../docs/engineering/OES-0008-Documentation-Standards.md)
- [OES-0009 — Security Standards](../../../docs/engineering/OES-0009-Security-Standards.md)
- [ARCH-0001 — Core Architecture](../../architecture/ARCH-0001-Core-Architecture.md)
- [CONCEPT-0001 — Memory Model](../../concepts/CONCEPT-0001-Memory-Model.md)
- [CONCEPT-0002 — Knowledge Model](../../concepts/CONCEPT-0002-Knowledge-Model.md)
- [CONCEPT-0003 — Context Model](../../concepts/CONCEPT-0003-Context-Model.md)
- [ENGINE-0002 — Identity Engine](../identity/ENGINE-0002-Identity-Engine.md)
- [ENGINE-0003 — Context Engine](../context/ENGINE-0003-Context-Engine.md)
- [IMPLEMENTATION-M0 — Executable Architectural Skeleton](../../../IMPLEMENTATION-M0.md)
- [IMPLEMENTATION-M1 — Identity Engine Vertical Slice](../../../IMPLEMENTATION-M1.md)
- [IMPLEMENTATION-M2 — Context Engine Vertical Slice](../../../IMPLEMENTATION-M2.md)

## Engineering Motto

> Memory retains experience by explicit purpose, never by accidental persistence.
