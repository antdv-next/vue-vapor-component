import type { Ref } from 'vue'

import type {
  AlignPointLeftRight,
  AlignPointTopBottom,
  AlignType,
  OffsetType,
} from '../interface'

import { isDOM } from '@v-c/util/dist/Dom/findDOMNode'
import isVisible from '@v-c/util/dist/Dom/isVisible'
import {
  computed,
  nextTick,
  reactive,
  ref,
  shallowRef,
  toRefs,
  watch,
} from 'vue'

import { collectScroller, getVisibleArea, getWin, toNum } from '../util'

type Rect = Record<'x' | 'y' | 'width' | 'height', number>
type Points = [topBottom: AlignPointTopBottom, leftRight: AlignPointLeftRight]

function getUnitOffset(size: number, offset: OffsetType = 0) {
  const offsetStr = `${offset}`
  const cells = offsetStr.match(/^(.*)\%$/)
  if (cells) {
    return size * (parseFloat(cells[1]) / 100)
  }
  return parseFloat(offsetStr)
}

function getNumberOffset(
  rect: { width: number; height: number },
  offset?: OffsetType[],
) {
  const [offsetX, offsetY] = offset || []
  const [dx, dy] = [
    getUnitOffset(rect.width, offsetX),
    getUnitOffset(rect.height, offsetY),
  ]
  // Guard against null/undefined producing NaN (NaN breaks overflow flip logic)
  return [isNaN(dx) ? 0 : dx, isNaN(dy) ? 0 : dy]
}

function splitPoints(points: string = ''): Points {
  return [points[0] as any, points[1] as any]
}

interface SelfTransform {
  scaleX: number
  scaleY: number
  translateX: number
  translateY: number
}

function getSelfTransform(transform: string | undefined): SelfTransform | null {
  if (!transform || transform === 'none') return null

  const matrix3d = transform.match(/^matrix3d\(([^)]+)\)$/)
  const matrix = transform.match(/^matrix\(([^)]+)\)$/)
  if (matrix3d) {
    const m = matrix3d[1].split(',').map(Number)
    const v = [
      Math.hypot(m[0], m[1], m[2]),
      Math.hypot(m[4], m[5], m[6]),
      m[12],
      m[13],
    ]
    return {
      scaleX: v[0] || 1,
      scaleY: v[1] || 1,
      translateX: v[2] || 0,
      translateY: v[3] || 0,
    }
  }
  if (matrix) {
    const m = matrix[1].split(',').map(Number)
    const v = [Math.hypot(m[0], m[1]), Math.hypot(m[2], m[3]), m[4], m[5]]
    return {
      scaleX: v[0] || 1,
      scaleY: v[1] || 1,
      translateX: v[2] || 0,
      translateY: v[3] || 0,
    }
  }
  return null
}

function unscaleSelfRect(
  rect: Rect,
  self: SelfTransform,
  transformOrigin: string,
): Rect {
  const [oxStr, oyStr] = (transformOrigin || '').split(' ')
  const ox = parseFloat(oxStr) || 0
  const oy = parseFloat(oyStr) || 0
  return {
    x: rect.x - self.translateX - ox * (1 - self.scaleX),
    y: rect.y - self.translateY - oy * (1 - self.scaleY),
    width: rect.width / self.scaleX,
    height: rect.height / self.scaleY,
  }
}

function getAlignPoint(rect: Rect, points: Points) {
  const { 0: topBottom, 1: leftRight } = points
  let x: number
  let y: number

  if (topBottom === 't') y = rect.y
  else if (topBottom === 'b') y = rect.y + rect.height
  else y = rect.y + rect.height / 2

  if (leftRight === 'l') x = rect.x
  else if (leftRight === 'r') x = rect.x + rect.width
  else x = rect.x + rect.width / 2

  return { x, y }
}

function reversePoints(points: Points, index: number): Points {
  const reverseMap = { t: 'b', b: 't', l: 'r', r: 'l' }
  const clone = [...points] as Points
  clone[index] = (reverseMap as any)[points[index]] || 'c'
  return clone
}

function flatPoints(points: Points): string {
  return points.join('')
}

