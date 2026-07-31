# IMPLEMENTATION-M10 — Brain Orchestration Foundation

## Authority

- `ADR-0007 — Brain Orchestration Ownership and Planning Binding`: Active.
- `CONCEPT-0006 — Brain Orchestration Model`: Active.
- `ENGINE-0001 — Brain Engine`: Active.
- `ENGINE-0003 — Context Engine`: Active 1.1.0.
- `ENGINE-0006 — Reasoning Engine`: Active 1.1.0.
- `ENGINE-0007 — Planning Engine`: Active 1.1.0.

The Active Context, Reasoning, and Planning revisions respectively authorize
`Verify Active Context Revision Authority` 1.0.0,
`Verify Reasoning Outcome Authority` 1.0.0, and
`Verify Candidate Plan Authority` 1.0.0.

## Milestone Status

M10 implementation is in progress.

- Phase A — Core foundations: complete.
- Phase B — issuer authority runtime revisions: complete.
- Phase C/D — complete synchronous Brain runtime: implemented atomically;
  correction pass 1 complete and pending formal re-review.
- Phase E — Brain final-result authority and verifier: included in the atomic
  Phase C/D runtime.
- Phase F — Bootstrap composition: not started.
- Phase G — normative precedence and lifecycle completion: included in the
  atomic Phase C/D runtime.
- Phase H — Phase C/D regression, architecture, and quality gates: complete
  for correction pass 1; milestone-wide acceptance remains pending.

This record does not claim that M10 is complete or acceptance-ready.

## Phase B Issuer Authority Runtime Revisions

The Context, Reasoning, and Planning Engines now own private, process-local
authority registries and implement their Active issuer verifier Contracts.
Registration occurs only after the existing complete issuance validation and
correspondence stages, immediately before exact return. Registration failure
suppresses return and is never retried.

Each registry is private to one Engine runtime and keyed by the exact issued
candidate through `WeakMap`. Reasoning associates the exact consumed Context
Revision through `WeakRef`; Planning associates the exact consumed Reasoning
Outcome through `WeakRef`. These associations prove exact upstream identity
without strongly retaining caller-owned upstream graphs. Registered nested
candidate identities and primitive values are captured for exact integrity
verification while the weakly keyed candidate remains reachable.

The verifiers reject malformed requests, unregistered and forged values,
clones, spread/reconstructed values, cross-runtime values, stale Context
Revisions, wrong correspondence, exact upstream identity mismatches, and
replaced or mixed nested graphs. No registry, minting API, factory helper,
diagnostic, or authority state is exported. The public Engine surface adds only
the issuer-owned verifier ports already defined under Core custody in Phase A.

The focused Phase B correction removed the obsolete
`verifyContextRevisionAuthority` boolean path from Context Engine and Bootstrap.
Bootstrap now composes only the Active Context verifier Contract, and the M9
diagnostic delegates to that exact issuer verifier after Get Active
registration.

Context Get Active now registers and returns the exact current Active Context
Revision held by the runtime. No authority view, cache, wrapper, clone, or
reconstruction exists. The real revision is finalized before issuance with an
exact enumerable immutable own data property for `lifecycleState`, and the
captured registration candidate is objectively identical to both the returned
value and the runtime's current revision.

All three verifier boundaries now inspect exact original graphs before
provenance. Canonical Context timestamps and identifiers, exact descriptors,
symbols, prototypes, accessors, arrays, array length/index layouts, decorations,
and hostile Proxy failures are classified as the applicable invalid-request
failure. Planning no longer uses `Array.map` before validating original array
evidence.

No Brain package or runtime behavior, Bootstrap change, persistence, retry,
Engine-to-Engine dependency, or production dependency was added.

## Phase B Tests

Created:

- `services/context/test/context-authority.test.ts`
- `services/reasoning/test/reasoning-authority.test.ts`
- `services/planning/test/planning-authority.test.ts`

The focused tests cover issuance ordering, exact successful verification,
malformed requests, forged authority, clones, spreads and reconstruction,
cross-runtime rejection, stale/replaced values, nested correspondence,
lineage/revision correspondence, exact consumed Context identity, exact
consumed Reasoning identity, private public surfaces, and weak-association
non-retention boundaries.

Private issuer-owned module seams prove complete validation precedes one
registration attempt, the exact candidate passed to registration is the exact
issuer-returned value, registration is adjacent to exact return, registration
failure suppresses return without retry, and unsuccessful issuance never
registers.

Candidate-keyed internal fault controls are installed only by successful real
issuer registration and are not exported from package entrypoints. They alter
specific fields in the real stored snapshots or replace a real weak upstream
association; they cannot register or mint authority. Tests exercise the real
`captureSnapshot` and `matchesSnapshot` implementations for:

