import { defineConfig, devices } from '@playwright/test';

/**
 * Read environment variables from file.
 * https://github.com/motdotla/dotenv
 */
// import dotenv from 'dotenv';
// import path from 'path';
// dotenv.config({ path: path.resolve(__dirname, '.env') });

/**
 * CI overrides this (see .github/workflows/playwright.yml); local dev uses the
 * IPv6 loopback because `astro dev` binds only [::1] on this machine.
 */
const baseURL = process.env.E2E_BASE_URL ?? 'http://[::1]:4321';

/**
 * See https://playwright.dev/docs/test-configuration.
 */
export default defineConfig({
  testDir: './tests',
  /* Default per-test timeout. Firefox headless is slow on this machine and
     heavy large-file tests can starve its main thread, so give teardown and
     slow actions room to breathe. */
  timeout: 120_000,
  /* Run tests in files in parallel */
  fullyParallel: true,
  /* Fail the build on CI if you accidentally left test.only in the source code. */
  forbidOnly: !!process.env.CI,
  /* Retry on CI only */
  retries: process.env.CI ? 2 : 0,
  /* Single worker. Headless Firefox on this machine is single-threaded and
     gets starved when two heavy large-file tests run at once (page.evaluate
     stalls, context teardown hangs). One at a time is slower but deterministic. */
  workers: 1,
  /* Reporter to use. See https://playwright.dev/docs/test-reporters */
  reporter: [['list'], ['html', { open: 'never' }]],
  /* Shared settings for all the projects below. See https://playwright.dev/docs/api/class-testoptions. */
  use: {
    /* Base URL to use in actions like `await page.goto('')`. Note: `astro dev`
       binds only the IPv6 loopback on this machine, so connect via [::1] by
       default; CI overrides this through the E2E_BASE_URL env var. */
    baseURL,

    /* Collect trace when retrying the failed test. See https://playwright.dev/docs/trace-viewer */
    trace: 'on-first-retry',
  },

  /* Projects for major browsers. */
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },

    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },
  ],

    /* Test against mobile viewports. */
    // {
    //   name: 'Mobile Chrome',
    //   use: { ...devices['Pixel 5'] },
    // },
    // {
    //   name: 'Mobile Safari',
    //   use: { ...devices['iPhone 12'] },
    // },

    /* Test against branded browsers. */
    // {
    //   name: 'Microsoft Edge',
    //   use: { ...devices['Desktop Edge'], channel: 'msedge' },
    // },
    // {
    //   name: 'Google Chrome',
    //   use: { ...devices['Desktop Chrome'], channel: 'chrome' },
    // },

  /* Run your local dev server before starting the tests. `astro dev` refuses to
     start a second instance while a background server is already running, so we
     reuse it and reach it over its IPv6 loopback (Firefox needs [::1], not the
     IPv4 127.0.0.1, because the server never binds IPv4 here). */
  webServer: {
    command: 'npm run dev',
    url: baseURL,
    reuseExistingServer: !process.env.CI,
  },
});
