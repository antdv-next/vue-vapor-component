<script setup lang="ts">
  import Steps from '@vapor-component/steps'

  import { useSteps } from '@/composables/useSteps.ts'
  import '@/styles/steps.less'

  const { current, items } = useSteps()
</script>

<template>
  <label>
    Steps:
    <Steps
      title-placement="vertical"
      class="vc-steps-label-vertical"
      :current="current"
      :items="items"
    >
      <template #iconRender="{ index, icon }">
        <component :is="icon">{{ index }}</component>
      </template>
    </Steps>
  </label>
</template>
