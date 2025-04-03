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
      'no-trailing-spaces': 'error',
      'no-use-before-define': 'error',

      'arrow-parens': ['error', 'always'],
      'arrow-body-style': ['error', 'as-needed'],
      'implicit-arrow-linebreak': ['error', 'beside'],

      'object-curly-newline': ['error', {
        multiline: true,
        consistent: true,
      }],
      'prefer-destructuring': ['error', {
        array: true,
        object: true,
      }],

      'operator-linebreak': ['error', 'before'],

      'function-paren-newline': ['error', 'multiline'],

      'class-methods-use-this': 'error',

      'import/extensions': ['error', 'ignorePackages'],
      'import/no-extraneous-dependencies': 'off',
      'import/prefer-default-export': 'error',
      'quote-props': ['error', 'as-needed'],
    },
  },
];
