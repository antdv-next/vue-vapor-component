<script setup vapor lang="ts">
  import type { CSSProperties } from 'vue'

  import { clsx } from '@v-c/util'
  import { computed } from 'vue'

  import { useMenuContext } from './MenuContextKey'
  import { useMeasure } from './PathContextKey'

  defineOptions({ name: 'VcMenuDivider' })

  const props = defineProps<{
    style?: CSSProperties
    class?: string
  }>()

  const menuContext = useMenuContext()
  const measure = useMeasure()

  const dividerCls = computed(() =>
    clsx(
      `${menuContext?.value?.prefixCls || 'vc-menu'}-item-divider`,
      props.class,
    ),
  )
</script>

<template>
  <li
    v-if="!measure"
    role="separator"
    :class="dividerCls"
    :style="props.style"
  />
</template>
