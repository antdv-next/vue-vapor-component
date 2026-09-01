<script setup vapor lang="ts">
  import type { SubMenuProps } from '../SubMenuProps'

  import { clsx } from '@v-c/util'
  import Trigger from '@vapor-component/trigger'
  import { computed, onMounted, onUnmounted, shallowRef } from 'vue'

  import useActive from '../hooks/useActive'
  import useDirectionStyle from '../hooks/useDirectionStyle'
  import useMemoCallback from '../hooks/useMemoCallback'
  import Icon from '../Icon.vue'
  import { useMenuId } from '../IdContextKey'
  import { useMenuContext, useMenuContextProvider } from '../MenuContextKey'
  import MenuContextProvider from '../MenuContextProvider.vue'
  import {
    useFullPath,
    useMeasure,
    usePathTrackerProvider,
  } from '../PathContextKey'
  import { usePathUserContext } from '../PathContextKey'
  import { usePrivateContext } from '../PrivateContextKey'
  import { warnItemProp } from '../utils/warnUtil'
  import SubMenuList from './SubMenuList.vue'
  import defaultPlacements from '../placements'

  defineOptions({ name: 'VcSubMenu', inheritAttrs: false })

  const props = withDefaults(defineProps<SubMenuProps>(), {
    disabled: false,
  })

  const emit = defineEmits<{
    'mouse-enter': [info: { key: string; domEvent: MouseEvent }]
    'mouse-leave': [info: { key: string; domEvent: MouseEvent }]
    'title-click': [info: { key: string; domEvent: MouseEvent }]
    click: [info: any]
  }>()

  // ===================== Context =====================
  const menuContext = useMenuContext()
  const measure = useMeasure()
  const pathUserContext = usePathUserContext()
  usePrivateContext()

  // ===================== Key Path =====================
  const eventKeyRef = computed(() => props.eventKey || '')
  const connectedKeyPath = useFullPath(eventKeyRef)
  const validKeyPath = computed(() =>
    connectedKeyPath.value.filter((k): k is string => k !== undefined),
  )

  usePathTrackerProvider(connectedKeyPath)

  // ===================== Path Registration =====================
  onMounted(() => {
    measure?.value?.registerPath(eventKeyRef.value, validKeyPath.value)
  })
  onUnmounted(() => {
    measure?.value?.unregisterPath(eventKeyRef.value, validKeyPath.value)
  })

  // ===================== ID =====================
  const domDataId = useMenuId(eventKeyRef)
  const popupId = computed(() => `${domDataId.value}-popup`)

  // ===================== State =====================
  const prefixCls = computed(() => menuContext?.value?.prefixCls || 'vc-menu')
  const mode = computed(() => menuContext?.value?.mode || 'vertical')
  const isInlineMode = computed(() => mode.value === 'inline')
  const openKeys = computed(() => menuContext?.value?.openKeys || [])
  const contextDisabled = computed(() => menuContext?.value?.disabled)
  const activeKey = computed(() => menuContext?.value?.activeKey)
  const selectedKeys = computed(() => menuContext?.value?.selectedKeys || [])
  const contextExpandIcon = computed(() => menuContext?.value?.expandIcon)
  const contextPopupRender = computed(() => menuContext?.value?.popupRender)
  const triggerSubMenuAction = computed(
    () => menuContext?.value?.triggerSubMenuAction || 'hover',
  )
  const subMenuPrefixCls = computed(() => `${prefixCls.value}-submenu`)
  const mergedDisabled = computed(
    () => !!(contextDisabled.value || props.disabled),
  )

  // ===================== Open =====================
  const originOpen = computed(() => {
    const key = props.eventKey
    return key ? openKeys.value.includes(key) : false
  })
  const mergedOpen = computed(() => originOpen.value)

  // ===================== Selection =====================
  const childrenSelected = computed(() => {
    const key = props.eventKey
    return key ? pathUserContext.value.isSubPathKey(selectedKeys.value, key) : false
  })

  // ===================== Active =====================
  const {
    active,
    onMouseEnter: activeOnMouseEnter,
    onMouseLeave: activeOnMouseLeave,
  } = useActive(
    eventKeyRef,
    mergedDisabled,
    info => emit('mouse-enter', info),
    info => emit('mouse-leave', info),
  )

  const childrenActive = shallowRef(false)

  const mergedActive = computed(() => {
    if (active.value) return true
    if (mode.value === 'inline') return false
    const key = props.eventKey
    const currentActiveKey = activeKey.value
    if (!key || !currentActiveKey) return childrenActive.value
    return (
      childrenActive.value ||
      pathUserContext.value.isSubPathKey([currentActiveKey], key)
    )
  })

  // ===================== Direction Style =====================
  const pathLength = computed(() => validKeyPath.value.length)
  const directionStyle = useDirectionStyle(pathLength)

  // ===================== Icons =====================
  const mergedItemIcon = computed(
    () => props.itemIcon ?? menuContext?.value?.itemIcon,
  )
  const mergedExpandIcon = computed(
    () => props.expandIcon ?? contextExpandIcon.value,
  )

  // ===================== Events =====================
  const onInternalTitleClick = (e: MouseEvent) => {
    if (mergedDisabled.value) return
    const key = props.eventKey
    if (key) {
      emit('title-click', { key, domEvent: e })
    }
    if (isInlineMode.value && key) {
      menuContext?.value?.onOpenChange?.(key, !originOpen.value)
    }
  }

  const onInternalMouseEnter = (e: MouseEvent) => {
    childrenActive.value = true
    activeOnMouseEnter?.(e)
  }
  const onInternalMouseLeave = (e: MouseEvent) => {
    childrenActive.value = false
    activeOnMouseLeave?.(e)
  }

  const onMergedItemClick = useMemoCallback((info: any) => {
    emit('click', warnItemProp(info))
    menuContext?.value?.onItemClick?.(info)
  })

  const onPopupVisibleChange = (visible: boolean) => {
    const key = props.eventKey
    if (!isInlineMode.value && key) {
      menuContext?.value?.onOpenChange?.(key, visible)
    }
  }

  const onInternalFocus = () => {
    const key = props.eventKey
    if (key) {
      menuContext?.value?.onActive?.(key)
    }
  }

  // ===================== Child Context =====================
  const childMode = computed(() =>
    mode.value === 'horizontal' ? 'vertical' : mode.value,
  )

  const childContext = computed(() => ({
    prefixCls: prefixCls.value,
    classes: props.classes,
    styles: props.styles,
    mode: childMode.value,
    openKeys: openKeys.value,
    rtl: menuContext?.value?.rtl,
    disabled: contextDisabled.value,
    activeKey: activeKey.value,
    onActive: menuContext?.value?.onActive,
    onInactive: menuContext?.value?.onInactive,
    selectedKeys: selectedKeys.value,
    inlineIndent: menuContext?.value?.inlineIndent || 24,
    motion: menuContext?.value?.motion,
    defaultMotions: menuContext?.value?.defaultMotions,
    subMenuOpenDelay: menuContext?.value?.subMenuOpenDelay ?? 0,
    subMenuCloseDelay: menuContext?.value?.subMenuCloseDelay ?? 0.1,
    forceSubMenuRender: menuContext?.value?.forceSubMenuRender,
    builtinPlacements: menuContext?.value?.builtinPlacements,
    triggerSubMenuAction: triggerSubMenuAction.value,
    getPopupContainer: menuContext?.value?.getPopupContainer,
    onItemClick: onMergedItemClick,
    onOpenChange: menuContext?.value?.onOpenChange,
    popupRender: contextPopupRender.value,
    itemIcon: mergedItemIcon.value,
    expandIcon: mergedExpandIcon.value,
  }))

  useMenuContextProvider(childContext)

  // ===================== Popup Render =====================
  const popupRender = computed(
    () => props.popupRender || contextPopupRender.value,
  )

  // ===================== Popup Placement =====================
  const popupPlacement = computed(() => {
    if (mode.value === 'horizontal') return 'bottomLeft'
    return 'rightTop'
  })

  // ===================== Class =====================
  const listCls = computed(() =>
    clsx(
      subMenuPrefixCls.value,
      `${subMenuPrefixCls.value}-${mode.value}`,
      {
        [`${subMenuPrefixCls.value}-open`]: mergedOpen.value,
        [`${subMenuPrefixCls.value}-active`]: mergedActive.value,
        [`${subMenuPrefixCls.value}-selected`]: childrenSelected.value,
        [`${subMenuPrefixCls.value}-disabled`]: mergedDisabled.value,
      },
      props.class,
    ),
  )

  const titleCls = computed(() =>
    clsx(`${subMenuPrefixCls.value}-title`, props.classes?.listTitle),
  )

  const expandIconProps = computed(() => ({
    isOpen: mergedOpen.value,
    isSelected: childrenSelected.value,
    isSubMenu: true,
    disabled: mergedDisabled.value,
  }))
