<script setup vapor lang="ts">
  import type { ListyRef } from '@vapor-component/listy'

  import Listy from '@vapor-component/listy'
  import { ref } from 'vue'

  import '@/styles/listy.less'

  interface Item {
    id: number
    name: string
    group: string
  }

  const data: Item[] = []
  const groups = ['Fruits', 'Vegetables', 'Dairy', 'Meat', 'Grains']
  for (let i = 0; i < 500; i += 1) {
    data.push({
      id: i,
      name: `Item ${i}`,
      group: groups[i % groups.length],
    })
  }

  const listRef = ref<ListyRef>()
  const virtual = ref(true)

  function toggleMode() {
    virtual.value = !virtual.value
  }

  function scrollToTop() {
    listRef.value?.scrollTo(0)
  }

  function scrollToBottom() {
    listRef.value?.scrollTo({ key: String(data.length - 1), align: 'bottom' })
  }

  function scrollToGroup() {
    listRef.value?.scrollTo({ groupKey: 'Dairy', align: 'top' })
  }

  function scrollToItem() {
    listRef.value?.scrollTo({ key: '100', align: 'top', offset: 10 })
  }

  function onScroll(e: Event) {
    const target = e.currentTarget as HTMLElement
    console.log('scroll:', target.scrollTop)
  }
</script>

<template>
  <div style="padding: 16px; max-width: 480px; margin: 0 auto">
    <h2 style="margin: 0 0 12px 0">Listy Basic</h2>

    <div style="margin-bottom: 12px; display: flex; gap: 8px; flex-wrap: wrap">
      <button type="button" @click="toggleMode">
        {{ virtual ? 'Switch to Raw' : 'Switch to Virtual' }}
      </button>
      <button type="button" @click="scrollToTop">Scroll to Top</button>
      <button type="button" @click="scrollToBottom">Scroll to Bottom</button>
      <button type="button" @click="scrollToGroup">Scroll to Dairy</button>
      <button type="button" @click="scrollToItem">Scroll to Item 100</button>
    </div>

    <Listy
      ref="listRef"
      :items="data"
      row-key="id"
      :virtual="virtual"
      :height="400"
      :item-height="38"
      :group="{
        key: (item: Item) => item.group,
        title: (key: any, items: any[]) => `${key} (${items.length})`,
      }"
      :sticky="true"
      @scroll="onScroll"
    >
      <template #default="slotProps">
        <div
          :style="{
            height: '36px',
            lineHeight: '36px',
            padding: '0 12px',
            borderBottom: '1px solid #f0f0f0',
            boxSizing: 'border-box',
          }"
        >
          {{ (slotProps as any).item.name }} ({{
            (slotProps as any).item.group
          }}) — #{{ (slotProps as any).index }}
        </div>
      </template>
    </Listy>
  </div>
</template>

<style scoped>
  button {
    padding: 4px 12px;
    cursor: pointer;
    border: 1px solid #d9d9d9;
    border-radius: 4px;
    background: #fff;
  }
</style>
