<script setup lang="ts">
  import Rate from '@vapor-component/rate'

  import '@/styles/rate.less'
</script>

<template>
  <label>
    Rate:
    <Rate
      :default-value="2.5"
      style="font-size: 40px"
      allow-half
      :allow-clear="false"
      @change="(v: number) => console.log('selected star', v)"
    />
  </label>
</template>
