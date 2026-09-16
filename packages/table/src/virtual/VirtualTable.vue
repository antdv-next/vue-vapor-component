<script setup vapor lang="ts">
  import type { VirtualTableProps } from '../interface'

  import { clsx } from '@v-c/util'
  import { computed, reactive, ref, watchEffect } from 'vue'

  import { DEFAULT_PREFIX } from '../constant'
  import Table from '../Table.vue'
  import { useProvideStaticContext } from '../VirtualTableContextKey'
  import BodyGrid from './BodyGrid.vue'

  const props = withDefaults(defineProps<VirtualTableProps<any>>(), {
    scroll: () => ({}),
  })

  const tableRef = ref<any>(null)
  const bodyRef = ref<any>(null)

  const mergedScrollX = computed(() => {
    const scrollX = props.scroll?.x
    if (typeof scrollX !== 'number') {
      return 1
    }
    return scrollX
  })

  const mergedScrollY = computed(() => {
    const scrollY = props.scroll?.y
    if (typeof scrollY !== 'number') {
      return 500
    }
    return scrollY
  })

  const getComponent: any = (path: any, defaultComponent: any) => {
    const value =
      (props.components as any)?.[path]?.[0] ??
      (props.components as any)?.[path]
    return value || defaultComponent
  }

  const onTablePropScroll = (event: Event) => {
    // emit scroll through props
  }

  const staticContext = reactive<any>({
    get scrollY() {
      return mergedScrollY.value
    },
    get listItemHeight() {
      return props.listItemHeight
    },
    get sticky() {
      return props.sticky
    },
    getComponent,
    onScroll: onTablePropScroll,
  })

  useProvideStaticContext(staticContext)

  defineExpose({
    get nativeElement() {
      return tableRef.value?.nativeElement
    },
    scrollTo: (config: any) => {
      bodyRef.value?.scrollTo?.(config)
    },
  })

  const mergedClassName = computed(() => {
    const prefixCls = props.prefixCls || DEFAULT_PREFIX
    return clsx(props.className, `${prefixCls}-virtual`)
  })

  const restProps = computed(() => {
    const { scroll, listItemHeight, components, ...rest } = props as any
    return rest
  })

  const mergedScroll = computed(() => ({
    ...props.scroll,
    x: mergedScrollX.value,
    y: mergedScrollY.value,
  }))

  const bodyComponent = computed(() => {
    return props.data?.length ? BodyGrid : undefined
  })
</script>

<template>
  <Table
    v-bind="restProps"
    :class="mergedClassName"
    :scroll="mergedScroll"
    :components="{
      ...components,
      body: bodyComponent,
    }"
    internal-hooks="vc-table-internal-hook"
    tailor
    ref="tableRef"
    :body-ref="bodyRef"
  >
    <slot />
  </Table>
</template>
