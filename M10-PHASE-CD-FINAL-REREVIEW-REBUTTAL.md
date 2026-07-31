# M10 Phase C/D Final Re-Review Rebuttal

**Status:** Ready for re-review  
**Scope:** Selected Binding and Bound Skill Invocation Target authority findings

## Verdict

- HIGH 1 — **INVALID**
- HIGH 2 — **INVALID**

No architectural correction is required. M10 Phase A, Phase B, and Phase C/D
remain valid.

## Authority Models

The Active specifications deliberately use two authority models.

Explicit issuer-owned verification applies where Brain receives a value and
must independently verify issuing-runtime authority. `ENGINE-0001` therefore
requires operation/verifier pairs for Active Context Revision, Reasoning
Outcome, and Candidate Plan, and a verifier for the Normalized Skill Execution
Result (`specifications/engines/ENGINE-0001-Brain-Engine.md:81-96`).
`BrainConfiguration` implements that exact surface
(`core/src/brain-contracts.ts:115-127`).

Exact configured-return authority applies to transient M9 values. For these
values, Brain accepts and preserves the exact identity returned by the
configured M9 port. `ENGINE-0001` names the Bound Target step
`configured-return authority acceptance` and requires exact configured-return
identity preservation
(`specifications/engines/ENGINE-0001-Brain-Engine.md:711-748`).

## Selected Binding Authority Chain

`ENGINE-0010` defines Select Skill success as an authority-bearing Binding,
registers the selected Binding identity in the issuing Skill instance's private
selection registry, and states that only the Binding returned through the
configured Select Skill Contract is authoritative
(`specifications/engines/skill/ENGINE-0010-Skill-Engine-Protected-Invocation-and-Execution.md:600-621`,
`:699-715`).

Brain:

1. obtains the Binding only from the configured Select Skill port;
2. validates its structure, deep immutability, and requested-capability
   correspondence;
3. preserves the exact returned identity; and
4. passes that same identity to Bind Skill to Operation
   (`services/brain/src/brain-engine.ts:305-330`,
   `:767-791`).

The real M9 Bind boundary then requires membership in the issuing runtime's
private Binding authority and admission registries
(`services/skill/src/skill-execution-runtime.ts:239-280`). Binding clones,
reconstructions, and fabricated values are rejected there
(`services/skill/test/skill-execution-engine.test.ts:2905-2923`).

## Bound Target Authority Chain

`ENGINE-0010` defines Bind Skill to Operation success as an immutable,
authority-bearing Bound Skill Invocation Target, registers it in the issuing
Skill instance's private bound-target registry, and states that only the
configured Bind return is authoritative
(`specifications/engines/skill/ENGINE-0010-Skill-Engine-Protected-Invocation-and-Execution.md:717-790`).

Brain preserves the exact returned target and validates its structure, deep
immutability, operation, Skill identity, version, capability, and declaration
snapshot correspondence (`services/brain/src/brain-engine.ts:326-350`,
`:794-847`).

The real M9 runtime requires target-registry membership before resolving
requirements and checks it again during protected invocation
(`services/skill/src/skill-execution-runtime.ts:386-419`,
`:473-507`, `:661-666`). Fabricated, cloned, and cross-runtime targets cannot
pass those consuming boundaries.

## Mocked Substitute Binding Test

The test at
`services/brain/test/brain-m9-correspondence.test.ts:106-133` configures a mock
Select Skill port to return a newly constructed, deeply immutable Binding. It
does not pass a caller-supplied Binding through the Brain request and does not
exercise a real M9 Binding registry. It verifies that Brain preserves the exact
identity returned by its configured port when forwarding the Binding to the
next boundary.

That unit test is therefore not evidence of a runtime vulnerability. Real M9
provenance rejection is exercised at the real Bind boundary, while the genuine
M9-to-Brain identity path is covered at
`services/brain/test/brain-m9-correspondence.test.ts:15-78`.

## Why Two New Verifiers Are Incorrect

`ENGINE-0001` requires Skill selection and Skill binding ports, but no separate
Binding or Bound Target verifier
(`specifications/engines/ENGINE-0001-Brain-Engine.md:81-96`).
`core/src/skill-contracts.ts:73-100` likewise defines no such verifier
Contracts. Adding them would replace the approved configured-return model,
duplicate M9's private authority enforcement, expand Core and
`BrainConfiguration`, require Skill and Bootstrap changes, and unnecessarily
reopen M10 Phase A.

The existing architecture is internally consistent. HIGH 1 and HIGH 2 do not
identify defects in M9 or M10.
