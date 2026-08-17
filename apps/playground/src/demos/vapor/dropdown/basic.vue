<script setup vapor lang="ts">
  import Dropdown, { placements } from '@vapor-component/dropdown'
  import { ref } from 'vue'

  import '@/styles/dropdown.less'

  const currentPlacement = ref('bottomLeft')
  const placementNames = ref(Object.keys(placements))
  const visible = ref(false)
  const arrow = ref(false)
</script>

<template>
  <div class="dropdown-demo">
    <h4>Basic Dropdown (Vapor)</h4>

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
      <label>
        <input type="checkbox" v-model="arrow" />
        arrow
      </label>
      <label>
        <input type="checkbox" v-model="visible" />
        visible (controlled)
      </label>
    </div>

    <div class="demo-area">
      <Dropdown
        :placement="currentPlacement"
        :arrow="arrow"
        :visible="visible"
        @visible-change="v => (visible = v)"
        :trigger="['click']"
      >
        <template #default="{ trigger, open, openClassName, setRef }">
          <div
            class="trigger-box"
            :ref="setRef"
            :class="{ [openClassName]: open }"
            v-bind="trigger"
          >
            Click Me
          </div>
        </template>
        <template #overlay>
          <div
            style="
              padding: 8px 12px;
              min-width: 120px;
              background: #fff;
              border: 1px solid #ccc;
              border-radius: 4px;
            "
          >
            Dropdown Menu
          </div>
        </template>
      </Dropdown>
    </div>
  </div>
</template>
