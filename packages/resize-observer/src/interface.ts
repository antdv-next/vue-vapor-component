export interface ResizeInfo {
  size: SizeInfo
  element: HTMLElement
  data: any
}

export interface CollectionProps {
  /** Trigger when some children ResizeObserver changed. Collect by frame render level */
  onBatchResize?: (resizeInfo: ResizeInfo[]) => void
}

export interface SizeInfo {
  width: number
  height: number
  offsetWidth: number
  offsetHeight: number
}

export type OnResize = (size: SizeInfo, element: HTMLElement) => void

export interface ResizeObserverProps {
  /** Pass to ResizeObserver.Collection with additional data */
  data?: any
  disabled?: boolean
  /** Trigger if element resized. Will always trigger when first time render. */
  onResize?: OnResize
}
