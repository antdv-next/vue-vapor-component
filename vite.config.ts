import Vue from 'unplugin-vue/rolldown'
import { defineConfig } from 'vite-plus'

export default defineConfig({
  run: {
    tasks: {
      'task:dev': {
        command: [
          'vp run --filter "@vapor-component/*" build',
          'vp run --filter ./apps/playground dev'
        ].join(' && '),
        input: [{ auto: true }, '!**/*.tsbuildinfo']
      }
    },
    cache: {
      scripts: true,
      tasks: true
    }
  },
  pack: {
    entry: ['src/index.ts'],
    dts: { vue: true },
    format: ['esm', 'cjs'],
    platform: 'neutral',
    plugins: [Vue({ isProduction: true })]
  },
  staged: {
    '*.{js,ts,tsx,vue,svelte}': 'vp check --fix',
  },
  lint: {
    options: {
      typeAware: true,
      typeCheck: true
    },
    categories: {
      correctness: 'error'
    },
    rules: {
      'no-console': 'error',
      curly: ['error', 'multi-line'],
      'prefer-const': ['error', { destructuring: 'all' }],
      'prefer-destructuring': [
        'error',
        {
          VariableDeclarator: { array: false, object: true }
        }
      ],
      'unicode-bom': ['error', 'never'],
      'typescript/consistent-indexed-object-style': ['error', 'record'],
      'typescript/ban-ts-comment': [
        'error',
        { 'ts-expect-error': 'allow-with-description' }
      ]
    },
    overrides: [
      { files: ['apps/playground/src/App.vue'], rules: { 'no-console': 'off' } }
    ]
  },
  fmt: {
    semi: false,
    singleQuote: true,
    jsxSingleQuote: true,
    arrowParens: 'avoid',
    printWidth: 80,
    ignorePatterns: ['pnpm-lock.yaml', 'dist', '**/*.html'],
    sortImports: {
      groups: [
        'type-import',
        'type-internal',
        ['type-parent', 'type-sibling', 'type-index'],
        ['value-builtin', 'value-external'],
        'value-internal',
        ['value-parent', 'value-sibling', 'value-index'],
        'unknown'
      ]
    },
    vueIndentScriptAndStyle: true
  },
  test: {
    environment: 'jsdom'
  },
  plugins: [Vue()]
})
