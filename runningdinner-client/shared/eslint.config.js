import { baseNodeConfig } from '../eslint.config.js';

/**
 * ESLint configuration for shared package
 * Extends the shared base configuration from the monorepo root
 */

/** @type {import('eslint').Linter.Config[]} */
export default [
  { ignores: ['dist', 'vitest.config.ts', 'vite.config.ts', '*.config.js', 'setupTests.js'] },
  ...baseNodeConfig,
  {
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.json', './tsconfig.node.json'],
        tsconfigRootDir: import.meta.dirname,
      },
    },
  },
  // Add package-specific overrides here if needed
  // {
  //   rules: {
  //     // Example: disable a specific rule for this package only
  //     // '@typescript-eslint/no-explicit-any': 'error',
  //   },
  // },
];
