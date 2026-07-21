# ENGINE-0006 — Reasoning Engine

| Field          | Value                                                  |
| -------------- | ------------------------------------------------------ |
| **Status**     | Active                                                 |
| **Version**    | 1.0.0                                                  |
| **Owner**      | Project Maintainers                                    |
| **Created**    | 2026-07-20                                             |
| **Updated**    | 2026-07-20                                             |
| **Applies To** | Reasoning Engine, M5 — Reasoning Engine Vertical Slice |

---

## Status

This specification is Active and authorizes M5 implementation according to the documentation authority rules.

The key words **MUST**, **MUST NOT**, **SHOULD**, **SHOULD NOT**, and **MAY** describe normative requirements proposed by this specification.

## Purpose

The Reasoning Engine answers:

> What follows from the supplied situation under the approved reasoning rules?

It is the single semantic owner of reasoning. It evaluates exactly one immutable Active Context Revision and a bounded Reasoning Query, may consider already-selected read-only Memory and Knowledge References, and returns one deterministic immutable Reasoning Outcome.

M5 proves the smallest complete Reasoning pattern with a deliberately limited rule set. It does not implement general intelligence, natural-language understanding, model inference, cognitive orchestration, planning, Skill execution, or final response delivery.

## Capability Ownership

The Reasoning Engine owns:

- M5 inference and evaluation semantics;
- admissibility of a Reasoning Request;
- consumption semantics for exactly one Active Context Revision;
- the deterministic M5 rule set and rule precedence;
- Reasoning Outcome semantics;
- Candidate Conclusion, Candidate Response, and Candidate Next Action semantics;
- safe structured Reasoning Explainability semantics;
- Reasoning-domain failure semantics.

Core is the canonical custodian of shared Reasoning Contracts, immutable input and output schemas, failure definitions, and references. Core custody governs shared language, compatibility, and versioning; it does not transfer reasoning behavior to Core.

The Reasoning Engine does not own:

- Context composition, activation, expiration, retrieval, or mutation;
- Identity resolution, authentication, authorization, or Security policy;
- Memory retention, retrieval, forgetting, selection, or reclassification;
- Knowledge acceptance, validation, contradiction resolution, supersession, or current-selection semantics;
- Brain orchestration, Planning, Skill discovery or execution, or workflow control;
- final response assembly, transport, presentation, voice rendering, or Client delivery;
- LLM, model, Provider, search, persistence, or deployment technology.

## Scope

M5 includes:

- one exact-shape Evaluate Reasoning Contract;
- exactly one immutable Active Context Revision per evaluation;
- the existing Context-projected Anonymous or Authenticated Identity state;
- one bounded opaque textual Reasoning Query;
- zero through twenty already-selected immutable Memory References;
- zero through twenty already-selected immutable current Knowledge References;
- four explicit deterministic rule categories;
- one immutable Reasoning Outcome containing a Candidate Conclusion, Candidate Response, advisory Candidate Next Action, and privacy-minimal explainability;
- framework-free process-local evaluation with no retained reasoning history;
- runtime-safe failures, privacy-safe diagnostics, architecture enforcement, and deterministic tests.

M5 evaluates only the supplied request. It does not discover, retrieve, enrich, rank, or persist any input.

## Non-Goals

M5 does not define or implement:

- general AI, probabilistic inference, natural-language semantic interpretation, or model reasoning;
- prompts, provider messages, temperature, token limits, tool calls, model parameters, or LLM Providers;
- Brain Engine, cognitive-pipeline orchestration, or capability selection;
- Planning Engine, plans, tasks, steps, dependencies, or execution strategy;
- Skill discovery, permission evaluation, invocation, or execution;
- Memory retrieval, automatic retention, forgetting, promotion, or content access;
- Knowledge retrieval, acceptance, candidate evaluation, contradiction resolution, or mutation;
- Context composition, Context retrieval, revision activation, expiration, or mutation;
- web search, semantic search, embeddings, vectors, graphs, databases, caches, or filesystems;
- Events, brokers, queues, workflows, external tools, Providers, Adapters, Gateways, or Clients;
- private chain-of-thought capture, storage, inspection, transmission, or exposure;
- final response delivery, UI formatting, speech generation, or transport;
- production persistence, audit infrastructure, distributed execution, or deployment topology.

## Core Concepts

### Reasoning Request

A **Reasoning Request** is one exact-shape immutable proposal for a single reasoning cycle. It contains one explicit `evaluate` intent, one Active Context Revision, one Reasoning Query, and optional Memory and Knowledge Reference collections.

### Active Context Input

The **Active Context Input** is a defensively reconstructed immutable view of exactly one Context Revision whose lifecycle state is Active. It preserves the Context Lineage Identity, Context Revision Identity, revision number, parent relationship where present, creation metadata, and the M2 Identity Context Fragment required to evaluate M5 rules.

It is consumed as supplied. Reasoning does not retrieve, activate, replace, expire, or mutate Context.

### Reasoning Query

A **Reasoning Query** is one bounded textual statement describing what the caller asks Reasoning to evaluate. M5 treats it as opaque input: it validates and preserves the text but performs no natural-language parsing or semantic interpretation.

The M5 rules assess the contextual grounding available for that query. They do not answer arbitrary factual or procedural questions.

### Reasoning Outcome

A **Reasoning Outcome** is the immutable completed result of one successful M5 evaluation. It contains:

- status `completed`;
- one closed Outcome Category;
- one Candidate Conclusion;
- one Candidate Response;
- one advisory Candidate Next Action;
- one immutable Explainability Summary.

M5 does not allocate a Reasoning Outcome Identity. The synchronous outcome is not persisted, referenced later, published as an Event, or treated as an independently governed entity. Introducing stable outcome identity requires a future approved use case and concrete identity semantics.

### Candidate Conclusion

A **Candidate Conclusion** is bounded text produced by the selected M5 rule. It is a reasoning result only. It is not accepted Knowledge, validation evidence, Memory, Context, a plan, or an authorization decision.

### Candidate Response

A **Candidate Response** is bounded technology-neutral text proposed for later orchestration. It is not a final cognitive result, Client response, rendered message, voice output, or transport payload.

### Candidate Next Action

