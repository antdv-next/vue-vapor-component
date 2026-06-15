<script setup vapor lang="ts">
  import type { PortalProps } from '@vapor-component/portal'

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
  useRefProvide(props)
  const onEsc: PortalProps['onEsc'] = ({ top, event }) => {
    const { keyboard = true } = props
    if (top && keyboard) {
      event.stopPropagation()
      props?.onClose?.(event)
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
      :onEsc="onEsc"
      :getContainer="getContainer"
      :autoLock="visible || animatedVisible"
    >
      <Dialog
        v-bind="props"
        :destroyOnHidden="destroyOnHidden"
        :afterClose="
          () => {
            const closableObj =
              props.closable && typeof props.closable === 'object'
                ? props.closable
                : {}
            closableObj.afterClose?.()
            afterClose?.()
            animatedVisible = false
          }
        "
      >
        <template v-for="slotName in panelSlots" #[slotName]>
          <slot :name="slotName" />
        </template>
      </Dialog>
    </Portal>
  </template>
</template>