</script>

<template>
  <li
    :class="listCls"
    :style="props.style"
    role="none"
    @mouseenter="onInternalMouseEnter"
    @mouseleave="onInternalMouseLeave"
  >
    <!-- Non-inline mode: use Trigger for popup -->
    <template v-if="!isInlineMode">
      <Trigger
        :prefix-cls="subMenuPrefixCls"
        :popup-class-name="
          clsx(`${subMenuPrefixCls}-popup`, props.popupClassName)
        "
        :popup-style="props.popupStyle"
        :popup-placement="popupPlacement"
        :popup-visible="mergedOpen"
        :builtin-placements="
          menuContext?.value?.builtinPlacements ?? defaultPlacements
        "
        :popup-align="
          props.popupOffset ? { offset: props.popupOffset } : undefined
        "
        :action="mergedDisabled ? [] : [triggerSubMenuAction]"
        :mouse-enter-delay="menuContext?.value?.subMenuOpenDelay"
        :mouse-leave-delay="menuContext?.value?.subMenuCloseDelay"
        :force-render="menuContext?.value?.forceSubMenuRender"
        :get-popup-container="
          menuContext?.value?.getPopupContainer || (() => document.body)
        "
        @open-change="onPopupVisibleChange"
      >
        <template #default="{ trigger: triggerProps, setRef }">
          <div
            :ref="setRef"
            v-bind="triggerProps"
            :class="titleCls"
            :style="directionStyle"
            role="menuitem"
            :tabindex="mergedDisabled ? undefined : -1"
            :title="
              props.itemTitle ??
              (typeof props.title === 'string' ? props.title : undefined)
            "
            :data-menu-id="domDataId"
            :aria-expanded="mergedOpen"
            aria-haspopup
            :aria-controls="popupId"
            :aria-disabled="mergedDisabled"
            @click="onInternalTitleClick"
            @focus="onInternalFocus"
          >
            <slot>{{ props.title }}</slot>
            <Icon :icon="mergedExpandIcon" :props="expandIconProps">
              <i :class="`${subMenuPrefixCls}-arrow`" />
            </Icon>
          </div>
        </template>
        <template #popup>
          <MenuContextProvider
            :value="{
              ...childContext,
              mode: childMode,
            }"
          >
            <SubMenuList :id="popupId">
              <slot name="items" />
            </SubMenuList>
          </MenuContextProvider>
        </template>
      </Trigger>
    </template>

    <!-- Inline mode: direct list -->
    <template v-else>
      <div
        :class="titleCls"
        :style="directionStyle"
        role="menuitem"
        :tabindex="mergedDisabled ? undefined : -1"
        :title="
          props.itemTitle ??
          (typeof props.title === 'string' ? props.title : undefined)
        "
        :data-menu-id="domDataId"
        :aria-expanded="mergedOpen"
        aria-haspopup
        :aria-controls="popupId"
        :aria-disabled="mergedDisabled"
        @click="onInternalTitleClick"
        @focus="onInternalFocus"
        @mouseenter="onInternalMouseEnter"
        @mouseleave="onInternalMouseLeave"
      >
        <slot>{{ props.title }}</slot>
        <Icon :icon="mergedExpandIcon" :props="expandIconProps">
          <i :class="`${subMenuPrefixCls}-arrow`" />
        </Icon>
      </div>
      <SubMenuList :id="popupId" v-show="mergedOpen">
        <slot name="items" />
      </SubMenuList>
    </template>
  </li>
</template>
