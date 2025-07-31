import tseslint from '@typescript-eslint/eslint-plugin';
import tsparser from '@typescript-eslint/parser';

export default [
  {
    files: ['**/*.ts', '**/*.tsx'],
    languageOptions: {
      parser: tsparser,
      parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module',
        project: './tsconfig.json',
      },
    },
    plugins: {
      '@typescript-eslint': tseslint,
    },
    rules: {
      '@typescript-eslint/no-unused-vars': 'off', // Disabled per user request
      '@typescript-eslint/no-explicit-any': 'off', // Disabled per user request
      '@typescript-eslint/no-non-null-assertion': 'off', // Disabled per user request
      'no-console': 'off', // Allow console.log in backend
      'no-constant-binary-expression': 'off', // Disable constant binary expression check
      'prefer-const': 'off', // Make this a warning instead of error
      'no-var': 'off', // Make this a warning instead of error
    },
  },
  {
    files: ['scripts/**/*.ts'],
    rules: {
      '@typescript-eslint/no-unused-vars': 'off',
      '@typescript-eslint/no-explicit-any': 'off', // Allow any in scripts
      'no-console': 'off',
    },
  },
];
