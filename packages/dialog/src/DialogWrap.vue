<script setup vapor lang="ts">
  import type { IDialogPropTypes } from './IDialogPropTypes'

  import Portal from '@vapor-component/portal'
  import { shallowRef, watch } from 'vue'

  import { useRefProvide } from './context'
  import Dialog from './Dialog/index.vue'
  import { panelSlots } from './util'
  defineOptions({ name: 'DialogWrap' })
  const props = withDefaults(defineProps<IDialogPropTypes>(), {
    getContainer: undefined,
    closeIcon: undefined,
    prefixCls: 'vc-dialog',
    keyboard: true,
    focusTriggerAfterClose: true,
    closable: true,
    mask: true,
    maskClosable: true,
    destroyOnHidden: false,
    forceRender: false,
  })
  const animatedVisible = shallowRef(false)
  const emit = defineEmits<{
    close: [e?: any]
  }>()
  useRefProvide(props)
  const onEsc = ({ top, event }: { top: boolean; event: KeyboardEvent }) => {
    const { keyboard = true } = props
    if (top && keyboard) {
      event.stopPropagation()
      emit('close', event)
    }
  }
  const onAfterClose = () => {
    animatedVisible.value = false
    if (props.afterClose) {
      props.afterClose()
    }
    if (typeof props.closable === 'object' && props.closable?.afterClose) {
      props.closable.afterClose()
    }
  }
  watch(
    () => props.visible,
    () => {
      if (props.visible) {
        animatedVisible.value = true
      }
    },
    {
      immediate: true,
    },
  )
</script>

<template>
  <template v-if="!forceRender && destroyOnHidden && !animatedVisible">
    <!-- Do nothing -->
  </template>
  <template v-else>
    <Portal
      :open="visible || forceRender || animatedVisible"
      :autoDestroy="false"
      @esc="onEsc"
      :getContainer="getContainer"
      :autoLock="visible || animatedVisible"
    >
      <Dialog
        v-bind="props"
        :destroyOnHidden="destroyOnHidden"
        @close="e => emit('close', e)"
        @after-close="onAfterClose"
      >
        <template v-for="slotName in panelSlots" #[slotName]>
          <slot :name="slotName" />
        </template>
      </Dialog>
    </Portal>
  </template>
</template>
