import Image from './Image.vue'
import PreviewGroup from './PreviewGroup.vue'

export type {
  ImageProps,
  ImgInfo,
  CoverConfig,
  PreviewConfig,
  SemanticName,
} from './imageTypes'
export type { PreviewGroupProps, GroupPreviewConfig } from './previewGroupTypes'
export type {
  PreviewSemanticName,
  OperationIcons,
  Actions,
  ToolbarRenderInfoType,
  InternalPreviewConfig,
  PreviewProps,
} from './Preview/types'
export type { ImageElementProps, PreviewImageElementProps } from './interface'
export type { TransformType, TransformAction } from './hooks/useImageTransform'

export { PreviewGroup }

type ImageType = typeof Image & {
  PreviewGroup: typeof PreviewGroup
}

const ExportImage = Image as ImageType
ExportImage.PreviewGroup = PreviewGroup

export default ExportImage
