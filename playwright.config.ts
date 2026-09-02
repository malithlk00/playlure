import "dotenv/config";
import { defineConfig, devices } from "@playwright/test";
import { defineBddConfig, cucumberReporter } from "playwright-bdd";

// --- UI: Wikipedia -------------------------------------------------------
const uiTestDir = defineBddConfig({
  features: "src/test/ui/features/**/*.feature",
  steps: ["src/test/ui/steps/**/*.ts", "src/test/ui/fixtures/**/*.ts"],
  outputDir: ".features-gen/ui",
});

// --- API: JSONPlaceholder --------------------------------------------------
const apiTestDir = defineBddConfig({
  features: "src/test/api/features/**/*.feature",
  steps: ["src/test/api/steps/**/*.ts", "src/test/api/fixtures/**/*.ts"],
  outputDir: ".features-gen/api",
});

// --- Performance: navigation timing, Core Web Vitals, resource timing, ---
// --- HAR recording, custom user-flow durations - against Wikipedia -------
const perfTestDir = defineBddConfig({
  features: "src/test/performance/features/**/*.feature",
  steps: ["src/test/performance/steps/**/*.ts", "src/test/performance/fixtures/**/*.ts"],
  outputDir: ".features-gen/performance",
});

const UI_BASE_URL = process.env.UI_BASE_URL || "https://en.wikipedia.org";
const API_BASE_URL = process.env.API_BASE_URL || "https://jsonplaceholder.typicode.com";

export default defineConfig({
  // Both defineBddConfig() calls write into their own outputDir; Playwright
  // picks up whichever one each project's testDir points at.
  timeout: 120_000,
  expect: { timeout: 10_000 },
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  workers: process.env.CI ? 2 : undefined,

  // Three report formats, all landing under reports/ so a single workflow
  // step can upload or publish them:
  //  - html: the standard interactive Playwright report
  //  - allure-playwright: richer history/trends via `npm run report:allure`
  //  - cucumberReporter('json', ...): the file Playlure's backend ingests
  reporter: [
    ["list"],
    ["html", { outputFolder: "reports/playwright-report", open: "never" }],
    ["allure-playwright", { resultsDir: "reports/allure-results", detail: true }],
    cucumberReporter("json", { outputFile: "reports/cucumber-report/report.json" }),
  ],

  use: {
    trace: "on-first-retry",
    screenshot: "only-on-failure",
    video: "retain-on-failure",
  },

  projects: [
    {
      name: "ui",
      testDir: uiTestDir,
      use: { ...devices["Desktop Chrome"], baseURL: UI_BASE_URL },
    },
    {
      name: "api",
      testDir: apiTestDir,
      use: { baseURL: API_BASE_URL },
    },
    {
      // Chromium only: Core Web Vitals PerformanceObserver entry types
      // (largest-contentful-paint, layout-shift, first-input/event timing
      // that INP relies on) are still primarily Chromium-specific, same as
      // the reference article notes.
      name: "performance",
      testDir: perfTestDir,
      use: { ...devices["Desktop Chrome"], baseURL: UI_BASE_URL },
    },
  ],
});
