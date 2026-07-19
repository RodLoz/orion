# Architecture

> O.R.I.O.N. is designed as an AI Operating Network built around capabilities, engines, contracts, and replaceable implementations.

---

# 1. Architectural Style

O.R.I.O.N. follows a capability-oriented architecture inspired by:

- Hexagonal Architecture
- Clean Architecture
- Event-Driven Architecture
- Modular Systems
- AI Orchestration

The platform must be designed so that the Core remains independent from clients, providers, databases, frameworks, and external ecosystems.

---

# 2. High-Level Overview

The following diagram is a Runtime Interaction Flow. Its arrows do not represent source-code dependency direction.

```text
Clients
  Mobile
  Desktop
  Watch
  Web
  IoT
        ↓
Gateway Layer
  API
  Authentication
  Streaming
  Events
        ↓
Intelligence Layer
  Brain Engine
  Identity Engine
  Context Engine
  Memory Engine
  Knowledge Engine
  Reasoning Engine
  Planning Engine
  Skill Engine
  Voice Engine
  Security Engine
        ↓
Integration Layer
  Google
  Microsoft
  Home Assistant
  GitHub
  IBM
  Custom APIs
        ↓
Infrastructure Layer
  Database
  Cache
  Storage
  Message Bus
  AI Providers
  Monitoring
```

---

#3. Core Concept

The Core defines the language of the platform.

It contains:

Contracts
Events
Models
Interfaces
Protocols
Exceptions
Types
Constants

The Core must not contain framework-specific code.

The Core must not depend on infrastructure.

The Core must not know which AI provider, database, or client is being used.

The Core may define shared domain language, architectural policies, platform-wide constraints, and cross-capability invariants. Capability-specific business rules, semantic decisions, and behavior belong exclusively to the owning Engine; placing a shared model or policy Contract in Core does not transfer that ownership.

---

#4. Engines

Engines are the main capabilities of O.R.I.O.N.

An Engine is responsible for one domain of intelligence.

Brain Engine

Orchestrates cognitive execution across capabilities through Contracts.

Responsibilities:

Receive normalized requests.
Coordinate Context, Reasoning, Planning, Memory, Knowledge, and Skill invocation.
Maintain the high-level cognitive execution flow.
Select or coordinate the appropriate cognitive capability according to architectural rules.
Assemble the final cognitive result from capability outputs.

The Brain Engine does not perform domain reasoning, replace the Reasoning Engine, independently generate reasoning content, or own the semantics of the capabilities it coordinates. It does not own final transport, presentation, voice rendering, or Client delivery.
Voice Engine

Handles speech input and speech output.

Responsibilities:

Speech-to-text.
Text-to-speech.
Audio normalization.
Voice session handling.
Provider abstraction.
Identity Engine

Determines who is interacting with O.R.I.O.N.

Responsibilities:

User identification.
Voice profile matching.
Device identity.
Session ownership.
Trust level evaluation.
Context Engine

Builds the current context for a request.

Responsibilities:

Active user context.
Device context.
Location context.
Conversation context.
Active task context.
Context Lineage and Revision identity semantics.
Context Revision lifecycle.
Context Snapshot and lineage metadata semantics.

Each Context Lineage has one stable Lineage Identity. Each Context Revision has a unique Revision Identity and is immutable once Active. A reasoning cycle consumes exactly one Active Context Revision.

The canonical lifecycle is Collecting, Composing, Validating, Active, Expired, and optionally Archived. A meaningful change begins a new revision; it does not update an Active revision in place.

Logical reconstruction is conditional on authoritative source revisions remaining available. Exact replay requires retained immutable evidence. Expiration ends operational validity but does not itself require immediate deletion or classify retained Context as Memory.
Memory Engine

Manages memory as a first-class capability.

Responsibilities:

Intentionally retained episodic experiences.
Intentionally retained interaction information.
User preferences.
Assertion and interaction provenance.
Memory retrieval.
Memory deletion.
Knowledge Engine

Owns Knowledge as an independent platform capability.

Responsibilities:

Claim acceptance.
Validation state governance.
Provenance requirements.
Knowledge lifecycle and version semantics.
Contradiction resolution within Knowledge.
Knowledge Contracts and references for Context.

