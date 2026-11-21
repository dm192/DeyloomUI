import { expect, test } from "@playwright/test";

test.describe("motion degradation", () => {
  test("OS reduced-motion collapses every CSS duration token", async ({ page }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto("/#/components/button");
    await page.locator("main h1").first().waitFor();

    const durations = await page.evaluate(() => {
      const element = document.querySelector(".dl-btn");
      if (!element) return null;
      const style = getComputedStyle(element);
      return {
        duration: style.transitionDuration,
        property: style.transitionProperty,
      };
    });

    expect(durations).not.toBeNull();
    const seconds = durations!.duration
      .split(",")
      .map((value) => Number.parseFloat(value))
      .filter((value) => Number.isFinite(value));

    expect(seconds.length).toBeGreaterThan(0);
    expect(Math.max(...seconds)).toBeLessThan(0.01);
  });

  test("the in-app toggle applies the same degradation without an OS change", async ({ page }) => {
    await page.goto("/#/components/button");
    await page.locator("main h1").first().waitFor();

    const readMaxDuration = async () =>
      page.evaluate(() => {
        const element = document.querySelector(".dl-btn");
        if (!element) return Number.POSITIVE_INFINITY;
        return Math.max(
          ...getComputedStyle(element)
            .transitionDuration.split(",")
            .map((value) => Number.parseFloat(value))
            .filter((value) => Number.isFinite(value)),
        );
      });

    expect(await readMaxDuration()).toBeGreaterThan(0.01);

    await page.getByRole("button", { name: "减弱动效" }).click();
    expect(await readMaxDuration()).toBeLessThan(0.01);
  });

  test("looping animations are stopped, not just shortened", async ({ page }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto("/#/components/skeleton");
    await page.locator("main h1").first().waitFor();

    const report = await page.evaluate(() => {
      const loops = Array.from(document.querySelectorAll(".dl-anim-loop"));
      return loops
        .map((element) => ({
          className: element.className,
          self: getComputedStyle(element).animationName,
          before: getComputedStyle(element, "::before").animationName,
          after: getComputedStyle(element, "::after").animationName,
        }))
        .filter((entry) => entry.self !== "none" || entry.before !== "none" || entry.after !== "none");
    });

    expect(report, `loops still animating under reduced motion: ${JSON.stringify(report)}`).toEqual([]);
  });

  test("docs specimen animations respect reduced motion", async ({ page }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto("/#/motion");
    await page.locator("main h1").first().waitFor();

    const names = await page.evaluate(() =>
      Array.from(document.querySelectorAll(".stagger-specimen__item")).map(
        (element) => getComputedStyle(element).animationName,
      ),
    );

    expect(names.length).toBeGreaterThan(0);
    expect(names.every((name) => name === "none")).toBe(true);
  });
});
