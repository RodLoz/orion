import {
  DuplicateSkillIdentifierError,
  InvalidSkillInputError,
  InvalidSkillManifestError,
  InvalidSkillStateError,
  SkillNotFoundError,
  codePointOrder,
  createRegisteredSkill,
  createSkillDiscoveryResult,
  createSkillManifest,
  extractDiscoverSkillsRequest,
  extractGetRegisteredSkillRequest,
  extractRegisterSkillRequest,
  skillCapabilityIdentifier,
  skillIdentifier,
  type DiscoverSkills,
  type GetRegisteredSkill,
  type RegisterSkillManifest,
  type RegisteredSkill,
  type SkillDiscoveryResult,
  type SkillIdentifier,
} from "@orion/core";
import {
  validateExistingCatalog,
  validateResultingCatalog,
  type SkillCatalog,
} from "./skill-state.js";

export type SkillEngineLifecycleState =
  "initialize" | "ready" | "running" | "stopping" | "stopped";

export class SkillEngine
  implements RegisterSkillManifest, GetRegisteredSkill, DiscoverSkills
{
  #state: SkillEngineLifecycleState = "initialize";
  #catalog = new Map<SkillIdentifier, RegisteredSkill>();
  #operating = false;

  public get engineState(): SkillEngineLifecycleState {
    return this.#state;
  }

  public initialize(): void {
    if (this.#state !== "initialize") throw new InvalidSkillStateError();
    this.#state = "ready";
  }

  public start(): void {
    if (this.#state !== "ready") throw new InvalidSkillStateError();
    this.#state = "running";
  }

  public stop(): void {
    if (this.#state !== "running" || this.#operating)
      throw new InvalidSkillStateError();
    this.#state = "stopping";
    this.#state = "stopped";
  }

  public registerSkillManifest(request: unknown): RegisteredSkill {
    this.beginOperation();
    try {
      let source: ReturnType<typeof extractRegisterSkillRequest>;
      try {
        source = extractRegisterSkillRequest(request);
      } catch {
        throw new InvalidSkillInputError();
      }
      let admitted: RegisteredSkill;
      try {
        admitted = createSkillManifest(source.readManifest());
      } catch {
        throw new InvalidSkillManifestError();
      }
      if (this.#catalog.has(admitted.id))
        throw new DuplicateSkillIdentifierError();
      try {
        const registered = createRegisteredSkill(admitted);
        const candidate = new Map(this.#catalog);
        candidate.set(registered.id, registered);
        validateResultingCatalog(candidate);
        this.#catalog = candidate;
        return registered;
      } catch (error) {
        if (error instanceof DuplicateSkillIdentifierError) throw error;
        throw new InvalidSkillStateError();
      }
    } finally {
      this.#operating = false;
    }
  }

  public getRegisteredSkill(request: unknown): RegisteredSkill {
    this.beginOperation();
    try {
      const source = extractGetRegisteredSkillRequest(request);
      let id: SkillIdentifier;
      try {
        id = skillIdentifier(source.readSkillId());
      } catch {
        throw new InvalidSkillInputError();
      }
      const match = this.#catalog.get(id);
      if (match === undefined) throw new SkillNotFoundError();
      try {
        return createRegisteredSkill(match);
      } catch {
        throw new InvalidSkillStateError();
      }
    } catch (error) {
      if (
        error instanceof InvalidSkillInputError ||
        error instanceof SkillNotFoundError ||
        error instanceof InvalidSkillStateError
      )
        throw error;
      throw new InvalidSkillInputError();
    } finally {
      this.#operating = false;
    }
  }

  public discoverSkills(request: unknown): SkillDiscoveryResult {
    this.beginOperation();
    try {
      const source = extractDiscoverSkillsRequest(request);
      let capability;
      try {
        capability = skillCapabilityIdentifier(source.readCapability());
      } catch {
        throw new InvalidSkillInputError();
      }
      const matches = [...this.#catalog.values()]
        .filter((skill) => skill.capabilities.includes(capability))
        .sort((left, right) => codePointOrder(left.id, right.id));
      try {
        return createSkillDiscoveryResult({ capability, matches });
      } catch {
        throw new InvalidSkillStateError();
      }
    } catch (error) {
      if (
        error instanceof InvalidSkillInputError ||
        error instanceof InvalidSkillStateError
      )
        throw error;
      throw new InvalidSkillInputError();
    } finally {
      this.#operating = false;
    }
  }

  private beginOperation(): void {
    if (this.#state !== "running" || this.#operating)
      throw new InvalidSkillStateError();
    try {
      validateExistingCatalog(this.#catalog as SkillCatalog);
    } catch {
      throw new InvalidSkillStateError();
    }
    this.#operating = true;
  }
}
