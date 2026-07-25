<script setup lang="ts">
  import NavSidebar from './NavSidebar.vue'
</script>

<template>
  <div class="router-app">
    <aside class="nav-sidebar">
      <NavSidebar />
    </aside>
    <main class="demo-area">
      <router-view />
    </main>
  </div>
</template>

<style scoped>
  .router-app {
    display: flex;
    height: 100vh;
  }
  .nav-sidebar {
    width: 220px;
    border-right: 1px solid #eee;
    overflow-y: auto;
    flex-shrink: 0;
  }
  .demo-area {
    flex: 1;
    padding: 16px;
    overflow-y: auto;
  }
</style>
