import { expect, test } from "@playwright/test";

/**
 * Regression suite for the defects fixed in the second pass. These assert
 * geometry/behaviour the unit tests cannot see (jsdom has no layout).
 */

test.describe("slider geometry", () => {
  test("fills from the start and follows the pointer", async ({ page }) => {
    await page.goto("/#/components/slider");
    await page.locator("main h1").first().waitFor();
    await page.waitForTimeout(300);

    const track = await page.locator(".dl-slider__track").first().boundingBox();
    const thumb = await page.locator(".dl-slider__thumb").first().boundingBox();
    expect(track).not.toBeNull();
    expect(thumb).not.toBeNull();

    const fillRatio = await page.evaluate(() => {
      const slider = document.querySelector(".dl-slider");
      const trackElement = slider?.querySelector(".dl-slider__track");
      const fill = slider?.querySelector(".dl-slider__fill");
      if (!trackElement || !fill) return null;
      return fill.getBoundingClientRect().width / trackElement.getBoundingClientRect().width;
    });
    expect(fillRatio).not.toBeNull();
    expect(fillRatio!).toBeGreaterThan(0.05);

    await page.mouse.move(thumb!.x + thumb!.width / 2, thumb!.y + thumb!.height / 2);
    await page.mouse.down();

    const samples: { ratio: number; centerDelta: number; fillDelta: number }[] = [];
    for (const ratio of [0.25, 0.5, 0.75]) {
      const targetX = track!.x + track!.width * ratio;
      await page.mouse.move(targetX, track!.y + track!.height / 2, { steps: 8 });
      await page.evaluate(() => new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve))));

      const measured = await page.evaluate(() => {
        const slider = document.querySelector(".dl-slider");
        const thumbElement = slider?.querySelector(".dl-slider__thumb");
        const fill = slider?.querySelector(".dl-slider__fill");
        const trackElement = slider?.querySelector(".dl-slider__track");
        if (!thumbElement || !fill || !trackElement) return null;
        const thumbRect = thumbElement.getBoundingClientRect();
        const fillRect = fill.getBoundingClientRect();
        const trackRect = trackElement.getBoundingClientRect();
        return {
          thumbCenterX: thumbRect.x + thumbRect.width / 2,
          thumbCenterY: thumbRect.y + thumbRect.height / 2,
          fillRight: fillRect.right,
          trackCenterY: trackRect.y + trackRect.height / 2,
        };
      });

      expect(measured).not.toBeNull();
      samples.push({
        ratio,
        centerDelta: Math.abs(measured!.thumbCenterX - targetX),
        fillDelta: Math.abs(measured!.fillRight - targetX),
      });
      expect(Math.abs(measured!.thumbCenterY - measured!.trackCenterY)).toBeLessThan(1.5);
    }
    await page.mouse.up();

    for (const sample of samples) {
      // The fill edge tracks the pointer exactly; the thumb keeps Radix's
      // in-bounds offset near the ends (max ~6px) so it never overflows.
      expect(sample.fillDelta, `fill at ${sample.ratio}`).toBeLessThan(2);
      const centerTolerance = sample.ratio === 0.5 ? 1.5 : 6.5;
      expect(sample.centerDelta, `thumb center at ${sample.ratio}`).toBeLessThan(centerTolerance);
    }
  });
});

