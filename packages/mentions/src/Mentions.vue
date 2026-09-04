<script setup vapor lang="ts">
  import type { MentionsRef, MentionsProps } from './interface'

  import type { CommonInputProps } from '@vapor-component/input'
  import { BaseInput } from '@vapor-component/input'
  import { clsx } from '@v-c/util'
  import { getAttrStyleAndClass } from '@v-c/util/dist/props-util'
  import { computed, shallowRef, useAttrs, useTemplateRef, watch } from 'vue'

  import InternalMentions from './InternalMentions.vue'

  defineOptions({ name: 'VcMentions', inheritAttrs: false })

  const props = withDefaults(
    defineProps<MentionsProps>(),
    {
      prefixCls: 'vc-mentions',
    },
  )

  const emit = defineEmits<{
    change: [value: string]
    select: [option: any, prefix: string]
    search: [text: string, prefix: string]
    focus: [e: FocusEvent]
    blur: [e: FocusEvent]
    keydown: [e: KeyboardEvent]
    keyup: [e: KeyboardEvent]
    'press-enter': [e: KeyboardEvent]
    'popup-scroll': [e: UIEvent]
    clear: [e: MouseEvent]
  }>()

  const attrs = useAttrs()
  const { className, style } = getAttrStyleAndClass(attrs)

  const holderRef = useTemplateRef<{ nativeElement: HTMLElement }>('holder')
  const mentionRef = useTemplateRef<MentionsRef>('mention')

  // ============================== Value ===============================
  const mergedValue = shallowRef(props.defaultValue ?? props.value ?? '')
  watch(
    () => props.value,
    () => {
      mergedValue.value = props.value ?? ''
    },
    { immediate: true },
  )

  const triggerChange = (nextValue: string) => {
    mergedValue.value = nextValue
    emit('change', nextValue)
  }

  const handleReset = (e: MouseEvent) => {
    triggerChange('')
    emit('clear', e)
  }

  defineExpose({
    focus: () => mentionRef.value?.focus?.(),
    blur: () => mentionRef.value?.blur?.(),
    textarea: computed(() => mentionRef.value?.textarea ?? null),
    nativeElement: computed(
      () => holderRef.value?.nativeElement ?? mentionRef.value?.nativeElement,
    ),
  })

  // ============================== Computed ===============================
  const hasSuffix = computed(() => !!props.suffix || !!props.allowClear)

  const internalClassName = computed(() =>
    clsx(props.classNames?.mentions, className),
  )

  const nodeCls = computed(() =>
    clsx(
      props.prefixCls,
      className,
      { [`${props.prefixCls}-has-suffix`]: hasSuffix.value },
    ),
  )

  const internalProps = computed(() => ({
    ...attrs,
    id: props.id,
    value: mergedValue.value,
    prefixCls: props.prefixCls,
    className: internalClassName.value,
    classNames: props.classNames,
    styles: props.styles,
    disabled: props.disabled,
    readOnly: props.readOnly,
    placeholder: props.placeholder,
    maxLength: props.maxLength,
    autoFocus: props.autoFocus,
    prefix: props.prefix,
    split: props.split,
    notFoundContent: props.notFoundContent,
    silent: props.silent,
    rows: props.rows,
    options: props.options,
    filterOption: props.filterOption,
    validateSearch: props.validateSearch,
    placement: props.placement,
    direction: props.direction,
    transitionName: props.transitionName,
    getPopupContainer: props.getPopupContainer,
    popupClassName: props.popupClassName,
    autoSize: props.autoSize,
    addonBefore: props.addonBefore,
    addonAfter: props.addonAfter,
    hasWrapper: hasSuffix.value,
  }))
</script>

<template>
  <BaseInput
    ref="holder"
    :prefix-cls="prefixCls"
    :suffix="suffix"
    :value="mergedValue"
    :allow-clear="allowClear"
    :handle-reset="handleReset"
    :disabled="disabled"
    :class="nodeCls"
    :style="style"
    :class-names="classNames"
    :styles="styles"
  >
    <InternalMentions
      ref="mention"
      v-bind="internalProps"
      @change="(v: string) => emit('change', v)"
      @select="(option: any, prefix: string) => emit('select', option, prefix)"
      @search="(text: string, prefix: string) => emit('search', text, prefix)"
      @focus="(e: FocusEvent) => emit('focus', e)"
      @blur="(e: FocusEvent) => emit('blur', e)"
      @keydown="(e: KeyboardEvent) => emit('keydown', e)"
      @keyup="(e: KeyboardEvent) => emit('keyup', e)"
      @press-enter="(e: KeyboardEvent) => emit('press-enter', e)"
      @popup-scroll="(e: UIEvent) => emit('popup-scroll', e)"
    />
  </BaseInput>
</template>
