# OES-0004 — Contracts

| Field | Value |
|--------|--------|
| **Status** | Active |
| **Version** | 2.1.0 |
| **Owner** | Project Maintainers |
| **Created** | 2026-07-09 |
| **Updated** | 2026-08-10 |
| **Applies To** | All Contracts |

---

# Purpose

This standard defines how components communicate inside O.R.I.O.N.

Contracts provide stable boundaries between capabilities.

Every Engine, Skill, Provider, and Adapter communicates through Contracts.

Implementations may change.

Contracts should remain stable.

---

# Scope

This standard applies to:

- Engine Contracts
- Provider Contracts
- Adapter Contracts
- Repository Contracts
- Event Contracts

---

# Definition

A Contract is a stable agreement governing a shared semantic boundary among architectural participants.

A canonical architectural Contract specification formalizes a shared semantic boundary whose responsibilities have already been accepted by applicable higher architectural authority. It defines the shared language and obligations needed to preserve that boundary across consumers and implementations.

A canonical architectural Contract specification does not independently originate architectural ownership, authority, or capability responsibility.

Canonical architectural Contract specifications are distinct from:

- TypeScript interfaces and types;
- executable or runtime Contract surfaces;
- Engine Specifications;
- Concept Specifications;
- Architecture Decision Records;
- APIs and API specifications;
- schemas;
- transport definitions;
- implementation interfaces.

Those artifacts MAY represent, implement, specialize, test, or constrain an accepted Contract boundary according to their own authority and purpose, but use of the word Contract does not make them canonical architectural Contract specifications.

Canonical directory, filename, numbering, and identifier-uniqueness rules are governed jointly with repository-structure and documentation standards and are not established by this version of OES-0004.

A Contract defines:

- Purpose
- Inputs
- Outputs
- Expected behavior
- Failure behavior

A Contract never defines implementation details.

---

# Why Contracts Exist

Contracts provide:

- Decoupling
- Replaceability
- Testability
- Maintainability
- Predictability

Without Contracts, architectural integrity cannot be preserved.

---

# Architectural Rule

Components communicate through Contracts.

Never through concrete implementations.

Correct

Brain Engine

↓

Reasoning Contract

↓

Reasoning Engine

Incorrect

Brain Engine

↓

Reasoning Engine implementation

---

# Ownership

Contract governance MUST distinguish three responsibilities:

- **Contract custody**: the Core is the canonical custodian of shared architectural Contract definitions, including shared schemas, identifiers, interfaces, event envelopes, cross-capability definitions, and their compatibility and versioning rules.
- **Domain semantic ownership**: exactly one capability Engine owns the behavior and domain meaning expressed through a capability Contract.
- **Implementation responsibility**: an implementation layer implements or translates the Contract without changing its semantics.

Core custody MUST NOT imply ownership of capability behavior. Providers and Adapters MUST NOT become semantic owners merely because they implement or translate a Contract.

A Contract MAY formalize only responsibilities already established by applicable architectural authority. It MUST NOT create, transfer, merge, or reassign:

- capability ownership;
- domain semantic ownership;
- source authority or authority-verification ownership;
- Security authorization ownership;
- protected-boundary enforcement ownership;
- Context incorporation, Source Currentness, or Contextual Currentness ownership;
- Brain orchestration or final cognitive result ownership;
- Bootstrap composition ownership;
- persistence ownership;
- implementation ownership.

Core custody of shared Contract language remains distinct from semantic ownership and runtime authority. Provider, Adapter, infrastructure, storage, transport, or deployment placement MUST NOT determine semantic ownership or architectural authority.

Examples

The Voice Engine owns Voice behavior; Core custodies shared Voice Contracts; a Provider may implement a provider-facing Contract.

The Memory Engine owns Memory behavior; Core custodies shared Memory Contracts; an implementation layer may implement persistence without owning Memory semantics.

The Identity Engine owns Identity behavior; Core custodies shared Identity Contracts; an Adapter or Provider may translate or implement them without owning Identity semantics.

---

# Contract Responsibilities

Every canonical architectural Contract specification MUST define, where applicable:

- Purpose;
- governing architectural authority;
- Semantic Owner;
- Core Custodian;
- consumers;
- implementers or Providers;
- inputs;
- outputs;
- guarantees and invariants;
- failure semantics;
- compatibility expectations;
- version;
- conformance and testing expectations;
- references.

Omission of a non-applicable item SHOULD be explicit when its absence could otherwise create ambiguity.