test.describe("tabs height transition", () => {
  test("height changes through intermediate frames instead of jumping", async ({ page }) => {
    await page.goto("/#/harness");
    await page.getByTestId("tabs-height").waitFor();
    const root = page.locator('[data-testid="tabs-height"] .dl-tabs');
    const read = () => root.evaluate((element) => Number(element.getBoundingClientRect().height.toFixed(1)));

    await page.getByRole("tab", { name: "高面板" }).click();
    await expect.poll(read).toBeGreaterThan(150);
    await page.waitForTimeout(300);
    const tall = await read();

    // Sample inside the page on animation frames: a Playwright round-trip per
    // frame would be too slow to see a 220ms transition.
    await page.evaluate(() => {
      const element = document.querySelector('[data-testid="tabs-height"] .dl-tabs');
      if (!element) throw new Error("tabs fixture missing");
      const frames: number[] = [];
      (window as unknown as { __tabsFrames: number[]; __tabsStop: boolean }).__tabsFrames = frames;
      (window as unknown as { __tabsStop: boolean }).__tabsStop = false;
      const tick = () => {
        frames.push(element.getBoundingClientRect().height);
        if (!(window as unknown as { __tabsStop: boolean }).__tabsStop) {
          requestAnimationFrame(tick);
        }
      };
      requestAnimationFrame(tick);
    });

    await page.getByRole("tab", { name: "短面板" }).click();
    await page.waitForTimeout(450);
    const frames: number[] = await page.evaluate(() => {
      (window as unknown as { __tabsStop: boolean }).__tabsStop = true;
      return (window as unknown as { __tabsFrames: number[] }).__tabsFrames;
    });

    const rounded = frames.map((height) => Math.round(height));
    const distinct = new Set(rounded);
    expect(distinct.size, `frames: ${rounded.join(", ")}`).toBeGreaterThan(3);
    expect(Math.max(...frames)).toBeLessThanOrEqual(tall + 8);
    expect(rounded[rounded.length - 1]!).toBeLessThan(tall / 2);
    expect(rounded.some((height) => height < tall - 40 && height > tall / 2)).toBe(true);

    // Only one panel may be in the flow while switching.
    await expect(page.locator('[data-testid="tabs-height"] [role="tabpanel"]')).toHaveCount(1);
  });

  test("reduced motion switches instantly", async ({ page }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto("/#/harness");
    await page.getByTestId("tabs-height").waitFor();
    const root = page.locator('[data-testid="tabs-height"] .dl-tabs');
    await page.getByRole("tab", { name: "高面板" }).click();
    const tall = await root.evaluate((element) => Number(element.getBoundingClientRect().height.toFixed(1)));
    await page.getByRole("tab", { name: "短面板" }).click();
    await page.waitForTimeout(30);
    const short = await root.evaluate((element) => Number(element.getBoundingClientRect().height.toFixed(1)));
    expect(short).toBeLessThan(tall / 2);
  });
});

test.describe("toast stack", () => {
  test("remaining cards animate when one is dismissed", async ({ page }) => {
    await page.goto("/#/harness");
    await page.getByRole("button", { name: "触发通知" }).waitFor();
    const trigger = page.getByRole("button", { name: "触发通知" });
    for (let index = 0; index < 3; index += 1) {
      await trigger.click();
      await page.waitForTimeout(250);
    }
    await expect(page.locator(".dl-toast")).toHaveCount(3);

    const readTops = () =>
      page.evaluate(() =>
        Array.from(document.querySelectorAll(".dl-toast")).map((card) =>
          Number(card.getBoundingClientRect().top.toFixed(1)),
        ),
      );

    const before = await readTops();
    // Dismiss the card closest to the anchored edge: the other two must move.
    await page.evaluate(() => {
      const closes = document.querySelectorAll(".dl-toast__close");
      closes[closes.length - 1]?.dispatchEvent(new MouseEvent("click", { bubbles: true }));
    });

    const frames: number[][] = [];
    for (let index = 0; index < 12; index += 1) {
      await page.waitForTimeout(25);
      frames.push(await readTops());
    }

    const firstCardTops = frames
      .map((tops) => tops[0])
      .filter((top): top is number => typeof top === "number");
    expect(firstCardTops.length).toBeGreaterThan(2);
    const distinct = new Set(firstCardTops.map((top) => Math.round(top)));
    expect(distinct.size, `first card tops: ${firstCardTops.join(", ")}`).toBeGreaterThan(2);
    const finalTop = firstCardTops[firstCardTops.length - 1]!;
    expect(finalTop).toBeGreaterThan(before[0]! + 20);
  });
});

