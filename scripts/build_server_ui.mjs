#!/usr/bin/env zx
import "zx/globals";

await fs.move("src/pages/index.tsx", "scripts/.cache/src/pages/index.tsx", { overwrite: true });
await fs.move("src/pages/explore.tsx", "scripts/.cache/src/pages/explore.tsx", { overwrite: true });
await fs.move("src/pages/turtle.tsx", "scripts/.cache/src/pages/turtle.tsx", { overwrite: true });
await fs.move("src/pages/server_ui.tsx", "src/pages/[[...slug]].tsx", { overwrite: true });

let exitCode = 0;
let error = "";

try {
  await $`NEXT_PUBLIC_MODE="integrate" npm run build`;

  await fs.remove("server-ui");
  await fs.move("out", "server-ui");
  await fs.move("server-ui/\[\[...slug\]\]/index.html", "server-ui/index.html");
} catch (processOutput) {
  /** @type {ProcessOutput} */
  const output = processOutput;
  exitCode = output.exitCode;
  error = output.error;
}

await fs.move("scripts/.cache/src/pages/index.tsx", "src/pages/index.tsx");
await fs.move("scripts/.cache/src/pages/explore.tsx", "src/pages/explore.tsx");
await fs.move("scripts/.cache/src/pages/turtle.tsx", "src/pages/turtle.tsx");
await fs.move("src/pages/[[...slug]].tsx", "src/pages/server_ui.tsx");

if (exitCode !== 0) {
  console.error(error);
  process.exit(exitCode);
}
