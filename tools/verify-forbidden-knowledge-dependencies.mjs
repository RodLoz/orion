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
    path: "services/knowledge/architecture-fixtures/bootstrap-dependency.ts",
    rules: ["knowledge-engine-must-not-depend-on-bootstrap-or-infrastructure"],
  },
  {
    path: "services/knowledge/architecture-fixtures/concrete-store-dependency.ts",
    rules: ["knowledge-engine-must-not-depend-on-concrete-knowledge-store"],
  },
  {
    path: "services/knowledge/architecture-fixtures/other-engine-dependency.ts",
    rules: ["knowledge-engine-must-not-depend-on-other-engines"],
  },
  {
    path: "services/knowledge/architecture-fixtures/external-package.ts",
    rules: ["knowledge-engine-must-not-depend-on-external-packages"],
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
    const report = JSON.parse(verification.stdout ?? "{}");
    violations = (report.summary?.violations ?? []).map(
      (violation) => violation.rule.name,
    );
  } catch {
    violations = [];
  }
  if (
    violations.length !== fixture.rules.length ||
    fixture.rules.some((rule) => !violations.includes(rule))
  ) {
    console.error(
      `Knowledge architecture fixture was not isolated: ${fixture.path}`,
    );
    if ((verification.stdout ?? "").length > 0) {
      console.error(verification.stdout);
    }
    process.exitCode = 1;
  }
}

if (process.exitCode !== 1) {
  console.log("Knowledge Engine dependency prohibitions verified.");
}
