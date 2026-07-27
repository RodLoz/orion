# ENGINE-0008 — Skill Engine

| Field          | Value                                         |
| -------------- | --------------------------------------------- |
| **Status**     | Active                                        |
| **Version**    | 1.0.0                                         |
| **Owner**      | Project Maintainers                           |
| **Created**    | 2026-07-27                                    |
| **Updated**    | 2026-07-27                                    |
| **Applies To** | Skill Engine, M7 Skill Catalog Vertical Slice |

---

## Status

This specification is Active and authorizes the M7 Skill Catalog vertical
slice.

The key words **MUST**, **MUST NOT**, **SHOULD**, **SHOULD NOT**, and **MAY**
describe normative requirements.

## Version

Version `1.0.0` defines the approved first Skill Engine catalog vertical slice.

## Authority

This specification specializes the Foundation rules that:

- Skills are a platform capability owned by the Skill Engine;
- the Skill Engine owns Skill discovery, registration, validation, permission
  checking, execution, and result normalization;
- Skills are independent capability packages that expose executable operations;
- Skills declare identity, version, capabilities, and required permissions;
- Skills do not own platform intelligence and do not communicate directly with
  Providers, Adapters, or external systems;
- the Brain Engine owns cognitive orchestration;
- the Security Engine owns security policy and authorization-decision semantics;
- Core custodies shared Contracts while the owning Engine retains capability
  semantics.

This specification deliberately covers only prepared manifest validation, process-local
registration, lookup, and deterministic capability discovery. It does not
resolve the still-undefined execution, authorization, selection, Context, or
Planning handoff protocols.

If this specification conflicts with an approved ADR, Active Architecture Specification,
Active Concept Specification, or Active Engineering Standard, the higher
authority governs.

## Milestone

**M7 — Skill Engine: Skill Catalog Vertical Slice**

M7 establishes a deterministic catalog of valid Skill packages without loading
files, installing packages, choosing among candidates, authorizing an action, or
executing a Skill.

## Purpose

The M7 Skill Engine answers:

> Which valid, registered Skill packages declare this capability?

The slice provides a stable boundary between prepared Skill metadata and future
orchestration. It proves that the platform can validate, register, look up, and
discover Skill packages without acquiring workflow, Security, execution,
Provider, Adapter, persistence, or Brain responsibilities.

## Authoritative Scope

M7 includes:

- one Core-custodied immutable Skill Manifest model;
- closed identifier syntaxes for Skill identity and manifest declarations;
- declared required permission identifiers as metadata only;
- declared Event publication and consumption identifiers as metadata only;
- declared input, output, and failure-mode identifiers as metadata only;
- deterministic validation of one prepared Skill Manifest;
- process-local registration of valid Skill Manifests;
- exact lookup by Skill Identifier;
- exact capability discovery across registered manifests;
- deterministic ordering independent of registration order;
- deep immutability and defensive reconstruction;
- explicit lifecycle and failure semantics;
- privacy-minimal diagnostics;
- no external package, filesystem, network, database, Event, or executable Skill.

M7 does not parse YAML or another serialization format. A future outer boundary
may parse a representation and submit an untrusted runtime value to the Core
factory and Skill Engine Contract.

ENGINE-0008 normatively defines the minimal M7 Skill catalog schema under the
applicable ADR and OES authority. A separate manifest-schema specification is not
required for M7. Future executable Skill packaging MAY introduce additional
specifications without changing M7 catalog identity, registration, lookup, or
discovery semantics.

Event, input, output, and failure-mode declarations are descriptive manifest
metadata only. Their presence does not publish or consume an Event, bind an
invocation input, produce an execution output, handle an execution failure, load
code, or invoke a Skill.

## Capability Ownership

The Skill Engine is the single semantic owner of:

- M7 Skill Manifest admissibility;
- registration eligibility;
- duplicate Skill Identifier rejection;
- the meaning of registered Skill metadata;
- exact capability discovery;
- deterministic discovery ordering;
- Skill catalog validation and failure semantics.

Core is the canonical schema custodian of shared Skill types, failures, and
Contracts. Core custody does not transfer Skill behavior to Core.

Skill packages own their declared business workflows and exposed operations.
Registration does not transfer a Skill package's business workflow to the Skill
Engine.

## Owned Concepts

### Skill Identifier

A Skill Identifier is the globally unique identifier declared by one Skill
package and is the sole M7 catalog uniqueness key.

It MUST:

- be a primitive string;
- use lowercase kebab-case;
- begin with an ASCII lowercase letter;
- contain only ASCII lowercase letters, digits, and single hyphens between
  non-empty segments;
- contain between 1 and 64 ASCII characters.

The pattern is:

```text
^[a-z][a-z0-9]*(?:-[a-z0-9]+)*$
```

Equality is exact, case-sensitive primitive-string equality. Implementations
MUST NOT trim, case-fold, normalize, coerce, or otherwise rewrite an identifier.

### Skill Capability Identifier

A Skill Capability Identifier names one operation exposed by a Skill package.
It is not the platform-wide Skill capability type and is not a runtime
availability record.

It MUST be a primitive ASCII string, follow the active Core
`CapabilityIdentifier` grammar, and contain between 1 and 128 characters.
Equality is exact, case-sensitive primitive-string equality. Implementations
MUST NOT trim, case-fold, normalize, coerce, or otherwise rewrite it.

### Skill Permission Identifier

A Skill Permission Identifier declares one permission required by a Skill
package. M7 treats it as metadata and makes no authorization decision.

It MUST:

