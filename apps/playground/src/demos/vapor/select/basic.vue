<script setup vapor lang="ts">
  import Select from '@vapor-component/select'
  import { ref } from 'vue'

  import '@/styles/select.less'

  const options = [
    { label: 'Apple', value: 'apple' },
    { label: 'Banana', value: 'banana' },
    { label: 'Cherry', value: 'cherry' },
    { label: 'Date', value: 'date' },
    { label: 'Elderberry', value: 'elderberry' },
    { label: 'Fig', value: 'fig' },
    { label: 'Grape', value: 'grape' },
    { label: 'Kiwi', value: 'kiwi' },
  ]

  const groupedOptions = [
    {
      label: 'Fruits',
      options: [
        { label: 'Apple', value: 'apple' },
        { label: 'Banana', value: 'banana' },
      ],
    },
    {
      label: 'Vegetables',
      options: [
        { label: 'Carrot', value: 'carrot' },
        { label: 'Potato', value: 'potato' },
      ],
    },
  ]

  const mode = ref<'combobox' | 'multiple' | 'tags'>('multiple')
  const singleValue = ref<string | null>('banana')
  const multiValue = ref<string[]>(['apple', 'cherry'])
  const tagsValue = ref<string[]>(['apple'])
  const disabledFlag = ref(false)
  const loadingFlag = ref(false)
  const allowClearFlag = ref(true)

  const currentValue = ref<any>(['apple', 'cherry'])
  const currentMode = ref('multiple')

  const modeOptions = ['single', 'multiple', 'tags', 'combobox']
</script>

<template>
  <div class="select-demo">
    <h4>Select (Vapor)</h4>

    <div class="demo-controls">
      <label>
        mode:
        <select
          :value="currentMode"
          @change="e => (currentMode = (e.target as HTMLSelectElement).value)"
        >
          <option v-for="m in modeOptions" :key="m" :value="m">{{ m }}</option>
        </select>
      </label>
      <label><input type="checkbox" v-model="disabledFlag" />disabled</label>
      <label><input type="checkbox" v-model="loadingFlag" />loading</label>
      <label
        ><input type="checkbox" v-model="allowClearFlag" />allowClear</label
      >
    </div>

    <div class="demo-area">
      <div class="demo-section">
        <p>
          Current value: <code>{{ JSON.stringify(currentValue) }}</code>
        </p>

        <Select
          :mode="currentMode === 'single' ? undefined : (currentMode as any)"
          :options="options"
          :value="currentValue"
          :show-search="true"
          :disabled="disabledFlag"
          :loading="loadingFlag"
          :allow-clear="allowClearFlag"
          :placeholder="'Select an option...'"
          :max-count="3"
          :max-tag-count="2"
          :default-active-first-option="true"
          @change="
            (val, opt) => {
              currentValue = val
              console.log('[Vapor] change:', val, opt)
            }
          "
          @focus="() => console.log('[Vapor] focus')"
          @blur="() => console.log('[Vapor] blur')"
          @search="val => console.log('[Vapor] search:', val)"
        />
      </div>

      <div class="demo-section">
        <p>Grouped options:</p>
        <Select
          :options="groupedOptions"
          :show-search="true"
          :placeholder="'Select from groups...'"
        />
      </div>

      <div class="demo-section">
        <p>Single mode with search:</p>
        <Select
          :value="singleValue"
          :options="options"
          :show-search="true"
          :placeholder="'Search fruits...'"
          :allow-clear="true"
          @change="
            val => {
              singleValue = val
            }
          "
        />
      </div>

      <div class="demo-section">
        <p>Tags mode (type and press Enter):</p>
        <Select
          mode="tags"
          :value="tagsValue"
          :options="options"
          :show-search="true"
          :placeholder="'Type to add tags...'"
          @change="
            val => {
              tagsValue = val
            }
          "
        />
      </div>
    </div>
  </div>
</template>

<style scoped>
  .select-demo {
    max-width: 600px;
  }
  .demo-controls {
    display: flex;
    flex-wrap: wrap;
    gap: 16px;
    margin-bottom: 16px;
    padding: 8px 0;
    border-bottom: 1px solid #eee;
  }
  .demo-controls label {
    display: flex;
    align-items: center;
    gap: 4px;
    font-size: 13px;
  }
  .demo-area {
    display: flex;
    flex-direction: column;
    gap: 16px;
  }
  .demo-section {
    display: flex;
    flex-direction: column;
    gap: 6px;
  }
  .demo-section p {
    margin: 0;
    font-size: 12px;
    color: #666;
  }
  .demo-section code {
    padding: 1px 4px;
    background: #f5f5f5;
    border-radius: 2px;
    font-size: 11px;
  }
</style>
