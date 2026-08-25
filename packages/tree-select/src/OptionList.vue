<script setup vapor lang="ts">
  import type { RefOptionListProps } from '@vapor-component/select'
  import type { DataEntity, Key } from '@vapor-component/tree'

  import type { DataNode } from './interface'

  import KeyCode from '@v-c/util/dist/KeyCode'
  import { useBaseProps } from '@vapor-component/select'
  import Tree, { UnstableContextKey } from '@vapor-component/tree'
  import { computed, provide, ref, shallowRef, watch } from 'vue'

  import { useLegacyContext } from './LegacyContextKey'
  import { useTreeSelectContext } from './TreeSelectContextKey'
  import { getAllKeys, isCheckDisabled } from './utils/valueUtil'

  defineOptions({ name: 'VcTreeSelectOptionList', inheritAttrs: false })

  const baseProps = useBaseProps()
  const context = useTreeSelectContext()
  const legacyContext = useLegacyContext()

  const treeRef = ref<any>(null)

  const memoTreeData = computed(() => context.value?.treeData || [])

  const mergedCheckedKeys = computed(() => {
    if (!legacyContext.value?.checkable) return null
    return {
      checked: legacyContext.value.checkedKeys,
      halfChecked: legacyContext.value.halfCheckedKeys,
    }
  })

  // Scroll to first checked key on open (single mode)
  watch(
    () => baseProps.value?.triggerOpen,
    open => {
      if (
        open &&
        !baseProps.value?.multiple &&
        legacyContext.value?.checkedKeys?.length
      ) {
        treeRef.value?.scrollTo?.({ key: legacyContext.value.checkedKeys[0] })
      }
    },
    { immediate: true },
  )

  const onListMouseDown = (event: MouseEvent) => {
    event.preventDefault()
  }

  const onInternalSelect = (_keys: Key[], info: any) => {
    const node = info?.node
    if (legacyContext.value?.checkable && isCheckDisabled(node as DataNode)) {
      return
    }
    const checkedKeys = legacyContext.value?.checkedKeys || []
    context.value?.onSelect(node.key, {
      selected: !checkedKeys.includes(node.key),
      source: 'option',
    })
    if (!baseProps.value?.multiple) {
      baseProps.value?.toggleOpen?.(false)
    }
  }

  // ==================== Expanded keys ====================
  const expandedKeys = ref<Key[]>(
    legacyContext.value?.treeDefaultExpandedKeys || [],
  )
  const searchExpandedKeys = ref<Key[] | null>(null)

  const mergedExpandedKeys = computed<Key[] | undefined>(() => {
    if (legacyContext.value?.treeExpandedKeys) {
      return [...legacyContext.value.treeExpandedKeys]
    }
    if (baseProps.value?.searchValue) {
      return searchExpandedKeys.value || expandedKeys.value || []
    }
    return expandedKeys.value
  })

  const onInternalExpand = (keys: Key[]) => {
    expandedKeys.value = keys
    searchExpandedKeys.value = keys
    legacyContext.value?.onTreeExpand?.(keys)
  }

  // Expand all when searching
  watch(
    () => baseProps.value?.searchValue,
    val => {
      if (val) {
        searchExpandedKeys.value = getAllKeys(
          memoTreeData.value,
          context.value?.fieldNames || {},
        )
      }
    },
    { immediate: true },
  )

  // ==================== MaxCount disabled cache ====================
  const disabledCache = shallowRef<Map<Key, boolean>>(new Map())
  watch(
    () => context.value?.leftMaxCount,
    val => {
      if (val !== undefined && val !== null) {
        disabledCache.value = new Map()
      }
    },
    { immediate: true },
  )

  function getDisabledWithCache(node: DataNode): boolean {
    const valueField = context.value?.fieldNames.value || 'value'
    const value = (node as any)[valueField] as Key
    if (!disabledCache.value.has(value)) {
      const entity = context.value?.valueEntities.get(value)
      const isLeaf = ((entity?.children || []) as DataEntity[]).length === 0
      if (!isLeaf) {
        const checkedKeys = legacyContext.value?.checkedKeys || []
        const checkableChildren = (entity?.children || []).filter(
          child =>
            !child.node.disabled &&
            !(child.node as any).disableCheckbox &&
            !checkedKeys.includes((child.node as any)[valueField]),
        )
        disabledCache.value.set(
          value,
          checkableChildren.length > (context.value?.leftMaxCount || 0),
        )
      } else {
        disabledCache.value.set(value, false)
      }
    }
    return disabledCache.value.get(value) || false
  }

  const nodeDisabled = (node: DataNode): boolean => {
    const valueField = context.value?.fieldNames.value || 'value'
    const checkedKeys = legacyContext.value?.checkedKeys || []
    const nodeValue = (node as any)[valueField] as Key
    if (checkedKeys.includes(nodeValue)) return false
    const leftMaxCount = context.value?.leftMaxCount ?? null
    if (leftMaxCount === null) return false
    if (leftMaxCount <= 0) return true
    if (context.value?.leafCountOnly && leftMaxCount) {
      return getDisabledWithCache(node)
    }
    return false
  }

  provide(
    UnstableContextKey,
    computed(() => ({ nodeDisabled })),
  )

  // ==================== Active key ====================
  const activeKey = ref<Key | null>(null)

  const getFirstMatchingNode = (nodes: DataNode[]): DataNode | null => {
    for (const node of nodes) {
      if (node.disabled || node.selectable === false) continue
      return node
    }
    return null
  }

  watch(
    [() => baseProps.value?.triggerOpen],
    ([open]) => {
      if (!open) return
      const fieldNames = context.value?.fieldNames
      const valueField = fieldNames?.value || 'value'
      const getFirstNode = () => {
        const firstNode = getFirstMatchingNode(memoTreeData.value)
        return firstNode ? (firstNode as any)[valueField] : null
      }
      let nextActiveKey: Key | null = null
      if (
        !baseProps.value?.multiple &&
        legacyContext.value?.checkedKeys?.length
      ) {
        nextActiveKey = legacyContext.value.checkedKeys[0]
      } else {
        nextActiveKey = getFirstNode()
      }
      activeKey.value = nextActiveKey
    },
    { immediate: true },
  )

  const onActiveChange = (key: Key | null) => {
    activeKey.value = key
  }

  // ==================== Keyboard ====================
  const onKeyDown = (event: KeyboardEvent) => {
    const which = (event as any).which || (event as any).keyCode
    switch (which) {
      case KeyCode.UP:
      case KeyCode.DOWN:
      case KeyCode.LEFT:
      case KeyCode.RIGHT:
        treeRef.value?.onKeyDown?.(event)
        break
      case KeyCode.ENTER: {
        const entity = legacyContext.value?.keyEntities?.[
          String(activeKey.value)
        ] as DataEntity | undefined
        if (entity) {
          const isNodeDisabledVal = nodeDisabled(entity.node as DataNode)
          const { selectable, disabled } = entity.node as any
          const valueField = context.value?.fieldNames.value || 'value'
          const value = (entity.node as any)[valueField]
          if (selectable !== false && !disabled && !isNodeDisabledVal) {
            onInternalSelect(
              [] as Key[],
              {
                node: { key: activeKey.value!, value },
                selected: !(legacyContext.value?.checkedKeys || []).includes(
                  value,
                ),
              } as any,
            )
          }
        }
        return
      }
      case KeyCode.ESC:
        baseProps.value?.toggleOpen?.(false)
    }
  }

  const onKeyUp = () => {}

  const handleScroll = (e: Event) => {
    context.value?.onPopupScroll?.(e)
  }

  const handleLoad = (keys: Key[]) => {
    legacyContext.value?.onTreeLoad?.(keys)
  }

  defineExpose<RefOptionListProps>({
    scrollTo: scroll => {
      treeRef.value?.scrollTo?.(scroll)
    },
    onKeyDown,
    onKeyUp,
  })
