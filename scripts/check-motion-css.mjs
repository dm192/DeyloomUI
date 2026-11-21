#!/usr/bin/env node
/**
 * Motion contract guard.
 *
 * The library's performance promise is not "we were careful" — it is enforced:
 *
 *   1. No transition may animate a layout-affecting property. The only escape is
 *      an inline `/* dl-motion-allow: <reason> *\/` comment on the rule.
 *   2. No @keyframes block may animate a layout-affecting property either.
 *   3. Every `animation: ... infinite` must have an explicit reduced-motion off
 *      switch: a rule that sets `animation: none` for the same selector inside
 *      `@media (prefers-reduced-motion: reduce)` or under
 *      `[data-dl-motion="reduced"]`. Being marked `.dl-anim-loop` counts too,
 *      because base.css stops those globally.
 *   4. `will-change` needs a per-rule rationale.
 *
 * Run: node scripts/check-motion-css.mjs  (part of `npm run verify`)
 */
import { readFileSync, readdirSync } from "node:fs";
import path from "node:path";

const repoRoot = path.resolve(import.meta.dirname, "..");
const cssRoot = path.join(repoRoot, "packages", "react", "src");

const LAYOUT_PROPERTIES = new Set([
  "width",
  "height",
  "min-width",
  "min-height",
  "max-width",
  "max-height",
  "inline-size",
  "block-size",
  "margin",
  "margin-top",
  "margin-right",
  "margin-bottom",
  "margin-left",
  "margin-inline",
  "margin-block",
  "padding",
  "padding-top",
  "padding-right",
  "padding-bottom",
  "padding-left",
  "padding-inline",
  "padding-block",
  "top",
  "right",
  "bottom",
  "left",
  "inset",
  "font-size",
  "line-height",
  "letter-spacing",
  "grid-template-rows",
  "grid-template-columns",
  "grid-template",
  "flex-basis",
  "flex-grow",
  "background-position",
  "background-size",
  "all",
]);

const ALLOW_COMMENT = /dl-motion-allow\s*:\s*([^*]+)/;

function collectCss(dir) {
  const out = [];
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) out.push(...collectCss(full));
    else if (entry.name.endsWith(".css")) out.push(full);
  }
  return out;
}

function lineStarts(src) {
  const starts = [0];
  for (let index = 0; index < src.length; index += 1) {
    if (src[index] === "\n") starts.push(index + 1);
  }
  return starts;
}

function lineOf(starts, offset) {
  let low = 0;
  let high = starts.length - 1;
  while (low < high) {
    const mid = Math.ceil((low + high) / 2);
    if (starts[mid] <= offset) low = mid;
    else high = mid - 1;
  }
  return low + 1;
}

/** Blank out comments while preserving offsets, and remember allow-comments. */
function stripComments(src) {
  const allowRanges = [];
  const blanked = src.replace(/\/\*[\s\S]*?\*\//g, (match, offset) => {
    if (ALLOW_COMMENT.test(match)) allowRanges.push([offset, offset + match.length]);
    return match.replace(/[^\n]/g, " ");
  });
  return { blanked, allowRanges };
}

function isAllowed(allowRanges, start, end) {
  return allowRanges.some(([from, to]) => to >= start - 260 && from <= end);
}

/** Recursively collect style rules, keeping the chain of enclosing at-rules. */
function collectRules(src, start = 0, end = src.length, context = [], out = []) {
  let index = start;
  while (index < end) {
    const open = src.indexOf("{", index);
    if (open === -1 || open >= end) break;
    const selector = src.slice(index, open).trim();
    let depth = 1;
    let close = open + 1;
    while (close < end && depth > 0) {
      if (src[close] === "{") depth += 1;
      else if (src[close] === "}") depth -= 1;
      close += 1;
    }
    const bodyEnd = close - 1;

    if (selector.startsWith("@")) {
      if (selector.startsWith("@keyframes") || selector.startsWith("@-webkit-keyframes")) {
        out.push({ type: "keyframes", selector, body: src.slice(open + 1, bodyEnd), context, start: index, end: close });
      } else {
        collectRules(src, open + 1, bodyEnd, [...context, selector], out);
      }
    } else if (selector.length > 0) {
      out.push({ type: "rule", selector, body: src.slice(open + 1, bodyEnd), context, start: index, end: close });
    }
    index = close;
  }
  return out;
}

function splitTopLevel(value, separator) {
  const parts = [];
  let depth = 0;
  let current = "";
  for (const char of value) {
    if (char === "(") depth += 1;
    if (char === ")") depth -= 1;
    if (char === separator && depth === 0) {
      parts.push(current);
      current = "";
    } else {
      current += char;
    }
  }
  parts.push(current);
  return parts;
}

