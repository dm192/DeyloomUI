import { expect, test } from "@playwright/test";

test.use({ colorScheme: "light" });

test.beforeEach(async ({ page }) => {
  // Reduced motion keeps focus/keyboard assertions deterministic: exit animations
  // finish in ~0ms, so nothing is mid-flight while we check visibility.
  await page.emulateMedia({ reducedMotion: "reduce" });
});

test.describe("keyboard and focus", () => {
  test("dialog traps focus, closes on Escape and returns focus", async ({ page }) => {
    await page.goto("/#/harness");
    const trigger = page.getByRole("button", { name: "打开对话框" });
    await trigger.click();

    const dialog = page.getByRole("dialog");
    await expect(dialog).toBeVisible();
    await expect(dialog.getByRole("heading", { name: "对话框标题" })).toBeVisible();

    for (let index = 0; index < 8; index += 1) {
      await page.keyboard.press("Tab");
    }
    const focusInside = await page.evaluate(
      () => document.activeElement?.closest('[role="dialog"]') !== null,
    );
    expect(focusInside).toBe(true);

    await page.keyboard.press("Escape");
    await expect(dialog).toBeHidden();
    await expect(trigger).toBeFocused();
  });

  test("tabs move selection with arrow keys", async ({ page }) => {
    await page.goto("/#/harness");
    const first = page.getByRole("tab", { name: "第一页" });
    await first.focus();
    await expect(first).toHaveAttribute("aria-selected", "true");

    await page.keyboard.press("ArrowRight");
    const second = page.getByRole("tab", { name: "第二页" });
    await expect(second).toHaveAttribute("aria-selected", "true");
    await expect(page.getByText("第二页内容")).toBeVisible();

    await page.keyboard.press("Home");
    await expect(first).toHaveAttribute("aria-selected", "true");
  });

  test("dropdown menu opens with keyboard and selects an item", async ({ page }) => {
    await page.goto("/#/harness");
    const trigger = page.getByRole("button", { name: "更多操作" });
    await trigger.focus();
    await page.keyboard.press("Enter");

    const menu = page.getByRole("menu");
    await expect(menu).toBeVisible();

    await page.keyboard.press("ArrowDown");
    await page.keyboard.press("Enter");
    await expect(menu).toBeHidden();
  });

  test("select opens and commits a keyboard choice", async ({ page }) => {
    await page.goto("/#/harness");
    const trigger = page.getByRole("combobox", { name: "选择示例" });
    await trigger.focus();
    await page.keyboard.press("Enter");
    await expect(page.getByRole("listbox")).toBeVisible();
    await page.keyboard.press("ArrowDown");
    await page.keyboard.press("Enter");
    await expect(trigger).toHaveText(/选项/);
  });

  test("segmented control is reachable and switchable", async ({ page }) => {
    await page.goto("/#/harness");
    const group = page.getByRole("radiogroup", { name: "周期" });
    await expect(group).toBeVisible();
    await group.getByRole("radio", { name: "日" }).click();
    await expect(group.getByRole("radio", { name: "日" })).toHaveAttribute("aria-checked", "true");
  });
});
