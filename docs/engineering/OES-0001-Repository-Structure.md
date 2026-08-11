\# OES-0001 — Repository Structure



| Field | Value |

|--------|--------|

| \*\*Status\*\* | Active |

| \*\*Version\*\* | 1.1.0 |

| \*\*Owner\*\* | Project Maintainers |

| \*\*Created\*\* | 2026-07-09 |

| \*\*Updated\*\* | 2026-08-10 |

| \*\*Applies To\*\* | Entire Repository |



\---



\# Purpose



This standard defines the official repository structure of O.R.I.O.N.



Every file, directory, and implementation must follow this organization.



The repository structure is part of the platform architecture and should remain stable over time.



\---



\# Scope



This standard applies to:



\- Source code

\- Documentation

\- Specifications

\- Infrastructure

\- Tooling

\- AI agents

\- Human contributors



\---



\# Repository Philosophy



The repository is organized by \*\*responsibility\*\*, not by technology.



Every directory has a single purpose.



If the purpose of a new file is unclear, its location should be reconsidered before implementation.



\---



\# Top-Level Structure



```text

orion/



apps/

core/

services/

packages/

specifications/



docs/

  contracts/

  templates/



infrastructure/



tools/



README.md

MANIFESTO.md

AGENTS.md

LICENSE

CHANGELOG.md

CONTRIBUTING.md

```



\---



\# Directory Responsibilities



\## apps/



Contains every client application.



Examples:



\- Mobile

\- Desktop

\- Watch

\- Web



Applications are presentation layers.



Business logic must not live here.



\---



\## core/



Contains the language of O.R.I.O.N.



Includes:



\- Contracts

\- Domain Models

\- Events

\- Interfaces

\- Exceptions

\- Types

\- Constants



The Core must remain framework-independent.



The optional `core/contracts/` path is reserved for executable or shared implementation artifacts when repository architecture permits their use. It is not the canonical document location for architectural Contract Specifications.



Core custody of shared Contract language does not make `core/contracts/`, `core/src/*-contracts.ts`, runtime validators, exported types, or conformance tests the authoritative source for Contract documentation. Executable surfaces MUST conform to applicable Active Contract Specifications.



\---



\## services/



Contains Engine implementations.



Examples:



\- Brain Engine

\- Voice Engine

\- Memory Engine

\- Knowledge Engine

\- Skill Engine



Services implement capabilities.



They do not define the domain language.



\---



\## packages/



Contains reusable libraries shared across multiple applications or services.



Examples:



\- SDK

\- Shared utilities

\- Common models



Packages should have no unnecessary dependencies.



The optional `packages/contracts/` path may support packaging or runtime distribution if later adopted by implementation architecture. It is not the canonical architectural Contract-document location, and its filesystem placement does not establish semantic ownership, Core custody, or documentary authority.



\---



\## specifications/



Contains technical specifications.



Examples:



\- Voice protocol

\- Skill manifest

\- Memory schema

\- API definitions



Specifications describe behavior, not implementations.



The `specifications/` directory retains its established Architecture, Concept, Engine, Flow, API, Protocol, Schema, and related specification responsibilities. Standalone canonical Contract Specifications reside under `docs/contracts/`; they are not competing copies of Engine, Concept, ADR, or other established specification families.



This placement is a repository-documentation rule. It does not change architectural ownership, and Core custody does not require Contract documentation to reside with executable Core surfaces.



\---



\## docs/



Contains all project documentation.



Subdirectories include:



\- engineering/

\- adr/

\- contracts/

\- templates/

\- diagrams/

\- assets/



The canonical location for architectural Contract Specifications is:



```text

docs/contracts/

```



Canonical Contract Specification files follow the naming convention defined by OES-0008:



```text

CONTRACT-####-Descriptive-Contract-Name.md

```



OES-0004 governs Contract content and evolution. DOCUMENT-AUTHORITY governs Contract authority and precedence. This standard governs repository placement only.



The `docs/templates/` directory contains authoring templates only. The future `docs/templates/CONTRACT.template.md` is an authoring aid and is not a normative Contract Specification.



A Contract document is canonical and authority-bearing only when it:



\- resides in `docs/contracts/`;

\- follows the OES-0008 Contract identity and filename convention;

\- satisfies OES-0004 governance;

\- has an authority-bearing lifecycle status under DOCUMENT-AUTHORITY.



Filesystem placement alone is insufficient. A Markdown file outside `docs/contracts/` does not become a canonical Contract Specification merely because its title or contents use the word Contract.



There MUST be one canonical Contract document for one Contract identity. Canonical copies MUST NOT be duplicated across `docs/contracts/`, `core/contracts/`, `packages/contracts/`, `specifications/`, or Engine Specifications. Other documents and executable surfaces MAY reference, summarize, implement, represent, or test the canonical Contract, but they MUST NOT act as competing canonical copies.



Executable Contract surfaces include Core TypeScript interfaces and types, runtime validators, shared request/result/failure definitions, and conformance tests. These surfaces MAY implement or represent canonical Contract semantics, but they are not canonical architectural documents and gain no authority from filesystem location.



Documents referring to a canonical Contract Specification MUST resolve their relative Markdown links to the applicable canonical file under `docs/contracts/`. This rule creates no Contract identifier, document, index, alias, symlink, or generated copy.



\---



\## infrastructure/



Contains deployment-related resources.



Examples:



\- Docker

\- Kubernetes

\- Terraform

\- CI/CD



Infrastructure must not contain business logic.



\---



\## tools/



Contains scripts and utilities used during development.



Examples:



\- Code generation

\- Development automation

\- Documentation tools



\---



\# Directory Ownership



Each directory should have one primary responsibility.



Responsibilities must not overlap.



When overlap appears, architecture should be reviewed.



\---



\# Adding New Directories



Before creating a new directory, contributors should ask:



\- Does an existing directory already serve this purpose?

\- Is this responsibility permanent?

\- Will other components reuse it?

\- Is documentation required?



New top-level directories require an ADR.



\---



\# Forbidden Practices



Avoid:



\- Generic folders such as misc/, temp/, utils/ without a clear purpose.

\- Mixing documentation with implementation.

\- Business logic inside applications.

\- Framework-specific code inside the Core.

\- Duplicate folder structures.



\---



\# Repository Evolution



The repository is expected to evolve.



Changes should improve clarity rather than increase complexity.



Major structural changes require:



\- Documentation updates.

\- Repository review.

\- Architecture review.

\- ADR approval.



\---



\# Success Criteria



The repository structure is successful when:



\- Contributors immediately know where new code belongs.

\- AI agents can navigate the repository without ambiguity.

\- Responsibilities remain clearly separated.

\- Architectural boundaries remain visible.



\---



\# Related Standards



\- OES-0000 — Engineering Philosophy

\- OES-0002 — Engine Design

\- [OES-0004 — Contracts](OES-0004-Contracts.md)

\- [OES-0008 — Documentation Standards](OES-0008-Documentation-Standards.md)

\- [DOCUMENT-AUTHORITY — Documentation Authority](../DOCUMENT-AUTHORITY.md)

\- [ARCH-0001 — Core Architecture](../../specifications/architecture/ARCH-0001-Core-Architecture.md)



\---



\# Change History



| Version | Date       | Description |

| ------- | ---------- | ----------- |

| 1.1.0   | 2026-08-10 | Established `docs/contracts/` as the canonical Contract Specification location and distinguished canonical documents from executable, packaged, template, and other specification artifacts. |



\---



\# Engineering Motto



> A well-organized repository makes good architecture visible.

