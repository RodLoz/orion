import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const executable = fileURLToPath(
  new URL(
    "../node_modules/dependency-cruiser/bin/dependency-cruise.mjs",
    import.meta.url,
  ),
);
const fixtures = [
  {
    path: "services/context/architecture-fixtures/bootstrap-dependency.ts",
    rule: "context-engine-must-not-depend-on-bootstrap-or-infrastructure",
  },
  {
    path: "services/context/architecture-fixtures/external-package.ts",
    rule: "context-engine-must-not-depend-on-external-packages",
  },
  {
    path: "services/context/architecture-fixtures/identity-implementation-dependency.ts",
    rule: "context-engine-must-not-depend-on-qualified-source-engines",
  },
  {
    path: "services/context/architecture-fixtures/memory-implementation-dependency.ts",
    rule: "context-engine-must-not-depend-on-qualified-source-engines",
  },
  {
    path: "services/context/architecture-fixtures/knowledge-implementation-dependency.ts",
    rule: "context-engine-must-not-depend-on-qualified-source-engines",
  },
];

for (const fixture of fixtures) {
  const verification = spawnSync(
    process.execPath,
    [
      executable,
      fixture.path,
      "--config",
      ".dependency-cruiser.cjs",
      "--output-type",
      "json",
    ],
    { encoding: "utf8" },
  );
  let violations = [];
  try {
    violations = (
      JSON.parse(verification.stdout ?? "{}").summary?.violations ?? []
    ).map((violation) => violation.rule.name);
  } catch {
    violations = [];
  }
  if (violations.length !== 1 || violations[0] !== fixture.rule) {
    console.error(
      `Context architecture fixture was not isolated: ${fixture.path}`,
    );
    if ((verification.stdout ?? "").length > 0) {
      console.error(verification.stdout);
    }
    process.exitCode = 1;
  }
}

if (process.exitCode !== 1) {
  console.log("Context Engine dependency prohibitions verified.");
}
