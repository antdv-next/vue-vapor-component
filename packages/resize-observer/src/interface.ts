export interface ResizeInfo {
  size: SizeInfo
  element: HTMLElement
  data: any
}

export interface CollectionProps {}

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
}