A **Candidate Next Action** is one advisory closed category. M5 supports exactly:

- `none`;
- `request-more-context`.

It does not command Brain, Planning, Skills, Clients, or another capability and cannot cause execution.

### Explainability Summary

A **Reasoning Explainability Summary** records only the high-level basis needed to explain which deterministic M5 rule applied. It contains:

- a safe Context Consumption Reference;
- Identity State: `anonymous` or `authenticated`;
- Memory Reference Count;
- Knowledge Reference Count;
- one closed Rule Category.

It contains no query text, conclusion text, response text, raw Identity Identifier, Memory or Knowledge content, private reasoning trace, or chain-of-thought.

## Invariants

1. Reasoning Engine is the single semantic owner of reasoning behavior.
2. Every successful M5 cycle consumes exactly one valid immutable Active Context Revision.
3. A non-Active, Expired, malformed, absent, or multiple Context input cannot produce a Reasoning Outcome.
4. Reasoning never composes, retrieves, activates, expires, or mutates Context.
5. Identity state is consumed only from the Context-owned Identity projection.
6. Authenticated means an Identity projection is authenticated; it never implies authorization or permission.
7. Memory and Knowledge inputs are optional, already selected, read-only References.
8. Reasoning never retrieves or mutates Memory or Knowledge and never treats Memory as Knowledge.
9. A Candidate Conclusion is not accepted Knowledge and cannot bypass Knowledge Engine governance.
10. A Candidate Response is not final delivery and cannot bypass Brain or presentation boundaries.
11. A Candidate Next Action is advisory and causes no Planning or Skill execution.
12. M5 rule selection is deterministic and follows the exact precedence defined below.
13. Reasoning Outcomes and all nested values are deeply immutable and contain no caller-owned mutable references.
14. Explainability is structured and privacy-minimal; private chain-of-thought is never required or exposed.
15. Reasoning retains no query, Context, references, outcome, or reasoning history after the synchronous operation completes.
16. The same valid request produces the same Outcome Category, controlled texts, action, and explainability counts.

## Reasoning Input

Evaluate Reasoning accepts one exact-shape request containing:

- `intent`: exactly `evaluate`;
- `activeContextRevision`: exactly one complete Active Context Revision;
- `query`: one valid Reasoning Query;
- optional `memoryReferences`: an immutable-input collection of Memory References;
- optional `knowledgeReferences`: an immutable-input collection of Knowledge References.

Omitted reference collections resolve deterministically to empty collections. Explicit `null` is not omission and is invalid under the applicable Invalid Memory Reference or Invalid Knowledge Reference failure. The singular Context field is mandatory. A request containing an `activeContextRevisions`, `contexts`, secondary Context, or any unexpected top-level field is Invalid Reasoning Input.

The Engine MUST validate the complete request before selecting a rule. It MUST defensively reconstruct the Context input and every supplied Reference. It MUST NOT retain a caller-owned object or array.

The Reasoning Query:

- MUST be a primitive string;
- MUST be non-empty and non-whitespace-only;
- MAY contain internal and surrounding whitespace because it is content;
- MUST contain from 1 through 2048 Unicode code points;
- MUST be preserved exactly without normalization, parsing, coercion, or truncation.

M5 query text is a narrow request representation, not a provider prompt or universal future Reasoning format.

## Active Context Requirement

Exactly one Active Context Revision is required for each Evaluate Reasoning call.

The Engine MUST validate and reconstruct the complete M2 Context Revision shape, including:

- one valid Context Lineage Identity;
- one valid Context Revision Identity;
- one positive safe-integer Context Revision Number;
- the approved parent-revision relationship shape;
- valid Context creation metadata;
- lifecycle state exactly `active`;
- exactly one Identity Context Fragment;
- fragment authoritative owner exactly `identity`;
- Identity projection state exactly `anonymous` or `authenticated`;
- for Authenticated only, one valid Identity Identifier;
- no Identity Identifier for Anonymous;
- no unexpected revision, metadata, fragment, or projection fields.

Reasoning MUST use the accepted Core-custodied Context and Identity validation rules rather than redefine their syntax. M5 does not broaden or narrow Context identifier, revision-number, timestamp, metadata, or Identity Identifier semantics.

A structurally valid revision in `collecting`, `composing`, `validating`, `expired`, or `archived` state produces Inactive Context. A malformed revision produces Invalid Active Context. An Expired revision MUST NOT be consumed as fallback.

Reasoning validates Active state once at its input boundary, reconstructs an immutable cycle-local value, and evaluates only that value. It MUST NOT call Get Active Context Revision or otherwise retrieve a different revision during the same call. It MUST NOT alter the supplied Context object or its source Engine state.

The Context Consumption Reference contains only:

- Context Lineage Identity;
- Context Revision Identity;
- Context Revision Number;
- lifecycle state `active`;
- authoritative capability `context`.

It exists in the returned Outcome for traceability. Diagnostics and ordinary logs MUST omit raw Context identities.

## Memory Input Boundary

Memory input is optional. When supplied, it consists only of exact-shape immutable M3 Memory References already selected before reasoning.

Each accepted Reference MUST contain:

- one valid Memory Identity;
- Kind `episodic`;
- authoritative capability `memory`;
- lifecycle state `stored`.

M5 accepts zero through twenty Memory References. Duplicate Memory Identities in one request are invalid because they would distort explainability counts without adding evidence.

If `memoryReferences` is omitted, Reasoning uses an empty collection. If it is explicitly present, every collection-level and item-level defect MUST produce Invalid Memory Reference. This includes `null`, undefined, a primitive or other non-array value, a sparse array, an array with unexpected enumerable properties, more than twenty items, a malformed item, an invalid or coercible Memory Identity, unexpected item fields, or duplicate Memory Identities. These conditions MUST NOT become Invalid Reasoning Input.

Reasoning MUST NOT:

- invoke Retain, Get, List, Forget, or any Memory Engine implementation;
- access Memory Content, Provenance, Retention Intent, Retrieval Receipts, or last-used metadata;
- infer that a referenced experience is true;
- promote, reclassify, update, or forget Memory.

A Memory Reference contributes only that an already-selected retained experience reference was available to the cycle.

## Knowledge Input Boundary

