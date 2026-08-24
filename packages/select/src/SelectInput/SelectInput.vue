<script setup vapor lang="ts">
  import type { VueNode } from '@v-c/util/dist/type'
  import type { CSSProperties } from 'vue'

  import type { ComponentsConfig } from '../hooks'
  import type { RenderNode } from '../interface'
  import type { DisplayValueType, Mode } from '../interface'

  import { clsx } from '@v-c/util'
  import { computed, shallowRef, useAttrs, watch } from 'vue'

  import Affix from '../Affix.vue'
  import useBaseProps from '../hooks/useBaseProps'
  import { isValidateOpenKey } from '../utils/keyUtil'
  import SelectContent from './Content'
  import { useSelectInputProvider } from './SelectInputContextKey'

  defineOptions({ name: 'SelectInput', inheritAttrs: false })

  const props = defineProps<{
    prefixCls: string
    className?: string
    style?: CSSProperties
    prefix?: VueNode
    suffix?: VueNode
    clearIcon?: VueNode
    clearLabel?: string
    removeIcon?: RenderNode
    multiple?: boolean
    mode?: Mode
    displayValues: DisplayValueType[]
    placeholder?: VueNode
    searchValue?: string
    activeValue?: string
    maxLength?: number
    autoFocus?: boolean
    tabIndex?: number
    role?: string
    focused?: boolean
    tokenWithEnter?: boolean
    components: ComponentsConfig
    setRef?: (el: HTMLElement | null) => void
    triggerProps?: Record<string, any>
  }>()

  const emit = defineEmits<{
    search: [searchText: string, fromTyping: boolean, isCompositing: boolean]
    'search-submit': [searchText: string]
    'input-blur': []
    focus: [event: FocusEvent]
    blur: [event: FocusEvent]
    keydown: [event: KeyboardEvent]
    keyup: [event: KeyboardEvent]
    mousedown: [event: MouseEvent]
    'clear-mouse-down': [event: MouseEvent]
    'selector-remove': [value: DisplayValueType]
  }>()

  const attrs = useAttrs()
  const baseProps = useBaseProps()
  const rootRef = shallowRef<HTMLElement>()
  const inputRef = shallowRef<any>()

  const prefixCls = computed(() => props.prefixCls)
  const triggerOpen = computed(() => baseProps.value?.triggerOpen ?? false)
  const toggleOpen = computed(() => baseProps.value?.toggleOpen)
  const baseFocused = computed(() => baseProps.value?.focused ?? false)
  const showSearch = computed(() => baseProps.value?.showSearch ?? false)
  const disabled = computed(() => baseProps.value?.disabled ?? false)
  const loading = computed(() => baseProps.value?.loading ?? false)
  const classNamesConfig = computed(() => baseProps.value?.classNames)
  const stylesConfig = computed(() => baseProps.value?.styles)

  const emitMap = {
    onSearch: (
      searchText: string,
      fromTyping: boolean,
      isCompositing: boolean,
    ) => {
      emit('search', searchText, fromTyping, isCompositing)
    },
    onSearchSubmit: (searchText: string) => {
      emit('search-submit', searchText)
    },
    onInputBlur: () => {
      emit('input-blur')
    },
    onFocus: (event: FocusEvent) => {
      emit('focus', event)
    },
    onBlur: (event: FocusEvent) => {
      emit('blur', event)
    },
    onKeyDown: (event: KeyboardEvent) => {
      emit('keydown', event)
    },
    onKeyUp: (event: KeyboardEvent) => {
      emit('keyup', event)
    },
    onMouseDown: (event: MouseEvent) => {
      emit('mousedown', event)
    },
    onClearMouseDown: (event: MouseEvent) => {
      emit('clear-mouse-down', event)
    },
    onSelectorRemove: (value: DisplayValueType) => {
      emit('selector-remove', value)
    },
  }

  const onInternalInputKeyDown = (event: KeyboardEvent) => {
    ;(event as any)._select_open_before = triggerOpen.value

    if (!triggerOpen.value) {
      const isModifier = event.ctrlKey || event.altKey || event.metaKey
      if (!isModifier && isValidateOpenKey(event.keyCode)) {
        toggleOpen.value?.(true)
      }
    }
    emitMap.onKeyDown(event)
  }

  const onInternalMouseDown = (event: MouseEvent) => {
    if (!disabled.value) {
      const inputDOM = inputRef.value?.input?.value
      ;(event as any)._ori_target = inputDOM
      const isClickOnInput =
        inputDOM === event.target || inputDOM?.contains?.(event.target as Node)
      if (inputDOM && !isClickOnInput) {
        event.preventDefault()
      }
      const shouldPreventCloseOnSingle =
        triggerOpen.value &&
        !props.multiple &&
        (props.mode === 'combobox' || showSearch.value)
      const shouldPreventCloseOnMultipleInput =
        triggerOpen.value && props.multiple && isClickOnInput
      const shouldPreventClose =
        shouldPreventCloseOnSingle || shouldPreventCloseOnMultipleInput
      if (!(event as any)._select_lazy) {
        inputDOM?.focus?.()
        if (!shouldPreventClose) toggleOpen.value?.()
      } else if (triggerOpen.value && !props.multiple) {
        toggleOpen.value?.(false)
      }
    }
    emitMap.onMouseDown(event)
  }

  const onClearKeydown = (event: KeyboardEvent) => {
    if (event.key === 'Enter' || event.key === 'Space') {
      event.stopPropagation()
    }
  }

  const mergedSetRef = (el: any) => {
    rootRef.value = (el as HTMLElement) || undefined
    props.setRef?.(el as HTMLElement | null)
  }

  // In Vapor mode, v-bind does not invoke callback refs.
  // Explicitly call Trigger.setTargetRef via watch so useAlign gets targetEle.
  watch(
    [rootRef, computed(() => props.setRef)],
    ([el, setRef]) => {
      if (el && setRef) setRef(el)
      if (el) el.tabIndex = props.tabIndex ?? -1
    },
    { immediate: true },
  )

  const triggerMergedProps = computed(() => {
    const tp = props.triggerProps || {}
    // Remove onClick to prevent Trigger's click handler from double-toggling:
    // our mousedown handler already toggles, and by the time click fires
    // openRef is already true, causing the Trigger to close it immediately.
    const { ref: _, onClick: __, ...rest } = tp
    return rest
  })

  const mergedClassName = computed(() =>
    clsx(
      `${prefixCls.value}-selector`,
      props.className,
      { [`${prefixCls.value}-focused`]: baseFocused.value },
      { [`${prefixCls.value}-open`]: triggerOpen.value },
      attrs.class as string,
    ),
  )

  const mergedStyle = computed(() => ({
    ...stylesConfig.value?.input,
    ...props.style,
    ...(!Array.isArray(attrs.style) &&
    typeof attrs.style === 'object' &&
    attrs.style
      ? attrs.style
      : {}),
  }))

  // In Vapor mode, computed class bindings may not update reactively.
  // Use a watch to directly toggle dynamic classes on the root element.
  watch(
    [rootRef, baseFocused, triggerOpen],
    ([el, focused, open]) => {
      if (!el) return
      el.classList.toggle(`${prefixCls.value}-focused`, focused)
      el.classList.toggle(`${prefixCls.value}-open`, open)
    },
    { immediate: true },
  )

  const contextValue = computed(() => ({
    prefixCls: prefixCls.value,
    prefix: props.prefix,
    suffix: props.suffix,
    clearIcon: props.clearIcon,
    clearLabel: props.clearLabel,
    removeIcon: props.removeIcon,
    multiple: props.multiple,
    displayValues: props.displayValues,
    placeholder: props.placeholder,
    searchValue: props.searchValue,
    activeValue: props.activeValue,
    mode: props.mode,
    maxLength: props.maxLength,
    autoFocus: props.autoFocus,
    tabIndex: props.tabIndex,
    role: props.role,
    onSearch: emitMap.onSearch,
    onSearchSubmit: emitMap.onSearchSubmit,
    onInputBlur: emitMap.onInputBlur,
    onClearMouseDown: emitMap.onClearMouseDown,
    onInputKeyDown: onInternalInputKeyDown,
    onSelectorRemove: emitMap.onSelectorRemove,
    tokenWithEnter: props.tokenWithEnter,
    className: mergedClassName.value,
    style: mergedStyle.value,
    focused: props.focused,
    components: props.components,
    onFocus: emitMap.onFocus,
    onBlur: emitMap.onBlur,
    onKeyDown: emitMap.onKeyDown,
    onKeyUp: emitMap.onKeyUp,
    onMouseDown: emitMap.onMouseDown,
  }))
  useSelectInputProvider(contextValue as any)

  defineExpose({
    focus: (options?: FocusOptions) => {
      ;(inputRef.value?.input?.value || rootRef.value)?.focus?.(options)
    },
    blur: () => {
      ;(inputRef.value?.input?.value || rootRef.value)?.blur?.()
    },
    nativeElement: computed(() => rootRef.value),
  })
