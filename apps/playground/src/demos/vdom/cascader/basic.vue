<script setup lang="ts">
  import Cascader, {
    SHOW_CHILD,
  } from '@vapor-component/cascader'
  import { ref } from 'vue'

  import '@/styles/select.less'
  import '@/styles/cascader.less'

  const options = [
    {
      value: 'nation',
      label: 'Nation',
      children: [
        {
          value: 'china',
          label: 'China',
          children: [
            { value: 'beijing', label: 'Beijing' },
            { value: 'shanghai', label: 'Shanghai' },
            { value: 'shenzhen', label: 'Shenzhen' },
          ],
        },
        {
          value: 'usa',
          label: 'USA',
          children: [
            { value: 'new-york', label: 'New York' },
            { value: 'los-angeles', label: 'Los Angeles' },
          ],
        },
      ],
    },
    {
      value: 'food',
      label: 'Food',
      children: [
        {
          value: 'fruit',
          label: 'Fruit',
          children: [
            { value: 'apple', label: 'Apple' },
            { value: 'banana', label: 'Banana' },
          ],
        },
        {
          value: 'vegetable',
          label: 'Vegetable',
          children: [
            { value: 'carrot', label: 'Carrot' },
            { value: 'potato', label: 'Potato' },
          ],
        },
      ],
    },
  ]

  const singleValue = ref<any>(['nation', 'china', 'beijing'])
  const changeOnSelectValue = ref<any>(['nation', 'china'])
  const searchValue = ref<any>([])
  const checkableValue = ref<any>([['nation', 'china', 'beijing']])

  const onChange = (val: any, opts: any) => {
    console.log('[VDom Cascader] change:', val, opts)
  }
</script>

<template>
  <div
    style="max-width: 600px; display: flex; flex-direction: column; gap: 20px"
  >
    <h4>Cascader (VDom)</h4>

    <div>
      <p style="margin: 0 0 4px 0; font-size: 12px; color: #666">
        Single: {{ singleValue }}
      </p>
      <Cascader
        :value="singleValue"
        :options="options"
        placeholder="Select a location..."
        @change="
          (val) => {
            singleValue = val
            onChange(val, null)
          }
        "
      />
    </div>

    <div>
      <p style="margin: 0 0 4px 0; font-size: 12px; color: #666">
        Change on select: {{ changeOnSelectValue }}
      </p>
      <Cascader
        :value="changeOnSelectValue"
        :options="options"
        :change-on-select="true"
        placeholder="Select at any level..."
        @change="
          (val) => {
            changeOnSelectValue = val
          }
        "
      />
    </div>

    <div>
      <p style="margin: 0 0 4px 0; font-size: 12px; color: #666">
        With search: {{ searchValue }}
      </p>
      <Cascader
        :value="searchValue"
        :options="options"
        :show-search="true"
        placeholder="Search and select..."
        @change="
          (val) => {
            searchValue = val
          }
        "
      />
    </div>

    <div>
      <p style="margin: 0 0 4px 0; font-size: 12px; color: #666">
        Checkable: {{ checkableValue }}
      </p>
      <Cascader
        :value="checkableValue"
        :options="options"
        :checkable="true"
        :show-checked-strategy="SHOW_CHILD"
        placeholder="Check options..."
        @change="
          (val) => {
            checkableValue = val
          }
        "
      />
    </div>
  </div>
</template>
