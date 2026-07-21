# ENGINE-0007 — Planning Engine

| Field          | Value                                                |
| -------------- | ---------------------------------------------------- |
| **Status**     | Active                                               |
| **Version**    | 1.0.0                                                |
| **Owner**      | Project Maintainers                                  |
| **Created**    | 2026-07-20                                           |
| **Updated**    | 2026-07-20                                           |
| **Applies To** | Planning Engine, M6 — Planning Engine Vertical Slice |

---

## Status

This specification is Active and authorizes the M6 Planning Engine vertical slice.

The key words **MUST**, **MUST NOT**, **SHOULD**, **SHOULD NOT**, and **MAY** describe normative requirements proposed by this specification.

## Version

Version `1.0.0` defines the approved first Planning Engine vertical slice.

## Authority

This Engine Specification specializes foundation-v1.0 and the Active Reasoning Engine Contract for Planning. It remains subordinate to approved ADRs, Active Architecture Specifications, Active Concept Specifications, and Active Engineering Standards.

Core is the schema custodian of shared Planning types, failures, and Contracts. Planning Engine is the semantic owner of planning behavior. Future orchestration is the runtime caller; Core custody and caller responsibility do not transfer Planning semantics.

If this specification conflicts with a higher-authority source, the higher-authority source governs and M6 implementation MUST pause until the conflict is resolved formally.

## Purpose

The Planning Engine answers:

> What advisory candidate plan follows from this prepared Reasoning Outcome?

M6 proves the smallest complete Planning capability. It consumes exactly one immutable completed M5 Reasoning Outcome, validates it as hostile runtime data, applies one deterministic planning rule, and returns one deeply immutable Candidate Plan.

Planning transforms prepared cognitive output into advisory structure. It does not reason, execute, authorize, orchestrate, persist, schedule, or deliver.

## Scope

M6 includes:

- one exact-shape Create Candidate Plan Contract;
- exactly one complete immutable M5 Reasoning Outcome per planning cycle;
- two closed deterministic Candidate Plan categories;
- exactly one advisory Candidate Plan Step per valid plan;
- defensive copying of Candidate Response only for a `respond` step;
- one privacy-minimal Reasoning Consumption Reference;
- one safe structured Planning Explainability Summary;
- framework-free process-local Planning evaluation with no retained history;
- deterministic runtime failures, tests, diagnostics, and architecture enforcement.

M6 evaluates only the supplied Reasoning Outcome. It has no optional constraints, capability references, Store, Provider, clock, allocator, Event publisher, or execution collaborator.

## Ownership

Planning Engine is the single semantic owner of:

- Candidate Plan admissibility and construction;
- Candidate Plan category semantics;
- Candidate Plan Step semantics and ordinal ordering;
- deterministic mapping from approved M5 Reasoning Outcomes to Candidate Plans;
- advisory step ordering and the absence of dependencies in M6;
- Planning Explainability semantics;
- Planning-domain validation and failure semantics.

Planning Engine does not own:

- Reasoning Outcome creation, inference, conclusions, or responses;
- Brain orchestration or selection of the Reasoning Outcome;
- Context composition, selection, lifecycle, or mutation;
- Memory retention, retrieval, selection, or mutation;
- Knowledge acceptance, currency, contradiction, or mutation;
- Identity, authentication, authorization, or Security policy;
- Skill discovery, permission evaluation, invocation, or execution;
- tool selection or execution;
- final response assembly, delivery, presentation, transport, or voice rendering;
- retries, compensation, scheduling, deadlines, persistence, Events, or distributed execution.

## Non-Goals

M6 does not define or implement:

- general task decomposition or arbitrary multi-step planning;
- workflow graphs, step dependencies, branching, loops, parallelism, or conditional execution;
- execution state, progress, completion, failure recovery, retries, or compensation;
- temporal scheduling, deadlines, priorities, resource allocation, or budgets;
- capability or Skill discovery, selection, binding, invocation, or result handling;
- tool calls, external services, Providers, Adapters, Gateways, or Clients;
- Brain Engine or cognitive-pipeline orchestration;
- Context, Memory, Knowledge, Identity, or Reasoning Engine calls;
- authorization or Security policy decisions;
- plan identity, lifecycle, storage, retrieval, listing, audit history, or Events;
- final user response delivery or channel-specific rendering;
- private chain-of-thought or internal planning trace exposure.

## Terminology

### Planning Request

A **Planning Request** is one exact-shape proposal for a single Planning cycle. It contains one explicit create-candidate-plan intent and exactly one prepared M5 Reasoning Outcome.

### Candidate Plan

A **Candidate Plan** is one completed Planning result containing one advisory category, exactly one ordered Candidate Plan Step, one Reasoning Consumption Reference, and one Planning Explainability Summary. It is not approved execution, a persisted plan, a workflow, or a final cognitive result.

### Candidate Plan Step

A **Candidate Plan Step** is one immutable advisory instruction category at ordinal `1`. It cannot execute itself and carries no execution status, Skill binding, authorization, schedule, retry, or dependency metadata.

### Reasoning Consumption Reference

A **Reasoning Consumption Reference** is a non-unique privacy-safe structural summary of the single M5 Reasoning Outcome consumed by Planning. It is not a persistent identity and cannot retrieve a Reasoning Outcome.

