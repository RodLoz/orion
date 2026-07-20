# IMPLEMENTATION-M0 — Executable Architectural Skeleton

## Objective

Prove that the frozen `foundation-v1.0` architecture can be represented, executed, tested, and mechanically enforced in a TypeScript modular monorepo without implementing cognitive behavior or introducing deferred Infrastructure.

## Approved Technology Baseline

- TypeScript 5.9 in strict mode
- Node.js 24
- pnpm 11 workspaces
- TypeScript project references
- Vitest
- ESLint
- Prettier
- dependency-cruiser
- GitHub Actions
- environment-variable configuration
- console-backed JSON structured logging

These are M0 implementation choices. They do not replace or redefine architectural Contracts and do not authorize a backend framework, external Provider, or deployment topology.

## Implemented Scope

- framework-free Core capability, registry, diagnostic, and logging Contracts;
- a concrete in-memory capability registry owned by the bootstrap runtime;
- deterministic external bootstrap configuration with safe local defaults;
- a console-backed structured logger with no vendor dependency;
- an explicit runtime composition function;
- one real M0 diagnostic capability descriptor;
- an executable architectural diagnostic;
- unit, Contract, configuration, and smoke tests;
- automated dependency-boundary validation;
- local aggregate validation and matching CI quality gate.

No cognitive Engine behavior is implemented.

## Explicitly Deferred

- backend and HTTP/API frameworks;
- Gateway transport;
- databases, ORM, persistence, and vector storage;
- Event broker and message queue;
- containers and orchestration;
- cloud and deployment topology;
- AI/LLM Providers and external integrations;
- production observability vendors;
- clients;
- cognitive Engines, Skills, and their behavior.

## Repository Mapping

| Path                  | Foundation responsibility                                           | M0 content                                                                                                |
| --------------------- | ------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------- |
| `core/`               | Framework-independent platform language and shared Contract custody | Capability identifiers/descriptors, registry Contract, diagnostic result, structured logger Contract      |
| `services/bootstrap/` | Runtime composition outside Core                                    | Registry implementation, environment configuration, console logger, diagnostic composition and executable |
| `.github/workflows/`  | CI resources                                                        | Validation workflow only                                                                                  |

No empty future-capability modules are created.

## Validation Commands

Prerequisites: Node.js 24 and pnpm 11.15.0. No external service or secret is required.

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

Optional diagnostic configuration:

| Environment variable   | Default               | Purpose                                                           |
| ---------------------- | --------------------- | ----------------------------------------------------------------- |
| `ORION_RUNTIME_NAME`   | `orion-m0`            | Local runtime label used in diagnostics                           |
| `ORION_LOG_LEVEL`      | `info`                | Minimum structured log level: `debug`, `info`, `warn`, or `error` |
| `ORION_CORRELATION_ID` | `orion-m0-diagnostic` | Deterministic diagnostic correlation identifier                   |

## Acceptance Criteria

- workspace installs from the pnpm lockfile;
- TypeScript project references build successfully in strict mode;
- Core has no outward source-code dependencies;
- the registry registers metadata, rejects duplicates, and inspects deterministically;
- configuration parsing is deterministic and externally supplied;
- diagnostic execution emits a JSON-compatible structured record and succeeds;
- all unit, Contract, configuration, smoke, lint, format, type, and architecture checks pass;
- CI invokes the same `pnpm validate` command used locally;
- no deferred technology or cognitive behavior is present.

## Known Limitations

- the registry is intentionally process-local and stores capability metadata only;
- the diagnostic capability is the only registered capability;
- logging writes to a supplied sink or the console and has no timestamps or remote transport;
- configuration supports only the values required by M0;
- there is no Gateway, persistence, Event infrastructure, external integration, or production runtime topology;
- architectural dependency rules cover the modules that actually exist in M0 and must grow when approved module types are introduced.

## Next Milestone Recommendation

Select the first real capability for implementation, approve its Engine Specification, and extend the executable skeleton with only that Engine’s necessary Contracts, behavior, tests, Security boundary, configuration, and observability. Preserve the current dependency checks and add rules only when new concrete module categories are introduced.