function shouldSwitchPlacement(
  isOverflow: boolean,
  isVisibleFirst: boolean,
  newVisibleArea: number,
  originVisibleArea: number,
  newRecommendArea: number,
  originRecommendArea: number,
) {
  if (isOverflow) {
    return (
      newVisibleArea > originVisibleArea ||
      (newVisibleArea === originVisibleArea &&
        (!isVisibleFirst || newRecommendArea >= originRecommendArea))
    )
  }
  return (
    newVisibleArea > originVisibleArea ||
    (isVisibleFirst &&
      newVisibleArea === originVisibleArea &&
      newRecommendArea > originRecommendArea)
  )
}

export default function useAlign(
  open: Ref<boolean>,
  popupEle: Ref<HTMLElement>,
  target: Ref<HTMLElement | [x: number, y: number]>,
  placement: Ref<string>,
  builtinPlacements: Ref<any>,
  popupAlign?: Ref<AlignType | undefined>,
  onPopupAlign?: (element: HTMLElement, align: AlignType) => void,
  mobile?: Ref<boolean | undefined>,
) {
  const offsetInfo = reactive({
    ready: false,
    offsetX: 0,
    offsetY: 0,
    offsetR: 0,
    offsetB: 0,
    arrowX: 0,
    arrowY: 0,
    scaleX: 1,
    scaleY: 1,
    align: builtinPlacements.value[placement.value] || {},
  })

  const alignCountRef = shallowRef(0)
  const scrollerList = computed(() => {
    if (!popupEle.value || mobile?.value) return []
    return collectScroller(popupEle.value)
  })

  const prevFlipRef = ref<{
    tb?: boolean
    bt?: boolean
    lr?: boolean
    rl?: boolean
  }>({})
  const resetFlipCache = () => {
    prevFlipRef.value = {}
  }

  let cacheTargetRect: any = null
  let cacheScale: any = null
  let _isAligning = false

  const _onAlign = (cache = false) => {
    if (!popupEle.value || !target.value || !open.value || mobile?.value) {
      return
    }

    if (_isAligning && cache !== false) {
      return
    }
    _isAligning = true
    if (popupEle.value) {
      getWin(popupEle.value)?.requestAnimationFrame(() => {
        _isAligning = false
      })
    } else {
      setTimeout(() => {
        _isAligning = false
      }, 16)
    }

    if (cache && !cacheTargetRect) {
      return
    }

    const popupElement = popupEle.value
    const doc = popupElement.ownerDocument
    const win = getWin(popupElement)
    const popupComputedStyle = win!.getComputedStyle(popupElement)
    const { position: popupPosition } = popupComputedStyle

    const originLeft = popupElement.style.left
    const originTop = popupElement.style.top
    const originRight = popupElement.style.right
    const originBottom = popupElement.style.bottom
    const originOverflow = popupElement.style.overflow
    const originOverflowX = popupElement.style.overflowX
    const originOverflowY = popupElement.style.overflowY

    const rawPlacement = placement.value
    const placementInfo: AlignType = {
      ...builtinPlacements.value[rawPlacement],
      ...popupAlign?.value,
    }

    const placeholderElement = doc.createElement('div')
    popupElement.parentElement?.appendChild(placeholderElement)
    placeholderElement.style.left = `${popupElement.offsetLeft}px`
    placeholderElement.style.top = `${popupElement.offsetTop}px`
    placeholderElement.style.position = popupPosition
    placeholderElement.style.height = `${popupElement.offsetHeight}px`
    placeholderElement.style.width = `${popupElement.offsetWidth}px`

    popupElement.style.left = '0'
    popupElement.style.top = '0'
    popupElement.style.right = 'auto'
    popupElement.style.bottom = 'auto'
    popupElement.style.overflow = 'hidden'

    let targetRect: Rect
    if (Array.isArray(target.value)) {
      targetRect = {
        x: target.value[0],
        y: target.value[1],
        width: 0,
        height: 0,
      }
    } else {
      const targetRectInfo = target.value.getBoundingClientRect()
      const rect = cache
        ? Object.assign(targetRectInfo, cacheTargetRect ?? {})
        : targetRectInfo
      if (!cache) cacheTargetRect = { width: rect.width, height: rect.height }
      targetRect = {
        x: rect.x ?? rect.left,
        y: rect.y ?? rect.top,
        width: rect.width,
        height: rect.height,
      }
    }

    const rawPopupRect = popupElement.getBoundingClientRect()
    const {
      clientWidth,
      clientHeight,
      scrollWidth,
      scrollHeight,
      scrollTop,
      scrollLeft,
    } = doc.documentElement

    const targetHeight = targetRect.height

    const visibleRegion = {
      left: 0,
      top: 0,
      right: clientWidth,
      bottom: clientHeight,
    }
    const scrollRegion = {
      left: -scrollLeft,
      top: -scrollTop,
      right: scrollWidth - scrollLeft,
      bottom: scrollHeight - scrollTop,
    }

    let { htmlRegion } = placementInfo
    const VISIBLE = 'visible' as const
    const VISIBLE_FIRST = 'visibleFirst' as const
    if (htmlRegion !== 'scroll' && htmlRegion !== VISIBLE_FIRST)
      htmlRegion = VISIBLE
    const isVisibleFirst = htmlRegion === VISIBLE_FIRST

    const scrollRegionArea = getVisibleArea(scrollRegion, scrollerList.value)
    const visibleRegionArea = getVisibleArea(visibleRegion, scrollerList.value)
    const visibleArea =
      htmlRegion === VISIBLE ? visibleRegionArea : scrollRegionArea
    const adjustCheckVisibleArea = isVisibleFirst
      ? visibleRegionArea
      : visibleArea

    // Measure right/bottom positions
    popupElement.style.left = 'auto'
    popupElement.style.top = 'auto'
    popupElement.style.right = '0'
    popupElement.style.bottom = '0'
    const rawPopupMirrorRect = popupElement.getBoundingClientRect()

    popupElement.style.left = originLeft
    popupElement.style.top = originTop
    popupElement.style.right = originRight
    popupElement.style.bottom = originBottom
    popupElement.style.overflow = originOverflow
    popupElement.style.overflowX = originOverflowX
    popupElement.style.overflowY = originOverflowY
    popupElement.parentElement?.removeChild(placeholderElement)

    const { height, width } = popupComputedStyle
    const selfTransform = getSelfTransform(popupComputedStyle.transform)
    let popupRect: Rect = {
      x: rawPopupRect.x ?? (rawPopupRect as DOMRect).left,
      y: rawPopupRect.y ?? (rawPopupRect as DOMRect).top,
      width: rawPopupRect.width,
      height: rawPopupRect.height,
    }
    let popupMirrorRect = {
      right: rawPopupMirrorRect.right,
      bottom: rawPopupMirrorRect.bottom,
    }
    if (selfTransform) {
      popupRect = unscaleSelfRect(
        popupRect,
        selfTransform,
        popupComputedStyle.transformOrigin,
      )
      const mirror = unscaleSelfRect(
        {
          x: rawPopupMirrorRect.x ?? (rawPopupMirrorRect as DOMRect).left,
          y: rawPopupMirrorRect.y ?? (rawPopupMirrorRect as DOMRect).top,
          width: rawPopupMirrorRect.width,
          height: rawPopupMirrorRect.height,
        },
        selfTransform,
        popupComputedStyle.transformOrigin,
      )
      popupMirrorRect = {
        right: mirror.x + mirror.width,
        bottom: mirror.y + mirror.height,
      }
    }

    const popupHeight = popupRect.height
    const popupWidth2 = popupRect.width

    const scaleX =
      cache && cacheScale
        ? cacheScale?.scaleX
        : toNum(Math.round((popupWidth2 / parseFloat(width)) * 1000) / 1000)
    const scaleY =
      cache && cacheScale
        ? cacheScale?.scaleY
        : toNum(Math.round((popupHeight / parseFloat(height)) * 1000) / 1000)
    if (!cache) cacheScale = { scaleX, scaleY }

    if (
      scaleX === 0 ||
      scaleY === 0 ||
      (isDOM(target) && !isVisible(target as any))
    ) {
      return
    }

    const { offset, targetOffset } = placementInfo
    let [popupOffsetX, popupOffsetY] = getNumberOffset(popupRect, offset)
    const [targetOffsetX, targetOffsetY] = getNumberOffset(
      targetRect,
      targetOffset,
    )
    targetRect.x -= targetOffsetX
    targetRect.y -= targetOffsetY

    const [popupPoint, targetPoint] = placementInfo.points || []
    const targetPoints = splitPoints(targetPoint)
    const popupPoints = splitPoints(popupPoint)
    const targetAlignPoint = getAlignPoint(targetRect, targetPoints)
    const popupAlignPoint = getAlignPoint(popupRect, popupPoints)
    const nextAlignInfo = { ...placementInfo }

    let nextPoints = [popupPoints, targetPoints]
    let nextOffsetX = targetAlignPoint.x - popupAlignPoint.x + popupOffsetX
    let nextOffsetY = targetAlignPoint.y - popupAlignPoint.y + popupOffsetY

    function getIntersectionVisibleArea(
      offsetX: number,
      offsetY: number,
      area = visibleArea,
    ) {
      const l = popupRect.x + offsetX,
        t = popupRect.y + offsetY
      const r = l + popupWidth2,
        b = t + popupHeight
      const visibleL = Math.max(l, area.left),
        visibleT = Math.max(t, area.top)
      const visibleR = Math.min(r, area.right),
        visibleB = Math.min(b, area.bottom)
      return Math.max(0, (visibleR - visibleL) * (visibleB - visibleT))
    }

    const originIntersectionVisibleArea = getIntersectionVisibleArea(
      nextOffsetX,
      nextOffsetY,
    )
    const originIntersectionRecommendArea = getIntersectionVisibleArea(
      nextOffsetX,
      nextOffsetY,
      visibleRegionArea,
    )

    const targetAlignPointTL = getAlignPoint(targetRect, ['t', 'l'])
    const popupAlignPointTL = getAlignPoint(popupRect, ['t', 'l'])
    const targetAlignPointBR = getAlignPoint(targetRect, ['b', 'r'])
    const popupAlignPointBR = getAlignPoint(popupRect, ['b', 'r'])

    const overflow = placementInfo.overflow || {}
    const { adjustX, adjustY, shiftX, shiftY } = overflow
    const supportAdjust = (val: boolean | number) =>
      typeof val === 'boolean' ? val : val >= 0

    let nextPopupY: number,
      nextPopupBottom: number,
      nextPopupX: number,
      nextPopupRight: number
    function syncNextPopupPosition() {
      nextPopupY = popupRect.y + nextOffsetY
      nextPopupBottom = nextPopupY + popupHeight
      nextPopupX = popupRect.x + nextOffsetX
      nextPopupRight = nextPopupX + popupWidth2
    }
    syncNextPopupPosition()

    // Top & Bottom
    const needAdjustY = supportAdjust(adjustY!)
    const sameTB = popupPoints[0] === targetPoints[0]

    const overflowBottom = nextPopupBottom! > adjustCheckVisibleArea.bottom
    if (
      needAdjustY &&
      popupPoints[0] === 't' &&
      (overflowBottom || prevFlipRef.value.bt)
    ) {
      let tmpNextOffsetY = nextOffsetY
      if (sameTB) tmpNextOffsetY -= popupHeight - targetHeight
      else
        tmpNextOffsetY =
          targetAlignPointTL.y - popupAlignPointBR.y - popupOffsetY

      const newVisibleArea = getIntersectionVisibleArea(
        nextOffsetX,
        tmpNextOffsetY,
      )
      const newVisibleRecommendArea = getIntersectionVisibleArea(
        nextOffsetX,
        tmpNextOffsetY,
        visibleRegionArea,
      )

      if (
        shouldSwitchPlacement(
          overflowBottom,
          isVisibleFirst,
          newVisibleArea,
          originIntersectionVisibleArea,
          newVisibleRecommendArea,
          originIntersectionRecommendArea,
        )
      ) {
        prevFlipRef.value.bt = true
        nextOffsetY = tmpNextOffsetY
        popupOffsetY = -popupOffsetY
        nextPoints = [
          reversePoints(nextPoints[0], 0),
          reversePoints(nextPoints[1], 0),
        ]
      } else prevFlipRef.value.bt = false
    }

    const overflowTop = nextPopupY! < adjustCheckVisibleArea.top
    if (
      needAdjustY &&
      popupPoints[0] === 'b' &&
      (overflowTop || prevFlipRef.value.tb)
    ) {
      let tmpNextOffsetY = nextOffsetY
      if (sameTB) tmpNextOffsetY += popupHeight - targetHeight
      else
        tmpNextOffsetY =
          targetAlignPointBR.y - popupAlignPointTL.y - popupOffsetY

      const newVisibleArea = getIntersectionVisibleArea(
        nextOffsetX,
        tmpNextOffsetY,
      )
      const newVisibleRecommendArea = getIntersectionVisibleArea(
        nextOffsetX,
        tmpNextOffsetY,
        visibleRegionArea,
      )

      if (
        shouldSwitchPlacement(
          overflowTop,
          isVisibleFirst,
          newVisibleArea,
          originIntersectionVisibleArea,
          newVisibleRecommendArea,
          originIntersectionRecommendArea,
        )
      ) {
        prevFlipRef.value.tb = true
        nextOffsetY = tmpNextOffsetY
        popupOffsetY = -popupOffsetY
        nextPoints = [
          reversePoints(nextPoints[0], 0),
          reversePoints(nextPoints[1], 0),
        ]
      } else prevFlipRef.value.tb = false
    }

    // Left & Right
    const needAdjustX = supportAdjust(adjustX!)
    const sameLR = popupPoints[1] === targetPoints[1]

    const overflowRight = nextPopupRight! > adjustCheckVisibleArea.right
    if (
      needAdjustX &&
      popupPoints[1] === 'l' &&
      (overflowRight || prevFlipRef.value.rl)
    ) {
      let tmpNextOffsetX = nextOffsetX
      if (sameLR) tmpNextOffsetX -= popupWidth2 - targetRect.width
      else
        tmpNextOffsetX =
          targetAlignPointTL.x - popupAlignPointBR.x - popupOffsetX

      const newVisibleArea = getIntersectionVisibleArea(
        tmpNextOffsetX,
        nextOffsetY,
      )
      const newVisibleRecommendArea = getIntersectionVisibleArea(
        tmpNextOffsetX,
        nextOffsetY,
        visibleRegionArea,
      )

      if (
        shouldSwitchPlacement(
          overflowRight,
          isVisibleFirst,
          newVisibleArea,
          originIntersectionVisibleArea,
          newVisibleRecommendArea,
          originIntersectionRecommendArea,
        )
      ) {
        prevFlipRef.value.rl = true
        nextOffsetX = tmpNextOffsetX
        popupOffsetX = -popupOffsetX
        nextPoints = [
          reversePoints(nextPoints[0], 1),
          reversePoints(nextPoints[1], 1),
        ]
      } else prevFlipRef.value.rl = false
    }

    const overflowLeft = nextPopupX! < adjustCheckVisibleArea.left
    if (
      needAdjustX &&
      popupPoints[1] === 'r' &&
      (overflowLeft || prevFlipRef.value.lr)
    ) {
      let tmpNextOffsetX = nextOffsetX
      if (sameLR) tmpNextOffsetX += popupWidth2 - targetRect.width
      else
        tmpNextOffsetX =
          targetAlignPointBR.x - popupAlignPointTL.x - popupOffsetX

      const newVisibleArea = getIntersectionVisibleArea(
        tmpNextOffsetX,
        nextOffsetY,
      )
      const newVisibleRecommendArea = getIntersectionVisibleArea(
        tmpNextOffsetX,
        nextOffsetY,
        visibleRegionArea,
      )

      if (
        shouldSwitchPlacement(
          overflowLeft,
          isVisibleFirst,
          newVisibleArea,
          originIntersectionVisibleArea,
          newVisibleRecommendArea,
          originIntersectionRecommendArea,
        )
      ) {
        prevFlipRef.value.lr = true
        nextOffsetX = tmpNextOffsetX
        popupOffsetX = -popupOffsetX
        nextPoints = [
          reversePoints(nextPoints[0], 1),
          reversePoints(nextPoints[1], 1),
        ]
      } else prevFlipRef.value.lr = false
    }

    nextAlignInfo.points = [
      flatPoints(nextPoints[0]),
      flatPoints(nextPoints[1]),
    ]
    syncNextPopupPosition()

    // Shift
    const numShiftX = shiftX === true ? 0 : shiftX
    if (typeof numShiftX === 'number') {
      if (nextPopupX! < visibleRegionArea.left) {
        nextOffsetX -= nextPopupX! - visibleRegionArea.left - popupOffsetX
        if (
          targetRect.x + targetRect.width <
          visibleRegionArea.left + numShiftX
        ) {
          nextOffsetX +=
            targetRect.x - visibleRegionArea.left + targetRect.width - numShiftX
        }
      }
      if (nextPopupRight! > visibleRegionArea.right) {
        nextOffsetX -= nextPopupRight! - visibleRegionArea.right - popupOffsetX
        if (targetRect.x > visibleRegionArea.right - numShiftX) {
          nextOffsetX += targetRect.x - visibleRegionArea.right + numShiftX
        }
      }
    }

    const numShiftY = shiftY === true ? 0 : shiftY
    if (typeof numShiftY === 'number') {
      if (nextPopupY! < visibleRegionArea.top) {
        nextOffsetY -= nextPopupY! - visibleRegionArea.top - popupOffsetY
        if (
          targetRect.y + targetRect.height <
          visibleRegionArea.top + numShiftY
        ) {
          nextOffsetY +=
            targetRect.y - visibleRegionArea.top + targetRect.height - numShiftY
        }
      }
      if (nextPopupBottom! > visibleRegionArea.bottom) {
        nextOffsetY -=
          nextPopupBottom! - visibleRegionArea.bottom - popupOffsetY
        if (targetRect.y > visibleRegionArea.bottom - numShiftY) {
          nextOffsetY += targetRect.y - visibleRegionArea.bottom + numShiftY
        }
      }
    }

    // Arrow
    const popupLeft = popupRect.x + nextOffsetX
    const popupRight = popupLeft + popupWidth2
    const popupTop = popupRect.y + nextOffsetY
    const popupBottom = popupTop + popupHeight

    const maxLeft = Math.max(popupLeft, targetRect.x)
    const minRight = Math.min(popupRight, targetRect.x + targetRect.width)
    const nextArrowX = (maxLeft + minRight) / 2 - popupLeft

    const maxTop = Math.max(popupTop, targetRect.y)
    const minBottom = Math.min(popupBottom, targetRect.y + targetRect.height)
    const nextArrowY = (maxTop + minBottom) / 2 - popupTop

    onPopupAlign?.(popupEle.value, nextAlignInfo)

    let offsetX4Right =
      popupMirrorRect.right - popupRect.x - (nextOffsetX + popupRect.width)
    let offsetY4Bottom =
      popupMirrorRect.bottom - popupRect.y - (nextOffsetY + popupRect.height)

    if (scaleX === 1) {
      nextOffsetX = Math.floor(nextOffsetX)
      offsetX4Right = Math.floor(offsetX4Right)
    }
    if (scaleY === 1) {
      nextOffsetY = Math.floor(nextOffsetY)
      offsetY4Bottom = Math.floor(offsetY4Bottom)
    }

    const nextOffsetInfo = {
      ready: true,
      offsetX: nextOffsetX / scaleX,
      offsetY: nextOffsetY / scaleY,
      offsetR: offsetX4Right / scaleX,
      offsetB: offsetY4Bottom / scaleY,
      arrowX: nextArrowX / scaleX,
      arrowY: nextArrowY / scaleY,
      scaleX,
      scaleY,
      align: nextAlignInfo,
    }
    // Defer to microtask to break the sync reactive chain:
    // Object.assign(offsetInfo) → reactive update → re-render →
    // getBoundingClientRect() changes → useResizeObserver → triggerAlign → _onAlign
    Promise.resolve().then(() => {
      Object.assign(offsetInfo, nextOffsetInfo)
    })
  }

  const triggerAlign = (cache?: boolean) => {
    alignCountRef.value += 1
    const id = alignCountRef.value
    Promise.resolve().then(() => {
      if (alignCountRef.value === id) {
        _onAlign(cache)
      }
    })
  }

  watch(popupEle, async ele => {
    if (ele && open.value && !mobile?.value) {
      await nextTick()
      triggerAlign()
    }
  })

  // In Vapor mode, target may be set asynchronously (via watch rather than
  // template ref). Re-trigger alignment when target becomes available.
  watch(target, newVal => {
    if (newVal && open.value && !mobile?.value) {
      triggerAlign(false)
    }
  })

  const resetReady = () => {
    offsetInfo.ready = false
  }
  watch(placement, () => resetReady())

  watch(
    open,
    () => {
      if (!open.value) {
        resetFlipCache()
        resetReady()
      }
    },
    { immediate: true },
  )

  const {
    ready,
    offsetX,
    offsetR,
    offsetY,
    offsetB,
    align,
    arrowY,
    arrowX,
    scaleY,
    scaleX,
  } = toRefs(offsetInfo)
  return [
    ready,
    offsetX,
    offsetY,
    offsetR,
    offsetB,
    arrowX,
    arrowY,
    scaleX,
    scaleY,
    align,
    triggerAlign,
  ] as const
}
