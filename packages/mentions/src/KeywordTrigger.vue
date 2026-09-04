<script setup vapor lang="ts">
  import type { KeywordTriggerProps } from './interface'

  import Trigger from '@vapor-component/trigger'
  import { computed } from 'vue'

  import DropdownMenu from './DropdownMenu.vue'

  defineOptions({ name: 'MentionsKeywordTrigger', inheritAttrs: false })

  const props = withDefaults(defineProps<KeywordTriggerProps>(), {
    prefixCls: 'vc-mentions',
  })

  const BUILT_IN_PLACEMENTS = {
    bottomRight: {
      points: ['tl', 'br'],
      offset: [0, 4],
      overflow: { adjustX: 1, adjustY: 1 },
    },
    bottomLeft: {
      points: ['tr', 'bl'],
      offset: [0, 4],
      overflow: { adjustX: 1, adjustY: 1 },
    },
    topRight: {
      points: ['bl', 'tr'],
      offset: [0, -4],
      overflow: { adjustX: 1, adjustY: 1 },
    },
    topLeft: {
      points: ['br', 'tl'],
      offset: [0, -4],
      overflow: { adjustX: 1, adjustY: 1 },
    },
  }

  const mergedVisible = computed(() => props.visible ?? true)
  const dropdownPrefix = computed(() => `${props.prefixCls}-dropdown`)
  const dropdownPlacement = computed(() => {
    if (props.direction === 'rtl') {
      return props.placement === 'top' ? 'topLeft' : 'bottomLeft'
    }
    return props.placement === 'top' ? 'topRight' : 'bottomRight'
  })
</script>

<template>
  <Trigger
    :prefix-cls="dropdownPrefix"
    :popup-visible="mergedVisible"
    :popup-placement="dropdownPlacement"
    :popup-motion="{ name: transitionName }"
    :builtin-placements="BUILT_IN_PLACEMENTS"
    :get-popup-container="getPopupContainer"
    :popup-class-name="popupClassName"
    :popup-style="popupStyle"
  >
    <template #default="{ trigger, setRef }">
      <slot name="default" v-bind="{ trigger, setRef }" />
    </template>
    <template #popup>
      <slot name="popup">
        <DropdownMenu
          :prefix-cls="dropdownPrefix"
          :options="options"
          :opened="mergedVisible"
        />
      </slot>
    </template>
  </Trigger>
</template>
