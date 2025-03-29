/// <reference types="vitest/config" />
import {defineConfig} from "vite";

export default defineConfig({
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./setupTests.js'],
    reporters: ['junit', 'default'],
    outputFile: '../reports/shared-tests.xml'
  },
})