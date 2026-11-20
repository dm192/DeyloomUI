#!/usr/bin/env node
/**
 * Verifies the *published* artifact, not the source tree: the exports map must
 * point at files that exist, the entry bundles must actually import under Node,
 * the client directive must survive bundling, and the core API must be present.
 */
import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";

const repoRoot = path.resolve(import.meta.dirname, "..");
const packageDir = path.join(repoRoot, "packages", "react");
const manifest = JSON.parse(readFileSync(path.join(packageDir, "package.json"), "utf8"));

const problems = [];

for (const [subpath, target] of Object.entries(manifest.exports)) {
  const values = typeof target === "string" ? { default: target } : target;
  for (const [condition, file] of Object.entries(values)) {
    if (typeof file !== "string" || file.endsWith(".json")) continue;
    const resolved = path.join(packageDir, file);
    if (!existsSync(resolved)) problems.push(`exports["${subpath}"].${condition} -> missing ${file}`);
  }
}

const requiredExports = [
  "DeyloomProvider",
  "useDeyloomTheme",
  "useDeyloom",
  "Button",
  "IconButton",
  "springs",
  "tweens",
  "listItem",
];

const entryPath = path.join(packageDir, "dist", "index.js");
if (!existsSync(entryPath)) {
  problems.push("dist/index.js is missing — run `npm run build` first");
} else {
  const code = readFileSync(entryPath, "utf8");
  const firstStatement = code.trimStart().split("\n")[0];
  if (!firstStatement?.includes("use client")) {
    problems.push('dist/index.js does not start with the "use client" directive');
  }

  try {
    const module = await import(pathToFileURL(entryPath).href);
    for (const name of requiredExports) {
      if (!(name in module)) problems.push(`dist/index.js does not export "${name}"`);
    }
  } catch (error) {
    problems.push(`importing dist/index.js failed: ${error.message}`);
  }
}

if (problems.length > 0) {
  console.error("✗ package smoke test failed:");
  for (const problem of problems) console.error(`  - ${problem}`);
  process.exit(1);
}

console.log(`✓ package smoke test: ${requiredExports.length} exports present, exports map resolves.`);
