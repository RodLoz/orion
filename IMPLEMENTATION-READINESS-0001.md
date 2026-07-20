# IMPLEMENTATION-READINESS-0001 — Bootstrap Readiness Analysis

## 1. Executive Summary

O.R.I.O.N. can begin implementation after a small, explicit implementation-toolchain decision gate. The frozen Foundation already determines the architectural shape: a responsibility-oriented single repository, framework-independent Core, capability-owned Engines, Core-custodied shared Contracts, inward source-code dependencies, replaceable outer implementations, external configuration, structured observability, and automated testing. It intentionally does not mandate a programming language, runtime, framework, package manager, build system, test runner, static-analysis tool, CI service, database, event broker, API protocol, container platform, or deployment topology.

The technologies listed in `docs/architecture.md`—React Native with Expo, Python with FastAPI, PostgreSQL or Supabase, WebSocket, and Docker—are explicitly described as implementation choices rather than architectural dependencies. They are preferences or candidates, not approved mandates, and must not be treated as decisions made by `foundation-v1.0`.

The minimum safe bootstrap decision set is therefore limited to:

1. one implementation language and supported runtime version for the initial backend workspace;
2. one package/dependency/build toolchain and a concrete mapping from the Foundation directories to enforceable modules;
3. one automated test runner and an architecture-boundary test mechanism;
4. linting, formatting, and static-analysis rules with one reproducible local quality command;
5. a minimal configuration convention and structured-logging convention;
6. the initial CI quality gate, without selecting deployment automation.

The smallest useful first milestone is an executable architectural skeleton: a framework-free Core module, a bootstrap/composition module, an empty or minimal capability registry assembled at runtime, a diagnostic executable path, and automated unit, contract, and dependency-boundary tests. It should have no cognitive behavior, external integration, database, message broker, network API, container requirement, or production deployment assumption.

## 2. Foundation Baseline

The immutable architectural baseline for implementation is the Git tag `foundation-v1.0`, approved by `REVIEW-0004-FINAL-FREEZE-VERIFICATION.md` with non-blocking follow-up. Implementation must preserve the authoritative hierarchy in `docs/DOCUMENT-AUTHORITY.md`; historical reviews and general documentation do not override approved ADRs, Active specifications, or Active OES documents.

The baseline already establishes:

- Capability-Oriented, Clean, Hexagonal, event-driven, and domain-oriented architectural constraints.
- Source-code dependencies point inward toward Core abstractions.
- Core is framework- and infrastructure-independent and is the canonical custodian of shared architectural Contracts and Event schemas.
- Capability Engines own capability behavior and domain semantics.
- Providers, Adapters, Infrastructure, Clients, and runtime enforcement do not acquire capability semantic ownership.
- Cross-boundary communication occurs through Contracts or authorized Events, not concrete implementation dependencies.
- The runtime capability registry is created during platform bootstrap; runtime topology must remain replaceable without changing Engine behavior.
- The repository is organized by responsibility using `apps/`, `core/`, `services/`, `packages/`, `specifications/`, `docs/`, `infrastructure/`, and `tools/`.
- Configuration is external, secrets are not hardcoded, failures are explicit, and structured observability is required from the beginning.
- Core domain rules require proportionate unit tests, Contract validation, and Event validation; Engine, Skill, Provider, Adapter, and Event standards add applicable automated-test obligations.
- Technology selection is subordinate to the architecture and must preserve vendor and framework replaceability.

Two lower-authority state mismatches should be recognized during bootstrap planning without changing the frozen Foundation: `ORION-HANDOFF.md` still describes the pre-freeze phase and presents a simplified `src/`/`tests/` plan, while OES-0001 is authoritative for repository structure; the current filesystem also contains `infraestructure/`, whereas OES-0001 names `infrastructure/`. No implementation should be placed according to the stale or misspelled forms.

## 3. Existing Implementation Constraints

The Foundation constrains implementation in the following ways:

