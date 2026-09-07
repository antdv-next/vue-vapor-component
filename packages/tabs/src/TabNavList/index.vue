<script setup vapor lang="ts">
  import type { CSSProperties, Ref } from 'vue'

  import type { SizeInfo, Tab, TabNavListProps } from '../interface'

  import ResizeObserver from '@vapor-component/resize-observer'
  import { computed, nextTick, onUnmounted, ref, shallowRef, watch } from 'vue'

  import useIndicator from '../hooks/useIndicator'
  import useOffsets from '../hooks/useOffsets'
  import useTouchMove from '../hooks/useTouchMove'
  import useVisibleRange from '../hooks/useVisibleRange'
  import { useTabContext } from '../TabContext'
  import { genDataNodeKey } from '../utils'
  import AddButton from './AddButton.vue'
  import ExtraContent from './ExtraContent.vue'
  import OperationNode from './OperationNode.vue'
  import TabNode from './TabNode.vue'

  defineOptions({ name: 'VcTabNavList', inheritAttrs: false })

  const props = defineProps<TabNavListProps>()

  const emit = defineEmits<{
    'tab-click': [key: string, e: MouseEvent | KeyboardEvent]
    'tab-scroll': [info: { direction: 'left' | 'right' | 'top' | 'bottom' }]
    edit: [
      type: 'add' | 'remove',
      info: { key?: string; event: MouseEvent | KeyboardEvent },
    ]
  }>()

  const tabBarGutter = computed(() =>
    props.tabBarGutter ? `${props.tabBarGutter}px` : undefined,
  )

  // Context
  const ctx = useTabContext()
  const tabs = computed(() => ctx?.value?.tabs || [])
  const prefixCls = computed(() => ctx?.value?.prefixCls || '')

  const containerRef = ref<HTMLDivElement | null>(null)
  const extraLeftRef = ref<any>(null)
  const extraRightRef = ref<any>(null)
  const tabsWrapperRef = ref<HTMLDivElement | null>(null)
  const tabListRef = ref<HTMLDivElement | null>(null)

  const tabPositionTopOrBottom = computed(
    () => props.tabPosition === 'top' || props.tabPosition === 'bottom',
  )

  const transformLeft = ref(0)
  const transformTop = ref(0)

  watch(
    transformLeft,
    (next, prev) => {
      if (tabPositionTopOrBottom.value) {
        emit('tab-scroll', {
          direction: next > (prev || 0) ? 'left' : 'right',
        })
      }
    },
    { immediate: true },
  )

  watch(
    transformTop,
    (next, prev) => {
      if (!tabPositionTopOrBottom.value) {
        emit('tab-scroll', {
          direction: next > (prev || 0) ? 'top' : 'bottom',
        })
      }
    },
    { immediate: true },
  )

  // ===================== Sizes =====================
  const containerExcludeExtraSize = ref<SizeInfo>([0, 0])
  const tabContentSize = ref<SizeInfo>([0, 0])
  const firstTabContentSize = computed(() => tabContentSize.value[0])
  const addSize = ref<SizeInfo>([0, 0])
  const operationSize = ref<SizeInfo>([0, 0])

  const tabSizes = shallowRef(new Map())
  const tabOffsets = useOffsets(tabs, tabSizes, firstTabContentSize)
  const operationsRef = ref<any>(null)
  const innerAddButtonRef = ref<any>(null)

  function getUnitValue(size: SizeInfo, tabPositionTopOrBottom: boolean) {
    return size[tabPositionTopOrBottom ? 0 : 1]
  }

  const containerExcludeExtraSizeValue = computed(() =>
    getUnitValue(containerExcludeExtraSize.value, tabPositionTopOrBottom.value),
  )
  const tabContentSizeValue = computed(() =>
    getUnitValue(tabContentSize.value, tabPositionTopOrBottom.value),
  )
  const addSizeValue = computed(() =>
    getUnitValue(addSize.value, tabPositionTopOrBottom.value),
  )
  const operationSizeValue = computed(() =>
    getUnitValue(operationSize.value, tabPositionTopOrBottom.value),
  )

  const needScroll = computed(
    () =>
      Math.floor(containerExcludeExtraSizeValue.value) <
      Math.floor(tabContentSizeValue.value + addSizeValue.value),
  )

  const visibleTabContentValue = computed(() =>
    needScroll.value
      ? containerExcludeExtraSizeValue.value - operationSizeValue.value
      : containerExcludeExtraSizeValue.value - addSizeValue.value,
  )

  // ===================== Transform =====================
  const transformComputed = computed(() => {
    let transformMin = 0
    let transformMax = 0

    if (!tabPositionTopOrBottom.value) {
      transformMin = Math.min(
        0,
        visibleTabContentValue.value - tabContentSizeValue.value,
      )
      transformMax = 0
    } else if (props.rtl) {
      transformMin = 0
      transformMax = Math.max(
        0,
        tabContentSizeValue.value - visibleTabContentValue.value,
      )
    } else {
      transformMin = Math.min(
        0,
        visibleTabContentValue.value - tabContentSizeValue.value,
      )
      transformMax = 0
    }
    return { transformMin, transformMax }
  })

  function alignInRange(value: number): number {
    const { transformMin, transformMax } = transformComputed.value
    if (value < transformMin) return transformMin
    if (value > transformMax) return transformMax
    return value
  }

  // ===================== Touch =====================
  const touchMovingRef = ref<ReturnType<typeof setTimeout> | null>(null)

  const lockAnimation = ref<number>()
  function doLockAnimation() {
    lockAnimation.value = Date.now()
  }

  function clearTouchMoving() {
    if (touchMovingRef.value) {
      clearTimeout(touchMovingRef.value)
    }
  }

  useTouchMove(tabsWrapperRef, (offsetX, offsetY) => {
    function doMove(dataRef: Ref<number>, offset: number) {
      dataRef.value = alignInRange(dataRef.value + offset)
    }

    if (!needScroll.value) {
      return false
    }

    if (tabPositionTopOrBottom.value) {
      doMove(transformLeft, offsetX)
    } else {
      doMove(transformTop, offsetY)
    }

    clearTouchMoving()
    doLockAnimation()

    return true
  })

  watch(
    () => lockAnimation.value,
    async (_n, _o, onCleanup) => {
      await nextTick()
      if (lockAnimation.value) {
        touchMovingRef.value = setTimeout(() => {
          lockAnimation.value = 0
        }, 100)
      }
      onCleanup(() => {
        clearTouchMoving()
      })
    },
    { immediate: true },
  )

  onUnmounted(() => {
    clearTouchMoving()
  })

  // ===================== Visible Range =====================
  const visibleRangeRef = useVisibleRange(
    tabOffsets,
    visibleTabContentValue,
    computed(() =>
      tabPositionTopOrBottom.value ? transformLeft.value : transformTop.value,
    ),
    tabContentSizeValue,
    addSizeValue,
    operationSizeValue,
    {
      tabs,
      tabPosition: computed(() => props.tabPosition),
      rtl: computed(() => props.rtl),
    },
  )

  const visibleStart = computed(() => visibleRangeRef.value[0])
  const visibleEnd = computed(() => visibleRangeRef.value[1])

  const hiddenTabs = computed(() => {
    const startHidden = tabs.value.slice(0, visibleStart.value)
    const endHidden = tabs.value.slice(visibleEnd.value + 1)
    return [...startHidden, ...endHidden]
  })

  const hasDropdown = computed(() => hiddenTabs.value.length > 0)

  const wrapPrefix = computed(() => `${prefixCls.value}-nav-wrap`)

  const pingLeft = computed(() =>
    tabPositionTopOrBottom.value
      ? props.rtl
        ? transformLeft.value > 0
        : transformLeft.value < 0
      : false,
  )

  const pingRight = computed(() => {
    if (!tabPositionTopOrBottom.value) return false
    if (props.rtl)
      return transformLeft.value !== transformComputed.value.transformMax
    return transformLeft.value !== transformComputed.value.transformMin
  })

  const pingTop = computed(() =>
    !tabPositionTopOrBottom.value ? transformTop.value < 0 : false,
  )

  const pingBottom = computed(() =>
    !tabPositionTopOrBottom.value
      ? transformTop.value !== transformComputed.value.transformMin
      : false,
  )

  // ===================== Scroll =====================
  function scrollToTab(key = props.activeKey) {
    const tabOffset = tabOffsets.value.get(key) || {
      width: 0,
      height: 0,
      left: 0,
      right: 0,
      top: 0,
    }

    if (tabPositionTopOrBottom.value) {
      const newTransform = transformLeft

      if (props.rtl) {
        if (tabOffset.right < transformLeft.value) {
          newTransform.value = tabOffset.right
        } else if (
          tabOffset.right + tabOffset.width >
          transformLeft.value + visibleTabContentValue.value
        ) {
          newTransform.value =
            tabOffset.right + tabOffset.width - visibleTabContentValue.value
        }
      } else if (tabOffset.left < -transformLeft.value) {
        newTransform.value = -tabOffset.left
      } else if (
        tabOffset.left + tabOffset.width >
        -transformLeft.value + visibleTabContentValue.value
      ) {
        newTransform.value = -(
          tabOffset.left +
          tabOffset.width -
          visibleTabContentValue.value
        )
      }

      transformTop.value = 0
      transformLeft.value = alignInRange(newTransform.value)
    } else {
      const newTransform = transformTop

      if (tabOffset.top < -transformTop.value) {
        newTransform.value = -tabOffset.top
      } else if (
        tabOffset.top + tabOffset.height >
        -transformTop.value + visibleTabContentValue.value
      ) {
        newTransform.value = -(
          tabOffset.top +
          tabOffset.height -
          visibleTabContentValue.value
        )
      }

      transformLeft.value = 0
      transformTop.value = alignInRange(newTransform.value)
    }
  }

  // ===================== Focus =====================
  const focusKey = ref<string | undefined>()
  const isMouse = ref(false)

  const enabledTabs = computed(() =>
    tabs.value.filter(tab => !tab.disabled).map(tab => tab.key),
  )

  function onOffset(offset: number) {
    const enabledKeys = getEnabledKeys(tabs.value)
    const currentIndex = enabledKeys.indexOf(focusKey.value || props.activeKey)
    const len = enabledKeys.length
    const nextIndex = (currentIndex + offset + len) % len
    focusKey.value = enabledKeys[nextIndex]
  }

  function handleRemoveTab(
    removalKey: string | undefined,
    e: MouseEvent | KeyboardEvent,
  ) {
    if (!removalKey) return
    const removeTab = tabs.value.find(t => t.key === removalKey)
    const removable =
      removeTab && !removeTab.disabled && (removeTab.closable || props.editable)
    if (removable) {
      e.preventDefault()
      e.stopPropagation()
      emit('edit', 'remove', { key: removalKey, event: e as any })
      const enabledKeys = getEnabledKeys(tabs.value)
      const removeIndex = enabledKeys.indexOf(removalKey)
      if (removeIndex === enabledKeys.length - 1) onOffset(-1)
      else onOffset(1)
    }
  }

  function handleMouseDown(key: string, e: MouseEvent) {
    isMouse.value = true
    if (e.button === 1) handleRemoveTab(key, e)
  }

  function handleKeyDown(e: KeyboardEvent) {
    const { code } = e

    const isRTL = props.rtl && tabPositionTopOrBottom.value
    const firstEnabledTab = enabledTabs.value[0]
    const lastEnabledTab = enabledTabs.value[enabledTabs.value.length - 1]

    switch (code) {
      case 'ArrowLeft': {
        if (tabPositionTopOrBottom.value) {
          onOffset(isRTL ? 1 : -1)
        }
        break
      }
      case 'ArrowRight': {
        if (tabPositionTopOrBottom.value) {
          onOffset(isRTL ? -1 : 1)
        }
        break
      }
      case 'ArrowUp': {
        e.preventDefault()
        if (!tabPositionTopOrBottom.value) {
          onOffset(-1)
        }
        break
      }
      case 'ArrowDown': {
        e.preventDefault()
        if (!tabPositionTopOrBottom.value) {
          onOffset(1)
        }
        break
      }
      case 'Home': {
        e.preventDefault()
        focusKey.value = firstEnabledTab
        break
      }
      case 'End': {
        e.preventDefault()
        focusKey.value = lastEnabledTab
        break
      }
      case 'Enter':
      case 'Space': {
        e.preventDefault()
        emit('tab-click', focusKey.value ?? props.activeKey, e)
        break
      }
      case 'Backspace':
      case 'Delete': {
        handleRemoveTab(focusKey.value, e)
        break
      }
    }
  }

  const isHorizontal = computed(() => tabPositionTopOrBottom.value)

  const navClass = computed(() => [
    `${prefixCls.value}-nav`,
    props.classNames?.header,
  ])

  const navStyle = computed(() => ({
    ...(props.styles?.header || {}),
  }))

  const navListClass = computed(() => `${prefixCls.value}-nav-list`)

  function onItemClick(key: string, e: MouseEvent | KeyboardEvent) {
    emit('tab-click', key, e)
  }

  function getEnabledKeys(list: Tab[]) {
    return list.filter(t => !t.disabled).map(t => t.key)
  }

  function onItemBlur() {
    focusKey.value = undefined
  }

  function onTabFocus(key: string) {
    if (!isMouse.value) {
      focusKey.value = key
    }
    scrollToTab(key)
    doLockAnimation()
    const wrap = tabsWrapperRef.value
    if (!wrap) return
    if (!props.rtl) wrap.scrollLeft = 0
    wrap.scrollTop = 0
  }

  const activeTabOffset = computed(() => tabOffsets.value.get(props.activeKey)!)

  const inkStyle = useIndicator({
    activeTabOffset,
    horizontal: isHorizontal,
    indicator: computed(() => props.indicator),
    rtl: computed(() => props.rtl),
  })

  // ===================== Measure =====================
  function getTabSize(
    tab: HTMLElement,
    containerRect: { left: number; top: number },
  ) {
    const { offsetWidth, offsetHeight, offsetTop, offsetLeft } = tab
    const { width, height, left, top } = tab.getBoundingClientRect()
    if (Math.abs(width - offsetWidth) < 1)
      return [width, height, left - containerRect.left, top - containerRect.top]
    return [offsetWidth, offsetHeight, offsetLeft, offsetTop]
  }

  function getSize(refObj: Ref<HTMLElement | null>) {
    const el = refObj.value
    const { offsetWidth = 0, offsetHeight = 0 } = el || {}
    if (el) {
      const { width, height } = el.getBoundingClientRect()
      if (Math.abs(width - offsetWidth) < 1) return [width, height]
    }
    return [offsetWidth, offsetHeight]
  }

  function updateTabSizes() {
    tabSizes.value = (() => {
      const newSizes = new Map<
        string,
        { width: number; height: number; left: number; top: number }
      >()
      const listRect = tabListRef.value?.getBoundingClientRect?.()
      tabs.value.forEach(({ key }) => {
        const listEl = tabListRef.value
        const btnNode = listEl?.querySelector?.(
          `[data-node-key="${genDataNodeKey(key)}"]`,
        ) as HTMLElement | null
        if (btnNode && listRect) {
          const [width, height, left, top] = getTabSize(
            btnNode,
            listRect as any,
          )
          newSizes.set(key, { width, height, left, top })
        }
      })
      return newSizes
    })()
  }

  function onListHolderResize() {
    const containerSize = getSize(containerRef)
    const extraLeftEl = (extraLeftRef.value as any)
      ?.extraContentRef as HTMLElement | null
    const extraRightEl = (extraRightRef.value as any)
      ?.extraContentRef as HTMLElement | null
    const extraLeftSize = extraLeftEl
      ? getSize({ value: extraLeftEl } as any)
      : [0, 0]
    const extraRightSize = extraRightEl
      ? getSize({ value: extraRightEl } as any)
      : [0, 0]
    containerExcludeExtraSize.value = [
      containerSize[0] - extraLeftSize[0] - extraRightSize[0],
      containerSize[1] - extraLeftSize[1] - extraRightSize[1],
    ]

    const opEl = operationsRef.value?.operationNodeRef as HTMLElement | null
    operationSize.value = opEl
      ? (getSize({ value: opEl } as any) as any)
      : [0, 0]

    const tabListEl = tabListRef.value
    const tabContentFullSize = tabListEl
      ? getSize({ value: tabListEl } as any)
      : [0, 0]
    const addEl = (innerAddButtonRef.value as any)
      ?.buttonRef as HTMLElement | null
    addSize.value = addEl ? (getSize({ value: addEl } as any) as any) : [0, 0]
    tabContentSize.value = [
      tabContentFullSize[0] - addSize.value[0],
      tabContentFullSize[1] - addSize.value[1],
    ]

    updateTabSizes()
  }

  watch(
    () => tabs.value.map(t => t.key).join('_'),
    () => {
      nextTick(() => {
        updateTabSizes()
      })
    },
  )

  watch(
    [
      computed(() => props.activeKey),
      () => transformComputed.value.transformMin,
      () => transformComputed.value.transformMax,
      visibleTabContentValue,
      tabOffsets,
    ],
    () => {
      scrollToTab()
    },
  )

  watch(
    computed(() => props.rtl),
    () => {
      onListHolderResize()
    },
  )

  const enabledCount = computed(
    () => tabs.value.filter(t => !t.disabled).length,
  )
