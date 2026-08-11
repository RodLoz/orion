# CONTRACT-0001 — Context Source Retrieval Contract

| Field              | Value                                                              |
| ------------------ | ------------------------------------------------------------------ |
| **Status**         | Active                                                             |
| **Version**        | 1.0.0                                                              |
| **Semantic Owner** | Context                                                            |
| **Core Custodian** | Core                                                               |
| **Created**        | 2026-08-10                                                         |
| **Updated**        | 2026-08-10                                                         |
| **Applies To**     | Context retrieval collaboration with qualified source capabilities |

---

# Purpose

This Contract formalizes the Context-owned collaboration through which:

1. Context initiates a source-directed retrieval need during Context Revision preparation;
2. a qualified source interprets and executes that request within its own semantic boundary;
3. the source returns source-owned material and source-result semantics; and
4. that material becomes candidate material available for Context consideration.

The Contract ends at candidate availability. It does not perform cross-source aggregation, Contextual Currentness determination, Context incorporation, Context validation, Context activation, authority verification, authorization, Brain orchestration, or Bootstrap composition.

This Contract formalizes responsibilities already established by higher architectural authority. It does not resolve or originate architectural ownership or authority.

---

# Governing Architectural Authority

While Active, CONTRACT-0001 is authoritative within its accepted semantic boundary according to [DOCUMENT-AUTHORITY](../DOCUMENT-AUTHORITY.md). Applicable executable Contract surfaces and Engine specifications must conform within that boundary. The Contract remains subordinate to applicable higher architectural authority, and Active status does not transfer Semantic Ownership, Core Custody, or any participant responsibility.

## Governing Decisions

- [ADR-0008 — Context Collaboration, Source Ownership, and Reference Authority](../adr/ADR-0008-Context-Collaboration-Source-Ownership-and-Reference-Authority.md)
- [ADR-0009 — Context Revision Preparation, Reference Stability, and Source Change](../adr/ADR-0009-Context-Revision-Preparation-Reference-Stability-and-Source-Change.md)
- [ADR-0010 — Context Retrieval Initiation, Request, and Result Semantics](../adr/ADR-0010-Context-Retrieval-Initiation-Request-and-Result-Semantics.md)
- [ADR-0011 — Source Currentness, Contextual Currentness, and Currentness Change](../adr/ADR-0011-Source-Currentness-Contextual-Currentness-and-Currentness-Change.md)
- [ADR-0012 — Authorization Semantics, Enforcement, and Authorized-Reference Applicability](../adr/ADR-0012-Authorization-Semantics-Enforcement-and-Authorized-Reference-Applicability.md)
- [ADR-0013 — Failure Ownership, Propagation, and Candidate Context Revision Consequences](../adr/ADR-0013-Failure-Ownership-Propagation-and-Candidate-Context-Revision-Consequences.md)
- [ADR-0014 — Bootstrap Composition Responsibility and Ownership and Authority Preservation](../adr/ADR-0014-Bootstrap-Composition-Responsibility-and-Ownership-and-Authority-Preservation.md)
- [ADR-0017 — Execution Model Independence for Asynchronous, Event-Driven, and Distributed Collaboration](../adr/ADR-0017-Execution-Model-Independence-for-Asynchronous-Event-Driven-and-Distributed-Collaboration.md)
- [ADR-0018 — Refresh, Recollection, and Repeated Context Preparation Boundaries](../adr/ADR-0018-Refresh-Recollection-and-Repeated-Context-Preparation-Boundaries.md)
- [ADR-0019 — Configurable Retrieval Policy Ownership Boundary](../adr/ADR-0019-Configurable-Retrieval-Policy-Ownership-Boundary.md)

## Conceptual Authority

- [CONCEPT-0003 — Context Model](../../specifications/concepts/CONCEPT-0003-Context-Model.md)
- [CONCEPT-0001 — Memory Model](../../specifications/concepts/CONCEPT-0001-Memory-Model.md), where Memory later participates as a source specialization
- [CONCEPT-0002 — Knowledge Model](../../specifications/concepts/CONCEPT-0002-Knowledge-Model.md), where Knowledge later participates as a source specialization