These responsibilities define semantic boundaries and obligations. They MUST NOT prescribe concrete API shapes, programming-language interfaces, schemas, transport protocols, storage technologies, deployment topology, or runtime algorithms unless applicable higher architectural authority explicitly makes such a characteristic architectural.

---

# Contract Metadata

Every canonical architectural Contract specification MUST declare:

- **Status**: the document's lifecycle and authority state under the documentation standards;
- **Version**: the Contract specification's Semantic Version;
- **Semantic Owner**: the capability or domain that owns the meaning and responsibility formalized by the Contract;
- **Core Custodian**: the Core responsibility that maintains the shared Contract language where Core custody applies, without acquiring capability semantics or runtime authority;
- **Created**: the date the Contract specification was first created;
- **Updated**: the date of its latest supported change;
- **Applies To**: the architectural boundary and participants governed by the Contract.

Semantic Owner and Core Custodian MUST remain separately identified. Neither field is interchangeable with implementation responsibility, document maintenance, runtime authority, or authorship.

The generic documentation field `Owner` MUST NOT be used as an ambiguous substitute for Semantic Owner or Core Custodian in a canonical architectural Contract specification.

This standard does not establish a Contract filename, directory, numbering scheme, or historical-revision filename mechanism.

---

# Authority Boundary

A Contract formalizes architecture; it does not resolve unresolved architecture.

A Contract MUST NOT:

- contradict an applicable Active ADR;
- redefine an accepted Concept boundary;
- acquire architectural authority merely because it is executable or implemented;
- use implementation reality to override architectural authority;
- introduce an architectural owner when governing architecture has not selected one.

If a proposed Contract requires a new architectural decision, work on that semantic conclusion MUST pause until the appropriate higher-authority process establishes it. The Contract may then formalize the accepted result.

Contract specifications MAY specialize an accepted boundary only within the authority granted by governing ADRs, Architecture Specifications, Concept Specifications, and Engineering Standards. This Contract-side rule does not define the global document hierarchy.

---

# Contract Characteristics

Good Contracts should be:

Stable

Simple

Explicit

Technology-independent

Versionable

Testable

Replaceable

---

# Dependency Rule

Dependencies always point toward Contracts.

Never toward implementations.

The following is runtime interaction flow, not source-code dependency direction.

Correct runtime interaction

Brain Engine

↓

Reasoning Contract

↓

Reasoning Engine

Both Engine implementations depend on the Core-custodied Reasoning Contract; the Contract does not source-depend on either Engine.

Incorrect

Brain Engine

↓

Reasoning Engine implementation

---

# Versioning

Contracts follow Semantic Versioning.

Breaking changes require a major version.

Backward-compatible changes require a minor version.

Bug fixes require a patch version.

---

# Contract Evolution

Prefer extending Contracts over replacing them.

Breaking changes require:

Documentation updates

ADR

Migration strategy

Breaking architectural Contract changes MUST follow the ADR, migration, documentation, and compatibility process established by OES-0010.

Additive or corrective Contract changes MAY proceed without a new ADR only when they remain within already accepted architecture and the Semantic Owner's established boundary.

An additive or corrective shape that introduces a new architectural responsibility, owner, authority, or semantic decision is not merely additive or corrective for governance purposes. The applicable architectural decision MUST precede the Contract change.

Contract evolution MUST preserve historical traceability. Historical filename and revision-storage mechanisms remain governed by later documentation alignment and are not defined here.

---

# Consumer and Implementer Semantics

A **Consumer** is a capability or component that relies on the shared semantics and guarantees formalized by a Contract.

An **Implementer** realizes behavior governed by the Contract. A Provider or Adapter MAY implement, translate, supply, host, transform, transport, expose, or otherwise support a Contract boundary where the accepted architecture permits.

Consumption does not transfer semantic ownership to a Consumer. Implementation or participation does not transfer semantic ownership, source identity, authority origin, authority-verification ownership, authorization ownership, or Contract acceptance authority to an Implementer, Provider, or Adapter.

Implementers MUST preserve the Contract's accepted semantics and MUST NOT reinterpret the Contract through implementation placement or technology choice.

---

# Engine Contracts

Every Engine should expose public Contracts.

Examples

MemoryRepository

SkillExecutor

VoiceRecognizer

Planner

ContextResolver

IdentityVerifier

---

# Provider Contracts

Providers implement or translate applicable Contract boundaries without acquiring their semantic ownership.

