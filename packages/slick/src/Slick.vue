<script setup vapor lang="ts">
  import type { InnerSliderRef, SlickProps, SlickRef } from './interface'

  import { computed, onBeforeUnmount, onMounted, shallowRef } from 'vue'

  import defaultProps from './defaultProps'
  import InnerSlider from './InnerSlider.vue'
  import { canUseDOM, filterSettings } from './utils/innerSliderUtils'

  defineOptions({ name: 'Slick' })

  const props = defineProps<SlickProps>()
  const breakpoint = shallowRef<number | null>(null)
  const innerSliderRef = shallowRef<InnerSliderRef | null>(null)
  const responsiveMediaHandlers: Array<{
    mql: MediaQueryList
    listener: (e: any) => void
  }> = []

  function toMediaQuery(query: { minWidth?: number; maxWidth?: number }) {
    const parts: string[] = []
    if (typeof query.minWidth === 'number') {
      parts.push(`(min-width: ${query.minWidth}px)`)
    }
    if (typeof query.maxWidth === 'number') {
      parts.push(`(max-width: ${query.maxWidth}px)`)
    }
    return parts.join(' and ')
  }

  function media(query: string, handler: () => void) {
    if (!canUseDOM()) return
    const mql = window.matchMedia(query)
    const listener = (e: any) => {
      if (e.matches) handler()
    }
    if (mql.addEventListener) mql.addEventListener('change', listener)
    else mql.addListener(listener)
    responsiveMediaHandlers.push({ mql, listener })
  }

  onMounted(() => {
    if (props.responsive) {
      const breakpoints = props.responsive.map(b => b.breakpoint)
      breakpoints.sort((x, y) => x - y)

      breakpoints.forEach((value, index) => {
        let bQuery = ''
        if (index === 0) {
          bQuery = toMediaQuery({ minWidth: 0, maxWidth: value })
        } else {
          bQuery = toMediaQuery({
            minWidth: breakpoints[index - 1] + 1,
            maxWidth: value,
          })
        }
        canUseDOM() &&
          media(bQuery, () => {
            breakpoint.value = value
          })
      })

      const query = toMediaQuery({ minWidth: breakpoints.slice(-1)[0] })
      canUseDOM() &&
        media(query, () => {
          breakpoint.value = null
        })
    }
  })

  onBeforeUnmount(() => {
    responsiveMediaHandlers.forEach(obj => {
      if (obj.mql.removeEventListener)
        obj.mql.removeEventListener('change', obj.listener)
      else obj.mql.removeListener(obj.listener)
    })
  })

  // ---------- SlickRef API ----------

  const slickPrev = () => innerSliderRef.value?.slickPrev()
  const slickNext = () => innerSliderRef.value?.slickNext()
  const slickGoTo = (slide: number, dontAnimate = false) =>
    innerSliderRef.value?.slickGoTo(slide, dontAnimate)
  const slickPause = () => innerSliderRef.value?.pause('paused')
  const slickPlay = () => innerSliderRef.value?.autoPlay('play')

  defineExpose<SlickRef>({
    innerSlider: innerSliderRef,
    slickPrev,
    slickNext,
    slickGoTo,
    slickPause,
    slickPlay,
  })

  // ---------- merged settings ----------

  const mergedSettings = computed<Record<string, any> | 'unslick'>(() => {
    let settings: any
    if (breakpoint.value && props.responsive) {
      const newProps = props.responsive.filter(
        r => r.breakpoint === breakpoint.value,
      )
      settings =
        newProps[0].settings === 'unslick'
          ? 'unslick'
          : { ...defaultProps, ...newProps[0].settings }
    } else {
      settings = { ...defaultProps }
    }
    for (const key of Object.keys(props) as (keyof SlickProps)[]) {
      const val = props[key]
      if (val === undefined) continue
      if (typeof val === 'boolean' && val === false) continue
      settings[key] = val
    }

    if (settings.centerMode) {
      settings.slidesToScroll = 1
    }
    if (settings.fade) {
      settings.slidesToShow = 1
      settings.slidesToScroll = 1
    }

    return settings
  })

  // ---------- slide count handled in InnerSlider via DOM ----------

  const isUnslick = computed(() => mergedSettings.value === 'unslick')
</script>

<template>
  <template v-if="isUnslick">
    <div :class="`regular slider ${className || ''}`">
      <slot />
    </div>
  </template>
  <template v-else>
    <InnerSlider
      ref="innerSliderRef"
      :style="style"
      v-bind="filterSettings(mergedSettings as any) as any"
    >
      <slot />
    </InnerSlider>
  </template>
</template>
