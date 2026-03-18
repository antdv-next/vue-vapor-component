import type { Plugin, UserConfig } from 'vite-plus'

import vue from '@vitejs/plugin-vue'

export function commonConfig(): UserConfig {
  const plugins: Plugin[] = [vue()]

  return {
    plugins,
  }
}