## Governance

- [OES-0001 — Repository Structure](../engineering/OES-0001-Repository-Structure.md)
- [OES-0004 — Contracts](../engineering/OES-0004-Contracts.md)
- [OES-0008 — Documentation Standards](../engineering/OES-0008-Documentation-Standards.md)
- [OES-0010 — Versioning Standards](../engineering/OES-0010-Versioning-Standards.md)

## Implementation Context

- [ENGINE-0003 1.1.0 — Context Engine Authority Revision](../../specifications/engines/context/ENGINE-0003-Context-Engine-Authority-Revision-1.1.0.md)

The Context Engine specification describes the current Identity-only implementation milestone. It is implementation context and does not override the governing ADRs, the Context Concept, or this Contract within this Contract's accepted boundary once Active.

---

# Semantic Ownership

**Semantic Owner:** Context

Context owns:

- retrieval initiation;
- retrieval-request semantics;
- the purpose for which returned material becomes available as candidate material;
- aggregate returned-set purpose outside this single-source operation; and
- later Contextual Currentness and incorporation responsibilities outside this Contract.

Each participating source retains:

- interpretation of a valid source-directed request;
- retrieval execution within its source boundary;
- returned-material semantics;
- source-result semantics;
- source and domain attribution;
- authority origin and applicable authority-verification ownership;
- source lifecycle responsibilities; and
- Source Currentness.

This allocation does not create shared, composite, emergent, or ownerless semantic ownership. Context ownership of the collaboration does not transfer source-domain meaning to Context, and source participation does not transfer Context request semantics to the source.

---

# Core Custody

**Core Custodian:** Core

Core maintains the shared Contract language and may custody future executable conformance surfaces.

Core custody does not confer Context semantics, source semantics, retrieval behavior, runtime authority, implementation ownership, authority-verification ownership, Security authorization ownership, protected-boundary enforcement ownership, Source Currentness, Contextual Currentness, Context incorporation, or Bootstrap composition ownership.

---

# Scope

## In Scope

- Context-owned source-directed retrieval-request semantics;
- source-owned request interpretation;
- source-owned retrieval execution;
- source-owned returned material and source-result semantics;
- issuing-source and domain attribution preservation;
- candidate availability for Context consideration; and
- failure propagation that preserves originating ownership and semantic identity.

## Out of Scope

- cross-source aggregation;
- Contextual Currentness determination;
- Context incorporation and incorporated-reference-set closure;
- Context validation and activation;
- issuer authority-verification mechanisms;
- Security authorization mechanisms;
- protected-boundary enforcement mechanisms;
- refresh, recollection, and repeated Context preparation mechanisms;
- Brain orchestration and final-result ownership;
- Bootstrap composition;
- transport, serialization, concrete APIs, schemas, and payload shapes;
- persistence, Logical Reconstruction, Exact Replay, and historical reproduction;
- configurable ranking, scoring, relevance, preference, selection, and source-priority rules; and
- runtime sequencing, topology, deployment, and implementation algorithms.

---

# Consumers

- **Context** — primary semantic consumer of source results for candidate consideration during Context Revision preparation.
- **Conformance and composition participants** — may rely on this shared boundary when verifying or assembling approved implementations without acquiring its semantics.

Brain is not a consumer of raw source results under this Contract. Brain consumes the authoritative Context output through its separately governed boundary.

Consumption does not transfer Context ownership, source ownership, authority, currentness ownership, or architectural authority to the Consumer.

---

# Implementers / Providers

Qualified source capabilities may implement the source side of this Contract within their accepted semantic boundaries. Memory and Knowledge may later specialize that source-side participation but are not generic Contract owners.

Providers and Adapters may expose, translate, host, transform, transport, or otherwise support source behavior where higher architecture permits. That participation does not make a Provider or Adapter:

- the Contract Semantic Owner;
- the issuing source merely through implementation or placement;
- the authority origin or authority verifier;
- the authorization owner or enforcement owner;
- the Source Currentness or Contextual Currentness owner; or
- the Context incorporation owner.

