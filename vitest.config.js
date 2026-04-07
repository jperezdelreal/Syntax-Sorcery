const { defineConfig } = require('vitest/config');

module.exports = defineConfig({
  test: {
    include: [
      'scripts/__tests__/**/*.test.js',
      'scripts/gameplay-test/**/*.test.js',
      'poc/vigia/tests/**/*.test.js',
    ],
    globals: true,
  },
});
