# IMPLEMENTATION-M2 — Context Engine Vertical Slice

## Objective

Implement the first operational Context capability slice while preserving `foundation-v1.0`, the accepted M0 skeleton, and the accepted M1 Identity boundary.

## Governing Specification

The current Active authorities are `specifications/engines/context/ENGINE-0003-Context-Engine-Revision-3.0.0.md` and `specifications/engines/knowledge/ENGINE-0005-Knowledge-Engine-Revision-1.1.0.md`.

## Implemented Scope

- Core-custodied Context domain types, Contracts, construction-value port, and failures;
- framework-free Context Engine with process-local lineage state;
- an unchanged Identity-only profile and an additive fixed Identity + Knowledge profile;
- first-revision activation and successor evolution;
- deterministic bootstrap construction values;
- privacy-safe executable diagnostics;
- unit, Contract, lifecycle, immutability, integration, smoke, and architecture tests.

## Context Domain Model

Core defines opaque Lineage and Revision Identities, positive consecutive Revision Numbers, the canonical lifecycle state vocabulary, Context Revisions, Context Fragments, immutable Identity and Knowledge projections, and creation metadata. Context behavior remains in Context Engine.

## Contracts

Core custodies the unchanged Identity-only preparation and incorporation Contracts, additive fixed Knowledge-aware preparation and incorporation Contracts, and `GetActiveContextRevision`. The Knowledge-aware Prepare Contract associates existing Identity and Knowledge requests with an explicit target, while its Compose Contract remains the incorporation-only boundary for completed Current Identity and Knowledge Reference candidate material. The Get Contract returns only the current Active revision.

## Context Engine

`services/context` owns lineage creation, revision ordering, parentage, lifecycle progression, composition, validation, activation, active retrieval, idempotence for unchanged projections, and successor replacement.

## Identity Integration

Bootstrap injects `ResolveCurrentIdentity` into Context through the Core-custodied Contract. Context owns preparation and initiates Identity retrieval, receives the immutable Current Identity candidate material, and delegates its incorporation to `ComposeContextRevision`. Context creates a defensive projection and never accesses the Identity Engine implementation or in-memory Identity Source.

## Knowledge Integration

The additive Knowledge-aware profile injects the existing Core-custodied `GetKnowledge` operation into Context. Context forwards the opaque request, receives `RetrievedKnowledge` as candidate material, and incorporates only a defensive immutable projection of its `KnowledgeReference`. Knowledge remains required for this profile, and failures do not fall back to Identity-only preparation.

## Lifecycle

Candidate revisions progress through Collecting → Composing → Validating → Active. Successful successor activation advances the prior Active revision to Expired. Archived remains deferred, and invalid transitions fail explicitly.

## Lineage and Revision Evolution

Revision 1 starts one stable lineage. A meaningful incorporated Identity or Knowledge projection change creates a consecutive successor with the same Lineage Identity and the prior revision as parent. Unchanged semantic projections return the existing Active revision.

## Immutability

Revision objects, creation metadata, fragment collections, fragments, and Identity and Knowledge projections are frozen. Engine-private lifecycle state is the only controlled mutable element and permits only the approved transition from Active to Expired after activation.

## Bootstrap Composition

Bootstrap retains the Identity-only composition and adds a Knowledge-aware composition profile that injects `ResolveCurrentIdentity` and lifecycle-ready `GetKnowledge` collaborators. Bootstrap performs wiring only and does not inspect or incorporate Knowledge.

## Diagnostic Demonstration

The mandatory diagnostic activates Anonymous Revision 1, retrieves it, activates Authenticated Revision 2 in the same lineage, verifies deterministic ordering, and verifies Revision 1 expiration. Output contains only approved booleans, lifecycle state, revision evolution, and Identity state categories.

## Failure Semantics

M2 distinguishes invalid input, unknown lineage, invalid lifecycle transition, missing or malformed source projections, Context validation failure, and absence of Active Context. Identity and Knowledge retrieval failures propagate through their preparation profiles unchanged and prevent candidate incorporation or activation.

## Privacy and Observability

Diagnostics never expose Lineage Identity, Revision Identity, Identity Identifier, Identity Resolution Reference, personal information, credential, token, or raw source payload.

## Architectural Enforcement

dependency-cruiser prevents Context Engine from depending on Bootstrap, Identity Engine implementation, Infrastructure, clients, shared implementation packages, or external npm packages. Negative fixtures prove every new rule by name while the valid production graph remains clean.

## Tests

Tests cover Context value validation, lifecycle vocabulary, Contracts, first and successor revisions, Identity and Knowledge projections and failures, canonical fragment ordering, parentage, expiration, immutability, runtime adversarial input, diagnostics, and dependency rules.

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

Memory specialization, generic multi-source preparation, Context persistence, Snapshots, Exact Replay, archival storage, Events, brokers, databases, ORM, HTTP/API, Gateway, external integrations, distributed Context, and generic source/plugin frameworks remain deferred.

## Known Limitations

- lineage state is process-local and intentionally non-persistent;
- the implemented profiles are fixed as Identity-only and Identity + Knowledge;
- M2 exposes no manual expiration operation, archival behavior, Snapshot, reconstruction, or replay;
- identifier and creation-time values are deterministic demonstration mechanisms, not a distributed allocation design.

## Next Milestone Recommendation

Formally review and accept M2 before specifying another capability. A later milestone should reuse the Contract and revision-consumption pattern without expanding Context sources until their owning capability specifications are approved.
