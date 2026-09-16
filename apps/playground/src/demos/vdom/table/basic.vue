<script setup lang="ts">
  import type { ColumnsType } from '@vapor-component/table'

  import Table from '@vapor-component/table'
  import { ref } from 'vue'

  import '@/styles/table.less'

  interface DataType {
    key: number
    name: string
    age: number
    address: string
    tags: string[]
  }

  const data: DataType[] = Array.from({ length: 200 }, (_, i) => ({
    key: i,
    name: `Name ${i}`,
    age: 20 + (i % 50),
    address: `Address ${i}`,
    tags: [`tag${i % 3}`, `tag${i % 5}`],
  }))

  const columns: ColumnsType<DataType> = [
    { title: 'Name', dataIndex: 'name', width: 200 },
    { title: 'Age', dataIndex: 'age', width: 100 },
    { title: 'Address', dataIndex: 'address', width: 300 },
    {
      title: 'Tags',
      dataIndex: 'tags',
      width: 200,
      // render: (value: string[]) => value.map(tag => `<span style="display:inline-block;padding:2px 8px;border:1px solid red;border-radius:4px;margin:0 4px">${tag}</span>`),
    },
  ]

  const expandedRowKeys = ref<(string | number)[]>([])

  function onExpandedRowsChange(keys: (string | number)[]) {
    expandedRowKeys.value = keys
  }
</script>

<template>
  <div>
    <h2>Table Basic</h2>
    <div style="margin-bottom: 16px; height: 400px; overflow: auto">
      <Table
        :data="data"
        :columns="columns"
        :scroll="{ y: 350, x: 800 }"
        v-model:expanded-row-keys="expandedRowKeys"
        :expandable="{
          rowExpandable: record => record.age < 40,
        }"
      >
        <template #render="{ column, value }">
          <template v-if="column.title === 'Tags'">
            <span
              v-for="tag in value"
              :key="tag"
              style="
                display: inline-block;
                padding: 2px 8px;
                border: 1px solid red;
                border-radius: 4px;
                margin: 0 4px;
              "
            >
              {{ tag }}
            </span>
          </template>
        </template>
        <template #expandedRowRender="{ record }">
          <b>Expanded row for {{ record.name }}</b>
        </template>
      </Table>
    </div>
  </div>
</template>
