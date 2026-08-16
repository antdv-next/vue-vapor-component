<script setup vapor lang="ts">
  import type { VNodeChild } from 'vue'

  import { clsx } from '@v-c/util'
  import { computed } from 'vue'

  import { canGoNext } from './utils/innerSliderUtils'

  defineOptions({ name: 'Arrow' })

  const props = withDefaults(
    defineProps<{
      type: 'prev' | 'next'
      infinite?: boolean
      centerMode?: boolean
      currentSlide: number
      slideCount: number
      slidesToShow: number
      prevArrow?: VNodeChild
      nextArrow?: VNodeChild
      clickHandler?: (options: any, e?: MouseEvent) => void
    }>(),
    {
      type: 'prev',
      currentSlide: 0,
      slideCount: 0,
      slidesToShow: 1,
      infinite: true,
      centerMode: false,
    },
  )

  const isPrev = computed(() => props.type === 'prev')

  const isDisabled = computed(() => {
    if (isPrev.value) {
      return (
        !props.infinite &&
        (props.currentSlide === 0 || props.slideCount <= props.slidesToShow)
      )
    }
    return !canGoNext({
      infinite: props.infinite,
      centerMode: props.centerMode,
      currentSlide: props.currentSlide,
      slideCount: props.slideCount,
      slidesToShow: props.slidesToShow,
    } as any)
  })

  const arrowClass = computed(() =>
    clsx({
      'slick-arrow': true,
      'slick-prev': isPrev.value,
      'slick-next': !isPrev.value,
      'slick-disabled': isDisabled.value,
    }),
  )

  const arrowBind = computed(() => ({
    class: arrowClass.value,
    style: { display: 'block' },
    'data-role': 'none',
    currentSlide: props.currentSlide,
    slideCount: props.slideCount,
  }))

  function handleClick(e: MouseEvent) {
    if (isDisabled.value) return
    e.preventDefault()
    props.clickHandler?.({ message: isPrev.value ? 'previous' : 'next' }, e)
  }
</script>

<template>
  <slot name="prevArrow" v-if="isPrev" v-bind="arrowBind">
    <button
      type="button"
      :class="arrowClass"
      :style="{ display: 'block' }"
      data-role="none"
      @click="handleClick"
    >
      Previous
    </button>
  </slot>
  <slot name="nextArrow" v-else v-bind="arrowBind">
    <button
      type="button"
      :class="arrowClass"
      :style="{ display: 'block' }"
      data-role="none"
      @click="handleClick"
    >
      Next
    </button>
  </slot>
</template>
