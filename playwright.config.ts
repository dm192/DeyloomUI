import { defineConfig, devices } from "@playwright/test";

const BASE_URL = "http://127.0.0.1:4173";

export default defineConfig({
  testDir: "./tests/e2e",
  timeout: 45_000,
  expect: { timeout: 8_000 },
  fullyParallel: false,
  workers: 1,
  retries: 0,
  reporter: [["list"]],
  outputDir: "test-results/artifacts",
  use: {
    baseURL: BASE_URL,
    trace: "retain-on-failure",
    video: "off",
    // The machine ships a stable Chrome; using it avoids a 150MB browser download.
    channel: "chrome",
  },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"], channel: "chrome", viewport: { width: 1440, height: 960 } },
    },
  ],
  webServer: {
    command: "npm run preview -w @deyloom/docs",
    url: BASE_URL,
    reuseExistingServer: true,
    timeout: 90_000,
    stdout: "ignore",
    stderr: "pipe",
  },
});
