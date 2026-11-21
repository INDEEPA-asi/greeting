import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  workers: 2,
  reporter: 'list',
  use: { baseURL: 'http://localhost:4173', trace: 'retain-on-failure' },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
  webServer: [
    {
      command: 'npx vite build --mode test --outDir .test-dist && npm run preview -- --host localhost --port 4173 --strictPort --outDir .test-dist',
      url: 'http://localhost:4173',
      reuseExistingServer: !process.env.CI,
    },
    {
      command: 'npm run dev -- --mode test --host localhost --port 4174 --strictPort',
      url: 'http://localhost:4174/personalize',
      reuseExistingServer: !process.env.CI,
    },
  ],
});
