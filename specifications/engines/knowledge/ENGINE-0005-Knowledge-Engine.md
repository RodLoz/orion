# ENGINE-0005 — Knowledge Engine

| Field          | Value                                                  |
| -------------- | ------------------------------------------------------ |
| **Status**     | Active                                                 |
| **Version**    | 1.0.0                                                  |
| **Owner**      | Project Maintainers                                    |
| **Created**    | 2026-07-20                                             |
| **Updated**    | 2026-07-20                                             |
| **Applies To** | Knowledge Engine, M4 — Knowledge Engine Vertical Slice |

---

## Status

This specification is Active and governs M4 implementation according to the documentation authority and status rules.

The key words **MUST**, **MUST NOT**, **SHOULD**, **SHOULD NOT**, and **MAY** describe normative requirements proposed by this specification.

## Purpose

The Knowledge Engine answers:

> What is accepted as sufficiently true?

It is the single semantic owner of the Knowledge capability. It evaluates candidate claims under explicit acceptance evidence, preserves provenance, governs accepted Knowledge identity and validation state, resolves declared contradictions, and exposes deterministic retrieval without becoming a truth oracle or generic storage service.

M4 proves the smallest complete Knowledge pattern by evaluating bounded textual candidates, accepting one supported candidate, rejecting candidates deterministically, retrieving and listing accepted Knowledge, and explicitly superseding a contradicted item through a deterministic in-memory Store. It does not establish universal natural-language truth evaluation or implement a general-purpose Knowledge platform.

## Capability Ownership

The Knowledge Engine owns:

- candidate-claim admissibility semantics;
- final Knowledge acceptance and rejection semantics;
- Knowledge validation-state semantics;
- Knowledge identity allocation and version semantics;
- Knowledge provenance and acceptance-evidence requirements;
- declared-contradiction and supersession semantics;
- current-versus-historical Knowledge semantics;
- Knowledge retrieval and reference-projection semantics;
- Knowledge-domain failure semantics.

The Core is the canonical custodian of shared Knowledge Contracts, identifiers, domain types, references, Store abstractions, and failure definitions. Core custody governs shared definitions, compatibility, and versioning; it does not transfer Knowledge behavior or acceptance authority to Core.

The Knowledge Engine implements Knowledge behavior behind Core-custodied Contracts. A Knowledge Store implementation supplies mechanical storage and retrieval but does not decide what qualifies as Knowledge, which item is current, or how contradictions are resolved.

The Knowledge Engine does not own:

- Memory retention or promotion;
- Context composition or relevance selection;
- Reasoning, Planning, Identity, or Security policy;
- external fact-verification technology;
- search, persistence, indexing, transport, or deployment technology;
- arbitrary web or provider content.

## Scope

M4 includes:

- one bounded textual Candidate Claim representation;
- one explicit, trusted-authority Acceptance Evidence form;
- deterministic claim evaluation resulting in Accepted or Rejected;
- stable Engine-assigned Knowledge Identity;
- immutable accepted Knowledge Records with provenance, acceptance metadata, and positive versions;
- deterministic retrieval of confirmed accepted Knowledge by identity;
- bounded deterministic discovery of current Knowledge References;
- a privacy-minimal read-only Knowledge Reference suitable for future Context consumption;
- caller-declared contradiction handling with explicit reject-candidate or supersede-existing decisions;
- immutable historical records and Engine-governed current-version semantics;
- a technology-neutral Knowledge Store Contract;
- a deterministic in-memory Store for tests and runtime demonstration;
- runtime-safe failures, privacy-safe diagnostics, and automated tests.

M4 stands alone. It does not modify Memory or Context behavior and does not automatically evaluate any Memory, message, Engine output, Provider result, or interaction.

## Non-Goals

M4 does not define or implement:

- universal truth, natural-language fact checking, or automatic validation;
- Knowledge graphs, graph edges, ontologies, inference graphs, or truth-maintenance systems;
- confidence scores, confidence propagation, source consensus, or multi-source reconciliation;
- semantic search, full-text search, ranking, embeddings, vectors, or similarity;
- LLM judgment, web search, external verifier Providers, or provider-specific formats;
- automatic Memory promotion, Reasoning promotion, or imported-content acceptance;
- Context integration, Context mutation, or cognitive relevance selection;
- arbitrary Knowledge update, merge, deprecation, archival, or deletion;
- production databases, caches, filesystems, graph stores, vector stores, or persistence;
- Events, brokers, queues, external integrations, HTTP, API, or Gateway behavior;
- production authorization, identity association, encryption, audit storage, or deployment topology.

## Core Concepts

M4 uses only the following Knowledge concepts.

### Knowledge Identity

A **Knowledge Identity** is one opaque, stable platform identity assigned by Knowledge Engine to exactly one accepted Knowledge Record. It is not a database key, content hash, provider identifier, source reference, UUID requirement, or semantic subject identifier.

### Candidate Claim

A **Candidate Claim** is an immutable, bounded textual proposition submitted for evaluation. It is not Knowledge before a successful Knowledge Engine acceptance decision. Text is a narrow M4 representation rather than the permanent universal Knowledge format.

### Acceptance Evidence

**Acceptance Evidence** is immutable, explicit input recording one trusted authority's proposed evaluation decision and reason. M4 supports exactly one method: **Explicit Authority Review**.

Acceptance Evidence contains:

- method: the fixed `explicit-authority-review` category;
- authority identifier: an opaque identifier for the responsible acceptance authority;
- decision: `accept` or `reject`;
- reason: a bounded explanation of the decision.

Evidence authorizes deterministic M4 evaluation but does not independently become Knowledge and does not make a claim universally true. Knowledge Engine validates the evidence and owns the final domain decision. M4 does not infer authority, inspect external credentials, or verify facts externally.

### Knowledge Provenance

**Knowledge Provenance** records where the candidate originated and when it was observed. It contains only:

- Candidate Source Type: `manual-assertion` or `approved-internal-source`;
- Originating Capability: one opaque capability identifier;
- Observed At: one exact UTC timestamp supplied with the candidate;
- optional Source Reference: one opaque provenance pointer.

Provenance explains origin; it does not validate truth. Acceptance Evidence and Accepted At remain distinct from candidate Provenance so observation time, review authority, and acceptance time cannot be conflated.

### Knowledge Validation State

M4 persists exactly one Knowledge Validation State: **Accepted**.

Candidate and Rejected are evaluation states or outcomes, not persisted Knowledge states. A rejected or invalid candidate is not a Knowledge Record. M4 does not persist candidates merely because they were submitted.

### Knowledge Record

A **Knowledge Record** is the immutable representation of a successfully accepted claim. It contains only:

