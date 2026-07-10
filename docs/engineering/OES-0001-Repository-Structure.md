\# OES-0001 — Repository Structure



| Field | Value |

|--------|--------|

| \*\*Status\*\* | Active |

| \*\*Version\*\* | 1.0.0 |

| \*\*Owner\*\* | Project Maintainers |

| \*\*Created\*\* | 2026-07-09 |

| \*\*Updated\*\* | 2026-07-09 |

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



\---



\## services/



Contains Engine implementations.



Examples:



\- Brain Engine

\- Voice Engine

\- Memory Engine

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



\---



\## specifications/



Contains technical specifications.



Examples:



\- Voice protocol

\- Skill manifest

\- Memory schema

\- API definitions



Specifications describe behavior, not implementations.



\---



\## docs/



Contains all project documentation.



Subdirectories include:



\- engineering/

\- adr/

\- diagrams/

\- assets/



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

\- OES-0008 — Documentation Standards



\---



\# Engineering Motto



> A well-organized repository makes good architecture visible.

