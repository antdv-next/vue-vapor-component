<script setup lang="ts">
import { ref } from 'vue'
import Tree from '@vapor-component/tree'

import '@/styles/tree.less'

const treeData = ref([
  {
    key: '0-0',
    title: 'parent 1',
    children: [
      {
        key: '0-0-0',
        title: 'parent 1-1',
        children: [
          { key: '0-0-0-0', title: 'parent 1-1-0' },
          { key: '0-0-0-1', title: 'parent 1-1-1' },
        ],
      },
      {
        key: '0-0-1',
        title: 'parent 1-2',
        children: [
          { key: '0-0-1-0', title: 'parent 1-2-0' },
          { key: '0-0-1-1', title: 'parent 1-2-1' },
          { key: '0-0-1-2', title: 'parent 1-2-2' },
        ],
      },
    ],
  },
  {
    key: '0-1',
    title: 'parent 2',
    children: [
      { key: '0-1-0', title: 'parent 2-0' },
      { key: '0-1-1', title: 'parent 2-1' },
    ],
  },
])

const onExpand = (expandedKeys: any[]) => {
  console.log('onExpand', expandedKeys)
}

const onSelect = (selectedKeys: any[], info: any) => {
  console.log('onSelect', selectedKeys, info)
}

const onCheck = (checkedKeys: any, info: any) => {
  console.log('onCheck', checkedKeys, info)
}
</script>

<template>
  <div style="margin: 0 20px">
    <h3>Selectable & Checkable</h3>
    <Tree
      show-line
      checkable
      default-expand-all
      :tree-data="treeData"
      @expand="onExpand"
      @select="onSelect"
      @check="onCheck"
    />

    <h3>Select Only</h3>
    <Tree
      show-line
      selectable
      default-expand-all
      :tree-data="treeData"
      @select="onSelect"
    />

    <h3>Check Only</h3>
    <Tree
      show-line
      checkable
      :selectable="false"
      default-expand-all
      :tree-data="treeData"
      @check="onCheck"
    />
  </div>
</template>