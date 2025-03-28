import globals from 'globals';
import js from '@eslint/js';
import importPlugin from 'eslint-plugin-import';

export default [
  {
    ignores: ['dist/'],
  },
  js.configs.recommended,
  {
    languageOptions: {
      globals: {
        ...globals.node,
        ...globals.jest,
        ...globals.browser,
        yup: 'readonly',
        i18next: 'readonly',
        onChange: 'readonly',
      },
      parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module',
      },
    },
    plugins: {
      import: importPlugin,
    },
    rules: {
      indent: ['error', 2],
      'linebreak-style': ['error', 'unix'],
      quotes: ['error', 'single'],
      semi: ['error', 'always'],
      'comma-dangle': ['error', 'always-multiline'],
      'no-console': 'off',
      'import/extensions': ['error', 'ignorePackages'],
      'import/no-extraneous-dependencies': 'off',
      'quote-props': ['error', 'as-needed'],
    },
  },
];