test.describe("scroll coverage", () => {
  test("ScrollArea renders a themed thumb and a focusable viewport", async ({ page }) => {
    await page.goto("/#/components/scroll-area");
    await page.locator("main h1").first().waitFor();
    // Scope to the page content: the docs sidebar is itself a ScrollArea.
    const area = page.locator("main .dl-scroll-area").first();
    await area.scrollIntoViewIfNeeded();
    await area.hover();
    await page.waitForTimeout(300);

    await expect(area.locator(".dl-scroll-area__bar--vertical")).toBeVisible();
    const thumbColor = await area
      .locator(".dl-scroll-area__thumb")
      .evaluate((thumb) => getComputedStyle(thumb).backgroundColor);
    expect(thumbColor).not.toBe("rgba(0, 0, 0, 0)");

    const viewport = area.locator(".dl-scroll-area__viewport");
    await expect(viewport).toHaveAttribute("tabindex", "0");
    await expect(viewport).toHaveAttribute("role", "region");
  });

  test("long select lists scroll with visible affordances", async ({ page }) => {
    await page.goto("/#/components/select");
    await page.locator("main h1").first().waitFor();
    await page.waitForTimeout(300);
    await page.getByRole("combobox", { name: "选择时区" }).click();
    await page.waitForTimeout(400);

    const viewport = page.locator(".dl-select-viewport");
    await expect(viewport).toBeVisible();

    const scrollButtons = page.locator(".dl-select-scroll-button");
    expect(await scrollButtons.count()).toBeGreaterThan(0);
    await expect(scrollButtons.first()).toBeVisible();

    // Scroll the way a user does (wheel). Programmatic scrollTop fights Radix's
    // one-time selected-item scroll on open, which is not a user path.
    const viewportBox = await viewport.boundingBox();
    expect(viewportBox).not.toBeNull();
    await page.mouse.move(viewportBox!.x + viewportBox!.width / 2, viewportBox!.y + 60);
    await page.mouse.wheel(0, 320);
    await page.waitForTimeout(250);
    expect(await viewport.evaluate((element) => element.scrollTop)).toBeGreaterThan(0);
  });

  test("native scroll surfaces use the themed scrollbar recipe", async ({ page }) => {
    await page.goto("/#/components/textarea");
    await page.locator("main h1").first().waitFor();
    await page.waitForTimeout(300);

    const textarea = page.locator(".dl-textarea").first();
    await expect(textarea).toBeVisible();
    const scrollbarColor = await textarea.evaluate((element) => getComputedStyle(element).scrollbarColor);
    expect(scrollbarColor).not.toBe("auto");

    const panelRecipe = await page.evaluate(() => {
      const root = document.documentElement;
      return {
        color: getComputedStyle(root).scrollbarColor,
        width: getComputedStyle(root).scrollbarWidth,
      };
    });
    expect(panelRecipe.color).not.toBe("auto");
  });

  test.describe("home spring race", () => {
    test("autoplays once, then replays from the same start", async ({ page }) => {
      await page.goto("/#/");
      await page.locator("main h1").first().waitFor();

      const race = page.locator(".spring-race--hero");
      await expect(race).toBeVisible();
      await expect(race.locator(".spring-race__lane")).toHaveCount(4);

      const balls = race.locator(".spring-race__ball");
      const trigger = race.locator(".spring-race__head button");
      // One-shot autoplay switches the trigger label to "再跑一次".
      await expect(trigger).toHaveText("再跑一次", { timeout: 5000 });
      await page.waitForTimeout(1400);

      const settled = await balls.first().evaluate((el) => getComputedStyle(el).transform);
      expect(settled).not.toBe("none");

      await trigger.click();
      await page.waitForTimeout(120);
      const midFlight = await balls.first().evaluate((el) => getComputedStyle(el).transform);
      expect(midFlight).not.toBe(settled);

      await page.waitForTimeout(1400);
      const transforms = await balls.evaluateAll((els) =>
        els.map((el) => getComputedStyle(el).transform),
      );
      // Same displacement, same endpoint; only the spring differs.
      expect(new Set(transforms).size).toBe(1);
    });

    test("reduced motion shows the static comparison", async ({ page }) => {
      await page.emulateMedia({ reducedMotion: "reduce" });
      await page.goto("/#/");

      const race = page.locator(".spring-race--hero");
      await expect(race).toBeVisible();
      await expect(race.locator(".spring-race__head button")).toHaveCount(0);
      await expect(race.locator(".spring-race__hint")).toBeVisible();
    });
  });
});
