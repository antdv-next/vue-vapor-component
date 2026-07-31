import type { ComputedRef } from 'vue'

import type { VueNode } from '../interface'

import pickAttrs from '@v-c/util/dist/pickAttrs'
import { computed } from 'vue'

export type ClosableConfig = {
  closeIcon?: VueNode
  disabled?: boolean
  onClose?: VoidFunction
} & Record<`data-${string}`, unknown>

export type ClosableType = boolean | ClosableConfig | null | undefined

export interface ParsedClosableConfig extends ClosableConfig {
  closeIcon: VueNode
  disabled: boolean
}

export default function useClosable(
  closable: ComputedRef<ClosableType>,
): [
  ComputedRef<boolean>,
  ComputedRef<ParsedClosableConfig>,
  ComputedRef<Record<string, unknown>>,
] {
  const closableObj = computed<ClosableConfig>(() => {
    const value = closable.value
    if (value === false) {
      return { closeIcon: '×' as unknown as VueNode, disabled: true }
    }
    if (typeof value === 'object' && value !== null) {
      return value
    }
    return {}
  })

  const closableConfig = computed<ParsedClosableConfig>(() => {
    const obj = closableObj.value
    const icon =
      'closeIcon' in obj ? obj.closeIcon : ('×' as unknown as VueNode)
    return {
      ...obj,
      closeIcon: icon as VueNode,
      disabled: obj.disabled ?? false,
    }
  })

  const closableAriaProps = computed(() =>
    pickAttrs(closableConfig.value, true),
  )

  return [computed(() => !!closable.value), closableConfig, closableAriaProps]
}