- **Architecture before tooling:** technologies must fit the frozen boundaries; tooling cannot redefine them.
- **Core purity:** Core cannot import frameworks, clients, Engines, Skills, Providers, Adapters, Infrastructure, databases, external APIs, or vendor SDKs.
- **Module independence:** Engines and Skills cannot import concrete outer implementations or external systems; outer implementations depend inward on Core-custodied abstractions where applicable.
- **Contract discipline:** cross-boundary interfaces must be explicit, stable, and validated. Contract custody, domain semantics, and implementation responsibility remain distinct.
- **Composition at the edge:** runtime registration and concrete wiring belong outside Core. Bootstrap creates the runtime registry; Core only defines stable capability language and abstractions.
- **Repository responsibility boundaries:** clients belong in `apps/`, Core language in `core/`, Engine implementations in `services/`, reusable libraries in `packages/`, deployment resources in `infrastructure/`, and development utilities in `tools/`.
- **Configuration and secrets:** configuration must be supplied externally; environment-specific values, credentials, provider names, and endpoints must not be hardcoded.
- **Quality:** automated tests are required. Core rules, Contracts, and Events require validation; implementation components must be testable in isolation.
- **Observability:** structured logs, correlation identifiers where applicable, explicit failures, health/diagnostic information, and metrics-compatible boundaries must be possible from the start.
- **Replaceability:** the bootstrap must not embed a database, broker, framework, provider, cloud, or transport assumption into Core or capability semantics.
- **Security and privacy:** external input is untrusted, secrets and sensitive data cannot leak into logs or errors, and future protected boundaries must enforce Security-owned policy.

These are architectural constraints. They do not choose a language, framework, tool vendor, protocol, database, broker, or hosting environment.

## 4. Decision Matrix

