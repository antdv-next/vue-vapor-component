<script setup vapor lang="ts">
  import type { TabPaneProps } from '../interface'

  import { computed, useTemplateRef, watch } from 'vue'

  defineOptions({ name: 'VcTabsTabPane', inheritAttrs: false })

  const props = defineProps<TabPaneProps>()

  const TabPaneRef = useTemplateRef<HTMLDivElement>('TabPaneRef')

  const hasContent = computed(() => true)

  watch(
    () => props.active,
    () => {
      const el = TabPaneRef.value
      if (!el) return
      el.classList.toggle(`${props.prefixCls}-active`, props.active)
      el.setAttribute('aria-hidden', String(!props.active))
      el.setAttribute('tabindex', props.active && hasContent.value ? '0' : '-1')
    },
    { immediate: true },
  )
</script>

<template>
  <div
    :id="id != null ? `${id}-panel-${tabKey}` : undefined"
    ref="TabPaneRef"
    role="tabpanel"
    :tabindex="active && hasContent ? 0 : -1"
    :aria-labelledby="id != null ? `${id}-tab-${tabKey}` : undefined"
    :aria-hidden="!active"
    :style="style"
    :class="[prefixCls, active && `${prefixCls}-active`, className]"
  >
    <slot />
  </div>
</template>
