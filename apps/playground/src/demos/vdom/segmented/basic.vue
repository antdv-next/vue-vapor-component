<script setup lang="ts">
  import Segmented from '@vapor-component/segmented'

  import '@/styles/segmented.less'
</script>

<template>
  <label>
    Segmented:
    <Segmented
      :options="['ios', 'android', 'harmony']"
      default-value="ios"
      @change="v => console.log('selected option', v)"
    />
  </label>
</template>
