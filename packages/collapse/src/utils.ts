import type { CSSProperties } from 'vue'

import { clsx } from '@v-c/util'

function mergeSemantic<T>(
  source: Partial<Record<string, T>> | undefined,
  target: Partial<Record<string, T>> | undefined,
  mergeFunc: (
    sourceValue: T | undefined,
    targetValue: T | undefined,
  ) => T | undefined,
): Partial<Record<string, T>> | undefined {
  if (!source && !target) return undefined
  const keys = new Set([
    ...Object.keys(source || {}),
    ...Object.keys(target || {}),
  ])
  const result: Partial<Record<string, T>> = {}
  keys.forEach(key => {
    const merged = mergeFunc(source?.[key], target?.[key])
    if (merged !== undefined) {
      result[key] = merged
    }
  })
  return result
}

export function mergeSemanticClassNames(
  source: Partial<Record<string, string>> | undefined,
  target: Partial<Record<string, string>> | undefined,
) {
  return mergeSemantic(source, target, (s, t) => clsx(s, t) || undefined)
}

export function mergeSemanticStyles(
  source: Partial<Record<string, CSSProperties>> | undefined,
  target: Partial<Record<string, CSSProperties>> | undefined,
) {
  return mergeSemantic(source, target, (s, t) => {
    if (!s && !t) return undefined
    return { ...s, ...t }
  })
}