This Contract does not define concrete Provider or Adapter architecture.

---

# Inputs

The following are semantic inputs, not programming-language fields or a concrete request schema.

| Semantic Input                        | Owner                                     | Meaning                                                                                                                                                                | Required                       |
| ------------------------------------- | ----------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------ |
| Context retrieval need                | Context                                   | Context's need for potentially relevant cognitive references during Context Revision preparation                                                                       | Yes                            |
| Intended qualified source or domain   | Context collaboration                     | The accepted source boundary asked to interpret and execute the request                                                                                                | Yes                            |
| Accepted retrieval constraints        | Owner of the decision being parameterized | Architecturally accepted constraints that may qualify the request without creating ownership, authority, permission, currentness, ranking, selection, or incorporation | When applicable                |
| Candidate-preparation association     | Context                                   | Association of retrieval with present Context Revision preparation without requiring a particular identifier or representation                                         | Yes, semantically              |
| Permitted-participation applicability | Security                                  | Association with the applicable Security-owned authorization decision that permits participation                                                                       | When the boundary is protected |

This Contract does not define TypeScript fields, DTOs, query syntax, pagination, headers, timeouts, ranking parameters, serialization, or a mandatory Context Revision identifier.

---

# Outputs

The following are semantic outputs, not an implementation-specific result schema.

| Semantic Output                        | Owner                                | Meaning                                                                                         |
| -------------------------------------- | ------------------------------------ | ----------------------------------------------------------------------------------------------- |
| Returned source material or references | Participating source                 | Source-owned material made available in response to the valid source-directed request           |
| Source result                          | Participating source                 | The source-owned meaning of the retrieval result within its domain                              |
| Issuing-source or domain attribution   | Issuing source                       | Identifiable origin of the returned material and its source-domain meaning                      |
| Authority-origin association           | Issuing source                       | Preservation of the source or issuer from which reference authority originates                  |
| Source revision identity               | Issuing source                       | Version-identifiable source revision where the source establishes one and it is applicable      |
| Source-owned currentness information   | Applicable source lifecycle boundary | Source Currentness information where the source has made the applicable determination           |
| Authorization applicability            | Security                             | Association of the applicable Security-owned authorization decision with the permitted material |

Returned material becomes candidate material available for Context consideration. Return does not establish incorporation, Contextual Currentness, completed authority verification, authorization merely from possession, Context validation, Context activation, or transfer of aggregate ownership.

This Contract does not define a Candidate Reference schema.

---

# Guarantees / Invariants

1. Context owns retrieval initiation and retrieval-request semantics.
2. Each participating source owns request interpretation, retrieval execution, returned-material semantics, and source-result semantics within its source boundary.
3. Returned material is candidate material; candidate availability is not incorporation.
4. Retrieval or return does not establish authority, completed authority verification, authorization, Source Currentness merely from return, Contextual Currentness, ranking ownership, selection ownership, or incorporation.
5. Issuing-source and domain attribution remains identifiable across the boundary.
6. Context and source ownership survive request, execution, return, delivery, representation, and consumption.
7. Later aggregation does not transfer source-reference or source-result semantics to Context and does not itself constitute incorporation.
8. Synchronous, asynchronous, event-driven, local, distributed, Provider-mediated, Adapter-mediated, or transport-mediated execution does not change semantic ownership.
9. A later source, lifecycle, or currentness change does not mutate a Context Revision whose incorporated-reference set is stable or whose lifecycle state is Active or historical.
10. Context alone retains later Contextual Currentness and incorporation responsibility for the applicable candidate Context Revision.

---

# Aggregate Boundary

Aggregate returned-set semantics across participating sources remain Context-owned and are outside this single-source Contract.

An individual source result may later participate in a Context-owned aggregate candidate set. Aggregation does not transfer source ownership or source-result meaning and does not itself constitute incorporation.

This Contract defines no aggregate Contract, schema, ranking, or selection procedure.

---

# Authority Verification

Issuing-source attribution must remain identifiable, and authority origin remains with the applicable source or issuer. Retrieval success is not authority verification and does not make Context the authority verifier.