- Knowledge Identity;
- immutable Claim;
- immutable Provenance;
- immutable Acceptance Evidence whose decision is `accept`;
- Accepted validation state;
- Accepted At controlled timestamp;
- positive Version;
- optional Supersedes Knowledge Identity.

The record does not contain mutable current-state flags, raw provider payloads, Memory content, Context state, credentials, tokens, or arbitrary metadata.

### Knowledge Reference

A **Knowledge Reference** is an immutable, privacy-minimal read-only projection. It contains only:

- Knowledge Identity;
- Accepted validation state;
- positive Version;
- Currency: `current` or `superseded`;
- Knowledge as the authoritative capability.

It contains no Claim text, raw Provenance, Acceptance Reason, Source Reference, authority identifier, or personal data. A reference is suitable for future Context use without transferring Knowledge ownership or embedding Knowledge content into Context.

### Knowledge Acceptance Decision

A **Knowledge Acceptance Decision** is the immutable result of Evaluate Knowledge Claim:

- `accepted`, with the new immutable Knowledge Record and current Knowledge Reference; or
- `rejected`, with the fixed privacy-safe rejection category `authority-rejected` or `contradiction-preserved` and no Knowledge Identity or Record.

Invalid input and operational failures are failures, not rejection decisions.

## Invariants

1. Knowledge Engine is the single semantic owner of Knowledge behavior and acceptance.
2. A Candidate Claim is not Knowledge until Knowledge Engine successfully completes acceptance.
3. Every accepted Knowledge item has explicit valid Acceptance Evidence with an `accept` decision.
4. A user assertion, Memory item, Provider result, external source, Reasoning output, or Store value never becomes Knowledge automatically.
5. Every accepted Knowledge item has one stable unique Knowledge Identity, valid immutable Provenance, Accepted At, and positive Version.
6. Rejected and invalid candidates are not persisted or exposed as Knowledge.
7. Provenance supports traceability but does not itself make a claim accepted or true.
8. Store mechanics alone cannot establish accepted or current Knowledge availability.
9. Only Engine-confirmed accepted Knowledge is returned by Get Knowledge or List Knowledge References.
10. Contradictions are declared explicitly at the Contract boundary; M4 performs no semantic contradiction detection.
11. Declared contradictions require an explicit resolution and never silently overwrite existing Knowledge.
12. Supersession creates a new immutable Knowledge Record and never mutates historical Claim content, Provenance, Acceptance Evidence, identity, or version.
13. A superseded Knowledge Record remains historically retrievable by identity but is not current and is omitted from current-reference discovery.
14. Knowledge References are read-only projections and do not transfer semantic ownership to Context or another consumer.
15. Malformed Store data cannot become Knowledge.
16. Knowledge operations are deterministic for the same inputs, confirmed Engine state, Store state, and controlled identity/time allocation state.

## Knowledge Identity

Knowledge Engine assigns one Knowledge Identity only after the Candidate Claim, Provenance, Acceptance Evidence, and any contradiction decision are validated and the evaluation outcome is eligible for acceptance.

Identity allocation MUST occur through a technology-neutral Core-custodied construction Contract. A concrete M4 allocator MAY use deterministic process-local values for tests and bootstrap. No UUID, ULID, database sequence, provider identifier, or content-derived syntax is mandated.

The Engine MUST validate an allocated identity before Store access. It MUST reject an identity already confirmed as accepted, and it MUST validate the Store's duplicate or success result. A collision MUST produce Duplicate Knowledge Identity and MUST NOT overwrite an existing Record.

Store mechanics alone do not make an identity accepted. Knowledge Engine MUST mark an identity as accepted only after the Store confirms the complete Record through a valid success result. A failed or malformed confirmation MUST leave the candidate unavailable through capability-level Get and List operations even if a Store mechanically wrote it.

Knowledge Identity is an opaque primitive string from 1 through 128 Unicode code points. Leading or trailing whitespace, empty and whitespace-only strings, values longer than 128 code points, and non-string or coercible values are invalid.

## Candidate Claim

Candidate Claim uses bounded text in M4.

The Claim:

- MUST be a primitive string;
- MUST be non-empty and non-whitespace-only;
- MAY contain internal and surrounding whitespace because it is claim content rather than an opaque identifier;
- MUST contain no more than 4096 Unicode code points;
- MUST NOT be coerced or silently truncated.

M4 performs no whitespace normalization. The exact accepted Claim string is preserved immutably. A Candidate Claim is evaluated as one opaque proposition; M4 does not parse entities, predicates, subjects, documents, provider messages, or semantic relationships from the text.

Submitting a Claim asserts only that evaluation was requested. It does not establish sufficient truth, confidence, correctness, or Knowledge status.

## Acceptance Evidence

M4 accepts only exact-shape Acceptance Evidence with:

- `method` equal to `explicit-authority-review`;
- `authorityIdentifier` as an opaque primitive string from 1 through 128 Unicode code points without leading or trailing whitespace;
- `decision` equal to `accept` or `reject`;
- `reason` as a non-empty, non-whitespace-only primitive string through 512 Unicode code points.

The exact Reason string is preserved. M4 performs no normalization, coercion, truncation, signature verification, credential inspection, external lookup, or authority discovery.

The caller and protected runtime boundary are responsible for ensuring that the named authority is permitted to submit the decision under Security-owned policy. Structural acceptance by Knowledge Engine does not certify authorization or external factual correctness. M4 introduces no Security Engine implementation.

Acceptance Evidence is semantic input, not arbitrary metadata. It contains no extension bag, raw source payload, confidence vector, provider response, credential, token, secret, or executable validation rule.

## Knowledge Provenance

Every accepted Knowledge Record MUST preserve one immutable exact-shape Provenance value.

Candidate Source Type uses the closed M4 vocabulary:

- `manual-assertion` — a person or manual process proposed the candidate;
- `approved-internal-source` — an internal capability or governed platform source proposed the candidate.

Source Type describes origin and never determines acceptance. In particular, `manual-assertion` does not make a user assertion true, and `approved-internal-source` is not a substitute for Acceptance Evidence.

Originating Capability is an opaque primitive string from 1 through 128 Unicode code points with no leading or trailing whitespace. It is provenance metadata only and does not establish a global capability naming standard.

Observed At is the exact UTC timestamp at which the source observation represented by the candidate occurred. Accepted At is supplied through a controlled construction boundary and records when Knowledge Engine accepted the Claim. They MUST remain semantically distinct.

Optional Source Reference:

- is absent when not supplied;
- when present, is an opaque primitive string from 1 through 256 Unicode code points;
- rejects leading or trailing whitespace, empty and whitespace-only values, over-bound values, non-string values, and coercion;
- identifies a source pointer, not source content.