Knowledge input is optional. When supplied, it consists only of exact-shape immutable current M4 Knowledge References already selected before reasoning.

Each accepted Reference MUST contain:

- one valid Knowledge Identity;
- validation state `accepted`;
- one valid Knowledge Version;
- currency `current`;
- authoritative capability `knowledge`.

M5 accepts zero through twenty Knowledge References. Duplicate Knowledge Identities in one request are invalid. Superseded References are valid historical Knowledge projections in their owning capability but are inadmissible for M5 current-grounding rules and produce Invalid Knowledge Reference.

A protected caller or orchestration boundary MUST supply Knowledge References issued or projected through the Knowledge capability boundary and is responsible for their semantic freshness at invocation time. Reasoning validates the complete structural Reference, including the required `current` Currency, and consumes it as immutable prepared input. Reasoning does not call Knowledge Engine, query current Knowledge state, refresh a Reference, or independently certify freshness. Structural acceptance means only that the supplied value conforms to the approved current-Knowledge projection Contract; it does not mean Reasoning verified the Reference against current Knowledge Engine state. A structurally valid but semantically stale Reference is an upstream orchestration or input-governance failure that M5 Reasoning cannot independently detect.

If `knowledgeReferences` is omitted, Reasoning uses an empty collection. If it is explicitly present, every collection-level and item-level defect MUST produce Invalid Knowledge Reference. This includes `null`, undefined, a primitive or other non-array value, a sparse array, an array with unexpected enumerable properties, more than twenty items, a malformed item, invalid or coercible Identity or Version values, Currency other than `current`, unexpected item fields, or duplicate Knowledge Identities. These conditions MUST NOT become Invalid Reasoning Input. M5 introduces no stale-Knowledge failure category.

Reasoning MUST NOT:

- invoke Evaluate Knowledge Claim, Get Knowledge, List Knowledge References, or any Knowledge Engine implementation;
- access Claim text, Provenance, Acceptance Evidence, authority identifiers, or Source References;
- accept, reject, supersede, validate, or mutate Knowledge;
- treat a Candidate Conclusion as accepted Knowledge.

A Knowledge Reference contributes only that the caller supplied a value structurally conforming to the current accepted Knowledge projection Contract. It does not independently certify freshness or transfer Knowledge ownership to Reasoning.

## Deterministic M5 Rule Set

M5 evaluates rules in the following exact precedence. Exactly one rule applies.

### Rule A — Anonymous Context

Condition:

- Context Identity State is `anonymous`.

This rule has precedence over reference counts.

Outcome:

- Outcome Category: `anonymous-context`;
- Candidate Conclusion: `The active context identifies an anonymous actor.`;
- Candidate Response: `Additional identity context may be required before further orchestration.`;
- Candidate Next Action: `request-more-context`;
- Rule Category: `anonymous-identity`.

Memory or Knowledge References, if supplied, remain counted but do not make the actor authenticated or authorize action.

### Rule B — Authenticated with Knowledge

Condition:

- Context Identity State is `authenticated`; and
- Knowledge Reference Count is greater than zero.

Outcome:

- Outcome Category: `knowledge-grounded-context`;
- Candidate Conclusion: `The authenticated context includes accepted Knowledge references.`;
- Candidate Response: `Accepted Knowledge context is available for further orchestration.`;
- Candidate Next Action: `none`;
- Rule Category: `authenticated-with-knowledge`.

Memory References may also be present but do not override accepted Knowledge grounding.

### Rule C — Authenticated with Memory Only

Condition:

- Context Identity State is `authenticated`;
- Knowledge Reference Count is zero; and
- Memory Reference Count is greater than zero.

Outcome:

- Outcome Category: `experience-informed-context`;
- Candidate Conclusion: `The authenticated context includes Memory references but no Knowledge references.`;
- Candidate Response: `Only retained experience references are available for further orchestration.`;
- Candidate Next Action: `none`;
- Rule Category: `authenticated-with-memory-only`.

This rule does not treat referenced experience as accepted truth and does not propose automatic Knowledge promotion.

### Rule D — Authenticated Context Only

Condition:

- Context Identity State is `authenticated`;
- Knowledge Reference Count is zero; and
- Memory Reference Count is zero.

Outcome:

- Outcome Category: `context-only`;
- Candidate Conclusion: `The authenticated context contains no supplied Memory or Knowledge references.`;
- Candidate Response: `No Memory or Knowledge references were supplied for further orchestration.`;
- Candidate Next Action: `request-more-context`;
- Rule Category: `authenticated-context-only`.

The rules classify available grounding for the opaque Query. They do not determine truth, authorization, a plan, an executable action, or a final response.

## Reasoning Outcome

A successful evaluation returns one exact-shape deeply immutable Reasoning Outcome containing:

- `status`: `completed`;
- `category`: one of `anonymous-context`, `knowledge-grounded-context`, `experience-informed-context`, or `context-only`;
- `candidateConclusion`: one bounded Candidate Conclusion;
- `candidateResponse`: one bounded Candidate Response;
- `candidateNextAction`: `none` or `request-more-context`;
- `explainability`: one immutable Reasoning Explainability Summary.

The Outcome contains no input Query, raw Context, Memory or Knowledge Reference arrays, Identity Identifier, provider output, model configuration, confidence score, private trace, chain-of-thought, plan, Skill request, authorization result, or transport metadata.

M5 status has only `completed`. Invalid input and evaluation failure are failures, not persisted or returned Outcome states. M5 defines no partial, pending, streaming, cancelled, or failed Outcome object.

## Candidate Conclusion

Candidate Conclusion is immutable primitive text constructed from the fixed rule output. It MUST contain from 1 through 1024 Unicode code points and MUST NOT be normalized, coerced, or truncated.

The Engine MUST use exactly the controlled text assigned to the selected M5 rule. It MUST NOT copy the Reasoning Query, Memory content, Knowledge Claim, Identity Identifier, or Context Identifier into the conclusion.

A Candidate Conclusion:

- is not Knowledge;
- has no accepted validation state;
- does not mutate or supersede Knowledge;
- does not certify truth beyond the category of supplied references;
- MAY be considered by future Brain orchestration for a separately governed Knowledge evaluation request.

Reasoning itself MUST NOT submit that request in M5.

