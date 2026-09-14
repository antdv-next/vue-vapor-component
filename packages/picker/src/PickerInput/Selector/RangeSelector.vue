<script lang="ts">
import type { VueNode } from '@v-c/util/dist/type'
import type { SelectorProps } from '../../interface'
import type { SelectorIdType } from '../interface'

export interface RangeSelectorProps<DateType = any> extends SelectorProps<DateType> {
  id?: SelectorIdType
  activeIndex: number | null
  separator?: VueNode
  value?: [DateType?, DateType?]
  onChange: (date: DateType, index?: number) => void
  disabled: [boolean, boolean]
  allHelp: boolean
  placeholder?: string | [string, string]
  invalid: [boolean, boolean]
  placement?: string
  onMouseDown?: (e: MouseEvent) => void
  autoFocus?: boolean
  tabIndex?: number | string
  onActiveInfo: (
    info: [activeInputLeft: number, activeInputRight: number, selectorWidth: number],
  ) => void

  // Injected by `PickerTrigger` so the root element is registered as the
  // trigger target and receives its action handlers.
  // 由 `PickerTrigger` 注入，用于把根元素注册为 trigger target 并接收其
  // action 处理器。
  setRef?: (el: HTMLElement | null) => void
  triggerProps?: Record<string, any>
}
</script>

<script setup vapor lang="ts">
import type { InputRef } from './interface'
import ResizeObserver from '@vapor-component/resize-observer'
import { clsx } from '@v-c/util'
import { computed, ref, useAttrs, useTemplateRef, watch } from 'vue'

import { cloneProps } from '../../utils/miscUtil'
import { usePickerContext } from '../context'
import ClearIcon from './ClearIcon.vue'
import useInputProps from './hooks/useInputHooks'
import useRootProps from './hooks/useRootProps'
import Icon from './Icon.vue'
import Input from './Input.vue'

defineOptions({ name: 'RangeSelector', inheritAttrs: false })

const props = defineProps<RangeSelectorProps>()
const attrs = useAttrs()

const pickerContext = usePickerContext()
const prefixCls = computed(() => pickerContext.value.prefixCls || 'vc-picker')
const styles = computed(() => pickerContext.value.styles)

const rtl = computed(() => props.direction === 'rtl')

// ========================== Id ==========================
const ids = computed(() => {
  if (typeof props.id === 'string') {
    return [props.id]
  }
  const mergedId = props.id || {}
  return [mergedId.start, mergedId.end]
})

// ========================= Refs =========================
const rootRef = useTemplateRef<HTMLDivElement>('root')
const inputStartRef = useTemplateRef<InputRef>('inputStart')
const inputEndRef = useTemplateRef<InputRef>('inputEnd')

const getInput = (index: number) => [inputStartRef, inputEndRef][index]?.value

// Getter: a vapor `defineExpose` does not unwrap refs, so the owner
// (`RangePicker.vue` / `useFocusLock`) would read a `Ref` instead of the element.
// getter 形式：vapor 的 `defineExpose` 不会解包 ref，否则外层拿到的是 `Ref`
// 而不是 DOM 元素。
defineExpose({
  get nativeElement() {
    return rootRef.value
  },
  // Exposed so `useFocusLock` can compare the actually focused element against
  // each field and pull focus back to the expected one.
  // 暴露给 `useFocusLock`，用于比较实际聚焦元素并把焦点拉回预期 field。
  get startInput() {
    return inputStartRef.value?.inputElement?.value
  },
  get endInput() {
    return inputEndRef.value?.inputElement?.value
  },
  focus: (options?: any) => {
    if (typeof options === 'object' && options !== null) {
      const { index = 0, ...rest } = options
      getInput(index)?.focus(rest)
    }
    else {
      getInput(options ?? 0)?.focus()
    }
  },
  blur: () => {
    getInput(0)?.blur()
    getInput(1)?.blur()
  },
})

// ======================== Trigger =======================
// Vapor `v-bind` never invokes a callback ref, so the trigger target element is
// registered explicitly once the root div is mounted.
// vapor 的 `v-bind` 不会调用 callback ref，因此根 div 挂载后显式注册给 trigger。
watch(
  [rootRef, () => props.setRef],
  ([el, setRef]) => {
    if (el && setRef) setRef(el)
  },
  { immediate: true },
)

// ======================== Props =========================
// Forward root-level events (onMouseEnter / onMouseLeave) plus the action
// handlers Trigger injects. Trigger's own `onClick` and `ref` are dropped:
// `onClick` would close the popup immediately after the selector re-opens it,
// and vapor `v-bind` cannot invoke callback refs.
// 透传根元素事件（onMouseEnter / onMouseLeave）以及 Trigger 注入的 action
// 处理器。剔除 Trigger 自身的 `onClick`（会在 selector 打开 popup 后立即关闭）
// 与 `ref`（vapor 的 `v-bind` 无法调用 callback ref）。
const baseRootProps = useRootProps(props as any)
const rootProps = computed(() => {
  const { ref: _, onClick: __, ...triggerRest } = (props.triggerProps ||
    {}) as Record<string, any>
  return { ...baseRootProps.value, ...triggerRest }
})

// ===================== Placeholder ======================
const mergedPlaceholder = computed(() =>
  Array.isArray(props.placeholder)
    ? props.placeholder
    : [props.placeholder, props.placeholder],
)

