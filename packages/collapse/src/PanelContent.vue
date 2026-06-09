<script setup vapor lang="ts">
  import type { CollapsePanelProps } from './interface'

  import { clsx } from '@v-c/util'
  import { computed, shallowRef, watch } from 'vue'

  defineOptions({ name: 'PanelContent', inheritAttrs: false })

  const props = defineProps<CollapsePanelProps>()

  // Lazy render: only mount once it becomes active (or forced).
  const rendered = shallowRef(props.isActive || props.forceRender)
  watch(
    () => [props.isActive, props.forceRender],
    () => {
      if (props.isActive || props.forceRender) {
        rendered.value = true
      }
    },
  )

  const panelCls = computed(() =>
    clsx(
      `${props.prefixCls}-panel`,
      {
        [`${props.prefixCls}-panel-active`]: props.isActive,
        [`${props.prefixCls}-panel-inactive`]: !props.isActive,
      },
      props.class,
    ),
  )
  const bodyCls = computed(() =>
    clsx(`${props.prefixCls}-body`, props.classNames?.body),
  )
</script>

<template>
  <div v-if="rendered" :class="panelCls" :style="(style as any)" :role="role">
    <div :class="bodyCls" :style="styles?.body">
      <component
        v-if="children && typeof children === 'object'"
        :is="children"
      />
      <slot v-else>{{ children }}</slot>
    </div>
  </div>
</template>
