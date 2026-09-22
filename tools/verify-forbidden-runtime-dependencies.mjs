import { readFileSync } from "node:fs";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import ts from "typescript";

const dependencyCruiser = fileURLToPath(
  new URL(
    "../node_modules/dependency-cruiser/bin/dependency-cruise.mjs",
    import.meta.url,
  ),
);
const runtimeSourcePath = "services/runtime/src/runtime.ts";
const fixturePath =
  "services/runtime/architecture-fixtures/forbidden-dependencies.ts";
const bootstrapModule = "@orion/bootstrap/dist/index.js";
const approvedBootstrapImports = new Map([
  ["composeBoundedApplicationCapability", false],
  ["BoundedApplicationCapabilityComposition", true],
]);

function cruise(path) {
  const result = spawnSync(
    process.execPath,
    [
      dependencyCruiser,
      path,
      "--config",
      ".dependency-cruiser.cjs",
      "--output-type",
      "json",
    ],
    { encoding: "utf8" },
  );
  try {
    return JSON.parse(result.stdout ?? "{}");
  } catch {
    console.error(`Runtime dependency evidence was not valid JSON: ${path}`);
    if (result.stderr) console.error(result.stderr);
    process.exit(1);
  }
}

function bootstrapBoundaryFailures(sourceText, fileName) {
  const sourceFile = ts.createSourceFile(
    fileName,
    sourceText,
    ts.ScriptTarget.Latest,
    true,
    ts.ScriptKind.TS,
  );
  const imports = sourceFile.statements.filter(
    (statement) =>
      ts.isImportDeclaration(statement) &&
      ts.isStringLiteral(statement.moduleSpecifier) &&
      statement.moduleSpecifier.text === bootstrapModule,
  );
  if (imports.length !== 1) {
    return [`expected exactly one import from ${bootstrapModule}`];
  }

  const clause = imports[0].importClause;
  if (
    clause === undefined ||
    clause.name !== undefined ||
    clause.namedBindings === undefined ||
    !ts.isNamedImports(clause.namedBindings)
  ) {
    return ["Bootstrap/C1 must use one named import without a default import"];
  }

  const failures = [];
  const observed = new Map();
  for (const element of clause.namedBindings.elements) {
    const importedName = (element.propertyName ?? element.name).text;
    if (observed.has(importedName)) {
      failures.push(`duplicate Bootstrap import: ${importedName}`);
      continue;
    }
    observed.set(importedName, element.isTypeOnly);
    if (!approvedBootstrapImports.has(importedName)) {
      failures.push(`unapproved Bootstrap root import: ${importedName}`);
      continue;
    }
    if (approvedBootstrapImports.get(importedName) !== element.isTypeOnly) {
      failures.push(`incorrect type-only status: ${importedName}`);
    }
  }
  for (const approvedName of approvedBootstrapImports.keys()) {
    if (!observed.has(approvedName)) {
      failures.push(`missing approved Bootstrap/C1 import: ${approvedName}`);
    }
  }
  return failures;
}

const productionCruise = cruise(runtimeSourcePath);
const productionViolations = productionCruise.summary?.violations ?? [];
if (productionViolations.length !== 0) {
  console.error("Runtime production source violates architecture policy.");
  console.error(JSON.stringify(productionViolations, null, 2));
  process.exit(1);
}

const productionSource = readFileSync(runtimeSourcePath, "utf8");
const productionBoundaryFailures = bootstrapBoundaryFailures(
  productionSource,
  runtimeSourcePath,
);
if (productionBoundaryFailures.length !== 0) {
  console.error(productionBoundaryFailures.join("\n"));
  process.exit(1);
}

const unauthorizedExpansion = `
import {
  composeBoundedApplicationCapability,
  composeBrainCapability,
  type BoundedApplicationCapabilityComposition,
} from "${bootstrapModule}";
`;
if (
  !bootstrapBoundaryFailures(
    unauthorizedExpansion,
    "unauthorized-runtime.ts",
  ).some((failure) => failure.includes("composeBrainCapability"))
) {
  console.error(
    "Runtime Bootstrap symbol verifier did not reject an unauthorized root export.",
  );
  process.exit(1);
}

const fixtureCruise = cruise(fixturePath);
const fixtureViolations = fixtureCruise.summary?.violations ?? [];
const requiredViolations = [
  {
    to: "services/bootstrap/src/diagnostic.ts",
    rule: "runtime-must-use-approved-bootstrap-entrypoint",
  },
  {
    to: "services/brain/src/brain-engine.ts",
    rule: "runtime-must-not-depend-on-concrete-engines-or-outer-layers",
  },
  {
    to: "apps/architecture-fixtures/runtime-forbidden-target.ts",
    rule: "runtime-must-not-depend-on-concrete-engines-or-outer-layers",
  },
  {
    to: "infrastructure/architecture-fixtures/skill-forbidden-target.ts",
    rule: "runtime-must-not-depend-on-concrete-engines-or-outer-layers",
  },
  {
    to: "vitest",
    rule: "runtime-must-not-depend-on-unrelated-external-packages",
  },
];

for (const required of requiredViolations) {
  const observed = fixtureViolations.some(
    (violation) =>
      violation.from === fixturePath &&
      (violation.to === required.to ||
        violation.unresolvedTo === required.to) &&
      violation.rule?.name === required.rule,
  );
  if (!observed) {
    console.error(
      `Runtime architecture fixture was not rejected: ${required.to} (${required.rule})`,
    );
    process.exitCode = 1;
  } else {
    console.log(
      `Runtime forbidden dependency verified: ${required.to} (${required.rule})`,
    );
  }
}

if (process.exitCode !== 1) {
  console.log(
    "Runtime Bootstrap/C1 production import accepted and unauthorized root-symbol expansion rejected.",
  );
  console.log(
    "Runtime dependency prohibitions and Bootstrap/C1 symbol boundary verified.",
  );
}
