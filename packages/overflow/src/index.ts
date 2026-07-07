import { RESPONSIVE, INVALIDATE } from './interface'
import Overflow from './Overflow.vue'
import {
  OverflowContextKey,
  useInjectOverflowContext,
} from './OverflowContextKey'
import OverflowContextProvider from './OverflowContextProvider.vue'
import RawItem from './RawItem.vue'

export type {
  OverflowProps,
  OverflowContextType,
  SemanticName,
  Key,
  VueNode,
} from './interface'
export { OverflowContextProvider, OverflowContextKey, useInjectOverflowContext }

type OverflowComponent = typeof Overflow & {
  Item: typeof RawItem
  RESPONSIVE: typeof RESPONSIVE
  INVALIDATE: typeof INVALIDATE
}

const OverflowExport = Overflow as OverflowComponent

OverflowExport.Item = RawItem
OverflowExport.RESPONSIVE = RESPONSIVE
OverflowExport.INVALIDATE = INVALIDATE

export default OverflowExport
