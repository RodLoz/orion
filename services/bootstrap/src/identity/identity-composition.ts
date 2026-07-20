import type { ResolveCurrentIdentity } from "@orion/core";
import { IdentityEngine } from "@orion/identity";

import { InMemoryIdentitySource } from "./in-memory-identity-source.js";

const DEMONSTRATION_RESOLUTION_REFERENCE = "m1-demonstration-reference";
const DEMONSTRATION_IDENTITY_IDENTIFIER = "orion.identity.demonstration";

export interface IdentityCapabilityComposition {
  readonly resolveCurrentIdentity: ResolveCurrentIdentity;
  readonly demonstrationResolutionReference: string;
}

export function composeIdentityCapability(): IdentityCapabilityComposition {
  const source = new InMemoryIdentitySource([
    {
      resolutionReference: DEMONSTRATION_RESOLUTION_REFERENCE,
      candidateIdentityIdentifier: DEMONSTRATION_IDENTITY_IDENTIFIER,
    },
  ]);

  const engine = new IdentityEngine(source);
  engine.initialize();
  engine.start();

  return Object.freeze({
    resolveCurrentIdentity: engine,
    demonstrationResolutionReference: DEMONSTRATION_RESOLUTION_REFERENCE,
  });
}