## Candidate Response

Candidate Response is immutable primitive text constructed from the fixed rule output. It MUST contain from 1 through 2048 Unicode code points and MUST NOT be normalized, coerced, or truncated.

The Engine MUST use exactly the controlled text assigned to the selected M5 rule. It MUST NOT echo the Query or include raw Context, Memory, Knowledge, or Identity identifiers or content.

A Candidate Response is advisory cognitive output. It is not:

- the Brain's final cognitive result;
- final Client delivery;
- presentation or UI formatting;
- voice rendering;
- a transport message;
- a Skill result.

## Candidate Next Action

M5 includes Candidate Next Action because it distinguishes a completed contextual assessment from an advisory need for more Context without introducing Planning.

The vocabulary is closed:

- `none` — no additional action category is proposed by the M5 rule;
- `request-more-context` — later orchestration may decide whether to obtain another Context Revision or additional governed input.

The value is advisory only. It MUST NOT invoke Context, Brain, Planning, Skills, Security, Clients, or external systems. It contains no arguments, target, identifier, schedule, permissions, execution status, or arbitrary text.

## Explainability

M5 explainability is a safe structured summary, not a reasoning transcript.

The Explainability Summary contains exactly:

- `contextReference`: the immutable Context Consumption Reference;
- `identityState`: `anonymous` or `authenticated`;
- `memoryReferenceCount`: integer from 0 through 20;
- `knowledgeReferenceCount`: integer from 0 through 20;
- `ruleCategory`: `anonymous-identity`, `authenticated-with-knowledge`, `authenticated-with-memory-only`, or `authenticated-context-only`.

The summary explains which Context Revision was consumed, which identity category was projected, how many references were considered, and which public deterministic rule produced the Outcome.

M5 MUST NOT create, retain, expose, log, or contract for:

- private chain-of-thought;
- hidden reasoning tokens;
- intermediate natural-language deliberation;
- provider traces or prompts;
- raw query, conclusion, or response text in diagnostics;
- Memory content or Knowledge Claim content.

## Contracts

Core custodies the minimum M5 shared definitions. Reasoning Engine owns their behavior.

### Evaluate Reasoning

| Property                          | Definition                                                                                                                                                                                          |
| --------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Version**                       | 1.0.0                                                                                                                                                                                               |
| **Purpose**                       | Evaluate one bounded Query against exactly one supplied Active Context Revision and optional already-selected References.                                                                           |
| **Domain semantic owner**         | Reasoning Engine                                                                                                                                                                                    |
| **Schema custodian**              | Core                                                                                                                                                                                                |
| **Implementation responsibility** | Reasoning Engine                                                                                                                                                                                    |
| **Input**                         | Exact `evaluate` request, one Active Context Revision, one Reasoning Query, optional bounded Memory References, optional bounded current Knowledge References.                                      |
| **Output**                        | One deeply immutable completed Reasoning Outcome.                                                                                                                                                   |
| **Failures**                      | Invalid Reasoning Input, Invalid Active Context, Inactive Context, Invalid Reasoning Query, Invalid Memory Reference, Invalid Knowledge Reference, Reasoning Rule Failure, Invalid Reasoning State. |
| **Guarantees**                    | Exactly one Context Revision consumed, deterministic rule precedence, no input mutation, no external capability invocation, privacy-minimal explainability.                                         |

Evaluate Reasoning is the only public Reasoning capability Contract required by M5. There is no Reasoning Store, Get Outcome, List Outcome, stream, provider, trace-inspection, plan, Skill, or Event Contract.

### Reasoning Construction

M5 requires no construction-value Contract because it allocates no Reasoning identity or timestamp and retains no Reasoning state. Fixed controlled Candidate texts and closed categories are part of Reasoning Engine semantics, not caller-supplied construction values.

## Brain / Reasoning Boundary

Reasoning Engine reasons. Brain Engine orchestrates cognitive capabilities.

M5 receives an already-prepared request and returns one candidate Outcome. It MUST NOT:

- select or invoke Context, Memory, Knowledge, Planning, Skills, Security, or Voice;
- decide the global next capability in the cognitive pipeline;
- manage retries, fallbacks, multi-cycle conversations, or workflows;
- assemble the final cognitive result;
- deliver a response to a Client.

The protected caller or future orchestration boundary is responsible for selecting the single Active Context Revision, selecting Memory References, selecting Knowledge capability-issued current Knowledge References, ensuring Reference freshness before invocation, and supplying prepared immutable inputs. Reasoning remains responsible only for structural validation, deterministic evaluation, and Reasoning Outcome semantics. This responsibility split does not implement Brain Engine or transfer Context, Memory, or Knowledge semantics to the caller.

Candidate Next Action does not transfer orchestration ownership. A future Brain Engine MAY interpret it under a separately approved Contract while remaining responsible for orchestration.

M5 does not implement Brain Engine or modify ENGINE-0001.

## Relationship with Context

Context answers:

> What is relevant right now?

Reasoning answers:

> What follows from that supplied situation under the approved rules?

Reasoning consumes exactly one immutable Active Context Revision supplied through Core-custodied types. It does not depend on Context Engine implementation, call Get Active Context Revision, select a lineage, compose fragments, determine relevance, or change lifecycle state.

The Context Revision remains owned by Context. Its Identity projection remains owned by Identity. Defensive reconstruction for input safety does not transfer semantic ownership.

## Relationship with Memory

Memory answers:

> What have I experienced?

Reasoning may consider already-selected safe Memory References as evidence that retained experiences are available. It cannot access their content or treat those experiences as accepted truth.

M5 does not retrieve, retain, forget, update, or automatically promote Memory. No Reasoning Outcome creates Memory. Memory Engine remains uninvolved in Reasoning evaluation.

## Relationship with Knowledge

Knowledge answers:

> What is accepted as sufficiently true?

Reasoning may consider already-selected current accepted Knowledge References. It cannot access Claim content through the M5 Reference boundary and does not validate or reinterpret Knowledge.

A Candidate Conclusion is only a proposal. It does not become Knowledge through Reasoning, Store presence, diagnostic output, repetition, or orchestration. Only Knowledge Engine may evaluate and accept a future candidate under the Knowledge Contract.

## Published Events

