import { mkdirSync } from "node:fs";
import path from "node:path";
import { expect, test, type Page } from "@playwright/test";

const OUT_DIR = path.resolve(import.meta.dirname, "..", "..", "screenshots");

test.beforeAll(() => {
  mkdirSync(OUT_DIR, { recursive: true });
});

async function settle(page: Page) {
  // Stop animations and wait for fonts so captures are byte-stable.
  await page.emulateMedia({ reducedMotion: "reduce", colorScheme: "light" });
  await page.evaluate(() => document.fonts.ready);
  await page.waitForTimeout(150);
}

/** Navigate and wait for the lazily loaded page chunk to actually render. */
async function open(page: Page, route: string) {
  await page.goto(route);
  await page.locator("main h1").first().waitFor();
  await settle(page);
}

async function shot(page: Page, name: string) {
  await page.screenshot({ path: path.join(OUT_DIR, `${name}.png`), fullPage: false });
}

test.describe("visual captures", () => {
  test("home, light and dark", async ({ page }) => {
    await open(page, "/#/");
    await expect(page.locator("main h1").first()).toBeVisible();
    await shot(page, "home-light");

    await page.addInitScript(() => window.localStorage.setItem("deyloom-theme", "dark"));
    await page.reload();
    await page.locator("main h1").first().waitFor();
    await settle(page);
    await expect(page.locator("html")).toHaveAttribute("data-dl-theme", "dark");
    await shot(page, "home-dark");
  });

  test("components index and a component page", async ({ page }) => {
    await open(page, "/#/components");
    await shot(page, "components");

    await open(page, "/#/components/button");
    await shot(page, "button");
  });

  test("dialog open state", async ({ page }) => {
    await open(page, "/#/harness");
    await page.getByRole("button", { name: "打开对话框" }).click();
    await expect(page.getByRole("dialog")).toBeVisible();
    await page.waitForTimeout(220);
    await shot(page, "dialog");
  });

  test("motion lab", async ({ page }) => {
    await open(page, "/#/motion");
    await shot(page, "motion");
  });

  test("foundations and the brand section", async ({ page }) => {
    await open(page, "/#/foundations");
    await shot(page, "foundations");

    const brandGrid = page.locator(".brand-grid");
    await brandGrid.scrollIntoViewIfNeeded();
    await expect(brandGrid.locator("img").first()).toBeVisible();
    await page.waitForTimeout(250);
    await shot(page, "brand");
  });

  test("mobile home", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await open(page, "/#/");
    await shot(page, "mobile-home");
  });
});
