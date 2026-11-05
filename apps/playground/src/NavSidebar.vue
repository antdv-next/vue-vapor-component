<script setup lang="ts">
  import Menu from '@vapor-component/menu'
  import { computed } from 'vue'
  import { useRouter } from 'vue-router'

  import { demoManifest } from '@/routes'
  import { currentComponent, currentCase } from '@/shared'
  import '@/styles/menu.less'

  const router = useRouter()

  const isActive = computed(
    () => currentComponent.value === '' && currentCase.value === '',
  )

  // Current route as a single menu key: "<component>/<case>"
  const activeKeys = computed(() => {
    const { value: component } = currentComponent
    const { value: caseName } = currentCase
    return component && caseName ? [`${component}/${caseName}`] : []
  })

  function goHome() {
    router.push('/')
  }

  function handleMenuClick(info: { key: string }) {
    router.push(`/${info.key}`)
  }
</script>

<template>
  <div class="nav">
    <div class="nav-brand" :class="{ active: isActive }" @click="goHome">
      <svg class="logo" viewBox="0 0 128 128" width="36" height="36">
        <path
          fill="#42b883"
          d="M78.8,10L64,35.4L49.2,10H0l64,110l64-110C128,10,78.8,10,78.8,10z"
        ></path>
        <path
          fill="#35495e"
          d="M78.8,10L64,35.4L49.2,10H25.6L64,76l38.4-66H78.8z"
        ></path>
      </svg>
    </div>
    <Menu
      :selectable="false"
      :selected-keys="activeKeys"
      @click="handleMenuClick"
    >
      <Menu.ItemGroup
        v-for="group in demoManifest"
        :key="group.component"
        :title="group.label"
      >
        <Menu.Item
          v-for="caseItem in group.cases"
          :key="caseItem.name"
          :event-key="`${group.component}/${caseItem.name}`"
        >
          {{ caseItem.label }}
        </Menu.Item>
      </Menu.ItemGroup>
    </Menu>
  </div>
</template>

<style scoped>
  .nav {
    padding: 12px 0;
  }
  .nav-brand {
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 12px 0 16px;
    margin-bottom: 8px;
    cursor: pointer;
    color: #999;
    transition: color 0.2s;
  }
  .nav-brand:hover,
  .nav-brand.active {
    color: #1890ff;
  }
  .nav :deep(.vc-menu) {
    border: none;
    box-shadow: none;
  }
  .nav :deep(.vc-menu-item) {
    border-left: 2px solid transparent;
  }
  .nav :deep(.vc-menu-item-selected) {
    border-left-color: #1890ff;
  }
</style>
