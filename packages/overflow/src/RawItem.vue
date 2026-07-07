<script setup vapor lang="ts">
  import type { CSSProperties } from 'vue'

  import type { OverflowContextType } from './interface'

  import { clsx } from '@v-c/util'
  import omit from '@v-c/util/dist/omit'
  import { computed, useAttrs } from 'vue'

  import Item from './Item.vue'
  import { useInjectOverflowContext } from './OverflowContextKey'
  import OverflowContextProvider from './OverflowContextProvider.vue'

  defineOptions({ name: 'OverflowRawItem', inheritAttrs: false })

  const props = defineProps<{
    component?: string | object | (() => any)
  }>()

  const attrs = useAttrs()
  const contextRef = useInjectOverflowContext()

  const contextValue = computed<OverflowContextType | null>(
    () => contextRef?.value ?? null,
  )

  const restAttrs = computed(() =>
    omit(attrs as Record<string, any>, ['class', 'style', 'default']),
  )

  const mergedCls = computed(() =>
    clsx(contextValue.value?.className, attrs.class as any),
  )

  const mergedStyle = computed<CSSProperties | undefined>(
    () => attrs.style as CSSProperties | undefined,
  )
</script>

<template>
  <component v-if="!contextValue" :is="props.component ?? 'div'" v-bind="attrs">
    <slot />
  </component>
  <OverflowContextProvider v-else :value="null">
    <Item
      :prefixCls="contextValue!.prefixCls"
      :responsive="contextValue!.responsive"
      :order="contextValue!.order"
      :registerSize="contextValue!.registerSize"
      :display="contextValue!.display"
      :invalidate="contextValue!.invalidate"
      :item="contextValue!.item"
      :itemKey="contextValue!.itemKey"
      :class="mergedCls"
      :style="mergedStyle"
      :component="props.component"
      v-bind="restAttrs"
    >
      <slot />
    </Item>
  </OverflowContextProvider>
</template>
