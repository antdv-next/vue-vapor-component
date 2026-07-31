<script setup vapor lang="ts">
  import type { NotificationProps } from './interface'

  import { clsx } from '@v-c/util'
  import { computed, shallowRef, watch, useTemplateRef, useSlots } from 'vue'

  import useClosable from './hooks/useClosable'
  import useNoticeTimer from './hooks/useNoticeTimer'
  import Progress from './Progress.vue'

  defineOptions({ name: 'Notification', inheritAttrs: false })

  const props = withDefaults(defineProps<NotificationProps>(), {
    prefixCls: 'vc-notification',
    role: 'alert',
    duration: 4.5,
    pauseOnHover: true,
  })
  const slots = useSlots()
  const nodeRef = useTemplateRef<HTMLDivElement>('nodeRef')
  const percent = shallowRef(0)
  const hovering = shallowRef(false)

  defineExpose({ nativeElement: nodeRef })

  // ===== Closable =====
  const closableRef = computed(() => props.closable)
  const [isClosable, closableConfig, closeBtnAriaProps] =
    useClosable(closableRef)

  const onInternalClose = () => {
    closableConfig.value.onClose?.()
    props.onClose?.()
  }

  // ===== Duration / Timer =====
  const mergedDuration = computed(() => {
    if (props.duration === undefined) return 4.5
    return props.duration
  })
  const [onResume, onPause] = useNoticeTimer(
    mergedDuration,
    onInternalClose,
    next => {
      percent.value = next
    },
  )

  // ===== Pause / Resume on hover =====
  watch(
    [() => props.hovering, hovering, () => props.pauseOnHover],
    () => {
      const pauseOnHover = props.pauseOnHover ?? true
      if (!pauseOnHover) return
      if (props.hovering) {
        onPause()
      } else if (!hovering.value) {
        onResume()
      }
    },
    { immediate: true },
  )

  // ===== Cache offset / notificationIndex for leave transitions =====
  const offsetRef = shallowRef(props.offset)
  const indexRef = shallowRef(props.notificationIndex)

  watch(
    () => props.offset,
    next => {
      if (next !== undefined) offsetRef.value = next
    },
  )
  watch(
    () => props.notificationIndex,
    next => {
      if (next !== undefined) indexRef.value = next
    },
  )

  // ===== Event handlers =====
  const onInternalMouseEnter = (e: MouseEvent) => {
    hovering.value = true
    if (props.pauseOnHover ?? true) onPause()
    props.onMouseEnter?.(e)
  }

  const onInternalMouseLeave = (e: MouseEvent) => {
    hovering.value = false
    if ((props.pauseOnHover ?? true) && !props.hovering) onResume()
    props.onMouseLeave?.(e)
  }

  const onInternalCloseClick = (e: MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    onInternalClose()
  }

  // ===== Computed values =====
  const noticePrefixCls = `${props.prefixCls}-notice`

  const mergedOffset = computed(() => props.offset ?? offsetRef.value)
  const mergedIndex = computed(
    () => props.notificationIndex ?? indexRef.value ?? 0,
  )
  const safePercent = computed(() =>
    Math.min(Math.max(percent.value * 100, 0), 100),
  )
  const validPercent = computed(() => 100 - safePercent.value)
  const mergedRole = computed(() => props.role)

  const showProgressBar = computed(
    () =>
      !!props.showProgress &&
      typeof props.duration === 'number' &&
      props.duration > 0,
  )

  // Conditional flags
  const hasTitle = computed(() => !!slots.title)
  const hasDescription = computed(() => !!slots.description)
  const hasBoth = computed(() => hasTitle.value && hasDescription.value)
  const hasEither = computed(() => hasTitle.value || hasDescription.value)
  const hasIcon = computed(() => !!slots.icon)
  const hasContent = computed(
    () => hasIcon.value || hasEither.value || !!slots.actions,
  )

  // Class / style
  const rootClass = computed(() =>
    clsx(noticePrefixCls, props.className, props.classNames?.root, {
      [`${noticePrefixCls}-closable`]: isClosable.value,
      [`${noticePrefixCls}-stack-in-threshold`]: !!props.stackInThreshold,
    }),
  )

  const rootStyle = computed(() => {
    const base: Record<string, any> = {
      '--notification-index': mergedIndex.value,
      ...props.styles?.root,
      ...props.style,
    }
    if (mergedOffset.value !== undefined) {
      base['--notification-y'] = `${mergedOffset.value}px`
    }
    return base
  })
