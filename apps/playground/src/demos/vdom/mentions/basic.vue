<script setup lang="ts">
  import Mentions from '@vapor-component/mentions'
  import { ref, shallowRef } from 'vue'

  import '@/styles/mentions.less'

  const mentionsValue = ref('')
  const options = shallowRef([
    { label: 'John', value: 'John' },
    { label: 'Jack', value: 'Jack' },
    { label: 'Jasmyn', value: 'Jasmyn' },
  ])

  const handleChange = (v: string) => {
    mentionsValue.value = v
  }

  const handleSelect = (option: any, prefix: string) => {
    console.log('select:', option, prefix)
  }

  const handleSearch = (text: string, prefix: string) => {
    console.log('search:', text, prefix)
  }
</script>

<template>
  <label>
    Mentions (options):
    <Mentions
      v-model:value="mentionsValue"
      prefix-cls="vc-mentions"
      :options="options"
      placeholder="Type @ to mention someone"
      :rows="3"
      @change="handleChange"
      @select="handleSelect"
      @search="handleSearch"
    />
    <br />
    <br />
    <p>Value: {{ mentionsValue }}</p>
  </label>
</template>
