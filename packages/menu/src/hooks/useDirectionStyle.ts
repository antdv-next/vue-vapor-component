import type { CSSProperties, Ref } from 'vue'

import { computed } from 'vue'

import { useMenuContext } from '../MenuContextKey'

export default function useDirectionStyle(
  level: Ref<number>,
): Ref<CSSProperties | null> {
  const menuContext = useMenuContext()

  return computed<CSSProperties | null>(() => {
    const { mode, rtl, inlineIndent } = menuContext?.value ?? {}
    if (mode !== 'inline') {
      return null
    }
    const len = level.value
    if (!inlineIndent) return null
    return rtl
      ? { paddingRight: `${len * inlineIndent}px` }
      : { paddingLeft: `${len * inlineIndent}px` }
  })
}
