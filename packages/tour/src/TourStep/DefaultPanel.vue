<script setup vapor lang="ts">
  import type { VueNode } from '@v-c/util/dist/type'
  import type { CSSProperties } from 'vue'

  import type { SemanticName } from '../interface'
  import type { ClosableConfig } from '../interface'

  import { clsx } from '@v-c/util'
  import { computed, useSlots } from 'vue'

  defineOptions({ name: 'TourDefaultPanel', inheritAttrs: false })

  const props = withDefaults(
    defineProps<{
      prefixCls?: string
      current?: number
      total?: number
      title?: VueNode
      description?: VueNode
      closable?: ClosableConfig | null
      closeIcon?: VueNode
      classNames?: Partial<Record<SemanticName, string>>
      styles?: Partial<Record<SemanticName, CSSProperties>>
    }>(),
    {
      prefixCls: 'vc-tour',
      current: 0,
      total: 1,
      closable: null,
    },
  )
  const emit = defineEmits<{
    close: []
    prev: []
    next: []
    finish: []
  }>()

  const slots = useSlots()

  const mergedClosable = computed(() => !!props.closable)
  const mergedCloseIcon = computed(() => props.closeIcon)

  const sliderList = computed(() => {
    if (props.total <= 1) return []
    return Array.from({ length: props.total }, (_, i) => i)
  })

  const showPrev = computed(() => props.current !== 0)
  const isLast = computed(
    () => props.total > 1 && props.current === props.total - 1,
  )
</script>

<template>
  <div :class="`${prefixCls}-panel`">
    <div
      :class="clsx(`${prefixCls}-section`, classNames?.section)"
      :style="styles?.section"
    >
      <button
        v-if="mergedClosable"
        type="button"
        :class="clsx(`${prefixCls}-close`, classNames?.close)"
        :style="styles?.close"
        aria-label="Close"
        @click="() => emit('close')"
      >
        <slot name="close-icon">
          <span v-if="!mergedCloseIcon" :class="`${prefixCls}-close-x`"
            >&times;</span
          >
        </slot>
      </button>

      <div
        :class="clsx(`${prefixCls}-header`, classNames?.header)"
        :style="styles?.header"
      >
        <div
          :class="clsx(`${prefixCls}-title`, classNames?.title)"
          :style="styles?.title"
        >
          {{ title }}
        </div>
      </div>

      <div
        v-if="description"
        :class="clsx(`${prefixCls}-description`, classNames?.description)"
        :style="styles?.description"
      >
        {{ description }}
      </div>

      <div
        :class="clsx(`${prefixCls}-footer`, classNames?.footer)"
        :style="styles?.footer"
      >
        <div v-if="sliderList.length" :class="`${prefixCls}-sliders`">
          <span
            v-for="index in sliderList"
            :key="index"
            :class="{ active: index === current }"
          />
        </div>

        <div
          :class="clsx(`${prefixCls}-actions`, classNames?.actions)"
          :style="styles?.actions"
        >
          <button
            v-if="showPrev"
            :class="`${prefixCls}-prev-btn`"
            @click="() => emit('prev')"
          >
            Prev
          </button>
          <button
            v-if="isLast"
            :class="`${prefixCls}-finish-btn`"
            @click="() => emit('finish')"
          >
            Finish
          </button>
          <button
            v-if="!isLast && total > 1"
            :class="`${prefixCls}-next-btn`"
            @click="() => emit('next')"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