The Knowledge Engine does not own storage technology, Memory, Context, Reasoning, or Planning.
Reasoning Engine

Evaluates the Active Context Revision and owns inference and reasoning.

Responsibilities:

Intent analysis.
Inference, conclusions, and decisions.
Candidate response or next-action generation as reasoning outcomes.
Risk evaluation.
Clarification requests.

The Reasoning Engine does not orchestrate the full cognitive pipeline, execute Skills, own Planning or Context, or deliver results to Clients.
Planning Engine

Breaks complex objectives into executable steps.

Responsibilities:

Task decomposition.
Multi-step planning.
Dependency ordering.
Execution strategy.
Skill Engine

Discovers, registers, validates, and executes Skills.

Responsibilities:

Skill discovery.
Skill manifest validation.
Permission checking.
Skill execution.
Skill result normalization.
Security Engine

Protects users, data, and actions.

Responsibilities:

Security policy semantics.
Authorization decision semantics.
Security-domain rules.
Policy decision Contracts and governed policy artifacts.
Audit requirements.
Sensitive action validation.

Protected invocation boundaries enforce applicable Security-owned decisions. Enforcement may occur in Engines, Gateways, Adapters, Providers, or Infrastructure without transferring Security semantic ownership and without requiring a direct synchronous Security Engine dependency.
Automation Engine

Executes scheduled, conditional, and event-driven workflows.

Responsibilities:

Scheduled tasks.
Event triggers.
Conditional execution.
Background workflows.
Vision Engine

Handles visual input.

Responsibilities:

Image understanding.
Video understanding.
Object detection.
Visual context extraction.

---

#5. Layers
Clients Layer

Clients are interaction surfaces.

Examples:

Mobile app
Desktop app
Watch app
Web app
IoT device
Smart speaker

Clients must not contain business logic.

Clients capture input and present output.

Gateway Layer

The Gateway is the entry point into the platform.

Responsibilities:

Authentication
Request validation
API routing
WebSocket communication
Audio streaming
Event ingestion
Intelligence Layer

The Intelligence Layer contains Engines.

This is where requests are understood, reasoned about, planned, and executed.

Integration Layer

The Integration Layer connects O.R.I.O.N. to external ecosystems.

Examples:

Google
Microsoft
Spotify
GitHub
Home Assistant
IBM
Custom APIs

Integrations must be replaceable and isolated.

Infrastructure Layer

The Infrastructure Layer provides technical implementations.

Examples:

Database
Cache
Storage
Message bus
AI providers
Logging
Monitoring

Infrastructure must implement contracts defined by the Core.

---

#6. Request Lifecycle

This section describes Runtime Interaction Flow, not source-code dependency direction.

A typical voice interaction follows this flow:

User speaks
  ↓
Client captures audio
  ↓
Gateway receives audio
  ↓
Voice Engine transcribes speech
  ↓
Identity Engine identifies speaker
  ↓
Context Engine begins Context collection for a new revision
  ↓
Memory and Knowledge Engines provide relevant references or projections as required during collection
  ↓
Context Engine composes, validates, and activates the immutable Context Revision
  ↓
Reasoning Engine interprets intent
  ↓
Planning Engine creates plan if needed
  ↓
Security-owned authorization decision is obtained or evaluated; the protected boundary enforces it
  ↓
Skill Engine executes required Skill
  ↓
Brain Engine assembles the final cognitive result from capability outputs
  ↓
Voice Engine generates spoken output
  ↓
Client plays response

---

#7. Skills

Skills are independent capabilities that extend O.R.I.O.N.

A Skill must not modify the Core.

A Skill must declare:

Identity
Version
Capabilities
Required permissions
Inputs
Outputs
Failure modes

Recommended Skill structure:

skills/
  calendar/
    manifest.yaml
    README.md
    permissions.yaml
    src/
    tests/

Example manifest:

id: calendar
name: Calendar
version: 0.1.0
description: Calendar management Skill

permissions:
  - calendar.read
  - calendar.write

capabilities:
  - create_event
  - update_event
  - delete_event

---

#8. Contracts

Contracts define how components communicate.

