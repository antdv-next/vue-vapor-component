import type { Plugin, UserConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export function commonConfig(): UserConfig {
  const plugins: Plugin[] = [vue()]
  
  return {
    plugins
  }
}