### Planning Explainability Summary

A **Planning Explainability Summary** states which controlled Reasoning category and next action led to which Candidate Plan category and rule. It is not chain-of-thought or a private planning trace.

## Invariants

1. Planning Engine is the single semantic owner of M6 planning behavior.
2. Every successful M6 cycle consumes exactly one complete valid immutable M5 Reasoning Outcome.
3. Planning never creates, retrieves, replaces, or mutates a Reasoning Outcome.
4. Planning never calls Reasoning, Context, Memory, Knowledge, Identity, Brain, Skill, Security, or an external service.
5. Every valid M5 Reasoning Outcome maps to exactly one Candidate Plan and exactly one planning rule.
6. Every M6 Candidate Plan contains exactly one Candidate Plan Step with ordinal `1`.
7. M6 has no zero-step plan and no explicit no-action step.
8. Candidate Plan categories and step kinds are closed and correspond exactly.
9. A `respond` step contains an exact defensive copy of the supplied Candidate Response.
10. A `request-more-context` step contains no response text or arbitrary payload.
11. Candidate Plans are advisory and cause no execution, Context mutation, user interaction, or delivery.
12. Planning Outcomes and all nested values are deeply immutable and retain no caller-owned object or collection.
13. Planning retains no request, Reasoning Outcome, Candidate Plan, or history after synchronous completion.
14. Equivalent valid inputs produce deeply equivalent Candidate Plans.
15. Explainability and diagnostics contain no raw Candidate Conclusion, Candidate Response, query, identifier, content, or private reasoning.

## Planning Request

Create Candidate Plan accepts one exact-shape request containing:

- `intent`: exactly `create-candidate-plan`;
- `reasoningOutcome`: exactly one complete M5 Reasoning Outcome.

No other field is permitted. M6 defines no optional constraints. A missing, additional, secondary, plural, or conflicting Reasoning Outcome field is Invalid Planning Input.

Top-level shape inspection MUST be protected against hostile prototypes, keys, property descriptors, and Proxy traps. After safe shape acceptance, the `reasoningOutcome` field MUST be read exactly once inside the protected Reasoning Outcome boundary. The caller object MUST NOT be read again or retained.

Protected orchestration is responsible for selecting the single Reasoning Outcome to submit. Planning validates and consumes the prepared value but does not retrieve another outcome or verify orchestration history.

## Reasoning Outcome Input Boundary

Planning MUST defensively reconstruct the complete M5 Reasoning Outcome, including:

- status exactly `completed`;
- one approved Reasoning Outcome Category;
- one valid Candidate Conclusion;
- one valid Candidate Response;
- one approved Candidate Next Action;
- one complete Explainability Summary;
- one complete Context Consumption Reference;
- Identity State, reference counts, and Rule Category;
- exact shapes with no unexpected fields.

Planning MUST use the Active Core-custodied M5 factories and validators rather than redefine or narrow their bounds.

### Structural Validation

Structural validation verifies primitive values, exact shapes, bounds, controlled vocabularies, nested references, and deep reconstructability. A structural failure produces Invalid Reasoning Outcome.

### Semantic Correspondence Validation

Planning MUST also validate the M5 rule correspondence so a branded-looking but contradictory object cannot become a plan. The following combinations are the only valid inputs:

| Reasoning Category            | Identity State  | Knowledge Count | Memory Count | Next Action            | Rule Category                    |
| ----------------------------- | --------------- | --------------- | ------------ | ---------------------- | -------------------------------- |
| `anonymous-context`           | `anonymous`     | 0–20            | 0–20         | `request-more-context` | `anonymous-identity`             |
| `knowledge-grounded-context`  | `authenticated` | 1–20            | 0–20         | `none`                 | `authenticated-with-knowledge`   |
| `experience-informed-context` | `authenticated` | 0               | 1–20         | `none`                 | `authenticated-with-memory-only` |
| `context-only`                | `authenticated` | 0               | 0            | `request-more-context` | `authenticated-context-only`     |

The controlled Candidate Conclusion and Candidate Response MUST exactly match the normative text for the selected M5 rule. The Context Consumption Reference MUST identify an Active Context projection using the M5 structural Contract.

All four approved Reasoning Outcome categories are plannable. M6 has no unsupported approved category and therefore defines no Unsupported Reasoning Outcome failure.

Planning MUST NOT:

- reinterpret Candidate Conclusion as accepted Knowledge;
- treat Candidate Response as final delivery;
- expose or manufacture a query or chain-of-thought;
- call Reasoning Engine to confirm, refresh, or replace the supplied Outcome;
- mutate the supplied Outcome on success or failure.

## Candidate Plan

The public successful output is the Candidate Plan directly. M6 does not wrap it in a second Planning Outcome object because no alternate successful result requires a discriminated wrapper.

A Candidate Plan contains exactly:

- `status`: `completed`;
- `category`: `respond` or `request-more-context`;
- `steps`: a dense exact one-element array containing the corresponding Candidate Plan Step;
- `source`: one Reasoning Consumption Reference;
- `explainability`: one Planning Explainability Summary.

