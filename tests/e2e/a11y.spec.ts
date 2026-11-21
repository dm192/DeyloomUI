import AxeBuilder from "@axe-core/playwright";
import { expect, test, type Page } from "@playwright/test";

const PAGES = [
  { name: "home", path: "/#/" },
  { name: "components index", path: "/#/components" },
  { name: "button", path: "/#/components/button" },
  { name: "slider", path: "/#/components/slider" },
  { name: "tabs", path: "/#/components/tabs" },
  { name: "scroll area", path: "/#/components/scroll-area" },
  { name: "separator", path: "/#/components/separator" },
  { name: "toggle group", path: "/#/components/toggle-group" },
  { name: "alert dialog", path: "/#/components/alert-dialog" },
  { name: "hover card", path: "/#/components/hover-card" },
  { name: "foundations", path: "/#/foundations" },
  { name: "motion lab", path: "/#/motion" },
  { name: "performance", path: "/#/performance" },
];

async function audit(page: Page) {
  // Freeze motion so axe sees settled layout; reduced motion is a supported state.
  await page.emulateMedia({ reducedMotion: "reduce" });
  const results = await new AxeBuilder({ page })
    .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"])
    .analyze();

  const blocking = results.violations.filter(
    (violation) => violation.impact === "serious" || violation.impact === "critical",
  );

  const summary = blocking.map((violation) => ({
    id: violation.id,
    impact: violation.impact,
    help: violation.help,
    nodes: violation.nodes.slice(0, 3).map((node) => node.target.join(" ")),
  }));

  expect(summary, JSON.stringify(summary, null, 2)).toEqual([]);
}

test.describe("accessibility", () => {
  for (const entry of PAGES) {
    test(`${entry.name} page has no serious axe violations`, async ({ page }) => {
      await page.goto(entry.path);
      await page.locator("main h1").first().waitFor();
      await audit(page);
    });
  }

  test("dark theme keeps contrast", async ({ page }) => {
    await page.addInitScript(() => window.localStorage.setItem("deyloom-theme", "dark"));
    await page.goto("/#/");
    await page.locator("main h1").first().waitFor();
    await expect(page.locator("html")).toHaveAttribute("data-dl-theme", "dark");
    await audit(page);
  });

  test("test harness is clean", async ({ page }) => {
    await page.goto("/#/harness");
    await page.getByTestId("harness").waitFor();
    await audit(page);
  });

  test("mobile navigation drawer is accessible", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("/#/");
    await page.locator("main h1").first().waitFor();
    await page.getByRole("button", { name: /打开目录/ }).click();
    await expect(page.getByRole("dialog", { name: "文档目录" })).toBeVisible();
    await audit(page);
  });
});
