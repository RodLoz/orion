import { execFileSync } from "node:child_process";
import { describe, expect, it } from "vitest";

function runWithGc(source: string): string {
  return execFileSync(
    process.execPath,
    ["--expose-gc", "--input-type=module", "--eval", source],
    {
      cwd: process.cwd(),
      encoding: "utf8",
      timeout: 30_000,
    },
  ).trim();
}

const collect = `
async function collect(isFinalized) {
  for (let attempt = 0; attempt < 200 && !isFinalized(); attempt += 1) {
    const pressure = Array.from({length: 1000}, () => new Uint8Array(1024));
    globalThis.gc();
    await new Promise((resolve) => setImmediate(resolve));
  }
  if (!isFinalized()) throw new Error("upstream was retained");
}
`;

describe("authority weak upstream non-retention", () => {
  it("does not retain Reasoning's consumed Context and fails closed after collection", () => {
    const output = runWithGc(`
      import { ReasoningEngine } from './services/reasoning/dist/reasoning-engine.js';
      ${collect}
      const engine = new ReasoningEngine(); engine.initialize(); engine.start();
      let context = {
        lineageIdentity:'context.lineage.gc', revisionIdentity:'context.revision.gc',
        revisionNumber:1,
        creationMetadata:{createdAt:'2026-07-30T00:00:00.000Z',sourceCount:1,fragmentCount:1},
        lifecycleState:'active',
        fragments:[{kind:'identity',authoritativeOwner:'identity',projection:{state:'authenticated',authoritativeOwner:'identity',identityIdentifier:'orion.identity.gc'}}]
      };
      const expected = structuredClone(context);
      let finalized = false;
      const registry = new FinalizationRegistry(() => { finalized = true; });
      registry.register(context, 'context');
      const candidate = engine.evaluateReasoning({intent:'evaluate',activeContextRevision:context,query:'gc'});
      context = null;
      await collect(() => finalized);
      let failure;
      try {
        engine.verifyReasoningOutcomeAuthority({
          intent:'verify-reasoning-outcome-authority', candidate,
          consumedContextRevision:expected,
          expectedLineageIdentity:expected.lineageIdentity,
          expectedRevisionIdentity:expected.revisionIdentity,
          expectedRevisionNumber:expected.revisionNumber
        });
      } catch (error) { failure = error.name; }
      if (failure !== 'ReasoningAuthorityVerificationError') throw new Error(String(failure));
      console.log('collected-and-closed');
    `);
    expect(output).toBe("collected-and-closed");
  });

  it("does not retain Planning's consumed Reasoning and fails closed after collection", () => {
    const output = runWithGc(`
      import { PlanningEngine } from './services/planning/dist/planning-engine.js';
      import { createContextConsumptionReference,createReasoningExplainabilitySummary,createReasoningOutcome } from './core/dist/index.js';
      ${collect}
      const engine = new PlanningEngine(); engine.initialize(); engine.start();
      let reasoning = createReasoningOutcome({
        status:'completed',category:'context-only',
        conclusion:'The authenticated context contains no supplied Memory or Knowledge references.',
        response:'No Memory or Knowledge references were supplied for further orchestration.',
        nextAction:'request-more-context',
        explainability:createReasoningExplainabilitySummary({
          contextConsumptionReference:createContextConsumptionReference({
            lineageIdentity:'context.lineage.gc',revisionIdentity:'context.revision.gc',
            revisionNumber:1,lifecycleState:'active',authoritativeCapability:'context'
          }),
          identityState:'authenticated',memoryReferenceCount:0,knowledgeReferenceCount:0,
          ruleCategory:'authenticated-context-only'
        })
      });
      const expected = structuredClone(reasoning);
      let finalized = false;
      const registry = new FinalizationRegistry(() => { finalized = true; });
      registry.register(reasoning, 'reasoning');
      const candidate = engine.createCandidatePlan({intent:'create-candidate-plan',reasoningOutcome:reasoning});
      reasoning = null;
      await collect(() => finalized);
      const source = candidate.source;
      let failure;
      try {
        engine.verifyCandidatePlanAuthority({
          intent:'verify-candidate-plan-authority',candidate,
          consumedReasoningOutcome:expected,
          expectedReasoningStatus:source.reasoningStatus,
          expectedReasoningCategory:source.reasoningCategory,
          expectedCandidateNextAction:source.candidateNextAction,
          expectedIdentityState:source.identityState,
          expectedMemoryReferenceCount:source.memoryReferenceCount,
          expectedKnowledgeReferenceCount:source.knowledgeReferenceCount,
          expectedReasoningRuleCategory:source.reasoningRuleCategory
        });
      } catch (error) { failure = error.name; }
      if (failure !== 'PlanningAuthorityVerificationError') throw new Error(String(failure));
      console.log('collected-and-closed');
    `);
    expect(output).toBe("collected-and-closed");
  });
});
