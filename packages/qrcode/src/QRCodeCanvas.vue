<script setup vapor lang="ts">
import type { QRProps } from './interface'
import { computed, shallowRef, useAttrs, watch, watchEffect } from 'vue'
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
  isSupportPath2d,
} from './utils'

defineOptions({ name: 'QRCodeCanvas' })
const {
  value,
  level = DEFAULT_LEVEL,
  includeMargin = DEFAULT_NEED_MARGIN,
  minVersion = DEFAULT_MINVERSION,
  marginSize,
  imageSettings,
  size = DEFAULT_SIZE,
  bgColor = DEFAULT_BACKGROUND_COLOR,
  fgColor = DEFAULT_FRONT_COLOR,
  boostLevel,
} = defineProps<QRProps>()
const attrs = useAttrs()
const imgSrc = computed(() => imageSettings?.src)
const _canvas = shallowRef<HTMLCanvasElement | null>(null)
const _image = shallowRef<HTMLImageElement | null>(null)
const isImgLoaded = shallowRef(false)
const calcSettings = shallowRef<ReturnType<typeof useQRCode>['calculatedImageSettings']>()

watchEffect(() => {
  const { margin, cells, numCells, calculatedImageSettings } = useQRCode({ value, level, minVersion, includeMargin, marginSize, imageSettings, size, boostLevel })
  if (_canvas.value != null) {
    const canvas = _canvas.value

    const ctx = canvas.getContext('2d')
    if (!ctx) {
      return
    }

    let cellsToDraw = cells
    const image = _image.value
    const haveImageToRender = isImgLoaded.value
      && calculatedImageSettings != null
      && image !== null
      && image.complete
      && image.naturalHeight !== 0
      && image.naturalWidth !== 0

    if (haveImageToRender) {
      if (calculatedImageSettings.excavation != null) {
        cellsToDraw = excavateModules(
          cells,
          calculatedImageSettings.excavation,
        )
      }
    }

    // We're going to scale this so that the number of drawable units
    // matches the number of cells. This avoids rounding issues, but does
    // result in some potentially unwanted single pixel issues between
    // blocks, only in environments that don't support Path2D.
    const pixelRatio = window.devicePixelRatio || 1
    canvas.height = canvas.width = size * pixelRatio
    const scale = (size / numCells) * pixelRatio
    ctx.scale(scale, scale)

    // Draw solid background, only paint dark modules.
    ctx.fillStyle = bgColor
    ctx.fillRect(0, 0, numCells, numCells)

    ctx.fillStyle = fgColor
    if (isSupportPath2d) {
      ctx.fill(new Path2D(generatePath(cellsToDraw, margin)))
    }
    else {
      cells.forEach((row, rdx) => {
        row.forEach((cell, cdx) => {
          if (cell) {
            ctx.fillRect(cdx + margin, rdx + margin, 1, 1)
          }
        })
      })
    }

    if (calculatedImageSettings) {
      ctx.globalAlpha = calculatedImageSettings.opacity
    }

    if (haveImageToRender) {
      ctx.drawImage(
        image,
        calculatedImageSettings.x + margin,
        calculatedImageSettings.y + margin,
        calculatedImageSettings.w,
        calculatedImageSettings.h,
      )
    }
    calcSettings.value = calculatedImageSettings
  }
}, { flush: 'sync' })

watch(imgSrc, () => {
  isImgLoaded.value = false
})

watch(() => imageSettings, () => {
  console.log(imageSettings)
})

const canvasStyle = computed(() => ({ height: `${size}px`, width: `${size}px` }))

defineExpose({
  toDataURL: (type?: string, quality?: any) => {
    return _canvas.value?.toDataURL(type, quality)
  },
})
</script>

<template>
  <canvas ref="_canvas" :style="canvasStyle" role="img" :title="title" v-bind="attrs" />
  <img
    v-if="imgSrc" :key="imgSrc" ref="_image" :src="imgSrc" style="display: none;" :crossorigin="calcSettings?.crossOrigin"
    alt="" @load="isImgLoaded = true"
  >
</template>
