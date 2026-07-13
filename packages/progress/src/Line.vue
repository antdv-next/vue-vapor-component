<script setup vapor lang="ts">
  import type { ProgressProps, StrokeColorType } from './interface'
  import type { CSSProperties } from 'vue'

  import { getAttrStyleAndClass } from '@v-c/util/dist/props-util'
  import { computed, onMounted, ref, useAttrs } from 'vue'

  import useId from './hooks/useId'
  import { getIndeterminateLineStyle } from './utils/indeterminate'

  defineOptions({ name: 'Line', inheritAttrs: false })

  const props = withDefaults(defineProps<ProgressProps>(), {
    id: () => '',
    strokeWidth: 1,
    railWidth: 1,
    percent: 0,
    strokeColor: '#2db7f5',
    railColor: '#D9D9D9',
    strokeLinecap: 'round',
    prefixCls: 'vc-progress',
    loading: false,
  })

  const attrs = useAttrs()
  const { style: attrStyle, restAttrs } = getAttrStyleAndClass(attrs)

  const mergedId = useId(props.id)

  // ---- transition duration hack (same as source common.ts) ----
  const pathsRef = ref<SVGPathElement[]>([])
  onMounted(() => {
    const now = Date.now()
    let updated = false
    let prevTimeStamp: number | undefined
    pathsRef.value.forEach((path) => {
      if (!path) return
      updated = true
      const pathStyle = (path as any).style
      if (!pathStyle) return
      pathStyle.transitionDuration = '.3s, .3s, .3s, .06s'
      if (prevTimeStamp && now - prevTimeStamp < 100) {
        pathStyle.transitionDuration = '0s, 0s'
      }
      if (updated) {
        prevTimeStamp = Date.now()
      }
    })
  })

  const percentList = computed<number[]>(() =>
    Array.isArray(props.percent) ? props.percent : [props.percent],
  )
  const strokeColorList = computed<StrokeColorType[]>(() =>
    Array.isArray(props.strokeColor) ? props.strokeColor : [props.strokeColor],
  )
  const strokeLinecap = computed(() => props.strokeLinecap)
  const strokeWidth = computed(() => props.strokeWidth)

  const pathString = computed(() => {
    const center = strokeWidth.value / 2
    const right = 100 - strokeWidth.value / 2
    return `M ${strokeLinecap.value === 'round' ? center : 0},${center} L ${strokeLinecap.value === 'round' ? right : 100},${center}`
  })

  const viewBoxString = computed(() => `0 0 100 ${strokeWidth.value}`)

  const indeterminateResult = computed(() =>
    getIndeterminateLineStyle({
      id: mergedId,
      loading: props.loading,
      percent: percentList.value[0]!,
      strokeLinecap: strokeLinecap.value,
      strokeWidth: strokeWidth.value,
    }),
  )

  const pathData = computed(() => {
    let stackPtg = 0
    return percentList.value.map((ptg, index) => {
      let dashPercent = 1
      switch (strokeLinecap.value) {
        case 'round':
          dashPercent = 1 - strokeWidth.value / 100
          break
        case 'square':
          dashPercent = 1 - strokeWidth.value / 2 / 100
          break
        default:
          dashPercent = 1
          break
      }
      const pathStyle: CSSProperties = {
        strokeDasharray: `${ptg! * dashPercent}px, 100px`,
        strokeDashoffset: `-${stackPtg}px`,
        transition:
          props.transition ||
          'stroke-dashoffset 0.3s ease 0s, stroke-dasharray .3s ease 0s, stroke 0.3s linear',
        ...indeterminateResult.value.indeterminateStyleProps,
      }
      const color =
        strokeColorList.value[index] ||
        strokeColorList.value[strokeColorList.value.length - 1]
      stackPtg += ptg!
      return {
        key: index,
        color: color as string,
        pathStyle,
      }
    })
  })
</script>

<template>
  <style v-if="indeterminateResult.animationKeyframes">{{ indeterminateResult.animationKeyframes }}</style>
  <svg
    :class="{ [`${prefixCls}-line`]: true, [props.className as string]: true }"
    preserveAspectRatio="none"
    :viewBox="viewBoxString"
    :style="{ width: '100%', height: '100%', ...attrStyle }"
    v-bind="restAttrs"
  >
    <path
      :class="[`${prefixCls}-line-rail`]"
      :d="pathString"
      :stroke-linecap="strokeLinecap"
      :stroke="railColor"
      :stroke-width="railWidth || strokeWidth"
      fill-opacity="0"
    />
    <template v-for="data in pathData" :key="data.key">
      <path
        :class="[`${prefixCls}-line-path`]"
        :d="pathString"
        :stroke-linecap="strokeLinecap"
        :stroke="data.color"
        :stroke-width="strokeWidth"
        fill-opacity="0"
        :ref="el => { pathsRef.push(el as SVGPathElement) }"
        :style="data.pathStyle"
      />
    </template>
  </svg>
</template>
