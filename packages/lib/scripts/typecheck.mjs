#!/usr/bin/env node
// Runs the full project typecheck, but doesn't fail the gate on pre-existing errors in
// src/types/asyncapi/** — generated from the AsyncAPI JSON Schema, not hand-maintained.
// tsconfig `exclude` can't do this: excluded files are still type-checked whenever
// something imports them, so filtering tsc's own error output is the only way to scope this.
import { execSync } from "node:child_process";

const IGNORED_PATH_PREFIX = "src/types/asyncapi/";

try {
  execSync("npx tsc -b --force", { stdio: "pipe" });
  console.log("Typecheck passed with no errors.");
} catch (err) {
  const output = err.stdout?.toString() ?? "";
  const errorLines = output.split("\n").filter((line) => /error TS\d+:/.test(line));
  const ignored = errorLines.filter((line) => line.startsWith(IGNORED_PATH_PREFIX));
  const real = errorLines.filter((line) => !line.startsWith(IGNORED_PATH_PREFIX));

  if (real.length > 0) {
    console.log(output);
    console.error(`\n${real.length} typecheck error(s) outside ${IGNORED_PATH_PREFIX} (see above).`);
    process.exit(1);
  }

  console.log(
    `Typecheck passed (ignored ${ignored.length} pre-existing error(s) in generated ${IGNORED_PATH_PREFIX}).`,
  );
}
