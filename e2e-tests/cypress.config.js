const { defineConfig } = require("cypress");

module.exports = defineConfig({
  e2e: {
    baseUrl: "https://localhost:3000",
    supportFile: "cypress/support/e2e.js",
    specPattern: "cypress/integration/**/*.spec.js",
    watchForFileChanges: false,
    defaultCommandTimeout: 10000,
    viewportHeight: 900,
    viewportWidth: 1444,
    chromeWebSecurity: false,
    setupNodeEvents(on, config) {
      // implement node event listeners here if needed
    },
  },
});
