<script setup lang="ts">
  import Menu from '@vapor-component/menu'
  import { ref, watch } from 'vue'

  import '@/styles/menu.less'

  const mode = ref<'vertical' | 'inline' | 'horizontal'>('vertical')
  const selectedKeys = ref<string[]>(['1'])
  const openKeys = ref<string[]>(['sub1'])
  const inlineCollapsed = ref(false)

  const handleClick = (info: any) => {
    console.log('click:', info)
  }

  const handleSelect = (info: any) => {
    console.log('select:', info)
  }

  const handleOpenChange = (keys: string[]) => {
    openKeys.value = keys
  }

  watch(mode, () => {
    if (mode.value !== 'inline') {
      openKeys.value = []
    }
  })
</script>

<template>
  <div class="menu-demo">
    <h4>Menu Demo</h4>

    <div class="demo-controls">
      <label>
        mode:
        <select
          :value="mode"
          @change="e => (mode = (e.target as HTMLSelectElement).value as any)"
        >
          <option value="vertical">vertical</option>
          <option value="horizontal">horizontal</option>
          <option value="inline">inline</option>
        </select>
      </label>
      <label v-if="mode === 'inline'">
        <input type="checkbox" v-model="inlineCollapsed" />
        inlineCollapsed
      </label>
    </div>

    <div class="demo-area">
      <Menu
        :mode="mode"
        :selected-keys="selectedKeys"
        :open-keys="openKeys"
        :inline-collapsed="inlineCollapsed"
        @select="handleSelect"
        @click="handleClick"
        @open-change="handleOpenChange"
        @update:selected-keys="keys => (selectedKeys = keys as string[])"
      >
        <Menu.Item event-key="1">Navigation - One</Menu.Item>
        <Menu.Item event-key="2">Navigation - Two</Menu.Item>

        <Menu.SubMenu event-key="sub1" title="Navigation - Sub">
          <template #items>
            <Menu.Item event-key="3">Option 3</Menu.Item>
            <Menu.Item event-key="4">Option 4</Menu.Item>

            <Menu.SubMenu event-key="sub2" title="Sub-Sub">
              <template #items>
                <Menu.Item event-key="5">Option 5</Menu.Item>
                <Menu.Item event-key="6">Option 6</Menu.Item>
              </template>
            </Menu.SubMenu>
          </template>
        </Menu.SubMenu>

        <Menu.Item event-key="7" disabled>Disabled Item</Menu.Item>

        <Menu.ItemGroup title="Group">
          <template #title>Group Label</template>
          <Menu.Item event-key="8">Option 8</Menu.Item>
          <Menu.Item event-key="9">Option 9</Menu.Item>
        </Menu.ItemGroup>

        <Menu.Divider />
        <Menu.Item event-key="10">Last Item</Menu.Item>
      </Menu>
    </div>

    <div class="demo-info">
      <p>selectedKeys: {{ selectedKeys }}</p>
      <p>openKeys: {{ openKeys }}</p>
    </div>
  </div>
</template>
