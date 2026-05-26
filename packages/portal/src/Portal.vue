<script setup vapor lang="ts">
  import type { PortalProps, ContainerType, GetContainer } from './interface'

  import canUseDom from '@v-c/util/dist/Dom/canUseDom'
  import { getDOM } from '@v-c/util/dist/Dom/findDOMNode'
  import { computed, onMounted, shallowRef, watch } from 'vue'

  import { useContextProvider } from './Context'
  import useDom from './useDom'
  import useEscKeyDown from './useEscKeyDown'
  import useScrollLocker from './useScrollLocker'

  defineOptions({ name: 'Portal', inheritAttrs: false })

  const props = withDefaults(defineProps<PortalProps>(), {
    autoDestroy: true,
  })

  // ====================== Should Render ======================
  const shouldRender = shallowRef(props.open)
  const mergedRender = computed(() => shouldRender.value || props.open)

  watch([() => props.open, () => props.autoDestroy], () => {
    if (props.autoDestroy || props.open) {
      shouldRender.value = props.open
    }
  })

  // ======================== Container ========================
  function getPortalContainer(getContainer: GetContainer) {
    if (getContainer === false) {
      return false
    }
    if (!canUseDom() || !getContainer) {
      return null
    }
    if (typeof getContainer === 'string') {
      return document.querySelector(getContainer)
    }
    if (typeof getContainer === 'function') {
      return getDOM(getContainer()) as ContainerType
    }
    return (
      typeof getContainer === 'object' ? getDOM(getContainer) : getContainer
    ) as ContainerType
  }

  const innerContainer = shallowRef<ContainerType | false | null>(
    getPortalContainer(props.getContainer!),
  )
  onMounted(() => {
    const customizeContainer = getPortalContainer(props.getContainer!)
    innerContainer.value = customizeContainer ?? null
  })

  watch(
    () => props.getContainer,
    () => {
      const customizeContainer = getPortalContainer(props.getContainer!)
      innerContainer.value = customizeContainer ?? null
    },
  )

  const [defaultContainer, queueCreate] = useDom(
    computed(() => !!(mergedRender.value && !innerContainer.value)),
    props.debug,
  )

  useContextProvider(queueCreate)

  const mergedContainer = computed(
    () => innerContainer.value ?? defaultContainer,
  )

  // ========================= Locker ==========================
  useScrollLocker(
    computed(
      () =>
        !!(
          props.autoLock &&
          props.open &&
          canUseDom() &&
          (mergedContainer.value === defaultContainer ||
            mergedContainer.value === document.body)
        ),
    ),
  )

  // ========================= Esc Keydown ==========================
  useEscKeyDown(
    computed(() => !!props.open),
    (...args) => {
      props.onEsc?.(...args)
    },
  )

  // ========================= Render ==========================
  const canRender = computed(
    () =>
      mergedRender.value && canUseDom() && innerContainer.value !== undefined,
  )
  const renderInline = computed(() => mergedContainer.value === false)
  const teleportTarget = computed(() => {
    const c = mergedContainer.value
    return c === false ? null : c
  })

  const elementEl = shallowRef()
  defineExpose({ elementEl })
</script>

<template>
  <template v-if="canRender">
    <slot v-if="renderInline" />
    <Teleport v-else :to="teleportTarget!">
      <slot />
    </Teleport>
  </template>
</template>
