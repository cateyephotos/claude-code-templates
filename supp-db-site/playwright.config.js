// @ts-check
const { defineConfig } = require("playwright/test");

/**
 * Playwright configuration for SupplementDB integration tests.
 *
 * Tests are written against a running nginx container (port 8080)
 * so Docker must be up before running: docker compose up supp-db -d
 */
module.exports = defineConfig({
  testDir: "./tests",
  testMatch: "**/*.spec.js",
  timeout: 30_000,
  expect: { timeout: 10_000 },
  fullyParallel: true,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: [["list"], ["html", { open: "never" }]],

  use: {
    baseURL: "http://localhost:8080",
    trace: "on-first-retry",
    screenshot: "only-on-failure",
    video: "retain-on-failure",
  },

  projects: [
    {
      name: "chromium",
      use: { browserName: "chromium" },
    },
  ],

  /* Optionally start the container before tests */
  // webServer: {
  //   command: 'docker compose up supp-db',
  //   url: 'http://localhost:8080/health',
  //   reuseExistingServer: true,
  //   timeout: 60_000,
  // },
});
