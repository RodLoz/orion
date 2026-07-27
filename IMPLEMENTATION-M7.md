# M7 — Skill Engine: Skill Catalog Vertical Slice

## Status

M7 is implemented against
`specifications/engines/skill/ENGINE-0008-Skill-Engine.md`.

- ENGINE-0008 status: Active
- ENGINE-0008 version: 1.0.0
- Test files: 36
- Tests: 685
- Deviations: none

## Files Created

- `core/src/skill.ts`
- `core/src/skill-contracts.ts`
- `core/src/skill-errors.ts`
- `core/test/skill-contract.test.ts`
- `core/test/skill-correction-matrix.test.ts`
- `core/architecture-fixtures/skill-engine-dependency.ts`
- `services/skill/package.json`
- `services/skill/tsconfig.json`
- `services/skill/tsconfig.test.json`
- `services/skill/src/index.ts`
- `services/skill/src/skill-engine.ts`
- `services/skill/src/skill-state.ts`
- `services/skill/test/skill-test-values.ts`
- `services/skill/test/skill-engine.test.ts`
- `services/skill/test/skill-preexisting-state-failure.test.ts`
- `services/skill/test/skill-catalog-canonical-state.test.ts`
- `services/skill/test/skill-constructed-state-failure.test.ts`
- `services/skill/test/skill-resulting-catalog-failure.test.ts`
- `services/skill/test/skill-get-constructed-state-failure.test.ts`
- `services/skill/test/skill-discovery-constructed-state-failure.test.ts`
- `services/skill/test/skill-duplicate-precedence.test.ts`
- `services/skill/test/skill-non-mutation-matrix.test.ts`
- `services/skill/architecture-fixtures/bootstrap-dependency.ts`
- `services/skill/architecture-fixtures/infrastructure-dependency.ts`
- `services/skill/architecture-fixtures/other-engine-dependency.ts`
- `services/skill/architecture-fixtures/voice-engine-dependency.ts`
- `services/skill/architecture-fixtures/automation-engine-dependency.ts`
- `services/skill/architecture-fixtures/external-package.ts`
- `services/bootstrap/src/skill/skill-composition.ts`
- `infrastructure/architecture-fixtures/skill-forbidden-target.ts`
- `services/voice/architecture-fixtures/skill-forbidden-target.ts`
- `services/automation/architecture-fixtures/skill-forbidden-target.ts`
- `tools/verify-forbidden-skill-dependencies.mjs`
- `IMPLEMENTATION-M7.md`

The Infrastructure, Voice, and Automation targets are inert architecture
fixtures only. They are outside every production graph and do not establish
runtime implementations.

## Files Modified

- `.dependency-cruiser.cjs`
- `core/src/diagnostic.ts`
- `core/src/index.ts`
- `package.json`
- `pnpm-lock.yaml`
- `services/bootstrap/package.json`
- `services/bootstrap/src/diagnostic.ts`
- `services/bootstrap/src/index.ts`
- `services/bootstrap/test/diagnostic.smoke.test.ts`
- `services/bootstrap/tsconfig.json`
- `tsconfig.json`
- `specifications/engines/skill/ENGINE-0008-Skill-Engine.md`

ENGINE-0008 was promoted from Draft 0.1.0 to Active 1.0.0 after the initial
implementation gates passed. The correction replaces stale Draft terminology
with Active-specification wording without changing normative semantics.

## Domain Model and Bounds

Core custodies:

- Skill Identifier;
- Skill Capability Identifier;
- Skill Permission Identifier;
- Event Declaration Identifier;
- Skill Interface Field Identifier;
- Skill Failure Mode Identifier;
- Skill Version;
- Skill Manifest;
- Registered Skill;
- Skill Discovery Result;
- the three synchronous Contracts;
- the five public failure classes.

The exact manifest contains `id`, `name`, `version`, `description`, `author`,
`license`, `permissions`, `capabilities`, `events`, `inputs`, `outputs`, and
`failureModes`. ENGINE-0008 identifier grammars, Unicode code-point limits,
printable-ASCII License semantics, complete bounded Semantic Version syntax,
and collection limits are implemented without coercion, trimming,
normalization, or truncation.

## Contracts and Catalog

Register, Get, and Discover synchronously return or throw. Each Skill Engine
instance owns a new empty process-local catalog.

Register envelope validation captures exact own keys and descriptors and
validates `intent` without reading the manifest value. Manifest extraction then
performs one protected read. Getter failure at that boundary maps to
`InvalidSkillManifestError`.

