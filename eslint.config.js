const js = require('@eslint/js');
const globals = require('globals');
const eslintConfigPrettier = require('eslint-config-prettier');

module.exports = [
  {
    ignores: ['eslint.config.js'],
  },

  js.configs.recommended,

  {
    files: ['src/**/*.js'],

    languageOptions: {
      ecmaVersion: 2022,
      sourceType: 'commonjs',
      globals: globals.node,
    },

    rules: {
      'no-unused-vars': 'warn',
      'no-undef': 'error',
    },
  },

  eslintConfigPrettier,
];
