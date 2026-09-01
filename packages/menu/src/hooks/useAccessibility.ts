import type { Ref } from 'vue'

import type { MenuMode } from '../interface'

import KeyCode from '@v-c/util/dist/KeyCode'
import { onBeforeUnmount, shallowRef } from 'vue'

import { getMenuId } from '../IdContextKey'

const { LEFT, RIGHT, UP, DOWN, ENTER, ESC, HOME, END } = KeyCode

const ArrowKeys = [UP, DOWN, LEFT, RIGHT]

function getOffset(
  mode: MenuMode,
  isRootLevel: boolean,
  isRtl: boolean,
  which: number,
): { offset?: number; sibling?: boolean; inlineTrigger?: boolean } | null {
  if (mode === 'inline' && which === ENTER) {
    return { inlineTrigger: true }
  }

  const inline: Record<number, string> = { [UP]: 'prev', [DOWN]: 'next' }
  const horizontal: Record<number, string> = {
    [LEFT]: isRtl ? 'next' : 'prev',
    [RIGHT]: isRtl ? 'prev' : 'next',
    [DOWN]: 'children',
    [ENTER]: 'children',
  }
  const vertical: Record<number, string> = {
    [UP]: 'prev',
    [DOWN]: 'next',
    [ENTER]: 'children',
    [ESC]: 'parent',
    [LEFT]: isRtl ? 'children' : 'parent',
    [RIGHT]: isRtl ? 'parent' : 'children',
  }

  const offsets: Record<string, Record<number, string>> = {
    inline,
    horizontal,
    vertical,
    inlineSub: inline,
    horizontalSub: vertical,
    verticalSub: vertical,
  }

  const type = offsets[`${mode}${isRootLevel ? '' : 'Sub'}`]?.[which]

  switch (type) {
    case 'prev':
      return { offset: -1, sibling: true }
    case 'next':
      return { offset: 1, sibling: true }
    case 'parent':
      return { offset: -1, sibling: false }
    case 'children':
      return { offset: 1, sibling: false }
    default:
      return null
  }
}

function findContainerUL(element: HTMLElement): HTMLUListElement | null {
  let current: HTMLElement | null = element
  while (current) {
    if (current.getAttribute('data-menu-list')) {
      return current as HTMLUListElement
    }
    current = current.parentElement
  }
  return null
}

function getFocusNodeList(
  container: HTMLElement,
  includeDisabled?: boolean,
): HTMLElement[] {
  const selector = includeDisabled
    ? '[tabindex]'
    : '[tabindex]:not([tabindex="-1"]):not([disabled]):not([aria-disabled="true"])'
  return Array.from(container.querySelectorAll<HTMLElement>(selector))
}

function getFocusElement(
  activeElement: HTMLElement | null,
  elements: Set<HTMLElement>,
): HTMLElement | null {
  let current = activeElement || document.activeElement
  while (current) {
    if (elements.has(current as HTMLElement)) {
      return current as HTMLElement
    }
    current = current.parentElement
  }
  return null
}

export function getFocusableElements(
  container: HTMLElement | null,
  elements: Set<HTMLElement>,
) {
  if (!container) return []
  const list = getFocusNodeList(container, true)
  return list.filter(ele => elements.has(ele))
}

function getNextFocusElement(
  parentQueryContainer: HTMLElement | null,
  elements: Set<HTMLElement>,
  focusMenuElement?: HTMLElement | null,
  offset: number = 1,
) {
  if (!parentQueryContainer) return null

  const sameLevelList = getFocusableElements(parentQueryContainer, elements)
  const count = sameLevelList.length
  let focusIndex = sameLevelList.findIndex(ele => focusMenuElement === ele)

  if (offset < 0) {
    if (focusIndex === -1) focusIndex = count - 1
    else focusIndex -= 1
  } else if (offset > 0) {
    focusIndex += 1
  }

  focusIndex = (focusIndex + count) % count
  return sameLevelList[focusIndex]
}

export function refreshElements(keys: string[], id: string) {
  const elements = new Set<HTMLElement>()
  const key2element = new Map<string, HTMLElement>()
  const element2key = new Map<HTMLElement, string>()

  keys.forEach(key => {
    const element = document.querySelector(
      `[data-menu-id='${getMenuId(id, key)}']`,
    ) as HTMLElement
    if (element) {
      elements.add(element)
      element2key.set(element, key)
      key2element.set(key, element)
    }
  })

  return { elements, key2element, element2key }
}

