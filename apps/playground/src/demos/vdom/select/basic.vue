<script setup lang="ts">
  import Select from '@vapor-component/select'
  import { ref } from 'vue'

  import '@/styles/select.less'

  const destroy = ref(false)
  const value = ref<string>('9')

  const options = [
    { label: '不选择', value: 'null' },
    { label: 'jack', value: '01', title: 'jack' },
    { label: 'lucy', value: '11' },
    { label: 'disabled', value: '21', disabled: true },
    {
      label: 'yiminghe',
      value: '31',
      className: 'test-option',
      style: { background: 'yellow' },
    },
    ...Array.from({ length: 10 }, (_, i) => ({
      label: `${i + 1}-text`,
      value: `v-${i + 1}`,
    })),
  ]

  const rtlOptions = [
    { label: '1', value: '1' },
    { label: '2', value: '2' },
  ]

  const onChange = (val: string) => {
    console.log('onChange', val)
    value.value = val
  }

  const onDestroy = () => {
    destroy.value = true
  }

  const onBlur = (v: any) => {
    console.log('onBlur', v)
  }

  const onFocus = () => {
    console.log('onFocus')
  }

  const onSearch = (val: string) => {
    console.log('Search:', val)
  }
</script>

<template>
  <div v-if="!destroy" style="margin: 20px">
    <div
      style="height: 150px; background: rgba(0, 255, 0, 0.1)"
      @mousedown="
        (e: MouseEvent) => {
          e.preventDefault()
        }
      "
    >
      Prevent Default
    </div>

    <h2>Single Select</h2>

    <div>
      <Select
        autoFocus
        id="my-select"
        :value="value"
        :options="options"
        placeholder="placeholder"
        showSearch
        allowClear
        @blur="onBlur"
        @focus="onFocus"
        @search="onSearch"
        @change="onChange"
      />
    </div>

    <h2>RTL Select</h2>

    <div style="width: 300px">
      <Select
        id="my-select-rtl"
        :options="rtlOptions"
        placeholder="rtl"
        direction="rtl"
        :popupMatchSelectWidth="300"
        :popupStyle="{ minWidth: '300px' }"
        style="width: 500px"
      />
    </div>

    <p>
      <button type="button" @click="onDestroy">destroy</button>
    </p>
  </div>
</template>

<style scoped></style>