Callers and provenance producers MUST NOT supply credentials, authentication tokens, secrets, raw provider payloads, or sensitive source data through Source Reference. Knowledge Engine validates only the deterministic structural Contract and MUST NOT claim to detect semantically sensitive content. Structural acceptance does not certify privacy safety. M4 performs no content inspection, secret scanning, provider parsing, or heuristic redaction.

## Validation State

Accepted is the only validation state present on an M4 Knowledge Record. It means Knowledge Engine completed the approved deterministic M4 acceptance procedure and accepts the Claim as sufficiently true for platform use within the limits of that procedure.

Accepted does not mean mathematically proven, universally true, permanently true, externally verified, or independently corroborated. M4 does not implement the broader confidence classifications described for future Knowledge evolution.

Candidate and Rejected remain operation input/outcome terms. Stored is a mechanical Store outcome and MUST NOT be exposed as a Knowledge validation state. Current and Superseded are Engine-governed currency semantics, not validation states and not mutations of the immutable Record.

## Acceptance Semantics

Evaluate Knowledge Claim is the only M4 path by which a Claim may become Knowledge.

For a request without a declared contradiction:

1. validate the exact request shape and explicit `evaluate` intent;
2. validate Candidate Claim;
3. validate Provenance;
4. validate Acceptance Evidence;
5. if the evidence decision is `reject`, return `authority-rejected` without allocating identity or invoking Store;
6. if the evidence decision is `accept`, allocate and validate Knowledge Identity;
7. allocate and validate Accepted At;
8. construct an immutable Version 1 Accepted Knowledge Record;
9. persist the candidate Record mechanically through Knowledge Store;
10. validate the complete Store confirmation;
11. mark the identity as Engine-confirmed accepted and current;
12. return the accepted Record and current Reference.

Knowledge Engine owns the final deterministic decision: valid `accept` evidence permits acceptance; valid `reject` evidence requires rejection. Store presence, source classification, provenance, or Claim text cannot override the decision.

No success may be reported before Store confirmation is validated. If storage or confirmation fails, the Engine MUST NOT expose the candidate through Get or List even if the Store mechanically wrote it. M4 requires no database transaction; Engine-confirmed accepted/current availability is authoritative at the capability boundary.

M4 does not retain rejected evaluation requests, rejected Claim text, or rejection Evidence as Knowledge. Production audit behavior is deferred.

## Rejection Semantics

A structurally valid candidate is rejected when:

- valid Acceptance Evidence has decision `reject`, producing `authority-rejected`; or
- a declared contradiction has explicit resolution `reject-candidate`, producing `contradiction-preserved`.

Rejection MUST:

- return one immutable privacy-safe Knowledge Acceptance Decision;
- allocate no Knowledge Identity;
- create no Knowledge Record;
- invoke no Store mutation;
- leave existing Knowledge, current-version metadata, Memory, and Context unchanged;
- prevent the rejected candidate from appearing in Get or List.

Malformed Claim, Evidence, Provenance, identity, contradiction, or request shape produces a failure rather than a rejection decision. M4 does not persist rejected candidates.

## Contradiction Semantics

M4 handles only explicitly declared contradictions. It does not compare Claim text, infer logical inconsistency, search existing Knowledge, or use an LLM or external verifier.

The Evaluate request MAY declare `contradictsKnowledgeIdentity`. When it does, it MUST also provide:

- `contradictionDecision`: `reject-candidate` or `supersede-existing`;
- `contradictionReason`: a non-empty, non-whitespace-only primitive string through 512 Unicode code points.

These three fields form one all-or-none exact-shape contradiction resolution. A declared target without both decision and reason produces Contradiction Requires Resolution. Decision or reason without a target is Invalid Knowledge Input.

The caller is responsible for declaring a known contradiction. Absence of a declaration means only that M4 was not instructed about one; it is not certification that no contradiction exists.

For either contradiction decision, Knowledge Engine MUST first confirm that the target identifies current accepted Knowledge. Unknown targets produce Knowledge Not Found. Historical or already-superseded targets produce Invalid Supersession.

`reject-candidate` preserves the existing item as current and returns a rejected decision without identity allocation or Store mutation.

`supersede-existing` requires valid `accept` Acceptance Evidence and follows the supersession procedure below. A `reject` evidence decision cannot supersede and deterministically returns the authority-rejected outcome without Store mutation.

Knowledge Engine never silently overwrites, deletes, or mutates the contradicted Record.

## Supersession / Versioning

M4 implements minimal explicit supersession because CONCEPT-0002 requires Knowledge to be versioned and M4 must demonstrate deterministic contradiction resolution.

For `supersede-existing`:

1. validate that the target is current accepted Knowledge;
2. validate that the target Version is within the normative M4 range and can be incremented exactly;
3. validate the new Claim, Provenance, `accept` Evidence, and contradiction reason;
4. allocate a new Knowledge Identity and Accepted At;
5. construct a new immutable Accepted Record whose Version is target Version plus one and whose Supersedes Knowledge Identity identifies the target;
6. store the new Record mechanically and validate complete Store confirmation;
7. only after confirmation, mark the target superseded and the new identity current;
8. return the new accepted Record and current Reference.

If any step fails, the existing target remains current and the candidate remains unavailable as Knowledge. A Store duplicate, unavailable result, malformed result, or contradictory confirmation cannot partially change Engine-governed currency.

An independent accepted Claim MUST begin at Version 1. No other initial Version is valid for a new independent Knowledge lineage. Supersession increments exactly by one from its direct target when the target Version is less than 9,007,199,254,740,991.

When the target Version is exactly 9,007,199,254,740,991, supersession MUST fail as Invalid Supersession before a successor identity is allocated or Store mutation is attempted. Knowledge Engine MUST NOT wrap the Version, reset it to 1, reuse it, truncate it, lose precision, or create a successor Record. The predecessor remains current and its identity, Claim, Provenance, Evidence, Accepted At, and Version remain unchanged.

M4 supports a linear supersession chain only; branches, merges, multiple contradiction targets, rollback, deletion, deprecation, archival, and semantic subject grouping are deferred.

Historical Records remain immutable and retrievable by their stable identities. Get Knowledge returns a freshly constructed immutable Reference indicating whether the requested identity is current or superseded. List Knowledge References returns only current references. Store mechanics do not determine currency.

## Contracts

Core custodies the following minimum M4 Contracts and shared result schemas. Knowledge Engine owns their behavior and semantics.

### Evaluate Knowledge Claim

Input is an exact-shape request containing:

- `intent`: exactly `evaluate`;
- Candidate Claim;
- Acceptance Evidence;
- Knowledge Provenance;
- optionally the all-or-none contradiction target, decision, and reason fields.

