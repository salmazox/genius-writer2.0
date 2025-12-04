module.exports = {
  root: true,
  env: {
    browser: true,
    es2022: true,
    node: true,
  },
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:react/recommended',
    'plugin:react/jsx-runtime',
    'plugin:react-hooks/recommended',
  ],
  ignorePatterns: ['dist', '.eslintrc.cjs', 'backend'],
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module',
    ecmaFeatures: {
      jsx: true,
    },
  },
  plugins: ['react', '@typescript-eslint', 'react-hooks', 'react-refresh'],
  settings: {
    react: {
      version: 'detect',
    },
  },
  rules: {
    // React specific rules
    'react-refresh/only-export-components': [
      'warn',
      { allowConstantExport: true },
    ],
    'react/prop-types': 'off', // Using TypeScript for prop validation
    'react/react-in-jsx-scope': 'off', // Not needed with React 17+
    'react/no-unescaped-entities': 'warn', // Relax for launch - fix in cleanup phase
    'react/display-name': 'warn', // Relax for launch

    // TypeScript specific rules
    '@typescript-eslint/no-explicit-any': 'warn',
    '@typescript-eslint/no-unused-vars': [
      'warn',
      {
        argsIgnorePattern: '^_',
        varsIgnorePattern: '^_',
      },
    ],
    '@typescript-eslint/explicit-module-boundary-types': 'off',

    // General code quality
    'no-console': ['warn', { allow: ['warn', 'error'] }],
    'prefer-const': 'warn',
    'no-var': 'error',
    'no-case-declarations': 'warn', // Relax for launch - fix in cleanup phase
    'prefer-rest-params': 'warn', // Relax for launch

    // React Hooks
    'react-hooks/rules-of-hooks': 'error',
    'react-hooks/exhaustive-deps': 'warn',
  },
};
