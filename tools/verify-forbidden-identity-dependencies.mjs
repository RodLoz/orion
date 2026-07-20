import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const executable = fileURLToPath(
  new URL(
    "../node_modules/dependency-cruiser/bin/dependency-cruise.mjs",
    import.meta.url,
  ),
);
const verification = spawnSync(
  process.execPath,
  [
    executable,
    "services/identity/architecture-fixtures",
    "--config",
    ".dependency-cruiser.cjs",
    "--output-type",
    "err-long",
  ],
  { encoding: "utf8" },
);

const output = `${verification.stdout ?? ""}${verification.stderr ?? ""}`;
const expectedRules = [
  "identity-engine-must-not-depend-on-concrete-outer-layers",
  "identity-engine-must-not-depend-on-external-packages",
];

if (
  verification.status === 0 ||
  expectedRules.some((rule) => !output.includes(rule))
) {
  console.error("Identity Engine architecture rules were not enforced.");
  if (output.length > 0) {
    console.error(output);
  }
  process.exitCode = 1;
} else {
  console.log("Identity Engine dependency prohibitions verified.");
}
