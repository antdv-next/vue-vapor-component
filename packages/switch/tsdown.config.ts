import { commonConfig } from '../../scripts/tsdownCommonConfig'
import { defineConfig } from 'tsdown'
import type { UserConfig } from 'tsdown'

export default defineConfig({
  ...commonConfig(),
  entry: 'src/index.ts'
} as UserConfig)
