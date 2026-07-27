import type { UploadRef } from '@vapor-component/upload'

import { ref } from 'vue'

export function useUpload() {
  const uploadRef = ref<UploadRef>()

  return {
    uploadRef,
  }
}
