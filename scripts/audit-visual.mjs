#!/usr/bin/env node
/**
 * Visual audit sweep (manual tool, not part of `npm run verify`).
 *
 * Visits every docs route in light and dark at desktop size, plus a mobile pass,
 * screenshots them into `test-results/audit/`, and fails on the cheap structural
 * regressions it can check without a human: horizontal overflow, runtime errors
 * and failed console requests.
 *
 * Usage:
 *   npm run build:docs && npm run preview   # in another shell
 *   node scripts/audit-visual.mjs           # BASE=http://127.0.0.1:4173
 *   node scripts/audit-visual.mjs --base http://127.0.0.1:5173
 */
import { mkdirSync, readFileSync, readdirSync, rmSync, writeFileSync } from "node:fs";
import path from "node:path";
import { chromium } from "@playwright/test";

const repoRoot = path.resolve(import.meta.dirname, "..");
const outDir = path.join(repoRoot, "test-results", "audit");

const baseArgIndex = process.argv.indexOf("--base");
const BASE =
  (baseArgIndex !== -1 ? process.argv[baseArgIndex + 1] : process.env.BASE) ??
  "http://127.0.0.1:4173";

const DOC_ROUTES = ["/#/", "/#/components", "/#/foundations", "/#/motion", "/#/performance"];

function collectDemoFiles(dir, out = []) {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) collectDemoFiles(full, out);
    else if (entry.name.endsWith(".tsx") || entry.name.endsWith(".ts")) out.push(full);
  }
  return out;
}

function componentRoutes() {
  const demoDir = path.join(repoRoot, "apps", "docs", "src", "demos");
  const slugs = new Set();
  for (const file of collectDemoFiles(demoDir)) {
    const text = readFileSync(file, "utf8");
    for (const match of text.matchAll(/slug:\s*"([^"]+)"/g)) slugs.add(match[1]);
  }
  return [...slugs].sort().map((slug) => `/#/components/${slug}`);
}

const ROUTES = [...DOC_ROUTES, ...componentRoutes()];

function routeName(route) {
  const slug = route.replace(/^\/#\/?/, "").replace(/\//g, "-");
  return slug.length > 0 ? slug : "home";
}

function writeResults(problems, summary) {
  writeFileSync(
    path.join(outDir, "summary.json"),
    `${JSON.stringify({ base: BASE, routes: ROUTES.length, problems, ...summary }, null, 2)}\n`,
  );
}

async function main() {
  rmSync(outDir, { recursive: true, force: true });
  mkdirSync(outDir, { recursive: true });

  const browser = await chromium.launch({ channel: "chrome", headless: true });
  const problems = [];
  const consoleProblems = [];
  let captures = 0;

  const visit = async ({ route, theme, viewport, suffix }) => {
    const context = await browser.newContext({ viewport });
    await context.addInitScript(
      (value) => {
        try {
          window.localStorage.setItem("deyloom-theme", value);
        } catch {
          /* ignore */
        }
      },
      theme,
    );
    const page = await context.newPage();
    const errors = [];
    page.on("pageerror", (error) => errors.push(`pageerror: ${error.message}`));
    page.on("console", (message) => {
      if (message.type() === "error" && !/Reduced Motion/i.test(message.text())) {
        errors.push(`console: ${message.text()}`);
      }
    });

    await page.goto(`${BASE}${route}`, { waitUntil: "networkidle" });
    await page.locator("main h1").first().waitFor({ timeout: 15_000 });
    await page.waitForTimeout(250);

    const overflow = await page.evaluate(() => {
      const root = document.documentElement;
      return root.scrollWidth - root.clientWidth;
    });
    if (overflow > 1) {
      problems.push({ route, theme, kind: "horizontal-overflow", detail: `${overflow}px` });
    }
    for (const error of errors) {
      consoleProblems.push({ route, theme, detail: error });
    }

    const file = path.join(outDir, `${routeName(route)}-${theme}${suffix}.png`);
    await page.screenshot({ path: file, fullPage: false });
    captures += 1;
    await context.close();
  };

  for (const route of ROUTES) {
    for (const theme of ["light", "dark"]) {
      await visit({ route, theme, viewport: { width: 1440, height: 960 }, suffix: "" });
    }
    await visit({ route, theme: "light", viewport: { width: 390, height: 844 }, suffix: "-mobile" });
  }

  await browser.close();

  writeResults(
    problems.map((problem) => ({ ...problem, console: consoleProblems.filter((entry) => entry.route === problem.route) })),
    { captures, consoleProblems },
  );

  console.log(`audit: ${ROUTES.length} routes, ${captures} captures in ${path.relative(repoRoot, outDir)}`);
  if (consoleProblems.length > 0) {
    console.error(`\n✗ ${consoleProblems.length} runtime/console error(s):`);
    for (const entry of consoleProblems.slice(0, 20)) {
      console.error(`  ${entry.route} [${entry.theme}] ${entry.detail}`);
    }
  }
  if (problems.length > 0) {
    console.error(`\n✗ ${problems.length} layout problem(s):`);
    for (const problem of problems.slice(0, 20)) {
      console.error(`  ${problem.route} [${problem.theme}] ${problem.kind} ${problem.detail}`);
    }
    process.exit(1);
  }
  if (consoleProblems.length > 0) process.exit(1);
  console.log("✓ no overflow or runtime errors");
}

await main();
