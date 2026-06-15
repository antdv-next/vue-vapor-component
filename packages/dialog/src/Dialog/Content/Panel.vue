<script setup vapor lang="ts">
  import type { CSSProperties } from 'vue'

  import type { PanelProps } from './interface'

  import { clsx } from '@v-c/util'
  import { useLockFocus } from '@v-c/util/dist/Dom/focus'
  import { useFocusBoundaryProvider } from '@v-c/util/dist/Dom/focusBoundary'
  import pickAttrs from '@v-c/util/dist/pickAttrs'
  import { getStylePxValue } from '@v-c/util/dist/props-util'
  import { computed, shallowRef, useTemplateRef, watch } from 'vue'

  import { useGetRefContext } from '../../context'

  defineOptions({ name: 'Panel' })
  const props = defineProps<PanelProps>()
  const { setPanel } = useGetRefContext()
  const internalRef = shallowRef<HTMLDivElement>()

  const mergeRefFun = useTemplateRef('mergeRefFun')

  watch(mergeRefFun, newMergeRef => {
    if (newMergeRef) {
      internalRef.value = newMergeRef
      setPanel?.(newMergeRef)
      props?.holderRef?.(newMergeRef)
    }
  })

  const [, registerAllowedElement] = useLockFocus(
    computed(
      () => !!props.visible && !!props.isFixedPos && props.focusTrap !== false,
    ),
    () => internalRef.value!,
  )

  useFocusBoundaryProvider({
    registerAllowedElement,
  })

  defineExpose({
    focus: () => {
      internalRef.value?.focus?.({ preventScroll: true })
    },
  })

  const contentStyle = computed<CSSProperties>(() => {
    const style: CSSProperties = {}
    if (props.width !== undefined) {
      style.width = getStylePxValue(props.width)
    }
    if (props.height !== undefined) {
      style.height = getStylePxValue(props.height)
    }
    return style
  })

  const closableObj = computed(() => {
    if (typeof props.closable === 'object' && props.closable !== null) {
      return props.closable
    }
    if (props.closable) {
      return {
        closeIcon: props.closeIcon,
      }
    }
    return {}
  })

  const ariaProps = computed(() => pickAttrs(closableObj.value, true))

  const closeBtnIsDisabled = computed(
    () => typeof props.closable === 'object' && props.closable?.disabled,
  )
</script>

<template>
  <div
    key="dialog-element"
    role="dialog"
    :aria-labelledby="title && ariaId ? ariaId : null"
    aria-modal="true"
    ref="mergeRefFun"
    :style="{ ...style, ...contentStyle }"
    :class="[prefixCls, className]"
    @mousedown="e => onMouseDown?.(e)"
    @mouseup="e => onMouseUp?.(e)"
    tabindex="-1"
  >
    <slot name="modalRender">
      <div
        :class="clsx(`${prefixCls}-container`, classNames?.container)"
        :style="styles?.container"
      >
        <button
          v-if="closable"
          type="button"
          @click="onClose"
          aria-label="Close"
          v-bind="ariaProps"
          :class="clsx(`${prefixCls}-close`, classNames?.close)"
          :style="styles?.close"
          :disabled="closeBtnIsDisabled"
        >
          <slot name="closeIcon">
            <span :class="`${prefixCls}-close-x`" />
          </slot>
        </button>
        <slot name="header">
          <div
            v-if="title"
            :class="clsx(`${prefixCls}-header`, classNames?.header)"
            :style="{ ...styles?.header }"
          >
            <div
              :class="clsx(`${prefixCls}-title`, classNames?.title)"
              :id="ariaId"
              :style="{ ...styles?.title }"
            >
              {{ title }}
            </div>
          </div>
        </slot>

        <div
          :class="clsx(`${prefixCls}-body`, classNames?.body)"
          :style="{ ...bodyStyle, ...styles?.body }"
          v-bind="bodyProps"
        >
          <slot />
        </div>
        <div
          :class="clsx(`${prefixCls}-footer`, classNames?.footer)"
          :style="{ ...styles?.footer }"
        >
          <slot name="footer">
            {{ footer }}
          </slot>
        </div>
      </div>
    </slot>
  </div>
</template>
