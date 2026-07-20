# ENGINE-0002 — Identity Engine

| Field          | Value                                                |
| -------------- | ---------------------------------------------------- |
| **Status**     | Active                                               |
| **Version**    | 1.0.0                                                |
| **Owner**      | Project Maintainers                                  |
| **Created**    | 2026-07-19                                           |
| **Updated**    | 2026-07-19                                           |
| **Applies To** | Identity Engine, M1 — Identity Engine Vertical Slice |

---

## Status

This specification is Active and governs M1 implementation according to the documentation authority and status rules.

The key words **MUST**, **MUST NOT**, **SHOULD**, **SHOULD NOT**, and **MAY** describe normative requirements within this specification.

## Purpose

The Identity Engine answers:

> Who is the actor for the current interaction?

It is the single semantic owner of the Identity capability. It resolves the current actor into an explicit anonymous or authenticated identity representation and exposes the minimal identity facts required by other capabilities.

M1 proves the complete implementation pattern for one real capability without selecting an authentication mechanism, transport, persistence technology, or external identity provider.

## Capability Ownership

The Identity Engine owns:

- Identity domain behavior and semantic rules;
- the distinction between anonymous and authenticated Identity state;
- validation of Identity identifiers and resolved Identity representations;
- current Identity resolution semantics;
- the meaning and guarantees of Identity references and projections exposed to other capabilities;
- Identity-domain failure semantics.

The Core is the canonical custodian of shared Identity Contract definitions, identifiers, and domain types. Core custody governs their shared definitions, compatibility, and versioning; it does not transfer Identity behavior to Core.

The Identity Engine implements Identity behavior behind those Contracts. An Identity source implementation supplies authoritative Identity evidence through a Contract but does not own Identity semantics.

## Scope

M1 includes:

- a validated, opaque Identity identifier;
- an explicit anonymous Identity state;
- an explicit authenticated Identity state;
- deterministic resolution of the current Identity;
- a minimal read-only Identity projection suitable for future Context composition and Security policy evaluation;
- a technology-neutral Identity source boundary;
- explicit validation and failure semantics;
- deterministic, framework-free behavior and tests.

## Non-Goals

M1 does not define or implement:

- OAuth, OpenID Connect, JWT, or any authentication protocol;
- credentials, passwords, password hashing, passkeys, tokens, or biometrics;
- credential or account storage;
- databases or repository technology;
- HTTP sessions, cookies, API transport, or Gateway behavior;
- external identity Providers, SDKs, or cloud services;
- authorization rules, roles, permissions, policy decisions, or access enforcement;
- organizations, tenants, groups, memberships, or account linking;
- devices, service identities, Skill identities, or Provider identities;
- persistent guest accounts;
- profile management or personal-data enrichment;
- Identity Events where no meaningful completed domain fact exists.

## Core Concepts

M1 uses only the following Identity concepts.

### Identity Identifier

An **Identity Identifier** is an opaque, stable platform identifier for an authenticated Identity.

An Identity Identifier:

- MUST be non-empty and valid according to the shared Identity Contract;
- MUST NOT encode credentials, authorization, roles, permissions, provider names, or transport details;
- MUST NOT expose assumptions about storage technology or external identity systems;
- MUST NOT be assigned to the anonymous state merely to simulate an account.

Its concrete representation and validation syntax are implementation-level Contract details, provided they remain technology-independent and deterministic.

### Identity State

M1 defines exactly two Identity states:

- **Anonymous** — no authenticated Identity has been established for the current interaction;
- **Authenticated** — authoritative Identity evidence has been resolved to a valid Identity Identifier for the current interaction.

An authenticated state describes established Identity only. It does not imply authorization, permission, trust level, session validity, or approval to perform an action.

### Current Identity

**Current Identity** is the immutable result of resolving the actor for one interaction.

It is a discriminated representation:

- Anonymous Current Identity contains the Anonymous state and no Identity Identifier;
- Authenticated Current Identity contains the Authenticated state and exactly one valid Identity Identifier.

