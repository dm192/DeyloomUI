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

    await expect(html).not.toHaveAttribute("data-dl-motion", "reduced");
    await page.getByTestId("motion-toggle").click();
    await expect(html).toHaveAttribute("data-dl-motion", "reduced");

    await page.getByTestId("motion-toggle").click();
    await expect(html).not.toHaveAttribute("data-dl-motion", "reduced");
  });

  test("sidebar navigation reaches a component page", async ({ page }) => {
    await page.goto("/#/");
    await page.getByRole("link", { name: "Button", exact: true }).first().click();
    await expect(page).toHaveURL(/#\/components\/button$/);
    await expect(page.getByRole("heading", { level: 1, name: "Button" })).toBeVisible();
  });
});
