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
    path: "services/reasoning/architecture-fixtures/bootstrap-dependency.ts",
    rules: ["reasoning-engine-must-not-depend-on-bootstrap-or-infrastructure"],
  },
  {
    path: "services/reasoning/architecture-fixtures/other-engine-dependency.ts",
    rules: ["reasoning-engine-must-not-depend-on-other-engines"],
  },
  {
    path: "services/reasoning/architecture-fixtures/external-package.ts",
    rules: ["reasoning-engine-must-not-depend-on-external-packages"],
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
      `Reasoning architecture fixture was not isolated: ${fixture.path}`,
    );
    process.exitCode = 1;
  }
}
if (process.exitCode !== 1)
  console.log("Reasoning Engine dependency prohibitions verified.");
