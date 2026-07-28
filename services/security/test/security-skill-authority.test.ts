import { describe, expect, it } from "vitest";
import {
  InvalidAuthorizationEvidenceError,
  createRegisteredSkill,
} from "@orion/core";
import { ProcessLocalSkillRequirementsAuthority } from "../src/index.js";

const manifest = (permissions: string[] = ["skill.read", "skill.write"]) => ({
  id: "secured-skill",
  name: "Secured Skill",
  version: "1.0.0",
  description: "A canonical Skill projection for Security tests.",
  author: "ORION",
  license: "MIT",
  permissions,
  capabilities: ["security.test"],
  events: { publishes: [], consumes: [] },
  inputs: [],
  outputs: [],
  failureModes: [],
});
const request = {
  intent: "resolve-protected-action-requirements",
  operationId: "skill-op",
  action: "skill.execute",
  resource: { kind: "identified", resourceId: "skill:secured-skill" },
};

describe("M8 Skill-backed Requirements authority admission", () => {
  it("accepts a complete canonical Registered Skill and copies every permission", () => {
    const registered = createRegisteredSkill(manifest());
    const authority = new ProcessLocalSkillRequirementsAuthority(
      registered,
      "skill.execute" as never,
      request.resource as never,
      "sensitive",
    );
    const result = authority.resolveProtectedActionRequirements(request);
    expect(result).toEqual({
      status: "available",
      requirements: {
        operationId: "skill-op",
        action: "skill.execute",
        resource: {
          kind: "identified",
          resourceId: "skill:secured-skill",
        },
        requiredPermissions: ["skill.read", "skill.write"],
        sensitivity: "sensitive",
      },
    });
    expect(Object.isFrozen(result)).toBe(true);
  });

  it.each([
    { permissions: ["fabricated.permission"] },
    { ...manifest(), id: "INVALID" },
    { ...manifest(), permissions: ["skill.read", "skill.read"] },
  ])("rejects fabricated or malformed Skill projection %#", (candidate) => {
    expect(
      () =>
        new ProcessLocalSkillRequirementsAuthority(
          candidate as never,
          "skill.execute" as never,
          request.resource as never,
          "standard",
        ),
    ).toThrow(InvalidAuthorizationEvidenceError);
  });

  it("does not retain the caller Skill, permissions, or resource graph", () => {
    const permissions = ["skill.write", "skill.read"];
    const caller = manifest(permissions);
    const resource = {
      kind: "identified" as const,
      resourceId: "skill:secured-skill",
    };
    const authority = new ProcessLocalSkillRequirementsAuthority(
      caller as never,
      "skill.execute" as never,
      resource as never,
      "standard",
    );
    permissions.splice(0, permissions.length, "fabricated.permission");
    caller.id = "mutated-skill";
    resource.resourceId = "skill:mutated";
    const result = authority.resolveProtectedActionRequirements(request);
    expect(result.status).toBe("available");
    if (result.status === "available") {
      expect(result.requirements.requiredPermissions).toEqual([
        "skill.read",
        "skill.write",
      ]);
      expect(result.requirements.resource).toEqual({
        kind: "identified",
        resourceId: "skill:secured-skill",
      });
      expect(result.requirements.sensitivity).toBe("standard");
    }
    expect(Object.isFrozen(caller)).toBe(false);
    expect(Object.isFrozen(permissions)).toBe(false);
    expect(Object.isFrozen(resource)).toBe(false);
  });

  it("uses exact resource correspondence without wildcard or serialization", () => {
    const authority = new ProcessLocalSkillRequirementsAuthority(
      createRegisteredSkill(manifest()),
      "skill.execute" as never,
      request.resource as never,
      "standard",
    );
    const result = authority.resolveProtectedActionRequirements({
      ...request,
      resource: { kind: "unscoped" },
    });
    expect(result).toEqual({
      status: "unavailable",
      operationId: "skill-op",
      action: "skill.execute",
      resource: { kind: "unscoped" },
    });
  });
});
