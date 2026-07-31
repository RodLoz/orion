import { describe, expect, it } from "vitest";
import {
  BrainAuthorizationResolutionError,
  BrainContextResolutionError,
  BrainPlanningResolutionError,
  BrainProtectedInvocationError,
  BrainReasoningResolutionError,
  BrainSkillCoordinationError,
  type BrainConfiguration,
} from "@orion/core";
import {
  fixture,
  noneRequest,
  running,
  skillRequest,
} from "./brain-engine.test.js";

interface FailureRow {
  readonly name: string;
  readonly error: new () => Error;
  readonly skill: boolean;
  readonly fail: (ports: ReturnType<typeof fixture>["ports"]) => void;
  readonly later: (ports: ReturnType<typeof fixture>["ports"]) => {
    readonly mock: { readonly calls: readonly unknown[] };
  };
  readonly rejectedFrom: string;
}

const failureRows: readonly FailureRow[] = [
  {
    name: "Context resolver throw",
    error: BrainContextResolutionError,
    skill: false,
    fail: (ports) =>
      ports.context.getActiveContextRevision.mockImplementation(() => {
        throw new Error("context-native-secret");
      }),
    later: (ports) => ports.context.verifyActiveContextRevisionAuthority,
    rejectedFrom: "proposed",
  },
  {
    name: "Context malformed result",
    error: BrainContextResolutionError,
    skill: false,
    fail: (ports) =>
      ports.context.getActiveContextRevision.mockReturnValue({} as never),
    later: (ports) => ports.context.verifyActiveContextRevisionAuthority,
    rejectedFrom: "proposed",
  },
  {
    name: "Context verifier throw",
    error: BrainContextResolutionError,
    skill: false,
    fail: (ports) =>
      ports.context.verifyActiveContextRevisionAuthority.mockImplementation(
        () => {
          throw new Error("context-verifier-secret");
        },
      ),
    later: (ports) => ports.reasoning.evaluateReasoning,
    rejectedFrom: "proposed",
  },
  {
    name: "Context verifier non-exact return",
    error: BrainContextResolutionError,
    skill: false,
    fail: (ports) =>
      ports.context.verifyActiveContextRevisionAuthority.mockReturnValue(
        {} as never,
      ),
    later: (ports) => ports.reasoning.evaluateReasoning,
    rejectedFrom: "proposed",
  },
  {
    name: "Reasoning evaluator throw",
    error: BrainReasoningResolutionError,
    skill: false,
    fail: (ports) =>
      ports.reasoning.evaluateReasoning.mockImplementation(() => {
        throw new Error("reasoning-native-secret");
      }),
    later: (ports) => ports.reasoning.verifyReasoningOutcomeAuthority,
    rejectedFrom: "contextualized",
  },
  {
    name: "Reasoning malformed result",
    error: BrainReasoningResolutionError,
    skill: false,
    fail: (ports) =>
      ports.reasoning.evaluateReasoning.mockReturnValue({} as never),
    later: (ports) => ports.reasoning.verifyReasoningOutcomeAuthority,
    rejectedFrom: "contextualized",
  },
  {
    name: "Reasoning verifier throw",
    error: BrainReasoningResolutionError,
    skill: false,
    fail: (ports) =>
      ports.reasoning.verifyReasoningOutcomeAuthority.mockImplementation(() => {
        throw new Error("reasoning-verifier-secret");
      }),
    later: (ports) => ports.planning.createCandidatePlan,
    rejectedFrom: "contextualized",
  },
  {
    name: "Reasoning verifier non-exact return",
    error: BrainReasoningResolutionError,
    skill: false,
    fail: (ports) =>
      ports.reasoning.verifyReasoningOutcomeAuthority.mockReturnValue(
        {} as never,
      ),
    later: (ports) => ports.planning.createCandidatePlan,
    rejectedFrom: "contextualized",
  },
  {
    name: "Planning creator throw",
    error: BrainPlanningResolutionError,
    skill: false,
    fail: (ports) =>
      ports.planning.createCandidatePlan.mockImplementation(() => {
        throw new Error("planning-native-secret");
      }),
    later: (ports) => ports.planning.verifyCandidatePlanAuthority,
    rejectedFrom: "reasoned",
  },
  {
    name: "Planning malformed result",
    error: BrainPlanningResolutionError,
    skill: false,
    fail: (ports) =>
      ports.planning.createCandidatePlan.mockReturnValue({} as never),
    later: (ports) => ports.planning.verifyCandidatePlanAuthority,
    rejectedFrom: "reasoned",
  },
  {
    name: "Planning verifier throw",
    error: BrainPlanningResolutionError,
    skill: false,
    fail: (ports) =>
      ports.planning.verifyCandidatePlanAuthority.mockImplementation(() => {
        throw new Error("planning-verifier-secret");
      }),
    later: (ports) => ports.selectSkill.selectSkill,
    rejectedFrom: "reasoned",
  },
  {
    name: "Planning verifier non-exact return",
    error: BrainPlanningResolutionError,
    skill: false,
    fail: (ports) =>
      ports.planning.verifyCandidatePlanAuthority.mockReturnValue({} as never),
    later: (ports) => ports.selectSkill.selectSkill,
    rejectedFrom: "reasoned",
  },
  {
    name: "Skill selection throw",
    error: BrainSkillCoordinationError,
    skill: true,
    fail: (ports) =>
      ports.selectSkill.selectSkill.mockImplementation(() => {
        throw new Error("selection-native-secret");
      }),
    later: (ports) =>
      ports.operationAllocator.allocateAuthorizationOperationIdentifier,
    rejectedFrom: "skill-required",
  },
  {
    name: "allocator throw",
    error: BrainSkillCoordinationError,
    skill: true,
    fail: (ports) =>
      ports.operationAllocator.allocateAuthorizationOperationIdentifier.mockImplementation(
        () => {
          throw new Error("allocator-native-secret");
        },
      ),
    later: (ports) => ports.bindSkillToOperation.bindSkillToOperation,
    rejectedFrom: "skill-required",
  },
  {
    name: "binding throw",
    error: BrainSkillCoordinationError,
    skill: true,
    fail: (ports) =>
      ports.bindSkillToOperation.bindSkillToOperation.mockImplementation(() => {
        throw new Error("binding-native-secret");
      }),
    later: (ports) =>
      ports.resolveSkillExecutionContext.resolveSkillExecutionContext,
    rejectedFrom: "skill-required",
  },
  {
    name: "execution Context throw",
    error: BrainSkillCoordinationError,
    skill: true,
    fail: (ports) =>
      ports.resolveSkillExecutionContext.resolveSkillExecutionContext.mockImplementation(
        () => {
          throw new Error("projection-native-secret");
        },
      ),
    later: (ports) =>
      ports.resolveSkillInvocationRequirements
        .resolveSkillInvocationRequirements,
    rejectedFrom: "bound",
  },
  {
    name: "requirements throw",
    error: BrainSkillCoordinationError,
    skill: true,
    fail: (ports) =>
      ports.resolveSkillInvocationRequirements.resolveSkillInvocationRequirements.mockImplementation(
        () => {
          throw new Error("requirements-native-secret");
        },
      ),
    later: (ports) =>
      ports.resolveGovernedAuthorizationEvaluation
        .resolveGovernedAuthorizationEvaluation,
    rejectedFrom: "bound",
  },
  {
    name: "authorization throw",
    error: BrainAuthorizationResolutionError,
    skill: true,
    fail: (ports) =>
      ports.resolveGovernedAuthorizationEvaluation.resolveGovernedAuthorizationEvaluation.mockImplementation(
        () => {
          throw new Error("authorization-native-secret");
        },
      ),
    later: (ports) => ports.protectedInvokeSkill.invokeBoundSkill,
    rejectedFrom: "bound",
  },
  {
    name: "protected invocation throw",
    error: BrainProtectedInvocationError,
    skill: true,
    fail: (ports) =>
      ports.protectedInvokeSkill.invokeBoundSkill.mockImplementation(() => {
        throw new Error("invocation-native-secret");
      }),
    later: (ports) => ports.verifyNormalizedSkillExecutionResult.verify,
    rejectedFrom: "invoking",
  },
  {
    name: "normalized verifier false",
    error: BrainProtectedInvocationError,
    skill: true,
    fail: (ports) =>
      ports.verifyNormalizedSkillExecutionResult.verify.mockReturnValue(false),
    later: () => ({ mock: { calls: [] } }),
    rejectedFrom: "invoking",
  },
];

describe("Brain normative failure prefixes", () => {
  it.each(failureRows)(
    "$name normalizes, rejects, and suppresses the next stage",
    (row) => {
      const { ports, events } = fixture();
      row.fail(ports);
      const engine = running(ports as unknown as BrainConfiguration);
      let failure: unknown;
      try {
        engine.orchestrateCognitiveRequest(
          row.skill ? skillRequest() : noneRequest(),
        );
      } catch (error) {
        failure = error;
      }
      expect(failure).toBeInstanceOf(row.error);
      expect((failure as Error).message).not.toContain("secret");
      expect(row.later(ports).mock.calls).toHaveLength(0);
      expect(events.at(-1)).toMatchObject({
        from: row.rejectedFrom,
        to: "rejected",
        category: "orchestration-rejected",
      });
      for (const [portName, record] of Object.entries(ports)) {
        if (portName === "lifecycleObserver") continue;
        if (typeof record === "function")
          expect(record.mock.calls.length).toBeLessThanOrEqual(1);
        else
          for (const callable of Object.values(record))
            expect(callable.mock.calls.length).toBeLessThanOrEqual(1);
      }
    },
  );
});
