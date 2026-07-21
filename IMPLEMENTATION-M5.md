# IMPLEMENTATION-M5 — Reasoning Engine Vertical Slice

## Objective

M5 proves a framework-free deterministic Reasoning capability that evaluates exactly one prepared Active Context Revision without implementing general AI or orchestration.

## Governing Specification

The implementation follows Active `ENGINE-0006 — Reasoning Engine`, foundation-v1.0, and the accepted Context, Memory, and Knowledge Contracts.

## Implemented Scope

M5 includes Core Reasoning values and one Evaluate Reasoning Contract, a stateless Reasoning Engine, Bootstrap composition, diagnostics, tests, and architecture enforcement.

## Reasoning Domain Model

Core defines Reasoning Query, Outcome Category, Candidate Conclusion, Candidate Response, Candidate Next Action, Context Consumption Reference, Explainability Summary, and Reasoning Outcome. Public factories validate unknown runtime data and reconstruct deeply immutable graphs.

## Active Context Consumption

Each evaluation accepts exactly one complete M2 Context Revision and reconstructs it defensively. Only Active lifecycle state is admissible. Reasoning neither calls nor mutates Context. Tests prove that hostile nested Context getters map to Invalid Active Context and that caller-owned Context graphs remain unfrozen and unchanged after both Context-normalization and later-boundary failures.

## Memory Input Boundary

Omission becomes an empty collection. Explicit collections contain zero through twenty exact M3 Memory References, are dense, and prohibit duplicate identities. Invalid collections or items fail as Invalid Memory Reference. Reasoning performs no Memory operation.

## Knowledge Input Boundary

Omission becomes an empty collection. Explicit collections contain zero through twenty exact current M4 Knowledge References and prohibit duplicates. The protected caller owns semantic freshness; Reasoning validates structure only and never calls Knowledge.

## Deterministic Rule Set

The ordered rules are Anonymous, Authenticated with Knowledge, Authenticated with Memory only, and Authenticated Context only. Anonymous has first precedence; Knowledge wins over Memory for authenticated requests containing both.

## Reasoning Outcome

Each successful evaluation returns one completed immutable Outcome. It has no identity and is not persisted.

## Candidate Conclusion

Controlled conclusion text is bounded to 1–1024 Unicode code points. It is a reasoning result, never accepted Knowledge.

## Candidate Response

Controlled response text is bounded to 1–2048 Unicode code points. It is proposed material for future orchestration, not final delivery.

## Candidate Next Action

The advisory vocabulary is `none` or `request-more-context`. It performs no action and invokes no Planning, Skill, or tool.

## Explainability

Explainability contains the consumed Context reference, Identity category, Memory and Knowledge reference counts, and selected rule category. It contains no query, content, claim, or chain-of-thought.

## Contracts

Core custodies the single Evaluate Reasoning Contract and all Reasoning-domain failures. There is no Store, Provider, persistence, or Brain Contract.

## Reasoning Engine

The engine validates prepared inputs, evaluates one deterministic rule, and constructs a deeply immutable Outcome. It retains no request or history.

## Brain / Reasoning Boundary

Reasoning evaluates; future Brain orchestration selects capabilities and assembles final cognitive results. M5 implements no Brain behavior.

## Bootstrap Composition

Bootstrap explicitly constructs, initializes, and starts one Reasoning Engine without a DI framework or service-locator lookup.

## Diagnostic Demonstration

Diagnostics exercise Anonymous, authenticated Knowledge, authenticated Memory-only, authenticated Context-only, and combined-reference precedence branches using privacy-safe booleans.

## Failure Semantics

M5 implements Invalid Reasoning Input, Invalid Active Context, Inactive Context, Invalid Reasoning Query, Invalid Memory Reference, Invalid Knowledge Reference, Reasoning Rule Failure, and Invalid Reasoning State.

## Validation Precedence

