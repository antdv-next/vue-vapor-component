<script setup vapor lang="ts">
  import type { MenuItemProps } from './MenuItemProps'

  import { clsx } from '@v-c/util'
  import KeyCode from '@v-c/util/dist/KeyCode'
  import { computed, shallowRef, watch } from 'vue'

  import useActive from './hooks/useActive'
  import useDirectionStyle from './hooks/useDirectionStyle'
  import Icon from './Icon.vue'
  import { useMenuId } from './IdContextKey'
  import { useMenuContext } from './MenuContextKey'
  import { useFullPath, useMeasure } from './PathContextKey'
  import { usePrivateContext } from './PrivateContextKey'
  import { warnItemProp } from './utils/warnUtil'

  defineOptions({ name: 'VcMenuItem', inheritAttrs: false })

  const props = defineProps<MenuItemProps>()

  const emit = defineEmits<{
    click: [info: any]
    keydown: [e: KeyboardEvent]
    focus: [e: FocusEvent]
    'mouse-enter': [info: { key: string; domEvent: MouseEvent }]
    'mouse-leave': [info: { key: string; domEvent: MouseEvent }]
  }>()

  const eventKey = computed(() => props.eventKey || '')
  const domDataId = useMenuId(eventKey)
  const menuContext = useMenuContext()
  const privateContext = usePrivateContext()
  const connectedKeys = useFullPath(eventKey)
  const measure = useMeasure()
  const elementRef = shallowRef<HTMLLIElement>()

  const mergedDisabled = computed(
    () => props.disabled ?? menuContext?.value?.disabled ?? false,
  )

  // Path registration
  watch(
    [connectedKeys],
    (_n, _o, onCleanup) => {
      if (measure?.value) {
        measure.value.registerPath(eventKey.value!, connectedKeys.value)
      }
      onCleanup(() => {
        measure?.value?.unregisterPath(eventKey.value!, connectedKeys.value)
      })
    },
    { immediate: true },
  )

  if (process.env.NODE_ENV !== 'production' && props.warnKey) {
    console.warn('MenuItem should not leave undefined `key`.')
  }

  const getEventInfo = (e: MouseEvent | KeyboardEvent) => {
    const itemData = props.itemData || {
      key: eventKey.value,
      itemIcon: props.itemIcon,
      extra: props.extra,
    }
    return {
      key: eventKey.value,
      keyPath: connectedKeys.value,
      item: elementRef.value,
      domEvent: e,
      itemData,
    }
  }

  const ret = useActive(
    eventKey,
    mergedDisabled,
    (info: { key: string; domEvent: MouseEvent }) => emit('mouse-enter', info),
    (info: { key: string; domEvent: MouseEvent }) => emit('mouse-leave', info),
  )
  const active = ret.active

  const selected = computed(
    () => menuContext?.value?.selectedKeys?.includes(eventKey.value) ?? false,
  )

  const directionStyle = useDirectionStyle(
    computed(() => connectedKeys.value.length),
  )

  const itemCls = computed(
    () => `${menuContext?.value?.prefixCls || 'vc-menu'}-item`,
  )

  const mergedItemIcon = computed(
    () => props.itemIcon ?? menuContext?.value?.itemIcon,
  )

  const nodeCls = computed(() =>
    clsx(
      itemCls.value,
      {
        [`${itemCls.value}-active`]: active.value,
        [`${itemCls.value}-selected`]: selected.value,
        [`${itemCls.value}-disabled`]: mergedDisabled.value,
      },
      props.class,
    ),
  )

  const onInternalClick = (e: MouseEvent) => {
    if (mergedDisabled.value) return
    const info = getEventInfo(e)
    emit('click', warnItemProp(info))
    menuContext?.value?.onItemClick?.(info)
  }

  const onInternalKeyDown = (e: KeyboardEvent) => {
    emit('keydown', e)
    if ((e as any).which === KeyCode.ENTER) {
      const info = getEventInfo(e)
      emit('click', warnItemProp(info))
      menuContext?.value?.onItemClick?.(info)
    }
  }

  const onInternalFocus = (e: FocusEvent) => {
    menuContext?.value?.onActive?.(eventKey.value)
    emit('focus', e)
  }

  const optionRoleProps = computed(() => {
    if (props.role === 'option') {
      return { 'aria-selected': selected.value }
    }
    return {}
  })
</script>

<template>
  <li
    v-if="!measure?.value"
    ref="elementRef"
    :role="props.role === null ? 'none' : props.role || 'menuitem'"
    :tabindex="mergedDisabled ? null : -1"
    :data-menu-id="domDataId"
    :class="nodeCls"
    :style="directionStyle"
    :aria-disabled="mergedDisabled"
    v-bind="optionRoleProps"
    @click="onInternalClick"
    @keydown="onInternalKeyDown"
    @focus="onInternalFocus"
    @mouseenter="ret.onMouseEnter?.($event)"
    @mouseleave="ret.onMouseLeave?.($event)"
  >
    <slot />
    <Icon :icon="mergedItemIcon" :props="{ ...props, isSelected: selected }" />
  </li>
</template>