The `steps` value MUST be a dense exact one-element array. It MUST have length exactly `1`; index `0` MUST exist and contain exactly one valid Candidate Plan Step. Sparse slots, a missing index `0`, and every additional numeric index are invalid. Its only permitted enumerable string key is `"0"`; every additional enumerable string property and every enumerable symbol property are invalid. The standard non-enumerable `length` property is permitted, and ordinary array prototype behavior alone MUST NOT cause rejection. Array-like non-array objects and coercible values are invalid.

This exactness rule governs both externally supplied hostile runtime values accepted by public Candidate Plan factories and constructed-output validation before a Candidate Plan is returned. Implementations MUST reconstruct a new dense exact one-element array and MUST NOT retain, freeze, normalize, or mutate a caller-owned array.

Candidate Plan has no identity, timestamp, version, current marker, lifecycle, owner-selected identifier, or persistence semantics. Synchronous return is the complete M6 planning outcome.

## Candidate Plan Step

M6 defines exactly two step variants.

### Respond Step

Exact shape:

- `ordinal`: `1`;
- `kind`: `respond`;
- `candidateResponse`: one defensively copied M5 Candidate Response.

The response is copied as immutable primitive text and preserved exactly. Planning performs no rewriting, formatting, rendering, delivery, truth acceptance, or channel selection.

### Request More Context Step

Exact shape:

- `ordinal`: `1`;
- `kind`: `request-more-context`.

It has no payload. It advises later orchestration that more Context is appropriate. It does not ask a user, mutate Context, invoke Brain, schedule work, or trigger transport.

### No-Action Decision

M6 does not define a `no-action` category or step. Every valid M5 Outcome contains either `request-more-context` or `none`. The former maps to the advisory request step; the latter includes a controlled Candidate Response and maps to the advisory respond step. A zero-step or no-action representation would add an unreachable state.

### Ordering and Dependencies

Every Candidate Plan contains exactly one step. Its ordinal is exactly `1`. No other ordinal is valid. Because M6 has only one step:

- ordering is deterministic;
- duplicate ordinals cannot occur;
- step dependencies do not exist;
- dependency identifiers, graphs, and adjacency structures are prohibited;
- execution ordering and parallelism are outside M6.

## Deterministic Planning Rules

Rules are evaluated in this exact precedence after complete input validation. Exactly one rule applies.

### Rule A — Request More Context

Condition:

- Candidate Next Action is `request-more-context`.

Outcome:

- Candidate Plan Category: `request-more-context`;
- one Request More Context Step at ordinal `1`;
- Planning Rule Category: `reasoning-requested-more-context`.

This rule applies to valid `anonymous-context` and `context-only` Reasoning Outcomes. It has precedence over no other matching rule because the Next Action vocabulary is exclusive.

### Rule B — Respond

Condition:

- Candidate Next Action is `none`.

Outcome:

- Candidate Plan Category: `respond`;
- one Respond Step at ordinal `1` containing the exact Candidate Response;
- Planning Rule Category: `reasoning-produced-response`.

This rule applies to valid `knowledge-grounded-context` and `experience-informed-context` Reasoning Outcomes.

No rule examines free-form text, infers intent, selects a Skill, authorizes execution, or interprets Memory or Knowledge semantics.

## Planning Outcome

Successful Create Candidate Plan returns the Candidate Plan directly. Its `status: completed` means only that synchronous candidate-plan construction completed successfully. It does not mean:

- the plan is approved;
- any step executed;
- a response was finalized or delivered;
- Context was requested or updated;
- an authorization decision was made;
- Brain accepted the plan.

Failures throw one approved Planning-domain error and return no Candidate Plan. Partial plans are never exposed.

## Source Consumption Reference

Because M5 allocates no persistent Reasoning Outcome Identity, M6 MUST NOT invent one. The Reasoning Consumption Reference contains exactly:

- `reasoningStatus`: `completed`;
- `reasoningCategory`: the consumed Reasoning Outcome Category;
- `candidateNextAction`: `none` or `request-more-context`;
- `identityState`: `anonymous` or `authenticated`;
- `memoryReferenceCount`: integer `0–20`;
- `knowledgeReferenceCount`: integer `0–20`;
- `reasoningRuleCategory`: the consumed M5 Rule Category;
- `authoritativeCapability`: `reasoning`.

This Reference is a privacy-safe consumption summary, not a unique identity, locator, cache key, correlation identifier, or proof of historical persistence. Multiple equivalent Reasoning Outcomes intentionally produce equivalent References.

It excludes Candidate Conclusion, Candidate Response, Context Consumption Reference identities, Identity Identifier, Memory identities, Knowledge identities, and query text.

## Explainability

Planning Explainability Summary contains exactly:

- `consumedReasoningCategory`: one approved M5 Outcome Category;
- `consumedCandidateNextAction`: `none` or `request-more-context`;
- `resultingPlanCategory`: `respond` or `request-more-context`;
- `candidateStepCount`: exactly `1`;
- `planningRuleCategory`: `reasoning-requested-more-context` or `reasoning-produced-response`.

Every field is mechanically derived from the validated Reasoning Outcome and selected deterministic rule. Explainability MUST correspond exactly to the Candidate Plan category and step.

Explainability MUST NOT include:

