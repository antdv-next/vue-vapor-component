<script setup vapor lang="ts">
import type { VueNode } from '@v-c/util/dist/type'
import { computed } from 'vue'

defineOptions({ name: 'MultipleDates', inheritAttrs: false })

interface TagRenderProps {
  label: string
  value: any
  disabled: boolean
  closable: boolean
  onClose: (event?: MouseEvent) => void
}

const props = defineProps<{
  prefixCls: string
  value: any[]
  onRemove: (value: any) => void
  removeIcon?: VueNode
  formatDate: (date: any) => string
  disabled?: boolean
  placeholder?: VueNode
  maxTagCount?: number | 'responsive'
  tagRender?: (tag: TagRenderProps) => VueNode
}>()

const mergedValue = computed(() => props.value || [])

const selectorCls = computed(() => `${props.prefixCls}-selector`)
const selectionCls = computed(() => `${props.prefixCls}-selection`)
const selectionItemCls = computed(() => `${selectionCls.value}-item`)

// Vapor deviation: the vdom source delegated layout to `@v-c/overflow` and fed
// it `renderItem` returning a JSX element. Vapor cannot carry a `VNode` into
// `Item.vue`'s `{{ childNode }}` interpolation (skill rules 7.1 / 7.5 / 26), so
// the tag markup is rendered natively here and `maxTagCount` is applied by
// slicing. `'responsive'` therefore renders every tag and relies on the
// selector's own `overflow: hidden` — the `+N` rest tag only appears for a
// numeric `maxTagCount`.
const visibleTagCount = computed<number>(() => {
  if (typeof props.maxTagCount === 'number') return Math.max(props.maxTagCount, 0)
  return mergedValue.value.length
})

const visibleTags = computed(() => {
  const visible = mergedValue.value.slice(0, visibleTagCount.value)
  return visible.map((date) => {
    const label = props.formatDate(date)

    const onClose = (event?: MouseEvent) => {
      event?.stopPropagation()
      if (!props.disabled) props.onRemove(date)
    }

    const custom = props.tagRender
      ? props.tagRender({
        label,
        value: date,
        disabled: !!props.disabled,
        closable: !props.disabled,
        onClose,
      })
      : null

    return {
      date,
      label,
      closable: !props.disabled,
      custom,
      onClose,
    }
  })
})

const restText = computed<string | null>(() => {
  const omitted = mergedValue.value.length - visibleTags.value.length
  return omitted > 0 ? `+ ${omitted} ...` : null
})

const hasValue = computed(() => mergedValue.value.length > 0)

const onRemoveTag = (event: MouseEvent, tag: { date: any }) => {
  event.stopPropagation()
  if (!props.disabled) props.onRemove(tag.date)
}
</script>

<template>
  <div :class="selectorCls">
    <template v-for="(tag, index) in visibleTags" :key="index">
      <span
        v-if="!tag.custom"
        :class="selectionItemCls"
        :title="tag.label"
      >
        <span :class="`${selectionCls}-item-content`">
          {{ tag.label }}
        </span>
        <span
          v-if="tag.closable"
          :class="`${selectionCls}-item-remove`"
          @mousedown.prevent
          @click="onRemoveTag($event, tag)"
        >
          <slot name="removeIcon">
            <component :is="removeIcon" />
          </slot>
        </span>
      </span>
      <template v-else>
        <slot name="customTag">
          <component :is="tag.custom" />
        </slot>
      </template>
    </template>
    <span v-if="restText" :class="selectionItemCls">
      {{ restText }}
    </span>
    <span v-if="!hasValue" :class="`${prefixCls}-selection-placeholder`">
      <slot name="placeholder">{{ placeholder }}</slot>
    </span>
  </div>
</template>
