import type { VueNode } from '@v-c/util/dist/type'
import type { PortalProps } from '@vapor-component/portal'
import type { CSSProperties } from 'vue'

import type { TransformType } from './hooks/useImageTransform'

// ============================ ImageElementProps ============================

/**
 * Used for PreviewGroup passed image data
 */
export type ImageElementProps = Pick<
  HTMLImageElement,
  | 'src'
  | 'crossOrigin'
  | 'decoding'
  | 'draggable'
  | 'loading'
  | 'referrerPolicy'
  | 'sizes'
  | 'srcset'
  | 'useMap'
  | 'alt'
  | 'fetchPriority'
>

export interface PreviewImageElementProps {
  data: ImageElementProps
  canPreview: boolean
}

export type InternalItem = PreviewImageElementProps & {
  id?: string
}

export type RegisterImage = (
  id: string,
  data: PreviewImageElementProps,
) => VoidFunction

export type OnGroupPreview = (
  id: string,
  imageSrc: string,
  mouseX: number,
  mouseY: number,
) => void

// ============================ Image ============================

export interface ImgInfo {
  url: string
  alt: string
  width: string | number
  height: string | number
}

export interface CoverConfig {
  coverNode?: VueNode
  placement?: 'top' | 'bottom' | 'center'
}

export interface PreviewConfig extends Omit<
  InternalPreviewConfig,
  'countRender'
> {
  cover?: VueNode | CoverConfig | false

  imageRender?: (
    originalNode: VueNode,
    info: { transform: TransformType; image: ImgInfo },
  ) => VueNode

  actionsRender?: (
    originalNode: VueNode,
    info: Omit<ToolbarRenderInfoType, 'current' | 'total'>,
  ) => VueNode

  onOpenChange?: (open: boolean) => void
}

export type SemanticName = 'root' | 'image' | 'cover'

export interface ImageProps {
  prefixCls?: string
  previewPrefixCls?: string

  rootClassName?: string
  classNames?: Partial<
    Record<SemanticName, string> & {
      popup?: Partial<Record<PreviewSemanticName, string>>
    }
  >
  styles?: Partial<
    Record<SemanticName, CSSProperties> & {
      popup?: Partial<Record<PreviewSemanticName, CSSProperties>>
    }
  >

  src?: string
  placeholder?: boolean | string
  fallback?: string

  preview?: boolean | PreviewConfig

  width?: string | number
  height?: string | number
  fetchPriority?: HTMLImageElement['fetchPriority']
}

// ============================ PreviewGroup ============================

export interface GroupPreviewConfig extends Omit<
  InternalPreviewConfig,
  'imageRender'
> {
  current?: number
  imageRender?: (
    originalNode: VueNode,
    info: { transform: TransformType; current: number; image: ImgInfo },
  ) => VueNode
  onOpenChange?: (value: boolean, info: { current: number }) => void
  onChange?: (current: number, prevCurrent: number) => void
}

export interface PreviewGroupProps {
  previewPrefixCls?: string
  classNames?: {
    popup?: Partial<Record<PreviewSemanticName, string>>
  }

  styles?: {
    popup?: Partial<Record<PreviewSemanticName, CSSProperties>>
  }

  icons?: PreviewProps['icons']
  items?: (string | ImageElementProps)[]
  fallback?: string
  preview?: boolean | GroupPreviewConfig
  children?: VueNode
}

// ============================ Preview ============================

export type PreviewSemanticName =
  | 'root'
  | 'mask'
  | 'body'
  | 'close'
  | FooterSemanticName

export interface OperationIcons {
  rotateLeft?: VueNode
  rotateRight?: VueNode
  zoomIn?: VueNode
  zoomOut?: VueNode
  close?: VueNode
  prev?: VueNode
  next?: VueNode
  /** @deprecated Please use `prev` instead */
  left?: VueNode
  /** @deprecated Please use `next` instead */
  right?: VueNode
  flipX?: VueNode
  flipY?: VueNode
}

export interface Actions {
  onActive: (offset: number) => void
  onFlipY: () => void
  onFlipX: () => void
  onRotateLeft: () => void
  onRotateRight: () => void
  onZoomOut: () => void
  onZoomIn: () => void
  onClose: () => void
  onReset: () => void
}

export interface ToolbarRenderInfoType {
  icons: {
    prevIcon?: VueNode
    nextIcon?: VueNode
    flipYIcon: VueNode
    flipXIcon: VueNode
    rotateLeftIcon: VueNode
    rotateRightIcon: VueNode
    zoomOutIcon: VueNode
    zoomInIcon: VueNode
  }
  actions: Actions
  transform: TransformType
  current: number
  total: number
  image: ImgInfo
}

export interface InternalPreviewConfig {
  /** Better to use `classNames.root` instead */
  rootClassName?: string

  src?: string
  alt?: string

  scaleStep?: number
  minScale?: number
  maxScale?: number

  motionName?: string
  open?: boolean
  getContainer?: PortalProps['getContainer']
  zIndex?: number
  maskClosable?: boolean
  afterOpenChange?: (open: boolean) => void

  focusTrap?: boolean

  movable?: boolean
  icons?: OperationIcons
  closeIcon?: VueNode | boolean | null

  countRender?: (current: number, total: number) => VueNode
  imageRender?: (
    originalNode: VueNode,
    info: { transform: TransformType; current?: number; image: ImgInfo },
  ) => VueNode
  actionsRender?: (
    originalNode: VueNode,
    info: ToolbarRenderInfoType,
  ) => VueNode
}

export interface PreviewProps extends InternalPreviewConfig {
  prefixCls: string

  classNames?: Partial<Record<PreviewSemanticName, string>>
  styles?: Partial<Record<PreviewSemanticName, CSSProperties>>

  imageInfo?: {
    width: number | string
    height: number | string
  }
  fallback?: string

  imgCommonProps?: Record<string, any>
  width?: string | number
  height?: string | number

  current?: number
  count?: number

  mousePosition: null | { x: number; y: number }
}

// ============================ Preview Footer ============================

export type FooterSemanticName = 'footer' | 'actions'

export interface FooterProps {
  prefixCls: string
  showProgress: boolean
  current: number
  count: number
  showSwitch: boolean
  icons: PreviewProps['icons']
  scale: number
  minScale: number
  maxScale: number
  image: ImgInfo
  transform: TransformType

  classNames: Record<string, string | undefined>
  styles: Record<string, CSSProperties | undefined>
}

// ============================ Preview PrevNext ============================

export interface PrevNextProps {
  prefixCls: string
  current: number
  count: number
  icons: OperationIcons
}
