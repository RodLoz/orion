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
    "core/architecture-fixtures/external-package.ts",
    "--config",
    ".dependency-cruiser.cjs",
    "--output-type",
    "err-long",
  ],
  {
    encoding: "utf8",
  },
);

const output = `${verification.stdout ?? ""}${verification.stderr ?? ""}`;
const expectedRule = "core-must-not-depend-on-external-packages";

if (verification.status === 0 || !output.includes(expectedRule)) {
  console.error("Core external-package architecture rule was not enforced.");
  if (output.length > 0) {
    console.error(output);
  }
  process.exitCode = 1;
} else {
  console.log("Core external-package prohibition verified.");
}