- Candidate Conclusion or Candidate Response;
- raw Reasoning Query;
- Context, Identity, Memory, or Knowledge identifiers;
- Memory content or Knowledge claims;
- private chain-of-thought;
- raw internal planning trace;
- credentials, tokens, secrets, or provider payloads.

## Contracts

Core MUST custody the shared Planning types, factory definitions, failures, and this single capability Contract.

### Create Candidate Plan

| Property             | M6 definition                                                                                    |
| -------------------- | ------------------------------------------------------------------------------------------------ |
| **Operation**        | `createCandidatePlan`                                                                            |
| **Intent**           | `create-candidate-plan`                                                                          |
| **Input**            | Exactly one complete prepared M5 Reasoning Outcome                                               |
| **Output**           | One deeply immutable Candidate Plan                                                              |
| **Semantic owner**   | Planning Engine                                                                                  |
| **Schema custodian** | Core                                                                                             |
| **Side effects**     | None                                                                                             |
| **Guarantees**       | Exactly one Outcome consumed, one deterministic advisory step produced, no execution or mutation |

Create Candidate Plan is the only public Planning capability Contract required by M6.

M6 defines no:

- Planning Store Contract;
- Get, List, Update, Approve, Execute, Cancel, Retry, or Schedule Plan Contract;
- Reasoning, Skill, tool, Provider, Security, or Brain Contract;
- persistence, Event, streaming, or callback Contract.

## Validation Precedence

Create Candidate Plan MUST validate in this exact first-failure order:

1. **Engine lifecycle** — operation outside Running produces Invalid Planning State.
2. **Top-level Planning Request** — invalid prototype, keys, exact shape, intent, missing or unexpected field produces Invalid Planning Input.
3. **Reasoning Outcome structure** — malformed status, category, Conclusion, Response, Next Action, Explainability, Context Consumption Reference, count, nested field, or exact shape produces Invalid Reasoning Outcome.
4. **Reasoning Outcome semantic state** — a structurally valid but contradictory M5 category, controlled text, action, count, Identity State, or Rule Category correspondence produces Invalid Reasoning Outcome.
5. **Planning rule evaluation** — no unique approved rule or an internal rule-table defect produces Planning Rule Failure.
6. **Constructed Candidate Plan state** — a controlled result that cannot satisfy the Candidate Plan, step, source, or explainability invariants produces Invalid Planning State.

Validation stops at the first failure. No condition maps to multiple failures.

Engine lifecycle is evaluated before request inspection because an unavailable capability cannot accept an operation. Within a Running Engine, request and field validation follow steps 2–6 exactly.

## Failure Semantics

M6 defines exactly four public Planning failures.

### Invalid Planning Input (`InvalidPlanningInputError`)

The top-level request is null, undefined, primitive, array, non-record, missing a required field, contains an unexpected or conflicting field, has invalid intent, or fails hostile top-level shape inspection.

### Invalid Reasoning Outcome (`InvalidReasoningOutcomeError`)

The `reasoningOutcome` field cannot be read safely, is structurally malformed, contains an invalid nested value, violates M5 bounds or exact shapes, or contradicts an approved M5 rule correspondence. This includes hostile nested getters or Proxies. Planning does not expose the underlying value or exception.

### Planning Rule Failure (`PlanningRuleFailureError`)

A completely validated M5 Reasoning Outcome maps to zero or multiple M6 rules, or an internal fixed rule definition is contradictory. This is an Engine defect, not a caller, Reasoning, Provider, or execution failure.

### Invalid Planning State (`InvalidPlanningStateError`)

The Planning Engine lifecycle does not permit the operation, or a controlled constructed result violates Candidate Plan invariants. M6 uses one public `InvalidPlanningStateError` class for both cases. Implementations MUST NOT add separate public lifecycle or construction failure categories in M6.

### Unsupported Reasoning Outcome

M6 does **not** define this failure. Every approved M5 category is supported. Unknown categories are structurally invalid; contradictory approved categories are invalid Reasoning Outcome state.

M6 defines no Invalid Planning Constraint because it defines no constraints.

All failure messages MUST be deterministic, technology-neutral, and privacy-safe. They MUST NOT contain raw Conclusion, Response, identifiers, input serialization, thrown values, stack traces, credentials, tokens, or provider details.

## Runtime Boundary Safety

All public Core factories and Planning Contract inputs MUST be treated as hostile runtime values. Implementations MUST validate:

- null and undefined;
- strings, numbers, booleans, symbols, bigints, and functions where records are required;
- arrays where records are required;
- malformed prototypes and exact shapes;
- missing and unexpected fields;
- primitive and coercible text values;
- hostile `getPrototypeOf`, `ownKeys`, property-descriptor, `has`, and `get` Proxy traps where applicable;
- throwing getters and getters returning different values across reads;
- malformed nested Reasoning Outcome, Explainability, and Context Consumption Reference fields;
- mutable caller-owned objects and collections.

Top-level key discovery and intent inspection belong to Invalid Planning Input. After exact shape succeeds, reading or normalizing the single `reasoningOutcome` field belongs to Invalid Reasoning Outcome.

Implementations MUST:

