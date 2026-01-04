import { defineConfig, devices } from '@playwright/test';

/**
 * Playwright configuration for Pubwave Editor integration tests
 * See https://playwright.dev/docs/test-configuration
 * 
 * Supports testing both vite-react and nextjs examples
 * 
 * Usage:
 * - Run all tests: npx playwright test
 * - Run vite-react tests: npx playwright test --project=vite-react
 * - Run nextjs tests: npx playwright test --project=nextjs
 * - Run integration (nextjs) tests: npx playwright test --project=integration
 */
export default defineConfig({
  testDir: './tests',
  testMatch: '**/*.spec.ts',
  
  /* Test timeout */
  timeout: 30 * 1000, // 30 seconds per test (reduced from 60s)
  
  /* Run tests in files in parallel */
  fullyParallel: true,
  
  /* Fail the build on CI if you accidentally left test.only in the source code */
  forbidOnly: !!process.env.CI,
  
  /* Retry on CI only */
  retries: process.env.CI ? 2 : 0,
  
  /* Opt out of parallel tests on CI, use more workers locally for speed */
  workers: process.env.CI ? 1 : '50%', // Use 50% of CPU cores for parallel execution
  
  /* Reporter to use */
  reporter: [
    ['html', { open: 'never' }],
    ['list'],
  ],

  /* Configure projects for major browsers */
  projects: [
    {
      name: 'vite-react',
      testMatch: '**/integration/**/*.spec.ts',
      use: { 
        ...devices['Desktop Chrome'],
        /* Base URL for vite-react example */
        baseURL: 'http://localhost:5174',
        /* Collect trace when retrying the failed test */
        trace: 'on-first-retry',
        /* Screenshot on failure */
        screenshot: 'only-on-failure',
      },
    },
    {
      name: 'nextjs',
      testMatch: '**/integration/**/*.spec.ts',
      use: { 
        ...devices['Desktop Chrome'],
        /* Base URL for nextjs example */
        baseURL: 'http://localhost:3000',
        /* Collect trace when retrying the failed test */
        trace: 'on-first-retry',
        /* Screenshot on failure */
        screenshot: 'only-on-failure',
      },
    },
    {
      name: 'integration',
      testMatch: '**/integration/**/*.spec.ts',
      use: { 
        ...devices['Desktop Chrome'],
        /* Default to nextjs for backward compatibility */
        baseURL: 'http://localhost:3000',
        /* Collect trace when retrying the failed test */
        trace: 'on-first-retry',
        /* Screenshot on failure */
        screenshot: 'only-on-failure',
      },
    },
  ],

  /* Run dev servers based on which project is being tested */
  webServer: [
    {
      command: 'npm run --prefix examples/vite-react dev',
      url: 'http://localhost:5174',
      reuseExistingServer: !process.env.CI,
      timeout: 120 * 1000,
      stdout: 'ignore',
      stderr: 'pipe',
    },
    {
      command: 'npm run --prefix examples/nextjs dev',
      url: 'http://localhost:3000',
      reuseExistingServer: !process.env.CI,
      timeout: 180 * 1000, // Increased timeout for Next.js which takes longer to start
      stdout: 'ignore',
      stderr: 'pipe',
    },
  ],
});
