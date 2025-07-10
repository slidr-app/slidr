import {defineConfig, devices} from '@playwright/test';

/**
 * Read environment variables from file.
 * https://github.com/motdotla/dotenv
 */
// require('dotenv').config();

// export const STORAGE_STATE = path.join(dirname, 'playwright/.auth/user.json');

/**
 * See https://playwright.dev/docs/test-configuration.
 */
/* eslint-disable n/prefer-global/process */
export default defineConfig({
  testDir: './src',
  testMatch: '**/*.e2e.ts',
  // TestDir: './e2e',
  /* Run tests in files in parallel */
  fullyParallel: true,
  /* Fail the build on CI if you accidentally left test.only in the source code. */
  forbidOnly: Boolean(process.env.CI),
  /* Retry on CI only */
  retries: process.env.CI ? 2 : 0,
  /* Opt out of parallel tests on CI. */
  workers: process.env.CI ? 1 : undefined,
  /* Reporter to use. See https://playwright.dev/docs/test-reporters */
  reporter: 'html',
  /* Shared settings for all the projects below. See https://playwright.dev/docs/api/class-testoptions. */
  use: {
    /* Base URL to use in actions like `await page.goto('/')`. */
    // eslint-disable-next-line @typescript-eslint/naming-convention
    baseURL: 'http://localhost:5173',
    // BaseURL: 'http://host.docker.internal:5173',

    /* Collect trace when retrying the failed test. See https://playwright.dev/docs/trace-viewer */
    trace: 'on-first-retry',

    // Screenshot on failed test
    screenshot: 'only-on-failure',
  },

  /* Configure projects for major browsers */
  projects: [
    // {
    //   name: 'setup',
    //   testMatch: /playwright\.global\.setup\.ts/,
    // },
    {
      name: 'chromium',
      // Use: {...devices['Desktop Chrome'], storageState: STORAGE_STATE},
      use: {
        ...devices['Desktop Chrome'],
        // https://playwrightsolutions.com/how-do-i-access-the-browser-clipboard-with-playwright/
        // https://playwright.dev/docs/api/class-browsercontext#browser-context-grant-permissions
        permissions: ['clipboard-read', 'clipboard-write'],
      },
    },
    // {
    //   name: 'chromium - no sign-in',
    //   use: {...devices['Desktop Chrome']},
    //   // Dependencies: ['setup'],
    // },

    // {
    //   name: 'firefox',
    //   use: {...devices['Desktop Firefox']},
    // },

    // {
    //   name: 'webkit',
    //   use: {...devices['Desktop Safari']},
    // },

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
  ],

  /* Run your local dev server before starting the tests */
  webServer: {
    command: 'pnpm run dev:start',
    url: 'http://localhost:5173',
    reuseExistingServer: !process.env.CI,
    stdout: 'pipe',
    stderr: 'pipe',
  },
});
/* eslint-enable n/prefer-global/process */