- safely discover the top-level key set once;
- capture required-field presence without later hostile ownership checks;
- read the Reasoning Outcome field exactly once inside its protected boundary;
- normalize exclusively from the captured local value;
- defensively reconstruct every retained nested value;
- stop at the first failed validation boundary;
- preserve an already classified failure belonging to the current or earlier boundary;
- normalize native, arbitrary Error, thrown primitive, thrown object, getter, and Proxy failures into the owning approved Planning failure;
- avoid coercion through `String`, interpolation, `toString`, `valueOf`, or equivalent behavior;
- ensure no native or implementation-specific exception crosses a Core factory or public Planning Contract.

Where a public factory or boundary accepts Candidate Plan `steps`, array inspection MUST be protected against hostile index getters, property descriptors, own-key inspection, stateful access, and Proxy traps. The value MUST satisfy the dense exact one-element array rules before any element is retained. The same rules MUST be applied during constructed-output validation. Empty, sparse, multi-element, array-like, coercible, or decorated arrays MUST fail with the approved Planning-domain failure owned by the applicable boundary; no native inspection exception may escape.

No validation library is prescribed.

## Normative Bounds

M6 introduces no arbitrary caller-supplied text and no configurable collection.

| Value                              | Normative bound or vocabulary                                                                                    |
| ---------------------------------- | ---------------------------------------------------------------------------------------------------------------- |
| Candidate Plan steps               | Exactly `1`                                                                                                      |
| Candidate Plan Step ordinal        | Exactly `1`                                                                                                      |
| Candidate Response in Respond Step | Inherits M5 Candidate Response: primitive non-whitespace string, `1–2048` Unicode code points                    |
| Candidate Conclusion input         | Inherits M5 Candidate Conclusion: primitive non-whitespace string, `1–1024` Unicode code points                  |
| Memory Reference Count input       | Inherits M5 derived integer count: `0–20`                                                                        |
| Knowledge Reference Count input    | Inherits M5 derived integer count: `0–20`                                                                        |
| Candidate Plan Category            | `respond`, `request-more-context`                                                                                |
| Candidate Plan Step Kind           | `respond`, `request-more-context`                                                                                |
| Planning Rule Category             | `reasoning-requested-more-context`, `reasoning-produced-response`                                                |
| Candidate Step Count               | Exactly `1`                                                                                                      |
| Reasoning fields                   | Inherit the exact closed M5 vocabularies and Context/Identity identifier bounds through the M5 Reasoning Outcome |

All inherited text lengths MUST be measured in Unicode code points, not UTF-16 code units, encoded bytes, grapheme clusters, or display width. No coercion, normalization, or truncation is permitted.

No Plan Identity bound, timestamp bound, constraint bound, dependency bound, or arbitrary payload bound exists because those concepts are absent from M6.

## Immutability

Planning implementations MUST:

- defensively reconstruct the complete supplied M5 Reasoning Outcome before rule evaluation;
- preserve the original supplied Outcome without freezing, modifying, adding, removing, or rewriting caller fields;
- copy Candidate Response by primitive value into a Respond Step;
- construct a new deeply immutable dense exact one-element `steps` array;
- construct new immutable Reasoning Consumption Reference and Explainability objects;
- deeply freeze or otherwise guarantee immutability of the Candidate Plan and every nested object or collection;
- retain no caller-owned object, array, getter, Proxy, or mutable collection;
- ensure caller mutation after successful or failed planning cannot change a returned plan or Engine state.

Planning MUST NOT freeze or normalize the caller's Reasoning Outcome in place. Immutability applies to Planning-owned reconstructed and returned values, not by mutating caller ownership.

## Brain / Planning Boundary

Protected orchestration or a future Brain Engine:

- selects the single completed Reasoning Outcome;
- invokes Create Candidate Plan;
- decides whether an advisory Candidate Plan should proceed;
- coordinates any later Security decision, Skill invocation, execution, response assembly, or delivery.

Planning Engine:

- validates the prepared Reasoning Outcome;
- selects one fixed M6 planning rule;
- constructs one advisory Candidate Plan;
- returns it without side effects.

Planning MUST NOT invoke Reasoning, choose a global cognitive sequence, discover or execute Skills, call tools, obtain authorization, mutate Context, or deliver a response. Returning a Respond Step does not authorize or perform delivery. Returning a Request More Context Step does not obtain or mutate Context.

## Architecture Boundary

The future Planning Engine implementation MAY depend only inward on Core-custodied Contracts and immutable types.

It MUST NOT depend on implementations of:

- Identity Engine;
- Context Engine;
- Memory Engine;
- Knowledge Engine;
- Reasoning Engine;
- Brain Engine;
- Skill Engine or Skills;
- Security or Execution capabilities;
- Bootstrap, Infrastructure, Providers, Adapters, Gateways, Clients, or external npm packages.

Core MUST NOT depend on Planning Engine. Bootstrap MAY compose Planning explicitly during M6 implementation. Capability registration MUST NOT be used as a service locator.

M6 architecture enforcement MUST include:

- the production dependency graph;
- Core-outward prohibition coverage;
- Planning-to-Bootstrap/Infrastructure prohibition;
- Planning-to-other-Engine/Skill/Execution implementation prohibition;
- Planning external-package prohibition;
- circular-dependency prohibition;
- isolated negative fixtures whose exact expected violation sets are asserted.