Validation stops at the first failure in this order: top-level request, Context structure, Context lifecycle, Query, Memory References, Knowledge References, then rule evaluation. Top-level keys are discovered once; optional-field presence is captured in a safe local descriptor; and each public field is then read exactly once inside its owning protected boundary. Throwing Context, Query, Memory, and Knowledge getters therefore map to their respective specific failures, while hostile key or descriptor discovery maps to Invalid Reasoning Input.

## Runtime Boundary Safety

All public inputs are treated as unknown. Nulls, primitives, arrays, sparse collections, unexpected fields, coercible values, malformed nested inputs, duplicates, stateful getters, thrown primitive or object values, and hostile Proxies normalize to the owning domain failure. Text factories explicitly reject empty and populated arrays without coercion. Explainability Summary and Reasoning Outcome factories are tested against complete malformed top-level primitive, function, array, missing-field, and unexpected-field matrices. Omission alone creates an empty Reference collection; explicit `undefined` is invalid. Collections are dense arrays with at most twenty items and no unexpected enumerable string or symbol properties. Standard non-enumerable array properties such as `length` remain valid.

## Privacy and Observability

Diagnostics expose operational facts only. They omit raw queries, conclusions, responses, Context identities, Memory identities, Knowledge identities, content, claims, chain-of-thought, credentials, and tokens.

## Architectural Enforcement

Dependency rules prevent Core from depending outward and prevent Reasoning from depending on Bootstrap, infrastructure, other Engine implementations, or external packages. Isolated fixtures verify each Reasoning prohibition. `ReasoningEngine` has a zero-argument construction surface and accepts only Core-owned input values, providing a runtime structural proof that Context, Memory, and Knowledge Engine collaborators cannot be called.

## Tests

The final suite contains 400 passing tests across 21 test files. It covers every Core Reasoning factory; BMP, non-BMP, mixed, lower, maximum, and one-above text bounds; text-array rejection; complete malformed Explainability Summary and Reasoning Outcome top-level matrices; defensive reconstruction; hostile getters and Proxy traps; complete Context metadata, fragment, projection, parent, lifecycle, inherited M2 timestamp validation, and failure-path non-mutation; omission versus explicit `undefined`; dense and exact arrays; exact twenty-item acceptance; enumerable string and symbol property rejection for both Reference collections; empty, over-bound, coercible, and otherwise invalid Reference identities and Versions; duplicates; all eight rule/reference combinations with exact controlled outputs; repeated and permutation determinism; validation precedence; zero-collaborator operation; Bootstrap diagnostics; privacy; and isolated architecture fixtures.

## Validation Commands

`pnpm install --frozen-lockfile`, `pnpm build`, `pnpm typecheck`, `pnpm test`, `pnpm lint`, `pnpm format:check`, `pnpm architecture`, `pnpm diagnostic`, and `pnpm validate` are the required gates. Diagnostics are additionally run at debug, info, warn, and error levels.

## Acceptance Criteria

M5 is ready for review when ENGINE-0006 is Active, protected single-read extraction produces exact domain failures, optional collection and exact-array behavior is proven, every rule and controlled output is deterministic, output is immutable, diagnostics are private, architecture checks pass, prior milestones remain green, and no external service is required.

## Explicitly Deferred

LLMs, Providers, prompts, Brain, Planning, Skills, tools, search, persistence, Events, Memory retrieval, Knowledge acceptance, Context mutation, chain-of-thought storage, final delivery, and voice rendering remain deferred.

## Known Limitations

M5 is intentionally categorical. It treats query text as opaque, consumes only prepared references, performs no semantic freshness check, and retains no reasoning history. Context timestamp acceptance intentionally inherits the accepted M2 Core validator—including its existing calendar-normalization behavior—rather than silently narrowing M2 semantics inside Reasoning. The hostile-input coverage is limited to the public Core factories and Reasoning input structures governed by ENGINE-0006; it does not claim behavior for deferred capabilities.

## Next Milestone Recommendation

Proceed only after formal M5 implementation review. A future milestone should specify the next capability independently without broadening Reasoning ownership implicitly.
