<script setup vapor lang="ts">
  import Tabs from '@vapor-component/tabs'
  import { ref } from 'vue'

  import '@/styles/tabs.less'

  const destroy = ref(false)
  const items = ref([
    { label: 'Light', key: 'light', children: 'Light!', icon: '🌞' },
    { label: 'Bamboo', key: 'bamboo', children: 'Bamboo!', icon: '🎋' },
    {
      label: 'Cute',
      key: 'cute',
      children: 'Cute!',
      disabled: true,
      icon: '🐼',
    },
    { label: 'Yo', key: 'yo', children: 'Yo!', icon: '👋' },
  ])
  const direction = ref<'ltr' | 'rtl'>('ltr')

  function onTabClick(key: string) {
    console.log('onTabClick', key)
  }

  function onTabChange(key: string) {
    console.log('onTabChange', key)
  }
</script>

<template>
  <h4>Tabs Demo</h4>

  <div>
    <Tabs
      tab-bar-extra-content="extra"
      @tab-click="onTabClick"
      @change="onTabChange"
      :direction="direction"
      :items="items"
    />

    <button
      type="button"
      @click="
        () => {
          items = [{ key: 'yo', label: 'Yo', children: 'Yo!', icon: '👋' }]
        }
      "
    >
      Change children
    </button>

    <button
      type="button"
      @click="
        () => {
          destroy = true
        }
      "
    >
      Destroy
    </button>

    <button
      type="button"
      @click="
        () => {
          direction = direction === 'ltr' ? 'rtl' : 'ltr'
        }
      "
    >
      {{ direction === 'ltr' ? 'rtl' : 'ltr' }}
    </button>
  </div>
</template>
