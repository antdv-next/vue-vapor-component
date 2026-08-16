import type { MaybeRef } from 'vue'
import type { Component, Ref } from 'vue'

import type {
  Key,
  NotificationConfig,
  NotificationListConfig,
} from '../interface'

import { computed, shallowRef, unref, watch } from 'vue'

import ContextHolder from '../ContextHolder.vue'

let uniqueKey = 0

function mergeConfig<T>(...objList: Partial<T>[]): T {
  const clone: any = {}
  objList.forEach((obj: any) => {
    if (obj) {
      Object.keys(obj).forEach(key => {
        const val = obj[key]
        if (val !== undefined) {
          clone[key] = val
        }
      })
    }
  })
  return clone
}

export interface NotificationAPI {
  open: (config: Partial<NotificationListConfig>) => void
  close: (key: Key) => void
  destroy: () => void
}

interface OpenTask {
  type: 'open'
  config: NotificationListConfig
}

interface CloseTask {
  type: 'close'
  key: Key
}

interface DestroyTask {
  type: 'destroy'
}

type Task = OpenTask | CloseTask | DestroyTask

export interface NotificationReturn {
  api: NotificationAPI
  ContextHolder: Component
  configRef: Ref<NotificationConfig>
  onReady: (ref: {
    open: (config: NotificationListConfig) => void
    close: (key: Key) => void
    destroy: () => void
  }) => void
}

export default function useNotification(
  rootConfig: MaybeRef<NotificationConfig> = {},
): NotificationReturn {
  const configRef = computed(() => unref(rootConfig) || {})

  const shareConfig = computed(() => {
    const { closable, duration, showProgress, placement } = configRef.value
    return { closable, duration, showProgress, placement }
  })

  const notificationRef = shallowRef<{
    open: (config: NotificationListConfig) => void
    close: (key: Key) => void
    destroy: () => void
  }>()
  const taskQueue = shallowRef<Task[]>([])

  const api: NotificationAPI = {
    open(config) {
      const mergedConfig = mergeConfig<NotificationListConfig>(
        shareConfig.value as Partial<NotificationListConfig>,
        config as Partial<NotificationListConfig>,
      )
      if (mergedConfig.key === null || mergedConfig.key === undefined) {
        mergedConfig.key = `vc-notification-${uniqueKey}`
        uniqueKey += 1
      }
      taskQueue.value = [
        ...taskQueue.value,
        { type: 'open', config: mergedConfig as NotificationListConfig },
      ]
    },
    close(key) {
      taskQueue.value = [...taskQueue.value, { type: 'close', key }]
    },
    destroy() {
      taskQueue.value = [...taskQueue.value, { type: 'destroy' }]
    },
  }

  function dispatchTasks() {
    if (notificationRef.value && taskQueue.value.length) {
      taskQueue.value.forEach(task => {
        switch (task.type) {
          case 'open':
            notificationRef.value?.open(task.config)
            break
          case 'close':
            notificationRef.value?.close(task.key)
            break
          case 'destroy':
            notificationRef.value?.destroy()
            break
        }
      })
      taskQueue.value = []
    }
  }

  const onReady = (ref: {
    open: (config: NotificationListConfig) => void
    close: (key: Key) => void
    destroy: () => void
  }) => {
    notificationRef.value = ref
    dispatchTasks()
  }

  watch(taskQueue, () => {
    if (notificationRef.value) {
      dispatchTasks()
    }
  })

  return {
    api,
    ContextHolder: ContextHolder as unknown as Component,
    configRef,
    onReady,
  }
}