// ======================== Inputs ========================
// `{...props}` would drop the emit-listened `onXxx` handlers on a vapor props
// proxy, so the spread is replaced with `cloneProps` (rule 18).
// `{...props}` 在 vapor 的 props proxy 上会丢失 emit 绑定的 `onXxx` 处理器，
// 因此改用 `cloneProps`（规则 18）。
const inputPropsArgs = computed(() => ({
  ...cloneProps(props),
  id: ids.value,
  placeholder: mergedPlaceholder.value,
}))

const [getInputProps] = useInputProps(inputPropsArgs as any)
const startInputProps = computed(() => getInputProps(0))
const endInputProps = computed(() => getInputProps(1))

// ====================== ActiveBar =======================
const activeBarStyle = ref<any>({ position: 'absolute', width: 0 })

const syncActiveOffset = () => {
  const inputElement = getInput(props.activeIndex!)?.nativeElement?.value
  if (inputElement && rootRef.value) {
    // `Input` exposes its holder div as `nativeElement`
    // `Input` 通过 `nativeElement` 暴露 holder div
    const inputRect = inputElement.getBoundingClientRect()
    const parentRect = rootRef.value.getBoundingClientRect()
    const rectOffset = inputRect.left - parentRect.left
    activeBarStyle.value = {
      ...activeBarStyle.value,
      width: `${inputRect.width}px`,
      left: `${rectOffset}px`,
    }
    props.onActiveInfo?.([inputRect.left, inputRect.right, parentRect.width])
  }
}

watch(() => props.activeIndex, syncActiveOffset, { flush: 'post' })

// ======================== Clear =========================
const showClear = computed(() =>
  !!props.clearIcon
  && ((props.value?.[0] && !props.disabled?.[0]) || (props.value?.[1] && !props.disabled?.[1])),
)

// ======================== Render ========================
const rootCls = computed(() =>
  clsx(
    prefixCls.value,
    `${prefixCls.value}-range`,
    {
      [`${prefixCls.value}-focused`]: props.focused,
      [`${prefixCls.value}-disabled`]: props.disabled?.every(i => i),
      [`${prefixCls.value}-invalid`]: props.invalid?.some(i => i),
      [`${prefixCls.value}-rtl`]: rtl.value,
    },
    attrs.class as string,
    props.className,
  ),
)

const rootStyle = computed(() => {
  const attrStyle = attrs.style as Record<string, any> | undefined
  if (attrStyle && typeof attrStyle === 'object' && !Array.isArray(attrStyle)) {
    return { ...attrStyle, ...props.style }
  }
  return { ...(props.style || {}) }
})

// `separator` is an optional non-boolean prop; vapor can still coerce an absent
// value, so `||` is used instead of `??` (rule 12).
// `separator` 是可选非布尔 prop；vapor 仍可能把缺省值强制转换，因此用 `||`
// 而不是 `??`（规则 12）。
const separatorNode = computed(() => props.separator || '~')

// The default separator is display text (`~`) while a custom one is a
// component, so the render form must be chosen at runtime: `{{ }}` compiles to
// `_toDisplayString` and cannot instantiate a component, while `<component :is>`
// creates an element and cannot render text.
// 默认分隔符是展示文本（`~`），自定义的是组件，因此渲染形式必须运行时判断：
// `{{ }}` 编译为 `_toDisplayString`，无法实例化组件；`<component :is>` 创建
// 的是元素节点，无法渲染文本。
const separatorIsComponent = computed(
  () => separatorNode.value != null && typeof separatorNode.value !== 'string',
)

const prefixStyle = computed(() => styles.value.prefix)

// `onClick` may be an array of handlers
// `onClick` 可能是处理器数组
const onRootClick = (event: MouseEvent) => {
  if (Array.isArray(props.onClick)) {
    props.onClick.forEach(fn => fn?.(event))
  }
  else {
    props.onClick?.(event)
  }
}

const onRootMousedown = (event: MouseEvent) => {
  const target = event.target as HTMLElement
  if (
    target !== inputStartRef.value?.inputElement?.value
    && target !== inputEndRef.value?.inputElement?.value
  ) {
    event.preventDefault()
  }
  props.onMouseDown?.(event)
}

const startAutoFocus = computed(() => !!props.autoFocus && !props.disabled?.[0])
const endAutoFocus = computed(
  () => !!props.autoFocus && !startAutoFocus.value && !props.disabled?.[1],
)
</script>

<template>
  <ResizeObserver @resize="syncActiveOffset">
    <div
      ref="root"
      v-bind="rootProps"
      :class="rootCls"
      :style="rootStyle"
      @click="onRootClick"
      @mousedown="onRootMousedown"
    >
      <div v-if="prefix" :class="`${prefixCls}-prefix`" :style="prefixStyle">
        <slot name="prefix">
          <component :is="prefix" />
        </slot>
      </div>
      <Input
        ref="inputStart"
        v-bind="startInputProps"
        :class="`${prefixCls}-input-start`"
        :autofocus="startAutoFocus"
        :tabindex="tabIndex"
        data-range="start"
      />
      <div :class="`${prefixCls}-range-separator`">
        <slot name="separator">
          <component v-if="separatorIsComponent" :is="separatorNode" />
          <template v-else>{{ separatorNode }}</template>
        </slot>
      </div>
      <Input
        ref="inputEnd"
        v-bind="endInputProps"
        :class="`${prefixCls}-input-end`"
        :autofocus="endAutoFocus"
        :tabindex="tabIndex"
        data-range="end"
      />
      <div :class="`${prefixCls}-active-bar`" :style="activeBarStyle" />
      <Icon>
        <slot name="suffixIcon" />
      </Icon>
      <ClearIcon v-if="showClear" :onClear="onClear">
        <slot name="clearIcon" />
      </ClearIcon>
    </div>
  </ResizeObserver>
</template>
