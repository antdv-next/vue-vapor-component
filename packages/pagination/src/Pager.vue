<script setup vapor lang="ts">
  import type { CSSProperties } from 'vue'

  import type { ItemRender } from './interface'

  import { clsx } from '@v-c/util'
  import { computed } from 'vue'

  defineOptions({ name: 'PaginationPager' })

  const props = defineProps<{
    rootPrefixCls: string
    page: number
    active?: boolean
    class?: string | object | string[]
    style?: CSSProperties
    showTitle: boolean
    itemRender?: ItemRender
    onClick?: (page: number) => void
  }>()

  const prefixCls = computed(() => `${props.rootPrefixCls}-item`)

  const itemCls = computed(() =>
    clsx(
      prefixCls.value,
      `${prefixCls.value}-${props.page}`,
      {
        [`${prefixCls.value}-active`]: props.active,
        [`${prefixCls.value}-disabled`]: !props.page,
      },
      props.class,
    ),
  )

  function handleClick() {
    props.onClick?.(props.page)
  }

  function handleKeydown(e: KeyboardEvent) {
    if (
      e.key === 'Enter' ||
      e.keyCode === 13
    ) {
      handleClick()
    }
  }

  // itemRender(page, 'page', defaultAnchor) returns VueNode
  const itemNode = computed(() => {
    return `<a rel="nofollow">${props.page}</a>`
  })
</script>

<template>
  <li
    :title="props.showTitle ? String(props.page) : undefined"
    :class="itemCls"
    :style="props.style"
    @click="handleClick"
    @keydown="handleKeydown"
    tabindex="0"
  >
    <slot name="itemRender" v-bind="{ page, type: 'page', defaultNode: itemNode }">
      <a rel="nofollow">{{ props.page }}</a>
    </slot>
  </li>
</template>