</script>

<template>
  <template v-if="memoTreeData.length === 0">
    <div
      role="listbox"
      :class="`${baseProps?.prefixCls}-empty`"
      @mousedown="onListMouseDown"
    >
      {{ baseProps?.notFoundContent }}
    </div>
  </template>
  <template v-else>
    <div @mousedown="onListMouseDown">
      <Tree
        ref="treeRef"
        :prefix-cls="'vc-tree'"
        :focusable="false"
        :tree-data="memoTreeData"
        :field-names="context?.fieldNames"
        :height="context?.listHeight"
        :item-height="context?.listItemHeight"
        :item-scroll-offset="context?.listItemScrollOffset"
        :virtual="
          context?.virtual !== false && context?.popupMatchSelectWidth !== false
        "
        :multiple="baseProps?.multiple"
        :icon="legacyContext?.treeIcon"
        :show-icon="legacyContext?.showTreeIcon"
        :switcher-icon="legacyContext?.switcherIcon"
        :show-line="legacyContext?.treeLine"
        :load-data="
          baseProps?.searchValue ? undefined : legacyContext?.loadData
        "
        :active-key="activeKey"
        :checkable="legacyContext?.checkable"
        :check-strictly="true"
        :checked-keys="mergedCheckedKeys"
        :selected-keys="
          !legacyContext?.checkable ? legacyContext?.checkedKeys : []
        "
        :default-expand-all="legacyContext?.treeDefaultExpandAll"
        :title-render="legacyContext?.treeTitleRender"
        :expanded-keys="mergedExpandedKeys"
        :loaded-keys="legacyContext?.treeLoadedKeys"
        :expand-action="legacyContext?.treeExpandAction"
        :class-names="context?.classNames?.popup"
        :styles="context?.styles?.popup"
        @active-change="onActiveChange"
        @select="onInternalSelect"
        @check="onInternalSelect"
        @expand="onInternalExpand"
        @load="handleLoad"
        @scroll="handleScroll"
      />
    </div>
  </template>
</template>
