#!/usr/bin/env zx
import "zx/globals";

await fs.move("src/pages/server_ui.tsx", "scripts/.cache/src/pages/server_ui.tsx", { overwrite: true });

let exitCode = 0;
let error = "";

try {
  await $`npm run build`;
} catch (processOutput) {
  /** @type {ProcessOutput} */
  const output = processOutput;
  exitCode = output.exitCode;
  error = output.error;
}

await fs.move("scripts/.cache/src/pages/server_ui.tsx", "src/pages/server_ui.tsx");

if (exitCode !== 0) {
  console.error(error);
  process.exit(exitCode);
}