M1 does not introduce a separate Identity Profile. State and identifier are the minimum projection required by future Context and Security consumers. Profile attributes may be added only when a later approved use case establishes their semantics and privacy requirements.

### Identity Resolution Reference

An **Identity Resolution Reference** is an opaque, transient input that allows an authorized Identity source to locate or attest Identity evidence for the current interaction.

It is not an Identity Identifier, credential, token, session, or authorization grant. Its representation MUST remain technology-neutral. Consumers MUST NOT infer Identity semantics from it, persist it as an account identifier, or include it in Context as authoritative Identity data.

## Invariants

The following invariants apply:

1. The Identity Engine is the single semantic owner of Identity behavior.
2. Every successful resolution returns exactly one Current Identity state.
3. Current Identity is either Anonymous or Authenticated, never both.
4. Anonymous Current Identity has no Identity Identifier.
5. Authenticated Current Identity has exactly one valid Identity Identifier.
6. Absence of Identity evidence MAY resolve to Anonymous.
7. Invalid, contradictory, or unresolvable supplied evidence MUST NOT silently resolve to Anonymous.
8. Source unavailability MUST NOT be represented as Anonymous.
9. Identity resolution MUST NOT make an authorization decision.
10. Identity facts exposed to Context or Security are immutable references or projections and do not transfer Identity ownership.
11. Raw Provider, Adapter, Gateway, or authentication-mechanism output MUST NOT become authoritative Identity without crossing the Identity capability boundary.
12. Identity resolution MUST be deterministic for the same request and the same source state.

## Contracts

All M1 cross-boundary interactions occur through Core-custodied Contracts. The Contracts below are conceptual and technology-independent; they do not prescribe TypeScript interfaces, protocols, or serialization.

### Resolve Current Identity Contract

| Property                          | Definition                                                                                                          |
| --------------------------------- | ------------------------------------------------------------------------------------------------------------------- |
| **Version**                       | 1.0.0                                                                                                               |
| **Purpose**                       | Resolve the actor for the current interaction.                                                                      |
| **Domain semantic owner**         | Identity Engine                                                                                                     |
| **Schema custodian**              | Core                                                                                                                |
| **Implementation responsibility** | Identity Engine                                                                                                     |
| **Input**                         | An Identity resolution request containing either no evidence reference or one opaque Identity Resolution Reference. |
| **Output**                        | One immutable Current Identity: Anonymous or Authenticated.                                                         |
| **Failures**                      | Invalid resolution input, unresolved supplied evidence, invalid resolved Identity, Identity source unavailable.     |
| **Guarantees**                    | Successful output satisfies every Current Identity invariant and contains no authorization decision.                |

Resolution behavior:

- a request without an Identity Resolution Reference resolves to Anonymous;
- a request with a valid reference is resolved through the configured Identity source;
- a source match is validated and returned as Authenticated;
- a supplied reference that cannot be resolved produces an explicit unresolved-Identity failure;
- source unavailability produces an explicit source-unavailable failure.

### Identity Source Contract

| Property                          | Definition                                                                                                |
| --------------------------------- | --------------------------------------------------------------------------------------------------------- |
| **Version**                       | 1.0.0                                                                                                     |
| **Purpose**                       | Supply authoritative Identity evidence to the Identity Engine without exposing source technology.         |
| **Domain semantic owner**         | Identity Engine                                                                                           |
| **Schema custodian**              | Core                                                                                                      |
| **Implementation responsibility** | A bootstrap-selected implementation outside Core and outside Identity domain behavior.                    |
| **Input**                         | One validated opaque Identity Resolution Reference.                                                       |
| **Output**                        | A source result representing either one candidate Identity Identifier or no match.                        |
| **Failures**                      | Source unavailable or invalid source response.                                                            |
| **Guarantees**                    | The Contract exposes no provider SDK, credential, token, transport, database, or authorization semantics. |

The Identity source is a narrow port, not a semantic owner. The Identity Engine remains responsible for validating the source result and deciding whether it constitutes a valid authenticated Identity state.

M1 uses a deterministic in-memory implementation only for tests and runtime demonstration. That implementation is not a persistent account store and does not establish a production authentication architecture.