Contracts must be stable, explicit, and versioned when necessary.

Examples:

SpeechToTextProvider
TextToSpeechProvider
MemoryRepository
SkillExecutor
IdentityProvider
LlmProvider
EventPublisher

Implementations can change.

Contracts should change carefully.

---

#9. Events

O.R.I.O.N. should prefer events for cross-component communication.

Example events:

UserIdentified
VoiceTranscribed
IntentDetected
SkillRequested
SkillExecuted
MemoryCreated
PermissionDenied
AutomationTriggered

Events allow systems to evolve without direct dependencies.

The Core custodies shared Event Contracts, envelopes, and schemas. The applicable capability or domain owns Event semantics. Runtime publishers may be Engines, Adapters, or other authorized components appropriate to the Event type, but may publish only Events whose semantics they are authorized to represent.

Domain Events belong semantically to their capability domain; integration Events belong to their Adapter or integration domain; platform and Infrastructure Events belong to the appropriate platform domain. No component is required to invent an Event when no meaningful completed fact exists.

---

#10. Provider Abstraction

O.R.I.O.N. must never depend directly on one provider.

Forbidden source-code dependency:

OpenAI → Brain Engine

Runtime interaction through a Contract:

LLM Provider Contract
        ↓
OpenAI Provider Implementation

In source code, the Provider implementation depends inward on the Core-custodied Contract. The runtime arrow above MUST NOT be interpreted as the Contract or Core depending on the Provider.

The same applies to:

Speech-to-text
Text-to-speech
Databases
Authentication
Storage
Messaging
Integrations

---

#11. Security Model

Every protected action must be evaluated under Security-owned authorization policy. Enforcement occurs at invocation boundaries through Contracts or governed policy artifacts; this does not require a direct synchronous dependency on the Security Engine.

Security must consider:

Who is requesting the action.
From which device.
With what trust level.
What permissions are required.
Whether the action is sensitive.
Whether confirmation is required.

Sensitive actions should require explicit confirmation.

Examples:

Sending money
Deleting data
Sending emails
Unlocking doors
Changing security settings
Executing system commands

---

#12. Memory Model

Memory must be intentional and manageable.

Memory categories:

Episodic memory
Preference memory
Assertion memory

Memory represents intentionally retained experience and user continuity.

Validated facts, domain knowledge, validated procedures, and stable platform definitions belong to Knowledge.

Temporary reasoning state, current capability availability, and current operational or system state belong to Context.

The boundary is determined by semantic role and authority, not persistence.

The Knowledge Engine is the single architectural owner of Knowledge behavior and governance. Memory may provide evidence or provenance, while Reasoning, Providers, and Adapters may propose or supply claims and observations. Only the Knowledge capability determines whether a claim becomes accepted Knowledge.

Users must be able to inspect, update, export, and delete memory.

---

#13. Multi-Device Model

Devices are clients.

Each device should have:

Device ID
Device type
Owner
Capabilities
Trust level
Active session state

Examples:

Mobile client can capture audio and display UI.
Watch client can capture short commands.
IoT client can listen and play responses.
Desktop client can execute local workflows.

---

#14. Error Handling

Errors must be explicit.

The system should distinguish between:

User errors
Validation errors
Provider errors
Permission errors
Skill errors
Infrastructure errors
Unknown errors

Failures should be logged, observable, and recoverable when possible.

---

#15. Observability

O.R.I.O.N. must be observable from the beginning.

Minimum observability requirements:

Structured logs
Request IDs
User/session IDs where allowed
Event tracing
Skill execution logs
Provider latency
Error rates

---

#16. Initial Technical Direction

Initial implementation may use:

Mobile client: React Native + Expo
Backend: Python + FastAPI
Database: PostgreSQL / Supabase
Realtime: WebSocket
AI providers: replaceable provider contracts
Deployment: Docker

These technologies are implementation choices, not architectural dependencies.

---

#17. Architectural Rule

The Core defines what O.R.I.O.N. is.

Engines define what O.R.I.O.N. can do.

Skills extend what O.R.I.O.N. can do.

Clients define how users interact with O.R.I.O.N.

Infrastructure defines how O.R.I.O.N. runs.

No layer should violate this separation.