- be a primitive string;
- contain a namespace and action separated by one or more dots;
- use lowercase ASCII letter or digit segments separated by single dots;
- begin each segment with an ASCII lowercase letter;
- contain between 3 and 128 ASCII characters;
- contain no wildcard segment.

The pattern is:

```text
^[a-z][a-z0-9]*(?:\.[a-z][a-z0-9]*)+$
```

Equality is exact, case-sensitive primitive-string equality. Implementations
MUST NOT trim, case-fold, normalize, coerce, or otherwise rewrite it. A
permission declaration is metadata only. It does not represent a grant, denial,
authorization decision, user, session, role, policy result, or permission
evaluation.

### Event Declaration Identifier

An Event Declaration Identifier names an Event type that a future executable
Skill may publish or consume. It is metadata only.

It MUST:

- be a primitive ASCII string;
- contain between 1 and 128 characters;
- use the OES-0005 PascalCase Event naming form;
- match `^[A-Z][A-Za-z0-9]*$`.

Equality is exact and case-sensitive. Implementations MUST NOT normalize it.
Catalog admission grants no Event publication authority and creates no Event
subscription.

### Skill Interface Field Identifier

A Skill Interface Field Identifier names one declared future invocation input or
output field. It does not define a runtime schema, bind a value, or authorize an
invocation.

It MUST be a primitive ASCII string of 1–64 characters using the active Core
`CapabilityIdentifier` grammar. Equality is exact and case-sensitive.
Implementations MUST NOT normalize it.

### Skill Failure Mode Identifier

A Skill Failure Mode Identifier names one declared future execution failure
category. It is metadata only and is not an M7 Engine failure.

It MUST be a primitive ASCII string of 1–64 characters using the active Core
`CapabilityIdentifier` grammar. Equality is exact and case-sensitive.
Implementations MUST NOT normalize it.

### Free-Text Values

`name`, `description`, and `author` are primitive Unicode strings. Bounds are
counted in Unicode code points, not UTF-16 code units or bytes:

- `name`: 1–100 code points;
- `description`: 1–500 code points;
- `author`: 1–100 code points.

Each value MUST contain at least one code point that does not have the Unicode
`White_Space` property. A value containing any Unicode control code point in
General Category `Cc` is invalid.

Implementations MUST NOT trim, case-fold, apply Unicode normalization, replace
code points, coerce, or truncate these values. Every otherwise valid code point,
including leading or trailing whitespace, MUST be preserved exactly.

`license` is a primitive string of 1–64 printable ASCII characters from U+0020
through U+007E inclusive. It MUST contain at least one character other than
U+0020 SPACE. Implementations MUST NOT trim, case-fold, normalize, coerce, or
truncate it. Its exact value MUST be preserved.

### Skill Version

Skill Version is one complete Semantic Version string. It MUST:

- be a primitive ASCII string of 5–128 characters;
- contain the required `MAJOR.MINOR.PATCH` core;
- permit optional prerelease and build metadata;
- follow complete Semantic Version precedence grammar, including no leading
  zeroes in numeric core or numeric prerelease identifiers except the value
  zero;
- contain only ASCII digits, letters, hyphens, plus, and dot separators where
  permitted by Semantic Version grammar.

The complete syntax is:

```text
version     = core [ "-" prerelease ] [ "+" build ]
core        = numeric "." numeric "." numeric
prerelease  = prerelease-id *( "." prerelease-id )
build       = build-id *( "." build-id )
numeric     = "0" / nonzero-digit *digit
prerelease-id = numeric / identifier-containing-letter-or-hyphen
build-id    = 1*( ASCII letter / digit / "-" )
```

Every identifier is non-empty. A numeric prerelease identifier MUST NOT contain
a leading zero unless it is exactly `0`. Build identifiers MAY be numeric with
leading zeroes. `v` prefixes, surrounding whitespace, empty identifiers, and
characters outside this grammar are invalid.

The value is preserved exactly. M7 performs no version ordering, compatibility
evaluation, range matching, upgrade, or selection. Exact version equality is
metadata equality only and does not participate in Skill identity.

### Skill Event Declarations

Skill Event Declarations is an exact immutable object with exactly:

- `publishes`: a dense exact array of 0–64 unique Event Declaration Identifiers;
- `consumes`: a dense exact array of 0–64 unique Event Declaration Identifiers.

Both properties are required. Event declaration order is semantically
irrelevant. Valid unsorted arrays are accepted; duplicates are rejected; newly
reconstructed arrays are sorted by locale-independent code-point order.

These declarations neither emit nor consume Events.

### Skill Manifest

The M7 Skill Manifest is immutable prepared metadata with exactly:

- `id`: one Skill Identifier;
- `name`: a primitive string of 1–100 Unicode code points;
- `version`: one Skill Version;
- `description`: a primitive string of 1–500 Unicode code points;
- `author`: a primitive string of 1–100 Unicode code points;
- `license`: a primitive string of 1–64 printable ASCII characters;
- `permissions`: a dense immutable array of 0–64 unique Skill Permission
  Identifiers;
- `capabilities`: a dense immutable array of 1–64 unique Skill Capability
  Identifiers;
- `events`: one Skill Event Declarations object;
- `inputs`: a dense immutable array of 0–64 unique Skill Interface Field
  Identifiers;
- `outputs`: a dense immutable array of 0–64 unique Skill Interface Field
  Identifiers;
- `failureModes`: a dense immutable array of 0–64 unique Skill Failure Mode
  Identifiers.

Every property is required. Explicit `undefined`, missing properties, inherited
substitutes, and additional properties are invalid.

