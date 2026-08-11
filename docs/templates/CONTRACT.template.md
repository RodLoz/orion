# CONTRACT-#### — <Descriptive Contract Name>

> Authoring template only. This file is non-normative, is not a Contract Specification, is not part of the `CONTRACT-####` identifier sequence, and carries no architectural authority. Copying this template does not create an Active Contract. Authority depends on the resulting document's lifecycle status and compliance with OES-0004, OES-0008, DOCUMENT-AUTHORITY, and applicable higher architectural authority.

| Field              | Value                         |
| ------------------ | ----------------------------- |
| **Status**         | Draft                         |
| **Version**        | `<x.y.z>`                     |
| **Semantic Owner** | `<capability or domain>`      |
| **Core Custodian** | `<Core custody statement>`    |
| **Created**        | `<YYYY-MM-DD>`                |
| **Updated**        | `<YYYY-MM-DD>`                |
| **Applies To**     | `<boundary and participants>` |

---

# Purpose

Describe:

- the shared semantic boundary being formalized;
- why the Contract exists;
- the already accepted architecture that it formalizes.

A Contract formalizes accepted architecture. It MUST NOT resolve unresolved architectural ownership or authority.

---

# Governing Architectural Authority

Identify applicable governing documents using repository-relative Markdown links:

- `<applicable ADRs>`;
- `<applicable Architecture or Concept Specifications>`;
- `<applicable OES governance>`;
- `<related Engine or other specifications, where relevant>`.

Conflicts are resolved according to DOCUMENT-AUTHORITY. Do not use this section to elevate lower-authority material.

---

# Semantic Ownership

**Semantic Owner:** `<capability or domain>`

Describe the semantic responsibilities already assigned to this owner by higher architectural authority.

Semantic ownership is not transferred by Contract authorship, implementation, custody, consumption, Provider participation, Adapter participation, storage, transport, or presentation.

---

# Core Custody

**Core Custodian:** `<Core custody statement>`

Describe custody of the shared Contract language where Core custody applies.

Core Custody does not confer capability semantics, runtime authority, implementation ownership, Bootstrap composition ownership, source authority, authority-verification ownership, Security authorization ownership, or protected-boundary enforcement ownership.

---

# Scope

## In Scope

- `<semantic responsibility or boundary>`

## Out of Scope

- `<excluded responsibility or concern>`

Keep programming languages, concrete APIs, schemas, transport, storage, deployment, and runtime algorithms out of scope unless higher architectural authority explicitly makes a characteristic architectural.

---

# Consumers

Identify capabilities or components that rely on the Contract's shared semantics and guarantees:

- `<consumer>` — `<reliance or obligation>`

Consumption does not transfer semantic ownership or architectural authority to a Consumer.

---

# Implementers / Providers

Identify conforming implementations, Providers, or Adapters only where applicable:

- `<implementer or provider role>` — `<conformance responsibility>`

Implementation participation does not confer semantic ownership. Provider or Adapter identity does not establish source identity, source authority, or authority-verification ownership unless higher architectural authority explicitly establishes that role.

Do not define concrete Provider or Adapter architecture here.

---

# Inputs

Describe semantic inputs without prescribing programming-language types or concrete field schemas.

| Input     | Semantic meaning | Owner     | Required?       |
| --------- | ---------------- | --------- | --------------- |
| `<input>` | `<meaning>`      | `<owner>` | `<yes/no/rule>` |

---

# Outputs

Describe semantic outputs without prescribing implementation-specific types.

| Output     | Semantic meaning | Owner     |
| ---------- | ---------------- | --------- |
| `<output>` | `<meaning>`      | `<owner>` |

---

# Guarantees / Invariants

- `<already accepted guarantee or invariant>`

Do not use this section to invent ownership, authority, orchestration, authorization, enforcement, currentness, incorporation, persistence, or implementation topology.

---

# Failure Semantics

Failure ownership follows the architectural responsibility that failed. Propagation, representation, transport, observation, storage, delivery, or consumption does not transfer originating ownership or semantic identity.

| Failure     | Owning responsibility | Meaning     | Propagation notes |
| ----------- | --------------------- | ----------- | ----------------- |
| `<failure>` | `<owner>`             | `<meaning>` | `<preservation>`  |

Do not prescribe retry, rollback, timeout, compensation, dead-letter, cancellation, or recovery mechanisms.

---

# Compatibility

Document:

- current semantic version: `<x.y.z>`;
- compatible Consumer expectations: `<expectations>`;
- additive or corrective compatibility considerations: `<considerations>`;
- breaking-change migration expectations: `<expectations>`.

Versioning and evolution follow OES-0010 and OES-0004. Architectural breaking changes require the accepted higher-authority decision, migration, documentation, and compatibility process before Contract publication. Do not define release mechanics here.

---

# Conformance / Testing Expectations

Identify implementation-neutral conformance evidence:

- `<executable Contract test expectation>`;
- `<capability, Provider, or Adapter conformance expectation where applicable>`;
- `<invariant that must be tested>`.

Tests and diagnostics provide conformance evidence. They are not architectural authority and do not replace the Contract Specification.

Do not prescribe a test framework.

---

# Authoring Guardrails

This Contract MUST NOT:

- invent unresolved architecture;
- contradict applicable higher authority;
- redefine capability or domain ownership;
- make executable code authoritative;
- define unauthorized implementation technology;
- transfer semantic ownership through consumption, custody, implementation, transport, or Provider/Adapter participation;
- treat filesystem placement alone as architectural authority.

---

# Canonical Location

The resulting canonical Contract Specification belongs under:

```text
docs/contracts/
```

Use the canonical filename pattern:

```text
CONTRACT-####-Descriptive-Contract-Name.md
```

Replace every placeholder before review. Do not treat this template file as the canonical Contract.

---

# References

Add repository-relative Markdown links to applicable:

- governing ADRs;
- Architecture and Concept Specifications;
- OES standards;
- Engine Specifications;
- related canonical Contract Specifications that already exist.

Do not link to nonexistent Contract documents.

---

# Change History

| Version     | Date           | Description     |
| ----------- | -------------- | --------------- |
| `<version>` | `<YYYY-MM-DD>` | `<description>` |