</script>

<template>
  <ResizeObserver @resize="onListHolderResize">
    <div
      ref="containerRef"
      :class="navClass"
      :style="navStyle"
      role="tablist"
      :aria-orientation="isHorizontal ? 'horizontal' : 'vertical'"
      @keydown="doLockAnimation"
    >
      <ExtraContent
        ref="extraLeftRef"
        position="left"
        :prefix-cls="prefixCls"
        :extra="extra"
      />

      <ResizeObserver @resize="onListHolderResize">
        <div
          ref="tabsWrapperRef"
          :class="[
            wrapPrefix,
            {
              [`${wrapPrefix}-ping-left`]: pingLeft,
              [`${wrapPrefix}-ping-right`]: pingRight,
              [`${wrapPrefix}-ping-top`]: pingTop,
              [`${wrapPrefix}-ping-bottom`]: pingBottom,
            },
          ]"
        >
          <ResizeObserver @resize="onListHolderResize">
            <div
              ref="tabListRef"
              :class="navListClass"
              :style="{
                transform: `translate(${transformLeft}px, ${transformTop}px)`,
                transition: lockAnimation ? 'none' : undefined,
              }"
            >
              <template v-for="(tab, i) in tabs">
                <TabNode
                  :key="tab.key"
                  :id="id"
                  :prefix-cls="prefixCls"
                  :tab="tab"
                  :active="tab.key === activeKey"
                  :focus="tab.key === focusKey"
                  :closable="tab.closable"
                  :editable="editable"
                  :remove-aria-label="locale?.removeAriaLabel"
                  :tab-count="enabledCount"
                  :current-position="i + 1"
                  :class-name="classNames?.item"
                  :style="
                    i === 0
                      ? undefined
                      : isHorizontal
                        ? { marginInlineStart: tabBarGutter }
                        : { marginTop: tabBarGutter }
                  "
                  :class-names="{
                    item: classNames?.item,
                    remove: classNames?.remove,
                  }"
                  :styles="{ item: styles?.item, remove: styles?.remove }"
                  @click="e => onItemClick(tab.key, e)"
                  @keydown="handleKeyDown"
                  @focus="() => onTabFocus(tab.key)"
                  @blur="onItemBlur"
                  @mousedown="e => handleMouseDown(tab.key, e)"
                  @mouseup="isMouse = false"
                  @remove-tab="(key, e) => handleRemoveTab(key, e)"
                />
              </template>

              <AddButton
                ref="innerAddButtonRef"
                :prefix-cls="prefixCls"
                :locale="locale"
                :editable="editable"
                :style="
                  {
                    ...(tabs.length === 0
                      ? {}
                      : isHorizontal
                        ? { marginInlineStart: tabBarGutter }
                        : { marginTop: tabBarGutter }),
                    visibility: hasDropdown ? 'hidden' : null,
                  } as CSSProperties
                "
              />

              <div
                :class="[
                  `${prefixCls}-ink-bar`,
                  classNames?.indicator,
                  { [`${prefixCls}-ink-bar-animated`]: animated?.inkBar },
                ]"
                :style="{ ...(styles?.indicator || {}), ...inkStyle }"
              />
            </div>
          </ResizeObserver>
        </div>
      </ResizeObserver>

      <OperationNode
        ref="operationsRef"
        :remove-aria-label="locale?.removeAriaLabel"
        :prefix-cls="prefixCls"
        :tabs="hiddenTabs"
        :class-name="[
          classNames?.operations,
          !hasDropdown ? `${prefixCls}-nav-operations-hidden` : undefined,
        ]"
        :popup-style="styles?.popup"
        :tab-moving="!!lockAnimation"
        :class-names="{ remove: classNames?.remove }"
        :styles="{ remove: styles?.remove }"
        :id="id"
        :rtl="rtl"
        :tab-bar-gutter="props.tabBarGutter"
        :active-key="activeKey"
        :mobile="mobile"
        :more="more"
        :editable="editable"
        :locale="locale"
        :get-popup-container="getPopupContainer"
        :popup-class-name="popupClassName"
        @tab-click="onItemClick"
      />

      <ExtraContent
        ref="extraRightRef"
        position="right"
        :prefix-cls="prefixCls"
        :extra="extra"
      />
    </div>
  </ResizeObserver>
</template>
