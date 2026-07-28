# IMPLEMENTATION-M8 — Security Engine: Authorization Decision Foundation

## Authority

- `CONCEPT-0004 — Authorization Model`: Active 1.0.0.
- `ENGINE-0009 — Security Engine`: promoted to Active 1.0.0 after implementation.
- Foundation and accepted M0–M7 semantics remain unchanged.

## Implemented Slice

M8 implements synchronous, process-local authorization evaluation. The Security
Engine obtains governed requirements, Security context, grant evidence, and
confirmation only through configured Core-custodied Contracts. It returns one
deeply immutable `allow`, `deny`, or `indeterminate` Authorization Decision
Artifact under fixed policy `orion.minimum-authorization` version `1.0.0`.

The public request contains only `intent`, `operationId`, `action`, and
`resource`. Authority-shaped caller fields are not accepted. Authority
provenance is established by configured Contract invocation and remains
insufficient without defensive structural and correspondence validation.

## Core Domain and Contracts

Core contains the shared authorization identifiers, subject and resource
unions, requirements, grants, evidence, Security dimension statuses,
confirmation, fixed policy representation, decision artifact, immutable
factories, synchronous Contract schemas, and the three closed public failures.

All textual bounds, collection bounds, exact matching rules, canonical ordering,
and output invariants follow ENGINE-0009. Authorization Action Identifiers
enforce the exact 3–128 ASCII bound independently of grammar. Decision Artifact
construction validates one complete closed output-table row; partial
decision/reason compatibility is insufficient. Operation allocation and
non-reuse remain orchestration responsibilities.

## Security Ownership

`@orion/security` owns lifecycle, authority orchestration, correspondence
validation, fixed-policy evaluation, deterministic short-circuit precedence,
and final artifact construction. Its only runtime dependency is `@orion/core`.

Four deterministic process-local authority implementations provide direct,
hostile-safe Contract boundaries. Collaborator invocation is isolated from
returned-candidate reconstruction: every thrown value maps to Security state
failure, while a successfully returned malformed candidate maps to evidence
failure.

The Skill projection authority reconstructs the complete supplied Registered
Skill with the M7 Core factory at its composition admission boundary, retains
only the immutable reconstruction, and copies its complete canonical permission
set. Partial or malformed Skill-shaped objects are rejected. Resource
correspondence uses exact domain-aware matching and never serialization.

## Decision and Failure Semantics

Evaluation precedence is lifecycle/internal configuration, public envelope,
target, requirements, Security context, grants, confirmation, fixed policy, and
constructed artifact. Valid unavailable authority results yield
`indeterminate`; missing grants and required confirmation yield `deny`.

Public failures are exactly:

- `InvalidAuthorizationInputError`;
- `InvalidAuthorizationEvidenceError`;
- `InvalidSecurityStateError`.

Configured authority throws normalize to Security state failure. Malformed or
mismatched returned candidates normalize to authorization evidence failure. No
native message or hostile value is exposed.

## Runtime Hardening

Public and governed boundaries enforce exact own-property shapes, protected
descriptor/property extraction, defensive reconstruction, dense bounded
collections, canonical code-point ordering, deep freezing, and caller/source
non-mutation. Permission and grant arrays capture `length` through one protected
descriptor read and capture every accepted index once; they never access a
hostile array’s `length` property directly. Evaluation is read-only and
deterministic.

Direct grant-collection tests independently cover dense, sparse, decorated,
symbol-bearing, array-like, throwing, stateful, and hostile-Proxy inputs.
Direct authority-output tests cover unavailable Grant Evidence as the governed
representation for partial, stale, and unverifiable evidence; hostile Context
and Confirmation candidates; every governed Context dimension status; and
source non-mutation.

The constructed-artifact failure test uses a per-test `vi.doMock` plus isolated
dynamic module import. One test proves deeply equal normal behavior before and
after the isolated final-stage failure. The mock is removed and the module
registry reset between phases and after each test. Runtime export-surface,
constructor, prototype, and environment-switch probes establish that ordinary
package consumers have no public or configurable failure mechanism. There is no
mutable module-level control or production fault flag.

## Bootstrap and Diagnostics

