import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const executable = fileURLToPath(
  new URL(
    "../node_modules/dependency-cruiser/bin/dependency-cruise.mjs",
    import.meta.url,
  ),
);
const fixtures = [
  [
    "services/security/architecture-fixtures/bootstrap-dependency.ts",
    "security-engine-must-not-depend-on-bootstrap-or-infrastructure",
  ],
  [
    "services/security/architecture-fixtures/infrastructure-dependency.ts",
    "security-engine-must-not-depend-on-bootstrap-or-infrastructure",
  ],
  [
    "services/security/architecture-fixtures/other-engine-dependency.ts",
    "security-engine-must-not-depend-on-other-engines",
  ],
  [
    "services/security/architecture-fixtures/external-package.ts",
    "security-engine-must-not-depend-on-external-packages",
  ],
  [
    "core/architecture-fixtures/security-engine-dependency.ts",
    "core-must-not-depend-outward",
  ],
];
for (const [path, rule] of fixtures) {
  const result = spawnSync(
    process.execPath,
    [
      executable,
      path,
      "--config",
      ".dependency-cruiser.cjs",
      "--output-type",
      "json",
    ],
    { encoding: "utf8" },
  );
  let rules = [];
  try {
    rules = (JSON.parse(result.stdout ?? "{}").summary?.violations ?? []).map(
      (violation) => violation.rule.name,
    );
  } catch {
    rules = [];
  }
  if (rules.length !== 1 || rules[0] !== rule) {
    console.error(`Security architecture fixture was not isolated: ${path}`);
    process.exitCode = 1;
  }
}
if (process.exitCode !== 1)
  console.log("Security Engine dependency prohibitions verified.");
