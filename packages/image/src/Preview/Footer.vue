<script setup vapor lang="ts">
  import type { FooterProps } from './footerTypes'
  import type { Actions } from './types'

  import { clsx } from '@v-c/util'
  import { computed } from 'vue'

  defineOptions({ name: 'ImagePreviewFooter' })

  const props = defineProps<FooterProps>()
  const footerCls = computed(() =>
    clsx(`${props.prefixCls}-footer`, props.classNames?.footer),
  )
  const actionsCls = computed(() =>
    clsx(`${props.prefixCls}-actions`, props.classNames?.actions),
  )
  const closeCls = computed(() =>
    clsx(`${props.prefixCls}-close`, props.classNames?.close),
  )

  function handleClose() {
    props.onClose?.()
  }

  // Payload bound to the `actions` slot so callers can render a fully custom
  // toolbar while still driving the built-in transform/navigation handlers.
  const renderResult = computed(() => ({
    actions: {
      onActive: props.onActive,
      onFlipY: props.onFlipY,
      onFlipX: props.onFlipX,
      onRotateLeft: props.onRotateLeft,
      onRotateRight: props.onRotateRight,
      onZoomOut: props.onZoomOut,
      onZoomIn: props.onZoomIn,
      onReset: props.onReset,
      onClose: props.onClose,
    } satisfies Actions,
    transform: props.transform,
    current: props.current,
    total: props.count,
    image: props.image,
    // 兼容判断disabled需自行判断是否达到边界值
    minScale: props.minScale,
    maxScale: props.maxScale,
    actionCls: `${props.prefixCls}-actions-action`,
    disabledCls: `${props.prefixCls}-actions-action-disabled`,
  }))
</script>

<template>
  <!-- Close Button -->
  <button
    v-if="showClose"
    :class="closeCls"
    :style="styles?.close"
    type="button"
    @click="handleClose"
  >
    <slot name="closeIcon"></slot>
  </button>

  <div :class="footerCls" :style="styles?.footer">
    <!-- Progress -->
    <div v-if="showProgress" :class="`${prefixCls}-progress`">
      <slot name="countRender" :current="current + 1" :count="count">
        <bdi>{{ current + 1 }} / {{ count }}</bdi>
      </slot>
    </div>

    <!-- Actions: exposed via slot, bound with renderResult -->
    <slot name="actions" v-bind="renderResult">
      <div :class="actionsCls" :style="styles?.actions">
        <slot name="actionsRender" v-bind="renderResult"></slot>
      </div>
    </slot>
  </div>
</template>
