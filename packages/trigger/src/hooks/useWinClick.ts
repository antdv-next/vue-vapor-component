import type { Ref } from 'vue'

import { getShadowRoot } from '@v-c/util/dist/Dom/shadow'
import { shallowRef, watch } from 'vue'

import { getWin } from '../util'

export default function useWinClick(
  open: Ref<boolean>,
  clickToHide: Ref<boolean>,
  targetEle: Ref<HTMLElement>,
  popupEle: Ref<HTMLElement>,
  mask: Ref<boolean>,
  maskClosable: Ref<boolean>,
  inPopupOrChild: (target: EventTarget) => boolean,
  triggerOpen: (open: boolean) => void,
) {
  const openRef = shallowRef(open.value)
  watch(
    () => open.value,
    () => {
      openRef.value = open.value
    },
  )

  const popupPointerDownRef = shallowRef(false)

  watch(
    [clickToHide, targetEle, popupEle, mask, maskClosable],
    ([clickToHide, targetEle, popupEle, mask, maskClosable], _, onCleanup) => {
      if (clickToHide && popupEle && (!mask || maskClosable)) {
        const onPointerDown = () => {
          popupPointerDownRef.value = false
        }

        const onTriggerClose = (e: MouseEvent) => {
          if (
            openRef.value &&
            !inPopupOrChild(e.composedPath?.()?.[0] || e.target) &&
            !popupPointerDownRef.value
          ) {
            triggerOpen(false)
          }
        }

        const win = getWin(popupEle)

        win!.addEventListener('pointerdown', onPointerDown, true)
        win!.addEventListener('mousedown', onTriggerClose, true)
        win!.addEventListener('contextmenu', onTriggerClose, true)

        const targetShadowRoot: any = getShadowRoot(targetEle)
        if (targetShadowRoot) {
          targetShadowRoot.addEventListener('mousedown', onTriggerClose, true)
          targetShadowRoot.addEventListener('contextmenu', onTriggerClose, true)
        }

        onCleanup(() => {
          win!.removeEventListener('pointerdown', onPointerDown, true)
          win!.removeEventListener('mousedown', onTriggerClose, true)
          win!.removeEventListener('contextmenu', onTriggerClose, true)

          if (targetShadowRoot) {
            targetShadowRoot.removeEventListener(
              'mousedown',
              onTriggerClose,
              true,
            )
            targetShadowRoot.removeEventListener(
              'contextmenu',
              onTriggerClose,
              true,
            )
          }
        })
      }
    },
  )

  function onPopupPointerDown() {
    popupPointerDownRef.value = true
  }

  return onPopupPointerDown
}
