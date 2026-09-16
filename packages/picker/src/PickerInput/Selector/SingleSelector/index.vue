<script lang="ts">
  import type { InternalMode, SelectorProps } from '../../../interface'

  export interface SingleSelectorProps<
    DateType extends object = any,
  > extends SelectorProps<DateType> {
    id?: string
    value?: DateType[]
    onChange: (date: DateType[], source?: 'input' | 'remove') => void

    internalPicker: InternalMode

    disabled?: boolean

    /** All the field show as `placeholder` */
    allHelp?: boolean

    placeholder?: string

    // Invalid
    invalid?: boolean
    onInvalid: (valid: boolean) => void

    removeIcon?: any

    // Vue specific
    maxTagCount?: number | 'responsive'
    multiple?: boolean
    tagRender?: (props: {
      label: any
      value: DateType
      disabled: boolean
      onClose: (event?: MouseEvent) => void
      closable: boolean
    }) => any

    onMouseDown?: (e: MouseEvent) => void

    autoFocus?: boolean
    tabIndex?: number | string

    // Injected by `PickerTrigger` so the root element is registered as the
    // trigger target and receives its action handlers.
    // 由 `PickerTrigger` 注入，用于把根元素注册为 trigger target 并接收其
    // action 处理器。
    setRef?: (el: HTMLElement | null) => void
    triggerProps?: Record<string, any>
  }
</script>

