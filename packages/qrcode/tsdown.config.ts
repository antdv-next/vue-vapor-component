import type { UserConfig } from 'tsdown'
import { defineConfig } from 'tsdown'
import { commonConfig } from '../../scripts/tsdownCommonConfig'

export default defineConfig({
  ...commonConfig(),
  entry: 'src/index.ts',
} as UserConfig)
