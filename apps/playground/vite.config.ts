import vue from '@vitejs/plugin-vue'
import vueDevtools from 'vite-plugin-vue-devtools'
import { defineConfig } from 'vite-plus'

// https://vitejs.dev/config/
export default defineConfig({
  base: '/vue-vapor-component/',
  plugins: [vue(), vueDevtools()],
})