The fields have these M7 semantic and privacy roles:

| Property       | M7 role                                    | Privacy treatment                               |
| -------------- | ------------------------------------------ | ----------------------------------------------- |
| `id`           | Stable catalog identity and uniqueness key | Never included in ordinary diagnostics          |
| `name`         | Human-readable metadata                    | Never included in ordinary diagnostics          |
| `version`      | Preserved package-version metadata         | Never used for selection or logged              |
| `description`  | Human-readable metadata                    | Never included in ordinary diagnostics          |
| `author`       | Attribution metadata                       | Never included in ordinary diagnostics          |
| `license`      | License-declaration metadata               | Never included in ordinary diagnostics          |
| `permissions`  | Required-permission declarations only      | Never treated as grants or logged               |
| `capabilities` | Exact discovery declarations               | Never logged                                    |
| `events`       | Future Event declarations only             | Never activates Events or publication authority |
| `inputs`       | Future invocation-input names only         | Never binds or accepts input values             |
| `outputs`      | Future invocation-output names only        | Never produces output values                    |
| `failureModes` | Future execution-failure declarations only | Never changes M7 Engine failures                |

Within each manifest, `permissions` and `capabilities` MUST be sorted by ascending
code-point order after validation. Declaration order is semantically irrelevant.
Valid unsorted input is accepted. Duplicate values are rejected before canonical
reconstruction. Canonical sorting applies to the newly created output only and
is not semantic normalization of caller input.

The same rules apply independently to `events.publishes`, `events.consumes`,
`inputs`, `outputs`, and `failureModes`: declaration order is semantically
irrelevant, valid unsorted input is accepted, exact duplicates are rejected, and
new output arrays are canonically sorted by locale-independent code-point order.
No caller-owned array is sorted, deduplicated, frozen, retained, or mutated.

### Registered Skill

A Registered Skill is exactly the admitted Skill Manifest, defensively
reconstructed and deeply frozen. If represented by a distinct Core type or
factory, it has exactly the Skill Manifest property set and no additional public
field.

Registration means only that the manifest is valid and available for catalog
discovery in the current Skill Engine instance. It does not mean installed,
loaded, initialized, selected, authorized, healthy, available as an executable
capability, ready for invocation, safe to execute, or executable.

A Registered Skill MUST NOT contain a registration timestamp, generated
identifier, sequence number, status, availability, health, loaded flag,
initialized flag, executable reference, runtime handle, or execution-readiness
metadata.

### Skill Discovery Result

A Skill Discovery Result contains:

- `capability`: the exact requested Skill Capability Identifier;
- `matches`: a dense immutable array of matching registered Skill Manifests.

Matches MUST be ordered by ascending Skill Identifier. M7 does not rank by
version, preference, cost, health, Context, policy, or registration order.

## Inputs and Outputs

### Register Skill Manifest

The exact Register request is:

```text
{
  intent: "register-skill-manifest",
  manifest: SkillManifest
}
```

It has exactly the own string properties `intent` and `manifest`.

Register synchronously returns the immutable Registered Skill.

### Get Registered Skill

The exact Get request is:

```text
{
  intent: "get-registered-skill",
  skillId: SkillIdentifier
}
```

It has exactly the own string properties `intent` and `skillId`.

Get synchronously returns the immutable Registered Skill or throws
`SkillNotFoundError`.

### Discover Skills

The exact Discover request is:

```text
{
  intent: "discover-skills",
  capability: SkillCapabilityIdentifier
}
```

It has exactly the own string properties `intent` and `capability`.

Discover synchronously returns one immutable Skill Discovery Result, including
an empty `matches` array when no registered Skill declares the capability.

For all three requests:

- only the stated own string properties are permitted;
- every property is required;
- explicit `undefined` is invalid;
- unexpected own string properties are invalid;
- inherited substitutes and enumerable symbol properties are invalid;
- arrays, array-like objects, functions, primitives, and coercible substitutes
  are invalid;
- property values are never coerced.

## Core-Custodied Contracts

Core MUST custody:

- all M7 identifier and declaration types and factories;
- Skill Manifest, Registered Skill, and Skill Discovery Result types and
  factories;
- the three M7 request and result Contracts;
- the closed M7 Skill-domain failure types.

| Contract                | Semantic owner | Schema custodian | Side effects                    |
| ----------------------- | -------------- | ---------------- | ------------------------------- |
| Register Skill Manifest | Skill Engine   | Core             | Process-local catalog insertion |
| Get Registered Skill    | Skill Engine   | Core             | None                            |
| Discover Skills         | Skill Engine   | Core             | None                            |

M7 defines no installation, file discovery, initialization, permission decision,
selection, invocation, execution, shutdown, or result-normalization Contract.

All three M7 Contracts are synchronous request/response operations. They return
or throw before the call completes. They define no Promise, callback, stream,
Event, external wait, or asynchronous continuation.

## Engine Behavior

### Registration

For a valid request while Running, the Skill Engine MUST:

1. defensively reconstruct the complete Skill Manifest;
2. reject a Skill Identifier already registered in this Engine instance;
3. store only the reconstructed immutable manifest;
4. make the manifest immediately visible to lookup and discovery;
5. return the same immutable registered value held by the catalog.

Registration is atomic. A failure MUST leave the catalog unchanged.

Two manifests with different Skill Identifiers MAY declare the same capability.
M7 does not select a preferred match.

Skill Identifier alone is the catalog uniqueness key. M7 permits exactly one
Registered Skill per Skill Identifier. Once an identifier exists, every later
registration with that identifier MUST fail with
`DuplicateSkillIdentifierError`, including:

