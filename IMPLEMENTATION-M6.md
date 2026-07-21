# IMPLEMENTATION-M6 — Planning Engine Vertical Slice

## Objective

M6 implements the smallest complete Planning capability: one prepared M5 Reasoning Outcome becomes one immutable advisory Candidate Plan containing exactly one step.

## Governing Specification and Status

[ENGINE-0007 — Planning Engine](specifications/engines/planning/ENGINE-0007-Planning-Engine.md) is Active at version 1.0.0. Foundation-v1.0 and accepted M0–M5 behavior remain unchanged.

## Implemented Scope

M6 provides Core Planning values, one Create Candidate Plan Contract, a framework-free Planning Engine, explicit Bootstrap composition, privacy-safe diagnostics, architecture enforcement, and deterministic tests. It has no Provider, Store, external service, or persistent state.

## Core Model

Core custodies Planning Request, Candidate Plan, both Candidate Plan Step variants, Reasoning Consumption Reference, Planning Explainability Summary, their factories, the Create Candidate Plan Contract, and the four approved failures.

Candidate Plan is returned directly. It has no identity, timestamp, version, lifecycle, persistence, or execution state.

## Planning Contract

`createCandidatePlan` accepts the exact `create-candidate-plan` request with exactly one Reasoning Outcome and returns one Candidate Plan synchronously. Planning Engine owns behavior; Core owns the Contract schema.

## Deterministic Rules

- `request-more-context` produces one payload-free request-more-context step.
- `none` produces one respond step containing the exactly preserved Candidate Response.

All four M5 categories are validated against their controlled text, identity state, reference-count, action, and rule correspondence before planning. The public Reasoning Consumption Reference factory enforces the same closed category, identity, count, action, and Reasoning-rule correspondence, so direct Core construction cannot mint a contradictory source summary. In accordance with ENGINE-0007 and accepted M5 behavior, an `anonymous-context` source permits both Memory and Knowledge reference counts independently from 0 through 20; no stricter identity/count rule is introduced. Every valid input resolves exactly one rule.

## Reasoning Outcome Validation

The Engine reconstructs the complete Core-custodied M5 Outcome and then validates its semantic correspondence. It reads the hostile request's Outcome field once inside the owned boundary and retains no caller object. It never imports or calls Reasoning Engine.

## Steps Exactness

`steps` is a dense exact one-element array. Index `0` must be an own enumerable property; standard non-enumerable `length` is allowed. Empty, sparse, multi-element, array-like, coercible, malformed, non-enumerable-index, and hostile arrays are rejected. Additional enumerable string and symbol properties are rejected. The factory creates a new deeply frozen array and step.

## Source Consumption Model

Reasoning Consumption Reference is a deterministic non-unique structural summary. It carries only the completed status, controlled Reasoning category/action/rule, identity category, reference counts, and `reasoning` capability marker. It contains no identifiers, text, lookup key, timestamp, or persistence semantics.

## Explainability

Planning Explainability records only controlled source category/action, resulting plan category, step count, and selected planning rule. Its public factory enforces the two approved action/category/rule tuples and their M5 category correspondence. Candidate Plan construction then verifies the complete step, source, explainability, category, action, and rule relationship. Explainability contains no response, conclusion, query, identifier, chain-of-thought, or internal trace.

## Failure Mapping

- `InvalidPlanningInputError`: malformed or hostile top-level request.
- `InvalidReasoningOutcomeError`: malformed, hostile, or semantically contradictory Outcome.
- `PlanningRuleFailureError`: controlled internal rule-resolution failure.
- `InvalidPlanningStateError`: lifecycle/internal-state or constructed-output failure.

Messages are fixed and privacy-safe. Native inspection failures do not cross the Contract.

## Validation Precedence

Validation proceeds through lifecycle/internal state, request shape, Outcome structure, Outcome semantic correspondence, rule evaluation, and constructed-output validation. Tests use hostile later inputs and an internal controlled-failure fixture to prove first-failure behavior.

## Internal Test Seams

The public `PlanningEngine` constructor is argument-free and exposes no fault controls. Controlled failure tests use isolated Vitest module fixtures: one replaces the non-entrypoint internal rule selector, and one replaces constructed-output validation for its test module only. Production source contains no fault flags, tokens, mutable test state, or fault configuration. The package entrypoint exports no test mechanism, arbitrary runtime constructor arguments cannot configure behavior, and production Bootstrap uses ordinary construction.

## Runtime Safety

Public factories and the Engine protect exact-shape, own-key, descriptor, getter, nested-field, array-index, and Proxy inspection. Targeted tests include a throwing request `intent` getter, hostile nested Reasoning Outcome Proxy, non-enumerable step index, hostile step descriptors, and explicit empty, populated, and symbol-decorated arrays for every public Planning factory. Inputs are never coerced, normalized, truncated, logged, frozen, or mutated.

## Immutability and Input Ownership

Candidate Plan, step, steps array, source, and explainability are newly constructed and deeply frozen. Candidate Response is copied by primitive value. Tests prove request and Outcome non-mutation across success and each controlled failure path.

## Architecture Boundaries

Planning production code depends only on `@orion/core`. Dependency rules and isolated fixtures prohibit Bootstrap/Infrastructure, other Engine implementations, and external packages; Core-outward dependency enforcement includes Planning. Bootstrap is the sole composition root.

## Bootstrap and Diagnostics

Bootstrap starts Planning explicitly and registers `orion.planning` only after composition. The diagnostic uses a prepared Knowledge-grounded Reasoning Outcome and exposes only operational success, `respond`, step count `1`, and `reasoning-produced-response`. It never emits raw cognitive content or identifiers, and mandatory output remains independent of log filtering.

## Tests

The final suite contains 25 test files and 522 passing tests. M6 adds Core factory and Planning Engine suites covering exact values, per-factory empty/populated/decorated arrays, malformed and hostile inputs, dense-array enumerable-index exactness, all four valid M5 source correspondences and their normative count boundaries, contradictory source/explainability/plan combinations, all four failures, precedence, isolated controlled-failure fixtures, determinism, deep immutability, input non-mutation, privacy, Bootstrap diagnostics, and architecture fixtures.

## Quality Gates

The pinned pnpm 11.15.0 toolchain is used through Corepack. Build, typecheck, 25 test files/522 tests, lint, formatting, architecture, diagnostics at debug/info/warn/error, validation-equivalent subcommands, `git diff --check`, and worktree inspection pass. The review shell has no global `pnpm` shim, so commands whose scripts recursively invoke bare `pnpm` are executed as their equivalent pinned Corepack/build and direct repository binaries.

## Acceptance Criteria

M6 demonstrates exact prepared-input consumption, deterministic one-step planning, semantic Outcome validation, immutable output, exact failure behavior, privacy-safe diagnostics, Core-only Engine dependency, and no execution or orchestration behavior.

## Deviations

There are no semantic deviations from ENGINE-0007. Controlled failure instrumentation exists only in isolated test modules and cannot be activated through ordinary Engine construction.

## Explicitly Deferred

Persistence, plan identity, multi-step workflows, dependency graphs, parallelism, scheduling, retries, compensation, authorization, Skills, tools, execution, Brain orchestration, delivery, Events, Providers, and external services remain deferred.

## Known Limitations

M6 intentionally maps only the two approved M5 next-action values to one advisory step. It does not decompose arbitrary objectives or perform execution.
