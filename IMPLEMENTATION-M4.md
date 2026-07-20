# IMPLEMENTATION-M4 — Knowledge Engine Vertical Slice

## Objective

Implement the smallest operational Knowledge capability while preserving `foundation-v1.0` and the accepted M0–M3 capability boundaries.

## Governing Specification

M4 is governed by `specifications/engines/knowledge/ENGINE-0005-Knowledge-Engine.md`, version 1.0.0, Active.

## Implemented Scope

- Core-custodied Knowledge values, Contracts, Store abstraction, construction values, references, decisions, and failures;
- framework-free Knowledge Engine owning evaluation, acceptance, rejection, contradiction resolution, supersession, versions, retrieval, and current-reference discovery;
- deterministic bootstrap-owned in-memory Knowledge Store and construction values;
- privacy-safe diagnostics, architecture enforcement, and deterministic tests.

## Knowledge Domain Model

Core defines opaque Knowledge Identity, bounded Candidate Claim, immutable Acceptance Evidence, immutable Provenance, Accepted validation state, safe integer Version, immutable accepted Record, privacy-minimal Reference, and immutable acceptance/rejection Decisions.

## Candidate Claims

M4 uses primitive bounded text through 4096 Unicode code points. Candidate text is not Knowledge before successful Engine acceptance and receives no parsing, normalization, coercion, truncation, provider formatting, or truth inference.

## Acceptance Evidence

Evidence uses the closed `explicit-authority-review` method with an opaque bounded authority identifier, explicit accept/reject decision, and bounded reason. Knowledge Engine validates evidence and owns acceptance semantics without acquiring Security authorization policy.

## Provenance

Provenance preserves closed Candidate Source Type, opaque Originating Capability, exact Observed At timestamp, and optional structurally validated opaque Source Reference. Accepted At and Acceptance Evidence remain distinct. Raw provenance and references are excluded from diagnostics.

## Validation State

Only Accepted is persisted on Knowledge Records. Candidate and Rejected are operation terms; rejected and invalid candidates do not become Knowledge.

## Contracts

Core custodies Evaluate Knowledge Claim, Get Knowledge, List Knowledge References, Knowledge Store put/get, and controlled construction-value definitions. No Contract exposes the concrete Store or implementation metadata.

## Knowledge Engine

`services/knowledge` owns runtime validation, final acceptance/rejection, identity orchestration, Store-result validation, Engine-confirmed availability, current selection, linear versions, explicit contradiction decisions, and privacy-safe failure normalization.

## In-Memory Knowledge Store

Bootstrap provides a deterministic mechanical Store implementing put and get. It makes no truth, acceptance, validation-state, contradiction, current-selection, version, Memory, or Context decision and supports deterministic unavailable and malformed-result test modes.

## Acceptance and Rejection

Valid accept Evidence creates an immutable Version 1 Record only after complete Store confirmation. Valid reject Evidence returns a fixed rejection result without identity allocation, Record construction, or Store mutation. Mechanically written but unconfirmed candidates remain invisible.

## Contradiction Resolution

M4 performs no semantic contradiction detection. A caller-declared contradiction requires an explicit reject-candidate or supersede-existing decision. Incomplete resolution fails without changing accepted Knowledge.

## Supersession and Versioning

Supersession creates a distinct immutable successor whose Version is exactly predecessor Version plus one and records the predecessor identity. Versions are primitive safe integers from 1 through 9,007,199,254,740,991. Maximum-Version supersession fails as Invalid Supersession before identity allocation or Store access.

## Current Knowledge Governance

Knowledge Engine keeps minimal process-local confirmed identity, current selection, acceptance order, and Version metadata. Successful confirmed successors become current; predecessors remain historically retrievable and immutable. Failed successors cannot change current selection.

## Bootstrap Composition

Bootstrap explicitly composes deterministic Knowledge construction values, `InMemoryKnowledgeStore`, and `KnowledgeEngine`. No DI framework or service-locator behavior is introduced, and Memory and Context remain uninvolved.

## Diagnostic Demonstration

The mandatory diagnostic explicitly accepts and retrieves one controlled claim, lists one current safe reference, rejects one declared contradiction, accepts one explicit successor, verifies exact Version advancement, retrieves the historical predecessor, and verifies the successor is current.

## Failure Semantics

M4 distinguishes Invalid Knowledge Input, Invalid Knowledge Identity, Invalid Claim, Invalid Acceptance Evidence, Knowledge Not Found, Duplicate Knowledge Identity, Contradiction Requires Resolution, Invalid Supersession, Knowledge Store Unavailable, and Invalid Knowledge State.

## Runtime Boundary Safety

Public requests, factories, construction values, and Store results are treated as unknown. Exact shapes, primitives, Unicode bounds, timestamps, safe Versions, contradiction fields, hostile objects, nested Records, discriminants, and confirmations are validated without coercion or native exception leakage.

## Privacy and Observability

Diagnostics expose only operational booleans and counts. They omit raw Claims, Knowledge Identities, authority identifiers, reasons, Provenance, Source References, Memory/Context content, personal information, credentials, secrets, and tokens at every supported log level.

## Architectural Enforcement

Dependency rules keep Core independent and prevent Knowledge Engine from importing Bootstrap, Infrastructure, the concrete Store, other Engine implementations, or external npm packages. Isolated negative fixtures verify each M4 prohibition by exact rule set.

## Tests

Tests cover Core bounds and immutability, explicit acceptance/rejection, Provenance, identity collisions, Get/List, declared contradictions, supersession, maximum Version behavior, Store mechanics, failed-confirmation invisibility, hostile runtime values, diagnostics, privacy, smoke composition, and architecture rules.

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
git diff --check
git status --short
```

## Acceptance Criteria

- explicit accept/reject evaluation is operational and deterministic;
- accepted Records are deeply immutable, versioned, provenanced, retrievable, and discoverable through safe current references;
- contradiction resolution and supersession preserve immutable history and confirmed current governance;
- Version overflow, failed Store operations, and malformed confirmations create no partial accepted state;
- Memory, Context, Security, Store, and Knowledge ownership boundaries remain intact;
- privacy-safe diagnostics and architecture enforcement pass without external services.

## Explicitly Deferred

Production persistence, graphs, vectors, embeddings, semantic or web search, LLM verification, automatic truth inference, confidence systems, Memory promotion, Context integration, Events, brokers, external Providers, distributed Knowledge, and production audit infrastructure remain deferred.

## Known Limitations

- accepted/current/version state and Store Records are process-local and intentionally non-persistent;
- Candidate Claims are bounded opaque text;
- acceptance trusts a structurally valid explicit authority review supplied through a protected boundary;
- contradiction declarations are caller-supplied;
- supersession is linear and supports no branches, merges, archival, or deletion.

## Next Milestone Recommendation

Formally review and accept M4 before selecting another capability milestone. Any later Knowledge evolution should preserve explicit acceptance, provenance, immutable version history, Engine-owned current semantics, privacy, Core Contract custody, and the Memory/Knowledge/Context partition.