- the same identifier and an identical manifest;
- the same identifier and a different version;
- the same identifier and different capabilities;
- the same identifier and different permissions;
- the same identifier and different event, input, output, or failure
  declarations;
- the same identifier and any other changed metadata.

Registration is not idempotent. Version does not participate in identity.
Multiple versions of one Skill Identifier cannot coexist. Update, replacement,
upgrade, and removal do not exist in M7.

### Lookup

Lookup MUST use exact Skill Identifier equality. A missing identifier MUST
produce Skill Not Found. Lookup MUST NOT fall back to name, capability, version,
or approximate matching.

### Discovery

Discovery MUST use exact Skill Capability Identifier equality.

It MUST return every registered manifest that declares the capability exactly
once, ordered by Skill Identifier. No match is a successful empty result, not a
failure.

Discovery MUST NOT:

- choose one result;
- interpret a Candidate Plan;
- inspect Context, Identity, Memory, Knowledge, or Reasoning;
- evaluate permissions;
- load, initialize, or execute a Skill;
- infer capabilities from names or descriptions.

Discovery accepts exactly one capability. It defines no plural query, duplicate
query, AND, or OR semantics. It does not filter by declared permissions, Events,
inputs, outputs, failures, version, user, Identity, Context, authorization, or
runtime state.

Discovery answers only:

> Which registered Skills declare this exact capability?

It does not answer:

> Which Skill should O.R.I.O.N. use?

M7 defines no list-all catalog Contract.

## Catalog Lifecycle

A newly constructed Skill Engine instance owns one new empty process-local
catalog.

The Engine follows the platform lifecycle:

```text
Initialize → Ready → Running → Stopping → Stopped
```

Register, Get, and Discover are valid only while Running. Every other lifecycle
state, including Stopping and Stopped, rejects every operation with
`InvalidSkillStateError` before request inspection.

All M7 operations are synchronous. Each registration is atomic, and synchronous
operations MUST NOT interleave; an implementation MUST provide equivalent
serialization if its local runtime could otherwise re-enter an operation. M7
defines no infrastructure lock, distributed lock, transaction service, or
cross-process consistency mechanism.

Catalog state belongs only to its Engine instance. A different Engine instance
has a different empty catalog. Stopping creates no persistent representation,
and M7 defines no restart restoration, persistence, update, replacement,
upgrade, removal, synchronization, or concurrent mutation model beyond
synchronous atomic operation semantics.

## Deterministic Semantics

Given the same lifecycle state, catalog contents, and request:

- registration has the same success or exact failure;
- lookup returns a deeply equivalent manifest;
- discovery returns a deeply equivalent result in the same order;
- no clock, randomness, locale collation, filesystem order, registration order,
  network result, environment value, or mutable global state affects output.

Ascending order MUST be defined by direct comparison of validated identifier
code points. Locale-sensitive sorting MUST NOT be used.

## Runtime Boundary Safety

Every public factory and Contract boundary MUST treat input as hostile.

Before any externally supplied request boundary is inspected, the Skill Engine
MUST validate internally that its lifecycle permits the operation and that its
existing process-local catalog is valid. If either check fails, the operation
MUST throw `InvalidSkillStateError` without inspecting request `ownKeys`,
property descriptors, `intent`, `manifest`, `skillId`, `capability`, or any later
boundary.

This internal Step 1 validation MUST leave a hostile request completely
untouched, including a hostile Proxy, `ownKeys` trap,
`getOwnPropertyDescriptor` trap, `intent` getter, `manifest` getter, `skillId`
getter, or `capability` getter. Pre-existing catalog corruption has precedence
over every request or input failure.

Implementations MUST:

- accept `unknown`, not trust compile-time typing;
- reject null, undefined, primitives, functions, and arrays where records are
  required;
- require exact own-property shapes and reject missing fields, explicit
  `undefined`, unexpected own string fields, inherited substitutes, and
  enumerable symbol properties;
- reject arrays where records are required and array-like objects where arrays
  are required;
- reject coercion, normalization, truncation, and implicit string conversion;
- protect prototype, `ownKeys`, property-descriptor, getter, nested getter,
  index, iterator, and Proxy inspection;
- safely capture own keys and descriptors exactly once at every accepted object
  boundary;
- perform exactly one protected read for each accepted property;
- reconstruct exclusively from captured local values;
- normalize inspection failures into the correct Skill-domain failure;
- never freeze, retain, sort, or mutate caller-owned objects or arrays;
- validate dense arrays, own indices, enumerable string keys, and enumerable
  symbol keys;
- capture each accepted array-index descriptor and value once and never repeat a
  potentially stateful index read;
- reconstruct all accepted nested values before catalog insertion or return.

Arrays MUST contain exactly their declared dense indices and the standard
non-enumerable `length` property. Additional enumerable string or symbol
properties are invalid.

These rules apply independently to Contract requests, Skill Manifest,
Skill Event Declarations, capabilities, permissions, Event declarations,
inputs, outputs, failure modes, Registered Skill construction, Skill Discovery
Result, and every nested item. Stateful getters or Proxy traps MUST NOT cause a
second read.

Failure mapping is exact:

- malformed Register request envelope inspection produces
  `InvalidSkillInputError`;
- failure to extract, reconstruct, or validate `manifest` or any nested manifest
  value produces `InvalidSkillManifestError`;
- malformed Get or Discover envelope or identifier extraction produces
  `InvalidSkillInputError`;
