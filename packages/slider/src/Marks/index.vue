<script setup vapor lang="ts">
  import type { InternalMarkObj } from '../interface'

  import { computed } from 'vue'

  import Mark from './Mark.vue'

  defineOptions({ name: 'SliderMarks' })

  const props = withDefaults(
    defineProps<{
      prefixCls: string
      marks?: InternalMarkObj[]
    }>(),
    {
      prefixCls: 'vc-slider',
      marks: () => [],
    },
  )
  const emit = defineEmits<{
    click: [value: number]
  }>()

  const markPrefixCls = computed(() => `${props.prefixCls}-mark`)

  const shouldRender = computed(() => props.marks && props.marks.length > 0)
</script>

<template>
  <div v-if="shouldRender" :class="markPrefixCls">
    <template v-for="mark in marks" :key="mark.value">
      <Mark
        :prefix-cls="markPrefixCls"
        :value="mark.value"
        :style="mark.style"
        @click="(v: number) => emit('click', v)"
      >
        <slot name="mark" :point="mark.value" :label="mark.label">
          {{ mark.label }}
        </slot>
      </Mark>
    </template>
  </div>
</template>
