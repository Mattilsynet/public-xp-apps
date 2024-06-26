module.exports = {
  env: {},

  extends: [
    'plugin:@typescript-eslint/eslint-recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:jsx-a11y/recommended',
    'plugin:react/recommended',
    'plugin:jsx-a11y/recommended',
    'plugin:react-hooks/recommended',
    'prettier',
  ],

  ignorePatterns: ['build/**/*.*'],

  overrides: [
    {
      files: ['**/*.ts', '**/*.tsx'],
    },
  ],

  plugins: ['jsx-a11y', '@typescript-eslint'],

  root: true,

  rules: {
    // https://eslint.org/docs/rules
    'no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
    '@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
  },
} // module.exports