Output is one immutable Knowledge Acceptance Decision. Invalid input or operational failure returns an approved Knowledge failure, never a native exception or partial success.

### Get Knowledge

Input is an exact-shape request containing one Knowledge Identity.

For an Engine-confirmed accepted identity, output contains the immutable Knowledge Record and a freshly constructed immutable Knowledge Reference whose Currency is current or superseded. Unknown, rejected, unconfirmed, or mechanically Store-only identities return Knowledge Not Found.

Get is deterministic by identity. M4 defines no search query, relevance input, retrieval purpose, usage receipt, ranking, or last-used semantics.

### List Knowledge References

Input is an exact-shape request with an optional limit. An omitted limit resolves to 50. Explicit limits are integers from 1 through 100 inclusive.

Output is a deterministic immutable collection of current immutable Knowledge References ordered by Engine-confirmed acceptance order, oldest current acceptance first, truncated to the resolved limit.

Listing is discovery only. It does not expose Claim text, raw Provenance, Evidence, authority identifier, contradiction reason, or historical/superseded items. It does not change versions, currency, validation state, or usage metadata.

### Knowledge Store

Knowledge Store is a narrow mechanical port with:

- Put Accepted Record;
- Get Record by Knowledge Identity.

Put results distinguish `stored`, `duplicate`, and `unavailable`. A stored confirmation includes the matching Knowledge Identity. Get results distinguish `found`, `not-found`, and `unavailable`; a found result contains one complete Record candidate.

Knowledge Engine treats all Store results as untrusted and validates exact shapes, discriminants, identities, Records, versions, and confirmations. The Store Contract exposes no database, repository, graph, query-engine, Provider, transaction, or concrete in-memory type.

### Knowledge Construction Values

A narrow Core-custodied construction Contract supplies candidate Knowledge Identities and Accepted At timestamps. It supplies values only; Knowledge Engine owns when allocation occurs, validates every value, and determines identity and time semantics.

## Knowledge Store Boundary

Knowledge Engine:

- decides whether a candidate is admissible and accepted;
- constructs Accepted Records;
- confirms accepted availability after valid Store success;
- owns validation state, versioning, current currency, and supersession;
- validates exact Version increment safety before allocating a successor identity or invoking Store;
- filters capability retrieval through Engine-confirmed identities;
- constructs Knowledge References.

Knowledge Store:

- mechanically stores an immutable Record candidate by identity;
- mechanically retrieves a Record candidate by identity;
- reports duplicate, unavailable, stored, found, and not-found outcomes;
- preserves values without deciding their Knowledge meaning.

The Store MUST NOT:

- accept or reject a Claim semantically;
- validate truth, Evidence authority, or Provenance meaning;
- assign validation state, version, or current currency;
- resolve contradictions or supersede Knowledge;
- promote Memory or Reasoning output;
- construct capability-level Knowledge References;
- become a generic repository exposed directly to callers.

Knowledge Store does not decide Version range, increment, or overflow semantics. If Knowledge Engine cannot produce an exact valid next Version, it MUST NOT create a successor Record or invoke Store, and the predecessor MUST remain current.

The concrete M4 in-memory Store MAY mechanically retain historical records after supersession. This is an implementation detail consistent with historical retrieval and MUST NOT be described as a universal persistence technology.

## Relationship with Memory

Memory answers, “What have I experienced?” Knowledge answers, “What is accepted as sufficiently true?”

A Memory may record:

> The user stated X.

Knowledge may separately accept:

> X is sufficiently true.

The first statement documents an experience; it does not validate the second claim. Memory existence, retention, or retrieval is never Acceptance Evidence by itself. Memory Engine MUST NOT promote information into Knowledge, and Knowledge Engine MUST NOT mutate or reclassify Memory.

M4 defines no Memory Reference field, imports no Memory Contract, and requires no Memory Engine integration. A future approved milestone MAY allow a privacy-minimal Memory Reference as provenance or evidence while preserving separate records, ownership, and acceptance governance.

## Relationship with Context

Knowledge Engine owns accepted Knowledge. Context owns current relevance and composition.

M4 provides a privacy-minimal Knowledge Reference suitable for future Context projections, but does not modify Context Engine, compose Context, select relevance, or push Knowledge into Context. Context MUST NOT validate, supersede, mutate, or become the owner of Knowledge.

A future Context revision MAY consume a current or revision-specific Knowledge projection through an approved Contract. Such consumption must preserve Knowledge identity/version traceability and cannot transfer semantic ownership.

## Published Events

M4 publishes no Events. Acceptance, rejection, retrieval, and supersession are synchronous Contract outcomes only.

Later milestones MAY define Knowledge domain Events only after their semantics, schemas, publication authority, privacy, and failure behavior are separately approved. Store implementations MUST NOT publish Knowledge-owned Events as semantic authorities.

## Consumed Events

M4 consumes no Events and requires no Event Bus, broker, queue, subscription, or replay infrastructure.

## Dependencies

Knowledge Engine source code MAY depend inward only on approved Core abstractions, including Core-custodied Knowledge domain values, Contracts, failures, Store port, and construction-value port.

Knowledge Engine MUST NOT depend on:

- Bootstrap or the concrete in-memory Knowledge Store;
- Memory Engine, Context Engine, Identity Engine, Security Engine, Reasoning Engine, Planning Engine, or another Engine implementation;
- Infrastructure, Provider, Adapter, Skill, Gateway, client, or application implementation;
- database, graph, vector, embedding, LLM, search, transport, or cloud SDK;
- external npm runtime packages.

Bootstrap MAY depend on the Knowledge Engine and concrete in-memory Store for explicit composition. The concrete Store MAY depend inward on Core-custodied Knowledge Contracts. These permitted source dependencies do not transfer semantic ownership.

Architecture enforcement MUST preserve all M0–M3 rules and add exact negative fixtures proving each new Knowledge dependency prohibition without overlapping false positives.

## Internal Components

The future M4 Knowledge Engine SHOULD contain only the internal responsibilities required to implement this specification:

- exact request and domain validation;
- acceptance and rejection decision orchestration;
- Knowledge identity and Accepted At allocation orchestration;
- immutable Record and Reference construction;
- Store invocation and hostile-result validation;
- Engine-confirmed accepted-identity metadata;
- Engine-governed current-order, version, and supersession metadata;
- deterministic failure normalization.

These are implementation responsibilities, not independently addressable capabilities or public services. M4 MUST NOT introduce a generic validator, repository facade, workflow framework, policy engine, or metadata subsystem.

## Engine Responsibilities

Knowledge Engine MUST:

- validate every public request and construction value at runtime;
- make every final acceptance, rejection, contradiction, and supersession decision;
- prevent Store mechanics from establishing semantic acceptance or currency;
- preserve immutable Provenance, Evidence, Claim, identity, time, and version values;
- keep historical Knowledge identifiable after supersession;
- expose only Engine-confirmed Knowledge through Contracts;
- normalize Store and runtime failures into approved privacy-safe failures;
- remain framework-free and technology-independent.

Knowledge Engine MUST NOT:

- infer factual truth or contradiction from text;
- authorize the acceptance authority under Security policy;
- mutate Memory or Context;
- expose its Store or internal accepted/current metadata to callers;
- retain rejected candidates as Knowledge;
- publish Events or access external services.

## Engine Lifecycle

M4 follows the established Engine lifecycle pattern:

1. **Initialize** — validate the required Store and construction-value Contracts.
2. **Ready** — dependencies are valid and no Knowledge operation is yet permitted.
3. **Running** — Evaluate, Get, and List operations are permitted.
4. **Stopped** — new Knowledge operations are rejected.

Initialization, start, and stop transitions MUST be explicit and deterministic. Initialization MUST NOT evaluate or accept a Claim, mutate Store, load external data, or publish an Event. Operations outside Running fail as Invalid Knowledge State. M4 defines no automatic restart, retry, recovery, migration, or distributed lifecycle.

## State Management

M4 keeps only the minimum process-local state required for correct semantics:

- Engine lifecycle state;
- Engine-confirmed accepted Knowledge identities;
- deterministic acceptance order for current-reference listing;
- current versus superseded currency;
- the positive version and direct predecessor relationship required for linear supersession.

This state is semantic Engine metadata, not a second content Store. Claim, Provenance, Evidence, and accepted Record content remain behind Knowledge Store. Internal collections MUST NOT be publicly mutable or exposed through an inspection capability.

State changes occur only after fully validated Store confirmation. Failed evaluation, rejected candidates, failed retrieval, malformed Store output, and failed supersession MUST NOT partially update accepted/current metadata. No production persistence, audit history, cache, synchronization, or transaction system is defined.

## Configuration

M4 introduces no domain-semantic runtime configuration. Normative bounds, closed vocabularies, list defaults, and version rules are fixed by this specification and MUST NOT be silently changed through environment variables or implementation settings.

Bootstrap MAY select deterministic non-sensitive fixture values for identity and timestamps. M4 requires no configuration framework, feature flag, provider configuration, database setting, Security-policy configuration, or external endpoint.

## Security

Knowledge Engine owns no authentication or authorization policy semantics. Security Engine remains the owner of Security policy and authorization decisions.

M4 validates untrusted runtime structure, minimizes exposed data, and requires the caller or protected invocation boundary to enforce the applicable Security-owned permission before submitting Acceptance Evidence or accessing Knowledge. This enforcement does not require direct Knowledge Engine to Security Engine coupling and does not transfer Knowledge acceptance semantics to Security.

An opaque Authority Identifier is provenance for an explicit review decision; it is not proof of identity or authorization. Structural acceptance does not certify the authority, Claim truth, Source Reference privacy, or absence of sensitive material. M4 implements no credentials, token inspection, signatures, roles, permission model, secret scanning, content moderation, or heuristic redaction.

The in-memory demonstration MUST use controlled non-personal Claims and MUST contain no credentials, tokens, secrets, raw provider payloads, or real user Knowledge.

## Failure Semantics

M4 defines the following minimum failures.

### Invalid Knowledge Input

A public request shape, list limit, contradiction field combination, timestamp, Originating Capability, Source Reference, Authority Identifier, or other general input violates its Contract. No identity is allocated, Store mutation occurs, or currency changes.

### Invalid Knowledge Identity

A caller-supplied or allocated Knowledge Identity violates the opaque identity Contract. Caller-supplied invalid identities fail before Store access. Invalid allocated identities fail before acceptance.

### Invalid Claim

Claim is absent, non-string, empty, whitespace-only, longer than 4096 Unicode code points, coercible rather than primitive, or otherwise violates the M4 Claim Contract.

### Invalid Acceptance Evidence

Evidence is absent, malformed, has an unknown method or decision, has an invalid Authority Identifier or Reason, contains unexpected fields, or otherwise violates the exact M4 Evidence Contract.

### Knowledge Not Found

Get identifies no Engine-confirmed accepted Knowledge. It also applies when a declared contradiction target is unknown or was never confirmed as accepted. Rejected and mechanically Store-only candidates are not found as Knowledge.

### Duplicate Knowledge Identity

An allocated identity already belongs to accepted Knowledge or Store reports a duplicate. Existing Knowledge remains unchanged and the candidate is not accepted.

### Contradiction Requires Resolution

A request declares `contradictsKnowledgeIdentity` without both an explicit valid contradiction decision and valid reason. No evaluation acceptance or Store mutation occurs.

### Invalid Supersession

A supersession targets historical/superseded Knowledge, encounters a non-consecutive or invalid Version relationship, attempts to supersede Version 9,007,199,254,740,991, or otherwise violates the linear current-target rule. Existing Knowledge remains current and unchanged, no successor identity or Record is created, and Store mutation does not occur.

Maximum-Version overflow is a semantic supersession failure. It is not Knowledge Store Unavailable, Duplicate Knowledge Identity, Invalid Claim, Invalid Knowledge Input, or Knowledge Not Found.

### Knowledge Store Unavailable

The Store cannot perform a requested technical operation or throws unexpectedly during invocation. The Engine preserves this distinction and MUST NOT report accepted, rejected, duplicate, or not-found success semantics.

### Invalid Knowledge State

A Store result, Store Record, confirmation, Engine-governed version/currency value, or constructed domain graph is null, malformed, contradictory, mutable where immutability is required, or has an unknown discriminant.

Failures MUST be deterministic, technology-neutral, distinguishable, and privacy-safe. Unexpected runtime failures MUST be normalized at public Knowledge Engine boundaries. Failure messages MUST NOT contain Claim text, Acceptance Reason, contradiction reason, authority identifier, raw Provenance, Source Reference, Store payload, credential, token, or implementation-specific exception detail.

## Runtime Boundary Safety

All public Knowledge Contract inputs, construction values, and Knowledge Store outputs remain untrusted until validated by Knowledge Engine or the responsible exported Core factory.

M4 implementations MUST explicitly validate:

- null and undefined values;
- primitives of the wrong type;
- arrays and non-record objects;
- exact request, Evidence, Provenance, Record, Reference, and result shapes;
- unexpected fields where M4 defines exact shapes;
- closed discriminants, decisions, Source Types, validation states, and currency values;
- primitive string requirements without coercion;
- every Unicode code-point bound;
- exact UTC timestamps and impossible calendar values;
- primitive, finite, exactly representable integer Versions from 1 through 9,007,199,254,740,991 inclusive;
- exact supersession increment safety and maximum-Version overflow rejection;
- list default and inclusive integer bounds;
- all-or-none contradiction resolution fields;
- every Store result, nested Record, identity, version, and confirmation;
- immutable constructed domain graphs and correspondence between results.