Bootstrap explicitly composes the process-local authorities and Security Engine
without a DI framework or service locator. The mandatory diagnostic demonstrates
operational allow, deny, and indeterminate paths using only privacy-safe boolean
summaries. It exposes no operation, subject, action, resource, permission,
grant, confirmation, or context value.

## Architecture

Production Security dependencies are restricted to Core. Dependency rules and
isolated negative fixtures prove Core-outward, Bootstrap/Infrastructure,
other-Engine, external-package, and cycle prohibitions without weakening prior
milestone rules.

## Files Created

- `core/src/security.ts`
- `core/src/security-contracts.ts`
- `core/src/security-errors.ts`
- `core/test/security-artifact-matrix.test.ts`
- `core/test/security-collections.test.ts`
- `core/test/security-factory-boundaries.test.ts`
- `core/test/security.test.ts`
- `services/security/package.json`
- `services/security/tsconfig.json`
- `services/security/tsconfig.test.json`
- `services/security/src/index.ts`
- `services/security/src/security-authorities.ts`
- `services/security/src/security-engine.ts`
- `services/security/test/security-authorities.test.ts`
- `services/security/test/security-authority-boundaries.test.ts`
- `services/security/test/security-authority-output-matrix.test.ts`
- `services/security/test/security-constructed-artifact-failure.test.ts`
- `services/security/test/security-decision-output-table.test.ts`
- `services/security/test/security-engine.test.ts`
- `services/security/test/security-precedence-matrix.test.ts`
- `services/security/test/security-provenance-nonmutation.test.ts`
- `services/security/test/security-request-boundary.test.ts`
- `services/security/test/security-skill-authority.test.ts`
- Security architecture fixtures and verification tool
- `services/bootstrap/src/security/security-composition.ts`
- `IMPLEMENTATION-M8.md`

## Files Modified

Core exports/diagnostics, Bootstrap composition/diagnostics/tests/package and
TypeScript references, root workspace scripts/references, dependency rules,
lockfile workspace metadata, and ENGINE-0009 status/version/editorial Active
wording.

## Tests and Validation

The final repository suite contains 50 test files and 924 passing tests. The 14
M8-focused files contain 239 tests. They directly exercise every exported
Security Core factory, exact identifier bounds, protected permission and grant
collections, valid and contradictory artifact rows, all four authority request
and output boundaries, Skill projection admission, all ten Engine output rows,
lifecycle and intermediate precedence, and the isolated constructed-result
failure.

The focused correction matrices additionally cover hostile grant collections;
partial, stale, unverifiable, and unavailable Grant Evidence through the
governed unavailable state; hostile Context and Confirmation outputs; and
source/caller non-mutation for allow, both deny categories, all indeterminate
categories, malformed Requirements/Context/Grant/Confirmation evidence,
authority throws, lifecycle failure, and constructed-artifact failure. For
every applicable path, the matrix checks the mutable
`requiredPermissions`, `evaluatedPermissions`, and `grants` arrays for
unchanged contents/order and unfrozen caller/source state. These claims describe
the named equivalence classes exercised by the suite and do not claim
exhaustive runtime-state coverage.

Pinned validation used Corepack pnpm 11.15.0 and direct repository binaries
where Windows could not resolve nested bare `pnpm` commands:

- `corepack pnpm install --frozen-lockfile`: PASS
- `corepack pnpm build`: PASS
- `corepack pnpm typecheck`: PASS
- `corepack pnpm lint`: PASS
- direct `vitest run`: 50 files / 924 tests PASS
- focused `vitest run security`: 14 files / 239 tests PASS
- `corepack pnpm architecture`: 105 modules / 167 dependencies PASS; every
  negative fixture PASS
- focused and repository formatting checks: PASS
- diagnostic at debug, info, warn, and error: PASS
- complete validate-equivalent sequence: PASS
- `git diff --check`: PASS

## Dependencies

- `@orion/security` runtime dependency: `@orion/core` only.
- No external runtime dependency.
- No database, filesystem, network, or persistence dependency.

## Deviations

None.

## Deferred Scope

Execution and enforcement, Skill invocation/selection, Planning binding, Brain
orchestration, confirmation acquisition, replay protection, signing, external
IAM, persistence, audit storage, Events runtime, Providers/Adapters,
configurable policy, and concrete Device/Session/Trust providers remain
deferred.
