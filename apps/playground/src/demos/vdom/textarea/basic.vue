<script setup lang="ts">
  import TextArea from '@vapor-component/textarea'

  import { useTextArea } from '@/composables/useTextArea.ts'
  import '@/styles/textarea.less'

  const { textValue, handleTextAreaChange } = useTextArea()
</script>

<template>
  <label>
    TextArea:
    <TextArea
      v-model:value="textValue"
      prefix-cls="vc-textarea"
      prefix="propPrefix"
      suffix="propSuffix"
      allow-clear
      :count="{ show: true, max: 20 }"
      :auto-size="{ minRows: 2, maxRows: 4 }"
      @change="handleTextAreaChange"
    />
    <br />
    <br />
    <TextArea
      prefix-cls="vc-textarea"
      allow-clear
      :count="{ show: true, max: 10 }"
      placeholder="slot based textarea"
    >
      <template #prefix>slotPrefix</template>
      <template #suffix>slotSuffix</template>
      <template #clearIcon>*</template>
    </TextArea>
  </label>
</template>
