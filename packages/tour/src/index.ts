import Tour from './Tour.vue'
import DefaultPanel from './TourStep/DefaultPanel.vue'

export type {
  TourProps,
  TourStepInfo,
  TourStepProps,
  SemanticName,
  ClosableConfig,
  DefaultPanelSlotData,
} from './interface'

export type { PosInfo, Gap } from './hooks/useTarget'

export type { PlacementType } from './placements'
export { getPlacements, placements } from './placements'

export { DefaultPanel }
export default Tour
