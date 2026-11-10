import Image from './Image.vue'
import PreviewGroup from './PreviewGroup.vue'

export type {
  Actions,
  CoverConfig,
  GroupPreviewConfig,
  ImageElementProps,
  ImageProps,
  ImgInfo,
  InternalPreviewConfig,
  OperationIcons,
  PreviewConfig,
  PreviewGroupProps,
  PreviewImageElementProps,
  PreviewProps,
  PreviewSemanticName,
  SemanticName,
  ToolbarRenderInfoType,
} from './interface'
export type { TransformType, TransformAction } from './hooks/useImageTransform'

export { PreviewGroup }

type ImageType = typeof Image & {
  PreviewGroup: typeof PreviewGroup
}

const ExportImage = Image as ImageType
ExportImage.PreviewGroup = PreviewGroup

export default ExportImage
