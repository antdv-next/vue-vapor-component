<script setup lang="ts">
  import Tooltip, { placements } from '@vapor-component/tooltip'
  import { ref } from 'vue'

  import '@/styles/tooltip.less'

  const currentPlacement = ref('right')
  const placementNames = ref(Object.keys(placements))
</script>

<template>
  <div class="tooltip-demo">
    <h4>Basic Tooltip</h4>

    <div class="demo-controls">
      <label>
        placement:
        <select
          :value="currentPlacement"
          @change="
            e => (currentPlacement = (e.target as HTMLSelectElement).value)
          "
        >
          <option v-for="name in placementNames" :key="name" :value="name">
            {{ name }}
          </option>
        </select>
      </label>
    </div>

    <div class="demo-area">
      <Tooltip
        :placement="currentPlacement"
        :mouse-enter-delay="0"
        :mouse-leave-delay="0.1"
        overlay="Hover me →"
      >
        <template #default="{ trigger }">
          <div class="trigger-box" v-bind="trigger">Hover</div>
        </template>
      </Tooltip>
    </div>
  </div>
</template>

<style scoped>
  .tooltip-demo {
    padding: 16px;
  }
  .demo-controls {
    display: flex;
    gap: 16px;
    align-items: center;
    margin-bottom: 24px;
  }
  .demo-controls select {
    padding: 4px 8px;
    font-size: 14px;
  }
  .demo-area {
    display: flex;
    justify-content: center;
    align-items: center;
    height: 200px;
    border: 1px dashed #ccc;
    border-radius: 4px;
  }
  .trigger-box {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 100px;
    height: 60px;
    border: 1px solid #111;
    border-radius: 4px;
    background: #fff;
    font-size: 14px;
    cursor: pointer;
  }
</style>
