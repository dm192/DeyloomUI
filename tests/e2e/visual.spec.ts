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

/** The hero spring race autoplays once; wait for the resting state so captures are stable. */
async function settleRace(page: Page) {
  await expect(page.locator(".spring-race__head button")).toHaveText("再跑一次", { timeout: 5000 });
  await page.waitForTimeout(1200);
}

test.describe("visual captures", () => {
  // Deterministic star count: the GitHub entry must look the same on every run.
  test.beforeEach(async ({ page }) => {
    await page.route("https://api.github.com/**", (route) =>
      route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ stargazers_count: 1234 }),
      }),
    );
  });

  test("home, light and dark", async ({ page }) => {
    await open(page, "/#/");
    await expect(page.locator("main h1").first()).toBeVisible();
    await settleRace(page);
    await shot(page, "home-light");

    // Mount the dark theme with motion enabled too: otherwise the reload would
    // pick up settle()'s reduced-motion emulation and hide the hero trigger.
    await page.emulateMedia({ colorScheme: "light", reducedMotion: "no-preference" });
    await page.addInitScript(() => window.localStorage.setItem("deyloom-theme", "dark"));
    await page.reload();
    await page.locator("main h1").first().waitFor();
    await settle(page);
    await expect(page.locator("html")).toHaveAttribute("data-dl-theme", "dark");
    await settleRace(page);
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

  test("new primitives", async ({ page }) => {
    await open(page, "/#/components/scroll-area");
    await page.locator(".dl-scroll-area").first().hover();
    await page.waitForTimeout(250);
    await shot(page, "scroll-area");

    await open(page, "/#/components/toggle-group");
    await shot(page, "toggle-group");

    await open(page, "/#/components/separator");
    await shot(page, "separator");

    await open(page, "/#/components/alert-dialog");
    const alertTrigger = page.getByRole("button", { name: /删除|确认|打开/ }).first();
    if (await alertTrigger.count()) {
      await alertTrigger.click();
      await page.waitForTimeout(260);
      await shot(page, "alert-dialog");
      await page.keyboard.press("Escape");
    }
  });

  test("mobile home and navigation drawer", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await open(page, "/#/");
    await settleRace(page);
    await shot(page, "mobile-home");

    await page.getByRole("button", { name: /打开目录/ }).click();
    await expect(page.getByRole("dialog", { name: "文档目录" })).toBeVisible();
    await page.waitForTimeout(300);
    await shot(page, "mobile-drawer");
  });
});
