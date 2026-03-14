// @ts-check
const { defineConfig } = require('@playwright/test');
const path = require('path');

/**
 * Playwright configuration for visual gameplay testing.
 * Optimized for HTML5 canvas games running in Chromium.
 */
module.exports = defineConfig({
  testDir: path.resolve(__dirname),
  testMatch: '**/*.spec.js',

  timeout: 30_000,
  retries: 0,
  workers: 1,

  use: {
    browserName: 'chromium',
    viewport: { width: 800, height: 600 },
    screenshot: 'only-on-failure',
    video: 'off',
    trace: 'off',
    launchOptions: {
      args: ['--disable-gpu-sandbox'],
    },
  },

  outputDir: path.resolve(__dirname, 'screenshots'),

  reporter: [
    ['list'],
  ],

  projects: [
    {
      name: 'visual-gameplay',
      use: {
        browserName: 'chromium',
      },
    },
  ],
});
