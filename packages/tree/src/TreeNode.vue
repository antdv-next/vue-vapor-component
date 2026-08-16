<script setup vapor lang="ts">
  import type { CSSProperties } from 'vue'

  import type { TreeNodeProps } from './interface'

  import { clsx } from '@v-c/util'
  import { getId } from '@v-c/util/dist/hooks/useId'
  import pickAttrs from '@v-c/util/dist/pickAttrs'
  import { filterEmpty } from '@v-c/util/dist/props-util'
  import { computed, ref, useAttrs, watchEffect } from 'vue'

  import DropIndicator from './DropIndicator.vue'
  import Indent from './Indent.vue'
  import {
    TreeContextKey,
    UnstableContextKey,
    useTreeContext,
    useUnstableContext,
  } from './TreeContextKey'
  import getEntity from './utils/keyUtil'
  import { convertNodePropsToEventData, isLeafNode } from './utils/treeUtil'

  defineOptions({ name: 'TreeNode', inheritAttrs: false })

  const props = defineProps<TreeNodeProps>()
  const attrs = useAttrs() as Record<string, any>

  const context = useTreeContext()
  const unstableContext = useUnstableContext()

  const ICON_OPEN = 'open'
  const ICON_CLOSE = 'close'
  const defaultTitle = '---'

  const nodeId = computed(() =>
    getId(props.treeId || '', `${props.eventKey || ''}`),
  )

  const dragNodeHighlight = ref(false)

  const ctx = computed(() => context.value)
  const unstableCtx = computed(() => unstableContext.value)

  const isDisabled = computed(() => {
    const c = ctx.value
    if (!c) return false
    return !!(
      c.disabled ||
      props.disabled ||
      unstableCtx.value?.nodeDisabled?.(props.data as any)
    )
  })

  const isCheckable = computed(() => {
    const c = ctx.value
    if (!c) return false
    // Vapor coerces undeclared boolean props to false (not undefined).
    // Since getTreeNodeProps never passes checkable/selectable per-node,
    // read directly from context to avoid the Vapor coercion trap.
    if (!c.checkable) return false
    return !!c.checkable
  })

  const isSelectable = computed(() => {
    const c = ctx.value
    // Read selectable from context — Vapor coerces undeclared boolean props to false,
    // which breaks the `typeof props.selectable === 'boolean'` check.
    return !!c?.selectable
  })

  const isUnselectable = computed(() => {
    const c = ctx.value
    return !c?.checkable && !isSelectable.value
  })

  const hasChildren = computed(() => {
    const c = ctx.value
    const { children } = c?.keyEntities
      ? getEntity(c.keyEntities, props.eventKey!) || {}
      : {}
    return Boolean((children || []).length)
  })

  const memoizedIsLeaf = computed(() => {
    return isLeafNode(
      props.isLeaf,
      ctx.value?.loadData,
      hasChildren.value,
      props.loaded,
    )
  })

  watchEffect(() => {
    if (props.loading) return
    const c = ctx.value
    if (
      typeof c?.loadData === 'function' &&
      props.expanded &&
      !memoizedIsLeaf.value &&
      !props.loaded
    ) {
      c.onNodeLoad(convertNodePropsToEventData(props))
    }
  })

  const nodeState = computed(() => {
    if (memoizedIsLeaf.value) return null
    return props.expanded ? ICON_OPEN : ICON_CLOSE
  })

  const level = computed(() => {
    const c = ctx.value
    return (
      (c?.keyEntities
        ? (getEntity(c.keyEntities, props.eventKey!) || {}).level
        : 0) || 0
    )
  })
  const isEndNode = computed(() => !!props.isEnd?.[props.isEnd.length - 1])

  const isDraggable = computed(() => {
    const c = ctx.value
    return !!(
      c?.draggable &&
      (!c.draggable.nodeDraggable ||
        c.draggable.nodeDraggable(props.data as any))
    )
  })
  const draggableWithoutDisabled = computed(
    () => !isDisabled.value && isDraggable.value,
  )

  function getEventData() {
    return convertNodePropsToEventData(props)
  }

  const onSelectorClick = (e: MouseEvent) => {
    const c = ctx.value
    if (!c) return
    c.onNodeClick(e, getEventData())
    if (isSelectable.value) {
      if (isDisabled.value) return
      c.onNodeSelect(e, getEventData())
    } else {
      if (isDisabled.value) return
      if (!isCheckable.value || props.disableCheckbox) return
      c.onNodeCheck(e, getEventData(), !props.checked)
    }
  }

  const onSelectorDoubleClick = (e: MouseEvent) => {
    const c = ctx.value
    if (!c) return
    c.onNodeDoubleClick(e, getEventData())
  }

  const onMouseEnter = (e: MouseEvent) => {
    const c = ctx.value
    if (!c) return
    c.onNodeMouseEnter(e, getEventData())
  }

  const onMouseLeave = (e: MouseEvent) => {
    const c = ctx.value
    if (!c) return
    c.onNodeMouseLeave(e, getEventData())
  }

  const onContextMenu = (e: MouseEvent) => {
    const c = ctx.value
    if (!c) return
    c.onNodeContextMenu(e, getEventData())
  }

  const onDragStart = (e: DragEvent) => {
    e.stopPropagation()
    dragNodeHighlight.value = true
    const c = ctx.value
    if (!c) return
    c.onNodeDragStart(e, props)
    try {
      e.dataTransfer?.setData('text/plain', '')
    } catch {}
  }

  const onDragEnter = (e: DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    const c = ctx.value
    if (!c) return
    c.onNodeDragEnter(e, props)
  }

  const onDragOver = (e: DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    const c = ctx.value
    if (!c) return
    c.onNodeDragOver(e, props)
  }

  const onDragLeave = (e: DragEvent) => {
    e.stopPropagation()
    const c = ctx.value
    if (!c) return
    c.onNodeDragLeave(e, props)
  }

  const onDragEnd = (e: DragEvent) => {
    e.stopPropagation()
    dragNodeHighlight.value = false
    const c = ctx.value
    if (!c) return
    c.onNodeDragEnd(e, props)
  }

  const onDrop = (e: DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    dragNodeHighlight.value = false
    const c = ctx.value
    if (!c) return
    c.onNodeDrop(e, props)
  }

  const onExpand = (e: MouseEvent) => {
    if (props.loading) return
    const c = ctx.value
    if (!c) return
    c.onNodeExpand(e, getEventData())
  }

  const onCheck = (e: MouseEvent) => {
    if (isDisabled.value) return
    if (!isCheckable.value || props.disableCheckbox) return
    const c = ctx.value
    if (!c) return
    c.onNodeCheck(e, getEventData(), !props.checked)
  }

  const renderSwitcherIconDom = (isInternalLeaf: boolean) => {
    // Vapor coerces undeclared boolean-like props to false (not undefined).
    // switcherIcon is optional and the CSS draws the arrow via background image,
    // so when no explicit icon is set (falsy), return '' so the empty switcher span renders.
    const switcherIcon = props.switcherIcon || ctx.value?.switcherIcon
    if (typeof switcherIcon === 'function')
      return (switcherIcon as any)({ ...props, isLeaf: isInternalLeaf })
    if (switcherIcon === false) return ''
    return switcherIcon
  }

  const switcherClass = computed(() => {
    const c = ctx.value
    if (!c) return ''
    if (memoizedIsLeaf.value) {
      return clsx(
        `${c.prefixCls}-switcher`,
        `${c.prefixCls}-switcher-noop`,
        c.classNames?.itemSwitcher,
      )
    }
    return clsx(
      `${c.prefixCls}-switcher`,
      `${c.prefixCls}-switcher_${props.expanded ? ICON_OPEN : ICON_CLOSE}`,
      c.classNames?.itemSwitcher,
    )
  })

  const switcherStyle = computed<CSSProperties>(
    () => ctx.value?.styles?.itemSwitcher || {},
  )
  const switcherIconDom = computed(() => {
    return renderSwitcherIconDom(memoizedIsLeaf.value)
  })

  const showSwitcher = computed(() => switcherIconDom.value !== false)

  const showDragHandler = computed(() => {
    return !!(ctx.value?.draggable?.icon && props.data)
  })
  const dragHandlerClass = computed(
    () => `${ctx.value?.prefixCls || 'vc-tree'}-draggable-icon`,
  )
  const dragHandlerIcon = computed(() => ctx.value?.draggable?.icon)

  const checkboxShow = computed(() => isCheckable.value)
  const checkboxClass = computed(() => {
    const c = ctx.value
    if (!c) return ''
    return clsx(`${c.prefixCls}-checkbox`, {
      [`${c.prefixCls}-checkbox-checked`]: props.checked,
      [`${c.prefixCls}-checkbox-indeterminate`]:
        !props.checked && props.halfChecked,
      [`${c.prefixCls}-checkbox-disabled`]:
        isDisabled.value || props.disableCheckbox,
    })
  })

  const customCheckbox = computed(() => {
    if (typeof isCheckable.value !== 'boolean') return isCheckable.value
    return null
  })

  const dataOrAriaAttrProps = computed(() =>
    pickAttrs(attrs, { aria: true, data: true }),
  )

  const treeCls = computed(() => {
    const c = ctx.value
    if (!c) return ''
    return clsx(
      props.className,
      `${c.prefixCls}-treenode`,
      c.classNames?.item,
      {
        [`${c.prefixCls}-treenode-disabled`]: isDisabled.value,
        [`${c.prefixCls}-treenode-unselectable`]: isUnselectable.value,
        [`${c.prefixCls}-treenode-switcher-${props.expanded ? 'open' : 'close'}`]:
          !memoizedIsLeaf.value,
        [`${c.prefixCls}-treenode-checkbox-checked`]: props.checked,
        [`${c.prefixCls}-treenode-checkbox-indeterminate`]: props.halfChecked,
        [`${c.prefixCls}-treenode-selected`]: props.selected,
        [`${c.prefixCls}-treenode-loading`]: props.loading,
        [`${c.prefixCls}-treenode-active`]: props.active,
        [`${c.prefixCls}-treenode-leaf-last`]: isEndNode.value,
        [`${c.prefixCls}-treenode-draggable`]: isDraggable.value,
        dragging: c.draggingNodeKey === props.eventKey,
        'drop-target': c.dropTargetKey === props.eventKey,
        'drop-container': c.dropContainerKey === props.eventKey,
        'drag-over': !isDisabled.value && props.dragOver,
        'drag-over-gap-top': !isDisabled.value && props.dragOverGapTop,
        'drag-over-gap-bottom': !isDisabled.value && props.dragOverGapBottom,
        'filter-node': !!c.filterTreeNode?.(getEventData()),
        [`${c.prefixCls}-treenode-leaf`]: memoizedIsLeaf.value,
      },
    )
  })

  const treeStyle = computed<CSSProperties>(() => {
    const c = ctx.value
    return { ...(props.style || {}), ...(c?.styles?.item || {}) }
  })

  const wrapClass = computed(
    () => `${ctx.value?.prefixCls || 'vc-tree'}-node-content-wrapper`,
  )
  const selectorClass = computed(() => {
    const c = ctx.value
    if (!c) return ''
    return clsx(
      wrapClass.value,
      `${wrapClass.value}-${nodeState.value || 'normal'}`,
      {
        [`${c.prefixCls}-node-selected`]:
          !isDisabled.value && (props.selected || dragNodeHighlight.value),
      },
    )
  })

  const showIcon = computed(() => !!ctx.value?.showIcon)
  const currentIcon = computed(() => props.icon || ctx.value?.icon)
  const showCustomIcon = computed(() => showIcon.value && !!currentIcon.value)
  const showDefaultIcon = computed(() => showIcon.value && !currentIcon.value)
  const showLoadingIcon = computed(
    () => !showIcon.value && !!ctx.value?.loadData && !!props.loading,
  )

  const iconEleClass = computed(() => {
    const c = ctx.value
    if (!c) return ''
    return clsx(
      c.classNames?.itemIcon,
      `${c.prefixCls}-iconEle`,
      `${c.prefixCls}-icon__${nodeState.value || 'docu'}`,
      { [`${c.prefixCls}-icon_loading`]: props.loading },
    )
  })
  const iconEleStyle = computed<CSSProperties>(
    () => ctx.value?.styles?.itemIcon || {},
  )
  const customIconClass = computed(() => {
    const c = ctx.value
    if (!c) return ''
    return clsx(
      c.classNames?.itemIcon,
      `${c.prefixCls}-iconEle`,
      `${c.prefixCls}-icon__customize`,
    )
  })

  const titleNodeData = computed(() => {
    const title = props.title ?? defaultTitle
    const c = ctx.value

    if (typeof title === 'function') {
      return (title as any)(props.data)
    }

    if (c?.titleRender) {
      let rendered = c.titleRender(props.data as any)
      rendered = Array.isArray(rendered) ? rendered : [rendered]
      rendered = filterEmpty(rendered).filter(Boolean)
      return rendered.length ? rendered : title
    }

    return title
  })

  const titleAttr = computed(() => {
    const title = props.title ?? defaultTitle
    if (typeof title === 'string') return title
    if (typeof title === 'function') return ''
    return ''
  })

  const titleClass = computed(() => {
    const c = ctx.value
    return clsx(`${c.prefixCls}-title`, c?.classNames?.itemTitle)
  })
  const titleStyle = computed<CSSProperties>(
    () => ctx.value?.styles?.itemTitle || {},
  )

  const dropIndicatorData = computed(() => {
    const c = ctx.value
    if (!c) return null
    const rootDraggable = Boolean(c.draggable)
    if (
      !(
        !props.disabled &&
        rootDraggable &&
        c.dragOverNodeKey === props.eventKey
      )
    )
      return null
    if (
      c.dropPosition === null ||
      c.dropLevelOffset === null ||
      c.indent === null
    )
      return null

    return c.dropIndicatorRender({
      dropPosition: c.dropPosition,
      dropLevelOffset: c.dropLevelOffset,
      indent: c.indent,
      prefixCls: c.prefixCls,
      direction: c.direction,
    })
  })

  const showDropIndicator = computed(() => {
    const c = ctx.value
    if (!c) return false
    const rootDraggable = Boolean(c.draggable)
    if (
      !(
        !props.disabled &&
        rootDraggable &&
        c.dragOverNodeKey === props.eventKey
      )
    )
      return false
    if (
      c.dropPosition === null ||
      c.dropLevelOffset === null ||
      c.indent === null
    )
      return false
    return true
  })

  const ariaExpanded = computed(() => {
    if (memoizedIsLeaf.value) return undefined
    return props.expanded
  })
  const ariaSelected = computed(() => {
    if (isSelectable.value && !isDisabled.value) return props.selected
    return undefined
  })
  const ariaChecked = computed(() => {
    if (isCheckable.value && !isDisabled.value)
      return props.halfChecked ? 'mixed' : props.checked
    return undefined
  })
