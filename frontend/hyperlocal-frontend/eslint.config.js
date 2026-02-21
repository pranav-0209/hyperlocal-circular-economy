import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import { defineConfig, globalIgnores } from 'eslint/config'

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{js,jsx}'],
    extends: [
      js.configs.recommended,
      reactHooks.configs.flat.recommended,
      reactRefresh.configs.vite,
    ],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
      parserOptions: {
        ecmaVersion: 'latest',
        ecmaFeatures: { jsx: true },
        sourceType: 'module',
      },
    },
    rules: {
      // ^[A-Z_] allows PascalCase/SCREAMING_SNAKE unused vars (React components, constants)
      // ^motion$ suppresses the false-positive for framer-motion's JSX namespace (motion.div, etc.)
      'no-unused-vars': ['error', { varsIgnorePattern: '^[A-Z_]|^motion$' }],
    },
  },
  // Shadcn UI auto-generated files and AuthContext export pattern — fast refresh
  // warning is expected because they intentionally export both components and hooks/constants
  {
    files: [
      'src/components/ui/badge.jsx',
      'src/components/ui/form.jsx',
      'src/context/AuthContext.jsx',
    ],
    rules: {
      'react-refresh/only-export-components': 'off',
    },
  },
])