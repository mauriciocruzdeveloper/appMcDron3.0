module.exports = {
  env: {
    browser: true,
    es2021: true,
    node: true,
  },
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:react/recommended',
  ],
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaFeatures: {
      jsx: true,
    },
    ecmaVersion: 12,
    sourceType: 'module',
  },
  plugins: [
    'react',
    '@typescript-eslint',
  ],
  rules: {
    // 'indent': ['error', 2],
    'linebreak-style': ['error', 'unix'],
    // 'quotes': ['error', 'single'],
    // 'semi': ['error', 'always'],
    'react/prop-types': 'off',
    'react/react-in-jsx-scope': 'off', // Desactiva la regla que requiere importar React
    'no-async-promise-executor': 'off',
  },
  settings: {
    react: {
      version: 'detect',
    },
  },
};