Registration is atomic and non-idempotent. Skill Identifier alone is the
uniqueness key. A candidate catalog is validated before it replaces current
state. Get is exact and defensively reconstructs its result. Discovery performs
exact capability matching and returns all matching Skills in direct,
locale-independent Skill-Identifier order. Empty discovery succeeds.

Registered Skill is exactly a defensively reconstructed and deeply frozen Skill
Manifest. Version is preserved metadata and has no identity, compatibility,
ordering, selection, replacement, or upgrade role.

## Lifecycle and State Precedence

The lifecycle is Initialize, Ready, Running, Stopping, and Stopped. Catalog
operations are valid only while Running and are synchronously serialized.

Before inspecting a request, every operation validates lifecycle and the
pre-existing catalog. Catalog validation requires canonical frozen data
descriptors throughout the manifest, nested Event object, and every collection.
Accessor properties and accessor indices are rejected without invocation.

Controlled test-module mocks prove:

- pre-existing state wins without request inspection;
- invalid intent wins without manifest/identifier/capability getter access;
- duplicate state wins before constructed-state validation;
- Registered Skill construction wins before resulting-catalog validation;
- resulting-catalog failure is atomic;
- Get and Discover constructed-result failures occur only after successful
  lookup or discovery.

No test seam, fault flag, or failure control is exported from the package
entrypoint.

## Runtime Hardening and Immutability

Public factories capture own keys and descriptors safely, perform one protected
read per accepted property or index, reject hostile runtime values, and
normalize failures to privacy-safe domain errors. Accepted graphs are
defensively reconstructed and deeply frozen.

Caller objects and arrays are not retained, frozen, sorted, deduplicated,
rewritten, or otherwise mutated. Canonical sorting occurs only on new arrays.

The test matrix directly covers scalar factories, aggregate factories, all
seven declaration collections, Semantic Version, all three request envelopes,
hostile records and arrays, staged precedence, internal descriptor corruption,
atomic visibility, insertion-order independence, and caller non-mutation.

## Bootstrap and Diagnostics

Bootstrap explicitly constructs, initializes, and starts Skill Engine. It does
not scan, load, install, select, authorize, or execute Skills.

The mandatory diagnostic demonstrates initialization, registration, Get, exact
discovery, duplicate rejection, and empty discovery. Only controlled booleans
and counts are emitted. Manifest identity, text, version, permissions,
capabilities, Events, inputs, outputs, and failure modes are not emitted.

Diagnostic verification passes at `debug`, `info`, `warn`, and `error`.

## Architecture and Dependencies

`@orion/skill` has exactly one runtime dependency:

- `@orion/core` via `workspace:*`

No external package or version upgrade was introduced.

Dependency rules enforce:

- Core cannot depend outward on Skill Engine;
- Skill Engine cannot depend on Bootstrap or Infrastructure;
- Skill Engine cannot depend on any other `services/<engine>` implementation,
  including future Engine directories;
- Skill Engine cannot depend on an external npm runtime package;
- cycles remain forbidden.

Isolated fixtures prove Planning, Voice, Automation, Bootstrap, Infrastructure,
external-package, and Core-outward prohibitions independently. The production
architecture graph contains 93 modules and 147 dependencies.

## Validation

The final correction was validated with the pinned `pnpm@11.15.0` toolchain:

- `corepack pnpm install --frozen-lockfile` — passed;
- `corepack pnpm format:check` — passed;
- `corepack pnpm lint` — passed;
- `corepack pnpm build` — passed;
- `corepack pnpm typecheck` — passed;
- direct pinned Vitest run — 36 files and 685 tests passed;
- `corepack pnpm architecture` — production graph and every isolated fixture
  passed;
- complete `validate` gate using the pinned Corepack toolchain — passed;
- diagnostic runtime at debug, info, warn, and error — passed;
- `git diff --check` — passed.

## Boundaries and Deferred Capabilities

M7 implements catalog validation, registration, exact lookup, and exact
capability discovery only.

It does not implement Skill execution, installation, loading, invocation,
result normalization, selection, Planning binding, Brain orchestration,
authorization, Context or Reasoning consumption, persistence, Events runtime
behavior, Providers, Adapters, external integrations, retries, timeouts,
cancellation, compensation, or sandboxing.

No database, filesystem catalog, network access, external SDK, or external
runtime dependency was introduced.