A Provider-specific executable interface does not become a canonical architectural Contract specification merely because a Provider implements it. Canonical Contract semantics remain technology-independent unless higher architectural authority explicitly establishes otherwise.

Examples

SpeechToTextProvider

TextToSpeechProvider

VectorDatabaseProvider

CacheProvider

LLMProvider

---

# Adapter Contracts

Adapters expose external systems through Contracts.

Examples

GitHubRepository

SpotifyPlayer

CalendarProvider

NotificationProvider

---

# Repository Contracts

Repositories abstract persistence.

Business logic never depends on databases.

Correct

MemoryRepository

↓

PostgreSQL Provider

Incorrect

Memory Engine

↓

SQL Query

---

# Failure Handling

Contracts must define expected failures.

A Contract MAY name and formalize failures owned by the governed semantic boundary.

A Contract MUST NOT reclassify a failure owned by another architectural responsibility. Failure propagation, representation, transport, observation, storage, delivery, or consumption MUST preserve the originating failure's semantic identity and ownership.

Contract failure semantics MUST remain consistent with the accepted failure-ownership architecture. Retry, recovery, timeout, compensation, rollback, and other operational handling mechanisms are outside this standard unless separately authorized.

---

# Testing

Every Contract should have:

Contract Tests

Compatibility Tests

Behavior Validation

Documentation Examples

---

# Documentation

Every Contract should include:

Purpose

Owner

Inputs

Outputs

Failure cases

Examples

Version

Canonical architectural Contract documentation MUST use the Contract-specific metadata and required content defined by this standard. Executable Core Contract surfaces are implementation and conformance surfaces of shared language; they do not replace architectural Contract governance or its documentation.

Canonical Contract semantics MUST remain independent of programming language, TypeScript representation, class or interface names, API framework, transport, persistence technology, deployment topology, and Provider or Adapter selection unless governing architecture explicitly makes a characteristic architectural.

---

# Anti-Patterns

Avoid:

Leaking implementation details

Technology-specific Contracts

Business logic inside Contracts

Circular dependencies

Breaking compatibility without version changes

Hidden behaviors

Using executable implementation as architectural authority

Treating Core custody as capability semantic ownership

Using a Contract to decide unresolved architecture

---

# Definition of Done

A Contract is complete when:

✔ Purpose documented

✔ Inputs defined

✔ Outputs defined

✔ Errors documented

✔ Tests implemented

✔ Version assigned

✔ Semantic Owner and Core Custodian identified separately

✔ Documentation completed

✔ Governing architectural authority referenced

✔ Consumer and implementer obligations documented where applicable

✔ Compatibility expectations documented

✔ No unresolved architectural decision introduced

---

# Change History

| Version | Date       | Description |
| ------- | ---------- | ----------- |
| 2.1.0   | 2026-08-10 | Clarified canonical architectural Contract identity, metadata, content, ownership, authority, compatibility, consumer/implementer, failure, and implementation-neutrality governance. |

---

# Related Standards

- OES-0000 — Engineering Philosophy
- OES-0002 — Engine Design
- OES-0003 — Skill Design
- OES-0005 — Events
- [OES-0008 — Documentation Standards](OES-0008-Documentation-Standards.md)
- [OES-0009 — Security Standards](OES-0009-Security-Standards.md)
- [OES-0010 — Versioning Standards](OES-0010-Versioning-Standards.md)
- [DOCUMENT-AUTHORITY — Documentation Authority](../DOCUMENT-AUTHORITY.md)
- [ARCH-0001 — Core Architecture](../../specifications/architecture/ARCH-0001-Core-Architecture.md)
- [ADR-0012 — Authorization Semantics and Enforcement](../adr/ADR-0012-Authorization-Semantics-Enforcement-and-Authorized-Reference-Applicability.md)
- [ADR-0013 — Failure Ownership and Propagation](../adr/ADR-0013-Failure-Ownership-Propagation-and-Candidate-Context-Revision-Consequences.md)
- [ADR-0014 — Bootstrap Composition and Core Custody](../adr/ADR-0014-Bootstrap-Composition-Responsibility-and-Ownership-and-Authority-Preservation.md)
- [ADR-0017 — Execution-Model Independence](../adr/ADR-0017-Execution-Model-Independence-for-Asynchronous-Event-Driven-and-Distributed-Collaboration.md)

---

# Engineering Motto

> Contracts protect architecture from implementation.
