<script setup vapor lang="ts">
  import type { VueNode } from '@v-c/util/dist/type'
  import type { CSSProperties } from 'vue'

  import type { CoverConfig, ImageProps, PreviewConfig } from './imageTypes'
  import type { ImageElementProps } from './interface'

  import { clsx, omit } from '@v-c/util'
  import useMergedState from '@v-c/util/dist/hooks/useMergedState'
  import pickAttrs from '@v-c/util/dist/pickAttrs'
  import {
    getAttrStyleAndClass,
    getStylePxValue,
  } from '@v-c/util/dist/props-util'
  import { computed, shallowRef, useAttrs, useSlots } from 'vue'

  import { COMMON_PROPS } from './common'
  import { usePreviewGroupContext } from './context'
  import useRegisterImage from './hooks/useRegisterImage'
  import useStatus from './hooks/useStatus'
  import Preview from './Preview/index.vue'

  defineOptions({ name: 'Image', inheritAttrs: false })

  const props = withDefaults(defineProps<ImageProps>(), {
    prefixCls: 'vc-image',
    preview: true,
  })

  const attrs = useAttrs()
  const slots = useSlots()

  const groupContext = usePreviewGroupContext()

  const prefixCls = computed(() => props.prefixCls ?? 'vc-image')
  const previewPrefixCls = computed(
    () => props.previewPrefixCls ?? `${prefixCls.value}-preview`,
  )

  // ========================== Preview ===========================
  const canPreview = computed(() => !!props.preview)

  const mergedPreviewConfig = computed<PreviewConfig>(() => {
    if (props.preview && typeof props.preview === 'object') {
      return props.preview
    }
    return {} as any
  })

  const previewSrc = computed(() => mergedPreviewConfig.value.src)
  const previewOpen = computed(() => mergedPreviewConfig.value.open)
  const cover = computed(() => mergedPreviewConfig.value.cover)
  const previewRootClassName = computed(
    () => mergedPreviewConfig.value.rootClassName,
  )

  // ============================ Open ============================
  const [isShowPreview, setShowPreview] = useMergedState<boolean>(
    !!previewOpen.value,
    {
      value: previewOpen as any,
    },
  )

  const mousePosition = shallowRef<null | { x: number; y: number }>(null)

  const triggerPreviewOpen = (nextOpen: boolean) => {
    setShowPreview(nextOpen)
    mergedPreviewConfig.value.onOpenChange?.(nextOpen)
  }

  const onPreviewClose = () => {
    triggerPreviewOpen(false)
    mousePosition.value = null
  }

  // ========================= ImageProps =========================
  const isCustomPlaceholder = computed(
    () =>
      !!slots.placeholder ||
      !!(props.placeholder && props.placeholder !== true),
  )

  const src = computed(() => previewSrc.value ?? props.src)
  const [getImgRef, srcAndOnload, status] = useStatus({
    src: computed(() => props.src),
    isCustomPlaceholder,
    fallback: computed(() => props.fallback),
  })

  const imgCommonProps = computed(() => {
    const obj: ImageElementProps = {} as any
    COMMON_PROPS.forEach(prop => {
      const fromProps = (props as any)[prop]
      const fromAttrs = (attrs as any)[prop]
      const val = fromProps !== undefined ? fromProps : fromAttrs
      if (val !== undefined) {
        ;(obj as any)[prop] = val
      }
    })
    return obj
  })

  // ========================== Register ==========================
  const registerData = computed<ImageElementProps>(
    () =>
      ({
        ...imgCommonProps.value,
        src: src.value,
      }) as ImageElementProps,
  )

  const imageId = useRegisterImage(canPreview, registerData)

  // ========================== Preview ===========================
  const onPreview = (e: MouseEvent) => {
    const target = (e.currentTarget || e.target) as HTMLElement
    const rect = target.getBoundingClientRect()
    const left = rect.x + rect.width / 2
    const top = rect.y + rect.height / 2

    // Defer opening to the next frame. Vue Vapor delegates `click` on
    // `document`; if we open synchronously, the preview's close button is
    // mounted while this very click is still being dispatched and receives
    // it, instantly closing the preview again. Opening next frame ensures the
    // close button isn't in the DOM during this click's dispatch.
    requestAnimationFrame(() => {
      if (groupContext) {
        groupContext.onPreview(imageId, src.value || '', left, top)
      } else {
        mousePosition.value = { x: left, y: top }
        triggerPreviewOpen(true)
      }
    })

    props.onClick?.(e)
  }

  const onInternalClick = (e: MouseEvent) => {
    props.onClick?.(e)
  }

  const onImgError = (e: Event) => {
    props.onError?.(e)
  }

  // ======================= Keyboard Preview =====================
  const onPreviewKeyDown = (event: KeyboardEvent) => {
    props.onKeydown?.(event)

    if (!canPreview.value) return

    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault()

      const rect = (event.target as HTMLDivElement).getBoundingClientRect()
      const left = rect.x + rect.width / 2
      const top = rect.y + rect.height / 2

      if (groupContext) {
        groupContext.onPreview(imageId, src.value || '', left, top)
      } else {
        mousePosition.value = { x: left, y: top }
        triggerPreviewOpen(true)
      }
    }
  }

  // =========================== Render ===========================
  const {
    className: attrClassName,
    style: attrStyle,
    restAttrs,
  } = getAttrStyleAndClass(attrs)

  const rootAttrs = computed(() =>
    pickAttrs(omit(restAttrs, COMMON_PROPS), false),
  )

  const coverPlacement = computed(() => {
    if (
      typeof cover.value === 'object' &&
      cover.value &&
      (cover.value as any).placement
    ) {
      return (cover.value as CoverConfig).placement || 'center'
    }
    return 'center'
  })

  const coverNode = computed(() => {
    if (
      typeof cover.value === 'object' &&
      cover.value &&
      (cover.value as any).coverNode
    ) {
      return (cover.value as CoverConfig).coverNode
    }
    return cover.value as VueNode
  })

  const imgStyle = computed(() => [
    props.height ? { height: getStylePxValue(props.height) } : null,
    props.styles?.image,
    attrStyle,
  ])

  const rootStyle = computed<CSSProperties>(() => ({
    width: getStylePxValue(props.width) as any,
    height: getStylePxValue(props.height) as any,
    ...props.styles?.root,
  }))

  const rootCls = computed(() =>
    clsx(prefixCls.value, props.rootClassName, props.classNames?.root, {
      [`${prefixCls.value}-error`]: status.value === 'error',
    }),
  )

  const imgCls = computed(() =>
    clsx(
      `${prefixCls.value}-img`,
      {
        [`${prefixCls.value}-img-placeholder`]: props.placeholder === true,
      },
      props.classNames?.image,
      attrClassName,
    ),
  )

  const imageRender = computed(() => {
    if (slots.imageRender) {
      return ((originNode: VueNode, info: any) =>
        slots.imageRender?.(originNode, info)) as any
    }
    return mergedPreviewConfig.value.imageRender
  })

  const placeholderNode = computed(() => {
    if (props.placeholder === true) return null
    return props.placeholder
  })

  const actionsRender = computed(() => {
    if (slots.actionsRender) {
      return ((originNode: VueNode, info: any) =>
        slots.actionsRender?.({ actionsNode: originNode, ...info })) as any
    }
    return mergedPreviewConfig.value.actionsRender
  })

  const restPreviewProps = computed(() => {
    const config = mergedPreviewConfig.value as any
    const {
      src: _previewSrc,
      open: _previewOpen,
      onOpenChange: _onPreviewOpenChange,
      cover: _cover,
      rootClassName: _previewRootCls,
      ...rest
    } = config
    return rest
  })

  const showPreviewComponent = computed(() => !groupContext && canPreview.value)

  const handleClick = (e: MouseEvent) => {
    if (canPreview.value) onPreview(e)
    else onInternalClick(e)
  }

  const mergedRole = computed(() =>
    canPreview.value ? 'button' : restAttrs.role,
  )
  const mergedTabindex = computed(() =>
    canPreview.value && restAttrs.tabIndex == null ? 0 : restAttrs.tabIndex,
  )
  const mergedAriaLabel = computed(() =>
    canPreview.value
      ? (restAttrs['aria-label'] ?? imgCommonProps.value.alt)
      : restAttrs['aria-label'],
  )

  const showCover = computed(() => cover.value !== false && canPreview.value)
  const coverCls = computed(() =>
    clsx(
      `${prefixCls.value}-cover`,
      props.classNames?.cover,
      `${prefixCls.value}-cover-${coverPlacement.value}`,
    ),
  )
