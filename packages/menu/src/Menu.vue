<script setup vapor lang="ts">
  import type { MenuMode } from './interface'
  import type { MenuProps } from './Menu'

  import { clsx } from '@v-c/util'
  import useId from '@v-c/util/dist/hooks/useId'
  import isEqual from '@v-c/util/dist/isEqual'
  import {
    computed,
    nextTick,
    onMounted,
    onUnmounted,
    shallowRef,
    watch,
  } from 'vue'

  import useAccessibility from './hooks/useAccessibility'
  import useKeyRecords from './hooks/useKeyRecords'
  import useMemoCallback from './hooks/useMemoCallback'
  import { useIdContextProvide } from './IdContextKey'
  import { useMenuContextProvider } from './MenuContextKey'
  import {
    useMeasureProvider,
    usePathUserContextProvider,
  } from './PathContextKey'
  import { usePrivateProvider } from './PrivateContextKey'
  import { warnItemProp } from './utils/warnUtil'

  defineOptions({ name: 'VcMenu', inheritAttrs: false })

  const EMPTY_LIST: string[] = []

  const props = withDefaults(defineProps<MenuProps>(), {
    prefixCls: 'vc-menu',
    mode: 'vertical',
    subMenuOpenDelay: 0,
    subMenuCloseDelay: 0.1,
    selectable: true,
    multiple: false,
    inlineIndent: 24,
    triggerSubMenuAction: 'hover',
    overflowedIndicator: '...',
  })

  const emit = defineEmits<{
    select: [info: any]
    deselect: [info: any]
    click: [info: any]
    'open-change': [keys: string[]]
    'update:openKeys': [keys: string[]]
    'update:selectedKeys': [keys: string[]]
  }>()

  // ===================== UUID =====================
  const uuid = useId(props.id ? `vc-menu-uuid-${props.id}` : 'vc-menu-uuid')
  const isRtl = computed(() => props.direction === 'rtl')

  useIdContextProvide(computed(() => uuid))

  // ===================== Mode =====================
  const modeMerged = computed(() => {
    if (
      (props.mode === 'inline' || props.mode === 'vertical') &&
      props.inlineCollapsed
    ) {
      return ['vertical' as MenuMode, true]
    }
    return [props.mode || 'vertical', false]
  })
  const mergedMode = computed(() => modeMerged.value[0])
  const mergedInlineCollapsed = computed(() => modeMerged.value[1])
  const isInlineMode = computed(() => mergedMode.value === 'inline')
  const internalMode = shallowRef<MenuMode>(mergedMode.value)
  const internalInlineCollapsed = shallowRef(mergedInlineCollapsed.value)

  // ===================== Open Keys =====================
  const innerOpenKeys = shallowRef<string[]>(
    props.openKeys ?? props.defaultOpenKeys ?? EMPTY_LIST,
  )
  watch(
    () => props.openKeys,
    () => {
      innerOpenKeys.value = props.openKeys ?? EMPTY_LIST
    },
  )

  const mergedOpenKeys = computed({
    get() {
      if (props.openKeys !== undefined) return props.openKeys
      return innerOpenKeys.value ?? EMPTY_LIST
    },
    set(value: string[]) {
      innerOpenKeys.value = value
    },
  })

  const triggerOpenKeys = (keys: string[], forceFlush = false) => {
    const doUpdate = () => {
      mergedOpenKeys.value = keys
      emit('open-change', keys)
      emit('update:openKeys', keys)
    }
    if (forceFlush) nextTick(doUpdate)
    else doUpdate()
  }

  const inlineCacheOpenKeys = shallowRef<string[]>(mergedOpenKeys.value)
  const mountRef = shallowRef(false)

  watch([mergedMode, mergedInlineCollapsed], () => {
    internalMode.value = mergedMode.value
    internalInlineCollapsed.value = mergedInlineCollapsed.value
    if (!mountRef.value) return
    if (isInlineMode.value) {
      mergedOpenKeys.value = inlineCacheOpenKeys.value
    } else {
      triggerOpenKeys(EMPTY_LIST)
    }
  })

  watch(mergedOpenKeys, () => {
    if (isInlineMode.value) {
      inlineCacheOpenKeys.value = mergedOpenKeys.value
    }
  })

  onMounted(() => {
    mountRef.value = true
  })
  onUnmounted(() => {
    mountRef.value = false
  })

  // ===================== Key Records =====================
  const {
    registerPath,
    unregisterPath,
    refreshOverflowKeys,
    isSubPathKey,
    getKeyPath,
    getKeys,
    getSubPathKeys,
  } = useKeyRecords()

  useMeasureProvider(computed(() => ({ registerPath, unregisterPath })))
  usePathUserContextProvider(computed(() => ({ isSubPathKey })))

  // ===================== Active Key =====================
  const mergedActiveKey = shallowRef(props.activeKey)
  watch(
    () => props.activeKey,
    () => {
      mergedActiveKey.value = props.activeKey
    },
  )

  const onActive = useMemoCallback((key: string) => {
    mergedActiveKey.value = key
  })
  const onInactive = useMemoCallback(() => {
    mergedActiveKey.value = undefined as any
  })

  // ===================== Select Keys =====================
  const innerSelectKeys = shallowRef<string[]>(
    props.selectedKeys ?? props.defaultSelectedKeys ?? EMPTY_LIST,
  )
  watch(
    () => props.selectedKeys,
    () => {
      innerSelectKeys.value = props.selectedKeys ?? EMPTY_LIST
    },
  )

  const mergedSelectKeys = computed(() => {
    const keys = innerSelectKeys.value
    if (Array.isArray(keys)) return keys
    if (keys === null || keys === undefined) return EMPTY_LIST
    return [keys]
  })

  const triggerSelection = (info: any) => {
    if (!props.selectable) return
    const targetKey = info.key
    const exist = mergedSelectKeys.value.includes(targetKey)
    let newSelectKeys: string[]

    if (props.multiple) {
      newSelectKeys = exist
        ? mergedSelectKeys.value.filter(k => k !== targetKey)
        : [...mergedSelectKeys.value, targetKey]
    } else {
      newSelectKeys = [targetKey]
    }

    if (props.selectedKeys === undefined) {
      innerSelectKeys.value = newSelectKeys
    }

    const selectInfo = { ...info, selectedKeys: newSelectKeys }
    if (exist) emit('deselect', selectInfo)
    else emit('select', selectInfo)

    if (
      !props.multiple &&
      mergedOpenKeys.value.length &&
      internalMode.value !== 'inline'
    ) {
      triggerOpenKeys(EMPTY_LIST)
    }

    emit('update:selectedKeys', newSelectKeys)
  }

  const onInternalClick = (info: any) => {
    emit('click', warnItemProp(info))
    triggerSelection(info)
  }

  const onInternalOpenChange = (key: string, open: boolean) => {
    let newOpenKeys = mergedOpenKeys.value.filter(k => k !== key)

    if (open) {
      newOpenKeys.push(key)
    } else if (internalMode.value !== 'inline') {
      const subPathKeys = getSubPathKeys(key)
      newOpenKeys = newOpenKeys.filter(k => !subPathKeys.has(k))
    }

    if (!isEqual(mergedOpenKeys.value, newOpenKeys, true)) {
      triggerOpenKeys(newOpenKeys, true)
    }
  }

  // ===================== Accessibility =====================
  const containerRef = shallowRef<HTMLUListElement>()

  const triggerAccessibilityOpen = (key: string, open?: boolean) => {
    const nextOpen = open ?? !mergedOpenKeys.value.includes(key)
    onInternalOpenChange(key, nextOpen)
  }

  const setMergedActiveKey = (key: string) => {
    mergedActiveKey.value = key
  }

  const onInternalKeyDown = useAccessibility(
    internalMode as any,
    mergedActiveKey as any,
    isRtl as any,
    uuid,
    containerRef as any,
    getKeys,
    getKeyPath,
    setMergedActiveKey,
    triggerAccessibilityOpen,
  )

  // ===================== Overflow =====================
  const lastVisibleIndex = shallowRef(0)
  const mergedOverflowIndicator = computed(
    () => props.overflowedIndicator ?? '...',
  )

  // ===================== Container =====================
  const containerCls = computed(() =>
    clsx(
      props.prefixCls,
      `${props.prefixCls}-root`,
      `${props.prefixCls}-${internalMode.value}`,
      {
        [`${props.prefixCls}-inline-collapsed`]: internalInlineCollapsed.value,
        [`${props.prefixCls}-rtl`]: isRtl.value,
      },
      props.rootClass,
    ),
  )

  // ===================== Context =====================
  const privateContext = computed(() => ({
    _internalRenderMenuItem: props._internalRenderMenuItem,
    _internalRenderSubMenuItem: props._internalRenderSubMenuItem,
  }))
  usePrivateProvider(privateContext)

  const menuContext = computed(() => ({
    prefixCls: props.prefixCls,
    rootClass: props.rootClass,
    classes: props.classes,
    styles: props.styles,
    mode: internalMode.value as MenuMode,
    openKeys: mergedOpenKeys.value,
    rtl: isRtl.value,
    disabled: props.disabled,
    motion: props.motion,
    defaultMotions: props.defaultMotions,
    activeKey: mergedActiveKey.value as string,
    onActive,
    onInactive,
    selectedKeys: mergedSelectKeys.value,
    inlineIndent: props.inlineIndent || 24,
    subMenuOpenDelay: props.subMenuOpenDelay ?? 0,
    subMenuCloseDelay: props.subMenuCloseDelay ?? 0.1,
    forceSubMenuRender: props.forceSubMenuRender,
    builtinPlacements: props.builtinPlacements,
    triggerSubMenuAction: props.triggerSubMenuAction || 'hover',
    getPopupContainer: props.getPopupContainer,
    itemIcon: props.itemIcon,
    expandIcon: props.expandIcon,
    onItemClick: onInternalClick,
    onOpenChange: onInternalOpenChange,
    popupRender: props.popupRender,
  }))

  useMenuContextProvider(menuContext)

  // ===================== Expose =====================
  defineExpose({
    list: containerRef,
    focus: (options?: FocusOptions) => {
      const keys = getKeys()
      const all = document.querySelectorAll(
        `[data-menu-id][data-menu-id^="${uuid}-"]`,
      )
      let target: HTMLElement | null = null
      if (mergedActiveKey.value) {
        target = document.querySelector(
          `[data-menu-id="${uuid}-${mergedActiveKey.value}"]`,
        ) as HTMLElement | null
      }
      if (!target && all.length) {
        target = all[0] as HTMLElement
      }
      target?.focus?.(options)
    },
    findItem: ({ key: itemKey }: { key: string }) => {
      return (
        document.querySelector(`[data-menu-id="${uuid}-${itemKey}"]`) || null
      )
    },
  })
</script>

<template>
  <ul
    ref="containerRef"
    :class="containerCls"
    :dir="props.direction"
    role="menu"
    tabindex="0"
    data-menu-list
    @keydown="onInternalKeyDown($event)"
  >
    <slot />
  </ul>
</template>
