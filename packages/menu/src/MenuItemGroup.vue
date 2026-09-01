<script setup vapor lang="ts">
  import type { MenuItemGroupProps } from './MenuItemGroupProps'

  import { clsx } from '@v-c/util'
  import { computed } from 'vue'

  import { useMenuContext } from './MenuContextKey'

  defineOptions({ name: 'VcMenuItemGroup', inheritAttrs: false })

  const props = defineProps<MenuItemGroupProps>()

  const context = useMenuContext()
  const prefixCls = computed(() => context?.value?.prefixCls || 'vc-menu')
  const groupPrefixCls = computed(() => `${prefixCls.value}-item-group`)
  const menuClasses = computed(() => context?.value?.classes || {})
  const menuStyles = computed(() => context?.value?.styles || {})

  const titleCls = computed(() =>
    clsx(`${groupPrefixCls.value}-title`, menuClasses.value.listTitle),
  )
  const listCls = computed(() =>
    clsx(`${groupPrefixCls.value}-list`, menuClasses.value.list),
  )
</script>

<template>
  <li
    role="presentation"
    :class="clsx(groupPrefixCls, props.class)"
    :style="props.style"
    @click="e => e.stopPropagation()"
  >
    <div
      role="presentation"
      :class="titleCls"
      :style="menuStyles.listTitle"
      :title="typeof props.title === 'string' ? props.title : undefined"
    >
      <slot name="title">{{ props.title }}</slot>
    </div>
    <ul role="group" :class="listCls" :style="menuStyles.list">
      <slot />
    </ul>
  </li>
</template>
