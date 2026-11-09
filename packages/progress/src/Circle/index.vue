<script setup vapor lang="ts">
  import type { ProgressProps, StrokeColorType } from '../interface'

  import omit from '@v-c/util/dist/omit'
  import { getAttrStyleAndClass } from '@v-c/util/dist/props-util'
  import { computed, useAttrs } from 'vue'

  import { useTransitionDuration } from '../common'
  import useId from '../hooks/useId'
  import { getIndeterminateCircleStyle } from '../utils/indeterminate'
  import PtgCircle from './PtgCircle.vue'
  import { getCircleStyle, VIEW_BOX_SIZE } from './util'

  defineOptions({ name: 'Circle' })

  const emit = defineEmits<{ click: [e: MouseEvent] }>()

  const props = withDefaults(defineProps<ProgressProps>(), {
    strokeWidth: 1,
    railColor: '#D9D9D9',
    prefixCls: 'vc-progress',
    gapPosition: 'bottom',
    loading: false,
    strokeLinecap: 'round',
    percent: 0,
    strokeColor: '#2db7f5',
  })

  const attrs = useAttrs()
  const { style: attrStyle, className, restAttrs } = getAttrStyleAndClass(attrs)

  const halfSize = VIEW_BOX_SIZE / 2
  const mergedId = useId(props.id)
  const gradientId = `${mergedId}-gradient`

  const gapDegree = computed(() => props.gapDegree ?? 0)
  const radius = computed(() => halfSize - (props.strokeWidth ?? 0) / 2)
  const perimeter = computed(() => Math.PI * 2 * radius.value)
  const rotateDeg = computed(() =>
    gapDegree.value > 0 ? 90 + gapDegree.value / 2 : -90,
  )
  const perimeterWithoutGap = computed(
    () => perimeter.value * ((360 - gapDegree.value) / 360),
  )
  const stepObj = computed(() =>
    typeof props.steps === 'object'
      ? props.steps
      : { count: props.steps, gap: 2 },
  )
  const percentList = computed<number[]>(() => {
    const v = props.percent
    return v == null ? [] : Array.isArray(v) ? v : [v]
  })
  const strokeColorList = computed<StrokeColorType[]>(() => {
    const v = props.strokeColor
    return v == null ? [] : Array.isArray(v) ? v : [v]
  })
  const gradient = computed<Record<string, string> | undefined>(() => {
    for (const color of strokeColorList.value) {
      if (color && typeof color === 'object') {
        return color as Record<string, string>
      }
    }
    return undefined
  })
  const isConicGradient = computed(() => gradient.value != null)
  const mergedStrokeLinecap = computed(() =>
    isConicGradient.value ? 'butt' : props.strokeLinecap,
  )

  // ---- transition duration hack (same as source common.ts) ----
  const pathsRef = useTransitionDuration<SVGPathElement | SVGCircleElement>()

  // ---- indeterminate ----
  const indeterminateResult = computed(() =>
    getIndeterminateCircleStyle({
      id: mergedId,
      loading: !!props.loading,
    }),
  )

  // ---- rail style ----
  const circleStyle = computed(() =>
    getCircleStyle(
      perimeter.value,
      perimeterWithoutGap.value,
      0,
      100,
      rotateDeg.value,
      gapDegree.value,
      props.gapPosition,
      props.railColor ?? '',
      mergedStrokeLinecap.value,
      props.strokeWidth ?? 0,
    ),
  )

  // ---- stroke path data ----
  const strokePathData = computed(() => {
    let stackPtg = 0
    return percentList.value
      .map((ptg, index) => {
        const color =
          strokeColorList.value[index] ||
          strokeColorList.value[strokeColorList.value.length - 1]
        const circleStyleForStack = getCircleStyle(
          perimeter.value,
          perimeterWithoutGap.value,
          stackPtg,
          ptg!,
          rotateDeg.value,
          gapDegree.value,
          props.gapPosition,
          color!,
          mergedStrokeLinecap.value,
          props.strokeWidth ?? 0,
        )
        stackPtg += ptg!
        return {
          key: index,
          color,
          ptg: ptg!,
          circleStyleForStack,
        }
      })
      .reverse()
  })

  // ---- step stroke path data ----
  const stepStrokeData = computed(() => {
    const { count: stepCount, gap: stepGap } = stepObj.value ?? {}
    if (!stepCount) return []
    const current = Math.round(stepCount * ((percentList.value[0] ?? 0) / 100))
    const stepPtg = 100 / stepCount
    let stackPtg = 0

    return Array.from({ length: stepCount }).map((_, index) => {
      const color =
        index <= current - 1 ? strokeColorList.value[0] : props.railColor
      const stroke =
        color && typeof color === 'object' ? `url(#${gradientId})` : undefined
      const circleStyleForStack = getCircleStyle(
        perimeter.value,
        perimeterWithoutGap.value,
        stackPtg,
        stepPtg,
        rotateDeg.value,
        gapDegree.value!,
        props.gapPosition,
        color!,
        'butt',
        props.strokeWidth ?? 0,
        stepGap,
      )
      stackPtg +=
        ((perimeterWithoutGap.value -
          (circleStyleForStack.strokeDashoffset as number) +
          stepGap) *
          100) /
        perimeterWithoutGap.value

      return { key: index, stroke, circleStyleForStack }
    })
  })

  const svgRestAttrs = computed(() =>
    omit(restAttrs, [
      'gapDegree',
      'steps',
      'percent',
      'strokeLinecap',
      'strokeColor',
    ] as const),
  )

  // ---- refs (store by index, same as source) ----
  function setStrokePathRef(index: number) {
    return (el: unknown) => {
      const c = (el as any)?.getCircle?.()
      if (c) pathsRef.value[index] = c as SVGPathElement | SVGCircleElement
    }
  }

  function setStepCircleRef(index: number) {
    return (el: unknown) => {
      if (el) pathsRef.value[index] = el as SVGCircleElement
    }
  }

  defineExpose({
    getPaths: () => pathsRef.value,
  })
