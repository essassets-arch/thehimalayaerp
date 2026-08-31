import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./tests",
  testMatch: ["**/api-bridge/**/*.spec.ts", "**/browser/**/*.spec.ts", "**/responsive/**/*.spec.ts", "**/regression/**/*.spec.ts", "**/security/**/*.spec.ts", "**/data-integrity/**/*.spec.ts", "**/e2e/**/*.spec.ts"],
  timeout: 45_000,
  expect: {
    timeout: 8_000,
  },
  fullyParallel: false,
  workers: 1,
  retries: 0,
  maxFailures: 0,
  reporter: [["list"], ["html", { outputFolder: "playwright-report" }]],
  use: {
    baseURL: process.env.BASE_URL || "http://localhost:3000",
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
    video: "retain-on-failure",
  },
  projects: [
    {
      name: "desktop-chromium",
      use: {
        ...devices["Desktop Chrome"],
      },
    },
    {
      name: "mobile-chromium",
      use: {
        ...devices["Pixel 7"],
      },
    },
    {
      name: "desktop-firefox",
      use: {
        ...devices["Desktop Firefox"],
      },
    },
  ],
  webServer: process.env.EXTERNAL_TEST_STACK === 'true'
    ? undefined
    : {
        command: 'npm run dev',
        url: 'http://127.0.0.1:3000/login',
        reuseExistingServer: true,
        timeout: 180_000,
      },
});