Implementations MUST NOT convert arbitrary values through `String`, interpolation, `toString`, `valueOf`, or equivalent coercion. They MUST NOT trust TypeScript brands, caller immutability, Store implementations, prototypes, property access, or discriminants at runtime.

Malformed caller input MUST produce the applicable input-domain failure. Exceptions during Store invocation MUST become Knowledge Store Unavailable unless they are an already recognized Store-domain failure. Malformed or hostile Store results, including exceptions during result inspection, MUST become Invalid Knowledge State. No native `TypeError`, implementation-specific error, raw payload, or sensitive value may escape a public boundary.

Externally supplied or Store-returned Version values of 0, negative values, fractions, NaN, positive or negative Infinity, strings, coercible objects, values greater than 9,007,199,254,740,991, or otherwise inexact values are invalid. A Store-returned Knowledge Record containing any invalid Version MUST become Invalid Knowledge State and MUST NOT become accepted Knowledge.

Exported Core Knowledge factories MUST accept runtime input as unknown, enforce complete exact shapes, defensively reconstruct approved nested domain values, and deeply freeze the complete returned domain graph. No validation library is prescribed.

## Normative Runtime Bounds

The following bounds are normative for M4 Contract validation, technology-neutral, and implementation-independent. They are not database column definitions, encoded-byte limits, provider constraints, or permanent universal limits for every future Knowledge representation. Future changes require an approved specification revision. Implementations MUST NOT silently broaden, narrow, normalize, or truncate them.

String length is measured in Unicode code points, not UTF-16 code units or encoded bytes. Values are validated without normalization and then counted as supplied.

| Field                     | Minimum | Maximum | Additional rule                                                          |
| ------------------------- | ------- | ------- | ------------------------------------------------------------------------ |
| Candidate Claim           | 1       | 4096    | Primitive string; non-empty and non-whitespace-only                      |
| Acceptance Reason         | 1       | 512     | Primitive string; non-empty and non-whitespace-only                      |
| Contradiction Reason      | 1       | 512     | Primitive string; non-empty and non-whitespace-only                      |
| Knowledge Identity        | 1       | 128     | Opaque primitive string; no leading or trailing whitespace               |
| Authority Identifier      | 1       | 128     | Opaque primitive string; no leading or trailing whitespace               |
| Originating Capability    | 1       | 128     | Opaque primitive string; no leading or trailing whitespace               |
| Optional Source Reference | 1       | 256     | When present, opaque primitive string; no leading or trailing whitespace |

For every bounded string, a value at the maximum is valid when all other rules hold; a value one code point above the maximum is invalid. Empty, whitespace-only where prohibited, non-string, and coercible values are invalid. No value may be silently truncated.

Knowledge Version uses the following independent M4 Contract bound:

| Field             | Minimum | Maximum               | Additional rule                                             |
| ----------------- | ------- | --------------------- | ----------------------------------------------------------- |
| Knowledge Version | 1       | 9,007,199,254,740,991 | Primitive, finite, exactly representable integer value only |

Knowledge Version MUST be a primitive integer value, MUST be finite, MUST be exactly representable, and MUST be within the inclusive range from 1 through 9,007,199,254,740,991. Version 1 is the only valid initial Version for independent accepted Knowledge. Zero, negative values, fractions, NaN, positive or negative Infinity, strings, coercible objects, non-number values, and values above the maximum are invalid. Implicit coercion is prohibited. M4 uses no BigInt semantics.

For valid supersession whose predecessor Version is below the maximum, the successor Version MUST equal predecessor Version plus one exactly. A predecessor at 9,007,199,254,740,991 cannot be superseded in M4 and MUST produce Invalid Supersession without arithmetic wrap, reset, reuse, truncation, or precision loss.

List Knowledge References uses:

- omitted limit: 50;
- minimum explicit limit: 1;
- maximum explicit limit: 100;
- positive integers only.

Zero, negative values, fractions, non-finite values, strings, arrays, and coercible objects are Invalid Knowledge Input.

Observed At and Accepted At MUST be primitive strings in exact UTC form `YYYY-MM-DDTHH:mm:ssZ` or `YYYY-MM-DDTHH:mm:ss.sssZ`. Implementations MUST validate the exact calendar value by parsing and round-tripping to the same canonical UTC instant, allowing omission of milliseconds only when the canonical milliseconds are `.000`. Impossible dates, timezone offsets, additional precision, non-string values, and coercion are invalid.

These bounds are deliberately aligned with the first operational vertical-slice pattern where the semantic roles match M3, but they are independently normative for M4 and do not make Memory and Knowledge interchangeable.

## Immutability

Candidate Claim, Acceptance Evidence, Knowledge Provenance, Knowledge Record, Knowledge Reference, Knowledge Acceptance Decision, and returned collections MUST be immutable.

Construction MUST defensively reconstruct approved nested values. Caller mutation after construction and mutation attempts through returned values MUST NOT change any constructed Knowledge graph or Engine state. Store values MUST NOT be returned directly as mutable internal state.

Supersession MUST NOT mutate the previous Record. Currency is Engine-governed relationship metadata used to construct current or superseded References. A successful supersession atomically changes capability-level currency only after the new Store confirmation is validated; it does not rewrite historical Claim, Provenance, Evidence, Accepted At, identity, or version.

A failed maximum-Version supersession MUST NOT mutate the predecessor Claim, Provenance, Evidence, Accepted At, identity, or Version; MUST NOT change current Knowledge selection; and MUST NOT allocate a successor identity, create a successor Record, or invoke Store.

## Observability and Privacy

M4 SHOULD expose:

- Engine lifecycle and health status;
- evaluation accepted/rejected outcome counts;
- retrieval and current-reference-listing outcome counts;
- supersession success count;
- current accepted Knowledge count;
- failures by M4 category;
- correlation identifier where policy permits.

M4 diagnostics MAY report only:

- Knowledge capability initialized;
- one controlled non-personal candidate accepted;
- accepted Knowledge retrieved;
- current reference count;
- one declared contradiction resolved by supersession;
- historical item no longer current;
- superseding item current.

Logs, metrics, failures, and diagnostics MUST NOT contain by default:

- raw Claim text;
- Acceptance Reason or contradiction reason;
- raw Knowledge Identity, authority identifier, or Source Reference;
- raw Provenance or source payload;
- Memory or Context content;
- personal information, credentials, secrets, authentication tokens, or authorization decisions;
- mutable Store representations.

