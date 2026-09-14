<script lang="ts">
import type { AlignType, BuildInPlacements } from '@vapor-component/trigger'
import type { CSSProperties } from 'vue'

/**
 * The `<Trigger>` placements used when the consumer does not provide their own.
 * Picker popups are anchored 4px away from the selector, unlike the generic
 * trigger default of 8px.
 * 未自定义时 `<Trigger>` 使用的 placement。Picker 的弹层距选择器 4px，
 * 与通用 trigger 的 8px 默认值不同。
 */
export const BUILT_IN_PLACEMENTS: BuildInPlacements = {
  bottomLeft: {
    points: ['tl', 'bl'],
    offset: [0, 4],
    overflow: {
      adjustX: 1,
      adjustY: 1,
    },
  },
  bottomRight: {
    points: ['tr', 'br'],
    offset: [0, 4],
    overflow: {
      adjustX: 1,
      adjustY: 1,
    },
  },
  topLeft: {
    points: ['bl', 'tl'],
    offset: [0, -4],
    overflow: {
      adjustX: 0,
      adjustY: 1,
    },
  },
  topRight: {
    points: ['br', 'tr'],
    offset: [0, -4],
    overflow: {
      adjustX: 0,
      adjustY: 1,
    },
  },
}
</script>

<script setup vapor lang="ts">
import type { ActionType } from '@vapor-component/trigger'
import Trigger from '@vapor-component/trigger'
import { clsx } from '@v-c/util'
import { computed } from 'vue'
import { usePickerContext } from '../PickerInput/context'
import { getRealPlacement } from '../utils/uiUtil'

defineOptions({ name: 'PickerTrigger', inheritAttrs: false })

const props = defineProps<{
  popupStyle?: CSSProperties
  transitionName?: string
  getPopupContainer?: (node: HTMLElement) => HTMLElement
  popupAlign?: AlignType
  range?: boolean
  popupClassName?: string
  placement?: string
  builtinPlacements?: BuildInPlacements
  direction?: 'ltr' | 'rtl'
  visible?: boolean
  onClose?: () => void
}>()

const ctx = usePickerContext()
const prefixCls = computed(() => ctx.value.prefixCls || 'vc-picker')
const dropdownPrefixCls = computed(() => `${prefixCls.value}-dropdown`)

const rtl = computed(() => props.direction === 'rtl')
const realPlacement = computed(() => getRealPlacement(props.placement, rtl.value))

// `||` rather than `??`: vapor may coerce an absent non-boolean prop to
// `false`, which would silently defeat the fallback (skill rule 12).
// `builtinPlacements` 是可选非布尔 prop；vapor 可能把缺省值强制转为 `false`，
// 因此用 `||` 而不是 `??`（规则 12）。
const builtinPlacements = computed(() => props.builtinPlacements || BUILT_IN_PLACEMENTS)

const popupMotion = computed(() =>
  props.transitionName ? { motionName: props.transitionName } : undefined,
)

const popupCls = computed(() =>
  clsx(props.popupClassName, {
    [`${dropdownPrefixCls.value}-range`]: props.range,
    [`${dropdownPrefixCls.value}-rtl`]: rtl.value,
  }),
)

// Only a strong transition actively opens the popup; a plain transition would
// also let an outside click close it, which the selector handles itself.
// 仅显式声明关闭动作；selector 自身负责打开，因此不传 `showAction`。
const hideAction: ActionType[] = ['click']

const onVisibleChange = (nextVisible: boolean) => {
  if (!nextVisible) props.onClose?.()
}
</script>

<template>
  <Trigger
    :show-action="[]"
    :hide-action="hideAction"
    :popup-placement="realPlacement"
    :builtin-placements="builtinPlacements"
    :prefix-cls="dropdownPrefixCls"
    :popup-motion="popupMotion"
    :popup-align="popupAlign"
    :popup-visible="visible"
    :popup-class-name="popupCls"
    :popup-style="popupStyle"
    stretch="minWidth"
    :get-popup-container="getPopupContainer"
    @open-change="onVisibleChange"
  >
    <template #default="{ trigger, setRef }">
      <slot v-bind="{ trigger, setRef }" />
    </template>
    <template #popup>
      <slot name="popup" />
    </template>
  </Trigger>
</template>