</script>

<template>
  <div
    v-bind="triggerMergedProps"
    ref="rootRef"
    :class="mergedClassName"
    :style="mergedStyle"
    :role="role || 'combobox'"
    @focusin="emitMap.onFocus"
    @focusout="emitMap.onBlur"
    @mousedown="onInternalMouseDown"
  >
    <Affix
      v-if="prefix"
      :class="clsx(`${prefixCls}-prefix`, classNamesConfig?.prefix)"
      :style="stylesConfig?.prefix"
    >
      <slot name="prefix">{{ prefix }}</slot>
    </Affix>

    <SelectContent ref="inputRef" />

    <Affix
      v-if="suffix || loading"
      :class="
        clsx(
          `${prefixCls}-suffix`,
          { [`${prefixCls}-suffix-loading`]: loading },
          classNamesConfig?.suffix,
        )
      "
      :style="stylesConfig?.suffix"
    >
      <slot name="suffix">{{ suffix }}</slot>
    </Affix>

    <button
      v-if="clearIcon"
      type="button"
      :aria-label="clearLabel"
      :class="clsx(`${prefixCls}-clear`, classNamesConfig?.clear)"
      :style="stylesConfig?.clear"
      @mousedown.stop.prevent="
        e => {
          ;(e as any)._select_lazy = true
          emitMap.onClearMouseDown(e)
        }
      "
      @keydown="onClearKeydown"
    >
      {{ clearIcon }}
    </button>

    <slot />
  </div>
</template>
