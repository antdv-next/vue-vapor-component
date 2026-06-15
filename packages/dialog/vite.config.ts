import { defineConfig, mergeConfig } from 'vite-plus'

import { commonConfig as tsdownCommonConfig } from '../../scripts/tsdownCommonConfig'
import { commonConfig } from '../../scripts/viteCommonConfig'

export default defineConfig({
  ...mergeConfig(commonConfig(), {}),
  pack: {
    ...tsdownCommonConfig(),
    entry: 'src/index.ts',
  },
})
