<script setup vapor lang="ts">
import type { QRProps } from './interface.ts'
import { shallowRef, useTemplateRef, watchEffect } from 'vue'
import { useQRCode } from './hooks/useQRCode'
import {
  DEFAULT_BACKGROUND_COLOR,
  DEFAULT_FRONT_COLOR,
  DEFAULT_LEVEL,
  DEFAULT_MINVERSION,
  DEFAULT_NEED_MARGIN,
  DEFAULT_SIZE,
  excavateModules,
  generatePath,
} from './utils'

defineOptions({ name: 'QRCodeSVG' })
const {
  value,
  size = DEFAULT_SIZE,
  level = DEFAULT_LEVEL,
  includeMargin = DEFAULT_NEED_MARGIN,
  minVersion = DEFAULT_MINVERSION,
  marginSize,
  imageSettings,
  boostLevel,
  bgColor = DEFAULT_BACKGROUND_COLOR,
  fgColor = DEFAULT_FRONT_COLOR,
} = defineProps<QRProps>()

const svgRef = useTemplateRef('_svg')
let fgPath: string = ''
let numCells: number = 0
const calcSettings = shallowRef<ReturnType<typeof useQRCode>['calculatedImageSettings']>()
const marginValue = shallowRef(0)

watchEffect(() => {
  const { margin, cells, numCells: getNumCells, calculatedImageSettings } = useQRCode({
    value,
    level,
    minVersion,
    includeMargin,
    marginSize,
    imageSettings,
    size,
    boostLevel,
  })

  let cellsToDraw = cells
  numCells = getNumCells
  if (imageSettings != null && calculatedImageSettings != null) {
    if (calculatedImageSettings.excavation != null) {
      cellsToDraw = excavateModules(
        cells,
        calculatedImageSettings.excavation,
      )
      calcSettings.value = calculatedImageSettings
    }
  }
  fgPath = generatePath(cellsToDraw, margin)
  marginValue.value = margin
})
defineExpose({
  svgRef,
})
</script>

<template>
  <svg ref="_svg" :height="size" :width="size" :viewBox="`0 0 ${numCells} ${numCells}`" role="img">
    <title v-if="title">{{ title }}</title>
    <path :fill="bgColor" :d="`M0,0 h${numCells}v${numCells}H0z`" shape-rendering="crispEdges" />
    <path :fill="fgColor" :d="fgPath" shape-rendering="crispEdges" />
    <image
      v-if="imageSettings?.src && calcSettings" :href="imageSettings.src" :height="calcSettings.h"
      :width="calcSettings.w" :x="calcSettings.x + marginValue" :y="calcSettings.y + marginValue"
      preserveAspectRatio="none" :opacity="calcSettings.opacity" :crossOrigin="calcSettings.crossOrigin"
    />
  </svg>
</template>