- invalid lifecycle, pre-existing catalog corruption, impossible existing
  registered entries or catalog invariants, or newly constructed result
  corruption produces `InvalidSkillStateError`.

No native exception, thrown primitive, hostile value, or implementation error
may cross a public M7 factory or Contract.

## Validation Precedence

Each operation MUST stop at the first failed boundary.

### Register Skill Manifest

1. Engine lifecycle and pre-existing internal catalog state;
2. Register request envelope structure and intent;
3. Skill Manifest and nested declaration structural extraction;
4. Skill Manifest scalar, collection, bound, uniqueness, and semantic
   validation;
5. duplicate registered Skill Identifier;
6. newly constructed Registered Skill and resulting internal catalog state.

Step 6 concerns only state created as a consequence of the current registration
attempt. Corruption that existed before the operation began belongs exclusively
to Step 1.

### Get Registered Skill

1. Engine lifecycle and pre-existing internal catalog state;
2. Get request envelope structure and intent;
3. Skill Identifier;
4. exact catalog lookup;
5. newly reconstructed returned Registered Skill state.

A corrupt existing catalog fails at Step 1 before the Get request is inspected.
Step 5 concerns only invalid state detected while reconstructing the return value
from an otherwise valid catalog entry.

### Discover Skills

1. Engine lifecycle and pre-existing internal catalog state;
2. Discover request envelope structure and intent;
3. Skill Capability Identifier;
4. exact catalog discovery;
5. newly constructed Skill Discovery Result state.

A corrupt existing catalog fails at Step 1 before the Discover request is
inspected. Step 5 concerns only invalid state in the newly reconstructed
discovery result.

Later boundaries MUST NOT be inspected after an earlier failure. An earlier
failure MUST prevent every hostile getter, Proxy, descriptor, or collection at a
later boundary from being touched.

## Failure Semantics

M7 defines this closed public failure model:

- `InvalidSkillInputError` — malformed Register, Get, or Discover request
  envelope; malformed lookup or discovery identifier; or hostile envelope or
  identifier extraction;
- `InvalidSkillManifestError` — malformed Skill Manifest or nested declaration,
  invalid bound, duplicate declaration, semantic contradiction, or hostile
  manifest, nested getter, collection, or Proxy;
- `DuplicateSkillIdentifierError` — any second registration for an existing
  Skill Identifier;
- `SkillNotFoundError` — a valid exact Get request identifies no registered
  Skill; no other operation produces this failure;
- `InvalidSkillStateError` — either:
  - a pre-existing state failure: invalid lifecycle, corrupted existing catalog,
    impossible existing Registered Skill entry, or impossible existing catalog
    invariant; or
  - a constructed-state failure: impossible newly constructed Registered Skill,
    impossible post-registration catalog state, impossible reconstructed Get
    result, or impossible Skill Discovery Result.

Both classes use the same public failure. Their validation-precedence position
distinguishes them: pre-existing state fails at Step 1 before request inspection;
constructed state fails only at the final step after every earlier stage
succeeds.

No native exception, thrown primitive, implementation detail, raw manifest
content, identifier, permission, or capability value may escape a public
boundary.

Every public failure message MUST be stable, deterministic, technology-neutral,
and privacy-safe. It MUST NOT contain input serialization, raw hostile values,
manifest fields, declaration identifiers, stack traces, credentials, tokens, or
implementation details.

Discovery with no matches is not a failure.

M7 defines no permission, authorization, installation, invocation, execution,
Provider, Adapter, timeout, or external-system failure because those operations
are deferred.

## Immutability

All Core-created and Engine-returned M7 values MUST be deeply immutable.

The Engine MUST:

- retain only defensively reconstructed values;
- expose no mutable catalog collection;
- deeply freeze Skill Manifest, Registered Skill, nested declaration objects and
  collections, Skill Discovery Result, and result arrays;
- preserve caller input unchanged and unfrozen on success and failure;
- prevent mutation through aliases held by the caller.

Caller-owned objects and arrays MUST NOT be retained, frozen, sorted in place,
deduplicated in place, rewritten, decorated with metadata, or otherwise mutated.
Canonical output ordering MUST be produced only in newly allocated collections.

Process-local catalog mutation occurs only through successful registration.
Registered manifests cannot be updated or removed in M7.

## Privacy and Diagnostics

M7 diagnostics MAY expose only controlled operational facts:

- `skillCapabilityOperational`;
- `skillRegistrationSucceeded`;
- `registeredSkillCount`;
- `discoverySucceeded`;
- `discoveryMatchCount`;
- `lookupSucceeded`.

Diagnostics, logs, and error messages MUST NOT expose:

- Skill Identifier values;
- manifest name, description, author, or license;
- permission or capability identifiers;
- manifest payloads;
- Context, Identity, Memory, Knowledge, Reasoning, or Planning values;
- credentials, tokens, secrets, external payloads, or personal data.

Mandatory diagnostics MUST remain observable at supported debug, info, warn, and
error log levels without weakening privacy.

## Architecture and Dependency Rules

The future M7 Skill Engine implementation MAY depend only inward on
Core-custodied Contracts and immutable values.

It MUST NOT depend on:

- Bootstrap or a capability registry implementation;
- Brain, Identity, Context, Memory, Knowledge, Reasoning, Planning, Security,
  Voice, Automation, or another Engine implementation;
- Skill package implementations;
- Providers, Adapters, Infrastructure, Gateways, Clients, or external systems;
- filesystem watchers, module loaders, package managers, databases, Event
  infrastructure, LLM SDKs, or external npm packages.

