import { defineConfig } from "tsup";

/**
 * JS only. CSS is bundled separately by scripts/build-css.mjs, so components never
 * import CSS at runtime — consumers opt in with a single `@deyloom/react/styles.css`.
 * Declarations come from `tsc -p tsconfig.build.json` (TypeScript 7 has no
 * compiler API, which is what tsup's `--dts` needs).
 */
export default defineConfig({
  entry: { index: "src/index.ts", motion: "src/motion/index.ts" },
  format: ["esm", "cjs"],
  target: "es2022",
  platform: "browser",
  dts: false,
  clean: true,
  sourcemap: true,
  treeshake: true,
  splitting: true,
  external: [/^react($|\/)/, /^react-dom($|\/)/, /^motion($|\/)/, /^radix-ui($|\/)/, /^clsx($|\/)/],
  outExtension: ({ format }) => ({ js: format === "cjs" ? ".cjs" : ".js" }),
  esbuildOptions(options) {
    options.legalComments = "none";
  },
});