</script>

<template>
  <div
    v-if="hasContent"
    ref="nodeRef"
    :role="mergedRole"
    :class="rootClass"
    :style="rootStyle"
    :data-notification-index="mergedIndex"
    @click="(e: MouseEvent) => props.onClick?.(e)"
    @mouseenter="onInternalMouseEnter"
    @mouseleave="onInternalMouseLeave"
  >
    <div
      v-if="hasIcon"
      :class="clsx(`${noticePrefixCls}-wrapper`, props.classNames?.wrapper)"
      :style="props.styles?.wrapper"
    >
      <div
        :class="clsx(`${noticePrefixCls}-icon`, props.classNames?.icon)"
        :style="props.styles?.icon"
      >
        <slot name="icon" />
      </div>
      <div
        v-if="hasBoth"
        :class="clsx(`${noticePrefixCls}-section`, props.classNames?.section)"
        :style="props.styles?.section"
      >
        <div
          :class="clsx(`${noticePrefixCls}-title`, props.classNames?.title)"
          :style="props.styles?.title"
        >
          <slot name="title" />
        </div>
        <div
          :class="
            clsx(
              `${noticePrefixCls}-description`,
              props.classNames?.description,
            )
          "
          :style="props.styles?.description"
        >
          <slot name="description" />
        </div>
      </div>
      <div
        v-else-if="hasTitle"
        :class="clsx(`${noticePrefixCls}-title`, props.classNames?.title)"
        :style="props.styles?.title"
      >
        <slot name="title" />
      </div>
      <div
        v-else-if="hasDescription"
        :class="
          clsx(`${noticePrefixCls}-description`, props.classNames?.description)
        "
        :style="props.styles?.description"
      >
        <slot name="description" />
      </div>
    </div>
    <div
      v-else-if="hasBoth"
      :class="clsx(`${noticePrefixCls}-section`, props.classNames?.section)"
      :style="props.styles?.section"
    >
      <div
        :class="clsx(`${noticePrefixCls}-title`, props.classNames?.title)"
        :style="props.styles?.title"
      >
        <slot name="title" />
      </div>
      <div
        :class="
          clsx(`${noticePrefixCls}-description`, props.classNames?.description)
        "
        :style="props.styles?.description"
      >
        <slot name="description" />
      </div>
    </div>
    <div
      v-else-if="hasTitle"
      :class="clsx(`${noticePrefixCls}-title`, props.classNames?.title)"
      :style="props.styles?.title"
    >
      <slot name="title" />
    </div>
    <div
      v-else-if="hasDescription"
      :class="
        clsx(`${noticePrefixCls}-description`, props.classNames?.description)
      "
      :style="props.styles?.description"
    >
      <slot name="description" />
    </div>

    <div
      v-if="slots?.actions"
      :class="clsx(`${noticePrefixCls}-actions`, props.classNames?.actions)"
      :style="props.styles?.actions"
    >
      <slot name="actions" />
    </div>

    <button
      v-if="isClosable"
      :class="clsx(`${noticePrefixCls}-close`, props.classNames?.close)"
      :style="props.styles?.close"
      aria-label="Close"
      v-bind="closeBtnAriaProps"
      @click="onInternalCloseClick"
    >
      <slot name="closeIcon">{{ closableConfig.closeIcon }}</slot>
    </button>

    <Progress
      v-if="showProgressBar"
      :class="clsx(`${noticePrefixCls}-progress`, props.classNames?.progress)"
      :style="props.styles?.progress"
      :percent="validPercent"
    />
  </div>
</template>