- Context stored revision-number replacement and nested projection-identity
  replacement using a projection issued by a second Context runtime;
- Reasoning stored response replacement, nested explainability-identity
  replacement using a second issued outcome, and consumed Context association
  replacement using a Context issued by another runtime; and
- Planning stored category replacement, nested source-identity replacement
  using a second issued plan, and consumed Reasoning association replacement
  using a Reasoning Outcome issued by another runtime.

Each test first verifies the genuinely issued candidate, injects one concrete
private correspondence fault, observes the public authority-verification
failure, restores the original correspondence, and verifies the same exact
candidate successfully again. Separate invalid-state controls exercise only
public error normalization and are not counted as replacement or mixed-state
evidence. Phase B tests do not mock `matchesSnapshot`, instantiate authority
implementations, or invoke their registration methods directly.

Weak non-retention is tested in isolated Node subprocesses with `--expose-gc`,
`FinalizationRegistry`, bounded repeated GC turns, and allocation pressure. The
tests prove collection of the upstream Context while its Reasoning Outcome
remains registered and collection of the upstream Reasoning Outcome while its
Candidate Plan remains registered. After collection, structurally equal
replacement inputs fail closed with the exact authority-verification failures.
The tests do not claim deterministic collection outside their controlled
subprocesses.

## Phase B Validation

Phase B validation performed:

- Prettier on all changed Phase B source, tests, and this record;
- ESLint on affected Context, Reasoning, and Planning source and tests;
- Context, Reasoning, and Planning production and test TypeScript projects;
- focused Context, Reasoning, and Planning test suites;
- affected Core Contract tests;
- repository build; and
- `git diff --check`.

Exact final validation:

- `prettier --write` on the 17 files changed by the final targeted correction,
  including this record: passed;
- `eslint` on the 16 changed TypeScript production/test files: passed;
- focused normal Context, Reasoning, and Planning authority/Context Engine
  validation: 10 files and 79 tests passed;
- affected Context, Reasoning, Planning, Bootstrap, and Core regression:
  11 files and 296 tests passed;
- isolated `--expose-gc` authority non-retention suite: 1 file and 2 tests
  passed;
- `tsc -b --pretty false`: passed for production build and production
  typecheck;
- every repository `tsconfig.test.json`, including affected Core, Context,
  Reasoning, and Planning: passed; and
- `git diff --check`: passed.

Phase C remains not started. This record does not claim M10 complete.

### Final evidence correction validation

The final B-007-C1/B-008-C1 evidence correction changed twelve internal
TypeScript source/test files plus this record. Its exact final validation was:

- Prettier on 13 files: passed;
- ESLint on 12 TypeScript files: passed;
- focused Context, Reasoning, and Planning authority validation: 10 files and
  84 tests passed;
- isolated `--expose-gc` authority non-retention validation: 1 file and 2 tests
  passed;
- affected Context, Reasoning, and Planning regression: 6 files and 145 tests
  passed;
- production build and all repository test TypeScript projects: passed; and
- `git diff --check`: passed.

## Phase A Core Values

`core/src/brain.ts` adds the Core-custodied, Brain-owned shared language for:

- Brain request and private diagnostic correlation identifiers;
- exact normalized cognitive requests and execution intents;
- the response, request-more-context, and skill-result Final Cognitive Result
  variants;
- lifecycle states, transition categories, and events; and
- hostile-safe, non-mutating validation and immutable value construction.

The Skill-result factory preserves the exact nested normalized Skill result
identity. It validates the already-immutable exact M9 public graph through
protected descriptor capture, performs correspondence from captured values,
and neither freezes nor reconstructs the Skill-owned result.

## Phase A Contracts and Failures

`core/src/brain-contracts.ts` adds the synchronous orchestration, final-result
verification, issuer authority-port, operation-allocation, lifecycle-observer,
and Brain configuration Contract types authorized by ENGINE-0001.
The configuration represents all twelve specified ports; the Context,
Reasoning, and Planning operation/verifier pairs are exact callable records,
not wrappers around Contract objects.

`core/src/brain-errors.ts` adds exactly the eleven closed Brain public failure
classes.

The Context, Reasoning, and Planning Core Contract surfaces add their Active
1.1.0 authority-verifier request and Contract types. Their three closed
authority failure classes are also present in the established Core locations.
No issuer runtime registration or verification behavior is implemented in
Phase A.

`core/src/index.ts` exports the new public Core surface without exposing private
implementation concepts.

No diagnostic Core change was required. Brain diagnostic correlation and
lifecycle values are defined by the Brain Core value surface; Bootstrap
diagnostics remain a later phase.

## Phase A Tests

Created:

- `core/test/brain-contract.test.ts`
- `core/test/brain-values.test.ts`

Modified:

- `core/test/context-contract.test.ts`
- `core/test/reasoning-contract.test.ts`
- `core/test/planning-contract.test.ts`

