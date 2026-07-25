<script setup vapor lang="ts">
  import Dialog from '@vapor-component/dialog'
  import { computed, ref } from 'vue'

  import { useDialog } from '@/composables/useDialog.ts'
  import '@/styles/dialog.less'

  const { visible } = useDialog()
  const divRef = ref<HTMLDivElement | null>(null)
  const getContainer = computed(() => () => divRef.value)
</script>

<template>
  <label>
    Dialog:
    <button @click="visible = !visible">Open Dialog</button>
    <Dialog
      v-model:visible="visible"
      title="Dialog Title"
      :get-container="getContainer"
      :force-render="true"
      :mask-closable="false"
      @close="
        () => {
          console.log('Dialog closed')
          visible = !visible
        }
      "
    >
      <p>This is the content of the dialog.</p>
      <p>You can put any content here, such as forms, text, or images.</p>
      <template #footer>
        <button @click="visible = !visible">Close</button>
      </template>
    </Dialog>
    <div ref="divRef" style="display: none" />
  </label>
</template>
