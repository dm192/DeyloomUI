import { expect, test } from "@playwright/test";

const WIDTHS = [360, 768, 1440];

test.describe("responsive layout", () => {
  for (const width of WIDTHS) {
    test(`no horizontal overflow at ${width}px`, async ({ page }) => {
      await page.setViewportSize({ width, height: 900 });
      for (const route of ["/#/", "/#/components/button", "/#/foundations", "/#/performance"]) {
        await page.goto(route);
        await page.locator("main h1").first().waitFor();

        const overflow = await page.evaluate(() => {
          const root = document.documentElement;
          return root.scrollWidth - root.clientWidth;
        });
        expect(overflow, `${route} overflows by ${overflow}px at ${width}px`).toBeLessThanOrEqual(1);
      }
    });
  }

  test("mobile navigation opens in the library Drawer and closes on navigate", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("/#/");

    const toggle = page.getByRole("button", { name: /打开目录/ });
    await expect(toggle).toBeVisible();

    const drawer = page.getByRole("dialog", { name: "文档目录" });
    await expect(drawer).toBeHidden();

    await toggle.click();
    await expect(drawer).toBeVisible();

    await drawer.getByRole("link", { name: "设计变量" }).click();
    await expect(page).toHaveURL(/#\/foundations$/);
    await expect(drawer).toBeHidden();
  });

  test("mobile drawer closes on Escape", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("/#/");
    await page.getByRole("button", { name: /打开目录/ }).click();

    const drawer = page.getByRole("dialog", { name: "文档目录" });
    await expect(drawer).toBeVisible();
    await page.keyboard.press("Escape");
    await expect(drawer).toBeHidden();
  });

  test("desktop shows the sticky sidebar without a toggle", async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto("/#/");
    const sidebar = page.getByRole("complementary", { name: "文档目录" });
    await expect(sidebar).toBeVisible();
    await expect(page.getByRole("button", { name: /打开目录/ })).toBeHidden();
  });
});
