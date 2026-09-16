<script lang="ts">
  import type { SharedPickerProps, ValueDate } from '../../interface'
  import type { FooterProps, PopupPanelProps } from './interface'

  export type PopupProps<
    DateType extends object = any,
    PresetValue = DateType,
  > = {
    onFocus?: (event: FocusEvent) => void
    onBlur?: (event: FocusEvent) => void
  } & FooterProps<DateType> &
    PopupPanelProps<DateType> & {
      panelRender?: SharedPickerProps['panelRender']
      presets: ValueDate<PresetValue>[]
      onPresetHover: (presetValue: PresetValue | null) => void
      onPresetSubmit: (presetValue: PresetValue) => void

      activeInfo?: [
        activeInputLeft: number,
        activeInputRight: number,
        selectorWidth: number,
      ]
      direction?: 'ltr' | 'rtl'

      defaultOpenValue: DateType

      needConfirm: boolean | undefined
      isInvalid: (date: DateType | DateType[]) => boolean
      onOk: VoidFunction

      onPanelMouseDown?: (event: MouseEvent) => void

      /**
       * Callback that receives the popup container element whenever it mounts
       * or changes, so the owning Picker can check whether focus is still inside
       * the popup. Vapor unwraps `Ref`s in template bindings, so the element
       * is passed directly rather than as a `Ref`.
       * 回调函数，在 popup 容器元素挂载或变化时通知外层 Picker，
       * 供其判断焦点是否仍在 popup 内。vapor 在模板绑定中会解包 `Ref`，
       * 因此直接传递元素而非 `Ref`。
       */
      popupContainerRef?: (el: HTMLDivElement | undefined) => void

      classNames?: SharedPickerProps['classNames']
      styles?: SharedPickerProps['styles']
    }
</script>