## Privacy and Observability

Future M6 diagnostics MAY expose only controlled operational facts such as:

- `planningCapabilityOperational`;
- `planningSucceeded`;
- `planCategory`;
- `stepCount`;
- `planningRuleCategory`;
- `responseStepProduced`;
- `requestMoreContextStepProduced`.

Diagnostics and ordinary logs MUST NOT expose:

- raw Candidate Conclusion or Candidate Response;
- raw Reasoning Query;
- Context, Identity, Memory, or Knowledge identifiers;
- Context Consumption Reference values;
- Memory content or Knowledge claim content;
- private chain-of-thought or planning traces;
- plan payload text;
- credentials, authentication tokens, secrets, provider payloads, or personal data.

Raw Candidate Response exists only in the returned Respond Step for protected orchestration. Its required Contract presence does not authorize logging or delivery.

Mandatory diagnostic output MUST remain observable at supported debug, info, warn, and error log levels without weakening privacy.

## Acceptance Criteria

M6 is ready for acceptance only when objective tests prove:

1. ENGINE-0007 is Active following formal approval before implementation completion.
2. Planning Engine is the single semantic owner of M6 planning behavior.
3. Core custodies shared Planning Contracts without owning Planning behavior.
4. Planning composes and runs without an external service.
5. Create Candidate Plan is the only M6 Planning capability Contract.
6. Exactly one complete immutable M5 Reasoning Outcome is mandatory.
7. Planning never calls Reasoning Engine or retrieves another Outcome.
8. All four approved M5 Reasoning Outcome categories are plannable.
9. Invalid or contradictory Reasoning Outcomes fail exactly as Invalid Reasoning Outcome.
10. Candidate Next Action `request-more-context` creates exactly one request-more-context step.
11. Candidate Next Action `none` creates exactly one respond step containing the exact Candidate Response.
12. Every plan contains exactly one step at ordinal `1`.
13. Candidate Plan `steps` is implemented and tested as a dense exact one-element array.
14. Empty, sparse, and multi-element `steps` arrays are rejected.
15. Additional enumerable string properties and enumerable symbol properties on `steps` are rejected, while standard non-enumerable `length` is accepted.
16. Candidate Plan and step categories are closed and correspond exactly.
17. M6 contains no Plan Identity, no zero-step plan, and no no-action step.
18. Candidate Response is copied without normalization or truncation and is not delivered or marked final.
19. Request More Context remains advisory and does not mutate Context or contact a user.
20. Planning Explainability corresponds exactly to the selected rule without raw content or chain-of-thought.
21. Reasoning Consumption Reference is privacy-safe, non-unique, and not lookup-capable.
22. Equivalent valid inputs produce deeply equivalent Candidate Plans.
23. Candidate Plans and all nested values are deeply immutable.
24. Caller-owned Reasoning Outcome remains unchanged and unfrozen after success and failure.
25. Hostile runtime inputs produce exact domain failures without native exception leakage.
26. Each of Invalid Planning Input, Invalid Reasoning Outcome, Planning Rule Failure, and Invalid Planning State has at least one exact-domain-error test.
27. Lifecycle/internal state failure and constructed-output validation failure are tested as separate Invalid Planning State paths.
28. Planning Rule Failure is demonstrated through an objective controlled rule-evaluation failure fixture or test seam.
29. Validation follows the normative precedence, stops at the first failure, and is demonstrated with hostile later-boundary values.
30. Planning performs no execution, Skill invocation, tool call, authorization, scheduling, retry, compensation, persistence, or Event publication.
31. Planning performs no Context, Memory, Knowledge, Identity, Brain, or external capability call.
32. Diagnostics contain no raw Conclusion, Response, query, identifiers, content, payload text, or private trace.
33. Mandatory diagnostics survive debug, info, warn, and error levels.
34. Planning Engine depends only inward on Core and imports no external npm package.
35. Every architecture negative fixture fails for its exact intended rule without weakening M0–M5 enforcement.
36. All M0–M5 and M6 tests, build, typecheck, lint, formatting, architecture, diagnostics, and repository validation pass.
37. No deferred capability or technology is introduced.

## Testing Requirements

The future M6 implementation MUST include deterministic tests for the following matrix.

### Core

- every exported Planning value and factory with valid, null, undefined, primitive, function, array, malformed-object, missing-field, unexpected-field, coercible, throwing-getter, hostile-Proxy, and mutable caller inputs;
- every applicable public factory or boundary with explicit empty arrays, valid populated arrays where arrays are permitted by that Contract, populated arrays containing malformed elements, sparse arrays, arrays with additional numeric indices, arrays with unexpected enumerable string properties, arrays with unexpected enumerable symbol properties, array-like non-array objects, hostile array getters, and hostile array Proxies;
- exact Candidate Plan, both Candidate Plan Step variants, Reasoning Consumption Reference, Planning Explainability, and nested graph shapes;
- inherited Candidate Conclusion and Candidate Response lower, maximum, one-above, mixed BMP/non-BMP, no-coercion, no-normalization, and no-truncation behavior;
- Candidate Plan and complete nested deep immutability;
- caller mutation after factory construction having no effect.

Every invalid array case MUST assert the exact Planning-domain error owned by the public factory or boundary. Tests MUST NOT use only a generic throws assertion.

