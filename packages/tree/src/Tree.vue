<script setup vapor lang="ts">
  import type { TreeProps, TreeRef, Key, DataNode } from './interface'
  import type { AllowDrop } from './util'

  import { clsx } from '@v-c/util'
  import useMergedState from '@v-c/util/dist/hooks/useMergedState'
  import KeyCode from '@v-c/util/dist/KeyCode'
  import pickAttrs from '@v-c/util/dist/pickAttrs'
  import warning from '@v-c/util/dist/warning'
  import {
    computed,
    nextTick,
    onBeforeUnmount,
    onMounted,
    reactive,
    ref,
    shallowRef,
    useAttrs,
    useSlots,
    watchEffect,
  } from 'vue'

  import { DraggableConfig } from './interface'
  import NodeList from './NodeList.vue'
  import { provideTreeContext } from './TreeContextKey'
  import {
    arrAdd,
    arrDel,
    calcDropPosition,
    calcSelectedKeys,
    conductExpandParent,
    getDragChildrenKeys,
    parseCheckedKeys,
    posToArr,
  } from './util'
  import { conductCheck } from './utils/conductUtil'
  import getEntity from './utils/keyUtil'
  import {
    convertDataToEntities,
    convertNodePropsToEventData,
    convertTreeToData,
    fillFieldNames,
    flattenTreeData,
    getTreeNodeProps,
    isLeafNode,
  } from './utils/treeUtil'

  defineOptions({ name: 'Tree', inheritAttrs: false })

  const props = withDefaults(defineProps<TreeProps>(), {
    prefixCls: 'vc-tree',
    showLine: false,
    showIcon: true,
    selectable: true,
    multiple: false,
    checkable: false,
    disabled: false,
    checkStrictly: false,
    draggable: false,
    defaultExpandParent: true,
    autoExpandParent: false,
    defaultExpandAll: false,
    defaultExpandedKeys: () => [],
    defaultCheckedKeys: () => [],
    defaultSelectedKeys: () => [],
    allowDrop: () => true,
    expandAction: false,
    focusable: true,
    tabIndex: 0,
    virtual: true,
  })

  const slots = useSlots()
  const attrs = useAttrs()

  const emit = defineEmits<{
    keydown: [e: KeyboardEvent]
    focus: [e: FocusEvent]
    blur: [e: FocusEvent]
    mousedown: [e: MouseEvent]
    contextmenu: [e: MouseEvent]
    scroll: [e: Event]
    click: [e: MouseEvent, node: any]
    'double-click': [e: MouseEvent, node: any]
    'active-change': [key: Key | null]
    expand: [
      keys: Key[],
      info: { node: any; expanded: boolean; nativeEvent: MouseEvent },
    ]
    check: [checked: any, info: any]
    select: [keys: Key[], info: any]
    load: [keys: Key[], info: { event: string; node: any }]
    'mouse-enter': [info: { event: MouseEvent; node: any }]
    'mouse-leave': [info: { event: MouseEvent; node: any }]
    'right-click': [info: { event: MouseEvent; node: any }]
    'drag-start': [info: { event: DragEvent; node: any }]
    'drag-enter': [info: { event: DragEvent; node: any; expandedKeys: Key[] }]
    'drag-over': [info: { event: DragEvent; node: any }]
    'drag-leave': [info: { event: DragEvent; node: any }]
    'drag-end': [info: { event: DragEvent; node: any }]
    drop: [info: any]
  }>()

  const attrsAriaData = computed(() =>
    pickAttrs(attrs, { aria: true, data: true }),
  )

  const mergedFieldNames = computed(() => fillFieldNames(props.fieldNames))

  const slotTreeData = shallowRef<DataNode[]>([])
  const slotTreeDataSignature = ref('')

  const mergedTreeData = computed<DataNode[]>(() => {
    return (props.treeData || slotTreeData.value) as DataNode[]
  })

  const getTreeDataSignature = (data: DataNode[]) => {
    const dig = (list: DataNode[]): string => {
      return (list || [])
        .map(node => {
          const key = String(node?.key)
          const children = node?.children
          return `${key}{${children?.length ? dig(children) : ''}}`
        })
        .join('|')
    }
    return dig(data)
  }

  watchEffect(() => {
    if (!props.treeData) {
      const vnodes = slots.default?.() || []
      const parsed = convertTreeToData(vnodes)
      const signature = getTreeDataSignature(parsed)
      if (signature !== slotTreeDataSignature.value) {
        slotTreeDataSignature.value = signature
        slotTreeData.value = parsed
      }
    }
  })

  const path = computed(() => {
    return convertDataToEntities(mergedTreeData.value as any, {
      fieldNames: mergedFieldNames.value,
    })
  })
  const keyEntities = computed(() => path.value.keyEntities)

  const getInitExpandedKeys = (): Key[] => {
    let keys: Key[] = []
    if (props.defaultExpandAll) {
      keys = Object.values(keyEntities.value).map((entity: any) => entity.key)
    } else {
      keys = props.expandedKeys || props.defaultExpandedKeys || []
    }
    if (props.defaultExpandParent) {
      keys = conductExpandParent(keys, keyEntities.value)
    }
    return keys
  }

  const expandedKeys = shallowRef<Key[]>(getInitExpandedKeys())

  const setExpandedKeys = (keys: Key[]) => {
    expandedKeys.value = keys
  }

  watchEffect(() => {
    const ek = props.expandedKeys
    if (ek === undefined) return
    if (props.autoExpandParent) {
      expandedKeys.value = conductExpandParent(ek || [], keyEntities.value)
    } else {
      expandedKeys.value = ek || []
    }
  })

  const flattenNodes = computed(() =>
    flattenTreeData(
      mergedTreeData.value as any,
      expandedKeys.value,
      mergedFieldNames.value,
    ),
  )

  const selectedKeys = shallowRef<Key[]>(
    calcSelectedKeys(props.selectedKeys || props.defaultSelectedKeys || [], {
      multiple: props.multiple,
    }) || [],
  )

  watchEffect(() => {
    const sk = props.selectedKeys
    if (sk === undefined) return
    selectedKeys.value =
      calcSelectedKeys(sk, { multiple: props.multiple }) || []
  })

  const setSelectedKeys = (keys: Key[]) => {
    selectedKeys.value = keys
  }

  const getDefaultCheckedKeyEntity = () => {
    const parsed = parseCheckedKeys(props.checkedKeys as any)
    if (parsed) {
      return {
        checkedKeys: parsed.checkedKeys || [],
        halfCheckedKeys: parsed.halfCheckedKeys || [],
      }
    }
    return {
      checkedKeys: props.defaultCheckedKeys || [],
      halfCheckedKeys: [],
    }
  }
  const defaultCheckedKeyEntity = getDefaultCheckedKeyEntity()
  const rawCheckedKeys = shallowRef<Key[]>(defaultCheckedKeyEntity.checkedKeys)
  const rawHalfCheckedKeys = shallowRef<Key[]>(
    defaultCheckedKeyEntity.halfCheckedKeys,
  )

  watchEffect(() => {
    const ck = props.checkedKeys
    if (ck === undefined) return
    const parsed = parseCheckedKeys(ck)
    rawCheckedKeys.value = parsed?.checkedKeys || []
    rawHalfCheckedKeys.value = parsed?.halfCheckedKeys || []
  })

  const mergedChecked = computed(() => {
    if (!props.checkable) {
      return { checkedKeys: [] as Key[], halfCheckedKeys: [] as Key[] }
    }

    let checkedKeysValue = rawCheckedKeys.value || []
    let halfCheckedKeysValue = rawHalfCheckedKeys.value || []

    if (!props.checkStrictly) {
      const hasTreeEntity = Object.keys(keyEntities.value || {}).length > 0
      if (hasTreeEntity) {
        const conductKeys = conductCheck(
          checkedKeysValue,
          true,
          keyEntities.value,
        )
        checkedKeysValue = conductKeys.checkedKeys
        halfCheckedKeysValue = conductKeys.halfCheckedKeys
      }
    }

    return {
      checkedKeys: checkedKeysValue,
      halfCheckedKeys: halfCheckedKeysValue,
    }
  })

  const [loadedKeys, setLoadedKeys] = useMergedState<Key[]>([] as Key[], {
    value: computed(() => props.loadedKeys ?? undefined),
  })
  const loadingKeys = ref<Key[]>([])

  const listChanging = ref(false)
  const [activeKey, setActiveKey] = useMergedState<Key | null>(null, {
    value: computed(() => props.activeKey ?? undefined),
  })

  const draggingNodeKey = ref<Key | null>(null)
  const dragChildrenKeys = ref<Key[]>([])
  const indent = ref<number | null>(null)
  const dropTargetKey = ref<Key | null>(null)
  const dropPosition = ref<-1 | 0 | 1 | null>(null)
  const dropContainerKey = ref<Key | null>(null)
  const dropLevelOffset = ref<number | null>(null)
  const dropTargetPos = ref<string | null>(null)
  const dropAllowed = ref(true)
  const dragOverNodeKey = ref<Key | null>(null)

  let dragNodeProps: any = null
  let dragStartMousePosition: { x: number; y: number } | null = null
  let currentMouseOverDroppableNodeKey: Key | null = null

  const delayedDragEnterLogic: Record<string, number> = {}
  const loadingRetryTimes: Record<string, number> = {}
  const MAX_RETRY_TIMES = 10

  const listRef = ref<any>()
  let focusedByMouse = false

  const getTreeNodeRequiredPropsVal = computed(() => ({
    expandedKeys: expandedKeys.value || [],
    selectedKeys: selectedKeys.value || [],
    loadedKeys: loadedKeys.value || [],
    loadingKeys: loadingKeys.value || [],
    checkedKeys: mergedChecked.value.checkedKeys || [],
    halfCheckedKeys: mergedChecked.value.halfCheckedKeys || [],
    dragOverNodeKey: dragOverNodeKey.value,
    dropPosition: dropPosition.value,
    keyEntities: keyEntities.value,
  }))

  const getActiveItem = computed(() => {
    if (activeKey.value === null) return null
    return flattenNodes.value.find(({ key }) => key === activeKey.value) || null
  })

  const scrollTo: TreeRef['scrollTo'] = scroll => {
    if (
      scroll &&
      typeof scroll === 'object' &&
      'autoExpand' in scroll &&
      (scroll as any).autoExpand &&
      props.expandedKeys === undefined
    ) {
      setExpandedKeys(arrAdd(expandedKeys.value, (scroll as any).key))
    }
    listRef.value?.scrollTo?.(scroll)
  }

  const draggableConfig = computed<DraggableConfig | undefined>(() => {
    const draggable = props.draggable
    if (!draggable) return undefined
    if (typeof draggable === 'object') return draggable as DraggableConfig
    if (typeof draggable === 'function')
      return { nodeDraggable: draggable as any }
    return {}
  })

  const onKeyDown: TreeRef['onKeyDown'] = (e: KeyboardEvent) => {
    if (props.disabled) return

    const nodes = flattenNodes.value
    const which = (e as any).which || (e as any).keyCode
    switch (which) {
      case KeyCode.UP:
        offsetActiveKey(-1)
        e.preventDefault()
        break
      case KeyCode.DOWN:
        offsetActiveKey(1)
        e.preventDefault()
        break
      case KeyCode.HOME:
        onActiveChange(nodes[0]?.key ?? null)
        e.preventDefault()
        break
      case KeyCode.END:
        onActiveChange(nodes[nodes.length - 1]?.key ?? null)
        e.preventDefault()
        break
    }

    const activeItem = getActiveItem.value
    if (activeItem && activeItem.data) {
      const eventNode = convertNodePropsToEventData({
        ...getTreeNodeProps(
          activeKey.value!,
          getTreeNodeRequiredPropsVal.value,
        ),
        data: activeItem.data,
        active: true,
      } as any)

      const entity = getEntity(keyEntities.value, activeKey.value!)
      const hasChildren = !!entity?.children?.length
      const expandable = !isLeafNode(
        activeItem.data?.isLeaf,
        props.loadData,
        hasChildren,
        eventNode.loaded,
      )

      const canCheck =
        !!props.checkable &&
        !eventNode.disabled &&
        eventNode.checkable !== false &&
        !eventNode.disableCheckbox
      const canSelect =
        !props.checkable &&
        props.selectable &&
        !eventNode.disabled &&
        eventNode.selectable !== false

      switch (which) {
        case KeyCode.LEFT:
          if (expandable && expandedKeys.value.includes(activeKey.value!)) {
            onNodeExpand({} as any, eventNode)
          } else if (activeItem.parent) {
            onActiveChange(activeItem.parent.key)
          }
          e.preventDefault()
          break
        case KeyCode.RIGHT:
          if (expandable && !expandedKeys.value.includes(activeKey.value!)) {
            onNodeExpand({} as any, eventNode)
          } else if (activeItem.children && activeItem.children.length) {
            onActiveChange(activeItem.children[0].key)
          }
          e.preventDefault()
          break
        case KeyCode.ENTER:
        case KeyCode.SPACE:
          if (canCheck) {
            onNodeCheck(
              {} as any,
              eventNode,
              !mergedChecked.value.checkedKeys.includes(activeKey.value!),
            )
          } else if (canSelect) {
            onNodeSelect({} as any, eventNode)
          }
          break
      }
    }

    emit('keydown', e)
  }

  let onNodeLoad: (treeNode: any) => void = () => {}
  let onNodeExpand: (e: MouseEvent, treeNode: any) => void = () => {}
  let onNodeClick: (e: MouseEvent, treeNode: any) => void = () => {}
  let onNodeDoubleClick: (e: MouseEvent, treeNode: any) => void = () => {}
  let onNodeSelect: (e: MouseEvent, treeNode: any) => void = () => {}
  let onNodeCheck: (
    e: MouseEvent,
    treeNode: any,
    checked: boolean,
  ) => void = () => {}
  let onNodeMouseEnter: (e: MouseEvent, node: any) => void = () => {}
  let onNodeMouseLeave: (e: MouseEvent, node: any) => void = () => {}
  let onNodeContextMenu: (e: MouseEvent, node: any) => void = () => {}
  let onNodeDragStart: (event: DragEvent, nodeProps: any) => void = () => {}
  let onNodeDragEnter: (event: DragEvent, nodeProps: any) => void = () => {}
  let onNodeDragOver: (event: DragEvent, nodeProps: any) => void = () => {}
  let onNodeDragLeave: (event: DragEvent, nodeProps: any) => void = () => {}
  let onNodeDragEnd: (
    event: DragEvent,
    nodeProps: any | null,
    outsideTree?: boolean,
  ) => void = () => {}
  let onNodeDrop: (
    event: DragEvent,
    nodeProps: any | null,
    outsideTree?: boolean,
  ) => void = () => {}

  const treeCtx = reactive<any>({
    // reactive() captures `let` values and prop values at creation time.
    // In Vapor, watchEffect re-assignment of reactive properties does not reliably
    // trigger re-computation of `computed(() => treeCtx)`.
    // Using getters for EVERY property ensures downstream components always read the
    // current value — same pattern that fixed the handler functions.
    get prefixCls() {
      return props.prefixCls
    },
    get selectable() {
      return props.selectable
    },
    get showIcon() {
      return props.showIcon
    },
    get icon() {
      return props.icon
    },
    get switcherIcon() {
      return props.switcherIcon
    },
    get draggable() {
      return draggableConfig.value
    },
    get draggingNodeKey() {
      return draggingNodeKey.value
    },
    get checkable() {
      return props.checkable
    },
    get checkStrictly() {
      return props.checkStrictly
    },
    get disabled() {
      return props.disabled
    },
    get keyEntities() {
      return keyEntities.value
    },
    get dropLevelOffset() {
      return dropLevelOffset.value
    },
    get dropContainerKey() {
      return dropContainerKey.value
    },
    get dropTargetKey() {
      return dropTargetKey.value
    },
    get dropPosition() {
      return dropPosition.value
    },
    get indent() {
      return indent.value
    },
    dropIndicatorRender: (diProps: any) => {
      if (props.dropIndicatorRender) return props.dropIndicatorRender(diProps)
      return null
    },
    get dragOverNodeKey() {
      return dragOverNodeKey.value
    },
    get direction() {
      return props.direction
    },
    get loadData() {
      return props.loadData
    },
    get filterTreeNode() {
      return props.filterTreeNode
    },
    get titleRender() {
      return props.titleRender
    },
    get allowDrop() {
      return props.allowDrop!
    },
    get styles() {
      return props.styles
    },
    get classNames() {
      return props.classNames
    },
    // Use getters so treeCtx always returns the current handler implementations
    // (handlers are assigned to `let` variables later in setup — getters ensure
    //  downstream components read the real functions, not the initial empty ones)
    get onNodeLoad() {
      return onNodeLoad
    },
    get onNodeExpand() {
      return onNodeExpand
    },
    get onNodeClick() {
      return onNodeClick
    },
    get onNodeDoubleClick() {
      return onNodeDoubleClick
    },
    get onNodeSelect() {
      return onNodeSelect
    },
    get onNodeCheck() {
      return onNodeCheck
    },
    get onNodeMouseEnter() {
      return onNodeMouseEnter
    },
    get onNodeMouseLeave() {
      return onNodeMouseLeave
    },
    get onNodeContextMenu() {
      return onNodeContextMenu
    },
    get onNodeDragStart() {
      return onNodeDragStart
    },
    get onNodeDragEnter() {
      return onNodeDragEnter
    },
    get onNodeDragOver() {
      return onNodeDragOver
    },
    get onNodeDragLeave() {
      return onNodeDragLeave
    },
    get onNodeDragEnd() {
      return onNodeDragEnd
    },
    get onNodeDrop() {
      return onNodeDrop
    },
  })

  provideTreeContext(computed(() => treeCtx))

  onNodeLoad = (treeNode: any) => {
    const key = treeNode.key

    if (getEntity(keyEntities.value, key)?.children?.length) return

    const loadData = props.loadData
    if (
      !loadData ||
      loadedKeys.value.includes(key) ||
      loadingKeys.value.includes(key)
    )
      return

    loadingKeys.value = arrAdd(loadingKeys.value, key)

    const promise = loadData(treeNode)
    const wrapped = Promise.resolve(promise)
      .then(() => {
        const newLoadedKeys = arrAdd(loadedKeys.value, key)
        emit('load', newLoadedKeys, {
          event: 'load',
          node: treeNode,
        })
        setLoadedKeys(newLoadedKeys)
        loadingKeys.value = arrDel(loadingKeys.value, key)
      })
      .catch(err => {
        loadingKeys.value = arrDel(loadingKeys.value, key)
        loadingRetryTimes[String(key)] =
          (loadingRetryTimes[String(key)] || 0) + 1
        if (loadingRetryTimes[String(key)] >= MAX_RETRY_TIMES) {
          warning(
            false,
            'Retry for `loadData` many times but still failed. No more retry.',
          )
          setLoadedKeys(arrAdd(loadedKeys.value, key))
          return
        }
        throw err
      })

    wrapped.catch(() => {})
    return wrapped
  }

  onNodeExpand = (e: MouseEvent, treeNode: any) => {
    const expanded = treeNode.expanded
    const key = (treeNode as any)[mergedFieldNames.value.key]

    if (listChanging.value) return

    const targetExpanded = !expanded
    const certain = expandedKeys.value.includes(key)

    warning(
      (expanded && certain) || (!expanded && !certain),
      'Expand state not sync with index check',
    )

    const nextExpandedKeys = targetExpanded
      ? arrAdd(expandedKeys.value, key)
      : arrDel(expandedKeys.value, key)
    setExpandedKeys(nextExpandedKeys)

    emit('expand', nextExpandedKeys, {
      node: treeNode,
      expanded: targetExpanded,
      nativeEvent: e,
    })

    if (targetExpanded && props.loadData) {
      const loadPromise = onNodeLoad(treeNode)
      if (loadPromise) {
        loadPromise.catch(() => {
          setExpandedKeys(arrDel(expandedKeys.value, key))
        })
      }
    }
  }

  const triggerExpandActionExpand = (e: MouseEvent, treeNode: any) => {
    const key = treeNode.key
    if ((treeNode as any).isLeaf || e.shiftKey || e.metaKey || e.ctrlKey) return
    const node = flattenNodes.value.find(nodeItem => nodeItem.key === key)
    if (!node) return

    const eventNode = convertNodePropsToEventData({
      ...getTreeNodeProps(key, getTreeNodeRequiredPropsVal.value),
      data: node.data,
    } as any)

    onNodeExpand(e, eventNode)
  }

  onNodeClick = (e: MouseEvent, treeNode: any) => {
    if (props.expandAction === 'click') {
      triggerExpandActionExpand(e, treeNode)
    }
    emit('click', e, treeNode)
  }

  onNodeDoubleClick = (e: MouseEvent, treeNode: any) => {
    if (props.expandAction === 'doubleClick') {
      triggerExpandActionExpand(e, treeNode)
    }
    emit('double-click', e, treeNode)
  }

  onNodeSelect = (e: MouseEvent, treeNode: any) => {
    const selected = treeNode.selected
    const key = (treeNode as any)[mergedFieldNames.value.key]
    const targetSelected = !selected

    let nextSelectedKeys = selectedKeys.value
    if (!targetSelected) {
      nextSelectedKeys = arrDel(nextSelectedKeys, key)
    } else if (!props.multiple) {
      nextSelectedKeys = [key]
    } else {
      nextSelectedKeys = arrAdd(nextSelectedKeys, key)
    }

    const selectedNodes = nextSelectedKeys
      .map(selectedKey => {
        const entity = getEntity(keyEntities.value, selectedKey)
        return entity ? entity.node : null
      })
      .filter(Boolean)

    setSelectedKeys(nextSelectedKeys)

    emit('select', nextSelectedKeys, {
      event: 'select',
      selected: targetSelected,
      node: treeNode,
      selectedNodes,
      nativeEvent: e,
    })
  }

  onNodeCheck = (e: MouseEvent, treeNode: any, checked: boolean) => {
    const { checkedKeys: oriCheckedKeys, halfCheckedKeys: oriHalfCheckedKeys } =
      mergedChecked.value
    const key = treeNode.key

    let checkedObj: any

    const eventObj: any = {
      event: 'check',
      node: treeNode,
      checked,
      nativeEvent: e,
    }

    if (props.checkStrictly) {
      const nextCheckedKeys = checked
        ? arrAdd(oriCheckedKeys, key)
        : arrDel(oriCheckedKeys, key)
      const nextHalfCheckedKeys = arrDel(oriHalfCheckedKeys, key)

      checkedObj = {
        checked: nextCheckedKeys,
        halfChecked: nextHalfCheckedKeys,
      }

      eventObj.checkedNodes = nextCheckedKeys
        .map(checkedKey => getEntity(keyEntities.value, checkedKey))
        .filter(Boolean)
        .map(entity => entity.node)

      rawCheckedKeys.value = nextCheckedKeys
      rawHalfCheckedKeys.value = nextHalfCheckedKeys
    } else {
      let {
        checkedKeys: nextCheckedKeys,
        halfCheckedKeys: nextHalfCheckedKeys,
      } = conductCheck([...oriCheckedKeys, key], true, keyEntities.value)

      if (!checked) {
        const keySet = new Set(nextCheckedKeys)
        keySet.delete(key)
        ;({
          checkedKeys: nextCheckedKeys,
          halfCheckedKeys: nextHalfCheckedKeys,
        } = conductCheck(
          Array.from(keySet),
          { checked: false, halfCheckedKeys: nextHalfCheckedKeys },
          keyEntities.value,
        ))
      }

      checkedObj = nextCheckedKeys
      eventObj.checkedNodes = []
      eventObj.checkedNodesPositions = []
      eventObj.halfCheckedKeys = nextHalfCheckedKeys

      nextCheckedKeys.forEach(checkedKey => {
        const entity = getEntity(keyEntities.value, checkedKey)
        if (!entity) return
        const { node, pos } = entity
        eventObj.checkedNodes.push(node)
        eventObj.checkedNodesPositions.push({ node, pos })
      })

      rawCheckedKeys.value = nextCheckedKeys
      rawHalfCheckedKeys.value = nextHalfCheckedKeys
    }

    emit('check', checkedObj, eventObj)
  }

  onNodeMouseEnter = (e: MouseEvent, node: any) => {
    emit('mouse-enter', { event: e, node })
  }

  onNodeMouseLeave = (e: MouseEvent, node: any) => {
    emit('mouse-leave', { event: e, node })
  }

  onNodeContextMenu = (e: MouseEvent, node: any) => {
    e.preventDefault()
    emit('right-click', { event: e, node })
  }

  function resetDragState() {
    dragOverNodeKey.value = null
    dropPosition.value = null
    dropLevelOffset.value = null
    dropTargetKey.value = null
    dropContainerKey.value = null
    dropTargetPos.value = null
    dropAllowed.value = false
  }

  function cleanDragState() {
    if (draggingNodeKey.value !== null) {
      draggingNodeKey.value = null
      dropPosition.value = null
      dropContainerKey.value = null
      dropTargetKey.value = null
      dropLevelOffset.value = null
      dropAllowed.value = true
      dragOverNodeKey.value = null
    }
    dragStartMousePosition = null
    currentMouseOverDroppableNodeKey = null
    dragChildrenKeys.value = []
    indent.value = null
  }

  const onWindowDragEnd = (event: DragEvent) => {
    onNodeDragEnd(event, null, true)
    window.removeEventListener('dragend', onWindowDragEnd)
  }

  onMounted(() => {
    window.addEventListener('mouseup', onGlobalMouseUp)
  })

  onBeforeUnmount(() => {
    window.removeEventListener('dragend', onWindowDragEnd)
    window.removeEventListener('mouseup', onGlobalMouseUp)
    Object.keys(delayedDragEnterLogic).forEach(key => {
      clearTimeout(delayedDragEnterLogic[key])
    })
  })

  onNodeDragStart = (event: DragEvent, nodeProps: any) => {
    dragNodeProps = nodeProps
    dragStartMousePosition = { x: event.clientX, y: event.clientY }

    const newExpandedKeys = arrDel(expandedKeys.value, nodeProps.eventKey!)
    draggingNodeKey.value = nodeProps.eventKey!
    dragChildrenKeys.value = getDragChildrenKeys(
      nodeProps.eventKey!,
      keyEntities.value,
    )
    indent.value = listRef.value?.getIndentWidth?.() || 0

    setExpandedKeys(newExpandedKeys)
    window.addEventListener('dragend', onWindowDragEnd)

    emit('drag-start', { event, node: convertNodePropsToEventData(nodeProps) })
  }

  onNodeDragEnter = (event: DragEvent, nodeProps: any) => {
    const { pos, eventKey } = nodeProps
    if (currentMouseOverDroppableNodeKey !== eventKey) {
      currentMouseOverDroppableNodeKey = eventKey!
    }

    if (!dragNodeProps || !dragStartMousePosition) {
      resetDragState()
      return
    }

    const {
      dropPosition: nextDropPosition,
      dropLevelOffset: nextDropLevelOffset,
      dropTargetKey: nextDropTargetKey,
      dropContainerKey: nextDropContainerKey,
      dropTargetPos: nextDropTargetPos,
      dropAllowed: nextDropAllowed,
      dragOverNodeKey: nextDragOverNodeKey,
    } = calcDropPosition(
      event,
      dragNodeProps,
      nodeProps,
      indent.value || 0,
      dragStartMousePosition,
      props.allowDrop! as AllowDrop<any>,
      flattenNodes.value as any,
      keyEntities.value,
      expandedKeys.value,
      props.direction,
    )

    if (
      dragChildrenKeys.value.includes(nextDropTargetKey) ||
      !nextDropAllowed
    ) {
      resetDragState()
      return
    }

    Object.keys(delayedDragEnterLogic).forEach(key => {
      clearTimeout(delayedDragEnterLogic[key])
    })

    if (dragNodeProps.eventKey !== nodeProps.eventKey) {
      delayedDragEnterLogic[pos!] = window.setTimeout(() => {
        if (draggingNodeKey.value === null) return

        let newExpandedKeys = [...expandedKeys.value]
        const entity = getEntity(keyEntities.value, nodeProps.eventKey!)
        if (entity && (entity.children || []).length) {
          newExpandedKeys = arrAdd(expandedKeys.value, nodeProps.eventKey!)
        }

        if (props.expandedKeys === undefined) {
          setExpandedKeys(newExpandedKeys)
        }

        emit('expand', newExpandedKeys, {
          node: convertNodePropsToEventData(nodeProps),
          expanded: true,
          nativeEvent: event,
        })
      }, 800)
    }

    if (
      dragNodeProps.eventKey === nextDropTargetKey &&
      nextDropLevelOffset === 0
    ) {
      resetDragState()
      return
    }

    dragOverNodeKey.value = nextDragOverNodeKey
    dropPosition.value = nextDropPosition
    dropLevelOffset.value = nextDropLevelOffset
    dropTargetKey.value = nextDropTargetKey
    dropContainerKey.value = nextDropContainerKey
    dropTargetPos.value = nextDropTargetPos
    dropAllowed.value = nextDropAllowed

    emit('drag-enter', {
      event,
      node: convertNodePropsToEventData(nodeProps),
      expandedKeys: expandedKeys.value,
    })
  }

  onNodeDragOver = (event: DragEvent, nodeProps: any) => {
    if (!dragNodeProps || !dragStartMousePosition) return

    const {
      dropPosition: nextDropPosition,
      dropLevelOffset: nextDropLevelOffset,
      dropTargetKey: nextDropTargetKey,
      dropContainerKey: nextDropContainerKey,
      dropTargetPos: nextDropTargetPos,
      dropAllowed: nextDropAllowed,
      dragOverNodeKey: nextDragOverNodeKey,
    } = calcDropPosition(
      event,
      dragNodeProps,
      nodeProps,
      indent.value || 0,
      dragStartMousePosition,
      props.allowDrop! as AllowDrop<any>,
      flattenNodes.value as any,
      keyEntities.value,
      expandedKeys.value,
      props.direction,
    )

    if (dragChildrenKeys.value.includes(nextDropTargetKey) || !nextDropAllowed)
      return

    if (
      dragNodeProps.eventKey === nextDropTargetKey &&
      nextDropLevelOffset === 0
    ) {
      if (
        !(
          dropPosition.value === null &&
          dropLevelOffset.value === null &&
          dropTargetKey.value === null &&
          dropContainerKey.value === null &&
          dropTargetPos.value === null &&
          dropAllowed.value === false &&
          dragOverNodeKey.value === null
        )
      ) {
        resetDragState()
      }
    } else if (
      !(
        nextDropPosition === dropPosition.value &&
        nextDropLevelOffset === dropLevelOffset.value &&
        nextDropTargetKey === dropTargetKey.value &&
        nextDropContainerKey === dropContainerKey.value &&
        nextDropTargetPos === dropTargetPos.value &&
        nextDropAllowed === dropAllowed.value &&
        nextDragOverNodeKey === dragOverNodeKey.value
      )
    ) {
      dropPosition.value = nextDropPosition
      dropLevelOffset.value = nextDropLevelOffset
      dropTargetKey.value = nextDropTargetKey
      dropContainerKey.value = nextDropContainerKey
      dropTargetPos.value = nextDropTargetPos
      dropAllowed.value = nextDropAllowed
      dragOverNodeKey.value = nextDragOverNodeKey
    }

    emit('drag-over', { event, node: convertNodePropsToEventData(nodeProps) })
  }

  onNodeDragLeave = (event: DragEvent, nodeProps: any) => {
    const target = event.currentTarget as HTMLElement | null
    const related = event.relatedTarget as Node | null

    if (
      currentMouseOverDroppableNodeKey === nodeProps.eventKey &&
      target &&
      related &&
      !target.contains(related)
    ) {
      resetDragState()
      currentMouseOverDroppableNodeKey = null
    } else if (
      currentMouseOverDroppableNodeKey === nodeProps.eventKey &&
      target &&
      !related
    ) {
      resetDragState()
      currentMouseOverDroppableNodeKey = null
    }

    emit('drag-leave', { event, node: convertNodePropsToEventData(nodeProps) })
  }

  onNodeDragEnd = (
    event: DragEvent,
    nodeProps: any | null,
    _outsideTree?: boolean,
  ) => {
    dragOverNodeKey.value = null
    cleanDragState()

    if (nodeProps) {
      emit('drag-end', { event, node: convertNodePropsToEventData(nodeProps) })
    }

    dragNodeProps = null
    window.removeEventListener('dragend', onWindowDragEnd)
  }

  onNodeDrop = (
    event: DragEvent,
    _nodeProps: any | null,
    outsideTree = false,
  ) => {
    const dropAllowedValue = dropAllowed.value
    const dropPositionValue = dropPosition.value
    const dropTargetKeyValue = dropTargetKey.value
    const dropTargetPosValue = dropTargetPos.value
    const dragChildrenKeysValue = dragChildrenKeys.value
    const dragNodePropsValue = dragNodeProps

    if (!dropAllowedValue) return
    dragOverNodeKey.value = null
    cleanDragState()

    if (dropTargetKeyValue === null) return

    const abstractDropNodeProps = {
      ...getTreeNodeProps(
        dropTargetKeyValue,
        getTreeNodeRequiredPropsVal.value,
      ),
      active: getActiveItem.value?.key === dropTargetKeyValue,
      data: getEntity(keyEntities.value, dropTargetKeyValue)?.node,
    }

    warning(
      !dragChildrenKeysValue.includes(dropTargetKeyValue),
      "Can not drop to dragNode's children node. This is a bug of vc-tree. Please report an issue.",
    )

    const posArr = posToArr(dropTargetPosValue || '0')

    const dropResult: any = {
      event,
      node: convertNodePropsToEventData(abstractDropNodeProps),
      dragNode: dragNodePropsValue
        ? convertNodePropsToEventData(dragNodePropsValue)
        : null,
      dragNodesKeys: dragNodePropsValue
        ? [dragNodePropsValue.eventKey].concat(dragChildrenKeysValue)
        : dragChildrenKeysValue,
      dropToGap: dropPositionValue !== 0,
      dropPosition:
        (dropPositionValue || 0) + Number(posArr[posArr.length - 1]),
    }

    if (!outsideTree) {
      emit('drop', dropResult)
    }

    dragNodeProps = null
  }

  function onActiveChange(newActiveKey: Key | null) {
    if (activeKey.value === newActiveKey) return
    setActiveKey(newActiveKey)

    if (newActiveKey !== null) {
      nextTick(() => {
        listRef.value?.scrollTo?.({
          key: newActiveKey,
          offset: props.itemScrollOffset || 0,
        })
      })
    }

    emit('active-change', newActiveKey)
  }

  function offsetActiveKey(offset: number) {
    const nodes = flattenNodes.value
    const currentActiveKey = activeKey.value

    let index = nodes.findIndex(({ key }) => key === currentActiveKey)
    if (index === -1 && offset < 0) {
      index = nodes.length
    }

    index = (index + offset + nodes.length) % nodes.length
    const item = nodes[index]
    onActiveChange(item ? item.key : null)
  }

  function onFocus(e: FocusEvent) {
    if (!focusedByMouse && !props.disabled && activeKey.value === null) {
      const visibleSelectedKey = selectedKeys.value.find(key => {
        return flattenNodes.value.some(nodeItem => nodeItem.key === key)
      })

      if (visibleSelectedKey !== undefined) {
        onActiveChange(visibleSelectedKey)
      } else {
        onActiveChange(flattenNodes.value?.[0]?.key || null)
      }
    }
    emit('focus', e)
  }

  function onBlur(e: FocusEvent) {
    onActiveChange(null)
    emit('blur', e)
  }

  function onMouseDown(e: MouseEvent) {
    focusedByMouse = true
    emit('mousedown', e)
  }

  function onGlobalMouseUp() {
    focusedByMouse = false
  }

  function onListChangeStart() {
    listChanging.value = true
  }

  function onListChangeEnd() {
    setTimeout(() => {
      listChanging.value = false
    })
  }

  function onContextMenu(e: MouseEvent) {
    emit('contextmenu', e)
  }

  function onScroll(e: Event) {
    emit('scroll', e)
  }

  defineExpose<TreeRef>({
    scrollTo,
    onKeyDown,
  })

  const prefixCls = computed(() => props.prefixCls)
  const treeCls = computed(() =>
    clsx(prefixCls.value, props.className, props.rootClassName, {
      [`${prefixCls.value}-show-line`]: props.showLine,
    }),
  )
  const listFocusable = computed(() => props.focusable)
