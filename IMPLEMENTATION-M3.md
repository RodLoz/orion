# IMPLEMENTATION-M3 — Memory Engine Vertical Slice

## Objective

Implement the smallest complete operational Memory capability while preserving `foundation-v1.0` and the accepted M0–M2 boundaries.

## Governing Specification

M3 is governed by `specifications/engines/memory/ENGINE-0004-Memory-Engine.md`, version 1.0.0, Active.

## Implemented Scope

- Core-custodied Memory domain values, Contracts, Store abstraction, construction-value port, and failures;
- framework-free Memory Engine owning Episodic retention, retrieval, explainability, discovery, last-used, and forgetting semantics;
- deterministic bootstrap-owned in-memory Memory Store and construction values;
- privacy-safe diagnostics, architecture enforcement, and deterministic tests.

## Memory Domain Model

Core defines opaque Memory Identity, bounded Content and Retention Reason, Episodic Kind, immutable Retention Intent, immutable Provenance, immutable Stored Memory Record, privacy-minimal Memory Reference, closed Retrieval Purpose, and immutable Retrieval Receipt.

## Episodic Memory

M3 admits only explicitly proposed accounts of experiences as Episodic Memory. It does not implement Preference or Assertion Memory, Knowledge acceptance, arbitrary document storage, raw interaction history, or Context persistence.

## Retention Intent

Retain Memory requires the exact `retain` intent, Episodic classification, bounded Content, bounded Retention Reason, and valid Provenance. Nothing is retained automatically.

## Provenance

Provenance preserves Source Type, opaque Originating Capability, Observed At, Occurrence Evidence, and an optional structurally validated opaque Source Reference. Retained At is controlled separately. Source Reference receives no heuristic semantic inspection and is never emitted in ordinary diagnostics.

## Contracts

Core custodies Retain Memory, Get Memory, List Retained Memory References, Forget Memory, Memory Store, construction-value, and retrieval-use inspection definitions. Contracts expose no concrete Store technology.

## Memory Engine

`services/memory` owns admissibility, explicit retention, identity allocation orchestration, immutable record construction, Store-result validation, Engine-confirmed retained availability, retrieval meaning, Retrieval Receipts, last-used derivation, discovery bounds, forgetting, and domain-safe failure normalization.

## In-Memory Memory Store

Bootstrap provides a deterministic mechanical Store implementing put, get, bounded list, and delete results. It makes no classification, retention, retrieval-purpose, Knowledge, or last-used decisions and supports deterministic unavailable and malformed-result test modes.

## Retrieval Explainability

Every successful Get requires one closed Retrieval Purpose and returns one immutable Receipt containing only a safe Memory Reference, controlled retrieval timestamp, and purpose. Failed retrieval produces no Receipt.

## Last-Used Semantics

Memory Engine keeps only the latest process-local successful Retrieval Receipt per retained Memory, separately from immutable Memory Records. Its timestamp is the conceptual last-used time. A later successful Get replaces it; listing and failed retrieval do not update it; successful forgetting removes it.

## Forget Memory Semantics

Explicit Forget removes retained availability. Later Get and List operations do not expose the Memory, and repeated Forget returns Memory Not Found. M3 defines no physical deletion technology, tombstone, or unauthorized lifecycle transition.

## Bootstrap Composition

Bootstrap explicitly composes deterministic Memory construction values, `InMemoryMemoryStore`, and `MemoryEngine`. No DI framework or service-locator behavior is introduced, and Context remains uninvolved.

## Diagnostic Demonstration

The mandatory diagnostic composes Memory, explicitly retains one controlled non-personal Episodic fixture, retrieves it for Diagnostic purpose, verifies its Receipt and last-used value, lists one safe reference, forgets it, and verifies an empty retained view.

## Failure Semantics

M3 distinguishes Invalid Memory Input, Invalid Memory Identity, Invalid Retention Intent, Duplicate Memory Identity, Memory Not Found, Memory Store Unavailable, and Invalid Memory State. Unexpected Store throws are normalized without leaking implementation details or payloads.

## Runtime Boundary Safety

All public requests and Store outputs are treated as unknown runtime values. Exact shapes, primitives, closed discriminants, identifiers, Unicode code-point bounds, timestamps, Provenance, references, records, confirmations, and list limits are validated without coercion or external validation libraries.

## Privacy and Observability

Diagnostics expose only capability booleans, counts, and approved categories. They omit raw Memory Identity, Content, Retention Reason, Provenance, Source Reference, personal data, credentials, tokens, and source payloads at every supported log level.

## Architectural Enforcement

dependency-cruiser keeps Core independent and prevents Memory Engine from importing Bootstrap, Infrastructure, the concrete Store, clients, shared implementation packages, or external npm packages. Negative fixtures verify each M3 rule while Bootstrap remains the composition root.

## Tests

Tests cover Core bounds and immutability, explicit retention, Provenance, identity collisions, retrieval explainability, last-used behavior, bounded discovery, forgetting, Store mechanics, unavailable and malformed Store behavior, adversarial runtime values, Unicode code points, diagnostics, privacy, smoke composition, and architecture prohibitions.

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

- ENGINE-0004 is Active;
- M3 retains only explicit Episodic Memory through Memory Engine governance;
- all approved Unicode bounds and list defaults are exact;
- Retrieval Purpose, immutable Receipt, and latest-successful last-used semantics are deterministic;
- listing remains reference-only discovery and forgetting removes retained availability;
- Store mechanics remain behind Core Contracts;
- privacy-safe diagnostics and architecture enforcement pass without external services.

## Explicitly Deferred

Production databases, vectors, embeddings, semantic search, ranking, decay, consolidation, automatic retention, LLM extraction, Knowledge promotion, Context integration, Events, brokers, external Providers, distributed Memory, production audit infrastructure, and heuristic secret detection remain deferred.

## Known Limitations

- Memory and retrieval-use state is process-local and intentionally non-persistent;
- only bounded text Episodic Memory is supported;
- identity and timestamps use controlled deterministic construction values;
- Source Reference validation is structural and does not certify semantic sensitivity;
- M3 exposes no update, archive, export, search, ranking, or production authorization behavior.

## Next Milestone Recommendation

Formally review and accept M3 before specifying another capability. A later milestone should extend Memory only through an approved use case and must preserve intentional retention, provenance, privacy, user control, Core Contract custody, and Memory Engine semantic ownership.