function isReducedMotionContext(rule) {
  const inMedia = rule.context.some((entry) => entry.includes("prefers-reduced-motion"));
  const inAttribute =
    rule.selector.includes('[data-dl-motion="reduced"]') ||
    rule.selector.includes("[data-dl-motion='reduced']");
  return inMedia || inAttribute;
}

function stopsAnimation(body) {
  return /(?:^|;)\s*animation(?:-name)?\s*:\s*(?:none|0s|0ms)\s*(?:;|$)/.test(body);
}

const violations = [];
let rulesScanned = 0;
let loopsChecked = 0;

for (const file of collectCss(cssRoot)) {
  const relative = path.relative(repoRoot, file);
  const raw = readFileSync(file, "utf8");
  const { blanked, allowRanges } = stripComments(raw);
  const starts = lineStarts(raw);
  const rules = collectRules(blanked);

  const offSwitches = rules
    .filter((rule) => rule.type === "rule" && isReducedMotionContext(rule) && stopsAnimation(rule.body))
    .map((rule) => rule.selector.replace(/\s+/g, " ").trim());

  for (const rule of rules) {
    const allowed = isAllowed(allowRanges, rule.start, rule.end);

    if (rule.type === "keyframes") {
      const declarations = rule.body.matchAll(/([a-z-]+)\s*:\s*([^;{}]+);/g);
      for (const declaration of declarations) {
        const property = declaration[1];
        const name = rule.selector.replace(/^@[a-z-]*keyframes\s+/, "");
        if (LAYOUT_PROPERTIES.has(property) && !allowed) {
          violations.push({
            file: relative,
            line: lineOf(starts, rule.start + (declaration.index ?? 0)),
            message: `@keyframes "${name}" animates layout property "${property}"`,
          });
        }
      }
      continue;
    }

    rulesScanned += 1;

    const transitions = rule.body.matchAll(/(?:^|;)\s*transition(?:-property)?\s*:\s*([^;]+)/g);
    for (const match of transitions) {
      const value = match[1] ?? "";
      for (const part of splitTopLevel(value, ",")) {
        const property = part.trim().split(/\s+/)[0] ?? "";
        if (LAYOUT_PROPERTIES.has(property) && !allowed) {
          violations.push({
            file: relative,
            line: lineOf(starts, rule.start + (match.index ?? 0)),
            message: `selector "${rule.selector}" transitions layout property "${property}"`,
          });
        }
        // Repainting a shadow every frame is only acceptable on small controls.
        if (property === "box-shadow" && !allowed) {
          violations.push({
            file: relative,
            line: lineOf(starts, rule.start + (match.index ?? 0)),
            message: `selector "${rule.selector}" transitions box-shadow without a dl-motion-allow rationale (paint on large surfaces is not allowed)`,
          });
        }
      }
    }

    const animations = rule.body.matchAll(/(?:^|;)\s*animation(?:-name)?\s*:\s*([^;]+)/g);
    for (const match of animations) {
      const value = match[1] ?? "";
      if (!/\binfinite\b/.test(value)) continue;
      loopsChecked += 1;

      const selector = rule.selector.replace(/\s+/g, " ").trim();
      const markedLoop = selector.includes("dl-anim-loop");
      const hasOffSwitch = offSwitches.some(
        (offSelector) => offSelector === selector || offSelector.endsWith(` ${selector}`),
      );

      if (!markedLoop && !hasOffSwitch && !allowed) {
        violations.push({
          file: relative,
          line: lineOf(starts, rule.start + (match.index ?? 0)),
          message: `selector "${selector}" runs an infinite animation with no reduced-motion off switch (add .dl-anim-loop, a [data-dl-motion="reduced"] / @media rule setting animation: none, or a dl-motion-allow comment)`,
        });
      }
    }

    const willChange = rule.body.match(/(?:^|;)\s*will-change\s*:/);
    if (willChange && !allowed) {
      violations.push({
        file: relative,
        line: lineOf(starts, rule.start + (willChange.index ?? 0)),
        message: `selector "${rule.selector}" uses will-change without an explicit dl-motion-allow rationale`,
      });
    }
  }
}

if (violations.length > 0) {
  console.error(`\n✗ motion guard: ${violations.length} violation(s)\n`);
  for (const violation of violations) {
    console.error(`  ${violation.file}:${violation.line}`);
    console.error(`    ${violation.message}`);
  }
  console.error("");
  process.exit(1);
}

console.log(
  `✓ motion guard: ${rulesScanned} rules scanned, ${loopsChecked} infinite animations all degradable, no layout animation.`,
);
