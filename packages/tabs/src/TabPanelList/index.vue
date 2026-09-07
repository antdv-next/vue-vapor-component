<script setup vapor lang="ts">
  import type { CSSProperties } from 'vue'

  import type { AnimatedConfig, Tab, TabPosition } from '../interface'

  import { computed, reactive, watch } from 'vue'

  import { useTabContext } from '../TabContext'
  import TabPane from './TabPane.vue'

  interface TabPanelListProps {
    activeKey: string
    id: string | null
    animated?: AnimatedConfig
    tabPosition?: TabPosition
    destroyOnHidden?: boolean
    bodyStyle?: CSSProperties
    bodyClassName?: string
    contentStyle?: CSSProperties
    contentClassName?: string
  }

  const props = defineProps<TabPanelListProps>()

  const ctx = useTabContext()
  const tabs = computed<Tab[]>(() => ctx?.value?.tabs || [])
  const prefixCls = computed(() => ctx?.value?.prefixCls || '')

  const tabPaneAnimated = computed(() => props.animated?.tabPane === true)
  const tabPanePrefixCls = computed(() => `${prefixCls.value}-content`)

  function shouldRender(item: Tab) {
    if (item.key === props.activeKey) return true
    if (item.forceRender) return true
    if ((props.destroyOnHidden ?? item.destroyOnHidden) === true) return false
    return visitedKeys.has(item.key)
  }

  const visitedKeys = reactive(new Set<string>())
  watch(
    () => props.activeKey,
    key => {
      if (key != null) visitedKeys.add(key)
    },
    { immediate: true },
  )
</script>

<template>
  <div :class="`${prefixCls}-body-holder`">
    <div
      :class="[
        `${prefixCls}-body`,
        `${prefixCls}-body-${tabPosition}`,
        { [`${prefixCls}-body-animated`]: tabPaneAnimated },
        bodyClassName,
      ]"
      :style="bodyStyle"
    >
      <template v-for="item in tabs" :key="item.key">
        <TabPane
          v-if="shouldRender(item)"
          v-show="item.key === activeKey || item.forceRender"
          :id="id"
          :prefix-cls="tabPanePrefixCls"
          :tab-key="item.key"
          :animated="tabPaneAnimated"
          :active="item.key === activeKey"
          :style="{ ...(contentStyle || {}), ...(item.style || {}) }"
          :class-name="[
            contentClassName,
            item.className,
            item.key !== activeKey && `${tabPanePrefixCls}-hidden`,
          ]"
        >
          <template v-if="item.children">{{ item.children }}</template>
        </TabPane>
      </template>
    </div>
  </div>
</template>
