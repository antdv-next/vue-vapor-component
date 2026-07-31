<script setup vapor lang="ts">
  import type { CSSProperties, TransitionGroupProps } from 'vue'

  import type {
    NotificationListConfig,
    NotificationListProps,
  } from './interface'

  import { clsx } from '@v-c/util'
  import { unrefElement } from '@v-c/util/dist/vueuse/unref-element'
  import { computed, onMounted, shallowRef, toRef, watch } from 'vue'

  import Content from './Content.vue'
  import useListPosition from './hooks/useListPosition'
  import useStack from './hooks/useStack'
  import Notification from './Notification.vue'
  import { useNotificationContext } from './NotificationProvider'

  defineOptions({ name: 'NotificationList', inheritAttrs: false })

  const props = withDefaults(defineProps<NotificationListProps>(), {
    prefixCls: 'vc-notification',
    configList: () => [],
    pauseOnHover: true,
  })

  const ctx = useNotificationContext()

  const configList = computed<NotificationListConfig[]>(
    () => props.configList ?? [],
  )
  const keys = computed(() =>
    configList.value.map(config => ({
      ...config,
      key: String(config.key),
    })),
  )

  // ===== Stack =====
  const [stackEnabled, stackParams] = useStack(toRef(props, 'stack'))
  const listHovering = shallowRef(false)
  const expanded = computed(
    () =>
      stackEnabled.value &&
      (listHovering.value ||
        keys.value.length <= (stackParams.threshold?.value ?? 0)),
  )
  const stackPosition = computed(() => {
    if (!stackEnabled.value || expanded.value) return undefined
    return {
      offset: stackParams.offset?.value,
      threshold: stackParams.threshold?.value,
    }
  })

  // ===== List measure =====
  const gap = shallowRef(0)
  const contentRef = shallowRef<{
    nativeElement: HTMLDivElement | null
  } | null>(null)
  const [position, setNodeSize] = useListPosition(keys, stackPosition, gap)

  const hasConfigList = computed(() => !!configList.value.length)

  // Read CSS gap on mount and when items change
  onMounted(() => {
    if (!hasConfigList.value) return
    const el = contentRef.value?.nativeElement
    if (!el) return
    const listNode = unrefElement(el)
    if (!listNode) return
    const { gap: cssGap, rowGap } = window.getComputedStyle(listNode)
    gap.value = Number.parseFloat(rowGap || cssGap) || 0
  })

  watch(
    () => configList.value.length,
    () => {
      if (!hasConfigList.value) return
      const el = contentRef.value?.nativeElement
      if (!el) return
      const listNode = unrefElement(el)
      if (!listNode) return
      const { gap: cssGap, rowGap } = window.getComputedStyle(listNode)
      const nextGap = Number.parseFloat(rowGap || cssGap) || 0
      if (gap.value !== nextGap) {
        gap.value = nextGap
      }
    },
  )

  // Cleanup node sizes when items leave
  watch(keys, (next, prev) => {
    if (!prev) return
    const nextKeySet = new Set(next.map(item => String(item.key)))
    prev.forEach(item => {
      const key = String(item.key)
      if (!nextKeySet.has(key)) {
        setNodeSize(key, null)
      }
    })
  })

  // ===== Motion =====
  const checkAllClosed = () => {
    if (configList.value.length === 0) {
      props.onAllRemoved?.(props.placement)
    }
  }

  const placementMotion = computed(() => {
    if (typeof props.motion === 'function') {
      return props.placement ? props.motion(props.placement) : undefined
    }
    return props.motion
  })

  // ===== Merge helpers =====
  const noticeSlotKeys: (keyof NotificationClassNames)[] = [
    'wrapper',
    'root',
    'icon',
    'section',
    'title',
    'description',
    'actions',
    'close',
    'progress',
  ]

  type NotificationClassNames = import('./interface').NotificationClassNames
  type NotificationStyles = import('./interface').NotificationStyles

  function fillClassNames(
    list: (NotificationClassNames | undefined)[],
  ): NotificationClassNames {
    return noticeSlotKeys.reduce<NotificationClassNames>((merged, key) => {
      merged[key] = clsx(...list.map(item => item?.[key]))
      return merged
    }, {})
  }

  function fillStyles(
    list: (NotificationStyles | undefined)[],
  ): NotificationStyles {
    return noticeSlotKeys.reduce<NotificationStyles>((merged, key) => {
      merged[key] = Object.assign({}, ...list.map(item => item?.[key]))
      return merged
    }, {})
  }

  function getIndex(key: string): number {
    const index = keys.value.findIndex(item => String(item.key) === String(key))
    if (index === -1) return -1
    return keys.value.length - index - 1
  }

  // String/number → text, VNode/component → <component :is>
  function isPrimitive(value: unknown): boolean {
    return value == null || typeof value === 'string' || typeof value === 'number'
  }

  function buildMotionGroupProps(
    name: string,
    override?: Partial<TransitionGroupProps>,
  ): TransitionGroupProps {
    return {
      name,
      appear: true,
      enterFromClass: `${name} ${name}-enter ${name}-appear ${name}-enter-start ${name}-appear-start`,
      enterActiveClass: `${name} ${name}-enter ${name}-appear`,
      enterToClass: `${name} ${name}-enter ${name}-appear ${name}-enter-active ${name}-appear-active`,
      leaveFromClass: `${name} ${name}-leave ${name}-leave-start`,
      leaveActiveClass: `${name} ${name}-leave`,
      leaveToClass: `${name} ${name}-leave ${name}-leave-active`,
      moveClass: `${name} ${name}-move`,
      ...override,
    }
  }

  // ===== Computed render values =====
  const listPrefixCls = computed(() => `${props.prefixCls}-list`)
  const positionResult = computed(() => position.value)

  const motionGroupProps = computed<TransitionGroupProps>(() => {
    if (placementMotion.value?.name) {
      return buildMotionGroupProps(
        placementMotion.value.name,
        placementMotion.value,
      )
    }
    return {}
  })

  const listClass = computed(() =>
    clsx(
      props.prefixCls,
      listPrefixCls.value,
      `${props.prefixCls}-${props.placement}`,
      ctxClassNamesList,
      props.className,
      props.classNames?.list,
      {
        [`${props.prefixCls}-stack`]: stackEnabled.value,
        [`${props.prefixCls}-stack-expanded`]: expanded.value,
        [`${listPrefixCls.value}-hovered`]: listHovering.value,
      },
    ),
  )

  const listStyle = computed<CSSProperties>(() => ({
    ...props.styles?.list,
    ...props.style,
  }))

  // Template-friendly computed values
  const ctxClassNamesNotice = computed(() => ctx.value?.classNames?.notice)
  const ctxClassNamesList = computed(() => ctx.value?.classNames?.list)
  const stackThreshold = computed(() => stackParams.threshold?.value ?? 0)