M5 publishes no Events. A completed Reasoning Outcome is returned synchronously through Evaluate Reasoning.

Future Events require an approved consumer, schema, semantic owner, runtime publication authority, privacy model, and failure behavior. M5 introduces none.

## Consumed Events

M5 consumes no Events and requires no Event Bus, broker, queue, subscription, or replay infrastructure.

## Dependencies

Reasoning Engine source MAY depend inward only on:

- Core-custodied Reasoning types, Contract, and failures;
- Core-custodied immutable Context, Identity projection, Memory Reference, and Knowledge Reference definitions;
- framework-free language runtime features.

Reasoning Engine MUST NOT depend on:

- Context, Identity, Memory, Knowledge, Brain, Planning, Skill, Security, Voice, or another Engine implementation;
- Bootstrap or a concrete composition implementation;
- Infrastructure, Provider, Adapter, Gateway, Client, application, or external system;
- external npm runtime packages, AI SDKs, model libraries, prompt frameworks, databases, search, graph, vector, or transport libraries.

Bootstrap MAY compose Reasoning Engine and supply controlled existing Core values for the M5 diagnostic. Runtime data flow does not reverse source dependency direction.

## Internal Components

M5 requires only these logical responsibilities:

- **Request Validator** — reconstructs the exact request and validates all nested inputs;
- **Rule Evaluator** — applies the four rules in normative precedence;
- **Outcome Builder** — constructs the immutable controlled Outcome and explainability summary.

These are responsibilities, not required classes, packages, services, or deployment units. They SHOULD remain combined where separation adds no demonstrated value.

## Engine Lifecycle

Reasoning Engine follows the platform Engine lifecycle:

`Initialize → Ready → Running → Stopping → Stopped`

For M5:

- initialization validates only required Core Contract availability and internal rule-table consistency;
- Evaluate Reasoning MUST execute only while Running;
- stopping MUST NOT create, persist, retry, or publish an Outcome;
- lifecycle state is not Context lifecycle state and does not add Reasoning Outcome states.

## State Management

M5 is stateless between evaluations. It retains no Query, Context, Reference, Outcome, trace, history, cache, or current-reasoning selection.

Cycle-local reconstructed inputs and outputs exist only for synchronous evaluation. No Reasoning Store or repository is defined. Engine lifecycle state is the only process-local mutable state required.

## Configuration

M5 has no domain-semantic runtime configuration. Rule categories, precedence, controlled texts, bounds, and list limits are fixed by this specification.

The Engine MUST NOT read model, provider, prompt, token, temperature, endpoint, database, feature-flag, or environment configuration. Bootstrap MAY configure platform logging but cannot change Reasoning semantics.

## Security

Reasoning Engine owns no authentication, authorization, permission, risk-policy, or Security semantics in M5.

An Authenticated Identity projection means only that Identity supplied that state through Context. It MUST NOT be interpreted as permission to act. Candidate Next Action is never authorization or enforcement.

Protected invocation boundaries remain responsible for enforcing Security-owned policy. M5 introduces no Security Engine dependency, role model, credential inspection, token handling, or authorization decision.

## Failure Semantics

M5 defines only these failures.

### Invalid Reasoning Input

The top-level request is null, undefined, a primitive, an array, not an exact record, lacks required top-level fields, contains unexpected top-level fields, contains conflicting or multiple Context inputs, or violates a cross-field request invariant not owned by a more specific failure.

Invalid Reasoning Input does not apply to an invalid Query, malformed or inactive Context, or an explicitly present invalid Memory or Knowledge Reference collection or item. Those conditions use their specific failures below.

### Invalid Active Context

The supplied Context Revision, creation metadata, fragment, Identity projection, identifier, revision number, timestamp, parent relationship, or nested shape is malformed. No Outcome is produced.

### Inactive Context

The supplied Context Revision is structurally valid but its lifecycle state is not Active. This includes Collecting, Composing, Validating, Expired, and Archived revisions.

### Invalid Reasoning Query

The Query is absent, non-string, empty, whitespace-only, longer than 2048 Unicode code points, coercible rather than primitive, or otherwise violates the Query Contract.

### Invalid Memory Reference

An explicitly present Memory Reference collection is null, undefined, primitive, non-array, sparse, over the count bound, has unexpected enumerable properties, or contains a malformed, duplicated, unexpected-field, invalid-identity, or coercible item. Collection-level and item-level defects both produce Invalid Memory Reference.

### Invalid Knowledge Reference

An explicitly present Knowledge Reference collection is null, undefined, primitive, non-array, sparse, over the count bound, has unexpected enumerable properties, or contains a malformed, duplicated, unexpected-field, invalid-identity, invalid-Version, non-current-Currency, or coercible item. Collection-level and item-level defects both produce Invalid Knowledge Reference. Semantic staleness of an otherwise structurally valid current projection is not independently detectable by M5 and creates no new Reasoning failure category.

### Reasoning Rule Failure

Validated inputs do not map to exactly one approved M5 rule, a rule table is internally contradictory, or the controlled rule result cannot be constructed. This is an Engine reasoning failure, not caller rejection, provider failure, or Knowledge failure.

### Invalid Reasoning State

Evaluate Reasoning is invoked outside Running state or the Engine encounters contradictory internal lifecycle or Outcome state.

Failures MUST be deterministic, technology-neutral, distinguishable, and privacy-safe. No failure message may contain raw Query, Candidate Conclusion, Candidate Response, Context identity, Identity Identifier, Memory Identity, Knowledge Identity, caller payload, credential, token, or implementation-specific exception detail.

Unexpected runtime exceptions MUST be normalized to the applicable approved Reasoning failure. No native `TypeError` or implementation-specific exception may escape the public boundary.

### Validation Precedence

Evaluate Reasoning MUST apply the following deterministic validation precedence:

1. validate that the top-level request is an exact record with the required and permitted top-level fields; failure is Invalid Reasoning Input;
2. validate the complete Active Context structure; failure is Invalid Active Context;
3. validate that the structurally valid Context lifecycle state is Active; failure is Inactive Context;
4. validate Reasoning Query; failure is Invalid Reasoning Query;
5. when `memoryReferences` is explicitly present, validate the collection and every item; failure is Invalid Memory Reference;
6. when `knowledgeReferences` is explicitly present, validate the collection and every item; failure is Invalid Knowledge Reference;
7. evaluate exactly one deterministic M5 rule; an unexpected rule-table or controlled-output defect is Reasoning Rule Failure, while contradictory Engine lifecycle or internal Outcome state is Invalid Reasoning State.

