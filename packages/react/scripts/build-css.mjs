// Bundles the layered CSS sources into the two published artefacts.
// lightningcss resolves `@import`, keeps `@layer` order, and downlevels to the
// browsers listed in README support notes.
import path from "node:path";
import { mkdir, writeFile } from "node:fs/promises";
import { bundle } from "lightningcss";

const root = path.resolve(import.meta.dirname, "..");
const srcDir = path.join(root, "src", "styles");
const outDir = path.join(root, "dist");

const targets = {
  chrome: 120 << 16,
  edge: 120 << 16,
  firefox: 121 << 16,
  safari: 17 << 16,
};

await mkdir(outDir, { recursive: true });

async function build(sourceFile, outFile) {
  const { code } = bundle({
    filename: path.join(srcDir, sourceFile),
    minify: true,
    targets,
  });
  await writeFile(path.join(outDir, outFile), code);
  console.log(`css   ${outFile.padEnd(12)} ${(code.byteLength / 1024).toFixed(1)} KB`);
}

await build("index.css", "styles.css");
await build("tokens.css", "tokens.css");