</script>

<template>
  <div
    role="treeitem"
    :id="nodeId"
    :aria-expanded="ariaExpanded"
    :aria-selected="ariaSelected"
    :aria-checked="ariaChecked"
    :aria-disabled="isDisabled"
    :class="treeCls"
    :style="treeStyle"
    v-bind="dataOrAriaAttrProps"
  >
    <Indent
      :prefix-cls="ctx?.prefixCls || 'vc-tree'"
      :level="level"
      :is-start="isStart || []"
      :is-end="isEnd || []"
    />

    <template v-if="showDragHandler">
      <span :class="dragHandlerClass">
        <slot name="draggable-icon">
          <span class="draggable-icon-inner">{{ dragHandlerIcon }}</span>
        </slot>
      </span>
    </template>

    <template v-if="showSwitcher">
      <span v-if="memoizedIsLeaf" :class="switcherClass" :style="switcherStyle">
        {{ switcherIconDom }}
      </span>
      <span
        v-else
        :class="switcherClass"
        :style="switcherStyle"
        @click="onExpand"
      >
        {{ switcherIconDom }}
      </span>
    </template>

    <template v-if="checkboxShow">
      <span
        :class="checkboxClass"
        @click="onCheck"
        role="checkbox"
        :aria-checked="halfChecked ? 'mixed' : checked"
        :aria-disabled="isDisabled || disableCheckbox"
        :aria-labelledby="nodeId"
      >
        {{ customCheckbox }}
      </span>
    </template>

    <span
      :title="titleAttr"
      :class="selectorClass"
      @mouseenter="onMouseEnter"
      @mouseleave="onMouseLeave"
      @contextmenu="onContextMenu"
      @click="onSelectorClick"
      @dblclick="onSelectorDoubleClick"
    >
      <template v-if="showCustomIcon">
        <span :class="customIconClass" :style="iconEleStyle">
          {{
            typeof currentIcon === 'function'
              ? currentIcon?.(props)
              : currentIcon
          }}
        </span>
      </template>
      <template v-if="showDefaultIcon || showLoadingIcon">
        <span :class="iconEleClass" :style="iconEleStyle" />
      </template>

      <span :class="titleClass" :style="titleStyle">
        {{ titleNodeData }}
      </span>

      <template v-if="showDropIndicator">
        <DropIndicator
          :drop-position="ctx?.dropPosition || 0"
          :drop-level-offset="ctx?.dropLevelOffset || 0"
          :indent="ctx?.indent || 0"
        />
      </template>
    </span>
  </div>
</template>
