import type { SliderProps, SliderRef } from './interface'

import { defineComponent, provide } from 'vue'

import Slider from './Slider.vue'
import {
  UnstableContextKey,
  defaultUnstableContextValue,
} from './SliderContextKey'

export const UnstableProvider = defineComponent({
  name: 'SliderUnstableProvider',
  setup(props, { slots }) {
    provide(UnstableContextKey, props.value || defaultUnstableContextValue)
    return () => slots.default?.()
  },
  props: {
    value: Object,
  },
})

export type {
  SliderProps,
  SliderRef,
  SemanticName,
  SliderClassNames,
  SliderStyles,
  Direction,
  RenderProps,
  RangeConfig,
  MarkObj,
  InternalMarkObj,
  ValueType,
  OnStartMove,
  AriaValueFormat,
} from './interface'

export { UnstableContextKey }

export default Slider