Once a step fails, later steps MUST NOT run. This ordering resolves requests containing more than one defect without inspecting or leaking later invalid values.

## Runtime Boundary Safety

All public Reasoning inputs are untrusted runtime data regardless of TypeScript or equivalent static types.

M5 implementations MUST explicitly validate:

- null and undefined;
- wrong-type primitives;
- arrays where records are required and records where arrays are required;
- hostile objects and Proxies whose prototype or properties throw;
- exact request, Context, metadata, fragment, projection, Reference, Outcome, and explainability shapes;
- unexpected fields;
- singular Context input and rejection of multiple/conflicting Context fields;
- Context and Identity primitive values through existing Core validators;
- Active lifecycle state separately from structural validity;
- Query primitive type, whitespace rule, and Unicode bounds;
- optional collection omission versus explicit null or undefined fields;
- dense arrays, count bounds, every nested Reference, and duplicate identities;
- Memory Reference closed discriminants;
- Knowledge Reference validation state, Version, current Currency, and closed discriminants;
- controlled output strings, categories, counts, and correspondence between the selected rule and Outcome.

An explicitly present optional collection with value `undefined` is invalid; omission alone resolves to empty. Sparse arrays and arrays with enumerable non-index properties are invalid. Input order is preserved during defensive reconstruction, although M5 rules use only counts.

Top-level record and cross-field defects map to Invalid Reasoning Input. After top-level validation succeeds, Context structure, Context lifecycle, Query, Memory collection or items, and Knowledge collection or items map only to their respective specific failures according to Validation Precedence. In particular, no explicitly present invalid Reference collection or item maps to Invalid Reasoning Input.

Implementations MUST NOT use `String`, interpolation, `toString`, `valueOf`, or equivalent coercion to validate inputs. They MUST NOT trust brands, caller freezing, prototypes, getters, arrays, or nested references.

Factory and Engine boundaries MUST catch hostile inspection failures and return only approved domain-safe failures. Malformed data MUST NOT become a completed Outcome.

No validation library is prescribed.

## Normative Runtime Bounds

The following bounds are normative for M5 Contract validation, technology-neutral, and implementation-independent. They are not provider limits, prompt limits, token budgets, encoded-byte limits, database column definitions, UI constraints, or permanent universal limits for future Reasoning representations.

String length is measured in Unicode code points, not UTF-16 code units or encoded bytes. Values are validated without normalization and counted exactly as supplied. Exact maxima are accepted when all other rules hold; one code point above is rejected. No value may be coerced, normalized, silently truncated, or silently summarized.

| Field                | Minimum | Maximum | Additional rule                                     |
| -------------------- | ------- | ------- | --------------------------------------------------- |
| Reasoning Query      | 1       | 2048    | Primitive string; non-empty and non-whitespace-only |
| Candidate Conclusion | 1       | 1024    | Primitive controlled Engine output                  |
| Candidate Response   | 1       | 2048    | Primitive controlled Engine output                  |

M5 allocates no Reasoning Outcome Identity, so no Outcome Identity bound is defined.

Reference collection bounds are:

| Collection           | Minimum | Maximum | Omitted value    |
| -------------------- | ------- | ------- | ---------------- |
| Memory References    | 0       | 20      | Empty collection |
| Knowledge References | 0       | 20      | Empty collection |

Counts MUST be primitive finite safe integers derived mechanically from validated dense arrays. Callers do not supply explainability counts directly. Duplicate identities are invalid and do not reduce or inflate the count.

The following values use closed vocabularies rather than arbitrary strings and therefore require no independent configurable length bound:

- Evaluate intent: `evaluate`;
- Outcome Status: `completed`;
- Outcome Category: `anonymous-context`, `knowledge-grounded-context`, `experience-informed-context`, `context-only`;
- Candidate Next Action: `none`, `request-more-context`;
- Rule Category: `anonymous-identity`, `authenticated-with-knowledge`, `authenticated-with-memory-only`, `authenticated-context-only`;
- Identity State: `anonymous`, `authenticated`.

Context, Identity, Memory, and Knowledge identifiers, timestamps, Versions, discriminants, and Reference fields retain their independently approved Core Contract validation semantics. ENGINE-0006 does not redefine or broaden their bounds.

Future changes require an approved specification revision. Implementation configuration MUST NOT silently change these values.

## Immutability

Reasoning Request normalization and every returned Outcome graph MUST be deeply immutable.

Implementations MUST:

- defensively reconstruct the Active Context Revision, creation metadata, fragment, Identity projection, Memory References, and Knowledge References;
- construct new immutable Context Consumption Reference, Candidate Conclusion, Candidate Response, and Explainability Summary values;
- freeze or otherwise guarantee immutability of the Outcome and every nested object or collection;
- avoid returning or retaining caller-owned arrays or objects;
- ensure later caller mutation of original inputs cannot change evaluation results or Engine state;
- ensure mutation attempts through returned values have no effect.

Reasoning MUST NOT mutate the original Context lifecycle, fragments, Identity projection, Memory References, Knowledge References, or any owning Engine state.

## Observability and Privacy

M5 SHOULD expose:

- Engine lifecycle and health;
- evaluation success and failure counts;
- Outcome Category counts;
- Identity State category counts;
- Memory and Knowledge Reference count distributions;
- Candidate Response produced boolean;
- failure category and correlation identifier where policy permits.

M5 diagnostics MAY report only controlled operational facts such as:

- `reasoningCapabilityOperational`;
- `evaluationSucceeded`;
- `outcomeCategory`;
- `identityState`;
- `memoryReferenceCount`;
- `knowledgeReferenceCount`;
- `candidateConclusionProduced`;
- `candidateResponseProduced`;
- `candidateNextAction`.

Ordinary logs, metrics, failures, and diagnostics MUST NOT expose:

