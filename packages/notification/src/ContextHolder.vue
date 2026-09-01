<script setup vapor lang="ts">
  import type {
    NotificationConfig,
    NotificationListConfig,
    Key,
  } from './interface'

  import {
    shallowRef,
    computed,
    unref,
    onMounted,
    useTemplateRef,
    watch,
  } from 'vue'

  import Notifications from './Notifications.vue'

  const props = withDefaults(
    defineProps<{
      config?: NotificationConfig
    }>(),
    {
      config: () => ({}),
    },
  )
  const emit = defineEmits<{
    ready: [
      ref: {
        open: (config: NotificationListConfig) => void
        close: (key: Key) => void
        destroy: () => void
      },
    ]
  }>()

  const configRef = computed(() => unref(props.config) || {})
  const internalRef = useTemplateRef('notificationRef')
  const resolvedContainer = shallowRef<HTMLElement | ShadowRoot>()

  onMounted(() => {
    resolvedContainer.value = (
      configRef.value.getContainer || (() => document.body)
    )()
  })

  // When Notifications ref resolves, call back to the hook's own instance
  watch(internalRef, val => {
    if (val) {
      emit('ready', val)
    }
  })

  defineExpose({ notificationRef: internalRef })
</script>

<template>
  <Notifications
    ref="notificationRef"
    :container="resolvedContainer"
    :prefix-cls="configRef.prefixCls"
    :motion="configRef.motion"
    :max-count="configRef.maxCount"
    :pause-on-hover="configRef.pauseOnHover"
    :class-names="configRef.classNames"
    :styles="configRef.styles"
    :components="configRef.components"
    :class-name="configRef.className"
    :style="configRef.style"
    @all-removed="configRef.onAllRemoved"
    :stack="configRef.stack"
  />
</template>
