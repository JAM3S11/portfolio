import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import { defineConfig, globalIgnores } from 'eslint/config'

export default defineConfig([
  globalIgnores([
    'dist',
    'node_modules',
    'vite.config.js',
    'src/common/typing-animation.jsx',
    'src/components/ui/*.jsx'
  ]),
  {
    files: ['**/*.{js,jsx}'],
    extends: [
      js.configs.recommended,
      reactHooks.configs.flat.recommended,
      reactRefresh.configs.vite,
    ],
    languageOptions: {
      ecmaVersion: 2020,
      globals: {
        ...globals.browser,
        ...globals.es2021,
      },
      parserOptions: {
        ecmaVersion: 'latest',
        ecmaFeatures: {
          jsx: true,
        },
        sourceType: 'module',
      },
    },
    rules: {
      'no-unused-vars': ['off'],
      'react-refresh/only-export-components': ['off'],
      'react-refresh/no-export-named-as-default': ['off'],
      'react-refresh/no-default-as-named-export': ['off'],
      'react-hooks/rules-of-hooks': 'off',
      'react-hooks/exhaustive-deps': ['off'],
    },
  },
])