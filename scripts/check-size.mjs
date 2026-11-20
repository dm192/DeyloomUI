#!/usr/bin/env node
/**
 * Bundle budget gate + the size report the docs site renders.
 *
 * Sums the gzipped bytes of everything that ships and compares them to the
 * budgets in this file. Fails the build when a component quietly grows the
 * bundle. Also rewrites apps/docs/src/generated/sizes.json so the docs
 * performance page shows measured numbers, never estimates.
 */
import { gzipSync } from "node:zlib";
import { existsSync, readFileSync, readdirSync, writeFileSync } from "node:fs";
import path from "node:path";

const repoRoot = path.resolve(import.meta.dirname, "..");
const distDir = path.join(repoRoot, "packages", "react", "dist");
const reportFile = path.join(repoRoot, "apps", "docs", "src", "generated", "sizes.json");

const BUDGETS = {
  // Measured at 0.1.0: 17.2 KB ESM + 8.7 KB CSS. The budget leaves roughly 40%
  // headroom for new components, but fails on accidental weight regressions.
  jsGzip: 24 * 1024,
  cssGzip: 11 * 1024,
};

const REQUIRED = ["index.js", "index.cjs", "motion.js", "motion.cjs", "styles.css", "tokens.css"];

if (!existsSync(distDir)) {
  console.error("✗ size: packages/react/dist is missing. Run `npm run build` first.");
  process.exit(1);
}

const missing = REQUIRED.filter((file) => !existsSync(path.join(distDir, file)));
if (missing.length > 0) {
  console.error(`✗ size: missing build output: ${missing.join(", ")}. Run \`npm run build\`.`);
  process.exit(1);
}

const files = readdirSync(distDir)
  .filter((file) => file.endsWith(".js") || file.endsWith(".cjs") || file.endsWith(".css"))
  .sort();

const entries = files.map((file) => {
  const content = readFileSync(path.join(distDir, file));
  return { file, raw: content.byteLength, gzip: gzipSync(content, { level: 9 }).byteLength };
});

// A consumer ships *one* module format and (usually) the full stylesheet, so the
// budget counts the ESM output and styles.css. CJS and tokens.css are still
// listed in the report for transparency but are not double-counted: tokens.css
// is a strict subset of styles.css and nobody imports both formats at once.
const totals = entries.reduce(
  (accumulator, entry) => {
    if (entry.file === "styles.css") accumulator.cssGzip += entry.gzip;
    else if (entry.file.endsWith(".js")) accumulator.jsGzip += entry.gzip;
    return accumulator;
  },
  { jsGzip: 0, cssGzip: 0 },
);

writeFileSync(
  reportFile,
  `${JSON.stringify(
    {
      generatedAt: new Date().toISOString(),
      budgets: BUDGETS,
      totals,
      entries,
    },
    null,
    2,
  )}\n`,
);

const kb = (bytes) => (bytes / 1024).toFixed(1);
const failures = [];

for (const [kind, budget] of Object.entries(BUDGETS)) {
  const used = totals[kind];
  const mark = used > budget ? "✗" : "✓";
  console.log(`${mark} ${kind.padEnd(8)} ${kb(used).padStart(7)} KB gzip / ${kb(budget)} KB budget`);
  if (used > budget) failures.push(`${kind} is ${kb(used - budget)} KB over budget`);
}

for (const entry of entries) {
  console.log(`    ${entry.file.padEnd(22)} ${kb(entry.raw).padStart(7)} KB raw   ${kb(entry.gzip).padStart(6)} KB gzip`);
}

if (failures.length > 0) {
  console.error(`\n✗ size budget exceeded:\n  - ${failures.join("\n  - ")}`);
  process.exit(1);
}

console.log(`\n✓ size: report written to ${path.relative(repoRoot, reportFile)}`);
