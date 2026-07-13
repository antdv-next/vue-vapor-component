import type { CSSProperties } from 'vue'
import type { StrokeLinecapType } from '../interface'

interface IndeterminateLineOptions {
  id: string
  loading: boolean
  percent: number
  strokeLinecap: StrokeLinecapType
  strokeWidth: number
}

export function getIndeterminateLineStyle({
  id,
  loading,
  percent,
  strokeLinecap,
  strokeWidth,
}: IndeterminateLineOptions): {
  indeterminateStyleProps: CSSProperties
  animationKeyframes: string | null
} {
  if (!loading) {
    return {
      indeterminateStyleProps: {},
      animationKeyframes: null,
    }
  }
  const animationName = `${id}-indeterminate-animate`
  const strokeDashOffset = 100 - (percent + (strokeLinecap === 'round' ? strokeWidth : 0))

  return {
    indeterminateStyleProps: {
      strokeDasharray: `${percent} 100`,
      animation: `${animationName} .6s linear alternate infinite`,
      strokeDashoffset: 0,
    },
    animationKeyframes: `@keyframes ${animationName} {
      0% { stroke-dashoffset: 0; }
      100% { stroke-dashoffset: -${strokeDashOffset}; }
    }`,
  }
}

interface IndeterminateCircleOptions {
  id: string
  loading: boolean
}

export function getIndeterminateCircleStyle({
  id,
  loading,
}: IndeterminateCircleOptions): {
  indeterminateStyleProps: CSSProperties
  animationKeyframes: string | null
} {
  if (!loading) {
    return {
      indeterminateStyleProps: {},
      animationKeyframes: null,
    }
  }
  const animationName = `${id}-indeterminate-animate`

  return {
    indeterminateStyleProps: {
      transform: 'rotate(0deg)',
      animation: `${animationName} 1s linear infinite`,
    },
    animationKeyframes: `@keyframes ${animationName} {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }`,
  }
}
