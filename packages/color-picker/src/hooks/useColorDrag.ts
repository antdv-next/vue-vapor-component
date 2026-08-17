import type { Ref } from 'vue'

import type { TransformOffset } from '../interface'

import { computed, ref, shallowRef, watch } from 'vue'

type EventType = MouseEvent | TouchEvent
type EventHandle = (e: EventType) => void

interface useColorDragProps {
  color: any
  containerRef: Ref<HTMLDivElement>
  targetRef: Ref<{ transformDomRef: HTMLDivElement }>
  direction?: 'x' | 'y'
  onDragChange?: (offset: TransformOffset) => void
  onDragChangeComplete?: () => void
  calculate?: () => TransformOffset
  disabledDrag?: boolean
}

function getPosition(e: EventType) {
  const obj = 'touches' in e ? e.touches[0]! : (e as MouseEvent)
  const scrollXOffset =
    document.documentElement.scrollLeft ||
    document.body.scrollLeft ||
    window.pageXOffset
  const scrollYOffset =
    document.documentElement.scrollTop ||
    document.body.scrollTop ||
    window.pageYOffset
  return {
    pageX: obj.pageX - scrollXOffset,
    pageY: obj.pageY - scrollYOffset,
  }
}

function useColorDrag(
  props: useColorDragProps,
): [Ref<TransformOffset>, EventHandle, () => void] {
  const {
    containerRef,
    targetRef,
    direction,
    onDragChange,
    onDragChangeComplete,
    disabledDrag,
  } = props

  const offsetValue = ref<TransformOffset>({ x: 0, y: 0 })
  const mouseMoveRef = shallowRef<EventHandle>(() => {})
  const mouseUpRef = shallowRef<EventHandle>(() => {})

  const calculateOffset = computed<TransformOffset>(() => {
    if (!props.color || !props.calculate) return { x: 0, y: 0 }
    return props.calculate()
  })

  const resetOffset = () => {
    offsetValue.value = calculateOffset.value
  }

  watch(() => props.color, resetOffset, { immediate: true })

  const removeEventListener = () => {
    document.removeEventListener('mousemove', mouseMoveRef.value)
    document.removeEventListener('mouseup', mouseUpRef.value)
    document.removeEventListener('touchmove', mouseMoveRef.value)
    document.removeEventListener('touchend', mouseUpRef.value)
    mouseMoveRef.value = () => {}
    mouseUpRef.value = () => {}
  }

  const updateOffset: EventHandle = e => {
    if (!containerRef.value || !targetRef.value) return

    const { pageX, pageY } = getPosition(e)
    const {
      x: rectX,
      y: rectY,
      width,
      height,
    } = containerRef.value.getBoundingClientRect()
    const { width: targetWidth, height: targetHeight } =
      targetRef.value.transformDomRef.getBoundingClientRect()

    const percentX = ((pageX - rectX) / width) * 100
    const percentY = ((pageY - rectY) / height) * 100

    const offsetX = Math.max(0, Math.min(percentX, 100))
    const offsetY = Math.max(0, Math.min(percentY, 100))

    const calcOffset: TransformOffset = {
      x: offsetX,
      y: direction === 'x' ? offsetValue.value.y : offsetY,
    }

    if (
      (targetWidth === 0 && targetHeight === 0) ||
      targetWidth !== targetHeight
    ) {
      return
    }

    offsetValue.value = calcOffset
    onDragChange?.(calcOffset)
  }

  const onDragMove: EventHandle = e => {
    e.preventDefault()
    updateOffset(e)
  }

  const onDragStop: EventHandle = e => {
    e.preventDefault()
    removeEventListener()
    onDragChangeComplete?.()
  }

  const onDragStart: EventHandle = e => {
    removeEventListener()

    if (disabledDrag) return

    updateOffset(e)
    document.addEventListener('mousemove', onDragMove)
    document.addEventListener('mouseup', onDragStop)
    document.addEventListener('touchmove', onDragMove)
    document.addEventListener('touchend', onDragStop)
    mouseMoveRef.value = onDragMove
    mouseUpRef.value = onDragStop
  }

  return [offsetValue, onDragStart, resetOffset]
}

export default useColorDrag
