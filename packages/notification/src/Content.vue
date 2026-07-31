<script setup vapor lang="ts">
  import type { CSSProperties } from 'vue'

  import { clsx } from '@v-c/util'
  import { shallowRef, computed, useTemplateRef } from 'vue'

  defineOptions({ name: 'NotificationListContent', inheritAttrs: false })

  const props = withDefaults(
    defineProps<{
      listPrefixCls: string
      height: number
      topNoticeHeight?: number
      topNoticeWidth?: number
      className?: string
      style?: CSSProperties
    }>(),
    {
      topNoticeHeight: 0,
      topNoticeWidth: 0,
    },
  )

  const contentRef = useTemplateRef<HTMLDivElement>('contentRef')

  // Cache the previous height so we can tell increase vs decrease
  const prevHeight = shallowRef(props.height)
  const heightStatus = computed(() => {
    const h = props.height
    const status = h < prevHeight.value ? 'decrease' : 'increase'
    prevHeight.value = h
    return status
  })

  const contentStyle = computed(
    () =>
      ({
        ...props.style,
        height: `${props.height}px`,
        '--top-notificiation-height': `${props.topNoticeHeight}px`,
        '--top-notificiation-width': `${props.topNoticeWidth}px`,
      }) as CSSProperties,
  )

  defineExpose({ nativeElement: contentRef })
</script>

<template>
  <div
    ref="contentRef"
    :class="
      clsx(
        `${props.listPrefixCls}-content`,
        `${props.listPrefixCls}-content-${heightStatus}`,
        props.className,
      )
    "
    :style="contentStyle"
  >
    <slot />
  </div>
</template>
