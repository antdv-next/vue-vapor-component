<script setup vapor lang="ts">
  import type { Actions, FooterProps } from '../interface'

  import { clsx } from '@v-c/util'
  import { computed } from 'vue'

  defineOptions({ name: 'ImagePreviewFooter' })

  const props = defineProps<FooterProps>()
  const emit = defineEmits<{
    close: []
    active: [offset: number]
    'flip-y': []
    'flip-x': []
    'rotate-left': []
    'rotate-right': []
    'zoom-out': []
    'zoom-in': []
    reset: []
  }>()
  const footerCls = computed(() =>
    clsx(`${props.prefixCls}-footer`, props.classNames?.footer),
  )
  const actionsCls = computed(() =>
    clsx(`${props.prefixCls}-actions`, props.classNames?.actions),
  )
  // Payload bound to the `actions` slot so callers can render a fully custom
  // toolbar while still driving the built-in transform/navigation handlers.
  const renderResult = computed(() => ({
    actions: {
      onActive: (offset: number) => emit('active', offset),
      onFlipY: () => emit('flip-y'),
      onFlipX: () => emit('flip-x'),
      onRotateLeft: () => emit('rotate-left'),
      onRotateRight: () => emit('rotate-right'),
      onZoomOut: () => emit('zoom-out'),
      onZoomIn: () => emit('zoom-in'),
      onReset: () => emit('reset'),
      onClose: () => emit('close'),
    } satisfies Actions,
    transform: props.transform,
    current: props.current,
    total: props.count,
    image: props.image,
    minScale: props.minScale,
    maxScale: props.maxScale,
    actionsCls: actionsCls.value,
    actionCls: `${props.prefixCls}-actions-action`,
    disabledCls: `${props.prefixCls}-actions-action-disabled`,
  }))
</script>

<template>
  <div :class="footerCls" :style="styles?.footer">
    <!-- Progress -->
    <div v-if="showProgress" :class="`${prefixCls}-progress`">
      <slot name="countRender" :current="current + 1" :count="count">
        <bdi>{{ current + 1 }} / {{ count }}</bdi>
      </slot>
    </div>

    <!-- Actions: exposed via slot, bound with renderResult -->
    <slot name="actionsRender" v-bind="renderResult">
      <div :class="actionsCls" :style="styles?.actions">
        <button
          @click="renderResult.actions.onFlipY"
          :class="renderResult.actionCls"
        >
          ⇅
        </button>
        <button
          @click="renderResult.actions.onFlipX"
          :class="renderResult.actionCls"
        >
          ⇋
        </button>
        <button
          @click="renderResult.actions.onRotateLeft"
          :class="renderResult.actionCls"
        >
          ↺
        </button>
        <button
          @click="renderResult.actions.onRotateRight"
          :class="renderResult.actionCls"
        >
          ↻
        </button>
        <button
          @click="renderResult.actions.onZoomOut"
          :class="[
            transform.scale <= minScale ? renderResult.disabledCls : '',
            renderResult.actionCls,
          ]"
          :disabled="transform.scale <= minScale"
        >
          -
        </button>
        <button
          @click="renderResult.actions.onZoomIn"
          :class="[
            transform.scale >= maxScale ? renderResult.disabledCls : '',
            renderResult.actionCls,
          ]"
          :disabled="transform.scale >= maxScale"
        >
          +
        </button>
      </div>
    </slot>
  </div>
</template>
