<script setup vapor lang="ts">
  import type { CSSProperties } from 'vue'

  import { clsx } from '@v-c/util'
  import { computed, useAttrs } from 'vue'

  defineOptions({ name: 'PaginationPager', inheritAttrs: false })

  const props = defineProps<{
    rootPrefixCls: string
    page: number
    active?: boolean
    showTitle: boolean
    itemRender?: ItemRender
  }>()
  const emit = defineEmits<{
    click: [page: number]
  }>()

  const attrs = useAttrs()

  const prefixCls = computed(() => `${props.rootPrefixCls}-item`)

  const itemCls = computed(() =>
    clsx(
      prefixCls.value,
      `${prefixCls.value}-${props.page}`,
      {
        [`${prefixCls.value}-active`]: props.active,
        [`${prefixCls.value}-disabled`]: !props.page,
      },
      (attrs as any).class,
    ),
  )

  function handleClick() {
    emit('click', props.page)
  }

  function handleKeydown(e: KeyboardEvent) {
    if (e.key === 'Enter' || e.keyCode === 13) {
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
    :title="showTitle ? String(page) : undefined"
    :class="itemCls"
    :style="(attrs as any).style"
    @click="handleClick"
    @keydown="handleKeydown"
    tabindex="0"
  >
    <slot
      name="itemRender"
      v-bind="{ page, type: 'page', defaultNode: itemNode }"
    >
      <a rel="nofollow">{{ page }}</a>
    </slot>
  </li>
</template>
