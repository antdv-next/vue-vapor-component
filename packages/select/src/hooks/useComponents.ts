import type { VueNode } from '@v-c/util/dist/type'
import type { Ref } from 'vue'

import { computed } from 'vue'

export interface ComponentsConfig {
  root?: VueNode | string | any
  input?: VueNode | string | any
}

export default function useComponents(
  components: Ref<ComponentsConfig>,
  getInputElement?: Ref<any>,
  getRawInputElement?: Ref<any>,
): Ref<ComponentsConfig> {
  return computed<ComponentsConfig>(() => {
    let { root, input } = components.value || {}

    if (getRawInputElement?.value) {
      root = getRawInputElement.value?.()
    }
    if (getInputElement?.value) {
      input = getInputElement.value?.()
    }

    return { root, input }
  })
}