</script>

<template>
  <div :class="treeCls" :style="rootStyle" v-bind="attrsAriaData">
    <NodeList
      ref="listRef"
      :prefix-cls="prefixCls"
      :style="style"
      :data="flattenNodes"
      :disabled="disabled"
      :selectable="selectable"
      :checkable="!!checkable"
      :dragging="draggingNodeKey !== null"
      :height="height"
      :item-height="itemHeight"
      :virtual="virtual"
      :focusable="listFocusable"
      :tab-index="tabIndex"
      :active-item="getActiveItem"
      :expanded-keys="expandedKeys"
      :selected-keys="selectedKeys"
      :checked-keys="mergedChecked.checkedKeys"
      :half-checked-keys="mergedChecked.halfCheckedKeys"
      :loaded-keys="loadedKeys"
      :loading-keys="loadingKeys"
      :drag-over-node-key="dragOverNodeKey"
      :drop-position="dropPosition"
      :key-entities="keyEntities"
      :scroll-width="scrollWidth"
      @keydown="onKeyDown"
      @focus="onFocus"
      @blur="onBlur"
      @mousedown="onMouseDown"
      @active-change="onActiveChange"
      @list-change-start="onListChangeStart"
      @list-change-end="onListChangeEnd"
      @contextmenu="onContextMenu"
      @scroll="onScroll"
    />
  </div>
</template>
