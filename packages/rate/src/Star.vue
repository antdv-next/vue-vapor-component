<script setup vapor lang="ts">
  import type { StarProps } from './interface'

  import KeyCode from '@v-c/util/dist/KeyCode'
  import { computed } from 'vue'
  defineOptions({ name: 'Star' })
  const props = defineProps<StarProps>()
  const emit = defineEmits<{
    hover: [e: MouseEvent, index: number]
    click: [e: MouseEvent | KeyboardEvent, index: number]
  }>()

  const onHover = (e: MouseEvent) => {
    const { index } = props
    emit('hover', e, index)
  }
  const onClick = (e: MouseEvent) => {
    const { index } = props
    emit('click', e, index)
  }
  const onKeyDown = (e: KeyboardEvent) => {
    const { index } = props
    if (e.keyCode === KeyCode.ENTER) {
      emit('click', e, index)
    }
  }

  const cls = computed(() => {
    const { prefixCls, index, value, allowHalf, focused } = props
    const starValue = index + 1
    let className = prefixCls
    if (value === 0 && index === 0 && focused) {
      className += ` ${prefixCls}-focused`
    } else if (allowHalf && value + 0.5 >= starValue && value < starValue) {
      className += ` ${prefixCls}-half ${prefixCls}-active`
      if (focused) {
        className += ` ${prefixCls}-focused`
      }
    } else {
      if (starValue <= value) {
        className += ` ${prefixCls}-full`
      } else {
        className += ` ${prefixCls}-zero`
      }
      if (starValue === value && focused) {
        className += ` ${prefixCls}-focused`
      }
    }
    return className
  })
  const characterRenderSlotProps = computed(() => {
    return {
      ...props,
    }
  })
  const characterSlotProps = computed(() => {
    const { disabled, prefixCls, index, count, value } = props
    return {
      disabled,
      prefixCls,
      index,
      count,
      value,
    }
  })
</script>

<template>
  <slot name="characterRender" v-bind="characterRenderSlotProps">
    <li :class="cls">
      <div
        @click="e => (disabled ? null : onClick(e))"
        @keydown="e => (disabled ? null : onKeyDown(e))"
        @mousemove="e => (disabled ? null : onHover(e))"
        role="radio"
        :aria-checked="value > index ? 'true' : 'false'"
        :aria-posinset="index + 1"
        :aria-setsize="count"
        :tabindex="disabled ? -1 : 0"
      >
        <div :class="`${prefixCls}-first`">
          <slot name="character" v-bind="characterSlotProps">
            {{ character }}
          </slot>
        </div>
        <div :class="`${prefixCls}-second`">
          <slot name="character" v-bind="characterSlotProps">
            {{ character }}
          </slot>
        </div>
      </div>
    </li>
  </slot>
</template>
