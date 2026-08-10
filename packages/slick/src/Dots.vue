<script setup vapor lang="ts">
  import type { VNodeChild } from 'vue'
  import { clsx } from '@v-c/util'
  import { computed } from 'vue'
  import defaultProps from './defaultProps'
  import { clamp } from './utils/innerSliderUtils'

  defineOptions({ name: 'Dots' })

  const props = withDefaults(
    defineProps<{
      dotsClass: string
      slideCount: number
      slidesToShow: number
      currentSlide: number
      slidesToScroll: number
      clickHandler?: (options: any, e?: MouseEvent) => void
      customPaging?: (index: number) => VNodeChild
      infinite?: boolean
      onMouseEnter?: (e: MouseEvent) => void
      onMouseOver?: (e: MouseEvent) => void
      onMouseLeave?: (e: MouseEvent) => void
    }>(),
    {
      dotsClass: 'slick-dots',
      slideCount: 0,
      slidesToShow: 1,
      currentSlide: 0,
      slidesToScroll: 1,
      infinite: true,
      onMouseEnter: () => {},
      onMouseOver: () => {},
      onMouseLeave: () => {},
    },
  )

  const dotCount = computed(() => {
    if (props.infinite) {
      return Math.ceil(props.slideCount / props.slidesToScroll)
    }
    return Math.ceil((props.slideCount - props.slidesToShow) / props.slidesToScroll) + 1
  })

  const dotIndices = computed(() => Array.from({ length: dotCount.value }, (_, i) => i))

  function resolvePaging(idx: number): VNodeChild | null {
    const getCustomPaging = props.customPaging ?? defaultProps.customPaging
    if (!getCustomPaging) return null
    return getCustomPaging(idx)
  }

  function isDotActive(i: number): boolean {
    const _rightBound = (i + 1) * props.slidesToScroll - 1
    const rightBound = props.infinite
      ? _rightBound
      : clamp(_rightBound, 0, props.slideCount - 1)
    const _leftBound = rightBound - (props.slidesToScroll - 1)
    const leftBound = props.infinite
      ? _leftBound
      : clamp(_leftBound, 0, props.slideCount - 1)

    if (props.infinite) {
      return props.currentSlide >= leftBound && props.currentSlide <= rightBound
    }
    return props.currentSlide === leftBound
  }

  function dotClass(i: number) {
    return clsx({ 'slick-active': isDotActive(i) })
  }

  function dotClick(i: number, e: MouseEvent) {
    e.preventDefault()
    props.clickHandler?.({
      message: 'dots',
      index: i,
      slidesToScroll: props.slidesToScroll,
      currentSlide: props.currentSlide,
    }, e)
  }
</script>

<template>
  <ul
    :class="props.dotsClass"
    style="display:block"
    @mouseenter="onMouseEnter"
    @mouseover="onMouseOver"
    @mouseleave="onMouseLeave"
  >
    <li v-for="i in dotIndices" :key="i" :class="dotClass(i)">
      <slot>
        <button
          type="button"
          @click="(e: MouseEvent) => dotClick(i, e)"
        >
          {{ i + 1 }}
        </button>
      </slot> 
    </li>
  </ul>
</template>