## Anonymous Identity Semantics

O.R.I.O.N. supports Anonymous as a first-class Current Identity state.

Anonymous means that no authenticated Identity has been established for the current interaction. It does not mean:

- authentication failed;
- an Identity source is unavailable;
- supplied evidence was invalid;
- a persistent guest account exists;
- an action is authorized;
- the actor has no Security policy.

Anonymous resolution is valid only when the resolution request contains no Identity evidence requiring evaluation. If evidence is supplied but cannot be resolved or validated, the Engine returns an explicit failure instead of silently downgrading to Anonymous.

Security policy determines whether an anonymous actor may perform any protected action.

## Relationship with Context

Identity Engine owns Identity facts. It MAY expose a read-only projection containing only:

- Identity state;
- Identity Identifier when the state is Authenticated.

Context Engine MAY include that projection in a Context Revision during Collecting or Composing. Context:

- MUST preserve Identity as the authoritative owner;
- MUST NOT mutate, validate, authenticate, or reclassify Identity;
- MUST NOT treat a raw Provider, Adapter, Gateway, or external-system observation as authoritative Identity;
- MUST NOT add late Identity information to an already Active Context Revision;
- MUST create a new Context Revision when changed Identity facts are required for subsequent reasoning.

An Identity projection is contextual input, not ownership transfer and not a durable Identity record.

## Relationship with Security

Identity answers:

> Who is the actor?

Security answers:

> Is the actor allowed to perform this action?

Security Engine owns Security policy semantics, authorization-decision semantics, and Security-domain rules. Identity Engine MUST NOT:

- assign roles or permissions;
- decide whether anonymous execution is allowed;
- authorize an action;
- calculate a Security policy outcome;
- enforce policy on behalf of the Security domain;
- treat authenticated state as proof that an action is permitted.

Security Engine MAY consume immutable Identity facts through Contracts when evaluating policy. This consumption does not transfer Identity ownership to Security. M1 does not implement Security Engine behavior.

## Engine Responsibilities

Identity Engine is responsible for:

- validating Identity resolution requests;
- producing explicit Anonymous Current Identity when no evidence is supplied;
- resolving supplied evidence through the Identity Source Contract;
- validating candidate Identity Identifiers and source responses;
- producing immutable Authenticated Current Identity;
- preserving deterministic Identity-state invariants;
- exposing Current Identity through the Resolve Current Identity Contract;
- exposing privacy-safe diagnostics and health information;
- reporting explicit Identity-domain failures.

Identity Engine is not responsible for any Non-Goal listed above.

### Inputs

- one Resolve Current Identity request;
- zero or one opaque Identity Resolution Reference;
- one configured Identity Source Contract implementation when evidence must be resolved.

### Outputs

- Anonymous Current Identity;
- Authenticated Current Identity containing one Identity Identifier;
- one explicit failure from the defined M1 failure set.

## Published Events

M1 publishes no Identity domain Events.

Current Identity resolution is a query and does not, by itself, establish a meaningful durable domain fact that requires publication. A future Event requires an approved semantic use case and MUST preserve Core schema custody, Identity-domain semantic ownership, and separate runtime publication authority.

## Consumed Events

M1 consumes no Events.

## Dependencies

Identity Engine MAY depend on:

- Core-custodied Identity domain types and Contracts;
- the Identity Source Contract abstraction;
- Core-custodied logging, diagnostic, and failure abstractions where shared by the platform.

Identity Engine MUST NOT depend directly on:

- another Engine implementation;
- Security Engine or Context Engine implementations;
- a Provider, Adapter, database, Infrastructure implementation, or external system;
- an authentication or transport framework;
- a vendor SDK.

Concrete source selection and object composition occur at the bootstrap boundary.

## Internal Components

M1 requires only the following logical responsibilities:

- **Current Identity Resolver** — coordinates resolution without owning source technology;
- **Identity Validator** — enforces Identity Identifier and Current Identity invariants.

These are logical responsibilities, not mandatory classes, services, packages, or deployment units. Implementations SHOULD combine them when separation provides no concrete value.

## Lifecycle