Core MUST NOT depend on the Skill Engine or a Skill package.

Executable Skill packages are intentionally absent from the M7 production graph.
Manifest registration MUST NOT import, instantiate, load, initialize, probe, or
retain a Skill implementation, executable path, Provider reference, Adapter
reference, endpoint, credential, token, runtime instance, or runtime handle.

Bootstrap MAY compose the future Engine explicitly. The M0 capability registry
MUST remain metadata-only and MUST NOT become the Skill catalog or a service
locator.

## Brain and Orchestration Boundary

Brain owns cognitive sequencing and selection of when a Skill capability is
needed.

The M7 Skill Engine:

- validates and catalogs prepared manifests;
- answers exact catalog queries;
- does not decide whether a request requires a Skill;
- does not interpret Reasoning Outcomes or Candidate Plans;
- does not choose among multiple discovery matches;
- does not coordinate Planning, Security, Context, or final-result assembly;
- does not invoke or execute a Skill.

Future protected orchestration MAY call an approved discovery Contract. It MUST
NOT acquire Skill catalog semantics by doing so.

## Interactions with Accepted M0–M6

### M0 — Core/Foundation

M7 reuses inward Contract dependency, explicit Bootstrap composition, metadata-
only capability registration, structured diagnostics, and architecture
enforcement. The M0 capability registry remains distinct from the Skill catalog.

### M1 — Identity

M7 neither resolves nor stores Identity. Identity-dependent permission or
ownership semantics are deferred.

### M2 — Context

M7 neither consumes nor mutates Context. Although the Foundation states that
Skill execution consumes Context, execution is outside this slice.

### M3 — Memory

M7 neither retrieves nor mutates Memory. Skills remain unable to own Memory.

### M4 — Knowledge

M7 neither accepts claims nor treats manifests as Knowledge. Registration is
catalog state, not Knowledge acceptance.

### M5 — Reasoning

M7 does not consume Reasoning Outcomes or infer whether a Skill is required.

### M6 — Planning

M7 does not consume Candidate Plans. The accepted M6 Candidate Plan contains
only `respond` and `request-more-context` advisory steps and has no Skill binding,
executable step, authorization artifact, or execution handoff.

M7 therefore follows Planning architecturally by establishing the next
Foundation-owned capability boundary, but it does not fabricate a Planning-to-
Skill protocol that M6 does not define.

## Normative Runtime Bounds

This specification defines the following normative bounds:

| Value                            | Bound                                 |
| -------------------------------- | ------------------------------------- |
| Skill Identifier                 | 1–64 ASCII characters                 |
| Skill Capability Identifier      | 1–128 ASCII characters                |
| Skill Permission Identifier      | 3–128 ASCII characters                |
| Event Declaration Identifier     | 1–128 ASCII characters                |
| Skill Interface Field Identifier | 1–64 ASCII characters                 |
| Skill Failure Mode Identifier    | 1–64 ASCII characters                 |
| Name                             | 1–100 Unicode code points             |
| Description                      | 1–500 Unicode code points             |
| Author                           | 1–100 Unicode code points             |
| License                          | 1–64 printable ASCII characters       |
| Permissions per manifest         | 0–64                                  |
| Capabilities per manifest        | 1–64                                  |
| Published Events per manifest    | 0–64                                  |
| Consumed Events per manifest     | 0–64                                  |
| Inputs per manifest              | 0–64                                  |
| Outputs per manifest             | 0–64                                  |
| Failure modes per manifest       | 0–64                                  |
| Skill Version                    | 5–128 ASCII characters                |
| Discovery query                  | Exactly one capability                |
| Registered manifests             | No M7 normative catalog-size limit    |
| Discovery matches                | At most the registered manifest count |

These bounds are normative for M7. Every collection is a dense exact array.
Duplicate declaration values are rejected before a new canonically sorted
immutable array is constructed.

M7 defines no global semantic maximum for the number of registered Skills and no
separate discovery-result cap. Catalog-capacity and resource quotas belong to
future configuration or Infrastructure policy. Per-request and per-manifest
bounds provide M7 semantic validation. Absence of a global quota is not an
implementation blocker and does not authorize an implementation to add a
Skill-semantic quota.

## Acceptance Criteria

M7 may be accepted only when review confirms:

1. ENGINE-0008 is approved and Active before implementation begins.
2. Skill Engine remains the single semantic owner of Skill catalog behavior.
3. Core custody does not transfer Skill behavior to Core.
4. Only prepared manifest validation, registration, lookup, and exact discovery
   are implemented.
5. The exact manifest includes required Event, input, output, and failure-mode
   declarations as non-executable metadata only.
6. Valid manifests are defensively reconstructed and deeply immutable.
7. Duplicate Skill Identifiers fail atomically for every identical or changed
   second manifest; registration is never idempotent.
8. Skill Identifier alone is the uniqueness key and only one version may exist
   per identifier.
9. Registered Skill is exactly the admitted immutable Skill Manifest and carries
   no readiness or runtime metadata.
10. Register, Get, and Discover use their exact request shapes and execute
    synchronously only while Running.
11. A new Engine instance has an empty isolated process-local catalog.
12. Exact lookup is deterministic and missing lookup fails explicitly.
13. Exact discovery returns all matches once in Skill Identifier order.
14. Empty discovery is a successful immutable result.
15. Registration order, locale, clock, randomness, and environment do not affect
    output.
16. Permission identifiers remain declarations only.
17. No selection, authorization, Context consumption, invocation, execution, or
    result normalization occurs.