- raw Reasoning Query;
- raw Candidate Conclusion or Candidate Response;
- raw Context Lineage or Revision Identity;
- raw Identity Identifier;
- raw Memory or Knowledge Identity;
- Memory Content, Knowledge Claim, provenance, source references, or evidence;
- private chain-of-thought or intermediate reasoning text;
- personal information, credentials, secrets, authentication tokens, or authorization decisions.

Mandatory diagnostic output MUST remain available at every supported log level. No production observability vendor, trace store, audit infrastructure, or Event system is required.

## Performance

M5 defines no throughput, capacity, or latency target.

Correct Context consumption, boundary ownership, deterministic rule behavior, immutability, runtime safety, and privacy take precedence. Implementations MUST NOT introduce caching, parallel inference, batching, persistence, model optimization, or speculative prefetch.

## Testing

The future M5 implementation MUST include deterministic tests for:

- every Core Reasoning value and exported factory with valid, invalid, unexpected, coercible, hostile, and mutable caller inputs;
- exact Unicode code-point maxima and one-above rejection using non-BMP characters for Query, Candidate Conclusion, and Candidate Response;
- exactly one Active Context Revision accepted;
- absent, null, primitive, array, malformed, and multiple/conflicting Context input rejection;
- each structurally valid non-Active lifecycle state producing Inactive Context;
- complete Context, metadata, fragment, Identity projection, revision-number, timestamp, and parent-shape validation;
- valid and malformed Context timestamps according to the accepted Context Contract;
- Anonymous projection without Identity Identifier and Authenticated projection with a valid Identity Identifier;
- no authorization inference from Authenticated;
- omitted, empty, one-item, exact-20, and 21-item Memory and Knowledge Reference collections;
- null, primitive, non-array, sparse, explicit-undefined, unexpected-property, over-limit, malformed-item, coercible-identity, and duplicate Memory collections producing exactly Invalid Memory Reference;
- null, primitive, non-array, sparse, explicit-undefined, unexpected-property, over-limit, malformed-item, invalid-identity, invalid-Version, coercible-value, and duplicate Knowledge collections producing exactly Invalid Knowledge Reference;
- a structurally valid `current` Knowledge Reference being accepted and a non-current Reference producing exactly Invalid Knowledge Reference;
- proof that Reasoning makes no Knowledge Engine call, performs no freshness query or refresh, and does not independently certify semantic freshness;
- null, undefined, primitive, array, missing-field, unexpected-field, and conflicting-Context top-level requests producing exactly Invalid Reasoning Input;
- malformed Active Context producing exactly Invalid Active Context, non-Active Context producing exactly Inactive Context, and invalid Query producing exactly Invalid Reasoning Query;
- all four M5 rules, exact precedence, controlled Outcome texts, categories, actions, counts, and rule-category correspondence;
- Anonymous precedence when references are supplied;
- Authenticated Knowledge precedence when both Memory and Knowledge References are supplied;
- deterministic repeated evaluation of equivalent inputs;
- complete deep immutability and resistance to caller mutation before and after construction;
- Context, Memory Reference, and Knowledge Reference inputs remaining unchanged;
- no Memory or Knowledge Engine invocation, promotion, retention, acceptance, or mutation;
- Candidate Conclusion remaining non-Knowledge and Candidate Response remaining non-final;
- no Planning, Skill, Brain, Provider, Event, persistence, or external service behavior;
- Engine lifecycle and explicit Bootstrap composition;
- privacy-safe diagnostics at debug, info, warn, and error;
- dependency rules preventing Core and Reasoning Engine outward coupling and cross-Engine implementation dependencies.

Tests MUST require no network, LLM, model SDK, external service, database, persistent storage, Event infrastructure, nondeterministic clock, or random identity generation.

Tests MUST assert exact Reasoning-domain failure types rather than merely asserting that an operation throws.

## M5 Implementation Boundary

The future M5 implementation SHOULD include only:

- Core-custodied Reasoning types, controlled values, one Contract, and failures;
- a framework-free Reasoning Engine;
- exact runtime validation and defensive reconstruction of approved input projections;
- the four deterministic rules and controlled outputs;
- explicit Bootstrap composition without a DI framework or service locator;
- privacy-safe diagnostic demonstration;
- unit, Contract, rule, runtime-adversarial, immutability, architecture, privacy, and smoke tests;
- architecture enforcement for inward dependencies and isolated negative fixtures.

The future implementation MUST NOT include:

- LLM Provider, model SDK, prompt framework, model configuration, external AI service, or web search;
- Brain Engine, Planning Engine, Skill execution, tool calling, or workflows;
- direct dependency on Context, Identity, Memory, Knowledge, or another Engine implementation;
- Memory retrieval or retention, Knowledge acceptance or mutation, or Context retrieval or mutation;
- production database, vector Store, graph Store, cache, filesystem, or Reasoning Store;
- Events, broker, queue, Provider, Adapter, Gateway, Client, HTTP, or transport;
- distributed Reasoning, production audit infrastructure, private trace storage, or chain-of-thought exposure.

## Acceptance Criteria

M5 is ready for acceptance only when objective tests prove:

