<script setup vapor lang="ts">
  import Dialog from '@vapor-component/dialog'
  import { useDialog } from '@/composables/useDialog'
  import '@/styles/dialog.less'

  const { visible } = useDialog()
</script>

<template>
  <label>
    Dialog:
    <button @click="visible = true">Open Dialog</button>
    <Dialog
      v-model:visible="visible"
      title="Dialog Title"
      :mask-closable="false"
      @close="() => { console.log('Dialog closed'); visible = false }"
    >
      <p>This is the content of the dialog.</p>
      <p>You can put any content here, such as forms, text, or images.</p>
      <template #footer>
        <button @click="visible = false">Close</button>
      </template>
    </Dialog>
  </label>
</template>
