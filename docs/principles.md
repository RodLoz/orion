# Engineering Principles

> *These principles define how O.R.I.O.N. is designed, built, and evolved.
> Every architectural decision, implementation, and contribution must follow them.
> If a proposal conflicts with these principles, the proposal must be reconsidered.*

---

# 1. Platform Over Application

O.R.I.O.N. is a platform.

Applications are clients.

The platform must continue to exist even if every client is replaced.

---

# 2. Intelligence Before Interface

The intelligence is the product.

Interfaces are only different ways of interacting with it.

The Core must never depend on any client implementation.

---

# 3. Capability-Oriented Architecture

Every system component exists because it provides a capability.

Examples:

- Voice
- Memory
- Knowledge
- Planning
- Reasoning
- Identity
- Automation
- Vision
- Security

Capabilities evolve independently.

---

# 4. The Core Must Remain Pure

The Core defines business concepts.

The Core may define platform-wide invariants, architectural policies, shared policy Contracts, and cross-capability constraints. Capability-specific business rules and semantic decisions belong to the owning Engine. Core custody of shared language must never create a second owner of capability behavior.

The Core never depends on:

- UI
- Frameworks
- AI providers
- Databases
- External APIs
- Cloud vendors

Dependencies always point toward the Core.

---

# 5. Contracts Before Implementations

Every interaction between components must happen through contracts.

The Core is the canonical custodian of shared architectural Contracts. Capability Engines own capability behavior and domain semantics; implementation layers implement or translate Contracts without changing those semantics.

Source-code dependencies point inward toward Core abstractions. Runtime call, data, and event-flow arrows must be labeled and must not be interpreted as source-code dependencies. The Core must not depend on Engines, Skills, Providers, Adapters, Infrastructure, or Clients; Engines and Skills must not depend on concrete external implementations.

Components communicate through interfaces rather than concrete implementations.

This allows engines to evolve independently.

---

# 6. Vendor Independence

O.R.I.O.N. must never become tied to a single provider.

Every external dependency must be replaceable.

Examples:

- LLM providers
- Speech providers
- Databases
- Authentication providers
- Cloud platforms

Replacing a provider should not require redesigning the platform.

---

# 7. Everything Is Replaceable

Every module should be considered temporary.

If a component cannot be replaced without breaking the system,
its design should be reconsidered.

---

# 8. Memory Is a Core Capability

Memory is not conversation history.

Memory represents intentionally retained experience and user continuity.

O.R.I.O.N. should distinguish between:

- Memory: what the platform has experienced
- Knowledge: what the platform accepts as true
- Context: what is relevant right now

This distinction is based on semantic role and authority, not persistence.

Knowledge is an independent platform capability owned by the Knowledge Engine.

Only the Knowledge capability governs whether a claim becomes accepted Knowledge. Memory may provide evidence or provenance, and external components may provide observations, but none of them may promote information into Knowledge independently.

---

# 9. Intelligence Before Automation

Automation without understanding creates fragile systems.

Every action should follow the same reasoning pipeline:

Understand

↓

Reason

↓

Decide

↓

Execute

---

# 10. Security by Design

Security is part of the architecture.

Never an afterthought.

Identity, permissions, auditability, and encryption must be considered from the beginning.

The Security Engine owns security policy and authorization decision semantics. Protected boundaries enforce those decisions through Contracts or governed policy artifacts without acquiring Security ownership or requiring direct Engine coupling.

---

# 11. Privacy First

Users own their information.

O.R.I.O.N. should collect only the data required to provide value.

Users should always be able to inspect, export, and delete their data.

---

# 12. Event-Driven Thinking

Whenever possible, components communicate through events rather than direct dependencies.

Loose coupling improves scalability and maintainability.

The Core custodies shared Event schemas; the applicable capability or domain owns Event semantics; and an authorized runtime component publishes only Events it is permitted to represent. Event publication is required only when a meaningful completed fact exists.

---

# 13. Documentation Is Part of the Product

Code without documentation is incomplete.

Every significant architectural decision must be documented.

Documentation evolves together with the code.

---

# 14. Build for the Next Decade

Every architectural decision should answer the following question:

> Would this still be a good decision if O.R.I.O.N. had millions of users ten years from now?

If the answer is no,
the design should be reconsidered.

---

# 15. Simplicity Over Cleverness

Simple systems scale.

Complexity should only exist when it provides measurable value.

Readable solutions are preferred over clever ones.

---

# Final Principle

O.R.I.O.N. is not built around technologies.

It is built around ideas.

Technologies will evolve.

The principles should remain.
