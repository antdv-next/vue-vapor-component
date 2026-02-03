import { defineConfig, mergeConfig } from 'vitest/config'
import { commonConfig } from './scripts/vitestCommonConfig'

export default defineConfig(
  mergeConfig(
    commonConfig(),
    defineConfig({
      test: {
        projects: ['packages/*'],
      },
    }),
  ),
)