| Area | Status | Existing Constraint | Decision Required Now |
|---|---|---|---|
| Programming languages | OPEN | Core must remain framework- and vendor-independent; technology-specific code stays outside Core. Python and React Native are non-binding candidates only. | Select one language for the initial backend/bootstrap workspace and define its supported language version. Client-language selection is not required. |
| Runtime | OPEN | Runtime topology must be replaceable without changing Engine behavior and must support a simple local-development path. | Select the local execution runtime and exact supported version for reproducible builds and tests. |
| Backend framework | OPEN | Framework code cannot enter Core. Gateway and transport concerns are outer boundaries. FastAPI is a non-binding candidate. | None for the first milestone; explicitly confirm that the bootstrap executable will not require a backend framework. |
| Repository structure | DECIDED | OES-0001 defines the responsibility-oriented top-level directories. `core/`, `services/`, `packages/`, `apps/`, `infrastructure/`, and `tools/` have distinct roles. | Adopt the OES-0001 paths for code and decide how language-native project files map within them; do not use the stale `src/` summary or `infraestructure/` spelling. |
| Monorepo vs multi-repo | CONSTRAINED | OES-0001 defines one official repository containing platform responsibilities; distributed runtime evolution must not alter Engine behavior. | Confirm the existing single-repository model for the bootstrap. A multi-repo split is unnecessary and would require separate architectural approval if it changes OES-0001. |
| Package/module boundaries | CONSTRAINED | Core, Engine implementations, reusable packages, clients, and Infrastructure have different dependency permissions; cross-boundary behavior uses Contracts. | Define the smallest language-native modules and their allowed dependency graph, including where the composition root lives. |
| Build system | OPEN | Builds must preserve module boundaries and remain reproducible; no build tool is named authoritatively. | Select the minimal build/task mechanism and standard commands for build, run, test, and quality checks. |
| Dependency management | OPEN | Concrete technology dependencies must remain outside Core abstractions; versions and compatibility must be controlled. | Select one dependency/package manager, lockfile policy, workspace mechanism if needed, and dependency-update policy sufficient for the bootstrap. |
| Testing framework and strategy | CONSTRAINED | Automated tests, Core unit tests proportionate to rule criticality, Contract validation, Event validation, and isolated component testing are required. | Select the test runner and define bootstrap test layers: unit, Contract/schema, executable smoke, and dependency-boundary tests. Set no arbitrary coverage percentage. |
| Linting and formatting | OPEN | Naming, readability, documentation, and maintainability standards apply, but no tool or style implementation is mandated. | Select formatter and linter, their configuration ownership, and a single non-interactive check command. |
| Static analysis | OPEN | Contracts, explicit failures, type boundaries, and dependency direction must be enforceable; no analyzer is mandated. | Select type/static analysis appropriate to the chosen language and an automated import/dependency-rule check. |
| CI/CD | CONSTRAINED | OES-0001 reserves Infrastructure for CI/CD; Definition of Done requires tests and standards compliance. No CI vendor or deployment pipeline is selected. | Define a minimal CI quality gate that runs build, tests, formatting/lint, static analysis, and architecture checks. Defer CD and provider selection if local commands are portable. |
| Containerization | OPEN | Docker is a non-binding candidate; runtime and deployment must remain replaceable. | None. Defer containers until a network service, integration dependency, or deployment target creates a concrete need. |
| Local development environment | OPEN | Local development should remain simple; configuration is external and secrets are not committed. | Define supported runtime setup, repository bootstrap command, standard run/test/quality commands, and a safe local configuration example with no secrets. |
| Configuration management | CONSTRAINED | Configuration must be external; environment values, provider names, endpoints, credentials, and secrets cannot be hardcoded. | Choose a minimal local configuration loading convention, precedence rule, validation behavior, and secret-exclusion rule. Do not select centralized configuration infrastructure. |
| Logging and observability | CONSTRAINED | Structured logging, correlation support where applicable, explicit failures, diagnostics, health, and metrics-compatible observability are required. Sensitive data and secrets must not be exposed. | Select the minimal structured-log API/convention, severity and field conventions, redaction rule, and bootstrap correlation identifier behavior. Defer telemetry backends. |
| Event infrastructure | DEFERRED | Events are immutable, governed, semantically owned, authorized, versionable, and asynchronous where meaningful; no universal publication requirement or broker is mandated. | None. Do not select or deploy a broker. Event Contract validation may be tested without runtime event infrastructure. |
| Persistence abstractions | CONSTRAINED | Memory, Knowledge, and Context semantics are not storage technologies; Engines cannot depend on concrete databases; persistence must sit behind Contracts. | None for the first milestone. Define repository Contracts only when a real capability use case requires them. Do not choose a database or generic repository prematurely. |
| API / Gateway implementation | DEFERRED | Clients enter through a Gateway/Application boundary; transport is outside Core and must preserve Contracts and Security enforcement. WebSocket and FastAPI are non-binding candidates. | None. The first executable may be a local diagnostic entry point with no public network API. |
| Initial deployment assumptions | DEFERRED | Deployment topology must not alter Engine behavior; Infrastructure contains deployment resources; Docker/cloud choices are non-binding. | None beyond “local process for bootstrap validation.” Production hosting, topology, scaling, and CD remain deferred. |

## 5. Decisions Required Before Coding

The following is the minimum implementation decision gate. These choices should be recorded in an implementation-bootstrap decision record or equivalent approved implementation plan without modifying `foundation-v1.0`.

### 5.1 Language and runtime baseline

Choose one language and one supported runtime version for the initial backend/bootstrap code. The decision should evaluate module-boundary enforcement, type/static analysis, test ergonomics, package isolation, contributor workflow, and long-term support. It must state that the choice is replaceable outside architectural Contracts and does not authorize a client stack or AI provider.

### 5.2 Module and composition-root map

Map the chosen language’s modules to OES-0001:

- framework-independent shared language and Contracts under `core/`;
- runtime composition and later Engine implementations under `services/` with capability isolation;
- only genuinely reusable, non-domain libraries under `packages/`;
- no implementation in `apps/` or `infrastructure/` for the first milestone;
- development commands or boundary-check tooling under `tools/` only when separate files are needed.

Define allowed imports mechanically. At minimum, Core imports no project outer layer; service modules may import Core abstractions but not other concrete Engines or outer implementations; the composition root may depend on concrete modules solely to assemble runtime objects and must contain no domain behavior.

### 5.3 Package, dependency, and build toolchain

Select one package/dependency manager, lockfile policy, and minimal build/task interface. Define canonical commands for setup, build, execution, testing, and the complete quality gate. Avoid a second task orchestrator unless the chosen ecosystem cannot provide a clear command surface.

### 5.4 Test and architecture-enforcement toolchain

Select the test runner and establish four bootstrap checks:

1. unit tests for the minimal Core rules introduced by the milestone;
2. Contract/schema validation tests for any shared Contract created;
3. an executable smoke test for bootstrap and runtime registration;
4. automated dependency-boundary tests that fail on forbidden imports.

No integration with a database, broker, network service, or provider is required. A coverage percentage can wait until meaningful behavior exists.

### 5.5 Code-quality toolchain

Choose one formatter, one linting configuration, and suitable static/type analysis for the selected language. The full quality command must be deterministic, non-interactive, locally runnable, and suitable for CI. Generated or third-party files should be excluded explicitly rather than silently tolerated.

### 5.6 Minimal configuration and structured logging

Define only the conventions needed by the executable skeleton: external configuration loading, validation and failure behavior, safe example values, secret exclusion, structured log records, severity levels, correlation identifier field, and redaction. Do not choose remote configuration, log aggregation, tracing, or metrics vendors.

### 5.7 Initial CI quality gate

Choose or confirm the CI execution environment only to the extent required to run the repository’s canonical quality command on changes. The gate should verify the locked dependency installation, build, tests, formatting/linting, static analysis, and architectural dependency rules. Deployment automation is out of scope.

## 6. Decisions That Can Be Deferred

The following decisions are not required to create a safe executable bootstrap:

- backend web framework and public API style;
- Gateway transport, authentication protocol, streaming protocol, and WebSocket use;
- mobile, desktop, web, watch, or other client languages and frameworks;
- database, cache, object storage, vector index, or persistence provider;
- persistence schemas and repository implementations;
- Event broker, queue, delivery guarantees, serialization transport, and distributed messaging;
- container image, orchestration, cloud provider, hosting model, and deployment topology;
- CD strategy, environments, release promotion, and rollback tooling;
- production observability vendor, collector, tracing backend, metrics backend, dashboards, and alerting;
- external configuration or secret-management service;
- AI, speech, identity, or other external Providers and Adapters;
- concrete Memory retrieval, Knowledge validation, Context composition, Reasoning, Planning, or Skill algorithms;
- retention durations, confidence formulas, synchronization, concurrency, and scaling policies;
- Engine-specific Contracts, Events, lifecycle details, and observability beyond what a later approved Engine Specification requires;
- client SDKs and multi-repository extraction.

Deferral is safe because the Foundation already supplies the ports-and-adapters constraints those choices must obey when they become necessary.

## 7. Recommended Bootstrap Scope

The bootstrap should establish only the implementation chassis required to enforce `foundation-v1.0`:

- language-native projects/modules aligned to `core/`, `services/`, and the composition root;
- a framework-free Core package containing only the minimum shared types and Contract abstractions exercised by the bootstrap;
- a runtime capability-registry abstraction defined in Core and instantiated at composition time, without predefining full cognitive capability behavior;
- one local executable entry point that assembles the registry, performs a deterministic self-check, emits a structured diagnostic record, and exits successfully or with an explicit failure;
- external configuration sufficient only for the diagnostic runtime mode;
- automated unit, Contract, smoke, and dependency-boundary tests;
- deterministic format, lint, static-analysis, build, run, and test commands;
- a minimal CI quality gate executing the same commands used locally.