18. No Planning-to-Skill handoff is invented.
19. Hostile and stateful inputs are read once per boundary and produce exact
    Skill-domain failures without native leakage.
20. Validation follows the normative precedence and stops at first failure.
21. Caller inputs remain unchanged and unfrozen on success and failure.
22. Diagnostics contain counts and controlled categories only.
23. Skill Engine production code depends only on Core and no external package.
24. M0–M6 architecture and semantics remain unchanged.
25. All repository quality gates pass without external services.

## Normative Testing Requirements

Future implementation MUST test:

- every public Core factory with its exact valid shape and with null, undefined,
  every primitive, function, array, array-like object, malformed prototype,
  missing field, explicit `undefined`, unexpected own string field, enumerable
  symbol, inherited substitute, coercible value, throwing getter, hostile
  descriptor, hostile `ownKeys`, hostile Proxy, and stateful getter;
- every identifier, free-text, version, and collection lower bound, upper bound,
  one-below, and one-above case;
- ASCII, BMP, non-BMP, mixed-code-point, empty, whitespace-only, Unicode control,
  printable-License, non-printable-License, no-trimming, no-normalization, and
  exact-preservation cases;
- complete valid Semantic Versions with and without prerelease and build
  metadata, invalid leading zeroes, invalid separators, non-ASCII values, and
  one-above total length;
- dense, sparse, decorated, array-like, stateful-index, throwing-index, and
  hostile Proxy arrays for every declaration collection;
- duplicate and unsorted permissions, capabilities, published Events, consumed
  Events, inputs, outputs, and failure modes;
- duplicate rejection before canonical sorting and locale-independent canonical
  output for every semantically unordered collection;
- deep freezing, caller mutation resistance, caller non-mutation, alias
  isolation, and proof that caller arrays are neither sorted nor frozen;
- successful registration for every valid manifest variant and atomic failure
  for every invalid variant;
- duplicate registration for an identical manifest, changed version, changed
  capability, changed permission, changed metadata, and every other changed
  declaration, all producing exactly `DuplicateSkillIdentifierError`;
- hostile Register envelope, hostile manifest property, hostile nested object,
  and hostile nested collection with exact failure mapping;
- exact Get success, not-found failure, malformed identifier, hostile envelope,
  precedence, non-mutation, and repeated deterministic results;
- Discover with zero, one, and many exact matches, non-matches, exact capability
  equality, Skill-Identifier ordering, insertion-order independence, malformed
  capability, hostile envelope, no permission filtering, non-mutation, and
  repeated deterministic results;
- a new empty Engine instance, Running success, Stopping rejection, Stopped
  rejection, lifecycle failure before request inspection, and isolation between
  separate Engine instances;
- one-read behavior for every request property, manifest property, nested
  declaration property, and accepted array index;
- Register precedence with a pre-existing corrupted catalog and a hostile
  Register request whose Proxy, `ownKeys`, descriptors, or getters would throw if
  inspected, asserting exactly `InvalidSkillStateError` and proving the request
  was untouched;
- Get precedence with a pre-existing corrupted catalog and a hostile Get request,
  asserting exactly `InvalidSkillStateError` and proving the request was not
  inspected;
- Discover precedence with a pre-existing corrupted catalog and a hostile
  Discover request, asserting exactly `InvalidSkillStateError` and proving the
  request was not inspected;
- Step 1 winning over Step 2 for all three Contracts, and final constructed-state
  failures occurring only after lifecycle, pre-existing catalog state, envelope,
  input validation, and operation-specific evaluation all succeed;
- every closed failure class, every validation-precedence boundary, hostile
  later boundaries remaining untouched, and constructed-state failure
  separately from pre-existing-state and caller-input failure;
- synchronous return or throw with no Promise, callback, stream, Event, or
  external wait;
- absence of Identity, Context, Memory, Knowledge, Reasoning, Planning, Brain,
  Security, Provider, Adapter, Skill implementation, filesystem, database,
  network, Event, and LLM interactions;
- privacy-safe diagnostics at debug, info, warn, and error levels;
- production dependency graph and isolated exact-violation architecture
  fixtures proving Skill Engine → Core only, Core-outward prohibition,
  Skill-to-Bootstrap prohibition, Skill-to-other-Engine prohibition,
  Skill-to-external-runtime-dependency prohibition, and cycle prohibition;
- all accepted M0–M6 tests and architecture rules without weakening them.

Tests MUST require no network, filesystem discovery, package installation,
database, persistent storage, external service, Event broker, LLM, clock,
randomness, executable Skill package, or authorization service.

## Explicitly Deferred

M7 explicitly defers:

- Skill file, directory, classpath, module, package, or network discovery;
- YAML or other manifest parsing and schema serialization;
- Skill installation, update, removal, enablement, disablement, and hot reload;
- catalog persistence, restoration, synchronization, quotas, and eviction;
- Skill initialization and shutdown;
- Skill implementation loading or sandboxing;
- permission checking, authorization decisions, confirmation, and Security
  policy artifacts;
- selection or ranking among matching Skills;
- user, tenant, device, session, locale, preference, cost, health, or Context-
  sensitive discovery;
- Candidate Plan binding and executable Planning steps;
- Skill invocation, invocation arguments, workflow execution, cancellation,
  timeout, retry, compensation, rollback, progress, and idempotency;
- input binding, output production, execution-failure handling, and Skill result
  normalization;
- Context consumption during execution;
- Memory, Knowledge, Identity, Reasoning, or Planning calls;
- Providers, Adapters, external ecosystems, and integrations;
- Brain implementation and cognitive orchestration;
- final cognitive-result assembly, delivery, presentation, and voice rendering;
- Event publication, consumption, subscription, handling, schemas beyond the
  manifest identifier declarations, brokers, queues, and distributed execution;
