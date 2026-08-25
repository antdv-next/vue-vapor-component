<script setup vapor lang="ts">
  import TreeSelect, {
    SHOW_ALL,
    SHOW_CHILD,
  } from '@vapor-component/tree-select'
  import { ref } from 'vue'

  import '@/styles/select.less'
  import '@/styles/tree.less'
  import '@/styles/tree-select.less'

  const treeData = [
    {
      label: 'Fruits',
      key: 'fruits',
      value: 'fruits',
      children: [
        { label: 'Apple', key: 'apple', value: 'apple' },
        { label: 'Banana', key: 'banana', value: 'banana' },
        { label: 'Cherry', key: 'cherry', value: 'cherry' },
      ],
    },
    {
      label: 'Vegetables',
      key: 'vegetables',
      value: 'vegetables',
      children: [
        { label: 'Carrot', key: 'carrot', value: 'carrot' },
        { label: 'Potato', key: 'potato', value: 'potato' },
        {
          label: 'Pepper',
          key: 'pepper',
          value: 'pepper',
          children: [
            { label: 'Bell Pepper', key: 'bell-pepper', value: 'bell-pepper' },
            {
              label: 'Chili Pepper',
              key: 'chili-pepper',
              value: 'chili-pepper',
            },
          ],
        },
      ],
    },
    {
      label: 'Grains',
      key: 'grains',
      value: 'grains',
      children: [
        { label: 'Wheat', key: 'wheat', value: 'wheat' },
        { label: 'Rice', key: 'rice', value: 'rice' },
        { label: 'Corn', key: 'corn', value: 'corn' },
      ],
    },
  ]

  const singleValue = ref<string | null>('apple')
  const multipleValue = ref<string[]>(['apple', 'carrot'])
  const checkableValue = ref<string[]>(['fruits'])
  const strictlyValue = ref<string[]>(['apple', 'banana'])
  const searchValue = ref<string[]>([])
  const disabledFlag = ref(false)

  const onChange = (val: any, labels: any, extra: any) => {
    console.log('[Vapor] change:', val, labels, extra)
  }
</script>

<template>
  <div
    style="max-width: 600px; display: flex; flex-direction: column; gap: 20px"
  >
    <h4>TreeSelect (Vapor)</h4>

    <div>
      <p style="margin: 0 0 4px 0; font-size: 12px; color: #666">
        Single: {{ singleValue }}
      </p>
      <TreeSelect
        :value="singleValue"
        :tree-data="treeData"
        :show-search="true"
        placeholder="Select one..."
        @change="
          val => {
            singleValue = val
            onChange(val, null, {})
          }
        "
      />
    </div>

    <div>
      <p style="margin: 0 0 4px 0; font-size: 12px; color: #666">
        Multiple: {{ multipleValue }}
      </p>
      <TreeSelect
        :value="multipleValue"
        :tree-data="treeData"
        multiple
        :show-search="true"
        placeholder="Select multiple..."
        @change="
          val => {
            multipleValue = val
          }
        "
      />
    </div>

    <div>
      <p style="margin: 0 0 4px 0; font-size: 12px; color: #666">
        Checkable (SHOW_CHILD): {{ checkableValue }}
      </p>
      <TreeSelect
        :value="checkableValue"
        :tree-data="treeData"
        tree-checkable
        :show-search="true"
        :show-checked-strategy="SHOW_CHILD"
        placeholder="Check nodes..."
        @change="
          val => {
            checkableValue = val
          }
        "
      />
    </div>

    <div>
      <p style="margin: 0 0 4px 0; font-size: 12px; color: #666">
        Checkable strictly (SHOW_ALL): {{ strictlyValue }}
      </p>
      <TreeSelect
        :value="strictlyValue"
        :tree-data="treeData"
        tree-checkable
        tree-check-strictly
        :show-search="true"
        :show-checked-strategy="SHOW_ALL"
        placeholder="Check strictly..."
        @change="
          val => {
            strictlyValue = val
          }
        "
      />
    </div>

    <div>
      <p style="margin: 0 0 4px 0; font-size: 12px; color: #666">
        With search: {{ searchValue }}
      </p>
      <TreeSelect
        v-model:value="searchValue"
        :tree-data="treeData"
        multiple
        :show-search="{
          placeholder: 'Search...',
          filterTreeNode: true,
          treeNodeFilterProp: 'value',
        }"
        placeholder="Search and select..."
        @change="onChange"
      />
    </div>
  </div>
</template>
