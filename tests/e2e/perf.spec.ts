import { expect, test } from "@playwright/test";

interface FrameSample {
  frames: number;
  avg: number;
  p95: number;
  max: number;
}

test.describe("frame sampling", () => {
  test("12 concurrent toasts keep p95 frame time sane", async ({ page }) => {
    await page.goto("/#/performance");
    await page.locator("main h1").first().waitFor();

    const sample: FrameSample = await page.evaluate(async () => {
      const button = Array.from(document.querySelectorAll("button")).find((element) =>
        element.textContent?.includes("同时触发"),
      );
      if (!button) throw new Error("stress button missing");

      button.click();

      const deltas: number[] = [];
      let running = true;
      let last = performance.now();
      const tick = (now: number) => {
        deltas.push(now - last);
        last = now;
        if (running) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);

      await new Promise((resolve) => setTimeout(resolve, 1500));
      running = false;

      const sorted = [...deltas].sort((a, b) => a - b);
      return {
        frames: deltas.length,
        avg: deltas.reduce((sum, value) => sum + value, 0) / Math.max(1, deltas.length),
        p95: sorted[Math.min(sorted.length - 1, Math.floor(sorted.length * 0.95))] ?? 0,
        max: sorted[sorted.length - 1] ?? 0,
      };
    });

    // Headless frame timing is noisy by nature; this is a regressions tripwire,
    // not a benchmark. The reported numbers go into the delivery notes.
    console.log(
      `[perf] frames=${sample.frames} avg=${sample.avg.toFixed(1)}ms p95=${sample.p95.toFixed(1)}ms max=${sample.max.toFixed(1)}ms`,
    );

    expect(sample.frames).toBeGreaterThan(20);
    expect(sample.p95).toBeLessThan(60);
    expect(sample.avg).toBeLessThan(40);
  });
});
