import { defineConfig, mergeConfig } from 'vite'
import { commonConfig } from '../../scripts/viteCommonConfig'

export default defineConfig({
  ...mergeConfig(commonConfig(), {})
})