<script setup vapor lang="ts">
  import type { VueNode } from '@v-c/util/dist/type'
  import type { OnResize } from '@vapor-component/resize-observer'

  import type { PanelMode } from '../../interface'

  import { clsx } from '@v-c/util'
  import { useResizeObserver } from '@vapor-component/resize-observer'
  import { computed, nextTick, ref, useTemplateRef, watch } from 'vue'

  import { cloneProps, toArray } from '../../utils/miscUtil'
  import { usePickerContext } from '../context'
  import Footer from './Footer.vue'
  import PopupPanel from './PopupPanel.vue'
  import PresetPanel from './PresetPanel.vue'

  defineOptions({ name: 'Popup', inheritAttrs: false })

  const props = defineProps<PopupProps>()

  const ctx = usePickerContext()

  const prefixCls = computed(() => ctx.value.prefixCls || 'vc-picker')
  const panelPrefixCls = computed(() => `${prefixCls.value}-panel`)

  // `||` rather than `??`: vapor may coerce an absent non-boolean prop to
  // `false`, which would defeat the `??` fallback (skill rule 12).
  // `||` 而非 `??`：vapor 可能把缺省的非布尔 prop 强制为 `false`，`??` 会失效
  // （规则 12）。
  const activeInfo = computed<[number, number, number]>(
    () => (props.activeInfo as [number, number, number]) || [0, 0, 0],
  )

  const rtl = computed(() => props.direction === 'rtl')

  // ========================= Refs =========================
  const arrowRef = useTemplateRef<HTMLDivElement>('arrow')
  const wrapperRef = useTemplateRef<HTMLDivElement>('wrapper')
  const containerRef = useTemplateRef<HTMLDivElement>('container')

  // The owning Picker reads the same node for focus-containment checks. Vapor
  // unwraps `Ref`s in template bindings, so the element is synced via callback
  // instead of by writing to a shared `Ref`.
  // Picker 用同一个节点做焦点包含判断。vapor 在模板绑定中会解包 `Ref`，
  // 因此通过回调同步元素，而不是写入共享的 `Ref`。
  watch(
    [containerRef, () => props.popupContainerRef],
    ([el, callback]) => {
      if (typeof callback === 'function') callback(el || undefined)
    },
    { immediate: true },
  )

  // ======================== Offset ========================
  const containerWidth = ref(0)
  const containerOffset = ref(0)
  const arrowOffset = ref(0)

  const onResize: OnResize = info => {
    if (info.width) containerWidth.value = info.width
  }

  const rangeEnabled = ref(props.range)
  watch(
    () => props.range,
    val => {
      rangeEnabled.value = val
    },
  )
  useResizeObserver(rangeEnabled, containerRef as any, onResize)

  const retryTimes = ref(0)

  const calculateOffsets = () => {
    const [activeInputLeft, activeInputRight, selectorWidth] = activeInfo.value
    if (props.range && wrapperRef.value) {
      const arrowWidth = arrowRef.value?.offsetWidth || 0
      const wrapperRect = wrapperRef.value.getBoundingClientRect()

      // Wrapper is not ready (zero height or off-screen) — retry on next frame.
      // wrapper 未就绪（高度为 0 或在屏外）— 下一帧重试。
      if (!wrapperRect.height || wrapperRect.right < 0) {
        if (retryTimes.value > 0) {
          retryTimes.value--
          requestAnimationFrame(calculateOffsets)
        }
        return
      }

      const nextArrowOffset =
        (rtl.value ? activeInputRight - arrowWidth : activeInputLeft) -
        wrapperRect.left
      arrowOffset.value = nextArrowOffset

      if (containerWidth.value && containerWidth.value < selectorWidth) {
        const offset = rtl.value
          ? wrapperRect.right -
            (activeInputRight - arrowWidth + containerWidth.value)
          : activeInputLeft +
            arrowWidth -
            wrapperRect.left -
            containerWidth.value
        containerOffset.value = Math.max(0, offset)
      } else {
        containerOffset.value = 0
      }
    }
  }

  watch(
    () => props.activeInfo,
    async () => {
      retryTimes.value = 10
      await nextTick()
      calculateOffsets()
    },
    { immediate: true },
  )

  watch(
    [rtl, containerWidth, () => props.range],
    async () => {
      await nextTick()
      calculateOffsets()
    },
    { flush: 'post' },
  )

  // ========================= Props =========================
  const multiple = computed(() => props.multiple)
  const showNow = computed(() => props.showNow)
  const internalMode = computed(() => props.internalMode)
  const panelRender = computed(() => props.panelRender)
  const styles = computed(() => props.styles)
  const classNames = computed(() => props.classNames)

  // ======================== Footer ========================
  function filterEmpty<T>(list: T[]) {
    return list.filter(item => item)
  }

  const valueList = computed(() => filterEmpty(toArray(props.value)))

  const isTimePickerEmptyValue = computed(
    () => props.picker === 'time' && !valueList.value.length,
  )

  const footerSubmitValue = computed(() =>
    isTimePickerEmptyValue.value
      ? filterEmpty([props.defaultOpenValue])
      : valueList.value,
  )

  const popupPanelValue = computed(() =>
    isTimePickerEmptyValue.value ? props.defaultOpenValue : valueList.value,
  )

  const disableSubmit = computed(() => {
    // Empty is invalid
    if (!footerSubmitValue.value.length) return true
    return footerSubmitValue.value.some(val => props.isInvalid(val!))
  })

  const onFooterSubmit = () => {
    // For TimePicker, additionally trigger the value update.
    if (isTimePickerEmptyValue.value) {
      props.onSelect?.(props.defaultOpenValue)
    }

    props.onOk()
    props.onSubmit?.()
  }

  // `cloneProps` instead of `{...omit(props, ['onSubmit'])}` (rule 18): a vapor
  // props proxy's `getOwnPropertyDescriptor` trap returns `undefined` for
  // emit-listened keys, so the spread operator silently drops `onXxx` handlers.
  // 用 `cloneProps` 替代 `{...omit(props, ['onSubmit'])}`（规则 18）：vapor 的
  // props proxy 对 emit 绑定的 key 返回 `undefined`，spread 会静默丢掉 `onXxx`。
  const footerProps = computed(() => {
    const baseProps = cloneProps(props as any, [
      'onSubmit',
      'showNow',
      'invalid',
    ])
    baseProps.showNow = multiple.value ? false : showNow.value
    baseProps.invalid = disableSubmit.value
    baseProps.onSubmit = onFooterSubmit
    return baseProps as FooterProps<any>
  })

  // `cloneProps` returns `Record<string, any>`; the cast restores the declared
  // `FooterProps` / `PopupPanelProps` shape so `v-bind` type-checks.
  const popupPanelProps = computed(
    () => cloneProps(props as any) as PopupPanelProps<any>,
  )

  // ======================== Render ========================
  // Vapor deviation: a vapor node cannot be carried around, so `panelRender`
  // receives the current panel mode instead of the default panel node and its
  // return value replaces the whole panel body.
  // Vapor 偏差：vapor 节点无法传递，因此 `panelRender` 收到的是当前面板 mode
  // 而不是默认面板节点，返回值替换整个面板主体。
  const mergedPanelNode = computed<VueNode | undefined>(() => {
    if (typeof panelRender.value !== 'function') return undefined
    return panelRender.value(props.mode as PanelMode)
  })

  const onPanelFocusIn = (event: FocusEvent) => {
    props.onFocus?.(event)
  }

  const onPanelFocusOut = (event: FocusEvent) => {
    props.onBlur?.(event)
  }

  const onInternalPanelMouseDown = (event: MouseEvent) => {
    props.onPanelMouseDown?.(event)
    event.preventDefault()
  }

  const containerPrefixCls = computed(() => `${panelPrefixCls.value}-container`)
  const panelLayoutCls = computed(() => `${prefixCls.value}-panel-layout`)

  const containerCls = computed(() =>
    clsx(
      containerPrefixCls.value,
      // Used for the Today button style, safe to remove if not needed.
      `${prefixCls.value}-${internalMode.value}-panel-container`,
      classNames.value?.popup?.container,
    ),
  )

  const containerStyle = computed(() => ({
    [rtl.value ? 'marginRight' : 'marginLeft']: `${containerOffset.value}px`,
    [rtl.value ? 'marginLeft' : 'marginRight']: 'auto',
    ...styles.value?.popup?.container,
  }))

  const rangeWrapperCls = computed(() =>
    clsx(
      `${prefixCls.value}-range-wrapper`,
      `${prefixCls.value}-${props.picker}-range-wrapper`,
    ),
  )

  const rangeArrowCls = computed(() => `${prefixCls.value}-range-arrow`)

  const arrowStyle = computed(() => ({ left: `${arrowOffset.value}px` }))
