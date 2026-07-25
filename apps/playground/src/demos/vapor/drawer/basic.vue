<script setup vapor lang="ts">
  import Drawer from '@vapor-component/drawer'

  import { useDrawer } from '@/composables/useDrawer.ts'
  import '@/styles/drawer-common.less'
  import '@/styles/drawer-motion.less'

  const { open, motionProps, onClose, onToggle } = useDrawer()
</script>

<template>
  <label>
    Drawer:
    <Drawer
      :open="open"
      placement="right"
      width="60%"
      v-bind="motionProps"
      :after-open-change="
        c => {
          console.log('transitionEnd: ', c)
        }
      "
      @close="onClose"
    >
      content
    </Drawer>
    <button @click="onToggle">打开</button>
  </label>
</template>
