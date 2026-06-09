import type { VueNode } from '@v-c/util/dist/type'
import type { CSSProperties } from 'vue'

import type { TransformType } from './hooks/useImageTransform'
import type { ImgInfo } from './imageTypes'
import type { ImageElementProps } from './interface'
import type {
  InternalPreviewConfig,
  PreviewProps,
  PreviewSemanticName,
} from './Preview/types'

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
