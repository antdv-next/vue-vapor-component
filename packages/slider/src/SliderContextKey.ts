import type { InjectionKey, Ref } from 'vue'

import type { IsHandleDisabled } from './hooks/useDisabled'
import type {
  AriaValueFormat,
  Direction,
  SliderClassNames,
  SliderStyles,
} from './interface'

import { inject, provide } from 'vue'

export interface SliderContextProps {
  min: number
  max: number
  includedStart: number
  includedEnd: number
  direction: Direction
  disabled?: boolean
  keyboard?: boolean
  included?: boolean
  step: number | null
  range?: boolean
  tabIndex: number | number[]
  ariaLabelForHandle?: string | string[]
  ariaLabelledByForHandle?: string | string[]
  ariaRequired?: boolean
  ariaValueTextFormatterForHandle?: AriaValueFormat | AriaValueFormat[]
  classNames: SliderClassNames
  styles: SliderStyles
  isHandleDisabled: IsHandleDisabled
}

const SliderContextKey: InjectionKey<Ref<SliderContextProps>> =
  Symbol('SliderContext')

export const defaultSliderContextValue: SliderContextProps = {
  min: 0,
  max: 0,
  direction: 'ltr',
  step: 1,
  includedStart: 0,
  includedEnd: 0,
  tabIndex: 0,
  keyboard: true,
  styles: {},
  classNames: {},
  isHandleDisabled: () => false,
}

export function useProviderSliderContext(ctx: Ref<SliderContextProps>) {
  provide(SliderContextKey, ctx)
}

export function useInjectSlider(): Ref<SliderContextProps> {
  return inject(SliderContextKey, {
    value: defaultSliderContextValue,
  } as Ref<SliderContextProps>)
}

export interface UnstableContextProps {
  onDragStart?: (info: {
    rawValues: number[]
    draggingIndex: number
    draggingValue: number
  }) => void
  onDragChange?: (info: {
    rawValues: number[]
    deleteIndex: number
    draggingIndex: number
    draggingValue: number
  }) => void
}

export const UnstableContextKey: InjectionKey<UnstableContextProps> =
  Symbol('UnstableContext')
export const defaultUnstableContextValue: UnstableContextProps = {}

export function useUnstableContext() {
  return inject(UnstableContextKey, defaultUnstableContextValue)
}
