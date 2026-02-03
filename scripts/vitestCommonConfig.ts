import vue from '@vitejs/plugin-vue'

export function commonConfig() {
  const plugins = [vue()]

  return {
    plugins,
  }
}