</script>

<template>
  <style v-if="indeterminateResult.animationKeyframes">
    {{ indeterminateResult.animationKeyframes }}
  </style>
  <svg
    :class="[`${prefixCls}-circle`, classNames?.root, className]"
    :viewBox="`0 0 ${VIEW_BOX_SIZE} ${VIEW_BOX_SIZE}`"
    :style="{
      ...styles?.root,
      ...attrStyle,
    }"
    :id="id"
    role="presentation"
    @click="e => emit('click', e)"
    v-bind="svgRestAttrs"
  >
    <!-- rail -->
    <template v-if="!stepObj.count">
      <circle
        :class="[`${prefixCls}-circle-rail`, classNames?.rail]"
        :r="radius"
        :cx="halfSize"
        :cy="halfSize"
        :stroke="railColor"
        :stroke-linecap="mergedStrokeLinecap"
        :stroke-width="railWidth ?? strokeWidth"
        :style="{ ...circleStyle, ...styles?.rail }"
      />
    </template>

    <!-- stroke paths (non-step) -->
    <template v-if="!stepObj.count">
      <template v-for="(data, index) in strokePathData" :key="data.key">
        <PtgCircle
          :ref="setStrokePathRef(index)"
          :color="data.color as string | Record<string, string | boolean>"
          :ptg="data.ptg"
          :radius="radius"
          :className="classNames?.track"
          :prefixCls="prefixCls"
          :gradientId="gradientId"
          :style="[
            data.circleStyleForStack,
            indeterminateResult.indeterminateStyleProps,
            styles?.track,
          ]"
          :strokeLinecap="mergedStrokeLinecap"
          :strokeWidth="strokeWidth"
          :gapDegree="gapDegree"
          :size="VIEW_BOX_SIZE"
        />
      </template>
    </template>

    <!-- step stroke paths -->
    <template v-if="stepObj.count">
      <template v-for="(data, index) in stepStrokeData" :key="data.key">
        <circle
          :ref="setStepCircleRef(index)"
          :class="[`${prefixCls}-circle-path`, classNames?.track]"
          :r="radius"
          :cx="halfSize"
          :cy="halfSize"
          :stroke="data.stroke"
          :stroke-width="strokeWidth"
          opacity="1"
          :style="{ ...data.circleStyleForStack, ...styles?.track }"
        />
      </template>
    </template>
  </svg>
</template>
