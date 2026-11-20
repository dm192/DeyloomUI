// `tsup` runs Rollup for tree-shaking, and Rollup drops module-level directives,
// so the "use client" banner has to be re-applied to the published entry points
// after bundling. Only entries need it: chunks are internal imports of them.
import path from "node:path";
import { readFile, writeFile } from "node:fs/promises";

const distDir = path.resolve(import.meta.dirname, "..", "dist");
const entries = ["index.js", "index.cjs", "motion.js", "motion.cjs"];
const directive = '"use client";\n';

for (const entry of entries) {
  const file = path.join(distDir, entry);
  let code = await readFile(file, "utf8");

  if (code.startsWith('"use client"') || code.startsWith("'use client'")) {
    console.log(`post  ${entry.padEnd(12)} already marked`);
    continue;
  }

  // CommonJS output opens with 'use strict'; it must stay the first statement.
  const strictPrologue = code.match(/^(?:'use strict'|"use strict");\r?\n/);
  code = strictPrologue
    ? `${strictPrologue[0]}${directive}${code.slice(strictPrologue[0].length)}`
    : `${directive}${code}`;

  await writeFile(file, code);
  console.log(`post  ${entry.padEnd(12)} "use client" prepended`);
}
