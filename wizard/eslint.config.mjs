import tseslint from 'typescript-eslint'
import eslintConfigPrettier from 'eslint-config-prettier'
import jsxA11y from 'eslint-plugin-jsx-a11y'
import tsEslintHooks from 'eslint-plugin-react-hooks'
import react from 'eslint-plugin-react'
import globals from 'globals'

export default tseslint.config(
  tseslint.configs.eslintRecommended,
  ...tseslint.configs.recommended,
  eslintConfigPrettier,
  {
    languageOptions: {
      parserOptions: {
        ecmaFeatures: {
          jsx: true,
        },
      },
      globals: {
        ...globals.browser
      }
    },

    ignores: ['build/**/*.*'],
    files: ['**/*.ts', '**/*.tsx'],

    plugins: {
      'jsx-a11y': jsxA11y,
      'react-hooks': tsEslintHooks,
      react,
    },

    rules: {
      // https://eslint.org/docs/rules
      'no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
      '@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
    },
  },
)