export default function useAccessibility(
  mode: Ref<MenuMode>,
  activeKey: Ref<string>,
  isRtl: Ref<boolean>,
  id: string,
  containerRef: Ref<HTMLUListElement | null>,
  getKeys: () => string[],
  getKeyPath: (key: string, includeOverflow?: boolean) => string[],
  triggerActiveKey: (key: string) => void,
  triggerAccessibilityOpen: (key: string, open?: boolean) => void,
  originOnKeyDown?: (e: KeyboardEvent) => void,
): (e: KeyboardEvent) => void {
  const rafRef = shallowRef<number>()
  const activeRef = shallowRef<string>()

  const cleanRaf = () => {
    if (rafRef.value !== undefined) {
      cancelAnimationFrame(rafRef.value)
    }
  }

  onBeforeUnmount(() => {
    cleanRaf()
  })

  return (e: KeyboardEvent) => {
    activeRef.value = activeKey.value
    const { which } = e as any

    if ([...ArrowKeys, ENTER, ESC, HOME, END].includes(which)) {
      const keys = getKeys()
      let refreshedElements = refreshElements(keys, id)
      const { elements, key2element, element2key } = refreshedElements

      const activeElement = key2element.get(activeKey.value)
      const focusMenuElement = getFocusElement(activeElement || null, elements)
      const focusMenuKey = element2key.get(focusMenuElement!)

      const offsetObj = getOffset(
        mode.value,
        getKeyPath(focusMenuKey!, true).length === 1,
        isRtl.value,
        which,
      )

      if (!offsetObj && which !== HOME && which !== END) {
        originOnKeyDown?.(e)
        return
      }

      if (ArrowKeys.includes(which) || [HOME, END].includes(which)) {
        e.preventDefault()
      }

      const tryFocus = (menuElement: HTMLElement | null | undefined) => {
        if (menuElement) {
          const link = menuElement.querySelector('a')
          const focusTarget = link?.getAttribute('href') ? link : menuElement

          const targetKey = element2key.get(menuElement)
          if (targetKey) {
            triggerActiveKey(targetKey)
          }

          cleanRaf()
          rafRef.value = requestAnimationFrame(() => {
            if (activeRef.value === targetKey) {
              focusTarget.focus()
            }
          })
        }
      }

      if (
        [HOME, END].includes(which) ||
        offsetObj?.sibling ||
        !focusMenuElement
      ) {
        let parentQueryContainer: HTMLElement | null
        if (!focusMenuElement || mode.value === 'inline') {
          parentQueryContainer = containerRef.value
        } else {
          parentQueryContainer = findContainerUL(focusMenuElement)
        }

        let targetElement: HTMLElement | null | undefined
        const focusableElements = getFocusableElements(
          parentQueryContainer,
          elements,
        )
        if (which === HOME) {
          targetElement = focusableElements[0]
        } else if (which === END) {
          targetElement = focusableElements[focusableElements.length - 1]
        } else {
          targetElement = getNextFocusElement(
            parentQueryContainer,
            elements,
            focusMenuElement,
            offsetObj?.offset,
          )
        }
        tryFocus(targetElement)
      } else if (offsetObj!.inlineTrigger) {
        triggerAccessibilityOpen(focusMenuKey!)
      } else if (offsetObj!.offset! > 0) {
        triggerAccessibilityOpen(focusMenuKey!, true)

        cleanRaf()
        rafRef.value = requestAnimationFrame(() => {
          refreshedElements = refreshElements(keys, id)
          const controlId = focusMenuElement!.getAttribute('aria-controls')
          const subQueryContainer = controlId
            ? document.getElementById(controlId)
            : null
          const targetElement = getNextFocusElement(
            subQueryContainer,
            refreshedElements.elements,
          )
          tryFocus(targetElement)
        })
      } else if (offsetObj!.offset! < 0) {
        const keyPath = getKeyPath(focusMenuKey!, true)
        const parentKey = keyPath[keyPath.length - 2]
        const parentMenuElement = key2element.get(parentKey)
        triggerAccessibilityOpen(parentKey, false)
        tryFocus(parentMenuElement)
      }
    }

    originOnKeyDown?.(e)
  }
}
