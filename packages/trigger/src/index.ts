import Trigger from './Trigger.vue'
import {
  TriggerContextKey,
  TriggerContextProvider,
  UniqueContextKey,
  UniqueContextProvider,
  useTriggerContext,
  useUniqueContext,
} from './TriggerContextKey'
import UniqueProvider from './UniqueProvider/index.vue'

export type {
  ActionType,
  AlignType,
  AnimationType,
  ArrowTypeOuter as ArrowType,
  BuildInPlacements,
} from './interface'

export type {
  MobileConfig,
  PopupProps,
  TriggerProps,
  UniqueProviderProps,
} from './interface'

export type {
  AlignPoint,
  AlignPointLeftRight,
  AlignPointTopBottom,
  ArrowPos,
  MaskProps,
  OffsetType,
  Point,
  Placement,
} from './interface'

export type {
  TriggerContextProps,
  UniqueContextProps,
  UniqueShowOptions,
} from './TriggerContextKey'

export interface TriggerRef {
  nativeElement: HTMLElement
  popupElement: HTMLDivElement
  forceAlign: VoidFunction
}

export {
  TriggerContextKey,
  TriggerContextProvider,
  UniqueContextKey,
  UniqueContextProvider,
  useTriggerContext,
  useUniqueContext,
}

export { UniqueProvider }

export { default as Popup } from './Popup/index.vue'
export { default as Mask } from './Popup/Mask.vue'
export { default as Arrow } from './Popup/Arrow.vue'

export { default as useAlign } from './hooks/useAlign'
export { default as useAction } from './hooks/useAction'

export default Trigger
