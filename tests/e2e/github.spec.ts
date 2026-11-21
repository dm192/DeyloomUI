import { expect, test } from "@playwright/test";

const REPO_URL = "https://github.com/dm192/DeyloomUI";

test.describe("github star link", () => {
  test("shows the live star count and points at the repository", async ({ page }) => {
    await page.route("https://api.github.com/**", (route) =>
      route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ stargazers_count: 1234 }),
      }),
    );
    await page.goto("/#/");

    const link = page.getByRole("link", { name: /GitHub 仓库/ });
    await expect(link).toBeVisible();
    await expect(link).toHaveAttribute("href", REPO_URL);
    await expect(link).toHaveAttribute("target", "_blank");
    await expect(link).toHaveAttribute("rel", /noreferrer/);
    await expect(link).toHaveAttribute("aria-label", "GitHub 仓库，1234 个 star");
    await expect(link.locator(".github-link__count")).toHaveText("1.2K");
  });

  test("degrades to an icon-only link when the API fails", async ({ page }) => {
    await page.route("https://api.github.com/**", (route) =>
      route.fulfill({ status: 404, contentType: "application/json", body: "{}" }),
    );
    const pageErrors: string[] = [];
    page.on("pageerror", (error) => pageErrors.push(error.message));

    await page.goto("/#/");

    const link = page.getByRole("link", { name: "GitHub 仓库" });
    await expect(link).toBeVisible();
    await expect(link).toHaveAttribute("href", REPO_URL);
    await expect(link.locator(".github-link__count")).toHaveCount(0);
    expect(pageErrors).toEqual([]);
  });
});
