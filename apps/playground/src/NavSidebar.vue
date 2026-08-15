<script setup lang="ts">
  import { useRouter } from 'vue-router'

  import { demoManifest } from '@/routes'
  import { currentComponent, currentCase } from '@/shared'

  const router = useRouter()

  function navigate(component: string, caseName: string) {
    router.push(`/${component}/${caseName}`)
  }

  function goHome() {
    router.push('/')
  }

  const isActive = currentComponent === '' && currentCase === ''
</script>

<template>
  <div class="nav">
    <div class="nav-brand" :class="{ active: isActive }" @click="goHome">
      <svg class="logo" viewBox="0 0 128 128" width="36" height="36">
        <path fill="#42b883" d="M78.8,10L64,35.4L49.2,10H0l64,110l64-110C128,10,78.8,10,78.8,10z"></path>
        <path fill="#35495e" d="M78.8,10L64,35.4L49.2,10H25.6L64,76l38.4-66H78.8z"></path>
      </svg>
    </div>
    <div v-for="group in demoManifest" :key="group.component" class="nav-group">
      <div class="nav-group-title">{{ group.label }}</div>
      <div
        v-for="caseItem in group.cases"
        :key="caseItem.name"
        class="nav-item"
        :class="{
          active:
            currentComponent === group.component &&
            currentCase === caseItem.name,
        }"
        @click="navigate(group.component, caseItem.name)"
      >
        {{ caseItem.label }}
      </div>
    </div>
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
  .brand-icon {
    width: 80px;
    height: 80px;
  }
  .nav-group {
    margin-bottom: 8px;
  }
  .nav-group-title {
    padding: 4px 12px;
    font-size: 12px;
    color: #bbb;
    text-transform: uppercase;
  }
  .nav-item {
    padding: 6px 12px 6px 20px;
    cursor: pointer;
    font-size: 13px;
    border-left: 2px solid transparent;
  }
  .nav-item:hover {
    background: #f5f5f5;
  }
  .nav-item.active {
    background: #e6f7ff;
    border-left-color: #1890ff;
    color: #1890ff;
  }
</style>
