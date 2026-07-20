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
    path: "services/memory/architecture-fixtures/bootstrap-dependency.ts",
    rule: "memory-engine-must-not-depend-on-bootstrap-or-infrastructure",
  },
  {
    path: "services/memory/architecture-fixtures/concrete-store-dependency.ts",
    rule: "memory-engine-must-not-depend-on-concrete-memory-store",
  },
  {
    path: "services/memory/architecture-fixtures/external-package.ts",
    rule: "memory-engine-must-not-depend-on-external-packages",
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
      "err-long",
    ],
    { encoding: "utf8" },
  );
  const output = `${verification.stdout ?? ""}${verification.stderr ?? ""}`;
  if (verification.status === 0 || !output.includes(fixture.rule)) {
    console.error(`Memory architecture rule was not enforced: ${fixture.rule}`);
    if (output.length > 0) console.error(output);
    process.exitCode = 1;
  }
}

if (process.exitCode !== 1) {
  console.log("Memory Engine dependency prohibitions verified.");
}
