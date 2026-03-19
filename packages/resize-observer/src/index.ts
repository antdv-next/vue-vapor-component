import Collection from './Collection.vue'
import ResizeObserver from './ResizeObserver.vue'
import { _rs } from './utils/observerUtil'

export { default as useResizeObserver } from './useResizeObserver'

export {
  /** @private Test only for mock trigger resize event */
  _rs,
}

export type {
  ResizeInfo,
  CollectionProps,
  SizeInfo,
  OnResize,
  ResizeObserverProps,
} from './interface'

ResizeObserver.Collection = Collection

export default ResizeObserver as typeof ResizeObserver & {
  Collection: typeof Collection
}
