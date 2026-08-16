<script setup vapor lang="ts">
  import type { ListRef as VcListRef } from '@vapor-component/virtual-list'
  import type { CSSProperties } from 'vue'

  import type { FlattenNode, Key } from './interface'

  import useId from '@v-c/util/dist/hooks/useId'
  import VcVirtualList from '@vapor-component/virtual-list'
  import { computed, shallowRef, ref, watch } from 'vue'

  import TreeNode from './TreeNode.vue'
  import { findExpandedKeys } from './utils/diffUtil'
  import { getKey, getTreeNodeProps } from './utils/treeUtil'

  defineOptions({ name: 'TreeNodeList', inheritAttrs: false })

  const props = defineProps<{
    prefixCls: string
    style?: CSSProperties
    data?: FlattenNode[]
    focusable?: boolean
    tabIndex?: number
    selectable?: boolean
    checkable?: boolean
    disabled?: boolean

    expandedKeys: Key[]
    selectedKeys: Key[]
    checkedKeys: Key[]
    loadedKeys: Key[]
    loadingKeys: Key[]
    halfCheckedKeys: Key[]
    keyEntities: Record<string, any>

    dragging?: boolean
    dragOverNodeKey: Key | null
    dropPosition: number | null

    height?: number
    itemHeight?: number
    virtual?: boolean
    scrollWidth?: number

    activeItem?: FlattenNode | null
  }>()

  const emit = defineEmits<{
    keydown: [e: KeyboardEvent]
    focus: [e: FocusEvent]
    blur: [e: FocusEvent]
    mousedown: [e: MouseEvent]
    'active-change': [key: Key | null]
    'list-change-start': []
    'list-change-end': []
    contextmenu: [e: MouseEvent]
    scroll: [e: Event]
  }>()

  const treeId = useId()
  const listRef = ref<VcListRef>()
  const indentMeasurerRef = ref<HTMLDivElement>()

  const treeNodeRequiredProps = computed(() => ({
    expandedKeys: props.expandedKeys || [],
    selectedKeys: props.selectedKeys || [],
    loadedKeys: props.loadedKeys || [],
    loadingKeys: props.loadingKeys || [],
    checkedKeys: props.checkedKeys || [],
    halfCheckedKeys: props.halfCheckedKeys || [],
    dragOverNodeKey: props.dragOverNodeKey,
    dropPosition: props.dropPosition,
    keyEntities: props.keyEntities,
  }))

  const prevExpandedKeys = shallowRef<Key[]>(props.expandedKeys || [])
  const prevData = shallowRef<FlattenNode[]>(props.data || [])
  const transitionData = shallowRef<FlattenNode[]>(props.data || [])
  const transitionRange = shallowRef<FlattenNode[]>([])
  const motionType = ref<'show' | 'hide' | null>(null)
  const dataRef = shallowRef<FlattenNode[]>(props.data || [])

  watch(
    () => props.data,
    newData => {
      dataRef.value = (newData || []) as any
    },
    { immediate: true },
  )

  function onMotionEnd() {
    const latestData = dataRef.value
    prevData.value = latestData
    transitionData.value = latestData
    transitionRange.value = []
    motionType.value = null
    emit('list-change-end')
  }

  watch(
    () => props.dragging,
    dragging => {
      if (!dragging) {
        onMotionEnd()
      }
    },
    { immediate: true },
  )

  watch(
    [() => props.expandedKeys, () => props.data],
    () => {
      const newData = props.data || []
      const newExpandedKeys = props.expandedKeys || []
      const diffExpanded = findExpandedKeys(
        prevExpandedKeys.value,
        newExpandedKeys,
      )

      if (diffExpanded.key !== null) {
        // No CSSTransition in vapor port — placeholder would never be cleaned up.
        // Skip transition setup entirely; just update to the final data state.
        prevData.value = newData
        transitionData.value = newData
        transitionRange.value = []
        motionType.value = null
      } else if (prevData.value !== newData) {
        prevData.value = newData
        transitionData.value = newData
      }
      prevExpandedKeys.value = newExpandedKeys
    },
    { immediate: true, flush: 'post' },
  )

  const mergedData = computed(() => transitionData.value)

  const indentMeasurerCls = computed(() => `${props.prefixCls}-treenode`)
  const indentCls = computed(() => `${props.prefixCls}-indent`)
  const indentUnitCls = computed(() => `${props.prefixCls}-indent-unit`)
  const listPrefixCls = computed(() => `${props.prefixCls}-list`)

  const focusableComputed = computed(
    () => props.focusable !== false && !props.disabled,
  )

  defineExpose({
    scrollTo: (scroll?: any) => {
      listRef.value?.scrollTo(scroll)
    },
    getIndentWidth: () => indentMeasurerRef.value?.offsetWidth || 0,
  })
</script>

<template>
  <div
    :class="indentMeasurerCls"
    aria-hidden="true"
    :style="
      {
        position: 'absolute',
        pointerEvents: 'none',
        visibility: 'hidden',
        height: 0,
        overflow: 'hidden',
        border: 0,
        padding: 0,
      } as CSSProperties
    "
  >
    <div :class="indentCls">
      <div ref="indentMeasurerRef" :class="indentUnitCls" />
    </div>
  </div>

  <VcVirtualList
    ref="listRef"
    :data="mergedData"
    item-key="key"
    :height="height"
    :full-height="false"
    :virtual="virtual"
    :item-height="itemHeight"
    :scroll-width="scrollWidth"
    :prefix-cls="listPrefixCls"
    role="tree"
    :style="style"
    :tabindex="focusableComputed ? tabIndex : undefined"
    @contextmenu="e => emit('contextmenu', e)"
    @scroll="e => emit('scroll', e)"
    @keydown="e => emit('keydown', e)"
    @focus="e => emit('focus', e)"
    @blur="e => emit('blur', e)"
    @mousedown="e => emit('mousedown', e)"
  >
    <template #default="{ item: treeNode }: { item: FlattenNode }">
      <TreeNode
        v-bind="
          getTreeNodeProps(
            getKey(treeNode.key, treeNode.pos),
            treeNodeRequiredProps,
          )
        "
        :title="treeNode.title"
        :pos="treeNode.pos"
        :data="treeNode.data"
        :is-start="treeNode.isStart"
        :is-end="treeNode.isEnd"
        :active="
          !!activeItem && getKey(treeNode.key, treeNode.pos) === activeItem.key
        "
        :tree-id="treeId"
        @mousemove="() => emit('active-change', null)"
      />
    </template>
  </VcVirtualList>
</template>
