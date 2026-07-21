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
    path: "services/planning/architecture-fixtures/bootstrap-dependency.ts",
    rules: ["planning-engine-must-not-depend-on-bootstrap-or-infrastructure"],
  },
  {
    path: "services/planning/architecture-fixtures/other-engine-dependency.ts",
    rules: ["planning-engine-must-not-depend-on-other-engines"],
  },
  {
    path: "services/planning/architecture-fixtures/external-package.ts",
    rules: ["planning-engine-must-not-depend-on-external-packages"],
  },
  {
    path: "core/architecture-fixtures/planning-engine-dependency.ts",
    rules: ["core-must-not-depend-outward"],
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
  if (
    violations.length !== fixture.rules.length ||
    fixture.rules.some((rule) => !violations.includes(rule))
  ) {
    console.error(
      `Planning architecture fixture was not isolated: ${fixture.path}`,
    );
    process.exitCode = 1;
  }
}
if (process.exitCode !== 1)
  console.log("Planning Engine dependency prohibitions verified.");