</script>

<template>
  <div
    :class="listClass"
    :style="listStyle"
    @mouseenter="() => (listHovering = true)"
    @mouseleave="() => (listHovering = false)"
  >
    <Content
      ref="contentRef"
      :list-prefix-cls="listPrefixCls"
      :height="positionResult.totalHeight"
      :top-notice-height="positionResult.topNoticeHeight"
      :top-notice-width="positionResult.topNoticeWidth"
      :class-name="props.classNames?.listContent"
      :style="props.styles?.listContent"
    >
      <TransitionGroup v-bind="motionGroupProps" @after-leave="checkAllClosed">
        <template v-for="config in keys" :key="config.key">
          <Notification
            :prefix-cls="props.prefixCls"
            :key="config.key"
            :class="clsx(ctxClassNamesNotice, config.className)"
            :style="config.style"
            :class-names="fillClassNames([props.classNames, config.classNames])"
            :styles="fillStyles([props.styles, config.styles])"
            :components="{ ...props.components, ...config.components }"
            :hovering="stackEnabled && listHovering"
            :pause-on-hover="config.pauseOnHover ?? props.pauseOnHover"
            :offset="positionResult.notificationPosition.get(config.key)"
            :notification-index="
              getIndex(config.key) >= 0 ? getIndex(config.key) : undefined
            "
            :stack-in-threshold="
              stackEnabled &&
              getIndex(config.key) >= 0 &&
              getIndex(config.key) < stackThreshold
            "
            :role="config.role"
            :closable="config.closable"
            :duration="config.duration"
            :show-progress="config.showProgress"
            :on-click="(e: MouseEvent) => config.onClick?.(e)"
            :on-mouse-enter="(e: MouseEvent) => config.onMouseEnter?.(e)"
            :on-mouse-leave="(e: MouseEvent) => config.onMouseLeave?.(e)"
            :on-close="
              () => {
                config.onClose?.()
                onNoticeClose?.(config.key)
              }
            "
          >
            <template #title>
              <span v-if="isPrimitive(config.title)">{{ config.title }}</span>
              <component v-else :is="config.title" />
            </template>
            <template #description>
              <span v-if="isPrimitive(config.description)">{{ config.description }}</span>
              <component v-else :is="config.description" />
            </template>
            <template #icon>
              <span v-if="isPrimitive(config.icon)">{{ config.icon }}</span>
              <component v-else :is="config.icon" />
            </template>
            <template #actions>
              <span v-if="isPrimitive(config.actions)">{{ config.actions }}</span>
              <component v-else :is="config.actions" />
            </template>
          </Notification>
        </template>
      </TransitionGroup>
    </Content>
  </div>
</template>
