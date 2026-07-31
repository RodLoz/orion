import { execFileSync } from "node:child_process";
import { describe, expect, it } from "vitest";

function runWithGc(failContext: boolean): string {
  return execFileSync(
    process.execPath,
    [
      "--expose-gc",
      "--input-type=module",
      "--eval",
      `
        import { BrainEngine } from './services/brain/dist/index.js';
        import {
          createCandidatePlan, createNormalizedCognitiveRequest,
          createReasoningOutcome
        } from './core/dist/index.js';
        const freeze = Object.freeze;
        const context = freeze({
          lineageIdentity:'context.main',revisionIdentity:'context.revision',
          revisionNumber:1,
          creationMetadata:freeze({createdAt:'2026-07-30T12:00:00Z',sourceCount:1,fragmentCount:1}),
          lifecycleState:'active',
          fragments:freeze([freeze({kind:'identity',authoritativeOwner:'identity',
            projection:freeze({state:'anonymous',authoritativeOwner:'identity'})})])
        });
        const reasoning = createReasoningOutcome({
          status:'completed',category:'anonymous-context',conclusion:'A conclusion',
          response:'Need more context',nextAction:'request-more-context',
          explainability:{
            contextConsumptionReference:{lineageIdentity:context.lineageIdentity,
              revisionIdentity:context.revisionIdentity,revisionNumber:1,
              lifecycleState:'active',authoritativeCapability:'context'},
            identityState:'anonymous',memoryReferenceCount:0,knowledgeReferenceCount:0,
            ruleCategory:'anonymous-identity'
          }
        });
        const plan = createCandidatePlan({
          status:'completed',category:'request-more-context',
          steps:[{ordinal:1,kind:'request-more-context'}],
          source:{reasoningStatus:reasoning.status,reasoningCategory:reasoning.category,
            candidateNextAction:reasoning.nextAction,identityState:'anonymous',
            memoryReferenceCount:0,knowledgeReferenceCount:0,
            reasoningRuleCategory:'anonymous-identity',authoritativeCapability:'reasoning'},
          explainability:{consumedReasoningCategory:reasoning.category,
            consumedCandidateNextAction:reasoning.nextAction,
            resultingPlanCategory:'request-more-context',candidateStepCount:1,
            planningRuleCategory:'reasoning-requested-more-context'}
        });
        const unused = () => { throw new Error(); };
        const configuration = {
          context:{getActiveContextRevision:${failContext ? "()=>{throw new Error()}" : "()=>context"},
            verifyActiveContextRevisionAuthority:({candidate})=>candidate},
          reasoning:{evaluateReasoning:()=>reasoning,
            verifyReasoningOutcomeAuthority:({candidate})=>candidate},
          planning:{createCandidatePlan:()=>plan,
            verifyCandidatePlanAuthority:({candidate})=>candidate},
          selectSkill:{selectSkill:unused},
          operationAllocator:{allocateAuthorizationOperationIdentifier:unused},
          bindSkillToOperation:{bindSkillToOperation:unused},
          resolveSkillExecutionContext:{resolveSkillExecutionContext:unused},
          resolveSkillInvocationRequirements:{resolveSkillInvocationRequirements:unused},
          resolveGovernedAuthorizationEvaluation:{resolveGovernedAuthorizationEvaluation:unused},
          protectedInvokeSkill:{invokeBoundSkill:unused},
          verifyNormalizedSkillExecutionResult:{verify:unused}
        };
        const engine = new BrainEngine(configuration); engine.initialize(); engine.start();
        let request = createNormalizedCognitiveRequest({
          intent:'orchestrate-cognitive-request',requestId:'request:gc',
          contextLineageId:'context.main',query:'gc query',executionIntent:{kind:'none'}
        });
        let finalized = false;
        const registry = new FinalizationRegistry(()=>{finalized=true});
        registry.register(request,'request');
        try { engine.orchestrateCognitiveRequest(request); } catch {}
        request = null;
        for(let attempt=0;attempt<200&&!finalized;attempt+=1){
          const pressure=Array.from({length:1000},()=>new Uint8Array(1024));
          globalThis.gc();
          await new Promise(resolve=>setImmediate(resolve));
        }
        if(!finalized) throw new Error('caller graph retained');
        console.log('collected');
      `,
    ],
    {
      cwd: process.cwd(),
      encoding: "utf8",
      timeout: 30_000,
    },
  ).trim();
}

describe("Brain caller-graph non-retention", () => {
  it("collects the caller request after successful synchronous completion", () => {
    expect(runWithGc(false)).toBe("collected");
  });

  it("collects the caller request after a Context-stage failure", () => {
    expect(runWithGc(true)).toBe("collected");
  });
});