Raw Knowledge identifiers MUST NOT appear in ordinary M4 diagnostics or logs. They MAY be used only as minimized or redacted operational correlation metadata under approved Security and privacy policy. Structural validation does not certify that opaque identifiers or references contain no sensitive data.

Mandatory diagnostic output MUST remain available under every supported log level. M4 requires no production observability vendor, audit system, or Event infrastructure.

## Performance

M4 defines no throughput, capacity, or latency target.

Correct acceptance governance, provenance, immutability, version traceability, privacy, and deterministic behavior take precedence over optimization. Performance work MUST NOT introduce bulk Claim loading, search indexes, caching, speculative prefetch, persistence, parallel evaluation, or external services.

## Testing

The future M4 implementation MUST include deterministic tests for:

- every Core value and exported factory with valid, invalid, coercible, hostile, and mutable caller input;
- exact Unicode code-point bounds, including non-BMP Claim, Reason, identity, capability, authority, and Source Reference cases;
- exact UTC timestamps, leap days, impossible calendar dates, malformed precision, and non-string values;
- explicit accept and reject Evidence decisions;
- absence of automatic acceptance from Memory, source classification, Store presence, or Engine output;
- identity allocation, collisions, Store duplicate results, and confirmation identity mismatch;
- deeply immutable Records, Evidence, Provenance, References, Decisions, and returned collections;
- successful evaluation, Store confirmation, deterministic Get, and current-reference List;
- default, boundary, malformed, non-finite, and coercible list limits;
- declared contradiction requiring a complete resolution;
- reject-candidate preservation of existing current Knowledge;
- successful linear supersession, exact version increment, immutable historical retrieval, and current-list replacement;
- Knowledge Version minimum and maximum boundaries;
- Version 0, negative, fractional, NaN, Infinity, string, non-number, and coercible-object rejection;
- exact supersession from 9,007,199,254,740,990 to 9,007,199,254,740,991;
- maximum-Version supersession rejection as Invalid Supersession without identity allocation, Store mutation, predecessor mutation, or current-selection change;
- malformed Store-returned Knowledge Versions becoming Invalid Knowledge State;
- unknown, historical, and otherwise invalid supersession targets;
- Store unavailable behavior for put and get;
- mechanically written but unconfirmed candidates remaining absent from Get and List;
- null, primitive, array, malformed, contradictory, and hostile Proxy Store results;
- native and non-Error Store throws and exact failure classification;
- Engine lifecycle and explicit Bootstrap composition;
- privacy-safe diagnostics at debug, info, warn, and error;
- dependency rules preventing Core and Knowledge Engine outward coupling.

Tests MUST require no network, database, graph store, vector store, embedding model, LLM, web search, external Provider, Event infrastructure, clock-dependent nondeterminism, or nondeterministic identity generation.

## M4 Implementation Boundary

The future M4 implementation SHOULD include only:

- Core-custodied Knowledge identifiers, values, Contracts, Store abstraction, construction values, references, decisions, and failures;
- a framework-free Knowledge Engine;
- deterministic controlled Knowledge identity and Accepted At construction values;
- one deterministic in-memory Knowledge Store outside Core and Knowledge Engine behavior;
- explicit Bootstrap composition;
- Evaluate Knowledge Claim, Get Knowledge, and List Knowledge References behavior;
- explicit-authority Acceptance Evidence;
- caller-declared contradiction resolution by rejection or linear supersession;
- process-local Engine-confirmed accepted/current/version metadata;
- immutable historical retrieval and current reference discovery;
- one controlled non-personal diagnostic Claim and one explicit superseding Claim;
- unit, Contract, Store, version, immutability, adversarial runtime, architecture, privacy, and smoke tests.

The future implementation MUST NOT include:

- production database, repository, ORM, filesystem, cache, graph store, or vector store;
- Knowledge graph, ontology, edge, semantic-linking, inference, or truth-maintenance behavior;
- embeddings, semantic search, ranking, confidence propagation, or source consensus;
- LLMs, AI Providers, web search, external verifier Providers, Adapters, or integrations;
- automatic claim extraction, truth inference, validation, or contradiction detection;
- Memory promotion, Memory Engine integration, or Memory mutation;
- Context integration or Context modification;
- Reasoning or Planning behavior;
- Events, Event Bus, broker, queue, or distributed synchronization;
- HTTP, API, Gateway, client, container, cloud, or deployment technology;
- Security Engine implementation, roles, permissions, credentials, or production authorization policy;
- production audit history or retention of rejected candidate payloads;
- branches, merges, rollback, deletion, deprecation, archival, or generalized Knowledge lifecycle;
- external runtime dependencies unless separately approved.

## Acceptance Criteria

M4 is implementation-ready only when this specification is Active and the future implementation proves all of the following:

