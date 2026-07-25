<script setup lang="ts">
  import Input from '@vapor-component/input'

  import '@/styles/input.less'
</script>

<template>
  <label>
    Input:
    <Input
      prefix-cls="vc-input"
      prefix="propPrefix"
      suffix="propSuffix"
      addon-before="propBefore"
      addon-after="propAfter"
      allow-clear
      :count="{ show: true, max: 5 }"
    />
    <br />
    <br />
    &nbsp;
    <Input prefix-cls="vc-input" allow-clear :count="{ show: true, max: 5 }">
      <template #prefix>slotPrefix</template>
      <template #suffix>slotSuffix</template>
      <template #addonBefore>slotBefore</template>
      <template #addonAfter>slotAfter</template>
      <template #clearIcon>*</template>
    </Input>
  </label>
</template>
