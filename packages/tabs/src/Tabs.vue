<script setup vapor lang="ts">
  import type { Ref } from 'vue'

  import type { TabsProps } from './interface'

  import { clsx } from '@v-c/util'
  import useMergedState from '@v-c/util/dist/hooks/useMergedState'
  import isMobile from '@v-c/util/dist/isMobile'
  import omit from '@v-c/util/dist/omit'
  import {
    computed,
    nextTick,
    onMounted,
    ref,
    toRef,
    useAttrs,
    watch,
  } from 'vue'

  import useAnimateConfig from './hooks/useAnimateConfig'
  import { provideTabContext } from './TabContext'
  import TabNavListWrapper from './TabNavList/Wrapper.vue'
  import TabPanelList from './TabPanelList/index.vue'
  import { getUUid, setUUid } from './utils'

  defineOptions({ name: 'VcTabs', inheritAttrs: false })

  const props = withDefaults(defineProps<TabsProps>(), {
    prefixCls: 'vc-tabs',
    tabPosition: 'top',
    animated: undefined,
    destroyOnHidden: undefined,
  })

  const emit = defineEmits<{
    change: [activeKey: string]
    'tab-click': [activeKey: string, e: MouseEvent | KeyboardEvent]
    'tab-scroll': [info: { direction: 'left' | 'right' | 'top' | 'bottom' }]
    'update:active-key': [activeKey: string]
  }>()

  const attrs = useAttrs()

  const restAttrs = computed(() =>
    omit(attrs as Record<string, any>, ['class', 'style', 'default']),
  )

  const tabs = computed(() =>
    (props.items || []).filter(
      item => item && typeof item === 'object' && 'key' in item,
    ),
  )

  const rtl = computed(() => props.direction === 'rtl')

  // ====================== Animated ======================
  const mergedAnimated = computed(() => useAnimateConfig(props.animated))

  // ======================== Mobile ========================
  const mobile = ref(false)
  onMounted(() => {
    mobile.value = isMobile()
  })

  // ====================== Active Key ======================
  const defaultKey = computed(
    () => props.defaultActiveKey ?? tabs.value[0]?.key,
  )

  const [mergedActiveKey, setMergedActiveKey] = useMergedState<
    string,
    Ref<string | undefined>
  >(props.activeKey ?? defaultKey.value, {
    value: toRef(props, 'activeKey') as Ref<string>,
    onChange: v => emit('update:active-key', v),
  })

  const activeIndex = ref(
    tabs.value.findIndex(item => item.key === mergedActiveKey.value),
  )

  const tabKeyStr = computed(() => tabs.value.map(tab => tab.key).join('_'))

  watch(
    [tabKeyStr, mergedActiveKey, activeIndex],
    async () => {
      await nextTick()
      activeIndex.value = tabs.value.findIndex(
        item => item.key === mergedActiveKey.value,
      )
      let newActiveIndex = tabs.value.findIndex(
        tab => tab.key === mergedActiveKey.value,
      )
      if (newActiveIndex === -1) {
        newActiveIndex = Math.max(
          0,
          Math.min(activeIndex.value, tabs.value.length - 1),
        )
        setMergedActiveKey(tabs.value[newActiveIndex]?.key)
      }
      activeIndex.value = newActiveIndex
    },
    { immediate: true },
  )

  // ===================== Accessibility ====================
  const [mergedId, setMergedId] = useMergedState<
    string | null,
    Ref<string | null | undefined>
  >(null, {
    value: toRef(props, 'id') as Ref<string | null>,
  })

  onMounted(() => {
    const uuid = getUUid()
    setMergedId(`vc-tabs-${process.env.NODE_ENV === 'test' ? 'test' : uuid}`)
    setUUid(uuid + 1)
  })

  // ======================== Events ========================
  function onInternalTabClick(key: string, e: MouseEvent | KeyboardEvent) {
    emit('tab-click', key, e)
    const isActiveChanged = key !== mergedActiveKey.value
    setMergedActiveKey(key)
    if (isActiveChanged) {
      emit('change', key)
    }
  }

  function onTabScroll(info: {
    direction: 'left' | 'right' | 'top' | 'bottom'
  }) {
    emit('tab-scroll', info)
  }

  function onEdit(
    type: 'add' | 'remove',
    info: { key?: string; event: MouseEvent | KeyboardEvent },
  ) {
    props.editable?.onEdit?.(type, info)
  }

  // ======================== Render ========================
  const sharedProps = computed(() => ({
    id: mergedId.value as string,
    activeKey: mergedActiveKey.value,
    animated: mergedAnimated.value,
    tabPosition: props.tabPosition,
    rtl: rtl.value,
    mobile: mobile.value,
  }))

  const tabNavBarProps = computed(() => {
    const mergedStyles = props.styles
      ? {
          ...props.styles,
          header: { ...(props.styles.header || {}), ...props.tabBarStyle },
        }
      : props.tabBarStyle
        ? { header: props.tabBarStyle }
        : undefined

    return {
      ...sharedProps.value,
      editable: props.editable,
      locale: props.locale,
      more: props.more,
      tabBarGutter: props.tabBarGutter,
      extra: props.tabBarExtraContent,
      getPopupContainer: props.getPopupContainer,
      popupClassName: clsx([props.popupClassName, props.classNames?.popup]),
      indicator: props.indicator,
      styles: mergedStyles,
      classNames: props.classNames,
    }
  })

  const memoizedValue = computed(() => ({
    tabs: tabs.value,
    prefixCls: props.prefixCls,
  }))

  provideTabContext(memoizedValue)

  // ======================== Root element ========================
  const nodeCls = computed(() =>
    clsx(
      props.prefixCls,
      `${props.prefixCls}-${props.tabPosition}`,
      {
        [`${props.prefixCls}-mobile`]: mobile.value,
        [`${props.prefixCls}-editable`]: !!props.editable,
        [`${props.prefixCls}-rtl`]: rtl.value,
      },
      attrs.class,
    ),
  )

  const nodeStyle = computed(() => {
    const result: Record<string, any> = {}
    const parentStyle = attrs.style as Record<string, any> | undefined
    if (
      parentStyle &&
      typeof parentStyle === 'object' &&
      !Array.isArray(parentStyle)
    ) {
      for (const key in parentStyle) {
        result[key] = parentStyle[key]
      }
    }
    return result
  })
</script>

<template>
  <div :id="mergedId!" :class="nodeCls" :style="nodeStyle" v-bind="restAttrs">
    <TabNavListWrapper
      v-bind="tabNavBarProps"
      @tab-click="onInternalTabClick"
      @tab-scroll="onTabScroll"
      @edit="onEdit"
    />
    <TabPanelList
      :id="sharedProps.id"
      :active-key="sharedProps.activeKey"
      :tab-position="sharedProps.tabPosition"
      :destroy-on-hidden="destroyOnHidden"
      :body-style="styles?.body"
      :body-class-name="classNames?.body"
      :content-style="styles?.content"
      :content-class-name="classNames?.content"
      :animated="mergedAnimated"
    />
  </div>
</template>
