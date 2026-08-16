<script setup vapor lang="ts">
  import type { ContainerType } from '@vapor-component/portal'
  import type { CSSProperties } from 'vue'

  import type { PosInfo } from './hooks/useTarget'
  import type { SemanticName } from './interface'

  import { clsx } from '@v-c/util'
  import Portal from '@vapor-component/portal'
  import { computed, shallowRef, useId } from 'vue'

  defineOptions({ name: 'TourMask', inheritAttrs: false })

  const props = withDefaults(
    defineProps<{
      prefixCls?: string
      pos?: PosInfo | null
      rootClassName?: string
      showMask?: boolean
      fill?: string
      open?: boolean
      animated?: boolean | { placeholder: boolean }
      zIndex?: number
      disabledInteraction?: boolean
      classNames?: Partial<Record<SemanticName, string>>
      styles?: Partial<Record<SemanticName, CSSProperties>>
      getPopupContainer?: string | ContainerType | (() => ContainerType)
    }>(),
    {
      prefixCls: 'vc-tour',
      showMask: true,
      fill: 'rgba(0,0,0,0.5)',
      open: false,
      zIndex: 1001,
      disabledInteraction: false,
    },
  )
  const emit = defineEmits<{
    esc: [info: { top: boolean; event: KeyboardEvent }]
  }>()

  const id = useId()
  const maskId = computed(() => `${props.prefixCls}-mask-${id}`)
  const mergedAnimated = computed(() =>
    typeof props.animated === 'object'
      ? props.animated?.placeholder
      : !!props.animated,
  )
  const inlineMode = computed(() => props.getPopupContainer === false)

  const isSafari = shallowRef(
    typeof navigator !== 'undefined' &&
      /^((?!chrome|android).)*safari/i.test(navigator.userAgent),
  )

  const maskRectSize = computed(() =>
    isSafari.value
      ? { width: '100%', height: '100%' }
      : { width: '100vw', height: '100vh' },
  )

  const maskStyle = computed<CSSProperties>(() => ({
    position: inlineMode.value ? 'absolute' : 'fixed',
    left: '0px',
    right: '0px',
    top: '0px',
    bottom: '0px',
    zIndex: props.zIndex,
    pointerEvents: props.pos && !props.disabledInteraction ? 'none' : 'auto',
    ...props.styles?.mask,
  }))

  const coverStyle = computed<CSSProperties>(() => ({
    fill: 'transparent',
    pointerEvents: 'auto',
  }))
</script>

<template>
  <Portal
    :open="open"
    :auto-lock="!inlineMode"
    :get-container="getPopupContainer"
    @esc="info => emit('esc', info)"
  >
    <div
      :class="clsx(`${prefixCls}-mask`, rootClassName, classNames?.mask)"
      :style="maskStyle"
    >
      <svg v-if="showMask" style="width: 100%; height: 100%">
        <defs>
          <mask :id="maskId">
            <rect
              x="0"
              y="0"
              :width="maskRectSize.width"
              :height="maskRectSize.height"
              fill="white"
            />
            <rect
              v-if="pos"
              :x="pos.left"
              :y="pos.top"
              :rx="pos.radius"
              :width="pos.width"
              :height="pos.height"
              fill="black"
              :class="mergedAnimated ? `${prefixCls}-placeholder-animated` : ''"
            />
          </mask>
        </defs>
        <rect
          x="0"
          y="0"
          width="100%"
          height="100%"
          :fill="fill"
          :mask="`url(#${maskId})`"
        />

        <rect
          v-if="pos"
          :style="coverStyle"
          x="0"
          y="0"
          width="100%"
          :height="Math.max(pos.top, 0)"
        />
        <rect
          v-if="pos"
          :style="coverStyle"
          x="0"
          y="0"
          :width="Math.max(pos.left, 0)"
          height="100%"
        />
        <rect
          v-if="pos"
          :style="coverStyle"
          x="0"
          :y="pos.top + pos.height"
          width="100%"
          :height="`calc(100% - ${pos.top + pos.height}px)`"
        />
        <rect
          v-if="pos"
          :style="coverStyle"
          :x="pos.left + pos.width"
          y="0"
          :width="`calc(100% - ${pos.left + pos.width}px)`"
          height="100%"
        />
      </svg>
    </div>
  </Portal>
</template>