Applicable authority verification remains an issuer-owned, separately governed boundary. This Contract neither performs nor defines a verification protocol.

---

# Authorization / Enforcement

Participation at a protected retrieval boundary must be permitted by the applicable Security-owned authorization decision. The applicable protected boundary enforces that decision without acquiring Security semantics.

Context initiation is not authorization. Source execution is not authorization. Returning, receiving, or possessing a result does not prove, recreate, renew, or broaden authorization.

Authorization ownership and protected-boundary enforcement ownership do not transfer through retrieval participation, return, receipt, or possession.

This Contract defines no access-control mechanism or authorization representation.

---

# Currentness

**Source Currentness** is owned by the applicable issuing-source or source-lifecycle boundary and concerns standing within that source boundary.

**Contextual Currentness** is owned by Context and concerns suitability for the particular candidate Context Revision under preparation.

The Contract may preserve source-owned currentness or source-revision information where applicable. A returned reference is not thereby source-current, and a source-current reference is not thereby contextually current.

This Contract defines no time-to-live value, freshness interval, timestamp rule, threshold, or currentness algorithm.

---

# Candidate Availability and Incorporation

Returned material is candidate material available for Context consideration.

Availability or delivery:

- is not Context incorporation;
- does not close the incorporated-reference set;
- does not perform Contextual Currentness determination;
- does not perform Context validation; and
- does not activate a Context Revision.

Context alone retains the later responsibility for Contextual Currentness, incorporation, incorporated-reference-set closure, validation, and activation under their separately governed boundaries.

---

# Failure Semantics

Failure ownership follows the architectural responsibility whose semantic boundary failed. Propagation preserves originating ownership and semantic identity.

| Failure                                           | Owning responsibility | Meaning                                                                             | Propagation notes                                                 |
| ------------------------------------------------- | --------------------- | ----------------------------------------------------------------------------------- | ----------------------------------------------------------------- |
| Invalid retrieval-request semantics               | Context               | The Context-owned retrieval need or source-directed request meaning is invalid      | Remains Context-owned across delivery or observation              |
| Source request-interpretation failure             | Participating source  | The source fails to interpret a valid source-directed request within its domain     | Remains source-owned when propagated to Context                   |
| Source retrieval-execution failure                | Participating source  | Source-owned retrieval execution fails                                              | Remains source-owned when represented, delivered, or consumed     |
| Source returned-material or source-result failure | Participating source  | Production or semantic validation of source-owned returned material or result fails | Remains source-owned; candidate consequences do not reclassify it |

The following failures are adjacent referenced boundaries and are not absorbed by this Contract:

- issuer authority-verification failure remains issuer or source-owned;
- authorization-decision failure remains Security-owned;
- protected-boundary enforcement failure remains owned by the applicable enforcement responsibility;
- cross-source aggregate failure remains Context-owned;
- Contextual Currentness, incorporation, validation, and activation failures remain Context-owned.

Context may own a distinct consequence for the candidate Context Revision under preparation. That consequence does not transfer or reinterpret the originating source, Security, enforcement, transport, or other failure.

This Contract defines no retry, timeout, fallback, recovery, rollback, compensation, dead-letter, cancellation, or failure-disposition mechanism.

---

# Execution-Model Independence

The semantics and ownership allocations in this Contract remain unchanged across:

- synchronous and asynchronous execution;
- direct and event-driven delivery;
- process, service, host, and deployment boundaries;
- local and distributed execution;
- Provider or Adapter participation; and
- transport or serialization choices.

Communication form and runtime placement do not establish retrieval meaning, ownership, authority, authorization, currentness, incorporation, or failure ownership. This Contract does not prescribe runtime sequencing.

---

# Refresh / Recollection Applicability

This Contract may apply when Context performs retrieval during initial or later Context Revision preparation.

Use of this Contract is not by itself refresh, recollection, repeated Context preparation, successor creation, incorporation, validation, activation, or Brain cognitive execution. Refresh does not necessarily initiate retrieval, and recollection may make candidate material available without rerunning retrieval.

