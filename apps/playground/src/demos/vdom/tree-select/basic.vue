<script setup lang="ts">
  import TreeSelect, {
    SHOW_ALL,
    SHOW_CHILD,
    SHOW_PARENT,
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
    console.log('change:', val, labels, extra)
  }

  const onSelect = (val: any, option: any) => {
    console.log('select:', val, option)
  }

  const onDeselect = (val: any, option: any) => {
    console.log('deselect:', val, option)
  }

  console.log('SHOW_ALL:', SHOW_ALL)
  console.log('SHOW_CHILD:', SHOW_CHILD)
  console.log('SHOW_PARENT:', SHOW_PARENT)
</script>

<template>
  <div
    style="max-width: 600px; display: flex; flex-direction: column; gap: 20px"
  >
    <h4>TreeSelect (vdom mode)</h4>

    <div>
      <p style="margin: 0 0 4px 0; font-size: 12px; color: #666">
        Single select: {{ singleValue }}
      </p>
      <TreeSelect
        v-model:value="singleValue"
        :tree-data="treeData"
        :show-search="true"
        placeholder="Select one..."
        :disabled="disabledFlag"
        @change="onChange"
        @select="onSelect"
        @deselect="onDeselect"
      />
    </div>

    <div>
      <p style="margin: 0 0 4px 0; font-size: 12px; color: #666">
        Multiple select: {{ multipleValue }}
      </p>
      <TreeSelect
        v-model:value="multipleValue"
        :tree-data="treeData"
        multiple
        :show-search="true"
        placeholder="Select multiple..."
        @change="onChange"
      />
    </div>

    <div>
      <p style="margin: 0 0 4px 0; font-size: 12px; color: #666">
        Checkable (SHOW_CHILD): {{ checkableValue }}
      </p>
      <TreeSelect
        v-model:value="checkableValue"
        :tree-data="treeData"
        tree-checkable
        :show-search="true"
        :show-checked-strategy="SHOW_CHILD"
        placeholder="Check nodes..."
        @change="onChange"
      />
    </div>

    <div>
      <p style="margin: 0 0 4px 0; font-size: 12px; color: #666">
        Checkable strictly (SHOW_ALL): {{ strictlyValue }}
      </p>
      <TreeSelect
        v-model:value="strictlyValue"
        :tree-data="treeData"
        tree-checkable
        tree-check-strictly
        :show-search="true"
        :show-checked-strategy="SHOW_ALL"
        placeholder="Check strictly..."
        @change="onChange"
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
