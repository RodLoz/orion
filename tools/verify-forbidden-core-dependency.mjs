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
    path: "core/architecture-fixtures/external-package.ts",
    rule: "core-must-not-depend-on-external-packages",
  },
  {
    path: "core/architecture-fixtures/memory-engine-dependency.ts",
    rule: "core-must-not-depend-outward",
  },
  {
    path: "core/architecture-fixtures/knowledge-engine-dependency.ts",
    rule: "core-must-not-depend-outward",
  },
  {
    path: "core/architecture-fixtures/reasoning-engine-dependency.ts",
    rule: "core-must-not-depend-outward",
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
    console.error(`Core architecture rule was not enforced: ${fixture.rule}`);
    if (output.length > 0) console.error(output);
    process.exitCode = 1;
  }
}

if (process.exitCode !== 1) {
  console.log("Core dependency prohibitions verified.");
}