<script setup vapor lang="ts">
  import { clsx } from '@v-c/util'
  import { computed, useAttrs, useTemplateRef, watch } from 'vue'

  import { isSame } from '../../../utils/dateUtil'
  import { cloneProps } from '../../../utils/miscUtil'
  import { usePickerContext } from '../../context'
  import ClearIcon from '../ClearIcon.vue'
  import useInputProps from '../hooks/useInputHooks'
  import useRootProps from '../hooks/useRootProps'
  import Icon from '../Icon.vue'
  import Input from '../Input.vue'
  import MultipleDates from './MultipleDates.vue'

  defineOptions({ name: 'SingleSelector', inheritAttrs: false })

  const props = defineProps<SingleSelectorProps>()
  const attrs = useAttrs()

  const rtl = computed(() => props.direction === 'rtl')

  // ======================== Prefix ========================
  const ctx = usePickerContext()
  const prefixCls = computed(() => ctx.value.prefixCls || 'vc-picker')
  const styles = computed(() => ctx.value.styles)

  // ========================= Refs =========================
  // In single mode this is the `<Input>` instance; in multiple mode it is the raw
  // `<input>` element, so it is typed loosely.
  // 单选模式下是 `<Input>` 实例；多选模式下是原始 `<input>` 元素，因此类型放宽。
  const rootRef = useTemplateRef<HTMLDivElement>('root')
  const inputRef = useTemplateRef<any>('input')

  // Getter: a vapor `defineExpose` does not unwrap refs, so the owner
  // (`Picker.vue` / `useFocusLock`) would read a `Ref` instead of the element.
  // getter 形式：vapor 的 `defineExpose` 不会解包 ref，否则外层拿到的是 `Ref`
  // 而不是 DOM 元素。
  defineExpose({
    get nativeElement() {
      return rootRef.value
    },
    focus: (options?: FocusOptions) => {
      inputRef.value?.focus(options)
    },
    blur: () => {
      inputRef.value?.blur()
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
    const {
      ref: _,
      onClick: __,
      ...triggerRest
    } = (props.triggerProps || {}) as Record<string, any>
    return { ...baseRootProps.value, ...triggerRest }
  })

  // ======================== Change ========================
  const onSingleChange = (date: any) => {
    props.onChange?.([date], 'input')
  }

  const onMultipleRemove = (date: any) => {
    const nextValues = (props.value || []).filter(
      oriDate =>
        oriDate &&
        !isSame(
          props.generateConfig,
          props.locale,
          oriDate,
          date,
          props.internalPicker,
        ),
    )
    // An open popup keeps removal temporary until confirmation. Removing while
    // closed is final and submits through the explicit `remove` source.
    // popup 打开时删除只是临时状态，等待确认；关闭时删除是最终操作，通过
    // 明确的 `remove` 来源提交。
    props.onChange?.(nextValues, props.open ? 'input' : 'remove')
  }

  // ======================== Inputs ========================
  const inputPropsArgs = computed(() => ({
    ...cloneProps(props),
    'aria-required': !!props['aria-required'],
    onChange: onSingleChange,
  }))

  const [getInputProps, getText] = useInputProps(
    inputPropsArgs as any,
    ({ valueTexts }) => ({
      value: valueTexts[0] || '',
      active: props.focused,
    }),
  )

  const inputProps = computed(() => getInputProps())

  // ======================== Render ========================
  const showClear = computed(
    () =>
      !!(
        props.clearIcon &&
        props.value &&
        props.value.length &&
        !props.disabled
      ),
  )

  const valuesText = computed(() => (props.value || []).map(getText).join(','))

  const rootCls = computed(() =>
    clsx(
      prefixCls.value,
      {
        [`${prefixCls.value}-multiple`]: props.multiple,
        [`${prefixCls.value}-focused`]: props.focused,
        [`${prefixCls.value}-disabled`]: props.disabled,
        [`${prefixCls.value}-invalid`]: props.invalid,
        [`${prefixCls.value}-rtl`]: rtl.value,
      },
      props.className,
      attrs.class as string,
    ),
  )

  const rootStyle = computed(() => {
    const attrStyle = attrs.style as Record<string, any> | undefined
    if (
      attrStyle &&
      typeof attrStyle === 'object' &&
      !Array.isArray(attrStyle)
    ) {
      return { ...attrStyle, ...props.style }
    }
    return { ...(props.style || {}) }
  })

  const prefixStyle = computed(() => styles.value.prefix)

  const onRootClick = (event: MouseEvent) => {
    if (Array.isArray(props.onClick)) {
      props.onClick.forEach(fn => fn?.(event))
    } else {
      props.onClick?.(event)
    }
  }

  // Single mode: `<Input>` exposes `inputElement` as a ref. Multiple mode:
  // `inputRef` already points at the raw `<input>` element.
  // 单选模式：`<Input>` 以 ref 形式暴露 `inputElement`；多选模式：`inputRef`
  // 直接指向原始 `<input>` 元素。
  const nativeInputElement = computed(
    () => inputRef.value?.inputElement?.value ?? inputRef.value,
  )

  const onRootMousedown = (event: MouseEvent) => {
    // Not lose current input focus
    // 不要丢失当前输入框焦点
    if (event.target !== nativeInputElement.value) {
      event.preventDefault()
    }
    props.onMouseDown?.(event)
  }
</script>

<template>
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
    <template v-if="multiple">
      <MultipleDates
        :prefixCls="prefixCls"
        :value="value ?? []"
        :onRemove="onMultipleRemove"
        :formatDate="getText"
        :maxTagCount="maxTagCount"
        :disabled="disabled"
        :removeIcon="removeIcon"
        :placeholder="placeholder"
        :tagRender="tagRender"
      />
      <input
        ref="input"
        :class="`${prefixCls}-multiple-input`"
        :value="valuesText"
        :autofocus="autoFocus"
        :tabindex="tabIndex"
        readonly
      />
      <Icon>
        <slot name="suffixIcon" />
      </Icon>
      <ClearIcon v-if="showClear" :onClear="onClear">
        <slot name="clearIcon" />
      </ClearIcon>
    </template>
    <Input
      v-else
      ref="input"
      v-bind="inputProps"
      :onClear="onClear"
      :showActiveCls="false"
    >
      <template #suffixIcon>
        <slot name="suffixIcon" />
      </template>
      <template #clearIcon>
        <slot name="clearIcon" />
      </template>
    </Input>
  </div>
</template>
