import { describe, expect, it } from "vitest";
import {
  BrainSkillCoordinationError,
  createRegisteredSkill,
} from "@orion/core";
import { SkillEngine } from "../../skill/src/index.js";
import { fixture, running, skillRequest } from "./brain-engine.test.js";

const freeze = <T>(value: T): Readonly<T> => Object.freeze(value);
const firstArgument = <T>(mock: {
  readonly mock: { readonly calls: readonly unknown[][] };
}): T => mock.mock.calls[0]![0] as T;

describe("Brain M9 authority correspondence", () => {
  it("accepts the exact Binding and Bound Target issued by a genuine M9 Skill runtime", () => {
    const skill = new SkillEngine();
    skill.initialize();
    skill.start();
    skill.registerSkillManifest({
      intent: "register-skill-manifest",
      manifest: {
        id: "weather-reader",
        name: "Weather reader",
        version: "1.0.0",
        description: "Reads prepared weather metadata.",
        author: "ORION",
        license: "MIT",
        permissions: ["weather.read"],
        capabilities: ["weather.read", "forecast.read"],
        events: {
          publishes: ["WeatherRead"],
          consumes: ["LocationSelected"],
        },
        inputs: ["location.value"],
        outputs: ["weather.value"],
        failureModes: ["weather.unavailable"],
      },
    });
    skill.admitSkillWorkflow({
      intent: "admit-skill-workflow",
      skillId: "weather-reader",
      supportedCapabilities: ["weather.read"],
      validator: () => ({ status: "accepted" }),
      workflow: () => ({ status: "succeeded", outputs: {} }),
    });
    const selection = skill.selectSkill({
      intent: "select-skill",
      capability: "weather.read",
    });
    if (selection.status !== "selected") throw new Error();
    const genuineTarget = skill.bindSkillToOperation({
      intent: "bind-skill-to-operation",
      operationId: "operation:1",
      binding: selection.binding,
    });
    const value = fixture();
    value.ports.selectSkill.selectSkill.mockReturnValue(selection as never);
    value.ports.bindSkillToOperation.bindSkillToOperation.mockReturnValue(
      genuineTarget as never,
    );
    value.ports.resolveSkillExecutionContext.resolveSkillExecutionContext.mockImplementation(
      () => {
        throw new Error("stop after genuine target");
      },
    );
    expect(() =>
      running(value.ports).orchestrateCognitiveRequest(skillRequest()),
    ).toThrow(BrainSkillCoordinationError);
    const bindRequest = firstArgument<{
      readonly binding: unknown;
      readonly operationId: unknown;
    }>(value.ports.bindSkillToOperation.bindSkillToOperation);
    expect(bindRequest.binding).toBe(selection.binding);
    expect(bindRequest.operationId).toBe(genuineTarget.operationId);
    expect(
      value.ports.resolveSkillExecutionContext.resolveSkillExecutionContext,
    ).toHaveBeenCalledTimes(1);
  });

  it("rejects a partially mutable selected Binding before allocation", () => {
    const { ports, binding, events } = fixture();
    ports.selectSkill.selectSkill.mockReturnValue({
      status: "selected",
      policy: freeze({
        id: "orion.minimum-skill-selection",
        version: "1.0.0",
      }),
      binding: freeze({
        capability: binding.capability,
        registeredSkill: { ...binding.registeredSkill },
      }),
    } as never);
    const engine = running(ports);
    expect(() => engine.orchestrateCognitiveRequest(skillRequest())).toThrow(
      BrainSkillCoordinationError,
    );
    expect(
      ports.operationAllocator.allocateAuthorizationOperationIdentifier,
    ).not.toHaveBeenCalled();
    expect(events.at(-1)).toMatchObject({
      from: "skill-required",
      to: "rejected",
    });
  });

  it("preserves the exact Binding identity returned by the configured Select Skill port", () => {
    const { ports, binding } = fixture();
    const replaced = createRegisteredSkill({
      ...binding.registeredSkill,
      name: "Replacement",
    });
    ports.selectSkill.selectSkill.mockReturnValue(
      freeze({
        status: "selected",
        policy: freeze({
          id: "orion.minimum-skill-selection",
          version: "1.0.0",
        }),
        binding: freeze({
          capability: binding.capability,
          registeredSkill: replaced,
        }),
      }) as never,
    );
    const engine = running(ports);
    const result = engine.orchestrateCognitiveRequest(skillRequest());
    expect(result.kind).toBe("skill-result");
    expect(
      firstArgument<{ binding: unknown }>(
        ports.bindSkillToOperation.bindSkillToOperation,
      ).binding,
    ).toBe(ports.selectSkill.selectSkill.mock.results[0]!.value.binding);
  });

  it.each([
    ["requiredPermissions", ["skill.read"]],
    ["inputNames", ["different-input"]],
    ["outputNames", ["different-output"]],
    ["failureModes", ["different-failure"]],
  ] as const)(
    "rejects Bound Target %s declaration mismatch",
    (field, replacement) => {
      const { ports, target, events } = fixture();
      ports.bindSkillToOperation.bindSkillToOperation.mockReturnValue(
        freeze({
          ...target,
          [field]: freeze(replacement),
        }) as never,
      );
      const engine = running(ports);
      expect(() => engine.orchestrateCognitiveRequest(skillRequest())).toThrow(
        BrainSkillCoordinationError,
      );
      expect(
        ports.resolveSkillExecutionContext.resolveSkillExecutionContext,
      ).not.toHaveBeenCalled();
      expect(events.at(-1)).toMatchObject({
        from: "skill-required",
        to: "rejected",
      });
    },
  );

  it("rejects a mutable nested Bound Target resource", () => {
    const { ports, target } = fixture();
    ports.bindSkillToOperation.bindSkillToOperation.mockReturnValue(
      freeze({
        ...target,
        resource: { ...target.resource },
      }) as never,
    );
    const engine = running(ports);
    expect(() => engine.orchestrateCognitiveRequest(skillRequest())).toThrow(
      BrainSkillCoordinationError,
    );
  });

  it("rejects execution Context subject mismatch before requirements", () => {
    const { ports, projection, events } = fixture();
    ports.resolveSkillExecutionContext.resolveSkillExecutionContext.mockReturnValue(
      freeze({
        ...projection,
        subject: freeze({
          kind: "authenticated",
          identityId: "identity.replacement",
        }),
      }) as never,
    );
    const engine = running(ports);
    expect(() => engine.orchestrateCognitiveRequest(skillRequest())).toThrow(
      BrainSkillCoordinationError,
    );
    expect(
      ports.resolveSkillInvocationRequirements
        .resolveSkillInvocationRequirements,
    ).not.toHaveBeenCalled();
    expect(events.at(-1)).toMatchObject({ from: "bound", to: "rejected" });
  });

  it("rejects a partially mutable execution Context", () => {
    const { ports, projection } = fixture();
    ports.resolveSkillExecutionContext.resolveSkillExecutionContext.mockReturnValue(
      freeze({
        ...projection,
        subject: { ...projection.subject },
      }) as never,
    );
    const engine = running(ports);
    expect(() => engine.orchestrateCognitiveRequest(skillRequest())).toThrow(
      BrainSkillCoordinationError,
    );
  });

  it("rejects requirements permission mismatch before authorization", () => {
    const { ports, requirements, events } = fixture();
    if (requirements.status !== "available") throw new Error();
    ports.resolveSkillInvocationRequirements.resolveSkillInvocationRequirements.mockReturnValue(
      freeze({
        status: "available",
        requirements: freeze({
          ...requirements.requirements,
          requiredPermissions: freeze(["skill.read"]),
        }),
      }) as never,
    );
    const engine = running(ports);
    expect(() => engine.orchestrateCognitiveRequest(skillRequest())).toThrow(
      BrainSkillCoordinationError,
    );
    expect(
      ports.resolveGovernedAuthorizationEvaluation
        .resolveGovernedAuthorizationEvaluation,
    ).not.toHaveBeenCalled();
    expect(events.at(-1)).toMatchObject({ from: "bound", to: "rejected" });
  });

  it("rejects partially mutable available requirements", () => {
    const { ports, requirements } = fixture();
    if (requirements.status !== "available") throw new Error();
    ports.resolveSkillInvocationRequirements.resolveSkillInvocationRequirements.mockReturnValue(
      freeze({
        status: "available",
        requirements: {
          ...requirements.requirements,
        },
      }) as never,
    );
    const engine = running(ports);
    expect(() => engine.orchestrateCognitiveRequest(skillRequest())).toThrow(
      BrainSkillCoordinationError,
    );
  });

  it("preserves exact selected, target, projection, and requirements identities", () => {
    const { ports, binding, target, projection, requirements } = fixture();
    const engine = running(ports);
    engine.orchestrateCognitiveRequest(skillRequest());
    expect(
      firstArgument<{ binding: unknown }>(
        ports.bindSkillToOperation.bindSkillToOperation,
      ).binding,
    ).toBe(binding);
    expect(
      firstArgument<{ target: unknown }>(
        ports.resolveSkillInvocationRequirements
          .resolveSkillInvocationRequirements,
      ).target,
    ).toBe(target);
    expect(
      firstArgument<{ context: unknown }>(
        ports.protectedInvokeSkill.invokeBoundSkill,
      ).context,
    ).toBe(projection);
    expect(
      firstArgument<{ requirements: unknown }>(
        ports.protectedInvokeSkill.invokeBoundSkill,
      ).requirements,
    ).toBe(requirements);
  });

  it("does not expose an authority or test seam through the package", async () => {
    const surface = await import("../src/index.js");
    expect(Object.keys(surface)).toEqual(["BrainEngine"]);
    expect(
      "FinalResultAuthority" in
        (surface as unknown as Record<PropertyKey, unknown>),
    ).toBe(false);
    expect(
      "register" in (surface as unknown as Record<PropertyKey, unknown>),
    ).toBe(false);
  });
});
