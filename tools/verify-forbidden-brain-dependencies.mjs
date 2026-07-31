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
    path: "services/brain/architecture-fixtures/bootstrap-dependency.ts",
    rule: "brain-engine-must-not-depend-on-other-engines-or-bootstrap",
  },
  {
    path: "services/brain/architecture-fixtures/other-engine-dependency.ts",
    rule: "brain-engine-must-not-depend-on-other-engines-or-bootstrap",
  },
  {
    path: "services/brain/architecture-fixtures/external-package.ts",
    rule: "brain-engine-must-not-depend-on-external-packages",
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
  if (!violations.includes(fixture.rule)) {
    console.error(
      `Brain architecture fixture was not isolated: ${fixture.path}`,
    );
    process.exitCode = 1;
  }
}

if (process.exitCode !== 1)
  console.log("Brain Engine dependency prohibitions verified.");