</script>

<template>
  <div
    v-bind="rootAttrs"
    :class="rootCls"
    :style="rootStyle"
    :role="mergedRole"
    :tabindex="mergedTabindex"
    :aria-label="mergedAriaLabel"
    @click="handleClick"
    @keydown="onPreviewKeyDown"
  >
    <img
      v-bind="imgCommonProps"
      :src="(srcAndOnload as any).src"
      :class="imgCls"
      :style="imgStyle as any"
      :ref="(el: any) => getImgRef(el)"
      :width="width"
      :height="height"
      @load="(srcAndOnload as any).onLoad"
      @error="onImgError"
    />

    <div
      v-if="status === 'loading'"
      aria-hidden="true"
      :class="`${prefixCls}-placeholder`"
    >
      <slot name="placeholder">{{ placeholderNode }}</slot>
    </div>

    <!-- Preview Click Mask / Cover -->
    <div v-if="showCover" :class="coverCls" :style="styles?.cover">
      <slot name="cover">{{ coverNode }}</slot>
    </div>
  </div>

  <Preview
    v-if="showPreviewComponent"
    v-bind="restPreviewProps"
    :aria-hidden="!isShowPreview"
    :open="isShowPreview"
    :prefixCls="previewPrefixCls"
    :onClose="onPreviewClose"
    :mousePosition="mousePosition"
    :src="src"
    :alt="imgCommonProps.alt as any"
    :imageInfo="{ width: width as any, height: height as any }"
    :fallback="fallback"
    :imgCommonProps="imgCommonProps as any"
    :imageRender="imageRender as any"
    :actionsRender="actionsRender as any"
    :classNames="classNames?.popup"
    :styles="styles?.popup"
    :rootClassName="clsx(previewRootClassName, rootClassName)"
  >
    <template #actionsRender="actionsProps">
      <slot name="actionsRender" v-bind="actionsProps" />
    </template>
    <template #closeIcon>
      <slot name="closeIcon"></slot>
    </template>
    <template #imageRender>
      <slot name="imageRender"></slot>
    </template>
    <template #countRender>
      <slot name="countRender"></slot>
    </template>
  </Preview>
</template>
