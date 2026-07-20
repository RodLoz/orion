# IMPLEMENTATION-M1 — Identity Engine Vertical Slice

## Objective

Implement the first real O.R.I.O.N. capability as a complete, executable vertical slice while preserving `foundation-v1.0` and the accepted M0 architectural skeleton.

## Governing Specification

M1 is governed by `specifications/engines/identity/ENGINE-0002-Identity-Engine.md`, version 1.0.0, Active.

## Implemented Scope

- Core-custodied Identity domain types and Contracts;
- a framework-free Identity Engine;
- a narrow, technology-neutral Identity Source port;
- a deterministic in-memory source for bootstrap demonstration and tests;
- explicit bootstrap composition;
- Anonymous and Authenticated resolution;
- four specification-defined resolution failure categories;
- privacy-safe executable diagnostics;
- automated unit, Contract, smoke, privacy, and architecture tests.

## Identity Domain Model

Core defines a validated opaque Identity Identifier, the closed Anonymous/Authenticated Identity State model, immutable Current Identity results, and a validated opaque Identity Resolution Reference. No type represents authorization, credentials, provider technology, sessions, or profile data.

## Contracts

Core custodies `ResolveCurrentIdentity` and `IdentitySource`. Identity Engine owns resolution semantics and implements the former. A bootstrap-selected technical source implements the latter without acquiring Identity semantics.

## Engine Implementation

`services/identity` contains the framework-free Identity Engine. It validates supplied references, consults only the Identity Source abstraction, validates candidate identifiers, constructs immutable results, and normalizes source failures. Construction verifies its required source Contract, and explicit deterministic lifecycle transitions prepare it for resolution and prevent resolution before Running or after Stopped.

## In-Memory Identity Source

Bootstrap contains a deliberately small process-local source backed by fixed demonstration records. It distinguishes known, unknown, and unavailable outcomes. It is neither persistence nor a production Provider, repository, or authentication mechanism.

## Bootstrap Composition

The explicit composition root creates the in-memory source and injects it into the Identity Engine. The capability registry records the operational Identity capability as metadata only and remains unsuitable as a service locator.

## Diagnostic Demonstration

The mandatory diagnostic resolves one Anonymous and one known Authenticated Current Identity. Output exposes only initialization and success booleans; raw resolution references, Identity Identifiers, source payloads, and personal information are excluded. Mandatory output remains independent of ordinary log filtering.

## Failure Semantics

- invalid input is rejected before source resolution;
- valid but unknown evidence produces Unresolved Identity;
- invalid candidate data produces Invalid Identity State;
- unavailable or unexpected source failures produce Identity Source Unavailable;
- none of these failures becomes Anonymous.

## Privacy and Observability

M1 diagnostics report only state-category success and capability initialization. Failure messages do not echo Identity Identifiers, references, source payloads, or implementation details. No credential, secret, or token exists in M1.

## Architectural Enforcement

dependency-cruiser verifies that Core cannot depend outward and that Identity Engine cannot depend on Bootstrap, Infrastructure, clients, shared implementation packages, or external npm packages. Isolated negative fixtures prove both new Identity rules are active; fixtures are excluded from the valid production graph.

## Tests

Tests cover Identity value validation and immutability, both Contracts, every resolution branch, source determinism and unavailability, composition, capability registration, diagnostic behavior at all supported log levels, output privacy, and prohibited dependencies.

## Validation Commands

Prerequisites remain Node.js 24 and pnpm 11.15.0. No external service or secret is required.

```text
pnpm install --frozen-lockfile
pnpm build
pnpm typecheck
pnpm test
pnpm lint
pnpm format:check
pnpm architecture
pnpm diagnostic
pnpm validate
```

## Acceptance Criteria

- ENGINE-0002 is Active;
- Anonymous and deterministic known Authenticated resolution succeed;
- invalid, unknown, malformed-source, and unavailable-source cases fail explicitly;
- Core and Engine boundaries are mechanically enforced;
- Security and Context ownership remain unchanged;
- diagnostics are mandatory, structured, deterministic, and privacy-safe;
- all M0 and M1 quality gates pass without external services.

## Explicitly Deferred

OAuth, OIDC, JWT, authentication providers, credentials, passwords, persistent accounts, databases, ORM, HTTP/API, Gateway transport, roles, permissions, authorization, Security Engine, Identity Events, external integrations, production Identity Providers, sessions, organizations, and tenants remain deferred.

## Known Limitations

- the in-memory source exists only for deterministic demonstration and tests;
- M1 resolves only the current actor and provides no account lifecycle or profile management;
- no Identity Event is published;
- no production source selection, transport, persistence, or Security behavior exists.

## Next Milestone Recommendation

Review and accept M1 before selecting another capability. The next milestone should reuse the proven Core Contract → Engine → technical port implementation → explicit composition pattern without expanding Identity scope or selecting deferred infrastructure.
