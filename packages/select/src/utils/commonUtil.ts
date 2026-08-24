import type { VueNode } from '@v-c/util/dist/type'

export function toArray<T>(value: T | T[] | null | undefined): T[] {
  if (value === null || value === undefined) {
    return []
  }
  return Array.isArray(value) ? value : [value]
}

function isTitleType(title: any) {
  return ['string', 'number'].includes(typeof title)
}

export function injectPropsWithOption(option: any): any {
  return { ...option }
}

export function getTitle(item: {
  title?: any
  label?: any
}): string | undefined {
  let title: string | undefined
  if (item) {
    if (isTitleType(item.title)) {
      title = (item as any).title.toString()
    } else if (isTitleType(item.label)) {
      title = (item as any).label.toString()
    }
  }
  return title
}

export function hasValue(value: any): boolean {
  return value !== undefined && value !== null
}

export function isComboNoValue(value: any): boolean {
  return !value && value !== 0
}