Identity Engine follows the platform Engine lifecycle:

`Initialize → Ready → Running → Stopping → Stopped`

For M1:

- initialization validates that required Contracts are supplied;
- initialization MUST be deterministic;
- the Engine MUST NOT accept resolution while it is not ready to run;
- stopping MUST NOT create or persist Identity state.

The lifecycle does not imply a process boundary or framework.

## State Management

The M1 Identity Engine SHOULD be stateless between resolution calls.

Current Identity is scoped to the resolution result for an interaction. The Engine does not persist accounts, sessions, credentials, guest identities, or profiles.

The in-memory Identity source used by M1 owns only deterministic demonstration data supplied during bootstrap. It is an implementation of the source Contract, not Identity Engine state and not production persistence.

## Configuration

M1 configuration is limited to bootstrap selection and construction of the Identity Source Contract implementation.

Identity Engine MUST NOT contain:

- provider names;
- endpoints;
- credentials or secrets;
- database configuration;
- authentication-protocol configuration;
- environment-variable access in Identity domain behavior.

No configuration framework is required.

## Failure Semantics

M1 defines four conceptual failure categories.

### Invalid Identity Input

The resolution request or Identity Resolution Reference violates its Contract.

The Engine rejects the request before source resolution. It MUST NOT return Anonymous as a substitute.

### Unresolved Identity

A valid Identity Resolution Reference was supplied, but the authoritative source found no matching Identity.

This is an explicit resolution failure. It MUST NOT silently become Anonymous because evidence was presented and evaluated.

### Invalid Identity State

The source or composed result would violate an Identity invariant, including an invalid Identity Identifier or a contradictory Anonymous/Authenticated representation.

The Engine rejects the result and exposes no malformed Identity projection.

### Identity Source Unavailable

The configured source cannot complete resolution.

This is an availability failure, not Anonymous Identity and not authorization denial.

Unexpected implementation failures MUST be normalized at the Engine boundary without exposing secrets, source internals, or technology-specific exceptions.

## Security

M1 MUST:

- treat resolution inputs and source responses as untrusted until validated;
- expose only the minimum Identity facts required by the consumer;
- prevent credentials, secrets, tokens, and provider payloads from entering Identity results;
- preserve Security Engine ownership of authorization semantics;
- avoid logging Identity Resolution References and raw source responses;
- comply with applicable Security-owned policy decisions at protected boundaries without directly coupling to a Security Engine implementation.

## Observability

M1 SHOULD expose:

- Engine lifecycle and health status;
- resolution attempt count;
- successful Anonymous and Authenticated resolution counts;
- failure count by conceptual category;
- resolution latency;
- request or correlation identifier where permitted;
- source availability status without source-technology leakage.

Logs and diagnostics MUST NOT contain:

- credentials, secrets, or authentication tokens;
- Identity Resolution References;
- raw provider or source payloads;
- unnecessary personal information;
- authorization decisions;
- a raw Identity Identifier unless an explicitly approved privacy policy permits it.

Metrics SHOULD use aggregated state and failure categories rather than Identity-specific labels.

## Performance

M1 defines no throughput or latency target.

Resolution MUST be deterministic and correct before optimization. Performance work MUST NOT weaken validation, privacy, Contract boundaries, or source replaceability.

## Testing

The future M1 implementation MUST include deterministic tests for:

- valid and invalid Identity Identifier construction;
- anonymous resolution with no evidence reference;
- authenticated resolution from a matching in-memory source record;
- explicit unresolved-Identity failure for a supplied unknown reference;
- explicit source-unavailable failure;
- invalid source result rejection;
- Anonymous and Authenticated invariants;
- Resolve Current Identity Contract behavior;
- Identity Source Contract behavior;
- privacy-safe structured observability;
- Engine initialization and smoke composition;
- dependency rules preventing Core and Identity Engine outward coupling.

Tests MUST require no network, external service, persistent database, clock-dependent behavior, or nondeterministic identifier generation.

## M1 Implementation Boundary

The future M1 implementation SHOULD include only:

- Core-custodied Identity domain types and Contracts;
- a framework-free Identity Engine implementation;
- explicit bootstrap composition;
- one deterministic in-memory Identity Source Contract implementation for tests and runtime demonstration;
- unit tests;
- Contract tests;
- architecture tests;
- one smoke test resolving Anonymous and Authenticated Current Identity.

The future implementation MUST NOT include:

- OAuth, OpenID Connect, JWT, or authentication libraries;
- databases, repositories, ORM, or persistent accounts;
- HTTP, cookies, sessions, or Gateway transport;
- external Identity Providers or integrations;
- password, credential, token, passkey, or biometric management;
- Security Engine or Context Engine implementation;
- role, permission, organization, tenant, group, device, or profile models;
- Identity Events without a meaningful approved domain fact.

## Acceptance Criteria

M1 is complete only when:

1. Identity Engine is the single semantic owner of Identity behavior.
2. Core custodies shared Identity types and Contracts without owning Identity behavior.
3. Anonymous Current Identity resolves deterministically when no Identity evidence is supplied.
4. Authenticated Current Identity resolves deterministically from a valid in-memory source match.
5. Invalid Identity identifiers and invalid resolution inputs are rejected.
6. Supplied but unknown evidence produces Unresolved Identity rather than Anonymous.
7. Source unavailability produces Identity Source Unavailable rather than Anonymous.
8. Every successful Current Identity satisfies its state invariants.
9. Identity Engine makes no authorization decision and assigns no role or permission.
10. Identity projections consumed by Context remain immutable and Identity-owned.
11. Core remains technology-independent and framework-free.
12. Identity Engine has no direct dependency on another Engine or a concrete outer implementation.
13. Bootstrap composition uses a deterministic in-memory source and no external service.
14. unit, Contract, architecture, and smoke tests are deterministic and pass.
15. logs, diagnostics, and failures expose no credential, token, resolution reference, raw source payload, or unnecessary personal data.
16. the complete repository validation and architectural dependency checks pass.

## Future Evolution

Future approved milestones MAY extend Identity with:

- additional actor kinds required by OES-0009;
- minimal profile projections with explicit privacy semantics;
- device-related Identity collaboration under clarified ownership;
- external authentication mechanism Adapters or Providers;
- persistent Identity sources behind Contracts;
- meaningful Identity domain Events;
- Identity lifecycle and account-management capabilities.

Each addition requires an explicit use case and must preserve Identity semantic ownership, Core Contract custody, Security authorization ownership, Context read-only consumption, and inward dependency direction. M1 creates no commitment to a particular authentication or persistence technology.

## References

- [Documentation Authority](../../../docs/DOCUMENT-AUTHORITY.md)
- [ADR-0001 — Core Ownership and Dependency Direction](../../../docs/adr/ADR-0001-Core-Ownership-and-Dependency-Direction.md)
- [ADR-0002 — Capability-Oriented Architecture](../../../docs/adr/ADR-0002-Capability-Oriented-Architecture.md)
- [ADR-0003 — Engine Communication Model](../../../docs/adr/ADR-0003-Engine-Communication-Model.md)
- [OES-0001 — Repository Structure](../../../docs/engineering/OES-0001-Repository-Structure.md)
- [OES-0002 — Engine Design](../../../docs/engineering/OES-0002-Engine-Design.md)
- [OES-0004 — Contracts](../../../docs/engineering/OES-0004-Contracts.md)
- [OES-0005 — Events](../../../docs/engineering/OES-0005-Events.md)
- [OES-0008 — Documentation Standards](../../../docs/engineering/OES-0008-Documentation-Standards.md)
- [OES-0009 — Security Standards](../../../docs/engineering/OES-0009-Security-Standards.md)
- [ARCH-0001 — Core Architecture](../../architecture/ARCH-0001-Core-Architecture.md)
- [CONCEPT-0003 — Context Model](../../concepts/CONCEPT-0003-Context-Model.md)
- [IMPLEMENTATION-M0 — Executable Architectural Skeleton](../../../IMPLEMENTATION-M0.md)

## Engineering Motto

> Identity establishes who the actor is. Security decides what the actor may do.
