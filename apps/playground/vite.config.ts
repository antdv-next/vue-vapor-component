import vue from '@vitejs/plugin-vue'
import path from 'path'
import vueDevtools from 'vite-plugin-vue-devtools'
import { defineConfig } from 'vite-plus'

const root = __dirname

// https://vitejs.dev/config/
export default defineConfig({
  base: '/vue-vapor-component/',
  resolve: {
    alias: {
      '@': path.resolve(root, 'src'),
    },
  },
  plugins: [vue(), vueDevtools()],
})
