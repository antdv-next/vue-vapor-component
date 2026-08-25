<script setup vapor lang="ts">
  import type { CSSProperties } from 'vue'

  import type { BaseSelectProps } from './BaseSelect/interface'

  import { clsx } from '@v-c/util'
  import { KeyCodeStr } from '@v-c/util/dist/KeyCode'
  import omit from '@v-c/util/dist/omit'
  import Trigger from '@vapor-component/trigger'
  import { computed, shallowRef, watch } from 'vue'

  import { isMultiple } from './BaseSelect/interface'
  import {
    useAllowClear,
    useBaseSelectProvider,
    useComponents,
    useLock,
    useOpen,
    useSelectTriggerControl,
  } from './hooks'
  import { macroTask } from './hooks/useOpen'
  import OptionList from './OptionList.vue'
  import Polite from './Polite.vue'
  import SelectInput from './SelectInput/SelectInput.vue'
  import { getSeparatedContent, isValidCount } from './utils/valueUtil'

  defineOptions({ name: 'BaseSelect', inheritAttrs: false })

  const props = withDefaults(defineProps<BaseSelectProps>(), {
    prefixCls: 'vc-select',
    placement: 'bottomLeft',
    showScrollBar: 'optional',
    notFoundContent: 'Not Found',
    showAction: () => [] as ('focus' | 'click')[],
    builtinPlacements: () => ({
      bottomLeft: {
        points: ['tl', 'bl'],
        offset: [0, 4],
        overflow: { adjustX: true, adjustY: true },
      },
      bottomRight: {
        points: ['tr', 'br'],
        offset: [0, 4],
        overflow: { adjustX: true, adjustY: true },
      },
      topLeft: {
        points: ['bl', 'tl'],
        offset: [0, -4],
        overflow: { adjustX: true, adjustY: true },
      },
      topRight: {
        points: ['br', 'tr'],
        offset: [0, -4],
        overflow: { adjustX: true, adjustY: true },
      },
    }),
  })

  const emit = defineEmits<{
    'display-values-change': [
      values: any[],
      info: { type: string; values: any[] },
    ]
    search: [
      searchText: string,
      info: { source: 'typing' | 'effect' | 'submit' | 'blur' },
    ]
    'search-split': [words: string[]]
    focus: [event: FocusEvent]
    blur: [event: FocusEvent]
    keydown: [event: KeyboardEvent]
    keyup: [event: KeyboardEvent]
    mousedown: [event: MouseEvent]
    clear: []
    'popup-visible-change': [open: boolean]
    'active-value-change': [value: string | null]
  }>()

  const multiple = computed(() => isMultiple(props.mode!))
  const getInputElement = computed(() => props.getInputElement)
  const getRawInputElement = computed(() => props.getRawInputElement)
  const components = computed(() => props.components)
  const mergedComponents = useComponents(
    components as any,
    getInputElement as any,
    getRawInputElement as any,
  )

  const containerRef = shallowRef<any>(null)
  const triggerRef = shallowRef<any>(null)
  const listRef = shallowRef<any>(null)
  const focused = shallowRef(false)
  const keyLockRef = shallowRef(false)

  defineExpose({
    focus: (options?: FocusOptions) => containerRef.value?.focus?.(options),
    blur: () => containerRef.value?.blur?.(),
    scrollTo: (arg: any) => listRef.value?.scrollTo?.(arg),
    nativeElement: computed(() => containerRef.value?.nativeElement?.value),
  })

  const mergedSearchValue = computed(() => {
    if (props.mode !== 'combobox') return props.searchValue
    const val = props.displayValues?.[0]?.value
    return typeof val === 'string' || typeof val === 'number' ? String(val) : ''
  })

  const mergedNotFoundContent = computed(
    () => props.notFoundContent ?? 'Not Found',
  )
  const emptyListContent = computed(
    () => !props.notFoundContent && props.emptyOptions,
  )

  const [rawOpen, mergedOpen, triggerOpen, lockOptions] = useOpen(
    props.defaultOpen || false,
    computed(() => (props.open === undefined ? null : props.open)),
    (openVal: boolean) => {
      emit('popup-visible-change', openVal)
    },
    (nextOpen: boolean) =>
      props.disabled || emptyListContent.value ? false : nextOpen,
  )

  const tokenWithEnter = computed(() => {
    const value = props.tokenSeparators
    return (
      typeof value === 'function' ||
      (value || []).some((t: string) => ['\n', '\r\n'].includes(t))
    )
  })

  const splitByTokenSeparators = (
    input: string,
    end?: number,
  ): string[] | null => {
    const value = props.tokenSeparators
    if (typeof value === 'function') {
      const tokens = value(input)
      const isUnchanged =
        Array.isArray(tokens) && tokens.length === 1 && tokens[0] === input
      if (!Array.isArray(tokens) || !tokens.length || isUnchanged) return null
      return typeof end !== 'undefined' ? tokens.slice(0, end) : tokens
    }
    return getSeparatedContent(input, value as string[], end)
  }

  const onInternalSearch = (
    searchText: string,
    fromTyping: boolean,
    _isCompositing: boolean,
  ) => {
    if (
      multiple.value &&
      isValidCount(props.maxCount) &&
      props.displayValues.length >= props.maxCount!
    )
      return
    let ret = true
    let newSearchText = searchText
    emit('active-value-change', null)
    const cap = isValidCount(props.maxCount)
      ? props.maxCount! - props.displayValues.length
      : undefined
    const patchLabels = splitByTokenSeparators(searchText, cap)
    if (props.mode !== 'combobox' && patchLabels) {
      newSearchText = ''
      emit('search-split', patchLabels)
      triggerOpen(false)
      ret = false
    }
    if (mergedSearchValue.value !== newSearchText) {
      emit('search', newSearchText, {
        source: fromTyping ? 'typing' : 'effect',
      })
    }
    if (searchText && fromTyping && ret) {
      triggerOpen(true)
    }
    return ret
  }

  const onInternalSearchSubmit = (searchText: string) => {
    if (
      multiple.value &&
      isValidCount(props.maxCount) &&
      props.displayValues.length >= props.maxCount!
    )
      return
    if (!searchText || !searchText.trim()) return
    emit('search', searchText, { source: 'submit' })
  }

  watch(
    rawOpen,
    () => {
      if (!rawOpen.value && !multiple.value && props.mode !== 'combobox') {
        onInternalSearch('', false, false)
      }
    },
    { immediate: true },
  )

  watch(
    [computed(() => props.disabled), mergedOpen],
    () => {
      if (props.disabled) {
        triggerOpen(false)
        focused.value = false
      }
    },
    { immediate: true },
  )

  const [getClearLock, setClearLock] = useLock()

  const onInternalKeyDown = (event: KeyboardEvent) => {
    const clearLock = getClearLock()
    const wasOpen =
      (event as any)._select_open_before !== undefined
        ? ((event as any)._select_open_before as boolean)
        : mergedOpen.value
    const { key } = event
    const isEnterKey = key === KeyCodeStr.Enter
    const isSpaceKey = key === KeyCodeStr.Space

    if (isEnterKey || isSpaceKey) {
      const isCombobox = props.mode === 'combobox'
      const isEditable = isCombobox || !!props.showSearch
      if ((isSpaceKey && !isEditable) || (isEnterKey && !isCombobox)) {
        event.preventDefault()
      }
      if (!mergedOpen.value) {
        triggerOpen(true)
      }
    }

    setClearLock(!!mergedSearchValue.value)

    if (
      key === KeyCodeStr.Backspace &&
      !clearLock &&
      multiple.value &&
      !mergedSearchValue.value &&
      props.displayValues.length
    ) {
      const cloneDisplayValues = [...props.displayValues]
      let removed: any = null
      for (let i = cloneDisplayValues.length - 1; i >= 0; i -= 1) {
        if (!cloneDisplayValues[i].disabled) {
          removed = cloneDisplayValues.splice(i, 1)[0]
          break
        }
      }
      if (removed) {
        emit('display-values-change', cloneDisplayValues, {
          type: 'remove',
          values: [removed],
        })
      }
    }

    if (wasOpen && (!isEnterKey || !keyLockRef.value) && !isSpaceKey) {
      if (isEnterKey) keyLockRef.value = true
      listRef.value?.onKeyDown?.(event)
    }
    emit('keydown', event)
  }

  const onInternalKeyUp = (event: KeyboardEvent) => {
    if (mergedOpen.value) listRef.value?.onKeyUp?.(event)
    if (event.key === KeyCodeStr.Enter) keyLockRef.value = false
    emit('keyup', event)
  }

  const onSelectorRemove = (val: any) => {
    const newValues = props.displayValues.filter((i: any) => i !== val)
    emit('display-values-change', newValues, { type: 'remove', values: [val] })
  }

  const onInputBlur = () => {
    keyLockRef.value = false
  }

  const getSelectElements = () => [
    containerRef.value?.nativeElement,
    triggerRef.value?.popupElement,
  ]

  useSelectTriggerControl(
    getSelectElements,
    mergedOpen,
    triggerOpen,
    computed(() => !!mergedComponents.value.root),
    () => [triggerRef.value?.popupElement],
  )

  const internalMouseDownRef = shallowRef(false)

  const onInternalFocus = (event: FocusEvent) => {
    focused.value = true
    if (!props.disabled) {
      if (props.showAction?.includes('focus')) triggerOpen(true)
    }
    props.onFocus?.(event)
  }

  const onRootBlur = () => {
    if (mergedOpen.value && !internalMouseDownRef.value) {
      triggerOpen(false, {
        cancelFun: () => {
          const activeEl = document.activeElement as HTMLElement
          return getSelectElements().some(
            el => el && (el.contains(activeEl) || el === activeEl),
          )
        },
      })
    }
  }

  const onInternalBlur = (event: FocusEvent) => {
    focused.value = false
    if (mergedSearchValue.value) {
      if (props.mode === 'tags')
        emit('search', mergedSearchValue.value, { source: 'submit' })
      else if (props.mode === 'multiple') emit('search', '', { source: 'blur' })
    }
    onRootBlur()
    props.onBlur?.(event)
  }

  const onInternalMouseDown = (event: MouseEvent) => {
    const popupElement = triggerRef.value?.popupElement
    if (popupElement?.contains?.(event.target as HTMLElement) && triggerOpen) {
      triggerOpen(true)
    }
    internalMouseDownRef.value = true
    emit('mousedown', event)
    macroTask(() => {
      internalMouseDownRef.value = false
    })
  }

  const baseSelectContext = computed(() => ({
    ...props,
    notFoundContent: mergedNotFoundContent.value,
    open: mergedOpen.value,
    focused: focused.value,
    triggerOpen: mergedOpen.value,
    toggleOpen: triggerOpen,
    multiple: multiple.value,
    lockOptions: lockOptions.value,
    rawOpen: rawOpen.value,
  }))
  useBaseSelectProvider(baseSelectContext)

  const onClearMouseDown = () => {
    emit('clear')
    containerRef.value?.focus?.()
    emit('display-values-change', [], {
      type: 'clear',
      values: props.displayValues,
    })
    onInternalSearch('', false, false)
  }

  const allowClearConfig = useAllowClear(
    computed(() => props.prefixCls),
    computed(() => props.displayValues),
    computed(() => props.allowClear ?? false),
    computed(() => props.clearIcon),
    computed(() => props.disabled ?? false),
    mergedSearchValue,
    computed(() => props.mode),
  )
  const mergedAllowClear = computed(() => allowClearConfig.value.allowClear)
  const clearNode = computed(() => allowClearConfig.value.clearIcon)
  const clearLabel = computed(() => allowClearConfig.value.label)

  const mergedSuffixIcon = computed(() => {
    const nextSuffix = props.suffix ?? props.suffixIcon
    if (typeof nextSuffix === 'function') {
      return (nextSuffix as any)?.({
        searchValue: mergedSearchValue.value,
        open: mergedOpen.value,
        focused: focused.value,
        showSearch: props.showSearch,
        loading: props.loading,
      })
    }
    return nextSuffix
  })

  const mergedClassName = computed(() => {
    return clsx(props.prefixCls, props.className, {
      [`${props.prefixCls}-focused`]: focused.value,
      [`${props.prefixCls}-multiple`]: multiple.value,
      [`${props.prefixCls}-single`]: !multiple.value,
      [`${props.prefixCls}-allow-clear`]: mergedAllowClear.value,
      [`${props.prefixCls}-show-arrow`]:
        mergedSuffixIcon.value !== undefined && mergedSuffixIcon.value !== null,
      [`${props.prefixCls}-disabled`]: props.disabled,
      [`${props.prefixCls}-loading`]: props.loading,
      [`${props.prefixCls}-open`]: mergedOpen.value,
      [`${props.prefixCls}-show-search`]: props.showSearch,
    })
  })

  const selectInputProps = computed(() =>
    omit(props, [
      'id',
      'prefixCls',
      'className',
      'styles',
      'classNames',
      'showSearch',
      'tagRender',
      'showScrollBar',
      'direction',
      'omitDomProps',
      'displayValues',
      'emptyOptions',
      'notFoundContent',
      'maxCount',
      'placeholder',
      'mode',
      'disabled',
      'loading',
      'getInputElement',
      'getRawInputElement',
      'open',
      'defaultOpen',
      'activeValue',
      'activeDescendantId',
      'searchValue',
      'autoClearSearchValue',
      'tokenSeparators',
      'allowClear',
      'prefix',
      'suffix',
      'suffixIcon',
      'clearIcon',
      'OptionList',
      'animation',
      'transitionName',
      'popupStyle',
      'popupClassName',
      'popupMatchSelectWidth',
      'popupRender',
      'popupAlign',
      'placement',
      'builtinPlacements',
      'getPopupContainer',
      'showAction',
      'components',
    ] as const),
  )