- audit persistence, metrics backends, and production health infrastructure.

## Risks of Implementing This Milestone

- “Capability” can be confused among the platform Skill capability type, a Skill
  package, and an operation exposed by a Skill. M7 uses distinct terms but does
  not change Foundation terminology.
- A catalog may be mistaken for installation or executable readiness.
- Declared permissions may be mistaken for authorization.
- Discovery may be expanded into policy-owned selection.
- Future execution requirements may require backward-compatible manifest
  extension.
- An unbounded process-local catalog may require a future configuration or
  Infrastructure resource quota for a long-lived runtime; that operational
  policy is intentionally outside M7 semantics.
- Premature execution would bypass the absent Security, Planning handoff, and
  Skill invocation Contracts.

## Open Questions and Approval Gates

M7 has no implementation-critical open question concerning runtime bounds,
catalog capacity, schema authority, version uniqueness, duplicate behavior,
Contract synchronicity, Registered Skill representation, or catalog lifecycle.

The following questions are genuinely outside M7 and MUST be resolved by a future
approved specification or ADR before execution work:

1. How does Planning represent an executable Skill-bound step?
2. Who selects among multiple capable Skills, and under which policy Contract?
3. What Security-owned authorization decision artifact must the invocation
   boundary enforce?
4. What Context reference or projection is required for Skill execution?
5. What is the Skill invocation and normalized result Contract?
6. What sandbox, cancellation, timeout, and failure-isolation guarantees apply?

No implementation may treat this specification's deferred questions as implied
answers.

## Alternative Candidate Milestones

### Brain Engine

Brain orchestration is authoritative and necessary, but ENGINE-0001 already
reserves the Brain Engine specification identity. Creating ENGINE-0008 for Brain
would duplicate an existing Engine identity. More importantly, full cognitive
orchestration would need approved Skill execution and final-result Contracts
that do not yet exist.

### Security Engine

Security owns authorization semantics, but M7 catalog operations neither
authorize nor execute protected actions. Implementing Security first would
require choosing a broader policy model not demanded by the smallest post-M6
slice.

### Automation Engine

Automation depends on scheduled, conditional, or Event-triggered execution.
Those flows require execution, Events, and scheduling capabilities explicitly
deferred by accepted M6.

### Voice Engine

Voice is authoritative but does not follow the accepted cognitive sequence from
Reasoning through Planning to capability use. It also introduces Provider
abstraction earlier than this process-local catalog slice requires.

### Richer Planning

Skill binding and multi-step execution planning are plausible future Planning
evolution, but accepted M6 explicitly defers them. Changing Planning semantics
would require a reviewed ENGINE-0007 revision, not a new ENGINE-0008 capability.

## References

- [Documentation Authority](../../../docs/DOCUMENT-AUTHORITY.md)
- [Architecture](../../../docs/architecture.md)
- [Principles](../../../docs/principles.md)
- [ADR-0001 — Core Ownership and Dependency Direction](../../../docs/adr/ADR-0001-Core-Ownership-and-Dependency-Direction.md)
- [ADR-0002 — Capability-Oriented Architecture](../../../docs/adr/ADR-0002-Capability-Oriented-Architecture.md)
- [ADR-0003 — Engine Communication Model](../../../docs/adr/ADR-0003-Engine-Communication-Model.md)
- [ADR-0004 — Separation of Skills, Providers and Adapters](../../../docs/adr/ADR-0004-Separation-of-Skills-Providers-and-Adapters.md)
- [OES-0002 — Engine Design](../../../docs/engineering/OES-0002-Engine-Design.md)
- [OES-0003 — Skill Design](../../../docs/engineering/OES-0003-Skill-Design.md)
- [OES-0004 — Contracts](../../../docs/engineering/OES-0004-Contracts.md)
- [OES-0005 — Events](../../../docs/engineering/OES-0005-Events.md)
- [OES-0008 — Documentation Standards](../../../docs/engineering/OES-0008-Documentation-Standards.md)
- [OES-0009 — Security Standards](../../../docs/engineering/OES-0009-Security-Standards.md)
- [OES-0010 — Versioning Standards](../../../docs/engineering/OES-0010-Versioning-Standards.md)
- [ARCH-0001 — Core Architecture](../../architecture/ARCH-0001-Core-Architecture.md)
- [CONCEPT-0003 — Context Model](../../concepts/CONCEPT-0003-Context-Model.md)
- [ENGINE-0001 — Brain Engine](../ENGINE-0001-Brain-Engine.md)
- [ENGINE-0002 — Identity Engine](../identity/ENGINE-0002-Identity-Engine.md)
- [ENGINE-0003 — Context Engine](../context/ENGINE-0003-Context-Engine.md)
- [ENGINE-0004 — Memory Engine](../memory/ENGINE-0004-Memory-Engine.md)
- [ENGINE-0005 — Knowledge Engine](../knowledge/ENGINE-0005-Knowledge-Engine.md)
- [ENGINE-0006 — Reasoning Engine](../reasoning/ENGINE-0006-Reasoning-Engine.md)
- [ENGINE-0007 — Planning Engine](../planning/ENGINE-0007-Planning-Engine.md)
- [FLOW-0001 — Voice Interaction](../../flows/conversation/FLOW-0001-Voice-Interaction.md)

## Engineering Motto

> Catalog what a Skill declares before deciding whether or how it may run.
