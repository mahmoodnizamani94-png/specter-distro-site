import eslint from '@eslint/js';
import tseslint from 'typescript-eslint';
import eslintPluginAstro from 'eslint-plugin-astro';

export default tseslint.config(
  // ─── Base: JS + TS recommended ───
  eslint.configs.recommended,
  ...tseslint.configs.recommended,

  // ─── Astro recommended ───
  ...eslintPluginAstro.configs.recommended,

  // ─── TypeScript rules ───
  {
    files: ['**/*.{ts,tsx}'],
    rules: {
      '@typescript-eslint/consistent-type-imports': [
        'error',
        { prefer: 'type-imports', fixStyle: 'separate-type-imports' },
      ],
      '@typescript-eslint/no-unused-vars': [
        'error',
        {
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^_',
          caughtErrorsIgnorePattern: '^_',
        },
      ],
    },
  },

  // ─── React islands ───
  {
    files: ['**/*.tsx'],
    settings: {
      react: { version: 'detect' },
    },
  },

  // ─── Production code: no console.log ───
  {
    files: ['src/**/*.{ts,tsx,astro}'],
    rules: {
      'no-console': ['error', { allow: ['warn'] }],
    },
  },

  // ─── Global ignores ───
  {
    ignores: [
      'dist/',
      '.astro/',
      'node_modules/',
      'prd/',
      '.agents/',
    ],
  },
);
