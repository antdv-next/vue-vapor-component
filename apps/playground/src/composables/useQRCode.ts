import { ref } from 'vue'

export function useQRCode() {
  const value = ref('https://www.baidu.com')
  return { value }
}