### Candidate Plan Steps

The Candidate Plan `steps` test matrix MUST prove the dense exact one-element array rule.

Valid cases:

- a dense one-element array with a valid Candidate Plan Step at index `0`;
- enumerable string keys containing only `"0"`;
- no enumerable symbol properties;
- the standard non-enumerable `length` property;
- ordinary array prototype behavior.

Invalid cases:

- an empty array;
- a two-element array;
- a sparse array whose length is one;
- an array whose index `0` is missing;
- an array with any additional numeric index;
- an array with an additional enumerable string property;
- an array with an enumerable symbol property;
- an array containing a malformed Candidate Plan Step;
- an array-like non-array object;
- a coercible object;
- an array with a throwing index getter;
- a hostile array Proxy;
- an array whose property access changes across reads.

Each invalid public-factory input MUST produce that factory's exact approved Planning-domain failure without leaking a native exception. A constructed Candidate Plan that violates any of these rules MUST produce Invalid Planning State during constructed-output validation. Tests MUST also prove caller-owned arrays remain unchanged and unfrozen.

### Request

- null, undefined, every primitive category, function, array, missing-field, unexpected-field, invalid-intent, plural/conflicting-Outcome, and hostile top-level requests producing exactly Invalid Planning Input;
- throwing `getPrototypeOf`, `ownKeys`, property-descriptor, and intent access failures producing Invalid Planning Input;
- throwing Reasoning Outcome getter producing Invalid Reasoning Outcome;
- stateful Outcome getter proving exactly one protected read;
- exact top-level-versus-Outcome failure precedence.

### Reasoning Outcome

- each complete valid M5 Outcome category accepted;
- malformed status, category, Conclusion, Response, Next Action, Explainability, Context Consumption Reference, Identity State, counts, and Rule Category producing exactly Invalid Reasoning Outcome;
- every contradictory category/action/count/Identity/rule/text correspondence producing Invalid Reasoning Outcome;
- invalid inherited Unicode and count boundaries producing Invalid Reasoning Outcome;
- hostile getters and Proxies at every nested object level producing Invalid Reasoning Outcome;
- native Error, TypeError, RangeError, thrown primitive, and thrown object normalization;
- supplied Outcome remaining deeply equal, structurally unchanged, and unfrozen after successful and failed planning.

### Rules

- Anonymous Context mapping to request-more-context;
- Context-only mapping to request-more-context;
- Knowledge-grounded mapping to respond;
- Experience-informed mapping to respond;
- exact Plan status, category, dense exact one-element `steps` array, ordinal, kind, copied response presence or absence, source, explainability, and rule-category correspondence for every case;
- no-action and zero-step states being unconstructable;
- no free-text interpretation affecting rule selection.

### Determinism

- repeated evaluation of one request;
- independently constructed equivalent inputs;
- equivalent M5 Outcomes producing deeply equal plans;
- absence of clock, randomness, allocation, retained history, or mutable global-state influence.

### Boundaries

- zero-collaborator Planning Engine construction and successful evaluation using Core values only;
- no Reasoning Engine import or call;
- no Context, Memory, Knowledge, Identity, Brain, Security, Skill, execution, Provider, or external service collaborator or call;
- Candidate Response copied but neither rewritten nor delivered;
- Request More Context step returned without Context mutation or user interaction;
- no authorization, persistence, Event, scheduling, retry, compensation, or execution state.

### Privacy and Diagnostics

- successful diagnostics for both Plan categories;
- operational category, rule, and count fields only;
- absence of raw Conclusion, Response, query, identifiers, Context Reference values, content, payload text, chain-of-thought, credentials, tokens, secrets, and personal data;
- mandatory diagnostic output at debug, info, warn, and error levels;
- privacy-safe error messages under hostile input.

### Architecture

- production graph passes;
- Core cannot depend on Planning Engine;
- Planning cannot depend on Bootstrap, Infrastructure, other Engine implementations, Skills, execution implementations, or external npm packages;
- circular rules remain active;
- every isolated fixture produces exactly its intended violation set;
- M0–M5 architecture enforcement remains unchanged and passing.

### Failure Taxonomy

The future M6 implementation MUST test every public path in the closed four-error model.

#### InvalidPlanningInputError

Tests MUST assert exactly Invalid Planning Input for:

- null and primitive requests;
- array requests, including empty and populated arrays;
- malformed intent;
- missing required top-level fields;
- unexpected top-level fields;
- hostile top-level key, descriptor, intent, or ownership access.

#### InvalidReasoningOutcomeError

Tests MUST assert exactly Invalid Reasoning Outcome for:

- malformed Reasoning Outcome structure;
- invalid status or category;
- malformed Candidate Conclusion or Candidate Response;
- malformed Candidate Next Action or Explainability;
- contradictory M5 semantic correspondence;
- hostile nested Reasoning Outcome access.

#### PlanningRuleFailureError

A controlled deterministic fixture or test seam MUST allow a completely valid normalized request to reach rule evaluation while the internal rule table resolves no valid rule. The test MUST assert exactly Planning Rule Failure, prove that no native exception escapes, prove that caller input remains unchanged and unfrozen, and classify the condition as an internal semantic rule-evaluation failure rather than malformed caller input. The seam MUST NOT expand the public production Contract or introduce configurable planning behavior.

