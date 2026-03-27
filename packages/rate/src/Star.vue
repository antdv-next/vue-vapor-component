<script setup vapor lang="ts">
  import type { StarProps } from './interface'

  import KeyCode from '@v-c/util/dist/KeyCode'
  import { cloneVNode, computed, isVNode } from 'vue'
  defineOptions({ name: 'Star' })
  const props = defineProps<StarProps>()

  function cloneCharacterNode(node: any): any {
    if (Array.isArray(node)) {
      return node.map(item => (isVNode(item) ? cloneVNode(item) : item))
    }


    return isVNode(node) ? cloneVNode(node) : node
  }
  const onHover = (e: MouseEvent) => {
    const { index } = props
    props?.onHover?.(e, index)
  }
  const onClick = (e: MouseEvent) => {
    const { index } = props
    props?.onClick?.(e, index)
  }
  const onKeyDown = (e: KeyboardEvent) => {
    const { index } = props
    if (e.keyCode === KeyCode.ENTER) {
      props?.onClick?.(e, index)
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
</script>

<template>
  <slot name="characterRender" ref="el">
    <li :class="cls">
      <div
        @click="e => disabled ? null : onClick(e)"
        @keydown="e => disabled ? null : onKeyDown(e)"
        @mousemove="e => disabled ? null : onHover(e)"
        role="radio"
        :aria-checked="value > index ? 'true' : 'false'"
        :aria-posinset="index + 1"
        :aria-setsize="count"
        :tabindex="disabled ? -1 : 0"
      >
        <div :class="`${prefixCls}-first`">
          <slot
            name="firstCharacterNode"
            :disabled="disabled"
            :prefixCls="prefixCls"
            :index="index"
            :count="count"
            :value="value"
          >
            {{ character }}
          </slot>
        </div>
        <div :class="`${prefixCls}-second`">
          <slot
            name="secondCharacterNode"
            :disabled="disabled"
            :prefixCls="prefixCls"
            :index="index"
            :count="count"
            :value="value"
          >
            {{ character }}
          </slot>
        </div>
      </div>
    </li>
  </slot>
</template>
