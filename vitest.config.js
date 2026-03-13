const { defineConfig } = require('vitest/config');

module.exports = defineConfig({
  test: {
    include: ['scripts/__tests__/**/*.test.js'],
    globals: true,
  },
});
