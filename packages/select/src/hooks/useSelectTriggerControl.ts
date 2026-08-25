import type { Ref } from 'vue'

import type { TriggerOpenType } from './useOpen'

import { onMounted, onUnmounted } from 'vue'

export function isInside(
  elements: (HTMLElement | SVGElement | undefined)[],
  target: HTMLElement,
): boolean {
  return elements
    .filter(element => element)
    .some(element => element!.contains(target) || element === target)
}

export default function useSelectTriggerControl(
  elements: () => (HTMLElement | SVGElement | undefined)[],
  open: Ref<boolean>,
  triggerOpen: TriggerOpenType,
  customizedTrigger: Ref<boolean>,
  popupElements?: () => (HTMLElement | SVGElement | undefined)[],
) {
  const onGlobalMouseDown = (event: MouseEvent) => {
    if (customizedTrigger.value) return

    let target = event.target as HTMLElement
    if (target.shadowRoot && event.composed) {
      target = (event.composedPath()[0] || target) as HTMLElement
    }
    if ((event as any)._ori_target) {
      target = (event as any)._ori_target
    }

    if (!open.value) return

    // Don't close if clicking inside the select container OR the popup.
    // Without checking popupElements, clicking inside the popup (which lives
    // in a Portal outside the select DOM) is treated as "outside" and closes it.
    if (isInside(elements(), target)) return
    if (popupElements && isInside(popupElements(), target)) return

    triggerOpen(false)
  }

  onMounted(() => {
    window.addEventListener('mousedown', onGlobalMouseDown)
    onUnmounted(() => {
      window.removeEventListener('mousedown', onGlobalMouseDown)
    })
  })
}