1. Knowledge Engine is the single semantic owner of Knowledge acceptance, validation state, versioning, contradiction resolution, and current semantics.
2. Core custodies shared Knowledge definitions and Contracts without owning Knowledge behavior.
3. Knowledge capability composes explicitly and becomes operational without a framework or external service.
4. A valid bounded Candidate Claim with valid Provenance and explicit `accept` Evidence is accepted through Evaluate Knowledge Claim.
5. Accepted Knowledge receives one valid Engine-assigned stable Knowledge Identity and Version 1.
6. Claim text is not Knowledge before successful Store confirmation and Engine-governed acceptance.
7. Candidate Claim accepts valid values through exactly 4096 Unicode code points and rejects 4097 without truncation.
8. Acceptance Reason and Contradiction Reason each accept valid values through exactly 512 Unicode code points and reject 513 without truncation.
9. Knowledge Identity, Authority Identifier, and Originating Capability accept structurally valid primitive strings through exactly 128 Unicode code points and reject 129, surrounding whitespace, empty, whitespace-only, non-string, and coercible values.
10. Optional Source Reference is valid when absent and, when present, accepts structurally valid opaque primitive strings through exactly 256 Unicode code points while rejecting 257, surrounding whitespace, empty, whitespace-only, non-string, and coercible values.
11. Every bounded string uses Unicode code-point rather than UTF-16 code-unit or encoded-byte length, including deterministic non-BMP boundary tests.
12. List defaults an omitted limit to 50, accepts integer limits 1 and 100, and rejects zero, negatives, fractions, non-finite numbers, strings, 101, and coercible objects.
13. Exact UTC timestamp validation accepts valid normal and leap-day values and rejects impossible calendar dates, offsets, malformed precision, and coercible values.
14. Accepted Knowledge Record, Claim, Provenance, Evidence, Reference, Decision, and returned collections are deeply immutable and defensively reconstructed.
15. Provenance preserves Source Type, Originating Capability, Observed At, and optional Source Reference separately from Accepted At and Acceptance Evidence.
16. Provenance and source presence do not independently make a Claim true or accepted.
17. Valid `reject` Evidence returns authority-rejected without identity allocation, Record creation, Store mutation, or Knowledge visibility.
18. Rejected, invalid, unconfirmed, and mechanically Store-only candidates are absent from Get and List.
19. Get Knowledge deterministically returns an Engine-confirmed immutable accepted Record and its correct current or superseded Reference.
20. Get Knowledge fails explicitly for an unknown, rejected, or unconfirmed identity.
21. List Knowledge References returns deterministic immutable current references only, respects the resolved limit, and exposes no Claim, Evidence, or raw Provenance.
22. A declared contradiction without complete resolution fails as Contradiction Requires Resolution and changes no Knowledge.
23. Explicit `reject-candidate` preserves the current existing Knowledge item and creates no Knowledge from the candidate.
24. Explicit `supersede-existing` with valid accept Evidence creates a new identity at exactly target Version plus one and records the direct Supersedes identity.
25. Successful supersession leaves the previous Record immutable and historically retrievable, marks it non-current only through Engine-governed metadata, and lists only the new current Reference.
26. Supersession of an unknown target fails as Knowledge Not Found; supersession of a historical target fails as Invalid Supersession.
27. No existing Knowledge is silently overwritten, deleted, mutated, or made non-current before valid new Store confirmation.
28. Duplicate identity cannot overwrite Knowledge or produce success.
29. Store unavailable fails explicitly without acceptance or currency change.
30. Native and non-Error Store invocation throws normalize to Knowledge Store Unavailable without leaking details.
31. Null, primitive, array, hostile Proxy, malformed discriminant, malformed nested Record, contradictory confirmation, identity mismatch, and version mismatch Store results fail as Invalid Knowledge State.
32. No native exception or implementation-specific failure escapes public Knowledge boundaries.
33. Store provides only mechanical put/get behavior and cannot semantically accept Claims, choose validation state, assign version/current meaning, or resolve contradictions.
34. User assertions, Memory items, Reasoning output, Provider output, imported content, and Store presence are never promoted automatically.
35. Knowledge remains semantically distinct from Memory and Context, and M4 modifies neither capability.
36. Knowledge Reference is privacy-minimal and suitable for future Context use without transferring ownership.
37. Source Reference receives structural validation only; callers remain responsible for excluding sensitive data and no heuristic secret detection is performed.
38. Diagnostics prove initialization, acceptance, retrieval, current discovery, and supersession using controlled non-personal fixtures without exposing raw identities, Claims, Reasons, authority identifiers, Provenance, Source References, personal data, credentials, or tokens.
39. Mandatory diagnostic output survives debug, info, warn, and error log levels.
40. Architecture enforcement prevents Core from depending on Knowledge Engine and prevents Knowledge Engine from depending on Bootstrap, Infrastructure, concrete Store implementation, another Engine implementation, or external npm packages.
41. Unit, Contract, Store, supersession, immutability, adversarial, architecture, privacy, and smoke tests are deterministic and pass with all M0–M3 tests.
42. No database, graph, vector, embedding, LLM, web search, external integration, Event infrastructure, production persistence, or deferred technology is required.
43. Version 1 is accepted as the only valid initial Version for independent Knowledge, while Version 0, negative, fractional, NaN, Infinity, string, non-number, and coercible Version values are rejected.
44. Knowledge Version 9,007,199,254,740,991 is valid as an existing exactly representable maximum Version, and values above it are rejected.
45. Superseding Version 9,007,199,254,740,990 produces exactly Version 9,007,199,254,740,991 without precision loss.
46. Attempting to supersede Version 9,007,199,254,740,991 fails as Invalid Supersession and is not classified as Store failure, duplicate identity, Invalid Claim, Invalid Knowledge Input, or Knowledge Not Found.
47. Failed maximum-Version supersession allocates no successor identity, creates no successor Record, performs no Store mutation, and leaves the predecessor current and unchanged.
48. Malformed Store-returned Records containing invalid, inexact, or out-of-range Versions fail as Invalid Knowledge State and never become accepted Knowledge.
49. Version arithmetic never wraps, resets, reuses the predecessor Version, truncates, or silently loses precision.

## Future Evolution

Later approved milestones MAY add:

- additional validation methods and trusted-source policies;
- Security-enforced production acceptance authority and Knowledge access;
- Identity association and review attribution through approved Contracts;
- Memory References as qualified provenance or evidence without automatic promotion;
- Knowledge projections consumed by Context;
- confidence classifications, verification refresh, review, deprecation, and archival;
- branches, merges, multi-source reconciliation, contradiction detection, and truth maintenance;
- structured claims, procedures, stable platform definitions, semantic relationships, ontologies, or graphs;
- search, indexing, ranking, embeddings, or external verification behind approved Contracts;
- production persistence and version metadata behind technology-neutral Stores;
- meaningful Knowledge domain Events.

Every extension MUST preserve Knowledge Engine semantic ownership, explicit acceptance, provenance, reviewability, version traceability, the Memory/Knowledge/Context partition, Core Contract custody, Security governance, privacy, and inward dependency direction.

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
- [OES-0010 — Versioning Standards](../../../docs/engineering/OES-0010-Versioning-Standards.md)
- [ARCH-0001 — Core Architecture](../../architecture/ARCH-0001-Core-Architecture.md)
- [CONCEPT-0001 — Memory Model](../../concepts/CONCEPT-0001-Memory-Model.md)
- [CONCEPT-0002 — Knowledge Model](../../concepts/CONCEPT-0002-Knowledge-Model.md)
- [CONCEPT-0003 — Context Model](../../concepts/CONCEPT-0003-Context-Model.md)
- [ENGINE-0002 — Identity Engine](../identity/ENGINE-0002-Identity-Engine.md)
- [ENGINE-0003 — Context Engine](../context/ENGINE-0003-Context-Engine.md)
- [ENGINE-0004 — Memory Engine](../memory/ENGINE-0004-Memory-Engine.md)
- [IMPLEMENTATION-M0 — Executable Architectural Skeleton](../../../IMPLEMENTATION-M0.md)
- [IMPLEMENTATION-M1 — Identity Engine Vertical Slice](../../../IMPLEMENTATION-M1.md)
- [IMPLEMENTATION-M2 — Context Engine Vertical Slice](../../../IMPLEMENTATION-M2.md)
- [IMPLEMENTATION-M3 — Memory Engine Vertical Slice](../../../IMPLEMENTATION-M3.md)

## Engineering Motto

> Knowledge is accepted through explicit justification, never by accidental presence.
