<script setup vapor lang="ts">
  import type { CSSProperties } from 'vue'

  import type { ResizableTextAreaRef, TextAreaProps } from './interface'

  import { clsx } from '@v-c/util'
  import omit from '@v-c/util/dist/omit'
  import { getAttrStyleAndClass } from '@v-c/util/dist/props-util'
  import raf from '@v-c/util/dist/raf'
  import {
    computed,
    nextTick,
    onUnmounted,
    shallowRef,
    useAttrs,
    useTemplateRef,
    ref,
    watch,
  } from 'vue'

  import { useResizeObserver } from '../../resize-observer/src'
  import calculateAutoSizeStyle from './calculateNodeHeight'

  defineOptions({ name: 'ResizableTextArea', inheritAttrs: false })

  const props = withDefaults(defineProps<TextAreaProps>(), {
    prefixCls: 'vc-textarea',
  })
  const attrs = useAttrs()

  const RESIZE_START = 0 as const
  const RESIZE_MEASURING = 1 as const
  const RESIZE_STABLE = 2 as const

  type ResizeState =
    | typeof RESIZE_START
    | typeof RESIZE_MEASURING
    | typeof RESIZE_STABLE

  // =============================== Value ================================
  const internalValue = shallowRef(props?.value ?? props?.defaultValue ?? '')
  watch(
    () => props.value,
    () => {
      internalValue.value = props.value
    },
  )
  const mergedValue = computed(() => internalValue.value ?? '')

  const onInternalChange = (e: any) => {
    if (props.value === undefined) {
      internalValue.value = e.target.value
    }
    props?.onChange?.(e)
  }

  // ================================ Ref =================================
  const textareaRef = useTemplateRef<HTMLTextAreaElement>('textarea')
  defineExpose({
    textArea: textareaRef,
  })

  // ============================== AutoSize ==============================
  const autoSizeData = computed(() => {
    const { autoSize } = props
    if (autoSize && typeof autoSize === 'object') {
      return [autoSize.minRows, autoSize.maxRows]
    }

    return []
  })
  const minRows = computed(() => autoSizeData?.value?.[0])
  const maxRows = computed(() => autoSizeData?.value?.[1])

  // =============================== Resize ===============================
  const resizeState = ref<ResizeState>(RESIZE_STABLE)
  const autoSizeStyle = shallowRef<CSSProperties>({})
  const startResize = () => {
    resizeState.value = RESIZE_START
  }

  const needAutoSize = computed(() => !!props.autoSize)

  // Change to trigger resize measure
  watch(
    [() => props.value, minRows, maxRows, needAutoSize],
    async () => {
      await nextTick()
      if (needAutoSize.value) {
        startResize()
      }
    },
    {
      immediate: true,
      flush: 'post',
    },
  )

  watch([resizeState, textareaRef], () => {
    if (!textareaRef.value) {
      return
    }
    if (resizeState.value === RESIZE_START) {
      resizeState.value = RESIZE_MEASURING
    } else if (resizeState.value === RESIZE_MEASURING) {
      const textareaStyles = calculateAutoSizeStyle(
        textareaRef.value!,
        false,
        minRows.value,
        maxRows.value,
      )

      // Safari has bug that text will keep break line on text cut when it's prev is break line.
      // ZombieJ: This not often happen. So we just skip it.
      // const { selectionStart, selectionEnd, scrollTop } = textareaRef.current;
      // const { value: tmpValue } = textareaRef.current;
      // textareaRef.current.value = '';
      // textareaRef.current.value = tmpValue;

      // if (document.activeElement === textareaRef.current) {
      //   textareaRef.current.scrollTop = scrollTop;
      //   textareaRef.current.setSelectionRange(selectionStart, selectionEnd);
      // }
      resizeState.value = RESIZE_STABLE
      autoSizeStyle.value = textareaStyles
    } else {
      // https://github.com/react-component/textarea/pull/23
      // Firefox has blink issue before but fixed in latest version.
    }
  })
  // We lock resize trigger by raf to avoid Safari warning
  const resizeRafRef = shallowRef<number>()
  const cleanRaf = () => {
    raf.cancel(resizeRafRef.value!)
  }

  const onInternalResize = (size: { width: number; height: number }) => {
    if (resizeState.value === RESIZE_STABLE) {
      props?.onResize?.(size)
      if (props.autoSize) {
        cleanRaf()
        resizeRafRef.value = raf(() => {
          startResize()
        })
      }
    }
  }
  onUnmounted(() => {
    cleanRaf()
  })

  useResizeObserver(
    computed(() => {
      return !!(props.autoSize || props.onResize)
    }),
    textareaRef,
    onInternalResize,
  )
  // =============================== Render ===============================

  const mergedStyle = computed<CSSProperties>(() => {
    const mergedAutoSizeStyle = needAutoSize.value ? autoSizeStyle.value : null
    return {
      ...(attrs.style as CSSProperties),
      ...mergedAutoSizeStyle,
      ...(resizeState.value === RESIZE_START ||
      resizeState.value === RESIZE_MEASURING
        ? { overflowY: 'hidden', overflowX: 'hidden' }
        : {}),
    }
  })
  const textareaClass = computed(() => {
    const { prefixCls, disabled } = props
    return clsx(prefixCls, attrs.class, {
      [`${prefixCls}-disabled`]: disabled,
    })
  })
  const textAreaProps = computed(() => {
    const { restAttrs } = getAttrStyleAndClass(attrs)
    const isReadonly: any = {}
    if (restAttrs?.readonly || props.readOnly) {
      isReadonly['readonly'] = restAttrs?.readonly ?? props.readOnly
    }
    return {
      ...omit(restAttrs, ['readonly']),
      ...omit(props, [
        'suffix',
        'classNames',
        'styles',
        'prefixCls',
        'allowClear',
        'autoSize',
        'showCount',
        'disabled',
        'hidden',
        'readOnly',
        'onClear',
        'maxLength',
        'onResize',
        'onChange',
        'prefix',
      ]),
      ...isReadonly,
    }
  })
</script>

<template>
  <textarea
    ref="textarea"
    v-bind="textAreaProps"
    :class="textareaClass"
    :style="mergedStyle"
    :disabled="disabled"
    :value="mergedValue"
    @input="onInternalChange"
  />
</template>