Explicitly exclude:

- Brain, Memory, Knowledge, Context, Reasoning, Planning, Skill, Voice, Identity, or Security behavior;
- Engine Specifications or speculative capability Contracts;
- network listeners, Gateway endpoints, databases, event brokers, containers, cloud resources, and external integrations;
- provider SDKs, AI models, embeddings, persistence algorithms, and deployment code.

The bootstrap must prove the architecture can be expressed and guarded in code, not simulate product intelligence.

## 8. Recommended First Implementation Milestone

**Milestone M0 — Executable Architectural Skeleton**

M0 is complete when:

1. a clean environment can install locked dependencies using one documented command;
2. the repository builds using the selected language/runtime without a backend framework;
3. a local executable composition root constructs an empty or minimal runtime capability registry from Core abstractions;
4. running the executable produces a structured, non-sensitive diagnostic result and deterministic exit status;
5. Core has no imports from `services/`, `packages/` outer implementations, `apps/`, `infrastructure/`, frameworks, or vendor libraries;
6. no concrete Engine imports another concrete Engine, and no Engine or Skill depends on a concrete Provider, Adapter, Infrastructure component, or external system;
7. automated architecture tests deliberately detect representative forbidden dependency directions;
8. unit, Contract/schema, and executable smoke tests pass;
9. formatting, linting, static analysis, dependency checks, and tests run through one local quality command and the same CI gate;
10. no external service, database, broker, container, network API, cognitive algorithm, or production deployment is required.

This milestone contains real executable code and creates a stable base for later Engine work while making the most important Foundation rules executable before architectural drift can accumulate.

## 9. Risks of Starting Implementation

- **Accidental technology mandate:** treating `docs/architecture.md` candidates as approved choices could lock the project to a stack without evaluating the bootstrap requirements.
- **Boundary drift before automation:** creating packages before defining and testing the allowed import graph could make Core purity and Engine independence conventional rather than enforceable.
- **Repository ambiguity:** following the lower-authority `src/` handoff summary or current `infraestructure/` spelling would diverge immediately from OES-0001.
- **Premature framework placement:** starting with a web framework may cause Gateway, configuration, framework models, or dependency injection to leak into Core.
- **Speculative abstractions:** inventing repositories, Event buses, provider ports, or cognitive Contracts without a concrete milestone need could fossilize guesses as platform APIs.
- **False distributed-system requirements:** selecting a broker, containers, or deployment topology before meaningful asynchronous collaboration exists adds operational complexity without validating architecture.
- **Weak reproducibility:** omitting a runtime version, lockfile, canonical commands, or CI quality gate makes boundary and test results environment-dependent.
- **Observability leakage:** adopting ad hoc logging before defining structured fields and redaction can expose sensitive information and create incompatible logging conventions.
- **Engine work without specifications:** implementing cognitive behavior before the appropriate Engine Specifications are approved would force behavior decisions into code, contrary to the documentation authority model.
- **Frozen-baseline confusion:** stale project-status prose must not be mistaken for authority; implementation must reference the `foundation-v1.0` tag and current authority hierarchy.

## 10. Proposed Next Step

Approve a compact **Implementation Bootstrap Decision Set** covering only Sections 5.1 through 5.7. It should record evaluated alternatives and the selected language/runtime, module map, package/build/dependency tools, test and architecture-check tools, formatter/linter/static analyzer, minimal configuration/logging conventions, and CI quality gate.

After that decision set is approved, implement Milestone M0 exactly as scoped above. Do not create Engine Specifications until the subsequent milestone selects the first real Engine capability, and do not select infrastructure until an approved use case requires it.

Implementation can begin safely once the minimum decision set is approved. No database, broker, container, backend framework, public API, external integration, cognitive behavior, or deployment decision is a prerequisite for M0.
