# IMPLEMENTATION-M2 — Context Engine Vertical Slice

## Objective

Implement the first operational Context capability slice while preserving `foundation-v1.0`, the accepted M0 skeleton, and the accepted M1 Identity boundary.

## Governing Specification

M2 is governed by `specifications/engines/context/ENGINE-0003-Context-Engine.md`, version 1.0.0, Active.

## Implemented Scope

- Core-custodied Context domain types, Contracts, construction-value port, and failures;
- framework-free Context Engine with process-local lineage state;
- one Identity Context Fragment per revision;
- first-revision activation and successor evolution;
- deterministic bootstrap construction values;
- privacy-safe executable diagnostics;
- unit, Contract, lifecycle, immutability, integration, smoke, and architecture tests.

## Context Domain Model

Core defines opaque Lineage and Revision Identities, positive consecutive Revision Numbers, the canonical lifecycle state vocabulary, Context Revisions, Context Fragments, immutable Identity projections, and creation metadata. Context behavior remains in Context Engine.

## Contracts

Core custodies `ComposeContextRevision` and `GetActiveContextRevision`. The Compose Contract uses an explicit new-lineage or existing-lineage target. The Get Contract returns only the current Active revision. A narrow construction-values port supplies deterministic candidate identifiers and creation timestamps without transferring Context semantics.

## Context Engine

`services/context` owns lineage creation, revision ordering, parentage, lifecycle progression, composition, validation, activation, active retrieval, idempotence for unchanged projections, and successor replacement.

## Identity Integration

Bootstrap resolves Identity through `ResolveCurrentIdentity` before calling Context. Context receives only an immutable Current Identity Contract value, creates a defensive projection, and never accesses the Identity Engine implementation or in-memory Identity Source.

## Lifecycle

Candidate revisions progress through Collecting → Composing → Validating → Active. Successful successor activation advances the prior Active revision to Expired. Archived remains deferred, and invalid transitions fail explicitly.

## Lineage and Revision Evolution

Revision 1 starts one stable lineage. A meaningful Identity change creates Revision 2 with the same Lineage Identity, a new Revision Identity, consecutive ordering, and Revision 1 as parent. Unchanged Identity returns the existing Active revision.

## Immutability

Revision objects, creation metadata, fragment collections, fragments, and Identity projections are frozen. Engine-private lifecycle state is the only controlled mutable element and permits only the approved transition from Active to Expired after activation.

## Bootstrap Composition

Bootstrap explicitly creates the Identity source and Engine, resolves Current Identity, creates deterministic Context construction values, and composes Context Engine. The capability registry stores metadata only.

## Diagnostic Demonstration

The mandatory diagnostic activates Anonymous Revision 1, retrieves it, activates Authenticated Revision 2 in the same lineage, verifies deterministic ordering, and verifies Revision 1 expiration. Output contains only approved booleans, lifecycle state, revision evolution, and Identity state categories.

## Failure Semantics

M2 distinguishes invalid input, unknown lineage, invalid lifecycle transition, missing or malformed Identity projection, Context validation failure, and absence of Active Context. Upstream Identity failures remain Identity failures and prevent Context invocation or activation.

## Privacy and Observability

Diagnostics never expose Lineage Identity, Revision Identity, Identity Identifier, Identity Resolution Reference, personal information, credential, token, or raw source payload.

## Architectural Enforcement

dependency-cruiser prevents Context Engine from depending on Bootstrap, Identity Engine implementation, Infrastructure, clients, shared implementation packages, or external npm packages. Negative fixtures prove every new rule by name while the valid production graph remains clean.

## Tests

Tests cover Context value validation, lifecycle vocabulary, Contracts, first and successor revisions, Identity projections and failures, ordering, parentage, expiration, immutability, runtime adversarial input, diagnostics, and dependency rules.

## Validation Commands

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

- ENGINE-0003 is Active;
- one stable lineage evolves through unique consecutive revisions;
- lifecycle, Active retrieval, expiration, and immutability semantics pass deterministic tests;
- Identity enters only through its accepted Contract boundary;
- privacy-safe mandatory diagnostics demonstrate M2;
- architecture and all M0–M2 quality gates pass without external services.

## Explicitly Deferred

Memory, Knowledge, Reasoning, Planning, Skills, Security implementation, Context persistence, Snapshots, Exact Replay, archival storage, Events, brokers, databases, ORM, HTTP/API, Gateway, external integrations, distributed Context, and generic source/plugin frameworks remain deferred.

## Known Limitations

- lineage state is process-local and intentionally non-persistent;
- Identity is the only Context source;
- M2 exposes no manual expiration operation, archival behavior, Snapshot, reconstruction, or replay;
- identifier and creation-time values are deterministic demonstration mechanisms, not a distributed allocation design.

## Next Milestone Recommendation

Formally review and accept M2 before specifying another capability. A later milestone should reuse the Contract and revision-consumption pattern without expanding Context sources until their owning capability specifications are approved.
