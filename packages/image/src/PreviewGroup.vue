<script setup vapor lang="ts">
  import type { OnGroupPreview } from './interface'
  import type {
    GroupPreviewConfig,
    PreviewGroupProps,
  } from './previewGroupTypes'

  import useMergedState from '@v-c/util/dist/hooks/useMergedState'
  import { computed, shallowRef, toRef, useSlots, watch } from 'vue'

  import { usePreviewGroupProvider } from './context'
  import usePreviewItems from './hooks/usePreviewItems'
  import Preview from './Preview/index.vue'

  defineOptions({ name: 'ImagePreviewGroup', inheritAttrs: false })

  const props = withDefaults(defineProps<PreviewGroupProps>(), {
    previewPrefixCls: 'vc-image-preview',
    icons: () => ({}),
  })
  const emit = defineEmits<{
    change: [next: number, prev: number]
  }>()

  const slots = useSlots()

  const mergedPreviewConfig = computed<GroupPreviewConfig>(() => {
    if (props.preview && typeof props.preview === 'object') {
      return props.preview as any
    }
    return {} as any
  })

  const previewOpen = computed(() => mergedPreviewConfig.value.open)
  const previewCurrent = computed(() => mergedPreviewConfig.value.current)

  // ========================== Items ===========================
  const [mergedItems, register, fromItems] = usePreviewItems(
    toRef(props, 'items'),
  )

  // ========================= Preview ==========================
  const [current, setCurrent] = useMergedState<number>(0, {
    value: previewCurrent as any,
  })

  const keepOpenIndex = shallowRef(false)

  // >>> Visible
  const [isShowPreview, setShowPreview] = useMergedState<boolean>(
    !!previewOpen.value,
    {
      value: previewOpen as any,
    },
  )

  const triggerShowPreview = (next: boolean) => {
    const prev = isShowPreview.value
    setShowPreview(next)

    if (next !== prev) {
      mergedPreviewConfig.value.onOpenChange?.(next, { current: current.value })
    }
  }

  // >>> Position
  const mousePosition = shallowRef<null | { x: number; y: number }>(null)

  const onPreviewFromImage: OnGroupPreview = (id, imageSrc, mouseX, mouseY) => {
    const itemsList = mergedItems.value
    const index = fromItems.value
      ? itemsList.findIndex(item => item.data.src === imageSrc)
      : itemsList.findIndex(item => item.id === id)

    setCurrent(index < 0 ? 0 : index)
    triggerShowPreview(true)
    mousePosition.value = { x: mouseX, y: mouseY }
    keepOpenIndex.value = true
  }

  // Reset current when reopen
  watch(isShowPreview, open => {
    if (open) {
      if (!keepOpenIndex.value) {
        setCurrent(0)
      }
    } else {
      keepOpenIndex.value = false
    }
  })

  // ========================== Events ==========================
  const onInternalChange: GroupPreviewConfig['onChange'] = (next, prev) => {
    setCurrent(next)
    mergedPreviewConfig.value.onChange?.(next, prev)
    emit('change', next, prev)
  }

  const onPreviewClose = () => {
    triggerShowPreview(false)
    mousePosition.value = null
  }

  // ========================= Context ==========================
  usePreviewGroupProvider({
    register,
    onPreview: onPreviewFromImage,
  })

  // ========================== Render ==========================
  const currentItem = computed(() => mergedItems.value[current.value])
  const previewSrc = computed(() => currentItem.value?.data?.src)
  const previewImgCommonProps = computed(() => {
    const { src: _src, ...rest } = currentItem.value?.data || ({} as any)
    return rest
  })

  const countRender = computed(() => {
    if (slots.countRender) {
      return ((currentNum: number, total: number) =>
        slots.countRender?.(currentNum, total)) as any
    }
    return mergedPreviewConfig.value.countRender
  })

  const restPreviewConfig = computed(() => {
    const config = mergedPreviewConfig.value as any
    const {
      open: _open,
      current: _current,
      onOpenChange: _onOpenChange,
      onChange: _onChange,
      ...rest
    } = config
    return rest
  })
</script>

<template>
  <slot />
  <Preview
    v-bind="restPreviewConfig"
    :aria-hidden="!isShowPreview"
    :open="isShowPreview"
    :prefixCls="previewPrefixCls"
    :onClose="onPreviewClose"
    :mousePosition="mousePosition"
    :imgCommonProps="previewImgCommonProps"
    :src="previewSrc"
    :fallback="fallback"
    :icons="icons"
    :current="current"
    :count="mergedItems.length"
    :onChange="onInternalChange as any"
    :countRender="countRender"
    :classNames="classNames?.popup"
    :styles="styles?.popup"
  >
    <template v-for="(_, name) in slots" :key="name" #[name]="slotProps">
      <slot :name="name" v-bind="slotProps || {}" />
    </template>
    <template #prevIcon>
      <slot name="prevIcon" />
    </template>
    <template #nextIcon>
      <slot name="nextIcon" />
    </template>
  </Preview>
</template>
