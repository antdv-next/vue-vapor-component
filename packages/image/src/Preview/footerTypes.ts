import type { CSSProperties } from 'vue'

import type { TransformType } from '../hooks/useImageTransform'
import type { ImgInfo } from '../imageTypes'
import type { Actions, PreviewProps } from './types'

export type FooterSemanticName = 'footer' | 'actions'

export interface FooterProps extends Actions {
  prefixCls: string
  showProgress: boolean
  showClose: boolean
  countRender?: PreviewProps['countRender']
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
