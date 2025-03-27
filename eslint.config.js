import globals from 'globals';
import js from '@eslint/js';

export default [
  js.configs.recommended,
  {
    files: ['**/*.js'],
    languageOptions: {
      globals: {
        ...globals.browser,
        ...globals.node,
        yup: 'readonly',
        i18next: 'readonly',
        axios: 'readonly',
        onChange: 'readonly',
        error: 'readonly'
      }
    },
    rules: {
      'indent': ['error', 2],
      'linebreak-style': ['error', 'unix'],
      'quotes': ['error', 'single'],
      'semi': ['error', 'always'],
      'no-unused-vars': [
        'error',
        {
          args: 'after-used',
          caughtErrors: 'none',
          argsIgnorePattern: '^_'
        }
      ]
    }
  },
  {
    files: ['webpack.config.js'],
    languageOptions: {
      globals: {
        ...globals.node
      }
    }
  }
];
