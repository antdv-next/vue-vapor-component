<script setup vapor lang="ts">
  import type { DrawerPanelProps } from './interface'

  import { clsx } from '@v-c/util'
  import pickAttrs from '@v-c/util/dist/pickAttrs'
  import { shallowRef, watch, useTemplateRef, useAttrs } from 'vue'

  import { useRefContext } from './context'

  defineOptions({ name: 'DrawerPanel' })
  const props = defineProps<DrawerPanelProps>()
  const emit = defineEmits<{
    mouseenter: [e: MouseEvent]
    mouseover: [e: MouseEvent]
    mouseleave: [e: MouseEvent]
    click: [e: MouseEvent]
    keydown: [e: KeyboardEvent]
    keyup: [e: KeyboardEvent]
  }>()
  const attrs = useAttrs()
  const { setPanel } = useRefContext()
  const internalRef = shallowRef<HTMLDivElement>()
  const mergeRefFun = useTemplateRef('mergeRefFun')

  watch(mergeRefFun, newMergeRef => {
    if (newMergeRef) {
      internalRef.value = newMergeRef
      setPanel?.(newMergeRef)
    }
  })
</script>

<template>
  <div
    :class="clsx(`${prefixCls}-section`, attrs.class)"
    :style="[attrs.style]"
    role="dialog"
    aria-modal="true"
    :id="id"
    ref="mergeRefFun"
    @mouseenter="e => emit('mouseenter', e)"
    @mouseover="e => emit('mouseover', e)"
    @mouseleave="e => emit('mouseleave', e)"
    @click="e => emit('click', e)"
    @keydown="e => emit('keydown', e)"
    @keyup="e => emit('keyup', e)"
    v-bind="pickAttrs(attrs, { aria: true })"
  >
    <slot />
  </div>
</template>