All later preparation preserves prior Context Revision identity, stability, lifecycle, and historical evidence boundaries.

---

# Source-Specialization Compatibility

## Memory

Memory may later specialize the source side while preserving Memory-owned request interpretation, retrieval execution, returned-material and source-result semantics, provenance, historical applicability, and Memory lifecycle ownership.

Such specialization must not transfer Context request semantics to Memory, make retained historical evidence presently applicable merely through retrieval, or give Memory Contextual Currentness or incorporation ownership. This Contract does not define the Memory specialization.

## Knowledge

Knowledge may later specialize the source side while preserving Knowledge-owned request interpretation, retrieval execution, accepted Knowledge identity and version, provenance, returned-material and source-result semantics, and Knowledge lifecycle ownership.

Knowledge confidence remains metadata within the Knowledge boundary and does not establish authority, authorization, Source Currentness, Contextual Currentness, ranking, selection, or incorporation. This Contract does not define the Knowledge specialization.

---

# Compatibility

**Current semantic version:** 1.0.0 Active

Compatible Consumers and implementers must preserve:

- the Context-owned request boundary;
- source-owned interpretation, execution, returned material, and result semantics;
- attribution and ownership across participation;
- candidate availability as distinct from incorporation;
- adjacent authority, authorization, currentness, and failure owners; and
- execution-model independence.

Future additive source specializations may define source-specific semantics within an already accepted source boundary while conforming to this generic Contract. They must not redefine the generic ownership allocation.

Breaking changes to ownership, authority, request purpose, result meaning, candidate availability, or adjacent responsibility boundaries require applicable higher-authority architectural approval, migration documentation, compatibility assessment, and Contract version evolution under OES-0004 and OES-0010.

No generic executable Context-to-source conformance surface currently exists. Existing Identity, Memory, and Knowledge operations remain capability-specific and are not declared conformant with this Contract. Future executable surfaces may evolve deliberately to conform; implementation status does not create or weaken architectural authority.

---

# Conformance / Testing Expectations

Future implementation-neutral conformance evidence must demonstrate that:

1. Context controls retrieval-request semantics;
2. each source controls its interpretation, execution, returned material, and source result;
3. issuing-source and domain attribution survive return;
4. candidate availability does not perform incorporation, Contextual Currentness, validation, or activation;
5. failure propagation preserves originating ownership and semantic identity;
6. Contract meaning does not depend on transport, execution model, Provider identity, Adapter identity, or deployment placement; and
7. source specialization does not transfer Context or source semantic ownership.

Tests and diagnostics are conformance evidence, not architectural authority. This Contract prescribes no programming language, test framework, file layout, runtime, or concrete test mechanism.

---

# Authoring Guardrails

This Contract must not be used to:

- invent unresolved architecture or contradict higher authority;
- redefine Context, source, Security, enforcement, Brain, Bootstrap, or Core responsibilities;
- make executable code or current implementation state authoritative;
- define unauthorized APIs, schemas, transport, persistence, deployment, or runtime algorithms;
- transfer ownership through consumption, custody, implementation, delivery, or Provider/Adapter participation; or
- treat filesystem placement or lifecycle status alone as architectural authority.

---

# Canonical Location and Contract Identity

This Contract resides in the canonical Contract-document directory:

```text
docs/contracts/
```

Its filename and title use the allocated `CONTRACT-0001` identifier. Identifier allocation established canonical Contract identity but did not itself grant architectural authority.

Active lifecycle status makes CONTRACT-0001 authoritative within its accepted semantic boundary, subject to applicable higher architectural authority. Identifier allocation and activation remain distinct lifecycle actions.

---

# References

The governing references for this Contract are listed in [Governing Architectural Authority](#governing-architectural-authority). No nonexistent Contract Specification is referenced.

---

# Change History

| Version | Date       | Description                                                                                                                                              |
| ------- | ---------- | -------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1.0.0   | 2026-08-10 | Initial Draft approved as Active, formalizing the Context-owned source-retrieval collaboration and ownership-preserving candidate-availability boundary. |
