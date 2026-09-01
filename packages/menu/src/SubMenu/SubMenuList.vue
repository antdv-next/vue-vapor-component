<script setup vapor lang="ts">
  import type { MenuMode } from '../interface'
  import type { MenuContextProps } from '../MenuContextKey'

  import { clsx } from '@v-c/util'
  import { computed } from 'vue'

  import { useMenuContext } from '../MenuContextKey'

  defineOptions({ name: 'VcSubMenuList' })

  const props = defineProps<{
    id?: string
    mode?: MenuMode
  }>()

  const ctx = useMenuContext()
  const prefixCls = computed(() => ctx?.value?.prefixCls || 'vc-menu')
  const rtl = computed(() => ctx?.value?.rtl)
  const mode = computed<MenuMode>(() => {
    const m = props.mode || ctx?.value?.mode || 'vertical'
    return m === 'inline' ? 'inline' : 'vertical'
  })

  const listCls = computed(() =>
    clsx(
      prefixCls.value,
      `${prefixCls.value}-sub`,
      `${prefixCls.value}-${mode.value}`,
      { [`${prefixCls.value}-rtl`]: rtl.value },
    ),
  )
</script>

<template>
  <ul :id="id" :class="listCls" role="menu" data-menu-list>
    <slot />
  </ul>
</template>
