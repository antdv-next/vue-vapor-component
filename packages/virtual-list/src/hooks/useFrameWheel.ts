import type { Ref } from 'vue'

import { onUnmounted, ref } from 'vue'

import isFF from '../utils/isFirefox'
import useOriginScroll from './useOriginScroll'

type FireFoxDOMMouseScrollEvent = Event & {
  detail?: number
}

export default function useFrameWheel(
  inVirtual: Ref<boolean>,
  isScrollAtTop: Ref<boolean>,
  isScrollAtBottom: Ref<boolean>,
  isScrollAtLeft: Ref<boolean>,
  isScrollAtRight: Ref<boolean>,
  horizontalScroll: Ref<boolean>,
  onWheelDelta: (offset: number, horizontal: boolean) => void,
): [(e: WheelEvent) => void, EventListener] {
  const offsetRef = ref(0)
  let nextFrame: number | null = null

  const wheelValueRef = ref<number | null>(null)
  const isMouseScrollRef = ref<boolean>(false)

  const originScroll = useOriginScroll(
    isScrollAtTop,
    isScrollAtBottom,
    isScrollAtLeft,
    isScrollAtRight,
  )

  function onWheelY(e: WheelEvent, deltaY: number) {
    if (nextFrame) cancelAnimationFrame(nextFrame)

    if (originScroll(false, deltaY)) return

    const event = e as WheelEvent & {
      _virtualHandled?: boolean
    }
    if (!event._virtualHandled) {
      event._virtualHandled = true
    } else {
      return
    }

    offsetRef.value += deltaY
    wheelValueRef.value = deltaY

    if (!isFF) {
      event.preventDefault()
    }

    nextFrame = requestAnimationFrame(() => {
      const patchMultiple = isMouseScrollRef.value ? 10 : 1
      onWheelDelta(offsetRef.value * patchMultiple, false)
      offsetRef.value = 0
    })
  }

  function onWheelX(event: WheelEvent, deltaX: number) {
    onWheelDelta(deltaX, true)

    if (!isFF) {
      event.preventDefault()
    }
  }

  const wheelDirectionRef = ref<'x' | 'y' | 'sx' | null>(null)
  let wheelDirectionClean: number | null = null

  function onWheel(event: WheelEvent) {
    if (!inVirtual.value) return

    if (wheelDirectionClean) cancelAnimationFrame(wheelDirectionClean)
    wheelDirectionClean = requestAnimationFrame(() => {
      wheelDirectionRef.value = null
    })

    const { deltaX, deltaY, shiftKey } = event

    let mergedDeltaX = deltaX
    let mergedDeltaY = deltaY

    if (
      wheelDirectionRef.value === 'sx' ||
      (!wheelDirectionRef.value && (shiftKey || false) && deltaY && !deltaX)
    ) {
      mergedDeltaX = deltaY
      mergedDeltaY = 0
      wheelDirectionRef.value = 'sx'
    }

    const absX = Math.abs(mergedDeltaX)
    const absY = Math.abs(mergedDeltaY)

    if (wheelDirectionRef.value === null) {
      wheelDirectionRef.value =
        horizontalScroll.value && absX > absY ? 'x' : 'y'
    }

    if (wheelDirectionRef.value === 'y') {
      onWheelY(event, mergedDeltaY)
    } else {
      onWheelX(event, mergedDeltaX)
    }
  }

  const onFireFoxScroll: EventListener = event => {
    if (!inVirtual.value) return

    isMouseScrollRef.value =
      (event as FireFoxDOMMouseScrollEvent).detail === wheelValueRef.value
  }

  onUnmounted(() => {
    if (nextFrame) cancelAnimationFrame(nextFrame)
    if (wheelDirectionClean) cancelAnimationFrame(wheelDirectionClean)
  })

  return [onWheel, onFireFoxScroll]
}
