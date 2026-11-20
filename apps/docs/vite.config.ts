import path from "node:path";
import { fileURLToPath } from "node:url";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

const here = path.dirname(fileURLToPath(import.meta.url));
const libSrc = path.resolve(here, "../../packages/react/src");
const brandDir = path.resolve(here, "../../brand");

// The docs site consumes library *source* so HMR is instant and no build step is
// needed during development. Order matters: exact CSS subpaths before the bare
// package specifier.
export default defineConfig({
  plugins: [react()],
  // Brand assets live at the repository root so the README can reference the same
  // files the docs site serves.
  publicDir: brandDir,
  resolve: {
    alias: [
      { find: "@deyloom/react/styles.css", replacement: path.join(libSrc, "styles/index.css") },
      { find: "@deyloom/react/tokens.css", replacement: path.join(libSrc, "styles/tokens.css") },
      { find: "@deyloom/react/motion", replacement: path.join(libSrc, "motion/index.ts") },
      { find: "@deyloom/react", replacement: path.join(libSrc, "index.ts") },
    ],
  },
  build: {
    target: "es2022",
    cssTarget: ["chrome120", "safari17", "firefox121"],
  },
});
