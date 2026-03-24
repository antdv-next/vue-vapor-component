import type { Ref } from 'vue'

import canUseDom from '@v-c/util/dist/Dom/canUseDom'
import { watchEffect } from 'vue'

const defaultOptions: MutationObserverInit = {
  subtree: true,
  childList: true,
  attributeFilter: ['style', 'class'],
}

export default function useMutateObserver(
  nodeOrList: Ref<Element | Text | Element[] | null>,
  callback: MutationCallback,
  options: Ref<MutationObserverInit | undefined>,
) {
  watchEffect(onCleanup => {
    if (!canUseDom()) {
      return
    }
    if (!nodeOrList.value) {
      return
    }
    let ins: MutationObserver

    const nodeList = Array.isArray(nodeOrList.value)
      ? nodeOrList.value
      : [nodeOrList.value]

    if ('MutationObserver' in window) {
      ins = new MutationObserver(callback)
      nodeList.forEach(node =>
        ins.observe(node, options.value ?? defaultOptions),
      )
    }

    onCleanup(() => {
      ins?.takeRecords()
      ins?.disconnect()
    })
  })
}
