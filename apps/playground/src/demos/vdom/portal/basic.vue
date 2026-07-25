<script setup lang="ts">
  import Portal from '@vapor-component/portal'
  import { version } from 'vue'

  import { usePortal } from '@/composables/usePortal.ts'
  import '@/styles/portal.less'

  const {
    show,
    customizeContainer,
    lock,
    divRef,
    getContainer,
    contentCls,
    toggleShow,
    toggleCustomizeContainer,
    toggleLock,
  } = usePortal()
</script>

<template>
  <label>
    Portal:
    <div style="height: 200px">
      <div style="border: 2px solid red">
        Real Version: {{ version }}
        <button @click="toggleShow">show: {{ show.toString() }}</button>
        <button @click="toggleCustomizeContainer">
          customize container: {{ customizeContainer.toString() }}
        </button>
        <button @click="toggleLock">lock scroll: {{ lock.toString() }}</button>
        <div
          id="customize"
          ref="divRef"
          style="border: 1px solid green; min-height: 1px"
        />
      </div>

      <Portal :open="show" :get-container="getContainer" :auto-lock="lock">
        <p class="root" :class="[contentCls]">Hello Root</p>
        <Portal :open="show" :get-container="getContainer" :auto-lock="lock">
          <p class="parent" :class="[contentCls]">Hello Parent</p>
          <Portal :open="show" :get-container="getContainer" :auto-lock="lock">
            <p class="children" :class="[contentCls]">Hello Children</p>
          </Portal>
        </Portal>
      </Portal>
    </div>
  </label>
</template>