1. Reasoning Engine is the single semantic owner of M5 reasoning behavior.
2. Core custodies shared Reasoning definitions without owning Reasoning behavior.
3. Reasoning capability composes and runs without an external service.
4. Evaluate Reasoning is the only M5 Reasoning capability Contract.
5. Exactly one complete immutable Active Context Revision is mandatory.
6. Every valid non-Active Context lifecycle state is rejected as Inactive Context.
7. Malformed or conflicting Context input is rejected without a native exception.
8. The consumed Context and its Identity projection remain unchanged.
9. Anonymous and Authenticated paths produce different deterministic Outcomes.
10. All four rules produce their exact approved Category, Conclusion, Response, Next Action, and Rule Category.
11. Rule A takes precedence for Anonymous regardless of supplied reference counts.
12. Rule B takes precedence for Authenticated when both Knowledge and Memory References exist.
13. Omitted Reference collections resolve to empty and exact count bounds are enforced.
14. Memory and Knowledge References are defensively reconstructed, deeply immutable, and never mutated.
15. Reasoning makes no direct Memory or Knowledge capability call.
16. Memory References never become Knowledge or truth assertions.
17. Candidate Conclusion is not accepted Knowledge and creates no Knowledge mutation.
18. Candidate Response is not final delivery and creates no Client, transport, or Voice behavior.
19. Candidate Next Action remains advisory and causes no Planning or Skill execution.
20. Explainability identifies the consumed Context revision and public rule basis without private chain-of-thought.
21. Query, Context identifiers, Identity Identifier, Memory identities, Knowledge identities, conclusions, and responses are absent from diagnostics and ordinary logs.
22. Every public input is runtime-validated without coercion, truncation, or native exception leakage.
23. Query, Conclusion, and Response exact Unicode boundaries use code-point semantics.
24. The complete Outcome graph and returned nested values are deeply immutable.
25. Equivalent valid inputs produce equivalent deterministic semantic outputs.
26. Reasoning Engine depends only inward on Core and imports no Engine implementation or external npm package.
27. Architecture fixtures fail for their exact intended rules without weakening M0–M4 enforcement.
28. Bootstrap diagnostics demonstrate one controlled Reasoning evaluation using an Active Context Revision and privacy-safe categories/counts.
29. Mandatory diagnostics survive debug, info, warn, and error log levels.
30. All M0–M4 and M5 tests, architecture checks, formatting, lint, typecheck, build, diagnostics, and repository validation pass.
31. No LLM, model SDK, external AI service, database, Event system, persistence, or deferred capability is introduced.
32. A Knowledge capability-issued structurally valid `current` Knowledge Reference is accepted as prepared input.
33. Knowledge Currency other than `current` produces Invalid Knowledge Reference.
34. Reasoning makes no Knowledge Engine call, does not query or refresh Knowledge state, and does not independently certify semantic freshness.
35. The caller or protected orchestration boundary is explicitly responsible for Knowledge Reference selection and freshness at invocation.
36. Omitted `memoryReferences` resolves to empty, while null, primitive or other non-array, sparse, over-twenty, unexpected-field, coercible, or malformed-item Memory input produces Invalid Memory Reference.
37. Omitted `knowledgeReferences` resolves to empty, while null, primitive or other non-array, sparse, over-twenty, unexpected-field, coercible, malformed-item, invalid-Version, or non-current-Currency Knowledge input produces Invalid Knowledge Reference.
38. Null, undefined, primitive, array, missing-field, unexpected-field, or conflicting-Context top-level input produces Invalid Reasoning Input.
39. Invalid Query produces Invalid Reasoning Query, invalid Context shape produces Invalid Active Context, and structurally valid non-Active Context produces Inactive Context.
40. Validation follows the normative precedence and stops at the first failed boundary.

## Future Evolution

Later approved milestones MAY add:

- richer structured queries and conclusion types;
- approved Knowledge projections containing bounded claim data;
- approved Memory projections containing bounded experience summaries;
- additional deterministic or replaceable reasoning strategies behind stable Contracts;
- uncertainty and confidence semantics;
- risk evaluation and clarification categories;
- Brain orchestration of Reasoning Outcomes;
- Planning handoff Contracts;
- stable Outcome identity, persistence, audit evidence, or meaningful Reasoning Events;
- provider-backed inference through separately approved technology-neutral Contracts.

Future evolution MUST preserve Reasoning semantic ownership, exactly identified Context consumption, Memory/Knowledge/Context boundaries, Knowledge acceptance governance, Brain orchestration ownership, Planning and Skill separation, privacy, explainability without private chain-of-thought, Core Contract custody, and inward dependency direction.

## References

- [Documentation Authority](../../../docs/DOCUMENT-AUTHORITY.md)
- [Architecture](../../../docs/architecture.md)
- [Principles](../../../docs/principles.md)
- [Glossary](../../../docs/glossary.md)
- [ADR-0001 — Core Ownership and Dependency Direction](../../../docs/adr/ADR-0001-Core-Ownership-and-Dependency-Direction.md)
- [ADR-0002 — Capability-Oriented Architecture](../../../docs/adr/ADR-0002-Capability-Oriented-Architecture.md)
- [ADR-0003 — Engine Communication Model](../../../docs/adr/ADR-0003-Engine-Communication-Model.md)
- [OES-0002 — Engine Design](../../../docs/engineering/OES-0002-Engine-Design.md)
- [OES-0004 — Contracts](../../../docs/engineering/OES-0004-Contracts.md)
- [OES-0008 — Documentation Standards](../../../docs/engineering/OES-0008-Documentation-Standards.md)
- [OES-0009 — Security Standards](../../../docs/engineering/OES-0009-Security-Standards.md)
- [ARCH-0001 — Core Architecture](../../architecture/ARCH-0001-Core-Architecture.md)
- [CONCEPT-0001 — Memory Model](../../concepts/CONCEPT-0001-Memory-Model.md)
- [CONCEPT-0002 — Knowledge Model](../../concepts/CONCEPT-0002-Knowledge-Model.md)
- [CONCEPT-0003 — Context Model](../../concepts/CONCEPT-0003-Context-Model.md)
- [ENGINE-0001 — Brain Engine](../ENGINE-0001-Brain-Engine.md)
- [ENGINE-0002 — Identity Engine](../identity/ENGINE-0002-Identity-Engine.md)
- [ENGINE-0003 — Context Engine](../context/ENGINE-0003-Context-Engine.md)
- [ENGINE-0004 — Memory Engine](../memory/ENGINE-0004-Memory-Engine.md)
- [ENGINE-0005 — Knowledge Engine](../knowledge/ENGINE-0005-Knowledge-Engine.md)
- [IMPLEMENTATION-M0 — Executable Architectural Skeleton](../../../IMPLEMENTATION-M0.md)
- [IMPLEMENTATION-M1 — Identity Engine Vertical Slice](../../../IMPLEMENTATION-M1.md)
- [IMPLEMENTATION-M2 — Context Engine Vertical Slice](../../../IMPLEMENTATION-M2.md)
- [IMPLEMENTATION-M3 — Memory Engine Vertical Slice](../../../IMPLEMENTATION-M3.md)
- [IMPLEMENTATION-M4 — Knowledge Engine Vertical Slice](../../../IMPLEMENTATION-M4.md)

## Engineering Motto

> Reasoning draws bounded conclusions from one active situation; it does not own the world around it.
