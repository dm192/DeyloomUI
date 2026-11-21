import { expect, test } from "@playwright/test";

const ROUTES = [
  "/",
  "/#/components",
  "/#/components/button",
  "/#/components/slider",
  "/#/components/scroll-area",
  "/#/components/separator",
  "/#/components/toggle-group",
  "/#/components/alert-dialog",
  "/#/components/hover-card",
  "/#/foundations",
  "/#/motion",
  "/#/performance",
];

const IGNORED_CONSOLE = [/Reduced Motion/i, /Download the React DevTools/i];

test.describe("app shell", () => {
  // Keep the GitHub request deterministic and offline-safe: the star count is
  // not what these assertions are about.
  test.beforeEach(async ({ page }) => {
    await page.route("https://api.github.com/**", (route) =>
      route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ stargazers_count: 1234 }),
      }),
    );
  });

  test("every route renders without runtime errors", async ({ page }) => {
    const pageErrors: string[] = [];
    const consoleErrors: string[] = [];

    page.on("pageerror", (error) => pageErrors.push(error.message));
    page.on("console", (message) => {
      if (message.type() !== "error") return;
      const text = message.text();
      if (IGNORED_CONSOLE.some((pattern) => pattern.test(text))) return;
      consoleErrors.push(text);
    });

    for (const route of ROUTES) {
      await page.goto(route);
      await expect(page.locator("main")).toBeVisible();
      await expect(page.locator("h1").first()).toBeVisible();
    }

    expect(pageErrors, `page errors:\n${pageErrors.join("\n")}`).toEqual([]);
    expect(consoleErrors, `console errors:\n${consoleErrors.join("\n")}`).toEqual([]);
  });

  test("theme toggle flips the root theme attribute", async ({ page }) => {
    await page.goto("/#/");
    const html = page.locator("html");
    const initial = await html.getAttribute("data-dl-theme");

    await page.getByRole("button", { name: /切换到(深色|浅色)主题/ }).click();

    const next = await html.getAttribute("data-dl-theme");
    expect(next).not.toBe(initial);
    expect(["light", "dark"]).toContain(next);
  });

  test("reduced motion toggle switches the motion attribute", async ({ page }) => {
    await page.goto("/#/");
    const html = page.locator("html");
    const toggle = page.getByRole("button", { name: "减弱动效" });

    await expect(toggle).toHaveAttribute("aria-pressed", "false");
    await expect(html).not.toHaveAttribute("data-dl-motion", "reduced");

    await toggle.click();
    await expect(toggle).toHaveAttribute("aria-pressed", "true");
    await expect(html).toHaveAttribute("data-dl-motion", "reduced");

    await toggle.click();
    await expect(toggle).toHaveAttribute("aria-pressed", "false");
    await expect(html).not.toHaveAttribute("data-dl-motion", "reduced");
  });

  test("sidebar navigation reaches a component page", async ({ page }) => {
    await page.goto("/#/");
    await page.getByRole("link", { name: "Button", exact: true }).first().click();
    await expect(page).toHaveURL(/#\/components\/button$/);
    await expect(page.getByRole("heading", { level: 1, name: "Button" })).toBeVisible();
  });

  test("docs shell uses the library's own components", async ({ page }) => {
    await page.goto("/#/");
    await expect(page.locator(".topbar .dl-toggle")).toBeVisible();
    await expect(page.locator(".topbar .dl-btn").first()).toBeVisible();
    await expect(page.locator(".topbar .github-link")).toBeVisible();
    await expect(page.locator(".sidebar .dl-scroll-area")).toHaveCount(1);
    await expect(page.locator(".study.dl-card")).toBeVisible();

    await page.goto("/#/motion");
    await expect(page.locator(".dl-slider")).toHaveCount(2);
    await expect(page.locator('input[type="range"]')).toHaveCount(0);

    await page.goto("/#/components");
    await expect(page.locator(".component-card .dl-card")).toHaveCount(
      await page.locator(".component-card").count(),
    );

    await page.goto("/#/performance");
    await expect(page.locator(".budget__item.dl-card")).toHaveCount(3);
    await expect(page.locator(".dl-progress")).toHaveCount(3);
  });
});
