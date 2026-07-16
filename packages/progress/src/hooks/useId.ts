import canUseDom from '@v-c/util/dist/Dom/canUseDom'
import { ref } from 'vue'

declare const process: { env?: Record<string, string> }

let uuid = 0

export const isBrowserClient =
  typeof process !== 'undefined' &&
  process.env?.NODE_ENV !== 'test' &&
  canUseDom()

function getUUID(): number | string {
  let retId: string | number
  if (isBrowserClient) {
    retId = uuid
    uuid += 1
  } else {
    retId = 'TEST_OR_SSR'
  }
  return retId
}

export default (id?: string) => {
  const innerId = ref<string>()
  innerId.value = `vc_progress_${getUUID()}`
  return id || innerId.value
}