The tests cover exact shapes and variants, conditional fields, public failures,
immutable and non-mutating value construction, hostile boundary inputs,
lifecycle values, verifier requests, and the additive issuer-authority Contract
foundations. Negative evidence covers symbols, accessors, custom prototypes,
revoked and hostile Proxies, immutable Skill success and declared-failure
results, mutable nested rejection, exact configuration callables, and
compile-time missing, extra, and mistyped Contract fields. The tests do not
simulate later Engine authority behavior.

## Validation

Phase A validation performed:

- Prettier on changed Phase A source, tests, and this record;
- ESLint on changed Core source and tests;
- `tsc -p core/tsconfig.json --pretty false`;
- `tsc -p core/tsconfig.test.json --pretty false`;
- the five focused Brain and affected Context/Reasoning/Planning test files;
- the complete 17-file Core regression suite; and
- `git diff --check`.

The final validation run passed 170 tests across the five focused files and
494 tests across all 17 Core test files.

## Atomic Phase C/D — Complete Brain Runtime

Status: correction pass 1 complete and ready for formal re-review. Phase C/D
has not yet been accepted.

The standalone Phase C boundary was rejected because it could not make the
public synchronous operation total for `respond` plus `skill-capability`.
Former Phases C and D are therefore implemented and reviewed atomically.

The runtime is located at `services/brain`. It captures eleven required exact
configuration records plus the optional lifecycle observer, depends only on
`@orion/core`, and invokes no capability during construction.

The implemented runtime includes:

- the `created → initialized → running → stopped` Engine lifecycle;
- exact request reconstruction with caller-owned `BrainRequestIdentifier`;
- one private `BrainDiagnosticCorrelationIdentifier` per valid attempt;
- Context → Reasoning → Planning with exact issuer-owned authority verification
  and identity preservation;
- request-more-context and no-Skill response completion;
- complete Skill selection, post-selection Authorization Operation Identifier
  allocation, binding, execution-Context resolution, requirements resolution,
  governed authorization, protected invocation, and normalized-result
  verification;
- the exact nine-transition Skill lifecycle and five-transition no-Skill
  lifecycle;
- private weak Brain final-result authority and total public verification;
- closed Brain failure normalization, lifecycle observation containment,
  short-circuiting, and retry-free synchronous execution; and
- architecture enforcement prohibiting concrete Engine, Bootstrap, and
  external-package production dependencies.

Correction pass 1 adds complete externally owned M9 acceptance checks for the
selected Binding, Bound Target declaration snapshots, execution-Context
identity projection, and invocation requirements. These checks preserve exact
issuer-returned identities, require complete nested immutability, and reject
concrete primitive, nested-identity, and correspondence mismatches before any
later capability executes.

The focused evidence now includes parameterized configuration and hostile
request matrices; Context, Reasoning, Planning, Skill-coordination,
authorization, protected-invocation, and normalized-result failure prefixes;
exact no-Skill and Skill lifecycle vectors; final-result clone and cross-Brain
rejection; observer containment; distinctive-secret error/event privacy; and
isolated subprocess collection of caller request graphs after both successful
completion and Context-stage failure. The GC tests establish only those
observed collections under bounded explicit-GC runs; they do not claim
deterministic JavaScript collection or collection of every collaborator-owned
graph.

No Bootstrap Brain composition, persistence, asynchronous orchestration,
public registry, public test seam, or external dependency is introduced.
M10 remains incomplete because Bootstrap composition is not implemented.

Atomic Phase C/D correction-pass validation performed:

- Prettier on 9 correction paths: 8 changed Brain TypeScript files and this
  implementation record;
- ESLint on 11 TypeScript files (8 corrected production/test files plus all 3
  Brain architecture fixtures) and 1 JavaScript architecture-verifier tool;
- `tsc -b --pretty false` production build;
- all 11 repository test TypeScript configurations, including the new Brain
  test configuration;
- focused Brain runtime excluding the isolated GC file: 6 files, 159 tests;
- isolated Brain caller-graph non-retention: 1 file, 2 tests;
- Core regression: 17 files, 494 tests;
- Context/Reasoning/Planning Phase B authority regression: 9 files, 40 tests;
- M9 Skill execution boundary: 1 file, 301 tests;
- Security authorization outcome and precedence: 2 files, 13 tests;
- isolated `--expose-gc` Phase B authority non-retention: 1 file, 2 tests;
- 3 Brain negative architecture fixtures; and
- `git diff --check`.

## Scope

Phase A adds no Brain package, Engine runtime behavior, Bootstrap composition,
authority registry, persistence, retry, asynchronous orchestration, transport,
Execution Engine, or new production dependency. Active specifications and
existing M0–M9 runtime semantics are unchanged.
