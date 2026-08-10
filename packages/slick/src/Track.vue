<script setup vapor lang="ts">
  import { clsx } from '@v-c/util'
  import { getStylePxValue } from '@v-c/util/dist/props-util'
  import { shallowRef, watchEffect } from 'vue'
  import type { TrackProps } from './interface'

  defineOptions({ name: 'Track' })

  const props = withDefaults(
    defineProps<TrackProps>(),
    {
      currentSlide: 0,
      targetSlide: 0,
      slideCount: 0,
      slidesToShow: 1,
      slidesToScroll: 1,
      slideHeight: null,
      listHeight: null,
      fade: false,
      cssEase: 'ease',
      speed: 500,
      infinite: true,
      centerMode: false,
      lazyLoadedList: () => [],
      rtl: false,
      vertical: false,
      variableWidth: false,
      unslick: false,
      centerPadding: '50px',
      trackStyle: () => ({}),
      useCSS: true,
      onMouseEnter: () => {},
      onMouseOver: () => {},
      onMouseLeave: () => {},
    },
  )

  const trackEl = shallowRef<HTMLDivElement | null>(null)

  watchEffect(() => {
    if (props.nodeRef) props.nodeRef.value = trackEl.value
  })

  function getSlideClasses(index: number): Record<string, boolean> {
    let slickActive = false
    let slickCenter = false
    let slickCurrent = false
    let idx = index

    if (props.rtl) {
      idx = props.slideCount - 1 - index
    }

    if (props.centerMode) {
      const centerOffset = Math.floor(props.slidesToShow / 2)
      slickCenter = (idx - props.currentSlide) % props.slideCount === 0
      if (
        idx > props.currentSlide - centerOffset - 1
        && idx <= props.currentSlide + centerOffset
      ) {
        slickActive = true
      }
    } else {
      slickActive =
        props.currentSlide <= idx
        && idx < props.currentSlide + props.slidesToShow
    }

    let focusedSlide = props.targetSlide
    if (props.targetSlide < 0) {
      focusedSlide = props.targetSlide + props.slideCount
    } else if (props.targetSlide >= props.slideCount) {
      focusedSlide = props.targetSlide - props.slideCount
    }
    slickCurrent = idx === focusedSlide

    return {
      'slick-slide': true,
      'slick-active': slickActive,
      'slick-center': slickCenter,
      'slick-current': slickCurrent,
    }
  }

  function getSlideStyle(index: number): Record<string, any> {
    const style: Record<string, any> = {}

    if (!props.variableWidth) {
      style.width = getStylePxValue(props.slideWidth)
    }

    if (props.fade) {
      style.position = 'relative'
      if (props.vertical && props.slideHeight) {
        style.top = getStylePxValue(-index * parseInt(String(props.slideHeight), 10))
      } else if (props.slideWidth) {
        style.left = getStylePxValue(-index * parseInt(String(props.slideWidth), 10))
      }
      style.opacity = props.currentSlide === index ? 1 : 0
      style.zIndex = props.currentSlide === index ? 999 : 998
      if (props.useCSS) {
        style.transition = `opacity ${props.speed}ms ${props.cssEase}, visibility ${props.speed}ms ${props.cssEase}`
      }
    }

    return style
  }

  function setupClickHandler(el: HTMLElement, index: number) {
    if (el.dataset.hasClickHandler) return
    el.dataset.hasClickHandler = '1'
    const origOnclick = el.onclick
    el.onclick = ((e: MouseEvent) => {
      origOnclick?.(e)
      props.focusOnSelect?.({
        message: 'children',
        index,
        slidesToScroll: props.slidesToScroll,
        currentSlide: props.currentSlide,
      })
    }) as any
  }

  const applySlideStyles = () => {
    const children = trackEl.value?.children
    if (!children || !children.length) return

    Array.from(children).forEach((child, i) => {
      const el = child as HTMLElement
      if (!el.dataset.userClass) {
        el.dataset.userClass = el.className
      }
      const originalClass = el.dataset.userClass || ''
      el.className = clsx(originalClass, getSlideClasses(i)) as string
      Object.assign(el.style, getSlideStyle(i))
      el.dataset.index = String(i)
      if (props.focusOnSelect) {
        setupClickHandler(el, i)
      }
    })
  }

  watchEffect(applySlideStyles)

  watchEffect(() => {
    if (trackEl.value) {
      Object.assign(trackEl.value.style, props.trackStyle)
    }
  })
</script>

<template>
  <div
    ref="trackEl"
    class="slick-track"
    :style="trackStyle"
    @mouseenter="onMouseEnter"
    @mouseover="onMouseOver"
    @mouseleave="onMouseLeave"
  >
    <slot />
  </div>
</template>