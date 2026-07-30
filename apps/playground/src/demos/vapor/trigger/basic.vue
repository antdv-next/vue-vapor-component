<script setup vapor lang="ts">
  import type { ActionType, BuildInPlacements } from '@vapor-component/trigger'

  import Trigger from '@vapor-component/trigger'
  import { computed, reactive } from 'vue'

  import '@/styles/trigger.less'

  const builtinPlacements: BuildInPlacements = {
    left: { points: ['cr', 'cl'], offset: [-10, 0] },
    right: { points: ['cl', 'cr'], offset: [10, 0] },
    top: { points: ['bc', 'tc'], offset: [0, -10] },
    bottom: { points: ['tc', 'bc'], offset: [0, 10] },
    topLeft: { points: ['bl', 'tl'], offset: [0, -10] },
    topRight: { points: ['br', 'tr'], offset: [0, -10] },
    bottomRight: { points: ['tr', 'br'], offset: [0, 10] },
    bottomLeft: { points: ['tl', 'bl'], offset: [0, 10] },
  }

  const state = reactive({
    mask: false,
    maskClosable: true,
    placement: 'bottom' as string,
    trigger: { click: true } as Record<string, boolean>,
    stretch: 'minWidth' as string | '',
    transitionName: 'vc-trigger-popup-zoom',
    autoDestroy: false,
    destroyed: false,
  })

  const popupAlign = computed(() => ({
    offset: [undefined, undefined] as any,
    overflow: { adjustX: 1, adjustY: 1 },
  }))

  const actions = computed(() => Object.keys(state.trigger) as ActionType[])

  const toggleAction = (name: string, checked: boolean) => {
    if (checked) state.trigger[name] = true
    else delete state.trigger[name]
  }
</script>

<template>
  <div v-if="!state.destroyed" class="trigger-demo">
    <div class="controls">
      <label>
        placement:
        <select v-model="state.placement">
          <option
            v-for="item in [
              'right',
              'left',
              'top',
              'bottom',
              'topLeft',
              'topRight',
              'bottomRight',
              'bottomLeft',
            ]"
            :key="item"
            :value="item"
          >
            {{ item }}
          </option>
        </select>
      </label>

      <label>
        Stretch:
        <select v-model="state.stretch">
          <option value="">-- NONE --</option>
          <option value="width">width</option>
          <option value="minWidth">minWidth</option>
          <option value="height">height</option>
          <option value="minHeight">minHeight</option>
        </select>
      </label>

      <label>
        <input
          type="checkbox"
          :checked="state.transitionName === 'vc-trigger-popup-zoom'"
          @change="
            state.transitionName = ($event.target as HTMLInputElement).checked
              ? 'vc-trigger-popup-zoom'
              : ''
          "
        />
        transitionName
      </label>

      <span class="actions-label">trigger:</span>
      <label
        v-for="name in ['hover', 'focus', 'click', 'contextMenu']"
        :key="name"
        class="action-label"
      >
        <input
          type="checkbox"
          :checked="!!state.trigger[name]"
          @change="
            toggleAction(name, ($event.target as HTMLInputElement).checked)
          "
        />
        {{ name }}
      </label>

      <label>
        <input type="checkbox" v-model="state.autoDestroy" />
        autoDestroy
      </label>
      <label>
        <input type="checkbox" v-model="state.mask" />
        mask
      </label>
      <label>
        <input type="checkbox" v-model="state.maskClosable" />
        maskClosable
      </label>
    </div>

    <div class="demo-area">
      <Trigger
        :popup-placement="state.placement"
        :popup-align="popupAlign"
        :auto-destroy="state.autoDestroy"
        :mask="state.mask"
        :mask-closable="state.maskClosable"
        :mask-motion="{ name: 'vc-trigger-mask-fade' }"
        :stretch="state.stretch || undefined"
        :action="actions"
        :builtin-placements="builtinPlacements"
        arrow
        :popup-style="{
          border: '1px solid red',
          padding: '10px',
          background: 'white',
          boxSizing: 'border-box',
        }"
        :popup="'vapor popup'"
        :popup-motion="{ name: state.transitionName }"
      >
        <template v-slot="{ open, trigger: triggerProps, setRef }">
          <button
            type="button"
            :ref="setRef"
            class="trigger-target"
            v-bind="triggerProps"
          >
            Vapor: Hover / Click me
            <span v-if="open" class="open-badge">[open]</span>
          </button>
        </template>
      </Trigger>
    </div>
  </div>

  <div v-else class="empty">
    <p>Trigger has been destroyed.</p>
    <button @click="state.destroyed = false">Recreate</button>
  </div>
</template>

<style scoped>
  .trigger-demo {
    padding: 20px;
  }

  .controls {
    display: flex;
    flex-wrap: wrap;
    gap: 12px;
    align-items: center;
    margin-bottom: 24px;
  }

  .controls label {
    display: flex;
    align-items: center;
    gap: 4px;
    font-size: 13px;
  }

  .actions-label {
    margin-left: 8px;
    font-size: 13px;
  }

  .action-label {
    font-size: 13px;
    margin-left: 6px;
  }

  .demo-area {
    margin: 120px 240px;
    position: relative;
    min-height: 200px;
  }

  .trigger-target {
    padding: 12px 24px;
    font-size: 14px;
    cursor: pointer;
    background: #fff;
    border: 1px solid #d9d9d9;
    border-radius: 6px;
  }

  .trigger-target:hover {
    border-color: #1890ff;
    color: #1890ff;
  }

  .open-badge {
    margin-left: 8px;
    font-size: 12px;
    color: #52c41a;
  }

  .empty {
    padding: 40px;
    text-align: center;
    color: #888;
  }
</style>