</script>

<template>
  <Polite :visible="focused && !mergedOpen" :values="displayValues" />
  <Trigger
    ref="triggerRef"
    :prefix-cls="prefixCls"
    :action="['click']"
    :popup-visible="mergedOpen"
    :popup-placement="placement"
    :builtin-placements="builtinPlacements"
    :popup-align="popupAlign"
    :popup-class-name="popupClassName"
    :popup-style="popupStyle"
    :stretch="popupMatchSelectWidth ? 'minWidth' : undefined"
    :get-popup-container="getPopupContainer || (() => document.body)"
    @open-change="triggerOpen"
  >
    <template #default="{ trigger: triggerProps, setRef }">
      <SelectInput
        ref="containerRef"
        :prefix-cls="prefixCls"
        :class-name="mergedClassName"
        :focused="focused"
        :prefix="prefix"
        :suffix="mergedSuffixIcon"
        :clear-icon="clearNode"
        :clear-label="clearLabel"
        :remove-icon="removeIcon"
        :multiple="multiple"
        :mode="mode"
        :display-values="displayValues"
        :placeholder="placeholder"
        :search-value="mergedSearchValue"
        :active-value="activeValue"
        @search="onInternalSearch"
        @search-submit="onInternalSearchSubmit"
        @input-blur="onInputBlur"
        @focus="onInternalFocus"
        @blur="onInternalBlur"
        @clear-mouse-down="onClearMouseDown"
        @keydown="onInternalKeyDown"
        @keyup="onInternalKeyUp"
        @selector-remove="onSelectorRemove"
        @mousedown="onInternalMouseDown"
        :token-with-enter="tokenWithEnter"
        :components="mergedComponents"
        :style="selectInputProps.style"
        :set-ref="setRef"
        :trigger-props="triggerProps"
        :tab-index="tabIndex"
        :role="role || 'combobox'"
        :auto-focus="autoFocus"
        :max-length="maxLength"
      />
    </template>
    <template #popup>
      <slot name="optionList" ref="listRef">
        <OptionList ref="listRef" />
      </slot>
    </template>
  </Trigger>
</template>
