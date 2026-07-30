<script setup vapor lang="ts">
  import type { CSSProperties } from 'vue'

  import type { ContentProps } from './interface'

  import { clsx } from '@v-c/util'
  import { computed, useAttrs } from 'vue'

  defineOptions({ name: 'VcPopup' })
  const props = defineProps<ContentProps>()
  const attrs = useAttrs()

  const cls = computed(() =>
    clsx(
      `${props.prefixCls}-container`,
      props.classNames?.container,
      attrs.class,
    ),
  )
  const styles = computed<CSSProperties>(() => ({
    ...(attrs.style as CSSProperties),
  }))
</script>

<template>
  <div :id="id" :class="cls" :style="styles" role="tooltip">
    <slot />
  </div>
</template>
