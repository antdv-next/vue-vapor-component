<script setup vapor lang="ts">
  import type {
    NotificationsProps,
    NotificationsRef,
    Placement,
    NotificationListConfig,
    InnerOpenConfig,
  } from './interface'

  import Portal from '@vapor-component/portal'
  import { computed, shallowRef, watch } from 'vue'

  import NotificationList from './NotificationList.vue'

  defineOptions({ name: 'Notifications' })

  const props = withDefaults(defineProps<NotificationsProps>(), {
    prefixCls: 'vc-notification',
  })
  const emit = defineEmits<{
    'all-removed': []
  }>()

  const configList = shallowRef<InnerOpenConfig[]>([])
  const placements = shallowRef<Partial<Record<Placement, InnerOpenConfig[]>>>(
    {},
  )

  // Group by placement
  watch(configList, () => {
    const next: Partial<Record<Placement, InnerOpenConfig[]>> = {}
    configList.value.forEach(config => {
      const placement = (config.placement ?? 'topRight') as Placement
      next[placement] = next[placement] || []
      next[placement].push(config)
    })
    // Keep existing placements so empty lists can finish leave motion
    Object.keys(placements.value).forEach(placement => {
      next[placement as Placement] = next[placement as Placement] || []
    })
    placements.value = next
  })

  const onNoticeClose = (key: string | number) => {
    configList.value = configList.value.filter(item => item.key !== key)
  }

  const onAllNoticeRemoved = (placement: Placement) => {
    const clone = { ...placements.value } as Record<
      Placement,
      InnerOpenConfig[]
    >
    const list = clone[placement] || []
    if (!list.length) {
      delete clone[placement]
    }
    placements.value = clone
  }

  const emptyRef = shallowRef(false)
  watch(placements, () => {
    if (Object.keys(placements.value).length > 0) {
      emptyRef.value = true
    } else if (emptyRef.value) {
      emit('all-removed')
      emptyRef.value = false
    }
  })

  const placementKeys = computed<Placement[]>(
    () => Object.keys(placements.value) as Placement[],
  )

  defineExpose<NotificationsRef>({
    open: (config: NotificationListConfig) => {
      const list = configList.value
      let clone = [...list]
      const index = clone.findIndex(item => item.key === config.key)
      const innerConfig: InnerOpenConfig = { ...config }
      if (index >= 0) {
        innerConfig.times = (list[index]?.times ?? 0) + 1
        clone[index] = innerConfig
      } else {
        innerConfig.times = 0
        clone.push(innerConfig)
      }
      const maxCount = props.maxCount ?? 0
      if (maxCount > 0 && clone.length > maxCount) {
        clone = clone.slice(-maxCount)
      }
      configList.value = clone
    },
    close: onNoticeClose,
    destroy: () => {
      configList.value = []
    },
  })
</script>

<template>
  <Portal
    v-if="container"
    :open="true"
    :auto-destroy="false"
    :get-container="() => container!"
  >
    <NotificationList
      v-for="placement in placementKeys"
      :key="placement"
      :config-list="placements[placement as Placement]"
      :placement="placement as Placement"
      :prefix-cls="prefixCls"
      :pause-on-hover="pauseOnHover"
      :class-names="classNames"
      :styles="styles"
      :components="components"
      :class-name="className?.(placement as Placement)"
      :style="style?.(placement as Placement)"
      :motion="motion"
      :stack="stack"
      @notice-close="onNoticeClose"
      @all-removed="onAllNoticeRemoved"
    />
  </Portal>
</template>