</script>

<template>
  <div
    v-if="range"
    ref="wrapper"
    :class="rangeWrapperCls"
    @mousedown="onInternalPanelMouseDown"
  >
    <div ref="arrow" :class="rangeArrowCls" :style="arrowStyle" />
    <div
      ref="container"
      :class="containerCls"
      :style="containerStyle"
      tabindex="-1"
      @mousedown="onInternalPanelMouseDown"
      @focusin="onPanelFocusIn"
      @focusout="onPanelFocusOut"
    >
      <slot v-if="mergedPanelNode" name="panel">
        <template v-if="typeof mergedPanelNode === 'string'">
          <span>{{ mergedPanelNode }}</span>
        </template>
        <component v-else-if="mergedPanelNode" :is="mergedPanelNode" />
      </slot>
      <div v-else :class="panelLayoutCls">
        <PresetPanel
          :prefix-cls="prefixCls"
          :presets="presets"
          :onClick="onPresetSubmit"
          :onHover="onPresetHover"
        />
        <div>
          <PopupPanel v-bind="popupPanelProps" :value="popupPanelValue" />
          <Footer v-bind="footerProps">
            <template #extraFooter>
              <slot name="extraFooter" />
            </template>
          </Footer>
        </div>
      </div>
    </div>
  </div>
  <div
    v-else
    ref="container"
    :class="containerCls"
    :style="containerStyle"
    tabindex="-1"
    @mousedown="onInternalPanelMouseDown"
    @focusin="onPanelFocusIn"
    @focusout="onPanelFocusOut"
  >
    <slot v-if="mergedPanelNode" name="panel">
      <template v-if="typeof mergedPanelNode === 'string'">
        <span>{{ mergedPanelNode }}</span>
      </template>
      <component v-else-if="mergedPanelNode" :is="mergedPanelNode" />
    </slot>
    <div v-else :class="panelLayoutCls">
      <PresetPanel
        :prefix-cls="prefixCls"
        :presets="presets"
        :onClick="onPresetSubmit"
        :onHover="onPresetHover"
      />
      <div>
        <PopupPanel v-bind="popupPanelProps" :value="popupPanelValue" />
        <Footer v-bind="footerProps">
          <template #extraFooter>
            <slot name="extraFooter" />
          </template>
        </Footer>
      </div>
    </div>
  </div>
</template>
