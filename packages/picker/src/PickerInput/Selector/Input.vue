<script setup vapor lang="ts">
  import type { VueNode } from '@v-c/util/dist/type'

  import { clsx } from '@v-c/util'
  import omit from '@v-c/util/dist/omit'
  import {
    computed,
    onBeforeUnmount,
    ref,
    toRef,
    useAttrs,
    useTemplateRef,
    watch,
  } from 'vue'

  import { leftPad } from '../../utils/miscUtil'
  import { usePickerContext } from '../context'
  import useLockEffect from '../hooks/useLockEffect'
  import ClearIcon from './ClearIcon.vue'
  import Icon from './Icon.vue'
  import MaskFormat from './MaskFormat'
  import { getMaskRange, raf } from './util'

  defineOptions({ name: 'VcInput', inheritAttrs: false })

  const props = defineProps<{
    format?: string
    validateFormat?: (value: string) => boolean
    active?: boolean
    showActiveCls?: boolean
    suffixIcon?: VueNode
    value?: string
    helped?: boolean
    preserveInvalidOnBlur?: boolean
    invalid?: boolean
    clearIcon?: VueNode
    onClear?: VoidFunction
    readOnly?: boolean
    required?: boolean
    name?: string
    autoComplete?: string
    size?: number
    id?: string
    placeholder?: string
    disabled?: boolean
    onChange?: (value: string) => void
    onSubmit?: VoidFunction
    onHelp?: () => void
    onFocus?: (e: FocusEvent) => void
    onBlur?: (e: FocusEvent) => void
    onKeyDown?: (e: KeyboardEvent) => void
    onMouseUp?: (e: MouseEvent) => void
    onInput?: (e: Event) => void
  }>()

  const pickerCtx = usePickerContext()
  const attrs = useAttrs()

  // `class`/`style` are applied to the holder div explicitly (`holderCls` /
  // `holderStyle`); forwarding them would put the selector-level class on the real
  // `<input>` as well.
  // `class`/`style` 已显式应用到 holder div（`holderCls` / `holderStyle`）；若再
  // 透传，selector 层的 class 会同时挂到真实的 `<input>` 上。
  const restAttrs = computed(() =>
    omit(attrs as Record<string, any>, ['class', 'style']),
  )

  const prefixCls = computed(() => pickerCtx.value.prefixCls || 'vc-picker')
  const classNames = computed(() => pickerCtx.value.classNames)
  const styles = computed(() => pickerCtx.value.styles)

  const inputPrefixCls = computed(() => `${prefixCls.value}-input`)

  // Dynamic input element: `components.input` or the plain `<input>` tag.
  // Vapor `<component :is="'input'">` resolves to the local `Input` component
  // (case-insensitive match on `name: 'Input'`) instead of creating an HTML
  // element, so a plain string tag is replaced with an explicit v-if/v-else
  // branch.
  const inputComponent = computed(() => pickerCtx.value.input ?? 'input')

  // ======================== Value =========================
  const focused = ref(false)
  const internalInputValue = ref(props.value)
  const focusCellText = ref('')
  const focusCellIndex = ref<number | null>(null)
  const forceSelectionSyncMark = ref<object | null>(null)

  const inputValue = computed(() => internalInputValue.value || '')

  watch(
    () => props.value,
    val => {
      internalInputValue.value = val
    },
  )

  // ========================= Refs =========================
  const holderRef = useTemplateRef<HTMLDivElement>('holder')
  const inputRef = useTemplateRef<HTMLInputElement>('input')

  // Exposes the template refs themselves, matching the repo convention
  // (`packages/checkbox/src/Checkbox.vue`). `defineExpose` + `computed()` is not
  // reliably readable through a vapor template ref, but a plain `useTemplateRef`
  // ref is.
  // No type argument: a vapor `useTemplateRef` returns
  // `Readonly<ShallowRef<X | null>>`, which is not assignable to `InputRef`'s
  // `Ref<X | undefined>`. The exposed shape is read positionally by parents
  // (`inputStartRef.value?.inputElement?.value`), so the loose type is safe.
  // 不带类型参数：vapor 的 `useTemplateRef` 返回 `Readonly<ShallowRef<X | null>>`，
  // 无法赋值给 `InputRef` 的 `Ref<X | undefined>`。父组件按位置读取暴露对象
  // （`inputStartRef.value?.inputElement?.value`），因此宽松类型是安全的。
  defineExpose({
    nativeElement: holderRef,
    inputElement: inputRef,
    focus: (options?: FocusOptions) => {
      inputRef.value?.focus(options)
    },
    blur: () => {
      inputRef.value?.blur()
    },
  })

  // ======================== Format ========================
  const maskFormat = computed(() => new MaskFormat(props.format || ''))

  const selectionRange = computed(() => {
    if (props.helped) {
      return [0, 0]
    }
    return maskFormat.value.getSelection(focusCellIndex.value!)
  })

  const selectionStart = computed(() => selectionRange.value[0])
  const selectionEnd = computed(() => selectionRange.value[1])

  // ======================== Modify ========================
  // When input modify content, trigger `onHelp` if is not the format
  const onModify = (text: string) => {
    if (text && text !== props.format && text !== props.value) {
      props.onHelp?.()
    }
  }

  /** Triggered by paste, keyDown and focus to show format */
  const triggerInputChange = (text: string) => {
    if (props.validateFormat?.(text)) {
      props.onChange?.(text)
    }
    internalInputValue.value = text
    onModify(text)
  }

  // Directly trigger `onChange` if `format` is empty
  const onInternalChange = (event: Event) => {
    const target = event.target as HTMLInputElement
    props.onInput?.(event)
    // Hack `onChange` with format to do nothing
    if (!props.format) {
      const text = target.value
      onModify(text)
      internalInputValue.value = text
      props.onChange?.(text)
    }
  }

  const onFormatPaste = (event: ClipboardEvent) => {
    if (!props.format) return
    const pasteText = event.clipboardData?.getData('text') || ''
    if (props.validateFormat?.(pasteText)) {
      triggerInputChange(pasteText)
    }
  }

  // ======================== Mouse =========================
  // When `mouseDown` get focus, it's better to not to change the selection
  // Since the up position maybe not is the first cell
  const mouseDownRef = ref(false)

  const onFormatMouseDown = () => {
    if (!props.format) return
    mouseDownRef.value = true
  }

  const onFormatMouseUp = (event: MouseEvent) => {
    if (!props.format) return
    const { selectionStart: start } = event.target as HTMLInputElement
    focusCellIndex.value = maskFormat.value.getMaskCellIndex(start!)
    // Force update the selection
    forceSelectionSyncMark.value = {}
    props.onMouseUp?.(event)
    mouseDownRef.value = false
  }

  // ====================== Focus Blur ======================
  const onFormatFocus = (event: FocusEvent) => {
    if (!props.format) return
    focused.value = true
    focusCellIndex.value = 0
    focusCellText.value = ''
    props.onFocus?.(event)
  }

  const onSharedBlur = (event: FocusEvent) => {
    props.onBlur?.(event)
  }

  const onFormatBlur = (event: FocusEvent) => {
    if (props.format) {
      focused.value = false
    }
    onSharedBlur(event)
  }

  // ======================== Active ========================
  // Check if blur need reset input value
  useLockEffect(toRef(props, 'active'), () => {
    if (!props.active && !props.preserveInvalidOnBlur) {
      internalInputValue.value = props.value
    }
  })

  // ======================= Keyboard =======================
  const onSharedKeyDown = (event: KeyboardEvent) => {
    if (event.key === 'Enter' && props.validateFormat?.(inputValue.value)) {
      props.onSubmit?.()
    }
    props.onKeyDown?.(event)
  }

  const onFormatKeyDown = (event: KeyboardEvent) => {
    onSharedKeyDown(event)
    if (!props.format) return

    const { key } = event

    // Save the cache with cell text
    let nextCellText: string | null = null

    // Fill in the input
    let nextFillText: string | null = null

    const maskCellLen = selectionEnd.value - selectionStart.value
    const cellFormat = props.format.slice(
      selectionStart.value,
      selectionEnd.value,
    )

    // Cell Index
    const offsetCellIndex = (offset: number) => {
      let nextIndex = (focusCellIndex.value ?? 0) + offset
      nextIndex = Math.max(nextIndex, 0)
      nextIndex = Math.min(nextIndex, maskFormat.value.size() - 1)
      focusCellIndex.value = nextIndex
    }

    // Range
    const offsetCellValue = (offset: number) => {
      const [rangeStart, rangeEnd, rangeDefault] = getMaskRange(cellFormat)

      const currentText = inputValue.value.slice(
        selectionStart.value,
        selectionEnd.value,
      )
      const currentTextNum = Number(currentText)

      if (Number.isNaN(currentTextNum)) {
        return String(rangeDefault || (offset > 0 ? rangeStart : rangeEnd))
      }

      const num = currentTextNum + offset
      const range = rangeEnd - rangeStart + 1
      return String(rangeStart + ((range + num - rangeStart) % range))
    }

    switch (key) {
      // =============== Remove ===============
      case 'Backspace':
      case 'Delete':
        nextCellText = ''
        nextFillText = cellFormat
        break

      // =============== Arrows ===============
      case 'ArrowLeft':
        nextCellText = ''
        offsetCellIndex(-1)
        break

      case 'ArrowRight':
        nextCellText = ''
        offsetCellIndex(1)
        break

      case 'ArrowUp':
        nextCellText = ''
        nextFillText = offsetCellValue(1)
        break

      case 'ArrowDown':
        nextCellText = ''
        nextFillText = offsetCellValue(-1)
        break

      // =============== Number ===============
      default:
        if (!Number.isNaN(Number(key))) {
          nextCellText = focusCellText.value + key
          nextFillText = nextCellText
        }
        break
    }

    // Update cell text
    if (nextCellText !== null) {
      focusCellText.value = nextCellText

      if (nextCellText.length >= maskCellLen) {
        // Go to next cell
        offsetCellIndex(1)
        focusCellText.value = ''
      }
    }

    // Update the input text
    if (nextFillText !== null) {
      // Replace selection range with `nextCellText`
      const nextFocusValue =
        // before
        inputValue.value.slice(0, selectionStart.value) +
        // replace
        leftPad(nextFillText, maskCellLen) +
        // after
        inputValue.value.slice(selectionEnd.value)
      triggerInputChange(nextFocusValue.slice(0, props.format.length))
    }

    // Always trigger selection sync after key down
    forceSelectionSyncMark.value = {}
  }

  // ======================== Selection Sync ========================
  const rafRef = ref<any>()

  watch(
    [
      maskFormat,
      () => props.format,
      focused,
      inputValue,
      focusCellIndex,
      selectionStart,
      selectionEnd,
      forceSelectionSyncMark,
    ],
    () => {
      if (!focused.value || !props.format || mouseDownRef.value) {
        return
      }

      // Reset with format if not match
      if (!maskFormat.value.match(inputValue.value)) {
        triggerInputChange(props.format)
        return
      }

      // Match the selection range
      inputRef.value?.setSelectionRange(
        selectionStart.value,
        selectionEnd.value,
      )

      // Chrome has the bug anchor position looks not correct but actually correct
      rafRef.value = raf(() => {
        inputRef.value?.setSelectionRange(
          selectionStart.value,
          selectionEnd.value,
        )
      })
    },
    { flush: 'post' },
  )

  onBeforeUnmount(() => {
    raf.cancel(rafRef.value)
  })

  // ========================= Render =========================
  const holderCls = computed(() =>
    clsx(
      inputPrefixCls.value,
      {
        [`${inputPrefixCls.value}-active`]: props.active && props.showActiveCls,
        [`${inputPrefixCls.value}-placeholder`]: props.helped,
      },
      attrs.class as string,
    ),
  )

  const holderStyle = computed(() => (attrs.style as any) || undefined)

  const inputCls = computed(() => classNames.value?.input)
  const inputStyle = computed(() => styles.value?.input)
</script>

<template>
  <div ref="holder" :class="holderCls" :style="holderStyle">
    <component
      :is="inputComponent"
      ref="input"
      v-bind="restAttrs"
      :aria-invalid="invalid"
      :auto-complete="autoComplete ?? 'off'"
      :read-only="readOnly"
      :required="required"
      :name="name"
      :size="size"
      :id="id"
      :value="inputValue"
      :placeholder="placeholder"
      :disabled="disabled"
      :class="inputCls"
      :style="inputStyle"
      @focus="onFormatFocus"
      @blur="onFormatBlur"
      @keydown="onFormatKeyDown"
      @mousedown="onFormatMouseDown"
      @mouseup="onFormatMouseUp"
      @paste="onFormatPaste"
      @input="onInternalChange"
    />
    <Icon>
      <slot name="suffixIcon" />
    </Icon>
    <ClearIcon v-if="onClear" :onClear="onClear">
      <slot name="clearIcon" />
    </ClearIcon>
  </div>
</template>