#### InvalidPlanningStateError

Tests MUST separately cover:

1. a lifecycle/internal state failure before request processing; and
2. a constructed-output validation failure after successful rule selection.

Each test MUST assert exactly Invalid Planning State, prove that no native exception escapes, prove that caller input remains unchanged and unfrozen, and verify privacy-safe failure text. The constructed-output fixture or seam MUST be controlled and MUST NOT expand the public production Contract.

### Validation Precedence

Tests MUST prove this exact first-failure order with hostile later-boundary values:

1. lifecycle/internal state;
2. Planning Request;
3. Reasoning Outcome structure;
4. Reasoning Outcome semantic correspondence;
5. rule evaluation;
6. constructed Planning state.

At minimum, tests MUST prove:

- lifecycle/internal state failure plus a hostile request produces Invalid Planning State without inspecting the request;
- invalid request intent plus a hostile Reasoning Outcome getter produces Invalid Planning Input;
- valid request shape plus malformed Reasoning Outcome and a hostile controlled rule seam produces Invalid Reasoning Outcome;
- structurally malformed Reasoning Outcome plus contradictory semantic fields produces Invalid Reasoning Outcome at the structural boundary;
- structurally valid but contradictory Reasoning Outcome plus a hostile controlled rule seam produces Invalid Reasoning Outcome at the semantic-correspondence boundary;
- a valid normalized request plus controlled rule-evaluation failure produces Planning Rule Failure;
- valid rule resolution plus controlled invalid constructed state produces Invalid Planning State.

Validation MUST stop at the first failed boundary. Every test MUST assert the exact domain error, no native exception leakage, caller-input non-mutation, and privacy-safe failure text.

Tests MUST require no network, LLM, model SDK, external service, database, persistent storage, Event infrastructure, nondeterministic clock, random identity, Skill implementation, or execution environment.

Tests MUST assert exact Planning-domain error classes rather than merely asserting that an operation throws.

## Explicitly Deferred

M6 explicitly defers:

- Planning identity, persistence, retrieval, listing, versioning, lifecycle, and audit history;
- multi-step plans and workflow graphs;
- dependencies between steps;
- branching, loops, parallel execution, and conditional execution;
- scheduling, deadlines, priorities, resource budgets, and execution windows;
- retries, backoff, compensation, rollback, and recovery;
- authorization and Security policy evaluation;
- Skill discovery, selection, permission evaluation, invocation, and execution;
- tool selection and calls;
- Providers and external services;
- Brain orchestration and cognitive-pipeline sequencing;
- final response assembly, rendering, delivery, transport, and voice;
- Context retrieval or mutation;
- Memory retrieval, retention, or mutation;
- Knowledge retrieval, acceptance, contradiction resolution, or mutation;
- Reasoning invocation or Outcome retrieval;
- Events, brokers, queues, distributed execution, and production audit infrastructure;
- chain-of-thought and internal planning-trace storage or exposure.

## Open Questions

There are no implementation-critical open questions for M6.

The following decisions are resolved normatively by this specification:

- no Plan Identity;
- Candidate Plan is the public successful output without a wrapper;
- exactly one step, never zero;
- no no-action category or step;
- `request-more-context` maps to one request step;
- `none` maps to one respond step;
- Candidate Response is copied exactly into Respond Step;
- all four M5 Outcome categories are supported;
- no planning constraints;
- one non-unique structural Reasoning Consumption Reference;
- exact validation precedence and four-failure vocabulary.

Future requirements for multi-step decomposition, execution binding, identity, persistence, constraints, approval, or scheduling require a new formally reviewed specification revision and are not open implementation choices under M6.

## Future Evolution

Later approved milestones MAY add stable Plan identity, richer structured objectives, bounded multi-step decomposition, explicit dependencies, constraints, approval, execution handoff, Skill binding, scheduling, persistence, audit evidence, and meaningful Planning Events.

Future evolution MUST preserve Planning semantic ownership, Brain orchestration ownership, Reasoning immutability, advisory-versus-execution separation, Security ownership, Core Contract custody, inward dependency direction, privacy, and deterministic runtime boundaries.

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
- [ENGINE-0006 — Reasoning Engine](../reasoning/ENGINE-0006-Reasoning-Engine.md)
- [IMPLEMENTATION-M0 — Executable Architectural Skeleton](../../../IMPLEMENTATION-M0.md)
- [IMPLEMENTATION-M1 — Identity Engine Vertical Slice](../../../IMPLEMENTATION-M1.md)
- [IMPLEMENTATION-M2 — Context Engine Vertical Slice](../../../IMPLEMENTATION-M2.md)
- [IMPLEMENTATION-M3 — Memory Engine Vertical Slice](../../../IMPLEMENTATION-M3.md)
- [IMPLEMENTATION-M4 — Knowledge Engine Vertical Slice](../../../IMPLEMENTATION-M4.md)
- [IMPLEMENTATION-M5 — Reasoning Engine Vertical Slice](../../../IMPLEMENTATION-M5.md)

## Engineering Motto

> Planning proposes one bounded next structure; it does not make that structure happen.
